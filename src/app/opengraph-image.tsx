import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#EEF3EE",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              backgroundColor: "#1F4D3F",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            $
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#17262A" }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 34, color: "#52686B", maxWidth: 920 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 26, color: "#1F4D3F", fontWeight: 600 }}>
          Free · No signup · No business registration
        </div>
      </div>
    ),
    { ...size }
  );
}
