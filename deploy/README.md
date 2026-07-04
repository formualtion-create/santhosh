# 🚀 PawsPair — Deployment Kit

Everything you need to take PawsPair live, in one folder.

The app runs **fully in simulated mode** out of the box (no external keys needed), so you can
demo it today. To go to production, work through the sections below — each is independent and
can be done in any order.

```
deploy/
├── README.md                 ← you are here (the full runbook)
├── CHECKLIST.md              ← pre-launch checklist
├── .env.production.example   ← copy → project root as `.env`, then fill in
├── vercel.json               ← copy → project root (enables the daily-thought cron)
├── Dockerfile                ← reference copy (the live one lives at the project root)
├── dockerignore.txt          ← reference copy of `.dockerignore`
└── schema.mysql.prisma       ← reference copy of `prisma/schema.mysql.prisma`
```

> **Files that must live at the project root to work:** `Dockerfile`, `.dockerignore`,
> `vercel.json`, and the active `prisma/schema.prisma`. The copies here are for reference;
> where you need to move one, the steps below say so.

---

## 0. Required for ANY production deploy

```bash
# Generate a strong session secret (the app refuses to boot in prod without one ≥32 chars)
openssl rand -base64 32
```

Set it as `AUTH_SECRET`. That's the only hard requirement — everything else below unlocks a
specific feature and degrades gracefully (stays simulated / no-ops) when absent.

---

## 1. Database → PlanetScale (MySQL)

The app ships with SQLite for local dev and a ready MySQL/Vitess schema for production.

1. Create a database in PlanetScale (e.g. `pawspair`) and a password; copy the connection string.
2. Switch the active schema to the MySQL variant:
   ```bash
   cp prisma/schema.mysql.prisma prisma/schema.prisma
   ```
3. Set `DATABASE_URL` to the PlanetScale string (ends with `?sslaccept=strict`).
4. Push the schema (and optionally seed demo data):
   ```bash
   npx prisma db push
   npm run db:seed        # optional demo data — SKIP for a clean production DB
   ```

> The MySQL schema uses `relationMode = "prisma"` (Vitess has no foreign-key constraints) and
> `@db.Text` for long fields — already handled for you. Any Postgres/MySQL host works; just
> match the `provider` in the schema.

---

## 2. Payments → Razorpay (real subscriptions)

1. In the Razorpay dashboard create **Plans**: Fetch (₹499/mo) and Pedigree (₹1,299/mo); copy their Plan IDs.
2. Add a **Webhook** → `https://YOUR_DOMAIN/api/webhooks/razorpay` with events:
   `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.completed`. Copy the webhook secret.
3. Set:
   ```
   RAZORPAY_KEY_ID=...
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_WEBHOOK_SECRET=...
   RAZORPAY_PLAN_FETCH=plan_xxx
   RAZORPAY_PLAN_PEDIGREE=plan_yyy
   ```
The Membership page switches from "Demo mode" to live Razorpay checkout automatically; plans
activate via the signed webhook (`src/app/api/webhooks/razorpay/route.ts`).

---

## 3. Identity verification → KYC provider

`/api/verify/route.ts` is the integration point. Replace the simulated approval with your
provider's flow (DigiLocker / Signzy / HyperVerge): redirect the user to the provider, then flip
`kycStatus` to `VERIFIED` from the provider's **signed callback/webhook** (mirror the Razorpay
webhook pattern). Only a masked document reference is ever stored.

**Phone verification** (the Phone trust badge) is in `/api/trust` (`step: "phone"`) — swap the
simulated approval for a real **SMS OTP** (MSG91 / Twilio Verify).

---

## 4. File uploads → object storage

Local/dev writes images to `public/uploads`. Serverless hosts (Vercel) have an ephemeral,
read-only filesystem, so for production swap these two routes to upload to **S3 / Cloudinary /
UploadThing** and store the returned URL:

- `src/app/api/pet/photo/route.ts` — pet profile photos
- `src/app/api/chat/photo/route.ts` — photos shared in chat

Both already validate real image bytes (magic-number sniffing); you only need to change the
`writeFile(...)` call to an upload. **Recommended:** add AI image moderation (AWS Rekognition /
Sightengine) at the same point to auto-screen user uploads.

---

## 5. Email → Gmail SMTP or Resend

Transactional email (OTP codes, password-reset links, welcome emails) is in `src/lib/email.ts`
and supports two providers — set **one**:

**Option A — Gmail SMTP** (simplest; ~500 emails/day cap):
```
GMAIL_USER="pawspair@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"   # 16-char App Password from myaccount.google.com/apppasswords (2FA must be on)
EMAIL_FROM="PawsPair <pawspair@gmail.com>"
```

**Option B — Resend** (scales; recommended for production):
```
RESEND_API_KEY="re_..."
EMAIL_FROM="PawsPair <hello@yourdomain.com>"   # a verified Resend sender
```

> With neither set, email is **skipped silently** and OTP codes are shown on-screen (demo mode).
> Once email works, codes go only to the inbox. **Set up SPF / DKIM / DMARC** on your sending
> domain so mail doesn't land in spam.

---

## 6. Push notifications + daily-thought cron (optional)

**Web Push** — generate VAPID keys (`npx web-push generate-vapid-keys`) and set:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:hello@yourdomain.com"
```
Match & message pushes then fire automatically (respecting each member's notification preferences).

**Daily "thought of the day" push** — set a `CRON_SECRET`, then schedule a daily GET to
`/api/cron/daily-thought` with header `Authorization: Bearer <CRON_SECRET>`.
- On **Vercel**: copy `deploy/vercel.json` to the project root (it adds the cron at 09:00 daily).
- The endpoint **returns 503 until `CRON_SECRET` is set** (it's disabled, not public).
- Admins can also send it on demand from the Admin console.

---

## 7. Deploy

### Vercel (recommended)
1. Push the project to a Git repo and import it in Vercel.
2. Add every env var (at minimum `AUTH_SECRET` + `DATABASE_URL`) in **Project → Settings → Environment Variables**.
3. Copy `deploy/vercel.json` to the project root if you want the daily cron.
4. Deploy. The build runs `prisma generate && next build` automatically.
5. Set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` so canonical URLs, the sitemap and OG images use your real domain.

### Docker (any host)
The `Dockerfile` (project root) builds the Next.js **standalone** server.
```bash
docker build -t pawspair .
docker run -p 3000:3000 --env-file .env pawspair
```

---

## 8. Scale & hardening (when traffic grows)

- **Rate limiting** is in-memory (`src/lib/security.ts`) — fine for a single instance. Move to
  **Redis** (Upstash) if you run multiple instances, so limits are shared.
- **Error monitoring** — add **Sentry** (`@sentry/nextjs`).
- **Analytics** — add GA4 / Plausible / PostHog. The cookie-consent banner already gates non-essential cookies.
- **Image moderation** — see §4.
- **Backups** — enable automated DB backups on your DB host.

---

## ⚖️ Before you launch (important)

The legal pages (Terms, Privacy/DPDP, Refund, Grievance, User Declaration) are solid, India-aware
**templates** — have them **reviewed and finalised by a qualified Indian lawyer** before going
live. See `CHECKLIST.md` for the full pre-launch list.
