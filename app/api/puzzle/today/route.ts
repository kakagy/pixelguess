import { NextResponse } from "next/server";
import { getTodayDateString, sanitizePuzzleForClient } from "@/lib/puzzle/service";
import { getDemoPuzzleForToday } from "@/lib/puzzle/demo-data";
import type { Database } from "@/lib/supabase/types";

type PuzzleRow = Database["public"]["Tables"]["puzzles"]["Row"];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && url.startsWith("http");
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    // Demo mode: serve from local data
    const demo = getDemoPuzzleForToday();
    return NextResponse.json(sanitizePuzzleForClient(demo));
  }

  // Production mode: fetch from Supabase
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabaseClient();
  const today = getTodayDateString();

  const { data: puzzle, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("publish_date", today)
    .single();

  if (error || !puzzle) {
    // Fallback to demo if no puzzle for today in DB
    const demo = getDemoPuzzleForToday();
    return NextResponse.json(sanitizePuzzleForClient(demo));
  }

  return NextResponse.json(sanitizePuzzleForClient(puzzle as PuzzleRow));
}
