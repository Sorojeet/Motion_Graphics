import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, flat, shadow, ss, person, woman, skyDome, roundTree, pine, textSign, house, fence, marketStall, cropRows, bird, bench, rock } from './kit.js';
const TL=await (await fetch('/animals_timeline.json')).json(), SEG=TL.segments, R=rng(808), $=id=>document.getElementById(id), DUR=TL.duration, NS=SEG.length;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.05,5000), D=new THREE.Object3D(), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf2e2c8,90,520); const sky=skyDome(sc,0x6f9ae0,0xf2e2c8);
const hemi=new THREE.HemisphereLight(0xe8f0ff,0x5a4a3a,1.4); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xfff0d8,1.6); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:1,far:400}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.06; sc.add(sunL); sc.add(sunL.target);
const composer=new EffectComposer(renderer); composer.setSize(1080,1920); composer.addPass(new RenderPass(sc,cam)); const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.12,.4,.95); composer.addPass(bloom); composer.addPass(new OutputPass());
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=(c,o={})=>new THREE.MeshBasicMaterial({color:c,...o});
// ---------- characters
const face=p=>{ const h=p.children[1], dk=flat(0x1a1210), f=(w,hh,x,y,m=dk)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.02),m); b.position.set(x,y,.18); h.add(b); return b; }; const br=[];
 for(const s of [-1,1]){ f(.065,.055,s*.085,.035); const w=f(.022,.02,s*.085+.012,.045,flat(0xffffff)); w.position.z=.192; br.push(f(.09,.025,s*.085,.095)); } p.userData.brows=br; p.userData.mouth=f(.09,.025,0,-.085,flat(0x6a3a30)); return p; };
