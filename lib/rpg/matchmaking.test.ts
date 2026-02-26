import { describe, it, expect } from "vitest";
import { isRatingMatch, calculateRatingChange } from "./matchmaking";

describe("isRatingMatch", () => {
  it("matches players within range", () => {
    expect(isRatingMatch(1000, 1050)).toBe(true);
  });
  it("rejects players outside range", () => {
    expect(isRatingMatch(1000, 1200)).toBe(false);
  });
  it("uses custom range", () => {
    expect(isRatingMatch(1000, 1200, 200)).toBe(true);
  });
});

describe("calculateRatingChange", () => {
  it("gives moderate change for equal rating", () => {
    const { winnerDelta, loserDelta } = calculateRatingChange(1000, 1000);
    expect(winnerDelta).toBe(16);
    expect(loserDelta).toBe(-16);
  });
  it("gives less for expected win (higher beats lower)", () => {
    const { winnerDelta } = calculateRatingChange(1200, 800);
    expect(winnerDelta).toBeLessThan(16);
  });
  it("gives more for upset (lower beats higher)", () => {
    const { winnerDelta } = calculateRatingChange(800, 1200);
    expect(winnerDelta).toBeGreaterThan(16);
  });
});
