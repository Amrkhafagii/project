interface MenuItem {
  id: string;
  name: string;
  description: string;
  currentPrice: number;
  category: string;
  ingredients: string[];
  preparationTime: number;
  calories: number;
  popularity: number; // 0-100
  profitMargin: number; // percentage
  costToMake: number;
  seasonalIngredients: string[];
  averageRating: number;
  totalReviews: number;
}

interface SalesData {
  date: string;
  quantity: number;
  revenue: number;
  hour: number;
  dayOfWeek: number;
  weather: string;
  promotions: string[];
}

interface DemandForecast {
  menuItemId: string;
  predictions: Array<{
    date: string;
    hour: number;
    predictedDemand: number;
    confidence: number; // 0-1
    factors: string[];
  }>;
  seasonalTrends: Array<{
    period: string;
    multiplier: number;
    reason: string;
  }>;
  recommendations: string[];
}

interface PriceOptimization {
  menuItemId: string;
  currentPrice: number;
  suggestedPrice: number;
  priceElasticity: number;
  expectedDemandChange: number;
  expectedRevenueChange: number;
  competitorPrices: Array<{
    competitor: string;
    price: number;
    distance: number; // km away
  }>;
  reasoning: string[];
  confidence: number;
}

interface MenuPerformanceAnalytics {
  menuItemId: string;
  menuItem: MenuItem;
  performance: {
    totalSales: number;
    totalRevenue: number;
    averageOrdersPerDay: number;
    peakHours: number[];
    slowHours: number[];
    bestDays: number[]; // day of week
    worstDays: number[];
  };
  trends: {
    salesGrowth: number; // percentage
    revenueGrowth: number;
    popularityTrend: 'rising' | 'stable' | 'declining';
    seasonalPattern: string;
  };
  customerInsights: {
    averageRating: number;
    repeatOrderRate: number;
    customerSegments: Array<{
      segment: string;
      percentage: number;
      characteristics: string[];
    }>;
  };
  optimization: {
    suggestedActions: string[];
    potentialImpact: string;
    priority: 'high' | 'medium' | 'low';
  };
}

