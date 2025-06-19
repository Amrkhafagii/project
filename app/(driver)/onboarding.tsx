import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Car, MapPin, DollarSign, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to Zenith Driver',
    subtitle: 'Start earning money by delivering food to customers',
    icon: Car,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Join thousands of drivers who are already earning flexible income with Zenith.',
  },
  {
    id: 2,
    title: 'Flexible Schedule',
    subtitle: 'Work when you want, where you want',
    icon: Clock,
    image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Set your own hours and work as much or as little as you like.',
  },
  {
    id: 3,
    title: 'Navigate with Ease',
    subtitle: 'Built-in GPS and route optimization',
    icon: MapPin,
    image: 'https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Get turn-by-turn directions and find the fastest routes to your destinations.',
  },
  {
    id: 4,
    title: 'Earn More',
    subtitle: 'Competitive rates and instant payouts',
    icon: DollarSign,
    image: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Earn competitive rates with tips and get paid instantly after each delivery.',
  },
];

export default function DriverOnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace('/(driver)/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(driver)/(tabs)');
  };

  const step = onboardingSteps[currentStep];
  const IconComponent = step.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: step.image }} style={styles.image} />
          <View style={styles.iconOverlay}>
            <IconComponent color="#FFFFFF" size={32} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>

        <View style={styles.pagination}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ChevronRight color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
  },
  image: {
    width: width - 80,
    height: 280,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: '#10B981',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#10B981',
    width: 24,
  },
  inactiveDot: {
    backgroundColor: '#E5E7EB',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nextButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
