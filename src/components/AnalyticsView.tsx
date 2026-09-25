import { BarChart3, TrendingUp, Users, ShieldAlert, Clock, ArrowUpRight } from 'lucide-react';

export function AnalyticsView() {
  const hourlyTraffic = [
    { hour: '08:00', visitors: 14, anomalies: 0 },
    { hour: '09:00', visitors: 28, anomalies: 1 },
    { hour: '10:00', visitors: 62, anomalies: 2 },
    { hour: '11:00', visitors: 89, anomalies: 1 },
    { hour: '12:00', visitors: 114, anomalies: 3 },
    { hour: '13:00', visitors: 98, anomalies: 2 },
    { hour: '14:00', visitors: 76, anomalies: 0 },
    { hour: '15:00', visitors: 84, anomalies: 1 },
    { hour: '16:00', visitors: 102, anomalies: 2 },
    { hour: '17:00', visitors: 125, anomalies: 4 },
  ];

  const departmentMetrics = [
    { name: 'High-Value Electronics', scans: 480, flagRate: '2.8%', dwellAvg: '4m 12s', risk: 'Medium' },
    { name: 'Main Entrance & Foyer', scans: 742, flagRate: '0.4%', dwellAvg: '18s', risk: 'Low' },
    { name: 'Cashier & POS Checkout', scans: 512, flagRate: '1.1%', dwellAvg: '1m 45s', risk: 'Low' },
    { name: 'Fragrance & Cosmetics', scans: 310, flagRate: '3.2%', dwellAvg: '5m 30s', risk: 'Medium' },
  ];

  const maxVisitors = Math.max(...hourlyTraffic.map((d) => d.visitors));

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Security & Foot-Traffic Analytics</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time spatial dwell metrics, department risk profiling, and loss prevention trends
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-[#0d131f] border border-slate-800">
          <span className="text-xs text-slate-400">Total Patrons Monitored</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">705</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs previous period</span>
          </div>
        </div>

        <div className="p-4 rounded bg-[#0d131f] border border-slate-800">
          <span className="text-xs text-slate-400">Avg Floor Dwell Duration</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300 mt-1">
            3m 48s
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Standard retail shopping pattern
          </div>
        </div>

        <div className="p-4 rounded bg-[#0d131f] border border-slate-800">
          <span className="text-xs text-slate-400">Threat Resolution Rate</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            96.8%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Avg dispatch response: 42s
          </div>
        </div>

        <div className="p-4 rounded bg-[#0d131f] border border-slate-800">
          <span className="text-xs text-slate-400">Preventative Interceptions</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-400 mt-1">
            12
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Verified associate assist actions
          </div>
        </div>
      </div>

      {/* Hourly Traffic Bar Visualization */}
      <div className="p-5 rounded-lg bg-[#0d131f] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Hourly Foot-Traffic & Scan Volume</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm" />
              <span>Shopper Ingress</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" />
              <span>Flagged Dwell Alerts</span>
            </div>
          </div>
        </div>

        {/* Custom Clean Bar Chart */}
        <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
          {hourlyTraffic.map((bar) => {
            const heightPercent = Math.round((bar.visitors / maxVisitors) * 100);
            return (
              <div key={bar.hour} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.visitors}
                </div>
                <div className="w-full max-w-[36px] bg-slate-800/80 rounded-t overflow-hidden flex flex-col justify-end transition-all group-hover:bg-slate-700/80" style={{ height: `${heightPercent}%` }}>
                  {bar.anomalies > 0 && (
                    <div
                      className="w-full bg-rose-500/80"
                      style={{ height: `${bar.anomalies * 14}px` }}
                      title={`${bar.anomalies} anomalies at ${bar.hour}`}
                    />
                  )}
                  <div className="w-full flex-1 bg-cyan-500/60 group-hover:bg-cyan-400 transition-colors" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                  {bar.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="p-5 rounded-lg bg-[#0d131f] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Department Risk & Inspection Density</h2>
          <span className="text-xs text-slate-500">Telemetry updated continuous</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Zone / Department</th>
                <th className="py-2.5 px-3">Scans Today</th>
                <th className="py-2.5 px-3">Flagged Rate</th>
                <th className="py-2.5 px-3">Average Dwell</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {departmentMetrics.map((dept) => (
                <tr key={dept.name} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-sans font-medium text-slate-200">{dept.name}</td>
                  <td className="py-3 px-3 tabular-nums">{dept.scans}</td>
                  <td className="py-3 px-3 tabular-nums text-slate-300">{dept.flagRate}</td>
                  <td className="py-3 px-3 tabular-nums text-slate-400">{dept.dwellAvg}</td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className={`text-[11px] font-medium ${
                        dept.risk === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {dept.risk} Risk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
