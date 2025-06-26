import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getCorrelationData } from '../../services/fitness/enhancedFitnessService';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface CorrelationChartProps {
  days?: number;
}

export default function CorrelationChart({ days = 7 }: CorrelationChartProps) {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCorrelationData();
  }, [user, days]);

  const loadCorrelationData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { workouts, nutritionByDate } = await getCorrelationData(user.id, days);
      
      // Prepare chart data
      const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toISOString().split('T')[0];
      });

      const proteinData = dates.map(date => nutritionByDate[date]?.protein_g || 0);
      const workoutData = dates.map(date => {
        const workout = workouts?.find(w => w.workout_date === date);
        return workout ? workout.calories_burned / 10 : 0; // Scale down for visualization
      });

      setChartData({
        labels: dates.map(date => {
          const d = new Date(date);
          return `${d.getMonth() + 1}/${d.getDate()}`;
        }),
        datasets: [
          {
            data: proteinData,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            strokeWidth: 2,
          },
          {
            data: workoutData,
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        legend: ['Protein (g)', 'Workout Intensity'],
      });
    } catch (error) {
      console.error('Error loading correlation data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !chartData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Performance Correlation</Text>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading correlation data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Correlation</Text>
      <Text style={styles.subtitle}>Protein Intake vs Workout Intensity</Text>
      
      <LineChart
        data={chartData}
        width={width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#FFFFFF',
          },
        }}
        bezier
        style={styles.chart}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Protein Intake</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Workout Intensity</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  loadingState: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
