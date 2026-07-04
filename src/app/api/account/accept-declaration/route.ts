import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { rateLimit, clientIp, sameOrigin } from "@/lib/security";

// Records a member's explicit click-through acceptance of the User Declaration.
// Stamps User.declarationAcceptedAt with the server time of acceptance.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const uid = await getSessionUserId();
  if (!uid) {
    return NextResponse.json({ error: "Please log in to accept." }, { status: 401 });
  }
  if (!rateLimit(`accept-decl:${clientIp(req)}`, 12, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }
  const acceptedAt = new Date();
  await prisma.user.update({ where: { id: uid }, data: { declarationAcceptedAt: acceptedAt } });
  return NextResponse.json({ ok: true, acceptedAt: acceptedAt.toISOString() });
}
