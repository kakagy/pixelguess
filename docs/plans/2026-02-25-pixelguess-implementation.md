# PixelGuess Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a daily pixel art guessing game (Wordle-style) with progressive image reveal, shareable results, freemium monetization via Stripe, and Supabase backend.

**Architecture:** Next.js 15 App Router with server-rendered marketing pages and a client-only game component using Canvas API for pixel art rendering. Supabase handles auth and PostgreSQL storage. Stripe manages subscriptions. Pure game logic is separated from UI for testability.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Canvas API, Supabase (Auth + PostgreSQL), Stripe, Vitest, @vercel/og

---

## Task 1: Scaffold Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `vitest.config.ts`, `app/layout.tsx`, `app/page.tsx`

**Step 1: Create Next.js 15 project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

**Step 2: Install testing dependencies**

Run:
```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

**Step 4: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

**Step 5: Add test script to `package.json`**

Add to scripts: `"test": "vitest", "test:run": "vitest run"`

**Step 6: Install shadcn/ui**

Run:
```bash
pnpm dlx shadcn@latest init -d
```

**Step 7: Install core shadcn components**

Run:
```bash
pnpm dlx shadcn@latest add button input card dialog badge
```

**Step 8: Verify setup**

Run: `pnpm test:run` — should pass with 0 tests found (no errors).
Run: `pnpm dev` — should show default Next.js page on localhost:3000.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 project with Tailwind, shadcn/ui, and Vitest"
```

---

## Task 2: Core Game Logic (Pure Functions, TDD)

**Files:**
- Create: `lib/game/engine.ts`
- Create: `lib/game/engine.test.ts`
- Create: `lib/game/types.ts`

This is the heart of the game — pure functions with zero UI or DB dependencies. Fully testable.

**Step 1: Create game types**

Create `lib/game/types.ts`:

```ts
export type Resolution = 16 | 32 | 48 | 64 | 96 | 128;

export const RESOLUTIONS: Resolution[] = [16, 32, 48, 64, 96, 128];

export const MAX_ROUNDS = 6;

export interface Puzzle {
  id: string;
  puzzleNumber: number;
  answer: string;
  category: string;
  hints: string[]; // indexed 0-5, one per round
  imageUrls: Record<Resolution, string>;
}

export type GuessResult = "correct" | "wrong" | "correct_category";

export interface GameState {
  puzzle: Puzzle;
  guesses: string[];
  results: GuessResult[];
  currentRound: number; // 0-5
  status: "playing" | "won" | "lost";
}
```

**Step 2: Write failing tests**

Create `lib/game/engine.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  createGameState,
  submitGuess,
  getCurrentResolution,
  getVisibleHints,
  generateShareText,
} from "./engine";
import type { Puzzle } from "./types";

const mockPuzzle: Puzzle = {
  id: "test-1",
  puzzleNumber: 1,
  answer: "knight",
  category: "game character",
  hints: [
    "",
    "RPG character",
    "Medieval era",
    "Wears armor",
    "From a classic franchise",
    "Starts with K",
  ],
  imageUrls: {
    16: "/puzzles/1/16.png",
    32: "/puzzles/1/32.png",
    48: "/puzzles/1/48.png",
    64: "/puzzles/1/64.png",
    96: "/puzzles/1/96.png",
    128: "/puzzles/1/128.png",
  },
};

describe("createGameState", () => {
  it("creates initial game state", () => {
    const state = createGameState(mockPuzzle);
    expect(state.currentRound).toBe(0);
    expect(state.guesses).toEqual([]);
    expect(state.results).toEqual([]);
    expect(state.status).toBe("playing");
  });
});

describe("submitGuess", () => {
  it("returns correct on exact match (case-insensitive)", () => {
    const state = createGameState(mockPuzzle);
    const next = submitGuess(state, "Knight");
    expect(next.status).toBe("won");
    expect(next.results[0]).toBe("correct");
    expect(next.currentRound).toBe(1);
  });

  it("returns correct_category when category matches", () => {
    const state = createGameState(mockPuzzle);
    const next = submitGuess(state, "warrior");
    expect(next.status).toBe("playing");
    expect(next.results[0]).toBe("correct_category");
    expect(next.currentRound).toBe(1);
  });

  it("returns wrong on no match", () => {
    const state = createGameState(mockPuzzle);
    const next = submitGuess(state, "spaceship");
    expect(next.results[0]).toBe("wrong");
    expect(next.currentRound).toBe(1);
  });

  it("loses after 6 wrong guesses", () => {
    let state = createGameState(mockPuzzle);
    for (let i = 0; i < 6; i++) {
      state = submitGuess(state, `wrong${i}`);
    }
    expect(state.status).toBe("lost");
    expect(state.currentRound).toBe(6);
  });

  it("does not accept guesses after game ends", () => {
    const state = createGameState(mockPuzzle);
    const won = submitGuess(state, "knight");
    const extra = submitGuess(won, "another");
    expect(extra).toEqual(won);
  });
});

describe("getCurrentResolution", () => {
  it("returns 16 for round 0", () => {
    expect(getCurrentResolution(0)).toBe(16);
  });

  it("returns 128 for round 5", () => {
    expect(getCurrentResolution(5)).toBe(128);
  });
});

describe("getVisibleHints", () => {
  it("returns no hints at round 0", () => {
    const state = createGameState(mockPuzzle);
    expect(getVisibleHints(state)).toEqual([]);
  });

  it("returns first hint after round 1", () => {
    let state = createGameState(mockPuzzle);
    state = submitGuess(state, "wrong");
    expect(getVisibleHints(state)).toEqual(["RPG character"]);
  });
});

describe("generateShareText", () => {
  it("generates share text for a won game", () => {
    let state = createGameState(mockPuzzle);
    state = submitGuess(state, "wrong");
    state = submitGuess(state, "knight");
    const text = generateShareText(state);
    expect(text).toContain("PixelGuess #1");
    expect(text).toContain("2/6");
    expect(text).toContain("⬛");
    expect(text).toContain("🟩");
  });

  it("generates share text for a lost game", () => {
    let state = createGameState(mockPuzzle);
    for (let i = 0; i < 6; i++) {
      state = submitGuess(state, `wrong${i}`);
    }
    const text = generateShareText(state);
    expect(text).toContain("X/6");
  });
});
```

