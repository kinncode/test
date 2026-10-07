// chapters 7–9: bearing case, fan case, summary & beyond

function figCard(root, x, y, w, src, cap, anchor = 'tl') {
  const el = box(root, x, y, { class: 'figure' }, anchor);
  el.style.width = w + 'px';
  h('img', { src }, el);
  if (cap) h('div', { class: 'figcap', text: cap }, el);
  return el;
}

// grouped bar chart: groups = [{name, vals:[..4], std:[..4]}], series = [[name,color],..]
function barChart(root, g, x, y, w, hgt, groups, series, vmax, o = {}) {
  const grp = s('g', {}, g);
  const base = y + hgt;
  const yaxis = line(grp, x, base, x, y - 10, { w: 3 });
  const xaxis = line(grp, x, base, x + w, base, { w: 3 });
  const ticks = [];
  for (let v = 0; v <= vmax; v += o.step || 1) {
    const yy = base - v / vmax * hgt;
    ticks.push(line(grp, x - 8, yy, x + w, yy, { w: 1.5, stroke: v === 0 ? 'var(--ink)' : 'rgba(31,36,48,.12)' }));
    ticks.push(svgText(grp, x - 16, yy, String(v), { size: 22, anchor: 'end', weight: 500, fill: 'var(--mute)', family: 'Inter' }));
  }
  const ylab = svgText(grp, x - 10, y - 40, o.ylabel || 'RMSE（週期）', { size: 24, anchor: 'start', fill: 'var(--mute)', weight: 500 });
  const gw = w / groups.length, bw = gw * .78 / series.length;
  const bars = groups.map((gr, gi) => {
    const gx = x + gi * gw + gw * .11;
    svgText(grp, gx + bw * series.length / 2, base + 36, gr.name, { size: 28, family: 'Inter' });
    if (gr.sub) svgText(grp, gx + bw * series.length / 2, base + 70, gr.sub, { size: 22, weight: 500, fill: 'var(--mute)' });
    return gr.vals.map((v, si) => {
      const bx = gx + si * bw + 4;
      const r = s('rect', { x: bx, y: base, width: bw - 8, height: 0, rx: 6, fill: series[si][1], stroke: 'var(--ink)', 'stroke-width': si === series.length - 1 ? 3 : 0 }, grp);
      const tx = svgText(grp, bx + (bw - 8) / 2, base, v.toFixed(2), { size: 22, family: 'Inter', fill: si === 2 ? 'var(--ink)' : '#fff' });
      const sd = gr.std ? gr.std[si] : 0;
      const eb = path(grp, `M${bx + (bw - 8) / 2} ${base - (v - sd) / vmax * hgt} V${base - (v + sd) / vmax * hgt} M${bx + (bw - 8) / 2 - 10} ${base - (v + sd) / vmax * hgt} h20 M${bx + (bw - 8) / 2 - 10} ${base - (v - sd) / vmax * hgt} h20`, { w: 2.5 });
      eb.style.opacity = 0;
      return { r, tx, eb, v, sd, bx };
    });
  });
  const legend = box(root, x + w, y - 60, { html: series.map(([n, col]) => `<span style="display:inline-flex;align-items:center;gap:6px;margin-left:16px"><span style="width:20px;height:20px;border-radius:4px;background:${col};display:inline-block"></span>${n}</span>`).join(''), style: { fontSize: '24px', fontWeight: 700 } });
  legend.style.transform = 'translateX(-100%)'; legend._anchor = 'translateX(-100%) ';
  return {
    grp, bars, legend,
    axis(t, t0) { [yaxis, xaxis].forEach(e => draw(e, t, t0, .5)); ticks.forEach(e => opacity(e, P(t, t0 + .3, .4))); opacity(ylab, P(t, t0 + .3, .4)); show(legend, t, t0 + .3, .5); },
    bar(gi, si, t, t0, d = .8) {
      const b = bars[gi][si]; const k = Ease.out(P(t, t0, d));
      const hh = b.v / vmax * hgt * k;
      b.r.setAttribute('height', hh); b.r.setAttribute('y', base - hh);
      b.tx.setAttribute('y', base - 22); b.tx.textContent = (b.v * k).toFixed(2); opacity(b.tx, P(t, t0, .2));
    },
    err(gi, t, t0) { bars[gi].forEach((b, i) => { b.eb.style.opacity = P(t, t0 + i * .1, .3); }); },
    X(gi, si) { const b = bars[gi][si]; return b.bx + (b.r.getAttribute('width') / 2); },
    Y(v) { return base - v / vmax * hgt; },
  };
}
const SERIES = [['FFNN', 'var(--blue)'], ['RBN', 'var(--orange)'], ['兩者組合', '#b7aee0'], ['COPROG', 'var(--green)']];

