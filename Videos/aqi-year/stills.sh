#!/bin/bash
# Renders check frames. Usage: stills.sh OUTDIR frame [frame ...]   Needs node_modules reachable from the repo root.
cd "$(dirname "$0")/../../Assets"; O=$1; shift; mkdir -p "$O"
npx remotion bundle ../Videos/aqi-year/src/index.ts --public-dir=public --out-dir="$O/bundle" --log=error || exit 1
for f in "$@"; do npx remotion still "$O/bundle" AqiYear "$O/f$f.jpg" --frame=$f --gl=swangle --image-format=jpeg --jpeg-quality=70 --scale=0.4 --timeout=120000 --log=error --browser-executable=/usr/bin/google-chrome || exit 1; done
