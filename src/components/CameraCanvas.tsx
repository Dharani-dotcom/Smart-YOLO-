import { useEffect, useRef, useState } from 'react';
import { CameraFeed } from '../types';

interface CameraCanvasProps {
  camera: CameraFeed;
  isActive: boolean;
  showBoundingBoxes: boolean;
  showScanGrid: boolean;
  showHeatmap: boolean;
  flaggedAlertTrigger: number;
}

interface SimulatedPerson {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  confidence: number;
  type: 'regular' | 'vip' | 'anomaly';
  dwellSeconds: number;
}

export function CameraCanvas({
  camera,
  isActive,
  showBoundingBoxes,
  showScanGrid,
  showHeatmap,
  flaggedAlertTrigger,
}: CameraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [scanTimestamp, setScanTimestamp] = useState('');

  // Initial simulated shoppers in store scene
  const peopleRef = useRef<SimulatedPerson[]>([
    {
      id: 'CUST-1042',
      label: 'CUST-1042',
      x: 180,
      y: 220,
      vx: 0.65,
      vy: 0.25,
      width: 44,
      height: 82,
      confidence: 96.8,
      type: 'regular',
      dwellSeconds: 24,
    },
    {
      id: 'CUST-0891',
      label: 'CUST-0891',
      x: 390,
      y: 160,
      vx: -0.45,
      vy: 0.35,
      width: 46,
      height: 86,
      confidence: 98.2,
      type: 'regular',
      dwellSeconds: 52,
    },
    {
      id: 'VIP-9041',
      label: 'VIP-9041',
      x: 520,
      y: 280,
      vx: 0.3,
      vy: -0.4,
      width: 42,
      height: 80,
      confidence: 99.4,
      type: 'vip',
      dwellSeconds: 110,
    },
    {
      id: 'ANON-7712',
      label: 'ANON-7712',
      x: 290,
      y: 310,
      vx: 0.1,
      vy: 0.1,
      width: 48,
      height: 88,
      confidence: 89.4,
      type: 'anomaly',
      dwellSeconds: 195,
    },
  ]);

  // When flagged alert triggered from outside, mark one subject as highlighted anomaly
  useEffect(() => {
    if (flaggedAlertTrigger > 0) {
      const p = peopleRef.current;
      if (p.length > 0) {
        p[p.length - 1].type = 'anomaly';
        p[p.length - 1].confidence = 94.2;
        p[p.length - 1].dwellSeconds = 240;
      }
    }
  }, [flaggedAlertTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scanBeamY = 0;
    let radarAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, width, height);

      if (!isActive) {
        // Standby Screen
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(0, 0, width, height);

        // Standby Grid Pattern
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
        ctx.lineWidth = 1;
        const step = 40;
        for (let x = 0; x < width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Center Standby Text
        ctx.textAlign = 'center';
        ctx.fillStyle = '#64748b';
        ctx.font = '600 14px "JetBrains Mono", monospace';
        ctx.fillText('CAMERA FEED OFFLINE / STANDBY', width / 2, height / 2 - 14);

        ctx.font = '400 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText("Click 'Launch Camera Monitor' above to initialize feed", width / 2, height / 2 + 16);

        // Corner optical marks
        drawCornerMarks(ctx, width, height, 'rgba(100, 116, 139, 0.4)');
        return;
      }

      // --- 1. RETAIL STORE PERSPECTIVE DRAWING ---
      // Floor
      const floorGrad = ctx.createLinearGradient(0, 80, 0, height);
      floorGrad.addColorStop(0, '#0f172a');
      floorGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, 100, width, height - 100);

      // Floor tiles perspective lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1;
      const perspectiveOrigin = { x: width / 2, y: 70 };
      for (let x = -width * 0.5; x <= width * 1.5; x += 60) {
        ctx.beginPath();
        ctx.moveTo(perspectiveOrigin.x, perspectiveOrigin.y);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 120; y < height; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Store Fixtures & Shelves (Background)
      drawStoreFixtures(ctx, width, height);

      // --- 2. HEATMAP OVERLAY (IF ENABLED) ---
      if (showHeatmap) {
        drawStoreHeatmap(ctx, width, height);
      }

      // --- 3. DYNAMIC SIMULATED PEOPLE ---
      const people = peopleRef.current;
      people.forEach((p) => {
        // Move with boundaries
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 80 || p.x > width - 120) p.vx *= -1;
        if (p.y < 130 || p.y > height - 130) p.vy *= -1;

        // Draw Stylized Subject Silhouette / Figure
        drawStylizedPerson(ctx, p);

        // Draw AI Bounding Box & Target HUD
        if (showBoundingBoxes) {
          drawAIBoundingBox(ctx, p);
        }
      });

      // --- 4. SCAN GRID / RADAR OVERLAY ---
      if (showScanGrid) {
        // Moving laser scanline
        scanBeamY = (scanBeamY + 2.5) % height;
        const scanGrad = ctx.createLinearGradient(0, scanBeamY - 20, 0, scanBeamY);
        scanGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        scanGrad.addColorStop(1, 'rgba(6, 182, 212, 0.35)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanBeamY - 20, width, 20);

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, scanBeamY);
        ctx.lineTo(width, scanBeamY);
        ctx.stroke();

        // Corner scan radar in top right
        radarAngle = (radarAngle + 0.04) % (Math.PI * 2);
        drawMiniRadar(ctx, width - 70, 70, 40, radarAngle);
      }

      // --- 5. CCTV HUD OVERLAYS ---
      drawCCTVHUD(ctx, width, height, camera);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, showBoundingBoxes, showScanGrid, showHeatmap, camera]);

  // Keep local clock for HUD display
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      const now = new Date();
      setScanTimestamp(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="relative w-full aspect-[16/9] max-h-[540px] bg-[#070b12] rounded-lg overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-full object-contain"
      />

      {/* Real-time CRT scanline texture overlay */}
      {isActive && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-70" />
      )}
    </div>
  );
}

