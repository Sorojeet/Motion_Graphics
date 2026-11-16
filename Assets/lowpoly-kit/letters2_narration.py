#!/usr/bin/env python3
"""Narration, shot timings (letters2_timeline.json) and sound for:
The Boy Who Received Letters From a Dead Person, Reel 1: The First Letter.
Michael narrates; the written lines are Michael whispering (LPC noise-excited resynthesis)."""
import json
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import lfilter, fftconvolve
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; sr=24000

# (shot name, [(voice, text, pause_after)])  voice: n = narrator, w = whispered writing
SEG=[('dayhall',[('n',"His mother knew something about the basement.",.35),('n',"But all day, she avoided him.",.5)]),
('nighthall',[('n',"That night, a corner of the hallway carpet was lifted.",.35),('n',"Beneath it, a metal handle.",.45)]),
('pull',[('n',"He pulled it.",.3),('n',"A hidden staircase, descending into darkness.",.35),('n',"Cold air rushed out.",.45)]),
('descend',[('n',"He switched on his flashlight, and stepped down.",.5)]),
('walls',[('n',"Old photographs covered the walls.",.3),('n',"Every one showed the same man.",.35),('n',"His father.",.5)]),
('photos',[('n',"Holding him as a newborn.",.35),('n',"Standing beside him at ten.",.45)]),
('final',[('n',"But the last photograph showed the boy himself, in this exact basement.",.35),('n',"Taken three days ago.",.45)]),
('never',[('n',"He had never been here before.",.4),('n',"Or had he?",.6)]),
('table',[('n',"On the table lay an envelope, with his name on it.",.3),('n',"Inside, one photograph.",.45)]),
('hospital',[('n',"His mother, beside a hospital bed.",.35),('n',"And lying on that bed...",.4),('n',"was him.",.4),('n',"Dated tomorrow.",.5)]),
('steps',[('n',"Then, footsteps on the stairs.",.9)]),
('turn',[('n',"A shadow stood at the entrance.",.5)]),
('watch',[('n',"Something slipped from its hand.",.3),('n',"An old wristwatch.",.4),('n',"The same one his father wore in every photograph.",.45)]),
('end',[('n',"But his father had been dead for twelve years.",.4),('n',"And now, someone wearing his watch was standing right behind him.",2.6)])]

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
json.dump({'duration':round(DUR,3),'shots':[[o['start'],o['end'],o['name']] for o in out],'segments':out},open(here/'letters2_timeline.json','w'),indent=1)

# ---- sound design: low drone, clock ticks, paper, hits, lock, heartbeat
rnd=np.random.default_rng(9); S={o['name']:o for o in out}
def env(a,d): return np.exp(-np.arange(int(d*sr))/sr*a)
def put(buf,t0,x,g=1):
    i=int(t0*sr); j=min(N,i+len(x));
    if j>i: buf[i:j]+=x[:j-i]*g
def lowpass(x,c): a=np.exp(-2*np.pi*c/sr); return lfilter([1-a],[1,-a],x)
drone=sum(np.sin(2*np.pi*f*T+ph)*g for f,ph,g in ((41.2,0,.5),(41.5,1,.4),(61.7,2,.25),(82.4,.5,.12),(98,1.7,.05)))
drone*=.75+.25*np.sin(2*np.pi*T/9); air=lowpass(rnd.standard_normal(N),300)*6; drone=drone+air*.25
day=np.interp(T,[0,S['dayhall']['end']-.5,S['dayhall']['end']+.5],[1,1,0])
drone*=1-day*.45; drone/=np.abs(drone).max()
fx=np.zeros(N)
tick=np.sin(2*np.pi*2400*np.arange(int(.03*sr))/sr)*env(160,.03)+lowpass(rnd.standard_normal(int(.03*sr)),3000)*env(200,.03)*.6
for x in np.arange(S['nighthall']['start'],S['nighthall']['end'],1.0): put(fx,x,tick,.25)
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
creak(S['pull']['start']+.4,1.8); wind(S['pull']['lines'][2]['t']-.2,2.6,1.2); hit(S['pull']['lines'][1]['t'],44,.6)
for i in range(4): step(S['descend']['lines'][0]['t']+1.6+i*.5,.6)
hit(S['walls']['lines'][2]['t'],46,.9); hit(S['final']['lines'][0]['t']+1.2,42,.8); hit(S['never']['lines'][1]['t'],40,.7)
paper(S['table']['lines'][1]['t']-.3,1.0,1.0); hit(S['hospital']['lines'][2]['t'],44,1.1)
for i in range(6): step(S['steps']['lines'][0]['t']+.2+i*.55,.9)
hit(S['turn']['lines'][0]['t'],40,.9)
w0=S['watch']['lines'][0]['t']+1.3; [clink(w0+o,g) for o,g in ((0,1),(.32,.6),(.55,.35))]
for b in np.arange(S['end']['start'],S['end']['lines'][1]['t'],.7):
    q=np.arange(int(.12*sr))/sr
    for off,f,a in ((0,50,1),(.16,60,.65)): put(fx,b+off,np.sin(2*np.pi*f*q)*np.exp(-q*30)*a,.9)
hit(S['end']['lines'][1]['t']+3.0,36,1.3)
fx/=max(1e-9,np.abs(fx).max())
fade=np.minimum(1,T/1.5)*np.minimum(1,(DUR-T)/1.8)
nn=n/np.abs(n).max()*10**(-1.5/20)
mix=nn+drone*fade*10**(-27/20)+fx*10**(-15/20)
mix=np.tanh(mix*1.02)/1.02; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/letters2_mix.wav',mix.astype('float32'),sr)
sf.write(here/'out/audio/letters2_voice.wav',nn.astype('float32'),sr)
print(round(DUR,2)); [print(o['start'],o['end'],o['name']) for o in out]
