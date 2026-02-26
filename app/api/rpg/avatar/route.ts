import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateSeed } from "@/lib/rpg/avatar-composer";
import type { ClassName } from "@/lib/rpg/types";

const VALID_CLASSES: ClassName[] = ["knight", "mage", "ranger", "healer"];

// GET: Get current user's avatar
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ avatar: null });
  }

  const { data: avatar, error } = await supabase
    .from("avatars")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ avatar: avatar || null });
}

// POST: Create a new avatar
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, className } = body;

  // Validate name
  if (!name || typeof name !== "string" || name.length < 2 || name.length > 16) {
    return NextResponse.json({ error: "Name must be 2-16 characters" }, { status: 400 });
  }

  // Validate class
  if (!VALID_CLASSES.includes(className)) {
    return NextResponse.json({ error: "Invalid class" }, { status: 400 });
  }

  // Check if user already has an avatar
  const { data: existing } = await supabase
    .from("avatars")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Avatar already exists" }, { status: 409 });
  }

  // Generate random seed
  const seed = generateSeed();

  const { data: avatar, error } = await supabase
    .from("avatars")
    .insert({
      user_id: user.id,
      name,
      class: className,
      seed,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Initialize leaderboard entry
  await supabase.from("leaderboard").insert({ user_id: user.id });

  // Initialize currency
  await supabase.from("user_currency").insert({ user_id: user.id });

  return NextResponse.json({ avatar }, { status: 201 });
}
