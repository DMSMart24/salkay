# Homepage release — rollback note

Date: 2026-09-06

## Previous production (rollback target)

- URL: https://www.salkay.com
- Deployment id: `dpl_hdLcHUVnvZmmsiBxHtXxQaYhwf2c`
- Git: `04a69d7d795da3d8e494cdd8eccdea0b22f085e4` (`feat(email): integrate safe premium outreach and follow-up flows`)
- Hero: `HeroExperience` + `HeroVideo`
- Sources:
  - `/video/salkay-hero-desktop.webm` + `.mp4` + `-poster.webp`
  - `/video/salkay-hero-tablet.webm` + `.mp4` + `-poster.webp`
  - `/video/salkay-hero-mobile.webm` + `.mp4` + `-poster.webp`

Rollback: `vercel rollback dpl_hdLcHUVnvZmmsiBxHtXxQaYhwf2c` or `vercel rollback` to the previous production deployment.
