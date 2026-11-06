// node render.js <workdir> — берёт workdir/spec.json, timing.json, mix.wav, img/news_*.jpg; пишет workdir/video.mp4
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const W = path.resolve(process.argv[2]); const R = __dirname;
(async () => {
  const spec = JSON.parse(fs.readFileSync(W + '/spec.json')); const timing = JSON.parse(fs.readFileSync(W + '/timing.json'));
  fs.writeFileSync(R + '/spec.js', 'window.__SPEC=' + JSON.stringify(spec) + ';');
  for (const f of fs.readdirSync(W + '/img')) fs.copyFileSync(W + '/img/' + f, R + '/img/' + f);
  const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file://' + R + '/render.html');
  const info = await p.evaluate(([t]) => setup('job', t, CFGS), [timing]);
  const fps = 30, N = Math.ceil(info.total * fps);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-i', W + '/mix.wav', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', W + '/video.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) { const d = await p.evaluate((t) => { frame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, i / fps); if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close(); console.log('ok', W + '/video.mp4', info.total);
})();
