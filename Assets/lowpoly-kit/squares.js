import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, flat, shadow, ss, person, woman, skyDome, textSign, house } from './kit.js';
const TL=await (await fetch('/squares_timeline.json')).json(), SEG=TL.segments, R=rng(404), $=id=>document.getElementById(id), DUR=TL.duration, NS=SEG.length;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.05,5000), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf2e6d0,120,600); const sky=skyDome(sc,0x6aa0e8,0xf2e6d0);
const hemi=new THREE.HemisphereLight(0xf0f4ff,0x6a5a4a,1.5); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xfff0d8,1.7); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:300}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.06; sc.add(sunL); sc.add(sunL.target);
const composer=new EffectComposer(renderer); composer.setSize(1080,1920); composer.addPass(new RenderPass(sc,cam)); const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.25,.4,.9); composer.addPass(bloom); composer.addPass(new OutputPass());
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=(c,o={})=>new THREE.MeshBasicMaterial({color:c,...o});
// ---------- characters
const face=p=>{ const h=p.children[1], dk=flat(0x1a1210), f=(w,hh,x,y,m=dk)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.02),m); b.position.set(x,y,.18); h.add(b); return b; }; const br=[];
 for(const s of [-1,1]){ f(.065,.055,s*.085,.035); const w=f(.022,.02,s*.085+.012,.045,flat(0xffffff)); w.position.z=.192; br.push(f(.09,.025,s*.085,.095)); } p.userData.brows=br; p.userData.mouth=f(.09,.025,0,-.085,flat(0x6a3a30)); return p; };
