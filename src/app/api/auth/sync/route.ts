import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { isAdminPhone } from "@/utils/admin-helper";

export async function POST(request: Request) {
  try {
    // Dynamically import database and firebase-admin modules to catch initialization errors
    const { db, client } = await import("@/db");
    const { users } = await import("@/db/schema");

    // Ensure email column exists in users table on Turso cloud database
    await client.execute("ALTER TABLE users ADD COLUMN email TEXT;").catch(() => {});

    const body = await request.json();
    const { phone: rawPhone, idToken } = body;

    let phone = rawPhone;
    let verifiedToken = idToken;

    if (idToken) {
      // 1. Firebase Token Verification
      try {
        const { adminAuth, firebaseInitError } = await import("@/db/firebase-admin");
        if (adminAuth) {
          const decoded = await adminAuth.verifyIdToken(idToken);
          const firebasePhone = decoded.phone_number;
          if (firebasePhone) {
            phone = firebasePhone.replace(/^\+91/, "").replace(/\D/g, "");
          }
          const expiresIn = 1000 * 60 * 60 * 24 * 5;
          verifiedToken = await adminAuth.createSessionCookie(idToken, { expiresIn }).catch(() => phone);
        } else {
          verifiedToken = phone;
        }
      } catch (err: any) {
        console.warn("Firebase ID Token admin verification skipped, continuing session with phone:", err.message);
        verifiedToken = phone;
      }
    } else {
      // 2. Local Mock Fallback for testing/development
      if (!phone) {
        return NextResponse.json(
          { success: false, error: "Invalid parameters" },
          { status: 400 }
        );
      }
      // For local testing, use the plaintext phone directly as the token
      verifiedToken = phone;
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
      // Register new user automatically if not found
      await db.insert(users).values({
        phoneNumber: phone,
        role: isUserAdmin ? "admin" : "user",
        lastLoginAt: new Date().toISOString(),
      });
      isNewUser = true;
    } else {
      // Update lastLoginAt and upgrade role to admin if matching admin whitelist
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
    const response = NextResponse.json({ 
      success: true, 
      isNewUser, 
      message: isNewUser ? "Welcome! Please tell us your name." : "Welcome back!" 
    });

    // Set maxAge matching the 5 days session cookie duration (or 30 days for mock phone token)
    const maxAge = idToken ? 60 * 60 * 24 * 5 : 60 * 60 * 24 * 30;

    response.cookies.set(cookieName, verifiedToken, { 
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
      error: `Server sync error: ${error.message}`,
      stack: error.stack
    }, { status: 500 });
  }
}
