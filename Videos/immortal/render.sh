#!/bin/bash
# Renders each scene to its own file, joins them and adds sound. Usage: render.sh OUTDIR [chrome path]
cd "$(dirname "$0")/../../Assets"; O=$1; CH=${2:+--browser-executable=$2}; mkdir -p $O
F=(0 135 384 630 858 1098 1299 1530 1767 1959 2238 2340); : > $O/list.txt
npx remotion bundle ../Videos/immortal/src/index.ts --public-dir=public --out-dir=$O/bundle --log=error || exit 1
for i in 0 1 2 3 4 5 6 7 8 9 10; do a=${F[$i]}; b=$((${F[$((i+1))]}-1)); f=$O/s$i.mp4; echo "file '$f'" >> $O/list.txt; [ -f $f ] && continue
  npx remotion render $O/bundle Immortal $O/t$i.mp4 --frames=$a-$b --gl=swangle --codec=h264 --crf=18 --muted --concurrency=2 --timeout=120000 --log=error $CH && mv $O/t$i.mp4 $f || exit 1; echo "scene $i done $(date +%H:%M:%S)"; done
ffmpeg -y -loglevel error -f concat -safe 0 -i $O/list.txt -c copy $O/v.mp4
python3 ../Videos/immortal/mix.py $O/mix.wav
ffmpeg -y -loglevel error -i $O/v.mp4 -i $O/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $O/what-if-you-became-immortal.mp4 && echo DONE
