import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, orders, orderItems, products, cartItems, wishlists } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return NextResponse.json({ success: false, error: "Invalid Customer ID" }, { status: 400 });
    }

    // 1. Fetch customer details
    const customerResult = await db.select().from(users).where(eq(users.id, customerId)).limit(1);
    if (customerResult.length === 0) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }
    const customer = customerResult[0];

    // 2. Fetch customer's orders
    const userOrders = await db.select({
      id: orders.id,
      totalAmount: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt,
      shippingAddress: orders.shippingAddress,
      couponCode: orders.couponCode,
      discountAmount: orders.discountAmount,
      paymentStatus: orders.paymentStatus,
      phonepeOrderId: orders.phonepeOrderId,
      phonepePaymentId: orders.phonepePaymentId,
      paymentGateway: orders.paymentGateway,
      courierServiceName: orders.courierServiceName,
      courierId: orders.courierId,
      trackingNumber: orders.trackingNumber,
      trackingLink: orders.trackingLink,
      estimatedDeliveryDate: orders.estimatedDeliveryDate,
      shippingNotes: orders.shippingNotes,
    })
    .from(orders)
    .where(eq(orders.userId, customerId))
    .orderBy(desc(orders.createdAt));

    // For each order, fetch items
    const ordersWithItems = await Promise.all(userOrders.map(async (order) => {
      const items = await db.select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: products.name,
        productImages: products.images,
        quantity: orderItems.quantity,
        price: orderItems.price,
        size: orderItems.size,
        color: orderItems.color,
        customizations: orderItems.customizations,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        items: items.map(item => ({
          ...item,
          customizations: item.customizations ? JSON.parse(item.customizations) : null
        }))
      };
    }));

    // Clean up legacy cart items that have already been successfully ordered
    const orderedItems = ordersWithItems
      .filter(o => o.status !== "cancelled" && o.status !== "payment_pending")
      .flatMap(o => o.items);

    for (const item of orderedItems) {
      if (item.productId) {
        await db.delete(cartItems).where(
          and(
            eq(cartItems.userId, customerId),
            eq(cartItems.productId, item.productId),
            eq(cartItems.baseSize, item.size)
          )
        );
      }
    }

    // 3. Fetch customer's cart list
    const userCartItems = await db.select({
      id: cartItems.id,
      productId: cartItems.productId,
      productName: products.name,
      productImages: products.images,
      baseSize: cartItems.baseSize,
      customSpecifications: cartItems.customSpecifications,
      quantity: cartItems.quantity,
      price: cartItems.price,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, customerId));

    // 4. Fetch customer's wishlist items
    const userWishlistItems = await db.select({
      id: wishlists.id,
      productId: wishlists.productId,
      productName: products.name,
      productImages: products.images,
      salePrice: products.salePrice,
      basePrice: products.basePrice,
    })
    .from(wishlists)
    .leftJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.userId, customerId));

    return NextResponse.json({
      success: true,
      customer,
      orders: ordersWithItems,
      cart: userCartItems,
      wishlist: userWishlistItems,
    });
  } catch (error: any) {
    console.error("Error fetching admin customer detail:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
