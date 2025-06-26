import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Plus, Edit2, Trash2, Copy, Search } from 'lucide-react-native';
import { supabase } from '../../../../services/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: number;
    reps: number;
    weight?: number;
  }[];
  created_at: string;
}

interface WorkoutTemplatesProps {
  onSelectTemplate: (template: WorkoutTemplate) => void;
}

export default function WorkoutTemplates({ onSelectTemplate }: WorkoutTemplatesProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Predefined templates
  const defaultTemplates: WorkoutTemplate[] = [
    {
      id: 'push-day',
      name: 'Push Day',
      description: 'Chest, shoulders, and triceps',
      exercises: [
        { exerciseId: '1', exerciseName: 'Bench Press', sets: 4, reps: 8, weight: 60 },
        { exerciseId: '2', exerciseName: 'Overhead Press', sets: 3, reps: 10, weight: 40 },
        { exerciseId: '3', exerciseName: 'Dumbbell Chest Press', sets: 3, reps: 12, weight: 25 },
        { exerciseId: '4', exerciseName: 'Lateral Raise', sets: 3, reps: 15, weight: 10 },
        { exerciseId: '5', exerciseName: 'Tricep Extension', sets: 3, reps: 12, weight: 15 },
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: 'pull-day',
      name: 'Pull Day',
      description: 'Back and biceps',
      exercises: [
        { exerciseId: '6', exerciseName: 'Deadlift', sets: 4, reps: 6, weight: 80 },
        { exerciseId: '7', exerciseName: 'Pull-ups', sets: 3, reps: 8 },
        { exerciseId: '8', exerciseName: 'Bent Over Row', sets: 3, reps: 10, weight: 50 },
        { exerciseId: '9', exerciseName: 'Bicep Curl', sets: 3, reps: 12, weight: 15 },
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: 'leg-day',
      name: 'Leg Day',
      description: 'Quadriceps, hamstrings, and glutes',
      exercises: [
        { exerciseId: '10', exerciseName: 'Squat', sets: 4, reps: 8, weight: 70 },
        { exerciseId: '11', exerciseName: 'Romanian Deadlift', sets: 3, reps: 10, weight: 60 },
        { exerciseId: '12', exerciseName: 'Leg Press', sets: 3, reps: 12, weight: 100 },
        { exerciseId: '13', exerciseName: 'Leg Curl', sets: 3, reps: 15, weight: 40 },
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: 'full-body',
      name: 'Full Body',
      description: 'Complete workout for all muscle groups',
      exercises: [
        { exerciseId: '1', exerciseName: 'Squat', sets: 3, reps: 10, weight: 60 },
        { exerciseId: '2', exerciseName: 'Bench Press', sets: 3, reps: 10, weight: 50 },
        { exerciseId: '3', exerciseName: 'Bent Over Row', sets: 3, reps: 10, weight: 40 },
        { exerciseId: '4', exerciseName: 'Overhead Press', sets: 3, reps: 10, weight: 30 },
        { exerciseId: '5', exerciseName: 'Plank', sets: 3, reps: 60 },
      ],
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    // For now, just use default templates
    // In a real app, you'd load user's custom templates from the database
    setTemplates(defaultTemplates);
    setLoading(false);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteTemplate = (templateId: string) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTemplates(templates.filter(t => t.id !== templateId));
          },
        },
      ]
    );
  };

  const duplicateTemplate = (template: WorkoutTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      created_at: new Date().toISOString(),
    };
    setTemplates([newTemplate, ...templates]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search templates..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.createButton}>
          <Plus size={20} color="#6366f1" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.templatesList} showsVerticalScrollIndicator={false}>
        {filteredTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => onSelectTemplate(template)}
          >
            <View style={styles.templateHeader}>
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                {template.description && (
                  <Text style={styles.templateDescription}>
                    {template.description}
                  </Text>
                )}
              </View>
              <View style={styles.templateActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => duplicateTemplate(template)}
                >
                  <Copy size={16} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Edit2 size={16} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteTemplate(template.id)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.exercisesList}>
              {template.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets} sets × {exercise.reps} reps
                    {exercise.weight && ` @ ${exercise.weight}kg`}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.templateFooter}>
              <Text style={styles.templateStats}>
                {template.exercises.length} exercises • 
                {template.exercises.reduce((sum, ex) => sum + ex.sets, 0)} total sets
              </Text>
              <TouchableOpacity
                style={styles.useButton}
                onPress={() => onSelectTemplate(template)}
              >
                <Text style={styles.useButtonText}>Use Template</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Pro Tip</Text>
          <Text style={styles.tipText}>
            Create custom templates from your best workouts to save time and track progress
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  templatesList: {
    flex: 1,
    padding: 16,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  exercisesList: {
    marginBottom: 16,
  },
  exerciseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  templateStats: {
    fontSize: 12,
    color: '#6b7280',
  },
  useButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  useButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  tipCard: {
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
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
