export type Resolution = 16 | 32 | 48 | 64 | 96 | 128;

export const RESOLUTIONS: Resolution[] = [16, 32, 48, 64, 96, 128];

export const MAX_ROUNDS = 6;

export interface Puzzle {
  id: string;
  puzzleNumber: number;
  answer: string;
  category: string;
  hints: string[]; // indexed 0-5, one per round
  imageUrls: Record<Resolution, string>;
}

export type GuessResult = "correct" | "wrong" | "correct_category";

export interface GameState {
  puzzle: Puzzle;
  guesses: string[];
  results: GuessResult[];
  currentRound: number; // 0-5
  status: "playing" | "won" | "lost";
}
