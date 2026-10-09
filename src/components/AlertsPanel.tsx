import { useState } from 'react';
import { Bell, Volume2, VolumeX, AlertTriangle, ShieldCheck, CheckCheck, Trash2, Eye } from 'lucide-react';
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
  isMonitorActive,
  soundEnabled,
  onToggleSound,
  onReviewAlert,
  onClearAlerts,
  onTriggerMockAlert,
}: AlertsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'anomalies' | 'nominal'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'anomalies') return alert.threatDetected || alert.severity === 'warning' || alert.severity === 'critical';
    if (filter === 'nominal') return !alert.threatDetected && alert.severity !== 'warning';
    return true;
  });

  const unreviewedCount = alerts.filter((a) => !a.reviewed).length;
  const anomalyCount = alerts.filter((a) => a.threatDetected).length;

  return (
    <aside className="w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 h-full shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-wide">Live Alerts & Picking Feed</h2>
            {unreviewedCount > 0 && (
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                {unreviewedCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Disable alert sounds' : 'Enable alert sounds'}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={onClearAlerts}
              title="Clear alerts history"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter buttons - Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('anomalies')}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === 'anomalies'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anomalies ({anomalyCount})
          </button>
          <button
            onClick={() => setFilter('nominal')}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === 'nominal'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nominal
          </button>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/40">
        {filteredAlerts.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-400" />
            <p className="text-xs font-medium text-slate-600">No active alerts for this filter</p>
            <p className="text-[11px] text-slate-400">
              {isMonitorActive
                ? 'Camera monitor scanning feeds and product grasping in real-time...'
                : 'Launch camera monitor to begin automated threat & picking detection.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isWarning = alert.severity === 'warning' || alert.threatDetected;
            const isInfo = alert.severity === 'info';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border transition-all shadow-xs ${
                  isWarning
                    ? 'bg-rose-50/90 border-rose-200 hover:border-rose-300'
                    : isInfo
                    ? 'bg-blue-50/90 border-blue-200 hover:border-blue-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isWarning ? (
                      <span className="p-1 rounded bg-rose-100 text-rose-600">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-cyan-100 text-cyan-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {alert.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 font-medium">
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {alert.description}
                </p>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60 text-[11px]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-cyan-700 font-bold bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">
                      {alert.customerId}
                    </span>
                    {alert.productId && (
                      <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                        {alert.productId}
                      </span>
                    )}
                  </div>

                  {!alert.reviewed ? (
                    <button
                      onClick={() => onReviewAlert(alert.id)}
                      className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Review</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">Audited</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Quick Action */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <button
          onClick={onTriggerMockAlert}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Simulate Product Picking Incident</span>
        </button>
      </div>
    </aside>
  );
}