const mood=(p,m)=>{ const rz={flat:0,sad:.4,happy:-.15,shock:-.1,calm:-.05}[m], my={flat:1,sad:1,happy:2.6,shock:3.2,calm:1.6}[m], mx={flat:1,sad:.7,happy:1.3,shock:.6,calm:1.2}[m]; p.userData.brows.forEach((q,i)=>{ q.rotation.z=(i?-1:1)*rz; }); p.userData.mouth.scale.set(mx,my,1); };
const arms=(p,a,b=a)=>{ p.children[5].rotation.set(a,0,0); p.children[6].rotation.set(b,0,0); };
const reset=p=>{ p.visible=true; p.rotation.set(0,0,0); p.userData.pose(0,0); arms(p,0); p.children[1].rotation.set(0,0,0); p.children[0].position.y=1.25; mood(p,'calm'); };
const hat=(p,c=0xd8b878)=>{ bx(p.children[1],.62,.05,.62,c,0,.2,0); bx(p.children[1],.38,.16,.38,c,0,.29,0); return p; };
const hero=hat(face(person({shirt:0x6a8a4a,pants:0x3a4a6a,hair:0x5a3a22,skin:0xc8906a})),0xd8b878); sc.add(hero);
const wife=face(woman({shirt:0xd86a5a,pants:0x4a3a2a,hair:0x2a1a12,skin:0xb8805a})); sc.add(wife);
const fisher=hat(face(person({shirt:0x3f78c4,pants:0x2a2f3a,hair:0x2a1a12,skin:0x8a5a3a})),0xe8d8a8); sc.add(fisher);
const bucket=bx(hero.children[6],.26,.3,.26,0x9aa4b0,0,-.82,0); const basket=bx(hero.children[5],.42,.18,.3,0xb8884a,0,-.8,.12);
const vcol=[0xefc14d,0x4fa28f,0xb8a2e6,0xf09a4a,0x7ec4bc,0xf0a79d];
const folk=[...Array(6)].map((_,i)=>{ const p=face((i%2?woman:person)({shirt:vcol[i],pants:[0x3a4a6a,0x5a4a3a][i%2],skin:[0xd9a27a,0x8a5a3a,0xe8c09a,0xb8805a][i%4],hair:[0x2a1a12,0x6a3a20,0x1a1a1a][i%3]})); if(i%2===0) hat(p); sc.add(p); const brush=new THREE.Group(); bx(brush,.04,.5,.04,0x9a6b42,0,-.25,0); bx(brush,.1,.12,.1,0xf6e8c8,0,-.55,0); p.children[6].add(brush); brush.position.set(0,-.7,.05); return p; });
// ---------- world
const world=new THREE.Group(); sc.add(world);
const grassM=flat(0x8ab85a); bx(world,900,.04,700,grassM,0,-.04,-100).castShadow=false;
bx(world,3,.05,40,0xc8a878,0,.01,6).castShadow=false; bx(world,60,.05,3,0xc8a878,-10,.012,-6).castShadow=false;
const farm=house(0xf2e6c8,0x9a4f3a); farm.position.set(0,0,-12); world.add(farm); bx(world,8,.25,2.4,0xb8884a,0,.12,-7.8); for(const x of [-3.7,3.7]) bx(world,.2,3,.2,0xf2e6c8,x,1.5,-6.8); bx(world,8.2,.15,2.6,0x9a4f3a,0,3,-7.8);
const pBench=bench(); pBench.position.set(-2,.25,-8.3); world.add(pBench);
// barn
const barn=new THREE.Group(); barn.position.set(-22,0,-15); world.add(barn); const red=flat(0xb8403a);
bx(barn,12,6,.3,red,0,3,-5); bx(barn,.3,6,10,red,-6,3,0); bx(barn,.3,6,10,red,6,3,0); bx(barn,3.5,6,.3,red,-4.25,3,5); bx(barn,3.5,6,.3,red,4.25,3,5); bx(barn,5,1.6,.3,red,0,5.2,5); bx(barn,12,.1,10,0x8a6a4a,0,.02,0);
for(const s of [-1,1]){ const r=bx(barn,7.4,.25,10.6,0x5a5f6a,s*3.1,7.7,0); r.rotation.z=-s*.6; } bx(barn,12,2.2,.3,red,0,7,-5).scale.set(.82,1,1); bx(barn,12,2.2,.3,red,0,7,5).scale.set(.82,1,1);
for(const s of [-1,1]) for(const x of [1.6,4.6]){ const st=fence(4,0x9a6b42); st.rotation.y=Math.PI/2; st.position.set(s*x,0,-1.2); barn.add(st); }
for(let i=0;i<5;i++) bx(barn,1.4,.9,1,0xe8c86a,-4.8+(i%2)*1.5,.45+Math.floor(i/2)*.9,-4).rotation.y=i*.2;
const barnL=new THREE.PointLight(0xffd8a0,0,18); barnL.position.set(0,5,0); barn.add(barnL);
const coop=new THREE.Group(); coop.position.set(-10,0,-9.5); world.add(coop); bx(coop,3,2,2,0xe8d8b8,0,1,0); const cr=bx(coop,3.4,.2,2.6,0x5a5f6a,0,2.1,0); for(let i=0;i<3;i++){ bx(coop,.7,.5,.4,0x9a6b42,-.9+i*.9,.9,1.1); bx(coop,.5,.08,.3,0xe8c86a,-.9+i*.9,.7,1.1); }
// animals that vanish (cows, chickens, birds)
const cowM=flat(0xf6f2ea), spotM=flat(0x2a2522), animM=[cowM,spotM]; animM.forEach(m=>{ m.transparent=true; });
const cows=[[14,-4],[18,-1],[12,1],[20,-6]].map(([x,z],i)=>{ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=i*1.3; world.add(g); bx(g,1.8,.9,.8,cowM,0,1.1,0); bx(g,.6,.5,.82,spotM,.3,1.2,0); bx(g,.5,.5,.5,cowM,1.05,1.35,0); for(const [a,b] of [[-.7,-.28],[-.7,.28],[.7,-.28],[.7,.28]]) bx(g,.18,.7,.18,cowM,a,.35,b); return g; });
const hens=[...Array(6)].map((_,i)=>{ const g=new THREE.Group(); g.position.set(-11.5+i*.6,0,-7.6+(i%2)*.6); world.add(g); bx(g,.3,.3,.4,cowM,0,.25,0); bx(g,.16,.16,.16,cowM,0,.45,.18); bx(g,.06,.06,.08,glowM(0xd64f4f),0,.56,.18); return g; });
const birdM=new THREE.MeshLambertMaterial({color:0x3a3530,side:THREE.DoubleSide,transparent:true}); const birds=[...Array(14)].map(()=>{ const b=bird(birdM); b.scale.setScalar(.8); world.add(b); return b; });
// fields: flowers, wheat, orchard
const flowers=new THREE.Group(); world.add(flowers); const petal=[0xf0a7c8,0xefc14d,0xf6f2ea,0xd86aa8];
{ const N=500, stem=new THREE.InstancedMesh(new THREE.BoxGeometry(.04,.5,.04),flat(0x4f8a3a),N), head=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.11,0),flat(0xffffff),N); for(let i=0;i<N;i++){ const x=6+R()*16, z=-2+R()*8, h=.35+R()*.35; D.position.set(x,h/2,z); D.scale.set(1,h/.5,1); D.rotation.set(0,0,0); D.updateMatrix(); stem.setMatrixAt(i,D.matrix); D.position.set(x,h,z); D.scale.setScalar(1); D.updateMatrix(); head.setMatrixAt(i,D.matrix); head.setColorAt(i,new THREE.Color(petal[i%4])); } flowers.add(stem,head); }
const wheat=new THREE.Group(); wheat.position.set(32,0,-18); world.add(wheat); const wr=cropRows(26,18,0xe0b850,R,1.1,.55); wheat.add(wr);
const trees=[], blossoms=[], fruits=[], orchM=[flat(0x5a9a48),flat(0x4f8a3a)], nets=[];
for(let a=0;a<5;a++) for(let b=0;b<4;b++){ const x=-40+a*7, z=12+b*7; const t=roundTree(R,orchM,flat(0x6b4a33),.85); t.position.set(x,0,z); world.add(t); trees.push(t);
 const bl=new THREE.Group(), fr=new THREE.Group(); bl.position.set(x,0,z); fr.position.set(x,0,z); world.add(bl,fr); for(let i=0;i<26;i++){ const th=R()*Math.PI*2, ph=.3+R()*1.4, r=1.95; const p=V(Math.sin(ph)*Math.cos(th)*r,3.35+Math.cos(ph)*r*.75,Math.sin(ph)*Math.sin(th)*r); const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.24,0),flat(0xf6c8d8)); m.position.copy(p); bl.add(m); const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.22,0),flat(0xd63a3a)); f.position.copy(p).multiplyScalar(1); f.position.y-=.05; fr.add(f); } blossoms.push(bl); fruits.push(fr); }
