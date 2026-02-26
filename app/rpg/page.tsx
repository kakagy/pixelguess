"use client";
import { useAvatar } from "@/hooks/useAvatar";
import { AvatarDisplay } from "@/components/rpg/AvatarDisplay";
import { ClassSelect } from "@/components/rpg/ClassSelect";
import { StatsPanel } from "@/components/rpg/StatsPanel";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RPGPage() {
  const { avatar, loading, createAvatar } = useAvatar();
  const router = useRouter();
  const [matchmaking, setMatchmaking] = useState(false);

  const handleBattle = async () => {
    setMatchmaking(true);
    try {
      const res = await fetch("/api/rpg/matchmake", { method: "POST" });
      const data = await res.json();
      if (data.battleId) {
        if (data.status === "matched") {
          router.push(`/rpg/battle/${data.battleId}`);
        } else {
          // Waiting for opponent — poll
          const interval = setInterval(async () => {
            const check = await fetch(`/api/rpg/matchmake`, { method: "POST" });
            const checkData = await check.json();
            if (checkData.status === "matched") {
              clearInterval(interval);
              router.push(`/rpg/battle/${checkData.battleId}`);
            }
          }, 3000);
          // Auto-stop after 60s
          setTimeout(() => {
            clearInterval(interval);
            setMatchmaking(false);
          }, 60000);
        }
      }
    } catch {
      setMatchmaking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl font-mono animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <ClassSelect onSelect={createAvatar} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 font-mono">Pixel RPG</h1>

        <div className="flex justify-center mb-6">
          <AvatarDisplay seed={avatar.seed} className={avatar.className} size={128} />
        </div>

        <StatsPanel avatar={avatar} />

        <div className="mt-6 space-y-3">
          <button
            onClick={handleBattle}
            disabled={matchmaking}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-lg font-bold font-mono text-lg transition-colors"
          >
            {matchmaking ? "Searching for opponent..." : "⚔️ Battle"}
          </button>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => router.push("/rpg/leaderboard")}
              className="py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-mono text-sm transition-colors border border-gray-700"
            >
              Ranking
            </button>
            <button
              onClick={() => router.push("/rpg/gacha")}
              className="py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-mono text-sm transition-colors border border-gray-700"
            >
              Gacha
            </button>
            <button
              onClick={() => router.push("/rpg/shop")}
              className="py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-mono text-sm transition-colors border border-gray-700"
            >
              Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
