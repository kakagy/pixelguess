"use client";
import { useRef, useEffect } from "react";
import type { AvatarSeed, ClassName } from "@/lib/rpg/types";
import { getSpriteUrls } from "@/lib/rpg/avatar-composer";

interface Props {
  seed: AvatarSeed;
  className: ClassName;
  size?: number; // display size, default 128
}

export function AvatarDisplay({ seed, className, size = 128 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false; // nearest-neighbor for pixel art
    ctx.clearRect(0, 0, size, size);

    const urls = getSpriteUrls(seed, className);
    let loaded = 0;

    urls.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === urls.length) {
          // Redraw all in order once all loaded
          ctx.clearRect(0, 0, size, size);
          urls.forEach((u) => {
            const layerImg = new Image();
            layerImg.onload = () => {
              ctx.drawImage(layerImg, 0, 0, size, size);
            };
            layerImg.src = u;
          });
        }
      };
      img.src = url;
    });
  }, [seed, className, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="pixelated"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
