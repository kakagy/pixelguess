"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GuessDistribution } from "./GuessDistribution";

interface Stats {
  total_played: number;
  total_solved: number;
  current_streak: number;
  max_streak: number;
  guess_distribution: Record<string, number>;
}

export function StatsDisplay() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <p className="font-mono text-muted-foreground">Loading...</p>;

  const winRate = stats.total_played > 0
    ? Math.round((stats.total_solved / stats.total_played) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Played", value: stats.total_played },
          { label: "Win %", value: `${winRate}%` },
          { label: "Streak", value: stats.current_streak },
          { label: "Max", value: stats.max_streak },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold font-mono">{s.value}</div>
              <div className="text-xs text-muted-foreground font-mono">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <GuessDistribution distribution={stats.guess_distribution} />
    </div>
  );
}
