interface Ingredient {
  id: string;
  name: string;
  category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'oil' | 'fruit';
  unit: string;
  currentPrice: number;
  priceHistory: Array<{
    date: string;
    price: number;
    supplier: string;
  }>;
  seasonality: {
    peakMonths: number[];
    lowMonths: number[];
    yearRoundAvailable: boolean;
  };
  suppliers: Supplier[];
  nutritionalValue: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  shelfLife: number; // days
  minimumOrderQuantity: number;
  leadTime: number; // days
  sustainabilityScore: number; // 1-100
  qualityGrade: 'A' | 'B' | 'C';
}

interface Supplier {
  id: string;
  name: string;
  type: 'wholesale' | 'farm_direct' | 'distributor' | 'specialty';
  location: {
    region: string;
    distance: number; // km from restaurant
  };
  certifications: string[];
  reliability: number; // 1-100
  qualityRating: number; // 1-5
  priceCompetitiveness: number; // 1-100
  deliveryOptions: {
    nextDay: boolean;
    sameDay: boolean;
    scheduled: boolean;
  };
  minimumOrder: number;
  paymentTerms: string;
  sustainabilityRating: number; // 1-100
}

interface InventoryForecast {
  ingredientId: string;
  ingredient: Ingredient;
  currentStock: number;
  projectedUsage: Array<{
    date: string;
    quantity: number;
    confidence: number; // 0-1
  }>;
  reorderPoint: number;
  suggestedOrderQuantity: number;
  suggestedOrderDate: string;
  reasoningFactors: string[];
  costOptimizationSuggestions: string[];
  seasonalConsiderations: string[];
  alternativeIngredients: Ingredient[];
}

interface OrderOptimization {
  supplierId: string;
  supplier: Supplier;
  ingredients: Array<{
    ingredientId: string;
    quantity: number;
    unitPrice: number;
    totalCost: number;
  }>;
  totalOrderValue: number;
  shippingCost: number;
  estimatedDelivery: string;
  sustainabilityScore: number;
  costSavings: number;
  reasoning: string[];
}

interface MenuOptimization {
  menuItemId: string;
  currentIngredients: Array<{
    ingredientId: string;
    quantity: number;
    cost: number;
  }>;
  optimizedIngredients: Array<{
    ingredientId: string;
    quantity: number;
    cost: number;
    reason: string;
  }>;
  costSavings: number;
  nutritionalImpact: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  seasonalAdvantages: string[];
  qualityImpact: 'improved' | 'maintained' | 'reduced';
}

interface WasteAnalytics {
  ingredientId: string;
  wastePercentage: number;
  wasteReasons: Array<{
    reason: 'spoilage' | 'over_ordering' | 'preparation_waste' | 'customer_returns';
    percentage: number;
  }>;
  costImpact: number;
  reductionSuggestions: string[];
  improvedShelfLifeOptions: Ingredient[];
}

export class SupplyChainManager {
  private ingredients: Map<string, Ingredient> = new Map();
  private suppliers: Map<string, Supplier> = new Map();
  private restaurantInventory: Map<string, number> = new Map();
  private menuItems: Map<string, any> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock ingredients data
    const mockIngredients: Ingredient[] = [
      {
        id: 'salmon_atlantic',
        name: 'Atlantic Salmon Fillet',
        category: 'protein',
        unit: 'lb',
        currentPrice: 12.50,
        priceHistory: [
          { date: '2024-01-01', price: 11.80, supplier: 'sysco' },
          { date: '2024-01-08', price: 12.20, supplier: 'sysco' },
          { date: '2024-01-15', price: 12.50, supplier: 'sysco' },
        ],
        seasonality: {
          peakMonths: [6, 7, 8],
          lowMonths: [12, 1, 2],
          yearRoundAvailable: true,
        },
        suppliers: [],
        nutritionalValue: {
          calories: 206,
          protein: 22,
          carbs: 0,
          fat: 12,
          fiber: 0,
        },
        shelfLife: 3,
        minimumOrderQuantity: 10,
        leadTime: 1,
        sustainabilityScore: 75,
        qualityGrade: 'A',
      },
      {
        id: 'quinoa_organic',
        name: 'Organic Quinoa',
        category: 'grain',
        unit: 'lb',
        currentPrice: 4.25,
        priceHistory: [
          { date: '2024-01-01', price: 4.50, supplier: 'unfi' },
          { date: '2024-01-08', price: 4.30, supplier: 'unfi' },
          { date: '2024-01-15', price: 4.25, supplier: 'unfi' },
        ],
        seasonality: {
          peakMonths: [9, 10, 11],
          lowMonths: [3, 4, 5],
          yearRoundAvailable: true,
        },
        suppliers: [],
        nutritionalValue: {
          calories: 222,
          protein: 8,
          carbs: 39,
          fat: 4,
          fiber: 5,
        },
        shelfLife: 730,
        minimumOrderQuantity: 50,
        leadTime: 2,
        sustainabilityScore: 90,
        qualityGrade: 'A',
      },
    ];

