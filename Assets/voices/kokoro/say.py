#!/usr/bin/env python3
"""python3 say.py michael|bella "Text to narrate" out.wav [speed]"""
import sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro
here = Path(__file__).resolve().parent
VOICES = {"michael": "am_michael", "bella": "af_bella"}
name, text, out = sys.argv[1:4]
speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
k = Kokoro(str(here / "models/kokoro-v1.0.onnx"), str(here / "voices-michael-bella.npz"))
audio, rate = k.create(text, voice=VOICES[name], speed=speed, lang="en-us")
sf.write(out, audio, rate)
print(f"{out}: {len(audio) / rate:.2f}s")
