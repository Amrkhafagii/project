export interface HydrationLog {
  id: string;
  user_id: string;
  amount_ml: number;
  log_date: string;
  log_time: string;
  created_at: string;
}

export interface FitnessProfile {
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
}

export interface MealPlan {
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
}

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

export interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  hydration: number;
}
