// Apple-style vertical Shorts renderer (1080x1920). Deterministic: frame(t) draws time t.
const W = 1080, H = 1920, LEAD = 0.3, TAIL = 1.4;
const F = '"Inter Display", "Inter", sans-serif', M = '"DejaVu Sans Mono", monospace';
const cl = x => x < 0 ? 0 : x > 1 ? 1 : x, eo = x => 1 - Math.pow(1 - cl(x), 3);
const eio = x => { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eb = x => { x = cl(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, p) => a + (b - a) * p;
let ctx, TM, SC, CFG, IMG = {}, KC = [], THUMBS = [];
const R = { segs: [], words: [], dur: 0, total: 0 };

function T(s, x, y, size, color, w = 700, a = 'center', ls = 0, font = F) { ctx.font = w + ' ' + size + 'px ' + font; ctx.textAlign = a; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.letterSpacing = ls + 'px'; ctx.fillText(s, x, y); ctx.letterSpacing = '0px'; }
function tw(s, size, w = 700, font = F, ls = 0) { ctx.font = w + ' ' + size + 'px ' + font; ctx.letterSpacing = ls + 'px'; const m = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return m; }
function GT(s, x, y, size, c1, c2, w = 700, a = 'center', ls = -2) { const m = tw(s, size, w, F, ls); const x0 = a === 'center' ? x - m / 2 : a === 'left' ? x : x - m; const g = ctx.createLinearGradient(x0, 0, x0 + m, 0); g.addColorStop(0, c1); g.addColorStop(1, c2); T(s, x, y, size, g, w, a, ls); }
function rr(x, y, w, h, r, f, stroke) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (f) { ctx.fillStyle = f; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } }
function glow(c, a, cx = W / 2, cy = H * 0.45, r = 900) { const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function cover(src, x, y, w, h, z = 1, ox = 0.5, oy = 0.5) { const sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height; const s = Math.max(w / sw, h / sh) * z; const dw = sw * s, dh = sh * s; ctx.drawImage(src, x + (w - dw) * ox, y + (h - dh) * oy, dw, dh); }
function card(src, cx, cy, w, h, o = {}) { const { a = 1, z = 1, r = 36, ox = 0.5, oy = 0.5, sh = true } = o; if (!src || a <= 0) return; ctx.save(); ctx.globalAlpha *= a; if (sh) { ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30; rr(cx - w / 2, cy - h / 2, w, h, r, '#000'); ctx.shadowColor = 'transparent'; } ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, r); ctx.clip(); cover(src, cx - w / 2, cy - h / 2, w, h, z, ox, oy); ctx.restore(); ctx.save(); ctx.globalAlpha *= a * 0.6; rr(cx - w / 2, cy - h / 2, w, h, r, null, 'rgba(255,255,255,.16)'); ctx.restore(); }
function panel(x, y, w, h, r = 36, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24; rr(x, y, w, h, r, '#141417'); ctx.shadowColor = 'transparent'; rr(x, y, w, h, r, null, 'rgba(255,255,255,.10)'); ctx.restore(); }
function pill(s, x, y, size, bg, fg, padX = 34, hh = null, w = 600) { const m = tw(s, size, w); const h = hh || size * 2.1; rr(x - m / 2 - padX, y - h / 2, m + padX * 2, h, h / 2, bg); T(s, x, y + 1, size, fg, w); return m + padX * 2; }
function inA(tt, at, d = 0.45) { return eo((tt - at) / d); }
function rise(p, dy = 40) { ctx.globalAlpha = p; ctx.translate(0, (1 - p) * dy); }
function check(x, y, s, c, p = 1) { ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); const pts = [[-0.4, 0], [-0.1, 0.3], [0.45, -0.35]]; ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s); const L1 = p < 0.4 ? p / 0.4 : 1; ctx.lineTo(x + lerp(pts[0][0], pts[1][0], L1) * s, y + lerp(pts[0][1], pts[1][1], L1) * s); if (p > 0.4) { const L2 = (p - 0.4) / 0.6; ctx.lineTo(x + lerp(pts[1][0], pts[2][0], L2) * s, y + lerp(pts[1][1], pts[2][1], L2) * s); } ctx.stroke(); ctx.restore(); }
function typed(s, t0, tt, cps = 22) { const n = Math.floor(Math.max(0, tt - t0) * cps); return s.slice(0, n); }
function caret(x, y, h, tt, c = '#fff') { if (Math.floor(tt * 2) % 2) return; rr(x + 6, y - h / 2, 5, h, 2, c); }
function wrap(s, maxW, size, w = 600, font = F) { const words = s.split(' '); const lines = []; let cur = ''; for (const x of words) { const t2 = cur ? cur + ' ' + x : x; if (tw(t2, size, w, font) > maxW && cur) { lines.push(cur); cur = x; } else cur = t2; } if (cur) lines.push(cur); return lines; }
// time of word (prefix match) within segment i, relative to segment start
function wt(i, w) { const s = R.segs[i]; for (const x of R.words) { if (x.a >= s.a - 0.01 && x.a <= s.b + 0.01 && x.k.startsWith(w.toLowerCase())) return x.a - s.a; } return 0; }
function level(t) { const e = TM.env; const i = Math.floor((t - LEAD) * 30); return i >= 0 && i < e.length ? e[i] : 0; }

