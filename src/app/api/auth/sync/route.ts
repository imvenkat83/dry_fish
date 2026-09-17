import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isAdminPhone } from "@/utils/admin-helper";

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
    let isFirebaseSession = false;

    if (idToken) {
      // 1. Firebase Admin ID Token Verification
      const { adminAuth, firebaseInitError } = await import("@/db/firebase-admin");

      if (adminAuth) {
        try {
          const decodedToken = await adminAuth.verifyIdToken(idToken);
          const firebasePhoneRaw = decodedToken.phone_number;

          if (!firebasePhoneRaw) {
            return NextResponse.json(
              { success: false, error: "Verified Firebase token does not contain a phone number." },
              { status: 400 }
            );
          }

          const tokenPhone = firebasePhoneRaw.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);

          // Verify token phone matches requested phone if provided
          if (rawPhone) {
            const clientPhone = rawPhone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
            if (clientPhone && clientPhone !== tokenPhone) {
              return NextResponse.json(
                { success: false, error: "Phone number mismatch between token and request." },
                { status: 400 }
              );
            }
          }

          phone = tokenPhone;

          // Create Firebase Session Cookie (5 days duration)
          const expiresIn = 1000 * 60 * 60 * 24 * 5;
          try {
            verifiedSessionToken = await adminAuth.createSessionCookie(idToken, { expiresIn });
            isFirebaseSession = true;
          } catch (cookieErr: any) {
            console.warn("Failed to create Firebase session cookie, using ID token as fallback:", cookieErr.message);
            verifiedSessionToken = idToken;
          }
        } catch (err: any) {
          console.error("Firebase ID Token verification failed:", err.message);
          return NextResponse.json(
            { success: false, error: "Invalid or expired Firebase authentication token." },
            { status: 401 }
          );
        }
      } else {
        // Fallback for dev mode without Firebase Admin Service Account
        if (process.env.NODE_ENV === "development" && rawPhone) {
          console.warn("[Auth Sync] Firebase Admin not configured. Falling back to phone session in development mode.");
          phone = rawPhone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
          verifiedSessionToken = phone;
        } else {
          return NextResponse.json(
            { success: false, error: `Firebase Admin service unavailable: ${firebaseInitError}` },
            { status: 500 }
          );
        }
      }
    } else {
      // 2. System OTP Fallback for testing / dev
      if (!rawPhone) {
        return NextResponse.json(
          { success: false, error: "Phone number or ID Token is required." },
          { status: 400 }
        );
      }
      phone = rawPhone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
      verifiedSessionToken = phone;
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

    if (!user) {
      // Register new user with appropriate role based on ADMIN_NUMBERS env variable
      await db.insert(users).values({
        phoneNumber: phone,
        role: isUserAdmin ? "admin" : "user",
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

    const cookieName = isUserAdmin ? "admin_session" : "auth_session";
    const maxAge = isFirebaseSession ? 60 * 60 * 24 * 5 : 60 * 60 * 24 * 30;

    const response = NextResponse.json({
      success: true,
      isNewUser,
      role: isUserAdmin ? "admin" : "user",
      message: isNewUser ? "Welcome! Please complete your profile." : "Authentication successful."
    });

    response.cookies.set(cookieName, verifiedSessionToken || phone, {
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

