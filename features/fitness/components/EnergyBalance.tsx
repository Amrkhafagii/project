import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Activity, Flame, TrendingUp, AlertCircle } from 'lucide-react-native';
import { Card } from '@/app/_components/common/Card';
import { Colors, Layout } from '@/constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { fitnessService } from '../services/fitnessService';
import { orderService } from '@/features/orders/services/orderService';
import { calculateTDEE } from '../utils/calculations';
import { FitnessProfile } from '../types';

export function EnergyBalance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [tdee, setTdee] = useState(0);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load fitness profile
      const profileData = await fitnessService.getFitnessProfile(user.id);
      setProfile(profileData);

      if (profileData) {
        // Calculate TDEE
        const calculatedTDEE = calculateTDEE(profileData);
        setTdee(calculatedTDEE);

        // Load today's consumed calories
        const today = new Date().toISOString().split('T')[0];
        const orders = await orderService.getOrdersByDate(user.id, today);
        
        const calories = orders.reduce((total, order) => {
          return total + (order.items?.reduce((itemTotal, item) => {
            return itemTotal + (item.menu_item?.calories || 0) * item.quantity;
          }, 0) || 0);
        }, 0);

        setTodayCalories(calories);
      } else {
        setError('Please complete your fitness profile to see energy balance');
      }
    } catch (err) {
      console.error('Error loading energy balance:', err);
      setError('Failed to load energy balance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card style={styles.container}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color={Colors.error} />
          <Text style={styles.errorText}>
            {error || 'Complete your fitness profile to track energy balance'}
          </Text>
        </View>
      </Card>
    );
  }

  const balance = tdee - todayCalories;
  const percentageConsumed = tdee > 0 ? (todayCalories / tdee) * 100 : 0;
  const isDeficit = balance > 0;

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Energy Balance</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <View style={styles.statHeader}>
            <Activity size={20} color={Colors.primary} />
            <Text style={styles.statLabel}>TDEE</Text>
          </View>
          <Text style={styles.statValue}>{tdee}</Text>
          <Text style={styles.statUnit}>cal/day</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <View style={styles.statHeader}>
            <Flame size={20} color={Colors.warning} />
            <Text style={styles.statLabel}>Consumed</Text>
          </View>
          <Text style={styles.statValue}>{todayCalories}</Text>
          <Text style={styles.statUnit}>calories</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <View style={styles.statHeader}>
            <TrendingUp size={20} color={isDeficit ? Colors.success : Colors.error} />
            <Text style={styles.statLabel}>Balance</Text>
          </View>
          <Text style={[styles.statValue, { color: isDeficit ? Colors.success : Colors.error }]}>
            {isDeficit ? '+' : ''}{balance}
          </Text>
          <Text style={styles.statUnit}>calories</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(percentageConsumed, 100)}%`,
                backgroundColor: percentageConsumed > 100 ? Colors.error : Colors.primary,
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {percentageConsumed.toFixed(0)}% of daily target
        </Text>
      </View>

      {profile.fitness_goal && (
        <Text style={styles.goalText}>
          Goal: {profile.fitness_goal.replace(/_/g, ' ')}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.xs,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  statUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Layout.spacing.sm,
  },
  progressContainer: {
    marginBottom: Layout.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Layout.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  goalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.md,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.sm,
    textAlign: 'center',
  },
});
