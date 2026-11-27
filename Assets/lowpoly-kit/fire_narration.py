#!/usr/bin/env python3
"""First-person narration, timings (fire_timeline.json) and sound for: what if fire was never invented."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: Berna et al. 2012 PNAS (Wonderwerk Cave, earliest secure controlled fire ~1 million years ago);
# Fonseca-Azevedo & Herculano-Houzel 2012 PNAS (raw diet would need >9 h/day of eating to support human body + neurons);
# Wrangham, "Catching Fire" (cooking hypothesis). Copper melts at ~1085 C. Fossil fuels still generate most of the world's electricity.
SEG=[('1M','YEARS AGO','The first spark','EARLIEST SURE CONTROLLED FIRE',["What if humans never learned to control fire?","A million years ago, our ancestors gathered around their first campfires. Now imagine that spark never caught."]),
('9+','HOURS A DAY','Chewing all day','RAW FOOD FOR A HUMAN BRAIN',["Without cooking, everything is eaten raw: roots, leaves and tough meat.","To feed a brain like ours on raw food, we'd need to eat for more than nine hours a day."]),
('SMALL','BRAINS','A different human','THE COOKING HYPOTHESIS',["Many scientists think cooking freed up the energy to grow our big brains.","Without it, our ancestors might have kept smaller brains, bigger jaws and bigger bellies."]),
('0','LIGHT','Long dark nights','NO WARMTH · NO PROTECTION',["Nights are pitch black and cold, with no fire to keep predators away.","And nobody sits around the flames telling stories."]),
('COLD','LANDS','Stuck in the warmth','NO FIRE TO SURVIVE THE COLD',["Without fire for warmth, the icy north would be far harder to settle.","Humans might never have spread across the whole planet."]),
('1085°C','COPPER','No metal','NO POTTERY · NO GLASS · NO BRICKS',["No fire also means no pottery, no glass and no bricks.","And metal? Copper only melts at over a thousand degrees, so the Bronze Age never begins."]),
('0','ENGINES','No machines','NO STEAM · NO POWER PLANTS',["No steam engines, no power plants, no factories, no rockets.","Even today, most of the world's electricity comes from burning fuel."]),
('NO','CITIES','The world today','STILL ON THE SAVANNA',["Today, there might be no cities at all. Just small groups of humans, foraging under the sun.","So, was fire our most important discovery?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'fire_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[0,.1,.25,.4,.55,.75,.9,1,1])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-25/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.4,.3,.5,.7,.5,.5,.6,.6,.6])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/fire_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
