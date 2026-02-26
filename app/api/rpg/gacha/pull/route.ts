import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rollRarity } from "@/lib/rpg/gacha";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = createAdminSupabaseClient();
  const body = await request.json();
  const { poolId, count = 1 } = body; // count: 1 for single, 10 for multi

  if (count !== 1 && count !== 10) {
    return NextResponse.json({ error: "Invalid pull count" }, { status: 400 });
  }

  // Get pool
  const { data: pool } = await adminSupabase
    .from("gacha_pools")
    .select("*")
    .eq("id", poolId)
    .eq("active", true)
    .single();

  if (!pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }

  const totalCost = count === 10 ? pool.cost_gems * 9 : pool.cost_gems; // 10-pull discount

  // Check currency
  const { data: currency } = await supabase
    .from("user_currency")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!currency || currency.gems < totalCost) {
    return NextResponse.json({ error: "Not enough gems" }, { status: 400 });
  }

  // Get user's pull history for pity calculation
  const { data: history } = await adminSupabase
    .from("gacha_history")
    .select("result")
    .eq("user_id", user.id)
    .eq("pool_id", poolId)
    .order("created_at", { ascending: false })
    .limit(50);

  let pullsSinceRare = 0;
  let pullsSinceLegendary = 0;
  if (history) {
    for (const h of history) {
      const result = h.result as { rarity?: string };
      if (result.rarity === "rare" || result.rarity === "legendary") break;
      pullsSinceRare++;
    }
    for (const h of history) {
      const result = h.result as { rarity?: string };
      if (result.rarity === "legendary") break;
      pullsSinceLegendary++;
    }
  }

  // Roll
  const results = [];
  const poolItems = pool.items as Array<{ equipment_id: string; rarity: string }>;

  for (let i = 0; i < count; i++) {
    const rarity = rollRarity(pullsSinceRare + i, pullsSinceLegendary + i);
    const candidates = poolItems.filter((item) => item.rarity === rarity);
    const picked = candidates[Math.floor(Math.random() * candidates.length)] || poolItems[0];

    // Get equipment details
    const { data: equip } = await adminSupabase
      .from("equipment")
      .select("*")
      .eq("id", picked.equipment_id)
      .single();

    results.push({
      rarity,
      equipment: equip,
    });

    // Add to inventory
    if (equip) {
      const { data: existing } = await adminSupabase
        .from("user_inventory")
        .select("*")
        .eq("user_id", user.id)
        .eq("equipment_id", equip.id)
        .single();

      if (existing) {
        await adminSupabase
          .from("user_inventory")
          .update({ quantity: (existing.quantity as number) + 1 })
          .eq("id", existing.id);
      } else {
        await adminSupabase
          .from("user_inventory")
          .insert({ user_id: user.id, equipment_id: equip.id, quantity: 1 });
      }
    }

    // Record history
    await adminSupabase.from("gacha_history").insert({
      user_id: user.id,
      pool_id: poolId,
      result: { rarity, equipment_id: picked.equipment_id },
    });
  }

  // Deduct gems
  await adminSupabase
    .from("user_currency")
    .update({ gems: currency.gems - totalCost })
    .eq("user_id", user.id);

  return NextResponse.json({
    results,
    gemsSpent: totalCost,
    gemsRemaining: currency.gems - totalCost,
  });
}
