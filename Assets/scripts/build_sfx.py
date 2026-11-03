#!/usr/bin/env python3
"""Generates original sound effects with math only, so there is nothing to license.
Run from Assets/: npm run build:sfx (needs numpy and scipy)."""
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(7)
os.makedirs("sfx", exist_ok=True)

def t(d): return np.arange(int(SR * d)) / SR
def noise(d): return rng.standard_normal(int(SR * d))
def env(d, a=0.005, r=None):
    n = int(SR * d); e = np.exp(-t(d) * (r if r else 6 / d))
    k = max(1, int(SR * a)); e[:k] *= np.linspace(0, 1, k); return e
def filt(x, kind, f, order=2): return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)
def sweep(x, f0, f1):
    """Time-varying low-pass via short overlapping blocks."""
    out = np.zeros_like(x); bs = 1024; win = np.hanning(bs)
    for i in range(0, len(x) - bs, bs // 2):
        f = np.clip(f0 + (f1 - f0) * (i / len(x)), 60, SR / 2 - 100)
        out[i:i + bs] += filt(x[i:i + bs] * win, "low", f)
    return out
def tone(d, f0, f1=None, shape="sine"):
    f = np.linspace(f0, f1 if f1 else f0, int(SR * d)); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if shape == "sine" else np.sign(np.sin(ph)) * 0.6
def save(name, x, peak=0.89):
    k = int(SR * 0.004); x = x.copy(); x[-k:] *= np.linspace(1, 0, k)
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    wavfile.write(f"sfx/{name}.wav", SR, (x * 32767).astype(np.int16))
def mix(*p):
    L = max(map(len, p)); o = np.zeros(L)
    for a in p: o[:len(a)] += a
    return o
def bell(d): return np.sin(np.pi * np.linspace(0, 1, int(SR * d))) ** 1.5

save("whoosh-short", filt(noise(.35), "band", [400, 5000]) * bell(.35))
d = .9; save("whoosh-long", sweep(noise(d), 300, 6000) * bell(d))
d = 1.5; save("riser", sweep(noise(d), 200, 9000) * np.linspace(0, 1, int(SR * d)) ** 2.2 + .3 * tone(d, 180, 900) * np.linspace(0, 1, int(SR * d)) ** 2)
save("pop", tone(.14, 900, 240) * env(.14, .001, 42))
save("click", filt(noise(.04), "high", 2000) * env(.04, .0005, 200) + .5 * tone(.04, 1900) * env(.04, .0005, 180))
save("tick", tone(.03, 2800) * env(.03, .0005, 240))
save("impact", mix(tone(.8, 130, 38) * env(.8, .001, 7), .55 * filt(noise(.25), "low", 2200) * env(.25, .001, 26)))
d = 2.0; save("explosion", mix(filt(noise(d), "low", 900) * env(d, .002, 3.4), 1.0 * tone(1.1, 90, 28) * env(1.1, .002, 4.5), .4 * filt(noise(.2), "high", 1800) * env(.2, .001, 28)))
save("ding", mix(tone(1.1, 1320) * env(1.1, .002, 5), .4 * tone(1.1, 2640) * env(1.1, .002, 8), .2 * tone(1.1, 3960) * env(1.1, .002, 11)))
A = [523.25, 659.25, 783.99, 1046.5]; o = np.zeros(int(SR * 1)); 
for i, f in enumerate(A): s = int(SR * .09 * i); n = tone(.6, f) * env(.6, .002, 8); o[s:s + len(n)] += n
save("success", o)
o = np.zeros(int(SR * .7))
for i, f in enumerate([349.23, 277.18]): s = int(SR * .2 * i); n = (tone(.45, f) + .3 * tone(.45, f * 2)) * env(.45, .003, 8); o[s:s + len(n)] += n
save("fail", o)
save("glitch", np.concatenate([tone(.03 + rng.random() * .04, rng.uniform(150, 3000), shape="square") * rng.uniform(.3, 1) for _ in range(9)]), .55)
save("swipe-up", filt(noise(.28), "band", [1200, 7000]) * bell(.28) + .25 * tone(.28, 400, 1400) * bell(.28))
d = 1.0; save("heartbeat", mix(*[np.concatenate([np.zeros(int(SR * s)), tone(.16, 70, 42) * env(.16, .004, 26)]) for s in (0, .24)]))
d = 4.0; lfo = .75 + .25 * np.sin(2 * np.pi * t(d) / 4); fade = np.minimum(1, np.minimum(t(d), d - t(d)) / .5)
save("ambience-wind", filt(noise(d), "band", [150, 900]) * lfo * fade, .5)
save("ambience-drone", (tone(d, 55) + .5 * tone(d, 82.4) + .25 * tone(d, 110)) * lfo * fade, .5)
print("sfx built")
d = 4.0
_o = np.zeros(int(SR * d))
for _ in range(150):
    _s = int(rng.random() * SR * (d - .08)); _k = noise(.03) * env(.03, .0005, 180) * rng.uniform(.25, 1); _o[_s:_s + len(_k)] += _k
_roar = filt(noise(d), "low", 420) * (.8 + .2 * np.sin(2 * np.pi * t(d) / d * 3))
save("fire-crackle", (filt(_o, "high", 1200) + 1.4 * _roar) * np.minimum(1, np.minimum(t(d), d - t(d)) / .25), .5)
