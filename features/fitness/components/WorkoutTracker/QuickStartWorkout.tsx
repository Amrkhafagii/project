import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Play, Zap, Dumbbell, Heart, Timer } from 'lucide-react-native';

interface QuickStartWorkoutProps {
  onStartWorkout: () => void;
}

export default function QuickStartWorkout({ onStartWorkout }: QuickStartWorkoutProps) {
  const quickWorkouts = [
    {
      id: '1',
      name: 'Upper Body Strength',
      duration: '45 min',
      exercises: 5,
      icon: Dumbbell,
      color: '#6366f1',
    },
    {
      id: '2',
      name: 'HIIT Cardio',
      duration: '20 min',
      exercises: 8,
      icon: Zap,
      color: '#ef4444',
    },
    {
      id: '3',
      name: 'Lower Body Power',
      duration: '50 min',
      exercises: 6,
      icon: Dumbbell,
      color: '#10b981',
    },
    {
      id: '4',
      name: 'Core & Abs',
      duration: '30 min',
      exercises: 6,
      icon: Heart,
      color: '#f59e0b',
    },
  ];

  const recentWorkouts = [
    {
      id: '1',
      name: 'Push Day',
      date: '2 days ago',
      duration: '52 min',
      exercises: 7,
    },
    {
      id: '2',
      name: 'Pull Day',
      date: '4 days ago',
      duration: '48 min',
      exercises: 6,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <TouchableOpacity style={styles.startButton} onPress={onStartWorkout}>
          <View style={styles.startButtonContent}>
            <View style={styles.startButtonIcon}>
              <Play size={24} color="#fff" style={{ marginLeft: 2 }} />
            </View>
            <View style={styles.startButtonText}>
              <Text style={styles.startButtonTitle}>Start Empty Workout</Text>
              <Text style={styles.startButtonSubtitle}>
                Build your workout as you go
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.quickWorkoutsGrid}>
          {quickWorkouts.map((workout) => {
            const Icon = workout.icon;
            return (
              <TouchableOpacity
                key={workout.id}
                style={styles.quickWorkoutCard}
                onPress={onStartWorkout}
              >
                <View
                  style={[
                    styles.quickWorkoutIcon,
                    { backgroundColor: `${workout.color}20` },
                  ]}
                >
                  <Icon size={24} color={workout.color} />
                </View>
                <Text style={styles.quickWorkoutName}>{workout.name}</Text>
                <View style={styles.quickWorkoutStats}>
                  <View style={styles.quickWorkoutStat}>
                    <Timer size={12} color="#6b7280" />
                    <Text style={styles.quickWorkoutStatText}>
                      {workout.duration}
                    </Text>
                  </View>
                  <Text style={styles.quickWorkoutStatDivider}>•</Text>
                  <Text style={styles.quickWorkoutStatText}>
                    {workout.exercises} exercises
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentWorkouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={styles.recentWorkoutCard}
            onPress={onStartWorkout}
          >
            <View style={styles.recentWorkoutInfo}>
              <Text style={styles.recentWorkoutName}>{workout.name}</Text>
              <Text style={styles.recentWorkoutDate}>{workout.date}</Text>
            </View>
            <View style={styles.recentWorkoutStats}>
              <Text style={styles.recentWorkoutStat}>
                {workout.duration} • {workout.exercises} exercises
              </Text>
              <Text style={styles.repeatButton}>Repeat</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.tipTitle}>💡 Pro Tip</Text>
        <Text style={styles.tipText}>
          Track your rest times between sets for optimal recovery and better gains
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  startButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  startButtonText: {
    flex: 1,
  },
  startButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  startButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickWorkoutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickWorkoutCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickWorkoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickWorkoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  quickWorkoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickWorkoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickWorkoutStatText: {
    fontSize: 12,
    color: '#6b7280',
  },
  quickWorkoutStatDivider: {
    fontSize: 12,
    color: '#d1d5db',
  },
  recentWorkoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentWorkoutInfo: {
    marginBottom: 8,
  },
  recentWorkoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recentWorkoutDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  recentWorkoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentWorkoutStat: {
    fontSize: 14,
    color: '#6b7280',
  },
  repeatButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  tipsSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ede9fe',
    borderRadius: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4c1d95',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#5b21b6',
    lineHeight: 20,
  },
});
