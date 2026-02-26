-- Avatars
CREATE TABLE avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  class text NOT NULL CHECK (class IN ('knight', 'mage', 'ranger', 'healer')),
  level integer NOT NULL DEFAULT 1,
  exp integer NOT NULL DEFAULT 0,
  seed jsonb NOT NULL,
  equipment jsonb NOT NULL DEFAULT '{"weapon":null,"armor":null,"accessory":null}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Equipment master
CREATE TABLE equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slot text NOT NULL CHECK (slot IN ('weapon', 'armor', 'accessory')),
  rarity text NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'legendary')),
  stat_bonus jsonb NOT NULL DEFAULT '{}',
  sprite_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User inventory
CREATE TABLE user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  quantity integer NOT NULL DEFAULT 1,
  obtained_at timestamptz DEFAULT now()
);

-- Battle sessions (active)
CREATE TABLE battle_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a uuid NOT NULL REFERENCES auth.users(id),
  player_b uuid REFERENCES auth.users(id),
  state jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  winner_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Battle history
CREATE TABLE battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a uuid NOT NULL REFERENCES auth.users(id),
  player_b uuid NOT NULL REFERENCES auth.users(id),
  winner_id uuid,
  turns jsonb NOT NULL DEFAULT '[]',
  rating_change_a integer NOT NULL DEFAULT 0,
  rating_change_b integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Leaderboard
CREATE TABLE leaderboard (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL DEFAULT 1000,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- User currency
CREATE TABLE user_currency (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gems integer NOT NULL DEFAULT 0,
  gold integer NOT NULL DEFAULT 100,
  updated_at timestamptz DEFAULT now()
);

-- Gacha pools
CREATE TABLE gacha_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  items jsonb NOT NULL,
  rates jsonb NOT NULL,
  cost_gems integer NOT NULL DEFAULT 10,
  active boolean NOT NULL DEFAULT true
);

-- Gacha history
CREATE TABLE gacha_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id uuid NOT NULL REFERENCES gacha_pools(id),
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_avatars_user_id ON avatars(user_id);
CREATE INDEX idx_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_battle_sessions_status ON battle_sessions(status);
CREATE INDEX idx_battles_players ON battles(player_a, player_b);
CREATE INDEX idx_leaderboard_rating ON leaderboard(rating DESC);
CREATE INDEX idx_gacha_history_user ON gacha_history(user_id);

-- RLS
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_history ENABLE ROW LEVEL SECURITY;

-- Policies: avatars
CREATE POLICY "Users can read own avatar" ON avatars FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own avatar" ON avatars FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own avatar" ON avatars FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policies: equipment (public read)
CREATE POLICY "Equipment is publicly readable" ON equipment FOR SELECT TO authenticated, anon USING (true);

-- Policies: inventory
CREATE POLICY "Users can read own inventory" ON user_inventory FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON user_inventory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policies: battle sessions (both players can read)
CREATE POLICY "Players can read own battles" ON battle_sessions FOR SELECT TO authenticated
  USING (auth.uid() = player_a OR auth.uid() = player_b);
CREATE POLICY "Users can create battle sessions" ON battle_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = player_a);

-- Policies: battle history
CREATE POLICY "Players can read own battle history" ON battles FOR SELECT TO authenticated
  USING (auth.uid() = player_a OR auth.uid() = player_b);

-- Policies: leaderboard (public read)
CREATE POLICY "Leaderboard is publicly readable" ON leaderboard FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can upsert own leaderboard" ON leaderboard FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies: currency
CREATE POLICY "Users can read own currency" ON user_currency FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own currency" ON user_currency FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies: gacha
CREATE POLICY "Gacha pools are publicly readable" ON gacha_pools FOR SELECT TO authenticated, anon USING (active = true);
CREATE POLICY "Users can read own gacha history" ON gacha_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
