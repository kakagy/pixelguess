"use client";
import type { Avatar } from "@/lib/rpg/types";
import { computeStats } from "@/lib/rpg/stats";
import { EXP_PER_LEVEL, MAX_LEVEL } from "@/lib/rpg/types";

interface Props {
  avatar: Avatar;
}

export function StatsPanel({ avatar }: Props) {
  const stats = computeStats(avatar);
  const expToNext = EXP_PER_LEVEL - (avatar.exp % EXP_PER_LEVEL);
  const expProgress = ((avatar.exp % EXP_PER_LEVEL) / EXP_PER_LEVEL) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-bold font-mono text-lg">{avatar.name}</h3>
          <p className="text-xs text-gray-400 capitalize">
            {avatar.className} · Lv.{avatar.level}
          </p>
        </div>
        {avatar.level < MAX_LEVEL && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Next Lv: {expToNext} EXP</p>
            <div className="w-24 h-2 bg-gray-700 rounded-full mt-1">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${expProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {(["hp", "atk", "mag", "def", "res", "spd"] as const).map((stat) => (
          <div key={stat} className="bg-gray-900 rounded p-2">
            <div className="text-xs text-gray-500 uppercase font-mono">{stat}</div>
            <div className="font-bold font-mono">{stats[stat]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
