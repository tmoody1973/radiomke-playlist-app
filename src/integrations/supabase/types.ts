export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          artist: string
          created_at: string
          duration: number | null
          episode_title: string | null
          id: string
          image: string | null
          label: string | null
          release: string | null
          song: string
          spinitron_id: number
          start_time: string
          station_id: string
          updated_at: string
        }
        Insert: {
          artist: string
          created_at?: string
          duration?: number | null
          episode_title?: string | null
          id?: string
          image?: string | null
          label?: string | null
          release?: string | null
          song: string
          spinitron_id: number
          start_time: string
          station_id: string
          updated_at?: string
        }
        Update: {
          artist?: string
          created_at?: string
          duration?: number | null
          episode_title?: string | null
          id?: string
          image?: string | null
          label?: string | null
          release?: string | null
          song?: string
          spinitron_id?: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
