import { describe, it, expect, vi } from "vitest";
import { rollRarity } from "./gacha";

describe("rollRarity", () => {
  it("returns legendary at pity 49", () => {
    expect(rollRarity(10, 49)).toBe("legendary");
  });

  it("returns rare at pity 19", () => {
    expect(rollRarity(19, 30)).toBe("rare");
  });

  it("legendary pity takes priority", () => {
    expect(rollRarity(19, 49)).toBe("legendary");
  });

  it("returns a valid rarity without pity", () => {
    const rarity = rollRarity(0, 0);
    expect(["common", "uncommon", "rare", "legendary"]).toContain(rarity);
  });

  it("respects rate distribution over many rolls", () => {
    const counts: Record<string, number> = { common: 0, uncommon: 0, rare: 0, legendary: 0 };
    for (let i = 0; i < 10000; i++) {
      counts[rollRarity(0, 0)]++;
    }
    // Common should be most frequent
    expect(counts.common).toBeGreaterThan(counts.uncommon);
    expect(counts.uncommon).toBeGreaterThan(counts.rare);
  });
});
