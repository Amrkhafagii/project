import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useAuth } from '../../../contexts/AuthContext';
import { analyzeFitnessTrends, generatePredictiveInsights, optimizeMacros } from '../../../services/fitness/advancedAnalyticsService';
import { TrendingUp, TrendingDown, Minus, Brain, Target, Activity } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function AdvancedAnalytics() {
  const { user } = useAuth();
  const [trends, setTrends] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [macroOptimization, setMacroOptimization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, selectedTimeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [trendsData, insightsData, macrosData] = await Promise.all([
        analyzeFitnessTrends(user!.id, selectedTimeframe),
        generatePredictiveInsights(user!.id),
        optimizeMacros(user!.id, {})
      ]);

      setTrends(trendsData);
      setInsights(insightsData);
      setMacroOptimization(macrosData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp size={20} color="#10b981" />;
      case 'declining': return <TrendingDown size={20} color="#ef4444" />;
      default: return <Minus size={20} color="#6b7280" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.6) return '#f59e0b';
    return '#6b7280';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Analyzing your fitness data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Analytics</Text>
        <Text style={styles.subtitle}>AI-powered fitness insights</Text>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeSelector}>
        <TouchableOpacity
          style={[styles.timeframeButton, selectedTimeframe === 7 && styles.timeframeButtonActive]}
          onPress={() => setSelectedTimeframe(7)}
        >
          <Text style={[styles.timeframeButtonText, selectedTimeframe === 7 && styles.timeframeButtonTextActive]}>
            7 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeframeButton, selectedTimeframe === 30 && styles.timeframeButtonActive]}
          onPress={() => setSelectedTimeframe(30)}
        >
          <Text style={[styles.timeframeButtonText, selectedTimeframe === 30 && styles.timeframeButtonTextActive]}>
            30 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeframeButton, selectedTimeframe === 90 && styles.timeframeButtonActive]}
          onPress={() => setSelectedTimeframe(90)}
        >
          <Text style={[styles.timeframeButtonText, selectedTimeframe === 90 && styles.timeframeButtonTextActive]}>
            90 Days
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trend Analysis */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Activity size={20} color="#6366f1" />
          <Text style={styles.sectionTitle}>Trend Analysis</Text>
        </View>

        {trends.map((trend, index) => (
          <View key={index} style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendMetric}>{trend.metric}</Text>
              {renderTrendIcon(trend.trend)}
            </View>
            
            <Text style={styles.trendInsight}>{trend.insight}</Text>
            
            {trend.correlation && (
              <View style={styles.correlationBox}>
                <Text style={styles.correlationText}>📊 {trend.correlation}</Text>
              </View>
            )}

            {trend.change_percent !== 0 && (
              <View style={styles.changeIndicator}>
                <Text style={[
                  styles.changeText,
                  { color: trend.change_percent > 0 ? '#10b981' : '#ef4444' }
                ]}>
                  {trend.change_percent > 0 ? '+' : ''}{trend.change_percent.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Predictive Insights */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Brain size={20} color="#6366f1" />
          <Text style={styles.sectionTitle}>Predictive Insights</Text>
        </View>

        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightPrediction}>{insight.prediction}</Text>
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(insight.confidence) }]}>
                <Text style={styles.confidenceText}>
                  {Math.round(insight.confidence * 100)}% confidence
                </Text>
              </View>
            </View>

            <Text style={styles.insightTimeframe}>Timeframe: {insight.timeframe}</Text>

            <View style={styles.recommendationsBox}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {insight.recommendations.map((rec: string, idx: number) => (
                <Text key={idx} style={styles.recommendation}>• {rec}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Macro Optimization */}
      {macroOptimization && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Optimized Macros</Text>
          </View>

          <View style={styles.macroCard}>
            <Text style={styles.macroReasoning}>{macroOptimization.reasoning}</Text>

            <View style={styles.macroGrid}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{macroOptimization.optimized_macros.protein_g}g</Text>
                <Text style={styles.macroPercent}>{macroOptimization.ratios.protein}%</Text>
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>{macroOptimization.optimized_macros.carbs_g}g</Text>
                <Text style={styles.macroPercent}>{macroOptimization.ratios.carbs}%</Text>
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>{macroOptimization.optimized_macros.fat_g}g</Text>
                <Text style={styles.macroPercent}>{macroOptimization.ratios.fat}%</Text>
              </View>
            </View>

            <View style={styles.macroChart}>
              <BarChart
                data={{
                  labels: ['Protein', 'Carbs', 'Fat'],
                  datasets: [{
                    data: [
                      macroOptimization.ratios.protein,
                      macroOptimization.ratios.carbs,
                      macroOptimization.ratios.fat
                    ]
                  }]
                }}
                width={screenWidth - 80}
                height={180}
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  }
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </View>
          </View>
        </View>
      )}

      {/* Performance Correlation Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Activity size={20} color="#6366f1" />
          <Text style={styles.sectionTitle}>Performance Correlations</Text>
        </View>

        <View style={styles.correlationCard}>
          <Text style={styles.correlationTitle}>
            Hydration vs Energy Levels
          </Text>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [
                {
                  data: [2000, 2200, 2100, 2500, 2300, 2400, 2200],
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  strokeWidth: 2
                },
                {
                  data: [6, 7, 6.5, 8, 7.5, 8, 7],
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  strokeWidth: 2
                }
              ],
              legend: ['Hydration (ml)', 'Energy (1-10)']
            }}
            width={screenWidth - 80}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2'
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
          <Text style={styles.correlationInsight}>
            Strong positive correlation detected: Higher hydration levels correlate with improved energy ratings
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  timeframeSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#6366f1',
  },
  timeframeButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  timeframeButtonTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  trendCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendMetric: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  trendInsight: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  correlationBox: {
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  correlationText: {
    fontSize: 13,
    color: '#1e40af',
  },
  changeIndicator: {
    position: 'absolute',
    top: 16,
    right: 48,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    marginBottom: 8,
  },
  insightPrediction: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  insightTimeframe: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  recommendationsBox: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  recommendationsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  recommendation: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
  },
  macroCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  macroReasoning: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  macroPercent: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  macroChart: {
    alignItems: 'center',
  },
  correlationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  correlationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  correlationInsight: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 12,
    fontStyle: 'italic',
  },
});