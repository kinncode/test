// chapters 4–6: the two networks, the COPROG algorithm, why it works

// ---------------------------------------------------------------- ann (FFNN)
scene('ann', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', html: '兩位學生 ＝ 兩種類神經網路' });
  const bA = box(root, 860, 122, { class: 'tag t-blue', html: '<i>h</i><sub>1</sub> ＝ FFNN', style: { fontSize: '30px' } });
  const bB = box(root, 1090, 122, { class: 'tag t-orange', html: '<i>h</i><sub>2</sub> ＝ RBN', style: { fontSize: '30px' } });
  const fn = box(root, 960, 215, { class: 'body', html: '<div style="display:flex;align-items:center;gap:18px"><span class="tag t-gray" style="font-size:28px">感測資料 x</span>→<span class="card" style="padding:8px 22px;font-size:30px">' + tex('f(\\mathbf{x};\\,\\mathbf{W})') + '</span>→<span class="tag t-blue" style="font-size:28px">預測 RUL</span><span class="small">（訓練＝調整權重 W）</span></div>' }, 'tc');
  const g = svgLayer(root);
  const LX = [400, 760, 1100], cy = 620;
  const ins = [0, 1, 2].map(i => [LX[0], cy + (i - 1) * 130]);
  const hid = Array.from({ length: 8 }, (_, i) => [LX[1], cy + (i - 3.5) * 60]);
  const out = [[LX[2], cy]];
  const edges = s('g', {}, g);
  const E1 = [], E2 = [];
  ins.forEach(a => hid.forEach(b => E1.push([a, b, line(edges, a[0], a[1], b[0], b[1], { stroke: '#b9b2a3', w: 2 })])));
  hid.forEach(a => out.forEach(b => E2.push([a, b, line(edges, a[0], a[1], b[0], b[1], { stroke: '#b9b2a3', w: 2 })])));
  const nodes = [...ins.map(p => [p, 'var(--teal-soft)']), ...hid.map(p => [p, 'var(--blue-soft)']), ...out.map(p => [p, 'var(--green-soft)'])]
    .map(([p, f]) => s('circle', { cx: p[0], cy: p[1], r: 24, fill: f, stroke: 'var(--ink)', 'stroke-width': 3.5 }, g));
  const inl = ['年齡', '感測值 (t)', '感測值 (t−1)'].map((tx, i) => svgText(g, LX[0] - 40, ins[i][1], tx, { size: 26, anchor: 'end' }));
  const outl = svgText(g, LX[2] + 40, cy, 'RUL', { size: 30, anchor: 'start', family: 'Inter', fill: 'var(--green)' });
  const layl = [['輸入層', LX[0]], ['隱藏層', LX[1]], ['輸出層', LX[2]]].map(([tx, x]) => svgText(g, x, 360, tx, { size: 28, fill: 'var(--mute)' }));
  const pulses = s('g', {}, g);
  const dots = [...E1, ...E2].map(() => s('circle', { r: 6, fill: 'var(--blue)' }, pulses));
  // activation insets
  const mkInset = (y, title, fnc, col) => {
    const el = card(root, 1330, y, 470, 0, { pad: 20 });
    h('div', { class: 'h3', html: title, style: { fontSize: '30px', marginBottom: '6px' } }, el);
    const sv = miniSvg(el, 420, 150);
    line(sv, 10, 75, 410, 75, { w: 2, stroke: 'var(--faint)' }); line(sv, 210, 5, 210, 145, { w: 2, stroke: 'var(--faint)' });
    const p = path(sv, fpath(fnc, -1, 1, 80, u => 210 + u * 190, v => 75 - v * 62), { stroke: col, w: 4.5 });
    return [el, p];
  };
  const [i1, p1] = mkInset(380, '隱藏層：雙曲正切 <span class="en">tanh</span>', u => Math.tanh(u * 3.2), 'var(--blue)');
  const [i2, p2] = mkInset(620, '輸出層：線性函數', u => u * .9, 'var(--green)');
  return t => {
    show(head, t, c.c(0) - .2, .6); pop(bA, t, c.c(0) + .8, .5); pop(bB, t, c.c(0) + 1.2, .5);
    show(fn, t, c.c(1), .6);
    nodes.forEach((n, i) => pop(n, t, c.c(2) + (i < 3 ? 0 : i < 11 ? .5 + (i - 3) * .06 : 1.1), .4));
    E1.forEach(([, , l], i) => draw(l, t, c.c(2) + .3 + i * .02, .5));
    E2.forEach(([, , l], i) => draw(l, t, c.c(2) + 1 + i * .03, .4));
    inl.forEach((e, i) => opacity(e, P(t, c.c(2) + .2 + i * .1, .4))); opacity(outl, P(t, c.c(2) + 1.2, .4));
    layl.forEach((e, i) => opacity(e, P(t, c.c(2) + i * .4, .4)));
    const on = P(t, c.c(2) + 1.8, .4);
    const per = 2.2, ph = (((t - c.c(2) - 1.8) % per) + per) % per / per * 2;
    [...E1, ...E2].forEach(([a, b], i) => {
      const first = i < E1.length, u = first ? ph : ph - 1;
      const vis = on * (u >= 0 && u <= 1 ? Math.sin(Math.PI * u) : 0);
      const d = dots[i]; d.setAttribute('cx', lerp(a[0], b[0], clamp(u))); d.setAttribute('cy', lerp(a[1], b[1], clamp(u)));
      d.setAttribute('fill', first ? 'var(--teal)' : 'var(--blue)'); d.style.opacity = vis;
    });
    show(i1, t, c.c(3), .6); draw(p1, t, c.c(3) + .4, 1);
    show(i2, t, c.c(3) + 2.4, .6); draw(p2, t, c.c(3) + 2.8, .8);
  };
});

