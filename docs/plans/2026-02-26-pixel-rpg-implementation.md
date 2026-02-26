# Pixel RPG Social Game — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a browser-based pixel RPG with generative avatars and real-time PvP turn-based battles on existing Next.js + Supabase infrastructure.

**Architecture:** Canvas 2D renders battle scenes with nearest-neighbor pixel scaling. Supabase Realtime Broadcast handles turn synchronization. Game logic runs server-side in Supabase Edge Functions for cheat prevention. React DOM overlays provide UI controls.

**Tech Stack:** Next.js 16 (App Router), Canvas 2D, Supabase (Realtime, Edge Functions, PostgreSQL, Auth), Stripe, Vitest, TypeScript

---

### Task 1: RPG Type System

**Files:**
- Create: `lib/rpg/types.ts`
- Test: `lib/rpg/types.test.ts`

**Step 1: Write the types**

```typescript
// lib/rpg/types.ts

export type ClassName = "knight" | "mage" | "ranger" | "healer";
export type Element = "physical" | "fire" | "wind" | "water";

export interface ClassDef {
  name: ClassName;
  element: Element;
  baseStats: Stats;
  skills: SkillDef[];
}

export interface Stats {
  hp: number;
  atk: number;
  mag: number;
  def: number;
  res: number;
  spd: number;
}

export interface SkillDef {
  id: string;
  name: string;
  element: Element;
  power: number;       // multiplier: 1.0 = normal, 1.5 = strong
  cost: number;        // MP cost
  target: "enemy" | "self" | "ally";
  effect?: "heal" | "buff_def" | "buff_atk" | "debuff_spd";
}

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface Equipment {
  id: string;
  name: string;
  slot: "weapon" | "armor" | "accessory";
  rarity: Rarity;
  statBonus: Partial<Stats>;
  spriteKey: string;
}

export interface AvatarSeed {
  body: number;    // 0-2
  skinTone: number; // 0-5
  hair: number;    // 0-7
  hairColor: number; // 0-7
  eyes: number;    // 0-5
  outfit: number;  // 0-9
  outfitColor: number; // 0-5
}

export interface Avatar {
  id: string;
  userId: string;
  name: string;
  className: ClassName;
  level: number;
  exp: number;
  seed: AvatarSeed;
  equipment: {
    weapon: Equipment | null;
    armor: Equipment | null;
    accessory: Equipment | null;
  };
}

export interface BattleUnit {
  avatarId: string;
  name: string;
  className: ClassName;
  level: number;
  stats: Stats;         // computed: base + level + equipment
  currentHp: number;
  currentMp: number;
  skills: SkillDef[];
  element: Element;
}

export type BattleAction =
  | { type: "attack" }
  | { type: "skill"; skillId: string }
  | { type: "defend" }
  | { type: "item"; itemId: string };

export interface TurnResult {
  actorId: string;
  action: BattleAction;
  targetId: string;
  damage: number;
  healing: number;
  elementMultiplier: number;
  isCrit: boolean;
  effects: string[];
}

export type BattleStatus = "waiting" | "active" | "finished";

export interface BattleState {
  id: string;
  playerA: BattleUnit;
  playerB: BattleUnit;
  currentTurn: "a" | "b";
  turnNumber: number;
  turnDeadline: number;  // unix timestamp
  status: BattleStatus;
  winner: "a" | "b" | "draw" | null;
  log: TurnResult[];
}

// Realtime message types
export type BattleMessage =
  | { type: "action"; playerId: string; action: BattleAction }
  | { type: "turn_result"; result: TurnResult; state: BattleState }
  | { type: "battle_end"; winner: string; ratingChange: { a: number; b: number } };

export const TURN_TIMEOUT_SECONDS = 30;
export const MAX_LEVEL = 50;
export const EXP_PER_LEVEL = 100;
```

**Step 2: Write validation test**

```typescript
// lib/rpg/types.test.ts
import { describe, it, expect } from "vitest";
import type { Stats, BattleAction, AvatarSeed } from "./types";
import { TURN_TIMEOUT_SECONDS, MAX_LEVEL } from "./types";

describe("RPG Types", () => {
  it("exports constants", () => {
    expect(TURN_TIMEOUT_SECONDS).toBe(30);
    expect(MAX_LEVEL).toBe(50);
  });

  it("Stats shape is valid", () => {
    const stats: Stats = { hp: 100, atk: 10, mag: 5, def: 8, res: 6, spd: 7 };
    expect(stats.hp).toBe(100);
  });

  it("BattleAction union covers all types", () => {
    const actions: BattleAction[] = [
      { type: "attack" },
      { type: "skill", skillId: "fireball" },
      { type: "defend" },
      { type: "item", itemId: "potion" },
    ];
    expect(actions).toHaveLength(4);
  });

  it("AvatarSeed has correct ranges", () => {
    const seed: AvatarSeed = {
      body: 2, skinTone: 5, hair: 7, hairColor: 7,
      eyes: 5, outfit: 9, outfitColor: 5,
    };
    expect(seed.body).toBeLessThanOrEqual(2);
    expect(seed.outfit).toBeLessThanOrEqual(9);
  });
});
```

**Step 3: Run tests**

