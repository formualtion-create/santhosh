import webpush from "web-push";
import { prisma } from "./db";
import { dayThought } from "./thoughts";

const PUB = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIV = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:hello@pawspair.in";

let configured = false;
export function pushEnabled() {
  return !!(PUB && PRIV);
}
function ensure() {
  if (!configured && pushEnabled()) {
    webpush.setVapidDetails(SUBJECT, PUB!, PRIV!);
    configured = true;
  }
  return configured;
}

type Payload = { title: string; body: string; url?: string; tag?: string };

// Fire-and-forget push to all of a user's devices. Never throws into the request path.
export async function sendPushToUser(userId: string, payload: Payload) {
  try {
    if (!ensure()) return;
    const subs = await prisma.pushSubscription.findMany({ where: { userId } });
    const data = JSON.stringify(payload);
    await Promise.all(
      subs.map((s) =>
        webpush
          .sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, data)
          .catch(async (err: any) => {
            // 404/410 = subscription expired → remove it
            if (err?.statusCode === 404 || err?.statusCode === 410) {
              await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
            }
          })
      )
    );
  } catch {
    /* push failures must never break the app */
  }
}

// Sends today's "thought of the day" as a push to every user who has a subscription.
export async function sendDailyThoughtToAll(): Promise<{ users: number }> {
  if (!ensure()) return { users: 0 };
  const subs = await prisma.pushSubscription.findMany({ select: { userId: true } });
  const userIds = Array.from(new Set(subs.map((s) => s.userId)));
  const body = dayThought();
  await Promise.all(userIds.map((uid) => sendPushToUser(uid, { title: "💜 Thought of the day", body, url: "/dashboard", tag: "daily-thought" })));
  return { users: userIds.length };
}
