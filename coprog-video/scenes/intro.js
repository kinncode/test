// Opening + chapters 1–3 (background knowledge)

// ---------------------------------------------------------------- hook
scene('hook', (root, c) => {
  const g = svgLayer(root);
  const head = box(root, 960, 150, { class: 'h1 center', text: '一台機器還沒壞，就被拆下來了。' }, 'tc');
  const fan = Icons.fan(g, 470, 540, 150);
  const sensor = s('rect', { x: 600, y: 650, width: 46, height: 30, rx: 6, fill: 'var(--teal)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
  const wire = path(g, 'M646 665 C 760 665, 760 560, 860 560', { stroke: 'var(--teal)', w: 3 });
  const ax = axes(g, 880, 330, 820, 360, { xlabel: '時間', ylabel: '振動訊號' });
  const f = u => .14 + .025 * Math.sin(u * 47) + .02 * Math.sin(u * 13) + (u > .4 ? Math.pow((u - .4) / .6, 2) * .55 : 0);
  const sig = path(g, fpath(f, 0, .7, 220, ax.X, ax.Y), { stroke: 'var(--teal)', w: 4 });
  const xs = ax.X(.7);
  const cut = line(g, xs, 300, xs, 690, { stroke: 'var(--ink)', w: 3, dash: '10 10' });
  const pz = s('g', {}, g);
  s('rect', { x: xs - 34, y: 250, width: 68, height: 52, rx: 10, fill: 'var(--teal)' }, pz);
  path(pz, `M${xs - 10} 262 V290 M${xs + 10} 262 V290`, { stroke: '#fff', w: 7 });
  const lab = svgText(g, xs + 50, 278, '拆下檢修', { size: 30, anchor: 'start', fill: 'var(--teal)' });
  const ghost = path(g, fpath(f, .7, 1, 80, ax.X, ax.Y), { stroke: 'var(--mute)', w: 3, dash: '6 12' });
  const qm = svgText(g, ax.X(.97), ax.Y(f(.97)) - 50, '?', { size: 90, fill: 'var(--red)', family: 'LXGW WenKai TC' });
  const q = box(root, 960, 790, { class: 'h1 center', html: '它留下的資料，<span class="hl">還有用嗎？</span>' }, 'tc');
  q.style.fontSize = '74px';
  const ts = 2.9;
  return t => {
    show(head, t, .25, .8);
    const w = 260, td = 1.2;
    const ang = t < ts ? w * t : w * ts + w * Math.min(t - ts, td) - .5 * (w / td) * Math.pow(Math.min(t - ts, td), 2);
    fan.spin(ang);
    opacity(sensor, P(t, .3, .4)); draw(wire, t, .5, .5);
    ax.anim(t, .5, .7);
    draw(sig, t, 1.0, 1.9, { ease: Ease.lin });
    opacity(cut, P(t, ts, .3)); pop(pz, t, ts, .4); opacity(lab, P(t, ts + .15, .3));
    opacity(ghost, P(t, c.c(1), .6) * .9); pop(qm, t, c.c(1) + .4, .5);
    show(q, t, c.c(1) + .2, .7, { s: .9 });
  };
});

// ---------------------------------------------------------------- title
scene('title', (root, c) => {
  const pill = box(root, 140, 220, { class: 'pill', text: '論文導讀 · 從零開始' });
  pill.style.fontSize = '28px';
  const t1 = box(root, 140, 300, { class: 'h1', html: '利用<span class="c-red">失效</span>與<span class="c-teal">停機</span>資料，<br>以<span class="hl">協同訓練</span>預測剩餘使用壽命' });
  t1.style.fontSize = '64px';
  const en = box(root, 140, 490, { class: 'en wrap', text: 'A co-training-based approach for prediction of remaining useful life utilizing both failure and suspension data' });
  Object.assign(en.style, { width: '1000px', fontSize: '28px', fontStyle: 'italic', color: 'var(--mute)', lineHeight: 1.4 });
  const jr = box(root, 140, 610, { class: 'tag t-blue', html: '<span class="en">Mechanical Systems and Signal Processing</span> · 62–63 (2015) 75–90' });
  jr.style.fontSize = '28px';
  const au = box(root, 140, 690, { class: 'en', html: 'Chao Hu · Byeng D. Youn · Taejin Kim · Pingfeng Wang' });
  Object.assign(au.style, { fontSize: '36px', fontWeight: 700 });
  const af = box(root, 140, 750, { class: 'small', html: 'University of Maryland · Seoul National University · Wichita State University' });
  af.style.fontFamily = 'Inter';
  const fig = box(root, 1280, 220, { class: 'figure' });
  fig.style.width = '520px';
  h('img', { src: 'assets/page1.png' }, fig);
  const lbl = h('div', { class: 'figcap', text: 'doi: 10.1016/j.ymssp.2015.03.004' }, fig);
  return t => {
    show(pill, t, c.c(0), .6);
    show(fig, t, c.c(0) + .6, .9, { dy: 40, extra: ` rotate(${lerp(-8, -2.5, Ease.out(P(t, c.c(0) + .6, 1)))}deg)` });
    show(t1, t, c.c(1), .8);
    show(en, t, c.c(1) + 1.2, .8);
    show(jr, t, c.c(2), .6);
    show(au, t, c.c(3), .6);
    show(af, t, c.c(3) + .6, .6);
  };
});

// ---------------------------------------------------------------- roadmap
scene('roadmap', (root, c) => {
  const chapters = [
    ['為什麼要預測壽命', '背景知識', 't-teal'], ['失效資料與停機資料', '背景知識', 't-teal'], ['機器學習速成', '背景知識', 't-teal'],
    ['兩位學生：FFNN 與 RBN', '背景知識', 't-teal'], ['COPROG 演算法', '論文方法', 't-blue'], ['為什麼有效', '論文方法', 't-blue'],
    ['案例一：滾動軸承', '實驗驗證', 't-orange'], ['案例二：散熱風扇', '實驗驗證', 't-orange'], ['總結與延伸', '收尾', 't-purple'],
  ];
  const head = box(root, 960, 110, { class: 'h2 center', text: '影片地圖' }, 'tc');
  const g = svgLayer(root);
  const xs = [150, 700, 1250], ys = [230, 450, 670], W0 = 520, H0 = 170;
  const pos = chapters.map((_, i) => { const r = Math.floor(i / 3), cc = r % 2 ? 2 - i % 3 : i % 3; return [xs[cc], ys[r]]; });
  let d = '';
  pos.forEach(([x, y], i) => { d += (i ? 'L' : 'M') + (x + W0 / 2) + ' ' + (y + H0 / 2); });
  const road = path(g, d, { stroke: 'var(--faint)', w: 10 });
  const cards = chapters.map(([tt, cat, cl], i) => {
    const el = card(root, pos[i][0], pos[i][1], W0, H0, { pad: 24 });
    el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.gap = '22px';
    h('div', { class: 'h2', text: String(i + 1), style: { width: '78px', height: '78px', borderRadius: '50%', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', fontSize: '44px' } }, el);
    const r = h('div', {}, el);
    h('div', { class: 'h3', text: tt, style: { fontSize: tt.length > 10 ? '31px' : '36px', whiteSpace: 'nowrap' } }, r);
    h('span', { class: 'tag ' + cl, text: cat, style: { marginTop: '8px' } }, r);
    return el;
  });
  return t => {
    show(head, t, .2, .6);
    draw(road, t, c.c(0), c.e(1) - c.c(0) - 1, { ease: Ease.lin });
    cards.forEach((el, i) => {
      const t0 = i < 4 ? c.c(0) + i * ((c.e(0) - c.c(0)) / 4.2) : c.c(1) + (i - 4) * ((c.e(1) - c.c(1)) / 5.5);
      pop(el, t, t0, .5);
    });
  };
});

// ---------------------------------------------------------------- maint
scene('maint', (root, c) => {
  const g = svgLayer(root);
  // phase A: who cares about failures
  const A = s('g', {}, g);
  const ic = [Icons.factory(A, 370, 260, 1.5), Icons.plane(A, 840, 300, 1.4), Icons.plant(A, 1380, 260, 1.5)];
  const icl = ['工廠', '飛機', '發電廠'].map((tx, i) => svgText(A, [480, 960, 1480][i], 500, tx, { size: 34 }));
  const B = s('g', {}, g);
  const gear = Icons.gear(B, 760, 700, 80, { fill: 'var(--card)' });
  const meter = s('rect', { x: 880, y: 672, width: 340, height: 30, rx: 15, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3 }, B);
  const fill = s('rect', { x: 884, y: 676, width: 0, height: 22, rx: 11, fill: 'var(--orange)' }, B);
  const mtxt = svgText(B, 880, 650, '健康程度', { size: 26, anchor: 'start', fill: 'var(--mute)' });
  const qq = svgText(B, 1260, 690, '什麼時候該修？', { size: 46, anchor: 'start', family: 'LXGW WenKai TC' });
  // phase B: three strategies
  const cols = [
    { t: '壞了再修', e: 'Run-to-failure', icon: (sv) => Icons.broken(sv, 10, 0, 1), tags: [['✗ 突發停機', 't-red'], ['✗ 巨額損失', 't-red'], ['✗ 安全事故', 't-red']] },
    { t: '定期保養', e: 'Preventive', icon: (sv) => Icons.calendar(sv, 10, 4, 1), tags: [['✓ 比較安全', 't-green'], ['✗ 浪費健康零件', 't-orange']] },
    { t: '視情維修', e: 'Condition-based', icon: (sv) => Icons.pulse(sv, 6, 0, 1.05), tags: [['✓ 持續監測', 't-green'], ['✓ 需要時才修', 't-green']] },
  ];
  const cards = cols.map((cfg, i) => {
    const el = card(root, 150 + i * 560, 190, 500, 450, { pad: 30 });
    const sv = miniSvg(el, 140, 124, { margin: '0 auto 6px' }); cfg.icon(sv);
    h('div', { class: 'h2 center', text: cfg.t }, el);
    h('div', { class: 'small center en', text: cfg.e, style: { marginBottom: '18px' } }, el);
    const tg = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' } }, el);
    cfg.tags.forEach(([x, cl]) => h('span', { class: 'tag ' + cl, text: x, style: { fontSize: '28px' } }, tg));
    return el;
  });
  const arrows = [arrow(g, 665, 415, 695, 415, { w: 5 }), arrow(g, 1225, 415, 1255, 415, { w: 5 })];
  const phm = card(root, 960, 700, 1260, 0, { anchor: 'tc', pad: 22, style: { background: 'var(--green-soft)', borderColor: 'var(--green)' } });
  phm.innerHTML = '<div class="h3 center"><span class="en" style="font-weight:800">PHM</span> ＝ <span class="en">Prognostics and Health Management</span><br>預兆與健康管理</div>';
  return t => {
    const outA = c.c(2) - .1;
    ic.forEach((e, i) => show(e, t, c.c(0) + i * .5, .6, { out: outA }));
    icl.forEach((e, i) => show(e, t, c.c(0) + i * .5 + .3, .5, { out: outA }));
    show(gear, t, c.c(1), .5, { out: outA }); [meter, mtxt].forEach(e => show(e, t, c.c(1) + .2, .5, { out: outA }));
    fill.setAttribute('width', 332 * lerp(1, .32, Ease.inOut(P(t, c.c(1) + .4, 2.2))));
    fill.setAttribute('fill', P(t, c.c(1) + .4, 2.2) > .55 ? 'var(--red)' : 'var(--orange)');
    show(fill, t, c.c(1) + .2, .5, { out: outA });
    show(qq, t, c.c(1) + 1.6, .6, { out: outA });
    cards.forEach((el, i) => show(el, t, c.c(2 + i) + .1, .7, { dy: 40 }));
    arrows.forEach((a, i) => a.anim(t, c.c(3 + i), .4));
    show(phm, t, c.c(5), .7);
    const hl = P(t, c.c(5), .6);
    cards[2].style.borderColor = hl > 0 ? `rgb(${lerp(31, 46, hl)},${lerp(36, 158, hl)},${lerp(48, 79, hl)})` : '';
    cards[2].style.borderWidth = (3 + hl * 2) + 'px';
  };
});

// ---------------------------------------------------------------- rul
scene('rul', (root, c) => {
  const head = box(root, 150, 110, { class: 'h2', html: '剩餘使用壽命 <span class="en c-blue">RUL</span>' });
  const sub = box(root, 152, 180, { class: 'small en', text: 'Remaining Useful Life' });
  const g = svgLayer(root);
  const ax = axes(g, 150, 330, 1150, 500, { xlabel: '時間', ylabel: '健康指標（越高越糟）' });
  const r = rng(7);
  const noise = Array.from({ length: 401 }, () => (r() - .5) * .03);
  const hi = u => .12 + noise[Math.round(u * 400)] + (u > .36 ? .8 * Math.pow((u - .36) / .52, 2.1) : 0);
  const smooth = u => .12 + (u > .36 ? .8 * Math.pow((u - .36) / .52, 2.1) : 0);
  const thr = .82, uN = .66;
  let uF = .5; while (smooth(uF) < thr) uF += .001;
  const curve = path(g, fpath(hi, 0, uN, 260, ax.X, ax.Y), { stroke: 'var(--blue)', w: 4.5 });
  const ext = path(g, fpath(smooth, uN, uF, 60, ax.X, ax.Y), { stroke: 'var(--mute)', w: 4, dash: '8 10' });
  const thrL = line(g, ax.X(0), ax.Y(thr), ax.X(1), ax.Y(thr), { stroke: 'var(--red)', w: 3, dash: '14 10' });
  const thrT = svgText(g, ax.X(1) - 4, ax.Y(thr) - 22, '失效門檻', { size: 28, anchor: 'end', fill: 'var(--red)' });
  const xF = ax.X(uF), yF = ax.Y(thr);
  const cross = path(g, `M${xF - 16} ${yF - 16} L${xF + 16} ${yF + 16} M${xF + 16} ${yF - 16} L${xF - 16} ${yF + 16}`, { stroke: 'var(--red)', w: 7 });
  const nowL = line(g, ax.X(uN), ax.Y(0), ax.X(uN), ax.Y(.98), { stroke: 'var(--ink)', w: 3 });
  const nowT = svgText(g, ax.X(uN), ax.Y(0) + 38, '現在', { size: 30 });
  const failL = line(g, xF, ax.Y(0), xF, ax.Y(.98), { stroke: 'var(--red)', w: 3, dash: '6 8' });
  const failT = svgText(g, xF, ax.Y(0) + 38, '失效', { size: 30, fill: 'var(--red)' });
  const yb = ax.Y(.97);
  const br1 = arrow(g, (ax.X(uN) + xF) / 2, yb, ax.X(uN) + 4, yb, { stroke: 'var(--blue)', w: 5, head: 16 });
  const br2 = arrow(g, (ax.X(uN) + xF) / 2, yb, xF - 4, yb, { stroke: 'var(--blue)', w: 5, head: 16 });
  const brT = svgText(g, (ax.X(uN) + xF) / 2, yb - 34, 'RUL', { size: 38, fill: 'var(--blue)', family: 'Inter' });
  const band = s('rect', { x: xF - 120, y: ax.Y(.9), width: 90, height: ax.Y(0) - ax.Y(.9), fill: 'var(--green)', opacity: .16 }, g);
  band.parentNode.insertBefore(band, band.parentNode.firstChild);
  const wr = svgText(g, xF - 75, ax.Y(.45), '維修', { size: 30, fill: 'var(--green)' });
  const right = card(root, 1420, 330, 420, 0, { pad: 26 });
  right.innerHTML = `<div class="h3" style="margin-bottom:10px">定義</div><div style="font-size:34px">${tex('\\text{RUL} = t_{\\text{失效}} - t_{\\text{現在}}')}</div>`;
  const right2 = card(root, 1420, 580, 420, 0, { pad: 26 });
  right2.innerHTML = '<div class="h3" style="margin-bottom:12px">預測準確的話</div><div style="display:flex;flex-direction:column;gap:10px"><span class="tag t-green" style="font-size:28px">✓ 不浪費：零件用好用滿</span><span class="tag t-green" style="font-size:28px">✓ 不冒險：壞掉前就換</span></div>';
  return t => {
    show(head, t, c.c(0), .6); show(sub, t, c.c(0) + .3, .6);
    show(right, t, c.c(1), .6);
    ax.anim(t, c.c(2) - .2, .7);
    draw(curve, t, c.c(2) + .3, 3.2, { ease: Ease.lin });
    opacity(thrL, P(t, c.c(3), .4)); opacity(thrT, P(t, c.c(3) + .2, .4));
    opacity(ext, P(t, c.c(3) + .3, .6)); pop(cross, t, c.c(3) + .9, .4);
    draw(nowL, t, c.c(4), .5); opacity(nowT, P(t, c.c(4), .4));
    draw(failL, t, c.c(4) + .3, .5); opacity(failT, P(t, c.c(4) + .3, .4));
    br1.anim(t, c.c(4) + .8, .6); br2.anim(t, c.c(4) + .8, .6); pop(brT, t, c.c(4) + 1.2, .5);
    band.setAttribute('opacity', .16 * P(t, c.c(5), .5));
    pop(wr, t, c.c(5) + .3, .5);
    show(right2, t, c.c(5) + .5, .6);
  };
});

// ---------------------------------------------------------------- paradigms
scene('paradigms', (root, c) => {
  const head = box(root, 960, 110, { class: 'h2 center', text: '預測 RUL 的三條路線' }, 'tc');
  const mk = (i, title, en) => {
    const el = card(root, 130 + i * 570, 220, 520, 600, { pad: 28 });
    h('div', { class: 'h2 center', text: title }, el);
    h('div', { class: 'small center en', text: en, style: { marginBottom: '14px' } }, el);
    return el;
  };
  const c1 = mk(0, '模型導向', 'Model-based');
  const f1 = h('div', { class: 'center', html: tex('\\dfrac{da}{dN} = C\\,(\\Delta K)^m'), style: { fontSize: '36px', margin: '6px 0 4px' } }, c1);
  h('div', { class: 'small center', text: '例：裂紋成長（Paris 定律）', style: { marginBottom: '6px' } }, c1);
  const sv1 = miniSvg(c1, 460, 110, { margin: '0 auto' });
  s('rect', { x: 20, y: 20, width: 420, height: 70, rx: 8, fill: '#ece6d8', stroke: 'var(--ink)', 'stroke-width': 3 }, sv1);
  const crack = path(sv1, 'M230 20 L222 40 L238 52 L226 70 L236 90', { stroke: 'var(--red)', w: 4 });
  h('div', { class: 'body center', text: '物理方程式 ＋ 粒子濾波更新', style: { fontSize: '26px', margin: '6px 0 12px' } }, c1);
  const tg1 = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } }, c1);
  const tg1a = h('span', { class: 'tag t-green', text: '✓ 物理意義清楚、好解釋' }, tg1);
  const tg1b = h('span', { class: 'tag t-red', text: '✗ 複雜系統的失效機制難以掌握' }, tg1);

  const c2 = mk(1, '資料驅動', 'Data-driven');
  const sv2 = miniSvg(c2, 460, 200, { margin: '0 auto' });
  const r = rng(3);
  for (let i = 0; i < 26; i++) { const u = r(); s('circle', { cx: 40 + u * 380, cy: 170 - (u * u * 120 + (r() - .5) * 30), r: 6, fill: 'var(--blue)', opacity: .75 }, sv2); }
  const fit2 = path(sv2, fpath(u => u * u, 0, 1, 40, u => 40 + u * 380, v => 170 - v * 120), { stroke: 'var(--ink)', w: 4 });
  h('div', { class: 'body center', html: '從大量感測資料<br>學出「訊號 → 壽命」的關係', style: { fontSize: '27px', margin: '6px 0 14px' } }, c2);
  const tg2 = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } }, c2);
  h('span', { class: 'tag t-green', text: '✓ 不需完整物理模型' }, tg2);
  h('span', { class: 'tag t-orange', text: '△ 需要足夠的訓練資料' }, tg2);

  const c3 = mk(2, '混合法', 'Hybrid');
  const sv3 = miniSvg(c3, 460, 200, { margin: '0 auto' });
  s('circle', { cx: 185, cy: 100, r: 80, fill: 'var(--red-soft)', stroke: 'var(--ink)', 'stroke-width': 3, opacity: .9 }, sv3);
  s('circle', { cx: 275, cy: 100, r: 80, fill: 'var(--blue-soft)', stroke: 'var(--ink)', 'stroke-width': 3, opacity: .75 }, sv3);
  svgText(sv3, 150, 100, '物理', { size: 28 }); svgText(sv3, 310, 100, '資料', { size: 28 });
  h('div', { class: 'body center', html: '結合物理模型<br>與資料的優點', style: { fontSize: '27px', margin: '6px 0 14px' } }, c3);
  const tg3 = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } }, c3);
  h('span', { class: 'tag t-green', text: '✓ 截長補短' }, tg3);
  h('span', { class: 'tag t-orange', text: '△ 仍需要物理知識' }, tg3);

  const stamp = box(root, 1180, 225, { class: 'tag t-blue', text: '本論文', style: { fontSize: '34px', border: '3px solid var(--blue)' } });
  return t => {
    show(head, t, c.c(0), .6);
    show(c1, t, c.c(1), .7, { dy: 40 }); draw(crack, t, c.c(1) + .6, 1);
    show(tg1a, t, c.c(2), .5); show(tg1b, t, c.c(2) + .6, .5);
    show(c2, t, c.c(3), .7, { dy: 40 }); draw(fit2, t, c.c(3) + .6, 1.2);
    show(c3, t, c.c(4), .7, { dy: 40 });
    const k = Ease.inOut(P(t, c.c(5), .6));
    if (k > 0) {
      c1.style.opacity = 1 - .55 * k; c3.style.opacity = 1 - .55 * k;
      c2.style.transform = `scale(${1 + .04 * k})`;
    }
    c2.style.borderColor = k > 0 ? 'var(--blue)' : ''; c2.style.borderWidth = (3 + 2 * k) + 'px';
    pop(stamp, t, c.c(5) + .3, .5, { extra: ' rotate(8deg)' });
  };
});

