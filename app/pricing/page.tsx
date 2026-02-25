"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PricingPage() {
  async function handleSubscribe() {
    const res = await fetch("/api/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-4xl font-bold font-mono text-center mb-2">Go Premium</h1>
      <p className="text-center text-muted-foreground font-mono mb-12">
        Unlock the full PixelGuess experience
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Free</CardTitle>
            <CardDescription className="font-mono">$0 / forever</CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-sm space-y-2">
            <p>Daily puzzle</p>
            <p>Share results</p>
            <p>Basic stats</p>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="font-mono">Premium</CardTitle>
            <CardDescription className="font-mono">$2.99 / month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="font-mono text-sm space-y-2">
              <p>Everything in Free, plus:</p>
              <p>Ad-free experience</p>
              <p>Puzzle archive</p>
              <p>Detailed statistics</p>
              <p>Extra hints</p>
            </div>
            <Button onClick={handleSubscribe} className="w-full font-mono">
              Subscribe
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
