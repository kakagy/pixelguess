"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setSent(true);
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <Button onClick={handleGoogle} variant="outline" className="font-mono">
        Continue with Google
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-mono">or</span>
        </div>
      </div>
      {sent ? (
        <p className="text-center text-sm font-mono text-muted-foreground">
          Check your email for the login link!
        </p>
      ) : (
        <form onSubmit={handleMagicLink} className="flex flex-col gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="font-mono"
          />
          <Button type="submit" className="font-mono">
            Send Magic Link
          </Button>
        </form>
      )}
    </div>
  );
}
