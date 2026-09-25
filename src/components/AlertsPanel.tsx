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
    <aside className="w-80 lg:w-96 bg-[#0a0e17] border-l border-slate-800/80 flex flex-col justify-between shrink-0 h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide">Live Alerts Feed</h2>
            {unreviewedCount > 0 && (
              <span className="text-[11px] font-mono font-medium text-cyan-400">
                ({unreviewedCount} new)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Disable alert sounds' : 'Enable alert sounds'}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
            <button
              onClick={onClearAlerts}
              title="Clear alerts history"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter buttons - Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
              filter === 'all'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('anomalies')}
            className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
              filter === 'anomalies'
                ? 'bg-slate-800 text-rose-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Anomalies ({anomalyCount})
          </button>
          <button
            onClick={() => setFilter('nominal')}
            className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
              filter === 'nominal'
                ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nominal
          </button>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-600" />
            <p className="text-xs">No active alerts for this filter</p>
            <p className="text-[11px] text-slate-600">
              {isMonitorActive
                ? 'Camera monitor scanning feeds in real-time...'
                : 'Launch camera monitor to begin automated threat scanning.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isWarning = alert.severity === 'warning' || alert.threatDetected;
            const isInfo = alert.severity === 'info';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded border transition-all ${
                  isWarning
                    ? 'bg-rose-950/20 border-rose-800/50 hover:border-rose-700/80'
                    : isInfo
                    ? 'bg-blue-950/20 border-blue-800/40 hover:border-blue-700/70'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                } ${!alert.reviewed ? 'ring-1 ring-cyan-500/30' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isWarning ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : isInfo ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <h3 className="text-xs font-semibold text-slate-200 leading-tight">
                      {alert.title}
                    </h3>
                  </div>

                  <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  {alert.description}
                </p>

                {/* Metadata Row: Zero-pill clean text separated by dots */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                  <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
                    <span className="text-slate-300">{alert.location}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-cyan-400">{alert.confidence.toFixed(1)}% Conf</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {!alert.reviewed ? (
                      <button
                        onClick={() => onReviewAlert(alert.id)}
                        title="Mark alert as acknowledged and reviewed"
                        className="px-2 py-0.5 text-[10px] font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50 rounded flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Panel Action Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isMonitorActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            {isMonitorActive ? 'AI Stream Ingesting' : 'Stream Paused'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Poll: 3.5s
          </span>
        </div>

        <button
          onClick={onTriggerMockAlert}
          className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>Inject Test Detection Alert</span>
        </button>
      </div>
    </aside>
  );
}
