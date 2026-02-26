import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isRatingMatch } from "@/lib/rpg/matchmaking";

// POST: Join matchmaking queue
export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = createAdminSupabaseClient();

  // Get user's avatar and rating
  const { data: avatar } = await supabase
    .from("avatars")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!avatar) {
    return NextResponse.json({ error: "No avatar found" }, { status: 400 });
  }

  const { data: leaderboardEntry } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const myRating = leaderboardEntry?.rating ?? 1000;

  // Check for existing waiting session by this user
  const { data: existingSession } = await adminSupabase
    .from("battle_sessions")
    .select("*")
    .eq("player_a", user.id)
    .eq("status", "waiting")
    .single();

  if (existingSession) {
    return NextResponse.json({ battleId: existingSession.id, status: "waiting" });
  }

  // Look for waiting sessions (fetch up to 20, then do separate rating lookups)
  const { data: waitingSessions } = await adminSupabase
    .from("battle_sessions")
    .select("*")
    .eq("status", "waiting")
    .is("player_b", null)
    .neq("player_a", user.id)
    .order("created_at", { ascending: true })
    .limit(20);

  let matchedSession = null;
  if (waitingSessions && waitingSessions.length > 0) {
    // Collect all player_a ids from waiting sessions
    const opponentIds = waitingSessions.map((s) => s.player_a);

    // Fetch their ratings in one query
    const { data: opponentRatings } = await adminSupabase
      .from("leaderboard")
      .select("user_id, rating")
      .in("user_id", opponentIds);

    const ratingMap: Record<string, number> = {};
    if (opponentRatings) {
      for (const entry of opponentRatings) {
        ratingMap[entry.user_id] = entry.rating;
      }
    }

    for (const session of waitingSessions) {
      const opponentRating = ratingMap[session.player_a] ?? 1000;
      if (isRatingMatch(myRating, opponentRating)) {
        matchedSession = session;
        break;
      }
    }
  }

  if (matchedSession) {
    // Join existing session
    const { error } = await adminSupabase
      .from("battle_sessions")
      .update({
        player_b: user.id,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchedSession.id);

    if (error) {
      return NextResponse.json({ error: "Failed to join match" }, { status: 500 });
    }

    return NextResponse.json({ battleId: matchedSession.id, status: "matched" });
  }

  // No match found — create waiting session
  const { data: newSession, error } = await adminSupabase
    .from("battle_sessions")
    .insert({
      player_a: user.id,
      status: "waiting",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  return NextResponse.json({ battleId: newSession.id, status: "waiting" });
}
