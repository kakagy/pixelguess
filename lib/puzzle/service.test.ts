import { describe, it, expect } from "vitest";
import { getTodayDateString, sanitizePuzzleForClient } from "./service";

describe("getTodayDateString", () => {
  it("returns date in YYYY-MM-DD format", () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("sanitizePuzzleForClient", () => {
  it("removes the answer from puzzle data", () => {
    const puzzle = {
      id: "1",
      puzzle_number: 1,
      publish_date: "2026-02-25",
      answer: "knight",
      category: "game character",
      hints: ["", "RPG", "Medieval", "Armor", "Classic", "K"],
      image_urls: { "16": "/16.png", "32": "/32.png" },
      difficulty: 1,
      created_at: "2026-02-25T00:00:00Z",
    };
    const sanitized = sanitizePuzzleForClient(puzzle);
    expect(sanitized).not.toHaveProperty("answer");
    expect(sanitized).toHaveProperty("id");
    expect(sanitized).toHaveProperty("hints");
  });
});