**Step 3: Run tests to verify they fail**

Run: `pnpm test:run lib/game/engine.test.ts`
Expected: FAIL — module `./engine` not found.

**Step 4: Implement game engine**

Create `lib/game/engine.ts`:

```ts
import { type GameState, type GuessResult, type Puzzle, type Resolution, RESOLUTIONS, MAX_ROUNDS } from "./types";

export function createGameState(puzzle: Puzzle): GameState {
  return {
    puzzle,
    guesses: [],
    results: [],
    currentRound: 0,
    status: "playing",
  };
}

export function submitGuess(state: GameState, guess: string): GameState {
  if (state.status !== "playing") return state;

  const normalizedGuess = guess.trim().toLowerCase();
  const normalizedAnswer = state.puzzle.answer.trim().toLowerCase();

  let result: GuessResult;
  if (normalizedGuess === normalizedAnswer) {
    result = "correct";
  } else if (isRelatedCategory(normalizedGuess, state.puzzle.category)) {
    result = "correct_category";
  } else {
    result = "wrong";
  }

  const newGuesses = [...state.guesses, guess];
  const newResults = [...state.results, result];
  const newRound = state.currentRound + 1;

  let status: GameState["status"] = "playing";
  if (result === "correct") {
    status = "won";
  } else if (newRound >= MAX_ROUNDS) {
    status = "lost";
  }

  return {
    ...state,
    guesses: newGuesses,
    results: newResults,
    currentRound: newRound,
    status,
  };
}

function isRelatedCategory(guess: string, category: string): boolean {
  const categoryWords = category.toLowerCase().split(/\s+/);
  return categoryWords.some((word) => guess.includes(word) || word.includes(guess));
}

export function getCurrentResolution(round: number): Resolution {
  const clamped = Math.min(round, RESOLUTIONS.length - 1);
  return RESOLUTIONS[clamped];
}

export function getVisibleHints(state: GameState): string[] {
  return state.puzzle.hints.slice(1, state.currentRound + 1).filter(Boolean);
}

export function generateShareText(state: GameState): string {
  const solved = state.status === "won";
  const score = solved ? `${state.currentRound}/6` : "X/6";
  const header = `PixelGuess #${state.puzzle.puzzleNumber} ${score}`;

  const grid = state.results
    .map((r) => {
      switch (r) {
        case "correct":
          return "🟩";
        case "correct_category":
          return "🟨";
        case "wrong":
          return "⬛";
      }
    })
    .join("");

  return `${header}\n\n${grid}`;
}
```

**Step 5: Run tests to verify they pass**

Run: `pnpm test:run lib/game/engine.test.ts`
Expected: All 9 tests PASS.

**Step 6: Commit**

```bash
git add lib/game/
git commit -m "feat: add core game engine with TDD (pure functions)"
```

---

## Task 3: Pixel Art Canvas Component

**Files:**
- Create: `components/game/PixelCanvas.tsx`
- Create: `components/game/PixelCanvas.test.tsx`

**Step 1: Write failing test**

Create `components/game/PixelCanvas.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PixelCanvas } from "./PixelCanvas";