const mood=(p,m)=>{ const rz={flat:0,sad:.4,happy:-.15,shock:-.1,calm:-.05}[m], my={flat:1,sad:1,happy:2.6,shock:3.2,calm:1.6}[m], mx={flat:1,sad:.7,happy:1.3,shock:.6,calm:1.2}[m]; p.userData.brows.forEach((q,i)=>{ q.rotation.z=(i?-1:1)*rz; }); p.userData.mouth.scale.set(mx,my,1); };
const arms=(p,a,b=a)=>{ p.children[5].rotation.set(a,0,0); p.children[6].rotation.set(b,0,0); };
const reset=p=>{ p.visible=true; p.rotation.set(0,0,0); p.userData.pose(0,0); arms(p,0); p.children[1].rotation.set(0,0,0); p.children[0].position.y=1.25; mood(p,'calm'); };
const hero=face(person({shirt:0xefc14d,pants:0x3a4a6a,hair:0x3a2418,skin:0xd9a27a})); sc.add(hero);
const spoon=bx(hero.children[6],.04,.04,.3,0xc8ccd2,0,-.78,.12); const slice=bx(hero.children[6],.3,.03,.3,0xe8b050,0,-.8,.18);
const eng=face(woman({shirt:0x3f78c4,pants:0x2a2f3a,hair:0x1a1a1a,skin:0x8a5a3a})); sc.add(eng); bx(eng.children[1],.42,.16,.42,0xefc14d,0,.24,0);
const kidsC=[0xd64f4f,0x4fa28f,0xb8a2e6,0xf09a4a,0x7ec4bc,0x5a6a7a];
const folk=[...Array(8)].map((_,i)=>{ const p=face((i%2?woman:person)({shirt:kidsC[i%6],pants:[0x2a2f3a,0x3a4a6a,0x5a4a3a][i%3],skin:[0xd9a27a,0x8a5a3a,0xe8c09a,0xb8805a][i%4],hair:[0x2a1a12,0x6a3a20,0x1a1a1a][i%3]})); sc.add(p); return p; });
const cubeTree=(p,x,z,s=1)=>{ const g=new THREE.Group(); g.position.set(x,0,z); g.scale.setScalar(s); p.add(g); bx(g,.4,2.2,.4,0x6b4a33,0,1.1,0); bx(g,2.4,2.4,2.4,[0x4f8a3a,0x5a9a48][Math.floor(x+z)&1],0,3.2,0); bx(g,1.4,1.4,1.4,0x5aa04a,.5,4.6,.3); return g; };
// ---------- world: street
const world=new THREE.Group(); sc.add(world);
bx(world,1200,.04,1200,0x8ab85a,0,-.05,0).castShadow=false; bx(world,300,.06,8,0x5a5c62,0,0,0).castShadow=false; for(let i=0;i<40;i++) bx(world,2,.02,.2,0xf2efe6,-120+i*6,.04,0).castShadow=false;
bx(world,300,.2,3,0xd8d0c4,0,.1,-5.5); bx(world,300,.2,3,0xd8d0c4,0,.1,5.5);
[0xf6b172,0xf2e6c8,0xa9b4d8,0xeaa985,0xd8e4ec,0xb8a2e6,0xf0a79d,0x7ec4bc].forEach((c,i)=>{ const h=house(c,[0x9a4f3a,0x4b5a78,0x6b4a3a][i%3]); h.position.set(-42+i*12,0,-13); world.add(h); });
for(let i=0;i<14;i++) cubeTree(world,-40+i*7,-7.6+(i%2)*.2,.7);
for(let i=0;i<20;i++) cubeTree(world,-80+R()*160,-30-R()*40,1+R()*.5);
const stop=new THREE.Group(); stop.position.set(4,.2,-5.6); world.add(stop); bx(stop,3,.1,1.3,0x2a6a64,0,2.5,0); for(const x of [-1.4,1.4]) bx(stop,.12,2.5,.12,0x6a6e78,x,1.25,-.5); const stopS=textSign('BUS',.8,.8,'#2a6a64','#ffffff'); stopS.position.set(1.8,2.9,.1); stop.add(stopS);
// square sun
const sun=new THREE.Mesh(new THREE.BoxGeometry(40,40,40),glowM(0xfff0a0)); sun.position.set(-160,180,-420); sc.add(sun);
// bus with square wheels
const bus=new THREE.Group(); world.add(bus); const body=new THREE.Group(); bus.add(body); bx(body,9,2.6,2.6,0xefc14d,0,1.9,0); bx(body,8.4,.9,2.64,0x9fc6d8,.2,2.4,0); bx(body,9.1,.3,2.7,0x3a3f49,0,.7,0);
const busW=[]; for(const x of [-3,3]) for(const z of [-1.3,1.3]){ const w=new THREE.Group(); w.position.set(x,0,z); bus.add(w); bx(w,1.1,1.1,.35,0x22262e,0,0,0); bx(w,.4,.4,.38,0x9aa4b0,0,0,0); busW.push(w); }
const riders=[0,1,2,3].map(i=>{ const h=new THREE.Group(); h.position.set(-2.4+i*1.7,2.35,1.36); body.add(h); bx(h,.36,.4,.36,[0xd9a27a,0x8a5a3a,0xe8c09a,0xb8805a][i],0,0,0); bx(h,.38,.12,.38,0x2a1a12,0,.22,0); return h; });
// ---------- interiors (bedroom + kitchen) far west
const room=new THREE.Group(); room.position.set(-300,0,0); sc.add(room); bx(room,10,.1,8,0xc8a878,0,-.05,0); bx(room,10,4,.2,0xf2e6c8,0,2,-4); bx(room,.2,4,8,0xe8d8c0,-5,2,0); bx(room,.2,4,8,0xe8d8c0,5,2,0);
const win=bx(room,2.4,1.6,.06,glowM(0xbfe2f2),-2.4,2.4,-3.88); const winSun=bx(room,.5,.5,.05,glowM(0xfff0a0),-2.0,2.7,-3.84);
const bed=new THREE.Group(); bed.position.set(-1.6,0,-1.6); room.add(bed); bx(bed,2,.5,3.2,0x9a6b42,0,.25,0); bx(bed,1.9,.25,3.1,0xf6f2ea,0,.62,0); bx(bed,1.9,.12,2,0x6a8ad8,0,.8,.5); bx(bed,.9,.2,.5,0xffffff,0,.85,-1.2); bx(bed,2,1.2,.15,0x9a6b42,0,.8,-1.6);
bx(room,.8,.7,.6,0x9a6b42,.2,.35,-2.6); const alarm=new THREE.Group(); alarm.position.set(.2,.95,-2.6); room.add(alarm); bx(alarm,.4,.4,.4,0xd64f4f,0,0,0); const aT=textSign('07:00',.34,.14,'#1a1a1e','#7fff9a'); aT.position.set(0,0,.21); alarm.add(aT); for(const s of [-1,1]) bx(alarm,.14,.08,.14,0xc8ccd2,s*.12,.25,0);
// kitchen part of same room (east half)
const table=new THREE.Group(); table.position.set(2.6,0,-1.6); room.add(table); bx(table,2.2,.12,1.4,0x9a6b42,0,1,0); for(const x of [-1,1]) for(const z of [-.6,.6]) bx(table,.1,1,.1,0x6b4a33,x,.5,z);
const pan=bx(table,.6,.06,.6,0x2a2c32,-.5,1.1,.1); bx(table,.4,.03,.4,0xffffff,-.5,1.15,.1); bx(table,.16,.04,.16,0xefc14d,-.5,1.17,.1);
const mug=new THREE.Group(); mug.position.set(.2,1.06,.3); table.add(mug); bx(mug,.24,.3,.24,0xd64f4f,0,.15,0); bx(mug,.2,.02,.2,0x5a3a20,0,.29,0); bx(mug,.06,.18,.12,0xd64f4f,.15,.15,0);
const bowl=new THREE.Group(); bowl.position.set(.7,1.06,-.1); table.add(bowl); bx(bowl,.44,.04,.44,0xf6f2ea,0,0,0); for(const s of [-1,1]){ bx(bowl,.44,.18,.04,0xf6f2ea,0,.1,s*.2); bx(bowl,.04,.18,.44,0xf6f2ea,s*.2,.1,0); } for(const [x,z] of [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]]) for(let i=0;i<3;i++) bx(bowl,.05,.04,.05,0xe8b050,x+(i-1)*.02,.05+i*.03,z);
const chair=new THREE.Group(); chair.position.set(2.6,0,-.4); room.add(chair); bx(chair,.6,.08,.6,0x9a6b42,0,.62,0); for(const x of [-.25,.25]) for(const z of [-.25,.25]) bx(chair,.06,.62,.06,0x6b4a33,x,.31,z);
const roomL=new THREE.PointLight(0xfff0d8,8,16); roomL.position.set(0,3.6,0); room.add(roomL);
// factory far east
const fac=new THREE.Group(); fac.position.set(300,0,0); sc.add(fac); bx(fac,24,.1,16,0x9aa0a8,0,-.05,0); bx(fac,24,7,.2,0xd8dce0,0,3.5,-8); bx(fac,.2,7,16,0xc8ccd2,-12,3.5,0);
for(let i=0;i<4;i++){ const g=bx(fac,1.8,1.8,.2,0x9aa4b0,-8+i*2.4,4.2,-7.8); g.rotation.z=i*.3; bx(fac,.5,.5,.22,0x6a7a8a,-8+i*2.4,4.2,-7.78); } const gearS=textSign('GEARS (OUT OF ORDER)',4.5,.6,'#d64f4f','#ffffff'); gearS.position.set(-4.4,6,-7.85); fac.add(gearS);
const fan=bx(fac,2.4,.06,2.4,0x6a7a8a,2,6.6,-2); bx(fac,.1,1,.1,0x6a7a8a,2,7.1,-2);
const crates=[...Array(6)].map((_,i)=>bx(fac,.9,.9,.9,0xc8a070,0,.45,0)); const facL=new THREE.PointLight(0xfff0d8,10,30); facL.position.set(0,6,0); fac.add(facL);
// sports field north
const pitch=new THREE.Group(); pitch.position.set(0,0,-120); sc.add(pitch); bx(pitch,40,.05,26,0x5aa03a,0,.01,0).castShadow=false; bx(pitch,.2,.02,26,0xffffff,0,.05,0); const goal=new THREE.Group(); goal.position.set(-18,0,0); pitch.add(goal); bx(goal,.15,2.4,.15,0xffffff,0,1.2,-3.5); bx(goal,.15,2.4,.15,0xffffff,0,1.2,3.5); bx(goal,.15,.15,7.1,0xffffff,0,2.4,0); bx(goal,.02,2.4,7,new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true}),-1,1.2,0);
const ball=new THREE.Group(); pitch.add(ball); const bMesh=bx(ball,.5,.5,.5,0xf6f6f2,0,0,0); for(const f of [[.26,0,0],[-.26,0,0],[0,.26,0],[0,-.26,0],[0,0,.26],[0,0,-.26]]) bx(ball,f[0]?.02:.22,f[1]?.02:.22,f[2]?.02:.22,0x1a1a1e,...f);
const gBall=new THREE.Group(); pitch.add(gBall); bx(gBall,.5,.5,.5,0xf6f6f2,0,.25,0); gBall.position.set(-17,0,0);
// café with square pizza (south side of street)
const cafe=new THREE.Group(); cafe.position.set(16,0,9); world.add(cafe); bx(cafe,10,4.5,6,0x7ec4bc,0,2.25,3); bx(cafe,10.4,.3,2,0xd64f4f,0,3,-.4); const cs=textSign('PIZZA',3,.8,'#d64f4f','#ffffff'); cs.position.set(0,3.9,-.05); cs.rotation.y=Math.PI; cafe.add(cs);
const ctab=new THREE.Group(); ctab.position.set(0,.2,-2.2); cafe.add(ctab); bx(ctab,1.4,.08,1.4,0xf6f2ea,0,.95,0); bx(ctab,.12,.95,.12,0x6a6e78,0,.48,0); const box_=bx(ctab,.9,.06,.9,0xd8b888,0,1.02,0); const pizza=new THREE.Group(); pizza.position.set(0,1.07,0); ctab.add(pizza); bx(pizza,.8,.04,.8,0xe8b050,0,0,0); bx(pizza,.72,.02,.72,0xd64f4f,0,.03,0); for(let i=0;i<9;i++) bx(pizza,.1,.02,.1,[0xf6f2ea,0x8a3a2a][i%2],-.25+(i%3)*.25,.05,-.25+Math.floor(i/3)*.25);
const lid=bx(ctab,.9,.04,.9,0xd8b888,.47,1.5,0); lid.rotation.z=Math.PI/2;
// catenary road + square-wheel trike (east of town)
const A=.5, L=2*A*Math.asinh(1), roadX0=40, NB=40; const prof=new THREE.Shape(); prof.moveTo(0,-.2); for(let b=0;b<NB;b++) for(let j=0;j<=12;j++){ const s=-L/2+L*j/12; prof.lineTo(b*L+s+L/2,A*Math.SQRT2-A*Math.cosh(s/A)); } prof.lineTo(NB*L,-.2); prof.lineTo(0,-.2);
const rg=new THREE.ExtrudeGeometry(prof,{depth:2.4,bevelEnabled:false}); const road=shadow(new THREE.Mesh(rg,flat(0x8a8e96))); road.position.set(roadX0,.02,20); world.add(road);
const trike=new THREE.Group(); world.add(trike); const tW=[]; for(const [x,z] of [[0,.4],[0,2],[1.6,1.2]]){ const w=new THREE.Group(); w.position.set(x,0,z); trike.add(w); bx(w,2*A,2*A,.12,0xd64f4f,0,0,0); bx(w,.15,.15,.16,0x2a2c32,0,0,0); tW.push(w); } bx(trike,.12,.12,1.8,0x2a2c32,0,0,1.2); bx(trike,1.7,.1,.1,0x2a2c32,.8,.4,1.2); bx(trike,.5,.12,.4,0x1a1a1e,.2,.75,1.2); bx(trike,.1,.9,.1,0x2a2c32,1.5,.45,1.2);
const realS=textSign('THIS IS REAL',3,.6,'#3f78c4','#ffffff'); realS.position.set(roadX0+12,3,19.5); world.add(realS);
// ======================= timeline
const SH=[]; SEG.forEach((s,i)=>{ const a=i?s.start:0, b=i<NS-1?SEG[i+1].start:DUR; SH.push([a,b]); }); window.SHOTS=SH; window.DURATION=DUR;
const P=(a,b,c,d,u)=>{ cam.position.lerpVectors(V(...a),V(...b),u); cam.lookAt(V(...c).lerp(V(...(d||c)),u)); };
const LOOK={ morn:[0x7aa0e0,0xf8d8b0,[-160,90,140],0xffe0b8,1.5,1.3,0xf2dcc0,'saturate(1.05)'], day:[0x6aa0e8,0xf2e6d0,[-120,140,120],0xfff0d8,1.7,1.5,0xf2e6d0,'saturate(1.08)'], gold:[0x6a8ad8,0xf8d0a0,[180,60,140],0xffd8a0,1.6,1.3,0xf0d0b0,'saturate(1.05)'], indoor:[0x6aa0e8,0xf2e6d0,[-120,140,120],0xfff0d8,.6,1.3,0xf2e6d0,'saturate(1.05)'] };
const sqH=(phi,a)=>{ const m=((phi+Math.PI/4)%(Math.PI/2)+Math.PI/2)%(Math.PI/2)-Math.PI/4; return a/Math.cos(m); };
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=NS-1; const T0=SH[k][0], u=(t-T0)/(SH[k][1]-T0), sub=(a,b)=>ss(0,1,(u-a)/(b-a));
 let lk='day', busOn=false, busX=0, ring=0, crateMode=0, ballX=null, trikeX=null, lidOpen=0;
 [hero,eng].forEach(reset); eng.visible=false; folk.forEach(p=>{ reset(p); p.visible=false; }); spoon.visible=false; slice.visible=false; hero.position.set(0,0,0);
 switch(k){
 case 0: { if(u<.4){ lk='morn'; hero.visible=false; const q=sub(0,.4); P([-20,46,70],[-6,14,30],[-80,60,-200],[-20,10,-40],q); } else { lk='indoor'; ring=1; const q=sub(.4,1); hero.position.set(-301.6,.62,-2.4); hero.userData.sit(); hero.children[0].position.y=1.25; hero.rotation.y=.3; hero.children[1].rotation.y=lg(0,.7,ss(.2,.4,q))-lg(0,1.2,ss(.6,.8,q)); mood(hero,q<.3?'flat':q<.6?'shock':'sad'); P([-298.6,1.9,1.6],[-299,1.8,1],[-300.6,1.3,-2.3],[-300.6,1.4,-2.6],q); } } break;
 case 1: { lk='indoor'; const q=u; hero.position.set(-297.4,.06,-.75); hero.userData.sit(); hero.children[0].position.y=1.25; hero.rotation.y=Math.PI; spoon.visible=true; arms(hero,-.2,-1.2+Math.sin(t*4)*.15); hero.children[1].rotation.x=.3; mood(hero,q<.5?'flat':'sad'); if(q<.45) P([-297.6,2.2,-3.6],[-297.4,2.1,-3.5],[-297.4,1.3,-1],[-297.4,1.3,-1],q/.45); else P([-296.6,1.75,-2.6],[-296.7,1.7,-2.4],[-297.2,1.1,-1.55],[-297.2,1.1,-1.55],(q-.45)/.55); } break;
 case 2: { busOn=true; const q=u; busX=lg(-24,14,q); if(q<.55){ P([busX+10,2.4,13],[busX+10,2.4,13],[busX-1,1.6,1.8],[busX-1,1.6,1.8],0); } else { P([busX+1,1.9,8.4],[busX+1,1.9,8.4],[busX-1.5,1.6,1.8],[busX-1.5,1.6,1.8],0); } hero.visible=false; } break;
 case 3: { crateMode=1; hero.visible=false; folk.slice(0,4).forEach((p,i)=>{ p.visible=true; const x=lg(-6,6,((t*.12+i*.25)%1)); p.position.set(300+x-1.1,0,-1+i*1.4); p.rotation.y=Math.PI/2; p.userData.pose(t*4+i,.35); arms(p,-1.3); p.children[0].rotation.x=.25; mood(p,i%2?'flat':'sad'); crates[i].position.set(x,.45,-1+i*1.4); }); P([306,3.4,7],[304,3,6],[300,2.4,-3],[300,3,-4],u); } break;
 case 4: { hero.visible=false; const q=u; if(q<.55){ const r=sub(0,.55); ballX=lg(-3,-12,r); folk.slice(0,4).forEach((p,i)=>{ p.visible=true; p.position.set(lg(-2,-10,r)+i*1.2+(i%2)*.4,0,-120+(i-1.5)*1.6); p.rotation.y=-Math.PI/2; p.userData.pose(t*8+i,.6); arms(p,-.6+Math.sin(t*9+i)*.5); mood(p,'shock'); }); P([0,3,-108],[-4,3,-109],[-6,.6,-120],[-9,.6,-120],r); } else { const r=sub(.55,1); const gk=folk[5]; gk.visible=true; gk.userData.sit(); gk.position.set(-17,.02,-120); gk.rotation.y=Math.PI/2; gk.children[0].position.y=1.25; arms(gk,-.4,-.4); mood(gk,'calm'); gk.children[1].rotation.y=Math.sin(t*.8)*.3; P([-12.6,1.8,-116.4],[-13.2,1.7,-117],[-17,1,-120],[-17,1.1,-120],r); } } break;
 case 5: { const q=u; lidOpen=1; hero.position.set(16.6,0,7.6); hero.rotation.y=Math.PI+.6; slice.visible=q>.35; arms(hero,0,q>.35?-1.2:-.4); mood(hero,'happy'); P([13.4,1.9,4.2],[13.8,1.85,4.6],[16.2,1.2,6.8],[16.2,1.3,6.8],q); } break;
 case 6: { const q=u; eng.visible=true; trikeX=lg(roadX0+1,roadX0+20,q); hero.position.set(roadX0+lg(14,15,q),0,23.4); hero.rotation.y=Math.PI*.85; mood(hero,q<.4?'shock':'happy'); arms(hero,q>.5?-2.6:0,q>.5?-2.6:0); if(q<.5) P([trikeX+1.2,2,28],[trikeX+1.4,1.9,27],[trikeX+1,1,21],[trikeX+1,1,21],sub(0,.5)); else P([trikeX-1,1.3,25.4],[trikeX-.6,1.2,25.2],[trikeX+.6,.7,21],[trikeX+.6,.7,21],sub(.5,1)); } break;
 case 7: { lk='gold'; busOn=true; busX=lg(-10,20,u); hero.position.set(2,.2,-5.4); mood(hero,'happy'); arms(hero,-.3,-2.6+Math.sin(t*5)*.3); hero.rotation.y=.2; P([3.6,2,1.2],[30,40,50],[2,1.5,-5],[0,3,-10],ss(.25,1,u)); } break; }
 // ---- states
 alarm.position.x=.2+(ring?Math.sin(t*60)*.03:0); alarm.rotation.z=ring?Math.sin(t*50)*.08:0; aT.visible=Math.sin(t*6)>-.3;
 bus.visible=busOn; if(busOn){ const phi=(busX/(2*.55))*Math.PI/2; const h=sqH(phi,.55); bus.position.set(busX,0,1.8); busW.forEach(w=>{ w.position.y=h; w.rotation.z=-phi; }); body.position.y=h-.55; body.rotation.z=Math.sin(phi*4)*.03; riders.forEach((r,i)=>{ r.position.y=2.3+Math.abs(Math.sin(phi*2+i))*.12; r.rotation.z=Math.sin(phi*2+i)*.2; }); }
 crates.forEach((c,i)=>c.visible=crateMode&&i<4);
 ball.visible=ballX!==null; if(ballX!==null){ const a=.25, phi=((-ballX-3)/(2*a))*Math.PI/2; ball.position.set(ballX,sqH(phi,a)+Math.abs(Math.sin(phi*2))*.25,0); ball.rotation.z=phi; }
 gBall.visible=k===4;

 trike.visible=trikeX!==null; if(trikeX!==null){ const x=trikeX-roadX0; const tw=(x,w)=>{ const n=Math.floor(x/L), s=x-n*L-L/2; w.rotation.z=-(n*Math.PI/2+Math.atan(Math.sinh(s/A))); w.position.y=A*Math.SQRT2; }; trike.position.set(trikeX,.02,20); tW.forEach(w=>tw(x+w.position.x,w)); eng.userData.sit(); eng.position.set(trikeX+.2,.02+A*Math.SQRT2+.05-.15,21.2); eng.rotation.y=Math.PI/2; eng.children[0].position.y=1.25; arms(eng,-1.3,-1.3); mood(eng,'happy'); }
 // ---- look
 const L_=LOOK[lk]; sky.top.value.set(L_[0]); sky.low.value.set(L_[1]); sc.fog.color.set(L_[6]); sunL.position.set(...L_[2]).add(cam.position); sunL.target.position.copy(cam.position); sunL.color.set(L_[3]); sunL.intensity=L_[4]; hemi.intensity=L_[5]; $('c').style.filter=L_[7];
 composer.render();
 // ---- HUD
 const seg=SEG[k]; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 const dip=k>0?1-ss(0,.45,t-SH[k][0]):0; $('fla').style.background='#000'; $('fla').style.opacity=dip*.7; $('fade').style.opacity=ss(DUR-.8,DUR,t); };
window.renderAt(0); window.ready=true;
