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
      effects.push("defending");
      break;
    }
  }

  // Check if defender was defending (halve damage)
  const lastLog = state.log[state.log.length - 1];
  if (lastLog?.effects.includes("defending") && damage > 0) {
    const reducedDamage = Math.max(1, Math.floor(damage / 2));
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
