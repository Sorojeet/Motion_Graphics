import * as THREE from 'three';
import { rng, flat, shadow, ss, person, woman, car, lamp, skyDome, softSun, roundTree, textSign, trafficLight, shop, house, tower, bench } from './kit.js';
const TL=await (await fetch('/sameday_timeline.json')).json(), LN=TL.lines, EV=TL.events, R=rng(1411), $=id=>document.getElementById(id), DUR=TL.duration;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.03,3000), D=new THREE.Object3D(), C=h=>new THREE.Color(h), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf2d8c0,60,320); const sky=skyDome(sc,0x7f9ad8,0xf2d8c0), sun=softSun(sc,-120,140,-500,90);
const hemi=new THREE.HemisphereLight(0xdfe8ff,0x5a4a3a,1.6); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xffe8c8,1.6); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:250}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.05; sc.add(sunL); sc.add(sunL.target);
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=c=>new THREE.MeshBasicMaterial({color:c});
const face=(p,{brow=0x1a1210}={})=>{ const h=p.children[1], dk=flat(0x1a1210), f=(w,hh,x,y,m=dk)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.02),m); b.position.set(x,y,.18); h.add(b); return b; }; const br=[];
 for(const s of [-1,1]){ f(.065,.055,s*.085,.035); const w=f(.022,.02,s*.085+.012,.045,flat(0xffffff)); w.position.z=.192; br.push(f(.09,.025,s*.085,.095,flat(brow))); } const mo=f(.09,.025,0,-.085,flat(0x6a3a30)); p.userData.brows=br; p.userData.mouth=mo; };
const worry=(p,v)=>{ p.userData.brows.forEach((b,i)=>{ b.rotation.z=(i?-1:1)*.35*v; b.position.y=.095+.012*v; }); p.userData.mouth.scale.set(1-.35*v,1+1.6*v,1); };
// ---------- canvases: alarm clock and the photograph
const canv=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return [c,c.getContext('2d'),t]; };
const [ckC,ck,ckT]=canv(512,256); let ckLast='';
const drawClock=(s,sub,col)=>{ const key=s+sub+col; if(key===ckLast) return; ckLast=key; ck.fillStyle='#0a0a0c'; ck.fillRect(0,0,512,256); ck.fillStyle=col; ck.textAlign='center'; ck.textBaseline='middle'; ck.font=`600 ${s.length>5?118:170}px Jost`; ck.shadowColor=col; ck.shadowBlur=18; ck.fillText(s,256,112); ck.shadowBlur=0; ck.font='500 34px Jost'; ck.fillStyle='#8a8f9a'; ck.fillText(sub,256,214); ckT.needsUpdate=true; };
const PPL=[{x:.12,s:'#d64f4f',h:'#5a3320',k:'#f0c8a0',w:1},{x:.27,s:'#4fa28f',h:'#c89a5a',k:'#d9a27a'},{x:.43,s:'#3f78c4',h:'#2a1a10',k:'#d9a27a',me:1},{x:.58,s:'#efc14d',h:'#1a1a1a',k:'#8a5a3a',w:1},{x:.73,s:'#8a5ac8',h:'#5a3320',k:'#f0c8a0'},{x:.88,s:'#f09a4a',h:'#2a1a10',k:'#b07a4a',w:1,kid:1}];
const [phC,ph,phT]=canv(640,480); let phLast='';
const drawPhoto=(alive,ghost,gamt,meFade)=>{ const key=alive.join()+'|'+ghost+'|'+(gamt*10|0)+'|'+(meFade*20|0); if(key===phLast) return; phLast=key;
 const g=ph.createLinearGradient(0,0,0,480); g.addColorStop(0,'#9fc4ec'); g.addColorStop(.62,'#e8e2d0'); g.addColorStop(.63,'#7fb05a'); g.addColorStop(1,'#5f9a44'); ph.fillStyle=g; ph.fillRect(0,0,640,480);
 ph.fillStyle='#3f8a48'; ph.beginPath(); ph.arc(90,250,70,0,7); ph.arc(560,240,80,0,7); ph.fill(); ph.fillStyle='#fff6d0'; ph.beginPath(); ph.arc(540,70,34,0,7); ph.fill();
 const fig=(p,dx=0,alpha=1)=>{ const x=p.x*640+dx, sc=p.kid?.75:1, base=430, H=230*sc; ph.globalAlpha=alpha; ph.fillStyle='#2a2f3a'; ph.fillRect(x-22*sc,base-H*.42,18*sc,H*.42); ph.fillRect(x+4*sc,base-H*.42,18*sc,H*.42); ph.fillStyle=p.s; ph.fillRect(x-32*sc,base-H*.82,64*sc,H*.44); if(p.w){ ph.beginPath(); ph.moveTo(x-34*sc,base-H*.42); ph.lineTo(x+34*sc,base-H*.42); ph.lineTo(x+26*sc,base-H*.62); ph.lineTo(x-26*sc,base-H*.62); ph.fill(); }
  ph.fillStyle=p.k; ph.fillRect(x-24*sc,base-H,48*sc,48*sc); ph.fillStyle=p.h; ph.fillRect(x-26*sc,base-H-8*sc,52*sc,18*sc); if(p.w) ph.fillRect(x-26*sc,base-H,10*sc,50*sc), ph.fillRect(x+16*sc,base-H,10*sc,50*sc); ph.fillStyle='#1a1210'; ph.fillRect(x-12*sc,base-H+20*sc,7*sc,7*sc); ph.fillRect(x+5*sc,base-H+20*sc,7*sc,7*sc); ph.fillStyle='#8a3a30'; ph.fillRect(x-9*sc,base-H+34*sc,18*sc,4*sc); ph.globalAlpha=1; };
 PPL.forEach((p,i)=>{ if(alive.includes(i)){ const a=p.me?1-meFade:1; if(a>0) fig(p,0,a); } else if(i===ghost&&gamt>0){ ph.save(); fig(p,(Math.sin(gamt*40)*18),gamt*.8); ph.globalCompositeOperation='lighter'; ph.fillStyle='rgba(0,255,255,.25)'; ph.fillRect(p.x*640-40,180+((gamt*7|0)%5)*40,80,18); ph.restore(); } });
 if(meFade>0&&meFade<1){ ph.fillStyle=`rgba(255,40,80,${.2*Math.sin(meFade*60)**2})`; ph.fillRect(PPL[2].x*640-40,190,80,240); }
 phT.needsUpdate=true; };
