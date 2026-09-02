"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { useHeroMedia } from "@/components/home/useHeroMedia";
import {
  defaultHomeStageMedia,
  HOME_STAGE_CUE,
  type HomeStageMediaAsset,
} from "@/lib/home-stage";

type HomeStageMediaProps = {
  asset?: HomeStageMediaAsset;
  label?: string;
};

export function HomeStageMedia({ asset, label }: HomeStageMediaProps) {
  const hero = useHeroMedia();
  const resolved = asset ?? defaultHomeStageMedia(hero.variant, label ?? "");
  const playVideo = resolved.kind === "video" && hero.playVideo;

  return (
    <Reveal delay={HOME_STAGE_CUE.media} className="stage-media-reveal">
      <div className="stage-media">
        {resolved.kind === "video" ? (
          <VideoFrame asset={resolved} playVideo={playVideo} />
        ) : (
          <Image
            src={resolved.poster || resolved.src}
            alt={resolved.label}
            fill
            priority
            sizes="(max-width: 767px) 100vw, min(1200px, 92vw)"
            className="stage-media-frame"
          />
        )}
      </div>
    </Reveal>
  );
}

function VideoFrame({
  asset,
  playVideo,
}: {
  asset: HomeStageMediaAsset;
  playVideo: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playVideo) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    const attempt = video.play();
    if (attempt !== undefined) {
      attempt.catch(() => {
        // Autoplay can be blocked; the matching poster stays visible.
      });
    }
  }, [playVideo, asset.src]);

  return (
    <>
      <Image
        src={asset.poster}
        alt=""
        fill
        priority
        sizes="(max-width: 767px) 100vw, min(1200px, 92vw)"
        className="stage-media-frame stage-media-poster"
      />
      {playVideo ? (
        <video
          key={asset.src}
          ref={videoRef}
          className="stage-media-frame stage-media-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={asset.poster}
          disablePictureInPicture
          disableRemotePlayback
          aria-label={asset.label}
        >
          {asset.srcWebm ? <source src={asset.srcWebm} type="video/webm" /> : null}
          <source src={asset.src} type="video/mp4" />
        </video>
      ) : (
        <span className="sr-only">{asset.label}</span>
      )}
    </>
  );
}
