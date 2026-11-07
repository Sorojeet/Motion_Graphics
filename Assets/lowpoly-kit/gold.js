import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { rng, flat, shadow, ss, rock, roundTree, person, car, skyDome, softSun, lights, house, fence, mailbox, powerPole, wire, bike } from './kit.js';
const TL=await (await fetch('/gold_timeline.json')).json(), SEG=TL.segments, R=rng(31), $=id=>document.getElementById(id), DUR=TL.duration, S=i=>SEG[i].start, L=(i,j)=>SEG[i].lines[j].t;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(55,1080/1920,.2,1800), D=new THREE.Object3D(), C=h=>new THREE.Color(h), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf2c4ad,90,420); const sky=skyDome(sc,0x7f91d8,0xf2c4ad), sun=softSun(sc,-60,70,-200,72), lt=lights(sc,70);
const envTex=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;
const goldM=new THREE.MeshStandardMaterial({color:0xffc444,metalness:1,roughness:.32,flatShading:true,envMap:envTex,envMapIntensity:1.1}), rustM=flat(0x9a4a2a), wireM=flat(0x23262c), whiteM=flat(0xf1ece2);
const plane=(w,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,.04,d),typeof c==='number'?flat(c):c),false); m.position.set(x,y,z); sc.add(m); return m; };
const add=(o,x=0,y=0,z=0,ry=0)=>{ o.position.set(x,y,z); o.rotation.y=ry; sc.add(o); return o; };
plane(2600,2600,0x6fbf4f,0,-.02,0); plane(400,8,0x54565f,0,.03,0); for(let x=-200;x<200;x+=6) plane(2.6,.22,0xf2f0e6,x,.06,0); for(const z of [-5.6,5.6]) plane(400,3,0xd6d0c4,0,.05,z);
const pal=[0xf2e6c8,0xb8d4e8,0xf0c8b0,0xd8e8c0,0xe8d0e8,0xf6e0a8,0xc8e0dc], roofC=[0x9a4f3a,0x4b5a78,0x6b4a3a,0x5a6b4a,0x8a3a3a,0x4b3a36,0x7a5a8a];
const roofs=[], gutters=[], mains=[];
let mainHouse; const HX=[-48,-32,-16,0,16,32,48];
HX.forEach((x,i)=>{ for(const side of [-1,1]){ const h=house(pal[(i+(side>0?3:0))%7],roofC[(i*2+(side>0?1:0))%7]); h.scale.setScalar(1.3); add(h,x,0,side*17,side>0?Math.PI:0); roofs.push(...h.userData.roofs);
  for(const s of [-1,1]){ const gt=shadow(new THREE.Mesh(new THREE.BoxGeometry(.24,.22,6.9),whiteM)); gt.position.set(s*4.25,4.42,0); h.add(gt); gutters.push(gt); const dp=shadow(new THREE.Mesh(new THREE.BoxGeometry(.16,4.4,.16),whiteM)); dp.position.set(s*4.25,2.2,3.15); h.add(dp); gutters.push(dp); }
  if(x===0&&side<0) mainHouse=h; plane(4.2,8,0xc9c1b5,x+6.4,.045,side*11); if(i%2===0) add(roundTree(R,[flat(0x2c7f3d),flat(0x3f9a48),flat(0x1f6a3a)],flat(0x6b4a33),1.3+R()*.4),x-5,0,side*(20+R()*3),R()*6);
  const f=fence(15); add(f,x-8,0,side*16.5,Math.PI/2); } });
