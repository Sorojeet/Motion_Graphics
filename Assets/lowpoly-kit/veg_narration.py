#!/usr/bin/env python3
"""Narration, timings (veg_timeline.json) and sound mix for: what if everyone went vegetarian."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# caption, big number, unit, fact line (sources: Oxford Martin School / Springmann 2016; Our World in Data; FAO), sentences
SEG=[('Before the switch','0','DAYS','NO MEAT · NO FISH · EGGS &amp; DAIRY STAY',["What if everyone on Earth went vegetarian, overnight?","No meat, no fish. Just plants, eggs and dairy."]),
('Meat counters close','1','DAY','BUTCHERS &amp; BURGER BARS: CLOSED',["Day one. Butchers and burger bars open with nothing to sell.","Vegetable stalls are sold out by lunch."]),
('Herds no longer needed','1','WEEK','80+ BILLION ANIMALS RAISED FOR MEAT A YEAR',["Week one. Every year, more than eighty billion land animals are raised for meat.","Now, none of them are needed, so farmers stop breeding them."]),
('Jobs disappear','3','MONTHS','1+ BILLION PEOPLE DEPEND ON LIVESTOCK',["Month three. More than a billion people depend on livestock for a living.","Many could lose their income, especially herders on dry land where crops barely grow."]),
('Pastures empty','1','YEAR','LIVESTOCK: 80% OF FARMLAND · 17% OF CALORIES',["Year one. Livestock uses about eighty percent of the world's farmland, but gives us only seventeen percent of our calories.","Dairy cows and hens stay, but vast pastures fall quiet."]),
('Nature moves back in','10','YEARS','GRAZING LAND TURNING WILD',["Year ten. Empty grazing land slowly turns back into forest and meadow, and wildlife returns."]),
('A lighter footprint','2050','','FOOD EMISSIONS −63% (2050 ESTIMATE)',["By twenty fifty, researchers estimate a vegetarian world would cut food emissions by almost two thirds,","and prevent around seven million deaths a year through healthier eating."]),
('Would you switch?','2050','','7.3 MILLION DEATHS AVOIDED A YEAR (EST.)',["A greener planet, but a hard switch for the people who farm animals.","So, would you give up meat to see it?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for cap,num,unit,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.1,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.18*sr),'float32')]; t+=d+.18
    P.append(np.zeros(int(.22*sr),'float32')); t+=.22; out.append({'start':round(st,3),'end':round(t,3),'caption':cap,'num':num,'unit':unit,'fact':fact,'lines':L})
P.append(np.zeros(int(2.3*sr),'float32')); t+=2.3; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr
json.dump({'duration':round(N/sr,3),'segments':out},open(here/'veg_timeline.json','w'),indent=1)
S=[o['start'] for o in out]+[N/sr]; rng=np.random.default_rng(9)
def win(a,b,f=.6): return np.clip(np.minimum((T-a)/f,(b-T)/f),0,1)
# market chatter (bandpassed noise with slow swells), farm birdsong (short chirps)
w=rng.standard_normal(N); ch=np.convolve(w,np.ones(12)/12,'same')-np.convolve(w,np.ones(70)/70,'same'); ch*=.7+.3*np.sin(2*np.pi*T*.37)*np.sin(2*np.pi*T*.13+1); ch/=np.abs(ch).max()
market=win(0,S[2])*1+win(S[7],N/sr)*.8
birds=np.zeros(N)
for _ in range(240):
    at=rng.uniform(S[2],N/sr); i=int(at*sr); l=int(rng.uniform(.06,.16)*sr); f0=rng.uniform(2600,4200); tt=np.arange(min(l,N-i))/sr
    birds[i:i+len(tt)]+=np.sin(2*np.pi*(f0*tt+rng.uniform(-6000,6000)*tt*tt))*np.sin(np.pi*tt/(l/sr))*rng.uniform(.3,1)
bw=np.interp(T,[S[2],S[4],S[5],S[6],S[7],S[7]+.5],[.25,.35,1,1,.7,0])*(T>S[2])
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
low=np.interp(T,[S[2],S[3],S[4],S[5]],[0,1,1,0])
m=(pad(130.8,.42)+pad(196,.28)+pad(329.6,.14)+pad(392,.08)*(T>S[5]))*(1-.5*low)+(pad(110,.4)+pad(164.8,.24))*low
m*=np.minimum(1,T/1.2)*np.minimum(1,(N/sr-T)/2.2)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-21/20)
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+ch*market*10**(-31/20)+birds/np.abs(birds).max()*bw*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/veg_mix.wav',mix,sr)
print(N/sr); [print(o['start'],o['caption']) for o in out]
