/**
 * GENERATED FILE — do not edit by hand.
 *   Source:      supabase/migrations/*.sql
 *   Regenerate:  npm run types:generate
 *
 * Describes the database as the signed-in (`authenticated`) API role sees it.
 * Columns that role cannot read (for example the quiz answer key) and tables
 * it cannot reach are deliberately absent, so misuse fails at compile time.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          badge_key: string
          points_threshold: number
          is_active: boolean
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      child_achievements: {
        Row: {
          id: string
          child_profile_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      child_profiles: {
        Row: {
          id: string
          parent_id: string
          display_name: string
          avatar_key: string
          age_band: Database["public"]["Enums"]["age_band"]
          show_on_leaderboard: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Record<string, never>
        Update: {
          display_name?: string
          avatar_key?: string
          age_band?: Database["public"]["Enums"]["age_band"]
          is_active?: boolean
        }
        Relationships: []
      }
      daily_challenge_completions: {
        Row: {
          id: string
          child_profile_id: string
          challenge_date: string
          question_id: string | null
          selected_option_id: string | null
          is_correct: boolean
          completed_at: string
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      learning_streaks: {
        Row: {
          child_profile_id: string
          current_streak: number
          longest_streak: number
          last_learning_date: string | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      learning_worlds: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          image_key: string
          age_band: Database["public"]["Enums"]["age_band"]
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string
          image_key: string
          age_band?: Database["public"]["Enums"]["age_band"]
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          image_key?: string
          age_band?: Database["public"]["Enums"]["age_band"]
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          id: string
          child_profile_id: string
          lesson_id: string
          video_completed: boolean
          lesson_completed: boolean
          started_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          learning_world_id: string
          title: string
          slug: string
          description: string
          age_band: Database["public"]["Enums"]["age_band"]
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          estimated_minutes: number
          display_order: number
          learning_objectives: string[]
          video_asset_key: string | null
          captions_asset_key: string | null
          transcript: string
          key_terms: Json
          key_takeaways: string[]
          advantages: string[]
          limitations: string[]
          safety_notes: string[]
          is_sample: boolean
          status: Database["public"]["Enums"]["lesson_status"]
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      parental_consents: {
        Row: {
          id: string
          parent_id: string
          child_profile_id: string
          consent_type: Database["public"]["Enums"]["consent_type"]
          policy_version: string
          consent_status: Database["public"]["Enums"]["consent_status"]
          recorded_at: string
          revoked_at: string | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      points_ledger: {
        Row: {
          id: string
          child_profile_id: string
          event_type: Database["public"]["Enums"]["points_event_type"]
          reference_id: string
          points: number
          created_at: string
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: Record<string, never>
        Update: {
          display_name?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          id: string
          child_profile_id: string
          quiz_id: string
          content_version_id: string | null
          score: number
          total_questions: number
          correct_answers: number
          started_at: string
          completed_at: string | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      quiz_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          display_order: number
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          display_order: number
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      quiz_responses: {
        Row: {
          id: string
          attempt_id: string
          question_id: string | null
          selected_option_id: string | null
          is_correct: boolean
          question_text: string
          selected_option_text: string
          correct_option_text: string
          answered_at: string
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string
          title: string
          instructions: string
          passing_score: number
          is_published: boolean
          created_at: string
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_content_overview: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_get_lesson: {
        Args: {
          p_lesson_id: string
        }
        Returns: Json
      }
      admin_set_lesson_status: {
        Args: {
          p_lesson_id: string
          p_status: Database["public"]["Enums"]["lesson_status"]
        }
        Returns: undefined
      }
      admin_upsert_lesson: {
        Args: {
          p_payload: Json
          p_lesson_id?: string
        }
        Returns: string
      }
      answer_quiz_question: {
        Args: {
          p_attempt_id: string
          p_question_id: string
          p_option_id: string
        }
        Returns: Json
      }
      complete_lesson: {
        Args: {
          p_child_id: string
          p_lesson_id: string
        }
        Returns: Json
      }
      complete_quiz_attempt: {
        Args: {
          p_attempt_id: string
        }
        Returns: Json
      }
      create_child_profile: {
        Args: {
          p_display_name: string
          p_avatar_key: string
          p_age_band: Database["public"]["Enums"]["age_band"]
          p_show_on_leaderboard: boolean
          p_policy_version: string
        }
        Returns: string
      }
      get_child_summary: {
        Args: {
          p_child_id: string
        }
        Returns: Json
      }
      get_daily_challenge: {
        Args: {
          p_child_id: string
        }
        Returns: Json
      }
      get_weekly_leaderboard: {
        Args: {
          p_child_id: string
          p_limit?: number
        }
        Returns: Json
      }
      record_lesson_progress: {
        Args: {
          p_child_id: string
          p_lesson_id: string
          p_video_completed?: boolean
        }
        Returns: undefined
      }
      set_leaderboard_visibility: {
        Args: {
          p_child_id: string
          p_visible: boolean
          p_policy_version: string
        }
        Returns: undefined
      }
      start_quiz_attempt: {
        Args: {
          p_child_id: string
          p_quiz_id: string
        }
        Returns: Json
      }
      submit_daily_challenge: {
        Args: {
          p_child_id: string
          p_option_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      age_band: "5-7" | "8-12" | "13-15"
      consent_status: "granted" | "revoked"
      consent_type: "terms_and_privacy" | "child_profile_data" | "leaderboard_display"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      lesson_status: "draft" | "published" | "archived"
      points_event_type: "lesson_completed" | "quiz_completed" | "quiz_correct_answer" | "daily_challenge"
      question_type: "multiple_choice"
      user_role: "parent" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]