// ---------------------------------------------------------------- failure data
scene('failure', (root, c) => {
  const head = box(root, 150, 120, { class: 'h2', html: '<span class="c-red">失效資料</span> <span class="en small">Failure data</span>' });
  const sub = box(root, 152, 196, { class: 'body c-mute', text: '最理想的教材：從開始運轉，一路記錄到真正故障' });
  const g = svgLayer(root);
  const x0 = 220, x1 = 1580, y = 640, life = 60;
  const X = tt => x0 + (x1 - x0) * tt / life;
  const bar = unitBar(g, x0, y, x1 - x0, 'fail', { w: 8 });
  const sens = path(g, fpath(u => .08 + .02 * Math.sin(u * 50) + (u > .45 ? Math.pow((u - .45) / .55, 2) * .7 : 0), 0, 1, 220, u => x0 + u * (x1 - x0), v => y - 40 - v * 300), { stroke: 'var(--ink)', w: 4 });
  const sl = svgText(g, x0 + 10, y - 110, '感測訊號', { size: 26, anchor: 'start', fill: 'var(--mute)' });
  const st = svgText(g, x0, y + 46, '開始運轉', { size: 28 });
  const ft = svgText(g, x1, y + 46, '故障', { size: 30, fill: 'var(--red)' });
  const samples = [10, 20, 30, 40, 50].map((tt, i) => {
    const grp = s('g', {}, g);
    line(grp, X(tt), y - 340, X(tt), y + 14, { stroke: 'var(--blue)', w: 2.5, dash: '5 7' });
    s('circle', { cx: X(tt), cy: y, r: 9, fill: 'var(--blue)' }, grp);
    s('rect', { x: X(tt) - 82, y: y + 66, width: 164, height: 52, rx: 12, fill: 'var(--blue-soft)', stroke: 'var(--blue)', 'stroke-width': 2.5 }, grp);
    svgText(grp, X(tt), y + 93, `RUL = ${life - tt}`, { size: 28, fill: 'var(--blue)', family: 'Inter' });
    svgText(grp, X(tt), y + 38, `t = ${tt}`, { size: 24, fill: 'var(--mute)', family: 'Inter' });
    return grp;
  });
  const ok = box(root, 960, 820, { class: 'tag t-green', text: '✓ 每個時間點都有「正確答案」', style: { fontSize: '30px' } }, 'tc');
  const costs = [['💰', '成本高'], ['⏳', '耗時長'], ['⚠', '有安全風險']].map(([ic, tx], i) =>
    box(root, 560 + i * 400, 820, { class: 'tag t-red', html: `<span style="font-family:'Noto Color Emoji'">${ic}</span> ${tx}`, style: { fontSize: '32px' } }, 'tc'));
  return t => {
    show(head, t, c.c(0), .6); show(sub, t, c.c(0) + .4, .6);
    bar.anim(t, c.c(1), 2.4); draw(sens, t, c.c(1), 2.4, { ease: Ease.lin });
    opacity(sl, P(t, c.c(1) + 1, .5)); opacity(st, P(t, c.c(1), .4)); opacity(ft, P(t, c.c(1) + 2.3, .4));
    samples.forEach((sm, i) => pop(sm, t, c.c(2) + .4 + i * .45, .45, { out: c.c(3) + 9 }));
    show(ok, t, c.c(2) + 2.8, .5, { out: c.c(3) - .2 });
    costs.forEach((e, i) => pop(e, t, c.c(3) + .9 + i * 1.1, .5));
  };
});

