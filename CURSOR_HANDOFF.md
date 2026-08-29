# SALKAY PROJECT HANDOFF

Checkpoint for continuing SALKAY in a **second Cursor account**. This file contains **no secrets**.

`PROJECT_HANDOFF.md` is an **older** checkpoint and is **out of date** on production/email status. Treat **this file** as the current source of truth.

---

## Project

- **SALKAY** — public Turkish marketing site + internal **Outreach Mail Center**
- **Stack:** Next.js **16.3.3** (App Router), React **19.2.8**, TypeScript, Tailwind **4**, Prisma **6.16.3**, Zod, bcryptjs
- **Local folder:** the same existing `SalKay` directory (do not clone a second copy unless asked)
- **Current branch:** `main`
- **GitHub remote:** `https://github.com/DMSMart24/salkay.git` (`origin`)
- **Vercel:** existing project **`salkay`** under org **`projekts1`**
  - Project id (from local `.vercel/repo.json`, gitignored): `prj_7svltn7vFtHGIr77Mx11ArH5JrwY`
- **Next.js 16 note:** routing gate is `src/proxy.ts`, **not** `middleware.ts`. `AGENTS.md` is auto-maintained by `next dev`.
- **PowerShell:** chain commands with `;`, not `&&`.
- **Admin pages:** `dynamic = "force-dynamic"`. Form `action={}` handlers must be `(formData: FormData) => Promise<void>`.

Repository shape (high level):

- `src/app/` — public site + `/admin` App Router
- `src/lib/admin/` — CRM, auth, outreach, email engine
- `src/lib/admin/email/` — restaurant email HTML, assets, localization, render
- `src/components/admin/` — Template Studio, tables, wizards
- `public/email/` — hosted email images
- `prisma/` — schema + migrations

---

## Current production

- **URL:** https://salkay.vercel.app
- **Public site URL in code:** `https://salkay.com` (`src/lib/site.ts`) — registrar DNS is still **not** serving this Next app; `/email/...` 404s on salkay.com
- **Branch:** `main`
- **Last application commit on origin/main at handoff start:** `5def48f970d05e7a2a96e2b513d30d431d169289`  
  `SALKAY restaurant email uses final approved mobile hero`
- **Last known production deploy of that commit:** `dpl_CX1KfMfjTGXwbQme5FgKELF3SJXS` — **READY**, aliased to https://salkay.vercel.app
- Adding this handoff file does **not** require a new deploy.

---

## Admin CRM

Admin is an **Outreach Mail Center**, not a generic HubSpot clone.

Primary loop: import → group → inspect website/contact → select → choose template → preview → queue/send in small batches → track sent / replied / failed → read replies → never contact suppressed addresses.

### Data / stack

- **Neon PostgreSQL** via `DATABASE_URL`
- **Prisma** client: `src/lib/admin/prisma.ts`
- **Session auth:** HTTP-only cookie `salkay_admin_session` (HMAC + DB token hash)
- `src/proxy.ts` redirects `/admin/*` (except `/admin/login`) if the cookie is missing
- `requireAdmin()` on the admin layout and all mutating server actions

### Models / features in use

- **Companies** — firma + website research + outreach status
- **Contacts** — including primary contact
- **Lead Groups** — e.g. live group `İstanbul · Ataşehir · Restoranlar` (do not delete)
- **Outreach statuses:** `NEW | READY | SENT | REPLIED | FAILED | DO_NOT_CONTACT` (separate from sales `Company.status`)
- **Website research:** `websiteScore`, `websiteStatus`, `websiteIssues`, `recommendedServices`, `researchSource`, `researchedAt`, `district`
- **Import** — `/admin/companies/import` (JSON/CSV, duplicate detection)
- **Email Center** — `/admin/emails` (compose + bulk wizard)
- **Templates** — `/admin/templates` + `/admin/templates/[id]` Template Studio
- **Inbox** — `/admin/inbox` (UI exists; Resend V1 inbound sync is **not connected**)
- **Suppression / DNC** — `/admin/suppression` + `/unsubscribe` (enforced on send)