// ---------------------------------------------------------------- bearing
scene('bearing', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', html: '案例一：滾動軸承 <span class="small">（模擬）</span>' });
  const g = svgLayer(root);
  const cx = 520, cy = 560;
  const ringO = s('g', {}, g);
  s('circle', { cx, cy, r: 290, fill: '#ece6d8', stroke: 'var(--ink)', 'stroke-width': 4 }, ringO);
  s('circle', { cx, cy, r: 248, fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 4 }, ringO);
  const cage = s('circle', { cx, cy, r: 199, fill: 'none', stroke: 'var(--mute)', 'stroke-width': 3, 'stroke-dasharray': '10 8' }, g);
  const rollers = s('g', {}, g);
  const R = []; for (let k = 0; k < 9; k++) R.push(s('circle', { r: 44, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 4 }, rollers));
  const inner = s('g', {}, g);
  s('circle', { cx, cy, r: 152, fill: '#ece6d8', stroke: 'var(--ink)', 'stroke-width': 4 }, inner);
  s('circle', { cx, cy, r: 104, fill: '#c9c1b0', stroke: 'var(--ink)', 'stroke-width': 4 }, inner);
  const defect = s('path', { d: `M${cx + 140} ${cy - 10} L${cx + 153} ${cy - 4} L${cx + 153} ${cy + 4} L${cx + 140} ${cy + 10} Z`, fill: 'var(--red)', stroke: 'var(--red)', 'stroke-width': 3 }, inner);
  s('line', { x1: cx - 60, y1: cy, x2: cx + 60, y2: cy, stroke: 'var(--ink)', 'stroke-width': 4 }, inner);
  const flash = s('circle', { r: 20, fill: 'none', stroke: 'var(--red)', 'stroke-width': 5 }, g);
  const labels = [['外環', cx - 250, cy - 330, cx - 175, cy - 205], ['滾動體', cx + 300, cy - 300, cx + 120, cy - 160], ['內環', cx + 330, cy + 300, cx + 90, cy + 100], ['保持架', cx - 330, cy + 320, cx - 150, cy + 130]]
    .map(([tx, lx, ly, px, py]) => { const gg = s('g', {}, g); line(gg, lx, ly, px, py, { w: 2.5, stroke: 'var(--mute)' }); s('circle', { cx: px, cy: py, r: 6, fill: 'var(--ink)' }, gg); svgText(gg, lx, ly + (ly < cy ? -20 : 26), tx, { size: 30 }); return gg; });
  const dl = svgText(g, cx + 230, cy + 10, '缺陷', { size: 28, anchor: 'start', fill: 'var(--red)' });
  // vibration trace
  const vx = 1000, vy = 290, vw = 780, vh = 230;
  const vframe = s('rect', { x: vx, y: vy, width: vw, height: vh, rx: 16, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
  const vt = svgText(g, vx + 20, vy + 30, '振動訊號：每次撞到缺陷就「叮」一下', { size: 24, anchor: 'start', fill: 'var(--mute)' });
  const vpath = path(g, '', { stroke: 'var(--red)', w: 2.5 });
  const wi = 1.2, wc = wi / 2 * (1 - 8 / 23), dw = wi - wc, Tk = (2 * Math.PI / 9) / dw;
  const f = card(root, 1000, 560, 780, 0, { pad: 22 });
  f.innerHTML = `<div class="body" style="font-size:27px;margin-bottom:4px">內環缺陷特徵頻率</div><div style="font-size:32px">${tex('f_{IRF}=\\dfrac{n_r f_r}{2}\\left(1+\\dfrac{d_r}{d_p}\\cos\\theta\\right)\\approx 10.11\\ \\text{Hz}', true)}</div>
   <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:22px"><span class="tag t-gray">${tex('n_r=9')} 顆滾子</span><span class="tag t-gray">${tex('f_r\\approx1.67')} Hz（100 rpm）</span><span class="tag t-gray">${tex('d_r=8')} mm</span><span class="tag t-gray">${tex('d_p=23')} mm</span><span class="tag t-gray">${tex('\\theta=0^\\circ')}</span></div>`;
  return t => {
    show(head, t, c.c(0) - .3, .6);
    const on = P(t, c.c(0), .6);
    [ringO, cage, rollers, inner].forEach(e => opacity(e, on));
    const ti = Math.max(0, t - c.c(0));
    const ai = wi * ti, ac = wc * ti;
    inner.setAttribute('transform', `rotate(${ai * 180 / Math.PI} ${cx} ${cy})`);
    R.forEach((r, k) => { const a = ac + k * 2 * Math.PI / 9; r.setAttribute('cx', cx + 199 * Math.cos(a)); r.setAttribute('cy', cy + 199 * Math.sin(a)); });
    labels.forEach((e, i) => show(e, t, c.c(1) + i * .45, .5));
    const dOn = P(t, c.c(2), .4);
    defect.style.opacity = dOn; opacity(dl, dOn * (1 - P(t, c.c(2) + 3, .5)));
    // impacts: defect (angle ai) meets a roller every Tk seconds of relative rotation
    const tau = ((ai - ac) % (2 * Math.PI / 9)) / dw;
    const amp = dOn * Math.exp(-tau * 5);
    flash.setAttribute('cx', cx + 175 * Math.cos(ai)); flash.setAttribute('cy', cy + 175 * Math.sin(ai));
    flash.setAttribute('r', 18 + tau * 70); flash.style.opacity = amp;
    [vframe, vt].forEach(e => opacity(e, P(t, c.c(2) + .3, .4)));
    if (dOn > 0) {
      const t0 = c.c(2), win = 4; let d = '';
      for (let i = 0; i <= 400; i++) {
        const tt = t - win + win * i / 400; let y = 0;
        if (tt > t0) { const rel = (wi - wc) * (tt - c.c(0)); const tl = (rel % (2 * Math.PI / 9)) / dw; y = Math.exp(-tl * 9) * Math.sin(2 * Math.PI * 14 * tl) + .05 * Math.sin(tt * 97); }
        d += (i ? 'L' : 'M') + (vx + 20 + (vw - 40) * i / 400).toFixed(1) + ' ' + (vy + vh / 2 + 20 - y * 70).toFixed(1);
      }
      vpath.setAttribute('d', d);
    }
    opacity(vpath, P(t, c.c(2) + .3, .4));
    show(f, t, c.c(3), .6);
  };
});

// ---------------------------------------------------------------- signal processing
scene('signal', (root, c) => {
  const g = svgLayer(root);
  const note = box(root, 1770, 120, { class: 'small', text: '示意重繪（參考論文 Fig. 4）' });
  note.style.transform = 'translateX(-100%)'; note._anchor = 'translateX(-100%) ';
  const panels = [[150, 200, '(a) 原始訊號 · 時間域'], [1030, 200, '(b) 原始訊號 · 頻譜'], [150, 590, '(c) 包絡（解調後）· 時間域'], [1030, 590, '(d) 包絡 · 頻譜']];
  const PW = 740, PH = 280;
  const fr = panels.map(([x, y, tt]) => { const gg = s('g', {}, g); s('rect', { x, y, width: PW, height: PH, rx: 16, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 3 }, gg); svgText(gg, x + 20, y + 30, tt, { size: 25, anchor: 'start' }); return gg; });
  const area = ([x, y]) => ({ X: u => x + 30 + u * (PW - 60), Y: v => y + PH - 40 - v * (PH - 90) });
  const A = area(panels[0]), B = area(panels[1]), C = area(panels[2]), D = area(panels[3]);
  // (a) raw: impacts every 1/10.13 s ringing at resonance
  let da = ''; const N = 1400;
  for (let i = 0; i <= N; i++) { const tt = i / N * 1.2; const tl = tt % (1 / 10.13); const y = Math.exp(-tl * 45) * Math.sin(2 * Math.PI * 90 * tl) * .9 + .06 * Math.sin(i * 1.7) * Math.sin(i * .31); da += (i ? 'L' : 'M') + A.X(tt / 1.2).toFixed(1) + ' ' + (A.Y(.5) - y * 90).toFixed(1); }
  const pa = path(g, da, { stroke: 'var(--blue)', w: 1.6 });
  // (b) raw spectrum: resonance peak near 5 kHz
  let db = ''; for (let i = 0; i <= 400; i++) { const f = i / 400 * 20000; const y = .9 / (1 + Math.pow((f - 5000) / 160, 2)) + .03 * Math.abs(Math.sin(i * 2.3)); db += (i ? 'L' : 'M') + B.X(i / 400).toFixed(1) + ' ' + B.Y(y).toFixed(1); }
  const pb = path(g, db, { stroke: 'var(--blue)', w: 2.5 });
  const bl = svgText(g, B.X(.25) + 20, B.Y(.85), '共振 ≈ 5 kHz', { size: 24, anchor: 'start', fill: 'var(--blue)' });
  const bx = [B.X(0), B.X(.01)];
  const mag = s('g', {}, g); s('circle', { cx: B.X(.03), cy: B.Y(.05), r: 34, fill: 'none', stroke: 'var(--red)', 'stroke-width': 4 }, mag); line(mag, B.X(.03) + 24, B.Y(.05) - 24, B.X(.03) + 70, B.Y(.05) - 70, { stroke: 'var(--red)', w: 5 });
  svgText(mag, B.X(.03) + 80, B.Y(.05) - 90, '缺陷頻率在哪？看不到', { size: 24, anchor: 'start', fill: 'var(--red)' });
  const xb = svgText(g, B.X(1), B.Y(0) + 26, '0 – 20 kHz', { size: 20, anchor: 'end', fill: 'var(--mute)', weight: 500 });
  // (c) envelope
  let dc = ''; for (let i = 0; i <= N; i++) { const tt = i / N * 1.2; const tl = tt % (1 / 10.13); const y = Math.exp(-tl * 40) * .85; dc += (i ? 'L' : 'M') + C.X(tt / 1.2).toFixed(1) + ' ' + C.Y(y).toFixed(1); }
  const pc = path(g, dc, { stroke: 'var(--purple)', w: 2.2 });
  // (d) envelope spectrum: harmonics of 10.13 Hz
  const hts = [.95, .92, .53, .55, .34, .37, .27, .28, .2];
  let dd = ''; for (let i = 0; i <= 600; i++) { const f = i / 600 * 100; let y = .05 + .03 * Math.abs(Math.sin(i * 1.3)); hts.forEach((hh, k) => { y += hh / (1 + Math.pow((f - 10.13 * (k + 1)) / .35, 2)); }); dd += (i ? 'L' : 'M') + D.X(i / 600).toFixed(1) + ' ' + D.Y(Math.min(y, 1)).toFixed(1); }
  const pd = path(g, dd, { stroke: 'var(--purple)', w: 2.2 });
  const dl = svgText(g, D.X(.1013) + 34, D.Y(.95) + 6, '10.13 Hz', { size: 26, anchor: 'start', fill: 'var(--red)', family: 'Inter' });
  const xd = svgText(g, D.X(1), D.Y(0) + 26, '0 – 100 Hz', { size: 20, anchor: 'end', fill: 'var(--mute)', weight: 500 });
  const fft = arrow(g, 900, 340, 1020, 340, { w: 5, stroke: 'var(--blue)' });
  const fftT = svgText(g, 960, 312, 'FFT', { size: 30, family: 'Inter', fill: 'var(--blue)' });
  const chain = box(root, 960, 530, { html: '<div style="display:flex;gap:12px;align-items:center;font-size:26px"><span class="tag t-purple">帶通濾波</span>→<span class="tag t-purple">整流</span>→<span class="tag t-purple">取包絡</span></div>' }, 'tc');
  const fft2 = arrow(g, 900, 730, 1020, 730, { w: 5, stroke: 'var(--purple)' });
  const fft2T = svgText(g, 960, 702, 'FFT', { size: 30, family: 'Inter', fill: 'var(--purple)' });
  const ok = box(root, 1400, 920 - 70, { class: 'tag t-green', html: '≈ 理論值 <i>f</i><sub>IRF</sub> = 10.11 Hz ✓', style: { fontSize: '26px' } }, 'tc');
  return t => {
    show(note, t, c.c(0), .5);
    show(fr[0], t, c.c(0), .5); draw(pa, t, c.c(0) + .4, 2.2, { ease: Ease.lin });
    fft.anim(t, c.c(1), .5); opacity(fftT, P(t, c.c(1) + .3, .3));
    show(fr[1], t, c.c(1) + .4, .5); draw(pb, t, c.c(1) + .9, 1.6, { ease: Ease.lin }); opacity(xb, P(t, c.c(1) + .9, .3));
    opacity(bl, P(t, c.c(2), .4)); pop(mag, t, c.c(2) + .8, .5);
    show(chain, t, c.c(3), .5);
    show(fr[2], t, c.c(3) + .6, .5); draw(pc, t, c.c(3) + 1.1, 2, { ease: Ease.lin });
    fft2.anim(t, c.c(4) - .2, .4); opacity(fft2T, P(t, c.c(4), .3));
    show(fr[3], t, c.c(4), .5); draw(pd, t, c.c(4) + .4, 2, { ease: Ease.lin }); opacity(xd, P(t, c.c(4) + .4, .3));
    pop(dl, t, c.c(4) + 1.2, .4); show(ok, t, c.c(4) + 2.4, .5);
  };
});

// ---------------------------------------------------------------- degradation + entropy
scene('entropy', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '缺陷成長 與 特徵：熵' });
  const g = svgLayer(root);
  const ax = axes(g, 170, 290, 700, 470, { xlabel: '時間', ylabel: '缺陷幅度 D' });
  const r = rng(42);
  const paths = [], fails = [];
  for (let k = 0; k < 7; k++) {
    const rate = 3.2 + r() * 2.6, d0 = .03 + r() * .03;
    const fn = u => d0 + .05 * (Math.exp(rate * u) - 1);
    let uf = 0; while (fn(uf) < 1 && uf < 1.5) uf += .002;
    const nz = Array.from({ length: 121 }, () => gauss(r) * .012);
    let d = ''; for (let i = 0; i <= 120; i++) { const u = uf * i / 120; d += (i ? 'L' : 'M') + ax.X(u / 1.05).toFixed(1) + ' ' + ax.Y(Math.min(1, fn(u)) * .82 + nz[i]).toFixed(1); }
    paths.push(path(g, d, { stroke: `hsl(${200 + k * 12},55%,${38 + k * 4}%)`, w: 3 }));
    const x = ax.X(uf / 1.05), y = ax.Y(.82);
    fails.push(path(g, `M${x - 10} ${y - 10} L${x + 10} ${y + 10} M${x + 10} ${y - 10} L${x - 10} ${y + 10}`, { stroke: 'var(--red)', w: 5 }));
  }
  const thr = line(g, ax.X(0), ax.Y(.82), ax.X(1), ax.Y(.82), { stroke: 'var(--red)', w: 3, dash: '12 10' });
  const thrT = svgText(g, ax.X(0) + 14, ax.Y(.82) - 22, '失效：D = 1', { size: 26, anchor: 'start', fill: 'var(--red)' });
  const params = card(root, 990, 270, 780, 0, { pad: 22 });
  params.innerHTML = `<div class="h3" style="font-size:30px;margin-bottom:8px">指數型損傷成長 ＋ 隨機參數</div><table class="tb" style="width:100%;font-size:24px">
   <tr><th>參數</th><th>分布</th><th>平均</th><th>標準差</th></tr>
   <tr><td>${tex('D_0')}</td><td>常態</td><td>0.010</td><td>0.001</td></tr>
   <tr><td>${tex('a_D')}</td><td>對數常態</td><td>0.100</td><td>0.020</td></tr>
   <tr><td>${tex('b_D')}</td><td>常態</td><td>0.025</td><td>0.005</td></tr></table><div class="small" style="margin-top:6px">每顆軸承抽一組參數 → 每條劣化路徑都不同（再加上量測雜訊）</div>`;
  const ent = card(root, 990, 270, 780, 0, { pad: 22 });
  ent.innerHTML = `<div class="h3" style="font-size:30px">熵（Entropy）：訊號有多「亂」</div><div style="font-size:30px;margin:6px 0">${tex('H=-\\sum_i p_i \\log p_i')}</div>`;
  const esv = miniSvg(ent, 730, 150);
  path(esv, fpath(u => .5 + .38 * Math.sin(u * 30), 0, 1, 120, u => 10 + u * 330, v => 130 - v * 110), { stroke: 'var(--teal)', w: 3 });
  const rr = rng(9); let dn = ''; for (let i = 0; i <= 120; i++) dn += (i ? 'L' : 'M') + (390 + i / 120 * 330).toFixed(1) + ' ' + (130 - (.5 + (rr() - .5) * .9) * 110).toFixed(1);
  path(esv, dn, { stroke: 'var(--red)', w: 2.5 });
  h('div', { html: '<div style="display:flex;justify-content:space-around;font-size:26px;font-weight:700"><span class="c-teal">規律 → 低熵</span><span class="c-red">雜亂 → 高熵（劣化）</span></div>' }, ent);
  const fig = figCard(root, 960, 250, 1300, 'assets/fig5.png', '論文 Fig. 5：(a) 振動頻譜隨壽命演變　(b) 熵的兩階段變化', 'tc');
  return t => {
    show(head, t, c.c(0) - .3, .6);
    const out = c.c(3) - .3;
    ax.anim(t, c.c(0), .5); [ax.g].forEach(e => opacity(e, 1 - P(t, out, .4)));
    paths.forEach((p, i) => draw(p, t, c.c(0) + .4 + i * .3, 2.2, { out }));
    draw(thr, t, c.c(1), .6, { out }); opacity(thrT, Math.min(P(t, c.c(1) + .3, .3), 1 - P(t, out, .4)));
    fails.forEach((f, i) => opacity(f, Math.min(P(t, c.c(1) + .4 + i * .1, .2), 1 - P(t, out, .4))));
    show(params, t, c.c(0) + .8, .6, { out: c.c(2) - .2 });
    show(ent, t, c.c(2), .6, { out });
    show(fig, t, c.c(3), .7);
  };
});

