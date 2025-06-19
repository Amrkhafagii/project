import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  MapPin,
  Star
} from 'lucide-react-native';

interface EarningsData {
  period: string;
  totalEarnings: number;
  deliveries: number;
  hours: number;
  tips: number;
  bonus: number;
}

interface DeliveryRecord {
  id: string;
  date: string;
  restaurant: string;
  earnings: number;
  tip: number;
  distance: number;
  duration: number;
}

export default function DriverEarnings() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const earningsData: Record<string, EarningsData> = {
    today: {
      period: 'Today',
      totalEarnings: 156.75,
      deliveries: 8,
      hours: 6.5,
      tips: 32.50,
      bonus: 15.00,
    },
    week: {
      period: 'This Week',
      totalEarnings: 987.25,
      deliveries: 52,
      hours: 38.5,
      tips: 187.75,
      bonus: 45.00,
    },
    month: {
      period: 'This Month',
      totalEarnings: 3842.50,
      deliveries: 198,
      hours: 142.5,
      tips: 698.25,
      bonus: 180.00,
    },
  };

  const recentDeliveries: DeliveryRecord[] = [
    {
      id: '1',
      date: '2:30 PM',
      restaurant: 'Green Bowl Kitchen',
      earnings: 8.75,
      tip: 5.50,
      distance: 2.1,
      duration: 18,
    },
    {
      id: '2',
      date: '1:45 PM',
      restaurant: 'Protein Palace',
      earnings: 7.25,
      tip: 3.00,
      distance: 1.8,
      duration: 15,
    },
    {
      id: '3',
      date: '12:30 PM',
      restaurant: 'Macro Masters',
      earnings: 9.50,
      tip: 6.25,
      distance: 3.2,
      duration: 22,
    },
    {
      id: '4',
      date: '11:15 AM',
      restaurant: 'Healthy Bites',
      earnings: 6.75,
      tip: 2.75,
      distance: 1.5,
      duration: 12,
    },
  ];

  const currentData = earningsData[selectedPeriod];
  const hourlyRate = currentData.totalEarnings / currentData.hours;
  const avgPerDelivery = currentData.totalEarnings / currentData.deliveries;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['today', 'week', 'month'] as const).map((period) => (
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
                {period === 'today' ? 'Today' : period === 'week' ? 'Week' : 'Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Earnings Card */}
        <View style={styles.totalEarningsCard}>
          <View style={styles.totalEarningsHeader}>
            <DollarSign size={32} color="#10B981" />
            <Text style={styles.totalEarningsAmount}>
              ${currentData.totalEarnings.toFixed(2)}
            </Text>
          </View>
          <Text style={styles.totalEarningsPeriod}>{currentData.period}</Text>
          
          <View style={styles.earningsBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Base Pay</Text>
              <Text style={styles.breakdownValue}>
                ${(currentData.totalEarnings - currentData.tips - currentData.bonus).toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Tips</Text>
              <Text style={styles.breakdownValue}>${currentData.tips.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Bonus</Text>
              <Text style={styles.breakdownValue}>${currentData.bonus.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MapPin size={20} color="#3B82F6" />
            <Text style={styles.statValue}>{currentData.deliveries}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={20} color="#F59E0B" />
            <Text style={styles.statValue}>{currentData.hours}h</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.statValue}>${hourlyRate.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Per Hour</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={20} color="#EF4444" />
            <Text style={styles.statValue}>${avgPerDelivery.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Per Delivery</Text>
          </View>
        </View>

        {/* Recent Deliveries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Deliveries</Text>
          {recentDeliveries.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <Text style={styles.deliveryTime}>{delivery.date}</Text>
                <Text style={styles.deliveryEarnings}>
                  ${(delivery.earnings + delivery.tip).toFixed(2)}
                </Text>
              </View>
              
              <Text style={styles.deliveryRestaurant}>{delivery.restaurant}</Text>
              
              <View style={styles.deliveryDetails}>
                <View style={styles.deliveryDetail}>
                  <MapPin size={12} color="#6B7280" />
                  <Text style={styles.deliveryDetailText}>{delivery.distance} km</Text>
                </View>
                <View style={styles.deliveryDetail}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.deliveryDetailText}>{delivery.duration} min</Text>
                </View>
                <View style={styles.deliveryDetail}>
                  <DollarSign size={12} color="#6B7280" />
                  <Text style={styles.deliveryDetailText}>
                    ${delivery.tip.toFixed(2)} tip
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payout Information */}
        <View style={styles.payoutCard}>
          <Text style={styles.payoutTitle}>Next Payout</Text>
          <Text style={styles.payoutAmount}>$156.75</Text>
          <Text style={styles.payoutDate}>
            Arrives Monday, Jan 22 • Direct Deposit
          </Text>
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
  totalEarningsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  totalEarningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalEarningsAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  totalEarningsPeriod: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  deliveryEarnings: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  deliveryRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  deliveryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryDetailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  payoutAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  payoutDate: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