Run: `pnpm vitest run lib/rpg/types.test.ts`
Expected: PASS (4 tests)

**Step 4: Commit**

```bash
git add lib/rpg/types.ts lib/rpg/types.test.ts
git commit -m "feat(rpg): add core type system for RPG game"
```

---

### Task 2: Class Definitions & Stat Calculator

**Files:**
- Create: `lib/rpg/classes.ts`
- Create: `lib/rpg/stats.ts`
- Test: `lib/rpg/stats.test.ts`

**Step 1: Define class data**

```typescript
// lib/rpg/classes.ts
import type { ClassDef } from "./types";

export const CLASS_DEFS: Record<string, ClassDef> = {
  knight: {
    name: "knight",
    element: "physical",
    baseStats: { hp: 120, atk: 14, mag: 4, def: 12, res: 8, spd: 6 },
    skills: [
      { id: "shield_bash", name: "Shield Bash", element: "physical", power: 1.2, cost: 5, target: "enemy" },
      { id: "fortify", name: "Fortify", element: "physical", power: 0, cost: 8, target: "self", effect: "buff_def" },
      { id: "heavy_strike", name: "Heavy Strike", element: "physical", power: 1.8, cost: 12, target: "enemy" },
    ],
  },
  mage: {
    name: "mage",
    element: "fire",
    baseStats: { hp: 80, atk: 4, mag: 16, def: 5, res: 12, spd: 8 },
    skills: [
      { id: "fireball", name: "Fireball", element: "fire", power: 1.4, cost: 6, target: "enemy" },
      { id: "flame_wave", name: "Flame Wave", element: "fire", power: 1.0, cost: 4, target: "enemy" },
      { id: "inferno", name: "Inferno", element: "fire", power: 2.0, cost: 15, target: "enemy" },
    ],
  },
  ranger: {
    name: "ranger",
    element: "wind",
    baseStats: { hp: 90, atk: 12, mag: 6, def: 7, res: 7, spd: 14 },
    skills: [
      { id: "quick_shot", name: "Quick Shot", element: "wind", power: 1.1, cost: 4, target: "enemy" },
      { id: "wind_slash", name: "Wind Slash", element: "wind", power: 1.5, cost: 8, target: "enemy" },
      { id: "evasion", name: "Evasion", element: "wind", power: 0, cost: 6, target: "self", effect: "buff_def" },
    ],
  },
  healer: {
    name: "healer",
    element: "water",
    baseStats: { hp: 100, atk: 5, mag: 13, def: 8, res: 14, spd: 7 },
    skills: [
      { id: "heal", name: "Heal", element: "water", power: 1.5, cost: 8, target: "self", effect: "heal" },
      { id: "water_bolt", name: "Water Bolt", element: "water", power: 1.3, cost: 6, target: "enemy" },
      { id: "tidal_wave", name: "Tidal Wave", element: "water", power: 1.8, cost: 14, target: "enemy" },
    ],
  },
};
```

**Step 2: Write stat calculator**

```typescript
// lib/rpg/stats.ts
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

  // Apply equipment bonuses
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
    currentMp: 30, // all start with 30 MP
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
```

**Step 3: Write tests**

```typescript
// lib/rpg/stats.test.ts
import { describe, it, expect } from "vitest";
import { computeStats, createBattleUnit, getElementMultiplier, calcDamage } from "./stats";
import type { Avatar } from "./types";

const mockAvatar: Avatar = {
  id: "a1",
  userId: "u1",
  name: "TestKnight",
  className: "knight",
  level: 1,
  exp: 0,
  seed: { body: 0, skinTone: 0, hair: 0, hairColor: 0, eyes: 0, outfit: 0, outfitColor: 0 },
  equipment: { weapon: null, armor: null, accessory: null },
};

describe("computeStats", () => {
  it("returns base stats at level 1", () => {
    const stats = computeStats(mockAvatar);
    expect(stats.hp).toBe(120);
    expect(stats.atk).toBe(14);
  });

  it("scales stats with level", () => {
    const lvl10 = { ...mockAvatar, level: 10 };
    const stats = computeStats(lvl10);
    expect(stats.hp).toBe(120 + 9 * 5); // 165
    expect(stats.atk).toBe(14 + 9); // 23
  });

  it("adds equipment bonuses", () => {
    const equipped: Avatar = {
      ...mockAvatar,
      equipment: {
        weapon: { id: "w1", name: "Iron Sword", slot: "weapon", rarity: "common", statBonus: { atk: 5 }, spriteKey: "iron_sword" },
        armor: null,
        accessory: null,
      },
    };
    const stats = computeStats(equipped);
    expect(stats.atk).toBe(14 + 5);
  });
});

describe("createBattleUnit", () => {
  it("creates unit with full HP and 30 MP", () => {
    const unit = createBattleUnit(mockAvatar);
    expect(unit.currentHp).toBe(120);
    expect(unit.currentMp).toBe(30);
    expect(unit.skills).toHaveLength(3);
    expect(unit.element).toBe("physical");
  });
});

describe("getElementMultiplier", () => {
  it("fire beats wind (1.5x)", () => {
    expect(getElementMultiplier("fire", "wind")).toBe(1.5);
  });
  it("wind beats water (1.5x)", () => {
    expect(getElementMultiplier("wind", "water")).toBe(1.5);
  });
  it("water beats fire (1.5x)", () => {
    expect(getElementMultiplier("water", "fire")).toBe(1.5);
  });
  it("reverse is 0.75x", () => {
    expect(getElementMultiplier("wind", "fire")).toBe(0.75);
  });
  it("physical is always neutral", () => {
    expect(getElementMultiplier("physical", "fire")).toBe(1.0);
  });
  it("same element is neutral", () => {
    expect(getElementMultiplier("fire", "fire")).toBe(1.0);
  });
});

describe("calcDamage", () => {
  it("calculates physical damage", () => {
    const atk = { hp: 100, atk: 20, mag: 5, def: 10, res: 5, spd: 5 };
    const def = { hp: 100, atk: 5, mag: 5, def: 10, res: 5, spd: 5 };
    const dmg = calcDamage(atk, def, 1.0, false, 1.0);
    expect(dmg).toBe(Math.round(20 * 1.0 - 10 * 0.5)); // 15
  });

  it("applies element multiplier", () => {
    const atk = { hp: 100, atk: 20, mag: 5, def: 10, res: 5, spd: 5 };
    const def = { hp: 100, atk: 5, mag: 5, def: 10, res: 5, spd: 5 };
    const dmg = calcDamage(atk, def, 1.0, false, 1.5);
    expect(dmg).toBe(Math.round(15 * 1.5)); // 23
  });

  it("minimum damage is 1", () => {
    const atk = { hp: 100, atk: 1, mag: 1, def: 10, res: 5, spd: 5 };
    const def = { hp: 100, atk: 5, mag: 5, def: 100, res: 5, spd: 5 };
    const dmg = calcDamage(atk, def, 1.0, false, 1.0);
    expect(dmg).toBeGreaterThanOrEqual(1);
  });
});
```