describe("PixelCanvas", () => {
  it("renders a canvas element", () => {
    render(<PixelCanvas src="/test.png" resolution={16} size={256} />);
    const canvas = screen.getByRole("img");
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe("CANVAS");
  });

  it("applies correct dimensions", () => {
    render(<PixelCanvas src="/test.png" resolution={16} size={256} />);
    const canvas = screen.getByRole("img") as HTMLCanvasElement;
    expect(canvas.width).toBe(256);
    expect(canvas.height).toBe(256);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run components/game/PixelCanvas.test.tsx`
Expected: FAIL — module not found.

**Step 3: Implement PixelCanvas**

Create `components/game/PixelCanvas.tsx`:

```tsx
"use client";

import { useRef, useEffect } from "react";

interface PixelCanvasProps {
  src: string;
  resolution: number;
  size: number;
  className?: string;
}

export function PixelCanvas({ src, resolution, size, className }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Draw at low resolution then scale up
      ctx.clearRect(0, 0, size, size);

      // Step 1: Draw image at target resolution into offscreen canvas
      const offscreen = document.createElement("canvas");
      offscreen.width = resolution;
      offscreen.height = resolution;
      const offCtx = offscreen.getContext("2d")!;
      offCtx.imageSmoothingEnabled = false;
      offCtx.drawImage(img, 0, 0, resolution, resolution);

      // Step 2: Scale up to display size with nearest-neighbor
      ctx.drawImage(offscreen, 0, 0, resolution, resolution, 0, 0, size, size);
    };
    img.src = src;
  }, [src, resolution, size]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Pixel art puzzle"
      width={size}
      height={size}
      className={className}
    />
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `pnpm test:run components/game/PixelCanvas.test.tsx`
Expected: PASS (canvas renders, dimensions correct — image loading won't fire in jsdom but element tests pass).

**Step 5: Commit**

```bash
git add components/game/
git commit -m "feat: add PixelCanvas component with nearest-neighbor scaling"
```

---

## Task 4: Supabase Setup & Database Schema

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/types.ts`
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Install Supabase dependencies**

Run:
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

**Step 2: Create environment variables file**

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Add `.env.local` to `.gitignore` if not already there.

**Step 3: Create Supabase types**

Create `lib/supabase/types.ts`:

```ts
export interface Database {
  public: {
    Tables: {
      puzzles: {
        Row: {
          id: string;
          puzzle_number: number;
          publish_date: string;
          answer: string;
          category: string;
          hints: string[];
          image_urls: Record<string, string>;
          difficulty: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["puzzles"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["puzzles"]["Insert"]>;
      };
      attempts: {
        Row: {
          id: string;
          user_id: string;
          puzzle_id: string;
          guesses: string[];
          solved: boolean;
          solved_round: number | null;
          completed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["attempts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["attempts"]["Insert"]>;
      };
      user_stats: {
        Row: {
          user_id: string;
          total_played: number;
          total_solved: number;
          current_streak: number;
          max_streak: number;
          guess_distribution: Record<string, number>;
          updated_at: string;
        };
        Insert: Database["public"]["Tables"]["user_stats"]["Row"];
        Update: Partial<Database["public"]["Tables"]["user_stats"]["Insert"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          status: string;
          current_period_end: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subscriptions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
    };
  };
}
```

**Step 4: Create Supabase browser client**

Create `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 5: Create Supabase server client**

Create `lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}
```

**Step 6: Create SQL migration**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Puzzles table
CREATE TABLE puzzles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  puzzle_number integer UNIQUE NOT NULL,
  publish_date date UNIQUE NOT NULL,
  answer text NOT NULL,
  category text NOT NULL,
  hints jsonb NOT NULL DEFAULT '[]',
  image_urls jsonb NOT NULL DEFAULT '{}',
  difficulty integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- User attempts
CREATE TABLE attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_id uuid NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  guesses jsonb NOT NULL DEFAULT '[]',
  solved boolean NOT NULL DEFAULT false,
  solved_round integer,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, puzzle_id)
);

-- User statistics
CREATE TABLE user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_played integer DEFAULT 0,
  total_solved integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  max_streak integer DEFAULT 0,
  guess_distribution jsonb DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0}',
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'inactive',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_puzzles_publish_date ON puzzles(publish_date);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_puzzle_id ON attempts(puzzle_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);

-- RLS policies
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Puzzles: readable by everyone
CREATE POLICY "Puzzles are publicly readable"
  ON puzzles FOR SELECT TO authenticated, anon
  USING (publish_date <= CURRENT_DATE);

-- Attempts: users can only read/write their own
CREATE POLICY "Users can read own attempts"
  ON attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User stats: users can only read/write their own
CREATE POLICY "Users can read own stats"
  ON user_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own stats"
  ON user_stats FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions: users can read their own
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

**Step 7: Commit**

```bash
git add lib/supabase/ supabase/ .env.local.example
git commit -m "feat: add Supabase setup with schema migration and RLS policies"
```

---

## Task 5: Puzzle API Routes

**Files:**
- Create: `app/api/puzzle/today/route.ts`
- Create: `app/api/puzzle/[id]/route.ts`
- Create: `app/api/puzzle/[id]/attempt/route.ts`
- Create: `lib/puzzle/service.ts`
- Create: `lib/puzzle/service.test.ts`

**Step 1: Write failing test for puzzle service**

Create `lib/puzzle/service.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getTodayDateString, sanitizePuzzleForClient } from "./service";

describe("getTodayDateString", () => {
  it("returns date in YYYY-MM-DD format", () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("sanitizePuzzleForClient", () => {
  it("removes the answer from puzzle data", () => {
    const puzzle = {
      id: "1",
      puzzle_number: 1,
      publish_date: "2026-02-25",
      answer: "knight",
      category: "game character",
      hints: ["", "RPG", "Medieval", "Armor", "Classic", "K"],
      image_urls: { "16": "/16.png", "32": "/32.png" },
      difficulty: 1,
      created_at: "2026-02-25T00:00:00Z",
    };
    const sanitized = sanitizePuzzleForClient(puzzle);
    expect(sanitized).not.toHaveProperty("answer");
    expect(sanitized).toHaveProperty("id");
    expect(sanitized).toHaveProperty("hints");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run lib/puzzle/service.test.ts`
Expected: FAIL.

**Step 3: Implement puzzle service**

Create `lib/puzzle/service.ts`:

```ts
import type { Database } from "@/lib/supabase/types";

type PuzzleRow = Database["public"]["Tables"]["puzzles"]["Row"];

export function getTodayDateString(): string {
  // Use JST (UTC+9)
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split("T")[0];
}

export function sanitizePuzzleForClient(puzzle: PuzzleRow) {
  const { answer, ...safe } = puzzle;
  return safe;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run lib/puzzle/service.test.ts`
Expected: PASS.

**Step 5: Create today's puzzle API route**

Create `app/api/puzzle/today/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTodayDateString, sanitizePuzzleForClient } from "@/lib/puzzle/service";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const today = getTodayDateString();

  const { data: puzzle, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("publish_date", today)
    .single();

  if (error || !puzzle) {
    return NextResponse.json({ error: "No puzzle for today" }, { status: 404 });
  }

  return NextResponse.json(sanitizePuzzleForClient(puzzle));
}
```

**Step 6: Create attempt submission API route**

Create `app/api/puzzle/[id]/attempt/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: puzzleId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { guess } = body;

  if (!guess || typeof guess !== "string") {
    return NextResponse.json({ error: "Invalid guess" }, { status: 400 });
  }

  // Get puzzle with answer (server-side only)
  const { data: puzzle } = await supabase
    .from("puzzles")
    .select("*")
    .eq("id", puzzleId)
    .single();

  if (!puzzle) {
    return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
  }

  // Check existing attempt
  const { data: existing } = await supabase
    .from("attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("puzzle_id", puzzleId)
    .single();

  const guesses: string[] = existing?.guesses as string[] ?? [];
  if (guesses.length >= 6 || existing?.solved) {
    return NextResponse.json({ error: "Game already completed" }, { status: 400 });
  }

  const isCorrect = guess.trim().toLowerCase() === puzzle.answer.trim().toLowerCase();
  const newGuesses = [...guesses, guess];
  const solved = isCorrect;
  const solvedRound = isCorrect ? newGuesses.length : null;

  if (existing) {
    await supabase
      .from("attempts")
      .update({ guesses: newGuesses, solved, solved_round: solvedRound })
      .eq("id", existing.id);
  } else {
    await supabase.from("attempts").insert({
      user_id: user.id,
      puzzle_id: puzzleId,
      guesses: newGuesses,
      solved,
      solved_round: solvedRound,
      completed_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    correct: isCorrect,
    guessCount: newGuesses.length,
    answer: newGuesses.length >= 6 || isCorrect ? puzzle.answer : undefined,
  });
}
```

**Step 7: Commit**

```bash
git add lib/puzzle/ app/api/puzzle/
git commit -m "feat: add puzzle API routes (today, attempt submission)"
```

---

## Task 6: Play Page — Game UI

**Files:**
- Create: `app/play/page.tsx`
- Create: `components/game/GameBoard.tsx`
- Create: `components/game/GuessInput.tsx`
- Create: `components/game/HintBar.tsx`
- Create: `components/game/ResultModal.tsx`
- Create: `hooks/useGame.ts`

**Step 1: Create useGame hook**

Create `hooks/useGame.ts`:

```ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createGameState,
  submitGuess,
  getCurrentResolution,
  getVisibleHints,
  generateShareText,
} from "@/lib/game/engine";
import type { GameState, Puzzle } from "@/lib/game/types";

export function useGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPuzzle() {
      try {
        const res = await fetch("/api/puzzle/today");
        if (!res.ok) throw new Error("Failed to load puzzle");
        const data = await res.json();

        // Reconstruct as Puzzle type (answer will be empty on client)
        const puzzle: Puzzle = {
          id: data.id,
          puzzleNumber: data.puzzle_number,
          answer: "", // Hidden from client
          category: data.category,
          hints: data.hints,
          imageUrls: data.image_urls,
        };

        // Check localStorage for existing progress
        const saved = localStorage.getItem(`pg-${data.puzzle_number}`);
        if (saved) {
          setGameState(JSON.parse(saved));
        } else {
          setGameState(createGameState(puzzle));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    loadPuzzle();
  }, []);

  const guess = useCallback(
    async (input: string) => {
      if (!gameState || gameState.status !== "playing") return;

      // Submit to server for validation
      const res = await fetch(`/api/puzzle/${gameState.puzzle.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: input }),
      });

      const result = await res.json();

      // Update local state
      const newState = submitGuess(
        { ...gameState, puzzle: { ...gameState.puzzle, answer: result.answer ?? "" } },
        input
      );

      // If server says correct, override local state
      if (result.correct) {
        newState.status = "won";
      } else if (newState.currentRound >= 6) {
        newState.status = "lost";
        newState.puzzle = { ...newState.puzzle, answer: result.answer ?? "" };
      }

      setGameState(newState);
      localStorage.setItem(`pg-${newState.puzzle.puzzleNumber}`, JSON.stringify(newState));
    },
    [gameState]
  );

  const resolution = gameState ? getCurrentResolution(gameState.currentRound) : 16;
  const hints = gameState ? getVisibleHints(gameState) : [];
  const shareText = gameState && gameState.status !== "playing" ? generateShareText(gameState) : null;

  return { gameState, loading, error, guess, resolution, hints, shareText };
}
```

**Step 2: Create GuessInput component**

Create `components/game/GuessInput.tsx`:

```tsx
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
```

**Step 3: Create HintBar component**

Create `components/game/HintBar.tsx`:

```tsx
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
```

**Step 4: Create ResultModal component**

Create `components/game/ResultModal.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResultModalProps {
  open: boolean;
  won: boolean;
  answer: string;
  shareText: string;
}

export function ResultModal({ open, won, answer, shareText }: ResultModalProps) {
  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl">
            {won ? "Correct!" : "Game Over"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-lg font-mono">
            The answer was: <strong>{answer}</strong>
          </p>
          <pre className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
            {shareText}
          </pre>
          <Button onClick={handleShare} className="w-full font-mono">
            Share Result
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 5: Create GameBoard component**

Create `components/game/GameBoard.tsx`:

```tsx
"use client";

import { PixelCanvas } from "./PixelCanvas";
import { GuessInput } from "./GuessInput";
import { HintBar } from "./HintBar";
import { ResultModal } from "./ResultModal";
import { useGame } from "@/hooks/useGame";
import { MAX_ROUNDS } from "@/lib/game/types";

export function GameBoard() {
  const { gameState, loading, error, guess, resolution, hints, shareText } = useGame();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="font-mono text-muted-foreground animate-pulse">Loading puzzle...</p>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="font-mono text-destructive">{error ?? "No puzzle available"}</p>
      </div>
    );
  }

  const imageUrl = gameState.puzzle.imageUrls[resolution as unknown as string];
  const isFinished = gameState.status !== "playing";

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h1 className="text-3xl font-bold font-mono tracking-tight">PixelGuess</h1>

      <PixelCanvas src={imageUrl} resolution={resolution} size={256} className="border-2 border-border rounded-lg" />

      <HintBar hints={hints} round={gameState.currentRound} maxRounds={MAX_ROUNDS} />

      {/* Previous guesses */}
      {gameState.guesses.length > 0 && (
        <div className="flex flex-col gap-1 text-sm font-mono">
          {gameState.guesses.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              <span>
                {gameState.results[i] === "correct"
                  ? "🟩"
                  : gameState.results[i] === "correct_category"
                  ? "🟨"
                  : "⬛"}
              </span>
              <span className="text-muted-foreground">{g}</span>
            </div>
          ))}
        </div>
      )}

      <GuessInput onGuess={guess} disabled={isFinished} />

      {isFinished && shareText && (
        <ResultModal
          open={isFinished}
          won={gameState.status === "won"}
          answer={gameState.puzzle.answer}
          shareText={shareText}
        />
      )}
    </div>
  );
}
```

**Step 6: Create play page**

Create `app/play/page.tsx`:

```tsx
import dynamic from "next/dynamic";
import type { Metadata } from "next";

const GameBoard = dynamic(
  () => import("@/components/game/GameBoard").then((m) => m.GameBoard),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Play | PixelGuess",
  description: "Guess today's pixel art character!",
};

export default function PlayPage() {
  return (
    <main className="container mx-auto max-w-lg px-4">
      <GameBoard />
    </main>
  );
}
```

**Step 7: Commit**

```bash
git add app/play/ components/game/ hooks/
git commit -m "feat: add play page with game UI (board, input, hints, result modal)"
```

---

## Task 7: Share Image Generation (OG)

**Files:**
- Create: `app/api/og/route.tsx`

**Step 1: Install @vercel/og**

Run:
```bash
pnpm add @vercel/og
```

**Step 2: Create OG image route**

Create `app/api/og/route.tsx`:

```tsx
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const puzzleNumber = searchParams.get("n") ?? "?";
  const score = searchParams.get("s") ?? "?/6";
  const grid = searchParams.get("g") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "monospace",
          gap: "24px",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: "bold" }}>PixelGuess</div>
        <div style={{ fontSize: 36 }}>
          #{puzzleNumber} — {score}
        </div>
        <div style={{ fontSize: 48, letterSpacing: "8px" }}>{grid}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

**Step 3: Commit**

```bash
git add app/api/og/
git commit -m "feat: add OG image generation for share cards"
```

---

## Task 8: Landing Page

**Files:**
- Create: `app/page.tsx` (overwrite default)
- Create: `components/landing/Hero.tsx`
- Create: `components/landing/Features.tsx`

**Step 1: Create Hero component**

Create `components/landing/Hero.tsx`:

```tsx
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
```

**Step 2: Create Features component**

Create `components/landing/Features.tsx`:

```tsx
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    title: "Daily Challenge",
    description: "One new pixel art puzzle every day at midnight.",
  },
  {
    title: "Progressive Reveal",
    description: "6 rounds. Image gets clearer each round. How early can you guess?",
  },
  {
    title: "Share & Compete",
    description: "Share your emoji result grid with friends on social media.",
  },
];

export function Features() {
  return (
    <section className="grid md:grid-cols-3 gap-4 px-4 py-12 max-w-4xl mx-auto">
      {features.map((f) => (
        <Card key={f.title} className="bg-card/50">
          <CardHeader>
            <CardTitle className="font-mono">{f.title}</CardTitle>
            <CardDescription className="font-mono">{f.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </section>
  );
}
```

**Step 3: Update landing page**

Overwrite `app/page.tsx`:

```tsx
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PixelGuess — Daily Pixel Art Puzzle",
  description:
    "Guess the pixel art character as the image sharpens. A new puzzle every day. Share your score.",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
    </main>
  );
}
```

**Step 4: Commit**

```bash
git add app/page.tsx components/landing/
git commit -m "feat: add landing page with hero, features, and CTA"
```

---

## Task 9: Auth (Supabase Google OAuth + Magic Link)

**Files:**
- Create: `app/login/page.tsx`
- Create: `components/auth/LoginForm.tsx`
- Create: `middleware.ts`
- Create: `app/auth/callback/route.ts`

**Step 1: Create auth callback route**

Create `app/auth/callback/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/play";

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
```

**Step 2: Create LoginForm component**

Create `components/auth/LoginForm.tsx`:

```tsx
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
```

**Step 3: Create login page**

Create `app/login/page.tsx`:

```tsx
import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | PixelGuess",
};

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold font-mono mb-8">Sign in to PixelGuess</h1>
      <LoginForm />
    </main>
  );
}
```

**Step 4: Create middleware for auth protection**

Create `middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/stats", "/archive"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && protectedRoutes.some((r) => request.nextUrl.pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|auth).*)"],
};
```

**Step 5: Commit**

```bash
git add app/login/ app/auth/ components/auth/ middleware.ts
git commit -m "feat: add auth with Supabase (Google OAuth + Magic Link)"
```

---

## Task 10: Stats Page & API

**Files:**
- Create: `app/stats/page.tsx`
- Create: `app/api/stats/route.ts`
- Create: `components/stats/StatsDisplay.tsx`
- Create: `components/stats/GuessDistribution.tsx`

**Step 1: Create stats API route**

Create `app/api/stats/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!stats) {
    return NextResponse.json({
      total_played: 0,
      total_solved: 0,
      current_streak: 0,
      max_streak: 0,
      guess_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 },
    });
  }

  return NextResponse.json(stats);
}
```

**Step 2: Create GuessDistribution component**

Create `components/stats/GuessDistribution.tsx`:

```tsx
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
```

**Step 3: Create StatsDisplay component**

Create `components/stats/StatsDisplay.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuessDistribution } from "./GuessDistribution";

