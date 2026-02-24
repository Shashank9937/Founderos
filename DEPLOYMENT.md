# Founder AI Agent Operating System Deployment

## Production Deployment (Vercel + Postgres)

1. Provision PostgreSQL (Neon, Supabase, RDS, Render, etc.).
2. Set environment variables in deployment target:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (optional, default `7d`)
   - `APP_URL`
3. Install and build:
```bash
npm install
npm run build
```
4. Apply production migrations:
```bash
npm run prisma:deploy
```
5. Optionally seed production baseline:
```bash
npm run seed
```

## Runtime Requirements
- Node.js 18+
- PostgreSQL 14+

## Security Notes
- JWT auth token is stored in HttpOnly cookie.
- `secure` cookie flag is enabled in production.
- Protected routes and APIs are middleware-gated.

## Post-Deploy Validation
1. Verify login works with seeded account.
2. Verify dashboard loads live metrics.
3. Create a new agent and confirm automatic failure mode generation.
4. Submit automation score and debug diagnostic to verify DB writes.
