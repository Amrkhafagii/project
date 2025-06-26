import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Trophy, TrendingUp, Award, Calendar, Filter } from 'lucide-react-native';
import { format } from 'date-fns';
import { supabase } from '../../../../services/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

interface PersonalRecord {
  id: string;
  exercise_name: string;
  record_type: string;
  value: number;
  achieved_date: string;
  previous_value?: number;
  improvement?: number;
}

export default function PersonalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All PRs' },
    { id: 'strength', label: 'Strength' },
    { id: 'endurance', label: 'Endurance' },
    { id: 'recent', label: 'Recent' },
  ];

  // Mock data for demonstration
  const mockRecords: PersonalRecord[] = [
    {
      id: '1',
      exercise_name: 'Bench Press',
      record_type: 'max_weight',
      value: 100,
      achieved_date: '2024-01-15',
      previous_value: 95,
      improvement: 5.3,
    },
    {
      id: '2',
      exercise_name: 'Squat',
      record_type: 'max_weight',
      value: 140,
      achieved_date: '2024-01-10',
      previous_value: 130,
      improvement: 7.7,
    },
    {
      id: '3',
      exercise_name: 'Deadlift',
      record_type: 'max_weight',
      value: 180,
      achieved_date: '2024-01-08',
      previous_value: 170,
      improvement: 5.9,
    },
    {
      id: '4',
      exercise_name: 'Pull-ups',
      record_type: 'max_reps',
      value: 15,
      achieved_date: '2024-01-12',
      previous_value: 12,
      improvement: 25,
    },
    {
      id: '5',
      exercise_name: 'Plank',
      record_type: 'longest_duration',
      value: 180,
      achieved_date: '2024-01-05',
      previous_value: 150,
      improvement: 20,
    },
  ];

  useEffect(() => {
    loadRecords();
  }, [user]);

  const loadRecords = async () => {
    // For now, use mock data
    setRecords(mockRecords);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRecords();
  };

  const formatRecordValue = (record: PersonalRecord) => {
    switch (record.record_type) {
      case 'max_weight':
        return `${record.value} kg`;
      case 'max_reps':
        return `${record.value} reps`;
      case 'longest_duration':
        return `${Math.floor(record.value / 60)}:${(record.value % 60).toString().padStart(2, '0')}`;
      case 'max_volume':
        return `${record.value} kg`;
      default:
        return record.value.toString();
    }
  };

  const getRecordIcon = (recordType: string) => {
    switch (recordType) {
      case 'max_weight':
        return '🏋️';
      case 'max_reps':
        return '💪';
      case 'longest_duration':
        return '⏱️';
      case 'max_volume':
        return '📊';
      default:
        return '🏆';
    }
  };

  const filteredRecords = records.filter(record => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'strength') {
      return ['max_weight', 'max_volume'].includes(record.record_type);
    }
    if (selectedCategory === 'endurance') {
      return ['max_reps', 'longest_duration'].includes(record.record_type);
    }
    if (selectedCategory === 'recent') {
      const daysSince = Math.floor(
        (new Date().getTime() - new Date(record.achieved_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince <= 7;
    }
    return true;
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Stats */}
      <View style={styles.headerStats}>
        <View style={styles.statCard}>
          <Trophy size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{records.length}</Text>
          <Text style={styles.statLabel}>Total PRs</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#10b981" />
          <Text style={styles.statValue}>
            {records.filter(r => r.improvement && r.improvement > 0).length}
          </Text>
          <Text style={styles.statLabel}>Improvements</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={24} color="#6366f1" />
          <Text style={styles.statValue}>
            {records.filter(r => {
              const daysSince = Math.floor(
                (new Date().getTime() - new Date(r.achieved_date).getTime()) / (1000 * 60 * 60 * 24)
              );
              return daysSince <= 30;
            }).length}
          </Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Records List */}
      <View style={styles.recordsList}>
        {filteredRecords.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <View style={styles.recordIcon}>
                <Text style={styles.recordEmoji}>
                  {getRecordIcon(record.record_type)}
                </Text>
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.exerciseName}>{record.exercise_name}</Text>
                <Text style={styles.recordDate}>
                  {format(new Date(record.achieved_date), 'MMM d, yyyy')}
                </Text>
              </View>
              {record.improvement && record.improvement > 0 && (
                <View style={styles.improvementBadge}>
                  <TrendingUp size={12} color="#10b981" />
                  <Text style={styles.improvementText}>
                    +{record.improvement.toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.recordValues}>
              <View style={styles.currentValue}>
                <Text style={styles.valueLabel}>Current PR</Text>
                <Text style={styles.valueText}>
                  {formatRecordValue(record)}
                </Text>
              </View>
              {record.previous_value && (
                <View style={styles.previousValue}>
                  <Text style={styles.valueLabel}>Previous</Text>
                  <Text style={styles.previousValueText}>
                    {formatRecordValue({ ...record, value: record.previous_value })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Motivational Section */}
      <View style={styles.motivationCard}>
        <Award size={32} color="#6366f1" />
        <Text style={styles.motivationTitle}>Keep Pushing!</Text>
        <Text style={styles.motivationText}>
          You've set {records.length} personal records. Every workout is a chance to beat them!
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
  headerStats: {
    flexDirection: 'row',
    padding: 20,
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
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    maxHeight: 40,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  recordsList: {
    paddingHorizontal: 20,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordEmoji: {
    fontSize: 24,
  },
  recordInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  recordValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentValue: {
    flex: 1,
  },
  previousValue: {
    flex: 1,
    alignItems: 'flex-end',
  },
  valueLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  previousValueText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  motivationCard: {
    margin: 20,
    backgroundColor: '#ede9fe',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4c1d95',
    marginTop: 12,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#5b21b6',
    textAlign: 'center',
    lineHeight: 20,
  },
});
