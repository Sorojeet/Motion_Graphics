#!/usr/bin/env python3
"""Narration, shot timings (letters3_timeline.json) and sound for:
The Boy Who Received Letters From a Dead Person, Reel 1: The First Letter.
Michael narrates; the written lines are Michael whispering (LPC noise-excited resynthesis)."""
import json
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import lfilter, fftconvolve
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; sr=24000

# (shot name, [(voice, text, pause_after)])  voice: n = narrator, w = whispered writing
SEG=[('return',[('n',"The boy couldn't move.",.35),('n',"The man had his father's height, his father's clothes, his father's watch.",.4),('n',"Then he stepped into the light,",.25),('n',"and the boy saw the face of a man buried twelve years ago.",.4),('n',"His father.",.6)]),
('tick',[('n',"His shadow moved across the floor.",.3),('n',"His watch was still ticking.",.45)]),
('vanish',[('n',"He pointed at the photographs.",.3),('n',"One by one, the people in them disappeared,",.25),('n',"until only the boy remained.",.5)]),
('box',[('n',"Then an old wooden box opened by itself.",.3),('n',"Hundreds of letters, all addressed to him,",.25),('n',"sent from different versions of his future.",.35),('n',"Every one carried the same warning.",.35),('w',"Never let the basement door open.",.6)]),
('mirror',[('n',"His father pointed to a mirror.",.3),('n',"It showed a hospital room.",.3),('n',"The boy, unconscious on a bed.",.3),('n',"His mother beside him.",.35),('n',"His heart had stopped.",.4),('n',"The clock read eleven fifty-eight P.M.,",.3),('n',"and the date was twelve years ago.",.6)]),
('truth',[('n',"Suddenly, everything made sense.",.35),('n',"He never survived the accident.",.3),('n',"His father died trying to save him.",.35),('n',"The letters were trying to bring him back.",.5)]),
('beep',[('n',"Then the hospital machine began beeping again.",.4),('n',"And somewhere in the real world,",.25),('n',"his fingers had just moved.",2.6)])]

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
json.dump({'duration':round(DUR,3),'shots':[[o['start'],o['end'],o['name']] for o in out],'segments':out},open(here/'letters3_timeline.json','w'),indent=1)

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
for x in np.arange(S['tick']['start'],S['tick']['end']+.5,.5): put(fx,x,tick*.6,.5)
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
for i in range(3): step(S['return']['lines'][2]['t']+.1+i*.5,.8)
hit(S['return']['lines'][4]['t'],44,1.1)
q=np.arange(int(2.2*sr))/sr; crack=lowpass(rnd.standard_normal(len(q)),2500)*(np.abs(np.sin(q*31))**8)*np.exp(-q*.6); put(fx,S['vanish']['lines'][2]['t']+.4,crack*.4)
wind(S['vanish']['lines'][1]['t'],2.4,.8); creak(S['box']['start']+.1,1.4,1.0)
for i in range(10): paper(S['box']['lines'][1]['t']+i*.35,.4,.5)
hit(S['box']['lines'][4]['t']-.1,42,.9); wind(S['mirror']['start']+.2,3,.6)
fl0=S['mirror']['lines'][4]['t']; q=np.arange(int((S['mirror']['end']-fl0)*sr))/sr; put(fx,fl0,np.sin(2*np.pi*1000*q)*.12*np.minimum(1,q*20))
hit(S['mirror']['lines'][6]['t']+.2,40,1.0)
q=np.arange(int(1.2*sr))/sr; glass=sum(np.sin(2*np.pi*f*q)*np.exp(-q*k) for f,k in ((2300,6),(3700,9),(5100,12)))*.3+lowpass(rnd.standard_normal(len(q)),5000)*np.exp(-q*8)*.6; put(fx,S['truth']['start']+.2,glass)
hit(S['truth']['lines'][3]['t']+.2,36,1.4)
for b in np.arange(S['beep']['lines'][0]['t']+1.0,S['beep']['end']-1.2,.9):
    q=np.arange(int(.12*sr))/sr; put(fx,b,np.sin(2*np.pi*1000*q)*np.minimum(1,(.12-q)*60)*.35)
hit(S['beep']['lines'][2]['t']+1.6,38,1.0)
fx/=max(1e-9,np.abs(fx).max())
fade=np.minimum(1,T/1.5)*np.minimum(1,(DUR-T)/1.8)
nn=n/np.abs(n).max()*10**(-1.5/20)
mix=nn+drone*fade*10**(-27/20)+fx*10**(-15/20)
mix=np.tanh(mix*1.02)/1.02; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/letters3_mix.wav',mix.astype('float32'),sr)
sf.write(here/'out/audio/letters3_voice.wav',nn.astype('float32'),sr)
print(round(DUR,2)); [print(o['start'],o['end'],o['name']) for o in out]
