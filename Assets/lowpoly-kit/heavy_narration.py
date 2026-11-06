#!/usr/bin/env python3
"""Narration, timings (heavy_timeline.json) and sound mix for: gravity doubles every minute."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
SEG=[(0,'Normal Earth',["What if gravity doubled, every single minute?","How long do you think you'd last?"]),
(1,'Every step is a struggle',["Minute one. Two G.","You weigh double, like carrying another person on your back.","Birds start falling out of the sky."]),
(2,'Blackout',["Minute two. Four G.","You can't stand anymore. Your heart can't push blood up to your brain, and most people black out right here."]),
(3,'Things start to break',["Minute three. Eight G.","Trees snap under their own weight, and cars sink onto their axles."]),
(4,'The city falls',["Minute four. Sixteen G.","Towers were never built for this. They come down, floor by floor."]),
(5,'Stronger than the Sun',["Minute five. Thirty two G.","That's stronger than the gravity on the surface of the Sun.","The whole city is now a thin layer of rubble."]),
(10,'Mountains flatten',["Minute ten. One thousand G.","Rock itself can't hold its shape. The tallest mountains slump to the height of a house."]),
(17,'A dying star',["Minute seventeen. One hundred thousand G, like the surface of a white dwarf.","Earth crushes itself into a glowing ball, and the Moon starts falling in."]),
(29,'Black hole',["Before minute thirty, Earth collapses completely.","Everything you have ever known, inside a black hole.","So be honest. Would you have made it past minute two?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n,cap,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.08,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.22*sr),'float32')); t+=.22; out.append({'start':round(st,3),'end':round(t,3),'minute':n,'caption':cap,'lines':L})
P.append(np.zeros(int(2.3*sr),'float32')); t+=2.3; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr
json.dump({'duration':round(N/sr,3),'segments':out},open(here/'heavy_timeline.json','w'),indent=1)
S=[o['start'] for o in out]; lvl=np.interp(T,S,[0,.1,.25,.4,.65,.8,.7,.9,.55])
rng=np.random.default_rng(5); w=rng.standard_normal(N); rum=np.convolve(w,np.ones(220)/220,'same'); rum/=np.abs(rum).max()
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.005,1.1),(.995,2.3)))*g
m=(pad(110,.4)+pad(164.8,.25)+pad(220,.16))*(1-lvl*.6)+pad(55,.7)*lvl+pad(41.2,.8)*lvl**2+pad(58.3,.3)*lvl**2
m*=np.minimum(1,T/1.2)*np.minimum(1,(N/sr-T)/2.2); m=m/np.abs(m).max()*10**(-20/20)
def hit(at,g=1):
    x=np.zeros(N); l=int(.9*sr); i=int(at*sr); e=min(l,N-i); x[i:i+e]=(np.sin(2*np.pi*48*np.arange(e)/sr)+.5*rng.standard_normal(e)*np.exp(-np.arange(e)/(.05*sr)))*np.exp(-np.arange(e)/(.22*sr))*g; return x
hits=sum(hit(S[i],.18+.05*i) for i in range(1,9)); nn=n/np.abs(n).max()*10**(-1.5/20)
mix=nn+m+rum*lvl*10**(-27/20)+hits; mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/heavy_mix.wav',mix,sr)
print(N/sr); [print(o['start'],o['caption']) for o in out]
