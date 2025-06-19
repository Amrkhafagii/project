interface UserProfile {
  id: string;
  fitnessGoals: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  preferredCuisines: string[];
  mealHistory: MealHistory[];
  fitnessProgress: FitnessProgress;
  locationPreferences: string[];
}

interface MealHistory {
  mealId: string;
  orderedAt: Date;
  rating?: number;
  review?: string;
  completedMeal: boolean;
  nutritionalGoalsMet: boolean;
}

interface FitnessProgress {
  currentWeight: number;
  goalWeight: number;
  weeklyWeightChange: number[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  activityLevel: number; // steps per day average
  workoutFrequency: number; // days per week
}

interface MealItem {
  id: string;
  name: string;
  description: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  ingredients: string[];
  allergens: string[];
  cuisine: string;
  tags: string[];
  preparationTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  seasonalIngredients: string[];
  price: number;
  restaurantId: string;
  availability: {
    timeSlots: string[];
    daysOfWeek: number[];
    seasonal: boolean;
  };
  popularity: number;
  averageRating: number;
  totalReviews: number;
}

interface SeasonalData {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  availableIngredients: Array<{
    ingredient: string;
    peakSeason: boolean;
    qualityScore: number;
    priceIndex: number;
  }>;
  popularCuisines: string[];
  weatherImpact: {
    preferredTemperature: 'hot' | 'cold' | 'room_temperature';
    spicePreference: 'mild' | 'moderate' | 'spicy';
  };
}

interface RecommendationParams {
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timeOfDay: Date;
  location?: { latitude: number; longitude: number };
  budget?: { min: number; max: number };
  urgency?: 'immediate' | 'planned' | 'future';
  socialContext?: 'solo' | 'family' | 'friends' | 'date';
}

interface RecommendationResult {
  meals: Array<{
    meal: MealItem;
    score: number;
    reasoning: string[];
    nutritionalFit: number;
    personalPreferenceFit: number;
    seasonalFit: number;
    socialFit: number;
  }>;
  explanation: string;
  alternativeOptions: MealItem[];
  nutritionalGuidance: string[];
  seasonalTips: string[];
}

export class AIRecommendationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private mealDatabase: MealItem[] = [];
  private seasonalData: SeasonalData;
  private collaborativeFilters: Map<string, string[]> = new Map();

  constructor() {
    this.initializeMockData();
    this.buildCollaborativeFilters();
  }

  private initializeMockData() {
    // Mock seasonal data
    this.seasonalData = {
      season: this.getCurrentSeason(),
      availableIngredients: [
        { ingredient: 'tomatoes', peakSeason: true, qualityScore: 95, priceIndex: 0.8 },
        { ingredient: 'asparagus', peakSeason: true, qualityScore: 90, priceIndex: 1.2 },
        { ingredient: 'berries', peakSeason: true, qualityScore: 92, priceIndex: 0.9 },
      ],
      popularCuisines: ['Mediterranean', 'Fresh Salads', 'Grilled Items'],
      weatherImpact: {
        preferredTemperature: 'room_temperature',
        spicePreference: 'moderate',
      },
    };

    // Mock meal database
    this.mealDatabase = [
      {
        id: '1',
        name: 'Seasonal Grilled Salmon Bowl',
        description: 'Fresh Atlantic salmon with seasonal vegetables and quinoa',
        nutritionalInfo: {
          calories: 485,
          protein: 35,
          carbs: 42,
          fat: 18,
          fiber: 6,
          sugar: 8,
          sodium: 420,
        },
        ingredients: ['salmon', 'quinoa', 'asparagus', 'tomatoes', 'olive oil'],
        allergens: ['fish'],
        cuisine: 'Mediterranean',
        tags: ['high-protein', 'omega-3', 'seasonal', 'anti-inflammatory'],
        preparationTime: 25,
        difficulty: 'medium',
        seasonalIngredients: ['asparagus', 'tomatoes'],
        price: 18.99,
        restaurantId: 'rest_1',
        availability: {
          timeSlots: ['lunch', 'dinner'],
          daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
          seasonal: true,
        },
        popularity: 85,
        averageRating: 4.8,
        totalReviews: 156,
      },
      {
        id: '2',
        name: 'Plant-Based Power Bowl',
        description: 'Chickpeas, quinoa, and roasted vegetables with tahini dressing',
        nutritionalInfo: {
          calories: 420,
          protein: 18,
          carbs: 58,
          fat: 14,
          fiber: 12,
          sugar: 10,
          sodium: 380,
        },
        ingredients: ['chickpeas', 'quinoa', 'sweet potato', 'kale', 'tahini'],
        allergens: ['sesame'],
        cuisine: 'Middle Eastern',
        tags: ['vegan', 'high-fiber', 'plant-protein', 'anti-inflammatory'],
        preparationTime: 20,
        difficulty: 'easy',
        seasonalIngredients: ['kale'],
        price: 14.99,
        restaurantId: 'rest_2',
        availability: {
          timeSlots: ['lunch', 'dinner'],
          daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
          seasonal: false,
        },
        popularity: 78,
        averageRating: 4.6,
        totalReviews: 203,
      },
    ];
  }

