import * as THREE from 'three';
import { rng, flat, shadow, ss, rock, roundTree, pine, person, woman, car, skyDome, softSun, lights, tower, textSign, fence, school, clinic, crane } from './kit.js';
const TL=await (await fetch('/onecountry_timeline.json')).json(), SEG=TL.segments, R=rng(2026), $=id=>document.getElementById(id), DUR=TL.duration, NS=SEG.length;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(58,1080/1920,.3,4000), D=new THREE.Object3D(), C=h=>new THREE.Color(h), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf2c4ad,140,620); const sky=skyDome(sc,0x7f91d8,0xf2c4ad), sun=softSun(sc,-120,160,-500,90), lt=lights(sc,90); lt.d.shadow.camera.far=400; lt.d.target.position.set(0,0,0); sc.add(lt.d.target);
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
// ---------- ground: country A (z>0) and country B (z<0)
const gA=flat(0x6fbf4f), gB=flat(0xb8b85a); bx(sc,3000,.04,1500,gA,0,-.04,750).castShadow=false; bx(sc,3000,.04,1500,gB,0,-.04,-750).castShadow=false;
bx(sc,14,.06,900,0x4a4c55,0,.02,0).castShadow=false; for(const s of [-1,1]) bx(sc,2.6,.2,900,0xcfcbc2,s*8.3,.1,0);
const dash=new THREE.InstancedMesh(new THREE.BoxGeometry(.25,.02,3),new THREE.MeshBasicMaterial({color:0xf2efe6}),110); for(let i=0;i<110;i++){ D.position.set(0,.06,420-i*8); D.updateMatrix(); dash.setMatrixAt(i,D.matrix); } sc.add(dash);
const stopL=bx(sc,6,.03,.5,0xf2efe6,-3.5,.06,5.2), stopR=bx(sc,6,.03,.5,0xf2efe6,3.5,.06,-5.2);
// ---------- border post
const post=new THREE.Group(); sc.add(post);
for(const x of [-9.8,9.8]) for(const z of [-3.6,3.6]) bx(post,.7,6,.7,0xe8e4dc,x,3,z);
bx(post,21,.7,8,0xf2efe6,0,6.3,0); bx(post,21.2,.25,8.2,0xd64f4f,0,6.05,0);
const booths=[6,-6].map(z=>{ const g=new THREE.Group(); g.position.set(0,0,z); bx(g,2.4,.25,5,0xcfcbc2,0,.12,0); bx(g,1.8,2.6,2.6,0xe8e4dc,0,1.55,0); bx(g,1.85,.8,2.65,0x8fc3dc,0,2.1,0); bx(g,2.2,.25,3,0x3a4a6a,0,2.95,0); post.add(g); return g; });
const signFront=[textSign('BORDER CONTROL',14,1.6,'#3a4a6a','#ffffff'),textSign('WELCOME · ONE WORLD',14,1.6,'#2f7fd0','#ffffff')], signBack=[textSign('BORDER CONTROL',14,1.6,'#3a4a6a','#ffffff'),textSign('WELCOME · ONE WORLD',14,1.6,'#2f7fd0','#ffffff')];
signFront.forEach(s=>{ s.position.set(0,7.6,4.05); post.add(s); }); signBack.forEach(s=>{ s.position.set(0,7.6,-4.05); s.rotation.y=Math.PI; post.add(s); }); for(const z of [4,-4]) bx(post,14.4,2,.15,0xf2efe6,0,7.6,z*0.995);
const arms=[[-7.2,4.6,1],[7.2,-4.6,-1]].map(([x,z,s])=>{ bx(post,.6,1.2,.6,0x3a3f49,x,.6,z); const p=new THREE.Group(); p.position.set(x,1.1,z); post.add(p); for(let i=0;i<7;i++) bx(p,1,.28,.28,i%2?0xf2efe6:0xd64f4f,s*(.5+i),0,0); p.userData.s=s; return p; });
// fence across the valley
const fences=[]; for(const s of [-1,1]) for(let i=0;i<14;i++){ const f=fence(12,0x9aa0a8); const x=s*(17+i*12); f.position.set(x,0,0); sc.add(f); const wire=bx(f,12,.06,.06,0x3a3f49,0,1.55,0); fences.push({f,d:i,x}); }
for(const s of [-1,1]){ const f=fence(6,0x9aa0a8); f.position.set(s*13,0,0); sc.add(f); fences.push({f,d:-1,x:s*13}); }
// watchtower
const wt=new THREE.Group(); wt.position.set(-19,0,4); sc.add(wt); for(const x of [-1.4,1.4]) for(const z of [-1.4,1.4]) bx(wt,.35,9,.35,0x6b5a48,x,4.5,z); bx(wt,3.8,.3,3.8,0x6b5a48,0,9,0); bx(wt,3.8,1.2,3.8,0x5a6a4a,0,9.7,0); bx(wt,4.4,.3,4.4,0x3a3f49,0,10.6,0); const lampW=bx(wt,.6,.4,.8,0xfff2a0,1.2,10.9,1.2);
// flags
const flagTex=f=>{ const c=document.createElement('canvas'); c.width=192; c.height=128; const q=c.getContext('2d'); f(q); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
const fA=flagTex(q=>{ q.fillStyle='#d64f4f'; q.fillRect(0,0,192,128); q.fillStyle='#fff'; q.fillRect(0,48,192,32); q.fillStyle='#d64f4f'; q.beginPath(); q.arc(96,64,11,0,7); q.fill(); });
const fB=flagTex(q=>{ ['#3f9a48','#f2d04d','#2f6bb0'].forEach((c,i)=>{ q.fillStyle=c; q.fillRect(i*64,0,64,128); }); q.fillStyle='#fff'; q.beginPath(); q.arc(96,64,16,0,7); q.fill(); });
const fW=flagTex(q=>{ q.fillStyle='#2f7fd0'; q.fillRect(0,0,192,128); q.strokeStyle='#fff'; q.lineWidth=5; q.beginPath(); q.arc(96,64,34,0,7); q.stroke(); q.beginPath(); q.ellipse(96,64,15,34,0,0,7); q.stroke(); q.beginPath(); q.moveTo(62,64); q.lineTo(130,64); q.stroke(); q.beginPath(); q.moveTo(70,46); q.lineTo(122,46); q.moveTo(70,82); q.lineTo(122,82); q.stroke(); });
const flags=[]; const mkFlag=(tex,x,z,h,ry)=>{ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=ry; sc.add(g); const pole=bx(g,.18,h,.18,0xdfe3e8,0,h/2,0); bx(g,.36,.3,.36,0xdfe3e8,0,h+.1,0); const geo=new THREE.PlaneGeometry(3.3,2.2,14,1); geo.translate(1.65,0,0); const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide})); m.castShadow=true; g.add(m); const o={g,m,h,base:geo.attributes.position.array.slice(),pole}; flags.push(o); return o; };
const flagA=mkFlag(fA,-11.5,7,10,0), flagB=mkFlag(fB,11.5,-7,10,Math.PI), flagW=mkFlag(fW,-19,-2,14,0);
const waveFlag=(o,t,a=1)=>{ const p=o.m.geometry.attributes.position; for(let i=0;i<p.count;i++){ const x=o.base[i*3]; p.setZ(i,Math.sin(x*1.6-t*5.5)*.22*(x/3.3)*a); p.setY(i,o.base[i*3+1]-x*.03*(1-a)); } p.needsUpdate=true; o.m.geometry.computeVertexNormals(); };
// exchange kiosk + coins
const kiosk=new THREE.Group(); kiosk.position.set(14.5,0,13); sc.add(kiosk); bx(kiosk,4.4,2.8,3,0xf2e6c8,0,1.4,0); bx(kiosk,4.8,.3,3.4,0x2f7fd0,0,2.95,0); bx(kiosk,3.2,.9,.1,0x8fc3dc,0,1.9,1.52); bx(kiosk,.15,2,.15,0x3a3f49,-1.8,4,1.2); bx(kiosk,.15,2,.15,0x3a3f49,1.8,4,1.2);
const board=[textSign('EXCHANGE\nUSD · EUR · INR · YEN',5,2.5,'#1c2233','#ffd27a'),textSign('ONE WORLD MONEY\n0% FEES',5,2.5,'#2f7fd0','#ffffff')]; board.forEach(b=>{ b.position.set(0,4.6,1.3); kiosk.add(b); });
const coinCols=[0xd8b04a,0xc8ccd2,0xc87a4a,0xe8d27a,0xa8b0b8], coins=[...Array(18)].map((_,i)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.12,14),new THREE.MeshLambertMaterial({color:coinCols[i%5],emissive:coinCols[i%5],emissiveIntensity:.15})); m.rotation.x=Math.PI/2; kiosk.add(m); return m; });
const bigCoin=new THREE.Group(); const bcm=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,.3,24),new THREE.MeshLambertMaterial({color:0xf2c64a,emissive:0xf2c64a,emissiveIntensity:.25})); bcm.rotation.x=Math.PI/2; bigCoin.add(bcm); const one=textSign('1',1.6,1.6,'#f2c64a','#8a5a1a'); one.position.z=.17; bigCoin.add(one); const one2=one.clone(); one2.position.z=-.17; one2.rotation.y=Math.PI; bigCoin.add(one2); bigCoin.position.set(0,7,1); kiosk.add(bigCoin);
// military trucks
const truck=(c)=>{ const g=new THREE.Group(), m=flat(c), dk=flat(0x22262e); bx(g,2.3,1.6,2,m,0,1.4,2.2); bx(g,2.1,.6,.1,flat(0x9fc6d8),0,1.8,3.22); bx(g,2.4,2.2,4.6,m,0,1.9,-1.2); for(const z of [2.2,-.4,-2.4]) for(const s of [-1,1]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.4,10),dk); w.rotation.z=Math.PI/2; w.position.set(s*1.15,.5,z); g.add(w); } return g; };
const trucks=[...Array(4)].map((_,i)=>{ const g=truck(0x5a6a3a); sc.add(g); return g; });
// school & clinic (built where the army leaves)
const sch=school(); sch.position.set(-24,0,-22); sch.rotation.y=.6; sc.add(sch); const cli=clinic(); cli.position.set(22,0,-36); cli.rotation.y=-.6; sc.add(cli);
// skyline for migration
const sky2=new THREE.Group(); sc.add(sky2); const pal=[0xb8a2e6,0xf6b172,0x7ec4bc,0xf0a79d,0xa9b4d8,0xeaa985,0xc2a8e2,0xe8dcc8]; for(let i=0;i<34;i++){ let x=(R()-.5)*260; if(Math.abs(x)<12) x+=x<0?-14:14; sky2.add(tower(R,x,-300-R()*80,14+R()*8,40+R()*R()*120,14,pal[i%8])); } for(let i=0;i<5;i++){ const c=crane(30+R()*20); c.position.set(-100+i*50,0,-280-R()*30); sky2.add(c); }
// mountains & trees
for(const s of [-1,1]) for(let i=0;i<10;i++){ const m=new THREE.Mesh(rock(40+R()*30,1,R,.18),flat([0x8a8a7a,0x7a8a6a,0x9a8e78][i%3])); m.scale.set(1,.75+R()*.4,1); m.position.set(s*(110+R()*60),-6,240-i*60); m.castShadow=true; sc.add(m); const cap=new THREE.Mesh(new THREE.ConeGeometry(14,10,6),flat(0xf2f4f8)); cap.position.set(m.position.x,m.position.y+40*m.scale.y+R()*6,m.position.z); }
const leaf=[flat(0x2c7f3d),flat(0x3f9a48),flat(0x1f6a3a)], bark=flat(0x6b4a33), trees=[]; for(let i=0;i<150;i++){ const x=(R()<.5?-1:1)*(24+R()*80), z=200-R()*420; if(Math.abs(z)<5||(Math.abs(x+19)<16&&Math.abs(z)<14)||(Math.abs(x-14.5)<7&&Math.abs(z-13)<6)||(x<0&&Math.abs(x+24)<16&&Math.abs(z+22)<12)||(x>0&&Math.abs(x-22)<12&&Math.abs(z+36)<12)) continue; const t=R()<.6?roundTree(R,leaf,bark,1+R()*.4):pine(R,leaf[2],bark,1.4+R()*.6); t.position.set(x,0,z); t.rotation.y=R()*6; sc.add(t); trees.push(t); }
// cars
const cars=[...Array(22)].map((_,i)=>{ const c=car([0xd64f4f,0x3f78c4,0xefc14d,0x4fa28f,0xf2efe6,0x8a5ac8,0xf09a4a][i%7]); c.userData={lane:i%2?3.5:-3.5,i:Math.floor(i/2)}; sc.add(c); return c; });
// people
const sh=[0xd64f4f,0x3f78c4,0xefc14d,0x4fa28f,0xb8a2e6,0xf6b172,0x7ec4bc,0xf0a79d,0x8a5ac8,0xe8dcc8];
const folk=[...Array(44)].map((_,i)=>{ const m=i%2?woman({shirt:sh[i%10],skin:[0xd9a27a,0x8a5a3a,0xf0c8a0,0xb07a4a][i%4],hair:[0x2a1a10,0x5a3320,0x1a1a1a,0xc89a5a][i%4]}):person({shirt:sh[(i+3)%10],pants:[0x394a6e,0x2a2a30,0x6a5a4a][i%3],skin:[0xd9a27a,0xf0c8a0,0x8a5a3a,0xb07a4a][i%4],hair:[0x1a1a1a,0x5a3320,0x2a1a10,0x8a6a4a][i%4]}); const bag=bx(m,.5,.7,.25,[0x3a4a6a,0xd64f4f,0x6b4a33,0x2a2a30][i%4],.55,.45,0); m.userData.bag=bag; m.userData.r=[R(),R(),R(),R()]; sc.add(m); return m; });
const guards=[[-1.7,7],[1.7,-7]].map(([x,z])=>{ const g=person({shirt:0x3a4a3a,pants:0x2a3a2a,hair:0x1a1a1a}); bx(g,.62,.18,.62,0x2a3a2a,0,1.98,0); g.position.set(x,.25,z); g.rotation.y=x<0?Math.PI/2:-Math.PI/2; sc.add(g); return g; });
// speech bubbles (languages)
const WORDS=['HELLO','HOLA','BONJOUR','NAMASTE','NI HAO','SALAAM','JAMBO','OLÁ','KONNICHIWA','PRIVET','CIAO','MERHABA','ANNYEONG','HALLO','SAWUBONA','SALUT'];
const bubbles=WORDS.map((w,i)=>{ const g=new THREE.Group(); const s=textSign(w,Math.max(1.6,w.length*.3+.6),.85,'#ffffff','#2a2f3a'); g.add(s); const tail=new THREE.Mesh(new THREE.ConeGeometry(.18,.4,3),new THREE.MeshBasicMaterial({color:0xffffff})); tail.rotation.z=Math.PI; tail.position.y=-.55; g.add(tail); sc.add(g); return g; });
// ---------- timeline
const SH=SEG.map((s,i)=>[i?s.start:0,i<NS-1?SEG[i+1].start:DUR]); window.SHOTS=SH; window.DURATION=DUR;
const E=[ // sky top, sky low, sun pos, sun col, sun size, light col, light int, hemi, fog far
 [0x8a96b8,0xd8d4d0,[-140,120,-500],0xfff2d0,70,0xf0ecf0,1.1,2.4,560],
 [0x6f9ae0,0xf2dcc0,[120,90,-500],0xfff2a0,90,0xfff0d0,1.6,2.5,620],
 [0x6f9ae0,0xf0e0c8,[100,170,-500],0xfff2a0,90,0xfff4e0,1.6,2.5,620],
 [0x6f9ae0,0xf0e0c8,[-100,170,-500],0xfff2a0,90,0xfff4e0,1.6,2.5,640],
 [0x7f91d8,0xf2c4ad,[-120,150,-500],0xfff2a0,90,0xfff0d0,1.5,2.5,620],
 [0x7f91d8,0xf2d0b8,[100,150,-500],0xfff2a0,90,0xfff0d0,1.5,2.5,620],
 [0x7a88cc,0xf2c09a,[60,90,-520],0xffd080,100,0xffd8b0,1.4,2.3,760],
 [0x5a5aa0,0xf29a6a,[-60,40,-520],0xffa060,140,0xffb080,1.3,1.9,700]];
