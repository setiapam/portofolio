export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          title: string
          bio: string | null
          avatar_url: string | null
          email: string | null
          github_url: string | null
          linkedin_url: string | null
          resume_url: string | null
          ascii_art: string | null
          location: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title: string
          bio?: string | null
          avatar_url?: string | null
          email?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          resume_url?: string | null
          ascii_art?: string | null
          location?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title?: string
          bio?: string | null
          avatar_url?: string | null
          email?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          resume_url?: string | null
          ascii_art?: string | null
          location?: string | null
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          profile_id: string
          name: string
          category: string
          level: number
          icon: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          category: string
          level?: number
          icon?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          category?: string
          level?: number
          icon?: string | null
          sort_order?: number
        }
      }
      projects: {
        Row: {
          id: string
          profile_id: string
          slug: string
          title: string
          description: string | null
          content: string | null
          tech_stack: string[]
          github_url: string | null
          live_url: string | null
          image_url: string | null
          featured: boolean
          status: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          slug: string
          title: string
          description?: string | null
          content?: string | null
          tech_stack?: string[]
          github_url?: string | null
          live_url?: string | null
          image_url?: string | null
          featured?: boolean
          status?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          slug?: string
          title?: string
          description?: string | null
          content?: string | null
          tech_stack?: string[]
          github_url?: string | null
          live_url?: string | null
          image_url?: string | null
          featured?: boolean
          status?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          profile_id: string
          slug: string
          title: string
          excerpt: string | null
          content: string | null
          tags: string[]
          status: string
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          slug: string
          title: string
          excerpt?: string | null
          content?: string | null
          tags?: string[]
          status?: string
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          slug?: string
          title?: string
          excerpt?: string | null
          content?: string | null
          tags?: string[]
          status?: string
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      experiences: {
        Row: {
          id: string
          profile_id: string
          company: string
          role: string
          description: string | null
          start_date: string
          end_date: string | null
          tech_stack: string[]
          sort_order: number
        }
        Insert: {
          id?: string
          profile_id: string
          company: string
          role: string
          description?: string | null
          start_date: string
          end_date?: string | null
          tech_stack?: string[]
          sort_order?: number
        }
        Update: {
          id?: string
          profile_id?: string
          company?: string
          role?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          tech_stack?: string[]
          sort_order?: number
        }
      }
      site_config: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          name: string
          email: string
          subject: string | null
          message: string
          read: boolean
          replied_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject?: string | null
          message: string
          read?: boolean
          replied_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string | null
          message?: string
          read?: boolean
          replied_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
