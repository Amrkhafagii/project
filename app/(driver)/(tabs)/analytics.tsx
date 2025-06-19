import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  Calendar,
  Clock,
  MapPin,
  Star,
  Target,
  Award,
  DollarSign
} from 'lucide-react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsData {
  period: string;
  earnings: number[];
  deliveries: number[];
  ratings: number[];
  labels: string[];
}

export default function DriverAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const analyticsData: Record<string, AnalyticsData> = {
    week: {
      period: 'This Week',
      earnings: [45, 67, 89, 120, 156, 134, 98],
      deliveries: [8, 12, 16, 22, 28, 24, 18],
      ratings: [4.6, 4.7, 4.8, 4.9, 4.8, 4.9, 4.8],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    month: {
      period: 'This Month',
      earnings: [450, 567, 689, 720],
      deliveries: [85, 98, 112, 128],
      ratings: [4.6, 4.7, 4.8, 4.8],
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    },
    year: {
      period: 'This Year',
      earnings: [1800, 2100, 2400, 2650, 2800, 2900, 3100, 3200, 3000, 2800, 2600, 2400],
      deliveries: [320, 380, 420, 460, 480, 490, 520, 540, 500, 480, 450, 420],
      ratings: [4.5, 4.6, 4.7, 4.7, 4.8, 4.8, 4.9, 4.9, 4.8, 4.8, 4.7, 4.7],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
  };

  const currentData = analyticsData[selectedPeriod];

  // Performance metrics
  const metrics = {
    totalEarnings: currentData.earnings.reduce((sum, val) => sum + val, 0),
    totalDeliveries: currentData.deliveries.reduce((sum, val) => sum + val, 0),
    averageRating: currentData.ratings.reduce((sum, val) => sum + val, 0) / currentData.ratings.length,
    avgEarningsPerDelivery: currentData.earnings.reduce((sum, val) => sum + val, 0) / currentData.deliveries.reduce((sum, val) => sum + val, 0),
  };

  // Delivery time distribution
  const deliveryTimeData = [
    { name: 'Under 20min', population: 35, color: '#10B981', legendFontColor: '#111827', legendFontSize: 12 },
    { name: '20-30min', population: 45, color: '#F59E0B', legendFontColor: '#111827', legendFontSize: 12 },
    { name: '30-45min', population: 15, color: '#EF4444', legendFontColor: '#111827', legendFontSize: 12 },
    { name: 'Over 45min', population: 5, color: '#8B5CF6', legendFontColor: '#111827', legendFontSize: 12 },
  ];

  // Peak hours data
  const peakHoursData = {
    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
    datasets: [{
      data: [5, 15, 35, 20, 45, 25],
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    }],
  };

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#10B981',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <DollarSign size={24} color="#10B981" />
            <Text style={styles.metricValue}>${metrics.totalEarnings.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Total Earnings</Text>
          </View>
          <View style={styles.metricCard}>
            <MapPin size={24} color="#3B82F6" />
            <Text style={styles.metricValue}>{metrics.totalDeliveries}</Text>
            <Text style={styles.metricLabel}>Deliveries</Text>
          </View>
          <View style={styles.metricCard}>
            <Star size={24} color="#F59E0B" />
            <Text style={styles.metricValue}>{metrics.averageRating.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Avg Rating</Text>
          </View>
          <View style={styles.metricCard}>
            <Target size={24} color="#8B5CF6" />
            <Text style={styles.metricValue}>${metrics.avgEarningsPerDelivery.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Per Delivery</Text>
          </View>
        </View>

        {/* Earnings Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Earnings Trend</Text>
          <LineChart
            data={{
              labels: currentData.labels,
              datasets: [{
                data: currentData.earnings,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                strokeWidth: 3,
              }],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Deliveries Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Delivery Volume</Text>
          <BarChart
            data={{
              labels: currentData.labels,
              datasets: [{
                data: currentData.deliveries,
              }],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>

        {/* Peak Hours */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Peak Delivery Hours</Text>
          <BarChart
            data={peakHoursData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        {/* Delivery Time Distribution */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Delivery Time Distribution</Text>
          <PieChart
            data={deliveryTimeData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>

        {/* Performance Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Performance Insights</Text>
          
          <View style={styles.insightItem}>
            <TrendingUp size={20} color="#10B981" />
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Earnings Growth</Text>
              <Text style={styles.insightDescription}>
                Your earnings increased by 15% compared to last {selectedPeriod}
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Clock size={20} color="#F59E0B" />
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Average Delivery Time</Text>
              <Text style={styles.insightDescription}>
                You're delivering 20% faster than the average driver
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Star size={20} color="#8B5CF6" />
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Customer Satisfaction</Text>
              <Text style={styles.insightDescription}>
                Your rating is in the top 10% of all drivers
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Award size={20} color="#EF4444" />
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Peak Performance</Text>
              <Text style={styles.insightDescription}>
                You earn the most during 6-9 PM dinner rush hours
              </Text>
            </View>
          </View>
        </View>

        {/* Goals */}
        <View style={styles.goalsCard}>
          <Text style={styles.goalsTitle}>Weekly Goals</Text>
          
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalLabel}>Earnings Target</Text>
              <Text style={styles.goalProgress}>$687 / $800</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '86%' }]} />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalLabel}>Delivery Count</Text>
              <Text style={styles.goalProgress}>128 / 150</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '85%' }]} />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalLabel}>Rating Maintenance</Text>
              <Text style={styles.goalProgress}>4.8 / 4.5 ⭐</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%', backgroundColor: '#10B981' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  periodButtonActive: {
    borderBottomColor: '#10B981',
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#10B981',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  goalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
});
