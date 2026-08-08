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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      catalyst_events: {
        Row: {
          created_at: string
          hash: string
          id: string
          payload: Json
          prev_hash: string | null
          run_id: string
          seq: number
          stage: string
        }
        Insert: {
          created_at?: string
          hash: string
          id?: string
          payload?: Json
          prev_hash?: string | null
          run_id: string
          seq?: number
          stage: string
        }
        Update: {
          created_at?: string
          hash?: string
          id?: string
          payload?: Json
          prev_hash?: string | null
          run_id?: string
          seq?: number
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalyst_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "catalyst_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      catalyst_runs: {
        Row: {
          architecture: Json | null
          created_at: string
          domain: string
          error: string | null
          experiment: Json | null
          hypothesis_graph: Json | null
          id: string
          idea: string
          implementation: Json | null
          mermaid: string | null
          mode: string
          project_id: string | null
          seed: number
          spec: Json | null
          status: string
          updated_at: string
          user_id: string
          validation: Json | null
          verification: Json | null
          visibility: string
        }
        Insert: {
          architecture?: Json | null
          created_at?: string
          domain?: string
          error?: string | null
          experiment?: Json | null
          hypothesis_graph?: Json | null
          id?: string
          idea: string
          implementation?: Json | null
          mermaid?: string | null
          mode?: string
          project_id?: string | null
          seed?: number
          spec?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          validation?: Json | null
          verification?: Json | null
          visibility?: string
        }
        Update: {
          architecture?: Json | null
          created_at?: string
          domain?: string
          error?: string | null
          experiment?: Json | null
          hypothesis_graph?: Json | null
          id?: string
          idea?: string
          implementation?: Json | null
          mermaid?: string | null
          mode?: string
          project_id?: string | null
          seed?: number
          spec?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          validation?: Json | null
          verification?: Json | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalyst_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalyst_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_documents: {
        Row: {
          content: string | null
          created_at: string
          id: string
          lab_id: string
          title: string
          updated_at: string
          yjs_state: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          lab_id: string
          title?: string
          updated_at?: string
          yjs_state?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          lab_id?: string
          title?: string
          updated_at?: string
          yjs_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_documents_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_members: {
        Row: {
          id: string
          joined_at: string
          lab_id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string
          lab_id: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string
          lab_id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_members_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          lab_id: string
          user_id: string | null
          username: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lab_id: string
          user_id?: string | null
          username?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lab_id?: string
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_messages_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_whiteboards: {
        Row: {
          canvas_data: Json | null
          created_at: string
          id: string
          lab_id: string
          title: string
          updated_at: string
        }
        Insert: {
          canvas_data?: Json | null
          created_at?: string
          id?: string
          lab_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          canvas_data?: Json | null
          created_at?: string
          id?: string
          lab_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_whiteboards_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      labs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          kind: string
          project_id: string | null
          read_at: string | null
          recipient_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          kind: string
          project_id?: string | null
          read_at?: string | null
          recipient_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          kind?: string
          project_id?: string | null
          read_at?: string | null
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          project_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          project_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_forks: {
        Row: {
          author_id: string
          created_at: string
          forked_project_id: string
          id: string
          source_project_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          forked_project_id: string
          id?: string
          source_project_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          forked_project_id?: string
          id?: string
          source_project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_forks_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_forks_forked_project_id_fkey"
            columns: ["forked_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_forks_source_project_id_fkey"
            columns: ["source_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_resonances: {
        Row: {
          created_at: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_resonances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_resonances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          abstract: string
          author_id: string
          content: string
          created_at: string
          dataset_url: string | null
          github_url: string | null
          id: string
          source_project_id: string | null
          tags: string[]
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          abstract?: string
          author_id: string
          content?: string
          created_at?: string
          dataset_url?: string | null
          github_url?: string | null
          id?: string
          source_project_id?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          abstract?: string
          author_id?: string
          content?: string
          created_at?: string
          dataset_url?: string | null
          github_url?: string | null
          id?: string
          source_project_id?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_source_project_id_fkey"
            columns: ["source_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
