#!/usr/bin/env python3
"""Narration, timings (onecountry_timeline.json) and sound for: what if the whole world became one country."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: 195 countries (193 UN members + 2 observer states); ~180 currencies (UN-recognised, WorldAtlas);
# world military spending $2,887 bn in 2025 (SIPRI, Apr 2026); 7,000+ living languages (Ethnologue via Our World in Data);
# ~8.2 billion people (UN WPP 2024). Migration/wage effects are framed as possibilities, not predictions.
SEG=[('195','COUNTRIES','Divided world','8.2 BILLION PEOPLE',["What if every border on Earth disappeared, and the whole world became one country?","One flag. One passport. Over eight billion citizens."]),
('0','BORDERS','The gates open','NO VISAS · NO CUSTOMS',["Overnight, the gates swing open.","No visas, no customs queues. You could live, work or study anywhere on the planet."]),
('1','CURRENCY','One money','ABOUT 180 CURRENCIES TODAY',["About one hundred and eighty currencies become one.","No more exchange rates, and no more fees when you shop abroad."]),
('$2.9','TRILLION','No rival armies','WORLD MILITARY SPENDING, 2025',["In twenty twenty five, the world spent almost three trillion dollars on its militaries.","With no rival nations, much of that could go to schools, hospitals and clean energy instead."]),
('1','GOVERNMENT','Who is in charge?','ONE GOVERNMENT FOR EVERYONE',["But who runs it?","One government for eight billion people. Where is the capital, and whose votes count the most?"]),
('7,000+','LANGUAGES','Many voices','LIVING LANGUAGES TODAY',["More than seven thousand languages, plus very different laws, customs and beliefs, all under one rulebook."]),
('8.2B','FREE TO MOVE','A great migration','OPEN BORDERS, OPEN DOORS',["Millions might move to richer cities at once.","Housing and jobs there could come under huge pressure."]),
('1','FLAG','One world','NOWHERE ELSE TO GO',["And if that one government ever went wrong, there would be no other country to escape to.","So, would you vote for one world?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'onecountry_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[0,.1,.1,.2,.55,.5,.6,.8,.8])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-20/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.5,.6,.6,.4,.5,.7,.8,.5,.5])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/onecountry_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
