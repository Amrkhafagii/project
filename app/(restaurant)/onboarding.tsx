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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext'
import { Colors, Layout } from '@/constants';
import  Button  from '@/app/_components/common/Button';
import { Store, MapPin, Clock, Camera, Utensils, ChefHat, TriangleAlert as AlertTriangle } from 'lucide-react-native';

const ONBOARDING_STEPS = [
  'basics',
  'location',
  'hours',
  'cuisine',
  'verification'
];

const CUISINE_TYPES = [
  'Healthy',
  'Vegetarian',
  'Vegan',
  'Mediterranean',
  'Asian',
  'Italian',
  'Mexican',
  'American',
  'Middle Eastern',
  'Indian',
  'Paleo',
  'Keto',
  'Gluten-Free'
];

export default function RestaurantOnboarding() {
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Restaurant basics
  const [restaurantName, setRestaurantName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [website, setWebsite] = useState('');

  // Location
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('5');

  // Hours
  const [hoursData, setHoursData] = useState({
    monday: { isOpen: true, open: '09:00', close: '21:00' },
    tuesday: { isOpen: true, open: '09:00', close: '21:00' },
    wednesday: { isOpen: true, open: '09:00', close: '21:00' },
    thursday: { isOpen: true, open: '09:00', close: '21:00' },
    friday: { isOpen: true, open: '09:00', close: '22:00' },
    saturday: { isOpen: true, open: '10:00', close: '22:00' },
    sunday: { isOpen: true, open: '10:00', close: '21:00' },
  });

  // Cuisine
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(2);
  const [prepTime, setPrepTime] = useState('30');

  // Verification
  const [businessLicense, setBusinessLicense] = useState('');
  const [taxId, setTaxId] = useState('');
  const [healthPermit, setHealthPermit] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleToggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 0) {
      if (!restaurantName) {
        Alert.alert('Error', 'Please enter your restaurant name');
        return;
      }
      if (!description) {
        Alert.alert('Error', 'Please enter a description for your restaurant');
        return;
      }
    } else if (currentStep === 1) {
      if (!streetAddress || !city || !state || !zipCode) {
        Alert.alert('Error', 'Please fill in all location fields');
        return;
      }
    } else if (currentStep === 3) {
      if (selectedCuisines.length === 0) {
        Alert.alert('Error', 'Please select at least one cuisine type');
        return;
      }
    } else if (currentStep === 4) {
      if (!termsAgreed) {
        Alert.alert('Error', 'You must agree to the terms and conditions');
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
      // Prepare restaurant profile data
      const restaurantProfile = {
        restaurantName,
        description,
        phone,
        website,
        location: {
          streetAddress,
          city,
          state,
          zipCode,
          deliveryRadius: parseInt(deliveryRadius),
        },
        hours: hoursData,
        cuisines: selectedCuisines,
        priceRange,
        prepTime: parseInt(prepTime),
        verification: {
          businessLicense,
          taxId,
          healthPermit,
          verificationStatus: 'pending',
          submittedAt: new Date().toISOString(),
        }
      };

      // Update user profile with collected data
      await updateProfile({
        firstName: restaurantName.split(' ')[0],
        lastName: restaurantName.split(' ').slice(1).join(' '),
        phone,
        onboarded: true,
        preferences: {
          restaurantProfile: restaurantProfile
        }
      });
      
      // Navigate to restaurant app
      router.replace('/(restaurant)/(tabs)');
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
        <Store size={24} color={Colors.restaurant} />
        <Text style={styles.stepTitle}>Restaurant Basics</Text>
      </View>
      <Text style={styles.stepDescription}>
        Tell us about your restaurant
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Restaurant Name*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your restaurant name"
          value={restaurantName}
          onChangeText={setRestaurantName}
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description*</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your restaurant, specialty, and cuisine"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter business phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Website (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://yourrestaurant.com"
          value={website}
          onChangeText={setWebsite}
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <MapPin size={24} color={Colors.restaurant} />
        <Text style={styles.stepTitle}>Location</Text>
      </View>
      <Text style={styles.stepDescription}>
        Let customers know where to find you
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Street Address*</Text>
        <TextInput
          style={styles.input}
          placeholder="123 Main St"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />
      </View>
      
      <View style={styles.rowContainer}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>City*</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>State*</Text>
          <TextInput
            style={styles.input}
            placeholder="State"
            value={state}
            onChangeText={setState}
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Postal/Zip Code*</Text>
        <TextInput
          style={styles.input}
          placeholder="Zip Code"
          value={zipCode}
          onChangeText={setZipCode}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Delivery Radius (km)*</Text>
        <View style={styles.sliderContainer}>
          <Slider 
            value={parseInt(deliveryRadius) || 5} 
            minValue={1} 
            maxValue={20}
            onChange={(value) => setDeliveryRadius(value.toString())} 
          />
          <Text style={styles.sliderValue}>{deliveryRadius} km</Text>
        </View>
        <Text style={styles.helperText}>Maximum distance for food delivery</Text>
      </View>
      
      <TouchableOpacity style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={32} color={Colors.textSecondary} />
          <Text style={styles.mapPlaceholderText}>Tap to verify location on map</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderHoursStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Clock size={24} color={Colors.restaurant} />
        <Text style={styles.stepTitle}>Business Hours</Text>
      </View>
      <Text style={styles.stepDescription}>
        Set your operating hours
      </Text>

      <View style={styles.hoursContainer}>
        {Object.entries(hoursData).map(([day, { isOpen, open, close }]) => (
          <View key={day} style={styles.dayRow}>
            <View style={styles.dayNameContainer}>
              <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
              <Switch 
                value={isOpen}
                onValueChange={(newValue) => setHoursData({
                  ...hoursData,
                  [day]: { ...hoursData[day as keyof typeof hoursData], isOpen: newValue }
                })}
              />
            </View>
            
            {isOpen ? (
              <View style={styles.hoursInputContainer}>
                <TouchableOpacity 
                  style={styles.timeInput}
                  onPress={() => {
                    // In a real app, this would open a time picker
                    Alert.alert('Time Picker', 'This would open a time picker in a real app');
                  }}
                >
                  <Text style={styles.timeText}>{open}</Text>
                </TouchableOpacity>
                
                <Text style={styles.toText}>to</Text>
                
                <TouchableOpacity 
                  style={styles.timeInput}
                  onPress={() => {
                    // In a real app, this would open a time picker
                    Alert.alert('Time Picker', 'This would open a time picker in a real app');
                  }}
                >
                  <Text style={styles.timeText}>{close}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.closedText}>Closed</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderCuisineStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Utensils size={24} color={Colors.restaurant} />
        <Text style={styles.stepTitle}>Cuisine & Specialties</Text>
      </View>
      <Text style={styles.stepDescription}>
        Tell us about your food and pricing
      </Text>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Cuisine Types*</Text>
        <Text style={styles.helperText}>Select all that apply to your restaurant</Text>
        <View style={styles.cuisineGrid}>
          {CUISINE_TYPES.map(cuisine => (
            <TouchableOpacity 
              key={cuisine}
              style={[
                styles.cuisineButton,
                selectedCuisines.includes(cuisine) && styles.cuisineButtonSelected
              ]}
              onPress={() => handleToggleCuisine(cuisine)}
            >
              <Text style={[
                styles.cuisineButtonText,
                selectedCuisines.includes(cuisine) && styles.cuisineButtonTextSelected
              ]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Price Range*</Text>
        <Text style={styles.helperText}>Select your average price range</Text>
        <View style={styles.priceRangeContainer}>
          {[1, 2, 3, 4].map(price => (
            <TouchableOpacity 
              key={price}
              style={[
                styles.priceButton,
                priceRange === price && styles.priceButtonSelected
              ]}
              onPress={() => setPriceRange(price)}
            >
              <Text style={[
                styles.priceButtonText,
                priceRange === price && styles.priceButtonTextSelected
              ]}>
                {'$'.repeat(price)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.priceRangeDescription}>
          {priceRange === 1 ? 'Budget friendly options' :
           priceRange === 2 ? 'Moderately priced menu' :
           priceRange === 3 ? 'Higher end dining experience' :
           'Premium luxury dining'}
        </Text>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Average Preparation Time*</Text>
        <Text style={styles.helperText}>How long does it take to prepare an average order?</Text>
        <View style={styles.prepTimeContainer}>
          <TextInput
            style={styles.prepTimeInput}
            keyboardType="numeric"
            value={prepTime}
            onChangeText={setPrepTime}
          />
          <Text style={styles.prepTimeUnit}>minutes</Text>
        </View>
      </View>
    </View>
  );

  const renderVerificationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <ChefHat size={24} color={Colors.restaurant} />
        <Text style={styles.stepTitle}>Verification</Text>
      </View>
      <Text style={styles.stepDescription}>
        We need to verify your restaurant information to get you started
      </Text>

      <View style={styles.uploadContainer}>
        <Text style={styles.uploadTitle}>Business License</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Camera size={24} color={Colors.textSecondary} />
          <Text style={styles.uploadButtonText}>Upload Document</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.uploadContainer}>
        <Text style={styles.uploadTitle}>Tax ID / EIN</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Camera size={24} color={Colors.textSecondary} />
          <Text style={styles.uploadButtonText}>Upload Document</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.uploadContainer}>
        <Text style={styles.uploadTitle}>Health Department Permit</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Camera size={24} color={Colors.textSecondary} />
          <Text style={styles.uploadButtonText}>Upload Document</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.termsContainer}>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setTermsAgreed(!termsAgreed)}
        >
          <View style={[
            styles.checkbox,
            termsAgreed && styles.checkboxChecked
          ]}>
            {termsAgreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to the Terms of Service, Privacy Policy, and Restaurant Partner Agreement
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <AlertTriangle size={20} color={Colors.warning} />
        <Text style={styles.infoText}>
          You can start setting up your restaurant profile while we verify your information. This typically takes 1-2 business days.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (ONBOARDING_STEPS[currentStep]) {
      case 'basics':
        return renderBasicsStep();
      case 'location':
        return renderLocationStep();
      case 'hours':
        return renderHoursStep();
      case 'cuisine':
        return renderCuisineStep();
      case 'verification':
        return renderVerificationStep();
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

// Mock Slider component since we don't have a real implementation
function Slider({ value, minValue, maxValue, onChange }) {
  return (
    <View style={{ 
      height: 40, 
      width: '80%',
      backgroundColor: Colors.gray[100],
      borderRadius: 20,
    }}>
      <View style={{
        width: `${((value - minValue) / (maxValue - minValue)) * 100}%`,
        height: '100%',
        backgroundColor: Colors.restaurant,
        borderRadius: 20,
      }}>
      </View>
    </View>
  );
}

// Mock Switch component since we don't have the real implementation
function Switch({ value, onValueChange }) {
  return (
    <TouchableOpacity 
      style={{
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: value ? Colors.restaurant : Colors.gray[300],
        justifyContent: 'center',
        padding: 2,
      }}
      onPress={() => onValueChange(!value)}
    >
      <View style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.white,
        transform: [{ translateX: value ? 20 : 0 }],
      }} />
    </TouchableOpacity>
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
    backgroundColor: Colors.restaurant + '60',
  },
  progressDotCurrent: {
    backgroundColor: Colors.restaurant,
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
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.restaurant,
    marginLeft: 16,
  },
  helperText: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  mapContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  mapPlaceholder: {
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  hoursContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginRight: 8,
  },
  hoursInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: Colors.text,
  },
  toText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  closedText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.error,
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
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  cuisineButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    marginRight: 8,
    marginBottom: 8,
  },
  cuisineButtonSelected: {
    backgroundColor: Colors.restaurant,
  },
  cuisineButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cuisineButtonTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  priceButton: {
    width: 60,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  priceButtonSelected: {
    backgroundColor: Colors.restaurant,
    borderColor: Colors.restaurant,
  },
  priceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  priceButtonTextSelected: {
    color: Colors.white,
  },
  priceRangeDescription: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  prepTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  prepTimeInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: Colors.white,
    width: 80,
    marginRight: 12,
  },
  prepTimeUnit: {
    fontSize: 16,
    color: Colors.text,
  },
  uploadContainer: {
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    backgroundColor: Colors.gray[50],
  },
  uploadButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  termsContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 10,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.restaurant,
    borderColor: Colors.restaurant,
  },
  checkmark: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.warning + '15',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
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
