"use client";
import { useRef, useEffect, useState } from "react";
import type { BattleState, TurnResult } from "@/lib/rpg/types";

interface Props {
  battleState: BattleState;
  lastResult: TurnResult | null;
}

interface DamageFloat {
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
}

export function BattleCanvas({ battleState, lastResult }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [damageFloats, setDamageFloats] = useState<DamageFloat[]>([]);
  const bgRef = useRef<HTMLImageElement | null>(null);

  const WIDTH = 480;
  const HEIGHT = 320;

  // Load background
  useEffect(() => {
    const bg = new Image();
    bg.src = "/sprites/bg/0.png";
    bg.onload = () => { bgRef.current = bg; };
  }, []);

  // Show damage float when last result changes
  useEffect(() => {
    if (!lastResult) return;
    const isActorA = lastResult.actorId === battleState.playerA.avatarId;
    const targetX = isActorA ? 340 : 100;
    const targetY = 120;

    if (lastResult.damage > 0) {
      const float: DamageFloat = {
        x: targetX,
        y: targetY,
        text: `-${lastResult.damage}`,
        color: lastResult.elementMultiplier > 1 ? "#ff4444" : "#ffffff",
        opacity: 1,
      };
      setDamageFloats(prev => [...prev, float]);
      setTimeout(() => {
        setDamageFloats(prev => prev.filter(f => f !== float));
      }, 1500);
    }
    if (lastResult.healing > 0) {
      const float: DamageFloat = {
        x: isActorA ? 100 : 340,
        y: 120,
        text: `+${lastResult.healing}`,
        color: "#44ff44",
        opacity: 1,
      };
      setDamageFloats(prev => [...prev, float]);
      setTimeout(() => {
        setDamageFloats(prev => prev.filter(f => f !== float));
      }, 1500);
    }
  }, [lastResult, battleState.playerA.avatarId]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const render = () => {
      // Background
      if (bgRef.current) {
        ctx.drawImage(bgRef.current, 0, 0, WIDTH, HEIGHT);
      } else {
        // Fallback gradient bg
        const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        grad.addColorStop(0, "#1a1a2e");
        grad.addColorStop(1, "#16213e");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Ground
        ctx.fillStyle = "#2d4a22";
        ctx.fillRect(0, HEIGHT * 0.7, WIDTH, HEIGHT * 0.3);
      }

      // Avatar A (left)
      drawAvatar(ctx, 60, 100, battleState.playerA, "#4488ff");

      // Avatar B (right)
      drawAvatar(ctx, 300, 100, battleState.playerB, "#ff4444");

      // HP Bars
      drawHpBar(ctx, 20, 260, battleState.playerA, "#4488ff");
      drawHpBar(ctx, 260, 260, battleState.playerB, "#ff4444");

      // Damage floats
      damageFloats.forEach(f => {
        ctx.font = "bold 24px monospace";
        ctx.fillStyle = f.color;
        ctx.textAlign = "center";
        ctx.fillText(f.text, f.x, f.y);
      });

      // Status text
      if (battleState.status === "finished") {
        ctx.font = "bold 32px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(
          battleState.winner === "draw"
            ? "DRAW!"
            : `${battleState.winner === "a" ? battleState.playerA.name : battleState.playerB.name} WINS!`,
          WIDTH / 2, 40
        );
      }
    };

    render();
  }, [battleState, damageFloats]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="w-full max-w-lg mx-auto rounded-lg border border-gray-700"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  unit: { name: string; level: number },
  color: string
) {
  // Simple pixel art avatar placeholder
  const size = 96;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);

  // Name
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(unit.name, x + size / 2, y - 8);

  // Level
  ctx.font = "10px monospace";
  ctx.fillStyle = "#cccccc";
  ctx.fillText(`Lv.${unit.level}`, x + size / 2, y + size + 15);
}

function drawHpBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  unit: { name: string; currentHp: number; currentMp: number; stats: { hp: number } },
  color: string
) {
  const barWidth = 180;
  const barHeight = 16;
  const hpRatio = unit.currentHp / unit.stats.hp;
  const mpRatio = unit.currentMp / 30;

  // HP label
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(`${unit.name}`, x, y - 5);

  // HP bar background
  ctx.fillStyle = "#333333";
  ctx.fillRect(x, y, barWidth, barHeight);

  // HP bar fill
  ctx.fillStyle = hpRatio > 0.5 ? "#44cc44" : hpRatio > 0.2 ? "#cccc44" : "#cc4444";
  ctx.fillRect(x, y, barWidth * hpRatio, barHeight);

  // HP text
  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(`${unit.currentHp}/${unit.stats.hp}`, x + barWidth / 2, y + 12);

  // MP bar
  ctx.fillStyle = "#333333";
  ctx.fillRect(x, y + barHeight + 3, barWidth, 8);
  ctx.fillStyle = "#4488ff";
  ctx.fillRect(x, y + barHeight + 3, barWidth * mpRatio, 8);
  ctx.font = "8px monospace";
  ctx.fillText(`MP ${unit.currentMp}/30`, x + barWidth / 2, y + barHeight + 10);
}
