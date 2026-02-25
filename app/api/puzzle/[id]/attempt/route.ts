import { NextRequest, NextResponse } from "next/server";
import { demoPuzzles } from "@/lib/puzzle/demo-data";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && url.startsWith("http");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: puzzleId } = await params;

  const body = await request.json();
  const { guess, guessCount } = body;

  if (!guess || typeof guess !== "string") {
    return NextResponse.json({ error: "Invalid guess" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Demo mode: validate answer against local data, no auth or persistence
    const demoPuzzle = demoPuzzles.find((p) => p.id === puzzleId);
    if (!demoPuzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    const isCorrect =
      guess.trim().toLowerCase() === demoPuzzle.answer.trim().toLowerCase();
    const count = typeof guessCount === "number" ? guessCount : 1;

    return NextResponse.json({
      correct: isCorrect,
      guessCount: count,
      answer: count >= 6 || isCorrect ? demoPuzzle.answer : undefined,
    });
  }

  // Production mode: full Supabase flow
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get puzzle with answer (server-side only)
  const { data: puzzleData } = await supabase
    .from("puzzles")
    .select("*")
    .eq("id", puzzleId)
    .single();

  const puzzle = puzzleData as Record<string, unknown> | null;

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

  const existing = existingData as Record<string, unknown> | null;

  const guesses: string[] = (existing?.guesses as string[]) ?? [];
  if (guesses.length >= 6 || existing?.solved) {
    return NextResponse.json(
      { error: "Game already completed" },
      { status: 400 }
    );
  }

  const answer = puzzle.answer as string;
  const isCorrect =
    guess.trim().toLowerCase() === answer.trim().toLowerCase();
  const newGuesses = [...guesses, guess];
  const solved = isCorrect;
  const solvedRound = isCorrect ? newGuesses.length : null;

  if (existing) {
    await supabase
      .from("attempts")
      .update({ guesses: newGuesses, solved, solved_round: solvedRound })
      .eq("id", existing.id as string);
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
    answer: newGuesses.length >= 6 || isCorrect ? answer : undefined,
  });
}
