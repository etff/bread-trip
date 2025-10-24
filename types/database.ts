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
          image_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          district?: string | null;
          lat: number;
          lng: number;
          signature_bread?: string | null;
          image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          district?: string | null;
          lat?: number;
          lng?: number;
          signature_bread?: string | null;
          image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
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
