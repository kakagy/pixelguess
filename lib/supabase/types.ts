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
