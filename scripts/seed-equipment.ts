import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EQUIPMENT = [
  // Common weapons
  { name: "Iron Sword", slot: "weapon", rarity: "common", stat_bonus: { atk: 3 }, sprite_key: "iron_sword" },
  { name: "Wooden Staff", slot: "weapon", rarity: "common", stat_bonus: { mag: 3 }, sprite_key: "wooden_staff" },
  { name: "Short Bow", slot: "weapon", rarity: "common", stat_bonus: { atk: 2, spd: 1 }, sprite_key: "short_bow" },
  { name: "Oak Wand", slot: "weapon", rarity: "common", stat_bonus: { mag: 2, res: 1 }, sprite_key: "oak_wand" },
  // Common armor
  { name: "Leather Vest", slot: "armor", rarity: "common", stat_bonus: { def: 3 }, sprite_key: "leather_vest" },
  { name: "Cloth Robe", slot: "armor", rarity: "common", stat_bonus: { res: 3 }, sprite_key: "cloth_robe" },
  // Uncommon
  { name: "Steel Blade", slot: "weapon", rarity: "uncommon", stat_bonus: { atk: 6 }, sprite_key: "steel_blade" },
  { name: "Crystal Staff", slot: "weapon", rarity: "uncommon", stat_bonus: { mag: 6 }, sprite_key: "crystal_staff" },
  { name: "Chain Mail", slot: "armor", rarity: "uncommon", stat_bonus: { def: 5, hp: 10 }, sprite_key: "chain_mail" },
  { name: "Mystic Robe", slot: "armor", rarity: "uncommon", stat_bonus: { res: 5, mag: 2 }, sprite_key: "mystic_robe" },
  // Rare
  { name: "Flame Sword", slot: "weapon", rarity: "rare", stat_bonus: { atk: 10, spd: 3 }, sprite_key: "flame_sword" },
  { name: "Ice Staff", slot: "weapon", rarity: "rare", stat_bonus: { mag: 10, res: 3 }, sprite_key: "ice_staff" },
  { name: "Dragon Scale", slot: "armor", rarity: "rare", stat_bonus: { def: 8, hp: 20, res: 3 }, sprite_key: "dragon_scale" },
  // Legendary
  { name: "Excalibur", slot: "weapon", rarity: "legendary", stat_bonus: { atk: 15, spd: 5, hp: 10 }, sprite_key: "excalibur" },
  { name: "Arcane Grimoire", slot: "weapon", rarity: "legendary", stat_bonus: { mag: 15, res: 5, hp: 10 }, sprite_key: "arcane_grimoire" },
];

async function seed() {
  console.log("Seeding equipment...");

  // Insert equipment
  const { data: equipment, error: eqError } = await supabase
    .from("equipment")
    .insert(EQUIPMENT)
    .select();

  if (eqError) {
    console.error("Equipment error:", eqError);
    return;
  }

  console.log(`Inserted ${equipment.length} equipment items`);

  // Create gacha pool with all equipment
  const poolItems = equipment.map((eq: any) => ({
    equipment_id: eq.id,
    rarity: eq.rarity,
  }));

  const { error: poolError } = await supabase.from("gacha_pools").insert({
    name: "Equipment Gacha",
    items: poolItems,
    rates: { common: 0.6, uncommon: 0.25, rare: 0.1, legendary: 0.05 },
    cost_gems: 10,
    active: true,
  });

  if (poolError) {
    console.error("Pool error:", poolError);
    return;
  }

  console.log("Gacha pool created successfully!");
}

seed();
