"use client";
import { useState, useEffect } from "react";
import { RARITY_COLORS, RARITY_BG } from "@/lib/rpg/gacha";
import type { Rarity } from "@/lib/rpg/types";

interface GachaPool {
  id: string;
  name: string;
  cost_gems: number;
}

interface GachaResult {
  rarity: Rarity;
  equipment: {
    name: string;
    slot: string;
    rarity: string;
    stat_bonus: Record<string, number>;
  } | null;
}

export default function GachaPage() {
  const [pools, setPools] = useState<GachaPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<GachaPool | null>(null);
  const [results, setResults] = useState<GachaResult[]>([]);
  const [gems, setGems] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Fetch available pools
    fetch("/api/rpg/gacha/pools")
      .then(r => r.json())
      .then(d => {
        setPools(d.pools || []);
        if (d.pools?.length) setSelectedPool(d.pools[0]);
      })
      .catch(() => {});

    // Fetch gems
    fetch("/api/rpg/currency")
      .then(r => r.json())
      .then(d => setGems(d.gems || 0))
      .catch(() => {});
  }, []);

  const pull = async (count: 1 | 10) => {
    if (!selectedPool) return;
    setPulling(true);
    setShowResults(false);
    try {
      const res = await fetch("/api/rpg/gacha/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poolId: selectedPool.id, count }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        setGems(data.gemsRemaining);
        setShowResults(true);
      }
    } catch {
      // handle error
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 font-mono">Gacha</h1>
        <p className="text-center text-yellow-400 font-mono mb-6">💎 {gems} Gems</p>

        {selectedPool && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-bold font-mono mb-2">{selectedPool.name}</h2>
            <p className="text-sm text-gray-400 mb-4">Cost: {selectedPool.cost_gems} gems / pull</p>

            <div className="flex gap-3">
              <button
                onClick={() => pull(1)}
                disabled={pulling || gems < selectedPool.cost_gems}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg font-bold font-mono transition-colors"
              >
                {pulling ? "..." : `Pull x1 (${selectedPool.cost_gems}💎)`}
              </button>
              <button
                onClick={() => pull(10)}
                disabled={pulling || gems < selectedPool.cost_gems * 9}
                className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white rounded-lg font-bold font-mono transition-colors"
              >
                {pulling ? "..." : `Pull x10 (${selectedPool.cost_gems * 9}💎)`}
              </button>
            </div>
          </div>
        )}

        {showResults && results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-bold font-mono mb-3">Results</h3>
            {results.map((r, i) => (
              <div key={i} className={`rounded-lg p-3 border ${RARITY_BG[r.rarity]}`}>
                <div className="flex justify-between items-center">
                  <span className="font-mono">{r.equipment?.name || "Unknown"}</span>
                  <span className={`text-sm font-bold capitalize ${RARITY_COLORS[r.rarity]}`}>
                    {r.rarity}
                  </span>
                </div>
                {r.equipment?.stat_bonus && (
                  <div className="text-xs text-gray-400 mt-1">
                    {Object.entries(r.equipment.stat_bonus).map(([k, v]) => `${k.toUpperCase()}+${v}`).join(" ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Rates: Common 60% · Uncommon 25% · Rare 10% · Legendary 5%</p>
          <p>Pity: Guaranteed Rare at 20 pulls, Legendary at 50 pulls</p>
        </div>
      </div>
    </div>
  );
}
