"""Original soundtracks for the two Nutan Varsh reels, synthesised from the same timings the animations use.

usage: python make_audio.py chopda   -> chopda/assets/audio/chopda.wav   (pad, bass, santoor and bells melody, kick, clap, dholak, fireworks)
       python make_audio.py drop     -> drop/assets/audio/drop.wav       (rain, water, pad, bass, santoor and bells melody, light groove)
Needs numpy. 120 BPM (a beat every 0.5 s), Sa = D, raag Bhupali (S R G P D) so everything is consonant.
"""
import os, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MODE = sys.argv[1]
SR, DUR, BEAT = 44100, 16.0, 0.5
N = int(SR * DUR)
rng = np.random.default_rng(83)
L = np.zeros(N); R = np.zeros(N)       # dry mix
WL = np.zeros(N); WR = np.zeros(N)     # reverb send
SA = 293.66
RAT = {"P.": 0.75, "D.": 5 / 6, "S": 1, "R": 9 / 8, "G": 5 / 4, "P": 1.5, "D": 5 / 3, "S'": 2, "R'": 2.25, "G'": 2.5, "P'": 3.0}


def put(sig, t, pan=0.5, gain=1.0, wet=0.25):
    i0 = int(round(t * SR))
    if i0 >= N or i0 < 0:
        return
    j = min(N, i0 + len(sig)); s = sig[: j - i0] * gain
    l, r = np.cos(pan * np.pi / 2) * 1.414, np.sin(pan * np.pi / 2) * 1.414
    L[i0:j] += s * l; R[i0:j] += s * r; WL[i0:j] += s * l * wet; WR[i0:j] += s * r * wet


def tt(length):
    return np.arange(int(SR * length)) / SR


def band_noise(length, lo, hi):
    n = int(SR * length); spec = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    x = np.fft.irfft(spec, n)
    return x / (np.max(np.abs(x)) + 1e-9)


def santoor(freq, length=1.6, bright=1.0):
    t = tt(length); s = np.zeros(len(t))
    for det in (1.0, 1.003, 0.998):                      # three strings per note, slightly detuned
        for k in range(1, 9):
            s += np.sin(2 * np.pi * freq * det * k * t + rng.uniform(0, 6)) * np.exp(-t * (2.2 + 1.5 * k)) * bright ** (k - 1) / k
    s[: int(0.004 * SR)] += band_noise(0.004, 2000, 9000) * 0.5   # hammer
    return s / np.max(np.abs(s))


def bell(f0, length=5.0, bright=1.0):
    r = [0.5, 1, 1.183, 1.506, 2, 2.514, 2.662, 3.011, 4.166, 5.433]
    a = [0.55, 1, 0.6, 0.5, 0.45, 0.35, 0.3, 0.25, 0.18 * bright, 0.12 * bright]
    d = [5.5, 4.2, 3.4, 2.8, 2.3, 1.9, 1.7, 1.4, 0.9, 0.6]
    t = tt(length); s = np.zeros(len(t))
    for x, am, dc in zip(r, a, d):
        s += am * np.sin(2 * np.pi * f0 * x * t + rng.uniform(0, 6)) * np.exp(-t / dc) + 0.5 * am * np.sin(2 * np.pi * f0 * x * 1.0025 * t) * np.exp(-t / dc)
    return s / np.max(np.abs(s))


def dholak(kind="ge", amp=1.0):
    t = tt(0.4)
    if kind == "ge":                                      # bass side, pitch bends down
        f = 62 + 70 * np.exp(-t * 26); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) + 0.2 * band_noise(0.4, 300, 1500) * np.exp(-t * 60)
    elif kind == "na":                                    # treble rim, tuned to Sa
        s = (np.sin(2 * np.pi * SA * 2 * t) + 0.5 * np.sin(2 * np.pi * SA * 4.02 * t)) * np.exp(-t * 16) + 0.35 * band_noise(0.4, 1500, 6000) * np.exp(-t * 70)
    else:                                                 # "te": dry closed tap
        s = band_noise(0.4, 900, 4000) * np.exp(-t * 55) + 0.4 * np.sin(2 * np.pi * 330 * t) * np.exp(-t * 40)
    return s * amp


