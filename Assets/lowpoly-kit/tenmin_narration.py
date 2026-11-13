#!/usr/bin/env python3
"""Voice, event timings (tenmin_timeline.json) and sound design for: what if you could see 10 minutes into your future.
Script supplied by the user (psychological thriller, fiction). Michael voices the hook, the ending and the older self."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000
def say(s,speed=1.0): x,_=k.create(s,voice=VOICE,speed=speed,lang='en-us'); return x.astype('float32')
def older(s):  # slower, lower, breathier: pitch down ~2 semitones by resampling
    x=say(s,.95); n=int(len(x)*1.12); x=np.interp(np.linspace(0,len(x)-1,n),np.arange(len(x)),x).astype('float32'); return x*.8
V1=say("What if you could see exactly what would happen, ten minutes from now?",.95)
W=older("I've been trying to save you... for ten years.")
V2=say("What if your future self is already trying to warn you?",.95); V3=say("Would you listen?",.9)
d=lambda x:len(x)/sr
ev={}; t=.5; ev['vo1']=t; t+=d(V1)+.4
ev['wake']=t; ev['n1']=t+1.3; ev['n2']=ev['n1']+4.2; ev['knock']=ev['n2']+3.0; ev['peep']=ev['knock']+1.9; ev['n3']=ev['peep']+3.4
ev['run']=ev['n3']+2.4; ev['ground']=ev['run']+6.4; ev['boom']=ev['ground']+.9; ev['kneel']=ev['boom']+1.8
ev['n4']=ev['boom']+5.6; ev['n5']=ev['n4']+3.2; ev['turn']=ev['n5']+2.4; ev['reveal']=ev['turn']+3.6; ev['whisper']=ev['reveal']+1.1
ev['black']=ev['whisper']+d(W)+.8; ev['vo2']=ev['black']+1.4; ev['vo3']=ev['vo2']+d(V2)+.45; DUR=ev['vo3']+d(V3)+1.4; ev={a:round(b,3) for a,b in ev.items()}
lines=[{'t':ev['vo1'],'d':round(d(V1),3),'text':"What if you could see exactly what would happen, 10 minutes from now?",'who':'vo'},
 {'t':ev['whisper'],'d':round(d(W),3),'text':"“I've been trying to save you for 10 years.”",'who':'old'},
 {'t':ev['vo2'],'d':round(d(V2),3),'text':"What if your future self is already trying to warn you?",'who':'vo'},
 {'t':ev['vo3'],'d':round(d(V3),3),'text':"Would you listen?",'who':'vo'}]
notes=[{'t':ev['n1'],'text':'10 minutes until your life changes forever.'},{'t':ev['n2'],'text':"DON'T OPEN THE DOOR."},{'t':ev['n3'],'text':'You have 30 seconds. RUN.'},{'t':ev['n4'],'text':'Congratulations. You survived.'},{'t':ev['n5'],'text':'NOW LOOK BEHIND YOU.'}]
json.dump({'duration':round(DUR,3),'events':ev,'lines':lines,'notes':notes},open(here/'tenmin_timeline.json','w'),indent=1)
N=int(DUR*sr); T=np.arange(N)/sr; rng=np.random.default_rng(10)
def put(buf,x,at,g=1.):
    i=int(at*sr); x=x[:max(0,N-i)]; buf[i:i+len(x)]+=x*g
vo=np.zeros(N); [put(vo,x,ev[key]) for x,key in ((V1,'vo1'),(W,'whisper'),(V2,'vo2'),(V3,'vo3'))]
# subtle room echo on the older self
i0=int(ev['whisper']*sr); seg=vo[i0:i0+len(W)+sr].copy(); [put(vo,seg,ev['whisper']+dl,g) for dl,g in ((.09,.25),(.19,.12))]
fx=np.zeros(N)
def env(n,a,dec): tt=np.arange(n)/sr; return np.minimum(1,tt/a)*np.exp(-tt*dec)
def ping(at,urgent=False):
    for j,f in enumerate((1318.5,1760.) if not urgent else (1760.,2349.,1760.)):
        n=int(.32*sr); tt=np.arange(n)/sr; put(fx,np.sin(2*np.pi*f*tt)*env(n,.003,11),at+j*.09,.5)
def buzz(at):
    for j in range(2):
        n=int(.38*sr); tt=np.arange(n)/sr; put(fx,np.tanh(3*np.sin(2*np.pi*155*tt))*np.sin(np.pi*tt/.38)*.35,at+j*.5)
def knock(at):
    n=int(.25*sr); tt=np.arange(n)/sr; put(fx,(np.sin(2*np.pi*95*tt)*1.2+np.convolve(rng.standard_normal(n),np.ones(8)/8,'same')*1.5)*env(n,.001,26),at)
def step(at,g=.5):
    n=int(.12*sr); put(fx,np.convolve(rng.standard_normal(n),np.ones(25)/25,'same')*env(n,.001,40)*4+np.sin(2*np.pi*70*np.arange(n)/sr)*env(n,.001,30),at,g)
def heart(a,b,bpm):
    t0=a
    while t0<b:
        for o,g in ((0,1),(.16,.7)):
            n=int(.18*sr); tt=np.arange(n)/sr; put(fx,np.sin(2*np.pi*52*tt)*env(n,.004,22),t0+o,g*.9)
        t0+=60/bpm
ping(ev['n1']); ping(ev['n2'],True); buzz(ev['n3']); ping(ev['n3']+.1,True); ping(ev['n4']); ping(ev['n5'],True)
for j in range(3): knock(ev['knock']+j*.55)
s=ev['run']; [step(s+j*.27,.55) for j in range(int((ev['ground']-s)/.27))]
heart(ev['n3']+.6,ev['boom']-.1,128); heart(ev['turn'],ev['black']-.2,72)
n=int(4.5*sr); tt=np.arange(n)/sr; boom=np.sin(2*np.pi*(38+30*np.exp(-tt*6))*tt)*np.exp(-tt*1.3)*2.2+np.convolve(rng.standard_normal(n),np.ones(18)/18,'same')*np.exp(-tt*2.2)*7
put(fx,np.tanh(boom),ev['boom'],1.); n=int(3*sr); put(fx,np.convolve(rng.standard_normal(n),np.ones(4)/4,'same')*np.exp(-np.arange(n)/sr*1.2)*.12,ev['boom']+.3)  # debris hiss
ring=np.sin(2*np.pi*3800*T)*np.exp(-np.maximum(T-ev['boom'],0)*.7)*(T>ev['boom']+.2)*.025; fx+=ring
def pad(f,g): return sum(np.sin(2*np.pi*f*dd*T+p) for dd,p in ((1,0),(1.005,1.2),(.995,2.4)))*g
ten=np.interp(T,[0,ev['wake'],ev['knock'],ev['boom'],ev['boom']+.01,ev['kneel'],ev['n5'],ev['reveal'],ev['black']-.05,ev['black']],[.35,.3,.6,1,0,.15,.5,.8,.8,0])
m=(pad(55,.5)+pad(82.4,.3)+pad(110*(1+.0*T),.18)+pad(116.5,.08))*ten; m+=np.sin(2*np.pi*(ev['n3']<T)*(T<ev['boom'])*T*1.1)*0
m*=np.minimum(1,T/1.5)*(T<ev['black']); end=(T>ev['vo2']-.5)*np.minimum(1,(T-ev['vo2']+.5)/1.5)*np.minimum(1,(DUR-T)/1.2)*.45; m+=pad(65.4,.4)*end+pad(98,.2)*end
m=m/np.abs(m).max()*10**(-21/20)
amb=np.convolve(rng.standard_normal(N),np.ones(90)/90,'same'); amb/=np.abs(amb).max(); amb*=(T<ev['black'])*10**(-36/20)
mix=vo/np.abs(vo).max()*10**(-1.5/20)+m+fx/np.abs(fx).max()*10**(-3/20)+amb
mix=np.tanh(mix*1.05)/1.05; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/tenmin_mix.wav',mix,sr)
print(round(DUR,2)); print(ev)
