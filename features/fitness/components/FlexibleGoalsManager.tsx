import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { getGoalsForDay, updateWeeklyGoalOverride, updateGoalSchedule, generateGoalRecommendations } from '../../../services/fitness/flexibleGoalsService';
import { Calendar, Target, Zap, Brain } from 'lucide-react-native';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function FlexibleGoalsManager() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [weeklyOverride, setWeeklyOverride] = useState<any>({});
  const [goalSchedule, setGoalSchedule] = useState<any>({
    workout_days: [],
    rest_days: [],
    high_protein_days: [],
    refeed_days: []
  });
  const [dayGoals, setDayGoals] = useState({
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    water_ml: ''
  });
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadGoalData();
      loadRecommendations();
    }
  }, [user]);

  useEffect(() => {
    if (weeklyOverride[selectedDay]) {
      setDayGoals({
        calories: weeklyOverride[selectedDay].calories?.toString() || '',
        protein_g: weeklyOverride[selectedDay].protein_g?.toString() || '',
        carbs_g: weeklyOverride[selectedDay].carbs_g?.toString() || '',
        fat_g: weeklyOverride[selectedDay].fat_g?.toString() || '',
        water_ml: weeklyOverride[selectedDay].water_ml?.toString() || ''
      });
    } else {
      setDayGoals({
        calories: '',
        protein_g: '',
        carbs_g: '',
        fat_g: '',
        water_ml: ''
      });
    }
  }, [selectedDay, weeklyOverride]);

  const loadGoalData = async () => {
    try {
      // Load existing goal data from profile
      // This would need to be implemented in the service
      // For now, we'll use default values
    } catch (error) {
      console.error('Error loading goal data:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recs = await generateGoalRecommendations(user!.id);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleSaveDayGoals = () => {
    const goals: any = {};
    
    if (dayGoals.calories) goals.calories = parseInt(dayGoals.calories);
    if (dayGoals.protein_g) goals.protein_g = parseInt(dayGoals.protein_g);
    if (dayGoals.carbs_g) goals.carbs_g = parseInt(dayGoals.carbs_g);
    if (dayGoals.fat_g) goals.fat_g = parseInt(dayGoals.fat_g);
    if (dayGoals.water_ml) goals.water_ml = parseInt(dayGoals.water_ml);

    setWeeklyOverride({
      ...weeklyOverride,
      [selectedDay]: Object.keys(goals).length > 0 ? goals : null
    });
  };

  const handleSaveAllGoals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([
        updateWeeklyGoalOverride(user.id, weeklyOverride),
        updateGoalSchedule(user.id, goalSchedule)
      ]);
      Alert.alert('Success', 'Goals updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update goals');
      console.error('Error saving goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleScheduleDay = (type: string, day: string) => {
    const currentDays = goalSchedule[type] || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d: string) => d !== day)
      : [...currentDays, day];
    
    setGoalSchedule({
      ...goalSchedule,
      [type]: newDays
    });
  };

  const applyRecommendations = () => {
    if (!recommendations) return;

    setGoalSchedule(recommendations.suggested_schedule);
    Alert.alert('Applied', 'Recommendations have been applied to your schedule!');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Flexible Goals Manager</Text>
        <Text style={styles.subtitle}>Customize your daily targets</Text>
      </View>

      {/* AI Recommendations */}
      {recommendations && (
        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
            <Brain size={20} color="#6366f1" />
            <Text style={styles.recommendationsTitle}>AI Recommendations</Text>
          </View>

          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationText}>
              Based on your recent activity patterns:
            </Text>
            
            {recommendations.insights.map((insight: string, index: number) => (
              <Text key={index} style={styles.insight}>• {insight}</Text>
            ))}

            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyRecommendations}
            >
              <Text style={styles.applyButtonText}>Apply Recommendations</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Goal Schedule */}
      <View style={styles.scheduleCard}>
        <Text style={styles.sectionTitle}>Goal Schedule</Text>
        
        <View style={styles.scheduleSection}>
          <Text style={styles.scheduleLabel}>Workout Days</Text>
          <View style={styles.daySelector}>
            {DAYS_OF_WEEK.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  goalSchedule.workout_days?.includes(day) && styles.dayButtonActive
                ]}
                onPress={() => toggleScheduleDay('workout_days', day)}
              >
                <Text style={[
                  styles.dayButtonText,
                  goalSchedule.workout_days?.includes(day) && styles.dayButtonTextActive
                ]}>
                  {day.slice(0, 3).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.scheduleSection}>
          <Text style={styles.scheduleLabel}>High Protein Days</Text>
          <View style={styles.daySelector}>
            {DAYS_OF_WEEK.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  goalSchedule.high_protein_days?.includes(day) && styles.dayButtonActive
                ]}
                onPress={() => toggleScheduleDay('high_protein_days', day)}
              >
                <Text style={[
                  styles.dayButtonText,
                  goalSchedule.high_protein_days?.includes(day) && styles.dayButtonTextActive
                ]}>
                  {day.slice(0, 3).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.scheduleSection}>
          <Text style={styles.scheduleLabel}>Refeed Days</Text>
          <View style={styles.daySelector}>
            {DAYS_OF_WEEK.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  goalSchedule.refeed_days?.includes(day) && styles.dayButtonActive
                ]}
                onPress={() => toggleScheduleDay('refeed_days', day)}
              >
                <Text style={[
                  styles.dayButtonText,
                  goalSchedule.refeed_days?.includes(day) && styles.dayButtonTextActive
                ]}>
                  {day.slice(0, 3).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Daily Goal Override */}
      <View style={styles.overrideCard}>
        <Text style={styles.sectionTitle}>Daily Goal Override</Text>
        
        <View style={styles.dayTabs}>
          {DAYS_OF_WEEK.map(day => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayTab,
                selectedDay === day && styles.dayTabActive
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[
                styles.dayTabText,
                selectedDay === day && styles.dayTabTextActive
              ]}>
                {day.slice(0, 3).toUpperCase()}
              </Text>
              {weeklyOverride[day] && (
                <View style={styles.overrideIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.goalInputs}>
          <Text style={styles.selectedDayTitle}>
            {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Goals
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Calories</Text>
              <TextInput
                style={styles.input}
                value={dayGoals.calories}
                onChangeText={(text) => setDayGoals({...dayGoals, calories: text})}
                keyboardType="number-pad"
                placeholder="2000"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                style={styles.input}
                value={dayGoals.protein_g}
                onChangeText={(text) => setDayGoals({...dayGoals, protein_g: text})}
                keyboardType="number-pad"
                placeholder="150"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput
                style={styles.input}
                value={dayGoals.carbs_g}
                onChangeText={(text) => setDayGoals({...dayGoals, carbs_g: text})}
                keyboardType="number-pad"
                placeholder="200"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                style={styles.input}
                value={dayGoals.fat_g}
                onChangeText={(text) => setDayGoals({...dayGoals, fat_g: text})}
                keyboardType="number-pad"
                placeholder="65"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Water (ml)</Text>
            <TextInput
              style={styles.input}
              value={dayGoals.water_ml}
              onChangeText={(text) => setDayGoals({...dayGoals, water_ml: text})}
              keyboardType="number-pad"
              placeholder="2500"
            />
          </View>

          <TouchableOpacity
            style={styles.saveDayButton}
            onPress={handleSaveDayGoals}
          >
            <Text style={styles.saveDayButtonText}>
              Save {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Goals
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save All Button */}
      <TouchableOpacity
        style={[styles.saveAllButton, loading && styles.saveAllButtonDisabled]}
        onPress={handleSaveAllGoals}
        disabled={loading}
      >
        <Text style={styles.saveAllButtonText}>
          {loading ? 'Saving...' : 'Save All Changes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  recommendationsCard: {
    backgroundColor: '#f0f9ff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
  },
  recommendationContent: {
    gap: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 8,
  },
  insight: {
    fontSize: 14,
    color: '#3730a3',
    marginLeft: 8,
    marginBottom: 4,
  },
  applyButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  scheduleSection: {
    marginBottom: 20,
  },
  scheduleLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  dayButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  overrideCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayTabs: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 8,
  },
  dayTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    position: 'relative',
  },
  dayTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayTabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  dayTabTextActive: {
    color: '#111827',
  },
  overrideIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  goalInputs: {
    gap: 12,
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  saveDayButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveDayButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  saveAllButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveAllButtonDisabled: {
    opacity: 0.6,
  },
  saveAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
