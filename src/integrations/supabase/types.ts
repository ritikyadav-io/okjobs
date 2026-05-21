export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string | null
          ats_score: number | null
          company: string
          created_at: string
          followup_date: string | null
          followup_sent: boolean | null
          id: string
          interview_at: string | null
          job_id: string | null
          notes: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          ats_score?: number | null
          company: string
          created_at?: string
          followup_date?: string | null
          followup_sent?: boolean | null
          id?: string
          interview_at?: string | null
          job_id?: string | null
          notes?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          ats_score?: number | null
          company?: string
          created_at?: string
          followup_date?: string | null
          followup_sent?: boolean | null
          id?: string
          interview_at?: string | null
          job_id?: string | null
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          application_id: string | null
          created_at: string
          ends_at: string | null
          google_event_id: string | null
          id: string
          starts_at: string
          title: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          ends_at?: string | null
          google_event_id?: string | null
          id?: string
          starts_at: string
          title: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          ends_at?: string | null
          google_event_id?: string | null
          id?: string
          starts_at?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_runs: {
        Row: {
          connector: string
          duration_ms: number | null
          id: string
          kind: string
          message: string | null
          ran_at: string
          status: string
          user_id: string
        }
        Insert: {
          connector: string
          duration_ms?: number | null
          id?: string
          kind?: string
          message?: string | null
          ran_at?: string
          status: string
          user_id: string
        }
        Update: {
          connector?: string
          duration_ms?: number | null
          id?: string
          kind?: string
          message?: string | null
          ran_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      cover_letter_versions: {
        Row: {
          application_id: string | null
          content: string | null
          created_at: string
          google_doc_id: string | null
          google_doc_url: string | null
          id: string
          user_id: string
          version: number
        }
        Insert: {
          application_id?: string | null
          content?: string | null
          created_at?: string
          google_doc_id?: string | null
          google_doc_url?: string | null
          id?: string
          user_id: string
          version?: number
        }
        Update: {
          application_id?: string | null
          content?: string | null
          created_at?: string
          google_doc_id?: string | null
          google_doc_url?: string | null
          id?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cover_letter_versions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_briefings: {
        Row: {
          created_at: string
          data: Json
          date: string
          id: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          date?: string
          id?: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          date?: string
          id?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_queue: {
        Row: {
          attempts: number
          cancelled_at: string | null
          created_at: string
          finished_at: string | null
          id: string
          last_error: string | null
          max_attempts: number
          payload: Json
          priority: number
          progress: number
          result: Json | null
          scheduled_for: string
          started_at: string | null
          status: string
          task: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          cancelled_at?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number
          payload?: Json
          priority?: number
          progress?: number
          result?: Json | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          task: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          cancelled_at?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number
          payload?: Json
          priority?: number
          progress?: number
          result?: Json | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          task?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          ats_score: number | null
          company: string
          competition: string | null
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          posted_at: string | null
          recommendation: string | null
          remote: string | null
          salary: string | null
          scraped_at: string
          source: string | null
          title: string
          url: string
        }
        Insert: {
          ats_score?: number | null
          company: string
          competition?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          posted_at?: string | null
          recommendation?: string | null
          remote?: string | null
          salary?: string | null
          scraped_at?: string
          source?: string | null
          title: string
          url: string
        }
        Update: {
          ats_score?: number | null
          company?: string
          competition?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          posted_at?: string | null
          recommendation?: string | null
          remote?: string | null
          salary?: string | null
          scraped_at?: string
          source?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          linkedin: string | null
          phone: string | null
          plan: string | null
          portfolio: string | null
          preferred_role: string | null
          resume_skills: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          linkedin?: string | null
          phone?: string | null
          plan?: string | null
          portfolio?: string | null
          preferred_role?: string | null
          resume_skills?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          linkedin?: string | null
          phone?: string | null
          plan?: string | null
          portfolio?: string | null
          preferred_role?: string | null
          resume_skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      recruiter_emails: {
        Row: {
          application_id: string | null
          body: string | null
          company: string | null
          created_at: string
          gmail_message_id: string | null
          id: string
          preview: string | null
          received_at: string
          reply_status: string
          sender: string | null
          subject: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          body?: string | null
          company?: string | null
          created_at?: string
          gmail_message_id?: string | null
          id?: string
          preview?: string | null
          received_at?: string
          reply_status?: string
          sender?: string | null
          subject?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          body?: string | null
          company?: string | null
          created_at?: string
          gmail_message_id?: string | null
          id?: string
          preview?: string | null
          received_at?: string
          reply_status?: string
          sender?: string | null
          subject?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_emails_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_versions: {
        Row: {
          ats_score: number | null
          content: string | null
          created_at: string
          google_doc_id: string | null
          google_doc_url: string | null
          id: string
          job_id: string | null
          title: string
          user_id: string
          version: number
        }
        Insert: {
          ats_score?: number | null
          content?: string | null
          created_at?: string
          google_doc_id?: string | null
          google_doc_url?: string | null
          id?: string
          job_id?: string | null
          title?: string
          user_id: string
          version?: number
        }
        Update: {
          ats_score?: number | null
          content?: string | null
          created_at?: string
          google_doc_id?: string | null
          google_doc_url?: string | null
          id?: string
          job_id?: string | null
          title?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      sheet_settings: {
        Row: {
          auto_sync: boolean
          column_map: Json
          created_at: string
          id: string
          last_error: string | null
          last_row_count: number | null
          last_sync_at: string | null
          sheet_name: string
          spreadsheet_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_sync?: boolean
          column_map?: Json
          created_at?: string
          id?: string
          last_error?: string | null
          last_row_count?: number | null
          last_sync_at?: string | null
          sheet_name?: string
          spreadsheet_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_sync?: boolean
          column_map?: Json
          created_at?: string
          id?: string
          last_error?: string | null
          last_row_count?: number | null
          last_sync_at?: string | null
          sheet_name?: string
          spreadsheet_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
