import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Calendar, Clock, Dumbbell, TrendingUp, ChevronRight } from 'lucide-react-native';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { supabase } from '../../../../services/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

interface WorkoutSession {
  id: string;
  workout_date: string;
  workout_type: string;
  duration_minutes: number;
  calories_burned: number;
  notes?: string;
  exercises_count?: number;
  total_sets?: number;
  total_volume?: number;
}

export default function WorkoutHistory() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedWeek, { weekStartsOn: 1 }),
    end: endOfWeek(selectedWeek, { weekStartsOn: 1 }),
  });

  useEffect(() => {
    loadWorkouts();
  }, [user]);

  const loadWorkouts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_sets (
            id,
            exercise_id,
            weight_kg,
            reps
          )
        `)
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Process workouts to add aggregate data
      const processedWorkouts = data?.map(workout => {
        const sets = workout.workout_sets || [];
        const totalVolume = sets.reduce((sum: number, set: any) => 
          sum + (set.weight_kg * set.reps), 0
        );
        
        return {
          ...workout,
          exercises_count: new Set(sets.map((s: any) => s.exercise_id)).size,
          total_sets: sets.length,
          total_volume: totalVolume,
        };
      });

      setWorkouts(processedWorkouts || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  const getWorkoutsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return workouts.filter(w => w.workout_date === dateStr);
  };

  const stats = {
    totalWorkouts: workouts.length,
    totalMinutes: workouts.reduce((sum, w) => sum + w.duration_minutes, 0),
    totalCalories: workouts.reduce((sum, w) => sum + w.calories_burned, 0),
    avgDuration: workouts.length > 0 
      ? Math.round(workouts.reduce((sum, w) => sum + w.duration_minutes, 0) / workouts.length)
      : 0,
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>This Month</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Dumbbell size={20} color="#6366f1" />
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={20} color="#10b981" />
            <Text style={styles.statValue}>{stats.avgDuration}</Text>
            <Text style={styles.statLabel}>Avg Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#f59e0b" />
            <Text style={styles.statValue}>{stats.totalCalories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>

      {/* Week View */}
      <View style={styles.weekContainer}>
        <Text style={styles.weekTitle}>This Week</Text>
        <View style={styles.weekDays}>
          {weekDays.map((day) => {
            const dayWorkouts = getWorkoutsForDate(day);
            const hasWorkout = dayWorkouts.length > 0;
            const isCurrentDay = isToday(day);

            return (
              <View key={day.toISOString()} style={styles.dayColumn}>
                <Text style={styles.dayLabel}>{format(day, 'EEE')}</Text>
                <View
                  style={[
                    styles.dayCircle,
                    hasWorkout && styles.dayCircleActive,
                    isCurrentDay && styles.dayCircleToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      hasWorkout && styles.dayNumberActive,
                      isCurrentDay && styles.dayNumberToday,
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                </View>
                {hasWorkout && (
                  <View style={styles.workoutIndicator}>
                    <Text style={styles.workoutCount}>{dayWorkouts.length}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Workout List */}
      <View style={styles.workoutsList}>
        <Text style={styles.workoutsTitle}>Recent Workouts</Text>
        {workouts.map((workout) => (
          <TouchableOpacity key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <View>
                <Text style={styles.workoutDate}>
                  {format(new Date(workout.workout_date), 'EEEE, MMM d')}
                </Text>
                <Text style={styles.workoutType}>
                  {workout.workout_type.charAt(0).toUpperCase() + workout.workout_type.slice(1)} Training
                </Text>
              </View>
              <ChevronRight size={20} color="#6b7280" />
            </View>
            <View style={styles.workoutStats}>
              <View style={styles.workoutStat}>
                <Clock size={14} color="#6b7280" />
                <Text style={styles.workoutStatText}>
                  {workout.duration_minutes} min
                </Text>
              </View>
              <View style={styles.workoutStat}>
                <Dumbbell size={14} color="#6b7280" />
                <Text style={styles.workoutStatText}>
                  {workout.exercises_count || 0} exercises
                </Text>
              </View>
              <View style={styles.workoutStat}>
                <TrendingUp size={14} color="#6b7280" />
                <Text style={styles.workoutStatText}>
                  {workout.total_volume || 0} kg
                </Text>
              </View>
            </View>
            {workout.notes && (
              <Text style={styles.workoutNotes} numberOfLines={2}>
                {workout.notes}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  statsContainer: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
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
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  weekContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#6366f1',
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  dayNumberActive: {
    color: '#fff',
  },
  dayNumberToday: {
    color: '#6366f1',
  },
  workoutIndicator: {
    marginTop: 4,
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  workoutCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  workoutsList: {
    padding: 20,
  },
  workoutsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  workoutCard: {
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
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  workoutType: {
    fontSize: 14,
    color: '#6b7280',
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontSize: 12,
    color: '#6b7280',
  },
  workoutNotes: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