### Primary nav (`src/components/admin/AdminShell.tsx`)

Dashboard · Firmen · Gruppen · E-Mails · Vorlagen · Inbox · Sperrliste · Einstellungen

`/admin/campaigns` and `/admin/tasks` still exist in the DB/routes but are **not** primary nav.

### Current send safety

**`OUTREACH_SEND_ENABLED` must stay unset / not `true` unless Salih explicitly enables live sending.**

Bulk confirm writes drafts unless that flag is exactly `true` **and** Resend + `EMAIL_FROM` are configured **and** the user confirms. Suppression is checked server-side.

---

## Restaurant outreach email

Template name in code: **`RESTORAN — Premium Web Sitesi Analizi`**  
(`RESTAURANT_TEMPLATE_NAME` in `src/lib/admin/email/templates/restaurant.ts`)

Subjects:

- `{{companyName}} web sitesi hakkında kısa bir fikir`
- alt: `{{companyName}} için birkaç dijital geliştirme önerisi`

**Critical preview behavior:** Template Studio / `previewTemplateAction` renders restaurant previews from **`restaurantPremiumSource()`** (code), not from the Neon `EmailTemplate.body`. Do **not** revert this unless asked. Preview does not write the DB and does not send.

Admin preview frames (`src/app/globals.css`): Desktop **700px**, Mobile **390px** (`.admin-email-frame.is-mobile`).

### Desktop (~700px)

- **Keep.** Do **not** replace with the vertical 9:16 artwork.
- Split hero: HTML branding/headline on the left + scene photo on the right
- Left: transparent SALKAY logo, service line, gold gastronomy pill, generic headline *Restoranınızın dijital yüzünü birlikte daha etkileyici hale getirelim.*
- Right image: `{{heroUrl}}` → `/email/restaurant-hero-scene.jpg`
- Landscape reference (not the live right-side crop): `/email/restaurant-hero-banner.jpg`
- Outlook / clients without the mobile media query keep this desktop hero
- Mobile row is wrapped in `<!--[if !mso]><!-->` so Outlook does not show the 9:16 image

### Mobile (~390px)

- **Final approved artwork is completed, committed, and deployed** (commit `5def48f`)
- **One image only.** No extra logo, pill, headline, KAY, badge, icons, or service strip in HTML
- Asset: `{{heroMobileUrl}}` → `/email/restaurant-hero-mobile-final.jpg` (688×1024, ~111 KB)
- CSS: `.salkay-hero-desktop` hidden; `.salkay-hero-mobile` shown at `max-width: 700px`
- Image: `width:100%; max-width:390px; height:auto; display:block`
- **Do not** shrink the desktop landscape hero for mobile
- **Do not** use `/email/restaurant-hero-mobile.jpg` (older art with bottom service strip)

### Intended mobile flow

FINAL 9:16 HERO  
↓  
personalized intro (cream / gold)  
↓  
website analysis card (navy)  
↓  
3 benefits → SALKAY services → gold CTA  
↓  
Salih Kaya signature (small KAY + transparent logo)  
↓  
footer / unsubscribe  

No generic marketing block between hero and personalized intro.

---

## Restaurant personalization

Merge vars built in `src/lib/admin/email/context.ts` (do not hardcode Develi):

| Variable | Source |
|---|---|
| `{{companyName}}` | Company name |
| `{{contactName}}` | Primary contact full name |
| `{{firstName}}` | Primary contact first name |
| `{{companyEmail}}` | General email or primary contact email |
| `{{website}}` | Website |
| `{{district}}` | District |
| `{{city}}` | City |
| `{{industry}}` | Industry |
| `{{score}}` | 1–10 or empty |
| `{{issue_1}}` … `{{issue_4}}` | First four **customer-facing Turkish** issues |
| `{{recommendedServices}}` | Localized services joined with ` · ` |
| `{{companyPhone}}` | Company phone |
| `{{unsubscribeUrl}}` | `/unsubscribe?email=…` on `site.url` |
| `{{salkayPhone}}` | `EMAIL_SALKAY_PHONE` or empty |
| `{{salkayEmail}}` | `info@salkay.com` |
| `{{salkayWebsite}}` | `site.url` |
| `{{ctaUrl}}` | `EMAIL_CTA_URL` or `https://salkay.com/iletisim` |
| `{{logoUrl}}` / `{{logoHeaderUrl}}` / `{{kayUrl}}` / `{{heroUrl}}` / `{{heroMobileUrl}}` | Absolute asset URLs |

