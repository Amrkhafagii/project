export interface DeliveryProof {
  id: string;
  orderId: string;
  driverId: string;
  photo: {
    uri: string;
    timestamp: Date;
    location: Location;
    fileSize: number;
  };
  signature: {
    base64: string;
    timestamp: Date;
    location: Location;
  };
  completedAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface CameraPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface SignatureData {
  base64: string;
  isEmpty: boolean;
  timestamp: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
