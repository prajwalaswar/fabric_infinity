# Fabric Infinity

A premium Indian handcrafted fabrics e-commerce store featuring Ajrakh, Ikat, block prints, sarees, dress materials, and dupattas.

## Run & Operate

- **Frontend:** `pnpm --filter @workspace/fabric-infinity run dev` — runs at the `/` preview path
- **API server:** `pnpm --filter @workspace/api-server run dev` — requires `DATABASE_URL`
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- **Required env:** `DATABASE_URL` — Postgres connection string (API server won't start without it; frontend degrades gracefully to static content)

## Stack

- pnpm workspaces, Node.js 20+, TypeScript 5.9
- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui, Cormorant Garamond + DM Sans fonts
- **API:** Express 5, served at `/api`
- **DB:** PostgreSQL + Drizzle ORM
- **Validation:** Zod (`zod/v4`), `drizzle-zod`
- **API codegen:** Orval (from OpenAPI spec in `lib/api-spec`)
- **Payments:** Razorpay (`razorpay` package in api-server)
- **Build:** esbuild (CJS bundle for API)

## Where things live

- `artifacts/fabric-infinity/src/` — React frontend
  - `pages/` — store pages (Home, Shop, ProductDetail, Cart, Checkout, …) + `admin/`
  - `components/layout/StoreLayout.tsx` — Navbar (with mega dropdown menus) + Footer
  - `components/store/ProductCard.tsx` — product card component
  - `index.css` — global CSS, design tokens (colors, fonts)
- `artifacts/api-server/src/` — Express API
  - `routes/` — REST route handlers
  - `app.ts` — Express app setup
- `lib/db/` — Drizzle schema + migrations (source of truth for DB schema)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/` — auto-generated React Query hooks (run codegen to refresh)
- `lib/api-zod/` — auto-generated Zod schemas

## Architecture decisions

- Frontend calls API at `/api` (path-relative, works in both dev and prod via the Replit proxy)
- When the API is unavailable, the homepage falls back to static banner images and gallery photos from `attached_assets/`
- Full category hierarchy is hardcoded in `StoreLayout.tsx` mega menu (Fabrics → subcategories, Dress Materials, Sarees, Dupattas) — update there if categories change
- Product cards show a "Quick Add" button on hover that adds directly to cart without visiting the product page

## Product

An e-commerce store for authentic Indian textiles:
- **Fabrics:** Hand Block Prints (Ajrakh, Indigo, Dabu, Bagru, Kalamkari, …), Handloom (Ikat variants), Plain (cotton, silk), Screen Prints
- **Dress Materials:** Jaipuri, Kota Doria, Modal Silk, Cotton Linen, Maheshwari, Cotton Print suits
- **Sarees:** 9 varieties including Modal Silk, Chanderi, Georgette, Cotton Handblock
- **Dupattas:** Ikkat, Banarasi, Kalamkari, Ajrakh Modal, Bandhani, Brush Print
- Admin panel at `/admin` for managing products, categories, orders, banners

## User preferences

- Design should match FabricRoot.com aesthetic: premium, warm parchment tones, deep navy, serif headings, minimal rounded corners
- Full category hierarchy must be in the nav dropdown mega menus

## Gotchas

- `lib/api-client-react` types are only available after running `pnpm --filter @workspace/api-spec run codegen` — typecheck will fail until the lib is built
- The API server needs `DATABASE_URL` — without it, only the frontend preview works (with static fallback content on the homepage)
- Use `pnpm` not `npm` or `yarn` — the preinstall script enforces this

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
