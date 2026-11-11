import * as THREE from 'three';
import { rng, flat, shadow, ss, rock, roundTree, pine, person, woman, car, lamp, skyDome, softSun, lights, tower, deer, bird, textSign, fadeGroup } from './kit.js';
const TL=await (await fetch('/vanish_timeline.json')).json(), SEG=TL.segments, R=rng(77), $=id=>document.getElementById(id), DUR=TL.duration, NS=SEG.length;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(58,1080/1920,.3,3000), D=new THREE.Object3D(), C=h=>new THREE.Color(h), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u)), V=(x,y,z)=>new THREE.Vector3(x,y,z);
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf2c4ad,140,620); const sky=skyDome(sc,0x7f91d8,0xf2c4ad), sun=softSun(sc,-120,160,-500,90), lt=lights(sc,150); lt.d.shadow.camera.far=500; lt.d.target.position.set(0,0,-60); sc.add(lt.d.target);
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const GREEN=C(0x5f9e42), RUST=C(0x7a4a2a), MOSS=C(0x6f8a5a), aged=[]; const ageM=(c,to=GREEN)=>{ const m=flat(c); aged.push([m,C(c),to]); return m; };
bx(sc,3000,.04,3000,0x5f9e42,0,-.04,0).castShadow=false; const slabM=ageM(0xb4b2ac), roadM=ageM(0x4a4c55), walkM=ageM(0xcfcbc2);
bx(sc,420,.04,270,slabM,0,-.01,-57).castShadow=false; bx(sc,14,.06,270,roadM,0,.02,-57).castShadow=false; for(const s of [-1,1]) bx(sc,3.5,.22,270,walkM,s*8.75,.1,-57);
const river=bx(sc,1200,.06,56,0x4b9df0,0,.05,-222); river.castShadow=false;
const dash=new THREE.InstancedMesh(new THREE.BoxGeometry(.25,.02,3),new THREE.MeshBasicMaterial({color:0xf2efe6}),66); for(let i=0;i<66;i++){ D.position.set(0,.07,74-i*4+ (i%2?0:0)); D.rotation.set(0,0,0); D.scale.set(1,1,i%2?1:0.001); D.updateMatrix(); dash.setMatrixAt(i,D.matrix); } sc.add(dash);
// towers
const pal=[0xb8a2e6,0xf6b172,0x7ec4bc,0xf0a79d,0xa9b4d8,0xeaa985,0xc2a8e2,0xe8dcc8], TW=[];
for(const s of [-1,1]) for(let i=0;i<16;i++){ const w=12+R()*5, h=26+R()*38, z=66-i*16, x=s*(11+w/2); const g=tower(R,x,z,w,h,13,pal[(i+(s>0?3:0))%8]); sc.add(g); TW.push({g,h,w,x,z,s,row:0,r1:R(),r2:R(),r3:R(),bt:.08+R()*.4}); }
for(const s of [-1,1]) for(let i=0;i<11;i++){ const w=14+R()*6, h=45+R()*50, z=70-i*23, x=s*(40+R()*14); const g=tower(R,x,z,w,h,16,pal[(i+5)%8]); sc.add(g); TW.push({g,h,w,x,z,s,row:1,r1:R(),r2:R(),r3:R(),bt:.05+R()*.4}); }
TW.forEach(t=>{ t.m=t.g.children[0].material; t.c0=t.m.color.clone(); t.win=t.g.children[2].material; }); const HERO=TW.find(t=>t.s<0&&t.row===0&&t.z===66-13*16); HERO.h=60; HERO.g.scale.y=1;
// vines on road-facing walls
const NV=900, vines=new THREE.InstancedMesh(rock(1,0,R,.25),flat(0x3f8a3a),NV); vines.frustumCulled=false; vines.castShadow=true; sc.add(vines); const vd=[...Array(NV)].map(()=>{ const t=TW[Math.floor(R()*32)]; return {t,x:t.x-t.s*(t.w/2+.2),y:R()*R()*16,z:t.z+(R()-.5)*13,s:.8+R()*1.6,r:R()*6}; });
// lamps, subway
const lamps=[]; for(let i=0;i<18;i++){ const l=lamp(flat(0x3a3f49),flat(0xf2e9c8)); l.position.set(i%2?7.6:-7.6,.2,70-i*14); sc.add(l); lamps.push(l); }
const sub=new THREE.Group(); sub.position.set(-9,0,24); sc.add(sub); bx(sub,2.2,.3,5,0x15171c,0,.12,0); for(const [x,z,w,d] of [[-1.2,0,.15,5],[1.2,0,.15,5],[0,-2.5,2.4,.15]]) bx(sub,w,1.1,d,0x2f6b4a,x,.75,z); bx(sub,.15,3,.15,0x2f6b4a,-1.2,1.7,2.5); bx(sub,.15,3,.15,0x2f6b4a,1.2,1.7,2.5); const sg=textSign('SUBWAY',2.6,.7,'#2f6b4a','#fff'); sg.position.set(0,3.1,2.5); sub.add(sg);
const waterM=new THREE.MeshLambertMaterial({color:0x3f86d8,transparent:true,opacity:.85}); const pud=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.05,14),waterM); pud.position.set(-7.5,.25,25); sc.add(pud);
// cars & people
const cars=[...Array(14)].map((_,i)=>{ const c=car([0xd64f4f,0x3f78c4,0xefc14d,0x4fa28f,0xf2efe6,0x8a5ac8][i%6]); const ms=new Set(); c.traverse(o=>o.material&&ms.add(o.material)); c.userData={ms:[...ms].map(m=>[m,m.color.clone()]),lane:[-5,-2,2,5][i%4],dir:i%4<2?1:-1,z0:60-i*17+R()*6,v:9+R()*4,tilt:(R()-.5)*.2}; sc.add(c); return c; });
const folk=[...Array(30)].map((_,i)=>{ const m=i%2?woman({shirt:pal[i%8]}):person({shirt:pal[(i+3)%8],pants:0x394a6e}); m.userData.q={x:(i%2?1:-1)*(8+R()*1.4),z0:60-i*5+R()*4,dir:R()<.5?1:-1,v:1.2+R()*.5}; sc.add(m); return m; });
// cracks, weeds, craters
const NC=500, crk=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.02,.1),new THREE.MeshBasicMaterial({color:0x26272c}),NC); crk.frustumCulled=false; sc.add(crk); const cd=[...Array(NC)].map(()=>[(R()-.5)*20,70-R()*250,R()*3.14,.6+R()*2.4]);
const NW=900, weeds=new THREE.InstancedMesh(new THREE.ConeGeometry(.22,.7,4),flat(0x4f9a3c),NW); weeds.frustumCulled=false; sc.add(weeds); const wd=[...Array(NW)].map(()=>[(R()-.5)*21,70-R()*250,.5+R()*1.2,R()]);
const holes=[...Array(9)].map((_,i)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(1.6+R()*1.8,1.2,.06,7),new THREE.MeshBasicMaterial({color:0x2a2420})); m.position.set((R()-.5)*8+(i%2?3.5:-3.5),.06,40-i*24+R()*8); m.scale.z=1.5; sc.add(m); return m; });
// trees: road trees, city trees, wild forest
const leaf=[flat(0x2c7f3d),flat(0x3f9a48),flat(0x1f6a3a)], bark=flat(0x6b4a33), trees=[]; const mkT=(x,z,kind,s)=>{ const g=R()<.7?roundTree(R,leaf,bark,1):pine(R,leaf[2],bark,1.5); g.position.set(x,0,z); g.rotation.y=R()*6; sc.add(g); trees.push({g,kind,s,x,z}); };
for(let i=0;i<60;i++) mkT((R()<.5?-1:1)*(3.2+R()*7),70-R()*250,0,.8+R()*.6); for(let i=0;i<70;i++) mkT((R()<.5?-1:1)*(26+R()*8+(R()<.3?R()*60:0)),70-R()*250,1,.9+R()*.7); for(let i=0;i<170;i++){ const x=(R()-.5)*300; mkT(Math.abs(x)<3.2?x+8:x,90-R()*270,2,1+R()*.9); }
const mounds=new THREE.Group(); sc.add(mounds); TW.forEach((t,i)=>{ if(i%2) return; const m=new THREE.Mesh(rock(t.w*.6,1,R,.2),flat(i%4?0x6a9a50:0x8a8a80)); m.scale.y=.3; m.position.set(t.x,0,t.z); m.castShadow=true; mounds.add(m); }); for(let i=0;i<10;i++){ const b=bx(mounds,1.5+R()*2,1+R()*1.5,1.2+R(),0x9a968c,(R()-.5)*26,.3,55-R()*90); b.rotation.set((R()-.5)*.5,R()*3,(R()-.5)*.5); }
const hills=new THREE.Group(); sc.add(hills); for(let i=0;i<9;i++){ const m=new THREE.Mesh(rock(50+R()*40,1,R,.15),flat(0x5a8a5a)); m.scale.y=.45; m.position.set(-420+i*105,-5,-420-R()*80); hills.add(m); }
// bridge
const brM=ageM(0xc8553a,RUST), br=new THREE.Group(); sc.add(br); const beam=(p,a,b,t=.25)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(t,t,a.distanceTo(b)),brM)); m.position.copy(a).lerp(b,.5); m.lookAt(b); p.add(m); return m; };
const ramp=bx(br,14,.8,25,brM,0,3.5,-182); ramp.rotation.x=.283; const hA=new THREE.Group(), hB=new THREE.Group(); hA.position.set(0,7,-194); hB.position.set(0,7,-250); br.add(hA); br.add(hB); bx(hA,14,.8,28,brM,0,0,-14); bx(hB,14,.8,28,brM,0,0,14); const ramp2=bx(br,14,.8,25,brM,0,3.5,-262); ramp2.rotation.x=-.283;
const pyl=[-206,-238].map(z=>{ const g=new THREE.Group(); g.position.set(0,0,z); for(const s of [-1,1]) bx(g,1.6,46,1.6,brM,s*8,23,0); bx(g,17.6,1.6,1.6,brM,0,44,0); bx(g,17.6,1.2,1.4,brM,0,26,0); br.add(g); return g; }); const cab=new THREE.Group(); br.add(cab); for(const z of [-206,-238]) for(const s of [-1,1]) for(let i=1;i<=5;i++) for(const d of [-1,1]){ const zz=z+d*i*3.1; if(zz>-194||zz<-250) continue; beam(cab,V(s*8,44-i*1.5,z),V(s*7,7.4,zz),.14); }
// animals
const deers=[...Array(5)].map((_,i)=>{ const d=deer(i<2); sc.add(d); return d; }); const birds=[...Array(9)].map(()=>{ const b=bird(new THREE.MeshBasicMaterial({color:0x232c52,side:THREE.DoubleSide})); sc.add(b); return b; });
const SH=SEG.map((s,i)=>[i?s.start:0,i<NS-1?SEG[i+1].start:DUR]); window.SHOTS=SH; window.DURATION=DUR; const tv=SEG[0].lines[1].t+1.9;
const E=[ // sky top, low, sun pos, sun color, sun size, light color, light int, hemi, fog far
 [0x7f91d8,0xf2c4ad,[-120,160,-500],0xfff2a0,90,0xfff0d0,1.5,2.5,620],
 [0x0c1230,0x26305a,[140,220,-500],0xe8eeff,50,0x8a9ad8,.35,.55,520],
 [0x6f9ae0,0xe8dcc8,[100,200,-500],0xfff2a0,80,0xfff0d0,1.6,2.4,640],
 [0x8a94b8,0xe8c8b0,[-80,120,-500],0xffe0a0,90,0xffe8c8,1.3,2.3,560],
 [0x6a6aa8,0xf0a070,[-30,70,-520],0xffb060,130,0xffb880,1.5,2.0,640],
 [0x7fb0d8,0xdfeecf,[120,180,-500],0xfff8c0,90,0xfff4d8,1.5,2.5,480],
 [0x5f9ae8,0xf2e2c8,[-160,150,-500],0xfff2a0,100,0xfff0d0,1.6,2.5,900]];
