import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { getVerifiedPhoneFromCookie } from "@/db/auth-helper";
import { eq } from "drizzle-orm";
import { validateAndCalculateCoupon } from "@/utils/coupon";
import { getPhonePeClient } from "@/utils/phonepe";
import { StandardCheckoutPayRequest } from "@phonepe-pg/pg-sdk-node";

export async function POST(req: Request) {
  try {
    const phoneNumber = await getVerifiedPhoneFromCookie("auth_session");

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find user by verified phone number
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1);

    if (!userRows.length) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    const user = userRows[0];

    const { items, totalAmount, shippingAddress, couponCode } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart items are required" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Validate Coupon securely if provided
    let discountAmount = 0;
    if (couponCode) {
      const couponValidation = await validateAndCalculateCoupon(
        couponCode,
        items,
        user.id
      );
      if (!couponValidation.valid) {
        return NextResponse.json(
          { success: false, error: couponValidation.error || "Invalid coupon" },
          { status: 400 }
        );
      }
      discountAmount = couponValidation.discountAmount;
    }

    // Recalculate subtotal and verify expected total
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const expectedTotal = Math.max(0, subtotal - discountAmount);

    if (Math.abs(totalAmount - expectedTotal) > 0.01) {
      return NextResponse.json(
        {
          success: false,
          error: `Total amount mismatch. Expected: ₹${expectedTotal}, Received: ₹${totalAmount}`,
        },
        { status: 400 }
      );
    }

    // Append new shipping address to user's saved addresses
    if (shippingAddress) {
      let addresses: string[] = [];
      if (user.address) {
        try {
          addresses = JSON.parse(user.address);
          if (!Array.isArray(addresses)) addresses = [user.address];
        } catch {
          addresses = [user.address];
        }
      }
      if (!addresses.includes(shippingAddress)) {
        addresses.push(shippingAddress);
        await db
          .update(users)
          .set({ address: JSON.stringify(addresses) })
          .where(eq(users.id, user.id));
      }
    }

    // Generate unique merchant order ID for PhonePe
    const merchantOrderId = `PP_ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create Order in DB with status "payment_pending"
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: user.id,
        totalAmount: expectedTotal,
        status: "payment_pending",
        paymentStatus: "pending",
        paymentGateway: "phonepe",
        phonepeOrderId: merchantOrderId,
        shippingAddress: shippingAddress,
        couponCode: couponCode || null,
        discountAmount: discountAmount || 0,
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Insert Order Items
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color || null,
        customizations: item.customizations
          ? JSON.stringify(item.customizations)
          : null,
      });
    }

    // Construct return callback URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.vkdryfishbasket.com";
    const redirectUrl = `${baseUrl}/api/checkout/phonepe/callback?merchantOrderId=${merchantOrderId}`;

    // PhonePe PG accepts amount in Paise (1 INR = 100 Paise)
    const amountInPaise = Math.round(expectedTotal * 100);

    // Build standard checkout pay request
    const payRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(redirectUrl)
      .build();

    const phonepeClient = getPhonePeClient();
    const payResponse = await phonepeClient.pay(payRequest);

    if (!payResponse || !payResponse.redirectUrl) {
      return NextResponse.json(
        { success: false, error: "Failed to obtain payment redirect URL from PhonePe" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: payResponse.redirectUrl,
      merchantOrderId,
      orderId: newOrder.id,
    });
  } catch (error: any) {
    console.error("PhonePe Checkout Initiate Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
