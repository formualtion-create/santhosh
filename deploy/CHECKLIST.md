# ✅ PawsPair — Pre-launch checklist

Tick these before pointing real users at the site.

## Must-do
- [ ] **`AUTH_SECRET`** set to a strong, unique 32+ char value (`openssl rand -base64 32`)
- [ ] **`NEXT_PUBLIC_SITE_URL`** set to your real domain (canonical/sitemap/OG/email links)
- [ ] **Database** on PlanetScale/MySQL: `cp prisma/schema.mysql.prisma prisma/schema.prisma` → `npx prisma db push`
- [ ] **Did NOT** run `npm run db:seed` against production (it wipes & inserts demo data)
- [ ] **Legal pages reviewed by a qualified Indian lawyer** (Terms / Privacy-DPDP / Refund / Grievance / Declaration)
- [ ] At least one **admin account** created; default demo logins removed/rotated

## Go-live integrations (each optional but recommended)
- [ ] **Razorpay**: keys + Fetch/Pedigree plan IDs + webhook configured **and a test payment verified**
- [ ] **Email**: Gmail App Password *or* Resend key set; **SPF / DKIM / DMARC** configured; test OTP + reset + welcome email received
- [ ] **KYC** provider wired into `/api/verify` (and phone SMS-OTP into `/api/trust`)
- [ ] **File uploads** (`/api/pet/photo`, `/api/chat/photo`) pointed at S3 / Cloudinary — local disk won't persist on Vercel
- [ ] **Web Push** VAPID keys set (match/message notifications)
- [ ] **`CRON_SECRET`** set + `vercel.json` at root (daily-thought push)

## Security & ops
- [ ] `npm audit` clean (currently **0 vulnerabilities**)
- [ ] Security headers verified live (CSP, HSTS, X-Frame-Options) — set automatically in `next.config.mjs`
- [ ] **Image moderation** on user uploads (AWS Rekognition / Sightengine)
- [ ] **Rate-limit store** moved to Redis (Upstash) if running multiple instances
- [ ] **Error monitoring** (Sentry) + **analytics** (GA4 / Plausible / PostHog) added
- [ ] Automated **database backups** enabled

## Smoke test on the live URL
- [ ] Sign up → email OTP → verify → dashboard
- [ ] Log in → email 2FA code → dashboard
- [ ] Like → match → chat (text + photo) → review → safety check-in
- [ ] Membership upgrade (real Razorpay checkout)
- [ ] Submit a Happy Tail → approve it in `/admin` → it appears on `/stories` + homepage
- [ ] `/sitemap.xml` and `/robots.txt` resolve with the correct domain
