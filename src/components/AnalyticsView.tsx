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
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/80">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security & Foot-Traffic Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time spatial dwell metrics, department risk profiling, and loss prevention trends
        </p>
      </div>

      {/* KPI Cards (White Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Patrons Monitored</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">705</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs previous period</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Avg Floor Dwell Duration</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-800 mt-1">
            3m 48s
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Standard retail shopping pattern
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Threat Resolution Rate</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            96.8%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg dispatch response: 42s
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Preventative Interceptions</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700 mt-1">
            12
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Verified associate assist actions
          </div>
        </div>
      </div>

      {/* Hourly Traffic Bar Visualization (White Theme) */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Today's Foot Traffic & Incident Density</h2>
            <p className="text-xs text-slate-500 mt-0.5">Distribution across operating store hours</p>
          </div>
          <span className="text-[11px] font-mono text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
            Real-Time Rolling Feed
          </span>
        </div>

        <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2">
          {hourlyTraffic.map((d) => {
            const heightPercent = Math.round((d.visitors / maxVisitors) * 100);
            return (
              <div key={d.hour} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-100 rounded-t flex items-end justify-center h-36 relative overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t transition-all duration-300 ${
                      d.anomalies > 1
                        ? 'bg-rose-400 group-hover:bg-rose-500'
                        : 'bg-cyan-500 group-hover:bg-cyan-600'
                    }`}
                  />
                  {d.anomalies > 0 && (
                    <span className="absolute top-1 text-[9px] font-bold font-mono text-rose-800 bg-rose-100 px-1 rounded shadow-2xs">
                      {d.anomalies}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-900 font-medium">
                  {d.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Breakdown Table (White Theme) */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900">Department Risk Profile & Dwell Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
              <tr>
                <th className="py-2.5">Department</th>
                <th className="py-2.5">Scans Today</th>
                <th className="py-2.5">Flag Rate</th>
                <th className="py-2.5">Avg Dwell</th>
                <th className="py-2.5">Risk Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentMetrics.map((dept) => (
                <tr key={dept.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-semibold text-slate-900">{dept.name}</td>
                  <td className="py-3 font-mono text-slate-700">{dept.scans}</td>
                  <td className="py-3 font-mono text-cyan-800 font-bold">{dept.flagRate}</td>
                  <td className="py-3 font-mono text-slate-600">{dept.dwellAvg}</td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        dept.risk === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {dept.risk}
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
