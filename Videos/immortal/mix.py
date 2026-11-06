#!/usr/bin/env python3
"""Builds the sound mix from narration.json. Run from Assets/: python3 ../Videos/immortal/mix.py OUT.wav"""
import json, re, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
SR = 48000; TOTAL = 78.0
d = json.load(open("../Videos/immortal/narration.json"))
CUTS = [0, 4.5, 12.8, 21.0, 28.6, 36.6, 43.3, 51.0, 58.9, 65.3, 74.6, 78.0]
def W(b, word, nth=0):
    beat = d["beats"][b]; k = 0
    for c in d["chunks"]:
        for w in c["words"]:
            if beat["start"] - .01 <= w["start"] and w["end"] <= beat["end"] + .01 and re.sub(r"\W", "", w["text"]).lower() == word.lower():
                if k == nth: return w["start"]
                k += 1
    raise KeyError(word)
def load(name):
    x, sr = sf.read(name, dtype="float32")
    if x.ndim > 1: x = x.mean(1)
    return resample_poly(x, SR, sr) if sr != SR else x
bus = np.zeros(int(SR * TOTAL) + SR * 3)
def put(name, at, db=0):
    x = load(f"sfx/{name}.wav") * 10 ** (db / 20); i = int(max(0, at) * SR); bus[i:i + len(x)] += x[:len(bus) - i]
def bed(name, a, b, db, fade=.6):
    x = load(f"sfx/{name}.wav"); n = int((b - a) * SR); xf = int(SR * .4); out = np.zeros(n + len(x)); p = 0
    ramp = np.ones(len(x)); ramp[:xf] = np.linspace(0, 1, xf); ramp[-xf:] = np.linspace(1, 0, xf)
    while p < n: out[p:p + len(x)] += x * ramp; p += len(x) - xf
    out = out[:n]; f = int(fade * SR); out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
    i = int(a * SR); bus[i:i + n] += out * 10 ** (db / 20)
# 0: the hourglass stops
bed("ambience-drone", 0, CUTS[1] + 1, -30, 1); put("riser", W(0, "never") - 1.3, -22)
t = .5
while t < W(0, "never"): put("tick", t, -24); t += .42
put("impact", W(0, "never"), -10); put("shimmer", W(0, "never") + .05, -22)
# 1: a gift
put("whoosh-short", CUTS[1] + .05, -20); bed("ambience-wind", CUTS[1], CUTS[2], -34, 1)
for i in range(8): put("pop", W(1, "language") + i * .38, -20)
put("ding", W(1, "deadlines"), -19)
# 2: the bars
put("whoosh-short", CUTS[2], -22); put("riser", W(2, "seventythree") - .3, -26); put("ding", W(2, "seventythree") + 1.2, -20)
put("riser", W(2, "hundred") - .2, -24); put("impact", W(2, "hundred") + .5, -14); put("ding", W(2, "hundred") + 1.6, -17)
# 3: the long walk
for k in range(14): put("tick", W(3, "keep") + k * .33, -24)
put("riser", W(3, "keep") - .3, -22); put("whoosh-long", W(3, "keep") + 3.2, -24); put("impact", W(3, "eight"), -16)
# 4: they leave
bed("ambience-drone", CUTS[4], CUTS[5], -32, 1)
t = CUTS[4] + .5
while t < CUTS[5] - .5: put("heartbeat", t, -21); t += 1.1
put("pop", W(4, "old"), -20)
for i in range(4): put("shimmer", W(4, "leave") + i * .95, -22)
# 5: the city
put("rumble", CUTS[5], -21); put("whoosh-long", CUTS[5] + 1.2, -26); put("whoosh-long", CUTS[5] + 3.8, -26); put("shimmer", W(5, "vanish"), -24)
# 6: the Earth
bed("ambience-drone", CUTS[6], CUTS[7], -29, 1); put("riser", W(6, "plants") - .5, -24); put("riser", W(6, "billion", 1) - .4, -22); put("rumble", W(6, "billion", 1), -22)
# 7: the Sun
put("riser", W(7, "swells") - .4, -20); put("rumble", W(7, "swells"), -17); put("explosion", W(7, "survive") + .1, -17)
# 8: alone
bed("ambience-wind", CUTS[8], CUTS[9], -33, 1.5); put("heartbeat", CUTS[8] + 1.2, -23); put("heartbeat", CUTS[8] + 2.4, -25)
# 9: the candle
bed("fire-crackle", CUTS[9], CUTS[10], -36, 1); put("ding", W(9, "limited"), -22)
# 10: the question
put("whoosh-short", CUTS[10], -22); put("click", W(10, "take"), -18); put("ding", W(10, "take") + .2, -17)
n = load("public/narration/immortal/narration.wav"); bus[:len(n)] += n
out = np.clip(bus[:int(SR * TOTAL)], -1, 1); sf.write(sys.argv[1], out, SR); print("peak", abs(out).max())
