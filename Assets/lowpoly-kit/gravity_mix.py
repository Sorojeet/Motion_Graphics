#!/usr/bin/env python3
"""Mixes narration with a quiet generated music bed that darkens as gravity drops."""
import json
from pathlib import Path
import numpy as np, soundfile as sf
here=Path(__file__).resolve().parent; n,sr=sf.read(here/'out/audio/narration.wav'); N=len(n); t=np.arange(N)/sr; tl=json.load(open(here/'gravity_timeline.json'))
prog=np.interp(t,[0,tl['segments'][6]['start'],tl['segments'][8]['start'],N/sr],[0,.45,1,1])
def pad(f,g): return sum(np.sin(2*np.pi*f*d*t+p) for d,p in ((1,0),(1.004,1.1),(.996,2.3)))*g
slow=.75+.25*np.sin(2*np.pi*t/9)
m=(pad(110,.5)+pad(164.8,.3)+pad(220,.2)+pad(261.6,.16)*(1-prog))*slow+pad(55,.55)*prog+pad(77.8,.3)*prog**2
m/=np.abs(m).max(); m*=10**(-21/20)*np.minimum(1,t/1.5)*np.minimum(1,(N/sr-t)/2)
n=n/np.abs(n).max()*10**(-1.5/20); x=n+m; x=np.tanh(x*1.05)/1.05; x=x/np.abs(x).max()*10**(-1/20); sf.write(here/'out/audio/gravity_mix.wav',x,sr); print('ok',N/sr)
