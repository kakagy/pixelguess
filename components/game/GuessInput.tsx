"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GuessInputProps {
  onGuess: (guess: string) => void;
  disabled: boolean;
}

export function GuessInput({ onGuess, disabled }: GuessInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onGuess(value.trim());
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Guess the character..."
        disabled={disabled}
        className="font-mono"
        autoFocus
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        Guess
      </Button>
    </form>
  );
}
