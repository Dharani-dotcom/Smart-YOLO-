import { Video, Camera, Clock, BarChart3, Settings, Store, CheckCircle2 } from 'lucide-react';
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
  totalAlertsCount,
  totalPhotosCount,
}: SidebarProps) {
  const navItems = [
    {
      id: 'live' as TabType,
      label: 'Live Shop Cameras',
      icon: Video,
      badge: isMonitorActive ? 'Live' : 'Paused',
      badgeColor: isMonitorActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'photos' as TabType,
      label: 'Saved Snapshots',
      icon: Camera,
      badge: `${totalPhotosCount}`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'history' as TabType,
      label: 'Customer & Sales Log',
      icon: Clock,
      badge: `${totalAlertsCount}`,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'analytics' as TabType,
      label: 'Shop Reports',
      icon: BarChart3,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'settings' as TabType,
      label: 'Database & Settings',
      icon: Settings,
      badge: 'Cloud',
      badgeColor: 'bg-amber-100 text-amber-800 font-semibold',
    },
  ];

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3.5 space-y-5">
        {/* Store Navigation */}
        <div className="space-y-1">
          <div className="px-2.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Shop Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Simple Shop Status Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Detection Status
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span>Face Square</span>
              <span className="text-emerald-700 font-semibold">YOLO Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Item Tracking</span>
              <span className="text-amber-700 font-semibold">Shelf & Hand</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Store Cameras</span>
              <span className="text-slate-900 font-semibold">8 Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Footer */}
      <div className="p-3.5 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Store className="w-3.5 h-3.5 text-emerald-600" />
          <span>Main Shop Counter</span>
        </div>
        <span className="text-[11px] text-emerald-700 font-semibold">Online</span>
      </div>
    </aside>
  );
}