**Step 4: Run tests**

Run: `pnpm vitest run lib/rpg/stats.test.ts`
Expected: PASS (10 tests)

**Step 5: Commit**

```bash
git add lib/rpg/classes.ts lib/rpg/stats.ts lib/rpg/stats.test.ts
git commit -m "feat(rpg): add class definitions and stat calculator with TDD"
```

---

### Task 3: Battle Engine (Pure Functions)

**Files:**
- Create: `lib/rpg/battle-engine.ts`
- Test: `lib/rpg/battle-engine.test.ts`

**Step 1: Write failing tests**

```typescript
// lib/rpg/battle-engine.test.ts
import { describe, it, expect } from "vitest";
import { createBattle, resolveTurn, isGameOver } from "./battle-engine";
import type { BattleUnit, BattleAction } from "./types";

function makeUnit(overrides: Partial<BattleUnit> = {}): BattleUnit {
  return {
    avatarId: "a1",
    name: "Test",
    className: "knight",
    level: 1,
    stats: { hp: 100, atk: 15, mag: 5, def: 10, res: 5, spd: 8 },
    currentHp: 100,
    currentMp: 30,
    skills: [
      { id: "shield_bash", name: "Shield Bash", element: "physical", power: 1.2, cost: 5, target: "enemy" },
    ],
    element: "physical",
    ...overrides,
  };
}

describe("createBattle", () => {
  it("initializes battle with correct state", () => {
    const a = makeUnit({ avatarId: "a1", stats: { hp: 100, atk: 10, mag: 5, def: 10, res: 5, spd: 10 } });
    const b = makeUnit({ avatarId: "b1", stats: { hp: 100, atk: 10, mag: 5, def: 10, res: 5, spd: 5 } });
    const battle = createBattle("battle-1", a, b);
    expect(battle.status).toBe("active");
    expect(battle.currentTurn).toBe("a"); // a has higher spd
    expect(battle.turnNumber).toBe(1);
    expect(battle.log).toHaveLength(0);
  });

  it("assigns first turn to faster unit", () => {
    const slow = makeUnit({ avatarId: "a1", stats: { hp: 100, atk: 10, mag: 5, def: 10, res: 5, spd: 3 } });
    const fast = makeUnit({ avatarId: "b1", stats: { hp: 100, atk: 10, mag: 5, def: 10, res: 5, spd: 15 } });
    const battle = createBattle("b1", slow, fast);
    expect(battle.currentTurn).toBe("b");
  });
});

describe("resolveTurn", () => {
  it("deals damage with basic attack", () => {
    const a = makeUnit({ avatarId: "a1" });
    const b = makeUnit({ avatarId: "b1" });
    const battle = createBattle("b1", a, b);
    const action: BattleAction = { type: "attack" };
    const result = resolveTurn(battle, action);
    expect(result.state.playerB.currentHp).toBeLessThan(100);
    expect(result.turnResult.damage).toBeGreaterThan(0);
  });

  it("uses skill and deducts MP", () => {
    const a = makeUnit({ avatarId: "a1" });
    const b = makeUnit({ avatarId: "b1" });
    const battle = createBattle("b1", a, b);
    const action: BattleAction = { type: "skill", skillId: "shield_bash" };
    const result = resolveTurn(battle, action);
    expect(result.state.playerA.currentMp).toBe(30 - 5);
    expect(result.turnResult.damage).toBeGreaterThan(0);
  });

  it("defend halves incoming damage next turn", () => {
    const a = makeUnit({ avatarId: "a1" });
    const b = makeUnit({ avatarId: "b1" });
    const battle = createBattle("b1", a, b);

    // A defends
    const r1 = resolveTurn(battle, { type: "defend" });
    expect(r1.turnResult.damage).toBe(0);

    // B attacks (A should take reduced damage)
    const r2 = resolveTurn(r1.state, { type: "attack" });
    // Check that damage is lower than normal
    const normalBattle = createBattle("b2", a, b);
    // Advance to B's turn by having A attack first
    const normalR1 = resolveTurn(normalBattle, { type: "attack" });
    const normalR2 = resolveTurn(normalR1.state, { type: "attack" });
    expect(r2.turnResult.damage).toBeLessThan(normalR2.turnResult.damage);
  });

  it("switches turn after action", () => {
    const a = makeUnit({ avatarId: "a1" });
    const b = makeUnit({ avatarId: "b1" });
    const battle = createBattle("b1", a, b);
    expect(battle.currentTurn).toBe("a");
    const result = resolveTurn(battle, { type: "attack" });
    expect(result.state.currentTurn).toBe("b");
  });
});

describe("isGameOver", () => {
  it("returns null when both alive", () => {
    const a = makeUnit({ currentHp: 50 });
    const b = makeUnit({ currentHp: 50 });
    const battle = createBattle("b1", a, b);
    expect(isGameOver(battle)).toBeNull();
  });

  it("returns 'a' when B is dead", () => {
    const a = makeUnit({ currentHp: 50 });
    const b = makeUnit({ currentHp: 0 });
    const battle = createBattle("b1", a, b);
    expect(isGameOver(battle)).toBe("a");
  });

  it("returns 'b' when A is dead", () => {
    const a = makeUnit({ currentHp: 0 });
    const b = makeUnit({ currentHp: 50 });
    const battle = createBattle("b1", a, b);
    expect(isGameOver(battle)).toBe("b");
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run lib/rpg/battle-engine.test.ts`
Expected: FAIL (module not found)

