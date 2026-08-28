import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0C0F",
          color: "#F2F3F5",
        }}
      >
        <svg width="92" height="92" viewBox="0 0 100 100">
          <path d="M50 8 L92 88 L70 88 L50 46 L30 88 L8 88 Z" fill="#F2F3F5" />
          <rect x="37" y="61" width="26" height="11" fill="#0B0C0F" />
        </svg>
      </div>
    ),
    size,
  );
}
