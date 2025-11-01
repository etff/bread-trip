/**
 * Supabase 데이터베이스 타입 정의
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          nickname: string | null;
          profile_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nickname?: string | null;
          profile_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nickname?: string | null;
          profile_image_url?: string | null;
          created_at?: string;
        };
      };
      bakeries: {
        Row: {
          id: string;
          name: string;
          address: string;
          district: string | null;
          lat: number;
          lng: number;
          signature_bread: string | null;
          description: string | null;
          image_url: string | null;
          created_by: string | null;
          created_at: string;
          phone: string | null;
          hours: string | null;
          parking_available: boolean | null;
          wifi_available: boolean | null;
          pet_friendly: boolean | null;
          website_url: string | null;
          instagram_url: string | null;
          price_range: string | null;
          closed_days: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          district?: string | null;
          lat: number;
          lng: number;
          signature_bread?: string | null;
          description?: string | null;
          image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          phone?: string | null;
          hours?: string | null;
          parking_available?: boolean | null;
          wifi_available?: boolean | null;
          pet_friendly?: boolean | null;
          website_url?: string | null;
          instagram_url?: string | null;
          price_range?: string | null;
          closed_days?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          district?: string | null;
          lat?: number;
          lng?: number;
          signature_bread?: string | null;
          description?: string | null;
          image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          phone?: string | null;
          hours?: string | null;
          parking_available?: boolean | null;
          wifi_available?: boolean | null;
          pet_friendly?: boolean | null;
          website_url?: string | null;
          instagram_url?: string | null;
          price_range?: string | null;
          closed_days?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          bakery_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bakery_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          bakery_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          bakery_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bakery_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bakery_id?: string;
          created_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          icon: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
      };
      bakery_themes: {
        Row: {
          id: string;
          bakery_id: string;
          theme_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bakery_id: string;
          theme_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          bakery_id?: string;
          theme_id?: string;
          created_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string;
          condition_type: string;
          condition_value: number | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon: string;
          condition_type: string;
          condition_value?: number | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string;
          condition_type?: string;
          condition_value?: number | null;
          color?: string | null;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
