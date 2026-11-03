#!/usr/bin/env python3
"""Builds the sound mix from narration.json. Run from Assets/: python3 ../Videos/no-decay/mix.py OUT.wav"""
import json, re, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
SR = 48000; TOTAL = 80.0
d = json.load(open("../Videos/no-decay/narration.json"))
CUTS = [0, 3.46, 10.62, 17.87, 28.28, 37.72, 50.74, 63.86, 70.19, 75.39, 80]
def W(b, word):
    beat = d["beats"][b]
    for c in d["chunks"]:
        for w in c["words"]:
            if beat["start"] - .01 <= w["start"] and w["end"] <= beat["end"] + .01 and re.sub(r"\W", "", w["text"]).lower() == word.lower(): return w["start"]
    raise KeyError(word)
def load(name):
    x, sr = sf.read(name, dtype="float32")
    if x.ndim > 1: x = x.mean(1)
    return resample_poly(x, SR, sr) if sr != SR else x
mixbus = np.zeros(int(SR * TOTAL) + SR)
def put(name, at, db=0):
    x = load(f"sfx/{name}.wav") * 10 ** (db / 20); i = int(at * SR); mixbus[i:i + len(x)] += x[:len(mixbus) - i]
def bed(name, a, b, db, fade=.5):
    x = load(f"sfx/{name}.wav"); n = int((b - a) * SR); xf = int(SR * .4); out = np.zeros(n + len(x)); p = 0
    ramp = np.ones(len(x)); ramp[:xf] = np.linspace(0, 1, xf); ramp[-xf:] = np.linspace(1, 0, xf)
    while p < n: out[p:p + len(x)] += x * ramp; p += len(x) - xf
    out = out[:n]; f = int(fade * SR); out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
    i = int(a * SR); mixbus[i:i + n] += out * 10 ** (db / 20)
snap = W(0, "nothing")
put("riser", max(0, snap - 1.5), -13); put("impact", snap, -7)
for b, w, s in [(1, "This", "pop"), (1, "Bread", "pop"), (1, "Milk", "pop")]: put(s, W(b, w), -12)
put("ding", W(1, "perfect"), -22)
put("whoosh-long", CUTS[2] - .1, -13); bed("ambience-wind", CUTS[2], CUTS[5], -17)
for i in range(16): put("tick", W(3, "lock") + i * .19, -24)
put("fail", W(3, "stopped"), -22)
put("whoosh-short", CUTS[4], -14); bed("ambience-drone", CUTS[4] + 2, CUTS[5] + .5, -19)
put("impact", W(4, "Dead"), -17)
put("whoosh-long", CUTS[5] + .1, -13)
for k in range(10): put("heartbeat", CUTS[5] + 1.5 + k * 1.15, -13)
put("glitch", W(5, "trapped"), -21); put("whoosh-short", W(5, "Leaves") - .3, -14)
bed("ambience-drone", CUTS[6], CUTS[7] + .3, -15); bed("ambience-wind", CUTS[6], CUTS[7], -22)
put("riser", W(6, "ten") - 1.3, -15); put("impact", W(6, "ten"), -15)
bolt = W(7, "lightning"); put("impact", bolt, -5); put("explosion", bolt + .08, -9); bed("fire-crackle", bolt, CUTS[8] + .2, -13, .3)
bed("ambience-wind", CUTS[8], CUTS[9] + .2, -21); put("pop", W(8, "looks"), -18); put("success", W(8, "built"), -17)
bed("ambience-wind", CUTS[9], 79.7, -24); put("click", 79.7, -10)
n = load("public/narration/no-decay/narration.wav")
mixbus[:len(n)] += n
out = np.clip(mixbus[:int(SR * TOTAL)], -1, 1)
sf.write(sys.argv[1], out, SR); print("peak", abs(out).max())
