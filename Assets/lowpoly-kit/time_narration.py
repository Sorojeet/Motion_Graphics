#!/usr/bin/env python3
"""Generates the time-stop narration, exact timings (time_timeline.json) and the final audio mix."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here=Path(__file__).resolve().parent; K=here.parent/'voices/kokoro'; VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_michael'
SEG=[('Time flowing','0 SEC',25,["What if you could stop time?","Just snap your fingers, and the whole world freezes."]),
('Minute one','1 MIN',25,["Minute one. Birds hang in the sky, and a car stops inches from your knee.","You stroll straight through rush hour traffic, and nobody honks."]),
('Day one','1 DAY',25,["Day one. You walk onto the pitch at a packed stadium final.","You carry the ball into the net and walk away. Eighty thousand people are about to lose their minds."]),
('Week two','2 WEEKS',25,["Week two. Every shop in the city is yours.","No bills. No traffic. No alarm clock."]),
('Month six','6 MONTHS',25,["Month six. You stand beneath a giant wave, frozen above your head.","It is the best view on Earth, and you turn to tell someone."]),
('Year one','1 YEAR',26,["Year one. Nobody has answered you in a long time.","Every joke lands on the same frozen smile."]),
('Year ten','10 YEARS',35,["Year ten. The sun has not moved once. It is always three forty two in the afternoon.","You know every face in this city, and none of them know yours."]),
('Year forty','40 YEARS',65,["Year forty. You find your family, exactly where you left them, laughing at something you can't remember.","You are older than your parents now."]),
('Time flowing','40 YEARS',65,["You sit down beside them, and snap your fingers.","To them, not one second has passed. To you, it was a lifetime.","Would you still stop time?"])]
k=Kokoro(str(K/'models/kokoro-v1.0.onnx'),str(K/'voices-michael-bella.npz')); sr=24000; P=[np.zeros(int(.35*sr),'float32')]; t=.35; out=[]
for cap,stopped,age,ss in SEG:
    st=t; L=[]
    for s in ss:
        x,sr=k.create(s,voice=VOICE,speed=1.08,lang='en-us'); d=len(x)/sr; L.append({'t':round(t,3),'d':round(d,3),'text':s}); P+=[x,np.zeros(int(.2*sr),'float32')]; t+=d+.2
    P.append(np.zeros(int(.22*sr),'float32')); t+=.22; out.append({'start':round(st,3),'end':round(t,3),'caption':cap,'stopped':stopped,'age':age,'lines':L})
P.append(np.zeros(int(2.4*sr),'float32')); t+=2.4; n=np.concatenate(P); N=len(n); T=np.arange(N)/sr
snap=round(out[0]['lines'][1]['t']+.42*out[0]['lines'][1]['d'],3); res=round(out[8]['lines'][0]['t']+out[8]['lines'][0]['d']+.05,3)
json.dump({'duration':round(N/sr,3),'snap':snap,'resume':res,'segments':out},open(here/'time_timeline.json','w'),indent=1)
# city ambience: filtered noise that cuts dead while time is stopped
rng=np.random.default_rng(3); w=rng.standard_normal(N); amb=np.convolve(w,np.ones(90)/90,'same'); amb/=np.abs(amb).max()
on=np.where((T<snap)|(T>res),1.,0.); on=np.convolve(on,np.ones(int(.03*sr))/int(.03*sr),'same'); on[T>res]*=np.minimum(1,(T[T>res]-res)/.4)
def pad(f,g): return sum(np.sin(2*np.pi*f*d*T+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
S=[o['start'] for o in out]; warm=np.interp(T,[snap,S[4],S[5],S[7]],[1,1,.25,0])*(T<res)+(T>=res)*np.minimum(1,(T-res)/2); cold=np.interp(T,[S[4],S[6],S[7]],[0,.8,1])*(T<res)
m=(pad(130.8,.45)+pad(196,.3)+pad(329.6,.14))*warm+(pad(110,.42)+pad(164.8,.26)+pad(174.6,.1)+pad(55,.4))*cold
m*=np.minimum(1,T/1.2)*np.minimum(1,(N/sr-T)/2.2)*(.8+.2*np.sin(2*np.pi*T/8)); m=m/np.abs(m).max()*10**(-22/20)
def snd(at):
    x=np.zeros(N); l=int(.07*sr); i=int(at*sr); x[i:i+l]=rng.standard_normal(l)*np.exp(-np.arange(l)/(.009*sr)); return x
n=n/np.abs(n).max()*10**(-1.5/20); mix=n+m+amb*on*10**(-30/20)+(snd(snap)+snd(res))*.35; mix=np.tanh(mix*1.03)/1.03; mix=mix/np.abs(mix).max()*10**(-1/20)
(here/'out/audio').mkdir(parents=True,exist_ok=True); sf.write(here/'out/audio/time_mix.wav',mix,sr)
print(N/sr,snap,res); [print(o['start'],o['caption']) for o in out]
