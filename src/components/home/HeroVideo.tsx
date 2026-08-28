"use client";

import { useEffect, useRef } from "react";
import { useHeroMedia } from "@/components/home/useHeroMedia";
import { heroMedia, heroVariants } from "@/lib/hero-video";

export function HeroVideo() {
  const hero = useHeroMedia();
  const videoRef = useRef<HTMLVideoElement>(null);
  const asset = heroVariants[hero.variant];

  useEffect(() => {
    if (!hero.playVideo) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const attempt = video.play();
    if (attempt !== undefined) {
      attempt.catch(() => {
        // Autoplay can be blocked; the matching poster stays visible.
      });
    }
  }, [hero.playVideo, hero.variant]);

  return (
    <div
      aria-hidden
      className="hero-video pointer-events-none"
      data-hero-variant={hero.variant}
    >
      <picture>
        <source
          media={heroMedia.desktop}
          srcSet={heroVariants.desktop.poster}
          type="image/webp"
        />
        <source
          media={heroMedia.tabletLandscape}
          srcSet={heroVariants.desktop.poster}
          type="image/webp"
        />
        <source
          media={heroMedia.tabletPortrait}
          srcSet={heroVariants.tablet.poster}
          type="image/webp"
        />
        <img
          src={heroVariants.mobile.poster}
          alt=""
          width={heroVariants.mobile.width}
          height={heroVariants.mobile.height}
          fetchPriority="high"
          decoding="async"
          className="hero-video-frame hero-video-poster"
        />
      </picture>
      {hero.playVideo ? (
        <video
          key={hero.variant}
          ref={videoRef}
          className="hero-video-frame hero-video-el"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={asset.poster}
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src={asset.webm} type="video/webm" />
          <source src={asset.mp4} type="video/mp4" />
        </video>
      ) : null}
      <div className="hero-video-shade" />
      <div className="hero-video-top" />
      <div className="hero-video-bottom" />
    </div>
  );
}
