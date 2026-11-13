#!/usr/bin/env python3
"""Voices, event timings (forgot_timeline.json) and sound for: what if everyone forgot you existed.
Script supplied by the user (psychological thriller, fiction). Needs the full Kokoro voice pack
(Assets/voices/kokoro/setup.sh downloads models/voices-v1.0.bin).
Cast: narrator am_michael · the man am_liam · mother af_sarah (phone echo) · doctor bm_george · girl af_sky pitched up."""
import json
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; sr=24000
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'models/voices-v1.0.bin'))
def say(s,v,speed=1.0): x,_=k.create(s,voice=v,speed=speed,lang='en-us' if not v.startswith('b') else 'en-gb'); return x.astype('float32')
def rs(x,f): n=int(len(x)*f); return np.interp(np.linspace(0,len(x)-1,n),np.arange(len(x)),x).astype('float32')
def band(x,lo,hi):
    X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/sr); X[(fr<lo)|(fr>hi)]=0; return np.fft.irfft(X,len(x)).astype('float32')
def verb(x,taps):
    y=np.concatenate([x,np.zeros(int(sr*1.2),'float32')])
    for dl,g in taps: i=int(dl*sr); y[i:i+len(x)]+=x*g
    return y
rng=np.random.default_rng(7)
V1=say("What if you woke up tomorrow, and nobody in the entire world remembered you?",'am_michael',.95)
M1=say("Mom, it's me!",'am_liam',1.05)
MOM=verb(band(say("Sorry... who is this?",'af_sarah',.92),300,3400)*1.6,[(.11,.35),(.23,.18),(.36,.08)])
LAU=say("Ha... ha...",'am_liam',.8)*.7
SCR=np.tanh(say("What is happening to me?!",'am_liam',1.12)*2.2)*.75
D1=say("Impossible...",'bm_george',.8)*.75
M2=say("What? What happened?",'am_liam',1.08)
D2=say("You died three years ago.",'bm_george',.86)
g=rs(say("Daddy... why are you still here?",'af_sky',.78),.8); env=np.convolve(np.abs(g),np.ones(240)/240,'same'); g=g*.75+band(rng.standard_normal(len(g)).astype('float32'),1500,7000)*env*1.4
GIRL=verb(g,[(.07,.4),(.15,.3),(.26,.22),(.4,.14),(.58,.08)])
V2=say("If the world forgot you... would you still know who you are?",'am_michael',.93); V3=say("Follow for more what if stories.",'am_michael',1.0)
d=lambda x:len(x)/sr
ev={}; t=.5; ev['vo1']=t; t+=d(V1)+.3
ev['wake']=t; ev['dial']=t+.6; ev['pick']=ev['dial']+2.3; ev['m1']=ev['pick']+.35; ev['mom']=ev['m1']+d(M1)+.35; ev['laugh']=ev['mom']+d(MOM)-.9+.3
ev['photos']=ev['laugh']+d(LAU)+.25; ev['street']=ev['photos']+3.4; ev['office']=ev['street']+3.3; ev['atm']=ev['office']+2.7; ev['scream']=ev['atm']+2.7; ev['hosp']=ev['scream']+d(SCR)+.5
ev['explain']=ev['hosp']+1.5; ev['file']=ev['explain']+2.1; ev['d1']=ev['file']+1.3; ev['m2']=ev['d1']+d(D1)+.3; ev['d2']=ev['m2']+d(M2)+.35; ev['silence']=ev['d2']+d(D2)
ev['turnfile']=ev['silence']+.6; ev['ring']=ev['turnfile']+2.6; ev['answer']=ev['ring']+2.1; ev['girl']=ev['answer']+.6; ev['black']=ev['girl']+d(GIRL)-1.0
ev['vo2']=ev['black']+1.1; ev['vo3']=ev['vo2']+d(V2)+.5; DUR=ev['vo3']+d(V3)+1.0; ev={a:round(b,3) for a,b in ev.items()}
lines=[(ev['vo1'],V1,"What if you woke up tomorrow... and nobody in the entire world remembered you?",'vo'),(ev['m1'],M1,"“Mom, it's me!”",'man'),(ev['mom'],MOM[:len(MOM)-int(1.2*sr)],"“Sorry... who is this?”",'mom'),(ev['laugh'],LAU,"(nervous laugh)",'man'),
 (ev['scream'],SCR,"“WHAT IS HAPPENING TO ME?”",'man'),(ev['d1'],D1,"“Impossible...”",'doc'),(ev['m2'],M2,"“What? What happened?”",'man'),(ev['d2'],D2,"“You died three years ago.”",'doc'),
 (ev['girl'],GIRL[:len(GIRL)-int(1.2*sr)],"“Daddy... why are you still here?”",'girl'),(ev['vo2'],V2,"If the world forgot you... would you still know who you are?",'vo'),(ev['vo3'],V3,"Follow for more WHAT IF stories.",'vo')]
json.dump({'duration':round(DUR,3),'events':ev,'lines':[{'t':round(a,3),'d':round(d(x),3),'text':s,'who':w} for a,x,s,w in lines]},open(here/'forgot_timeline.json','w'),indent=1)
N=int(DUR*sr); T=np.arange(N)/sr
def put(buf,x,at,gain=1.):
    i=int(at*sr); x=x[:max(0,N-i)]; buf[i:i+len(x)]+=x*gain
