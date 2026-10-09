/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { TabType, SecurityAlert, CameraFeed, DetectionRecord, SystemSettingsState, RealTimePhoto } from './types';
import { INITIAL_CAMERAS, INITIAL_ALERTS, INITIAL_HISTORY, DEFAULT_SETTINGS, INITIAL_REALTIME_PHOTOS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LiveFeedView } from './components/LiveFeedView';
import { AlertsPanel } from './components/AlertsPanel';
import { RealTimePhotosView } from './components/RealTimePhotosView';
import { DetectionsHistoryView } from './components/DetectionsHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SystemSettingsView } from './components/SystemSettingsView';
import { playAlertChime } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('live');
  const [isMonitorActive, setIsMonitorActive] = useState(true);
  const [cameras, setCameras] = useState<CameraFeed[]>(INITIAL_CAMERAS);
  const [activeCameraId, setActiveCameraId] = useState<string>(INITIAL_CAMERAS[1].id); // Default to Electronics camera
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [history, setHistory] = useState<DetectionRecord[]>(INITIAL_HISTORY);
  const [photos, setPhotos] = useState<RealTimePhoto[]>(INITIAL_REALTIME_PHOTOS);
  const [settings, setSettings] = useState<SystemSettingsState>(DEFAULT_SETTINGS);
  const [totalScans, setTotalScans] = useState(1482);
  const [flaggedAlertTrigger, setFlaggedAlertTrigger] = useState(0);

  // Reference to track mock generation counter
  const mockAlertIdxRef = useRef(0);

  // Periodically increment total scans today when monitor is active
  useEffect(() => {
    if (!isMonitorActive) return;
    const interval = setInterval(() => {
      setTotalScans((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, [isMonitorActive]);

  // Dynamic alert generator when camera is active (showing Face Square Customer ID & Product ID sync)
  useEffect(() => {
    if (!isMonitorActive) return;

    const mockPool = [
      {
        title: 'Face Square Locked - Customer ID #1042',
        description: 'Retina match verified. Customer inspecting Product ID #PRD-8821 (iPhone 16 Pro).',
        severity: 'normal' as const,
        customerId: 'CUST-1042',
        productId: 'PRD-8821',
        threatDetected: false,
        category: 'Product Interaction' as const,
        zone: 'Electronics Showcase',
      },
      {
        title: 'Product ID #PRD-1290 Inspected by VIP-9041',
        description: 'Customer face square identified VIP Club member. Luxury fragrance #PRD-1290 lifted.',
        severity: 'info' as const,
        customerId: 'VIP-9041',
        productId: 'PRD-1290',
        threatDetected: false,
        category: 'VIP Customer' as const,
        zone: 'Fragrance Island',
      },
      {
        title: 'Loitering Alert - Product ID #PRD-4019',
        description: 'Face square tracked for > 3 minutes holding high-value headphones #PRD-4019.',
        severity: 'warning' as const,
        customerId: 'ANON-7712',
        productId: 'PRD-4019',
        threatDetected: true,
        category: 'Loitering' as const,
        zone: 'Shelf 3A (Electronics)',
      },
      {
        title: 'Checkout Scanned - Product ID #PRD-3301',
        description: 'Customer ID #CUST-3910 verified at POS terminal. Security EAS tag cleared.',
        severity: 'normal' as const,
        customerId: 'CUST-3910',
        productId: 'PRD-3301',
        threatDetected: false,
        category: 'Checkout Clearance' as const,
        zone: 'Checkout Lane 4',
      },
      {
        title: 'Face Square Mapped - Customer ID #1042',
        description: 'Customer transit nominal. No threat detected in Aisle 4B.',
        severity: 'normal' as const,
        customerId: 'CUST-1042',
        productId: 'PRD-8821',
        threatDetected: false,
        category: 'Customer Entry' as const,
        zone: 'Central Promenade',
      },
    ];

    const alertInterval = setInterval(() => {
      const activeCam = cameras.find((c) => c.id === activeCameraId) || cameras[0];
      const template = mockPool[mockAlertIdxRef.current % mockPool.length];
      mockAlertIdxRef.current += 1;

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newAlert: SecurityAlert = {
        id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: timeStr,
        timeEpoch: Date.now(),
        camera: activeCam.name,
        title: template.title,
        description: template.description,
        severity: template.severity,
        customerId: template.customerId,
        confidence: 89 + Math.random() * 10,
        location: template.zone,
        reviewed: false,
        threatDetected: template.threatDetected,
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 49)]);

      // Also add to audit detection history
      const newHistoryItem: DetectionRecord = {
        id: `DET-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timeStr,
        camera: activeCam.name.split(':')[0],
        category: template.category,
        customerId: template.customerId,
        productId: template.productId,
        confidence: newAlert.confidence,
        status: template.threatDetected ? 'Flagged' : 'Nominal',
        actionTaken: template.threatDetected
          ? 'Store associate dispatched to assist'
          : 'Face square & Product ID synced to audit ledger',
        zone: template.zone,
      };

      setHistory((prev) => [newHistoryItem, ...prev]);

      if (settings.alertSoundEnabled) {
        playAlertChime(template.severity);
      }

      if (template.threatDetected) {
        setFlaggedAlertTrigger((prev) => prev + 1);
      }
    }, 6500);

    return () => clearInterval(alertInterval);
  }, [isMonitorActive, activeCameraId, cameras, settings.alertSoundEnabled]);

  // Primary toggle handler for "Launch Camera Monitor" / "Stop Camera Monitor"
  const handleToggleMonitor = () => {
    setIsMonitorActive((prev) => {
      const next = !prev;
      if (next && settings.alertSoundEnabled) {
        playAlertChime('normal');
      }
      return next;
    });
  };

  // Manual simulation of security incident
  const handleSimulateIncident = () => {
    const activeCam = cameras.find((c) => c.id === activeCameraId) || cameras[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const incidentAlert: SecurityAlert = {
      id: `alt-${Date.now()}`,
      timestamp: timeStr,
      timeEpoch: Date.now(),
      camera: activeCam.name,
      title: 'Suspicious Dwell Anomaly - Product ID #PRD-4019',
      description: 'Customer face square #ANON-9014 stationary near display cabinet holding #PRD-4019 for 210s.',
      severity: 'warning',
      customerId: 'ANON-9014',
      confidence: 94.6,
      location: activeCam.zone,
      reviewed: false,
      threatDetected: true,
    };

    setAlerts((prev) => [incidentAlert, ...prev]);

    setHistory((prev) => [
      {
        id: `DET-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timeStr,
        camera: activeCam.name.split(':')[0],
        category: 'Suspicious Movement',
        customerId: 'ANON-9014',
        productId: 'PRD-4019',
        confidence: 94.6,
        status: 'Flagged',
        actionTaken: 'Simulated alert prompt forwarded to security tablet',
        zone: activeCam.zone,
      },
      ...prev,
    ]);

    setFlaggedAlertTrigger((prev) => prev + 1);

    if (settings.alertSoundEnabled) {
      playAlertChime('critical');
    }
  };

  // Handle capture of real-time photo from video frame
  const handleCaptureSnapshot = (snapshotData: {
    imageUrl: string;
    customerId: string;
    productId: string;
    productName: string;
    productPrice: number;
    productCategory: string;
    customerConfidence: number;
    cameraName: string;
    location: string;
  }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newPhoto: RealTimePhoto = {
      id: `PHOTO-${Math.floor(100 + Math.random() * 900)}`,
      imageUrl: snapshotData.imageUrl,
      timestamp: timeStr,
      timeEpoch: Date.now(),
      camera: snapshotData.cameraName,
      location: snapshotData.location,
      customerId: snapshotData.customerId,
      customerName: snapshotData.customerId === 'CUST-LOCAL' ? 'You (Local User)' : 'Retail Customer',
      customerConfidence: snapshotData.customerConfidence,
      faceBox: { x: 375, y: 135, width: 68, height: 78 },
      productId: snapshotData.productId,
      productName: snapshotData.productName,
      productPrice: snapshotData.productPrice,
      productCategory: snapshotData.productCategory,
      productConfidence: 98.2,
      productBox: { x: 470, y: 220, width: 66, height: 80 },
      eventStatus: 'Nominal Inspection',
      threatSeverity: 'normal',
      notes: `Live snapshot captured with Face Square (Customer ID: #${snapshotData.customerId}) and Product ID: #${snapshotData.productId}.`,
    };

    setPhotos((prev) => [newPhoto, ...prev]);

    // Also add to audit record
    const newRecord: DetectionRecord = {
      id: `SNAP-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: timeStr,
      camera: snapshotData.cameraName.split(':')[0],
      category: 'Product Interaction',
      customerId: snapshotData.customerId,
      productId: snapshotData.productId,
      confidence: snapshotData.customerConfidence,
      status: 'Nominal',
      actionTaken: 'Operator real-time photo captured and archived',
      zone: snapshotData.location,
    };

    setHistory((prev) => [newRecord, ...prev]);

    if (settings.alertSoundEnabled) {
      playAlertChime('normal');
    }
  };

  // Review single alert
  const handleReviewAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, reviewed: true } : a))
    );
  };

  // Clear alerts list
  const handleClearAlerts = () => {
    setAlerts([]);
  };

  const activeAnomalyCount = alerts.filter(
    (a) => a.threatDetected && !a.reviewed
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isMonitorActive={isMonitorActive}
        anomalyCount={activeAnomalyCount}
        totalPhotosCount={photos.length}
        onSimulateThreat={handleSimulateIncident}
      />

      {/* Main Workspace: Sidebar + Center Content Area + Optional Right Alerts Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          isMonitorActive={isMonitorActive}
          anomalyCount={activeAnomalyCount}
          totalAlertsCount={history.length}
          totalPhotosCount={photos.length}
        />

        {/* Center Content Viewport */}
        <main className="flex-1 flex overflow-hidden bg-slate-50">
          {currentTab === 'live' && (
            <>
              {/* Primary Live Monitoring Window */}
              <LiveFeedView
                cameras={cameras}
                activeCameraId={activeCameraId}
                onSelectCamera={setActiveCameraId}
                isMonitorActive={isMonitorActive}
                onToggleMonitor={handleToggleMonitor}
                totalScans={totalScans}
                anomalyCount={activeAnomalyCount}
                totalPhotosCount={photos.length}
                flaggedAlertTrigger={flaggedAlertTrigger}
                onCaptureSnapshot={handleCaptureSnapshot}
                onNavigateToPhotos={() => setCurrentTab('photos')}
              />

              {/* Secondary Alerts Panel on the right */}
              <AlertsPanel
                alerts={alerts}
                isMonitorActive={isMonitorActive}
                soundEnabled={settings.alertSoundEnabled}
                onToggleSound={() =>
                  setSettings({
                    ...settings,
                    alertSoundEnabled: !settings.alertSoundEnabled,
                  })
                }
                onReviewAlert={handleReviewAlert}
                onClearAlerts={handleClearAlerts}
                onTriggerMockAlert={handleSimulateIncident}
              />
            </>
          )}

          {currentTab === 'photos' && (
            <RealTimePhotosView
              photos={photos}
              onTakeLivePhoto={() => {
                setCurrentTab('live');
              }}
              isMonitorActive={isMonitorActive}
            />
          )}

          {currentTab === 'history' && (
            <DetectionsHistoryView records={history} />
          )}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'settings' && (
            <SystemSettingsView
              settings={settings}
              onUpdateSettings={setSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}
