import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import  Button  from '@/app/_components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Layout } from '@/constants';
import { TriangleAlert as AlertTriangle, ChevronRight, Image as ImageIcon, MapPin, User } from 'lucide-react-native';

const ONBOARDING_STEPS = [
  'basics',
  'dietary',
  'fitness',
  'preferences',
];

export default function CustomerOnboarding() {
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Basic info
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Dietary preferences
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  
  // Fitness goals
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  
  // Preferences
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    orderUpdates: true,
    promotions: true,
    recommendations: true,
  });

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'keto', label: 'Keto' },
    { id: 'paleo', label: 'Paleo' },
    { id: 'gluten_free', label: 'Gluten Free' },
    { id: 'dairy_free', label: 'Dairy Free' },
    { id: 'pescatarian', label: 'Pescatarian' },
    { id: 'no_restrictions', label: 'No Restrictions' },
  ];

  const allergyOptions = [
    { id: 'peanuts', label: 'Peanuts' },
    { id: 'tree_nuts', label: 'Tree Nuts' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'wheat', label: 'Wheat' },
    { id: 'soy', label: 'Soy' },
    { id: 'fish', label: 'Fish' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'no_allergies', label: 'No Allergies' },
  ];

  const fitnessGoalOptions = [
    { id: 'lose_weight', label: 'Lose Weight' },
    { id: 'maintain_weight', label: 'Maintain Weight' },
    { id: 'gain_muscle', label: 'Gain Muscle' },
    { id: 'improve_health', label: 'Improve Health' },
    { id: 'increase_energy', label: 'Increase Energy' },
  ];

  const activityOptions = [
    { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { id: 'light', label: 'Light', description: '1-3 days/week' },
    { id: 'moderate', label: 'Moderate', description: '3-5 days/week' },
    { id: 'active', label: 'Active', description: '6-7 days/week' },
    { id: 'very_active', label: 'Very Active', description: '2x per day' },
  ];

  const categoryOptions = [
    { id: 'healthy', label: 'Healthy' },
    { id: 'protein', label: 'High Protein' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'low_carb', label: 'Low Carb' },
    { id: 'smoothies', label: 'Smoothies & Juices' },
    { id: 'bowls', label: 'Power Bowls' },
  ];

  const toggleDietaryOption = (id: string) => {
    setDietaryPreferences(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleAllergyOption = (id: string) => {
    setAllergies(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleFitnessGoal = (id: string) => {
    setFitnessGoals(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setFavoriteCategories(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 0) {
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Error', 'Please enter your first and last name');
        return;
      }
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      // Prepare fitness profile if data is entered
      let fitnessProfile = undefined;
      if (height && weight) {
        fitnessProfile = {
          height: parseInt(height),
          weight: parseInt(weight),
          activityLevel,
          goals: fitnessGoals,
        };
      }

      // Prepare customer preferences
      const customerPreferences = {
        dietaryRestrictions: dietaryPreferences,
        allergies,
        favoriteCategories,
        notificationSettings: notificationPreferences,
      };

      // Update user profile with collected data
      await updateProfile({
        firstName,
        lastName,
        phone,
        preferences: customerPreferences,
        fitnessProfile,
        onboarded: true,
      });
      
      // Navigate to customer app
      router.replace('/(customer)/(tabs)');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicsStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <User size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Basic Information</Text>
      </View>
      <Text style={styles.stepDescription}>
        Tell us a bit about yourself so we can personalize your experience
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.stepNote}>
        <AlertTriangle size={16} color={Colors.warning} />
        <Text style={styles.stepNoteText}>
          Your phone number helps us deliver your orders more efficiently
        </Text>
      </View>
    </View>
  );

  const renderDietaryStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <ImageIcon size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Dietary Preferences</Text>
      </View>
      <Text style={styles.stepDescription}>
        Let us know about your dietary preferences and restrictions
      </Text>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        <View style={styles.optionsGrid}>
          {dietaryOptions.map(option => (
            <TouchableOpacity 
              key={option.id}
              style={[
                styles.optionButton,
                dietaryPreferences.includes(option.id) && styles.optionButtonSelected
              ]}
              onPress={() => toggleDietaryOption(option.id)}
            >
              <Text style={[
                styles.optionButtonText,
                dietaryPreferences.includes(option.id) && styles.optionButtonTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Allergies & Intolerances</Text>
        <View style={styles.optionsGrid}>
          {allergyOptions.map(option => (
            <TouchableOpacity 
              key={option.id}
              style={[
                styles.optionButton,
                allergies.includes(option.id) && styles.optionButtonSelected
              ]}
              onPress={() => toggleAllergyOption(option.id)}
            >
              <Text style={[
                styles.optionButtonText,
                allergies.includes(option.id) && styles.optionButtonTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderFitnessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <ImageIcon size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Fitness Profile</Text>
      </View>
      <Text style={styles.stepDescription}>
        Tell us about your fitness goals to help us recommend suitable meals
      </Text>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Fitness Goals</Text>
        <View style={styles.optionsGrid}>
          {fitnessGoalOptions.map(option => (
            <TouchableOpacity 
              key={option.id}
              style={[
                styles.optionButton,
                fitnessGoals.includes(option.id) && styles.optionButtonSelected
              ]}
              onPress={() => toggleFitnessGoal(option.id)}
            >
              <Text style={[
                styles.optionButtonText,
                fitnessGoals.includes(option.id) && styles.optionButtonTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Height"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Activity Level</Text>
        <View style={styles.activityLevelContainer}>
          {activityOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.activityButton,
                activityLevel === option.id && styles.activityButtonSelected
              ]}
              onPress={() => setActivityLevel(option.id)}
            >
              <View style={styles.activityButtonContent}>
                <Text style={[
                  styles.activityButtonLabel,
                  activityLevel === option.id && styles.activityButtonLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.activityButtonDescription}>
                  {option.description}
                </Text>
              </View>
              <View style={[
                styles.activitySelector,
                activityLevel === option.id && styles.activitySelectorSelected
              ]}>
                {activityLevel === option.id && (
                  <View style={styles.activitySelectorDot} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.stepNote}>
        <AlertTriangle size={16} color={Colors.warning} />
        <Text style={styles.stepNoteText}>
          This information helps us calculate optimal nutrition for your meals
        </Text>
      </View>
    </View>
  );

  const renderPreferencesStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <MapPin size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Preferences</Text>
      </View>
      <Text style={styles.stepDescription}>
        Set your favorite categories and notification preferences
      </Text>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Favorite Categories</Text>
        <Text style={styles.sectionSubtitle}>
          We'll highlight these categories in your feed
        </Text>
        <View style={styles.optionsGrid}>
          {categoryOptions.map(option => (
            <TouchableOpacity 
              key={option.id}
              style={[
                styles.optionButton,
                favoriteCategories.includes(option.id) && styles.optionButtonSelected
              ]}
              onPress={() => toggleCategory(option.id)}
            >
              <Text style={[
                styles.optionButtonText,
                favoriteCategories.includes(option.id) && styles.optionButtonTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <Text style={styles.sectionSubtitle}>
          Choose which notifications you'd like to receive
        </Text>
        
        <View style={styles.notificationOption}>
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>Order Updates</Text>
            <Text style={styles.notificationDescription}>
              Get notified about order status changes
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              notificationPreferences.orderUpdates && styles.toggleButtonActive
            ]}
            onPress={() => setNotificationPreferences(prev => ({
              ...prev,
              orderUpdates: !prev.orderUpdates
            }))}
          >
            <View style={[
              styles.toggleThumb,
              notificationPreferences.orderUpdates && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.notificationOption}>
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>Promotions & Deals</Text>
            <Text style={styles.notificationDescription}>
              Get notified about special offers and discounts
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              notificationPreferences.promotions && styles.toggleButtonActive
            ]}
            onPress={() => setNotificationPreferences(prev => ({
              ...prev,
              promotions: !prev.promotions
            }))}
          >
            <View style={[
              styles.toggleThumb,
              notificationPreferences.promotions && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.notificationOption}>
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>Recommendations</Text>
            <Text style={styles.notificationDescription}>
              Get personalized meal recommendations
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              notificationPreferences.recommendations && styles.toggleButtonActive
            ]}
            onPress={() => setNotificationPreferences(prev => ({
              ...prev,
              recommendations: !prev.recommendations
            }))}
          >
            <View style={[
              styles.toggleThumb,
              notificationPreferences.recommendations && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (ONBOARDING_STEPS[currentStep]) {
      case 'basics':
        return renderBasicsStep();
      case 'dietary':
        return renderDietaryStep();
      case 'fitness':
        return renderFitnessStep();
      case 'preferences':
        return renderPreferencesStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.progressDot, 
                index <= currentStep && styles.progressDotActive,
                index === currentStep && styles.progressDotCurrent
              ]}
            />
          ))}
        </View>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {renderCurrentStep()}
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handlePreviousStep}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <Button
            title={currentStep === ONBOARDING_STEPS.length - 1 
              ? (loading ? 'Completing...' : 'Complete')
              : 'Next'
            }
            onPress={handleNextStep}
            disabled={loading}
            loading={loading}
            style={[styles.nextButton, currentStep === 0 && styles.fullWidthButton]}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[200],
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: Colors.primary + '60',
  },
  progressDotCurrent: {
    backgroundColor: Colors.primary,
    width: 16,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stepContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 4,
    backgroundColor: Colors.white,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: Colors.primary,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityLevelContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  activityButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityButtonSelected: {
    backgroundColor: Colors.primary + '10',
  },
  activityButtonContent: {
    flex: 1,
  },
  activityButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  activityButtonLabelSelected: {
    color: Colors.primary,
  },
  activityButtonDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activitySelector: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    marginLeft: 16,
  },
  activitySelectorSelected: {
    borderColor: Colors.primary,
  },
  activitySelectorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 3,
    marginLeft: 3,
  },
  notificationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.gray[300],
    justifyContent: 'center',
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  stepNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  stepNoteText: {
    fontSize: 14,
    color: Colors.warning,
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
  },
  fullWidthButton: {
    marginLeft: 0,
  },
});
