# Going live checklist

This app runs entirely locally today (SQLite + filesystem storage + dev-only
email logging). Before the real January 1 launch, work through this list.

## 1. Database — swap SQLite for Supabase Postgres

1. Create a Supabase project, grab the Postgres connection string.
2. `npm install @prisma/adapter-pg pg`
3. In `prisma/schema.prisma`, change `datasource db { provider = "sqlite" }`
   to `provider = "postgresql"`.
4. In `src/lib/prisma.ts`, swap `PrismaBetterSqlite3` for `PrismaPg` from
   `@prisma/adapter-pg`, pointed at `process.env.DATABASE_URL`.
5. Set `DATABASE_URL` in your production env to the Supabase connection
   string, then run `npx prisma migrate deploy`.
6. Run `npm run seed` once against production to create real committee
   accounts — **immediately change the printed placeholder emails/passwords**
   in `prisma/seed.ts` first, or create accounts directly in the DB.

## 2. File storage — swap local disk for Supabase Storage (or S3)

`src/lib/storage.ts` has exactly two functions (`saveFile`, `readStoredFile`).
Replace their bodies with Supabase Storage (or S3) calls; nothing else in
the app needs to change since callers only ever see an opaque `storagePath`.

## 3. Email — Resend

1. Create a Resend account, verify a sending domain (e.g. `scholarship.bendlapineschools.org` or similar).
2. Set `RESEND_API_KEY` and `EMAIL_FROM` (using the verified domain) in
   production env vars. Once `RESEND_API_KEY` is set, `src/lib/email.ts`
   automatically sends real emails instead of writing to `.dev-emails/`.

## 4. Auth

- Generate a fresh `AUTH_SECRET` for production: `openssl rand -base64 32`.
- Set `APP_URL` to the real production URL (used to build recommender links
  in emails).

## 5. Reminder cron

`POST /api/cron/reminders` (guarded by the `CRON_SECRET` env var, sent as
`Authorization: Bearer <CRON_SECRET>`) checks for recommenders who haven't
submitted 7+ days after their invite and sends one reminder each.

If deploying to Vercel, add a `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/reminders", "schedule": "0 13 * * *" }]
}
```

Vercel Cron calls the route without custom headers, so either switch the
route to check a query param/Vercel's own cron auth, or trigger it from an
external scheduler that can send the `Authorization` header. Test locally
with:

```
curl -X POST http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

## 6. Branding

Drop the real BLPS logo file into `public/` and swap the placeholder markup
in `src/components/Logo.tsx` for an `<Image />` pointing at it.

## 7. Before accepting real applications

- Replace the placeholder committee member names/emails in
  `prisma/seed.ts` (or create accounts directly) and distribute real
  credentials securely (not over plain email).
- Confirm `unweightedGpa` minimum (3.0) and essay word bounds (250–500) in
  `src/lib/validation.ts` still match the final scholarship rules.
- Load-test file uploads if you expect many simultaneous submissions near
  the deadline.
