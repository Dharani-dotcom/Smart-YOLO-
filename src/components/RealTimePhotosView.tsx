import { useState } from 'react';
import {
  Camera,
  Search,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  User,
  Package,
  Calendar,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { RealTimePhoto } from '../types';

interface RealTimePhotosViewProps {
  photos: RealTimePhoto[];
  onTakeLivePhoto: () => void;
  isMonitorActive: boolean;
}

export function RealTimePhotosView({
  photos,
  onTakeLivePhoto,
}: RealTimePhotosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<RealTimePhoto | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'normal' | 'info' | 'warning'>('all');

  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch =
      photo.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      filterSeverity === 'all' ? true : photo.threatSeverity === filterSeverity;

    return matchesSearch && matchesSeverity;
  });

  const downloadPhoto = (photo: RealTimePhoto) => {
    const a = document.createElement('a');
    a.href = photo.imageUrl;
    a.download = `security_photo_${photo.customerId}_${photo.productId}_${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/80">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Real-Time Photos & Dual-Tag Archive
            </h1>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
              {photos.length} CAPTURES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Archived real-time optical frames highlighting Customer Face Squares and Product ID Bounding Boxes
          </p>
        </div>

        {/* Action Button: Capture Real-Time Photo */}
        <button
          onClick={onTakeLivePhoto}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
        >
          <Camera className="w-4 h-4" />
          <span>Capture Real-Time Photo Now</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Customer ID (e.g. CUST-1042) or Product ID (e.g. PRD-8821)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter severity tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterSeverity === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Captures ({photos.length})
          </button>
          <button
            onClick={() => setFilterSeverity('normal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterSeverity === 'normal'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nominal
          </button>
          <button
            onClick={() => setFilterSeverity('info')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterSeverity === 'info'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            VIP
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterSeverity === 'warning'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anomalies
          </button>
        </div>
      </div>

      {/* Grid of Real-Time Photos */}
      {filteredPhotos.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center space-y-3 shadow-xs">
          <Camera className="w-10 h-10 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700">No Real-Time Photos Found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Launch the live camera monitor and click "Capture Real-Time Photo" to generate live surveillance frames with customer and product tags.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => {
            const isWarning = photo.threatSeverity === 'warning';
            const isVip = photo.threatSeverity === 'info';

            return (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className={`group rounded-xl bg-white border overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-md ${
                  isWarning
                    ? 'border-rose-300 hover:border-rose-400'
                    : isVip
                    ? 'border-blue-300 hover:border-blue-400'
                    : 'border-slate-200 hover:border-cyan-400'
                }`}
              >
                {/* Photo Image with Visual Square Overlays */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={`Surveillance capture of ${photo.customerId} and ${photo.productId}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />

                  {/* Top Bar on Photo */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono z-10 pointer-events-none">
                    <span className="bg-slate-900/85 px-2 py-0.5 rounded text-white border border-slate-700">
                      {photo.camera.split(':')[0]}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isWarning
                          ? 'bg-rose-600 text-white'
                          : isVip
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {photo.threatSeverity}
                    </span>
                  </div>

                  {/* Overlay Eye Hover */}
                  <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-3 py-1.5 rounded-full bg-white/95 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Inspect Frame</span>
                    </div>
                  </div>
                </div>

                {/* Card Info Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    {/* Customer ID Tag */}
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-600" />
                      <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        #{photo.customerId}
                      </span>
                    </div>

                    {/* Product ID Tag */}
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        #{photo.productId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-800 font-semibold truncate max-w-[170px]">
                      {photo.productName}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ${photo.productPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{photo.location}</span>
                    <span>{photo.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Forensic Inspection Modal (White Theme) */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {selectedPhoto.id}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-sm font-bold text-slate-900">
                  Real-Time Biometric & Product Interaction Evidence
                </span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Resolution Photo Display */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-inner">
              <img
                src={selectedPhoto.imageUrl}
                alt="High-resolution forensic snapshot"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Dual Dossier Cards: Customer Face Square + Product ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Customer Face Dossier */}
              <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-800 font-bold text-xs">
                    <User className="w-4 h-4 text-cyan-600" />
                    <span>Customer Face Verification</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">
                    SQUARE LOCKED
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer ID:</span>
                    <span className="font-mono font-bold text-slate-900">#{selectedPhoto.customerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Profile Name:</span>
                    <span className="text-slate-800 font-medium">{selectedPhoto.customerName || 'Retail Patron'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Biometric Match:</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {selectedPhoto.customerConfidence.toFixed(1)}% Match
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Facial Reticle:</span>
                    <span className="font-mono text-cyan-700 font-bold">
                      [{selectedPhoto.faceBox.width}x{selectedPhoto.faceBox.height}px square]
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: Product ID Dossier */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>Product Identification & Sensor</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    TAG SYNCED
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Product ID:</span>
                    <span className="font-mono font-bold text-amber-800">#{selectedPhoto.productId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Item Title:</span>
                    <span className="text-slate-800 font-medium truncate">{selectedPhoto.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Retail Value:</span>
                    <span className="font-mono font-bold text-slate-900">${selectedPhoto.productPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Sensor:</span>
                    <span className="text-emerald-700 font-mono font-bold">EAS SENSOR SECURE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 font-mono">
                Captured at {selectedPhoto.camera} · {selectedPhoto.timestamp}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadPhoto(selectedPhoto)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4 text-cyan-600" />
                  <span>Download Photo</span>
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
