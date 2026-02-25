"use client";

import { PixelCanvas } from "./PixelCanvas";
import { GuessInput } from "./GuessInput";
import { HintBar } from "./HintBar";
import { ResultModal } from "./ResultModal";
import { useGame } from "@/hooks/useGame";
import { MAX_ROUNDS } from "@/lib/game/types";

export function GameBoard() {
  const { gameState, loading, error, guess, resolution, hints, shareText } = useGame();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="font-mono text-muted-foreground animate-pulse">Loading puzzle...</p>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="font-mono text-destructive">{error ?? "No puzzle available"}</p>
      </div>
    );
  }

  const imageUrl = gameState.puzzle.imageUrls[resolution];
  const isFinished = gameState.status !== "playing";

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h1 className="text-3xl font-bold font-mono tracking-tight">PixelGuess</h1>

      <PixelCanvas src={imageUrl} resolution={resolution} size={256} className="border-2 border-border rounded-lg" />

      <HintBar hints={hints} round={gameState.currentRound} maxRounds={MAX_ROUNDS} />

      {gameState.guesses.length > 0 && (
        <div className="flex flex-col gap-1 text-sm font-mono">
          {gameState.guesses.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              <span>
                {gameState.results[i] === "correct"
                  ? "\uD83D\uDFE9"
                  : gameState.results[i] === "correct_category"
                  ? "\uD83D\uDFE8"
                  : "\u2B1B"}
              </span>
              <span className="text-muted-foreground">{g}</span>
            </div>
          ))}
        </div>
      )}

      <GuessInput onGuess={guess} disabled={isFinished} />

      {isFinished && shareText && (
        <ResultModal
          open={isFinished}
          won={gameState.status === "won"}
          answer={gameState.puzzle.answer}
          shareText={shareText}
        />
      )}
    </div>
  );
}
