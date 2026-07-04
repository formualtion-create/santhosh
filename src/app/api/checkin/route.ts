import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin, rateLimit, safePath } from "@/lib/security";
import { logEvent } from "@/lib/events";

// Create a safety check-in, or mark an existing one "safe".
// Marking safe only needs the unguessable token, so the member can confirm from
// their phone (or a trusted contact can) without logging in.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const form = Object.fromEntries((await req.formData()).entries());
  const action = String(form.action || "create");

  if (action === "safe") {
    const token = String(form.token || "");
    const ci = await prisma.checkIn.findUnique({ where: { token } });
    if (ci) await prisma.checkIn.update({ where: { token }, data: { status: "SAFE" } });
    return NextResponse.redirect(new URL("/safety/checkin/" + token, req.url), 303);
  }

  // create
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);
  if (!rateLimit("checkin:" + uid, 10, 60_000)) return NextResponse.redirect(new URL("/matches?error=Too+many+attempts", req.url), 303);

  const place = String(form.place || "").trim().slice(0, 160);
  const withName = String(form.withName || "").trim().slice(0, 80) || null;
  const meetRaw = String(form.meetAt || "").trim();
  const meetAt = meetRaw ? new Date(meetRaw) : null;
  const back = safePath(form.next, "/matches");
  if (!place) return NextResponse.redirect(new URL(back + (back.includes("?") ? "&" : "?") + "error=Add+a+place", req.url), 303);

  const token = randomBytes(12).toString("hex");
  await prisma.checkIn.create({ data: { userId: uid, token, place, withName, meetAt: meetAt && !isNaN(meetAt.getTime()) ? meetAt : null } });
  logEvent("checkin", { userId: uid });
  return NextResponse.redirect(new URL(back + (back.includes("?") ? "&" : "?") + "checkin=" + token, req.url), 303);
}