def lead(notes, kind="shehnai"):
    """notes: (start, dur, name). Continuous pitch with glides (meend) and delayed vibrato."""
    f = np.full(N, SA); amp = np.zeros(N); prev = None
    for ts, d, nm in notes:
        i0, i1 = int(ts * SR), min(N, int((ts + d) * SR)); target = SA * RAT[nm] * (2 if kind == "flute" else 1)
        seg = np.full(i1 - i0, target); loc = np.arange(i1 - i0) / SR
        if prev is not None:
            g = min(len(seg), int(0.06 * SR)); seg[:g] = prev * (target / prev) ** (np.arange(g) / g)
        seg = seg * (1 + 0.006 * np.sin(2 * np.pi * 5.4 * loc) * np.clip((loc - 0.18) / 0.2, 0, 1))
        f[i0:i1] = seg
        amp[i0:i1] = np.minimum(1, loc / (0.05 if kind == "shehnai" else 0.09)) * np.clip((d - loc) / 0.08, 0, 1) ** 0.7
        prev = target
    ph = 2 * np.pi * np.cumsum(f) / SR; out = np.zeros(N)
    if kind == "shehnai":
        for k in range(1, 24):
            fk = f * k
            form = 0.3 + np.exp(-((fk - 1150) / 420) ** 2) + 0.75 * np.exp(-((fk - 2550) / 560) ** 2) + 0.3 * np.exp(-((fk - 3800) / 700) ** 2)
            out += np.where(fk < 9000, form / k ** 0.55, 0) * np.sin(k * ph)
        out = out / np.max(np.abs(out)) + band_noise(DUR, 1500, 3500)[:N] * 0.025
    else:                                                 # bansuri: nearly pure, breathy
        out = np.sin(ph) + 0.28 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
        out = out / np.max(np.abs(out)) + band_noise(DUR, 2500, 7000)[:N] * 0.06
    return out * amp


def drone(level=0.05):
    t = np.arange(N) / SR; s = np.zeros(N)
    for fr, a in ((SA / 2, 1.0), (SA * 0.75, 0.6), (SA, 0.5)):
        for k in range(1, 8):
            s += a * np.sin(2 * np.pi * fr * k * t + k) / k * (1 + 0.3 * np.sin(2 * np.pi * (0.3 + 0.07 * k) * t))
    s /= np.max(np.abs(s))
    return s * np.clip(t / 1.2, 0, 1) * np.clip((DUR - t) / 1.2, 0, 1) * level


def sweep(length, f0, f1, amp_curve="up"):
    t = tt(length); f = f0 * (f1 / f0) ** (t / length)
    env = (t / length) ** 1.5 if amp_curve == "up" else np.sin(np.pi * t / length)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env


def whoosh(length=0.45):
    n = band_noise(length, 500, 7000); t = tt(length)
    return n * np.sin(np.pi * t / length) ** 2


def bloop(f0=420, f1=900, length=0.16):                  # a water drop: quick upward chirp
    t = tt(length); f = f0 * (f1 / f0) ** (t / length)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22) * np.minimum(1, t / 0.003)


def groove(t0, t1, level=1.0):
    """keherwa-style 8-beat cycle on the 0.25 s grid: ge . na te | na . ge na"""
    pat = ["ge", None, "na", "te", "na", None, "ge", "na"]
    k = 0; t = t0
    while t < t1 - 1e-6:
        h = pat[k % 8]
        if h:
            put(dholak(h, (1.0 if k % 8 == 0 else 0.75) * level), t, 0.45 if h == "ge" else 0.58, 0.42, wet=0.12)
        t += 0.25; k += 1


n = lambda name: SA * RAT[name]
mf = lambda m: 440.0 * 2 ** ((m - 69) / 12)          # MIDI note to Hz
CH = {"D": (50, [62, 66, 69]), "Bm": (47, [59, 62, 66]), "G": (43, [59, 62, 67]), "A": (45, [57, 61, 64])}
# an 8-step melody for each chord (MIDI notes on the 0.25 s grid, 0 = rest); pentatonic over D so it sits with the event sounds
MOT = {"D": [66, 69, 71, 69, 74, 0, 71, 69], "Bm": [66, 71, 74, 71, 78, 0, 74, 71], "G": [74, 71, 67, 71, 74, 0, 76, 74], "A": [76, 73, 69, 73, 76, 0, 78, 76]}


def pad(chord, t, dur, level=1.0):
    """warm sustained chord: detuned partials with a slow swell"""
    tm = tt(dur + 0.6); s = np.zeros(len(tm))
    for m in CH[chord][1] + [CH[chord][1][0] + 12]:
        for det in (0.997, 1.0, 1.004):
            for k, am in ((1, 1.0), (2, 0.35), (3, 0.12)):
                s += am * np.sin(2 * np.pi * mf(m) * det * k * tm + rng.uniform(0, 6))
    env = np.clip(tm / 0.5, 0, 1) * np.clip((dur + 0.6 - tm) / 0.6, 0, 1)
    put(s / np.max(np.abs(s)) * env, t, 0.5, 0.11 * level, 0.5)