// ---------------------------------------------------------------- dataset construction
scene('dataset', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '實驗怎麼設計？' });
  const chips = (n, col, w = 12, hgt = 26) => Array.from({ length: n }, () => `<span style="display:inline-block;width:${w}px;height:${hgt}px;border-radius:3px;background:${col};margin:2px"></span>`).join('');
  // phase A
  const pool = card(root, 150, 220, 900, 0, { pad: 24 });
  pool.innerHTML = `<div class="h3" style="margin-bottom:10px">訓練資料池</div>
   <div style="display:flex;gap:30px"><div><div style="width:200px;line-height:0">${chips(100, 'var(--red)', 14, 14)}</div><div class="body" style="font-size:26px;margin-top:8px">100 個失效單元</div></div>
   <div><div style="width:200px;line-height:0">${chips(100, 'var(--teal)', 14, 14)}</div><div class="body" style="font-size:26px;margin-top:8px">100 個停機單元</div></div>
   <div style="flex:1"><div class="body" style="font-size:25px">停機單元 ＝ 把完整軌跡<br>在壽命 <b>90%–100%</b> 隨機截斷</div>
   <svg width="330" height="80" style="display:block;margin-top:10px;overflow:visible"><rect x="0" y="30" width="330" height="16" rx="8" fill="var(--teal-soft)" stroke="var(--teal)" stroke-width="2"/><rect x="297" y="18" width="33" height="40" fill="rgba(217,65,46,.18)"/><text x="313" y="12" font-size="18" text-anchor="middle" fill="var(--red)" font-weight="700">90–100%</text><path d="M305 30 V46" stroke="var(--ink)" stroke-width="4"/><text x="0" y="74" font-size="18" fill="var(--mute)">0%</text><text x="330" y="74" font-size="18" text-anchor="end" fill="var(--mute)">壽命 100%</text></svg></div></div>`;
  const test = card(root, 1110, 220, 660, 0, { pad: 24 });
  test.innerHTML = `<div class="h3" style="margin-bottom:10px">測試資料</div><div class="body" style="font-size:26px">另外 <b>100</b> 個單元<br>在<b>後半段壽命</b>的多個時間點截斷<br>→ 共 <b class="c-purple">2000+</b> 筆測試輸入</div>`;
  // phase B
  const s1 = card(root, 150, 220, 780, 0, { pad: 24 });
  s1.innerHTML = `<div class="h3">情境 1：<span class="en">3L-10U</span></div><div class="small" style="margin-bottom:10px">缺乏失效資料</div><div style="line-height:0">${chips(3, 'var(--red)')}&nbsp;&nbsp;${chips(10, 'var(--teal)')}</div><div class="body" style="font-size:25px;margin-top:10px">3 個失效 ＋ 10 個停機單元</div>`;
  const s2 = card(root, 990, 220, 780, 0, { pad: 24 });
  s2.innerHTML = `<div class="h3">情境 2：<span class="en">10L-10U</span></div><div class="small" style="margin-bottom:10px">失效資料較多</div><div style="line-height:0">${chips(10, 'var(--red)')}&nbsp;&nbsp;${chips(10, 'var(--teal)')}</div><div class="body" style="font-size:25px;margin-top:10px">10 個失效 ＋ 10 個停機單元</div>`;
  const met = card(root, 960, 530, 1300, 0, { anchor: 'tc', pad: 22 });
  met.innerHTML = `<div style="display:flex;align-items:center;gap:40px"><div class="h3" style="white-space:nowrap">隨機重複 50 次</div><div style="font-size:30px">${tex('\\text{RMSE}=\\sqrt{\\dfrac{\\sum_{\\mathbf{x}\\in\\mathcal{T}}\\big(L^T(\\mathbf{x})-L^P(\\mathbf{x})\\big)^2}{N_t}}', true)}</div>
   <div style="display:flex;flex-direction:column;gap:10px"><span class="tag t-blue" style="font-size:26px">平均 → 準確度</span><span class="tag t-purple" style="font-size:26px">標準差 → 穩健度</span></div></div>`;
  // phase C
  const crit = card(root, 150, 220, 1620, 0, { pad: 24 });
  crit.innerHTML = `<div class="h3" style="margin-bottom:6px">臨界時間 RMSE：只看最後 5 個時間點</div><div class="small">越接近壽命終點，預測越影響維修決策</div>`;
  const csv = miniSvg(crit, 1560, 90, { marginTop: '10px' });
  line(csv, 20, 45, 1500, 45, { stroke: 'var(--faint)', w: 6 });
  for (let i = 0; i < 30; i++) { const x = 40 + i * 48, last = i >= 25; s('circle', { cx: x, cy: 45, r: last ? 13 : 8, fill: last ? 'var(--orange)' : 'var(--mute)' }, csv); }
  path(csv, 'M1508 31 L1530 59 M1530 31 L1508 59', { stroke: 'var(--red)', w: 5 });
  const cfg = card(root, 150, 500, 1620, 0, { pad: 20 });
  cfg.innerHTML = `<table class="tb" style="width:100%;font-size:26px"><tr><th></th><th>結構</th><th>訓練</th><th>其他</th></tr>
   <tr><td class="c-blue"><b>FFNN</b></td><td>3 輸入 – 8 隱藏 – 1 輸出</td><td>反向傳播、100 回合、60/40 驗證</td><td>訓練 10 次取最佳</td></tr>
   <tr><td class="c-orange"><b>RBN</b></td><td>20 個中心、一階多諧樣條</td><td>偽反矩陣、60/40 驗證</td><td>訓練 10 次取最佳</td></tr>
   <tr><td class="c-green"><b>COPROG</b></td><td colspan="3">最大回合 T = 5、候選池大小 u = 5</td></tr></table>`;
  return t => {
    show(head, t, c.c(0) - .3, .6);
    const oA = c.c(2) - .3, oB = c.c(4) - .3;
    show(pool, t, c.c(0), .6, { out: oA }); show(test, t, c.c(1), .6, { out: oA });
    show(s1, t, c.c(2) + .2, .6, { out: oB }); show(s2, t, c.c(2) + 3, .6, { out: oB });
    show(met, t, c.c(3), .6, { out: oB });
    show(crit, t, c.c(4), .6); show(cfg, t, c.c(5), .6);
  };
});

