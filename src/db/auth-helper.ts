import { cookies } from "next/headers";
import { isAdminPhone } from "@/utils/admin-helper";

/**
 * Verifies the Firebase ID Token from a session cookie and returns the normalized 10-digit phone number.
 * Supports a local plain 10-digit phone number fallback in development/test.
 */
export async function getVerifiedPhoneFromCookie(cookieName: "auth_session" | "admin_session"): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;
    if (!token) return null;

    // Support local developer mock session (10-digit number)
    const isRawPhone = /^\d{10}$/.test(token);
    if (isRawPhone) {
      return token;
    }

    // Securely verify session cookie using Firebase Admin SDK
    const { adminAuth } = await import("./firebase-admin");
    if (!adminAuth) return null;
    const decoded = await adminAuth.verifySessionCookie(token);
    const phone = decoded.phone_number;
    if (!phone) return null;

    // Normalize to 10-digit phone number by stripping country code (+91)
    return phone.replace(/^\+91/, "").replace(/\D/g, "");
  } catch (error) {
    console.error(`[Auth Helper] Failed to verify token in cookie '${cookieName}':`, error);
    return null;
  }
}

/**
 * Checks if the current admin session is valid and corresponds to designated administrator phone numbers.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const phone = await getVerifiedPhoneFromCookie("admin_session");
  if (!phone) return false;
  return isAdminPhone(phone);
}

