import { Video, Clock, BarChart3, Settings, ShieldAlert, Cpu } from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isMonitorActive: boolean;
  anomalyCount: number;
  totalAlertsCount: number;
}

export function Sidebar({
  currentTab,
  onTabChange,
  isMonitorActive,
  anomalyCount,
  totalAlertsCount,
}: SidebarProps) {
  const navItems = [
    {
      id: 'live' as TabType,
      label: 'Live Feed',
      icon: Video,
      badge: isMonitorActive ? 'ACTIVE' : 'IDLE',
      badgeColor: isMonitorActive ? 'text-emerald-400' : 'text-slate-500',
    },
    {
      id: 'history' as TabType,
      label: 'Detections History',
      icon: Clock,
      badge: `${totalAlertsCount}`,
      badgeColor: 'text-slate-400',
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
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
    <aside className="w-64 bg-[#0a0e17] border-r border-slate-800/80 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Surveillance Console
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono tabular-nums ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live System Engine Status */}
        <div className="p-3.5 rounded bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Vision AI Engine
            </span>
            <span
              className={`text-[11px] font-mono ${
                isMonitorActive ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {isMonitorActive ? 'Scanning' : 'Standby'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between items-center text-[11px]">
              <span>Active Cameras</span>
              <span className="font-mono tabular-nums text-slate-200">
                {isMonitorActive ? '4 / 4 Online' : '4 Standby'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Flagged Incidents</span>
              <span
                className={`font-mono tabular-nums font-semibold ${
                  anomalyCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {anomalyCount} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Security Station #04</span>
        </div>
        <span className="font-mono text-slate-400">v2.4.0</span>
      </div>
    </aside>
  );
}
