# SALKAY PROJECT HANDOFF

Checkpoint for continuing SALKAY in a **second Cursor account**. This file contains **no secrets**.

`PROJECT_HANDOFF.md` is an **older** checkpoint and is **out of date**. Treat **this file** as the current source of truth.

---

## Overnight checkpoint — 2 September 2026

Worked from **current `origin/main` only**. Did **not** rebase or merge the stale open PRs.

| Item | Value |
|---|---|
| **`origin/main` HEAD at start of this night** | `71d354f7befe34cc7f14e3a99f770bdade71e5a2` |
| **Message** | `feat(outreach): persist industry email templates and restaurant wave-2 tooling` |
| **This continuation branch** | `cursor/bar-email-handoff-9a9d` |
| **Live site** | https://salkay.vercel.app |
| **Public copy** | Turkish (unchanged this night) |
| **`kay3dArchived`** | **`true`** in `src/lib/kay.ts` — do not reactivate 3D |
| **`OUTREACH_SEND_ENABLED`** | **Still off.** Do not set. Do not send email. |
| **Neon / auth / env / Prisma migrations** | **Untouched** |
| **Hero videos** | **Untouched** |
| **Production deploy** | **Not done.** Do not deploy unless Salih asks. |

### What is already on `main` (do not rewrite)

Salih’s newer work is **already merged to `main`**. It is the source of truth for the public site, restaurant v2, industry templates, and wave-2 tooling:

| Commit | What landed |
|---|---|
| `90cc213` | Finalize SALKAY public website and contact flow |
| `b619561` | Refresh public site visual system |
| `6749726` | Simplify homepage brand statement |
| `3edce75` | Restaurant lead qualification |
| `ca352ab` | Shorten restaurant analysis email |
| `58629ed` | Refine restaurant analysis email (current restaurant v2) |
| `5608712` | Descriptive sender name |
| `e3b705d` | Persist public site, contact packages, and web-tasarım work |
| `71d354f` | Persist industry premium email templates + restaurant wave-2 tooling |

Restaurant email on `main` is **v2**: own CSS (not `PREMIUM_EMAIL_CSS`), cream intro, navy analysis card, WhatsApp CTA, compact text mobile header. **Do not** rebase stale email PRs over this.

Industry premium templates on `main`: construction, architecture, real estate, hotel, automotive (`src/lib/admin/email/templates/premium-industry.ts` + `premium-kind.ts` + `premium-source.ts`). They share `PREMIUM_EMAIL_CSS` but use **placeholder heroes** (no photo split). Do not invent industry art.

Wave-2 tooling on `main` (scripts only; do not run against Neon unless Salih asks):

- `scripts/seed-restaurant-leads-wave2.ts`
- `scripts/preview-prod-restaurant-mail.ts`
- `scripts/restaurant-email-v2-qa.ts`

### Open PRs — do not merge

| PR | Branch | Status | Action |
|---|---|---|---|
| **#1** | `cursor/public-site-email-premium-1bbd` | **DIRTY / CONFLICTING** | Do **not** merge. Superseded by Salih’s public-site finalize on `main`. |
| **#2** | `cursor/email-port-site-polish-798f` | **DIRTY / CONFLICTING** | Do **not** merge. Do **not** rebase-merge over Salih’s restaurant v2 / industry / public-site work. Used only as a **reference** for the bar hero-split wiring. |

### What this new PR contains

Port of **only** the missing bar / premium-shell mobile–desktop hero split onto current `main`:

1. `barPremiumSource()` now calls `mobileHeroHtml("SALKAY — Bar ve gece hayatı için dijital çözümler")`.
2. Desktop bar hero row is `tr.salkay-hero-desktop`.
3. `PREMIUM_EMAIL_CSS` hides `.salkay-hero-mobile` by default and, at `max-width: 700px`, hides the desktop hero and shows the mobile hero.

**Left alone on purpose**

- Restaurant v2 (`src/lib/admin/email/templates/restaurant.ts`)
- Industry template markup / copy
- Public site (pages, videos, Logo, PageHero, blog, projeler)
- Gift-card / signature / gold-border polish that PR #2 also attempted
- Email assets (no new art). Bar mobile stays `/email/bar-kay-hero.jpg` until a dedicated 9:16 exists
- Env, Neon, Prisma, auth, send gate, 3D

---

## Project

