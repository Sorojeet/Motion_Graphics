import * as THREE from 'three';
import { rng, flat, shadow, ss, rock, roundTree, person, car, lamp, skyDome, softSun, lights, tower, shop, bench, textSign, civic, teleportFx, woman, fadeGroup, hospitalBed, ivStand, monitorStand, crib, schoolDesk, kitchenSet } from './kit.js';
await document.fonts.load('600 80px Jost');
const TL=await (await fetch('/women_timeline.json')).json(), SEG=TL.segments, R=rng(99), $=id=>document.getElementById(id), DUR=TL.duration, S=i=>SEG[i].start, VAN=TL.vanish;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(55,1080/1920,.1,1800), D=new THREE.Object3D(), C=h=>new THREE.Color(h), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const add=(sc,o,x=0,y=0,z=0,ry=0)=>{ o.position.set(x,y,z); o.rotation.y=ry; sc.add(o); return o; };
const bx=(sc,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); sc.add(m); return m; };
const pal=[0xb8a2e6,0xf6b172,0x7ec4bc,0xf0a79d,0xa9b4d8,0xeaa985,0xc2a8e2], awn=[0xd64f4f,0x3f78c4,0x4fa28f,0xefc14d], cols=[0xd64f4f,0x3f78c4,0xefc14d,0xf2ede1,0x4fa28f,0xd27c3a,0x7a5fb8];
const leaf=[flat(0x2c7f3d),flat(0x3f9a48),flat(0x1f6a3a)], bark=flat(0x6b4a33), skins=[0xd9a27a,0xb97f58,0xeac4a0,0x8c5e3f], hairs=[0x5a3320,0x201a18,0x8a5a2c,0x34302c];
const shirtsM=[[0x5aa3c7,0x394a6e],[0xc98a2a,0x4b3a30],[0x69b96a,0x3a3a50],[0x47a7a0,0x4a3a30],[0xc95c3a,0x2d3440],[0xf07a22,0x2c3a5e]], shirtsW=[0xd55a6a,0x8f6fce,0xe88fb0,0xe5c048,0xf2e6c8,0x4fa28f,0xd27c3a];
const man=i=>person({shirt:shirtsM[i%6][0],pants:shirtsM[i%6][1],skin:skins[i%4],hair:hairs[(i>>1)%4]}); const wom=i=>woman({shirt:shirtsW[i%7],pants:0x2d3440,skin:skins[(i+1)%4],hair:hairs[(i+2)%4]});
const sparkle=()=>{ const f=teleportFx(0xffd8ea); f.scale.set(.75,1,.75); const up=f.userData.update; f.userData.update=(e,t)=>up(e*.4,t); return f; };
// ============ CITY (also overgrown future)
const city=new THREE.Scene(); city.fog=new THREE.Fog(0xf2c4ad,80,420); const cSky=skyDome(city,0x7f91d8,0xf2c4ad), cSun=softSun(city,-40,70,-260,70), cL=lights(city,80);
const gM=flat(0xb6b0a9), rM=flat(0x54565f); bx(city,2600,.04,2600,gM,0,-.02,0).castShadow=false; bx(city,10,.04,700,rM,0,.03,-100).castShadow=false; for(const s of [-1,1]) bx(city,7,.04,700,0xd8cfc2,s*8.5,.05,-100).castShadow=false;
for(let z=-200,i=0;z<80;z+=11,i++) for(const s of [-1,1]){ add(city,shop(10,pal[(i+(s>0?2:0))%7],awn[i%4],R),s*17,0,z,-s*Math.PI/2); city.add(tower(R,s*(28+R()*4),z,14,16+R()*40,11,pal[(i*3+(s>0?1:0))%7])); }
const trees=[], lamps=[]; for(let z=-150;z<60;z+=12) for(const s of [-1,1]){ lamps.push(add(city,lamp(flat(0x23262c),flat(0xf3dd9c)),s*5.6,.05,z)); trees.push(add(city,roundTree(R,leaf,bark,1),s*11.5,.05,z+6,R()*6)); }
const cars=[...Array(10)].map((_,i)=>add(city,car(cols[i%7]),i%2?2.4:-2.4,.05,4-i*14,i%2?0:Math.PI));
const crowd=[...Array(34)].map((_,i)=>{ const isW=i%2===0, m=isW?wom(i):man(i); city.add(m); const fx=isW?sparkle():null; if(fx) city.add(fx); const bag=isW&&i%4===0?bx(city,.4,.32,.15,[0xd64f4f,0x8f6fce,0xefc14d][i%3],0,0,0):null; return {m,isW,fx,bag,x:0,z0:R()*44-34,dir:i%3?1:-1,sp:.8+R()*.4,ph:R()*6,lane:(((i>>1)%2)?1:-1)*(6.6+((i>>2)%3)*1.1)}; });
// overgrowth for the future
const vines=new THREE.InstancedMesh(rock(1,0,R,.25),flat(0x3f8a3a),900); vines.frustumCulled=false; city.add(vines); const vd=[...Array(900)].map(()=>{ const s=R()<.5?-1:1; return [s*(11.6+R()*.4),R()*12,-150+R()*210,.5+R()*1.4]; });
const wild=[...Array(40)].map(()=>add(city,roundTree(R,leaf,bark,.8+R()*.8),(R()-.5)*14,0,-120+R()*170,R()*6)); const grass=new THREE.InstancedMesh(new THREE.ConeGeometry(.25,.9,4),flat(0x4f9a3a),1500); grass.frustumCulled=false; city.add(grass); const gd=[...Array(1500)].map(()=>[(R()-.5)*22,-150+R()*210,R()*6,.6+R()*.9]);
const deer=[]; 
// ============ HOSPITAL WARD
const ward=new THREE.Scene(); ward.background=C(0xdfeae6); ward.add(new THREE.HemisphereLight(0xffffff,0xc8d4d0,2.1)); { const d=new THREE.DirectionalLight(0xfff8f0,1.1); d.position.set(-6,8,4); d.castShadow=true; d.shadow.mapSize.set(2048,2048); Object.assign(d.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:40}); ward.add(d); }
bx(ward,14,.1,12,0xe8eef0,0,-.05,0).castShadow=false; for(let x=-6;x<=6;x+=1) bx(ward,.02,.012,12,0xd4dcde,x,.01,0).castShadow=false; bx(ward,14,3.4,.2,0xcfe4dc,0,1.7,-6); bx(ward,.2,3.4,12,0xcfe4dc,-7,1.7,0); bx(ward,.2,3.4,12,0xcfe4dc,7,1.7,0); bx(ward,14,.1,12,0xf4f4f0,0,3.4,0).castShadow=false;
for(const x of [-4.5,0,4.5]) bx(ward,2.2,1.3,.05,new THREE.MeshBasicMaterial({color:0xbfe2f2}),x,1.9,-5.88).castShadow=false;
const patients=[]; [-4.5,-1.5,1.5,4.5].forEach((x,i)=>{ for(const z of [-3.6,1.2]){ add(ward,hospitalBed(),x,0,z); const p=man(i+(z>0?2:0)); p.rotation.x=-Math.PI/2; p.position.set(x,.92,z+.9); p.userData.pose(0,0); ward.add(p); patients.push(p); bx(ward,1,.12,1,0x9ec4e8,x,.9,z+.5); add(ward,ivStand(),x+.8,0,z-.6); const mon=monitorStand(); add(ward,mon,x-.8,0,z-.7); patients.push(mon); } });
const nurses=[...Array(4)].map((_,i)=>{ const n=woman({shirt:0x6ec4c8,pants:0x6ec4c8,skin:skins[i%4],hair:hairs[i%4],dress:false}); ward.add(n); const fx=sparkle(); ward.add(fx); return {n,fx}; });
const doctor=person({shirt:0xf4f4f0,pants:0x3a3f49,hair:0x34302c}); ward.add(doctor); const trolley=new THREE.Group(); bx(trolley,1,.06,.6,0xb8bcc4,0,.9,0); bx(trolley,1,.06,.6,0xb8bcc4,0,.4,0); for(const [x,z] of [[-.45,-.25],[.45,-.25],[-.45,.25],[.45,.25]]) bx(trolley,.04,.9,.04,0x9aa0a8,x,.45,z); bx(trolley,.3,.03,.4,0xf8f8f4,.1,.95,0); add(ward,trolley,-5.6,0,-1.2,.3);
// ============ CLASSROOM
const cls=new THREE.Scene(); cls.background=C(0xf2e6d0); cls.add(new THREE.HemisphereLight(0xffffff,0xd8c8b0,2.1)); { const d=new THREE.DirectionalLight(0xfff0d8,1.2); d.position.set(8,7,3); d.castShadow=true; d.shadow.mapSize.set(2048,2048); Object.assign(d.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.5,far:40}); cls.add(d); }
bx(cls,12,.1,11,0xb8885a,0,-.05,0).castShadow=false; bx(cls,12,3.4,.2,0xf2dca8,0,1.7,-5.5); bx(cls,.2,3.4,11,0xf2dca8,-6,1.7,0); bx(cls,.2,3.4,11,0xf2dca8,6,1.7,0); bx(cls,6,1.8,.06,0x2f4a3a,0,1.7,-5.36); const chalk=textSign('Today: Maths  3 × 4 = ?',5.6,1.6,'#2f4a3a','#f4f4f0',{weight:400}); chalk.position.set(0,1.7,-5.32); cls.add(chalk); bx(cls,1.4,.8,.7,0x8a5a3c,-3.6,.4,-3.6);
for(const z of [-1.5,1.5,4.5]) bx(cls,.06,1.4,2,new THREE.MeshBasicMaterial({color:0xbfe2f2}),5.88,1.8,z-1.5).castShadow=false;
const pupils=[]; for(let r=0;r<3;r++) for(let c=0;c<4;c++){ const x=-3.3+c*2.2, z=-1.4+r*1.9; add(cls,schoolDesk(),x,0,z,Math.PI); const girl=(r*4+c)%2===1; const kid=girl?woman({shirt:shirtsW[(r+c)%7],skin:skins[(r+c)%4],hair:hairs[(c)%4]}):man(r+c); kid.scale.setScalar(.62); kid.position.set(x,-.02,z-.55); kid.rotation.y=Math.PI; cls.add(kid); kid.userData.sit(); const fx=girl?sparkle():null; if(fx){ fx.position.copy(kid.position); fx.scale.setScalar(.6); cls.add(fx); } const bag=girl?bx(cls,.35,.4,.2,[0xd64f4f,0x8f6fce,0xe88fb0][c%3],x+.3,.2,z-.5):null; pupils.push({kid,girl,fx,bag}); }
const teacher=woman({shirt:0x8f6fce,pants:0x2d3440,hair:0x201a18}); add(cls,teacher,1.8,0,-4.4,0); const tfx=sparkle(); add(cls,tfx,1.8,0,-4.4);
// ============ KITCHEN
const kit=new THREE.Scene(); kit.background=C(0xf4e2c8); kit.add(new THREE.HemisphereLight(0xffffff,0xd8c0a0,2)); { const d=new THREE.DirectionalLight(0xffe8c8,1.2); d.position.set(-5,7,5); d.castShadow=true; d.shadow.mapSize.set(2048,2048); Object.assign(d.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:30}); kit.add(d); }
bx(kit,10,.1,9,0xc8a07a,0,-.05,0).castShadow=false; bx(kit,10,3.2,.2,0xf2e0c0,0,1.6,-4.5); bx(kit,.2,3.2,9,0xe8d4b0,-5,1.6,0); add(kit,kitchenSet(),-1,0,-4); bx(kit,1.4,1.1,.06,new THREE.MeshBasicMaterial({color:0xbfe2f2}),-4.88,1.8,-1).rotation.y=Math.PI/2;
const steam=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.08,0),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5}),24); kit.add(steam);
bx(kit,2.4,.08,1.4,0x9a6b42,1,.8,.4); for(const [x,z] of [[-.1,-.2],[2.1,-.2],[-.1,1],[2.1,1]]) bx(kit,.08,.8,.08,0x7a5a3e,x,.4,z); for(let i=0;i<4;i++) bx(kit,.5,.04,.5,0xf8f8f4,.2+i*.6,.88,.4);
const basket=new THREE.Group(); bx(basket,.9,.55,.6,0xc8a06a,0,.28,0); for(let i=0;i<5;i++) bx(basket,.3,.12,.25,[0xd64f4f,0x3f78c4,0xf2e6c8,0xe5c048,0x69b96a][i],-.25+i*.12,.6+(i%2)*.06,0); add(kit,basket,3.2,0,-1.8);
const dad=person({shirt:0x5aa3c7,pants:0x394a6e,hair:0x201a18}); kit.add(dad); const babyB=bx(kit,.55,.32,.32,0xf2e6c8,0,0,0); const son=person({shirt:0xefc14d,pants:0x3f78c4,hair:0x5a3320,skin:0xb97f58}); son.scale.setScalar(.62); kit.add(son); const grandpa=person({shirt:0x8a8f99,pants:0x3a3f49,hair:0xdfe0dc}); kit.add(grandpa);
// ============ MATERNITY
const mat=new THREE.Scene(); mat.background=C(0xc8b0bc); mat.add(new THREE.HemisphereLight(0xfff4f8,0xb8a8b0,1.05)); { const d=new THREE.DirectionalLight(0xffe8d8,1.3); d.position.set(-7,6,2); d.castShadow=true; d.shadow.mapSize.set(2048,2048); Object.assign(d.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.5,far:40}); mat.add(d); }
bx(mat,12,.1,10,0xe8e2e6,0,-.05,0).castShadow=false; bx(mat,12,3.4,.2,0xd8a8c0,0,1.7,-5); bx(mat,.2,3.4,10,0xd8a8c0,-6,1.7,0); for(const z of [-2.5,1]) bx(mat,.06,1.6,2.4,new THREE.MeshBasicMaterial({color:0xfff2d8}),-5.88,1.9,z).castShadow=false; const msign=textSign('MATERNITY',3.4,.6,'#d888b0','#ffffff'); msign.position.set(0,2.9,-4.88); mat.add(msign);
for(let r=0;r<2;r++) for(let c=0;c<5;c++) add(mat,crib(),-4+c*2,0,-2.6+r*2.6); const mdoc=person({shirt:0xf4f4f0,pants:0x3a3f49,hair:0x34302c}); add(mat,mdoc,3.8,0,2.6,-2.4);
// ============ SHOTS
const SH=[[0,S(1),0],[S(1),S(2),1],[S(2),S(3),2],[S(3),S(4),3],[S(4),S(5),4],[S(5),S(6),5],[S(6),S(7),6],[S(7),DUR,7]]; window.SHOTS=SH.map(s=>[s[0],s[1]]); window.DURATION=DUR;
const wrap=(v,a,b)=>a+((v-a)%(b-a)+(b-a))%(b-a);
const fadeA=t=>1-ss(VAN-.1,VAN+.9,t), sparkE=t=>Math.exp(-(((t-VAN-.3)/.5)**2));
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=7; const u=(t-SH[k][0])/(SH[k][1]-SH[k][0]), sid=SH[k][2]; let scene;
 if(sid===0||sid===4||sid===6||sid===7){ scene=city; const fut=sid>=6, quiet=sid===4;
   cSky.top.value.set(fut?0x5a5aa6:quiet?0x8a92b8:0x7f91d8); cSky.low.value.set(fut?0xf6a56c:quiet?0xd8c4c0:0xf2c4ad); city.fog.color.copy(cSky.low.value); cL.d.color.set(fut?0xffa860:0xfff0d0); cL.d.intensity=fut?1.25:quiet?1.1:1.5; cL.h.intensity=fut?1.9:quiet?2:2.5; cSun.position.set(fut?-40:-40,fut?14:70,-260); cSun.material.color.set(fut?0xffb070:0xfff2a0);
   gM.color.set(fut?0x8a9a6a:0xb6b0a9); rM.color.set(fut?0x6a6c62:0x54565f);
   vd.forEach((q,i)=>{ D.position.set(q[0],q[1],q[2]); D.rotation.set(i,i,0); D.scale.setScalar(fut?q[3]:.001); D.updateMatrix(); vines.setMatrixAt(i,D.matrix); }); vines.instanceMatrix.needsUpdate=true; wild.forEach(w=>w.visible=fut); gd.forEach((q,i)=>{ D.position.set(q[0],.3*q[3],q[1]); D.rotation.set(0,q[2],0); D.scale.setScalar(fut?q[3]:.001); D.updateMatrix(); grass.setMatrixAt(i,D.matrix); }); grass.instanceMatrix.needsUpdate=true;
   cars.forEach((c,i)=>{ c.visible=!fut||i%3===0; c.rotation.z=fut?.04:0; c.position.y=fut?-.12:.05; });
   crowd.forEach((c,i)=>{ const {m}=c; let a=1; if(c.isW) a=sid===0?fadeA(t):0; const show=!fut&&(!quiet||(!c.isW&&i%3===0)); const z=wrap(c.z0+c.dir*Math.min(t,c.isW?VAN+1:t)*c.sp*(quiet?.6:1),-36,12); m.position.set(c.lane,.05,z); m.rotation.y=c.dir>0?0:Math.PI; m.userData.pose(t*6.5+c.ph,(c.isW&&t>VAN-.2)?.03:.5); fadeGroup(m,show?a:0); if(Math.hypot(c.lane-cam.position.x,z-cam.position.z)<3) m.visible=false;
     if(c.fx){ c.fx.position.set(c.lane,.05,z); c.fx.userData.update(sid===0?sparkE(t)*.8:0,t); } if(c.bag){ c.bag.visible=sid===0&&t>VAN+.2; c.bag.position.set(c.lane+.25,lg(.6,.16,ss(VAN+.2,VAN+.6,t)),z); } });
   if(sid===0){ cam.position.set(lg(5,5.4,u),lg(2.3,1.9,u),lg(18,15,u)); cam.lookAt(7.2,1.2,-8); }
   else if(sid===4){ cam.position.set(lg(3,2,u),lg(2,2.6,u),lg(18,14,u)); cam.lookAt(-2,2.4,-20); }
   else if(sid===6){ cam.position.set(lg(1.5,.5,u),1.7,lg(16,10,u)); cam.lookAt(-1,3.4,-30); }
   else { cam.position.set(lg(1,0,u),lg(10,60,u),lg(30,50,u)); cam.lookAt(0,2,-50); } }
 else if(sid===1){ scene=ward; nurses.forEach((o,i)=>{ const pos=[[-3.7,-2.4],[.6,1.9],[3.6,-2.6],[-.7,-3.2]][i]; o.n.position.set(pos[0],.05,pos[1]); o.n.rotation.y=i*1.3; o.n.userData.pose(0,.03); const a=1-ss(S(1)+.4,S(1)+1.4,t); fadeGroup(o.n,a); o.fx.position.copy(o.n.position); o.fx.userData.update(Math.exp(-(((t-S(1)-.8)/.45)**2))*.8,t); });
   doctor.position.set(lg(3.4,-2,u),.05,-1.25); doctor.rotation.y=-Math.PI/2; doctor.userData.pose(t*6.5,.5); patients.forEach((p,i)=>{ if(p.userData.line) p.userData.line.position.y=1.55+Math.sin(t*6+i)*.02; });
   cam.position.set(lg(5.4,4.6,u),lg(2.6,2.3,u),lg(6.2,5.4,u)); cam.lookAt(-1,.9,-1.2); }
 else if(sid===2){ scene=cls; const a=1-ss(S(2)+.3,S(2)+1.3,t), e=Math.exp(-(((t-S(2)-.7)/.45)**2))*.7; fadeGroup(teacher,a); teacher.userData.pose(0,.03); tfx.userData.update(e,t); pupils.forEach((p,i)=>{ if(p.girl){ fadeGroup(p.kid,a); p.kid.userData.sit(); p.fx.userData.update(e,t); } else { p.kid.rotation.y=Math.PI+Math.sin(t*.8+i)*.4*ss(S(2)+1.5,S(2)+3,t); } });
   cam.position.set(lg(2.6,2,u),lg(2.4,2.2,u),lg(6.6,5.8,u)); cam.lookAt(-.4,1,-2); }
 else if(sid===3){ scene=kit; dad.position.set(-1.6,.05,-2.8); dad.rotation.y=Math.PI*.15; dad.userData.pose(Math.sin(t*2)*.4,.25); babyB.position.set(-1.6+.2,1.25,-2.8+.4); son.position.set(1,-.02,1.3); son.rotation.y=Math.PI; son.userData.sit(); son.children[0].position.y=1.25; grandpa.position.set(2.4,-.28,1.3); grandpa.rotation.y=-Math.PI/2; grandpa.userData.sit();
   for(let i=0;i<24;i++){ const q=(t*.35+i/24)%1; D.position.set(-2.5+Math.sin(i*2.1+t)*.12*q,1.3+q*1.1,-4+Math.cos(i*1.7)*.12*q); D.scale.setScalar(1-q); D.rotation.set(0,0,0); D.updateMatrix(); steam.setMatrixAt(i,D.matrix); } steam.instanceMatrix.needsUpdate=true;
   cam.position.set(lg(4.6,4,u),lg(2,1.9,u),lg(6.4,5.6,u)); cam.lookAt(-.3,1.5,-1.6); }
 else { scene=mat; mdoc.userData.pose(0,.03); cam.position.set(lg(4.2,3.4,u),lg(2.2,1.9,u),lg(5.4,4.4,u)); cam.lookAt(-1.4,.8,-1.4); }
 renderer.render(scene,cam);
 const seg=SEG[Math.max(0,SEG.findLastIndex(s=>t>=s.start))]; $('title').style.opacity=(1-ss(SEG[0].lines[1].t-.6,SEG[0].lines[1].t-.1,t))*ss(0,.3,t); $('n').textContent=seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 $('fla').style.opacity=0; $('fade').style.opacity=ss(DUR-.5,DUR,t); };
window.renderAt(0); window.ready=true;
