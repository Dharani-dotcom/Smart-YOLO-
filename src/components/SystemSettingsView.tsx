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
    <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl bg-slate-50/80">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Hardware Config</h1>
          <p className="text-xs text-slate-500 mt-1">
            Surveillance AI hyperparameters, biometric thresholds, and storage quotas
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
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
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Security parameters successfully committed to edge gateway controllers.</span>
        </div>
      )}

      {/* Group 1: AI Detection & Vision Engine */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Sliders className="w-4 h-4 text-cyan-600" />
          <h2 className="text-sm font-bold text-slate-900">Neural Detection Parameters</h2>
        </div>

        {/* AI Confidence Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-700 font-semibold">
              Biometric Match Confidence Threshold
            </label>
            <span className="font-mono text-cyan-800 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
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
            className="w-full accent-cyan-600 bg-slate-200 rounded h-2 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Detections below this match probability will be classified as anonymous visitors.
          </p>
        </div>

        {/* Facial Recognition Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="text-xs font-bold text-slate-900">Facial Recognition Vector Extraction</div>
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
              localSettings.facialRecognitionActive ? 'bg-cyan-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                localSettings.facialRecognitionActive ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Auto Flag Loitering Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="text-xs font-bold text-slate-900">Auto-Flag Extended Dwell / Loitering</div>
            <div className="text-[11px] text-slate-500">
              Automatically triggers associate alert when face square remains stationary for threshold duration
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
              localSettings.autoFlagLoitering ? 'bg-cyan-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                localSettings.autoFlagLoitering ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Group 2: Audio & Alert Notifications */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Bell className="w-4 h-4 text-cyan-600" />
          <h2 className="text-sm font-bold text-slate-900">Audio Telemetry & Notifications</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">Audible Surveillance Alert Chime</div>
            <div className="text-[11px] text-slate-500">
              Plays acoustic frequency tone when priority warning or threat event occurs
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
              localSettings.alertSoundEnabled ? 'bg-cyan-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                localSettings.alertSoundEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Group 3: Video Streaming & Hardware */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Video className="w-4 h-4 text-cyan-600" />
          <h2 className="text-sm font-bold text-slate-900">Camera Resolution & Compression</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Stream Quality</label>
            <select
              value={localSettings.recordingResolution}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, recordingResolution: e.target.value as any })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="1080p">1080p Full HD (Recommended)</option>
              <option value="1440p">1440p 2K Ultra HD</option>
              <option value="4K">4K UHD High Density</option>
              <option value="720p">720p Low Bandwidth</option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Storage Retention Period</label>
            <select
              value={localSettings.retentionDays}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, retentionDays: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value={7}>7 Days (GDPR Compliance)</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days (Standard Audit)</option>
              <option value={90}>90 Days (Enterprise)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
