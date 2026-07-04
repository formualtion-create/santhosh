import { NextRequest, NextResponse } from "next/server";
import { sendDailyThoughtToAll } from "@/lib/push";

// Scheduled sender for the daily "thought of the day" push.
// Protect with CRON_SECRET and call from a scheduler (e.g. Vercel Cron / GitHub Actions):
//   GET /api/cron/daily-thought   with header  Authorization: Bearer <CRON_SECRET>
//   or  /api/cron/daily-thought?key=<CRON_SECRET>
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Fail closed: if no secret is configured, the endpoint is disabled rather
  // than open to the public (which would let anyone trigger a push to all users).
  if (!secret) {
    return NextResponse.json({ error: "Cron disabled (CRON_SECRET not set)" }, { status: 503 });
  }
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${secret}` && key !== secret) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const res = await sendDailyThoughtToAll();
  return NextResponse.json({ ok: true, ...res });
}
