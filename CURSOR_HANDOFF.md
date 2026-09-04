# SALKAY PROJECT HANDOFF

Checkpoint for continuing SALKAY in a **second Cursor account**. This file contains **no secrets**.

`PROJECT_HANDOFF.md` is an **older** checkpoint and is **out of date** on production/email status. Treat **this file** as the current source of truth.

---

## Overnight checkpoint — 5 September 2026

Work **only** from current `origin/main`. Do **not** merge anything. Do **not** deploy to production. Do **not** send email. Do **not** set `OUTREACH_SEND_ENABLED`.

| Item | Value |
|---|---|
| **GitHub** | `https://github.com/DMSMart24/salkay.git` (`origin`) |
| **Branch** | `main` |
| **HEAD** | `04a69d7d795da3d8e494cdd8eccdea0b22f085e4` |
| **Tip commit** | `feat(email): integrate safe premium outreach and follow-up flows` (Salih, 2026-09-04) |
| **Live** | https://salkay.vercel.app — **leave production alone** |
| **Vercel** | existing project **`salkay`** under org **`projekts1`** |
| **Public copy** | Turkish. No invented testimonials. |
| **KAY 3D** | `kay3dArchived = true` in `src/lib/kay.ts` — **must stay true** |
| **Hero videos** | Do **not** replace (`src/lib/hero-video.ts`, `/public/video/`) |
| **Live send** | `OUTREACH_SEND_ENABLED` is **off**. Emails sent from this workstream = **0**. |

This handoff commit does **not** require a deploy.

---

## What landed on main 2–4 September 2026

Since `71d354f` (`feat(outreach): persist industry email templates and restaurant wave-2 tooling`, 2026-09-02), `main` also has:

| SHA | Date | What |
|---|---|---|
| `4b8798a` | 2026-09-04 | Template safety + rendering: `resolveSendableTemplate`, `claim-safety`, Preview = Compose = Bulk = Send |
| `e492f33` | 2026-09-04 | Redesigned premium industry templates onto **compact outreach** |
| `cfe1a95` | 2026-09-04 | Tightened no-website length and mobile greeting |
| `dd7d174` | 2026-09-04 | Follow-up sequences (steps 0 / 1 / 2) |
| `4b8446e` / `8df2b70` | 2026-09-04 | Restaurant lead **email eligibility** (valid address required) |
| `04a69d7` | 2026-09-04 | Integrated safe premium outreach + follow-up flows (current tip) |

Public site work that is already on `main` (do not reopen unless Salih asks):

- `90cc213` (2026-08-30) — finalize public website and contact flow
- `e3b705d` (2026-09-02) — persist public site, contact packages, and `/web-tasarim`

---

## Project

- **SALKAY** — public Turkish marketing site + internal **Outreach Mail Center**
- **Stack:** Next.js **16.3.3** (App Router), React **19.2.8**, TypeScript, Tailwind **4**, Prisma **6.16.3**, Zod, bcryptjs
- **Local folder:** the same existing `SalKay` directory (do not clone a second copy unless asked)
- **Next.js 16 note:** routing gate is `src/proxy.ts`, **not** `middleware.ts`. `AGENTS.md` is auto-maintained by `next dev`.
- **PowerShell:** chain commands with `;`, not `&&`.
- **Admin pages:** `dynamic = "force-dynamic"`. Form `action={}` handlers must be `(formData: FormData) => Promise<void>`.

Repository shape (high level):

- `src/app/` — public site + `/admin` App Router
- `src/lib/admin/` — CRM, auth, outreach, email engine
- `src/lib/admin/email/` — compact outreach, claim-safety, sequences, render
- `src/components/admin/` — Template Studio, SequencePanel, tables, wizards
- `public/email/` — hosted email images (logo is live; restaurant/bar **hero JPGs are leftover**)
- `prisma/` — schema + migrations

---

## Public site (already finalized on main)