Also injected as safe HTML blocks: `{{scoreBlock}}`, `{{issuesBlock}}`, `{{phoneBlock}}`.

**Localization:** `src/lib/admin/email/localize.ts`

- Internal/research `websiteIssues` may be **German**. **Do not overwrite them in Neon.**
- Recipient HTML uses `localizeOutreachIssue(..., "tr")`.
- If a German issue is not mapped, a generic Turkish fallback is used and `issueReviewNeeded` flags it for admin.
- **No German research text may appear in the customer email.**

Missing score → **Analiz devam ediyor** (not a fake number).

---

## Existing restaurant test companies

Live group: **İstanbul · Ataşehir · Restoranlar**. **Do not modify or delete these records.**

Verified read-only at handoff time:

| Company | Score | Location | Recipient email in CRM |
|---|---|---|---|
| Develi Ataşehir | **3 / 10** | Ataşehir, İstanbul | `atasehir@develikebap.com` |
| Fauna | **4 / 10** | Ataşehir, İstanbul | `info@fauna.com.tr` |
| Köz Kanat Ataşehir | **4 / 10** | Ataşehir, İstanbul | `info@kozkanat.com` |
| Beluga Fish Gourmet | **null → Analiz devam ediyor** | Ataşehir, İstanbul | `info@belugabalik.com` |

Develi customer issues (Turkish): görsel tasarımın modernleştirilmesi; içerik yapısı/UX; rezervasyon süreci; marka değerinin dijitalde yansıtılması.

Fauna customer issues (Turkish): görsel sunum; metin/boşluk hataları; dijital marka anlatımı; rezervasyon ve içerik akışı.

---

## Email visual identity

- Dark navy / black (`#07111f`, `#081526`, `#0b1729`)
- Cyan / electric blue (`#16c7ff`, `#1478ff`)
- Premium gold (`#d5aa62`)
- Warm cream (`#f7f1e6`, `#f8f3ea`, `#fffdf8`)
- Official **transparent** SALKAY lockup (not the black official rectangles, not reconstructed typed logos)
- **KAY** mascot (husky / wolf, hoodie, thumbs-up)
- Premium restaurant photography (table, laptop, food, lights)
- Polished, non-generic; email-safe tables + inline CSS only

---

## Email assets

Host (unless `EMAIL_ASSET_BASE_URL` is set): **`https://salkay.vercel.app`**  
Implemented in `emailAssetBaseUrl()` — **do not use salkay.com for image assets until DNS points at Vercel.**

### Currently used by the restaurant template

| Role | Path |
|---|---|
| Desktop scene (right column) | `/email/restaurant-hero-scene.jpg` |
| Desktop landscape reference | `/email/restaurant-hero-banner.jpg` |
| **Final mobile hero** | `/email/restaurant-hero-mobile-final.jpg` |
| Transparent logo (hero/signature/footer) | `/email/salkay-logo-transparent.png` |
| Transparent logo 2x | `/email/salkay-logo-transparent-2x.png` |
| KAY (CTA + signature) | `/email/kay-restaurant.png` |

### Tracked but **not** used by the current restaurant template

| Path | Note |
|---|---|
| `/email/restaurant-hero-mobile.jpg` | Previous mobile art with bottom service strip — **do not use** |
| `/email/restaurant-hero.jpg` | Older interior still |
| `/email/salkay-logo-official*.png` | Black-rectangle lockups — **do not use** |
| `/email/salkay-logo.svg` | Old SVG mark |
| `/email/salkay-logo-transparent-source.png` | Unmodified supplied source |
| `/brand/kay/kay-hero-still.png` | Official KAY still (source for `kay-restaurant.png`) |

### Local untracked — **do not commit**

