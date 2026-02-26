import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminSupabaseClient();

  // Get top 100 by rating
  const { data: entries, error } = await supabase
    .from("leaderboard")
    .select("user_id, rating, wins, losses, streak")
    .order("rating", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch avatar info for each user
  const userIds = (entries || []).map((e: any) => e.user_id);
  const { data: avatars } = await supabase
    .from("avatars")
    .select("user_id, name, class, level")
    .in("user_id", userIds);

  const avatarMap = new Map((avatars || []).map((a: any) => [a.user_id, a]));

  const leaderboard = (entries || []).map((entry: any, index: number) => {
    const avatar = avatarMap.get(entry.user_id) as any;
    return {
      rank: index + 1,
      rating: entry.rating,
      wins: entry.wins,
      losses: entry.losses,
      streak: entry.streak,
      name: avatar?.name || "Unknown",
      class: avatar?.class || "knight",
      level: avatar?.level || 1,
    };
  });

  return NextResponse.json({ leaderboard });
}
