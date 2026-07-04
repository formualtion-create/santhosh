import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

// Polled by the live chat to fetch new messages.
export async function GET(req: NextRequest, props: { params: Promise<{ matchId: string }> }) {
  const params = await props.params;
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "auth" }, { status: 401 });
  const m = await prisma.match.findUnique({ where: { id: params.matchId } });
  if (!m || (m.userAId !== uid && m.userBId !== uid)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { matchId: params.matchId },
    orderBy: { createdAt: "asc" },
    select: { id: true, senderId: true, body: true, imageUrl: true, flagged: true, createdAt: true },
  });
  return NextResponse.json({ messages, me: uid }, { headers: { "Cache-Control": "no-store" } });
}
