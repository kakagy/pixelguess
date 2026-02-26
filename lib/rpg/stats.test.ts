import { describe, it, expect } from "vitest";
import { computeStats, createBattleUnit, getElementMultiplier, calcDamage } from "./stats";
import type { Avatar } from "./types";

const mockAvatar: Avatar = {
  id: "a1",
  userId: "u1",
  name: "TestKnight",
  className: "knight",
  level: 1,
  exp: 0,
  seed: { body: 0, skinTone: 0, hair: 0, hairColor: 0, eyes: 0, outfit: 0, outfitColor: 0 },
  equipment: { weapon: null, armor: null, accessory: null },
};

describe("computeStats", () => {
  it("returns base stats at level 1", () => {
    const stats = computeStats(mockAvatar);
    expect(stats.hp).toBe(120);
    expect(stats.atk).toBe(14);
  });

  it("scales stats with level", () => {
    const lvl10 = { ...mockAvatar, level: 10 };
    const stats = computeStats(lvl10);
    expect(stats.hp).toBe(120 + 9 * 5);
    expect(stats.atk).toBe(14 + 9);
  });

  it("adds equipment bonuses", () => {
    const equipped: Avatar = {
      ...mockAvatar,
      equipment: {
        weapon: { id: "w1", name: "Iron Sword", slot: "weapon", rarity: "common", statBonus: { atk: 5 }, spriteKey: "iron_sword" },
        armor: null,
        accessory: null,
      },
    };
    const stats = computeStats(equipped);
    expect(stats.atk).toBe(14 + 5);
  });
});

describe("createBattleUnit", () => {
  it("creates unit with full HP and 30 MP", () => {
    const unit = createBattleUnit(mockAvatar);
    expect(unit.currentHp).toBe(120);
    expect(unit.currentMp).toBe(30);
    expect(unit.skills).toHaveLength(3);
    expect(unit.element).toBe("physical");
  });
});

describe("getElementMultiplier", () => {
  it("fire beats wind (1.5x)", () => {
    expect(getElementMultiplier("fire", "wind")).toBe(1.5);
  });
  it("wind beats water (1.5x)", () => {
    expect(getElementMultiplier("wind", "water")).toBe(1.5);
  });
  it("water beats fire (1.5x)", () => {
    expect(getElementMultiplier("water", "fire")).toBe(1.5);
  });
  it("reverse is 0.75x", () => {
    expect(getElementMultiplier("wind", "fire")).toBe(0.75);
  });
  it("physical is always neutral", () => {
    expect(getElementMultiplier("physical", "fire")).toBe(1.0);
  });
  it("same element is neutral", () => {
    expect(getElementMultiplier("fire", "fire")).toBe(1.0);
  });
});

describe("calcDamage", () => {
  it("calculates physical damage", () => {
    const atk = { hp: 100, atk: 20, mag: 5, def: 10, res: 5, spd: 5 };
    const def = { hp: 100, atk: 5, mag: 5, def: 10, res: 5, spd: 5 };
    const dmg = calcDamage(atk, def, 1.0, false, 1.0);
    expect(dmg).toBe(Math.round(20 * 1.0 - 10 * 0.5));
  });

  it("applies element multiplier", () => {
    const atk = { hp: 100, atk: 20, mag: 5, def: 10, res: 5, spd: 5 };
    const def = { hp: 100, atk: 5, mag: 5, def: 10, res: 5, spd: 5 };
    const dmg = calcDamage(atk, def, 1.0, false, 1.5);
    expect(dmg).toBe(Math.round(15 * 1.5));
  });

  it("minimum damage is 1", () => {
    const atk = { hp: 100, atk: 1, mag: 1, def: 10, res: 5, spd: 5 };
    const def = { hp: 100, atk: 5, mag: 5, def: 100, res: 5, spd: 5 };
    const dmg = calcDamage(atk, def, 1.0, false, 1.0);
    expect(dmg).toBeGreaterThanOrEqual(1);
  });
});
