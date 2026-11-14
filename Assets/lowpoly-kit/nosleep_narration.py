#!/usr/bin/env python3
"""Narration, timings (nosleep_timeline.json) and sound design for: what if humans stopped sleeping forever.
Script supplied by the user (fiction), narrated in full by Michael."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; SPEED=1.15
SC=[('The hook',["What if humans suddenly stopped needing sleep?","No more tiredness. No more dreams. No more waking up after eight hours.","Imagine having 24 hours every single day."]),
('The golden age',["At first, humanity celebrates.","Factories operate around the clock. Scientists make decades of discoveries in just a few months. Businesses never close, and productivity reaches unimaginable levels.","For the first time, humans have more time than they know what to do with."]),
('Something goes wrong',["But after a few months, something strange begins happening.","People start losing their ability to dream.","Creativity slowly declines. Memories become unreliable. Emotions become unstable.","Despite having more time, people begin feeling increasingly disconnected from reality."]),
('The terrifying discovery',["Scientists discover that sleep was never just about resting the body.","It was essential for repairing the brain, processing memories and maintaining mental health.","Without it, the human mind begins to deteriorate.","And then something even stranger happens.","People across the world start experiencing the exact same nightmare while fully awake."]),
('The final twist',["Every person sees the same mysterious black figure standing in the distance.","Scientists investigate the phenomenon and discover an impossible pattern.","The figure appears in every recording, every photograph and every reflection.","But it gets closer every single day."]),
('The ending',["And then humanity discovers the horrifying truth.","The figure isn't coming closer.","It's been standing in the same place all along.","It's our brains that are slowly forgetting how to recognise reality."])]
PAUSE={2:.3,5:.3,9:.3,12:.3,13:.4,14:.4,18:.6,19:.3,20:.3,21:.4}
t=.9; lines=[]; clips=[]; i=0
for si,(name,L) in enumerate(SC):
    for txt in L:
        x,_=k.create(txt,voice=VOICE,speed=SPEED,lang='en-us'); x=x.astype('float32'); d=len(x)/sr
        lines.append({'t':round(t,3),'d':round(d,3),'text':txt,'scene':si}); clips.append((x,t)); t+=d+.12+PAUSE.get(i,0); i+=1
    t+=.15
black=lines[-1]['t']+lines[-1]['d']+1.3; DUR=black+1.6
L=lines; ev={'wrong':L[6]['t'],'decay':round(L[12]['t']+.2,3),'nightmare':round(L[14]['t']+L[14]['d']*.5,3),'figure':L[15]['t'],'closer':[round(L[18]['t']+j*(L[18]['d']+.5)/4,3) for j in range(4)],'truth':L[19]['t'],'eye':L[22]['t'],'black':round(black,3)}
json.dump({'duration':round(DUR,3),'scenes':[s_[0] for s_ in SC],'lines':lines,'events':ev},open(here/'nosleep_timeline.json','w'),indent=1)
N=int(DUR*sr); T=np.arange(N)/sr; rng=np.random.default_rng(15)
def put(buf,x,at,g=1.):
    j=int(at*sr); x=x[:max(0,N-j)]; buf[j:j+len(x)]+=x*g
vo=np.zeros(N); [put(vo,x,at) for x,at in clips]
fx=np.zeros(N)
def env(n,a,dec): tt=np.arange(n)/sr; return np.minimum(1,tt/a)*np.exp(-tt*dec)
def tone(f,dur,dec,g,at,a=.002):
    n=int(dur*sr); tt=np.arange(n)/sr; put(fx,np.sin(2*np.pi*f*tt)*env(n,a,dec),at,g)
def lp(x,n): return np.convolve(x,np.ones(n)/n,'same')
# hook: bright wake-up chimes; golden age: busy ticking pulse
for j,f in enumerate((660,880,1320)): tone(f,.6,4,.25,.15+j*.12)
a_,b_=L[3]['t'],L[6]['t']; x=a_
while x<b_: tone(1100,.05,60,.12,x); x+=.25
for at in (L[4]['t']+.2,L[4]['t']+L[4]['d']*.36,L[4]['t']+L[4]['d']*.7): tone(990,.5,6,.2,at); tone(1485,.5,6,.12,at+.07)
def glitch(at,dur=.4,g=.5):
    n=int(dur*sr); tt=np.arange(n)/sr; sq=np.sign(np.sin(2*np.pi*(160+900*rng.random())*tt))*(np.floor(tt*40)%2); nz=rng.standard_normal(n)*(np.floor(tt*55)%3==0)
    put(fx,(sq*.5+nz*.6)*np.minimum(1,tt/.01)*np.exp(-tt*4),at,g); tone(58,dur,3,.7*g,at)
# something wrong: power-flicker buzzes, detuned drops
for at in (ev['wrong']+.3,L[7]['t'],L[8]['t']+.1,L[8]['t']+L[8]['d']*.36,L[8]['t']+L[8]['d']*.7,L[9]['t']+1): glitch(at,.3,.3)
# discovery: scanner beeps, then the mind breaking
x=L[10]['t']
while x<L[12]['t']: tone(1500,.08,30,.12,x); x+=.8
for j in range(5): glitch(ev['decay']+j*.55,.35,.45)
tone(48,3,1,1.,ev['nightmare'],.01); n=int(2.5*sr); tt=np.arange(n)/sr; put(fx,lp(rng.standard_normal(n),10)*(tt/2.5)**2*4,ev['nightmare']-2.5,.45)
# the figure: low heartbeat, a hit each time it is closer
def heart(a,b,bpm):
    x=a
    while x<b:
        for o,g in ((0,1),(.17,.7)): tone(50,.2,20,.8*g,x+o,.004)
        x+=60/bpm
heart(ev['figure'],L[18]['t'],58); heart(L[18]['t'],ev['truth'],84); heart(ev['truth'],ev['black']-.4,52)
for c in ev['closer']: tone(62,.9,3,.9,c,.003); glitch(c,.25,.35)
tone(110,2.5,1,.3,L[21]['t'],.02)
n=int(3*sr); tt=np.arange(n)/sr; put(fx,lp(rng.standard_normal(n),14)*(tt/3)**2*5,ev['black']-3,.5)
# music bed: dark pad with tension curve
def pad(f,g): return sum(np.sin(2*np.pi*f*dd*T+p) for dd,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
ten=np.interp(T,[0,L[3]['t'],ev['wrong'],L[10]['t'],ev['decay'],ev['nightmare'],ev['figure'],L[18]['t'],ev['truth'],ev['black']-.05,ev['black']],[.3,.35,.6,.6,.85,1,.7,.95,.75,.9,0])
m=(pad(55,.5)+pad(82.4,.3)+pad(103.8,.14)+pad(116.5,.06))*ten*np.minimum(1,T/1.5); m=m/np.abs(m).max()*10**(-21/20)
amb=lp(rng.standard_normal(N),90); amb/=np.abs(amb).max(); amb*=10**(-38/20)*(T<ev['black'])
mix=vo/np.abs(vo).max()*10**(-1.5/20)+m+fx/np.abs(fx).max()*10**(-3/20)+amb
mix*=(T<ev['black']); mix=np.tanh(mix*1.05)/1.05; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/nosleep_mix.wav',mix,sr)
print(round(DUR,2), ev)
for j,l in enumerate(lines): print(j,l['t'],l['d'],l['text'][:44])