interface Stats {
  total_played: number;
  total_solved: number;
  current_streak: number;
  max_streak: number;
  guess_distribution: Record<string, number>;
}

export function StatsDisplay() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <p className="font-mono text-muted-foreground">Loading...</p>;

  const winRate = stats.total_played > 0
    ? Math.round((stats.total_solved / stats.total_played) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Played", value: stats.total_played },
          { label: "Win %", value: `${winRate}%` },
          { label: "Streak", value: stats.current_streak },
          { label: "Max", value: stats.max_streak },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold font-mono">{s.value}</div>
              <div className="text-xs text-muted-foreground font-mono">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <GuessDistribution distribution={stats.guess_distribution} />
    </div>
  );
}
```

**Step 4: Create stats page**

Create `app/stats/page.tsx`:

```tsx
import { StatsDisplay } from "@/components/stats/StatsDisplay";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats | PixelGuess",
};

export default function StatsPage() {
  return (
    <main className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="text-3xl font-bold font-mono mb-6">Your Statistics</h1>
      <StatsDisplay />
    </main>
  );
}
```

**Step 5: Commit**

```bash
git add app/stats/ app/api/stats/ components/stats/
git commit -m "feat: add stats page with guess distribution chart"
```

---

## Task 11: Stripe Subscription & Pricing Page

**Files:**
- Create: `app/pricing/page.tsx`
- Create: `app/api/checkout/route.ts`
- Create: `app/api/webhook/stripe/route.ts`
- Create: `lib/stripe.ts`

**Step 1: Install Stripe**

Run:
```bash
pnpm add stripe
```

**Step 2: Add Stripe env vars to `.env.local`**

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Step 3: Create Stripe server client**

Create `lib/stripe.ts`:

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});
```

