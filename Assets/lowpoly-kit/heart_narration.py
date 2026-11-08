#!/usr/bin/env python3
"""Narration, timings + heart-rate keyframes (heart_timeline.json) and sound for: your heart beats like a hummingbird's."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: Smithsonian (~1,200 bpm by day, torpor as low as 40 bpm); Audubon + Texas Parks & Wildlife (155,000 kcal/day human-scaled,
# feed every 10-15 min, 285 lb of hamburger, torpor cuts metabolism up to 95%)
SEG=[('8:00 AM','A normal heart','HUMAN RESTING HEART: 60–100 BPM',["What if your heart beat like a hummingbird's?","Right now, it beats about seventy times a minute, a normal, steady rhythm."]),
('8:01 AM','Hummingbird mode','HUMMINGBIRDS: UP TO ~1,200 BPM',["Suddenly, it jumps to twelve hundred. That's twenty beats every second.","Blood rushes through you like water from a fire hose."]),
('12:00 PM','Burning fuel','HUMAN-SIZED HUMMINGBIRD: ~155,000 CALORIES A DAY',["Your body burns energy so fast that experts estimate a human-sized hummingbird would need about a hundred and fifty five thousand calories a day.","That's more than forty times what a typical person burns."]),
('4:00 PM','Always eating','EAT EVERY 10–15 MINUTES',["That's around a hundred and thirty kilos of burgers.","You'd have to eat every ten to fifteen minutes, from sunrise to sunset."]),
('11:00 PM','Torpor','TORPOR: HEART DOWN TO ~40 BPM',["At night, your body drops into torpor, a deep, cold shutdown.","Your heart slows to about forty beats a minute, and your body cools right down."]),
('6:00 AM','Back to life','TORPOR CUTS ENERGY USE BY UP TO 95%',["It saves up to ninety five percent of your energy.","Then, at sunrise, you buzz back to life almost instantly, starving."]),
('6:05 AM','Life in the fast lane','',["Living this fast comes at a price.","So, would you trade your heart for a hummingbird's?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for when,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.0,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.25*sr),'float32')); t+=.25; out.append({'start':round(st,3),'end':round(t,3),'when':when,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.3*sr),'float32')); t+=2.3; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr
S=[o['start'] for o in out]; wake=out[5]['lines'][1]['t']+.6
keys=[[0,70],[S[1],70],[S[1]+1.4,1200],[S[4]+1,1200],[S[4]+5,40],[wake,40],[wake+1.4,1200],[DUR,1200]]
json.dump({'duration':round(DUR,3),'bpm':[[round(a,3),b] for a,b in keys],'segments':out},open(here/'heart_timeline.json','w'),indent=1)
def bpm(x):
    for (a,va),(b,vb) in zip(keys,keys[1:]):
        if x<=b: u=np.clip((x-a)/max(b-a,1e-6),0,1); u=u*u*(3-2*u); return va+(vb-va)*u
    return keys[-1][1]
# heartbeat: lub-dub thumps at the current rate (a low rumble at 1,200 bpm)
hb=np.zeros(N); ph=0; tt=0
while tt<DUR:
    b=bpm(tt); i=int(tt*sr); gain=1 if b<200 else .35
    for off,f,a in ((0,52,1),(.11 if b<200 else .018,64,.7)):
        j=i+int(off*sr); l=min(int(.09*sr),N-j)
        if l>0: q=np.arange(l)/sr; hb[j:j+l]+=np.sin(2*np.pi*f*q)*np.exp(-q*38)*a*gain
    tt+=60/b
hb/=np.abs(hb).max()
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
night=np.interp(T,[S[4],S[4]+2,S[5]+1,wake],[0,1,1,0])
m=(pad(164.8,.36)+pad(246.9,.24)+pad(329.6,.14)+pad(415.3,.07))*(1-night*.8)+(pad(110,.35)+pad(164.8,.2)+pad(196,.1))*night
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.2)*(.85+.15*np.sin(2*np.pi*T/6)); m=m/np.abs(m).max()*10**(-22/20)
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+hb*10**(-17/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/heart_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