- Dark premium marketing site. Public copy is **Turkish** (`src/i18n/dictionaries/tr.ts`).
- Homepage flow: Hero → Marquee → ServicesBento (`#hizmetler`) → Process → KayStory → HomeContact.
- **`kay3dArchived = true`** in `src/lib/kay.ts`. Do **not** load the GLB or initialize WebGL. See `src/components/brand/archived-3d/README.md`.
- Do **not** replace hero videos, nav, footer, or archived KAY 3D.
- Public site URL in code: `https://salkay.com` (`src/lib/site.ts`). Registrar DNS is still **not** serving this Next app; `/email/...` 404s on salkay.com. Email image host stays `https://salkay.vercel.app` via `emailAssetBaseUrl()`.
- Valid service page: `/hizmetler`. Individual `futureRoutes` are not live.
- `robots.ts` disallows `/admin`.
- Public chrome is skipped on admin via `x-salkay-admin` (set in `src/proxy.ts`) and `SiteShell`.

---

## Email architecture NOW (compact outreach)

Restaurant, bar, and industry premium emails on `main` use **code-backed compact outreach**. They do **not** use the old desktop / 9:16 mobile hero split.

**Preview = Compose = Bulk = Send.** All four paths call `resolveSendableTemplate` then `renderFromTemplate` / `renderPersonalizedEmail`. Admin HTML edits do **not** change send for code-backed premium kinds.

### Core files

| Role | Path |
|---|---|
| Shared compact HTML | `src/lib/admin/email/templates/compact-outreach.ts` |
| Turkish copy specs | `src/lib/admin/email/templates/outreach-copy.ts` |
| Kind resolution | `src/lib/admin/email/templates/premium-kind.ts` |
| Code source + subjects | `src/lib/admin/email/templates/premium-source.ts` |
| Restaurant wrapper | `src/lib/admin/email/templates/restaurant.ts` |
| Bar wrapper | `src/lib/admin/email/templates/bar.ts` |
| Industry wrappers | `premium-industry.ts`, `construction.ts`, `architecture.ts`, `real-estate.ts`, `hotel.ts`, `automotive.ts` |
| Follow-up HTML | `src/lib/admin/email/templates/follow-up-outreach.ts` |
| Follow-up copy | `src/lib/admin/email/templates/follow-up-copy.ts` |
| Preview = send | `src/lib/admin/email/sendable.ts` |
| Render entry | `src/lib/admin/email/render.ts` |
| Claim / leak filter | `src/lib/admin/email/claim-safety.ts` |
| Website copy kinds | `src/lib/admin/email/website-copy.ts` |
| Sequence engine | `src/lib/admin/email/sequence.ts` |
| Restaurant eligibility | `src/lib/admin/email-outreach.ts` |
| Merge context | `src/lib/admin/email/context.ts` |
| Localization | `src/lib/admin/email/localize.ts` |
| Sender display name | `src/lib/admin/email/from.ts` — `SALKAY · Web Tasarım & Dijital Büyüme` |

Tests (already on main):

- `src/lib/admin/email/phase2-safety.test.ts`
- `src/lib/admin/email/phase3-premium.test.ts`
- `src/lib/admin/email/phase4-follow-up.test.ts`
- `src/lib/admin/email-outreach.test.ts`

`npm test` runs those four files.

### Compact layout (current, not the old hero split)

One HTML for desktop and mobile. No 9:16 hero image. No left/right desktop scene.

1. Transparent SALKAY logo + gold eyebrow (`SİZE ÖZEL · KISA DİJİTAL İNCELEME`)
2. Greeting: `Merhaba {{companyName}} Ekibi,`
3. `{{analysisIntro}}` + industry `followOn` (copy kind)
4. Location / website line; no-website note when needed
5. Optional navy analysis card (verified issues + score only)
6. Up to 3 opportunity cards
7. Gold-left offer + WhatsApp CTA (`Ücretsiz örneği görmek istiyorum`)
8. Salih Kaya / SALKAY signature + unsubscribe

Mobile CSS (`max-width: 700px`) tightens the container to **390px**, greeting to **20px**, and makes the CTA full width. Admin preview frames remain Desktop **700px** / Mobile **390px**.

HTML marker: `<!-- salkay-email:{restaurant\|bar\|construction\|architecture\|real-estate\|hotel\|automotive} -->`

### Code-backed kinds

`resolveSendableTemplate` maps name / category / `<!-- salkay-email:… -->` to a kind. If the kind is premium:

- `sourceOfTruth: "code"`
- `editorAffectsSend: false`
- subject + body come from `premiumSubject` / `premiumHtmlSource`

| Kind | Template name | Subject |
|---|---|---|
| `restaurant` | `RESTORAN — Premium Web Sitesi Analizi` | `{{companyName}} için kısa bir web analizi` |
| `bar` | `BAR — Premium Web Sitesi Analizi` | `{{companyName}} için kısa bir dijital not` |
| `construction` | `İNŞAAT — Premium Web Sitesi Analizi` | `{{companyName}} projeleri için birkaç dijital fikir` |
| `architecture` | `MİMARLIK — Premium Web Sitesi Analizi` | `{{companyName}} portföyü için kısa bir not` |
| `realEstate` | `GAYRİMENKUL — Premium Web Sitesi Analizi` | `{{companyName}} için kısa bir dijital değerlendirme` |
| `hotel` | `OTEL — Premium Web Sitesi Analizi` | `{{companyName}} için kısa bir misafir notu` |
| `automotive` | `OTOMOTİV — Premium Web Sitesi Analizi` | `{{companyName}} için kısa bir dijital fikir` |

`custom` templates still use Neon `EmailTemplate.subject` / `.body`.

Restaurant alt subject constant `RESTAURANT_TEMPLATE_SUBJECT_ALT` still exists in code (`{{companyName}} web sitesi için 3 geliştirme fikri`) but **sendable subject is the compact one above**.

### Website copy kinds

`customerWebsiteCopyKind()` in `website-copy.ts`:

| Kind | When | Customer intro |
|---|---|---|
| `verified` | Analysable `websiteStatus` (GOOD / AVERAGE / WEAK / …) | `Web sitenizi sizin için kısaca inceledik.` |
| `not_verified` | `NOT_VERIFIED`, `UNKNOWN`, missing, or non-analysable | `Dijital görünürlüğünüz için bazı geliştirme fırsatları belirledik.` |
| `no_website` | `websiteStatus === "NO_WEBSITE"` | Independent digital presence / modern web opportunity (tightened 4 Sep) |

Score and issue cards are **verified-only**. Missing score → **Analiz devam ediyor** (never a fake number). No-website score label → **Web sitesi bulunamadı**. Template Studio can preview `actual` / `verified` / `not_verified` / `no_website` without writing the DB.

### Claim-safety

`claim-safety.ts` strips internal research before HTML:

- Drop `NOT_VERIFIED`, `live fetch failed`, SSL / certificate, passwords, Prisma / HTTP error codes, Playwright / crawler, `salesPitch`, `leadScore`, `DATABASE_URL`, Resend keys
- German research `websiteIssues` stay in Neon. Recipient HTML uses `localizeOutreachIssue(..., "tr")` then `sanitizeCustomerIssue`
- **No German research text and no internal notes in the customer email**
- `assertNoInternalLeak` is used by tests

### Follow-up sequence (steps 0 / 1 / 2)

`sequence.ts` + `follow-up-outreach.ts`. **No Prisma `sequenceStep` column** — step is inferred from HTML markers (`salkay-email:{kind}-follow-1` / `-follow-2`) or an optional in-memory field.

| Step | What | Timing |
|---|---|---|
| **0** | Initial compact outreach | First send |
| **1** | Short reminder + free-sample CTA button | **3 business days** after step 0 `SENT` |
| **2** | Soft close, link CTA only | **5 calendar days** after step 1 `SENT` |

Stop / skip: archived, `follow-up-stopped` tag, DNC, REPLIED, unsubscribe, suppression, bounce, permanent failure, no usable email, qualified-out. Reply detection is **manual** (Resend inbox sync is **not** connected). `REPLIED` stops follow-up.

Rate limit: `FOLLOW_UP_RATE_LIMIT_MS = 8000` (same 8s bulk throttle). Follow-up subjects: `Re: {original}`. WhatsApp CTA messages are step-specific (`followUpWhatsAppMessage`).

Admin UI: `SequencePanel` on `/admin/companies/[id]` — mark replied / stop follow-up. Preview can render step 0/1/2 via `sequenceStep` form field.

### Historical — old restaurant / bar hero split (do not revive)

