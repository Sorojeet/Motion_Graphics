#!/usr/bin/env python3
"""Narration, timings (lasthuman_timeline.json) and sound design for: what if you were the last human on Earth.
Script supplied by the user (fiction), narrated in full by Michael."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; SPEED=1.15
SC=[('The empty world',["Imagine waking up one morning and discovering that every human on Earth has disappeared.","No people. No traffic. No voices.","Just you... and an entire planet."]),
('The discovery',["At first, you search every house, every street and every hospital.","You find abandoned cars, unfinished meals and phones still ringing.","Millions of lives seem to have vanished in a single moment.","But strangely, every animal is still alive."]),
('The new reality',["Days turn into weeks.","You move into a luxury hotel, explore abandoned cities and take whatever you need.","For the first time, there are no rules, no responsibilities and nobody to answer to.","But as the silence grows, even paradise begins to feel like a prison."]),
('The first sign',["One night, you discover a television still working.","Every channel is broadcasting the same footage.","A live camera feed of your bedroom.","You watch yourself sleeping.","But the footage is coming from tomorrow."]),
('The final twist',["Terrified, you rush back home.","You check every camera, every computer and every device.","Then you notice something impossible.","In tomorrow's footage, there are two people standing beside your bed.","One is you.","The other is watching you."]),
('The ending',["And suddenly, you realise... you were never the last human on Earth.","You were simply the last one who knew he wasn't alone."])]
PAUSE={2:.5,6:.4,10:.6,15:.6,19:.3,20:.4,21:.9,22:.4}
t=.9; lines=[]; clips=[]; i=0
for si,(name,L) in enumerate(SC):
    for txt in L:
        x,_=k.create(txt,voice=VOICE,speed=SPEED,lang='en-us'); x=x.astype('float32'); d=len(x)/sr
        lines.append({'t':round(t,3),'d':round(d,3),'text':txt,'scene':si}); clips.append((x,t)); t+=d+.12+PAUSE.get(i,0); i+=1
    t+=.15
black=lines[-1]['t']+lines[-1]['d']+.35; DUR=black+3.6
L=lines; ev={'phone':round(L[4]['t']+L[4]['d']*.66,3),'weeks':L[7]['t'],'night':L[11]['t'],'tomorrow':L[15]['t'],'rush':L[16]['t'],'turn':L[21]['t'],'door':L[22]['t'],'black':round(black,3),'text':round(black+.25,3),'textoff':round(black+2.6,3)}
json.dump({'duration':round(DUR,3),'scenes':[s_[0] for s_ in SC],'lines':lines,'events':ev},open(here/'lasthuman_timeline.json','w'),indent=1)
N=int(DUR*sr); T=np.arange(N)/sr; rng=np.random.default_rng(15)
def put(buf,x,at,g=1.):
    j=int(at*sr); x=x[:max(0,N-j)]; buf[j:j+len(x)]+=x*g
vo=np.zeros(N); [put(vo,x,at) for x,at in clips]
fx=np.zeros(N)
def env(n,a,dec): tt=np.arange(n)/sr; return np.minimum(1,tt/a)*np.exp(-tt*dec)
def tone(f,dur,dec,g,at,a=.002):
    n=int(dur*sr); tt=np.arange(n)/sr; put(fx,np.sin(2*np.pi*f*tt)*env(n,a,dec),at,g)
def lp(x,n): return np.convolve(x,np.ones(n)/n,'same')
# ---- ambience: wind and birds in daylight, hum indoors at night
wind=lp(rng.standard_normal(N),120); wind/=np.abs(wind).max(); wind*=(.6+.4*np.sin(2*np.pi*.11*T))*np.interp(T,[0,L[11]['t']-.5,L[11]['t']],[1,1,.15])*10**(-30/20); fx+=wind*4
for j in range(14):
    at=.6+j*1.7+rng.random()*.8
    if at>L[7]['t']+4: break
    for q in range(3): tone(2600+rng.random()*900,.08,30,.06,at+q*.11)
def ring(at,n):
    for j in range(n):
        for q in range(8): tone(880 if q%2 else 1100,.05,20,.18,at+j*1.1+q*.05)
ring(L[4]['t']+L[4]['d']*.6,2)
# dog: a couple of soft barks
for at in (L[6]['t']+.4,L[6]['t']+1.3):
    n=int(.18*sr); tt=np.arange(n)/sr; put(fx,np.sin(2*np.pi*(380-120*tt/.18)*tt)*np.exp(-tt*14)*1.2+lp(rng.standard_normal(n),6)*np.exp(-tt*20)*.6,at,.4)
# gentle piano in the new reality, souring into a drone
notes=[(0,523),(.6,659),(1.2,784),(1.8,659),(2.6,587),(3.2,698),(3.8,880),(4.6,784)]
for rep in range(3):
    for o,f in notes: tone(f*(1 if rep<2 else .97),1.4,2.2,.18,L[7]['t']+rep*5.4+o,.004)
# TV static and electrical buzz at night, rising heartbeat
a_,b_=L[11]['t'],L[16]['t']; n=int((b_-a_)*sr); tt=np.arange(n)/sr; st=rng.standard_normal(n)*(.25+.2*np.sin(2*np.pi*.3*tt))*np.minimum(1,tt/.4); put(fx,lp(st,2)*.35,a_)
put(fx,np.sign(np.sin(2*np.pi*100*T[:n]))*.03*np.minimum(1,tt/.4),a_)
def heart(a,b,b0,b1):
    x=a
    while x<b:
        for o,g in ((0,1),(.17,.7)): tone(50,.2,20,.9*g,x+o,.004)
        x+=60/lg_(b0,b1,(x-a)/(b-a))
lg_=lambda a,b,u:a+(b-a)*min(1,max(0,u))
heart(L[13]['t'],L[16]['t'],60,92)
# rush: rapid footsteps, interference, then sudden silence at the reveal
x=L[16]['t']
while x<L[17]['t']+.3:
    n=int(.1*sr); put(fx,lp(rng.standard_normal(n),20)*np.exp(-np.arange(n)/sr*45)*4,x,.6); x+=.22
a_=L[17]['t']; b_=L[21]['t']; n=int((b_-a_)*sr); tt=np.arange(n)/sr; put(fx,lp(rng.standard_normal(n),3)*(np.floor(tt*12)%3==0)*.25,a_)
heart(L[19]['t'],L[21]['t'],80,110)
tone(70,.8,4,.6,L[21]['t'],.003)
# deep bass impact at the cut to black, then three seconds of complete silence
tone(38,2.2,1.6,1.,ev['black'],.003); n=int(.5*sr); put(fx,lp(rng.standard_normal(n),8)*np.exp(-np.arange(n)/sr*8)*3,ev['black'],.6)
# music bed: dark pad with tension curve
def pad(f,g): return sum(np.sin(2*np.pi*f*dd*T+p) for dd,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
ten=np.interp(T,[0,L[7]['t'],L[10]['t'],L[11]['t'],L[16]['t'],L[19]['t'],L[21]['t'],L[21]['t']+.3,L[22]['t'],ev['black']-.01,ev['black']],[.5,.25,.6,.55,.85,1,1,.2,.7,.9,0])
m=(pad(55,.5)+pad(82.4,.3)+pad(103.8,.14)+pad(116.5,.06))*ten*np.minimum(1,T/1.5); m=m/np.abs(m).max()*10**(-26/20)
amb=lp(rng.standard_normal(N),90); amb/=np.abs(amb).max(); amb*=10**(-40/20)*(T<ev['black'])
mix=vo/np.abs(vo).max()*10**(-1.5/20)+m+fx/np.abs(fx).max()*10**(-3/20)+amb
mix*=(T<ev['black']+2.2); mix=np.tanh(mix*1.05)/1.05; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/lasthuman_mix.wav',mix,sr)
print(round(DUR,2), ev)
for j,l in enumerate(lines): print(j,l['t'],l['d'],l['text'][:44])
