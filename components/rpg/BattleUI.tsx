"use client";
import type { BattleState, BattleAction, SkillDef } from "@/lib/rpg/types";

interface Props {
  battleState: BattleState;
  isMyTurn: boolean;
  myRole: "a" | "b";
  timeLeft: number;
  onAction: (action: BattleAction) => void;
}

export function BattleUI({ battleState, isMyTurn, myRole, timeLeft, onAction }: Props) {
  const myUnit = myRole === "a" ? battleState.playerA : battleState.playerB;

  if (battleState.status === "finished") {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto mt-4">
      <div className="flex justify-between items-center mb-3">
        <span className={`text-sm font-mono ${isMyTurn ? "text-green-400" : "text-gray-500"}`}>
          {isMyTurn ? "YOUR TURN" : "Waiting..."}
        </span>
        <span className={`text-sm font-mono ${timeLeft <= 10 ? "text-red-400" : "text-gray-400"}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onAction({ type: "attack" })}
          disabled={!isMyTurn}
          className="py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-mono font-bold transition-colors"
        >
          Attack
        </button>
        <button
          onClick={() => onAction({ type: "defend" })}
          disabled={!isMyTurn}
          className="py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-mono font-bold transition-colors"
        >
          Defend
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        {myUnit.skills.map((skill: SkillDef) => (
          <button
            key={skill.id}
            onClick={() => onAction({ type: "skill", skillId: skill.id })}
            disabled={!isMyTurn || myUnit.currentMp < skill.cost}
            className="py-2 px-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-mono text-xs transition-colors"
            title={`${skill.name} - ${skill.cost} MP`}
          >
            <div>{skill.name}</div>
            <div className="text-[10px] opacity-75">{skill.cost} MP</div>
          </button>
        ))}
      </div>
    </div>
  );
}
