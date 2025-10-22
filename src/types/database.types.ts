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
      profiles: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          email: string | null
          subscription_status: string | null
          trial_expires_at: string | null
          subscription_start_date: string | null
          trial_started_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          phone?: string | null
          email?: string | null
          subscription_status?: string | null
          trial_expires_at?: string | null
          subscription_start_date?: string | null
          trial_started_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          phone?: string | null
          email?: string | null
          subscription_status?: string | null
          trial_expires_at?: string | null
          subscription_start_date?: string | null
          trial_started_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_name: string
          client_phone: string
          service_id: string
          barber_id: string
          appointment_date: string
          appointment_time: string
          status: 'confirmed' | 'cancelled' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          client_name: string
          client_phone: string
          service_id: string
          barber_id: string
          appointment_date: string
          appointment_time: string
          status?: 'confirmed' | 'cancelled' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          client_phone?: string
          service_id?: string
          barber_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: 'confirmed' | 'cancelled' | 'completed'
          created_at?: string
        }
      }
      barbers: {
        Row: {
          id: string
          profile_id: string
          specialty: string | null
          experience_years: number
          is_active: boolean
          role: 'owner' | 'employee'
          employee_name: string | null
          employee_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          specialty?: string | null
          experience_years: number
          is_active?: boolean
          role: 'owner' | 'employee'
          employee_name?: string | null
          employee_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          specialty?: string | null
          experience_years?: number
          is_active?: boolean
          role?: 'owner' | 'employee'
          employee_name?: string | null
          employee_phone?: string | null
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
