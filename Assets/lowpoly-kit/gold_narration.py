#!/usr/bin/env python3
"""Narration, timings (gold_timeline.json) and sound for: what if gold was as common as iron."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: World Gold Council (224,200 t above ground, 22.6 m cube, central banks ~39,300 t, end-Q3 2026); gold ~$127/g on 3 Nov 2026 (pricegold.net)
SEG=[('TODAY','Gold is rare','ALL GOLD EVER MINED: ~224,000 TONNES',["What if gold was as common as iron?","Today, all the gold ever mined would fit in a cube about twenty two metres wide."]),
('DAY 1','The price collapses','GOLD TODAY: ABOUT $127 A GRAM',["Day one. Gold turns up in every hill and backyard.","Its price collapses, and wedding rings are suddenly worth about as much as nails."]),
('WEEK 1','Savings vanish','CENTRAL BANKS HOLD ~39,000 TONNES',["Week one. Families who saved in gold lose those savings overnight.","Central banks, holding around thirty nine thousand tonnes, watch it become ordinary metal."]),
('MONTH 3','Gold gets useful','NEVER RUSTS · ONLY SILVER &amp; COPPER CONDUCT BETTER',["Month three. Then people notice what gold is good at.","It never rusts, and only silver and copper carry electricity better."]),
('YEAR 1','Gold moves into homes','WIRES · PIPES · GUTTERS',["Year one. Wiring, pipes and gutters are made of gold, and none of it corrodes."]),
('YEAR 3',"Heavy and soft",'GOLD IS ~2.5× DENSER THAN IRON',["But gold is soft, and about two and a half times heavier than iron.","A gold bike bends, and a gold car would be painfully heavy, so steel still does the heavy lifting."]),
('YEAR 10','A golden neighbourhood','GOLD REFLECTS INFRARED HEAT',["Year ten. Golden roofs bounce back the sun's heat, the same trick astronauts' visors use."]),
('YEAR 10','Would you still want it?','',["Gold stops being treasure, and becomes one of the most useful metals we have.","So, would you still want a gold ring?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for when,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.08,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.25*sr),'float32')); t+=.25; out.append({'start':round(st,3),'end':round(t,3),'when':when,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.3*sr),'float32')); t+=2.3; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr
json.dump({'duration':round(N/sr,3),'segments':out},open(here/'gold_timeline.json','w'),indent=1)
S=[o['start'] for o in out]+[N/sr]; rng=np.random.default_rng(21)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
sad=np.interp(T,[S[1],S[2],S[3],S[3]+1],[0,1,1,0])
m=(pad(146.8,.4)+pad(220,.26)+pad(293.7,.14)+pad(370,.08))*(1-sad*.7)+(pad(110,.4)+pad(130.8,.22)+pad(164.8,.14))*sad
m*=np.minimum(1,T/1.2)*np.minimum(1,(N/sr-T)/2.2)*(.85+.15*np.sin(2*np.pi*T/7)); m=m/np.abs(m).max()*10**(-21/20)
chime=np.zeros(N)
for a in [S[1]+.2]+list(rng.uniform(S[1],S[2],14))+list(rng.uniform(S[6],S[7],8)):
    i=int(a*sr); l=min(int(1.2*sr),N-i); tt=np.arange(l)/sr; f=rng.choice([1318.5,1568,1760,2093]); chime[i:i+l]+=np.sin(2*np.pi*f*tt)*np.exp(-tt*5)*.5
birds=np.zeros(N)
for _ in range(120):
    a=rng.uniform(0,N/sr); i=int(a*sr); l=min(int(rng.uniform(.06,.14)*sr),N-i); tt=np.arange(l)/sr; birds[i:i+l]+=np.sin(2*np.pi*(rng.uniform(2800,4000)*tt+rng.uniform(-5000,5000)*tt*tt))*np.sin(np.pi*tt/(l/sr+1e-9))
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+chime/np.abs(chime).max()*10**(-30/20)+birds/np.abs(birds).max()*10**(-36/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/gold_mix.wav',mix,sr)
print(N/sr); [print(o['start'],o['caption']) for o in out]
