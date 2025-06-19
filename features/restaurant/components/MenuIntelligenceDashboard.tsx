import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { menuIntelligenceEngine } from '@/services/restaurant/menuIntelligence';
import { TrendingUp, ArrowUpRight, ChartBar as BarChart3, CircleAlert as AlertCircle, DollarSign, ArrowRight, Users, Compass, Clock, Calendar, Sun, CloudRain, Zap } from 'lucide-react-native';

interface MenuIntelligenceDashboardProps {
  restaurantId: string;
}

export function MenuIntelligenceDashboard({ restaurantId }: MenuIntelligenceDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pricing' | 'demand' | 'competition'>('pricing');
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('salmon_bowl');
  const [loading, setLoading] = useState<boolean>(false);
  const [priceOptimization, setPriceOptimization] = useState<any>(null);
  const [demandForecast, setDemandForecast] = useState<any>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<any>(null);
  const [inventory, setInventory] = useState<number>(20);
  const [timeOfDay, setTimeOfDay] = useState<number>(new Date().getHours());
  const [currentDemand, setCurrentDemand] = useState<number>(75);
  const [currentWeather, setCurrentWeather] = useState<'sunny' | 'cloudy' | 'rain' | 'snow'>('sunny');
  const [events, setEvents] = useState<string[]>([]);
  
  const menuItems = [
    { id: 'salmon_bowl', name: 'Grilled Salmon Power Bowl', price: 18.99, category: 'Main Dishes' },
    { id: 'chicken_bowl', name: 'Lean Chicken Mediterranean', price: 16.50, category: 'Main Dishes' },
  ];

  // Load initial data
  useEffect(() => {
    if (selectedMenuItem) {
      loadData();
    }
  }, [selectedMenuItem]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load price optimization data
      const priceData = await menuIntelligenceEngine.optimizeMenuPricing(selectedMenuItem, {
        targetProfitMargin: 65,
        competitorAnalysis: true,
        demandElasticity: true,
      });
      setPriceOptimization(priceData);

      // Load demand forecast data
      const demandData = await menuIntelligenceEngine.generateDemandForecast(selectedMenuItem);
      setDemandForecast(demandData);

      // Load competitor analysis
      const competitorData = await menuIntelligenceEngine.analyzeCompetitorLandscape(restaurantId);
      setCompetitorAnalysis(competitorData);

    } catch (error) {
      console.error('Failed to load menu intelligence data:', error);
      Alert.alert('Error', 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const generateDynamicPrice = async () => {
    setLoading(true);
    try {
      const dynamicPriceData = await menuIntelligenceEngine.generateDynamicPricing(
        selectedMenuItem,
        {
          currentDemand,
          timeOfDay,
          dayOfWeek: new Date().getDay(),
          weather: currentWeather,
          events,
          inventory,
        }
      );

      Alert.alert(
        'Dynamic Price Suggestion',
        `Suggested price: $${dynamicPriceData.suggestedPrice.toFixed(2)}\n\nReasoning:\n${dynamicPriceData.reasoning.join('\n')}\n\n${dynamicPriceData.expectedImpact}`,
        [{ text: 'Apply', onPress: () => console.log('Applied dynamic price') }, { text: 'Cancel' }]
      );
    } catch (error) {
      console.error('Failed to generate dynamic price:', error);
      Alert.alert('Error', 'Failed to generate dynamic price');
    } finally {
      setLoading(false);
    }
  };

  const renderPricingTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.menuItemSelector}>
        <Text style={styles.sectionTitle}>Select Menu Item</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.menuItemList}
        >
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItemButton,
                selectedMenuItem === item.id && styles.menuItemButtonActive,
              ]}
              onPress={() => setSelectedMenuItem(item.id)}
            >
              <Text style={[
                styles.menuItemButtonText,
                selectedMenuItem === item.id && styles.menuItemButtonTextActive,
              ]}>
                {item.name}
              </Text>
              <Text style={[
                styles.menuItemPrice,
                selectedMenuItem === item.id && styles.menuItemPriceActive,
              ]}>
                ${item.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !priceOptimization ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Analyzing pricing data...</Text>
        </View>
      ) : priceOptimization ? (
        <View>
          {/* Price Suggestion Card */}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Price Optimization</Text>
              <View style={styles.confidenceIndicator}>
                <Text style={styles.confidenceText}>
                  {Math.round(priceOptimization.confidence * 100)}% confidence
                </Text>
              </View>
            </View>

            <View style={styles.priceComparisonContainer}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Current Price</Text>
                <Text style={styles.priceValue}>${priceOptimization.currentPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.priceArrow}>
                <ArrowRight size={20} color="#6B7280" />
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Suggested Price</Text>
                <Text style={[
                  styles.priceValue,
                  styles.suggestedPrice
                ]}>
                  ${priceOptimization.suggestedPrice.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.pricingImpactContainer}>
              <View style={styles.impactItem}>
                <Text style={styles.impactLabel}>Demand Impact</Text>
                <Text style={[
                  styles.impactValue,
                  priceOptimization.expectedDemandChange >= 0 ? styles.positiveValue : styles.negativeValue
                ]}>
                  {priceOptimization.expectedDemandChange.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.impactItem}>
                <Text style={styles.impactLabel}>Revenue Impact</Text>
                <Text style={[
                  styles.impactValue,
                  priceOptimization.expectedRevenueChange >= 0 ? styles.positiveValue : styles.negativeValue
                ]}>
                  {priceOptimization.expectedRevenueChange.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Pricing Reasoning</Text>
            </View>
            <View style={styles.reasoningList}>
              {priceOptimization.reasoning.map((reason: string, index: number) => (
                <View key={index} style={styles.reasoningItem}>
                  <Text style={styles.reasoningText}>• {reason}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Competitor Pricing */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Competitor Prices</Text>
            <View style={styles.competitorList}>
              {priceOptimization.competitorPrices.map((competitor: any, index: number) => (
                <View key={index} style={styles.competitorItem}>
                  <View style={styles.competitorInfo}>
                    <Text style={styles.competitorName}>{competitor.competitor}</Text>
                    <Text style={styles.competitorDistance}>{competitor.distance.toFixed(1)} km away</Text>
                  </View>
                  <Text style={styles.competitorPrice}>${competitor.price.toFixed(2)}</Text>
                </View>
              ))}
              <View style={styles.competitorItem}>
                <View style={styles.competitorInfo}>
                  <Text style={[styles.competitorName, { color: '#10B981', fontWeight: '600' }]}>Your Price</Text>
                  <Text style={styles.competitorDistance}>Current</Text>
                </View>
                <Text style={[styles.competitorPrice, { color: '#10B981', fontWeight: '600' }]}>
                  ${priceOptimization.currentPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Dynamic Pricing */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Dynamic Pricing Engine</Text>
            <Text style={styles.cardDescription}>
              Adjust factors to generate real-time pricing based on current conditions
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Current Inventory</Text>
              <TextInput
                style={styles.formInput}
                value={inventory.toString()}
                onChangeText={(text) => setInventory(parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="Inventory amount"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Current Demand (0-100%)</Text>
              <TextInput
                style={styles.formInput}
                value={currentDemand.toString()}
                onChangeText={(text) => setCurrentDemand(parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="Current demand percentage"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Weather Condition</Text>
              <View style={styles.weatherButtons}>
                {(['sunny', 'cloudy', 'rain', 'snow'] as const).map((weather) => (
                  <TouchableOpacity
                    key={weather}
                    style={[
                      styles.weatherButton,
                      currentWeather === weather && styles.weatherButtonActive
                    ]}
                    onPress={() => setCurrentWeather(weather)}
                  >
                    <Text style={[
                      styles.weatherButtonText,
                      currentWeather === weather && styles.weatherButtonTextActive
                    ]}>
                      {weather.charAt(0).toUpperCase() + weather.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Special Events</Text>
              <View style={styles.eventButtons}>
                {['game_day', 'local_event', 'holiday'].map((event) => {
                  const isSelected = events.includes(event);
                  return (
                    <TouchableOpacity
                      key={event}
                      style={[
                        styles.eventButton,
                        isSelected && styles.eventButtonActive
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setEvents(events.filter(e => e !== event));
                        } else {
                          setEvents([...events, event]);
                        }
                      }}
                    >
                      <Text style={[
                        styles.eventButtonText,
                        isSelected && styles.eventButtonTextActive
                      ]}>
                        {event.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.generatePriceButton}
              onPress={generateDynamicPrice}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Zap size={16} color="#FFFFFF" />
                  <Text style={styles.generatePriceButtonText}>Generate Real-Time Price</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <AlertCircle size={48} color="#D1D5DB" />
          <Text style={styles.noDataTitle}>No pricing data available</Text>
          <Text style={styles.noDataDescription}>
            Select a menu item to see pricing recommendations
          </Text>
        </View>
      )}
    </View>
  );

  const renderDemandTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.menuItemSelector}>
        <Text style={styles.sectionTitle}>Select Menu Item</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.menuItemList}
        >
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItemButton,
                selectedMenuItem === item.id && styles.menuItemButtonActive,
              ]}
              onPress={() => setSelectedMenuItem(item.id)}
            >
              <Text style={[
                styles.menuItemButtonText,
                selectedMenuItem === item.id && styles.menuItemButtonTextActive,
              ]}>
                {item.name}
              </Text>
              <Text style={[
                styles.menuItemPrice,
                selectedMenuItem === item.id && styles.menuItemPriceActive,
              ]}>
                ${item.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !demandForecast ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Generating demand forecast...</Text>
        </View>
      ) : demandForecast ? (
        <View>
          {/* Demand Forecast Card */}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Demand Forecast</Text>
              <TouchableOpacity style={styles.refreshButton}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.forecastHeader}>
              <Text style={styles.forecastTitle}>7-Day Projection</Text>
              <Text style={styles.forecastDescription}>
                Based on historical patterns, seasonality, and market trends
              </Text>
            </View>

            {/* Daily Forecast */}
            <View style={styles.dailyForecastContainer}>
              {Array.from({ length: 3 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i + 1);
                
                // Group predictions by day and calculate totals
                const dayPredictions = demandForecast.predictions.filter((p: any) => 
                  p.date === date.toISOString().split('T')[0]
                );
                
                const totalDemand = dayPredictions.reduce(
                  (sum: number, p: any) => sum + p.predictedDemand, 
                  0
                );
                
                const avgConfidence = dayPredictions.reduce(
                  (sum: number, p: any) => sum + p.confidence, 
                  0
                ) / dayPredictions.length || 0;
                
                return (
                  <View key={i} style={styles.dailyForecast}>
                    <Text style={styles.forecastDay}>
                      {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    <View style={styles.forecastMetrics}>
                      <View style={styles.forecastMetric}>
                        <Text style={styles.forecastMetricValue}>{Math.round(totalDemand)}</Text>
                        <Text style={styles.forecastMetricLabel}>Orders</Text>
                      </View>
                      <View style={styles.forecastMetric}>
                        <Text style={styles.forecastMetricValue}>
                          {(avgConfidence * 100).toFixed(0)}%
                        </Text>
                        <Text style={styles.forecastMetricLabel}>Confidence</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Hourly Forecast */}
            <View style={styles.hourlyForecastContainer}>
              <Text style={styles.forecastSubtitle}>Peak Hours Tomorrow</Text>
              <View style={styles.hourlyForecastContent}>
                {Array.from({ length: 4 }, (_, i) => {
                  // Get tomorrow's date
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomorrowStr = tomorrow.toISOString().split('T')[0];
                  
                  // Find predictions for tomorrow sorted by demand
                  const tomorrowPredictions = demandForecast.predictions
                    .filter((p: any) => p.date === tomorrowStr)
                    .sort((a: any, b: any) => b.predictedDemand - a.predictedDemand);
                  
                  // Get the peak hours (top 4)
                  const peakHours = tomorrowPredictions.slice(0, 4);
                  const peakHour = peakHours[i] || { hour: 12 + i, predictedDemand: 10 + Math.random() * 20 };
                  
                  return (
                    <View key={i} style={styles.hourlyForecast}>
                      <Text style={styles.hourlyForecastTime}>
                        {peakHour.hour % 12 || 12}{peakHour.hour >= 12 ? 'PM' : 'AM'}
                      </Text>
                      <View style={styles.hourlyForecastBar}>
                        <View 
                          style={[
                            styles.hourlyForecastFill,
                            { width: `${Math.min(100, peakHour.predictedDemand * 2)}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.hourlyForecastValue}>
                        {Math.round(peakHour.predictedDemand)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            
            {/* Seasonal Insights */}
            <View style={styles.seasonalInsightsContainer}>
              <Text style={styles.forecastSubtitle}>Seasonal Insights</Text>
              <View style={styles.seasonalInsightsList}>
                {demandForecast.seasonalTrends.map((trend: any, index: number) => (
                  <View key={index} style={styles.seasonalInsightItem}>
                    <View style={styles.seasonalInsightHeader}>
                      <Text style={styles.seasonalInsightTitle}>{trend.period}</Text>
                      <View style={styles.multiplierBadge}>
                        <Text style={styles.multiplierBadgeText}>
                          {trend.multiplier > 1 ? '+' : ''}{((trend.multiplier - 1) * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.seasonalInsightDescription}>
                      {trend.reason}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Recommendations */}
            <View style={styles.recommendationsContainer}>
              <Text style={styles.forecastSubtitle}>Recommendations</Text>
              <View style={styles.recommendationsList}>
                {demandForecast.recommendations.map((recommendation: string, index: number) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Zap size={16} color="#10B981" />
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <AlertCircle size={48} color="#D1D5DB" />
          <Text style={styles.noDataTitle}>No demand forecast available</Text>
          <Text style={styles.noDataDescription}>
            Select a menu item to see demand predictions
          </Text>
        </View>
      )}
    </View>
  );

  const renderCompetitionTab = () => (
    <View style={styles.tabContent}>
      {loading && !competitorAnalysis ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Analyzing competitor landscape...</Text>
        </View>
      ) : competitorAnalysis ? (
        <View>
          {/* Market Position Card */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Market Position</Text>
            <View style={styles.marketPositionContainer}>
              <View style={styles.positionItem}>
                <Text style={styles.positionLabel}>Price Position</Text>
                <View style={[
                  styles.positionBadge,
                  competitorAnalysis.marketPosition.pricePosition === 'premium' ? styles.premiumBadge :
                  competitorAnalysis.marketPosition.pricePosition === 'budget' ? styles.budgetBadge :
                  styles.midRangeBadge
                ]}>
                  <Text style={styles.positionBadgeText}>
                    {competitorAnalysis.marketPosition.pricePosition.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.positionItem}>
                <Text style={styles.positionLabel}>Quality Position</Text>
                <View style={[
                  styles.positionBadge,
                  competitorAnalysis.marketPosition.qualityPosition === 'high' ? styles.highQualityBadge :
                  competitorAnalysis.marketPosition.qualityPosition === 'low' ? styles.lowQualityBadge :
                  styles.mediumQualityBadge
                ]}>
                  <Text style={styles.positionBadgeText}>
                    {competitorAnalysis.marketPosition.qualityPosition.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Competitive Advantages</Text>
            </View>
            <View style={styles.advantagesList}>
              {competitorAnalysis.marketPosition.competitiveAdvantages.map((advantage: string, index: number) => (
                <View key={index} style={styles.advantageItem}>
                  <ArrowUpRight size={16} color="#10B981" />
                  <Text style={styles.advantageText}>{advantage}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Threat Analysis</Text>
            </View>
            <View style={styles.threatsList}>
              {competitorAnalysis.marketPosition.threatAnalysis.map((threat: string, index: number) => (
                <View key={index} style={styles.threatItem}>
                  <AlertCircle size={16} color="#EF4444" />
                  <Text style={styles.threatText}>{threat}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Competitors Card */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Nearby Competitors</Text>
            <View style={styles.competitorsList}>
              {competitorAnalysis.competitors.map((competitor: any, index: number) => (
                <View key={index} style={styles.competitorDetailCard}>
                  <View style={styles.competitorHeader}>
                    <Text style={styles.competitorDetailName}>{competitor.name}</Text>
                    <View style={styles.competitorStats}>
                      <Text style={styles.competitorRating}>★ {competitor.rating.toFixed(1)}</Text>
                      <Text style={styles.competitorDistance}>{competitor.distance.toFixed(1)} km</Text>
                    </View>
                  </View>
                  <Text style={styles.competitorCuisine}>{competitor.cuisine}</Text>
                  <Text style={styles.competitorAvgPrice}>Avg. Price: ${competitor.averagePrice.toFixed(2)}</Text>
                  
                  <View style={styles.popularItemsSection}>
                    <Text style={styles.popularItemsTitle}>Popular Items</Text>
                    {competitor.popularItems.map((item: any, itemIndex: number) => (
                      <View key={itemIndex} style={styles.popularItemRow}>
                        <Text style={styles.popularItemName}>{item.name}</Text>
                        <Text style={styles.popularItemPrice}>${item.price.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Strategic Recommendations */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Strategic Recommendations</Text>
            <View style={styles.recommendationsList}>
              {competitorAnalysis.recommendations.map((recommendation: any, index: number) => (
                <View key={index} style={styles.strategicRecommendationItem}>
                  <View style={styles.recommendationHeader}>
                    <View style={[
                      styles.recommendationTypeBadge,
                      recommendation.type === 'pricing' ? styles.pricingTypeBadge :
                      recommendation.type === 'menu' ? styles.menuTypeBadge :
                      styles.positioningTypeBadge
                    ]}>
                      <Text style={styles.recommendationTypeBadgeText}>
                        {recommendation.type.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[
                      styles.recommendationEffortBadge,
                      recommendation.effort === 'low' ? styles.lowEffortBadge :
                      recommendation.effort === 'high' ? styles.highEffortBadge :
                      styles.mediumEffortBadge
                    ]}>
                      <Text style={styles.recommendationEffortBadgeText}>
                        {recommendation.effort.toUpperCase()} EFFORT
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recommendationContent}>{recommendation.recommendation}</Text>
                  <Text style={styles.recommendationImpact}>{recommendation.expectedImpact}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <AlertCircle size={48} color="#D1D5DB" />
          <Text style={styles.noDataTitle}>No competitor data available</Text>
          <Text style={styles.noDataDescription}>
            We're analyzing your local market to provide insights
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pricing' && styles.activeTab]}
          onPress={() => setActiveTab('pricing')}
        >
          <DollarSign
            size={16}
            color={activeTab === 'pricing' ? '#10B981' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'pricing' && styles.activeTabText]}>
            Dynamic Pricing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'demand' && styles.activeTab]}
          onPress={() => setActiveTab('demand')}
        >
          <TrendingUp
            size={16}
            color={activeTab === 'demand' ? '#10B981' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'demand' && styles.activeTabText]}>
            Demand Forecast
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'competition' && styles.activeTab]}
          onPress={() => setActiveTab('competition')}
        >
          <Compass
            size={16}
            color={activeTab === 'competition' ? '#10B981' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'competition' && styles.activeTabText]}>
            Competition
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'pricing' && renderPricingTab()}
        {activeTab === 'demand' && renderDemandTab()}
        {activeTab === 'competition' && renderCompetitionTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  menuItemList: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  menuItemButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemButtonActive: {
    backgroundColor: '#10B981',
  },
  menuItemButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  menuItemButtonTextActive: {
    color: '#FFFFFF',
  },
  menuItemPrice: {
    fontSize: 12,
    color: '#6B7280',
  },
  menuItemPriceActive: {
    color: '#ECFDF5',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: -12,
    marginBottom: 16,
  },
  confidenceIndicator: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  priceComparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  priceItem: {
    alignItems: 'center',
    flex: 1,
  },
  priceArrow: {
    marginHorizontal: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  suggestedPrice: {
    color: '#10B981',
  },
  pricingImpactContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  impactItem: {
    alignItems: 'center',
  },
  impactLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  positiveValue: {
    color: '#10B981',
  },
  negativeValue: {
    color: '#EF4444',
  },
  reasoningList: {
    marginBottom: 8,
  },
  reasoningItem: {
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 14,
    color: '#4B5563',
  },
  competitorList: {
    marginTop: 8,
  },
  competitorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  competitorInfo: {
    flex: 1,
  },
  competitorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  competitorDistance: {
    fontSize: 12,
    color: '#6B7280',
  },
  competitorPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  weatherButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weatherButton: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  weatherButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  weatherButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  weatherButtonTextActive: {
    color: '#FFFFFF',
  },
  eventButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventButton: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  eventButtonActive: {
    backgroundColor: '#EBF5FF',
    borderColor: '#3B82F6',
  },
  eventButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  eventButtonTextActive: {
    color: '#3B82F6',
  },
  generatePriceButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  generatePriceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  forecastHeader: {
    marginBottom: 16,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  forecastDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  dailyForecastContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 20,
  },
  dailyForecast: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  forecastDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  forecastMetrics: {
    flexDirection: 'row',
  },
  forecastMetric: {
    flex: 1,
  },
  forecastMetricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  forecastMetricLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  hourlyForecastContainer: {
    marginBottom: 20,
  },
  forecastSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  hourlyForecastContent: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  hourlyForecast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hourlyForecastTime: {
    width: 50,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  hourlyForecastBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  hourlyForecastFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  hourlyForecastValue: {
    width: 30,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  seasonalInsightsContainer: {
    marginBottom: 20,
  },
  seasonalInsightsList: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  seasonalInsightItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  seasonalInsightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  seasonalInsightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  multiplierBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  multiplierBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
  },
  seasonalInsightDescription: {
    fontSize: 14,
    color: '#4B5563',
  },
  recommendationsContainer: {},
  recommendationsList: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  marketPositionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  positionItem: {
    alignItems: 'center',
  },
  positionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  positionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  premiumBadge: {
    backgroundColor: '#EBF5FF',
  },
  midRangeBadge: {
    backgroundColor: '#FEF3C7',
  },
  budgetBadge: {
    backgroundColor: '#DCFCE7',
  },
  highQualityBadge: {
    backgroundColor: '#DCFCE7',
  },
  mediumQualityBadge: {
    backgroundColor: '#FEF3C7',
  },
  lowQualityBadge: {
    backgroundColor: '#FEE2E2',
  },
  positionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  advantagesList: {
    marginBottom: 16,
  },
  advantageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  advantageText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  threatsList: {
    marginBottom: 8,
  },
  threatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  threatText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  competitorsList: {},
  competitorDetailCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  competitorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  competitorDetailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  competitorStats: {
    alignItems: 'flex-end',
  },
  competitorRating: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 2,
  },
  competitorDistance: {
    fontSize: 12,
    color: '#6B7280',
  },
  competitorCuisine: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  competitorAvgPrice: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  popularItemsSection: {},
  popularItemsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  popularItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  popularItemName: {
    fontSize: 14,
    color: '#4B5563',
  },
  popularItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  recommendationsList: {},
  strategicRecommendationItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recommendationTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  pricingTypeBadge: {
    backgroundColor: '#DCFCE7',
  },
  menuTypeBadge: {
    backgroundColor: '#EBF5FF',
  },
  positioningTypeBadge: {
    backgroundColor: '#F3E8FF',
  },
  recommendationTypeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#111827',
  },
  recommendationEffortBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lowEffortBadge: {
    backgroundColor: '#DCFCE7',
  },
  mediumEffortBadge: {
    backgroundColor: '#FEF3C7',
  },
  highEffortBadge: {
    backgroundColor: '#FEE2E2',
  },
  recommendationEffortBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#111827',
  },
  recommendationContent: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendationImpact: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  refreshButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
});
