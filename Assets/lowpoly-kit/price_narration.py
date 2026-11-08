#!/usr/bin/env python3
"""First-person narration, timings (price_timeline.json) and sound for: what if everything had the same price."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Price ceilings -> shortages, queues, black markets: Encyclopedia.com "Economic Shortage"
SEG=[('TODAY','Everything, one price','GUM = PHONE = CAR',["What if everything cost exactly the same?","A pack of gum, a phone and a car. All one price."]),
('HOUR 1','A bargain on everything big','ELECTRONICS: SELLING FAST',["Hour one. You walk into the mall, and anything big is suddenly a bargain.","Phones and TVs sell out in minutes."]),
('DAY 1','Small things cost a fortune','A BOTTLE OF WATER = A TV',["Day one. But a bottle of water now costs as much as a TV.","A pack of gum is a luxury, and nobody buys small things anymore."]),
('DAY 2','Shops get clever','ONE PRICE = ONE CRATE OF SNACKS',["Day two. Shops get clever. One price now buys a whole crate of snacks,","or a single phone charger."]),
('WEEK 1','Factories stop','EVERY CAR SOLD AT A LOSS',["Week one. Car makers lose money on every car they sell, so the factories stop, and the showroom stays empty."]),
('MONTH 1','Empty shelves, long queues','SHORTAGES · QUEUES · SWAPPING',["Month one. Shelves are bare, queues stretch through the mall, and people start swapping things instead."]),
('MONTH 6','A price control','MOST ECONOMISTS: PRICE CAPS CAUSE SHORTAGES',["Economists call this a price control, and most agree caps like this cause shortages, just like the queues in the Soviet Union."]),
('MONTH 6','What would you buy?','',["Prices tell everyone what's rare and what's worth making.","So, what would you buy first?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for when,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.25*sr),'float32')); t+=.25; out.append({'start':round(st,3),'end':round(t,3),'when':when,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.3*sr),'float32')); t+=2.3; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr
json.dump({'duration':round(N/sr,3),'segments':out},open(here/'price_timeline.json','w'),indent=1)
S=[o['start'] for o in out]+[N/sr]; rng=np.random.default_rng(33)
w=rng.standard_normal(N); crowd=np.convolve(w,np.ones(10)/10,'same')-np.convolve(w,np.ones(80)/80,'same'); crowd*=.7+.3*np.sin(2*np.pi*T*.31)*np.sin(2*np.pi*T*.11+1); crowd/=np.abs(crowd).max()
cl=np.interp(T,[0,S[1],S[1]+1,S[2],S[3],S[4],S[5],S[6],S[7]],[.5,.6,1,.6,.5,.25,.8,.2,.15])
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
tense=np.interp(T,[S[3],S[4],S[5],S[7]],[0,.6,1,.5])
m=(pad(196,.36)+pad(246.9,.24)+pad(293.7,.16)+pad(392,.08))*(1-tense*.7)+(pad(146.8,.38)+pad(174.6,.22)+pad(220,.14))*tense
m*=np.minimum(1,T/1.2)*np.minimum(1,(N/sr-T)/2.2)*(.85+.15*np.sin(2*np.pi*T/6)); m=m/np.abs(m).max()*10**(-21/20)
ding=np.zeros(N)
for a in [S[0]+.2,S[1]+.2]:
    i=int(a*sr)
    for j,f in enumerate([1046.5,1318.5,1568]):
        o=i+int(j*.18*sr); l=min(int(1.4*sr),N-o); tt=np.arange(l)/sr; ding[o:o+l]+=np.sin(2*np.pi*f*tt)*np.exp(-tt*3.5)*.4
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+crowd*cl*10**(-30/20)+ding*10**(-12/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/price_mix.wav',mix,sr)
print(N/sr); [print(o['start'],o['caption']) for o in out]
