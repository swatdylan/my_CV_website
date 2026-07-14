/* ============================================================
   Dylan Ang Kai Hao — Portfolio
   AXIOMA-inspired theme, original content preserved
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. NAV PROGRESS + SCROLL BEHAVIOR
     ============================================================ */
  const navProgress = document.getElementById('navProgress');
  const nav = document.querySelector('nav');

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (window.scrollY / max) * 100;
    if (navProgress) navProgress.style.width = pct + '%';
    if (nav) {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ============================================================
     2. SCROLL REVEAL ANIMATIONS
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

  setTimeout(() => {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('visible');
    });
  }, 100);

  /* ============================================================
     3. COUNTER ANIMATIONS
     ============================================================ */
  function animateCounter(el, target, decimals, prefix, suffix, duration = 2000) {
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
     4. HERO MORPHING SHAPE
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
        const r1 = baseR + Math.sin((t - 0.3) * 0.7 + i * 0.9) * 32 + Math.cos((t - 0.3) * 0.5 + i * 1.7) * 22;
        const r2 = baseR + Math.sin((t - 0.6) * 0.7 + i * 0.9) * 32 + Math.cos((t - 0.6) * 0.5 + i * 1.7) * 22;
        const r3 = baseR + Math.sin((t - 0.9) * 0.7 + i * 0.9) * 32 + Math.cos((t - 0.9) * 0.5 + i * 1.7) * 22;
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
     5. TYPEWRITER
     ============================================================ */
  const typewriter = document.getElementById('typewriter');
  if (typewriter) {
    const phrases = ['Quantitative Researcher', 'ML Systems Builder', 'Options Strategist', 'NUS Philosophy Graduate'];
    let i = 0, j = 0, currentPhrase = [], isDeleting = false, isEnd = false;
    function loop() {
      isEnd = false;
      if (i < phrases.length) {
        if (!isDeleting && j <= phrases[i].length) {
          currentPhrase.push(phrases[i][j]); j++;
          typewriter.innerHTML = currentPhrase.join('') + '<span class="typed-cursor">|</span>';
        }
        if (isDeleting && j <= phrases[i].length) {
          currentPhrase.pop(); j--;
          typewriter.innerHTML = currentPhrase.join('') + '<span class="typed-cursor">|</span>';
        }
        if (j === phrases[i].length) { isEnd = true; isDeleting = true; }
        if (isDeleting && j === 0) { currentPhrase = []; isDeleting = false; i++; if (i === phrases.length) i = 0; }
      }
      const time = isEnd ? 2000 : isDeleting ? 50 : 150;
      setTimeout(loop, time);
    }
    loop();
  }

  /* ============================================================
     6. CHART.JS
     ============================================================ */
  function initCharts() {
    if (typeof Chart === 'undefined') {
      setTimeout(initCharts, 100);
      return;
    }

    Chart.defaults.color = '#8892a4';
    Chart.defaults.font.family = "'JetBrains Mono', monospace";

    // ROC Curve
    const rocCtx = document.getElementById('rocCurveChart');
    if (rocCtx) {
      new Chart(rocCtx.getContext('2d'), {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'ROC AUC = 0.7817',
            showLine: true,
            data: [
              { x: 0, y: 0 }, { x: 0.05, y: 0.35 }, { x: 0.1, y: 0.55 },
              { x: 0.2, y: 0.72 }, { x: 0.4, y: 0.85 }, { x: 0.7, y: 0.95 },
              { x: 1, y: 1 }
            ],
            borderColor: '#d4ff3a',
            backgroundColor: 'rgba(212, 255, 58, 0.1)',
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.4,
            fill: true
          }, {
            label: 'Random',
            showLine: true,
            data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
            borderColor: 'rgba(240, 235, 225, 0.15)',
            borderDash: [5, 5],
            borderWidth: 1,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { type: 'linear', min: 0, max: 1, grid: { color: 'rgba(240, 235, 225, 0.04)' } },
            y: { type: 'linear', min: 0, max: 1, grid: { color: 'rgba(240, 235, 225, 0.04)' } }
          },
          plugins: { legend: { labels: { color: '#f0ebe1', usePointStyle: true } } }
        }
      });
    }

    // Radar Chart
    const radarCtx = document.getElementById('tqqqPerformanceChart');
    if (radarCtx) {
      new Chart(radarCtx.getContext('2d'), {
        type: 'radar',
        data: {
          labels: ['ROC AUC', 'Accuracy', 'Breach Precision', 'Hold Precision', 'Brier Score'],
          datasets: [{
            label: 'Metrics',
            data: [0.78, 0.72, 0.68, 0.75, 0.81],
            backgroundColor: 'rgba(212, 255, 58, 0.25)',
            borderColor: '#d4ff3a',
            borderWidth: 3,
            pointRadius: 6,
            pointBackgroundColor: '#d4ff3a'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              min: 0, max: 1,
              grid: { color: 'rgba(240, 235, 225, 0.08)' },
              angleLines: { color: 'rgba(240, 235, 225, 0.08)' },
              ticks: { display: false },
              pointLabels: {
                color: '#f0ebe1',
                font: { size: 12, weight: '600' },
                padding: 15
              }
            }
          },
          layout: { padding: 0 },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => `${c.label}: ${(c.raw * 100).toFixed(0)}%` } }
          }
        },
        plugins: [{
          id: 'valueLabels',
          afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.data.forEach((point, index) => {
                const { x, y } = point.getProps(['x', 'y'], true);
                ctx.save();
                ctx.fillStyle = '#d4ff3a';
                ctx.font = 'bold 10px "JetBrains Mono"';
                ctx.textAlign = 'center';
                ctx.fillText((dataset.data[index] * 100).toFixed(0) + '%', x, y - 15);
                ctx.restore();
              });
            });
          }
        }]
      });
    }

    // Equity Curve with S&P 500 benchmark
    const returnCtx = document.getElementById('optionsReturnChart');
    if (returnCtx) {
      new Chart(returnCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ["Apr 21", "Apr 28", "May 5", "May 12", "May 19", "May 26", "Jun 9", "Jun 23", "Jul 7", "Jul 14", "Jul 21", "Jul 28", "Aug 4", "Aug 11", "Aug 25", "Sep 1", "Sep 15", "Sep 22", "Oct 6", "Oct 13", "Oct 20", "Oct 27", "Nov 10", "Nov 17", "Nov 24", "Dec 1", "Dec 8", "Dec 15", "Dec 22", "Dec 29", "Jan 5", "Jan 12", "Jan 19", "Jan 26", "Feb 2", "Feb 9", "Feb 16", "Feb 23", "Mar 2", "Mar 9", "Mar 16", "Mar 23", "Mar 30", "Apr 6", "Apr 20", "Apr 27", "May 4", "May 11", "May 18", "Jun 1", "Jun 22", "Jul 6"],
          datasets: [{
            label: 'Options Alpha Strategy',
            data: [1.24, 2.71, 2.73, 4.49, 4.50, 5.77, 7.44, 9.37, 9.93, 11.06, 11.36, 11.51, 12.54, 13.76, 14.59, 15.47, 16.17, 18.56, 20.17, 22.42, 23.09, 24.15, 26.75, 27.66, 29.71, 29.92, 31.91, 32.51, 33.33, 34.01, 34.05, 35.03, 35.36, 35.63, 36.95, 37.38, 38.84, 39.01, 39.33, 39.74, 40.45, 40.49, 40.95, 41.02, 41.14, 42.05, 42.31, 42.35, 43.35, 49.35, 50.70, 51.32],
            borderColor: '#d4ff3a',
            backgroundColor: 'rgba(212, 255, 58, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true
          }, {
            label: 'S&P 500 (Benchmark)',
            data: [10.94, 11.89, 13.05, 14.37, 15.69, 17.01, 18.75, 19.83, 21.08, 21.82, 22.56, 23.31, 24.01, 24.65, 25.94, 26.58, 26.63, 26.65, 27.02, 27.49, 27.97, 28.44, 29.21, 29.54, 29.88, 30.21, 30.62, 31.03, 31.44, 31.85, 31.88, 31.61, 31.34, 31.07, 30.84, 30.85, 30.86, 30.87, 31.02, 31.97, 32.92, 33.87, 34.83, 36.33, 39.79, 41.51, 42.81, 43.54, 44.26, 45.71, 45.71, 45.71],
            borderColor: 'rgba(240, 235, 225, 0.35)',
            borderDash: [5, 5],
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            y: { beginAtZero: true, ticks: { callback: v => '+' + v + '%' }, grid: { color: 'rgba(240, 235, 225, 0.05)' } },
            x: {
              grid: { display: false },
              ticks: {
                maxTicksLimit: 13,
                autoSkip: true,
                color: '#6b6d7a',
                font: { size: 10 }
              }
            }
          },
          plugins: {
            legend: { position: 'top', labels: { color: '#f0ebe1', usePointStyle: true } },
            tooltip: {
              backgroundColor: 'rgba(13, 14, 20, 0.9)',
              borderColor: 'rgba(240, 235, 225, 0.1)',
              borderWidth: 1,
              titleColor: '#d4ff3a',
              bodyColor: '#f0ebe1',
              callbacks: { label: (c) => `${c.dataset.label}: +${c.raw.toFixed(2)}%` }
            }
          }
        }
      });
    }
  }

  initCharts();

  /* ============================================================
     7. WEEKLY PERFORMANCE TABLE
     ============================================================ */
  const tableBody = document.getElementById('performance-body');
  if (tableBody) {
    const perfData = [
      { w: 'Apr 21', p: '+1.24%', c: '+1.24%' },
      { w: 'Apr 28', p: '+1.45%', c: '+2.71%' },
      { w: 'May 5', p: '+0.02%', c: '+2.73%' },
      { w: 'May 12', p: '+1.72%', c: '+4.49%' },
      { w: 'May 19', p: '+0.00%', c: '+4.50%' },
      { w: 'May 26', p: '+1.22%', c: '+5.77%' },
      { w: 'Jun 9', p: '+1.58%', c: '+7.44%' },
      { w: 'Jun 23', p: '+1.80%', c: '+9.37%' },
      { w: 'Jul 7', p: '+0.51%', c: '+9.93%' },
      { w: 'Jul 14', p: '+1.03%', c: '+11.06%' },
      { w: 'Jul 21', p: '+0.27%', c: '+11.36%' },
      { w: 'Jul 28', p: '+0.13%', c: '+11.51%' },
      { w: 'Aug 4', p: '+0.93%', c: '+12.54%' },
      { w: 'Aug 11', p: '+1.08%', c: '+13.76%' },
      { w: 'Aug 25', p: '+0.73%', c: '+14.59%' },
      { w: 'Sep 1', p: '+0.77%', c: '+15.47%' },
      { w: 'Sep 15', p: '+0.60%', c: '+16.17%' },
      { w: 'Sep 22', p: '+2.06%', c: '+18.56%' },
      { w: 'Oct 6', p: '+1.36%', c: '+20.17%' },
      { w: 'Oct 13', p: '+1.87%', c: '+22.42%' },
      { w: 'Oct 20', p: '+0.55%', c: '+23.09%' },
      { w: 'Oct 27', p: '+0.86%', c: '+24.15%' },
      { w: 'Nov 10', p: '+2.09%', c: '+26.75%' },
      { w: 'Nov 17', p: '+0.72%', c: '+27.66%' },
      { w: 'Nov 24', p: '+1.60%', c: '+29.71%' },
      { w: 'Dec 1', p: '+0.17%', c: '+29.92%' },
      { w: 'Dec 8', p: '+1.53%', c: '+31.91%' },
      { w: 'Dec 15', p: '+0.45%', c: '+32.51%' },
      { w: 'Dec 22', p: '+0.62%', c: '+33.33%' },
      { w: 'Dec 29', p: '+0.51%', c: '+34.01%' },
      { w: 'Jan 5', p: '+0.02%', c: '+34.05%' },
      { w: 'Jan 12', p: '+0.74%', c: '+35.03%' },
      { w: 'Jan 19', p: '+0.24%', c: '+35.36%' },
      { w: 'Jan 26', p: '+0.19%', c: '+35.63%' },
      { w: 'Feb 2', p: '+0.97%', c: '+36.95%' },
      { w: 'Feb 9', p: '+0.31%', c: '+37.38%' },
      { w: 'Feb 16', p: '+1.06%', c: '+38.84%' },
      { w: 'Feb 23', p: '+0.12%', c: '+39.01%' },
      { w: 'Mar 2', p: '+0.23%', c: '+39.33%' },
      { w: 'Mar 9', p: '+0.29%', c: '+39.74%' },
      { w: 'Mar 16', p: '+0.51%', c: '+40.45%' },
      { w: 'Mar 23', p: '+0.03%', c: '+40.49%' },
      { w: 'Mar 30', p: '+0.33%', c: '+40.95%' },
      { w: 'Apr 6', p: '+0.05%', c: '+41.02%' },
      { w: 'Apr 20', p: '+0.09%', c: '+41.14%' },
      { w: 'Apr 27', p: '+0.64%', c: '+42.05%' },
      { w: 'May 4', p: '+0.18%', c: '+42.31%' },
      { w: 'May 11', p: '+0.03%', c: '+42.35%' },
      { w: 'May 18', p: '+0.70%', c: '+43.35%' },
      { w: 'Jun 1', p: '+4.19%', c: '+49.35%' },
      { w: 'Jun 22', p: '+0.90%', c: '+50.70%' },
      { w: 'Jul 6', p: '+0.41%', c: '+51.32%' }
    ];

    tableBody.innerHTML = '';
    perfData.forEach((row, i) => {
      const tr = document.createElement('tr');
      tr.style.opacity = '0';
      tr.style.transform = 'translateY(6px)';
      tr.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      tr.innerHTML = `<td>${row.w}</td><td class="val-green">${row.p}</td><td class="val-green">${row.c}</td>`;
      tableBody.appendChild(tr);
      setTimeout(() => {
        tr.style.opacity = '1';
        tr.style.transform = 'translateY(0)';
      }, i * 8);
    });
  }

});