**Step 4: Create checkout API route**

Create `app/api/checkout/route.ts`:

```ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/play?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    client_reference_id: user.id,
    customer_email: user.email,
  });

  return NextResponse.json({ url: session.url });
}
```

**Step 5: Create Stripe webhook handler**

Create `app/api/webhook/stripe/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id!;
    const subscriptionId = session.subscription as string;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}
```

**Step 6: Create pricing page**

Create `app/pricing/page.tsx`:

```tsx
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
```

**Step 7: Commit**

```bash
git add app/pricing/ app/api/checkout/ app/api/webhook/ lib/stripe.ts
git commit -m "feat: add Stripe subscription with pricing page and webhook"
```

---

## Task 12: Seed Puzzle Data & Content Pipeline

**Files:**
- Create: `scripts/seed-puzzles.ts`
- Create: `public/puzzles/` (directory for pixel art assets)

**Step 1: Create seed script**

Create `scripts/seed-puzzles.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const seedPuzzles = [
  {
    puzzle_number: 1,
    publish_date: "2026-03-01",
    answer: "knight",
    category: "game character",
    hints: ["", "RPG character", "Medieval era", "Wears heavy armor", "Carries a sword and shield", "Starts with K"],
    image_urls: {
      "16": "/puzzles/1/16.png",
      "32": "/puzzles/1/32.png",
      "48": "/puzzles/1/48.png",
      "64": "/puzzles/1/64.png",
      "96": "/puzzles/1/96.png",
      "128": "/puzzles/1/128.png",
    },
    difficulty: 2,
  },
  {
    puzzle_number: 2,
    publish_date: "2026-03-02",
    answer: "slime",
    category: "monster",
    hints: ["", "Classic RPG enemy", "Usually the first encounter", "Gelatinous body", "Often green or blue", "Starts with S"],
    image_urls: {
      "16": "/puzzles/2/16.png",
      "32": "/puzzles/2/32.png",
      "48": "/puzzles/2/48.png",
      "64": "/puzzles/2/64.png",
      "96": "/puzzles/2/96.png",
      "128": "/puzzles/2/128.png",
    },
    difficulty: 1,
  },
  {
    puzzle_number: 3,
    publish_date: "2026-03-03",
    answer: "treasure chest",
    category: "item",
    hints: ["", "Found in dungeons", "Contains rewards", "Made of wood and metal", "A staple of adventure games", "Starts with T"],
    image_urls: {
      "16": "/puzzles/3/16.png",
      "32": "/puzzles/3/32.png",
      "48": "/puzzles/3/48.png",
      "64": "/puzzles/3/64.png",
      "96": "/puzzles/3/96.png",
      "128": "/puzzles/3/128.png",
    },
    difficulty: 1,
  },
];

async function seed() {
  for (const puzzle of seedPuzzles) {
    const { error } = await supabase.from("puzzles").upsert(puzzle, {
      onConflict: "puzzle_number",
    });
    if (error) {
      console.error(`Failed to seed puzzle ${puzzle.puzzle_number}:`, error.message);
    } else {
      console.log(`Seeded puzzle #${puzzle.puzzle_number}: ${puzzle.answer}`);
    }
  }
}

