"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createGameState,
  submitGuess,
  getCurrentResolution,
  getVisibleHints,
  generateShareText,
} from "@/lib/game/engine";
import type { GameState, Puzzle } from "@/lib/game/types";

export function useGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPuzzle() {
      try {
        const res = await fetch("/api/puzzle/today");
        if (!res.ok) throw new Error("Failed to load puzzle");
        const data = await res.json();

        const puzzle: Puzzle = {
          id: data.id,
          puzzleNumber: data.puzzle_number,
          answer: "",
          category: data.category,
          hints: data.hints,
          imageUrls: data.image_urls,
        };

        const saved = localStorage.getItem(`pg-${data.puzzle_number}`);
        if (saved) {
          setGameState(JSON.parse(saved));
        } else {
          setGameState(createGameState(puzzle));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    loadPuzzle();
  }, []);

  const guess = useCallback(
    async (input: string) => {
      if (!gameState || gameState.status !== "playing") return;

      const res = await fetch(`/api/puzzle/${gameState.puzzle.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: input, guessCount: gameState.currentRound + 1 }),
      });

      const result = await res.json();

      const newState = submitGuess(
        { ...gameState, puzzle: { ...gameState.puzzle, answer: result.answer ?? "" } },
        input
      );

      if (result.correct) {
        newState.status = "won";
      } else if (newState.currentRound >= 6) {
        newState.status = "lost";
        newState.puzzle = { ...newState.puzzle, answer: result.answer ?? "" };
      }

      setGameState(newState);
      localStorage.setItem(`pg-${newState.puzzle.puzzleNumber}`, JSON.stringify(newState));
    },
    [gameState]
  );

  const resolution = gameState ? getCurrentResolution(gameState.currentRound) : 16;
  const hints = gameState ? getVisibleHints(gameState) : [];
  const shareText = gameState && gameState.status !== "playing" ? generateShareText(gameState) : null;

  return { gameState, loading, error, guess, resolution, hints, shareText };
}
