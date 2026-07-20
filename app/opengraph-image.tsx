import { ImageResponse } from "next/og";

export const alt = "BrainrotKit - Create videos from text, PDFs and ideas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0f1113",
        color: "#f7f7f8",
        padding: "64px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 28, fontWeight: 800 }}>
        <div style={{ display: "flex", gap: "5px", width: 44, height: 44 }}>
          <div style={{ flex: 1, borderRadius: 5, background: "#d1fe17" }} />
          <div style={{ flex: 1, marginTop: 12, borderRadius: 5, background: "#f7f7f8" }} />
        </div>
        BR.STUDIO
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", color: "#d1fe17", fontSize: 68, fontWeight: 800, lineHeight: 0.98 }}>
          <span>AI BRAINROT</span>
          <span>VIDEO GENERATOR</span>
        </div>
        <div style={{ color: "#a2a4a7", fontSize: 28 }}>
          Turn text, PDFs and ideas into watchable short-form videos.
        </div>
      </div>
    </div>,
    size,
  );
}
