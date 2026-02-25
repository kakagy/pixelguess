import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center gap-6 py-20 px-4">
      <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter">
        Pixel<span className="text-primary">Guess</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-md font-mono">
        A new pixel art puzzle every day. Guess the character as the image
        sharpens. Share your score.
      </p>
      <Button asChild size="lg" className="font-mono text-lg px-8">
        <Link href="/play">Play Today&apos;s Puzzle</Link>
      </Button>
    </section>
  );
}
