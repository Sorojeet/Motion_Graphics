#!/usr/bin/env python3
"""Synthesizes two extra sound effects with no samples: shimmer.wav (sparkling dissolve) and rumble.wav (deep rolling bass).
Run from Assets/: python3 scripts/build_sfx_space.py"""
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 48000; rng = np.random.default_rng(7)
def norm(x, peak=0.9): return (x / np.abs(x).max() * peak).astype(np.float32)
# shimmer: 2.4 s of bright sine glints (pentatonic, random timing) over soft high-passed air, with a slow fade
n = int(2.4 * SR); t = np.arange(n) / SR; x = np.zeros(n)
for f0 in [1318.5, 1568, 1760, 2093, 2637, 3136, 3520]:
    for _ in range(5):
        a = rng.uniform(0, 1.9); d = rng.uniform(0.25, 0.7); i = int(a * SR); m = min(int(d * SR), n - i)
        env = np.exp(-np.linspace(0, 6, m)) * np.minimum(1, np.linspace(0, 80, m)); tt = np.arange(m) / SR
        x[i:i + m] += np.sin(2 * np.pi * f0 * (1 + rng.uniform(-0.002, 0.002)) * tt) * env * rng.uniform(0.3, 1)
air = sosfilt(butter(2, 5000, "high", fs=SR, output="sos"), rng.standard_normal(n)) * 0.04 * np.exp(-t * 1.3)
x = (x + air) * np.minimum(1, (2.4 - t) / 0.5); sf.write("sfx/shimmer.wav", norm(x, 0.7), SR)
# rumble: 3.2 s of low-passed noise with a 38 Hz and 55 Hz bed and a slow swell
n = int(3.2 * SR); t = np.arange(n) / SR
z = sosfilt(butter(3, 110, "low", fs=SR, output="sos"), rng.standard_normal(n)) * 6 + np.sin(2 * np.pi * 38 * t) * 0.9 + np.sin(2 * np.pi * 55 * t + 1) * 0.5
z *= (0.55 + 0.45 * np.sin(2 * np.pi * 0.6 * t)) * np.minimum(1, t / 0.6) * np.minimum(1, (3.2 - t) / 0.8); sf.write("sfx/rumble.wav", norm(z, 0.9), SR)
print("wrote sfx/shimmer.wav and sfx/rumble.wav")