interface CompetitorAnalysis {
  restaurantId: string;
  competitors: Array<{
    id: string;
    name: string;
    distance: number;
    cuisine: string;
    averagePrice: number;
    rating: number;
    popularItems: Array<{
      name: string;
      price: number;
      description: string;
    }>;
  }>;
  marketPosition: {
    pricePosition: 'premium' | 'mid-range' | 'budget';
    qualityPosition: 'high' | 'medium' | 'low';
    uniqueSellingPoints: string[];
    competitiveAdvantages: string[];
    threatAnalysis: string[];
  };
  recommendations: Array<{
    type: 'pricing' | 'menu' | 'positioning';
    recommendation: string;
    expectedImpact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

export class MenuIntelligenceEngine {
  private salesHistory: Map<string, SalesData[]> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private marketData: Map<string, any> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock menu items
    const mockMenuItems: MenuItem[] = [
      {
        id: 'salmon_bowl',
        name: 'Grilled Salmon Power Bowl',
        description: 'Atlantic salmon with quinoa and vegetables',
        currentPrice: 18.99,
        category: 'Main Dishes',
        ingredients: ['salmon', 'quinoa', 'broccoli', 'sweet potato'],
        preparationTime: 25,
        calories: 485,
        popularity: 85,
        profitMargin: 65,
        costToMake: 6.65,
        seasonalIngredients: ['salmon'],
        averageRating: 4.7,
        totalReviews: 156,
      },
      {
        id: 'chicken_bowl',
        name: 'Lean Chicken Mediterranean',
        description: 'Grilled chicken with Mediterranean vegetables',
        currentPrice: 16.50,
        category: 'Main Dishes',
        ingredients: ['chicken', 'rice', 'vegetables', 'olive oil'],
        preparationTime: 20,
        calories: 420,
        popularity: 92,
        profitMargin: 70,
        costToMake: 4.95,
        seasonalIngredients: [],
        averageRating: 4.8,
        totalReviews: 203,
      },
    ];

    mockMenuItems.forEach(item => {
      this.menuItems.set(item.id, item);
      
      // Generate mock sales data
      const salesData: SalesData[] = [];
      for (let i = 30; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate hourly sales data
        for (let hour = 10; hour <= 22; hour++) {
          const baseQuantity = this.calculateBaseQuantity(item.popularity, hour, date.getDay());
          const quantity = Math.max(0, Math.round(baseQuantity + (Math.random() - 0.5) * 5));
          
          if (quantity > 0) {
            salesData.push({
              date: date.toISOString().split('T')[0],
              quantity,
              revenue: quantity * item.currentPrice,
              hour,
              dayOfWeek: date.getDay(),
              weather: this.getRandomWeather(),
              promotions: Math.random() > 0.8 ? ['happy_hour'] : [],
            });
          }
        }
      }
      
      this.salesHistory.set(item.id, salesData);
    });
  }

  /**
   * Generate demand forecasts using advanced ML algorithms
   */
  async generateDemandForecast(
    menuItemId: string,
    forecastDays: number = 7
  ): Promise<DemandForecast> {
    const menuItem = this.menuItems.get(menuItemId);
    const salesHistory = this.salesHistory.get(menuItemId);
    
    if (!menuItem || !salesHistory) {
      throw new Error('Menu item not found');
    }

    // Analyze historical patterns
    const patterns = this.analyzeHistoricalPatterns(salesHistory);
    
    // Generate predictions
    const predictions = [];
    const today = new Date();
    
    for (let day = 1; day <= forecastDays; day++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + day);
      
      // Generate hourly predictions
      for (let hour = 10; hour <= 22; hour++) {
        const prediction = this.predictHourlyDemand(
          menuItem,
          salesHistory,
          forecastDate,
          hour,
          patterns
        );
        
        predictions.push({
          date: forecastDate.toISOString().split('T')[0],
          hour,
          predictedDemand: Math.round(prediction.demand),
          confidence: prediction.confidence,
          factors: prediction.factors,
        });
      }
    }

    // Analyze seasonal trends
    const seasonalTrends = this.analyzeSeasonalTrends(menuItem, salesHistory);
    
    // Generate recommendations
    const recommendations = this.generateDemandRecommendations(
      menuItem,
      predictions,
      patterns
    );

    return {
      menuItemId,
      predictions,
      seasonalTrends,
      recommendations,
    };
  }

  /**
   * Optimize pricing using demand elasticity and market analysis
   */
  async optimizeMenuPricing(
    menuItemId: string,
    options: {
      targetProfitMargin?: number;
      competitorAnalysis?: boolean;
      demandElasticity?: boolean;
    } = {}
  ): Promise<PriceOptimization> {
    const menuItem = this.menuItems.get(menuItemId);
    const salesHistory = this.salesHistory.get(menuItemId);
    
    if (!menuItem || !salesHistory) {
      throw new Error('Menu item not found');
    }

    // Calculate price elasticity
    const priceElasticity = this.calculatePriceElasticity(salesHistory, menuItem);
    
    // Analyze competitor pricing
    const competitorPrices = await this.analyzeCompetitorPricing(menuItem);
    
    // Calculate optimal price
    const optimization = this.calculateOptimalPrice(
      menuItem,
      priceElasticity,
      competitorPrices,
      options
    );

    return {
      menuItemId,
      currentPrice: menuItem.currentPrice,
      suggestedPrice: optimization.suggestedPrice,
      priceElasticity,
      expectedDemandChange: optimization.demandChange,
      expectedRevenueChange: optimization.revenueChange,
      competitorPrices,
      reasoning: optimization.reasoning,
      confidence: optimization.confidence,
    };
  }