seed();
```

**Step 2: Add seed script to package.json**

Add to scripts: `"seed": "npx tsx scripts/seed-puzzles.ts"`

**Step 3: Create placeholder pixel art directories**

Run:
```bash
mkdir -p public/puzzles/{1,2,3}
```

Note: Actual pixel art assets will be created separately (original 128x128 art, then algorithmically downscaled). For development, use placeholder colored squares.

**Step 4: Commit**

```bash
git add scripts/ public/puzzles/
git commit -m "feat: add puzzle seed script and placeholder asset directories"
```

---

## Task 13: Layout, Navigation & Not-Found Page

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/layout/Header.tsx`
- Create: `app/not-found.tsx`

**Step 1: Create Header component**

Create `components/layout/Header.tsx`:

```tsx
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
```

**Step 2: Update app layout**

Update `app/layout.tsx` to include Header and global styles with retro mono font.

**Step 3: Create not-found page**

Create `app/not-found.tsx`:

```tsx
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
```

**Step 4: Commit**

```bash
git add app/layout.tsx app/not-found.tsx components/layout/
git commit -m "feat: add layout with header navigation and 404 page"
```

---

## Task 14: Final Configuration & Verification

**Files:**
- Modify: `next.config.ts`

**Step 1: Update next.config.ts**