    // Mock suppliers data
    const mockSuppliers: Supplier[] = [
      {
        id: 'sysco',
        name: 'Sysco',
        type: 'distributor',
        location: {
          region: 'Northeast',
          distance: 25,
        },
        certifications: ['HACCP', 'SQF', 'Organic'],
        reliability: 95,
        qualityRating: 4.2,
        priceCompetitiveness: 78,
        deliveryOptions: {
          nextDay: true,
          sameDay: false,
          scheduled: true,
        },
        minimumOrder: 200,
        paymentTerms: 'Net 30',
        sustainabilityRating: 72,
      },
      {
        id: 'unfi',
        name: 'United Natural Foods',
        type: 'wholesale',
        location: {
          region: 'Northeast',
          distance: 45,
        },
        certifications: ['Organic', 'Non-GMO', 'Fair Trade'],
        reliability: 88,
        qualityRating: 4.5,
        priceCompetitiveness: 65,
        deliveryOptions: {
          nextDay: false,
          sameDay: false,
          scheduled: true,
        },
        minimumOrder: 500,
        paymentTerms: 'Net 15',
        sustainabilityRating: 95,
      },
    ];

    mockIngredients.forEach(ingredient => {
      this.ingredients.set(ingredient.id, ingredient);
    });

    mockSuppliers.forEach(supplier => {
      this.suppliers.set(supplier.id, supplier);
    });

