import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sameOrigin, rateLimit, clientIp } from "@/lib/security";
import { logEvent } from "@/lib/events";

const CATEGORIES = new Set(["bug", "idea", "confusing", "praise", "other"]);

// Beta feedback intake. Open to logged-in testers and guests; same-origin +
// rate-limited. Stored for review in /admin. No external service required.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!rateLimit("feedback:" + clientIp(req), 8, 60_000)) {
    return NextResponse.json({ error: "Please wait a moment before sending more feedback." }, { status: 429 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const category = typeof body.category === "string" && CATEGORIES.has(body.category) ? body.category : "other";
  const url = typeof body.url === "string" ? body.url.slice(0, 300) : null;
  const emailIn = typeof body.email === "string" ? body.email.trim().slice(0, 160) : "";

  if (message.length < 3) return NextResponse.json({ error: "Please add a little more detail." }, { status: 400 });
  if (message.length > 4000) return NextResponse.json({ error: "That's a bit long — please keep it under 4000 characters." }, { status: 400 });

  const user = await getCurrentUser();

  await prisma.feedback.create({
    data: {
      userId: user?.id ?? null,
      email: user?.email ?? (emailIn || null),
      category,
      message,
      url,
    },
  });

  logEvent("feedback", { userId: user?.id, meta: { category, url } });

  return NextResponse.json({ ok: true });
}
