#!/usr/bin/env python3
"""Builds preview/contact-sheet.png from the rendered assets. Run from Assets/ (needs Pillow and ffmpeg)."""
import glob, os, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont
BG, SURF, TXT, MUT, CY = "#0B1426", "#16233D", "#F4F7FB", "#9FB0C9", "#22D3EE"
W, M = 2000, 50
H1 = ImageFont.truetype("public/fonts/Montserrat_800ExtraBold.ttf", 56); H2 = ImageFont.truetype("public/fonts/Montserrat_700Bold.ttf", 34); L = ImageFont.truetype("public/fonts/Inter_500Medium.ttf", 17)
def frame(path, t):
    with tempfile.TemporaryDirectory() as d:
        o = f"{d}/f.png"; subprocess.run(["ffmpeg", "-v", "error", "-c:v", "libvpx-vp9", "-ss", str(t), "-i", path, "-frames:v", "1", o], check=True)
        return Image.open(o).convert("RGBA").copy()
sections = []
def sec(title, items, tw, th, tile=SURF): sections.append((title, items, tw, th, tile))
name = lambda f: os.path.splitext(os.path.basename(f))[0]
g = lambda p: [(name(f), f) for f in sorted(glob.glob(p))]
sec("Characters", g("characters/alex/png/*.png") + g("characters/maya/png/*.png") + [(f"{n} idle", f"characters/{n}/png/idle.png") for n in ["omar", "kenji", "luis", "arthur", "dev", "zara", "mei", "aisha", "elena", "ruth"]], 180, 270)
sec("Props", g("props/png/*.png"), 165, 165)
sec("Icons", g("icons/white/png/*.png"), 95, 95)
sec("Shapes (+ white, amber, coral versions)", g("shapes/cyan/png/*.png"), 165, 165)
sec("Backgrounds, 9:16 (+ 16:9 versions)", g("backgrounds/9x16/png/*.png"), 180, 320)
sec("Text templates, 9:16 (+ 16:9 versions)", g("templates/9x16/png/*.png"), 225, 400)
T = {"TitleCard": 1.5, "LowerThird": 1.5, "Caption": 1.5, "StatCounter": 2, "Callout": 1.5, "EndCard": 1.5}
sec("Animated text", [(k, ("animated/text/%s-9x16.webm" % k, v)) for k, v in T.items()], 225, 400)
sec("Animated transitions, shown 1/4 of the way through", [(k, ("animated/transitions/%s-9x16.webm" % k, .25)) for k in ["CircleIris", "DiagonalWipe", "StripeWipe", "ShutterWipe", "Flash"]], 225, 400)
sec("Animated effects", [(k, ("animated/effects/%s-9x16.webm" % k, v)) for k, v in {"Confetti": 1.2, "Explosion": .35, "Snow": 1, "Rain": 1, "Smoke": 2, "Sparks": 1, "Dust": 2}.items()], 225, 400)
sec("Animated character loops", [(name(f), (f, .5)) for f in sorted(glob.glob("animated/characters/*.webm"))], 180, 270)
def layout(items, tw, th):
    cols = max(1, (W - 2 * M + 12) // (tw + 12)); rows = (len(items) + cols - 1) // cols
    return cols, rows, rows * (th + 40)
total = 180 + sum(layout(i, tw, th)[2] + 90 for _, i, tw, th, _ in sections)
im = Image.new("RGB", (W, total), BG); d = ImageDraw.Draw(im)
d.text((M, 50), "2D Motion Graphics Asset Library", font=H1, fill=TXT); y = 150
for title, items, tw, th, tile in sections:
    d.text((M, y), title, font=H2, fill=CY); y += 60
    cols, rows, h = layout(items, tw, th)
    for i, (n, src) in enumerate(items):
        x = M + (i % cols) * (tw + 12); yy = y + (i // cols) * (th + 40)
        d.rounded_rectangle((x, yy, x + tw, yy + th), 10, fill=tile)
        a = frame(*src) if isinstance(src, tuple) else Image.open(src).convert("RGBA")
        a.thumbnail((tw, th), Image.LANCZOS); im.paste(a, (x + (tw - a.width) // 2, yy + (th - a.height) // 2), a)
        d.text((x + 2, yy + th + 6), n[:int(tw / 9.5)], font=L, fill=MUT)
    y += h + 30
im.save("preview/contact-sheet.png", optimize=True); print(im.size, os.path.getsize("preview/contact-sheet.png") // 1024, "KB")
