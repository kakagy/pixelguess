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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      avatars: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          class: string;
          level: number;
          exp: number;
          seed: unknown;
          equipment: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["avatars"]["Row"], "id" | "created_at" | "level" | "exp" | "equipment"> & { level?: number; exp?: number; equipment?: Record<string, unknown> };
        Update: Partial<Database["public"]["Tables"]["avatars"]["Insert"]>;
        Relationships: [];
      };
      equipment: {
        Row: {
          id: string;
          name: string;
          slot: string;
          rarity: string;
          stat_bonus: Record<string, number>;
          sprite_key: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["equipment"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["equipment"]["Insert"]>;
        Relationships: [];
      };
      user_inventory: {
        Row: {
          id: string;
          user_id: string;
          equipment_id: string;
          quantity: number;
          obtained_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_inventory"]["Row"], "id" | "obtained_at"> & { obtained_at?: string };
        Update: Partial<Database["public"]["Tables"]["user_inventory"]["Insert"]>;
        Relationships: [];
      };
      battle_sessions: {
        Row: {
          id: string;
          player_a: string;
          player_b: string | null;
          state: Record<string, unknown>;
          status: string;
          winner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["battle_sessions"]["Row"], "id" | "created_at" | "updated_at" | "state" | "status" | "winner_id" | "player_b"> & { player_b?: string | null; state?: Record<string, unknown>; status?: string; winner_id?: string | null };
        Update: Partial<Database["public"]["Tables"]["battle_sessions"]["Row"]>;
        Relationships: [];
      };
      battles: {
        Row: {
          id: string;
          player_a: string;
          player_b: string;
          winner_id: string | null;
          turns: unknown[];
          rating_change_a: number;
          rating_change_b: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["battles"]["Row"], "created_at" | "turns" | "rating_change_a" | "rating_change_b"> & { turns?: unknown[]; rating_change_a?: number; rating_change_b?: number };
        Update: Partial<Database["public"]["Tables"]["battles"]["Insert"]>;
        Relationships: [];
      };
      leaderboard: {
        Row: {
          user_id: string;
          rating: number;
          wins: number;
          losses: number;
          streak: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leaderboard"]["Row"], "rating" | "wins" | "losses" | "streak" | "updated_at"> & { rating?: number; wins?: number; losses?: number; streak?: number; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["leaderboard"]["Row"]>;
        Relationships: [];
      };
      user_currency: {
        Row: {
          user_id: string;
          gems: number;
          gold: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_currency"]["Row"], "gems" | "gold" | "updated_at"> & { gems?: number; gold?: number; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["user_currency"]["Row"]>;
        Relationships: [];
      };
      gacha_pools: {
        Row: {
          id: string;
          name: string;
          items: unknown;
          rates: unknown;
          cost_gems: number;
          active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["gacha_pools"]["Row"], "id" | "cost_gems" | "active"> & { cost_gems?: number; active?: boolean };
        Update: Partial<Database["public"]["Tables"]["gacha_pools"]["Row"]>;
        Relationships: [];
      };
      gacha_history: {
        Row: {
          id: string;
          user_id: string;
          pool_id: string;
          result: unknown;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gacha_history"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["gacha_history"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
