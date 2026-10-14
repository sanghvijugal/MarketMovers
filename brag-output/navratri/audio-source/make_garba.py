"""Synthesise a 16.5s garba-style track for the Navratri reel.

6/8 at one bar per second (an eighth = 1/6 s), so the edit's half-second
beats land on every dotted quarter. Dhol (dagga + tilli), dandiya clacks
(Kenney CC0 wood samples), manjira, shaker, tanpura drone and a
harmonium tune in D (Bilawal). Structure follows the edit.
"""
import sys
import numpy as np
from scipy.signal import butter, lfilter
import wave

SR = 48000
DUR = 16.5
E = 1 / 6  # one eighth note
N = int(SR * DUR)
rng = np.random.default_rng(7)
mix = {k: np.zeros(N) for k in ["dhol", "tak", "clack", "manj", "shak", "harm", "drone"]}


def load(path):
    with wave.open(path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
    return a


def bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return lfilter(b, a, x)


def lp(x, f, order=2):
    b, a = butter(order, f / (SR / 2), btype="low")
    return lfilter(b, a, x)


def hp(x, f, order=2):
    b, a = butter(order, f / (SR / 2), btype="high")
    return lfilter(b, a, x)


def put(track, t, sig, amp=1.0):
    i = int(round(t * SR))
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    mix[track][i:j] += sig[: j - i] * amp


def dhum(amp=1.0, length=0.6):
    t = np.arange(int(SR * length)) / SR
    f = 52 + 75 * np.exp(-t * 22)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 5.5)
    thump = lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 40) * 0.6
    return (body + thump) * amp


def tak(amp=1.0, pitch=520):
    t = np.arange(int(SR * 0.18)) / SR
    noise = bp(rng.standard_normal(len(t)), 1200, 4500) * np.exp(-t * 55)
    tone = np.sin(2 * np.pi * pitch * t) * np.exp(-t * 38) * 0.5
    return (noise * 0.7 + tone) * amp


def manjira(amp=1.0, length=0.9):
    t = np.arange(int(SR * length)) / SR
    s = sum(np.sin(2 * np.pi * f * t + i) / (i + 1) for i, f in enumerate([2240, 3410, 4870, 6120, 7350]))
    return s * np.exp(-t * 6) * amp * 0.35


def shaker(amp=1.0):
    t = np.arange(int(SR * 0.07)) / SR
    return hp(rng.standard_normal(len(t)), 6500) * np.exp(-t * 70) * amp


def harm_note(freq, dur, amp=1.0):
    n = int(SR * dur)
    t = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t)
    s = np.zeros(n)
    for det in (1.0, 1.004, 0.997):
        ph = np.cumsum(freq * det * vib) / SR
        s += 2 * (ph % 1) - 1
        s += 0.5 * (2 * ((2 * ph) % 1) - 1)
    s = lp(s, 2600)
    env = np.minimum(1, t / 0.02) * np.minimum(1, (dur - t) / 0.06).clip(0, 1)
    return s * env * amp * 0.12


def drone():
    t = np.arange(N) / SR
    s = np.zeros(N)
    for f, a in ((146.83, 1.0), (220.0, 0.7), (293.66, 0.45)):
        for h in range(1, 9):
            s += a * np.sin(2 * np.pi * f * h * t + h) / h * (1 + 0.3 * np.sin(2 * np.pi * (0.4 + h * 0.07) * t))
    s = lp(s, 1500) * 0.05
    env = np.clip(t / 1.5, 0, 1) * np.clip((DUR - t) / 1.0, 0, 1)
    return s * env


clacks = [load(f"{sys.argv[1]}/impactWood_light_00{i}.wav") for i in (0, 2, 4)]
clack_big = load(f"{sys.argv[1]}/impactWood_medium_001.wav")

