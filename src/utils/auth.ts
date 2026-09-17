import { cookies } from "next/headers";
import { isAdminPhone } from "@/utils/admin-helper";

export interface DecodedAdminToken {
  uid: string;
  phone_number?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Verifies if the request is authenticated as an authorized administrator.
 * Checks the Authorization header (Bearer token) or the admin_session cookie.
 * Supports local mock verification if Firebase Admin is not configured.
 */
export async function verifyAdminRequest(request?: Request): Promise<DecodedAdminToken | null> {
  try {
    let token: string | undefined;

    // 1. Try to get token from Authorization header if request is provided
    if (request) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split("Bearer ")[1];
      }
    }

    // 2. Try to get token from cookies (admin_session)
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("admin_session")?.value;
    }

    if (!token) {
      return null;
    }

    // Support local developer mock mode (10-digit number) only in non-production
    const isRawPhone = /^\d{10}$/.test(token);

    if (isRawPhone && process.env.NODE_ENV !== "production") {
      if (isAdminPhone(token)) {
        return {
          uid: "mock-admin-uid",
          phone_number: `+91${token}`,
        };
      }
      return null;
    }

    // Verify ID token or Session Cookie using Firebase Admin SDK
    const { adminAuth } = await import("@/db/firebase-admin");
    if (!adminAuth) {
      return null;
    }

    let decodedToken: any;
    try {
      decodedToken = await adminAuth.verifySessionCookie(token);
    } catch {
      try {
        decodedToken = await adminAuth.verifyIdToken(token);
      } catch (err) {
        console.error("[Auth Utility] Token verification failed:", err);
        return null;
      }
    }

    const phone = decodedToken.phone_number;
    if (!phone) {
      return null;
    }

    // Normalize phone to 10-digit and match designated admin whitelist
    const normalizedPhone = phone.replace(/^\+91/, "").replace(/\D/g, "");
    if (!isAdminPhone(normalizedPhone)) {
      console.warn(`[Security] Unauthorized admin access attempt from phone: ${phone}`);
      return null;
    }

    return decodedToken as DecodedAdminToken;
  } catch (error) {
    console.error("[Auth Utility] verifyAdminRequest error:", error);
    return null;
  }
}
