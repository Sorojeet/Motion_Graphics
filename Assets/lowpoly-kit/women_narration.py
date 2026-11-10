#!/usr/bin/env python3
"""Narration, timings (women_timeline.json) and sound for: what if every woman on Earth disappeared."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: UN World Population Prospects 2024 (~4.13B females, 2026); WHO State of the World's Nursing 2025 (85% women);
# UNESCO UIS 2020 via Teacher Task Force (67% primary, 94% pre-primary teachers women); ILO (76.2% of unpaid care work)
SEG=[('0','SECONDS','Half of humanity','~4.1 BILLION WOMEN AND GIRLS',["What if every woman and girl on Earth vanished, in a single instant?","More than four billion people. Half of humanity, gone."]),
('1','MINUTE','Hospitals in crisis',"85% OF THE WORLD'S NURSES ARE WOMEN",["Minute one. In hospitals, more than eight out of ten nurses disappear mid-shift.","Patients are left waiting, and the doctors who remain can't cover every bed."]),
('1','HOUR','Empty classrooms','PRIMARY TEACHERS: 67% WOMEN · PRE-SCHOOL: 94%',["Hour one. Two thirds of primary school teachers are gone, and in pre-school, almost all of them.","Half the desks sit empty too."]),
('1','DAY','The unseen work','WOMEN DO ~76% OF UNPAID CARE WORK',["Day one. At home, the gap is even bigger.","Women do about three quarters of the world's unpaid care work: cooking, cleaning, and caring for children and elders."]),
('1','WEEK','A quiet world','',["Week one. Offices, farms and governments are suddenly half empty. Cities slow to a crawl, and millions of families grieve."]),
('1','YEAR','No new babies','BIRTHS: 0',["Year one. The biggest change is silent. No more babies are born, and the maternity ward stays empty."]),
('100','YEARS','The last generation','',["Within about a century, the last people grow old, and nature slowly takes back the cities."]),
('100','YEARS','Who holds the world together?','',["It would show just how much of the world women hold together.","So, who would you miss the most?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.0,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.22*sr),'float32')]; t+=d+.22
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr
S=[o['start'] for o in out]; VAN=out[0]['lines'][0]['t']+out[0]['lines'][0]['d']-.4
json.dump({'duration':round(DUR,3),'vanish':round(VAN,3),'segments':out},open(here/'women_timeline.json','w'),indent=1)
rng=np.random.default_rng(77)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
sad=np.interp(T,[0,VAN,VAN+2],[0,0,1]); m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-sad)+(pad(146.8,.34)+pad(174.6,.22)+pad(220,.14)+pad(293.7,.06))*sad
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/7)); m=m/np.abs(m).max()*10**(-21/20)
sh=np.zeros(N); i=int((VAN-.2)*sr); l=int(1.6*sr); tt=np.arange(l)/sr
for f in (1568,2093,2637,3136): sh[i:i+l]+=np.sin(2*np.pi*f*tt+rng.uniform(0,6))*np.exp(-tt*2.2)*np.minimum(1,tt/.05)
beep=np.zeros(N)
for a in np.arange(S[1]+.3,S[2]-.3,1.0):
    j=int(a*sr); q=np.arange(int(.09*sr))/sr; beep[j:j+len(q)]+=np.sin(2*np.pi*1000*q)*np.minimum(1,(.09-q)/.01)
w=rng.standard_normal(N); crowd=np.convolve(w,np.ones(12)/12,'same')-np.convolve(w,np.ones(90)/90,'same'); crowd/=np.abs(crowd).max(); cl=np.interp(T,[0,VAN,VAN+.4],[1,1,.15])*(T<S[1])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+sh/np.abs(sh).max()*10**(-22/20)+beep*10**(-30/20)+crowd*cl*10**(-32/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/women_mix.wav',mix,sr)
print(DUR,VAN); [print(o['start'],o['caption']) for o in out]
