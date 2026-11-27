import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, flat, shadow, ss, person, woman, skyDome, textSign, rock } from './kit.js';
const TL=await (await fetch('/fire_timeline.json')).json(), SEG=TL.segments, R=rng(1000000), $=id=>document.getElementById(id), DUR=TL.duration, NS=SEG.length;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.05,5000), D=new THREE.Object3D(), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf0d8b0,120,700); const sky=skyDome(sc,0x6aa0e0,0xf0d8b0);
const hemi=new THREE.HemisphereLight(0xfff0e0,0x6a5030,1.5); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xffe8c8,1.8); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:400}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.06; sc.add(sunL); sc.add(sunL.target);
const composer=new EffectComposer(renderer); composer.setSize(1080,1920); composer.addPass(new RenderPass(sc,cam)); const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.3,.5,.85); composer.addPass(bloom); composer.addPass(new OutputPass());
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=(c,o={})=>new THREE.MeshBasicMaterial({color:c,...o});
const rk=(m)=>shadow(new THREE.Mesh(rock(1,0,R),m));
// ---------- characters (early humans)
const face=p=>{ const h=p.children[1], dk=flat(0x1a1210), f=(w,hh,x,y,m=dk)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.02),m); b.position.set(x,y,.18); h.add(b); return b; }; const br=[];
 for(const s of [-1,1]){ f(.065,.055,s*.085,.035); const w=f(.022,.02,s*.085+.012,.045,flat(0xffffff)); w.position.z=.192; br.push(f(.09,.025,s*.085,.095)); } p.userData.brows=br; p.userData.mouth=f(.09,.025,0,-.085,flat(0x4a2a20)); return p; };
