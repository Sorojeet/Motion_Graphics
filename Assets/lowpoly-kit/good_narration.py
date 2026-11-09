#!/usr/bin/env python3
"""Narration, timings (good_timeline.json) and sound for: what if everyone was good."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Sources: World Prison Population List 14th ed. (11.5M, 2024); SIPRI ($2.72T military spending, 2024); Institute for Economics & Peace ($19.97T PPP cost of violence, 2024)
SEG=[('TODAY','An ordinary town','',["What if everyone on Earth became good, overnight?","No lying, no stealing, no violence. Everyone just does the right thing."]),
('DAY 1','Nothing gets locked','LOCKS · ALARMS · CCTV: NOT NEEDED',["Day one. Doors stay unlocked, bikes stay where you leave them,","and shops run on trust."]),
('WEEK 1','The gates open','~11.5 MILLION PEOPLE IN PRISON WORLDWIDE',["Week one. About eleven and a half million people are in prison worldwide.","Courts begin reviewing cases, and many start coming home."]),
('MONTH 1','Jobs disappear','POLICE · GUARDS · LOCKSMITHS · SECURITY',["Month one. Police stations go quiet.","Guards, locksmiths and security firms suddenly have far less work, and many need new jobs."]),
('YEAR 1','Money moves','WORLD MILITARY SPENDING: $2.7 TRILLION (2024)',["Year one. The world spends about two point seven trillion dollars a year on militaries.","As armies shrink, that money can go to schools and hospitals instead."]),
('YEAR 5','Rebuilding','VIOLENCE COSTS ~$20 TRILLION A YEAR',["Violence costs the world almost twenty trillion dollars a year.","Without it, the old prison becomes a park."]),
('YEAR 10','Still not perfect','GOOD ≠ ALWAYS AGREEING',["But good people still disagree.","There are still traffic jams, accidents and heated debates, just no one trying to hurt anyone."]),
('YEAR 10','Your move','',["A kinder world wouldn't be perfect, but it would be very different.","So, what would you stop locking first?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for when,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.05,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.25*sr),'float32')); t+=.25; out.append({'start':round(st,3),'end':round(t,3),'when':when,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.3*sr),'float32')); t+=2.3; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr
json.dump({'duration':round(DUR,3),'segments':out},open(here/'good_timeline.json','w'),indent=1)
S=[o['start'] for o in out]+[DUR]; rng=np.random.default_rng(44)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
low=np.interp(T,[S[3],S[3]+1,S[4],S[4]+1],[0,1,1,0])
m=(pad(196,.36)+pad(246.9,.24)+pad(293.7,.16)+pad(392,.08)+pad(493.9,.05))*(1-low*.6)+(pad(146.8,.34)+pad(174.6,.2))*low
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.2)*(.85+.15*np.sin(2*np.pi*T/6)); m=m/np.abs(m).max()*10**(-21/20)
birds=np.zeros(N)
for _ in range(160):
    a=rng.uniform(0,DUR); i=int(a*sr); l=min(int(rng.uniform(.06,.14)*sr),N-i); tt=np.arange(l)/sr; birds[i:i+l]+=np.sin(2*np.pi*(rng.uniform(2800,4000)*tt+rng.uniform(-5000,5000)*tt*tt))*np.sin(np.pi*tt/(l/sr+1e-9))
horn=np.zeros(N)
for a in rng.uniform(S[6]+.5,S[7]-.5,7):
    i=int(a*sr); l=min(int(.45*sr),N-i); tt=np.arange(l)/sr; horn[i:i+l]+=(np.sign(np.sin(2*np.pi*rng.choice([330,392,415])*tt))*.5)*np.minimum(1,tt/.02)*np.minimum(1,(l/sr-tt)/.05)
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+birds/np.abs(birds).max()*10**(-36/20)+horn*10**(-30/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/good_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
