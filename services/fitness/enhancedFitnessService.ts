import { supabase } from '../supabase';
import { calculateBMR, calculateTDEE, calculateCalorieGoal, calculateMacros } from './fitnessService';

export interface WorkoutSession {
  id?: string;
  user_id: string;
  date: string;
  workout_type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'mixed';
  duration_minutes: number;
  calories_burned: number;
  exercises?: any[];
  notes?: string;
}

export interface HydrationLog {
  id?: string;
  user_id: string;
  date: string;
  amount_ml: number;
  time: string;
}

export interface NutritionLog {
  id?: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  food_items?: any[];
}

export interface EnergyBalance {
  intake: number;
  burned: number;
  tdee: number;
  balance: number;
  date: string;
}

// Calculate energy balance for a specific date
export async function calculateEnergyBalance(userId: string, date: string): Promise<EnergyBalance> {
  try {
    // Get user's fitness profile for TDEE
    const { data: profile } = await supabase
      .from('fitness_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const tdee = profile?.tdee || calculateTDEE(profile) || 2000;

    // Get nutrition intake for the day
    const { data: nutritionLogs } = await supabase
      .from('nutrition_logs')
      .select('calories')
      .eq('user_id', userId)
      .eq('date', date);

    const totalIntake = nutritionLogs?.reduce((sum, log) => sum + log.calories, 0) || 0;

    // Get workout calories burned
    const { data: workouts } = await supabase
      .from('workout_sessions')
      .select('calories_burned')
      .eq('user_id', userId)
      .eq('date', date);

    const workoutBurn = workouts?.reduce((sum, workout) => sum + workout.calories_burned, 0) || 0;

    const totalBurned = tdee + workoutBurn;
    const balance = totalIntake - totalBurned;

    return {
      intake: totalIntake,
      burned: totalBurned,
      tdee,
      balance,
      date
    };
  } catch (error) {
    console.error('Error calculating energy balance:', error);
    return { intake: 0, burned: 0, tdee: 2000, balance: 0, date };
  }
}

// Get hydration goal based on workout intensity
export async function getHydrationGoal(userId: string, date: string): Promise<number> {
  const baseGoal = 2000; // ml
  
  try {
    const { data: workouts } = await supabase
      .from('workout_sessions')
      .select('duration_minutes, workout_type')
      .eq('user_id', userId)
      .eq('date', date);

    if (!workouts || workouts.length === 0) return baseGoal;

    // Add extra hydration based on workout intensity
    const extraHydration = workouts.reduce((total, workout) => {
      const multiplier = workout.workout_type === 'cardio' ? 15 : 10; // ml per minute
      return total + (workout.duration_minutes * multiplier);
    }, 0);

    return baseGoal + extraHydration;
  } catch (error) {
    console.error('Error calculating hydration goal:', error);
    return baseGoal;
  }
}

// Get daily hydration intake
export async function getDailyHydration(userId: string, date: string): Promise<number> {
  try {
    const { data: logs } = await supabase
      .from('hydration_logs')
      .select('amount_ml')
      .eq('user_id', userId)
      .eq('date', date);

    return logs?.reduce((sum, log) => sum + log.amount_ml, 0) || 0;
  } catch (error) {
    console.error('Error getting daily hydration:', error);
    return 0;
  }
}

// Log water intake
export async function logHydration(log: HydrationLog) {
  try {
    const { data, error } = await supabase
      .from('hydration_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging hydration:', error);
    throw error;
  }
}

// Log workout session
export async function logWorkout(workout: WorkoutSession) {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert(workout)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging workout:', error);
    throw error;
  }
}

// Log nutrition
export async function logNutrition(nutrition: NutritionLog) {
  try {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert(nutrition)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging nutrition:', error);
    throw error;
  }
}

