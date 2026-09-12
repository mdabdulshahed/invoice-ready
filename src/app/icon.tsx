import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1F4D3F",
          color: "#FFFFFF",
          fontSize: 36,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: "50%",
        }}
      >
        $
      </div>
    ),
    { ...size }
  );
}
