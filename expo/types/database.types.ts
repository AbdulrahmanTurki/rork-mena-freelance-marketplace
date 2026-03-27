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
          email: string
          full_name: string | null
          full_name_arabic: string | null
          national_id: string | null
          iqama_number: string | null
          date_of_birth: string | null
          nationality: string | null
          gender: string | null
          mobile_number: string | null
          mobile_verified: boolean
          email_verified: boolean
          city: string | null
          avatar_url: string | null
          user_type: 'buyer' | 'seller'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          full_name_arabic?: string | null
          national_id?: string | null
          iqama_number?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          gender?: string | null
          mobile_number?: string | null
          mobile_verified?: boolean
          email_verified?: boolean
          city?: string | null
          avatar_url?: string | null
          user_type?: 'buyer' | 'seller'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          full_name_arabic?: string | null
          national_id?: string | null
          iqama_number?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          gender?: string | null
          mobile_number?: string | null
          mobile_verified?: boolean
          email_verified?: boolean
          city?: string | null
          avatar_url?: string | null
          user_type?: 'buyer' | 'seller'
          created_at?: string
          updated_at?: string
        }
      }
      seller_verifications: {
        Row: {
          id: string
          user_id: string
          id_front_url: string | null
          id_back_url: string | null
          permit_number: string | null
          permit_expiration_date: string | null
          permit_document_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          id_front_url?: string | null
          id_back_url?: string | null
          permit_number?: string | null
          permit_expiration_date?: string | null
          permit_document_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          id_front_url?: string | null
          id_back_url?: string | null
          permit_number?: string | null
          permit_expiration_date?: string | null
          permit_document_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          name_ar: string | null
          slug: string
          icon: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_ar?: string | null
          slug: string
          icon?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_ar?: string | null
          slug?: string
          icon?: string | null
          description?: string | null
          created_at?: string
        }
      }
      gigs: {
        Row: {
          id: string
          seller_id: string
          category_id: string | null
          title: string
          description: string
          price: number
          delivery_time: number
          images: string[] | null
          tags: string[] | null
          revisions_included: number
          rating: number
          reviews_count: number
          orders_count: number
          is_active: boolean
          packages: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          category_id?: string | null
          title: string
          description: string
          price: number
          delivery_time: number
          images?: string[] | null
          tags?: string[] | null
          revisions_included?: number
          rating?: number
          reviews_count?: number
          orders_count?: number
          is_active?: boolean
          packages?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: string | null
          title?: string
          description?: string
          price?: number
          delivery_time?: number
          images?: string[] | null
          tags?: string[] | null
          revisions_included?: number
          rating?: number
          reviews_count?: number
          orders_count?: number
          is_active?: boolean
          packages?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          buyer_id: string | null
          seller_id: string | null
          gig_id: string | null
          gig_title: string
          gig_price: number
          status: 'pending_payment' | 'in_progress' | 'delivered' | 'revision_requested' | 'completed' | 'cancelled' | 'disputed' | 'refunded'
          delivery_files: string[] | null
          delivered_at: string | null
          revisions_allowed: number
          revisions_used: number
          escrow_amount: number
          platform_fee: number
          seller_net_amount: number
          auto_release_at: string | null
          is_frozen: boolean
          frozen_until: string | null
          frozen_reason: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          buyer_id?: string | null
          seller_id?: string | null
          gig_id?: string | null
          gig_title: string
          gig_price: number
          status?: 'pending_payment' | 'in_progress' | 'delivered' | 'revision_requested' | 'completed' | 'cancelled' | 'disputed' | 'refunded'
          delivery_files?: string[] | null
          delivered_at?: string | null
          revisions_allowed?: number
          revisions_used?: number
          escrow_amount: number
          platform_fee: number
          seller_net_amount: number
          auto_release_at?: string | null
          is_frozen?: boolean
          frozen_until?: string | null
          frozen_reason?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          buyer_id?: string | null
          seller_id?: string | null
          gig_id?: string | null
          gig_title?: string
          gig_price?: number
          status?: 'pending_payment' | 'in_progress' | 'delivered' | 'revision_requested' | 'completed' | 'cancelled' | 'disputed' | 'refunded'
          delivery_files?: string[] | null
          delivered_at?: string | null
          revisions_allowed?: number
          revisions_used?: number
          escrow_amount?: number
          platform_fee?: number
          seller_net_amount?: number
          auto_release_at?: string | null
          is_frozen?: boolean
          frozen_until?: string | null
          frozen_reason?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      order_revisions: {
        Row: {
          id: string
          order_id: string
          requested_by: string | null
          revision_number: number
          request_message: string
          response_message: string | null
          response_files: string[] | null
          responded_at: string | null
          status: 'pending' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          requested_by?: string | null
          revision_number: number
          request_message: string
          response_message?: string | null
          response_files?: string[] | null
          responded_at?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          requested_by?: string | null
          revision_number?: number
          request_message?: string
          response_message?: string | null
          response_files?: string[] | null
          responded_at?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          order_id: string | null
          sender_id: string | null
          receiver_id: string | null
          message: string
          attachments: string[] | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          sender_id?: string | null
          receiver_id?: string | null
          message: string
          attachments?: string[] | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          sender_id?: string | null
          receiver_id?: string | null
          message?: string
          attachments?: string[] | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      seller_wallets: {
        Row: {
          id: string
          seller_id: string
          available_balance: number
          pending_balance: number
          total_earned: number
          last_withdrawal: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          available_balance?: number
          pending_balance?: number
          total_earned?: number
          last_withdrawal?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          available_balance?: number
          pending_balance?: number
          total_earned?: number
          last_withdrawal?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      withdrawal_requests: {
        Row: {
          id: string
          seller_id: string
          wallet_id: string
          amount: number
          payout_method: string
          payout_details: Json | null
          status: 'pending' | 'approved' | 'declined' | 'completed'
          processed_at: string | null
          processed_by: string | null
          decline_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          wallet_id: string
          amount: number
          payout_method: string
          payout_details?: Json | null
          status?: 'pending' | 'approved' | 'declined' | 'completed'
          processed_at?: string | null
          processed_by?: string | null
          decline_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          wallet_id?: string
          amount?: number
          payout_method?: string
          payout_details?: Json | null
          status?: 'pending' | 'approved' | 'declined' | 'completed'
          processed_at?: string | null
          processed_by?: string | null
          decline_reason?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          order_id: string | null
          transaction_type: 'order_payment' | 'release_to_seller' | 'partial_refund' | 'refund_to_buyer' | 'split_payment' | 'withdrawal' | 'platform_fee'
          amount: number
          from_user_id: string | null
          to_user_id: string | null
          admin_id: string | null
          reason: string | null
          details: Json | null
          status: 'pending' | 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          transaction_type: 'order_payment' | 'release_to_seller' | 'partial_refund' | 'refund_to_buyer' | 'split_payment' | 'withdrawal' | 'platform_fee'
          amount: number
          from_user_id?: string | null
          to_user_id?: string | null
          admin_id?: string | null
          reason?: string | null
          details?: Json | null
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          transaction_type?: 'order_payment' | 'release_to_seller' | 'partial_refund' | 'refund_to_buyer' | 'split_payment' | 'withdrawal' | 'platform_fee'
          amount?: number
          from_user_id?: string | null
          to_user_id?: string | null
          admin_id?: string | null
          reason?: string | null
          details?: Json | null
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
        }
      }
      financial_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          order_id: string | null
          user_id: string | null
          amount: number | null
          reason: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          order_id?: string | null
          user_id?: string | null
          amount?: number | null
          reason: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          order_id?: string | null
          user_id?: string | null
          amount?: number | null
          reason?: string
          details?: Json | null
          created_at?: string
        }
      }
      escrow_settings: {
        Row: {
          id: string
          clearance_period_days: number
          auto_release_days: number
          platform_fee_percentage: number
          min_withdrawal_amount: number
          refund_window_days: number
          dispute_resolution_days: number
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          clearance_period_days?: number
          auto_release_days?: number
          platform_fee_percentage?: number
          min_withdrawal_amount?: number
          refund_window_days?: number
          dispute_resolution_days?: number
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          clearance_period_days?: number
          auto_release_days?: number
          platform_fee_percentage?: number
          min_withdrawal_amount?: number
          refund_window_days?: number
          dispute_resolution_days?: number
          updated_by?: string | null
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          gig_id: string
          reviewer_id: string | null
          seller_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          gig_id: string
          reviewer_id?: string | null
          seller_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          gig_id?: string
          reviewer_id?: string | null
          seller_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      disputes: {
        Row: {
          id: string
          order_id: string
          opened_by: string | null
          reason: string
          description: string
          evidence_files: string[] | null
          status: 'open' | 'under_review' | 'resolved' | 'closed'
          resolution: string | null
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          opened_by?: string | null
          reason: string
          description: string
          evidence_files?: string[] | null
          status?: 'open' | 'under_review' | 'resolved' | 'closed'
          resolution?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          opened_by?: string | null
          reason?: string
          description?: string
          evidence_files?: string[] | null
          status?: 'open' | 'under_review' | 'resolved' | 'closed'
          resolution?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_roles: {
        Row: {
          id: string
          user_id: string
          role: 'super_admin' | 'admin' | 'moderator' | 'support'
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'super_admin' | 'admin' | 'moderator' | 'support'
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'super_admin' | 'admin' | 'moderator' | 'support'
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          push_notifications: boolean
          email_notifications: boolean
          order_updates: boolean
          promotions: boolean
          show_online_status: boolean
          show_last_seen: boolean
          profile_visibility: boolean
          show_email: boolean
          show_phone: boolean
          allow_messages: boolean
          show_activity: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          push_notifications?: boolean
          email_notifications?: boolean
          order_updates?: boolean
          promotions?: boolean
          show_online_status?: boolean
          show_last_seen?: boolean
          profile_visibility?: boolean
          show_email?: boolean
          show_phone?: boolean
          allow_messages?: boolean
          show_activity?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          push_notifications?: boolean
          email_notifications?: boolean
          order_updates?: boolean
          promotions?: boolean
          show_online_status?: boolean
          show_last_seen?: boolean
          profile_visibility?: boolean
          show_email?: boolean
          show_phone?: boolean
          allow_messages?: boolean
          show_activity?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          type: 'card' | 'bank'
          last4: string
          brand: string
          expiry_month: number
          expiry_year: number
          is_default: boolean
          stripe_payment_method_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'card' | 'bank'
          last4: string
          brand: string
          expiry_month: number
          expiry_year: number
          is_default?: boolean
          stripe_payment_method_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'card' | 'bank'
          last4?: string
          brand?: string
          expiry_month?: number
          expiry_year?: number
          is_default?: boolean
          stripe_payment_method_id?: string | null
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
