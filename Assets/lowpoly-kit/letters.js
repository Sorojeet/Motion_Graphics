// The Boy Who Received Letters From a Dead Person — Reel 1: The First Letter
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, flat, shadow, ss, person, skyDome, pine, house as houseKit, fence, mailbox, lamp, roundTree } from './kit.js';

const $=id=>document.getElementById(id), R=rng(1203), C=h=>new THREE.Color(h), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const TL=await fetch('/letters_timeline.json').then(r=>r.ok?r.json():null).catch(()=>null);
const DUR=TL?TL.duration:8; window.DURATION=DUR;

const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.02,3000);
const box=(p,w,h,d,c,x,y,z,cast=true)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c),cast,true); m.position.set(x,y,z); p.add(m); return m; };
const glow=(c,o=1)=>new THREE.MeshBasicMaterial({color:c,transparent:o<1,opacity:o,fog:false});

// ============ HOUSE (night)
const house=new THREE.Scene(); house.background=C(0x05070f); house.fog=new THREE.FogExp2(0x0a1024,.075);
const hemi=new THREE.HemisphereLight(0x5a6fb0,0x2a2228,.9); house.add(hemi); const fill=new THREE.PointLight(0x6a80c8,5,11,1.2); fill.position.set(.4,2.6,-.5); house.add(fill);
const moon=new THREE.DirectionalLight(0xb4c6ff,8); moon.position.set(-7.36,6.6,.4); moon.target.position.set(.24,0,-4.6); house.add(moon,moon.target);
moon.castShadow=true; moon.shadow.mapSize.set(2048,2048); Object.assign(moon.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:30}); moon.shadow.bias=-.0004; moon.shadow.normalBias=.03;

// hallway: x -1.6..1.6, z -6..4, ceiling 2.8
const HW=1.6, CE=2.8, WZ0=-4.6, WZ1=-2.2, WY0=.8, WY1=2.45;
const plank=flat(0x7a5a40), wall=flat(0x6f7894), trim=flat(0xa8a4a8), darkWood=flat(0x6a4a36);
for(let i=0;i<5;i++) box(house,HW*2/5-.02,.1,12,i%2?plank:flat(0x86654a),-HW+HW*2/5*(i+.5),-.05,-1,false);
box(house,HW*2,.1,12,flat(0x2a2b36),0,CE+.05,-1); box(house,HW*2+.4,.1,12.4,flat(0x1a120c),0,-.12,-1,false);
// left wall with window hole
box(house,.2,CE,WZ0+6.2,wall,-HW-.1,CE/2,(-6.2+WZ0)/2); box(house,.2,CE,4-WZ1,wall,-HW-.1,CE/2,(WZ1+4)/2);
box(house,.2,WY0,WZ1-WZ0,wall,-HW-.1,WY0/2,(WZ0+WZ1)/2); box(house,.2,CE-WY1,WZ1-WZ0,wall,-HW-.1,(CE+WY1)/2,(WZ0+WZ1)/2);
// window frame + mullions
for(const y of [WY0,WY1,(WY0+WY1)/2]) box(house,.16,.08,WZ1-WZ0,trim,-HW-.05,y,(WZ0+WZ1)/2); for(const z of [WZ0,WZ1,(WZ0+WZ1)/2]) box(house,.16,WY1-WY0,.08,trim,-HW-.05,(WY0+WY1)/2,z);
box(house,.3,.06,WZ1-WZ0+.3,trim,-HW+.05,WY0-.03,(WZ0+WZ1)/2);
// right wall, end wall with the boy's door
box(house,.2,CE,10,wall,HW+.1,CE/2,-1);
const DW=1.0, DH=2.15; box(house,HW-DW/2,CE,.2,wall,-(HW+DW/2)/2-.0,CE/2,-6.1); box(house,HW-DW/2,CE,.2,wall,(HW+DW/2)/2,CE/2,-6.1); box(house,DW,CE-DH,.2,wall,0,(CE+DH)/2,-6.1);
const door=new THREE.Group(); door.position.set(-DW/2,0,-6.05); house.add(door); box(door,DW,DH-.03,.07,darkWood,DW/2,DH/2+.03,0);
for(const [y,h] of [[1.55,.75],[.62,.8]]) for(const x of [.26,.74]) box(door,.34,h,.02,flat(0x56392a),x,y,.045);
const knob=box(door,.07,.07,.1,flat(0xc9a35a),DW-.12,1.02,.07);
for(const s of [-1,1]) box(house,.1,DH+.05,.06,trim,s*(DW/2+.05),DH/2,-5.98); box(house,DW+.3,.1,.06,trim,0,DH+.05,-5.98);
const gap=box(house,DW-.04,.03,.02,glow(0xffa65a),0,.015,-6.0,false); const roomGlow=new THREE.PointLight(0xffa060,.9,2.4,1.6); roomGlow.position.set(0,.05,-5.85); house.add(roomGlow);
// baseboards
for(const s of [-1,1]) box(house,.04,.12,10,trim,s*(HW-.02),.06,-1,false);
// runner rug
box(house,1.1,.02,3.9,flat(0x3e2624),0,.01,-3.15,false); box(house,.95,.022,3.8,flat(0x6e3a36),0,.012,-3.15,false);
const flap=new THREE.Group(); flap.position.set(0,.012,-1.2); house.add(flap); box(flap,1.1,.02,3.1,flat(0x3e2624),0,0,1.55,false); box(flap,.95,.022,3.0,flat(0x6e3a36),0,.002,1.55,false);
// wall clock 12:03 on right wall
const clock=new THREE.Group(); clock.position.set(0,2.47,-5.98); house.add(clock);
{ const face=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.05,24).rotateX(Math.PI/2),flat(0xe8e2d2)); clock.add(face); const rim=new THREE.Mesh(new THREE.TorusGeometry(.27,.035,6,24),flat(0x2a2220)); clock.add(rim);
  for(let i=0;i<12;i++){ const tk=new THREE.Mesh(new THREE.BoxGeometry(.018,i%3?.04:.07,.01),flat(0x2a2220)); const a=i/12*6.283; tk.position.set(Math.sin(a)*.21,Math.cos(a)*.21,.03); tk.rotation.z=-a; clock.add(tk); }
  const hand=(len,w,c,z)=>{ const g=new THREE.Group(); g.position.z=z; const m=new THREE.Mesh(new THREE.BoxGeometry(w,len,.01),flat(c)); m.position.y=len/2-.02; g.add(m); clock.add(g); return g; };
  clock.userData={h:hand(.13,.025,0x1c1818,.035),m:hand(.19,.016,0x1c1818,.045),s:hand(.2,.006,0x9a2a2a,.055)}; }
