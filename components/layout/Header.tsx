import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <nav className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/" className="font-mono font-bold text-lg">
          PixelGuess
        </Link>
        <div className="flex items-center gap-4 font-mono text-sm">
          <Link href="/play" className="hover:underline">
            Play
          </Link>
          <Link href="/stats" className="hover:underline">
            Stats
          </Link>
          <Link href="/pricing" className="hover:underline">
            Premium
          </Link>
        </div>
      </nav>
    </header>
  );
}
