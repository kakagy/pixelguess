"use client";
import { useState, useEffect } from "react";
import { LeaderboardTable } from "@/components/rpg/LeaderboardTable";
import { useRouter } from "next/navigation";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/rpg/leaderboard")
      .then(r => r.json())
      .then(d => setEntries(d.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-mono">Leaderboard</h1>
          <button
            onClick={() => router.push("/rpg")}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-mono text-sm border border-gray-700"
          >
            Back
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 font-mono animate-pulse">Loading...</div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <LeaderboardTable entries={entries} />
          </div>
        )}
      </div>
    </div>
  );
}
