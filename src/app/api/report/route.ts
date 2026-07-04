import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin, rateLimit, safePath } from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);
  if (!rateLimit("report:" + uid, 10, 60_000)) return NextResponse.redirect(new URL("/dashboard?error=Too+many+reports", req.url), 303);
  const form = Object.fromEntries((await req.formData()).entries());
  const targetUserId = String(form.targetUserId || "");
  const reason = String(form.reason || "Other").slice(0, 80);
  const next = safePath(form.next, "/dashboard");
  if (targetUserId && targetUserId !== uid) {
    await prisma.report.create({ data: { reporterId: uid, targetUserId, reason, details: String(form.details || "").slice(0, 1000) } });
  }
  const sep = next.includes("?") ? "&" : "?";
  return NextResponse.redirect(new URL(`${next}${sep}reported=1`, req.url), 303);
}
