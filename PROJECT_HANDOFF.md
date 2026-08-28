# SALKAY Project Handoff

Checkpoint for continuing SALKAY in another Cursor account. This file contains no secrets.

## Project

- **SALKAY website** plus internal admin CRM / outreach system
- **Stack:** Next.js 16.3.3 (App Router), React 19, TypeScript, Tailwind 4, Prisma 6.16.3, Zod, bcryptjs
- **GitHub:** https://github.com/DMSMart24/salkay
- **Vercel project name:** `salkay` (org `projekts1`)
- **Production URL:** https://salkay.vercel.app
- **Public site language:** Turkish (`src/i18n/dictionaries/tr.ts`)
- **Admin UI language:** Turkish labels, mixed DE/EN nav (Dashboard, Firmen, Gruppen, E-Mails, Vorlagen, Inbox, Sperrliste, Einstellungen)

## Public Website

Dark premium marketing site. Homepage flow: Hero → Marquee → ServicesBento (`#hizmetler`) → Process → KayStory → HomeContact.

- Do **not** reactivate Three.js / R3F / GLB on the homepage. `kay3dArchived = true` in `src/lib/kay.ts`.
- Do not change hero videos, nav architecture, footer, or archived KAY 3D unless asked.
- Valid service page: `/hizmetler`. Individual `futureRoutes` are not live.
- `robots.ts` disallows `/admin`.
- Public chrome is skipped on admin via `x-salkay-admin` (set in `src/proxy.ts`) and `SiteShell`.
- Next 16 uses `src/proxy.ts` (not `middleware.ts`).

## Admin

`/admin` is the internal **SALKAY Outreach Mail Center**, not a HubSpot-style CRM.

Primary workflow: import companies → group by industry/location → inspect website/contact → select → choose template → queue/send in small batches → track sent / replied / failed → read replies → never contact suppressed companies.

Campaigns and tasks still exist in the database and at `/admin/campaigns` and `/admin/tasks`, but they are **hidden from primary navigation**.

## Authentication

Architecture only — no credentials in this file.

- HTTP-only cookie `salkay_admin_session` (HMAC + DB token hash)
- `src/proxy.ts` redirects `/admin/*` (except login) if the cookie is missing
- `requireAdmin()` in `src/app/admin/(app)/layout.tsx` and on all mutating server actions
- Bootstrap: `src/lib/admin/bootstrap.ts` + `readEnvValue` in `src/lib/admin/env.ts` (strips quotes/newlines, ignores `[SENSITIVE]` placeholders)
- Do **not** change `AUTH_SECRET`, session code, password hashes, or existing admin users

## Database

- **Neon PostgreSQL** via `DATABASE_URL`
- **Prisma** schema: `prisma/schema.prisma`
- **Migrations:**
  - `prisma/migrations/20260828120000_init` — original CRM
  - `prisma/migrations/20260828210000_outreach_mail_center` — groups, outreach fields, email statuses
- The outreach migration is **additive** (no resets, no deletes). It was applied to the configured Neon database during local Phase 2 work. Do **not** reset Neon. Do **not** delete users, companies, or email history.
- Scripts: `npm run db:generate`, `npm run db:migrate` (`prisma migrate deploy`), `npm run db:seed` (bootstrap admin only; no demo companies)

## Outreach Mail Center

Implemented and present in this checkpoint:

