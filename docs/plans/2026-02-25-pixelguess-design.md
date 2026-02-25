# PixelGuess - Design Document

## Overview

PixelGuess is a daily pixel art guessing game built for the web. Each day, a new pixel art character is revealed through progressively higher resolution rounds. Players have 6 attempts to guess correctly, with the image becoming clearer each round. Results are shareable via emoji grids, driving viral growth.

## Market Context

- Browser game market: $8.5B (2024), 7.5% CAGR to $15.9B by 2033
- Retro gaming sector: $3.8B, 10% CAGR
- Pixel art indie games: $400M+ revenue in 2024
- Wordle model validated: 4M+ DAU sustained, $148M in subscription revenue for NYT
- Spotle (simple ad-supported daily game): $23K/month from ads alone

## Target Audience

- Primary: 20-40 year olds with retro game nostalgia
- Secondary: Casual puzzle gamers (Wordle/Connections audience)
- Tertiary: Pixel art / indie game enthusiasts
- Geography: Global (English-first, Japanese localization planned)

## Core Mechanic

### Gameplay Flow

1. Every day at 00:00 JST, a new puzzle is published
2. Round 1: Extremely pixelated (16x16 mosaic) version of the character displayed
3. Player types a guess
4. Wrong guess: resolution increases (32x32) + text hint appears
5. Continue up to 6 rounds (16→32→48→64→96→128 resolution)
6. Correct guess: celebration animation + share card generated
7. Failed after 6: answer revealed + share card

### Hint System

- Round 1: Image only (16x16)
- Round 2: Image (32x32) + category hint (e.g., "RPG character")
- Round 3: Image (48x48) + era hint (e.g., "16-bit era")
- Round 4: Image (64x64) + color hint (e.g., "Wears blue")
- Round 5: Image (96x96) + origin hint (e.g., "From a Capcom game")
- Round 6: Image (128x128) + first letter hint

### Share Format

```
PixelGuess #142 3/6

⬛⬛🟩
🟨🟩🟩🟩🟩🟩

pixelguess.com
```

- Black square: wrong guess
- Yellow square: correct category
- Green square: correct answer
- Each row represents the resolution level at which the answer was given

## Content Strategy

### Pixel Art Source

- Original pixel art characters created specifically for the game
- Inspired by classic game archetypes (not direct copies - copyright safe)
- Categories: Game Characters, Items, Monsters, Vehicles, Locations
- Target: 365+ unique puzzles before recycling

### Content Pipeline

- Batch create pixel art assets at high resolution (128x128)
- Algorithmically downscale to create progressive reveal stages
- Each puzzle includes: image set, correct answer, category, hints, difficulty rating

## Revenue Model

### Free Tier

- Daily puzzle (1/day)
- Result sharing
- Basic stats (current streak, max streak)

### Premium Tier ($2.99/month)

- Ad-free experience
- Puzzle archive (play any past puzzle)
- Detailed statistics dashboard (accuracy by category, guess distribution chart)
- Hint system (reveal one extra hint per puzzle)
- Early access to themed events

### Advertising

- Banner ad on result screen
- Interstitial ad (2-3x per week, non-intrusive timing)
- Rewarded video ad (optional: watch ad for extra hint)

### Revenue Projections

| Phase | Timeline | DAU Target | Monthly Revenue |
|-------|----------|------------|-----------------|
| Launch | Month 1-2 | 1K-5K | $100-$500 |
| Growth | Month 3-6 | 10K-50K | $1K-$5K |
| Scale | Month 6-12 | 50K-200K | $5K-$25K |
| Viral breakout | If lucky | 500K+ | $25K-$100K+ |

## Technical Architecture

### Stack

- **Framework**: Next.js 15 (App Router)
- **Rendering**: Canvas API (pixel art display, mosaic animation)
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth & DB**: Supabase (Auth + PostgreSQL)
- **Payments**: Stripe (subscriptions)
- **Deploy**: Vercel
- **OG Images**: @vercel/og (dynamic share image generation)

### Pages / Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page (hero, features, CTA) |
| `/play` | Daily puzzle gameplay |
| `/archive` | Past puzzles (premium) |
| `/stats` | Player statistics |
| `/pricing` | Subscription plans |
| `/api/puzzle/today` | Get today's puzzle |
| `/api/puzzle/[id]` | Get specific puzzle |
| `/api/stats` | Player stats CRUD |
| `/api/share` | Generate share image |
| `/api/webhook/stripe` | Stripe webhook handler |

### Database Schema (Supabase PostgreSQL)

```sql
-- Puzzles table
puzzles (
  id uuid PK,
  puzzle_number integer UNIQUE,
  publish_date date UNIQUE,
  answer text NOT NULL,
  category text NOT NULL,
  hints jsonb NOT NULL,
  image_urls jsonb NOT NULL,  -- {16, 32, 48, 64, 96, 128}
  difficulty integer,
  created_at timestamptz
)

-- User attempts
attempts (
  id uuid PK,
  user_id uuid FK -> auth.users,
  puzzle_id uuid FK -> puzzles,
  guesses jsonb NOT NULL,  -- array of guess strings
  solved boolean,
  solved_round integer,    -- 1-6 or null
  completed_at timestamptz,
  UNIQUE(user_id, puzzle_id)
)

-- User statistics
user_stats (
  user_id uuid PK FK -> auth.users,
  total_played integer DEFAULT 0,
  total_solved integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  max_streak integer DEFAULT 0,
  guess_distribution jsonb,  -- {1: count, 2: count, ...}
  updated_at timestamptz
)

-- Subscriptions
subscriptions (
  id uuid PK,
  user_id uuid FK -> auth.users,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,  -- active, canceled, past_due
  current_period_end timestamptz,
  created_at timestamptz
)
```

### Key Technical Decisions

1. **Canvas for pixel art**: Use Canvas API to render pixel art with nearest-neighbor scaling (no anti-aliasing) for authentic retro look
2. **Progressive reveal**: Pre-generate all resolution stages server-side; client animates transitions
3. **SSR for SEO**: Landing, pricing, and archive pages server-rendered for search visibility
4. **Client-only game**: Game component loaded with `dynamic({ ssr: false })` to prevent hydration issues
5. **OG image generation**: Dynamic share images with @vercel/og showing the puzzle result grid

## Distribution Strategy

1. **Launch on own domain** (pixelguess.com or similar)
2. **Post to itch.io** for indie game community discovery
3. **Submit to Poki** (100M monthly players) once polished
4. **Reddit / Twitter launch** targeting r/gaming, r/pixelart, r/IndieGaming
5. **TikTok content**: Short videos of satisfying pixel reveal animations

## Success Metrics

- DAU / MAU ratio > 30% (daily habit formation)
- Average session: < 5 minutes (casual-friendly)
- Share rate: > 15% of completed games shared
- Day 7 retention: > 40%
- Premium conversion: > 2% of active users

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Copyright issues with character likenesses | Create original "inspired by" pixel art, never use actual game characters |
| Puzzle exhaustion (running out of content) | Batch-create 365+ puzzles before launch; add themed categories over time |
| Low viral uptake | A/B test share formats; add competitive features (time-based leaderboards) |
| Wordle fatigue (daily game oversaturation) | Differentiate through visual medium (images not words) and retro theme |