const P=(a,b,c,d,u)=>{ cam.position.lerpVectors(V(...a),V(...b),u); cam.lookAt(V(...c).lerp(V(...(d||c)),u)); };
const wrap=(z,a,b)=>((z-a)%(b-a)+(b-a))%(b-a)+a;
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=NS-1; const T0=SH[k][0], u=(t-T0)/(SH[k][1]-T0), su=ss(0,1,u), e=E[k];
 sky.top.value.set(e[0]); sky.low.value.set(e[1]); sc.fog.color.set(e[1]); sc.fog.far=e[8]; sun.position.set(...e[2]); sun.material.color.set(e[3]); sun.scale.setScalar(e[4]); lt.d.color.set(e[5]); lt.d.intensity=e[6]; lt.h.intensity=e[7]; lt.d.position.set(e[2][0]*.25,120,e[2][2]*.12+60);
 gB.color.set(0xb8b85a).lerp(C(0x6fbf4f),k===0?0:k===1?ss(.3,1,u)*.85:.85);
 // camera
 let cut=0;
 switch(k){
 case 0: if(u<.5) P([46,74,96],[30,52,70],[0,0,-10],[0,0,-6],ss(0,1,u/.5)); else P([-8.5,2.3,62],[-8.2,2.6,48],[-3,2,0],[-2,2.4,0],ss(0,1,(u-.5)/.5)); break;
 case 1: if(u<.45) P([-14.5,2.3,15],[-13.8,2.6,13],[-4,2,4.6],[-4,2.8,4.6],ss(0,1,u/.45)); else P([34,20,34],[44,24,22],[12,0,-2],[16,0,-4],ss(0,1,(u-.45)/.55)); break;
 case 2: if(u<.5) P([11.5,2.4,25],[12.8,3.2,20.5],[14.5,4,13],[14.5,4.4,13],ss(0,1,u/.5)); else P([21,3,27],[19.5,3.6,24.5],[14.5,6,13],[14.5,6.4,13],ss(0,1,(u-.5)/.5)); break;
 case 3: if(u<.34) P([-5,3.4,24],[-7,4.4,19],[-19,6,4],[-19,7,4],ss(0,1,u/.34)); else if(u<.68) P([26,30,46],[18,34,38],[-4,0,-14],[-4,0,-22],ss(0,1,(u-.34)/.34)); else if(u<.84) P([-3.5,3,-6],[-4.5,3.4,-8],[-24,7,-22],[-24,7.4,-22],ss(0,1,(u-.68)/.16)); else P([4,3,-16],[5,3.4,-18],[22,7,-36],[22,7.4,-36],ss(0,1,(u-.84)/.16)); break;
 case 4: if(u<.45) P([-4.5,1.8,17],[-5.5,2.2,16],[-11.5,7,7],[-11.5,5,7],ss(0,1,u/.45)); else P([-7,2.2,10],[-9,2.6,9],[-19,9,-2],[-19,13,-2],ss(0,1,(u-.45)/.55)); break;
 case 5: if(u<.55) P([-5,3.4,12],[-8,3.8,9.5],[-19,2.6,-3],[-19,2.8,-3],ss(0,1,u/.55)); else P([-8,13,8],[-12,11,5],[-19,1.5,-3],[-19,1.5,-3],ss(0,1,(u-.55)/.45)); break;
 case 6: P([10,40,70],[4,26,24],[0,0,-110],[0,14,-260],su); break;
 default: if(u<.4) P([-13.5,1.8,7],[-14.5,2.4,5],[-19,10,-2],[-19,12.5,-2],ss(0,1,u/.4)); else P([-8,8,34],[14,62,96],[-6,4,-10],[0,0,-60],ss(0,1,(u-.4)/.6)); }
 // gates, fence, signs
 const open=k===0?0:k===1?ss(.12,.32,u):1; arms.forEach(a=>a.rotation.z=a.userData.s*open*1.35);
 fences.forEach(q=>{ const fall=k===0?0:k===1?ss(.4+q.d*.03,.55+q.d*.03,u):1; q.f.rotation.x=fall*1.5; q.f.visible=!(k>=2&&false); q.f.position.y=k>=3?-2:0; });
 const sw=k===0?0:k===1?(u>.4?1:0):1; signFront.forEach((s,i)=>s.visible=i===sw); signBack.forEach((s,i)=>s.visible=i===sw);
 guards.forEach((g,i)=>{ g.visible=k===0; g.userData.pose(0,0); });
 // watchtower & trucks
 wt.visible=k<=3; wt.position.y=k<3?0:-ss(.38,.62,u)*12; lampW.material.color.set(k===0?0xfff2a0:0x5a5a50);
 trucks.forEach((g,i)=>{ const z0=-10-i*7; g.visible=k<=3; let z=z0, x=13+(i%2)*3.5; if(k===3){ const d=ss(.36,.9,u+i*.03); x=lg(x,3.5,ss(0,.15,d)); z=z0-d*170; } g.position.set(x,0,z); g.rotation.y=Math.PI; if(k===3&&u>.68) g.visible=false; });
 const grow=k<3?0:k===3?ss(.62,.82,u):1; [sch,cli].forEach(b=>{ b.visible=grow>.01; b.scale.set(1,Math.max(.01,grow),1); });
 // kiosk & coins
 kiosk.visible=k<=2||k===5; const flip=k<2?0:k===2?(u>.42?1:0):1; board.forEach((b,i)=>b.visible=i===flip); const merge=k===2?ss(.4,.62,u):k>2?1:0;
 coins.forEach((c,i)=>{ const a=i/18*6.283+t*.9, r=2.4+(i%3)*.4; c.position.set(Math.cos(a)*r*(1-merge),6.5+Math.sin(a*2+i)*.5*(1-merge)+merge*.5,1+Math.sin(a)*r*.6*(1-merge)); c.rotation.z=t*2+i; c.scale.setScalar(1-merge*.95); c.visible=k===2&&merge<.98; });
 bigCoin.visible=k===2&&merge>.05; bigCoin.scale.setScalar(Math.max(.01,ss(.5,.7,u))); bigCoin.rotation.y=t*1.6;
 // flags
 const downA=k<4?0:k===4?ss(.05,.4,u):1, upW=k<4?0:k===4?ss(.45,.85,u):1;
 [[flagA,downA],[flagB,downA]].forEach(([f,d])=>{ f.m.position.y=lg(f.h-1.2,1.4,d); f.m.visible=d<.98; waveFlag(f,t); });
 flagW.g.visible=k>=4; flagW.m.position.y=lg(1.6,flagW.h-1.2,upW); waveFlag(flagW,t,k===7?1:1);
 // cars
 cars.forEach((c,j)=>{ const q=c.userData, L=q.lane<0; let x=q.lane, z, ry=L?Math.PI:0, vis=true;
  if(k===0){ z=L?7+q.i*6.2+Math.max(0,Math.sin(t*.7+q.i)*.0):-7-q.i*6.2; }
  else if(k===1){ const go=Math.max(0,t-(T0+(SH[1][1]-T0)*.3)); const z0=L?7+q.i*6.2:-7-q.i*6.2; z=L?z0-go*go*1.6:z0+go*go*1.6; if(go>3.5) z=L?z0-(19.6+(go-3.5)*11):z0+(19.6+(go-3.5)*11); z=wrap(z,-160,160); }
  else if(k===6){ ry=Math.PI; x=q.lane+(L?0:0); z=wrap(70+q.i*-9+(L?0:4)-(t-T0)*6,-200,120); }
  else if(k===7){ z=wrap((L?-1:1)*(t*12)+q.i*40,-200,200); vis=q.i%5===0; }
  else { z=wrap((L?-1:1)*(t*11)+q.i*26+(L?0:13),-180,180); }
  c.position.set(x,0,z); c.rotation.y=ry; c.visible=vis&&cam.position.distanceTo(c.position)>3.5; });
 // people
 folk.forEach((m,i)=>{ const r=m.userData.r; let x=0,z=0,ry=0,walk=0,vis=true,bag=false;
  if(k===0){ vis=i<14; x=-8.3+(i%2?.5:-.3); z=6.5+i*1.5; ry=Math.PI; bag=i%3!==1; }
  else if(k===1){ const dir=i%2?1:-1; bag=true; walk=1; if(i<16){ x=(i%4<2?-8.3:8.3)+(r[0]-.5)*.6; z=wrap(dir*(t-T0)*1.5+i*5,-40,40); ry=dir>0?0:Math.PI; } else { x=(i%2?1:-1)*(16+r[0]*40); z=wrap(dir*(t-T0)*1.4*Math.max(0,Math.sign(u-.5))+r[1]*30-15+(u>.5?0:0),-30,30); walk=u>.5?1:0; ry=dir>0?0:Math.PI; } }
  else if(k===2){ vis=i<10; const a=i/10*6.283; x=14.5+Math.cos(a)*(2.6+r[0])*(i<4?.6:1); x=14.5+(i%2?1:-1)*(3+r[0]*2.5); z=13.5+(i/10)*4; ry=Math.atan2(14.5-x,13-z); }
  else if(k===4||k===5){ vis=i<38; const a=i*2.399, rr=2.6+Math.sqrt(i)*1.25; x=-19+Math.cos(a)*rr; z=-2+Math.sin(a)*rr*.85; ry=Math.atan2(-19-x,-2-z)+(k===5?(r[2]-.5)*1.4:0); }
  else if(k===6){ bag=true; walk=1; ry=Math.PI; x=(i%3===0?(i%2?-8.3:8.3):(i%2?1:-1)*(10+r[0]*30)); z=wrap(40-i*4-(t-T0)*1.6,-120,60); }
  else if(k===3){ vis=i<10&&u<.68; walk=1; const dir=i%2?1:-1; x=(i%2?8.3:-8.3); z=wrap(dir*t*1.4+i*9,-50,50); ry=dir>0?0:Math.PI; }
  else { vis=i===0; x=-15.5; z=1.5; ry=Math.atan2(-19-x,-2-z); }
  m.position.set(x,(Math.abs(x)>7&&Math.abs(x)<9.6)?.2:0,z); m.rotation.y=ry; m.userData.bag.visible=bag; m.userData.pose(walk?t*6.5+i:0,walk?.5:0); if(k===4&&u>.6&&i%3===0){ m.children[5].rotation.x=-2.6; }
  m.visible=vis&&cam.position.distanceTo(m.position)>(k===1?4.5:2.4); });
 bubbles.forEach((b,i)=>{ const p=folk[i*2+1]; b.visible=k===5&&p.visible&&ss(.04+i*.035,.1+i*.035,u)>0; if(b.visible){ b.position.set(p.position.x,2.75+Math.sin(t*2+i)*.08,p.position.z); b.quaternion.copy(cam.quaternion); b.scale.setScalar(ss(.04+i*.035,.1+i*.035,u)); } });
 sky2.visible=k>=6; sky2.scale.y=k===6?lg(.6,1,su):1; post.visible=true; stopL.visible=stopR.visible=k===0;
 renderer.render(sc,cam);
 const seg=SEG[k]; $('title').style.opacity=(1-ss(SEG[0].lines[0].t+SEG[0].lines[0].d,SEG[0].lines[0].t+SEG[0].lines[0].d+.5,t))*ss(0,.3,t); $('n').textContent=seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 const dip=k>0?1-ss(0,.45,t-SH[k][0]):0; $('fla').style.background='#000'; $('fla').style.opacity=dip*.75; $('fade').style.opacity=ss(DUR-.5,DUR,t); };
window.renderAt(0); window.ready=true;
