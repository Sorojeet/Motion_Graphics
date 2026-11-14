import * as THREE from 'three';
import { rng, flat, shadow, ss, rock, person, woman, car, lamp, skyDome, tower, textSign } from './kit.js';
const TL=await (await fetch('/moon_timeline.json')).json(), LN=TL.lines, EV=TL.events, R=rng(1507), $=id=>document.getElementById(id), DUR=TL.duration;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.1,6000), D=new THREE.Object3D(), C=h=>new THREE.Color(h), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0x0a1226,80,700); const sky=skyDome(sc,0x02040c,0x0f1a36);
const _k=0; const hemi=new THREE.HemisphereLight(0x6a7ab8,0x1a1420,.7); sc.add(hemi); const keyL=new THREE.DirectionalLight(0x9aaae8,.6); keyL.castShadow=true; keyL.shadow.mapSize.set(2048,2048); Object.assign(keyL.shadow.camera,{left:-60,right:60,top:60,bottom:-60,near:1,far:300}); keyL.position.set(-40,80,60); sc.add(keyL); sc.add(keyL.target);
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=(c,o={})=>new THREE.MeshBasicMaterial({color:c,...o});
const look=(p,v)=>{ p.children[1].rotation.x=-v; };
// ---------- stars (shared by all night/space sets)
const stars=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),glowM(0xdfe6ff,{fog:false}),1400); for(let i=0;i<1400;i++){ const d=V(R()-.5,R()*.9+.02,R()-.5).normalize(); if(i>900) d.y=-(R()-.5); D.position.copy(d.normalize().multiplyScalar(1200)); D.scale.setScalar(.8+R()*1.8); D.updateMatrix(); stars.setMatrixAt(i,D.matrix); } sc.add(stars);
// ---------- the Moon in the sky (with its thousands of lights)
const MOONP=V(60,170,420); const moonG=new THREE.Group(); moonG.position.copy(MOONP); sc.add(moonG);
const moonM=new THREE.MeshLambertMaterial({color:0xd8d4c8,emissive:0x4a4a44,flatShading:true,fog:false}); const moonS=new THREE.Mesh(new THREE.IcosahedronGeometry(30,2),moonM); moonG.add(moonS);
for(let i=0;i<14;i++){ const d=V(R()-.5,R()-.5,R()*.6+.2).normalize(), c=new THREE.Mesh(new THREE.CircleGeometry(2+R()*5,8),new THREE.MeshLambertMaterial({color:0xa8a49a,emissive:0x2a2a28,fog:false})); c.position.copy(d.multiplyScalar(30.05)); c.lookAt(0,0,0); c.rotateY(Math.PI); moonG.add(c); }
const ML=1500, mLights=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.6,0),glowM(0x7ff0ff,{fog:false}),ML); moonG.add(mLights); const mld=[...Array(ML)].map(()=>[V(R()-.5,R()-.5,R()*.9+.05).normalize(),R()]);
const moonGlow=new THREE.Mesh(new THREE.SphereGeometry(48,24,16),glowM(0x7ff0ff,{transparent:true,opacity:0,fog:false,depthWrite:false})); moonG.add(moonGlow);
// ======================= CITY (coastal, night)
const city=new THREE.Group(); sc.add(city);
bx(city,1200,.04,600,0x161a22,0,-.04,-290).castShadow=false; bx(city,1200,.06,10,0x22242c,0,.01,-2).castShadow=false; bx(city,1200,.3,8,0x4a4e58,0,.15,6); bx(city,1200,1.6,.6,0x6a6e78,0,.5,10);
const seaGeo=new THREE.PlaneGeometry(1400,700,70,35); seaGeo.rotateX(-Math.PI/2); seaGeo.translate(0,0,360); const sea=new THREE.Mesh(seaGeo,new THREE.MeshLambertMaterial({color:0x2f6aaa,flatShading:true,emissive:0x0a1a33})); city.add(sea); const seaBase=seaGeo.attributes.position.array.slice();
const flood=new THREE.Mesh(new THREE.BoxGeometry(1200,1,26),new THREE.MeshLambertMaterial({color:0x3f7ac0,transparent:true,opacity:.86,emissive:0x0a1a33})); flood.position.set(0,-1,-1); city.add(flood);
const pier=new THREE.Group(); city.add(pier); bx(pier,4,.4,34,0x6b5a48,0,1.2,27); for(let z=12;z<44;z+=4) for(const s of [-1,1]) bx(pier,.3,3,.3,0x4a3a2a,s*1.8,0,z); for(const s of [-1,1]) bx(pier,.12,1,34,0x8a7a68,s*1.9,1.9,27);
const winMats=[]; const pal=[0x2a3044,0x342c40,0x283844,0x3a3a48];
for(let i=0;i<34;i++){ const x=-170+i*10+(R()-.5)*3, z=-14-R()*30-(i%3)*18; const g=tower(R,x,z,8+R()*5,14+R()*R()*60,10,pal[i%4]); city.add(g); const im=g.children[2]; for(let j=0;j<im.count;j++) im.setColorAt(j,C(R()<.65?0xffe2a0:0x10121a)); im.instanceColor.needsUpdate=true; im.material=im.material.clone(); im.material.color.set(0xffffff); winMats.push(im.material); }
const lamps=[]; for(let i=0;i<14;i++){ const lm=lamp(flat(0x2a2c32),glowM(0xffe2a0)); lm.position.set(-90+i*14,.3,8.6); city.add(lm); lamps.push(lm); }
const cityL=[...Array(5)].map((_,i)=>{ const l=new THREE.PointLight(0xffc880,14,30); l.position.set(-40+i*20,7,5); city.add(l); return l; });
const ccars=[...Array(8)].map((_,i)=>{ const c=car([0x3f78c4,0xd64f4f,0xefc14d,0xf2efe6,0x4fa28f,0x8a5ac8,0x6a6e78,0x3a3a40][i]); c.position.set(-60+i*16,0,i%2?-4.5:.5); c.rotation.y=Math.PI/2; city.add(c); return c; });
const police=[...Array(3)].map((_,i)=>{ const c=car(0xf2efe6); bx(c,1.6,.1,4.2,0x1a1c22,0,.95,0).castShadow=false; const r=bx(c,.6,.22,.4,glowM(0xff2020),-.35,1.15,0), b=bx(c,.6,.22,.4,glowM(0x2050ff),.35,1.15,0); const pl=new THREE.PointLight(0xff2020,0,14); pl.position.y=2; c.add(pl); c.userData={r,b,pl}; c.position.set(-14+i*12,0,-2); c.rotation.y=Math.PI/2+i*.3; city.add(c); return c; });
const shirts=[0xd64f4f,0x3f78c4,0xefc14d,0x4fa28f,0x8a5ac8,0xf09a4a,0xb8a2e6,0x7ec4bc];
const crowd=[...Array(36)].map((_,i)=>{ const m=i%2?woman({shirt:shirts[i%8]}):person({shirt:shirts[(i+3)%8],pants:0x2a2f3a}); const ph=bx(m,.14,.24,.04,glowM(0xbfe0ff),.38,0,.0); ph.visible=false; m.userData.ph=ph; m.userData.r=[R(),R(),R()]; city.add(m); return m; });
const hero=person({shirt:0x2a3a5a,pants:0x1a1c22,hair:0x1a1210}); city.add(hero);
// ======================= CONTROL ROOM
const ctl=new THREE.Group(); sc.add(ctl); ctl.position.set(0,0,-3000);
bx(ctl,24,.1,16,0x1a1c24,0,-.05,0); bx(ctl,24,.1,16,0x14161c,0,6,0); bx(ctl,24,6,.2,0x20232c,0,3,-8); for(const s of [-1,1]) bx(ctl,.2,6,16,0x20232c,s*12,3,0);
const scrCv=document.createElement('canvas'); scrCv.width=1024; scrCv.height=576; const sx=scrCv.getContext('2d'), scrT=new THREE.CanvasTexture(scrCv); scrT.colorSpace=THREE.SRGBColorSpace;
const wall=new THREE.Mesh(new THREE.PlaneGeometry(9.6,5.4),glowM(0xffffff,{map:scrT})); wall.position.set(0,3.1,-7.85); ctl.add(wall); bx(ctl,10,5.8,.1,0x0a0a0e,0,3.1,-7.92);
const sideCv=document.createElement('canvas'); sideCv.width=256; sideCv.height=160; const sd=sideCv.getContext('2d'); sd.fillStyle='#061018'; sd.fillRect(0,0,256,160); sd.strokeStyle='#3fd08a'; sd.lineWidth=3; sd.beginPath(); for(let x=0;x<256;x+=4) sd.lineTo(x,80+Math.sin(x*.07)*30*Math.sin(x*.013)); sd.stroke(); const sideT=new THREE.CanvasTexture(sideCv);
for(const s of [-1,1]) for(let j=0;j<2;j++){ const p=new THREE.Mesh(new THREE.PlaneGeometry(3,1.9),glowM(0xffffff,{map:sideT})); p.position.set(s*8,2.4+j*2.1,-7.85); ctl.add(p); }
const desks=[]; for(let r=0;r<2;r++) for(let i=0;i<3;i++){ const x=-6+i*6, z=-2.5+r*4; bx(ctl,4.4,.9,1.4,0x2a2e38,x,.45,z); for(const o of [-1,1]){ const m=new THREE.Mesh(new THREE.BoxGeometry(1.3,.8,.06),glowM(0x2a6a9a)); m.position.set(x+o*1,1.4,z-.5); ctl.add(m); } desks.push([x,z]); }
const sci=desks.slice(0,5).map(([x,z],i)=>{ const m=(i%2?woman:person)({shirt:0xf2f2ee,pants:0x2a2f3a,hair:[0x2a1a10,0x8a6a4a,0x1a1a1a][i%3]}); m.userData.sit(); m.position.set(x+(i%2?.6:-.6),-.05,z+.9); m.rotation.y=Math.PI; ctl.add(m); return m; });
const redAlarm=new THREE.PointLight(0xff2020,0,30); redAlarm.position.set(0,5,0); ctl.add(redAlarm); const ctlL=new THREE.PointLight(0x9fd0ff,12,30); ctlL.position.set(0,4.5,-3); ctl.add(ctlL);
let scrMode='', scrLast='';
const drawScreen=(mode,t)=>{ const anim=['tide','radar','wave','decode'].includes(mode); const key=mode+(anim?(t*30|0):''); if(key===scrLast) return; scrLast=key; const W=1024,H=576; sx.fillStyle=mode==='warning'?'#2a0408':'#050b14'; sx.fillRect(0,0,W,H); sx.strokeStyle='#123048'; sx.lineWidth=1; for(let x=0;x<W;x+=64){ sx.beginPath(); sx.moveTo(x,0); sx.lineTo(x,H); sx.stroke(); } for(let y=0;y<H;y+=64){ sx.beginPath(); sx.moveTo(0,y); sx.lineTo(W,y); sx.stroke(); }
 sx.textAlign='left'; sx.font='600 30px Jost'; sx.fillStyle='#7fc8ff';
 if(mode==='tide'){ sx.textAlign='center'; sx.fillText('GLOBAL TIDE MONITOR',W/2,60); sx.textAlign='left'; sx.strokeStyle='#3fd0ff'; sx.lineWidth=4; sx.beginPath(); for(let x=0;x<W;x+=6){ const p=x/W, chaos=ss(.45,.6,p); sx.lineTo(x,300+Math.sin(x*.025)*60*(1-chaos)+chaos*(Math.sin(x*.11+t*3)*120+Math.sin(x*.043)*70)); } sx.stroke(); sx.fillStyle='#ff5050'; sx.textAlign='center'; sx.fillText('⚠ ANOMALY',W/2,520); }
 if(mode==='radar'){ sx.textAlign='center'; sx.fillText('DEEP SPACE SCAN · LUNAR ORBIT',W/2,40); const cx=512,cy=310; sx.strokeStyle='#2a8a5a'; sx.lineWidth=2; for(const r of [70,140,210,250]){ sx.beginPath(); sx.arc(cx,cy,r,0,7); sx.stroke(); } const a=t*2.2; const g=sx.createConicGradient?sx.createConicGradient(a-.6,cx,cy):null; sx.fillStyle='rgba(63,208,138,.25)'; sx.beginPath(); sx.moveTo(cx,cy); sx.arc(cx,cy,250,a-.6,a); sx.fill(); sx.strokeStyle='#3fd08a'; sx.lineWidth=3; sx.beginPath(); sx.moveTo(cx,cy); sx.lineTo(cx+Math.cos(a)*250,cy+Math.sin(a)*250); sx.stroke(); sx.fillStyle='#ff5050'; sx.font='600 34px Jost'; sx.textAlign='center'; sx.fillText('NO OBJECT FOUND',cx,H-14); }
 if(mode==='wave'){ sx.textAlign='center'; sx.fillText('ALL OBSERVATORIES · 00:00:00',W/2,60); sx.textAlign='left'; sx.strokeStyle='#ffd27a'; sx.lineWidth=4; sx.beginPath(); for(let x=0;x<W;x+=4){ const p=(x/W*6+t*1.5)%1; sx.lineTo(x,300+(p<.12?Math.sin(p*90)*170:Math.sin(x*.3)*6)); } sx.stroke(); sx.fillStyle='#ffd27a'; sx.textAlign='center'; sx.fillText('SIGNAL DETECTED',W/2,520); }
 if(mode==='decode'){ sx.textAlign='center'; sx.fillText('DECODING SIGNAL...',W/2,60); sx.textAlign='left'; sx.font='500 34px monospace'; sx.fillStyle='#3fd08a'; const g='▲◆●■◇○△▽※⊕⊗∴≡∆'; for(let r=0;r<9;r++){ let s=''; for(let c=0;c<14;c++) s+=g[(r*7+c*3+(t*12|0))%g.length]; sx.fillText(s,250,110+r*48); } }
 if(mode==='nodistress'){ sx.textAlign='center'; sx.font='600 44px Jost'; sx.fillStyle='#7fc8ff'; sx.fillText('MESSAGE TYPE:',W/2,220); sx.fillStyle='#ffffff'; sx.font='600 52px Jost'; sx.fillText('DISTRESS CALL?',W/2,300); sx.fillStyle='#ff4040'; sx.font='700 120px Jost'; sx.fillText('✕',W/2,470); }
 if(mode==='warning'){ sx.textAlign='center'; sx.fillStyle='#ff3030'; sx.font='700 104px Jost'; sx.fillText('WARNING',W/2,320); sx.font='600 28px Jost'; sx.fillStyle='#ffb0b0'; sx.fillText('ORIGIN: BEYOND MARS ORBIT',W/2,400); }
 scrT.needsUpdate=true; };
