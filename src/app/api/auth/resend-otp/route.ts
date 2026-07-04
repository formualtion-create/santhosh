import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId, getPendingLoginUserId } from "@/lib/auth";
import { sameOrigin, rateLimit } from "@/lib/security";
import { issueAndSendOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const pendingUid = await getPendingLoginUserId();
  const uid = pendingUid || (await getSessionUserId());
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);
  const q = pendingUid ? "login=1&" : "";
  if (!rateLimit("otp-resend:" + uid, 4, 120_000)) return NextResponse.redirect(new URL("/verify-email?" + q + "error=Please+wait+before+resending.", req.url), 303);

  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);

  const { code, emailed } = await issueAndSendOtp(user);
  const demo = emailed ? "" : "&demo=" + code;
  return NextResponse.redirect(new URL("/verify-email?" + q + "sent=1" + demo, req.url), 303);
}
