"use client";

import { useRef, useEffect } from "react";

interface PixelCanvasProps {
  src: string;
  resolution: number;
  size: number;
  className?: string;
}

export function PixelCanvas({ src, resolution, size, className }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Draw at low resolution then scale up
      ctx.clearRect(0, 0, size, size);

      // Step 1: Draw image at target resolution into offscreen canvas
      const offscreen = document.createElement("canvas");
      offscreen.width = resolution;
      offscreen.height = resolution;
      const offCtx = offscreen.getContext("2d")!;
      offCtx.imageSmoothingEnabled = false;
      offCtx.drawImage(img, 0, 0, resolution, resolution);

      // Step 2: Scale up to display size with nearest-neighbor
      ctx.drawImage(offscreen, 0, 0, resolution, resolution, 0, 0, size, size);
    };
    img.src = src;
  }, [src, resolution, size]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Pixel art puzzle"
      width={size}
      height={size}
      className={className}
    />
  );
}