**Step 3: Implement battle engine**

```typescript
// lib/rpg/battle-engine.ts
import type { BattleState, BattleUnit, BattleAction, TurnResult } from "./types";
import { getElementMultiplier, calcDamage } from "./stats";
import { TURN_TIMEOUT_SECONDS } from "./types";

export function createBattle(id: string, playerA: BattleUnit, playerB: BattleUnit): BattleState {
  const firstTurn = playerA.stats.spd >= playerB.stats.spd ? "a" : "b";
  return {
    id,
    playerA: { ...playerA },
    playerB: { ...playerB },
    currentTurn: firstTurn,
    turnNumber: 1,
    turnDeadline: Date.now() + TURN_TIMEOUT_SECONDS * 1000,
    status: "active",
    winner: null,
    log: [],
  };
}

export function resolveTurn(
  state: BattleState,
  action: BattleAction
): { state: BattleState; turnResult: TurnResult } {
  const isA = state.currentTurn === "a";
  const actor = isA ? { ...state.playerA } : { ...state.playerB };
  const target = isA ? { ...state.playerB } : { ...state.playerA };

  let damage = 0;
  let healing = 0;
  let elementMultiplier = 1.0;
  const effects: string[] = [];

  switch (action.type) {
    case "attack": {
      elementMultiplier = getElementMultiplier(actor.element, target.element);
      damage = calcDamage(actor.stats, target.stats, 1.0, false, elementMultiplier);
      target.currentHp = Math.max(0, target.currentHp - damage);
      break;
    }
    case "skill": {
      const skill = actor.skills.find((s) => s.id === action.skillId);
      if (!skill || actor.currentMp < skill.cost) {
        // Fallback to basic attack if invalid/no MP
        elementMultiplier = getElementMultiplier(actor.element, target.element);
        damage = calcDamage(actor.stats, target.stats, 1.0, false, elementMultiplier);
        target.currentHp = Math.max(0, target.currentHp - damage);
        break;
      }
      actor.currentMp -= skill.cost;
      const isMagic = skill.element !== "physical";
      elementMultiplier = getElementMultiplier(skill.element, target.element);

      if (skill.effect === "heal") {
        healing = Math.round(actor.stats.mag * skill.power);
        actor.currentHp = Math.min(actor.stats.hp, actor.currentHp + healing);
        effects.push("heal");
      } else if (skill.effect === "buff_def") {
        // Temporary def boost stored as effect
        effects.push("buff_def");
      } else if (skill.effect === "buff_atk") {
        effects.push("buff_atk");
      } else {
        damage = calcDamage(actor.stats, target.stats, skill.power, isMagic, elementMultiplier);
        target.currentHp = Math.max(0, target.currentHp - damage);
      }
      break;
    }
    case "defend": {
      effects.push("defending");
      break;
    }
    case "item": {
      // MVP: no items yet, treat as defend
      effects.push("defending");
      break;
    }
  }

  // Check if defender was defending (halve damage)
  // This is handled by checking log for previous defending effect
  const lastLog = state.log[state.log.length - 1];
  if (lastLog?.effects.includes("defending") && damage > 0) {
    const reducedDamage = Math.max(1, Math.floor(damage / 2));
    // Restore the difference
    target.currentHp = Math.min(target.stats.hp, target.currentHp + (damage - reducedDamage));
    damage = reducedDamage;
  }

  const turnResult: TurnResult = {
    actorId: actor.avatarId,
    action,
    targetId: target.avatarId,
    damage,
    healing,
    elementMultiplier,
    isCrit: false,
    effects,
  };

  const nextTurn = isA ? "b" : "a";
  const newState: BattleState = {
    ...state,
    playerA: isA ? actor : target,
    playerB: isA ? target : actor,
    currentTurn: nextTurn,
    turnNumber: state.turnNumber + 1,
    turnDeadline: Date.now() + TURN_TIMEOUT_SECONDS * 1000,
    log: [...state.log, turnResult],
  };

  // Check game over
  const winner = isGameOver(newState);
  if (winner) {
    newState.status = "finished";
    newState.winner = winner;
  }

  return { state: newState, turnResult };
}

export function isGameOver(state: BattleState): "a" | "b" | "draw" | null {
  if (state.playerA.currentHp <= 0 && state.playerB.currentHp <= 0) return "draw";
  if (state.playerB.currentHp <= 0) return "a";
  if (state.playerA.currentHp <= 0) return "b";
  return null;
}
```

