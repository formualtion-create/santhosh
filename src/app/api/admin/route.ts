import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";
import { sendDailyThoughtToAll } from "@/lib/push";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url), 303);

  const form = Object.fromEntries((await req.formData()).entries());
  const action = String(form.action || "");
  const id = String(form.id || "");

  switch (action) {
    case "verify":
      await prisma.user.update({ where: { id }, data: { kycStatus: "VERIFIED", verifiedAt: new Date() } });
      break;
    case "reject":
      await prisma.user.update({ where: { id }, data: { kycStatus: "REJECTED" } });
      break;
    case "ban":
      await prisma.user.update({ where: { id }, data: { bannedAt: new Date() } });
      break;
    case "unban":
      await prisma.user.update({ where: { id }, data: { bannedAt: null } });
      break;
    case "report-action":
      await prisma.report.update({ where: { id }, data: { status: "ACTIONED" } });
      break;
    case "report-dismiss":
      await prisma.report.update({ where: { id }, data: { status: "DISMISSED" } });
      break;
    case "story-approve":
      await prisma.storySubmission.update({ where: { id }, data: { status: "APPROVED" } });
      break;
    case "story-reject":
      await prisma.storySubmission.update({ where: { id }, data: { status: "REJECTED" } });
      break;
    case "story-feature": {
      const s = await prisma.storySubmission.findUnique({ where: { id }, select: { featured: true } });
      await prisma.storySubmission.update({ where: { id }, data: { featured: !s?.featured, status: "APPROVED" } });
      break;
    }
    case "send-thought": {
      const r = await sendDailyThoughtToAll();
      return NextResponse.redirect(new URL(`/admin?sent=${r.users}`, req.url), 303);
    }
  }
  return NextResponse.redirect(new URL("/admin?done=1", req.url), 303);
}