const setClock=(hh,mm,sec)=>{ const c=clock.userData; c.h.rotation.z=-((hh%12)+mm/60)/12*6.283; c.m.rotation.z=-(mm+sec/60)/60*6.283; c.s.rotation.z=-Math.floor(sec)/60*6.283; };
// picture frames on right wall (family photos)
for(const [z,y,w,h] of [[-1.6,1.7,.5,.62],[-.6,1.85,.42,.42],[.6,1.65,.55,.42]]){ box(house,.04,h+.08,w+.08,flat(0x2a2220),HW-.03,y,z); box(house,.03,h,w,flat(0x8d8a80),HW-.05,y,z); }
// little hall table + vase
box(house,.45,.06,1,flat(0x3b2a20),HW-.25,.8,1.2); for(const z of [.75,1.65]) box(house,.05,.8,.05,flat(0x3b2a20),HW-.4,.4,z);
// outside the window: night sky + moon + tree silhouette
const sky=skyDome(house,0x0a1230,0x2a3a6a); for(let i=0;i<9;i++){ const p=pine(R,flat(0x070a14),flat(0x070a14),2.2+R()*1.4); p.position.set(-14-R()*10,-.5,-14+i*3.6+R()*2); p.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.material=glow(0x060914); } }); house.add(p); }
const moonDisc=new THREE.Mesh(new THREE.CircleGeometry(.55,24),glow(0xeef2ff)); moonDisc.position.set(-8.9,6.6,-1.5); moonDisc.rotation.y=Math.PI/2; house.add(moonDisc);
// light shaft through the window (fake volumetric) + dust motes
const dir=moon.target.position.clone().sub(moon.position).normalize();
{ const corners=[[WZ0,WY0],[WZ1,WY0],[WZ1,WY1],[WZ0,WY1]].map(([z,y])=>new THREE.Vector3(-HW,y,z)); const proj=p=>{ const s=p.y/-dir.y; return p.clone().addScaledVector(dir,s); };
  const v=[...corners,...corners.map(proj)], idx=[0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0], pos=[]; for(const i of idx) pos.push(v[i].x,v[i].y,v[i].z);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  const shaft=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x6f86d0,transparent:true,opacity:.022,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})); house.add(shaft); }
const motes=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.006,0),glow(0xdfe6ff,.5),70); house.add(motes); const md=[...Array(70)].map(()=>[R(),R(),R(),R()*6]);
const D=new THREE.Object3D(); const placeMotes=t=>{ md.forEach((q,i)=>{ const z=lg(WZ0,WZ1,q[0]), y=lg(WY0,WY1,q[1]), s=q[2]*2.2; D.position.set(-HW+dir.x*s+Math.sin(t*.4+q[3])*.05,y+dir.y*s+Math.sin(t*.3+q[3]*2)*.06,z+dir.z*s); D.updateMatrix(); motes.setMatrixAt(i,D.matrix); }); motes.instanceMatrix.needsUpdate=true; };
// the letter
const envM=flat(0xeee4cc); const letter=new THREE.Group(); house.add(letter); box(letter,.36,.012,.24,envM,0,.006,0);
for(let i=0;i<3;i++){ const ln=box(letter,.16-i*.03,.002,.008,flat(0x2a2a33),-.02,.013,.02+i*.03,false); }
// the one who leaves the letters: a faceless silhouette
const PS=.84; const ghost=person({shirt:0,pants:0}); ghost.traverse(o=>{ if(o.isMesh){ o.material=new THREE.MeshBasicMaterial({color:0x010204}); o.castShadow=true; o.receiveShadow=false; } }); ghost.scale.setScalar(PS); house.add(ghost);
// teaser: a trapdoor under the carpet, light in its seams
const hatch=new THREE.Group(); hatch.position.set(0,.002,.35); house.add(hatch); const hw=flat(0x4a3424);
for(let i=0;i<5;i++) box(hatch,.19,.03,1.0,hw,-.4+i*.2,0,0,false); for(const z of [-.38,.38]) box(hatch,1.0,.035,.08,flat(0x3a281c),0,.01,z,false);
const ring=new THREE.Mesh(new THREE.TorusGeometry(.06,.012,6,14),flat(0x8a7a5a)); ring.rotation.x=Math.PI/2; ring.position.set(.3,.03,0); hatch.add(ring);
const seamM=glow(0xbff5e6), seams=new THREE.Group(); hatch.add(seams); for(const [w,d,x,z] of [[1.04,.02,0,-.51],[1.04,.02,0,.51],[.02,1.04,-.51,0],[.02,1.04,.51,0],[.012,1,-.3,0],[.012,1,-.1,0],[.012,1,.1,0],[.012,1,.3,0]]) box(seams,w,.005,d,seamM,x,.014,z,false);
const hatchL=new THREE.PointLight(0xa8f0dc,0,3,1.5); hatchL.position.set(0,.12,.35); house.add(hatchL);

