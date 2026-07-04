import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function resolveSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to a strong value (>=32 chars) in production.");
  }
  return "dev-secret-please-change-me-32-characters"; // dev/test only
}
const secret = new TextEncoder().encode(resolveSecret());

// Note: /verify-email is intentionally NOT protected — during a pending login the
// user has no session yet, only a short-lived 2FA cookie. The page self-guards.
const PROTECTED = ["/dashboard", "/account", "/membership", "/verify", "/profile", "/matches", "/chat", "/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get("pawspair_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login?next=" + pathname, req.url));
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login?next=" + pathname, req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/membership/:path*", "/verify/:path*", "/profile/:path*", "/matches/:path*", "/chat/:path*", "/admin/:path*"],
};