def bass(chord, t, dur=0.42, level=1.0):
    tm = tt(dur); f = mf(CH[chord][0])
    s = (np.sin(2 * np.pi * f * tm) + 0.35 * np.sin(2 * np.pi * 2 * f * tm) + 0.12 * np.sin(2 * np.pi * 3 * f * tm)) * np.minimum(1, tm / 0.008) * np.exp(-tm * 4.5)
    put(s, t, 0.5, 0.36 * level, 0.05)


def kick(t, level=1.0):
    tm = tt(0.3); f = 48 + 95 * np.exp(-tm * 38)
    put(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tm * 11), t, 0.5, 0.5 * level, 0.03)


def clap(t, level=1.0):
    s = np.zeros(int(SR * 0.25))
    for off in (0.0, 0.011, 0.023):
        c = band_noise(0.2, 900, 5000) * np.exp(-tt(0.2) * 38); i0 = int(off * SR); s[i0:i0 + len(c)] += c[: len(s) - i0]
    put(s, t, 0.5, 0.2 * level, 0.35)


def shaker(t, level=1.0):
    put(band_noise(0.06, 5000, 12000) * np.exp(-tt(0.06) * 60), t, 0.62, 0.07 * level, 0.1)


def glock(freq, length=1.0):
    tm = tt(length)
    return (np.sin(2 * np.pi * freq * tm) + 0.35 * np.sin(2 * np.pi * freq * 4.0 * tm) * np.exp(-tm * 12)) * np.exp(-tm * 5) * np.minimum(1, tm / 0.002)


def band(bars, melody=1.0, drums=1.0, perc=True):
    """bars: (start, seconds, chord). Pad and bass per chord, the plucked melody on the 16ths, and a groove."""
    for t0, d, ch in bars:
        pad(ch, t0, d, 1.0)
        steps = int(round(d / 0.25))
        for i in range(steps):
            t = t0 + i * 0.25
            if i % 8 in (0, 3, 6):
                bass(ch, t, 0.42, 1.0 if i % 8 == 0 else 0.7)
            m = MOT[ch][i % 8]
            if m and melody:
                put(santoor(mf(m), 1.1), t, 0.42, 0.3 * melody, 0.3); put(glock(mf(m + 12), 0.8), t, 0.6, 0.07 * melody, 0.4)
            if drums:
                if i % 2 == 0:
                    kick(t, drums) if i % 4 == 0 else None
                if i % 8 == 4:
                    clap(t, drums)
                if perc:
                    shaker(t + 0.125, drums); shaker(t, 0.6 * drums)
        if drums and perc:
            groove(t0, t0 + d, 0.55 * drums)

