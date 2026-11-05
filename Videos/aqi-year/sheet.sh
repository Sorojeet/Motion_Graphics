#!/bin/bash
# Check sheet: renders the frames and tiles them. Usage: sheet.sh OUTDIR name columns frame ...
O=$1; N=$2; C=$3; shift 3; "$(dirname "$0")/stills.sh" "$O" "$@" || exit 1
a=(); for f in "$@"; do a+=(-i "$O/f$f.jpg"); done; n=$#; r=$(( (n+C-1)/C ))
ffmpeg -y -loglevel error "${a[@]}" -filter_complex "$(for i in $(seq 0 $((n-1))); do printf "[%d:v]drawtext=text='%s':x=8:y=8:fontsize=26:fontcolor=yellow:box=1:boxcolor=black[v%d];" $i "${@:$((i+1)):1}" $i; done)$(for i in $(seq 0 $((n-1))); do printf "[v%d]" $i; done)xstack=inputs=$n:grid=${C}x$r:fill=black" "$O/$N.jpg"
