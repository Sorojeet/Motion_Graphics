import * as THREE from 'three';
import { rng, flat, shadow, ss, person, car, lamp, skyDome, softSun, tower, roundTree, textSign } from './kit.js';
const TL=await (await fetch('/tenmin_timeline.json')).json(), EV=TL.events, R=rng(1010), $=id=>document.getElementById(id), DUR=TL.duration;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.05,2000), D=new THREE.Object3D(), C=h=>new THREE.Color(h), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0x2a3050,40,220); const sky=skyDome(sc,0x1c2450,0xd08868);
const hemi=new THREE.HemisphereLight(0xb8c4ff,0x2a2028,1); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xffc8a0,1); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:200}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.05; sc.add(sunL); sc.add(sunL.target);
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=c=>new THREE.MeshBasicMaterial({color:c});
const SHIRT=0x3f78c4; const hero=person({shirt:SHIRT,pants:0x2a2f3a,hair:0x2a1a10}); sc.add(hero);
const face=(p,{brow=0x1a1210,smile=false}={})=>{ const h=p.children[1], dk=flat(0x1a1210), f=(w,hh,x,y,m=dk)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.02),m); b.position.set(x,y,.18); h.add(b); return b; };
 for(const s of [-1,1]){ f(.065,.055,s*.085,.035); const w=f(.022,.02,s*.085+.012,.045,flat(0xffffff)); w.position.z=.192; f(.09,.025,s*.085,.095,flat(brow)); }
 if(smile){ f(.11,.028,0,-.085,flat(0x5a2420)); for(const s of [-1,1]){ const e=f(.045,.028,s*.07,-.068,flat(0x5a2420)); e.rotation.z=s*.55; } } else f(.09,.025,0,-.085,flat(0x6a3a30)); };
