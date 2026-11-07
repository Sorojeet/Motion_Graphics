#!/usr/bin/env python3
"""First-person narration, timings (spin_timeline.json) and sound for: Earth's spin doubles every hour."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# hour reached in this segment, caption, sentences. Physics: day = 24h / 2^hour; equator weightless at an 84 minute day (BBC Science Focus)
SEG=[(0,'Normal day',["What if Earth's spin doubled every hour?","You're standing on a rooftop, right on the equator."]),
(1,'Twelve-hour days',["Hour one. A day lasts twelve hours, and the ground beneath you races along at over three thousand kilometres an hour.","The oceans pile up at the equator, and the sea floods the streets below."]),
(2,'Storms spin up',["Hour two. Six-hour days. The sun sprints across the sky, and storms spin faster and harder."]),
(3,'You feel lighter',["Hour three. Sunrise to sunset takes just ninety minutes.","The spin is fighting gravity now. You weigh about a fifth less."]),
(4,'Barely holding on',["Hour four. A whole day lasts ninety minutes.","Gravity barely holds you down. You weigh about an eighth of normal."]),
(4.093,'Weightless',["Six minutes later, Earth spins once every eighty four minutes.","At the equator, the spin finally beats gravity. Water starts falling up, and so do you."]),
(5,'Earth comes apart',["Hour five. Forty five minute days.","The planet flattens, and its equator starts shedding rock into space."]),
(5,'Earth comes apart',["From up here, you watch it go.","So, how many hours would you have lasted?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for h,cap,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.08,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.25*sr),'float32')); t+=.25; out.append({'start':round(st,3),'end':round(t,3),'hour':h,'caption':cap,'lines':L})
P.append(np.zeros(int(2.4*sr),'float32')); t+=2.4; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr
json.dump({'duration':round(N/sr,3),'segments':out},open(here/'spin_timeline.json','w'),indent=1)
S=[o['start'] for o in out]+[N/sr]; rng=np.random.default_rng(12)
storm=np.interp(T,[S[1],S[2],S[3],S[4],S[5],S[5]+1.5],[.25,.55,1,.9,.6,0]); space=(T>S[6]).astype(float)
w=rng.standard_normal(N); wind=np.convolve(w,np.ones(40)/40,'same'); wind*=.6+.4*np.sin(2*np.pi*T*.21)*np.sin(2*np.pi*T*.07+2); wind/=np.abs(wind).max()
hiss=np.convolve(rng.standard_normal(N),[1,-1],'same'); hiss/=np.abs(hiss).max()
city=np.convolve(rng.standard_normal(N),np.ones(300)/300,'same'); city/=np.abs(city).max()
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
tense=np.interp(T,[S[1],S[3],S[5],S[6]],[0,.6,1,.4]); calm=np.clip(1-tense,0,1)
m=(pad(130.8,.4)+pad(196,.26)+pad(293.7,.12))*calm+(pad(98,.4)+pad(146.8,.25)+pad(155.6,.12)+pad(49,.4))*tense+pad(261.6,.14)*space+pad(392,.08)*space
m*=np.minimum(1,T/1.2)*np.minimum(1,(N/sr-T)/2.2); m=m/np.abs(m).max()*10**(-21/20)
nn=n/np.abs(n).max()*10**(-1.5/20); amb=wind*storm*10**(-25/20)+hiss*np.clip(storm-.4,0,1)*10**(-36/20)+city*(T<S[1]+3)*10**(-33/20)
mix=nn+m+amb*(1-space); mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/spin_mix.wav',mix,sr)
print(N/sr); [print(o['start'],o['caption']) for o in out]
