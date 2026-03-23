document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded: Initializing scripts...");

    // --- 1. CORE ANIMATIONS ---
    const navbar = document.querySelector('.navbar');
    const progressBar = document.getElementById('progress-bar');
    
    window.addEventListener('scroll', () => {
        if (navbar && window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else if (navbar) {
            navbar.classList.remove('scrolled');
        }
        
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";
    });
    
    // Reveal Animations - FIXED to work for all sections
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // This searches for any counters inside the element being revealed
                const counters = entry.target.querySelectorAll('.hero-stat-value');
                counters.forEach(c => {
                    const targetStr = c.getAttribute('data-target');
                    if (targetStr) {
                        const target = parseFloat(targetStr);
                        animateValue(c, 0, target, 2000);
                    }
                });
                
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Scramble effect
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.chars[Math.floor(Math.random() * this.chars.length)];
                        this.queue[i].char = char;
                    }
                    output += `<span class="mono" style="color: var(--accent-cyan);">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
    }

    const scrambleName = document.getElementById('scramble-name');
    if (scrambleName) {
        const fx = new TextScramble(scrambleName);
        fx.setText("DYLAN\nANG KAI HAO");
    }

    // Typewriter
    const typewriter = document.getElementById('typewriter');
    if (typewriter) {
        const phrases = ['Quantitative Researcher', 'ML Systems Builder', 'Options Strategist', 'NUS Philosophy Graduate'];
        let i = 0, j = 0, currentPhrase = [], isDeleting = false, isEnd = false;
        function loop() {
            isEnd = false;
            if (i < phrases.length) {
                if (!isDeleting && j <= phrases[i].length) {
                    currentPhrase.push(phrases[i][j]); j++;
                    typewriter.innerHTML = currentPhrase.join('') + '<span style="color: var(--accent-cyan);">|</span>';
                }
                if (isDeleting && j <= phrases[i].length) {
                    currentPhrase.pop(); j--;
                    typewriter.innerHTML = currentPhrase.join('') + '<span style="color: var(--accent-cyan);">|</span>';
                }
                if (j == phrases[i].length) { isEnd = true; isDeleting = true; }
                if (isDeleting && j == 0) { currentPhrase = []; isDeleting = false; i++; if (i == phrases.length) i = 0; }
            }
            const time = isEnd ? 2000 : isDeleting ? 50 : 150;
            setTimeout(loop, time);
        }
        loop();
    }

    // --- 2. STAT COUNTERS ---
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            let val = progress * (end - start) + start;
            
            // Formatting Logic
            if (obj.innerText.includes('%')) {
                obj.innerText = '+' + val.toFixed(2) + '%';
            } else if (obj.getAttribute('data-target') === '6.13') {
                obj.innerText = val.toFixed(2); // Displays as 6.13
            } else if (obj.getAttribute('data-target').includes('.')) {
                obj.innerText = val.toFixed(4);
            } else {
                obj.innerText = Math.floor(val);
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            // ... existing animation code ...
            } else {
                const target = obj.getAttribute('data-target');
                if (target === '40.27') obj.innerText = '+40.27%';
                else if (target === '100') obj.innerText = '100%';
                else if (target === '6.13') obj.innerText = '6.13'; // Ensure this line exists
                else if (target === '72') obj.innerText = '72%';
                else if (target === '0.7817') obj.innerText = '0.7817';
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // --- 3. CHART.JS IMPLEMENTATIONS ---
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
                        borderColor: '#00f5ff',
                        backgroundColor: 'rgba(0, 245, 255, 0.1)',
                        borderWidth: 3,
                        pointRadius: 0,
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Random',
                        showLine: true,
                        data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { type: 'linear', min: 0, max: 1, grid: { color: 'rgba(255, 255, 255, 0.04)' } },
                        y: { type: 'linear', min: 0, max: 1, grid: { color: 'rgba(255, 255, 255, 0.04)' } }
                    },
                    plugins: { legend: { labels: { color: '#f0f4ff', usePointStyle: true } } }
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
                        backgroundColor: 'rgba(0, 245, 255, 0.3)',
                        borderColor: '#00f5ff',
                        borderWidth: 3,
                        pointRadius: 6,
                        pointBackgroundColor: '#00f5ff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        r: {
                            min: 0, max: 1,
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { display: false },
                            pointLabels: { 
                                color: '#f0f4ff', 
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
                                ctx.fillStyle = '#00f5ff';
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

        // Equity Curve
        const returnCtx = document.getElementById('optionsReturnChart');
        if (returnCtx) {
            new Chart(returnCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ["Apr '25", "May '25", "Jun '25", "Jul '25", "Aug '25", "Sep '25", "Oct '25", "Nov '25", "Dec '25", "Jan '26", "Feb '26", "Mar '26"],
                    datasets: [{
                        label: 'Options Alpha Strategy',
                        data: [1.86, 5.77, 9.37, 11.36, 14.59, 18.56, 24.15, 29.70, 34.01, 35.63, 39.01, 42.27],
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        borderWidth: 3,
                        tension: 0.3,
                        fill: true
                    }, {
                        label: 'S&P 500 (Benchmark)',
                        data: [8.22, 12.30, 18.14, 20.44, 23.73, 26.58, 26.68, 28.78, 30.21, 32.03, 30.84, 30.88],
                        borderColor: 'rgba(255, 255, 255, 0.25)',
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
                        y: { beginAtZero: true, ticks: { callback: v => '+' + v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                        x: { grid: { display: false } }
                    },
                    plugins: { legend: { position: 'top', labels: { color: '#f0f4ff', usePointStyle: true } } }
                }
            });
        }
        
        // Populate Table
        const tableBody = document.getElementById('performance-body');
        if (tableBody) {
            const perfData = [
                { m: "Apr '25", p: "+1.86%", c: "+1.86%" },
                { m: "May '25", p: "+3.91%", c: "+5.77%" },
                { m: "Jun '25", p: "+3.60%", c: "+9.37%" },
                { m: "Jul '25", p: "+1.99%", c: "+11.36%" },
                { m: "Aug '25", p: "+3.23%", c: "+14.59%" },
                { m: "Sep '25", p: "+3.97%", c: "+18.56%" },
                { m: "Oct '25", p: "+5.59%", c: "+24.15%" },
                { m: "Nov '25", p: "+5.55%", c: "+29.70%" },
                { m: "Dec '25", p: "+4.31%", c: "+34.01%" },
                { m: "Jan '26", p: "+1.62%", c: "+35.63%" },
                { m: "Feb '26", p: "+3.38%", c: "+39.01%" },
                { m: "Mar '26", p: "+1.26%", c: "+40.27%" }
            ];
            tableBody.innerHTML = '';
            perfData.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${row.m}</td><td class="val-green">${row.p}</td><td class="val-green">${row.c}</td>`;
                tableBody.appendChild(tr);
            });
        }
    }

    // Initialize charts
    initCharts();

    // Mobile Menu
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
    }

    // Cursor Glow
    const glow = document.getElementById('cursor-glow');
    if (glow && !window.matchMedia('(hover: none)').matches) {
        window.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }
});
