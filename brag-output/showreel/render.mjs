// Renders showreel.html: soundtrack via OfflineAudioContext -> WAV, frames at 60fps with 3 subframes
// blended by ffmpeg tmix for motion blur, then muxes the audio.
// usage: node render.mjs <playwright-core index.mjs> <out dir>
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const [pwPath, outDir] = process.argv.slice(2);
const { chromium } = await import(pwPath);
const here = path.dirname(fileURLToPath(import.meta.url));
const FPS = 60, SUB = 3, DUR = 15;

const b = await chromium.launch({ args: ['--force-device-scale-factor=1'] });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await pg.goto('file://' + path.join(here, 'showreel.html'));
await pg.evaluate(() => window.ready);

// ---------- soundtrack ----------
const wavB64 = await pg.evaluate(async () => {
  const SR = 48000, DUR = 15, BEAT = 0.5, ctx = new OfflineAudioContext(2, SR * DUR, SR);
  const master = ctx.createDynamicsCompressor(); master.threshold.value = -10; master.ratio.value = 4; master.connect(ctx.destination);
  const bus = ctx.createGain(); bus.gain.value = 0.8; bus.connect(master);
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const noiseBuf = ctx.createBuffer(1, SR * 2, SR); { const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; }
  const noise = (t, dur, type, freq, q, gain, decay) => {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + dur);
  };
  const kick = (t, amp) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.11);
    g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.45);
    noise(t, 0.02, 'highpass', 3000, 0.7, 0.25 * amp, 0.012);
  };
  const tone = (t, freq, type, dur, amp, cutoff) => {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = type; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.setValueAtTime(cutoff, t); f.frequency.exponentialRampToValueAtTime(Math.max(120, cutoff / 8), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(amp, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.02);
  };
  // kick on every beat, quiet hats on the off-beats
  for (let i = 0; i < 30; i++) { kick(i * BEAT, i % 4 === 0 ? 1.0 : 0.8); noise(i * BEAT + 0.25, 0.05, 'highpass', 8000, 0.7, i >= 20 && i < 24 ? 0.22 : 0.13, 0.04); }
  // a bass note on each bar (D minor)
  const ROOT = [73.42, 73.42, 58.27, 65.41, 73.42, 87.31, 98.0, 73.42];
  ROOT.forEach((f, bar) => { tone(bar * 2, f, 'triangle', 0.9, 0.35, 900); tone(bar * 2 + 1.0, f, 'triangle', 0.5, 0.22, 700); });
  // a hit on each scene change: a filtered noise slap, a low boom and a short chord stab
  const CH = { 2: [293.66, 349.23, 440, 523.25], 4: [233.08, 293.66, 349.23, 440], 6: [261.63, 329.63, 392, 493.88], 8: [293.66, 349.23, 440, 587.33], 10: [349.23, 440, 523.25, 659.25], 12: [293.66, 440, 587.33, 698.46], 14: [293.66, 369.99, 440, 587.33] };
  Object.keys(CH).forEach(k => {
    const t = +k, big = t === 12 ? 1.4 : 1;
    noise(t, 0.5, 'bandpass', 1800, 0.8, 0.5 * big, 0.3);
    tone(t, 55, 'sine', 0.7, 0.6 * big, 400);
    CH[k].forEach(f => tone(t, f, 'sawtooth', t === 14 ? 0.9 : 0.42, 0.06 * big, 4200));
  });
  // riser into the last full bar (10s to 12s), cut dead on the downbeat
  { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.5;
    f.frequency.setValueAtTime(300, 10); f.frequency.exponentialRampToValueAtTime(7000, 11.98);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, 10); g.gain.exponentialRampToValueAtTime(0.55, 11.97); g.gain.setValueAtTime(0.0001, 11.99);
    s.connect(f); f.connect(g); g.connect(bus); s.start(10); s.stop(12);
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110, 10); o.frequency.exponentialRampToValueAtTime(880, 11.98);
    const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, 10); og.gain.exponentialRampToValueAtTime(0.09, 11.97); og.gain.setValueAtTime(0.0001, 11.99);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000; o.connect(lp); lp.connect(og); og.connect(bus); o.start(10); o.stop(12); }
  // the pour back into the dot: a falling tone on the last half bar
  { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(880, 14.5); o.frequency.exponentialRampToValueAtTime(110, 14.85);
    g.gain.setValueAtTime(0.0001, 14.5); g.gain.exponentialRampToValueAtTime(0.18, 14.55); g.gain.exponentialRampToValueAtTime(0.0001, 14.9); o.connect(g); g.connect(bus); o.start(14.5); o.stop(14.95); }
  const buf = await ctx.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length, out = new DataView(new ArrayBuffer(44 + n * 4));
  let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const norm = peak > 0 ? 0.89 / peak : 1;
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); ws(8, 'WAVE'); ws(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
  out.setUint32(24, SR, true); out.setUint32(28, SR * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); ws(36, 'data'); out.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i] * norm)) * 32767, true); out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i] * norm)) * 32767, true); }
  const bytes = new Uint8Array(out.buffer); let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
});
writeFileSync(path.join(outDir, 'soundtrack.wav'), Buffer.from(wavB64, 'base64'));
console.log('soundtrack written');

// ---------- frames: 180 subframes per second, blended 3 at a time into 60fps ----------
const silent = path.join(outDir, 'video-silent.mp4');
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-c:v', 'mjpeg', '-i', '-',
  '-vf', `tmix=frames=${SUB}:weights='1 1 1',select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)`,
  '-r', String(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = DUR * FPS * SUB;
for (let i = 0; i < total; i++) {
  const t = i / (FPS * SUB);
  await pg.evaluate(t => window.seek(t), t);
  const jpg = await pg.screenshot({ type: 'jpeg', quality: 96 });
  if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 300 === 0) console.log('subframe', i, '/', total);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await b.close();
// ---------- mux ----------
await new Promise(r => spawn('ffmpeg', ['-v', 'error', '-y', '-i', silent, '-i', path.join(outDir, 'soundtrack.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', path.join(outDir, 'showreel.mp4')], { stdio: 'inherit' }).on('close', r));
console.log('done');
