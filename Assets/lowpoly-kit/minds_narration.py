#!/usr/bin/env python3
"""Narration, timings (minds_timeline.json) and sound design for: what if every human could read minds.
Script supplied by the user (fiction), narrated in full by Michael."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; SPEED=1.15
SC=[('The hook',["What if tomorrow morning, every human on Earth suddenly gained the ability to read minds?","No secrets. No lies. No hidden thoughts.","Every thought inside your head could be heard by everyone around you."]),
('The chaos',["At first, humanity experiences complete chaos.","Relationships collapse as hidden feelings are exposed. Friendships end. Political leaders lose public trust. Criminals can no longer hide their intentions.","Even the smallest conversations become terrifying.","Because people can finally hear what others truly think about them."]),
('The new world',["Within weeks, governments introduce strict laws against thinking about certain things.","Schools begin teaching children how to control their thoughts.","People stop meeting face-to-face.","Silence becomes the most valuable luxury in the world.","But nobody can control what their brain thinks."]),
('The terrifying discovery',["Then scientists discover something impossible.","Millions of people across different countries are hearing the exact same thought.","A thought that doesn't belong to any human.","It appears inside every mind simultaneously.","And it is getting louder."]),
('The final twist',["Scientists trace the mysterious thought to a source beyond Earth.","For thousands of years, humanity believed it was developing the ability to read minds.","But the truth is far more terrifying.","Humans aren't reading each other's thoughts.","Something else is using every human brain as a receiver."]),
('The ending',["And suddenly, billions of minds receive one final message.","We have finally found you."])]
PAUSE={2:.3,6:.3,11:.35,14:.3,16:.6,19:.3,21:.5,22:.7}
t=.9; lines=[]; clips=[]; i=0
for si,(name,L) in enumerate(SC):
    for txt in L:
        x,_=k.create(txt,voice=VOICE,speed=(.8 if txt.startswith('We have finally') else SPEED),lang='en-us'); x=x.astype('float32')
        if txt.startswith('We have finally'):
            lo=np.interp(np.linspace(0,len(x)-1,int(len(x)*1.3)),np.arange(len(x)),x); hi=np.interp(np.linspace(0,len(x)-1,int(len(x)*1.3)),np.arange(len(x)),x[::1]); y=np.zeros(len(lo)+2400); y[:len(lo)]+=lo; y[1200:1200+len(lo)]+=lo*.5; y[2400:2400+len(lo)]+=lo*.25; x=y.astype('float32')
        d=len(x)/sr
        lines.append({'t':round(t,3),'d':round(d,3),'text':txt,'scene':si}); clips.append((x,t)); t+=d+.12+PAUSE.get(i,0); i+=1
    t+=.15
black=lines[-1]['t']+lines[-1]['d']+.25; DUR=black+1.6
L=lines; ev={'pop':round(L[0]['t']+L[0]['d']*.55,3),'chaos':L[3]['t'],'newworld':L[7]['t'],'discover':L[12]['t'],'same':round(L[15]['t']+.3,3),'louder':L[16]['t'],'trace':L[17]['t'],'switch':round(L[21]['t']+.4,3),'final':L[22]['t'],'message':L[23]['t'],'black':round(black,3)}
json.dump({'duration':round(DUR,3),'scenes':[s_[0] for s_ in SC],'lines':lines,'events':ev},open(here/'minds_timeline.json','w'),indent=1)
N=int(DUR*sr); T=np.arange(N)/sr; rng=np.random.default_rng(15)
def put(buf,x,at,g=1.):
    j=int(at*sr); x=x[:max(0,N-j)]; buf[j:j+len(x)]+=x*g
vo=np.zeros(N); [put(vo,x,at) for x,at in clips]
fx=np.zeros(N)
def env(n,a,dec): tt=np.arange(n)/sr; return np.minimum(1,tt/a)*np.exp(-tt*dec)
def tone(f,dur,dec,g,at,a=.002):
    n=int(dur*sr); tt=np.arange(n)/sr; put(fx,np.sin(2*np.pi*f*tt)*env(n,a,dec),at,g)
def lp(x,n): return np.convolve(x,np.ones(n)/n,'same')
# overlapping whispered thoughts (both voices, thin and quiet)
WH=["I never liked him.","Does she know?","Please don't look at me.","I lied about everything.","What is he thinking?","I want to go home.","They can hear me.","Stop thinking. Stop thinking."]
wh=[]
for j,w in enumerate(WH):
    y,_=k.create(w,voice=('af_bella' if j%2 else 'am_michael'),speed=1.05+.1*(j%3),lang='en-us'); y=y.astype('float32'); y=y-lp(y,24); wh.append(y/np.abs(y).max())
def whispers(a,b,g):
    x=a; j=0
    while x<b: put(fx,wh[j%len(wh)],x,g*(.7+.5*rng.random())); x+=.55+.5*rng.random(); j+=1
whispers(ev['pop'],L[3]['t'],.16); whispers(L[3]['t'],L[7]['t'],.24); whispers(L[11]['t'],L[12]['t'],.14)
tone(1320,.5,5,.25,ev['pop']); tone(1760,.5,5,.15,ev['pop']+.08)
def glitch(at,dur=.4,g=.5):
    n=int(dur*sr); tt=np.arange(n)/sr; sq=np.sign(np.sin(2*np.pi*(160+900*rng.random())*tt))*(np.floor(tt*40)%2); nz=rng.standard_normal(n)*(np.floor(tt*55)%3==0)
    put(fx,(sq*.5+nz*.6)*np.minimum(1,tt/.01)*np.exp(-tt*4),at,g); tone(58,dur,3,.7*g,at)
for at in (L[4]['t']+.1,L[4]['t']+L[4]['d']*.34,L[4]['t']+L[4]['d']*.5,L[4]['t']+L[4]['d']*.74): tone(180,.35,9,.5,at,.002)
# new world: cold bell, classroom bell, then near silence for the luxury line
tone(440,1.2,2,.25,ev['newworld'],.005); [tone(1568,.25,10,.2,L[8]['t']+j*.3) for j in range(3)]
# the alien thought: a slow three-note motif that every mind hears, getting louder
def motif(at,g):
    for j,f in enumerate((196,233,185)):
        n=int(.7*sr); tt=np.arange(n)/sr; put(fx,(np.sin(2*np.pi*f*tt)+.5*np.sin(2*np.pi*f*2.01*tt)+.3*np.sin(2*np.pi*f*.5*tt))*np.sin(np.pi*tt/.7)**2,at+j*.42,g)
x=L[13]['t']; g=.12
while x<ev['message']-.4: motif(x,g); x+=1.9; g=min(.6,g*1.22)
tone(48,3,1,1.,ev['same'],.01); glitch(ev['same'],.4,.4)
for j in range(4): glitch(ev['louder']+.3+j*.5,.3,.35+j*.08)
tone(55,2.5,1.2,.9,ev['switch'],.005); glitch(ev['switch'],.5,.5)
n=int(2.2*sr); tt=np.arange(n)/sr; put(fx,lp(rng.standard_normal(n),12)*(tt/2.2)**2*5,ev['message']-2.2,.5); tone(40,4,.6,1.,ev['message'],.01)
# music bed: dark pad with tension curve
def pad(f,g): return sum(np.sin(2*np.pi*f*dd*T+p) for dd,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
ten=np.interp(T,[0,ev['chaos'],ev['newworld'],L[10]['t'],L[10]['t']+.3,L[11]['t'],ev['discover'],ev['same'],ev['trace'],ev['switch'],ev['final'],ev['black']-.02,ev['black']],[.3,.7,.5,.4,.08,.3,.6,.9,.75,1,.9,1,0])
m=(pad(55,.5)+pad(82.4,.3)+pad(103.8,.14)+pad(116.5,.06))*ten*np.minimum(1,T/1.5); m=m/np.abs(m).max()*10**(-21/20)
amb=lp(rng.standard_normal(N),90); amb/=np.abs(amb).max(); amb*=10**(-38/20)*(T<ev['black'])
mix=vo/np.abs(vo).max()*10**(-1.5/20)+m+fx/np.abs(fx).max()*10**(-3/20)+amb
mix*=(T<ev['black']); mix=np.tanh(mix*1.05)/1.05; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/minds_mix.wav',mix,sr)
print(round(DUR,2), ev)
for j,l in enumerate(lines): print(j,l['t'],l['d'],l['text'][:44])
