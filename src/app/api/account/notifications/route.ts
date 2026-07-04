import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

// Update which push notifications a member wants to receive.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);

  const form = Object.fromEntries((await req.formData()).entries());
  await prisma.user.update({
    where: { id: uid },
    data: {
      notifyMatches: form.notifyMatches === "on",
      notifyMessages: form.notifyMessages === "on",
      notifyTips: form.notifyTips === "on",
    },
  });
  return NextResponse.redirect(new URL("/account?notif=1", req.url), 303);
}
