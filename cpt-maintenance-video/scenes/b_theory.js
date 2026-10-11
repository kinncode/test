// Chapters 3–5 · 年齡更換策略 / 理性與風險態度 / 累積展望理論
// scenes: arp, twocases, costrate, tradeoff, optcond, attitudes, bounded, prospect, valuefn, pwf, cumulative
(() => {
  // ------------------------------------------------------------------ local helpers
  const COL = { ink: '#1f2430', mute: '#6b7280', blue: '#2563eb', orange: '#e2860b', red: '#d9412e', teal: '#0f9d8a', green: '#2e9e4f', purple: '#7c4ddb' };
  const tc = (c, src) => `\\textcolor{${COL[c] || c}}{${src}}`;
  const TX = (src, size, disp = false) => `<span style="font-size:${size}px">${tex(src, disp)}</span>`;
  const fmt = v => Math.round(v).toLocaleString('en-US');
  const layer = root => h('div', { class: 'abs', style: { left: '0px', top: '0px', width: W + 'px', height: H + 'px' } }, root);
  const heading = (root, html) => box(root, 150, 108, { class: 'h2', html });
  const tagB = (root, x, y, html, cls = 't-gray', anchor = 'tl', st = {}) => { const e = box(root, x, y, { class: 'tag ' + cls, html }, anchor); Object.assign(e.style, st); return e; };
  const setAnchor = (el, a) => { el._anchor = a; el.style.transform = a; return el; };
  const mini = txt => `<span class="tag t-gray" style="font-size:20px;padding:2px 10px;vertical-align:middle">${txt}</span>`;
  const SHI = mini('示意'), RECALC = mini('我們重算');
  const LAM = '<span class="tag" style="background:#fcefc2;color:#8a6200;padding:2px 12px;vertical-align:middle">λ</span>';
  const WA = 425.31, WB = 2.88;
  const wgt = (p, g) => { const a = Math.pow(p, g), b = Math.pow(1 - p, g); return a / Math.pow(a + b, 1 / g); };
  const cumInt = (xs, ys) => { const o = [0]; for (let i = 1; i < xs.length; i++) o.push(o[i - 1] + (ys[i] + ys[i - 1]) / 2 * (xs[i] - xs[i - 1])); return o; };
  const cross = (g, x, y, r, o = {}) => path(g, `M${x - r} ${y - r} L${x + r} ${y + r} M${x + r} ${y - r} L${x - r} ${y + r}`, { stroke: o.stroke || 'var(--red)', w: o.w ?? 6 });
  const check = (g, x, y, r, o = {}) => path(g, `M${x - r} ${y} L${x - r * .3} ${y + r * .7} L${x + r} ${y - r * .8}`, { stroke: o.stroke || 'var(--green)', w: o.w ?? 6 });
  // math-style text in SVG (inline style beats the stylesheet's svg text font)
  const mt = (g, x, y, str, o = {}) => { const e = svgText(g, x, y, str, { size: o.size || 30, fill: o.fill || 'var(--ink)', anchor: o.anchor, weight: 400 }); e.style.fontFamily = 'KaTeX_Math, serif'; return e; };
  const nt = (g, x, y, str, o = {}) => { const e = svgText(g, x, y, str, { size: o.size || 22, fill: o.fill || 'var(--mute)', anchor: o.anchor, weight: o.weight || 600 }); e.style.fontFamily = 'Inter, sans-serif'; return e; };
  // vertical curly brace spanning y1..y2 at x, tip pointing right by w
  const braceV = (g, x, y1, y2, w, o = {}) => {
    const m = (y1 + y2) / 2, r = Math.min(w / 2, (y2 - y1) / 6), xm = x + w / 2;
    return path(g, `M${x} ${y1} Q${xm} ${y1} ${xm} ${y1 + r} L${xm} ${m - r} Q${xm} ${m} ${x + w} ${m} Q${xm} ${m} ${xm} ${m + r} L${xm} ${y2 - r} Q${xm} ${y2} ${x} ${y2}`, { w: 4, ...o });
  };
  const GK = str => str.replace(/[γνδ]/g, m => `<span style="font-family:KaTeX_Math;font-style:normal">${m}</span>`);
  // SVG text from parts [[str, isMath], ...]
  const svgMix = (g, x, y, parts, o = {}) => {
    const e = svgText(g, x, y, '', { size: o.size || 24, anchor: o.anchor, fill: o.fill || 'var(--ink)', weight: o.weight || 700 });
    parts.forEach(([str, m]) => { const sp = s('tspan', { text: str }, e); if (m) { sp.style.fontFamily = 'KaTeX_Math, serif'; sp.style.fontWeight = 400; } });
    return e;
  };
  const seg = (el, x1, y1, x2, y2, p) => { el.setAttribute('d', `M${x1} ${y1} L${lerp(x1, x2, p)} ${lerp(y1, y2, p)}`); opacity(el, p > 0 ? 1 : 0); };

  function turbine(g, x, yb, H0) {
    const grp = s('g', {}, g), hy = yb - H0, L = H0 * .55;
    path(grp, `M${x - H0 * .04} ${yb} L${x - H0 * .016} ${hy} L${x + H0 * .016} ${hy} L${x + H0 * .04} ${yb} Z`, { fill: 'var(--card)', w: 4 });
    s('rect', { x: x - H0 * .035, y: hy - H0 * .04, width: H0 * .15, height: H0 * .075, rx: H0 * .025, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 4 }, grp);
    const rot = s('g', {}, grp);
    for (let i = 0; i < 3; i++) s('path', { d: `M${x} ${hy} C${x + L * .16} ${hy - L * .2} ${x + L * .1} ${hy - L * .75} ${x} ${hy - L} C${x - L * .07} ${hy - L * .7} ${x - L * .08} ${hy - L * .25} ${x} ${hy} Z`, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 3.5, 'stroke-linejoin': 'round', transform: `rotate(${i * 120} ${x} ${hy})` }, rot);
    s('circle', { cx: x, cy: hy, r: Math.max(7, H0 * .035), fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 4 }, grp);
    line(grp, x - H0 * .28, yb, x + H0 * .28, yb, { w: 4 });
    grp.spin = a => rot.setAttribute('transform', `rotate(${a} ${x} ${hy})`);
    return grp;
  }

  function balanceIcon(g, cx, cy, sc = 1, o = {}) {
    const grp = s('g', { transform: `translate(${cx},${cy}) scale(${sc})` }, g);
    path(grp, 'M0 -70 V80 M-50 80 H50', { w: 6 });
    const beam = s('g', {}, grp);
    path(beam, 'M-120 -70 H120', { w: 6 });
    const pans = [-1, 1].map((sd, i) => {
      const p = s('g', {}, beam);
      path(p, `M${sd * 120} -70 L${sd * 120 - 42} 0 M${sd * 120} -70 L${sd * 120 + 42} 0`, { w: 3 });
      path(p, `M${sd * 120 - 54} 0 Q ${sd * 120} 46 ${sd * 120 + 54} 0 Z`, { w: 4, fill: (o.fills && o.fills[i]) || 'var(--card)' });
      if (o.labels) svgText(p, sd * 120, 50, o.labels[i], { size: 26, fill: (o.cols && o.cols[i]) || 'var(--ink)' });
      return p;
    });
    s('circle', { cx: 0, cy: -70, r: 9, fill: 'var(--ink)' }, grp);
    grp.tilt = a => { beam.setAttribute('transform', `rotate(${a} 0 -70)`); pans.forEach((p, i) => p.setAttribute('transform', `rotate(${-a} ${(i ? 1 : -1) * 120} -70)`)); };
    grp.tilt(0);
    return grp;
  }

  function docIcon(g, x, y, w, hh, fill) {
    const grp = s('g', {}, g), f = 20;
    path(grp, `M${x} ${y} H${x + w - f} L${x + w} ${y + f} V${y + hh} H${x} Z`, { fill, w: 3 });
    path(grp, `M${x + w - f} ${y} V${y + f} H${x + w}`, { w: 3 });
    for (let i = 0; i < 3; i++) line(grp, x + 14, y + 28 + i * 15, x + w - (i ? 16 : 30), y + 28 + i * 15, { w: 3, stroke: 'rgba(31,36,48,.32)' });
    return grp;
  }

  function bubble(root, x, y, text, color) {
    const e = box(root, x, y, {}, 'tc');
    Object.assign(e.style, { background: 'var(--card)', border: `3px solid ${color}`, borderRadius: '22px', padding: '10px 26px', fontSize: '32px', fontWeight: 700, color });
    h('span', { text }, e);
    const tl = h('div', {}, e);
    Object.assign(tl.style, { position: 'absolute', width: '22px', height: '22px', background: 'var(--card)', borderRight: `3px solid ${color}`, borderBottom: `3px solid ${color}`, transform: 'rotate(45deg)', bottom: '-14px', left: 'calc(50% - 11px)' });
    return e;
  }

  // ================================================================== arp
  scene('arp', (root, c) => {
    const big = box(root, 960, 270, {
      class: 'center', html:
        `<div class="h1" style="font-size:92px">年齡更換策略</div>
         <div class="en" style="font-size:40px;font-weight:700;color:var(--mute);margin-top:8px">Age Replacement Policy（ARP）</div>
         <div style="margin-top:34px"><span class="tag t-blue en" style="font-size:32px;padding:6px 22px">Barlow &amp; Hunter, 1960</span></div>`,
    }, 'tc');
    const bigSub = box(root, 960, 640, { class: 'body center', text: '論文用來安排保養時間的規則', style: { color: 'var(--mute)' } }, 'tc');
    const hd = heading(root, `年齡更換策略 <span class="en">ARP</span><span class="tag t-gray en" style="font-size:24px;vertical-align:middle;margin-left:18px">Barlow &amp; Hunter, 1960</span>`);

    const st = layer(root), g = svgLayer(st);
    const TAU = 330, DY = 112;
    const R = [{ k: 'pm', f: 1 }, { k: 'cm', f: .35 }, { k: 'pm', f: 1 }, { k: 'cm', f: .7 }, { k: 'pm', f: 1 }];
    let cx = 200, cy = 300;
    R.forEach((r, i) => {
      r.x0 = cx; r.y = cy; r.x1 = cx + TAU * r.f; cx = r.x1; cy += DY;
      r.tick = line(g, r.x0, r.y - 20, r.x0, r.y + 20, { stroke: 'var(--blue)', w: 5 });
      r.seg = line(g, r.x0, r.y, r.x1, r.y, { w: 5 });
      r.end = s('g', {}, g);
      if (r.k === 'pm') {
        line(r.end, r.x1, r.y - 20, r.x1, r.y + 20, { stroke: 'var(--teal)', w: 6 });
        Icons.wrench(r.end, r.x1 - 2, r.y - 78, .55, 'var(--teal)');
        svgText(r.end, r.x1 + 46, r.y - 48, i === 0 ? 'PM 預防性維修' : 'PM', { size: 28, anchor: 'start', fill: 'var(--teal)' });
        mt(r.end, r.x1 + 20, r.y + 34, 'τ', { anchor: 'start' });
      } else {
        line(r.end, r.x1, r.y - 20, r.x1, r.y + 20, { stroke: 'var(--red)', w: 5 });
        cross(r.end, r.x1, r.y - 34, 12, { w: 6 });
        svgText(r.end, r.x1 + 24, r.y - 48, i === 1 ? 'CM 矯正性維修' : 'CM', { size: 28, anchor: 'start', fill: 'var(--red)' });
        r.ghost = path(g, '', { stroke: 'var(--mute)', w: 4, dash: '10 10' });
        r.gl = s('g', {}, g);
        line(r.gl, r.x0 + TAU, r.y - 14, r.x0 + TAU, r.y + 14, { stroke: 'var(--mute)', w: 4 });
        mt(r.gl, r.x0 + TAU, r.y + 42, 'τ', { fill: 'var(--mute)', size: 28 });
        if (i === 1) svgText(r.gl, r.x0 + TAU + 22, r.y + 2, '沒用到的 τ', { size: 22, anchor: 'start', fill: 'var(--mute)', weight: 500 });
      }
      if (i < R.length - 1) {
        r.drop = s('g', {}, g);
        line(r.drop, r.x1, r.y + 26, r.x1, r.y + DY - 30, { stroke: 'var(--mute)', w: 3, dash: '7 7' });
        path(r.drop, `M${r.x1 - 9} ${r.y + DY - 40} L${r.x1} ${r.y + DY - 28} L${r.x1 + 9} ${r.y + DY - 40}`, { stroke: 'var(--mute)', w: 3 });
      }
      if (i > 0) { r.nw = tagB(st, r.x0 - 16, r.y, '如新', 't-green', 'tl', { fontSize: '22px', padding: '2px 10px' }); setAnchor(r.nw, 'translate(-100%,-50%) '); }
    });
    // dimension above round 0
    const dim = s('g', {}, g);
    path(dim, `M${R[0].x0 + 4} 252 V262 H${R[0].x1 - 4} V252`, { stroke: 'var(--mute)', w: 2.5 });
    svgText(dim, (R[0].x0 + R[0].x1) / 2, 228, '保養年齡 τ（從上次更新起算）', { size: 24, fill: 'var(--ink)', weight: 700 });
    const startL = svgText(g, R[0].x0, R[0].y + 46, '計畫開始', { size: 22, fill: 'var(--blue)' });
    // round counter + loop note
    const ctr = box(st, 1640, 230, { class: 'pill', text: '第 1 輪' }, 'tc');
    Object.assign(ctr.style, { fontSize: '36px', padding: '8px 30px' });
    const loopNote = box(st, 1640, 310, { class: 'body center', html: '更換後都「如新」<br>重新計時、一輪接一輪', style: { fontSize: '26px', lineHeight: 1.4, color: 'var(--mute)' } }, 'tc');

    // c4: figure + ARP I / II
    const fig = figCard(root, 800, 290, 980, 'assets/fig3_1b.png', '論文 Fig. 3.1(b)：年齡更換策略——在 τ 之前故障時改做矯正性維修');
    const k1 = card(root, 150, 315, 590, 0, { pad: 26, style: { borderColor: 'var(--green)' } });
    k1.innerHTML = `<div class="h3" style="color:var(--green)">ARP I　✓ 論文採用</div>
      <div class="body">到 τ 做 PM；故障就做 CM<br>兩者都換成「如新」</div>
      <div style="margin-top:10px"><span class="tag t-green">論文：較適合風機的特性</span></div>`;
    const k2 = card(root, 150, 605, 590, 0, { pad: 26, style: { borderColor: '#b9b2a3' } });
    k2.innerHTML = `<div class="h3" style="color:var(--mute)">ARP II　未採用</div>
      <div class="body" style="color:var(--mute)">故障後只做「最小修復」</div>`;

    const t0s = [c.c(1) + .4, c.c(2) + .1, c.c(3) + .3, c.c(3) + 2.0, c.c(3) + 3.7];
    const sd = [4.4, 1.0, 1.1, 1.0, 1.1];
    return t => {
      show(big, t, c.c(0) - .1, .8, { out: c.c(1) - .4, outD: .5 });
      show(bigSub, t, c.c(0) + 1.6, .6, { out: c.c(1) - .4, outD: .5 });
      show(hd, t, c.c(1) + .1, .6);
      opacity(st, 1 - P(t, c.c(4) - .2, .6));
      show(dim, t, c.c(1) + 1.0, .6);
      opacity(startL, P(t, t0s[0] + .3, .3));
      R.forEach((r, i) => {
        const a = t0s[i], te = a + .35 + sd[i];
        opacity(r.tick, P(t, a + .25, .2));
        draw(r.seg, t, a + .35, sd[i], { ease: Ease.lin });
        pop(r.end, t, te, .4);
        if (r.ghost) { seg(r.ghost, r.x1, r.y, r.x0 + TAU, r.y, Ease.out(P(t, te + .3, .6))); opacity(r.gl, P(t, te + .8, .3)); }
        if (r.drop) show(r.drop, t, t0s[i + 1] - .1, .35, { dy: -12 });
        if (r.nw) show(r.nw, t, i === 1 ? c.c(3) + .1 : a + .3, .4, { dy: 0, dx: -10 });
      });
      let n = 0; t0s.forEach(a => { if (t >= a - .1) n++; });
      ctr.textContent = `第 ${Math.max(1, n)} 輪`;
      show(ctr, t, c.c(1) + .3, .5);
      show(loopNote, t, c.c(3) + .6, .6);
      pop(fig, t, c.c(4) + .2, .6);
      show(k1, t, c.c(4) + .9, .6, { dx: -30, dy: 0 });
      show(k2, t, c.c(4) + 2.4, .6, { dx: -30, dy: 0 });
    };
  });

  // ================================================================== twocases
  scene('twocases', (root, c) => {
    const hd = heading(root, '每一輪：只會出現兩種情境之一');
    const g = svgLayer(root);
    const X0 = 290, XT = 900, Y1 = 290, Y2 = 530, XF = X0 + .55 * (XT - X0);
    const skel = [Y1, Y2].map(y => {
      const grp = s('g', {}, g);
      line(grp, X0, y, XT + 80, y, { stroke: 'var(--faint)', w: 4 });
      line(grp, XT, y - 28, XT, y + 28, { stroke: '#c9c0ad', w: 3, dash: '6 6' });
      line(grp, X0, y - 22, X0, y + 22, { stroke: 'var(--blue)', w: 5 });
      svgText(grp, X0, y + 48, '計畫開始', { size: 22, fill: 'var(--blue)' });
      mt(grp, XT, y + 48, 'τ');
      return grp;
    });
    const lab1 = tagB(root, 150, Y1, '情境一', 't-teal', 'cl', { fontSize: '26px' });
    const lab2 = tagB(root, 150, Y2, '情境二', 't-red', 'cl', { fontSize: '26px' });
    // scenario 1: survives to τ → PM
    const seg1 = line(g, X0, Y1, XT, Y1, { stroke: 'var(--teal)', w: 7 });
    const end1 = s('g', {}, g);
    line(end1, XT, Y1 - 22, XT, Y1 + 22, { stroke: 'var(--teal)', w: 6 });
    Icons.wrench(end1, XT - 2, Y1 - 86, .6, 'var(--teal)');
    svgText(end1, XT + 50, Y1 - 54, 'PM', { size: 30, anchor: 'start', fill: 'var(--teal)' });
    const chipR = box(root, (X0 + XT) / 2 - 20, Y1 - 46, { class: 'tag t-teal', html: `撐到 τ 的機率 ${tex(tc('teal', 'R(\\tau)'))}` }, 'c');
    const chipCp = box(root, 745, Y1 + 50, { class: 'tag t-teal', html: `PM 成本 ${tex('C_p')}` }, 'c');
    // scenario 2: fails before τ → CM
    const seg2 = line(g, X0, Y2, XF, Y2, { stroke: 'var(--red)', w: 7 });
    const x2 = s('g', {}, g);
    cross(x2, XF, Y2, 15, { w: 7 });
    svgText(x2, XF + 28, Y2 - 42, 'CM', { size: 30, anchor: 'start', fill: 'var(--red)' });
    const ghost = path(g, '', { stroke: 'var(--mute)', w: 4, dash: '10 10' });
    const chipF = box(root, (X0 + XF) / 2 + 6, Y2 - 46, { class: 'tag t-red', html: `τ 前故障的機率 ${tex(tc('red', 'F(\\tau)'))}` }, 'c');
    const chipCc = box(root, XF, Y2 + 52, { class: 'tag t-red', html: `CM 成本 ${tex('C_c')}` }, 'c');
    // cards
    const mk = (y, src, eq, sub, col) => {
      const el = card(root, 1040, y, 620, 0, { pad: 22, style: { borderColor: col } });
      el.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:20px"><div>${TX(src, 44)}</div>
        <div style="text-align:right"><span class="tag t-gray">${eq}</span><div class="small" style="margin-top:6px">${sub}</div></div></div>`;
      return el;
    };
    const cardA = mk(205, tc('teal', 'R(\\tau)') + '\\cdot C_p', '式 (3.1)', 'PM 的期望成本', 'var(--teal)');
    const cardB = mk(445, tc('red', 'F(\\tau)') + '\\cdot C_c', '式 (3.2)', 'CM 的期望成本', 'var(--red)');
    const plus = svgText(g, 1350, 390, '＋', { size: 54 });
    const br = braceV(g, 1690, 205, 575, 44);
    const arr = arrow(g, 1748, 392, 1690, 652, { bend: -70, w: 4, head: 16 });
    const comb = card(root, 1115, 660, 1170, 0, { anchor: 'tc', pad: 22, style: { borderColor: 'var(--ink)' } });
    comb.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;gap:20px">
      <span class="h3">每輪期望成本</span>${TX('=' + tc('red', 'F(\\tau)') + '\\,C_c\\;+\\;' + tc('teal', 'R(\\tau)') + '\\,C_p', 42)}</div>
      <div class="small center">（按機率加權的平均）</div>`;
    const note = tagB(root, 1115, 838, '論文假設：更換的停機時間極短，可忽略', 't-gray', 'tc');
    return t => {
      show(hd, t, c.c(0) - .2, .6);
      skel.forEach((e, i) => show(e, t, c.c(0) + i * .25, .6));
      show(lab1, t, c.c(0) + .3, .5); show(lab2, t, c.c(0) + .55, .5);
      draw(seg1, t, c.c(1) + .2, 1.8, { ease: Ease.lin });
      pop(end1, t, c.c(1) + 2.0, .45);
      show(chipR, t, c.c(1) + 2.4, .5);
      show(chipCp, t, c.c(1) + 3.9, .5);
      show(cardA, t, c.c(1) + 4.9, .6, { dx: -30, dy: 0 });
      draw(seg2, t, c.c(2) + .2, 1.2, { ease: Ease.lin });
      pop(x2, t, c.c(2) + 1.4, .4);
      seg(ghost, XF, Y2, XT, Y2, Ease.out(P(t, c.c(2) + 1.8, .6)));
      show(chipF, t, c.c(2) + 2.5, .5);
      show(chipCc, t, c.c(2) + 4.0, .5);
      show(cardB, t, c.c(2) + 5.0, .6, { dx: -30, dy: 0 });
      pop(plus, t, c.c(3) + .3, .4);
      draw(br, t, c.c(3) + .6, .6);
      arr.anim(t, c.c(3) + 1.1, .6);
      show(comb, t, c.c(3) + 1.6, .7);
      show(note, t, c.c(3) + 7.8, .6);
    };
  });

  // ================================================================== costrate
  scene('costrate', (root, c) => {
    const hd = heading(root, '每輪長度不同 → 改看「每天」的平均成本');
    const g = svgLayer(root);
    // c0: three cycles of different length (illustrative)
    const top = s('g', {}, g);
    const U = 420, CY = 285;
    let x = 200;
    const first = line(top, 200, CY - 18, 200, CY + 18, { stroke: 'var(--blue)', w: 5 });
    const cyc = [1, .55, 1].map(f => {
      const x0 = x, x1 = x + U * f; x = x1;
      const pm = f === 1, col = pm ? 'var(--teal)' : 'var(--red)';
      const sg = line(top, x0, CY, x1, CY, { stroke: col, w: 7 });
      const end = s('g', {}, top);
      if (pm) line(end, x1, CY - 18, x1, CY + 18, { stroke: 'var(--teal)', w: 5 }); else cross(end, x1, CY, 13, { w: 6 });
      const dm = s('g', {}, top);
      path(dm, `M${x0 + 6} ${CY - 26} V${CY - 36} H${x1 - 6} V${CY - 26}`, { stroke: 'var(--mute)', w: 2.5 });
      mt(dm, (x0 + x1) / 2, CY - 60, pm ? 'τ' : '0.55τ', { size: 30 });
      svgText(dm, (x0 + x1) / 2, CY + 42, pm ? '撐到 τ' : '提早故障', { size: 24, fill: col });
      return { sg, end, dm, d: pm ? 1 : .6 };
    });
    const dots = svgText(top, x + 40, CY, '⋯', { size: 40, fill: 'var(--mute)' });
    const shi = box(root, x + 90, CY, { html: SHI }, 'cl');
    // c1: R(t) chart with MUT area
    const ch = chart(g, 260, 450, 660, 330, { xmin: 0, xmax: 800, ymin: 0, ymax: 1, xticks: [0, 200, 400, 600, 800], yticks: [0, .5, 1], xlabel: 't（天）', ylabel: '可靠度 R(t)' });
    const n8 = D().t.findIndex(v => v > 800);
    const ts = D().t.slice(0, n8), rs = D().rel.slice(0, n8);
    const TAU = 256.85, RT = Math.exp(-Math.pow(TAU / WA, WB));
    let ad = `M${ch.X(0)} ${ch.Y(0)}`;
    for (let i = 0; i < ts.length && ts[i] <= TAU; i++) ad += ` L${ch.X(ts[i]).toFixed(1)} ${ch.Y(rs[i]).toFixed(1)}`;
    ad += ` L${ch.X(TAU).toFixed(1)} ${ch.Y(RT).toFixed(1)} L${ch.X(TAU).toFixed(1)} ${ch.Y(0)} Z`;
    const defs = s('defs', {}, g);
    const cp = s('clipPath', { id: 'bth-mutclip' }, defs);
    const cr = s('rect', { x: ch.X(0), y: 400, width: 0, height: 420 }, cp);
    const area = path(g, ad, { fill: 'var(--teal-soft)', stroke: 'none', w: 0, attrs: { 'clip-path': 'url(#bth-mutclip)' } });
    const rc = ch.plot(ts, rs, { color: 'var(--teal)', w: 5 });
    const vl = ch.vline(TAU, { color: 'var(--ink)' });
    const vlab = svgMix(g, ch.X(TAU), 428, [['τ', 1], [' = 257', 0]], { size: 26 });
    const alab = box(root, (ch.X(0) + ch.X(TAU)) / 2, ch.Y(.42), { html: TX('\\int_0^{\\tau}\\!R(t)\\,dt', 30), style: { color: '#0b7a6b' } }, 'c');
    const kc = card(root, 1000, 450, 780, 0, { pad: 26, style: { borderColor: 'var(--teal)' } });
    const L1 = h('div', { html: `<span class="h3">平均運轉時間 <span class="en">MUT</span></span> <span class="small en">Mean Up Time · 式 (3.3)</span>` }, kc);
    const L2 = h('div', { class: 'body', html: `＝ R(t) 從 0 到 τ 底下的<b style="color:#0b7a6b">面積</b>`, style: { marginTop: '8px' } }, kc);
    const L3 = h('div', { class: 'body', html: `＝ 每輪的平均長度 ${TX('E[\\min(T,\\tau)]', 30)}` }, kc);
    const L4 = h('div', { class: 'body', html: `τ = 257 天時，MUT ≈ <b>242 天</b> ${RECALC}`, style: { marginTop: '4px' } }, kc);
    // c2: main formula (3.4)
    const fk = card(root, 960, 176, 1540, 0, { anchor: 'tc', pad: 20 });
    fk.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:30px">
      <div>${TX('E[C_{ave}(\\tau)]=\\dfrac{' + tc('red', 'F(\\tau)\\cdot C_c') + '+' + tc('teal', 'R(\\tau)\\cdot C_p') + '}{' + tc('mute', '\\int_0^{\\tau}R(t)\\,dt') + '}', 40)}</div>
      <div style="text-align:right">
        <div><span class="tag t-blue">更新報酬定理</span></div>
        <div class="body fk2" style="margin-top:8px"><b>每輪期望成本</b> ÷ <b style="color:var(--mute)">每輪平均長度</b></div>
        <div class="fk3" style="margin-top:8px"><span class="tag t-gray">式 (3.4)</span> <span class="tag t-gray">單位：元／天</span></div>
      </div></div>`;
    const fk2 = fk.querySelector('.fk2'), fk3 = fk.querySelector('.fk3');
    return t => {
      show(hd, t, c.c(0) - .2, .6);
      const outTop = c.c(2) - .4;
      opacity(top, 1 - P(t, outTop, .5));
      opacity(first, P(t, c.c(0) + .2, .3));
      cyc.forEach((o, i) => {
        const a = c.c(0) + .4 + i * 1.5;
        draw(o.sg, t, a, o.d, { ease: Ease.lin });
        pop(o.end, t, a + o.d, .35);
        show(o.dm, t, a + .3, .5);
      });
      opacity(dots, P(t, c.c(0) + 4.6, .4));
      show(shi, t, c.c(0) + 4.8, .4, { out: outTop });
      ch.anim(t, c.c(1) + .2, .7);
      draw(rc, t, c.c(1) + .6, 1.2);
      show(L1, t, c.c(1) + 2.2, .5);
      opacity(vl, P(t, c.c(1) + 4.0, .4)); opacity(vlab, P(t, c.c(1) + 4.0, .4));
      cr.setAttribute('width', (ch.X(TAU) - ch.X(0) + 2) * Ease.inOut(P(t, c.c(1) + 4.3, 1.4)));
      opacity(area, P(t, c.c(1) + 4.3, .1));
      show(L2, t, c.c(1) + 4.6, .5);
      show(alab, t, c.c(1) + 5.5, .5);
      show(L3, t, c.c(1) + 6.3, .5);
      show(L4, t, c.c(1) + 7.4, .5);
      show(kc, t, c.c(1) + 2.0, .5);
      show(fk, t, c.c(2) + .1, .7);
      show(fk2, t, c.c(2) + 4.5, .5);
      show(fk3, t, c.c(2) + 7.5, .5);
    };
  });

  // ================================================================== tradeoff
  scene('tradeoff', (root, c) => {
    const hd = heading(root, '成本曲線：兩種浪費之間的谷底');
    const g = svgLayer(root);
    const defs = s('defs', {}, g);
    const hatch = (id, col, bg) => {
      const p = s('pattern', { id, width: 18, height: 18, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      s('rect', { width: 18, height: 18, fill: bg }, p); s('rect', { x: 0, y: 0, width: 5, height: 18, fill: col }, p);
      return `url(#${id})`;
    };
    const hT = hatch('bth-hatch-t', 'rgba(15,157,138,.32)', 'rgba(15,157,138,.05)');
    const hR = hatch('bth-hatch-r', 'rgba(217,65,46,.28)', 'rgba(217,65,46,.04)');
    const CX = 270, CYt = 230, CW = 1180, CH = 540;
    const ch = chart(g, CX, CYt, CW, CH, { xmin: 0, xmax: 1000, ymin: 0, ymax: 60000, xticks: [0, 200, 400, 600, 800, 1000], yticks: [0, 20000, 40000, 60000], fy: v => fmt(v), xlabel: '保養年齡 τ（天）', ylabel: '平均維修成本 E[Cave(τ)]（元／天）' });
    const zT = s('rect', { x: ch.X(0), y: CYt, width: ch.X(150) - ch.X(0), height: CH, fill: hT }, g);
    const zR = s('rect', { x: ch.X(400), y: CYt, width: ch.X(1000) - ch.X(400), height: CH, fill: hR }, g);
    const curve = ch.plot(D().t, D().cost_expected, { color: 'var(--blue)', w: 6 });
    const lab = (x, y, html, col, anchor) => { const e = box(root, x, y, { html }, anchor); Object.assign(e.style, { background: 'var(--card)', border: `2.5px solid ${col}`, borderRadius: '14px', padding: '8px 18px', fontSize: '26px', lineHeight: 1.4, whiteSpace: 'nowrap' }); return e; };
    const lT = lab(ch.X(150) + 22, 250, `<b style="color:var(--teal)">τ 太短</b>：保養太頻繁<br>健康的零件也被換掉`, 'var(--teal)', 'tl');
    const lR = lab(ch.X(1000) - 24, 250, `<b style="color:var(--red)">τ 太長</b>：常在半路故障<br>一直付昂貴的 CM`, 'var(--red)', 'tl');
    setAnchor(lR, 'translateX(-100%) ');
    const cals = [0, 1, 2].map(i => Icons.calendar(g, 286 + i * 50, 688, .32));
    const xs = [600, 740, 880].map(v => cross(g, ch.X(v), 708, 14, { w: 6 }));
    const vl = ch.vline(256.85, { color: 'var(--blue)', top: ch.Y(16922.9) - CYt });
    const dot = ch.dot(256.85, 16922.9, { r: 13, color: 'var(--blue)', stroke: 'var(--card)' });
    const dl = svgText(g, ch.X(256.85), ch.Y(16922.9) - 46, 'τ*', { size: 38, fill: 'var(--blue)' });
    const dl2 = nt(g, ch.X(256.85), CYt + CH + 30, '257', { size: 22, fill: 'var(--blue)', weight: 800 });
    const bal = balanceIcon(g, ch.X(256.85), 390, .9, { labels: ['PM', 'CM'], cols: ['var(--teal)', 'var(--red)'], fills: ['var(--teal-soft)', 'var(--red-soft)'] });
    const dl3 = svgText(g, ch.X(256.85) + 22, ch.Y(16922.9) + 46, '最低 ≈ 16,923 元／天', { size: 24, anchor: 'start', fill: 'var(--blue)' });
    const bl = box(root, ch.X(256.85) + 200, 370, { class: 'body', html: '在兩種浪費之間<br>取得平衡', style: { lineHeight: 1.35, color: 'var(--blue)', fontWeight: 700 } }, 'cl');
    return t => {
      show(hd, t, c.c(0) - .2, .6);
      ch.anim(t, c.c(0), .7);
      draw(curve, t, c.c(0) + .5, 1.5);
      const outZ = c.c(3) + .1;
      opacity(zT, P(t, c.c(1) + .2, .5) * (1 - P(t, outZ, .6)));
      show(lT, t, c.c(1) + .6, .5, { out: outZ });
      cals.forEach((e, i) => pop(e, t, c.c(1) + 1.4 + i * .35, .4, { out: outZ }));
      opacity(zR, P(t, c.c(2) + .2, .5) * (1 - P(t, outZ, .6)));
      show(lR, t, c.c(2) + .6, .5, { out: outZ });
      xs.forEach((e, i) => pop(e, t, c.c(2) + 1.6 + i * .35, .4, { out: outZ }));
      opacity(vl, P(t, c.c(3) + .5, .4));
      pop(dot, t, c.c(3) + .3, .5);
      show(dl, t, c.c(3) + .6, .5);
      opacity(dl2, P(t, c.c(3) + .7, .4));
      show(bal, t, c.c(3) + 1.4, .6);
      bal.tilt(-16 * Math.exp(-2.2 * Math.max(0, t - c.c(3) - 1.8)) * Math.cos(Math.max(0, t - c.c(3) - 1.8) * 5));
      show(bl, t, c.c(3) + 2.2, .6);
      show(dl3, t, c.c(3) + .9, .5);
    };
  });

  // ================================================================== optcond
  scene('optcond', (root, c) => {
    const hd = heading(root, '最佳條件：對 τ 微分、令它等於 0');
    const A = layer(root), g = svgLayer(A);
    const k35 = card(A, 150, 195, 1000, 0, { pad: 24 });
    k35.innerHTML = `<div class="small">令 ${TX('\\frac{d}{d\\tau}E[C_{ave}(\\tau)]=0', 24)}，整理得</div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:6px">${TX(tc('red', '\\lambda(\\tau)') + '\\cdot\\int_0^{\\tau}R(t)\\,dt\\;-\\;F(\\tau)', 40)}${TX('=', 40)}
      <span class="rhs" style="padding:2px 12px;border-radius:12px">${TX('\\dfrac{C_p}{C_c-C_p}', 40)}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
      <span class="small" style="color:var(--red);font-weight:700">λ(τ)：失效率</span><span class="tag t-gray">式 (3.5)</span></div>`;
    const rhs = k35.querySelector('.rhs');
    k35.style.transformOrigin = '0 0';
    const kr = card(A, 1200, 195, 580, 0, { pad: 24, style: { borderColor: COL.orange } });
    kr.innerHTML = `<div class="body"><b>右邊只跟成本有關</b></div>
      <div style="margin-top:6px">${TX('\\dfrac{C_p}{C_c-C_p}=\\dfrac{2{,}755{,}500}{6{,}450{,}000}', 32)}</div>
      <div class="h3" style="margin-top:4px">≈ <span class="hl">0.427</span></div>`;
    // g(τ) chart
    const T = D().t, I = cumInt(T, D().rel);
    const gx = [], gy = [];
    for (let i = 0; i < T.length && T[i] <= 500; i++) { gx.push(T[i]); gy.push(D().haz[i] * I[i] - D().cdf[i]); }
    const ch = chart(g, 270, 545, 760, 250, { xmin: 0, xmax: 500, ymin: 0, ymax: 1.2, xticks: [0, 100, 200, 300, 400, 500], yticks: [0, .5, 1], xlabel: 'τ（天）', ylabel: '左式 g(τ) = λ(τ)∫R − F(τ)' });
    const gc = ch.plot(gx, gy, { color: 'var(--ink)', w: 5 });
    const hl = ch.hline(.42721, { color: COL.orange, w: 3 });
    const hlab = nt(g, 270 + 760 + 14, ch.Y(.42721), '0.427', { size: 24, fill: COL.orange, anchor: 'start', weight: 800 });
    const vl = ch.vline(256.85, { color: 'var(--blue)', top: ch.Y(.42721) - 545 });
    const dot = ch.dot(256.85, .42721, { r: 11, color: 'var(--blue)', stroke: 'var(--card)' });
    const dlab = svgText(g, ch.X(256.85) - 16, ch.Y(.42721) - 34, 'τ* ≈ 257 天', { size: 28, fill: 'var(--blue)', anchor: 'end' });
    const k36 = card(A, 1200, 480, 580, 0, { pad: 24, style: { borderColor: 'var(--blue)' } });
    k36.innerHTML = `<div>${TX('E[C_{ave}(\\tau^*)]=(C_c-C_p)\\cdot' + tc('red', '\\lambda(\\tau^*)'), 31)}</div>
      <div class="body k2" style="margin-top:10px">＝ 6,450,000 × <span style="color:var(--red);font-weight:700">0.0026237</span> ${RECALC}</div>
      <div class="k3" style="display:flex;justify-content:space-between;align-items:center;margin-top:6px"><span class="h3">≈ <span class="hl">16,923</span> 元／天</span><span class="tag t-gray">式 (3.6)</span></div>`;
    const k2 = k36.querySelector('.k2'), k3 = k36.querySelector('.k3');
    // c3: second-order condition
    const B = layer(root), gb = svgLayer(B);
    const k37 = card(B, 960, 190, 1300, 0, { anchor: 'tc', pad: 24 });
    k37.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;gap:24px">${TX('\\dfrac{d^2}{d\\tau^2}E[C_{ave}(\\tau)]=' + tc('red', "\\lambda'(\\tau)") + '\\cdot\\int_0^{\\tau}R(t)\\,dt\\;\\ge\\;0', 38)}
      <div style="text-align:right"><span class="tag t-gray">式 (3.7)</span><div class="small">論文寫法</div></div></div>
      <div style="display:flex;gap:16px;justify-content:center;margin-top:12px">
        <span class="tag t-red c1">λ′(τ) &gt; 0：失效率上升</span><span class="tag t-gray c2">且 C<sub>c</sub> &gt; C<sub>p</sub></span><span class="tag t-green c3">⇒ 是最小值</span></div>`;
    const q1 = k37.querySelector('.c1'), q2 = k37.querySelector('.c2'), q3 = k37.querySelector('.c3');
    const mkMini = (x0, key) => {
      const grp = s('g', {}, gb);
      const m = chart(grp, x0, 505, 560, 250, { xmin: 0, xmax: 600, ymin: 0, ymax: .012, xticks: [0, 200, 400, 600], yticks: [], xlabel: 't（天）', ylabel: 'λ(t) 失效率' });
      const n6 = D().t.findIndex(v => v > 600);
      const ys = key ? D().shapes[key].haz : D().haz;
      const pth = m.plot(D().t.slice(0, n6), ys.slice(0, n6), { color: 'var(--red)', w: 5 });
      grp.appendChild(pth);
      return { grp, m, pth };
    };
    const mL = mkMini(260, null), mR = mkMini(1090, '1.0');
    const cL = box(B, 285, 520, { html: '<b style="color:var(--green)">✓ 會老化 → 有最佳 τ*</b>', style: { fontSize: '28px' } });
    const bL = svgText(gb, 260 + 560 - 4, 715, 'β = 2.88（案例）', { size: 24, anchor: 'end', fill: 'var(--red)' });
    const cR = box(B, 1115, 520, { html: `<b style="color:var(--red)">✗ 不老化 → 預防更換沒好處</b> ${SHI}`, style: { fontSize: '28px' } });
    const bR = svgText(gb, 1090 + 560 - 6, mR.m.Y(.00235) - 24, 'β = 1：失效率不變', { size: 24, anchor: 'end', fill: 'var(--red)' });
    return t => {
      show(hd, t, c.c(0) - .2, .6);
      opacity(A, 1 - P(t, c.c(3) - .1, .5));
      const mv = Ease.inOut(P(t, c.c(1) - .1, .9));
      show(k35, t, c.c(0) + .2, .7, { extra: ` translate(${lerp(155, 0, mv)}px,${lerp(150, 0, mv)}px) scale(${lerp(1.3, 1, mv)})` });
      rhs.style.background = `rgba(244,197,66,${(.45 * P(t, c.c(1) + .2, .5)).toFixed(3)})`;
      show(kr, t, c.c(1) + .6, .6, { dx: 30, dy: 0 });
      ch.anim(t, c.c(1) + 2.0, .7);
      draw(gc, t, c.c(1) + 2.6, 1.4);
      opacity(hl, P(t, c.c(1) + 3.8, .4)); opacity(hlab, P(t, c.c(1) + 3.8, .4));
      opacity(vl, P(t, c.c(1) + 4.6, .3));
      pop(dot, t, c.c(1) + 4.6, .45);
      show(dlab, t, c.c(1) + 4.9, .5);
      show(k36, t, c.c(2) + .3, .6);
      show(k2, t, c.c(2) + 2.2, .5);
      show(k3, t, c.c(2) + 3.6, .5);
      show(k37, t, c.c(3) + .4, .7);
      show(q1, t, c.c(3) + 3.0, .5, { dy: 10 });
      show(q2, t, c.c(3) + 4.2, .5, { dy: 10 });
      show(q3, t, c.c(3) + 5.0, .5, { dy: 10 });
      mL.m.anim(t, c.c(3) + 5.6, .6); draw(mL.pth, t, c.c(3) + 6.0, 1.0);
      show(cL, t, c.c(3) + 6.6, .5); opacity(bL, P(t, c.c(3) + 6.4, .4));
      mR.m.anim(t, c.c(3) + 7.4, .6); draw(mR.pth, t, c.c(3) + 7.8, .8);
      show(cR, t, c.c(3) + 8.3, .5); opacity(bR, P(t, c.c(3) + 8.1, .4));
    };
  });

  // ================================================================== attitudes
  scene('attitudes', (root, c) => {
    const A = layer(root), gA = svgLayer(A);
    const top = card(A, 960, 330, 1180, 0, { anchor: 'tc', pad: 30, style: { borderColor: 'var(--blue)' } });
    top.style.transformOrigin = '50% 0';
    top.innerHTML = `<div style="display:flex;align-items:center;gap:34px"><div class="bal"></div><div>
      <div class="h2" style="color:var(--blue)">預期維修決策</div>
      <div class="body" style="color:var(--mute)">前一章的模型：只讓期望成本 E[C<sub>ave</sub>(τ)] 最小</div>
      <div class="tg" style="display:flex;gap:14px;margin-top:14px"></div></div></div>`;
    const bsv = miniSvg(top.querySelector('.bal'), 230, 170);
    balanceIcon(bsv, 115, 95, .62, { fills: ['var(--blue-soft)', 'var(--blue-soft)'] });
    const tags = ['只看期望成本', '理性', '風險中性'].map(tx => h('span', { class: 'tag t-blue', text: tx, style: { fontSize: '30px' } }, top.querySelector('.tg')));
    // options A / B
    const coin = (sv, cx, cy, txt) => {
      const grp = s('g', {}, sv);
      s('circle', { cx, cy, r: 56, fill: '#f6d36b', stroke: 'var(--ink)', 'stroke-width': 4 }, grp);
      s('circle', { cx, cy, r: 44, fill: 'none', stroke: '#c99a1c', 'stroke-width': 2.5 }, grp);
      grp.txt = svgText(grp, cx, cy + 2, txt, { size: 34, fill: '#6b4e00' });
      return grp;
    };
    const optA = card(A, 240, 330, 520, 0, { pad: 26 });
    optA.innerHTML = `<div style="display:flex;align-items:center;gap:26px"><div class="cv"></div><div>
      <div class="h3"><span class="pill" style="font-size:28px;padding:2px 16px">A</span> 確定拿</div><div class="h2">50 元</div></div></div>`;
    coin(miniSvg(optA.querySelector('.cv'), 130, 130), 65, 65, '50');
    const optB = card(A, 1160, 330, 520, 0, { pad: 26 });
    optB.innerHTML = `<div style="display:flex;align-items:center;gap:26px"><div class="cv"></div><div>
      <div class="h3"><span class="pill" style="font-size:28px;padding:2px 16px">B</span> 擲硬幣</div>
      <div class="body">正面 <b>100 元</b><br>反面 <b>0 元</b></div></div></div>`;
    const flip = coin(miniSvg(optB.querySelector('.cv'), 130, 130), 65, 65, '正');
    const shi = box(A, 240, 300, { html: SHI }, 'tl');
    const orr = box(A, 960, 430, { class: 'h2', text: '或', style: { color: 'var(--mute)' } }, 'c');
    const badge = box(A, 960, 430, { class: 'h3 center', html: '期望值都是<br><span class="hl">50 元</span>' }, 'c');
    Object.assign(badge.style, { background: 'var(--card)', border: '3px solid var(--ink)', borderRadius: '18px', padding: '10px 22px', lineHeight: 1.3 });
    // persons
    const ppl = [
      { x: 500, col: 'var(--purple)', soft: 'var(--purple-soft)', txt: '<b style="color:var(--purple)">風險規避</b>：選確定的 A' },
      { x: 960, col: 'var(--blue)', soft: 'var(--blue-soft)', txt: '<b style="color:var(--blue)">風險中性</b>：覺得一樣好' },
      { x: 1420, col: 'var(--orange)', soft: 'var(--orange-soft)', txt: '<b style="color:#b5650a">風險尋求</b>：選賭一把的 B' },
    ].map(o => ({ ...o, ic: Icons.person(gA, o.x, 765, .85, o.col, o.soft), lab: box(A, o.x, 815, { class: 'body center', html: o.txt }, 'tc') }));
    ppl[0].ar = arrow(gA, 500, 676, 500, 548, { stroke: 'var(--purple)', w: 5 });
    ppl[2].ar = arrow(gA, 1420, 676, 1420, 548, { stroke: 'var(--orange)', w: 5 });
    ppl[1].eq = box(A, 960, 650, { class: 'tag t-blue', text: 'A ＝ B', style: { fontSize: '30px' } }, 'c');
    // phase B: maintenance framing
    const B = layer(root), gB = svgLayer(B);
    const tb = turbine(gB, 330, 830, 430);
    const ax = arrow(gB, 640, 610, 1730, 610, { w: 4, head: 16 });
    const axl = svgText(gB, 1730, 650, '保養時間', { size: 26, anchor: 'end', fill: 'var(--mute)' });
    const dot = s('circle', { cx: 1180, cy: 610, r: 14, fill: 'var(--blue)', stroke: 'var(--card)', 'stroke-width': 3 }, gB);
    const dl = box(B, 1180, 640, { class: 'center', html: '<b style="color:var(--blue);font-size:30px">τ* = 257 天</b><br><span class="small">期望成本最低</span>' }, 'tc');
    const pS = Icons.person(gB, 1480, 470, 1, 'var(--orange)', 'var(--orange-soft)');
    const pA = Icons.person(gB, 880, 470, 1, 'var(--purple)', 'var(--purple-soft)');
    const bS = bubble(B, 1480, 250, '再撐一下沒事', 'var(--orange)');
    const bA = bubble(B, 880, 250, '早點換才安心', 'var(--purple)');
    const lS = svgText(gB, 1480, 535, '風險尋求', { size: 26, fill: '#b5650a' });
    const lA = svgText(gB, 880, 535, '風險規避', { size: 26, fill: 'var(--purple)' });
    const aS = arrow(gB, 1210, 745, 1450, 745, { stroke: 'var(--orange)', w: 6 });
    const aA = arrow(gB, 1150, 745, 910, 745, { stroke: 'var(--purple)', w: 6 });
    const tS = svgText(gB, 1330, 790, '延後', { size: 30, fill: '#b5650a' });
    const tA = svgText(gB, 1030, 790, '提前', { size: 30, fill: 'var(--purple)' });
    const shi2 = box(B, 1475, 745, { html: SHI }, 'cl');
    return t => {
      const mv = Ease.inOut(P(t, c.c(1) - .2, .9));
      show(top, t, c.c(0), .7, { extra: ` translate(0px,${lerp(-40, 112 - 330, mv)}px) scale(${lerp(1.22, .62, mv)})` });
      [1.2, 5.2, 6.2].forEach((d, i) => pop(tags[i], t, c.c(0) + d, .45));
      show(shi, t, c.c(1) + .5, .4);
      show(optA, t, c.c(1) + .6, .6);
      show(orr, t, c.c(1) + 1.6, .4, { out: c.c(2) - .1, outD: .3 });
      show(optB, t, c.c(1) + 2.4, .6);
      const th = Math.max(0, t - c.c(1) - 2.6) * 7;
      const kx = Math.cos(th);
      flip.setAttribute('transform', `translate(65,65) scale(${Math.max(.04, Math.abs(kx)).toFixed(3)},1) translate(-65,-65)`);
      flip.txt.textContent = kx >= 0 ? '正' : '反';
      pop(badge, t, c.c(2) + .2, .5);
      const pt = [4.8, 2.6, 6.8];
      ppl.forEach((o, i) => {
        show(o.ic, t, c.c(2) + pt[i], .5);
        show(o.lab, t, c.c(2) + pt[i] + .2, .5);
        if (o.ar) o.ar.anim(t, c.c(2) + pt[i] + .4, .5);
        if (o.eq) pop(o.eq, t, c.c(2) + pt[i] + .4, .4);
      });
      opacity(A, 1 - P(t, c.c(3) - .2, .5));
      show(tb, t, c.c(3) + .2, .7); tb.spin(t * 40);
      ax.anim(t, c.c(3) + .5, .6); opacity(axl, P(t, c.c(3) + .9, .4));
      pop(dot, t, c.c(3) + .9, .4); show(dl, t, c.c(3) + 1.0, .5);
      show(pS, t, c.c(3) + 1.6, .5); show(lS, t, c.c(3) + 1.7, .5); pop(bS, t, c.c(3) + 2.0, .5); aS.anim(t, c.c(3) + 2.5, .6); show(tS, t, c.c(3) + 2.9, .4);
      show(pA, t, c.c(3) + 3.9, .5); show(lA, t, c.c(3) + 4.0, .5); pop(bA, t, c.c(3) + 4.3, .5); aA.anim(t, c.c(3) + 4.8, .6); show(tA, t, c.c(3) + 5.2, .4);
      show(shi2, t, c.c(3) + 5.4, .4);
    };
  });

  // ================================================================== bounded
  scene('bounded', (root, c) => {
    const hd = heading(root, '理性模型 vs. 真實的人');
    const A = layer(root), gA = svgLayer(A);
    const ax = axes(gA, 250, 240, 440, 270, { xlabel: '金額 x', ylabel: '效用 u(x)' });
    const lin = path(gA, fpath(u => .78 * u, 0, 1, 40, ax.X, ax.Y), { stroke: 'var(--mute)', w: 3, dash: '9 9' });
    const cav = path(gA, fpath(u => .97 * Math.sqrt(u), 0, 1, 80, ax.X, ax.Y), { stroke: 'var(--purple)', w: 6 });
    const lc = svgText(gA, ax.X(1) + 16, ax.Y(.97), '向下彎（凹）＝風險規避', { size: 24, anchor: 'start', fill: 'var(--purple)' });
    const ll = svgText(gA, ax.X(1) + 16, ax.Y(.78), '直線＝風險中性', { size: 24, anchor: 'start', fill: 'var(--mute)' });
    const shi = box(A, 362, 178, { html: SHI }, 'tl');
    const ke = card(A, 1110, 205, 670, 0, { pad: 26 });
    ke.innerHTML = `<div class="h3">期望效用理論 <span class="en">EUT</span></div>
      <div class="body e1">錢 → 「效用」（滿足感）</div>
      <div class="e2" style="margin-top:6px">${TX('EU=\\sum_i ' + tc('blue', 'p_i') + '\\cdot u(x_i)', 36)}</div>
      <div class="body e3">機率 <i>p</i><sub>i</sub>：<span class="hl">照原值計算</span>（客觀）</div>`;
    const e1 = ke.querySelector('.e1'), e2 = ke.querySelector('.e2'), e3 = ke.querySelector('.e3');
    // c1 row
    const kp = card(A, 170, 640, 380, 0, { pad: 22 });
    kp.innerHTML = '<div class="h3">理性模型的預測</div><div class="body" style="color:var(--mute)">選期望值最好的</div>';
    const ka = card(A, 680, 640, 380, 0, { pad: 22 });
    ka.innerHTML = '<div class="h3">人實際的選擇</div><div class="body" style="color:var(--mute)">常常不一樣</div>';
    const neq = svgText(gA, 615, 700, '≠', { size: 80, fill: 'var(--red)', weight: 900 });
    const kb = card(A, 1130, 600, 650, 0, { pad: 24, style: { borderColor: 'var(--purple)' } });
    kb.innerHTML = `<div class="h3" style="color:var(--purple)">有限理性 <span class="en" style="font-size:26px;color:var(--mute)">limited rationality</span></div>
      <div class="body">偏離來自人的主觀感知：</div>
      <div class="body">・對<b>機率</b>的主觀感知</div><div class="body">・對<b>後果（得失）</b>的主觀感受</div>`;
    // phase B: literature + gap
    const B = layer(root), gB = svgLayer(B);
    const ttl = box(B, 150, 108, { class: 'h2', html: '論文 Table 2.1：14 篇維修政策文獻<span class="en" style="font-size:36px;color:var(--mute)">（2000–2023）</span>' });
    const lit = [['Crocker', 2000, 0], ['Regattieri', 2015, 0], ['Lim', 2016, 0], ['Cai', 2017, 0], ['Safaei', 2018, 2], ['Badía', 2018, 0], ['Duan', 2019, 1],
      ['Liu', 2019, 0], ['Lee', 2019, 0], ['Rebaiaia', 2021, 0], ['Zhang', 2020, 0], ['Okoro', 2022, 0], ['Aafif', 2022, 0], ['Zhang', 2023, 0]];
    const fills = ['var(--blue-soft)', 'var(--teal-soft)', '#ebe5d8'];
    const docs = lit.map(([nm, yr, k], i) => {
      const r = Math.floor(i / 7), cI = i % 7, x = 345 + cI * 205, y = 225 + r * 190;
      const grp = docIcon(gB, x, y, 100, 122, fills[k]);
      nt(grp, x + 50, y + 96, String(yr), { size: 22, fill: 'var(--ink)', weight: 800 });
      nt(grp, x + 50, y + 146, nm, { size: 21 });
      return grp;
    });
    const leg = box(B, 960, 598, {
      html: `<span class="tag" style="background:var(--blue-soft);color:var(--blue)">成本最小化 12 篇</span>
      <span class="tag t-teal" style="margin-left:12px">成本＋可用度 1 篇</span>
      <span class="tag t-gray" style="margin-left:12px">可用度最大化 1 篇</span>`,
    }, 'tc');
    const stamp = box(B, 960, 395, { html: '假設完全理性<div style="font-size:24px;font-weight:700;margin-top:2px">論文：多數研究的前提</div>' }, 'c');
    Object.assign(stamp.style, { color: 'var(--red)', border: '6px solid var(--red)', borderRadius: '16px', padding: '8px 34px', fontSize: '66px', fontWeight: 900, background: 'rgba(255,253,248,.88)', textAlign: 'center', lineHeight: 1.15, fontFamily: "'LXGW WenKai TC', serif" });
    const fr = card(B, 960, 652, 1300, 222, { anchor: 'tc', pad: 0, style: { borderColor: 'var(--green)', borderStyle: 'dashed', background: 'rgba(217,242,223,.35)', boxShadow: 'none' } });
    const tb = turbine(gB, 410, 862, 118);
    const q = svgText(gB, 480, 700, '？', { size: 64, fill: 'var(--red)' });
    q.style.fontFamily = "'LXGW WenKai TC', serif";
    const g1 = box(B, 560, 690, { class: 'h3', text: '風電領域：風險態度？' }, 'cl');
    const g2 = box(B, 560, 755, { class: 'body', html: '文獻幾乎只做成本最小化；只有 <span class="en">Zhong et al. (2018)</span> 簡短提及' }, 'cl');
    const g3 = box(B, 560, 820, { class: 'tag t-green', text: '→ 本研究要補的缺口', style: { fontSize: '30px' } }, 'cl');
    return t => {
      show(hd, t, c.c(0) - .2, .6, { out: c.c(2) - .3, outD: .4 });
      opacity(A, 1 - P(t, c.c(2) - .3, .5));
      ax.anim(t, c.c(0) + .3, .7);
      opacity(lin, P(t, c.c(0) + 1.0, .6));
      draw(cav, t, c.c(0) + 1.6, 1.2);
      opacity(ll, P(t, c.c(0) + 1.6, .4));
      show(lc, t, c.c(0) + 4.6, .5);
      show(shi, t, c.c(0) + 1.0, .4);
      show(ke, t, c.c(0) + .5, .6);
      show(e1, t, c.c(0) + 1.8, .5);
      show(e2, t, c.c(0) + 3.0, .5);
      show(e3, t, c.c(0) + 7.6, .5);
      show(kp, t, c.c(1) + .3, .5);
      show(ka, t, c.c(1) + 1.2, .5);
      pop(neq, t, c.c(1) + 1.9, .45);
      show(kb, t, c.c(1) + 3.2, .6);
      show(ttl, t, c.c(2) + .15, .5);
      docs.forEach((d, i) => show(d, t, c.c(2) + .3 + i * .07, .4, { dy: 18 }));
      show(leg, t, c.c(2) + 1.5, .5);
      pop(stamp, t, c.c(2) + 3.0, .5, { extra: ' rotate(-7deg)' });
      show(fr, t, c.c(3) + .1, .6);
      show(tb, t, c.c(3) + .3, .6); tb.spin(t * 50);
      pop(q, t, c.c(3) + .7, .4);
      show(g1, t, c.c(3) + .6, .5);
      show(g2, t, c.c(3) + 1.6, .5);
      pop(g3, t, c.c(3) + 3.4, .5);
    };
  });

  // ================================================================== prospect
  scene('prospect', (root, c) => {
    const g = svgLayer(root);
    const k79 = card(root, 150, 140, 840, 0, { pad: 26 });
    k79.style.transformOrigin = '0 0';
    k79.innerHTML = `<div class="h2">展望理論 <span class="en" style="font-size:34px;color:var(--mute)">Prospect Theory</span></div>
      <div class="en" style="font-size:28px;font-weight:700">Kahneman &amp; Tversky（1979）</div>
      <div class="kt" style="margin-top:12px"><span class="tag t-blue" style="font-size:26px">描述人「實際」怎麼選，而不是「應該」怎麼選</span></div>`;
    const kt = k79.querySelector('.kt');
    const k92 = card(root, 1090, 140, 690, 0, { pad: 26, style: { borderColor: 'var(--blue)' } });
    k92.innerHTML = `<div class="h2">累積展望理論 <span class="en">CPT</span></div>
      <div class="en" style="font-size:28px;font-weight:700">Tversky &amp; Kahneman（1992）</div>
      <div style="margin-top:12px"><span class="tag t-green" style="font-size:26px">1979 版的改良</span></div>`;
    const ar = arrow(g, 1000, 250, 1078, 250, { w: 5 });
    // c1: reference point
    const M = layer(root), gm = svgLayer(M);
    const NY = 480;
    const bandL = s('rect', { x: 260, y: NY - 18, width: 700, height: 36, fill: 'var(--red-soft)' }, gm);
    const bandR = s('rect', { x: 960, y: NY - 18, width: 700, height: 36, fill: 'var(--green-soft)' }, gm);
    const nl = s('g', {}, gm);
    line(nl, 250, NY, 1670, NY, { w: 4 });
    path(nl, `M262 ${NY - 12} L248 ${NY} L262 ${NY + 12} M1658 ${NY - 12} L1672 ${NY} L1658 ${NY + 12}`, { w: 4 });
    const flag = s('g', {}, gm);
    line(flag, 960, NY + 22, 960, NY - 78, { w: 5 });
    path(flag, `M960 ${NY - 78} L1012 ${NY - 62} L960 ${NY - 46} Z`, { fill: 'var(--yellow)', w: 3 });
    svgText(flag, 1024, NY - 62, '參考點', { size: 30, anchor: 'start' });
    const tL = svgText(gm, 610, NY + 50, '← 損失', { size: 30, fill: 'var(--red)' });
    const tR = svgText(gm, 1310, NY + 50, '獲利 →', { size: 30, fill: 'var(--green)' });
    // example (illustrative)
    const exHead = box(M, 960, 575, { class: 'body center', html: `同樣月薪 <b>5 萬</b>，感受卻相反 ${SHI}` }, 'tc');
    const ex = [[620, 6, 'red', '期待 6 萬 → 覺得「賠」1 萬'], [1300, 4, 'green', '期待 4 萬 → 覺得「賺」1 萬']].map(([cx, ref, col, txt]) => {
      const grp = s('g', {}, gm), y = 690, sc = 110;
      const X = v => cx + (v - 5) * sc;
      line(grp, cx - 260, y, cx + 260, y, { w: 3, stroke: 'var(--mute)' });
      [3, 4, 5, 6, 7].forEach(v => { line(grp, X(v), y - 7, X(v), y + 7, { w: 2.5, stroke: 'var(--mute)' }); nt(grp, X(v), y + 26, v + '萬', { size: 20 }); });
      line(grp, X(ref), y, X(ref), y - 50, { w: 4 });
      path(grp, `M${X(ref)} ${y - 50} L${X(ref) + 30} ${y - 41} L${X(ref)} ${y - 32} Z`, { fill: 'var(--yellow)', w: 2.5 });
      const a = arrow(grp, X(ref), y - 14, X(5) + (ref > 5 ? 14 : -14), y - 14, { stroke: `var(--${col})`, w: 5, head: 13 });
      s('circle', { cx: X(5), cy: y, r: 10, fill: `var(--${col})` }, grp);
      const lb = box(M, cx, 740, { class: 'body center', html: `<b style="color:var(--${col})">${txt}</b>` }, 'tc');
      return { grp, a, lb };
    });
    const note = card(M, 960, 800, 1180, 0, { anchor: 'tc', pad: 14, style: { borderColor: 'var(--red)' } });
    note.innerHTML = `<div class="body center">本論文：參考點 = 0，維修成本 ${TX('C_p', 28)}、${TX('C_c', 28)} 一律視為 <b style="color:var(--red)">損失</b></div>`;
    // c3: two functions
    const N = layer(root), gn = svgLayer(N);
    const nh = box(N, 960, 400, { class: 'h3 center', text: 'CPT 用兩個函數描述人' }, 'tc');
    const mkBox = (x, title, sub, kind) => {
      const el = card(N, x, 470, 640, 0, { pad: 26 });
      el.innerHTML = `<div style="display:flex;align-items:center;gap:26px"><div class="mv"></div><div><div class="h3">${title}</div><div class="body" style="color:var(--mute)">${sub}</div></div></div>`;
      const sv = miniSvg(el.querySelector('.mv'), 220, 220);
      if (kind === 'v') {
        path(sv, 'M10 110 H210 M110 210 V10', { w: 2.5, stroke: 'var(--mute)' });
        const xs = D().tk_x, vs = D().tk_v;
        let d = ''; xs.forEach((x0, i) => { d += (i ? 'L' : 'M') + (110 + x0 * 95).toFixed(1) + ' ' + (110 - vs[i] * 42).toFixed(1); });
        path(sv, d, { stroke: 'var(--ink)', w: 5 });
      } else {
        path(sv, 'M10 210 H210 M10 210 V10', { w: 2.5, stroke: 'var(--mute)' });
        path(sv, 'M10 210 L210 10', { w: 2.5, stroke: 'var(--mute)', dash: '6 6' });
        const ps = D().wp, ws = D().weight['0.61'];
        let d = ''; ps.forEach((p, i) => { d += (i ? 'L' : 'M') + (10 + p * 200).toFixed(1) + ' ' + (210 - ws[i] * 200).toFixed(1); });
        path(sv, d, { stroke: 'var(--blue)', w: 5 });
      }
      return el;
    };
    const bxV = mkBox(250, GK('價值函數 ν(x)'), '錢 → 感受', 'v');
    const bxW = mkBox(1030, '機率權重函數 w(p)', '機率 → 感覺到的機率', 'w');
    // hide the extra axes for the value-function mini (it uses centered axes only)
    return t => {
      const mv = Ease.inOut(P(t, c.c(1) - .3, .9));
      show(k79, t, c.c(0), .7, { extra: ` translate(${lerp(264, 0, mv)}px,${lerp(200, 0, mv)}px) scale(${lerp(1.3, 1, mv)})` });
      show(kt, t, c.c(0) + 2.6, .5);
      opacity(M, 1 - P(t, c.c(3) - .2, .5));
      draw(nl.firstChild, t, c.c(1) + .2, .6); opacity(nl.lastChild, P(t, c.c(1) + .7, .2));
      show(flag, t, c.c(1) + .8, .5);
      opacity(bandL, P(t, c.c(1) + 1.6, .5)); opacity(bandR, P(t, c.c(1) + 1.6, .5));
      show(tL, t, c.c(1) + 1.8, .4); show(tR, t, c.c(1) + 2.1, .4);
      show(exHead, t, c.c(1) + 2.6, .5);
      ex.forEach((e, i) => { show(e.grp, t, c.c(1) + 3.0 + i * 1.2, .5); e.a.anim(t, c.c(1) + 3.4 + i * 1.2, .5); show(e.lb, t, c.c(1) + 3.6 + i * 1.2, .5); });
      show(note, t, c.c(1) + 5.6, .6);
      ar.anim(t, c.c(2) + .1, .4);
      show(k92, t, c.c(2) + .3, .7, { dx: 160, dy: 0 });
      show(nh, t, c.c(3) + .1, .5);
      show(bxV, t, c.c(3) + .5, .6);
      show(bxW, t, c.c(3) + 2.2, .6);
    };
  });

  // ================================================================== valuefn
  scene('valuefn', (root, c) => {
    const hd = heading(root, GK('價值函數 ν(x)：錢 → 感受'));
    const g = svgLayer(root);
    const X = v => 650 + v * 450, Y = u => 410 - u * 183.3;
    const axg = s('g', {}, g);
    const axX = arrow(axg, 200, Y(0), 1120, Y(0), { w: 3.5, head: 14 });
    const axY = arrow(axg, X(0), Y(-2.4), X(0), 188, { w: 3.5, head: 14 });
    const lbls = s('g', {}, g);
    svgText(lbls, 1118, Y(0) + 36, '相對參考點的金額 x（示意尺度）', { size: 22, anchor: 'end', fill: 'var(--mute)', weight: 500 });
    svgMix(lbls, X(0) + 16, 196, [['感受到的價值 ', 0], ['ν(x)', 1]], { size: 24, anchor: 'start', fill: 'var(--mute)', weight: 500 });
    svgText(lbls, 1110, Y(0) - 26, '獲利 →', { size: 28, anchor: 'end', fill: 'var(--green)' });
    svgText(lbls, 210, Y(0) - 26, '← 損失', { size: 28, anchor: 'start', fill: 'var(--red)' });
    [-1, -.5, .5, 1].forEach(v => { line(lbls, X(v), Y(0) - 6, X(v), Y(0) + 6, { w: 2.5 }); });
    const xs = D().tk_x, vs = D().tk_v;
    let dg = '', dl = '', dm = '', fillD = '';
    const gainPts = [], lossPts = [];
    xs.forEach((x, i) => { if (x >= 0) gainPts.push([x, vs[i]]); if (x <= 0) lossPts.push([x, vs[i]]); });
    gainPts.forEach(([x, v], i) => { dg += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(v).toFixed(1); });
    lossPts.slice().reverse().forEach(([x, v], i) => { dl += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(v).toFixed(1); });
    gainPts.forEach(([x, v], i) => { dm += (i ? 'L' : 'M') + X(-x).toFixed(1) + ' ' + Y(-v).toFixed(1); });
    fillD = dm + ' ' + lossPts.map(([x, v]) => 'L' + X(x).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ') + ' Z';
    const fillEl = path(g, fillD, { fill: 'rgba(217,65,46,.16)', stroke: 'none', w: 0 });
    const mir = path(g, dm, { stroke: 'var(--mute)', w: 3.5, dash: '9 9' });
    const gc = path(g, dg, { stroke: 'var(--green)', w: 6 });
    const lc = path(g, dl, { stroke: 'var(--red)', w: 6 });
    const steep = svgText(g, X(-.66), Y(-1.12), '更陡', { size: 32, fill: 'var(--red)' });
    const mirL = svgText(g, X(-.99), Y(-1) - 92, '虛線：獲利曲線的鏡像', { size: 22, anchor: 'start', fill: 'var(--mute)', weight: 600 });
    const dA = s('circle', { cx: X(-1), cy: Y(-1), r: 8, fill: 'var(--mute)' }, g);
    const dB = s('circle', { cx: X(-1), cy: Y(-2.25), r: 10, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
    const dBl = svgText(g, X(-1) + 20, Y(-2.25) + 2, '−λ ≈ −2.25（是鏡像的 λ 倍）', { size: 22, anchor: 'start', fill: '#8a6200', weight: 700 });
    const note = (y, col, html) => { const e = card(root, 1180, y, 600, 0, { pad: 18, style: { borderColor: col } }); e.innerHTML = html; return e; };
    const n0 = note(205, 'var(--green)', `<div class="h3" style="color:var(--green);font-size:32px">獲利區：凹（向下彎）</div><div class="body" style="font-size:27px">多賺的錢，越來越沒感<br>→ 獲利時傾向<b>規避風險</b></div>`);
    const n1 = note(385, 'var(--red)', `<div class="h3" style="color:var(--red);font-size:32px">損失區：凸（向上彎）</div><div class="body" style="font-size:27px">賠越多，每多賠一塊的痛越小<br>→ 損失時<b>願意冒險</b></div>`);
    const n2 = note(565, 'var(--ink)', `<div class="h3" style="font-size:32px">損失側更陡</div><div class="body" style="font-size:27px">同樣金額，賠比賺更痛</div>`);
    const n3 = note(712, '#d4a514', `<div style="display:flex;align-items:center;gap:14px"><span class="h3" style="font-size:32px">${LAM} 損失規避</span><span class="body" style="font-size:27px">λ &gt; 1</span></div>
      <div class="body" style="font-size:24px;color:var(--mute)">TK 1992 估計約 2.25：${TX('\\nu(x)=-\\lambda(-x)^{0.88},\\ x<0', 24)}</div>`);
    n3.style.background = '#fffaf0';
    return t => {
      show(hd, t, c.c(0) - .2, .6);
      axX.anim(t, c.c(0), .6); axY.anim(t, c.c(0), .6);
      opacity(lbls, P(t, c.c(0) + .4, .4));
      draw(gc, t, c.c(0) + 1.0, 1.4);
      show(n0, t, c.c(0) + 2.4, .6);
      draw(lc, t, c.c(1) + .3, 1.4);
      show(n1, t, c.c(1) + 1.8, .6);
      opacity(mir, P(t, c.c(2) + .2, .6));
      opacity(mirL, P(t, c.c(2) + .5, .4));
      opacity(fillEl, P(t, c.c(2) + .9, .6));
      show(steep, t, c.c(2) + 1.3, .5);
      show(n2, t, c.c(2) + 1.0, .6);
      pop(dA, t, c.c(3) + .2, .4); pop(dB, t, c.c(3) + .4, .4);
      show(dBl, t, c.c(3) + .6, .5);
      show(n3, t, c.c(3) + .3, .6);
    };
  });

  // ================================================================== pwf
  scene('pwf', (root, c) => {
    const hd = heading(root, '機率權重函數 w(p)：機率 → 感覺到的機率');
    const g = svgLayer(root);
    const ch = chart(g, 280, 240, 560, 560, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, xticks: [0, .5, 1], yticks: [.5, 1], xlabel: '客觀機率 p', ylabel: '決策權重 w(p)' });
    const ps = D().wp, WT = D().weight;
    // fill regions between γ=0.61 and diagonal
    let pst = 0;
    for (let i = 2; i < ps.length - 1; i++) if (WT['0.61'][i] < ps[i]) { pst = ps[i]; break; }
    const region = (a, b) => {
      let d = '', back = '';
      ps.forEach((p, i) => { if (p >= a - 1e-9 && p <= b + 1e-9) { d += (d ? 'L' : 'M') + ch.X(p).toFixed(1) + ' ' + ch.Y(WT['0.61'][i]).toFixed(1); back = 'L' + ch.X(p).toFixed(1) + ' ' + ch.Y(p).toFixed(1) + back; } });
      return d + back + 'Z';
    };
    const fOver = path(g, region(0, pst), { fill: 'rgba(217,65,46,.22)', stroke: 'none', w: 0 });
    const fUnder = path(g, region(pst, 1), { fill: 'rgba(37,99,235,.16)', stroke: 'none', w: 0 });
    const diag = ch.plot(ps, WT['1.0'], { color: 'var(--mute)', w: 3, dash: '9 9' });
    const c91 = ch.plot(ps, WT['0.91'], { color: '#93b4f5', w: 3 });
    const c69 = ch.plot(ps, WT['0.69'], { color: '#5b8cf0', w: 3 });
    const c61 = ch.plot(ps, WT['0.61'], { color: 'var(--blue)', w: 6 });
    const dlab = svgMix(g, ch.X(.71) - 14, ch.Y(.71) - 14, [['γ = 1', 1], ['：沒有扭曲', 0]], { size: 24, fill: 'var(--mute)' });
    dlab.setAttribute('transform', `rotate(-45 ${ch.X(.71) - 14} ${ch.Y(.71) - 14})`);
    const oL = box(root, ch.X(.04), ch.Y(.42), { html: '<b style="color:var(--red)">高估小機率</b>', style: { fontSize: '28px' } }, 'cl');
    const oA = arrow(g, ch.X(.09), ch.Y(.38), ch.X(.07), ch.Y(.16), { stroke: 'var(--red)', w: 3.5, head: 12 });
    const uL = box(root, ch.X(.98), ch.Y(.12), { html: '<b style="color:var(--blue)">低估中高機率</b>', style: { fontSize: '28px' } }, 'cl');
    setAnchor(uL, 'translate(-100%,-50%) ');
    const uA = arrow(g, ch.X(.8), ch.Y(.17), ch.X(.74), ch.Y(.6), { stroke: 'var(--blue)', w: 3.5, head: 12 });
    const gA = arrow(g, ch.X(.86), ch.Y(.86) + 4, ch.X(.86), ch.Y(wgt(.86, .61)) - 4, { stroke: 'var(--ink)', w: 3.5, head: 12 });
    // right column
    const k0 = card(root, 960, 225, 820, 0, { pad: 22 });
    k0.innerHTML = `<div class="body">輸入機率 <i>p</i>（0～1）→ 輸出「感覺到的」決策權重</div>
      <div style="margin-top:10px;text-align:center">${TX('w(p)=\\dfrac{p^{\\gamma}}{\\left(p^{\\gamma}+(1-p)^{\\gamma}\\right)^{1/\\gamma}}', 34)}</div>
      <div class="small en" style="text-align:right">Tversky &amp; Kahneman（1992）</div>`;
    const k1 = card(root, 960, 478, 820, 0, { pad: 20 });
    k1.innerHTML = `<div class="h3" style="font-size:32px">倒 S 形</div>
      <div style="display:flex;align-items:center;gap:16px;margin-top:6px"><span style="width:26px;height:26px;border-radius:6px;background:rgba(217,65,46,.3)"></span><span class="body">小機率 → <b style="color:var(--red)">被高估</b></span><div class="ic"></div></div>
      <div style="display:flex;align-items:center;gap:16px;margin-top:4px"><span style="width:26px;height:26px;border-radius:6px;background:rgba(37,99,235,.22)"></span><span class="body">中高機率 → <b style="color:var(--blue)">被低估</b></span></div>
      <div class="small" style="margin-top:6px">罕見事故，在決策中常被看得比實際更重</div>`;
    const ic = miniSvg(k1.querySelector('.ic'), 250, 56);
    s('rect', { x: 4, y: 8, width: 92, height: 40, rx: 6, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 3 }, ic);
    path(ic, 'M30 10 V46', { w: 2, stroke: 'var(--ink)', dash: '4 4' });
    svgText(ic, 63, 29, '彩券', { size: 20 });
    path(ic, 'M130 50 L156 6 L182 50 Z', { fill: 'var(--red-soft)', stroke: 'var(--red)', w: 3.5 });
    svgText(ic, 156, 36, '!', { size: 24, fill: 'var(--red)', weight: 900 });
    svgText(ic, 192, 30, '事故', { size: 22, anchor: 'start' });
    const k2 = card(root, 960, 726, 820, 0, { pad: 12 });
    k2.innerHTML = GK(`<div style="display:flex;justify-content:space-around;align-items:center" class="body">
      <span><b style="color:var(--mute)">┅</b> γ = 1</span><span><b style="color:#93b4f5">━</b> γ = 0.91</span><span><b style="color:#5b8cf0">━</b> γ = 0.69</span><span><b style="color:var(--blue)">━</b> γ = 0.61</span></div>
      <div class="body center" style="margin-top:4px"><b>γ 越小 → 越彎（扭曲越大）</b></div>`);
    // c3
    const fig = figCard(root, 930, 250, 850, 'assets/fig2_3.png', '論文 Fig. 2.3：典型的價值函數與機率權重函數（引自 Kahneman & Tversky, 1979）');
    fig.querySelector('.figcap').style.fontSize = '20px';
    const t79 = tagB(root, 1545, 210, '1979 原版：π(p)', 't-gray', 'tc', { fontSize: '26px' });
    const t92 = tagB(root, ch.X(.03), ch.Y(.93), '1992 CPT：倒 S 形 w(p)', 't-blue', 'cl', { fontSize: '26px' });
    const nfig = box(root, 1355, 715, { class: 'body center', html: '論文後面的模型 → 用 <b style="color:var(--blue)">1992 年的倒 S 形</b>公式' }, 'tc');
    return t => {
      show(hd, t, c.c(0) - .2, .6);
      ch.anim(t, c.c(0), .7);
      opacity(diag, P(t, c.c(0) + .7, .6));
      show(dlab, t, c.c(0) + 1.3, .5);
      const outR = c.c(3) - .1;
      show(k0, t, c.c(0) + 1.8, .6, { out: outR });
      draw(c61, t, c.c(1) + .2, 1.2);
      opacity(fOver, P(t, c.c(1) + 1.6, .5)); opacity(fUnder, P(t, c.c(1) + 3.2, .5));
      show(oL, t, c.c(1) + 1.8, .5, { out: outR }); oA.anim(t, c.c(1) + 2.0, .4);
      show(uL, t, c.c(1) + 3.4, .5, { out: outR }); uA.anim(t, c.c(1) + 3.6, .4);
      const ao = 1 - P(t, outR, .5); oA.style.opacity = ao; uA.style.opacity = ao;
      show(k1, t, c.c(1) + 1.0, .6, { out: outR });
      draw(c91, t, c.c(2) + .3, .9); draw(c69, t, c.c(2) + .9, .9);
      show(k2, t, c.c(2) + .3, .5, { out: outR });
      gA.anim(t, c.c(2) + 2.2, .5); gA.style.opacity = ao;
      pop(fig, t, c.c(3) + .3, .6);
      show(t79, t, c.c(3) + 1.0, .5);
      show(t92, t, c.c(3) + 4.5, .5);
      show(nfig, t, c.c(3) + 4.8, .5);
    };
  });

  // ================================================================== cumulative
  scene('cumulative', (root, c) => {
    const hd = heading(root, '累積的意思：排序後，對累積機率加權');
    // phase A: illustration (示意)
    const A = layer(root), g = svgLayer(A);
    const shi = box(A, 1790, 112, { html: SHI + GK(' <span class="small">以 γ = 0.61 計算</span>') }, 'tl');
    setAnchor(shi, 'translateX(-100%) ');
    const BASE = 640, PH = 360;
    // ① sorted outcomes
    const p1 = box(A, 170, 205, { class: 'h3', html: '① 依結果大小排序', style: { fontSize: '30px' } });
    const outV = [20, 45, 70, 100];
    const bars1 = outV.map((v, i) => {
      const x = 205 + i * 92, hh = v / 100 * 300;
      const grp = s('g', {}, g);
      s('rect', { x, y: BASE - hh, width: 62, height: hh, rx: 6, fill: 'var(--green-soft)', stroke: 'var(--green)', 'stroke-width': 3 }, grp);
      mt(grp, x + 31, BASE + 26, `x${'₁₂₃₄'[i]}`, { size: 26 });
      nt(grp, x + 31, BASE + 56, 'p = ¼', { size: 20 });
      return grp;
    });
    const base1 = line(g, 190, BASE, 570, BASE, { w: 3 });
    // ② decumulative probability staircase
    const p2 = box(A, 660, 205, { class: 'h3', html: '② 累積機率「至少這麼好」', style: { fontSize: '30px' } });
    const X2 = i => 690 + i * 104, Y2 = v => BASE - v * PH;
    const ax2 = s('g', {}, g);
    line(ax2, 680, BASE, 1116, BASE, { w: 3 }); line(ax2, 680, BASE, 680, BASE - PH - 20, { w: 3 });
    [0, .5, 1].forEach(v => nt(ax2, 668, Y2(v), String(v), { size: 20, anchor: 'end' }));
    [0, 1, 2, 3].forEach(i => mt(ax2, X2(i) + 52, BASE + 26, `x${'₁₂₃₄'[i]}`, { size: 24 }));
    const dec = [1, .75, .5, .25], wd = dec.map(p => wgt(p, .61));
    const stair = (vals, col, w, dash) => { let d = ''; vals.forEach((v, i) => { d += (i ? 'L' : 'M') + X2(i) + ' ' + Y2(v).toFixed(1) + ' L' + X2(i + 1) + ' ' + Y2(v).toFixed(1); }); return path(g, d, { stroke: col, w, dash }); };
    const sG = stair(dec, 'var(--mute)', 4, '8 8');
    const sB = stair(wd, 'var(--blue)', 6);
    const sGl = nt(g, X2(4) + 8, Y2(.25) + 22, '原本', { size: 20, anchor: 'start' });
    const sBl = svgText(g, X2(4) + 8, Y2(wd[3]) - 14, 'w(·) 之後', { size: 22, anchor: 'start', fill: 'var(--blue)' });
    // ③ decision weights = differences
    const p3 = box(A, 1250, 205, { class: 'h3', html: '③ 決策權重 = 階梯的差', style: { fontSize: '30px' } });
    const pis = [1 - wd[1], wd[1] - wd[2], wd[2] - wd[3], wd[3]];
    const X3 = i => 1270 + i * 120, Y3 = v => BASE - v / .5 * PH;
    const ax3 = s('g', {}, g);
    line(ax3, 1250, BASE, 1760, BASE, { w: 3 });
    const ref = line(g, 1250, Y3(.25), 1760, Y3(.25), { stroke: 'var(--mute)', w: 3, dash: '8 8' });
    const refL = nt(g, 1485, Y3(.25) - 16, '原本 0.25', { size: 20 });
    const bars3 = pis.map((v, i) => {
      const grp = s('g', {}, g);
      const hh = v / .5 * PH;
      s('rect', { x: X3(i), y: BASE - hh, width: 70, height: hh, rx: 6, fill: 'var(--blue-soft)', stroke: 'var(--blue)', 'stroke-width': 3 }, grp);
      nt(grp, X3(i) + 35, BASE - hh - 16, v.toFixed(2), { size: 22, fill: 'var(--blue)', weight: 800 });
      mt(grp, X3(i) + 35, BASE + 26, `x${'₁₂₃₄'[i]}`, { size: 24 });
      return grp;
    });
    const ext = box(A, 1505, 740, { class: 'small center', html: '最差與最好的結果，權重被放大', style: { color: 'var(--blue)', fontWeight: 700 } }, 'tc');
    const fix = card(A, 170, 760, 1000, 0, { pad: 16 });
    fix.innerHTML = '<div class="body">修正 1979 原版的問題：可能偏好明顯較差的選項<br><span class="small">（違反一階隨機優勢）</span></div>';
    // phase B: TK 1992 parameters
    const B = layer(root);
    const tk = card(B, 960, 180, 1060, 0, { anchor: 'tc', pad: 28 });
    tk.innerHTML = GK(`<div class="h3 center">Tversky &amp; Kahneman（1992）的典型估計</div>
      <table class="tb" style="width:100%;margin-top:10px">
      <tr><th style="text-align:left">項目</th><th>估計值</th></tr>
      <tr class="r"><td style="text-align:left">價值函數指數　${TX('\\nu(x)=x^{0.88}', 26)}</td><td class="en"><b>0.88</b></td></tr>
      <tr class="r"><td style="text-align:left">損失規避 ${LAM}</td><td class="en"><b>2.25</b></td></tr>
      <tr class="r"><td style="text-align:left">機率權重 γ（獲利）</td><td class="en"><b>0.61</b></td></tr>
      <tr class="r"><td style="text-align:left">機率權重 γ（損失）</td><td class="en"><b>0.69</b></td></tr></table>
      <div class="small nt" style="margin-top:14px">符號提醒：TK 原文用 α、β、γ、δ 表示這些參數；<br>論文的 δ 是價值函數指數、γ 是權重參數</div>`);
    const rows = [...tk.querySelectorAll('tr.r')], tnote = tk.querySelector('.nt');
    // phase C: Table 2.2
    const C = layer(root);
    const fig = figCard(C, 150, 200, 900, 'assets/tab2_2.png', '論文 Table 2.2：考慮展望理論的維護決策文獻（6 篇）');
    const kS = card(C, 1130, 200, 650, 0, { pad: 26 });
    const cats = [['橋梁', 3, 'var(--blue)', 'var(--blue-soft)'], ['船舶', 2, 'var(--teal)', 'var(--teal-soft)'], ['預測性維護', 1, '#555', '#ebe5d8']];
    kS.innerHTML = `<div class="h3">應用情境（6 篇）</div>` + cats.map(([n, k, col, bg]) =>
      `<div class="cr" style="display:flex;align-items:center;gap:14px;margin-top:16px"><span class="tag" style="background:${bg};color:${col};width:170px;text-align:center">${n}</span>
       <span style="display:flex;gap:6px">${('<span style="width:46px;height:34px;border-radius:6px;background:' + col + ';display:inline-block"></span>').repeat(k)}</span>
       <b class="en" style="font-size:30px">${k}</b></div>`).join('') +
      '<div class="small" style="margin-top:14px">集中在橋梁與船舶；風電還沒有</div>';
    const crs = [...kS.querySelectorAll('.cr')];
    const sc = 866 / 847;
    const hlb = box(C, 150 + 17 + 12 * sc, 200 + 17 + 171 * sc, {});
    Object.assign(hlb.style, { width: (830 * sc) + 'px', height: (43 * sc) + 'px', border: '4px solid var(--yellow)', background: 'rgba(244,197,66,.28)', borderRadius: '8px' });
    const gC = svgLayer(C);
    const cal = s('g', {}, gC);
    path(cal, 'M1030 414 H1092 V730 H1062', { stroke: '#b38600', w: 4 });
    path(cal, 'M1076 718 L1060 730 L1076 742', { stroke: '#b38600', w: 4 });
    const rc = card(C, 1130, 580, 650, 0, { pad: 20 });
    rc.innerHTML = `<div style="display:flex;align-items:center;gap:20px"><div class="mv"></div><div class="body" style="font-size:27px">回想 w(p)：<br><b style="color:var(--red)">小機率被高估</b><br><span class="small">橋梁失效機率很低 → 正好落在這一段</span></div></div>`;
    { const sv = miniSvg(rc.querySelector('.mv'), 170, 170); path(sv, 'M10 160 H160 M10 160 V10', { w: 2.5, stroke: 'var(--mute)' }); path(sv, 'M10 160 L160 10', { w: 2, stroke: 'var(--mute)', dash: '5 5' });
      const ps = D().wp, ws = D().weight['0.61']; let d = '', fr = 'M10 160'; ps.forEach((p, i) => { d += (i ? 'L' : 'M') + (10 + p * 150).toFixed(1) + ' ' + (160 - ws[i] * 150).toFixed(1); if (p <= .2) fr += ' L' + (10 + p * 150).toFixed(1) + ' ' + (160 - ws[i] * 150).toFixed(1); });
      path(sv, fr + ' L40 130 Z', { fill: 'rgba(217,65,46,.3)', stroke: 'none', w: 0 }); path(sv, d, { stroke: 'var(--blue)', w: 4 }); }
    const callout = card(C, 150, 660, 900, 0, { pad: 22, style: { borderColor: '#d4a514', background: '#fffaf0' } });
    callout.innerHTML = `<div class="body"><b>橋梁</b>失效機率很低 → 在 CPT 中被<b style="color:var(--red)">高估</b> → 維護決策<b>偏保守</b></div>
      <div class="small en">Gong &amp; Frangopol（2020）＝ 表中 Gong et al. 2020b</div>`;
    return t => {
      show(hd, t, c.c(0) - .2, .6);
      opacity(A, 1 - P(t, c.c(1) - .2, .5));
      show(shi, t, c.c(0) + .3, .4);
      show(p1, t, c.c(0) + .2, .5);
      draw(base1, t, c.c(0) + .3, .4);
      bars1.forEach((b, i) => show(b, t, c.c(0) + .5 + i * .2, .4));
      show(p2, t, c.c(0) + 1.8, .5);
      show(ax2, t, c.c(0) + 1.9, .4);
      opacity(sG, P(t, c.c(0) + 2.3, .5)); opacity(sGl, P(t, c.c(0) + 2.5, .4));
      draw(sB, t, c.c(0) + 3.4, 1.0); opacity(sBl, P(t, c.c(0) + 4.2, .4));
      show(p3, t, c.c(0) + 4.8, .5);
      show(ax3, t, c.c(0) + 4.9, .4);
      opacity(ref, P(t, c.c(0) + 5.0, .4)); opacity(refL, P(t, c.c(0) + 5.0, .4));
      bars3.forEach((b, i) => show(b, t, c.c(0) + 5.3 + i * .2, .4));
      show(ext, t, c.c(0) + 6.2, .5);
      show(fix, t, c.c(0) + 6.4, .6);
      opacity(B, 1 - P(t, c.c(2) - .2, .5));
      show(tk, t, c.c(1) + .1, .6);
      [3.0, 5.0, 7.4, 9.0].forEach((d, i) => opacity(rows[i], P(t, c.c(1) + d, .5)));
      show(tnote, t, c.c(1) + 10.4, .5);
      show(fig, t, c.c(2) + .1, .6);
      show(kS, t, c.c(2) + .6, .6);
      crs.forEach((e, i) => show(e, t, c.c(2) + 1.4 + i * .8, .4, { dx: -20, dy: 0 }));
      show(hlb, t, c.c(3) + .3, .4, { dy: 0 });
      show(cal, t, c.c(3) + .7, .4, { dy: 0 });
      show(callout, t, c.c(3) + 1.0, .6);
      show(rc, t, c.c(3) + 3.0, .6);
    };
  });
})();
