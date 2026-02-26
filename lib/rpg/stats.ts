import type { Avatar, BattleUnit, Stats, Element } from "./types";
import { CLASS_DEFS } from "./classes";

export function computeStats(avatar: Avatar): Stats {
  const classDef = CLASS_DEFS[avatar.className];
  const base = classDef.baseStats;
  const levelBonus = avatar.level - 1;

  const stats: Stats = {
    hp: base.hp + levelBonus * 5,
    atk: base.atk + levelBonus * 1,
    mag: base.mag + levelBonus * 1,
    def: base.def + levelBonus * 1,
    res: base.res + levelBonus * 1,
    spd: base.spd + Math.floor(levelBonus * 0.5),
  };

  for (const slot of ["weapon", "armor", "accessory"] as const) {
    const eq = avatar.equipment[slot];
    if (!eq) continue;
    for (const [key, val] of Object.entries(eq.statBonus)) {
      stats[key as keyof Stats] += val as number;
    }
  }

  return stats;
}

export function createBattleUnit(avatar: Avatar): BattleUnit {
  const classDef = CLASS_DEFS[avatar.className];
  const stats = computeStats(avatar);
  return {
    avatarId: avatar.id,
    name: avatar.name,
    className: avatar.className,
    level: avatar.level,
    stats,
    currentHp: stats.hp,
    currentMp: 30,
    skills: classDef.skills,
    element: classDef.element,
  };
}

export function getElementMultiplier(attacker: Element, defender: Element): number {
  if (attacker === "physical" || defender === "physical") return 1.0;
  const advantages: Record<string, string> = {
    fire: "wind",
    wind: "water",
    water: "fire",
  };
  if (advantages[attacker] === defender) return 1.5;
  if (advantages[defender] === attacker) return 0.75;
  return 1.0;
}

export function calcDamage(
  attackerStats: Stats,
  defenderStats: Stats,
  skillPower: number,
  isMagic: boolean,
  elementMultiplier: number
): number {
  const atk = isMagic ? attackerStats.mag : attackerStats.atk;
  const def = isMagic ? defenderStats.res : defenderStats.def;
  const raw = Math.max(1, atk * skillPower - def * 0.5);
  return Math.round(raw * elementMultiplier);
}