// ============ BEDROOM (night)
const bed=new THREE.Scene(); bed.background=C(0x04060c); bed.fog=new THREE.FogExp2(0x0a0f22,.06);
const bH=new THREE.HemisphereLight(0x51619a,0x1d1a22,1.1); bed.add(bH); const bFill=new THREE.PointLight(0x7088d0,3.5,7,1.3); bFill.position.set(1.4,2.5,-.6); bed.add(bFill);
const bMoon=new THREE.DirectionalLight(0xb4c6ff,5); bMoon.position.set(-8,3.3,.3); bMoon.target.position.set(1.1,.62,-1.3); bed.add(bMoon,bMoon.target); bMoon.castShadow=true; bMoon.shadow.mapSize.set(2048,2048); Object.assign(bMoon.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:1,far:25}); bMoon.shadow.bias=-.0004; bMoon.shadow.normalBias=.03;
const lampL=new THREE.PointLight(0xffb066,0,6,1.4); lampL.position.set(-.05,1.25,-2.0); lampL.castShadow=true; lampL.shadow.mapSize.set(1024,1024); lampL.shadow.bias=-.002; bed.add(lampL);
{ const W=2.2, Z0=-2.5, Z1=2.6, wm=flat(0x56607e), bw0=-1.2, bw1=.4, by0=.85, by1=2.15;
  for(let i=0;i<6;i++) box(bed,W*2/6-.02,.1,Z1-Z0,flat(i%2?0x6e5038:0x7a5a40),-W+W*2/6*(i+.5),-.05,(Z0+Z1)/2,false); box(bed,W*2+.4,.1,Z1-Z0+.4,flat(0x150e0a),0,-.12,(Z0+Z1)/2,false); box(bed,W*2,.1,Z1-Z0,flat(0x23252e),0,CE+.05,(Z0+Z1)/2);
  box(bed,W*2,CE,.2,wm,0,CE/2,Z0-.1); box(bed,.2,CE,Z1-Z0,wm,W+.1,CE/2,(Z0+Z1)/2);
  box(bed,.2,CE,bw0-Z0,wm,-W-.1,CE/2,(Z0+bw0)/2); box(bed,.2,CE,Z1-bw1,wm,-W-.1,CE/2,(bw1+Z1)/2); box(bed,.2,by0,bw1-bw0,wm,-W-.1,by0/2,(bw0+bw1)/2); box(bed,.2,CE-by1,bw1-bw0,wm,-W-.1,(CE+by1)/2,(bw0+bw1)/2);
  for(const y of [by0,by1,(by0+by1)/2]) box(bed,.14,.07,bw1-bw0,trim,-W-.05,y,(bw0+bw1)/2); for(const z of [bw0,bw1,(bw0+bw1)/2]) box(bed,.14,by1-by0,.07,trim,-W-.05,(by0+by1)/2,z);
  // bed against the back wall
  box(bed,1.7,.42,2.6,flat(0x4a3022),1.1,.21,-1.2); box(bed,1.6,.2,2.5,flat(0xd8d4cc),1.1,.52,-1.2); box(bed,1.7,1.1,.12,flat(0x4a3022),1.1,.55,-2.45); box(bed,.9,.14,.45,flat(0xe8e4dc),1.1,.69,-2.1);
  // nightstand + lamp
  box(bed,.6,.62,.5,flat(0x4a3022),-.05,.31,-2.15); const sh=new THREE.Mesh(new THREE.CylinderGeometry(.13,.2,.24,8),new THREE.MeshLambertMaterial({color:0xf0dcb8,emissive:0xffa050,emissiveIntensity:0,flatShading:true})); sh.position.set(-.05,1.1,-2.15); bed.add(sh); bed.userData.shade=sh; box(bed,.05,.38,.05,flat(0x2a2220),-.05,.81,-2.15); box(bed,.2,.04,.2,flat(0x2a2220),-.05,.64,-2.15);
  // desk, chair, poster, wall clock
  box(bed,1.3,.06,.6,flat(0x5a4030),-1.6,.78,1.4); for(const [x,z] of [[-2.15,1.15],[-1.05,1.15],[-2.15,1.65],[-1.05,1.65]]) box(bed,.05,.78,.05,flat(0x3a2a20),x,.39,z);
  box(bed,.04,.8,.6,flat(0x7a2f2f),W-.02,1.6,.6); box(bed,.04,.5,.4,flat(0x2f4f6a),W-.02,1.7,1.5); }
const bClock=new THREE.Group(); bed.add(bClock); { bClock.position.set(-1.0,2.2,-2.48); const f=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.04,20).rotateX(Math.PI/2),flat(0xe8e2d2)); bClock.add(f); bClock.add(new THREE.Mesh(new THREE.TorusGeometry(.21,.03,6,20),flat(0x2a2220)));
  const hand=(len,w,z)=>{ const g=new THREE.Group(); g.position.z=z; const m=new THREE.Mesh(new THREE.BoxGeometry(w,len,.01),flat(0x1c1818)); m.position.y=len/2-.02; g.add(m); bClock.add(g); return g; }; const h=hand(.1,.02,.03), m=hand(.15,.013,.04); h.rotation.z=-(3/60)/12*6.283; m.rotation.z=-3/60*6.283; }
