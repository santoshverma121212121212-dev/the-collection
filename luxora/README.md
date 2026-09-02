# The Collection — Vercel-ready storefront

Luxury clothing storefront with a protected `/spadmin` administration area and PostgreSQL/Supabase persistence.

## Local development

1. Install Node.js 22.5+ (Node 22 LTS or newer).
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in your values.
4. Run `npm run dev`.

## Vercel deployment

- Frontend build output: `dist`
- API entrypoint: `api/index.ts`
- SPA/admin routes are rewritten to `index.html`
- PostgreSQL is required in Vercel; SQLite is local-development only.

Set these Vercel Production Environment Variables: `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`, `ADMIN_ROLE`, and `NODE_ENV=production`.

Do not commit `.env` or real credentials.

## Admin

Open `/spadmin` directly. There is no public admin navigation link.
