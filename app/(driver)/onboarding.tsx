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
import { useAuth } from '@/hooks/useAuth';
import { Colors, Layout } from '@/constants';
import { Button } from '@/app/_components/common/Button';
import { Car, User, Wallet, Clock, Camera, Phone, FileCheck, Shield, CreditCard, TriangleAlert as AlertTriangle } from 'lucide-react-native';

const ONBOARDING_STEPS = [
  'basics',
  'vehicle',
  'license',
  'payment',
  'availability'
];

export default function DriverOnboarding() {
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Basic info
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Vehicle info
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle' | 'bicycle' | 'scooter'>('car');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  // License & insurance
  const [driversLicense, setDriversLicense] = useState('');
  const [driversLicenseExp, setDriversLicenseExp] = useState('');
  const [insurance, setInsurance] = useState('');
  const [insuranceExp, setInsuranceExp] = useState('');

  // Payment info
  const [accountType, setAccountType] = useState<'bank' | 'paypal' | 'venmo'>('bank');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [venmoUsername, setVenmoUsername] = useState('');

  // Availability
  const [availabilitySchedule, setAvailabilitySchedule] = useState({
    monday: { available: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
    thursday: { available: true, startTime: '09:00', endTime: '17:00' },
    friday: { available: true, startTime: '09:00', endTime: '17:00' },
    saturday: { available: false, startTime: '09:00', endTime: '17:00' },
    sunday: { available: false, startTime: '09:00', endTime: '17:00' },
  });
  
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 0) {
      if (!firstName || !lastName) {
        Alert.alert('Error', 'Please enter your first and last name');
        return;
      }
      if (!phone) {
        Alert.alert('Error', 'Please enter your phone number');
        return;
      }
    } else if (currentStep === 1) {
      if (vehicleType === 'car' || vehicleType === 'motorcycle') {
        if (!make || !model || !year || !color || !licensePlate) {
          Alert.alert('Error', 'Please fill in all vehicle fields');
          return;
        }
      }
    } else if (currentStep === 2) {
      if (!driversLicense || !driversLicenseExp) {
        Alert.alert('Error', 'Please provide driver\'s license information');
        return;
      }
      if (vehicleType === 'car' || vehicleType === 'motorcycle') {
        if (!insurance || !insuranceExp) {
          Alert.alert('Error', 'Please provide insurance information');
          return;
        }
      }
    } else if (currentStep === 3) {
      if (accountType === 'bank') {
        if (!accountName || !accountNumber || !routingNumber) {
          Alert.alert('Error', 'Please fill in all banking information');
          return;
        }
      } else if (accountType === 'paypal') {
        if (!paypalEmail) {
          Alert.alert('Error', 'Please enter your PayPal email');
          return;
        }
      } else if (accountType === 'venmo') {
        if (!venmoUsername) {
          Alert.alert('Error', 'Please enter your Venmo username');
          return;
        }
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
      // Prepare driver profile data
      const driverProfile = {
        firstName,
        lastName,
        phone,
        profilePhoto,
        vehicle: {
          type: vehicleType,
          make,
          model,
          year: parseInt(year),
          color,
          licensePlate,
        },
        documents: {
          driversLicense,
          driversLicenseExp,
          insurance,
          insuranceExp,
        },
        payment: {
          method: accountType,
          details: accountType === 'bank' 
            ? { accountName, accountNumber, routingNumber } 
            : accountType === 'paypal' 
              ? { email: paypalEmail } 
              : { username: venmoUsername },
          verificationStatus: 'pending'
        },
        availability: availabilitySchedule,
        background_check_status: 'pending',
        onboarding_completed_at: new Date().toISOString(),
        active_status: 'pending_approval'
      };

      // Update user profile with collected data
      await updateProfile({
        firstName,
        lastName,
        phone,
        onboarded: true,
        preferences: {
          driverProfile: driverProfile
        }
      });
      
      // Navigate to driver app
      router.replace('/(driver)/(tabs)');
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
        <User size={24} color={Colors.driver} />
        <Text style={styles.stepTitle}>Personal Information</Text>
      </View>
      <Text style={styles.stepDescription}>
        Tell us about yourself so we can verify your identity
      </Text>

      <TouchableOpacity style={styles.photoUploadContainer} onPress={() => {
        // In a real app, this would open a photo picker
        Alert.alert('Photo Upload', 'This would open a camera or photo picker');
      }}>
        <View style={styles.photoPlaceholder}>
          <Camera size={32} color={Colors.textSecondary} />
          <Text style={styles.photoPlaceholderText}>Upload Profile Photo</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>First Name*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Last Name*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Text style={styles.helperText}>
          Make sure this is a mobile number you can be reached at while delivering
        </Text>
      </View>
    </View>
  );

  const renderVehicleStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Car size={24} color={Colors.driver} />
        <Text style={styles.stepTitle}>Vehicle Information</Text>
      </View>
      <Text style={styles.stepDescription}>
        Tell us about the vehicle you'll use for deliveries
      </Text>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Vehicle Type*</Text>
        <View style={styles.vehicleTypeContainer}>
          {[
            { id: 'car', label: 'Car', icon: Car },
            { id: 'motorcycle', label: 'Motorcycle', icon: Motorcycle },
            { id: 'bicycle', label: 'Bicycle', icon: Bicycle },
            { id: 'scooter', label: 'Scooter', icon: Scooter }
          ].map(option => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.vehicleTypeButton,
                  vehicleType === option.id && styles.vehicleTypeButtonSelected
                ]}
                onPress={() => setVehicleType(option.id as any)}
              >
                <View style={styles.vehicleIconContainer}>
                  <IconComponent 
                    size={24} 
                    color={vehicleType === option.id ? Colors.white : Colors.textSecondary} 
                  />
                </View>
                <Text style={[
                  styles.vehicleTypeText,
                  vehicleType === option.id && styles.vehicleTypeTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {(vehicleType === 'car' || vehicleType === 'motorcycle' || vehicleType === 'scooter') && (
        <>
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Make*</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Toyota"
                value={make}
                onChangeText={setMake}
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Model*</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Corolla"
                value={model}
                onChangeText={setModel}
              />
            </View>
          </View>
          
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Year*</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2020"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Color*</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Silver"
                value={color}
                onChangeText={setColor}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>License Plate*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter license plate number"
              value={licensePlate}
              onChangeText={setLicensePlate}
              autoCapitalize="characters"
            />
          </View>
          
          <TouchableOpacity style={styles.photoUploadContainer} onPress={() => {
            // In a real app, this would open a photo picker
            Alert.alert('Vehicle Photo', 'This would open a camera or photo picker');
          }}>
            <View style={styles.photoPlaceholder}>
              <Camera size={32} color={Colors.textSecondary} />
              <Text style={styles.photoPlaceholderText}>Upload Vehicle Photo</Text>
            </View>
          </TouchableOpacity>
        </>
      )}
      
      {vehicleType === 'bicycle' && (
        <View style={styles.bicycleContainer}>
          <View style={styles.infoBox}>
            <AlertTriangle size={20} color={Colors.info} />
            <Text style={[styles.infoText, { color: Colors.info }]}>
              Bicycle deliveries have a smaller delivery radius and are best for dense urban areas.
            </Text>
          </View>
          
          <TouchableOpacity style={styles.photoUploadContainer} onPress={() => {
            Alert.alert('Bicycle Photo', 'This would open a camera or photo picker');
          }}>
            <View style={styles.photoPlaceholder}>
              <Camera size={32} color={Colors.textSecondary} />
              <Text style={styles.photoPlaceholderText}>Upload Bicycle Photo</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderLicenseStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <FileCheck size={24} color={Colors.driver} />
        <Text style={styles.stepTitle}>License & Insurance</Text>
      </View>
      <Text style={styles.stepDescription}>
        We need to verify your documents for safety and compliance
      </Text>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Driver's License*</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>License Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter license number"
            value={driversLicense}
            onChangeText={setDriversLicense}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Expiration Date</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => {
              // In a real app, this would open a date picker
              Alert.alert('Date Picker', 'This would open a date picker');
            }}
          >
            <Text style={[styles.dateText, !driversLicenseExp && styles.placeholderText]}>
              {driversLicenseExp || 'MM/DD/YYYY'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.documentUploadContainer}>
          <TouchableOpacity 
            style={styles.documentUploadButton}
            onPress={() => {
              Alert.alert('Front Side', 'This would open a camera or photo picker');
            }}
          >
            <Camera size={24} color={Colors.textSecondary} />
            <Text style={styles.documentUploadText}>Front Side</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.documentUploadButton}
            onPress={() => {
              Alert.alert('Back Side', 'This would open a camera or photo picker');
            }}
          >
            <Camera size={24} color={Colors.textSecondary} />
            <Text style={styles.documentUploadText}>Back Side</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {(vehicleType === 'car' || vehicleType === 'motorcycle' || vehicleType === 'scooter') && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Vehicle Insurance*</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Policy Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter insurance policy number"
              value={insurance}
              onChangeText={setInsurance}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Expiration Date</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => {
                // In a real app, this would open a date picker
                Alert.alert('Date Picker', 'This would open a date picker');
              }}
            >
              <Text style={[styles.dateText, !insuranceExp && styles.placeholderText]}>
                {insuranceExp || 'MM/DD/YYYY'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => {
              Alert.alert('Insurance Document', 'This would open a camera or photo picker');
            }}
          >
            <Camera size={24} color={Colors.textSecondary} />
            <Text style={styles.uploadButtonText}>Upload Insurance Document</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoBox}>
        <Shield size={20} color={Colors.warning} />
        <Text style={styles.infoText}>
          Your information is secure and will only be used for verification purposes. Background checks will be conducted for safety.
        </Text>
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Wallet size={24} color={Colors.driver} />
        <Text style={styles.stepTitle}>Payment Information</Text>
      </View>
      <Text style={styles.stepDescription}>
        Set up how you would like to receive your earnings
      </Text>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Payment Method*</Text>
        <View style={styles.paymentMethodsContainer}>
          <TouchableOpacity
            style={[
              styles.paymentMethodButton,
              accountType === 'bank' && styles.paymentMethodButtonSelected
            ]}
            onPress={() => setAccountType('bank')}
          >
            <View style={[
              styles.paymentMethodIcon,
              accountType === 'bank' && { backgroundColor: Colors.driver }
            ]}>
              <CreditCard 
                size={24} 
                color={accountType === 'bank' ? Colors.white : Colors.textSecondary} 
              />
            </View>
            <Text style={[
              styles.paymentMethodText,
              accountType === 'bank' && styles.paymentMethodTextSelected
            ]}>
              Bank Account
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentMethodButton,
              accountType === 'paypal' && styles.paymentMethodButtonSelected
            ]}
            onPress={() => setAccountType('paypal')}
          >
            <View style={[
              styles.paymentMethodIcon,
              accountType === 'paypal' && { backgroundColor: Colors.driver }
            ]}>
              <PaypalIcon 
                size={24} 
                color={accountType === 'paypal' ? Colors.white : Colors.textSecondary} 
              />
            </View>
            <Text style={[
              styles.paymentMethodText,
              accountType === 'paypal' && styles.paymentMethodTextSelected
            ]}>
              PayPal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentMethodButton,
              accountType === 'venmo' && styles.paymentMethodButtonSelected
            ]}
            onPress={() => setAccountType('venmo')}
          >
            <View style={[
              styles.paymentMethodIcon,
              accountType === 'venmo' && { backgroundColor: Colors.driver }
            ]}>
              <VenmoIcon 
                size={24} 
                color={accountType === 'venmo' ? Colors.white : Colors.textSecondary} 
              />
            </View>
            <Text style={[
              styles.paymentMethodText,
              accountType === 'venmo' && styles.paymentMethodTextSelected
            ]}>
              Venmo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {accountType === 'bank' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Bank Account Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Holder Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name on account"
              value={accountName}
              onChangeText={setAccountName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Number*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter account number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              secureTextEntry={true}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Routing Number*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter routing number"
              value={routingNumber}
              onChangeText={setRoutingNumber}
              keyboardType="numeric"
            />
          </View>
        </View>
      )}

      {accountType === 'paypal' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>PayPal Account</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PayPal Email*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter PayPal email address"
              value={paypalEmail}
              onChangeText={setPaypalEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      )}

      {accountType === 'venmo' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Venmo Account</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Venmo Username*</Text>
            <View style={styles.venmoInputContainer}>
              <Text style={styles.venmoAtSymbol}>@</Text>
              <TextInput
                style={styles.venmoInput}
                placeholder="username"
                value={venmoUsername}
                onChangeText={setVenmoUsername}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>
      )}

      <View style={styles.infoBox}>
        <AlertTriangle size={20} color={Colors.info} />
        <Text style={styles.infoText}>
          Payments are processed weekly. You can also request instant payouts for a small fee.
        </Text>
      </View>
    </View>
  );

  const renderAvailabilityStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Clock size={24} color={Colors.driver} />
        <Text style={styles.stepTitle}>Availability & Terms</Text>
      </View>
      <Text style={styles.stepDescription}>
        Set your preferred delivery hours and agree to our terms
      </Text>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Preferred Delivery Hours</Text>
        <Text style={styles.helperText}>You can always update your availability later</Text>
        
        <View style={styles.availabilityContainer}>
          {Object.entries(availabilitySchedule).map(([day, { available, startTime, endTime }]) => (
            <View key={day} style={styles.dayRow}>
              <View style={styles.dayNameContainer}>
                <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Switch 
                  value={available}
                  onValueChange={(newValue) => setAvailabilitySchedule({
                    ...availabilitySchedule,
                    [day]: { ...availabilitySchedule[day as keyof typeof availabilitySchedule], available: newValue }
                  })}
                />
              </View>
              
              {available ? (
                <View style={styles.hoursInputContainer}>
                  <TouchableOpacity 
                    style={styles.timeInput}
                    onPress={() => {
                      // In a real app, this would open a time picker
                      Alert.alert('Time Picker', 'This would open a time picker in a real app');
                    }}
                  >
                    <Text style={styles.timeText}>{startTime}</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.toText}>to</Text>
                  
                  <TouchableOpacity 
                    style={styles.timeInput}
                    onPress={() => {
                      // In a real app, this would open a time picker
                      Alert.alert('Time Picker', 'This would open a time picker in a real app');
                    }}
                  >
                    <Text style={styles.timeText}>{endTime}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.unavailableText}>Unavailable</Text>
              )}
            </View>
          ))}
        </View>
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
          <View>
            <Text style={styles.termsText}>
              I agree to the Terms of Service, Privacy Policy, and Independent Contractor Agreement
            </Text>
            <TouchableOpacity>
              <Text style={styles.readMoreText}>Read the full agreements</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>What Happens Next?</Text>
        <View style={styles.nextStepsContainer}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepItemTitle}>Background Check</Text>
              <Text style={styles.stepItemText}>We'll verify your identity and run a background check</Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepItemTitle}>Verification</Text>
              <Text style={styles.stepItemText}>We'll verify your vehicle and documents</Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepItemTitle}>Activation</Text>
              <Text style={styles.stepItemText}>Once approved, you'll be ready to deliver!</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (ONBOARDING_STEPS[currentStep]) {
      case 'basics':
        return renderBasicsStep();
      case 'vehicle':
        return renderVehicleStep();
      case 'license':
        return renderLicenseStep();
      case 'payment':
        return renderPaymentStep();
      case 'availability':
        return renderAvailabilityStep();
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
              ? (loading ? 'Submitting...' : 'Submit')
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