// stack of unopened letters on the nightstand
const pile=[...Array(7)].map((_,i)=>{ const e=box(bed,.3,.012,.2,envM,-.05+(R()-.5)*.08,.625+i*.014,-1.98+(R()-.5)*.06,false); e.rotation.y=(R()-.5)*.9; return e; });
// the boy, 19
const boy=person({shirt:0x3d5a73,pants:0x2a2d36,hair:0x241812}); boy.scale.setScalar(PS); bed.add(boy); const blanket=box(bed,1.5,.18,1.8,flat(0x2f4a6e),1.1,.68,-.4);
const heldEnv=box(boy,.36,.24,.015,envM,0,1.28,.62,false);
// ---- insert rig: two hands, the envelope and the photograph
const ins=new THREE.Group(); ins.position.set(-1.0,1.15,-.2); ins.rotation.y=.5; bed.add(ins); const skin=flat(0xd9a27a), sleeve=flat(0x3d5a73);
const hands=[-1,1].map(s=>{ const g=new THREE.Group(); ins.add(g); box(g,.11,.2,.07,skin,0,0,0); box(g,.05,.08,.06,skin,s*-.07,.05,.02); box(g,.16,.32,.16,sleeve,0,-.24,-.03); return g; });
const env=new THREE.Group(); ins.add(env); box(env,.62,.8,.012,envM,0,0,0,false); const envFlap=new THREE.Group(); envFlap.position.set(0,.4,.007); env.add(envFlap);
{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([-.31,0,0, .31,0,0, 0,-.28,0],3)); g.computeVertexNormals(); const f=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xe6dabd,side:THREE.DoubleSide})); envFlap.add(f); }
const tex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };
const scrawl=(x,w,h,lines,color,size,seed)=>{ const r=rng(seed); x.strokeStyle=color; x.lineCap='round'; x.lineJoin='round'; lines.forEach(([y0,len])=>{ x.lineWidth=size*(.8+r()*.3); x.beginPath(); let px=w*.1; x.moveTo(px,y0*h); while(px<w*.1+len*w*.8){ const s=size*(1.4+r()*2.2); for(let k=0;k<3;k++){ px+=s*.35; x.lineTo(px,y0*h+(r()-.5)*size*3.2-(k%2)*size*1.5); } px+=r()<.25?size*2.5:0; x.moveTo(px,y0*h); } x.stroke(); }); };
// handwriting on the envelope front (readable text goes on in editing)
const envFront=new THREE.Mesh(new THREE.PlaneGeometry(.58,.76),new THREE.MeshLambertMaterial({transparent:true,map:tex(320,420,(x,w,h)=>scrawl(x,w,h,[[.5,.75]],'#1b1d2b',5,4))})); envFront.position.z=-.008; envFront.rotation.y=Math.PI; env.add(envFront);
const letterTop=new THREE.Mesh(new THREE.PlaneGeometry(.3,.2),new THREE.MeshLambertMaterial({transparent:true,map:tex(300,200,(x,w,h)=>scrawl(x,w,h,[[.5,.75]],'#1b1d2b',4,4))})); letterTop.rotation.x=-Math.PI/2; letterTop.position.y=.0135; letter.add(letterTop); for(const c of [...letter.children]) if(c!==letterTop&&c.geometry.parameters.height===.002) c.visible=false;