const ladders=[0,5,6,11].map(i=>{ const t=trees[i], g=new THREE.Group(); for(const s of [-1,1]) bx(g,.08,3.4,.08,0x9a6b42,s*.25,1.7,0); for(let k=0;k<7;k++) bx(g,.5,.06,.06,0x9a6b42,0,.4+k*.45,0); g.position.set(t.position.x,0,t.position.z+2); g.rotation.x=-.32; world.add(g); return g; });
// lake, dock, boat
const water=new THREE.Mesh(new THREE.PlaneGeometry(90,60),new THREE.MeshLambertMaterial({color:0x4f8fb8})); water.rotation.x=-Math.PI/2; water.position.set(62,.05,58); world.add(water); bx(world,92,.04,62,0xd8c898,62,.01,58).castShadow=false;
const dock=new THREE.Group(); dock.position.set(30,0,24); world.add(dock); bx(dock,2.4,.2,10,0x9a6b42,0,.5,5); for(let i=0;i<5;i++) for(const s of [-1,1]) bx(dock,.2,1,.2,0x6b4a33,s*1.1,.2,i*2.4);
const boat=new THREE.Group(); world.add(boat); bx(boat,1.8,.6,4,0x3f78c4,0,.35,0); bx(boat,1.4,.1,3.4,0x9a6b42,0,.6,0); const net=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,0),new THREE.MeshLambertMaterial({color:0xb8b0a0,wireframe:true})); fisher.children[5].add(net); net.position.set(0,-.85,.25);
for(let i=0;i<30;i++){ const t=pine(R,flat(0x2f6a3a),flat(0x5a4030),1); t.position.set(80+R()*60,0,20+R()*50); world.add(t); }
for(let i=0;i<26;i++){ const t=roundTree(R,[flat(0x4f8a3a),flat(0x3f7a38)],flat(0x6b4a33),1); t.position.set(-80+R()*160,0,-40-R()*40); world.add(t); }
// market stall
const stall=marketStall(5,0xd64f4f,[0xd63a3a,0xefc14d,0x7fbf4f],R,{shutter:false}); stall.position.set(5,0,4); stall.rotation.y=-Math.PI/2; world.add(stall); const noFruit=textSign('NO FRUIT',2.4,.6,'#d64f4f','#ffffff'); noFruit.position.set(3.8,2.4,4); noFruit.rotation.y=-Math.PI/2; world.add(noFruit); const bread=textSign('BREAD · RICE',2.4,.6,'#c8702a','#ffffff'); bread.position.set(3.78,2.4,4); bread.rotation.y=-Math.PI/2; world.add(bread);
// leaves + mushrooms (decomposition)
const leafN=160, leaves=new THREE.InstancedMesh(new THREE.PlaneGeometry(.22,.14),new THREE.MeshLambertMaterial({color:0x9a6a32,side:THREE.DoubleSide}),leafN); world.add(leaves); for(let i=0;i<leafN;i++){ D.position.set(-26+(R()-.5)*4,.04,19+(R()-.5)*4); D.rotation.set(-Math.PI/2,0,R()*6); D.scale.setScalar(1); D.updateMatrix(); leaves.setMatrixAt(i,D.matrix); leaves.setColorAt(i,new THREE.Color([0x9a6a32,0x7a4a22,0xb8883a][i%3])); }
const shrooms=new THREE.Group(); world.add(shrooms); for(let i=0;i<9;i++){ const g=new THREE.Group(); g.position.set(-26+(R()-.5)*3,0,19+(R()-.5)*3); bx(g,.08,.2,.08,0xf2e6c8,0,.1,0); const cap=shadow(new THREE.Mesh(new THREE.ConeGeometry(.16,.12,6),flat(i%3?0xc8a878:0xd64f4f))); cap.position.y=.24; g.add(cap); g.scale.setScalar(1+R()); shrooms.add(g); }
// floating particles: pollen / petals
const PN=300, parts=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.05,0),new THREE.MeshBasicMaterial({color:0xfff0a0}),PN); parts.frustumCulled=false; world.add(parts); const pd=[...Array(PN)].map(()=>[R(),R(),R(),R()]);
const petalsI=new THREE.InstancedMesh(new THREE.PlaneGeometry(.12,.1),new THREE.MeshLambertMaterial({color:0xf6c8d8,side:THREE.DoubleSide}),PN); petalsI.frustumCulled=false; world.add(petalsI);