The Aug 29 handoff described a **desktop landscape + mobile 9:16-only** restaurant hero. That is **not** the live architecture.

- Restaurant + bar on `main` render `compactOutreachSource` / `renderCompactOutreach`. **No hero `<img>` in the compact HTML.**
- `{{heroUrl}}` / `{{heroMobileUrl}}` are still injected in `context.ts` for leftover merge vars, but compact templates do not print them.
- `src/lib/admin/email/templates/premium-shell.ts` still contains old desktop/mobile hero helpers (`mobileHeroHtml`, gift card). **Nothing imports it.** Do not wire it back unless Salih asks.
- Files on disk (`/email/restaurant-hero-mobile-final.jpg`, `/email/restaurant-hero-scene.jpg`, `/email/bar-kay-hero.jpg`) are **historical assets**. Do not replace, crop, or put them back into HTML in a drive-by change.
- **PR #3** (`cursor/bar-email-handoff-9a9d`) was the bar desktop/mobile hero-split + old handoff. **Obsolete.** Bar was rewritten to compact outreach on `main`.

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

- **Companies** — firma + website research + outreach status + `leadScore` / qualification fields
- **Contacts** — including primary contact
- **Lead Groups** — e.g. live group `İstanbul · Ataşehir · Restoranlar` (do not delete). Also `Barlar` and default industry groups
- **Outreach statuses:** `NEW | READY | SENT | REPLIED | FAILED | DO_NOT_CONTACT` (separate from sales `Company.status`)
- **Website research:** `websiteScore`, `websiteStatus`, `websiteIssues`, `recommendedServices`, `researchSource`, `researchedAt`, `district`
- **Import** — `/admin/companies/import` (JSON/CSV, duplicate detection)
- **Email Center** — `/admin/emails` (compose + bulk wizard)
- **Templates** — `/admin/templates` + `/admin/templates/[id]` Template Studio
- **Restaurant-Leads** — `/admin/restaurant-leads` (filters: top / high / no website / has email / ready to email / top 20 / …)
- **Inbox** — `/admin/inbox` (UI exists; Resend inbound sync is **not connected**)
- **Suppression / DNC** — `/admin/suppression` + `/unsubscribe` (enforced on send)

### Primary nav (`src/components/admin/AdminShell.tsx`)

Dashboard · Firmen · **Restaurant-Leads** · Gruppen · E-Mails · Vorlagen · Inbox · Sperrliste · Einstellungen

`/admin/campaigns` and `/admin/tasks` still exist in the DB/routes but are **not** primary nav.

### Restaurant-Leads

- Page: `src/app/admin/(app)/restaurant-leads/page.tsx`
- Eligibility: `evaluateEmailOutreachEligibility` in `src/lib/admin/email-outreach.ts`
- Blocks: archived, DNC, qualified-out tags (`no-outreach`, `qualified-out`, `qualified_out`), invalid / missing email, suppression
- Lanes: `NO_EMAIL | HAS_EMAIL | READY_TO_EMAIL | CONTACTED`
- Top 20: email-eligible, sorted by `leadScore`, cap 20
- **No live send from this page.** Bulk link goes to `/admin/emails?tab=bulk`, which still drafts unless the send flag is on.

### SequencePanel

- `src/components/admin/SequencePanel.tsx` on the company page
- Shows step 0 / 1 / 2 status (PENDING / READY / SENT / SKIPPED / STOPPED)
- Actions: mark replied · stop follow-up (`follow-up-stopped` tag, clears `nextFollowUpAt`)

### Current send safety

**`OUTREACH_SEND_ENABLED` must stay unset / not `true` unless Salih explicitly enables live sending.**

Gates (all must pass for a real send):

1. `isOutreachSendEnabled()` → `process.env.OUTREACH_SEND_ENABLED === "true"`
2. Resend + `EMAIL_FROM` configured (`getEmailProvider`)
3. User confirm on bulk
4. `evaluateAddressSend` / `evaluateSendEligibility` / `evaluateEmailOutreachEligibility`
5. Suppression + DNC + unsubscribe + archived
6. Bulk / follow-up 8s rate limit

When the flag is off:

