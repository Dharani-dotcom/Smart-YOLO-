import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { CameraFeed, ShopChannel } from '../types';
import {
  Video,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  Crosshair,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  UserCheck,
  Target,
} from 'lucide-react';
import { detectHumansWithSpecificIds, DetectedHuman, getSupermarketProductBox } from '../utils/faceDetection';

export interface CameraCanvasRef {
  captureSnapshot: () => {
    imageUrl: string;
    customerId: string;
    productId: string;
    productName: string;
    productPrice: number;
    productCategory: string;
    customerConfidence: number;
  } | null;
}

interface CameraCanvasProps {
  camera: CameraFeed;
  activeChannel: ShopChannel;
  isActive: boolean;
  showBoundingBoxes?: boolean;
  showFaceSquare: boolean;
  showProductBox: boolean;
  showScanGrid: boolean;
  showHeatmap?: boolean;
  flaggedAlertTrigger: number;
  isWebcamMode: boolean;
  customVideoUrl?: string | null;
  isProductPicked?: boolean;
  onToggleProductPicked?: () => void;
  onWebcamError?: (error: string) => void;
  onWebcamReady?: () => void;
}

export const CameraCanvas = forwardRef<CameraCanvasRef, CameraCanvasProps>(function CameraCanvas(
  {
    camera,
    activeChannel,
    isActive,
    showFaceSquare,
    showProductBox,
    showScanGrid,
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
  const [channelVideoReady, setChannelVideoReady] = useState(false);
  const [customVideoLoaded, setCustomVideoLoaded] = useState(false);

  // Playback control states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(14);
  const [viewMode, setViewMode] = useState<'hud' | 'raw'>('hud');

  // Manual target repositioning on canvas click
  const [pinnedFaceTarget, setPinnedFaceTarget] = useState<{ x: number; y: number } | null>(null);
  const [pinnedProductTarget, setPinnedProductTarget] = useState<{ x: number; y: number } | null>(null);
  const [targetPlacementMode, setTargetPlacementMode] = useState<'auto' | 'face' | 'product'>('auto');

  // Currently detected humans with specific IDs
  const detectedHumansRef = useRef<DetectedHuman[]>([]);
  const [detectedCount, setDetectedCount] = useState<number>(1);

  // Imperative Snapshot Capture
  useImperativeHandle(ref, () => ({
    captureSnapshot: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      try {
        const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
        const primaryHuman = detectedHumansRef.current[0];

        const customerId = isWebcamMode
          ? 'CUST-LOCAL'
          : primaryHuman
          ? primaryHuman.id
          : activeChannel.activeCustomer;

        const customerConfidence = primaryHuman ? primaryHuman.confidence : 99.2;

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

  // Handle Channel Real Human Video playback
  useEffect(() => {
    if (!activeChannel.videoUrl || isWebcamMode || customVideoUrl) {
      setChannelVideoReady(false);
      return;
    }

    const video = channelVideoRef.current;
    if (!video) return;

    setChannelVideoReady(false);
    video.src = activeChannel.videoUrl;
    video.loop = true;
    video.muted = isMuted;
    video.playsInline = true;
    video.load();

    const handleLoadedMetadata = () => {
      if (video.duration) setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };

    const playVideo = () => {
      if (isActive && isPlaying) {
        video
          .play()
          .then(() => setChannelVideoReady(true))
          .catch((err) => {
            console.warn('Video autoplay waiting for user interaction:', err);
            setChannelVideoReady(true);
          });
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', playVideo);
    video.addEventListener('loadeddata', playVideo);

    if (isActive && isPlaying) {
      playVideo();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplay', playVideo);
      video.removeEventListener('loadeddata', playVideo);
    };
  }, [activeChannel.videoUrl, isWebcamMode, customVideoUrl, isActive, isPlaying, isMuted]);

  // When monitor active state changes, play or pause
  useEffect(() => {
    const video = customVideoUrl ? customVideoRef.current : channelVideoRef.current;
    if (video && !isWebcamMode) {
      if (isActive && isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [isActive, isPlaying, isWebcamMode, customVideoUrl]);

  // Handle custom video URL (uploaded or web net real human video)
  useEffect(() => {
    if (!customVideoUrl) {
      setCustomVideoLoaded(false);
      return;
    }

    const vid = customVideoRef.current;
    if (!vid) return;

    vid.src = customVideoUrl;
    vid.loop = true;
    vid.muted = isMuted;
    vid.playsInline = true;
    vid.crossOrigin = 'anonymous';
    vid.load();

    const handleLoadedMetadata = () => {
      if (vid.duration) setDuration(vid.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(vid.currentTime || 0);
    };

    const handleCanPlay = () => {
      if (isActive && isPlaying) {
        vid
          .play()
          .then(() => setCustomVideoLoaded(true))
          .catch(() => setCustomVideoLoaded(true));
      }
    };

    vid.addEventListener('loadedmetadata', handleLoadedMetadata);
    vid.addEventListener('timeupdate', handleTimeUpdate);
    vid.addEventListener('canplay', handleCanPlay);

    if (isActive && isPlaying) {
      vid.play().catch(() => {});
    }

    return () => {
      vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
      vid.removeEventListener('timeupdate', handleTimeUpdate);
      vid.removeEventListener('canplay', handleCanPlay);
    };
  }, [customVideoUrl, isActive, isPlaying, isMuted]);

  // Handle Webcam Start / Stop
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

    navigator.mediaDevices
      ?.getUserMedia({
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
          webcamVideoRef.current.play().catch(() => {});
        }
        setWebcamStatus('active');
        onWebcamReady?.();
      })
      .catch((err) => {
        if (!isSubscribed) return;
        const msg =
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in browser.'
            : `Camera unavailable (${err.message}). Showing store footage.`;
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
  }, [isWebcamMode, isActive, onWebcamError, onWebcamReady]);

  // Toggle Play / Pause
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

  // Replay Video
  const handleReplay = () => {
    const video = customVideoUrl ? customVideoRef.current : channelVideoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (channelVideoRef.current) channelVideoRef.current.muted = nextMuted;
    if (customVideoRef.current) customVideoRef.current.muted = nextMuted;
  };

  // Seek bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    const video = customVideoUrl ? customVideoRef.current : channelVideoRef.current;
    if (video) {
      video.currentTime = target;
      setCurrentTime(target);
    }
  };

  // Canvas Click: Allow operator to target face or product manually
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (targetPlacementMode === 'face') {
      setPinnedFaceTarget({ x: clickX, y: clickY });
      setTargetPlacementMode('auto');
    } else if (targetPlacementMode === 'product') {
      setPinnedProductTarget({ x: clickX, y: clickY });
      setTargetPlacementMode('auto');
    } else {
      // By default clicking anywhere targets the human face at that location
      setPinnedFaceTarget({ x: clickX, y: clickY });
    }
  };

  // Main Render Loop with Continuous Real-Time Human Detection & Specific ID Assignment
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scanBeamY = 0;
    let frameCounter = 0;

    const render = async () => {
      const width = canvas.width;
      const height = canvas.height;
      frameCounter++;

      // Standby Screen
      if (!isActive) {
        drawStandbyScreen(ctx, width, height, camera, activeChannel);
        return;
      }

      // -----------------------------------------------------------------
      // SOURCE 1: LIVE WEBCAM VIDEO (REAL HUMAN)
      // -----------------------------------------------------------------
      if (isWebcamMode && webcamVideoRef.current && webcamStatus === 'active') {
        const video = webcamVideoRef.current;
        if (video.readyState >= 2) {
          ctx.save();
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, width, height);
          ctx.restore();
        } else {
          drawLoadingStream(ctx, width, height, 'CONNECTING TO LOCAL WEBCAM SENSOR...');
        }

        const wobbleX = Math.sin(frameCounter * 0.03) * 6;
        const wobbleY = Math.cos(frameCounter * 0.02) * 4;
        const faceX = pinnedFaceTarget ? pinnedFaceTarget.x - 70 : 380 + wobbleX;
        const faceY = pinnedFaceTarget ? pinnedFaceTarget.y - 70 : 140 + wobbleY;
        const faceSize = 145;

        const prodX = pinnedProductTarget
          ? pinnedProductTarget.x - 60
          : isProductPicked
          ? 530 + Math.sin(frameCounter * 0.02) * 8
          : 640;
        const prodY = pinnedProductTarget
          ? pinnedProductTarget.y - 70
          : isProductPicked
          ? 200 + Math.cos(frameCounter * 0.03) * 6
          : 240;

        if (showFaceSquare) {
          drawProminentFaceSquare(
            ctx,
            faceX,
            faceY,
            faceSize,
            faceSize,
            'HUMAN-LOCAL-01',
            'You [Verified User]',
            99.6,
            '#06b6d4',
            frameCounter,
            isProductPicked
          );
        }

        if (showProductBox) {
          drawProminentProductSquare(
            ctx,
            prodX,
            prodY,
            140,
            160,
            activeChannel.activeProduct,
            activeChannel.productName,
            activeChannel.productPrice,
            isProductPicked ? '#10b981' : '#f59e0b',
            frameCounter,
            isProductPicked,
            faceX + faceSize / 2,
            faceY + faceSize / 2
          );
        }

        drawTechSurveillanceHUD(
          ctx,
          width,
          height,
          'LOCAL WEBCAM FEED',
          'Terminal Workstation 01',
          frameCounter,
          isProductPicked,
          1
        );
      }
      // -----------------------------------------------------------------
      // SOURCE 2 & 3: REAL HUMAN SHOP SURVEILLANCE VIDEO (LOCAL OR NET)
      // -----------------------------------------------------------------
      else {
        const video = customVideoUrl ? customVideoRef.current : channelVideoRef.current;

        if (video && video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, width, height);

          // Update human face detections with specific IDs
          if (frameCounter % 4 === 0 || detectedHumansRef.current.length === 0) {
            try {
              const detected = await detectHumansWithSpecificIds(
                video,
                activeChannel.id,
                Boolean(customVideoUrl),
                width,
                height,
                isProductPicked,
                pinnedFaceTarget
              );
              detectedHumansRef.current = detected;
              setDetectedCount(detected.length);
            } catch (err) {
              console.warn('Face detection refresh error:', err);
            }
          }

          const humans = detectedHumansRef.current;
          const primaryHuman = humans[0] || {
            id: 'HUMAN-1042',
            customerName: activeChannel.customerName,
            x: 460,
            y: 220,
            width: 90,
            height: 90,
            confidence: 99.1,
            isVip: false,
          };

          // Auto-detect picking motion based on video timeline or manual toggle
          const curT = video.currentTime || 0;
          const autoPickCycle = (curT % 9.0) > 3.0 && (curT % 9.0) < 7.8;
          const effectivePicked = isProductPicked || autoPickCycle;

          // Draw squares on all detected human faces with specific IDs
          if (showFaceSquare) {
            humans.forEach((h, idx) => {
              const isLead = idx === 0;
              const isVip = h.isVip || activeChannel.activeCustomer.startsWith('VIP');
              const squareColor = effectivePicked && isLead ? '#10b981' : isVip ? '#38bdf8' : '#06b6d4';

              drawProminentFaceSquare(
                ctx,
                h.x,
                h.y,
                h.width,
                h.height,
                h.id,
                h.customerName,
                h.confidence,
                squareColor,
                frameCounter,
                effectivePicked && isLead
              );
            });
          }

          // Draw Product ID Bounding Box & Picking Detection
          if (showProductBox) {
            const h = primaryHuman;
            const prodBox = getSupermarketProductBox(
              activeChannel.id,
              h,
              effectivePicked,
              curT,
              width,
              height,
              pinnedProductTarget
            );

            drawProminentProductSquare(
              ctx,
              prodBox.x,
              prodBox.y,
              prodBox.width,
              prodBox.height,
              activeChannel.activeProduct,
              activeChannel.productName,
              activeChannel.productPrice,
              effectivePicked ? '#10b981' : '#f59e0b',
              frameCounter,
              effectivePicked,
              h.x + h.width / 2,
              h.y + h.height / 2
            );
          }

          // Top action notification if product is picked up
          if (effectivePicked) {
            drawPickedAlertBanner(
              ctx,
              width,
              primaryHuman.id,
              activeChannel.activeProduct,
              activeChannel.productName,
              activeChannel.productPrice,
              frameCounter
            );
          }

          // Tech Surveillance HUD
          drawTechSurveillanceHUD(
            ctx,
            width,
            height,
            customVideoUrl ? 'NET VIDEO STREAM' : activeChannel.storeName,
            activeChannel.zone,
            frameCounter,
            isProductPicked,
            humans.length
          );
        } else {
          drawLoadingStream(
            ctx,
            width,
            height,
            `DECODING OPTICAL VIDEO STREAM: ${(customVideoUrl ? 'NET CLIP' : activeChannel.storeName).toUpperCase()}...`
          );
        }
      }

      // High-tech laser scanline
      if (showScanGrid) {
        scanBeamY = (scanBeamY + 2.5) % height;
        const grad = ctx.createLinearGradient(0, scanBeamY - 15, 0, scanBeamY + 15);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.45)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, scanBeamY - 15, width, 30);

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scanBeamY);
        ctx.lineTo(width, scanBeamY);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
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
    customVideoLoaded,
    channelVideoReady,
    showFaceSquare,
    showProductBox,
    showScanGrid,
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
      {/* Outer Security Console Chassis (White Theme) */}
      <div className="relative w-full aspect-[16/9] max-h-[540px] bg-[#070b13] rounded-2xl overflow-hidden border border-slate-300 shadow-xl flex items-center justify-center group">
        {/* Underlying Video Elements for hardware decoding */}
        <video
          ref={webcamVideoRef}
          playsInline
          muted
          autoPlay
          className="hidden"
        />
        <video
          ref={channelVideoRef}
          playsInline
          muted={isMuted}
          loop
          autoPlay
          className={viewMode === 'raw' && !isWebcamMode && !customVideoUrl ? 'w-full h-full object-contain' : 'hidden'}
        />
        <video
          ref={customVideoRef}
          playsInline
          muted={isMuted}
          loop
          className={viewMode === 'raw' && customVideoUrl ? 'w-full h-full object-contain' : 'hidden'}
        />

        {/* Primary Video Canvas Output (when viewMode is HUD) */}
        {viewMode === 'hud' && (
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            onClick={handleCanvasClick}
            className={`w-full h-full object-contain select-none ${
              targetPlacementMode !== 'auto' ? 'cursor-crosshair' : 'cursor-pointer'
            }`}
            title="Click anywhere on the video to target a human face or product"
          />
        )}

        {/* Top-Left Live Status Badge */}
        {isActive && (
          <div className="absolute top-3.5 left-3.5 bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2.5 pointer-events-none select-none shadow-lg z-20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-white font-mono text-[11px] tracking-wide font-bold">
              {isWebcamMode
                ? 'WEBCAM: LIVE REAL HUMAN SENSOR'
                : customVideoUrl
                ? 'CUSTOM REAL VIDEO: ACTIVE'
                : activeChannel.storeName}
            </span>
            <span className="text-cyan-400 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
              {detectedCount} {detectedCount === 1 ? 'HUMAN' : 'HUMANS'} TRACKED
            </span>
          </div>
        )}

        {/* Top-Right Picking State Pill Overlay */}
        {isActive && (
          <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md shadow-md border ${
                isProductPicked
                  ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/50 ring-2 ring-emerald-500/30'
                  : 'bg-amber-950/85 text-amber-300 border-amber-500/40'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{isProductPicked ? 'PRODUCT IN-HAND (PICKED UP)' : 'BROWSING ON SHELF'}</span>
            </div>
          </div>
        )}

        {/* Target Placement Hint Overlay */}
        {targetPlacementMode !== 'auto' && (
          <div className="absolute inset-x-0 top-14 flex justify-center z-30 pointer-events-none">
            <span className="bg-cyan-950/90 text-cyan-200 border border-cyan-400 text-xs px-4 py-1.5 rounded-full font-mono font-bold shadow-lg animate-bounce">
              Click anywhere on video to place {targetPlacementMode === 'face' ? 'Human Face Square' : 'Product Box'}
            </span>
          </div>
        )}

        {/* Webcam Requesting Banner */}
        {isWebcamMode && webcamStatus === 'requesting' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-12 h-12 rounded-full bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3 animate-pulse">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide">CONNECTING TO DEVICE CAMERA</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Please approve camera permissions in your browser toolbar.
            </p>
          </div>
        )}

        {/* Webcam Error Banner */}
        {isWebcamMode && webcamStatus === 'denied' && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-rose-500/50 p-3.5 rounded-lg text-xs text-slate-200 flex items-center gap-2.5 z-30 shadow-2xl">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="flex-1 text-[11px]">
              {webcamErrorMessage || 'Webcam feed offline. Reverting to store surveillance channels.'}
            </p>
          </div>
        )}
      </div>

      {/* Real Video Playback & Vision Control Bar (White Theme) */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause video' : 'Play video'}
            className="p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold transition-colors flex items-center gap-1 shadow-2xs"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-cyan-700" /> : <Play className="w-4 h-4 text-cyan-700" />}
            <span className="font-mono text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Replay */}
          <button
            onClick={handleReplay}
            title="Restart video from beginning"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-600" />}
          </button>

          {/* Time Scrubber */}
          <div className="flex items-center gap-2 pl-1 font-mono text-[11px] text-slate-600">
            <span>{formatSec(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 14}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-20 sm:w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <span>{formatSec(duration || 14)}</span>
          </div>
        </div>

        {/* Interactive Vision Reticle Targeting & View Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target Human Face Button */}
          <button
            onClick={() => setTargetPlacementMode(targetPlacementMode === 'face' ? 'auto' : 'face')}
            title="Click to place or move face square directly on any person in video"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
              targetPlacementMode === 'face'
                ? 'bg-cyan-600 text-white border-cyan-700 ring-2 ring-cyan-300'
                : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{targetPlacementMode === 'face' ? 'Click Face...' : 'Target Face Square'}</span>
          </button>

          {/* Target Product Button */}
          <button
            onClick={() => setTargetPlacementMode(targetPlacementMode === 'product' ? 'auto' : 'product')}
            title="Click to place or move product detection box on any item in video"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
              targetPlacementMode === 'product'
                ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{targetPlacementMode === 'product' ? 'Click Item...' : 'Target Product'}</span>
          </button>

          {/* Interactive Pick Product Button */}
          {onToggleProductPicked && (
            <button
              onClick={onToggleProductPicked}
              title="Click to simulate product being picked up by customer"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isProductPicked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProductPicked ? 'Picked: In-Hand' : 'Simulate Pick Product'}</span>
            </button>
          )}

          {/* Switch HUD / Raw Video */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('hud')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                viewMode === 'hud'
                  ? 'bg-white text-cyan-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3 text-cyan-600" />
              <span>Face Squares HUD</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                viewMode === 'raw'
                  ? 'bg-white text-cyan-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3 h-3 text-cyan-600" />
              <span>Raw Video</span>
            </button>
          </div>

          {/* Reset Custom Target */}
          {(pinnedFaceTarget || pinnedProductTarget) && (
            <button
              onClick={() => {
                setPinnedFaceTarget(null);
                setPinnedProductTarget(null);
                setTargetPlacementMode('auto');
              }}
              className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 underline font-mono"
            >
              Reset Targets
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// =========================================================================
// HIGH-TECH RETICLE DRAWING FUNCTIONS
// =========================================================================

/**
 * Draw High-Tech Real Human Face Square with Specific Human ID
 */
function drawProminentFaceSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  specificId: string,
  humanName: string,
  confidence: number,
  color: string,
  frame: number,
  isPicked: boolean = false
) {
  ctx.save();

  // 1. Semi-Transparent Reticle Fill
  ctx.fillStyle = isPicked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(6, 182, 212, 0.08)';
  ctx.fillRect(x, y, w, h);

  // 2. High-Tech Corner Brackets (Thick & Sharp)
  const bracketLen = Math.min(22, w * 0.3);
  ctx.strokeStyle = isPicked ? '#10b981' : color;
  ctx.lineWidth = 3.5;

  // Top-Left ⌜
  ctx.beginPath();
  ctx.moveTo(x, y + bracketLen);
  ctx.lineTo(x, y);
  ctx.lineTo(x + bracketLen, y);
  ctx.stroke();

  // Top-Right ⌝
  ctx.beginPath();
  ctx.moveTo(x + w - bracketLen, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + bracketLen);
  ctx.stroke();

  // Bottom-Left ⌞
  ctx.beginPath();
  ctx.moveTo(x, y + h - bracketLen);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + bracketLen, y + h);
  ctx.stroke();

  // Bottom-Right ⌟
  ctx.beginPath();
  ctx.moveTo(x + w - bracketLen, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - bracketLen);
  ctx.stroke();

  // Thin bounding box connecting corners
  ctx.strokeStyle = isPicked ? 'rgba(16, 185, 129, 0.7)' : 'rgba(6, 182, 212, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y, w, h);

  // 3. Center Precision Crosshair (+)
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.strokeStyle = isPicked ? '#10b981' : color;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(cx - 9, cy);
  ctx.lineTo(cx + 9, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy - 9);
  ctx.lineTo(cx, cy + 9);
  ctx.stroke();

  // 4. Header Badge: [HUMAN FACE ID: #ID]
  const tagText = `[FACE ID: #${specificId}]`;
  const confText = `${confidence.toFixed(1)}%`;
  ctx.font = '700 11.5px "JetBrains Mono", monospace';
  const tagW = ctx.measureText(tagText).width;
  ctx.font = '700 10.5px "JetBrains Mono", monospace';
  const confW = ctx.measureText(confText).width;
  const badgeW = Math.max(tagW + confW + 28, 175);
  const badgeH = 24;

  // Dark badge background with neon border
  ctx.fillStyle = 'rgba(10, 18, 30, 0.95)';
  ctx.fillRect(x - 2, y - badgeH - 5, badgeW, badgeH);

  ctx.strokeStyle = isPicked ? '#10b981' : color;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x - 2, y - badgeH - 5, badgeW, badgeH);

  // Face ID Tag text
  ctx.fillStyle = isPicked ? '#34d399' : color;
  ctx.font = '700 11.5px "JetBrains Mono", monospace';
  ctx.fillText(tagText, x + 6, y - 10);

  // Confidence % text
  ctx.fillStyle = '#34d399';
  ctx.font = '700 10px "JetBrains Mono", monospace';
  ctx.fillText(confText, x + tagW + 16, y - 10);

  // 5. Bottom Name & Status Pill
  const bottomBadgeH = 30;
  ctx.fillStyle = 'rgba(10, 18, 30, 0.92)';
  ctx.fillRect(x, y + h + 4, Math.max(w, 180), bottomBadgeH);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y + h + 4, Math.max(w, 180), bottomBadgeH);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 10px "JetBrains Mono", monospace';
  ctx.fillText(humanName, x + 6, y + h + 17);

  ctx.fillStyle = isPicked ? '#34d399' : '#38bdf8';
  ctx.font = '700 9px "JetBrains Mono", monospace';
  ctx.fillText(
    isPicked ? '● ACTION: HOLDING PICKED PRODUCT' : '● SPECIFIC ID TRACKED · FACE LOCK',
    x + 6,
    y + h + 28
  );

  ctx.restore();
}

/**
 * Draw High-Tech Product ID Bounding Box & Picking State
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
  color: string,
  frame: number,
  isPicked: boolean,
  faceCenterX: number,
  faceCenterY: number
) {
  ctx.save();

  // Dynamic connecting laser line between face square and product box
  if (faceCenterX && faceCenterY) {
    ctx.strokeStyle = isPicked ? 'rgba(16, 185, 129, 0.85)' : 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = isPicked ? 2.5 : 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(faceCenterX, faceCenterY);
    const pcx = x + w / 2;
    const pcy = y + h / 2;
    ctx.lineTo(pcx, pcy);
    ctx.stroke();
    ctx.setLineDash([]);

    if (isPicked) {
      const t = (frame % 30) / 30;
      const dotX = faceCenterX + (pcx - faceCenterX) * t;
      const dotY = faceCenterY + (pcy - faceCenterY) * t;
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Interior scan tint
  ctx.fillStyle = isPicked ? 'rgba(16, 185, 129, 0.16)' : 'rgba(245, 158, 11, 0.08)';
  ctx.fillRect(x, y, w, h);

  // Corner Brackets
  const bLen = Math.min(20, w * 0.28);
  ctx.strokeStyle = isPicked ? '#10b981' : color;
  ctx.lineWidth = isPicked ? 3.5 : 2.5;

  // TL ⌜
  ctx.beginPath();
  ctx.moveTo(x, y + bLen);
  ctx.lineTo(x, y);
  ctx.lineTo(x + bLen, y);
  ctx.stroke();

  // TR ⌝
  ctx.beginPath();
  ctx.moveTo(x + w - bLen, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + bLen);
  ctx.stroke();

  // BL ⌞
  ctx.beginPath();
  ctx.moveTo(x, y + h - bLen);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + bLen, y + h);
  ctx.stroke();

  // BR ⌟
  ctx.beginPath();
  ctx.moveTo(x + w - bLen, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - bLen);
  ctx.stroke();

  // Thin bounding box border
  ctx.strokeStyle = isPicked ? 'rgba(16, 185, 129, 0.7)' : 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  // Header Tag: PRODUCT ID
  const prodIdText = `[PRD: #${productId}]`;
  const priceText = `$${price.toFixed(2)}`;
  ctx.font = '700 11.5px "JetBrains Mono", monospace';
  const pIdW = ctx.measureText(prodIdText).width;

  ctx.font = '700 11px "JetBrains Mono", monospace';
  const prW = ctx.measureText(priceText).width;
  const badgeW = Math.max(pIdW + prW + 26, 165);
  const badgeH = 24;

  ctx.fillStyle = isPicked ? 'rgba(6, 26, 18, 0.95)' : 'rgba(15, 18, 28, 0.94)';
  ctx.fillRect(x - 2, y - badgeH - 5, badgeW, badgeH);

  ctx.strokeStyle = isPicked ? '#10b981' : color;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x - 2, y - badgeH - 5, badgeW, badgeH);

  ctx.fillStyle = isPicked ? '#34d399' : '#fbbf24';
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillText(prodIdText, x + 6, y - 10);

  ctx.fillStyle = '#34d399';
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillText(priceText, x + pIdW + 14, y - 10);

  // Prominent banner if PICKED UP
  if (isPicked) {
    const pickedBannerH = 20;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x - 2, y - badgeH - 5 - pickedBannerH - 2, badgeW, pickedBannerH);
    ctx.fillStyle = '#062414';
    ctx.font = '800 10px "JetBrains Mono", monospace';
    ctx.fillText('● PRODUCT PICKED UP: IN-HAND', x + 6, y - badgeH - 10);
  }

  // Bottom Label: Product Name & RFID Tag
  const bottomW = Math.max(w, 175);
  ctx.fillStyle = 'rgba(10, 18, 30, 0.92)';
  ctx.fillRect(x, y + h + 4, bottomW, 28);
  ctx.strokeStyle = isPicked ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y + h + 4, bottomW, 28);

  ctx.fillStyle = isPicked ? '#6ee7b7' : '#fef08a';
  ctx.font = '700 9.5px "JetBrains Mono", monospace';
  const truncatedName = productName.length > 24 ? productName.slice(0, 22) + '..' : productName;
  ctx.fillText(truncatedName, x + 6, y + h + 16);

  ctx.fillStyle = isPicked ? '#a7f3d0' : 'rgba(148, 163, 184, 0.85)';
  ctx.font = '600 8.5px "JetBrains Mono", monospace';
  ctx.fillText(
    isPicked ? 'STATE: IN-HAND / SENSOR ACTIVE' : 'STATE: ON SHELF · RFID ACTIVE',
    x + 6,
    y + h + 26
  );

  ctx.restore();
}

/**
 * Top Alert Banner when a Product is Picked Up
 */
function drawPickedAlertBanner(
  ctx: CanvasRenderingContext2D,
  width: number,
  humanId: string,
  productId: string,
  productName: string,
  price: number,
  frame: number
) {
  ctx.save();
  const bannerW = Math.min(width - 80, 560);
  const bannerH = 34;
  const bannerX = (width - bannerW) / 2;
  const bannerY = 56;

  ctx.fillStyle = 'rgba(6, 44, 28, 0.95)';
  ctx.fillRect(bannerX, bannerY, bannerW, bannerH);

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

  const blink = Math.floor(frame / 15) % 2 === 0;
  ctx.fillStyle = blink ? '#34d399' : '#10b981';
  ctx.font = '800 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `● ACTION DETECTED: #${humanId} PICKED UP #${productId} (${productName.slice(0, 18)}) · $${price.toFixed(2)}`,
    width / 2,
    bannerY + 21
  );

  ctx.restore();
}

/**
 * Surveillance Console HUD
 */
function drawTechSurveillanceHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  store: string,
  zone: string,
  frame: number,
  isPicked: boolean = false,
  humanCount: number = 1
) {
  ctx.save();

  // 1. Four Corner Alignment Marks (+)
  const tickLen = 14;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;

  // TL
  ctx.beginPath();
  ctx.moveTo(20, 20 + tickLen);
  ctx.lineTo(20, 20);
  ctx.lineTo(20 + tickLen, 20);
  ctx.stroke();

  // TR
  ctx.beginPath();
  ctx.moveTo(width - 20 - tickLen, 20);
  ctx.lineTo(width - 20, 20);
  ctx.lineTo(width - 20, 20 + tickLen);
  ctx.stroke();

  // BL
  ctx.beginPath();
  ctx.moveTo(20, height - 20 - tickLen);
  ctx.lineTo(20, height - 20);
  ctx.lineTo(20 + tickLen, height - 20);
  ctx.stroke();

  // BR
  ctx.beginPath();
  ctx.moveTo(width - 20 - tickLen, height - 20);
  ctx.lineTo(width - 20, height - 20);
  ctx.lineTo(width - 20, height - 20 - tickLen);
  ctx.stroke();

  // 2. Top-Right High-Tech Optical Telemetry
  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillText(`${store.toUpperCase()} // ${zone.toUpperCase()}`, width - 26, 32);

  ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
  ctx.font = '500 9.5px "JetBrains Mono", monospace';
  const fpsJitter = (29.9 + (frame % 3) * 0.1).toFixed(1);
  ctx.fillText(`OPTICAL: 1080p @ ${fpsJitter} FPS · BITRATE: 4.8 Mbps · LATENCY: 12ms`, width - 26, 47);

  // 3. Bottom-Left System Status
  ctx.textAlign = 'left';
  ctx.fillStyle = isPicked ? '#34d399' : '#38bdf8';
  ctx.font = '700 10px "JetBrains Mono", monospace';
  ctx.fillText(
    isPicked
      ? 'GRASP DETECTION: ACTIVE [PRODUCT PICKED UP BY CUSTOMER]'
      : `AI HUMAN VISION: ACTIVE [${humanCount} HUMAN FACE ${humanCount === 1 ? 'SQUARE' : 'SQUARES'} LOCKED]`,
    26,
    height - 34
  );

  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
  ctx.font = '500 9px "JetBrains Mono", monospace';
  ctx.fillText('TARGET CLASSIFICATION: REAL HUMAN SHOPPERS // SPECIFIC ID TAGS ATTACHED', 26, height - 20);

  // 4. Bottom-Right Millisecond Timecode
  const now = new Date();
  const timeStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}.${String(
    now.getMilliseconds()
  ).padStart(3, '0')} UTC`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
  ctx.font = '600 10.5px "JetBrains Mono", monospace';
  ctx.fillText(timeStr, width - 26, height - 20);

  // 5. Red Recording Indicator (Top Left)
  const isRecBlink = Math.floor(frame / 20) % 2 === 0;
  if (isRecBlink) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(32, 38, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f87171';
  ctx.font = '700 10px "JetBrains Mono", monospace';
  ctx.fillText('REC 00:14:28:19', 42, 41);

  ctx.restore();
}

/**
 * High-Tech Standby / Offline Screen
 */
function drawStandbyScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: CameraFeed,
  channel: ShopChannel
) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const cx = width / 2;
  const cy = height / 2;

  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy - 20, 48, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy - 20, 24, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillText('SURVEILLANCE SENSOR STANDBY', cx, cy + 48);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillText('CHANNEL: ' + channel.name.toUpperCase(), cx, cy + 68);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText("Click 'Launch Camera Monitor' button above to stream real shop video", cx, cy + 90);
}

/**
 * Optical Stream Syncing Screen
 */
function drawLoadingStream(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  message: string
) {
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const cx = width / 2;
  const cy = height / 2;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillText(message, cx, cy);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 10.5px "JetBrains Mono", monospace';
  ctx.fillText('DECODING REAL HUMAN CCTV STREAM · 1080p @ 30 FPS', cx, cy + 24);
}
