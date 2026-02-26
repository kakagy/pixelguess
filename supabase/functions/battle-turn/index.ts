import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Inline battle engine logic for Edge Function isolation (Deno can't import from lib/)

interface Stats {
  hp: number; atk: number; mag: number; def: number; res: number; spd: number;
}

interface SkillDef {
  id: string; name: string; element: string; power: number; cost: number;
  target: string; effect?: string;
}

interface BattleUnit {
  avatarId: string; name: string; className: string; level: number;
  stats: Stats; currentHp: number; currentMp: number; skills: SkillDef[]; element: string;
}

interface BattleState {
  id: string; playerA: BattleUnit; playerB: BattleUnit;
  currentTurn: "a" | "b"; turnNumber: number; turnDeadline: number;
  status: string; winner: string | null; log: any[];
}

type BattleAction =
  | { type: "attack" }
  | { type: "skill"; skillId: string }
  | { type: "defend" }
  | { type: "item"; itemId: string };

function getElementMultiplier(attacker: string, defender: string): number {
  if (attacker === "physical" || defender === "physical") return 1.0;
  const advantages: Record<string, string> = { fire: "wind", wind: "water", water: "fire" };
  if (advantages[attacker] === defender) return 1.5;
  if (advantages[defender] === attacker) return 0.75;
  return 1.0;
}

function calcDamage(atkStats: Stats, defStats: Stats, power: number, isMagic: boolean, mult: number): number {
  const atk = isMagic ? atkStats.mag : atkStats.atk;
  const def = isMagic ? defStats.res : defStats.def;
  return Math.round(Math.max(1, atk * power - def * 0.5) * mult);
}

function resolveTurn(state: BattleState, action: BattleAction) {
  const isA = state.currentTurn === "a";
  const actor = isA ? { ...state.playerA } : { ...state.playerB };
  const target = isA ? { ...state.playerB } : { ...state.playerA };

  let damage = 0, healing = 0, elementMultiplier = 1.0;
  const effects: string[] = [];

  switch (action.type) {
    case "attack": {
      elementMultiplier = getElementMultiplier(actor.element, target.element);
      damage = calcDamage(actor.stats, target.stats, 1.0, false, elementMultiplier);
      target.currentHp = Math.max(0, target.currentHp - damage);
      break;
    }
    case "skill": {
      const skill = actor.skills.find(s => s.id === (action as { type: "skill"; skillId: string }).skillId);
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
      } else if (skill.effect?.startsWith("buff")) {
        effects.push(skill.effect);
      } else {
        damage = calcDamage(actor.stats, target.stats, skill.power, isMagic, elementMultiplier);
        target.currentHp = Math.max(0, target.currentHp - damage);
      }
      break;
    }
    case "defend": { effects.push("defending"); break; }
    case "item": { effects.push("defending"); break; }
  }

  const lastLog = state.log[state.log.length - 1];
  if (lastLog?.effects?.includes("defending") && damage > 0) {
    const reduced = Math.max(1, Math.floor(damage / 2));
    target.currentHp = Math.min(target.stats.hp, target.currentHp + (damage - reduced));
    damage = reduced;
  }

  const turnResult = {
    actorId: actor.avatarId, action, targetId: target.avatarId,
    damage, healing, elementMultiplier, isCrit: false, effects,
  };

  const newState: BattleState = {
    ...state,
    playerA: isA ? actor : target,
    playerB: isA ? target : actor,
    currentTurn: isA ? "b" : "a",
    turnNumber: state.turnNumber + 1,
    turnDeadline: Date.now() + 30000,
    log: [...state.log, turnResult],
  };

  if (newState.playerA.currentHp <= 0 || newState.playerB.currentHp <= 0) {
    newState.status = "finished";
    if (newState.playerA.currentHp <= 0 && newState.playerB.currentHp <= 0) newState.winner = "draw";
    else if (newState.playerB.currentHp <= 0) newState.winner = "a";
    else newState.winner = "b";
  }

  return { state: newState, turnResult };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey" },
    });
  }

  try {
    const { battleId, playerId, action } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load battle session
    const { data: session, error: sessionError } = await supabase
      .from("battle_sessions")
      .select("*")
      .eq("id", battleId)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Battle not found" }), { status: 404 });
    }

    if (session.status !== "active") {
      return new Response(JSON.stringify({ error: "Battle not active" }), { status: 400 });
    }

    const state = session.state as BattleState;

    // Validate it's the correct player's turn
    const isPlayerA = session.player_a === playerId;
    const isPlayerB = session.player_b === playerId;
    if (!isPlayerA && !isPlayerB) {
      return new Response(JSON.stringify({ error: "Not a participant" }), { status: 403 });
    }

    const expectedTurn = state.currentTurn;
    if ((expectedTurn === "a" && !isPlayerA) || (expectedTurn === "b" && !isPlayerB)) {
      return new Response(JSON.stringify({ error: "Not your turn" }), { status: 400 });
    }

    // Resolve turn
    const result = resolveTurn(state, action);

    // Update battle session
    const updateData: Record<string, unknown> = {
      state: result.state,
      updated_at: new Date().toISOString(),
    };

    if (result.state.status === "finished") {
      updateData.status = "finished";
      if (result.state.winner === "a") updateData.winner_id = session.player_a;
      else if (result.state.winner === "b") updateData.winner_id = session.player_b;
    }

    await supabase
      .from("battle_sessions")
      .update(updateData)
      .eq("id", battleId);

    return new Response(JSON.stringify({
      turnResult: result.turnResult,
      state: result.state,
    }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
});
