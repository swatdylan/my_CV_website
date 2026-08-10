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

        // Equity Curve — weekly, with S&P 500 benchmark
        const returnCtx = document.getElementById('optionsReturnChart');
        if (returnCtx) {
            new Chart(returnCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ["Apr 21", "Apr 28", "May 5", "May 12", "May 19", "May 26", "Jun 9", "Jun 23", "Jul 7", "Jul 14", "Jul 21", "Jul 28", "Aug 4", "Aug 11", "Aug 25", "Sep 1", "Sep 15", "Sep 22", "Oct 6", "Oct 13", "Oct 20", "Oct 27", "Nov 10", "Nov 17", "Nov 24", "Dec 1", "Dec 8", "Dec 15", "Dec 22", "Dec 29", "Jan 5", "Jan 12", "Jan 19", "Jan 26", "Feb 2", "Feb 9", "Feb 16", "Feb 23", "Mar 2", "Mar 9", "Mar 16", "Mar 23", "Mar 30", "Apr 6", "Apr 20", "Apr 27", "May 4", "May 11", "May 18", "Jun 1", "Jun 22", "Jul 6", "Jul 26"],
                    datasets: [{
                        label: 'Strategy',
                        // Jul 26 point added: +$616.08 P/L on the $35,000 account size
                        // (616.08 / 35000 * 100 = 1.76%), added to the prior cumulative
                        // total of 51.32% -> 53.08%. Simple (non-compounded) cumulative sum,
                        // consistent with how every prior point in this series was built.
                        data: [1.24, 2.71, 2.73, 4.49, 4.50, 5.77, 7.44, 9.37, 9.93, 11.06, 11.36, 11.51, 12.54, 13.76, 14.59, 15.47, 16.17, 18.56, 20.17, 22.42, 23.09, 24.15, 26.75, 27.66, 29.71, 29.92, 31.91, 32.51, 33.33, 34.01, 34.05, 35.03, 35.36, 35.63, 36.95, 37.38, 38.84, 39.01, 39.33, 39.74, 40.45, 40.49, 40.95, 41.02, 41.14, 42.05, 42.31, 42.35, 43.35, 49.35, 50.70, 51.32, 53.08],
                        borderColor: '#1a7f37',
                        backgroundColor: 'rgba(26, 127, 55, 0.06)',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: '#1a7f37',
                        pointHitRadius: 8,
                        tension: 0.25,
                        fill: true
                    }, {
                        label: 'S&P 500 (Benchmark)',
                        // NOTE: no real S&P 500 print for Jul 26 was provided, so this last
                        // point is carried forward from the prior value (46.13) as a
                        // placeholder, not a real benchmark figure — replace it once you
                        // have the actual S&P 500 return for this date.
                        data: [0.00, 7.18, 9.54, 13.30, 15.61, 14.80, 16.43, 16.81, 20.78, 21.53, 22.24, 23.88, 22.72, 23.56, 24.84, 24.38, 28.25, 29.77, 30.67, 29.01, 30.57, 33.29, 32.46, 29.36, 29.99, 32.07, 32.73, 32.15, 33.35, 33.88, 33.81, 35.27, 31.77, 34.74, 35.25, 35.02, 32.67, 32.56, 33.41, 31.75, 29.88, 27.58, 22.98, 28.18, 37.82, 39.08, 39.60, 43.71, 43.52, 47.34, 44.87, 46.13, 46.13],
                        borderColor: 'rgba(27, 31, 36, 0.28)',
                        borderWidth: 1.5,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        tension: 0.25,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { callback: v => '+' + v + '%', color: '#6b7280', font: { size: 10 } },
                            grid: { color: 'rgba(27, 31, 36, 0.05)', drawTicks: false },
                            border: { display: false }
                        },
                        x: {
                            grid: { display: false },
                            border: { display: false },
                            ticks: { maxTicksLimit: 8, autoSkip: true, color: '#6b7280', font: { size: 10 } }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            align: 'end',
                            labels: { color: '#4b5563', usePointStyle: true, pointStyle: 'line', boxWidth: 20, font: { size: 11 }, padding: 20 }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(27, 31, 36, 0.92)',
                            borderColor: 'rgba(27, 31, 36, 0.08)',
                            borderWidth: 1,
                            padding: 10,
                            titleColor: '#5fd97a',
                            bodyColor: '#f6f7f9',
                            boxPadding: 4,
                            callbacks: { label: (c) => `${c.dataset.label}: +${c.raw.toFixed(2)}%` }
                        }
                    }
                }
            });
        }
    }

    initCharts();

    /* ============================================================
       MONTHLY PERFORMANCE TABLE
       ============================================================ */
    const tableBody = document.getElementById('performance-body');
    if (tableBody) {
        const perfData = [
            { m: "Apr '25", p: "+2.71%", c: "+2.71%" },
            { m: "May '25", p: "+3.06%", c: "+5.77%" },
            { m: "Jun '25", p: "+3.60%", c: "+9.37%" },
            { m: "Jul '25", p: "+2.14%", c: "+11.51%" },
            { m: "Aug '25", p: "+3.08%", c: "+14.59%" },
            { m: "Sep '25", p: "+3.97%", c: "+18.56%" },
            { m: "Oct '25", p: "+5.59%", c: "+24.15%" },
            { m: "Nov '25", p: "+5.56%", c: "+29.71%" },
            { m: "Dec '25", p: "+4.30%", c: "+34.01%" },
            { m: "Jan '26", p: "+1.62%", c: "+35.63%" },
            { m: "Feb '26", p: "+3.38%", c: "+39.01%" },
            { m: "Mar '26", p: "+1.94%", c: "+40.95%" },
            { m: "Apr '26", p: "+1.10%", c: "+42.05%" },
            { m: "May '26", p: "+1.30%", c: "+43.35%" },
            { m: "Jun '26", p: "+7.35%", c: "+50.70%" },
            { m: "Jul '26", p: "+2.38%", c: "+53.08%" }
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
