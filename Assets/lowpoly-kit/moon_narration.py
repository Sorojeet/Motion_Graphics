#!/usr/bin/env python3
"""Narration, timings (moon_timeline.json) and sound design for: what if the Moon disappeared for just one night.
Script supplied by the user (sci-fi fiction), narrated in full by Michael."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; SPEED=1.15
SC=[('The hook',["What if you looked at the night sky tomorrow... and the Moon was simply gone?","No explosion. No warning. No explanation.","Just an empty sky."]),
('The chaos',["At first, people think it's a rare astronomical event.","But within hours, scientists discover something terrifying.","Ocean tides begin behaving unpredictably.","Coastal cities face unusual flooding patterns, and the entire world watches the sky in confusion.","For the first time in human history, Earth has lost its closest celestial companion."]),
('The mystery',["Governments declare emergencies.","Astronomers scan the sky.","Satellites search every corner of space.","But the Moon is nowhere to be found.","Then, exactly at midnight, every telescope on Earth detects the same strange signal.","It's coming from beyond the orbit of Mars."]),
('The revelation',["Scientists decode the signal.","It's not a distress message.","It's a warning.","The message reveals that the Moon was never just a natural satellite.","Something had been hiding beneath its surface for billions of years.","And now...","It's awake."]),
('The final twist',["Suddenly, the Moon reappears.","But something is different.","Its surface is glowing with thousands of strange lights.","Then, every light on Earth switches off simultaneously.","And from the darkness, something begins transmitting a signal.","Not from the Moon...","But from inside Earth."]),
('The ending',["Maybe the Moon wasn't watching Earth.","Maybe it was protecting us from something buried beneath it."])]
PAUSE={2:.4,7:.3,13:.3,16:.35,19:.6,20:.5,24:.4,26:.35,27:.6}
t=.9; lines=[]; clips=[]; i=0
for si,(name,L) in enumerate(SC):
    for txt in L:
        x,_=k.create(txt,voice=VOICE,speed=SPEED,lang='en-us'); x=x.astype('float32'); d=len(x)/sr
        lines.append({'t':round(t,3),'d':round(d,3),'text':txt,'scene':si}); clips.append((x,t)); t+=d+.12+PAUSE.get(i,0); i+=1
    t+=.15
black=lines[-1]['t']+lines[-1]['d']+.5; DUR=black+3.4
L=lines; ev={'signal':round(L[12]['t']+L[12]['d']*.55,3),'awake':round(L[20]['t']+.15,3),'reappear':round(L[21]['t']+L[21]['d']*.45,3),'blackout':round(L[24]['t']+L[24]['d']*.55,3),
 'inside':round(L[27]['t'],3),'black':round(black,3),'rumble_end':round(black+1.9,3)}
json.dump({'duration':round(DUR,3),'scenes':[s[0] for s in SC],'lines':lines,'events':ev},open(here/'moon_timeline.json','w'),indent=1)
N=int(DUR*sr); T=np.arange(N)/sr; rng=np.random.default_rng(15)
def put(buf,x,at,g=1.):
    j=int(at*sr); x=x[:max(0,N-j)]; buf[j:j+len(x)]+=x*g
vo=np.zeros(N); [put(vo,x,at) for x,at in clips]
fx=np.zeros(N)
def env(n,a,dec): tt=np.arange(n)/sr; return np.minimum(1,tt/a)*np.exp(-tt*dec)
def tone(f,dur,dec,g,at,a=.002):
    n=int(dur*sr); tt=np.arange(n)/sr; put(fx,np.sin(2*np.pi*f*tt)*env(n,a,dec),at,g)
def lp(x,n): return np.convolve(x,np.ones(n)/n,'same')
# news sting for the chaos montage and the emergency
for at in (L[3]['t']-.25,L[8]['t']-.2):
    for j,f in enumerate((587,784,1175)): tone(f,.5,5,.25,at+j*.09)
# ocean surge under the tides / flooding lines
a,b=L[5]['t'],L[6]['t']+L[6]['d']; n=int((b-a)*sr); tt=np.arange(n)/sr; put(fx,lp(rng.standard_normal(n),30)*(.5+.5*np.sin(2*np.pi*.35*tt))**2*np.minimum(1,tt/.6)*np.minimum(1,(b-a-tt)/.6)*5,a,.5)
# siren for emergencies
a=L[8]['t']; n=int(2.6*sr); tt=np.arange(n)/sr; put(fx,np.sin(2*np.pi*np.cumsum(650+250*np.sin(2*np.pi*.8*tt))/sr)*np.minimum(1,tt/.2)*np.minimum(1,(2.6-tt)/.5)*.25,a)
# radar pings while satellites search
for j in range(5): tone(1320,.5,7,.18,L[10]['t']+j*1.05)
# the signal: rhythmic alien pulses at midnight and through the decoding
def signal(a,b,f=880,g=.22):
    x=a
    while x<b:
        for o,ff in ((0,f),(.12,f*1.5),(.24,f)): tone(ff,.1,25,g,x+o)
        x+=.9
signal(ev['signal'],L[14]['t']+L[16]['d']+L[15]['d']+1.5)
tone(220,1.2,1.5,.35,L[16]['t'],.01); tone(233,1.2,1.5,.25,L[16]['t'],.01)  # warning hit
# awakening: rising swell into a heavy hit
n=int(3*sr); tt=np.arange(n)/sr; put(fx,lp(rng.standard_normal(n),12)*(tt/3)**2*4,ev['awake']-3,.5); tone(45,2.5,1.2,1.,ev['awake'],.005)
tone(70,1.5,2,.7,ev['reappear'],.003); n=int(.6*sr); put(fx,lp(rng.standard_normal(n),3)*env(n,.002,6)*2,ev['reappear'],.4)
# blackout: electrical clunk and hum dying
tone(55,.6,6,1.,ev['blackout'],.001); n=int(1.5*sr); tt=np.arange(n)/sr; put(fx,np.sign(np.sin(2*np.pi*(120-60*tt/1.5)*tt))*(1-tt/1.5)*.15,ev['blackout']-1.5)
signal(L[25]['t']+.4,L[28]['t'],f=330,g=.28)
# deep rumble at the end, then complete silence
a=L[27]['t']; b=ev['rumble_end']; n=int((b-a)*sr); tt=np.arange(n)/sr; rum=(np.sin(2*np.pi*32*tt)+.6*np.sin(2*np.pi*41*tt+1))*np.minimum(1,tt/2)+lp(rng.standard_normal(n),200)*8
put(fx,rum*np.minimum(1,(b-a-tt)/.05),a,.9)
# music bed: dark pad with tension curve
def pad(f,g): return sum(np.sin(2*np.pi*f*dd*T+p) for dd,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
ten=np.interp(T,[0,L[3]['t'],L[8]['t'],ev['signal'],L[14]['t'],ev['awake'],ev['reappear'],ev['blackout'],ev['blackout']+.05,L[28]['t'],ev['black'],ev['black']+.01],[.45,.6,.7,.85,.75,1,.8,.9,.15,.55,.55,0])
m=(pad(55,.5)+pad(82.4,.3)+pad(103.8,.14)+pad(116.5,.06))*ten*np.minimum(1,T/1.5); m=m/np.abs(m).max()*10**(-21/20)
amb=lp(rng.standard_normal(N),90); amb/=np.abs(amb).max(); amb*=10**(-38/20)*(T<ev['black'])
mix=vo/np.abs(vo).max()*10**(-1.5/20)+m+fx/np.abs(fx).max()*10**(-3/20)+amb
mix*=(T<ev['rumble_end']); mix=np.tanh(mix*1.05)/1.05; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/moon_mix.wav',mix,sr)
print(round(DUR,2), ev)
for j,l in enumerate(lines): print(j,l['t'],l['d'],l['text'][:44])