function brand(t) { const a = cl(t / 0.5) * (1 - cl((t - (R.total - 0.3)) / 0.3)); ctx.save(); ctx.globalAlpha = a; const B = CFG.brand; rr(64, 112, 64, 64, 18, B.mark); T(B.markText, 96, 145, 30, '#000', 800); T(B.name, 148, 145, 34, '#fff', 700, 'left'); T(B.right, W - 64, 145, 26, 'rgba(255,255,255,.5)', 500, 'right', 3, M); ctx.restore(); }
function buildCaps() { const caps = []; let cur = []; const flush = () => { if (cur.length) caps.push(cur); cur = []; }; let si = 0; for (const w of R.words) { while (si < R.segs.length - 1 && w.a >= R.segs[si + 1].a - 0.01) { si++; flush(); } const len = cur.map(x => x.w).join(' ').length; if (cur.length && (len + w.w.length > 20)) flush(); cur.push(w); if (/[.,:?!]$/.test(w.w) && cur.length >= 2) flush(); } flush(); return caps; }
function captions(t) { if (CFG.noCapsFrom != null && t >= R.segs[CFG.noCapsFrom].a - 0.1) return; const i = R.caps.findIndex((c, k) => t >= c[0].a - 0.08 && (k + 1 >= R.caps.length ? t < c[c.length - 1].b + 0.4 : t < R.caps[k + 1][0].a - 0.08)); if (i < 0) return; const c = R.caps[i]; const size = 66; const line = c.map(x => x.w).join(' '); const full = tw(line, size, 800); let x = W / 2 - full / 2; const y = 1590; const p = eo((t - c[0].a + 0.08) / 0.18); ctx.save(); ctx.globalAlpha = p; ctx.translate(0, (1 - p) * 14); ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 24; for (const w of c) { const on = t >= w.a - 0.03; T(w.w, x, y, size, on ? '#fff' : 'rgba(255,255,255,.38)', 800, 'left'); x += tw(w.w + ' ', size, 800); } ctx.restore(); }

function frame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = R.segs.length - 1; while (i > 0 && t < R.segs[i].a - 0.15) i--;
  const draw = (k, alpha, sc) => { const s = R.segs[k]; const tt = t - (s.a - 0.15); const d = (k + 1 < R.segs.length ? R.segs[k + 1].a : R.total) - s.a; ctx.save(); ctx.globalAlpha = alpha; ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2); SC[k](tt, d, t); ctx.restore(); };
  const tt = t - (R.segs[i].a - 0.15); const p = eo(tt / 0.4);
  if (i > 0 && tt < 0.4) draw(i - 1, 1 - p, 1 + 0.04 * p);
  draw(i, i === 0 ? 1 : p, 1 + 0.03 * (1 - p));
  if (CFG.news) { ticker(t, CFG.news); live(t); } brand(t); captions(t); if (CFG.tail && typeof tailCta === 'function') tailCta(t);
  if (t > R.total - 0.35) { ctx.globalAlpha = cl((t - (R.total - 0.35)) / 0.35); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
const loadImg = src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => no(src); im.src = src; });
async function setup(name, timing, cfgs) {
  await document.fonts.load('700 40px "Inter Display"'); await document.fonts.load('800 40px "Inter Display"'); await document.fonts.load('500 40px "DejaVu Sans Mono"');
  const cv = document.getElementById('c'); ctx = cv.getContext('2d'); TM = timing; CFG = cfgs[name];
  R.segs = timing.segs.map(s => ({ a: s.a + LEAD, b: s.b + LEAD })); R.words = timing.words.map(w => ({ w: w.w, k: w.w.toLowerCase().replace(/^[^a-z0-9]+/, ''), a: w.a + LEAD, b: w.b + LEAD })); R.dur = timing.dur; R.total = timing.dur + LEAD + TAIL; R.caps = buildCaps();
  for (const k of ['kitten', 'sphere', 'x3', 'x4', 'x5']) IMG[k] = await loadImg('img/l2_' + k + '.jpg');
  if (CFG.kc) { KC = []; for (let n = 1; n <= 121; n++) KC.push(await loadImg('img/kc_' + String(n).padStart(3, '0') + '.jpg')); }
  THUMBS = []; const srcs = ['x3', 'x4', 'sphere', 'kitten', 'x5']; for (let n = 0; n < 30; n++) { const c = document.createElement('canvas'); c.width = c.height = 120; const g = c.getContext('2d'); const im = IMG[srcs[n % 5]]; const z = 1 + (n * 37 % 10) / 4; const sw = 1080 / z; const sx = (n * 211 % 1000) / 1000 * (1920 - sw), sy = (n * 97 % 1000) / 1000 * (1080 - sw); g.drawImage(im, sx, sy, sw, sw, 0, 0, 120, 120); g.fillStyle = `hsla(${n * 47 % 360},60%,50%,.18)`; g.fillRect(0, 0, 120, 120); THUMBS.push(c); }
  if (CFG.imgs) { for (const k of CFG.imgs) BR[k] = await loadImg('img/news_' + k + '.jpg'); AF = []; for (let n = 1; n <= (window.AFN || 0); n++) AF.push(await loadImg('img/af_' + String(n).padStart(3, '0') + '.jpg')); } if (CFG.vids) { for (const k of CFG.vids) { MV[k] = []; for (let n = 1; n <= 200; n++) { try { MV[k].push(await loadImg('img/mv_' + k + '_' + String(n).padStart(3, '0') + '.jpg')); } catch (e) { break; } } } } if (CFG.prep) CFG.prep(); SC = CFG.scenes; return { total: R.total, segs: R.segs.map(s => s.a.toFixed(2)) };
}
