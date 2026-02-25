import { StatsDisplay } from "@/components/stats/StatsDisplay";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats | PixelGuess",
};

export default function StatsPage() {
  return (
    <main className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="text-3xl font-bold font-mono mb-6">Your Statistics</h1>
      <StatsDisplay />
    </main>
  );
}
