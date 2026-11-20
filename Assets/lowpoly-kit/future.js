import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, flat, shadow, ss, person, woman, skyDome, roundTree, textSign } from './kit.js';
const TL=await (await fetch('/future_timeline.json')).json(), SEG=TL.segments, R=rng(3026), $=id=>document.getElementById(id), DUR=TL.duration, NS=SEG.length;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.05,5000), D=new THREE.Object3D(), C=h=>new THREE.Color(h), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xcfe8f0,90,700); const sky=skyDome(sc,0x5a9ae8,0xcfe8f0);
const hemi=new THREE.HemisphereLight(0xe8f4ff,0x5a5a6a,1.4); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xfff4e8,1.6); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:1,far:400}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.06; sc.add(sunL); sc.add(sunL.target);
const composer=new EffectComposer(renderer); composer.setSize(1080,1920); composer.addPass(new RenderPass(sc,cam)); const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.3,.5,.9); composer.addPass(bloom); composer.addPass(new OutputPass());
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=(c,o={})=>new THREE.MeshBasicMaterial({color:c,...o});
const glyph=(t,w=1.6,h=.5,c='#7ff0ff')=>{ const s=textSign(t,w,h,'rgba(0,0,0,0)',c); s.material.transparent=true; s.material.depthWrite=false; return s; };
// ---------- characters
const face=p=>{ const h=p.children[1], dk=flat(0x1a1210), f=(w,hh,x,y,m=dk)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.02),m); b.position.set(x,y,.18); h.add(b); return b; }; const br=[];
 for(const s of [-1,1]){ f(.065,.055,s*.085,.035); const w=f(.022,.02,s*.085+.012,.045,flat(0xffffff)); w.position.z=.192; br.push(f(.09,.025,s*.085,.095)); } p.userData.brows=br; p.userData.mouth=f(.09,.025,0,-.085,flat(0x6a3a30)); return p; };
