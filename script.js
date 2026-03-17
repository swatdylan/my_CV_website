document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Force trigger scroll once to set correct state
    window.dispatchEvent(new Event('scroll'));

    // Chart.js Global Defaults for Modern Finance Theme
    Chart.defaults.color = '#64748b'; // Slate 500
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;

    // Intersection Observer for fade-up animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // Initialize TQQQ ROC Curve Chart
    const rocCtx = document.getElementById('rocCurveChart');
    if (rocCtx) {
        new Chart(rocCtx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'ROC Area = 0.7817',
                        data: [
                            {x: 0, y: 0}, {x: 0.02, y: 0.1}, {x: 0.05, y: 0.3}, {x: 0.1, y: 0.45},
                            {x: 0.15, y: 0.55}, {x: 0.2, y: 0.62}, {x: 0.25, y: 0.7}, {x: 0.3, y: 0.75},
                            {x: 0.4, y: 0.8}, {x: 0.5, y: 0.85}, {x: 0.6, y: 0.9}, {x: 0.8, y: 0.95},
                            {x: 1, y: 1}
                        ],
                        borderColor: '#3b82f6', // Calm Blue
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Random Chance',
                        data: [{x: 0, y: 0}, {x: 1, y: 1}],
                        borderColor: '#cbd5e1', // Light slate
                        borderDash: [5, 5],
                        borderWidth: 1.5,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: { display: true, text: 'False Alarm Rate', font: { weight: '600', size: 11 } },
                        min: 0,
                        max: 1,
                        grid: { color: 'rgba(0, 0, 0, 0.03)' }
                    },
                    y: {
                        title: { display: true, text: 'Capture Rate (Breach)', font: { weight: '600', size: 11 } },
                        min: 0,
                        max: 1,
                        grid: { color: 'rgba(0, 0, 0, 0.03)' }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 20, font: { size: 11, weight: '500' } }
                    }
                }
            }
        });
    }

    // Initialize TQQQ Performance Chart (Radar Chart)
    const tqqqCtx = document.getElementById('tqqqPerformanceChart');
    if (tqqqCtx) {
        new Chart(tqqqCtx, {
            type: 'radar',
            data: {
                labels: [
                    'ROC AUC',
                    'Accuracy',
                    'Breach Precision',
                    'Hold Precision',
                    'Calibration (Brier)',
                    'Generalizability'
                ],
                datasets: [{
                    label: 'Risk Parameters',
                    data: [0.78, 0.72, 0.68, 0.75, 0.81, 0.90],
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0, 0, 0, 0.05)' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        pointLabels: {
                            color: '#475569',
                            font: { size: 11, weight: '600' }
                        },
                        ticks: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 1
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Initialize Options Return Chart (Line Chart)
    const optionsCtx = document.getElementById('optionsReturnChart');
    if (optionsCtx) {
        new Chart(optionsCtx, {
            type: 'line',
            data: {
                labels: [
                    "Apr '25", "May '25", "Jun '25", "Jul '25", "Aug '25", "Sep '25", 
                    "Oct '25", "Nov '25", "Dec '25", "Jan '26", "Feb '26", "Mar '26"
                ],
                datasets: [
                    {
                        label: 'Market-Neutral Alpha Strategy',
                        data: [1.86, 5.77, 9.37, 11.36, 14.59, 18.56, 24.15, 29.70, 34.01, 35.63, 39.01, 39.57],
                        fill: true,
                        backgroundColor: 'rgba(16, 185, 129, 0.05)', 
                        borderColor: '#10b981',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.3
                    },
                    {
                        label: 'S&P 500 Benchmark',
                        data: [8.22, 12.30, 18.14, 20.44, 23.73, 26.58, 26.68, 28.78, 30.21, 32.03, 30.84, 30.88],
                        fill: false,
                        borderColor: '#94a3b8',
                        borderWidth: 1.5,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '+' + value + '%';
                            },
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.03)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 20,
                            font: { weight: '500' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': +' + context.parsed.y + '%';
                            }
                        }
                    }
                }
            }
        });
    }
});
