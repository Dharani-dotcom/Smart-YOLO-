import { useState } from 'react';
import { Bell, Volume2, VolumeX, ShoppingBag, CheckCheck, Trash2, PlusCircle, AlertTriangle } from 'lucide-react';
import { SecurityAlert } from '../types';

interface AlertsPanelProps {
  alerts: SecurityAlert[];
  isMonitorActive: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReviewAlert: (id: string) => void;
  onClearAlerts: () => void;
  onTriggerMockAlert: () => void;
}

export function AlertsPanel({
  alerts,
  soundEnabled,
  onToggleSound,
  onReviewAlert,
  onClearAlerts,
  onTriggerMockAlert,
}: AlertsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'pickups' | 'alerts'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'alerts') return alert.threatDetected || alert.severity === 'warning' || alert.severity === 'critical';
    if (filter === 'pickups') return !alert.threatDetected && alert.severity !== 'warning';
    return true;
  });

  const unreviewedCount = alerts.filter((a) => !a.reviewed).length;

  return (
    <aside className="w-80 lg:w-88 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Recent Shop Activity</h2>
            {unreviewedCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {unreviewedCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute notification sound' : 'Turn on notification sound'}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={onClearAlerts}
              title="Clear activity list"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Simple Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('pickups')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter === 'pickups'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Items Picked
          </button>
          <button
            onClick={() => setFilter('alerts')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter === 'alerts'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Notices
          </button>
        </div>
      </div>

      {/* Activity Feed List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/40">
        {filteredAlerts.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No shop activity in this view</p>
            <p className="text-xs text-slate-400">
              Customer face detections and item pickups will appear here automatically.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isWarning = alert.severity === 'warning' || alert.threatDetected;

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border transition-all shadow-2xs ${
                  isWarning
                    ? 'bg-amber-50/80 border-amber-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isWarning ? (
                      <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {alert.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {alert.description}
                </p>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Customer #{alert.customerId}
                    </span>
                    {alert.productId && (
                      <span className="text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Item #{alert.productId}
                      </span>
                    )}
                  </div>

                  {!alert.reviewed ? (
                    <button
                      onClick={() => onReviewAlert(alert.id)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Checked</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Quick Button */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <button
          onClick={onTriggerMockAlert}
          className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Record Sample Item Pickup</span>
        </button>
      </div>
    </aside>
  );
}