// ---------------------------------------------------------------- bearing results
scene('bresult', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', html: '軸承結果：整體 RMSE <span class="small">（越低越好）</span>' });
  const g = svgLayer(root);
  const groups = [{ name: '3L-10U', sub: '缺乏失效資料', vals: [6.3119, 6.2905, 6.0379, 5.2674], std: [1.2980, 1.2593, 1.0903, 0.4851] },
    { name: '10L-10U', sub: '失效資料較多', vals: [5.2051, 5.0116, 4.9382, 4.7928], std: [0.3501, 0.4143, 0.3075, 0.2637] }];
  const ch = barChart(root, g, 190, 290, 940, 430, groups, SERIES, 8, { step: 2 });
  const co1 = box(root, 1230, 260, { class: 'card', html: '<div class="h3" style="font-size:30px">3L-10U</div><div class="body" style="font-size:27px">vs 最佳單一網路 RBN <b class="c-green">−16.3%</b><br>vs 兩者組合 <b class="c-green">−12.8%</b></div>', style: { padding: '18px 24px', width: '540px' } });
  const co2 = box(root, 1230, 455, { class: 'card', html: '<div class="body" style="font-size:27px">標準差（穩健度）<br><b>≈ 1.3</b> → <b class="c-green">0.49</b></div>', style: { padding: '18px 24px', width: '540px' } });
  const co3 = box(root, 1230, 600, { class: 'card', html: '<div class="h3" style="font-size:30px">10L-10U</div><div class="body" style="font-size:27px">vs 最佳單一網路 <b class="c-green">−4.4%</b></div>', style: { padding: '18px 24px', width: '540px' } });
  const co4 = box(root, 1230, 755, { class: 'tag t-purple wrap', html: '失效資料越少，<br>停機資料越有價值', style: { fontSize: '30px', width: '540px' } });
  const crit = box(root, 190, 840, { class: 'small', html: '臨界時間 RMSE（3L-10U）：COPROG <b>4.55</b>　vs　RBN 5.37、組合 5.14（−15.2% / −11.5%）' });
  return t => {
    show(head, t, c.c(0) - .3, .6);
    ch.axis(t, c.c(0) - .2);
    ch.bar(0, 3, t, c.c(0) + 1.2, 1);
    [0, 1, 2].forEach(i => ch.bar(0, i, t, c.c(1) + i * .7, .8));
    show(co1, t, c.c(2), .5);
    ch.err(0, t, c.c(3)); show(co2, t, c.c(3) + .5, .5);
    [0, 1, 2, 3].forEach(i => ch.bar(1, i, t, c.c(4) + i * .3, .7)); ch.err(1, t, c.c(4) + 1.5); show(co3, t, c.c(4) + 1, .5);
    show(co4, t, c.c(5), .5); show(crit, t, c.c(5) + 1, .5);
  };
});

