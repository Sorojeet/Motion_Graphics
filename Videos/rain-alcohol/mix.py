#!/usr/bin/env python3
"""Builds the sound mix from narration.json. Run from Assets/: python3 ../Videos/rain-alcohol/mix.py OUT.wav"""
import json, re, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
SR = 48000; TOTAL = 78.0
d = json.load(open("../Videos/rain-alcohol/narration.json"))
CUTS = [0, 5.67, 13.1, 22.78, 31.39, 39.87, 50.19, 59.4, 67.74, 78]
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
mixbus = np.zeros(int(SR * TOTAL) + SR * 3)
def put(name, at, db=0):
    x = load(f"sfx/{name}.wav") * 10 ** (db / 20); i = int(at * SR); mixbus[i:i + len(x)] += x[:len(mixbus) - i]
def bed(name, a, b, db, fade=.5):
    x = load(f"sfx/{name}.wav"); n = int((b - a) * SR); xf = int(SR * .4); out = np.zeros(n + len(x)); p = 0
    ramp = np.ones(len(x)); ramp[:xf] = np.linspace(0, 1, xf); ramp[-xf:] = np.linspace(1, 0, xf)
    while p < n: out[p:p + len(x)] += x * ramp; p += len(x) - xf
    out = out[:n]; f = int(fade * SR); out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
    i = int(a * SR); mixbus[i:i + n] += out * 10 ** (db / 20)
def rain(a, b, db, fade=.5):
    # Rain bed built here from seeded filtered noise, because the library has no rain sound.
    from scipy.signal import butter, sosfilt
    n = int((b - a) * SR); x = np.random.default_rng(3).standard_normal(n)
    x = sosfilt(butter(2, [900, 9000], "band", fs=SR, output="sos"), x); x /= np.abs(x).max()
    f = int(fade * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    i = int(a * SR); mixbus[i:i + n] += x * 10 ** (db / 20)
sp = W(5, "spark")
rain(0, sp - 1.1, -30)                      # stops before the spark, for the silence
put("whoosh-long", .1, -15); put("impact", W(0, "What") - .05, -11)
bed("ambience-wind", CUTS[1], CUTS[2], -22); put("tick", W(1, "Alcohol"), -20); put("whoosh-short", CUTS[1] - .1, -16)
put("pop", W(2, "cups"), -16); put("fail", W(2, "Bad"), -16); put("whoosh-short", CUTS[2] - .1, -17)
bed("ambience-drone", W(3, "strips") - .5, CUTS[5], -21, 1); put("whoosh-long", CUTS[3] + 5.6, -18)
for k in range(int((W(4, "suffocate") - CUTS[4] - 1) / 1.2)): put("heartbeat", CUTS[4] + 1 + k * 1.2, -15)
put("riser", sp - 2.4, -15); put("click", sp, -6)
put("explosion", CUTS[6], -8); put("impact", CUTS[6], -6); bed("fire-crackle", CUTS[6] + .05, CUTS[7] + 1.5, -15, .25)
put("whoosh-long", CUTS[7] - .2, -18); put("ding", W(7, "water"), -18); bed("ambience-wind", CUTS[7], CUTS[8], -24)
rain(CUTS[8], TOTAL - .15, -30, 1); put("impact", W(8, "fire"), -17); put("success", W(8, "What"), -19)
n = load("public/narration/rain-alcohol/narration.wav")
mixbus[:len(n)] += n
out = np.clip(mixbus[:int(SR * TOTAL)], -1, 1)
sf.write(sys.argv[1], out, SR); print("peak", abs(out).max())
