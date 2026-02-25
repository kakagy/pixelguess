import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTodayDateString, sanitizePuzzleForClient } from "@/lib/puzzle/service";
import type { Database } from "@/lib/supabase/types";

type PuzzleRow = Database["public"]["Tables"]["puzzles"]["Row"];

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const today = getTodayDateString();

  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("publish_date", today)
    .single();

  const puzzle = data as PuzzleRow | null;

  if (error || !puzzle) {
    return NextResponse.json({ error: "No puzzle for today" }, { status: 404 });
  }

  return NextResponse.json(sanitizePuzzleForClient(puzzle));
}
