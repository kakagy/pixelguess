import { Badge } from "@/components/ui/badge";

interface HintBarProps {
  hints: string[];
  round: number;
  maxRounds: number;
}

export function HintBar({ hints, round, maxRounds }: HintBarProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm text-muted-foreground font-mono">
        Round {Math.min(round + 1, maxRounds)}/{maxRounds}
      </div>
      {hints.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {hints.map((hint, i) => (
            <Badge key={i} variant="secondary" className="font-mono text-xs">
              {hint}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