// Store shelves, checkout gates, entrance architectural drawing
function drawStoreFixtures(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Aisle Shelves Left
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(30, 110, 140, 260);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(30, 110, 140, 260);

  // Shelf horizontal product dividers
  for (let y = 140; y < 360; y += 32) {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(165, y);
    ctx.stroke();

    // Mock product boxes
    for (let bx = 45; bx < 155; bx += 22) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fillRect(bx, y - 18, 16, 16);
    }
  }

  // Aisle Shelves Right
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(width - 170, 110, 140, 260);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(width - 170, 110, 140, 260);

  for (let y = 140; y < 360; y += 32) {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.beginPath();
    ctx.moveTo(width - 165, y);
    ctx.lineTo(width - 35, y);
    ctx.stroke();

    for (let bx = width - 155; bx < width - 45; bx += 22) {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.fillRect(bx, y - 18, 16, 16);
    }
  }

  // Central Promotional Display Island
  ctx.fillStyle = '#131d2e';
  ctx.strokeStyle = '#1e3a5f';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(width / 2 - 90, height - 120, 180, 55, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '500 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FEATURED DISPLAY POD 01', width / 2, height - 85);
}

// Stylized silhouette of shopper
function drawStylizedPerson(ctx: CanvasRenderingContext2D, person: SimulatedPerson) {
  const { x, y, width, height, type } = person;

  // Shadow on floor
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height, width * 0.45, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  let bodyColor = '#38bdf8';
  if (type === 'vip') bodyColor = '#60a5fa';
  if (type === 'anomaly') bodyColor = '#fb7185';

  // Head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(x + width / 2, y + 14, 11, 0, Math.PI * 2);
  ctx.fill();

  // Torso
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 27, width - 12, height - 42, 6);
  ctx.fill();

  // Legs
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x + 10, y + height - 15, 8, 15);
  ctx.fillRect(x + width - 18, y + height - 15, 8, 15);
}