// ---------------------------------------------------------------- suspension data
scene('suspension', (root, c) => {
  const head = box(root, 150, 120, { class: 'h2', html: '<span class="c-teal">停機資料</span> <span class="en small">Suspension data</span>' });
  const g = svgLayer(root);
  const rows = [[1150, 1380, 's'], [1220, 1220, 'f'], [980, 1300, 's'], [1060, 1420, 's'], [900, 1150, 's'], [1300, 1300, 'f'], [1010, 1360, 's'], [870, 1240, 's']];
  const x0 = 240, y0 = 250, dy = 60;
  const glow = s('g', {}, g);
  const items = rows.map(([len, full, k], i) => {
    const y = y0 + i * dy;
    const lab = svgText(g, x0 - 40, y, `#${i + 1}`, { size: 24, fill: 'var(--mute)', family: 'Inter' });
    const gl = line(glow, x0, y, x0 + len, y, { stroke: 'var(--teal)', w: 22, attrs: { opacity: .18 } });
    const ub = unitBar(g, x0, y, len, k === 'f' ? 'fail' : 'susp');
    let ghost = null, q = null;
    if (k === 's') {
      ghost = line(g, x0 + len + 26, y, x0 + full, y, { stroke: 'var(--mute)', w: 4, dash: '4 12' });
      q = svgText(g, x0 + full + 24, y + 2, '?', { size: 40, fill: 'var(--mute)', family: 'LXGW WenKai TC' });
    }
    return { lab, ub, ghost, q, gl, k };
  });
  const firstS = items[0];
  const cutLab = svgText(g, x0 + 1150 + 40, y0 - 34, '拆下檢修', { size: 26, fill: 'var(--teal)' });
  const atleast = box(root, 1520, 300, { class: 'card', html: '<div class="h3">只知道：</div><div class="body">壽命 <b>≥</b> 停機時間<br><span class="c-mute">真正的壽命？不知道</span></div>', style: { padding: '22px 26px', width: '330px' } });
  const cens = card(root, 1040, 720, 780, 0, { pad: 22, style: { display: 'flex', gap: '20px', alignItems: 'center' } });
  const pv = miniSvg(cens, 120, 110); Icons.person(pv, 50, 82, .85); arrow(pv, 70, 60, 116, 60, { w: 4, head: 12 });
  h('div', { html: '<div class="h3" style="font-size:32px">右設限資料 <span class="en small">right-censored</span></div><div class="body" style="font-size:26px">像病人在研究結束前就退出追蹤</div>' }, cens);
  const cnt = box(root, 160, 760, { class: 'body', html: '<span class="tag t-red" style="font-size:30px">失效 2 台</span>&nbsp;&nbsp;<span class="tag t-teal" style="font-size:30px">停機 6 台</span>' });
  const val = box(root, 160, 830, { class: 'tag t-green', text: '✓ 停機資料也記錄了劣化趨勢', style: { fontSize: '28px' } });
  return t => {
    show(head, t, c.c(0), .6);
    items.forEach((it, i) => {
      const t0 = c.c(1) + i * .3;
      opacity(it.lab, P(t, t0, .3)); it.ub.anim(t, t0, 1.6);
      if (it.ghost) { opacity(it.ghost, P(t, c.c(2) + i * .12, .5)); pop(it.q, t, c.c(2) + .3 + i * .12, .4); }
      it.gl.style.opacity = it.k === 's' ? P(t, c.c(4) + .2, .6) : 0;
    });
    opacity(cutLab, P(t, c.c(1) + 1.8, .4) * (1 - P(t, c.c(2), .3)));
    show(atleast, t, c.c(2) + .8, .6, { out: c.c(3) + .1 });
    show(cens, t, c.c(3), .6);
    show(cnt, t, c.c(4), .5); show(val, t, c.c(4) + .7, .5);
  };
});