// ---------------------------------------------------------------- bearing scatter (paper Fig. 6)
scene('bscatter', (root, c) => {
  const leg = box(root, 960, 140, { html: '<div style="display:flex;gap:18px;font-size:28px;font-weight:700"><span class="tag t-green">● 綠：初始網路（只用失效資料）</span><span class="tag t-red">● 紅：協同訓練後</span><span class="tag t-gray">━ 黑：真實 RUL</span></div>' }, 'tc');
  const fig = figCard(root, 960, 230, 1560, 'assets/fig6.png', '論文 Fig. 6：3L-10U 情境下，(a) FFNN 與 (b) RBN 在協同訓練前後的 RUL 預測', 'tc');
  const tag = box(root, 960, 848, { class: 'tag t-green', text: '協同訓練後：更貼近真實值，離群點減少', style: { fontSize: '30px' } }, 'tc');
  return t => { show(leg, t, c.c(0), .5); show(fig, t, c.c(0) + .2, .7); show(tag, t, c.c(1), .5); };
});

// ---------------------------------------------------------------- fan
scene('fan', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', html: '案例二：電子散熱風扇 <span class="small">（真實實驗）</span>' });
  const g = svgLayer(root);
  const fan = Icons.fan(g, 400, 520, 170);
  const uses = box(root, 400, 760, { html: '<div style="display:flex;gap:12px"><span class="tag t-blue" style="font-size:26px">電子產品散熱</span><span class="tag t-blue" style="font-size:26px">化工廠冷卻塔</span></div>' }, 'tc');
  const f8 = figCard(root, 760, 220, 1000, 'assets/fig8.png', '論文 Fig. 8：(a) 測試治具　(b) 扇葉上的不平衡配重');
  const acc = box(root, 760, 790, { html: '<div style="display:flex;gap:12px"><span class="tag t-red" style="font-size:26px">滾珠軸承加入細小金屬顆粒</span><span class="tag t-red" style="font-size:26px">扇葉加裝不平衡配重</span><span class="tag t-gray" style="font-size:26px">→ 加速劣化</span></div>' });
  const f9 = figCard(root, 760, 220, 1000, 'assets/fig9.png', '論文 Fig. 9：感測器安裝 (a) 加速度計 (b) 電壓 (c) 熱電偶');
  const sens = box(root, 760, 610, { html: '<div style="display:flex;gap:12px"><span class="tag t-purple" style="font-size:26px">加速度計 → 振動</span><span class="tag t-purple" style="font-size:26px">電路板電壓</span><span class="tag t-purple" style="font-size:26px">熱電偶 → 溫度</span></div>' });
  const n32 = box(root, 760, 700, { class: 'h2', html: '<span class="c-red">32</span> 台風扇，全部運轉到失效' });
  return t => {
    show(head, t, c.c(0) - .3, .6);
    fan.spin(t * 220 * (1 - .6 * P(t, c.c(1), 3)));
    show(fan, t, c.c(0), .6); show(uses, t, c.c(0) + 1.5, .5);
    show(f8, t, c.c(1), .6, { out: c.c(2) - .2 }); show(acc, t, c.c(1) + 2.5, .5, { out: c.c(2) - .2 });
    show(f9, t, c.c(2), .6); show(sens, t, c.c(2) + 1, .5); show(n32, t, c.c(2) + 4.5, .6);
  };
});