**Step 4: Run tests**

Run: `pnpm vitest run lib/rpg/battle-engine.test.ts`
Expected: PASS (8 tests)

**Step 5: Commit**

```bash
git add lib/rpg/battle-engine.ts lib/rpg/battle-engine.test.ts
git commit -m "feat(rpg): add turn-based battle engine with TDD"
```

---

### Task 4: Database Migration for RPG

**Files:**
- Create: `supabase/migrations/20260226000000_rpg_schema.sql`

**Step 1: Write migration**

```sql
-- supabase/migrations/20260226000000_rpg_schema.sql

-- Avatars
CREATE TABLE avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  class text NOT NULL CHECK (class IN ('knight', 'mage', 'ranger', 'healer')),
  level integer NOT NULL DEFAULT 1,
  exp integer NOT NULL DEFAULT 0,
  seed jsonb NOT NULL,
  equipment jsonb NOT NULL DEFAULT '{"weapon":null,"armor":null,"accessory":null}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id) -- one avatar per user for MVP
);

-- Equipment master
CREATE TABLE equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slot text NOT NULL CHECK (slot IN ('weapon', 'armor', 'accessory')),
  rarity text NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'legendary')),
  stat_bonus jsonb NOT NULL DEFAULT '{}',
  sprite_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User inventory
CREATE TABLE user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  quantity integer NOT NULL DEFAULT 1,
  obtained_at timestamptz DEFAULT now()
);

-- Battle sessions (active)
CREATE TABLE battle_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a uuid NOT NULL REFERENCES auth.users(id),
  player_b uuid REFERENCES auth.users(id),
  state jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  winner_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Battle history
CREATE TABLE battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a uuid NOT NULL REFERENCES auth.users(id),
  player_b uuid NOT NULL REFERENCES auth.users(id),
  winner_id uuid,
  turns jsonb NOT NULL DEFAULT '[]',
  rating_change_a integer NOT NULL DEFAULT 0,
  rating_change_b integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Leaderboard
CREATE TABLE leaderboard (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL DEFAULT 1000,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- User currency
CREATE TABLE user_currency (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gems integer NOT NULL DEFAULT 0,
  gold integer NOT NULL DEFAULT 100,
  updated_at timestamptz DEFAULT now()
);

-- Gacha pools
CREATE TABLE gacha_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  items jsonb NOT NULL,
  rates jsonb NOT NULL,
  cost_gems integer NOT NULL DEFAULT 10,
  active boolean NOT NULL DEFAULT true
);

-- Gacha history
CREATE TABLE gacha_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id uuid NOT NULL REFERENCES gacha_pools(id),
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_avatars_user_id ON avatars(user_id);
CREATE INDEX idx_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_battle_sessions_status ON battle_sessions(status);
CREATE INDEX idx_battles_players ON battles(player_a, player_b);
CREATE INDEX idx_leaderboard_rating ON leaderboard(rating DESC);
CREATE INDEX idx_gacha_history_user ON gacha_history(user_id);

-- RLS
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_history ENABLE ROW LEVEL SECURITY;

-- Policies: avatars
CREATE POLICY "Users can read own avatar" ON avatars FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own avatar" ON avatars FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own avatar" ON avatars FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policies: equipment (public read)
CREATE POLICY "Equipment is publicly readable" ON equipment FOR SELECT TO authenticated, anon USING (true);

-- Policies: inventory
CREATE POLICY "Users can read own inventory" ON user_inventory FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON user_inventory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policies: battle sessions (both players can read)
CREATE POLICY "Players can read own battles" ON battle_sessions FOR SELECT TO authenticated
  USING (auth.uid() = player_a OR auth.uid() = player_b);
CREATE POLICY "Users can create battle sessions" ON battle_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = player_a);

-- Policies: battle history
CREATE POLICY "Players can read own battle history" ON battles FOR SELECT TO authenticated
  USING (auth.uid() = player_a OR auth.uid() = player_b);

-- Policies: leaderboard (public read)
CREATE POLICY "Leaderboard is publicly readable" ON leaderboard FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can upsert own leaderboard" ON leaderboard FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies: currency
CREATE POLICY "Users can read own currency" ON user_currency FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own currency" ON user_currency FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies: gacha
CREATE POLICY "Gacha pools are publicly readable" ON gacha_pools FOR SELECT TO authenticated, anon USING (active = true);
CREATE POLICY "Users can read own gacha history" ON gacha_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

**Step 2: Push migration**

```bash
export SUPABASE_ACCESS_TOKEN="sbp_0c1939d891e45d2828e489f4183f905b7c7f7ebd"
echo "Y" | supabase db push --linked
```

Expected: `Applying migration 20260226000000_rpg_schema.sql... Finished`

**Step 3: Commit**

```bash
git add supabase/migrations/20260226000000_rpg_schema.sql
git commit -m "feat(rpg): add database schema for avatars, battles, gacha"
```

---

### Task 5: Avatar Sprite Generator

**Files:**
- Create: `scripts/generate-avatar-parts.ts`
- Create: `lib/rpg/avatar-composer.ts`
- Test: `lib/rpg/avatar-composer.test.ts`

**Goal:** Generate layered sprite parts (body, hair, eyes, outfit, weapon) and a composer that assembles them into a 32x32 avatar PNG.

**Step 1: Create sprite part generator script**

This script generates the individual sprite part PNGs that will be layered to compose avatars. Uses node-canvas (already installed) following the pattern from `scripts/generate-pixel-art.ts`.

Creates files in `public/sprites/{layer}/{variant}.png` (e.g. `public/sprites/body/0_0.png` for body type 0, skin tone 0).

**Step 2: Write avatar composer**

```typescript
// lib/rpg/avatar-composer.ts
import type { AvatarSeed, ClassName } from "./types";

