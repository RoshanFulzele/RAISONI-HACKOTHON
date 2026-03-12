/* ============================================================
   CHARTS JS - Multilingual Citizen Complaint & Governance CRM
   Vanilla JS Canvas Charts (no external library needed)
   ============================================================ */

'use strict';

const Charts = {

  // ===================== Helper Functions =====================
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1],16)},${parseInt(result[2],16)},${parseInt(result[3],16)}` : '0,212,255';
  },

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    words.forEach(word => {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines;
  },

  // ===================== Donut / Pie Chart =====================
  drawDonut(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.38;
    const innerRadius = options.donut !== false ? radius * 0.6 : 0;

    const total = data.values.reduce((a, b) => a + b, 0);
    const colors = options.colors || ['#00d4ff','#8b5cf6','#00ffc8','#fb923c','#f472b6','#22c55e','#ef4444'];
    let startAngle = -Math.PI / 2;
    const segments = [];

    // Draw segments
    data.values.forEach((val, i) => {
      const sliceAngle = (val / total) * 2 * Math.PI;
      const color = colors[i % colors.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      if (innerRadius > 0) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#0d1421';
        ctx.fill();
      }

      segments.push({ start: startAngle, end: startAngle + sliceAngle, color, label: data.labels[i], value: val });
      startAngle += sliceAngle;
    });

    // Center text
    if (options.centerText) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f8fafc';
      ctx.font = `bold ${Math.floor(radius * 0.35)}px Inter`;
      ctx.fillText(options.centerText, cx, cy - 10);
      if (options.centerSubtext) {
        ctx.fillStyle = '#64748b';
        ctx.font = `${Math.floor(radius * 0.18)}px Inter`;
        ctx.fillText(options.centerSubtext, cx, cy + 18);
      }
    }

    // Legend
    if (options.legend !== false) {
      const legendX = w * 0.62;
      let legendY = cy - (data.labels.length * 18) / 2;
      data.labels.forEach((label, i) => {
        const color = colors[i % colors.length];
        const pct = ((data.values[i] / total) * 100).toFixed(1);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(legendX, legendY, 10, 10, 3);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${label} (${pct}%)`, legendX + 16, legendY + 5);
        legendY += 20;
      });
    }
  },

  // ===================== Bar Chart =====================
  drawBar(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 50, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxVal = Math.max(...data.datasets.flatMap(d => d.values)) * 1.1;
    const colors = ['#00d4ff','#8b5cf6','#00ffc8','#fb923c'];
    const barGroupWidth = chartW / data.labels.length;
    const barCount = data.datasets.length;
    const barWidth = (barGroupWidth * 0.7) / barCount;
    const barGap = barGroupWidth * 0.3 / (barCount + 1);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + chartH - (chartH * i / 5);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal * i / 5), padding.left - 6, y + 3);
    }

    // Bars
    data.labels.forEach((label, li) => {
      data.datasets.forEach((dataset, di) => {
        const val = dataset.values[li];
        const barH = (val / maxVal) * chartH;
        const x = padding.left + li * barGroupWidth + barGap + di * (barWidth + barGap / barCount);
        const y = padding.top + chartH - barH;
        const color = dataset.color || colors[di % colors.length];

        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, color);
        grad.addColorStop(1, `rgba(${this.hexToRgb(color)},0.3)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Value label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barWidth / 2, y - 4);
      });

      // X labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      const labelX = padding.left + li * barGroupWidth + barGroupWidth / 2;
      ctx.fillText(label, labelX, padding.top + chartH + 18);
    });

    // Legend
    if (data.datasets.length > 1) {
      data.datasets.forEach((ds, i) => {
        const color = ds.color || colors[i % colors.length];
        const lx = padding.left + i * 120;
        const ly = h - 10;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(lx, ly, 10, 8, 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(ds.label || `Series ${i+1}`, lx + 14, ly + 7);
      });
    }
  },

  // ===================== Line Chart =====================
  drawLine(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 50, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const allValues = data.datasets.flatMap(d => d.values);
    const maxVal = Math.max(...allValues) * 1.1;
    const colors = ['#00d4ff','#8b5cf6','#00ffc8','#fb923c'];

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + chartH - (chartH * i / 5);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal * i / 5), padding.left - 6, y + 3);
    }

    // Lines
    data.datasets.forEach((dataset, di) => {
      const color = dataset.color || colors[di % colors.length];
      const points = dataset.values.map((val, i) => ({
        x: padding.left + (i / (data.labels.length - 1)) * chartW,
        y: padding.top + chartH - (val / maxVal) * chartH
      }));

      // Fill area
      if (options.fill !== false) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartH);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length-1].x, padding.top + chartH);
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        fillGrad.addColorStop(0, `rgba(${this.hexToRgb(color)},0.2)`);
        fillGrad.addColorStop(1, `rgba(${this.hexToRgb(color)},0)`);
        ctx.fillStyle = fillGrad;
        ctx.fill();
      }

      // Smooth line using bezier
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const cpx = (points[i-1].x + points[i].x) / 2;
        ctx.bezierCurveTo(cpx, points[i-1].y, cpx, points[i].y, points[i].x, points[i].y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dots
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#0d1421';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // X Labels
    data.labels.forEach((label, i) => {
      const x = padding.left + (i / (data.labels.length - 1)) * chartW;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, padding.top + chartH + 18);
    });

    // Legend
    if (data.datasets.length > 1) {
      data.datasets.forEach((ds, i) => {
        const color = ds.color || colors[i % colors.length];
        const lx = padding.left + i * 130;
        const ly = h - 12;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + 20, ly);
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(ds.label || `Series ${i+1}`, lx + 24, ly + 4);
      });
    }
  },

  // ===================== Radial Progress Chart =====================
  drawRadial(canvasId, value, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.4;
    const lineWidth = options.lineWidth || 10;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI * 0.75, Math.PI * 0.75);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc
    const pct = Math.min(value / (options.max || 100), 1);
    const endAngle = -Math.PI * 0.75 + pct * Math.PI * 1.5;
    const color = options.color || '#00d4ff';

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, color);
    grad.addColorStop(1, options.color2 || '#8b5cf6');
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI * 0.75, endAngle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f8fafc';
    ctx.font = `bold ${Math.floor(radius * 0.45)}px Inter`;
    ctx.fillText(options.label || `${value}%`, cx, cy - 5);
    if (options.sublabel) {
      ctx.fillStyle = '#64748b';
      ctx.font = `${Math.floor(radius * 0.2)}px Inter`;
      ctx.fillText(options.sublabel, cx, cy + 20);
    }
  },

  // ===================== Heatmap =====================
  drawHeatmap(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const rows = data.length;
    const cols = data[0]?.length || 1;
    const cellW = w / cols;
    const cellH = h / rows;
    const maxVal = Math.max(...data.flat());

    data.forEach((row, ri) => {
      row.forEach((val, ci) => {
        const intensity = val / maxVal;
        const r = Math.floor(0 + intensity * 0);
        const g = Math.floor(100 + intensity * 155);
        const b = Math.floor(200 + intensity * 55);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.2 + intensity * 0.7})`;
        ctx.fillRect(ci * cellW, ri * cellH, cellW - 2, cellH - 2);

        if (options.showValues && val > 0) {
          ctx.fillStyle = intensity > 0.5 ? '#000' : '#fff';
          ctx.font = '10px Inter';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val, ci * cellW + cellW / 2, ri * cellH + cellH / 2);
        }
      });
    });

    // Labels
    if (options.xLabels) {
      options.xLabels.forEach((label, i) => {
        ctx.fillStyle = '#64748b';
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(label, i * cellW + cellW / 2, h - 4);
      });
    }
  },

  // ===================== Initialize All Charts =====================
  initAll() {
    // Admin Dashboard charts
    this.initAdminCharts();
    this.initCitizenCharts();
  },

  initAdminCharts() {
    // Category distribution
    this.drawDonut('categoryChart', {
      labels: ['Sanitation', 'Traffic', 'Animals', 'Noise', 'Roads', 'Water'],
      values: [28, 22, 15, 18, 10, 7]
    }, { centerText: '847', centerSubtext: 'Total' });

    // Monthly trends
    this.drawLine('trendsChart', {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
      datasets: [
        { label: 'Submitted', values: [120, 145, 132, 168, 155, 190, 210], color: '#00d4ff' },
        { label: 'Resolved', values: [100, 125, 118, 145, 138, 172, 195], color: '#22c55e' }
      ]
    });

    // Department performance
    this.drawBar('deptChart', {
      labels: ['Sanitation', 'Traffic', 'Animals', 'Noise', 'Roads'],
      datasets: [
        { label: 'Assigned', values: [85, 70, 45, 60, 35], color: '#00d4ff' },
        { label: 'Resolved', values: [78, 62, 40, 55, 28], color: '#22c55e' }
      ]
    });

    // Resolution rate
    this.drawRadial('resolutionChart', 87, {
      max: 100,
      color: '#00d4ff',
      color2: '#8b5cf6',
      label: '87%',
      sublabel: 'Resolution Rate'
    });

    // Heatmap
    const heatData = [
      [5,8,12,15,10,6,3],
      [8,15,20,25,18,12,5],
      [12,18,25,30,22,15,8],
      [10,14,18,22,16,10,4],
      [6,10,14,16,12,8,2]
    ];
    this.drawHeatmap('issueHeatmap', heatData, {
      showValues: true,
      xLabels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    });
  },

  initCitizenCharts() {
    // Citizen dashboard complaint status
    this.drawDonut('complaintStatusChart', {
      labels: ['Resolved', 'In Progress', 'Pending', 'Escalated'],
      values: [12, 5, 3, 2]
    }, { centerText: '22', centerSubtext: 'Total', donut: true });
  }
};

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Charts.initAll();
});

window.Charts = Charts;
