import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sameOrigin, rateLimit, clientIp, escapeHtml } from "@/lib/security";
import { sendEmail, brandEmail } from "@/lib/email";
import { SLOGAN, dayThought } from "@/lib/thoughts";
import { logEvent } from "@/lib/events";

const schema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email"),
  mobile: z.string().transform((s) => s.replace(/[^\d+]/g, "")).refine((s) => /^\+?\d{10,13}$/.test(s), "Enter a valid mobile number"),
  species: z.string().min(1).max(40),
  petName: z.string().min(1, "Enter your pet's name").max(60),
  petAge: z.string().min(1, "Enter your pet's age").max(40),
});

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!rateLimit("news:" + clientIp(req), 6, 60_000)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let json: any;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Bad payload" }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const d = parsed.data;

  await prisma.subscriber.upsert({
    where: { email: d.email.toLowerCase() },
    create: { ...d, email: d.email.toLowerCase() },
    update: { name: d.name, mobile: d.mobile, species: d.species, petName: d.petName, petAge: d.petAge },
  });
  logEvent("newsletter", { meta: { species: d.species, petAge: d.petAge } });

  // Welcome email (only sent if an email provider is configured)
  void sendEmail({
    to: d.email.toLowerCase(),
    subject: "Welcome to the PawsPair family 🐾",
    html: brandEmail(
      `Welcome, ${escapeHtml(d.name.split(" ")[0])}! 💜`,
      `“${SLOGAN}” — we're so happy to have you and ${escapeHtml(d.petName)}. Here's your first thought to carry today: <br><br><em>${dayThought()}</em>`,
      { label: "Discover companions", url: (process.env.NEXT_PUBLIC_SITE_URL || "https://pawspair.in") + "/signup" }
    ),
  });

  return NextResponse.json({ ok: true });
}
