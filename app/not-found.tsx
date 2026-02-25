import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-6xl font-bold font-mono">404</h1>
      <p className="font-mono text-muted-foreground">Pixel not found.</p>
      <Button asChild variant="outline" className="font-mono">
        <Link href="/">Go Home</Link>
      </Button>
    </main>
  );
}
