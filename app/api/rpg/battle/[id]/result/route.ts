import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { calculateRatingChange } from "@/lib/rpg/matchmaking";
import { EXP_PER_LEVEL, MAX_LEVEL } from "@/lib/rpg/types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = createAdminSupabaseClient();

  // Get battle session
  const { data: session } = await adminSupabase
    .from("battle_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!session || session.status !== "finished") {
    return NextResponse.json({ error: "Battle not finished" }, { status: 400 });
  }

  const state = session.state as any;

  // Check if result already processed
  const { data: existingBattle } = await adminSupabase
    .from("battles")
    .select("id")
    .eq("id", id)
    .single();

  if (existingBattle) {
    return NextResponse.json({ error: "Already processed" }, { status: 409 });
  }

  // Get ratings
  const { data: ratingA } = await adminSupabase.from("leaderboard").select("rating, wins, losses, streak").eq("user_id", session.player_a).single();
  const { data: ratingB } = await adminSupabase.from("leaderboard").select("rating, wins, losses, streak").eq("user_id", session.player_b).single();

  const ra = ratingA?.rating ?? 1000;
  const rb = ratingB?.rating ?? 1000;

  let ratingChangeA = 0;
  let ratingChangeB = 0;
  const expGain = 30 + state.log?.length * 2; // Base 30 + bonus per turn
  const goldGain = 20;

  if (state.winner === "a") {
    const change = calculateRatingChange(ra, rb);
    ratingChangeA = change.winnerDelta;
    ratingChangeB = change.loserDelta;
  } else if (state.winner === "b") {
    const change = calculateRatingChange(rb, ra);
    ratingChangeB = change.winnerDelta;
    ratingChangeA = change.loserDelta;
  }
  // draw: no rating change

  // Save to battles history
  await adminSupabase.from("battles").insert({
    id,
    player_a: session.player_a,
    player_b: session.player_b,
    winner_id: session.winner_id,
    turns: state.log || [],
    rating_change_a: ratingChangeA,
    rating_change_b: ratingChangeB,
  });

  // Update leaderboard for both players
  for (const [userId, delta, isWinner] of [
    [session.player_a, ratingChangeA, state.winner === "a"],
    [session.player_b, ratingChangeB, state.winner === "b"],
  ] as [string, number, boolean][]) {
    const current = userId === session.player_a ? ratingA : ratingB;
    const newRating = Math.max(0, (current?.rating ?? 1000) + delta);
    const wins = (current?.wins ?? 0) + (isWinner ? 1 : 0);
    const losses = (current?.losses ?? 0) + (isWinner ? 0 : (state.winner === "draw" ? 0 : 1));
    const streak = isWinner ? Math.max(0, (current?.streak ?? 0)) + 1 : 0;

    await adminSupabase
      .from("leaderboard")
      .upsert({ user_id: userId, rating: newRating, wins, losses, streak, updated_at: new Date().toISOString() });
  }

  // Update avatars EXP
  for (const userId of [session.player_a, session.player_b]) {
    const { data: avatar } = await adminSupabase.from("avatars").select("*").eq("user_id", userId).single();
    if (avatar) {
      let newExp = (avatar.exp as number) + expGain;
      let newLevel = avatar.level as number;
      while (newExp >= EXP_PER_LEVEL && newLevel < MAX_LEVEL) {
        newExp -= EXP_PER_LEVEL;
        newLevel++;
      }
      await adminSupabase.from("avatars").update({ exp: newExp, level: newLevel }).eq("id", avatar.id);
    }
  }

  // Award gold
  for (const userId of [session.player_a, session.player_b]) {
    const { data: currency } = await adminSupabase.from("user_currency").select("*").eq("user_id", userId).single();
    if (currency) {
      await adminSupabase.from("user_currency").update({ gold: (currency.gold as number) + goldGain }).eq("user_id", userId);
    }
  }

  // Determine result for requesting user
  const isPlayerA = user.id === session.player_a;
  const myRatingChange = isPlayerA ? ratingChangeA : ratingChangeB;
  const isWinner = (state.winner === "a" && isPlayerA) || (state.winner === "b" && !isPlayerA);
  const isDraw = state.winner === "draw";

  return NextResponse.json({
    result: isDraw ? "draw" : isWinner ? "victory" : "defeat",
    expGained: expGain,
    goldGained: goldGain,
    ratingChange: myRatingChange,
  });
}
