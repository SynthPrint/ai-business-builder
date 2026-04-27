export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_breakdowns: {
        Row: {
          bottlenecks: Json
          created_at: string
          id: string
          motivation: string | null
          next_tasks: Json
          player_id: string
          prompt_context: string | null
        }
        Insert: {
          bottlenecks?: Json
          created_at?: string
          id?: string
          motivation?: string | null
          next_tasks?: Json
          player_id?: string
          prompt_context?: string | null
        }
        Update: {
          bottlenecks?: Json
          created_at?: string
          id?: string
          motivation?: string | null
          next_tasks?: Json
          player_id?: string
          prompt_context?: string | null
        }
        Relationships: []
      }
      badge_awards: {
        Row: {
          awarded_at: string
          badge_key: string
          id: string
          player_id: string
        }
        Insert: {
          awarded_at?: string
          badge_key: string
          id?: string
          player_id?: string
        }
        Update: {
          awarded_at?: string
          badge_key?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_awards_badge_key_fkey"
            columns: ["badge_key"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["key"]
          },
        ]
      }
      badges: {
        Row: {
          description: string
          icon: string
          key: string
          name: string
          tier: string
        }
        Insert: {
          description: string
          icon?: string
          key: string
          name: string
          tier?: string
        }
        Update: {
          description?: string
          icon?: string
          key?: string
          name?: string
          tier?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          bottleneck_note: string | null
          check_in_date: string
          created_at: string
          efficiency_score: number | null
          id: string
          player_id: string
        }
        Insert: {
          bottleneck_note?: string | null
          check_in_date?: string
          created_at?: string
          efficiency_score?: number | null
          id?: string
          player_id?: string
        }
        Update: {
          bottleneck_note?: string | null
          check_in_date?: string
          created_at?: string
          efficiency_score?: number | null
          id?: string
          player_id?: string
        }
        Relationships: []
      }
      player: {
        Row: {
          created_at: string
          id: string
          last_check_in: string | null
          level: number
          longest_streak: number
          streak: number
          updated_at: string
          xp: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_check_in?: string | null
          level?: number
          longest_streak?: number
          streak?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_check_in?: string | null
          level?: number
          longest_streak?: number
          streak?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      quest_completions: {
        Row: {
          completed_at: string
          id: string
          notes: string | null
          player_id: string
          quest_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string
          id?: string
          notes?: string | null
          player_id?: string
          quest_id: string
          xp_earned?: number
        }
        Update: {
          completed_at?: string
          id?: string
          notes?: string | null
          player_id?: string
          quest_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_completions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          badge_key: string | null
          created_at: string
          description: string
          id: string
          is_ai_generated: boolean
          sort_order: number
          stage: string
          title: string
          xp_reward: number
        }
        Insert: {
          badge_key?: string | null
          created_at?: string
          description: string
          id?: string
          is_ai_generated?: boolean
          sort_order?: number
          stage: string
          title: string
          xp_reward?: number
        }
        Update: {
          badge_key?: string | null
          created_at?: string
          description?: string
          id?: string
          is_ai_generated?: boolean
          sort_order?: number
          stage?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
