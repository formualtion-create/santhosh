import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { recordSwipe } from "@/lib/data";
import { sameOrigin, safePath } from "@/lib/security";
import { sendPushToUser } from "@/lib/push";
import { logEvent } from "@/lib/events";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);

  const form = Object.fromEntries((await req.formData()).entries());
  const petId = String(form.petId || "");
  const action = String(form.action || "PASS").toUpperCase() === "LIKE" ? "LIKE" : "PASS";
  const next = safePath(form.next, "/dashboard");

  const res = await recordSwipe(uid, petId, action as "LIKE" | "PASS");
  logEvent(action === "LIKE" ? "swipe_like" : "swipe_pass", { userId: uid, meta: { petId } });
  if (res.ok && res.matched) logEvent("match", { userId: uid, meta: { matchId: res.matchId } });
  const sep = next.includes("?") ? "&" : "?";
  if (res.ok && res.matched && res.matchId) {
    // notify the other member of the new match
    const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { userId: true, user: { select: { notifyMatches: true } } } });
    const me = await prisma.user.findUnique({ where: { id: uid }, select: { pets: { take: 1, select: { name: true } } } });
    if (pet && pet.user.notifyMatches) void sendPushToUser(pet.userId, { title: "💜 It's a match!", body: `You and ${me?.pets[0]?.name || "a member"} liked each other. Say hello!`, url: `/chat/${res.matchId}`, tag: "match" });
    return NextResponse.redirect(new URL(`${next}${sep}matched=${res.matchId}`, req.url), 303);
  }
  return NextResponse.redirect(new URL(next, req.url), 303);
}
