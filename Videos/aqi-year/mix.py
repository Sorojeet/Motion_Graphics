#!/usr/bin/env python3
"""Builds the sound mix from narration.json. Run from Assets/: python3 ../Videos/aqi-year/mix.py OUT.wav"""
import json, re, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly, butter, sosfilt
SR = 48000; TOTAL = 64.0
d = json.load(open("../Videos/aqi-year/narration.json"))
CUTS = [0, 5.2, 13.38, 18.17, 27.25, 34.82, 43.95, 49.97, 56.63, 60.73, 64.0]
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
bus = np.zeros(int(SR * TOTAL) + SR * 3)
def put(name, at, db=0):
    x = load(f"sfx/{name}.wav") * 10 ** (db / 20); i = int(at * SR); bus[i:i + len(x)] += x[:len(bus) - i]
def bed(name, a, b, db, fade=.6):
    x = load(f"sfx/{name}.wav"); n = int((b - a) * SR); xf = int(SR * .4); out = np.zeros(n + len(x)); p = 0
    ramp = np.ones(len(x)); ramp[:xf] = np.linspace(0, 1, xf); ramp[-xf:] = np.linspace(1, 0, xf)
    while p < n: out[p:p + len(x)] += x * ramp; p += len(x) - xf
    out = out[:n]; f = int(fade * SR); out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
    i = int(a * SR); bus[i:i + n] += out * 10 ** (db / 20)
def cough(at, db):
    # Two short breathy bursts built here from seeded filtered noise, because the library has no cough sound.
    rng = np.random.default_rng(int(at * 100))
    for k, (off, dur) in enumerate([(0, .13), (.2, .17)]):
        n = int(dur * SR); x = rng.standard_normal(n); x = sosfilt(butter(2, [300, 2400], "band", fs=SR, output="sos"), x)
        env = np.exp(-np.linspace(0, 7, n)) * np.minimum(1, np.linspace(0, 40, n)); x *= env / np.abs(x).max()
        i = int((at + off) * SR); bus[i:i + n] += x * 10 ** ((db - k * 3) / 20)
def sand(a, b, db):
    # Sand running, built here from seeded filtered noise, because the library has no sand sound.
    n = int((b - a) * SR); x = np.random.default_rng(5).standard_normal(n); x = sosfilt(butter(2, [2500, 9000], "band", fs=SR, output="sos"), x); x /= np.abs(x).max()
    f = int(.4 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f); i = int(a * SR); bus[i:i + n] += x * 10 ** (db / 20)
# 0: the meter spins up to 500
put("whoosh-short", .2, -18); put("riser", .9, -20); put("impact", W(0, "hundred"), -9); put("click", W(0, "five"), -17)
# 1: day one, two coughs, particles rushing in
bed("ambience-drone", CUTS[1], CUTS[2], -31, 1); cough(W(1, "particles") + .2, -17); cough(W(1, "small") - .25, -17)
put("whoosh-short", W(1, "slip") - .1, -20); put("riser", W(1, "slip") - .3, -24)
# 2: through the body
put("whoosh-long", CUTS[2] - .05, -17); put("pop", W(2, "bloodstream"), -14)
t = CUTS[2] + .3
while t < CUTS[3] - .8: put("heartbeat", t, -17); t += .95
# 3: calendar pages and the growing pile
for k in range(12): put("tick", W(3, "over") - .1 + (W(3, "hundred") + .2 - W(3, "over")) * k / 12, -19)
put("riser", W(3, "over") - .2, -26); put("impact", W(3, "ten"), -16)
# 4: the damage adds up
bed("ambience-drone", CUTS[4], CUTS[5], -29, 1)
for w in ("stroke", "heart", "cancer", "disease"): put("click", W(4, w) - .05, -16)
# 5: the groups light up
put("pop", W(5, "fortythree"), -17); put("pop", W(5, "twentyfive"), -17)
for k in range(10): put("tick", W(5, "fortythree") + .15 + k * .09, -28); put("tick", W(5, "twentyfive") + .15 + k * .09, -30)
# 6: the sand runs out
sand(W(6, "lose"), W(6, "life") + .5, -31); put("impact", W(6, "eight"), -15)
# 7: the dots
put("riser", W(7, "over") - .1, -24); put("impact", W(7, "deaths"), -12)
for k in range(14): put("tick", W(7, "over") + .1 + k * .16, -30)
# 8: the mask comes off
bed("ambience-wind", CUTS[8], TOTAL, -30, 1.5); put("whoosh-long", W(8, "clean") + .1, -20); put("ding", W(8, "luxury"), -16)
# 9: one soft hit on the question
put("impact", W(9, "would") - .05, -20)
n = load("public/narration/aqi-year/narration.wav"); bus[:len(n)] += n
out = np.clip(bus[:int(SR * TOTAL)], -1, 1); sf.write(sys.argv[1], out, SR); print("peak", abs(out).max())
