#!/usr/bin/env python3
"""First-person narration, timings (forever_timeline.json) and sound for: what if you became immortal."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: UN WPP 2024 (life expectancy 73.3 years); Smithsonian (Pangea Ultima ~250M years, more volcanism);
# Universe Today (Sun brightens ~1%/100M yrs, habitable zone passes Earth in ~1B yrs, red giant in ~5.4B yrs)
SEG=[('NOW','','You stop ageing','',["What if you could never die?","No ageing, no illness. You stay exactly as you are, forever."]),
('80','YEARS','Everyone you knew','AVERAGE LIFESPAN: 73.3 YEARS (2024)',["Eighty years later. The average person lives about seventy three years,","so almost everyone you grew up with is gone."]),
('500','YEARS','A stranger in your town','',["Five hundred years. Language has changed so much you can barely follow a conversation.","Your quiet town is now a giant city."]),
('10,000','YEARS','The last witness','WRITTEN HISTORY: ~5,000 YEARS',["Ten thousand years. That's twice as long as all of written history.","Today's cities are buried ruins, and you may be the only one who remembers them."]),
('1','MILLION YEARS','A wild world','',["One million years. Humans might have changed beyond recognition, or left for other worlds.","The river has carved a whole new valley."]),
('250','MILLION YEARS','A new supercontinent','PANGEA ULTIMA: ~250 MILLION YEARS',["Two hundred and fifty million years. The continents crash together into a new supercontinent, and volcanoes erupt across a scorching land."]),
('1','BILLION YEARS','The oceans fade','SUN: ~1% BRIGHTER EVERY 100 MILLION YEARS',["One billion years. The Sun has grown so bright that the oceans start to evaporate."]),
('5','BILLION YEARS','Still here','THE SUN BECOMES A RED GIANT',["Five billion years. The Sun swells into a red giant, filling the sky. And you are still here.","So, would you still want to live forever?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'forever_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[0,.1,.25,.4,.55,.75,.9,1,1])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-20/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.3,.4,.6,.3,.3,.9,.7,1,1])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/forever_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
