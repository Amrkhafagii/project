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
import { Activity, Target, Flame, Zap, TrendingUp, Award } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function FitnessScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];

  const fitnessStats = {
    caloriesConsumed: 1850,
    caloriesGoal: 2200,
    proteinConsumed: 120,
    proteinGoal: 150,
    workoutsThisWeek: 4,
    workoutGoal: 5,
  };

  const achievements = [
    {
      id: '1',
      title: 'Protein Master',
      description: 'Hit protein goal 7 days in a row',
      icon: Award,
      earned: true,
    },
    {
      id: '2',
      title: 'Consistency King',
      description: 'Ordered healthy meals 10 days straight',
      icon: Target,
      earned: true,
    },
    {
      id: '3',
      title: 'Calorie Counter',
      description: 'Stay within calorie range for 30 days',
      icon: Flame,
      earned: false,
    },
  ];

  const weeklyProgress = [
    { day: 'Mon', calories: 1950, target: 2200 },
    { day: 'Tue', calories: 2100, target: 2200 },
    { day: 'Wed', calories: 1800, target: 2200 },
    { day: 'Thu', calories: 2050, target: 2200 },
    { day: 'Fri', calories: 1900, target: 2200 },
    { day: 'Sat', calories: 2200, target: 2200 },
    { day: 'Sun', calories: 1850, target: 2200 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fitness Tracker</Text>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Daily Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Flame size={24} color="#EF4444" />
                <Text style={styles.statValue}>
                  {fitnessStats.caloriesConsumed}/{fitnessStats.caloriesGoal}
                </Text>
              </View>
              <Text style={styles.statLabel}>Calories</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        (fitnessStats.caloriesConsumed / fitnessStats.caloriesGoal) * 100,
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
                  {fitnessStats.proteinConsumed}g/{fitnessStats.proteinGoal}g
                </Text>
              </View>
              <Text style={styles.statLabel}>Protein</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        (fitnessStats.proteinConsumed / fitnessStats.proteinGoal) * 100,
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
                  {fitnessStats.workoutsThisWeek}/{fitnessStats.workoutGoal}
                </Text>
              </View>
              <Text style={styles.statLabel}>Workouts</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        (fitnessStats.workoutsThisWeek / fitnessStats.workoutGoal) * 100,
                        100
                      )}%`,
                      backgroundColor: '#10B981',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Calorie Intake</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {weeklyProgress.map((day, index) => {
                const percentage = (day.calories / day.target) * 100;
                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${Math.min(percentage, 100)}%`,
                            backgroundColor: percentage >= 100 ? '#10B981' : '#6B7280',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{day.day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
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
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 80,
    width: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
    backgroundColor: '#10B981',
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
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
