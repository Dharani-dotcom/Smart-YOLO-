import { useState, useEffect } from 'react';
import { Shield, Camera, RefreshCw } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isMonitorActive: boolean;
  anomalyCount: number;
  totalPhotosCount: number;
  onSimulateThreat: () => void;
}

export function Header({
  currentTab,
  onTabChange,
  isMonitorActive,
  anomalyCount,
  totalPhotosCount,
  onSimulateThreat,
}: HeaderProps) {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 select-none shadow-xs">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 shadow-xs">
          <Shield className="w-4 h-4 text-cyan-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Smart Shop Assistant
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            // Vision Security Console
          </span>
        </div>
      </div>

      {/* Clean Light Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
        <button
          onClick={() => onTabChange('live')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all ${
            currentTab === 'live'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Live Feed
        </button>
        <button
          onClick={() => onTabChange('photos')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
            currentTab === 'photos'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-cyan-600" />
          <span>Photos</span>
          {totalPhotosCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-semibold">
              {totalPhotosCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all ${
            currentTab === 'history'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          History
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all ${
            currentTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Settings
        </button>
      </nav>

      {/* Right Telemetry & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isMonitorActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="tabular-nums tracking-wider text-[11px] font-semibold">
            {timeString || '10:42:00'}
          </span>
        </div>

        <button
          onClick={onSimulateThreat}
          title="Simulate security event"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors whitespace-nowrap shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Simulate Event</span>
        </button>
      </div>
    </header>
  );
}
