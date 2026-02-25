import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type PuzzleRow = Database["public"]["Tables"]["puzzles"]["Row"];
type AttemptRow = Database["public"]["Tables"]["attempts"]["Row"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: puzzleId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { guess } = body;

  if (!guess || typeof guess !== "string") {
    return NextResponse.json({ error: "Invalid guess" }, { status: 400 });
  }

  // Get puzzle with answer (server-side only)
  const { data: puzzleData } = await supabase
    .from("puzzles")
    .select("*")
    .eq("id", puzzleId)
    .single();

  // Cast needed: supabase-js select("*") returns {} with hand-written Database types
  const puzzle = puzzleData as PuzzleRow | null;

  if (!puzzle) {
    return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
  }

  // Check existing attempt
  const { data: existingData } = await supabase
    .from("attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("puzzle_id", puzzleId)
    .single();

  const existing = existingData as AttemptRow | null;

  const guesses: string[] = existing?.guesses ?? [];
  if (guesses.length >= 6 || existing?.solved) {
    return NextResponse.json(
      { error: "Game already completed" },
      { status: 400 }
    );
  }

  const isCorrect =
    guess.trim().toLowerCase() === puzzle.answer.trim().toLowerCase();
  const newGuesses = [...guesses, guess];
  const solved = isCorrect;
  const solvedRound = isCorrect ? newGuesses.length : null;

  if (existing) {
    await supabase
      .from("attempts")
      .update({ guesses: newGuesses, solved, solved_round: solvedRound })
      .eq("id", existing.id);
  } else {
    await supabase.from("attempts").insert({
      user_id: user.id,
      puzzle_id: puzzleId,
      guesses: newGuesses,
      solved,
      solved_round: solvedRound,
      completed_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    correct: isCorrect,
    guessCount: newGuesses.length,
    answer: newGuesses.length >= 6 || isCorrect ? puzzle.answer : undefined,
  });
}