const AGE=[0,0,.1,.32,.6,.88,1], VINE=[0,0,0,.3,.8,1.15,0], RST=[0,0,.12,.7,1,1,1], TSC=[[0,0,0,.4,.85,1.3,1.5],[0,0,0,.25,.7,1.2,1.5],[0,0,0,0,0,0,1.4]];
const CAMS=[[V(3,6,44),V(-2,9,22),V(0,4,-40),V(0,6,-60)],null,[V(0,1.3,34),V(0,1.7,20),V(0,2.2,-30),V(0,2.5,-30)],[V(-5,15,14),V(4,10,-8),V(0,0,-36),V(0,1,-56)],[V(10,84,-56),V(3,58,-104),V(-6,14,-190),V(-4,10,-215)],[V(0,4.5,52),V(0,7,14),V(0,8,-60),V(0,9,-90)],[V(0,26,70),V(0,85,130),V(0,2,-40),V(0,0,-70)]];
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=NS-1; const u=(t-SH[k][0])/(SH[k][1]-SH[k][0]), e=E[k], age=AGE[k];
 sky.top.value.set(e[0]); sky.low.value.set(e[1]); sc.fog.color.set(e[1]); sc.fog.far=e[8]; sun.position.set(...e[2]); sun.material.color.set(e[3]); sun.scale.setScalar(e[4]); lt.d.color.set(e[5]); lt.d.intensity=e[6]; lt.h.intensity=e[7]; lt.d.position.set(e[2][0]*.35,130,-60+90);
 aged.forEach(([m,c,to])=>m.color.copy(c).lerp(to,to===RUST?RST[k]*.75:age)); dash.visible=k<3; river.scale.z=k===6?1.5:1;
 // camera
 let cut2=false; if(k===1){ cut2=u>.55; if(!cut2){ const v=u/.55; cam.position.set(lg(8,0,v),lg(100,84,v),lg(84,56,v)); cam.lookAt(0,22,-70); } else { const v=(u-.55)/.45; cam.position.set(lg(-1,-2.5,v),lg(3.4,2.6,v),lg(36,32,v)); cam.lookAt(-8.6,1.1,25); } } else { const c=CAMS[k], v=ss(0,1,u); cam.position.lerpVectors(c[0],c[1],v); cam.lookAt(new THREE.Vector3().lerpVectors(c[2],c[3],v)); }
 // towers
 TW.forEach(t=>{ let sy=1, tz=0, tx=0, vis=k<6; if(k===4&&t.r1<.35){ sy=.5+.35*t.r2; tz=(t.r2-.5)*.1; } if(k===5){ sy=t.r1<.8?.1+.3*t.r2:.55; tz=(t.r3-.5)*.22; tx=(t.r2-.5)*.12; } if(t===HERO){ if(k===4){ sy=1; tz=-(ss(.3,.78,u)**2)*1.42; } if(k===5) vis=false; } t.sy=sy; t.g.visible=vis; t.g.scale.y=sy; t.g.rotation.set(tx,0,tz); t.m.color.copy(t.c0).lerp(MOSS,[0,0,.05,.2,.45,.7,1][k]); const w=t.win.color; if(k===0) w.set(0xffffff); else if(k===1) w.set(0xffffff).lerp(C(0x1c2238),ss(t.bt,t.bt+.04,u)); else w.set(k<4?0x8f9aa8:0x55585a); });
 const va=VINE[k]; vd.forEach((q,i)=>{ const ok=va>0&&q.y<q.t.h*q.t.sy-1&&q.t.g.visible&&!(q.t===HERO&&k===4); D.position.set(q.x,q.y,q.z); D.rotation.set(q.r,q.r*2,0); D.scale.setScalar(ok?q.s*va:0.0001); D.updateMatrix(); vines.setMatrixAt(i,D.matrix); }); vines.instanceMatrix.needsUpdate=true;
 lamps.forEach((l,i)=>{ l.visible=k<5; l.rotation.z=k>=3&&i%3===0?(i%2?-1:1)*(k===3?.12:.5):0; });
 // cars, people
 const stop=2.6; cars.forEach((c,i)=>{ const q=c.userData, tt=k===0?t:1e3, dist=q.v*Math.min(tt,tv)+q.v*(Math.min(Math.max(tt-tv,0),stop)-Math.min(Math.max(tt-tv,0),stop)**2/(2*stop)); let z=q.z0-q.dir*dist; const far=k===0?dist-(q.v*tv+q.v*stop/2):0; z+=q.dir*far*0; const zz=q.z0-q.dir*(q.v*tv+q.v*stop/2)+q.dir*(k===0?(q.v*tv+q.v*stop/2-dist):0); c.position.set(q.lane,k>=4?-.3:0,zz); c.rotation.set(k>=4?q.tilt:0,q.dir>0?Math.PI:0,k>=4?q.tilt:0); c.visible=k<5&&cam.position.distanceTo(c.position)>3; q.ms.forEach(([m,c0])=>m.color.copy(c0).lerp(RUST,RST[k])); });
 const fa=k===0?1-ss(tv,tv+.3,t):0; folk.forEach((m,i)=>{ const q=m.userData.q; m.position.set(q.x,.22,q.z0+q.dir*q.v*t); m.rotation.y=q.dir>0?0:Math.PI; m.userData.pose(t*6.5+i,.5); fadeGroup(m,fa); });
 // ground detail
 const cs=[0,0,.7,1,1,.6,0][k], ws=[0,0,.55,1,1.3,1.5,1.2][k]; if(renderAt.k!==k){ renderAt.k=k; cd.forEach((q,i)=>{ D.position.set(q[0]*.7,.07,q[1]); D.rotation.set(0,q[2],0); D.scale.set(q[3]*cs+.0001,1,cs?1:0.0001); D.updateMatrix(); crk.setMatrixAt(i,D.matrix); }); crk.instanceMatrix.needsUpdate=true; wd.forEach((q,i)=>{ const on=ws>0&&(k>2||q[3]<.45); D.position.set(q[0],.05,q[1]); D.rotation.set(0,q[3]*6,0); D.scale.setScalar(on?q[2]*ws:0.0001); D.updateMatrix(); weeds.setMatrixAt(i,D.matrix); }); weeds.instanceMatrix.needsUpdate=true; }
 holes.forEach(h=>h.visible=k===3||k===4);
 trees.forEach(q=>{ const f=TSC[q.kind][k]; q.g.visible=f>0&&Math.hypot(q.x-cam.position.x,q.z-cam.position.z)>4.5&&!(k<6&&q.z<-192&&q.z>-252); q.g.scale.setScalar(q.s*f||1); });
 mounds.visible=k===6; hills.visible=k>=4;
 // subway water
 const wv=k===1?ss(.55,1,u):k===2?1:0; pud.visible=k===1||k===2; pud.scale.set(.5+wv*5.5,1,.5+wv*4); sub.visible=k<5;
 // bridge
 const ba=k<4?0:k===4?ss(.08,.5,u)**2*.25:.25; hA.rotation.x=-ba; hB.rotation.x=ba; cab.visible=ba<.01; br.visible=k<6; pyl.forEach((p,i)=>p.rotation.x=k>=5?(i?-.2:.14):0);
 // animals
 deers.forEach((d,i)=>{ if(k===2){ d.visible=true; d.position.set(-9+i*1.4+ (t-SH[2][0])*1.5,.05,-4-i*4); d.rotation.y=Math.PI/2+.25; d.userData.walk(t*5+i,.5); d.userData.graze(0); } else if(k===5){ d.visible=true; d.position.set(-2.6+i*1.5-(i>2?1.5:0),0,-14-i*5); d.rotation.y=i*1.3; d.userData.walk(0,0); d.userData.graze(.5+.5*Math.sin(t*.9+i*2)); } else d.visible=false; });
 birds.forEach((b,i)=>{ b.visible=k!==1&&k!==0; const a=t*.25+i*.7; b.position.set(Math.cos(a)*(18+i*2),(k===4?70:k===6?40:28)+i*1.5,-50+Math.sin(a)*30); b.rotation.y=-a; b.userData.flap(Math.sin(t*8+i)*.6); });
 renderer.render(sc,cam);
 const seg=SEG[k]; $('title').style.opacity=(1-ss(SEG[0].lines[0].t+SEG[0].lines[0].d,SEG[0].lines[0].t+SEG[0].lines[0].d+.5,t))*ss(0,.3,t); $('n').textContent=seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 const dip=k>0?1-ss(0,.45,t-SH[k][0]):0, cd2=k===1?1-ss(0,.3,Math.abs(u-.55)*(SH[1][1]-SH[1][0])):0, fl=k===0?Math.exp(-(((t-tv)/.12)**2))*.55:0; $('fla').style.background=fl>0.01?'#fff':'#000'; $('fla').style.opacity=Math.max(dip*.75,cd2*.7,fl); $('fade').style.opacity=ss(DUR-.5,DUR,t); };
window.renderAt(0); window.ready=true;
