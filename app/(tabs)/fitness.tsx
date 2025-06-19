import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar,
  User,
  Scale,
  Flame,
  Zap
} from 'lucide-react-native';
import { calculateTDEE, calculateBMR, calculateCalorieGoal, calculateMacros, FitnessProfile } from '@/services/fitness/fitnessService';

export default function FitnessScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'goals'>('overview');
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile>({
    age: 28,
    gender: 'male',
    height_cm: 175,
    weight_kg: 75,
    activity_level: 'moderately_active',
    fitness_goal: 'build_muscle',
  });

  const [showProfileForm, setShowProfileForm] = useState(false);

  const bmr = calculateBMR(fitnessProfile);
  const tdee = calculateTDEE(fitnessProfile);
  const calorieGoal = calculateCalorieGoal(fitnessProfile);
  const macros = calculateMacros(calorieGoal, fitnessProfile.fitness_goal || 'maintain_weight');

  const statsCards = [
    {
      icon: <Flame size={24} color="#EF4444" />,
      label: 'BMR',
      value: `${bmr}`,
      unit: 'cal',
      subtitle: 'Base metabolic rate',
    },
    {
      icon: <Zap size={24} color="#F59E0B" />,
      label: 'TDEE',
      value: `${tdee}`,
      unit: 'cal',
      subtitle: 'Total daily expenditure',
    },
    {
      icon: <Target size={24} color="#10B981" />,
      label: 'Goal',
      value: `${calorieGoal}`,
      unit: 'cal',
      subtitle: 'Daily calorie target',
    },
    {
      icon: <Scale size={24} color="#3B82F6" />,
      label: 'Weight',
      value: `${fitnessProfile.weight_kg}`,
      unit: 'kg',
      subtitle: 'Current weight',
    },
  ];

  const updateProfile = (updates: Partial<FitnessProfile>) => {
    setFitnessProfile(prev => ({ ...prev, ...updates }));
  };

  const renderOverview = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        {statsCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            {stat.icon}
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statUnit}>{stat.unit}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
          </View>
        ))}
      </View>

      {/* Macros Breakdown */}
      <View style={styles.macrosCard}>
        <Text style={styles.cardTitle}>Daily Macro Targets</Text>
        <View style={styles.macrosGrid}>
          <View style={styles.macroItem}>
            <View style={[styles.macroBar, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{macros.protein}g</Text>
          </View>
          <View style={styles.macroItem}>
            <View style={[styles.macroBar, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{macros.carbs}g</Text>
          </View>
          <View style={styles.macroItem}>
            <View style={[styles.macroBar, { backgroundColor: '#10B981' }]} />
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>{macros.fat}g</Text>
          </View>
        </View>
      </View>

      {/* Today's Progress */}
      <View style={styles.progressCard}>
        <Text style={styles.cardTitle}>Today's Progress</Text>
        <View style={styles.progressItem}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Calories Consumed</Text>
            <Text style={styles.progressValue}>1,250 / {calorieGoal}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${(1250 / calorieGoal) * 100}%` }]} />
          </View>
        </View>
      </View>

      {/* Fitness Goal */}
      <View style={styles.goalCard}>
        <Text style={styles.cardTitle}>Current Goal</Text>
        <View style={styles.goalContent}>
          <Target size={32} color="#10B981" />
          <View style={styles.goalText}>
            <Text style={styles.goalTitle}>
              {fitnessProfile.fitness_goal?.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.goalDescription}>
              Based on your profile, we recommend {calorieGoal} calories per day
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.profileCard}>
        <Text style={styles.cardTitle}>Fitness Profile</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Age</Text>
          <TextInput
            style={styles.formInput}
            value={fitnessProfile.age?.toString() || ''}
            onChangeText={(text) => updateProfile({ age: parseInt(text) || undefined })}
            placeholder="Enter your age"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Gender</Text>
          <View style={styles.genderButtons}>
            {(['male', 'female', 'other'] as const).map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderButton,
                  fitnessProfile.gender === gender && styles.genderButtonActive,
                ]}
                onPress={() => updateProfile({ gender })}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    fitnessProfile.gender === gender && styles.genderButtonTextActive,
                  ]}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.formLabel}>Height (cm)</Text>
            <TextInput
              style={styles.formInput}
              value={fitnessProfile.height_cm?.toString() || ''}
              onChangeText={(text) => updateProfile({ height_cm: parseInt(text) || undefined })}
              placeholder="Height"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.formLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.formInput}
              value={fitnessProfile.weight_kg?.toString() || ''}
              onChangeText={(text) => updateProfile({ weight_kg: parseInt(text) || undefined })}
              placeholder="Weight"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Activity Level</Text>
          <View style={styles.activityButtons}>
            {[
              { key: 'sedentary', label: 'Sedentary' },
              { key: 'lightly_active', label: 'Light' },
              { key: 'moderately_active', label: 'Moderate' },
              { key: 'very_active', label: 'Active' },
              { key: 'extra_active', label: 'Very Active' },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.activityButton,
                  fitnessProfile.activity_level === key && styles.activityButtonActive,
                ]}
                onPress={() => updateProfile({ activity_level: key as any })}
              >
                <Text
                  style={[
                    styles.activityButtonText,
                    fitnessProfile.activity_level === key && styles.activityButtonTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Fitness Goal</Text>
          <View style={styles.goalButtons}>
            {[
              { key: 'lose_weight', label: 'Lose Weight' },
              { key: 'maintain_weight', label: 'Maintain' },
              { key: 'gain_weight', label: 'Gain Weight' },
              { key: 'build_muscle', label: 'Build Muscle' },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.goalButton,
                  fitnessProfile.fitness_goal === key && styles.goalButtonActive,
                ]}
                onPress={() => updateProfile({ fitness_goal: key as any })}
              >
                <Text
                  style={[
                    styles.goalButtonText,
                    fitnessProfile.fitness_goal === key && styles.goalButtonTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderGoals = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.goalsCard}>
        <Text style={styles.cardTitle}>Meal Plan Goals</Text>
        <Text style={styles.cardSubtitle}>
          Create personalized meal plans based on your fitness goals
        </Text>
        
        <TouchableOpacity style={styles.createPlanButton}>
          <Text style={styles.createPlanButtonText}>Create New Meal Plan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subscriptionCard}>
        <Text style={styles.cardTitle}>Upgrade Your Journey</Text>
        <Text style={styles.cardSubtitle}>
          Get personalized nutrition coaching and advanced tracking
        </Text>
        
        <View style={styles.planCard}>
          <Text style={styles.planName}>Pro Zenith</Text>
          <Text style={styles.planPrice}>$179/month</Text>
          <Text style={styles.planFeatures}>
            • 10 meals per week{'\n'}
            • Extended menu access{'\n'}
            • Advanced tracking{'\n'}
            • Nutritionist consultation
          </Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fitness</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: <Activity size={16} color={activeTab === 'overview' ? '#10B981' : '#6B7280'} /> },
          { key: 'profile', label: 'Profile', icon: <User size={16} color={activeTab === 'profile' ? '#10B981' : '#6B7280'} /> },
          { key: 'goals', label: 'Goals', icon: <Target size={16} color={activeTab === 'goals' ? '#10B981' : '#6B7280'} /> },
        ].map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key as any)}
          >
            {icon}
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'goals' && renderGoals()}
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
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft:4,
  },
  tabTextActive: {
    color: '#10B981',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
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
  },
  statUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  macrosCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressItem: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    flex: 1,
    marginLeft: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  activityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activityButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  activityButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activityButtonTextActive: {
    color: '#FFFFFF',
  },
  goalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  goalButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  goalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  goalButtonTextActive: {
    color: '#FFFFFF',
  },
  goalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createPlanButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createPlanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 12,
  },
  planFeatures: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
