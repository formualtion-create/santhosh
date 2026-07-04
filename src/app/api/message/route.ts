import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin, rateLimit } from "@/lib/security";
import { sendPushToUser } from "@/lib/push";
import { scanMessage, SCAM_NOTE } from "@/lib/safety";
import { logEvent } from "@/lib/events";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const wantsJson = (req.headers.get("accept") || "").includes("application/json");
  const uid = await getSessionUserId();
  if (!uid) return wantsJson ? NextResponse.json({ error: "auth" }, { status: 401 }) : NextResponse.redirect(new URL("/login", req.url), 303);
  if (!rateLimit("msg:" + uid, 20, 30_000))
    return wantsJson ? NextResponse.json({ error: "rate" }, { status: 429 }) : NextResponse.redirect(new URL("/matches", req.url), 303);

  const form = Object.fromEntries((await req.formData()).entries());
  const matchId = String(form.matchId || "");
  const body = String(form.body || "").trim().slice(0, 1000);

  const m = await prisma.match.findUnique({ where: { id: matchId } });
  let created = null;
  let scan = { flagged: false, reasons: [] as string[] };
  if (m && body && (m.userAId === uid || m.userBId === uid)) {
    scan = scanMessage(body);
    created = await prisma.message.create({ data: { matchId, senderId: uid, body, flagged: scan.flagged } });
    logEvent("message", { userId: uid, meta: { matchId, len: body.length, flagged: scan.flagged } });
    // notify the other member (respecting their preference)
    const otherId = m.userAId === uid ? m.userBId : m.userAId;
    const me = await prisma.user.findUnique({ where: { id: uid }, select: { ownerName: true, pets: { take: 1, select: { name: true } } } });
    const other = await prisma.user.findUnique({ where: { id: otherId }, select: { notifyMessages: true } });
    const who = me?.pets[0]?.name || me?.ownerName || "A member";
    if (other?.notifyMessages) void sendPushToUser(otherId, { title: `💬 ${who}`, body, url: `/chat/${matchId}`, tag: `chat-${matchId}` });
  }

  if (wantsJson) return NextResponse.json({ ok: !!created, message: created, warning: scan.flagged ? SCAM_NOTE : null });
  return NextResponse.redirect(new URL("/chat/" + matchId, req.url), 303);
}