/** Generate a random avatar seed */
export function generateSeed(): AvatarSeed {
  return {
    body: Math.floor(Math.random() * 3),
    skinTone: Math.floor(Math.random() * 6),
    hair: Math.floor(Math.random() * 8),
    hairColor: Math.floor(Math.random() * 8),
    eyes: Math.floor(Math.random() * 6),
    outfit: Math.floor(Math.random() * 10),
    outfitColor: Math.floor(Math.random() * 6),
  };
}

/** Convert seed to a deterministic hash for caching */
export function seedToKey(seed: AvatarSeed, className: ClassName): string {
  return `${className}_${Object.values(seed).join("_")}`;
}

/** Get sprite layer URLs for a given seed and class */
export function getSpriteUrls(seed: AvatarSeed, className: ClassName): string[] {
  return [
    `/sprites/body/${seed.body}_${seed.skinTone}.png`,
    `/sprites/hair/${seed.hair}_${seed.hairColor}.png`,
    `/sprites/eyes/${seed.eyes}.png`,
    `/sprites/outfit/${seed.outfit}_${seed.outfitColor}.png`,
    `/sprites/weapon/${className}.png`,
  ];
}
```

**Step 3: Write tests**

```typescript
// lib/rpg/avatar-composer.test.ts
import { describe, it, expect } from "vitest";
import { generateSeed, seedToKey, getSpriteUrls } from "./avatar-composer";

describe("generateSeed", () => {
  it("generates seed with correct ranges", () => {
    const seed = generateSeed();
    expect(seed.body).toBeGreaterThanOrEqual(0);
    expect(seed.body).toBeLessThanOrEqual(2);
    expect(seed.outfit).toBeLessThanOrEqual(9);
  });
});

describe("seedToKey", () => {
  it("produces deterministic key", () => {
    const seed = { body: 1, skinTone: 2, hair: 3, hairColor: 4, eyes: 5, outfit: 6, outfitColor: 3 };
    expect(seedToKey(seed, "knight")).toBe("knight_1_2_3_4_5_6_3");
  });
});

describe("getSpriteUrls", () => {
  it("returns correct layer URLs", () => {
    const seed = { body: 0, skinTone: 1, hair: 2, hairColor: 3, eyes: 4, outfit: 5, outfitColor: 2 };
    const urls = getSpriteUrls(seed, "mage");
    expect(urls).toHaveLength(5);
    expect(urls[0]).toBe("/sprites/body/0_1.png");
    expect(urls[4]).toBe("/sprites/weapon/mage.png");
  });
});
```

**Step 4: Run tests**

Run: `pnpm vitest run lib/rpg/avatar-composer.test.ts`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add lib/rpg/avatar-composer.ts lib/rpg/avatar-composer.test.ts scripts/generate-avatar-parts.ts
git commit -m "feat(rpg): add avatar sprite composer and part generator"
```

---

### Task 6: Avatar API Routes

**Files:**
- Create: `app/api/rpg/avatar/route.ts` (GET own avatar, POST create avatar)
- Create: `app/api/rpg/avatar/[id]/route.ts` (GET specific avatar)

**Step 1: Implement avatar routes**

