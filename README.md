# 🐾 PawsPair — Verified Pet Matchmaking (Web App)

India-first, DPDP-compliant pet matchmaking platform. Members create a profile, get
identity-verified, then discover, match, and chat with other verified pet parents nearby.

## Stack
- **Next.js 14** (App Router, TypeScript) · **Prisma** ORM
- **SQLite** for local dev → **PlanetScale/MySQL** for production
- Custom **JWT + bcrypt** auth (httpOnly cookies) · **react-leaflet** / OpenStreetMap
- **Razorpay** subscriptions (env-gated; simulated until keys are added)

## Features
Auth (signup/login/logout, forgot/reset password) · simulated KYC verification gate ·
profile + map location picker · verified-only discovery with filters, sort & distance ·
**like/pass → mutual matches → 1:1 chat** · pet photo upload · report & block ·
**admin moderation console** · membership/subscriptions · DPDP data export & delete ·
legal pages (Terms, Privacy, Refund, Grievance).

## Run locally
```bash
npm install
cp .env.example .env          # then edit AUTH_SECRET
npx prisma db push            # create the SQLite schema
npm run db:seed               # seed demo members + matches
npm run dev                   # http://localhost:3000
```

**Demo logins**
- Member: `ananya@example.com` / `password123` (has matches + a chat)
- Admin:  `admin@pawspair.in` / `admin12345` → `/admin`

## Security
CSP + security headers, auth/messaging rate-limiting, same-origin (CSRF) checks on all
mutating routes, bcrypt password hashing, httpOnly JWT sessions, DPDP export excludes secrets.

## Going to production
See **DEPLOY.md** for the PlanetScale, Razorpay, and Vercel/Docker steps.

> Verification & payments run in **simulated mode** until you add the respective provider
> keys. Everything else is real.