- Compose live send returns an error (“Gerçek gönderim kapalı”)
- Bulk confirm writes **DRAFT** rows (`Test modu: … taslak kaydedildi`)
- Template preview and QA HTML renders are **not** sends
- Optional **test** send to a guarded test address exists (`sendTestEmailAction`) — do **not** use it unless Salih asks

Settings page shows `test/taslak (kapalı)` when the flag is off.

---

## Personalization

Merge vars built in `src/lib/admin/email/context.ts` (do not hardcode Develi or any live restaurant):

| Variable | Source |
|---|---|
| `{{companyName}}` | Company name |
| `{{contactName}}` | Primary contact full name |
| `{{firstName}}` | Primary contact first name |
| `{{companyEmail}}` | General email or primary contact email |
| `{{website}}` | Website (omitted from compact location line when `no_website`) |
| `{{district}}` / `{{city}}` / `{{location}}` | Location |
| `{{industry}}` | Industry |
| `{{score}}` | Shown only when verified + score allowed; else empty |
| `{{analysisIntro}}` | Copy-kind intro |
| `{{issue_1}}` … `{{issue_4}}` | First four **customer-facing Turkish** issues (verified only) |
| `{{recommendedServices}}` | Localized services joined with ` · ` |
| `{{companyPhone}}` | Company phone |
| `{{unsubscribeUrl}}` | `/unsubscribe?email=…` on `site.url` |
| `{{salkayPhone}}` | `EMAIL_SALKAY_PHONE` or empty |
| `{{salkayEmail}}` | `info@salkay.com` |
| `{{salkayWebsite}}` | `site.url` |
| `{{ctaUrl}}` | WhatsApp deep link (restaurant/bar/industry) or `EMAIL_CTA_URL` / `https://salkay.com/iletisim` |
| `{{logoUrl}}` / `{{logoHeaderUrl}}` / `{{kayUrl}}` | Absolute asset URLs |
| `{{heroUrl}}` / `{{heroMobileUrl}}` | Still set; **unused** by compact HTML |

Compact render also injects safe HTML blocks: `followOn`, `offer`, `ctaLabel`, `locationLine`, `analysisCard`, `opportunitiesBlock`.

**Localization:** `src/lib/admin/email/localize.ts`

- Internal/research `websiteIssues` may be **German**. **Do not overwrite them in Neon.**
- Recipient HTML uses `localizeOutreachIssue(..., "tr")` then claim-safety.
- If a German issue is not mapped, it is dropped (not leaked).
- **No German research text may appear in the customer email.**

---

## Existing restaurant test companies

Live group: **İstanbul · Ataşehir · Restoranlar**. **Do not modify or delete these records.**

These were last verified read-only at the Aug 29 checkpoint. Treat as **do-not-edit CRM rows**, not as current score truth:

| Company | Location | Recipient email in CRM (do not change) |
|---|---|---|
| Develi Ataşehir | Ataşehir, İstanbul | `atasehir@develikebap.com` |
| Fauna | Ataşehir, İstanbul | `info@fauna.com.tr` |
| Köz Kanat Ataşehir | Ataşehir, İstanbul | `info@kozkanat.com` |
| Beluga Fish Gourmet | Ataşehir, İstanbul | `info@belugabalik.com` |

Do not invent new testimonials or publish these addresses in public copy.

---

## Email visual identity (compact)

- Dark navy / black (`#07111F`, `#081526`, `#0B1729`)
- Cyan (`#16C7FF`)
- Premium gold (`#D5AA62`)
- Official **transparent** SALKAY lockup (not the black official rectangles, not reconstructed typed logos)
- Email-safe tables + inline CSS only
- Compact emails use the **logo**, not KAY / restaurant photography

---

## Email assets

Host (unless `EMAIL_ASSET_BASE_URL` is set): **`https://salkay.vercel.app`**  
Implemented in `emailAssetBaseUrl()` — **do not use salkay.com for image assets until DNS points at Vercel.**

### Used by current compact templates

| Role | Path |
|---|---|
| Transparent logo | `/email/salkay-logo-transparent.png` |
| Transparent logo 2x | `/email/salkay-logo-transparent-2x.png` |

### Historical / leftover (do not put back into compact HTML)