if MODE == "chopda":
    T = {"land": 0.5, "open": 1.5, "shubh": 2.0, "labh": 2.5, "sathiya": 3.0, "dots": 4.0, "entries": 4.5, "close": 8.5, "badge": 8.9, "wish": 12.0}
    BURSTS = [9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.0, 12.75, 13.5, 14.25, 14.75, 15.25]
    put(drone(0.045), 0, 0.5, 1, 0.3)
    put(bell(SA / 2, 6), 0.0, 0.5, 0.35, 0.5)                                    # opening bell
    put(dholak("ge", 1.4), T["land"], 0.5, 0.7, 0.2); put(band_noise(0.12, 80, 500) * np.exp(-tt(0.12) * 30), T["land"], 0.5, 0.5)   # the book lands
    put(whoosh(0.5), T["open"] - 0.05, 0.5, 0.3)                                 # cover lifts
    for i, nm in enumerate(["S", "R", "G", "P", "D", "S'"]):                     # a santoor run as it opens
        put(santoor(n(nm), 1.2), T["open"] + i * 0.06, 0.3 + 0.07 * i, 0.3)
    put(santoor(n("P"), 2.0), T["shubh"], 0.3, 0.5); put(santoor(n("S"), 2.0, 0.9), T["shubh"], 0.3, 0.3)      # shubh
    put(santoor(n("S'"), 2.0), T["labh"], 0.7, 0.5); put(santoor(n("G"), 2.0, 0.9), T["labh"], 0.7, 0.3)       # labh
    for i, nm in enumerate(["S", "R", "G", "P", "D", "S'", "R'", "G'"]):         # the sathiya is drawn: a rising run, one note per stroke
        put(santoor(n(nm), 1.0), T["sathiya"] + i * 0.125, 0.5, 0.36)
    for i in range(4):                                                           # four kumkum dots
        put(bell(SA * 4 * [1, 1.25, 1.5, 2][i], 1.2, 0.6), T["dots"] + i * 0.06, 0.35 + 0.1 * i, 0.16, 0.5)
    band([(4.5, 2.0, "D"), (6.5, 2.0, "Bm")], melody=0.9, drums=0.9)            # the groove comes in with the ledger entries
    pad("D", 0.5, 4.0, 0.7)                                                      # a soft bed under the opening
    for i in range(13):                                                          # each brand ticks in: a woodblock and a santoor note
        t = T["entries"] + i * 0.25
        put(np.sin(2 * np.pi * 1250 * tt(0.05)) * np.exp(-tt(0.05) * 90), t, 0.3 + 0.4 * (i % 2), 0.25)
        put(santoor(n(["S", "G", "P", "D", "S'", "D", "P", "G", "R", "G", "P", "D", "S'"][i]), 0.9), t, 0.3 + 0.4 * (i % 2), 0.22)
    put(dholak("ge", 1.3), T["close"], 0.5, 0.7); put(whoosh(0.3), T["close"] - 0.05, 0.5, 0.2)                # the book closes
    put(bell(SA * 2, 2.5, 0.8), T["badge"] + 0.1, 0.5, 0.2, 0.5)                                               # it becomes the logo
    band([(9.0, 2.0, "G"), (11.0, 1.0, "A")], melody=1.0, drums=1.0)             # fireworks: lift to the wish
    band([(12.0, 2.0, "D"), (14.0, 1.0, "G")], melody=1.0, drums=1.1)
    pad("D", 15.0, 1.0, 1.2); bass("D", 15.0, 0.9); kick(15.0)
    for i, bt in enumerate(BURSTS):                                              # fireworks: a rising whistle, then a boom and crackle on the beat
        pan = [0.25, 0.75, 0.5, 0.2, 0.8, 0.15, 0.85, 0.3, 0.7, 0.5, 0.25, 0.75][i]
        put(sweep(0.45, 700 + 60 * i, 2600 + 100 * i) * 0.5, bt - 0.45, pan, 0.11, 0.3)
        boom = np.sin(2 * np.pi * np.cumsum(55 + 60 * np.exp(-tt(0.6) * 18)) / SR) * np.exp(-tt(0.6) * 7) + 0.5 * band_noise(0.6, 100, 2500) * np.exp(-tt(0.6) * 12)
        put(boom, bt, pan, 0.36 if bt >= 12.5 else 0.5, 0.4)
        cr = np.zeros(int(SR * 0.9))
        for k in range(28):
            off = int(SR * rng.uniform(0.05, 0.75)); c = np.sin(2 * np.pi * rng.uniform(3500, 8000) * tt(0.03)) * np.exp(-tt(0.03) * 150) * rng.uniform(0.3, 1)
            cr[off:off + len(c)] += c
        put(cr, bt, pan, 0.16, 0.5)
    put(bell(SA / 2, 4), T["wish"], 0.5, 0.6, 0.6)                               # the wish lands: bell and a full chord
    for nm in ("S", "G", "P", "S'"):
        put(santoor(n(nm), 2.5), T["wish"], 0.5, 0.3)
    for i, nm in enumerate(["S'", "D", "P", "G", "P", "D", "S'", "G'"]):         # shimmering santoor under the wish
        put(santoor(n(nm), 1.4), 12.5 + i * 0.25, 0.3 + 0.05 * i, 0.2)
    put(bell(SA, 3), 15.0, 0.5, 0.3, 0.6)
    out = os.path.join(HERE, "chopda", "assets", "audio", "chopda.wav")

