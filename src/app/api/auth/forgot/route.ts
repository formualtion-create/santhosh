import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp, sameOrigin } from "@/lib/security";
import { sendEmail, resetEmail, emailEnabled } from "@/lib/email";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!rateLimit("forgot:" + clientIp(req), 5, 60_000))
    return NextResponse.redirect(new URL("/login/forgot?error=Too+many+requests", req.url), 303);

  const form = Object.fromEntries((await req.formData()).entries());
  const email = String(form.email || "").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // SECURITY: the reset token must reach ONLY the inbox owner. When email is
  // configured we send the link and never return it to the requester (otherwise
  // anyone could request a reset for someone else's email and read the token off
  // their own screen → account takeover). The on-screen link is shown ONLY in
  // demo mode (no email provider configured) so the project stays testable.
  let demoLink = "";
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExp: new Date(Date.now() + 30 * 60 * 1000) },
    });
    const origin = new URL(req.url).origin;
    const link = `${origin}/login/reset?token=${token}`;
    if (emailEnabled()) {
      void sendEmail({ to: email, subject: "Reset your PawsPair password", html: resetEmail(link, user.ownerName?.split(" ")[0]) });
    } else {
      demoLink = `/login/reset?token=${token}`; // dev/demo only
    }
  }

  // Always respond identically regardless of whether the account exists.
  const q = demoLink ? "&demo=" + encodeURIComponent(demoLink) : "";
  return NextResponse.redirect(new URL("/login/forgot?sent=1" + q, req.url), 303);
}
