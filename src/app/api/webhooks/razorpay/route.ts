import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhook, razorpayIdToPlan } from "@/lib/razorpay";

// Razorpay calls this endpoint server-to-server. We verify the signature, then
// reconcile the subscription state into the user's plan. No session/cookie here.
export async function POST(req: NextRequest) {
  const raw = await req.text(); // must verify the RAW body
  const sig = req.headers.get("x-razorpay-signature");
  if (!verifyWebhook(raw, sig)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const sub = event?.payload?.subscription?.entity;
  const type = event?.event as string;
  if (sub?.id) {
    const user = await prisma.user.findFirst({ where: { razorpaySubId: sub.id } });
    if (user) {
      if (type === "subscription.activated" || type === "subscription.charged") {
        const plan = razorpayIdToPlan(sub.plan_id) || user.plan;
        const renews = sub.current_end ? new Date(sub.current_end * 1000) : new Date(Date.now() + 30 * 24 * 3600 * 1000);
        await prisma.user.update({ where: { id: user.id }, data: { plan, planRenewsAt: renews } });
      } else if (type === "subscription.cancelled" || type === "subscription.completed") {
        await prisma.user.update({ where: { id: user.id }, data: { plan: "SNIFF", planRenewsAt: null, razorpaySubId: null } });
      }
    }
  }
  return NextResponse.json({ ok: true });
}
