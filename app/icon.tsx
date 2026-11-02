import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Ícone principal do app — escudo + capacete, alto contraste */
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
          background: "linear-gradient(145deg, #0f241c 0%, #1e3a2f 55%, #0a1812 100%)",
          position: "relative",
        }}
      >
        {/* Anel de destaque */}
        <div
          style={{
            position: "absolute",
            width: 440,
            height: 440,
            borderRadius: 220,
            border: "6px solid #f5c518",
            opacity: 0.35,
          }}
        />
        {/* Escudo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            width: 320,
            height: 360,
            background: "linear-gradient(180deg, #2a9d6a 0%, #1a6b48 100%)",
            borderRadius: "24px 24px 28px 28px",
            clipPath: "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
            border: "8px solid #f5c518",
            paddingTop: 28,
          }}
        >
          {/* Capacete estilizado */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 120,
                height: 48,
                background: "#f5c518",
                borderRadius: "60px 60px 8px 8px",
                border: "4px solid #1a1714",
              }}
            />
            <div
              style={{
                width: 140,
                height: 16,
                background: "#e8b40a",
                borderRadius: 4,
                marginTop: -4,
                border: "3px solid #1a1714",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: -2,
              textShadow: "0 4px 0 #0f241c",
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
