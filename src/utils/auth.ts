import { cookies } from "next/headers";
import { isAdminPhone } from "@/utils/admin-helper";
import { verifySessionToken } from "@/utils/auth-token";

export interface DecodedAdminToken {
  uid: string;
  phone_number?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Verifies if the request is authenticated as an authorized administrator.
 * Checks the Authorization header (Bearer token) or the admin_session cookie.
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

    // 3. Verify session or ID token using pure jose WebCrypto API
    const verified = await verifySessionToken(token);
    if (!verified || !verified.phone) {
      return null;
    }

    const phone = verified.phone;
    if (!isAdminPhone(phone)) {
      console.warn(`[Security] Unauthorized admin access attempt from phone: ${phone}`);
      return null;
    }

    return {
      uid: `admin-${phone}`,
      phone_number: `+91${phone}`,
    };
  } catch (error) {
    console.error("[Auth Utility] verifyAdminRequest error:", error);
    return null;
  }
}