// ---------- hero and pedestrian
const hero=person({shirt:0x3f78c4,pants:0x2a2f3a,hair:0x2a1a10}); face(hero); sc.add(hero); const H=i=>hero.children[i];
const beard=hero.userData.beard; beard.material=flat(0x2a1a10);
const mug=new THREE.Group(); bx(mug,.16,.2,.16,0xf2efe6,0,0,0); bx(mug,.04,.1,.08,0xf2efe6,.1,0,0);
const pedW=woman({shirt:0xefc14d,hair:0x1a1a1a,skin:0x8a5a3a}); face(pedW); sc.add(pedW);
// ======================= ROOM (studio flat)
const room=new THREE.Group(); sc.add(room);
bx(room,10,.1,8,0x9a7a5a,0,-.05,0); bx(room,10,.1,8,0xf2ede4,0,3.25,0); for(const [w,d,x,z] of [[10,.2,0,-4.1],[.2,8,-5.1,0],[.2,8,5.1,0],[7.9,.2,-1.05,4.1],[1.15,.2,4.525,4.1]]) bx(room,w,3.3,d,0xb8c8b0,x,1.6,z); bx(room,1.05,1.05,.2,0xb8c8b0,3.425,2.725,4.1);
for(const x of [2.86,3.99]) bx(room,.1,2.25,.26,0x5a4a3a,x,1.1,4.1); bx(room,1.23,.1,.26,0x5a4a3a,3.425,2.2,4.1);
const hall=new THREE.Group(); room.add(hall); bx(hall,6,.1,4,0x7a2a32,3.4,-.05,6.2); bx(hall,6,.2,4,0xe8e0d0,3.4,3.1,6.2); bx(hall,6,3.2,.2,0xd8c8a8,3.4,1.6,8.2); for(const x of [.4,6.4]) bx(hall,.2,3.2,4,0xd8c8a8,x,1.6,6.2); bx(hall,.7,.06,.7,glowM(0xfff0c8),3.4,3.0,6.2); const hallL=new THREE.PointLight(0xffe0b0,6,8); hallL.position.set(3.4,2.6,6.2); hall.add(hallL);
const winM=glowM(0xcfe4f8); const winR=bx(room,.05,1.5,2,winM,5,1.9,.4); for(const [h,w2,y,z] of [[.12,2.2,2.7,.4],[.12,2.2,1.1,.4],[1.5,.1,1.9,.4]]) bx(room,.1,h,w2,0x5a4a3a,4.97,y,z);
bx(room,2,.45,3.2,0x6b5040,3,.25,-2.4); bx(room,1.9,.25,3,0xf2efe6,3,.57,-2.4); bx(room,.9,.18,.5,0xffffff,3,.78,-3.65); const blanket=bx(room,2,.2,1.9,0xd88a4a,3,.8,-1.6); bx(room,2.1,1.2,.15,0x6b5040,3,.85,-3.95);
bx(room,.8,.6,.7,0x8a6a4a,1.45,.3,-3.5);
const clk=new THREE.Group(); clk.position.set(1.45,.6,-3.45); clk.rotation.y=.35; room.add(clk); bx(clk,.62,.34,.24,0x1a1a1e,0,.17,0); const ckS=new THREE.Mesh(new THREE.PlaneGeometry(.54,.27),new THREE.MeshBasicMaterial({map:ckT})); ckS.position.set(0,.17,.121); clk.add(ckS); const ckL=new THREE.PointLight(0xff4040,.6,2.2); ckL.position.set(0,.2,.4); clk.add(ckL);
const photo=new THREE.Group(); photo.position.set(3,2.25,-3.97); room.add(photo); bx(photo,1.28,1,.06,0x4a3020,0,0,0); bx(photo,1.16,.88,.065,0xf2ede4,0,0,0); const phS=new THREE.Mesh(new THREE.PlaneGeometry(1.04,.78),new THREE.MeshBasicMaterial({map:phT})); phS.position.z=.04; photo.add(phS);
const cal=textSign('NOVEMBER\nTUE 14',.62,.82,'#ffffff','#c83a3a',{px:130}); cal.position.set(.4,1.85,-3.98); room.add(cal); const calRing=new THREE.Mesh(new THREE.TorusGeometry(.17,.015,6,20),glowM(0xd63a3a)); calRing.position.set(.4,1.73,-3.96); room.add(calRing);
bx(room,1.6,2.4,.8,0x7a5a42,-2.6,1.2,-3.6); // wardrobe
bx(room,.9,.95,3.6,0xe8e4dc,-4.6,.48,-2); bx(room,.95,.06,3.65,0x6a6e78,-4.6,.97,-2); bx(room,.4,.5,.4,0x2a2c32,-4.6,1.25,-3.2); const mugR=mug.clone(); mugR.position.set(-4.4,1.1,-2.6); room.add(mugR);
const sofa=new THREE.Group(); sofa.position.set(.8,0,2.6); sofa.rotation.y=-Math.PI/2; room.add(sofa); bx(sofa,3,.5,1.1,0x5a7a9a,0,.4,0); bx(sofa,3,.8,.3,0x5a7a9a,0,.85,-.45); for(const s of [-1,1]) bx(sofa,.3,.7,1.1,0x5a7a9a,s*1.45,.6,0);
bx(room,1.6,.5,.5,0x4a3a2a,-3.8,.25,2.6); const tv=bx(room,.08,.9,1.5,glowM(0x1a1c22),-3.8,1.1,2.6); const tvL=new THREE.PointLight(0x8fb8ff,0,6); tvL.position.set(-3.2,1.2,2.6); room.add(tvL);
const doorP=new THREE.Group(); doorP.position.set(3.94,0,4.02); room.add(doorP); bx(doorP,1.02,2.12,.08,0x6b4a33,-.51,1.06,0); bx(doorP,.08,.06,.14,0xc8b070,-.88,1.05,-.08);
const rug=bx(room,3,.02,2,0xa8604a,0,.01,0); rug.castShadow=false;
const winLight=new THREE.DirectionalLight(0xfff0d0,1.6); winLight.castShadow=true; winLight.shadow.mapSize.set(1024,1024); Object.assign(winLight.shadow.camera,{left:-8,right:8,top:8,bottom:-8}); winLight.position.set(12,6,1); winLight.target.position.set(0,0,-1); room.add(winLight); room.add(winLight.target);
const fillR=new THREE.PointLight(0xffe0c0,5,14); fillR.position.set(0,2.9,0); room.add(fillR);
// ======================= STREET (intersection) + alley
const town=new THREE.Group(); sc.add(town);
bx(town,600,.04,600,0x6fae4f,0,-.04,0).castShadow=false; for(const r of [0,1]){ const m=bx(town,r?10:600,.05,r?600:10,0x4a4c55,0,.01,0); m.castShadow=false; }
for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) bx(town,40,.2,40,0xcfcbc2,sx*25,.1,sz*25);
const zebra=(x,z,alongX)=>{ for(let i=0;i<6;i++){ const m=bx(town,alongX?.6:4,.02,alongX?4:.6,0xf2efe6,x+(alongX?(i-2.5)*1.4:0),.05,z+(alongX?0:(i-2.5)*1.4)); m.castShadow=false; } };
zebra(6.6,0,false); zebra(-6.6,0,false); zebra(0,6.6,true); zebra(0,-6.6,true);
const TLs=[[-6.2,-6.2,Math.PI*.75],[6.2,-6.2,-Math.PI*.75],[-6.2,6.2,Math.PI*.25],[6.2,6.2,-Math.PI*.25]].map(([x,z,r],i)=>{ const g=trafficLight(i===3?1:i%2?0:2); g.position.set(x,.2,z); g.rotation.y=r; town.add(g); return g; });
const broken=TLs[3]; const brokenLamps=broken.children.slice(2,5);
const pal=[0xf6b172,0x7ec4bc,0xf0a79d,0xb8a2e6,0xa9b4d8,0xeaa985];
[[-17,-12,0],[17,-12,0],[-29,-12,0],[29,-12,0]].forEach(([x,z],i)=>{ const s=shop(10,pal[i],[0xd64f4f,0x3f78c4,0x4fa28f,0xefc14d][i]); s.position.set(x,.2,z); town.add(s); });
const myB=new THREE.Group(); myB.position.set(-16,.2,15); myB.rotation.y=Math.PI; town.add(myB); bx(myB,14,13,10,0xe8b49a,0,6.5,0); for(let r=0;r<3;r++) for(let c=0;c<4;c++) bx(myB,1.6,1.4,.1,glowM(0xcfe4f8),-4.8+c*3.2,2.6+r*3.8,5.03); bx(myB,1.6,2.4,.1,0x6b4a33,0,1.2,5.05);
[[16,15,Math.PI,0],[29,15,Math.PI,1],[-30,15,Math.PI,2]].forEach(([x,z,r,i])=>{ const h=house(pal[i+3],[0x9a4f3a,0x4b5a78,0x6b4a3a][i]); h.position.set(x,.2,z); h.rotation.y=r; town.add(h); });
for(let i=0;i<12;i++){ const s=i%2?1:-1, t=roundTree(R,[flat(0x2c7f3d),flat(0x3f9a48)],flat(0x6b4a33),.8); t.position.set(-60+i*11+(Math.abs(-60+i*11)<14?28:0),.2,s*7.4); town.add(t); }
for(const [x,z] of [[-12,-7.2],[12,7.2],[24,-7.2],[-24,7.2]]){ const l=lamp(flat(0x2a2c32),flat(0xf2e9c8)); l.position.set(x,.2,z); town.add(l); }
const bn=bench(); bn.position.set(-10,.2,-8.4); town.add(bn);
for(let i=0;i<12;i++){ const t=tower(R,(i%6-2.5)*50,-120-Math.floor(i/6)*40,16,20+R()*40,16,pal[i%6]); town.add(t); }
for(let i=0;i<16;i++){ const h=house(pal[i%6],[0x9a4f3a,0x4b5a78,0x6b4a3a][i%3]); const a=i/16*6.283; h.position.set(Math.cos(a)*(60+i%3*14),0,Math.sin(a)*(55+i%2*16)+(Math.sin(a)<0?-10:20)); h.rotation.y=-a+Math.PI/2; town.add(h); }
// traffic & people
const tcars=[...Array(6)].map((_,i)=>{ const c=car([0x3f78c4,0xefc14d,0x4fa28f,0xf2efe6,0x8a5ac8,0x6a6e78][i]); c.userData={ax:i%2,dir:i<3?1:-1,o:i*31}; town.add(c); return c; });
const redCar=car(0xd64f4f); town.add(redCar);
const walkers=[...Array(10)].map((_,i)=>{ const m=i%2?woman({shirt:pal[i%6]}):person({shirt:pal[(i+2)%6],pants:0x394a6e}); m.userData.q={side:i%2?1:-1,ax:i%4<2,o:i*13,dir:i%3?1:-1}; town.add(m); return m; });
const smoke=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshLambertMaterial({color:0x8a8a8e,transparent:true,opacity:.7,depthWrite:false}),24); smoke.frustumCulled=false; town.add(smoke);
const alley=new THREE.Group(); alley.position.set(120,0,0); town.add(alley); for(const s of [-1,1]) bx(alley,1,9,60,[0xa8604a,0x8a7a68][s>0?1:0],s*3,4.5,0); bx(alley,5,.06,60,0x5a5a60,0,.03,0); for(let i=0;i<5;i++){ bx(alley,.9,1.1,.7,0x3f6a4a,(i%2?1:-1)*2,.55,-20+i*9); bx(alley,.06,.06,5.2,0x2a2c32,0,6+i*.5,-18+i*9).rotation.y=Math.PI/2; }
// ======================= timeline: one shot per narration line, some with inner cuts
const SH=LN.map((l,i)=>[i?l.t-.12:0,i<LN.length-1?LN[i+1].t-.12:EV.black]); SH.push([EV.black,DUR]); window.SHOTS=SH; window.DURATION=DUR;
const P=(a,b,c,d,u)=>{ cam.position.lerpVectors(V(...a),V(...b),u); cam.lookAt(V(...c).lerp(V(...(d||c)),u)); };
const reset=()=>{ hero.visible=true; hero.position.set(0,0,0); hero.rotation.set(0,0,0); hero.userData.pose(0,0); [0,3,4,5,6].forEach(i=>H(i).rotation.set(0,0,0)); H(1).rotation.set(0,0,0); if(mug.parent) mug.parent.remove(mug); beard.visible=false; worry(hero,0); pedW.visible=false; redCar.visible=false; };
const holdMug=()=>{ H(6).rotation.x=-1.9; H(6).add(mug); mug.position.set(0,-.72,.1); };
const clockShot=(u,a,b)=>P([1.45+.25,.9,-2.55+a],[1.45+.2,.86,-2.55+b],[1.45,.77,-3.45],[1.45,.77,-3.45],u);
const dayLight=(mode)=>{ // 'day' | 'night' | 'grey'
 const d=mode==='day', n=mode==='night'; sky.top.value.set(d?0x7f9ad8:n?0x0c1230:0x8a94a8); sky.low.value.set(d?0xf2d8c0:n?0x26305a:0xc8c8c8); sc.fog.color.set(d?0xf2d8c0:n?0x1a2040:0xbcbcc0); hemi.intensity=d?1.6:n?.35:1.2; hemi.color.set(n?0x6a7ab8:0xdfe8ff); sunL.intensity=d?1.6:n?.15:.5; sunL.color.set(n?0x8a9ad8:0xffe8c8); sun.visible=d; winLight.intensity=d?1.6:n?.25:.6; winLight.color.set(n?0x6a7ab8:0xfff0d0); winM.color.set(d?0xcfe4f8:n?0x1a2448:0xb8bcc4); fillR.intensity=d?4:n?.6:3; };