face(hero); const A=i=>hero.children[i]; // 3 L leg, 4 R leg, 5 L arm, 6 R arm
const phone=new THREE.Group(); bx(phone,.17,.32,.03,0x1a1c22,0,0,0); const scr=new THREE.Mesh(new THREE.PlaneGeometry(.14,.27),glowM(0x0c0e14)); scr.position.z=.017; phone.add(scr); const phL=new THREE.PointLight(0x8fb8ff,0,4); phL.position.z=.3; phone.add(phL);
// ======================= SET A: apartment
const setA=new THREE.Group(); sc.add(setA);
bx(setA,8,.1,8,0x4a3a32,0,-.05,0); bx(setA,8,.1,8,0x2a2c34,0,3.25,0); for(const [w,d,x,z] of [[8,.2,0,-4.1],[8,.2,0,4.1],[.2,8,-4.1,0],[.2,8,4.1,0]]) bx(setA,w,3.3,d,0x4f5670,x,1.6,z);
const win=bx(setA,1.9,1.5,.05,glowM(0x6a7ab8),1.2,1.9,-3.98); bx(setA,2.1,.12,.12,0x22242c,1.2,2.7,-3.95); bx(setA,2.1,.12,.12,0x22242c,1.2,1.1,-3.95); bx(setA,.08,1.5,.08,0x22242c,1.2,1.9,-3.95); for(const s of [-1,1]) bx(setA,.5,2.4,.1,0x5a3a4a,1.2+s*1.3,1.8,-3.9);
bx(setA,2.2,.45,3.4,0x5a4a3a,2.6,.25,-1.6); bx(setA,2.05,.25,3.2,0xe8e4dc,2.6,.58,-1.6); bx(setA,1,.18,.55,0xf4f2ee,2.6,.79,-2.9); const blanket=bx(setA,2.1,.22,2.1,0x3f5a8a,2.6,.82,-.5); bx(setA,2.2,1.1,.15,0x5a4a3a,2.6,.8,-3.3);
bx(setA,.8,.6,.7,0x6b5040,.95,.3,-3.25); const lampB=bx(setA,.3,.4,.3,0xe8dcc0,.85,.8,-3.35);
const doorP=new THREE.Group(); doorP.position.set(-3.95,0,1.7); setA.add(doorP); const door=bx(doorP,.08,2.15,1.05,0x6b4a33,0,1.075,-.53); bx(doorP,.1,.06,.06,0x111111,.05,1.62,-.53); bx(doorP,.14,.08,.22,0xc8b070,.08,1.05,-.9); bx(setA,.12,2.3,.12,0x2a2c34,-3.97,1.15,1.72); bx(setA,.12,2.3,.12,0x2a2c34,-3.97,1.15,.6); bx(setA,.12,.12,1.25,0x2a2c34,-3.97,2.25,1.15);
bx(setA,.06,.06,.25,0x888888,-3.95,1.4,2.3); const keys=bx(setA,.05,.18,.12,0xd8b04a,-3.9,1.28,2.3);
bx(setA,1.6,.9,.7,0x2a3a4a,-1.4,.45,-3.5); bx(setA,2.4,.12,.9,0x4a3a32,-2.6,.75,3.4); const rug=bx(setA,3,.02,2,0x6a3a4a,0,.01,1); rug.castShadow=false;
const fillA=new THREE.PointLight(0xffd8b0,6,12); fillA.position.set(-1,2.8,1.5); setA.add(fillA); const winL=new THREE.DirectionalLight(0x8a9ad8,1.4); winL.position.set(1.2,3,-6); winL.target.position.set(1.5,0,1); setA.add(winL); setA.add(winL.target); winL.castShadow=true; winL.shadow.mapSize.set(1024,1024); Object.assign(winL.shadow.camera,{left:-6,right:6,top:6,bottom:-6});
// ======================= SET B: hallway (peephole view)
const setB=new THREE.Group(); sc.add(setB);
bx(setB,3.4,.1,26,0x3a2a2a,0,-.05,12); bx(setB,3.4,.1,26,0xd8d0c0,0,3.05,12); for(const x of [-1.75,1.75]) bx(setB,.2,3.1,26,0xb8a890,x,1.5,12); bx(setB,3.4,3.1,.2,0x9a8a74,0,1.5,24.6); bx(setB,1.4,.02,24,0x7a2a32,0,.02,12);
[[4,-1],[7.5,1],[11,-1],[14.5,1],[18,-1]].forEach(([z,sd],i)=>{ bx(setB,.1,2.2,1.1,0x6b4a33,sd*1.63,1.1,z); const n=textSign(String(402+i*2),.45,.22,'#c8b070','#3a2a1a',{px:150}); n.position.set(sd*1.6,1.85,z); n.rotation.y=-sd*Math.PI/2; setB.add(n); });
const hLamps=[3,9,15,21].map(z=>{ const m=bx(setB,.8,.08,.8,glowM(0xfff0c8),0,3,z); const l=new THREE.PointLight(0xffe0b0,7,9); l.position.set(0,2.7,z); setB.add(l); return [m,l]; });
const exitB=textSign('EXIT',1,.4,'#1f7a3a','#ffffff'); exitB.position.set(0,2.6,24.45); exitB.rotation.y=Math.PI; setB.add(exitB);
// ======================= SET C: stairwell
const setC=new THREE.Group(); sc.add(setC); const conc=0x8a8e96; const shaft=new THREE.Mesh(new THREE.BoxGeometry(10.4,16,4.6),new THREE.MeshLambertMaterial({color:0x6a6e78,side:THREE.BackSide})); shaft.position.y=7; setC.add(shaft);
const PATH=[]; for(let f=0;f<3;f++){ const y0=9.6-f*3.2; for(let i=0;i<8;i++){ bx(setC,.9,.2,1.8,conc,3.1-i*.9,y0-.2-i*.2,-1); bx(setC,.9,.2,1.8,conc,-3.1+i*.9,y0-1.8-i*.2,1); } bx(setC,1.6,.2,4.2,conc,-4.3,y0-1.7,0); bx(setC,1.6,.2,4.2,conc,4.3,y0-.1,0); bx(setC,7.2,.9,.06,0x3a3f49,0,y0-1.2,0);
 PATH.push(V(4.3,y0,-1),V(3.5,y0,-1),V(-3.5,y0-1.6,-1),V(-4.3,y0-1.6,-1),V(-4.3,y0-1.6,1),V(-3.5,y0-1.6,1),V(3.5,y0-3.2,1),V(4.3,y0-3.2,1)); }
