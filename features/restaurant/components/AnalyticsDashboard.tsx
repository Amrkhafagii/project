import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Calendar, TrendingUp, Clock, Filter, ArrowUp, ArrowDown, Users, DollarSign, Package, Utensils } from 'lucide-react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { menuIntelligenceEngine } from '@/services/restaurant/menuIntelligence';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsDashboardProps {
  restaurantId: string;
}

export function AnalyticsDashboard({ restaurantId }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [loading, setLoading] = useState(true);
  const [menuPerformance, setMenuPerformance] = useState<any[]>([]);
  
  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);
  
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analytics = await menuIntelligenceEngine.analyzeMenuPerformance(restaurantId, timeRange);
      setMenuPerformance(analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for sales charts
  const salesData = {
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [350, 420, 380, 490, 550, 690, 520],
      }]
    },
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        data: [2100, 2450, 2800, 2350],
      }]
    },
    quarter: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        data: [8200, 7800, 9100],
      }]
    }
  };

  // Mock data for order volume
  const orderVolumeData = {
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [25, 32, 28, 36, 42, 55, 40],
      }]
    },
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        data: [168, 180, 205, 175],
      }]
    },
    quarter: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        data: [640, 600, 710],
      }]
    }
  };

  // Mock data for popular items
  const popularItems = [
    { name: 'Grilled Salmon Power Bowl', sales: 120, revenue: 2279, percentage: 15 },
    { name: 'Lean Chicken Mediterranean', sales: 105, revenue: 1733, percentage: 13 },
    { name: 'Protein-Packed Quinoa Bowl', sales: 90, revenue: 1349, percentage: 11 },
    { name: 'Keto Power Plate', sales: 85, revenue: 1699, percentage: 10 },
  ];

  // Meal time distribution data for pie chart
  const mealTimeData = [
    { name: 'Breakfast', sales: 15, color: '#FCD34D', legendFontColor: '#111827', legendFontSize: 12 },
    { name: 'Lunch', sales: 40, color: '#60A5FA', legendFontColor: '#111827', legendFontSize: 12 },
    { name: 'Dinner', sales: 35, color: '#10B981', legendFontColor: '#111827', legendFontSize: 12 },
    { name: 'Snacks', sales: 10, color: '#F472B6', legendFontColor: '#111827', legendFontSize: 12 },
  ];
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
  };
  
  // Mock insights data
  const insights = [
    { 
      title: 'Popular Items Revenue Growth', 
      detail: 'Your top-selling items have increased revenue by 12% compared to last period', 
      icon: <TrendingUp size={20} color="#10B981" />,
      trend: 'up',
      value: '+12%'
    },
    { 
      title: 'Peak Order Hours', 
      detail: 'Most orders occur between 12-2 PM and 6-8 PM. Consider optimizing kitchen staffing.',
      icon: <Clock size={20} color="#3B82F6" />,
      trend: 'neutral',
      value: '12-2PM, 6-8PM'
    },
    { 
      title: 'Customer Return Rate', 
      detail: '35% of your customers are repeat visitors within the month',
      icon: <Users size={20} color="#8B5CF6" />,
      trend: 'up',
      value: '35%'
    },
  ];

  const getActivityMetrics = () => {
    if (timeRange === 'week') {
      return {
        totalOrders: 245,
        totalRevenue: 4270.50,
        averageOrder: 17.43,
        topSellingItem: 'Grilled Salmon Power Bowl'
      };
    } else if (timeRange === 'month') {
      return {
        totalOrders: 928,
        totalRevenue: 16430.75,
        averageOrder: 17.70,
        topSellingItem: 'Grilled Salmon Power Bowl'
      };
    } else {
      return {
        totalOrders: 2950,
        totalRevenue: 52360.20,
        averageOrder: 17.75,
        topSellingItem: 'Grilled Salmon Power Bowl'
      };
    }
  };

  const metrics = getActivityMetrics();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Time Range Selector */}
      <View style={styles.timeRangeSelector}>
        {(['week', 'month', 'quarter'] as const).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeButtonText,
                timeRange === range && styles.timeRangeButtonTextActive,
              ]}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardIcon}>
            <Package size={20} color="#FFFFFF" />
          </View>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryCardLabel}>Total Orders</Text>
            <Text style={styles.summaryCardValue}>{metrics.totalOrders}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryCardIcon, { backgroundColor: '#3B82F6' }]}>
            <DollarSign size={20} color="#FFFFFF" />
          </View>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryCardLabel}>Revenue</Text>
            <Text style={styles.summaryCardValue}>${metrics.totalRevenue.toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryCardIcon, { backgroundColor: '#F59E0B' }]}>
            <DollarSign size={20} color="#FFFFFF" />
          </View>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryCardLabel}>Avg. Order</Text>
            <Text style={styles.summaryCardValue}>${metrics.averageOrder.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryCardIcon, { backgroundColor: '#8B5CF6' }]}>
            <Utensils size={20} color="#FFFFFF" />
          </View>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryCardLabel}>Top Item</Text>
            <Text style={styles.summaryCardValue} numberOfLines={1}>
              {metrics.topSellingItem}
            </Text>
          </View>
        </View>
      </View>

      {/* Sales Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Revenue Trend</Text>
        <LineChart
          data={salesData[timeRange]}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#10B981',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Order Volume Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Order Volume</Text>
        <BarChart
          data={orderVolumeData[timeRange]}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>

      {/* Meal Time Distribution */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Order Time Distribution</Text>
        <PieChart
          data={mealTimeData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="sales"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Popular Items */}
      <View style={styles.popularItemsCard}>
        <Text style={styles.chartTitle}>Popular Items</Text>
        {popularItems.map((item, index) => (
          <View key={index} style={styles.popularItemRow}>
            <View style={styles.popularItemInfo}>
              <Text style={styles.popularItemRank}>{index + 1}</Text>
              <Text style={styles.popularItemName}>{item.name}</Text>
            </View>
            <View style={styles.popularItemMetrics}>
              <Text style={styles.popularItemSales}>{item.sales} orders</Text>
              <Text style={styles.popularItemRevenue}>${item.revenue}</Text>
              <View style={styles.popularItemPercentage}>
                <View 
                  style={[
                    styles.popularItemPercentageFill, 
                    { width: `${item.percentage}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Insights */}
      <View style={styles.insightsCard}>
        <Text style={styles.chartTitle}>Key Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <View style={styles.insightIcon}>
              {insight.icon}
            </View>
            <View style={styles.insightContent}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                {insight.trend === 'up' && (
                  <View style={styles.insightTrend}>
                    <ArrowUp size={12} color="#10B981" />
                    <Text style={styles.insightTrendTextUp}>{insight.value}</Text>
                  </View>
                )}
                {insight.trend === 'down' && (
                  <View style={styles.insightTrend}>
                    <ArrowDown size={12} color="#EF4444" />
                    <Text style={styles.insightTrendTextDown}>{insight.value}</Text>
                  </View>
                )}
                {insight.trend === 'neutral' && (
                  <View style={styles.insightTrend}>
                    <Text style={styles.insightTrendTextNeutral}>{insight.value}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.insightDetail}>{insight.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Menu Performance */}
      <View style={styles.menuPerformanceCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.chartTitle}>Menu Performance</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.performanceItemHeader}>
          <Text style={styles.performanceItemColumn}>Item</Text>
          <Text style={styles.performanceItemColumn}>Sales</Text>
          <Text style={styles.performanceItemColumn}>Revenue</Text>
          <Text style={styles.performanceItemColumn}>Trend</Text>
        </View>

        {menuPerformance.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.performanceItemRow}>
            <Text style={styles.performanceItemName} numberOfLines={1}>{item.menuItem?.name || `Item ${index + 1}`}</Text>
            <Text style={styles.performanceItemSales}>{item.performance?.totalSales || `${50 + index * 10}`}</Text>
            <Text style={styles.performanceItemRevenue}>${item.performance?.totalRevenue?.toFixed(0) || `${950 + index * 100}`}</Text>
            <View style={styles.performanceItemTrend}>
              {(item.trends?.salesGrowth > 0) ? (
                <ArrowUp size={14} color="#10B981" />
              ) : (
                <ArrowDown size={14} color="#EF4444" />
              )}
            </View>
          </View>
        ))}

        {!loading && menuPerformance.length === 0 && (
          <Text style={styles.noDataText}>No menu performance data available</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeRangeButtonTextActive: {
    color: '#10B981',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryCardContent: {
    flex: 1,
  },
  summaryCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    paddingRight: 16,
  },
  popularItemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  popularItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  popularItemRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    width: 24,
  },
  popularItemName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  popularItemMetrics: {
    alignItems: 'flex-end',
  },
  popularItemSales: {
    fontSize: 12,
    color: '#6B7280',
  },
  popularItemRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
    marginBottom: 4,
  },
  popularItemPercentage: {
    width: 80,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  popularItemPercentageFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  insightTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightTrendTextUp: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 2,
  },
  insightTrendTextDown: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 2,
  },
  insightTrendTextNeutral: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  insightDetail: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  menuPerformanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  performanceItemHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  performanceItemColumn: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  performanceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  performanceItemName: {
    flex: 2,
    fontSize: 14,
    color: '#111827',
  },
  performanceItemSales: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
  performanceItemRevenue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  performanceItemTrend: {
    flex: 1,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 16,
  },
});
