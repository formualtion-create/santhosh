import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin, rateLimit } from "@/lib/security";
import { logEvent } from "@/lib/events";

const schema = z.object({
  city: z.string().trim().min(2, "Choose your city").max(60),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

// Members can move — this lets them update the city + exact coordinates used for
// distance/discovery after signup. (Previously location was fixed at signup.)
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);
  if (!rateLimit("locupdate:" + uid, 8, 60_000)) {
    return NextResponse.redirect(new URL("/account?error=" + encodeURIComponent("Too many updates — try again in a minute"), req.url), 303);
  }

  const form = Object.fromEntries((await req.formData()).entries());
  const parsed = schema.safeParse(form);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Please pick a valid location";
    return NextResponse.redirect(new URL("/account?error=" + encodeURIComponent(msg), req.url), 303);
  }
  const { city, lat, lng } = parsed.data;

  await prisma.user.update({ where: { id: uid }, data: { city, lat, lng } });
  logEvent("location_update", { userId: uid, meta: { city } });
  return NextResponse.redirect(new URL("/account?location=1", req.url), 303);
}