// ---------------------------------------------------------------- supervised
scene('supervised', (root, c) => {
  const head = box(root, 150, 120, { class: 'h2', text: '監督式學習：有標準答案的練習' });
  const left = card(root, 150, 230, 520, 400, { pad: 26 });
  h('div', { class: 'h3 center', text: '把它想成…', style: { marginBottom: '14px' } }, left);
  const lsv = miniSvg(left, 460, 270);
  s('rect', { x: 30, y: 10, width: 400, height: 240, rx: 14, fill: '#fff', stroke: 'var(--ink)', 'stroke-width': 3 }, lsv);
  line(lsv, 230, 10, 230, 250, { w: 3 });
  svgText(lsv, 130, 46, '題目 x', { size: 28 }); svgText(lsv, 330, 46, '答案 y', { size: 28, fill: 'var(--green)' });
  for (let i = 0; i < 4; i++) { line(lsv, 60, 90 + i * 42, 200, 90 + i * 42, { w: 3, stroke: 'var(--faint)' }); line(lsv, 260, 90 + i * 42, 400, 90 + i * 42, { w: 3, stroke: 'var(--green-soft)' }); }
  const flow = box(root, 150, 670, { class: 'body', html: `<div style="display:flex;align-items:center;gap:16px;font-size:30px"><span class="tag t-gray" style="font-size:28px">輸入 x</span>→<span class="tag t-purple" style="font-size:28px">模型 f</span>→<span class="tag t-green" style="font-size:28px">標籤 y</span></div>` });
  const tbl = h('table', { class: 'tb', style: { width: '100%' } });
  tbl.innerHTML = `<tr><th>來源</th><th>年齡</th><th>感測值<br><span class="small">目前</span></th><th>感測值<br><span class="small">前一次</span></th><th style="color:var(--blue)">RUL<br><span class="small">標籤</span></th></tr>` +
    [['失效 #1', '0.20', '2.83', '2.82', '0.80'], ['失效 #1', '0.60', '3.05', '2.98', '0.40'], ['失效 #2', '0.45', '2.90', '2.88', '0.55'], ['停機 #7', '0.50', '2.95', '2.91', '?'], ['停機 #8', '0.70', '3.20', '3.11', '?']]
      .map(r => `<tr>${r.map((x, j) => `<td class="${j === 0 ? (r[0].startsWith('失效') ? 'c-red' : 'c-teal') : 'en'}">${x}</td>`).join('')}</tr>`).join('');
  const tw = card(root, 740, 230, 1030, 0, { pad: 20 }); tw.appendChild(tbl);
  h('div', { class: 'small', text: '（示意數值，皆已正規化）', style: { marginTop: '6px', textAlign: 'right' } }, tw);
  const rows = [...tbl.querySelectorAll('tr')].slice(1);
  const reg = box(root, 740, 770, { class: 'tag t-purple', text: '答案是連續數字 → 迴歸（Regression）問題', style: { fontSize: '28px' } });
  const lab = box(root, 740, 840, { class: 'tag t-blue', text: '失效資料 → 有標籤（labeled）', style: { fontSize: '28px' } });
  const unl = box(root, 1260, 840, { class: 'tag t-teal', text: '停機資料 → 無標籤（unlabeled）', style: { fontSize: '28px' } });
  return t => {
    show(head, t, c.c(0), .6);
    show(left, t, c.c(1), .6); show(flow, t, c.c(1) + 1.6, .6);
    show(tw, t, c.c(2), .6);
    rows.forEach((r, i) => { r.style.opacity = P(t, c.c(2) + .3 + i * .25, .3); });
    show(reg, t, c.c(2) + 3.2, .5);
    const k3 = P(t, c.c(3), .4), k4 = P(t, c.c(4), .4);
    rows.slice(0, 3).forEach(r => { r.lastChild.style.background = `rgba(46,158,79,${.22 * k3})`; r.lastChild.style.fontWeight = k3 > .5 ? 800 : 500; });
    rows.slice(3).forEach(r => { r.lastChild.style.background = `rgba(15,157,138,${.22 * k4})`; r.lastChild.style.fontSize = (28 + 10 * k4) + 'px'; });
    show(lab, t, c.c(3) + .2, .5); show(unl, t, c.c(4) + .2, .5);
  };
});