// porch steps + front walk for the main house
plane(1.8,4.4,0xc9c1b5,0,.05,-10.6); const steps=[0,1].map(i=>{ const s=shadow(new THREE.Mesh(new THREE.BoxGeometry(2.4,.3,.6),flat(0xd8cfc2))); s.position.set(0,.15+i*.3,-12.55-i*.55); sc.add(s); return s; });
// mailboxes
const myBox=add(mailbox(0x3f78c4),-3.0,0,-7.3,Math.PI/2), nbBox=add(mailbox(0x4fa28f),-4.8,0,-7.3,Math.PI/2); HX.forEach(x=>{ if(x!==0&&x!==-16) add(mailbox(0x7a7d88),x-2.2,0,-7.3,Math.PI); add(mailbox(0x7a7d88),x+2.2,0,7.3); });
// power line along the north sidewalk
const wires=[]; const PX=[-56,-40,-24,-8,8,24,40,56]; PX.forEach(x=>add(powerPole(),x,0,7.6)); for(let i=0;i<PX.length-1;i++) for(const dx of [-1.3,0,1.3]){ const w=wire(new THREE.Vector3(PX[i]+dx,8.6,7.6),new THREE.Vector3(PX[i+1]+dx,8.6,7.6),.9,wireM); sc.add(w); wires.push(w); }
{ const w=wire(new THREE.Vector3(8,8.6,7.6),new THREE.Vector3(3,6.2,-13.5),.6,wireM,18); sc.add(w); wires.push(w); }
// cars
const cols=[0xd64f4f,0x3f78c4,0xefc14d,0xf2ede1,0x4fa28f,0xd27c3a,0x7a5fb8]; const myCar=add(car(0xd64f4f),6.4,.05,-10.5,0); HX.forEach((x,i)=>{ if(i%2) add(car(cols[i%7]),x+6.4,.05,11,Math.PI); if(i%3===2&&x!==0) add(car(cols[(i+3)%7]),x+6.4,.05,-10.5,0); });
const myCarBody=[myCar.children[0],myCar.children[2]], wheels=myCar.children.slice(3); const carMats=myCarBody.map(m=>m.material);
// people
const dad=person({shirt:0xf07a22,pants:0x2c3a5e}); sc.add(dad); const kid=person({shirt:0xf2c133,pants:0x3f78c4,hair:0x201a18,skin:0xb97f58}); kid.scale.setScalar(.66); sc.add(kid); const mom=person({shirt:0x8f6fce,pants:0x2d3440,hair:0x201a18,skin:0xeac4a0}); sc.add(mom);
// gold: nuggets, bars, kid's pile, bike
const nug=new THREE.InstancedMesh(rock(1,0,R,.25),goldM,420); nug.castShadow=true; nug.frustumCulled=false; sc.add(nug); const nd=[...Array(420)].map((_,i)=>{ let x,z; do{ if(i%2){ x=-8+R()*16; z=-7.8-R()*6; } else { x=-55+R()*110; z=(R()<.55?-1:1)*(8+R()*15); } } while(Math.abs(x-6.4)<2.6&&z<0||Math.abs(x)<1.2&&z<-8&&z>-13); return [x,z,.06+R()*.11,R()*6,S(1)+.2+Math.min(1,Math.hypot(x+2,z+7.3)/40)*4+R()*.6]; });
const pile=new THREE.InstancedMesh(rock(1,0,R,.25),goldM,90); pile.castShadow=true; sc.add(pile); for(let i=0;i<90;i++){ const a=R()*6.28, r=Math.sqrt(R())*.9, h=(1-r/.9)*.55; D.position.set(-1.5+Math.cos(a)*r,.08+h+R()*.08,-9.7+Math.sin(a)*r); D.scale.setScalar(.09+R()*.08); D.rotation.set(R(),R(),R()); D.updateMatrix(); pile.setMatrixAt(i,D.matrix); } D.rotation.set(0,0,0); D.scale.setScalar(1);
const bars=new THREE.Group(); for(let i=0;i<9;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.26),goldM); b.position.set((i%3)*.28-.28,.09+Math.floor(i/3)*.19,(i%2)*.05); b.rotation.y=Math.floor(i/3)%2?Math.PI/2:0; b.castShadow=true; bars.add(b); } add(bars,1.7,0,-12.2);
const myBike=bike(goldM); add(myBike,4.4,0,-8.2,.5);
const SH=[[0,S(1)],[S(1),S(2)],[S(2),S(3)],[S(3),S(4)],[S(4),S(5)],[S(5),S(6)],[S(6),S(7)],[S(7),DUR]]; window.SHOTS=SH; window.DURATION=DUR;
const setMat=(list,m,on)=>list.forEach(o=>{ if(!o.userData.m0) o.userData.m0=o.material; o.material=on?m:o.userData.m0; });
const fmtPrice=v=>v>=1?['$'+Math.round(v),'/ GRAM']:v>=.01?['$'+v.toFixed(2),'/ GRAM']:['≈ IRON','PRICE'];
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=7; const u=(t-SH[k][0])/(SH[k][1]-SH[k][0]), sunset=k===7;
 sky.top.value.set(sunset?0x5a5aa6:0x7f91d8); sky.low.value.set(sunset?0xf6a56c:0xf2c4ad); sc.fog.color.copy(sky.low.value); lt.d.color.set(sunset?0xffa860:0xfff0d0); lt.d.intensity=sunset?1.3:1.5; lt.h.intensity=sunset?1.9:2.5; sun.position.set(sunset?-40:-60,sunset?14:70,sunset?-220:-200); sun.material.color.set(sunset?0xffb070:0xfff2a0); sun.scale.setScalar(sunset?95:72);
 setMat(myBox.userData.parts,goldM,k>=3); setMat(nbBox.userData.parts,rustM,k>=3); setMat(gutters,goldM,k>=4); wires.forEach(w=>setMat(w.children,goldM,k>=4)); setMat(roofs,goldM,k>=6); setMat(myCarBody,goldM,k>=5);
 wheels.forEach(w=>w.scale.set(1,k>=5?.55:1,1)); myCar.position.y=k>=5?-.12:.05; myCar.rotation.z=k>=5?.025:0;
 myBike.visible=k>=5; myBike.userData.bend(k===5?.42*ss(L(5,1),L(5,1)+1.3,t):k>5?.42:0);
 nd.forEach((q,i)=>{ const a=k>=2?1:k===1?ss(q[4],q[4]+.35,t):0; D.position.set(q[0],-.1+.12*a+(a<1&&a>0?Math.sin(a*Math.PI)*.25:0),q[1]); D.rotation.set(q[3],q[3]*2,0); D.scale.setScalar(Math.max(.001,q[2]*a)); D.updateMatrix(); nug.setMatrixAt(i,D.matrix); }); nug.instanceMatrix.needsUpdate=true;
 pile.visible=k===2; bars.visible=k===2||k===1;
 dad.visible=true; kid.visible=k===2||k===5||k===7; mom.visible=k===7; dad.rotation.set(0,0,0); dad.children[0].position.y=1.25;
 if(k===0){ const q=Math.min(1,t/5.4), x=lg(0,-2.2,ss(.4,1,q)), z=lg(-12.9,-8.3,q); dad.position.set(x,.05,z); dad.rotation.y=Math.atan2(-2.2*(q>.4?1:0)+.0001,4.6); dad.userData.pose(q<1?t*6.5:0,q<1?.5:.03); }
 else if(k===1){ dad.position.set(-2.4,.05,-8.6); dad.rotation.y=Math.PI*.15+Math.sin(t*.8)*.3; dad.rotation.x=.18; dad.userData.pose(0,.03); }
 else if(k===2){ dad.position.set(.3,-.32,-12.95); dad.rotation.y=0; dad.userData.sit(); dad.rotation.x=.2; kid.position.set(-1.5,-.05,-8.8); kid.rotation.y=Math.PI; kid.userData.sit(); }
 else if(k===3){ dad.position.set(-7,.05,-9.4); dad.rotation.y=Math.PI*.8; dad.userData.pose(0,.03); }
 else if(k===4){ dad.position.set(2.6,.05,-7.5); dad.rotation.y=Math.PI*.75; dad.rotation.x=-.22; dad.userData.pose(0,.03); }
 else if(k===5){ dad.position.set(6.4,.05,-14.1); dad.rotation.y=0; dad.rotation.x=.42; dad.userData.pose(Math.sin(t*2)*.4,.35); kid.position.set(3.7,.05,-8.9); kid.rotation.y=.9; kid.userData.pose(0,.03); }
 else if(k===6){ dad.visible=false; }
 else { dad.position.set(-.5,-.32,-12.95); dad.rotation.y=0; dad.userData.sit(); mom.position.set(.55,-.32,-12.95); mom.rotation.y=0; mom.userData.sit(); kid.position.set(2.3,.05,-10.9); kid.rotation.y=Math.PI*1.35; kid.userData.pose(t*4,.12); }
 switch(k){
  case 0: cam.position.set(lg(-7,-4,u),lg(6.5,5,u),lg(4,2.5,u)); cam.lookAt(-.5,2,-11); break;
  case 1: cam.position.set(lg(2.6,2,u),1.5,lg(-1.6,-2.4,u)); cam.lookAt(-1.6,.5,-9.8); break;
  case 2: cam.position.set(lg(3.6,3.1,u),2,lg(-3.3,-3.9,u)); cam.lookAt(-1.2,.6,-11); break;
  case 3: cam.position.set(lg(-3.6,-3.9,u),1.35,lg(-1.4,-1.9,u)); cam.lookAt(-3.9,1.2,-7.3); break;
  case 4: { cam.position.set(lg(12,10.5,u),lg(2,2.8,u),lg(-1,-2.5,u)); const q=ss(.35,.95,u); cam.lookAt(lg(5.5,7,q),lg(5,8.4,q),lg(-14,4,q)); break; }
  case 5: cam.position.set(lg(9.6,9,u),1.6,lg(-2.6,-3.4,u)); cam.lookAt(5,.8,-9.8); break;
  case 6: { const a=-.15+u*.4; cam.position.set(Math.sin(a)*52,lg(30,26,u),Math.cos(a)*52); cam.lookAt(0,2,-4); break; }
  default: cam.position.set(lg(3.6,3,u),1.6,lg(-4.4,-5.2,u)); cam.lookAt(0,1.3,-12.2); }
 renderer.render(sc,cam);
 const seg=SEG[Math.max(0,SEG.findLastIndex(s=>t>=s.start))], v=127*Math.pow(10,-6*(k>=2?1:k===1?ss(L(1,1),L(1,1)+2.6,t):0)), [pn,pu]=fmtPrice(v);
 $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=pn; $('u').textContent=pu; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='TIME: '+seg.when;
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 $('fla').style.opacity=0; $('fade').style.opacity=ss(DUR-.5,DUR,t); };
window.renderAt(0); window.ready=true;
