# KAY 3D archived for future reactivation

The live homepage hero is the cinematic video in `public/video/`.
The static 2D still and WebGL KAY remain archived.

**Do not delete** the WebGL implementation. It is paused, not removed.

## Preserved

| Area | Location |
|---|---|
| Production GLB | `public/brand/kay/kay-web.glb` |
| Source GLB | `public/brand/kay/anthropomorphic+fox+3d+model(2).glb` |
| R3F scene | `src/components/brand/Kay3D.tsx` |
| Look / bones | `src/lib/kay-look.ts`, `src/components/brand/useKayLook.tsx` |
| Homepage parallax | `src/components/home/useHeroParallax.ts` (no Three.js) |
| Device / pause | `src/components/brand/useKayDevice.ts` |
| Dynamic loader | `src/components/brand/KayMascot.tsx` |
| Calibration HUD | `src/components/brand/KayLookCalibrate.tsx` |
| Look config | `src/lib/kay.ts` (`kayLook`) |

Three.js packages stay installed.

## Why the homepage does not load it

`kay3dArchived` in `src/lib/kay.ts` is `true`.

While archived:

- `getKayAsset("hero")` returns the 2D still, never `gltf`
- `KayHero` renders `next/image` only (`/brand/kay/kay-hero-still.webp`)
- the homepage must not import `Kay3D` or `KayMascot`
- `useKayDevice` does not probe WebGL, so the homepage creates no WebGL context

## Reactivate

1. Set `kay3dArchived` to `false`
2. Point `KayHero` back at `KayMascot` / `Kay3D`
3. Confirm `getKayAsset("hero")` prefers `kay-web.glb` again
4. Confirm `useKayDevice` resumes the WebGL capability probe
