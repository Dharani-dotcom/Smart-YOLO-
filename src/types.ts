export type TabType = 'live' | 'history' | 'analytics' | 'settings';

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
}

export interface DetectionRecord {
  id: string;
  timestamp: string;
  camera: string;
  category: 'Customer Entry' | 'VIP Customer' | 'Loitering' | 'Unattended Item' | 'Suspicious Movement' | 'Checkout Clearance';
  customerId: string;
  confidence: number;
  status: 'Nominal' | 'Flagged' | 'Resolved';
  actionTaken: string;
  zone: string;
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
