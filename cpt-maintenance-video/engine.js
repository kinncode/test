// Deterministic animation engine: every visual is a pure function of time t.
// window.seek(t) renders the frame at t seconds; no timers or CSS transitions.

const W = 1920, H = 1080;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const Ease = {
  lin: t => t,
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const P = (t, t0, d) => (d <= 0 ? (t >= t0 ? 1 : 0) : clamp((t - t0) / d));

// seeded PRNG so "random" decorations are identical on every frame/worker
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

// ---------- DOM helpers ----------
const SVGNS = 'http://www.w3.org/2000/svg';
function h(tag, props = {}, parent) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'style') Object.assign(e.style, v);
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v);
  }
  if (parent) parent.appendChild(e);
  return e;
}
function s(tag, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') e.textContent = v;
    else if (k === 'style') Object.assign(e.style, v);
    else e.setAttribute(k, v);
  }
  if (parent) parent.appendChild(e);
  return e;
}
const svgLayer = root => s('svg', { class: 'layer', viewBox: `0 0 ${W} ${H}` }, root);
const tex = (src, display = false) => katex.renderToString(src, { displayMode: display, throwOnError: false, output: 'html' });

// absolutely-positioned box; anchor: 'tl' | 'c' | 'tc'
function box(root, x, y, props = {}, anchor = 'tl') {
  const e = h('div', props, root);
  e.classList.add('abs');
  e.style.left = x + 'px'; e.style.top = y + 'px';
  e._anchor = anchor === 'c' ? 'translate(-50%,-50%) ' : anchor === 'tc' ? 'translate(-50%,0) ' : anchor === 'cl' ? 'translate(0,-50%) ' : '';
  e.style.transform = e._anchor;
  return e;
}

// ---------- animation primitives (call every frame) ----------
// appear: fade + slide in at t0 (dur d); optional fade-out at o.out
function show(el, t, t0, d = .6, o = {}) {
  const p = Ease.out(P(t, t0, d));
  const q = o.out != null ? 1 - Ease.inOut(P(t, o.out, o.outD ?? .5)) : 1;
  const v = Math.min(p, q) * (o.op ?? 1);
  el.style.opacity = v;
  el.style.visibility = v < .002 ? 'hidden' : 'visible';
  const dy = (o.dy ?? 26) * (1 - p), dx = (o.dx ?? 0) * (1 - p);
  const sc = o.s != null ? lerp(o.s, 1, o.sEase ? o.sEase(P(t, t0, d)) : p) : 1;
  if (el instanceof SVGElement) {
    const w = svgWrap(el);
    let tr = `translate(${dx},${dy})`;
    if (sc !== 1) {
      if (!w._c) { const bb = w.getBBox(); if (bb.width || bb.height) w._c = [bb.x + bb.width / 2, bb.y + bb.height / 2]; }
      const [cx, cy] = w._c || [0, 0];
      tr += ` translate(${cx},${cy}) scale(${sc}) translate(${-cx},${-cy})`;
    }
    w.setAttribute('transform', tr);
  } else el.style.transform = (el._anchor || '') + `translate(${dx}px,${dy}px)` + (sc !== 1 ? ` scale(${sc})` : '') + (o.extra || '');
  return v;
}
// wrap an SVG element in a <g> so animation transforms don't clobber its own transform
function svgWrap(el) {
  if (!el._wrap) { const w = document.createElementNS(SVGNS, 'g'); el.parentNode.insertBefore(w, el); w.appendChild(el); el._wrap = w; }
  return el._wrap;
}
const pop = (el, t, t0, d = .5, o = {}) => show(el, t, t0, d, { dy: 0, s: .6, sEase: Ease.back, ...o });
function opacity(el, v) { el.style.opacity = v; el.style.visibility = v < .002 ? 'hidden' : 'visible'; }

