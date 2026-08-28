import { cn } from "@/lib/cn";
import type { KayTone } from "@/lib/kay";

type KayPlaceholderProps = {
  tone?: KayTone;
  className?: string;
};

export function KayPlaceholder({
  tone = "on-dark",
  className,
}: KayPlaceholderProps) {
  const stroke = tone === "on-dark" ? "#8aa6d4" : "#1d5aaa";

  return (
    <svg
      viewBox="0 0 200 280"
      role="img"
      aria-hidden
      className={cn("h-full w-full", className)}
    >
      <title>KAY yer tutucu siluet</title>
      <defs>
        <linearGradient id="kay-fur" x1="20%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#2a303a" />
          <stop offset="55%" stopColor="#141821" />
          <stop offset="100%" stopColor="#0b0e13" />
        </linearGradient>
        <linearGradient id="kay-rim" x1="0%" y1="20%" x2="100%" y2="80%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.85" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <path
        d="M38 214c8 28 28 46 62 46s54-18 62-46c-18 10-40 16-62 16s-44-6-62-16Z"
        fill="#0b0e13"
        opacity="0.35"
      />
      <path
        d="M64 248c10 8 22 12 36 12s26-4 36-12c-10 4-22 7-36 7s-26-3-36-7Z"
        fill="#0b0e13"
        opacity="0.45"
      />

      <path
        d="M148 168c18 10 28 38 18 62-16-8-28-18-34-34-2-8 4-22 16-28Z"
        fill="url(#kay-fur)"
        stroke="url(#kay-rim)"
        strokeWidth="1.2"
      />

      <path
        d="M72 96c-6 36-4 70 4 98 6 20 22 34 36 34 16 0 32-12 38-32 8-28 10-64 2-100-22 8-54 8-80 0Z"
        fill="url(#kay-fur)"
        stroke="url(#kay-rim)"
        strokeWidth="1.15"
      />

      <path d="M78 86 52 28l36 38Z" fill="url(#kay-fur)" />
      <path d="M122 86 154 26l-30 42Z" fill="url(#kay-fur)" />
      <path
        d="M78 86 52 28l36 38 8 8 14-8 16-38-32 42-10 8Z"
        fill="none"
        stroke="url(#kay-rim)"
        strokeWidth="1.1"
      />

      <path
        d="M68 92c8-28 28-46 44-48 18 2 36 18 46 48-16 14-38 20-56 20s-26-6-34-20Z"
        fill="url(#kay-fur)"
        stroke="url(#kay-rim)"
        strokeWidth="1.2"
      />

      <g className="kay-eyes">
        <ellipse cx="92" cy="98" rx="4.2" ry="2.2" fill="#e8eef8" />
        <ellipse cx="120" cy="98" rx="4.2" ry="2.2" fill="#e8eef8" />
        <ellipse cx="92.6" cy="98" rx="1.7" ry="1.7" fill="#1d5aaa" />
        <ellipse cx="120.6" cy="98" rx="1.7" ry="1.7" fill="#1d5aaa" />
      </g>

      <path
        d="M106 108c4 6 10 8 16 6"
        fill="none"
        stroke="#8aa6d4"
        strokeWidth="1"
        opacity="0.55"
      />

      <rect
        x="96"
        y="148"
        width="12"
        height="12"
        rx="2"
        fill="#1d5aaa"
      />
      <rect x="99.5" y="151.5" width="5" height="5" rx="0.6" fill="#f3efe7" />
    </svg>
  );
}
