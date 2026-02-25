import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!stats) {
    return NextResponse.json({
      total_played: 0,
      total_solved: 0,
      current_streak: 0,
      max_streak: 0,
      guess_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 },
    });
  }

  return NextResponse.json(stats);
}
