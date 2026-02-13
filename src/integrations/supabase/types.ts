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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      music_sheets: {
        Row: {
          content_text: string | null
          created_at: string
          file_url: string | null
          id: string
          instrument_type: string
          session_id: string
          song_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          instrument_type?: string
          session_id: string
          song_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          content_text?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          instrument_type?: string
          session_id?: string
          song_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_sheets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_sheets_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "session_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          instruments: string[]
          is_musician: boolean
          is_singer: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          instruments?: string[]
          is_musician?: boolean
          is_singer?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          instruments?: string[]
          is_musician?: boolean
          is_singer?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_content: {
        Row: {
          content_text: string | null
          content_type: string
          description: string | null
          file_url: string | null
          id: string
          session_id: string
          title: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          content_text?: string | null
          content_type: string
          description?: string | null
          file_url?: string | null
          id?: string
          session_id: string
          title?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          content_text?: string | null
          content_type?: string
          description?: string | null
          file_url?: string | null
          id?: string
          session_id?: string
          title?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_content_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_registrations: {
        Row: {
          display_name: string
          id: string
          registered_at: string
          roles: string[]
          session_id: string
          user_id: string
        }
        Insert: {
          display_name: string
          id?: string
          registered_at?: string
          roles?: string[]
          session_id: string
          user_id: string
        }
        Update: {
          display_name?: string
          id?: string
          registered_at?: string
          roles?: string[]
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_registrations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_roles: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          label_cn: string
          label_en: string
          sort_order: number
          value: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          label_cn: string
          label_en: string
          sort_order?: number
          value: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          label_cn?: string
          label_en?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      session_songs: {
        Row: {
          artist: string
          created_at: string
          id: string
          requested_by: string
          session_id: string
          singer_name: string
          song_key: string
          song_title: string
          sort_order: number
        }
        Insert: {
          artist: string
          created_at?: string
          id?: string
          requested_by: string
          session_id: string
          singer_name: string
          song_key: string
          song_title: string
          sort_order?: number
        }
        Update: {
          artist?: string
          created_at?: string
          id?: string
          requested_by?: string
          session_id?: string
          singer_name?: string
          song_key?: string
          song_title?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_songs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_types: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          label_cn: string
          label_en: string
          sort_order: number
          value: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          label_cn: string
          label_en: string
          sort_order?: number
          value: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          label_cn?: string
          label_en?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          allowed_roles: string[]
          announcement: string | null
          announcement_cn: string | null
          created_at: string
          created_by: string | null
          day_of_week: number
          end_time: string
          id: string
          is_archived: boolean
          max_participants: number
          max_songs: number
          name: string
          name_cn: string | null
          recurrence_rule: string | null
          session_date: string | null
          session_type: string
          start_time: string
          theme: string | null
          theme_cn: string | null
          updated_at: string
        }
        Insert: {
          allowed_roles?: string[]
          announcement?: string | null
          announcement_cn?: string | null
          created_at?: string
          created_by?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_archived?: boolean
          max_participants?: number
          max_songs?: number
          name: string
          name_cn?: string | null
          recurrence_rule?: string | null
          session_date?: string | null
          session_type?: string
          start_time: string
          theme?: string | null
          theme_cn?: string | null
          updated_at?: string
        }
        Update: {
          allowed_roles?: string[]
          announcement?: string | null
          announcement_cn?: string | null
          created_at?: string
          created_by?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_archived?: boolean
          max_participants?: number
          max_songs?: number
          name?: string
          name_cn?: string | null
          recurrence_rule?: string | null
          session_date?: string | null
          session_type?: string
          start_time?: string
          theme?: string | null
          theme_cn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_email_by_display_name: {
        Args: { lookup_name: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