    // Link suppliers to ingredients
    mockIngredients.forEach(ingredient => {
      ingredient.suppliers = mockSuppliers.filter(supplier => {
        if (ingredient.category === 'protein') return ['sysco', 'unfi'].includes(supplier.id);
        return ['unfi'].includes(supplier.id);
      });
    });
  }

  /**
   * Generate inventory forecasting with AI-powered demand prediction
   */
  async generateInventoryForecast(
    restaurantId: string,
    forecastDays: number = 14
  ): Promise<InventoryForecast[]> {
    const forecasts: InventoryForecast[] = [];

    for (const [ingredientId, ingredient] of this.ingredients) {
      const currentStock = this.restaurantInventory.get(ingredientId) || 0;
      
      // Analyze historical usage patterns
      const historicalUsage = this.getHistoricalUsage(restaurantId, ingredientId);
      
      // Predict future demand using various factors
      const projectedUsage = this.predictDemand(
        ingredientId,
        historicalUsage,
        forecastDays
      );

      // Calculate reorder point and quantity
      const { reorderPoint, suggestedQuantity, orderDate } = this.calculateReorderOptimization(
        ingredient,
        projectedUsage,
        currentStock
      );

      // Generate reasoning
      const reasoningFactors = this.generateReasoningFactors(
        ingredient,
        projectedUsage,
        currentStock
      );

      // Cost optimization suggestions
      const costOptimizations = this.generateCostOptimizations(ingredient);

      // Seasonal considerations
      const seasonalConsiderations = this.generateSeasonalConsiderations(ingredient);

      // Alternative ingredients
      const alternatives = this.findAlternativeIngredients(ingredient);

      forecasts.push({
        ingredientId,
        ingredient,
        currentStock,
        projectedUsage,
        reorderPoint,
        suggestedOrderQuantity: suggestedQuantity,
        suggestedOrderDate: orderDate,
        reasoningFactors,
        costOptimizationSuggestions: costOptimizations,
        seasonalConsiderations,
        alternativeIngredients: alternatives,
      });
    }

    return forecasts.sort((a, b) => {
      // Prioritize by urgency (days until stockout)
      const aUrgency = this.calculateUrgency(a);
      const bUrgency = this.calculateUrgency(b);
      return aUrgency - bUrgency;
    });
  }

  /**
   * Optimize supplier orders for cost and efficiency
   */
  async optimizeSupplierOrders(
    requiredIngredients: Array<{ ingredientId: string; quantity: number }>
  ): Promise<OrderOptimization[]> {
    const optimizations: OrderOptimization[] = [];

    // Group ingredients by potential suppliers
    const supplierGroups = this.groupIngredientsBySupplier(requiredIngredients);

    for (const [supplierId, ingredientsList] of supplierGroups) {
      const supplier = this.suppliers.get(supplierId);
      if (!supplier) continue;

      const orderValue = ingredientsList.reduce((total, item) => {
        const ingredient = this.ingredients.get(item.ingredientId);
        return total + (ingredient?.currentPrice || 0) * item.quantity;
      }, 0);

      // Calculate shipping cost
      const shippingCost = this.calculateShippingCost(supplier, orderValue);

      // Estimate delivery date
      const estimatedDelivery = this.calculateDeliveryDate(supplier);

      // Calculate sustainability score
      const sustainabilityScore = this.calculateOrderSustainability(
        supplier,
        ingredientsList
      );

      // Calculate potential cost savings
      const costSavings = this.calculateCostSavings(supplier, ingredientsList);

      // Generate reasoning
      const reasoning = this.generateOrderReasoning(supplier, ingredientsList);

      optimizations.push({
        supplierId,
        supplier,
        ingredients: ingredientsList.map(item => {
          const ingredient = this.ingredients.get(item.ingredientId)!;
          return {
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unitPrice: ingredient.currentPrice,
            totalCost: ingredient.currentPrice * item.quantity,
          };
        }),
        totalOrderValue: orderValue,
        shippingCost,
        estimatedDelivery,
        sustainabilityScore,
        costSavings,
        reasoning,
      });
    }

    // Sort by total cost efficiency
    return optimizations.sort((a, b) => {
      const aEfficiency = (a.totalOrderValue + a.shippingCost) / a.sustainabilityScore;
      const bEfficiency = (b.totalOrderValue + b.shippingCost) / b.sustainabilityScore;
      return aEfficiency - bEfficiency;
    });
  }

  /**
   * Optimize menu items for cost and seasonality
   */
  async optimizeMenuForSeason(
    menuItemIds: string[]
  ): Promise<MenuOptimization[]> {
    const optimizations: MenuOptimization[] = [];

    for (const menuItemId of menuItemIds) {
      const menuItem = this.menuItems.get(menuItemId);
      if (!menuItem) continue;

      const currentIngredients = menuItem.ingredients;
      const optimizedIngredients = [];

      for (const ingredient of currentIngredients) {
        const currentIngredientData = this.ingredients.get(ingredient.ingredientId);
        if (!currentIngredientData) continue;

        // Check for seasonal alternatives
        const seasonalAlternative = this.findSeasonalAlternative(currentIngredientData);
        
        if (seasonalAlternative && seasonalAlternative.currentPrice < currentIngredientData.currentPrice) {
          optimizedIngredients.push({
            ingredientId: seasonalAlternative.id,
            quantity: ingredient.quantity,
            cost: seasonalAlternative.currentPrice * ingredient.quantity,
            reason: `Seasonal alternative - ${((currentIngredientData.currentPrice - seasonalAlternative.currentPrice) / currentIngredientData.currentPrice * 100).toFixed(1)}% cost savings`,
          });
        } else {
          optimizedIngredients.push({
            ingredientId: ingredient.ingredientId,
            quantity: ingredient.quantity,
            cost: currentIngredientData.currentPrice * ingredient.quantity,
            reason: 'Optimal choice for current season',
          });
        }
      }

      const costSavings = currentIngredients.reduce((total, curr) => total + curr.cost, 0) -
                         optimizedIngredients.reduce((total, opt) => total + opt.cost, 0);

      optimizations.push({
        menuItemId,
        currentIngredients,
        optimizedIngredients,
        costSavings,
        nutritionalImpact: this.calculateNutritionalImpact(currentIngredients, optimizedIngredients),
        seasonalAdvantages: this.generateSeasonalAdvantages(optimizedIngredients),
        qualityImpact: costSavings > 0 ? 'improved' : 'maintained',
      });
    }

    return optimizations;
  }

  /**
   * Analyze food waste and suggest improvements
   */
  async analyzeWasteOptimization(
    restaurantId: string
  ): Promise<WasteAnalytics[]> {
    const wasteAnalytics: WasteAnalytics[] = [];

    for (const [ingredientId, ingredient] of this.ingredients) {
      // Mock waste data - in real implementation, this would come from POS and inventory systems
      const wasteData = this.getWasteData(restaurantId, ingredientId);
      
      const wastePercentage = wasteData.totalWaste / wasteData.totalPurchased * 100;
      const costImpact = wasteData.totalWaste * ingredient.currentPrice;

      const reductionSuggestions = this.generateWasteReductionSuggestions(
        ingredient,
        wasteData
      );

      const improvedShelfLifeOptions = this.findBetterShelfLifeOptions(ingredient);

      wasteAnalytics.push({
        ingredientId,
        wastePercentage,
        wasteReasons: wasteData.reasons,
        costImpact,
        reductionSuggestions,
        improvedShelfLifeOptions,
      });
    }

    return wasteAnalytics.sort((a, b) => b.costImpact - a.costImpact);
  }

  // Private helper methods

  private getHistoricalUsage(restaurantId: string, ingredientId: string) {
    // Mock historical usage data
    const baseUsage = Math.random() * 20 + 10; // 10-30 units per day
    const variability = 0.2; // 20% day-to-day variation
    
    const usage = [];
    for (let i = 30; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dailyUsage = baseUsage * (1 + (Math.random() - 0.5) * variability);
      usage.push({
        date: date.toISOString().split('T')[0],
        quantity: Math.round(dailyUsage * 100) / 100,
      });
    }
    
    return usage;
  }

  private predictDemand(
    ingredientId: string,
    historicalUsage: any[],
    forecastDays: number
  ) {
    const projectedUsage = [];
    
    // Simple trend analysis
    const recentAverage = historicalUsage.slice(-7).reduce((sum, day) => sum + day.quantity, 0) / 7;
    const monthlyAverage = historicalUsage.reduce((sum, day) => sum + day.quantity, 0) / historicalUsage.length;
    const trend = (recentAverage - monthlyAverage) / monthlyAverage;

    for (let i = 1; i <= forecastDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Apply trend and seasonal factors
      const seasonalFactor = this.getSeasonalFactor(ingredientId, date);
      const weekdayFactor = this.getWeekdayFactor(date);
      
      const baseQuantity = recentAverage * (1 + trend * i / 30); // Apply trend over month
      const adjustedQuantity = baseQuantity * seasonalFactor * weekdayFactor;
      
      projectedUsage.push({
        date: date.toISOString().split('T')[0],
        quantity: Math.round(adjustedQuantity * 100) / 100,
        confidence: Math.max(0.3, 1 - (i / forecastDays) * 0.7), // Decreasing confidence over time
      });
    }

    return projectedUsage;
  }

  private calculateReorderOptimization(
    ingredient: Ingredient,
    projectedUsage: any[],
    currentStock: number
  ) {
    const leadTime = ingredient.leadTime;
    const safetyStock = ingredient.minimumOrderQuantity * 0.5; // 50% of MOQ as safety stock
    
    // Calculate usage during lead time
    const leadTimeUsage = projectedUsage
      .slice(0, leadTime)
      .reduce((sum, day) => sum + day.quantity, 0);

    const reorderPoint = leadTimeUsage + safetyStock;
    
    // Find when we'll hit reorder point
    let cumulativeUsage = 0;
    let orderDate = new Date().toISOString().split('T')[0];
    
    for (const day of projectedUsage) {
      cumulativeUsage += day.quantity;
      if (currentStock - cumulativeUsage <= reorderPoint) {
        orderDate = day.date;
        break;
      }
    }

    // Calculate optimal order quantity (Economic Order Quantity consideration)
    const totalProjectedUsage = projectedUsage.reduce((sum, day) => sum + day.quantity, 0);
    const suggestedQuantity = Math.max(
      ingredient.minimumOrderQuantity,
      Math.ceil(totalProjectedUsage * 1.1) // 10% buffer
    );

    return {
      reorderPoint,
      suggestedQuantity,
      orderDate,
    };
  }

  private generateReasoningFactors(
    ingredient: Ingredient,
    projectedUsage: any[],
    currentStock: number
  ): string[] {
    const factors = [];
    
    const daysUntilStockout = this.calculateDaysUntilStockout(projectedUsage, currentStock);
    if (daysUntilStockout < ingredient.leadTime + 2) {
      factors.push('Urgent: Stock will run out before next delivery');
    }

    const currentMonth = new Date().getMonth() + 1;
    if (ingredient.seasonality.peakMonths.includes(currentMonth)) {
      factors.push('Peak season - expect higher demand and potential price increases');
    }

    if (ingredient.sustainabilityScore > 80) {
      factors.push('High sustainability score supports eco-friendly menu positioning');
    }

    return factors;
  }

  private generateCostOptimizations(ingredient: Ingredient): string[] {
    const optimizations = [];
    
    // Price trend analysis
    const priceHistory = ingredient.priceHistory;
    if (priceHistory.length >= 2) {
      const recentPrice = priceHistory[priceHistory.length - 1].price;
      const previousPrice = priceHistory[priceHistory.length - 2].price;
      
      if (recentPrice > previousPrice) {
        optimizations.push('Prices trending up - consider larger orders to lock in current rates');
      } else {
        optimizations.push('Prices declining - smaller orders may be more cost-effective');
      }
    }

    // Bulk ordering
    if (ingredient.minimumOrderQuantity > 10) {
      optimizations.push('Large MOQ - coordinate with other restaurants for bulk purchasing');
    }

    return optimizations;
  }

  private generateSeasonalConsiderations(ingredient: Ingredient): string[] {
    const considerations = [];
    const currentMonth = new Date().getMonth() + 1;
    
    if (ingredient.seasonality.peakMonths.includes(currentMonth)) {
      considerations.push('Currently in peak season - best quality and pricing');
    }
    
    if (ingredient.seasonality.lowMonths.includes(currentMonth)) {
      considerations.push('Off-season - consider alternatives or preserved options');
    }

    return considerations;
  }

  private findAlternativeIngredients(ingredient: Ingredient): Ingredient[] {
    return Array.from(this.ingredients.values())
      .filter(alt => 
        alt.id !== ingredient.id && 
        alt.category === ingredient.category &&
        alt.currentPrice < ingredient.currentPrice
      )
      .slice(0, 3);
  }

  private calculateUrgency(forecast: InventoryForecast): number {
    const daysUntilStockout = this.calculateDaysUntilStockout(
      forecast.projectedUsage,
      forecast.currentStock
    );
    return Math.max(0, forecast.ingredient.leadTime + 2 - daysUntilStockout);
  }

  private calculateDaysUntilStockout(projectedUsage: any[], currentStock: number): number {
    let remainingStock = currentStock;
    
    for (let i = 0; i < projectedUsage.length; i++) {
      remainingStock -= projectedUsage[i].quantity;
      if (remainingStock <= 0) {
        return i + 1;
      }
    }
    
    return projectedUsage.length + 1;
  }

  private groupIngredientsBySupplier(
    requiredIngredients: Array<{ ingredientId: string; quantity: number }>
  ): Map<string, Array<{ ingredientId: string; quantity: number }>> {
    const supplierGroups = new Map();

    requiredIngredients.forEach(item => {
      const ingredient = this.ingredients.get(item.ingredientId);
      if (!ingredient) return;

      // Find best supplier for this ingredient
      const bestSupplier = ingredient.suppliers.reduce((best, supplier) => {
        const score = supplier.reliability * 0.4 + supplier.qualityRating * 20 + supplier.priceCompetitiveness * 0.4;
        const bestScore = best.reliability * 0.4 + best.qualityRating * 20 + best.priceCompetitiveness * 0.4;
        return score > bestScore ? supplier : best;
      });

      if (!supplierGroups.has(bestSupplier.id)) {
        supplierGroups.set(bestSupplier.id, []);
      }
      supplierGroups.get(bestSupplier.id).push(item);
    });

    return supplierGroups;
  }

  private calculateShippingCost(supplier: Supplier, orderValue: number): number {
    // Mock shipping calculation
    if (orderValue > supplier.minimumOrder * 2) return 0; // Free shipping for large orders
    return Math.min(50, supplier.location.distance * 0.5);
  }

  private calculateDeliveryDate(supplier: Supplier): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (supplier.deliveryOptions.nextDay ? 1 : 2));
    return deliveryDate.toISOString().split('T')[0];
  }

  private calculateOrderSustainability(
    supplier: Supplier,
    ingredients: Array<{ ingredientId: string; quantity: number }>
  ): number {
    let totalScore = supplier.sustainabilityRating;
    
    ingredients.forEach(item => {
      const ingredient = this.ingredients.get(item.ingredientId);
      if (ingredient) {
        totalScore += ingredient.sustainabilityScore;
      }
    });

    return totalScore / (ingredients.length + 1);
  }

  private calculateCostSavings(
    supplier: Supplier,
    ingredients: Array<{ ingredientId: string; quantity: number }>
  ): number {
    // Mock cost savings calculation
    return supplier.priceCompetitiveness > 80 ? 50 : 0;
  }

  private generateOrderReasoning(
    supplier: Supplier,
    ingredients: Array<{ ingredientId: string; quantity: number }>
  ): string[] {
    const reasoning = [];
    
    if (supplier.reliability > 90) {
      reasoning.push('High reliability supplier - consistent on-time deliveries');
    }
    
    if (supplier.qualityRating >= 4.0) {
      reasoning.push('Excellent quality rating from other restaurants');
    }
    
    if (supplier.sustainabilityRating > 85) {
      reasoning.push('Strong sustainability practices align with eco-friendly goals');
    }

    return reasoning;
  }

  private findSeasonalAlternative(ingredient: Ingredient): Ingredient | null {
    const currentMonth = new Date().getMonth() + 1;
    
    // Find ingredients in the same category that are in peak season
    const alternatives = Array.from(this.ingredients.values()).filter(alt =>
      alt.id !== ingredient.id &&
      alt.category === ingredient.category &&
      alt.seasonality.peakMonths.includes(currentMonth)
    );

    return alternatives.length > 0 ? alternatives[0] : null;
  }

  private calculateNutritionalImpact(currentIngredients: any[], optimizedIngredients: any[]) {
    // Mock nutritional impact calculation
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  }

  private generateSeasonalAdvantages(optimizedIngredients: any[]): string[] {
    return ['Peak season quality', 'Lower transportation costs', 'Supporting local suppliers'];
  }

  private getWasteData(restaurantId: string, ingredientId: string) {
    // Mock waste data
    return {
      totalPurchased: 100,
      totalWaste: 15,
      reasons: [
        { reason: 'spoilage' as const, percentage: 60 },
        { reason: 'over_ordering' as const, percentage: 25 },
        { reason: 'preparation_waste' as const, percentage: 15 },
      ],
    };
  }

  private generateWasteReductionSuggestions(ingredient: Ingredient, wasteData: any): string[] {
    const suggestions = [];
    
    if (wasteData.reasons.find((r: any) => r.reason === 'spoilage' && r.percentage > 50)) {
      suggestions.push('Reduce order quantities or frequency to minimize spoilage');
      suggestions.push('Implement FIFO (First In, First Out) inventory rotation');
    }
    
    if (ingredient.shelfLife < 7) {
      suggestions.push('Consider switching to frozen or preserved alternatives');
    }

    return suggestions;
  }

  private findBetterShelfLifeOptions(ingredient: Ingredient): Ingredient[] {
    return Array.from(this.ingredients.values())
      .filter(alt => 
        alt.category === ingredient.category &&
        alt.shelfLife > ingredient.shelfLife
      )
      .slice(0, 2);
  }

  private getSeasonalFactor(ingredientId: string, date: Date): number {
    const ingredient = this.ingredients.get(ingredientId);
    if (!ingredient) return 1;

    const month = date.getMonth() + 1;
    if (ingredient.seasonality.peakMonths.includes(month)) return 1.2;
    if (ingredient.seasonality.lowMonths.includes(month)) return 0.8;
    return 1;
  }

  private getWeekdayFactor(date: Date): number {
    const dayOfWeek = date.getDay();
    // Weekend factor - restaurants typically busier on weekends
    return [0.7, 1.0, 1.0, 1.0, 1.1, 1.3, 1.2][dayOfWeek];
  }
}

// Export singleton instance
export const supplyChainManager = new SupplyChainManager();
