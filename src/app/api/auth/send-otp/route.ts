import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { db, client } = await import("@/db");
    const { otpVerifications } = await import("@/db/schema");

    // Ensure otp_verifications table exists
    await client.execute(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        otp TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    const body = await request.json();
    const { phone: rawPhone } = body;

    if (!rawPhone || rawPhone.replace(/\D/g, "").length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const phone = rawPhone.replace(/\D/g, "");

    // Generate 6-digit OTP (Default 123456 for testing or random 6-digit number)
    const generatedOtp = process.env.NODE_ENV === "development" ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Delete previous pending OTPs for this phone number
    await db.delete(otpVerifications).where(eq(otpVerifications.phoneNumber, phone)).catch(() => {});

    // Store new OTP verification record
    await db.insert(otpVerifications).values({
      phoneNumber: phone,
      otp: generatedOtp,
      expiresAt: expiresAt,
    });

    console.log(`[OTP Sent] Phone: +91 ${phone} | OTP Code: ${generatedOtp}`);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${phone}`,
      demoOtp: generatedOtp,
    });
  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { success: false, error: `Failed to send OTP: ${error.message}` },
      { status: 500 }
    );
  }
}
