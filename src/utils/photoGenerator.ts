/**
 * Generates an authentic, high-resolution retail surveillance snapshot canvas with
 * explicit square on the customer's face (showing Customer ID) and product box (showing Product ID).
 */
export function generateSurveillanceSnapshot({
  customerId,
  customerName,
  customerConfidence,
  productId,
  productName,
  productPrice,
  productCategory,
  cameraName,
  zone,
  timestamp,
  scenario,
}: {
  customerId: string;
  customerName?: string;
  customerConfidence: number;
  productId: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  cameraName: string;
  zone: string;
  timestamp: string;
  scenario: 'electronics' | 'supermarket' | 'boutique' | 'checkout';
}): string {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;

  // 1. Dark retail surveillance atmosphere
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0a0f1d');
  bgGrad.addColorStop(1, '#050811');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Perspective floor tiles
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.lineWidth = 1;
  const vpY = 80;
  for (let x = -w * 0.4; x <= w * 1.4; x += 65) {
    ctx.beginPath();
    ctx.moveTo(w / 2, vpY);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 130; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 2. Specific Real Shop Background Scenery
  if (scenario === 'supermarket') {
    // Supermarket grocery shelves Left
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 110, 180, 310);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(40, 110, 180, 310);

    // Multi-tier grocery shelves with colorful cereal / box products
    const shelfColors = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#eab308'];
    for (let sy = 145; sy < 400; sy += 45) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.beginPath();
      ctx.moveTo(45, sy);
      ctx.lineTo(215, sy);
      ctx.stroke();

      for (let bx = 55; bx < 205; bx += 26) {
        ctx.fillStyle = shelfColors[(bx + sy) % shelfColors.length] + '33';
        ctx.fillRect(bx, sy - 28, 20, 26);
        ctx.strokeStyle = shelfColors[(bx + sy) % shelfColors.length] + '88';
        ctx.strokeRect(bx, sy - 28, 20, 26);
      }
    }

    // Supermarket shelves Right
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w - 220, 110, 180, 310);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(w - 220, 110, 180, 310);

    for (let sy = 145; sy < 400; sy += 45) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.beginPath();
      ctx.moveTo(w - 215, sy);
      ctx.lineTo(w - 45, sy);
      ctx.stroke();

      for (let bx = w - 205; bx < w - 55; bx += 26) {
        ctx.fillStyle = '#0284c733';
        ctx.fillRect(bx, sy - 28, 20, 26);
        ctx.strokeStyle = '#0284c788';
        ctx.strokeRect(bx, sy - 28, 20, 26);
      }
    }

    // Shopping Cart in midground
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 170, h - 170, 75, 60);
    ctx.fillStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.fillRect(w / 2 - 170, h - 170, 75, 60);

    // Cart wheels
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(w / 2 - 160, h - 105, 7, 0, Math.PI * 2);
    ctx.arc(w / 2 - 105, h - 105, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (scenario === 'electronics') {
    // Modern Apple / Tech style retail store with long wooden display tables
    const tableGrad = ctx.createLinearGradient(0, h - 190, 0, h - 70);
    tableGrad.addColorStop(0, '#33271e');
    tableGrad.addColorStop(1, '#1e1610');
    ctx.fillStyle = tableGrad;
    ctx.strokeStyle = '#785338';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 200, h - 180, 400, 110, 8);
    ctx.fill();
    ctx.stroke();

    // Smartphone demo stands on table
    for (let dx = w / 2 - 160; dx <= w / 2 + 160; dx += 80) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(dx, h - 165, 32, 50);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(dx, h - 165, 32, 50);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.fillRect(dx + 2, h - 162, 28, 42);
    }
  } else if (scenario === 'boutique') {
    // Luxury Fragrance & Cosmetics display island
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(50, 120, 160, 280);
    ctx.strokeStyle = '#44403c';
    ctx.strokeRect(50, 120, 160, 280);

    // Center perfume podium with golden halo
    ctx.fillStyle = '#171412';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 160, h - 170, 320, 95, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
    ctx.fillRect(w / 2 - 156, h - 168, 312, 4);
  } else {
    // Checkout Counter & POS register with barcode scanner
    ctx.fillStyle = '#111827';
    ctx.fillRect(w / 2 - 180, h - 190, 360, 115);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w / 2 - 180, h - 190, 360, 115);

    // POS Screen
    ctx.fillStyle = '#020617';
    ctx.fillRect(w / 2 + 60, h - 230, 70, 48);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(w / 2 + 60, h - 230, 70, 48);

    ctx.fillStyle = '#34d399';
    ctx.font = '600 8px monospace';
    ctx.fillText('POS ACTIVE', w / 2 + 68, h - 200);

    // Barcode conveyor belt
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(w / 2 - 170, h - 150, 210, 60);
    ctx.strokeStyle = '#4b5563';
    ctx.strokeRect(w / 2 - 170, h - 150, 210, 60);
  }

  // 3. Realistic Customer Figure in frame
  const custX = w / 2 - 35;
  const custY = 140;

  // Floor shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.beginPath();
  ctx.ellipse(custX + 45, custY + 265, 65, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Torso / Jacket
  const jacketGrad = ctx.createLinearGradient(custX, custY + 90, custX + 90, custY + 230);
  jacketGrad.addColorStop(0, '#1e293b');
  jacketGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = jacketGrad;
  ctx.beginPath();
  ctx.roundRect(custX + 5, custY + 90, 80, 140, [14, 14, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Neck
  ctx.fillStyle = '#e8bc9e';
  ctx.fillRect(custX + 34, custY + 70, 22, 24);

  // Head / Face
  const faceX = custX + 16;
  const faceY = custY + 10;
  const faceW = 58;
  const faceH = 68;

  // Skin tone
  ctx.fillStyle = '#f0c6aa';
  ctx.beginPath();
  ctx.ellipse(faceX + faceW / 2, faceY + faceH / 2, faceW / 2 - 3, faceH / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1f1a16';
  ctx.beginPath();
  ctx.arc(faceX + faceW / 2, faceY + 20, 28, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();

  // Eyes and Eyebrows
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(faceX + 19, faceY + 30, 2.8, 0, Math.PI * 2);
  ctx.arc(faceX + 39, faceY + 30, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Nose & Mouth
  ctx.strokeStyle = '#c59577';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(faceX + 29, faceY + 30);
  ctx.lineTo(faceX + 28, faceY + 39);
  ctx.lineTo(faceX + 31, faceY + 40);
  ctx.stroke();

  ctx.strokeStyle = '#a45d4d';
  ctx.beginPath();
  ctx.moveTo(faceX + 23, faceY + 49);
  ctx.quadraticCurveTo(faceX + 29, faceY + 51, faceX + 35, faceY + 49);
  ctx.stroke();

  // Arm holding product forward
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(custX + 72, custY + 115, 50, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#e8bc9e';
  ctx.beginPath();
  ctx.arc(custX + 124, custY + 126, 13, 0, Math.PI * 2);
  ctx.fill();

  // 4. Product depiction (Phone, Perfume bottle, Watch, or Grocery Item)
  const prodX = custX + 120;
  const prodY = custY + 105;
  const prodW = 58;
  const prodH = 74;

  if (scenario === 'electronics') {
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(prodX, prodY, 38, 68, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fillRect(prodX + 3, prodY + 5, 32, 54);
  } else if (scenario === 'boutique') {
    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.fillRect(prodX, prodY + 16, 42, 52);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(prodX, prodY + 16, 42, 52);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(prodX + 11, prodY + 2, 20, 16);
    ctx.strokeStyle = '#ca8a04';
    ctx.strokeRect(prodX + 11, prodY + 2, 20, 16);
  } else if (scenario === 'supermarket') {
    // Grocery Cereal or Juice box
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(prodX, prodY, 44, 62, 4);
    ctx.fill();
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 8px sans-serif';
    ctx.fillText('ORGANIC', prodX + 4, prodY + 22);
  } else {
    // Watch / Jewelry Box at Checkout
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(prodX, prodY, 48, 56, 4);
    ctx.fill();
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#c7d2fe';
    ctx.font = '600 8.5px monospace';
    ctx.fillText('RFID', prodX + 8, prodY + 30);
  }

  // ----------------------------------------------------
  // 5. EXPLICIT SQUARE ON CUSTOMER'S FACE (CUSTOMER ID)
  // ----------------------------------------------------
  const sqFacePad = 8;
  const sqFaceX = faceX - sqFacePad;
  const sqFaceY = faceY - sqFacePad;
  const sqFaceW = faceW + sqFacePad * 2;
  const sqFaceH = faceH + sqFacePad * 2;

  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(sqFaceX, sqFaceY, sqFaceW, sqFaceH);

  const bkLen = 12;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;

  // TL
  ctx.beginPath();
  ctx.moveTo(sqFaceX, sqFaceY + bkLen);
  ctx.lineTo(sqFaceX, sqFaceY);
  ctx.lineTo(sqFaceX + bkLen, sqFaceY);
  ctx.stroke();

  // TR
  ctx.beginPath();
  ctx.moveTo(sqFaceX + sqFaceW - bkLen, sqFaceY);
  ctx.lineTo(sqFaceX + sqFaceW, sqFaceY);
  ctx.lineTo(sqFaceX + sqFaceW, sqFaceY + bkLen);
  ctx.stroke();

  // BL
  ctx.beginPath();
  ctx.moveTo(sqFaceX, sqFaceY + sqFaceH - bkLen);
  ctx.lineTo(sqFaceX, sqFaceY + sqFaceH);
  ctx.lineTo(sqFaceX + bkLen, sqFaceY + sqFaceH);
  ctx.stroke();

  // BR
  ctx.beginPath();
  ctx.moveTo(sqFaceX + sqFaceW - bkLen, sqFaceY + sqFaceH);
  ctx.lineTo(sqFaceX + sqFaceW, sqFaceY + sqFaceH);
  ctx.lineTo(sqFaceX + sqFaceW, sqFaceY + sqFaceH - bkLen);
  ctx.stroke();

  // Subtle interior cyan tint
  ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
  ctx.fillRect(sqFaceX, sqFaceY, sqFaceW, sqFaceH);

  // Crosshair center
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.arc(sqFaceX + sqFaceW / 2, sqFaceY + sqFaceH / 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Header tag: CUSTOMER ID
  const custTagText = `CUSTOMER ID: #${customerId}`;
  ctx.font = '700 11.5px "JetBrains Mono", monospace';
  const tagMetrics = ctx.measureText(custTagText);
  const tagW = Math.max(tagMetrics.width + 16, 150);
  const tagH = 22;

  ctx.fillStyle = 'rgba(6, 182, 212, 0.95)';
  ctx.beginPath();
  ctx.roundRect(sqFaceX - 2, sqFaceY - tagH - 4, tagW, tagH, [4, 4, 0, 0]);
  ctx.fill();

  ctx.fillStyle = '#06131e';
  ctx.fillText(custTagText, sqFaceX + 6, sqFaceY - 9);

  // Subtext tag: Biometric Match
  ctx.fillStyle = '#22d3ee';
  ctx.font = '600 9.5px "JetBrains Mono", monospace';
  ctx.fillText(`BIOMETRIC: ${customerConfidence.toFixed(1)}% MATCH · RETINA LOCK`, sqFaceX, sqFaceY + sqFaceH + 15);

  // ----------------------------------------------------
  // 6. EXPLICIT SQUARE ON PRODUCT (PRODUCT ID)
  // ----------------------------------------------------
  const sqProdPad = 8;
  const sqProdX = prodX - sqProdPad;
  const sqProdY = prodY - sqProdPad;
  const sqProdW = prodW + sqProdPad * 2;
  const sqProdH = prodH + sqProdPad * 2;

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(sqProdX, sqProdY, sqProdW, sqProdH);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;

  // TL
  ctx.beginPath();
  ctx.moveTo(sqProdX, sqProdY + bkLen);
  ctx.lineTo(sqProdX, sqProdY);
  ctx.lineTo(sqProdX + bkLen, sqProdY);
  ctx.stroke();

  // TR
  ctx.beginPath();
  ctx.moveTo(sqProdX + sqProdW - bkLen, sqProdY);
  ctx.lineTo(sqProdX + sqProdW, sqProdY);
  ctx.lineTo(sqProdX + sqProdW, sqProdY + bkLen);
  ctx.stroke();

  // BL
  ctx.beginPath();
  ctx.moveTo(sqProdX, sqProdY + sqProdH - bkLen);
  ctx.lineTo(sqProdX, sqProdY + sqProdH);
  ctx.lineTo(sqProdX + bkLen, sqProdY + sqProdH);
  ctx.stroke();

  // BR
  ctx.beginPath();
  ctx.moveTo(sqProdX + sqProdW - bkLen, sqProdY + sqProdH);
  ctx.lineTo(sqProdX + sqProdW, sqProdY + sqProdH);
  ctx.lineTo(sqProdX + sqProdW, sqProdY + sqProdH - bkLen);
  ctx.stroke();

  // Interior tint
  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.fillRect(sqProdX, sqProdY, sqProdW, sqProdH);

  // Top header banner: PRODUCT ID
  const prodTagText = `PRODUCT ID: #${productId}`;
  ctx.font = '700 11.5px "JetBrains Mono", monospace';
  const prodTagMetrics = ctx.measureText(prodTagText);
  const pTagW = Math.max(prodTagMetrics.width + 16, 145);

  ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
  ctx.beginPath();
  ctx.roundRect(sqProdX - 2, sqProdY - tagH - 4, pTagW, tagH, [4, 4, 0, 0]);
  ctx.fill();

  ctx.fillStyle = '#1c1002';
  ctx.fillText(prodTagText, sqProdX + 6, sqProdY - 9);

  // Subtext tag: Product Name and Price
  ctx.fillStyle = '#fbbf24';
  ctx.font = '600 9.5px "JetBrains Mono", monospace';
  ctx.fillText(`${productName} · $${productPrice}`, sqProdX - 6, sqProdY + sqProdH + 15);

  // ----------------------------------------------------
  // 7. SURVEILLANCE CCTV HUD OVERLAYS
  // ----------------------------------------------------
  // REC Blinker
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(28, 28, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillText('REC', 40, 32);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.fillText(`${cameraName.toUpperCase()} · ${zone.toUpperCase()}`, 80, 32);

  // Timestamp in top right
  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`${timestamp}  ·  AI OPTICAL FRAME`, w - 28, 32);

  // Bottom footer: Loss prevention status
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '500 10.5px "JetBrains Mono", monospace';
  ctx.fillText(`DUAL-TAG SYNC: FACE-ID #${customerId} ↔ ITEM #${productId} [EAS SECURE]`, 28, h - 20);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#34d399';
  ctx.fillText(`REAL SHOP SURVEILLANCE FEED`, w - 28, h - 20);

  return canvas.toDataURL('image/jpeg', 0.94);
}
