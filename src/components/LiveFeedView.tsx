import { useState, useRef } from 'react';
import {
  Video,
  Power,
  Grid,
  Camera,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertOctagon,
  Scan,
  UserCheck,
  Package,
  ArrowRight,
  Upload,
  User,
  Users,
  Globe,
  X,
  Play,
  HandMetal,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { CameraFeed, ShopChannel } from '../types';
import { REAL_SHOP_CHANNELS } from '../data/mockData';
import { CameraCanvas, CameraCanvasRef } from './CameraCanvas';

interface LiveFeedViewProps {
  cameras: CameraFeed[];
  activeCameraId: string;
  onSelectCamera: (id: string) => void;
  isMonitorActive: boolean;
  onToggleMonitor: () => void;
  totalScans: number;
  anomalyCount: number;
  totalPhotosCount: number;
  flaggedAlertTrigger: number;
  onCaptureSnapshot: (snapshotData: {
    imageUrl: string;
    customerId: string;
    productId: string;
    productName: string;
    productPrice: number;
    productCategory: string;
    customerConfidence: number;
    cameraName: string;
    location: string;
  }) => void;
  onNavigateToPhotos: () => void;
}

const WEB_VIDEO_PRESETS = [
  {
    name: 'Whole Foods: Fresh Produce & Organic Fruits',
    url: '/videos/supermarket-produce.mp4',
    source: 'Produce CCTV Cam 01',
    location: 'Organic Produce & Greens',
    customer: 'HUMAN-1042',
    product: 'PRD-8821',
    productName: 'Organic Hass Avocados (4pk)',
    price: 4.99,
  },
  {
    name: "Trader Joe's: Packaged Goods & Cereal Aisle",
    url: '/videos/supermarket-cereal.mp4',
    source: 'Cereal CCTV Cam 02',
    location: 'Breakfast Aisle 3 (Shelves)',
    customer: 'HUMAN-5519',
    product: 'PRD-7714',
    productName: 'Artisan Honey Almond Granola',
    price: 6.49,
  },
  {
    name: 'Safeway: Refrigerated Dairy & Cold Drinks',
    url: '/videos/supermarket-dairy.mp4',
    source: 'Dairy CCTV Cam 03',
    location: 'Refrigerated Cases Aisle 4',
    customer: 'HUMAN-3910',
    product: 'PRD-3301',
    productName: 'Organic Almond Milk 64oz',
    price: 3.89,
  },
  {
    name: 'Kroger: Artisan Bakery & Fresh Breads',
    url: '/videos/supermarket-bakery.mp4',
    source: 'Bakery CCTV Cam 04',
    location: 'Bakery Shelves & Bread Pod',
    customer: 'HUMAN-7712',
    product: 'PRD-5520',
    productName: 'San Francisco Sourdough Boule',
    price: 5.25,
  },
  {
    name: 'Target: Grocery Concourse Multi-Cart Floor',
    url: '/videos/supermarket-concourse.mp4',
    source: 'Grocery CCTV Cam 05',
    location: 'Central Food Floor & Island',
    customer: 'HUMAN-9041',
    product: 'PRD-1290',
    productName: 'Colavita Extra Virgin Olive Oil 1L',
    price: 18.99,
  },
  {
    name: 'Walmart: Self-Checkout & POS Scanning',
    url: '/videos/supermarket-checkout.mp4',
    source: 'Checkout POS Cam 06',
    location: 'Self-Checkout Lane 04',
    customer: 'HUMAN-2180',
    product: 'PRD-4019',
    productName: 'Lavazza Espresso Ground Coffee',
    price: 11.5,
  },
  {
    name: 'Aldi: Entrance Gates & Cart Turnstiles',
    url: '/videos/supermarket-entrance.mp4',
    source: 'Entrance CCTV Cam 07',
    location: 'Entrance Gate & Trolleys',
    customer: 'HUMAN-6620',
    product: 'PRD-9902',
    productName: 'Supermarket Savings Club Pass',
    price: 0.0,
  },
  {
    name: 'Costco: Walk-In Freezer & Ice Cream Aisle',
    url: '/videos/supermarket-frozen.mp4',
    source: 'Freezer CCTV Cam 08',
    location: 'Walk-In Freezer Aisle 7',
    customer: 'HUMAN-4418',
    product: 'PRD-6102',
    productName: "Ben & Jerry's Half Baked Pint",
    price: 5.99,
  },
  {
    name: 'OpenVINO Net Stream: Real Store Aisle Detection Footage',
    url: 'https://storage.openvinotoolkit.org/data/test_data/videos/store-aisle-detection.mp4',
    source: 'OpenVINO Intel Cloud',
    location: 'Retail Supermarket Test Floor',
    customer: 'HUMAN-1042',
    product: 'PRD-8821',
    productName: 'Retail Merchandise Display',
    price: 6.48,
  },
  {
    name: 'OpenVINO Net Stream: People Detection Mall Concourse',
    url: 'https://storage.openvinotoolkit.org/data/test_data/videos/people-detection.mp4',
    source: 'OpenVINO Intel Cloud',
    location: 'Shopping Center Food Concourse',
    customer: 'HUMAN-9041',
    product: 'PRD-1290',
    productName: 'Luxury Grocery Display',
    price: 28.9,
  },
];

export function LiveFeedView({
  cameras,
  activeCameraId,
  isMonitorActive,
  onToggleMonitor,
  totalScans,
  anomalyCount,
  totalPhotosCount,
  flaggedAlertTrigger,
  onCaptureSnapshot,
  onNavigateToPhotos,
}: LiveFeedViewProps) {
  const [showFaceSquare, setShowFaceSquare] = useState(true);
  const [showProductBox, setShowProductBox] = useState(true);
  const [showScanGrid, setShowScanGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWebcamMode, setIsWebcamMode] = useState(false);
  const [snapshotFeedback, setSnapshotFeedback] = useState<string | null>(null);

  // Real Human Shop Footage Channel state
  const [selectedChannelId, setSelectedChannelId] = useState<string>(REAL_SHOP_CHANNELS[0].id);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoName, setCustomVideoName] = useState<string | null>(null);

  // Product Picked Detection state
  const [isProductPicked, setIsProductPicked] = useState(false);

  // Web Video from Net Dialog state
  const [isWebModalOpen, setIsWebModalOpen] = useState(false);
  const [webInputUrl, setWebInputUrl] = useState('');
  const [webUrlError, setWebUrlError] = useState<string | null>(null);

  const canvasRef = useRef<CameraCanvasRef | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeChannel =
    REAL_SHOP_CHANNELS.find((c) => c.id === selectedChannelId) || REAL_SHOP_CHANNELS[0];

  const activeCamera =
    cameras.find((c) => c.id === activeCameraId) || cameras[0];

  const handleCaptureRealTimePhoto = () => {
    if (!isMonitorActive) {
      setSnapshotFeedback('Please click "Launch Camera Monitor" first before capturing photos.');
      setTimeout(() => setSnapshotFeedback(null), 3000);
      return;
    }

    const captured = canvasRef.current?.captureSnapshot();
    if (captured) {
      onCaptureSnapshot({
        imageUrl: captured.imageUrl,
        customerId: captured.customerId,
        productId: captured.productId,
        productName: captured.productName,
        productPrice: captured.productPrice,
        productCategory: captured.productCategory,
        customerConfidence: captured.customerConfidence,
        cameraName: isWebcamMode
          ? 'Live Real Human Camera [Webcam]'
          : customVideoName
          ? `Net Video: ${customVideoName}`
          : activeChannel.name,
        location: isWebcamMode ? 'User Workstation Terminal' : activeChannel.zone,
      });

      setSnapshotFeedback(
        `Captured Real-Time Photo with Real Human Face Square #${captured.customerId} & Product #${captured.productId} (${isProductPicked ? 'Item Picked Up' : 'On Shelf'})`
      );
      setTimeout(() => setSnapshotFeedback(null), 3500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setCustomVideoName(file.name);
      setIsWebcamMode(false);
      setSnapshotFeedback(`Loaded real store video file: ${file.name}`);
      setTimeout(() => setSnapshotFeedback(null), 3500);
    }
  };

  const handleApplyWebUrl = (urlToApply?: string, presetName?: string) => {
    const targetUrl = (urlToApply || webInputUrl).trim();
    if (!targetUrl) {
      setWebUrlError('Please enter a valid video URL from the net.');
      return;
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('/')) {
      setWebUrlError('Video URL must begin with http://, https:// or /');
      return;
    }

    setCustomVideoUrl(targetUrl);
    setCustomVideoName(presetName || targetUrl.split('/').pop() || 'Net Video Stream');
    setIsWebcamMode(false);
    setIsWebModalOpen(false);
    setWebUrlError(null);
    setSnapshotFeedback(`Loaded real human video stream from net: ${presetName || targetUrl}`);
    setTimeout(() => setSnapshotFeedback(null), 3500);
  };

  const handleToggleProductPicked = () => {
    const nextState = !isProductPicked;
    setIsProductPicked(nextState);
    if (nextState) {
      setSnapshotFeedback(
        `● [ITEM PICKED UP]: Customer #${activeChannel.activeCustomer} has picked up Product #${activeChannel.activeProduct} (${activeChannel.productName})!`
      );
    } else {
      setSnapshotFeedback(
        `○ [PLACED BACK]: Product #${activeChannel.activeProduct} placed back on display shelf.`
      );
    }
    setTimeout(() => setSnapshotFeedback(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col p-5 overflow-y-auto space-y-5 bg-slate-50/90">
      {/* Top Header Row (Clean White Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Real Human Shop Vision Center
            </h1>
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isMonitorActive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-300'
              }`}
            >
              {isMonitorActive ? '● VIDEO STREAM ACTIVE' : '○ STREAM STANDBY'}
            </span>
            {isWebcamMode ? (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                USER WEBCAM
              </span>
            ) : customVideoName ? (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                NET VIDEO STREAM
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                REAL STORE CCTV
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real surveillance footage of real shoppers with facial detection squares, customer ID tags, and product picking recognition
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Web Video From Net button */}
          <button
            onClick={() => setIsWebModalOpen(true)}
            title="Load or paste any real store video URL from the net (MP4 / WebM / CCTV stream)"
            className="px-3.5 py-2 rounded-xl font-semibold text-xs bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-600" />
            <span>Load Video from Net</span>
          </button>

          {/* Upload Real Video button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload your own real human store video footage (MP4 / WebM)"
            className="px-3 py-2 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-amber-600" />
            <span>Upload File</span>
          </button>

          {/* Capture Photo Button */}
          <button
            onClick={handleCaptureRealTimePhoto}
            title="Instantly capture current frame with real human face square and product ID tags"
            className="px-3.5 py-2 rounded-xl font-semibold text-xs tracking-wide bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Camera className="w-4 h-4 text-cyan-600" />
            <span>Capture Photo</span>
          </button>

          {/* Toggle Monitor Primary Button */}
          <button
            onClick={onToggleMonitor}
            className={`px-4 py-2 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center gap-2 shadow-xs ${
              isMonitorActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {isMonitorActive ? 'Stop Stream' : 'Launch Camera Monitor'}
            </span>
          </button>
        </div>
      </div>

      {/* Real Store Channels Selector Bar (White Theme) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-600" />
            Select Real Human Video Channel:
          </span>
          <span className="text-[11px] text-cyan-700 font-mono font-semibold">
            {customVideoName ? `Active Custom Stream: ${customVideoName}` : 'Authentic 1080p MP4 Video Surveillance'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8 gap-2.5">
          {REAL_SHOP_CHANNELS.map((ch, idx) => {
            const isSelected = !isWebcamMode && !customVideoUrl && selectedChannelId === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChannelId(ch.id);
                  setIsWebcamMode(false);
                  setCustomVideoUrl(null);
                  setCustomVideoName(null);
                }}
                className={`p-3 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-950 shadow-xs ring-2 ring-cyan-400/40'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-700 uppercase font-bold">
                    CAM {idx + 1}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />}
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {ch.storeName.split('[')[0]}
                </div>
                <div className="text-[10.5px] text-slate-500 truncate mt-0.5 font-mono">
                  #{ch.activeCustomer} · #{ch.activeProduct}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Counter Widgets Row (White Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Widget 1: Active Video Feed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-slate-500 font-medium">Active Real Video</div>
            <div className="text-base font-bold font-mono text-slate-900 mt-1 truncate max-w-[170px]">
              {isMonitorActive
                ? isWebcamMode
                  ? 'Real Human Webcam'
                  : customVideoName
                  ? 'Net Video Stream'
                  : activeChannel.storeName
                : 'Feed Standby'}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{isMonitorActive ? 'Real MP4 video streaming' : 'Monitor in standby'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Video className="w-5 h-5" />
          </div>
        </div>

        {/* Widget 2: Real-Time Photos Captured */}
        <div
          onClick={onNavigateToPhotos}
          className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:border-cyan-300 transition-colors group shadow-xs"
        >
          <div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span>Real-Time Photos</span>
              <ArrowRight className="w-3 h-3 text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {totalPhotosCount} Saved
            </div>
            <div className="text-[11px] text-cyan-700 mt-0.5 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>Face square & product tags</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Camera className="w-5 h-5" />
          </div>
        </div>

        {/* Widget 3: Total Face & Product Scans */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Scans Today</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {totalScans.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1 font-mono font-medium">
              <Scan className="w-3 h-3" />
              <span>Biometric & RFID active</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Scan className="w-5 h-5" />
          </div>
        </div>

        {/* Widget 4: Product Picking State */}
        <div
          onClick={handleToggleProductPicked}
          className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-colors shadow-xs group"
          title="Click to toggle Product Picked (In-Hand) status"
        >
          <div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span>Product Picking State</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-1 truncate">
              {isProductPicked ? 'ITEM IN-HAND' : 'BROWSING SHELF'}
            </div>
            <div className={`text-[11px] mt-0.5 font-mono font-bold ${isProductPicked ? 'text-emerald-700' : 'text-slate-500'}`}>
              {isProductPicked ? '● Grasp detected & locked' : '○ Standby for grasp (Click to test)'}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${isProductPicked ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:text-emerald-600'}`}>
            <HandMetal className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Monitoring Window (White Chassis) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-sm">
        {/* Source Mode Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIsWebcamMode(false);
                setCustomVideoUrl(null);
                setCustomVideoName(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !isWebcamMode && !customVideoUrl
                  ? 'bg-cyan-50 text-cyan-900 border border-cyan-300 shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              <span>Real Store CCTV Feeds (7 Cameras)</span>
            </button>

            <button
              onClick={() => {
                setIsWebcamMode(true);
                setCustomVideoUrl(null);
                setCustomVideoName(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isWebcamMode
                  ? 'bg-cyan-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Live User Webcam</span>
            </button>

            {/* PRODUCT PICKING TOGGLE: Direct interactive trigger for the user */}
            <button
              onClick={handleToggleProductPicked}
              title="Click to simulate or test detecting customer picking up product"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isProductPicked
                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              <HandMetal className="w-3.5 h-3.5" />
              <span>{isProductPicked ? 'Product Picked: IN-HAND' : 'Simulate: Pick Product'}</span>
            </button>

            {customVideoUrl && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate max-w-[200px]">{customVideoName || 'Net Video'}</span>
              </span>
            )}
          </div>

          {/* Quick HUD Vision Toggles: Face Square, Product ID, Scan Grid */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Square on Face Toggle */}
            <button
              onClick={() => setShowFaceSquare(!showFaceSquare)}
              title="Toggle Face Square & Customer ID Tag on Real Human Face"
              className={`px-2.5 py-1.5 rounded-xl text-xs border transition-colors flex items-center gap-1.5 ${
                showFaceSquare
                  ? 'bg-cyan-50 text-cyan-900 border-cyan-300 font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>Face Square [Customer ID]</span>
            </button>

            {/* 2. Product ID Box Toggle */}
            <button
              onClick={() => setShowProductBox(!showProductBox)}
              title="Toggle Product Bounding Box & Product ID Tag"
              className={`px-2.5 py-1.5 rounded-xl text-xs border transition-colors flex items-center gap-1.5 ${
                showProductBox
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-amber-600" />
              <span>Product ID Box</span>
            </button>

            {/* 3. Scan Grid */}
            <button
              onClick={() => setShowScanGrid(!showScanGrid)}
              title="Toggle Laser Scanline"
              className={`p-1.5 rounded-xl text-xs border transition-colors flex items-center gap-1.5 ${
                showScanGrid
                  ? 'bg-cyan-50 text-cyan-900 border-cyan-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden sm:inline font-semibold">Laser Scan</span>
            </button>

            {/* 4. Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle fullscreen preview"
              className="p-1.5 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Snapshot feedback notification */}
        {snapshotFeedback && (
          <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-950 flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{snapshotFeedback}</span>
            </span>
            <button
              onClick={onNavigateToPhotos}
              className="text-[11px] underline font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 ml-3 shrink-0"
            >
              <span>View in Photos Gallery</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Video Canvas Container */}
        <div
          className={
            isFullscreen
              ? 'fixed inset-4 z-50 bg-black/95 p-4 rounded-2xl flex flex-col justify-center'
              : ''
          }
        >
          {isFullscreen && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {isWebcamMode
                  ? 'LIVE REAL HUMAN WEBCAM'
                  : customVideoName
                  ? `VIDEO FROM NET: ${customVideoName}`
                  : activeChannel.name}
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
              >
                Close Fullscreen
              </button>
            </div>
          )}

          <CameraCanvas
            ref={canvasRef}
            camera={activeCamera}
            activeChannel={activeChannel}
            isActive={isMonitorActive}
            showBoundingBoxes={false}
            showFaceSquare={showFaceSquare}
            showProductBox={showProductBox}
            showScanGrid={showScanGrid}
            showHeatmap={false}
            flaggedAlertTrigger={flaggedAlertTrigger}
            isWebcamMode={isWebcamMode}
            customVideoUrl={customVideoUrl}
            isProductPicked={isProductPicked}
            onToggleProductPicked={handleToggleProductPicked}
          />
        </div>

        {/* Active Feed Optical Diagnostics Bar (White Theme) */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">
              {isWebcamMode
                ? 'Device Camera [Webcam]'
                : customVideoName
                ? `Net Stream: ${customVideoName}`
                : activeChannel.name}
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span>{isWebcamMode ? 'Terminal Workstation' : activeChannel.zone}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-700">
            <span className="text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-200">
              CUSTOMER: #{activeChannel.activeCustomer}
            </span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              PRODUCT: #{activeChannel.activeProduct} (${activeChannel.productPrice.toFixed(2)})
            </span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span className={`font-bold px-2 py-0.5 rounded-lg ${isProductPicked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
              {isProductPicked ? 'STATE: PICKED UP (IN-HAND)' : 'STATE: ON SHELF'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: LOAD VIDEO FROM NET (WHITE THEME) */}
      {/* ========================================================================= */}
      {isWebModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                  LOAD REAL HUMAN SHOP VIDEO FROM NET
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsWebModalOpen(false);
                  setWebUrlError(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Paste any direct video URL from the internet (e.g. MP4, WebM, CCTV public stream) or pick one of the verified real retail store video feeds below:
            </p>

            {/* Custom URL Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-cyan-700 uppercase font-bold">
                Direct Video Stream URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webInputUrl}
                  onChange={(e) => {
                    setWebInputUrl(e.target.value);
                    setWebUrlError(null);
                  }}
                  placeholder="https://example.com/surveillance/retail-store.mp4"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  onClick={() => handleApplyWebUrl()}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Load Stream
                </button>
              </div>
              {webUrlError && (
                <p className="text-[11px] text-rose-600 font-mono font-semibold">{webUrlError}</p>
              )}
            </div>

            {/* Quick Web Video Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                Verified Real Store Video Feeds (Click to Play):
              </span>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {WEB_VIDEO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyWebUrl(preset.url, preset.name)}
                    className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-cyan-50/80 border border-slate-200 hover:border-cyan-300 transition-all group flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-900 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-cyan-600" />
                        <span>{preset.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        Source: {preset.source} · Face #{preset.customer} · Item #{preset.product} (${preset.price.toFixed(2)})
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-cyan-100 group-hover:bg-cyan-600 text-cyan-800 group-hover:text-white text-xs font-bold transition-colors flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>Stream</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsWebModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold"
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
