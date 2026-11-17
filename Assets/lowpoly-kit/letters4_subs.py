#!/usr/bin/env python3
"""Build burned-in subtitles (out/letters4.ass) for Reel 4 from letters4_timeline.json.
Narration: short white phrase chunks. Written lines (whispered): pale italic, in quotes."""
import json, re
from pathlib import Path
here=Path(__file__).resolve().parent; TL=json.load(open(here/'letters4_timeline.json'))
# on-screen spelling for lines written phonetically for the voice
DISPLAY={}
MAXC=26  # characters per chunk

def chunks(text):
    words=text.split(); out=[]; cur=''
    for w in words:
        if cur and (len(cur)+1+len(w)>MAXC or re.search(r'[,.]$',cur)): out.append(cur); cur=w
        else: cur=(cur+' '+w).strip()
    if cur: out.append(cur)
    for i in range(len(out)-1):
        a=out[i].split()
        if len(a)>=2 and a[-1].lower() in ('of','the','a','an','to','in','at','on','his','her','from','dated'): out[i]=' '.join(a[:-1]); out[i+1]=a[-1]+' '+out[i+1]
    if len(out)>1 and ' ' not in out[-1] and len(out[-2])+len(out[-1])<34 and not re.search(r'[,.]$',out[-2]): last=out.pop(); out[-1]+=' '+last
    return out

def ts(t): h=int(t//3600); m=int(t%3600//60); s=t%60; return f"{h}:{m:02d}:{s:05.2f}"
ev=[]
for seg in TL['segments']:
    for ln in seg['lines']:
        txt=DISPLAY.get(ln['text'],ln['text']); w=ln['v']=='w'
        if w:  # whispered writing: whole line at once, two rows if long
            ws=txt.split(); half=(len(ws)+1)//2; body=' '.join(ws[:half])+(r'\N'+' '.join(ws[half:]) if len(txt)>MAXC else '')
            if len(txt)<=MAXC: body=txt
            ev.append((ln['t']-.1,ln['t']+ln['d']+.35,'Whisper','“'+body+'”')); continue
        cs=chunks(txt); tot=sum(len(c)+3 for c in cs); t=ln['t']
        for c in cs:
            d=ln['d']*(len(c)+3)/tot; ev.append((t,t+d,'Narr',c)); t+=d
# no overlaps: each event ends where the next begins at the latest
ev.sort(); ev=[(a,min(b,ev[i+1][0]) if i+1<len(ev) else b,s,x) for i,(a,b,s,x) in enumerate(ev)]
hdr="""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Narr,Inter,82,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,1,5,3,2,80,80,470,1
Style: Whisper,DejaVu Serif,76,&H00E6E2C8,&H00FFFFFF,&H00100808,&H96000000,0,1,0,0,100,100,1,0,1,4,3,2,80,80,470,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
lines=[f"Dialogue: 0,{ts(a)},{ts(b)},{s},,0,0,0,,{{\\fad(90,90)}}{x}" for a,b,s,x in ev]
(here/'out').mkdir(exist_ok=True); open(here/'out/letters4.ass','w').write(hdr+'\n'.join(lines)+'\n')
print(len(ev),'events')