const mood=(p,m)=>{ const rz={flat:0,sad:.4,happy:-.15,shock:-.1,calm:-.05}[m], my={flat:1,sad:1,happy:2.6,shock:3.2,calm:1.6}[m], mx={flat:1,sad:.7,happy:1.3,shock:.6,calm:1.2}[m]; p.userData.brows.forEach((q,i)=>{ q.rotation.z=(i?-1:1)*rz; }); p.userData.mouth.scale.set(mx,my,1); };
const arms=(p,a,b=a)=>{ p.children[5].rotation.set(a,0,0); p.children[6].rotation.set(b,0,0); };
const legs=(p,a,b=a)=>{ p.children[3].rotation.x=a; p.children[4].rotation.x=b; };
const reset=p=>{ p.visible=true; p.rotation.set(0,0,0); p.userData.pose(0,0); arms(p,0); p.children[1].rotation.set(0,0,0); p.children[0].position.y=1.25; mood(p,'calm'); };
const hero=face(person({shirt:0xd8e4ec,pants:0xc8d4dc,hair:0x3a2418,skin:0xe0b08a})); sc.add(hero); hero.userData.beard.visible=true; hero.userData.beard.material=flat(0x3a2418); hero.userData.beard.scale.set(1,.85,1); hero.userData.beard.position.y=1.64; bx(hero,.4,.5,.12,0x3a2418,0,1.7,-.2);
const helper=face(woman({shirt:0x2fb8a8,pants:0xe8eef2,hair:0x1a1a2a,skin:0x9a6a48})); sc.add(helper); bx(helper.children[1],.06,.1,.1,glowM(0x7ff0ff),.2,0,0);
const visor=p=>{ bx(p.children[1],.38,.08,.06,glowM(0x7ff0ff),0,.04,.19); return p; };
const fcols=[0xf2f4f6,0x2fb8a8,0xb8c4d8,0x6a7ae8,0xe8e0f0,0xf0a7c8,0x3a4a5a,0xd8f0e8];
const folk=[...Array(12)].map((_,i)=>{ const p=visor(face((i%2?woman:person)({shirt:fcols[i%8],pants:[0xe8eef2,0x3a4a5a,0xb8c4d8][i%3],skin:[0xd9a27a,0x8a5a3a,0xe8c09a,0xb8805a,0x6a4028][i%5],hair:[0x2a1a12,0xe8e8f0,0x7ab0e8,0x1a1a1a][i%4]}))); sc.add(p); return {p,x0:-40+R()*80,z:2+(i%4)*2,dir:i%2?1:-1,sp:1.1+R()*.5}; });
const mkDrone=()=>{ const g=new THREE.Group(); bx(g,.6,.22,.6,0xf2f4f6,0,0,0); const eye=bx(g,.2,.12,.05,glowM(0x7ff0ff),0,0,.31); for(const [x,z] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]){ bx(g,.5,.04,.08,0xb8c4d8,x/2,.05,z/2).rotation.y=Math.atan2(z,x); const r=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.02,10),new THREE.MeshBasicMaterial({color:0xcfe8f0,transparent:true,opacity:.5})); r.position.set(x,.1,z); g.add(r); } g.userData.eye=eye; sc.add(g); return g; };
const drone=mkDrone(); const drones=[...Array(7)].map(()=>mkDrone());
// ======================= LAB (far away set)
const LZ=-600, lab=new THREE.Group(); lab.position.set(0,0,LZ); sc.add(lab);
bx(lab,16,.1,14,0xd8dce4,0,-.05,0); bx(lab,16,.1,14,0xe8ecf0,0,4,0); bx(lab,16,4,.2,0xc8d0d8,0,2,-7); bx(lab,.2,4,14,0xc8d0d8,-8,2,0); bx(lab,16,4,.2,0xc8d0d8,0,2,7);
bx(lab,.2,4,5,0xc8d0d8,8,2,-4.5); bx(lab,.2,4,5,0xc8d0d8,8,2,4.5); bx(lab,.2,1,4,0xc8d0d8,8,3.5,0); const doorLight=bx(lab,.1,3,4,glowM(0xeaf8ff),8.3,1.5,0);
const strips=[]; for(const z of [-6.8,6.8]){ const s=bx(lab,15,.08,.08,glowM(0x3ab8e8),0,3.7,z); strips.push(s); }
const labL=new THREE.PointLight(0x7fc8ff,10,14); labL.position.set(0,3.4,0); lab.add(labL); const doorL=new THREE.PointLight(0xeaf8ff,0,14); doorL.position.set(7,2,0); lab.add(doorL);
const pods=[-6,-3,0,3].map((x,i)=>{ const g=new THREE.Group(); g.position.set(x,0,-1.2); lab.add(g); bx(g,1.3,.7,2.9,0xb8c4d0,0,.35,0); bx(g,1.36,.06,2.96,glowM(i===2?0x7ff0ff:0x2a4a5a),0,.6,0); bx(g,.8,.9,.3,0x8a96a4,0,.45,-1.6); const sc_=bx(g,.5,.3,.04,glowM(i===2?0x7fff9a:0xd64f4f),0,.75,-1.76); const hinge=new THREE.Group(); hinge.position.set(0,.72,-1.4); g.add(hinge); const lid=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,2.8,10,1,false,0,Math.PI).rotateX(Math.PI/2).rotateZ(Math.PI/2),new THREE.MeshLambertMaterial({color:0xcfefff,transparent:true,opacity:.55,side:THREE.DoubleSide})); lid.position.z=1.4; hinge.add(lid); if(i!==2){ const sl=bx(g,.5,.25,1.8,0x8aa8c0,0,.85,.1); } return {g,hinge,lid}; });
const mistN=60, mist=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.3,0),new THREE.MeshBasicMaterial({color:0x8fb8cc,transparent:true,opacity:.18,depthWrite:false}),mistN); mist.frustumCulled=false; lab.add(mist); const md=[...Array(mistN)].map(()=>[R(),R(),R(),R()]);
// ======================= CITY
const city=new THREE.Group(); sc.add(city);
const groundM=flat(0xd4dce0); bx(city,900,.04,700,groundM,0,-.04,-100).castShadow=false;
for(let i=0;i<10;i++){ bx(city,8,.06,3,0x7ac06a,-46+i*10,.02,-1.6).castShadow=false; bx(city,8,.06,4,0x6ab05a,-46+i*10,.02,11).castShadow=false; }
const pathM=flat(0xc8d0d8); bx(city,200,.05,9,pathM,0,.02,5).castShadow=false; for(let i=0;i<40;i++) bx(city,1.2,.02,.12,glowM(0x7ff0ff),-100+i*5,.06,.6).castShadow=false;
const bands=[], winMs=[];
const ftower=(x,z,r,h,col)=>{ const g=new THREE.Group(); g.position.set(x,0,z); city.add(g); const body=shadow(new THREE.Mesh(new THREE.CylinderGeometry(r*.75,r,h,6),flat(col))); body.position.y=h/2; g.add(body);
 for(let y=6;y<h-2;y+=5){ const t=1-(y/h)*.25, b=new THREE.Mesh(new THREE.CylinderGeometry(r*t+.12,r*t+.12,.5,6),glowM(0x3ab8e8)); b.position.y=y; g.add(b); bands.push(b); }
 for(let y=14;y<h-4;y+=16){ const t=1-(y/h)*.25; const ring=shadow(new THREE.Mesh(new THREE.CylinderGeometry(r*t+1.4,r*t+1.4,.6,6),flat(0xd8dce4))); ring.position.y=y; g.add(ring); for(let a=0;a<6;a++){ const tr=shadow(new THREE.Mesh(new THREE.DodecahedronGeometry(.9,0),flat(a%2?0x4fa850:0x3f8a48))); tr.position.set(Math.cos(a)*(r*t+.9),y+.8,Math.sin(a)*(r*t+.9)); g.add(tr); } }
 const sp=shadow(new THREE.Mesh(new THREE.ConeGeometry(r*.5,h*.15,6),flat(col))); sp.position.y=h+h*.075; g.add(sp); return g; };