// ---------------------------------------------------------------- inputs
scene('inputs', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '輸入要放什麼？' });
  const g = svgLayer(root);
  const ax = axes(g, 160, 330, 720, 400, { xlabel: '量測時間', ylabel: '感測值' });
  const r = rng(5); const nz = Array.from({ length: 31 }, () => (r() - .5) * .05);
  const sig = i => .18 + nz[i] + (i > 12 ? Math.pow((i - 12) / 18, 2) * .6 : 0);
  let d = ''; for (let i = 0; i <= 22; i++) d += (i ? 'L' : 'M') + ax.X(i / 30) + ' ' + ax.Y(sig(i));
  const sp = path(g, d, { stroke: 'var(--ink)', w: 3.5 });
  const pts = []; for (let i = 0; i <= 22; i++) pts.push(s('circle', { cx: ax.X(i / 30), cy: ax.Y(sig(i)), r: 5, fill: 'var(--ink)' }, g));
  const pA = [ax.X(21 / 30), ax.Y(sig(21))], pB = [ax.X(22 / 30), ax.Y(sig(22))];
  const dA = s('circle', { cx: pA[0], cy: pA[1], r: 13, fill: 'var(--blue-soft)', stroke: 'var(--blue)', 'stroke-width': 4 }, g);
  const dB = s('circle', { cx: pB[0], cy: pB[1], r: 13, fill: 'var(--blue)', stroke: 'var(--blue)', 'stroke-width': 4 }, g);
  const lA = svgText(g, pA[0] - 20, pA[1] + 52, 't−1', { size: 26, fill: 'var(--blue)', family: 'Inter' });
  const lB = svgText(g, pB[0] + 30, pB[1] + 44, 't', { size: 28, fill: 'var(--blue)', family: 'Inter' });
  const k = (pB[1] - pA[1]) / (pB[0] - pA[0]);
  const slope = line(g, pA[0] - 70, pA[1] - 70 * k, pB[0] + 70, pB[1] + 70 * k, { stroke: 'var(--orange)', w: 5 });
  const sl = svgText(g, pB[0] - 30, pB[1] - 110, '變化率 → 劣化趨勢', { size: 30, fill: 'var(--orange)', anchor: 'end' });
  const vec = card(root, 1000, 240, 780, 0, { pad: 26 });
  vec.innerHTML = `<div class="h3" style="margin-bottom:10px">每一筆輸入 x</div>
   <div style="display:grid;grid-template-columns:auto 1fr;gap:10px 18px;font-size:30px;align-items:center" class="bigk">
    <span class="tag t-gray">${tex('x_1')}</span><span>正規化的<b>年齡</b></span>
    <span class="tag t-blue">${tex('x_2')}</span><span>感測值（<b>目前</b> t）</span>
    <span class="tag t-blue">${tex('x_3')}</span><span>感測值（<b>前一次</b> t−1）</span>
   </div>
   <div style="margin-top:14px;font-size:28px">→ 輸出：正規化 RUL ${tex('L^P')}</div>`;
  const form = card(root, 1000, 590, 780, 0, { pad: 24 });
  form.innerHTML = `<div style="font-size:34px" class="center">${tex('\\mathbf{x} = (x_1, x_2, \\ldots, x_{2N_s+1})')}</div>
   <div class="body center" style="font-size:27px;margin-top:8px">${tex('N_s')} 個感測器 → ${tex('2N_s+1')} 個輸入<br><span class="c-mute">本論文的兩個案例都只用 1 個特徵 → 3 個輸入</span></div>`;
  const why = card(root, 1000, 590, 780, 0, { pad: 24, style: { background: '#fffaf0' } });
  why.innerHTML = `<div class="h3" style="margin-bottom:8px">為什麼只用兩個時間點？</div>
   <div class="body" style="font-size:28px">① 太舊的資料，會稀釋最新的資訊<br>② 輸入越多 → 權重越多 → 越容易過度擬合</div>`;
  return t => {
    show(head, t, c.c(0) - .3, .6);
    ax.anim(t, c.c(0), .6); draw(sp, t, c.c(0) + .3, 1.6, { ease: Ease.lin });
    pts.forEach((p, i) => opacity(p, P(t, c.c(0) + .3 + i * 1.6 / 22, .1)));
    pop(dA, t, c.c(0) + 2.1, .4); pop(dB, t, c.c(0) + 2.4, .4); opacity(lA, P(t, c.c(0) + 2.2, .3)); opacity(lB, P(t, c.c(0) + 2.5, .3));
    show(vec, t, c.c(0) + 1, .6);
    draw(slope, t, c.c(1) + .2, .7); show(sl, t, c.c(1) + .7, .5);
    show(form, t, c.c(2), .6, { out: c.c(3) - .2 });
    show(why, t, c.c(3), .6);
  };
});

// ---------------------------------------------------------------- training (SSE, overfitting, early stopping)
scene('training', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '怎麼訓練？怎麼避免死背？' });
  const sse = card(root, 150, 220, 760, 0, { pad: 24 });
  sse.innerHTML = `<div class="h3" style="margin-bottom:6px">誤差平方和 SSE</div><div style="font-size:32px" class="center">${tex('SSE = \\sum_{k=1}^{N} e_k^2 = \\sum_{k=1}^{N}\\left(L_k^P - L_k^T\\right)^2')}</div><div class="small center" style="margin-top:4px">${tex('L^P')}：預測值　${tex('L^T')}：真實值　越小越好</div>`;
  const g = svgLayer(root);
  // overfitting panel
  const ofx = 150, ofy = 520, ofw = 760, ofh = 330;
  const frame = s('rect', { x: ofx, y: ofy, width: ofw, height: ofh, rx: 18, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
  const r = rng(21);
  const P0 = Array.from({ length: 11 }, (_, i) => { const u = .06 + i * .088; return [u, .25 + .45 * u + (r() - .5) * .36]; });
  const X = u => ofx + 40 + u * (ofw - 80), Y = v => ofy + ofh - 40 - v * (ofh - 110);
  const dots = P0.map(([u, v]) => s('circle', { cx: X(u), cy: Y(v), r: 8, fill: 'var(--ink)' }, g));
  // wiggly interpolant through all points (Catmull-Rom)
  let wd = `M${X(P0[0][0])} ${Y(P0[0][1])}`;
  for (let i = 0; i < P0.length - 1; i++) {
    const p0 = P0[Math.max(0, i - 1)], p1 = P0[i], p2 = P0[i + 1], p3 = P0[Math.min(P0.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6 * 1.8], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6 * 1.8];
    wd += ` C${X(c1[0])} ${Y(c1[1])} ${X(c2[0])} ${Y(c2[1])} ${X(p2[0])} ${Y(p2[1])}`;
  }
  const wig = path(g, wd, { stroke: 'var(--red)', w: 4 });
  const good = path(g, fpath(u => .25 + .45 * u, 0, 1, 10, X, Y), { stroke: 'var(--green)', w: 5 });
  const lw = svgText(g, ofx + 30, ofy + 36, '死背每一點：過度擬合', { size: 26, anchor: 'start', fill: 'var(--red)' });
  const lg = svgText(g, ofx + ofw - 30, ofy + 36, '抓住趨勢', { size: 26, anchor: 'end', fill: 'var(--green)' });
  // split bar
  const split = box(root, 1000, 230, { class: 'wrap', html: `<div class="h3" style="margin-bottom:12px">資料分兩份</div>
   <div style="display:flex;width:780px;height:74px;border:3px solid var(--ink);border-radius:14px;overflow:hidden;font-size:28px;font-weight:700">
    <div style="flex:60;background:var(--blue-soft);display:flex;align-items:center;justify-content:center">訓練集：調整權重</div>
    <div style="flex:40;background:#ebe5d8;display:flex;align-items:center;justify-content:center;border-left:3px solid var(--ink)">驗證集：模擬考</div></div>
   <div class="small" style="margin-top:6px">論文案例：60% / 40%</div>` });
  // loss curves
  const ax = axes(g, 1020, 520, 720, 300, { xlabel: '訓練回合', ylabel: '誤差' });
  const ftr = u => .85 * Math.exp(-u * 3.2) + .08, fva = u => .85 * Math.exp(-u * 3.4) + .16 + .55 * Math.pow(Math.max(0, u - .38), 2);
  const ctr = path(g, fpath(ftr, 0, 1, 80, ax.X, ax.Y), { stroke: 'var(--blue)', w: 4.5 });
  const cva = path(g, fpath(fva, 0, 1, 80, ax.X, ax.Y), { stroke: 'var(--mute)', w: 4.5 });
  let um = 0, best = 9; for (let u = 0; u <= 1; u += .005) if (fva(u) < best) { best = fva(u); um = u; }
  const ltr = svgText(g, ax.X(1) - 6, ax.Y(ftr(1)) - 22, '訓練誤差', { size: 24, anchor: 'end', fill: 'var(--blue)' });
  const lva = svgText(g, ax.X(1) - 6, ax.Y(fva(1)) - 24, '驗證誤差', { size: 24, anchor: 'end', fill: 'var(--mute)' });
  const stop = line(g, ax.X(um), ax.Y(0), ax.X(um), ax.Y(.95), { stroke: 'var(--green)', w: 3.5, dash: '8 8' });
  const sdot = s('circle', { cx: ax.X(um), cy: ax.Y(best), r: 11, fill: 'var(--green)' }, g);
  const stx = svgText(g, ax.X(um) + 16, ax.Y(.9), '提前停止', { size: 28, anchor: 'start', fill: 'var(--green)' });
  return t => {
    show(head, t, c.c(0) - .3, .6);
    show(sse, t, c.c(0) + .3, .6);
    opacity(frame, P(t, c.c(1), .4)); dots.forEach((d, i) => pop(d, t, c.c(1) + .2 + i * .05, .3));
    draw(wig, t, c.c(1) + 1, 1.6); opacity(lw, P(t, c.c(1) + 1.6, .4));
    draw(good, t, c.c(1) + 3.6, .8); opacity(lg, P(t, c.c(1) + 4, .4));
    show(split, t, c.c(2), .6);
    ax.anim(t, c.c(3) - .3, .5);
    draw(ctr, t, c.c(3), 2, { ease: Ease.lin }); draw(cva, t, c.c(3), 2, { ease: Ease.lin });
    opacity(ltr, P(t, c.c(3) + 1.8, .3)); opacity(lva, P(t, c.c(3) + 1.8, .3));
    draw(stop, t, c.c(3) + 2.3, .5); pop(sdot, t, c.c(3) + 2.3, .4); opacity(stx, P(t, c.c(3) + 2.6, .4));
  };
});