let gl=[]; const glitchAt=t=>{ const G=[EV.reset1,EV.reset2,EV.midnight1-.05,...EV.gone,EV.world+LN[15].d*.7]; const s=LN[14].t; for(let j=0;j<9;j++) G.push(s+j*(LN[15].t-s)/9); let a=0; for(const g of G){ const d=t-g; if(d>=0&&d<.38) a=Math.max(a,1-d/.38); } return a; };
const hash=n=>{ const x=Math.sin(n*127.1)*43758.5453; return x-Math.floor(x); };
const glDiv=$('gl'); for(let i=0;i<9;i++) glDiv.appendChild(document.createElement('i'));
window.renderAt=t=>{ const k=SH.findIndex(s=>t<s[1])<0?SH.length-1:SH.findIndex(s=>t<s[1]), u=(t-SH[k][0])/(SH[k][1]-SH[k][0]), su=ss(0,1,u);
 reset(); let set='room', light='day'; cam.fov=50; cam.rotation.z=0;
 // clock text
 let ckTxt='07:00', ckSub='TUE 14 NOV', ckCol='#ff3b3b';
 // photo state
 const goneN=EV.gone.filter(g=>t>=g).length, order=[5,0,4,1,3], alive=[0,1,2,3,4,5].filter(i=>!order.slice(0,goneN).includes(i)); const ghostI=goneN>0?order[goneN-1]:-1, gamt=goneN>0?Math.max(0,1-(t-EV.gone[goneN-1])/.5):0, meF=t<EV.fade?0:ss(EV.fade,EV.fade+LN[25].d+.3,t);
 drawPhoto(alive,ghostI,gamt,meF);
 // street actors default
 const crashT=(k===9?EV.crash+ (t>LN[9].t?0:0):EV.crash); let street={cars:true,people:true,crash:-1};
 switch(k){
 case 0: ckTxt=t<1.05?'06:59':'07:00'; clockShot(su,1.0,1.45); cam.fov=40; break;
 case 1: case 7: case 13: { hero.userData.sit(); hero.position.set(3,-.06,-3.05); const sitU=ss(.05,.5,u); H(0).rotation.x=lg(-1.2,0,sitU); H(1).rotation.x=lg(-.3,0,sitU); H(1).rotation.y=lg(0,-.5,ss(.5,.8,u)); P([-1.6,2.1,2.4],[-1.2,2,1.8],[2.8,.9,-2.6],[2.8,.95,-2.7],su); if(k===13) worry(hero,.5); if(k===7) worry(hero,ss(.4,.8,u)*.6); break; }
 case 2: if(u<.35){ hero.position.set(-2.6,0,-2.4); hero.rotation.y=Math.PI; H(5).rotation.x=-2.6*Math.abs(Math.sin(t*3)); P([.4,1.9,1.4],[0,1.85,1],[-2.6,1.3,-2.6],[-2.6,1.3,-2.8],ss(0,1,u/.35)); } else if(u<.7){ hero.position.set(-3.8,0,-2.6); hero.rotation.y=Math.PI/2; holdMug(); H(1).rotation.x=-.25; P([-1.2,1.65,-1.1],[-1.5,1.7,-1.4],[-3.8,1.55,-2.6],[-3.8,1.6,-2.6],ss(0,1,(u-.35)/.35)); } else { const v=(u-.7)/.3, op=ss(.1,.36,v), w=ss(.36,1,v); doorP.rotation.y=-1.5*op; if(v<.3){ hero.position.set(3.2,0,lg(1.6,2.7,ss(0,.3,v))); hero.rotation.y=0; hero.userData.pose(t*6.5,.5*(1-ss(.2,.3,v))); H(5).rotation.x=-1.1*ss(.08,.16,v)*(1-ss(.34,.42,v)); } else { hero.position.set(3.2,0,lg(2.7,6.6,w)); hero.rotation.y=0; hero.userData.pose(t*6.5,.5); } P([1.4,1.85,-.9],[1.6,1.85,-.5],[3.4,1.25,3.6],[3.4,1.25,4],ss(0,1,v)); } break;
 case 3: set='town'; hero.position.set(-8.3,.2,lg(18,10,su)); hero.rotation.y=Math.PI; hero.userData.pose(t*6.5,.5); P([-7.2,1.8,6],[-7.4,1.8,4.5],[-8.3,1.6,14],[-8.3,1.6,10],su); break;
 case 4: set='town'; street.crash=0; hero.position.set(-8,.2,-8); hero.rotation.y=Math.PI*.8; P([-30,26,-30],[-24,20,-26],[2,0,2],[3,0,3],su); break;
 case 5: set='town'; street.crash=0; cam.fov=36; if(u<.33) P([10,.7,2.4],[9.5,.75,2.4],[0,.8,2.5],[0,.8,2.5],ss(0,1,u/.33)); else if(u<.66) P([4.6,1.4,-5.8],[4.8,1.45,-5.4],[6.6,1.2,0],[6.6,1.2,0],ss(0,1,(u-.33)/.33)); else P([3.2,6.3,9.4],[3.5,6.35,9.1],[6.2,6.5,6.2],[6.2,6.6,6.2],ss(0,1,(u-.66)/.34)); break;
 case 6: set='town'; street.crash=0; hero.position.set(-8.5,.2,-5.4); hero.rotation.y=Math.PI*.3; worry(hero,ss(0,.5,u)); street.people=false; P([-5.6,1.9,-2.4],[-6.6,1.85,-3.4],[-8.5,1.75,-5.4],[-8.5,1.85,-5.4],su); break;
 case 8: P([.4,1.75,-2.6],[.4,1.75,-2.95],[.4,1.8,-3.98],[.4,1.75,-3.98],su); hero.visible=false; break;
 case 9: if(u<.33){ hero.userData.sit(); hero.position.set(3,-.06,-3.05); H(6).rotation.x=-1.2; P([1.4,1.65,-.9],[1.6,1.6,-1.3],[3,1.25,-3],[3,1.25,-3],ss(0,1,u/.33)); } else if(u<.66){ hero.position.set(-3.8,0,-2.6); hero.rotation.y=Math.PI/2; holdMug(); H(1).rotation.x=-.25; P([-1.2,1.65,-1.1],[-1.5,1.7,-1.4],[-3.8,1.55,-2.6],[-3.8,1.6,-2.6],ss(0,1,(u-.33)/.33)); } else { set='town'; street.crash=1; P([-26,22,-28],[-22,18,-25],[3,0,3],[4,0,4],ss(0,1,(u-.66)/.34)); hero.position.set(-8,.2,-8); } break;
 case 10: { hero.position.set(lg(-2,2,.5-.5*Math.cos(u*Math.PI*2.4)),0,.4); hero.rotation.y=Math.sin(u*Math.PI*2.4)>0?Math.PI/2:-Math.PI/2; hero.userData.pose(t*6,.45); worry(hero,.7); P([0,2.6,3.6],[0,2.5,3.3],[0,1.2,0],[0,1.2,0],su); break; }
 case 11: if(u<.33){ hero.userData.sit(); hero.position.set(.55,.0,2.6); hero.rotation.y=-Math.PI/2; worry(hero,.5); tvL.intensity=3; tv.material.color.set(0x7fa8e8); ckTxt='14:20'; P([-2.7,1.75,3.6],[-2.4,1.75,3.5],[.55,1.15,2.6],[.55,1.15,2.6],ss(0,1,u/.33)); } else if(u<.66){ set='town'; street.people=false; const w=(u-.33)/.33; hero.position.set(120,0,lg(-6,-14,w)); hero.rotation.y=Math.PI; hero.userData.pose(t*6.5,.5); P([120.6,1.8,2],[120.5,1.8,-4],[120,1.4,-12],[120,1.4,-20],w); } else { light='night'; hero.userData.sit(); hero.position.set(3,-.06,-3.05); worry(hero,.8); ckTxt='23:58'; P([.6,2.1,1.2],[.9,2,.6],[3,1.3,-3],[3,1.3,-3],ss(0,1,(u-.66)/.34)); } break;
 case 12: { light='night'; const sec=Math.min(59,50+Math.floor((t-SH[k][0])/(EV.midnight1-SH[k][0])*10)); ckTxt=t<EV.midnight1?`23:59:${sec}`:'00:00:00'; clockShot(su,.7,.55); cam.fov=40; hero.visible=false; break; }
 case 14: { hero.userData.sit(); hero.position.set(3.2,-.06,-1.2); hero.rotation.y=-Math.PI/2; const days=Math.floor(lg(3,347,ss(0,1,(t-LN[14].t)/(LN[15].t+LN[15].d*.7-LN[14].t)))); beard.visible=true; beard.scale.y=lg(.3,1.2,u); worry(hero,.6); const night=Math.floor((t-LN[14].t)/((LN[15].t-LN[14].t)/9))%2===1; light=night?'night':'day'; ckTxt=night?'00:00':'07:00'; P([.6,1.8,1.5],[1.6,1.65,.4],[3.2,1.4,-1.2],[3.2,1.45,-1.2],su); break; }
 case 15: set='town'; light=u<.7?'night':'day'; street.people=false; P([-50,60,50],[-40,52,40],[0,0,0],[0,0,0],su); hero.visible=false; break;
 case 16: light='night'; hero.visible=false; P([1,1.7,1.5],[1.2,1.75,1],[4.6,1.9,.4],[3,2.2,-3.9],su); break;
 case 17: light='night'; hero.visible=false; P([2.4,1.9,-1.2],[2.6,2,-1.8],[3,2.25,-3.97],[3,2.25,-3.97],su); fillR.intensity=1.6; break;
 case 18: case 19: case 20: case 24: case 25: { light='night'; hero.visible=false; const z0={18:-2.8,19:-3.05,20:-3.4,24:-3.15,25:-3.0}[k], z1={18:-2.95,19:-3.2,20:-3.62,24:-3.25,25:-3.6}[k], x=k===20?3-.43*1.04+.52*1.04*.86-.43:3; P([lg(3,2.95,0),2.25,z0],[k===20?2.94:3,2.25,z1],[k===20?2.94:3,2.25,-3.97],[k===20?2.94:3,2.22,-3.97],su); fillR.intensity=1.6; break; }
 case 21: light='night'; hero.position.set(1.2,0,-2.4); hero.rotation.y=2.22; worry(hero,.9); H(1).rotation.x=-.2; P([2.75,1.9,-3.75],[2.6,1.88,-3.6],[1.2,1.75,-2.4],[1.2,1.78,-2.4],su); fillR.intensity=1.6; break;
 case 22: set='town'; light='grey'; street.cars=false; street.people=false; hero.visible=false; P([-14,11,8],[-13,10.5,6],[2,0,-2],[4,0,-4],su); break;
 case 23: light='night'; ckTxt='23:59'; ckCol='#ff2020'; clockShot(su,.6,.42); cam.fov=36; hero.visible=false; break;
 case 26: case 27: case 28: case 29: { light='night'; hero.visible=false; const s0=LN[26].t-.12; let secs=57+Math.floor((t-s0)/1.0); let txt; if(t<EV.midnight2) txt=`23:59:${Math.min(59,secs)}`; else if(t<EV.keeps) txt='00:00:00'; else txt='00:00:'+String(1+Math.floor((t-EV.keeps)/1.0)).padStart(2,'0'); ckTxt=txt; ckSub=t<EV.midnight2?'TUE 14 NOV':t<EV.keeps?'TUE 14 NOV':'WED 15 NOV'; ckCol=t>=EV.keeps?'#7fd8ff':'#ff3b3b'; const total=(t-s0)/(EV.black-s0); P([1.45+.18,.86,-2.55+.75-total*.3],[1.45+.18,.86,-2.55+.75-total*.3],[1.45,.77,-3.45],[1.45,.77,-3.45],0); cam.fov=36; break; }
 default: hero.visible=false; set='none'; }
 drawClock(ckTxt,ckSub,ckCol);
 // world toggles
 room.visible=set==='room'; town.visible=set==='town'; dayLight(light); if(set==='room'){ sunL.intensity=0; sc.fog.near=200; sc.fog.far=600; } else { sc.fog.near=60; sc.fog.far=320; } sunL.position.set(-40,60,30); sunL.target.position.set(0,0,0);
 if(!(k===11&&u<.33)){ tvL.intensity=0; tv.material.color.set(0x1a1c22); }
 // street simulation
 if(set==='town'){ const ct=k===9?crash2():EV.crash, dt=t-ct; brokenLamps.forEach((m,i)=>m.material.color.set(i===1&&(Math.sin(t*23)>.1||Math.sin(t*7.7)>.6)?0xe9b94c:0x34363b));
  redCar.visible=street.crash>=0; pedW.visible=street.crash>=0;
  if(street.crash>=0){ const slow=k===5?.45:1; const rt=dt; let x,z,ry=Math.PI/2; if(rt<-1.0){ x=4+(rt+1.0)*18*(k===5?.5:1); z=2.5; } else if(rt<0){ const q=rt+1; x=4+q*3.4; z=2.5+q*q*4.1; ry=Math.PI/2-q*.9; } else { x=7.4; z=6.6; ry=Math.PI/2-.9; } redCar.position.set(x,0,z); redCar.rotation.set(0,ry,rt>0?.04:0);
   broken.rotation.z=dt>0?-.45*ss(0,.4,dt):0; broken.rotation.x=dt>0?.3*ss(0,.4,dt):0;
   const pq=ss(-1.4,-.4,dt); pedW.position.set(6.6,.0,lg(-1.6,1.4,ss(-4,-1.2,dt))-1.8*pq); pedW.rotation.set(-.9*ss(-.6,-.1,dt),Math.PI*0,0); pedW.userData.pose(dt<-1.2?t*6:0,dt<-1.2?.5:0); if(dt>-.6){ pedW.position.y=-.25*ss(-.6,-.1,dt); } worry(pedW,ss(-1.6,-1,dt));
   for(let i=0;i<24;i++){ const a=dt>0?((dt*.25+i/24)%1):0; D.position.set(7.4+Math.sin(i)*.6+a*2,1+a*6,6.6+Math.cos(i)*.6); D.scale.setScalar(dt>0?(.4+a*1.6)*(1-a):0.0001); D.updateMatrix(); smoke.setMatrixAt(i,D.matrix); } smoke.instanceMatrix.needsUpdate=true; }
  else { broken.rotation.set(0,broken.rotation.y,0); for(let i=0;i<24;i++){ D.scale.setScalar(.0001); D.updateMatrix(); smoke.setMatrixAt(i,D.matrix); } smoke.instanceMatrix.needsUpdate=true; }
  tcars.forEach((c,i)=>{ const q=c.userData; c.visible=street.cars&&!(street.crash>=0&&q.ax===0&&q.dir>0); let p=((q.o+t*9*q.dir)%240+240)%240-120; if(k===15&&u>=.7) p=((q.o+(t-SH[k][0]-1.2*(SH[k][1]-SH[k][0]))*9*q.dir)%240+240)%240-120; if(q.ax===0) c.position.set(p,0,q.dir>0?2.5:-2.5), c.rotation.y=q.dir>0?Math.PI/2:-Math.PI/2; else c.position.set(q.dir>0?-2.5:2.5,0,p), c.rotation.y=q.dir>0?0:Math.PI; if(Math.abs(c.position.x)<14&&Math.abs(c.position.z)<14&&street.crash>=0) c.visible=false; });
  walkers.forEach((m,i)=>{ const q=m.userData.q; m.visible=street.people; const p=((q.o+t*1.3*q.dir)%80+80)%80-40; if(q.ax) m.position.set(p,.2,q.side*8.5), m.rotation.y=q.dir>0?Math.PI/2:-Math.PI/2; else m.position.set(q.side*8.5,.2,p), m.rotation.y=q.dir>0?0:Math.PI; m.userData.pose(t*6.5+i,.5); if(m.position.distanceTo(cam.position)<3) m.visible=false; }); }
 renderer.render(sc,cam);
 // HUD
 let day=t<EV.reset1?1:t<EV.reset2?2:3; if(t>=LN[14].t) day=Math.floor(lg(3,347,ss(0,1,(t-LN[14].t)/(LN[15].t+LN[15].d*.7-LN[14].t))))+goneN; const sceneI=LN[Math.min(k,LN.length-1)].scene;
 $('hud').style.opacity=t>=LN[2].t&&t<LN[26].t-.12?1:0; $('n').textContent=day; $('u').textContent=''; $('stage').textContent=TL.scenes[sceneI]; $('r').innerHTML=''; $('el').textContent=''; $('wt').textContent=''; $('n').style.color=t>=LN[19].t?'#ff6a5a':'#ffffff';
 const nT=LN[9].t; const nv=t>=nT&&t<nT+LN[9].d*.33?ss(0,.2,t-nT)*(1-ss(nT+LN[9].d*.33-.2,nT+LN[9].d*.33,t)):0; $('note').style.opacity=nv; $('note').style.transform=`translateY(${(1-ss(0,.2,t-nT))*-50}px)`; $('ntx').textContent='Good morning! It’s Tuesday, 14 November.'; $('note').className=''; document.querySelector('#note .ic').textContent='☀'; document.querySelector('#note .ap span').textContent='CALENDAR';
 let txt=''; for(const l of LN){ if(t>=l.t&&t<l.t+l.d+.12){ const c=[]; let q=[]; for(const x of l.text.split(' ')){ q.push(x); if(q.length>=6||(/[.,?:]$/.test(x)&&q.length>=2)){ c.push(q.join(' ')); q=[]; } } if(q.length)c.push(q.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const z of c){ acc+=z.length; if(p<=acc){ txt=z; break; } } } } $('cap').textContent=t<LN[1].t?'':txt;
 $('title').style.opacity=(1-ss(LN[1].t+LN[1].d-.3,LN[1].t+LN[1].d+.1,t))*ss(0,.3,t); $('peep').style.opacity=0; $('blk').style.opacity=t>=EV.black?1:0;
 // glitch overlay
 const ga=glitchAt(t), fr=Math.floor(t*30); $('c').style.transform=ga>0?`translateX(${(hash(fr)-.5)*60*ga}px)`:''; $('c').style.filter=ga>0?`hue-rotate(${(hash(fr+3)*180)|0}deg) saturate(${1+ga*2}) contrast(${1+ga*.5})`:'';
 glDiv.style.opacity=ga; [...glDiv.children].forEach((b,i)=>{ b.style.top=(hash(fr*9+i)*100)+'%'; b.style.height=(4+hash(fr*7+i)*60)+'px'; b.style.background=['#00ffff','#ff00ff','#ffffff'][i%3]; b.style.opacity=.15+hash(fr+i*3)*.4; b.style.transform=`translateX(${(hash(fr+i)-.5)*120}px)`; });
 const slowmo=k===5?.35:0; $('fla').style.background=ga>.5?'#ffffff':'#000'; $('fla').style.opacity=Math.max(ga>.5?(ga-.5)*.6:0,(t>EV.crash&&t<EV.crash+.15)?.8:0,slowmo*0); $('fade').style.opacity=0; };
const crash2=()=>LN[9].t+LN[9].d*.66+.7;
window.renderAt(0); window.ready=true;
