import * as THREE from 'three';
import { rng, flat, shadow, ss, person, woman, car, lamp, skyDome, softSun, roundTree, textSign, shop, kitchenSet, civic, bench } from './kit.js';
const TL=await (await fetch('/forgot_timeline.json')).json(), EV=TL.events, R=rng(3131), $=id=>document.getElementById(id), DUR=TL.duration;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.05,2000), D=new THREE.Object3D(), C=h=>new THREE.Color(h), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf2d8c0,60,260); const sky=skyDome(sc,0x7f9ad8,0xf2d8c0); const sun=softSun(sc,-120,140,-400,70);
const hemi=new THREE.HemisphereLight(0xdfe6ff,0x5a4a40,1.6); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xfff0d8,1.3); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:1,far:200}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.05; sunL.position.set(-30,50,30); sc.add(sunL); sc.add(sunL.target);
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=c=>new THREE.MeshBasicMaterial({color:c});
const face=(p,{brow=0x1a1210,smile=false,mouth=0x6a3a30}={})=>{ const h=p.children[1], dk=flat(0x1a1210), f=(w,hh,x,y,m=dk)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.02),m); b.position.set(x,y,.18); h.add(b); return b; };
 for(const s of [-1,1]){ f(.065,.055,s*.085,.035); const w=f(.022,.02,s*.085+.012,.045,flat(0xffffff)); w.position.z=.192; f(.09,.025,s*.085,.095,flat(brow)); }
 return f(.09,.025,0,-.085,flat(mouth)); };