// bees, swarm, caterpillars, nets, spray mist
const BN=70, beeB=new THREE.InstancedMesh(new THREE.BoxGeometry(.13,.1,.19),flat(0xefc14d),BN), beeW=new THREE.InstancedMesh(new THREE.PlaneGeometry(.26,.09),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7,side:THREE.DoubleSide}),BN); beeB.frustumCulled=beeW.frustumCulled=false; world.add(beeB,beeW); const bd=[...Array(BN)].map(()=>[R(),R(),R(),R()]);
const SN=900, swarm=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.03,0),new THREE.MeshBasicMaterial({color:0x2a2620}),SN); swarm.frustumCulled=false; world.add(swarm); const sd=[...Array(SN)].map(()=>[R(),R(),R(),R()]);
const CN=400, cats=new THREE.InstancedMesh(new THREE.BoxGeometry(.07,.07,.22),flat(0x8acc3a),CN); cats.frustumCulled=false; world.add(cats); { let i=0; trees.forEach(t=>{ for(let j=0;j<20;j++){ const th=R()*6.28, ph=.3+R()*1.3, r=1.9; D.position.set(t.position.x+Math.sin(ph)*Math.cos(th)*r,3.35+Math.cos(ph)*r*.75,t.position.z+Math.sin(ph)*Math.sin(th)*r); D.rotation.set(R()*3,R()*3,0); D.scale.setScalar(1); D.updateMatrix(); cats.setMatrixAt(i++,D.matrix); } }); }
trees.forEach(t=>{ const n=new THREE.Mesh(new THREE.SphereGeometry(2.7,18,10,0,Math.PI*2,0,Math.PI*.62),new THREE.MeshBasicMaterial({color:0xf6f6f0,wireframe:true,transparent:true,opacity:.7})); n.position.set(t.position.x,1.9,t.position.z); world.add(n); nets.push(n); });
const MN=200, mistI=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.12,0),new THREE.MeshBasicMaterial({color:0xe8f4f0,transparent:true,opacity:.35,depthWrite:false}),MN); mistI.frustumCulled=false; world.add(mistI); const msd=[...Array(MN)].map(()=>[R(),R(),R()]);
const tank=bx(folk[4],.4,.6,.25,0xd64f4f,0,1.35,-.25);
// ======================= timeline
const SH=[]; SEG.forEach((s,i)=>{ const a=i?s.start:0, b=i<NS-1?SEG[i+1].start:DUR; SH.push([a,b]); }); window.SHOTS=SH; window.DURATION=DUR;
const P=(a,b,c,d,u)=>{ cam.position.lerpVectors(V(...a),V(...b),u); cam.lookAt(V(...c).lerp(V(...(d||c)),u)); };
const LOOK={ dawn:[0x7a8ad0,0xf8c8a0,[-200,50,180],0xffd0a0,1.4,1.2,0xf2d0b0,'saturate(.95)'], day:[0x6f9ae0,0xf2e2c8,[-120,140,120],0xfff0d8,1.7,1.5,0xf2e2c8,'saturate(1.05)'],
 spring:[0x7aa8e8,0xf6e6d8,[-110,140,130],0xfff4e8,1.7,1.5,0xf6e6d8,'saturate(1.08)'], gold:[0x6a8ad8,0xf8d8a0,[180,70,140],0xffd8a0,1.6,1.3,0xf2d8b0,'saturate(1.05)'], dusk:[0x3a3a78,0xf0906a,[220,30,100],0xff9a60,1.2,.9,0xd89a80,'saturate(.9)'], muted:[0x8aa0c8,0xe0d8c8,[-120,140,120],0xf0ece0,1.4,1.4,0xe0d8c8,'saturate(.6)'] };
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=NS-1; const T0=SH[k][0], u=(t-T0)/(SH[k][1]-T0), sub=(a,b)=>ss(0,1,(u-a)/(b-a));
 let lk='day', beesOn=0, swarmA=0, swC=V(0,0,0), chew=0, netA=0, mistOn=0, mistC=V(0,0,0), animA=0, barnOn=0, boatX=0, blossomOn=0, fruitOn=0, ladOn=false, pollen=0, petalsOn=0, rot=0, stallMode=0;
 [hero,wife,fisher].forEach(reset); wife.visible=false; fisher.visible=false; bucket.visible=false; basket.visible=false; folk.forEach(p=>{ reset(p); p.visible=false; });
 hero.position.set(0,.25,-8.1); tank.visible=false;
 switch(k){
 case 0: lk='dawn'; if(u<.5){ const q=sub(0,.5); animA=1-ss(.45,.9,q); hero.visible=false; P([-30,34,62],[6,16,30],[0,2,-6],[-4,1,-8],q); } else { const q=sub(.5,1); arms(hero,0,q>.25&&q<.7?-2.7:0); hero.children[6].rotation.z=q>.25&&q<.7?.6:0; hero.children[1].rotation.y=Math.sin(t*1.1)*.5; mood(hero,q<.5?'flat':'sad'); P([1.6,1.9,-3.2],[1.3,1.85,-4],[0,1.7,-8.1],[0,1.7,-8.1],q); } break;
 case 1: if(u<.55){ const q=sub(0,.55); barnOn=1; hero.position.set(-22,0,lg(-8,-12.5,ss(0,.75,q))); hero.rotation.y=Math.PI+.3*ss(.75,1,q); hero.userData.pose(t*4,q<.75?.35:0); bucket.visible=true; arms(hero,0,-.15); mood(hero,q>.8?'shock':'flat'); P([-25.2,2.6,-18.6],[-25,2.5,-18.2],[-22,1.3,-11],[-22,1.3,-12.5],q); }
  else { const q=sub(.55,1); hero.position.set(-10.6,0,-6.4); hero.rotation.y=.2; basket.visible=true; arms(hero,-.9,0); mood(hero,'sad'); wife.position.set(-9.2,0,-6.2); wife.rotation.y=-.5; mood(wife,'sad'); arms(wife,-.4,0); P([-8.6,1.9,-1.6],[-9,1.8,-2.2],[-10,1.3,-7.4],[-10,1.3,-7.4],q); } break;
 case 2: lk='muted'; fisher.visible=true; hero.visible=false; { const q=u; boatX=lg(1,0,ss(0,.5,q)); boat.position.set(32+boatX*10,0,37+boatX*8); boat.rotation.set(Math.sin(t*1.2)*.03,.6,Math.sin(t*1.5)*.04); if(q<.5){ fisher.position.copy(boat.position).add(V(0,.6,0)); fisher.rotation.y=.6+Math.PI; mood(fisher,'flat'); P([22,7,54],[24,4.5,48],boat.position.toArray(),boat.position.toArray(),sub(0,.5)); } else { const r=sub(.5,1); fisher.position.set(30,.6,33.6); fisher.rotation.y=Math.PI+.2; arms(fisher,-1.3+Math.sin(t*2)*.1,-.2); mood(fisher,'sad'); fisher.children[1].rotation.x=.25; P([29.4,1.9,29.4],[29.6,1.8,30.2],[30,1.5,33.6],[30,1.5,33.6],r); } } break;

 case 3: lk='spring'; beesOn=1; if(u<.5){ hero.visible=false; const q=sub(0,.5); P([9,.55,5.6],[12,.6,5.4],[14,.4,-1],[17,.4,-1],q); } else { const q=sub(.5,1); hero.position.set(13,0,1.6); hero.rotation.y=.3; hero.children[1].rotation.x=-.2; hero.children[1].rotation.y=Math.sin(t*.8)*.4; mood(hero,q<.5?'happy':'flat'); P([14.6,1,6.6],[14.2,.9,6],[13,1.4,1.4],[13,1.5,1.4],q); } break;
 case 4: lk='gold'; swarmA=.4+.6*u; if(u<.5){ hero.visible=false; const q=sub(0,.5); swC=V(34,2,-14); P([24,2.4,-2],[27,2.6,-4],[34,1.4,-14],[35,1.6,-16],q); } else { const q=sub(.5,1); swC=V(13,1.6,1.6); hero.position.set(13,0,1.6); hero.rotation.y=.4; arms(hero,-2.4+Math.sin(t*9)*.6,-1.6+Math.cos(t*8)*.7); hero.children[1].rotation.y=Math.sin(t*3)*.4; mood(hero,'shock'); P([15.4,1.6,6.4],[15,1.6,5.8],[13,1.4,1.6],[13,1.5,1.6],q); } break;
 case 5: lk='muted'; chew=1; if(u<.5){ hero.visible=false; swarmA=.5; swC=V(-30,3.6,18); const q=sub(0,.5); P([-24,2.4,6],[-26,3,8],[-30,3.4,17],[-30,3.2,18],q); } else { stallMode=1; swarmA=.35; swC=V(4,1.6,4); const q=sub(.5,1); hero.position.set(2.8,0,4.6); hero.rotation.y=Math.PI/2; mood(hero,'sad'); wife.visible=true; wife.position.set(2.6,0,3.2); wife.rotation.y=Math.PI/2-.3; mood(wife,'sad'); arms(wife,-.6,0); P([1.6,1.9,10],[1.8,1.85,9.2],[3.4,1.6,4],[3.4,1.6,4],q); } break;
 case 6: lk='spring'; ladOn=true; netA=sub(.05,.6); fruitOn=sub(.45,.95); mistOn=1; { folk.slice(0,4).forEach((p,i)=>{ const L=ladders[i]; p.visible=true; p.position.set(L.position.x,1.3,L.position.z-.35); p.rotation.y=Math.PI; arms(p,-2.6+Math.sin(t*3+i)*.2,-2.6+Math.sin(t*2.5+i*2)*.2); mood(p,'calm'); }); const sp=folk[4]; sp.visible=true; sp.position.set(-29.5,0,lg(36,30,u)); sp.rotation.y=Math.PI; sp.userData.pose(t*3,.25); arms(sp,0,-1.1); mistC=sp.position.clone().add(V(-.1,1.1,-1.4)); hero.position.set(-26,0,28.4); hero.rotation.y=Math.PI; arms(hero,-2.5,-2.5+Math.sin(t*3)*.2); mood(hero,'calm'); if(u<.5) P([-18,4.6,48],[-20,4.2,42],[-31,2.6,24],[-30,2.6,24],sub(0,.5)); else P([-21.6,2.4,31.6],[-22,2.5,31],[-26,2.6,27.4],[-26,2.8,27.4],sub(.5,1)); } break;
 case 7: if(u<.55){ lk='dusk'; const q=sub(0,.55); hero.position.set(-2.4,.25,-8.3); hero.userData.sit(); hero.children[0].position.y=1.25; hero.position.y=-.05; wife.visible=true; wife.userData.sit(); wife.position.set(-1.6,-.05,-8.3); mood(hero,'sad'); mood(wife,'sad'); hero.children[1].rotation.y=-.3; wife.children[1].rotation.y=.3; swarmA=.1; swC=V(-2,3.6,-6.6); P([-1.7,1.6,-3.4],[-1.8,1.5,-4],[-2,1.1,-8.3],[-2,1.1,-8.3],q); } else { lk='dusk'; const q=sub(.55,1); hero.visible=false; P([-2,2.4,-2],[30,60,80],[-2,1,-8],[0,4,-20],q); } break; }
 // ---- states

 tank.visible=k===6; nets.forEach((n,i)=>{ n.visible=netA>((i%5)/6); }); cats.visible=chew>0; orchM[0].color.set(chew?0x9a9a4a:0x5a9a48); orchM[1].color.set(chew?0x8a8a3a:0x4f8a3a); trees.forEach(t=>t.userData.top.scale.setScalar(chew?.82:1));
 bd.forEach((q,i)=>{ const on=beesOn&&q[3]<.9; const a=t*(1+q[2])+i; D.position.set(9+q[0]*8+Math.sin(a)*.6,.6+q[1]*.7+Math.sin(a*2.3)*.12,-1+q[2]*5.5+Math.cos(a)*.6); D.rotation.set(0,-a,0); D.scale.setScalar(on?1:.0001); if(!on) D.position.set(0,-50,0); D.updateMatrix(); beeB.setMatrixAt(i,D.matrix); D.rotation.x=Math.sin(t*60+i)*.8; D.updateMatrix(); beeW.setMatrixAt(i,D.matrix); }); beeB.instanceMatrix.needsUpdate=beeW.instanceMatrix.needsUpdate=true;
 sd.forEach((q,i)=>{ const on=q[3]<swarmA; const a=t*(.6+q[2])+q[0]*40, r=.4+q[1]*(k===4&&u<.5?6:2.2); D.position.set(swC.x+Math.cos(a)*r,swC.y+Math.sin(a*1.7+q[2]*9)*r*.45,swC.z+Math.sin(a)*r); D.scale.setScalar(on?1:.0001); if(!on) D.position.set(0,-50,0); D.updateMatrix(); swarm.setMatrixAt(i,D.matrix); }); swarm.instanceMatrix.needsUpdate=true;
 msd.forEach((q,i)=>{ const on=mistOn; const f=(t*.8+q[0])%1; D.position.set(mistC.x+(q[1]-.5)*f*1.6,mistC.y+f*.8+(q[2]-.5)*.3,mistC.z-f*2.2); D.scale.setScalar(on?.4+f*1.5:.0001); if(!on) D.position.set(0,-50,0); D.updateMatrix(); mistI.setMatrixAt(i,D.matrix); }); mistI.instanceMatrix.needsUpdate=true;
 [...cows,...hens].forEach(a=>a.visible=animA>.01); animM.forEach(m=>{ m.opacity=animA; m.depthWrite=animA>.99; }); cows.forEach((c,i)=>c.children[2].rotation.z=Math.sin(t+i)*.1);
 birds.forEach((b,i)=>{ b.visible=animA>.01; const a=t*.4+i*.45; b.position.set(Math.cos(a)*(14+i%4*3),12+i%3*2,-6+Math.sin(a)*(10+i%3*3)); b.rotation.y=-a; b.userData.flap(Math.sin(t*8+i)*.6); }); birdM.opacity=animA;
 barnL.intensity=barnOn*20; if(k!==2){ boat.position.set(32,0,37); boat.rotation.set(0,.6,0); }
 blossoms.forEach(b=>{ b.visible=blossomOn>.01; b.scale.setScalar(Math.max(.01,blossomOn)); }); fruits.forEach((f,i)=>{ f.visible=fruitOn>.01; f.children.forEach((m,j)=>m.scale.setScalar(Math.max(.01,ss(0,1,fruitOn*1.6-(j%5)*.15)))); });
 ladders.forEach(l=>l.visible=ladOn); leaves.visible=shrooms.visible=k===5||k===6; shrooms.children.forEach((s,i)=>s.children[1].scale.setScalar(rot?1:.8));
 wr.rotation.z=Math.sin(t*1.3)*.02; noFruit.visible=stallMode>0; bread.visible=false; stall.userData.piles&&stall.userData.piles.forEach((p,i)=>p.visible=stallMode?i===stall.userData.piles.length-1:true);
 pd.forEach((q,i)=>{ let on=pollen&&q[3]<.85; if(on){ const L=24; D.position.set(24+((q[0]*L+t*(1.6+q[2]))%L),.6+q[1]*2+Math.sin(t*2+i)*.2,-4-q[2]*16); } D.scale.setScalar(on?1:.0001); if(!on) D.position.set(0,-50,0); D.rotation.set(0,0,0); D.updateMatrix(); parts.setMatrixAt(i,D.matrix);
  let pon=petalsOn&&q[3]<.8; if(pon){ const tr=trees[Math.floor(q[0]*20)]; const fall=((t*.5+q[1])%1); D.position.set(tr.position.x+(q[2]-.5)*3+fall*1.5,4.6-fall*4.5,tr.position.z+(q[3]-.5)*3); D.rotation.set(t*2+i,t+i,i); } D.scale.setScalar(pon?1:.0001); if(!pon) D.position.set(0,-50,0); D.updateMatrix(); petalsI.setMatrixAt(i,D.matrix); }); parts.instanceMatrix.needsUpdate=true; petalsI.instanceMatrix.needsUpdate=true;
 if(cam.position.distanceTo(hero.getWorldPosition(V()).add(V(0,1.5,0)))<.5) hero.visible=false;
 // ---- look
 const L_=LOOK[lk]; sky.top.value.set(L_[0]); sky.low.value.set(L_[1]); sc.fog.color.set(L_[6]); sunL.position.set(...L_[2]).add(cam.position); sunL.target.position.copy(cam.position); sunL.color.set(L_[3]); sunL.intensity=L_[4]; hemi.intensity=L_[5]; $('c').style.filter=L_[7];
 composer.render();
 // ---- HUD
 const seg=SEG[k]; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 const dip=k>0?1-ss(0,.45,t-SH[k][0]):0; $('fla').style.background='#000'; $('fla').style.opacity=dip*.7; $('fade').style.opacity=ss(DUR-.8,DUR,t); };
window.renderAt(0); window.ready=true;
