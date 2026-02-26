import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminSupabaseClient();
  const { data: pools } = await supabase
    .from("gacha_pools")
    .select("id, name, cost_gems")
    .eq("active", true);

  return NextResponse.json({ pools: pools || [] });
}