- `public/email/salkay-logo.png` — reconstructed flat logo. Leave untracked.

---

## Important files

Only paths that exist:

### Restaurant email

- `src/lib/admin/email/templates/restaurant.ts`
- `src/lib/admin/email/assets.ts`
- `src/lib/admin/email/context.ts`
- `src/lib/admin/email/localize.ts`
- `src/lib/admin/email/html.ts`
- `src/lib/admin/email/render.ts`
- `src/lib/admin/email/types.ts`
- `src/lib/admin/email/provider.ts`
- `src/lib/admin/email/resend.ts`
- `src/lib/admin/email/unconfigured.ts`
- `src/lib/admin/email/link.ts`
- `src/lib/admin/merge.ts`
- `public/email/README.md`

### Templates / preview

- `src/app/admin/actions/templates.ts` — restaurant preview uses **code source**
- `src/app/admin/(app)/templates/page.tsx`
- `src/app/admin/(app)/templates/[id]/page.tsx`
- `src/components/admin/TemplateStudio.tsx`

### Outreach / CRM

- `src/lib/admin/outreach.ts`
- `src/app/admin/actions/outreach.ts`
- `src/app/admin/actions/comms.ts`
- `src/app/admin/actions/crm.ts`
- `src/app/admin/actions/import.ts`
- `src/app/admin/actions/groups.ts`
- `src/lib/admin/import.ts`
- `src/lib/admin/queries.ts`
- `src/lib/admin/suppression.ts`
- `src/app/unsubscribe/page.tsx`
- `src/components/admin/UnsubscribeForm.tsx`
- `src/components/admin/BulkSendWizard.tsx`
- `src/components/admin/ComposeEmail.tsx`

### Auth / infra

- `src/proxy.ts`
- `src/lib/admin/session.ts`
- `src/lib/admin/auth.ts`
- `src/lib/admin/bootstrap.ts`
- `src/lib/admin/env.ts`
- `src/lib/admin/crypto.ts`
- `src/lib/admin/prisma.ts`
- `src/app/admin/actions/auth.ts`
- `src/app/admin/login/page.tsx`

---

## Database

- Prisma schema: `prisma/schema.prisma`
- Migrations:
  - `prisma/migrations/20260828120000_init` — original CRM
  - `prisma/migrations/20260828210000_outreach_mail_center` — groups, outreach fields, email statuses (**additive**)
- Scripts: `npm run db:generate`, `npm run db:migrate` (`prisma migrate deploy`), `npm run db:seed` (admin bootstrap only)
- **NEVER** reset Neon / `prisma migrate reset` / drop production data
- **NEVER** run destructive migrations casually
- Preserve users, companies, research, email history, suppressions

Do **not** put `DATABASE_URL` (or any secret) in this file.

---

## Authentication

