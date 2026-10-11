// Opening + chapters 1–2: hook, title, roadmap, maintcost, windom, strategies, lifetime, hazard, weibull
(() => {
  const ALPHA = 425.31, BETA = 2.88;                       // main case (Table 4.1)
  const wbR = t => Math.exp(-Math.pow(Math.max(t, 0) / ALPHA, BETA));
  const wbF = t => 1 - wbR(t);
  const wbf = t => (t <= 0 ? 0 : (BETA / ALPHA) * Math.pow(t / ALPHA, BETA - 1) * wbR(t));
  const HAND = 'LXGW WenKai TC';
  const YSOFT = '#fcefc2';                                 // yellow-soft (loss-aversion λ label)
  const ORANGE_TXT = '#b5650a';

  // ---------- local helpers ----------
  const rbox = (root, x, y, props) => { const e = box(root, x, y, props); e._anchor = 'translateX(-100%) '; e.style.transform = e._anchor; return e; };
  // fade in at a, fade out at b
  const vis = (el, t, a, b, d = .5) => { const v = Math.min(P(t, a, d), b == null ? 1 : 1 - P(t, b, d)); opacity(el, v); return v; };
  const defsOf = svg => svg.querySelector('defs') || s('defs', {}, svg);
  function hatch(svg, id, color, bg) {
    const p = s('pattern', { id, width: 11, height: 11, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defsOf(svg));
    if (bg) s('rect', { width: 11, height: 11, fill: bg }, p);
    s('rect', { x: 0, y: 0, width: 4, height: 11, fill: color }, p);
    return `url(#${id})`;
  }
  // svg text in the handwriting font (CSS rule `svg text` overrides the font-family attribute)
  const handT = (g, x, y, str, o = {}) => { const e = svgText(g, x, y, str, o); e.style.fontFamily = `'${HAND}', serif`; return e; };
  // line-art wind turbine (front view); grp.spin(deg)
  function turbine(g, hx, hy, L, gy, o = {}) {
    const grp = s('g', {}, g), k = L / 180;
    if (o.ground !== false) {
      line(grp, hx - 160 * k, gy, hx + 160 * k, gy, { w: 4 });
    }
    path(grp, `M${hx - 8 * k} ${hy + 20 * k} L${hx - 22 * k} ${gy} L${hx + 22 * k} ${gy} L${hx + 8 * k} ${hy + 20 * k} Z`, { fill: 'var(--card)', w: 4 });
    s('rect', { x: hx - 27 * k, y: hy - 14 * k, width: 54 * k, height: 28 * k, rx: 10 * k, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 4 }, grp);
    const rot = s('g', {}, grp);
    const bl = `M${hx} ${hy} Q${hx + 24 * k} ${hy - .2 * L} ${hx + 13 * k} ${hy - .45 * L} L${hx + 3 * k} ${hy - L} Q${hx} ${hy - L - 4 * k} ${hx - 3 * k} ${hy - L} L${hx - 7 * k} ${hy - .45 * L} Q${hx - 11 * k} ${hy - .2 * L} ${hx} ${hy} Z`;
    for (let i = 0; i < 3; i++) path(rot, bl, { fill: o.blade || 'var(--blue-soft)', w: 3.5, attrs: { transform: `rotate(${i * 120} ${hx} ${hy})` } });
    s('circle', { cx: hx, cy: hy, r: 16 * k, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 4 }, grp);
    grp.spin = a => rot.setAttribute('transform', `rotate(${a} ${hx} ${hy})`);
    return grp;
  }
  // small turbine glyph standing on (0,0); grp.place(x, y, deg)
  function miniTurbine(g) {
    const grp = s('g', {}, g);
    line(grp, 0, 0, 0, -58, { w: 4 });
    const rot = s('g', {}, grp);
    for (let i = 0; i < 3; i++) { const a = i * 2 * Math.PI / 3; line(rot, 0, -58, 26 * Math.sin(a), -58 - 26 * Math.cos(a), { w: 5 }); }
    s('circle', { cx: 0, cy: -58, r: 6, fill: 'var(--ink)' }, grp);
    grp.place = (x, y, ang) => { grp.setAttribute('transform', `translate(${x},${y})`); rot.setAttribute('transform', `rotate(${ang} 0 -58)`); };
    return grp;
  }
  function coin(g, cx, cy, r) {
    const grp = s('g', {}, g);
    s('circle', { cx, cy, r, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 4 }, grp);
    s('circle', { cx, cy, r: r * .76, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-dasharray': '5 6' }, grp);
    svgText(grp, cx, cy + 3, '$', { size: r * 1.05, family: 'Inter', weight: 800 });
    return grp;
  }
  const bolt = (g, cx, cy, k) => path(g, `M${cx + 12 * k} ${cy - 60 * k} L${cx - 30 * k} ${cy + 8 * k} L${cx - 2 * k} ${cy + 8 * k} L${cx - 14 * k} ${cy + 60 * k} L${cx + 32 * k} ${cy - 12 * k} L${cx + 4 * k} ${cy - 12 * k} Z`, { fill: 'var(--yellow)', w: 4 });
  // speech bubble whose tail points down to (cx, yb + 28)
  function bubble(g, cx, yb, txt, col, soft) {
    const grp = s('g', {}, g);
    const w = txt.length * 46 + 70, hh = 86, x0 = cx - w / 2, x1 = cx + w / 2, y1 = yb, y0 = yb - hh, r = 20;
    path(grp, `M${x0 + r} ${y0} H${x1 - r} Q${x1} ${y0} ${x1} ${y0 + r} V${y1 - r} Q${x1} ${y1} ${x1 - r} ${y1} H${cx + 18} L${cx} ${y1 + 28} L${cx - 18} ${y1} H${x0 + r} Q${x0} ${y1} ${x0} ${y1 - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`, { fill: soft, stroke: col, w: 4 });
    handT(grp, cx, (y0 + y1) / 2 + 2, txt, { size: 46, fill: col });
    return grp;
  }
  // donut ring; seg(i, p) sweeps segment i to fraction p of its arc
  function donut(g, cx, cy, r, sw, segs) {
    const grp = s('g', {}, g), C = 2 * Math.PI * r;
    s('circle', { cx, cy, r, fill: 'none', stroke: '#ebe4d4', 'stroke-width': sw }, grp);
    const arcs = segs.map(sg => s('circle', { cx, cy, r, fill: 'none', stroke: sg.stroke, 'stroke-width': sw, 'stroke-dasharray': `0 ${C}`, 'stroke-dashoffset': -sg.from * C, transform: `rotate(-90 ${cx} ${cy})` }, grp));
    s('circle', { cx, cy, r: r + sw / 2, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3 }, grp);
    s('circle', { cx, cy, r: r - sw / 2, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3 }, grp);
    grp.seg = (i, p) => arcs[i].setAttribute('stroke-dasharray', `${C * (segs[i].to - segs[i].from) * p} ${C}`);
    return grp;
  }
  // left-to-right reveal that keeps a path's dash pattern (draw() would overwrite it)
  function wipe(svg, el, id, x, y, w, hgt) {
    const cp = s('clipPath', { id }, defsOf(svg));
    const r = s('rect', { x, y, width: 0, height: hgt }, cp);
    el.setAttribute('clip-path', `url(#${id})`);
    return p => r.setAttribute('width', w * clamp(p));
  }
  // shaded area under the main-case pdf between a and b
  function areaD(X, Y, a, b, n = 90) {
    if (b - a < .5) return '';
    let d = `M${X(a).toFixed(1)} ${Y(0).toFixed(1)}`;
    for (let i = 0; i <= n; i++) { const u = lerp(a, b, i / n); d += `L${X(u).toFixed(1)} ${Y(wbf(u)).toFixed(1)}`; }
    return d + `L${X(b).toFixed(1)} ${Y(0).toFixed(1)}Z`;
  }

  // ================================================================ hook
  scene('hook', (root, c) => {
    const Dt = D();
    const g = svgLayer(root);
    // c0: turbine → model → cost curve
    const L1 = s('g', {}, g);
    const tb = turbine(L1, 330, 390, 190, 830);
    const ch = s('g', {}, L1);
    const C = chart(ch, 1040, 260, 680, 450, {
      xmin: 0, xmax: 1000, ymin: 0, ymax: 60000, xticks: [0, 250, 500, 750, 1000], yticks: [0, 20000, 40000, 60000],
      fy: v => (v ? v / 10000 + ' 萬' : '0'), xlabel: '預防保養時點 τ（天）', ylabel: '長期平均成本（元／天）',
    });
    const curve = C.plot(Dt.t, Dt.cost_expected, { color: 'var(--blue)', w: 5 });
    const dot = C.dot(Dt.opt.expected.tau, Dt.opt.expected.cost, { color: 'var(--blue)', r: 12 });
    const dlab = svgText(ch, C.X(257) + 50, C.Y(16923) + 54, '第 257 天 · 長期最划算', { size: 32, fill: 'var(--blue)' });
    const mdl = s('g', {}, g);
    const ar = arrow(mdl, 585, 545, 955, 545, { w: 5, head: 20 });
    const gw = s('g', {}, mdl);
    Icons.gear(gw, 765, 455, 44, { fill: 'var(--card)' });
    const mtx = svgText(mdl, 765, 592, '模型計算', { size: 30 });
    // c1: a person makes the call
    const L2 = s('g', {}, g);
    const per = Icons.person(L2, 765, 565, 1.7);
    const stamp = s('g', {}, L2);
    const st = s('g', { transform: 'rotate(-10 765 345)' }, stamp);
    s('rect', { x: 690, y: 309, width: 150, height: 72, rx: 12, fill: 'rgba(217,65,46,.10)', stroke: 'var(--red)', 'stroke-width': 5 }, st);
    handT(st, 765, 347, '拍板', { size: 46, fill: 'var(--red)' });
    const plab = svgText(L2, 765, 664, '決策者', { size: 30, fill: 'var(--mute)' });
    // c2: two attitudes
    const L3 = s('g', {}, g);
    const XL = 480, XR = 1440, YP = 525;
    const mkP = (col, soft) => { const w = s('g', {}, L3); Icons.person(w, 0, 0, 1.6, col, soft); return w; };
    const pL = mkP('var(--orange)', 'var(--orange-soft)'), pR = mkP('var(--purple)', 'var(--purple-soft)');
    const bL = bubble(L3, XL, 345, '再撐一下', ORANGE_TXT, 'var(--orange-soft)');
    const bR = bubble(L3, XR, 345, '早點換才安心', 'var(--purple)', 'var(--purple-soft)');
    const nL = svgText(L3, XL, 616, '敢賭的主管', { size: 30, fill: ORANGE_TXT });
    const nR = svgText(L3, XR, 616, '怕出事的主管', { size: 30, fill: 'var(--purple)' });
    const mkTL = (cx, dir, col, lbl) => {
      const G = s('g', {}, L3), y = 738;
      const ax = arrow(G, cx - 250, y, cx + 250, y, { w: 3.5, head: 14 });
      const tm = svgText(G, cx + 250, y + 36, '時間', { size: 22, anchor: 'end', fill: 'var(--mute)', weight: 500 });
      const ghost = s('circle', { cx, cy: y, r: 11, fill: 'var(--card)', stroke: 'var(--blue)', 'stroke-width': 3, 'stroke-dasharray': '4 4' }, G);
      const md = s('circle', { cx, cy: y, r: 12, fill: 'var(--blue)' }, G);
      const ml = svgText(G, cx, y + 38, '模型建議', { size: 24, fill: 'var(--blue)' });
      const pa = arrow(G, cx + dir * 18, y - 42, cx + dir * 128, y - 42, { stroke: col, w: 5, head: 16 });
      const pl = svgText(G, cx + dir * 146, y - 42, lbl, { size: 32, fill: col, anchor: dir > 0 ? 'start' : 'end' });
      return { ax, tm, ghost, md, ml, pa, pl, cx, dir, col, y };
    };
    const tL = mkTL(XL, 1, 'var(--orange)', '延後'), tR = mkTL(XR, -1, 'var(--purple)', '提前');
    // c3: title
    const T1 = box(root, 960, 420, { class: 'h1 center', html: '人的<span class="hl">風險態度</span> × 維修計畫' }, 'c');
    T1.style.fontSize = '92px';
    const T2 = box(root, 960, 575, { class: 'hand center', html: '這篇論文試著把它<span class="hl">算出來</span>' }, 'c');
    Object.assign(T2.style, { fontSize: '56px', fontWeight: 700 });
    const runTL = (o, t, tA, tP) => {
      o.ax.anim(t, tA, .6); opacity(o.tm, P(t, tA + .4, .3));
      pop(o.md, t, tA + .4, .4); opacity(o.ml, P(t, tA + .5, .3));
      const p = Ease.inOut(P(t, tP, .9));
      o.md.setAttribute('cx', o.cx + o.dir * 130 * p);
      o.md.setAttribute('fill', p > .5 ? o.col : 'var(--blue)');
      opacity(o.ghost, P(t, tP, .2));
      o.pa.anim(t, tP, .9); opacity(o.pl, P(t, tP + .5, .4));
    };
    return t => {
      const c1 = c.c(1), c2 = c.c(2), c3 = c.c(3);
      tb.spin(42 * t);
      opacity(L1, P(t, .2, .6) * lerp(1, .4, P(t, c1, .6)) * (1 - P(t, c2, .5)));
      C.anim(t, 2.2, .7);
      draw(curve, t, 2.6, 1.3, { ease: Ease.inOut });
      pop(dot, t, 3.9, .5); show(dlab, t, 4.1, .5, { dy: 12 });
      opacity(mdl, 1 - P(t, c1 - .1, .4));
      ar.anim(t, 1.7, .6); opacity(gw, P(t, 1.8, .4)); gw.setAttribute('transform', `rotate(${50 * t} 765 455)`);
      opacity(mtx, P(t, 1.9, .4));
      // c1
      pop(per, t, c1 + .2, .5, { out: c2 + .05, outD: .3 });
      show(stamp, t, c1 + 1.0, .35, { dy: 0, s: 1.9, sEase: Ease.out, out: c2, outD: .3 });
      show(plab, t, c1 + .5, .4, { out: c2, outD: .3 });
      // c2
      opacity(L3, 1 - P(t, c3 - .1, .5));
      const sp = Ease.inOut(P(t, c2, .9));
      [[pL, XL], [pR, XR]].forEach(([p, x]) => { p.setAttribute('transform', `translate(${lerp(765, x, sp)},${lerp(565, YP, sp)})`); opacity(p, P(t, c2, .2)); });
      show(nL, t, c2 + .7, .4); pop(bL, t, c2 + 1.0, .5);
      runTL(tL, t, c2 + .8, c2 + 1.8);
      show(nR, t, c2 + 2.9, .4); pop(bR, t, c2 + 3.3, .5);
      runTL(tR, t, c2 + 3.0, c2 + 4.0);
      // c3
      show(T1, t, c3 + .3, .8, { s: .94 });
      show(T2, t, c3 + 3.1, .7);
    };
  });

  // ================================================================ title
  scene('title', (root, c) => {
    const pill = box(root, 140, 196, { class: 'pill', text: '論文導讀 · 從零開始' });
    pill.style.fontSize = '28px';
    const yr = box(root, 478, 200, { class: 'tag t-blue', text: '2024 年 · 碩士論文' });
    const fig = figCard(root, 1240, 185, 520, 'assets/cover.png', '論文封面');
    const t1 = box(root, 140, 292, { class: 'h1', html: '基於設備壽命預測與<span class="hl">人為風險態度</span>之<br>最佳化維護決策' });
    Object.assign(t1.style, { fontSize: '60px', fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, lineHeight: 1.3 });
    const en = box(root, 140, 468, { class: 'en wrap', text: 'Optimal Maintenance Decisions with Human Risk Attitudes When Equipment Lifetime Predictions are Available' });
    Object.assign(en.style, { width: '1020px', fontSize: '28px', fontStyle: 'italic', color: 'var(--mute)', lineHeight: 1.4 });
    const rule = box(root, 140, 584, { style: { width: '1020px', height: '3px', background: 'var(--faint)' } });
    const sch = box(root, 140, 614, { class: 'tag t-gray', text: '國立高雄科技大學　運籌管理系　碩士論文 · 2024 年 6 月' });
    sch.style.fontSize = '27px';
    const au = box(root, 140, 684, { html: '<span style="font-size:28px;color:var(--mute)">研究生</span>　<b style="font-size:44px">李念宗</b>' });
    const adv = box(root, 140, 764, { html: '<span style="color:var(--mute)">指導教授</span>　<b>郭幸民</b> 博士　・　<span style="color:var(--mute)">共同指導教授</span>　<b>陳彥銘</b> 博士' });
    adv.style.fontSize = '32px';
    return t => {
      const c0 = c.c(0), c1 = c.c(1), c2 = c.c(2);
      show(pill, t, c0, .6);
      show(yr, t, c0 + 3.2, .5);
      show(fig, t, c0 + .6, .9, { dy: 40, extra: ` rotate(${lerp(-8, -2.5, Ease.out(P(t, c0 + .6, 1)))}deg)` });
      show(t1, t, c1, .8);
      show(en, t, c1 + 1.6, .8);
      opacity(rule, P(t, c2, .5));
      show(sch, t, c2 + .3, .6);
      show(au, t, c2 + 3.3, .6);
      show(adv, t, c2 + 4.6, .6);
    };
  });

  // ================================================================ roadmap
  scene('roadmap', (root, c) => {
    const cats = [['背景知識', 't-teal', 'var(--teal)'], ['論文方法', 't-blue', 'var(--blue)'], ['數值結果', 't-orange', 'var(--orange)'], ['反思', 't-purple', 'var(--purple)']];
    const chs = [['維修為什麼重要', 0], ['可靠度基礎', 0], ['年齡更換策略', 0], ['理性與風險態度', 0], ['累積展望理論', 0],
      ['論文的人為決策模型', 1], ['案例與理性最佳解', 2], ['風險態度的影響', 2], ['歷史資料與結論', 2], ['批判性閱讀', 3]];
    const head = box(root, 960, 110, { class: 'h2 center', text: '影片地圖' }, 'tc');
    const g = svgLayer(root);
    const W0 = 310, H0 = 150, GAP = 25, ys = [310, 610];
    const pos = chs.map((_, i) => (i < 5 ? [140 + i * (W0 + GAP), ys[0]] : [140 + (9 - i) * (W0 + GAP), ys[1]]));
    const ctr = pos.map(([x, y]) => [x + W0 / 2, y + H0 / 2]);
    const segs = ctr.slice(0, -1).map(([x, y], i) => line(g, x, y, ctr[i + 1][0], ctr[i + 1][1], { stroke: 'var(--faint)', w: 12 }));
    const cards = chs.map(([tt, ci], i) => {
      const [cat, cl, col] = cats[ci];
      const el = card(root, pos[i][0], pos[i][1], W0, H0, { pad: 18 });
      const top = h('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' } }, el);
      h('div', { class: 'en', text: String(i + 1), style: { width: '54px', height: '54px', borderRadius: '50%', background: col, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 800, flex: 'none' } }, top);
      h('span', { class: 'tag ' + cl, text: cat }, top);
      h('div', { html: tt, style: { fontSize: '29px', fontWeight: 700, lineHeight: 1.3, whiteSpace: 'nowrap' } }, el);
      return el;
    });
    return t => {
      const c0 = c.c(0), c1 = c.c(1);
      show(head, t, .2, .6);
      const t0s = chs.map((_, i) => (i < 5 ? c0 + .4 + i * 1.3 : c1 + .3 + (i - 5) * 1.45));
      cards.forEach((el, i) => pop(el, t, t0s[i], .5));
      segs.forEach((sg, i) => draw(sg, t, t0s[i] + .25, t0s[i + 1] - t0s[i] - .2, { ease: Ease.lin }));
    };
  });

  // ================================================================ maintcost
  scene('maintcost', (root, c) => {
    const g = svgLayer(root);
    const head = box(root, 150, 110, { class: 'h2', text: '維修有多花錢？' });
    const head2 = box(root, 150, 110, { class: 'h2', text: '維修的目標，正在轉向' });
    const G = s('g', {}, g);
    const C = chart(G, 640, 215, 800, 425, { xmin: 0, xmax: 100, ymin: 0, ymax: 1, xticks: [0, 25, 50, 75, 100], yticks: [], fx: v => v + '%', xlabel: '占成本的比例（各研究口徑不同）' });
    const HT = hatch(g, 'aI-hatch-bar', '#3d4456', '#d6dae3');
    const rows = [
      { y: 300, name: '食品相關產業', sub: '維修成本／生產成本', v: 15, txt: '約 15%', src: 'Mobley, 2002a' },
      { y: 430, name: '礦業', sub: '維修成本／生產成本', v: 30, txt: '超過 30%', src: 'Komljenovic et al., 2006', more: true },
      { y: 560, name: '核電廠與重工業', sub: '營運與維護成本／生產成本', v: 60, v2: 70, txt: '60%–70%', src: 'Coble et al., 2012' },
    ].map(r => {
      const lab = s('g', {}, G);
      svgText(lab, 612, r.y - 13, r.name, { size: 31, anchor: 'end' });
      svgText(lab, 612, r.y + 22, r.sub, { size: 21, anchor: 'end', weight: 500, fill: 'var(--mute)' });
      const bar = s('rect', { x: 640, y: r.y - 32, width: 0, height: 64, rx: 6, fill: '#d6dae3', stroke: 'var(--ink)', 'stroke-width': 3 }, G);
      const hb = r.v2 ? s('rect', { x: C.X(r.v), y: r.y - 32, width: 0, height: 64, fill: HT, stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-dasharray': '8 5' }, G) : null;
      const xe = C.X(r.v2 || r.v);
      const ar = r.more ? arrow(G, xe + 8, r.y, xe + 70, r.y, { w: 5, head: 16 }) : null;
      const val = svgText(G, xe + (r.more ? 84 : 18), r.y + 2, r.txt, { size: 36, anchor: 'start', family: 'Inter', weight: 800 });
      const src = svgText(G, 1478, r.y + 2, r.src, { size: 22, anchor: 'start', weight: 500, fill: 'var(--mute)', family: 'Inter' });
      return { ...r, lab, bar, hb, ar, val, src };
    });
    const srcHead = svgText(G, 1478, 236, '來源（論文引用）', { size: 22, anchor: 'start', fill: 'var(--mute)' });
    const msg = box(root, 150, 748, { class: 'hand', html: '訊息一致：<span class="hl">維修是一筆大錢</span>' });
    Object.assign(msg.style, { fontSize: '46px', fontWeight: 700 });
    const note = rbox(root, 1790, 762, { class: 'small', text: '註：各研究口徑不同（維修成本 vs. 營運維護成本），不宜直接比較' });
    // c3: run-to-failure → prevention
    const mk = (x, title, sub, col, icon) => {
      const el = card(root, x, 250, 440, 0, { pad: 28, style: { borderColor: col, borderWidth: '4px' } });
      const sv = miniSvg(el, 150, 130, { margin: '0 auto 12px' }); icon(sv);
      h('div', { class: 'h2 center', text: title, style: { color: col } }, el);
      h('div', { class: 'small center', text: sub, style: { marginTop: '6px', fontSize: '26px' } }, el);
      return el;
    };
    const pA = mk(330, '壞了再修', '事後補救：矯正性維修', 'var(--red)', sv => Icons.broken(sv, 15, 5, 1));
    const pB = mk(1150, '在故障前預防', '事前安排：預防性維修', 'var(--teal)', sv => Icons.calendar(sv, 15, 8, 1));
    const big = arrow(g, 806, 425, 1116, 425, { w: 12, head: 34 });
    // unit timelines under the two cards
    const ubA = unitBar(g, 370, 690, 330, 'fail'), ubB = unitBar(g, 1190, 690, 330, 'pm');
    const ucA = svgText(g, 550, 748, '運轉 → 突然故障，被迫停機', { size: 25, weight: 500, fill: 'var(--red)' });
    const ucB = svgText(g, 1370, 748, '運轉 → 依計畫，提前保養', { size: 25, weight: 500, fill: '#0b7a6b' });
    return t => {
      const c0 = c.c(0), c1 = c.c(1), c2 = c.c(2), c3 = c.c(3);
      show(head, t, c0 - .3, .6, { out: c3 - .1, outD: .4 });
      show(head2, t, c3 + .1, .6);
      opacity(G, 1 - P(t, c3 - .1, .5));
      C.anim(t, c0 + .3, .7); opacity(srcHead, P(t, c0 + .8, .4));
      const t0 = [c0 + 4.0, c1 + .3, c1 + 2.6];
      rows.forEach((r, i) => {
        show(r.lab, t, t0[i] - .1, .5, { dy: 0, dx: -20 });
        const p = Ease.out(P(t, t0[i], .9));
        r.bar.setAttribute('width', (C.X(r.v) - 640) * p);
        if (r.hb) r.hb.setAttribute('width', (C.X(r.v2) - C.X(r.v)) * Ease.out(P(t, t0[i] + .9, .6)));
        opacity(r.hb || r.bar, P(t, t0[i], .1));
        if (r.ar) r.ar.anim(t, t0[i] + .8, .4);
        const tv = t0[i] + (r.hb ? 1.4 : r.ar ? 1.1 : .8);
        show(r.val, t, tv, .4, { dy: 0, dx: -12 });
        opacity(r.src, P(t, tv + .2, .4));
      });
      show(note, t, c2 + .2, .6, { out: c3 - .1, outD: .4 });
      show(msg, t, c2 + 2.4, .6, { out: c3 - .1, outD: .4 });
      show(pA, t, c3 + .3, .6, { dy: 30 });
      big.anim(t, c3 + 1.5, .6);
      show(pB, t, c3 + 2.0, .6, { dy: 30 });
      ubA.anim(t, c3 + .8, 1.0); opacity(ucA, P(t, c3 + 1.6, .4));
      ubB.anim(t, c3 + 2.5, 1.0); opacity(ucB, P(t, c3 + 3.3, .4));
    };
  });

  // ================================================================ windom
  scene('windom', (root, c) => {
    const g = svgLayer(root);
    const head = box(root, 150, 110, { class: 'h2', text: '案例：風力發電機' });
    const tb = turbine(g, 330, 400, 175, 860);
    const stat = card(root, 620, 196, 1160, 0, { pad: 24 });
    Object.assign(stat.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between' });
    const sl = h('div', {}, stat);
    h('span', { class: 'tag t-gray', text: '1996 年起', style: { fontSize: '26px' } }, sl);
    h('div', { class: 'h3', text: '風機裝機數，每年成長', style: { margin: '6px 0 2px' } }, sl);
    h('div', { class: 'small en', text: 'Darwish & Al-Dabbagh, 2020；Deng et al., 2012', style: { fontSize: '21px' } }, sl);
    const sr = h('div', { class: 'en', style: { fontSize: '100px', fontWeight: 800, lineHeight: 1 } }, stat);
    sr.innerHTML = '&gt; <span>0</span>%';
    const num = sr.querySelector('span');
    // donuts
    const HT = hatch(g, 'aI-hatch-om', '#3d4456', '#ebe4d4');
    const R = 130, SW = 44;
    const D1 = { cx: 900, cy: 640, tx: 830, ty: 330 }, D2 = { cx: 1460, cy: 640, tx: 1530, ty: 330 };
    const d1 = donut(g, D1.cx, D1.cy, R, SW, [{ from: 0, to: .20, stroke: '#3d4456' }, { from: .20, to: .25, stroke: HT }]);
    const d2 = donut(g, D2.cx, D2.cy, R, SW, [{ from: 0, to: .40, stroke: 'var(--red)' }]);
    const v1 = svgText(d1, D1.cx, D1.cy + 18, '20–25%', { size: 40, family: 'Inter', weight: 800 });
    const s1 = svgText(d1, D1.cx, D1.cy - 30, '營運與維護', { size: 24, fill: 'var(--mute)' });
    const v2 = svgText(d2, D2.cx, D2.cy + 18, '40%', { size: 50, family: 'Inter', weight: 800, fill: 'var(--red)' });
    const s2 = svgText(d2, D2.cx, D2.cy - 30, '非預期元件故障', { size: 24, fill: 'var(--mute)' });
    const ttl1 = svgText(g, D1.cx, 446, '風機生命週期成本', { size: 32 });
    const src1 = svgText(g, D1.cx, 826, 'Li et al., 2015', { size: 22, weight: 500, fill: 'var(--mute)', family: 'Inter' });
    const ttl2 = svgText(g, D2.cx, 446, '風場維護費用', { size: 32 });
    const src2 = svgText(g, D2.cx, 826, 'Entezami et al., 2012', { size: 22, weight: 500, fill: 'var(--mute)', family: 'Inter' });
    const cap1 = svgText(g, D1.tx, 440, '生命週期成本中的 O&M', { size: 22, weight: 500, fill: 'var(--mute)' });
    const cap2 = svgText(g, D2.tx, 440, '維護費用中的非預期故障', { size: 22, weight: 500, fill: 'var(--mute)' });
    // c3: when to maintain?
    const Q = s('g', {}, g);
    const cn = coin(Q, 830, 640, 58);
    const cal = s('g', {}, Q); Icons.calendar(cal, 1108, 572, 1.2);
    const qm = handT(Q, 1272, 566, '?', { size: 84, fill: 'var(--orange)' });
    const bt = bolt(Q, 1530, 640, 1.05);
    const aL = arrow(Q, 1088, 640, 908, 640, { w: 4, head: 16 });
    const aR = arrow(Q, 1300, 640, 1466, 640, { w: 4, head: 16 });
    const lq = handT(Q, 1180, 770, '何時保養？', { size: 48 });
    const l1 = svgText(Q, 830, 752, '成本', { size: 34 });
    const l2 = svgText(Q, 1530, 752, '發電量', { size: 34 });
    const place = (dn, o, p) => {
      const k = lerp(1, .55, p), x = lerp(o.cx, o.tx, p), y = lerp(o.cy, o.ty, p);
      dn.setAttribute('transform', `translate(${x},${y}) scale(${k}) translate(${-o.cx},${-o.cy})`);
    };
    return t => {
      const c0 = c.c(0), c1 = c.c(1), c2 = c.c(2), c3 = c.c(3);
      show(head, t, c0 - .3, .6);
      tb.spin(36 * t); opacity(tb, P(t, c0 - .3, .6));
      show(stat, t, c0 + 2.0, .6, { out: c3 - .1, outD: .4 });
      num.textContent = Math.round(lerp(0, 25, Ease.out(P(t, c0 + 3.4, 2.0))));
      // donut 1
      opacity(d1, P(t, c1 + .2, .4));
      d1.seg(0, Ease.inOut(P(t, c1 + .4, 1.1))); d1.seg(1, Ease.out(P(t, c1 + 1.5, .5)));
      opacity(v1, P(t, c1 + 1.6, .4)); opacity(s1, P(t, c1 + 1.6, .4) * (1 - P(t, c3, .3)));
      vis(ttl1, t, c1 + .2, c3 - .1, .4); vis(src1, t, c1 + 1.8, c3 - .1, .4);
      // donut 2
      opacity(d2, P(t, c2 + .2, .4));
      d2.seg(0, Ease.inOut(P(t, c2 + .4, 1.2)));
      opacity(v2, P(t, c2 + 1.5, .4)); opacity(s2, P(t, c2 + 1.5, .4) * (1 - P(t, c3, .3)));
      vis(ttl2, t, c2 + .2, c3 - .1, .4); vis(src2, t, c2 + 1.7, c3 - .1, .4);
      // c3
      const sp = Ease.inOut(P(t, c3 + .1, .9));
      place(d1, D1, sp); place(d2, D2, sp);
      opacity(cap1, P(t, c3 + .9, .4)); opacity(cap2, P(t, c3 + .9, .4));
      pop(cal, t, c3 + .9, .5); pop(qm, t, c3 + 1.3, .5); show(lq, t, c3 + 1.3, .5);
      aL.anim(t, c3 + 2.0, .5); pop(cn, t, c3 + 2.3, .5); show(l1, t, c3 + 2.4, .4);
      aR.anim(t, c3 + 2.8, .5); pop(bt, t, c3 + 3.1, .5); show(l2, t, c3 + 3.2, .4);
    };
  });

  // ================================================================ strategies
  scene('strategies', (root, c) => {
    const Dt = D();
    const g = svgLayer(root);
    const head = box(root, 150, 110, { class: 'h2', text: '四種常見的維修策略' });
    const icCBM = sv => {
      s('rect', { x: 14, y: 6, width: 122, height: 86, rx: 10, fill: 'var(--blue-soft)', stroke: 'var(--blue)', 'stroke-width': 4 }, sv);
      path(sv, 'M24 56 H48 L58 34 L70 74 L82 44 L90 56 H126', { stroke: 'var(--blue)', w: 4.5 });
      path(sv, 'M75 92 V108 M50 112 H100', { stroke: 'var(--blue)', w: 5 });
    };
    const icPdM = sv => {
      path(sv, 'M14 10 V112 H140', { w: 4 });
      path(sv, 'M20 30 H138', { stroke: 'var(--red)', w: 3, dash: '7 6' });
      path(sv, 'M18 100 C 40 98, 58 92, 76 78', { stroke: 'var(--green)', w: 5 });
      path(sv, 'M76 78 C 92 66, 104 50, 114 30', { stroke: 'var(--green)', w: 4, dash: '6 7' });
      s('circle', { cx: 76, cy: 78, r: 6, fill: 'var(--green)' }, sv);
      path(sv, 'M106 22 L122 38 M122 22 L106 38', { stroke: 'var(--red)', w: 5 });
    };
    const defs = [
      { ab: 'CM', name: '矯正性維修', col: 'var(--red)', soft: 'var(--red-soft)', l1: '壞了才修', l2: '停機、連帶損壞，代價高', icon: sv => Icons.broken(sv, 15, 2, 1) },
      { ab: 'PM', name: '預防性維修', col: 'var(--teal)', soft: 'var(--teal-soft)', l1: '故障前，按預定時間', l2: '保養或更換', icon: sv => Icons.calendar(sv, 15, 4, 1) },
      { ab: 'CBM', name: '狀態基準維護', col: 'var(--blue)', soft: 'var(--blue-soft)', l1: '依監測到的狀態', l2: '決定何時保養', icon: icCBM },
      { ab: 'PdM', name: '預測性維護', col: 'var(--green)', soft: 'var(--green-soft)', l1: '監測趨勢', l2: '進一步預測何時會壞', icon: icPdM },
    ];
    const CW = 375, CH = 330, CY = 320;
    const cards = defs.map((d, i) => {
      const el = card(root, 140 + i * 425, CY, CW, CH, { pad: 22, style: { borderColor: d.col, borderWidth: '4px', transformOrigin: '0 0' } });
      const sv = miniSvg(el, 150, 124, { margin: '0 auto 10px' }); d.icon(sv);
      h('div', { class: 'h3 center', html: `<span class="en" style="color:${d.col};font-weight:800">${d.ab}</span> ${d.name}`, style: { fontSize: '34px' } }, el);
      h('div', { class: 'center', html: `${d.l1}<br>${d.l2}`, style: { fontSize: '26px', lineHeight: 1.45, marginTop: '8px', color: '#3a404d' } }, el);
      return el;
    });
    const K = .5, SW0 = CW * K, SG = 24, SX0 = 960 - (4 * SW0 + 3 * SG) / 2, SY = 112;
    const q = box(root, 960, 318, { class: 'h1 center', html: '設備大概<span class="hl">何時會壞</span>？' }, 'tc');
    q.style.fontSize = '68px';
    // c4: lifetime distribution
    const G = s('g', {}, g);
    const C = chart(G, 230, 520, 780, 240, { xmin: 0, xmax: 1000, ymin: 0, ymax: .003, xticks: [0, 250, 500, 750, 1000], yticks: [], xlabel: '時間（天）', ylabel: 'f(t)' });
    const area = path(G, areaD(C.X, C.Y, 0, 1000, 160), { fill: 'var(--blue-soft)', stroke: 'none', w: 0 });
    const pdfC = C.plot(Dt.t, Dt.pdf, { color: 'var(--blue)', w: 5 });
    const pcap = svgText(G, 1010, 498, '主案例的壽命分配', { size: 22, anchor: 'end', weight: 500, fill: 'var(--mute)' });
    const k1 = box(root, 1130, 492, { class: 'h3', html: '壽命預測 ＝ <span class="hl">壽命分配</span>' });
    k1.style.fontSize = '42px';
    const k2 = box(root, 1130, 580, { class: 'body', html: '論文用 <b>韋伯（Weibull）</b>壽命分配' });
    const k3 = box(root, 1130, 650, { class: 'tag t-blue', html: '主案例：參數取自文獻' });
    const k4 = box(root, 1130, 714, { class: 'tag t-orange', html: '第二個案例：由歷史資料配適' });
    [k3, k4].forEach(e => { e.style.fontSize = '27px'; });
    return t => {
      const c0 = c.c(0), c1 = c.c(1), c2 = c.c(2), c3 = c.c(3), c4 = c.c(4);
      show(head, t, c0 - .3, .6, { out: c3, outD: .4 });
      const tIn = [c0 + 2.6, c1 + .3, c2 + .3, c2 + 5.0];
      const sp = Ease.inOut(P(t, c3, .9));
      cards.forEach((el, i) => {
        const pi = P(t, tIn[i], .55), v = Ease.out(pi);
        opacity(el, v);
        const dx = (SX0 + i * (SW0 + SG)) - (140 + i * 425), dy = SY - CY;
        const k = lerp(1, K, sp) * lerp(.85, 1, Ease.back(pi));
        el.style.transform = `translate(${dx * sp}px,${dy * sp + 24 * (1 - v)}px) scale(${k})`;
      });
      show(q, t, c3 + .6, .7, { s: .92 });
      C.anim(t, c4 + .1, .6);
      opacity(area, .8 * P(t, c4 + 1.2, .8));
      draw(pdfC, t, c4 + .3, 1.5);
      opacity(pcap, P(t, c4 + 1.4, .5));
      show(k1, t, c4 + .6, .6);
      show(k2, t, c4 + 2.4, .6);
      show(k3, t, c4 + 4.4, .5);
      show(k4, t, c4 + 6.5, .5);
    };
  });

  // ================================================================ lifetime
  scene('lifetime', (root, c) => {
    const Dt = D();
    const g = svgLayer(root);
    const head = box(root, 150, 110, { class: 'h2', html: '用機率描述「壽命」' });
    const x0 = 220, y0 = 262, w = 1000, hh = 438, yA = y0 + hh;
    const aF = path(g, '', { fill: 'var(--red-soft)', stroke: 'none', w: 0 });
    const aR = path(g, '', { fill: 'var(--teal-soft)', stroke: 'none', w: 0 });
    const G = s('g', {}, g);
    const C = chart(G, x0, y0, w, hh, { xmin: 0, xmax: 1000, ymin: 0, ymax: .003, xticks: [0, 200, 400, 600, 800, 1000], yticks: [0, .001, .002, .003], fy: v => v.toFixed(3), xlabel: '時間 t（天）', ylabel: 'f(t)' });
    const pdfC = C.plot(Dt.t, Dt.pdf, { color: 'var(--blue)', w: 5 });
    const pl = svgText(G, C.X(470), C.Y(.0026), '機率密度 f(t)', { size: 30, anchor: 'start', fill: 'var(--blue)' });
    // c0: timeline (same x-axis as the chart)
    const TL = s('g', {}, g);
    line(TL, x0, yA, x0 + w + 10, yA, { w: 3 });
    [0, 200, 400, 600, 800, 1000].forEach(v => { line(TL, C.X(v), yA, C.X(v), yA + 8, { w: 2 }); svgText(TL, C.X(v), yA + 30, String(v), { size: 21, weight: 500, fill: 'var(--mute)', family: 'Inter' }); });
    svgText(TL, x0 + w, yA + 64, '時間（天）', { size: 24, anchor: 'end', weight: 500, fill: 'var(--mute)' });
    const Ts = (() => { const r = rng(7); return [0, 1, 2].map(() => ALPHA * Math.pow(-Math.log(r()), 1 / BETA)); })();
    const runs = Ts.map((T, k) => {
      const x = C.X(T), gg = s('g', {}, g);
      path(gg, `M${x - 14} ${yA - 14} L${x + 14} ${yA + 14} M${x + 14} ${yA - 14} L${x - 14} ${yA + 14}`, { stroke: 'var(--red)', w: 6 });
      svgText(gg, x, yA - 46, `T${'₁₂₃'[k]}`, { size: 34, fill: 'var(--red)', family: 'Inter' });
      return { T, x, gg, mt: miniTurbine(g) };
    });
    const tlab = box(root, x0 + 10, 340, { html: '<span class="h3">T：故障時間</span><span class="body" style="color:var(--mute)">（隨機變數）</span>　<span class="tag t-gray">示意</span>' });
    const tsub = box(root, x0 + 10, 410, { class: 'body', text: '每台設備從開始運轉到故障的時間，都不一樣' });
    tsub.style.color = 'var(--mute)';
    const note = card(root, 880, 372, 340, 0, { pad: 14, style: { borderWidth: '2.5px', boxShadow: 'none' } });
    note.innerHTML = '<div style="font-size:25px;line-height:1.45"><b>注意</b>：f(t) 不是機率<br>曲線下的<span class="hl">面積</span>才是</div>';
    // c2–c3: moving t
    const tL = line(g, 0, yA, 0, y0 - 6, { stroke: 'var(--red)', w: 3.5 });
    const tT = svgText(g, 0, y0 - 28, 't', { size: 34, fill: 'var(--red)', family: 'KaTeX_Math' });
    const fl = svgText(g, 0, 0, 'F(t)', { size: 32, fill: 'var(--red)' });
    const rl = svgText(g, 0, 0, 'R(t)', { size: 34, fill: 'var(--teal)' });
    // right panel
    const ro = card(root, 1320, 250, 470, 0, { pad: 22 });
    ro.innerHTML = `<div style="font-size:34px;line-height:1.5">
      <div class="r0"><i>t</i> = <b class="en v0">0</b> 天</div>
      <div class="r1" style="color:var(--red)">F(<i>t</i>) = <b class="en v1">0</b><span class="small" style="color:var(--red)">　已故障</span></div>
      <div class="r2" style="color:#0b7a6b">R(<i>t</i>) = <b class="en v2">0</b><span class="small" style="color:#0b7a6b">　還沒壞</span></div>
      <div class="r3" style="color:var(--green);border-top:2px solid var(--faint);margin-top:6px;padding-top:4px">F + R = <b class="en">1</b></div></div>`;
    const R_ = ['r0', 'r1', 'r2', 'r3'].map(k => ro.querySelector('.' + k));
    const V_ = ['v0', 'v1', 'v2'].map(k => ro.querySelector('.' + k));
    const fc = card(root, 1320, 552, 470, 0, { pad: 22 });
    const fRow = (src, eq, big) => `<div class="fr" style="display:flex;align-items:center;justify-content:space-between;margin:6px 0;${big ? 'font-size:38px' : 'font-size:30px'}">${tex(src)}<span class="tag t-gray" style="font-size:21px">式 ${eq}</span></div>`;
    fc.innerHTML = fRow('R(t)=P(T>t)', '(2.3)') + fRow('F(t)=P(T\\le t)', '(2.4)') + fRow('R(t)+F(t)=1', '(2.8)', true);
    const fr = [...fc.querySelectorAll('.fr')];
    fr[2].style.borderTop = '2px solid var(--faint)'; fr[2].style.paddingTop = '10px';
    const dist = rbox(root, 1790, 836, { class: 'small', text: '論文案例分配：Weibull α = 425.31 天、β = 2.88' });
    return t => {
      const c0 = c.c(0), c1 = c.c(1), c2 = c.c(2), c3 = c.c(3), c4 = c.c(4);
      show(head, t, c0 - .3, .6);
      // c0
      opacity(TL, P(t, c0 - .2, .5) * (1 - P(t, c1, .6)));
      show(tlab, t, c0 + .2, .6, { out: c1 - .1, outD: .4 });
      show(tsub, t, c0 + 1.2, .6, { out: c1 - .1, outD: .4 });
      runs.forEach((r, k) => {
        const s0 = c0 + .3 + k * 1.75, d = .25 + 1.0 * r.T / 714;
        const p = Ease.inOut(P(t, s0, d));
        r.mt.place(lerp(x0, r.x, p), yA - 4, 300 * Math.max(0, Math.min(t, s0 + d) - s0));
        opacity(r.mt, P(t, s0 - .1, .15) * (1 - P(t, s0 + d - .02, .12)));
        pop(r.gg, t, s0 + d + .08, .35, { out: c1 - .1, outD: .4 });
      });
      // c1
      C.anim(t, c1 - .1, .6);
      draw(pdfC, t, c1 + .4, 1.8);
      show(pl, t, c1 + 1.8, .5, { dy: 10 });
      show(note, t, c1 + 5.0, .6, { out: c2, outD: .4 });
      // c2 / c3: t sweeps 150 → 300 during c2, then rests at 300
      const tv = lerp(150, 300, P(t, c2, c.e(2) - c2));
      const xt = C.X(tv);
      tL.setAttribute('d', `M${xt} ${yA} L${xt} ${y0 - 6}`);
      tT.setAttribute('x', xt);
      const on2 = P(t, c2 - .2, .4);
      tL.style.opacity = on2; tT.style.opacity = on2;
      aF.setAttribute('d', areaD(C.X, C.Y, 0, tv));
      opacity(aF, .95 * on2);
      const fx = tv * .68;
      fl.setAttribute('x', C.X(fx)); fl.setAttribute('y', C.Y(wbf(fx) * .38));
      opacity(fl, P(t, c2 + .6, .4));
      aR.setAttribute('d', areaD(C.X, C.Y, tv, 1000, 140));
      opacity(aR, .95 * P(t, c3, .5));
      const rx = tv + (1000 - tv) * .24;
      rl.setAttribute('x', C.X(rx)); rl.setAttribute('y', C.Y(wbf(rx) * .4));
      opacity(rl, P(t, c3 + .4, .4));
      show(ro, t, c2 + .1, .5);
      V_[0].textContent = Math.round(tv);
      V_[1].textContent = wbF(tv).toFixed(3);
      V_[2].textContent = wbR(tv).toFixed(3);
      opacity(R_[0], 1); opacity(R_[1], 1);
      opacity(R_[2], P(t, c3 + .2, .4));
      opacity(R_[3], P(t, c4 + .4, .4));
      // c4
      show(fc, t, c4 + .1, .5);
      fr.forEach((e, i) => opacity(e, P(t, c4 + .3 + i * .8, .4)));
      show(dist, t, c1 + 2.4, .6);
    };
  });

  // ================================================================ hazard
  scene('hazard', (root, c) => {
    const Dt = D();
    const g = svgLayer(root);
    const head = box(root, 150, 110, { class: 'h2', html: '失效率 <span class="c-red">λ(t)</span>' });
    const head2 = box(root, 150, 110, { class: 'h2', html: '⚠ 提醒：同一個 λ，兩種意思' });
    const fcard = card(root, 150, 222, 650, 0, { pad: 26 });
    fcard.innerHTML = `<div style="font-size:26px;font-weight:700;color:var(--red)">失效率（hazard rate）</div>
      <div style="font-size:50px;margin:10px 0 6px">${tex('\\textcolor{#d9412e}{\\lambda(t)}=\\dfrac{f(t)}{R(t)}')}</div>
      <div class="body">撐到此刻 t 的設備，<br>下一瞬間故障的<span class="hl">速率</span></div>
      <div style="margin-top:12px"><span class="tag t-gray">論文 式 (2.12)</span></div>`;
    // c0: main-case hazard
    const GH = s('g', {}, g);
    const CH = chart(GH, 960, 270, 740, 390, { xmin: 0, xmax: 1000, ymin: 0, ymax: .035, xticks: [0, 250, 500, 750, 1000], yticks: [0, .01, .02, .03], fy: v => v.toFixed(2), xlabel: '時間 t（天）', ylabel: 'λ(t)　主案例' });
    const hz = CH.plot(Dt.t, Dt.haz, { color: 'var(--red)', w: 5 });
    const hzl = svgText(GH, CH.X(560), CH.Y(.026), '越老，越容易壞', { size: 28, fill: 'var(--red)' });
    // c1–c3: bathtub (illustrative)
    const GB = s('g', {}, g);
    const bx = 960, by = 270, bw = 740, bh = 390;
    const bands = [[0, .22, '早期故障期', '↘ 遞減', 'var(--blue-soft)'], [.22, .68, '隨機故障期', '→ 持平', '#ece6d8'], [.68, 1, '磨耗期', '↗ 遞增', 'var(--red-soft)']].map(([a, b, n1, n2, col]) => {
      const grp = s('g', {}, GB);
      const r = s('rect', { x: bx + a * bw, y: by - 4, width: (b - a) * bw, height: bh + 4, fill: col }, grp);
      const xm = bx + (a + (b - a) / 2) * bw;
      const tx = svgText(grp, b === 1 ? bx + .8 * bw : xm, by + 26, n1, { size: 25 });
      const t2 = svgText(grp, b === 1 ? bx + .8 * bw : xm, by + 58, n2, { size: 23, weight: 500, fill: 'var(--mute)' });
      return { grp, r, a, b };
    });
    const wearG = s('rect', { x: bx + .68 * bw, y: by - 4, width: .32 * bw, height: bh + 4, fill: 'var(--green-soft)' });
    bands[2].grp.insertBefore(wearG, bands[2].r.nextSibling);
    const CB = chart(GB, bx, by, bw, bh, { xmin: 0, xmax: 1, ymin: 0, ymax: 1.12, xticks: [], yticks: [], ylabel: '失效率 λ(t)' });
    svgText(GB, bx + bw, by + bh + 32, '時間 →', { size: 24, anchor: 'end', weight: 500, fill: 'var(--mute)' });
    const tub = path(GB, fpath(u => .6 * Math.exp(-8 * u) + .15 + .9 * Math.pow(u, 4), 0, 1, 160, CB.X, CB.Y), { stroke: 'var(--red)', w: 5 });
    const tags = rbox(root, 1700, 216, { html: '<span class="tag t-gray">示意</span> <span class="tag t-gray">教科書概念（論文未討論）</span>' });
    tags.querySelectorAll('.tag').forEach(e => { e.style.fontSize = '21px'; });
    const chk = path(GB, `M${bx + .78 * bw} ${by + 300} l 18 20 l 34 -44`, { stroke: 'var(--green)', w: 7 });
    const call = card(root, 150, 640, 650, 0, { pad: 22, style: { borderColor: 'var(--green)', background: 'var(--green-soft)' } });
    call.innerHTML = '<div class="body" style="font-weight:700;color:#23793c">✓ 只有設備會老化、失效率上升時，<br>提早預防更換才划算</div>';
    // c4: two λ's
    const L = card(root, 210, 300, 640, 0, { pad: 30, style: { borderColor: 'var(--red)', borderWidth: '4px' } });
    L.innerHTML = `<div class="center" style="font-size:84px;color:var(--red);line-height:1.2">${tex('\\lambda(t)')}</div>
      <div class="h2 center" style="color:var(--red)">失效率</div>
      <div class="small center" style="margin-top:8px">設備可靠度：影片第 2–3 章<br>帶括號 · 紅色</div>`;
    const Rc = card(root, 1070, 300, 640, 0, { pad: 30, style: { borderColor: '#c9a227', borderWidth: '4px' } });
    Rc.innerHTML = `<div class="center" style="line-height:1.2"><span style="display:inline-block;background:${YSOFT};border:2.5px solid #c9a227;border-radius:16px;padding:0 30px;font-size:84px">${tex('\\lambda')}</span></div>
      <div class="h2 center">損失規避係數</div>
      <div class="small center" style="margin-top:8px">人的心理：影片第 5 章起<br>單獨的 λ · 黃色標籤</div>`;
    const warn = box(root, 960, 455, { html: '⚠', style: { fontSize: '84px', color: 'var(--orange)' } }, 'c');
    const diff = box(root, 960, 760, { class: 'h3 center', html: '符號相同，意思<span class="hl">完全不同</span>' }, 'tc');
    return t => {
      const c0 = c.c(0), c1 = c.c(1), c2 = c.c(2), c3 = c.c(3), c4 = c.c(4);
      show(head, t, c0 - .3, .6, { out: c4 - .1, outD: .4 });
      show(fcard, t, c0 + .2, .6, { out: c4 - .1, outD: .4 });
      opacity(GH, 1 - P(t, c1 - .1, .5));
      CH.anim(t, c0 + 1.2, .6);
      draw(hz, t, c0 + 1.8, 1.6);
      show(hzl, t, c0 + 3.4, .5, { dy: 10 });
      // bathtub
      opacity(GB, P(t, c1 + .3, .4) * (1 - P(t, c4 - .1, .5)));
      CB.anim(t, c1 + .3, .6);
      draw(tub, t, c1 + .9, 2.2);
      show(tags, t, c1 + 1.2, .5, { out: c4 - .1, outD: .4 });
      bands.forEach((b, i) => opacity(b.grp, P(t, c2 + .2 + i * 1.5, .5)));
      opacity(wearG, P(t, c3 + .2, .6));
      draw(chk, t, c3 + .7, .5);
      show(call, t, c3 + 1.0, .6, { out: c4 - .1, outD: .4 });
      // c4
      show(head2, t, c4 + .2, .6);
      show(L, t, c4 + 1.0, .6, { dy: 30 });
      pop(warn, t, c4 + 3.6, .5);
      show(Rc, t, c4 + 4.4, .6, { dy: 30 });
      show(diff, t, c4 + 7.4, .6);
    };
  });

  // ================================================================ weibull
  scene('weibull', (root, c) => {
    const Dt = D();
    const g = svgLayer(root);
    const head = box(root, 150, 110, { class: 'h2', html: '韋伯分配 <span class="en" style="font-size:40px;color:var(--mute)">Weibull</span>' });
    const fcard = card(root, 150, 206, 650, 0, { pad: 24 });
    fcard.innerHTML = `<div style="font-size:46px;text-align:center">${tex('R(t)=\\exp\\!\\left[-\\left(\\dfrac{t}{\\alpha}\\right)^{\\beta}\\,\\right]')}</div>
      <div style="display:flex;gap:14px;justify-content:center;margin-top:10px">
        <span class="tag t-gray ta" style="font-size:26px">${tex('\\alpha')}　尺度（時間刻度）</span>
        <span class="tag t-gray tb" style="font-size:26px">${tex('\\beta')}　形狀（老化型態）</span></div>`;
    const tA = fcard.querySelector('.ta'), tB = fcard.querySelector('.tb');
    const x0 = 980, y0 = 270, w = 720, hh = 400;
    // chart 1: R and F (0..1)
    const G1 = s('g', {}, g);
    const C1 = chart(G1, x0, y0, w, hh, { xmin: 0, xmax: 1000, ymin: 0, ymax: 1, xticks: [0, 250, 500, 750, 1000], yticks: [0, .5, 1], fy: v => String(v), xlabel: '時間 t（天）', ylabel: '機率' });
    const Rc = C1.plot(Dt.t, Dt.rel, { color: 'var(--teal)', w: 5 });
    const Rl = svgText(G1, C1.X(640), C1.Y(.2), 'R(t)', { size: 32, fill: 'var(--teal)' });
    const Fc = C1.plot(Dt.t, Dt.cdf, { color: 'var(--red)', w: 5 });
    const Fl = svgText(G1, C1.X(600), C1.Y(.74), 'F(t) = 1 − R(t)', { size: 28, fill: 'var(--red)', anchor: 'start' });
    const hl632 = C1.hline(1 - Math.exp(-1), { color: 'var(--ink)', w: 2.5 });
    const vlA = C1.vline(ALPHA, { color: 'var(--ink)', w: 2.5 });
    const l632 = svgText(G1, x0 - 14, C1.Y(.632), '0.632', { size: 21, anchor: 'end', family: 'Inter', fill: 'var(--ink)' });
    const lA = svgText(G1, C1.X(ALPHA), y0 - 26, 'α = 425.31 天', { size: 24, fill: 'var(--ink)' });
    const dA = C1.dot(ALPHA, 1 - Math.exp(-1), { color: 'var(--red)', r: 10 });
    const ann = box(root, C1.X(ALPHA) + 26, C1.Y(.632) + 22, { html: tex('F(\\alpha)=1-e^{-1}\\approx 0.632') });
    Object.assign(ann.style, { fontSize: '28px', background: 'var(--card)', padding: '2px 10px', borderRadius: '8px' });
    // chart 2: hazard shapes
    const G2 = s('g', {}, g);
    const C2 = chart(G2, x0, y0, w, hh, { xmin: 0, xmax: 1000, ymin: 0, ymax: .01, xticks: [0, 250, 500, 750, 1000], yticks: [0, .005, .01], fy: v => v.toFixed(3), xlabel: '時間 t（天）', ylabel: '失效率 λ(t)' });
    const SH = [
      { k: '0.7', lab: 'β = 0.7', dash: '2 10', desc: '遞減：像早期故障段' },
      { k: '1.0', lab: 'β = 1', dash: '16 10', desc: '常數：像隨機故障段' },
      { k: '2.88', lab: 'β = 2.88', dash: null, desc: '遞增：磨耗老化' },
      { k: '5.0', lab: 'β = 5', dash: '26 8 4 8', desc: '遞增更快：磨耗老化' },
    ].map((o, i) => {
      const p = C2.plot(Dt.t, Dt.shapes[o.k].haz, { color: 'var(--red)', w: 4, dash: o.dash });
      return { ...o, p, wp: wipe(g, p, 'aI-wb-clip' + i, x0 - 10, y0 - 30, w + 20, hh + 40) };
    });
    const endLab = (o, x, y, anchor) => svgText(G2, x, y, o.lab, { size: 22, anchor, family: 'Inter', fill: 'var(--red)' });
    SH[0].l = endLab(SH[0], x0 + w + 10, C2.Y(Dt.shapes['0.7'].haz[200]) + 14, 'start');
    SH[1].l = endLab(SH[1], x0 + w + 10, C2.Y(Dt.shapes['1.0'].haz[200]) - 12, 'start');
    SH[2].l = endLab(SH[2], C2.X(523) + 12, y0 - 20, 'start');
    SH[3].l = endLab(SH[3], C2.X(408) - 6, y0 - 20, 'end');
    const sTag = rbox(root, 1700, 168, { class: 'tag t-gray', text: '同 α，示意比較' });
    sTag.style.fontSize = '21px';
    const caseL = box(root, C2.X(610), C2.Y(.0068), { html: '論文案例<br><span class="en">α = 425.31 天、β = 2.88</span>' });
    Object.assign(caseL.style, { fontSize: '26px', fontWeight: 700, color: 'var(--blue)', lineHeight: 1.35 });
    // chart 3: pdf + MTTF
    const G3 = s('g', {}, g);
    const C3 = chart(G3, x0, y0, w, hh, { xmin: 0, xmax: 1000, ymin: 0, ymax: .003, xticks: [0, 250, 500, 750, 1000], yticks: [0, .001, .002, .003], fy: v => v.toFixed(3), xlabel: '時間 t（天）', ylabel: 'f(t)' });
    const ar3 = path(G3, areaD(C3.X, C3.Y, 0, 1000, 160), { fill: 'var(--blue-soft)', stroke: 'none', w: 0 });
    G3.insertBefore(ar3, G3.firstChild);
    const pd3 = C3.plot(Dt.t, Dt.pdf, { color: 'var(--blue)', w: 5 });
    const vM = C3.vline(379.1372, { color: 'var(--ink)', w: 3 });
    const lM = svgText(G3, C3.X(379.1372) + 12, y0 + 6, 'MTTF ≈ 379 天', { size: 26, anchor: 'start' });
    // left panel per cue
    const p1 = card(root, 150, 500, 650, 0, { pad: 24 });
    p1.innerHTML = `<div class="h3">${tex('\\alpha')} 決定時間尺度</div>
      <div class="body" style="margin-top:6px">不論 ${tex('\\beta')} 是多少，<br>約 <span class="hl"><b>63.2%</b></span> 的設備會在 ${tex('\\alpha')} 之前故障</div>`;
    const p2 = card(root, 150, 500, 650, 0, { pad: 22 });
    const rowsH = SH.map(o => `<div class="lr" style="display:flex;align-items:center;gap:14px;padding:4px 10px;border-radius:10px">
        <svg width="64" height="16" style="flex:none;overflow:visible"><path d="M2 8 H62" stroke="var(--red)" stroke-width="4" fill="none" stroke-linecap="round" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''}/></svg>
        <b class="en" style="width:118px;font-size:26px">${o.lab}</b><span style="font-size:26px">${o.desc}</span></div>`).join('');
    p2.innerHTML = rowsH + '<div class="small" style="margin-top:10px;color:var(--ink)">一組 β 只描述浴缸曲線的<span class="hl">其中一段</span></div>';
    const lr = [...p2.querySelectorAll('.lr')], lnote = p2.querySelector('.small');
    const p4 = card(root, 150, 500, 650, 0, { pad: 24 });
    p4.innerHTML = `<div class="h3">平均壽命 <span class="en">MTTF</span></div>
      <div style="font-size:34px;margin:8px 0">${tex('\\text{MTTF}=\\alpha\\,\\Gamma\\!\\left(1+\\tfrac{1}{\\beta}\\right)')}</div>
      <div style="font-size:40px;font-weight:800" class="en">= 379.1372 <span style="font-size:30px">天</span></div>
      <div class="small" style="margin-top:6px">論文 Table 4.4</div>`;
    return t => {
      const c0 = c.c(0), c1 = c.c(1), c2 = c.c(2), c3 = c.c(3), c4 = c.c(4);
      show(head, t, c0 - .3, .6);
      show(fcard, t, c0 + .1, .6);
      pop(tA, t, c0 + 4.6, .5); pop(tB, t, c0 + 6.0, .5);
      // chart 1 (c0–c1)
      opacity(G1, 1 - P(t, c2 - .1, .5));
      C1.anim(t, c0 + 1.2, .6);
      draw(Rc, t, c0 + 1.6, 1.4);
      opacity(Rc, lerp(1, .25, P(t, c1, .5)) * (P(t, c0 + 1.6, .01)));
      opacity(Rl, P(t, c0 + 2.6, .4) * lerp(1, .25, P(t, c1, .5)));
      draw(Fc, t, c1 + .2, 1.2); opacity(Fl, P(t, c1 + 1.2, .4));
      opacity(hl632, P(t, c1 + 1.6, .5)); opacity(vlA, P(t, c1 + 1.6, .5));
      opacity(l632, P(t, c1 + 2.0, .4)); opacity(lA, P(t, c1 + 2.0, .4));
      pop(dA, t, c1 + 2.2, .4);
      show(ann, t, c1 + 2.6, .5, { out: c2 - .1, outD: .4 });
      show(p1, t, c1 + 2.8, .6, { out: c2 - .1, outD: .4 });
      // chart 2 (c2–c3)
      opacity(G2, P(t, c2 + .1, .5) * (1 - P(t, c4 - .1, .5)));
      C2.anim(t, c2 + .1, .5);
      const dIn = [c2 + .4, c2 + 2.6, c2 + 4.6, c2 + 5.4];
      const hiCase = P(t, c3 + .2, .6);
      SH.forEach((o, i) => {
        o.wp(Ease.inOut(P(t, dIn[i], 1.0)));
        if (i === 2) {
          o.p.setAttribute('stroke-width', lerp(4, 7, hiCase));
          o.p.setAttribute('stroke', hiCase > .5 ? 'var(--blue)' : 'var(--red)');
          o.l.setAttribute('fill', hiCase > .5 ? 'var(--blue)' : 'var(--red)');
        } else o.p.style.opacity = lerp(1, .3, hiCase);
        opacity(o.l, P(t, dIn[i] + .8, .4) * (i === 2 ? 1 : lerp(1, .3, hiCase)));
        opacity(lr[i], P(t, dIn[i], .4) * (i === 2 ? 1 : lerp(1, .45, hiCase)));
      });
      lr[2].style.background = hiCase > .01 ? `rgba(219,231,255,${hiCase})` : 'transparent';
      opacity(lnote, P(t, c2 + 7.4, .5));
      show(p2, t, c2 + .2, .5, { out: c4 - .1, outD: .4 });
      show(sTag, t, c2 + .8, .5, { out: c4 - .1, outD: .4 });
      show(caseL, t, c3 + .8, .6, { out: c4 - .1, outD: .4 });
      // chart 3 (c4)
      opacity(G3, P(t, c4 + .1, .5));
      C3.anim(t, c4 + .1, .5);
      draw(pd3, t, c4 + .3, 1.0);
      opacity(ar3, .8 * P(t, c4 + .9, .5));
      opacity(vM, P(t, c4 + 1.4, .5)); opacity(lM, P(t, c4 + 1.7, .4));
      show(p4, t, c4 + .4, .6);
    };
  });
})();
