
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "admin_users": {
                  Row: {
                    "created_at": string,"role": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"role"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"guests": {
                  Row: {
                    "created_at": string,"display_name": string,"display_name_my": string | null,"group_name": string | null,"id": string,"opened_at": string | null,"phone": string | null,"table_name": string | null,"token": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name": string,"display_name_my"?: string | null,"group_name"?: string | null,"id"?: string,"opened_at"?: string | null,"phone"?: string | null,"table_name"?: string | null,"token": string,"wedding_id": string
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string,"display_name_my"?: string | null,"group_name"?: string | null,"id"?: string,"opened_at"?: string | null,"phone"?: string | null,"table_name"?: string | null,"token"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "guests_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"rsvps": {
                  Row: {
                    "attending": boolean,"created_at": string,"guest_id": string | null,"id": string,"name": string,"note": string | null,"party_size": number,"updated_at": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attending": boolean,"created_at"?: string,"guest_id"?: string | null,"id"?: string,"name": string,"note"?: string | null,"party_size"?: number,"updated_at"?: string,"wedding_id": string
                  }
                  Update: {
                    "attending"?: boolean,"created_at"?: string,"guest_id"?: string | null,"id"?: string,"name"?: string,"note"?: string | null,"party_size"?: number,"updated_at"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rsvps_guest_id_fkey"
      columns: ["guest_id"]
isOneToOne: false
      referencedRelation: "guests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "rsvps_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"wedding_events": {
                  Row: {
                    "created_at": string,"ends_at": string | null,"id": string,"kind": string,"map_url": string | null,"myanmar_date_text": NonNullable<Json>,"sort_order": number,"starts_at": string,"title": NonNullable<Json>,"venue_address": NonNullable<Json>,"venue_name": NonNullable<Json>,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"ends_at"?: string | null,"id"?: string,"kind"?: string,"map_url"?: string | null,"myanmar_date_text"?: NonNullable<Json>,"sort_order"?: number,"starts_at": string,"title"?: NonNullable<Json>,"venue_address"?: NonNullable<Json>,"venue_name"?: NonNullable<Json>,"wedding_id": string
                  }
                  Update: {
                    "created_at"?: string,"ends_at"?: string | null,"id"?: string,"kind"?: string,"map_url"?: string | null,"myanmar_date_text"?: NonNullable<Json>,"sort_order"?: number,"starts_at"?: string,"title"?: NonNullable<Json>,"venue_address"?: NonNullable<Json>,"venue_name"?: NonNullable<Json>,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_events_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"wedding_photos": {
                  Row: {
                    "alt": NonNullable<Json>,"created_at": string,"height": number,"id": string,"is_cover": boolean,"kind": string,"sort_order": number,"storage_path": string,"wedding_id": string,"width": number
                  }
                  ComputedFields: never
                  Insert: {
                    "alt"?: NonNullable<Json>,"created_at"?: string,"height": number,"id"?: string,"is_cover"?: boolean,"kind"?: string,"sort_order"?: number,"storage_path": string,"wedding_id": string,"width": number
                  }
                  Update: {
                    "alt"?: NonNullable<Json>,"created_at"?: string,"height"?: number,"id"?: string,"is_cover"?: boolean,"kind"?: string,"sort_order"?: number,"storage_path"?: string,"wedding_id"?: string,"width"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_photos_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"weddings": {
                  Row: {
                    "closing_quote": NonNullable<Json>,"cover_text": NonNullable<Json>,"created_at": string,"dress_code": NonNullable<Json>,"family": NonNullable<Json>,"faq": NonNullable<Json>,"gift_methods": NonNullable<Json>,"good_to_know": NonNullable<Json>,"id": string,"invitation_text": NonNullable<Json>,"monogram": string | null,"music_path": string | null,"music_title": string | null,"note": NonNullable<Json>,"partner_one_name": NonNullable<Json>,"partner_two_name": NonNullable<Json>,"public_wishes": boolean,"rsvp_enabled": boolean,"seating_enabled": boolean,"slug": string,"status": string,"story": NonNullable<Json>,"tagline": NonNullable<Json>,"template_key": string,"theme": NonNullable<Json>,"timezone": string,"updated_at": string,"wishes_editable": boolean,"wishes_enabled": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "closing_quote"?: NonNullable<Json>,"cover_text"?: NonNullable<Json>,"created_at"?: string,"dress_code"?: NonNullable<Json>,"family"?: NonNullable<Json>,"faq"?: NonNullable<Json>,"gift_methods"?: NonNullable<Json>,"good_to_know"?: NonNullable<Json>,"id"?: string,"invitation_text"?: NonNullable<Json>,"monogram"?: string | null,"music_path"?: string | null,"music_title"?: string | null,"note"?: NonNullable<Json>,"partner_one_name": NonNullable<Json>,"partner_two_name": NonNullable<Json>,"public_wishes"?: boolean,"rsvp_enabled"?: boolean,"seating_enabled"?: boolean,"slug": string,"status"?: string,"story"?: NonNullable<Json>,"tagline"?: NonNullable<Json>,"template_key"?: string,"theme"?: NonNullable<Json>,"timezone"?: string,"updated_at"?: string,"wishes_editable"?: boolean,"wishes_enabled"?: boolean
                  }
                  Update: {
                    "closing_quote"?: NonNullable<Json>,"cover_text"?: NonNullable<Json>,"created_at"?: string,"dress_code"?: NonNullable<Json>,"family"?: NonNullable<Json>,"faq"?: NonNullable<Json>,"gift_methods"?: NonNullable<Json>,"good_to_know"?: NonNullable<Json>,"id"?: string,"invitation_text"?: NonNullable<Json>,"monogram"?: string | null,"music_path"?: string | null,"music_title"?: string | null,"note"?: NonNullable<Json>,"partner_one_name"?: NonNullable<Json>,"partner_two_name"?: NonNullable<Json>,"public_wishes"?: boolean,"rsvp_enabled"?: boolean,"seating_enabled"?: boolean,"slug"?: string,"status"?: string,"story"?: NonNullable<Json>,"tagline"?: NonNullable<Json>,"template_key"?: string,"theme"?: NonNullable<Json>,"timezone"?: string,"updated_at"?: string,"wishes_editable"?: boolean,"wishes_enabled"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"wishes": {
                  Row: {
                    "author_name": string,"created_at": string,"guest_id": string | null,"id": string,"is_hidden": boolean,"message": string,"updated_at": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_name": string,"created_at"?: string,"guest_id"?: string | null,"id"?: string,"is_hidden"?: boolean,"message": string,"updated_at"?: string,"wedding_id": string
                  }
                  Update: {
                    "author_name"?: string,"created_at"?: string,"guest_id"?: string | null,"id"?: string,"is_hidden"?: boolean,"message"?: string,"updated_at"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wishes_guest_id_fkey"
      columns: ["guest_id"]
isOneToOne: false
      referencedRelation: "guests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wishes_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "find_seat":
{ Args: { "p_query": string,"p_slug": string }; Returns: Json
                           },
"get_invitation":
{ Args: { "p_slug": string,"p_token"?: string }; Returns: Json
                           },
"get_public_wishes":
{ Args: { "p_slug": string }; Returns: {
              "author_name": string,"created_at": string,"message": string
            }[]
                           },
"get_wishes":
{ Args: { "p_slug": string,"p_token": string }; Returns: {
              "author_name": string,"created_at": string,"is_mine": boolean,"message": string
            }[]
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"mark_invitation_opened":
{ Args: { "p_slug": string,"p_token": string }; Returns: undefined
                           },
"submit_public_wish":
{ Args: { "p_author_name": string,"p_message": string,"p_slug": string }; Returns: Json
                           },
"submit_rsvp":
{ Args: { "p_attending": boolean,"p_name": string,"p_note": string,"p_party_size": number,"p_slug": string,"p_token": string }; Returns: Json
                           },
"submit_wish":
{ Args: { "p_author_name": string,"p_message": string,"p_slug": string,"p_token": string }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
