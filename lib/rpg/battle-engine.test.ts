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
    expect(battle.currentTurn).toBe("a");
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

    const r1 = resolveTurn(battle, { type: "defend" });
    expect(r1.turnResult.damage).toBe(0);

    const r2 = resolveTurn(r1.state, { type: "attack" });
    const normalBattle = createBattle("b2", a, b);
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
