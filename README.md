# Swaad-e-Mehfil — Restaurant Platform

A full-stack restaurant website: public menu/ordering/reservations site, guest and account
checkout with Razorpay payments, and a role-based admin dashboard for running the restaurant's
content day to day.

## Features

- **Public site** — home, about, full menu with search/veg/spice filters, gallery with lightbox,
  offers, reviews, reservations, contact form. Entirely driven by the database — no restaurant
  facts are hardcoded in components.
- **Ordering** — cart (persisted in the browser), delivery/pickup checkout, Razorpay payment
  (Orders API + Checkout.js + webhook), order confirmation that only ever shows "paid" once the
  database confirms it, and order tracking by order number.
- **Accounts** — guest checkout, or optional customer accounts with order/reservation history.
- **Admin dashboard** — menu categories/items/variants/add-ons, orders, reservations, offers,
  review moderation, gallery (with image upload), contact inbox, restaurant settings, and admin
  user management. `SUPER_ADMIN` and `ADMIN` roles, enforced server-side on every mutation.
- **First-run setup** — no admin exists until you visit `/setup` once and create the first
  Super Admin. Further admins are created from `/admin/users`.

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** (CSS-first config, tokens in `src/app/globals.css`)
- **Prisma 7** + **PostgreSQL** (via `@prisma/adapter-pg`)
- **Auth.js (NextAuth v5)** — credentials auth, JWT sessions, role-based access
- **Zod** + **react-hook-form** for validation
- **Zustand** for the client-side cart
- **Razorpay** for payments
- Local filesystem image storage (`public/uploads`), behind a swappable `lib/storage` module

## Folder Structure

```
prisma/                  schema.prisma, seed.ts, migrations
src/
  app/
    (public)/             public site: home, menu, about, gallery, offers, reviews,
                           reservations, contact, cart, checkout, order-confirmation,
                           track-order, legal pages
    (account)/account/     logged-in customer area: profile, orders, reservations
    (auth)/                login, register, setup (first-run Super Admin wizard)
    (admin)/admin/          admin dashboard (role-gated)
    api/auth/, api/razorpay/, api/uploads/
    sitemap.ts, robots.ts, manifest.ts
  components/             ui/ layout/ menu/ cart/ reservation/ checkout/ admin/ shared/
  lib/
    prisma.ts, auth.ts, auth-guards.ts, razorpay.ts, seo.ts, utils.ts
    services/              read-side DB queries used by pages
    actions/                'use server' mutations (the real authorization boundary)
    validations/            zod schemas, shared by client forms and server actions
    storage/local.ts        local image upload/delete — the only file-system-aware module
  stores/cart.store.ts     Zustand cart, persisted to localStorage
  proxy.ts                 route-level auth redirect for /admin and /account (UX only —
                           see "Security model" below)
```

## Getting Started

### 1. Prerequisites

- Node.js 20.9+
- A PostgreSQL database (local or hosted)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/db?schema=public` |
| `AUTH_SECRET` | Yes | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Yes | e.g. `http://localhost:3000` in dev |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | For ordering | From the Razorpay dashboard (use **test mode** keys in dev) |
| `RAZORPAY_WEBHOOK_SECRET` | For ordering | Set when you configure the webhook URL in Razorpay |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | For ordering | Same value as `RAZORPAY_KEY_ID` — exposed to the browser for Checkout.js |
| `NEXT_PUBLIC_GA_ID` | No | Leave empty to disable analytics |
| `BLOB_READ_WRITE_TOKEN` | Production only | Set automatically by Vercel when you attach Blob storage. Leave empty locally — uploads fall back to local disk. |

### 4. Set up the database

```bash
npm run db:migrate    # applies prisma/migrations, creates the schema
npm run db:seed        # seeds RestaurantSettings + a placeholder menu (no fake reviews/offers)
```

### 5. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000/setup` and create the first Super Admin account. You'll be signed
in and redirected to `/admin`. From there, go to **Settings** and enter the restaurant's real
address, contact details, opening hours, and social links — none of that is hardcoded, it all
lives in the database and is editable from the dashboard.

### 6. Production build

```bash
npm run build
npm run start
```

## Deploying to Vercel

Vercel hosts the Next.js app itself, but it doesn't include a database or persistent disk —
you need to provision those separately. Steps:

