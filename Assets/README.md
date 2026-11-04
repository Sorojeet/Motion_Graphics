# Assets: reusable 2D motion graphics library

Everything here is 2D and shares one look: flat vector shapes on navy, with cyan, amber and coral accents.

Open `preview/contact-sheet.png` to see the whole library at a glance.

## What's inside

| Folder | Contents | Formats |
|---|---|---|
| `shapes/` | 20 shapes in white, cyan, amber and coral | SVG, PNG |
| `icons/` | 44 line icons in white and cyan | SVG, PNG |
| `props/` | 18 scene objects: earth, rocket, house, car, plane, vault and more | SVG, PNG |
| `characters/` | 12 characters with 10 poses each. Men: `alex`, `omar`, `kenji`, `luis`, `arthur`, `dev`. Women: `maya`, `zara`, `mei`, `aisha`, `elena`, `ruth` | SVG, PNG |
| `backgrounds/` | 10 backgrounds in 9:16 and 16:9 | SVG, PNG |
| `templates/` | 8 transparent text layouts in 9:16 and 16:9 | SVG with editable text, PNG |
| `guides/` | Safe-zone overlays for layout checks. Don't export these into a video | SVG, PNG |
| `animated/` | Transparent clips: text, transitions, effects and character loops | WebM (VP9 with alpha) |
| `sfx/` | 17 sound effects | WAV, 48 kHz, mono |
| `public/fonts/` | Montserrat (headings) and Inter (body) | TTF |
| `narration/` | Narration scripts, with a demo in `public/narration/demo/` | Text, WAV, JSON, SRT |
| `theme/` | Colors, fonts and safe zones | JSON, CSS |
| `remotion/` | Editable source for all animations | React (TSX) |
| `remotion/three/` | First-person 3D kit: camera, sky, instancing, apple, hand, forest, falling leaves, glowing particles | React Three Fiber (TSX) |
| `remotion/three/fphand.tsx` | Detailed first-person hand and forearm: 10 poses, 4 sleeve types, optional watch. See `preview/fp-hand.png` and `preview/fp-hand-details.png` | React Three Fiber (TSX) |
| `remotion/three/crowd.tsx` | Lightweight background people for crowds, in endless variety from seeds. See `preview/background-characters.png` | React Three Fiber (TSX) |
| `remotion/three/man.tsx` | Detailed stylized 3D man for third-person explainers: 5 outfits, 12 poses and 7 expressions, with a beard. See `preview/man-character.png` | React Three Fiber (TSX) |
| `remotion/three/trees.tsx` | 12 detailed 3D trees and 8 close-up leaves. See `preview/tree-varieties.png` | React Three Fiber (TSX) |
| `remotion/three/vehicles.tsx` | 22 detailed 3D vehicles: cars, truck, buses, bikes, auto rickshaw, train, tram, aircraft and boats. See `preview/vehicle-varieties.png` | React Three Fiber (TSX) |
| `remotion/three/fish.tsx` | 10 detailed 3D fish: goldfish, koi, clownfish, angelfish, trout, bass, tuna, catfish, piranha, blue tang. See `preview/fish-varieties.png` | React Three Fiber (TSX) |
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

## 3D fish

```tsx
import { Fish } from "./three/fish";

<Fish variety="koi" t={time} position={[0, 0, 0]} scale={1} />
<Fish variety="trout" swing={0} colors={{ fin: "#8899aa" }} />   // still pose, custom fin color
```

The head points toward +x and each fish is about 2 units long. `t` is the time in seconds and drives the swimming, `speed` and `swing` set the tail beat, and `phase` keeps a school out of step. Any color can be overridden with `colors`, without editing the file.

## 3D vehicles

```tsx
import { Vehicle } from "./three/vehicles";

<Vehicle variety="suv" t={time} speed={12} lights colors={{ paint: "#2255aa" }} />
<Vehicle variety="helicopter" t={time} rotorSpeed={40} position={[0, 20, 0]} />
```

Varieties: `sedan`, `hatchback`, `suv`, `sports`, `pickup`, `taxi`, `truck`, `citybus`, `schoolbus`, `doubledecker`, `bicycle`, `motorcycle`, `scooter`, `autorickshaw`, `train`, `tram`, `airliner`, `propplane`, `helicopter`, `jet`, `speedboat`, `cargoship`.

The front points toward +x, wheels rest on y = 0, and sizes are roughly real meters, so scale them to fit. `speed` (meters per second) spins the wheels and `rotorSpeed` spins propellers and rotors. They don't move the vehicle: animate `position` yourself. `lights` turns the lamps on, and `colors` sets `paint`, `accent` and `trim`. If you see flickering on far-away or very small vehicles, add `logarithmicDepthBuffer: true` to the canvas `gl` settings, as the preview does.

