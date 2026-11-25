import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, flat, shadow, ss, person, woman, skyDome, textSign, car, lamp } from './kit.js';
const TL=await (await fetch('/npc_timeline.json')).json(), SEG=TL.segments, R=rng(4127), $=id=>document.getElementById(id), DUR=TL.duration, NS=SEG.length;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(58,1080/1920,.05,5000), D=new THREE.Object3D(), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.add(cam); sc.fog=new THREE.Fog(0xf8e0c0,120,600); const sky=skyDome(sc,0x4a9ae8,0xf8e0c0);
const hemi=new THREE.HemisphereLight(0xf0f4ff,0x6a5a4a,1.5); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xfff0d8,1.8); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:400}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.06; sc.add(sunL); sc.add(sunL.target);
const composer=new EffectComposer(renderer); composer.setSize(1080,1920); composer.addPass(new RenderPass(sc,cam)); const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.3,.4,.88); composer.addPass(bloom); composer.addPass(new OutputPass());
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=(c,o={})=>new THREE.MeshBasicMaterial({color:c,...o});
// DOM extras: wanted stars + big centre text
const mk=(id,css)=>{ const d=document.createElement('div'); d.id=id; d.style.cssText=css; document.body.appendChild(d); return d; };
const stars=mk('stars','position:absolute;top:150px;right:60px;font:700 78px Jost,sans-serif;color:#fff;letter-spacing:6px;text-shadow:0 3px 10px rgba(0,0,0,.6);opacity:0');
const big=mk('big','position:absolute;top:760px;left:0;width:1080px;text-align:center;font:600 92px Jost,sans-serif;color:#fff;letter-spacing:10px;text-shadow:0 4px 18px rgba(0,0,0,.7);opacity:0');
const loopC=mk('loopc','position:absolute;top:150px;right:60px;font:600 46px Jost,sans-serif;color:#fff;letter-spacing:4px;text-shadow:0 3px 10px rgba(0,0,0,.6);opacity:0');
// ---------- characters
const face=p=>{ const h=p.children[1], dk=flat(0x1a1210), f=(w,hh,x,y,m=dk)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.02),m); b.position.set(x,y,.18); h.add(b); return b; }; const br=[];
 for(const s of [-1,1]){ f(.065,.055,s*.085,.035); const w=f(.022,.02,s*.085+.012,.045,flat(0xffffff)); w.position.z=.192; br.push(f(.09,.025,s*.085,.095)); } p.userData.brows=br; p.userData.mouth=f(.09,.025,0,-.085,flat(0x6a3a30)); return p; };
