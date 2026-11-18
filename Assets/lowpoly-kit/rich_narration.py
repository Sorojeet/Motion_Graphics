#!/usr/bin/env python3
"""First-person narration, timings (rich_timeline.json) and sound for: what if everyone got rich."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: Hanke & Kwok, Cato Journal 2009 (Zimbabwe peak monthly inflation 79.6 billion percent, Nov 2008);
# Egger, Haushofer, Miguel, Niehaus & Walker, Econometrica 2022 (GiveDirectly Kenya: large cash transfers raised local spending,
# local multiplier about 2.5, prices rose only about 0.1 percent on average as firms sold more).
# General principle (quantity theory): more money chasing the same goods raises prices; real wealth = goods, services, productivity.
SEG=[('$1M','EACH','Everyone is rich','8 BILLION MILLIONAIRES',["What if everyone on Earth woke up with a million dollars?","Same street, same houses, but every bank account just exploded."]),
('0','NEW LOAVES','Nothing new was made','MONEY ≠ STUFF',["Here's the catch. Money isn't wealth. It's a ticket to claim things people make.","And overnight, nobody baked a single extra loaf of bread."]),
('100%','SOLD OUT','The spending spree','DEMAND SURGES',["So everyone goes shopping. New cars, new TVs, takeaway every night.","The shelves are empty by lunch."]),
('$50','A COFFEE','Prices explode','MORE MONEY · SAME GOODS',["Too much money is chasing too few goods, so shops raise their prices.","A coffee costs five dollars, then fifty, then five hundred."]),
('0','WORKERS','Nobody shows up','WHY WORK?',["Then the barista quits. So does the bus driver, the farmer and the plumber.","Why work, when you're a millionaire?"]),
('79.6B%','IN ONE MONTH','Money melts','ZIMBABWE · NOV 2008',["Fewer workers means even less stuff, and prices spiral.","When Zimbabwe printed money, prices rose seventy nine billion percent in a single month."]),
('0.1%','PRICE RISE','Cash can work','KENYA CASH STUDY · 2022',["But money given to some people can work. In Kenya, cash gifts to poor villages boosted spending, while prices rose only about a tenth of a percent.","Because local businesses grew to meet the new demand."]),
('REAL','WEALTH','What makes us rich','WORK · TOOLS · IDEAS',["Real wealth isn't paper. It's farms, factories, skills and ideas.","Everyone can get richer, but only by making more. So, what would you buy first?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'rich_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[0,.1,.25,.4,.55,.75,.9,1,1])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-25/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.5,.4,.8,.7,.3,.4,.6,.8,.8])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/rich_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
