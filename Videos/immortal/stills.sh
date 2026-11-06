#!/bin/bash
# Check frames. Usage: stills.sh OUTDIR "t1 t2 ..." (seconds). Run from anywhere.
cd "$(dirname "$0")/../../Assets"; O=$1; mkdir -p $O
[ -d $O/bundle ] || npx remotion bundle ../Videos/immortal/src/index.ts --public-dir=public --out-dir=$O/bundle --log=error || exit 1
for s in $2; do f=$(python3 -c "print(round($s*30))"); npx remotion still $O/bundle Immortal $O/f_$s.png --frame=$f --gl=swangle --log=error --browser-executable=/usr/bin/google-chrome --timeout=120000 || exit 1; done
