#!/usr/bin/env python3
"""Narration, timings (vanish_timeline.json) and sound for: what if everyone on Earth vanished."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: Live Science / Weisman (subways flood in ~36 h, bridges fail within a few hundred years, city streets become
# grassland and forest within ~500 years, plastic persists for thousands of years, CO2 up to ~100,000 years);
# Scientific American / Weisman (flooding within 48 h, streets crater within a couple of decades, roads crack in months)
SEG=[('0','SECONDS','Everyone is gone','',["What if every person on Earth vanished, right now?","Eight billion people, gone in a blink. Cars roll to a stop. The city falls silent."]),
('2','DAYS','The lights go out','SUBWAYS FLOOD IN ABOUT 36 HOURS',["Two days later. With nobody running the power stations, the lights go out.","And without pumps, the subway tunnels fill with water."]),
('1','YEAR','Nature moves in','ROADS CRACK WITHIN MONTHS',["One year. Weeds push up through cracks in the road, and wild animals wander the empty streets."]),
('20','YEARS','Streets cave in','STREETS CRATER WITHIN DECADES',["Twenty years. Streets buckle and cave in, cars rust away, and young trees grow right through the tarmac."]),
('300','YEARS','Steel gives way','BRIDGES FAIL WITHIN A FEW HUNDRED YEARS',["Three hundred years. Rust has eaten through the steel.","Bridges fall, and the towers begin to come down."]),
('500','YEARS','A forest city','CITY TO FOREST: ABOUT 500 YEARS',["Five hundred years. Where the avenue used to be, there is a forest.","Vines cover the last walls, and deer graze where traffic once roared."]),
('100,000','YEARS','What remains','PLASTIC LASTS THOUSANDS OF YEARS',["One hundred thousand years. Even the carbon we added to the air has faded.","A few stones and some buried plastic are all that say we were ever here.","The Earth simply moves on.","So, what would you want to leave behind?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'vanish_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[0,.7,.45,.5,.75,.4,.2,.2])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-20/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.3,.6,.3,.4,.7,.3,.3,.3])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/vanish_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