- **Dashboard** (`/admin`): Toplam Firma, Henüz Gönderilmedi, E-posta Gönderildi, Yanıt Geldi, Başarısız, İletişim Kurma; group cards; CTAs Firma İçe Aktar / Yeni Grup
- **Companies** (`/admin/companies`): outreach filters, dense table, bulk select
- **Company detail:** firma bilgileri, website analizi, e-posta geçmişi, notlar; actions send / move group / note / DNC
- **Groups** (`/admin/groups`, `/admin/groups/[id]`): `LeadGroup` model; toolbar select / email / export / add; status filters
- **Imports** (`/admin/companies/import`): JSON + CSV research schema; preview; duplicate detection (domain, email, name+city); default Skip
- **Email center** (`/admin/emails`): single compose, bulk wizard (preview + explicit confirm), sent / failed / drafts
- **Templates** (`/admin/templates`): outreach categories and merge vars `{{companyName}} {{firstName}} {{website}} {{city}} {{industry}}`
- **Inbox** (`/admin/inbox`): Tümü / Yeni Yanıtlar / Okunmamış / Gönderilen / Atanmamış
- **Suppression** (`/admin/suppression`): email/domain, reason, source, date — enforced server-side on every send
- **Outreach statuses:** `NEW | READY | SENT | REPLIED | FAILED | DO_NOT_CONTACT` (separate from old sales-pipeline `Company.status`)
- **Website research fields:** `websiteScore`, `websiteStatus`, `websiteIssues`, `recommendedServices`, `researchSource`, `researchedAt`, `district`
- **Bulk selection:** one / page / all filtered; actions email, add to group, change outreach status, add to Sperrliste

## Email Sending

**LIVE OUTREACH MUST REMAIN DISABLED UNTIL EXPLICITLY ENABLED.**

Bulk confirm currently writes **drafts/queued records**. Real provider send happens only when all of the following are true:

- `OUTREACH_SEND_ENABLED` is exactly `true`
- `RESEND_API_KEY` is set
- `EMAIL_FROM` is set
- the user explicitly confirms

Do not set `OUTREACH_SEND_ENABLED` unless instructed. Do not send real outreach during development or QA.

Single compose can still use Resend if the provider is already configured; treat that as existing production behavior, not a bulk blast.

## Inbound Email

Resend V1 is outbound-only. Inbox sync is **not connected**. The Inbox UI shows: `Gelen e-posta senkronizasyonu henüz bağlı değil.`

When an inbound message is later imported or manually assigned to a company, `outreachStatus` should become `REPLIED`. Sentiment classification is not in V1.

## Environment Variables

Names only. Never commit values. Required/used names:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`
- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `RESEND_API_KEY`
- `OUTREACH_SEND_ENABLED`
- `SEED_DEMO`

`.env`, `.env.local`, and `.vercel` are gitignored. `.env.example` lists names with empty placeholders only.

Production admin secrets are Production-only on Vercel and may appear as `[SENSITIVE]` if pulled. `readEnvValue` ignores those placeholders so bootstrap does not create a fake user from them.

## Production

- **Currently deployed:** earlier SALKAY public site + original admin CRM (dashboard/pipeline/tasks nav). Production login and Neon data already exist.
- **Not deployed:** Outreach Mail Center UI, new nav, groups pages, import, email center, Sperrliste page, company/table/dashboard redesign.
- A Vercel deploy is required before the new admin UI appears in production. **Do not deploy until explicitly asked.**
- If the outreach migration was already applied to Neon during local work, the database may be ahead of the deployed app. That is safe (additive columns). Do not reset the database to “match” the old UI.

## Next Recommended Steps

1. Open and test the new Outreach UI locally (`npm run dev`) after connecting GitHub and env names (not values from this file).
2. Deploy the Outreach UI only when approved.
3. Create the first lead group.
4. Import the first researched leads (JSON/CSV). Confirm preview; no auto-send.
5. Configure the outbound provider (`RESEND_API_KEY`, `EMAIL_FROM`).
6. Perform a 1–5 recipient test only after explicit enablement.
7. Only then consider 20-recipient batches.
8. Connect an inbound email provider when ready.

## Important Safety Notes

- Never reset Neon.
- Preserve the existing admin user and all password hashes.
- Preserve existing email history and companies.
- Do not expose or commit secrets.
- Do not enable real bulk sending accidentally (`OUTREACH_SEND_ENABLED` must stay unset/false until ordered).
- Do not delete Prisma models just because they are hidden from navigation.
- Do not touch the public cinematic website unless asked.
- PowerShell: chain commands with `;`, not `&&`.
- Admin pages: `dynamic = "force-dynamic"`. Form `action={}` handlers must be `(formData: FormData) => Promise<void>`.

## Local QA at this checkpoint

- `npm run lint` — pass
- `npm run typecheck` (`tsc --noEmit`) — pass
- `npm run build` — pass
- No real bulk email sent
- No Vercel deploy from this checkpoint
