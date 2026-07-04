import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId, getPendingLoginUserId, createSession, destroyPendingLogin } from "@/lib/auth";
import { sameOrigin, rateLimit } from "@/lib/security";
import { logEvent } from "@/lib/events";

// Verifies the emailed one-time code for BOTH cases:
//  • login 2FA  — only a "pending login" cookie exists; on success we mint the real session.
//  • signup     — a real session already exists; we just confirm the email.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const pendingUid = await getPendingLoginUserId();
  const sessionUid = await getSessionUserId();
  const uid = pendingUid || sessionUid;
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);

  const q = pendingUid ? "?login=1" : "";
  // Throttle: a 6-digit code + 10-min expiry + this cap makes brute force infeasible.
  if (!rateLimit("otp:" + uid, 6, 60_000)) {
    return NextResponse.redirect(new URL("/verify-email" + (q ? q + "&" : "?") + "error=Too+many+attempts.+Please+wait.", req.url), 303);
  }

  const form = Object.fromEntries((await req.formData()).entries());
  const code = String(form.code || "").trim();
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);

  if (!user.emailOtp || !user.emailOtpExp || user.emailOtpExp < new Date()) {
    return NextResponse.redirect(new URL("/verify-email" + (q ? q + "&" : "?") + "error=Code+expired.+Please+resend.", req.url), 303);
  }
  if (code !== user.emailOtp) {
    return NextResponse.redirect(new URL("/verify-email" + (q ? q + "&" : "?") + "error=Incorrect+code.+Try+again.", req.url), 303);
  }

  // Correct code: clear it, confirm the email, and (for login) mint the real session.
  await prisma.user.update({ where: { id: uid }, data: { emailVerified: true, emailOtp: null, emailOtpExp: null } });
  // A pending login is an explicit re-authentication — it ALWAYS supersedes any
  // existing session cookie (which may be stale or belong to a different/old user).
  if (pendingUid) {
    await createSession(pendingUid);
    await destroyPendingLogin();
    logEvent("login", { userId: pendingUid });
  }
  // Verified members go straight to the app; others finish KYC first.
  const dest = user.kycStatus === "VERIFIED" ? "/dashboard" : "/verify";
  return NextResponse.redirect(new URL(dest, req.url), 303);
}
