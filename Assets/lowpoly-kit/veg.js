import * as THREE from 'three';
import { rng, flat, shadow, ss, rock, roundTree, pine, person, lamp, bird, skyDome, softSun, lights, tower, shop, cow, pig, chicken, deer, barn, silo, house, fence, marketStall, burgerSign, bunting, cropRows } from './kit.js';
const TL=await (await fetch('/veg_timeline.json')).json(), SEG=TL.segments, R=rng(77), $=id=>document.getElementById(id), DUR=TL.duration, S=i=>SEG[i].start, L=(i,j)=>SEG[i].lines[j].t;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(55,1080/1920,.3,1800), D=new THREE.Object3D(), C=h=>new THREE.Color(h), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const add=(sc,o,x=0,y=0,z=0,ry=0)=>{ o.position.set(x,y,z); o.rotation.y=ry; sc.add(o); return o; };
const plane=(sc,w,d,c,x=0,y=0,z=0)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,.04,d),typeof c==='number'?flat(c):c),false); m.position.set(x,y,z); sc.add(m); return m; };
const pal=[0xb8a2e6,0xf6b172,0x7ec4bc,0xf0a79d,0xa9b4d8,0xeaa985,0xc2a8e2], awn=[0xd64f4f,0x3f78c4,0x4fa28f,0xefc14d];
const outfit=[[0xf2e6c8,0x394a6e],[0xc98a2a,0x4b3a30],[0xd55a6a,0x2d3440],[0x5aa3c7,0x54402f],[0x8f6fce,0x2d3440],[0xe5c048,0x3d3a40],[0x69b96a,0x3a3a50],[0xe88fb0,0x303446],[0x47a7a0,0x4a3a30],[0xc95c3a,0x2d3440],[0xf07a22,0x2c3a5e],[0xd9d0ea,0x394a6e]];
const newP=(i,o)=>{ i=Math.abs(i); o=o||outfit[i%12]; return person({shirt:o[0],pants:o[1],skin:[0xd9a27a,0xb97f58,0xeac4a0,0x8c5e3f][i%4],hair:[0x5a3320,0x201a18,0x8a5a2c,0x34302c][(i>>1)%4]}); };
const face=(m,dx,dz)=>{ m.rotation.y=Math.atan2(dx,dz); };
// ================= MARKET
const mk=new THREE.Scene(); mk.fog=new THREE.Fog(0xf2c4ad,80,360); const mSky=skyDome(mk,0x7f91d8,0xf2c4ad), mSun=softSun(mk,40,70,-200,70), mL=lights(mk,60);
plane(mk,2600,2600,0xb6b0a9,0,-.02,0); plane(mk,24,74,0xe2cba6,0,.03,0); for(let z=-36;z<=36;z+=3) plane(mk,24,.08,0xcdb48e,0,.05,z); for(let x=-12;x<=12;x+=3) plane(mk,.08,74,0xcdb48e,x,.05,0);
for(let z=-44,i=0;z<=44;z+=11,i++) for(const s of [-1,1]){ add(mk,shop(10,pal[(i+(s>0?3:0))%7],awn[i%4],R),s*17,0,z,-s*Math.PI/2); mk.add(tower(R,s*(28+R()*3),z,14,16+R()*30,10.5,pal[(i*2+(s>0?1:0))%7])); }
for(let x=-30;x<=30;x+=12){ mk.add(tower(R,x,-60,11,14+R()*22,10,pal[(x/12+3)%7|0])); mk.add(tower(R,x,62,11,14+R()*22,10,pal[(x/12+5)%7|0])); }
const leaf=[flat(0x2c7f3d),flat(0x3f9a48),flat(0x1f6a3a)], bark=flat(0x6b4a33), pineM=flat(0x1f6a3a);
const meat=[], veg=[]; let burger;
const mkStall=(side,z,awnC,goods,isMeat,vendorO)=>{ const st=marketStall(6,awnC,goods,R); add(mk,st,side*6.2,0,z,side<0?Math.PI/2:-Math.PI/2); const v=newP(z|0,vendorO); v.position.set(0,0,-1.6); v.userData.pose(0,.02); st.add(v); (isMeat?meat:veg).push(st); return st; };
mkStall(-1,10,0xd64f4f,[0xc94a4a,0xe58a8a,0xa83a3a],true,[0xf4f2ee,0x3a3f4a]); burger=mkStall(-1,2,0xefc14d,[0x8a4b2c,0xd9953f,0x6b3a22],true,[0xd64f4f,0x2d3440]); mkStall(-1,-6,0x3f78c4,[0x8aa6b8,0x6e8ea3,0xb8c8d2],true,[0x3f78c4,0x2d3440]);
mkStall(-1,-14,0x8f6fce,[0xf6f2ea,0xf2dc9a,0xe8d4b0],false); mkStall(1,10,0x4fa28f,[0xd8403c,0x5fb04a,0xe9b94c]); mkStall(1,2,0xd27c3a,[0xef7d2b,0x7a4fa0,0x5fb04a]); mkStall(1,-6,0xe88fb0,[0xf2c133,0xe86a3a,0x9bc64a]); mkStall(1,-14,0x4fa28f,[0x7fbf4a,0xd8403c,0xf2c133]);
const sign=burgerSign(); sign.position.set(0,4.6,.2); sign.scale.setScalar(1.25); burger.add(sign);
const bc=[0xd64f4f,0xefc14d,0x3f78c4,0x4fa28f,0xe88fb0,0xf2ede1]; for(const z of [-18,-10,-2,6,14]) mk.add(bunting(new THREE.Vector3(-5.4,4.2,z),new THREE.Vector3(5.4,4.2,z),14,bc,.7));
[[-4.6,20],[4.6,20],[-4.6,-20],[4.6,-20]].forEach(([x,z])=>add(mk,lamp(flat(0x23262c),flat(0xf3dd9c)),x,0,z));
[[-9.5,24],[9.5,24],[-9.5,-24],[9.5,-24],[-9.5,30],[9.5,30]].forEach(([x,z])=>{ plane(mk,2.4,2.4,0x9a8a78,x,.3,z).scale.y=12; add(mk,roundTree(R,leaf,bark,1.2),x,.55,z,R()*6); });
const vegPiles=veg.slice(4-4).filter((s,i)=>i>0).flatMap(s=>s.userData.piles).map(p=>({p,t:0})); vegPiles.forEach(o=>o.t=S(1)+2.2+R()*(SEG[1].end-S(1)-3));
const crowd=[...Array(18)].map((_,i)=>{ const m=newP(i); mk.add(m); return {m,i,z0:R()*48,lane:-2.2+(i%4)*1.45,dir:i%2?1:-1,sp:.8+R()*.4,ph:R()*6}; });
const wrap=(v,a,b)=>a+((v-a)%(b-a)+(b-a))%(b-a);
function marketPeople(t,phase){ crowd.forEach(c=>{ const {m,i}=c; let x,z,walk=true,dx=0,dz=c.dir;
  const walkPos=(sp)=>{ z=wrap(c.z0+c.dir*t*c.sp*sp,-26,26)-0; x=c.lane; };
  if(phase===0){ if(i<3){ x=-3.5; z=(i<2?10:2)+(i%2?.9:-.9); walk=false; dx=-1; dz=0; } else walkPos(1); }
  else if(phase===1){ if(i>=14) walkPos(1); else { const j=i%3, r=Math.floor(i/3), sz=[10,2,-6][j]; x=3.35-(r%2)*.85; z=sz-1.6+r*.75; walk=false; dx=1; dz=0; } }
  else { if(i<4){ x=-3.5; z=2-1.3+i*.85; walk=false; dx=-1; dz=0; } else walkPos(.7); }
  m.position.set(x,.05,z); face(m,dx,dz); m.userData.pose(walk?t*6.5+c.ph:Math.sin(t*1.5+i)*.1,walk?.5:.05); m.visible=Math.hypot(x-cam.position.x,z-cam.position.z)>2.8; }); }