// ---------------------------------------------------------------- RBN
scene('rbn', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', html: '徑向基底網路 <span class="en c-orange">RBN</span>' });
  const g = svgLayer(root);
  const px = 150, py = 230, pw = 720, ph = 620;
  const frame = s('rect', { x: px, y: py, width: pw, height: ph, rx: 18, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
  const ftitle = svgText(g, px + 24, py + 36, '輸入空間', { size: 26, anchor: 'start', fill: 'var(--mute)' });
  const C = [[.22, .3], [.62, .22], [.8, .62], [.35, .72], [.55, .5]].map(([u, v]) => [px + 60 + u * (pw - 120), py + 70 + v * (ph - 120)]);
  const rings = C.map(([x, y]) => [1, 2, 3].map(k => s('circle', { cx: x, cy: y, r: k * 38, fill: 'none', stroke: 'var(--orange)', 'stroke-width': 2, opacity: .45 }, g)));
  const cents = C.map(([x, y], j) => { const grp = s('g', {}, g); path(grp, `M${x - 12} ${y - 12} L${x + 12} ${y + 12} M${x + 12} ${y - 12} L${x - 12} ${y + 12}`, { stroke: 'var(--orange)', w: 5 }); svgText(grp, x + 20, y - 20, `c${j + 1}`, { size: 22, anchor: 'start', fill: 'var(--orange)', family: 'Inter' }); return grp; });
  const xp = s('circle', { r: 12, fill: 'var(--blue)' }, g);
  const xl = svgText(g, 0, 0, 'x', { size: 30, fill: 'var(--blue)', family: 'Inter' });
  const dl = C.map(() => line(g, 0, 0, 1, 1, { stroke: 'var(--blue)', w: 2.5, dash: '6 6' }));
  const f1 = card(root, 960, 230, 820, 0, { pad: 22 });
  f1.innerHTML = `<div class="body" style="font-size:27px;margin-bottom:4px">距離 → 多諧樣條基底函數</div><div style="font-size:30px">${tex('\\phi(\\mathbf{x},\\mathbf{c}_j)=\\begin{cases}\\lVert\\mathbf{x}-\\mathbf{c}_j\\rVert^{k_j}, & k_j=1,3,5,\\ldots\\\\[2pt] \\lVert\\mathbf{x}-\\mathbf{c}_j\\rVert^{k_j}\\ln\\lVert\\mathbf{x}-\\mathbf{c}_j\\rVert, & k_j=2,4,6,\\ldots\\end{cases}', true)}</div>`;
  const f2 = card(root, 960, 470, 820, 0, { pad: 20 });
  f2.innerHTML = `<div class="body" style="font-size:27px">輸出 ＝ 加權總和</div><div style="font-size:32px">${tex('L^P=\\sum_{j=1}^{M} W_j\\,\\phi(\\mathbf{x},\\mathbf{c}_j)', true)}</div>`;
  const f3 = card(root, 960, 650, 820, 0, { pad: 20 });
  f3.innerHTML = `<div class="body" style="font-size:27px"><b>階段 1</b>　從訓練資料隨機挑出中心點 ${tex('\\mathbf{c}_j')}<br><b>階段 2</b>　偽反矩陣一次解出權重：</div><div style="font-size:32px" class="center">${tex('\\mathbf{W}=(\\Phi^{\\mathsf T}\\Phi)^{-1}\\Phi^{\\mathsf T}\\mathbf{L}')}</div>`;
  const ls = box(root, 1500, 610, { class: 'tag t-green', text: '＝ 最小平方法：一步到位', style: { fontSize: '26px' } });
  const cmp = card(root, 960, 230, 820, 0, { pad: 22 });
  cmp.innerHTML = `<div class="h3" style="margin-bottom:6px">兩位學生的差異</div><table class="tb" style="width:100%;font-size:26px">
    <tr><th></th><th class="c-blue">FFNN（h₁）</th><th class="c-orange">RBN（h₂）</th></tr>
    <tr><td>隱藏層</td><td>tanh S 形函數</td><td>徑向基底函數</td></tr>
    <tr><td>訓練方式</td><td>反向傳播＋提前停止</td><td>隨機中心＋偽反矩陣</td></tr>
    <tr><td>論文設定</td><td>3 – 8 – 1</td><td>20 個中心、一階</td></tr></table>
    <div class="center" style="margin-top:14px"><span class="tag t-purple" style="font-size:28px">結構不同 → 差異性 → 協同訓練的關鍵</span></div>`;
  return t => {
    show(head, t, c.c(0) - .3, .6);
    opacity(frame, P(t, c.c(0), .4)); opacity(ftitle, P(t, c.c(0), .4));
    cents.forEach((e, i) => pop(e, t, c.c(0) + .5 + i * .25, .4));
    rings.forEach((rr, i) => rr.forEach((e, k) => { e.style.opacity = .45 * P(t, c.c(0) + 1 + i * .2 + k * .1, .4); }));
    const k1 = P(t, c.c(1), .4);
    const ang = (t - c.c(1)) * .5;
    const x = px + pw / 2 + 210 * Math.cos(ang), y = py + ph / 2 + 160 * Math.sin(ang * 1.3);
    xp.setAttribute('cx', x); xp.setAttribute('cy', y); xl.setAttribute('x', x + 24); xl.setAttribute('y', y - 22);
    opacity(xp, k1); opacity(xl, k1);
    dl.forEach((l, j) => { l.setAttribute('d', `M${x} ${y} L${C[j][0]} ${C[j][1]}`); l.style.opacity = k1 * .8; });
    const out5 = c.c(5) - .2;
    show(f1, t, c.c(1) + .3, .6, { out: out5 }); show(f2, t, c.c(2), .6, { out: out5 }); show(f3, t, c.c(3), .6, { out: out5 });
    pop(ls, t, c.c(4), .5, { out: out5 });
    show(cmp, t, c.c(5) + .2, .6);
  };
});

// ---------------------------------------------------------------- shared COPROG diagram pieces
function setBox(root, x, y, label, cls, n, kind) {
  const el = box(root, x, y, { class: 'card center' }, 'c');
  Object.assign(el.style, { padding: '12px 20px', borderColor: cls === 'red' ? 'var(--red)' : cls === 'teal' ? 'var(--teal)' : cls === 'blue' ? 'var(--blue)' : 'var(--orange)' });
  h('div', { class: 'h3', html: label, style: { fontSize: '28px', whiteSpace: 'nowrap' } }, el);
  const row = h('div', { style: { display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '6px', height: '26px', alignItems: 'center' } }, el);
  const chips = [];
  for (let i = 0; i < n; i++) chips.push(h('span', { style: { display: 'inline-block', width: '14px', height: '24px', borderRadius: '4px', background: kind === 'fail' ? 'var(--red)' : 'var(--teal)' } }, row));
  el.row = row; el.chips = chips;
  return el;
}
function algo(root, x, y, which, r = 80) {
  const el = box(root, x, y, { class: 'center' }, 'c');
  Object.assign(el.style, { width: 2 * r + 'px', height: 2 * r + 'px', borderRadius: '50%', border: '4px solid var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: which === 1 ? 'var(--blue-soft)' : 'var(--orange-soft)' });
  h('div', { class: 'h2', html: `<i>h</i><sub style="font-size:.6em">${which}</sub>`, style: { fontSize: '50px', lineHeight: 1, color: which === 1 ? 'var(--blue)' : '#b5650a' } }, el);
  h('div', { class: 'en', text: which === 1 ? 'FFNN' : 'RBN', style: { fontWeight: 800, fontSize: '24px' } }, el);
  return el;
}
function unitCard(root, x, y, label, o = {}) {
  const el = box(root, x, y, { class: 'card center' }, 'c');
  Object.assign(el.style, { width: '108px', padding: '8px 6px', borderColor: 'var(--teal)', borderRadius: '14px' });
  const sv = miniSvg(el, 92, 44, { margin: '0 auto' });
  path(sv, fpath(u => .15 + (u > .4 ? Math.pow((u - .4) / .6, 2) * .7 : 0) + .03 * Math.sin(u * 30 + x), 0, 1, 30, u => 4 + u * 84, v => 40 - v * 36), { stroke: 'var(--teal)', w: 3 });
  h('div', { class: 'en', html: label, style: { fontWeight: 800, fontSize: '22px' } }, el);
  return el;
}

// ---------------------------------------------------------------- setup
scene('setup', (root, c) => {
  const g = svgLayer(root);
  const head = box(root, 150, 110, { class: 'h2', text: '組合起來：COPROG' });
  const U = setBox(root, 960, 230, '停機資料 <span class="mcal">U</span>（無標籤）', 'teal', 10, 'susp');
  const L = setBox(root, 960, 760, '失效資料 <span class="mcal">L</span>（有標籤）', 'red', 3, 'fail');
  const L1 = setBox(root, 520, 760, '<span class="mcal">L</span><sub>1</sub>', 'blue', 3, 'fail');
  const L2 = setBox(root, 1400, 760, '<span class="mcal">L</span><sub>2</sub>', 'orange', 3, 'fail');
  const h1 = algo(root, 520, 480, 1), h2 = algo(root, 1400, 480, 2);
  const a1 = arrow(g, 520, 715, 520, 575, { stroke: 'var(--blue)', w: 6 }), a2 = arrow(g, 1400, 715, 1400, 575, { stroke: 'var(--orange)', w: 6 });
  const t1 = svgText(g, 545, 645, '訓練', { size: 26, anchor: 'start', fill: 'var(--blue)' }), t2 = svgText(g, 1425, 645, '訓練', { size: 26, anchor: 'start', fill: 'var(--orange)' });
  return t => {
    show(head, t, c.c(0) - .2, .6);
    show(U, t, c.c(1) + 2, .6); show(L, t, c.c(1), .6, { out: c.c(2) + 1.2, outD: .3 });
    const k = Ease.inOut(P(t, c.c(2) + .6, .9));
    [[L1, 520], [L2, 1400]].forEach(([e, x]) => { e.style.left = lerp(960, x, k) + 'px'; opacity(e, P(t, c.c(2) + .6, .2)); });
    pop(h1, t, c.c(2) + 2, .5); pop(h2, t, c.c(2) + 3.6, .5);
    a1.anim(t, c.c(2) + 1.6, .5); a2.anim(t, c.c(2) + 3.2, .5);
    opacity(t1, P(t, c.c(2) + 1.8, .3)); opacity(t2, P(t, c.c(2) + 3.4, .3));
  };
});

// ---------------------------------------------------------------- pool
scene('pool', (root, c) => {
  const g = svgLayer(root);
  const U = setBox(root, 960, 175, '停機資料 <span class="mcal">U</span>', 'teal', 10, 'susp');
  const h1 = algo(root, 330, 560, 1);
  const L1 = setBox(root, 330, 790, '<span class="mcal">L</span><sub>1</sub>', 'blue', 3, 'fail');
  const xs = [700, 860, 1020, 1180, 1340];
  const cards = xs.map((x, i) => unitCard(root, x, 380, `X<sub>${i + 1}</sub>`));
  const poolLab = box(root, 1020, 290, { class: 'small', html: '候選池 <span class="mcal">U</span>′（u = 5）', style: { color: 'var(--teal)', fontWeight: 700 } }, 'c');
  const preds = ['0.42', '0.18', '0.31', '0.55', '0.27'];
  const tags = xs.map((x, i) => box(root, x, 475, { class: 'tag t-blue', html: `L̂ = ${preds[i]}`, style: { fontSize: '22px' } }, 'c'));
  const beams = xs.map(x => arrow(g, 410, 575, x, 500, { stroke: 'var(--blue)', w: 3, head: 12, bend: 40 + (x - 700) * .05 }));
  const ghost = box(root, 1020, 700, { class: 'center' }, 'c');
  Object.assign(ghost.style, { width: '170px', height: '170px', borderRadius: '50%', border: '4px dashed var(--blue)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f1f5ff' });
  h('div', { class: 'h2', html: '<i>h</i><sub style="font-size:.6em">1</sub>′', style: { fontSize: '50px', color: 'var(--blue)', lineHeight: 1 } }, ghost);
  h('div', { class: 'small', text: '新版（重訓）', style: { fontSize: '20px' } }, ghost);
  const plus = box(root, 640, 700, { class: 'h3', html: '<span class="mcal">L</span><sub>1</sub> ＋ X<sub>3</sub>（含猜的答案）', style: { fontSize: '30px' } }, 'c');
  const ar = arrow(g, 820, 700, 925, 700, { stroke: 'var(--blue)', w: 5 });
  const q = box(root, 1260, 700, { class: 'h1', html: '靠譜嗎<span class="c-red">？</span>', style: { fontSize: '64px' } }, 'c');
  return t => {
    show(U, t, 0, .5); show(h1, t, 0, .5); show(L1, t, 0, .5);
    cards.forEach((e, i) => show(e, t, c.c(0) + .8 + i * .25, .5, { dy: -120 }));
    show(poolLab, t, c.c(0) + 2.2, .5);
    beams.forEach((b, i) => b.anim(t, c.c(1) + .4 + i * .3, .5));
    tags.forEach((e, i) => pop(e, t, c.c(1) + .9 + i * .3, .4));
    const sel = P(t, c.c(2), .4);
    cards[2].style.borderWidth = (3 + 3 * sel) + 'px'; cards[2].style.background = sel > 0 ? '#eefaf7' : '';
    show(plus, t, c.c(2) + .3, .5); ar.anim(t, c.c(2) + 1.2, .5); pop(ghost, t, c.c(2) + 1.6, .5);
    pop(q, t, c.c(3) + .2, .5);
  };
});

// ---------------------------------------------------------------- confidence
scene('confidence', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '信心值 Δ：猜得好不好，看「誤差降了多少」' });
  const f = card(root, 960, 210, 1500, 0, { anchor: 'tc', pad: 22 });
  f.innerHTML = `<div style="font-size:34px" class="center">${tex('\\Delta_{j,\\mathbf{X}_u}=\\underbrace{\\sum_{\\mathbf{x}_i\\in\\mathcal{L}_j}\\big(L_i^T-h_j(\\mathbf{x}_i)\\big)^2}_{\\text{舊版 } h_j \\text{ 的誤差}}\\;-\\;\\underbrace{\\sum_{\\mathbf{x}_i\\in\\mathcal{L}_j}\\big(L_i^T-h\'_j(\\mathbf{x}_i)\\big)^2}_{\\text{新版 } h\'_j \\text{ 的誤差}}', true)}</div>`;
  const g = svgLayer(root);
  // old vs new SSE bars
  const by = 840, bh = 300;
  const old = s('rect', { x: 330, y: by, width: 140, height: 0, rx: 8, fill: 'var(--blue-soft)', stroke: 'var(--blue)', 'stroke-width': 3 }, g);
  const nw = s('rect', { x: 560, y: by, width: 140, height: 0, rx: 8, fill: 'var(--blue)', stroke: 'var(--blue)', 'stroke-width': 3 }, g);
  const base = line(g, 280, by, 760, by, { w: 3 });
  const lo = svgText(g, 400, by + 30, '舊版 SSE', { size: 24 }), ln = svgText(g, 630, by + 30, '新版 SSE', { size: 24 });
  const br = path(g, `M720 ${by - bh} h20 V${by - bh * .62} h-20`, { stroke: 'var(--green)', w: 4 });
  const bt = svgText(g, 755, by - bh * .81, 'Δ', { size: 40, anchor: 'start', fill: 'var(--green)', family: 'KaTeX_Main' });
  const lg = card(root, 960, 560, 760, 0, { pad: 22 });
  lg.innerHTML = `<div style="display:flex;flex-direction:column;gap:14px;font-size:30px"><div><span class="tag t-green" style="font-size:30px">Δ > 0</span>　加入後更準 → 可以用</div><div><span class="tag t-green" style="font-size:30px">Δ 越大</span>　標註越可信</div><div><span class="tag t-gray" style="font-size:30px">Δ ≤ 0</span>　不採用</div></div>`;
  // candidate bar charts
  const chart = (x0, w, vals, col, pick, label) => {
    const grp = s('g', {}, g);
    const zero = 760, sc = 90, bw = w / vals.length;
    line(grp, x0, zero, x0 + w, zero, { w: 3 });
    const bars = vals.map((v, i) => {
      const x = x0 + i * bw + bw * .2, hh = Math.abs(v) * sc;
      const rct = s('rect', { x, y: v > 0 ? zero - hh : zero, width: bw * .6, height: hh, rx: 6, fill: v > 0 ? col : '#cfc8b8', opacity: i === pick ? 1 : .55 }, grp);
      svgText(grp, x + bw * .3, zero + (v > 0 ? 30 : -hh - 22) + (v > 0 ? 0 : 0), `X${'₁₂₃₄₅'[i]}`, { size: 24, family: 'Inter', fill: 'var(--ink)' });
      svgText(grp, x + bw * .3, v > 0 ? zero - hh - 18 : zero + hh + 24, (v > 0 ? '+' : '') + v.toFixed(1), { size: 22, family: 'Inter', weight: 500, fill: 'var(--mute)' });
      return rct;
    });
    const star = svgText(grp, x0 + pick * bw + bw / 2 + bw * .42, zero - vals[pick] * sc + 4, '★', { size: 40, fill: 'var(--yellow)' });
    const lab = svgText(grp, x0 + w / 2, 525, label, { size: 30, fill: col });
    grp.parts = { bars, star, lab };
    return grp;
  };
  const c1 = chart(220, 760, [0.6, -0.4, 1.9, 1.1, 0.3], 'var(--blue)', 2, 'h₁ 的候選：挑 Δ 最大 → X₃');
  const c2 = chart(1120, 600, [0.2, 0.9, -0.3, 0.5, 1.6], 'var(--orange)', 4, 'h₂ 的候選：挑 Δ 最大 → X₅');
  const note = box(root, 960, 855, { class: 'small', text: '（長條數值為示意）' }, 'tc');
  return t => {
    show(head, t, c.c(0) - .2, .6);
    show(f, t, c.c(1), .7);
    const out = c.c(3) - .3;
    const k = Ease.out(P(t, c.c(1) + 1.6, .8)), k2 = Ease.out(P(t, c.c(1) + 2.6, .8));
    old.setAttribute('height', bh * k); old.setAttribute('y', by - bh * k);
    nw.setAttribute('height', bh * .62 * k2); nw.setAttribute('y', by - bh * .62 * k2);
    const ob = 1 - P(t, out, .4);
    [old, nw, base, lo, ln].forEach(e => opacity(e, Math.min(P(t, c.c(1) + 1.4, .3), ob)));
    draw(br, t, c.c(1) + 3.6, .5, { out }); opacity(bt, Math.min(P(t, c.c(1) + 3.9, .3), ob));
    show(lg, t, c.c(2), .6, { out });
    const showChart = (ch, t0) => {
      opacity(ch, P(t, t0, .4));
      ch.parts.bars.forEach((b, i) => { b.style.transformOrigin = 'center 760px'; b.style.transformBox = 'view-box'; b.style.transform = `scaleY(${Ease.out(P(t, t0 + .2 + i * .15, .5))})`; });
      pop(ch.parts.star, t, t0 + 1.6, .5);
    };
    showChart(c1, c.c(3)); showChart(c2, c.c(4));
    show(note, t, c.c(3) + 1, .5);
  };
});

