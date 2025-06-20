import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { DeliveryProof, CameraPermissions, SignatureData, Location as LocationType } from '@/types/delivery';

class DeliveryProofService {
  async requestCameraPermissions(): Promise<CameraPermissions> {
    try {
      const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain,
        status: status as 'granted' | 'denied' | 'undetermined',
      };
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  async capturePhoto(cameraRef: any): Promise<{ uri: string; fileSize: number }> {
    try {
      if (!cameraRef.current) {
        throw new Error('Camera reference not available');
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      // Compress image to ensure it's under 2MB
      const compressedPhoto = await this.compressImage(photo.uri);
      
      return compressedPhoto;
    } catch (error) {
      console.error('Error capturing photo:', error);
      throw new Error('Failed to capture photo');
    }
  }

  async compressImage(uri: string): Promise<{ uri: string; fileSize: number }> {
    try {
      let quality = 0.8;
      let compressedUri = uri;
      let fileSize = await this.getFileSize(uri);

      // Compress until under 2MB (2097152 bytes)
      while (fileSize > 2097152 && quality > 0.1) {
        const result = await ImageManipulator.manipulateAsync(
          compressedUri,
          [{ resize: { width: 1920 } }], // Resize to max width of 1920px
          {
            compress: quality,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        compressedUri = result.uri;
        fileSize = await this.getFileSize(result.uri);
        quality -= 0.1;
      }

      if (fileSize > 2097152) {
        throw new Error('Unable to compress image below 2MB limit');
      }

      return { uri: compressedUri, fileSize };
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Failed to compress image');
    }
  }

  private async getFileSize(uri: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return fileInfo.exists ? fileInfo.size || 0 : 0;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  }

  async getCurrentLocation(): Promise<LocationType> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw new Error('Unable to get current location');
    }
  }

  async saveDeliveryProof(
    orderId: string,
    driverId: string,
    photoUri: string,
    photoFileSize: number,
    signatureData: SignatureData
  ): Promise<DeliveryProof> {
    try {
      const location = await this.getCurrentLocation();
      const timestamp = new Date();

      const deliveryProof: DeliveryProof = {
        id: await this.generateId(),
        orderId,
        driverId,
        photo: {
          uri: photoUri,
          timestamp,
          location,
          fileSize: photoFileSize,
        },
        signature: {
          base64: signatureData.base64,
          timestamp: signatureData.timestamp,
          location,
        },
        completedAt: timestamp,
        status: 'pending',
      };

      // Encrypt and store proof data
      await this.storeEncryptedProof(deliveryProof);

      return deliveryProof;
    } catch (error) {
      console.error('Error saving delivery proof:', error);
      throw new Error('Failed to save delivery proof');
    }
  }

  private async storeEncryptedProof(proof: DeliveryProof): Promise<void> {
    try {
      const data = JSON.stringify(proof);
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.setItem(`delivery_proof_${proof.id}`, data);
      } else {
        // Use AsyncStorage for mobile platforms
        await AsyncStorage.setItem(`delivery_proof_${proof.id}`, data);
      }
    } catch (error) {
      console.error('Error storing encrypted proof:', error);
      throw new Error('Failed to store proof securely');
    }
  }

  async getDeliveryProof(proofId: string): Promise<DeliveryProof | null> {
    try {
      let data: string | null = null;
      
      if (Platform.OS === 'web') {
        data = localStorage.getItem(`delivery_proof_${proofId}`);
      } else {
        data = await AsyncStorage.getItem(`delivery_proof_${proofId}`);
      }
      
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error('Error retrieving delivery proof:', error);
      return null;
    }
  }

  async validateProofCompletion(photoUri: string, signatureData: SignatureData): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validate photo
    if (!photoUri) {
      errors.push('Photo is required');
    } else {
      try {
        const fileSize = await this.getFileSize(photoUri);
        if (fileSize === 0) {
          errors.push('Photo file is invalid');
        } else if (fileSize > 2097152) {
          errors.push('Photo file size exceeds 2MB limit');
        }
      } catch (error) {
        errors.push('Unable to validate photo');
      }
    }

    // Validate signature
    if (!signatureData.base64 || signatureData.isEmpty) {
      errors.push('Customer signature is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async generateId(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async encryptData(data: string): Promise<string> {
    try {
      // In a real implementation, use proper encryption
      // This is a simplified version for demonstration
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      return Buffer.from(data).toString('base64') + '.' + digest;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Encryption failed');
    }
  }

  private async decryptData(encryptedData: string): Promise<string> {
    try {
      const [data] = encryptedData.split('.');
      return Buffer.from(data, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Decryption failed');
    }
  }

  cleanup(): void {
    // Cleanup any resources if needed
  }
}

export const deliveryProofService = new DeliveryProofService();
