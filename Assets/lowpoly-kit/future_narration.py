#!/usr/bin/env python3
"""First-person narration, timings (future_timeline.json) and sound for: what if waking up 1000 years in the future."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Survival story (third person "you"). Grounded facts: English of ~1000 years ago (Old English) is unintelligible to modern speakers;
# unused muscles atrophy quickly in bed rest/immobility; pathogens keep evolving so an isolated immune system meets unfamiliar germs.
# Future city details, ID/money and the helper are illustrative fiction.
SEG=[('1000','YEARS ASLEEP','You wake up','YEAR 3026',["What if you woke up a thousand years in the future?","The pod hisses open. The lab is silent, and nobody is waiting for you."]),
('0','STRENGTH','Legs give way','UNUSED MUSCLES WASTE AWAY',["You try to stand, and your legs give way.","Unused muscles waste away, so your first battle is just reaching the door."]),
('???','LANGUAGE','Lost for words','1000 YEARS CHANGES A LANGUAGE',["Outside, a drone asks you something. You don't understand a single word.","The English of a thousand years ago is unreadable to us today. Now you're the one from the past."]),
('0','ID · MONEY','You don\'t exist','NO RECORD · NO ACCOUNT',["Doors won't open for you. A food kiosk scans your face, and finds nothing.","No identity, no money, no record that you were ever born."]),
('1000','YEARS OF GERMS','A dangerous cough','GERMS KEEP EVOLVING',["Then you start to cough. Germs have kept evolving for a thousand years.","Your immune system has never met them, and your old germs could be just as dangerous to them."]),
('1','NIGHT ALONE','Survive the night','NO SHELTER',["Night falls. You curl up under a bridge, as silent trains glide overhead.","Everything is cleaner, faster and brighter, and you have never felt more lost."]),
('1','STRANGER','A helping hand','TRANSLATED IN REAL TIME',["At dawn, a stranger stops. Her earpiece translates your ancient words.","She takes you to a clinic, and for the first time, someone says your name back to you."]),
('YOU','ARE HISTORY','A living fossil','THE PAST HAS A VOICE',["To them, you're a living history book.","So, would you rather wake up in the future, or never wake up at all?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'future_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[0,.1,.25,.4,.55,.75,.9,1,1])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-25/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.3,.2,.8,.7,.5,.4,.7,.6,.6])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/future_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