// ---------------------------------------------------------------- fan features & data
scene('fanfeat', (root, c) => {
  const g = svgLayer(root);
  const head = box(root, 150, 110, { class: 'h2', text: '風扇：特徵與資料' });
  const r = rng(77);
  const mk = (y, title, ok, fn) => {
    const el = card(root, 150, y, 600, 0, { pad: 16 });
    h('div', { class: 'body', html: `<b>${title}</b>　<span class="tag ${ok ? 't-green' : 't-red'}" style="font-size:22px">${ok ? '✓ 有劣化趨勢' : '✗ 看不出趨勢'}</span>`, style: { fontSize: '26px' } }, el);
    const sv = miniSvg(el, 560, 90);
    let d = ''; for (let i = 0; i <= 160; i++) d += (i ? 'L' : 'M') + (i / 160 * 560).toFixed(1) + ' ' + (82 - fn(i / 160) * 74).toFixed(1);
    const p = path(sv, d, { stroke: ok ? 'var(--blue)' : 'var(--mute)', w: 2.5 });
    return [el, p];
  };
  const [c1, p1] = mk(220, '振動', true, u => clamp(.1 + (u > .4 ? Math.pow((u - .4) / .6, 1.3) * .75 : 0) + (r() - .5) * .14));
  const [c2, p2] = mk(420, '電壓', false, u => .5 + (r() - .5) * .25);
  const [c3, p3] = mk(620, '溫度', false, u => .45 + .05 * Math.sin(u * 8) + (r() - .5) * .2);
  const feat = card(root, 820, 220, 950, 0, { pad: 22 });
  feat.innerHTML = `<div class="h3" style="font-size:31px;margin-bottom:6px">特徵：前五個共振頻率處的頻譜 RMS</div><div style="font-size:28px">${tex('\\text{RMS}=\\sqrt{\\tfrac{1}{n}\\textstyle\\sum_{i=1}^{n}x_i^2}')}</div>`;
  const f10 = figCard(root, 820, 410, 470, 'assets/fig10.png', '論文 Fig. 10');
  const irr = box(root, 1055, 820, { class: 'tag t-red', text: '不規則、非單調', style: { fontSize: '26px' } }, 'tc');
  const split = card(root, 1330, 410, 440, 0, { pad: 20 });
  split.innerHTML = `<div class="h3" style="font-size:30px;margin-bottom:8px">32 台怎麼分？</div><div class="body" style="font-size:25px">訓練 <b>20</b> 台<br>　<span class="c-red">10 失效</span> ＋ <span class="c-teal">10 停機</span><br>測試 <b>12</b> 台<br><span class="small">1 週期 ＝ 10 分鐘</span></div>`;
  const rep = card(root, 1330, 700, 440, 0, { pad: 18 });
  rep.innerHTML = `<div class="body" style="font-size:25px">重複 <b>20</b> 次<br>臨界時間 ＝ 最後 <b>30</b> 週期</div>`;
  return t => {
    show(head, t, c.c(0) - .3, .6);
    [[c1, p1], [c2, p2], [c3, p3]].forEach(([e, p], i) => { show(e, t, c.c(0) + i * .5, .5); draw(p, t, c.c(0) + .3 + i * .5, 1.2, { ease: Ease.lin }); });
    show(feat, t, c.c(1), .6);
    show(f10, t, c.c(2), .6); pop(irr, t, c.c(2) + 1.5, .4);
    show(split, t, c.c(3), .6); show(rep, t, c.c(4), .6);
  };
});

