#!/usr/bin/env python3
"""Narration, shot timings (letters4_timeline.json) and sound for:
The Boy Who Received Letters From a Dead Person, Reel 1: The First Letter.
Michael narrates; the written lines are Michael whispering (LPC noise-excited resynthesis)."""
import json
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import lfilter, fftconvolve
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; sr=24000

# (shot name, [(voice, text, pause_after)])  voice: n = narrator, w = whispered writing
SEG=[('hosp',[('n',"For twelve years, he had lain between life and death.",.35),('n',"His mother never stopped visiting.",.4),('n',"But tonight, his heart had started beating again.",.55)]),
('storm',[('n',"The basement began showing what he had forgotten.",.3),('n',"A stormy night.",.3),('n',"The crash.",.45)]),
('rescue',[('n',"His father pulled him out before the car caught fire,",.25),('n',"but never made it out himself.",.55)]),
('memories',[('n',"Every letter held a buried memory.",.3),('n',"His first birthday.",.3),('n',"His first day at school.",.3),('n',"His father's final embrace.",.5)]),
('final',[('n',"The last one showed his mother, asleep beside his bed.",.3),('n',"On the back:",.25),('w',"She has one night left to say goodbye.",.6)]),
('collapse',[('n',"Then the basement began collapsing.",.3),('n',"His father pointed to a glowing doorway.",.35),('n',"He was never pulling his son into the past.",.3),('n',"He was sending him back.",.55)]),
('goodbye',[('n',"The boy stepped into the light.",.3),('n',"Behind him, his father faded away.",.3),('n',"The silver watch fell to the floor.",.55)]),
('wake',[('n',"In the hospital, the monitor showed a steady heartbeat.",.3),('n',"His mother woke.",.3),('n',"His eyes opened.",.45),('n',"And on the windowsill lay a new envelope,",.25),('n',"addressed to his mother.",2.6)])]

k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz'))

def lpc(x,p):
    r=np.correlate(x,x,'full')[len(x)-1:len(x)+p]; r[0]*=1.0001; r[0]+=1e-9; a=np.zeros(p+1); a[0]=1; e=r[0]
    for i in range(1,p+1):
        kk=-(r[i]+np.dot(a[1:i],r[i-1:0:-1]))/e; a[1:i]=a[1:i]+kk*a[i-1:0:-1]; a[i]=kk; e*=(1-kk*kk)
    return a,max(e,1e-12)
def whisper(x):
    """Replace voiced excitation with noise through a per-frame LPC envelope: a breathy, unvoiced whisper."""
    x=np.append(x[0],x[1:]-.94*x[:-1]); N=480; H=240; w=np.hanning(N); out=np.zeros(len(x)+N); rnd=np.random.default_rng(3)
    for s in range(0,len(x)-N,H):
        f=x[s:s+N]*w; a,e=lpc(f,26); n=rnd.standard_normal(N)*np.sqrt(e/N)*1.4; out[s:s+N]+=lfilter([1],a,n)*w
    y=lfilter([1],[1,-.94],out[:len(x)]); b=np.exp(-np.arange(int(.35*sr))/sr*14)*rnd.standard_normal(int(.35*sr)); b[0]=6
    y=y+.22*fftconvolve(y,b)[:len(y)]/np.abs(b).sum()*4  # small dark room
    return (y/np.abs(y).max()*.75).astype('float32')

P=[np.zeros(int(.8*sr),'float32')]; t=.8; out=[]; W=[]
for name,lines in SEG:
    st=t; L=[]
    for v,s,pause in lines:
        x,_=k.create(s,voice='am_michael',speed=.9 if v=='w' else 1.02,lang='en-us')
        if v=='w': x=whisper(x); W.append((t,len(x)/sr))
        else: x=x/np.abs(x).max()*.9
        d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'v':v,'text':s}); P+=[x,np.zeros(int(pause*sr),'float32')]; t+=d+pause
    out.append({'name':name,'start':round(st,3),'end':round(t,3),'lines':L})
n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr
json.dump({'duration':round(DUR,3),'shots':[[o['start'],o['end'],o['name']] for o in out],'segments':out},open(here/'letters4_timeline.json','w'),indent=1)

# ---- sound design: low drone, clock ticks, paper, hits, lock, heartbeat
rnd=np.random.default_rng(9); S={o['name']:o for o in out}
def env(a,d): return np.exp(-np.arange(int(d*sr))/sr*a)
def put(buf,t0,x,g=1):
    i=int(t0*sr); j=min(N,i+len(x));
    if j>i: buf[i:j]+=x[:j-i]*g
def lowpass(x,c): a=np.exp(-2*np.pi*c/sr); return lfilter([1-a],[1,-a],x)
drone=sum(np.sin(2*np.pi*f*T+ph)*g for f,ph,g in ((41.2,0,.5),(41.5,1,.4),(61.7,2,.25),(82.4,.5,.12),(98,1.7,.05)))
drone*=.75+.25*np.sin(2*np.pi*T/9); air=lowpass(rnd.standard_normal(N),300)*6; drone=drone+air*.25
day=np.zeros(N)
drone*=1-day*.45; drone/=np.abs(drone).max()
fx=np.zeros(N)
tick=np.sin(2*np.pi*2400*np.arange(int(.03*sr))/sr)*env(160,.03)+lowpass(rnd.standard_normal(int(.03*sr)),3000)*env(200,.03)*.6

