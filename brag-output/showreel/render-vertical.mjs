// Renders showreel-vertical.html (1080x1920) for Instagram: soundtrack.js -> WAV, frames at 60fps with
// 3 subframes blended by ffmpeg tmix for motion blur, then muxes the audio.
// usage: node render-vertical.mjs <playwright-core index.mjs> <out dir> [audio-only]
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const [pwPath, outDir, mode] = process.argv.slice(2);
const { chromium } = await import(pwPath);
const here = path.dirname(fileURLToPath(import.meta.url));
const FPS = 60, SUB = 3, DUR = 15, W = 1080, H = 1920;

const b = await chromium.launch({ args: ['--force-device-scale-factor=1', '--autoplay-policy=no-user-gesture-required'] });
const pg = await b.newPage({ viewport: { width: W, height: H } });
await pg.goto('file://' + path.join(here, 'showreel-vertical.html'));
await pg.evaluate(() => window.ready);
await pg.addScriptTag({ path: path.join(here, 'soundtrack.js') });
const wav = path.join(outDir, 'soundtrack-vertical.wav');
writeFileSync(wav, Buffer.from(await pg.evaluate(() => window.makeSoundtrack()), 'base64'));
console.log('soundtrack written');
if (mode === 'audio-only') { await b.close(); process.exit(0); }

const silent = path.join(outDir, 'video-vertical-silent.mp4');
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-c:v', 'mjpeg', '-i', '-',
  '-vf', `tmix=frames=${SUB}:weights='1 1 1',select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)`,
  '-r', String(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = DUR * FPS * SUB;
for (let i = 0; i < total; i++) {
  await pg.evaluate(t => window.seek(t), i / (FPS * SUB));
  const jpg = await pg.screenshot({ type: 'jpeg', quality: 96 });
  if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 300 === 0) console.log('subframe', i, '/', total);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await b.close();
await new Promise(r => spawn('ffmpeg', ['-v', 'error', '-y', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', path.join(outDir, 'showreel-vertical.mp4')], { stdio: 'inherit' }).on('close', r));
console.log('done');