// ---------------------------------------------------------------- semi-supervised
scene('semi', (root, c) => {
  const g = svgLayer(root);
  const head = box(root, 150, 120, { class: 'h2', text: '半監督學習' });
  const ax = axes(g, 170, 270, 700, 440, { xlabel: '輸入 x', ylabel: 'RUL' });
  const truth = u => .15 + .7 * Math.pow(u, 1.6);
  const tr = path(g, fpath(truth, 0, 1, 60, ax.X, ax.Y), { stroke: 'var(--faint)', w: 5, dash: '4 10' });
  const trT = svgText(g, ax.X(.93), ax.Y(truth(.93)) - 30, '真實關係', { size: 22, fill: 'var(--mute)', anchor: 'end' });
  const L = [.12, .3, .38, .55].map(u => [u, truth(u) + (u === .3 ? .05 : -.02)]);
  const lp = L.map(([u, v]) => s('circle', { cx: ax.X(u), cy: ax.Y(v), r: 11, fill: 'var(--blue)' }, g));
  const fitA = path(g, fpath(u => .12 + .78 * u * .62, 0, 1, 10, ax.X, ax.Y), { stroke: 'var(--blue)', w: 4 });
  const r = rng(11);
  const U = Array.from({ length: 22 }, () => r()).map(u => s('circle', { cx: ax.X(u), cy: ax.Y(0) - 26 - r() * 30, r: 9, fill: 'none', stroke: 'var(--teal)', 'stroke-width': 3.5 }, g));
  const lg1 = box(root, 200, 760, { class: 'tag t-blue', text: '● 有標籤（少）', style: { fontSize: '26px' } });
  const lg2 = box(root, 460, 760, { class: 'tag t-teal', text: '○ 無標籤（多，只有 x）', style: { fontSize: '26px' } });
  const eq = box(root, 520, 160, { class: 'body', html: '<b>少量有標籤</b> ＋ <b>大量無標籤</b> → 更好的模型' });
  // self-training loop on the right
  const cx = 1390, cy = 520, R = 220;
  const loopG = s('g', {}, g);
  const labels = ['① 訓練模型', '② 猜答案', '③ 挑有把握的', '④ 加入訓練集'];
  const angs = [-90, 0, 90, 180];
  const nodes = labels.map((tx, i) => {
    const a = angs[i] * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    const el = box(root, x, y, { class: 'tag t-gray', text: tx, style: { fontSize: '26px', background: 'var(--card)', border: '2.5px solid var(--ink)' } }, 'c');
    return el;
  });
  const arcs = angs.map((a0, i) => {
    const a = (a0 + 22) * Math.PI / 180, b = (a0 + 68) * Math.PI / 180;
    return arrow(loopG, cx + R * Math.cos(a), cy + R * Math.sin(a), cx + R * Math.cos(b), cy + R * Math.sin(b), { bend: -40, w: 4 });
  });
  const st = box(root, cx, cy, { class: 'h3 center', html: '自我訓練<br><span class="small en">self-training</span>' }, 'c');
  const ball = s('circle', { cx, cy, r: 10, fill: 'var(--red)', opacity: .85 }, g);
  const warn = box(root, cx, 820, { class: 'tag t-red', text: '猜錯 → 拿錯的答案教自己 → 越滾越大', style: { fontSize: '28px' } }, 'tc');
  return t => {
    show(head, t, c.c(0) - .2, .6);
    ax.anim(t, c.c(0), .6); opacity(tr, P(t, c.c(0) + .4, .5)); opacity(trT, P(t, c.c(0) + .6, .5));
    lp.forEach((p, i) => pop(p, t, c.c(0) + .6 + i * .2, .4));
    draw(fitA, t, c.c(0) + 1.6, .8); show(lg1, t, c.c(0) + .8, .5);
    U.forEach((p, i) => pop(p, t, c.c(1) + i * .07, .35)); show(lg2, t, c.c(1) + .6, .5); show(eq, t, c.c(1) + 1.6, .6);
    nodes.forEach((n, i) => pop(n, t, c.c(2) + i * .7, .45));
    arcs.forEach((a, i) => a.anim(t, c.c(2) + .3 + i * .7, .5)); show(st, t, c.c(2), .5);
    const k = P(t, c.c(3), 1);
    if (k > 0) {
      const ang = (-90 + (t - c.c(3)) * 140) * Math.PI / 180, rr = R - 70;
      ball.setAttribute('cx', cx + rr * Math.cos(ang)); ball.setAttribute('cy', cy + rr * Math.sin(ang));
      ball.setAttribute('r', 10 + Math.min(1, (t - c.c(3)) / 5.5) * 34);
    }
    opacity(ball, k * .85);
    show(warn, t, c.c(3) + .8, .5);
  };
});

