#!/usr/bin/env python3
"""First-person narration, timings (animals_timeline.json) and sound for: what if every animal vanished."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Scenario: every vertebrate (mammals, birds, fish, reptiles, amphibians) vanishes; insects stay.
# Sources: FAO / Knowledge4Policy (fish give ~3.3 billion people ~20% of animal protein);
# Nyffeler et al. 2018, Science of Nature (insectivorous birds eat 400-500 million tonnes of insects/arthropods a year, likely the lower end);
# Boyles et al. 2011, Science (bats' pest control worth more than $3.7 billion a year to US agriculture);
# STRI / Yale, Estrada-Villegas et al. 2022 (over 80% of tropical tree species can be dispersed by animals).
SEG=[('0','ANIMALS LEFT','Silent morning','INSECTS STAY · ANIMALS GO',["What if every mammal, bird, fish and reptile vanished, but insects stayed?","No birdsong at dawn. The barn is empty, and the fields are perfectly still."]),
('0','MEAT · MILK · EGGS','The empty barn','LIVESTOCK GONE',["On day one, breakfast changes. No eggs, no milk, no meat.","Every cow, chicken and pig on the planet is simply gone."]),
('3.3B','PEOPLE','The empty lake','FISH GIVE THEM 20% OF ANIMAL PROTEIN',["Fishing boats come back with empty nets.","More than three billion people get a fifth of their animal protein from fish. Now there's none."]),
('BEES','STILL HERE','Insects remain','MOST CROPS STILL POLLINATED',["Spring comes, and the bees are still buzzing, so most crops still get pollinated.","But everything that used to eat insects is gone."]),
('400M','TONNES','Nobody eats the bugs','INSECTS EATEN BY BIRDS EACH YEAR',["Birds alone eat around four hundred million tonnes of insects every year.","Without birds, bats, frogs and lizards, insect numbers explode."]),
('$3.7B+','A YEAR','Pests take over','BATS\' PEST CONTROL · US FARMS',["Caterpillars strip the orchards, and swarms chew through the crops.","In the US alone, bats save farmers billions of dollars a year in pest control. Now that help is gone."]),
('80%','TROPICAL TREES','Humans fight back','SEEDS SPREAD BY ANIMALS',["So farmers fight back with nets and sprays, doing the work that birds did for free.","And forests slowly change, because most tropical trees rely on animals to spread their seeds."]),
('ALONE','WITH BUGS','A lonely planet','NATURE IS NOT OPTIONAL',["We'd survive, hungrier and itchier, on a planet ruled by insects.","Which animal would you miss the most?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'animals_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[0,.1,.25,.4,.55,.75,.9,1,1])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-25/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.3,.4,.5,.4,.6,.3,.2,.7,.7])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/animals_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
