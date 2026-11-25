// Decorative animated wireframe "ocean" behind the page (made-up surface, no data).
// Still for "reduce motion", fewer points on small screens, paused when the tab is hidden.
(() => {
    const cv = document.getElementById('oceanCanvas');
    const ctx = cv && cv.getContext('2d');
    if (!ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const horizon = 0.46, par = 0, FPS = 24, RES = 0.75;
    let W = 0, H = 0, small = false, last = 0, prog = 0;

    const sprite = (r, rgb, soft) => {
        const s = document.createElement('canvas'), n = Math.ceil(r * 2 + 4); s.width = s.height = n;
        const c = s.getContext('2d'), g = c.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, r);
        g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(Math.max(0.05, 1 - soft), `rgba(${rgb},0.55)`); g.addColorStop(1, `rgba(${rgb},0)`);
        c.fillStyle = g; c.beginPath(); c.arc(n / 2, n / 2, r, 0, 7); c.fill(); return s;
    };
    const size = () => {
        W = cv.clientWidth; H = cv.clientHeight;
        cv.width = Math.max(1, Math.round(W * RES)); cv.height = Math.max(1, Math.round(H * RES));
        ctx.setTransform(RES, 0, 0, RES, 0, 0); small = W < 700;
    };

    const ZN = 760, ZF = 5200, ZFOCUS = 1800, CAMH = 360, XS = 3000, AMP = 1.6;
    // surface height at (x, z) at time t: slow swells, a ridge, and fine ripple. Everything drifts toward the viewer.
    const hgt = (x, z, t) => {
      const zz = z + t * 34;
      return AMP * (44 * Math.sin(x * 0.0030 + zz * 0.0016 + t * 0.28) + 30 * Math.sin(x * 0.0062 - zz * 0.0026 + t * 0.38 + 1.7)
        + 9 * Math.sin(x * 0.0125 + zz * 0.0052 - t * 0.5 + 3.1) + 3 * Math.sin(x * 0.024 - zz * 0.009 + t * 0.6)
        + 26 * (1 - Math.abs(Math.sin(x * 0.0041 + zz * 0.0021 + t * 0.18))) - 13);
    };
    const isDark = () => { const t = document.documentElement.getAttribute("data-theme"); return t === "dark" || (t !== "light" && matchMedia("(prefers-color-scheme: dark)").matches); };
    const PAL = {
      dark: { b0: "#070b11", b1: "#0a1019", b2: "#080d14", haze: "70,110,160", hazeA: 0.07, line: "121,170,220", cross: "100,150,205", node: "135,185,230", hi: "190,220,245", dust: "130,170,210", comp: "lighter", k: 0.5 },
      light: { b0: "#ffffff", b1: "#e9f1ff", b2: "#f4f8ff", haze: "90,150,255", hazeA: 0.2, line: "25,75,200", cross: "35,90,210", node: "35,100,235", hi: "20,65,195", dust: "70,130,235", comp: "source-over", k: 1.55 },
    };
    const sprites = new Map();
    const spr = (r, rgb, soft) => { const k = `${Math.round(r * 2)}|${rgb}|${soft}`; let s = sprites.get(k); if (!s) { s = sprite(Math.max(1.5, Math.round(r * 2) / 2), rgb, soft); sprites.set(k, s); } return s; };
    const rnd = (() => { let s = 91; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const dust = Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd() * 0.62, r: 1 + rnd() * 5.5, a: 0.06 + rnd() * 0.2, p: rnd() * 6.28, sp: 0.03 + rnd() * 0.06 }));

    const draw = (t) => {
      const NX = small ? 64 : 128, NZ = small ? 30 : 48, f = W * 0.86, hy = H * horizon + par + (prog - 0.5) * H * 0.09, camH = CAMH * (1 + (prog - 0.5) * 0.2), xs = (prog - 0.5) * 420;      /* scrolling only nudges the camera a little, as if the ocean were far away */
      const C = isDark() ? PAL.dark : PAL.light;
      const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, C.b0); bg.addColorStop(horizon, C.b1); bg.addColorStop(1, C.b2);
      ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      // distant haze at the horizon
      const hz = ctx.createRadialGradient(W * 0.72, hy, 0, W * 0.72, hy, W * 0.55); hz.addColorStop(0, `rgba(${C.haze},${C.hazeA})`); hz.addColorStop(1, `rgba(${C.haze},0)`);
      ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = C.comp;
      // floating bokeh dust in the dark upper half
      for (const d of dust) { const x = (d.x + Math.sin(t * d.sp + d.p) * 0.015) * W, y = (d.y + Math.cos(t * d.sp * 0.8 + d.p) * 0.012) * H; const s = spr(d.r, C.dust, 0.7); ctx.globalAlpha = d.a * (0.7 + 0.3 * Math.sin(t * 0.4 + d.p)); ctx.drawImage(s, x - s.width / 2, y - s.height / 2); }
      // project the grid, far to near
      const P = [];
      for (let j = 0; j <= NZ; j++) {
        const z = ZN * Math.pow(ZF / ZN, j / NZ), row = [];
        for (let i = 0; i <= NX; i++) { const x = (i / NX * 2 - 1) * XS, hh = hgt(x, z, t); row.push({ x: W / 2 + (x - 120 - xs) * f / z, y: hy + (camH - hh) * f / z, h: hh, z }); }
        P.push(row);
      }
      ctx.lineJoin = "round";
      for (let j = NZ; j >= 0; j--) {
        const row = P[j], d = j / NZ; // d: 0 near .. 1 far
        const la = 0.14 + 0.5 * Math.pow(Math.max(0, 1 - Math.abs(d - 0.4) * 1.2), 1.1);        // brightest around the focus band
        ctx.lineWidth = 0.45 + (1 - d) * 0.5; ctx.strokeStyle = `rgba(${C.line},${Math.max(0.05, la * C.k)})`; ctx.globalAlpha = 1;
        ctx.beginPath(); row.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
        if (j > 0) {                                                                    // cross lines to the nearer row
          const near = P[j - 1], step = small ? 4 : 3; ctx.strokeStyle = `rgba(${C.cross},${Math.max(0.04, la * 0.6 * C.k)})`; ctx.beginPath();
          for (let i = 0; i <= NX; i += step) { ctx.moveTo(row[i].x, row[i].y); ctx.lineTo(near[i].x, near[i].y); } ctx.stroke();
        }
        // nodes with depth of field
        const step = small ? 4 : 3;
        for (let i = (j % 3); i <= NX; i += step) {
          const p = row[i]; if (p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40) continue;
          const coc = Math.min(1, Math.abs(p.z - ZFOCUS) / ZFOCUS), crest = Math.max(0, Math.min(1.2, (p.h / AMP + 40) / 110));
          const r = 0.9 + coc * (small ? 4.5 : 7) + crest * 0.8, soft = coc > 0.35 ? 0.85 : 0.35;
          const a = (0.28 + 0.7 * crest) * (1 - coc * 0.5) * (0.65 + 0.35 * Math.sin(t * 0.7 + i * 0.9 + j));
          const s = spr(r, crest > 0.55 ? C.hi : C.node, soft); ctx.globalAlpha = Math.max(0, Math.min(1, a * C.k));
          ctx.drawImage(s, p.x - s.width / 2, p.y - s.height / 2);
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    };

    let t = 6;
    const frame = now => {
        requestAnimationFrame(frame);
        if (motion.matches || document.hidden || now - last < 1000 / FPS) return;
        last = now; t = now / 1000 * 0.55; draw(t);
    };
    const repaint = () => draw(t);
    const onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        prog = max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0.5;
        if (motion.matches) repaint();
    };
    size(); onScroll(); repaint();
    new ResizeObserver(() => { size(); repaint(); }).observe(cv);
    addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('themechange', repaint);
    requestAnimationFrame(frame);
})();
