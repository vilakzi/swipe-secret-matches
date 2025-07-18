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
      admin_content: {
        Row: {
          admin_id: string
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          auto_published: boolean | null
          category: Database["public"]["Enums"]["content_category"] | null
          content_hash: string | null
          content_type: string
          created_at: string | null
          description: string | null
          file_size: number | null
          file_url: string
          id: string
          is_promoted: boolean | null
          like_count: number | null
          metadata: Json | null
          optimized_file_sizes: Json | null
          original_file_size: number | null
          promoted_at: string | null
          promoted_by: string | null
          promotion_priority: number | null
          published_at: string | null
          rejection_reason: string | null
          scheduled_at: string | null
          share_count: number | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          view_count: number | null
          visibility: string | null
        }
        Insert: {
          admin_id: string
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_published?: boolean | null
          category?: Database["public"]["Enums"]["content_category"] | null
          content_hash?: string | null
          content_type: string
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_promoted?: boolean | null
          like_count?: number | null
          metadata?: Json | null
          optimized_file_sizes?: Json | null
          original_file_size?: number | null
          promoted_at?: string | null
          promoted_by?: string | null
          promotion_priority?: number | null
          published_at?: string | null
          rejection_reason?: string | null
          scheduled_at?: string | null
          share_count?: number | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Update: {
          admin_id?: string
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_published?: boolean | null
          category?: Database["public"]["Enums"]["content_category"] | null
          content_hash?: string | null
          content_type?: string
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_promoted?: boolean | null
          like_count?: number | null
          metadata?: Json | null
          optimized_file_sizes?: Json | null
          original_file_size?: number | null
          promoted_at?: string | null
          promoted_by?: string | null
          promotion_priority?: number | null
          published_at?: string | null
          rejection_reason?: string | null
          scheduled_at?: string | null
          share_count?: number | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      content_analytics: {
        Row: {
          active_users_7d: number | null
          content_id: string
          date: string | null
          id: string
          metadata: Json | null
          metric_type: string
          timestamp: string | null
          total_posts: number | null
          total_subscribers: number | null
          total_users: number | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          active_users_7d?: number | null
          content_id: string
          date?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          timestamp?: string | null
          total_posts?: number | null
          total_subscribers?: number | null
          total_users?: number | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          active_users_7d?: number | null
          content_id?: string
          date?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          timestamp?: string | null
          total_posts?: number | null
          total_subscribers?: number | null
          total_users?: number | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "admin_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_approvals: {
        Row: {
          action: string
          content_id: string
          created_at: string | null
          id: string
          notes: string | null
          reviewer_id: string
        }
        Insert: {
          action: string
          content_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          reviewer_id: string
        }
        Update: {
          action?: string
          content_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_approvals_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "admin_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          tag: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          tag: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_tags_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "admin_content"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_usage: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          last_scroll_at: string | null
          profile_scrolls: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          last_scroll_at?: string | null
          profile_scrolls?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          last_scroll_at?: string | null
          profile_scrolls?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_super_like: boolean | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_super_like?: boolean | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_super_like?: boolean | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payment_status: string | null
          post_id: string
          promotion_hours: number
          provider_id: string
          stripe_session_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_status?: string | null
          post_id: string
          promotion_hours: number
          provider_id: string
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_status?: string | null
          post_id?: string
          promotion_hours?: number
          provider_id?: string
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_payments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string | null
          content_url: string
          created_at: string | null
          expires_at: string
          id: string
          is_promoted: boolean | null
          payment_status: string | null
          post_type: Database["public"]["Enums"]["post_type"]
          promotion_type: Database["public"]["Enums"]["promotion_type"] | null
          provider_id: string
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          content_url: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_promoted?: boolean | null
          payment_status?: string | null
          post_type: Database["public"]["Enums"]["post_type"]
          promotion_type?: Database["public"]["Enums"]["promotion_type"] | null
          provider_id: string
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          content_url?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_promoted?: boolean | null
          payment_status?: string | null
          post_type?: Database["public"]["Enums"]["post_type"]
          promotion_type?: Database["public"]["Enums"]["promotion_type"] | null
          provider_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          gender: string | null
          id: string
          interests: string[] | null
          is_blocked: boolean | null
          last_active: string | null
          location: string | null
          phone: string | null
          photo_verified: boolean | null
          privacy_settings: Json | null
          profile_image_url: string | null
          profile_images: string[] | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
          verifications: Json | null
          whatsapp: string | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          gender?: string | null
          id: string
          interests?: string[] | null
          is_blocked?: boolean | null
          last_active?: string | null
          location?: string | null
          phone?: string | null
          photo_verified?: boolean | null
          privacy_settings?: Json | null
          profile_image_url?: string | null
          profile_images?: string[] | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verifications?: Json | null
          whatsapp?: string | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_blocked?: boolean | null
          last_active?: string | null
          location?: string | null
          phone?: string | null
          photo_verified?: boolean | null
          privacy_settings?: Json | null
          profile_image_url?: string | null
          profile_images?: string[] | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verifications?: Json | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      super_likes: {
        Row: {
          created_at: string | null
          id: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      superadmin_sessions: {
        Row: {
          admin_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string | null
          id: string
          liked: boolean
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          liked: boolean
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          liked?: boolean
          target_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          location_enabled: boolean | null
          max_age: number | null
          max_distance: number | null
          min_age: number | null
          show_me: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          location_enabled?: boolean | null
          max_age?: number | null
          max_distance?: number | null
          min_age?: number | null
          show_me?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          location_enabled?: boolean | null
          max_age?: number | null
          max_distance?: number | null
          min_age?: number | null
          show_me?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "service_provider" | "admin"
      content_category:
        | "entertainment"
        | "news"
        | "lifestyle"
        | "sports"
        | "technology"
        | "food"
        | "travel"
        | "fashion"
        | "health"
        | "education"
        | "business"
        | "other"
      post_type: "image" | "video"
      promotion_type: "free_2h" | "paid_8h" | "paid_12h"
      user_type: "user" | "service_provider"
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
      app_role: ["user", "service_provider", "admin"],
      content_category: [
        "entertainment",
        "news",
        "lifestyle",
        "sports",
        "technology",
        "food",
        "travel",
        "fashion",
        "health",
        "education",
        "business",
        "other",
      ],
      post_type: ["image", "video"],
      promotion_type: ["free_2h", "paid_8h", "paid_12h"],
      user_type: ["user", "service_provider"],
    },
  },
} as const
