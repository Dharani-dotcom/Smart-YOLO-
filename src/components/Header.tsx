import { Store, Camera, PlusCircle, Database, ExternalLink } from 'lucide-react';
import { TabType } from '../types';
import { FIRESTORE_CONSOLE_URL } from '../firebase';

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
  totalPhotosCount,
  onSimulateThreat,
}: HeaderProps) {
  return (
    <header className="h-14 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 select-none shadow-2xs">
      {/* Shopkeeper Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
          <Store className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Smart Shop Assistant
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            · Store CCTV & Customer Manager
          </span>
        </div>
      </div>

      {/* Simple Shopkeeper Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
        <button
          onClick={() => onTabChange('live')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentTab === 'live'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Live Cameras
        </button>
        <button
          onClick={() => onTabChange('photos')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            currentTab === 'photos'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>Saved Snapshots</span>
          {totalPhotosCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
              {totalPhotosCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentTab === 'history'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Customer & Sales Log
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Shop Reports
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Database & Settings
        </button>
      </nav>

      {/* Right Status & Quick Actions */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
          <span
            className={`w-2 h-2 rounded-full ${
              isMonitorActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{isMonitorActive ? 'Cameras Online' : 'Cameras Paused'}</span>
        </div>

        <a
          href={FIRESTORE_CONSOLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Firebase Shop Database"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors whitespace-nowrap"
        >
          <Database className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Firebase Database</span>
          <ExternalLink className="w-3 h-3 text-amber-600" />
        </a>

        <button
          onClick={onSimulateThreat}
          title="Record a sample customer item pickup"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Log Sample Pickup</span>
        </button>
      </div>
    </header>
  );
}