| Path | Note |
|---|---|
| `/email/restaurant-hero-scene.jpg` | Old desktop right-column scene |
| `/email/restaurant-hero-banner.jpg` | Old landscape reference |
| `/email/restaurant-hero-mobile-final.jpg` | Old approved 9:16 mobile hero |
| `/email/restaurant-hero-mobile.jpg` | Even older mobile art with service strip |
| `/email/bar-kay-hero.jpg` | Old bar hero (PR #3 split). Obsolete |
| `/email/salkay-logo-official*.png` | Black-rectangle lockups — **do not use** |
| `/email/kay-restaurant.png` | Still listed in `emailAssets.kay`; compact HTML does not render it |

### Local untracked — **do not commit**

- `public/email/salkay-logo.png` — reconstructed flat logo. Leave untracked.

---

## Important files

Only paths that exist:

### Email engine (current)

- `src/lib/admin/email/templates/compact-outreach.ts`
- `src/lib/admin/email/templates/outreach-copy.ts`
- `src/lib/admin/email/templates/restaurant.ts`
- `src/lib/admin/email/templates/bar.ts`
- `src/lib/admin/email/templates/premium-industry.ts`
- `src/lib/admin/email/templates/premium-kind.ts`
- `src/lib/admin/email/templates/premium-source.ts`
- `src/lib/admin/email/templates/follow-up-outreach.ts`
- `src/lib/admin/email/templates/follow-up-copy.ts`
- `src/lib/admin/email/sendable.ts`
- `src/lib/admin/email/render.ts`
- `src/lib/admin/email/claim-safety.ts`
- `src/lib/admin/email/website-copy.ts`
- `src/lib/admin/email/sequence.ts`
- `src/lib/admin/email/context.ts`
- `src/lib/admin/email/localize.ts`
- `src/lib/admin/email/html.ts`
- `src/lib/admin/email/assets.ts`
- `src/lib/admin/email/from.ts`
- `src/lib/admin/email/provider.ts`
- `src/lib/admin/email/resend.ts`
- `src/lib/admin/email-outreach.ts`

### Templates / preview / send

- `src/app/admin/actions/templates.ts` — preview uses `resolveSendableTemplate` + `renderFromTemplate`
- `src/app/admin/actions/comms.ts` — compose + test send
- `src/app/admin/actions/outreach.ts` — bulk + sequence stop / replied
- `src/app/admin/(app)/templates/page.tsx`
- `src/app/admin/(app)/templates/[id]/page.tsx`
- `src/app/admin/(app)/restaurant-leads/page.tsx`
- `src/components/admin/TemplateStudio.tsx`
- `src/components/admin/SequencePanel.tsx`
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
- Migrations (additive only; **do not add or run new ones in this workstream**):
  - `prisma/migrations/20260828120000_init` — original CRM
  - `prisma/migrations/20260828210000_outreach_mail_center` — groups, outreach fields, email statuses
  - `prisma/migrations/20260901190000_restaurant_lead_qualification` — lead score / qualification
- Scripts: `npm run db:generate`, `npm run db:migrate` (`prisma migrate deploy`), `npm run db:seed` (admin bootstrap only)
- **NEVER** reset Neon / `prisma migrate reset` / drop production data
- **NEVER** run destructive migrations
- Preserve users, companies, research, email history, suppressions

Follow-up **does not** require a new migration: step is inferred from HTML; stop is a company tag (`follow-up-stopped`).

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

At this checkpoint: `OUTREACH_SEND_ENABLED` is **not** `true` on the intended production config. Do not change Vercel env.

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
| `OUTREACH_SEND_ENABLED` | Live send gate (`=== "true"`) — **keep unset** |
| `EMAIL_CTA_URL` | CTA override (premium paths prefer WhatsApp) |
| `EMAIL_SALKAY_PHONE` | Optional signature / WhatsApp number override |
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
- **Do not deploy this handoff (or any overnight PR) to production**
- Local link: `npx vercel link --yes --project salkay --scope projekts1` if `.vercel` is missing
- Production deploy **only when Salih explicitly requests:**

```text
npx vercel --prod --yes --scope projekts1
```

---

## Open PRs — STALE / DIRTY / obsolete — do not merge

All three open PRs **conflict with current `main`**. Do **not** merge, rebase-merge, or push onto their branches.

| PR | Branch | Why dead |
|---|---|---|
| [#1](https://github.com/DMSMart24/salkay/pull/1) | `cursor/public-site-email-premium-1bbd` | Public-site + old premium-email identity. Site already finalized on `main`. **CONFLICTING.** |
| [#2](https://github.com/DMSMart24/salkay/pull/2) | `cursor/email-port-site-polish-798f` | Leftover email polish onto an older main. **CONFLICTING.** |
| [#3](https://github.com/DMSMart24/salkay/pull/3) | `cursor/bar-email-handoff-9a9d` | Bar **desktop/mobile hero split** + old handoff. Bar is compact outreach on `main`. **Obsolete. CONFLICTING.** |

Do **not** open work on those branches. New work (including this handoff) must be a **fresh branch off current `origin/main`**.

---

## Non-negotiable rules

1. Preserve the public SALKAY website. Homepage KAY 3D stays archived (`kay3dArchived = true`).
2. Do not replace hero videos.
3. Public copy stays Turkish. No invented testimonials.
4. Preserve working admin auth. Do not touch Neon / auth / env / Prisma migrations.
5. Never reset the database.
6. Never expose or commit secrets.
7. Never create another Vercel project.
8. Never enable outreach without explicit instruction.
9. Never send emails without explicit instruction.
10. Do **not** revive the old restaurant 9:16 / bar hero-split HTML.
11. Use official transparent SALKAY assets; do not reconstruct logos.
12. Prefer incremental changes over rewrites.
13. Premium Preview / Compose / Bulk / Send must keep using `resolveSendableTemplate` + `renderFromTemplate` unless asked to change that contract.
14. Do not overwrite German `websiteIssues` in the database.
15. Do **not** merge PRs #1, #2, or #3.
16. Do **not** invent new product work unless Salih asks.

---

## Current next step (morning, 5 September 2026)

**Review this handoff PR only.** Confirm `CURSOR_HANDOFF.md` matches `origin/main` @ `04a69d7`.

| Item | Status |
|---|---|
| Public site | **Finalized on main.** Do not reopen. |
| `kay3dArchived` | **true** — leave it |
| Compact outreach (restaurant / bar / industry) | **On main** @ `04a69d7` |
| Claim-safety + sendable render path | **On main** |
| Follow-up sequence 0 / 1 / 2 | **On main** (manual reply detection) |
| Restaurant-Leads + email eligibility | **On main** |
| Live outreach | **Intentionally disabled** |
| Inbox sync | **Not connected** (known gap, not this task) |
| salkay.com DNS for `/email` assets | **Pending** (assets stay on vercel.app) |
| PRs #1 / #2 / #3 | **Stale / dirty / obsolete — do not merge** |
| Production deploy | **Do not deploy** |

**Do not invent new product work unless Salih asks.**

PENDING (ops only, not overnight work):

- Enable `OUTREACH_SEND_ENABLED` only if Salih explicitly asks to send
- Point salkay.com DNS at Vercel before switching image host
- Connect inbound email when ready

---

# SECOND CURSOR START HERE

1. Open the **existing** SALKAY project folder (do not create a new repo).
2. Read **this file** (`CURSOR_HANDOFF.md`) completely.
3. Run `git fetch origin main` and `git log -15 --oneline origin/main`.
4. Confirm `origin/main` is still `04a69d7` **or** read the newer tip and this file’s “what landed” table before coding.
5. Inspect `package.json` and the compact-outreach files listed above.
6. **Do not change anything yet** unless Salih asked for a specific task.
7. Never overwrite local work automatically.
8. Never change env values. Never set `OUTREACH_SEND_ENABLED`.
9. Never run destructive Prisma commands (`migrate reset`, db wipe, delete restaurant group).
10. Do **not** merge PRs #1 / #2 / #3. Do **not** deploy. Do **not** reactivate 3D.
11. Continue from **Current next step** above.

### Suggested first prompt

> Read CURSOR_HANDOFF.md completely and inspect the current repository state. Do not modify anything. Compare the handoff with git status, latest origin/main commits, and the compact-outreach / sendable / sequence files. Then tell me exactly where main is, what is already complete, what the stale PRs are, and whether the local repository matches origin/main.
