"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DURATION = 84;

const clips = [
  { id: "brand", label: "Marka Filmi", title: "Daha İyi\nBir Yarın", tone: "is-a" },
  { id: "campaign", label: "Kampanya", title: "Harekete\nGeçin", tone: "is-b" },
  { id: "social", label: "Sosyal", title: "Anı\nYakala", tone: "is-c" },
  { id: "ads", label: "Reklam", title: "Görünür\nOlun", tone: "is-d" },
] as const;

export function CreativeVideoPlayer() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const id = window.setInterval(() => {
      setSeconds((current) => (current + 1 >= DURATION ? 0 : current + 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [playing]);

  const selectClip = useCallback((index: number) => {
    setActive(index);
    setPlaying(false);
    setSeconds(0);
    setSettingsOpen(false);
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying((value) => !value);
    setSettingsOpen(false);
  }, []);

  const seek = useCallback((value: number) => {
    setSeconds(Math.max(0, Math.min(DURATION, Math.round(value))));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const node = frameRef.current;
    if (!node) {
      return;
    }

    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void node.requestFullscreen();
  }, []);

  const clip = clips[active] ?? clips[0];
  const progress = (seconds / DURATION) * 100;

  return (
    <div
      ref={frameRef}
      className={`dcr-player ${playing ? "is-playing" : ""}`}
    >
      <div className={`dcr-scene ${clip.tone}`} aria-hidden>
        <span className="dcr-sky" />
        <span className="dcr-ground" />
        <span className="dcr-monolith" />
        <span className="dcr-figure" />
        <span className="dcr-haze" />
      </div>

      <div className="dcr-caption" aria-hidden>
        <p>{clip.label}</p>
        <strong>
          {clip.title.split("\n").map((line) => (
            <span key={line}>{line}</span>
          ))}
        </strong>
        <em>Küçük adımlar, büyük değişim.</em>
      </div>

      <button
        type="button"
        className="dcr-play"
        onClick={togglePlay}
        aria-label={playing ? "Duraklat" : "Oynat"}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M8 6h3v12H8zm5 0h3v12h-3z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M9 7.5v9l8-4.5z" />
          </svg>
        )}
      </button>

      <div className="dcr-controls">
        <label className="dcr-seek">
          <span className="sr-only">Zaman çizelgesi</span>
          <input
            type="range"
            min={0}
            max={DURATION}
            step={1}
            value={seconds}
            onChange={(event) => seek(Number(event.target.value))}
            aria-valuetext={`${formatTime(seconds)} / ${formatTime(DURATION)}`}
          />
          <i style={{ width: `${progress}%` }} />
        </label>
        <div className="dcr-tools">
          <time>{formatTime(seconds)} / {formatTime(DURATION)}</time>
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            aria-label={muted ? "Sesi aç" : "Sesi kapat"}
            aria-pressed={muted}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              {muted ? (
                <path d="M5 10h3l5-4v12l-5-4H5zm11.5 1.5 2 2m0-2-2 2" />
              ) : (
                <path d="M5 10h3l5-4v12l-5-4H5zm10.2-2.2a5 5 0 0 1 0 8.4M17.6 6a8 8 0 0 1 0 12" />
              )}
            </svg>
          </button>
          <div className="dcr-set">
            <button
              type="button"
              onClick={() => setSettingsOpen((value) => !value)}
              aria-expanded={settingsOpen}
              aria-label="Ayarlar"
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M12 4.5v1.6M12 17.9v1.6M4.5 12h1.6M17.9 12h1.6M6.4 6.4l1.1 1.1M16.5 16.5l1.1 1.1M6.4 17.6l1.1-1.1M16.5 7.5l1.1-1.1" />
              </svg>
            </button>
            {settingsOpen ? (
              <ul>
                <li className="is-on">1080p</li>
                <li>720p</li>
                <li>Otomatik</li>
              </ul>
            ) : null}
          </div>
          <button type="button" onClick={toggleFullscreen} aria-label="Tam ekran">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" />
            </svg>
          </button>
        </div>
      </div>

      <ul className="dcr-thumbs">
        {clips.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className={index === active ? "is-on" : ""}
              onClick={() => selectClip(index)}
              aria-pressed={index === active}
              aria-label={`${item.label} önizlemesi`}
            >
              <span className={`dcr-thumb ${item.tone}`} aria-hidden />
              <em>{item.label}</em>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
