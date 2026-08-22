export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          category: string
          city_id: number
          created_at: string
          currency: string
          description: string | null
          duration_minutes: number | null
          estimated_cost: number
          id: number
          image_url: string | null
          name: string
          rating: number | null
        }
        Insert: {
          category: string
          city_id: number
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes?: number | null
          estimated_cost?: number
          id?: never
          image_url?: string | null
          name: string
          rating?: number | null
        }
        Update: {
          category?: string
          city_id?: number
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes?: number | null
          estimated_cost?: number
          id?: never
          image_url?: string | null
          name?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          cost_index: number | null
          country: string
          country_code: string | null
          created_at: string
          description: string | null
          id: number
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          popularity_score: number | null
        }
        Insert: {
          cost_index?: number | null
          country: string
          country_code?: string | null
          created_at?: string
          description?: string | null
          id?: never
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          popularity_score?: number | null
        }
        Update: {
          cost_index?: number | null
          country?: string
          country_code?: string | null
          created_at?: string
          description?: string | null
          id?: never
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          popularity_score?: number | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          created_at: string
          description: string | null
          id: string
          title: string
          trip_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          trip_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          is_public: boolean
          preferred_language: string | null
          travel_interests: string[] | null
          travel_style: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_public?: boolean
          preferred_language?: string | null
          travel_interests?: string[] | null
          travel_style?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_public?: boolean
          preferred_language?: string | null
          travel_interests?: string[] | null
          travel_style?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      saved_destinations: {
        Row: {
          city_id: number
          created_at: string
          user_id: string
        }
        Insert: {
          city_id: number
          created_at?: string
          user_id: string
        }
        Update: {
          city_id?: number
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_destinations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_destinations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_activities: {
        Row: {
          activity_date: string | null
          activity_id: number | null
          created_at: string
          currency: string
          custom_description: string | null
          custom_title: string | null
          end_time: string | null
          estimated_cost: number
          id: string
          notes: string | null
          position: number
          start_time: string | null
          trip_stop_id: string
        }
        Insert: {
          activity_date?: string | null
          activity_id?: number | null
          created_at?: string
          currency?: string
          custom_description?: string | null
          custom_title?: string | null
          end_time?: string | null
          estimated_cost?: number
          id?: string
          notes?: string | null
          position?: number
          start_time?: string | null
          trip_stop_id: string
        }
        Update: {
          activity_date?: string | null
          activity_id?: number | null
          created_at?: string
          currency?: string
          custom_description?: string | null
          custom_title?: string | null
          end_time?: string | null
          estimated_cost?: number
          id?: string
          notes?: string | null
          position?: number
          start_time?: string | null
          trip_stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_activities_trip_stop_id_fkey"
            columns: ["trip_stop_id"]
            isOneToOne: false
            referencedRelation: "trip_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          currency: string
          expense_date: string | null
          id: string
          notes: string | null
          title: string
          trip_id: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          expense_date?: string | null
          id?: string
          notes?: string | null
          title: string
          trip_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          expense_date?: string | null
          id?: string
          notes?: string | null
          title?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_members: {
        Row: {
          joined_at: string
          role: Database["public"]["Enums"]["trip_member_role"]
          trip_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          role?: Database["public"]["Enums"]["trip_member_role"]
          trip_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          role?: Database["public"]["Enums"]["trip_member_role"]
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_stops: {
        Row: {
          arrival_date: string | null
          city_id: number
          created_at: string
          departure_date: string | null
          id: string
          notes: string | null
          stop_order: number
          trip_id: string
        }
        Insert: {
          arrival_date?: string | null
          city_id: number
          created_at?: string
          departure_date?: string | null
          id?: string
          notes?: string | null
          stop_order: number
          trip_id: string
        }
        Update: {
          arrival_date?: string | null
          city_id?: number
          created_at?: string
          departure_date?: string | null
          id?: string
          notes?: string | null
          stop_order?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_stops_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget: number | null
          cover_image_url: string | null
          created_at: string
          currency: string
          description: string | null
          end_date: string | null
          id: string
          owner_id: string
          share_slug: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["trip_status"]
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["trip_visibility"]
        }
        Insert: {
          budget?: number | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          owner_id: string
          share_slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["trip_visibility"]
        }
        Update: {
          budget?: number | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          owner_id?: string
          share_slug?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["trip_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "trips_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      trip_summary: {
        Row: {
          budget: number | null
          city_count: number | null
          cover_image_url: string | null
          created_at: string | null
          currency: string | null
          duration_days: number | null
          end_date: string | null
          id: string | null
          owner_avatar: string | null
          owner_id: string | null
          owner_name: string | null
          share_slug: string | null
          spent_amount: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["trip_status"] | null
          title: string | null
          visibility: Database["public"]["Enums"]["trip_visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_trip_budget_breakdown: {
        Args: { target_trip_id: string }
        Returns: {
          category: Database["public"]["Enums"]["expense_category"]
          total: number
        }[]
      }
      get_trip_total: { Args: { target_trip_id: string }; Returns: number }
      is_trip_editor: { Args: { target_trip_id: string }; Returns: boolean }
      is_trip_member: { Args: { target_trip_id: string }; Returns: boolean }
    }
    Enums: {
      expense_category:
        | "transport"
        | "accommodation"
        | "activity"
        | "food"
        | "shopping"
        | "miscellaneous"
      trip_member_role: "viewer" | "editor" | "owner"
      trip_status: "draft" | "planned" | "ongoing" | "completed" | "cancelled"
      trip_visibility: "private" | "friends" | "public"
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

export const Constants = {
  public: {
    Enums: {
      expense_category: [
        "transport",
        "accommodation",
        "activity",
        "food",
        "shopping",
        "miscellaneous",
      ],
      trip_member_role: ["viewer", "editor", "owner"],
      trip_status: ["draft", "planned", "ongoing", "completed", "cancelled"],
      trip_visibility: ["private", "friends", "public"],
    },
  },
} as const
