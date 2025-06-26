export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: 'customer' | 'restaurant' | 'driver';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          phone?: string | null;
          role?: 'customer' | 'restaurant' | 'driver';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          role?: 'customer' | 'restaurant' | 'driver';
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          address: string;
          latitude: number;
          longitude: number;
          phone: string;
          operating_hours: any;
          is_active: boolean;
          image_url: string | null;
          average_rating: number;
          total_reviews: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          address: string;
          latitude: number;
          longitude: number;
          phone: string;
          operating_hours?: any;
          is_active?: boolean;
          image_url?: string | null;
          average_rating?: number;
          total_reviews?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          address?: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          operating_hours?: any;
          is_active?: boolean;
          image_url?: string | null;
          average_rating?: number;
          total_reviews?: number;
          updated_at?: string;
        };
      };
      menu_categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          display_order?: number;
          is_active?: boolean;
        };
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description: string;
          price: number;
          prep_time_minutes: number;
          calories: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          ingredients: string[] | null;
          allergens: string[] | null;
          image_url: string | null;
          is_available: boolean;
          average_rating: number;
          total_reviews: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description: string;
          price: number;
          prep_time_minutes?: number;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          ingredients?: string[] | null;
          allergens?: string[] | null;
          image_url?: string | null;
          is_available?: boolean;
          average_rating?: number;
          total_reviews?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          restaurant_id: string | null;
          status: 'pending' | 'restaurant_assigned' | 'accepted' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled' | 'no_restaurant_accepted';
          subtotal: number;
          delivery_fee: number;
          tax_amount: number;
          total_amount: number;
          delivery_address: any;
          delivery_instructions: string | null;
          payment_method: string;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          estimated_delivery_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          restaurant_id?: string | null;
          status?: 'pending' | 'restaurant_assigned' | 'accepted' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled' | 'no_restaurant_accepted';
          subtotal: number;
          delivery_fee?: number;
          tax_amount?: number;
          total_amount: number;
          delivery_address: any;
          delivery_instructions?: string | null;
          payment_method: string;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          estimated_delivery_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          special_instructions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          special_instructions?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          customer_id: string;
          menu_item_id: string;
          order_id: string;
          rating: number;
          comment: string | null;
          images: string[] | null;
          is_verified_purchase: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          menu_item_id: string;
          order_id: string;
          rating: number;
          comment?: string | null;
          images?: string[] | null;
          is_verified_purchase?: boolean;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          customer_id: string;
          plan_type: 'basic' | 'pro' | 'ultimate';
          status: 'active' | 'cancelled' | 'suspended';
          meals_per_week: number;
          price_per_month: number;
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          plan_type: 'basic' | 'pro' | 'ultimate';
          status?: 'active' | 'cancelled' | 'suspended';
          meals_per_week: number;
          price_per_month: number;
          current_period_start: string;
          current_period_end: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      fitness_profiles: {
        Row: {
          id: string;
          user_id: string;
          age: number | null;
          gender: 'male' | 'female' | 'other' | null;
          height_cm: number | null;
          weight_kg: number | null;
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | null;
          fitness_goal: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle' | null;
          target_weight_kg: number | null;
          tdee: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          age?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | null;
          fitness_goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle' | null;
          target_weight_kg?: number | null;
          tdee?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      meal_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          target_calories: number;
          target_protein_g: number | null;
          target_carbs_g: number | null;
          target_fat_g: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          target_calories: number;
          target_protein_g?: number | null;
          target_carbs_g?: number | null;
          target_fat_g?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      hydration_logs: {
        Row: {
          id: string;
          user_id: string;
          amount_ml: number;
          log_date: string;
          log_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_ml: number;
          log_date: string;
          log_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount_ml?: number;
          log_date?: string;
          log_time?: string;
        };
      };
    };
  };
}
