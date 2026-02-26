"use client";
import { useState, useEffect } from "react";

interface Props {
  battleId: string;
  winner: "a" | "b" | "draw" | null;
  myRole: "a" | "b";
}

interface ResultData {
  result: "victory" | "defeat" | "draw";
  expGained: number;
  goldGained: number;
  ratingChange: number;
}

export function BattleResult({ battleId, winner, myRole }: Props) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/rpg/battle/${battleId}/result`, { method: "POST" })
      .then(r => r.json())
      .then(d => {
        if (d.result) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [battleId]);

  if (loading) {
    return <div className="text-center py-4 font-mono animate-pulse">Calculating results...</div>;
  }

  if (!data) {
    const isWinner = winner === myRole;
    const isDraw = winner === "draw";
    return (
      <div className="text-center py-4">
        <p className="text-2xl font-bold font-mono">
          {isDraw ? "Draw!" : isWinner ? "Victory!" : "Defeat..."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-sm mx-auto">
      <h2 className={`text-3xl font-bold font-mono text-center mb-4 ${
        data.result === "victory" ? "text-yellow-400" : data.result === "defeat" ? "text-red-400" : "text-gray-400"
      }`}>
        {data.result === "victory" ? "Victory!" : data.result === "defeat" ? "Defeat..." : "Draw!"}
      </h2>

      <div className="space-y-2 text-center font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">EXP</span>
          <span className="text-green-400">+{data.expGained}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Gold</span>
          <span className="text-yellow-400">+{data.goldGained}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Rating</span>
          <span className={data.ratingChange >= 0 ? "text-green-400" : "text-red-400"}>
            {data.ratingChange >= 0 ? "+" : ""}{data.ratingChange}
          </span>
        </div>
      </div>
    </div>
  );
}
