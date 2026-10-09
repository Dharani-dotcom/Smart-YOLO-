import { useState } from 'react';
import { Search, Download, Eye, X, Package, User } from 'lucide-react';
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
      (rec.productId && rec.productId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      rec.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true : rec.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = 'Detection ID,Timestamp,Camera,Category,Customer ID,Product ID,Confidence,Status,Zone,Action Taken\n';
    const rows = filteredRecords
      .map(
        (r) =>
          `"${r.id}","${r.timestamp}","${r.camera}","${r.category}","${r.customerId}","${r.productId || 'N/A'}","${r.confidence}%","${r.status}","${r.zone}","${r.actionTaken}"`
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
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/80">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Detections History & Audit Log</h1>
          <p className="text-xs text-slate-500 mt-1">
            Archived computer vision events, facial square matches, and product interaction telemetry
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-cyan-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Customer ID, Product ID, zone, category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
          {(['All', 'Nominal', 'Flagged', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Detections Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Camera</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Product ID</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No detection audit records matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {row.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{row.timestamp}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{row.camera}</td>
                    <td className="py-3 px-4 text-slate-700">{row.category}</td>

                    {/* Customer ID Column */}
                    <td className="py-3 px-4 font-mono font-bold text-cyan-800">
                      <span className="bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        {row.customerId}
                      </span>
                    </td>

                    {/* Product ID Column */}
                    <td className="py-3 px-4 font-mono font-bold text-amber-800">
                      {row.productId ? (
                        <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {row.productId}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">--</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 font-semibold">{row.confidence}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          row.status === 'Flagged'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : row.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.zone}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(row)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-cyan-700 transition-colors"
                        title="Inspect detection details"
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

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Detection Event #{selectedRecord.id}
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Timestamp</span>
                <span className="font-mono text-slate-800 font-semibold">{selectedRecord.timestamp}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Camera Source</span>
                <span className="text-slate-900 font-bold">{selectedRecord.camera}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Customer ID</span>
                <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {selectedRecord.customerId}
                </span>
              </div>
              {selectedRecord.productId && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Product ID</span>
                  <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {selectedRecord.productId}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Confidence Score</span>
                <span className="font-mono font-bold text-emerald-700">{selectedRecord.confidence}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="font-bold text-slate-900">{selectedRecord.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Zone</span>
                <span className="text-slate-800">{selectedRecord.zone}</span>
              </div>
              <div className="py-1.5">
                <span className="text-slate-500 font-medium block mb-1">Action Logged:</span>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                  {selectedRecord.actionTaken}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