// ============ OUTSIDE (night; daytime for the photograph)
const out=new THREE.Scene(); out.fog=new THREE.FogExp2(0x0b1226,.035); const oSky=skyDome(out,0x070c1c,0x22305a);
const oH=new THREE.HemisphereLight(0x5a6aa8,0x1a1820,.8); out.add(oH); const oMoon=new THREE.DirectionalLight(0xb4c6ff,3); oMoon.position.set(-30,40,30); oMoon.target.position.set(0,0,0); out.add(oMoon,oMoon.target); oMoon.castShadow=true; oMoon.shadow.mapSize.set(2048,2048); Object.assign(oMoon.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:1,far:120}); oMoon.shadow.bias=-.0005; oMoon.shadow.normalBias=.04;
box(out,300,.1,300,flat(0x2e3a2a),0,-.05,0,false); box(out,9,.06,300,flat(0x34363e),0,.0,16,false); box(out,1.6,.07,8,flat(0x8a8478),0,.01,6.5,false);
const home=houseKit(0xb9b2a0,0x5a3a30); out.add(home); box(out,8.3,.45,6.3,flat(0x5d5a56),0,.2,0); // foundation
const vent=new THREE.Group(); vent.position.set(-2.2,.2,3.16); out.add(vent); box(vent,.7,.26,.04,flat(0x1a1a1c),0,0,0,false); const ventGlow=box(vent,.6,.18,.02,glow(0x9fe8d0),0,0,.02,false); for(let i=0;i<5;i++) box(vent,.03,.2,.03,flat(0x2a2a2c),-.24+i*.12,0,.04,false); const ventL=new THREE.PointLight(0xa8f0dc,0,4,1.6); ventL.position.set(-2.2,.25,3.6); out.add(ventL);
const winGlow=[]; for(const s of [-1,1]){ const g=box(out,1.1,1.0,.04,glow(s<0?0xffb060:0x1a2236),s*2.4,2.6,3.06,false); winGlow.push(g); } const winL=new THREE.PointLight(0xffa860,2.5,6,1.6); winL.position.set(-2.4,2.6,4.2); out.add(winL);
for(const x of [-7,7]){ const f=fence(6,0x8a8478); f.position.set(x,0,7); out.add(f); } const mb=mailbox(0x3a4a6a); mb.position.set(2.2,0,8.8); out.add(mb);
const sl=lamp(flat(0x23262c),glow(0xffd28a)); sl.position.set(5.5,0,10); out.add(sl); const slL=new THREE.PointLight(0xffc070,4,14,1.4); slL.position.set(5.5,7.6,10); out.add(slL);
for(let i=0;i<14;i++){ const p=pine(R,flat(0x1c2a22),flat(0x3a2a20),1.6+R()*1.4); const a=R()*Math.PI-Math.PI, r=12+R()*16; p.position.set(Math.cos(a)*r,0,Math.sin(a)*r-2); out.add(p); }
for(const [x,z] of [[-6.5,2],[6.8,-1]]){ const t=roundTree(R,[flat(0x2a4a30),flat(0x335a3a)],flat(0x4a3424),1.2); t.position.set(x,0,z); out.add(t); }
// father, for the photograph
const father=person({shirt:0x6a5a48,pants:0x33343c,hair:0x2a1c14}); father.scale.setScalar(PS); father.userData.beard.visible=true; out.add(father); father.position.set(1.1,0,5.2); father.rotation.y=-.15;
const paper=new THREE.Mesh(new THREE.BoxGeometry(.62,.42,.02),new THREE.MeshLambertMaterial({map:tex(256,174,(x,w,h)=>{ x.fillStyle='#ecebe4'; x.fillRect(0,0,w,h); x.fillStyle='#222'; x.fillRect(14,10,w-28,22); x.fillStyle='#555'; for(let r=0;r<6;r++) for(let c=0;c<3;c++) x.fillRect(14+c*78,44+r*20,66,8); x.fillStyle='#888'; x.fillRect(170,44,72,56); })}));
father.add(paper); paper.position.set(0,1.32,.5); paper.rotation.x=-.2; father.children[5].rotation.set(-1.05,0,.35); father.children[6].rotation.set(-1.05,0,-.35);
// render the photograph once in flat overcast daylight
const photoRT=new THREE.WebGLRenderTarget(560,700,{samples:4}); photoRT.texture.colorSpace=THREE.SRGBColorSpace; const pCam=new THREE.PerspectiveCamera(40,560/700,.1,400); pCam.position.set(.1,1.5,9.6); pCam.lookAt(.7,2.0,3);
{ out.fog=new THREE.Fog(0xc8c6be,18,70); oSky.top.value.set(0xb8bcc0); oSky.low.value.set(0xd6d2c8); oH.color.set(0xe8e8e4); oH.groundColor.set(0x6a6a5a); oH.intensity=1.7; oMoon.color.set(0xfff4e0); oMoon.intensity=1.0; for(const g of winGlow) g.material.color.set(0x5a6a78); winL.intensity=0; slL.intensity=0; ventGlow.visible=false;
  renderer.toneMapping=THREE.NoToneMapping; renderer.setRenderTarget(photoRT); renderer.render(out,pCam); renderer.setRenderTarget(null); renderer.toneMapping=THREE.ACESFilmicToneMapping;
  out.fog=new THREE.FogExp2(0x0b1226,.035); oSky.top.value.set(0x070c1c); oSky.low.value.set(0x22305a); oH.color.set(0x5a6aa8); oH.groundColor.set(0x1a1820); oH.intensity=.45; oMoon.color.set(0xb4c6ff); oMoon.intensity=1.8; winGlow[0].material.color.set(0xffb060); winGlow[1].material.color.set(0x1a2236); winL.intensity=2.5; slL.intensity=4; ventGlow.visible=true; father.visible=false; }
