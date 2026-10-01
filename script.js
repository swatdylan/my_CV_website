document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded: Initializing scripts...");

    /* ============================================================
       NAV + PROGRESS + MOBILE MENU
       ============================================================ */
    const navbar = document.querySelector('.navbar');
    const progressBar = document.getElementById('navProgress');
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        if (navbar && window.scrollY > 20) navbar.classList.add('scrolled');
        else if (navbar) navbar.classList.remove('scrolled');

        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";
    });

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });
    }

    /* ============================================================
       SCROLL REVEAL
       ============================================================ */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
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
       COUNTER ANIMATIONS
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
       TYPEWRITER
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
                    typewriter.innerHTML = currentPhrase.join('') + '<span style="color: var(--accent);">|</span>';
                }
                if (isDeleting && j <= phrases[i].length) {
                    currentPhrase.pop(); j--;
                    typewriter.innerHTML = currentPhrase.join('') + '<span style="color: var(--accent);">|</span>';
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
       CHART.JS
       ============================================================ */
    function initCharts() {
        if (typeof Chart === 'undefined') {
            console.error("Chart.js not loaded. Retrying in 100ms...");
            setTimeout(initCharts, 100);
            return;
        }
        console.log("Chart.js loaded. Initializing plots...");

        Chart.defaults.color = '#6b7280';
        Chart.defaults.font.family = "'JetBrains Mono', monospace";

        // ROC Curve
        const rocCtx = document.getElementById('rocCurveChart');
        if (rocCtx) {
            new Chart(rocCtx.getContext('2d'), {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'ROC AUC = 0.767',
                        showLine: true,
                        data: [
                            { x: 0, y: 0 }, { x: 0.05, y: 0.35 }, { x: 0.1, y: 0.55 },
                            { x: 0.2, y: 0.72 }, { x: 0.4, y: 0.85 }, { x: 0.7, y: 0.95 },
                            { x: 1, y: 1 }
                        ],
                        borderColor: '#1a7f37',
                        backgroundColor: 'rgba(26, 127, 55, 0.1)',
                        borderWidth: 3,
                        pointRadius: 0,
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Random',
                        showLine: true,
                        data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
                        borderColor: 'rgba(27, 31, 36, 0.15)',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { type: 'linear', min: 0, max: 1, grid: { color: 'rgba(27, 31, 36, 0.06)' } },
                        y: { type: 'linear', min: 0, max: 1, grid: { color: 'rgba(27, 31, 36, 0.06)' } }
                    },
                    plugins: { legend: { labels: { color: '#1b1f24', usePointStyle: true } } }
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
                        data: [0.767, 0.72, 0.69, 0.74, 0.809],
                        backgroundColor: 'rgba(26, 127, 55, 0.25)',
                        borderColor: '#1a7f37',
                        borderWidth: 3,
                        pointRadius: 6,
                        pointBackgroundColor: '#1a7f37'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        r: {
                            min: 0, max: 1,
                            grid: { color: 'rgba(27, 31, 36, 0.08)' },
                            angleLines: { color: 'rgba(27, 31, 36, 0.08)' },
                            ticks: { display: false },
                            pointLabels: {
                                color: '#1b1f24',
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
                                ctx.fillStyle = '#1a7f37';
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

        // Equity Curve — weekly, with S&P 500 benchmark, scrubbable + range-selectable
        const returnCtx = document.getElementById('optionsReturnChart');
        if (returnCtx) {
            const EQUITY_LABELS = ["Apr 21", "Apr 28", "May 5", "May 12", "May 19", "May 26", "Jun 2", "Jun 9", "Jun 16", "Jun 23", "Jul 7", "Jul 14", "Jul 21", "Jul 28", "Aug 4", "Aug 11", "Aug 18", "Aug 25", "Sep 1", "Sep 15", "Sep 22", "Sep 29", "Oct 6", "Oct 13", "Oct 20", "Oct 27", "Nov 3", "Nov 10", "Nov 17", "Nov 24", "Dec 1", "Dec 8", "Dec 15", "Dec 22", "Dec 29", "Jan 5", "Jan 12", "Jan 19", "Jan 26", "Feb 2", "Feb 9", "Feb 16", "Feb 23", "Mar 2", "Mar 9", "Mar 16", "Mar 23", "Mar 30", "Apr 6", "Apr 20", "Apr 27", "May 4", "May 11", "May 18", "Jun 1", "Jun 8", "Jun 22", "Jul 6", "Jul 13", "Jul 20", "Jul 27", "Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28"];
            // Apr 21 point: pre-Schwab broker activity (+1.24%), carried over as-is.
            // Apr 28 onward: full TQQQ book (covered-call combos + assignment settlements +
            // leftover-share disposals after OTM expiries + rolls/verticals), reconstructed
            // via FIFO share-lot accounting from the complete Schwab trade history, including
            // the Nov 2025 2:1 stock split. Cumulative sum of weekly $ P/L / $35,000.
            // Sep 2026 points per the trade log: Aug 31 $163.04, Sep 7 $298.40, Sep 14
            // $1,260.72 (corrected -- the 68/73/80.5 combo leg was originally logged at
            // $454.68 before the full 3-leg breakdown was available; true value is
            // $1,077.68). Sep 21: $34.22 (35-share round trip, bought 9/25 @78.605,
                        // sold 9/26 @79.5826). Sep 28: $335.04.
            const EQUITY_STRAT = [1.24, 2.45, 2.45, 3.47, 4.12, 6.00, 6.16, 7.36, 7.36, 9.11, 9.68, 11.20, 11.34, 11.67, 12.76, 13.76, 13.76, 13.30, 15.30, 15.48, 16.36, 17.85, 18.79, 19.45, 23.75, 24.39, 24.36, 24.38, 26.08, 26.08, 27.98, 27.32, 27.77, 27.88, 30.12, 30.21, 32.35, 32.31, 35.10, 33.45, 34.47, 37.25, 35.70, 36.84, 37.31, 38.66, 38.70, 40.69, 40.76, 40.89, 41.81, 42.08, 42.13, 43.64, 48.20, 50.11, 51.68, 52.31, 52.74, 52.50, 53.25, 53.45, 53.57, 53.43, 53.76, 54.23, 55.08, 58.68, 58.78, 59.74];
            // Actual S&P 500 daily closes (FRED SP500 series), % change from the Apr 28 2025
            // anchor (no benchmark move assumed for the Apr 21 lead-in point), aligned to
            // each week's Monday or nearest trading day. Sep 7 2026 uses the Sep 8 close
            // (Sep 7 = Labor Day, market closed).
            const EQUITY_SPX = [0.00, 0.00, 2.20, 5.71, 7.87, 7.10, 7.36, 8.63, 9.12, 8.98, 12.68, 13.38, 14.05, 15.57, 14.49, 15.28, 16.65, 16.47, 16.04, 19.65, 21.07, 20.48, 21.91, 20.37, 21.82, 24.35, 23.93, 23.58, 20.69, 21.28, 23.22, 23.83, 23.29, 24.41, 24.91, 24.84, 26.20, 22.94, 25.71, 26.18, 25.97, 23.78, 23.68, 24.47, 22.92, 21.17, 19.03, 14.74, 19.59, 28.58, 29.76, 30.24, 34.08, 33.90, 37.46, 33.95, 35.16, 36.33, 35.93, 34.63, 34.08, 37.47, 40.23, 40.09, 38.42, 39.02, 38.79, 37.82, 40.44, 38.98];

            // Parse "Mon D" labels into real dates, rolling the year forward each time the
            // month number decreases (series starts Apr 2025, ends Sep 2026).
            const MONTH_NUM = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
            const EQUITY_DATES = (() => {
                let year = 2025, prevMonth = null;
                return EQUITY_LABELS.map(lab => {
                    const [mon, day] = lab.split(' ');
                    const m = MONTH_NUM[mon];
                    if (prevMonth !== null && m < prevMonth) year++;
                    prevMonth = m;
                    return new Date(year, m, parseInt(day, 10));
                });
            })();
            const lastDate = EQUITY_DATES[EQUITY_DATES.length - 1];

            const RANGE_DAYS = { '1M': 30, '3M': 91, '6M': 182, '1Y': 365 };
            function rangeStartIndex(range) {
                if (range === 'ALL') return 0;
                if (range === 'YTD') {
                    // Anchor to the last data point of the prior year (matches the YTD
                    // stat card's convention), not the first point of the new year.
                    const dec31 = new Date(lastDate.getFullYear() - 1, 11, 31);
                    let idx = 0;
                    for (let i = 0; i < EQUITY_DATES.length; i++) {
                        if (EQUITY_DATES[i] <= dec31) idx = i; else break;
                    }
                    return idx;
                }
                const cutoff = new Date(lastDate.getTime() - RANGE_DAYS[range] * 86400000);
                let idx = EQUITY_DATES.findIndex(d => d >= cutoff);
                return idx === -1 ? EQUITY_DATES.length - 1 : Math.max(0, idx);
            }
            const RANGE_SUBLABEL = { '1M': 'past month', '3M': 'past 3 months', '6M': 'past 6 months', 'YTD': 'year to date', '1Y': 'past year', 'ALL': 'all time' };

            function buildDataset(range) {
                const startIdx = rangeStartIndex(range);
                const labels = EQUITY_LABELS.slice(startIdx);
                if (range === 'ALL') {
                    return { labels, strat: EQUITY_STRAT.slice(startIdx), spx: EQUITY_SPX.slice(startIdx), headline: EQUITY_STRAT[EQUITY_STRAT.length - 1] };
                }
                // Rebase so the window itself starts at 0% -- the chart then shows the
                // return actually earned within the selected window, matching the headline.
                const stratBase = EQUITY_STRAT[startIdx];
                const spxBase = EQUITY_SPX[startIdx];
                const strat = EQUITY_STRAT.slice(startIdx).map(v => +(v - stratBase).toFixed(2));
                const spx = EQUITY_SPX.slice(startIdx).map(v => +(v - spxBase).toFixed(2));
                return { labels, strat, spx, headline: strat[strat.length - 1] };
            }

            // Vertical crosshair line at the scrubbed index (driven by our own pointer
            // handlers below, not Chart.js's tooltip/active-element state).
            let hoverIndex = null;
            const crosshairPlugin = {
                id: 'crosshair',
                afterDraw(chart) {
                    if (hoverIndex === null) return;
                    const meta = chart.getDatasetMeta(0);
                    const point = meta.data[hoverIndex];
                    if (!point) return;
                    const { ctx, chartArea } = chart;
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(point.x, chartArea.top);
                    ctx.lineTo(point.x, chartArea.bottom);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'rgba(27, 31, 36, 0.3)';
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();
                    ctx.restore();
                }
            };

            const initial = buildDataset('ALL');
            let currentData = initial;
            const equityChart = new Chart(returnCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: initial.labels,
                    datasets: [{
                        label: 'Strategy',
                        data: initial.strat,
                        borderColor: '#1a7f37',
                        backgroundColor: 'rgba(26, 127, 55, 0.06)',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: '#1a7f37',
                        pointHitRadius: 8,
                        tension: 0,
                        fill: true
                    }, {
                        label: 'S&P 500 (Benchmark)',
                        data: initial.spx,
                        borderColor: 'rgba(27, 31, 36, 0.28)',
                        borderWidth: 1.5,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        tension: 0,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            ticks: { callback: v => (v >= 0 ? '+' : '') + v + '%', color: '#6b7280', font: { size: 10 } },
                            grid: { color: 'rgba(27, 31, 36, 0.05)', drawTicks: false },
                            border: { display: false }
                        },
                        x: {
                            grid: { display: false },
                            border: { display: false },
                            ticks: { maxTicksLimit: Math.min(initial.labels.length, 10), autoSkip: true, color: '#6b7280', font: { size: 10 } }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            align: 'end',
                            labels: { color: '#4b5563', usePointStyle: true, pointStyle: 'line', boxWidth: 20, font: { size: 11 }, padding: 20 }
                        },
                        tooltip: { enabled: false }
                    }
                },
                plugins: [crosshairPlugin]
            });

            const headlineValueEl = document.getElementById('equityHeadlineValue');
            const headlineLabelEl = document.getElementById('equityHeadlineLabel');
            const rangeTabs = document.getElementById('rangeTabs');
            if (rangeTabs) {
                rangeTabs.querySelectorAll('.range-tab').forEach(btn => {
                    btn.addEventListener('click', () => {
                        rangeTabs.querySelectorAll('.range-tab').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        const range = btn.dataset.range;
                        const d = buildDataset(range);
                        equityChart.data.labels = d.labels;
                        equityChart.data.datasets[0].data = d.strat;
                        equityChart.data.datasets[1].data = d.spx;
                        equityChart.options.scales.x.ticks.maxTicksLimit = Math.min(d.labels.length, 10);
                        equityChart.update();
                        if (headlineValueEl) {
                            headlineValueEl.textContent = (d.headline >= 0 ? '+' : '') + d.headline.toFixed(2) + '%';
                            headlineValueEl.classList.toggle('negative', d.headline < 0);
                        }
                        if (headlineLabelEl) headlineLabelEl.textContent = RANGE_SUBLABEL[range];
                        currentData = d;
                        hoverIndex = null;
                        updateReadout(null);
                    });
                });
            }

            // Scrub readout: a persistent row below the range tabs (not a popup tooltip)
            // showing both the Strategy and S&P 500 return at the scrubbed point.
            const scrubDateEl = document.getElementById('scrubDate');
            const scrubStratEl = document.getElementById('scrubStrat');
            const scrubSpxEl = document.getElementById('scrubSpx');
            function updateReadout(idx) {
                const i = idx === null ? currentData.labels.length - 1 : idx;
                const strat = currentData.strat[i];
                const spx = currentData.spx[i];
                if (scrubDateEl) scrubDateEl.textContent = currentData.labels[i];
                if (scrubStratEl) scrubStratEl.textContent = (strat >= 0 ? '+' : '') + strat.toFixed(2) + '%';
                if (scrubSpxEl) scrubSpxEl.textContent = (spx >= 0 ? '+' : '') + spx.toFixed(2) + '%';
            }
            function indexFromClientX(clientX) {
                const rect = returnCtx.getBoundingClientRect();
                const canvasX = clientX - rect.left;
                const meta = equityChart.getDatasetMeta(0);
                let closest = 0, minDist = Infinity;
                meta.data.forEach((pt, i) => {
                    const dist = Math.abs(pt.x - canvasX);
                    if (dist < minDist) { minDist = dist; closest = i; }
                });
                return closest;
            }
            function handleScrub(clientX) {
                hoverIndex = indexFromClientX(clientX);
                updateReadout(hoverIndex);
                equityChart.update('none');
            }
            function endScrub() {
                hoverIndex = null;
                updateReadout(null);
                equityChart.update('none');
            }
            returnCtx.addEventListener('mousemove', (e) => handleScrub(e.clientX));
            returnCtx.addEventListener('mouseleave', endScrub);
            returnCtx.addEventListener('touchstart', (e) => { if (e.touches[0]) handleScrub(e.touches[0].clientX); }, { passive: true });
            returnCtx.addEventListener('touchmove', (e) => { if (e.touches[0]) { handleScrub(e.touches[0].clientX); e.preventDefault(); } }, { passive: false });
            returnCtx.addEventListener('touchend', endScrub);

            updateReadout(null);
        }
    }

    initCharts();

    /* ============================================================
       MONTHLY PERFORMANCE TABLE
       ============================================================ */
    const tableBody = document.getElementById('performance-body');
    if (tableBody) {
        const perfData = [
            { m: "Apr '25", p: "+2.45%", c: "+2.45%" },
            { m: "May '25", p: "+3.55%", c: "+6.00%" },
            { m: "Jun '25", p: "+3.11%", c: "+9.11%" },
            { m: "Jul '25", p: "+2.56%", c: "+11.67%" },
            { m: "Aug '25", p: "+1.63%", c: "+13.30%" },
            { m: "Sep '25", p: "+4.55%", c: "+17.85%" },
            { m: "Oct '25", p: "+6.54%", c: "+24.39%" },
            { m: "Nov '25", p: "+1.69%", c: "+26.08%" },
            { m: "Dec '25", p: "+4.04%", c: "+30.12%" },
            { m: "Jan '26", p: "+4.98%", c: "+35.10%" },
            { m: "Feb '26", p: "+0.60%", c: "+35.70%" },
            { m: "Mar '26", p: "+4.99%", c: "+40.69%" },
            { m: "Apr '26", p: "+1.12%", c: "+41.81%" },
            { m: "May '26", p: "+1.83%", c: "+43.64%" },
            { m: "Jun '26", p: "+8.04%", c: "+51.68%" },
            { m: "Jul '26", p: "+1.57%", c: "+53.25%" },
            { m: "Aug '26", p: "+0.51%", c: "+53.76%" },
            { m: "Sep '26", p: "+5.98%", c: "+59.74%" }
        ];

        tableBody.innerHTML = '';
        perfData.forEach((row, i) => {
            const tr = document.createElement('tr');
            tr.style.opacity = '0';
            tr.style.transform = 'translateY(6px)';
            tr.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            tr.innerHTML = `<td>${row.m}</td><td class="val-green">${row.p}</td><td class="val-green">${row.c}</td>`;
            tableBody.appendChild(tr);
            setTimeout(() => {
                tr.style.opacity = '1';
                tr.style.transform = 'translateY(0)';
            }, i * 12);
        });
    }
});
