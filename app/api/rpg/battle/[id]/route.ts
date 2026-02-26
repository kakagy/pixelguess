import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(
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
  const { data: battle } = await adminSupabase
    .from("battle_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!battle) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  const myRole = battle.player_a === user.id ? "a" : battle.player_b === user.id ? "b" : null;

  return NextResponse.json({ battle, myRole });
}