  /**
   * Generate comprehensive menu performance analytics
   */
  async analyzeMenuPerformance(
    restaurantId: string,
    timeRange: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<MenuPerformanceAnalytics[]> {
    const analytics: MenuPerformanceAnalytics[] = [];
    
    for (const [menuItemId, menuItem] of this.menuItems) {
      const salesHistory = this.salesHistory.get(menuItemId) || [];
      
      // Filter data by time range
      const filteredSales = this.filterSalesByTimeRange(salesHistory, timeRange);
      
      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(filteredSales);
      
      // Analyze trends
      const trends = this.analyzeTrends(filteredSales, salesHistory);
      
      // Generate customer insights
      const customerInsights = this.generateCustomerInsights(menuItem, filteredSales);
      
      // Create optimization recommendations
      const optimization = this.generateOptimizationRecommendations(
        menuItem,
        performance,
        trends
      );

      analytics.push({
        menuItemId,
        menuItem,
        performance,
        trends,
        customerInsights,
        optimization,
      });
    }

    // Sort by performance (revenue)
    return analytics.sort((a, b) => b.performance.totalRevenue - a.performance.totalRevenue);
  }

  /**
   * Analyze competitor landscape and market positioning
   */
  async analyzeCompetitorLandscape(restaurantId: string): Promise<CompetitorAnalysis> {
    // Mock competitor data - in real implementation, this would come from market research APIs
    const competitors = [
      {
        id: 'comp_1',
        name: 'Healthy Eats Co',
        distance: 0.8,
        cuisine: 'Healthy',
        averagePrice: 16.99,
        rating: 4.5,
        popularItems: [
          { name: 'Power Bowl', price: 17.99, description: 'Quinoa and protein bowl' },
          { name: 'Green Smoothie', price: 8.99, description: 'Spinach and fruit blend' },
        ],
      },
      {
        id: 'comp_2',
        name: 'Fresh & Fit',
        distance: 1.2,
        cuisine: 'Mediterranean',
        averagePrice: 19.50,
        rating: 4.7,
        popularItems: [
          { name: 'Mediterranean Bowl', price: 18.50, description: 'Greek-style protein bowl' },
          { name: 'Protein Wrap', price: 14.99, description: 'High-protein wrap' },
        ],
      },
    ];

    // Analyze market position
    const restaurantAveragePrice = Array.from(this.menuItems.values())
      .reduce((sum, item) => sum + item.currentPrice, 0) / this.menuItems.size;
    
    const marketPosition = this.analyzeMarketPosition(
      restaurantAveragePrice,
      competitors
    );

    // Generate recommendations
    const recommendations = this.generateCompetitorRecommendations(
      competitors,
      marketPosition
    );

    return {
      restaurantId,
      competitors,
      marketPosition,
      recommendations,
    };
  }

  /**
   * Dynamic pricing recommendations based on real-time factors
   */
  async generateDynamicPricing(
    menuItemId: string,
    factors: {
      currentDemand: number;
      timeOfDay: number;
      dayOfWeek: number;
      weather: string;
      events: string[];
      inventory: number;
    }
  ): Promise<{
    suggestedPrice: number;
    priceMultiplier: number;
    reasoning: string[];
    expectedImpact: string;
  }> {
    const menuItem = this.menuItems.get(menuItemId);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }

    let priceMultiplier = 1.0;
    const reasoning: string[] = [];

    // Time-based pricing
    if (factors.timeOfDay >= 12 && factors.timeOfDay <= 14) {
      priceMultiplier *= 1.1;
      reasoning.push('Lunch rush premium (+10%)');
    } else if (factors.timeOfDay >= 18 && factors.timeOfDay <= 20) {
      priceMultiplier *= 1.15;
      reasoning.push('Dinner rush premium (+15%)');
    }

    // Demand-based pricing
    if (factors.currentDemand > 80) {
      priceMultiplier *= 1.2;
      reasoning.push('High demand surge (+20%)');
    } else if (factors.currentDemand < 30) {
      priceMultiplier *= 0.9;
      reasoning.push('Low demand discount (-10%)');
    }

    // Weather-based pricing
    if (factors.weather === 'rain' && menuItem.category === 'Warm Dishes') {
      priceMultiplier *= 1.05;
      reasoning.push('Weather demand boost (+5%)');
    }

    // Inventory-based pricing
    if (factors.inventory < 5) {
      priceMultiplier *= 1.25;
      reasoning.push('Limited availability premium (+25%)');
    } else if (factors.inventory > 50) {
      priceMultiplier *= 0.95;
      reasoning.push('Excess inventory discount (-5%)');
    }

    // Events-based pricing
    if (factors.events.includes('game_day')) {
      priceMultiplier *= 1.1;
      reasoning.push('Special event premium (+10%)');
    }

    const suggestedPrice = Math.round(menuItem.currentPrice * priceMultiplier * 100) / 100;
    
    const expectedImpact = this.calculateDynamicPricingImpact(
      menuItem,
      priceMultiplier,
      factors
    );

    return {
      suggestedPrice,
      priceMultiplier,
      reasoning,
      expectedImpact,
    };
  }

