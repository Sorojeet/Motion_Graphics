import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, flat, shadow, ss, person, woman, skyDome, roundTree, pine, textSign, house, cropRows, bench } from './kit.js';
const TL=await (await fetch('/argon_timeline.json')).json(), SEG=TL.segments, R=rng(1840), $=id=>document.getElementById(id), DUR=TL.duration, NS=SEG.length;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.05,5000), D=new THREE.Object3D(), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xe8e0d8,120,700); const sky=skyDome(sc,0x6f9ae0,0xe8e0d8);
const hemi=new THREE.HemisphereLight(0xe8f0ff,0x5a4a3a,1.4); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xfff0d8,1.6); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:1,far:400}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.06; sc.add(sunL); sc.add(sunL.target);
const composer=new EffectComposer(renderer); composer.setSize(1080,1920); composer.addPass(new RenderPass(sc,cam)); const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.2,.4,.9); composer.addPass(bloom); composer.addPass(new OutputPass());
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=(c,o={})=>new THREE.MeshBasicMaterial({color:c,...o});
// ---------- characters
const face=p=>{ const h=p.children[1], dk=flat(0x1a1210), f=(w,hh,x,y,m=dk)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.02),m); b.position.set(x,y,.18); h.add(b); return b; }; const br=[];
 for(const s of [-1,1]){ f(.065,.055,s*.085,.035); const w=f(.022,.02,s*.085+.012,.045,flat(0xffffff)); w.position.z=.192; br.push(f(.09,.025,s*.085,.095)); } p.userData.brows=br; p.userData.mouth=f(.09,.025,0,-.085,flat(0x6a3a30)); return p; };
