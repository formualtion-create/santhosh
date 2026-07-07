import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sameOrigin, rateLimit, clientIp } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";
import { logEvent } from "@/lib/events";

const schema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email().optional().or(z.literal("")),
  petName: z.string().min(1, "Enter your pet's name").max(60),
  species: z.string().max(40).optional(),
  city: z.string().max(60).optional(),
  rating: z.coerce.number().min(1).max(5).default(5),
  story: z.string().trim().min(15, "Tell us a little more — a sentence or two").max(1200),
});

// Members (and visitors) can submit their own Happy Tail — stored as PENDING for
// moderation in the admin console before it appears publicly.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!rateLimit("storysubmit:" + clientIp(req), 4, 5 * 60_000)) {
    return NextResponse.redirect(new URL("/stories?error=" + encodeURIComponent("Please wait a little before submitting again"), req.url), 303);
  }

  const form = Object.fromEntries((await req.formData()).entries());
  const parsed = schema.safeParse(form);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Please check your details";
    return NextResponse.redirect(new URL("/stories?error=" + encodeURIComponent(msg) + "#share", req.url), 303);
  }
  const d = parsed.data;

  // Prefill the name from the logged-in member if available.
  const user = await getCurrentUser();
  await prisma.storySubmission.create({
    data: {
      name: d.name || user?.ownerName || "A PawsPair member",
      email: d.email || user?.email || null,
      petName: d.petName,
      species: d.species || null,
      city: d.city || user?.city || null,
      rating: d.rating,
      story: d.story,
    },
  });
  logEvent("story_submit", { userId: user?.id, meta: { petName: d.petName, city: d.city, rating: d.rating } });
  return NextResponse.redirect(new URL("/stories?submitted=1", req.url), 303);
}
