# Pixel RPG Social Game — Design Document

## Overview

A browser-based pixel art RPG with real-time PvP turn-based battles, generative avatars, and gacha monetization. Built on the existing Next.js + Supabase + Stripe infrastructure from PixelGuess.

**MVP Scope:** Generative avatar creation + real-time PvP turn-based battles.

## Game Core

### Generative Pixel Avatars

32x32 pixel avatars composed from layered sprite parts:

| Layer | Variants | Colors |
|-------|----------|--------|
| Body | 3 types | 6 skin tones |
| Hair | 8 styles | 8 colors |
| Eyes | 6 styles | — |
| Outfit | 10 types | 6 colors |
| Weapon | 8 types | class-dependent |
| Accessory | 6 types | rare drops |

Each avatar is deterministically generated from a seed value. ~2.5M unique combinations.

### Class System (4 classes)

| Class | Element | Traits |
|-------|---------|--------|
| Knight | Physical/Defense | High HP, shield skills |
| Mage | Magic/Fire | High damage, low HP |
| Ranger | Physical/Wind | High speed, evasion skills |
| Healer | Magic/Water | Healing, buff skills |

### Elemental Affinity (Rock-Paper-Scissors + Neutral)

```
Fire → Wind → Water → Fire (1.5x damage)
Physical has no affinity (1.0x)
```

### Turn-Based Battle Flow

1. Matchmaking (rating ±100 range)
2. Display both avatars and stats
3. Turn start (speed-ordered)
   - Action select: Attack / Skill (3 slots) / Defend / Item
   - Action resolve (server-side, with animation)
   - Damage calc: element affinity × skill multiplier × equipment bonus
4. HP reaches 0 → battle end
5. Result screen: EXP gained, rating change, drops

**Turn timer:** 30 seconds. Timeout defaults to "Defend".

### Stats System

| Stat | Description |
|------|-------------|
| HP | Health points |
| ATK | Physical attack |
| MAG | Magic attack |
| DEF | Physical defense |
| RES | Magic resistance |
| SPD | Turn order priority |

Base stats from class + level. Equipment adds flat bonuses.

## Technical Architecture

### Stack

- **Frontend:** Next.js 16 (App Router) + Canvas 2D + React DOM (UI overlay)
- **Realtime:** Supabase Realtime Broadcast channels
- **Game Logic:** Supabase Edge Functions (Deno) — server-authoritative
- **Database:** Supabase PostgreSQL with RLS
- **Auth:** Supabase Auth (Google OAuth + Magic Link)
- **Payments:** Stripe (gacha currency purchase)
- **Hosting:** Vercel

### Architecture Diagram

```
[Client: Next.js + Canvas 2D]
    ↕ Supabase Realtime (Broadcast)
[Game Server: Supabase Edge Functions]
    ↕
[Database: Supabase PostgreSQL]
    ↕
[Auth / Payments: Supabase Auth + Stripe]
```

### Real-time Battle Communication

Uses Supabase Realtime **Broadcast** channels. Game logic runs server-side in Edge Functions to prevent cheating.

```
Client A → broadcast("action", {type:"skill", skillId:2})
                    ↓
         Edge Function: validate & resolve turn
                    ↓
         broadcast("turn_result", {damage:42, hp:{a:80, b:58}})
                    ↓
Client A ← play animation
Client B ← play animation
```

### Database Schema (MVP)

```sql
-- Avatars
avatars (id, user_id, seed, class, level, exp, stats_json, equipment_json, created_at)

-- Active battle sessions
battle_sessions (id, player_a, player_b, state_json, current_turn, turn_timer, status, created_at)

-- Battle history
battles (id, player_a, player_b, winner_id, turns_json, rating_change, created_at)

-- Equipment items master
equipment (id, name, slot, stats_json, rarity, sprite_key)

-- User inventory
user_inventory (id, user_id, equipment_id, quantity, obtained_at)

-- Gacha
gacha_pools (id, name, items_json, rates_json, cost, active)
gacha_history (id, user_id, pool_id, result_json, created_at)

-- Leaderboard
leaderboard (user_id, rating, wins, losses, streak, updated_at)

-- Currency
user_currency (user_id, gems, gold, updated_at)
```

### Client Rendering

Canvas 2D for battle scene:
- Background (3 battlefield variants)
- Avatar sprites (32x32 → 128x128 nearest-neighbor upscale)
- HP bars and skill effects (particle system)
- UI overlay in React DOM (skill selection, menus, chat)

Hybrid Canvas (game rendering) + React DOM (UI) architecture.

### Avatar Sprite Generation

Server-side compositing via node-canvas:
1. Load base body sprite for selected body type + skin color
2. Layer hair, eyes, outfit, weapon, accessory sprites
3. Export as single 32x32 PNG
4. Store in Supabase Storage
5. Client loads and renders at 4x scale (128x128)

## Revenue Model

### Gacha System

- **Currency:** Gems (premium, purchased) + Gold (earned from battles)
- **Gacha rates:** Common 60% / Uncommon 25% / Rare 10% / Legendary 5%
- **Pity system:** Guaranteed Rare at 20 pulls, Legendary at 50 pulls
- **Pools:** Equipment gacha, Accessory gacha (cosmetic)
- **Gem pricing:** 100 gems = $0.99, 500 gems = $3.99, 1200 gems = $7.99
- **Single pull cost:** 10 gems, 10-pull: 90 gems

### Anti-Pay-to-Win

- Equipment gives modest stat bonuses (max +15% over base)
- Matchmaking is rating-based, not power-based
- Skill and class choice matter more than gear
- Cosmetic accessories have zero stat impact

## MVP Feature List

1. Avatar generation (class select → random seed → sprite compositing)
2. Home screen (avatar display, stats, battle button)
3. Matchmaking queue (rating-based)
4. Real-time PvP turn-based battle
5. Battle result (EXP, rating, drops)
6. Leaderboard (top 100)
7. Basic gacha (equipment)
8. Gem purchase via Stripe
