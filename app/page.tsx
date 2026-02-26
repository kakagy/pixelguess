import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import Link from "next/link";
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

      {/* RPG Feature Section */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="font-mono text-yellow-400 text-sm uppercase tracking-widest mb-3">
            New Feature
          </p>
          <h2 className="font-mono text-4xl font-bold mb-4">
            ⚔️ Pixel RPG Battle
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Build your pixel avatar, challenge other players in real-time
            turn-based battles, collect rare characters via gacha, and climb the
            global leaderboard.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { icon: "🧙", title: "Create Avatar", desc: "Choose class & stats" },
              { icon: "⚔️", title: "Battle", desc: "Real-time PvP fights" },
              { icon: "🎰", title: "Gacha", desc: "Pull rare characters" },
              { icon: "🏆", title: "Leaderboard", desc: "Top 100 rankings" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-mono font-bold text-sm">{item.title}</div>
                <div className="text-gray-400 text-xs mt-1">{item.desc}</div>
              </div>
            ))}
          </div>

          <Link
            href="/rpg"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-mono font-bold text-lg px-8 py-3 rounded-lg transition-colors"
          >
            Play RPG Now →
          </Link>
        </div>
      </section>
    </main>
  );
}
