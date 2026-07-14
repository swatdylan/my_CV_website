/* ============================================================
   Dylan Ang Kai Hao — Portfolio
   AXIOMA-inspired theme, ported for quant research showcase
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. HERO MORPHING SHAPE (kept verbatim from AXIOMA)
     ============================================================ */
  const heroSvg = document.getElementById('heroShape');
  if (heroSvg) {
    const blobFill = document.getElementById('blobFill');
    const blobStroke = document.getElementById('blobStroke');
    const ghost1 = document.getElementById('ghost1');
    const ghost2 = document.getElementById('ghost2');
    const ghost3 = document.getElementById('ghost3');
    const verticesGroup = document.getElementById('blobVertices');

    const N_VERTS = 12;
    const vertDots = [];
    for (let i = 0; i < N_VERTS; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', 3);
      c.setAttribute('fill', '#d4ff3a');
      c.setAttribute('opacity', '0.9');
      verticesGroup.appendChild(c);
      vertDots.push(c);
    }

    function catmullRomClosed(pts) {
      const n = pts.length;
      let d = '';
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        const p3 = pts[(i + 2) % n];
        if (i === 0) d += `M ${p1[0].toFixed(2)},${p1[1].toFixed(2)} `;
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += `C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)} `;
      }
      return d + 'Z';
    }

    let mouseFx = 0, mouseFy = 0;
    heroSvg.addEventListener('mousemove', e => {
      const rect = heroSvg.getBoundingClientRect();
      mouseFx = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      mouseFy = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
    });
    heroSvg.addEventListener('mouseleave', () => { mouseFx = 0; mouseFy = 0; });

    const heroStart = performance.now();
    function morphLoop() {
      const t = (performance.now() - heroStart) / 1000;
      const cx = 250 + mouseFx;
      const cy = 250 + mouseFy;
      const baseR = 150;
      const pts = [];
      for (let i = 0; i < N_VERTS; i++) {
        const angle = (i / N_VERTS) * Math.PI * 2;
        const r = baseR
          + Math.sin(t * 0.7 + i * 0.9) * 32
          + Math.cos(t * 0.5 + i * 1.7) * 22
          + Math.sin(t * 1.1 + i * 0.3) * 12;
        pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
      }
      const ghostPts1 = [], ghostPts2 = [], ghostPts3 = [];
      for (let i = 0; i < N_VERTS; i++) {
        const angle = (i / N_VERTS) * Math.PI * 2;
        const r1 = baseR + Math.sin((t-0.3) * 0.7 + i * 0.9) * 32 + Math.cos((t-0.3) * 0.5 + i * 1.7) * 22;
        const r2 = baseR + Math.sin((t-0.6) * 0.7 + i * 0.9) * 32 + Math.cos((t-0.6) * 0.5 + i * 1.7) * 22;
        const r3 = baseR + Math.sin((t-0.9) * 0.7 + i * 0.9) * 32 + Math.cos((t-0.9) * 0.5 + i * 1.7) * 22;
        ghostPts1.push([cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1]);
        ghostPts2.push([cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2]);
        ghostPts3.push([cx + Math.cos(angle) * r3, cy + Math.sin(angle) * r3]);
      }
      const mainPath = catmullRomClosed(pts);
      blobFill.setAttribute('d', mainPath);
      blobStroke.setAttribute('d', mainPath);
      ghost1.setAttribute('d', catmullRomClosed(ghostPts1));
      ghost2.setAttribute('d', catmullRomClosed(ghostPts2));
      ghost3.setAttribute('d', catmullRomClosed(ghostPts3));
      pts.forEach((p, i) => {
        vertDots[i].setAttribute('cx', p[0]);
        vertDots[i].setAttribute('cy', p[1]);
        const pulse = 2 + Math.sin(t * 2 + i) * 1.5;
        vertDots[i].setAttribute('r', Math.max(1.5, pulse));
      });
      requestAnimationFrame(morphLoop);
    }
    morphLoop();
  }

  /* ============================================================
     2. NAV PROGRESS + STICKY SHADOW
     ============================================================ */
  const navProgress = document.getElementById('navProgress');
  const nav = document.querySelector('nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (window.scrollY / max) * 100;
    if (navProgress) navProgress.style.width = pct + '%';
    if (nav) {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    lastScroll = window.scrollY;
  }, { passive: true });

  /* ============================================================
     3. SCROLL REVEAL ANIMATIONS
     ============================================================ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObserver.observe(el));

  /* ============================================================
     4. COUNTER ANIMATIONS (hero stats)
     ============================================================ */
  function animateCounter(el, target, decimals, prefix, suffix, duration = 1800) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = target * eased;
      let formatted;
      if (decimals === 0) formatted = Math.floor(v).toString();
      else if (decimals === 4) formatted = v.toFixed(4);
      else formatted = v.toFixed(decimals);
      el.textContent = (prefix || '') + formatted + (suffix || '');
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = (prefix || '') + target.toFixed(decimals) + (suffix || '');
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const c = e.target;
        const target = parseFloat(c.dataset.target);
        const decimals = parseInt(c.dataset.decimals || '0');
        const prefix = c.dataset.prefix || '';
        const suffix = c.dataset.suffix || '';
        animateCounter(c, target, decimals, prefix, suffix);
        counterObserver.unobserve(c);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

  /* ============================================================
     5. STRATEGY LAB — Interactive triangle → options greeks
     ============================================================ */
  const triSVG = document.getElementById('triangleSVG');
  if (triSVG) {
    const triPath = document.getElementById('trianglePath');
    const verticesG = document.getElementById('vertices');
    const sideLabelsG = document.getElementById('sideLabels');
    const angleArcsG = document.getElementById('angleArcs');
    const centroidEl = document.getElementById('centroid');
    const centroidLabel = document.getElementById('centroidLabel');

    const W = 600, H = 450;
    const triangle = {
      A: { x: 100, y: 100, label: 'Δ', role: 'delta' },
      B: { x: 500, y: 130, label: 'Γ', role: 'gamma' },
      C: { x: 300, y: 400, label: 'ν', role: 'vega' }
    };

    const vertexElements = {};
    ['A', 'B', 'C'].forEach(key => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'vertex-handle');
      g.dataset.vertex = key;

      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('r', 22);
      ring.setAttribute('fill', 'rgba(212,255,58,0.08)');
      ring.setAttribute('stroke', '#d4ff3a');
      ring.setAttribute('stroke-width', '1.5');

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', 4);
      dot.setAttribute('fill', '#d4ff3a');

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('font-family', 'Fraunces, serif');
      label.setAttribute('font-style', 'italic');
      label.setAttribute('font-size', '22');
      label.setAttribute('font-weight', '600');
      label.setAttribute('fill', '#0d0e14');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'central');
      label.textContent = triangle[key].label;
      label.setAttribute('y', 1);

      g.appendChild(ring);
      g.appendChild(dot);
      g.appendChild(label);
      verticesG.appendChild(g);
      vertexElements[key] = { g, ring, dot, label };

      const startDrag = (e) => {
        e.preventDefault();
        g.classList.add('dragging');
        const svgRect = triSVG.getBoundingClientRect();
        const scaleX = W / svgRect.width;
        const scaleY = H / svgRect.height;
        const onMove = (ev) => {
          const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
          const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
          const x = (clientX - svgRect.left) * scaleX;
          const y = (clientY - svgRect.top) * scaleY;
          triangle[key].x = Math.max(40, Math.min(W - 40, x));
          triangle[key].y = Math.max(40, Math.min(H - 40, y));
          updateLab();
        };
        const onUp = () => {
          g.classList.remove('dragging');
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
      };
      g.addEventListener('mousedown', startDrag);
      g.addEventListener('touchstart', startDrag, { passive: false });
    });

    function dist(p1, p2) { return Math.hypot(p2.x - p1.x, p2.y - p1.y); }
    function angleAtVertex(p, q1, q2) {
      const v1x = q1.x - p.x, v1y = q1.y - p.y;
      const v2x = q2.x - p.x, v2y = q2.y - p.y;
      const dot = v1x * v2x + v1y * v2y;
      const m1 = Math.hypot(v1x, v1y), m2 = Math.hypot(v2x, v2y);
      if (m1 < 0.001 || m2 < 0.001) return 0;
      return Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2)))) * 180 / Math.PI;
    }
    function midpoint(p1, p2) { return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }; }

    function describeArc(cx, cy, r, startAngle, endAngle) {
      const start = { x: cx + r * Math.cos(startAngle), y: cy + r * Math.sin(startAngle) };
      const end = { x: cx + r * Math.cos(endAngle), y: cy + r * Math.sin(endAngle) };
      const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
      const sweep = endAngle > startAngle ? 1 : 0;
      return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
    }
    function fmt(n, d = 1) { return n.toFixed(d); }

    function updateLab() {
      const { A, B, C } = triangle;
      triPath.setAttribute('d', `M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`);
      ['A', 'B', 'C'].forEach(k => {
        vertexElements[k].g.setAttribute('transform', `translate(${triangle[k].x}, ${triangle[k].y})`);
      });

      const a = dist(B, C); // opposite A
      const b = dist(A, C); // opposite B
      const c = dist(A, B); // opposite C
      const angleA = angleAtVertex(A, B, C);
      const angleB = angleAtVertex(B, A, C);
      const angleC = angleAtVertex(C, A, B);
      const perim = a + b + c;
      const s = perim / 2;
      const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));

      const gx = (A.x + B.x + C.x) / 3;
      const gy = (A.y + B.y + C.y) / 3;
      centroidEl.setAttribute('cx', gx);
      centroidEl.setAttribute('cy', gy);
      centroidLabel.setAttribute('x', gx + 12);
      centroidLabel.setAttribute('y', gy + 4);

      // Side labels (geometry)
      sideLabelsG.innerHTML = '';
      const sides = [
        { p1: B, p2: C, label: 'a', val: a },
        { p1: A, p2: C, label: 'b', val: b },
        { p1: A, p2: B, label: 'c', val: c }
      ];
      sides.forEach(sd => {
        const mid = midpoint(sd.p1, sd.p2);
        const dx = sd.p2.x - sd.p1.x, dy = sd.p2.y - sd.p1.y;
        const len = Math.hypot(dx, dy);
        const nx = -dy / len, ny = dx / len;
        const dir = ((mid.x - gx) * nx + (mid.y - gy) * ny) >= 0 ? 1 : -1;
        const off = 26;
        const lx = mid.x + nx * off * dir;
        const ly = mid.y + ny * off * dir;
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', lx);
        t.setAttribute('y', ly);
        t.setAttribute('font-family', 'JetBrains Mono, monospace');
        t.setAttribute('font-size', '11');
        t.setAttribute('fill', '#a8a496');
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('dominant-baseline', 'central');
        t.textContent = `${sd.label} = ${fmt(sd.val, 0)}`;
        sideLabelsG.appendChild(t);
      });

      // Angle arcs
      angleArcsG.innerHTML = '';
      const angles = [
        { vertex: A, p1: B, p2: C, val: angleA, name: 'A' },
        { vertex: B, p1: A, p2: C, val: angleB, name: 'B' },
        { vertex: C, p1: A, p2: B, val: angleC, name: 'C' }
      ];
      angles.forEach(ang => {
        const a1 = Math.atan2(ang.p1.y - ang.vertex.y, ang.p1.x - ang.vertex.x);
        const a2 = Math.atan2(ang.p2.y - ang.vertex.y, ang.p2.x - ang.vertex.x);
        const r = 32;
        const path = describeArc(ang.vertex.x, ang.vertex.y, r, Math.min(a1, a2), Math.max(a1, a2));
        const arcEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arcEl.setAttribute('d', path);
        arcEl.setAttribute('fill', 'none');
        arcEl.setAttribute('stroke', '#ffb627');
        arcEl.setAttribute('stroke-width', '1.5');
        arcEl.setAttribute('opacity', '0.55');
        angleArcsG.appendChild(arcEl);
      });

      // Map geometry → options greeks
      // Treat triangle as a strategy diagram where:
      // - side lengths (a, b, c) → strike distances ($0..300)
      // - angles → notional mix
      const norm = (v) => Math.min(1, Math.max(0, v / 350));
      const delta = (1 - norm(a)) * (angleA / 180);
      const gamma = norm(b) * Math.sin(angleB * Math.PI / 180);
      const vega = (norm(c) * 0.4) + 0.05;
      const theta = -((area / 80000) + 0.02);
      const breakeven = 100 + (norm(c) * 50);
      const maxProfit = Math.round(perim * 1.6);
      const maxLoss = Math.round(-area * 0.9);
      const ratio = maxLoss !== 0 ? (maxProfit / Math.abs(maxLoss)) : 0;

      document.getElementById('readDelta').textContent = (delta >= 0 ? '+' : '') + delta.toFixed(3);
      document.getElementById('readGamma').textContent = '+' + gamma.toFixed(4);
      document.getElementById('readVega').textContent = '+' + vega.toFixed(3);
      document.getElementById('readTheta').textContent = theta.toFixed(3);
      document.getElementById('readBreakeven').textContent = breakeven.toFixed(1);
      document.getElementById('readMaxProfit').textContent = '+' + maxProfit.toLocaleString();
      document.getElementById('readMaxLoss').textContent = maxLoss.toLocaleString();
      document.getElementById('readRatio').textContent = ratio > 0 ? ratio.toFixed(2) : '∞';

      // Classification
      const anglesArr = [angleA, angleB, angleC];
      const maxAng = Math.max(...anglesArr);
      const tol = (v1, v2) => Math.abs(v1 - v2) < 5;
      let bySym = 'asymmetric';
      if (tol(a, b) && tol(b, c)) bySym = 'balanced';
      else if (tol(a, b) || tol(b, c) || tol(a, c)) bySym = 'partially hedged';
      let byExposure = Math.abs(delta) < 0.15 ? 'delta-neutral' : (delta > 0 ? 'long delta' : 'short delta');
      document.getElementById('classification').textContent = `${byExposure} · ${bySym}`;
    }

    updateLab();
  }

  /* ============================================================
     6. PERFORMANCE CURVE — Weekly equity data + what-if sliders
     ============================================================ */
  const plotSVG = document.getElementById('plotSVG');
  if (plotSVG) {
    // Weekly cumulative % from the trading log (Monday-anchored weeks)
    const weeklyData = [
      { week: 'Apr 21', pct: 1.24 }, { week: 'Apr 28', pct: 2.71 }, { week: 'May 5', pct: 2.73 },
      { week: 'May 12', pct: 4.49 }, { week: 'May 19', pct: 4.50 }, { week: 'May 26', pct: 5.77 },
      { week: 'Jun 9',  pct: 7.44 }, { week: 'Jun 23', pct: 9.37 }, { week: 'Jul 7',  pct: 9.93 },
      { week: 'Jul 14', pct: 11.06 },{ week: 'Jul 21', pct: 11.36 },{ week: 'Jul 28', pct: 11.51 },
      { week: 'Aug 4',  pct: 12.54 },{ week: 'Aug 11', pct: 13.76 },{ week: 'Aug 25', pct: 14.59 },
      { week: 'Sep 1',  pct: 15.47 },{ week: 'Sep 15', pct: 16.17 },{ week: 'Sep 22', pct: 18.56 },
      { week: 'Oct 6',  pct: 20.17 },{ week: 'Oct 13', pct: 22.42 },{ week: 'Oct 20', pct: 23.09 },
      { week: 'Oct 27', pct: 24.15 },{ week: 'Nov 10', pct: 26.75 },{ week: 'Nov 17', pct: 27.66 },
      { week: 'Nov 24', pct: 29.71 },{ week: 'Dec 1',  pct: 29.92 },{ week: 'Dec 8',  pct: 31.91 },
      { week: 'Dec 15', pct: 32.51 },{ week: 'Dec 22', pct: 33.33 },{ week: 'Dec 29', pct: 34.01 },
      { week: 'Jan 5',  pct: 34.05 },{ week: 'Jan 12', pct: 35.03 },{ week: 'Jan 19', pct: 35.36 },
      { week: 'Jan 26', pct: 35.63 },{ week: 'Feb 2',  pct: 36.95 },{ week: 'Feb 9',  pct: 37.38 },
      { week: 'Feb 16', pct: 38.84 },{ week: 'Feb 23', pct: 39.01 },{ week: 'Mar 2',  pct: 39.33 },
      { week: 'Mar 9',  pct: 39.74 },{ week: 'Mar 16', pct: 40.45 },{ week: 'Mar 23', pct: 40.49 },
      { week: 'Mar 30', pct: 40.95 },{ week: 'Apr 6',  pct: 41.02 },{ week: 'Apr 20', pct: 41.14 },
      { week: 'Apr 27', pct: 42.05 },{ week: 'May 4',  pct: 42.31 },{ week: 'May 11', pct: 42.35 },
      { week: 'May 18', pct: 43.35 },{ week: 'Jun 1',  pct: 49.35 },{ week: 'Jun 22', pct: 50.70 },
      { week: 'Jul 6',  pct: 51.32 }
    ];

    // Compute weekly % returns from cumulative series (for stats)
    const weeklyReturns = [];
    for (let i = 0; i < weeklyData.length; i++) {
      const prev = i === 0 ? 0 : weeklyData[i - 1].pct;
      const weeklyPct = ((1 + weeklyData[i].pct / 100) / (1 + prev / 100) - 1) * 100;
      weeklyReturns.push(weeklyPct / 100);
    }

    const PW = 600, PH = 450;
    const padL = 56, padR = 24, padT = 24, padB = 44;
    const plotW = PW - padL - padR;
    const plotH = PH - padT - padB;
    const N = weeklyData.length;

    // Find max y based on slider-driven leverage
    function yMaxFor(leverage) {
      const maxPct = weeklyData[weeklyData.length - 1].pct * leverage;
      return Math.max(20, Math.ceil(maxPct / 10) * 10);
    }

    const plotGrid = document.getElementById('plotGrid');
    const plotAxes = document.getElementById('plotAxes');
    const curvePath = document.getElementById('curvePath');
    const curveFill = document.getElementById('curveFill');
    const benchLine = document.getElementById('benchLine');
    const benchLabel = document.getElementById('benchLabel');
    const plotPoints = document.getElementById('plotPoints');
    const hoverLine = document.getElementById('hoverLine');
    const hoverVert = document.getElementById('hoverVert');
    const hoverDot = document.getElementById('hoverDot');
    const hoverBox = document.getElementById('hoverBox');
    const hoverText = document.getElementById('hoverText');

    let leverage = 1.0;
    let startCap = 35000;

    function sx(i) { return padL + (i / (N - 1)) * plotW; }
    function sy(v, yMax) { return padT + (1 - v / yMax) * plotH; }

    function drawGrid(yMax) {
      plotGrid.innerHTML = '';
      plotAxes.innerHTML = '';

      // Horizontal grid (y ticks)
      const ticks = 5;
      for (let i = 0; i <= ticks; i++) {
        const v = (yMax / ticks) * i;
        const ly = sy(v, yMax);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padL);
        line.setAttribute('y1', ly);
        line.setAttribute('x2', padL + plotW);
        line.setAttribute('y2', ly);
        line.setAttribute('stroke', 'rgba(240,235,225,0.06)');
        line.setAttribute('stroke-width', '1');
        plotGrid.appendChild(line);
        const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lbl.setAttribute('x', padL - 10);
        lbl.setAttribute('y', ly + 3);
        lbl.setAttribute('font-family', 'JetBrains Mono, monospace');
        lbl.setAttribute('font-size', '10');
        lbl.setAttribute('fill', '#6b6d7a');
        lbl.setAttribute('text-anchor', 'end');
        lbl.textContent = '+' + Math.round(v) + '%';
        plotAxes.appendChild(lbl);
      }

      // Vertical grid (x ticks, every ~6th week)
      const xTickStep = Math.max(1, Math.floor(N / 8));
      for (let i = 0; i < N; i += xTickStep) {
        const lx = sx(i);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', lx);
        line.setAttribute('y1', padT);
        line.setAttribute('x2', lx);
        line.setAttribute('y2', padT + plotH);
        line.setAttribute('stroke', 'rgba(240,235,225,0.04)');
        line.setAttribute('stroke-width', '1');
        plotGrid.appendChild(line);
        const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lbl.setAttribute('x', lx);
        lbl.setAttribute('y', padT + plotH + 18);
        lbl.setAttribute('font-family', 'JetBrains Mono, monospace');
        lbl.setAttribute('font-size', '10');
        lbl.setAttribute('fill', '#6b6d7a');
        lbl.setAttribute('text-anchor', 'middle');
        lbl.textContent = weeklyData[i].week;
        plotAxes.appendChild(lbl);
      }
      // Last label
      const lastX = sx(N - 1);
      const lastLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lastLbl.setAttribute('x', lastX);
      lastLbl.setAttribute('y', padT + plotH + 18);
      lastLbl.setAttribute('font-family', 'JetBrains Mono, monospace');
      lastLbl.setAttribute('font-size', '10');
      lastLbl.setAttribute('fill', '#6b6d7a');
      lastLbl.setAttribute('text-anchor', 'middle');
      lastLbl.textContent = weeklyData[N - 1].week;
      plotAxes.appendChild(lastLbl);

      // S&P 500 benchmark line (end value)
      const benchPct = 45.71 * leverage;
      const by = sy(benchPct, yMax);
      benchLine.setAttribute('x1', padL);
      benchLine.setAttribute('y1', by);
      benchLine.setAttribute('x2', padL + plotW);
      benchLine.setAttribute('y2', by);
      benchLabel.setAttribute('x', padL + plotW - 4);
      benchLabel.setAttribute('y', by - 6);
      benchLabel.setAttribute('text-anchor', 'end');
      benchLabel.textContent = `S&P 500 benchmark · +${benchPct.toFixed(2)}%`;
    }

    function drawCurve(yMax) {
      let path = '';
      let first = true;
      for (let i = 0; i < N; i++) {
        const v = weeklyData[i].pct * leverage;
        const x = sx(i), y = sy(v, yMax);
        if (first) { path += `M ${x.toFixed(2)} ${y.toFixed(2)} `; first = false; }
        else path += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
      }
      curvePath.setAttribute('d', path);

      // Fill under curve
      let fillD = `M ${sx(0).toFixed(2)} ${sy(0, yMax).toFixed(2)} `;
      for (let i = 0; i < N; i++) {
        const v = weeklyData[i].pct * leverage;
        fillD += `L ${sx(i).toFixed(2)} ${sy(v, yMax).toFixed(2)} `;
      }
      fillD += `L ${sx(N - 1).toFixed(2)} ${sy(0, yMax).toFixed(2)} Z`;
      curveFill.setAttribute('d', fillD);

      // Highlight every ~6th week
      plotPoints.innerHTML = '';
      const step = Math.max(1, Math.floor(N / 9));
      for (let i = step; i < N - 1; i += step) {
        const v = weeklyData[i].pct * leverage;
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', sx(i));
        c.setAttribute('cy', sy(v, yMax));
        c.setAttribute('r', 3.5);
        c.setAttribute('fill', '#0d0e14');
        c.setAttribute('stroke', '#d4ff3a');
        c.setAttribute('stroke-width', '1.5');
        plotPoints.appendChild(c);
      }
      // Endpoint
      const lastV = weeklyData[N - 1].pct * leverage;
      const ec = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ec.setAttribute('cx', sx(N - 1));
      ec.setAttribute('cy', sy(lastV, yMax));
      ec.setAttribute('r', 6);
      ec.setAttribute('fill', '#d4ff3a');
      ec.setAttribute('stroke', '#0d0e14');
      ec.setAttribute('stroke-width', '2');
      plotPoints.appendChild(ec);
    }

    function updateFeatures(rfAnnual) {
      const cum = weeklyData[weeklyData.length - 1].pct;
      const finalBal = startCap * (1 + cum / 100);
      // CAGR over the elapsed period
      const firstDate = new Date('2025-04-21');
      const lastDate = new Date('2026-07-06');
      const years = (lastDate - firstDate) / (365.25 * 24 * 3600 * 1000);
      const cagr = ((Math.pow(1 + cum / 100, 1 / years) - 1) * 100) * leverage;
      // Sharpe (weekly)
      const rfWeekly = Math.pow(1 + rfAnnual / 100, 1 / 52) - 1;
      const mean = weeklyReturns.reduce((a, b) => a + b, 0) / weeklyReturns.length;
      const variance = weeklyReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / weeklyReturns.length;
      const std = Math.sqrt(variance);
      const sharpe = std > 0 ? ((mean - rfWeekly) / std) * Math.sqrt(52) : 0;
      // Max drawdown (peak-to-trough across weekly cumulative)
      let peak = 0, maxDD = 0;
      for (const w of weeklyData) {
        if (w.pct > peak) peak = w.pct;
        const dd = (peak - w.pct);
        if (dd > maxDD) maxDD = dd;
      }

      document.getElementById('featEnd').textContent = '$' + Math.round(finalBal).toLocaleString();
      document.getElementById('featCum').textContent = '+' + (cum * leverage).toFixed(2) + '%';
      document.getElementById('featCagr').textContent = '+' + cagr.toFixed(2) + '%';
      document.getElementById('featDD').textContent = '-' + maxDD.toFixed(2) + '%';
      document.getElementById('featWeeks').textContent = '52 / 64';
      document.getElementById('featWin').textContent = '100.0%';

      document.getElementById('eqStart').textContent = '$' + startCap.toLocaleString();
      document.getElementById('eqLeverage').textContent = leverage.toFixed(2) + 'x';
      document.getElementById('eqEnd').textContent = '$' + Math.round(finalBal).toLocaleString();

      document.getElementById('valStart').textContent = '$' + startCap.toLocaleString();
      document.getElementById('valLeverage').textContent = leverage.toFixed(2) + 'x';
      document.getElementById('valRf').textContent = rfAnnual.toFixed(2) + '%';

      // Update hover area position text
      const hoverEnd = document.getElementById('hoverText');
      if (hoverEnd) hoverEnd.textContent = 'hover to inspect';
    }

    function plotUpdate() {
      const yMax = yMaxFor(leverage);
      drawGrid(yMax);
      drawCurve(yMax);
    }

    // Hover interaction
    plotSVG.addEventListener('mousemove', (e) => {
      const rect = plotSVG.getBoundingClientRect();
      const scaleX = PW / rect.width;
      const scaleY = PH / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      if (mx < padL || mx > padL + plotW) {
        hoverLine.style.opacity = '0';
        return;
      }
      const ratio = (mx - padL) / plotW;
      const idx = Math.round(ratio * (N - 1));
      const yMax = yMaxFor(leverage);
      const v = weeklyData[idx].pct * leverage;
      const dotX = sx(idx), dotY = sy(v, yMax);
      hoverLine.style.opacity = '1';
      hoverVert.setAttribute('x1', dotX);
      hoverVert.setAttribute('y1', padT);
      hoverVert.setAttribute('x2', dotX);
      hoverVert.setAttribute('y2', padT + plotH);
      hoverDot.setAttribute('cx', dotX);
      hoverDot.setAttribute('cy', dotY);
      const finalBal = startCap * (1 + weeklyData[idx].pct / 100);
      const labelLines = [
        weeklyData[idx].week,
        `+${(weeklyData[idx].pct * leverage).toFixed(2)}%`,
        `$${Math.round(finalBal * leverage / 1.0 * (leverage / 1)).toLocaleString()}`
      ];
      const boxW = 130, boxH = 56;
      let boxX = dotX - boxW / 2;
      let boxY = dotY - boxH - 12;
      if (boxY < padT) boxY = dotY + 12;
      if (boxX < 4) boxX = 4;
      if (boxX + boxW > PW - 4) boxX = PW - boxW - 4;
      hoverBox.setAttribute('x', boxX);
      hoverBox.setAttribute('y', boxY);
      hoverBox.setAttribute('width', boxW);
      hoverBox.setAttribute('height', boxH);
      hoverText.setAttribute('x', boxX + 10);
      hoverText.setAttribute('y', boxY + 18);
      hoverText.textContent = `${weeklyData[idx].week}  ·  +${(weeklyData[idx].pct * leverage).toFixed(2)}%`;
    });
    plotSVG.addEventListener('mouseleave', () => { hoverLine.style.opacity = '0'; });

    // Slider bindings
    const sStart = document.getElementById('sliderStart');
    const sLev = document.getElementById('sliderLeverage');
    const sRf = document.getElementById('sliderRf');

    sStart.addEventListener('input', () => {
      startCap = parseInt(sStart.value);
      updateFeatures(parseFloat(sRf.value));
    });
    sLev.addEventListener('input', () => {
      leverage = parseFloat(sLev.value);
      plotUpdate();
      updateFeatures(parseFloat(sRf.value));
    });
    sRf.addEventListener('input', () => {
      updateFeatures(parseFloat(sRf.value));
    });

    // Initial render
    updateFeatures(3.7);
    plotUpdate();

    // Animate curve draw on first scroll into view
    const plotObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const len = curvePath.getTotalLength();
          curvePath.style.strokeDasharray = len;
          curvePath.style.strokeDashoffset = len;
          curvePath.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.65, 0, 0.35, 1)';
          requestAnimationFrame(() => {
            curvePath.style.strokeDashoffset = '0';
          });
          plotObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    plotObserver.observe(plotSVG);
  }

  /* ============================================================
     7. WEEKLY TABLE — populate, search, filter
     ============================================================ */
  const tableBody = document.getElementById('performance-body');
  if (tableBody) {
    const weeklyRows = [
      { w: 'Apr 21', p: '+1.24%', c: '+1.24%', pct: 1.24 },
      { w: 'Apr 28', p: '+1.45%', c: '+2.71%', pct: 1.45 },
      { w: 'May 5', p: '+0.02%', c: '+2.73%', pct: 0.02 },
      { w: 'May 12', p: '+1.72%', c: '+4.49%', pct: 1.72 },
      { w: 'May 19', p: '+0.00%', c: '+4.50%', pct: 0.005 },
      { w: 'May 26', p: '+1.22%', c: '+5.77%', pct: 1.22 },
      { w: 'Jun 9', p: '+1.58%', c: '+7.44%', pct: 1.58 },
      { w: 'Jun 23', p: '+1.80%', c: '+9.37%', pct: 1.80 },
      { w: 'Jul 7', p: '+0.51%', c: '+9.93%', pct: 0.51 },
      { w: 'Jul 14', p: '+1.03%', c: '+11.06%', pct: 1.03 },
      { w: 'Jul 21', p: '+0.27%', c: '+11.36%', pct: 0.27 },
      { w: 'Jul 28', p: '+0.13%', c: '+11.51%', pct: 0.13 },
      { w: 'Aug 4', p: '+0.93%', c: '+12.54%', pct: 0.93 },
      { w: 'Aug 11', p: '+1.08%', c: '+13.76%', pct: 1.08 },
      { w: 'Aug 25', p: '+0.73%', c: '+14.59%', pct: 0.73 },
      { w: 'Sep 1', p: '+0.77%', c: '+15.47%', pct: 0.77 },
      { w: 'Sep 15', p: '+0.60%', c: '+16.17%', pct: 0.60 },
      { w: 'Sep 22', p: '+2.06%', c: '+18.56%', pct: 2.06 },
      { w: 'Oct 6', p: '+1.36%', c: '+20.17%', pct: 1.36 },
      { w: 'Oct 13', p: '+1.87%', c: '+22.42%', pct: 1.87 },
      { w: 'Oct 20', p: '+0.55%', c: '+23.09%', pct: 0.55 },
      { w: 'Oct 27', p: '+0.86%', c: '+24.15%', pct: 0.86 },
      { w: 'Nov 10', p: '+2.09%', c: '+26.75%', pct: 2.09 },
      { w: 'Nov 17', p: '+0.72%', c: '+27.66%', pct: 0.72 },
      { w: 'Nov 24', p: '+1.60%', c: '+29.71%', pct: 1.60 },
      { w: 'Dec 1', p: '+0.17%', c: '+29.92%', pct: 0.17 },
      { w: 'Dec 8', p: '+1.53%', c: '+31.91%', pct: 1.53 },
      { w: 'Dec 15', p: '+0.45%', c: '+32.51%', pct: 0.45 },
      { w: 'Dec 22', p: '+0.62%', c: '+33.33%', pct: 0.62 },
      { w: 'Dec 29', p: '+0.51%', c: '+34.01%', pct: 0.51 },
      { w: 'Jan 5', p: '+0.02%', c: '+34.05%', pct: 0.02 },
      { w: 'Jan 12', p: '+0.74%', c: '+35.03%', pct: 0.74 },
      { w: 'Jan 19', p: '+0.24%', c: '+35.36%', pct: 0.24 },
      { w: 'Jan 26', p: '+0.19%', c: '+35.63%', pct: 0.19 },
      { w: 'Feb 2', p: '+0.97%', c: '+36.95%', pct: 0.97 },
      { w: 'Feb 9', p: '+0.31%', c: '+37.38%', pct: 0.31 },
      { w: 'Feb 16', p: '+1.06%', c: '+38.84%', pct: 1.06 },
      { w: 'Feb 23', p: '+0.12%', c: '+39.01%', pct: 0.12 },
      { w: 'Mar 2', p: '+0.23%', c: '+39.33%', pct: 0.23 },
      { w: 'Mar 9', p: '+0.29%', c: '+39.74%', pct: 0.29 },
      { w: 'Mar 16', p: '+0.51%', c: '+40.45%', pct: 0.51 },
      { w: 'Mar 23', p: '+0.03%', c: '+40.49%', pct: 0.03 },
      { w: 'Mar 30', p: '+0.33%', c: '+40.95%', pct: 0.33 },
      { w: 'Apr 6', p: '+0.05%', c: '+41.02%', pct: 0.05 },
      { w: 'Apr 20', p: '+0.09%', c: '+41.14%', pct: 0.09 },
      { w: 'Apr 27', p: '+0.64%', c: '+42.05%', pct: 0.64 },
      { w: 'May 4', p: '+0.18%', c: '+42.31%', pct: 0.18 },
      { w: 'May 11', p: '+0.03%', c: '+42.35%', pct: 0.03 },
      { w: 'May 18', p: '+0.70%', c: '+43.35%', pct: 0.70 },
      { w: 'Jun 1', p: '+4.19%', c: '+49.35%', pct: 4.19 },
      { w: 'Jun 22', p: '+0.90%', c: '+50.70%', pct: 0.90 },
      { w: 'Jul 6', p: '+0.41%', c: '+51.32%', pct: 0.41 }
    ];

    function renderTable(rows) {
      tableBody.innerHTML = '';
      rows.forEach((row, i) => {
        const tr = document.createElement('tr');
        tr.style.opacity = '0';
        tr.style.transform = 'translateY(8px)';
        tr.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        tr.innerHTML = `<td>${row.w}</td><td class="val-green">${row.p}</td><td class="val-green">${row.c}</td>`;
        tableBody.appendChild(tr);
        setTimeout(() => {
          tr.style.opacity = '1';
          tr.style.transform = 'translateY(0)';
        }, 12 * i);
      });
    }

    renderTable(weeklyRows);

    // Search
    const search = document.getElementById('tableSearch');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase();
        const filtered = weeklyRows.filter(r => r.w.toLowerCase().includes(q));
        renderTable(filtered);
      });
    }

    // Filter pills
    document.querySelectorAll('.table-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.table-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        let rows = weeklyRows;
        if (f === 'top') rows = [...weeklyRows].sort((a, b) => b.pct - a.pct).slice(0, 10);
        else if (f === 'recent') rows = weeklyRows.slice(-12);
        renderTable(rows);
      });
    });
  }

  /* ============================================================
     8. TRACK RECORD — interactive project cards
     ============================================================ */
  const trackGrid = document.getElementById('trackGrid');
  if (trackGrid) {
    const projects = [
      {
        question: 'TQQQ Market Regime Detection',
        meta: 'ML RISK SYSTEM · OCT 2025 → PRESENT',
        options: [
          { letter: 'A', val: '0.7817', label: 'ROC AUC' },
          { letter: 'B', val: '72%',    label: 'Accuracy' },
          { letter: 'C', val: '0.1857', label: 'Brier Score' },
          { letter: 'D', val: '516',    label: 'Weeks OOS' }
        ],
        feedback: {
          title: 'Walk-forward OOS classification of TQQQ volatility breach events.',
          body: 'XGBoost on ATR-normalized features and macro-volatility indices. Expanding-window cross-validation to defend against look-ahead bias. The model detects significant volatility events with high precision — informing tactical risk allocation and hedging cadence.',
          chips: ['XGBoost', 'Walk-Forward', 'Expanding Window', 'ATR-Normalized', 'Minimal Complexity']
        }
      },
      {
        question: 'Market-Neutral Options Alpha',
        meta: 'OPTIONS STRATEGY · APR 2025 → PRESENT',
        options: [
          { letter: 'A', val: '+51.32%', label: 'Since Inception' },
          { letter: 'B', val: '7.03',    label: 'Annual Sharpe' },
          { letter: 'C', val: '100%',    label: 'Win Rate (active)' },
          { letter: 'D', val: '64',      label: 'Calendar Weeks' }
        ],
        feedback: {
          title: 'Zero-beta, weekly-compounding options architecture on TQQQ.',
          body: 'Delta-neutral profile maintained through systematic hedging. Vega and gamma harvesting from short OTM call positions. 52 active trading weeks, 100% positive weeks. The portfolio compounds weekly; the table below shows every move.',
          chips: ['Delta-Neutral', 'Vega/Gamma Scalping', 'Market-Neutral', 'Weekly Compounding']
        }
      },
      {
        question: 'Forthcoming Publication',
        meta: 'NUS PHILOSOPHY · THE RED STONE JOURNAL · VOL. 5(1)',
        options: [
          { letter: 'A', val: 'Synthetic', label: 'Synapses' },
          { letter: 'B', val: 'Virtual',   label: 'Minds' },
          { letter: 'C', val: 'Bio.',      label: 'Necessity?' },
          { letter: 'D', val: '2026',      label: 'Expected' }
        ],
        feedback: {
          title: '"Synthetic Synapses and Virtual Minds: Challenging the Biological Necessity of Consciousness."',
          body: 'A philosophical argument that biological substrate is not a necessary condition for phenomenal experience. Published in an undergraduate journal of NUS Philosophy — the same habit of asking "is this really necessary?" that drives market regime questioning.',
          chips: ['Philosophy of Mind', 'Undergraduate Journal', 'NUS', 'Expected 2026']
        }
      },
      {
        question: 'Singapore Armed Forces — Data & Admin',
        meta: 'NATIONAL SERVICE · JAN 2020 – AUG 2021',
        options: [
          { letter: 'A', val: '100%',   label: 'Data Accuracy' },
          { letter: 'B', val: 'VBA',    label: 'Automation' },
          { letter: 'C', val: 'Large',  label: 'Datasets' },
          { letter: 'D', val: 'Senior', label: 'Leadership' }
        ],
        feedback: {
          title: 'Validated large-scale administrative datasets and built automation pipelines.',
          body: 'Managed senior-leadership reporting with 100% accuracy SLAs. Built Excel VBA automation that replaced manual workflows. First exposure to the discipline of producing a number that someone else will stake a decision on.',
          chips: ['Large-scale Data', 'Excel VBA', 'Accuracy SLA', 'Process Automation']
        }
      },
      {
        question: 'Academic Foundation — NUS Philosophy',
        meta: 'BACHELOR OF ARTS · 1ST CLASS HONOURS · AUG 2021 – DEC 2025',
        options: [
          { letter: 'A', val: '4.53',  label: 'GPA / 5.0' },
          { letter: 'B', val: '90.6%', label: 'Percentile' },
          { letter: 'C', val: '1st',   label: 'Honours' },
          { letter: 'D', val: 'Phil.', label: 'Major' }
        ],
        feedback: {
          title: 'First-order logic, computational reasoning, and the philosophy of belief.',
          body: 'Major in Philosophy, Minor in Language Science. Formal logic as a substrate for thinking about evidence under uncertainty. Computational reasoning as a substrate for thinking about what can be computed from what.',
          chips: ['Quantitative Reasoning', 'First-order Logic', 'Computational Reasoning', 'Inquiry into Beliefs']
        }
      }
    ];

    let openedCount = 0;
    const opened = projects.map(() => false);

    projects.forEach((proj, pIdx) => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.innerHTML = `
        <div class="quiz-question-num">PROJECT ${String(pIdx + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}</div>
        <div class="quiz-question">${proj.question}</div>
        <div class="quiz-meta">${proj.meta}</div>
        <div class="quiz-options">
          ${proj.options.map((opt, i) => `
            <button class="quiz-option" data-p="${pIdx}" data-i="${i}">
              <span class="letter">${opt.letter} · ${opt.label}</span>
              <span class="opt-val">${opt.val}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback">
          <strong></strong>
          <span></span>
          <div class="tag-chips"></div>
        </div>
      `;
      trackGrid.appendChild(card);
    });

    trackGrid.addEventListener('click', e => {
      const btn = e.target.closest('.quiz-option');
      if (!btn) return;
      const pIdx = parseInt(btn.dataset.p);
      const optIdx = parseInt(btn.dataset.i);
      const card = btn.closest('.quiz-card');
      const allOptions = card.querySelectorAll('.quiz-option');
      const feedback = card.querySelector('.quiz-feedback');
      const proj = projects[pIdx];

      if (opened[pIdx]) {
        // Toggle off
        allOptions.forEach(o => o.classList.remove('chosen', 'reveal-correct', 'answered'));
        feedback.classList.remove('show');
        opened[pIdx] = false;
        openedCount--;
      } else {
        allOptions.forEach(o => o.classList.add('answered'));
        btn.classList.add('chosen');
        feedback.classList.add('show');
        feedback.querySelector('strong').textContent = proj.feedback.title;
        feedback.querySelector('span').textContent = proj.feedback.body;
        const chipsContainer = feedback.querySelector('.tag-chips');
        chipsContainer.innerHTML = proj.feedback.chips
          .map(c => `<span class="chip">${c}</span>`)
          .join('');
        opened[pIdx] = true;
        openedCount++;
        showToast(`Opened: ${proj.question}`);
      }
      document.getElementById('trackOpened').textContent = openedCount;
    });
  }

  /* ============================================================
     9. METHODOLOGY — Step-by-step strategy walkthrough
     ============================================================ */
  const stepsData = [
    {
      title: 'Define the mandate: zero beta, positive carry',
      expression: 'β_π = 0,   E[r] > r_f',
      note: 'The portfolio must be uncorrelated with the S&P 500 (β ≈ 0) and earn more than the risk-free rate. Direction is not the source of return — volatility is.'
    },
    {
      title: 'Choose the underlying and instrument set',
      expression: 'S = TQQQ,  K = S · (1 + δ),  T = 7 days',
      note: 'TQQQ for liquidity and implied volatility surface. 1-week expiry to maximize theta decay per unit of gamma risk. Strike selected one tick OTM for positive extrinsic value.'
    },
    {
      title: 'Size the position via Kelly-fractional',
      expression: 'w* = (p · b − q) / b · ½',
      note: 'Half-Kelly for safety. Win rate ≈ 100% on active weeks (52/52), average win ≈ $440. Position sized so a worst-case ITM assignment still leaves the portfolio solvent.'
    },
    {
      title: 'Hedge the delta continuously',
      expression: 'Δ_portfolio = 0   ∀t',
      note: 'When the underlying moves, buy/sell TQQQ shares to keep portfolio delta at zero. The hedge is the strategy — direction is what we are explicitly not betting on.'
    },
    {
      title: 'Harvest gamma and vega, pay theta',
      expression: 'dΠ/dt = ½Γ·(dS)² + ν·dσ − Θ',
      note: 'Realized variance × gamma is positive on average. Volatility expansion lifts the short option value (vega positive for the portfolio net of hedge). Theta is the cost of admission.'
    },
    {
      title: 'Roll weekly, never let assignment happen',
      expression: 'T_remaining → 0 ⇒ close + reopen',
      note: 'Buy back the short call at $0.01–$0.05 in the final 24 hours and sell the next weekly. Avoids pin risk and the gap on ex-dividend dates. Discipline over cleverness.'
    },
    {
      title: 'Compound. Always.',
      expression: 'B_{n+1} = B_n · (1 + r_w) · L',
      note: 'Weekly returns are reinvested. After 52 active weeks: $35,000 → $52,961 (+51.32%). Sharpe of 7.03 against a 3.7% risk-free rate. The edge is the process — the rest is bookkeeping.',
      final: true
    }
  ];

  const stepsList = document.getElementById('stepsList');
  const revealBtn = document.getElementById('revealBtn');
  const revealBtnText = document.getElementById('revealBtnText');
  const resetBtn = document.getElementById('resetBtn');

  if (stepsList) {
    stepsData.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'step' + (s.final ? ' final' : '');
      div.innerHTML = `
        <div class="step-num">${i + 1}</div>
        <div class="step-title">${s.title}</div>
        <div class="step-expression">${s.expression}</div>
        ${s.note ? `<div class="step-note">${s.note}</div>` : ''}
      `;
      stepsList.appendChild(div);
    });

    let revealedCount = 0;
    function revealNext() {
      if (revealedCount >= stepsData.length) return;
      const steps = stepsList.querySelectorAll('.step');
      steps[revealedCount].classList.add('revealed');
      revealedCount++;
      if (revealedCount === stepsData.length) {
        revealBtn.disabled = true;
        revealBtnText.textContent = 'Strategy complete';
        showToast('Strategy revealed — $35,000 → $52,961');
      } else {
        revealBtnText.textContent = `Reveal step ${revealedCount + 1}`;
      }
      setTimeout(() => {
        steps[revealedCount - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    function resetSteps() {
      revealedCount = 0;
      stepsList.querySelectorAll('.step').forEach(s => s.classList.remove('revealed'));
      revealBtn.disabled = false;
      revealBtnText.textContent = 'Reveal step 1';
    }
    revealBtn.addEventListener('click', revealNext);
    resetBtn.addEventListener('click', resetSteps);
  }

  /* ============================================================
     10. TOAST
     ============================================================ */
  const toastEl = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer;
  window.showToast = function(msg) {
    if (!toastEl) return;
    toastMsg.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  };

  /* ============================================================
     11. INITIAL REVEAL TRIGGER
     ============================================================ */
  setTimeout(() => {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('visible');
    });
  }, 100);

});
