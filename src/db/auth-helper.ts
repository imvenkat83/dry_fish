import { cookies } from "next/headers";
import { isAdminPhone } from "@/utils/admin-helper";
import { verifySessionToken } from "@/utils/auth-token";

/**
 * Verifies the session cookie and returns the normalized 10-digit phone number.
 */
export async function getVerifiedPhoneFromCookie(cookieName: "auth_session" | "admin_session"): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;
    if (!token) return null;

    const verified = await verifySessionToken(token);
    if (!verified) return null;

    return verified.phone;
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
