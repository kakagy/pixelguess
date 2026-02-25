CREATE TABLE puzzles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_number integer UNIQUE NOT NULL,
  publish_date date UNIQUE NOT NULL,
  answer text NOT NULL,
  category text NOT NULL,
  hints jsonb NOT NULL DEFAULT '[]',
  image_urls jsonb NOT NULL DEFAULT '{}',
  difficulty integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_id uuid NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  guesses jsonb NOT NULL DEFAULT '[]',
  solved boolean NOT NULL DEFAULT false,
  solved_round integer,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, puzzle_id)
);

CREATE TABLE user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_played integer DEFAULT 0,
  total_solved integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  max_streak integer DEFAULT 0,
  guess_distribution jsonb DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0}',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'inactive',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_puzzles_publish_date ON puzzles(publish_date);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_puzzle_id ON attempts(puzzle_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);

ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Puzzles are publicly readable"
  ON puzzles FOR SELECT TO authenticated, anon
  USING (publish_date <= CURRENT_DATE);

CREATE POLICY "Users can read own attempts"
  ON attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own stats"
  ON user_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own stats"
  ON user_stats FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
