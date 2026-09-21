import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products, users } from "@/db/schema";
import { eq, desc, ne, and } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

export async function GET(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allOrders = await db.select({
      id: orders.id,
      totalAmount: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt,
      shippingAddress: orders.shippingAddress,
      customerName: users.fullName,
      customerPhone: users.phoneNumber,
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
    .leftJoin(users, eq(orders.userId, users.id))
    .where(and(ne(orders.status, "payment_pending"), ne(orders.status, "payment_failed"), ne(orders.paymentStatus, "failed")))
    .orderBy(desc(orders.createdAt));

    // For each order, fetch items
    const ordersWithItems = await Promise.all(allOrders.map(async (order) => {
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

    return NextResponse.json({ success: true, data: ordersWithItems });
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
