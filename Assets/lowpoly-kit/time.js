import * as THREE from 'three';
import { rng, flat, shadow, ss, rock, roundTree, pine, person, lamp, bird, car, skyDome, softSun, lights, tower, bench, trafficLight, shop, palm, umbrella, goal, bigWave } from './kit.js';
const TL=await (await fetch('/time_timeline.json')).json(), SEG=TL.segments, R=rng(41), $=id=>document.getElementById(id), DUR=TL.duration, SNAP=TL.snap, RES=TL.resume, S=i=>SEG[i].start, L=(i,j)=>SEG[i].lines[j].t;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(55,1080/1920,.3,1800), D=new THREE.Object3D(), C=h=>new THREE.Color(h);
const tw=t=>t<SNAP?t:t>RES?SNAP+(t-RES):SNAP;
const add=(sc,o,x=0,y=0,z=0,ry=0)=>{ o.position.set(x,y,z); o.rotation.y=ry; sc.add(o); return o; };
const plane=(sc,w,d,c,x=0,y=0,z=0)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,.04,d),flat(c)),false); m.position.set(x,y,z); sc.add(m); return m; };
const pal=[0xb8a2e6,0xf6b172,0x7ec4bc,0xf0a79d,0xa9b4d8,0xeaa985,0xc2a8e2], carCols=[0xd64f4f,0x3f78c4,0xefc14d,0xf2ede1,0x4fa28f,0xd27c3a,0x7a5fb8];
const outfit=[[0xf2e6c8,0x394a6e],[0xc98a2a,0x4b3a30],[0xd55a6a,0x2d3440],[0x5aa3c7,0x54402f],[0x8f6fce,0x2d3440],[0xe5c048,0x3d3a40],[0x69b96a,0x3a3a50],[0xe88fb0,0x303446],[0x47a7a0,0x4a3a30],[0xc95c3a,0x2d3440]];
const newP=i=>{ const o=outfit[i%10]; return person({shirt:o[0],pants:o[1],skin:[0xd9a27a,0xb97f58,0xeac4a0,0x8c5e3f][i%4],hair:[0x5a3320,0x201a18,0x8a5a2c,0x34302c][(i>>1)%4]}); };
const frozenCrowd=(sc,list)=>list.forEach(([x,z,r],i)=>{ const p=newP(i+3); add(sc,p,x,.05,z,r); p.userData.pose(1+i*1.7,.55); });
// lead
const lead=person({shirt:0xf07a22,pants:0x2c3a5e}); const stack=new THREE.Group(); [0,1,2].forEach(i=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(.8-.08*i,.38,.5),flat([0xe9b94c,0xd7577f,0x5fb0c2][i])); b.position.set(0,1.32+i*.38,.48); stack.add(b); }); lead.add(stack); const ballMat=flat(0xf8f8f4); const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(.27,1),ballMat); ball.castShadow=true; ball.position.set(0,1.2,.45); lead.add(ball);
// ------- PARK
const park=new THREE.Scene(); park.fog=new THREE.Fog(0xf2c4ad,90,420); skyDome(park,0x7f91d8,0xf2c4ad); softSun(park,55,66,-180,72); lights(park);
plane(park,2600,2600,0x4fa83f,0,-.02,0); plane(park,9,60,0xe9ae7c,0,.03,29); { const p=shadow(new THREE.Mesh(new THREE.CylinderGeometry(22,22,.004,28),flat(0xe9ae7c)),false); p.scale.z=.72; p.position.y=.058; park.add(p); const w=shadow(new THREE.Mesh(new THREE.CylinderGeometry(13,13,.05,24),flat(0x4b9df0)),false); w.scale.z=.34; w.position.y=.09; park.add(w); }
plane(park,600,10,0x6d6f78,0,.03,-24); const stone=flat(0xb9b2a8); [[3.6,4,.7,.35],[.8,1.7,1.2,1.3],[2,1.6,.3,2],[.25,.9,3.2,3.6]].forEach(([a,b,h,y])=>{ const m=shadow(new THREE.Mesh(new THREE.CylinderGeometry(a,b,h,8),stone)); m.position.y=y; park.add(m); });
const drops=new THREE.InstancedMesh(new THREE.BoxGeometry(.24,.24,.24),new THREE.MeshBasicMaterial({color:0xe8f8ff}),96); drops.frustumCulled=false; park.add(drops);
const leaf=[flat(0x2c7f3d),flat(0x3f9a48),flat(0x1f6a3a)], pineM=flat(0x1f6a3a), bark=flat(0x6b4a33); [[-9.2,14,1.7],[10.2,14,1.9],[-11,3,1.7],[11.5,2,1.8],[-15,7,1.9],[15,6,2],[-10,-9,1.5],[10,-10,1.5],[-20,-5,1.8],[20,-7,1.8],[-18,16,1.6],[19,17,1.7]].forEach(([x,z,s])=>add(park,roundTree(R,leaf,bark,s),x,0,z,R()*6)); [[-4.5,-13],[-2,-16],[3.5,-14],[6,-16],[-7,-17],[8.5,-14],[.7,-18],[-13,-15],[14,-15]].forEach(([x,z])=>add(park,pine(R,pineM,bark,1.6+R()*.9),x,0,z,R()*6));
[[-5.3,23],[5.3,23],[-5.5,-1.5],[5.5,-1.5]].forEach(([x,z])=>add(park,lamp(flat(0x23262c),flat(0xf3dd9c)),x,0,z));
for(let i=0;i<14;i++){ const s=.7+R()*.6,m=shadow(new THREE.Mesh(new THREE.BoxGeometry(s*1.4,s,s),flat([0xd7577f,0x8f6fce,0xe9b94c,0xdf7b4e,0x5fb0c2][i%5]))); m.position.set((i%2?1:-1)*(7.5+(i%7)*1.1),s/2+.06,1+(i%3)*1.2); park.add(m); }
[[-19,-52,18,29,16,0xb8a2e6],[-8,-62,11,31,14,0xf6b172],[-2,-70,8,23,12,0xf5ad6c],[3,-50,14,36,14,0x7ec4bc],[18,-58,9,15,12,0xf0a79d],[27,-62,16,13,14,0xa9b4d8],[22,-48,8,9,9,0xb8a2e6],[-38,-68,17,24,14,0xeaa985],[44,-76,22,20,14,0xc2a8e2]].forEach(a=>park.add(Object.assign(tower(R,a[0],a[1],a[2],a[3],a[4],a[5]))));
const cloud=(sc,x,y,z,s,c=0xe6b49c)=>{ const m=flat(c); for(let i=0;i<3;i++){ const b=new THREE.Mesh(rock(9*s,1,R,.13),m); b.position.set(x+(i-1)*11*s,y+R()*3,z); b.scale.y=.42; sc.add(b); } }; cloud(park,-38,46,-115,1.1); cloud(park,-48,78,-165,1.5); cloud(park,30,92,-190,1.6);
const bm=new THREE.MeshBasicMaterial({color:0x232c52,side:THREE.DoubleSide}); const pBirds=[[-8,21,-5],[7,24,-8],[9,18,-11],[-12,15,-22],[4,14,-25],[14,13,-28]].map(([x,y,z],i)=>{ const b=bird(bm); b.position.set(x,y,z); b.userData.o=[x,y,z]; b.userData.s=R()*6; park.add(b); return b; });
const walkers=[...Array(10)].map((_,i)=>{ const m=newP(i); park.add(m); return {m,i,ph:R()*6,rad:9+R()*8,sp:(i%2?1:-1)*(.07+R()*.06)}; });
add(park,bench(),-1,0,9); const family=[[-2.3,0xd55a6a,0x394a6e,0x5a3320],[-1,0x5aa3c7,0x2d3440,0x201a18],[.2,0xe5c048,0x3d3a40,0x8a5a2c]].map(([x,sh,pn,hr],i)=>{ const p=person({shirt:sh,pants:pn,hair:hr}); add(park,p,x,-.28,9.05); p.userData.sit(); return p; }); family[2].rotation.y=.35; family[0].rotation.y=.25;
// ------- STREET (road runs along z)
const street=new THREE.Scene(); street.fog=new THREE.Fog(0xf2c4ad,70,330); skyDome(street,0x7f91d8,0xf2c4ad); softSun(street,-34,84,-250,62); lights(street,80);
plane(street,2600,2600,0xb6b0a9,0,-.02,0); plane(street,16,700,0x54565f,0,.03,-100); for(const s of [-1,1]){ plane(street,5.5,700,0xc9c1b5,s*10.75,.06,-100); }
for(let z=-250;z<70;z+=9) plane(street,.28,4.4,0xf2f0e6,0,.06,z); for(let x=-7;x<=7;x+=1.75){ if(x<0.2&&x>-.2)continue; plane(street,.9,4.5,0xf4f2ea,x,.065,13); }
for(let z=-190,i=0;z<90;z+=11,i++) for(const s of [-1,1]){ const w=10; const sh=add(street,shop(w,pal[(i+(s>0?2:0))%7],[0xd64f4f,0x3f78c4,0x4fa28f,0xefc14d][i%4],R),s*19,0,z,-s*Math.PI/2); shadow(sh); street.add(tower(R,s*(30+R()*5),z,14,16+R()*38,10.5,pal[(i*3+(s>0?1:0))%7])); }
add(street,trafficLight(0),8.6,.06,8,Math.PI); add(street,trafficLight(0),-8.6,.06,18); const mainCar=add(street,car(0xd64f4f),-.0+3.8,.05,8.2,0);
[[-3.8,3],[3.8,-1],[-3.8,-8],[3.8,-13],[-3.8,-19],[3.8,-25],[-3.8,-32],[3.8,-40],[-3.8,-45],[3.8,-53],[-3.8,-60],[3.8,-70],[-3.8,-78],[3.8,-88]].forEach(([x,z],i)=>add(street,car(carCols[i%7]),x,.05,z,x>0?0:Math.PI));
frozenCrowd(street,[[-11,6,2.8],[-10,-4,0],[-11.5,-13,3.14],[11,3,3.1],[10.3,-8,0.1],[11.4,-20,3.2],[-10.5,-27,.1],[10.8,-33,3.1],[-9.5,15,1.57],[-11,-40,3.1],[10,-46,0],[-10.8,-54,.1],[-10.2,24,3.1],[-11.3,30,0],[11,20,3.1],[10.2,28,0]]);
const streetBirds=[[-4,10,-6],[1,12.5,-10],[6,9,-14],[-2,14,-3],[3,8,-20]].forEach(([x,y,z],i)=>{ const b=bird(bm); b.position.set(x,y,z); b.rotation.y=i; b.userData.flap(.5-i*.2); street.add(b); });
{ const f=flat(0xef6a3c); const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,1),f); b.position.set(-1.5,1.7,5); b.castShadow=true; street.add(b); const sp=new THREE.InstancedMesh(new THREE.BoxGeometry(.13,.13,.13),new THREE.MeshBasicMaterial({color:0xe8f8ff}),44); for(let i=0;i<44;i++){ const a=i*.9,r=.5+R()*1.5; D.position.set(3.8+Math.cos(a)*(1.5+r),.2+R()*1.2,8.2+2+Math.sin(a)*r); D.updateMatrix(); sp.setMatrixAt(i,D.matrix); } street.add(sp); }
// ------- STADIUM
const stad=new THREE.Scene(); stad.fog=new THREE.Fog(0x9fb3e2,160,520); skyDome(stad,0x6d82cf,0xe6b9b2); softSun(stad,120,150,-230,90); lights(stad,110);
plane(stad,2600,2600,0x5d5f69,0,-.02,0); for(let i=0;i<11;i++) plane(stad,76,10.3,i%2?0x46a243:0x3f983c,0,.02,-52+i*10.4+.2); const W=0xf5f5f0;
[[70,.4,0,.05,-52],[70,.4,0,.05,52],[.4,104,-35,.05,0],[.4,104,35,.05,0],[70,.4,0,.05,0],[40,.4,0,.05,-34],[.4,18,-20,.05,-43],[.4,18,20,.05,-43],[20,.4,0,.05,-45],[.4,7,-10,.05,-48.5],[.4,7,10,.05,-48.5]].forEach(a=>plane(stad,a[0],a[1],W,a[2],a[3],a[4]));
add(stad,goal(),0,0,-52); add(stad,goal(),0,0,52,Math.PI);
const seat=[]; const tier=(x,z,w,d,axis)=>{ for(let r=0;r<20;r++){ const y=2+r*1.4, off=r*1.6; const b=shadow(new THREE.Mesh(new THREE.BoxGeometry(axis?w:1.7,1.4,axis?1.7:d),flat(r%2?0x7a7d8c:0x6d7080)),false); b.position.set(x+(axis?0:Math.sign(x)*off),y-.7,z+(axis?Math.sign(z)*off:0)); stad.add(b); const n=Math.floor((axis?w:d)/.95); for(let i=0;i<n;i++) seat.push([b.position.x+(axis?-w/2+i*.95+(r%2)*.4:0)+(R()-.5)*.1,y+.32,b.position.z+(axis?0:-d/2+i*.95+(r%2)*.4)+(R()-.5)*.1]); } };
tier(0,-64,120,0,true); tier(0,64,120,0,true); tier(-50,0,0,120,false); tier(50,0,0,120,false);
const fans=new THREE.InstancedMesh(new THREE.BoxGeometry(.58,.9,.42),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),seat.length); const fanC=[0xd64f4f,0xf2ede1,0x3f78c4,0xefc14d,0x4b4f5c,0xe88fb0,0x69b96a,0xd27c3a]; seat.forEach((p,i)=>{ const up=R()<.3?.4:0; D.position.set(p[0],p[1]+up,p[2]); D.scale.set(1,1,1); D.rotation.set(0,0,0); D.updateMatrix(); fans.setMatrixAt(i,D.matrix); fans.setColorAt(i,C(fanC[i%3===0?(i%2):Math.floor(R()*8)])); }); stad.add(fans);
for(const [x,z] of [[-68,-85],[68,-85],[-68,85],[68,85]]){ const f=flat(0xdcdfe6); const m=new THREE.Mesh(new THREE.BoxGeometry(1.6,58,1.6),f); m.position.set(x,29,z); stad.add(m); const h=new THREE.Mesh(new THREE.BoxGeometry(14,5,1),new THREE.MeshBasicMaterial({color:0xfff9dc})); h.position.set(x,58,z); h.lookAt(0,0,0); stad.add(h); }
const kit=(i,x,z,r,hop=0)=>{ const p=person({shirt:i%2?0xd64f4f:0x3f78c4,pants:0xf5f5f0,skin:[0xd9a27a,0x8c5e3f,0xb97f58][i%3],hair:0x201a18}); add(stad,p,x,.05+hop,z,r); p.userData.pose(1.4+i,.95); return p; };
[[6,-30,3.4],[-7,-28,3],[12,-34,3.6],[-3,-37,2.9],[9,-41,3.3],[-11,-38,2.8,.5],[1.5,-24,3.2,.4],[-17,-24,2.7],[20,-20,3.8]].forEach((a,i)=>kit(i,...a)); const keeper=kit(0,3.8,-49,0,1.15); keeper.rotation.z=-1.2;
// ------- BEACH
const beach=new THREE.Scene(); beach.fog=new THREE.Fog(0xf2d2b8,130,640); skyDome(beach,0x6fa2e2,0xf5d2bb); softSun(beach,-70,92,-260,92); lights(beach,90); const sand=0xeed19a;
plane(beach,2600,1400,sand,0,-.02,700-8); plane(beach,2600,1400,0x35b6c4,0,.02,-700-3); plane(beach,2600,5,0xc8eef0,0,.05,-5.5); { const w0=bigWave(R,190); w0.scale.y=.85; beach.add(w0); } { const w=bigWave(R,190); w.position.set(0,0,-18); w.scale.set(1.2,.2,.8); }
const foam=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.5,.5),new THREE.MeshBasicMaterial({color:0xf4ffff}),260); foam.frustumCulled=false; for(let i=0;i<260;i++){ const x=(R()-.5)*120,k=R(); D.position.set(x,i%3?24+R()*6:1+R()*5,i%3?14+R()*9:-2+R()*11); D.rotation.set(R(),R(),R()); D.scale.setScalar(.4+R()*1.3); D.updateMatrix(); foam.setMatrixAt(i,D.matrix); } beach.add(foam); D.rotation.set(0,0,0); D.scale.setScalar(1);
[[-16,24,1.1],[31,22,1.2],[-23,33,1.2],[40,40,1.1],[-32,42,1.2],[33,50,1],[-36,20,1.3],[38,16,1.3],[-20,56,1.1]].forEach(([x,z,s])=>add(beach,palm(R,s),x,0,z,R()*6));
[[-9,15,0xd64f4f],[8,17,0x3f78c4],[-18,14,0xefc14d],[18,13,0xe88fb0],[-4,24,0x8f6fce],[5,28,0xd27c3a],[-28,23,0x4fa28f],[28,25,0xd64f4f]].forEach(([x,z,c],i)=>{ add(beach,umbrella(c),x,0,z); const t=new THREE.Mesh(new THREE.BoxGeometry(1,.04,2.2),flat(c)); t.position.set(x+1.2,.06,z+.4); beach.add(t); });
frozenCrowd(beach,[[-10.7,15.6,1.3],[9.5,17,-1.3],[-5,12,2.7],[4,20,3.7],[-15,8,3.3],[14,8,2.8],[-22,10,3.1],[20,19,-1]]);
{ const surfer=newP(4); add(beach,surfer,-9,18.2,-6.5,1.1); surfer.rotation.x=-.25; surfer.userData.pose(1.6,.35); const bd=new THREE.Mesh(new THREE.BoxGeometry(.7,.08,2.9),flat(0xf5e36c)); bd.position.set(-9,18.15,-6.5); bd.rotation.set(-.45,1.1,0); bd.castShadow=true; beach.add(bd); }
[[-9,24,8],[6,29,4],[11,18,7],[-4,18,12],[4,14,11]].forEach(([x,y,z],i)=>{ const b=bird(new THREE.MeshBasicMaterial({color:0xf8f8f6,side:THREE.DoubleSide})); b.position.set(x,y,z); b.rotation.y=i*1.2; b.userData.flap(.55-i*.2); beach.add(b); });
[[-46,70,1],[42,80,1]].forEach(([x,z])=>add(beach,tower(R,0,0,22,28,14,pal[(x>0)+3]),x,0,z));
// ------- shots
const SH=[[0,S(1),park],[S(1),L(1,1),street],[L(1,1),S(2),street],[S(2),L(2,1),stad],[L(2,1),S(3),stad],[S(3),S(4),street],[S(4),S(5),beach],[S(5),S(6),beach],[S(6),S(7),park],[S(7),S(8),park],[S(8),DUR,park]];
window.SHOTS=SH.map(s=>[s[0],s[1]]); window.DURATION=DUR;
const lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
function stage(t,k,u){ // returns lead state; sets camera
 let x=0,z=0,y=.05,ry=Math.PI,walk=true,sit=false,hold=null; const sway=Math.sin(t*.5);
 switch(k){
 case 0: x=-1.5; z=23-.33*t; ry=Math.PI; cam.position.set(sway*.2,2.25,35.5-3.5*u); cam.lookAt(0,8.4,-30); break;
 case 1: x=lg(-5.5,4,u); z=12.1; ry=Math.PI/2; cam.position.set(-5.3+u*2,.85,18.5); cam.lookAt(1.6+u,1.9,8); break;
 case 2: x=0; z=lg(5,-8,u); cam.position.set(1.4,2.4,z+7); cam.lookAt(0,5.2,z-25); break;
 case 3: x=2; z=lg(-15,-25,u); hold='ball'; cam.position.set(lg(32,24,u),lg(30,8,u),lg(-2,-3,u)); cam.lookAt(x,lg(9,2.4,u),z-2); break;
 case 4: { x=lg(2,1,u); const q=Math.min(1,u/.62); z=lg(-25,-49.2,q); walk=u<.62; hold=u<.62?'ball':null; if(u>=.74){ ry=0; z=lg(-49.2,-41,(u-.74)/.26); walk=true; } cam.position.set(1.5,1.55,-58.6); cam.lookAt(.6,2.2,-34); break; }
 case 5: x=-10.8; z=lg(-6,-24,u); hold='stack'; cam.position.set(-7.4,1.6,z-5.8); cam.lookAt(-12.6,2.9,z+8); break;
 case 6: x=lg(-1,-.2,u); z=lg(13,5,Math.min(1,u*1.4)); walk=u<.7; if(u>=.7) ry=Math.PI+ss(.72,.92,u)*2.3; cam.position.set(2.5,1.25,lg(43,41,u)); cam.lookAt(-.2,19,0); break;
 case 7: x=6; z=11; sit=true; ry=.4; y=-.28; cam.position.set(lg(19,14,u),lg(3,4.4,u),lg(47,43,u)); cam.lookAt(4,lg(10,11,u),2); break;
 case 8: x=lg(-4.5,1.6,u); z=lg(14,10.8,u); ry=Math.atan2(6.1,-3.2); { const a=-.3+u*.4; cam.position.set(Math.sin(a)*20,3.2+u,z*0+Math.cos(a)*20+1); cam.lookAt(0,5,0); } break;
 case 9: x=lg(10,2.2,Math.min(1,u*1.2)); z=lg(13.5,10.3,Math.min(1,u*1.2)); ry=-1.6; walk=u<.83; if(!walk) ry=0; cam.position.set(lg(5,2,u),1.8,lg(21,17.5,u)); cam.lookAt(lg(3,.2,u),2.3,9); break;
 default:{ const j=Math.min(1,(t-S(8))/1.2); x=lg(2.2,1.45,j); z=lg(10.3,9.05,j); ry=0; walk=false; sit=j>.45; y=sit?-.28:.05; const v=ss(RES,DUR-1,t); cam.position.set(lg(.5,0,v),lg(1.6,4.6,v),lg(18,24,v)); cam.lookAt(0,lg(2,3.4,v),6); }
 }
 return {x,y,z,ry,walk,sit,hold}; }
