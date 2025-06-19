import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import SignatureScreen from 'react-native-signature-canvas';
import * as Haptics from 'expo-haptics';
import {
  Camera as CameraIcon,
  Check,
  X,
  RotateCcw,
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react-native';
import { deliveryProofService } from '@/services/delivery/deliveryProofService';
import { DeliveryProof, SignatureData } from '@/types/delivery';

const { width, height } = Dimensions.get('window');

interface DeliveryOrder {
  id: string;
  customerName: string;
  deliveryAddress: string;
  items: number;
  total: number;
}

export default function DeliveryProofScreen() {
  const cameraRef = useRef<Camera>(null);
  const signatureRef = useRef<any>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoFileSize, setPhotoFileSize] = useState<number>(0);
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'photo' | 'signature' | 'review'>('photo');

  // Mock delivery order
  const [deliveryOrder] = useState<DeliveryOrder>({
    id: 'ORD-001',
    customerName: 'Sarah Johnson',
    deliveryAddress: '456 Wellness Ave, Apt 2B',
    items: 3,
    total: 42.50,
  });

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const cameraPermissions = await deliveryProofService.requestCameraPermissions();
      const mediaPermissions = await deliveryProofService.requestMediaLibraryPermissions();
      
      setHasPermission(cameraPermissions.granted && mediaPermissions);
      
      if (!cameraPermissions.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access to capture delivery photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {} },
          ]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      setHasPermission(false);
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await deliveryProofService.capturePhoto(cameraRef);
      setCapturedPhoto(result.uri);
      setPhotoFileSize(result.fileSize);
      setShowCamera(false);
      setCurrentStep('signature');
      
      Alert.alert('Photo Captured', 'Now please get the customer signature');
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert('Photo Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setPhotoFileSize(0);
    setCurrentStep('photo');
    setShowCamera(true);
  };

  const handleSignature = (signature: string) => {
    const signatureData: SignatureData = {
      base64: signature,
      isEmpty: false,
      timestamp: new Date(),
    };
    
    setSignatureData(signatureData);
    setShowSignature(false);
    setCurrentStep('review');
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Signature Captured', 'Please review and complete the delivery');
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
  };

  const retakeSignature = () => {
    setSignatureData(null);
    setCurrentStep('signature');
    setShowSignature(true);
  };

  const completeDelivery = async () => {
    if (!capturedPhoto || !signatureData) {
      Alert.alert('Incomplete Proof', 'Both photo and signature are required');
      return;
    }

    try {
      setIsProcessing(true);

      // Validate proof completion
      const validation = await deliveryProofService.validateProofCompletion(
        capturedPhoto,
        signatureData
      );

      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      // Save delivery proof
      const deliveryProof = await deliveryProofService.saveDeliveryProof(
        deliveryOrder.id,
        'driver_123', // In real app, get from auth context
        capturedPhoto,
        photoFileSize,
        signatureData
      );

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Delivery Complete!',
        'Proof has been saved and the customer has been notified.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset state for next delivery
              resetDeliveryProof();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Delivery completion error:', error);
      Alert.alert('Error', 'Failed to complete delivery. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDeliveryProof = () => {
    setCapturedPhoto(null);
    setPhotoFileSize(0);
    setSignatureData(null);
    setCurrentStep('photo');
    setShowCamera(false);
    setShowSignature(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Requesting permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Camera Access Required</Text>
          <Text style={styles.errorMessage}>
            Please enable camera permissions to capture delivery photos
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={requestPermissions}>
            <Text style={styles.retryButtonText}>Request Permissions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Delivery Proof</Text>
        <View style={styles.stepIndicator}>
          <View style={[styles.step, currentStep === 'photo' && styles.activeStep]}>
            <Text style={[styles.stepText, currentStep === 'photo' && styles.activeStepText]}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.step, currentStep === 'signature' && styles.activeStep]}>
            <Text style={[styles.stepText, currentStep === 'signature' && styles.activeStepText]}>2</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.step, currentStep === 'review' && styles.activeStep]}>
            <Text style={[styles.stepText, currentStep === 'review' && styles.activeStepText]}>3</Text>
          </View>
        </View>
      </View>

      {/* Order Info */}
      <View style={styles.orderInfo}>
        <View style={styles.orderHeader}>
          <MapPin size={20} color="#F97316" />
          <Text style={styles.orderTitle}>Order {deliveryOrder.id}</Text>
        </View>
        <Text style={styles.customerName}>{deliveryOrder.customerName}</Text>
        <Text style={styles.deliveryAddress}>{deliveryOrder.deliveryAddress}</Text>
        <Text style={styles.orderDetails}>
          {deliveryOrder.items} items • ${deliveryOrder.total.toFixed(2)}
        </Text>
      </View>

      {/* Content based on current step */}
      <View style={styles.content}>
        {currentStep === 'photo' && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <CameraIcon size={24} color="#F97316" />
              <Text style={styles.stepTitle}>Step 1: Take Delivery Photo</Text>
            </View>
            <Text style={styles.stepDescription}>
              Capture a clear photo of the delivered items at the customer's location
            </Text>
            
            {capturedPhoto ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
                <View style={styles.photoInfo}>
                  <Text style={styles.photoSize}>Size: {formatFileSize(photoFileSize)}</Text>
                  <Text style={styles.photoTimestamp}>
                    Captured: {new Date().toLocaleTimeString()}
                  </Text>
                </View>
                <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                  <RotateCcw size={16} color="#F97316" />
                  <Text style={styles.retakeButtonText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.captureButton}
                onPress={() => setShowCamera(true)}
              >
                <CameraIcon size={32} color="#FFFFFF" />
                <Text style={styles.captureButtonText}>Take Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {currentStep === 'signature' && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <FileText size={24} color="#F97316" />
              <Text style={styles.stepTitle}>Step 2: Customer Signature</Text>
            </View>
            <Text style={styles.stepDescription}>
              Ask the customer to sign to confirm delivery receipt
            </Text>
            
            {signatureData ? (
              <View style={styles.signaturePreview}>
                <View style={styles.signatureContainer}>
                  <Text style={styles.signatureLabel}>Customer Signature:</Text>
                  <Image 
                    source={{ uri: `data:image/png;base64,${signatureData.base64}` }} 
                    style={styles.signatureImage} 
                  />
                </View>
                <TouchableOpacity style={styles.retakeButton} onPress={retakeSignature}>
                  <RotateCcw size={16} color="#F97316" />
                  <Text style={styles.retakeButtonText}>Retake Signature</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.captureButton}
                onPress={() => setShowSignature(true)}
              >
                <FileText size={32} color="#FFFFFF" />
                <Text style={styles.captureButtonText}>Get Signature</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {currentStep === 'review' && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Check size={24} color="#10B981" />
              <Text style={styles.stepTitle}>Step 3: Review & Complete</Text>
            </View>
            <Text style={styles.stepDescription}>
              Review the captured proof and complete the delivery
            </Text>
            
            <View style={styles.reviewContainer}>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Photo:</Text>
                <View style={styles.reviewStatus}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.reviewStatusText}>Captured ({formatFileSize(photoFileSize)})</Text>
                </View>
              </View>
              
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Signature:</Text>
                <View style={styles.reviewStatus}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.reviewStatusText}>Obtained</Text>
                </View>
              </View>
              
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Location:</Text>
                <View style={styles.reviewStatus}>
                  <MapPin size={16} color="#10B981" />
                  <Text style={styles.reviewStatusText}>GPS Recorded</Text>
                </View>
              </View>
              
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Timestamp:</Text>
                <View style={styles.reviewStatus}>
                  <Clock size={16} color="#10B981" />
                  <Text style={styles.reviewStatusText}>{new Date().toLocaleString()}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={completeDelivery}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.completeButtonText}>Complete Delivery</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            ratio="16:9"
          />
          
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(false)}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.capturePhotoButton}
              onPress={capturePhoto}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.capturePhotoInner} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setCameraType(
                cameraType === CameraType.back ? CameraType.front : CameraType.back
              )}
            >
              <RotateCcw size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Signature Modal */}
      <Modal visible={showSignature} animationType="slide">
        <SafeAreaView style={styles.signatureModal}>
          <View style={styles.signatureHeader}>
            <Text style={styles.signatureTitle}>Customer Signature</Text>
            <TouchableOpacity onPress={() => setShowSignature(false)}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.signatureInstructions}>
            Please ask the customer to sign below to confirm delivery receipt
          </Text>
          
          <View style={styles.signatureCanvas}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={() => Alert.alert('Empty Signature', 'Please provide a signature')}
              descriptionText=""
              clearText="Clear"
              confirmText="Confirm"
              webStyle={`
                .m-signature-pad {
                  box-shadow: none;
                  border: 2px solid #E5E7EB;
                  border-radius: 8px;
                }
                .m-signature-pad--body {
                  border: none;
                }
                .m-signature-pad--footer {
                  display: none;
                }
              `}
            />
          </View>
          
          <View style={styles.signatureActions}>
            <TouchableOpacity style={styles.clearSignatureButton} onPress={clearSignature}>
              <Text style={styles.clearSignatureText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmSignatureButton}
              onPress={() => signatureRef.current?.readSignature()}
            >
              <Text style={styles.confirmSignatureText}>Confirm Signature</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#F97316',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeStepText: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  orderInfo: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  orderDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  captureButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  photoPreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: width - 40,
    height: (width - 40) * 0.75,
    borderRadius: 12,
    marginBottom: 16,
  },
  photoInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photoSize: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  photoTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  signaturePreview: {
    alignItems: 'center',
  },
  signatureContainer: {
    width: '100%',
    marginBottom: 16,
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  signatureImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  retakeButtonText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewStatusText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
  },
  completeButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturePhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturePhotoInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F97316',
  },
  signatureModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  signatureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  signatureInstructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  signatureCanvas: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  signatureActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  clearSignatureButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  clearSignatureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmSignatureButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F97316',
    alignItems: 'center',
  },
  confirmSignatureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
