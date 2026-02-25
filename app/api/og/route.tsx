import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const puzzleNumber = searchParams.get("n") ?? "?";
  const score = searchParams.get("s") ?? "?/6";
  const grid = searchParams.get("g") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "monospace",
          gap: "24px",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: "bold" }}>PixelGuess</div>
        <div style={{ fontSize: 36 }}>
          #{puzzleNumber} — {score}
        </div>
        <div style={{ fontSize: 48, letterSpacing: "8px" }}>{grid}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
