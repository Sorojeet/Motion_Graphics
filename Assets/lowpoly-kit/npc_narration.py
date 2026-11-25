#!/usr/bin/env python3
"""First-person narration, timings (npc_timeline.json) and sound for: what if you became an NPC."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
# Comedy fiction: you become a background NPC in an open-world crime game (original city, no real game assets/logos).
SEG=[('NPC','#4127','Spawned','PEDESTRIAN · NO NAME',["What if you woke up as a background character in a crime game?","You blink into existence on a sidewalk, ten seconds before the player drives by."]),
('3','LINES','Your script','THAT\'S ALL YOU CAN SAY',["You try to scream for help. Instead, you say: Nice weather today.","You only have three lines, and you'll say them forever."]),
('1','PATH','The loop','SIDEWALK · CORNER · BACK',["Your legs walk on their own. To the corner, turn around, and walk back.","You've passed this same hot dog stand four hundred times."]),
('★★★','WANTED','The player arrives','CHAOS INCOMING',["Then the player shows up. Car horns, explosions, a stolen fire truck on the sidewalk.","Everyone runs in exactly the same direction, flailing their arms."]),
('0','HEALTH','Respawn','BACK IN 3… 2… 1…',["A car clips you, and you go flying like a rag doll.","Then you blink, and you're back on the same sidewalk, like nothing happened."]),
('???','GLITCH','The edge of the map','OUT OF RENDER RANGE',["So you try to escape. You walk and walk, until the city stops loading behind you.","Past the edge of the map, there's nothing. Just grey fog, and a floating car with no driver."]),
('1','NEW LINE','Breaking the script','FREE_WILL.EXE',["You go back, and this time, when the player stops, you say something new.","Hey. Want a hot dog? And the whole game freezes."]),
('NPC','→ YOU','Main character?','THE PLAYER IS WATCHING',["The player stares at you, and you stare right back.","So, if you were an NPC, what would your one line be?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for n_,u_,cap,fact,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.02,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.3*sr),'float32')); t+=.3; out.append({'start':round(st,3),'end':round(t,3),'num':n_,'unit':u_,'caption':cap,'fact':fact,'lines':L})
P.append(np.zeros(int(2.5*sr),'float32')); t+=2.5; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr; DUR=N/sr; S=[o['start'] for o in out]
json.dump({'duration':round(DUR,3),'segments':out},open(here/'npc_timeline.json','w'),indent=1)
rng=np.random.default_rng(88)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
deep=np.interp(T,S+[DUR],[0,.1,.25,.4,.55,.75,.9,1,1])
m=(pad(196,.34)+pad(246.9,.22)+pad(293.7,.14))*(1-deep)+(pad(98,.4)+pad(146.8,.24)+pad(155.6,.1)+pad(49,.35))*deep
m*=np.minimum(1,T/1.2)*np.minimum(1,(DUR-T)/2.5)*(.85+.15*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-25/20)
wh=np.zeros(N)
for a in S[1:]:
    i=int((a-.5)*sr); l=min(int(1.1*sr),N-i); tt=np.arange(l)/sr; f=900-700*tt/1.1; wh[i:i+l]+=np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/1.1)**2*.5+np.convolve(rng.standard_normal(l),np.ones(30)/30,'same')*np.sin(np.pi*tt/1.1)**2*2
w=rng.standard_normal(N); amb=np.convolve(w,np.ones(60)/60,'same'); amb/=np.abs(amb).max(); ab=np.interp(T,S+[DUR],[.4,.3,.3,.9,.7,.5,.6,.5,.5])
nn=n/np.abs(n).max()*10**(-1.5/20); mix=nn+m+wh/np.abs(wh).max()*10**(-22/20)+amb*ab*10**(-33/20)
mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20); (here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/npc_mix.wav',mix,sr)
print(DUR); [print(o['start'],o['caption']) for o in out]
