import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!await isAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status, paymentStatus, phonepePaymentId, cancellationReason } = await req.json();
    const orderId = parseInt(id);

    if (!status && !paymentStatus) {
      return NextResponse.json({ success: false, error: "Status or Payment Status is required" }, { status: 400 });
    }

    // Fetch current order status
    const currentOrder = await db.select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!currentOrder.length) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const currentStatus = currentOrder[0].status?.toLowerCase() || "";
    if (currentStatus === "cancelled") {
      return NextResponse.json({ success: false, error: "Cannot modify a cancelled order" }, { status: 400 });
    }

    const updateData: any = {};

    if (status) {
      const currentStatus = currentOrder[0].status?.toLowerCase() || "";
      if (status.toLowerCase() === "cancelled" && (currentStatus === "shipped" || currentStatus === "delivered")) {
        return NextResponse.json(
          { success: false, error: "Cannot cancel an order that has already been shipped or delivered" },
          { status: 400 }
        );
      }
      updateData.status = status;
      if (status.toLowerCase() === "cancelled" && cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (phonepePaymentId !== undefined) {
      updateData.phonepePaymentId = phonepePaymentId;
    }

    await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId));

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
