import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isAdminPhone } from "@/utils/admin-helper";
import { verifyFirebaseIdToken, createSessionToken } from "@/utils/auth-token";

export async function POST(request: Request) {
  try {
    const { db, client } = await import("@/db");
    const { users } = await import("@/db/schema");

    // Ensure email column exists in users table on database
    await client.execute("ALTER TABLE users ADD COLUMN email TEXT;").catch(() => {});

    const body = await request.json();
    const { phone: rawPhone, idToken } = body;

    let phone: string | null = null;
    let verifiedSessionToken: string | null = null;

    if (idToken) {
      // 1. Verify Firebase ID Token via Google's official JWKS public keys using pure jose (Edge/Serverless compatible)
      const verifiedFirebase = await verifyFirebaseIdToken(idToken);

      if (!verifiedFirebase) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired Firebase authentication token." },
          { status: 401 }
        );
      }

      phone = verifiedFirebase.phone;

      // Verify token phone matches requested phone if provided
      if (rawPhone) {
        const clientPhone = rawPhone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
        if (clientPhone && clientPhone !== phone) {
          return NextResponse.json(
            { success: false, error: "Phone number mismatch between token and request." },
            { status: 400 }
          );
        }
      }
    } else {
      // 2. Local development fallback only
      if (process.env.NODE_ENV === "development" && rawPhone) {
        phone = rawPhone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
      } else {
        return NextResponse.json(
          { success: false, error: "Firebase ID Token is required for authentication." },
          { status: 400 }
        );
      }
    }

    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format." },
        { status: 400 }
      );
    }

    let user = null;
    let isNewUser = false;

    const userResult = await db.select()
      .from(users)
      .where(eq(users.phoneNumber, phone))
      .limit(1);

    user = userResult[0];

    const isUserAdmin = isAdminPhone(phone);
    const role: "admin" | "user" = isUserAdmin ? "admin" : "user";

    if (!user) {
      // Register new user with appropriate role based on ADMIN_NUMBERS env variable
      await db.insert(users).values({
        phoneNumber: phone,
        role,
        lastLoginAt: new Date().toISOString(),
      });
      isNewUser = true;
    } else {
      // Update lastLoginAt and sync admin role if phone is present in ADMIN_NUMBERS
      await db.update(users)
        .set({
          lastLoginAt: new Date().toISOString(),
          ...(isUserAdmin && user.role !== "admin" ? { role: "admin" } : {})
        })
        .where(eq(users.phoneNumber, phone));

      if (!user.fullName) {
        isNewUser = true;
      }
    }

    // Generate signed 30-day session token using pure WebCrypto / jose
    verifiedSessionToken = await createSessionToken(phone, role);

    const cookieName = isUserAdmin ? "admin_session" : "auth_session";
    const maxAge = 60 * 60 * 24 * 30; // 30 days

    const response = NextResponse.json({
      success: true,
      isNewUser,
      role,
      message: isNewUser ? "Welcome! Please complete your profile." : "Authentication successful."
    });

    response.cookies.set(cookieName, verifiedSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;

  } catch (error: any) {
    console.error(`Sync API Error:`, error);
    return NextResponse.json({
      success: false,
      error: `Server sync error: ${error.message}`
    }, { status: 500 });
  }
}
