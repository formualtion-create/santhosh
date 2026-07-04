import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { rateLimit, clientIp, sameOrigin, tooMany } from "@/lib/security";
import { issueAndSendOtp } from "@/lib/otp";
import { logEvent } from "@/lib/events";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!rateLimit("signup:" + clientIp(req), 5, 60_000)) return tooMany(req, "/signup");
  const form = Object.fromEntries((await req.formData()).entries());
  const parsed = signupSchema.safeParse(form);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Please check your details";
    return NextResponse.redirect(new URL("/signup?error=" + encodeURIComponent(msg), req.url), 303);
  }
  const d = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: d.email.toLowerCase() } });
  if (existing) {
    return NextResponse.redirect(
      new URL("/signup?error=" + encodeURIComponent("An account with this email already exists"), req.url),
      303
    );
  }

  const user = await prisma.user.create({
    data: {
      email: d.email.toLowerCase(),
      passwordHash: await hashPassword(d.password),
      ownerName: d.ownerName,
      phone: d.phone,
      city: d.city,
      lat: d.lat,
      lng: d.lng,
      kycStatus: "IN_REVIEW",
      kycDocType: d.kycDocType,
      kycDocRef: `${d.kycDocType} ••••${d.kycDocLast4}`,
      consentDPDP: true,
      consentMarketing: form.consentMarketing === "on",
      acceptedTermsAt: new Date(),
      declarationAcceptedAt: new Date(),
      pets: {
        create: {
          name: d.petName,
          species: d.species,
          breed: d.breed || null,
          ageBand: d.ageBand,
          gender: d.gender,
          neutered: form.neutered === "on",
          size: d.size || null,
          energy: d.energy,
          temperament: d.temperament || null,
          intent: d.intent,
          bio: d.bio || null,
          interests: d.interests || null,
          favActivity: d.favActivity || null,
          vaccinated: form.vaccinated === "on",
          city: d.city,
          lat: d.lat,
          lng: d.lng,
        },
      },
    },
  });

  logEvent("signup", { userId: user.id, meta: { species: d.species, city: d.city, intent: d.intent, ageBand: d.ageBand } });
  await createSession(user.id);
  const { code, emailed } = await issueAndSendOtp(user);
  // If email isn't configured yet, surface the code so signup stays testable.
  const demo = emailed ? "" : "&demo=" + code;
  return NextResponse.redirect(new URL("/verify-email?new=1" + demo, req.url), 303);
}
