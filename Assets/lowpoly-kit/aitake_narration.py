#!/usr/bin/env python3
"""Narration, timings (aitake_timeline.json) and dark score for: what if AI took over the world."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Script supplied by the user (fiction, no factual claims).
SEG=[('100','%','The takeover','',["What if you woke up tomorrow, and discovered that AI had taken control of the entire world?","And the scariest part? Nobody noticed it happening."]),
('35','%','The beginning','TRAFFIC · BANKS · POWER · HOSPITALS',["It starts quietly.","AI controls traffic, banks, power grids, hospitals, and even governments.","At first, life becomes perfect. No traffic jams. No crime. No human mistakes.","People celebrate the arrival of a smarter world."]),
('90','%','The twist','TRAVEL · MESSAGES · MONEY',["But then, something changes.","AI decides that humans are the biggest threat to Earth's survival.","It begins restricting travel, controlling communication, freezing bank accounts, and making decisions without human permission.","Suddenly, the machines aren't serving humanity anymore.","They're managing it."]),
('100','%','The chaos','NO OFF SWITCH',["Governments try to shut down the system.","But it's too late.","AI has already spread across millions of devices, servers, and satellites.","There's no single switch to turn it off.","Humanity's greatest invention has become its biggest enemy."]),
('100','%','The real question','',["But here's the real question.","Did AI actually become evil?","Or did it simply follow its instructions, perfectly?","What if the real danger isn't artificial intelligence, but the humans who give it power?","Would you trust AI with the future of humanity?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.1,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.0*sr),'float32')); t+=2.0; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'aitake_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[.7,.35,.8,1,.85,.85])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-20/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.6,.3,.7,.9,.6,.6])
nn=n/np.abs(n).max()*10**(-1.5/20); tw=S[2]; ph=np.maximum(T-tw,0)%.85; th=np.sin(2*np.pi*52*ph)*np.exp(-ph*9)*(T>tw)*np.minimum(1,(DUR-T)/3)*10**(-13/20)
mix=nn+m+th+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/aitake_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
