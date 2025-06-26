import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, Target, Flame, Zap, TrendingUp, Award, Calendar } from 'lucide-react-native';
import HydrationTracker from '../../../components/fitness/HydrationTracker';
import EnergyBalanceCard from '../../../components/fitness/EnergyBalanceCard';
import CorrelationChart from '../../../components/fitness/CorrelationChart';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/supabase';

const { width } = Dimensions.get('window');

export default function FitnessScreen() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);
  const [fitnessProfile, setFitnessProfile] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({
    caloriesConsumed: 0,
    proteinConsumed: 0,
    workoutsCompleted: 0,
  });

  const periods = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];

  useEffect(() => {
    loadFitnessData();
  }, [user]);

  const loadFitnessData = async () => {
    if (!user) return;

    try {
      // Load fitness profile
      const { data: profile } = await supabase
        .from('fitness_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setFitnessProfile(profile);

      // Load today's stats
      const { data: nutritionLogs } = await supabase
        .from('nutrition_logs')
        .select('calories, protein_g')
        .eq('user_id', user.id)
        .eq('date', todayDate);

      const { data: workouts } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', todayDate);

      const totalCalories = nutritionLogs?.reduce((sum, log) => sum + log.calories, 0) || 0;
      const totalProtein = nutritionLogs?.reduce((sum, log) => sum + Number(log.protein_g), 0) || 0;

      setTodayStats({
        caloriesConsumed: totalCalories,
        proteinConsumed: totalProtein,
        workoutsCompleted: workouts?.length || 0,
      });
    } catch (error) {
      console.error('Error loading fitness data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFitnessData();
    setRefreshing(false);
  };

  const achievements = [
    {
      id: '1',
      title: 'Recovery Master',
      description: 'Hit protein + hydration goals with workout streak',
      icon: Award,
      earned: todayStats.proteinConsumed >= (fitnessProfile?.daily_protein_goal || 50),
    },
    {
      id: '2',
      title: 'Metabolic Sync',
      description: 'Maintain perfect calorie balance for 7 days',
      icon: Target,
      earned: false,
    },
    {
      id: '3',
      title: 'Hydration Hero',
      description: 'Meet hydration goals for 30 days straight',
      icon: Flame,
      earned: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Fitness Dashboard</Text>
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.id && styles.activePeriodButton,
                ]}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === period.id && styles.activePeriodText,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Energy Balance Card */}
        <View style={styles.section}>
          <EnergyBalanceCard date={todayDate} />
        </View>

        {/* Hydration Tracker */}
        <View style={styles.section}>
          <HydrationTracker date={todayDate} onUpdate={loadFitnessData} />
        </View>

        {/* Daily Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Flame size={24} color="#EF4444" />
                <Text style={styles.statValue}>
                  {todayStats.caloriesConsumed}/{fitnessProfile?.daily_calorie_goal || 2000}
                </Text>
              </View>
              <Text style={styles.statLabel}>Calories</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        (todayStats.caloriesConsumed / (fitnessProfile?.daily_calorie_goal || 2000)) * 100,
                        100
                      )}%`,
                      backgroundColor: '#EF4444',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Zap size={24} color="#F59E0B" />
                <Text style={styles.statValue}>
                  {todayStats.proteinConsumed}g/{fitnessProfile?.daily_protein_goal || 50}g
                </Text>
              </View>
              <Text style={styles.statLabel}>Protein</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        (todayStats.proteinConsumed / (fitnessProfile?.daily_protein_goal || 50)) * 100,
                        100
                      )}%`,
                      backgroundColor: '#F59E0B',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Activity size={24} color="#10B981" />
                <Text style={styles.statValue}>
                  {todayStats.workoutsCompleted} completed
                </Text>
              </View>
              <Text style={styles.statLabel}>Workouts</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: todayStats.workoutsCompleted > 0 ? '100%' : '0%',
                      backgroundColor: '#10B981',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Correlation Chart */}
        <View style={styles.section}>
          <CorrelationChart days={selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365} />
        </View>

        {/* Enhanced Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cross-Domain Achievements</Text>
          {achievements.map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.earned && styles.lockedAchievement,
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    achievement.earned
                      ? styles.earnedIcon
                      : styles.lockedIcon,
                  ]}
                >
                  <IconComponent
                    size={24}
                    color={achievement.earned ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
                <View style={styles.achievementContent}>
                  <Text
                    style={[
                      styles.achievementTitle,
                      !achievement.earned && styles.lockedText,
                    ]}
                  >
                    {achievement.title}
                  </Text>
                  <Text
                    style={[
                      styles.achievementDescription,
                      !achievement.earned && styles.lockedText,
                    ]}
                  >
                    {achievement.description}
                  </Text>
                </View>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Text style={styles.earnedText}>✓</Text>
                  </View>
                )}
              </View>
            );
          })}
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
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activePeriodButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activePeriodText: {
    color: '#111827',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
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
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  earnedIcon: {
    backgroundColor: '#8B5CF6',
  },
  lockedIcon: {
    backgroundColor: '#F3F4F6',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  lockedText: {
    color: '#9CA3AF',
  },
  earnedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