Add image domains for Supabase storage:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
```

**Step 2: Run all tests**

Run: `pnpm test:run`
Expected: All game engine tests pass.

**Step 3: Run dev server and verify**

Run: `pnpm dev`
Verify: Landing page renders at localhost:3000, `/play` shows game board.

**Step 4: Run build**

Run: `pnpm build`
Expected: Build succeeds with no errors.

**Step 5: Final commit**

```bash
git add next.config.ts
git commit -m "feat: finalize configuration and verify build"
```

---

## Summary

| Task | Description | Estimated Time |
|------|-------------|---------------|
| 1 | Scaffold project | 15 min |
| 2 | Core game engine (TDD) | 30 min |
| 3 | PixelCanvas component | 15 min |
| 4 | Supabase setup & schema | 20 min |
| 5 | Puzzle API routes | 25 min |
| 6 | Play page (game UI) | 30 min |
| 7 | OG share image | 10 min |
| 8 | Landing page | 15 min |
| 9 | Auth (Google + Magic Link) | 20 min |
| 10 | Stats page & API | 20 min |
| 11 | Stripe subscription | 25 min |
| 12 | Seed data & content pipeline | 15 min |
| 13 | Layout & navigation | 15 min |
| 14 | Final config & verification | 10 min |
| **Total** | | **~4.5 hours** |
