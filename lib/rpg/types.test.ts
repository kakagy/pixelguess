import { describe, it, expect } from "vitest";
import type { Stats, BattleAction, AvatarSeed } from "./types";
import { TURN_TIMEOUT_SECONDS, MAX_LEVEL } from "./types";

describe("RPG Types", () => {
  it("exports constants", () => {
    expect(TURN_TIMEOUT_SECONDS).toBe(30);
    expect(MAX_LEVEL).toBe(50);
  });

  it("Stats shape is valid", () => {
    const stats: Stats = { hp: 100, atk: 10, mag: 5, def: 8, res: 6, spd: 7 };
    expect(stats.hp).toBe(100);
  });

  it("BattleAction union covers all types", () => {
    const actions: BattleAction[] = [
      { type: "attack" },
      { type: "skill", skillId: "fireball" },
      { type: "defend" },
      { type: "item", itemId: "potion" },
    ];
    expect(actions).toHaveLength(4);
  });

  it("AvatarSeed has correct ranges", () => {
    const seed: AvatarSeed = {
      body: 2, skinTone: 5, hair: 7, hairColor: 7,
      eyes: 5, outfit: 9, outfitColor: 5,
    };
    expect(seed.body).toBeLessThanOrEqual(2);
    expect(seed.outfit).toBeLessThanOrEqual(9);
  });
});
