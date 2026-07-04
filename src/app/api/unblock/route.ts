import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);
  const form = Object.fromEntries((await req.formData()).entries());
  const blockedId = String(form.blockedId || "");
  await prisma.block.deleteMany({ where: { blockerId: uid, blockedId } });
  return NextResponse.redirect(new URL("/account?unblocked=1", req.url), 303);
}
