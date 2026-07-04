import crypto from "crypto";

// Real Razorpay integration, activated only when env keys are present.
// Until then the app runs in SIMULATED mode (no real money), so it works out of the box.
//
// To go live, set in .env:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
//   RAZORPAY_PLAN_FETCH, RAZORPAY_PLAN_PEDIGREE   (Plan IDs created in the Razorpay dashboard)
// and add a webhook -> /api/webhooks/razorpay (events: subscription.activated, subscription.charged, subscription.cancelled)

export function razorpayEnabled(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function planToRazorpayId(plan: string): string | null {
  if (plan === "FETCH") return process.env.RAZORPAY_PLAN_FETCH || null;
  if (plan === "PEDIGREE") return process.env.RAZORPAY_PLAN_PEDIGREE || null;
  return null;
}

export function razorpayIdToPlan(planId: string): string | null {
  if (planId && planId === process.env.RAZORPAY_PLAN_FETCH) return "FETCH";
  if (planId && planId === process.env.RAZORPAY_PLAN_PEDIGREE) return "PEDIGREE";
  return null;
}

function authHeader(): string {
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

// Create a Razorpay Subscription and return the hosted checkout URL.
export async function createSubscription(planId: string, opts: { email: string; notes?: Record<string, string> }) {
  const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: planId,
      total_count: 12, // 12 monthly cycles
      customer_notify: 1,
      notes: { email: opts.email, ...(opts.notes || {}) },
    }),
  });
  if (!res.ok) throw new Error(`Razorpay subscription failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { id: string; short_url: string };
  return data; // { id, short_url, ... }
}

// Verify the X-Razorpay-Signature header against the raw request body.
export function verifyWebhook(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
