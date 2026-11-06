#!/usr/bin/env python3
"""Generates narration sentence by sentence and writes gravity_timeline.json (exact timings) plus out/audio/narration.wav."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'
VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# (gravity at start, gravity at end, hud caption, sentences)
SEG=[
(100,100,'Normal Earth',["What if gravity got ten percent weaker, every single minute?","Could you survive until it hits zero?"]),
(100,90,'Slightly lighter',["Minute one. Ninety percent.","You feel a little lighter, and the stairs feel easier.","A seventy kilo person now weighs sixty three."]),
(90,70,'A bounce in every step',["Minute three. Seventy percent.","Everyone walks with a bounce.","Fountains shoot higher, and athletes smash every world record."]),
(70,50,'Half your weight',["Minute five. Half of normal gravity.","A single stride carries you across the park.","Even tripping happens in slow motion."]),
(50,40,'Close to Mars',["Minute six. Forty percent, almost the same as standing on Mars.","A good jump now lands you on the roof of a car."]),
(40,20,'Close to the Moon',["Minute eight. Twenty percent, close to the Moon.","Crates and cars drift up with every gust of wind.","And the trees start to tear free."]),
(20,10,'The air is leaving',["Minute nine. Ten percent.","Now the air is the real problem.","Gravity holds our atmosphere down, and without it, the sky starts to thin."]),
(10,0,'Zero gravity',["Minute ten. Zero.","Nothing holds anything.","The Earth keeps spinning, so people, cars and whole buildings drift into the dark."]),
(0,0,'Zero gravity',["Then the planet itself, held together only by its own gravity, begins to come apart.","So, which minute would you have made it to?"]),
]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz'))
sr=24000; pieces=[]; t=.35; out=[]; pieces.append(np.zeros(int(.35*sr),'float32'))
for a,b,cap,ss in SEG:
    start=t; lines=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.08,lang='en-us'); d=len(x)/sr; lines.append({'t':round(t,3),'d':round(d,3),'text':s})
        pieces+= [x,np.zeros(int(.22*sr),'float32')]; t+=d+.22
    pieces.append(np.zeros(int(.3*sr),'float32')); t+=.3
    out.append({'start':round(start,3),'end':round(t,3),'from':a,'to':b,'caption':cap,'lines':lines})
pieces.append(np.zeros(int(2.2*sr),'float32')); t+=2.2
a=np.concatenate(pieces); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/narration.wav',a,sr)
json.dump({'duration':round(len(a)/sr,3),'segments':out},open(here/'gravity_timeline.json','w'),indent=1)
print(len(a)/sr); [print(round(o['start'],1),o['caption']) for o in out]; print(sum(len(l['text'].split()) for o in out for l in o['lines']),'words')
