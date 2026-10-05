import { ImageResponse } from "next/og";

export const alt = "Rick.build — Websites you can actually click through";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// The Node runtime fails to load the bundled font from paths with spaces on Windows.
export const runtime = "edge";

/** Default social card for every page that doesn't set its own image. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(155deg, #13241f 0%, #0B0D12 60%)",
          color: "#ECEEF3",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36 }}>
          <span style={{ width: 22, height: 22, background: "#4CE8B0", transform: "rotate(45deg)" }} />
          <span>
            Rick<span style={{ color: "#8991A3" }}>.build</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, lineHeight: 1.08, maxWidth: 940 }}>
            Websites you can actually click through, not just look at.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, color: "#4CE8B0" }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: "#4CE8B0" }} />
            LIVE, CLICKABLE DEMOS
          </div>
        </div>
      </div>
    ),
    size
  );
}