// ---------------------------------------------------------------- fan results
scene('fresult', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', html: '風扇結果：整體 RMSE <span class="small">（越低越好）</span>' });
  const g = svgLayer(root);
  const groups = [{ name: '3L-10U', sub: '缺乏失效資料', vals: [19.0431, 19.4701, 18.5584, 12.9755], std: [3.4209, 4.3246, 3.2867, 3.1942] },
    { name: '10L-10U', sub: '失效資料較多', vals: [17.1744, 16.2880, 16.0987, 9.7529], std: [2.3004, 2.4111, 2.1980, 1.3414] }];
  const ch = barChart(root, g, 190, 290, 940, 430, groups, SERIES, 25, { step: 5 });
  const co1 = box(root, 1230, 260, { class: 'card', html: '<div class="h3" style="font-size:30px">3L-10U</div><div class="body" style="font-size:27px">vs 最佳單一網路 FFNN <b class="c-green">−31.9%</b></div>', style: { padding: '18px 24px', width: '540px' } });
  const co2 = box(root, 1230, 410, { class: 'card', html: '<div class="h3" style="font-size:30px">10L-10U</div><div class="body" style="font-size:27px">vs 最佳單一網路 RBN <b class="c-green">−40.1%</b></div>', style: { padding: '18px 24px', width: '540px' } });
  const crit = box(root, 1230, 560, { class: 'card', html: `<div class="h3" style="font-size:28px;margin-bottom:6px">臨界時間 RMSE</div><table class="tb" style="font-size:23px;width:100%"><tr><th></th><th>最佳單一</th><th>COPROG</th></tr><tr><td>3L-10U</td><td>20.56</td><td class="c-green"><b>13.87</b></td></tr><tr><td>10L-10U</td><td>17.16</td><td class="c-green"><b>10.13</b></td></tr></table>`, style: { padding: '16px 22px', width: '540px' } });
  const f11 = figCard(root, 960, 200, 680, 'assets/fig11.png', '論文 Fig. 11：一台測試風扇的 RUL 預測（3L-10U）', 'tc');
  const ov = box(root, 1330, 480, { class: 'tag t-green wrap', html: '紅點（COPROG）<br>幾乎貼著黑線（真實值）', style: { fontSize: '28px' } });
  return t => {
    show(head, t, c.c(0) - .3, .6);
    const out = c.c(3) - .3, ok = 1 - P(t, out, .4);
    ch.axis(t, c.c(0) - .2);
    [0, 1, 2, 3].forEach(i => ch.bar(0, i, t, c.c(0) + .5 + i * .6, .8));
    show(co1, t, c.c(1), .5, { out });
    [0, 1, 2, 3].forEach(i => ch.bar(1, i, t, c.c(1) + 2.2 + i * .3, .7)); show(co2, t, c.c(1) + 3.6, .5, { out });
    show(crit, t, c.c(2), .5, { out });
    opacity(ch.grp, ok); opacity(ch.legend, Math.min(+ch.legend.style.opacity, ok));
    show(f11, t, c.c(3), .6); show(ov, t, c.c(3) + 2, .5);
  };
});

// ---------------------------------------------------------------- summary
scene('summary', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '重點整理' });
  const items = [
    ['1', '問題轉換', '停機資料 ＝ 無標籤資料 → 壽命預測變成「半監督迴歸」', 'var(--teal)'],
    ['2', '互相標註', 'FFNN 與 RBN 交換標註；信心 ＝ 能讓既有誤差降低多少', 'var(--blue)'],
    ['3', '加權組合', '最佳化權重；軸承與風扇實驗都更準、更穩定', 'var(--green)'],
  ];
  const cards = items.map(([n, tt, body, col], i) => {
    const el = card(root, 150, 220 + i * 200, 1620, 170, { pad: 24, style: { display: 'flex', alignItems: 'center', gap: '30px' } });
    h('div', { class: 'h1', text: n, style: { width: '110px', height: '110px', borderRadius: '50%', background: col, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' } }, el);
    h('div', { html: `<div class="h3">${tt}</div><div class="body" style="font-size:30px">${body}</div>` }, el);
    return el;
  });
  return t => { show(head, t, c.c(0), .6); cards.forEach((e, i) => show(e, t, c.c(1 + i), .6, { dx: -40, dy: 0 })); };
});

// ---------------------------------------------------------------- future work
scene('future', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '作者提出的未來方向' });
  const items = [
    ['部分標籤', '停機資料 ＋ 檢修人員觀察到的健康狀況', 't-blue'],
    ['更多停機資料', '從壽命更早的階段擷取，擴大訓練資料', 't-teal'],
    ['使用準則', '無標籤資料不一定有幫助：何時用、怎麼用？', 't-orange'],
  ];
  const cards = items.map(([tt, body, cl], i) => {
    const el = card(root, 150 + i * 560, 260, 500, 330, { pad: 30 });
    h('span', { class: 'tag ' + cl, text: `方向 ${i + 1}`, style: { fontSize: '26px' } }, el);
    h('div', { class: 'h2', text: tt, style: { margin: '18px 0 14px' } }, el);
    h('div', { class: 'body', text: body, style: { fontSize: '30px' } }, el);
    return el;
  });
  return t => { show(head, t, c.c(0) - .5, .6); cards.forEach((e, i) => show(e, t, c.c(i) + (i === 0 ? .6 : 0), .6, { dy: 40 })); };
});

