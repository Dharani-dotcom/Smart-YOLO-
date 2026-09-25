/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { TabType, SecurityAlert, CameraFeed, DetectionRecord, SystemSettingsState } from './types';
import { INITIAL_CAMERAS, INITIAL_ALERTS, INITIAL_HISTORY, DEFAULT_SETTINGS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LiveFeedView } from './components/LiveFeedView';
import { AlertsPanel } from './components/AlertsPanel';
import { DetectionsHistoryView } from './components/DetectionsHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SystemSettingsView } from './components/SystemSettingsView';
import { playAlertChime } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('live');
  const [isMonitorActive, setIsMonitorActive] = useState(false);
  const [cameras, setCameras] = useState<CameraFeed[]>(INITIAL_CAMERAS);
  const [activeCameraId, setActiveCameraId] = useState<string>(INITIAL_CAMERAS[0].id);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [history, setHistory] = useState<DetectionRecord[]>(INITIAL_HISTORY);
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

  // Dynamic alert generator when camera is active (as specified by user requirements)
  useEffect(() => {
    if (!isMonitorActive) return;

    const mockPool = [
      {
        title: 'Face Detected - Customer ID #1042',
        description: 'Biometric vector verified. Regular retail customer profile matched.',
        severity: 'normal' as const,
        customerId: 'CUST-1042',
        threatDetected: false,
        category: 'Customer Entry' as const,
        zone: 'Entrance Foyer',
      },
      {
        title: 'No Threat Detected',
        description: 'Aisle scan completed nominal. Clear patron transit without obstruction.',
        severity: 'normal' as const,
        customerId: 'CUST-1205',
        threatDetected: false,
        category: 'Customer Entry' as const,
        zone: 'Aisle 2 - Housewares',
      },
      {
        title: 'Face Detected - Customer ID #3910',
        description: 'Facial vector match confidence 97.4%. Registered store member.',
        severity: 'normal' as const,
        customerId: 'CUST-3910',
        threatDetected: false,
        category: 'Customer Entry' as const,
        zone: 'Central Promenade',
      },
      {
        title: 'VIP Customer Identified - Elite Tier',
        description: 'Priority rewards member identified. Concierge tablet updated.',
        severity: 'info' as const,
        customerId: 'VIP-7701',
        threatDetected: false,
        category: 'VIP Customer' as const,
        zone: 'Fragrance Island',
      },
      {
        title: 'Loitering Alert - Prolonged Dwell (> 3 min)',
        description: 'Customer dwell time exceeded threshold at high-value display case.',
        severity: 'warning' as const,
        customerId: 'ANON-8832',
        threatDetected: true,
        category: 'Loitering' as const,
        zone: 'Electronics Showcase',
      },
      {
        title: 'No Threat Detected',
        description: 'Automated optical cycle nominal across checkout terminals.',
        severity: 'normal' as const,
        customerId: 'CUST-5519',
        threatDetected: false,
        category: 'Checkout Clearance' as const,
        zone: 'Checkout Lane 4',
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
        confidence: newAlert.confidence,
        status: template.threatDetected ? 'Flagged' : 'Nominal',
        actionTaken: template.threatDetected
          ? 'Store associate dispatched to assist'
          : 'Logged to standard traffic audit',
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
      title: 'Suspicious Dwell Anomaly - Aisle 4B',
      description: 'Customer detected stationary near locked inventory cabinet for 210s.',
      severity: 'warning',
      customerId: 'ANON-9014',
      confidence: 94.6,
      location: 'Electronics - Locked Bay',
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
        confidence: 94.6,
        status: 'Flagged',
        actionTaken: 'Simulated alert prompt forwarded to security tablet',
        zone: 'Electronics Aisle 4B',
      },
      ...prev,
    ]);

    setFlaggedAlertTrigger((prev) => prev + 1);

    if (settings.alertSoundEnabled) {
      playAlertChime('critical');
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

  // Take snapshot of active camera
  const handleCaptureSnapshot = (cameraName: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newRecord: DetectionRecord = {
      id: `SNAP-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: timeStr,
      camera: cameraName.split(':')[0],
      category: 'Customer Entry',
      customerId: `OPERATOR-SNAP`,
      confidence: 99.8,
      status: 'Nominal',
      actionTaken: 'Manual operator CCTV snapshot archived',
      zone: 'Live Frame Capture',
    };

    setHistory((prev) => [newRecord, ...prev]);
  };

  const activeAnomalyCount = alerts.filter(
    (a) => a.threatDetected && !a.reviewed
  ).length;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isMonitorActive={isMonitorActive}
        anomalyCount={activeAnomalyCount}
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
        />

        {/* Center Content Viewport */}
        <main className="flex-1 flex overflow-hidden bg-[#090d16]">
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
                flaggedAlertTrigger={flaggedAlertTrigger}
                onCaptureSnapshot={handleCaptureSnapshot}
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
