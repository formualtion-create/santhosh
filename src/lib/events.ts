import { prisma } from "./db";

// Every meaningful signal a member feeds into the product.
export type EventType =
  | "signup" | "login" | "swipe_like" | "swipe_pass" | "match" | "message"
  | "search" | "subscribe" | "review" | "checkin" | "story_submit"
  | "newsletter" | "badge" | "photo_upload" | "feedback";

// Fire-and-forget analytics logger. NEVER blocks or throws into the request path.
export function logEvent(type: EventType, opts: { userId?: string | null; meta?: Record<string, unknown> } = {}) {
  void prisma.event
    .create({
      data: {
        type,
        userId: opts.userId ?? null,
        meta: opts.meta ? JSON.stringify(opts.meta).slice(0, 2000) : null,
      },
    })
    .catch(() => {});
}