// ---------------------------------------------------------------- exchange
scene('exchange', (root, c) => {
  const g = svgLayer(root);
  const head = box(root, 960, 120, { class: 'h1 center', html: '<span class="hl">交換！</span>' }, 'tc');
  const h1 = algo(root, 420, 420, 1), h2 = algo(root, 1500, 420, 2);
  const L1 = setBox(root, 420, 740, '<span class="mcal">L</span><sub>1</sub>', 'blue', 3, 'fail');
  const L2 = setBox(root, 1500, 740, '<span class="mcal">L</span><sub>2</sub>', 'orange', 3, 'fail');
  const X3 = unitCard(root, 640, 420, 'X<sub>3</sub>'), X5 = unitCard(root, 1280, 420, 'X<sub>5</sub>');
  const tg3 = h('div', { class: 'tag t-blue', html: '<i>h</i><sub>1</sub> 標註', style: { fontSize: '18px', padding: '2px 8px', marginTop: '4px' } }, X3);
  const tg5 = h('div', { class: 'tag t-orange', html: '<i>h</i><sub>2</sub> 標註', style: { fontSize: '18px', padding: '2px 8px', marginTop: '4px' } }, X5);
  const p1 = path(g, 'M640 480 C 900 560, 1200 600, 1440 690', { stroke: 'var(--blue)', w: 3.5, dash: '8 10' });
  const p2 = path(g, 'M1280 480 C 1020 560, 720 600, 480 690', { stroke: 'var(--orange)', w: 3.5, dash: '8 10' });
  const tr1 = arrow(g, 420, 690, 420, 515, { stroke: 'var(--blue)', w: 6 }), tr2 = arrow(g, 1500, 690, 1500, 515, { stroke: 'var(--orange)', w: 6 });
  const round = box(root, 960, 260, { class: 'tag t-gray', text: '第 1 輪', style: { fontSize: '32px' } }, 'c');
  const stopc = card(root, 960, 560, 640, 0, { anchor: 'c', pad: 22, style: { background: '#fffaf0' } });
  stopc.innerHTML = `<div class="h3" style="margin-bottom:8px">停止條件（任一成立）</div><div class="body" style="font-size:27px">① 兩邊都找不到 Δ > 0 的單元<br>② 達到最大回合數 T（論文：T = 5）</div>`;
  const bez = (u, P0, P1, P2, P3) => { const v = 1 - u; return v * v * v * P0 + 3 * v * v * u * P1 + 3 * v * u * u * P2 + u * u * u * P3; };
  return t => {
    show(head, t, c.c(0) - .2, .6);
    [h1, h2].forEach(e => show(e, t, 0, .4)); [L1, L2].forEach(e => show(e, t, 0, .4));
    show(X3, t, c.c(0) + .4, .5); show(X5, t, c.c(0) + .6, .5);
    opacity(p1, P(t, c.c(1), .4) * .8); opacity(p2, P(t, c.c(1), .4) * .8);
    const k = Ease.inOut(P(t, c.c(1) + .6, 2.2));
    const fade = 1 - P(t, c.c(1) + 2.6, .3);
    X3.style.left = bez(k, 640, 900, 1200, 1500) + 'px'; X3.style.top = bez(k, 420, 560, 600, 660) + 'px';
    X5.style.left = bez(k, 1280, 1020, 720, 420) + 'px'; X5.style.top = bez(k, 420, 560, 600, 660) + 'px';
    if (k > 0) { X3.style.opacity = fade; X5.style.opacity = fade; }
    const add = P(t, c.c(1) + 2.7, .1) > 0;
    // grow the training sets: +1 per side when the cards land, then +1 per extra round
    const rounds = 1 + Math.floor(clamp((t - c.c(2) - .8) / 1.15, 0, 4));
    const extra = add ? rounds : 0;
    [[L1, 'var(--teal)'], [L2, 'var(--teal)']].forEach(([L, col]) => {
      while (L.chips.length < 3 + extra) L.chips.push(h('span', { style: { display: 'inline-block', width: '14px', height: '24px', borderRadius: '4px', background: col } }, L.row));
      while (L.chips.length > 3 + extra) L.chips.pop().remove();
    });
    tr1.anim(t, c.c(2), .5); tr2.anim(t, c.c(2), .5);
    show(round, t, c.c(2) + .3, .4);
    if (round._r !== rounds) { round._r = rounds; round.textContent = `第 ${rounds} 輪`; }
    show(stopc, t, c.c(3), .6);
  };
});