vo=np.zeros(N)
for key,x in (('vo1',V1),('m1',M1),('mom',MOM),('laugh',LAU),('scream',SCR),('d1',D1),('m2',M2),('d2',D2),('girl',GIRL),('vo2',V2),('vo3',V3)): put(vo,x,ev[key])
fx=np.zeros(N)
def env_(n,a,dec): tt=np.arange(n)/sr; return np.minimum(1,tt/a)*np.exp(-tt*dec)
def tone(fs,dur,g=.3): n=int(dur*sr); tt=np.arange(n)/sr; return sum(np.sin(2*np.pi*f*tt) for f in fs)*g*np.minimum(1,np.minimum(tt,dur-tt)/.01)
for j in range(2): put(fx,tone((440,480),1.0,.12),ev['dial']+j*1.6*0+j*1.15)  # ringback
n=int(.05*sr); put(fx,rng.standard_normal(n)*env_(n,.001,60)*.5,ev['pick'])
def glitch(at,dur=.45):
    n=int(dur*sr); tt=np.arange(n)/sr; sq=np.sign(np.sin(2*np.pi*(180+900*rng.random())*tt))*(rng.random(n)<.6); put(fx,(rng.standard_normal(n)*.5+sq*.4)*(np.sin(np.pi*tt/dur)>.2)*np.repeat(rng.random(int(n/600)+1)>.4,600)[:n],at,.35)
for o in (0,.9,1.9): glitch(ev['photos']+o,.35)
def step(at,gg=.3): n=int(.1*sr); put(fx,np.convolve(rng.standard_normal(n),np.ones(25)/25,'same')*env_(n,.001,45)*4,at,gg)
for j in range(int(3.3/.4)): step(ev['street']+j*.4,.25)
put(fx,tone((880,),.12,.25),ev['office']+.9); put(fx,np.sign(np.sin(2*np.pi*150*np.arange(int(.6*sr))/sr))*.18,ev['office']+1.05)  # beep, then deny buzz
for j in range(3): put(fx,tone((620,),.18,.22),ev['atm']+.9+j*.28)
def heart(a,b,bpm):
    t0=a
    while t0<b:
        for o,gg in ((0,1),(.17,.7)):
            n=int(.18*sr); tt=np.arange(n)/sr; put(fx,np.sin(2*np.pi*50*tt)*env_(n,.004,22),t0+o,gg*.8)
        t0+=60/bpm
heart(ev['hosp'],ev['silence']-.1,58)
n=int(.7*sr); put(fx,np.convolve(rng.standard_normal(n),np.ones(6)/6,'same')*np.sin(np.pi*np.arange(n)/n)*.12,ev['file']+.2)  # paper
n=int(.6*sr); put(fx,np.convolve(rng.standard_normal(n),np.ones(6)/6,'same')*np.sin(np.pi*np.arange(n)/n)*.12,ev['turnfile']+.2)
for j in range(2):  # phone ring
    tt=np.arange(int(.8*sr))/sr; r=np.sin(2*np.pi*1200*tt)*(np.sin(2*np.pi*20*tt)>0)*.22+np.sin(2*np.pi*1500*tt)*(np.sin(2*np.pi*20*tt)<=0)*.18; put(fx,r,ev['ring']+j*1.05)
n=int(.05*sr); put(fx,rng.standard_normal(n)*env_(n,.001,60)*.4,ev['answer'])
def pad(f,gg): return sum(np.sin(2*np.pi*f*dd*T+p) for dd,p in ((1,0),(1.006,1.3),(.994,2.6)))*gg
lvl=np.interp(T,[0,ev['wake'],ev['photos'],ev['scream'],ev['hosp'],ev['d2']-.05,ev['d2'],ev['ring'],ev['black']-.01,ev['black']],[.6,.4,.7,.9,.6,.8,0,0,.0,0])
m=(pad(49,.5)+pad(73.4,.3)+pad(98,.15)+pad(103.8,.07))*lvl; ten=np.interp(T,[ev['turnfile'],ev['ring'],ev['black']-.01,ev['black']],[0,.5,.9,0])*(T>ev['turnfile']); m+=pad(61.7,.5)*ten+pad(92.5,.2)*ten
endm=(T>ev['vo2']-.4)*np.minimum(1,(T-ev['vo2']+.4)/1.2)*np.minimum(1,(DUR-T)/1.)*.6; m+=pad(55,.4)*endm+pad(82.4,.2)*endm
m=m/np.abs(m).max()*10**(-20/20)
amb=np.convolve(rng.standard_normal(N),np.ones(60)/60,'same'); amb/=np.abs(amb).max(); amb*=((T>ev['street'])&(T<ev['scream']+2.4))*10**(-30/20)
quiet=~((T>=ev['silence'])&(T<ev['turnfile']+.4)); mix=(vo/np.abs(vo).max()*10**(-1.5/20)+m+fx/np.abs(fx).max()*10**(-4/20)+amb)
mix[(T>=ev['silence']+.05)&(T<ev['turnfile']+.3)]*=0.0; mix[(T>=ev['black'])&(T<ev['vo2']-.4)]=0
mix=np.tanh(mix*1.05)/1.05; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/forgot_mix.wav',mix,sr)
print(round(DUR,2)); print(ev)