- **SALKAY** — public Turkish marketing site + internal **Outreach Mail Center**
- **Stack:** Next.js **16.3.3** (App Router), React **19.2.8**, TypeScript, Tailwind **4**, Prisma **6.16.3**, Zod, bcryptjs
- **GitHub remote:** `https://github.com/DMSMart24/salkay.git` (`origin`)
- **Vercel:** existing project **`salkay`** under org **`projekts1`**
- **Next.js 16 note:** routing gate is `src/proxy.ts`, **not** `middleware.ts`. `AGENTS.md` is auto-maintained by `next dev`.
- **PowerShell:** chain commands with `;`, not `&&`.
- **Admin pages:** `dynamic = "force-dynamic"`. Form `action={}` handlers must be `(formData: FormData) => Promise<void>`.

Repository shape (high level):

- `src/app/` — public site + `/admin` App Router
- `src/lib/admin/` — CRM, auth, outreach, email engine
- `src/lib/admin/email/` — restaurant / bar / industry email HTML, assets, localization, render
- `src/components/admin/` — Template Studio, tables, wizards
- `public/email/` — hosted email images
- `prisma/` — schema + migrations
- `scripts/` — restaurant QA / wave-2 seed helpers (do not run against production unless asked)

---

## Current production

- **URL:** https://salkay.vercel.app
- **Public site URL in code:** `https://salkay.com` (`src/lib/site.ts`) — registrar DNS is still **not** serving this Next app; `/email/...` 404s on salkay.com
- **Branch:** `main`
- **Last application commit on origin/main at this checkpoint:** `71d354f7befe34cc7f14e3a99f770bdade71e5a2`
- This night’s PR is **not** deployed. A handoff / bar-hero-split commit does **not** require a new deploy.

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

## Restaurant outreach email (current `main` — v2)

Template name in code: **`RESTORAN — Premium Web Sitesi Analizi`**  
(`RESTAURANT_TEMPLATE_NAME` in `src/lib/admin/email/templates/restaurant.ts`)

Subjects **on current main** (`58629ed` / `ca352ab`):

- `{{companyName}} için kısa bir web analizi`
- alt: `{{companyName}} web sitesi için 3 geliştirme fikri`

**Critical preview behavior:** Template Studio / `previewTemplateAction` renders restaurant previews from **`restaurantPremiumSource()`** (code), not from the Neon `EmailTemplate.body`. Do **not** revert this unless asked. Preview does not write the DB and does not send.

Restaurant HTML has **its own `<style>`** — it does **not** use `PREMIUM_EMAIL_CSS`. Shell CSS changes must not be treated as restaurant redesign.

Admin preview frames (`src/app/globals.css`): Desktop **700px**, Mobile **390px** (`.admin-email-frame.is-mobile`).

### Desktop (~700px)

- **Keep.** Split hero: HTML branding/headline on the left + scene photo on the right
- Left: transparent SALKAY logo, service line, gold gastronomy pill, generic headline *Restoranınızın dijital yüzünü birlikte daha etkileyici hale getirelim.*
- Right image: `{{heroUrl}}` → `/email/restaurant-hero-scene.jpg`
- Landscape reference (not the live right-side crop): `/email/restaurant-hero-banner.jpg`
- Outlook / clients without the mobile media query keep this desktop hero

### Mobile (~390px) — current v2

Salih’s refine **replaced** the old single 9:16 image-only mobile hero with a **compact text header** (`mobileHero()` in `restaurant.ts`): SALKAY wordmark line, service line, gastronomy line, one supporting sentence. CSS still hides `.salkay-hero-desktop` and shows `.salkay-hero-mobile` at `max-width: 700px`.

- Do **not** restore the old 9:16-image-only mobile restaurant hero unless Salih asks
- `/email/restaurant-hero-mobile-final.jpg` still exists as an asset; current restaurant v2 source does not use it
- **Do not** use `/email/restaurant-hero-mobile.jpg` (older art with bottom service strip)

### Current restaurant flow

compact mobile header **or** desktop split hero  
↓  
personalized cream intro (`{{analysisIntro}}`)  
↓  
website analysis card (navy): score / kısa analiz / 3 geliştirmeler  
↓  
WhatsApp CTA  
↓  
Salih Kaya signature (transparent logo)  
↓  
footer / unsubscribe  

---

## Bar outreach email

Template name: **`BAR — Premium Web Sitesi Analizi`**  
(`BAR_TEMPLATE_NAME` in `src/lib/admin/email/templates/bar.ts`)

- Subject: `{{companyName}} web sitesi hakkında kısa bir fikir`
- Uses **`PREMIUM_EMAIL_CSS`** + shared shell blocks
- Dark navy layout (intro + audit side by side, benefits, services, CTA, signature)
- Desktop hero: full-width `{{heroUrl}}` → `/email/bar-kay-hero.jpg`
- Mobile hero (this PR): `mobileHeroHtml(...)` → `{{heroMobileUrl}}` which is **also** `/email/bar-kay-hero.jpg` until a dedicated 9:16 exists
- Context: `buildBarEmailContext()` already sets both `heroUrl` and `heroMobileUrl`

