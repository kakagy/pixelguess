import type { Metadata } from "next";
import { GameBoard } from "@/components/game/GameBoard";

export const metadata: Metadata = {
  title: "Play | PixelGuess",
  description: "Guess today's pixel art character!",
};

export default function PlayPage() {
  return (
    <main className="container mx-auto max-w-lg px-4">
      <GameBoard />
    </main>
  );
}
