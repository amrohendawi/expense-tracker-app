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
      users: {
        Row: {
          id: string
          email: string
          name: string
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          title: string
          amount: number
          currency: string
          description: string | null
          date: string
          category_id: string
          user_id: string
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          amount: number
          currency?: string
          description?: string | null
          date: string
          category_id: string
          user_id: string
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          amount?: number
          currency?: string
          description?: string | null
          date?: string
          category_id?: string
          user_id?: string
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          icon: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          icon?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          amount: number
          currency: string
          period: string
          start_date: string
          end_date: string
          description: string | null
          category_id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          currency?: string
          period: string
          start_date: string
          end_date: string
          description?: string | null
          category_id: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          currency?: string
          period?: string
          start_date?: string
          end_date?: string
          description?: string | null
          category_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          currency: string
          language: string
          theme: string
          auto_save: boolean
          email_notifications: boolean
          budget_alerts: boolean
          weekly_summary: boolean
          dark_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          currency?: string
          language?: string
          theme?: string
          auto_save?: boolean
          email_notifications?: boolean
          budget_alerts?: boolean
          weekly_summary?: boolean
          dark_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          currency?: string
          language?: string
          theme?: string
          auto_save?: boolean
          email_notifications?: boolean
          budget_alerts?: boolean
          weekly_summary?: boolean
          dark_mode?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
