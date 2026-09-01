# Fabric Infinity — E-Commerce Platform

A full-stack e-commerce website for a fabric/clothing brand built with React + Vite (frontend) and Express + Drizzle ORM (backend), backed by a Replit PostgreSQL database.

## Project structure

```
artifacts/
  fabric-infinity/   # React + Vite storefront (public-facing)
  api-server/        # Express API server
  mockup-sandbox/    # Design canvas (dev only)
lib/
  db/                # Drizzle ORM schema + migrations
  api-zod/           # Shared Zod validation schemas
  api-client-react/  # Generated React Query hooks
  api-spec/          # OpenAPI spec (Orval codegen)
```

## How to run

Both services start automatically via their configured workflows:

- **Storefront** (`artifacts/fabric-infinity: web`): `pnpm --filter @workspace/fabric-infinity run dev`
- **API server** (`artifacts/api-server: API Server`): `pnpm --filter @workspace/api-server run dev`

After merging or reinstalling dependencies, run the DB schema push:

```sh
pnpm --filter @workspace/db run push
```

## Required secrets

| Secret | Purpose |
|---|---|
| `SESSION_SECRET` | Signs session cookies (already set) |
| `ADMIN_PASSWORD` | Password to log in to the admin dashboard at `/admin` |
| `RAZORPAY_KEY_ID` | Razorpay online payment — key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay online payment — key secret |
| `BREVO_API_KEY` | Sends customer email verification OTPs through Brevo |

`DATABASE_URL` is managed automatically by Replit.

## Environment variables (shared)

| Variable | Value |
|---|---|
| `VITE_WHATSAPP_NUMBER` | `918530361444` (WhatsApp support chat widget) |
| `BREVO_SENDER_EMAIL` | Verified Brevo sender address |
| `BREVO_SENDER_NAME` | `Fabric_Infinity` |

## Owner dashboard and image storage

- The owner dashboard is available from the dashboard icon in the storefront header or at `/admin/login`.
- The owner signs in with the `ADMIN_PASSWORD` secret. The session is cookie-based and upload URLs are owner-only.
- New product and banner images upload directly to Replit App Storage, not to MongoDB or a local computer.
- PostgreSQL stores the product/banner metadata and the persistent `/api/storage/objects/...` image URL.
- The legacy `/api/uploads` route remains available only for older images that were already saved on local disk.

## Tech stack

- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query, Wouter
- **Backend**: Node.js, Express 5, Drizzle ORM, PostgreSQL
- **Payments**: Razorpay + Cash on Delivery
- **Monorepo**: pnpm workspaces

## User preferences

<!-- Add any project-specific preferences here -->
