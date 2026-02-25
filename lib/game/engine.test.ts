import { describe, it, expect } from "vitest";
import {
  createGameState,
  submitGuess,
  getCurrentResolution,
  getVisibleHints,
  generateShareText,
} from "./engine";
import type { Puzzle } from "./types";

const mockPuzzle: Puzzle = {
  id: "test-1",
  puzzleNumber: 1,
  answer: "knight",
  category: "game character",
  hints: [
    "",
    "RPG character",
    "Medieval era",
    "Wears armor",
    "From a classic franchise",
    "Starts with K",
  ],
  imageUrls: {
    16: "/puzzles/1/16.png",
    32: "/puzzles/1/32.png",
    48: "/puzzles/1/48.png",
    64: "/puzzles/1/64.png",
    96: "/puzzles/1/96.png",
    128: "/puzzles/1/128.png",
  },
};

describe("createGameState", () => {
  it("creates initial game state", () => {
    const state = createGameState(mockPuzzle);
    expect(state.currentRound).toBe(0);
    expect(state.guesses).toEqual([]);
    expect(state.results).toEqual([]);
    expect(state.status).toBe("playing");
  });
});

describe("submitGuess", () => {
  it("returns correct on exact match (case-insensitive)", () => {
    const state = createGameState(mockPuzzle);
    const next = submitGuess(state, "Knight");
    expect(next.status).toBe("won");
    expect(next.results[0]).toBe("correct");
    expect(next.currentRound).toBe(1);
  });

  it("returns correct_category when category matches", () => {
    const state = createGameState(mockPuzzle);
    const next = submitGuess(state, "warrior");
    expect(next.status).toBe("playing");
    expect(next.results[0]).toBe("correct_category");
    expect(next.currentRound).toBe(1);
  });

  it("returns wrong on no match", () => {
    const state = createGameState(mockPuzzle);
    const next = submitGuess(state, "spaceship");
    expect(next.results[0]).toBe("wrong");
    expect(next.currentRound).toBe(1);
  });

  it("loses after 6 wrong guesses", () => {
    let state = createGameState(mockPuzzle);
    for (let i = 0; i < 6; i++) {
      state = submitGuess(state, `wrong${i}`);
    }
    expect(state.status).toBe("lost");
    expect(state.currentRound).toBe(6);
  });

  it("does not accept guesses after game ends", () => {
    const state = createGameState(mockPuzzle);
    const won = submitGuess(state, "knight");
    const extra = submitGuess(won, "another");
    expect(extra).toEqual(won);
  });
});

describe("getCurrentResolution", () => {
  it("returns 16 for round 0", () => {
    expect(getCurrentResolution(0)).toBe(16);
  });

  it("returns 128 for round 5", () => {
    expect(getCurrentResolution(5)).toBe(128);
  });
});

describe("getVisibleHints", () => {
  it("returns no hints at round 0", () => {
    const state = createGameState(mockPuzzle);
    expect(getVisibleHints(state)).toEqual([]);
  });

  it("returns first hint after round 1", () => {
    let state = createGameState(mockPuzzle);
    state = submitGuess(state, "wrong");
    expect(getVisibleHints(state)).toEqual(["RPG character"]);
  });
});

describe("generateShareText", () => {
  it("generates share text for a won game", () => {
    let state = createGameState(mockPuzzle);
    state = submitGuess(state, "wrong");
    state = submitGuess(state, "knight");
    const text = generateShareText(state);
    expect(text).toContain("PixelGuess #1");
    expect(text).toContain("2/6");
    expect(text).toContain("\u2B1B");
    expect(text).toContain("\uD83D\uDFE9");
  });

  it("generates share text for a lost game", () => {
    let state = createGameState(mockPuzzle);
    for (let i = 0; i < 6; i++) {
      state = submitGuess(state, `wrong${i}`);
    }
    const text = generateShareText(state);
    expect(text).toContain("X/6");
  });
});