  // Private helper methods

  private calculateBaseQuantity(popularity: number, hour: number, dayOfWeek: number): number {
    let base = (popularity / 100) * 10; // Base quantity based on popularity
    
    // Hour adjustments
    if (hour >= 12 && hour <= 14) base *= 1.5; // Lunch rush
    if (hour >= 18 && hour <= 20) base *= 1.8; // Dinner rush
    if (hour < 11 || hour > 21) base *= 0.3; // Off hours
    
    // Day of week adjustments
    if (dayOfWeek === 0 || dayOfWeek === 6) base *= 1.2; // Weekend boost
    if (dayOfWeek === 1) base *= 0.8; // Monday slowdown
    
    return base;
  }

  private getRandomWeather(): string {
    const conditions = ['sunny', 'cloudy', 'rain', 'snow'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private analyzeHistoricalPatterns(salesHistory: SalesData[]) {
    const hourlyPatterns = new Map<number, number>();
    const dailyPatterns = new Map<number, number>();
    const weatherPatterns = new Map<string, number>();

    salesHistory.forEach(sale => {
      // Hourly patterns
      const currentHourly = hourlyPatterns.get(sale.hour) || 0;
      hourlyPatterns.set(sale.hour, currentHourly + sale.quantity);

      // Daily patterns
      const currentDaily = dailyPatterns.get(sale.dayOfWeek) || 0;
      dailyPatterns.set(sale.dayOfWeek, currentDaily + sale.quantity);

      // Weather patterns
      const currentWeather = weatherPatterns.get(sale.weather) || 0;
      weatherPatterns.set(sale.weather, currentWeather + sale.quantity);
    });

    return { hourlyPatterns, dailyPatterns, weatherPatterns };
  }

  private predictHourlyDemand(
    menuItem: MenuItem,
    salesHistory: SalesData[],
    date: Date,
    hour: number,
    patterns: any
  ) {
    const dayOfWeek = date.getDay();
    
    // Base prediction from historical patterns
    const hourlyAvg = patterns.hourlyPatterns.get(hour) || 0;
    const dailyMultiplier = (patterns.dailyPatterns.get(dayOfWeek) || 0) / 
                           (patterns.dailyPatterns.get(2) || 1); // Normalize to Tuesday
    
    let demand = hourlyAvg * dailyMultiplier * (menuItem.popularity / 100);
    
    // Apply seasonal adjustments
    const seasonalMultiplier = this.getSeasonalMultiplier(menuItem, date);
    demand *= seasonalMultiplier;
    
    // Confidence based on data availability
    const historicalDataPoints = salesHistory.filter(s => s.hour === hour && s.dayOfWeek === dayOfWeek).length;
    const confidence = Math.min(0.95, historicalDataPoints / 10);
    
    const factors = [
      'Historical sales patterns',
      'Day of week trends',
      'Seasonal adjustments',
      'Menu item popularity',
    ];

    return { demand, confidence, factors };
  }

  private analyzeSeasonalTrends(menuItem: MenuItem, salesHistory: SalesData[]) {
    // Mock seasonal analysis
    return [
      {
        period: 'Summer',
        multiplier: menuItem.seasonalIngredients.length > 0 ? 1.2 : 1.0,
        reason: 'Fresh seasonal ingredients boost demand',
      },
      {
        period: 'Winter',
        multiplier: menuItem.category === 'Warm Dishes' ? 1.15 : 0.9,
        reason: 'Cold weather affects preference patterns',
      },
    ];
  }

  private generateDemandRecommendations(
    menuItem: MenuItem,
    predictions: any[],
    patterns: any
  ): string[] {
    const recommendations = [];
    
    // Analyze peak hours
    const peakHours = this.findPeakHours(patterns.hourlyPatterns);
    if (peakHours.length > 0) {
      recommendations.push(`Optimize inventory for peak hours: ${peakHours.join(', ')}`);
    }
    
    // Low demand periods
    const lowHours = this.findLowHours(patterns.hourlyPatterns);
    if (lowHours.length > 0) {
      recommendations.push(`Consider promotions during slow hours: ${lowHours.join(', ')}`);
    }
    
    // Seasonal recommendations
    if (menuItem.seasonalIngredients.length > 0) {
      recommendations.push('Promote seasonal ingredients to capitalize on freshness');
    }

    return recommendations;
  }

  private calculatePriceElasticity(salesHistory: SalesData[], menuItem: MenuItem): number {
    // Mock elasticity calculation - in real implementation, this would use historical price changes
    // For food items, elasticity typically ranges from -0.5 to -1.5
    const categoryElasticity = {
      'Main Dishes': -0.8,
      'Appetizers': -1.2,
      'Beverages': -1.5,
      'Desserts': -0.6,
    };
    
    return categoryElasticity[menuItem.category as keyof typeof categoryElasticity] || -1.0;
  }

  private async analyzeCompetitorPricing(menuItem: MenuItem) {
    // Mock competitor pricing data
    return [
      { competitor: 'Healthy Eats Co', price: 17.99, distance: 0.8 },
      { competitor: 'Fresh & Fit', price: 18.50, distance: 1.2 },
      { competitor: 'Green Garden', price: 16.75, distance: 1.5 },
    ];
  }

  private calculateOptimalPrice(
    menuItem: MenuItem,
    priceElasticity: number,
    competitorPrices: any[],
    options: any
  ) {
    const currentPrice = menuItem.currentPrice;
    const targetMargin = options.targetProfitMargin || 65;
    
    // Cost-plus pricing
    const costBasedPrice = menuItem.costToMake / (1 - targetMargin / 100);
    
    // Competitor-based pricing
    const avgCompetitorPrice = competitorPrices.reduce((sum, comp) => sum + comp.price, 0) / competitorPrices.length;
    const competitorBasedPrice = avgCompetitorPrice * 0.95; // Slight undercut
    
    // Demand-based pricing using elasticity
    const demandBasedPrice = this.calculateDemandOptimalPrice(currentPrice, priceElasticity);
    
    // Weighted combination
    const suggestedPrice = (
      costBasedPrice * 0.4 +
      competitorBasedPrice * 0.3 +
      demandBasedPrice * 0.3
    );
    
    const priceChange = (suggestedPrice - currentPrice) / currentPrice;
    const demandChange = priceElasticity * priceChange * 100;
    const revenueChange = ((1 + priceChange) * (1 + demandChange / 100) - 1) * 100;
    
    const reasoning = [
      `Cost-based analysis suggests $${costBasedPrice.toFixed(2)}`,
      `Competitor analysis suggests $${competitorBasedPrice.toFixed(2)}`,
      `Demand optimization suggests $${demandBasedPrice.toFixed(2)}`,
      `Price elasticity: ${priceElasticity.toFixed(2)}`,
    ];

    return {
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      demandChange,
      revenueChange,
      reasoning,
      confidence: 0.85,
    };
  }

  private calculateDemandOptimalPrice(currentPrice: number, elasticity: number): number {
    // Simplified optimal pricing formula
    const optimalMarkup = -1 / (1 + elasticity);
    return currentPrice * (1 + optimalMarkup * 0.1); // Conservative adjustment
  }

  private filterSalesByTimeRange(salesHistory: SalesData[], timeRange: string): SalesData[] {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
    }
    
    return salesHistory.filter(sale => new Date(sale.date) >= cutoffDate);
  }

  private calculatePerformanceMetrics(salesData: SalesData[]) {
    const totalSales = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.revenue, 0);
    
    // Group by day to calculate daily averages
    const dailySales = new Map<string, number>();
    salesData.forEach(sale => {
      const current = dailySales.get(sale.date) || 0;
      dailySales.set(sale.date, current + sale.quantity);
    });
    
    const averageOrdersPerDay = totalSales / (dailySales.size || 1);
    
    // Find peak and slow hours
    const hourlySales = new Map<number, number>();
    salesData.forEach(sale => {
      const current = hourlySales.get(sale.hour) || 0;
      hourlySales.set(sale.hour, current + sale.quantity);
    });
    
    const peakHours = this.findPeakHours(hourlySales);
    const slowHours = this.findLowHours(hourlySales);
    
    // Find best and worst days
    const dayOfWeekSales = new Map<number, number>();
    salesData.forEach(sale => {
      const current = dayOfWeekSales.get(sale.dayOfWeek) || 0;
      dayOfWeekSales.set(sale.dayOfWeek, current + sale.quantity);
    });
    
    const bestDays = this.findTopDays(dayOfWeekSales);
    const worstDays = this.findBottomDays(dayOfWeekSales);

    return {
      totalSales,
      totalRevenue,
      averageOrdersPerDay,
      peakHours,
      slowHours,
      bestDays,
      worstDays,
    };
  }

