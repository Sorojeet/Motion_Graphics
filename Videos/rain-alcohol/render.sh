#!/bin/bash
# Renders each scene to its own file, joins them and adds sound. Usage: render.sh OUTDIR [chrome path]
cd "$(dirname "$0")/../../Assets"; O=$1; CH=${2:+--browser-executable=$2}; mkdir -p $O
F=(0 170 393 683 942 1196 1506 1782 2032 2340); : > $O/list.txt
for i in 0 1 2 3 4 5 6 7 8; do a=${F[$i]}; b=$((${F[$((i+1))]}-1)); f=$O/s$i.mp4; echo "file '$f'" >> $O/list.txt; [ -f $f ] && continue
  npx remotion render ../Videos/rain-alcohol/src/index.ts RainAlcohol $O/t$i.mp4 --frames=$a-$b --public-dir=public --gl=swangle --codec=h264 --crf=18 --muted --concurrency=2 --log=error $CH && mv $O/t$i.mp4 $f || exit 1; done
ffmpeg -y -loglevel error -f concat -safe 0 -i $O/list.txt -c copy $O/v.mp4
python3 ../Videos/rain-alcohol/mix.py $O/mix.wav
ffmpeg -y -loglevel error -i $O/v.mp4 -i $O/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $O/what-if-it-rained-alcohol.mp4 && echo DONE