**Structure over inventing art.** Do not generate a new bar 9:16 unless Salih supplies one.

---

## Industry premium templates

Kinds in `premium-kind.ts`: `construction` | `architecture` | `realEstate` | `hotel` | `automotive`.

- Shared shell + `industryPremiumSource(spec)` in `premium-industry.ts`
- Placeholder hero (`industryHeroPlaceholderHtml`) — **no** `salkay-hero-desktop` / `salkay-hero-mobile` rows
- Adding hero hide/show rules to `PREMIUM_EMAIL_CSS` does not change industry markup
- Do not invent testimonials, metrics, or industry hero photography

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
| `{{ctaUrl}}` | WhatsApp when phone is configured; else `EMAIL_CTA_URL` or `https://salkay.com/iletisim` |
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

Verified read-only at an earlier handoff (re-verify before any send):

| Company | Score | Location | Recipient email in CRM |
|---|---|---|---|
| Develi Ataşehir | **3 / 10** | Ataşehir, İstanbul | `atasehir@develikebap.com` |
| Fauna | **4 / 10** | Ataşehir, İstanbul | `info@fauna.com.tr` |
| Köz Kanat Ataşehir | **4 / 10** | Ataşehir, İstanbul | `info@kozkanat.com` |
| Beluga Fish Gourmet | **null → Analiz devam ediyor** | Ataşehir, İstanbul | `info@belugabalik.com` |

Wave-2 seed script exists (`scripts/seed-restaurant-leads-wave2.ts`) — **do not run against Neon** unless Salih asks.

---

## Email visual identity

- Dark navy / black (`#07111f`, `#081526`, `#0b1729`)
- Cyan / electric blue (`#16c7ff`, `#1478ff`)
- Premium gold (`#d5aa62`)
- Warm cream (`#f7f1e6`, `#f8f3ea`, `#fffdf8`)
- Official **transparent** SALKAY lockup in email (`/email/salkay-logo-transparent.png`) — not the black official rectangles, not reconstructed typed logos
- **KAY** mascot (husky / wolf, hoodie, thumbs-up)
- Public copy stays **Turkish**
- No invented testimonials or metrics
- Email-safe tables + inline CSS only

---

## Email assets

Host (unless `EMAIL_ASSET_BASE_URL` is set): **`https://salkay.vercel.app`**  
Implemented in `emailAssetBaseUrl()` — **do not use salkay.com for image assets until DNS points at Vercel.**

| Role | Path |
|---|---|
| Restaurant desktop scene (right column) | `/email/restaurant-hero-scene.jpg` |
| Restaurant desktop landscape reference | `/email/restaurant-hero-banner.jpg` |
| Restaurant mobile 9:16 (asset on disk; **not** used by current restaurant v2 source) | `/email/restaurant-hero-mobile-final.jpg` |
| Bar desktop + current bar mobile | `/email/bar-kay-hero.jpg` |
| Transparent logo (email hero/signature/footer) | `/email/salkay-logo-transparent.png` |
| Transparent logo 2x | `/email/salkay-logo-transparent-2x.png` |
| KAY (CTA + signature) | `/email/kay-restaurant.png` |

### Tracked but **not** used by current restaurant v2 source

| Path | Note |
|---|---|
| `/email/restaurant-hero-mobile.jpg` | Previous mobile art with bottom service strip — **do not use** |
| `/email/restaurant-hero.jpg` | Older interior still |
| `/email/salkay-logo-official*.png` | Black-rectangle lockups — **do not use in email** |
| `/email/salkay-logo.svg` | Old SVG mark |
| `/email/salkay-logo-transparent-source.png` | Unmodified supplied source |

### Local untracked — **do not commit**

- `public/email/salkay-logo.png` — reconstructed flat logo. Leave untracked.

---

## Important files

### Email sources

- `src/lib/admin/email/templates/restaurant.ts` — restaurant v2 (own CSS)
- `src/lib/admin/email/templates/bar.ts` — bar premium (shell CSS)
- `src/lib/admin/email/templates/premium-shell.ts` — shared CSS + `mobileHeroHtml`
- `src/lib/admin/email/templates/premium-industry.ts` — industry specs + source
- `src/lib/admin/email/templates/premium-kind.ts`
- `src/lib/admin/email/templates/premium-source.ts`
- `src/lib/admin/email/assets.ts`
- `src/lib/admin/email/context.ts`
- `src/lib/admin/email/localize.ts`
- `src/lib/admin/email/html.ts`
- `src/lib/admin/email/render.ts`
- `src/lib/admin/email/provider.ts`
- `public/email/README.md`

