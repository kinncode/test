# Scene authoring guide

Each video scene is a function registered with `scene(id, builder)`. The builder runs once and builds DOM/SVG.
It returns `update(t)`, where `t` is the **local** scene time in seconds. Every visual property must be a pure
function of `t`: no timers, no CSS transitions or animations, and no state carried between frames.
Frames are rendered out of order by parallel workers, so any hidden state breaks the video.

```js
scene('my-id', (root, c) => {
  // c.c(i)  = start time of cue i (local seconds); c.e(i) = end of cue i; c.dur = scene length
  const head = box(root, 150, 110, { class: 'h2', text: '標題' });
  const g = svgLayer(root);                       // full-stage SVG layer (1920×1080 coordinates)
  ...
  return t => {
    show(head, t, c.c(0) - .2, .6);               // fade+slide in
    ...
  };
});
```

## Stage and layout
- The stage is 1920×1080. Paper background, ink lines, line-art style.
- A chapter pill sits top-left (y < 95) and a brand label top-right, so start headings at y ≈ 105–115.
- **Content must stay inside y ∈ [100, 900]**. Burned-in subtitles occupy the bottom (top edge ≈ 908 for 2-line cues).
- Left/right margins: x ≥ 140 and x ≤ 1790.
- The first scene of a chapter starts with a ~2.7 s chapter card that covers the scene. Make nothing appear before `c.c(0) - .3`.

## Engine API (see engine.js)
- DOM: `h(tag, props, parent)`; `box(root, x, y, props, anchor)` positions an absolute element (anchor `'tl'|'c'|'tc'|'cl'`).
  `card(root, x, y, w, h, {pad, anchor, style})` makes a white bordered card; `miniSvg(parent, w, h)` puts an SVG inside a card.
- SVG: `svgLayer(root)`, `s(tag, attrs, parent)`, `path(g, d, {stroke, w, dash, fill})`, `line(g, x1, y1, x2, y2, o)`,
  `arrow(g, x1, y1, x2, y2, {bend, w, stroke, head})` → `.anim(t, t0, d)`,
  `svgText(g, x, y, str, {size, anchor, fill, weight, family})`, `axes(...)`, `fpath(fn, u0, u1, n, X, Y)`.
- Charts: `chart(g, x, y, w, h, {xmin, xmax, ymin, ymax, xticks, yticks, xlabel, ylabel, fx, fy})` returns
  `{X, Y, anim(t, t0), plot(xs, ys, {color, w, dash}) → path, dot(x, y, {r, color}), vline(x), hline(y)}`.
  `barChart(root, g, x, y, w, h, groups, series, vmax, {step, ylabel, fmt, vfmt})` returns `.axis(t, t0)` and `.bar(gi, si, t, t0, d)`.
  `figCard(root, x, y, w, 'assets/<id>.png', '論文 Fig. x.x：…', anchor)` shows a cropped thesis figure.
- Formulas: `tex(latex, display)` returns KaTeX HTML. Put it inside a card: `el.innerHTML = tex('...', true)`.
- Animation per frame:
  - `show(el, t, t0, d, {dy, dx, s, out, outD})` fades/slides in, with an optional fade-out at `out`. `pop(el, t, t0, d)` scales in.
  - `draw(pathEl, t, t0, d, {ease, out})` draws a stroke on. `opacity(el, v)`.
  - `typeText(el, str, t, t0, cps)` types text; `countTo(el, v0, v1, t, t0, d, dec, suffix)` counts a number.
  - Easing: `P(t, t0, d)` returns 0..1 progress; `Ease.out/inOut/back`; `lerp`, `clamp`.
  - For HTML elements with an anchor, `show` keeps the anchor transform. For SVG elements, `show` wraps them in a `<g>`, so an element's own `transform` attribute is preserved.
- Icons: `Icons.gear/fan/factory/plane/plant/calendar/broken/pulse/person/wrench` (SVG line art).
- Deterministic randomness: `rng(seed)` and `gauss(r)`. Never use `Math.random()`.

## Data (data.js → `window.DATA`, computed from the thesis's own equations; see tools/make_data.py)
- `DATA.t`: days 0..1000 step 5. Main Weibull (α=425.31, β=2.88): `pdf, cdf, rel, haz`.
- Average cost curves on the same grid: `cost_expected`, `cost_neutral`, `cost_seeking`, `cost_aversion`
  (CPT curves include the λ factor; they reproduce Table 4.4 exactly).
