#!/usr/bin/env python3
"""First-person narration, timings (argon_timeline.json) and sound for: what if nitrogen replaced by argon."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Scenario: every N2 molecule in the atmosphere replaced by one argon atom (same number of particles).
# Physics: mean molar mass of air ~29 -> ~38 g/mol, so the atmosphere weighs ~32% more and surface pressure rises ~32%.
# Speed of sound sqrt(gamma*R*T/M): ~343 -> ~318 m/s (about 7% slower). Argon molar heat capacity 20.8 vs N2 29.1 J/mol.K -> hotter flames.
# Narcosis: argon ~2.3x as narcotic as nitrogen (Bennett; argox literature). Ar partial pressure ~1 bar ~ N2-equivalent of a ~20 m air dive.
# Nitrogen cycle: life needs N for proteins and DNA; fixation by bacteria, lightning and Haber-Bosch all use N2 from the air;
# nitrogen fertilizer supports roughly half of the world's population (Erisman et al. 2008; Our World in Data).
SEG=[('78%','ARGON','Swap the air','N₂ → Ar',["What if every nitrogen molecule in the air was swapped for argon?","At first, nothing seems to happen. Both gases are invisible, and your lungs mostly ignore them."]),
('+32%','AIR PRESSURE','Heavier sky','ARGON 40 VS NITROGEN 28',["But argon is heavier. The whole sky now weighs about a third more.","Air pressure jumps, and everyone's ears pop at once."]),
('2.3×','MORE NARCOTIC','A strange haze','ARGON VS NITROGEN',["Argon is also more narcotic than nitrogen.","At this pressure, some people feel slightly tipsy, like scuba divers going deep."]),
('−7%','SPEED OF SOUND','Deeper voices','HEAVIER GAS · SLOWER SOUND',["Sound travels a little slower through the heavier air.","So voices and music sound a touch deeper."]),
('HOTTER','FLAMES','Fires burn hotter','ARGON SOAKS UP LESS HEAT',["Fires change too. Argon soaks up less heat than nitrogen, so flames burn hotter.","Stoves roar, and wildfires race up the hills."]),
('0','NEW NITROGEN','Plants starve','N BUILDS PROTEIN · DNA',["Then the real problem. Every living thing needs nitrogen to build proteins and DNA.","Bacteria and lightning used to pull it from the air. Now there's nothing to pull."]),
('~50%','OF HUMANITY','Fertilizer fails','FED BY NITROGEN FERTILIZER',["Factories can't make fertilizer either, and fertilizer helps feed about half the world.","Year by year, the soil runs low, and harvests shrink."]),
('TRICKLE','OF N₂','A slow leak','SOIL BACTERIA RELEASE N₂',["Soil bacteria still breathe a little nitrogen back into the air, but it's a trickle against an ocean.","Would we survive on a planet with no nitrogen to spare?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'argon_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[0,.1,.25,.4,.55,.75,.9,1,1])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-25/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.3,.5,.4,.4,.7,.5,.6,.6,.6])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/argon_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
