import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

// GET: Get any avatar by ID (for battle display)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: avatar, error } = await supabase
    .from("avatars")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !avatar) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }

  return NextResponse.json({ avatar });
}
