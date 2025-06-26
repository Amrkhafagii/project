import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Flame, TrendingUp, TrendingDown } from 'lucide-react-native';
import { calculateEnergyBalance, EnergyBalance } from '../../services/fitness/enhancedFitnessService';
import { useAuth } from '../../contexts/AuthContext';

interface EnergyBalanceCardProps {
  date: string;
}

export default function EnergyBalanceCard({ date }: EnergyBalanceCardProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<EnergyBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    loadEnergyBalance();
  }, [date, user]);

  useEffect(() => {
    if (balance) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [balance]);

  const loadEnergyBalance = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await calculateEnergyBalance(user.id, date);
      setBalance(data);
    } catch (error) {
      console.error('Error loading energy balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !balance) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Calculating energy balance...</Text>
        </View>
      </View>
    );
  }

  const isDeficit = balance.balance < 0;
  const isSurplus = balance.balance > 0;
  const balanceColor = isDeficit ? '#EF4444' : isSurplus ? '#10B981' : '#6B7280';

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.1, 1],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Flame size={24} color="#EF4444" />
          <Text style={styles.title}>Energy Balance</Text>
        </View>
        {isDeficit ? (
          <TrendingDown size={20} color="#EF4444" />
        ) : isSurplus ? (
          <TrendingUp size={20} color="#10B981" />
        ) : null}
      </View>

      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceValue, { color: balanceColor }]}>
          {balance.balance > 0 ? '+' : ''}{balance.balance} kcal
        </Text>
        <Text style={styles.balanceLabel}>
          {isDeficit ? 'Deficit' : isSurplus ? 'Surplus' : 'Balanced'}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Intake</Text>
            <Text style={styles.detailValue}>{balance.intake} kcal</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Burned</Text>
            <Text style={styles.detailValue}>{balance.burned} kcal</Text>
          </View>
        </View>

        <View style={styles.tdeeRow}>
          <Text style={styles.tdeeLabel}>Base Metabolism (TDEE)</Text>
          <Text style={styles.tdeeValue}>{balance.tdee} kcal</Text>
        </View>
      </View>

      <View style={[styles.progressBar, { backgroundColor: '#F3F4F6' }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min((balance.intake / balance.burned) * 100, 100)}%`,
              backgroundColor: balanceColor,
            },
          ]}
        />
      </View>
    </Animated.View>
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
  loadingState: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  detailsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  tdeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tdeeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  tdeeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
