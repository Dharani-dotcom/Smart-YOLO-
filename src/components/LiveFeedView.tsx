import { useState } from 'react';
import {
  Video,
  Power,
  Grid,
  Box,
  Flame,
  Camera,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertOctagon,
  Users,
  Scan,
} from 'lucide-react';
import { CameraFeed } from '../types';
import { CameraCanvas } from './CameraCanvas';

interface LiveFeedViewProps {
  cameras: CameraFeed[];
  activeCameraId: string;
  onSelectCamera: (id: string) => void;
  isMonitorActive: boolean;
  onToggleMonitor: () => void;
  totalScans: number;
  anomalyCount: number;
  flaggedAlertTrigger: number;
  onCaptureSnapshot: (cameraName: string) => void;
}

export function LiveFeedView({
  cameras,
  activeCameraId,
  onSelectCamera,
  isMonitorActive,
  onToggleMonitor,
  totalScans,
  anomalyCount,
  flaggedAlertTrigger,
  onCaptureSnapshot,
}: LiveFeedViewProps) {
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showScanGrid, setShowScanGrid] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snapshotFeedback, setSnapshotFeedback] = useState<string | null>(null);

  const activeCamera =
    cameras.find((c) => c.id === activeCameraId) || cameras[0];

  const handleSnapshot = () => {
    onCaptureSnapshot(activeCamera.name);
    setSnapshotFeedback('Snapshot archived to Detections History');
    setTimeout(() => setSnapshotFeedback(null), 2500);
  };

  return (
    <div className="flex-1 flex flex-col p-5 overflow-y-auto space-y-5">
      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Surveillance Operations Center
            </h1>
            <span
              className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded ${
                isMonitorActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isMonitorActive ? 'SYSTEM ACTIVE' : 'SYSTEM STANDBY'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time biometric computer vision and store loss prevention stream
          </p>
        </div>

        {/* Primary Toggle Button as specified in prompt: "Launch Camera Monitor" */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMonitor}
            className={`px-4 py-2.5 rounded font-medium text-xs tracking-wide transition-all duration-200 flex items-center gap-2 shadow-lg ${
              isMonitorActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40 ring-1 ring-rose-400/50'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-cyan-950/40 hover:shadow-cyan-500/20'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {isMonitorActive ? 'Stop Camera Monitor' : 'Launch Camera Monitor'}
            </span>
          </button>
        </div>
      </div>

      {/* Counter Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Widget 1: Active Cameras */}
        <div className="p-4 rounded bg-[#0d131f] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Cameras</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {isMonitorActive ? `${cameras.length} / ${cameras.length}` : '0 / 4'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isMonitorActive ? 'All RTSP streams operational' : 'Feeds on standby'}
            </div>
          </div>
          <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Video className="w-5 h-5" />
          </div>
        </div>

        {/* Widget 2: Total Scans Today */}
        <div className="p-4 rounded bg-[#0d131f] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Scans Today</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {totalScans.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Real-time face verification</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Scan className="w-5 h-5" />
          </div>
        </div>

        {/* Widget 3: Active Flagged Anomalies */}
        <div className="p-4 rounded bg-[#0d131f] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Flagged Anomalies</div>
            <div
              className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                anomalyCount > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {anomalyCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {anomalyCount > 0 ? 'Review dispatched floor alerts' : 'No critical incidents'}
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded border flex items-center justify-center ${
              anomalyCount > 0
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-400'
            }`}
          >
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        {/* Widget 4: Store Occupancy / Presence */}
        <div className="p-4 rounded bg-[#0d131f] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Store Occupancy</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300 mt-1">
              {isMonitorActive ? '42 Visitors' : '18 Recorded'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Max capacity: 150 patrons
            </div>
          </div>
          <div className="w-10 h-10 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Monitoring Window */}
      <div className="p-4 rounded-lg bg-[#0d131f] border border-slate-800 space-y-3.5">
        {/* Camera Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {cameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => onSelectCamera(cam.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeCameraId === cam.id
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cam.name.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Quick HUD toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              title="Toggle AI Target Bounding Boxes"
              className={`p-1.5 rounded text-xs border transition-colors flex items-center gap-1.5 ${
                showBoundingBoxes
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bounding Boxes</span>
            </button>

            <button
              onClick={() => setShowScanGrid(!showScanGrid)}
              title="Toggle Laser Scanline & Radar"
              className={`p-1.5 rounded text-xs border transition-colors flex items-center gap-1.5 ${
                showScanGrid
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan Grid</span>
            </button>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              title="Toggle Foot-Traffic Heatmap"
              className={`p-1.5 rounded text-xs border transition-colors flex items-center gap-1.5 ${
                showHeatmap
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Heatmap</span>
            </button>

            <button
              onClick={handleSnapshot}
              title="Capture snapshot and save to audit log"
              className="p-1.5 rounded text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Snapshot</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle full panel preview"
              className="p-1.5 rounded text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Snapshot feedback toast */}
        {snapshotFeedback && (
          <div className="p-2 rounded bg-cyan-950/80 border border-cyan-700/60 text-xs text-cyan-300 flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              {snapshotFeedback}
            </span>
          </div>
        )}

        {/* Canvas Screen */}
        <div className={isFullscreen ? 'fixed inset-4 z-50 bg-black/95 p-4 rounded-lg flex flex-col justify-center' : ''}>
          {isFullscreen && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono text-cyan-400">{activeCamera.name}</span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded"
              >
                Close Fullscreen
              </button>
            </div>
          )}

          <CameraCanvas
            camera={activeCamera}
            isActive={isMonitorActive}
            showBoundingBoxes={showBoundingBoxes}
            showScanGrid={showScanGrid}
            showHeatmap={showHeatmap}
            flaggedAlertTrigger={flaggedAlertTrigger}
          />
        </div>

        {/* Camera Details Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">{activeCamera.name}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{activeCamera.location}</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>RES: {activeCamera.resolution}</span>
            <span aria-hidden="true" className="text-slate-700">|</span>
            <span>BITRATE: 4.8 Mbps</span>
            <span aria-hidden="true" className="text-slate-700">|</span>
            <span>CODEC: H.265+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
