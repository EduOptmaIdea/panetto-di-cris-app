import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          whatsapp: string;
          address: string;
          observations: string;
          delivery_preferences: string;
          total_orders: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          whatsapp: string;
          address: string;
          observations?: string;
          delivery_preferences?: string;
          total_orders?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          whatsapp?: string;
          address?: string;
          observations?: string;
          delivery_preferences?: string;
          total_orders?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          category_id: string;
          price: number;
          image_url: string;
          weight: number;
          custom_packaging: boolean;
          is_active: boolean;
          total_sold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category_id: string;
          price: number;
          image_url?: string;
          weight?: number;
          custom_packaging?: boolean;
          is_active?: boolean;
          total_sold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category_id?: string;
          price?: number;
          image_url?: string;
          weight?: number;
          custom_packaging?: boolean;
          is_active?: boolean;
          total_sold?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          subtotal: number;
          delivery_fee: number;
          total: number;
          status: string;
          payment_status: string;
          payment_method: string;
          delivery_method: string;
          sales_channel: string;
          estimated_delivery: string | null;
          completed_at: string | null;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          subtotal: number;
          delivery_fee?: number;
          total: number;
          status?: string;
          payment_status?: string;
          payment_method?: string;
          delivery_method?: string;
          sales_channel?: string;
          estimated_delivery?: string | null;
          completed_at?: string | null;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          subtotal?: number;
          delivery_fee?: number;
          total?: number;
          status?: string;
          payment_status?: string;
          payment_method?: string;
          delivery_method?: string;
          sales_channel?: string;
          estimated_delivery?: string | null;
          completed_at?: string | null;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          created_at?: string;
        };
      };
    };
  };
}