POST `/api/rpg/avatar` — Create avatar (class + name → generate seed → save to DB).
GET `/api/rpg/avatar` — Get current user's avatar.
GET `/api/rpg/avatar/[id]` — Get any avatar by ID (for battle display).

Server-side validation: one avatar per user, valid class name, name length 2-16 chars.

**Step 2: Commit**

```bash
git add app/api/rpg/avatar/
git commit -m "feat(rpg): add avatar CRUD API routes"
```

---

### Task 7: RPG Home Page

**Files:**
- Create: `app/rpg/page.tsx` (RPG home — avatar display, battle button)
- Create: `components/rpg/AvatarDisplay.tsx` (Canvas avatar renderer)
- Create: `components/rpg/ClassSelect.tsx` (New player class selection)
- Create: `components/rpg/StatsPanel.tsx` (Avatar stats panel)
- Create: `hooks/useAvatar.ts` (Avatar data hook)

**Goal:** Show user's avatar with stats. If no avatar, show class selection. Battle button starts matchmaking.

**Step 1: Build components, commit**

```bash
git add app/rpg/ components/rpg/ hooks/useAvatar.ts
git commit -m "feat(rpg): add home page with avatar display and class selection"
```

---

### Task 8: Matchmaking API

**Files:**
- Create: `app/api/rpg/matchmake/route.ts`
- Create: `lib/rpg/matchmaking.ts`
- Test: `lib/rpg/matchmaking.test.ts`

**Goal:** Player joins queue → system finds opponent within ±100 rating → creates battle session.

**Step 1: Write matchmaking logic**

```typescript
// lib/rpg/matchmaking.ts
export function isRatingMatch(ratingA: number, ratingB: number, range: number = 100): boolean {
  return Math.abs(ratingA - ratingB) <= range;
}

export function calculateRatingChange(
  winnerRating: number,
  loserRating: number
): { winnerDelta: number; loserDelta: number } {
  const K = 32;
  const expectedWin = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const winnerDelta = Math.round(K * (1 - expectedWin));
  const loserDelta = -winnerDelta;
  return { winnerDelta, loserDelta };
}
```

**Step 2: Test, commit**

```bash
git add lib/rpg/matchmaking.ts lib/rpg/matchmaking.test.ts app/api/rpg/matchmake/
git commit -m "feat(rpg): add Elo matchmaking with rating calculation"
```

---

### Task 9: Supabase Edge Function — Battle Server

**Files:**
- Create: `supabase/functions/battle-turn/index.ts`
- Create: `supabase/functions/battle-turn/types.ts` (copy from lib/rpg/types.ts)

**Goal:** Server-authoritative turn resolution. Receives action via Realtime broadcast, validates, resolves turn, broadcasts result.

The Edge Function listens for `action` messages on the battle channel, runs the battle engine logic, and broadcasts `turn_result` back to both clients.

**Step 1: Write Edge Function**

Uses Deno runtime. Imports battle engine logic (copied for Edge Function isolation). Validates that the action comes from the correct player whose turn it is. Resolves turn and stores updated state in `battle_sessions` table.

**Step 2: Deploy**

```bash
export SUPABASE_ACCESS_TOKEN="sbp_..."
supabase functions deploy battle-turn --linked
```

**Step 3: Commit**

```bash
git add supabase/functions/battle-turn/
git commit -m "feat(rpg): add server-authoritative battle turn Edge Function"
```

---

### Task 10: Battle UI — Canvas Renderer

**Files:**
- Create: `components/rpg/BattleCanvas.tsx`
- Create: `components/rpg/BattleUI.tsx` (skill buttons, HP bars)
- Create: `components/rpg/BattleScene.tsx` (combines Canvas + UI)
- Create: `hooks/useBattle.ts` (battle state + Realtime connection)
- Create: `app/rpg/battle/[id]/page.tsx`

**Goal:** Full battle screen with Canvas rendering avatars/effects and React DOM for skill selection UI. Uses Supabase Realtime to listen for turn results.

**useBattle hook:**
- Subscribes to Supabase Realtime channel `battle:{id}`
- Sends actions via broadcast
- Receives turn results and updates local state
- Handles turn timer (30s countdown)

**BattleCanvas:**
- Draws battlefield background
- Renders player A (left) and player B (right) avatar sprites at 128x128
- Shows damage numbers floating up
- HP bar animations
- Skill effect particles (simple colored squares for MVP)

**BattleUI:**
- 4 action buttons: Attack, Skill 1, Skill 2, Skill 3
- Defend button
- Turn timer countdown
- MP display

**Step 1: Build components, commit**

```bash
git add components/rpg/Battle*.tsx hooks/useBattle.ts app/rpg/battle/
git commit -m "feat(rpg): add battle UI with Canvas renderer and Realtime sync"
```

---

### Task 11: Battle Result & EXP/Rating

**Files:**
- Create: `components/rpg/BattleResult.tsx`
- Modify: `hooks/useBattle.ts` (add result handling)
- Create: `app/api/rpg/battle/[id]/result/route.ts`

**Goal:** After battle ends, show result (Win/Lose), EXP gained, rating change, gold earned. Persist to `battles` table and update `leaderboard` + `avatars` (exp/level).

**Step 1: Build, commit**

