import { ImageResponse } from "next/og";

export const alt = "SALKAY — Bu site, teklifimizin ta kendisi.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0C0F",
          color: "#F2F3F5",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 28,
            letterSpacing: "-0.04em",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 100 100">
            <path d="M50 8 L92 88 L70 88 L50 46 L30 88 L8 88 Z" fill="#F2F3F5" />
            <rect x="37" y="61" width="26" height="11" fill="#0B0C0F" />
          </svg>
          SALKAY
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 920,
            fontSize: 64,
            lineHeight: 0.98,
            letterSpacing: "-0.045em",
          }}
        >
          Bu site, teklifimizin ta kendisi.
        </div>
        <div
          style={{
            display: "flex",
            color: "#49E8FF",
            fontSize: 22,
            letterSpacing: "0.08em",
          }}
        >
          İSTANBUL · DİJİTAL STÜDYO
        </div>
      </div>
    ),
    size,
  );
}
