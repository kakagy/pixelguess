"use client";

interface LeaderboardEntry {
  rank: number;
  name: string;
  class: string;
  level: number;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
}

interface Props {
  entries: LeaderboardEntry[];
}

const CLASS_ICONS: Record<string, string> = {
  knight: "🗡️",
  mage: "🔥",
  ranger: "🏹",
  healer: "💧",
};

export function LeaderboardTable({ entries }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="py-2 px-2 text-left">#</th>
            <th className="py-2 px-2 text-left">Player</th>
            <th className="py-2 px-2 text-center">Class</th>
            <th className="py-2 px-2 text-center">Lv</th>
            <th className="py-2 px-2 text-right">Rating</th>
            <th className="py-2 px-2 text-right">W/L</th>
            <th className="py-2 px-2 text-right">Streak</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.rank}
              className={`border-b border-gray-800 ${
                entry.rank <= 3 ? "bg-yellow-900/20" : "hover:bg-gray-800/50"
              }`}
            >
              <td className="py-2 px-2">
                {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : entry.rank}
              </td>
              <td className="py-2 px-2 font-bold">{entry.name}</td>
              <td className="py-2 px-2 text-center">{CLASS_ICONS[entry.class] || "?"}</td>
              <td className="py-2 px-2 text-center">{entry.level}</td>
              <td className="py-2 px-2 text-right font-bold text-yellow-400">{entry.rating}</td>
              <td className="py-2 px-2 text-right">
                <span className="text-green-400">{entry.wins}</span>
                /
                <span className="text-red-400">{entry.losses}</span>
              </td>
              <td className="py-2 px-2 text-right">
                {entry.streak > 0 ? (
                  <span className="text-green-400">+{entry.streak}</span>
                ) : (
                  <span className="text-gray-500">{entry.streak}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-500 font-mono">
          No battles yet. Be the first!
        </div>
      )}
    </div>
  );
}