### Templates / preview

- `src/app/admin/actions/templates.ts` — code-backed premium preview
- `src/app/admin/(app)/templates/page.tsx`
- `src/app/admin/(app)/templates/[id]/page.tsx`
- `src/components/admin/TemplateStudio.tsx`

### Outreach / CRM

- `src/lib/admin/outreach.ts`
- `src/app/admin/actions/outreach.ts`
- `src/app/admin/actions/comms.ts`
- `src/components/admin/BulkSendWizard.tsx`
- `src/components/admin/ComposeEmail.tsx`

### Auth / infra

- `src/proxy.ts`
- `src/lib/admin/session.ts`
- `src/lib/admin/auth.ts`
- `src/lib/admin/env.ts`
- `src/lib/admin/prisma.ts`
- `src/lib/kay.ts` — `kay3dArchived = true`

---

## Database

- Prisma schema: `prisma/schema.prisma`
- **NEVER** reset Neon / `prisma migrate reset` / drop production data
- **NEVER** run destructive migrations casually
- Preserve users, companies, research, email history, suppressions
- This night: **no schema / migration changes**

Do **not** put `DATABASE_URL` (or any secret) in this file.

---

## Authentication

- Production admin login **works**
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
- Production deploy **only when explicitly requested**

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
9. Preserve restaurant v2 on `main` (do not overwrite with stale PR #1 / #2 email HTML).
10. Use official transparent SALKAY + KAY assets in email; do not reconstruct logos.
11. Run `npm run lint`, `npm run typecheck`, `npm run build` before production changes.
12. Prefer incremental changes over rewrites.
13. Restaurant Template Studio must keep using `restaurantPremiumSource()` unless asked to change preview logic.
14. Do not overwrite German `websiteIssues` in the database.
15. Public copy stays Turkish. No invented testimonials or metrics.
16. Do not merge PR #1 or PR #2.

---

## Current next step

**Morning review of this PR only.** Do not invent new product work. Do not merge to `main` unless Salih asks. Do not merge PR #1 or PR #2.

| Item | Status |
|---|---|
| Public site finalize | **On `main`** (`90cc213` + persist `e3b705d`) |
| Restaurant email v2 refine | **On `main`** (`ca352ab`, `58629ed`) |
| Industry premium templates + wave-2 tooling | **On `main`** (`71d354f`) |
| PR #1 / PR #2 | **STALE / DIRTY** — do not merge |
| Bar desktop/mobile hero **structure** | **This PR** — `mobileHeroHtml` + shell CSS hide/show |
| Dedicated bar 9:16 artwork | **Pending asset** — still `/email/bar-kay-hero.jpg` |
| Live outreach | **Intentionally disabled** |
| Inbox sync | **Not connected** (known gap, not this task) |
| salkay.com DNS for `/email` assets | **Pending** (assets stay on vercel.app) |
| 3D / KAY GLB | **Archived** (`kay3dArchived = true`) |

**PENDING (product / ops, not a broken deploy):**

- Salih morning review of **this** PR. Merge only if he asks.
- Enable `OUTREACH_SEND_ENABLED` only if Salih explicitly asks to send
- Point salkay.com DNS at Vercel before switching image host
- Connect inbound email when ready
- Next *product* work is whatever Salih requests next — do not invent a redesign

---

# SECOND CURSOR START HERE

1. Open the **existing** SALKAY project folder (do not create a new repo).
2. Read **this file** (`CURSOR_HANDOFF.md`) completely — especially **Overnight checkpoint**.
3. Run `git fetch origin main` and confirm `origin/main` HEAD. If Salih pushed again, start from that, not from a stale PR.
4. Run `git status` and `git log -15 --oneline`.
5. **Ignore PR #1 and PR #2** except as historical reference. Both are DIRTY.
6. Inspect `package.json`.
7. **Do not change anything yet** until you know whether Salih merged this morning PR or pushed more `main`.
8. Never overwrite local work automatically.
9. Never change env values. Never set `OUTREACH_SEND_ENABLED`.
10. Never run destructive Prisma commands (`migrate reset`, db wipe, delete restaurant group).
11. Continue from **Current next step** above.
12. `kay3dArchived` stays `true`. No GLB/3D on the homepage. No live send. No production deploy unless asked.

### Suggested first prompt

> Read CURSOR_HANDOFF.md completely and inspect the current repository state. Do not modify anything. Confirm origin/main HEAD, that PR #1 and PR #2 are still stale/dirty, and whether the bar-hero-split morning PR was merged. Then tell me exactly where the previous Cursor stopped, what is already complete, and what Salih still needs to review.
