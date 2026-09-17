import { jwtVerify, SignJWT, createRemoteJWKSet } from "jose";

// Google's official public JWKS endpoint for verifying Firebase Auth ID Tokens
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

function getSessionSecretKey(): Uint8Array {
  const secret = process.env.FIREBASE_PRIVATE_KEY || process.env.SESSION_SECRET || "dry-fish-basket-secure-session-key-2026";
  return new TextEncoder().encode(secret);
}

/**
 * Verifies a client-side Firebase Auth ID token directly against Google's JWKS public keys.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<{ phone: string; uid?: string } | null> {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dry-fish-bas";
    const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const rawPhone = payload.phone_number as string | undefined;
    if (!rawPhone) return null;

    const phone = rawPhone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
    return { phone, uid: payload.sub };
  } catch (err: any) {
    console.error("[Auth Token] Firebase ID token verification failed:", err.message || err);
    return null;
  }
}

/**
 * Generates a signed 30-day session token for an authenticated user or admin.
 */
export async function createSessionToken(phone: string, role: "admin" | "user"): Promise<string> {
  const secret = getSessionSecretKey();
  return await new SignJWT({ phone, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

/**
 * Verifies an auth_session or admin_session token, returning the user payload if valid.
 */
export async function verifySessionToken(token: string): Promise<{ phone: string; role: string } | null> {
  if (!token) return null;

  // Support local developer mock session (10-digit number) ONLY in development
  if (process.env.NODE_ENV === "development" && /^\d{10}$/.test(token)) {
    return { phone: token, role: "user" };
  }

  try {
    // 1. Verify standard session token issued by our backend
    const secret = getSessionSecretKey();
    const { payload } = await jwtVerify(token, secret);
    if (payload.phone && typeof payload.phone === "string") {
      return {
        phone: payload.phone as string,
        role: (payload.role as string) || "user",
      };
    }
  } catch {
    // 2. Fallback: verify as a raw Firebase ID token directly via JWKS
    try {
      const verifiedFirebase = await verifyFirebaseIdToken(token);
      if (verifiedFirebase) {
        return { phone: verifiedFirebase.phone, role: "user" };
      }
    } catch {}
  }

  return null;
}