const TW=[[-30,-40,7,70,0xf2f4f6],[24,-50,8,90,0xc8e8e0],[-62,-70,9,110,0xdfe6ee],[58,-80,10,120,0xe8d8c0],[-8,-90,8,140,0xe8d8c0],[90,-40,7,60,0xdfe6ee],[-95,-30,6,55,0xc8e8e0],[110,-110,11,150,0xe8eef2],[-120,-120,10,130,0xdfe6ee],[0,-160,12,180,0xf2f4f6],[40,-140,9,100,0xe8f0f4],[-50,-150,9,95,0xf2f4f6]];
TW.forEach(q=>ftower(...q));
// lab dome (exit), smart building, clinic
const dome=shadow(new THREE.Mesh(new THREE.SphereGeometry(8,12,6,0,Math.PI*2,0,Math.PI/2),flat(0xf2f4f6))); dome.position.set(0,0,-12); city.add(dome); bx(city,3,3.2,1.6,0xdfe6ee,0,1.6,-4.6); const domeDoor=bx(city,2,2.6,.1,glowM(0xeaf8ff),0,1.3,-3.75);
const smart=new THREE.Group(); smart.position.set(12,0,-9); city.add(smart); bx(smart,12,7,8,0xdfe6ee,0,3.5,0); bx(smart,10,3.2,.1,new THREE.MeshLambertMaterial({color:0x9fd8ea,transparent:true,opacity:.7}),0,1.7,4.02); const deny=bx(smart,2.2,.12,.12,glowM(0x3ab8e8),0,3.4,4.1); const denyX=glyph('✕',.9,.9,'#ff4a5a'); denyX.position.set(0,2.2,4.15); smart.add(denyX);
const kiosk=new THREE.Group(); kiosk.position.set(-8,0,0); kiosk.rotation.y=Math.PI/2; city.add(kiosk); bx(kiosk,1.4,2.4,.8,0xf2f4f6,0,1.2,0); const kScreen=bx(kiosk,1,.8,.05,glowM(0x3ab8e8),0,1.7,.42); const kX=glyph('✕',.7,.7,'#ffffff'); kX.position.set(0,1.7,.46); kiosk.add(kX); const kOk=glyph('◇ ⌁ ◇',.9,.4,'#ffffff'); kOk.position.set(0,1.7,.46); kiosk.add(kOk); const beam=new THREE.Mesh(new THREE.PlaneGeometry(1,.04),glowM(0xff4a5a,{transparent:true,opacity:.8,side:THREE.DoubleSide})); kiosk.add(beam);
const clinic=new THREE.Group(); clinic.position.set(32,0,-5); city.add(clinic); bx(clinic,12,6,8,0xf6f8fa,0,3,0); bx(clinic,2.4,2.8,.1,new THREE.MeshLambertMaterial({color:0x9fd8ea,transparent:true,opacity:.8}),0,1.4,4.02); bx(clinic,.6,2,.1,glowM(0x5aff9a),0,4.8,4.06); bx(clinic,2,.6,.1,glowM(0x5aff9a),0,4.8,4.06);
// maglev
const TZ=14, TY=9; bx(city,400,.8,3,0xdfe6ee,0,TY,TZ); bx(city,400,.12,.2,glowM(0x3ab8e8),0,TY+.45,TZ+1.4); for(let x=-180;x<=180;x+=20){ bx(city,1.4,TY,1.4,0xc8d0d8,x,TY/2,TZ); }
const train=new THREE.Group(); city.add(train); for(let i=0;i<3;i++){ bx(train,10,1.8,2.6,0xf6f8fa,i*10.6,TY+1.4,TZ); bx(train,9.6,.5,2.64,glowM(0x1a2a3a),i*10.6,TY+1.7,TZ); bx(train,10,.12,2.66,glowM(0x7ff0ff),i*10.6,TY+.9,TZ); } const nose=shadow(new THREE.Mesh(new THREE.ConeGeometry(1.3,3,4),flat(0xf6f8fa))); nose.rotation.z=-Math.PI/2; nose.position.set(26.2,TY+1.4,TZ); train.add(nose);
for(let i=0;i<24;i++){ const t=roundTree(R,[flat(0x4fa850),flat(0x3f8a48)],flat(0x6b4a33),.9); t.position.set(-60+R()*120,0,R()<.5?-22-R()*14:20+R()*14); if((Math.abs(t.position.x)>6||t.position.z>0)&&!(t.position.z>0&&t.position.x>-5&&t.position.x<45)) city.add(t); }
const nightL=new THREE.PointLight(0x7ff0ff,0,18); nightL.position.set(22,7.5,13); city.add(nightL);
const ring=new THREE.Mesh(new THREE.RingGeometry(1.6,1.8,32),glowM(0xff9a3a,{transparent:true,opacity:.8,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; city.add(ring);
const holo=glyph('2026',2.4,1,'#7ff0ff'); city.add(holo); const holoP=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.4),glowM(0x3ab8e8,{transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false})); city.add(holoP);
const talk=glyph('◇⌁△ ⟡◇?',1.8,.5), hello=glyph('HELLO?',1.4,.45,'#ffffff'); sc.add(talk); sc.add(hello);
// ======================= timeline
const SH=[]; SEG.forEach((s,i)=>{ const a=i?s.start:0, b=i<NS-1?SEG[i+1].start:DUR; SH.push([a,b]); }); window.SHOTS=SH; window.DURATION=DUR;
const P=(a,b,c,d,u)=>{ cam.position.lerpVectors(V(...a),V(...b),u); cam.lookAt(V(...c).lerp(V(...(d||c)),u)); };
const PL=(a,b,c,d,u)=>{ const f=p=>[p[0],p[1],p[2]+LZ]; P(f(a),f(b),f(c),f(d||c),u); };
const LOOK={ lab:[0,0,[30,60,20],0x9fd0ff,.3,.55,0x0a0c12,'saturate(.9)'], day:[0x3a7ae0,0xa8d8f0,[-120,140,120],0xfff4e8,1.7,1.5,0xcfe8f0,'saturate(1.05)'],
 night:[0x050816,0x14203a,[100,140,100],0x8aa0d8,.25,.45,0x0c1428,'saturate(.95)'], dawn:[0x6a7ad0,0xf8c0a0,[-200,40,160],0xffc8a0,1.3,1.2,0xf0c8b0,'saturate(1)'], gold:[0x5a7ad8,0xf8d0a0,[200,50,120],0xffd8a0,1.5,1.3,0xf0d0b0,'saturate(1.05)'] };
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=NS-1; const T0=SH[k][0], u=(t-T0)/(SH[k][1]-T0), sub=(a,b)=>ss(0,1,(u-a)/(b-a));
 let lk='day', inLab=false, lidOpen=0, mistA=0, doorA=0, talkOn=0, helloOn=0, ringA=0, holoOn=false, crowd=0, night=false, kioskOn=0, denyOn=0;
 [hero,helper].forEach(reset); helper.visible=false; legs(hero,0); hero.position.set(0,0,0); drone.visible=false; talk.visible=false; hello.visible=false;
 folk.forEach(q=>{ reset(q.p); q.p.visible=false; });
 switch(k){
 case 0: inLab=true; lk='lab'; { const q=u; lidOpen=sub(.42,.7); mistA=sub(.4,.5)*(1-sub(.5,.62)); if(q<.5){ hero.rotation.x=-Math.PI/2; hero.position.set(0,.88,-1.2+1.15+LZ); mood(hero,'flat'); } else { hero.userData.sit(); hero.position.set(0,-.07,-1.2-.7+LZ); hero.children[0].position.y=1.25; mood(hero,q<.75?'shock':'sad'); hero.children[1].rotation.y=Math.sin(t*1.2)*.4; arms(hero,-.4,-.4); }
  if(q<.42) PL([-5,3.4,5],[-1.5,2.4,2.4],[0,.6,-1.2],[0,.8,-1.2],sub(0,.42)); else PL([1.4,1.7,1.6],[1.1,1.6,1.3],[0,1,-1.6],[0,1.2,-1.8],sub(.42,1)); } break;
 case 1: inLab=true; lk='lab'; lidOpen=1; doorA=1; mistA=.3*(1-u); { if(u<.45){ const q=sub(0,.45); hero.position.set(1,0,-1.2+LZ+.3); hero.rotation.y=Math.PI/2; const down=ss(.45,.75,q); hero.position.y=-down*.55; legs(hero,-down*1.4); hero.children[0].position.y=1.25; arms(hero,lg(-.3,-1.2,down),lg(.3,-1.2,down)); hero.rotation.z=Math.sin(t*5)*.06*(1-down); mood(hero,down>.3?'sad':'shock'); PL([4.6,1.6,1.8],[4.2,1.4,1.4],[1,1,-.9],[1,.8,-.9],q); }
  else { const q=sub(.45,1); hero.position.set(lg(2,6.6,q),0,LZ+.4); hero.rotation.y=Math.PI/2; hero.userData.pose(t*3.2,.28); hero.rotation.z=Math.sin(t*3.2)*.08; arms(hero,-.2,-1.2); mood(hero,'sad'); hero.children[1].rotation.x=.2; PL([lg(2,6.6,q)+3,1.8,2.8],[lg(2,6.6,q)+3,1.8,2.8],[lg(2,6.6,q),1.4,.4],[lg(2,6.6,q),1.4,.4],0); } } break;
 case 2: if(u<.4){ const q=sub(0,.4); hero.position.set(0,0,lg(-3.8,-2.4,q)); hero.userData.pose(t*3,.25); mood(hero,'shock'); P([46,44,64],[14,9,22],[0,8,-30],[0,2,-5],q); }
  else { const q=sub(.4,1); hero.position.set(0,0,-1.6); hero.rotation.y=.5; mood(hero,'shock'); hero.children[1].rotation.set(-.12,.0,0); arms(hero,q>.5?-.4:0,q>.5?-.4:0); drone.visible=true; drone.position.set(.55,2.15+Math.sin(t*2)*.06,-.5); drone.rotation.y=Math.PI+.5; talkOn=1; talk.position.set(.5,2.75,-.5); P([-.5,1.9,3.3],[-.4,1.85,2.8],[.2,1.9,-1.1],[.2,1.9,-1.1],q); } break;
 case 3: if(u<.45){ const q=sub(0,.45); denyOn=1; hero.position.set(11.6,0,-3.4); hero.rotation.y=Math.PI*.82; arms(hero,0,-1.1*ss(.2,.4,q)); mood(hero,q>.5?'sad':'calm'); hero.children[1].rotation.y=q>.6?.6:0; P([14.2,1.8,.4],[13.9,1.75,-.1],[11.9,1.6,-3.9],[11.9,1.6,-3.9],q); }
  else { const q=sub(.45,1); kioskOn=q; hero.position.set(-6.8,0,0); hero.rotation.y=-Math.PI/2; mood(hero,q>.45?'sad':'flat'); arms(hero,q>.6?-.3:0,q>.6?-.3:0); P([-4.4,1.85,3.9],[-4.8,1.8,3.4],[-7.3,1.5,0],[-7.3,1.5,0],q); } crowd=1; break;
 case 4: { const q=u; hero.position.set(2,0,4); hero.rotation.y=.2; ringA=sub(.25,.45); const c=Math.max(0,Math.sin(t*9))*(q<.7?1:.3); hero.children[0].rotation.x=c*.25; hero.children[1].rotation.x=.25+c*.3; arms(hero,-2.2+c*.3,-.2); mood(hero,'sad'); crowd=1; P([5.6,3,11],[4.6,2.6,9.6],[2,1.1,4],[2,1.2,4],q); } break;
 case 5: night=true; lk='night'; if(u<.45){ const q=sub(0,.45); P([4,5,42],[10,3,34],[20,9,14],[22,4,13],q); hero.position.set(21.6,.3,12.4); hero.userData.sit(); hero.rotation.z=-Math.PI/2; hero.position.x=21.8; mood(hero,'sad'); }
  else { const q=sub(.45,1); hero.userData.sit(); hero.rotation.set(0,0,-Math.PI/2); hero.position.set(21.8,.3,12.6); hero.children[1].rotation.z=.2; mood(hero,'sad'); P([23.4,1.3,17.4],[23.2,1.1,16.6],[23,.6,12.6],[23,.5,12.6],q); } break;
 case 6: lk='dawn'; if(u<.5){ const q=sub(0,.5); hero.userData.sit(); hero.position.set(21.4,-.36,12.5); hero.rotation.y=.4; mood(hero,q<.6?'sad':'shock'); helper.visible=true; const w=ss(0,.6,q); helper.position.set(lg(25.4,22.9,w),0,lg(14.6,13.6,w)); helper.rotation.y=-Math.PI/2-.2; helper.userData.pose(t*4,.35*(1-w)); if(w>.95){ arms(helper,0,-1.2); mood(helper,'happy'); } talkOn=q>.6?1-ss(.8,.9,q):0; helloOn=ss(.82,.92,q); talk.position.set(21.4,2.1,12.7); hello.position.set(21.4,2.1,12.75); P([22.6,1.7,21],[22.8,1.6,20.2],[22.6,1.1,13],[22.3,1.1,13],q); }
  else { const q=sub(.5,1); const x=lg(23,30,q), z=lg(10,2.4,q); hero.position.set(x-.7,0,z); helper.visible=true; helper.position.set(x+.7,0,z); [hero,helper].forEach(p=>{ p.rotation.y=Math.PI*.8; p.userData.pose(t*3.4,.3); }); arms(hero,-.1,-.5); arms(helper,-.5,-.1); mood(hero,'calm'); P([22,3.4,17],[22.6,3.2,15],[x,1.6,z-2],[31,2.4,-1],q); } break;
 case 7: if(u<.55){ const q=sub(0,.55); lk='gold'; hero.position.set(0,0,5.6); mood(hero,'happy'); arms(hero,-.3+Math.sin(t*2)*.2,-.6); holoOn=true; folk.slice(0,6).forEach((f,i)=>{ f.p.visible=true; const a=-1.25+i*.5; f.p.position.set(Math.sin(a)*3.2,0,5.6-Math.cos(a)*3.2); f.p.rotation.y=Math.atan2(-f.p.position.x,5.6-f.p.position.z); mood(f.p,'happy'); f.p.children[1].rotation.y=Math.sin(t+i)*.2; if(i===2) arms(f.p,-2.4); }); helper.visible=true; helper.position.set(1.4,0,6.6); helper.rotation.y=-.6; mood(helper,'happy'); P([.3,2.4,12.4],[.2,2.2,11],[0,1.7,4.6],[0,1.8,4.6],q); }
  else { lk='gold'; holoOn=true; const q=sub(.55,1); hero.position.set(0,0,5.6); mood(hero,'happy'); crowd=1; P([0,3,12],[40,80,120],[0,2,4],[0,20,-60],q); } break; }
 // ---- set & characters
 lab.visible=inLab; city.visible=!inLab; train.visible=!inLab;
 if(crowd&&!inLab){ folk.forEach((q,i)=>{ if(q.p.visible&&k===7) return; q.p.visible=true; const L=70; let x=((q.x0+q.dir*q.sp*t+35)%L+L)%L-35; let z=q.z; if(k===4){ const dx=x-2, dz=z-4, d=Math.hypot(dx,dz); if(d<4.5){ x=2+dx/d*4.5; z=4+dz/d*4.5; } } q.p.position.set(x,0,z); q.p.rotation.y=q.dir*Math.PI/2; q.p.userData.pose(t*q.sp*4+i,.4); if(k===4&&Math.hypot(x-2,z-4)<5.5){ q.p.rotation.y=Math.atan2(2-x,4-z); q.p.userData.pose(0,0); arms(q.p,-.8); mood(q.p,'shock'); } }); }
 drones.forEach((d,i)=>{ d.visible=!inLab&&k!==5; const a=t*.25+i*.9; d.position.set(Math.cos(a)*(20+i*6),10+i*2.5+Math.sin(t+i),-10+Math.sin(a)*(14+i*3)); d.rotation.y=-a; });
 train.position.set(((t*16+40)%260)-150,0,0); if(k===5) train.position.x=lg(-40,40,u)-15;
 pods.forEach((p,i)=>{ p.hinge.rotation.x=i===2?-1.25*lidOpen:0; p.lid.material.opacity=i===2?lg(.55,.12,lidOpen):.6; });
 md.forEach((q,i)=>{ const a=((t*.25+q[0])%1); D.position.set((q[1]-.5)*3.4*(.6+a),.7+a*.9,-1.2+(q[2]-.5)*3.4); D.scale.setScalar(mistA>0?(.6+a*1.6)*mistA:.0001); D.updateMatrix(); mist.setMatrixAt(i,D.matrix); }); mist.instanceMatrix.needsUpdate=true; mist.material.opacity=.18;
 doorL.intensity=doorA*8; doorLight.material.color.set(doorA?0xbfe0f0:0x3a4a5a); labL.intensity=inLab?(k===0&&u<.42?5:10):0; strips.forEach(s=>s.material.color.set(Math.sin(t*3)>.9&&k===0?0x7ff0ff:0x3ab8e8));
 talk.visible=talkOn>0; talk.material.opacity=talkOn; hello.visible=helloOn>0; hello.material.opacity=helloOn; if(talk.visible){ talk.lookAt(cam.position); } if(hello.visible) hello.lookAt(cam.position);
 ring.visible=ringA>0; ring.position.set(2,.08,4); ring.scale.setScalar(lg(.5,1.4,ringA)); ring.material.opacity=.8*ringA*(.7+.3*Math.sin(t*6));
 deny.material.color.set(denyOn?(Math.sin(t*8)>0?0xff4a5a:0x5a1a2a):0x3ab8e8); denyX.visible=denyOn&&u>.18;
 kScreen.material.color.set(kioskOn>.45?0xd63a4a:0x3ab8e8); kX.visible=kioskOn>.45; kOk.visible=kioskOn<=.45; beam.visible=kioskOn>0&&kioskOn<.45; beam.position.set(0,1.75+Math.sin(t*8)*.25,.9); beam.rotation.y=0; beam.scale.x=1.2;
 holo.visible=holoP.visible=holoOn; holo.position.set(0,3.4,4.6); holoP.position.set(0,3.4,4.58); holo.lookAt(cam.position); holoP.lookAt(cam.position);
 nightL.intensity=night?40:k===6?10:0; bands.forEach(b=>b.material.color.set(night?0x7ff0ff:0x3ab8e8)); domeDoor.material.color.set(night?0x7ff0ff:0xeaf8ff);
 if(!inLab&&cam.position.distanceTo(hero.getWorldPosition(V()).add(V(0,1.5,0)))<.5) hero.visible=false;
 // ---- look
 const L_=LOOK[lk]; sky.top.value.set(L_[0]); sky.low.value.set(L_[1]); sc.fog.color.set(L_[6]); sc.fog.near=inLab?30:90; sc.fog.far=inLab?60:700; sunL.position.set(...L_[2]).add(cam.position); sunL.target.position.copy(cam.position); sunL.color.set(L_[3]); sunL.intensity=L_[4]; hemi.intensity=L_[5]; $('c').style.filter=L_[7];
 bloom.strength=night?.9:inLab?.35:.2; bloom.threshold=night?.5:inLab?.82:.92;
 composer.render();
 // ---- HUD
 const seg=SEG[k]; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 const dip=k>0?1-ss(0,.45,t-SH[k][0]):0; $('fla').style.background='#000'; $('fla').style.opacity=dip*.7; $('fade').style.opacity=ss(DUR-.8,DUR,t); };
window.renderAt(0); window.ready=true;