- `DATA.opt.{expected,neutral,seeking,aversion} = {tau, cost, R}`:
  expected 256.85 d / 16,922.9 / 0.7914; seeking 266.4 / 29,243.6 / 0.7711; aversion 256.4 / 108,495.7 / 0.7923.
  The thesis rounds these to 257 / 266 / 256 days and reports R 0.7911 / 0.7720 / 0.7931. **Show the thesis's rounded numbers on screen.**
- `DATA.shapes['0.7'|'1.0'|'2.88'|'5.0'] = {pdf, haz}` give Weibull shapes (same α) for the background chapter.
- `DATA.vx` (0..1) with `DATA.value['0.5'|…|'1.4']` gives ν(x)=x^δ. `DATA.wp` with `DATA.weight['0.61'|'0.69'|'0.91'|'1.0']` gives the w(p) curves.
- `DATA.tk_x`/`DATA.tk_v` is the classic Tversky–Kahneman 1992 value function (α=0.88, λ=2.25) over gains and losses.
- `DATA.sens_cc` (Cc 0.8e7..3e7) with `DATA.tau_cc.{expected,'d0.97','d1.03','d0.8','d1.2'}` gives τ*(Cc).
  `DATA.sens_cp` (Cp 1e6..8e6) with `DATA.tau_cp.expected` gives τ*(Cp).
- Historical case: `DATA.hist_n` (monthly failures 6,11,11,37,47,48,100) and `DATA.hist_F` (empirical CDF).

## Style
- Colour tokens (CSS vars): `--ink --mute --blue --orange --red --teal --green --purple --yellow`, plus soft variants `--blue-soft` etc.
- Consistent colour meaning across the whole video:
  - expected / rational decision = **ink or blue**
  - risk-seeking = **orange**
  - risk-averse = **purple**
  - failure / CM = **red**
  - PM = **teal**
  - good / recommended = **green**
- Classes: `.h1 .h2 .h3 .body .small .tag .t-blue/.t-orange/.t-red/.t-teal/.t-green/.t-purple/.t-gray .pill .card .hl (highlight) .en (Inter font) .mono`.
- One idea per beat; reveal elements in sync with the cue that mentions them. Use the cue times `c.c(i)`.
- Values that are illustrative (not from the thesis) must be labelled 示意 on screen.
- Write Traditional Chinese (Taiwan) on screen. Use the thesis's notation (τ, C<sub>c</sub>, C<sub>p</sub>, δ, γ, λ, α, β).

## Self-check (required)
Render frames at the end of each cue and view them:
```bash
cd /home/user/test/cpt-maintenance-video
node tools/render.mjs snap <global seconds…>     # PNGs land in build/snap/t<sec>.png
```
A scene's global start time is `TIMING.scenes[i].start` in timing.js. Check every frame for:
- overlaps and clipped text;
- content below y=900 (subtitles);
- empty or ugly layouts;
- `ERR <id>` boxes, which mean your builder threw. The browser console error is printed by the snap command.

Fix and re-check until it is clean.

## Rules for parallel authors (important)
- **Edit only your own scene file.** Do not edit engine.js, style.css, data.js, index.html, timing.js, script.json, storyboard.md or other authors' files. Shared helpers you need go inside your own file.
- **Wrap your whole file in an IIFE** — `(() => { ... })();`. All scene files share one global scope, so a top-level `const`/`function` with a name another file also uses would crash the whole page.
- Read the narration (`script.json`) and the visual plan (`storyboard.md`) for your scene ids. Cue timings are in `timing.js`.
- `python3 tools/times.py <id> …` prints each scene's global start time and the global time of every cue's end. Snapshot those times.
- `node tools/render.mjs snap t1 t2 …` writes `build/snap/tNNNN.N.png`. View them with the Read tool, then fix and re-check.
  Check the end of every cue in every scene you own, plus a few mid-animation moments.
- The storyboard is a strong plan, not a contract. Simplify when a layout gets crowded, but keep every on-screen fact faithful to the thesis or to data.js.
- Values computed by us rather than printed in the thesis get a small grey tag 「我們重算」. Illustrative values get 「示意」.
- Cropped thesis figures are in assets/ (see figures.json for ids and captions). Do not crop new ones from PDF page 36 (it has reader handwriting).