const sat=t=>{ if(t<SNAP) return 1; if(t>RES) return .32+.68*ss(RES,RES+1.1,t); const k=ss(SNAP,SNAP+.25,t); return lg(1,.9,k)-.6*ss(S(4)+5,S(7),t); };
const fmtClock=t=>{ const s=17+Math.floor(tw(t)); return '3:42:'+String(s).padStart(2,'0'); };
window.renderAt=t=>{ const w=tw(t); let k=SH.findIndex(s=>t<s[1]); if(k<0)k=SH.length-1; const u=(t-SH[k][0])/(SH[k][1]-SH[k][0]), scene=SH[k][2];
 const st=stage(t,k,u); scene.add(lead); lead.position.set(st.x,st.y,st.z); lead.rotation.set(0,st.ry,0);
 const seg=SEG[Math.max(0,SEG.findLastIndex(s=>t>=s.start))], ageEnd=seg.age, age=ageEnd; const old=ss(25,65,age), hair=C(0x5a3320).lerp(C(0xdfe0dc),ss(30,60,age)); lead.userData.hairM.color.copy(hair); lead.userData.beard.visible=age>=26; lead.rotation.x=old*.16;
 stack.visible=st.hold==='stack'; ball.visible=st.hold==='ball';
 if(st.sit){ lead.userData.pose(0,0); lead.userData.sit(); lead.children[0].position.y=1.25; } else if(st.walk){ const rate=1-.5*old; lead.userData.pose(t*6.5*rate,st.hold?.32:(.55-.2*old)); } else lead.userData.pose(0,.02);
 if(st.hold) { /* arms forward */ }
 // goal ball stays in the net once placed
 if(scene===stad){ goalBall.visible=k===4&&u>=.62; }
 if(scene===park){ for(let i=0;i<96;i++){ const a=(i%6)/6*6.283+.5, q=((w*.85+(i/96)*7.3)%1), r=q*4.3, y=4.8+20.8*q*(1-q)-q*q*4.8; D.position.set(Math.cos(a)*r,Math.max(.1,y),Math.sin(a)*r*.62); D.updateMatrix(); drops.setMatrixAt(i,D.matrix); } drops.instanceMatrix.needsUpdate=true;
   pBirds.forEach((b,i)=>{ const [x,y,z]=b.userData.o; b.position.set(x+Math.sin(w*.5+i)*2+(t>RES?(t-RES)*(x<0?-1.6:1.6):0),y+Math.sin(w*.8+i)*.6,z); b.rotation.y=Math.sin(w*.3+i)*.7+i; b.userData.flap(Math.sin(w*9+b.userData.s)*.6); });
   walkers.forEach(c=>{ const a=c.ph+w*c.sp, x=Math.cos(a)*c.rad*1.1, z=Math.sin(a)*c.rad*.68+2.5; c.m.position.set(x,.05,z); c.m.rotation.y=Math.atan2(-Math.sin(a)*Math.sign(c.sp)*1.1,Math.cos(a)*Math.sign(c.sp)*.68); c.m.userData.pose(w*6.5+c.ph,.5); });
   const turn=ss(RES+.6,RES+1.8,t); family[2].rotation.y=.35+turn*.55; family[1].rotation.y=turn*.3; family.forEach((f,i)=>f.userData.sit()); }
 cam.updateMatrixWorld(); renderer.render(scene,cam);
 $('c').style.filter=`saturate(${sat(t).toFixed(3)})`;
 const fl=Math.max(ss(SNAP-.02,SNAP,t)*(1-ss(SNAP,SNAP+.42,t)),ss(RES-.02,RES,t)*(1-ss(RES,RES+.42,t))); $('flash').style.opacity=fl*.8; const rt=t>=RES?t-RES:t-SNAP; $('ring').style.opacity=rt>=0&&rt<.7?(1-rt/.7):0; { const q=Math.max(10,rt*2100); Object.assign($('ring').style,{width:q+'px',height:q+'px',margin:-q/2+'px'}); }
 $('title').style.opacity=(1-ss(SEG[0].lines[1].t-.5,SEG[0].lines[1].t,t))*ss(0,.3,t); $('n').textContent=fmtClock(t); $('stage').textContent=t<SNAP?'Time flowing':t>=RES?'Time flowing':seg.caption;
 $('el').textContent='TIME STOPPED FOR: '+(t<SNAP?'0 SEC':seg.stopped); $('wt').textContent='YOUR AGE: '+age;
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.18){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 $('fade').style.opacity=ss(DUR-.5,DUR,t); };
const goalBall=new THREE.Mesh(new THREE.IcosahedronGeometry(.27,1),ballMat); goalBall.position.set(1.2,.3,-50.4); goalBall.castShadow=true; stad.add(goalBall);
window.renderAt(0); window.ready=true;
