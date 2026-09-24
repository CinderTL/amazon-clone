# Lixazon

A full-stack Amazon-style marketplace demo built with **Next.js 15**, **React 19**, **Tailwind CSS v4**, **Prisma**, and **SQLite**.

Original Lixazon branding with marketplace-inspired IA (dark navy masthead, yellow/orange CTAs).

## Quick start

```bash
# Install dependencies
npm install

# Create DB + seed demo data
npm run db:setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

`.env` (created for you):

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="lixazon-dev-secret-change-in-production-32chars"
NEXT_PUBLIC_APP_NAME="Lixazon"
```

## Demo credentials

| Role     | Email                   | Password    |
|----------|-------------------------|-------------|
| Customer | `customer@example.com`  | `password123` |
| Seller   | `seller@example.com`    | `password123` |

Additional seeded sellers: `techvault@example.com`, `homestyle@example.com` (same password).

## What's included

### Consumer
- Homepage with categories, featured products, deals, bestsellers
- Category browse (`/category/[slug]`) with working filters & sort
- Search (`/search`) with category/brand/price/stock filters
- Product detail (`/product/[slug]`) with add-to-cart & reviews
- Cart with qty updates, stock checks
- Checkout with address selection + demo payment
- Order confirmation
- Account hub: orders, profile, addresses, settings

### Seller (`/seller/*`, server-protected)
- Dashboard with revenue metrics & charts (recharts)
- Products CRUD (create / edit / delete — own products only)
- Inventory stock editor
- Orders with status updates
- Store profile
- Account settings

### Auth
- Register (customer or seller), login, logout
- JWT session cookies via `jose`
- bcrypt password hashing
- Middleware + server-side guards on seller/account/cart/checkout routes

### Data
- 10 categories, 36 products, 3 sellers, sample orders & reviews
- Inventory decrements on successful checkout (transactional)

## Scripts

| Script            | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start Next.js dev server             |
| `npm run build`   | Production build                     |
| `npm run start`   | Start production server              |
| `npm run db:setup`| Push schema + seed                   |
| `npm run db:seed` | Re-seed database                     |
| `npm run db:push` | Push Prisma schema only              |

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4
- Prisma + SQLite
- bcryptjs + jose (auth)
- zod (validation)
- lucide-react (icons)
- recharts (seller charts)

## Limitations

- Demo payment only (no real payment processor)
- SQLite is local-file — not for multi-instance production
- Product images use picsum.photos placeholders
- No email notifications or real shipping integration
- Seller order status updates the whole order (multi-seller orders share status)
- Search uses SQLite `contains` (case-sensitive depending on collation)
- "Buy Now" currently adds to cart (same as Add to Cart) — proceed via Cart → Checkout

## Troubleshooting

If `next build` crashes with **Bus error** after a flaky network install, native packages may be truncated. Reinstall them:

```bash
rm -rf node_modules/@next/swc-linux-x64-gnu node_modules/lightningcss-linux-x64-gnu node_modules/@tailwindcss/oxide-linux-x64-gnu
npm install
```

## Design notes

See `amazon.md` and `CAPTURE-TEST.md` for marketplace UI reference notes kept in this repo.
