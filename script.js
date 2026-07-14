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

        // Equity Curve — weekly, with S&P 500 benchmark
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
                    scales: {
                        y: { beginAtZero: true, ticks: { callback: v => '+' + v + '%' }, grid: { color: 'rgba(240, 235, 225, 0.05)' } },
                        x: {
                            grid: { display: false },
                            ticks: { maxTicksLimit: 13, autoSkip: true, color: '#6b6d7a', font: { size: 10 } }
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
       WEEKLY PERFORMANCE TABLE
       ============================================================ */
    const tableBody = document.getElementById('performance-body');
    if (tableBody) {
        const perfData = [
            { w: "Apr 21", p: "+1.24%", c: "+1.24%" },
            { w: "Apr 28", p: "+1.45%", c: "+2.71%" },
            { w: "May 5", p: "+0.02%", c: "+2.73%" },
            { w: "May 12", p: "+1.72%", c: "+4.49%" },
            { w: "May 19", p: "+0.00%", c: "+4.50%" },
            { w: "May 26", p: "+1.22%", c: "+5.77%" },
            { w: "Jun 9", p: "+1.58%", c: "+7.44%" },
            { w: "Jun 23", p: "+1.80%", c: "+9.37%" },
            { w: "Jul 7", p: "+0.51%", c: "+9.93%" },
            { w: "Jul 14", p: "+1.03%", c: "+11.06%" },
            { w: "Jul 21", p: "+0.27%", c: "+11.36%" },
            { w: "Jul 28", p: "+0.13%", c: "+11.51%" },
            { w: "Aug 4", p: "+0.93%", c: "+12.54%" },
            { w: "Aug 11", p: "+1.08%", c: "+13.76%" },
            { w: "Aug 25", p: "+0.73%", c: "+14.59%" },
            { w: "Sep 1", p: "+0.77%", c: "+15.47%" },
            { w: "Sep 15", p: "+0.60%", c: "+16.17%" },
            { w: "Sep 22", p: "+2.06%", c: "+18.56%" },
            { w: "Oct 6", p: "+1.36%", c: "+20.17%" },
            { w: "Oct 13", p: "+1.87%", c: "+22.42%" },
            { w: "Oct 20", p: "+0.55%", c: "+23.09%" },
            { w: "Oct 27", p: "+0.86%", c: "+24.15%" },
            { w: "Nov 10", p: "+2.09%", c: "+26.75%" },
            { w: "Nov 17", p: "+0.72%", c: "+27.66%" },
            { w: "Nov 24", p: "+1.60%", c: "+29.71%" },
            { w: "Dec 1", p: "+0.17%", c: "+29.92%" },
            { w: "Dec 8", p: "+1.53%", c: "+31.91%" },
            { w: "Dec 15", p: "+0.45%", c: "+32.51%" },
            { w: "Dec 22", p: "+0.62%", c: "+33.33%" },
            { w: "Dec 29", p: "+0.51%", c: "+34.01%" },
            { w: "Jan 5", p: "+0.02%", c: "+34.05%" },
            { w: "Jan 12", p: "+0.74%", c: "+35.03%" },
            { w: "Jan 19", p: "+0.24%", c: "+35.36%" },
            { w: "Jan 26", p: "+0.19%", c: "+35.63%" },
            { w: "Feb 2", p: "+0.97%", c: "+36.95%" },
            { w: "Feb 9", p: "+0.31%", c: "+37.38%" },
            { w: "Feb 16", p: "+1.06%", c: "+38.84%" },
            { w: "Feb 23", p: "+0.12%", c: "+39.01%" },
            { w: "Mar 2", p: "+0.23%", c: "+39.33%" },
            { w: "Mar 9", p: "+0.29%", c: "+39.74%" },
            { w: "Mar 16", p: "+0.51%", c: "+40.45%" },
            { w: "Mar 23", p: "+0.03%", c: "+40.49%" },
            { w: "Mar 30", p: "+0.33%", c: "+40.95%" },
            { w: "Apr 6", p: "+0.05%", c: "+41.02%" },
            { w: "Apr 20", p: "+0.09%", c: "+41.14%" },
            { w: "Apr 27", p: "+0.64%", c: "+42.05%" },
            { w: "May 4", p: "+0.18%", c: "+42.31%" },
            { w: "May 11", p: "+0.03%", c: "+42.35%" },
            { w: "May 18", p: "+0.70%", c: "+43.35%" },
            { w: "Jun 1", p: "+4.19%", c: "+49.35%" },
            { w: "Jun 22", p: "+0.90%", c: "+50.70%" },
            { w: "Jul 6", p: "+0.41%", c: "+51.32%" }
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