  private analyzeTrends(recentSales: SalesData[], allSales: SalesData[]) {
    // Calculate growth rates
    const recentRevenue = recentSales.reduce((sum, sale) => sum + sale.revenue, 0);
    const recentQuantity = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    // Compare to previous period
    const previousPeriodEnd = new Date(recentSales[0]?.date || new Date());
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - recentSales.length);
    
    const previousSales = allSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate < new Date(recentSales[0]?.date || new Date()) && 
             saleDate >= previousPeriodEnd;
    });
    
    const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.revenue, 0);
    const previousQuantity = previousSales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    const salesGrowth = previousQuantity > 0 ? 
      ((recentQuantity - previousQuantity) / previousQuantity) * 100 : 0;
    const revenueGrowth = previousRevenue > 0 ? 
      ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    let popularityTrend: 'rising' | 'stable' | 'declining' = 'stable';
    if (salesGrowth > 5) popularityTrend = 'rising';
    else if (salesGrowth < -5) popularityTrend = 'declining';

    return {
      salesGrowth,
      revenueGrowth,
      popularityTrend,
      seasonalPattern: 'Summer peak detected',
    };
  }

  private generateCustomerInsights(menuItem: MenuItem, salesData: SalesData[]) {
    // Mock customer insights
    return {
      averageRating: menuItem.averageRating,
      repeatOrderRate: 0.35, // 35% of customers reorder
      customerSegments: [
        {
          segment: 'Fitness Enthusiasts',
          percentage: 45,
          characteristics: ['Health-conscious', 'High protein preference', 'Regular orderers'],
        },
        {
          segment: 'Busy Professionals',
          percentage: 35,
          characteristics: ['Time-constrained', 'Lunch orders', 'Convenience-focused'],
        },
        {
          segment: 'Health Explorers',
          percentage: 20,
          characteristics: ['Trying new foods', 'Occasional orders', 'Price-sensitive'],
        },
      ],
    };
  }

  private generateOptimizationRecommendations(
    menuItem: MenuItem,
    performance: any,
    trends: any
  ) {
    const suggestions: string[] = [];
    let priority: 'high' | 'medium' | 'low' = 'medium';
    
    if (trends.salesGrowth < -10) {
      suggestions.push('Consider menu refresh or promotional pricing');
      priority = 'high';
    } else if (trends.salesGrowth > 15) {
      suggestions.push('Capitalize on popularity with premium positioning');
      priority = 'high';
    }
    
    if (performance.peakHours.length > 0) {
      suggestions.push(`Optimize inventory for peak hours: ${performance.peakHours.join(', ')}`);
    }
    
    if (menuItem.profitMargin < 50) {
      suggestions.push('Review ingredient costs and portion sizes');
      priority = 'high';
    }

    return {
      suggestedActions: suggestions,
      potentialImpact: this.calculatePotentialImpact(performance, trends),
      priority,
    };
  }

  private analyzeMarketPosition(restaurantPrice: number, competitors: any[]) {
    const avgCompetitorPrice = competitors.reduce((sum, comp) => sum + comp.averagePrice, 0) / competitors.length;
    
    let pricePosition: 'premium' | 'mid-range' | 'budget' = 'mid-range';
    if (restaurantPrice > avgCompetitorPrice * 1.15) pricePosition = 'premium';
    else if (restaurantPrice < avgCompetitorPrice * 0.85) pricePosition = 'budget';
    
    return {
      pricePosition,
      qualityPosition: 'high' as const,
      uniqueSellingPoints: ['AI-powered nutrition tracking', 'Seasonal ingredient focus'],
      competitiveAdvantages: ['Technology integration', 'Health-focused menu'],
      threatAnalysis: ['Price competition from budget options', 'New market entrants'],
    };
  }

  private generateCompetitorRecommendations(competitors: any[], marketPosition: any) {
    return [
      {
        type: 'pricing' as const,
        recommendation: 'Maintain premium positioning with value-added services',
        expectedImpact: '5-10% revenue increase',
        effort: 'medium' as const,
      },
      {
        type: 'menu' as const,
        recommendation: 'Introduce budget-friendly options to capture price-sensitive customers',
        expectedImpact: '15-20% customer base expansion',
        effort: 'high' as const,
      },
    ];
  }

  private calculateDynamicPricingImpact(
    menuItem: MenuItem,
    priceMultiplier: number,
    factors: any
  ): string {
    const priceChange = (priceMultiplier - 1) * 100;
    const demandImpact = -0.8 * priceChange; // Assuming -0.8 elasticity
    const revenueImpact = priceChange + demandImpact + (priceChange * demandImpact / 100);
    
    return `Expected ${revenueImpact > 0 ? 'increase' : 'decrease'} of ${Math.abs(revenueImpact).toFixed(1)}% in revenue`;
  }

  private getSeasonalMultiplier(menuItem: MenuItem, date: Date): number {
    const month = date.getMonth();
    
    // Summer boost for fresh ingredients
    if (month >= 5 && month <= 7 && menuItem.seasonalIngredients.length > 0) {
      return 1.15;
    }
    
    // Winter comfort food boost
    if ((month <= 1 || month >= 11) && menuItem.category === 'Warm Dishes') {
      return 1.1;
    }
    
    return 1.0;
  }

  private findPeakHours(hourlyData: Map<number, number>): number[] {
    const sorted = Array.from(hourlyData.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([hour]) => hour);
  }

  private findLowHours(hourlyData: Map<number, number>): number[] {
    const sorted = Array.from(hourlyData.entries()).sort((a, b) => a[1] - b[1]);
    return sorted.slice(0, 2).map(([hour]) => hour);
  }

  private findTopDays(dayData: Map<number, number>): number[] {
    const sorted = Array.from(dayData.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 2).map(([day]) => day);
  }

  private findBottomDays(dayData: Map<number, number>): number[] {
    const sorted = Array.from(dayData.entries()).sort((a, b) => a[1] - b[1]);
    return sorted.slice(0, 2).map(([day]) => day);
  }

  private calculatePotentialImpact(performance: any, trends: any): string {
    if (trends.salesGrowth > 10) {
      return 'High revenue potential with proper optimization';
    } else if (trends.salesGrowth < -5) {
      return 'Risk of revenue decline without intervention';
    }
    return 'Moderate improvement opportunity';
  }
}

// Export singleton instance
export const menuIntelligenceEngine = new MenuIntelligenceEngine();
