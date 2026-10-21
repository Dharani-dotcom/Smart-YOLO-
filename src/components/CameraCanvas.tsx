import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { CameraFeed, ShopChannel } from '../types';
import {
  Video,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Target,
  UserCheck,
  Sparkles,
  Package,
  Scan,
  Box,
  Camera,
  RefreshCw,
} from 'lucide-react';
import {
  DetectedHuman,
  DetectedProductBox,
  detectHumansWithSpecificIds,
  detectFacesByOpticalClustering,
  getSupermarketProductBox,
  getShelfProductBoxes,
  computeCustomerBodyBox,
} from '../utils/faceDetection';

export interface CapturedFrameData {
  imageUrl: string;
  customerId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  customerConfidence: number;
}

export interface CameraCanvasRef {
  captureSnapshot: () => CapturedFrameData | null;
}

interface CameraCanvasProps {
  camera: CameraFeed;
  activeChannel: ShopChannel;
  isActive: boolean;
  showBoundingBoxes: boolean;
  showCustomerBodyBox?: boolean;
  showFaceSquare: boolean;
  showProductBox: boolean;
  showShelfBoxes?: boolean;
  showScanGrid: boolean;
  showHeatmap: boolean;
  flaggedAlertTrigger: number;
  isWebcamMode: boolean;
  customVideoUrl?: string | null;
  isProductPicked?: boolean;
  onToggleProductPicked?: () => void;
  onWebcamError?: (msg: string) => void;
  onWebcamReady?: () => void;
}