  /**
   * Generate personalized meal recommendations using AI algorithms
   */
  async generateRecommendations(params: RecommendationParams): Promise<RecommendationResult> {
    const userProfile = this.userProfiles.get(params.userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // 1. Content-based filtering
    const contentScores = this.calculateContentBasedScores(userProfile, params);

    // 2. Collaborative filtering
    const collaborativeScores = this.calculateCollaborativeScores(params.userId);

    // 3. Seasonal and contextual scoring
    const seasonalScores = this.calculateSeasonalScores(params);

    // 4. Nutritional goal alignment
    const nutritionalScores = this.calculateNutritionalScores(userProfile, params);

    // 5. Social context scoring
    const socialScores = this.calculateSocialScores(params);

    // Combine all scores with weights
    const finalScores = this.mealDatabase.map(meal => {
      const contentScore = contentScores.get(meal.id) || 0;
      const collaborativeScore = collaborativeScores.get(meal.id) || 0;
      const seasonalScore = seasonalScores.get(meal.id) || 0;
      const nutritionalScore = nutritionalScores.get(meal.id) || 0;
      const socialScore = socialScores.get(meal.id) || 0;

      // Weighted combination
      const finalScore = 
        contentScore * 0.25 +
        collaborativeScore * 0.20 +
        seasonalScore * 0.15 +
        nutritionalScore * 0.30 +
        socialScore * 0.10;

      return {
        meal,
        score: finalScore,
        reasoning: this.generateReasoning(meal, userProfile, params),
        nutritionalFit: nutritionalScore,
        personalPreferenceFit: contentScore,
        seasonalFit: seasonalScore,
        socialFit: socialScore,
      };
    });

    // Sort by score and get top recommendations
    finalScores.sort((a, b) => b.score - a.score);
    const topRecommendations = finalScores.slice(0, 5);
    const alternativeOptions = finalScores.slice(5, 10).map(r => r.meal);

    return {
      meals: topRecommendations,
      explanation: this.generateExplanation(topRecommendations[0], userProfile),
      alternativeOptions,
      nutritionalGuidance: this.generateNutritionalGuidance(userProfile, topRecommendations),
      seasonalTips: this.generateSeasonalTips(),
    };
  }

  /**
   * Learn from user feedback to improve recommendations
   */
  async updateFromFeedback(
    userId: string,
    mealId: string,
    rating: number,
    feedback: {
      liked: string[];
      disliked: string[];
      suggestions: string[];
    }
  ): Promise<void> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return;

    // Update meal history
    const existingHistory = userProfile.mealHistory.find(h => h.mealId === mealId);
    if (existingHistory) {
      existingHistory.rating = rating;
    } else {
      userProfile.mealHistory.push({
        mealId,
        orderedAt: new Date(),
        rating,
        completedMeal: rating >= 3,
        nutritionalGoalsMet: rating >= 4,
      });
    }

    // Update preferences based on feedback
    const meal = this.mealDatabase.find(m => m.id === mealId);
    if (meal) {
      if (rating >= 4) {
        // Positive feedback - strengthen preferences
        meal.tags.forEach(tag => {
          if (!userProfile.fitnessGoals.includes(tag) && feedback.liked.includes(tag)) {
            userProfile.fitnessGoals.push(tag);
          }
        });
        
        if (!userProfile.preferredCuisines.includes(meal.cuisine)) {
          userProfile.preferredCuisines.push(meal.cuisine);
        }
      } else if (rating <= 2) {
        // Negative feedback - adjust preferences
        feedback.disliked.forEach(aspect => {
          const index = userProfile.fitnessGoals.indexOf(aspect);
          if (index > -1) {
            userProfile.fitnessGoals.splice(index, 1);
          }
        });
      }
    }

    // Update collaborative filters
    this.updateCollaborativeFilters(userId, mealId, rating);
  }

