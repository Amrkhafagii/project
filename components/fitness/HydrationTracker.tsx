import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Droplets, Plus } from 'lucide-react-native';
import { logHydration, getDailyHydration, getHydrationGoal } from '../../services/fitness/enhancedFitnessService';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface HydrationTrackerProps {
  date: string;
  onUpdate?: () => void;
}

export default function HydrationTracker({ date, onUpdate }: HydrationTrackerProps) {
  const { user } = useAuth();
  const [currentIntake, setCurrentIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [loading, setLoading] = useState(false);
  const animatedValue = new Animated.Value(0);

  const quickAddAmounts = [250, 500, 750, 1000]; // ml

  useEffect(() => {
    loadHydrationData();
  }, [date, user]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: currentIntake / dailyGoal,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentIntake, dailyGoal]);

  const loadHydrationData = async () => {
    if (!user) return;

    try {
      const [intake, goal] = await Promise.all([
        getDailyHydration(user.id, date),
        getHydrationGoal(user.id, date),
      ]);

      setCurrentIntake(intake);
      setDailyGoal(goal);
    } catch (error) {
      console.error('Error loading hydration data:', error);
    }
  };

  const addWater = async (amount: number) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      await logHydration({
        user_id: user.id,
        date,
        amount_ml: amount,
        time: new Date().toTimeString().split(' ')[0],
      });

      setCurrentIntake(prev => prev + amount);
      onUpdate?.();
    } catch (error) {
      console.error('Error logging hydration:', error);
    } finally {
      setLoading(false);
    }
  };

  const percentage = Math.min((currentIntake / dailyGoal) * 100, 100);
  const liters = (currentIntake / 1000).toFixed(1);
  const goalLiters = (dailyGoal / 1000).toFixed(1);

  const fillHeight = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Droplets size={24} color="#3B82F6" />
        <Text style={styles.title}>Hydration</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.glassContainer}>
          <Animated.View
            style={[
              styles.waterFill,
              {
                height: fillHeight,
              },
            ]}
          />
          <View style={styles.glassOverlay}>
            <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
            <Text style={styles.intakeText}>
              {liters}L / {goalLiters}L
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.quickAddContainer}>
        {quickAddAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[styles.quickAddButton, loading && styles.disabledButton]}
            onPress={() => addWater(amount)}
            disabled={loading}
          >
            <Plus size={16} color="#3B82F6" />
            <Text style={styles.quickAddText}>{amount}ml</Text>
          </TouchableOpacity>
        ))}
      </View>

      {percentage >= 100 && (
        <View style={styles.achievementBadge}>
          <Text style={styles.achievementText}>🎉 Hydration Goal Reached!</Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  glassContainer: {
    width: 120,
    height: 180,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#DBEAFE',
    overflow: 'hidden',
    position: 'relative',
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    opacity: 0.7,
  },
  glassOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  progressText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E40AF',
  },
  intakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 4,
  },
  quickAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAddButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quickAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
  achievementBadge: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  achievementText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