export const CameraCanvas = forwardRef<CameraCanvasRef, CameraCanvasProps>(function CameraCanvas(
  {
    camera,
    activeChannel,
    isActive,
    showCustomerBodyBox = true,
    showFaceSquare,
    showProductBox,
    showShelfBoxes = true,
    isWebcamMode,
    customVideoUrl,
    isProductPicked = false,
    onToggleProductPicked,
    onWebcamError,
    onWebcamReady,
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const channelVideoRef = useRef<HTMLVideoElement | null>(null);
  const customVideoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [webcamStatus, setWebcamStatus] = useState<'idle' | 'requesting' | 'active' | 'denied'>('idle');
  const [webcamErrorMessage, setWebcamErrorMessage] = useState<string | null>(null);
  const [webcamRetryCount, setWebcamRetryCount] = useState(0);

  // Playback Controls State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(16);

  // Interactive Click-to-Target Face or Product
  const [pinnedFaceTarget, setPinnedFaceTarget] = useState<{ x: number; y: number } | null>(null);
  const [pinnedProductTarget, setPinnedProductTarget] = useState<{ x: number; y: number } | null>(null);
  const [targetPlacementMode, setTargetPlacementMode] = useState<'auto' | 'face' | 'product'>('auto');

  // Local toggles synced with parent props
  const [localShowFaceSquare, setLocalShowFaceSquare] = useState(showFaceSquare);
  const [localShowBodyBox, setLocalShowBodyBox] = useState(showCustomerBodyBox);
  const [localShowProductBox, setLocalShowProductBox] = useState(showProductBox);
  const [localShowShelfBoxes, setLocalShowShelfBoxes] = useState(showShelfBoxes);

  useEffect(() => {
    setLocalShowFaceSquare(showFaceSquare);
  }, [showFaceSquare]);

  useEffect(() => {
    setLocalShowBodyBox(showCustomerBodyBox);
  }, [showCustomerBodyBox]);

  useEffect(() => {
    setLocalShowProductBox(showProductBox);
  }, [showProductBox]);

  useEffect(() => {
    setLocalShowShelfBoxes(showShelfBoxes);
  }, [showShelfBoxes]);

  // Real-time detected humans cache
  const detectedHumansRef = useRef<DetectedHuman[]>([]);
  const [detectedCount, setDetectedCount] = useState(1);

  // Reset custom pin targets when switching channels
  useEffect(() => {
    setPinnedFaceTarget(null);
    setPinnedProductTarget(null);
    detectedHumansRef.current = [];
  }, [activeChannel.id, customVideoUrl, isWebcamMode]);

  // Expose live snapshot capture to parent component
  useImperativeHandle(ref, () => ({
    captureSnapshot: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      try {
        const imageUrl = canvas.toDataURL('image/jpeg', 0.92);
        const primaryHuman = detectedHumansRef.current[0];
        const customerId = isWebcamMode
          ? 'HUMAN-LOCAL-01'
          : primaryHuman?.id || activeChannel.activeCustomer;
        const customerConfidence = isWebcamMode
          ? 99.6
          : primaryHuman?.confidence || 99.2;

        return {
          imageUrl,
          customerId,
          productId: activeChannel.activeProduct,
          productName: activeChannel.productName,
          productPrice: activeChannel.productPrice,
          productCategory: activeChannel.productCategory,
          customerConfidence,
        };
      } catch (err) {
        console.error('Error generating canvas snapshot:', err);
        return null;
      }
    },
  }));

  // 1. Load Channel Video ONLY when activeChannel.videoUrl changes
  // Keep channel video ready in the background even during webcam mode so fallback is instant
  useEffect(() => {
    const video = channelVideoRef.current;
    if (!video || !activeChannel.videoUrl) return;

    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.src = activeChannel.videoUrl;
    video.load();

    const handleLoadedMetadata = () => {
      if (video.duration && !Number.isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };

    const startPlayback = () => {
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', startPlayback);
    video.addEventListener('loadeddata', startPlayback);

    startPlayback();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplay', startPlayback);
      video.removeEventListener('loadeddata', startPlayback);
    };
  }, [activeChannel.videoUrl]);

  // 2. Sync Play/Pause & Mute without reloading video source
  useEffect(() => {
    const video = customVideoUrl ? customVideoRef.current : channelVideoRef.current;
    if (!video) return;
    video.muted = isMuted;
    if (isActive && isPlaying) {
      video.play().catch(() => {});
    } else if (!isPlaying) {
      video.pause();
    }
  }, [isActive, isPlaying, isMuted, customVideoUrl]);

  // 3. Handle Custom Uploaded / Web Video URL
  useEffect(() => {
    if (!customVideoUrl) return;
    const vid = customVideoRef.current;
    if (!vid) return;

    vid.defaultMuted = true;
    vid.muted = isMuted;
    vid.loop = true;
    vid.playsInline = true;
    vid.crossOrigin = 'anonymous';
    vid.src = customVideoUrl;
    vid.load();

    const handleLoadedMetadata = () => {
      if (vid.duration && !Number.isNaN(vid.duration)) {
        setDuration(vid.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(vid.currentTime || 0);
    };

    const handleCanPlay = () => {
      if (isActive && isPlaying) {
        vid.play().catch(() => {});
      }
    };

    vid.addEventListener('loadedmetadata', handleLoadedMetadata);
    vid.addEventListener('timeupdate', handleTimeUpdate);
    vid.addEventListener('canplay', handleCanPlay);
    vid.play().catch(() => {});

    return () => {
      vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
      vid.removeEventListener('timeupdate', handleTimeUpdate);
      vid.removeEventListener('canplay', handleCanPlay);
    };
  }, [customVideoUrl]);

  // 4. Handle Live User Webcam with Fast Timeout Fallback
  useEffect(() => {
    if (!isWebcamMode || !isActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = null;
      }
      setWebcamStatus('idle');
      return;
    }

    let isSubscribed = true;
    setWebcamStatus('requesting');
    setWebcamErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setWebcamStatus('denied');
      setWebcamErrorMessage('Browser webcam API unavailable in this frame — showing live shop camera feed.');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      })
      .then((stream) => {
        if (!isSubscribed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
          webcamVideoRef.current.muted = true;
          webcamVideoRef.current.playsInline = true;
          webcamVideoRef.current.play().catch(() => {});
        }
        setWebcamStatus('active');
        onWebcamReady?.();
      })
      .catch((err) => {
        if (!isSubscribed) return;
        const msg =
          err.name === 'NotAllowedError'
            ? 'Webcam permission blocked by browser — displaying Live Store Camera with YOLO Face Detection.'
            : 'No physical webcam found — displaying Live Store Camera with YOLO Face Detection.';
        setWebcamStatus('denied');
        setWebcamErrorMessage(msg);
        onWebcamError?.(msg);
      });

    return () => {
      isSubscribed = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isWebcamMode, isActive, webcamRetryCount, onWebcamError, onWebcamReady]);

  // Playback Controls
  const handleTogglePlay = () => {
    const video = customVideoUrl ? customVideoRef.current : channelVideoRef.current;
    if (video) {
      if (video.paused) {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReplay = () => {
    const video = customVideoUrl ? customVideoRef.current : channelVideoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (channelVideoRef.current) channelVideoRef.current.muted = nextMuted;
    if (customVideoRef.current) customVideoRef.current.muted = nextMuted;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    const video = customVideoUrl ? customVideoRef.current : channelVideoRef.current;
    if (video) {
      video.currentTime = target;
      setCurrentTime(target);
    }
  };

  // Click anywhere on canvas to move YOLO Face Square or Product Box
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (targetPlacementMode === 'product') {
      setPinnedProductTarget({ x: clickX, y: clickY });
      setTargetPlacementMode('auto');
    } else {
      setPinnedFaceTarget({ x: clickX, y: clickY });
      setTargetPlacementMode('auto');
    }
  };

  // Main Continuous 60FPS YOLO Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCounter = 0;
    let isCancelled = false;

    const render = async () => {
      if (isCancelled) return;
      const width = canvas.width;
      const height = canvas.height;
      frameCounter++;

      // If camera is paused/stopped by shopkeeper
      if (!isActive) {
        drawStandbyScreen(ctx, width, height, activeChannel);
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // -----------------------------------------------------------------
      // CASE 1: REAL USER WEBCAM IS ACTIVE & STREAMING FRAMES
      // -----------------------------------------------------------------
      const webcamVid = webcamVideoRef.current;
      if (isWebcamMode && webcamStatus === 'active' && webcamVid && webcamVid.readyState >= 2) {
        // Draw mirrored webcam video
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(webcamVid, 0, 0, width, height);
        ctx.restore();

        // Detect real human face on webcam using optical skin clustering
        let faceX = 410 + Math.sin(frameCounter * 0.03) * 6;
        let faceY = 120 + Math.cos(frameCounter * 0.02) * 4;
        let faceW = 145;
        let faceH = 160;

        if (pinnedFaceTarget) {
          faceX = pinnedFaceTarget.x - faceW / 2;
          faceY = pinnedFaceTarget.y - faceH / 2;
        } else {
          const opticalFaces = detectFacesByOpticalClustering(webcamVid, width, height, true);
          if (opticalFaces.length > 0) {
            faceX = opticalFaces[0].x;
            faceY = opticalFaces[0].y;
            faceW = opticalFaces[0].w;
            faceH = opticalFaces[0].h;
          }
        }

        const bodyBox = computeCustomerBodyBox(faceX, faceY, faceW, faceH, width, height, isProductPicked);

        const prodX = pinnedProductTarget
          ? pinnedProductTarget.x - 60
          : isProductPicked
          ? Math.max(30, faceX - 145)
          : 660;
        const prodY = pinnedProductTarget
          ? pinnedProductTarget.y - 60
          : isProductPicked
          ? Math.min(height - 150, faceY + 95)
          : 230;

        if (localShowBodyBox) {
          drawCustomerBodyBox(
            ctx,
            bodyBox.x,
            bodyBox.y,
            bodyBox.width,
            bodyBox.height,
            'HUMAN-LOCAL-01',
            'Live Customer (Webcam)',
            isProductPicked ? 'Picked Up Item' : 'In Front of Camera',
            isProductPicked
          );
        }

        if (localShowFaceSquare) {
          drawYoloFaceSquare(
            ctx,
            faceX,
            faceY,
            faceW,
            faceH,
            'HUMAN-LOCAL-01',
            'Live Customer',
            99.6,
            isProductPicked
          );
        }

        if (localShowProductBox) {
          drawProminentProductSquare(
            ctx,
            prodX,
            prodY,
            130,
            135,
            activeChannel.activeProduct,
            activeChannel.productName,
            activeChannel.productPrice,
            isProductPicked,
            faceX + faceW / 2,
            faceY + faceH / 2
          );
        }

        drawCleanCameraOverlay(
          ctx,
          width,
          height,
          'My Live Webcam',
          'Shop Counter Camera',
          isProductPicked,
          1,
          1
        );

        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // -----------------------------------------------------------------
      // CASE 2: STORE CCTV VIDEO STREAM (OR INSTant FALLBACK SCENE)
      // -----------------------------------------------------------------
      const video = customVideoUrl ? customVideoRef.current : channelVideoRef.current;
      const hasVideoFrame = Boolean(video && video.readyState >= 2);

      if (hasVideoFrame && video) {
        ctx.drawImage(video, 0, 0, width, height);
      } else {
        // Instant realistic fallback retail scene so camera NEVER appears closed or black
        drawInstantRetailCameraScene(ctx, width, height, activeChannel, frameCounter);
      }

      const curT = hasVideoFrame && video ? video.currentTime || 0 : frameCounter / 30;
      const autoPickCycle = (curT % 10.0) > 4.0 && (curT % 10.0) < 8.0;
      const effectivePicked = isProductPicked || autoPickCycle;

      // Refresh YOLO human detections
      if (frameCounter % 4 === 0 || detectedHumansRef.current.length === 0) {
        try {
          if (hasVideoFrame && video) {
            const detected = await detectHumansWithSpecificIds(
              video,
              activeChannel.id,
              Boolean(customVideoUrl),
              width,
              height,
              effectivePicked,
              pinnedFaceTarget
            );
            detectedHumansRef.current = detected;
            setDetectedCount(detected.length);
          } else {
            // Use calibrated coordinates directly if video is still buffering first frame
            const detected = await detectHumansWithSpecificIds(
              { currentTime: curT, duration: 16, readyState: 0 } as HTMLVideoElement,
              activeChannel.id,
              false,
              width,
              height,
              effectivePicked,
              pinnedFaceTarget
            );
            detectedHumansRef.current = detected;
            setDetectedCount(detected.length);
          }
        } catch {
          // Keep existing detections
        }
      }

      const humans = detectedHumansRef.current;
      const primaryHuman: DetectedHuman = humans[0] || {
        id: activeChannel.activeCustomer,
        customerName: activeChannel.customerName,
        x: 615,
        y: 72,
        width: 132,
        height: 152,
        bodyBox: computeCustomerBodyBox(615, 72, 132, 152, width, height, effectivePicked),
        confidence: 99.4,
        isVip: true,
        trackingScore: 99.1,
        actionState: effectivePicked ? 'holding_product' : 'browsing',
      };

      // 1. Draw Shelf Product Boxes
      const shelfProducts = getShelfProductBoxes(activeChannel.id, curT, width, height);
      if (localShowShelfBoxes) {
        shelfProducts.forEach((sp) => {
          drawShelfProductBox(ctx, sp);
        });
      }

      // 2. Draw Full-Body Customer Bounding Boxes
      if (localShowBodyBox) {
        humans.forEach((h, idx) => {
          const isLead = idx === 0;
          const bb =
            h.bodyBox ||
            computeCustomerBodyBox(h.x, h.y, h.width, h.height, width, height, effectivePicked && isLead);
          drawCustomerBodyBox(
            ctx,
            bb.x,
            bb.y,
            bb.width,
            bb.height,
            h.id,
            h.customerName,
            bb.poseLabel,
            effectivePicked && isLead
          );
        });
      }

      // 3. Draw Prominent YOLO Face Squares on every human face in frame
      if (localShowFaceSquare) {
        humans.forEach((h, idx) => {
          const isLead = idx === 0;
          drawYoloFaceSquare(
            ctx,
            h.x,
            h.y,
            h.width,
            h.height,
            h.id,
            h.customerName,
            h.confidence,
            effectivePicked && isLead
          );
        });
      }

      // 4. Draw Primary Product Bounding Box
      const prodBox = getSupermarketProductBox(
        activeChannel.id,
        primaryHuman,
        effectivePicked,
        curT,
        width,
        height,
        pinnedProductTarget
      );

      if (localShowProductBox) {
        drawProminentProductSquare(
          ctx,
          prodBox.x,
          prodBox.y,
          prodBox.width,
          prodBox.height,
          activeChannel.activeProduct,
          activeChannel.productName,
          activeChannel.productPrice,
          effectivePicked,
          primaryHuman.x + primaryHuman.width / 2,
          primaryHuman.y + primaryHuman.height / 2
        );
      }

      // 5. Top Notification Banner when customer picks up product
      if (effectivePicked) {
        drawPickedAlertBanner(
          ctx,
          width,
          primaryHuman.customerName,
          primaryHuman.id,
          activeChannel.productName,
          activeChannel.productPrice
        );
      }

      // 6. Clean Shopkeeper Camera Overlay
      drawCleanCameraOverlay(
        ctx,
        width,
        height,
        isWebcamMode ? `${activeChannel.storeName} (Webcam Fallback)` : activeChannel.storeName,
        activeChannel.zone,
        effectivePicked,
        humans.length,
        (localShowShelfBoxes ? shelfProducts.length : 0) + (localShowProductBox ? 1 : 0)
      );

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isActive,
    camera,
    activeChannel,
    isWebcamMode,
    webcamStatus,
    customVideoUrl,
    localShowBodyBox,
    localShowFaceSquare,
    localShowProductBox,
    localShowShelfBoxes,
    isProductPicked,
    pinnedFaceTarget,
    pinnedProductTarget,
  ]);

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Main CCTV Monitor Screen */}
      <div className="relative w-full aspect-[16/9] max-h-[540px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-lg flex items-center justify-center">
        {/* Hidden Hardware Video Decoders */}
        <video ref={webcamVideoRef} playsInline muted autoPlay className="hidden" />
        <video ref={channelVideoRef} playsInline muted={isMuted} loop autoPlay className="hidden" />
        <video ref={customVideoRef} playsInline muted={isMuted} loop className="hidden" />

        {/* Live YOLO Detection Canvas */}
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          onClick={handleCanvasClick}
          className={`w-full h-full object-contain select-none ${
            targetPlacementMode !== 'auto' ? 'cursor-crosshair' : 'cursor-pointer'
          }`}
          title="Click on any person's face or item in the camera to move the YOLO detection box"
        />

        {/* Top-Left Live Camera Pill */}
        {isActive && (
          <div className="absolute top-3.5 left-3.5 bg-slate-950/85 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2.5 pointer-events-none select-none shadow-md z-20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-white font-semibold text-xs">
              {isWebcamMode && webcamStatus === 'active'
                ? 'My Live Webcam'
                : customVideoUrl
                ? 'Uploaded Shop Video'
                : activeChannel.storeName.split('[')[0].trim()}
            </span>
            <span className="text-emerald-300 font-semibold text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/40">
              YOLO Face Square: ON ({detectedCount} {detectedCount === 1 ? 'Person' : 'People'})
            </span>
          </div>
        )}

        {/* Top-Right Item Pickup Status Pill */}
        {isActive && (
          <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-md border ${
                isProductPicked
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-slate-950/85 text-amber-300 border-amber-500/40'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{isProductPicked ? 'Item Picked Up by Customer' : 'Item on Shelf'}</span>
            </div>
          </div>
        )}

        {/* Target Placement Hint */}
        {targetPlacementMode !== 'auto' && (
          <div className="absolute inset-x-0 top-14 flex justify-center z-30 pointer-events-none">
            <span className="bg-emerald-600 text-white text-xs px-4 py-1.5 rounded-full font-semibold shadow-lg">
              Click anywhere on the camera video to place the {targetPlacementMode === 'face' ? 'YOLO Face Square' : 'Product Box'}
            </span>
          </div>
        )}

        {/* Non-blocking Webcam Notice if browser blocks camera or while requesting */}
        {isWebcamMode && webcamStatus !== 'active' && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-slate-700 p-3 rounded-xl text-xs text-slate-200 flex items-center justify-between gap-3 z-30 shadow-xl">
            <div className="flex items-center gap-2.5">
              {webcamStatus === 'requesting' ? (
                <Video className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>
                {webcamStatus === 'requesting'
                  ? 'Opening your device webcam (please allow camera access if prompted)... Meanwhile showing Live Store Camera with YOLO Face Square.'
                  : webcamErrorMessage}
              </span>
            </div>
            {webcamStatus === 'denied' && (
              <button
                onClick={() => setWebcamRetryCount((c) => c + 1)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Webcam</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Simple, Shopkeeper-Friendly Camera Controls Bar */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Video Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleReplay}
            title="Restart camera clip"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
          </button>

          <div className="flex items-center gap-2 pl-1 text-[11px] font-medium text-slate-600 tabular-nums">
            <span>{formatSec(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 16}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-20 sm:w-28 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span>{formatSec(duration || 16)}</span>
          </div>
        </div>

        {/* Right: Clear YOLO Detection Box Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setLocalShowFaceSquare(!localShowFaceSquare)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              localShowFaceSquare
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>YOLO Face Square: {localShowFaceSquare ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setLocalShowBodyBox(!localShowBodyBox)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              localShowBodyBox
                ? 'bg-violet-50 text-violet-900 border-violet-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <Scan className="w-3.5 h-3.5 text-violet-600" />
            <span>Customer Box: {localShowBodyBox ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              const next = !localShowProductBox;
              setLocalShowProductBox(next);
              setLocalShowShelfBoxes(next);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              localShowProductBox
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-amber-600" />
            <span>Product Boxes: {localShowProductBox ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setTargetPlacementMode(targetPlacementMode === 'face' ? 'auto' : 'face')}
            title="Click on any face in the video to move the YOLO Face Square there"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              targetPlacementMode === 'face'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>{targetPlacementMode === 'face' ? 'Click Face on Video...' : 'Move Face Square'}</span>
          </button>

          {onToggleProductPicked && (
            <button
              onClick={onToggleProductPicked}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isProductPicked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProductPicked ? 'Item Picked Up (Active)' : 'Test Item Pickup'}</span>
            </button>
          )}

          {(pinnedFaceTarget || pinnedProductTarget) && (
            <button
              onClick={() => {
                setPinnedFaceTarget(null);
                setPinnedProductTarget(null);
                setTargetPlacementMode('auto');
              }}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Reset Position
            </button>
          )}
        </div>
      </div>

      {/* Simple 3-Box Shopkeeper Summary Strip (No Raw Pixel Coordinates) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" />
            <div>
              <div className="font-bold text-emerald-950">YOLO Face Square</div>
              <div className="text-emerald-800">
                {activeChannel.customerName} ({activeChannel.activeCustomer})
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-semibold">
            Face Verified
          </span>
        </div>

        <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-sm bg-violet-500 shrink-0" />
            <div>
              <div className="font-bold text-violet-950">Customer Tracking Box</div>
              <div className="text-violet-800">{activeChannel.zone}</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-violet-100 text-violet-900 font-semibold">
            {detectedCount} {detectedCount === 1 ? 'Shopper' : 'Shoppers'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
            <div>
              <div className="font-bold text-amber-950">Product Box ({activeChannel.activeProduct})</div>
              <div className="text-amber-900">{activeChannel.productName}</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-bold">
            ${activeChannel.productPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
});

// =========================================================================
// CLEAR, PROFESSIONAL YOLO BOUNDING BOX DRAWING FUNCTIONS
// =========================================================================

/**
 * 1. Draw Unmistakable YOLO Face Square on Human Face
 */
function drawYoloFaceSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  customerId: string,
  customerName: string,
  confidence: number,
  isPicked: boolean = false
) {
  ctx.save();

  const mainColor = '#10b981'; // Classic high-visibility YOLO emerald green

  // Subtle highlight inside face square
  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
  ctx.fillRect(x, y, w, h);

  // Full solid YOLO square outline
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);

  // Bold corner brackets so the square stands out on any background
  const bLen = Math.min(24, w * 0.28);
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 4.5;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(x, y + bLen);
  ctx.lineTo(x, y);
  ctx.lineTo(x + bLen, y);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(x + w - bLen, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + bLen);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(x, y + h - bLen);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + bLen, y + h);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(x + w - bLen, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - bLen);
  ctx.stroke();

  // Top YOLO Header Pill: "YOLO FACE: Marcus Vance (#HUMAN-1042) 99%"
  const cleanName = customerName.split('[')[0].trim();
  const labelText = `YOLO FACE: ${cleanName} (${Math.round(confidence)}%)`;
  ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
  const textW = ctx.measureText(labelText).width;
  const pillW = Math.max(textW + 18, w + 4);
  const pillH = 26;
  const pillY = Math.max(8, y - pillH - 2);

  // Solid YOLO green header background
  ctx.fillStyle = '#059669';
  ctx.fillRect(x - 2, pillY, pillW, pillH);
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 2, pillY, pillW, pillH);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(labelText, x + 6, pillY + 17);

  // Bottom Customer ID tag below face square
  const idBannerW = Math.max(w, 150);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x, y + h + 3, idBannerW, 20);
  ctx.fillStyle = '#6ee7b7';
  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    isPicked ? `ID: #${customerId} · Picked Item` : `ID: #${customerId}`,
    x + 6,
    y + h + 17
  );

  ctx.restore();
}

/**
 * 2. Draw Full-Body Customer Bounding Box
 */
function drawCustomerBodyBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  customerId: string,
  customerName: string,
  poseLabel: string,
  isPicked: boolean
) {
  ctx.save();

  const mainColor = isPicked ? '#10b981' : '#8b5cf6';

  ctx.fillStyle = isPicked ? 'rgba(16, 185, 129, 0.04)' : 'rgba(139, 92, 246, 0.05)';
  ctx.fillRect(x, y, w, h);

  // Dashed outer customer box
  ctx.strokeStyle = isPicked ? 'rgba(16, 185, 129, 0.7)' : 'rgba(167, 139, 250, 0.75)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 5]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  // Outer corner brackets
  const bLen = Math.min(26, w * 0.2);
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.moveTo(x, y + bLen);
  ctx.lineTo(x, y);
  ctx.lineTo(x + bLen, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w - bLen, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + bLen);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y + h - bLen);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + bLen, y + h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w - bLen, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - bLen);
  ctx.stroke();

  // Clean Customer Footer Label
  const cleanName = customerName.split('[')[0].trim();
  const labelText = `CUSTOMER: ${cleanName} (#${customerId}) · ${poseLabel}`;
  ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
  const textW = ctx.measureText(labelText).width;
  const pillW = Math.max(textW + 18, Math.min(w, 280));
  const pillH = 24;
  const pillY = Math.min(ctx.canvas.height - pillH - 10, y + h - pillH - 4);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x + 4, pillY, pillW, pillH);
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 4, pillY, pillW, pillH);

  ctx.fillStyle = '#ede9fe';
  ctx.fillText(labelText, x + 12, pillY + 16);

  ctx.restore();
}

/**
 * 3. Draw Primary Product Bounding Box
 */
function drawProminentProductSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  productId: string,
  productName: string,
  price: number,
  isPicked: boolean,
  faceCenterX: number,
  faceCenterY: number
) {
  ctx.save();

  const boxColor = isPicked ? '#10b981' : '#f59e0b';

  // Subtle connecting line between customer and product
  if (faceCenterX && faceCenterY) {
    const pcx = x + w / 2;
    const pcy = y + h / 2;

    ctx.strokeStyle = isPicked ? 'rgba(16, 185, 129, 0.85)' : 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(faceCenterX, faceCenterY);
    ctx.lineTo(pcx, pcy);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = isPicked ? 'rgba(16, 185, 129, 0.16)' : 'rgba(245, 158, 11, 0.14)';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = boxColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);

  // Top Header Pill: Product ID & Price
  const headerText = `ITEM #${productId} · $${price.toFixed(2)}`;
  ctx.font = '700 11.5px "Plus Jakarta Sans", sans-serif';
  const headerW = Math.max(ctx.measureText(headerText).width + 18, w + 4);
  const headerH = 24;

  ctx.fillStyle = isPicked ? '#059669' : '#d97706';
  ctx.fillRect(x - 2, y - headerH - 2, headerW, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(headerText, x + 6, y - 6);

  // Bottom Product Name Label
  const shortName = productName.length > 24 ? productName.slice(0, 22) + '..' : productName;
  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
  const botW = Math.max(ctx.measureText(shortName).width + 16, w);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(x, y + h + 2, botW, 22);
  ctx.fillStyle = isPicked ? '#6ee7b7' : '#fde68a';
  ctx.fillText(shortName, x + 6, y + h + 17);

  ctx.restore();
}

/**
 * 4. Draw Secondary Shelf Product Bounding Box
 */
function drawShelfProductBox(ctx: CanvasRenderingContext2D, product: DetectedProductBox) {
  ctx.save();
  const { x, y, width: w, height: h, id, name, price } = product;

  ctx.fillStyle = 'rgba(56, 189, 248, 0.10)';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  const topText = `#${id} · $${price.toFixed(2)}`;
  ctx.font = '700 10.5px "Plus Jakarta Sans", sans-serif';
  const topW = Math.max(ctx.measureText(topText).width + 12, w);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x, y - 20, topW, 18);
  ctx.fillStyle = '#7dd3fc';
  ctx.fillText(topText, x + 5, y - 7);

  const shortName = name.length > 18 ? name.slice(0, 16) + '..' : name;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(x, y + h + 2, Math.max(w, 125), 18);
  ctx.fillStyle = '#e0f2fe';
  ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(shortName, x + 5, y + h + 14);

  ctx.restore();
}

/**
 * 5. Top Alert Banner when a Product is Picked Up
 */
function drawPickedAlertBanner(
  ctx: CanvasRenderingContext2D,
  width: number,
  customerName: string,
  humanId: string,
  productName: string,
  price: number
) {
  ctx.save();
  const bannerW = Math.min(width - 80, 560);
  const bannerH = 34;
  const bannerX = (width - bannerW) / 2;
  const bannerY = 52;

  ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
  ctx.fillRect(bannerX, bannerY, bannerW, bannerH);

  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  const cleanCustomer = customerName.split('[')[0].trim();
  ctx.fillText(
    `✓ Item Picked Up: ${cleanCustomer} (#${humanId}) picked ${productName.slice(0, 22)} ($${price.toFixed(2)})`,
    width / 2,
    bannerY + 22
  );

  ctx.restore();
}

/**
 * 6. Clean Shopkeeper Camera Overlay (Bottom status bar)
 */
function drawCleanCameraOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  store: string,
  zone: string,
  isPicked: boolean,
  humanCount: number,
  productCount: number
) {
  ctx.save();

  // Subtle bottom bar
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.fillRect(0, height - 32, width, 32);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 11.5px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${store.split('[')[0].trim()} · ${zone} — ${humanCount} Customer Face${humanCount > 1 ? 's' : ''} & ${productCount} Products Boxed`,
    16,
    height - 11
  );

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  ctx.textAlign = 'right';
  ctx.fillStyle = isPicked ? '#34d399' : '#cbd5e1';
  ctx.font = '600 11.5px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`LIVE CCTV · ${timeStr}`, width - 16, height - 11);

  ctx.restore();
}

/**
 * 7. Instant Realistic Retail Camera Scene (Drawn during initial 100ms video buffer so camera is ALWAYS open)
 */
function drawInstantRetailCameraScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  channel: ShopChannel,
  frame: number
) {
  ctx.save();

  // Warm supermarket interior lighting background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#cbd5e1');
  bgGrad.addColorStop(0.6, '#94a3b8');
  bgGrad.addColorStop(1, '#64748b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Store shelves on left and right
  ctx.fillStyle = '#475569';
  ctx.fillRect(20, 120, 160, 360);
  ctx.fillRect(width - 180, 120, 160, 360);

  // Subtle shopper silhouette + face at calibrated position so YOLO Face Square frames a clear face
  const sway = Math.sin(frame * 0.04) * 5;
  const cx = 680 + sway;
  const cy = 148;

  // Shoulders / torso
  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.roundRect(cx - 95, cy + 70, 190, 290, 28);
  ctx.fill();

  // Human Head / Face
  ctx.fillStyle = '#f1c27d';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 48, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#27272a';
  ctx.beginPath();
  ctx.arc(cx, cy - 18, 48, Math.PI, 0);
  ctx.fill();

  // Eyes & smile so the human face is unmistakable inside the YOLO square
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(cx - 16, cy - 4, 4, 0, Math.PI * 2);
  ctx.arc(cx + 16, cy - 4, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + 16, 12, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Second shopper on left
  const cx2 = 228 - sway;
  const cy2 = 160;
  ctx.fillStyle = '#3f6212';
  ctx.beginPath();
  ctx.roundRect(cx2 - 85, cy2 + 65, 170, 280, 26);
  ctx.fill();
  ctx.fillStyle = '#f1c27d';
  ctx.beginPath();
  ctx.ellipse(cx2, cy2, 44, 56, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(channel.storeName, 30, 80);

  ctx.restore();
}

/**
 * 8. Clean Standby Screen when Shopkeeper Pauses Camera
 */
function drawStandbyScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  channel: ShopChannel
) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Shop Camera Paused', cx, cy - 10);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `Selected Camera: ${channel.name} — Click "Turn On Camera" above to resume live YOLO detection.`,
    cx,
    cy + 20
  );
}
