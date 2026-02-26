import type { Rarity } from "./types";

const RATES: Record<Rarity, number> = {
  common: 0.60,
  uncommon: 0.25,
  rare: 0.10,
  legendary: 0.05,
};

export function rollRarity(pullsSinceRare: number, pullsSinceLegendary: number): Rarity {
  if (pullsSinceLegendary >= 49) return "legendary";
  if (pullsSinceRare >= 19) return "rare";

  const roll = Math.random();
  let cumulative = 0;
  for (const [rarity, rate] of Object.entries(RATES) as [Rarity, number][]) {
    cumulative += rate;
    if (roll < cumulative) return rarity;
  }
  return "common";
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  legendary: "text-yellow-400",
};

export const RARITY_BG: Record<Rarity, string> = {
  common: "bg-gray-700",
  uncommon: "bg-green-900/50",
  rare: "bg-blue-900/50",
  legendary: "bg-yellow-900/50 border-yellow-500",
};