const toUV=v=>{ const p=v.clone().project(pCam); return [(p.x+1)/2,(p.y+1)/2]; }; const fatherUV=toUV(new THREE.Vector3(1.1,1.65,5.2)), paperUV=toUV(new THREE.Vector3(1.1,1.12,5.65));
// the photograph: aged print with a white border; handwriting on the back
const photo=new THREE.Group(); ins.add(photo); const PW=.5, PH=.625; box(photo,PW+.06,PH+.06,.006,flat(0xe9e2d0),0,0,0,false);
const pm=new THREE.ShaderMaterial({uniforms:{map:{value:photoRT.texture},lamp:{value:1}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D map;uniform float lamp;varying vec2 v;void main(){vec3 c=texture2D(map,v).rgb;float g=dot(c,vec3(.3,.59,.11));vec3 s=mix(vec3(g),vec3(g*1.08,g*.96,g*.78),.75);s=clamp((s-.45)*1.3+.45,0.,1.);s=mix(s,vec3(.62,.55,.42),.1);float vg=smoothstep(.85,.35,length(v-.5));s*=mix(.7,1.,vg);gl_FragColor=vec4(s*lamp,1.);\n#include <colorspace_fragment>\n}'});
const pimg=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),pm); pimg.position.z=.0035; photo.add(pimg);
const pback=new THREE.Mesh(new THREE.PlaneGeometry(PW+.06,PH+.06),new THREE.MeshLambertMaterial({map:tex(400,480,(x,w,h)=>{ x.fillStyle='#e6ddc8'; x.fillRect(0,0,w,h); x.globalAlpha=.08; x.fillStyle='#7a6a4a'; for(let i=0;i<40;i++) x.fillRect(Math.random()*w,Math.random()*h,30,30); x.globalAlpha=1; scrawl(x,w,h,[[.36,.8],[.47,.7],[.58,.5]],'#2a1414',4,11); })})); pback.position.z=-.0035; pback.rotation.y=Math.PI; photo.add(pback);

// ============ KITCHEN (cold grey morning)
const kit=new THREE.Scene(); kit.background=C(0xb8c2cc); kit.fog=new THREE.Fog(0xaab4be,8,30);
const kH=new THREE.HemisphereLight(0xc8d4e4,0x5a5650,1.6); kit.add(kH); const kD=new THREE.DirectionalLight(0xdfe8f4,2.6); kD.position.set(-2,5,-9); kD.target.position.set(0,0,0); kit.add(kD,kD.target); kD.castShadow=true; kD.shadow.mapSize.set(2048,2048); Object.assign(kD.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:1,far:25}); kD.shadow.bias=-.0004; kD.shadow.normalBias=.03;
{ const W=3, Z0=-2.6, Z1=3, km=flat(0x9aa69c);
  for(let i=0;i<8;i++) for(let j=0;j<8;j++) box(kit,W*2/8-.01,.1,(Z1-Z0)/8-.01,flat((i+j)%2?0xd8d8d2:0x6a6e74),-W+W*2/8*(i+.5),-.05,Z0+(Z1-Z0)/8*(j+.5),false); box(kit,W*2+.4,.1,Z1-Z0+.4,flat(0x222),0,-.12,(Z0+Z1)/2,false); box(kit,W*2,.1,Z1-Z0,flat(0xc8ccc8),0,CE+.05,(Z0+Z1)/2);
  const wx0=-.9, wx1=.9, wy0=1.25, wy1=2.3; box(kit,wx0+W,CE,.2,km,(-W+wx0)/2,CE/2,Z0-.1); box(kit,W-wx1,CE,.2,km,(wx1+W)/2,CE/2,Z0-.1); box(kit,wx1-wx0,wy0,.2,km,0,wy0/2,Z0-.1); box(kit,wx1-wx0,CE-wy1,.2,km,0,(CE+wy1)/2,Z0-.1);
  box(kit,wx1-wx0,wy1-wy0,.02,glow(0xe4eaf0),0,(wy0+wy1)/2,Z0-.22,false); for(const x of [wx0,0,wx1]) box(kit,.07,wy1-wy0,.12,flat(0xe8e8e4),x,(wy0+wy1)/2,Z0-.04);
  box(kit,.2,CE,Z1-Z0,km,-W-.1,CE/2,(Z0+Z1)/2);
  // right wall with the front door
  const dz0=.1, dz1=1.15; box(kit,.2,CE,dz0-Z0,km,W+.1,CE/2,(Z0+dz0)/2); box(kit,.2,CE,Z1-dz1,km,W+.1,CE/2,(dz1+Z1)/2); box(kit,.2,CE-2.2,dz1-dz0,km,W+.1,(CE+2.2)/2,(dz0+dz1)/2);
  box(kit,.08,2.18,1.03,flat(0x5a3a2a),W+.02,1.1,(dz0+dz1)/2); for(const [y,h] of [[1.55,.7],[.6,.75]]) box(kit,.02,h,.36,flat(0x4a2e22),W-.03,y,(dz0+dz1)/2+.2*((y>1)?1:1)*0-.2), box(kit,.02,h,.36,flat(0x4a2e22),W-.03,y,(dz0+dz1)/2+.2);
  // counter, cabinets, fridge, table, chairs
  box(kit,3.4,.9,.65,flat(0xe8e4dc),-1.1,.45,Z0+.35); box(kit,3.5,.06,.7,flat(0x4a4a4e),-1.1,.93,Z0+.35); box(kit,1.9,.75,.4,flat(0xe8e4dc),-2.0,2.1,Z0+.22);
  box(kit,.8,1.9,.7,flat(0xdadfe0),1.8,.95,Z0+.4); box(kit,.04,.5,.03,flat(0x8a8e92),1.48,1.3,Z0+.77);
  box(kit,1.4,.06,.9,flat(0x8a6446),-.6,.78,.9); for(const [x,z] of [[-1.2,.55],[0,.55],[-1.2,1.25],[0,1.25]]) box(kit,.06,.78,.06,flat(0x5a4030),x,.39,z);
  for(const [x,z,r] of [[-.6,.15,0],[-.6,1.7,Math.PI]]){ const c=new THREE.Group(); c.position.set(x,0,z); c.rotation.y=r; kit.add(c); box(c,.45,.05,.45,flat(0x6a4a34),0,.46,0); box(c,.45,.5,.05,flat(0x6a4a34),0,.72,-.2); }
  box(kit,.3,.25,.3,flat(0xc8c0b0),-1.6,1.08,Z0+.35); box(kit,.12,.1,.12,flat(0xe8e8e8),-.6,.86,.9); }
// deadbolt on the front door (inside)
const bolt=new THREE.Group(); bolt.position.set(2.95,1.15,.25); kit.add(bolt); box(bolt,.03,.2,.12,flat(0xb89a5a),0,0,0,false); const turn=new THREE.Group(); turn.position.x=-.03; bolt.add(turn); box(turn,.04,.14,.035,flat(0xc9a95a),0,0,0,false); box(kit,.03,.08,.08,flat(0xb89a5a),2.95,1.0,.25,false);
const mom=person({shirt:0x7a6a8a,pants:0x3a3640,hair:0x3a2418}); mom.scale.setScalar(PS); kit.add(mom); { const hm=mom.userData.hairM; box(mom,.42,.62,.12,hm,0,1.62,-.2); box(mom,.08,.5,.3,hm,-.2,1.7,-.05); box(mom,.08,.5,.3,hm,.2,1.7,-.05); }
const momSkin=mom.children[1].material; const kBoy=person({shirt:0x3d5a73,pants:0x2a2d36,hair:0x241812}); kBoy.scale.setScalar(PS); kit.add(kBoy);

// ============ post
const composer=new EffectComposer(renderer); const rp=new RenderPass(house,cam); composer.addPass(rp);
const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.55,.6,.82); composer.addPass(bloom); composer.addPass(new OutputPass());
const gcv=$('grain'), gx=gcv.getContext('2d'), gid=gx.createImageData(360,640);
const grain=t=>{ const r=rng(Math.floor(t*30)+7); for(let i=0;i<gid.data.length;i+=4){ const v=r()*255|0; gid.data[i]=gid.data[i+1]=gid.data[i+2]=v; gid.data[i+3]=255; } gx.putImageData(gid,0,0); };

