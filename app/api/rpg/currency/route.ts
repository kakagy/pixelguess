import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ gems: 0, gold: 0 });
  }

  const { data } = await supabase
    .from("user_currency")
    .select("gems, gold")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ gems: data?.gems || 0, gold: data?.gold || 0 });
}