const mood=(p,m)=>{ const rz={flat:0,sad:.4,happy:-.15,shock:-.1,calm:-.05}[m], my={flat:1,sad:1,happy:2.6,shock:3.2,calm:1.6}[m], mx={flat:1,sad:.7,happy:1.3,shock:.6,calm:1.2}[m]; p.userData.brows.forEach((q,i)=>{ q.rotation.z=(i?-1:1)*rz; }); p.userData.mouth.scale.set(mx,my,1); };
const arms=(p,a,b=a)=>{ p.children[5].rotation.set(a,0,0); p.children[6].rotation.set(b,0,0); };
const reset=p=>{ p.visible=true; p.rotation.set(0,0,0); p.userData.pose(0,0); arms(p,0); p.children[1].rotation.set(0,0,0); p.children[0].position.y=1.25; mood(p,'calm'); };
const skins=[0x7a4a2a,0x6a4028,0x8a5a3a,0x5a3420,0x9a6a48], furs=[0x8a6a42,0x7a5a3a,0x9a7a4a,0x6a4a2a,0xa8885a];
const band=[...Array(6)].map((_,i)=>{ const p=face((i%2?woman:person)({shirt:furs[i%5],pants:0x6a5030,hair:[0x1a120c,0x2a1a10,0x3a2418][i%3],skin:skins[i%5]})); sc.add(p); const brow=bx(p.children[1],.42,.06,.08,skins[i%5],0,.09,.17); const jaw=bx(p.children[1],.36,.12,.34,skins[i%5],0,-.2,.02); jaw.visible=false; p.userData.jaw=jaw; const root=bx(p.children[6],.08,.08,.3,0x9a6a3a,0,-.8,.1); root.visible=false; p.userData.root=root; return p; });
const hero=band[0];
// ---------- world: savanna
const world=new THREE.Group(); sc.add(world);
const groundM=flat(0xd8b860); bx(world,1600,.04,1600,groundM,0,-.05,-100).castShadow=false;
{ const N=1500, g=new THREE.InstancedMesh(new THREE.ConeGeometry(.12,.7,4),flat(0xc8a848),N); g.receiveShadow=true; for(let i=0;i<N;i++){ const a=R()*Math.PI*2, r=3+Math.pow(R(),.7)*80; D.position.set(Math.cos(a)*r,.3,Math.sin(a)*r-10); D.rotation.set((R()-.5)*.3,R()*3,(R()-.5)*.3); D.scale.setScalar(.6+R()*.9); D.updateMatrix(); g.setMatrixAt(i,D.matrix); g.setColorAt(i,new THREE.Color([0xc8a848,0xb89838,0xd8b858,0xa89040][i%4])); } world.add(g); }
const acacia=(x,z,s=1)=>{ const g=new THREE.Group(); g.position.set(x,0,z); g.scale.setScalar(s); world.add(g); const tr=bx(g,.35,4,.35,0x5a4030,0,2,0); tr.rotation.z=.1; for(const [a,b] of [[-.8,.4],[.7,-.3]]){ const br=bx(g,.18,1.6,.18,0x5a4030,a*.6,3.8,b*.6); br.rotation.z=-a*.6; } const top=shadow(new THREE.Mesh(new THREE.CylinderGeometry(3.2,2.6,.9,7),flat(0x5a7a3a))); top.position.y=4.8; g.add(top); const t2=shadow(new THREE.Mesh(new THREE.CylinderGeometry(2,1.8,.6,6),flat(0x6a8a42))); t2.position.set(.8,5.3,.4); g.add(t2); return g; };
[[-14,-12,1.2],[16,-22,1.4],[-30,-34,1.6],[34,-40,1.5],[8,-60,1.8],[-50,-60,1.7],[50,-12,1.3],[-40,10,1.2],[24,14,1.1]].forEach(a=>acacia(...a));
for(let i=0;i<20;i++){ const r=rk(flat(0x9a8a72)); r.position.set(-60+R()*120,0,-70+R()*80); r.scale.setScalar(1+R()*2); world.add(r); }
for(let i=0;i<10;i++){ const h=shadow(new THREE.Mesh(new THREE.ConeGeometry(70+R()*40,18+R()*16,6),flat([0xa88a5a,0x9a7a4a,0xb89a6a][i%3]))); h.position.set(-320+i*70,4,-480-R()*80); world.add(h); }
const water=new THREE.Mesh(new THREE.CircleGeometry(9,10),new THREE.MeshLambertMaterial({color:0x4f8fb8})); water.rotation.x=-Math.PI/2; water.position.set(22,.03,-14); world.add(water);
// snowy north (far)
const north=new THREE.Group(); north.position.set(0,0,-160); world.add(north); bx(north,500,.06,200,0xf2f4f6,0,.02,-90).castShadow=false; for(let i=0;i<9;i++){ const m=shadow(new THREE.Mesh(new THREE.ConeGeometry(40+R()*20,60+R()*40,6),flat(0xe8ecf2))); m.position.set(-200+i*50,25,-120-R()*40); north.add(m); }
for(let i=0;i<16;i++){ const t=new THREE.Group(); t.position.set(-60+R()*120,0,-20-R()*50); north.add(t); bx(t,.3,1.4,.3,0x5a4030,0,.7,0); const c=shadow(new THREE.Mesh(new THREE.ConeGeometry(1.3,3.4,6),flat(0x3a5a4a))); c.position.y=2.8; t.add(c); const s=new THREE.Mesh(new THREE.ConeGeometry(1,1.6,6),flat(0xf6f8fa)); s.position.y=3.8; t.add(s); }
const SNN=400, snow=new THREE.InstancedMesh(new THREE.BoxGeometry(.06,.06,.06),glowM(0xffffff),SNN); snow.frustumCulled=false; sc.add(snow); const snd=[...Array(SNN)].map(()=>[R(),R(),R()]);
// campfire
const camp=new THREE.Group(); world.add(camp); for(let i=0;i<9;i++){ const a=i/9*Math.PI*2; const r=rk(flat(0x7a7268)); r.position.set(Math.cos(a)*.9,0,Math.sin(a)*.9); r.scale.setScalar(.35); camp.add(r); }
for(let i=0;i<4;i++){ const l=bx(camp,1.2,.14,.14,0x5a3a22,0,.12,0); l.rotation.y=i*Math.PI/4; }
const flames=[...Array(6)].map((_,i)=>{ const f=new THREE.Mesh(new THREE.ConeGeometry(.22-i*.02,.9-i*.08,5),glowM([0xff5a20,0xff8a30,0xffb040,0xffd060,0xff7a28,0xffa040][i])); f.position.set(Math.cos(i*2)*.15,.5,Math.sin(i*2)*.15); camp.add(f); return f; });
const fireL=new THREE.PointLight(0xff9a40,0,24); fireL.position.set(0,1.4,0); camp.add(fireL);
const SPN=60, sparks=new THREE.InstancedMesh(new THREE.BoxGeometry(.04,.04,.04),glowM(0xffc060),SPN); sparks.frustumCulled=false; camp.add(sparks); const spd=[...Array(SPN)].map(()=>[R(),R(),R()]);
const smokeN=40, smoke=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.4,0),new THREE.MeshLambertMaterial({color:0x8a8680,transparent:true,opacity:.5}),smokeN); smoke.frustumCulled=false; camp.add(smoke);
// brain icons (cooked vs raw)
const brainG=new THREE.Group(); sc.add(brainG); const brainM=flat(0xf0a0a8); const brain=(s,x)=>{ const g=new THREE.Group(); g.position.x=x; brainG.add(g); for(let i=0;i<9;i++){ const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.32,0),brainM); m.position.set((R()-.5)*.6,(R()-.3)*.35,(R()-.5)*.4); g.add(m); } g.scale.setScalar(s); return g; };
const bBig=brain(1,-1.1), bSmall=brain(.55,1.1); const lBig=textSign('COOKED',1.2,.3,'#ff8a30','#ffffff'); lBig.position.set(-1.1,-.7,0); brainG.add(lBig); const lSmall=textSign('RAW ONLY',1.2,.3,'#6a5030','#ffffff'); lSmall.position.set(1.1,-.7,0); brainG.add(lSmall);
// predator eyes at night
const eyes=[...Array(6)].map(()=>{ const g=new THREE.Group(); sc.add(g); for(const s of [-1,1]) bx(g,.16,.1,.03,glowM(0xffe040),s*.16,0,0); return g; });
const SN=500, starsI=new THREE.InstancedMesh(new THREE.BoxGeometry(.6,.6,.6),glowM(0xffffff),SN); starsI.frustumCulled=false; sc.add(starsI); for(let i=0;i<SN;i++){ const a=R()*Math.PI*2, e=.1+R()*1.3; D.position.set(Math.cos(a)*Math.cos(e)*400,Math.sin(e)*400,Math.sin(a)*Math.cos(e)*400); D.scale.setScalar(.5+R()); D.rotation.set(0,0,0); D.updateMatrix(); starsI.setMatrixAt(i,D.matrix); }
// copper ore + ghosts (things that never exist)
const ore=new THREE.Group(); ore.position.set(-6,0,-3); world.add(ore); for(let i=0;i<5;i++){ const r=rk(flat(i%2?0x4fa88a:0xb8703a)); r.position.set((R()-.5)*2,0,(R()-.5)*2); r.scale.setScalar(.5+R()*.4); ore.add(r); }
const ghostM=new THREE.MeshBasicMaterial({color:0xd8f4ff,wireframe:true,transparent:true,opacity:.9});
const gm=(geo,x,y,z,p)=>{ const m=new THREE.Mesh(geo,ghostM); m.position.set(x,y,z); p.add(m); return m; };
const ghostsA=new THREE.Group(); ghostsA.position.set(-6,0,-3); world.add(ghostsA); gm(new THREE.CylinderGeometry(.4,.28,.8,8),-1.4,1.6,0,ghostsA); const sword=gm(new THREE.BoxGeometry(.1,1.4,.03),0,1.9,0,ghostsA); gm(new THREE.BoxGeometry(1.2,.7,.5),1.5,1.4,0,ghostsA); gm(new THREE.SphereGeometry(.35,8,6),0,1.0,.8,ghostsA);
const ghostsB=new THREE.Group(); ghostsB.position.set(0,0,-60); world.add(ghostsB); gm(new THREE.BoxGeometry(20,10,10),-18,5,0,ghostsB); for(const x of [-24,-20,-16]) gm(new THREE.CylinderGeometry(1.2,1.6,22,8),x,11,-2,ghostsB); gm(new THREE.CylinderGeometry(6,9,14,10),12,7,0,ghostsB); const rocket=new THREE.Group(); rocket.position.set(30,0,4); ghostsB.add(rocket); gm(new THREE.CylinderGeometry(1,1,16,8),0,8,0,rocket); gm(new THREE.ConeGeometry(1,4,8),0,18,0,rocket);
const ghostsC=new THREE.Group(); ghostsC.position.set(0,0,-140); world.add(ghostsC); for(let i=0;i<14;i++){ const h=20+R()*50; gm(new THREE.BoxGeometry(8,h,8),-60+i*9,h/2,(R()-.5)*20,ghostsC); }
// ======================= timeline
const SH=[]; SEG.forEach((s,i)=>{ const a=i?s.start:0, b=i<NS-1?SEG[i+1].start:DUR; SH.push([a,b]); }); window.SHOTS=SH; window.DURATION=DUR;
let ZF=1.6; const P=(a,b,c,d,u)=>{ const tg=V(...c).lerp(V(...(d||c)),u); cam.position.lerpVectors(V(...a),V(...b),u); cam.position.sub(tg).multiplyScalar(ZF).add(tg); cam.lookAt(tg); };
const LOOK={ day:[0x6aa0e0,0xf0d8b0,[-120,140,120],0xffe8c8,1.8,1.5,0xf0d8b0,'saturate(1.08)'], dusk:[0x4a4a90,0xf0905a,[220,30,100],0xff9a60,1.3,1,0xd8987a,'saturate(1.05)'], night:[0x050816,0x182038,[100,140,100],0x6a80c0,.25,.35,0x0c1428,'saturate(.9)'], cold:[0x8aa8d0,0xe8eef4,[-120,140,120],0xf0f4ff,1.4,1.5,0xe0e8f0,'saturate(.85)'], gold:[0x6a8ad8,0xf8c890,[180,50,140],0xffd8a0,1.6,1.3,0xf0c8a0,'saturate(1.1)'] };
window.renderAt=t=>{ ZF=1.6; let k=SH.findIndex(s=>t<s[1]); if(k<0)k=NS-1; const T0=SH[k][0], u=(t-T0)/(SH[k][1]-T0), sub=(a,b)=>ss(0,1,(u-a)/(b-a));
 let lk='day', fireA=0, smokeA=0, brainOn=0, brainS=1, jaw=0, eyesOn=0, starsOn=false, snowOn=0, ghostA=0, ghostB=0, ghostC=0, circle=false;
 band.forEach(reset); band.forEach(p=>{ p.visible=false; p.userData.jaw.visible=false; p.userData.root.visible=false; p.children[1].scale.set(1,1,1); });
 const ring=(n,r,cx=0,cz=0,sit=true)=>{ band.slice(0,n).forEach((p,i)=>{ p.visible=true; const a=i/n*Math.PI*2+.4; p.position.set(cx+Math.cos(a)*r,0,cz+Math.sin(a)*r); p.rotation.y=Math.atan2(cx-p.position.x,cz-p.position.z); if(sit){ p.userData.sit(); p.children[0].position.y=1.25; p.position.y=-.35; } }); };
 switch(k){
 case 0: { if(u<.35){ lk='dusk'; fireA=1; const q=sub(0,.35); ring(5,2.2); band.forEach(p=>mood(p,'happy')); ZF=1; P([30,22,40],[8,5,12],[0,1,0],[0,1,0],q); } else { lk='dusk'; const q=sub(.35,1); fireA=1-ss(.05,.35,q); smokeA=ss(.15,.4,q)*(1-ss(.8,1,q)); ring(5,2.2); band.slice(0,5).forEach((p,i)=>{ mood(p,q<.2?'happy':q<.5?'shock':'sad'); p.children[1].rotation.x=q>.4?.3:0; }); P([2.2,2.6,3.2],[2.4,2.5,3.4],[0,.6,0],[0,.6,0],q); } } break;
 case 1: { ring(5,2.4,0,0,true); band.slice(0,5).forEach((p,i)=>{ p.userData.root.visible=true; arms(p,0,-1.9+Math.sin(t*3+i)*.15); p.userData.mouth.scale.y=1+Math.abs(Math.sin(t*9+i))*2.2; mood(p,'flat'); p.userData.mouth.scale.y=1+Math.abs(Math.sin(t*9+i))*2.2; }); if(u<.5) P([5,3,6],[4,2.6,5.4],[0,.9,0],[0,.9,0],sub(0,.5)); else { ZF=1; const p=band[1].position; P([-p.x*.15,1.7,-p.z*.15],[-p.x*.1,1.65,-p.z*.1],[p.x,1.05,p.z],[p.x,1.05,p.z],sub(.5,1)); } } break;
 case 2: { brainOn=1; brainS=lg(1,.6,sub(.4,.75)); jaw=sub(.45,.8); hero.visible=true; hero.position.set(0,0,0); mood(hero,'flat'); hero.userData.jaw.visible=jaw>0; hero.userData.jaw.scale.set(1+jaw*.4,1+jaw*.8,1+jaw*.2); hero.children[1].scale.set(1-jaw*.12,1-jaw*.08,1); hero.userData.pose(0,0); P([0,2,4.4],[0,2.1,4.8],[0,2.1,0],[0,2.1,0],u); } break;
 case 3: { lk='night'; starsOn=true; eyesOn=1; ring(5,1.2,0,0,true); band.slice(0,5).forEach((p,i)=>{ p.position.y=-.35; p.children[1].rotation.y=Math.sin(t*1.5+i)*.6; mood(p,'shock'); arms(p,-.9,-.9); }); if(u<.5) P([6,4,8],[5,3.4,7],[0,1,0],[0,1,0],sub(0,.5)); else P([-.8,1.3,2.4],[-.6,1.2,2.2],[2,.6,-6],[2,.7,-6],sub(.5,1)); } break;
 case 4: { lk='cold'; snowOn=1; band.slice(0,4).forEach((p,i)=>{ p.visible=true; const q=u; const back=ss(.55,.75,q); p.position.set(-1.8+i*1.2,0,-150+lg(0,-12,ss(0,.55,q))+back*8+(i%2)*.8); p.rotation.y=back>.5?0:Math.PI; p.userData.pose(t*4+i,.35); p.rotation.z=Math.sin(t*20+i)*.04; arms(p,-1.4,-1.4); mood(p,'sad'); }); if(u<.55) P([4,3,-148],[3,2.6,-152],[0,1.3,-162],[0,1.4,-170],sub(0,.55)); else P([0,2.2,-148],[0,2.2,-147],[0,1.3,-159],[0,1.3,-158],sub(.55,1)); } break;
 case 5: { ghostA=1-sub(.55,.9); hero.visible=true; hero.position.set(-6,0,-.4); hero.rotation.y=Math.PI; arms(hero,-.6,-.7); hero.userData.root.visible=true; mood(hero,u<.6?'calm':'sad'); hero.children[1].rotation.x=.2; P([-3.6,2.2,2],[-3.9,2.1,1.8],[-6.4,1.4,-3],[-6.4,1.5,-3],u); } break;
 case 6: { lk='gold'; ghostB=1-sub(.5,.9); ring(4,0,0,0,false); band.slice(0,4).forEach((p,i)=>{ p.position.set(-3+i*2,0,-8); p.rotation.y=Math.PI; mood(p,'calm'); }); ZF=1; P([0,4,6],[2,8,10],[0,10,-60],[0,10,-60],u); } break;
 case 7: { lk=u<.5?'day':'gold'; ghostC=1-sub(.1,.5); band.slice(0,5).forEach((p,i)=>{ p.visible=true; p.position.set(16+i*1.8,0,-4+(i%2)*1.2); p.rotation.y=Math.PI*.9; p.userData.pose(t*3+i,.25); mood(p,'calm'); }); if(u<.5) P([18,3,6],[19,3.4,7],[20,3,-30],[20,4,-50],sub(0,.5)); else { ZF=1; P([20,6,14],[0,80,120],[18,1,-6],[0,0,-60],sub(.5,1)); } } break; }
 // ---- states
 camp.visible=k<=1||k===3; north.visible=k===4; flames.forEach((f,i)=>{ f.visible=fireA>.02; f.scale.set(fireA,fireA*(.8+.4*Math.sin(t*12+i*2)),fireA); f.position.y=.15+.45*fireA; }); fireL.intensity=fireA*30;
 spd.forEach((q,i)=>{ const on=fireA>.3; const f=(t*.6+q[0])%1; D.position.set((q[1]-.5)*.5+Math.sin(t*3+i)*.2*f,.4+f*3,(q[2]-.5)*.5); D.scale.setScalar(on?1-f:.0001); D.rotation.set(0,0,0); D.updateMatrix(); sparks.setMatrixAt(i,D.matrix); }); sparks.instanceMatrix.needsUpdate=true;
 for(let i=0;i<smokeN;i++){ const f=(t*.25+i/smokeN)%1; D.position.set(Math.sin(i)*.3+f*.8,.6+f*4,Math.cos(i)*.3); D.scale.setScalar(smokeA>0?(.4+f*1.6)*smokeA:.0001); D.updateMatrix(); smoke.setMatrixAt(i,D.matrix); } smoke.instanceMatrix.needsUpdate=true;
 brainG.visible=brainOn>0; if(brainOn){ brainG.position.set(0,3.6,0); brainG.lookAt(cam.position); bBig.rotation.y=t*.4; bSmall.rotation.y=t*.4; bBig.scale.setScalar(1); bSmall.scale.setScalar(.55*brainS/.6*.6+.0); bSmall.scale.setScalar(lg(1,.55,sub(.35,.7))); bSmall.position.x=lg(-1.1,1.1,sub(.25,.4)); lSmall.visible=u>.35; lBig.visible=true; }
 eyes.forEach((e,i)=>{ e.visible=eyesOn>0; const a=i/6*Math.PI*2+t*.08; const r=4.5+(i%3)*1.2; e.position.set(Math.cos(a)*r,.7+(i%2)*.2,Math.sin(a)*r); e.lookAt(0,.7,0); const blink=Math.sin(t*2+i*3)>.95; e.scale.y=blink?.1:1; });
 starsI.visible=starsOn;
 snd.forEach((q,i)=>{ const on=snowOn>0; const f=(t*.15+q[1])%1; D.position.set(cam.position.x+(q[0]-.5)*16,8-f*8,cam.position.z-4-q[2]*14); D.scale.setScalar(on?1:.0001); D.rotation.set(t+i,t,0); D.updateMatrix(); snow.setMatrixAt(i,D.matrix); }); snow.instanceMatrix.needsUpdate=true;
 ghostsA.visible=k===5; ghostsB.visible=k===6; ghostsC.visible=k===7; ghostM.opacity=(k===5?ghostA:k===6?ghostB:ghostC)*(.85+.15*Math.sin(t*20)*(Math.sin(t*3)>.6?1:0)); ore.visible=k===5;
 // ---- look
 const L_=LOOK[lk]; sky.top.value.set(L_[0]); sky.low.value.set(L_[1]); sc.fog.color.set(L_[6]); sc.fog.near=lk==='night'?20:120; sc.fog.far=lk==='night'?120:700; sunL.position.set(...L_[2]).add(cam.position); sunL.target.position.copy(cam.position); sunL.color.set(L_[3]); sunL.intensity=L_[4]; hemi.intensity=L_[5]; groundM.color.set(lk==='cold'?0xe8ecf0:0xd8b860); $('c').style.filter=L_[7];
 bloom.strength=lk==='night'?.8:.3;
 composer.render();
 // ---- HUD
 const seg=SEG[k]; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 const dip=k>0?1-ss(0,.45,t-SH[k][0]):0; $('fla').style.background='#000'; $('fla').style.opacity=dip*.7; $('fade').style.opacity=ss(DUR-.8,DUR,t); };
window.renderAt(0); window.ready=true;
