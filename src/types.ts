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
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          description: string | null
          phone: string | null
          email: string | null
          website: string | null
          address: string | null
          city: string | null
          region: string | null
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          cover_image: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          description?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          region?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          cover_image?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          description?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          region?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          cover_image?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
        }
      }
      business_categories: {
        Row: {
          business_id: string
          category_id: string
        }
        Insert: {
          business_id: string
          category_id: string
        }
        Update: {
          business_id?: string
          category_id?: string
        }
      }
      reviews: {
        Row: {
          id: string
          business_id: string | null
          user_id: string | null
          rating: number | null
          content: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          business_id?: string | null
          user_id?: string | null
          rating?: number | null
          content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          business_id?: string | null
          user_id?: string | null
          rating?: number | null
          content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      business_hours: {
        Row: {
          id: string
          business_id: string | null
          day_of_week: number | null
          opens_at: string | null
          closes_at: string | null
          is_closed: boolean | null
        }
        Insert: {
          id?: string
          business_id?: string | null
          day_of_week?: number | null
          opens_at?: string | null
          closes_at?: string | null
          is_closed?: boolean | null
        }
        Update: {
          id?: string
          business_id?: string | null
          day_of_week?: number | null
          opens_at?: string | null
          closes_at?: string | null
          is_closed?: boolean | null
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Business = Tables<'businesses'>
export type Category = Tables<'categories'>
export type Review = Tables<'reviews'>
export type BusinessHours = Tables<'business_hours'>