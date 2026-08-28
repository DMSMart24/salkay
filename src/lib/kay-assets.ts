import { existsSync } from "node:fs";
import path from "node:path";
import {
  kay3dArchived,
  kayFiles,
  kayGlbSrc,
  type KayAsset,
  type KayVariant,
} from "@/lib/kay";

function publicPath(src: string): string {
  return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}

export function getKayAsset(variant: KayVariant): KayAsset {
  const file = kayFiles[variant];
  const glb = publicPath(kayGlbSrc);
  const webp = publicPath(file.src);
  const png = publicPath(file.src.replace(/\.webp$/, ".png"));
  const avif = publicPath(file.src.replace(/\.webp$/, ".avif"));

  // KAY 3D archived for future reactivation — do not prefer the GLB.
  if (!kay3dArchived && variant === "hero" && existsSync(glb)) {
    return {
      ...file,
      src: kayGlbSrc,
      available: true,
      renderer: "gltf",
    };
  }

  if (existsSync(webp)) {
    return { ...file, available: true, renderer: "image" };
  }

  if (existsSync(avif)) {
    return {
      ...file,
      src: file.src.replace(/\.webp$/, ".avif"),
      available: true,
      renderer: "image",
    };
  }

  if (existsSync(png)) {
    return {
      ...file,
      src: file.src.replace(/\.webp$/, ".png"),
      available: true,
      renderer: "image",
    };
  }

  return { ...file, available: false, renderer: "placeholder" };
}