const mood=(p,m)=>{ const rz={flat:0,sad:.4,happy:-.15,shock:-.1,calm:-.05}[m], my={flat:1,sad:1,happy:2.6,shock:3.2,calm:1.6}[m], mx={flat:1,sad:.7,happy:1.3,shock:.6,calm:1.2}[m]; p.userData.brows.forEach((q,i)=>{ q.rotation.z=(i?-1:1)*rz; }); p.userData.mouth.scale.set(mx,my,1); };
const arms=(p,a,b=a)=>{ p.children[5].rotation.set(a,0,0); p.children[6].rotation.set(b,0,0); };
const reset=p=>{ p.visible=true; p.rotation.set(0,0,0); p.userData.pose(0,0); arms(p,0); p.children[1].rotation.set(0,0,0); p.children[0].position.y=1.25; p.children[0].rotation.set(0,0,0); mood(p,'calm'); };
const hero=face(person({shirt:0x3f78c4,pants:0x3a3f49,hair:0x3a2418,skin:0xd9a27a})); sc.add(hero);
const wife=face(woman({shirt:0xe8a03a,pants:0x4a3a2a,hair:0x2a1a12,skin:0xc8906a})); sc.add(wife);
const musician=face(person({shirt:0x9a4f8a,pants:0x2a2f3a,hair:0x1a1a1a,skin:0x8a5a3a})); sc.add(musician); const guitar=new THREE.Group(); bx(guitar,.5,.6,.12,0xc8803a,0,0,0); bx(guitar,.08,.7,.06,0x5a3a22,.1,.55,0).rotation.z=-.5; guitar.position.set(0,1.05,.25); guitar.rotation.z=.9; musician.add(guitar);
const shirts=[0xd64f4f,0x4fa28f,0xb8a2e6,0xefc14d,0x7ec4bc,0xf0a79d];
const folk=[...Array(6)].map((_,i)=>{ const p=face((i%2?woman:person)({shirt:shirts[i],pants:[0x3a4a6a,0x5a4a3a][i%2],skin:[0xd9a27a,0x8a5a3a,0xe8c09a,0xb8805a][i%4],hair:[0x2a1a12,0x6a3a20,0x1a1a1a][i%3]})); sc.add(p); return p; });
const sack=bx(hero.children[6],.4,.45,.3,0xd8c898,0,-.85,.05); const leaf=bx(hero.children[6],.22,.03,.12,0xc8c050,0,-.78,.12);
// ---------- world
const world=new THREE.Group(); sc.add(world);
const grassM=flat(0x8ab85a); bx(world,1200,.04,1200,grassM,0,-.04,-100).castShadow=false;
bx(world,4,.05,80,0xb8a888,0,.01,0).castShadow=false; bx(world,70,.05,4,0xb8a888,0,.012,-2).castShadow=false;
// mountains
for(let i=0;i<22;i++){ const a=i/22*Math.PI*2, r=170+R()*80, h=70+R()*90; const m=shadow(new THREE.Mesh(new THREE.ConeGeometry(50+R()*30,h,7),flat([0x7a8a7a,0x6a7a6a,0x8a8a7a][i%3]))); m.position.set(Math.cos(a)*r,h/2-2,Math.sin(a)*r-40); world.add(m); const c=new THREE.Mesh(new THREE.ConeGeometry(14,h*.22,7),flat(0xf6f6f2)); c.position.set(m.position.x,h-h*.11-2,m.position.z); world.add(c); }
// hill with pines for wildfire
const hill=shadow(new THREE.Mesh(new THREE.ConeGeometry(34,16,10),flat(0x7aa04a))); hill.position.set(48,8-.5,-40); world.add(hill); const hillPines=[];
for(let i=0;i<46;i++){ const a=R()*Math.PI*2, r=4+R()*28, x=48+Math.cos(a)*r, z=-40+Math.sin(a)*r, y=Math.max(0,15.5*(1-r/34)); if(z>-14) continue; const t=pine(R,flat(0x2f6a3a),flat(0x5a4030),1); t.position.set(x,y,z); world.add(t); hillPines.push(t); }
// town
const houses=[[0,-12,0xf2e6c8],[-12,-13,0xa9b4d8],[12,-13,0xeaa985],[-24,-14,0xf6b172],[24,-14,0xd8e4ec],[-12,10,0xf2e6c8],[12,10,0xb8a2e6]].map(([x,z,c],i)=>{ const h=house(c,[0x9a4f3a,0x4b5a78,0x6b4a3a][i%3]); h.position.set(x,0,z); if(z>0) h.rotation.y=Math.PI; world.add(h); return h; });
for(let i=0;i<30;i++){ const t=roundTree(R,[flat(0x4f8a3a),flat(0x5a9a48)],flat(0x6b4a33),1); const x=-60+R()*120, z=-60+R()*30; if(Math.abs(x)<30&&z>-22) continue; t.position.set(x,0,z); world.add(t); }
const bnch=bench(); bnch.position.set(-3.4,.05,-6.2); world.add(bnch);
// barometer dial on the hero's house wall
const dial=new THREE.Group(); dial.position.set(2.6,2.2,-7.85); world.add(dial); const face_=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.08,32),flat(0xf6f2ea)); face_.rotation.x=Math.PI/2; dial.add(face_); const rim=new THREE.Mesh(new THREE.TorusGeometry(.76,.06,6,32),flat(0xc8a050)); dial.add(rim);
for(let i=0;i<=8;i++){ const a=Math.PI*(.85-i*.2125); const tk=bx(dial,.03,.14,.02,i===6?0xd64f4f:0x2a2c32,Math.cos(a)*.6,Math.sin(a)*.6,.06); tk.rotation.z=a-Math.PI/2; }
const needle=new THREE.Group(); needle.position.z=.08; dial.add(needle); bx(needle,.04,.6,.02,0xd64f4f,0,.27,0); const dLab=textSign('ATM',.5,.16,'#f6f2ea','#2a2c32'); dLab.position.set(0,-.35,.06); dial.add(dLab);
// grill
const grill=new THREE.Group(); grill.position.set(4.2,0,-4.6); world.add(grill); bx(grill,1.2,.7,.7,0x2a2c32,0,.85,0); for(const s of [-1,1]) for(const z of [-.25,.25]) bx(grill,.06,.5,.06,0x2a2c32,s*.5,.25,z);
const flames=[...Array(7)].map((_,i)=>{ const f=new THREE.Mesh(new THREE.ConeGeometry(.12,.5,5),glowM(i%2?0xffa040:0xffd060)); f.position.set(-.42+i*.14,1.4,0); grill.add(f); return f; }); const grillL=new THREE.PointLight(0xffa050,0,8); grillL.position.set(0,1.8,0); grill.add(grillL);
// wildfire flames on the hill
const fireN=hillPines.length, fires=hillPines.map(t=>{ const g=new THREE.Group(); g.position.copy(t.position); world.add(g); for(let i=0;i<3;i++){ const f=new THREE.Mesh(new THREE.ConeGeometry(.9-i*.2,3-i*.6,6),glowM([0xff5a20,0xffa040,0xffe080][i])); f.position.y=1.5+i*.3; g.add(f); } return g; });
const smokeN=120, smoke=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.4,0),new THREE.MeshLambertMaterial({color:0x6a6460,transparent:true,opacity:.55}),smokeN); smoke.frustumCulled=false; world.add(smoke); const smd=[...Array(smokeN)].map(()=>[R(),R(),R()]);
// fields
const field=new THREE.Group(); field.position.set(-26,0,14); world.add(field); const cropM=flat(0x5aa03a); const crops=cropRows(26,16,0x5aa03a,R,1,.6); crops.traverse(o=>{ if(o.isMesh) o.material=cropM; }); field.add(crops);
// factory
const fac=new THREE.Group(); fac.position.set(28,0,14); world.add(fac); bx(fac,14,6,9,0xc8ccd2,0,3,0); for(const x of [-4,0,4]){ const c=shadow(new THREE.Mesh(new THREE.CylinderGeometry(.7,.9,12,8),flat(0xa8acb4))); c.position.set(x,6,-3); fac.add(c); bx(fac,1.6,.4,1.6,0xd64f4f,x,11.8,-3); }
for(const x of [-5,5]){ const tk=shadow(new THREE.Mesh(new THREE.SphereGeometry(2,10,8),flat(0xe8ecf0))); tk.position.set(x,2,7); fac.add(tk); }
const facSign=textSign('FERTILIZER',5,.9,'#4f8a3a','#ffffff'); facSign.position.set(0,5.3,-4.55); facSign.rotation.y=Math.PI; fac.add(facSign); const closedS=textSign('NO NITROGEN',4,.8,'#d64f4f','#ffffff'); closedS.position.set(0,1.8,-4.56); closedS.rotation.y=Math.PI; fac.add(closedS);
// sacks pile
const sacks=[...Array(12)].map((_,i)=>bx(world,.8,.6,.6,0xd8c898,-15+(i%4)*.85,.3+Math.floor(i/4)*.6,5.2));
// soil close-up patch
const soil=bx(world,6,.1,6,0x5a4030,-18,.03,-30); for(let i=0;i<40;i++) bx(world,.12+R()*.2,.08,.12+R()*.2,[0x4a3428,0x6a5040,0x3a2a20][i%3],-18+(R()-.5)*5.6,.1,-30+(R()-.5)*5.6);
const sprout=[...Array(6)].map((_,i)=>{ const g=new THREE.Group(); g.position.set(-18.8+i*.35,.08,-30.4+(i%2)*.5); bx(g,.03,.3,.03,0x6a9a3a,0,.15,0); bx(g,.16,.02,.08,0xc8c050,.06,.28,0).rotation.z=.4; world.add(g); return g; });
// molecules (N2 pairs morph into Ar atoms), sound rings, lightning, bubbles
const MN=260, nA=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.065,1),new THREE.MeshLambertMaterial({color:0x5a9ae8,emissive:0x1a2a50}),MN*2), arI=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.095,1),new THREE.MeshLambertMaterial({color:0xb88aff,emissive:0x40206a}),MN); nA.frustumCulled=arI.frustumCulled=false; sc.add(nA,arI); const md=[...Array(MN)].map(()=>[R(),R(),R(),R(),R()]);
const rings=[...Array(6)].map(()=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(1,.03,4,40),glowM(0xc8a8ff,{transparent:true})); sc.add(r); return r; });
const bolt=new THREE.Group(); world.add(bolt); { let p=V(-26,40,10); for(let i=0;i<9;i++){ const q=p.clone().add(V((R()-.5)*4,-4.4,(R()-.5)*2)); const seg=new THREE.Mesh(new THREE.BoxGeometry(.25,p.distanceTo(q),.25),glowM(0xf6f0ff)); seg.position.copy(p).add(q).multiplyScalar(.5); seg.lookAt(q); seg.rotateX(Math.PI/2); bolt.add(seg); p=q; } }
const flashL=new THREE.PointLight(0xe8e0ff,0,200); flashL.position.set(-26,30,10); world.add(flashL);
// ======================= timeline
const SH=[]; SEG.forEach((s,i)=>{ const a=i?s.start:0, b=i<NS-1?SEG[i+1].start:DUR; SH.push([a,b]); }); window.SHOTS=SH; window.DURATION=DUR;
const P=(a,b,c,d,u)=>{ cam.position.lerpVectors(V(...a),V(...b),u); cam.lookAt(V(...c).lerp(V(...(d||c)),u)); };
const LOOK={ morning:[0x6f9ae0,0xf2e2c8,[-150,120,140],0xfff0d8,1.6,1.4,0xf2e2c8,'saturate(1.05)'], day:[0x6a92d8,0xe8dcd8,[-120,140,120],0xfff0d8,1.7,1.5,0xe8dcd8,'saturate(1)'], haze:[0x9a8ad0,0xe8d0e8,[-120,140,120],0xfff0e8,1.5,1.5,0xe0d0e8,'saturate(.9) hue-rotate(-8deg)'],
 smoke:[0x8a7a6a,0xe0a070,[200,60,100],0xffb070,1.4,1.1,0xc8a088,'saturate(1)'], storm:[0x3a4050,0x6a7080,[-100,140,100],0xc8d0e0,.7,1,0x5a6070,'saturate(.7)'], dry:[0x8aa0c8,0xe8d8b8,[-120,140,120],0xfff0d8,1.7,1.4,0xe8d8b8,'saturate(.75) sepia(.15)'], dusk:[0x4a3a88,0xe08a8a,[220,30,100],0xff9a70,1.2,.9,0xc890a0,'saturate(.95)'] };
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=NS-1; const T0=SH[k][0], u=(t-T0)/(SH[k][1]-T0), sub=(a,b)=>ss(0,1,(u-a)/(b-a));
 let lk='day', molA=0, morph=1, molC=V(0,2,-4), molR=8, sink=0, press=1.32, grillF=1, wild=0, ringsOn=0, ringC=V(0,0,0), bolted=0, yellow=0, shrink=0, bubbles=0, sway=0, blur=0;
 [hero,wife,musician].forEach(reset); musician.visible=false; wife.visible=false; folk.forEach(p=>{ reset(p); p.visible=false; }); sack.visible=false; leaf.visible=false;
 hero.position.set(0,0,-5.4); closedS.visible=false;
 switch(k){
 case 0: lk='morning'; molA=1; press=1; morph=sub(.6,.75); if(u<.45){ hero.visible=false; molC=V(0,14,20); molR=22; P([-30,30,70],[-6,10,26],[0,4,-12],[0,2,-8],sub(0,.45)); } else { const q=sub(.45,1); molR=4; molC=V(0,1.8,-3.2); hero.position.set(0,0,-5.2); hero.children[0].scale.set(1+Math.sin(t*2)*.03,1,1); hero.children[1].rotation.x=-.15; mood(hero,q<.3?'calm':'flat'); P([.8,1.9,-.8],[.6,1.8,-1.6],[0,1.6,-5.2],[0,1.6,-5.2],q); } break;
 case 1: molA=1; sink=u; molC=V(0,1.4,-4); molR=5; if(u<.45){ hero.visible=false; press=lg(1,1.32,ss(.1,.9,sub(0,.45))); P([2.3,2,-4.4],[2.5,2.1,-5.2],[2.6,2.1,-7.85],[2.6,2.15,-7.85],sub(0,.45)); } else { const q=sub(.45,1); hero.position.set(.6,0,-5.6); wife.visible=true; wife.position.set(-.6,0,-5.4); [hero,wife].forEach((p,i)=>{ p.rotation.y=i?.3:-.3; arms(p,0,-2.95); const sx=Math.sign(p.children[6].position.x)||1; p.children[6].rotation.z=sx*.12; p.children[1].rotation.x=.1; p.children[1].rotation.z=Math.sin(t*3+i)*.12; mood(p,'shock'); }); P([0,1.75,-.8],[0,1.7,-1.4],[0,1.7,-5.5],[0,1.7,-5.5],q); } break;
 case 2: lk='haze'; molA=.6; molC=V(-2,1.6,-4); molR=5; sway=1; blur=1.4; { const q=u; hero.position.set(-3.4,.05,-6.2); hero.userData.sit(); hero.children[0].position.y=1.25; hero.children[1].rotation.z=Math.sin(t*1.3)*.18; mood(hero,'happy'); folk.slice(0,3).forEach((p,i)=>{ p.visible=true; p.position.set(-1.2+i*1.3,0,-3.6+i*.5); p.rotation.y=Math.sin(t*.8+i)*.6; p.rotation.z=Math.sin(t*1.4+i*2)*.08; p.children[1].rotation.z=Math.sin(t*1.7+i)*.2; mood(p,i%2?'happy':'flat'); }); P([-1,2,1.2],[-1.8,1.9,.6],[-2,1.2,-5],[-2.4,1.2,-5.4],q); } break;
 case 3: ringsOn=1; { const q=u; musician.visible=true; musician.position.set(-6,0,-3); musician.rotation.y=.7; arms(musician,-1+Math.sin(t*8)*.15,-.8); mood(musician,'happy'); musician.children[1].rotation.x=Math.sin(t*2)*.1; ringC=V(-5.6,1.5,-2.6); hero.position.set(-3.6,0,-1.6); hero.rotation.y=-1.6; mood(hero,'shock'); P([-3.2,1.8,2.6],[-3.6,1.75,2],[-5,1.4,-2.4],[-5,1.4,-2.4],q); } break;
 case 4: if(u<.45){ const q=sub(0,.45); grillF=2.4; hero.position.set(4.2,0,-3.2); hero.rotation.y=Math.PI; hero.children[0].rotation.x=-.18; arms(hero,-.6,-.6); mood(hero,'shock'); P([6.6,1.8,-1.2],[6.2,1.7,-1.6],[4.2,1.3,-4.4],[4.2,1.3,-4.4],q); } else { lk='smoke'; const q=sub(.45,1); wild=ss(0,.8,q); hero.position.set(8,0,-6); hero.rotation.y=Math.PI*.8; mood(hero,'shock'); P([2,4,8],[-2,6,10],[40,10,-36],[46,12,-40],q); } break;
 case 5: if(u<.4){ lk='storm'; hero.visible=false; const q=sub(0,.4); bolted=q>.45&&q<.62?1:0; P([-20,3,34],[-22,3.6,32],[-26,8,10],[-26,10,10],q); } else { lk='dry'; const q=sub(.4,1); yellow=ss(0,.6,q); hero.position.set(-18,0,22.6); hero.rotation.y=0; hero.children[0].rotation.x=.4; hero.children[0].position.y=1.05; arms(hero,-.9,-1.1); leaf.visible=true; mood(hero,'sad'); P([-16.6,1.6,25.8],[-17,1.5,25.3],[-18,.9,21.6],[-18,.8,21.6],q); } break;
 case 6: lk='dry'; yellow=1; if(u<.45){ hero.visible=false; closedS.visible=true; const q=sub(0,.45); P([14,6,-12],[18,4,-6],[28,5,10],[28,5,12],q); } else { const q=sub(.45,1); shrink=q; hero.position.set(-13.6,0,3.4); hero.rotation.y=Math.PI+.3; sack.visible=true; arms(hero,0,-.2); mood(hero,'sad'); wife.visible=true; wife.position.set(-11.8,0,3.8); wife.rotation.y=Math.PI-.4; mood(wife,'sad'); P([-10,2.2,-1.2],[-10.6,2.1,-.4],[-13.4,1,5],[-13.4,1,5],q); } break;
 case 7: if(u<.5){ lk='day'; yellow=.6; bubbles=1; hero.visible=false; const q=sub(0,.5); P([-16.8,.8,-27.4],[-17.2,.7,-28],[-18,.2,-30],[-18,.25,-30],q); } else { lk='dusk'; yellow=.6; hero.visible=false; const q=sub(.5,1); P([0,4,6],[40,70,100],[0,2,-10],[0,10,-60],q); } break; }
 // ---- states
 { const idx=(press-1)/.05; const a=Math.PI*(.85-Math.min(8,Math.max(0,idx))*.2125); needle.rotation.z=a-Math.PI/2; }

 md.forEach((q,i)=>{ const on=molA>0&&q[4]<molA; const a=t*(.3+q[3]*.4)+q[0]*30; let p=V(molC.x+(q[0]-.5)*molR*2+Math.sin(a)*.4,molC.y+(q[1]-.5)*molR*(1-sink*.6)-sink*molR*.25+Math.cos(a*1.3)*.3,molC.z+(q[2]-.5)*molR*2); if(p.y<.15) p.y=.15+q[1]*.2;
  const far=p.distanceTo(cam.position)>3.2, sN=on&&far&&morph<1?1-morph:0, sA=on&&far?morph:0; D.rotation.set(a,a*.7,0); D.position.copy(p); D.scale.setScalar(Math.max(.0001,sA)); D.updateMatrix(); arI.setMatrixAt(i,D.matrix);
  for(const s of [-1,1]){ D.position.copy(p).add(V(s*.055*Math.cos(a),0,s*.055*Math.sin(a))); D.scale.setScalar(Math.max(.0001,sN)); D.updateMatrix(); nA.setMatrixAt(i*2+(s>0?1:0),D.matrix); } });
 nA.instanceMatrix.needsUpdate=arI.instanceMatrix.needsUpdate=true; nA.visible=arI.visible=molA>0;
 rings.forEach((r,i)=>{ r.visible=ringsOn>0; const f=((t*.35+i/6)%1); r.position.copy(ringC); r.lookAt(cam.position); r.scale.setScalar(.3+f*3.2); r.material.opacity=(1-f)*.8; });
 flames.forEach((f,i)=>{ f.scale.set(1,grillF*(.8+.4*Math.sin(t*13+i*2)),1); f.position.y=1.2+.25*grillF; f.material.color.set(grillF>2?(i%2?0xff8a30:0xffc040):(i%2?0xffa040:0xffd060)); }); grillL.intensity=grillF*6;
 fires.forEach((g,i)=>{ const d=Math.hypot(g.position.x-60,g.position.z+30); const on=wild*42>d; g.visible=on; g.children.forEach((f,j)=>f.scale.set(1,.8+.4*Math.sin(t*9+i+j),1)); });
 smd.forEach((q,i)=>{ const on=wild>0&&q[2]<wild; const f=(t*.12+q[0])%1; const g=fires[Math.floor(q[1]*fireN)]; D.position.set(g.position.x+f*8,g.position.y+3+f*22,g.position.z-f*2); D.scale.setScalar(on?.6+f*2.5:.0001); if(!on) D.position.set(0,-80,0); D.updateMatrix(); smoke.setMatrixAt(i,D.matrix); }); smoke.instanceMatrix.needsUpdate=true;
 bolt.visible=bolted>0; flashL.intensity=bolted*30;
 cropM.color.set(new THREE.Color(0x5aa03a).lerp(new THREE.Color(0xc8b050),yellow)); crops.scale.y=lg(1,.45,shrink+yellow*.25); sacks.forEach((s,i)=>s.visible=k===6&&u>=.45?i<lg(12,3,shrink):k!==6);
 sprout.forEach(s=>s.visible=k===7);
 if(bubbles){ md.forEach((q,i)=>{ if(q[4]>.3) return; const f=((t*.18+q[0])%1); const p=V(-18+(q[1]-.5)*4,.12+f*2.2,-30+(q[2]-.5)*4); for(const s of [-1,1]){ D.position.copy(p).add(V(s*.05,0,0)); D.scale.setScalar(.45); D.rotation.set(0,0,0); D.updateMatrix(); nA.setMatrixAt(i*2+(s>0?1:0),D.matrix); } D.scale.setScalar(.0001); D.updateMatrix(); arI.setMatrixAt(i,D.matrix); }); nA.visible=true; nA.instanceMatrix.needsUpdate=arI.instanceMatrix.needsUpdate=true; }
 if(sway) cam.rotateZ(Math.sin(t*.9)*.04);
 if(cam.position.distanceTo(hero.getWorldPosition(V()).add(V(0,1.5,0)))<.5) hero.visible=false;
 // ---- look
 const L_=LOOK[lk]; sky.top.value.set(L_[0]); sky.low.value.set(L_[1]); sc.fog.color.set(L_[6]); sunL.position.set(...L_[2]).add(cam.position); sunL.target.position.copy(cam.position); sunL.color.set(L_[3]); sunL.intensity=L_[4]; hemi.intensity=L_[5]; $('c').style.filter=L_[7]+(blur?` blur(${blur}px)`:'');
 composer.render();
 // ---- HUD
 const seg=SEG[k]; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 const dip=k>0?1-ss(0,.45,t-SH[k][0]):0; $('fla').style.background='#000'; $('fla').style.opacity=dip*.7; $('fade').style.opacity=ss(DUR-.8,DUR,t); };
window.renderAt(0); window.ready=true;
