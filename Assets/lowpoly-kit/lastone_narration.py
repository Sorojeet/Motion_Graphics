#!/usr/bin/env python3
"""First-person narration, timings (lastone_timeline.json) and sound for: what if you were the last human on Earth."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: ScienceABC (backup generators run dry within a few days; grid goes silent); USDA via Reader's Digest
# (low-acid canned food 2-5 years); J.D. Power (gasoline 3-6 months before breaking down); pv magazine (rooftop solar 25+ years);
# US Surgeon General advisory via Smithsonian (loneliness akin to smoking up to 15 cigarettes a day).
SEG=[('0','DAYS','Alone','8.2 BILLION PEOPLE GONE',["What if you woke up and every other human on Earth had vanished?","Just you, a quiet town by the sea, and the whole planet."]),
('3','DAYS','The lights go out','BACKUP FUEL RUNS OUT IN DAYS',["Within a few days, the power stations' backup generators run dry, and the grid goes dark.","Without electric pumps, the taps soon stop running too."]),
('2','WEEKS','The food clock','CANNED FOOD: 2–5 YEARS',["Fresh food rots within weeks.","But the supermarket is full of cans, and low-acid canned food can last two to five years."]),
('6','MONTHS','Stale fuel','PETROL GOES STALE IN 3–6 MONTHS',["After a few months, petrol starts to go stale, and the cars won't start.","So you switch to a bicycle, and a sailboat in the harbour."]),
('1','YEAR','Your own power','SOLAR PANELS LAST 25+ YEARS',["But rooftop solar panels still work, and they can keep making power for decades.","With a few batteries, you have light, a fridge and music again."]),
('2','YEARS','The real danger','LONELINESS ≈ 15 CIGARETTES A DAY',["The biggest threat isn't hunger. It's loneliness.","Long-term loneliness carries a health risk like smoking fifteen cigarettes a day.","So you keep routines, talk out loud, and adopt a stray dog."]),
('5','YEARS','Growing food','THE CANS RUN LOW',["When the cans run low, you plant seeds from the garden centre, and learn to farm and fish."]),
('10','YEARS','The light','',["Ten years on, the town is wild and green.","Every night, you climb the lighthouse and switch on its solar light, just in case someone else is out there.","So, would you keep the light on?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'lastone_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[0,.1,.25,.4,.55,.75,.9,1,1])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-25/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.3,.4,.6,.3,.3,.9,.7,1,1])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/lastone_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