```bash
git add components/rpg/BattleResult.tsx app/api/rpg/battle/
git commit -m "feat(rpg): add battle result with EXP and rating updates"
```

---

### Task 12: Leaderboard

**Files:**
- Create: `app/rpg/leaderboard/page.tsx`
- Create: `components/rpg/LeaderboardTable.tsx`
- Create: `app/api/rpg/leaderboard/route.ts`

**Goal:** Top 100 leaderboard by rating. Shows rank, avatar, name, class, rating, W/L record.

**Step 1: Build, commit**

```bash
git add app/rpg/leaderboard/ components/rpg/LeaderboardTable.tsx app/api/rpg/leaderboard/
git commit -m "feat(rpg): add leaderboard page with top 100 rankings"
```

---

### Task 13: Gacha System

**Files:**
- Create: `lib/rpg/gacha.ts`
- Test: `lib/rpg/gacha.test.ts`
- Create: `app/api/rpg/gacha/pull/route.ts`
- Create: `app/rpg/gacha/page.tsx`
- Create: `components/rpg/GachaAnimation.tsx`
- Create: `components/rpg/GachaResult.tsx`
- Create: `scripts/seed-equipment.ts`

**Goal:** Pull equipment from gacha pool. Costs gems. Rates: Common 60%, Uncommon 25%, Rare 10%, Legendary 5%. Pity at 20 (rare) and 50 (legendary). Animation on pull.

**Step 1: Write gacha logic (pure function)**

```typescript
// lib/rpg/gacha.ts
import type { Rarity } from "./types";

const RATES: Record<Rarity, number> = {
  common: 0.60,
  uncommon: 0.25,
  rare: 0.10,
  legendary: 0.05,
};

export function rollRarity(pullsSinceRare: number, pullsSinceLegendary: number): Rarity {
  // Pity system
  if (pullsSinceLegendary >= 49) return "legendary";
  if (pullsSinceRare >= 19) return "rare";

  const roll = Math.random();
  let cumulative = 0;
  for (const [rarity, rate] of Object.entries(RATES) as [Rarity, number][]) {
    cumulative += rate;
    if (roll < cumulative) return rarity;
  }
  return "common";
}
```

**Step 2: Test, build pages, seed equipment data, commit**

```bash
git add lib/rpg/gacha.ts lib/rpg/gacha.test.ts app/api/rpg/gacha/ app/rpg/gacha/ components/rpg/Gacha*.tsx scripts/seed-equipment.ts
git commit -m "feat(rpg): add gacha system with pity and equipment drops"
```

---

### Task 14: Gem Purchase (Stripe)

**Files:**
- Create: `app/api/rpg/gems/purchase/route.ts`
- Modify: `app/api/webhook/stripe/route.ts` (add gem fulfillment)
- Create: `app/rpg/shop/page.tsx`
- Create: `components/rpg/GemShop.tsx`

**Goal:** Gem packages: 100/$0.99, 500/$3.99, 1200/$7.99. Stripe Checkout → webhook → credit gems to user_currency.

**Step 1: Create Stripe products**

```bash
stripe products create --api-key "sk_test_..." -d name="100 Gems"
stripe prices create --api-key "sk_test_..." -d product="prod_xxx" -d unit_amount=99 -d currency=usd
# Repeat for 500 and 1200 gem packages
```

**Step 2: Build routes and pages, commit**

```bash
git add app/api/rpg/gems/ app/rpg/shop/ components/rpg/GemShop.tsx
git commit -m "feat(rpg): add gem shop with Stripe one-time payments"
```

---

### Task 15: Navigation & Layout Update

**Files:**
- Modify: `components/layout/Header.tsx` (add RPG nav links)
- Modify: `app/page.tsx` (update landing to feature RPG)
- Create: `app/rpg/layout.tsx` (RPG section layout)

**Goal:** Update site navigation with RPG links: Home, Battle, Leaderboard, Gacha, Shop.

**Step 1: Update, commit**

```bash
git add components/layout/Header.tsx app/page.tsx app/rpg/layout.tsx
git commit -m "feat(rpg): update navigation and landing page for RPG"
```

---

### Task 16: Sprite Asset Generation

**Files:**
- Run: `scripts/generate-avatar-parts.ts`
- Output: `public/sprites/body/`, `public/sprites/hair/`, etc.
- Create: `public/sprites/bg/` (3 battlefield backgrounds)

**Goal:** Generate all sprite parts (body types, hair, eyes, outfits, weapons) + battle backgrounds. Uses node-canvas pattern from existing `scripts/generate-pixel-art.ts`.

**Step 1: Run generator, commit assets**

```bash
npx tsx scripts/generate-avatar-parts.ts
git add public/sprites/
git commit -m "feat(rpg): generate avatar sprite parts and battlefield backgrounds"
```

---

### Task 17: Integration Test & Build Verification

**Step 1: Run all tests**

```bash
pnpm vitest run
```

Expected: All tests pass (existing PixelGuess tests + new RPG tests)

**Step 2: Build**

```bash
pnpm build
```

Expected: Build succeeds with no TypeScript errors

**Step 3: Deploy**

```bash
vercel --prod
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(rpg): finalize Pixel RPG Social MVP"
git push
```
