import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isAdminPhone } from "@/utils/admin-helper";

export async function POST(request: Request) {
  try {
    const { db, client } = await import("@/db");
    const { users, otpVerifications } = await import("@/db/schema");

    // Ensure email column exists in users table
    await client.execute("ALTER TABLE users ADD COLUMN email TEXT;").catch(() => {});

    const body = await request.json();
    const { phone: rawPhone, otp } = body;

    if (!rawPhone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone number and OTP code are required." },
        { status: 400 }
      );
    }

    const phone = rawPhone.replace(/\D/g, "");
    const cleanOtp = otp.toString().trim();

    // 1. Check if OTP is valid (Default test OTP 123456 or stored OTP)
    let isValidOtp = cleanOtp === "123456";

    if (!isValidOtp) {
      const records = await db
        .select()
        .from(otpVerifications)
        .where(eq(otpVerifications.phoneNumber, phone))
        .limit(1);

      if (records.length > 0) {
        const record = records[0];
        const isNotExpired = new Date(record.expiresAt).getTime() > Date.now();
        if (record.otp === cleanOtp && isNotExpired) {
          isValidOtp = true;
        }
      }
    }

    if (!isValidOtp) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code. Use 123456 for test." },
        { status: 400 }
      );
    }

    // 2. Clear OTP record
    await db.delete(otpVerifications).where(eq(otpVerifications.phoneNumber, phone)).catch(() => {});

    // 3. Find or register user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phone))
      .limit(1);

    const user = userResult[0];
    const isUserAdmin = isAdminPhone(phone);
    let isNewUser = false;

    if (!user) {
      await db.insert(users).values({
        phoneNumber: phone,
        role: isUserAdmin ? "admin" : "user",
        lastLoginAt: new Date().toISOString(),
      });
      isNewUser = true;
    } else {
      await db
        .update(users)
        .set({
          lastLoginAt: new Date().toISOString(),
          ...(isUserAdmin && user.role !== "admin" ? { role: "admin" } : {}),
        })
        .where(eq(users.phoneNumber, phone));

      if (!user.fullName) {
        isNewUser = true;
      }
    }

    // 4. Set session cookie
    const cookieName = isUserAdmin ? "admin_session" : "auth_session";
    const maxAge = 60 * 60 * 24 * 30; // 30 days session

    const response = NextResponse.json({
      success: true,
      isNewUser,
      user: user || { phoneNumber: phone },
      message: isNewUser ? "OTP verified! Please complete your profile." : "Verification successful!",
    });

    response.cookies.set(cookieName, phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { success: false, error: `Verification failed: ${error.message}` },
      { status: 500 }
    );
  }
}