// SVG stroke draw-on
function prep(el) {
  const L = el.getTotalLength ? el.getTotalLength() : 1000;
  el._L = L + 2; el.style.strokeDasharray = `${el._L} ${el._L}`; el.style.strokeDashoffset = el._L;
  return el;
}
function draw(el, t, t0, d = 1, o = {}) {
  if (el._L == null) prep(el);
  const p = (o.ease || Ease.inOut)(P(t, t0, d));
  el.style.strokeDashoffset = el._L * (1 - p);
  const q = o.out != null ? 1 - P(t, o.out, o.outD ?? .5) : 1;
  el.style.opacity = p > 0 ? q : 0;
  return p;
}
function typeText(el, str, t, t0, cps = 22) {
  const n = Math.floor(clamp((t - t0) * cps, 0, str.length));
  el.textContent = str.slice(0, n);
}
function countTo(el, v0, v1, t, t0, d, dec = 2, suffix = '') {
  const p = Ease.out(P(t, t0, d));
  el.textContent = lerp(v0, v1, p).toFixed(dec) + suffix;
}

// ---------- SVG building blocks ----------
function path(g, d, o = {}) {
  return s('path', { d, fill: o.fill || 'none', stroke: o.stroke || 'var(--ink)', 'stroke-width': o.w ?? 4,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...(o.dash ? { 'stroke-dasharray': o.dash } : {}), ...(o.attrs || {}) }, g);
}
function line(g, x1, y1, x2, y2, o = {}) { return path(g, `M${x1} ${y1} L${x2} ${y2}`, o); }
// arrow = shaft (drawable) + head (appears at end)
function arrow(g, x1, y1, x2, y2, o = {}) {
  const grp = s('g', {}, g);
  let d;
  if (o.bend) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, nx = -(y2 - y1), ny = x2 - x1, L = Math.hypot(nx, ny) || 1;
    const cx = mx + nx / L * o.bend, cy = my + ny / L * o.bend;
    d = `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
    var ang = Math.atan2(y2 - cy, x2 - cx);
  } else { d = `M${x1} ${y1} L${x2} ${y2}`; var ang = Math.atan2(y2 - y1, x2 - x1); }
  const shaft = path(grp, d, o);
  const hs = o.head ?? 18;
  const hx1 = x2 - hs * Math.cos(ang - .45), hy1 = y2 - hs * Math.sin(ang - .45);
  const hx2 = x2 - hs * Math.cos(ang + .45), hy2 = y2 - hs * Math.sin(ang + .45);
  const head = path(grp, `M${hx1} ${hy1} L${x2} ${y2} L${hx2} ${hy2}`, { ...o, dash: null });
  grp.shaft = shaft; grp.head = head;
  grp.anim = (t, t0, d = .8) => { const p = draw(shaft, t, t0, d); head.style.opacity = p > .92 ? 1 : 0; return p; };
  grp.hide = () => { shaft.style.opacity = 0; head.style.opacity = 0; };
  return grp;
}
function svgText(g, x, y, str, o = {}) {
  return s('text', { x, y, 'font-size': o.size || 28, 'font-weight': o.weight || 700, fill: o.fill || 'var(--ink)',
    'text-anchor': o.anchor || 'middle', 'dominant-baseline': o.base || 'middle', ...(o.family ? { 'font-family': o.family } : {}), text: str }, g);
}
// axes: returns mappers X(u), Y(v) for u,v in [0,1]
function axes(g, x, y, w, hgt, o = {}) {
  const grp = s('g', {}, g);
  const ax = arrow(grp, x, y + hgt, x + w + 26, y + hgt, { w: 3.5, head: 14 });
  const ay = arrow(grp, x, y + hgt, x, y - 26, { w: 3.5, head: 14 });
  const lx = o.xlabel ? svgText(grp, x + w + 20, y + hgt + 40, o.xlabel, { size: 26, anchor: 'end', weight: 500, fill: 'var(--mute)' }) : null;
  const ly = o.ylabel ? svgText(grp, x - 14, y - 46, o.ylabel, { size: 26, anchor: 'start', weight: 500, fill: 'var(--mute)' }) : null;
  return {
    g: grp, X: u => x + u * w, Y: v => y + hgt - v * hgt,
    anim(t, t0, d = .8) { ax.anim(t, t0, d); ay.anim(t, t0, d); [lx, ly].forEach(e => e && opacity(e, P(t, t0 + d * .6, .4))); },
  };
}
// polyline path from function samples
function fpath(fn, u0, u1, n, X, Y) {
  let d = '';
  for (let i = 0; i <= n; i++) { const u = lerp(u0, u1, i / n); d += (i ? 'L' : 'M') + X(u).toFixed(1) + ' ' + Y(fn(u)).toFixed(1); }
  return d;
}

// ---------- line-art icons (return <g>) ----------
const Icons = {
  gear(g, cx, cy, r, o = {}) {
    const grp = s('g', {}, g); const n = 9; let d = '';
    for (let i = 0; i < n * 4; i++) {
      const a = i / (n * 4) * Math.PI * 2, rr = (i % 4 < 2) ? r : r * .78;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    path(grp, d + 'Z', o); s('circle', { cx, cy, r: r * .32, fill: 'none', stroke: o.stroke || 'var(--ink)', 'stroke-width': o.w ?? 4 }, grp);
    return grp;
  },
  fan(g, cx, cy, r, o = {}) {
    const grp = s('g', {}, g);
    s('rect', { x: cx - r * 1.12, y: cy - r * 1.12, width: r * 2.24, height: r * 2.24, rx: r * .22, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 4 }, grp);
    s('circle', { cx, cy, r: r * 1.0, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3 }, grp);
    const rot = s('g', {}, grp);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * 360;
      const b = s('path', { d: `M${cx} ${cy} q ${r * .25} ${-r * .55} ${r * .05} ${-r * .92} q ${-r * .38} ${r * .1} ${-r * .3} ${r * .55} Z`,
        fill: o.fill || 'var(--blue-soft)', stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-linejoin': 'round', transform: `rotate(${a} ${cx} ${cy})` }, rot);
    }
    s('circle', { cx, cy, r: r * .22, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 4 }, grp);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => s('circle', { cx: cx + sx * r * .92, cy: cy + sy * r * .92, r: r * .06, fill: 'var(--ink)' }, grp));
    grp.spin = ang => rot.setAttribute('transform', `rotate(${ang} ${cx} ${cy})`);
    return grp;
  },
  factory(g, x, y, sc = 1) {
    const grp = s('g', { transform: `translate(${x},${y}) scale(${sc})` }, g);
    path(grp, 'M0 120 L0 50 L40 75 L40 50 L80 75 L80 50 L120 75 L120 10 L145 10 L145 120 Z', { fill: 'var(--card)' });
    path(grp, 'M18 95 h16 M58 95 h16 M98 95 h16', { w: 4 });
    path(grp, 'M132 0 q 10 -14 0 -26 q -10 -12 4 -24', { w: 3, stroke: 'var(--mute)' });
    return grp;
  },
  plane(g, x, y, sc = 1) {
    const grp = s('g', { transform: `translate(${x},${y}) scale(${sc})` }, g);
    path(grp, 'M0 60 L150 60 Q 175 60 175 70 Q 175 80 150 80 L20 80 L0 60 Z', { fill: 'var(--card)' });
    path(grp, 'M70 60 L100 15 L118 15 L100 60 M70 80 L95 115 L112 115 L100 80', { fill: 'var(--card)' });
    path(grp, 'M10 64 L0 35 L14 35 L30 60', { fill: 'var(--card)' });
    return grp;
  },
  plant(g, x, y, sc = 1) {
    const grp = s('g', { transform: `translate(${x},${y}) scale(${sc})` }, g);
    path(grp, 'M10 120 Q 30 70 14 10 L66 10 Q 50 70 70 120 Z', { fill: 'var(--card)' });
    path(grp, 'M80 120 Q 96 80 84 40 L126 40 Q 114 80 130 120 Z', { fill: 'var(--card)' });
    path(grp, 'M30 4 q 8 -12 0 -22 q -8 -10 4 -22 M100 34 q 8 -12 0 -22', { w: 3, stroke: 'var(--mute)' });
    return grp;
  },
  calendar(g, x, y, sc = 1) {
    const grp = s('g', { transform: `translate(${x},${y}) scale(${sc})` }, g);
    s('rect', { x: 0, y: 10, width: 120, height: 104, rx: 12, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 4 }, grp);
    path(grp, 'M0 38 H120 M30 0 V22 M90 0 V22', {});
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) s('rect', { x: 14 + c * 26, y: 50 + r * 20, width: 14, height: 10, rx: 2, fill: (r === 1 && c === 2) ? 'var(--orange)' : 'var(--faint)' }, grp);
    return grp;
  },
  broken(g, x, y, sc = 1) {
    const grp = s('g', { transform: `translate(${x},${y}) scale(${sc})` }, g);
    Icons.gear(grp, 60, 60, 52, { fill: 'var(--card)' });
    path(grp, 'M40 0 L62 48 L48 62 L80 120', { stroke: 'var(--red)', w: 6 });
    return grp;
  },
  pulse(g, x, y, sc = 1) {
    const grp = s('g', { transform: `translate(${x},${y}) scale(${sc})` }, g);
    path(grp, 'M60 112 C -30 50, 10 -20, 60 22 C 110 -20, 150 50, 60 112 Z', { fill: 'var(--green-soft)', stroke: 'var(--green)' });
    path(grp, 'M8 56 H38 L48 36 L60 80 L72 46 L80 56 H112', { stroke: 'var(--green)', w: 5 });
    return grp;
  },
  person(g, x, y, sc = 1, color = 'var(--ink)', fill = 'var(--card)') {
    const grp = s('g', { transform: `translate(${x},${y}) scale(${sc})` }, g);
    s('circle', { cx: 0, cy: -58, r: 26, fill, stroke: color, 'stroke-width': 4 }, grp);
    path(grp, 'M-44 30 Q -44 -22 0 -22 Q 44 -22 44 30 Z', { stroke: color, fill });
    return grp;
  },
  wrench(g, x, y, sc = 1, color = 'var(--ink)') {
    const grp = s('g', { transform: `translate(${x},${y}) scale(${sc})` }, g);
    path(grp, 'M10 70 L52 28 M44 6 a 22 22 0 1 0 30 30 l -14 -4 l -8 -12 Z', { stroke: color, w: 6, fill: 'none' });
    return grp;
  },
};

// unit timeline (one monitored machine): returns group with anim(t,t0,d)
function unitBar(g, x, y, len, kind, o = {}) {
  const grp = s('g', {}, g);
  const col = kind === 'fail' ? 'var(--red)' : 'var(--teal)';
  const bar = line(grp, x, y, x + len, y, { stroke: col, w: o.w ?? 7 });
  let endMark;
  if (kind === 'fail') endMark = path(grp, `M${x + len - 11} ${y - 11} L${x + len + 11} ${y + 11} M${x + len + 11} ${y - 11} L${x + len - 11} ${y + 11}`, { stroke: 'var(--red)', w: 6 });
  else endMark = path(grp, `M${x + len + 4} ${y - 12} V${y + 12} M${x + len + 15} ${y - 12} V${y + 12}`, { stroke: 'var(--teal)', w: 6 });
  const dot = s('circle', { cx: x, cy: y, r: 6, fill: col }, grp);
  grp.bar = bar; grp.end = endMark; grp.x1 = x + len;
  grp.anim = (t, t0, d = 1) => { const p = draw(bar, t, t0, d); opacity(endMark, P(t, t0 + d * .95, .2)); opacity(dot, P(t, t0, .1)); return p; };
  return grp;
}

// ---------- subtitle formatting ----------
function fmtSub(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/𝓛/g, '<span class="mcal">L</span>').replace(/𝓤/g, '<span class="mcal">U</span>')
    .replace(/([hwX])([₁₂])/g, (m, a, b) => `<i>${a}</i><sub>${b === '₁' ? 1 : 2}</sub>`)
    .replace(/′/g, '′');
}

// ---------- scene registry & timeline ----------
const SCENES = {};
function scene(id, builder) { SCENES[id] = builder; }

const Stage = { built: [], total: 0 };
function boot() {
  const T = window.TIMING;
  Stage.total = T.total;
  const stage = document.getElementById('stage');
  const layer = document.getElementById('scenes');
  for (const sc of T.scenes) {
    const root = h('div', { class: 'scene', 'data-id': sc.id }, layer);
    const ctx = {
      cues: sc.cues, dur: sc.dur,
      c: (i, dt = 0) => (sc.cues[i] ? sc.cues[i].s : sc.dur) + dt,
      e: (i, dt = 0) => (sc.cues[i] ? sc.cues[i].e : sc.dur) + dt,
    };
    const b = SCENES[sc.id];
    let upd = () => {};
    if (b) { try { upd = b(root, ctx) || upd; } catch (err) { console.error('scene', sc.id, err); h('div', { class: 'abs h2', text: 'ERR ' + sc.id, style: { left: '100px', top: '100px', color: 'red' } }, root); } }
    else h('div', { class: 'abs h2', text: sc.id, style: { left: '100px', top: '200px' } }, root);
    Stage.built.push({ sc, root, upd });
  }
  // chapter ticks on progress bar
  const ticks = document.getElementById('ticks');
  for (const sc of T.scenes) if (sc.chapterStart) h('i', { style: { left: (sc.start / T.total * W) + 'px' } }, ticks);
  // preload every subtitle glyph (fonts load per unicode-range subset)
  const pre = h('div', { style: { position: 'absolute', left: '-5000px', top: 0, width: '4000px' } }, stage);
  pre.innerHTML = T.scenes.map(sc => sc.cues.map(c => fmtSub(c.t)).join(' ') + sc.chapter).join(' ');
  h('div', { class: 'hand', text: T.scenes.map(sc => sc.chapter).join('') + '第章' }, pre);
  for (const w of [400, 500, 700, 900]) h('div', { text: pre.textContent.slice(0, 4000), style: { fontWeight: w } }, pre);
}

const XF = .5; // crossfade
function seek(t) {
  const T = window.TIMING;
  let cur = null;
  for (const b of Stage.built) {
    const st = b.sc.start, en = st + b.sc.dur;
    const vis = t >= st - XF / 2 && t < en + XF / 2;
    if (!vis) { if (b.root.style.display !== 'none') b.root.style.display = 'none'; continue; }
    b.root.style.display = '';
    const first = b === Stage.built[0], last = b === Stage.built[Stage.built.length - 1];
    const fi = first ? 1 : P(t, st - XF / 2, XF), fo = last ? 1 : 1 - P(t, en - XF / 2, XF);
    b.root.style.opacity = Math.min(fi, fo);
    b.upd(t - st);
    if (t >= st && t < en) cur = b;
  }
  if (!cur) cur = t < 0 ? Stage.built[0] : Stage.built[Stage.built.length - 1];
  const lt = t - cur.sc.start;

  // subtitles: show cue until next cue starts (or scene end)
  const subs = document.getElementById('subs');
  let txt = '', op = 0;
  const cues = cur.sc.cues;
  for (let i = cues.length - 1; i >= 0; i--) {
    if (lt >= cues[i].s - .05) {
      const until = i + 1 < cues.length ? cues[i + 1].s - .05 : cur.sc.dur - .25;
      if (lt < until) { txt = cues[i].t; op = Math.min(P(lt, cues[i].s - .05, .15), 1 - P(lt, until - .12, .12)); }
      break;
    }
  }
  if (subs._txt !== txt) { subs.innerHTML = txt ? fmtSub(txt) : ''; subs._txt = txt; }
  subs.style.opacity = op;

  // chapter pill + chapter card
  const chap = document.getElementById('chap'), card = document.getElementById('chapcard');
  const ch = cur.sc.chapter;
  if (chap._ch !== ch) {
    chap._ch = ch;
    if (ch) { const [n, ...rest] = ch.split(' '); chap.innerHTML = `<span class="num">${n}</span>${rest.join(' ')}`; }
  }
  const chStart = Stage.built.find(b => b.sc.chapter === ch && b.sc.chapterStart);
  let cardOp = 0;
  if (ch && chStart) {
    const lc = t - chStart.sc.start;
    cardOp = Math.min(P(lc, .15, .45), 1 - P(lc, 2.05, .45));
    if (card._ch !== ch) {
      card._ch = ch; const [n, ...rest] = ch.split(' ');
      card.innerHTML = `<div class="k">CHAPTER</div><div class="n">${n}</div><div class="t">${rest.join(' ')}</div><div class="bar"></div>`;
    }
    const bar = card.querySelector('.bar'); if (bar) bar.style.width = (lerp(0, 520, Ease.out(P(lc, .4, 1.2)))) + 'px';
    card.style.transform = `translateY(${(1 - Ease.out(P(lc, .15, .5))) * 30}px)`;
  }
  opacity(card, cardOp);
  opacity(chap, ch ? (1 - cardOp) : 0);
  // content of the chapter-start scene is hidden under the card: dim it
  if (cardOp > 0 && chStart && chStart.root.style.display !== 'none') chStart.root.style.opacity = Math.min(+chStart.root.style.opacity || 1, 1 - cardOp);

  document.getElementById('brand').style.opacity = t > 7 ? 1 : 0;
  document.getElementById('prog').style.width = (clamp(t / T.total) * W) + 'px';
}
window.seek = seek;

// inline SVG inside an HTML element (for icons inside cards)
function miniSvg(parent, w, hgt, style = {}) {
  const sv = s('svg', { width: w, height: hgt, viewBox: `0 0 ${w} ${hgt}` }, parent);
  Object.assign(sv.style, { display: 'block', overflow: 'visible', ...style });
  return sv;
}
// card with title/subtitle/body; returns {el, body}
function card(root, x, y, w, hgt, o = {}) {
  const el = box(root, x, y, { class: 'card' + (o.cls ? ' ' + o.cls : '') }, o.anchor || 'tl');
  Object.assign(el.style, { width: w + 'px', height: hgt ? hgt + 'px' : 'auto', padding: (o.pad ?? 28) + 'px' }, o.style || {});
  return el;
}

// ======================================================================
// Shared chart helpers (used by every scene file)
// ======================================================================

// figure card showing a cropped thesis figure
function figCard(root, x, y, w, src, cap, anchor = 'tl') {
  const el = box(root, x, y, { class: 'figure' }, anchor);
  el.style.width = w + 'px';
  h('img', { src }, el);
  if (cap) h('div', { class: 'figcap', text: cap }, el);
  return el;
}

// numeric chart with ticks. o: {xmin,xmax,ymin,ymax,xticks:[..],yticks:[..],xlabel,ylabel,fx,fy,grid}
// returns {g, X(v), Y(v), anim(t,t0), plot(xs,ys,opts)->path, dot(xv,yv,opts)->circle, vline(xv,opts), hline(yv,opts)}
function chart(g, x, y, w, hgt, o = {}) {
  const grp = s('g', {}, g);
  const X = v => x + (v - o.xmin) / (o.xmax - o.xmin) * w;
  const Y = v => y + hgt - (v - o.ymin) / (o.ymax - o.ymin) * hgt;
  const fx = o.fx || (v => String(v)), fy = o.fy || (v => String(v));
  const parts = [];
  (o.yticks || []).forEach(v => {
    if (o.grid !== false) parts.push(line(grp, x, Y(v), x + w, Y(v), { w: 1.5, stroke: 'rgba(31,36,48,.10)' }));
    parts.push(svgText(grp, x - 14, Y(v), fy(v), { size: 21, anchor: 'end', weight: 500, fill: 'var(--mute)', family: 'Inter' }));
  });
  (o.xticks || []).forEach(v => {
    parts.push(line(grp, X(v), y + hgt, X(v), y + hgt + 8, { w: 2 }));
    parts.push(svgText(grp, X(v), y + hgt + 30, fx(v), { size: 21, weight: 500, fill: 'var(--mute)', family: 'Inter' }));
  });
  const ax = line(grp, x, y + hgt, x + w + 10, y + hgt, { w: 3 });
  const ay = line(grp, x, y + hgt, x, y - 10, { w: 3 });
  if (o.xlabel) parts.push(svgText(grp, x + w, y + hgt + 64, o.xlabel, { size: 24, anchor: 'end', weight: 500, fill: 'var(--mute)' }));
  if (o.ylabel) parts.push(svgText(grp, x - 4, y - 34, o.ylabel, { size: 24, anchor: 'start', weight: 500, fill: 'var(--mute)' }));
  return {
    g: grp, X, Y,
    anim(t, t0, d = .7) { draw(ax, t, t0, d); draw(ay, t, t0, d); parts.forEach(p => opacity(p, P(t, t0 + d * .5, .4))); },
    plot(xs, ys, po = {}) {
      let dd = '', pen = false;
      for (let i = 0; i < xs.length; i++) {
        const yv = ys[i];
        if (yv == null || !isFinite(yv) || (po.clip !== false && (yv > o.ymax * 1.02 || yv < o.ymin - (o.ymax - o.ymin) * .02))) { pen = false; continue; }
        dd += (pen ? 'L' : 'M') + X(xs[i]).toFixed(1) + ' ' + Y(yv).toFixed(1); pen = true;
      }
      return path(g, dd, { stroke: po.color || 'var(--blue)', w: po.w ?? 4, dash: po.dash });
    },
    dot(xv, yv, po = {}) { return s('circle', { cx: X(xv), cy: Y(yv), r: po.r ?? 10, fill: po.color || 'var(--red)', stroke: po.stroke || 'none', 'stroke-width': 3 }, g); },
    vline(xv, po = {}) { return line(g, X(xv), y + hgt, X(xv), y + (po.top ?? 0), { stroke: po.color || 'var(--ink)', w: po.w ?? 2.5, dash: po.dash ?? '8 8' }); },
    hline(yv, po = {}) { return line(g, x, Y(yv), x + w, Y(yv), { stroke: po.color || 'var(--ink)', w: po.w ?? 2.5, dash: po.dash ?? '8 8' }); },
  };
}

// grouped bar chart: groups=[{name, sub?, vals:[..], std?:[..]}], series=[[name,color],..]
function barChart(root, g, x, y, w, hgt, groups, series, vmax, o = {}) {
  const grp = s('g', {}, g);
  const base = y + hgt;
  const yaxis = line(grp, x, base, x, y - 10, { w: 3 });
  const xaxis = line(grp, x, base, x + w, base, { w: 3 });
  const ticks = [];
  for (let v = 0; v <= vmax + 1e-9; v += o.step || 1) {
    const yy = base - v / vmax * hgt;
    ticks.push(line(grp, x - 8, yy, x + w, yy, { w: 1.5, stroke: v === 0 ? 'var(--ink)' : 'rgba(31,36,48,.12)' }));
    ticks.push(svgText(grp, x - 16, yy, (o.fmt || String)(v), { size: 21, anchor: 'end', weight: 500, fill: 'var(--mute)', family: 'Inter' }));
  }
  const ylab = svgText(grp, x - 10, y - 40, o.ylabel || '', { size: 24, anchor: 'start', fill: 'var(--mute)', weight: 500 });
  const gw = w / groups.length, bw = gw * .78 / series.length;
  const bars = groups.map((gr, gi) => {
    const gx = x + gi * gw + gw * .11;
    svgText(grp, gx + bw * series.length / 2, base + 36, gr.name, { size: 26 });
    if (gr.sub) svgText(grp, gx + bw * series.length / 2, base + 68, gr.sub, { size: 21, weight: 500, fill: 'var(--mute)' });
    return gr.vals.map((v, si) => {
      const bx = gx + si * bw + 4;
      const r = s('rect', { x: bx, y: base, width: bw - 8, height: 0, rx: 6, fill: series[si][1] }, grp);
      const tx = svgText(grp, bx + (bw - 8) / 2, base, (o.vfmt || (q => q.toFixed(2)))(v), { size: 22, family: 'Inter', fill: 'var(--ink)' });
      return { r, tx, v, bx };
    });
  });
  const legend = box(root, x + w, y - 64, { html: series.map(([n, col]) => `<span style="display:inline-flex;align-items:center;gap:6px;margin-left:16px"><span style="width:20px;height:20px;border-radius:4px;background:${col};display:inline-block"></span>${n}</span>`).join(''), style: { fontSize: '24px', fontWeight: 700 } });
  legend.style.transform = 'translateX(-100%)'; legend._anchor = 'translateX(-100%) ';
  return {
    grp, bars, legend,
    axis(t, t0) { [yaxis, xaxis].forEach(e => draw(e, t, t0, .5)); ticks.forEach(e => opacity(e, P(t, t0 + .3, .4))); opacity(ylab, P(t, t0 + .3, .4)); show(legend, t, t0 + .3, .5); },
    bar(gi, si, t, t0, d = .8) {
      const b = bars[gi][si]; const k = Ease.out(P(t, t0, d));
      const hh = Math.min(1, b.v / vmax) * hgt * k;
      b.r.setAttribute('height', hh); b.r.setAttribute('y', base - hh);
      b.tx.setAttribute('y', base - hh - 16); b.tx.textContent = (o.vfmt || (q => q.toFixed(2)))(b.v * k); opacity(b.tx, P(t, t0, .2));
    },
  };
}

// series helper: pair window.DATA arrays
const D = () => window.DATA;
