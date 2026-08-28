# SALKAY hero video

Keep media queries in `src/app/globals.css` aligned with `src/lib/hero-video.ts`.

## Masters — do not serve these on the homepage

| File | Role | Resolution |
|---|---|---|
| `salkay-hero-v2-master.mp4` | Desktop 16:9 master | 1280×720 |
| `salkay-hero-tablet.mp4.mp4` | Tablet 3:4 master | 834×1112 |
| `salkay-hero-mobile.mp4.mp4` | Mobile 9:16 master | 720×1280 |

## Production loops — one variant mounted at a time

| File | Use |
|---|---|
| `salkay-hero-desktop.webm` / `.mp4` | ≥1280px and tablet landscape |
| `salkay-hero-tablet.webm` / `.mp4` | 768–1279px portrait |
| `salkay-hero-mobile.webm` / `.mp4` | ≤767px |
| `salkay-hero-*-poster.webp` | Matching poster and reduced-motion fallback |

Playback: mount a single optimized loop unless `prefers-reduced-motion: reduce`. The homepage must not request unused variants, the masters, the original source upload, the GLB, or initialize WebGL.