// Mock Icon components since we don't have real implementations
function Motorcycle(props) {
  return (
    <View style={{ width: props.size, height: props.size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: props.color }}>🏍️</Text>
    </View>
  );
}

function Bicycle(props) {
  return (
    <View style={{ width: props.size, height: props.size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: props.color }}>🚲</Text>
    </View>
  );
}

function Scooter(props) {
  return (
    <View style={{ width: props.size, height: props.size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: props.color }}>🛴</Text>
    </View>
  );
}

function PaypalIcon(props) {
  return (
    <View style={{ width: props.size, height: props.size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: props.color }}>🅿️</Text>
    </View>
  );
}

function VenmoIcon(props) {
  return (
    <View style={{ width: props.size, height: props.size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: props.color }}>💸</Text>
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
        backgroundColor: value ? Colors.driver : Colors.gray[300],
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
    backgroundColor: Colors.driver + '60',
  },
  progressDotCurrent: {
    backgroundColor: Colors.driver,
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
  photoUploadContainer: {
    marginBottom: 24,
  },
  photoPlaceholder: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
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
  helperText: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 4,
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
  vehicleTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  vehicleTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: Colors.white,
  },
  vehicleTypeButtonSelected: {
    backgroundColor: Colors.driver,
    borderColor: Colors.driver,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleTypeText: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 8,
  },
  vehicleTypeTextSelected: {
    color: Colors.white,
    fontWeight: '500',
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bicycleContainer: {
    marginTop: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
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
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  documentUploadContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  documentUploadButton: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  documentUploadText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
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
    marginTop: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  paymentMethodButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: Colors.white,
  },
  paymentMethodButtonSelected: {
    borderColor: Colors.driver,
    backgroundColor: Colors.white,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 8,
  },
  paymentMethodTextSelected: {
    color: Colors.driver,
    fontWeight: '500',
  },
  venmoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
  },
  venmoAtSymbol: {
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
  },
  venmoInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  availabilityContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    marginTop: 16,
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
  unavailableText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.driver,
    borderColor: Colors.driver,
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
  readMoreText: {
    color: Colors.driver,
    fontSize: 14,
    marginTop: 4,
  },
  nextStepsContainer: {
    marginTop: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.driver,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  stepItemText: {
    fontSize: 14,
    color: Colors.textSecondary,
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