// Punchy electronic soundtrack for "Water finds its shape", written with the Web Audio API.
// 120 BPM, D minor, 18 s (two-bar outro on the Market Movers lockup). Rendered offline to a 16-bit stereo WAV (returned as base64).
window.makeSoundtrack = async function () {
  const SR = 48000, DUR = 18, B = 0.5, S16 = B / 4, BEATS = 36;
  const ctx = new OfflineAudioContext(2, SR * DUR, SR);

  // ---- master: glue compressor, then a gentle soft clip for loudness ----
  const clip = ctx.createWaveShaper(); { const n = 2048, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(1.6 * x) / Math.tanh(1.6); } clip.curve = c; }
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.12;
  comp.connect(clip); clip.connect(ctx.destination);
  const drums = ctx.createGain(); drums.gain.value = 0.6; drums.connect(comp);
  // everything melodic goes through a bus that ducks on every kick (sidechain pump)
  const synth = ctx.createGain(); synth.gain.value = 1; const synthOut = ctx.createGain(); synthOut.gain.value = 2.4; synth.connect(synthOut); synthOut.connect(comp);
  for (let i = 0; i < BEATS; i++) { const t = i * B; synth.gain.setValueAtTime(0.28, t); synth.gain.setTargetAtTime(1, t + 0.02, 0.06); }
  // stereo widener for the leads: a short delay on the right
  const wideL = ctx.createGain(), wideR = ctx.createDelay(); wideR.delayTime.value = 0.012;
  const merge = ctx.createChannelMerger(2); wideL.connect(merge, 0, 0); wideR.connect(merge, 0, 1); merge.connect(synth);
  const wide = ctx.createGain(); wide.connect(wideL); wide.connect(wideR);

  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const noiseBuf = ctx.createBuffer(1, SR * 2, SR); { const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; }
  const env = (g, t, a, peak, d, end = 0.0001) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(end, t + a + d); };
  function noise(t, dur, type, f, q, peak, decay, dest = drums, a = 0.001) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = ctx.createGain(); env(g, t, a, peak, decay); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, rnd()); s.stop(t + dur);
  }
  const dist = ctx.createWaveShaper(); { const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(3 * x); } dist.curve = c; } dist.connect(drums);

  // ---- drums ----
  function kick(t, amp) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine";
    o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.09); o.frequency.exponentialRampToValueAtTime(40, t + 0.3);
    env(g, t, 0.002, amp, 0.38); o.connect(g); g.connect(dist); o.start(t); o.stop(t + 0.42);
    noise(t, 0.02, "highpass", 2500, 0.7, 0.35 * amp, 0.015);
  }
  function clap(t, amp) { for (let k = 0; k < 3; k++) noise(t + k * 0.011, 0.05, "bandpass", 1600, 1.2, 0.5 * amp, 0.03); noise(t + 0.03, 0.3, "bandpass", 1400, 0.9, 0.35 * amp, 0.2); }
  function hat(t, amp, open) { noise(t, open ? 0.25 : 0.05, "highpass", open ? 7000 : 9000, 0.8, amp, open ? 0.18 : 0.035); }
  function snare(t, amp) { noise(t, 0.2, "bandpass", 2200, 0.8, amp, 0.12); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.06); env(g, t, 0.001, amp * 0.5, 0.09); o.connect(g); g.connect(drums); o.start(t); o.stop(t + 0.12); }

  for (let i = 0; i < BEATS; i++) {
    const t = i * B;
    kick(t, i % 4 === 0 ? 1.0 : 0.88);
    if (i >= 4 && i % 2 === 1 && !(i >= 20 && i < 24)) clap(t, i >= 24 ? 1.0 : 0.8);
    if (i >= 4) { for (let k = 0; k < 4; k++) if (k !== 2) hat(t + k * S16, k % 2 ? 0.16 : 0.1, false); hat(t + 2 * S16, 0.2, true); }
    else hat(t + 2 * S16, 0.12, false);
  }
  // build: snare roll 8ths, 16ths, then 32nds into the drop at 12 s
  for (let t = 10; t < 11; t += B / 2) snare(t, 0.25 + (t - 10) * 0.15);
  for (let t = 11; t < 11.5; t += S16) snare(t, 0.4 + (t - 11) * 0.4);
  for (let t = 11.5; t < 11.98; t += S16 / 2) snare(t, 0.55 + (t - 11.5) * 0.7);

  // ---- harmony: D minor, one chord per bar ----
  const mid = n => 440 * Math.pow(2, (n - 69) / 12);
  const CHORDS = [[50, 53, 57], [50, 53, 57], [46, 50, 53], [48, 52, 55], [50, 53, 57], [53, 57, 60], [50, 53, 57], [46, 50, 53], [50, 53, 57]]; // Dm Dm Bb C Dm F Dm Bb Dm
  const chordAt = t => CHORDS[Math.min(8, Math.floor(t / 2))];

  // offbeat pumping saw bass from bar 2, opening its filter through the build
  function bass(t, note, dur, cutoff, amp) {
    const g = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = 6;
    f.frequency.setValueAtTime(cutoff * 3, t); f.frequency.exponentialRampToValueAtTime(cutoff, t + 0.12);
    [0, 7].forEach(det => { const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = mid(note); o.detune.value = det; o.connect(f); o.start(t); o.stop(t + dur + 0.02); });
    const sub = ctx.createOscillator(); sub.type = "sine"; sub.frequency.value = mid(note - 12); sub.connect(g); sub.start(t); sub.stop(t + dur + 0.02);
    env(g, t, 0.004, amp, dur); f.connect(g); g.connect(synth);
  }
  for (let i = 4; i < BEATS - 1; i++) {
    const t = i * B + B / 2, root = chordAt(t)[0] - 12, build = t >= 10 && t < 12 ? (t - 10) / 2 : 0, drop = t >= 12 ? 1 : 0;
    bass(t, root, B / 2 - 0.02, 340 + 1600 * build + 1000 * drop, 0.6 + 0.2 * drop);
  }
  // 16th-note square arp over the chord, bars 3 to 7
  const arpOrder = [0, 1, 2, 3, 2, 1, 0, 2];
  for (let t = 4; t < 17.5; t += S16) {
    if (t >= 11.75 && t < 12) continue;
    const ch = chordAt(t), idx = Math.round((t - 4) / S16), n = ch[arpOrder[idx % 8] % 3] + 12 + (arpOrder[idx % 8] === 3 ? 12 : 0);
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = "square"; o.frequency.value = mid(n);
    f.type = "lowpass"; f.Q.value = 3; f.frequency.setValueAtTime(t >= 16 ? 5200 - (t - 16) * 2400 : t >= 12 ? 5200 : 1800 + (t - 4) * 260, t); f.frequency.exponentialRampToValueAtTime(600, t + 0.1);
    env(g, t, 0.003, t >= 12 ? 0.11 : 0.08, 0.11); o.connect(f); f.connect(g); g.connect(wide); o.start(t); o.stop(t + 0.14);
  }
  // supersaw chord stabs on every scene change, held longer on the drop and the end
  function stab(t, notes, dur, amp, cutoff) {
    const f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = "lowpass"; f.Q.value = 1.5;
    f.frequency.setValueAtTime(cutoff, t); f.frequency.exponentialRampToValueAtTime(Math.max(400, cutoff / 6), t + dur);
    notes.forEach(n => [-18, -9, 0, 9, 18].forEach(d => { const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = mid(n); o.detune.value = d; o.connect(f); o.start(t); o.stop(t + dur + 0.03); }));
    env(g, t, 0.004, amp, dur); f.connect(g); g.connect(wide);
  }
  [2, 4, 6, 8, 10].forEach(t => { const c = chordAt(t); stab(t, [c[0] + 12, c[1] + 12, c[2] + 12, c[0] + 24], 0.34, 0.09, 6500); noise(t, 0.4, "bandpass", 1800, 0.7, 0.35, 0.22); });
  // the drop: big stab, sub boom, crash
  stab(12, [62, 65, 69, 74, 77], 0.95, 0.15, 10000);
  { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(90, 12); o.frequency.exponentialRampToValueAtTime(38, 12.5); env(g, 12, 0.003, 0.9, 0.9); o.connect(g); g.connect(drums); o.start(12); o.stop(13); }
  noise(12, 1.6, "highpass", 5000, 0.5, 0.35, 1.4);
  [12.75, 13.25, 13.75].forEach(t => stab(t, [62, 65, 69, 74], 0.2, 0.085, 7500));
  // end title stab, then the outro: a stab as the ranges land, and a last held chord on the final beat
  stab(14, [62, 65, 69, 74, 81], 0.5, 0.13, 9500);
  stab(16, [58, 62, 65, 70, 77], 0.42, 0.11, 8000);
  [15, 16.5, 17].forEach(t => { const c = chordAt(t); stab(t, [c[0] + 12, c[1] + 12, c[2] + 12], 0.16, 0.06, 6000); });
  stab(17.5, [50, 62, 65, 69, 74, 81], 0.48, 0.16, 11000);
  { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(80, 17.5); o.frequency.exponentialRampToValueAtTime(36, 17.95); env(g, 17.5, 0.003, 0.8, 0.47); o.connect(g); g.connect(drums); o.start(17.5); o.stop(17.99); }
  noise(17.5, 0.49, "highpass", 5000, 0.5, 0.3, 0.46);

  // ---- ear candy that follows the picture ----
  // a laser zap for every brand that flashes through the pipe
  [2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5].forEach((t, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "square"; o.frequency.setValueAtTime(2400 - i * 120, t); o.frequency.exponentialRampToValueAtTime(220, t + 0.09);
    env(g, t, 0.002, 0.1, 0.1); o.connect(g); g.connect(wide); o.start(t); o.stop(t + 0.12);
  });
  // whoosh into the push through the O, the zoom into the bore and the counter
  [[3.78, 4.0], [7.5, 7.98]].forEach(([a, b]) => { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 3; f.frequency.setValueAtTime(400, a); f.frequency.exponentialRampToValueAtTime(6000, b); const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, a); g.gain.exponentialRampToValueAtTime(0.4, b - 0.01); g.gain.setValueAtTime(0.0001, b); s.connect(f); f.connect(g); g.connect(drums); s.start(a); s.stop(b); });
  // counter ticks as it runs to 13, rising in pitch
  for (let n = 1; n <= 13; n++) {
    const x = n < 13 ? -Math.log2(1 - n / 13) / 10 : 1, t = 8.5 + Math.min(1, x) * 0.42;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.value = mid(74 + n); env(g, t, 0.002, 0.07, 0.05); o.connect(g); g.connect(wide); o.start(t); o.stop(t + 0.07);
  }
  // the riser: filtered noise and a climbing saw, cut dead on the drop
  { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 2.5;
    f.frequency.setValueAtTime(300, 10); f.frequency.exponentialRampToValueAtTime(9000, 11.98);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, 10); g.gain.exponentialRampToValueAtTime(0.5, 11.97); g.gain.exponentialRampToValueAtTime(0.0001, 11.995);
    s.connect(f); f.connect(g); g.connect(drums); s.start(10); s.stop(12);
    const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(110, 10); o.frequency.exponentialRampToValueAtTime(1320, 11.98);
    const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, 10); og.gain.exponentialRampToValueAtTime(0.07, 11.97); og.gain.exponentialRampToValueAtTime(0.0001, 11.995); o.connect(og); og.connect(wide); o.start(10); o.stop(12); }

  // ---- render and encode ----
  const buf = await ctx.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length, out = new DataView(new ArrayBuffer(44 + n * 4));
  let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const norm = peak > 0 ? 0.8 / peak : 1; // about -2 dBFS sample peak, under 0 dB true peak
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, "RIFF"); out.setUint32(4, 36 + n * 4, true); ws(8, "WAVE"); ws(12, "fmt "); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
  out.setUint32(24, SR, true); out.setUint32(28, SR * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); ws(36, "data"); out.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i] * norm)) * 32767, true); out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i] * norm)) * 32767, true); }
  const bytes = new Uint8Array(out.buffer); let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
