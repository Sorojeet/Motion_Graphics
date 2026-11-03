# Assets: reusable 2D motion graphics library

Everything here is 2D and shares one look: flat vector shapes on navy, with cyan, amber and coral accents.

Open `preview/contact-sheet.png` to see the whole library at a glance.

## What's inside

| Folder | Contents | Formats |
|---|---|---|
| `shapes/` | 20 shapes in white, cyan, amber and coral | SVG, PNG |
| `icons/` | 42 line icons in white and cyan | SVG, PNG |
| `props/` | 16 scene objects: earth, rocket, house, car, meteor and more | SVG, PNG |
| `characters/` | 2 characters (`alex`, `maya`) with 10 poses each | SVG, PNG |
| `backgrounds/` | 10 backgrounds in 9:16 and 16:9 | SVG, PNG |
| `templates/` | 8 transparent text layouts in 9:16 and 16:9 | SVG with editable text, PNG |
| `guides/` | Safe-zone overlays for layout checks. Don't export these into a video | SVG, PNG |
| `animated/` | Transparent clips: text, transitions, effects and character loops | WebM (VP9 with alpha) |
| `sfx/` | 16 sound effects | WAV, 48 kHz, mono |
| `public/fonts/` | Montserrat (headings) and Inter (body) | TTF |
| `narration/` | Narration scripts, with a demo in `public/narration/demo/` | Text, WAV, JSON, SRT |
| `theme/` | Colors, fonts and safe zones | JSON, CSS |
| `remotion/` | Editable source for all animations | React (TSX) |
| `lib/`, `scripts/` | Source art and build scripts | JS, Python |

## Using the assets

**In a video editor (CapCut, Canva, After Effects, Premiere):** drag in the PNG, SVG or WAV files directly.

Transparent WebM support varies by editor. If a clip shows a black background, render ProRes 4444 instead, as shown under Rebuilding. PNG files are the safe fallback.

**In Remotion:**

```bash
cd Assets && npm install
npm run studio    # browse and edit every animation
```

```tsx
import { Character, TitleCard, Confetti, CircleIris, Icon, Prop } from "./components";

<TitleCard kicker="WHAT IF" title="THE MOON VANISHED" />
<Character look="maya" action="wave" height={700} />
<Caption text="The tides would *collapse* overnight" />
```

## Narration

There are two voices: `michael` and `bella`. Write a script with one line per voice, like `narration/scripts/demo.txt`:

```text
michael: What if the *Moon* disappeared tonight?
bella: At first, you might not notice.
```

Then generate the audio and captions:

```bash
pip install -r narration/requirements.txt   # also needs ffmpeg
npm run narrate -- narration/scripts/my-video.txt
npm run narrate -- narration/scripts/my-video.txt --speed 0.95   # slower
```

The first run downloads the voice model (about 350 MB) to `.models/`, which isn't committed. Each video gets `public/narration/my-video/` with:

- `narration.wav`: the audio, leveled to about -16 LUFS
- `narration.srt`: captions for any video editor
- `narration.json`: timings for Remotion, including when each line starts, for syncing scenes

```tsx
import data from "../public/narration/my-video/narration.json";

<Audio src={staticFile("narration/my-video/narration.wav")} />
<NarrationCaptions data={data} />
```

Caption phrases are timed exactly from the generated audio, but word highlighting within a phrase is estimated. Output for new videos isn't committed by default; remove the `public/narration/*` line in `.gitignore` to keep it. To add a voice, edit `VOICES` in `scripts/narrate.py`.

## Good to know

- **Transitions:** each one fully covers the frame at its exact midpoint, so cut between your two scenes there. That's frame 15 of 31 for the wipes and frame 7 of 15 for `Flash`.
- **Loops:** `Snow`, `Rain`, `Sparks` and `Dust` are built to loop, and `Smoke` is close. `Confetti`, `Explosion` and the text clips play once.
- **Character animation:** poses in `lib/character.js` are joint angles, so you can add a pose by adding one line.
- **Safe zones:** the 9:16 margins in `theme/theme.json` are a layout guide for Shorts-style UI. Check them against the current app, as platforms change their overlays.
- **Placeholders:** text in `templates/` is sample copy. Replace `00%` and "Source: add your source" with real, verified data.

## Rebuilding

Change the colors in `theme/theme.json`, then rebuild:

```bash
npm run build:static            # shapes, icons, props, characters, backgrounds, templates
npm run build:animated          # all transparent WebM clips
npm run build:animated -- Flash --mov   # ProRes 4444 copy in out/mov (large, not committed)
npm run build:sfx               # sound effects (needs Python, numpy and scipy)
```

Character colors are set in `presets` in `lib/character.js`, and some natural prop colors (like trees) are set in `lib/props.js`.

See `LICENSES.md` for asset sources and terms.