// Get workout-nutrition correlation data
export async function getCorrelationData(userId: string, days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // Get workouts
    const { data: workouts } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    // Get nutrition logs
    const { data: nutrition } = await supabase
      .from('nutrition_logs')
      .select('date, calories, protein_g, carbs_g, fat_g')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    // Aggregate nutrition by date
    const nutritionByDate = nutrition?.reduce((acc, log) => {
      if (!acc[log.date]) {
        acc[log.date] = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
      }
      acc[log.date].calories += log.calories;
      acc[log.date].protein_g += log.protein_g;
      acc[log.date].carbs_g += log.carbs_g;
      acc[log.date].fat_g += log.fat_g;
      return acc;
    }, {} as Record<string, any>) || {};

    return { workouts, nutritionByDate };
  } catch (error) {
    console.error('Error getting correlation data:', error);
    return { workouts: [], nutritionByDate: {} };
  }
}

// Generate adaptive recommendations
export async function generateRecommendations(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('fitness_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profile) return null;

    // Get recent performance data
    const { workouts, nutritionByDate } = await getCorrelationData(userId, 14);

    // Calculate trends
    const workoutFrequency = workouts?.length || 0;
    const avgCaloriesBurned = workouts?.reduce((sum, w) => sum + w.calories_burned, 0) / (workouts?.length || 1) || 0;

    // Generate recommendations based on goals and performance
    const recommendations = {
      workout: {
        intensity: profile.fitness_goal === 'build_muscle' ? 'high' : 'moderate',
        frequency: workoutFrequency < 3 ? 'increase' : 'maintain',
        focus: determineWorkoutFocus(profile, workouts)
      },
      nutrition: {
        calorieAdjustment: calculateCalorieAdjustment(profile, nutritionByDate),
        proteinTarget: profile.fitness_goal === 'build_muscle' ? profile.weight_kg * 2.2 : profile.weight_kg * 1.6,
        mealTiming: suggestMealTiming(workouts)
      },
      hydration: {
        dailyGoal: calculateDailyWaterGoal(profile, avgCaloriesBurned)
      }
    };

    // Update performance metrics in profile
    await supabase
      .from('fitness_profiles')
      .update({
        performance_metrics: {
          lastUpdated: new Date().toISOString(),
          workoutFrequency,
          avgCaloriesBurned,
          recommendations
        }
      })
      .eq('user_id', userId);

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return null;
  }
}

// Helper functions
function determineWorkoutFocus(profile: any, workouts: any[]) {
  const recentWorkouts = workouts?.slice(-5) || [];
  const workoutTypes = recentWorkouts.map(w => w.workout_type);
  
  if (profile.fitness_goal === 'build_muscle' && !workoutTypes.includes('strength')) {
    return 'strength';
  } else if (profile.fitness_goal === 'lose_weight' && !workoutTypes.includes('cardio')) {
    return 'cardio';
  }
  
  return 'balanced';
}

function calculateCalorieAdjustment(profile: any, nutritionByDate: Record<string, any>) {
  const dates = Object.keys(nutritionByDate);
  if (dates.length === 0) return 0;

  const avgCalories = dates.reduce((sum, date) => sum + nutritionByDate[date].calories, 0) / dates.length;
  const targetCalories = profile.daily_calorie_goal || 2000;

  return targetCalories - avgCalories;
}

function suggestMealTiming(workouts: any[]) {
  const morningWorkouts = workouts?.filter(w => {
    const hour = new Date(w.created_at).getHours();
    return hour < 12;
  }).length || 0;

  if (morningWorkouts > workouts?.length / 2) {
    return 'pre-workout-carbs';
  }
  return 'post-workout-protein';
}

function calculateDailyWaterGoal(profile: any, avgCaloriesBurned: number) {
  const baseGoal = 2000; // ml
  const weightFactor = (profile.weight_kg || 70) * 30; // 30ml per kg
  const activityFactor = avgCaloriesBurned * 0.5; // 0.5ml per calorie burned
  
  return Math.round(Math.max(baseGoal, weightFactor + activityFactor));
}