// ---------------------------------------------------------------- ensemble
scene('ensemble', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '最後：加權組合' });
  const f = card(root, 960, 200, 1120, 0, { anchor: 'tc', pad: 20 });
  f.innerHTML = `<div style="font-size:42px" class="center">${tex('L^P(\\mathbf{x}) = {\\color{#2563eb} w_1\\,h_1(\\mathbf{x})} + {\\color{#e2860b} w_2\\,h_2(\\mathbf{x})}', true)}</div>`;
  const g = svgLayer(root);
  const ax = axes(g, 170, 430, 680, 380, { xlabel: '測試資料', ylabel: 'RUL' });
  const tru = u => .15 + .7 * u, e = u => .09 * Math.sin(u * 9) + .05;
  const ct = path(g, fpath(tru, 0, 1, 40, ax.X, ax.Y), { stroke: 'var(--ink)', w: 4 });
  const c1 = path(g, fpath(u => tru(u) + e(u) + .03, 0, 1, 80, ax.X, ax.Y), { stroke: 'var(--blue)', w: 4 });
  const c2 = path(g, fpath(u => tru(u) - e(u) * .8 - .02, 0, 1, 80, ax.X, ax.Y), { stroke: 'var(--orange)', w: 4 });
  const cm = path(g, fpath(u => tru(u) + .02 * Math.sin(u * 9), 0, 1, 80, ax.X, ax.Y), { stroke: 'var(--purple)', w: 5.5 });
  const leg = box(root, 200, 860, { html: '<span class="c-blue">━ h₁</span>　<span class="c-orange">━ h₂</span>　<span class="c-purple">━ 組合</span>　<span>━ 真實</span>', style: { fontSize: '24px', fontWeight: 700 } });
  const cons = card(root, 1000, 370, 760, 0, { pad: 22 });
  cons.innerHTML = `<div class="h3" style="margin-bottom:6px">限制條件</div><div style="font-size:32px">${tex('w_1+w_2=1,\\quad 0\\le w_1,\\,w_2\\le 1')}</div>`;
  // slider + SSE parabola
  const sx0 = 1060, sx1 = 1700, sy = 860;
  const track = line(g, sx0, sy, sx1, sy, { w: 6, stroke: 'var(--faint)' });
  const ka = svgText(g, sx0, sy + 40, 'w₁ = 0', { size: 24, family: 'Inter' }), kb = svgText(g, sx1, sy + 40, 'w₁ = 1', { size: 24, family: 'Inter' });
  const wopt = .42;
  const par = path(g, fpath(u => .12 + 1.5 * Math.pow(u - wopt, 2), 0, 1, 60, u => sx0 + u * (sx1 - sx0), v => sy - 30 - v * 170), { stroke: 'var(--purple)', w: 4 });
  const sseL = svgText(g, sx1 + 10, sy - 30 - (.12 + 1.5 * Math.pow(1 - wopt, 2)) * 170, 'SSE', { size: 26, anchor: 'start', fill: 'var(--purple)', family: 'Inter' });
  const knob = s('circle', { cy: sy, r: 16, fill: 'var(--purple)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
  const opt = card(root, 1000, 520, 760, 0, { pad: 18, style: { background: 'var(--purple-soft)', borderColor: 'var(--purple)' } });
  opt.innerHTML = `<div style="font-size:26px">${tex('\\min_{w_1,w_2}\\; \\sum_{\\mathbf{x}_i\\in\\mathcal{L}}\\big(L_i^T-(w_1h_1(\\mathbf{x}_i)+w_2h_2(\\mathbf{x}_i))\\big)^2')}</div><div class="body" style="font-size:26px">以序列二次規劃 <b class="en">SQP</b> 求解</div>`;
  const wv = box(root, 1380, 400, { class: 'tag t-purple', text: '準的網路 → 權重較大', style: { fontSize: '34px' } }, 'tc');
  return t => {
    show(head, t, c.c(0) - .2, .6); show(f, t, c.c(0), .6);
    ax.anim(t, c.c(0) + .4, .5);
    draw(ct, t, c.c(0) + .6, .8); draw(c1, t, c.c(0) + 1.2, 1); draw(c2, t, c.c(0) + 1.6, 1); draw(cm, t, c.c(0) + 2.6, 1);
    show(leg, t, c.c(0) + 2.6, .5);
    show(cons, t, c.c(1), .6, { out: c.c(3) - .2 });
    draw(track, t, c.c(1) + .5, .5); opacity(ka, P(t, c.c(1) + .7, .3)); opacity(kb, P(t, c.c(1) + .7, .3));
    const wk = t < c.c(2) + 1 ? .5 + .25 * Math.sin((t - c.c(1)) * 2.2) * P(t, c.c(1) + 1, .5) : lerp(.5 + .25 * Math.sin((c.c(2) + 1 - c.c(1)) * 2.2), wopt, Ease.inOut(P(t, c.c(2) + 1, 1.5)));
    knob.setAttribute('cx', sx0 + wk * (sx1 - sx0)); pop(knob, t, c.c(1) + .8, .4);
    show(opt, t, c.c(2), .6); draw(par, t, c.c(2) + .4, 1); opacity(sseL, P(t, c.c(2) + 1.2, .3));
    pop(wv, t, c.c(3) + .2, .5);
  };
});