// ---------------------------------------------------------------- prior work
scene('prior', (root, c) => {
  const head = box(root, 150, 120, { class: 'h2', text: '在這篇論文之前' });
  const A = card(root, 150, 220, 780, 430, { pad: 28 });
  h('div', { class: 'h3', text: '① 存活機率法', style: { marginBottom: '8px' } }, A);
  const sa = miniSvg(A, 700, 190);
  line(sa, 40, 170, 680, 170, { w: 3 }); line(sa, 40, 170, 40, 10, { w: 3 });
  const surv = path(sa, 'M40 25 H140 V45 H220 V70 H300 V100 H380 V118 H460 V140 H560 V158 H660', { stroke: 'var(--purple)', w: 4.5 });
  svgText(sa, 60, 12, '存活機率 S(t)', { size: 22, anchor: 'start', fill: 'var(--mute)', weight: 500 });
  svgText(sa, 670, 188, '時間', { size: 22, anchor: 'end', fill: 'var(--mute)', weight: 500 });
  h('div', { class: 'body', text: '網路輸出：還「活著」的機率', style: { margin: '10px 0' } }, A);
  const ta = h('span', { class: 'tag t-red', text: '✗ 機率 ≠ RUL，很難換算成實用的剩餘壽命', style: { fontSize: '26px' } }, A);
  const B = card(root, 990, 220, 780, 430, { pad: 28 });
  h('div', { class: 'h3', text: '② 壽命百分比法', style: { marginBottom: '8px' } }, B);
  const sb = miniSvg(B, 700, 120);
  s('rect', { x: 30, y: 30, width: 640, height: 56, rx: 28, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3 }, sb);
  const pb = s('rect', { x: 34, y: 34, width: 0, height: 48, rx: 24, fill: 'var(--orange-soft)' }, sb);
  const pt = svgText(sb, 350, 59, '已使用 0%', { size: 28 });
  h('div', { class: 'body', text: '網路輸出：已經用掉幾 % 的壽命', style: { margin: '10px 0' } }, B);
  const tb = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' } }, B);
  const tb1 = h('span', { class: 'tag t-red', text: '✗ 不分好壞，全部停機資料照單全收', style: { fontSize: '26px' } }, tb);
  const tb2 = h('span', { class: 'tag t-red', text: '✗ 估出的 RUL 可能 ≤ 0，不合理', style: { fontSize: '26px' } }, tb);
  const goal = card(root, 960, 700, 1100, 0, { anchor: 'tc', pad: 22, style: { background: 'var(--green-soft)', borderColor: 'var(--green)' } });
  goal.innerHTML = '<div class="h3 center">想要的方法：✓ 會挑選可靠的停機資料　✓ 直接輸出 RUL</div>';
  return t => {
    show(head, t, c.c(0), .6);
    show(A, t, c.c(1), .6); draw(surv, t, c.c(1) + .4, 1.4); show(ta, t, c.c(1) + 2.6, .5);
    show(B, t, c.c(2), .6);
    const k = Ease.inOut(P(t, c.c(2) + .4, 1.4)); pb.setAttribute('width', 632 * .65 * k); pt.textContent = `已使用 ${Math.round(65 * k)}%`;
    show(tb1, t, c.c(2) + 2.2, .5); show(tb2, t, c.c(2) + 4.2, .5);
    show(goal, t, c.c(3), .6);
  };
});