// ---------- characters
const SHIRT=0x2f8a7a, HAIR=0x5a3320, SKIN=0xd9a27a;
const man=person({shirt:SHIRT,pants:0x2a2f3a,hair:HAIR,skin:SKIN}); const mouth=face(man); sc.add(man); const MA=i=>man.children[i];
const phone=new THREE.Group(); bx(phone,.17,.32,.03,0x1a1c22,0,0,0); const scr=new THREE.Mesh(new THREE.PlaneGeometry(.14,.27),glowM(0x8fb8ff)); scr.position.z=.017; phone.add(scr);
const mom=woman({shirt:0x8a5ac8,hair:0xd0ccc8,skin:0xe0b090}); face(mom,{brow:0xb8b4b0}); sc.add(mom);
const friend=person({shirt:0xf09a4a,pants:0x394a6e,hair:0x1a1a1a,skin:0x8a5a3a}); face(friend); bx(friend,.42,.1,.46,0x2a2f3a,0,2.1,.04); sc.add(friend);
const doc=person({shirt:0xdfe8f0,pants:0x3a4050,hair:0x3a3a3a,skin:0xc89a7a}); face(doc,{brow:0x3a3a3a}); bx(doc,.66,.95,.38,0xf8f8f6,0,1.1,0); const glas=new THREE.Mesh(new THREE.BoxGeometry(.3,.022,.02),flat(0x1a1a1a)); glas.position.set(0,.06,.2); doc.children[1].add(glas); sc.add(doc);
const extras=[...Array(18)].map((_,i)=>{ const m=i%2?woman({shirt:[0xd64f4f,0xefc14d,0x7ec4bc,0xb8a2e6][i%4]}):person({shirt:[0x3f78c4,0xf6b172,0x8a5ac8,0xe8dcc8][i%4],pants:0x394a6e,hair:[0x1a1a1a,0x5a3320,0x8a6a4a][i%3]}); face(m); m.userData.r=[R(),R(),R()]; sc.add(m); return m; });
// ---------- photo textures
const figure=(q,x,y,s,shirt,hair,skin,kid=false)=>{ const H=kid?.62:1; q.fillStyle=shirt; q.fillRect(x-28*s,y-60*s*H,56*s,62*s*H); q.fillStyle=skin; q.fillRect(x-20*s,y-104*s*H,40*s,40*s); q.fillStyle=hair; q.fillRect(x-22*s,y-110*s*H,44*s,14*s); if(kid){ q.fillRect(x-30*s,y-104*s*H,10*s,22*s); q.fillRect(x+20*s,y-104*s*H,10*s,22*s); } q.fillStyle='#1a1210'; q.fillRect(x-10*s,y-88*s*H,6*s,6*s); q.fillRect(x+4*s,y-88*s*H,6*s,6*s); };
const HE=['#2f8a7a','#5a3320','#d9a27a'], GIRL=['#f0a0c0','#3a2418','#e0b090',true], MOM=['#8a5ac8','#d0ccc8','#e0b090'], FR=['#f09a4a','#1a1a1a','#8a5a3a'];
const photo=(bg,ground,people)=>{ const c=document.createElement('canvas'); c.width=256; c.height=192; const q=c.getContext('2d'); q.fillStyle=bg; q.fillRect(0,0,256,192); q.fillStyle=ground; q.fillRect(0,140,256,52); people.forEach(([x,p])=>figure(q,x,176,1.1,...p)); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
const PH=[ // [with him, without him]
 [photo('#8fd0f0','#f2dca0',[[96,HE],[160,GIRL]]),photo('#8fd0f0','#f2dca0',[[160,GIRL]])],
 [photo('#a8d88a','#6aa84a',[[100,MOM],[160,HE]]),photo('#a8d88a','#6aa84a',[[100,MOM]])],
 [photo('#f2c8a0','#c8a080',[[90,MOM],[140,HE],[190,GIRL]]),photo('#f2c8a0','#c8a080',[[90,MOM],[190,GIRL]])],
 [photo('#c8b8e8','#8a7aa8',[[128,HE]]),photo('#c8b8e8','#8a7aa8',[])],
 [photo('#f0d890','#a89060',[[100,HE],[160,FR]]),photo('#f0d890','#a89060',[[160,FR]])]];
// ======================= SET H: photo wall (living room)
const setH=new THREE.Group(); sc.add(setH); bx(setH,10,.1,8,0x8a6a50,0,-.05,1); bx(setH,10,3.4,.2,0xe8d8c0,0,1.7,-3.1); bx(setH,10,.12,.06,0xf8f0e4,0,.06,-2.98);
const frames=[[-1.75,2.35,1.0,.75],[-1.6,1.25,.85,.95],[0,1.85,1.5,1.1],[1.65,2.4,.9,.7],[1.7,1.3,1.0,.78]].map(([x,y,w,h],i)=>{ bx(setH,w+.12,h+.12,.06,[0x3a2a1a,0xf2ede4,0x6b4a33,0x2a2a30,0xc8a050][i],x,y,-2.97); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:PH[i][0]})); m.position.set(x,y,-2.93); setH.add(m); return m; });
bx(setH,1.4,.75,.5,0x6b4a33,-3.2,.38,-2.6); const lmp=bx(setH,.35,.5,.35,0xf2e6c8,-3.2,1.05,-2.6); bx(setH,2.6,.5,1,0x5a6a8a,3.6,.45,-1.8);
bx(setH,10,.1,8,0xf2ece2,0,3.4,1); const roomL=new THREE.PointLight(0xffe0b8,5,12); roomL.position.set(0,2.8,1); setH.add(roomL);
// ======================= SET A: bedroom (bright morning)
const setA=new THREE.Group(); sc.add(setA); bx(setA,9,.1,9,0xb89a7a,0,-.05,0); for(const [w,d,x,z] of [[9,.2,0,-4.5],[.2,9,-4.5,0],[.2,9,4.5,0]]) bx(setA,w,3.3,d,0xe8e0f0,x,1.6,z);
bx(setA,2.2,1.6,.05,glowM(0xfff4d8),-1.4,1.9,-4.38); for(const s of [-1,1]) bx(setA,.5,2.4,.1,0x9ab8d8,-1.4+s*1.35,1.8,-4.3);
bx(setA,2.2,.45,3.4,0xe8e4dc,1.6,.25,-2.6); bx(setA,2.05,.25,3.2,0xf8f6f2,1.6,.58,-2.6); bx(setA,2.1,.2,2,0xf0b8a0,1.6,.8,-1.7); bx(setA,1,.18,.5,0xffffff,1.6,.79,-3.9); bx(setA,.8,.6,.7,0xc8a880,-.2,.3,-3.9);
bx(setA,9,.1,9,0xf4f0f8,0,3.3,0); const sunA=new THREE.DirectionalLight(0xfff0c8,1.6); sunA.position.set(-1.4,3.5,-7); sunA.target.position.set(.5,0,0); setA.add(sunA); setA.add(sunA.target); sunA.castShadow=true; Object.assign(sunA.shadow.camera,{left:-6,right:6,top:6,bottom:-6});
// ======================= SET M: mother's kitchen
const setM=new THREE.Group(); sc.add(setM); bx(setM,9,.1,9,0xd8d0c0,0,-.05,0); bx(setM,9,3.3,.2,0xf2e6c8,0,1.6,-3.6); bx(setM,.2,3.3,9,0xf2e6c8,-4.5,1.6,0); bx(setM,9,.1,9,0xf8f2e6,0,3.3,0); const ks=kitchenSet(); ks.position.set(-.5,0,-3.1); setM.add(ks); bx(setM,1.6,1.2,.05,glowM(0xfff4d8),2.6,1.9,-3.48);
// ======================= SET B: street (also the scream crossing)
const setB=new THREE.Group(); sc.add(setB); bx(setB,400,.04,400,0x6fbf4f,0,-.04,0).castShadow=false; bx(setB,400,.05,10,0x4a4c55,0,.01,8).castShadow=false; bx(setB,400,.2,6,0xcfcbc2,0,.1,0);
for(let i=0;i<9;i++) bx(setB,.8,.02,6,0xf2efe6,-6+i*1.5,.04,8);
const shopC=[0xb8a2e6,0xf6b172,0x7ec4bc,0xf0a79d,0xa9b4d8,0xeaa985]; for(let i=0;i<9;i++){ if(i===4) continue; const s=shop(9,shopC[i%6],[0xd64f4f,0x3f78c4,0xefc14d][i%3],R); s.position.set(-40+i*10,0,-7); setB.add(s); }
for(let i=0;i<6;i++){ const l=lamp(flat(0x3a3f49),flat(0xf2e9c8)); l.position.set(-25+i*10,.2,2.6); setB.add(l); } [[-14,6.5,0xd64f4f],[9,9.5,0x3f78c4],[22,6.5,0xefc14d]].forEach(([x,z,c])=>{ const k=car(c); k.position.set(x,0,z); k.rotation.y=Math.PI/2; setB.add(k); });
for(let i=0;i<5;i++){ const t=roundTree(R,[flat(0x2c7f3d),flat(0x3f9a48)],flat(0x6b4a33),.8); t.position.set(-30+i*14+(i===2?6:0),.2,-2.4); setB.add(t); }
// ======================= SET C: office lobby turnstiles
const setC=new THREE.Group(); sc.add(setC); bx(setC,20,.1,16,0xd8dce4,0,-.05,0); bx(setC,20,6,.2,0x4a5468,0,3,-5); const logo=textSign('NOVA CORP',6,1,'#4a5468','#dfe8ff'); logo.position.set(0,4.2,-4.88); setC.add(logo);
const gates=[-2.4,0,2.4].map(x=>{ const g=new THREE.Group(); g.position.set(x,0,0); bx(g,.35,1.1,1.6,0xb8c0cc,-.95,.55,0); bx(g,.35,1.1,1.6,0xb8c0cc,.95,.55,0); const gl=bx(g,1.4,.9,.06,new THREE.MeshLambertMaterial({color:0x9fc6d8,transparent:true,opacity:.55}),0,.75,.2); const led=bx(g,.24,.04,.3,glowM(0x34c759),-.95,1.12,.3); setC.add(g); return {g,led}; });
const deny=textSign('ACCESS DENIED',1.1,.36,'#3a0a0a','#ff4040',{px:70}); deny.position.set(-.95+0,1.32,.55); deny.rotation.x=-.5; gates[1].g.add(deny); const okS=textSign('TAP ID',1.1,.36,'#0a1a2e','#7fd8ff',{px:80}); okS.position.copy(deny.position); okS.rotation.x=-.5; gates[1].g.add(okS);
const cardM=bx(setC,.12,.18,.02,0xffffff,0,0,0);
// ======================= SET D: ATM
const setD=new THREE.Group(); sc.add(setD); bx(setD,20,.1,10,0xcfcbc2,0,-.05,2); bx(setD,20,6,.3,0x3a4a6a,0,3,-1); const bs=textSign('CITY BANK',4,.9,'#3a4a6a','#ffd27a'); bs.position.set(0,4.6,-.84); setD.add(bs);
const atm=new THREE.Group(); atm.position.set(0,0,-.75); setD.add(atm); bx(atm,1.5,2.2,.6,0x8a9099,0,1.1,0); bx(atm,1.2,.12,.5,0x5a6068,0,1.15,.4);
const atmS=[textSign('WELCOME\nINSERT CARD',1,.75,'#0a2a4a','#cfe8ff',{px:60}),textSign('ACCOUNT\nHOLDER\nNOT FOUND',1,.75,'#3a0a0a','#ff5050',{px:56})]; atmS.forEach(s=>{ s.position.set(0,1.62,.31); atm.add(s); });
// ======================= SET E: hospital (exterior + office)
const setE=new THREE.Group(); sc.add(setE); const hosp=civic(18,8,10,0xf4f6f8,0x2f7fd0,'HOSPITAL','#2f7fd0'); hosp.position.set(0,0,-60); setE.add(hosp); bx(setE,60,.04,40,0xcfcbc2,0,-.03,-48).castShadow=false;
const office=new THREE.Group(); setE.add(office); bx(office,8,.1,8,0xb8d0d8,0,-.05,0); bx(office,8,3.3,.2,0xeef2f4,0,1.6,-3.6); bx(office,.2,3.3,8,0xeef2f4,-4,1.6,0); bx(office,.2,3.3,8,0xeef2f4,4,1.6,0);
bx(office,2.6,.08,1.3,0xb8a080,0,.78,-1.2); for(const x of [-1.2,1.2]) bx(office,.1,.76,1.2,0x8a7a68,x,.38,-1.2); bx(office,.9,.06,.7,0x2a2c32,-.7,.86,-1.5); bx(office,.08,.6,.5,0x1a1c22,-.7,1.15,-1.75);
bx(office,1.4,2.2,.4,0xdfe3e8,-2.8,1.1,-3.3); const xr=bx(office,1.2,.9,.05,glowM(0xdff0ff),1.8,2,-3.48); const chairD=bx(office,.6,.5,.6,0x3a4050,0,.25,-2.2), chairM=bx(office,.6,.5,.6,0x3a4050,0,.25,.1);
const fileT=(()=>{ const c=document.createElement('canvas'); c.width=320; c.height=420; const q=c.getContext('2d'); q.fillStyle='#f4efe2'; q.fillRect(0,0,320,420); q.fillStyle='#d8d2c0'; for(let i=0;i<6;i++) q.fillRect(30,300+i*16-110+120,260-(i%3)*40,6); q.fillStyle='#cfd8e0'; q.fillRect(80,40,160,160); figure(q,160,200,1.3,...HE); q.fillStyle='#3a3a3a'; q.font='600 22px Jost'; q.fillText('PATIENT FILE  #4471',30,236); q.save(); q.translate(160,300); q.rotate(-.12); q.strokeStyle='#c8202a'; q.lineWidth=6; q.strokeRect(-140,-34,280,68); q.fillStyle='#c8202a'; q.font='700 30px Jost'; q.textAlign='center'; q.fillText('PATIENT: DECEASED',0,11); q.restore(); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
const folder=new THREE.Group(); folder.position.set(.2,.83,-1.15); office.add(folder); bx(folder,.64,.02,.84,0xd8b46a,0,0,0); const paper=new THREE.Mesh(new THREE.PlaneGeometry(.58,.76),new THREE.MeshLambertMaterial({map:fileT})); paper.rotation.x=-Math.PI/2; paper.position.y=.016; folder.add(paper); const cover=new THREE.Group(); cover.position.set(-.32,.025,0); folder.add(cover); bx(cover,.64,.02,.84,0xe0bc72,.32,0,0);
const offL=new THREE.PointLight(0xf0f6ff,9,14); offL.position.set(0,3,0); office.add(offL);
// ======================= shots
const SH=[[0,EV.wake],[EV.wake,EV.m1],[EV.m1,EV.mom],[EV.mom,EV.laugh],[EV.laugh,EV.photos],[EV.photos,EV.street],[EV.street,EV.office],[EV.office,EV.atm],[EV.atm,EV.scream],[EV.scream,EV.hosp],[EV.hosp,EV.explain],[EV.explain,EV.file],[EV.file,EV.d1],[EV.d1,EV.m2],[EV.m2,EV.d2],[EV.d2,EV.silence],[EV.silence,EV.turnfile],[EV.turnfile,EV.ring],[EV.ring,EV.answer],[EV.answer,EV.black],[EV.black,DUR]];
window.SHOTS=SH.map(s=>[...s]); window.DURATION=DUR;
const P=(a,b,c,d,u)=>{ cam.position.lerpVectors(V(...a),V(...b),u); cam.lookAt(V(...c).lerp(V(...(d||c)),u)); };
const reset=m=>{ m.rotation.set(0,0,0); m.position.set(0,0,0); m.userData.pose(0,0); [3,4,5,6].forEach(i=>m.children[i].rotation.set(0,0,0)); m.children[1].rotation.set(0,0,0); m.visible=false; };
const toEar=(m,arm=6)=>{ m.children[arm].rotation.set(-2.5,0,arm===6?.55:-.55); };
const holdPh=(m,arm=6,ear=true)=>{ if(ear){ m.children[1].add(phone); const sd=arm===6?1:-1; phone.position.set(sd*.215,-.02,.04); phone.scale.setScalar(1.3); phone.rotation.set(0,sd*Math.PI/2,0); m.children[arm].rotation.set(-2.25,0,-sd*.5); } else { if(phone.parent!==m.children[arm]) m.children[arm].add(phone); m.children[arm].rotation.set(-1.2,0,0); phone.position.set(0,-.72,.06); phone.rotation.set(-Math.PI/2+.95,0,0); } };
const glitchAt=t=>[0,.9,1.9].map(o=>EV.photos+o).some(g=>t>=g&&t<g+.35);
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=SH.length-1; const u=(t-SH[k][0])/(SH[k][1]-SH[k][0]), su=ss(0,1,u);
 const set=k===0||k===4||k===5?'H':k<=3?(k===2?'M':'A'):k===6||k===8?(k===8?'D':'B'):k===7?'C':k===9?'B':k>=10&&k<=19?'E':'X'; const S={H:setH,A:setA,M:setM,B:setB,C:setC,D:setD,E:setE}; Object.entries(S).forEach(([n,g])=>g.visible=n===set);
 [man,mom,friend,doc,...extras].forEach(reset); if(phone.parent) phone.parent.remove(phone); phone.scale.setScalar(1); cam.fov=50; cam.rotation.z=0;
 const outdoor=set==='B'||set==='D'||(set==='E'&&k===10); sky.top.value.set(0x7f9ad8); sky.low.value.set(0xf2d8c0); sc.fog.near=outdoor?60:200; sc.fog.far=outdoor?260:400; sunL.intensity=outdoor?1.3:0; hemi.intensity=outdoor?1.6:1.15; sun.visible=outdoor;
 office.visible=k>=11; hosp.visible=k===10;
 // photo wall state
 const gl=glitchAt(t); frames.forEach((f,i)=>{ const gone=k>5||(k===5&&t>EV.photos+[.0,.9,1.9,.9,.0][i]+.18); f.material.map=PH[i][gone?1:0]; });
 switch(k){
 case 0: P([0,1.75,6.4],[0,1.85,2.6],[0,1.85,-3],[0,1.85,-3],su); break;
 case 1: man.visible=true; man.userData.sit(); man.position.set(1.0,-.06,-1.45); man.rotation.y=-.5; holdPh(man); P([-2.6,1.6,1.9],[-2.2,1.55,1.3],[.9,1.3,-1.6],[.9,1.35,-1.6],su); break;
 case 2: man.visible=true; man.userData.sit(); man.position.set(1.0,-.06,-1.45); man.rotation.y=-.5; holdPh(man,5); mouth.scale.y=1+1.4*Math.abs(Math.sin(t*14)); P([-1.2,1.35,1.5],[-.95,1.35,1.05],[.85,1.05,-1.5],[.85,1.1,-1.5],su); break;
 case 3: mom.visible=true; mom.position.set(.2,0,-1.2); mom.rotation.y=.35; holdPh(mom,5); mom.children[1].rotation.z=.18*ss(.1,.4,u); P([2,1.7,2.4],[1.6,1.7,1.8],[.2,1.6,-1.2],[.2,1.65,-1.2],su); break;
 case 4: man.visible=true; man.userData.sit(); man.position.set(1.0,-.06,-1.45); man.rotation.y=-.5; holdPh(man); man.children[0].position.y+=.02*Math.sin(t*26); man.children[1].rotation.x=-.12; mouth.scale.y=1.6; P([-.2,1.5,.4],[0,1.5,0],[.85,1.4,-1.5],[.85,1.42,-1.5],su); break;
 case 5: man.visible=true; man.position.set(-.55,0,.95); man.rotation.y=Math.PI; man.children[1].rotation.x=-.08; P([-1.7,1.95,4.6],[-1.3,1.95,3.6],[.2,1.8,-3],[0,1.85,-3],su); break;
 case 6: { man.visible=true; man.position.set(-1.2,.2,.5); man.rotation.y=Math.PI/2*lg(1,.2,ss(.1,.5,u)); const wave=ss(.15,.35,u)*(1-ss(.75,.9,u)); man.children[6].rotation.set(-2.7*wave,0,.3*wave+Math.sin(t*14)*.25*wave); friend.visible=true; const fx=lg(9,-9,u); friend.position.set(fx,.2,1.4); friend.rotation.y=-Math.PI/2; friend.userData.pose(t*6.5,.5); man.children[1].rotation.y=fx>-1.2?.25:-.6; P([-4.2,1.5,6.2],[-3.4,1.55,5.7],[0,1.4,.8],[-.8,1.4,.8],su); break; }
 case 7: { man.visible=true; man.position.set(.15,0,2.6); man.rotation.y=Math.PI; const tap=ss(.15,.4,u); man.children[6].rotation.set(-1.1*tap,0,0); man.position.z=lg(2.6,1.3,ss(0,.3,u)); man.children[6].add(cardM); cardM.position.set(0,-.72,.05); const den=u>.42; okS.visible=!den; deny.visible=den; gates[1].led.material.color.set(den?(Math.sin(t*22)>0?0xff3030:0x5a1010):0x34c759); P([-2.7,1.7,2.6],[-2.4,1.6,2.1],[-.8,1.15,.5],[-.8,1.2,.5],su); break; }
 case 8: { man.visible=true; man.position.set(-.35,0,.55); man.rotation.y=Math.PI; man.children[5].rotation.x=-.9; const nf=u>.38; atmS[0].visible=!nf; atmS[1].visible=nf; P([.5,1.85,1.4],[.35,1.8,1.05],[0,1.6,-.4],[0,1.62,-.4],su); break; }
 case 9: { man.visible=true; man.position.set(0,0,8); man.children[5].rotation.set(-2.8,0,-.3); man.children[6].rotation.set(-2.8,0,.3); man.children[1].rotation.x=-.35; mouth.scale.y=3; extras.forEach((e,i)=>{ e.visible=true; const r=e.userData.r, ang=r[0]*6.28, rad=2.2+r[1]*5, dir=i%2?1:-1; const a=ang+dir*t*.16; e.position.set(Math.cos(a)*rad,0,8+Math.sin(a)*rad); e.rotation.y=-a+(dir>0?0:Math.PI); e.userData.pose(t*6.5+i,.5); }); const a=su*1.6; cam.position.set(Math.sin(a)*lg(3,6,su),lg(4.5,14,su),8+Math.cos(a)*lg(3,6,su)); cam.lookAt(0,1,8); break; }
 case 10: man.visible=true; man.position.set(lg(2,.5,su),0,lg(-42,-53,su)); man.rotation.y=Math.PI; man.userData.pose(t*7,.6); P([5,2,-30],[3.5,2.4,-34],[0,4,-60],[0,4.5,-60],su); break;
 default: break; }
 if(k>=11&&k<=19){ doc.visible=true; doc.userData.sit(); doc.position.set(0,-.12,-2.2); doc.rotation.y=0; man.visible=true; man.userData.sit(); man.position.set(0,-.12,.1); man.rotation.y=Math.PI; cover.rotation.z=-(k>=12?Math.PI*ss(.25,.75,k===12?u:1):0); folder.rotation.y=k>=17?lg(0,Math.PI,k===17?ss(.1,.5,u):1):0;
  switch(k){
  case 11: man.children[5].rotation.x=-.8-.4*Math.sin(t*5); man.children[6].rotation.x=-.9-.4*Math.sin(t*4+1); mouth.scale.y=1+1.2*Math.abs(Math.sin(t*12)); P([3,1.9,1.6],[2.6,1.85,1.2],[0,1.1,-1],[0,1.1,-1],su); break;
  case 12: doc.children[5].rotation.x=doc.children[6].rotation.x=-.7; doc.children[1].rotation.x=.35; P([1.3,2.2,-.4],[1.05,2.1,-.6],[.2,.85,-1.2],[.2,.85,-1.2],su); break;
  case 13: doc.children[1].rotation.x=.15; doc.children[5].rotation.x=doc.children[6].rotation.x=-.7; P([.5,1.5,-.2],[.4,1.5,-.45],[0,1.55,-2.2],[0,1.56,-2.2],su); break;
  case 14: mouth.scale.y=1+1.5*Math.abs(Math.sin(t*13)); man.children[1].rotation.x=-.05; P([-.45,1.5,-1.75],[-.35,1.5,-1.5],[0,1.5,.1],[0,1.5,.1],su); break;
  case 15: doc.children[1].rotation.x=0; P([.45,1.52,-.35],[.32,1.53,-.75],[0,1.6,-2.2],[0,1.6,-2.2],su); break;
  case 16: mouth.scale.y=2.2; P([-.3,1.5,-1.3],[-.28,1.5,-1.24],[0,1.52,.1],[0,1.52,.1],su); break;
  case 17: doc.children[5].rotation.x=doc.children[6].rotation.x=-.8; P([.2,1.75,-.6],[.2,1.45,-.8],[.2,.82,-1.15],[.2,.82,-1.15],su); break;
  case 18: { const sh=Math.sin(t*40)*.06; man.children[0].rotation.set(0,0,0); man.children[6].rotation.set(-1.35,0,0); man.children[6].add(phone); phone.position.set(0,-.72,.06); phone.rotation.set(-Math.PI/2+1.1+sh,0,0); scr.material.color.set(0xc8a8ff); P([-.8,1.7,-.9],[-.6,1.68,-.65],[0,1.15,.35],[0,1.18,.4],su); break; }
  case 19: holdPh(man); man.children[1].rotation.x=-.05; P([-.6,1.55,-1.45],[-.42,1.55,-1.05],[0,1.55,.1],[0,1.56,.1],ss(0,1,u)); offL.intensity=9*(Math.sin(t*31)>.85&&u>.4?.3:1); break; }
 } else offL.intensity=9;
 renderer.render(sc,cam);
 // ---- overlays
 const callOut=t>=EV.dial&&t<EV.photos-.2, callIn=t>=EV.ring&&t<EV.black; $('call').style.opacity=(callOut&&(k===1||k===4))||(callIn&&(k===18||k===19))?1:0;
 if(callIn){ $('call').className=t<EV.answer?'inc':''; $('cnm').textContent='MOM'; $('cst').textContent=t<EV.answer?'incoming call':'00:0'+Math.floor(t-EV.answer); } else { $('call').className=''; $('cnm').textContent='Mom'; $('cst').textContent=t<EV.pick?'calling…':'00:0'+Math.min(9,Math.floor(t-EV.pick)); }
 const hud=t>=EV.photos&&t<EV.black; $('hud').style.opacity=hud?1:0; const one=t>=EV.girl+.3; $('n').textContent=one?'1':'0'; $('n').style.color=one?'#c8a8ff':'#ff6a5a'; $('u').textContent=''; $('stage').textContent=t<EV.street?'The discovery':t<EV.hosp?'The panic':t<EV.silence?'The mystery':'The final twist'; $('r').innerHTML=''; $('el').textContent=''; $('wt').textContent='';
 let txt='', who=''; for(const l of TL.lines){ if(t>=l.t&&t<l.t+l.d+.15){ const c=[]; let q=[]; for(const x of l.text.split(' ')){ q.push(x); if(q.length>=6||(/[.,?:]$/.test(x)&&q.length>=2)){ c.push(q.join(' ')); q=[]; } } if(q.length)c.push(q.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const z of c){ acc+=z.length; if(p<=acc){ txt=z; break; } } who=l.who; } }
 $('cap').textContent=t>=EV.vo3?'':txt; $('cap').style.fontStyle=who==='vo'||who===''?'normal':'italic';
 $('title').style.opacity=(1-ss(EV.wake-.5,EV.wake,t))*ss(0,.3,t); $('blk').style.opacity=t>=EV.black?1:0; $('end').style.opacity=ss(EV.vo3-.1,EV.vo3+.3,t);
 $('gl').style.opacity=gl?.9:0; $('c').style.filter=gl?`hue-rotate(${(t*997)%360}deg) contrast(1.5) saturate(1.6)`:'none'; $('c').style.transform=gl?`translateX(${Math.sin(t*173)*28}px)`:'none';
 $('fla').style.background='#000'; $('fla').style.opacity=k===0?1-ss(0,.8,t):0; $('fade').style.opacity=0; };
window.renderAt(0); window.ready=true;
