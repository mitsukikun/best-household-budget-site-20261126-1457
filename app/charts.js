// RumahAnggaran charts — one job: draw the site's charts on <canvas>, no library.
// Every chart reads plain arrays and draws with the 2d context only, so the site stays
// small and works offline. All amounts are rupiah; labels are shortened for the canvas.

function setupCanvas(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 600;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.font = "12px system-ui, sans-serif";
  return { ctx, width, height };
}

export function fmtShort(n) {
  if (n >= 1000000) return "Rp " + (n / 1000000).toFixed(1).replace(/\.0$/, "") + "jt";
  if (n >= 1000) return "Rp " + Math.round(n / 1000) + "rb";
  return "Rp " + n;
}

// Grouped bars: income (green) vs expense (red) per month.
export function drawMonthlyBars(canvas, months) {
  const { ctx, width, height } = setupCanvas(canvas, 260);
  const pad = { top: 26, right: 10, bottom: 30, left: 54 };
  const max = Math.max(...months.map((m) => Math.max(m.income, m.expense))) * 1.08;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const slot = plotW / months.length;
  const barW = Math.min(26, slot / 3);
  ctx.strokeStyle = "#e7e0d4";
  ctx.fillStyle = "#57534e";
  ctx.textAlign = "right";
  ctx.font = "12px system-ui, sans-serif";
  for (let g = 0; g <= 4; g++) {
    const v = (max / 1.08 / 4) * g;
    const y = pad.top + plotH - (v / max) * plotH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    ctx.fillText(fmtShort(v), pad.left - 8, y + 4);
  }
  months.forEach((m, i) => {
    const cx = pad.left + slot * i + slot / 2;
    const ih = (m.income / max) * plotH;
    const eh = (m.expense / max) * plotH;
    ctx.fillStyle = "#15803d";
    ctx.fillRect(cx - barW - 3, pad.top + plotH - ih, barW, ih);
    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(cx + 3, pad.top + plotH - eh, barW, eh);
    ctx.fillStyle = "#1c1917";
    ctx.textAlign = "center";
    ctx.fillText(m.month, cx, height - 10);
  });
  ctx.textAlign = "left";
  ctx.fillStyle = "#15803d"; ctx.fillRect(pad.left, 6, 12, 12);
  ctx.fillStyle = "#1c1917"; ctx.fillText("Income", pad.left + 18, 16);
  ctx.fillStyle = "#b91c1c"; ctx.fillRect(pad.left + 90, 6, 12, 12);
  ctx.fillStyle = "#1c1917"; ctx.fillText("Spending", pad.left + 108, 16);
}

// Donut: share of spending by category.
export function drawCategoryDonut(canvas, slices) {
  const { ctx, width, height } = setupCanvas(canvas, 250);
  const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 - 14, hole = r * 0.58;
  const total = slices.reduce((s, x) => s + x.value, 0);
  let angle = -Math.PI / 2;
  slices.forEach((s) => {
    const sweep = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    angle += sweep;
  });
  ctx.beginPath(); ctx.arc(cx, cy, hole, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.fillStyle = "#1c1917"; ctx.textAlign = "center";
  ctx.font = "700 17px system-ui, sans-serif";
  ctx.fillText(fmtShort(total), cx, cy - 2);
  ctx.font = "12px system-ui, sans-serif"; ctx.fillStyle = "#57534e";
  ctx.fillText("spent in Nov 2026", cx, cy + 16);
}

// Line: savings growth month by month until the goal is reached.
export function drawSavingsLine(canvas, points, target) {
  const { ctx, width, height } = setupCanvas(canvas, 230);
  const pad = { top: 22, right: 14, bottom: 28, left: 56 };
  const max = Math.max(target, ...points.map((p) => p.value)) * 1.05;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  ctx.strokeStyle = "#e7e0d4"; ctx.fillStyle = "#57534e"; ctx.textAlign = "right";
  for (let g = 0; g <= 4; g++) {
    const v = (max / 1.05 / 4) * g;
    const y = pad.top + plotH - (v / max) * plotH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    ctx.fillText(fmtShort(v), pad.left - 8, y + 4);
  }
  const ty = pad.top + plotH - (target / max) * plotH;
  ctx.setLineDash([5, 4]); ctx.strokeStyle = "#d97706";
  ctx.beginPath(); ctx.moveTo(pad.left, ty); ctx.lineTo(width - pad.right, ty); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#92400e"; ctx.textAlign = "left";
  ctx.fillText("Goal " + fmtShort(target), pad.left + 6, ty - 6);
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = pad.left + (plotW * i) / (points.length - 1);
    const y = pad.top + plotH - (p.value / max) * plotH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 3; ctx.stroke();
  ctx.lineWidth = 1;
  points.forEach((p, i) => {
    const x = pad.left + (plotW * i) / (points.length - 1);
    const y = pad.top + plotH - (p.value / max) * plotH;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = "#0f766e"; ctx.fill();
    ctx.fillStyle = "#1c1917"; ctx.textAlign = "center";
    ctx.fillText(p.label, x, height - 8);
  });
}