## 3D trees and leaves

```tsx
import { Leaf, Tree } from "./three/trees";

<Tree variety="banyan" seed={2} t={time} wind={0.3} position={[6, 0, -10]} />
<Tree variety="oak" dry={0.8} leafAmount={0.4} />   // dying tree
<Leaf variety="peepal" dry={0.5} position={[0, 1, 0]} scale={0.4} />
```

Trees: `oak`, `maple`, `birch`, `pine`, `cypress`, `palm`, `cherry`, `willow`, `banyan`, `baobab`, `apple`, `dead`. Leaves: `oak`, `maple`, `birch`, `ginkgo`, `peepal`, `willow`, `palm`, `pine`.

Trees are roughly real size in meters, based at y = 0. `seed` gives a different tree of the same kind, `t` and `wind` sway it, `dry` browns the leaves, and `leafAmount` (1 to 0) thins them. Each tree has thousands of leaves, so use few up close and the lighter `Forest` from `kit.tsx` for distant woodland. `Leaf` is about 1 unit long, and `dry` browns it from the edges inward.

## 3D man

```tsx
import { Man } from "./three/man";

<Man pose="explain" expression="smile" t={time} rotation={[0, 0.3, 0]} />
<Man from="idle" pose="point" blend={progress} expression="surprised" t={time} />
<Man pose="walk" t={time} position={[0, 0, walkZ]} colors={{ shirt: "#a33", pants: "#333" }} glasses />
```

Outfits: `outfit="shirt"` (default), `tshirt`, `hoodie`, `suit`, `jacket`. Each has its own default colors, and `colors` overrides them for one video (`inner` is the undershirt or dress shirt and drawstrings, `accent` is the tie).

Poses: `idle`, `explain`, `point`, `present`, `wave`, `think`, `shrug`, `shock`, `thumbsup`, `crossed`, `walk`, `run`. Expressions: `neutral`, `smile`, `happy`, `worried`, `surprised`, `angry`, `thinking`.

He is about 1.78 m tall, feet on y = 0, facing +z. `t` (seconds) drives breathing, blinking, gestures and walking. `from` and `blend` (0 to 1) move smoothly between poses, and `look` is the eye direction, `[x, y]` from -1 to 1. His mouth follows `expression`, since he is a main character for third-person shots and isn't lip-synced. `walk` and `run` animate in place, so move `position` yourself. Colors are set with `colors` (`skin`, `hair`, `shirt`, `pants`, `shoes`, `sole`, `eyes`, `belt`, `inner`, `accent`), and `beard` (on by default), `stubble` (0 to 1) and `glasses` change his look.

## 3D first-person hand

```tsx
import { FPHand } from "./three/fphand";

<FPHand pose="hold" sleeve="long" colors={{ sleeve: "#2f7f86", cuff: "#256a70" }} rotation={[0, 0.75, 0]} />
<FPHand from="relaxed" pose="fist" blend={progress} side="right" sleeve="bare" watch />
```

Poses: `open`, `relaxed`, `hold`, `grip`, `fist`, `point`, `thumbsup`, `pinch`, `peace`, `reach`. Sleeves: `long`, `rolled`, `short`, `bare`.

It uses the same setup as `Hand` in `kit.tsx`, so it can replace it in new videos: palm up at the origin, fingers toward -z, arm toward +z, about the same size. `side` is `left` (default) or `right`. `grip` (0 to 1) overrides the pose with open-to-closed fingers, and `wiggle` with `t` adds small finger motion. `Hand` stays in the kit so earlier videos don't change. Rotate the whole hand for poses like `thumbsup`.

## 3D background people

```tsx
import { Crowd, Extra } from "./three/crowd";

<Crowd count={40} seed={3} area={[24, 14]} poses={["stand", "talk", "phone"]} t={time} />
<Crowd count={20} seed={8} area={[6, 30]} flow={1.4} t={time} />   // people walking along z
<Extra seed={5} spec={{ kind: "elderwoman" }} pose="wave" t={time} position={[2, 0, -4]} />
```

Each `seed` gives a person with their own age, body type, skin tone, hair and clothes, always the same for that seed. `spec` or `force` overrides any of these, such as `{ kind: "girl", top: "#c33" }`. Kinds: `man`, `woman`, `boy`, `girl`, `elderman`, `elderwoman`. Poses: `stand`, `talk`, `phone`, `wave`, `cheer`, `lookup`, `clap`, `armscrossed`, `sit`, `walk`, `run`. `Crowd` can also place each person with `members`. They're simple shapes built for mid and far distance, so use `Man` for anyone close to the camera.

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
