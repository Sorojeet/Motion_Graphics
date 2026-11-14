#!/usr/bin/env python3
"""Narration, shot timings (letters_timeline.json) and sound for:
The Boy Who Received Letters From a Dead Person, Reel 1: The First Letter.
Michael narrates; the written lines are Michael whispering (LPC noise-excited resynthesis)."""
import json
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import lfilter, fftconvolve
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; sr=24000

# (shot name, [(voice, text, pause_after)])  voice: n = narrator, w = whispered writing
SEG=[('hall',[('n',"Every night, at exactly twelve oh three A.M., someone placed a letter outside a nineteen-year-old boy's bedroom.",.6)]),
('envelope',[('n',"There was no name on the envelope.",.45),('n',"No stamp.",.4),('n',"No address.",.5),('n',"Just one sentence, written on the front.",.5),('w',"Read this before tomorrow.",.7)]),
('ignore',[('n',"At first, he ignored the letters.",.6)]),
('open',[('n',"Until one night, curiosity got the better of him.",.45),('n',"He opened the envelope.",.6)]),
('photo',[('n',"Inside was a photograph of his father, who had died twelve years earlier.",.5),('n',"But something was strange.",.5),('n',"His father was standing outside their house, holding a newspaper dated tomorrow.",.6)]),
('back',[('n',"On the back of the photograph was a handwritten warning.",.5),('w',"Do not let your mother open the basement door.",.8)]),
('froze',[('n',"The boy froze.",.5),('n',"Because his family had never had a basement.",.5),('n',"At least, that's what he had been told.",.7)]),
('kitchen',[('n',"The following morning, he asked his mother about it.",.5),('n',"Her face turned pale.",.7)]),
('lock',[('n',"And for the first time in twelve years,",.35),('n',"she locked the front door before answering.",1.3)]),
('teaser',[('n',"That night, the boy discovered a door, hidden beneath the carpet.",.45),('n',"And behind it was something that should never have existed.",1.8)])]

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
        x,_=k.create(s,voice='am_michael',speed=.9 if v=='w' else .98,lang='en-us')
        if v=='w': x=whisper(x); W.append((t,len(x)/sr))
        else: x=x/np.abs(x).max()*.9
        d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'v':v,'text':s}); P+=[x,np.zeros(int(pause*sr),'float32')]; t+=d+pause
    out.append({'name':name,'start':round(st,3),'end':round(t,3),'lines':L})
n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr
json.dump({'duration':round(DUR,3),'shots':[[o['start'],o['end'],o['name']] for o in out],'segments':out},open(here/'letters_timeline.json','w'),indent=1)

# ---- sound design: low drone, clock ticks, paper, hits, lock, heartbeat
rnd=np.random.default_rng(9); S={o['name']:o for o in out}
def env(a,d): return np.exp(-np.arange(int(d*sr))/sr*a)
def put(buf,t0,x,g=1):
    i=int(t0*sr); j=min(N,i+len(x));
    if j>i: buf[i:j]+=x[:j-i]*g
def lowpass(x,c): a=np.exp(-2*np.pi*c/sr); return lfilter([1-a],[1,-a],x)
drone=sum(np.sin(2*np.pi*f*T+ph)*g for f,ph,g in ((41.2,0,.5),(41.5,1,.4),(61.7,2,.25),(82.4,.5,.12),(98,1.7,.05)))
drone*=.75+.25*np.sin(2*np.pi*T/9); air=lowpass(rnd.standard_normal(N),300)*6; drone=drone+air*.25
day=np.interp(T,[S['kitchen']['start']-.3,S['kitchen']['start']+.5,S['lock']['start']+1,S['lock']['start']+2.5],[0,1,1,0])
drone*=1-day*.45; drone/=np.abs(drone).max()
fx=np.zeros(N)
tick=np.sin(2*np.pi*2400*np.arange(int(.03*sr))/sr)*env(160,.03)+lowpass(rnd.standard_normal(int(.03*sr)),3000)*env(200,.03)*.6
for x in np.arange(.8,S['hall']['end'],1.0): put(fx,x,tick,.35)
def hit(t0,f=48,g=1):
    d=3.5; q=np.arange(int(d*sr))/sr; x=(np.sin(2*np.pi*f*q*(1-.15*q/d))*env(1.4,d)+lowpass(rnd.standard_normal(len(q)),180)*8*env(2.5,d))*g; put(fx,t0,x)
def paper(t0,d=.6,g=1):
    q=int(d*sr); x=rnd.standard_normal(q)*(np.abs(np.sin(np.linspace(0,9,q)))**3)*np.hanning(q); x=x-lowpass(x,900); put(fx,t0,x*.5*g)
paper(S['hall']['start']+3.0,.5,.8); hit(S['envelope']['lines'][-1]['t']-.1,45,.7)
paper(S['open']['lines'][1]['t']+.2,1.1,1.1); hit(S['photo']['start']+.1,50,.9); hit(S['photo']['lines'][2]['t']+3.0,44,.7)
paper(S['back']['start']+.1,.5,.8); hit(S['back']['lines'][1]['t']-.1,40,1.1)
hit(S['froze']['start'],46,.9)
lt=S['lock']['lines'][1]['t']+.95; q=np.arange(int(.25*sr))/sr; clunk=(np.sin(2*np.pi*140*q)*env(30,.25)+lowpass(rnd.standard_normal(len(q)),2500)*env(60,.25)*3); put(fx,lt,clunk,1.2); put(fx,lt+.12,clunk*.6,1)
hit(lt+.1,38,1.2); hit(S['teaser']['lines'][1]['t']+1.5,36,.9)
# heartbeat under "The boy froze" through "told"
for b in np.arange(S['froze']['start']+.3,S['froze']['end'],.82):
    q=np.arange(int(.12*sr))/sr
    for off,f,a in ((0,50,1),(.16,60,.65)): put(fx,b+off,np.sin(2*np.pi*f*q)*np.exp(-q*30)*a,.9)
fx/=max(1e-9,np.abs(fx).max())
fade=np.minimum(1,T/1.5)*np.minimum(1,(DUR-T)/1.8)
nn=n/np.abs(n).max()*10**(-1.5/20)
mix=nn+drone*fade*10**(-27/20)+fx*10**(-15/20)
mix=np.tanh(mix*1.02)/1.02; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/letters_mix.wav',mix.astype('float32'),sr)
sf.write(here/'out/audio/letters_voice.wav',nn.astype('float32'),sr)
print(round(DUR,2)); [print(o['start'],o['end'],o['name']) for o in out]