// ======================= OBSERVATORIES
const obs=new THREE.Group(); sc.add(obs); obs.position.set(3000,0,0); const hill=new THREE.Mesh(rock(70,1,R,.12),flat(0x2a2e38)); hill.scale.y=.22; obs.add(hill);
const domes=[[-14,8,-4],[0,11,-12],[16,7,-2]].map(([x,y,z])=>{ const g=new THREE.Group(); g.position.set(x,y,z); obs.add(g); bx(g,7,4,7,0xd8dce4,0,2,0); const rot=new THREE.Group(); rot.position.y=4; g.add(rot); const dm=new THREE.Mesh(new THREE.SphereGeometry(3.8,14,8,0,Math.PI*2,0,Math.PI/2),flat(0xe8ecf2)); dm.castShadow=true; rot.add(dm); const slit=new THREE.Mesh(new THREE.BoxGeometry(1.4,4.2,4),flat(0x0a0c12)); slit.position.set(0,1.8,1.6); slit.rotation.x=-.5; rot.add(slit); const tube=new THREE.Group(); tube.position.y=1.2; rot.add(tube); const tm=new THREE.Mesh(new THREE.CylinderGeometry(.7,.6,5.5,10),flat(0x3a3f4a)); tm.rotation.x=Math.PI/2; tm.position.z=1.6; tube.add(tm); g.userData={rot,tube}; return g; });
// ======================= SPACE: Earth, empty orbit, satellites
const space=new THREE.Group(); sc.add(space); space.position.set(0,0,3000);
const sun=new THREE.DirectionalLight(0xfff4e0,2.2); sun.position.set(-200,60,120); space.add(sun); space.add(sun.target);
const earth=new THREE.Group(); space.add(earth); const eMat=new THREE.MeshLambertMaterial({color:0x1f4a8a,flatShading:true}); earth.add(new THREE.Mesh(new THREE.IcosahedronGeometry(30,3),eMat)); const landM=new THREE.MeshLambertMaterial({color:0x3f8a4a,flatShading:true});
const landDirs=[]; for(let i=0;i<30;i++){ const d=V(R()-.5,(R()-.5)*1.5,R()-.5).normalize(), m=new THREE.Mesh(rock(4+R()*6,1,R,.25),landM); m.position.copy(d).multiplyScalar(28.8); m.lookAt(0,0,0); m.scale.z=.35; earth.add(m); landDirs.push(d); }
const NL=900, eLights=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.5,.5),glowM(0xffd27a),NL); earth.add(eLights); const eld=[...Array(NL)].map(()=>{ const d=landDirs[Math.floor(R()*landDirs.length)].clone().add(V((R()-.5)*.2,(R()-.5)*.2,(R()-.5)*.2)).normalize(); return d; });
const orbit=new THREE.Group(); space.add(orbit); for(let i=0;i<90;i++){ if(i%2) continue; const a=i/90*6.283, m=new THREE.Mesh(new THREE.BoxGeometry(2.4,.25,.25),glowM(0x7fb8ff,{transparent:true,opacity:.6})); m.position.set(Math.cos(a)*120,0,Math.sin(a)*120); m.rotation.y=-a+Math.PI/2; orbit.add(m); } orbit.rotation.x=.18;
const ghost=new THREE.Mesh(new THREE.IcosahedronGeometry(8,1),glowM(0x7fb8ff,{wireframe:true,transparent:true,opacity:.35})); ghost.position.set(120,0,0); orbit.add(ghost);
const sats=[...Array(6)].map((_,i)=>{ const g=new THREE.Group(); bx(g,1.4,1.4,2,0x8a8f99,0,0,0); for(const s of [-1,1]) bx(g,3.4,.1,1.5,0x2a4a8a,s*2.6,0,0); const cone=new THREE.Mesh(new THREE.ConeGeometry(9,40,16,1,true),glowM(0x7ff0ff,{transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false})); cone.rotation.x=-Math.PI/2; cone.position.z=-21; g.add(cone); g.userData.cone=cone; space.add(g); return g; });
const smoon=new THREE.Group(); space.add(smoon); smoon.position.set(-110,30,-40); const smS=new THREE.Mesh(new THREE.IcosahedronGeometry(9,2),new THREE.MeshLambertMaterial({color:0xc8c4b8,flatShading:true})); smoon.add(smS); const smL=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.18,0),glowM(0x7ff0ff),300); smoon.add(smL); for(let i=0;i<300;i++){ D.position.copy(V(R()-.5,R()-.5,R()-.5).normalize().multiplyScalar(9.05)); D.scale.setScalar(1); D.updateMatrix(); smL.setMatrixAt(i,D.matrix); }
const smGlow=new THREE.Mesh(new THREE.SphereGeometry(13,20,14),glowM(0x7ff0ff,{transparent:true,opacity:.18,depthWrite:false})); smoon.add(smGlow);
// seams on the dark Moon (revelation)
const darkMoon=new THREE.Group(); space.add(darkMoon); darkMoon.position.set(0,0,-400); const dmS=new THREE.Mesh(new THREE.IcosahedronGeometry(40,2),new THREE.MeshLambertMaterial({color:0x5a5852,flatShading:true})); darkMoon.add(dmS);
const seamG=new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(40.3,1)); const seams=new THREE.LineSegments(seamG,new THREE.LineBasicMaterial({color:0x7ff0ff,transparent:true,opacity:0})); darkMoon.add(seams);
// core cutaway of Earth
const core=new THREE.Group(); space.add(core); core.position.set(0,0,-1200);
const crust=new THREE.Mesh(new THREE.SphereGeometry(30,32,20,0,Math.PI*1.5),new THREE.MeshLambertMaterial({color:0x1f4a8a,flatShading:true,side:THREE.DoubleSide})); core.add(crust);
const mantle=new THREE.Mesh(new THREE.SphereGeometry(27,28,18,0,Math.PI*1.5),new THREE.MeshLambertMaterial({color:0xb8541a,flatShading:true,side:THREE.DoubleSide,emissive:0x3a1206})); core.add(mantle);
for(const [r,c] of [[27,0x8a3a14],[30,0x5a4030]]) for(const a of [0,Math.PI*1.5]){ const cap=new THREE.Mesh(new THREE.CircleGeometry(r,32,0,Math.PI),new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide,flatShading:true})); cap.rotation.y=-a+Math.PI/2; cap.rotation.z=Math.PI/2; core.add(cap); }
const beast=new THREE.Group(); core.add(beast); const bS=new THREE.Mesh(new THREE.IcosahedronGeometry(9,1),new THREE.MeshLambertMaterial({color:0x2a0606,emissive:0xff2a10,emissiveIntensity:.8,flatShading:true})); beast.add(bS);
const bEye=new THREE.Mesh(new THREE.CircleGeometry(3.4,20),glowM(0xffe040)); bEye.position.set(3.6,0,7.6); bEye.lookAt(12,0,30); beast.add(bEye); const rings=[0,1,2].map(i=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(12+i*3,.3,6,40),glowM(0xff4020,{transparent:true,opacity:.7})); r.rotation.x=1+i*.5; beast.add(r); return r; });
const coreL=new THREE.PointLight(0xff3010,0,120); core.add(coreL); const cMoon=smoon.clone(); cMoon.position.set(-10,62,-38); core.add(cMoon);
// solar map
const solar=new THREE.Group(); space.add(solar); solar.position.set(0,0,2000); const sunB=new THREE.Mesh(new THREE.IcosahedronGeometry(10,2),glowM(0xffd27a)); solar.add(sunB);
const ringAt=(r,c)=>{ const m=new THREE.Mesh(new THREE.TorusGeometry(r,.25,4,120),glowM(c,{transparent:true,opacity:.7})); m.rotation.x=Math.PI/2; solar.add(m); };
ringAt(40,0x7fb8ff); ringAt(62,0xff8a5a); const pE=new THREE.Mesh(new THREE.IcosahedronGeometry(2.4,1),flat(0x3f78c4)); pE.position.set(40*Math.cos(.6),0,40*Math.sin(.6)); solar.add(pE); const pM=new THREE.Mesh(new THREE.IcosahedronGeometry(1.8,1),flat(0xd8643a)); pM.position.set(62*Math.cos(2.2),0,62*Math.sin(2.2)); solar.add(pM);
const src=new THREE.Group(); src.position.set(92*Math.cos(1.2),0,92*Math.sin(1.2)); solar.add(src); src.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2,1),glowM(0x7ff0ff))); const srcR=[0,1,2].map(()=>{ const m=new THREE.Mesh(new THREE.TorusGeometry(3,.2,4,30),glowM(0x7ff0ff,{transparent:true,opacity:.8})); m.rotation.x=Math.PI/2; src.add(m); return m; });
const beamGeo=new THREE.BufferGeometry().setFromPoints([src.position.clone(),pE.position.clone()]); const beam=new THREE.Line(beamGeo,new THREE.LineDashedMaterial({color:0x7ff0ff,dashSize:3,gapSize:2})); beam.computeLineDistances(); solar.add(beam);
const lblMars=textSign('MARS',5,1.4,'rgba(0,0,0,0)','#ff8a5a'); lblMars.position.copy(pM.position).add(V(0,4,0)); solar.add(lblMars); const lblE=textSign('EARTH',5,1.4,'rgba(0,0,0,0)','#7fb8ff'); lblE.position.copy(pE.position).add(V(0,4.5,0)); solar.add(lblE); const lblS=textSign('SIGNAL',6,1.6,'rgba(0,0,0,0)','#7ff0ff'); lblS.position.copy(src.position).add(V(0,5,0)); solar.add(lblS);
// ======================= LUNAR SURFACE
const lunar=new THREE.Group(); sc.add(lunar); lunar.position.set(-3000,0,0);
const lg_=new THREE.PlaneGeometry(400,400,60,60); lg_.rotateX(-Math.PI/2); const lp=lg_.attributes.position; for(let i=0;i<lp.count;i++){ const x=lp.getX(i), z=lp.getZ(i); lp.setY(i,Math.sin(x*.05)*1.2+Math.cos(z*.07)*1+R()*.6); } lg_.computeVertexNormals(); lunar.add(new THREE.Mesh(lg_,new THREE.MeshLambertMaterial({color:0x6a6862,flatShading:true})));
for(let i=0;i<26;i++){ const r=3+R()*10, x=(R()-.5)*200, z=-R()*200+40; const rim=new THREE.Mesh(new THREE.TorusGeometry(r,r*.18,5,16),flat(0x7a7870)); rim.rotation.x=Math.PI/2; rim.position.set(x,.6,z); lunar.add(rim); const pit=new THREE.Mesh(new THREE.CircleGeometry(r*.95,16),flat(0x3a3832)); pit.rotation.x=-Math.PI/2; pit.position.set(x,.75,z); lunar.add(pit); }
const cracks=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.1,.35),glowM(0x7ff0ff),260); cracks.frustumCulled=false; lunar.add(cracks); const crk=[]; { let x=0,z=0,a=0; for(let i=0;i<260;i++){ if(i%26===0){ x=(R()-.5)*60; z=-20-R()*80; a=R()*6.28; } a+=(R()-.5)*.8; x+=Math.cos(a)*1.6; z+=Math.sin(a)*1.6; crk.push([x,z,a,R()]); } }
const bigC=new THREE.Group(); bigC.position.set(0,.5,-60); lunar.add(bigC); const bcRim=new THREE.Mesh(new THREE.TorusGeometry(22,4,6,28),flat(0x7a7870)); bcRim.rotation.x=Math.PI/2; bigC.add(bcRim); const bcPit=new THREE.Mesh(new THREE.CircleGeometry(21,28),flat(0x24221e)); bcPit.rotation.x=-Math.PI/2; bcPit.position.y=.3; bigC.add(bcPit);
const ring2=new THREE.Mesh(new THREE.RingGeometry(6,18,28),glowM(0x7ff0ff,{transparent:true,opacity:0,side:THREE.DoubleSide})); ring2.rotation.x=-Math.PI/2; ring2.position.y=.4; bigC.add(ring2); const iris=new THREE.Mesh(new THREE.CircleGeometry(6,24),glowM(0xbff8ff,{transparent:true,opacity:0})); const pupil=new THREE.Mesh(new THREE.CircleGeometry(2.4,20),glowM(0x020408,{transparent:true,opacity:0})); pupil.rotation.x=-Math.PI/2; pupil.position.y=.5; bigC.add(pupil); iris.rotation.x=-Math.PI/2; iris.position.y=.45; bigC.add(iris);
const lunL=new THREE.PointLight(0x7ff0ff,0,140); lunL.position.set(0,10,-60); lunar.add(lunL); const earthInSky=new THREE.Mesh(new THREE.IcosahedronGeometry(30,2),new THREE.MeshLambertMaterial({color:0x2a5aa8,emissive:0x0a1a3a,fog:false})); earthInSky.position.set(-140,160,-700); lunar.add(earthInSky);
// ======================= timeline
const SH=LN.map((l,i)=>[i?l.t-.12:0,i<LN.length-1?LN[i+1].t-.12:EV.black]); SH.push([EV.black,DUR]); window.SHOTS=SH; window.DURATION=DUR;
const P=(a,b,c,d,u)=>{ cam.position.lerpVectors(V(...a),V(...b),u); cam.lookAt(V(...c).lerp(V(...(d||c)),u)); };
const off=(g,p)=>[p[0]+g.position.x,p[1]+g.position.y,p[2]+g.position.z];
const PS=(g,a,b,c,d,u)=>P(off(g,a),off(g,b),off(g,c),off(g,d||c),u);
const NEWS={3:['Moon vanishes from night sky','Astronomers baffled · Social media floods with photos of empty sky'],6:['Coastal flood warnings issued','Tides behaving unpredictably worldwide'],8:['State of emergency declared','Governments urge citizens to stay indoors']};
window.renderAt=t=>{ const k=SH.findIndex(s=>t<s[1])<0?SH.length-1:SH.findIndex(s=>t<s[1]), u=(t-SH[k][0])/(SH[k][1]-SH[k][0]), su=ss(0,1,u);
 keyL.position.set(-40,80,60); let set='city', moonOn=false, moonLit=0, blackout=0, crowdMode='none', heroOn=false, floodY=-1, emerg=false, scr='', telAim=0; cam.fov=50;
 switch(k){
 case 0: heroOn=true; P([0,2.2,4],[0,2.6,6],[0,260,600],[0,10,60],ss(.05,.95,u)); break;
 case 1: if(u<.33){ P([0,3,0],[0,3,0],[-60,200,420],[30,190,420],ss(0,1,u/.33)); } else if(u<.66){ crowdMode='look'; P([4,1.7,1.5],[3.6,1.75,1.5],[-4,2.2,6],[-4,2.3,6],ss(0,1,(u-.33)/.33)); } else { heroOn=true; hero.position.set(0,1.4,36); P([1.4,3.5,40],[1.2,3.4,39.6],[0,3.3,36],[0,3.5,36],ss(0,1,(u-.66)/.34)); } break;
 case 2: heroOn=true; P([7,4,14],[5,5,10],[0,10,60],[0,20,90],su); break;
 case 3: crowdMode='phones'; P([-7,3.4,-4.5],[-6,3.3,-3.6],[-3,1.2,5],[-3,1.5,5],su); break;
 case 4: set='ctl'; scr='tide'; PS(ctl,[3,2.4,4],[2,2.6,2.5],[0,2.6,-7.8],[0,3,-7.8],su); break;
 case 5: keyL.position.set(60,30,200); P([14,2.4,9.4],[13,2.6,9],[30,0,80],[34,1,80],su); break;
 case 6: if(u<.55){ floodY=lg(-1,.55,ss(0,1,u/.55)); P([-14,1.7,-5],[-12,1.6,-4],[6,.4,1],[8,.4,1],ss(0,1,u/.55)); } else { crowdMode='look'; P([6,1.6,-12],[5.5,1.65,-11],[-2,4,-4],[-2,6,-4],ss(0,1,(u-.55)/.45)); } break;
 case 7: set='space'; PS(space,[0,40,190],[90,30,150],[0,0,0],[0,0,0],su); break;
 case 8: emerg=true; crowdMode='flee'; P([-28,6,10],[-24,5,8],[-10,1,-2],[-6,1,-2],su); break;
 case 9: set='obs'; telAim=t*.5; PS(obs,[-30,14,40],[-24,16,34],[0,10,-6],[0,12,-6],su); break;
 case 10: set='space'; PS(space,[60,50,110],[40,60,90],[0,0,0],[0,0,0],su); break;
 case 11: set='ctl'; scr='radar'; PS(ctl,[0,3,1.5],[0,3.05,.2],[0,3.1,-7.8],[0,3.1,-7.8],su); break;
 case 12: if(u<.5){ set='obs'; telAim=t>=EV.signal?9:t*.5; PS(obs,[24,10,30],[20,11,26],[0,12,-6],[0,13,-6],ss(0,1,u/.5)); } else { set='ctl'; scr='wave'; PS(ctl,[1.2,2.9,2.6],[.6,3,1.6],[0,3.1,-7.8],[0,3.1,-7.8],ss(0,1,(u-.5)/.5)); } break;
 case 13: set='solar'; PS(space,[30,120,2140],[50,90,2110],[30,0,2040],[45,0,2050],su); break;
 case 14: set='ctl'; scr='decode'; PS(ctl,[-1,2.8,3.6],[-.6,2.9,2.6],[0,3.1,-7.8],[0,3.1,-7.8],su); break;
 case 15: set='ctl'; scr='nodistress'; PS(ctl,[0,3.1,3],[0,3.1,2.2],[0,3.1,-7.8],[0,3.1,-7.8],su); break;
 case 16: set='ctl'; scr='warning'; PS(ctl,[0,3.1,2.4],[0,3.1,1.6],[0,3.1,-7.8],[0,3.1,-7.8],su); break;
 case 17: set='dark'; PS(space,[0,20,-260],[40,10,-280],[0,0,-400],[0,0,-400],su); break;
 case 18: set='lunar'; PS(lunar,[-10,6,40],[-4,5,10],[0,0,-30],[0,0,-60],su); break;
 case 19: set='lunar'; PS(lunar,[0,30,-24],[0,32,-28],[0,0,-60],[0,0,-60],su); break;
 case 20: set='lunar'; PS(lunar,[0,40,-20],[0,48,-14],[0,0,-60],[0,0,-60],su); break;
 case 21: moonOn=t>=EV.reappear; P([0,2,0],[0,2,0],MOONP.toArray(),MOONP.toArray(),0); cam.fov=lg(55,42,su); break;
 case 22: moonOn=true; crowdMode='look'; P([-3,1.2,-1],[-2.6,1.25,-.6],[20,60,140],[24,66,150],su); break;
 case 23: moonOn=true; moonLit=1; cam.fov=14; P([0,2,0],[0,2,0],MOONP.toArray(),MOONP.toArray(),0); cam.fov=lg(16,12,su); break;
 case 24: moonOn=true; moonLit=1; if(u<.35){ P([-40,40,90],[-36,36,80],[0,10,-30],[0,10,-30],ss(0,1,u/.35)); } else { set='space'; blackout=t>=EV.blackout?1:0; PS(space,[95,25,-40],[88,22,-52],[0,0,0],[0,0,0],ss(0,1,(u-.35)/.65)); } break;
 case 25: moonOn=true; moonLit=1; blackout=1; crowdMode='look'; P([4,1.6,-6],[3.6,1.7,-5],[0,30,90],[10,60,160],su); break;
 case 26: moonOn=true; moonLit=1; blackout=1; heroOn=true; hero.position.set(0,1.4,36); P([2,1.2,30],[1.8,1.3,31],MOONP.toArray(),MOONP.toArray(),su); break;
 case 27: set='core'; PS(space,[-40,70,-1290],[-34,14,-1236],[0,0,-1200],[0,0,-1200],su); break;
 case 28: set='space2'; blackout=1; PS(space,[60,40,140],[80,30,120],[-40,10,-10],[-40,10,-10],su); break;
 case 29: set='core'; PS(space,[-50,20,-1250],[-120,70,-1340],[0,10,-1200],[0,20,-1200],su); break;
 default: set='none'; cam.position.set(0,-5000,0); }
 // set visibility
 city.visible=set==='city'; ctl.visible=set==='ctl'; obs.visible=set==='obs'; lunar.visible=set==='lunar'; space.visible=['space','space2','dark','core','solar'].includes(set); stars.visible=['city','obs','lunar','space','space2','dark','core','solar'].includes(set);
 earth.visible=set==='space'||set==='space2'; orbit.visible=set==='space'&&k===7; sats.forEach(s=>s.visible=set==='space'&&k===10); smoon.visible=set==='space2'; darkMoon.visible=set==='dark'; core.visible=set==='core'; solar.visible=set==='solar';
 stars.position.copy(cam.position); moonG.visible=set==='city'&&moonOn;
 // lighting
 const space_=space.visible; hemi.intensity=set==='ctl'?.5:set==='lunar'?.6:space_?.25:set==='city'?1.25*(1-blackout*.6):.9; keyL.intensity=set==='city'?(k===5?1.4:.5*(1-blackout*.5)+moonLit*.3):set==='obs'?1.2:set==='lunar'?.9:0; keyL.color.set(moonLit?0x9ff0ff:0x9aaae8);
 sky.top.value.set(0x02040c); sky.low.value.set(set==='city'?(blackout?0x04060e:0x0f1a36):set==='obs'?0x0c1430:0x02030a); sc.fog.color.set(set==='city'?(blackout?0x04060e:0x0a1226):0x02030a); sc.fog.near=set==='ctl'?200:space_?5000:80; sc.fog.far=set==='ctl'?400:space_?6000:set==='lunar'?500:700;
 // city
 if(set==='city'){ const P2=seaGeo.attributes.position, amp=(k===5||k===6)?3.2:.35; for(let i=0;i<P2.count;i++){ const x=seaBase[i*3], z=seaBase[i*3+2]; P2.setY(i,-1.6+Math.sin(x*.07+t*1.3)*amp*.5+Math.sin(z*.11-t*1.9)*amp+Math.sin((x+z)*.02+t*.6)*amp*.6*(k===5?1:0)); } P2.needsUpdate=true; seaGeo.computeVertexNormals();
  flood.position.y=floodY-.5; flood.visible=floodY>-1;
  winMats.forEach(m=>m.color.set(blackout?0x050608:0xffffff)); lamps.forEach(l=>l.children[1].material.color.set(blackout?0x1a1a1a:0xffe2a0)); cityL.forEach(l=>l.intensity=blackout?0:14);
  ccars.forEach((c,i)=>{ c.position.x=((-60+i*16+(emerg||blackout?0:t*(i%2?-6:6)))%140+140)%140-70; c.rotation.y=i%2?-Math.PI/2:Math.PI/2; c.visible=k!==6||u>=.55?true:true; c.position.y=Math.max(0,floodY-.2)*0; });
  police.forEach((c,i)=>{ c.visible=emerg; const f=Math.floor(t*3+i)%2; c.userData.r.material.color.set(f?0xff2020:0x401010); c.userData.b.material.color.set(f?0x101040:0x2050ff); c.userData.pl.intensity=emerg?10:0; c.userData.pl.color.set(f?0xff2020:0x2050ff); });
  hero.visible=heroOn; hero.userData.pose(0,0); look(hero,.6); hero.rotation.y=0; if(k===0||k===2) hero.position.set(0,1.4,40);
  crowd.forEach((m,i)=>{ const r=m.userData.r; m.visible=crowdMode!=='none'; m.userData.ph.visible=false; m.userData.pose(0,0); m.rotation.set(0,0,0); m.children[5].rotation.x=0;
   const gx=-12+(i%9)*3+r[0]*1.5, gz=1.5+Math.floor(i/9)*1.6+r[1];
   if(crowdMode==='look'){ m.position.set(gx,.3,gz); m.rotation.y=(r[2]-.5)*.8; look(m,.55+r[0]*.2); }
   if(crowdMode==='phones'){ m.position.set(gx,.3,gz); m.rotation.y=(r[2]-.5)*.6; look(m,.5); if(i%2){ m.children[6].rotation.x=-2.5; m.userData.ph.visible=true; m.userData.ph.position.set(.38,.95+.7,.35); } }
   if(crowdMode==='flee'){ const z0=-3+(i%4)*1.2, x=((gx*3+t*4*(i%2?1:-1))%60+60)%60-30; m.position.set(x,.02,z0); m.rotation.y=i%2?Math.PI/2:-Math.PI/2; m.userData.pose(t*8+i,.7); }
   if(m.position.distanceTo(cam.position)<2.2) m.visible=false; });
  if(moonOn){ const pulse=.5+.5*Math.sin(t*3); mLights.visible=moonLit>0; mld.forEach((q,i)=>{ D.position.copy(q[0]).multiplyScalar(30.3); D.scale.setScalar(moonLit?(.6+q[1]*.9)*(.7+.3*Math.sin(t*4+i)):0.0001); D.updateMatrix(); mLights.setMatrixAt(i,D.matrix); }); mLights.instanceMatrix.needsUpdate=true; moonGlow.material.opacity=moonLit*(.14+.06*pulse); moonM.emissive.set(moonLit?0x1a3a40:0x4a4a44); moonG.rotation.y=t*.02; } }
 if(set==='ctl'){ drawScreen(scr,t); const alarm=scr==='warning'||scr==='wave'; redAlarm.intensity=alarm?(8+6*Math.sin(t*6)):0; ctlL.intensity=alarm?6:12; sci.forEach((s,i)=>{ s.userData.sit(); look(s,scr==='warning'?-.1:.05); s.children[5].rotation.x=-1.2+Math.sin(t*9+i)*.08; }); }
 if(set==='obs'){ domes.forEach((d,i)=>{ const aim=telAim>=9?-.6:telAim*(i%2?1:-1)+i; d.userData.rot.rotation.y=telAim>=9?lg(d.userData.rot.rotation.y,-.6+i*.15,1):Math.sin(telAim+i*2)*.8; d.userData.tube.rotation.x=telAim>=9?-.9:-.5-Math.sin(telAim*.7+i)*.3; }); }
 if(set==='space'||set==='space2'){ earth.rotation.y=k===24?0:t*.05; eld.forEach((d,i)=>{ D.position.copy(d).multiplyScalar(30.2); D.scale.setScalar(blackout?0.0001:1); D.updateMatrix(); eLights.setMatrixAt(i,D.matrix); }); eLights.instanceMatrix.needsUpdate=true; ghost.material.opacity=.25+.15*Math.sin(t*3); ghost.rotation.y=t*.3;
  sats.forEach((s,i)=>{ const a=t*.3+i*1.05, r=44+(i%2)*6; s.position.set(Math.cos(a)*r,Math.sin(a+i)*14+(i-2.5)*4,Math.sin(a)*r); s.lookAt(s.position.clone().multiplyScalar(2)); s.userData.cone.material.opacity=.1+.06*Math.sin(t*5+i); }); smoon.rotation.y=t*.1; smGlow.material.opacity=.15+.08*Math.sin(t*3); }
 if(set==='dark'){ darkMoon.rotation.y=t*.15; seams.material.opacity=.15+ss(.2,.8,u)*.85; }
 if(set==='core'){ const p=.5+.5*Math.sin(t*4.5); bS.material.emissiveIntensity=.6+p*.9; beast.scale.setScalar(1+p*.06); rings.forEach((r,i)=>{ r.rotation.z=t*(.5+i*.3); }); coreL.intensity=60+p*80; crust.rotation.y=0; }
 if(set==='solar'){ srcR.forEach((r,i)=>{ const q=((t*.8+i/3)%1); r.scale.setScalar(1+q*3); r.material.opacity=.8*(1-q); }); beam.material.dashSize=3; beam.material.gapSize=2; }
 if(set==='lunar'){ const wake=k===20?ss(0,.4,(t-EV.awake)):k===19?.15+.1*Math.sin(t*3):.35; crk.forEach((q,i)=>{ D.position.set(q[0],.9,q[1]); D.rotation.set(0,-q[2],0); D.scale.set(1.8,1,(.6+q[3])*(k===18?.6+.4*ss(0,1,u):1)*(1+wake)); D.updateMatrix(); cracks.setMatrixAt(i,D.matrix); }); cracks.instanceMatrix.needsUpdate=true; ring2.material.opacity=k>=19?(k===20?wake:.15+.1*Math.sin(t*3)):0; iris.material.opacity=k===20?wake:0; pupil.material.opacity=k===20?wake:0; pupil.scale.set(1,1,lg(.2,1,wake)); iris.scale.setScalar(k===20?1+wake*.6:1); lunL.intensity=k===20?40+wake*200:k===19?20:12; }
 renderer.render(sc,cam);
 // ---- overlays
 const nw=NEWS[k]; $('news').style.opacity=nw?ss(0,.25,t-SH[k][0])*(1-ss(SH[k][1]-.2,SH[k][1],t)):0; if(nw){ $('nhl').textContent=nw[0]; $('ntk').textContent=nw[1]; $('ntk').style.textIndent=(-((t*80)%600))+'px'; }
 const clockMin=t<LN[3].t?0:t<EV.signal?lg(60,180,(t-LN[3].t)/(EV.signal-LN[3].t)):lg(180,225,(t-EV.signal)/(EV.reappear-EV.signal)); const mins=21*60+Math.floor(clockMin), hh=Math.floor(mins/60)%24, mm=mins%60;
 const hudOn=t<EV.reappear&&k!==0; $('hud').style.opacity=hudOn?1:0; $('n').textContent=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'); $('u').textContent=''; $('stage').textContent=TL.scenes[LN[Math.min(k,LN.length-1)].scene]; $('r').innerHTML=''; $('el').textContent=''; $('wt').textContent=''; $('n').style.color=t>=EV.signal?'#7ff0ff':'#ffffff';
 $('note').style.opacity=0; $('peep').style.opacity=0;
 let txt=''; for(const l of LN){ if(t>=l.t&&t<l.t+l.d+.12){ const c=[]; let q=[]; for(const x of l.text.split(' ')){ q.push(x); if(q.length>=6||(/[.,?:]$/.test(x)&&q.length>=2)){ c.push(q.join(' ')); q=[]; } } if(q.length)c.push(q.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const z of c){ acc+=z.length; if(p<=acc){ txt=z; break; } } } } $('cap').textContent=t<LN[1].t?'':txt;
 $('title').style.opacity=(1-ss(LN[0].t+LN[0].d-.3,LN[0].t+LN[0].d+.1,t))*ss(0,.3,t); $('blk').style.opacity=t>=EV.black?1:ss(EV.black-.6,EV.black,t);
 const fl=Math.max(t>=EV.reappear&&t<EV.reappear+.3?1-(t-EV.reappear)/.3:0, t>=EV.awake&&t<EV.awake+.35?1-(t-EV.awake)/.35:0); $('fla').style.background=t<EV.reappear?'#bff8ff':'#ffffff'; $('fla').style.opacity=fl*.8; $('fade').style.opacity=0; };
window.renderAt(0); window.ready=true;
