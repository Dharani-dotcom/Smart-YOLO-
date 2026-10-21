import React, { useState, useRef } from 'react';
import {
  Video,
  Power,
  Camera,
  Maximize2,
  Minimize2,
  CheckCircle2,
  UserCheck,
  Package,
  ArrowRight,
  Upload,
  User,
  Users,
  Globe,
  X,
  Play,
  Sparkles,
  Database,
  Store,
  ShoppingBag,
} from 'lucide-react';
import { CameraFeed } from '../types';
import { REAL_SHOP_CHANNELS } from '../data/mockData';
import { CameraCanvas, CameraCanvasRef } from './CameraCanvas';
import { getShelfProductBoxes } from '../utils/faceDetection';
import { saveDetectionToFirestore, saveProductToFirestore, FIRESTORE_CONSOLE_URL } from '../firebase';

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

const SHOP_CAMERA_LABELS: Record<string, string> = {
  'supermarket-produce': '1. Fresh Produce',
  'supermarket-cereal': '2. Cereal Aisle',
  'supermarket-dairy': '3. Dairy Counter',
  'supermarket-bakery': '4. Bakery',
  'supermarket-concourse': '5. Main Aisle',
  'supermarket-checkout': '6. Checkout',
  'supermarket-entrance': '7. Entrance',
  'supermarket-frozen': '8. Frozen Foods',
};

const WEB_VIDEO_PRESETS = [
  {
    name: 'Fresh Produce Counter (2 Customers)',
    url: '/videos/supermarket-produce.mp4',
    source: 'Camera 1',
    customer: 'Marcus Vance (#HUMAN-1042)',
    productName: 'Organic Hass Avocados (4pk)',
    price: 4.99,
  },
  {
    name: 'Cereal & Packaged Goods Aisle',
    url: '/videos/supermarket-cereal.mp4',
    source: 'Camera 2',
    customer: 'Robert Langdon (#HUMAN-5519)',
    productName: 'Artisan Honey Almond Granola',
    price: 6.49,
  },
  {
    name: 'Refrigerated Dairy Counter',
    url: '/videos/supermarket-dairy.mp4',
    source: 'Camera 3',
    customer: 'Sarah Jenkins (#HUMAN-3910)',
    productName: 'Organic Almond Milk 64oz',
    price: 3.89,
  },
  {
    name: 'Artisan Bakery Counter',
    url: '/videos/supermarket-bakery.mp4',
    source: 'Camera 4',
    customer: 'Chloe Bennett (#HUMAN-7712)',
    productName: 'Artisan Sourdough Boule',
    price: 5.25,
  },
  {
    name: 'Main Grocery Aisle (Multiple Shoppers)',
    url: '/videos/supermarket-concourse.mp4',
    source: 'Camera 5',
    customer: 'Elena Rostova (#HUMAN-9041)',
    productName: 'Colavita Extra Virgin Olive Oil 1L',
    price: 18.99,
  },
  {
    name: 'Self-Checkout Counter',
    url: '/videos/supermarket-checkout.mp4',
    source: 'Camera 6',
    customer: 'David Miller (#HUMAN-2180)',
    productName: 'Lavazza Espresso Ground Coffee',
    price: 11.5,
  },
];

