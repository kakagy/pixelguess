"use client";
import { BattleCanvas } from "./BattleCanvas";
import { BattleUI } from "./BattleUI";
import { BattleResult } from "./BattleResult";
import { useBattle } from "@/hooks/useBattle";
import { useRouter } from "next/navigation";

interface Props {
  battleId: string;
}

export function BattleScene({ battleId }: Props) {
  const { battleState, lastResult, myRole, isMyTurn, timeLeft, loading, error, sendAction } = useBattle(battleId);
  const router = useRouter();

  if (loading) {
    return <div className="text-center text-white font-mono py-20">Loading battle...</div>;
  }

  if (error || !battleState || !myRole) {
    return <div className="text-center text-red-500 font-mono py-20">{error || "Battle not found"}</div>;
  }

  return (
    <div className="p-4">
      <BattleCanvas battleState={battleState} lastResult={lastResult} />
      <BattleUI
        battleState={battleState}
        isMyTurn={isMyTurn}
        myRole={myRole}
        timeLeft={timeLeft}
        onAction={sendAction}
      />
      {battleState.status === "finished" && (
        <div className="mt-6">
          <BattleResult
            battleId={battleId}
            winner={battleState.winner}
            myRole={myRole}
          />
          <div className="text-center mt-4">
            <button
              onClick={() => router.push("/rpg")}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-mono"
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
