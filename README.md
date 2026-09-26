# Lixazon

A friendly, high-energy marketplace for buyers and sellers — Next.js App Router, PostgreSQL, Prisma, Stripe test checkout, and light/dark theming.

## Prerequisites

- Node.js 20+
- Docker (for Postgres)

## Setup

```bash
# 1) Start Postgres
docker compose up -d

# 2) Environment
cp .env.example .env
# Edit AUTH_SECRET (required). Stripe keys optional — stub checkout works without them.

# 3) Install, migrate, seed
npm install
npm run db:setup

# 4) Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection (default host port **5433**) |
| `AUTH_SECRET` | JWT signing secret |
| `NEXT_PUBLIC_APP_NAME` | Brand label |
| `STRIPE_SECRET_KEY` | Stripe test secret (`sk_test_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_TEST_STUB` | `true` enables local confirm without live Stripe |

With placeholder Stripe keys, checkout still creates real orders in Postgres via the test stub.

### Stripe webhook (optional)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@example.com` | `password123` |
| Seller | `seller@example.com` | `password123` |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` / `start` | Production |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed catalog |
| `npm run db:setup` | Docker up + migrate + seed |

## Stack

- Next.js 15 App Router + TypeScript + Tailwind CSS v4
- Prisma + PostgreSQL
- REST route handlers under `src/app/api`
- JWT httpOnly cookies (`jose` + `bcryptjs`)
- Stripe PaymentIntents (test mode / stub)

## Features

- Catalog, categories, search filters/sort
- Product variants, reviews (purchase-gated), wishlist
- DB-backed cart, multi-step checkout, order history
- Seller dashboard: products, inventory, orders, store profile
- Light/dark theme with localStorage persistence
