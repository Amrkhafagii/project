import { supabase } from '../supabase';

export interface WeeklyGoalOverride {
  monday?: DailyGoals;
  tuesday?: DailyGoals;
  wednesday?: DailyGoals;
  thursday?: DailyGoals;
  friday?: DailyGoals;
  saturday?: DailyGoals;
  sunday?: DailyGoals;
}

export interface DailyGoals {
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  water_ml?: number;
  steps?: number;
}

export interface GoalSchedule {
  workout_days?: string[];
  rest_days?: string[];
  high_protein_days?: string[];
  refeed_days?: string[];
}

// Get goals for a specific day
export async function getGoalsForDay(userId: string, date: Date): Promise<DailyGoals> {
  try {
    const { data: profile } = await supabase
      .from('fitness_profiles')
      .select('daily_calorie_goal, daily_water_goal_ml, weekly_goal_override, goal_schedule')
      .eq('user_id', userId)
      .single();

    if (!profile) return getDefaultGoals();

    const dayOfWeek = date.toLocaleLowerCase('en-US', { weekday: 'long' }).toLowerCase();
    const weeklyOverride = profile.weekly_goal_override as WeeklyGoalOverride;
    const goalSchedule = profile.goal_schedule as GoalSchedule;

    // Check if there's a specific override for this day
    if (weeklyOverride && weeklyOverride[dayOfWeek as keyof WeeklyGoalOverride]) {
      return weeklyOverride[dayOfWeek as keyof WeeklyGoalOverride]!;
    }

    // Apply goal schedule rules
    let goals: DailyGoals = {
      calories: profile.daily_calorie_goal || 2000,
      water_ml: profile.daily_water_goal_ml || 2000
    };

    if (goalSchedule) {
      // Adjust for workout days
      if (goalSchedule.workout_days?.includes(dayOfWeek)) {
        goals.calories = Math.round(goals.calories! * 1.1); // 10% increase
        goals.water_ml = goals.water_ml! + 500; // Extra hydration
      }

      // Adjust for high protein days
      if (goalSchedule.high_protein_days?.includes(dayOfWeek)) {
        const proteinRatio = 0.35; // 35% of calories from protein
        goals.protein_g = Math.round((goals.calories! * proteinRatio) / 4);
      }

      // Adjust for refeed days
      if (goalSchedule.refeed_days?.includes(dayOfWeek)) {
        goals.calories = Math.round(goals.calories! * 1.2); // 20% increase
        goals.carbs_g = Math.round((goals.calories! * 0.5) / 4); // 50% from carbs
      }
    }

    return goals;
  } catch (error) {
    console.error('Error getting goals for day:', error);
    return getDefaultGoals();
  }
}

// Update weekly goal override
export async function updateWeeklyGoalOverride(userId: string, override: WeeklyGoalOverride) {
  try {
    const { data, error } = await supabase
      .from('fitness_profiles')
      .update({ weekly_goal_override: override })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating weekly goal override:', error);
    throw error;
  }
}

// Update goal schedule
export async function updateGoalSchedule(userId: string, schedule: GoalSchedule) {
  try {
    const { data, error } = await supabase
      .from('fitness_profiles')
      .update({ goal_schedule: schedule })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating goal schedule:', error);
    throw error;
  }
}

// Get dynamic hydration goal
export async function getDynamicHydrationGoal(userId: string, date: Date): Promise<number> {
  try {
    const { data: profile } = await supabase
      .from('fitness_profiles')
      .select('daily_water_goal_ml, dynamic_hydration_factor, weight_kg')
      .eq('user_id', userId)
      .single();

    let baseGoal = profile?.daily_water_goal_ml || 2000;

    if (!profile?.dynamic_hydration_factor) {
      return baseGoal;
    }

    // Get workout data for the day
    const { data: workouts } = await supabase
      .from('workout_sessions')
      .select('duration_minutes, workout_type')
      .eq('user_id', userId)
      .eq('workout_date', date.toISOString().split('T')[0]);

    // Calculate additional hydration needs
    let additionalHydration = 0;

    if (workouts && workouts.length > 0) {
      workouts.forEach(workout => {
        const multiplier = workout.workout_type === 'cardio' ? 15 : 10;
        additionalHydration += workout.duration_minutes * multiplier;
      });
    }

    // Adjust for body weight (30ml per kg)
    if (profile.weight_kg) {
      baseGoal = Math.max(baseGoal, profile.weight_kg * 30);
    }

    // Weather adjustment (would need weather API integration)
    // For now, we'll use a simple date-based estimation
    const month = date.getMonth();
    const isSummer = month >= 5 && month <= 8;
    if (isSummer) {
      additionalHydration += 500;
    }

    return baseGoal + additionalHydration;
  } catch (error) {
    console.error('Error calculating dynamic hydration goal:', error);
    return 2000;
  }
}

// Helper function
function getDefaultGoals(): DailyGoals {
  return {
    calories: 2000,
    protein_g: 50,
    carbs_g: 250,
    fat_g: 65,
    water_ml: 2000,
    steps: 10000
  };
}

// Generate smart goal recommendations
export async function generateGoalRecommendations(userId: string) {
  try {
    // Get user's fitness profile and recent data
    const { data: profile } = await supabase
      .from('fitness_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profile) return null;

    // Get recent performance data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);

    const { data: nutritionLogs } = await supabase
      .from('nutrition_logs')
      .select('date, calories, protein_g')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    const { data: workouts } = await supabase
      .from('workout_sessions')
      .select('workout_date, workout_type')
      .eq('user_id', userId)
      .gte('workout_date', startDate.toISOString().split('T')[0])
      .lte('workout_date', endDate.toISOString().split('T')[0]);

    // Analyze patterns
    const workoutDays = new Set(workouts?.map(w => 
      new Date(w.workout_date).toLocaleLowerCase('en-US', { weekday: 'long' }).toLowerCase()
    ));

    const avgCalories = nutritionLogs?.reduce((sum, log) => sum + log.calories, 0) / (nutritionLogs?.length || 1) || 0;
    const avgProtein = nutritionLogs?.reduce((sum, log) => sum + log.protein_g, 0) / (nutritionLogs?.length || 1) || 0;

    // Generate recommendations
    const recommendations = {
      suggested_schedule: {
        workout_days: Array.from(workoutDays),
        rest_days: ['sunday'], // Default rest day
        high_protein_days: Array.from(workoutDays),
        refeed_days: workoutDays.size > 4 ? ['saturday'] : []
      },
      goal_adjustments: {
        calories: Math.round(avgCalories * 1.05), // 5% buffer
        protein: profile.fitness_goal === 'build_muscle' 
          ? Math.round(profile.weight_kg * 2.2)
          : Math.round(profile.weight_kg * 1.6),
        hydration: profile.weight_kg * 35 // 35ml per kg base
      },
      insights: generateInsights(profile, avgCalories, workoutDays.size)
    };

    return recommendations;
  } catch (error) {
    console.error('Error generating goal recommendations:', error);
    return null;
  }
}

function generateInsights(profile: any, avgCalories: number, workoutFrequency: number) {
  const insights = [];

  if (profile.fitness_goal === 'lose_weight' && avgCalories > profile.daily_calorie_goal) {
    insights.push('Your average intake exceeds your goal. Consider meal planning to stay on track.');
  }

  if (workoutFrequency < 3) {
    insights.push('Increasing workout frequency to 3-4 times per week can accelerate progress.');
  }

  if (profile.fitness_goal === 'build_muscle' && workoutFrequency > 5) {
    insights.push('Rest days are crucial for muscle growth. Consider reducing to 4-5 workouts per week.');
  }

  return insights;
}
