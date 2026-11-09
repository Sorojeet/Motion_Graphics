#!/usr/bin/env python3
"""Narration, timings (tele_timeline.json) and sound for: what if people could teleport."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: IATA (>5 billion air passengers in 2025); WHO Global Status Report on Road Safety 2023 (1.19M deaths/yr); Our World in Data (transport 24% of energy CO2; passenger road 45%, aviation 12% of transport)
SEG=[('TODAY','Anywhere in a blink','',["What if anyone could teleport, anywhere on Earth, in a blink?","Just picture a place, and you're there."]),
('DAY 1','No more commute','COMMUTE TIME: 0 MINUTES',["Day one. Your commute drops to zero.","The morning traffic jam simply melts away."]),
('WEEK 1','Airports go quiet','~5 BILLION AIR PASSENGERS A YEAR (2025)',["Week one. Airlines carry around five billion passengers a year. Suddenly, almost nobody needs a plane.","Airlines, taxis and car makers scramble to survive."]),
('MONTH 1','Empty roads','ROAD CRASHES: ~1.19 MILLION DEATHS A YEAR',["Month one. Road crashes kill about one point two million people a year.","With far fewer cars on the road, that number could drop sharply."]),
('MONTH 6','Cleaner air','TRANSPORT: ~24% OF ENERGY CO₂',["Transport makes about a quarter of the world's carbon emissions from energy, and much of it comes from carrying people.","As those trips vanish, city air starts to clear."]),
('YEAR 1','Live anywhere','',["Year one. You can live by a quiet beach and still pop into the office every morning.","Remote places suddenly become prime real estate."]),
('YEAR 5','New problems','NO-TELEPORT ZONES',["But there are new problems.","Borders, banks and bedrooms all need protection from surprise visitors."]),
('YEAR 5','Where to?','',["The world suddenly feels tiny.","So, where would you teleport first?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for when,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.05,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.25*sr),'float32')); t+=.25; out.append({'start':round(st,3),'end':round(t,3),'when':when,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.3*sr),'float32')); t+=2.3; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr
S=[o['start'] for o in out]
# teleport moments (used by the scene for the visual effect and here for the whoosh)
tp=[S[0]+4.2,S[1]+4.6,S[5]+1.0,S[6]+3.0,S[7]+.8]
json.dump({'duration':round(DUR,3),'teleports':[round(x,3) for x in tp],'segments':out},open(here/'tele_timeline.json','w'),indent=1)
rng=np.random.default_rng(55)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
m=pad(220,.34)+pad(277.2,.22)+pad(329.6,.16)+pad(440,.08)+pad(554.4,.05)*np.interp(T,[0,S[5],S[6]],[0,.5,1])
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.2)*(.85+.15*np.sin(2*np.pi*T/6)); m=m/np.abs(m).max()*10**(-21/20)
wh=np.zeros(N)
for a in tp:
    i=int((a-.15)*sr); l=min(int(.7*sr),N-i); tt=np.arange(l)/sr; f=300+2600*tt/.7; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/.7)**2*.6+rng.standard_normal(l)*np.exp(-((tt-.35)/.15)**2)*.25
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh*10**(-17/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/tele_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]; print(tp)