  /**
   * Generate weekly meal plans based on goals and preferences
   */
  async generateWeeklyMealPlan(
    userId: string,
    preferences: {
      mealsPerDay: number;
      varietyPreference: 'low' | 'medium' | 'high';
      budgetConstraints: { min: number; max: number };
      prepTimeConstraints: number; // max minutes
      macroTargets: { protein: number; carbs: number; fat: number };
    }
  ): Promise<{
    weekPlan: Array<{
      day: string;
      meals: Array<{
        mealType: string;
        meal: MealItem;
        score: number;
      }>;
      dailyTotals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        cost: number;
      };
    }>;
    weeklyTotals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      cost: number;
    };
    adherenceScore: number;
    recommendations: string[];
  }> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = preferences.mealsPerDay === 3 
      ? ['breakfast', 'lunch', 'dinner']
      : ['breakfast', 'lunch', 'snack', 'dinner'];

    const weekPlan = [];
    let weeklyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 };

    for (const day of daysOfWeek) {
      const dayMeals = [];
      let dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 };

      for (const mealType of mealTypes) {
        const recommendations = await this.generateRecommendations({
          userId,
          mealType: mealType as any,
          timeOfDay: new Date(),
        });

        // Select meal that best fits remaining macro budget for the day
        const selectedMeal = this.selectMealForMacroBudget(
          recommendations.meals,
          preferences.macroTargets,
          dailyTotals,
          mealTypes.length
        );

        dayMeals.push({
          mealType,
          meal: selectedMeal.meal,
          score: selectedMeal.score,
        });

        // Update totals
        const nutrition = selectedMeal.meal.nutritionalInfo;
        dailyTotals.calories += nutrition.calories;
        dailyTotals.protein += nutrition.protein;
        dailyTotals.carbs += nutrition.carbs;
        dailyTotals.fat += nutrition.fat;
        dailyTotals.cost += selectedMeal.meal.price;
      }

      weekPlan.push({ day, meals: dayMeals, dailyTotals });
      
      // Update weekly totals
      weeklyTotals.calories += dailyTotals.calories;
      weeklyTotals.protein += dailyTotals.protein;
      weeklyTotals.carbs += dailyTotals.carbs;
      weeklyTotals.fat += dailyTotals.fat;
      weeklyTotals.cost += dailyTotals.cost;
    }

    // Calculate adherence score
    const adherenceScore = this.calculateMealPlanAdherence(weekPlan, preferences);

    return {
      weekPlan,
      weeklyTotals,
      adherenceScore,
      recommendations: this.generateMealPlanRecommendations(weekPlan, preferences),
    };
  }

  // Private helper methods

  private calculateContentBasedScores(userProfile: UserProfile, params: RecommendationParams): Map<string, number> {
    const scores = new Map<string, number>();

    this.mealDatabase.forEach(meal => {
      let score = 0;

      // Cuisine preference match
      if (userProfile.preferredCuisines.includes(meal.cuisine)) {
        score += 20;
      }

      // Dietary restrictions compliance
      const hasRestrictedIngredients = meal.ingredients.some(ingredient =>
        userProfile.dietaryRestrictions.some(restriction =>
          ingredient.toLowerCase().includes(restriction.toLowerCase())
        )
      );
      if (hasRestrictedIngredients) {
        score -= 50; // Heavily penalize
      }

      // Allergy safety
      const hasAllergens = meal.allergens.some(allergen =>
        userProfile.allergies.includes(allergen)
      );
      if (hasAllergens) {
        score -= 100; // Exclude completely
      }

      // Tag matching with fitness goals
      const tagMatches = meal.tags.filter(tag =>
        userProfile.fitnessGoals.some(goal =>
          goal.toLowerCase().includes(tag.toLowerCase())
        )
      ).length;
      score += tagMatches * 10;

      // Historical preference learning
      const historicalRating = userProfile.mealHistory
        .filter(h => h.mealId === meal.id)
        .reduce((sum, h) => sum + (h.rating || 0), 0) / 
        userProfile.mealHistory.filter(h => h.mealId === meal.id).length;
      
      if (!isNaN(historicalRating)) {
        score += (historicalRating - 3) * 15; // Center around 3-star rating
      }

      scores.set(meal.id, Math.max(0, score));
    });

    return scores;
  }

  private calculateCollaborativeScores(userId: string): Map<string, number> {
    const scores = new Map<string, number>();
    const similarUsers = this.collaborativeFilters.get(userId) || [];

    this.mealDatabase.forEach(meal => {
      let score = 0;
      let count = 0;

      similarUsers.forEach(similarUserId => {
        const similarUserProfile = this.userProfiles.get(similarUserId);
        if (similarUserProfile) {
          const mealHistory = similarUserProfile.mealHistory.find(h => h.mealId === meal.id);
          if (mealHistory && mealHistory.rating) {
            score += mealHistory.rating;
            count++;
          }
        }
      });

      scores.set(meal.id, count > 0 ? (score / count) * 20 : 0);
    });

    return scores;
  }

  private calculateSeasonalScores(params: RecommendationParams): Map<string, number> {
    const scores = new Map<string, number>();

    this.mealDatabase.forEach(meal => {
      let score = 0;

      // Seasonal ingredient bonus
      const seasonalIngredientCount = meal.seasonalIngredients.filter(ingredient =>
        this.seasonalData.availableIngredients.some(seasonal =>
          seasonal.ingredient === ingredient && seasonal.peakSeason
        )
      ).length;
      score += seasonalIngredientCount * 15;

      // Time of day appropriateness
      const hour = params.timeOfDay.getHours();
      if (params.mealType === 'breakfast' && hour >= 6 && hour <= 10) score += 10;
      if (params.mealType === 'lunch' && hour >= 11 && hour <= 14) score += 10;
      if (params.mealType === 'dinner' && hour >= 17 && hour <= 21) score += 10;

      scores.set(meal.id, score);
    });

    return scores;
  }

  private calculateNutritionalScores(userProfile: UserProfile, params: RecommendationParams): Map<string, number> {
    const scores = new Map<string, number>();

    // Calculate user's nutritional targets based on fitness goals
    const targetCalories = this.calculateTargetCalories(userProfile);
    const targetMacros = this.calculateTargetMacros(userProfile, targetCalories);

    this.mealDatabase.forEach(meal => {
      let score = 0;
      const nutrition = meal.nutritionalInfo;

      // Calorie appropriateness for meal type
      const mealCalorieTarget = this.getMealCalorieTarget(params.mealType, targetCalories);
      const calorieDiff = Math.abs(nutrition.calories - mealCalorieTarget);
      score += Math.max(0, 30 - (calorieDiff / 20)); // Penalty for being far from target

      // Macro balance scoring
      const mealProteinTarget = this.getMealMacroTarget(params.mealType, targetMacros.protein);
      const mealCarbTarget = this.getMealMacroTarget(params.mealType, targetMacros.carbs);
      const mealFatTarget = this.getMealMacroTarget(params.mealType, targetMacros.fat);

      const proteinScore = Math.max(0, 20 - Math.abs(nutrition.protein - mealProteinTarget));
      const carbScore = Math.max(0, 20 - Math.abs(nutrition.carbs - mealCarbTarget) / 2);
      const fatScore = Math.max(0, 20 - Math.abs(nutrition.fat - mealFatTarget));

      score += (proteinScore + carbScore + fatScore) / 3;

      // Fitness goal specific bonuses
      if (userProfile.fitnessGoals.includes('build_muscle') && nutrition.protein > 25) {
        score += 15;
      }
      if (userProfile.fitnessGoals.includes('lose_weight') && nutrition.calories < 400) {
        score += 10;
      }
      if (userProfile.fitnessGoals.includes('high_fiber') && nutrition.fiber > 8) {
        score += 10;
      }

      scores.set(meal.id, Math.max(0, score));
    });

    return scores;
  }

  private calculateSocialScores(params: RecommendationParams): Map<string, number> {
    const scores = new Map<string, number>();

    this.mealDatabase.forEach(meal => {
      let score = 0;

      // Social context appropriateness
      switch (params.socialContext) {
        case 'family':
          if (meal.tags.includes('family-friendly') || meal.difficulty === 'easy') score += 15;
          break;
        case 'date':
          if (meal.tags.includes('elegant') || meal.cuisine === 'Mediterranean') score += 15;
          break;
        case 'friends':
          if (meal.tags.includes('shareable') || meal.tags.includes('comfort')) score += 10;
          break;
        case 'solo':
          if (meal.preparationTime <= 30) score += 10;
          break;
      }

      // Urgency factors
      if (params.urgency === 'immediate' && meal.preparationTime <= 20) {
        score += 20;
      }

      scores.set(meal.id, score);
    });

    return scores;
  }

  private generateReasoning(meal: MealItem, userProfile: UserProfile, params: RecommendationParams): string[] {
    const reasoning: string[] = [];

    // Nutritional reasoning
    if (meal.nutritionalInfo.protein > 25) {
      reasoning.push('High in protein to support your fitness goals');
    }

    // Seasonal reasoning
    const seasonalIngredients = meal.seasonalIngredients.filter(ingredient =>
      this.seasonalData.availableIngredients.some(s => s.ingredient === ingredient && s.peakSeason)
    );
    if (seasonalIngredients.length > 0) {
      reasoning.push(`Features seasonal ingredients: ${seasonalIngredients.join(', ')}`);
    }

    // Preference matching
    if (userProfile.preferredCuisines.includes(meal.cuisine)) {
      reasoning.push(`Matches your preference for ${meal.cuisine} cuisine`);
    }

    // Past behavior
    const similarMeals = userProfile.mealHistory.filter(h => {
      const historicalMeal = this.mealDatabase.find(m => m.id === h.mealId);
      return historicalMeal && historicalMeal.cuisine === meal.cuisine && h.rating && h.rating >= 4;
    });
    if (similarMeals.length > 0) {
      reasoning.push('Similar to meals you\'ve enjoyed before');
    }

    // Time appropriateness
    const hour = params.timeOfDay.getHours();
    if (params.mealType === 'breakfast' && meal.nutritionalInfo.carbs > 20) {
      reasoning.push('Good carbohydrate source to fuel your morning');
    }

    return reasoning;
  }

  private generateExplanation(topRecommendation: any, userProfile: UserProfile): string {
    const meal = topRecommendation.meal;
    return `We recommend ${meal.name} because it aligns with your ${userProfile.fitnessGoals.join(' and ')} goals, provides ${meal.nutritionalInfo.protein}g of protein, and features ${meal.seasonalIngredients.length > 0 ? 'seasonal' : 'quality'} ingredients.`;
  }

  private generateNutritionalGuidance(userProfile: UserProfile, recommendations: any[]): string[] {
    const guidance: string[] = [];
    
    const avgCalories = recommendations.reduce((sum, r) => sum + r.meal.nutritionalInfo.calories, 0) / recommendations.length;
    const targetCalories = this.calculateTargetCalories(userProfile);
    
    if (avgCalories > targetCalories * 1.2) {
      guidance.push('Consider smaller portions or adding more vegetables to balance calories');
    }
    
    if (userProfile.fitnessGoals.includes('build_muscle')) {
      guidance.push('Aim for 25-30g protein per meal to support muscle growth');
    }
    
    if (userProfile.fitnessProgress.weeklyWeightChange.slice(-4).every(change => change >= 0) && userProfile.fitnessGoals.includes('lose_weight')) {
      guidance.push('Consider reducing portion sizes or increasing activity to resume weight loss');
    }

    return guidance;
  }

  private generateSeasonalTips(): string[] {
    return [
      `${this.seasonalData.season} is perfect for ${this.seasonalData.popularCuisines[0]} cuisine`,
      `Peak season ingredients like ${this.seasonalData.availableIngredients[0].ingredient} offer better nutrition and value`,
    ];
  }

  private buildCollaborativeFilters(): void {
    // Mock collaborative filtering - in real implementation, this would use actual user similarity algorithms
    this.collaborativeFilters.set('user1', ['user2', 'user3']);
    this.collaborativeFilters.set('user2', ['user1', 'user4']);
  }

  private updateCollaborativeFilters(userId: string, mealId: string, rating: number): void {
    // Update user similarity based on meal ratings
    // This is a simplified version - real implementation would use cosine similarity or other algorithms
  }

  private getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private calculateTargetCalories(userProfile: UserProfile): number {
    // Simplified calculation - in real app, this would use BMR/TDEE calculations
    return 2000; // Mock value
  }

  private calculateTargetMacros(userProfile: UserProfile, calories: number) {
    // Mock macro targets based on fitness goals
    if (userProfile.fitnessGoals.includes('build_muscle')) {
      return { protein: calories * 0.3 / 4, carbs: calories * 0.4 / 4, fat: calories * 0.3 / 9 };
    }
    return { protein: calories * 0.25 / 4, carbs: calories * 0.45 / 4, fat: calories * 0.3 / 9 };
  }

  private getMealCalorieTarget(mealType: string, dailyTarget: number): number {
    const distributions = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.35,
      snack: 0.05,
    };
    return dailyTarget * (distributions[mealType as keyof typeof distributions] || 0.33);
  }

  private getMealMacroTarget(mealType: string, dailyTarget: number): number {
    return this.getMealCalorieTarget(mealType, dailyTarget * 4) / 4; // Simplified
  }

  private selectMealForMacroBudget(recommendations: any[], macroTargets: any, currentTotals: any, mealsRemaining: number) {
    // Select meal that best fits remaining macro budget
    return recommendations[0]; // Simplified - would normally calculate best fit
  }

  private calculateMealPlanAdherence(weekPlan: any[], preferences: any): number {
    // Calculate how well the meal plan adheres to user preferences and constraints
    return 85; // Mock adherence score
  }

  private generateMealPlanRecommendations(weekPlan: any[], preferences: any): string[] {
    return [
      'Your meal plan provides balanced nutrition throughout the week',
      'Consider meal prepping on Sundays for better adherence',
      'Try to vary your protein sources for better nutrient diversity',
    ];
  }
}

// Export singleton instance
export const aiRecommendationEngine = new AIRecommendationEngine();
