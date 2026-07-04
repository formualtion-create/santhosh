import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const form = Object.fromEntries((await req.formData()).entries());
  const token = String(form.token || "");
  const password = String(form.password || "");
  const back = "/login/reset?token=" + encodeURIComponent(token);

  if (password.length < 8) return NextResponse.redirect(new URL(back + "&error=Password+must+be+8%2B+characters", req.url), 303);

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExp: { gt: new Date() } },
  });
  if (!user) return NextResponse.redirect(new URL("/login/reset?error=Link+is+invalid+or+expired", req.url), 303);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password), resetToken: null, resetTokenExp: null },
  });
  await createSession(user.id);
  return NextResponse.redirect(new URL("/dashboard", req.url), 303);
}
