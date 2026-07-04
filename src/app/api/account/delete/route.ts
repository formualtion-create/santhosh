import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId, destroySession } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

// DPDP Act 2023 — right to erasure. Hard-deletes the user and cascades pets.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);
  // DPDP erasure: also purge the loose-referenced analytics events for this user.
  await prisma.event.deleteMany({ where: { userId: uid } });
  await prisma.user.delete({ where: { id: uid } });
  await destroySession();
  return NextResponse.redirect(new URL("/?deleted=1", req.url), 303);
}
