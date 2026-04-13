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
      consents: {
        Row: {
          allow_ai: boolean
          allow_archive: boolean
          allow_public: boolean
          id: string
          ip_hash: string
          recording_id: string
          signature_b64: string
          signed_at: string
          witness_id: string
        }
        Insert: {
          allow_ai?: boolean
          allow_archive?: boolean
          allow_public?: boolean
          id?: string
          ip_hash: string
          recording_id: string
          signature_b64: string
          signed_at?: string
          witness_id: string
        }
        Update: {
          allow_ai?: boolean
          allow_archive?: boolean
          allow_public?: boolean
          id?: string
          ip_hash?: string
          recording_id?: string
          signature_b64?: string
          signed_at?: string
          witness_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: true
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_witness_id_fkey"
            columns: ["witness_id"]
            isOneToOne: false
            referencedRelation: "witnesses"
            referencedColumns: ["id"]
          },
        ]
      }
      recordings: {
        Row: {
          audio_url: string
          collector_id: string
          created_at: string
          dialect: string | null
          duration_s: number
          id: string
          language_ratio: Database["public"]["Enums"]["language_ratio"]
          region_id: string
          status: Database["public"]["Enums"]["recording_status"]
          theme: string
          village: string
          witness_id: string
        }
        Insert: {
          audio_url: string
          collector_id: string
          created_at?: string
          dialect?: string | null
          duration_s?: number
          id?: string
          language_ratio?: Database["public"]["Enums"]["language_ratio"]
          region_id: string
          status?: Database["public"]["Enums"]["recording_status"]
          theme?: string
          village: string
          witness_id: string
        }
        Update: {
          audio_url?: string
          collector_id?: string
          created_at?: string
          dialect?: string | null
          duration_s?: number
          id?: string
          language_ratio?: Database["public"]["Enums"]["language_ratio"]
          region_id?: string
          status?: Database["public"]["Enums"]["recording_status"]
          theme?: string
          village?: string
          witness_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordings_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recordings_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recordings_witness_id_fkey"
            columns: ["witness_id"]
            isOneToOne: false
            referencedRelation: "witnesses"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          admin_user_id: string | null
          created_at: string
          dialect_variants: string[]
          id: string
          language_code: string
          name: string
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string
          dialect_variants?: string[]
          id?: string
          language_code: string
          name: string
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string
          dialect_variants?: string[]
          id?: string
          language_code?: string
          name?: string
        }
        Relationships: []
      }
      segments: {
        Row: {
          corrected_text: string | null
          end_ms: number
          id: string
          is_gold: boolean
          recording_id: string
          start_ms: number
          status: Database["public"]["Enums"]["segment_status"]
          validated_at: string | null
          validated_by: string | null
          whisper_confidence: number | null
          whisper_text: string | null
        }
        Insert: {
          corrected_text?: string | null
          end_ms: number
          id?: string
          is_gold?: boolean
          recording_id: string
          start_ms: number
          status?: Database["public"]["Enums"]["segment_status"]
          validated_at?: string | null
          validated_by?: string | null
          whisper_confidence?: number | null
          whisper_text?: string | null
        }
        Update: {
          corrected_text?: string | null
          end_ms?: number
          id?: string
          is_gold?: boolean
          recording_id?: string
          start_ms?: number
          status?: Database["public"]["Enums"]["segment_status"]
          validated_at?: string | null
          validated_by?: string | null
          whisper_confidence?: number | null
          whisper_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "segments_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segments_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          badge_level: Database["public"]["Enums"]["badge_level"]
          certified_hours: number
          display_name: string
          id: string
          region_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          segments_validated: number
        }
        Insert: {
          badge_level?: Database["public"]["Enums"]["badge_level"]
          certified_hours?: number
          display_name: string
          id: string
          region_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          segments_validated?: number
        }
        Update: {
          badge_level?: Database["public"]["Enums"]["badge_level"]
          certified_hours?: number
          display_name?: string
          id?: string
          region_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          segments_validated?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      validations: {
        Row: {
          corrected_text: string | null
          created_at: string
          id: string
          segment_id: string
          user_id: string | null
          vote: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          corrected_text?: string | null
          created_at?: string
          id?: string
          segment_id: string
          user_id?: string | null
          vote: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          corrected_text?: string | null
          created_at?: string
          id?: string
          segment_id?: string
          user_id?: string | null
          vote?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "validations_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      witnesses: {
        Row: {
          age_range: Database["public"]["Enums"]["age_range"] | null
          created_at: string
          deleted_at: string | null
          first_name: string
          id: string
          last_name: string
          region_id: string | null
          village: string
        }
        Insert: {
          age_range?: Database["public"]["Enums"]["age_range"] | null
          created_at?: string
          deleted_at?: string | null
          first_name: string
          id?: string
          last_name: string
          region_id?: string | null
          village: string
        }
        Update: {
          age_range?: Database["public"]["Enums"]["age_range"] | null
          created_at?: string
          deleted_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          region_id?: string | null
          village?: string
        }
        Relationships: [
          {
            foreignKeyName: "witnesses_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_gold_consensus: {
        Args: { p_segment_id: string }
        Returns: undefined
      }
      has_valid_consent: { Args: { p_recording_id: string }; Returns: boolean }
    }
    Enums: {
      age_range: "70-80" | "80-90" | "90+"
      badge_level: "newcomer" | "contributor" | "expert" | "validator"
      language_ratio: "mostly_corsican" | "mixed" | "mostly_french"
      recording_status:
        | "uploaded"
        | "processing"
        | "transcribed"
        | "in_review"
        | "complete"
        | "rejected"
      segment_status:
        | "pending"
        | "in_progress"
        | "validated"
        | "inaudible"
        | "skipped"
      user_role:
        | "anonymous"
        | "collector"
        | "transcriber"
        | "lcc_student"
        | "validator"
        | "region_admin"
        | "super_admin"
      vote_type: "up" | "down" | "skip" | "inaudible"
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
    Enums: {
      age_range: ["70-80", "80-90", "90+"],
      badge_level: ["newcomer", "contributor", "expert", "validator"],
      language_ratio: ["mostly_corsican", "mixed", "mostly_french"],
      recording_status: [
        "uploaded",
        "processing",
        "transcribed",
        "in_review",
        "complete",
        "rejected",
      ],
      segment_status: [
        "pending",
        "in_progress",
        "validated",
        "inaudible",
        "skipped",
      ],
      user_role: [
        "anonymous",
        "collector",
        "transcriber",
        "lcc_student",
        "validator",
        "region_admin",
        "super_admin",
      ],
      vote_type: ["up", "down", "skip", "inaudible"],
    },
  },
} as const
