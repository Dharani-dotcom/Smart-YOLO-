import { useState } from 'react';
import { Sliders, Bell, Shield, Video, HardDrive, Check, Save } from 'lucide-react';
import { SystemSettingsState } from '../types';

interface SystemSettingsViewProps {
  settings: SystemSettingsState;
  onUpdateSettings: (newSettings: SystemSettingsState) => void;
}

export function SystemSettingsView({
  settings,
  onUpdateSettings,
}: SystemSettingsViewProps) {
  const [localSettings, setLocalSettings] = useState<SystemSettingsState>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Settings & Hardware Config</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Surveillance AI hyperparameters, biometric thresholds, and storage quotas
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs rounded transition-colors"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-slate-950" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-700/60 rounded text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Security parameters successfully committed to edge gateway controllers.</span>
        </div>
      )}

      {/* Group 1: AI Detection & Vision Engine */}
      <div className="p-5 rounded-lg bg-[#0d131f] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Neural Detection Parameters</h2>
        </div>

        {/* AI Confidence Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-300 font-medium">
              Biometric Match Confidence Threshold
            </label>
            <span className="font-mono text-cyan-400 font-semibold">
              {localSettings.aiConfidenceThreshold}%
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="98"
            value={localSettings.aiConfidenceThreshold}
            onChange={(e) =>
              setLocalSettings({ ...localSettings, aiConfidenceThreshold: Number(e.target.value) })
            }
            className="w-full accent-cyan-500 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Detections below this match probability will be classified as anonymous visitors.
          </p>
        </div>

        {/* Facial Recognition Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-xs font-medium text-slate-200">Facial Recognition Vector Extraction</div>
            <div className="text-[11px] text-slate-500">
              Matches customer faces against VIP register and known loss-prevention profiles
            </div>
          </div>
          <button
            onClick={() =>
              setLocalSettings({
                ...localSettings,
                facialRecognitionActive: !localSettings.facialRecognitionActive,
              })
            }
            className={`w-11 h-6 rounded-full transition-colors relative ${
              localSettings.facialRecognitionActive ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                localSettings.facialRecognitionActive ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Loitering Alert Threshold */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-xs font-medium text-slate-200">Auto-Flag Loitering & Extended Dwell</div>
            <div className="text-[11px] text-slate-500">
              Dispatches floor associate prompt when stationary in high-theft aisles
            </div>
          </div>
          <button
            onClick={() =>
              setLocalSettings({
                ...localSettings,
                autoFlagLoitering: !localSettings.autoFlagLoitering,
              })
            }
            className={`w-11 h-6 rounded-full transition-colors relative ${
              localSettings.autoFlagLoitering ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                localSettings.autoFlagLoitering ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {localSettings.autoFlagLoitering && (
          <div className="pt-2">
            <label className="text-xs text-slate-300 block mb-1">
              Loitering Trigger Duration: {localSettings.loiteringThresholdSeconds} seconds
            </label>
            <input
              type="range"
              min="60"
              max="360"
              step="30"
              value={localSettings.loiteringThresholdSeconds}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  loiteringThresholdSeconds: Number(e.target.value),
                })
              }
              className="w-full accent-cyan-500 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Group 2: Audio & Notification Alerts */}
      <div className="p-5 rounded-lg bg-[#0d131f] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Audio & Incident Dispatch</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-200">Acoustic Alert Chimes</div>
            <div className="text-[11px] text-slate-500">
              Plays acoustic synthesized chimes on anomaly triggers and VIP identifications
            </div>
          </div>
          <button
            onClick={() =>
              setLocalSettings({
                ...localSettings,
                alertSoundEnabled: !localSettings.alertSoundEnabled,
              })
            }
            className={`w-11 h-6 rounded-full transition-colors relative ${
              localSettings.alertSoundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                localSettings.alertSoundEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Group 3: Video Stream & Hardware */}
      <div className="p-5 rounded-lg bg-[#0d131f] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Video className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">RTSP Video Encoding & Storage</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Recording Quality</label>
            <select
              value={localSettings.recordingResolution}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, recordingResolution: e.target.value })
              }
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="1080p Full HD (60 FPS)">1080p Full HD (60 FPS)</option>
              <option value="1440p Quad HD (30 FPS)">1440p Quad HD (30 FPS)</option>
              <option value="4K Ultra HD (30 FPS)">4K Ultra HD (30 FPS)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Stream Optimization</label>
            <select
              value={localSettings.streamOptimization}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  streamOptimization: e.target.value as 'ultra-low-latency' | 'balanced' | 'high-definition',
                })
              }
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ultra-low-latency">Ultra-Low Latency (Real-time tracking)</option>
              <option value="balanced">Balanced (Optimal bandwidth)</option>
              <option value="high-definition">High Definition (Forensic clarity)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-300 font-medium">Audit Log Retention Policy</label>
            <span className="font-mono text-cyan-400">{localSettings.retentionDays} Days</span>
          </div>
          <input
            type="range"
            min="7"
            max="90"
            step="7"
            value={localSettings.retentionDays}
            onChange={(e) =>
              setLocalSettings({ ...localSettings, retentionDays: Number(e.target.value) })
            }
            className="w-full accent-cyan-500 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
