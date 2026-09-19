import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, cartItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPhonePeClient, getPhonePeConfig } from "@/utils/phonepe";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const rawBody = await req.text();

    if (!rawBody) {
      return NextResponse.json(
        { success: false, error: "Empty request body" },
        { status: 400 }
      );
    }

    const { username, password } = getPhonePeConfig();
    const phonepeClient = getPhonePeClient();

    let callbackResponse;
    try {
      callbackResponse = phonepeClient.validateCallback(
        username,
        password,
        authHeader,
        rawBody
      );
    } catch (validationError: any) {
      console.error("[PhonePe Webhook] Callback validation failed:", validationError);
      return NextResponse.json(
        { success: false, error: "Invalid callback signature or authentication" },
        { status: 401 }
      );
    }

    const payload = callbackResponse?.payload;
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Missing payload in callback response" },
        { status: 400 }
      );
    }

    const merchantOrderId = payload.merchantOrderId || payload.orderId;
    const state = (payload.state || "").toUpperCase();
    const txnId = payload.paymentDetails?.[0]?.transactionId || payload.orderId || null;

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, error: "Merchant order ID missing from payload" },
        { status: 400 }
      );
    }

    // Lookup order in DB by phonepeOrderId (merchantOrderId)
    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.phonepeOrderId, merchantOrderId))
      .limit(1);

    if (!orderRows.length) {
      console.error(`[PhonePe Webhook] Order not found for merchantOrderId: ${merchantOrderId}`);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderRows[0];
    const isSuccess = ["COMPLETED", "PAYMENT_SUCCESS", "SUCCESS"].includes(state);

    if (isSuccess) {
      // Move order status from "payment_pending" to "pending", paymentStatus to "paid"
      await db
        .update(orders)
        .set({
          status: "pending",
          paymentStatus: "paid",
          phonepePaymentId: txnId,
        })
        .where(eq(orders.id, order.id));

      // Clear cart items for the customer
      if (order.userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, order.userId));
      }

      console.log(`[PhonePe Webhook] Order #${order.id} payment confirmed successfully.`);
    } else {
      // Mark order as payment failed
      await db
        .update(orders)
        .set({
          status: "payment_failed",
          paymentStatus: "failed",
          phonepePaymentId: txnId,
        })
        .where(eq(orders.id, order.id));

      console.log(`[PhonePe Webhook] Order #${order.id} payment failed with state: ${state}`);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("[PhonePe Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
