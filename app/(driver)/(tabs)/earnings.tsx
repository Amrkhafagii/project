import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  MapPin,
  Star,
  CreditCard,
  Download,
  History,
} from 'lucide-react-native';
import { useAuth } from '@/services/auth/authService';
import { withdrawalService } from '@/services/earnings/withdrawalService';
import { WithdrawalHistory, WithdrawalRequest } from '@/types/earnings';
import WithdrawalModal from '@/components/earnings/WithdrawalModal';

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
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadWithdrawalHistory();
  }, []);

  const loadWithdrawalHistory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const history = await withdrawalService.getWithdrawalHistory(user.id);
      setWithdrawalHistory(history);
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
      Alert.alert('Error', 'Failed to load withdrawal history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWithdrawalHistory();
    setRefreshing(false);
  };

  const handleWithdrawalRequested = () => {
    loadWithdrawalHistory();
  };

  const getStatusColor = (status: WithdrawalRequest['status']) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'processing':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      case 'cancelled':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: WithdrawalRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const currentData = earningsData[selectedPeriod];
  const hourlyRate = currentData.totalEarnings / currentData.hours;
  const avgPerDelivery = currentData.totalEarnings / currentData.deliveries;

  // Calculate available balance (total earnings minus pending withdrawals)
  const availableBalance = withdrawalHistory 
    ? currentData.totalEarnings - withdrawalHistory.pendingAmount
    : currentData.totalEarnings;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => setShowWithdrawalModal(true)}
          >
            <Download size={16} color="#FFFFFF" />
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Available Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <CreditCard size={24} color="#10B981" />
            <Text style={styles.balanceTitle}>Available Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>
            ${availableBalance.toFixed(2)}
          </Text>
          <Text style={styles.balanceSubtitle}>
            Ready for withdrawal
          </Text>
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
            <DollarSign size={32}