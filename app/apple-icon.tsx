import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
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
          background: "linear-gradient(145deg, #0f241c 0%, #1e3a2f 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 120,
            height: 130,
            background: "linear-gradient(180deg, #2a9d6a 0%, #1a6b48 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)",
            border: "5px solid #f5c518",
            paddingTop: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 18,
              background: "#f5c518",
              borderRadius: "22px 22px 4px 4px",
              border: "2px solid #1a1714",
              marginBottom: 4,
            }}
          />
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: -1,
            }}
          >
            SGS
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