// ---------------------------------------------------------------- pseudo-code
scene('pseudo', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: 'COPROG 虛擬碼（改寫自論文 Table 1）' });
  const lines = [
    ['輸入：𝓛 失效資料、𝓤 停機資料、T 最大回合、u 候選池大小', 0],
    ['𝓛₁ ← 𝓛 ;  𝓛₂ ← 𝓛', 1], ['h₁ ← 訓練(𝓛₁, FFNN) ;  h₂ ← 訓練(𝓛₂, RBN)', 1],
    ['重複 T 次：', 0],
    ['  從 𝓤 隨機抽 u 個單元 → 候選池 𝓤′', 2],
    ['  對 j = 1, 2，對每個 Xᵤ ∈ 𝓤′：', 3],
    ['      L̂ᵤ ← hⱼ(Xᵤ) ;  h′ⱼ ← 訓練(𝓛ⱼ ∪ {Xᵤ, L̂ᵤ})', 3],
    ['      Δⱼ,Xᵤ ← SSE(hⱼ) − SSE(h′ⱼ)', 4],
    ['    若 max Δ > 0：πⱼ ← 最有把握的單元；否則 πⱼ ← ∅', 5],
    ['  若 π₁ = π₂ = ∅：結束', 5],
    ['  𝓛₁ ← 𝓛₁ ∪ π₂ ;  𝓛₂ ← 𝓛₂ ∪ π₁ ;  重新訓練 h₁, h₂', 6],
    ['測試：Lᴾ = w₁h₁(x) + w₂h₂(x)', 7],
  ];
  const cd = card(root, 150, 200, 1180, 0, { pad: 26 });
  const rows = lines.map(([tx, grp]) => {
    const r = h('div', { class: 'mono', style: { fontSize: '27px', lineHeight: '1.55', padding: '1px 10px', borderRadius: '8px', whiteSpace: 'pre' } }, cd);
    r.innerHTML = tx.replace(/𝓛/g, '<span class="mcal">L</span>').replace(/𝓤/g, '<span class="mcal">U</span>');
    r._g = grp; return r;
  });
  const steps = [['訓練', 1, 'var(--ink)'], ['抽樣', 2, 'var(--teal)'], ['猜答案', 3, 'var(--blue)'], ['算信心', 4, 'var(--green)'], ['挑最好', 5, 'var(--purple)'], ['交換', 6, 'var(--orange)'], ['組合', 7, 'var(--red)']];
  const chips = steps.map(([tx, , col], i) => box(root, 1400, 220 + i * 92, { class: 'pill', text: `${i + 1}. ${tx}`, style: { fontSize: '30px', borderColor: col, color: col } }));
  return t => {
    show(head, t, c.c(0) - .3, .6);
    show(cd, t, c.c(0), .6);
    rows.forEach((r, i) => opacity(r, P(t, c.c(0) + .2 + i * .12, .3)));
    const span = (c.e(1) - c.c(1)) / steps.length;
    let active = -1;
    steps.forEach(([, grp], i) => { const t0 = c.c(1) + i * span; if (t >= t0) active = grp; });
    rows.forEach(r => { r.style.background = r._g === active ? 'rgba(244,197,66,.45)' : 'transparent'; });
    chips.forEach((e, i) => { const t0 = c.c(1) + i * span; pop(e, t, t0, .4); e.style.background = steps[i][1] === active ? '#fff3c4' : 'var(--card)'; });
  };
});