// ---------------------------------------------------------------- co-training
scene('cotrain', (root, c) => {
  const g = svgLayer(root);
  const head = box(root, 150, 110, { class: 'h2', html: '協同訓練 <span class="en small">Co-training</span>' });
  const tl = line(g, 260, 250, 1660, 250, { w: 4 });
  const ms = [[380, '1998', 'Blum & Mitchell', '協同訓練（分類）'], [960, '2005', '周志華、李明', 'COREG（迴歸）'], [1540, '2015', 'Hu 等人（本論文）', 'COPROG（壽命預測）']].map(([x, yr, who, what], i) => {
    const grp = s('g', {}, g);
    s('circle', { cx: x, cy: 250, r: 14, fill: i === 2 ? 'var(--yellow)' : 'var(--ink)', stroke: 'var(--ink)', 'stroke-width': 3 }, grp);
    svgText(grp, x, 212, yr, { size: 30, family: 'Inter' });
    svgText(grp, x, 292, who, { size: 26, weight: 500 });
    svgText(grp, x, 328, what, { size: 26, fill: i === 2 ? 'var(--purple)' : 'var(--mute)' });
    return grp;
  });
  const A = Icons.person(g, 380, 660, 1.3, 'var(--blue)', 'var(--blue-soft)');
  const B = Icons.person(g, 1540, 660, 1.3, 'var(--orange)', 'var(--orange-soft)');
  const la = svgText(g, 380, 740, '學生甲', { size: 32, fill: 'var(--blue)' });
  const lb = svgText(g, 1540, 740, '學生乙', { size: 32, fill: 'var(--orange)' });
  const book = s('g', {}, g);
  path(book, 'M880 560 L960 540 L1040 560 L1040 640 L960 620 L880 640 Z', { fill: 'var(--card)' });
  line(book, 960, 540, 960, 620, { w: 3 });
  svgText(book, 960, 672, '有答案的習題', { size: 26 });
  const ba = arrow(g, 860, 600, 470, 620, { w: 4, bend: 40 }), bb = arrow(g, 1060, 600, 1450, 620, { w: 4, bend: -40 });
  // exchanged sheets
  const sheet = (col) => { const e = s('g', {}, g); s('rect', { x: -30, y: -38, width: 60, height: 76, rx: 6, fill: '#fff', stroke: col, 'stroke-width': 4 }, e); path(e, 'M-16 -16 H16 M-16 0 H16 M-16 16 H6', { stroke: col, w: 3 }); return e; };
  const sa = sheet('var(--blue)'), sb = sheet('var(--orange)');
  const pa = path(g, 'M470 540 Q 960 380 1450 540', { stroke: 'var(--blue)', w: 3, dash: '6 10' });
  const pbp = path(g, 'M1450 690 Q 960 850 470 690', { stroke: 'var(--orange)', w: 3, dash: '6 10' });
  const cap = box(root, 960, 615, { class: 'card h3 center', html: '想法不同 → 錯誤不同 → 互相修正', style: { padding: '14px 26px', fontSize: '34px' } }, 'c');
  const big = box(root, 960, 615, { class: 'card center', html: '<div class="h1" style="font-size:68px"><span class="c-purple">CO</span>-training <span class="c-purple">PROG</span>nostics</div><div class="h3 c-mute">＝ COPROG：協同訓練 × 壽命預測</div>', style: { padding: '20px 40px', background: '#fffaf0' } }, 'c');
  const qb = (u, x0, y0, x1, y1, cxp, cyp) => { const v = 1 - u; return [v * v * x0 + 2 * v * u * cxp + u * u * x1, v * v * y0 + 2 * v * u * cyp + u * u * y1]; };
  return t => {
    show(head, t, c.c(0) - .3, .6);
    draw(tl, t, c.c(0), 1.2);
    show(ms[0], t, c.c(0) + .6, .5); show(ms[1], t, c.c(1), .5); show(ms[2], t, c.c(5) + .2, .5);
    [A, B].forEach(e => show(e, t, c.c(2), .6)); [la, lb].forEach(e => opacity(e, P(t, c.c(2) + .3, .4)));
    show(book, t, c.c(2) + .5, .5, { out: c.c(3) - .2 }); ba.anim(t, c.c(2) + 1, .6); bb.anim(t, c.c(2) + 1, .6);
    const bo = 1 - P(t, c.c(3) - .2, .4); [ba, bb].forEach(a => { a.style.opacity = bo; });
    const ex = P(t, c.c(3), .3) * (1 - P(t, c.c(5) - .3, .3));
    opacity(pa, ex * .8); opacity(pbp, ex * .8);
    const per = 2.4, u = ((t - c.c(3)) % per + per) % per / per;
    const ua = Ease.inOut(u);
    const [ax1, ay1] = qb(ua, 470, 540, 1450, 540, 960, 380), [bx1, by1] = qb(ua, 1450, 690, 470, 690, 960, 850);
    sa.setAttribute('transform', `translate(${ax1},${ay1})`); sb.setAttribute('transform', `translate(${bx1},${by1})`);
    opacity(sa, ex * Math.sin(Math.PI * u) * 1.4); opacity(sb, ex * Math.sin(Math.PI * u) * 1.4);
    show(cap, t, c.c(4), .5, { out: c.c(5) - .3 });
    pop(big, t, c.c(5), .6);
  };
});