// ============ shots
const SEG=TL.segments, SN=Object.fromEntries(SEG.map(s=>[s.name,s])), LT=(n,i)=>SN[n].lines[i].t, LE=(n,i)=>SN[n].lines[i].t+SN[n].lines[i].d;
window.SHOTS=SEG.map((s,i)=>[i?s.start:0,i<SEG.length-1?SEG[i+1].start:DUR]);
const E=(a,b,t)=>ss(a,b,t), V=new THREE.Vector3(), look=(x,y,z,tx,ty,tz)=>{ cam.position.set(x,y,z); cam.lookAt(tx,ty,tz); };
const flick=t=>1-.35*Math.max(0,Math.sin(t*37)*Math.sin(t*11.3)-.55)*2.2;
window.renderAt=t=>{ const k=Math.max(0,window.SHOTS.findLastIndex(s=>t>=s[0])), name=SEG[k].name, [a,b]=window.SHOTS[k], u=(t-a)/Math.max(b-a,1e-6);
  let scene=house, black=0; cam.fov=50; renderer.toneMappingExposure=1.05; bloom.strength=.55;
  placeMotes(t); setClock(0,3,(t+2)%60); ghost.visible=false; flap.rotation.x=0; hatchL.intensity=0; seamM.color.set(0x000000); letter.visible=true; letter.position.set(.12,0,-5.55); letter.rotation.y=.35;
  if(name==='hall'){ // 12:03 AM: a figure leaves the letter, and is gone
    letter.visible=u>.33; ghost.visible=u<.6; ghost.position.set(-.42,0,-5.45); ghost.rotation.y=Math.PI*.92; ghost.userData.pose(0,0); ghost.children[0].rotation.x=0;
    look(lg(1.15,.95,u),lg(1.25,.95,u),lg(1.6,-.6,u),lg(-.35,-.15,u),lg(.85,.5,u),-5.6); }
  else if(name==='envelope'){ // close on the envelope by the door
    const w=E(LT('envelope',4)-1.2,LT('envelope',4),t); const p=letter.position;
    const ox=lg(.9,.25,u), oy=lg(.32,.2,u), oz=lg(-4.3,-5.05,u); V.set(lg(ox,p.x+.02,w),lg(oy,.55,w),lg(oz,p.z+.06,w)); cam.position.copy(V); cam.lookAt(p.x,lg(.06,0,w),p.z); cam.fov=lg(45,38,w); }
  else if(name==='ignore'||name==='open'||name==='photo'||name==='back'||(name==='froze'&&t<LT('froze',1)-.1)){ scene=bed; drawBedroom(name,t,u); }
  else if(name==='froze'){ scene=out; const v=E(LT('froze',2)-.3,LE('froze',2)+.4,t), w=(t-LT('froze',1))/(b-LT('froze',1));
    ventL.intensity=.6+v*2.2+Math.sin(t*3)*.2; ventGlow.material.color.set(0x9fe8d0).multiplyScalar(.4+v*.8);
    look(lg(-1,-1.5,w)+lg(0,-1.2,v),lg(1.9,1.3,w)-v*.9,lg(22,15,w)-v*8.5,lg(0,-1.8,v),lg(2.2,1.2,w)-v*1,3); renderer.toneMappingExposure=.9; }
  else if(name==='kitchen'||name==='lock'){ scene=kit; drawKitchen(name,t,u); if(name==='lock'&&t>LE('lock',1)+.15) black=1; }
  else if(name==='teaser'){ // a door hidden beneath the carpet
    const f=E(LT('teaser',0)+1.2,LT('teaser',0)+3.2,t), g=E(LT('teaser',0)+2.4,LT('teaser',1)+1,t), p=E(LT('teaser',1)-.5,DUR,t);
    flap.rotation.x=-f*(Math.PI-.06); flap.position.y=.012+f*.03; letter.visible=false; seamM.color.set(0xbff5e6).multiplyScalar(g*(.85+.15*Math.sin(t*9))); hatchL.intensity=g*1.6;
    look(lg(.9,.35,p),lg(2.0,1.15,p),lg(2.4,1.4,p),0,lg(.2,0,p),lg(-.4,.3,p)); bloom.strength=.8; }
  cam.updateProjectionMatrix(); rp.scene=scene; composer.render(); grain(t);
  $('fade').style.opacity=Math.max(1-ss(0,.6,t),ss(DUR-.6,DUR,t),black); };

