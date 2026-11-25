// Light / dark / system toggle. Dark is the default; the choice is remembered in this browser only.
// index.html applies the saved choice before the page paints, so there is no flash.
(() => {
    const ORDER = ['light', 'dark', 'system'];
    const svg = body => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
    const ICON = {
        light: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'),
        dark: svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
        system: svg('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>')
    };
    const root = document.documentElement;
    const button = document.getElementById('themeToggle');
    const meta = document.querySelector('meta[name="theme-color"]');
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    let pref = 'dark';
    try { const v = localStorage.getItem('theme'); if (ORDER.includes(v)) pref = v; } catch (e) { /* storage blocked: stay on dark */ }

    function apply() {
        if (pref === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', pref);
        button.innerHTML = ICON[pref];
        button.setAttribute('aria-label', `Theme: ${pref}. Click to switch.`);
        meta.content = getComputedStyle(root).getPropertyValue('--background').trim();
        document.dispatchEvent(new Event('themechange'));
    }
    button.addEventListener('click', () => {
        pref = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
        try { localStorage.setItem('theme', pref); } catch (e) { /* not remembered */ }
        apply();
    });
    system.addEventListener('change', () => { if (pref === 'system') apply(); });
    apply();
})();
