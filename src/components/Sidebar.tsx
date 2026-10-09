import { Video, Camera, Clock, BarChart3, Settings, ShieldAlert, Cpu } from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isMonitorActive: boolean;
  anomalyCount: number;
  totalAlertsCount: number;
  totalPhotosCount: number;
}

export function Sidebar({
  currentTab,
  onTabChange,
  isMonitorActive,
  anomalyCount,
  totalAlertsCount,
  totalPhotosCount,
}: SidebarProps) {
  const navItems = [
    {
      id: 'live' as TabType,
      label: 'Live Monitoring',
      icon: Video,
      badge: isMonitorActive ? 'Online' : 'Standby',
      badgeColor: isMonitorActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'photos' as TabType,
      label: 'Real-Time Photos',
      icon: Camera,
      badge: `${totalPhotosCount}`,
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
    {
      id: 'history' as TabType,
      label: 'Detections History',
      icon: Clock,
      badge: `${totalAlertsCount}`,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics & Traffic',
      icon: BarChart3,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'settings' as TabType,
      label: 'System Settings',
      icon: Settings,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none shadow-xs">
      <div className="p-3.5 space-y-5">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Console
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-900 border border-cyan-200/90 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quiet System Status Widget */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Cpu className="w-3.5 h-3.5 text-cyan-600" />
              Vision AI Engine
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isMonitorActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
              {isMonitorActive ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span>Face Square</span>
              <span className="text-slate-800 font-mono text-[10px] font-semibold">Active Biometrics</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Product Picker</span>
              <span className="text-slate-800 font-mono text-[10px] font-semibold">Grasp Detection</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Flagged Events</span>
              <span className={`font-mono text-[10px] font-bold ${anomalyCount > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                {anomalyCount} Flagged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
          <span>Security Terminal 01</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 font-bold">v4.2 PRO</span>
      </div>
    </aside>
  );
}
