# Going live checklist

Status: database (Supabase Postgres) and file storage (Supabase Storage) are
both live ✅. Email is still local/dev-only (writes to `.dev-emails/`
instead of sending). Work through the rest of this list before the real
January 1 launch.

## 1. Database — done ✅

Running on Supabase Postgres via `@prisma/adapter-pg`. Two connection
strings matter and are **not interchangeable**:

- **Transaction pooler** (port 6543) — what `DATABASE_URL` is set to. Used
  by the running app (serverless-friendly, short-lived connections).
- **Session pooler** (port 5432, same host) — required for schema changes
  (`prisma db push` / `migrate`). The Transaction pooler silently hangs on
  DDL because it doesn't support the session-level locks Prisma needs.

To change the schema in the future: run `prisma db push` (or `migrate dev`)
with `DATABASE_URL` temporarily pointed at the **session pooler** string,
then leave the app's real `DATABASE_URL` on the transaction pooler.

Committee accounts are seeded (`npm run seed`) — **replace the placeholder
emails/passwords in `prisma/seed.ts`** before real use, and distribute the
printed credentials securely (not over plain email).

## 2. File storage — done ✅

`src/lib/storage.ts` uploads to/downloads from a private Supabase Storage
bucket (`SUPABASE_STORAGE_BUCKET`, default `uploads`) via the service-role
key (`SUPABASE_SERVICE_ROLE_KEY` — server-only, never expose to the
browser). Files are still only ever served through the authenticated
`/api/files/[id]` route, never a public bucket URL.

## 3. Email — Resend (partially done ⚠️)

`RESEND_API_KEY` is set and sending works — but **only to the Resend
account's own signup email** until a sending domain is verified. Real
applicants and recommenders will get nothing until this is done:

1. In the Resend dashboard, go to **Domains → Add Domain**, enter a domain
   you control (a subdomain of the school's domain, or any domain you own).
2. Add the DNS records Resend gives you (SPF/DKIM TXT records, typically)
   wherever that domain's DNS is managed.
3. Once verified, change `EMAIL_FROM` to use an address on that domain
   (e.g. `scholarship@yourdomain.org`) instead of `onboarding@resend.dev`.

## 4. Auth

- Generate a fresh `AUTH_SECRET` for production: `openssl rand -base64 32`.
- Set `APP_URL` to the real production URL (used to build recommender links
  in emails).

## 5. Reminder cron — done ✅

`POST /api/cron/reminders` checks for recommenders who haven't submitted
7+ days after their invite and sends one reminder each. `vercel.json` runs
it daily at 13:00 UTC. Vercel automatically sends
`Authorization: Bearer $CRON_SECRET` on cron-triggered requests when a
`CRON_SECRET` env var is set (which it is) — no extra wiring needed.

Test locally with:

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
