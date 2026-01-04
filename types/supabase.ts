// This file is a placeholder for Supabase generated types
// In a real project, you would generate this using: npx supabase gen types typescript --project-id <project-id>
// For now, we'll define a minimal type structure

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_date: string
          target_end_date: string
          next_reminder_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_date: string
          target_end_date: string
          next_reminder_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_date?: string
          target_end_date?: string
          next_reminder_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      push_subscriptions: {
        Row: {
          user_id: string
          subscription: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          subscription: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          subscription?: Json
          created_at?: string
          updated_at?: string
        }
      }
      progress_logs: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          percentage: number
          notes: string | null
          logged_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          percentage: number
          notes?: string | null
          logged_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          percentage?: number
          notes?: string | null
          logged_at?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}
