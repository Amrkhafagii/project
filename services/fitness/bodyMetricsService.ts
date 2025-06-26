import { supabase } from '../supabase';

export interface BodyMetrics {
  id?: string;
  user_id: string;
  log_date: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  waist_cm?: number;
  chest_cm?: number;
  hip_cm?: number;
  arm_cm?: number;
  thigh_cm?: number;
  resting_heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  notes?: string;
}

export interface BodyMetricsTrend {
  date: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  measurements?: {
    waist_cm?: number;
    chest_cm?: number;
    hip_cm?: number;
  };
}

// Log body metrics
export async function logBodyMetrics(metrics: BodyMetrics) {
  try {
    const { data, error } = await supabase
      .from('body_metrics_history')
      .upsert(metrics, { onConflict: 'user_id,log_date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging body metrics:', error);
    throw error;
  }
}

// Get body metrics history
export async function getBodyMetricsHistory(userId: string, days: number = 30): Promise<BodyMetrics[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('body_metrics_history')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching body metrics history:', error);
    return [];
  }
}

// Get latest body metrics
export async function getLatestBodyMetrics(userId: string): Promise<BodyMetrics | null> {
  try {
    const { data, error } = await supabase
      .from('body_metrics_history')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching latest body metrics:', error);
    return null;
  }
}

// Calculate body metrics trends
export async function getBodyMetricsTrends(userId: string, days: number = 90): Promise<BodyMetricsTrend[]> {
  try {
    const metrics = await getBodyMetricsHistory(userId, days);
    
    return metrics.map(m => ({
      date: m.log_date,
      weight_kg: m.weight_kg,
      body_fat_percentage: m.body_fat_percentage,
      measurements: {
        waist_cm: m.waist_cm,
        chest_cm: m.chest_cm,
        hip_cm: m.hip_cm,
      }
    }));
  } catch (error) {
    console.error('Error calculating body metrics trends:', error);
    return [];
  }
}

// Calculate weight change
export async function calculateWeightChange(userId: string, days: number = 30) {
  try {
    const metrics = await getBodyMetricsHistory(userId, days);
    if (metrics.length < 2) return null;

    const latest = metrics[0];
    const oldest = metrics[metrics.length - 1];

    if (!latest.weight_kg || !oldest.weight_kg) return null;

    const change = latest.weight_kg - oldest.weight_kg;
    const percentChange = (change / oldest.weight_kg) * 100;

    return {
      absolute: change,
      percent: percentChange,
      trend: change > 0 ? 'gain' : change < 0 ? 'loss' : 'maintain',
      period: days
    };
  } catch (error) {
    console.error('Error calculating weight change:', error);
    return null;
  }
}

// Get body composition analysis
export async function getBodyCompositionAnalysis(userId: string) {
  try {
    const latest = await getLatestBodyMetrics(userId);
    if (!latest || !latest.weight_kg) return null;

    const { weight_kg, body_fat_percentage, height_cm } = latest;
    const profile = await supabase
      .from('fitness_profiles')
      .select('height_cm')
      .eq('user_id', userId)
      .single();

    const userHeight = height_cm || profile.data?.height_cm;
    if (!userHeight) return null;

    // Calculate BMI
    const bmi = weight_kg / Math.pow(userHeight / 100, 2);
    
    // Calculate lean body mass if body fat percentage is available
    const leanMass = body_fat_percentage 
      ? weight_kg * (1 - body_fat_percentage / 100)
      : null;

    const fatMass = body_fat_percentage
      ? weight_kg * (body_fat_percentage / 100)
      : null;

    return {
      bmi: {
        value: bmi,
        category: getBMICategory(bmi),
        healthy_range: [18.5, 24.9]
      },
      body_composition: {
        lean_mass_kg: leanMass,
        fat_mass_kg: fatMass,
        body_fat_percentage: body_fat_percentage
      },
      recommendations: generateBodyCompositionRecommendations(bmi, body_fat_percentage)
    };
  } catch (error) {
    console.error('Error analyzing body composition:', error);
    return null;
  }
}

// Helper functions
function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

function generateBodyCompositionRecommendations(bmi: number, bodyFat?: number) {
  const recommendations = [];

  if (bmi < 18.5) {
    recommendations.push('Consider increasing caloric intake with nutrient-dense foods');
    recommendations.push('Focus on strength training to build muscle mass');
  } else if (bmi > 25) {
    recommendations.push('Aim for a moderate caloric deficit for gradual weight loss');
    recommendations.push('Combine cardio and strength training for optimal results');
  }

  if (bodyFat && bodyFat > 25) {
    recommendations.push('Prioritize protein intake to preserve muscle during fat loss');
    recommendations.push('Track your progress with regular body composition measurements');
  }

  return recommendations;
}
