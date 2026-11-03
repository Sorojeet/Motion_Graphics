#!/usr/bin/env python3
"""Turns a narration script into audio and timed captions.

Usage, from Assets/:  python3 scripts/narrate.py narration/scripts/demo.txt [--speed 1.0]
Output: public/narration/<name>/ containing narration.wav, narration.srt, narration.json
"""
import argparse, json, os, re, subprocess, sys, tempfile, urllib.request
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICES = {"michael": "am_michael", "bella": "af_bella"}  # add more voices here
BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
MODEL, VBIN = ".models/kokoro-v1.0.onnx", ".models/voices-v1.0.bin"
SR = 24000; COMMA, SENTENCE, LINE, BLANK = .10, .28, .35, .70; MAX_WORDS = 6

def fetch():
    os.makedirs(".models", exist_ok=True)
    for path in (MODEL, VBIN):
        if not os.path.exists(path):
            print("Downloading", os.path.basename(path), "(first run only)")
            urllib.request.urlretrieve(BASE + os.path.basename(path), path)

def parse(path):
    lines = []; pause = False
    for n, raw in enumerate(open(path, encoding="utf8"), 1):
        s = raw.strip()
        if s.startswith("#"): continue
        if not s: pause = True; continue
        m = re.match(r"(\w+):\s*(.+)", s)
        if not m or m[1].lower() not in VOICES: sys.exit(f"Line {n}: start with one of {list(VOICES)}, then a colon")
        lines.append((m[1].lower(), m[2], pause)); pause = False
    if not lines: sys.exit("The script has no narration lines")
    return lines

def clauses(text):
    """Keeps punctuation with its phrase. Splits only where a speaker naturally pauses."""
    return [p.strip() for p in re.findall(r"[^,;:.!?]+(?:[,;:.!?]+[\"')]*|$)", text) if p.strip()]

def trim(a, thr=.008, pad=.02):
    i = np.where(np.abs(a) > thr)[0]
    if not len(i): return a
    p = int(pad * SR); return a[max(0, i[0] - p):min(len(a), i[-1] + p)]

def words_for(text, start, end):
    toks = text.split(); w = np.array([max(2, len(re.sub(r"\W", "", t))) + 1 for t in toks], float)
    edges = start + (end - start) * np.concatenate([[0], np.cumsum(w) / w.sum()]); out = []
    for i, t in enumerate(toks):
        out.append({"text": t.replace("*", ""), "highlight": "*" in t, "start": round(float(edges[i]), 3), "end": round(float(edges[i + 1]), 3)})
    return out

def srt_time(t):
    ms = int(round(t * 1000)); return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("script"); ap.add_argument("--speed", type=float, default=1.0); ap.add_argument("--out"); a = ap.parse_args()
    fetch(); k = Kokoro(MODEL, VBIN); name = os.path.splitext(os.path.basename(a.script))[0]
    out = a.out or f"public/narration/{name}"; os.makedirs(out, exist_ok=True)
    audio, t, chunks, beats = [], 0.0, [], []
    def silence(d):
        nonlocal t; audio.append(np.zeros(int(d * SR), np.float32)); t += int(d * SR) / SR
    for i, (who, text, pause) in enumerate(parse(a.script)):
        if i: silence(BLANK if pause else LINE)
        beats.append({"voice": who, "text": text.replace("*", ""), "start": round(t, 3)})
        parts = clauses(text)
        for j, part in enumerate(parts):
            wav, sr = k.create(part.replace("*", ""), voice=VOICES[who], speed=a.speed, lang="en-us")
            assert sr == SR; wav = trim(wav); start = t; audio.append(wav.astype(np.float32)); t += len(wav) / SR
            ws = words_for(part, start, t)  # clause edges are exact; word times inside are estimates
            for c in range(0, len(ws), MAX_WORDS):
                g = ws[c:c + MAX_WORDS]; chunks.append({"voice": who, "start": g[0]["start"], "end": g[-1]["end"], "words": g})
            if j < len(parts) - 1: silence(SENTENCE if part[-1] in ".!?" else COMMA)
        beats[-1]["end"] = round(t, 3)
    with tempfile.TemporaryDirectory() as d:
        raw = f"{d}/raw.wav"; sf.write(raw, np.concatenate(audio), SR)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=7", "-ar", "48000", "-ac", "1", f"{out}/narration.wav"], check=True)
    json.dump({"duration": round(t, 3), "beats": beats, "chunks": chunks}, open(f"{out}/narration.json", "w"), indent=1)
    with open(f"{out}/narration.srt", "w") as f:
        for i, c in enumerate(chunks, 1): f.write(f"{i}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{' '.join(w['text'] for w in c['words'])}\n\n")
    print(f"{out}: {t:.1f}s, {len(beats)} lines, {len(chunks)} captions")

if __name__ == "__main__": main()
