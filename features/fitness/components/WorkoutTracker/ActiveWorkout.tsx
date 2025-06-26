import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Plus, X, Check, Clock, Edit2, ChevronUp, ChevronDown } from 'lucide-react-native';
import ExerciseSelector from './ExerciseSelector';
import RestTimer from './RestTimer';
import { useWorkoutStore } from '../../../../stores/workoutStore';
import { supabase } from '../../../../services/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
  notes: string;
}

interface ActiveWorkoutProps {
  onEndWorkout: () => void;
}

export default function ActiveWorkout({ onEndWorkout }: ActiveWorkoutProps) {
  const { user } = useAuth();
  const { activeWorkout, updateActiveWorkout, clearActiveWorkout } = useWorkoutStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const addExercise = (exercise: any) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      name: exercise.name,
      sets: [{ id: '1', reps: 0, weight: 0, completed: false }],
      notes: '',
    };
    setExercises([...exercises, newExercise]);
    setExpandedExercises(new Set([...expandedExercises, newExercise.id]));
    setShowExerciseSelector(false);
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, {
            id: (ex.sets.length + 1).toString(),
            reps: lastSet?.reps || 0,
            weight: lastSet?.weight || 0,
            completed: false,
          }],
        };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set => {
            if (set.id === setId) {
              return { ...set, [field]: value };
            }
            return set;
          }),
        };
      }
      return ex;
    }));
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set => {
            if (set.id === setId) {
              return { ...set, completed: !set.completed };
            }
            return set;
          }),
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter(set => set.id !== setId),
        };
      }
      return ex;
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
    setExpandedExercises(new Set([...expandedExercises].filter(id => id !== exerciseId)));
  };

  const toggleExerciseExpanded = (exerciseId: string) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(exerciseId)) {
      newExpanded.delete(exerciseId);
    } else {
      newExpanded.add(exerciseId);
    }
    setExpandedExercises(newExpanded);
  };

  const saveWorkout = async () => {
    if (!user || exercises.length === 0) return;

    try {
      // Calculate total calories (rough estimate)
      const caloriesPerMinute = 5; // Average for strength training
      const totalCalories = Math.round((duration / 60) * caloriesPerMinute);

      // Create workout session
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_date: new Date().toISOString().split('T')[0],
          workout_type: 'strength',
          duration_minutes: Math.round(duration / 60),
          calories_burned: totalCalories,
          notes: workoutNotes,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save workout sets
      const sets = exercises.flatMap((exercise, exerciseIndex) =>
        exercise.sets.map((set, setIndex) => ({
          workout_session_id: session.id,
          exercise_id: exercise.exerciseId,
          set_number: setIndex + 1,
          reps: set.reps,
          weight_kg: set.weight,
          notes: exercise.notes || null,
        }))
      );

      const { error: setsError } = await supabase
        .from('workout_sets')
        .insert(sets);

      if (setsError) throw setsError;

      Alert.alert('Success', 'Workout saved successfully!');
      clearActiveWorkout();
      onEndWorkout();
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const cancelWorkout = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel this workout? All progress will be lost.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: () => {
            clearActiveWorkout();
            onEndWorkout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Active Workout</Text>
          <TouchableOpacity onPress={cancelWorkout} style={styles.cancelButton}>
            <X size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.statText}>{formatDuration(duration)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statText}>{exercises.length} exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statText}>
              {exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)} sets completed
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <TouchableOpacity
              style={styles.exerciseHeader}
              onPress={() => toggleExerciseExpanded(exercise.id)}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseStats}>
                  {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length} sets
                </Text>
              </View>
              <View style={styles.exerciseActions}>
                {expandedExercises.has(exercise.id) ? (
                  <ChevronUp size={20} color="#6b7280" />
                ) : (
                  <ChevronDown size={20} color="#6b7280" />
                )}
              </View>
            </TouchableOpacity>

            {expandedExercises.has(exercise.id) && (
              <View style={styles.exerciseContent}>
                <View style={styles.setsHeader}>
                  <Text style={styles.setHeaderText}>Set</Text>
                  <Text style={styles.setHeaderText}>Previous</Text>
                  <Text style={styles.setHeaderText}>Weight (kg)</Text>
                  <Text style={styles.setHeaderText}>Reps</Text>
                  <Text style={styles.setHeaderText}></Text>
                </View>

                {exercise.sets.map((set, index) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={styles.setNumber}>{index + 1}</Text>
                    <Text style={styles.previousText}>-</Text>
                    <TextInput
                      style={styles.input}
                      value={set.weight.toString()}
                      onChangeText={(text) => updateSet(exercise.id, set.id, 'weight', parseFloat(text) || 0)}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                    <TextInput
                      style={styles.input}
                      value={set.reps.toString()}
                      onChangeText={(text) => updateSet(exercise.id, set.id, 'reps', parseInt(text) || 0)}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                    <View style={styles.setActions}>
                      <TouchableOpacity
                        style={[styles.completeButton, set.completed && styles.completedButton]}
                        onPress={() => toggleSetComplete(exercise.id, set.id)}
                      >
                        <Check size={16} color={set.completed ? '#fff' : '#6b7280'} />
                      </TouchableOpacity>
                      {exercise.sets.length > 1 && (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeSet(exercise.id, set.id)}
                        >
                          <X size={16} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                <View style={styles.exerciseFooter}>
                  <TouchableOpacity
                    style={styles.addSetButton}
                    onPress={() => addSet(exercise.id)}
                  >
                    <Plus size={16} color="#6366f1" />
                    <Text style={styles.addSetText}>Add Set</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.notesButton}
                    onPress={() => setEditingNotes(editingNotes === exercise.id ? null : exercise.id)}
                  >
                    <Edit2 size={16} color="#6b7280" />
                    <Text style={styles.notesButtonText}>Notes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeExerciseButton}
                    onPress={() => removeExercise(exercise.id)}
                  >
                    <X size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {editingNotes === exercise.id && (
                  <TextInput
                    style={styles.notesInput}
                    value={exercise.notes}
                    onChangeText={(text) => {
                      setExercises(exercises.map(ex => 
                        ex.id === exercise.id ? { ...ex, notes: text } : ex
                      ));
                    }}
                    placeholder="Add notes for this exercise..."
                    multiline
                  />
                )}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowExerciseSelector(true)}
        >
          <Plus size={20} color="#6366f1" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        <View style={styles.workoutNotesSection}>
          <Text style={styles.workoutNotesLabel}>Workout Notes</Text>
          <TextInput
            style={styles.workoutNotesInput}
            value={workoutNotes}
            onChangeText={setWorkoutNotes}
            placeholder="Add notes about this workout..."
            multiline
          />
        </View>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={saveWorkout}
        >
          <Check size={20} color="#fff" />
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      <RestTimer />

      {showExerciseSelector && (
        <ExerciseSelector
          onSelect={addExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  cancelButton: {
    padding: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  exerciseStats: {
    fontSize: 14,
    color: '#6b7280',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  setHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  setNumber: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  previousText: {
    flex: 1,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    fontSize: 14,
    textAlign: 'center',
  },
  setActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  completeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#10b981',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ede9fe',
    borderRadius: 6,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  notesButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  removeExerciseButton: {
    marginLeft: 'auto',
    padding: 6,
  },
  notesInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    fontSize: 14,
    minHeight: 60,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  workoutNotesSection: {
    marginBottom: 24,
  },
  workoutNotesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  workoutNotesInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
