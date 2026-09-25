import { useState } from 'react';
import { Search, Download, Filter, CheckCircle, AlertTriangle, Info, Eye, X } from 'lucide-react';
import { DetectionRecord } from '../types';

interface DetectionsHistoryViewProps {
  records: DetectionRecord[];
}

export function DetectionsHistoryView({ records }: DetectionsHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Nominal' | 'Flagged' | 'Resolved'>('All');
  const [selectedRecord, setSelectedRecord] = useState<DetectionRecord | null>(null);

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true : rec.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = 'Detection ID,Timestamp,Camera,Category,Customer ID,Confidence,Status,Zone,Action Taken\n';
    const rows = filteredRecords
      .map(
        (r) =>
          `"${r.id}","${r.timestamp}","${r.camera}","${r.category}","${r.customerId}","${r.confidence}%","${r.status}","${r.zone}","${r.actionTaken}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retail_detections_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Detections History & Audit Log</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Archived computer vision events, biometric identity checks, and anomaly dispatches
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded bg-[#0d131f] border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, zone, category, or camera..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded">
          {(['All', 'Nominal', 'Flagged', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === st
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Detections Table */}
      <div className="rounded-lg bg-[#0d131f] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Camera & Zone</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4 text-right">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No detection logs found matching query.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedRecord(row)}
                  >
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{row.id}</td>
                    <td className="py-3 px-4 text-slate-400 tabular-nums">{row.timestamp}</td>
                    <td className="py-3 px-4 font-sans">
                      <div className="text-slate-200 font-medium">{row.camera}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{row.zone}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-slate-300">{row.category}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">{row.customerId}</td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      <span
                        className={
                          row.confidence >= 95
                            ? 'text-emerald-400'
                            : row.confidence >= 88
                            ? 'text-cyan-400'
                            : 'text-amber-400'
                        }
                      >
                        {row.confidence.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`text-[11px] font-medium ${
                          row.status === 'Flagged'
                            ? 'text-rose-400'
                            : row.status === 'Resolved'
                            ? 'text-blue-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(row);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors"
                        title="View Full Biometric & Snapshot Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot / Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {selectedRecord.id}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-sm font-semibold text-white">Detection Audit Summary</span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Frame Snapshot */}
            <div className="relative aspect-video rounded bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
              <div className="border border-cyan-500/40 p-4 rounded text-center z-20 bg-slate-900/80">
                <div className="text-[11px] font-mono text-cyan-300 mb-1">
                  [CCTV OPTICAL ARCHIVE]
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {selectedRecord.camera}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Captured: {selectedRecord.timestamp}
                </div>
              </div>
            </div>

            {/* Metadata attributes */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Subject ID</span>
                <span className="text-white font-mono font-medium">{selectedRecord.customerId}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Detection Class</span>
                <span className="text-white font-medium">{selectedRecord.category}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Zone & Floor</span>
                <span className="text-white">{selectedRecord.zone}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Neural Confidence</span>
                <span className="text-cyan-400 font-mono">{selectedRecord.confidence.toFixed(1)}%</span>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px] mb-1">Resolution & System Action</span>
              <p className="text-slate-200">{selectedRecord.actionTaken}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
