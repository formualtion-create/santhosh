import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

// Update privacy controls: pet-photo visibility and location precision.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);

  const form = Object.fromEntries((await req.formData()).entries());
  const photoPrivacy = form.photoPrivacy === "MATCHED" ? "MATCHED" : "PUBLIC";
  const hideExactLocation = form.hideExactLocation === "on";

  await prisma.user.update({ where: { id: uid }, data: { photoPrivacy, hideExactLocation } });
  return NextResponse.redirect(new URL("/account?privacy=1", req.url), 303);
}
