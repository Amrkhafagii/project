import { supabase } from '../supabase';

export interface WorkoutSession {
  id?: string;
  user_id: string;
  workout_date: string;
  workout_type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'mixed';
  duration_minutes: number;
  calories_burned: number;
  exercises?: any;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutSet {
  id?: string;
  workout_session_id: string;
  exercise_id: string;
  set_number: number;
  reps?: number;
  weight_kg?: number;
  distance_km?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  muscle_groups: string[];
  instructions?: string;
}

export interface PersonalRecord {
  id?: string;
  user_id: string;
  exercise_id: string;
  record_type: 'max_weight' | 'max_reps' | 'max_volume' | 'fastest_time' | 'longest_distance';
  value: number;
  achieved_date: string;
  workout_session_id?: string;
}

class WorkoutService {
  // Workout Sessions
  async createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkoutSessions(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_sets (
          *,
          exercises (*)
        )
      `)
      .eq('user_id', userId)
      .order('workout_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getWorkoutSession(sessionId: string) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_sets (
          *,
          exercises (*)
        )
      `)
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWorkoutSession(sessionId: string) {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  }

  // Workout Sets
  async createWorkoutSets(sets: Omit<WorkoutSet, 'id'>[]) {
    const { data, error } = await supabase
      .from('workout_sets')
      .insert(sets)
      .select();

    if (error) throw error;
    return data;
  }

  async updateWorkoutSet(setId: string, updates: Partial<WorkoutSet>) {
    const { data, error } = await supabase
      .from('workout_sets')
      .update(updates)
      .eq('id', setId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWorkoutSet(setId: string) {
    const { error } = await supabase
      .from('workout_sets')
      .delete()
      .eq('id', setId);

    if (error) throw error;
  }

  // Exercises
  async getExercises(category?: string) {
    let query = supabase.from('exercises').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('name');

    if (error) throw error;
    return data;
  }

  async searchExercises(searchTerm: string) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name')
      .limit(20);

    if (error) throw error;
    return data;
  }

  // Personal Records
  async getPersonalRecords(userId: string, exerciseId?: string) {
    let query = supabase
      .from('exercise_personal_records')
      .select(`
        *,
        exercises (*)
      `)
      .eq('user_id', userId);

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId);
    }

    const { data, error } = await query.order('achieved_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createPersonalRecord(record: Omit<PersonalRecord, 'id'>) {
    const { data, error } = await supabase
      .from('exercise_personal_records')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkAndUpdatePersonalRecords(userId: string, sessionId: string, sets: WorkoutSet[]) {
    // Group sets by exercise
    const exerciseSets = sets.reduce((acc, set) => {
      if (!acc[set.exercise_id]) {
        acc[set.exercise_id] = [];
      }
      acc[set.exercise_id].push(set);
      return acc;
    }, {} as Record<string, WorkoutSet[]>);

    const newRecords: Omit<PersonalRecord, 'id'>[] = [];

    for (const [exerciseId, exerciseSets] of Object.entries(exerciseSets)) {
      // Get existing records for this exercise
      const { data: existingRecords } = await this.getPersonalRecords(userId, exerciseId);

      // Check for max weight PR
      const maxWeight = Math.max(...exerciseSets.map(s => s.weight_kg || 0));
      const currentMaxWeight = existingRecords?.find(r => r.record_type === 'max_weight');
      
      if (maxWeight > 0 && (!currentMaxWeight || maxWeight > currentMaxWeight.value)) {
        newRecords.push({
          user_id: userId,
          exercise_id: exerciseId,
          record_type: 'max_weight',
          value: maxWeight,
          achieved_date: new Date().toISOString().split('T')[0],
          workout_session_id: sessionId,
        });
      }

      // Check for max reps PR
      const maxReps = Math.max(...exerciseSets.map(s => s.reps || 0));
      const currentMaxReps = existingRecords?.find(r => r.record_type === 'max_reps');
      
      if (maxReps > 0 && (!currentMaxReps || maxReps > currentMaxReps.value)) {
        newRecords.push({
          user_id: userId,
          exercise_id: exerciseId,
          record_type: 'max_reps',
          value: maxReps,
          achieved_date: new Date().toISOString().split('T')[0],
          workout_session_id: sessionId,
        });
        }
        
        
          // Check for max volume PR (total weight × reps)
          const totalVolume = exerciseSets.reduce((sum, set) => 
            sum + ((set.weight_kg || 0) * (set.reps || 0)), 0
          );
          const currentMaxVolume = existingRecords?.find(r => r.record_type === 'max_volume');
          
          if (totalVolume > 0 && (!currentMaxVolume || totalVolume > currentMaxVolume.value)) {
            newRecords.push({
              user_id: userId,
              exercise_id: exerciseId,
              record_type: 'max_volume',
              value: totalVolume,
              achieved_date: new Date().toISOString().split('T')[0],
              workout_session_id: sessionId,
            });
          }
        }
        
        // Insert new records
        if (newRecords.length > 0) {
          const { error } = await supabase
            .from('exercise_personal_records')
            .insert(newRecords);
        
          if (error) throw error;
        }
        
        return newRecords;
        }
        
        // Analytics
        async getWorkoutStats(userId: string, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        
        const { data, error } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', userId)
          .gte('workout_date', startDate.toISOString().split('T')[0])
          .order('workout_date');
        
        if (error) throw error;
        
        // Calculate stats
        const stats = {
          totalWorkouts: data?.length || 0,
          totalMinutes: data?.reduce((sum, w) => sum + w.duration_minutes, 0) || 0,
          totalCalories: data?.reduce((sum, w) => sum + w.calories_burned, 0) || 0,
          avgDuration: 0,
          workoutsByType: {} as Record<string, number>,
          workoutsByDay: {} as Record<string, number>,
        };
        
        if (data && data.length > 0) {
          stats.avgDuration = Math.round(stats.totalMinutes / data.length);
        
          // Count by type
          data.forEach(workout => {
            stats.workoutsByType[workout.workout_type] = 
              (stats.workoutsByType[workout.workout_type] || 0) + 1;
          });
        
          // Count by day of week
          data.forEach(workout => {
            const day = new Date(workout.workout_date).toLocaleDateString('en-US', { weekday: 'short' });
            stats.workoutsByDay[day] = (stats.workoutsByDay[day] || 0) + 1;
          });
        }
        
        return stats;
        }
        
        async getExerciseProgress(userId: string, exerciseId: string, days = 90) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        
        const { data, error } = await supabase
          .from('workout_sets')
          .select(`
            *,
            workout_sessions!inner(
              user_id,
              workout_date
            )
          `)
          .eq('exercise_id', exerciseId)
          .eq('workout_sessions.user_id', userId)
          .gte('workout_sessions.workout_date', startDate.toISOString().split('T')[0])
          .order('workout_sessions.workout_date');
        
        if (error) throw error;
        
        // Group by date and calculate max weight/reps
        const progress = data?.reduce((acc, set) => {
          const date = set.workout_sessions.workout_date;
          if (!acc[date]) {
            acc[date] = { maxWeight: 0, maxReps: 0, totalVolume: 0 };
          }
          
          acc[date].maxWeight = Math.max(acc[date].maxWeight, set.weight_kg || 0);
          acc[date].maxReps = Math.max(acc[date].maxReps, set.reps || 0);
          acc[date].totalVolume += (set.weight_kg || 0) * (set.reps || 0);
          
          return acc;
        }, {} as Record<string, { maxWeight: number; maxReps: number; totalVolume: number }>);
        
        return progress;
        }
        }
        
        export const workoutService = new WorkoutService();