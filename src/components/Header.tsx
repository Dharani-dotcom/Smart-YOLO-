import { useState, useEffect } from 'react';
import { Shield, Radio, Bell, RefreshCw } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isMonitorActive: boolean;
  anomalyCount: number;
  onSimulateThreat: () => void;
}

export function Header({
  currentTab,
  onTabChange,
  isMonitorActive,
  anomalyCount,
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
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-[#0d131f] shrink-0">
      {/* Zone 1: Single text element Brand Zone */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Shield className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white">
          Smart Shop Assistant
        </span>
      </div>

      {/* Zone 2: Clean 4-6 text navigation links */}
      <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
        <button
          onClick={() => onTabChange('live')}
          className={`transition-colors hover:text-white ${
            currentTab === 'live' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Live Feed
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`transition-colors hover:text-white ${
            currentTab === 'history' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Detections History
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`transition-colors hover:text-white ${
            currentTab === 'analytics' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`transition-colors hover:text-white ${
            currentTab === 'settings' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          System Settings
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions / live telemetry */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isMonitorActive
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-amber-500'
            }`}
          />
          <span className="tabular-nums tracking-wider">{timeString || '10:42:00'}</span>
        </div>

        <button
          onClick={onSimulateThreat}
          title="Trigger a simulated anomaly detection event"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors whitespace-nowrap"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulate Event</span>
        </button>
      </div>
    </header>
  );
}
