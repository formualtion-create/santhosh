import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);
  const form = Object.fromEntries((await req.formData()).entries());
  const targetUserId = String(form.targetUserId || "");
  if (targetUserId && targetUserId !== uid) {
    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: uid, blockedId: targetUserId } },
      create: { blockerId: uid, blockedId: targetUserId },
      update: {},
    });
  }
  return NextResponse.redirect(new URL("/dashboard?blocked=1", req.url), 303);
}
