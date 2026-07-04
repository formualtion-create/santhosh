import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createPendingLogin } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit, clientIp, sameOrigin, tooMany } from "@/lib/security";
import { issueAndSendOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!rateLimit("login:" + clientIp(req), 8, 60_000)) return tooMany(req, "/login");
  const form = Object.fromEntries((await req.formData()).entries());
  const parsed = loginSchema.safeParse(form);
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/login?error=Invalid+credentials", req.url), 303);
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.redirect(new URL("/login?error=Invalid+email+or+password", req.url), 303);
  }
  // Banned accounts cannot proceed.
  if (user.bannedAt) {
    return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent("This account has been suspended. Contact support@pawspair.in"), req.url), 303);
  }

  // Two-factor: password is correct, but we do NOT create a session yet.
  // Email a one-time code and set a short-lived "pending login" cookie; the
  // real session is created only after the code is verified at /verify-email.
  const { code, emailed } = await issueAndSendOtp(user);
  await createPendingLogin(user.id);
  const demo = emailed ? "" : "&demo=" + code; // surface code only when email isn't configured (demo)
  return NextResponse.redirect(new URL("/verify-email?login=1" + demo, req.url), 303);
}
