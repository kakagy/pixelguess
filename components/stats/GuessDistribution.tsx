interface GuessDistributionProps {
  distribution: Record<string, number>;
}

export function GuessDistribution({ distribution }: GuessDistributionProps) {
  const max = Math.max(...Object.values(distribution), 1);

  return (
    <div className="space-y-1">
      <h3 className="font-mono text-sm font-semibold mb-2">Guess Distribution</h3>
      {Object.entries(distribution).map(([round, count]) => (
        <div key={round} className="flex items-center gap-2 font-mono text-sm">
          <span className="w-4 text-right">{round}</span>
          <div
            className="bg-primary h-5 rounded-sm flex items-center justify-end px-1 min-w-[20px]"
            style={{ width: `${(count / max) * 100}%` }}
          >
            <span className="text-xs text-primary-foreground">{count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