- Production admin login **works**
- Session cookie architecture is established
- Bootstrap reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` via `readEnvValue` (strips quotes; ignores `[SENSITIVE]` placeholders)
- Do **not** rewrite auth, change `AUTH_SECRET`, or reset password hashes unless explicitly asked
- No passwords or secrets belong in git or this file

---

## Email sending safety

**LIVE OUTREACH STAYS OFF.**

1. Do **not** set `OUTREACH_SEND_ENABLED=true` unless Salih explicitly requests live sending.
2. Do **not** send test, real, or bulk emails automatically.
3. Do **not** use this handoff as permission to send.
4. Suppression, DNC, and unsubscribe must stay enforced.
5. Template preview and QA HTML renders are **not** sends.

At this checkpoint: `OUTREACH_SEND_ENABLED` is **not** present on Vercel Production. Emails sent during this workstream = **0**.

---

## Environment variables

**Names only.** Verify against `.env.example` and code. Never commit values.

| Name | Used for |
|---|---|
| `DATABASE_URL` | Prisma / Neon |
| `AUTH_SECRET` | Session HMAC |
| `ADMIN_EMAIL` | First-admin bootstrap |
| `ADMIN_PASSWORD` | First-admin bootstrap |
| `ADMIN_NAME` | First-admin display name |
| `EMAIL_PROVIDER` | `auto` / `resend` |
| `EMAIL_FROM` | Outbound From |
| `RESEND_API_KEY` | Resend |
| `OUTREACH_SEND_ENABLED` | Live send gate (`=== "true"`) |
| `EMAIL_CTA_URL` | CTA override |
| `EMAIL_SALKAY_PHONE` | Optional signature phone |
| `EMAIL_ASSET_BASE_URL` | Optional image host override |
| `SEED_DEMO` | Seed flag (example only) |
| `NODE_ENV` | Next / Prisma logging |

`.env`, `.env.local`, and `.vercel` are gitignored. `.env.example` has empty placeholders only.

---

## Deployment

- Existing GitHub repo only: `DMSMart24/salkay`
- Existing branch: `main`
- Existing Vercel project only: **`projekts1/salkay`**
- **Do not create another Vercel project**
- Local link: `npx vercel link --yes --project salkay --scope projekts1` if `.vercel` is missing
- Production deploy **only when explicitly requested:**

```text
npx vercel --prod --yes --scope projekts1
```

A handoff commit does **not** require deploy.

---

## Non-negotiable rules

1. Preserve the public SALKAY website (no unsolicited homepage/3D/nav rewrites). Homepage KAY 3D stays archived (`kay3dArchived = true` in `src/lib/kay.ts`).
2. Preserve working admin auth.
3. Preserve Neon production data.
4. Never reset the database.
5. Never expose or commit secrets.
6. Never create another Vercel project.
7. Never enable outreach without explicit instruction.
8. Never send emails without explicit instruction.
9. Preserve Desktop landscape vs Mobile 9:16 restaurant email distinction.
10. Use official transparent SALKAY + KAY assets; do not reconstruct logos.
11. Run `npm run lint`, `npm run typecheck`, `npm run build` before production changes.
12. Prefer incremental changes over rewrites.
13. Restaurant Template Studio must keep using `restaurantPremiumSource()` unless asked to change preview logic.
14. Do not overwrite German `websiteIssues` in the database.

---

## Current next step

**Stopped Saturday 29 August 2026** after the restaurant email visual track.

| Item | Status |
|---|---|
| Desktop landscape restaurant hero | **Completed**, on `main`, in production |
| Personalized cream intro + gift mini-card | **Completed** (`7212301`), in production |
| Final mobile 9:16 hero replacement | **Completed · committed · deployed** |
| Commit | `5def48f970d05e7a2a96e2b513d30d431d169289` |
| Deploy | `dpl_CX1KfMfjTGXwbQme5FgKELF3SJXS` READY on https://salkay.vercel.app |
| Live outreach | **Intentionally disabled** |
| Inbox sync | **Not connected** (known gap, not this task) |
| salkay.com DNS for `/email` assets | **Pending** (assets stay on vercel.app) |

There is **no unfinished restaurant-hero coding task** from this session.

**PENDING (product / ops, not a broken deploy):**

- Enable `OUTREACH_SEND_ENABLED` only if Salih explicitly asks to send
- Point salkay.com DNS at Vercel before switching image host
- Connect inbound email when ready
- Next *product* work is whatever Salih requests next — do not invent a redesign

---

# SECOND CURSOR START HERE

1. Open the **existing** SALKAY project folder (do not create a new repo).
2. Read **this file** (`CURSOR_HANDOFF.md`) completely.
3. Run `git status`.
4. Run `git log -15 --oneline`.
5. Inspect `package.json`.
6. **Do not change anything yet.**
7. Confirm local `main` matches `origin/main`.
8. Never overwrite local work automatically.
9. Never change env values.
10. Never run destructive Prisma commands (`migrate reset`, db wipe, delete restaurant group).
11. Continue from **Current next step** above.

### Suggested first prompt

> Read CURSOR_HANDOFF.md completely and inspect the current repository state. Do not modify anything. Compare the handoff with git status, latest commits and the relevant SALKAY email/CRM files. Then tell me exactly where the previous Cursor stopped, what is already complete, what is pending, and whether the local repository matches origin/main.
