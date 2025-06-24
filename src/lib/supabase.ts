import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Movie {
  movie_id: string
  title: string
  description: string
  genre: string
  duration: number
  release_date: string
  poster_url: string
  trailer_url?: string
  created_at: string
}

export interface Hall {
  hall_id: string
  hall_name: string
  total_seats: number
  layout_rows: number
  layout_columns: number
  created_at: string
}

export interface Showtime {
  showtime_id: string
  movie_id: string
  hall_id: string
  show_date: string
  start_time: string
  end_time: string
  ticket_price: number
  movie?: Movie
  hall?: Hall
}

export interface Booking {
  booking_id: string
  user_id: string
  showtime_id: string
  booking_date: string
  total_seats: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  selected_seats: string[]
  showtime?: Showtime
}

export interface Payment {
  payment_id: string
  booking_id: string
  payment_date: string
  amount: number
  payment_method: string
  status: 'success' | 'failed' | 'pending'
}