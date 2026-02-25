import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PixelCanvas } from "./PixelCanvas";

afterEach(() => {
  cleanup();
});

describe("PixelCanvas", () => {
  it("renders a canvas element", () => {
    render(<PixelCanvas src="/test.png" resolution={16} size={256} />);
    const canvas = screen.getByRole("img");
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe("CANVAS");
  });

  it("applies correct dimensions", () => {
    render(<PixelCanvas src="/test.png" resolution={16} size={256} />);
    const canvas = screen.getByRole("img") as HTMLCanvasElement;
    expect(canvas.width).toBe(256);
    expect(canvas.height).toBe(256);
  });
});