export function LiveFeedView({
  cameras,
  activeCameraId,
  isMonitorActive,
  onToggleMonitor,
  totalPhotosCount,
  flaggedAlertTrigger,
  onCaptureSnapshot,
  onNavigateToPhotos,
}: LiveFeedViewProps) {
  const [showCustomerBodyBox, setShowCustomerBodyBox] = useState(true);
  const [showFaceSquare, setShowFaceSquare] = useState(true);
  const [showProductBox, setShowProductBox] = useState(true);
  const [showShelfBoxes, setShowShelfBoxes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWebcamMode, setIsWebcamMode] = useState(false);
  const [snapshotFeedback, setSnapshotFeedback] = useState<string | null>(null);
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null);

  // Selected Store Camera Channel
  const [selectedChannelId, setSelectedChannelId] = useState<string>(REAL_SHOP_CHANNELS[0].id);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoName, setCustomVideoName] = useState<string | null>(null);

  // Item Picked Up State
  const [isProductPicked, setIsProductPicked] = useState(false);

  // Load Video Modal State
  const [isWebModalOpen, setIsWebModalOpen] = useState(false);
  const [webInputUrl, setWebInputUrl] = useState('');
  const [webUrlError, setWebUrlError] = useState<string | null>(null);

  const canvasRef = useRef<CameraCanvasRef | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeChannel =
    REAL_SHOP_CHANNELS.find((c) => c.id === selectedChannelId) || REAL_SHOP_CHANNELS[0];

  const activeCamera =
    cameras.find((c) => c.id === activeCameraId) || cameras[0];

  const shelfProducts = getShelfProductBoxes(activeChannel.id, 0, 960, 540);

  const handleCaptureRealTimePhoto = () => {
    if (!isMonitorActive) {
      setSnapshotFeedback('Please turn on the camera first to take a snapshot.');
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
          ? 'My Live Webcam'
          : customVideoName
          ? `Video: ${customVideoName}`
          : activeChannel.name,
        location: isWebcamMode ? 'Shop Counter' : activeChannel.zone,
      });

      setSnapshotFeedback(
        `Snapshot saved! Customer ${activeChannel.customerName} (#${captured.customerId}) & ${captured.productName} ($${captured.productPrice.toFixed(2)})`
      );
      setTimeout(() => setSnapshotFeedback(null), 3500);
    }
  };

  const handleSyncBoxedObjectToFirebase = async (prod: {
    id: string;
    name: string;
    price: number;
    category: string;
    confidence: number;
    shelfLabel?: string;
    isPrimary?: boolean;
  }) => {
    setSyncingProductId(prod.id);
    try {
      const detId = `DET-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      await saveProductToFirestore({
        id: prod.id,
        name: prod.name,
        category: prod.category,
        price: prod.price,
        aisle: activeChannel.zone,
        shelfZone: prod.shelfLabel || 'Shop Counter',
        stockLevel: 32,
        skuBarcode: `SKU-${prod.id}`,
        confidence: prod.confidence,
      });

      await saveDetectionToFirestore({
        id: detId,
        timestamp: nowTime,
        camera: activeChannel.storeName,
        category: 'Product Interaction',
        customerId: activeChannel.activeCustomer,
        productId: prod.id,
        confidence: prod.confidence,
        status: 'Nominal',
        actionTaken: `Customer ${activeChannel.customerName} (#${activeChannel.activeCustomer}) with ${prod.name} (#${prod.id}, $${prod.price.toFixed(2)}) saved to shop records`,
        zone: activeChannel.zone,
      });

      setSnapshotFeedback(
        `Saved ${activeChannel.customerName} & ${prod.name} ($${prod.price.toFixed(2)}) to your Firebase Shop Database!`
      );
      setTimeout(() => setSnapshotFeedback(null), 4000);
    } catch (err) {
      console.error('Error syncing record to Firestore:', err);
    } finally {
      setSyncingProductId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setCustomVideoName(file.name);
      setIsWebcamMode(false);
      setSnapshotFeedback(`Opened shop video file: ${file.name}`);
      setTimeout(() => setSnapshotFeedback(null), 3500);
    }
  };

  const handleApplyWebUrl = (urlToApply?: string, presetName?: string) => {
    const targetUrl = (urlToApply || webInputUrl).trim();
    if (!targetUrl) {
      setWebUrlError('Please enter a valid video link.');
      return;
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('/')) {
      setWebUrlError('Video link must start with http://, https:// or /');
      return;
    }

    setCustomVideoUrl(targetUrl);
    setCustomVideoName(presetName || targetUrl.split('/').pop() || 'Shop Video');
    setIsWebcamMode(false);
    setIsWebModalOpen(false);
    setWebUrlError(null);
    setSnapshotFeedback(`Switched camera to: ${presetName || targetUrl}`);
    setTimeout(() => setSnapshotFeedback(null), 3500);
  };

  const handleToggleProductPicked = () => {
    const nextState = !isProductPicked;
    setIsProductPicked(nextState);
    if (nextState) {
      setSnapshotFeedback(
        `Item Picked Up: ${activeChannel.customerName} (#${activeChannel.activeCustomer}) picked up ${activeChannel.productName} ($${activeChannel.productPrice.toFixed(2)})`
      );
    } else {
      setSnapshotFeedback(`Item Returned: ${activeChannel.productName} placed back on shelf.`);
    }
    setTimeout(() => setSnapshotFeedback(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col p-5 overflow-y-auto space-y-4 bg-slate-50">
      {/* Top Shopkeeper Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900">
              Live Shop CCTV & YOLO Face Detection
            </h1>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isMonitorActive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-300'
              }`}
            >
              {isMonitorActive ? '● Camera Live' : '○ Camera Paused'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automatically puts a green YOLO square on the customer’s face and boxes products they pick up from shelves.
          </p>
        </div>

        {/* Simple, Everyday Shopkeeper Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Switch between Store CCTV and Live Webcam */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setIsWebcamMode(false);
                setCustomVideoUrl(null);
                setCustomVideoName(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !isWebcamMode && !customVideoUrl
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Store CCTV (8 Cams)</span>
            </button>
            <button
              onClick={() => {
                setIsWebcamMode(true);
                setCustomVideoUrl(null);
                setCustomVideoName(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isWebcamMode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Open My Webcam</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl font-semibold text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload Video</span>
          </button>

          <button
            onClick={handleCaptureRealTimePhoto}
            className="px-3.5 py-2 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Take Snapshot</span>
          </button>

          <button
            onClick={onToggleMonitor}
            className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 border ${
              isMonitorActive
                ? 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isMonitorActive ? 'Pause Camera' : 'Turn On Camera'}</span>
          </button>
        </div>
      </div>

      {/* Simple Camera Selector Tabs (8 Store Cameras) */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-emerald-600" />
            Select Shop Camera:
          </span>
          <button
            onClick={() => setIsWebModalOpen(true)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Load Video by Link</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {REAL_SHOP_CHANNELS.map((ch) => {
            const isSelected = !isWebcamMode && !customVideoUrl && selectedChannelId === ch.id;
            const shortLabel = SHOP_CAMERA_LABELS[ch.id] || ch.storeName;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChannelId(ch.id);
                  setIsWebcamMode(false);
                  setCustomVideoUrl(null);
                  setCustomVideoName(null);
                }}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs ring-1 ring-emerald-500/40'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">{shortLabel}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {ch.customerName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Snapshot / Database Sync Notification Toast */}
      {snapshotFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{snapshotFeedback}</span>
          </span>
          <button
            onClick={onNavigateToPhotos}
            className="text-xs underline font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 ml-3 shrink-0"
          >
            <span>View Saved Snapshots ({totalPhotosCount})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main CCTV Monitor Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-slate-900">
              {isWebcamMode
                ? 'My Live Webcam (Customer Face & Item Detection)'
                : customVideoName
                ? `Uploaded Video: ${customVideoName}`
                : `${activeChannel.storeName.split('[')[0].trim()} — ${activeChannel.zone}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>

        <div
          className={
            isFullscreen
              ? 'fixed inset-4 z-50 bg-slate-950 p-4 rounded-2xl flex flex-col justify-center'
              : ''
          }
        >
          {isFullscreen && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-white">{activeChannel.name}</span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
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
            showBoundingBoxes={true}
            showCustomerBodyBox={showCustomerBodyBox}
            showFaceSquare={showFaceSquare}
            showProductBox={showProductBox}
            showShelfBoxes={showShelfBoxes}
            showScanGrid={false}
            showHeatmap={false}
            flaggedAlertTrigger={flaggedAlertTrigger}
            isWebcamMode={isWebcamMode}
            customVideoUrl={customVideoUrl}
            isProductPicked={isProductPicked}
            onToggleProductPicked={handleToggleProductPicked}
          />
        </div>
      </div>

      {/* Simple Shopkeeper Summary: Customer & Products Currently in Camera View */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Customer & Products Currently in Camera View</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live summary of the customer and items detected by the camera. Click "Save to Database" to record a sale or pickup.
            </p>
          </div>
          <a
            href={FIRESTORE_CONSOLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>Open Firebase Shop Database</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card 1: Detected Customer */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-600 text-white">
                  Customer Detected
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  YOLO Face Square Active
                </span>
              </div>

              <div className="pt-1">
                <div className="text-base font-bold text-slate-900">
                  {activeChannel.customerName}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Customer ID: <strong className="text-slate-900">#{activeChannel.activeCustomer}</strong>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-emerald-200/70 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Shop Section:</span>
                  <span className="font-semibold text-slate-900">{activeChannel.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Current Activity:</span>
                  <span className={`font-bold ${isProductPicked ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isProductPicked ? 'Picked Up Item in Hand' : 'Looking at Shelf'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleProductPicked}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                isProductPicked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProductPicked ? 'Item Picked Up (Click to Reset)' : 'Mark Item as Picked Up'}</span>
            </button>
          </div>

          {/* Cards 2 & 3: Boxed Products */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Primary Product Card */}
            <div className="p-4 rounded-xl bg-amber-50/50 border-2 border-amber-300 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                    {isProductPicked ? 'Picked Up Item' : 'Main Item on Shelf'}
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    ${activeChannel.productPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 pt-1">
                  {activeChannel.productName}
                </div>
                <div className="text-xs text-slate-600">
                  Item ID: <strong className="text-slate-900">#{activeChannel.activeProduct}</strong> · {activeChannel.productCategory}
                </div>
              </div>

              <button
                onClick={() =>
                  handleSyncBoxedObjectToFirebase({
                    id: activeChannel.activeProduct,
                    name: activeChannel.productName,
                    price: activeChannel.productPrice,
                    category: activeChannel.productCategory,
                    confidence: 99.4,
                    shelfLabel: 'Main Counter',
                    isPrimary: true,
                  })
                }
                disabled={syncingProductId === activeChannel.activeProduct}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>
                  {syncingProductId === activeChannel.activeProduct
                    ? 'Saving to Database...'
                    : 'Save Customer & Item to Database'}
                </span>
              </button>
            </div>

            {/* Nearby Shelf Product Cards */}
            {shelfProducts.slice(0, 1).map((sp) => (
              <div
                key={sp.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-100 text-sky-900">
                      Nearby Shelf Item ({sp.shelfLabel})
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      ${sp.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 pt-1">
                    {sp.name}
                  </div>
                  <div className="text-xs text-slate-600">
                    Item ID: <strong className="text-slate-900">#{sp.id}</strong> · {sp.category}
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleSyncBoxedObjectToFirebase({
                      id: sp.id,
                      name: sp.name,
                      price: sp.price,
                      category: sp.category,
                      confidence: sp.confidence,
                      shelfLabel: sp.shelfLabel,
                      isPrimary: false,
                    })
                  }
                  disabled={syncingProductId === sp.id}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-slate-600" />
                  <span>
                    {syncingProductId === sp.id
                      ? 'Saving...'
                      : 'Save Shelf Item to Database'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Load Shop Video by Link */}
      {isWebModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Switch Camera or Load Video Link
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsWebModalOpen(false);
                  setWebUrlError(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Paste Video Link (MP4 or WebM):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webInputUrl}
                  onChange={(e) => {
                    setWebInputUrl(e.target.value);
                    setWebUrlError(null);
                  }}
                  placeholder="https://example.com/shop-camera.mp4"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleApplyWebUrl()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Open Video
                </button>
              </div>
              {webUrlError && (
                <p className="text-xs text-rose-600 font-medium">{webUrlError}</p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-600">
                Or pick a store camera clip:
              </span>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {WEB_VIDEO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyWebUrl(preset.url, preset.name)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{preset.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {preset.customer} · {preset.productName} (${preset.price.toFixed(2)})
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>Watch</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