# ---------------- structure ----------------
# bars start every second; groove from bar at 1.0 to 16.0
def groove_bar(b0, level=1.0, fill=False, clap=True, bass=True):
    for e in range(6):
        t = b0 + e * E
        if bass and e == 0:
            put("dhol", t, dhum(1.0 * level))
        if bass and e == 3:
            put("dhol", t, dhum(0.7 * level, 0.45))
        if e in (1, 2, 4, 5):
            acc = 1.0 if e in (2, 5) else 0.55
            put("tak", t, tak(acc * level, 560 if e in (2, 5) else 480))
        put("shak", t, shaker((0.9 if e in (0, 3) else 0.5) * level))
        if clap and e in (0, 3):
            put("clack", t, clacks[(int(b0) + e) % 3], 0.5 * level)
    if fill:  # tilli roll over the last three eighths
        for k in range(6):
            put("tak", b0 + 3 * E + k * E / 2, tak(0.45 + k * 0.1, 600))


# intro (0 to 1): drone swells; a tak pickup triplet into the drop
for k, t in enumerate([1 - 3 * E / 2, 1 - E, 1 - E / 2]):
    put("tak", t, tak(0.5 + k * 0.2, 600))
put("dhol", 1.0, dhum(1.35, 0.9))
put("manj", 1.0, manjira(1.2, 1.2))

bar = 1.0
while bar < 9.0:
    groove_bar(bar, 1.0, fill=(bar in (4.0, 8.0)))
    put("manj", bar, manjira(0.5, 0.5))
    bar += 1
# break at 9: drums out for half a bar (the reel's bell lands at 9.45)
put("dhol", 9.0, dhum(1.1, 0.8))
for e in (3, 4, 5):
    put("shak", 9.0 + e * E, shaker(0.4))
for b0 in (10.0, 11.0):
    groove_bar(b0, 0.8, clap=False)
groove_bar(12.0, 0.9, fill=True)
# end card at 12.5: big hit and full groove
put("dhol", 12.5, dhum(1.4, 0.9))
put("manj", 12.5, manjira(1.3, 1.4))
put("clack", 12.5, clack_big, 0.7)
for b0 in (13.0, 14.0, 15.0):
    groove_bar(b0, 1.05, fill=(b0 == 15.0))
put("dhol", 16.0, dhum(1.4, 0.5))
put("manj", 16.0, manjira(1.0, 0.5))
put("clack", 16.0, clack_big, 0.7)

# harmonium tune (scale degrees in D Bilawal; '-' holds), one char per eighth
deg = {"1": 293.66, "2": 329.63, "3": 369.99, "4": 392.00, "5": 440.00, "6": 493.88, "7": 554.37, "8": 587.33, "L": 220.0}
PHRASE = ["556532", "3-21--", "556876", "5-35--", "556532", "3-21--", "8-7656", "5-----"]
BREAK = ["5-----"]
def play(bars, start):
    for bi, pat in enumerate(bars):
        i = 0
        while i < 6:
            ch = pat[i]
            if ch == "-":
                i += 1
                continue
            j = i + 1
            while j < 6 and pat[j] == "-":
                j += 1
            put("harm", start + bi + i * E, harm_note(deg[ch], (j - i) * E * 0.95))
            i = j
play(PHRASE, 1.0)          # bars 1 to 8 (1.0 to 9.0)
play(BREAK, 9.0)           # held note over the break
play(PHRASE[:3], 10.0)     # 10 to 13
play(PHRASE[4:7], 13.0)    # 13 to 16
put("harm", 16.0, harm_note(deg["1"], 0.45))
mix["drone"] += drone()

# ---------------- mix ----------------
gains = {"dhol": 0.7, "tak": 0.42, "clack": 0.4, "manj": 0.35, "shak": 0.24, "harm": 1.5, "drone": 1.0}
out = sum(mix[k] * g for k, g in gains.items())
# glue: gentle saturation, then peak normalise to -1 dBFS
out = np.tanh(out * 1.3) / np.tanh(1.3)
out *= 10 ** (-1 / 20) / np.max(np.abs(out))
st = np.stack([out, out], axis=1)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("wrote", sys.argv[2], len(out) / SR, "s")
