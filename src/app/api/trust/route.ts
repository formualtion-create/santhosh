import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sameOrigin, rateLimit } from "@/lib/security";
import { logEvent } from "@/lib/events";

// Earn a single trust badge. SIMULATED here (no external providers): in production
// each step is a real check — phone via SMS OTP (MSG91/Twilio), ID via DigiLocker,
// selfie via a liveness/face-match SDK, health via a vet-document review, etc.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);
  if (!rateLimit("trust:" + user.id, 20, 60_000)) return NextResponse.redirect(new URL("/verify?error=Too+many+attempts", req.url), 303);

  const form = Object.fromEntries((await req.formData()).entries());
  const step = String(form.step || "");
  const back = (msg: string) => NextResponse.redirect(new URL("/verify?done=" + encodeURIComponent(msg), req.url), 303);
  const fail = (msg: string) => NextResponse.redirect(new URL("/verify?error=" + encodeURIComponent(msg), req.url), 303);
  const pet = user.pets[0];
  logEvent("badge", { userId: user.id, meta: { step } });

  switch (step) {
    case "phone":
      if (!user.phone) return fail("Add a mobile number first");
      await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
      return back("Phone verified");

    case "selfie":
      await prisma.user.update({ where: { id: user.id }, data: { selfieVerified: true } });
      return back("Photo verified");

    case "location":
      await prisma.user.update({ where: { id: user.id }, data: { locationVerified: true } });
      return back("Location verified");

    case "social": {
      const url = String(form.socialUrl || "").trim().slice(0, 200);
      if (!/^https?:\/\/.+\..+/.test(url)) return fail("Enter a valid social profile link");
      await prisma.user.update({ where: { id: user.id }, data: { socialVerified: true, socialUrl: url } });
      return back("Social linked");
    }

    case "health":
      if (!pet) return fail("Add a pet first");
      await prisma.pet.update({ where: { id: pet.id }, data: { healthVerified: true, vaccinated: true, healthDocRef: "Vet record ••••" } });
      return back("Health verified");

    case "microchip": {
      if (!pet) return fail("Add a pet first");
      const last4 = String(form.microchipLast4 || "").replace(/\D/g, "").slice(-4);
      if (last4.length !== 4) return fail("Enter the last 4 digits of the microchip");
      await prisma.pet.update({ where: { id: pet.id }, data: { microchipVerified: true, microchipId: "•••• " + last4 } });
      return back("Microchip verified");
    }
  }
  return fail("Unknown verification step");
}
