#!/usr/bin/env python3
"""Narration, timings (sameday_timeline.json) and sound design for: what if you could relive the same day forever.
Script supplied by the user (fiction), narrated in full by Michael."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; SPEED=1.15
SC=[('The hook',["What if you woke up tomorrow and realised that today had happened before?","And tomorrow... would never come."]),
('The discovery',["A young man wakes up, gets ready for work, drinks his coffee and leaves his apartment.","Everything seems normal.","Until he notices the same accident happening at the same intersection.","The same car. The same pedestrian. The same broken traffic light.","He begins to feel that something is terribly wrong."]),
('The realisation',["The next morning, he wakes up again.","The exact same date.","The same phone notification. The same breakfast. The same accident.","He tries everything to change the day.","He stays home, takes a different route and even refuses to sleep.","But no matter what he does, midnight arrives...","And the day resets."]),
('The dark secret',["After what feels like hundreds of identical days, he discovers something terrifying.","Every time the clock reaches midnight, the entire world resets.","Except one thing.","A small photograph on his bedroom wall.","With every reset, another person disappears from it."]),
('The final twist',["On the final photograph, only one person remains.","Himself.","He finally understands.","This isn't a time loop designed to trap him.","It's a countdown.","And when the last person disappears...","There will be nothing left to reset."]),
('The ending',["But the strangest part?","The clock strikes midnight.","And for the first time...","It keeps moving."])]
# extra pause after specific lines (index) for beats: alarm hook, crash, resets, the twist and the final tick
PAUSE={1:.3,5:.6,12:.25,13:.45,17:.2,19:.2,20:.3,23:.25,25:.5,26:.1,27:.6,28:.35}
t=.9; lines=[]; clips=[]; i=0
for si,(name,L) in enumerate(SC):
    for txt in L:
        x,_=k.create(txt,voice=VOICE,speed=SPEED,lang='en-us'); x=x.astype('float32'); d=len(x)/sr
        lines.append({'t':round(t,3),'d':round(d,3),'text':txt,'scene':si}); clips.append((x,t)); t+=d+.12+PAUSE.get(i,0); i+=1
    t+=.15
end_tick=lines[-1]['t']+lines[-1]['d']+1.4; DUR=end_tick+1.1
ev={'crash':round(lines[5]['t']+lines[5]['d']-.2,3),'reset1':lines[7]['t']-.25,'midnight1':lines[12]['t']+lines[12]['d']+.1,'reset2':lines[13]['t']-.15,
    'secret':lines[14]['t'],'world':lines[15]['t'],'photo':lines[17]['t'],'gone':[lines[18]['t']+.3+j*(lines[18]['d']+.2)/4 for j in range(4)]+[lines[19]['t']+lines[19]['d']*.55],
    'himself':lines[20]['t'],'fade':lines[25]['t'],'midnight2':lines[27]['t']+.55,'keeps':lines[29]['t']+.15,'black':end_tick}
json.dump({'duration':round(DUR,3),'scenes':[s[0] for s in SC],'lines':lines,'events':ev},open(here/'sameday_timeline.json','w'),indent=1)
N=int(DUR*sr); T=np.arange(N)/sr; rng=np.random.default_rng(14)
def put(buf,x,at,g=1.):
    j=int(at*sr); x=x[:max(0,N-j)]; buf[j:j+len(x)]+=x*g
vo=np.zeros(N); [put(vo,x,at) for x,at in clips]
fx=np.zeros(N)
def env(n,a,dec): tt=np.arange(n)/sr; return np.minimum(1,tt/a)*np.exp(-tt*dec)
def tone(f,dur,dec,g,at,a=.002):
    n=int(dur*sr); tt=np.arange(n)/sr; put(fx,np.sin(2*np.pi*f*tt)*env(n,a,dec),at,g)
def tick(at,g=.5):
    n=int(.05*sr); put(fx,np.convolve(rng.standard_normal(n),np.ones(3)/3,'same')*env(n,.0005,90)*2.5,at,g); tone(2400,.04,120,.25*g,at)
def glitch(at,dur=.45,g=.6):
    n=int(dur*sr); tt=np.arange(n)/sr; sq=np.sign(np.sin(2*np.pi*(180+1400*rng.random())*tt))*(np.floor(tt*40)%2); nz=rng.standard_normal(n)*(np.floor(tt*55)%3==0)
    put(fx,(sq*.5+nz*.6)*np.minimum(1,tt/.01)*np.exp(-tt*4),at,g); tone(60,dur,3,.8*g,at)
def alarm(at,reps=3):
    for r in range(reps):
        for j in range(3): tone(1900,.09,6,.32,at+r*.55+j*.13,.003)
def whoosh(at,dur=1.2,g=.35):
    n=int(dur*sr); tt=np.arange(n)/sr; nz=np.convolve(rng.standard_normal(n),np.ones(40)/40,'same'); put(fx,nz*np.sin(np.pi*tt/dur)**2*6,at,g)
alarm(.05,2); alarm(lines[7]['t']+.05,2); alarm(ev['reset2']+.6,2)
# accident: tyre skid then crash + glass, slow-motion feel
n=int(1.6*sr); tt=np.arange(n)/sr; sk=np.sin(2*np.pi*(820+60*np.sin(tt*30))*tt)*.3+np.convolve(rng.standard_normal(n),np.ones(6)/6,'same')*.8
put(fx,sk*np.minimum(1,tt/.2)*(1-tt/1.6),ev['crash']-1.6,.45)
n=int(2.5*sr); tt=np.arange(n)/sr; cr=np.sin(2*np.pi*(55+40*np.exp(-tt*8))*tt)*np.exp(-tt*2.5)*2+np.convolve(rng.standard_normal(n),np.ones(10)/10,'same')*np.exp(-tt*3)*6
put(fx,np.tanh(cr),ev['crash'],.9); [tone(3000+900*rng.random(),.25,14,.12,ev['crash']+.05+j*.07) for j in range(7)]
whoosh(lines[5]['t']-.3,1.0); whoosh(lines[9]['t']+lines[9]['d']*.66-.3,.8,.25)
crash2=lines[9]['t']+lines[9]['d']*.66+.7; put(fx,np.tanh(cr[:int(1.2*sr)]),crash2,.5)
for gt in [ev['reset1'],ev['reset2'],ev['midnight1']-.05]+ev['gone']: glitch(gt)
s=lines[14]['t']; [glitch(s+j*(lines[15]['t']-s)/9,.2,.35) for j in range(9)]  # montage of hundreds of days
glitch(ev['world']+lines[15]['d']*.7,.6,.6)
# clock ticks: under midnight approach, the countdown line and the whole ending; stop dead at black
for a,b in ((lines[11]['t']+lines[11]['d']*.66,ev['midnight1']),(lines[23]['t'],lines[23]['t']+lines[23]['d']+.3),(lines[26]['t']-.4,ev['black'])):
    x=a
    while x<b: tick(x,.55 if b==ev['black'] else .4); x+=1.0
tone(523,1.8,1.3,.35,ev['midnight2'],.005); tone(784,1.8,1.3,.2,ev['midnight2'],.005)  # midnight chime
# music: low pad with tension curve, dropping out at black
def pad(f,g): return sum(np.sin(2*np.pi*f*dd*T+p) for dd,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
ten=np.interp(T,[0,lines[2]['t'],lines[4]['t'],ev['crash'],lines[7]['t'],ev['secret'],ev['photo'],lines[19]['t'],ev['fade'],lines[26]['t'],ev['black']-.01,ev['black']],[.4,.3,.45,.9,.5,.75,.6,.85,1,.45,.6,0])
m=(pad(65.4,.5)+pad(98,.28)+pad(130.8,.12)+pad(155.6,.08)*np.clip((T-ev['secret'])/10,0,1))*ten*np.minimum(1,T/1.5)
m=m/np.abs(m).max()*10**(-21/20)
amb=np.convolve(rng.standard_normal(N),np.ones(90)/90,'same'); amb/=np.abs(amb).max(); amb*=10**(-38/20)
mix=vo/np.abs(vo).max()*10**(-1.5/20)+m+fx/np.abs(fx).max()*10**(-3/20)+amb
mix*=(T<ev['black']); mix=np.tanh(mix*1.05)/1.05; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/sameday_mix.wav',mix,sr)
print(round(DUR,2)); print({k_:v for k_,v in ev.items() if k_!='gone'}, [round(g,2) for g in ev['gone']])
for j,l in enumerate(lines): print(j,l['t'],l['d'],l['text'][:40])
