#!/usr/bin/env python3
"""First-person narration, timings (bigearth_timeline.json) and sound for: what if Earth doubled in size."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: BBC Science Focus, "What if the Earth doubled in size?" (same density: mass x8, gravity x2; spin 32x slower so a day lasts
# over a month; air pressure doubles but stays breathable, extra oxygen; hundreds of new volcanoes, runaway greenhouse, mass extinction;
# trees topple, animals dog-sized or larger can't run without breaking a leg; birds need water landings).
# Long-term adaptation lines are framed as possibilities. Timeline runs to ~100,000 years but the number is never stated (user request).
SEG=[('×2','SIZE','Earth doubles','SAME DENSITY · MASS ×8',["What if Earth suddenly doubled in size?","Same rock, same density, but eight times the mass."]),
('2','g','Twice as heavy','SURFACE GRAVITY ×2',["Instantly, gravity doubles. A seventy kilo athlete now carries a hundred and forty.","Sprinters crumple off the blocks, and the high jumper can barely leave the ground."]),
('×2','WEIGHT','Things fall','TREES TOPPLE',["Tall trees topple under their own weight.","And any animal bigger than a dog risks breaking a leg just by running."]),
('32×','SLOWER SPIN','A month-long day','ANGULAR MOMENTUM CONSERVED',["A bigger Earth also spins thirty two times slower, so one day lasts more than a month.","One side bakes for weeks while the other freezes, whipping up storms that flatten buildings."]),
('×2','AIR PRESSURE','Thick air','STILL BREATHABLE',["The air is twice as dense, but still breathable.","Flying gets easier, but landing is brutal, so birds touch down on water."]),
('100s','NEW VOLCANOES','Fire below','MORE HEAT INSIDE',["A bigger planet traps more heat inside, and hundreds of new volcanoes erupt.","Their gases could trigger a runaway greenhouse, and the biggest extinction Earth has ever seen."]),
('1000s','GENERATIONS','Life adapts','LOW · WIDE · STRONG',["But life is stubborn.","Over thousands of generations, survivors grow low and wide. Sturdy plants, thick-legged animals, and shorter, stronger people."]),
('','','A new normal','',["The stadium fills again, with athletes who never knew the old world.","So, would you survive the first day?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'bigearth_timeline.json','w'),indent=1)
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
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/bigearth_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