else:  # drop
    put(drone(0.05), 0, 0.5, 1, 0.3)
    rain = band_noise(4.0, 1800, 9000) * np.clip(tt(4.0) / 0.5, 0, 1) * np.clip((3.2 - tt(4.0)) / 1.2, 0, 1)
    put(rain, 0, 0.5, 0.13, 0.2)                                                 # monsoon rain fades as we leave the sky
    th = band_noise(2.5, 30, 140) * np.exp(-tt(2.5) * 1.6); put(th, 0.1, 0.4, 0.3, 0.5)   # distant thunder
    put(bloop(500, 1100), 0.5, 0.5, 0.3, 0.5)                                    # the drop forms
    put(sweep(1.0, 1400, 500, "bell") * 0.4, 1.5, 0.5, 0.1, 0.4)                 # it falls
    put(dholak("ge", 0.9), 2.5, 0.5, 0.4); put(bloop(300, 500, 0.2), 2.5, 0.5, 0.3)        # lands in the soil
    def bubbles(t0, t1, pan0, pan1, base=500):
        k = 0; t = t0
        while t < t1:
            u = (t - t0) / (t1 - t0); put(bloop(base * (1 + 0.5 * u), base * (1.6 + 0.6 * u), 0.07), t, pan0 + (pan1 - pan0) * u, 0.13, 0.3)
            t += 0.085 + 0.02 * np.sin(k); k += 1
    bubbles(2.6, 4.0, 0.5, 0.75)                                                 # through the field pipe to the sprinkler
    t = 4.0
    while t < 5.1:                                                               # sprinkler: tsk tsk tsk on the 16ths
        put(band_noise(0.07, 4000, 11000) * np.exp(-tt(0.07) * 45), t, 0.7 - 0.4 * (t - 4.0), 0.16, 0.2); t += 0.125
    for i, nm in enumerate(["S", "G", "P", "S'"]):                               # crops come up
        put(santoor(n(nm) * 2, 1.2), 4.5 + i * 0.25, 0.25 + 0.08 * i, 0.3)
    put(bloop(350, 600, 0.2), 5.0, 0.3, 0.25)
    bubbles(5.5, 6.5, 0.3, 0.3, 380)                                             # down to the roof tank
    put(bloop(260, 520, 0.25), 6.5, 0.3, 0.4, 0.5)
    bubbles(6.6, 7.75, 0.3, 0.6, 450)
    put(sweep(0.18, 1800, 2600) * 0.5, 7.6, 0.6, 0.07)                           # the tap turns
    put(bloop(380, 1200, 0.22), 8.25, 0.6, 0.55, 0.6)                            # the drop hits the bucket
    for nm in ("G", "P", "S'"):
        put(santoor(n(nm) * 2, 1.6), 8.25, 0.6, 0.22)                            # windows light
    bubbles(8.5, 10.0, 0.6, 0.5, 420)
    put(sweep(0.5, 1200, 420, "bell") * 0.4, 10.0, 0.5, 0.1, 0.4)
    put(bloop(240, 900, 0.3), 10.5, 0.5, 0.7, 0.7); put(bell(SA, 4, 0.7), 10.5, 0.5, 0.3, 0.6)                  # into the urli
    for i, nm in enumerate(["P", "D", "S'"]):                                    # diyas light, pair by pair
        put(bell(n(nm) * 2, 2.2, 0.6), 10.5 + i * 0.5, 0.5, 0.2, 0.6); put(santoor(n(nm) * 2, 1.5), 10.5 + i * 0.5, 0.35 + 0.15 * i, 0.25)
    pad("D", 0.3, 1.7, 0.7)
    band([(2.0, 2.0, "D")], melody=0.0, drums=0.0)                               # the fall: chords only
    band([(4.0, 2.0, "Bm"), (6.0, 2.0, "G"), (8.0, 2.0, "A"), (10.0, 2.0, "D")], melody=0.75, drums=0.6)   # the journey: gentle groove and melody
    band([(12.0, 2.0, "D"), (14.0, 1.0, "G")], melody=0.9, drums=0.85)           # the wish
    pad("D", 15.0, 1.0, 1.2); bass("D", 15.0, 0.9); kick(15.0, 0.8)
    put(bell(SA / 2, 4.5), 12.0, 0.5, 0.55, 0.6)                                 # the wish
    for nm in ("S", "G", "P", "S'"):
        put(santoor(n(nm), 2.6), 12.0, 0.5, 0.3)
    for i, nm in enumerate(["S'", "D", "P", "G", "P", "D", "S'", "G'"]):
        put(santoor(n(nm), 1.4), 12.5 + i * 0.25, 0.3 + 0.05 * i, 0.18)
    put(bell(SA, 3), 15.0, 0.5, 0.25, 0.6)
    out = os.path.join(HERE, "drop", "assets", "audio", "drop.wav")


def reverb(x, seed):
    r = np.random.default_rng(seed); ln = int(SR * 2.2)
    ir = r.standard_normal(ln) * np.exp(-np.arange(ln) / SR / 0.55); ir[: int(0.012 * SR)] = 0
    m = 1 << int(np.ceil(np.log2(len(x) + ln)))
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]


wl, wr = reverb(WL, 1), reverb(WR, 2)
sc = 0.5 * max(np.max(np.abs(L)), np.max(np.abs(R))) / (max(np.max(np.abs(wl)), np.max(np.abs(wr))) + 1e-9)
mix = np.stack([L + wl * sc, R + wr * sc], 1)
fade = np.clip((DUR - np.arange(N) / SR) / 0.5, 0, 1)[:, None]
mix = np.tanh(mix * fade * 1.1)
mix *= 0.82 / np.max(np.abs(mix))
os.makedirs(os.path.dirname(out), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("wrote", out)
