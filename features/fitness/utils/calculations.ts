import { FitnessProfile } from '../types';

export function calculateBMR(profile: FitnessProfile | null): number {
  if (!profile || !profile.weight_kg || !profile.height_cm || !profile.age || !profile.gender) {
    return 0;
  }

  const { weight_kg, height_cm, age, gender } = profile;

  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }
}

export function calculateTDEE(profile: FitnessProfile | null): number {
  if (!profile || !profile.activity_level) {
    return 0;
  }

  const bmr = calculateBMR(profile);
  
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  return Math.round(bmr * activityMultipliers[profile.activity_level]);
}

export function calculateDailyCalorieTarget(profile: FitnessProfile | null): number {
  if (!profile || !profile.fitness_goal) {
    return 0;
  }

  const tdee = calculateTDEE(profile);

  switch (profile.fitness_goal) {
    case 'lose_weight':
      return Math.round(tdee * 0.8); // 20% deficit
    case 'gain_weight':
    case 'build_muscle':
      return Math.round(tdee * 1.1); // 10% surplus
    case 'maintain_weight':
    default:
      return tdee;
  }
}

export function calculateMacros(calories: number, goal: string | null) {
  const defaults = {
    protein: 0.3, // 30%
    carbs: 0.4,   // 40%
    fat: 0.3,     // 30%
  };

  if (!goal) {
    return {
      protein: Math.round((calories * defaults.protein) / 4),
      carbs: Math.round((calories * defaults.carbs) / 4),
      fat: Math.round((calories * defaults.fat) / 9),
    };
  }

  let proteinRatio, carbRatio, fatRatio;

  switch (goal) {
    case 'lose_weight':
      proteinRatio = 0.35;
      carbRatio = 0.35;
      fatRatio = 0.3;
      break;
    case 'build_muscle':
      proteinRatio = 0.35;
      carbRatio = 0.45;
      fatRatio = 0.2;
      break;
    case 'gain_weight':
      proteinRatio = 0.25;
      carbRatio = 0.5;
      fatRatio = 0.25;
      break;
    default:
      proteinRatio = defaults.protein;
      carbRatio = defaults.carbs;
      fatRatio = defaults.fat;
  }

  return {
    protein: Math.round((calories * proteinRatio) / 4),
    carbs: Math.round((calories * carbRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9),
  };
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateHydrationGoal(profile: FitnessProfile | null): number {
  if (!profile || !profile.weight_kg) {
    return 2000; // Default 2L
  }

  // Base: 35ml per kg of body weight
  let baseAmount = profile.weight_kg * 35;

  // Adjust for activity level
  const activityMultipliers = {
    sedentary: 1.0,
    lightly_active: 1.1,
    moderately_active: 1.2,
    very_active: 1.3,
    extra_active: 1.4,
  };

  if (profile.activity_level) {
    baseAmount *= activityMultipliers[profile.activity_level];
  }

  return Math.round(baseAmount);
}
