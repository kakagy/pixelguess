import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PixelGuess — Daily Pixel Art Puzzle",
  description:
    "Guess the pixel art character as the image sharpens. A new puzzle every day. Share your score.",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
    </main>
  );
}
