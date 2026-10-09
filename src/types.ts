export type TabType = 'live' | 'photos' | 'history' | 'analytics' | 'settings';

export type AlertSeverity = 'normal' | 'info' | 'warning' | 'critical';

export interface SecurityAlert {
  id: string;
  timestamp: string;
  timeEpoch: number;
  camera: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  customerId?: string;
  productId?: string;
  confidence: number;
  location: string;
  reviewed: boolean;
  threatDetected: boolean;
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'standby' | 'offline';
  fps: number;
  resolution: string;
  fov: string;
  zone: string;
}

export interface ShopChannel {
  id: string;
  name: string;
  shopType: 'electronics' | 'supermarket' | 'boutique' | 'checkout';
  storeName: string;
  zone: string;
  activeCustomer: string;
  customerName: string;
  activeProduct: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  description: string;
  videoUrl?: string;
}

export interface DetectionRecord {
  id: string;
  timestamp: string;
  camera: string;
  category: 'Customer Entry' | 'VIP Customer' | 'Loitering' | 'Unattended Item' | 'Suspicious Movement' | 'Checkout Clearance' | 'Product Interaction';
  customerId: string;
  productId?: string;
  confidence: number;
  status: 'Nominal' | 'Flagged' | 'Resolved';
  actionTaken: string;
  zone: string;
}

export interface RealTimePhoto {
  id: string;
  imageUrl: string;
  timestamp: string;
  timeEpoch: number;
  camera: string;
  location: string;
  customerId: string;
  customerName?: string;
  customerConfidence: number;
  faceBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  productId: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  productConfidence: number;
  productBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  eventStatus: 'Nominal Inspection' | 'VIP Interaction' | 'Cart Added' | 'High-Risk Dwell' | 'Checkout Scan';
  threatSeverity: 'normal' | 'info' | 'warning';
  notes?: string;
}

export interface SystemSettingsState {
  aiConfidenceThreshold: number;
  alertSoundEnabled: boolean;
  autoFlagLoitering: boolean;
  loiteringThresholdSeconds: number;
  facialRecognitionActive: boolean;
  recordingResolution: string;
  retentionDays: number;
  streamOptimization: 'ultra-low-latency' | 'balanced' | 'high-definition';
}
