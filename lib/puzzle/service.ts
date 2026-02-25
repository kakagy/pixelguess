import type { Database } from "@/lib/supabase/types";

type PuzzleRow = Database["public"]["Tables"]["puzzles"]["Row"];

export function getTodayDateString(): string {
  // Use JST (UTC+9)
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split("T")[0];
}

export function sanitizePuzzleForClient(puzzle: PuzzleRow) {
  const { answer, ...safe } = puzzle;
  return safe;
}