const mood=(p,m)=>{ const rz={flat:0,sad:.4,happy:-.15,shock:-.1,calm:-.05}[m], my={flat:1,sad:1,happy:2.6,shock:3.2,calm:1.6}[m], mx={flat:1,sad:.7,happy:1.3,shock:.6,calm:1.2}[m]; p.userData.brows.forEach((q,i)=>{ q.rotation.z=(i?-1:1)*rz; }); p.userData.mouth.scale.set(mx,my,1); };
const arms=(p,a,b=a)=>{ p.children[5].rotation.set(a,0,0); p.children[6].rotation.set(b,0,0); };
const reset=p=>{ p.visible=true; p.rotation.set(0,0,0); p.userData.pose(0,0); arms(p,0); p.children[1].rotation.set(0,0,0); p.children[0].position.y=1.25; mood(p,'calm'); };
// first-person hands
const hands=new THREE.Group(); cam.add(hands); hands.scale.setScalar(.45); hands.position.set(0,-.1,-.2); const hL=new THREE.Group(), hR=new THREE.Group(); hands.add(hL,hR);
for(const [g,s] of [[hL,-1],[hR,1]]){ bx(g,.12,.12,.4,0x4fa28f,0,0,.05); bx(g,.1,.1,.14,0xd9a27a,0,0,-.21); g.position.set(s*.16,-.27,-.62); g.rotation.set(.35,s*-.12,0); }
// player (sunglasses, tank top)
const player=face(person({shirt:0xf6f6f2,pants:0x3a5a8a,hair:0x1a1a1a,skin:0xc8906a})); sc.add(player); bx(player.children[1],.36,.07,.04,0x111111,0,.04,.2);
const vendor=face(person({shirt:0xd64f4f,pants:0x2a2f3a,hair:0x6a3a20,skin:0xe8c09a})); sc.add(vendor); bx(vendor.children[1],.4,.1,.4,0xffffff,0,.24,0);
const NP=12, peds=[...Array(NP)].map((_,i)=>{ const p=face((i%3===2?woman:person)({shirt:[0x4fa28f,0xefc14d,0xb8a2e6,0xf0a79d,0x7ec4bc,0x5a6a7a][i%6],pants:[0x2a2f3a,0x3a4a6a,0x5a4a3a][i%3],skin:[0xd9a27a,0x8a5a3a,0xe8c09a,0xb8805a][i%4],hair:[0x2a1a12,0x6a3a20,0xc8a060][i%3]})); sc.add(p); return {p,x0:-30+R()*60,z:i%2?-5.6:-7.2,dir:i%2?1:-1}; });
// ---------- city
const city=new THREE.Group(); sc.add(city); const pops=[];
bx(city,2000,.04,2000,0x8ab85a,0,-.05,0).castShadow=false;
bx(city,240,.06,10,0x4a4c52,0,0,0).castShadow=false; for(let i=0;i<40;i++) bx(city,2.4,.02,.2,0xf2d060,-110+i*6,.04,0).castShadow=false;
bx(city,10,.065,120,0x4a4c52,16,.002,0).castShadow=false;
const paveM=flat(0xd8d0c4); bx(city,240,.2,4,paveM,0,.1,-6.5); bx(city,240,.2,4,paveM,0,.1,6.5);
bx(city,240,.05,40,0xf0dca0,0,.01,30).castShadow=false; const sea=new THREE.Mesh(new THREE.PlaneGeometry(800,300),new THREE.MeshLambertMaterial({color:0x3fa8d8})); sea.rotation.x=-Math.PI/2; sea.position.set(0,.03,200); city.add(sea);
const pal=[0xf6b172,0xf2e6c8,0xa9b4d8,0xeaa985,0x7ec4bc,0xf0a79d,0xe8d8b8,0xb8a2e6];
const signs=['TACOS','HOT DOGS','PAWN','GYM','DONUTS','MOTEL','ARCADE','BURGERS','LAUNDRY','PIZZA','TATTOO','GAS'];
for(let i=0;i<14;i++){ const x=-56+i*8.6; if(Math.abs(x-16)<6) continue; const w=7.6, h=5+((i*7)%4)*2.2, g=new THREE.Group(); g.position.set(x,0,-12.5); city.add(g); bx(g,w,h,8,pal[i%8],0,h/2,0); bx(g,w-1,2.4,.1,new THREE.MeshLambertMaterial({color:0x9fd0e8}),0,1.4,4.02); bx(g,w,.25,1.2,[0xd64f4f,0x3f78c4,0x4f8a3a,0xefc14d][i%4],0,2.9,4.5); const s=textSign(signs[i%12],w*.7,.8,['#d64f4f','#2a2c32','#3f78c4','#4f8a3a'][i%4],'#ffffff'); s.position.set(0,h-.9,4.06); g.add(s); pops.push(g); }
for(let i=0;i<22;i++){ const x=-90+i*9, z=-26-R()*16, h=18+R()*40, w=6+R()*5, g=new THREE.Group(); g.position.set(x,0,z); city.add(g); bx(g,w,h,w,[0xe8e4dc,0xc8d4e0,0xf2e6c8,0xa8b8c8][i%4],0,h/2,0); for(let y=3;y<h-2;y+=3) bx(g,w+.05,.9,w+.05,new THREE.MeshLambertMaterial({color:0x7fa8c8}),0,y,0); pops.push(g); }
for(let i=0;i<12;i++){ const x=-50+i*9, h=4+R()*4, g=new THREE.Group(); g.position.set(x,0,12.5); city.add(g); bx(g,7.6,h,7,pal[(i+3)%8],0,h/2,0); pops.push(g); }
const palm=(x,z)=>{ const g=new THREE.Group(); g.position.set(x,0,z); city.add(g); let p=V(0,0,0); for(let i=0;i<7;i++){ const s=bx(g,.32-i*.02,1.1,.32-i*.02,0x9a7a52,p.x+i*.04,.55+i*1.05,0); } for(let i=0;i<7;i++){ const f=new THREE.Group(); f.position.set(.3,7.6,0); f.rotation.y=i/7*Math.PI*2; g.add(f); const l=bx(f,.5,.06,2.4,0x3f9a48,0,0,1.1); l.rotation.x=.45; } pops.push(g); return g; };
for(let i=0;i<10;i++) palm(-40+i*9,-4.9); for(let i=0;i<10;i++) palm(-36+i*9,4.9);
for(let i=0;i<8;i++){ const l=lamp(flat(0x2a2c32),glowM(0xffe2a0)); l.position.set(-34+i*10,.2,-4.8); city.add(l); }
// hot dog stand
const stand=new THREE.Group(); stand.position.set(9.6,.2,-7.4); city.add(stand); bx(stand,2.2,1,1.2,0xf2f2ee,0,.6,0); const umb=new THREE.Mesh(new THREE.ConeGeometry(1.6,.6,8),flat(0xd64f4f)); umb.position.y=2.5; stand.add(umb); bx(stand,.06,2,.06,0x9aa4b0,0,1.6,0); const hs=textSign('HOT DOGS',1.8,.4,'#efc14d','#d64f4f'); hs.position.set(0,1.25,.62); stand.add(hs);
// gas station
const gas=new THREE.Group(); gas.position.set(28,0,-14); city.add(gas); bx(gas,12,.4,8,0xf2f2ee,0,4.6,2); for(const x of [-4,4]) bx(gas,.4,4.4,.4,0xd8d8d0,x,2.2,2); bx(gas,12.2,.6,8.2,0xd64f4f,0,4.2,2);
// traffic, player car, fire truck, floating car
const tcars=[0x3f78c4,0xefc14d,0xf6f2ea,0x4fa28f,0x9a4f8a,0x2a2c32].map((c,i)=>{ const k=car(c); city.add(k); return {k,x:-60+i*22,z:i%2?2.4:-2.4,d:i%2?-1:1}; });
const pcar=car(0xff2a4a); city.add(pcar);
const truck=new THREE.Group(); city.add(truck); bx(truck,2.6,2.4,7.5,0xd62a2a,0,1.5,0); bx(truck,2.62,1,1.8,0x9fd0e8,0,2.2,3.2); bx(truck,.5,.3,6,0xd8d8d0,0,2.9,-.5); for(const z of [-2.6,2.4]) for(const s of [-1,1]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.4,12),flat(0x1a1a1e)); w.rotation.z=Math.PI/2; w.position.set(s*1.3,.55,z); truck.add(w); } const siren=bx(truck,1.4,.2,.4,glowM(0xff3a3a),0,2.8,2.5);
const fcar=car(0x9aa0a8); sc.add(fcar);
// explosions
const boomN=3, booms=[...Array(boomN)].map(()=>{ const g=new THREE.Group(); sc.add(g); const a=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),glowM(0xffa030,{transparent:true})); const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.7,1),glowM(0xfff0a0,{transparent:true})); g.add(a,b); return g; });
// edge-of-map void
const voidG=new THREE.Group(); sc.add(voidG); voidG.position.set(-400,0,0); const grid=new THREE.GridHelper(400,100,0x9a9aa4,0xb8b8c0); grid.position.y=.02; voidG.add(grid); bx(voidG,400,.04,400,0xc8c8cc,0,0,0).castShadow=false;
for(let i=0;i<6;i++){ const g=new THREE.Group(); g.position.set(40+i*6,0,-12-(i%2)*6); voidG.add(g); const w=new THREE.Mesh(new THREE.BoxGeometry(6,6+i*2,6),new THREE.MeshBasicMaterial({color:0x8a8a94,wireframe:true})); w.position.y=(6+i*2)/2; g.add(w); }
// speech bubbles (in front of camera)
const bub=(t,w=1.1)=>{ const s=textSign(t,w,.24,'#ffffff','#1a1a1e'); s.material.color.set(0xcfcfcf); s.material.depthTest=false; s.renderOrder=10; sc.add(s); return s; };
const lines=[bub('"Nice weather today."'),bub('"Hey! Watch it!"'),bub('"I\'m calling the cops!"')], newLine=bub('"Hey. Want a hot dog?"',1.25);
// ======================= timeline
const SH=[]; SEG.forEach((s,i)=>{ const a=i?s.start:0, b=i<NS-1?SEG[i+1].start:DUR; SH.push([a,b]); }); window.SHOTS=SH; window.DURATION=DUR;
const EYE=1.62, look=(p,tg,roll=0)=>{ cam.position.copy(p); cam.up.set(0,1,0); cam.lookAt(tg); if(roll) cam.rotateZ(roll); };
const LOOK={ sun:[0x4a9ae8,0xf8e0c0,[-120,140,120],0xfff0d8,1.8,1.5,0xf8e0c0,'saturate(1.15)'], gold:[0x5a8ae0,0xf8c890,[160,60,120],0xffd8a0,1.7,1.3,0xf0c8a0,'saturate(1.15)'], voidL:[0xb0b0b8,0xc8c8cc,[-120,140,120],0xffffff,.8,1.6,0xc8c8cc,'saturate(.3)'], hurt:[0x4a9ae8,0xf8e0c0,[-120,140,120],0xfff0d8,1.8,1.5,0xf8e0c0,'saturate(.2) contrast(1.1)'] };
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=NS-1; const T0=SH[k][0], u=(t-T0)/(SH[k][1]-T0), sub=(a,b)=>ss(0,1,(u-a)/(b-a));
 let lk='sun', walk=0, pop=1, pedMode=0, starN=0, bigT='', bigA=0, loopA=0, white=0, freeze=-1, glitch=0, handsOn=true, lineShow=-1, newOn=0, truckOn=false, boomOn=0, inVoid=false, pcarX=null;
 [player,vendor].forEach(reset); player.visible=false; vendor.visible=true; vendor.position.set(9.6,.2,-8.4); vendor.rotation.y=0;
 let tt=t; // simulation time (frozen in k6 end)
 switch(k){
 case 0: { pop=ss(.05,.35,u); white=1-ss(0,.12,u); const p=V(-2,EYE,-6.3); look(p,V(4,1.5,-4.4).lerp(V(14,1.1,1),ss(.55,.85,u))); pcarX=lg(-60,40,ss(.55,.95,u)); } break;
 case 1: { const p=V(9.2,EYE+.1,-2.2); look(p,V(9.6,1.75,-8.4)); mood(vendor,'calm'); vendor.rotation.y=-1.2; lineShow=u<.45?0:3; } break;
 case 2: { walk=1; loopA=1; const L=16, s=u*L*1.6; let x, dir; const seg=s%32; if(seg<16){ x=-6+seg; dir=1; } else { x=10-(seg-16); dir=-1; } const turn=ss(14.5,16,seg)*(seg<16?1:0)+ (seg>=16?1-ss(30.5,32,seg):0); const ang=lg(0,Math.PI,turn); const p=V(Math.min(x,8.6),EYE+Math.abs(Math.sin(t*6))*.04,-6.3); look(p,p.clone().add(V(Math.cos(ang),-.05,Math.sin(ang)*.0-.25))); } break;
 case 3: { pedMode=1; starN=Math.min(3,Math.floor(u*6)+1); truckOn=true; boomOn=1; const p=V(2,EYE,-5); look(p,V(-12,1.6,-4.6),Math.sin(t*14)*.01*boomOn); } break;
 case 4: { lk=u<.45?'hurt':'sun'; if(u<.45){ const q=sub(0,.45); handsOn=false; const p=V(lg(2,5,q),EYE+Math.sin(q*Math.PI)*3.5,lg(-6.4,-3,q)); look(p,p.clone().add(V(Math.cos(q*16),Math.sin(q*13)*.6,Math.sin(q*16))),q*9); pcarX=lg(-14,20,q*1.5); bigT='RESPAWNING'; bigA=ss(.4,.7,q); } else { const q=sub(.45,1); white=1-ss(0,.25,q); pop=ss(.05,.35,q); const p=V(-2,EYE,-6.3); look(p,V(4,1.5,-4.4)); } } break;
 case 5: { if(u<.5){ walk=1; const q=sub(0,.5); const x=lg(-10,-60,q); const p=V(x,EYE+Math.abs(Math.sin(t*6))*.04,-6.3); look(p,p.clone().add(V(-1,-.03,.05))); city.children.forEach(()=>{}); glitch=ss(.6,1,q)*.5; } else { lk='voidL'; inVoid=true; const q=sub(.5,1); walk=q<.6?1:0; const p=V(-400+lg(30,22,q),EYE,-6.3); look(p,V(-400+lg(0,-4,q),2.6,-6.3)); glitch=.3; } } break;
 case 6: { pcarX=12; const p=V(10.4,EYE,-6.1); player.visible=true; player.position.set(12.4,.2,-3.6); player.rotation.y=-2.4; mood(player,u>.55?'shock':'calm'); newOn=ss(.45,.55,u); freeze=u>.6?SH[6][0]+(SH[6][1]-SH[6][0])*.6:-1; if(freeze>0) tt=freeze; glitch=u>.6?.6:0; look(p,V(12.1,1.5,-3.8)); pedMode=2; } break;
 case 7: { pcarX=12; player.visible=true; player.position.set(12.4,.2,-3.6); player.rotation.y=-2.4; mood(player,'flat'); player.children[1].rotation.z=Math.sin(t*.6)*.1; pedMode=2; if(u<.5){ const q=sub(0,.5); const p=V(lg(10.4,11.2,q),EYE,lg(-6.1,-5.2,q)); look(p,V(12.4,1.75,-3.6)); } else { lk='gold'; handsOn=false; const q=sub(.5,1); look(V(lg(11,-10,q),lg(3,60,q),lg(-4,40,q)),V(10,1,-5)); } } break; }
 // ---- city pop-in
 pops.forEach((g,i)=>{ const d=Math.abs(g.position.x-(-2))/80; const s=ss(d*.6,d*.6+.4,pop); g.scale.set(1,Math.max(.001,s),1); g.visible=s>.002&&!inVoid; });
 city.visible=!inVoid; voidG.visible=inVoid; fcar.visible=inVoid; if(inVoid){ fcar.position.set(-400-6,2.6+Math.sin(t*1.3)*.3,-9); fcar.rotation.set(Math.sin(t*.5)*.3,t*.4,Math.sin(t*.7)*.2); }
 if(k===5&&u<.5){ const q=sub(0,.5); pops.forEach(g=>{ if(g.position.x<lg(-20,-70,q)+cam.position.x*0) {} if(g.position.x<-58+ (1-q)*0) g.visible=false; if(g.position.x<cam.position.x-25) g.visible=Math.sin(t*20+g.position.x)>0; }); }
 // ---- traffic
 tcars.forEach((c,i)=>{ const L=160; const x=((c.x+c.d*9*tt+80)%L+L)%L-80; c.k.position.set(x,0,c.z); c.k.rotation.y=c.d*Math.PI/2; });
 pcar.visible=pcarX!==null; if(pcarX!==null){ pcar.position.set(pcarX,0,k===4?-3.6:k>=6?-1.6:-2.4); pcar.rotation.y=Math.PI/2; if(k>=6){ pcar.position.set(13,0,-1.8); pcar.rotation.y=Math.PI/2; } }
 truck.visible=truckOn; if(truckOn){ truck.position.set(lg(-30,-6,ss(0,.7,u)),0,-6.6); truck.rotation.y=Math.PI/2; siren.material.color.set(Math.sin(t*14)>0?0xff3a3a:0x3a6aff); }
 booms.forEach((b,i)=>{ const st=.15+i*.25, f=(u-st)/.3; const on=boomOn&&f>0&&f<1; b.visible=on; if(on){ b.position.set(-16+i*4,1.5,i%2?1:-1.5); b.scale.setScalar(1+f*3); b.children.forEach(m=>m.material.opacity=1-f); } });
 // ---- pedestrians
 peds.forEach((q,i)=>{ const p=q.p; reset(p); const L=60; if(pedMode===1){ const x=((q.x0+9*tt)%L+L)%L-30; p.position.set(x,.2,q.z+(i%3)*.4); p.rotation.y=Math.PI/2; p.userData.pose(tt*12+i,.8); arms(p,-2.8+Math.sin(tt*20+i)*.5,-2.6+Math.cos(tt*18+i)*.5); mood(p,'shock'); }
  else { const x=((q.x0+q.dir*1.3*tt)%L+L)%L-30; p.position.set(x,.2,q.z); p.rotation.y=q.dir*Math.PI/2; p.userData.pose(tt*5+i,.35); mood(p,'calm'); if(pedMode===2&&freeze>0){ p.userData.pose(freeze*5+i,.35); } } p.visible=!inVoid&&p.position.distanceTo(V(cam.position.x,.2,cam.position.z))>(pedMode===1?3:1.6); });
 // ---- hands
 hands.visible=false; const bob=walk?Math.sin(tt*6):0; hL.position.y=-.27+bob*.025; hR.position.y=-.27-bob*.025; hL.rotation.x=.35+bob*.15; hR.rotation.x=.35-bob*.15; if(k===6&&u>.4){ hR.position.set(.14,-.2,-.62); hR.rotation.set(.9,-.2,0); } else hR.position.set(.16,hR.position.y,-.62);
 // ---- bubbles
 const fwd=V(0,0,-1).applyQuaternion(cam.quaternion), upv=V(0,1,0).applyQuaternion(cam.quaternion);
 lines.forEach((s,i)=>{ const on=(lineShow===i)||(lineShow===3); s.visible=on; if(on){ const yy=lineShow===3?(.5-i*.13):.48; s.position.copy(cam.position).add(fwd.clone().multiplyScalar(2.6)).add(upv.clone().multiplyScalar(yy*1.3)); s.quaternion.copy(cam.quaternion); s.scale.setScalar(lineShow===3?.85:1); } });
 newLine.visible=newOn>0; if(newOn){ newLine.position.copy(cam.position).add(fwd.clone().multiplyScalar(2.6)).add(upv.clone().multiplyScalar(.5)); newLine.quaternion.copy(cam.quaternion); newLine.scale.setScalar(newOn); }
 // ---- look
 const L_=LOOK[lk]; sky.top.value.set(L_[0]); sky.low.value.set(L_[1]); sc.fog.color.set(L_[6]); sc.fog.near=inVoid?10:120; sc.fog.far=inVoid?70:600; sunL.position.set(...L_[2]).add(cam.position); sunL.target.position.copy(cam.position); sunL.color.set(L_[3]); sunL.intensity=L_[4]; hemi.intensity=L_[5];
 const gl=glitch>0&&Math.sin(t*37)>.2-glitch; $('c').style.filter=L_[7]+(gl?` hue-rotate(${Math.round(Math.sin(t*91)*60)}deg) contrast(1.3)`:''); $('c').style.transform=gl?`translateX(${Math.round(Math.sin(t*53)*10)}px)`:'none';
 composer.render();
 // ---- HUD
 stars.textContent='★'.repeat(starN)+'☆'.repeat(starN?3-starN:0); stars.style.opacity=starN?1:0; big.textContent=bigT; big.style.opacity=bigA; loopC.textContent='LOOP #'+(400+Math.floor(Math.max(0,u)*2.2)); loopC.style.opacity=loopA;
 const seg=SEG[k]; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 const dip=k>0?1-ss(0,.45,t-SH[k][0]):0; $('fla').style.background=white>0?'#fff':'#000'; $('fla').style.opacity=Math.max(dip*.7,white); $('fade').style.opacity=ss(DUR-.8,DUR,t); };
window.renderAt(0); window.ready=true;
