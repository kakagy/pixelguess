import { describe, it, expect } from "vitest";
import { generateSeed, seedToKey, getSpriteUrls } from "./avatar-composer";

describe("generateSeed", () => {
  it("generates seed with correct ranges", () => {
    const seed = generateSeed();
    expect(seed.body).toBeGreaterThanOrEqual(0);
    expect(seed.body).toBeLessThanOrEqual(2);
    expect(seed.outfit).toBeLessThanOrEqual(9);
  });
});

describe("seedToKey", () => {
  it("produces deterministic key", () => {
    const seed = { body: 1, skinTone: 2, hair: 3, hairColor: 4, eyes: 5, outfit: 6, outfitColor: 3 };
    expect(seedToKey(seed, "knight")).toBe("knight_1_2_3_4_5_6_3");
  });
});

describe("getSpriteUrls", () => {
  it("returns correct layer URLs", () => {
    const seed = { body: 0, skinTone: 1, hair: 2, hairColor: 3, eyes: 4, outfit: 5, outfitColor: 2 };
    const urls = getSpriteUrls(seed, "mage");
    expect(urls).toHaveLength(5);
    expect(urls[0]).toBe("/sprites/body/0_1.png");
    expect(urls[4]).toBe("/sprites/weapon/mage.png");
  });
});
