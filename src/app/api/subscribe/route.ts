import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";
import { razorpayEnabled, planToRazorpayId, createSubscription } from "@/lib/razorpay";
import { logEvent } from "@/lib/events";

const PLANS = ["SNIFF", "FETCH", "PEDIGREE"];

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);

  const form = Object.fromEntries((await req.formData()).entries());
  const plan = String(form.plan || "").toUpperCase();
  if (!PLANS.includes(plan)) return NextResponse.redirect(new URL("/membership?error=Unknown+plan", req.url), 303);
  logEvent("subscribe", { userId: user.id, meta: { plan, from: user.plan } });

  // Downgrade to free is immediate (in prod you'd also cancel the Razorpay subscription).
  if (plan === "SNIFF") {
    await prisma.user.update({ where: { id: user.id }, data: { plan: "SNIFF", planRenewsAt: null } });
    return NextResponse.redirect(new URL("/membership?ok=SNIFF", req.url), 303);
  }

  // Real payment path — redirect to Razorpay hosted checkout; plan is flipped by the webhook.
  if (razorpayEnabled()) {
    const planId = planToRazorpayId(plan);
    if (!planId) return NextResponse.redirect(new URL("/membership?error=Plan+not+configured", req.url), 303);
    try {
      const sub = await createSubscription(planId, { email: user.email, notes: { userId: user.id } });
      await prisma.user.update({ where: { id: user.id }, data: { razorpaySubId: sub.id } });
      return NextResponse.redirect(sub.short_url, 303); // Razorpay-hosted checkout
    } catch (e) {
      return NextResponse.redirect(new URL("/membership?error=Payment+setup+failed", req.url), 303);
    }
  }

  // Simulated path (default) — no real money.
  const renews = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  await prisma.user.update({ where: { id: user.id }, data: { plan, planRenewsAt: renews } });
  return NextResponse.redirect(new URL("/membership?ok=" + plan, req.url), 303);
}
