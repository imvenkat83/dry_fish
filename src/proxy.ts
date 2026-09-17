import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminPhone } from "./utils/admin-helper";

/**
 * Decodes the payload of a standard JWT token.
 * Safe to run in Edge Runtime since it relies on native 'atob'.
 */
function parseJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Validates the session cookie value in middleware Edge runtime.
 */
function verifySession(token: string | undefined): { phone: string } | null {
  if (!token) return null;

  // Support local developer mock session (10-digit number) strictly in development
  const isRawPhone = /^\d{10}$/.test(token);
  if (isRawPhone && process.env.NODE_ENV === "development") {
    return { phone: token };
  }

  // Parse JWT payload (backend session token or Firebase ID token)
  const payload = parseJwt(token);
  if (!payload) return null;

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return null;
  }

  const phone = payload.phone || payload.phone_number;
  if (!phone || typeof phone !== "string") return null;

  // Strip country code (+91)
  const cleanPhone = phone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
  if (cleanPhone.length !== 10) return null;

  return { phone: cleanPhone };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always bypass API routes from page redirects
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("auth_session")?.value;
  const adminSessionCookie = request.cookies.get("admin_session")?.value;

  const userSession = verifySession(sessionCookie);
  const adminSession = verifySession(adminSessionCookie);

  // 1. If user is logged in, don't let them go to the login page
  if (userSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Protect Admin Routes (The Firewall)
  if (pathname.startsWith("/admin")) {
    // Exclude the login and denied pages from protection to avoid redirect loops
    if (pathname === "/admin/login" || pathname === "/admin/denied") {
      // If already logged in as admin, don't show login page
      if (pathname === "/admin/login" && adminSession?.phone && isAdminPhone(adminSession.phone)) {
        return NextResponse.redirect(new URL("/admin/navigation", request.url));
      }
      return NextResponse.next();
    }

    if (!adminSessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Strict Admin Identity Check
    if (!adminSession || !isAdminPhone(adminSession.phone)) {
      console.warn(`[Security] Unauthorized admin access attempt`);
      return NextResponse.redirect(new URL("/admin/denied", request.url));
    }
  }

  // 3. Protect Cart Route 
  if (pathname.startsWith("/cart") && !userSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/cart/:path*"],
};