function drawBedroom(name,t,u){ const lampOn=name==='ignore'?0:name==='open'?E(SN.open.start,SN.open.start+.4,t):1; const fl=(name==='back'?flick(t*.6):1)*(name==='froze'?flick(t):1);
  lampL.intensity=lampOn*7*fl;  if(!(name==='ignore'||(name==='open'&&t<LT('open',1)-.1)||name==='froze')) lampL.intensity*=.3; bed.userData.shade.material.emissiveIntensity=lampOn*1.4*fl; pm.uniforms.lamp.value=.9*fl+.1;
  boy.visible=false; ins.visible=false; heldEnv.visible=false; pile.forEach((e,i)=>e.visible=name==='ignore'?i<1+Math.floor(u*7.5):i<6);
  for(const c of boy.children) c.rotation.set(0,0,0); boy.rotation.set(0,0,0);
  if(name==='ignore'){ // nights pass; the unopened letters pile up; he lies turned away
    boy.visible=true; boy.position.set(1.1,.76,-.75); boy.rotation.set(-Math.PI/2,0,0); boy.rotation.z=.25; blanket.position.set(1.1,.82,-1.0); blanket.scale.set(1,1,1);
    look(lg(1.5,1.4,u),lg(2.45,2.35,u),lg(.3,.0,u),.55,.7,-2.15); }
  else if(name==='open'&&t<LT('open',1)-.1){ // he sits up, lamp on, the envelope in his hands
    boy.visible=true; boy.position.set(1.1,-.07,-1.95); boy.userData.sit(); boy.children[5].rotation.set(-1.15,0,.32); boy.children[6].rotation.set(-1.15,0,-.32); heldEnv.visible=true; blanket.position.set(1.1,.72,-1.3); blanket.scale.set(1,1,.62);
    const w=(t-SN.open.start)/(LT('open',1)-SN.open.start); look(lg(.35,.5,w),lg(1.45,1.4,w),lg(1.1,.6,w),1.0,1.22,-1.9); }
  else { ins.visible=true; const flipT=name==='back'?E(SN.back.start,SN.back.start+.7,t):0;
    if(name==='open'){ // insert: the flap opens and the photograph slides out
      const o=E(LT('open',1)+.1,LT('open',1)+.8,t), s=E(LT('open',1)+.7,SN.photo.start,t); envFlap.rotation.x=-o*2.6; env.position.set(0,-s*.35,-.01); env.visible=true; photo.position.set(0,-.02+s*.42,0); photo.rotation.set(0,Math.PI,0); hands.forEach((h,i)=>{ h.position.set((i?1:-1)*.33,-.1-s*.35,.01); h.rotation.set(0,0,(i?-1:1)*.15); });
      ins.updateMatrixWorld(); V.set(0,.02,.0).applyMatrix4(ins.matrixWorld); const c=new THREE.Vector3(.0,.1,-1.35).applyMatrix4(ins.matrixWorld); look(c.x,c.y,c.z,V.x,V.y,V.z); cam.fov=40; }
    else { env.visible=false; photo.position.set(0,0,0); photo.rotation.set(0,Math.PI+flipT*Math.PI,lg(0,.03,flipT)); hands.forEach((h,i)=>{ h.position.set((i?1:-1)*(PW/2+.02),-.12,.0); h.rotation.set(0,0,(i?-1:1)*.1); });
      ins.updateMatrixWorld(); let fx=0, fy=0, d=.95;
      if(name==='photo'){ const z1=E(LT('photo',0)+.6,LT('photo',1),t), z2=E(LT('photo',2)+.4,LT('photo',2)+2.6,t); fx=lg(lg(0,(fatherUV[0]-.5)*PW,z1),(paperUV[0]-.5)*PW,z2); fy=lg(lg(0,(fatherUV[1]-.5)*PH,z1),(paperUV[1]-.5)*PH,z2); d=lg(lg(.95,.55,z1),.3,z2)-E(LT('photo',2)+2.6,SN.back.start,t)*.05; }
      else if(name==='back'){ const z=E(LT('back',1)-.6,LE('back',1),t); d=lg(.95,.62,z); fy=lg(0,.03,z); }
      else { d=.9; fy=0; } // froze: hold
      V.set(-fx,fy,0).applyMatrix4(ins.matrixWorld); const c=new THREE.Vector3(-fx,fy+.02,-d).applyMatrix4(ins.matrixWorld); look(c.x,c.y,c.z,V.x,V.y,V.z); cam.fov=40; }
    if(name==='froze'){ // he freezes: wide, lamp stuttering, photo in hand
      ins.visible=false; boy.visible=true; boy.position.set(1.1,-.07,-1.95); boy.userData.sit(); boy.children[5].rotation.set(-1.15,0,.32); boy.children[6].rotation.set(-1.15,0,-.32); heldEnv.visible=true; blanket.position.set(1.1,.72,-1.3); blanket.scale.set(1,1,.62);
      const w=(t-SN.froze.start)/1.6; look(lg(-1.6,-1.5,w),1.6,lg(1.6,1.4,w),1.0,1.1,-1.8); cam.fov=50; } } }

function drawKitchen(name,t,u){ momSkin.color.set(0xd9a27a); mom.userData.pose(0,0); for(const c of mom.children) if(c.isGroup) c.rotation.set(0,0,0); turn.rotation.x=0;
  kBoy.position.set(-2.35,0,1.3); kBoy.rotation.y=Math.PI*.9; kBoy.userData.pose(0,0); renderer.toneMappingExposure=.95; bloom.strength=.3;
  if(name==='kitchen'){ const turnU=E(LT('kitchen',0)+1.9,LT('kitchen',0)+3.0,t), pale=E(LT('kitchen',1),LE('kitchen',1)+.3,t);
    mom.position.set(-1.0,0,-1.75); mom.rotation.y=Math.PI+turnU*2.8; momSkin.color.set(0xd9a27a).lerp(C(0xeee8e6),pale);
    const p=E(LT('kitchen',1)-.3,SN.kitchen.end,t); look(lg(-1.55,-1.45,u)+p*.25,lg(1.7,1.62,u),lg(3.0,2.5,u)-p*1.7,-1.0,lg(1.3,1.5,p),-1.75); }
  else { // she crosses to the front door and locks it
    const w=E(SN.lock.start,LT('lock',1)+.1,t), x=lg(-.3,2.4,w), z=lg(-1.4,-.15,w); mom.position.set(x,0,z); mom.rotation.y=w<.98?Math.atan2(2.7,1.25):Math.PI/2; mom.userData.pose(t*7,w>0&&w<.98?.45:0); momSkin.color.set(0xeee8e6);
    const lk=E(LT('lock',1)+.75,LT('lock',1)+1.0,t); turn.rotation.x=lk*Math.PI/2;
    if(t<LT('lock',1)){ look(-1.9,1.6,2.6,lg(-.3,2.4,w),1.3,lg(-1,.2,w)); }
    else { mom.children[5].rotation.set(-1.3,0,.25); look(lg(2.0,2.2,(t-LT('lock',1))/2),1.4,lg(1.5,1.2,(t-LT('lock',1))/2),2.95,1.15,.22); cam.fov=40; } } }
window.renderAt(1); window.ready=true;