// ---------------------------------------------------------------- why 1: prognostic space
scene('why1', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '為什麼有效？① 善用停機資料' });
  const g = svgLayer(root);
  const cx = 720, cy = 560, rx = 540, ry = 290;
  const regions = s('g', {}, g);
  const ell = s('ellipse', { cx, cy, rx, ry, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-dasharray': '16 12' }, g);
  const pi = svgText(g, cx - rx + 60, cy - 30, 'Π', { size: 54, family: 'KaTeX_Main' });
  const lab = [[.25, .45], [.5, .7], [.7, .3], [.4, .25]];
  const unl = [[.15, .6], [.3, .75], [.22, .3], [.35, .55], [.48, .45], [.58, .58], [.62, .82], [.8, .5], [.85, .7], [.75, .18], [.55, .2], [.92, .4], [.42, .9], [.68, .45]];
  const tst = [[.18, .78], [.6, .38], [.88, .58], [.45, .1], [.78, .8], [.28, .15]];
  const XY = ([u, v]) => [cx - rx * .82 + u * rx * 1.64, cy - ry * .78 + v * ry * 1.56];
  const R0 = 105;
  const labR = lab.map(p => { const [x, y] = XY(p); return s('circle', { cx: x, cy: y, r: R0, fill: 'var(--green)', opacity: 0 }, regions); });
  const unlR = unl.map(p => { const [x, y] = XY(p); return s('circle', { cx: x, cy: y, r: 0, fill: 'var(--green)', opacity: 0 }, regions); });
  const labP = lab.map(p => { const [x, y] = XY(p); return s('circle', { cx: x, cy: y, r: 14, fill: 'var(--blue)' }, g); });
  const unlP = unl.map(p => { const [x, y] = XY(p); return s('circle', { cx: x, cy: y, r: 12, fill: 'var(--card)', stroke: 'var(--blue)', 'stroke-width': 4 }, g); });
  const tstP = tst.map(p => { const [x, y] = XY(p); return s('rect', { x: x - 12, y: y - 12, width: 24, height: 24, fill: 'var(--red)' }, g); });
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const covered0 = tst.map(p => lab.some(q => dist(XY(p), XY(q)) < R0));
  const unlock = unl.map((_, i) => i * .22);
  const legend = card(root, 1330, 300, 470, 0, { pad: 22 });
  legend.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px;font-size:27px">
   <div><span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:var(--blue);vertical-align:-3px"></span>　有標籤（失效資料）</div>
   <div><span style="display:inline-block;width:22px;height:22px;border-radius:50%;border:4px solid var(--blue);vertical-align:-3px"></span>　無標籤（停機資料）</div>
   <div><span style="display:inline-block;width:22px;height:22px;background:var(--red);vertical-align:-3px"></span>　測試資料</div>
   <div><span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:rgba(46,158,79,.3);vertical-align:-3px"></span>　模型預測準確的區域</div></div>`;
  const cap1 = box(root, 1330, 630, { class: 'tag t-red wrap', html: '離有標籤資料越遠，<br>誤差越大', style: { fontSize: '28px' } });
  const cap2 = box(root, 1330, 630, { class: 'tag t-green wrap', html: '停機資料被正確標註後，<br>準確區域向外擴張', style: { fontSize: '28px' } });
  const cnt = box(root, 1330, 760, { class: 'h3', text: '' });
  return t => {
    show(head, t, c.c(0) - .2, .6);
    draw(ell, t, c.c(1), 1.2); opacity(pi, P(t, c.c(1) + .5, .4));
    labP.forEach((p, i) => pop(p, t, c.c(1) + 1 + i * .2, .4));
    unlP.forEach((p, i) => pop(p, t, c.c(1) + 1.8 + i * .08, .35));
    tstP.forEach((p, i) => pop(p, t, c.c(1) + 3 + i * .12, .35));
    show(legend, t, c.c(1) + 1, .6);
    labR.forEach(r => r.setAttribute('opacity', .22 * P(t, c.c(2), .6)));
    show(cap1, t, c.c(2) + .5, .5, { out: c.c(3) });
    let ncov = 0;
    unlR.forEach((r, i) => {
      const t0 = c.c(3) + .4 + unlock[i]; const k = Ease.out(P(t, t0, .7));
      r.setAttribute('r', R0 * k); r.setAttribute('opacity', .22 * P(t, t0, .2));
      unlP[i].setAttribute('fill', k > .3 ? 'var(--blue)' : 'var(--card)');
    });
    tstP.forEach((p, i) => {
      const pt = XY(tst[i]);
      const cov = covered0[i] || unl.some((q, j) => t >= c.c(3) + .4 + unlock[j] + .4 && dist(pt, XY(q)) < R0);
      const k = P(t, c.c(2), .3);
      p.setAttribute('fill', k > 0 ? (cov ? 'var(--green)' : 'var(--red)') : 'var(--red)');
      if (cov && k > 0) ncov++;
    });
    show(cap2, t, c.c(3) + .3, .5);
    show(cnt, t, c.c(2) + .5, .4);
    const txt = `測試資料被涵蓋：${ncov} / ${tst.length}`;
    if (cnt.textContent !== txt) cnt.textContent = txt;
  };
});

