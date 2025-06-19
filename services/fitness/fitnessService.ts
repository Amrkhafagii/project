export interface FitnessProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height_cm?: number;
  weight_kg?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  fitness_goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle';
}

export function calculateBMR(profile: FitnessProfile): number {
  if (!profile.age || !profile.height_cm || !profile.weight_kg || !profile.gender) {
    return 0;
  }

  const { age, height_cm, weight_kg, gender } = profile;

  // Mifflin-St Jeor Equation
  let bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  }

  return Math.round(bmr);
}

export function calculateTDEE(profile: FitnessProfile): number {
  const bmr = calculateBMR(profile);
  if (!bmr || !profile.activity_level) return 0;

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const tdee = bmr * activityMultipliers[profile.activity_level];
  return Math.round(tdee);
}

export function calculateCalorieGoal(profile: FitnessProfile): number {
  const tdee = calculateTDEE(profile);
  if (!tdee || !profile.fitness_goal) return tdee;

  switch (profile.fitness_goal) {
    case 'lose_weight':
      return Math.round(tdee * 0.8); // 20% deficit
    case 'gain_weight':
      return Math.round(tdee * 1.2); // 20% surplus
    case 'build_muscle':
      return Math.round(tdee * 1.1); // 10% surplus
    case 'maintain_weight':
    default:
      return tdee;
  }
}

export function calculateMacros(calories: number, goal: string) {
  let proteinRatio = 0.25;
  let fatRatio = 0.25;
  let carbRatio = 0.5;

  if (goal === 'build_muscle') {
    proteinRatio = 0.3;
    fatRatio = 0.2;
    carbRatio = 0.5;
  } else if (goal === 'lose_weight') {
    proteinRatio = 0.35;
    fatRatio = 0.3;
    carbRatio = 0.35;
  }

  return {
    protein: Math.round((calories * proteinRatio) / 4), // 4 calories per gram
    fat: Math.round((calories * fatRatio) / 9), // 9 calories per gram
    carbs: Math.round((calories * carbRatio) / 4), // 4 calories per gram
  };
}
