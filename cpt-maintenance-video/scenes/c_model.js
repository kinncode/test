// Chapters 6–8 · 論文的人為決策模型 / 案例與理性最佳解 / 風險態度的影響
// scenes: thesisvf, thesisw, pvmodel, solve, case, expopt, sensitivity, params, seeking, aversion, asym, table44, realcost
(() => {
  // ------------------------------------------------------------------ local helpers
  const COL = { ink: '#1f2430', mute: '#6b7280', blue: '#2563eb', orange: '#e2860b', red: '#d9412e', teal: '#0f9d8a', green: '#2e9e4f', purple: '#7c4ddb', lam: '#8a6200', yellow: '#d9a400' };
  const tc = (c, src) => `\\textcolor{${COL[c] || c}}{${src}}`;
  const TX = (src, size, disp = false) => `<span style="font-size:${size}px">${tex(src, disp)}</span>`;
  const fmt = v => Math.round(v).toLocaleString('en-US');
  const fmt1 = v => v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const layer = root => h('div', { class: 'abs', style: { left: '0px', top: '0px', width: W + 'px', height: H + 'px' } }, root);
  const heading = (root, html) => box(root, 150, 108, { class: 'h2', html });
  const tagB = (root, x, y, html, cls = 't-gray', anchor = 'tl', st = {}) => { const e = box(root, x, y, { class: 'tag ' + cls, html }, anchor); Object.assign(e.style, st); return e; };
  const setAnchor = (el, a) => { el._anchor = a; el.style.transform = a; return el; };
  const mini = txt => `<span class="tag t-gray" style="font-size:20px;padding:2px 10px;vertical-align:middle">${txt}</span>`;
  const SHI = mini('示意'), RECALC = mini('我們重算');
  // loss-aversion λ: always a lone λ on a yellow chip
  const LAM = (fs = 30) => `<span class="tag" style="background:#fcefc2;color:${COL.lam};padding:0 10px;font-size:${fs}px;font-family:KaTeX_Math,serif;font-style:italic;font-weight:400;vertical-align:baseline">λ</span>`;
  const LAMK = `\\colorbox{#fcefc2}{$\\textcolor{${COL.lam}}{\\lambda}$}`; // inside KaTeX
  const WA = 425.31, WB = 2.88, CP = 2755500, CC = 9205500;
  const Rw = x => Math.exp(-Math.pow(x / WA, WB));
  const wgt = (p, g) => { if (p <= 0) return 0; const a = Math.pow(p, g), b = Math.pow(1 - p, g); return a / Math.pow(a + b, 1 / g); };
  // E[C_ave(τ)] (式 3.4) on a fine grid, cumulative trapezoid of R
  const ECOST = (() => {
    const dt = .05, n = Math.round(320 / dt); const cum = new Float64Array(n + 1);
    for (let i = 1; i <= n; i++) cum[i] = cum[i - 1] + (Rw((i - 1) * dt) + Rw(i * dt)) / 2 * dt;
    return tau => { const i = Math.round(tau / dt); const R = Rw(tau); return ((1 - R) * CC + R * CP) / cum[i]; };
  })();
  const cross = (g, x, y, r, o = {}) => path(g, `M${x - r} ${y - r} L${x + r} ${y + r} M${x + r} ${y - r} L${x - r} ${y + r}`, { stroke: o.stroke || 'var(--red)', w: o.w ?? 6 });
  const check = (g, x, y, r, o = {}) => path(g, `M${x - r} ${y} L${x - r * .3} ${y + r * .7} L${x + r} ${y - r * .8}`, { stroke: o.stroke || 'var(--green)', w: o.w ?? 6 });
  const rrect = (g, x, y, w, hh, o = {}) => {
    const r = o.r ?? 12;
    return path(g, `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + hh - r} Q${x + w} ${y + hh} ${x + w - r} ${y + hh} H${x + r} Q${x} ${y + hh} ${x} ${y + hh - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`,
      { stroke: o.stroke || 'var(--red)', w: o.w ?? 5, fill: o.fill || 'none', dash: o.dash });
  };
  const ell = (g, cx, cy, rx, ry, o = {}) => path(g, `M${cx + rx} ${cy} A${rx} ${ry} 0 1 1 ${cx - rx} ${cy} A${rx} ${ry} 0 1 1 ${cx + rx} ${cy}`, { stroke: o.stroke || 'var(--red)', w: o.w ?? 5, fill: o.fill || 'none' });
  // math-style text in SVG
  const mt = (g, x, y, str, o = {}) => { const e = svgText(g, x, y, str, { size: o.size || 30, fill: o.fill || 'var(--ink)', anchor: o.anchor, weight: 400 }); e.style.fontFamily = 'KaTeX_Math, serif'; return e; };
  const nt = (g, x, y, str, o = {}) => { const e = svgText(g, x, y, str, { size: o.size || 22, fill: o.fill || 'var(--mute)', anchor: o.anchor, weight: o.weight || 600 }); e.style.fontFamily = 'Inter, sans-serif'; return e; };
  // figure card geometry: map natural-image px → stage px (anchor 'tl')
  const figMap = (x, y, w, nw) => { const k = (w - 34) / nw; return { k, X: px => x + 17 + px * k, Y: py => y + 17 + py * k }; };
  // zoomed crop of a thesis figure (natural-px rect [x0,y0,x1,y1]) shown at width w
  function zoomCrop(root, x, y, w, src, rect, o = {}) {
    const [x0, y0, x1, y1] = rect, k = w / (x1 - x0), hh = (y1 - y0) * k;
    const el = box(root, x, y, {});
    Object.assign(el.style, { width: w + 'px', height: hh + 'px', overflow: 'hidden', background: '#fff', border: `4px solid ${o.color || 'var(--yellow)'}`, borderRadius: '14px', boxShadow: '7px 7px 0 rgba(31,36,48,.14)', boxSizing: 'content-box' });
    const im = h('img', { src }, el);
    Object.assign(im.style, { position: 'absolute', left: (-x0 * k) + 'px', top: (-y0 * k) + 'px', width: (o.nw * k) + 'px', maxWidth: 'none' });
    el._h = hh; el._k = k;
    return el;
  }
  // count with thousands separators
  const countFmt = (el, v0, v1, t, t0, d, dec = 0, pre = '', suf = '') => {
    const v = lerp(v0, v1, Ease.out(P(t, t0, d)));
    el.textContent = pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
  };
  // horizontal bar (rect) grows from x to x+len
  const hbar = (g, x, y, len, hh, fill, o = {}) => { const r = s('rect', { x, y: y - hh / 2, width: 0, height: hh, rx: o.rx ?? 6, fill }, g); r._len = len; return r; };
  const growH = (r, t, t0, d = .8) => { const p = Ease.out(P(t, t0, d)); r.setAttribute('width', Math.max(0, r._len * p)); r.style.opacity = p > 0 ? 1 : 0; return p; };
  // container transform helper (scale about an origin + translate)
  const xform = (el, ox, oy, k, dx, dy) => { el.style.transformOrigin = `${ox}px ${oy}px`; el.style.transform = `translate(${dx}px,${dy}px) scale(${k})`; };
  // small wind-turbine glyph
  function turbineGlyph(g, cx, cy, r, color) {
    const grp = s('g', {}, g);
    line(grp, cx, cy, cx, cy + r * 1.25, { stroke: color, w: 3 });
    for (let i = 0; i < 3; i++) {
      const a = (-90 + i * 120) * Math.PI / 180;
      line(grp, cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, { stroke: color, w: 3.2 });
    }
    s('circle', { cx, cy, r: 3.2, fill: color }, grp);
    return grp;
  }

  // ================================================================== thesisvf
  scene('thesisvf', (root, c) => {
    const hdA = heading(root, '價值函數放進成本：主觀成本 <span style="font-family:KaTeX_Math,serif;font-style:italic">ν</span>(<span class="en">C</span>)');
    const hdB = heading(root, '論文的 δ 約定：尋求還是規避？');

    // ---------- phase A (c0–c1)
    const A = layer(root), gA = svgLayer(A);
    const k1 = card(A, 150, 200, 820, 0, { pad: 26 });
    k1.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><span class="h3" style="font-size:32px">價值函數（論文）</span><span class="tag t-gray">式 (3.8)</span></div>
      <div style="display:flex;align-items:center;margin-top:8px">
        <div>${TX('\\nu(x)=', 46)}</div>
        <div class="brace" style="margin:0 8px 0 6px"></div>
        <div>
          <div style="display:flex;align-items:center;gap:26px;height:70px">${TX('x^{\\delta_1}', 46)}<span class="small">x ≥ 0　獲利</span></div>
          <div class="k1loss" style="display:flex;align-items:center;gap:26px;height:70px"><span class="hl" style="padding:0 8px">${TX('-', 46)}${LAM(40)}${TX('\\cdot(-x)^{\\delta_2}', 46)}</span><span class="small" style="color:var(--red);font-weight:700">x &lt; 0　損失</span></div>
        </div>
      </div>
      <div class="small" style="margin-top:6px">${LAM(22)} 損失規避係數　·　δ<sub>1</sub>、δ<sub>2</sub>：價值函數的曲率</div>`;
    { const bs = miniSvg(k1.querySelector('.brace'), 34, 150); path(bs, 'M30 4 Q14 4 14 22 L14 60 Q14 75 3 75 Q14 75 14 90 L14 128 Q14 146 30 146', { w: 3.5 }); }

    // number line: costs are losses
    const NL = { x0: 1050, x1: 1760, zx: 1660, y: 320, k: 58 };
    const nl = s('g', {}, gA);
    s('rect', { x: NL.x0, y: NL.y - 60, width: NL.zx - NL.x0, height: 60, fill: 'var(--red-soft)', opacity: .7 }, nl);
    line(nl, NL.x0, NL.y, NL.x1, NL.y, { w: 3.5 });
    line(nl, NL.zx, NL.y - 18, NL.zx, NL.y + 18, { w: 4 });
    svgText(nl, NL.zx, NL.y + 44, '0', { size: 28, family: 'Inter' });
    svgText(nl, NL.zx, NL.y + 78, '參考點', { size: 24, fill: 'var(--blue)' });
    svgText(nl, NL.x0 + 14, NL.y - 30, '← 損失', { size: 26, anchor: 'start', fill: 'var(--red)' });
    svgText(nl, NL.x1, NL.y - 30, '獲利 →', { size: 22, anchor: 'end', fill: 'var(--mute)', weight: 500 });
    const xCp = NL.zx - 2.7555 * NL.k, xCc = NL.zx - 9.2055 * NL.k;
    const pCp = s('g', {}, gA), pCc = s('g', {}, gA);
    s('circle', { cx: xCp, cy: NL.y, r: 11, fill: 'var(--teal)' }, pCp);
    s('circle', { cx: xCc, cy: NL.y, r: 11, fill: 'var(--red)' }, pCc);
    const lCp = box(A, xCp, NL.y + 46, { html: TX(tc('teal', '-C_p'), 32) }, 'c'), lCc = box(A, xCc, NL.y + 46, { html: TX(tc('red', '-C_c'), 32) }, 'c');
    const nlTitle = box(A, 1050, 200, { class: 'body', html: '論文隱含：以 <b>0</b> 為參考點，<b style="color:var(--red)">成本全算損失</b>', style: { fontSize: '28px' } });
    const steps = [
      box(A, 1050, 440, { html: `① 代入損失那一行：${TX('\\nu(-C)=-' + LAMK + '\\,C^{\\delta}', 34)}`, style: { fontSize: '27px' } }),
      box(A, 1050, 510, { html: `② 取絕對值 ⇒ 成本的「感受」為正數`, style: { fontSize: '27px' } }),
    ];
    const arrAB = arrow(gA, 560, 502, 560, 590, { w: 4, head: 16, stroke: 'var(--mute)' });
    const k2 = card(A, 150, 600, 1620, 0, { pad: 24, style: { borderColor: 'var(--orange)' } });
    k2.innerHTML = `<div style="display:flex;align-items:center;gap:40px">
        <div class="h3" style="font-size:34px;white-space:nowrap">主觀成本</div>
        <div>${TX('\\nu(C)=', 58)}${LAM(50)}${TX('\\cdot\\,C^{\\,\\delta}', 58)}</div>
        <div style="margin-left:auto;text-align:right;line-height:1.5"><span class="tag t-gray">依論文圖表數值反推</span><br><span class="tag t-gray">我們重算：可完全重現 Table 4.4</span></div>
      </div>`;

    // ---------- phase B (c2–c4)
    const B = layer(root), B1 = layer(B);
    const FX = 410, FY = 190, FW = 1100;
    const fig = figCard(B1, FX, FY, FW, 'assets/fig3_6.png', '論文 Fig. 3.6：δ1、δ2 與風險行為的關係');
    const gB1 = svgLayer(B1), gB = svgLayer(B);
    const fm = figMap(FX, FY, FW, 1157);
    const ovL = rrect(gB1, fm.X(200), fm.Y(40), (462 - 200) * fm.k, 58 * fm.k, { stroke: 'var(--orange)', fill: 'rgba(226,134,11,.16)', w: 4, r: 8 });
    const ovR = rrect(gB1, fm.X(674), fm.Y(40), (938 - 674) * fm.k, 58 * fm.k, { stroke: 'var(--purple)', fill: 'rgba(124,77,219,.14)', w: 4, r: 8 });
    const lbY = 392;
    const lb = [
      tagB(B1, fm.X(330), lbY, 'δ &lt; 1　風險尋求', 't-orange', 'c', { fontSize: '28px' }),
      tagB(B1, fm.X(567), lbY, 'δ = 1　中性', 't-blue', 'c', { fontSize: '28px' }),
      tagB(B1, fm.X(806), lbY, 'δ &gt; 1　風險規避', 't-purple', 'c', { fontSize: '28px' }),
    ];
    // c3 chart (illustrative exaggerated δ)
    const ch = chart(gB, 250, 520, 560, 290, { xmin: 0, xmax: 10, ymin: 0, ymax: 16, xticks: [0, 5, 10], yticks: [0, 5, 10, 15], xlabel: '實際成本（示意單位）', ylabel: '感受到的成本' });
    const xs = Array.from({ length: 101 }, (_, i) => i / 10);
    const cvB = ch.plot(xs, xs.map(v => v), { color: 'var(--blue)', w: 4.5 });
    const cvP = ch.plot(xs, xs.map(v => Math.pow(v, 1.2)), { color: 'var(--purple)', w: 5 });
    const cvO = ch.plot(xs, xs.map(v => Math.pow(v, .8)), { color: 'var(--orange)', w: 5 });
    const aUp = arrow(gB, ch.X(10) + 22, ch.Y(10), ch.X(10) + 22, ch.Y(15.85) + 4, { stroke: 'var(--purple)', w: 4, head: 14 });
    const aDn = arrow(gB, ch.X(10) + 22, ch.Y(10), ch.X(10) + 22, ch.Y(6.31) - 4, { stroke: 'var(--orange)', w: 4, head: 14 });
    const cl = [
      box(B, ch.X(10) + 42, ch.Y(15.85), { html: '<b>δ = 1.2</b>　大額被<b>放大</b>', style: { fontSize: '25px', color: 'var(--purple)' } }, 'cl'),
      box(B, ch.X(10) + 42, ch.Y(10), { html: '<b>δ = 1</b>　不變', style: { fontSize: '25px', color: 'var(--blue)' } }, 'cl'),
      box(B, ch.X(10) + 42, ch.Y(6.31), { html: '<b>δ = 0.8</b>　大額被<b>縮小</b>', style: { fontSize: '25px', color: 'var(--orange)' } }, 'cl'),
    ];
    const shi = box(B, 270, 520, { html: `${SHI} <span class="small" style="font-size:21px">誇大 δ（0.8／1.2）以便看清</span>` });
    // c4 comparison
    const cmp = card(B, 1180, 470, 590, 0, { pad: 22, style: { borderColor: 'var(--red)' } });
    cmp.innerHTML = `<div class="h3" style="font-size:30px">⚠ 和標準 CPT 的約定不同</div>
      <table class="tb" style="font-size:24px;margin-top:6px;width:100%">
        <tr><th style="padding:8px 6px"></th><th style="padding:8px 6px">標準 CPT</th><th style="padding:8px 6px">論文約定</th></tr>
        <tr class="r1"><td style="padding:8px 6px;font-weight:700">獲利區 δ<sub>1</sub>&lt;1</td><td style="padding:8px 6px">凹 → <b>規避</b></td><td style="padding:8px 6px"><b class="c-orange">尋求</b> <span class="c-red" style="font-weight:700">✗ 相反</span></td></tr>
        <tr class="r2"><td style="padding:8px 6px;font-weight:700">損失區 δ<sub>2</sub>&lt;1</td><td style="padding:8px 6px">凸 → <b>尋求</b></td><td style="padding:8px 6px"><b class="c-orange">尋求</b> <span class="c-green" style="font-weight:700">✓ 一致</span></td></tr>
      </table>
      <div class="r3" style="margin-top:12px;font-size:25px;font-weight:700;color:var(--green);white-space:normal">論文對 δ<sub>1</sub>、δ<sub>2</sub> 都用此約定；成本全是「損失」，所以只有套在成本上才說得通</div>`;
    const r1 = cmp.querySelector('.r1'), r2 = cmp.querySelector('.r2'), r3 = cmp.querySelector('.r3');

    return t => {
      const tB = c.c(2) - .2;
      opacity(hdA, Math.min(P(t, c.c(0) - .1, .5), 1 - P(t, tB, .5)));
      show(hdB, t, tB + .3, .6);
      opacity(A, 1 - P(t, tB, .5));
      // c0
      show(k1, t, c.c(0) + .1, .7);
      const lossRow = k1.querySelector('.k1loss');
      lossRow.style.opacity = .25 + .75 * P(t, c.c(0) + 2.5, .6);
      // c1
      show(nlTitle, t, c.c(1), .6);
      show(nl, t, c.c(1) + .3, .6, { dy: 0 });
      pop(pCp, t, c.c(1) + 1.6, .5); pop(pCc, t, c.c(1) + 2.0, .5);
      show(lCp, t, c.c(1) + 1.7, .4, { dy: 0 }); show(lCc, t, c.c(1) + 2.1, .4, { dy: 0 });
      steps.forEach((e, i) => show(e, t, c.c(1) + 3.6 + i * 1.8, .6));
      arrAB.anim(t, c.c(1) + 6.6, .6);
      show(k2, t, c.c(1) + 7.0, .7);
      // phase B
      B1.style.transform = `translateY(${lerp(170, 0, Ease.inOut(P(t, c.c(3) - .5, .8)))}px)`;
      show(fig, t, c.c(2) + .2, .7);
      draw(ovL, t, c.c(2) + 2.6, .6); draw(ovR, t, c.c(2) + 1.4, .6);
      show(lb[2], t, c.c(2) + 1.6, .5); show(lb[0], t, c.c(2) + 2.8, .5); show(lb[1], t, c.c(2) + 4.4, .5);
      ch.anim(t, c.c(3) - .1);
      draw(cvB, t, c.c(3) + .4, .8); draw(cvP, t, c.c(3) + 1.3, 1.0); draw(cvO, t, c.c(3) + 3.6, 1.0);
      show(cl[1], t, c.c(3) + .9, .4, { dy: 0, dx: -10 });
      aUp.anim(t, c.c(3) + 2.2, .5); show(cl[0], t, c.c(3) + 2.4, .4, { dy: 0, dx: -10 });
      aDn.anim(t, c.c(3) + 4.5, .5); show(cl[2], t, c.c(3) + 4.7, .4, { dy: 0, dx: -10 });
      show(shi, t, c.c(3) + .6, .5);
      show(cmp, t, c.c(4) + .1, .6, { dx: 30, dy: 0 });
      r1.style.opacity = P(t, c.c(4) + 2.5, .5); r2.style.opacity = P(t, c.c(4) + 5.0, .5); r3.style.opacity = P(t, c.c(4) + 7.5, .5);
    };
  });

  // ================================================================== thesisw
  scene('thesisw', (root, c) => {
    const hd = heading(root, '機率權重：套在密度 <span style="font-family:KaTeX_Math,serif;font-style:italic">f</span>(<span style="font-family:KaTeX_Math,serif;font-style:italic">t</span>) 上');
    const g = svgLayer(root);
    const fig = figCard(root, 150, 192, 500, 'assets/fig3_7.png', '論文 Fig. 3.7：γ1、γ2 越小，決策偏誤越大');
    // mini w(p) chart
    const mc = chart(g, 760, 215, 220, 190, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, xticks: [0, 1], yticks: [0, 1], grid: false });
    const D0 = D();
    const wDiag = mc.plot(D0.wp, D0.weight['1.0'], { color: 'var(--ink)', w: 3, dash: '8 8' });
    const w61 = mc.plot(D0.wp, D0.weight['0.61'], { color: '#9aa1ad', w: 3.5 });
    const w91 = mc.plot(D0.wp, D0.weight['0.91'], { color: 'var(--orange)', w: 5 });
    const mlab = [
      svgText(g, 760 + 110, 215 + 190 + 44, 'p', { size: 24, fill: 'var(--mute)', weight: 500 }),
      svgText(g, 760 - 16, 196, 'w(p)', { size: 22, fill: 'var(--mute)', weight: 500, anchor: 'start' }),
    ];
    mlab.forEach(e => e.style.fontFamily = 'KaTeX_Math, serif');
    const fcard = card(root, 1060, 196, 710, 0, { pad: 22 });
    fcard.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><span class="h3" style="font-size:30px">倒 S 形機率權重</span></div>
      <div style="margin:2px 0 4px">${TX('w(p)=\\dfrac{p^{\\gamma}}{\\big(p^{\\gamma}+(1-p)^{\\gamma}\\big)^{1/\\gamma}}', 29)}</div>
      <div style="font-size:24px;line-height:1.55">
        <span style="color:var(--mute)">- - -</span> γ = 1：不扭曲　<b class="c-orange">━ γ = 0.91</b>（本案例）　<b style="color:#8b929e">━ γ = 0.61</b><br>
        <b>γ 越小 → 扭曲越大 → 決策偏誤越大</b></div>`;

    // main chart
    const CH = { x: 250, y: 530, w: 940, h: 270 };
    const ch = chart(g, CH.x, CH.y, CH.w, CH.h, { xmin: 0, xmax: 1000, ymin: 0, ymax: .005, xticks: [0, 200, 400, 600, 800, 1000], yticks: [0, .001, .002, .003, .004, .005], fy: v => v ? v.toFixed(3) : '0', xlabel: 't（天）', ylabel: '機率密度（1/天）' });
    const wf = D0.pdf.map(p => wgt(p, .91));
    const TAU = 257;
    // fills under w(f)
    const area = (a, b) => {
      let d = `M${ch.X(a)} ${ch.Y(0)}`;
      for (let i = 0; i < D0.t.length; i++) { const tt = D0.t[i]; if (tt < a || tt > b) continue; d += ` L${ch.X(tt).toFixed(1)} ${ch.Y(wf[i]).toFixed(1)}`; }
      const yb = ch.Y(wgt((WB / WA) * Math.pow(b / WA, WB - 1) * Rw(b), .91));
      return d + ` L${ch.X(b)} ${yb} L${ch.X(b)} ${ch.Y(0)} Z`;
    };
    const aRed = path(g, area(0, TAU), { stroke: 'none', fill: 'rgba(217,65,46,.20)' });
    const aTeal = path(g, area(TAU, 1000), { stroke: 'none', fill: 'rgba(15,157,138,.20)' });
    const cf = ch.plot(D0.t, D0.pdf, { color: 'var(--blue)', w: 4.5 });
    const cw = ch.plot(D0.t, wf, { color: 'var(--orange)', w: 4.5, dash: '12 8' });
    const lgw = s('g', {}, g), lgf = s('g', {}, g);
    line(lgw, ch.X(700), ch.Y(.0041), ch.X(760), ch.Y(.0041), { stroke: 'var(--orange)', w: 4.5, dash: '12 8' });
    line(lgf, ch.X(700), ch.Y(.0033), ch.X(760), ch.Y(.0033), { stroke: 'var(--blue)', w: 4.5 });
    const lw = box(root, ch.X(775), ch.Y(.0041), { html: `${TX(tc('orange', 'w\\big(f(t)\\big)'), 26)} <span class="small">γ = 0.91</span>`, style: { fontSize: '26px' } }, 'cl');
    const lf = box(root, ch.X(775), ch.Y(.0033), { html: `${TX(tc('blue', 'f(t)'), 26)} <span class="small">故障機率密度</span>`, style: { fontSize: '26px' } }, 'cl');
    const pkX = ch.X(367);
    const pk = s('g', {}, g);
    line(pk, pkX, ch.Y(.00267), pkX, ch.Y(.00454) + 8, { stroke: 'var(--mute)', w: 2.5, dash: '5 6' });
    s('circle', { cx: pkX, cy: ch.Y(.00267), r: 7, fill: 'var(--blue)' }, pk);
    s('circle', { cx: pkX, cy: ch.Y(.00454), r: 7, fill: 'var(--orange)' }, pk);
    const vt = ch.vline(TAU, { color: 'var(--ink)', top: -6 });
    const vtl = mt(g, ch.X(TAU), ch.Y(.0) + 0, '', { size: 1 }); const vtlb = box(root, ch.X(TAU) - 10, ch.Y(.0040), { html: TX('\\tau = 257', 26) }, 'cl'); setAnchor(vtlb, 'translate(-100%,-50%) ');
    // integration ranges marked along the top of the plot
    const yr = ch.Y(.00492);
    const rRed = s('g', {}, g), rTeal = s('g', {}, g);
    path(rRed, `M${ch.X(0) + 4} ${yr - 8} V${yr + 8} M${ch.X(0) + 4} ${yr} H${ch.X(TAU) - 4} M${ch.X(TAU) - 4} ${yr - 8} V${yr + 8}`, { stroke: 'var(--red)', w: 3.5 });
    path(rTeal, `M${ch.X(TAU) + 4} ${yr - 8} V${yr + 8} M${ch.X(TAU) + 4} ${yr} H${ch.X(1000)} M${ch.X(1000) - 12} ${yr - 8} L${ch.X(1000)} ${yr} L${ch.X(1000) - 12} ${yr + 8}`, { stroke: 'var(--teal)', w: 3.5 });
    const lRed = box(root, ch.X(TAU / 2), yr + 22, { html: '主觀不可靠度', style: { fontSize: '23px', fontWeight: 700, color: 'var(--red)', background: 'var(--paper)', padding: '0 6px' } }, 'c');
    const lTeal = box(root, ch.X(660), yr + 22, { html: '主觀可靠度（積到 ∞）', style: { fontSize: '23px', fontWeight: 700, color: 'var(--teal)', background: 'var(--paper)', padding: '0 6px' } }, 'c');

    // right panel
    const pc = card(root, 1270, 500, 500, 0, { pad: 20, style: { borderColor: 'var(--orange)' } });
    pc.innerHTML = `<div style="font-size:28px;font-weight:700">權重套在「<span class="hl">密度</span>」上</div>
      <div style="font-size:24px;margin-top:4px">峰值 <b style="color:var(--blue)">0.00267</b> → <b style="color:var(--orange)">0.00454</b> ${RECALC}</div>`;
    const ir = card(root, 1270, 640, 500, 0, { pad: 16, style: { borderColor: 'var(--red)' } });
    ir.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between">${TX(tc('red', '\\int_0^{\\tau} w\\big(f(t)\\big)\\,dt'), 30)}<b style="font-size:27px;color:var(--red)">主觀不可靠度</b></div>`;
    const it = card(root, 1270, 762, 500, 0, { pad: 16, style: { borderColor: 'var(--teal)' } });
    it.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between">${TX(tc('teal', '\\int_{\\tau}^{\\infty} w\\big(f(t)\\big)\\,dt'), 30)}<b style="font-size:27px;color:var(--teal)">主觀可靠度</b></div>`;

    return t => {
      show(hd, t, c.c(0) - .5, .5);
      show(fig, t, c.c(0) + .1, .6);
      mc.anim(t, c.c(0) + .8); mlab.forEach(e => opacity(e, P(t, c.c(0) + 1.2, .4)));
      draw(wDiag, t, c.c(0) + 1.2, .6); draw(w91, t, c.c(0) + 1.8, .8); draw(w61, t, c.c(0) + 3.2, .8);
      show(fcard, t, c.c(0) + 1.0, .6);
      ch.anim(t, c.c(1) - .1);
      draw(cf, t, c.c(1) + .4, 1.0); show(lf, t, c.c(1) + 1.0, .4, { dy: 0 }); show(lgf, t, c.c(1) + 1.0, .4, { dy: 0 });
      draw(cw, t, c.c(1) + 2.0, 1.1); show(lw, t, c.c(1) + 2.8, .4, { dy: 0 }); show(lgw, t, c.c(1) + 2.8, .4, { dy: 0 });
      show(pc, t, c.c(1) + 3.2, .6);
      show(pk, t, c.c(1) + 3.6, .5, { dy: 0 });
      draw(vt, t, c.c(2) + .1, .5); opacity(vtl, 0); show(vtlb, t, c.c(2) + .4, .3, { dy: 0 });
      opacity(aRed, P(t, c.c(2) + .8, .6)); show(lRed, t, c.c(2) + .9, .5, { dy: 0 }); show(rRed, t, c.c(2) + .9, .5, { dy: 0 });
      show(ir, t, c.c(2) + 1.0, .5, { dx: 20, dy: 0 });
      opacity(aTeal, P(t, c.c(2) + 3.0, .6)); show(lTeal, t, c.c(2) + 3.1, .5, { dy: 0 }); show(rTeal, t, c.c(2) + 3.1, .5, { dy: 0 });
      show(it, t, c.c(2) + 3.2, .5, { dx: 20, dy: 0 });
    };
  });

  // ================================================================== pvmodel
  scene('pvmodel', (root, c) => {
    const hd = heading(root, '論文的人為決策模型');
    const FS = 40;
    const SL = { lhs: 606, eq: 640, A: 800, dA: 945, B: 1016, plus: 1112, C: 1282, dC: 1428, D: 1500, bar0: 668, bar1: 1574, den: 1120 };
    // build one fraction formula inside container `el` with vertical center y0; terms: {lhs,A,B,C,D,den}
    function frac(el, y0, terms) {
      const o = {};
      const mk = (k, x, y, src, anchor = 'translate(-50%,-50%) ') => { const b = box(el, x, y, { html: TX(src, FS) }); setAnchor(b, anchor); o[k] = b; return b; };
      mk('lhs', SL.lhs, y0, terms.lhs, 'translate(-100%,-50%) ');
      mk('eq', SL.eq, y0, '=');
      mk('A', SL.A, y0 - 40, terms.A); mk('dA', SL.dA, y0 - 40, '\\cdot'); mk('B', SL.B, y0 - 40, terms.B);
      mk('plus', SL.plus, y0 - 40, '+');
      mk('C', SL.C, y0 - 40, terms.C); mk('dC', SL.dC, y0 - 40, '\\cdot'); mk('D', SL.D, y0 - 40, terms.D);
      mk('den', SL.den, y0 + 44, terms.den);
      const bar = box(el, SL.bar0, y0, {}); Object.assign(bar.style, { width: (SL.bar1 - SL.bar0) + 'px', height: '0px', borderTop: '2.5px solid var(--ink)' });
      o.bar = bar;
      return o;
    }
    const T34 = { lhs: 'E[C_{ave}(\\tau)]', A: tc('red', 'F(\\tau)'), B: tc('red', 'C_c'), C: tc('teal', 'R(\\tau)'), D: tc('teal', 'C_p'), den: '\\int_0^{\\tau} R(t)\\,dt' };
    const T310 = { lhs: tc('orange', 'PV') + '\\big(E[C_{ave}(\\tau)]\\big)', A: tc('red', '\\int_0^{\\tau} w\\big(f(t)\\big)dt'), B: tc('red', '\\nu(C_c)'), C: tc('teal', '\\int_{\\tau}^{\\infty} w\\big(f(t)\\big)dt'), D: tc('teal', '\\nu(C_p)'), den: '\\int_0^{\\tau} R(t)\\,dt' };
    const Y34 = 290, Y310 = 590;
    // 3.4 card
    const G34 = layer(root);
    const c34 = card(G34, 160, Y34 - 105, 1600, 210, { pad: 0, style: { borderColor: 'var(--blue)' } });
    const f34 = frac(G34, Y34, T34);
    const t34 = tagB(G34, 186, Y34 - 92, '式 (3.4)　理性模型', 't-blue', 'tl', { fontSize: '22px' });
    // 3.10 group (moves during c0)
    const G310 = layer(root);
    const c310 = card(G310, 160, Y310 - 105, 1600, 210, { pad: 0, style: { borderColor: 'var(--orange)' } });
    const f310 = frac(G310, Y310, T310);
    const alt = frac(G310, Y310, T34); // morph targets (δ=γ=λ=1)
    const t310 = tagB(G310, 186, Y310 - 92, '式 (3.10)　人為決策模型', 't-orange', 'tl', { fontSize: '22px' });
    const g310 = svgLayer(G310);
    const pvBox = path(g310, `M290 ${Y310 + 30} H352`, { stroke: 'var(--orange)', w: 4 });
    const pvNote = box(G310, 200, Y310 + 140, { html: `<b style="color:var(--orange);font-size:34px">PV＝前景值</b>（Prospect Value）：決策者<span class="hl">「感受到」</span>的平均成本`, style: { fontSize: '30px' } });
    const pvArr = arrow(g310, 321, Y310 + 136, 321, Y310 + 40, { stroke: 'var(--orange)', w: 4, head: 14 });
    // denominators boxed
    const g = svgLayer(root);
    const denB1 = rrect(g, SL.den - 104, Y34 + 12, 208, 66, { stroke: '#9aa1ad', w: 3, dash: '8 7', r: 10 });
    const denB2 = rrect(g, SL.den - 104, Y310 + 12, 208, 66, { stroke: '#9aa1ad', w: 3, dash: '8 7', r: 10 });
    const denL = box(root, SL.den + 120, Y310 + 49, { html: '← 分母維持客觀：平均運轉時間', style: { fontSize: '24px', color: 'var(--mute)', fontWeight: 700 } }, 'cl');
    // mapping arrows between cards
    const yA0 = Y34 + 112, yA1 = Y310 - 112;
    const maps = [['A', 'var(--red)'], ['B', 'var(--red)'], ['C', 'var(--teal)'], ['D', 'var(--teal)']].map(([k, col]) => arrow(g, SL[k], yA0, SL[k], yA1, { stroke: col, w: 4.5, head: 14 }));
    const mapL = box(root, 200, (yA0 + yA1) / 2, { html: `客觀機率 → <b class="c-orange">主觀權重 ${TX(tc('orange', 'w'), 26)}</b><br>實際成本 → <b class="c-orange">主觀成本 ${TX(tc('orange', '\\nu'), 26)}</b>`, style: { fontSize: '25px', lineHeight: 1.45 } }, 'cl');
    // c2 note
    const note = box(root, 960, (yA0 + yA1) / 2, { html: `${TX('\\delta=\\gamma=', 30)}${LAM(26)}${TX('=1\\;\\Rightarrow\\; w(p)=p,\\;\\; \\nu(x)=x', 30)}`, style: { background: 'var(--card)', border: '3px solid #d9a400', borderRadius: '14px', padding: '4px 22px' } }, 'c');
    const back = box(root, 1740, Y310 - 76, { html: '＝ 式 (3.4) ✓', style: { fontSize: '28px', fontWeight: 700, color: 'var(--green)', background: 'var(--green-soft)', padding: '6px 16px', borderRadius: '12px' } }, 'c');
    setAnchor(back, 'translate(-100%,-50%) ');
    // c3 bottom row
    const pR = box(root, 520, 800, { class: 'pill', html: '理性（預期）決策', style: { fontSize: '32px', color: 'var(--blue)', borderColor: 'var(--blue)', padding: '10px 30px' } }, 'c');
    const pB = box(root, 1400, 800, { class: 'pill', html: '<span style="background:linear-gradient(90deg,var(--orange),var(--purple));-webkit-background-clip:text;background-clip:text;color:transparent">有限理性（人為）決策</span>', style: { fontSize: '32px', padding: '10px 30px', borderColor: 'var(--purple)', borderWidth: '3px' } }, 'c');
    const dbl = s('g', {}, g);
    const dA = arrow(dbl, 900, 800, 1170, 800, { w: 4.5, head: 16 });
    const dB = arrow(dbl, 1170, 800, 740, 800, { w: 4.5, head: 16 });
    const focus = box(root, 955, 752, { html: '研究焦點：兩者的差距', style: { fontSize: '28px', fontWeight: 700, background: '#fcefc2', padding: '2px 14px', borderRadius: '10px' } }, 'c');

    const keys = ['lhs', 'A', 'B', 'C', 'D'];
    return t => {
      show(hd, t, c.c(0) - .5, .5);
      // c0: 3.10 alone, centred higher; slides down at c1
      const mv = Ease.inOut(P(t, c.c(1) - .1, .9));
      G310.style.transform = `translateY(${lerp(-170, 0, mv)}px)`;
      opacity(G310, P(t, c.c(0) - .2, .7));
      draw(pvBox, t, c.c(0) + 3.6, .6, { out: c.c(1) - .3 });
      pvArr.anim(t, c.c(0) + 4.0, .5);
      show(pvNote, t, c.c(0) + 4.3, .6, { out: c.c(1) - .4, outD: .4 });
      if (t > c.c(1) - .4) { pvArr.shaft.style.opacity = Math.min(+pvArr.shaft.style.opacity, 1 - P(t, c.c(1) - .4, .4)); pvArr.head.style.opacity = Math.min(+pvArr.head.style.opacity || 0, 1 - P(t, c.c(1) - .4, .4)); }
      // c1
      show(G34, t, c.c(1) + .5, .7, { dy: -20 });
      maps.forEach((a, i) => { const p = a.anim(t, c.c(1) + 1.6 + i * .35, .5); const q = 1 - P(t, c.c(2) - .2, .4); a.shaft.style.opacity = p > 0 ? q : 0; a.head.style.opacity = p > .92 ? q : 0; });
      show(mapL, t, c.c(1) + 2.2, .5, { out: c.c(2) - .2, outD: .4 });
      draw(denB1, t, c.c(1) + 5.6, .6); draw(denB2, t, c.c(1) + 5.8, .6);
      show(denL, t, c.c(1) + 6.0, .5, { dy: 0, dx: -10 });
      // c2: morph to 3.4 and back at c3
      const m = Math.min(Ease.inOut(P(t, c.c(2) + 1.2, .8)), 1 - Ease.inOut(P(t, c.c(3) - .1, .8)));
      keys.forEach(k => { opacity(f310[k], 1 - m); opacity(alt[k], m); });
      ['eq', 'dA', 'dC', 'plus', 'den', 'bar'].forEach(k => opacity(alt[k], 0));
      show(note, t, c.c(2) + .1, .5, { out: c.c(3) - .2, outD: .4 });
      show(back, t, c.c(2) + 2.2, .5, { dy: 0, out: c.c(3) - .2, outD: .4 });
      // c3
      show(pR, t, c.c(3) + .5, .5); show(pB, t, c.c(3) + 1.2, .5);
      dA.anim(t, c.c(3) + 2.0, .5); dB.anim(t, c.c(3) + 2.0, .5);
      show(focus, t, c.c(3) + 2.4, .5);
    };
  });

  // ================================================================== solve
  scene('solve', (root, c) => {
    const hd = heading(root, '數值求解：讓電腦找「導數 = 0」');
    // c0 band
    const A = layer(root), gA = svgLayer(A);
    const fc = card(A, 960, 200, 0, 0, { anchor: 'tc', pad: 20, style: { width: 'auto', background: '#f3efe6', borderColor: '#9aa1ad' } });
    fc.innerHTML = `<div style="display:flex;align-items:center;gap:26px;color:#555">${TX('\\frac{d}{d\\tau}\\,PV\\big(E[C_{ave}(\\tau)]\\big)=0', 38)}<span class="tag t-gray">最佳條件 式 (3.11)</span></div>`;
    const stamp = box(A, 560, 430, { text: '無解析解', style: { fontSize: '54px', fontWeight: 900, color: 'var(--red)', border: '6px solid var(--red)', borderRadius: '14px', padding: '4px 26px', letterSpacing: '6px' } }, 'c');
    const arr0 = arrow(gA, 760, 430, 1010, 430, { w: 5, head: 18 });
    const mz = card(A, 1040, 360, 600, 0, { pad: 22, style: { borderColor: 'var(--blue)' } });
    mz.innerHTML = `<div class="h3" style="font-size:34px">Matlab <span class="en" style="color:var(--blue)">fzero</span> 數值求根</div><div style="font-size:26px;color:var(--mute)">讓電腦逐步逼近「導數 = 0」的點</div>`;
    const seq = [1000, 500.5, 250.75, 270.432, 266.74, 266.381];
    const iterT = box(A, 960, 590, { html: '論文的實際迭代（Fig. 3.8 右側表格）', style: { fontSize: '24px', color: 'var(--mute)', fontWeight: 700 } }, 'tc');
    const chips = seq.map((v, i) => {
      const e = box(A, 300 + i * 264, 680, { html: `<span class="en">${v}</span>`, style: { fontSize: '30px', fontWeight: 700, padding: '6px 18px', borderRadius: '12px', background: i === seq.length - 1 ? 'var(--green-soft)' : 'var(--card)', border: `2.5px solid ${i === seq.length - 1 ? 'var(--green)' : 'var(--faint)'}`, color: i === seq.length - 1 ? 'var(--green)' : 'var(--ink)' } }, 'c');
      return e;
    });
    const chipArr = seq.slice(1).map((_, i) => arrow(gA, 300 + i * 264 + 82, 680, 300 + (i + 1) * 264 - 82, 680, { w: 3, head: 11, stroke: 'var(--mute)' }));

    // figure group
    const F = layer(root);
    const FX = 310, FY = 190, FW = 1300;
    const fig = figCard(F, FX, FY, FW, 'assets/fig3_8.png', '論文 Fig. 3.8：以 fzero 數值求解式 (3.10) 的一階導數，根為 τ = 266.3816');
    const gF = svgLayer(F);
    const fm = figMap(FX, FY, FW, 975);
    const zx = fm.X(174), zy = fm.Y(197);
    const circ = ell(gF, zx, zy, 30, 30, { stroke: 'var(--red)', w: 5 });
    const zlab = box(F, fm.X(192), fm.Y(228), { html: 'τ = <b>266.3816</b>', style: { fontSize: '32px', color: 'var(--red)', background: 'rgba(255,253,248,.92)', padding: '0 10px', borderRadius: '8px' } }, 'cl');
    const minus = box(F, fm.X(138), fm.Y(232), { text: '−', style: { fontSize: '64px', fontWeight: 900, color: 'var(--red)' } }, 'c');
    const plus = box(F, fm.X(212), fm.Y(172), { text: '＋', style: { fontSize: '52px', fontWeight: 900, color: 'var(--green)' } }, 'c');
    const sgn = box(F, fm.X(300), fm.Y(330), { html: '導數由負轉正 → <b>最小值</b>', style: { fontSize: '30px', background: 'rgba(255,253,248,.95)', border: '2.5px solid var(--green)', borderRadius: '12px', padding: '4px 14px' } }, 'c');
    const tbl = rrect(gF, fm.X(533), fm.Y(250), 180 * fm.k, 22 * fm.k, { stroke: 'var(--yellow)', w: 4, fill: 'rgba(244,197,66,.25)', r: 6 });
    const rc = box(F, FX + FW, FY + 626, { html: `${RECALC} <span style="font-size:24px">此圖對應 <b>δ = 0.97、γ = 0.91、</b>${LAM(22)}<b> = 1.53</b>（<b class="c-orange">風險尋求</b>）</span>` });
    setAnchor(rc, 'translate(-100%,0) ');

    // c3–c4 right side
    const fl = card(root, 900, 190, 870, 0, { pad: 24, style: { borderColor: 'var(--yellow)' } });
    fl.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><span class="h3" style="font-size:30px">λ 被約掉了</span>${mini('我們推導（論文未明講）')}</div>
      <div style="margin-top:6px">${TX('\\frac{\\nu(C_c)}{\\nu(C_p)}=\\frac{' + `\\textcolor{${COL.red}}{\\cancel{${LAMK}}}` + '\\cdot C_c^{\\delta}}{' + `\\textcolor{${COL.red}}{\\cancel{${LAMK}}}` + '\\cdot C_p^{\\delta}}=\\Big(\\frac{C_c}{C_p}\\Big)^{\\delta}', 40)}</div>
      <div style="font-size:25px;line-height:1.5">${LAM(22)} 只把 PV 整體放大，最低點的位置不變</div>`;
    const g = svgLayer(root);
    const BX = 330, BW = 520 / 3.5;
    const bars = [['中性', 3.3408, 'var(--blue)', 'δ = 1'], ['尋求', 3.2220, 'var(--orange)', 'δ = 0.97'], ['規避', 3.4639, 'var(--purple)', 'δ = 1.03']].map(([n, v, col, d], i) => {
      const y = 640 + i * 72;
      const lab = box(root, BX - 18, y, { html: `<b style="color:${col}">${n}</b> <span class="small" style="font-size:20px">${d}</span>`, style: { fontSize: '27px' } }, 'cl');
      setAnchor(lab, 'translate(-100%,-50%) ');
      const r = hbar(g, BX, y, v * BW, 40, col);
      const val = box(root, BX + v * BW + 14, y, { html: `<b class="en">${v.toFixed(2)}</b>`, style: { fontSize: '28px' } }, 'cl');
      return { lab, r, val };
    });
    const bt = box(root, 150, 560, { html: `主觀成本比 ${TX('(C_c/C_p)^{\\delta}', 28)} ${RECALC}`, style: { fontSize: '28px', fontWeight: 700 } });
    const big = card(root, 1060, 600, 710, 0, { pad: 26, style: { borderColor: 'var(--green)', background: 'var(--green-soft)' } });
    big.innerHTML = `<div class="h3" style="font-size:40px;color:#1f6b36;text-align:center;white-space:normal">決定 τ 的是 <b>δ</b> 與 <b>γ</b><br>不是 ${LAM(36)}</div>`;

    return t => {
      show(hd, t, c.c(0) - .5, .5);
      opacity(A, 1 - P(t, c.c(1) - .3, .5));
      show(fc, t, c.c(0) + .1, .5);
      pop(stamp, t, c.c(0) + 1.4, .5, { extra: ' rotate(-7deg)' });
      arr0.anim(t, c.c(0) + 2.6, .6); show(mz, t, c.c(0) + 3.0, .6, { dx: -20, dy: 0 });
      show(iterT, t, c.c(0) + 4.4, .4);
      chips.forEach((e, i) => pop(e, t, c.c(0) + 4.6 + i * .55, .35));
      chipArr.forEach((a, i) => a.anim(t, c.c(0) + 4.8 + i * .55, .3));
      // figure
      show(fig, t, c.c(1) - .1, .6);
      draw(circ, t, c.c(1) + 2.6, .6); show(zlab, t, c.c(1) + 3.0, .4, { dy: 0, dx: -10 });
      show(tbl, t, c.c(1) + 3.6, .4, { dy: 0 });
      show(minus, t, c.c(1) + 5.0, .4, { dy: 0 }); show(plus, t, c.c(1) + 5.6, .4, { dy: 0 });
      show(sgn, t, c.c(1) + 6.2, .5);
      show(rc, t, c.c(2) + .3, .5);
      const sh = Ease.inOut(P(t, c.c(3) - .1, .9));
      xform(F, FX, FY, lerp(1, .5, sh), lerp(0, 150 - FX, sh), 0);
      [minus, plus, sgn, rc].forEach(e => { if (t > c.c(3) - .2) opacity(e, 1 - P(t, c.c(3) - .2, .4)); });
      show(fl, t, c.c(3) + .6, .6, { dx: 30, dy: 0 });
      show(bt, t, c.c(4) - .1, .5);
      bars.forEach((b, i) => { show(b.lab, t, c.c(4) + .2 + i * .5, .4, { dy: 0 }); growH(b.r, t, c.c(4) + .3 + i * .5, .8); show(b.val, t, c.c(4) + .9 + i * .5, .4, { dy: 0 }); });
      show(big, t, c.c(4) + 2.6, .6);
    };
  });

})();
