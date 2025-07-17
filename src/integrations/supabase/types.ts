export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      custom_events: {
        Row: {
          artist_name: string
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          event_title: string
          id: string
          is_active: boolean
          price_max: number | null
          price_min: number | null
          station_ids: string[] | null
          ticket_url: string | null
          updated_at: string
          venue_city: string | null
          venue_name: string | null
          venue_state: string | null
        }
        Insert: {
          artist_name: string
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          event_title: string
          id?: string
          is_active?: boolean
          price_max?: number | null
          price_min?: number | null
          station_ids?: string[] | null
          ticket_url?: string | null
          updated_at?: string
          venue_city?: string | null
          venue_name?: string | null
          venue_state?: string | null
        }
        Update: {
          artist_name?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_title?: string
          id?: string
          is_active?: boolean
          price_max?: number | null
          price_min?: number | null
          station_ids?: string[] | null
          ticket_url?: string | null
          updated_at?: string
          venue_city?: string | null
          venue_name?: string | null
          venue_state?: string | null
        }
        Relationships: []
      }
      songs: {
        Row: {
          added_by_user_id: string | null
          artist: string
          created_at: string
          duration: number | null
          enhanced_metadata: Json | null
          episode_title: string | null
          id: string
          image: string | null
          is_manual: boolean
          label: string | null
          manual_added_at: string | null
          release: string | null
          song: string
          spinitron_id: number
          spotify_album_id: string | null
          spotify_artist_id: string | null
          spotify_track_id: string | null
          start_time: string
          station_id: string
          updated_at: string
        }
        Insert: {
          added_by_user_id?: string | null
          artist: string
          created_at?: string
          duration?: number | null
          enhanced_metadata?: Json | null
          episode_title?: string | null
          id?: string
          image?: string | null
          is_manual?: boolean
          label?: string | null
          manual_added_at?: string | null
          release?: string | null
          song: string
          spinitron_id: number
          spotify_album_id?: string | null
          spotify_artist_id?: string | null
          spotify_track_id?: string | null
          start_time: string
          station_id: string
          updated_at?: string
        }
        Update: {
          added_by_user_id?: string | null
          artist?: string
          created_at?: string
          duration?: number | null
          enhanced_metadata?: Json | null
          episode_title?: string | null
          id?: string
          image?: string | null
          is_manual?: boolean
          label?: string | null
          manual_added_at?: string | null
          release?: string | null
          song?: string
          spinitron_id?: number
          spotify_album_id?: string | null
          spotify_artist_id?: string | null
          spotify_track_id?: string | null
          start_time?: string
          station_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_songs_station"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          api_key_secret_name: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          api_key_secret_name: string
          created_at?: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          api_key_secret_name?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticketmaster_events_cache: {
        Row: {
          artist_name: string
          created_at: string
          event_data: Json | null
          event_date: string
          event_id: string
          event_name: string
          event_time: string | null
          id: string
          is_active: boolean
          price_max: number | null
          price_min: number | null
          ticket_url: string | null
          updated_at: string
          venue_city: string | null
          venue_name: string | null
          venue_state: string | null
        }
        Insert: {
          artist_name: string
          created_at?: string
          event_data?: Json | null
          event_date: string
          event_id: string
          event_name: string
          event_time?: string | null
          id?: string
          is_active?: boolean
          price_max?: number | null
          price_min?: number | null
          ticket_url?: string | null
          updated_at?: string
          venue_city?: string | null
          venue_name?: string | null
          venue_state?: string | null
        }
        Update: {
          artist_name?: string
          created_at?: string
          event_data?: Json | null
          event_date?: string
          event_id?: string
          event_name?: string
          event_time?: string | null
          id?: string
          is_active?: boolean
          price_max?: number | null
          price_min?: number | null
          ticket_url?: string | null
          updated_at?: string
          venue_city?: string | null
          venue_name?: string | null
          venue_state?: string | null
        }
        Relationships: []
      }
      youtube_cache: {
        Row: {
          artist: string
          channel_title: string | null
          created_at: string
          embed_url: string | null
          found: boolean
          id: string
          search_key: string
          song: string
          thumbnail: string | null
          title: string | null
          updated_at: string
          video_id: string | null
        }
        Insert: {
          artist: string
          channel_title?: string | null
          created_at?: string
          embed_url?: string | null
          found?: boolean
          id?: string
          search_key: string
          song: string
          thumbnail?: string | null
          title?: string | null
          updated_at?: string
          video_id?: string | null
        }
        Update: {
          artist?: string
          channel_title?: string | null
          created_at?: string
          embed_url?: string | null
          found?: boolean
          id?: string
          search_key?: string
          song?: string
          thumbnail?: string | null
          title?: string | null
          updated_at?: string
          video_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_song_time_conflict: {
        Args: {
          p_start_time: string
          p_duration: number
          p_station_id: string
          p_exclude_id?: string
        }
        Returns: boolean
      }
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