// ---------------------------------------------------------------- why 2: ensemble + noise propagation
scene('why2', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', text: '為什麼有效？② 兩個演算法的組合' });
  const g = svgLayer(root);
  const ax = axes(g, 170, 330, 620, 380, { xlabel: '輸入', ylabel: 'RUL' });
  const tru = u => .2 + .6 * u;
  const ct = path(g, fpath(tru, 0, 1, 30, ax.X, ax.Y), { stroke: 'var(--ink)', w: 4 });
  const c1 = path(g, fpath(u => tru(u) + .08 * Math.sin(u * 7 + 1) + .05, 0, 1, 60, ax.X, ax.Y), { stroke: 'var(--blue)', w: 4 });
  const c2 = path(g, fpath(u => tru(u) - .07 * Math.sin(u * 6) - .04, 0, 1, 60, ax.X, ax.Y), { stroke: 'var(--orange)', w: 4 });
  const cm = path(g, fpath(u => tru(u) + .5 * (.08 * Math.sin(u * 7 + 1) + .05 - .07 * Math.sin(u * 6) - .04), 0, 1, 60, ax.X, ax.Y), { stroke: 'var(--purple)', w: 5.5 });
  const dv = box(root, 180, 790, { class: 'tag t-purple', text: '多樣性：兩個不同的錯，平均後互相抵銷', style: { fontSize: '27px' } });
  const nh = box(root, 960, 230, { class: 'h3', text: '減少雜訊傳播' });
  const chip = (html, cls) => `<span class="tag ${cls}" style="font-size:25px;white-space:nowrap">${html}</span>`;
  const rowA = card(root, 960, 310, 860, 0, { pad: 20 });
  rowA.innerHTML = `<div class="body" style="font-size:27px;margin-bottom:10px"><b>自己教自己</b>（自我訓練）</div><div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:26px">
    ${chip('<i>h</i>₁ 標註 X<sub>u</sub>', 't-blue')}→${chip('加回 <span class="mcal">L</span>₁', 't-blue')}→${chip('<i>h</i>₁ 再標註鄰近的 X<sub>v</sub>', 't-blue')}</div>
    <div style="margin-top:12px;font-size:27px">雜訊影響：<span class="noise"></span></div>`;
  const rowB = card(root, 960, 590, 860, 0, { pad: 20 });
  rowB.innerHTML = `<div class="body" style="font-size:27px;margin-bottom:10px"><b>交換標註</b>（協同訓練）</div><div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:26px">
    ${chip('<i>h</i>₂ 標註 X<sub>u</sub>', 't-orange')}→${chip('加入 <span class="mcal">L</span>₁', 't-blue')}→${chip('<i>h</i>₁ 標註 X<sub>v</sub>', 't-blue')}</div>
    <div style="margin-top:12px;font-size:27px">雜訊影響：<span class="noise"></span></div>`;
  const drops = (el, n) => { const sp = el.querySelector('.noise'); const ds = []; for (let i = 0; i < n; i++) ds.push(h('span', { text: '●', style: { color: 'var(--red)', fontSize: '30px', marginRight: '8px' } }, sp)); h('span', { text: n > 1 ? '×2（被放大）' : '×1（只影響一次）', style: { fontWeight: 700, color: n > 1 ? 'var(--red)' : 'var(--green)' } }, sp); return ds; };
  const dA = drops(rowA, 2), dB = drops(rowB, 1);
  const noteA = rowA.querySelector('.noise').lastChild, noteB = rowB.querySelector('.noise').lastChild;
  return t => {
    show(head, t, c.c(0) - .2, .6);
    ax.anim(t, c.c(0), .5);
    draw(ct, t, c.c(0) + .3, .6); draw(c1, t, c.c(0) + .8, .9); draw(c2, t, c.c(0) + 1.2, .9); draw(cm, t, c.c(0) + 2.6, .9);
    show(dv, t, c.c(0) + 3.2, .5);
    show(nh, t, c.c(1), .5);
    show(rowA, t, c.c(2), .6);
    dA.forEach((d, i) => opacity(d, P(t, c.c(2) + 1.5 + i * .9, .3))); opacity(noteA, P(t, c.c(2) + 2.6, .3));
    show(rowB, t, c.c(3), .6);
    dB.forEach((d, i) => opacity(d, P(t, c.c(3) + 1.5, .3))); opacity(noteB, P(t, c.c(3) + 1.9, .3));
  };
});
