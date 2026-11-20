#!/usr/bin/env python3
"""Narration, shot timings (letters5_timeline.json) and sound for:
The Boy Who Received Letters From a Dead Person, Reel 1: The First Letter.
Michael narrates; the written lines are Michael whispering (LPC noise-excited resynthesis)."""
import json
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import lfilter, fftconvolve
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; sr=24000

# (shot name, [(voice, text, pause_after)])  voice: n = narrator, w = whispered writing
SEG=[('envelope',[('n',"After twelve years, the boy had opened his eyes.",.35),('n',"By the window lay an envelope, addressed to his mother, in her husband's handwriting.",.5)]),
('photos',[('n',"Inside was a photograph from the day their son was born.",.35),('n',"Behind it, a second one.",.3),('n',"This same hospital room. The same bed. Empty.",.5)]),
('message',[('n',"On the back, a final message.",.3),('w',"The boy has returned. But the world has not finished collecting what it is owed.",.6)]),
('memory',[('n',"Before the accident, he had promised their son would live a full life.",.6)]),
('watch',[('n',"The boy picked up his father's wristwatch.",.3),('n',"For the first time, it started ticking again.",.35),('n',"Inside, a hidden photograph.",.25),('n',"His father, outside their home.",.3),('n',"On the back:",.25),('w',"The future belongs to those who keep living.",.6)]),
('home',[('n',"Weeks later, they went home.",.3),('n',"The basement door was gone.",.3),('n',"And no more letters ever came.",.55)]),
('years',[('n',"Years passed.",.3),('n',"He grew older, built a family, and lived the life his father wanted for him.",.35),('n',"On his thirtieth birthday, he found a tiny engraving inside the watch.",.35),('w',"Keep living, son.",.7)]),
('end',[('n',"Some people leave this world.",.4),('n',"But their love never learns how to disappear.",3.2)])]

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
json.dump({'duration':round(DUR,3),'shots':[[o['start'],o['end'],o['name']] for o in out],'segments':out},open(here/'letters5_timeline.json','w'),indent=1)

# ---- sound design: low drone, clock ticks, paper, hits, lock, heartbeat
rnd=np.random.default_rng(9); S={o['name']:o for o in out}
def env(a,d): return np.exp(-np.arange(int(d*sr))/sr*a)
def put(buf,t0,x,g=1):
    i=int(t0*sr); j=min(N,i+len(x));
    if j>i: buf[i:j]+=x[:j-i]*g
def lowpass(x,c): a=np.exp(-2*np.pi*c/sr); return lfilter([1-a],[1,-a],x)
sw=np.interp(T,[0,S['memory']['start'],S['memory']['end'],S['home']['start'],S['end']['start'],DUR],[.5,.6,.9,.7,1,.8])
drone=sum(np.sin(2*np.pi*f*T+ph)*g for f,ph,g in ((110,0,.5),(138.6,1,.32),(164.8,2,.3),(220,.5,.12),(277.2,1.7,.06)))*(.8+.2*np.sin(2*np.pi*T/7))*sw
drone=lowpass(drone,900); day=np.zeros(N); drone/=np.abs(drone).max()
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
for b in np.arange(.9,S['envelope']['end'],.95): beep(b,.18)
paper(S['photos']['start']+.1,.8,.8); paper(S['photos']['lines'][1]['t']-.2,.5,.7); paper(S['message']['start'],.5,.6)
wst=S['watch']['lines'][1]['t']
for x in np.arange(wst,S['watch']['end'],.5): put(fx,x,tick*.6,.5)
for x in np.arange(S['years']['lines'][2]['t'],S['years']['end'],.5): put(fx,x,tick*.5,.35)
fx/=max(1e-9,np.abs(fx).max())
fade=np.minimum(1,T/1.5)*np.minimum(1,(DUR-T)/1.8)
nn=n/np.abs(n).max()*10**(-1.5/20)
mix=nn+drone*fade*10**(-29/20)+fx*10**(-15/20)
mix=np.tanh(mix*1.02)/1.02; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/letters5_mix.wav',mix.astype('float32'),sr)
sf.write(here/'out/audio/letters5_voice.wav',nn.astype('float32'),sr)
print(round(DUR,2)); [print(o['start'],o['end'],o['name']) for o in out]
