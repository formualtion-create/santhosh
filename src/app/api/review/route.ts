import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin, rateLimit, safePath } from "@/lib/security";
import { areMatched } from "@/lib/data";
import { logEvent } from "@/lib/events";

// Leave (or update) a review of a member you've matched with.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);
  if (!rateLimit("review:" + uid, 10, 60_000)) return NextResponse.redirect(new URL("/dashboard?error=Too+many+attempts", req.url), 303);

  const form = Object.fromEntries((await req.formData()).entries());
  const subjectId = String(form.subjectId || "");
  const rating = Math.max(1, Math.min(5, parseInt(String(form.rating || "0"), 10) || 0));
  const comment = String(form.comment || "").trim().slice(0, 600) || null;
  const back = safePath(form.next, "/matches");

  if (!subjectId || subjectId === uid || !rating) {
    return NextResponse.redirect(new URL(back + (back.includes("?") ? "&" : "?") + "error=Pick+a+rating", req.url), 303);
  }
  // Only members who actually matched can review each other.
  if (!(await areMatched(uid, subjectId))) {
    return NextResponse.redirect(new URL(back + (back.includes("?") ? "&" : "?") + "error=You+can+only+review+a+match", req.url), 303);
  }

  await prisma.review.upsert({
    where: { authorId_subjectId: { authorId: uid, subjectId } },
    create: { authorId: uid, subjectId, rating, comment },
    update: { rating, comment },
  });
  logEvent("review", { userId: uid, meta: { subjectId, rating } });
  return NextResponse.redirect(new URL(back + (back.includes("?") ? "&" : "?") + "reviewed=1", req.url), 303);
}