// ---------------------------------------------------------------- beyond the paper
scene('beyond', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '延伸地圖：這篇論文的位置' });
  const g = svgLayer(root);
  const center = box(root, 960, 520, { class: 'card center', html: '<div class="h3">COPROG（2015）</div><div class="small">感測訊號 → 個別設備的 RUL</div>', style: { padding: '18px 30px', borderWidth: '4px', background: '#fff8e1' } }, 'c');
  const L = card(root, 150, 230, 560, 0, { pad: 22 });
  L.innerHTML = '<div class="h3">存活分析</div><div class="small en" style="margin-bottom:8px">Weibull · Kaplan–Meier · Cox</div>';
  const lsv = miniSvg(L, 500, 120);
  line(lsv, 10, 110, 490, 110, { w: 2.5 }); line(lsv, 10, 110, 10, 5, { w: 2.5 });
  const km = path(lsv, 'M10 15 H90 V30 H150 V48 H230 V62 H290 V80 H370 V92 H480', { stroke: 'var(--purple)', w: 4 });
  h('div', { class: 'body', html: '天生就能處理設限資料<br>描述<b>整個族群</b>的壽命分布', style: { fontSize: '25px', marginTop: '8px' } }, L);
  const R = card(root, 1210, 230, 560, 0, { pad: 22 });
  R.innerHTML = '<div class="h3">深度學習 RUL 預測</div><div class="small en" style="margin-bottom:8px">LSTM · CNN · Transformer</div><div class="body" style="font-size:25px">常見基準：<b>NASA C-MAPSS</b><br>渦輪引擎模擬資料集</div>';
  const B = card(root, 960, 680, 760, 0, { anchor: 'tc', pad: 22 });
  B.innerHTML = '<div class="h3">深度半監督學習</div><div class="body" style="font-size:25px">偽標籤（pseudo-label）、自我訓練、師生模型…<br>「只挑有把握的偽標籤」的想法一脈相承</div>';
  const l1 = line(g, 760, 500, 710, 420, { w: 3, dash: '8 8' }), l2 = line(g, 1160, 500, 1210, 420, { w: 3, dash: '8 8' }), l3 = line(g, 960, 580, 960, 680, { w: 3, dash: '8 8' });
  return t => {
    show(head, t, c.c(0) - .3, .6); pop(center, t, c.c(0) + .4, .5);
    show(L, t, c.c(1), .6); draw(km, t, c.c(1) + .5, 1.4); opacity(l1, P(t, c.c(1), .4));
    const k = P(t, c.c(2), .5); center.style.borderColor = k > 0 ? 'var(--orange)' : '';
    show(R, t, c.c(3), .6); opacity(l2, P(t, c.c(3), .4));
    show(B, t, c.c(4), .6); opacity(l3, P(t, c.c(4), .4));
  };
});

// ---------------------------------------------------------------- limitations
scene('limits', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '值得思考的限制' });
  const items = [
    ['停機時間的假設', '停機資料設定在壽命 90%–100% 截斷，很接近失效；真實世界的停機可能早得多'],
    ['計算成本', '每評估一個候選單元，就要重新訓練一次網路'],
    ['特徵單一', '兩個案例都只用一種感測特徵（熵 / RMS），多感測器系統還需驗證'],
  ];
  const cards = items.map(([tt, body], i) => {
    const el = card(root, 150, 220 + i * 200, 1620, 170, { pad: 24, style: { display: 'flex', alignItems: 'center', gap: '28px' } });
    h('div', { class: 'h1', text: '!', style: { width: '100px', height: '100px', borderRadius: '24px', background: 'var(--orange-soft)', color: 'var(--orange)', border: '3px solid var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' } }, el);
    h('div', { html: `<div class="h3">${i + 1}. ${tt}</div><div class="body" style="font-size:29px">${body}</div>` }, el);
    return el;
  });
  return t => { show(head, t, c.c(0) - .2, .6); cards.forEach((e, i) => show(e, t, c.c(1 + i), .6, { dx: -40, dy: 0 })); };
});

// ---------------------------------------------------------------- outro
scene('outro', (root, c) => {
  const g = svgLayer(root);
  const fan = Icons.fan(g, 960, 330, 130);
  const msg = box(root, 960, 520, { class: 'h1 center', html: '還沒壞的機器，<span class="hl">資料也很有價值</span>' }, 'tc');
  const ref = box(root, 960, 660, { class: 'card wrap', html: '<div class="small en" style="color:var(--ink);font-size:22px">C. Hu, B. D. Youn, T. Kim, P. Wang (2015). A co-training-based approach for prediction of remaining useful life utilizing both failure and suspension data. <i>Mechanical Systems and Signal Processing</i>, 62–63, 75–90. doi:10.1016/j.ymssp.2015.03.004</div><div class="small" style="margin-top:6px;font-size:20px">本影片為學習用導讀；圖表部分取自原論文，示意圖為重繪。</div>', style: { padding: '16px 24px', width: '1300px' } }, 'tc');
  return t => {
    show(fan, t, 0, .6); fan.spin(t * 90);
    show(msg, t, c.c(1), .7); show(ref, t, c.c(1) + 1.5, .6);
  };
});
