// Render index.html frame-by-frame with Playwright and encode with FFmpeg.
//   node tools/render.mjs snap 12.5 40 88      -> build/snap/*.png (spot-check frames)
//   node tools/render.mjs video [workers]       -> out/cpt_maintenance_explainer.mp4
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json', '.m4a': 'audio/mp4' };

function serve() {
  return new Promise(res => {
    const srv = createServer(async (req, rsp) => {
      try {
        const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
        if (!p.startsWith(ROOT)) throw new Error('bad path');
        const body = await readFile(p);
        rsp.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); rsp.end(body);
      } catch { rsp.writeHead(404); rsp.end(); }
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?render=1`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  return page;
}

async function totalDuration() {
  const src = await readFile(path.join(ROOT, 'timing.js'), 'utf8');
  const json = JSON.parse(src.slice(src.indexOf('=') + 1).trim().replace(/;$/, ''));
  return { total: json.total, fps: json.fps };
}

async function snap(times) {
  const srv = await serve(); const port = srv.address().port;
  const browser = await chromium.launch();
  const page = await openPage(browser, port);
  const SNAP = process.env.SNAPDIR || 'build/snap';
  await mkdir(path.join(ROOT, SNAP), { recursive: true });
  for (const t of times) {
    await page.evaluate(t => window.seek(t), +t);
    await page.evaluate(() => document.fonts.ready);
    const f = path.join(ROOT, SNAP, `t${(+t).toFixed(1).padStart(6, '0')}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
  await browser.close(); srv.close();
}

async function renderChunk(browser, port, f0, f1, fps, out) {
  const page = await openPage(browser, port);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.seek(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 300 === 0) {
      const el = (Date.now() - t0) / 1000, k = f - f0;
      console.log(`[${path.basename(out)}] ${k}/${f1 - f0} frames, ${el.toFixed(0)}s, eta ${k ? ((f1 - f0 - k) * el / k).toFixed(0) : '?'}s`);
    }
  }
  ff.stdin.end(); await done; await page.close();
}

async function video(workers = 3) {
  const { total, fps } = await totalDuration();
  const N = Math.ceil(total * fps);
  const srv = await serve(); const port = srv.address().port;
  const browser = await chromium.launch();
  const dir = path.join(ROOT, 'build/chunks'); await rm(dir, { recursive: true, force: true }); await mkdir(dir, { recursive: true });
  const per = Math.ceil(N / workers), jobs = [], files = [];
  for (let i = 0; i < workers; i++) {
    const f0 = i * per, f1 = Math.min(N, f0 + per); if (f0 >= f1) break;
    const out = path.join(dir, `c${i}.mp4`); files.push(out);
    jobs.push(renderChunk(browser, port, f0, f1, fps, out));
  }
  await Promise.all(jobs);
  await browser.close(); srv.close();
  await writeFile(path.join(dir, 'list.txt'), files.map(f => `file '${f}'`).join('\n'));
  await mkdir(path.join(ROOT, 'out'), { recursive: true });
  const outFile = path.join(ROOT, 'out/cpt_maintenance_explainer.mp4');
  await new Promise((res, rej) => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'),
    '-i', path.join(ROOT, 'out/audio.m4a'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', outFile],
  { stdio: 'inherit' }).on('close', c => (c === 0 ? res() : rej(new Error('mux ' + c)))));
  console.log('wrote', outFile);
}

const [mode, ...args] = process.argv.slice(2);
if (mode === 'snap') await snap(args);
else if (mode === 'video') await video(+(args[0] || 3));
else console.log('usage: node tools/render.mjs snap <t...> | video [workers]');