bx(setC,1.6,.2,4.2,conc,4.3,-.1,0); PATH.push(V(4.6,0,0)); const CL=[0]; for(let i=1;i<PATH.length;i++) CL.push(CL[i-1]+PATH[i].distanceTo(PATH[i-1]));
const along=s=>{ s=Math.max(0,Math.min(CL.at(-1),s)); let i=CL.findIndex(c=>c>=s); if(i<1)i=1; const u=(s-CL[i-1])/(CL[i]-CL[i-1]||1); return [PATH[i-1].clone().lerp(PATH[i],u),PATH[i].clone().sub(PATH[i-1]).normalize()]; };
for(let f=0;f<4;f++){ const y=9.6-f*3.2+2.6; bx(setC,.8,.12,.8,glowM(0xe8f0ff),4.3,y,0); bx(setC,.8,.12,.8,glowM(0xe8f0ff),-4.3,y-1.6,0); const n=textSign(String(4-f),.6,.6,'#d64f4f','#ffffff'); n.position.set(5.15,9.6-f*3.2+1.4,0); n.rotation.y=-Math.PI/2; setC.add(n); }
const exitC=textSign('EXIT',1,.4,'#1f7a3a','#ffffff'); exitC.position.set(5.15,2.4,1.2); exitC.rotation.y=-Math.PI/2; setC.add(exitC);
const cL=[0,1,2].map(i=>{ const l=new THREE.PointLight(0xdfe8ff,10,10); l.position.set(i%2?-3:3,9-i*4,0); setC.add(l); return l; }); const redL=new THREE.PointLight(0xff3030,0,14); redL.position.set(0,6,0); setC.add(redL);
// ======================= SET D: street & building
const setD=new THREE.Group(); sc.add(setD);
bx(setD,400,.04,400,0x2a2e36,0,-.04,0).castShadow=false; bx(setD,400,.06,9,0x22242a,0,.01,9).castShadow=false; bx(setD,400,.2,8,0x6a6a70,0,.1,0);
const dash=new THREE.InstancedMesh(new THREE.BoxGeometry(2.4,.02,.18),glowM(0xc8c4b8),40); for(let i=0;i<40;i++){ D.position.set(-100+i*5,.05,9); D.updateMatrix(); dash.setMatrixAt(i,D.matrix); } setD.add(dash);
const bld=new THREE.Group(); bld.position.z=-9; setD.add(bld); bx(bld,18,16.4,10,0xb8a690,0,8.2,0); bx(bld,18.6,.6,10.6,0x8a7a68,0,16.6,0); bx(bld,18.1,.3,10.1,0x8a7a68,0,3.2,0);
const winsD=[]; for(let r=0;r<5;r++) for(let c=0;c<5;c++){ const x=-7.2+c*3.6, y=1.8+r*3.2; if(r===0&&c===2) continue; const lit=R()<.35, m=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.6,.1),glowM(lit?0xf2c86a:0x2a3448)); m.position.set(x,y,5.03); bld.add(m); winsD.push({m,lit,r,c}); bx(bld,2,.15,.3,0x8a7a68,x,y-.88,5.1); }
const myWin=winsD.find(w=>w.r===3&&w.c===1); myWin.m.material=glowM(0xf2c86a); const WP=V(-3.6,1.8+3*3.2,-9+5.1); // his window, world space
bx(bld,2.4,2.6,.15,0x3a3f49,0,1.3,5.05); bx(bld,3.4,.2,1.6,0x6a6e78,0,2.9,5.7); const doorGlow=bx(bld,2.1,2.3,.05,glowM(0xd8e0f0),0,1.2,5.13);
const ent=textSign('ELM COURT',3,.6,'#2a2f3a','#e8dcc0'); ent.position.set(0,3.4,6.5); bld.add(ent);
for(const s of [-1,1]){ const t=tower(R,s*22,-12,12,18+R()*10,12,s<0?0x8a9ab8:0xa8908a); setD.add(t); }
for(let i=0;i<6;i++){ const l=lamp(flat(0x2a2c32),glowM(0xffd890)); l.position.set(-25+i*10,.2,3.6); setD.add(l); const pl=new THREE.PointLight(0xffc880,6,12); pl.position.set(-25+i*10,7.6,4.2); setD.add(pl); }
[[-9,11.5,0xd64f4f],[7,11.5,0x3f78c4],[15,6.5,0xefc14d]].forEach(([x,z,c])=>{ const k=car(c); k.position.set(x,0,z); k.rotation.y=Math.PI/2; setD.add(k); });
for(let i=0;i<5;i++){ const t=roundTree(R,[flat(0x2c5a3d),flat(0x355f40)],flat(0x4a3a2a),.9); t.position.set(-30+i*15+R()*3,0,-3.2); if(Math.abs(t.position.x)<11) t.position.x+=t.position.x<0?-12:12; setD.add(t); }
const fireL=new THREE.PointLight(0xff7a2a,0,60); fireL.position.copy(WP).add(V(0,0,2.5)); setD.add(fireL); const fireIn=bx(setD,1.8,1.6,.05,glowM(0xff8a2a),WP.x,WP.y,WP.z-.02); fireIn.visible=false;
const fb=[...Array(7)].map((_,i)=>{ const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshBasicMaterial({color:[0xfff2a0,0xffc040,0xff7a20,0xff5a10][i%4],transparent:true,depthWrite:false,fog:false})); m.userData.o=V((R()-.5)*2,(R()-.5)*1.4,R()*1.4); setD.add(m); return m; });
const NS=70, smoke=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshLambertMaterial({color:0x2a2a2e,transparent:true,opacity:.8,depthWrite:false}),NS); smoke.frustumCulled=false; setD.add(smoke); const sd=[...Array(NS)].map(()=>[R(),R(),R(),R()]);
const deb=[...Array(40)].map(()=>{ const m=bx(setD,.2+R()*.5,.15+R()*.3,.2+R()*.4,[0xb8a690,0x6b4a33,0x3a3f49,0x8a7a68][Math.floor(R()*4)],0,0,0); m.userData.v=V((R()-.5)*14,4+R()*9,3+R()*10); m.userData.r=V(R()*8,R()*8,R()*8); return m; });
const old=person({shirt:0x355f9a,pants:0x2a2f3a,hair:0xc8c8c4,skin:0xc89a7a}); old.userData.beard.visible=true; old.userData.beard.position.y=1.62; old.userData.beard.scale.set(1.05,.9,1); face(old,{brow:0xd8d8d4,smile:true}); setD.add(old); bx(old,.62,.75,.36,0x2a2c34,0,1.22,-.03).material.transparent=false; // dark coat over the same blue shirt
// ======================= timeline
const SH=[[0,EV.wake],[EV.wake,EV.n1+1.6],[EV.n1+1.6,EV.knock],[EV.knock,EV.knock+1.3],[EV.knock+1.3,EV.peep],[EV.peep,EV.n3],[EV.n3,EV.run],[EV.run,EV.run+2.8],[EV.run+2.8,EV.ground],[EV.ground,EV.boom+.35],[EV.boom+.35,EV.kneel],[EV.kneel,EV.n4],[EV.n4,EV.turn],[EV.turn,EV.reveal],[EV.reveal,EV.black],[EV.black,DUR]];
window.SHOTS=SH.map(s=>[...s]); window.SHOTS[0][0]=0; window.DURATION=DUR;
const P=(a,b,c,d,u)=>{ cam.position.lerpVectors(V(...a),V(...b),u); cam.lookAt(V(...c).lerp(V(...(d||c)),u)); };
const shake=(t,a,f=1)=>{ cam.position.x+=a*(Math.sin(t*7.3*f)+.5*Math.sin(t*13.1*f+1)); cam.position.y+=a*(Math.sin(t*9.7*f+2)+.4*Math.sin(t*17.3*f)); cam.rotation.z+=a*.12*Math.sin(t*5.1*f+.5); };
const resetHero=()=>{ hero.rotation.set(0,0,0); hero.position.set(0,0,0); hero.userData.pose(0,0); [3,4,5,6].forEach(i=>A(i).rotation.set(0,0,0)); hero.children[1].rotation.set(0,0,0); hero.children[1].position.set(0,1.82,0); hero.children[2].position.set(0,2,0); hero.children[0].rotation.set(0,0,0); if(phone.parent) phone.parent.remove(phone); };
const holdPhone=(arm=6,raise=1.25)=>{ A(arm).rotation.x=-raise; A(arm).add(phone); phone.position.set(0,-.72,.06); phone.rotation.set(-Math.PI/2+raise-.25,0,0); };
const kneel=()=>{ hero.position.y=-.55; A(3).rotation.x=A(4).rotation.x=1.25; };
window.renderAt=t=>{ const k=Math.max(0,SH.findIndex(s=>t<s[1])===-1?SH.length-1:SH.findIndex(s=>t<s[1])), u=(t-SH[k][0])/(SH[k][1]-SH[k][0]), su=ss(0,1,u);
 const set=k===0||k>=9?'D':k===5?'B':k===7||k===8?'C':'A'; setA.visible=set==='A'; setB.visible=set==='B'; setC.visible=set==='C'; setD.visible=set==='D'; resetHero(); hero.visible=true; cam.fov=50; cam.rotation.z=0;
 // ambience per set
 if(set==='A'){ sc.fog.near=100; sc.fog.far=300; hemi.color.set(0x8a9ad8); hemi.groundColor.set(0x2a2028); hemi.intensity=1.25; sunL.intensity=0; }
 if(set==='B'){ sc.fog.near=6; sc.fog.far=40; sc.fog.color.set(0x1a1410); hemi.color.set(0xffe0b0); hemi.intensity=.35; sunL.intensity=0; hLamps.forEach(([m,l],i)=>{ const f=(Math.sin(t*37+i*3)>.55&&i===2)?.15:1; l.intensity=8*f; m.material.color.set(f<1?0x3a3020:0xfff0c8); }); }
 if(set==='C'){ sc.fog.near=4; sc.fog.far=30; sc.fog.color.set(0x14161c); hemi.color.set(0xdfe8ff); hemi.intensity=.4; sunL.intensity=0; redL.intensity=2+1.5*Math.sin(t*9); hemi.intensity=.9; sky.top.value.set(0x0c0d12); sky.low.value.set(0x0c0d12); }
 if(set==='D'){ sc.fog.near=40; sc.fog.far=220; sc.fog.color.set(0x5a4a5a); sky.top.value.set(0x1c2450); sky.low.value.set(0xd08868); hemi.color.set(0x9aa8e8); hemi.groundColor.set(0x3a2a28); hemi.intensity=.75; sunL.intensity=.7; sunL.color.set(0xffb890); sunL.position.set(-40,25,40); sunL.target.position.set(0,0,0); }
 const lit=TL.notes.some(n=>t>=n.t&&t<n.t+2.6); scr.material.color.set(lit?0xbfd8ff:0x0c0e14); phL.intensity=lit?2.2:0;
 // ---- shots
 switch(k){
 case 0: hero.visible=false; P([10,3,34],[-1.2,9.4,6],[-2,8,-6],[-3.6,10.2,-4],ss(0,1,u)); break;
 case 1: hero.rotation.x=-Math.PI/2; hero.position.set(2.6,.87,-1.03); hero.children[1].rotation.y=lg(0,.5,ss(.55,.8,u)); setA.add(phone); phone.position.set(.75,.62,-3.15); phone.rotation.set(-Math.PI/2,0,.3); P([.3,2.7,1.4],[.8,2.35,.3],[2.4,.7,-2.4],[2.4,.75,-2.6],su); break;
 case 2: { hero.userData.sit(); hero.position.set(2.6,-.06,-2.35); holdPhone(6,1.15); A(5).rotation.x=-.3; const laugh=ss(.25,.35,u)*(1-ss(.45,.55,u)); hero.children[1].rotation.x=-.35*laugh; hero.children[0].position.y+=.03*Math.sin(t*28)*laugh; const fr=t>EV.n2?ss(0,.4,t-EV.n2):0; hero.children[1].rotation.x+=.18*fr; P([.2,1.55,.4],[.9,1.45,-.6],[2.6,1.25,-2.3],[2.6,1.3,-2.4],su); shake(t,.004); break; }
 case 3: hero.userData.sit(); hero.position.set(2.6,-.06,-2.35); hero.children[1].rotation.y=lg(0,1.2,ss(0,.35,u)); holdPhone(6,.8); const kn=[0,.55,1.1].some(o=>t-EV.knock>o&&t-EV.knock<o+.12); doorP.rotation.y=kn?.006:0; P([3.4,1.9,2.6],[3.2,1.9,2.2],[-3.9,1.3,1.1],[-3.9,1.3,1.1],su); if(kn) shake(t,.012,3); break;
 case 4: hero.position.set(-3.45,0,1.15); hero.rotation.y=-Math.PI/2; hero.children[0].rotation.x=0; hero.children[1].position.x=0; hero.rotation.z=0; hero.children[1].rotation.x=.1; A(5).rotation.x=-.9; A(5).rotation.z=-.3; P([-1.2,1.75,2.9],[-1.8,1.75,2.4],[-3.9,1.6,1.1],[-3.9,1.6,1.1],su); break;
 case 5: hero.visible=false; cam.fov=112; cam.position.set(0,1.6,.3); cam.lookAt(lg(-.5,.4,su),1.35,12); break;
 case 6: { const g=ss(.25,.45,u); hero.position.set(-3.4,0,lg(1.15,1.75,g)); hero.rotation.y=lg(-Math.PI/2,-Math.PI/2+.5,g); A(6).rotation.x=-.9*ss(.3,.45,u)*(1-ss(.55,.7,u)); keys.visible=u<.5; holdPhone(5,.9); doorP.rotation.y=-1.3*ss(.72,.95,u); P([.6,1.7,3.3],[-.2,1.65,3],[-3.6,1.4,1.3],[-3.8,1.4,1.2],su); shake(t,.02,1.4); break; }
 case 7: case 8: { const tot=EV.ground-EV.run, s=(t-EV.run)/tot*CL.at(-1); const [p,d]=along(s); hero.position.copy(p); hero.rotation.y=Math.atan2(d.x,d.z); hero.userData.pose(t*13,.85); if(k===7){ cam.fov=50; cam.position.set(p.x*.6-1.2,p.y+4.4,8.2); cam.lookAt(p.x*.8,p.y+.4,p.z); shake(t,.03,1.4); } else { cam.fov=50; cam.position.set(p.x*.7+1,p.y+3.4,9.5); cam.lookAt(p.x*.85,p.y+.6,p.z); shake(t,.03,1.6); } break; }
 case 9: { const r=ss(0,1,(t-EV.ground)/1.25); hero.position.set(lg(0,.6,r),0,lg(-3.6,4.6,r)); hero.userData.pose(t*13,.85*(1-ss(.9,1,r))); P([5.5,1.4,17],[5.2,1.5,16],[-1,5,-4],[-1.5,6,-4],su); if(t>EV.boom) shake(t,.35*Math.exp(-(t-EV.boom)*3),2.5); break; }
 case 10: { const f=ss(0,.25,(t-EV.boom-.35)); hero.position.set(.6,0,lg(4.6,6.5,ss(0,.6,u))); hero.rotation.x=.25*f*(1-ss(.6,1,u)); if(u>.55) kneel(); else hero.userData.pose(t*10,.5); P([-6,2.4,19],[-5.4,2.8,17.5],[WP.x,WP.y-1,WP.z],[WP.x,WP.y,WP.z],su); shake(t,.25*Math.exp(-(t-EV.boom)*1.5),2); break; }
 case 11: kneel(); hero.position.set(.6,-.55,6.5); A(5).rotation.x=A(6).rotation.x=-.35; hero.children[1].rotation.x=.25; P([1.7,1.15,11.6],[1.45,1.25,10.4],[.6,1.6,6.5],[.4,2.4,5.5],su); break;
 case 12: kneel(); hero.position.set(.6,-.55,6.5); holdPhone(6,1.2); hero.children[1].rotation.x=.3; P([1.9,1.35,9.2],[1.6,1.4,8.6],[.6,1.05,6.5],[.6,1.1,6.5],su); break;
 case 13: { kneel(); hero.position.set(.6,-.55,6.5); const r=ss(.05,.95,u); hero.rotation.y=lg(0,Math.PI,r); hero.children[1].rotation.y=-.4*ss(0,.3,u)*(1-r); P([2.2,1.0,10.2],[1.9,1.05,9.4],[.6,1.3,5.6],[.6,1.5,4.6],ss(0,1,u)); break; }
 case 14: kneel(); hero.position.set(.6,-.55,6.5); hero.rotation.y=Math.PI; hero.children[1].rotation.x=-.25; P([1.25,1.25,7.55],[1.05,1.32,7.15],[.6,1.75,3.6],[.6,1.85,3.6],ss(0,1,u)); break;
 default: hero.visible=false; cam.position.set(0,1,20); cam.lookAt(0,1,0); }
 // ---- D: building, explosion, older self
 if(set==='D'){ const b=t-EV.boom, ex=b>0; myWin.m.visible=!ex; fireIn.visible=ex; fireIn.material.color.set(C(0xff8a2a).lerp(C(0xffd060),.5+.5*Math.sin(t*23))); fireL.intensity=ex?(b<.4?400*(1-b/.4)+60:45+18*Math.sin(t*17)+10*Math.sin(t*31)):0; doorGlow.material.color.set(ex?0x6a3a2a:0xd8e0f0);
  winsD.forEach(w=>{ if(w!==myWin) w.m.material.color.set(ex&&(w.r>=2&&w.r<=4&&Math.abs(w.c-1)<=1)?0x1a1c22:(w.lit?0xf2c86a:0x2a3448)); });
  fb.forEach((m,i)=>{ const q=b/(1.6+i*.15); m.visible=ex&&q<1; if(m.visible){ m.position.copy(WP).add(m.userData.o.clone().multiplyScalar(1+q*2.5)).add(V(0,q*3,1.2)); m.scale.setScalar(ss(0,.12,q)*(.7+i*.14)*(1+q*1.4)); m.material.opacity=1-ss(.5,1,q); m.material.color.set(C([0xfff2a0,0xffc040,0xff7a20,0xff5a10][i%4]).lerp(C(0x3a2a2a),ss(.35,.9,q))); } });
  sd.forEach((q,i)=>{ const age=b-q[0]*6; const on=ex&&age>0; const a=on?(age%8)/8:0; D.position.set(WP.x+(q[1]-.5)*2+a*4,WP.y+1+a*14,WP.z+1+q[2]*2+a*2); D.scale.setScalar(on?(.8+a*4)*(1-ss(.8,1,a)):0.0001); D.rotation.set(q[3]*6,a,0); D.updateMatrix(); smoke.setMatrixAt(i,D.matrix); }); smoke.instanceMatrix.needsUpdate=true;
  deb.forEach(m=>{ m.visible=ex; if(!ex) return; const v=m.userData.v, tt=Math.min(b,3), y=WP.y+v.y*tt-9.8*.5*tt*tt; const land=y<.1; const tl=land?(v.y+Math.sqrt(v.y*v.y+2*9.8*(WP.y-.1)))/9.8:tt; m.position.set(WP.x+v.x*tl*.35,land?.1:y,WP.z+v.z*tl*.45); m.rotation.set(m.userData.r.x*tl,m.userData.r.y*tl,0); });
  old.visible=k>=13&&k<=14; old.position.set(.6,0,3.6); old.rotation.y=0; old.userData.pose(0,0); old.children[0].rotation.x=.06; }
 renderer.render(sc,cam);
 // ---- HUD
 const N=TL.notes, cd=t<EV.n1?600:t<EV.n3?lg(600,30,(t-EV.n1)/(EV.n3-EV.n1)):lg(30,0,(t-EV.n3)/(EV.boom-EV.n3)), mm=Math.floor(cd/60), sec=Math.floor(cd%60);
 const showHud=t>=EV.n1&&t<EV.kneel+1.5, yrs=t>=EV.whisper&&t<EV.black; $('hud').style.opacity=showHud||yrs?1:0; $('temp').style.opacity=1;
 if(yrs){ document.querySelector('#hud .lab').textContent='HOW LONG HE HAS BEEN TRYING'; $('n').textContent='10'; $('u').textContent='YEARS'; $('stage').textContent='The final twist'; }
 else { document.querySelector('#hud .lab').textContent='TIME UNTIL YOUR LIFE CHANGES'; $('n').textContent=String(mm).padStart(2,'0')+':'+String(sec).padStart(2,'0'); $('u').textContent=''; $('stage').textContent=t<EV.knock?'The discovery':t<EV.run?'The knock':'The explosion'; }
 $('n').style.color=t>EV.n3&&t<EV.kneel+1.5?'#ff6a5a':'#ffffff'; $('r').innerHTML=''; $('el').textContent=''; $('wt').textContent='';
 const cur=[...N].reverse().find(n=>t>=n.t), nx=cur?N[N.indexOf(cur)+1]:null, end=cur?Math.min(nx?nx.t:1e9,cur.t+3.1,EV.black):0; const nv=cur&&t<end?ss(0,.22,t-cur.t)*(1-ss(end-.25,end,t)):0;
 $('note').style.opacity=nv; $('note').style.transform=`translateY(${(1-ss(0,.22,cur?t-cur.t:0))*-60}px)`; if(cur){ $('ntx').textContent=cur.text; $('note').className=/DON'T|RUN|BEHIND/.test(cur.text)?'urg':''; }
 let txt=''; for(const l of TL.lines){ if(t>=l.t&&t<l.t+l.d+.2){ const c=[]; let q=[]; for(const x of l.text.split(' ')){ q.push(x); if(q.length>=6||(/[.,?:]$/.test(x)&&q.length>=2)){ c.push(q.join(' ')); q=[]; } } if(q.length)c.push(q.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const z of c){ acc+=z.length; if(p<=acc){ txt=z; break; } } } } $('cap').textContent=txt; $('cap').style.fontStyle=TL.lines.some(l=>l.who==='old'&&t>=l.t&&t<l.t+l.d+.2)?'italic':'normal';
 $('title').style.opacity=(1-ss(EV.wake-.5,EV.wake,t))*ss(0,.3,t); $('peep').style.opacity=k===5?1:0; $('blk').style.opacity=t>=EV.black?1:0;
 const boomF=t>EV.boom?Math.exp(-(t-EV.boom)*5):0; $('fla').style.background=boomF>.01?'#fff2d0':'#000'; $('fla').style.opacity=Math.max(boomF*.95,k===1?1-ss(0,.35,t-EV.wake):0); $('fade').style.opacity=0; };
window.renderAt(0); window.ready=true;
