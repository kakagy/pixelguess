"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { BattleState, BattleAction, TurnResult } from "@/lib/rpg/types";
import { TURN_TIMEOUT_SECONDS } from "@/lib/rpg/types";

export function useBattle(battleId: string) {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [lastResult, setLastResult] = useState<TurnResult | null>(null);
  const [myRole, setMyRole] = useState<"a" | "b" | null>(null);
  const [timeLeft, setTimeLeft] = useState(TURN_TIMEOUT_SECONDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial battle state
  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const res = await fetch(`/api/rpg/battle/${battleId}`);
        const data = await res.json();
        if (data.battle) {
          setBattleState(data.battle.state);
          setMyRole(data.myRole);
        } else {
          setError("Battle not found");
        }
      } catch {
        setError("Failed to load battle");
      } finally {
        setLoading(false);
      }
    };
    fetchBattle();
  }, [battleId]);

  // Timer
  useEffect(() => {
    if (!battleState || battleState.status !== "active") return;

    setTimeLeft(TURN_TIMEOUT_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-defend on timeout
          if (myRole === battleState.currentTurn) {
            sendAction({ type: "defend" });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleState?.turnNumber, battleState?.status]);

  // Poll for updates (simple polling instead of complex Realtime setup)
  useEffect(() => {
    if (!battleState || battleState.status !== "active") return;
    if (myRole === battleState.currentTurn) return; // It's my turn, wait for my action

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rpg/battle/${battleId}`);
        const data = await res.json();
        if (data.battle?.state) {
          const newState = data.battle.state as BattleState;
          if (newState.turnNumber !== battleState.turnNumber) {
            setBattleState(newState);
            const latestResult = newState.log[newState.log.length - 1];
            if (latestResult) setLastResult(latestResult);
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [battleId, battleState?.turnNumber, myRole, battleState?.currentTurn, battleState?.status]);

  const sendAction = useCallback(async (action: BattleAction) => {
    if (!battleState || !myRole) return;

    try {
      const res = await fetch(`/api/rpg/battle/${battleId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.state) {
        setBattleState(data.state);
        if (data.turnResult) setLastResult(data.turnResult);
      }
    } catch {
      setError("Failed to send action");
    }
  }, [battleId, battleState, myRole]);

  const isMyTurn = myRole === battleState?.currentTurn;

  return {
    battleState, lastResult, myRole, isMyTurn, timeLeft, loading, error, sendAction,
  };
}