def hit(t0,f=48,g=1):
    d=3.5; q=np.arange(int(d*sr))/sr; x=(np.sin(2*np.pi*f*q*(1-.15*q/d))*env(1.4,d)+lowpass(rnd.standard_normal(len(q)),180)*8*env(2.5,d))*g; put(fx,t0,x)
def paper(t0,d=.6,g=1):
    q=int(d*sr); x=rnd.standard_normal(q)*(np.abs(np.sin(np.linspace(0,9,q)))**3)*np.hanning(q); x=x-lowpass(x,900); put(fx,t0,x*.5*g)
def creak(t0,d=1.6,g=1):
    q=np.arange(int(d*sr))/sr; f=180+60*np.sin(q*7)+q*40; x=np.sign(np.sin(2*np.pi*np.cumsum(f)/sr))*np.abs(np.sin(q*55))**6*env(.8,d); put(fx,t0,lowpass(x,1400)*.5*g)
def wind(t0,d=2.5,g=1):
    q=int(d*sr); x=lowpass(rnd.standard_normal(q),500)*np.hanning(q)*6; put(fx,t0,x*g)
def step(t0,g=1):
    q=np.arange(int(.18*sr))/sr; put(fx,t0,(np.sin(2*np.pi*70*q)*np.exp(-q*28)+lowpass(rnd.standard_normal(len(q)),600)*np.exp(-q*40)*3)*g)
def clink(t0,g=1):
    q=np.arange(int(.5*sr))/sr; put(fx,t0,sum(np.sin(2*np.pi*f*q)*np.exp(-q*k) for f,k in ((2900,9),(4130,12),(5600,16)))*.35*g)
def beep(t0,g=.3):
    q=np.arange(int(.12*sr))/sr; put(fx,t0,np.sin(2*np.pi*1000*q)*np.minimum(1,(.12-q)*60)*g)
q=np.arange(int(S['hosp']['lines'][2]['t']*sr))/sr; put(fx,0,np.sin(2*np.pi*1000*q)*.06*np.minimum(1,q*2))
for b in np.arange(S['hosp']['lines'][2]['t']+.8,S['hosp']['end'],1.0): beep(b,.3)
rain=lowpass(rnd.standard_normal(N),4000)*.5; rr=np.interp(T,[S['storm']['start'],S['storm']['start']+.6,S['rescue']['end']-.4,S['rescue']['end']],[0,1,1,0]); fx+=rain*rr*.5
hit(S['storm']['lines'][2]['t'],50,1.2); q=np.arange(int(1.4*sr))/sr; put(fx,S['storm']['lines'][2]['t'],lowpass(rnd.standard_normal(len(q)),1800)*np.exp(-q*3)*.9)
q=np.arange(int(3*sr))/sr; put(fx,S['rescue']['lines'][0]['t']+1.4,lowpass(rnd.standard_normal(len(q)),900)*np.minimum(1,q*2)*np.exp(-q*.4)*.8)
for i in range(3): paper(S['memories']['lines'][1+i]['t']-.1,.5,.7)
paper(S['final']['start']+.1,.8,.9); hit(S['final']['lines'][2]['t']-.1,42,.8)
q=np.arange(int((S['collapse']['end']-S['collapse']['start'])*sr))/sr; put(fx,S['collapse']['start'],lowpass(rnd.standard_normal(len(q)),220)*7*np.minimum(1,q*1.5)*np.exp(-q*.08)*.6)
for i in range(8): put(fx,S['collapse']['start']+.4+i*.9+rnd.random()*.3,lowpass(rnd.standard_normal(int(.2*sr)),2500)*np.exp(-np.arange(int(.2*sr))/sr*25)*.6)
hit(S['collapse']['lines'][1]['t'],36,.8)
w0=S['goodbye']['lines'][2]['t']+.9; [clink(w0+o,g) for o,g in ((0,1),(.3,.55),(.5,.3))]
for b in np.arange(S['wake']['start']+.3,S['wake']['end']-1.0,.85): beep(b,.3)
hit(S['wake']['lines'][4]['t']+1.4,40,.9)
fx/=max(1e-9,np.abs(fx).max())
fade=np.minimum(1,T/1.5)*np.minimum(1,(DUR-T)/1.8)
nn=n/np.abs(n).max()*10**(-1.5/20)
mix=nn+drone*fade*10**(-27/20)+fx*10**(-15/20)
mix=np.tanh(mix*1.02)/1.02; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/letters4_mix.wav',mix.astype('float32'),sr)
sf.write(here/'out/audio/letters4_voice.wav',nn.astype('float32'),sr)
print(round(DUR,2)); [print(o['start'],o['end'],o['name']) for o in out]