// AI Bounding Box with tracking metadata
function drawAIBoundingBox(ctx: CanvasRenderingContext2D, person: SimulatedPerson) {
  const { x, y, width, height, label, confidence, type, dwellSeconds } = person;

  let strokeColor = '#22d3ee';
  let badgeBg = 'rgba(6, 182, 212, 0.85)';
  let textColor = '#080c14';
  let statusText = 'NOMINAL';

  if (type === 'vip') {
    strokeColor = '#3b82f6';
    badgeBg = 'rgba(59, 130, 246, 0.9)';
    statusText = 'VIP CLUB';
  } else if (type === 'anomaly') {
    strokeColor = '#f43f5e';
    badgeBg = 'rgba(244, 63, 94, 0.9)';
    statusText = `LOITERING ${dwellSeconds}s`;
  }

  // Corner brackets style bounding box
  const bracketLength = 12;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.8;

  const bx = x - 4;
  const by = y - 4;
  const bw = width + 8;
  const bh = height + 8;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(bx, by + bracketLength);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx + bracketLength, by);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(bx + bw - bracketLength, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw, by + bracketLength);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(bx, by + bh - bracketLength);
  ctx.lineTo(bx, by + bh);
  ctx.lineTo(bx + bracketLength, by + bh);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(bx + bw - bracketLength, by + bh);
  ctx.lineTo(bx + bw, by + bh);
  ctx.lineTo(bx + bw, by + bh - bracketLength);
  ctx.stroke();

  // Subtle interior bounding tint
  ctx.fillStyle = type === 'anomaly' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(34, 211, 238, 0.04)';
  ctx.fillRect(bx, by, bw, bh);

  // Crosshair center dot
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.arc(bx + bw / 2, by + bh / 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Header tag box
  ctx.fillStyle = badgeBg;
  const tagHeight = 16;
  const tagWidth = 110;
  ctx.fillRect(bx, by - tagHeight - 2, tagWidth, tagHeight);

  // Label text
  ctx.fillStyle = textColor;
  ctx.font = '600 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${label} ${confidence.toFixed(1)}%`, bx + 4, by - 5);

  // Subtext tag
  ctx.fillStyle = strokeColor;
  ctx.font = '500 8.5px "JetBrains Mono", monospace';
  ctx.fillText(statusText, bx, by + bh + 12);
}

// Heatmap density visualization
function drawStoreHeatmap(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const hotZones = [
    { x: 300, y: 310, r: 85, intensity: 0.35 },
    { x: 180, y: 240, r: 70, intensity: 0.25 },
    { x: width / 2, y: height - 100, r: 90, intensity: 0.3 },
  ];

  hotZones.forEach((zone) => {
    const radial = ctx.createRadialGradient(zone.x, zone.y, 5, zone.x, zone.y, zone.r);
    radial.addColorStop(0, `rgba(239, 68, 68, ${zone.intensity})`);
    radial.addColorStop(0.5, `rgba(234, 179, 8, ${zone.intensity * 0.7})`);
    radial.addColorStop(1, 'rgba(16, 185, 129, 0)');

    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(zone.x, zone.y, zone.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Mini circular radar in corner
function drawMiniRadar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  angle: number
) {
  ctx.save();
  ctx.fillStyle = 'rgba(8, 12, 20, 0.8)';
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Radar rings
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // Sweep cone
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, angle, angle + 0.45);
  ctx.closePath();
  ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
  ctx.fill();

  // Radar blips
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(cx + 12, cy - 14, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Standard professional CCTV HUD overlays
function drawCCTVHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: CameraFeed
) {
  // Top left: Camera ID & Live status
  ctx.fillStyle = '#f87171';
  ctx.beginPath();
  ctx.arc(26, 26, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('REC', 38, 30);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.fillText(`${camera.name.toUpperCase()} · ${camera.resolution}`, 75, 30);

  // Top right: FPS, Bitrate & Optical parameters
  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`FOV: ${camera.fov}  |  ${camera.fps}.0 FPS`, width - 120, 30);

  // Bottom left: Neural detection engine status
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '400 10.5px "JetBrains Mono", monospace';
  ctx.fillText('AI DETECT: FACIAL VECTORS · DWELL ESTIMATOR ACTIVE', 24, height - 20);

  // Bottom right: Optical Frame ID
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.fillText('SYNC: ISO-CH04', width - 24, height - 20);

  // Corner optical target brackets
  drawCornerMarks(ctx, width, height, 'rgba(56, 189, 248, 0.4)');
}

function drawCornerMarks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  const size = 16;
  const pad = 12;

  // TL
  ctx.beginPath();
  ctx.moveTo(pad, pad + size);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + size, pad);
  ctx.stroke();

  // TR
  ctx.beginPath();
  ctx.moveTo(width - pad - size, pad);
  ctx.lineTo(width - pad, pad);
  ctx.lineTo(width - pad, pad + size);
  ctx.stroke();

  // BL
  ctx.beginPath();
  ctx.moveTo(pad, height - pad - size);
  ctx.lineTo(pad, height - pad);
  ctx.lineTo(pad + size, height - pad);
  ctx.stroke();

  // BR
  ctx.beginPath();
  ctx.moveTo(width - pad - size, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.lineTo(width - pad, height - pad - size);
  ctx.stroke();
}