// ================= FARM
const fm=new THREE.Scene(); fm.fog=new THREE.Fog(0xf2c4ad,110,520); const fSky=skyDome(fm,0x7f91d8,0xf2c4ad), fSun=softSun(fm,60,70,-200,72), fL=lights(fm,95);
plane(fm,2600,2600,0x5fae46,0,-.02,0); const pastM=flat(0x86c95a); plane(fm,56,44,pastM,0,.03,2);
[[0,24,56,0],[0,-20,56,0],[-28,2,44,1],[28,2,44,1]].forEach(([x,z,l,r])=>{ const f=fence(l); add(fm,f,x,0,z,r?Math.PI/2:0); f.userData.posts.forEach((p,i)=>{ p.userData.tilt=R()<.35?(R()-.5)*.9:0; }); fm.userData.fences=(fm.userData.fences||[]).concat(f); });
const theBarn=add(fm,barn(),-16,0,-15); add(fm,silo(),-25,0,-16); add(fm,house(),24,0,-27,-.3); const coop=add(fm,house(0xc2453a,0x4b3a36),16,0,-14); coop.scale.setScalar(.42);
{ const f1=fence(8),f2=fence(8),f3=fence(6),f4=fence(6); add(fm,f1,16,0,-5); add(fm,f3,12,0,-8,Math.PI/2); add(fm,f4,20,0,-8,Math.PI/2); }
const hens=[...Array(9)].map((_,i)=>{ const h=chicken(i%3?0xf6f2ea:0xb8743a); add(fm,h,13+R()*6,0,-10.5+R()*4.5,R()*6); h.userData.s=R()*6; return h; });
plane(fm,8,5,0x8a6a4a,2,.04,-15); { const p1=fence(8),p2=fence(8),p3=fence(5),p4=fence(5); add(fm,p1,2,0,-12.5); add(fm,p2,2,0,-17.5); add(fm,p3,-2,0,-15,Math.PI/2); add(fm,p4,6,0,-15,Math.PI/2); }
const pigs=[...Array(6)].map((_,i)=>{ const p=pig(); add(fm,p,-.5+(i%3)*2.4,0,-16.2+(i>>1&1)*2,R()*6); return p; });
const door=new THREE.Vector3(-16,0,-9.2), beef=[], dairy=[];
const beefCols=[[0x8a5a3c,null],[0x2c2724,null],[0xb5733f,0xf2eee6],[0x6b4430,0xf2eee6],[0x2c2724,0xf2eee6]];
for(let i=0;i<18;i++){ const [b,s]=beefCols[i%5], c=cow({body:b,spot:s}); const x=-2+R()*26, z=-5+R()*26; add(fm,c,x,0,z,R()*6); c.userData.home=new THREE.Vector3(x,0,z); c.userData.ry=c.rotation.y; c.userData.t0=S(2)+.4+i*.32+R()*.3; c.userData.s=R()*6; beef.push(c); }
for(let i=0;i<6;i++){ const c=cow({body:0xf4f1ea,spot:0x26221f,dairy:true}); add(fm,c,-24+R()*9,0,-5+R()*7,R()*6); c.userData.s=R()*6; dairy.push(c); }
const farmer=newP(0,[0x5a8fc4,0x6b4a33]); { const hat=new THREE.Mesh(new THREE.BoxGeometry(.62,.1,.62),flat(0xc9a45a)); hat.position.y=2.1; farmer.add(hat); const top=new THREE.Mesh(new THREE.BoxGeometry(.4,.2,.4),flat(0xc9a45a)); top.position.y=2.22; farmer.add(top); } add(fm,farmer,3,0,24.7,Math.PI); farmer.userData.pose(0,.02);
{ const w1=cropRows(52,16,0xe7c25a,R,.7); w1.position.set(-2,0,-40); fm.add(w1); const w2=cropRows(20,40,0x5fae46,R,.45,1); w2.position.set(42,0,-4); fm.add(w2); plane(fm,20,40,0x9a6e4a,-42,.03,0); for(let x=-51;x<=-33;x+=1.2) plane(fm,.35,40,0x7c5538,x,.06,0); const w3=cropRows(24,24,0xe7c25a,R,.7); w3.position.set(44,0,-42); fm.add(w3); }
for(let x=-60;x<=60;x+=7) add(fm,roundTree(R,leaf,bark,1.2+R()*.5),x,0,-52-R()*3,R()*6); for(let z=-48;z<=40;z+=7){ add(fm,roundTree(R,leaf,bark,1.2+R()*.5),-56-R()*3,0,z,R()*6); add(fm,roundTree(R,leaf,bark,1.2+R()*.5),58+R()*3,0,z,R()*6); }
for(let i=0;i<40;i++){ const a=R()*6.28,r=90+R()*60; add(fm,pine(R,pineM,bark,2+R()*1.4),Math.cos(a)*r,0,Math.sin(a)*r-30,R()*6); }
[[-150,-190,70],[110,-210,80],[230,-60,60],[-230,30,70],[30,-260,90]].forEach(([x,z,r])=>{ const h=new THREE.Mesh(rock(r,2,R,.06),flat(0x5aa547)); h.position.set(x,-r*.72,z); fm.add(h); });
const segD=(x,z)=>{ const ax=-3,az=22,bx=11,bz=8,dx=bx-ax,dz=bz-az,q=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz))); return Math.hypot(x-ax-q*dx,z-az-q*dz); }; const wild=[]; for(let i=0;i<46;i++){ let x,z; do{ x=-25+R()*51; z=-17+R()*39; } while(segD(x,z)<4.5||Math.hypot(x+4,z-25)<9||Math.hypot(x+16,z+9)<6||(x>-27&&x<-12&&z<4)); const t=i%3?roundTree(R,leaf,bark,1.1+R()*.5):pine(R,pineM,bark,1.5+R()*.8); add(fm,t,x,0,z,R()*6); t.userData.g=[.1+R()*.15,.65+R()*.45,1.1+R()*.35]; t.userData.late=i>=34; wild.push(t); }
const tufts=new THREE.InstancedMesh(new THREE.ConeGeometry(.2,.7,4),flat(0x4f9a3a),1600), td=[...Array(1600)].map(()=>[-27+R()*54,-19+R()*42,R()*6,.6+R()*.8]); tufts.receiveShadow=true; fm.add(tufts);
const flw=new THREE.InstancedMesh(new THREE.BoxGeometry(.18,.18,.18),new THREE.MeshLambertMaterial({color:0xffffff}),600); const fc=[0xffffff,0xf2c133,0xe88fb0,0xa58ad8]; for(let i=0;i<600;i++) flw.setColorAt(i,C(fc[i%4])); const fdd=[...Array(600)].map(()=>[-27+R()*54,-19+R()*42]); fm.add(flw);
const deers=[...Array(6)].map((_,i)=>{ const d=deer(i%3===0); add(fm,d,5+R()*12,0,4+R()*12,R()*6); d.userData.s=R()*6; d.userData.h=d.position.clone(); return d; });
const bm=new THREE.MeshBasicMaterial({color:0x232c52,side:THREE.DoubleSide}), flock=[...Array(9)].map((_,i)=>{ const b=bird(bm); fm.add(b); b.userData.s=R()*6; return b; });
// ================= DRY LAND
const dry=new THREE.Scene(); dry.fog=new THREE.Fog(0xf3d3a8,70,380); skyDome(dry,0x8fb1de,0xf6dcb4); softSun(dry,-40,90,-200,96,0xfff0b0); lights(dry,60);
plane(dry,2600,2600,0xd2a56a,0,-.02,0); [[-40,-80,40],[50,-110,55],[-110,-60,50],[120,-40,45],[0,-160,70]].forEach(([x,z,r])=>{ const h=new THREE.Mesh(rock(r,2,R,.08),flat(0xc89558)); h.position.set(x,-r*.8,z); dry.add(h); });
for(let i=0;i<60;i++){ const s=new THREE.Mesh(rock(.4+R()*.7,0,R,.2),flat(R()<.5?0x8a8f4a:0x9b7a4a)); s.position.set((R()-.5)*90,.15,-R()*70+16); s.scale.y=.6; s.castShadow=true; dry.add(s); }
[[-12,-14],[14,-22],[-26,-30],[24,-8],[6,-40]].forEach(([x,z])=>{ const g=new THREE.Group(); { const tr=new THREE.Mesh(new THREE.CylinderGeometry(.22,.32,4,6),bark); tr.position.y=2; g.add(tr); } const c=new THREE.Mesh(rock(2.6,1,R,.15),flat(0x6f8a3a)); c.scale.y=.32; c.position.y=4.2; c.castShadow=true; g.add(c); add(dry,g,x,0,z); });
const herder=newP(3,[0xb8452f,0xe8d8b8]); { const st=new THREE.Mesh(new THREE.BoxGeometry(.08,2.4,.08),bark); st.position.set(.48,1.2,.2); herder.add(st); const sc=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.5),flat(0xefe4cc)); sc.position.y=2.12; herder.add(sc); } dry.add(herder);
const goats=[...Array(10)].map((_,i)=>{ const g=cow({body:[0xece6da,0x6b4430,0x2c2724,0xb5733f][i%4],spot:i%3?null:0xf2eee6}); g.scale.setScalar(.5); add(dry,g,-6+R()*12,0,-6+R()*9,R()*6); g.userData.s=R()*6; g.userData.h=g.position.clone(); return g; });
// ================= SHOTS
const SH=[[0,S(1),0],[S(1),S(2),1],[S(2),S(3),2],[S(3),L(3,1),3],[L(3,1),S(4),4],[S(4),S(5),5],[S(5),S(6),6],[S(6),S(7),7],[S(7),DUR,8]]; window.SHOTS=SH.map(s=>[s[0],s[1]]); window.DURATION=DUR;
const setSky=(u,top,low,sc,l,sun,lc,li)=>{ u.top.value.set(top); u.low.value.set(low); sc.fog.color.set(low); if(l){ l.d.color.set(lc); l.d.intensity=li; } };
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=SH.length-1; const u=(t-SH[k][0])/(SH[k][1]-SH[k][0]); let scene;
 if(k<=1||k===8){ scene=mk; const sunset=k===8; setSky(mSky,sunset?0x5a5aa6:0x7f91d8,sunset?0xf6a56c:0xf2c4ad,mk,mL,0,sunset?0xffa860:0xfff0d0,sunset?1.2:1.5); mL.h.intensity=sunset?1.9:2.5; mSun.position.set(sunset?-30:40,sunset?16:70,sunset?220:-200); mSun.material.color.set(sunset?0xffb070:0xfff2a0); mSun.scale.setScalar(sunset?90:70);
   const shut=k===0||k===8?.02:lg(.02,1,ss(S(1)+.3,S(1)+2,t)); meat.forEach(s=>s.userData.shutter.scale.y=shut);
   meat.forEach((s,j)=>s.userData.mats.forEach((m,q)=>m.color.set(k===8?[[0x5fb04a,0xd8403c,0xf2c133],[0x6a9a3a,0xd9953f,0x4a7a2a],[0xef7d2b,0x7fbf4a,0xf2c133]][j][q]:[[0xc94a4a,0xe58a8a,0xa83a3a],[0x8a4b2c,0xd9953f,0x6b3a22],[0x8aa6b8,0x6e8ea3,0xb8c8d2]][j][q])));
   sign.userData.patty.color.set(k===8?0x5f9a3a:0x5a3420); vegPiles.forEach(o=>o.p.visible=k!==1||t<o.t);
   if(k===0){ cam.position.set(0,lg(10,5.8,u),lg(33,27,u)); cam.lookAt(0,2.2,-6); }
   else if(k===1){ cam.position.set(.4,2.3,lg(25,23,u)); cam.lookAt(lg(-6,6,ss(.32,.62,u)),2.1,6); }
   else { cam.position.set(lg(1.5,.5,u),2.6,lg(-27,-23,u)); cam.lookAt(-2.5,2.5,4); }
   marketPeople(t,k===0?0:k===1?1:2); }
 else if(k===4){ scene=dry; herder.position.set(-1.5+u*1.2,.05,-1+u*.6); face(herder,1,.4); herder.userData.pose(t*4.2,.32);
   goats.forEach((g,i)=>{ g.position.set(g.userData.h.x+Math.sin(t*.2+g.userData.s)*.4,0,g.userData.h.z); g.userData.graze(.5+.5*Math.sin(t*1.3+g.userData.s)); g.userData.walk(t*3+i,.1); });
   cam.position.set(lg(5,6.5,u),1.5,lg(13,11,u)); cam.lookAt(-1.5,2.2,-2); }
 else { scene=fm; const yr=k===5?1:k===6?2:k===7?3:0, gold=k===7;
   setSky(fSky,gold?0x6a7fc8:0x7f91d8,gold?0xf7c27a:0xf2c4ad,fm,fL,0,gold?0xffc070:0xfff0d0,gold?1.35:1.5); fSun.position.set(gold?-70:60,gold?30:70,-200); fSun.material.color.set(gold?0xffc070:0xfff2a0); fSun.scale.setScalar(gold?95:72);
   pastM.color.set([0x86c95a,0x76b44c,0x5c9a3e,0x5a963c][yr]); const tuftS=[.12,.55,1.1,1.25][yr];
   td.forEach((q,i)=>{ D.position.set(q[0],.3*tuftS*q[3],q[1]); D.rotation.set(0,q[2],0); D.scale.setScalar(Math.max(.001,tuftS*q[3])); D.updateMatrix(); tufts.setMatrixAt(i,D.matrix); }); tufts.instanceMatrix.needsUpdate=true;
   fdd.forEach((q,i)=>{ D.position.set(q[0],.6*tuftS+.1,q[1]); D.rotation.set(0,0,0); D.scale.setScalar(yr>=2?1:.001); D.updateMatrix(); flw.setMatrixAt(i,D.matrix); }); flw.instanceMatrix.needsUpdate=true;
   wild.forEach(w=>{ const g=yr===0?0:w.userData.g[yr-1]*(w.userData.late&&yr<3?0:1)*(1+.03*u); w.scale.setScalar(Math.max(.001,g)); w.visible=g>.01; });
   (fm.userData.fences||[]).forEach(f=>f.userData.posts.forEach(p=>p.rotation.z=yr>=2?p.userData.tilt:0));
   pigs.forEach((p,i)=>{ p.visible=k===2; p.userData.walk(t*4+i,.15); p.userData.graze(.4+.4*Math.sin(t+i)); });
   beef.forEach((c,i)=>{ const h=c.userData.home; if(k!==2){ c.visible=false; return; } const dt=t-c.userData.t0; if(dt<0){ c.position.copy(h); c.rotation.y=c.userData.ry; c.userData.graze(.6+.4*Math.sin(t+c.userData.s)); c.userData.walk(0,0); c.visible=true; return; } const v=door.clone().sub(h), len=v.length(), d=Math.min(len,dt*2.4); c.position.copy(h).addScaledVector(v,d/len); face(c,v.x,v.z); c.userData.graze(0); c.userData.walk(t*7+i,.45); c.visible=d<len-.6; });
   dairy.forEach((c,i)=>{ c.userData.graze(.6+.4*Math.sin(t*.8+c.userData.s)); });
   hens.forEach((h,i)=>h.userData.peck(Math.max(0,Math.sin(t*5+h.userData.s))));
   deers.forEach((d,i)=>{ d.visible=yr>=2; d.position.set(d.userData.h.x+Math.sin(t*.15+d.userData.s)*.8,0,d.userData.h.z); d.userData.graze(i%2?.5+.5*Math.sin(t*.9+i):0); d.userData.walk(t*2+i,.08); });
   flock.forEach((b,i)=>{ b.visible=yr>=2; const a=t*.25+i*.7; b.position.set(4+Math.cos(a)*(14+i),16+Math.sin(t*.7+i)*1.5+i*.4,4+Math.sin(a)*(10+i*.5)); b.rotation.y=-a; b.userData.flap(Math.sin(t*8+b.userData.s)*.6); });
   farmer.visible=k===3||k===2; farmer.rotation.y=Math.PI; farmer.rotation.x=k===3?.06:0;
   if(k===2){ cam.position.set(lg(17,13,u),2.4,lg(31,28,u)); cam.lookAt(-7,2,-6); }
   else if(k===3){ cam.position.set(lg(5.9,5.4,u),1.75,lg(29,28.4,u)); cam.lookAt(2.1,1.85,22); }
   else if(k===5){ const a=.25+u*.35; cam.position.set(Math.sin(a)*70,lg(50,45,u),Math.cos(a)*70); cam.lookAt(0,0,-6); }
   else if(k===6){ cam.position.set(lg(-3,-1.5,u),1.55,lg(21,19,u)); cam.lookAt(9,2.4,8); }
   else { cam.position.set(lg(28,40,u),lg(26,44,u),lg(46,64,u)); cam.lookAt(0,0,-6); } }
 renderer.render(scene,cam);
 const seg=SEG[Math.max(0,SEG.findLastIndex(s=>t>=s.start))]; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 $('fade').style.opacity=ss(DUR-.5,DUR,t); };
window.renderAt(0); window.ready=true;