1. **Push this repo to GitHub** (already done if you're reading this from the repo).
2. **Create a Postgres database.** Easiest options: [Neon](https://neon.tech) or
   [Supabase](https://supabase.com) (both have a free tier), or Vercel's own **Storage → Postgres**
   tab on your project once it exists. Copy the connection string it gives you — that's your
   `DATABASE_URL`.
3. **Import the project on [vercel.com](https://vercel.com/new)** — sign in with GitHub, select
   `sksarfarajali/online-FoodPanda`. Vercel auto-detects Next.js; no build config changes needed.
4. **Add environment variables** in the Vercel project's Settings → Environment Variables —
   everything listed in the table above except `BLOB_READ_WRITE_TOKEN` (that one's automatic).
   Set `NEXT_PUBLIC_SITE_URL` to the `https://your-project.vercel.app` URL Vercel gives you (you
   can update it after the first deploy once you know the URL).
5. **Attach Blob storage**: in the project's **Storage** tab, add a **Blob** store and connect it
   to the project. This injects `BLOB_READ_WRITE_TOKEN` automatically — production image uploads
   (gallery/menu/settings) go to Blob storage instead of local disk, which Vercel's filesystem
   doesn't persist. See `lib/storage/` for how this switch works.
6. **Run the initial migration against the production database** — from your machine, with
   `DATABASE_URL` pointed at the production database:
   ```bash
   npm run db:deploy   # prisma migrate deploy — applies existing migrations, doesn't create new ones
   npm run db:seed      # optional: seeds RestaurantSettings + placeholder menu categories
   ```
7. **Deploy.** Vercel builds and deploys automatically on every push to `main` after the first
   import.
8. Visit `https://your-project.vercel.app/setup` and create the Super Admin, exactly like local
   dev.
9. **Configure the Razorpay webhook** in the Razorpay dashboard to point at
   `https://your-project.vercel.app/api/razorpay/webhook`, and set `RAZORPAY_WEBHOOK_SECRET` to
   match. Use Razorpay **test mode** keys until you've verified a full order end to end.

## Testing performed this session

- `npm run build` (TypeScript + production build) passes with zero errors.
- Manual browser walkthrough of `/setup` → `/login` → `/admin` (including the invalid-password
  error state) and `/register`, confirmed against the live app.
- Every admin route smoke-tested with an authenticated session (HTTP 200, no server error).
- `/admin`, `/account` confirmed to redirect unauthenticated visitors (proxy-level check).
- Razorpay integration is wired end-to-end but **not** exercised with a live payment in this
  session — do a manual test-mode checkout before going live (see below).

## Manual verification checklist before you consider this "done"

- [ ] Fill in real restaurant details in **Admin → Settings** (address, phone, hours, socials).
- [ ] Replace the placeholder menu (**Admin → Menu**) with real dishes, prices, and photos.
- [ ] Add real customer reviews as they come in (**Admin → Reviews**) — none are pre-seeded.
- [ ] Add real gallery photos (**Admin → Gallery**).
- [ ] Set Razorpay **test-mode** keys and place a full test order end to end: cart → checkout →
      Razorpay Checkout → `/order-confirmation/[orderNumber]` should show "Order Confirmed" only
      after payment succeeds.
- [ ] Configure the Razorpay webhook URL (`/api/razorpay/webhook`) in the Razorpay dashboard and
      set `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Replace the placeholder legal pages (`/privacy-policy`, `/terms`, `/refund-policy`) with
      reviewed copy — they currently ship with a visible "placeholder" notice.
- [ ] Swap Razorpay to **live** keys only once you're ready to accept real payments.

## Security model

- Every admin mutation (Server Action) independently calls `requireRole()` /
  `requireSuperAdmin()` from `lib/auth-guards.ts`. `proxy.ts` and the `(admin)` layout also
  redirect unauthenticated visitors, but those are UX conveniences, **not** the security
  boundary — Server Actions are directly callable, so each one re-checks authorization itself.
- Cart prices are never trusted from the client. `POST /api/razorpay/create-order` re-reads
  every line item's price from the database before creating the Razorpay order.
- Payment success is only ever rendered from `Order.paymentStatus` in the database — never from
  a client-side Razorpay callback alone. Both the client `/api/razorpay/verify` call (HMAC
  signature check) and the `/api/razorpay/webhook` endpoint can independently confirm a payment,
  making confirmation resilient to a closed tab or dropped network request.
- Passwords are hashed with bcrypt (12 rounds). Sessions are JWT-based via Auth.js.

## Fast-follow (deliberately out of scope for this build)

These need the restaurant owner's own accounts/credentials or genuine iterative tuning, so
they're documented here rather than guessed at:

- Full asset/page caching for offline browsing. The app is installable (real icons, manifest,
  theme color) and shows a friendly offline page instead of a browser error when the network
  drops — but it deliberately does **not** cache menu/price/availability data for offline use,
  since that's live, admin-editable content and showing stale prices offline would be worse
  than showing nothing.
- Google Analytics 4 event tracking (`NEXT_PUBLIC_GA_ID` is wired but unused — add tracking
  calls once you have a GA4 property).
- CI/CD pipeline, custom domain/HTTPS beyond Vercel's default `*.vercel.app` — depends on your
  domain setup (see "Deploying to Vercel" above for the base deployment).
- Redis-backed rate limiting for multi-instance deployments.
- Functional promo-code redemption at checkout (`Offer.code` is modeled but display-only today).

## Troubleshooting

- **"Can't reach database server"** — check `DATABASE_URL` and that PostgreSQL is running.
- **Prisma Client out of date after a schema change** — run `npx prisma generate`.
- **Razorpay checkout doesn't open** — confirm `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set and matches
  `RAZORPAY_KEY_ID`; check the browser console for a blocked/failed script load.
- **Uploaded images 404 on Vercel** — confirm a Blob store is attached to the project (Storage
  tab) so `BLOB_READ_WRITE_TOKEN` is set. Without it, uploads fall back to local disk, which
  doesn't persist on Vercel's serverless filesystem.
