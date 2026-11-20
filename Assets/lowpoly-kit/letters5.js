// The Boy Who Received Letters From a Dead Person — Reel 1: The First Letter
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, flat, shadow, ss, person, skyDome, pine, house as houseKit, fence, mailbox, lamp, roundTree } from './kit.js';

const $=id=>document.getElementById(id), R=rng(1203), C=h=>new THREE.Color(h), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const TL=await fetch('/letters5_timeline.json').then(r=>r.ok?r.json():null).catch(()=>null);
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
const father=person({shirt:0x6e7278,pants:0x33343c,hair:0x141010}); father.scale.setScalar(PS); father.userData.beard.visible=true; out.add(father); father.position.set(1.1,0,5.2); father.rotation.y=-.15;
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
const mom=person({shirt:0x6a2430,pants:0x3a3640,hair:0x3a2418}); mom.scale.setScalar(PS); kit.add(mom); { const hm=mom.userData.hairM; box(mom,.42,.62,.12,hm,0,1.62,-.2); box(mom,.08,.5,.3,hm,-.2,1.7,-.05); box(mom,.08,.5,.3,hm,.2,1.7,-.05); }
const momSkin=mom.children[1].material; const kBoy=person({shirt:0x3d5a73,pants:0x2a2d36,hair:0x241812}); kBoy.scale.setScalar(PS); kit.add(kBoy);

// ============ post
const composer=new EffectComposer(renderer); const rp=new RenderPass(house,cam); composer.addPass(rp);
const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.55,.6,.82); composer.addPass(bloom); composer.addPass(new OutputPass());
const gcv=$('grain'), gx=gcv.getContext('2d'), gid=gx.createImageData(360,640);
const grain=t=>{ const r=rng(Math.floor(t*30)+7); for(let i=0;i<gid.data.length;i+=4){ const v=r()*255|0; gid.data[i]=gid.data[i+1]=gid.data[i+2]=v; gid.data[i+3]=255; } gx.putImageData(gid,0,0); };


// ============ REEL 2 — photographs rendered from the sets
const setDay=on=>{ if(on){ out.fog=new THREE.Fog(0xc8c6be,18,70); oSky.top.value.set(0xb8bcc0); oSky.low.value.set(0xd6d2c8); oH.color.set(0xe8e8e4); oH.groundColor.set(0x6a6a5a); oH.intensity=1.7; oMoon.color.set(0xfff4e0); oMoon.intensity=1.0; for(const g of winGlow) g.material.color.set(0x5a6a78); winL.intensity=0; slL.intensity=0; ventGlow.visible=false; }
  else { out.fog=new THREE.FogExp2(0x0b1226,.035); oSky.top.value.set(0x070c1c); oSky.low.value.set(0x22305a); oH.color.set(0x5a6aa8); oH.groundColor.set(0x1a1820); oH.intensity=.45; oMoon.color.set(0xb4c6ff); oMoon.intensity=1.8; winGlow[0].material.color.set(0xffb060); winGlow[1].material.color.set(0x1a2236); winL.intensity=2.5; slL.intensity=4; ventGlow.visible=true; } };
const snap=(scene,c,w=420,h=520,tm=THREE.NoToneMapping)=>{ const rt=new THREE.WebGLRenderTarget(w,h,{samples:4}); rt.texture.colorSpace=THREE.SRGBColorSpace; renderer.toneMapping=tm; renderer.setRenderTarget(rt); renderer.render(scene,c); renderer.setRenderTarget(null); renderer.toneMapping=THREE.ACESFilmicToneMapping; return rt.texture; };
const pc=(x,y,z,tx,ty,tz,fov=38,a=420/520)=>{ const c=new THREE.PerspectiveCamera(fov,a,.05,400); c.position.set(x,y,z); c.lookAt(tx,ty,tz); return c; };
// the father's wristwatch: steel case, pale face, dark strap
const watch=(s=1)=>{ const g=new THREE.Group(), steel=new THREE.MeshStandardMaterial({color:0xc8ccd2,metalness:.85,roughness:.28,flatShading:true});
  const c=new THREE.Mesh(new THREE.CylinderGeometry(.11*s,.11*s,.035*s,16),steel); g.add(c); const f=new THREE.Mesh(new THREE.CylinderGeometry(.09*s,.09*s,.037*s,16),flat(0xe8e2cc)); g.add(f);
  for(const [len,a] of [[.06,.4],[.08,2.1]]){ const h=new THREE.Mesh(new THREE.BoxGeometry(.008*s,.004*s,len*s),flat(0x1a1a1a)); h.position.set(Math.sin(a)*len*s/2,.021*s,Math.cos(a)*len*s/2); h.rotation.y=a; g.add(h); }
  const crown=new THREE.Mesh(new THREE.BoxGeometry(.03*s,.02*s,.02*s),steel); crown.position.x=.12*s; g.add(crown);
  for(const sd of [-1,1]) for(let i=0;i<4;i++){ const l=new THREE.Mesh(new THREE.BoxGeometry(.09*s,.012*s,.06*s),new THREE.MeshStandardMaterial({color:0x3a2a20,roughness:.8,flatShading:true})); l.position.set(0,-i*.02*s,sd*(.13+i*.055)*s); l.rotation.x=sd*i*.25; g.add(l); }
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); return g; };
const fWatch=watch(.55); father.add(fWatch); fWatch.position.set(-.38,1.0,.08); fWatch.rotation.set(0,0,Math.PI/2);
const kid=person({shirt:0x9a3a32,pants:0x2e3440,hair:0x1c1410}); kid.scale.setScalar(.56); out.add(kid); kid.visible=false;
const baby=new THREE.Group(); box(baby,.42,.24,.26,flat(0xf0ece2),0,0,0); box(baby,.16,.16,.16,flat(0xe0aa86),-.24,.04,0); out.add(baby); baby.visible=false;
const fArms=(a,b)=>{ father.children[5].rotation.set(...a); father.children[6].rotation.set(...b); };
setDay(true); father.visible=true; paper.visible=false; const PH2=[];
// newborn in his arms
father.position.set(1.1,0,5.2); father.rotation.y=-.2; fArms([-1.0,0,.55],[-1.0,0,-.55]); baby.visible=true; baby.position.set(1.06,1.22,5.62); baby.rotation.y=-.2;
PH2.push(snap(out,pc(.4,1.55,8.2,1.1,1.45,5.2,30))); baby.visible=false;
// beside him at ten
fArms([0,0,0],[0,0,-.25]); father.position.set(.7,0,5.0); father.rotation.y=-.1; kid.visible=true; kid.position.set(1.55,0,5.15); kid.rotation.y=-.25;
PH2.push(snap(out,pc(.3,1.4,9.8,1.1,1.15,5,34))); kid.visible=false;
// decades of him alone: on the path, by the fence, by the tree, close portrait
for(const [fx,fz,ry,cx,cy,cz,tx,ty,tz,fov] of [[-1.4,6.4,.3,-1.2,1.5,10.5,-1.0,1.6,6,34],[-5.6,6.2,.5,-4.2,1.5,11,-5.4,1.4,6,30],[-5.8,3.2,.9,-4.0,1.6,7.8,-6.0,2.2,2.6,40],[1.1,5.2,0,1.0,1.7,6.9,1.1,1.62,5.2,22]]){
  father.position.set(fx,0,fz); father.rotation.y=ry; fArms([0,0,0],[0,0,0]); PH2.push(snap(out,pc(cx,cy,cz,tx,ty,tz,fov))); }
father.visible=false; setDay(false);

// ============ BASEMENT
const base=new THREE.Scene(); base.background=C(0x020304); base.fog=new THREE.FogExp2(0x0a0c12,.075);
const bAmb=new THREE.HemisphereLight(0x3a4458,0x16120e,1.0); base.add(bAmb); const bounce=new THREE.PointLight(0xd8dce8,0,4,1.5); base.add(bounce);
const BW=2.4, BZ0=-2.6, BZ1=2.4, BC=2.5, HX0=-1.85, HX1=-.85, HZ0=-2.6, HZ1=-1.25; // floor size, ceiling, hatch opening
const stone=flat(0x55504a), stone2=flat(0x4a4540), dustWood=flat(0x6a5644);
for(let i=0;i<8;i++) box(base,BW*2/8-.015,.1,BZ1-BZ0,flat(i%2?0x5e4c3c:0x665240),-BW+BW*2/8*(i+.5),-.05,(BZ0+BZ1)/2,false); box(base,BW*2+.4,.1,BZ1-BZ0+.4,flat(0x100c08),0,-.12,(BZ0+BZ1)/2,false);
// ceiling with the hatch opening above the stairs
box(base,BW-HX1,.12,BZ1-BZ0,flat(0x2a2420),(HX1+BW)/2,BC+.06,(BZ0+BZ1)/2); box(base,HX0+BW,.12,BZ1-BZ0,flat(0x2a2420),(-BW+HX0)/2,BC+.06,(BZ0+BZ1)/2); box(base,HX1-HX0,.12,BZ1-HZ1,flat(0x2a2420),(HX0+HX1)/2,BC+.06,(HZ1+BZ1)/2);
for(let i=0;i<6;i++) box(base,.14,.14,BZ1-BZ0,flat(0x3a2c22),-BW+.4+i*.85,BC-.07,(BZ0+BZ1)/2); // joists
// stone walls (block courses)
const wallRow=(x0,x1,z0,z1,face)=>{ for(let r=0;r<9;r++){ const y=.14+r*.28, off=r%2?.25:0; const L=face==='x'?z1-z0:x1-x0; for(let c=-1;c<L/.5+1;c++){ const a=Math.max(0,c*.5+off), b=Math.min(L,c*.5+off+.49); if(b<=a) continue; const m=(r*7+c*3)%5===0?stone2:stone;
  if(face==='x') box(base,.2,.26,b-a,m,x0,y,z0+(a+b)/2); else box(base,b-a,.26,.2,m,x0+(a+b)/2,y,z0); } } };
wallRow(-BW,BW,BZ0-.1,0,'z'); wallRow(BW+.1,0,BZ0,BZ1,'x'); wallRow(-BW-.1,0,BZ0,BZ1,'x'); wallRow(-BW,BW,BZ1+.1,0,'z');
// staircase down from the hatch
const stairs=new THREE.Group(); base.add(stairs); const NS=10; for(let i=0;i<NS;i++){ const y=BC-(i+1)*BC/NS, z=HZ0+.15+i*.33; box(stairs,HX1-HX0-.04,.06,.34,dustWood,(HX0+HX1)/2,y+.0,z); box(stairs,HX1-HX0-.04,BC/NS,.04,flat(0x3a2c22),(HX0+HX1)/2,y-BC/NS/2,z-.15); }
for(const x of [HX0+.02,HX1-.02]){ const s=box(stairs,.06,.2,3.6,flat(0x4a3a2c),x,BC/2-.1,(HZ0+.15+HZ0+.15+(NS-1)*.33)/2); s.rotation.x=Math.atan2(BC,(NS)*.33); }
const rail=box(stairs,.05,.05,3.4,flat(0x3a2c22),HX1+.02,BC/2+.75,HZ0+1.6); rail.rotation.x=Math.atan2(BC,NS*.33);
// up through the hatch: the hallway, dim moonlight
const hatchGlow=box(base,1.4,.02,1.8,glow(0x8496c8),(HX0+HX1)/2,BC+1.6,(HZ0+HZ1)/2,false); for(const [w,d,x,z] of [[.04,1.4,HX0-.02,(HZ0+HZ1)/2],[.04,1.4,HX1+.02,(HZ0+HZ1)/2],[1.0,.04,(HX0+HX1)/2,HZ1+.02]]) box(base,w,1.6,d,flat(0x5a6278),x,BC+.8,z,false);
const upL=new THREE.SpotLight(0x8aa0d8,6,9,.55,.6,1.2); upL.position.set((HX0+HX1)/2,BC+1.0,(HZ0+HZ1)/2); upL.target.position.set((HX0+HX1)/2+.3,0,.6); upL.castShadow=true; upL.shadow.mapSize.set(1024,1024); upL.shadow.bias=-.002; base.add(upL,upL.target);
// table, envelope, junk, cobwebs
box(base,1.3,.07,.8,flat(0x5a4636),.75,.8,-.35); for(const [x,z] of [[.18,-.67],[1.32,-.67],[.18,-.03],[1.32,-.03]]) box(base,.07,.8,.07,flat(0x4a382a),x,.4,z);
const env2=new THREE.Group(); env2.position.set(.7,.84,-.3); env2.rotation.y=-.3; base.add(env2); box(env2,.36,.012,.25,envM,0,0,0,false); const env2Top=new THREE.Mesh(new THREE.PlaneGeometry(.3,.2),new THREE.MeshLambertMaterial({transparent:true,map:tex(300,200,(x,w,h)=>scrawl(x,w,h,[[.5,.55]],'#1b1d2b',5,21))})); env2Top.rotation.x=-Math.PI/2; env2Top.position.y=.0065; env2.add(env2Top);
for(const [x,y,z,w,h,d,c] of [[1.9,.3,1.6,.6,.6,.6,0x5a4a38],[1.95,.8,1.7,.45,.4,.45,0x6a5642],[-1.9,.25,1.8,.7,.5,.5,0x4e4034],[1.95,.2,-2.2,.5,.4,.5,0x5a4a38]]) box(base,w,h,d,flat(c),x,y,z);
const webM=new THREE.MeshBasicMaterial({color:0x8a8e98,transparent:true,opacity:.18,side:THREE.DoubleSide,fog:true}); for(const [x,z,ry] of [[BW-.05,BZ0+.05,Math.PI*.75],[BW-.05,BZ1-.05,Math.PI*1.25],[-BW+.05,BZ1-.05,-Math.PI*1.25]]){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0, .7,0,0, 0,-.7,0],3)); const w=new THREE.Mesh(g,webM); w.position.set(x,BC-.02,z); w.rotation.y=ry; base.add(w); }
// photographs on the walls: lit by the flashlight, aged per print
const photoLit=(tx,age)=>{ const m=new THREE.MeshLambertMaterial({map:tx}); m.onBeforeCompile=sh=>{ sh.uniforms.uAge={value:age}; sh.fragmentShader='uniform float uAge;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat gq=dot(diffuseColor.rgb,vec3(.3,.59,.11)); vec3 sp=vec3(gq*1.1,gq*.95,gq*.74); diffuseColor.rgb=mix(diffuseColor.rgb,sp,uAge); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.6,.52,.4),uAge*.18);'); }; m.customProgramCacheKey=()=>'age'+age.toFixed(2); return m; };
const wallPhoto=(tx,age,w,x,y,z,ry,rz)=>{ const h=w*520/420, g=new THREE.Group(); g.position.set(x,y,z); g.rotation.set(0,ry,rz); base.add(g); box(g,w+.04,h+.04,.006,flat(0xb4ab96),0,0,0,false); const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),photoLit(tx,age)); p.position.z=.004; g.add(p);
  const pin=new THREE.Mesh(new THREE.SphereGeometry(.012,6,4),flat(0x8a2a2a)); pin.position.set(0,h/2-.02,.01); g.add(pin); return g; };
const WP=[]; { const r=rng(77); // back wall (right of the stairs) and right wall, covered
  for(let i=0;i<34;i++){ const right=i>=14, w=.24+r()*.14; let x,z,ry; if(!right){ x=-.55+((i%7)+r()*.3)*.42; z=BZ0+.005; ry=0; } else { const j=i-14; x=BW-.005; z=BZ0+.35+((j%10)+r()*.3)*.44; ry=-Math.PI/2; }
    const y=.75+Math.floor((right?i-14:i)/(right?10:7))*.42+r()*.12; const ti=2+Math.floor(r()*4); WP.push(wallPhoto(PH2[ti],.35+r()*.65,w,x,y,z,ry,(r()-.5)*.25)); } }
// the three photographs he notices
const WN=wallPhoto(PH2[0],.85,.3,BW-.04,1.45,-.15,-Math.PI/2,.03), WT=wallPhoto(PH2[1],.45,.3,BW-.04,1.4,.55,-Math.PI/2,-.04);
// dust
const bdust=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.006,0),glow(0xe8e4dc,.55),260); base.add(bdust); const bdd=[...Array(260)].map(()=>[R()*4.6-2.3,R()*2.4,R()*4.8-2.5,R()*6]);
const placeBDust=t=>{ bdd.forEach((q,i)=>{ D.position.set(q[0]+Math.sin(t*.2+q[3])*.08,(q[1]+t*.02*(i%3-1)+2.4)%2.4,q[2]+Math.cos(t*.17+q[3])*.08); D.updateMatrix(); bdust.setMatrixAt(i,D.matrix); }); bdust.instanceMatrix.needsUpdate=true; };
// the boy with his phone flashlight
const bBoy=person({shirt:0x3d5a73,pants:0x2a2d36,hair:0x141010}); bBoy.scale.setScalar(PS); base.add(bBoy); const phone=box(bBoy,.09,.16,.02,flat(0x15161a),.38,.95,.62,false); const phoneLED=box(bBoy,.02,.02,.01,glow(0xffffff),.4,1.0,.64,false);
const flash=new THREE.SpotLight(0xeef2ff,11,12,.45,.6,1.3); flash.castShadow=true; flash.shadow.mapSize.set(1024,1024); flash.shadow.bias=-.001; flash.shadow.camera.near=.1; base.add(flash,flash.target);
const beam=new THREE.Mesh(new THREE.ConeGeometry(1,1,20,1,true).translate(0,-.5,0).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xcfd8ff,transparent:true,opacity:.028,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})); base.add(beam);
const rim=new THREE.PointLight(0x7f9ae0,2.5,5,1.4); base.add(rim);
const aimFlash=(tx,ty,tz,b=1.6)=>{ bBoy.updateMatrixWorld(); phoneLED.getWorldPosition(flash.position); flash.target.position.set(tx,ty,tz); bounce.position.copy(flash.position).lerp(flash.target.position,.8); bounce.intensity=b; const L=flash.position.distanceTo(flash.target.position); beam.position.copy(flash.position); beam.lookAt(flash.target.position); beam.scale.set(L*Math.tan(.42),L*Math.tan(.42),L); beam.visible=true; };
// render the "boy in this basement" photograph (taken three days ago)
bBoy.position.set(.2,0,.9); bBoy.rotation.y=Math.PI*.85; bBoy.children[6].rotation.set(-1.2,0,-.2); aimFlash(-.3,1.2,-2.4); bBoy.userData.face({});
const PBASE=snap(base,pc(1.9,1.4,-1.6,.2,1.0,.9,46),420,520,THREE.ACESFilmicToneMapping); const WB=wallPhoto(PBASE,.25,.3,BW-.04,1.42,1.3,-Math.PI/2,.02);



// ============ HOSPITAL (rendered once, for the photograph in the envelope)
const hosp=new THREE.Scene(); hosp.background=C(0xd6dcdc); hosp.add(new THREE.HemisphereLight(0xf0f4f4,0x8a8e8a,2.0)); { const d=new THREE.DirectionalLight(0xfff8ec,1.6); d.position.set(-4,6,3); d.castShadow=true; d.shadow.mapSize.set(1024,1024); Object.assign(d.shadow.camera,{left:-5,right:5,top:5,bottom:-5}); hosp.add(d); }
box(hosp,8,.1,8,flat(0xb8bcb8),0,-.05,0,false); box(hosp,8,3,.1,flat(0xc4d4cc),0,1.5,-2.2); box(hosp,.1,3,8,flat(0xbccbc4),-3,1.5,0); box(hosp,1.4,1.1,.04,glow(0xf4f8f8),-1.6,1.8,-2.14,false);
box(hosp,1.0,.08,2.2,flat(0xe4e6e6),0,.62,-.6); box(hosp,1.0,.16,2.1,flat(0xf2f4f4),0,.74,-.6); box(hosp,.9,.12,1.5,flat(0xa8c4d4),0,.86,-.35); box(hosp,.6,.12,.35,flat(0xffffff),0,.88,-1.45);
for(const [x,z] of [[-.48,.45],[.48,.45],[-.48,-1.65],[.48,-1.65]]) box(hosp,.05,.62,.05,flat(0x9aa0a4),x,.31,z); for(const s of [-1,1]) box(hosp,.04,.25,1.2,flat(0x9aa0a4),s*.52,.95,-.5); box(hosp,1.0,.7,.06,flat(0xd8dcdc),0,.95,-1.7);
box(hosp,.04,1.9,.04,flat(0x9aa0a4),.85,.95,-1.4); box(hosp,.16,.24,.06,flat(0xd8ecf0),.85,1.75,-1.4); box(hosp,.5,.4,.3,flat(0x3a3e44),-.9,1.3,-1.8); box(hosp,.42,.3,.02,glow(0x3ad87a),-.9,1.3,-1.64,false); box(hosp,.4,.9,.4,flat(0xd0d4d4),-.9,.45,-1.8);
const hBoy=person({shirt:0xa8c4d4,pants:0x2a2d36,hair:0x141010}); hBoy.scale.setScalar(PS); hBoy.rotation.set(-Math.PI/2,0,0); hBoy.position.set(0,.93,.05); hosp.add(hBoy); hBoy.userData.face({blink:1});
const hMom=person({shirt:0x6a2430,pants:0x3a3640,hair:0x3a2418}); hMom.scale.setScalar(PS); { const hm=hMom.userData.hairM; box(hMom,.42,.62,.12,hm,0,1.62,-.2); box(hMom,.08,.5,.3,hm,-.2,1.7,-.05); box(hMom,.08,.5,.3,hm,.2,1.7,-.05); } hMom.position.set(.95,0,-.5); hMom.rotation.y=-Math.PI*.42; hMom.userData.face({brow:1,lookX:-1,lookY:-.6}); hosp.add(hMom);
const hCam=pc(-.3,1.75,2.6,.25,.95,-.7,44); const HOSP=snap(hosp,hCam); const hUV=v=>{ const p=v.clone().project(hCam); return [(p.x+1)/2,(p.y+1)/2]; };
const momUV=hUV(new THREE.Vector3(.95,1.55,-.5)), bedUV=hUV(new THREE.Vector3(0,.95,-1.2));

// ============ HALLWAY additions: the mother and the boy in daylight, the opening hatch, mist
const hhBoy=person({shirt:0x3d5a73,pants:0x2a2d36,hair:0x141010}); hhBoy.scale.setScalar(PS); house.add(hhBoy);
const hhMom=person({shirt:0x6a2430,pants:0x3a3640,hair:0x3a2418}); hhMom.scale.setScalar(PS); { const hm=hhMom.userData.hairM; box(hhMom,.42,.62,.12,hm,0,1.62,-.2); box(hhMom,.08,.5,.3,hm,-.2,1.7,-.05); box(hhMom,.08,.5,.3,hm,.2,1.7,-.05); } house.add(hhMom);
const hPivot=new THREE.Group(); hPivot.position.set(-.52,.002,.35); house.add(hPivot); house.remove(hatch); hPivot.add(hatch); hatch.position.set(.52,0,0);
const hole=box(house,1.02,.003,1.02,new THREE.MeshBasicMaterial({color:0x000000}),0,.001,.35,false); hole.receiveShadow=false;
const handIns=new THREE.Group(); house.add(handIns); box(handIns,.11,.07,.18,flat(0xd9a27a),0,0,0); box(handIns,.16,.16,.34,flat(0x3d5a73),0,.02,.24);
const mistTex=tex(128,128,(x,w,h)=>{ const g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(255,255,255,.55)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,w,h); });
const mistSet=(scene,n,x,y,z,spread)=>{ const a=[...Array(n)].map((_,i)=>{ const m=new THREE.Sprite(new THREE.SpriteMaterial({map:mistTex,color:0xb8c8e0,transparent:true,opacity:0,depthWrite:false,fog:false})); scene.add(m); return [m,R(),R(),R()]; });
  return (t,amt)=>a.forEach(([m,p,q,r])=>{ const ph=(t*.25+p)%1; m.position.set(x+(q-.5)*spread+Math.sin(t+r*6)*.1,y+ph*1.6,z+(r-.5)*spread); m.scale.setScalar(.5+ph*1.2); m.material.opacity=amt*.1*Math.sin(ph*Math.PI); m.visible=amt>0; }); };
const mistHall=mistSet(house,14,0,0,.35,.8), mistBase=mistSet(base,10,(HX0+HX1)/2,1.2,(HZ0+HZ1)/2+.4,.8);
const hallDay=on=>{ if(on){ house.background.set(0x8a929c); house.fog.color.set(0x8a929c); house.fog.density=.03; hemi.intensity=2.4; hemi.color.set(0xe8ecf0); hemi.groundColor.set(0x6a6058); moon.color.set(0xfff4e4); moon.intensity=3; fill.intensity=1; roomGlow.intensity=0; gap.material.color.set(0x2a2018); motes.visible=true; }
  else { house.background.set(0x05070f); house.fog.color.set(0x0a1024); house.fog.density=.075; hemi.intensity=.9; hemi.color.set(0x5a6fb0); hemi.groundColor.set(0x2a2228); moon.color.set(0xb4c6ff); moon.intensity=8; fill.intensity=5; roomGlow.intensity=.9; gap.material.color.set(0xffa65a); } };

// ============ BASEMENT additions: the envelope insert, the figure, the falling watch
const ins2=new THREE.Group(); ins2.position.set(.55,1.25,.45); ins2.rotation.y=Math.PI*.15; base.add(ins2);
const hands2=[-1,1].map(s=>{ const g=new THREE.Group(); ins2.add(g); box(g,.11,.2,.07,flat(0xd9a27a),0,0,0); box(g,.05,.08,.06,flat(0xd9a27a),s*-.07,.05,.02); box(g,.16,.32,.16,flat(0x3d5a73),0,-.24,-.03); return g; });
const envB=new THREE.Group(); ins2.add(envB); box(envB,.62,.8,.012,envM,0,0,0,false); const envBF=new THREE.Group(); envBF.position.set(0,.4,.007); envB.add(envBF);
{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([-.31,0,0, .31,0,0, 0,-.28,0],3)); g.computeVertexNormals(); envBF.add(new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xe6dabd,side:THREE.DoubleSide}))); }
const envBFront=new THREE.Mesh(new THREE.PlaneGeometry(.58,.76),new THREE.MeshLambertMaterial({transparent:true,map:tex(320,420,(x,w,h)=>scrawl(x,w,h,[[.5,.6]],'#1b1d2b',6,21))})); envBFront.position.z=-.008; envBFront.rotation.y=Math.PI; envB.add(envBFront);
const hPhoto=new THREE.Group(); ins2.add(hPhoto); box(hPhoto,PW+.06,PH+.06,.006,flat(0xe9e2d0),0,0,0,false); { const p=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),photoLit(HOSP,.12)); p.position.z=.0035; hPhoto.add(p);
  const ds=new THREE.Mesh(new THREE.PlaneGeometry(.16,.035),new THREE.MeshBasicMaterial({transparent:true,map:tex(256,56,(x,w,h)=>{ x.fillStyle='#ff8a2a'; x.shadowColor='#ff6a00'; x.shadowBlur=8; const r=rng(5); for(let i=0;i<8;i++){ if(i===2||i===5) { x.fillRect(16+i*28,30,6,6); continue; } x.fillRect(12+i*28,8,16,5); x.fillRect(12+i*28,26,16,5); x.fillRect(12+i*28,44,16,5); if(r()<.6) x.fillRect(12+i*28,8,5,40); if(r()<.6) x.fillRect(23+i*28,8,5,40); } }),fog:false})); ds.position.set(PW/2-.1,-PH/2+.04,.004); hPhoto.add(ds); }
const ghost2=person({shirt:0,pants:0}); ghost2.traverse(o=>{ if(o.isMesh){ o.material=new THREE.MeshBasicMaterial({color:0x010204}); o.castShadow=true; } }); ghost2.scale.setScalar(.8); const backL=new THREE.PointLight(0x8ea2e0,0,4,1.3); base.add(backL); base.add(ghost2); ghost2.visible=false;
const shadowL=new THREE.SpotLight(0xa8b8e8,0,10,.7,.4,1); shadowL.castShadow=true; shadowL.shadow.mapSize.set(1024,1024); shadowL.shadow.bias=-.001; base.add(shadowL,shadowL.target); shadowL.position.set(-1.3,3.4,-2.4); shadowL.target.position.set(-.6,1.0,1.2);
const dropW=watch(1.0); base.add(dropW); dropW.visible=false;
// watch path down the steps: [t, x,y,z, spin]
const stepTop=i=>[(HX0+HX1)/2, BC-(i+1)*BC/NS+.03, HZ0+.15+i*.33];
const WPATH=[[0,-1.3,1.05,-.05],[.3,-1.28,stepTop(8)[1]+.02,stepTop(8)[2]+.05],[.46,-1.22,stepTop(8)[1]+.16,stepTop(8)[2]+.3],[.62,-1.15,.03,.75],[.74,-1.1,.09,.9],[.86,-1.06,.03,1.0],[2,-1.06,.03,1.0]];
const placeWatch=dt=>{ let i=WPATH.findLastIndex(p=>dt>=p[0]); i=Math.min(Math.max(i,0),WPATH.length-2); const [a,b]=[WPATH[i],WPATH[i+1]], u=Math.min(1,Math.max(0,(dt-a[0])/(b[0]-a[0]))); dropW.position.set(lg(a[1],b[1],u),lg(a[2],b[2],u),lg(a[3],b[3],u)); const spin=Math.min(dt,.87)*14; dropW.rotation.set(spin*.7,spin,dt>.87?0:spin*.4); if(dt>=.87){ dropW.rotation.set(0,.6,0); } };

// a lifted corner of the carpet, the handle showing beneath
const corner=new THREE.Group(); corner.position.set(.475,.036,.62); house.add(corner); { const tri=(c,y)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0, -.55,0,0, 0,0,-.55],3)); g.computeVertexNormals(); const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide})); m.position.y=y; return m; };
  corner.add(tri(0x050404,0)); const hinge=new THREE.Group(); hinge.position.set(-.275,0,-.275); hinge.rotation.y=Math.PI/4; corner.add(hinge); const fl=tri(0x6e3a36,.002); fl.position.set(.275,0,.275); const fg=new THREE.Group(); hinge.add(fg); fg.rotation.y=-Math.PI/4; fg.add(fl); corner.userData.lift=v=>{ hinge.rotation.set(0,Math.PI/4,0); hinge.rotateX(-v*1.25); };
  const r2=new THREE.Mesh(new THREE.TorusGeometry(.055,.012,6,14),new THREE.MeshStandardMaterial({color:0x9a9284,metalness:.7,roughness:.4})); r2.rotation.x=Math.PI/2; r2.position.set(-.13,.004,-.13); corner.add(r2); }
corner.visible=false;

// ============ REEL 3 — the man in the basement
const bFather=person({shirt:0x6e7278,pants:0x33343c,hair:0x141010}); bFather.scale.setScalar(PS); bFather.userData.beard.visible=true; base.add(bFather);
const bfWatch=watch(.5); bFather.children[5].add(bfWatch); bfWatch.position.set(0,-.56,.075); bfWatch.rotation.set(Math.PI/2,0,0);
const secHand=new THREE.Mesh(new THREE.BoxGeometry(.004,.003,.085),flat(0xb02020)); secHand.geometry.translate(0,0,.04); const secG=new THREE.Group(); secG.position.y=.012; secG.add(secHand); bfWatch.add(secG);
const reveal=new THREE.SpotLight(0xfff2dc,0,6,.42,.35,1.0); reveal.position.set(-.7,2.45,1.35); reveal.target.position.set(-.7,0,.6); reveal.castShadow=true; reveal.shadow.mapSize.set(1024,1024); reveal.shadow.bias=-.001; base.add(reveal,reveal.target);
const behindL=new THREE.SpotLight(0xa8b8e8,0,9,.6,.5,1.1); behindL.position.set(-1.35,2.45,-2.3); behindL.castShadow=true; behindL.shadow.mapSize.set(1024,1024); base.add(behindL,behindL.target);
// the dropped photograph (hospital, from Reel 2)
const dropP=new THREE.Group(); base.add(dropP); box(dropP,PW*.5+.03,.004,PH*.5+.03,flat(0xe9e2d0),0,0,0,false); { const p=new THREE.Mesh(new THREE.PlaneGeometry(PW*.5,PH*.5),photoLit(HOSP,.12)); p.rotation.x=-Math.PI/2; p.position.y=.003; dropP.add(p); }
// "empty" prints: the same photographs with the people gone (the boy stays)
setDay(true); father.visible=false; baby.visible=false; kid.visible=false; const PH2E=[];
PH2E.push(snap(out,pc(.4,1.55,8.2,1.1,1.45,5.2,30))); kid.visible=true; kid.position.set(1.55,0,5.15); kid.rotation.y=-.25; PH2E.push(snap(out,pc(.3,1.4,9.8,1.1,1.15,5,34))); kid.visible=false;
for(const [cx,cy,cz,tx,ty,tz,fov] of [[-1.2,1.5,10.5,-1.0,1.6,6,34],[-4.2,1.5,11,-5.4,1.4,6,30],[-4.0,1.6,7.8,-6.0,2.2,2.6,40],[1.0,1.7,6.9,1.1,1.62,5.2,22]]) PH2E.push(snap(out,pc(cx,cy,cz,tx,ty,tz,fov)));
setDay(false);
const WP0=wallPhoto(PH2[5],.7,.36,BW-.04,1.85,-1.0,-Math.PI/2,.02);
const overlays=[]; { const r=rng(31); for(const g of [...WP,WN,WT,WP0]){ const pm2=g.children[1], i=PH2.indexOf(pm2.material.map); if(i<0) continue; const m=photoLit(PH2E[i],.6); m.transparent=true; m.opacity=0; const o=new THREE.Mesh(pm2.geometry,m); o.position.z=.0045; g.add(o); overlays.push([o,r()*.8]); } }
const setVanish=v=>overlays.forEach(([o,d])=>{ o.material.opacity=ss(d,d+.18,v); });
// the photograph on the table that burns until only the boy remains
const burnM=new THREE.ShaderMaterial({uniforms:{map:{value:PH2[1]},burn:{value:0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform sampler2D map;uniform float burn;varying vec2 v;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){ float e=(v.x+n(v*8.)*.12+n(v*23.)*.04)-burn*.62; if(e<0.) discard;
 vec2 q=(v-.05)/.9; vec3 c=vec3(.86,.82,.72); if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.){ c=texture2D(map,q).rgb; float g=dot(c,vec3(.3,.59,.11)); c=mix(c,vec3(g*1.1,g*.95,g*.74),.5); }
 c*=.62; c=mix(vec3(.04,.025,.015),c,smoothstep(0.,.07,e)); c+=vec3(3.,1.1,.25)*(1.-smoothstep(0.,.022,e))*step(.001,burn); gl_FragColor=vec4(c,1.);
#include <colorspace_fragment>
}`});
const burnP=new THREE.Mesh(new THREE.PlaneGeometry(.42,.52),burnM); burnP.rotation.set(-Math.PI/2,0,.25); burnP.position.set(1.05,.837,-.5); base.add(burnP);
const burnL=new THREE.PointLight(0xff8a30,0,1.5,1.6); burnL.position.set(1.0,.95,-.5); base.add(burnL);
const embers=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.006,0),glow(0xffa040),40); base.add(embers); const emb=[...Array(40)].map(()=>[R(),R(),R()]);
const placeEmbers=(t,on)=>{ embers.visible=on>0; emb.forEach((q,i)=>{ const ph=(t*.5+q[0])%1; D.position.set(1.0-.12+q[1]*.15+Math.sin(t*3+i)*.02,.84+ph*.5,-.5+(q[2]-.5)*.3); D.scale.setScalar(on*(1-ph)); D.updateMatrix(); embers.setMatrixAt(i,D.matrix); }); embers.instanceMatrix.needsUpdate=true; D.scale.setScalar(1); };
// the old wooden box and the letters that rise out of it
const lbox=new THREE.Group(); lbox.position.set(1.45,0,1.35); lbox.rotation.y=-.5; base.add(lbox); const bw=flat(0x5a3e2a);
box(lbox,.8,.04,.5,bw,0,.02,0); for(const [w,d,x,z] of [[.8,.04,0,-.23],[.8,.04,0,.23],[.04,.5,-.38,0],[.04,.5,.38,0]]) box(lbox,w,.42,d,bw,x,.23,z); for(const x of [-.25,.25]) box(lbox,.06,.43,.52,flat(0x2a2420),x,.23,0);
const lid=new THREE.Group(); lid.position.set(0,.44,-.25); lbox.add(lid); box(lid,.84,.05,.54,flat(0x6a4a32),0,.025,.27); box(lid,.12,.06,.06,flat(0x8a7a5a),0,.03,.53);
const boxGlow=box(lbox,.7,.02,.4,glow(0xb08848),0,.38,0,false); const boxL=new THREE.PointLight(0xffd28a,0,4,1.4); boxL.position.set(1.45,.7,1.35); base.add(boxL);
const NL=220, lettersI=new THREE.InstancedMesh(new THREE.BoxGeometry(.16,.004,.11),new THREE.MeshLambertMaterial({color:0xf2e8cc,emissive:0xffd890,emissiveIntensity:.3}),NL); base.add(lettersI); const ld=[...Array(NL)].map(()=>[R(),R(),R(),R()]);
const placeLetters=(t,v)=>{ lettersI.visible=v>0; ld.forEach((q,i)=>{ const d=Math.max(0,Math.min(1,v*1.6-q[0]*.6)), a=q[1]*6.283+t*(.25+q[2]*.3), r=lg(.05,.6+q[3]*1.3,d), y=lg(.4,.9+q[2]*1.4+Math.sin(t+i)*.08,d);
  D.position.set(1.45+Math.cos(a)*r,y,1.35+Math.sin(a)*r*.9-lg(0,.6,d)); D.rotation.set(Math.sin(t*.7+i)*.6,a,Math.cos(t*.5+i)*.4); D.scale.setScalar(d>0?1:0); D.updateMatrix(); lettersI.setMatrixAt(i,D.matrix); }); lettersI.instanceMatrix.needsUpdate=true; D.rotation.set(0,0,0); D.scale.setScalar(1); };
const hero=new THREE.Group(); base.add(hero); box(hero,.36,.24,.006,new THREE.MeshLambertMaterial({color:0xf2e8cc,emissive:0xffd890,emissiveIntensity:.35}),0,0,0,false);
{ const p=new THREE.Mesh(new THREE.PlaneGeometry(.32,.2),new THREE.MeshBasicMaterial({transparent:true,map:tex(320,200,(x,w,h)=>scrawl(x,w,h,[[.42,.8],[.62,.5]],'#2a1414',5,33)),fog:false})); p.position.z=.0035; hero.add(p); }
// the mirror on the left wall; it shows a hospital room
const mirror=new THREE.Group(); mirror.position.set(-BW+.06,0,1.35); mirror.rotation.y=Math.PI/2; base.add(mirror); box(mirror,1.2,2.1,.08,flat(0x3a2a1e),0,1.15,0); box(mirror,1.3,.1,.12,flat(0x4a3626),0,2.2,0);
const mirRT=new THREE.WebGLRenderTarget(540,960,{samples:4}); mirRT.texture.colorSpace=THREE.SRGBColorSpace; const mirM=new THREE.MeshBasicMaterial({map:mirRT.texture,fog:false,color:0xb8c4cc}); const glass=new THREE.Mesh(new THREE.PlaneGeometry(1.04,1.9),mirM); glass.position.set(0,1.15,.045); mirror.add(glass);
const crackM=new THREE.MeshBasicMaterial({transparent:true,opacity:0,fog:false,depthWrite:false,map:tex(512,936,(x,w,h)=>{ const r=rng(8); x.strokeStyle='rgba(235,240,255,.95)'; x.lineWidth=2.5; const cx=w*.42, cy=h*.38; for(let i=0;i<16;i++){ let a=i/16*6.283+r()*.3, px=cx, py=cy; x.beginPath(); x.moveTo(px,py); for(let s=0;s<9;s++){ a+= (r()-.5)*.5; const L=30+r()*70; px+=Math.cos(a)*L; py+=Math.sin(a)*L; x.lineTo(px,py); } x.stroke(); } for(let k=1;k<4;k++){ x.beginPath(); for(let i=0;i<=24;i++){ const a=i/24*6.283, rr=k*70+r()*30; i?x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr):x.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr); } x.stroke(); } })});
const crack=new THREE.Mesh(new THREE.PlaneGeometry(1.04,1.9),crackM); crack.position.set(0,1.15,.047); mirror.add(crack);
// hospital, live: mother sitting by the bed, monitor, wall clock
const hChair=new THREE.Group(); hChair.position.set(.95,0,-.45); hosp.add(hChair); box(hChair,.5,.06,.5,flat(0x8a8e92),0,.5,0); box(hChair,.5,.55,.06,flat(0x8a8e92),.0,.8,.24); hChair.rotation.y=-Math.PI/2;
const monC=document.createElement('canvas'); monC.width=256; monC.height=180; const monX=monC.getContext('2d'), monT=new THREE.CanvasTexture(monC); monT.colorSpace=THREE.SRGBColorSpace;
const mon=new THREE.Mesh(new THREE.PlaneGeometry(.42,.3),new THREE.MeshBasicMaterial({map:monT})); mon.position.set(-.9,1.3,-1.628); hosp.add(mon);
const drawMon=(t,flatline)=>{ const x=monX; x.fillStyle='#05140c'; x.fillRect(0,0,256,180); x.strokeStyle=flatline?'#ff4a3a':'#3aff8a'; x.lineWidth=4; x.beginPath(); for(let i=0;i<=256;i+=2){ const ph=((i/256)*2+t*1.1)%1; let y=110; if(!flatline){ if(ph>.4&&ph<.43) y=110-70*Math.sin((ph-.4)/.03*Math.PI); else if(ph>.43&&ph<.46) y=110+25*Math.sin((ph-.43)/.03*Math.PI); } i?x.lineTo(i,y):x.moveTo(i,y); } x.stroke();
  x.fillStyle=flatline?'#ff4a3a':'#3aff8a'; x.font='bold 34px monospace'; x.fillText(flatline?'0':'72',190,44); monT.needsUpdate=true; };
const clkC=document.createElement('canvas'); clkC.width=512; clkC.height=220; const clkX=clkC.getContext('2d'), clkT=new THREE.CanvasTexture(clkC); clkT.colorSpace=THREE.SRGBColorSpace;
const clk=new THREE.Mesh(new THREE.PlaneGeometry(.7,.3),new THREE.MeshBasicMaterial({map:clkT})); clk.position.set(.6,2.25,-2.14); hosp.add(clk); box(hosp,.76,.36,.04,flat(0x2a2e34),.6,2.25,-2.17,false);
let clkLast=''; const drawClock=(time,date)=>{ const k=time+date; if(k===clkLast) return; clkLast=k; const x=clkX; x.fillStyle='#0a0606'; x.fillRect(0,0,512,220); x.fillStyle='#ff3a2a'; x.shadowColor='#ff2010'; x.shadowBlur=18; x.textAlign='center'; x.font='bold 120px monospace'; x.fillText(time,256,125); x.font='bold 46px monospace'; x.fillText(date,256,190); clkT.needsUpdate=true; };
const hHand=new THREE.Group(); hosp.add(hHand); box(hHand,.13,.05,.16,flat(0xd9a27a),0,0,0,false); const fingers=[0,1,2,3].map(i=>{ const g=new THREE.Group(); g.position.set(-.045+i*.03,0,.08); hHand.add(g); box(g,.024,.03,.09,flat(0xd9a27a),0,0,.045,false); return g; }); hHand.position.set(.3,.93,-.15); hHand.rotation.y=.3;
const hBoyKid=person({shirt:0xa8c4d4,pants:0x2a2d36,hair:0x141010}); hBoyKid.scale.setScalar(.5); hBoyKid.rotation.set(-Math.PI/2,0,0); hBoyKid.position.set(0,.93,-.5); hosp.add(hBoyKid); hBoyKid.visible=false; hBoyKid.userData.face({blink:1});
const mCam=new THREE.PerspectiveCamera(40,540/960,.05,100);
const hospState=(t,o)=>{ hMom.position.set(.85,-.12,-.45); hMom.rotation.y=-Math.PI/2; hMom.userData.sit(); hMom.children[1].rotation.x=.35; hMom.userData.face({brow:1,blink:.55,open:.08,lookY:-1}); hMom.children[5].rotation.set(-1.0,0,.3); hMom.children[6].rotation.set(-1.0,0,-.3);
  hBoy.visible=!o.kid; hBoyKid.visible=!!o.kid; hHand.visible=!o.kid; drawMon(t,o.flat); drawClock(o.time||'11:57 PM',o.date||''); fingers.forEach((f,i)=>f.rotation.x=i===1?-o.finger*.6:i===2?-o.finger*.25:0); };
const flashDiv=document.createElement('div'); flashDiv.style.cssText='position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none'; document.body.insertBefore(flashDiv,$('fade'));

bAmb.intensity=1.5;

// insert: the father's wrist and watch, large, for close-ups
const wIns=new THREE.Group(); wIns.position.set(1.6,1.3,-1.9); base.add(wIns); box(wIns,.5,.16,.16,flat(0x6e7278),-.32,0,0); box(wIns,.32,.12,.12,flat(0xd9a27a),.08,0,0); box(wIns,.14,.1,.12,flat(0xd9a27a),.3,-.01,0);
const wBig=watch(1.0); wBig.rotation.set(Math.PI/2,0,0); wBig.position.set(-.05,0,.07); wIns.add(wBig); const sec2=new THREE.Group(); sec2.position.y=.024; wBig.add(sec2); { const m=new THREE.Mesh(new THREE.BoxGeometry(.006,.004,.08),flat(0xb02020)); m.position.z=.035; sec2.add(m); }
const wL=new THREE.SpotLight(0xfff2dc,0,3,.5,.5,1); wL.position.set(1.75,1.9,-1.2); wL.target.position.set(1.55,1.3,-1.9); base.add(wL,wL.target); wIns.visible=false;

// ============ REEL 4 — the last night
import { car as carKit } from './kit.js';
// hospital at night: cool blue, a doctor at the door, a windowsill with an envelope
hosp.background.set(0x1a2230); hosp.traverse(o=>{ if(o.isHemisphereLight){ o.color.set(0x8aa4d0); o.groundColor.set(0x2a3038); o.intensity=1.3; } if(o.isDirectionalLight){ o.color.set(0x9ab8ff); o.intensity=.6; } });
hosp.traverse(o=>{ if(o.isMesh&&o.material.color&&o.material.color.getHex&&o.material.color.getHex()===0xf4f8f8&&o.material.isMeshBasicMaterial) o.material.color.set(0x16233e); });
const nightLamp=new THREE.PointLight(0xbfd4ff,3,6,1.4); nightLamp.position.set(0,2.6,-.5); hosp.add(nightLamp);
box(hosp,1.6,.06,.3,flat(0xc8ccc8),-1.6,1.22,-2.05); const sillEnv=new THREE.Group(); sillEnv.position.set(-1.45,1.258,-2.02); sillEnv.rotation.y=.25; hosp.add(sillEnv); box(sillEnv,.3,.012,.2,envM,0,0,0,false);
{ const p=new THREE.Mesh(new THREE.PlaneGeometry(.26,.16),new THREE.MeshLambertMaterial({transparent:true,map:tex(260,160,(x,w,h)=>scrawl(x,w,h,[[.5,.6]],'#1b1d2b',5,44))})); p.rotation.x=-Math.PI/2; p.position.y=.0065; sillEnv.add(p); }
const sillGlow=new THREE.PointLight(0xffe2a8,0,1.5,1.5); sillGlow.position.set(-1.45,1.5,-1.9); hosp.add(sillGlow);
for(const z of [.4,1.6]) box(hosp,.12,2.3,.12,flat(0xa8b0b4),2.3,1.15,z); box(hosp,.12,.12,1.32,flat(0xa8b0b4),2.3,2.3,1.0);
const doc=person({shirt:0xe8ecee,pants:0x6a8a9a,hair:0x3a3a3a}); doc.scale.setScalar(PS); doc.position.set(2.05,0,1.0); doc.rotation.y=-Math.PI*.6; hosp.add(doc); box(doc,.62,.9,.05,flat(0xf2f4f4),0,1.05,-.17);
// the crash, on a stormy night
const crash=new THREE.Scene(); crash.background=C(0x05070c); crash.fog=new THREE.FogExp2(0x0a0e18,.06); crash.add(new THREE.HemisphereLight(0x5a6a90,0x141418,1.2));
const cMoon=new THREE.DirectionalLight(0x8aa0d0,.8); cMoon.position.set(-10,20,8); crash.add(cMoon);
box(crash,200,.1,200,flat(0x1e2a20),0,-.05,0,false); box(crash,7,.06,200,flat(0x26282e),0,0,0,false); for(let z=-90;z<90;z+=6) box(crash,.15,.07,2.5,flat(0xb8b090),0,.01,z,false);
for(let i=0;i<26;i++){ const p=pine(R,flat(0x14201a),flat(0x2a2018),1.4+R()*1.2); p.position.set((R()<.5?-1:1)*(6+R()*10),0,-60+i*4.6+R()*2); crash.add(p); }
const bigTree=pine(R,flat(0x18261c),flat(0x3a2a1c),2.2); bigTree.position.set(4.2,0,-6); crash.add(bigTree);
const ccar=carKit(0x3a4a5e); crash.add(ccar); ccar.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
const head=[-1,1].map(s=>{ const l=new THREE.SpotLight(0xfff0d0,30,40,.45,.5,1.2); l.position.set(s*.6,.8,-2.0); const tg=new THREE.Object3D(); tg.position.set(s*.6,0,-14); ccar.add(l,tg); l.target=tg; box(ccar,.3,.14,.04,glow(0xfff6e0),s*.62,.8,-2.06,false); return l; });
const fireL=new THREE.PointLight(0xff7a20,0,14,1.4); crash.add(fireL); const fireTex=mistTex;
const flames=[...Array(26)].map((_,i)=>{ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:fireTex,color:i%3?0xff8a2a:0xffd060,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); crash.add(s); return [s,R(),R(),R()]; });
const placeFire=(t,amt,p)=>{ fireL.intensity=amt*(18+Math.sin(t*23)*4+Math.sin(t*9)*3); fireL.position.set(p.x,p.y+1.2,p.z); flames.forEach(([s,a,b,c])=>{ const ph=(t*1.2+a)%1; s.visible=amt>0; s.position.set(p.x+(b-.5)*1.6,p.y+.6+ph*2.2*amt,p.z+(c-.5)*2.4); s.scale.setScalar((1.4-ph)*1.3*amt); s.material.opacity=(1-ph)*amt; }); };
const NR=900, rain=new THREE.InstancedMesh(new THREE.BoxGeometry(.008,.45,.008),new THREE.MeshBasicMaterial({color:0x9ab0d8,transparent:true,opacity:.45,fog:false}),NR); crash.add(rain); const rd=[...Array(NR)].map(()=>[R(),R(),R()]);
const placeRain=(t,cx,cz)=>{ rd.forEach((q,i)=>{ D.position.set(cx+(q[0]-.5)*18,((q[1]*9-t*14)%9+9)%9,cz+(q[2]-.5)*18); D.rotation.z=.12; D.updateMatrix(); rain.setMatrixAt(i,D.matrix); }); rain.instanceMatrix.needsUpdate=true; D.rotation.set(0,0,0); };
const cDad=person({shirt:0x6e7278,pants:0x33343c,hair:0x141010}); cDad.scale.setScalar(PS); cDad.userData.beard.visible=true; crash.add(cDad);
const cKid=person({shirt:0x9a3a32,pants:0x2e3440,hair:0x1c1410}); cKid.scale.setScalar(.5); crash.add(cKid);
const crashRT=new THREE.WebGLRenderTarget(540,960,{samples:4}); crashRT.texture.colorSpace=THREE.SRGBColorSpace;
const wallShow=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.1),new THREE.MeshBasicMaterial({map:crashRT.texture,transparent:true,opacity:0,fog:false,color:0xffffff})); wallShow.position.set(BW-.06,1.35,.2); wallShow.rotation.y=-Math.PI/2; base.add(wallShow);
// memory photographs: birthday, first day at school, the final embrace
const oMom=person({shirt:0x6a2430,pants:0x3a3640,hair:0x3a2418}); oMom.scale.setScalar(PS); { const hm=oMom.userData.hairM; box(oMom,.42,.62,.12,hm,0,1.62,-.2); box(oMom,.08,.5,.3,hm,-.2,1.7,-.05); box(oMom,.08,.5,.3,hm,.2,1.7,-.05); } out.add(oMom); oMom.visible=false;
const cake=new THREE.Group(); out.add(cake); box(cake,1.0,.06,.7,flat(0x8a6446),0,.75,0); for(const [x,z] of [[-.42,-.28],[.42,-.28],[-.42,.28],[.42,.28]]) box(cake,.05,.75,.05,flat(0x5a4030),x,.37,z);
{ const c=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.18,12),flat(0xf2d8e0)); c.position.y=.87; cake.add(c); for(let i=0;i<5;i++){ const a=i/5*6.28; box(cake,.015,.1,.015,flat(0x8ac0f0),Math.cos(a)*.12,1.01,Math.sin(a)*.12,false); box(cake,.02,.03,.02,glow(0xffc040),Math.cos(a)*.12,1.075,Math.sin(a)*.12,false); } } cake.visible=false;
const bag=box(kid,.36,.44,.16,flat(0x2a6a9a),0,1.25,-.24); bag.visible=false;
const MEM=[]; setDay(true);
father.visible=true; father.position.set(.2,0,5.2); father.rotation.y=.2; fArms([0,0,0],[0,0,0]); oMom.visible=true; oMom.position.set(2.0,0,5.0); oMom.rotation.y=-.3; kid.visible=true; kid.position.set(1.1,0,5.6); kid.rotation.y=0; cake.visible=true; cake.position.set(1.1,0,6.3);
MEM.push(snap(out,pc(1.1,1.5,9.4,1.1,.95,5.6,36))); cake.visible=false;
father.visible=false; oMom.position.set(.5,0,5.6); oMom.rotation.y=.3; oMom.children[6].rotation.set(0,0,-2.6); kid.position.set(1.4,0,7.0); kid.rotation.y=Math.PI*.85; bag.visible=true;
MEM.push(snap(out,pc(2.4,1.6,13.2,.9,1.2,6.0,34))); bag.visible=false; oMom.visible=false;
father.visible=true; father.position.set(1.0,-.25,5.6); father.rotation.y=.1; fArms([-1.25,0,.7],[-1.25,0,-.7]); kid.position.set(1.05,0,6.05); kid.rotation.y=Math.PI;
MEM.push(snap(out,pc(2.2,1.4,8.2,1.0,1.0,5.8,30))); father.visible=false; kid.visible=false; setDay(false); fArms([0,0,0],[0,0,0]);
const memPh=MEM.map(tx=>{ const g=new THREE.Group(); base.add(g); box(g,.48,.6,.006,flat(0xe9e2d0),0,0,0,false); const p=new THREE.Mesh(new THREE.PlaneGeometry(.42,.52),photoLit(tx,.4)); p.position.z=.004; g.add(p); g.visible=false; return g; });
// the final photograph: his mother asleep beside his bed; the message on the back
hMom.position.set(.62,-.12,-.85); hMom.rotation.y=-Math.PI/2; hMom.userData.sit(); hMom.children[1].rotation.x=.9; hMom.children[0].rotation.x=.5; hMom.userData.face({blink:1});
const SLEEP=snap(hosp,pc(1.4,1.7,1.2,.3,.9,-.9,46)); hMom.children[0].rotation.x=0; hMom.children[1].rotation.x=0;
hPhoto.children[1].material=photoLit(SLEEP,.12); hPhoto.children[2].visible=false;
const hBack=new THREE.Mesh(new THREE.PlaneGeometry(PW+.06,PH+.06),new THREE.MeshLambertMaterial({map:tex(400,480,(x,w,h)=>{ x.fillStyle='#e6ddc8'; x.fillRect(0,0,w,h); scrawl(x,w,h,[[.4,.8],[.52,.7],[.64,.45]],'#2a1414',4,52); })})); hBack.position.z=-.0035; hBack.rotation.y=Math.PI; hPhoto.add(hBack);
// collapse: photographs fall; a glowing doorway opens in the back wall
const allPh=[...WP,WN,WT,WB,WP0]; allPh.forEach((g,i)=>{ g.userData.p0=g.position.clone(); g.userData.r0=g.rotation.clone(); g.userData.d=R()*.7; });
const fallPhotos=v=>allPh.forEach(g=>{ const f=Math.max(0,Math.min(1,(v-g.userData.d)/.3)), p=g.userData.p0; g.position.set(p.x+(p.x>0?-1:1)*f*f*.25,Math.max(.01,p.y-f*f*p.y),p.z); g.rotation.set(g.userData.r0.x-f*1.2,g.userData.r0.y,g.userData.r0.z+f*.8); });
const lightDoor=new THREE.Group(); lightDoor.position.set(1.4,0,BZ0+.02); base.add(lightDoor); box(lightDoor,1.24,2.3,.06,flat(0x2a2018),0,1.15,0,false); const doorGlow=box(lightDoor,1.04,2.1,.02,glow(0xffffff),0,1.05,.04,false); const doorL=new THREE.PointLight(0xfff4e0,0,9,1.2); doorL.position.set(1.4,1.2,BZ0+.6); base.add(doorL);
// father dissolving into light
bFather.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); o.material.transparent=true; } }); const setFatherAlpha=a=>bFather.traverse(o=>{ if(o.isMesh) o.material.opacity=a; });
const NP=320, parts=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.012,0),glow(0xffe8b0),NP); base.add(parts); const pd=[...Array(NP)].map(()=>[R()-.5,R(),R()-.5,R()]);
const placeParts=(t,v,c)=>{ parts.visible=v>0&&v<1.4; pd.forEach((q,i)=>{ const d=Math.max(0,v-q[3]*.5)*1.5; D.position.set(c.x+q[0]*.5+Math.sin(t+i)*.05*d,q[1]*1.75+d*.9,c.z+q[2]*.35+d*.3); D.scale.setScalar(v>q[3]*.5?Math.max(0,1-d*.6):0); D.updateMatrix(); parts.setMatrixAt(i,D.matrix); }); parts.instanceMatrix.needsUpdate=true; D.scale.setScalar(1); };

// ============ REEL 5 — the final letter
// morning hospital: soft warm light through the window
let hospWin=null; hosp.traverse(o=>{ if(o.isMesh&&o.material.isMeshBasicMaterial&&o.material.color.getHex()===0x16233e) hospWin=o; });
const hospMorning=on=>{ hosp.background.set(on?0xe6dccc:0x1a2230); hosp.traverse(o=>{ if(o.isHemisphereLight){ o.color.set(on?0xfff0dc:0x8aa4d0); o.groundColor.set(on?0x8a8070:0x2a3038); o.intensity=on?1.9:1.3; } if(o.isDirectionalLight){ o.color.set(on?0xffe0b4:0x9ab8ff); o.intensity=on?1.8:.6; } }); if(hospWin) hospWin.material.color.set(on?0xfff4dc:0x16233e); nightLamp.intensity=on?.4:3; };
hospMorning(true); doc.visible=false;
const bedside=new THREE.Group(); bedside.position.set(-.95,0,-.75); hosp.add(bedside); box(bedside,.5,.6,.42,flat(0xd8d4cc),0,.3,0); const lastEnv=new THREE.Group(); lastEnv.position.set(0,.607,0); lastEnv.rotation.y=.3; bedside.add(lastEnv); box(lastEnv,.3,.012,.2,envM,0,0,0,false);
const lastInk=new THREE.Mesh(new THREE.PlaneGeometry(.26,.16),new THREE.MeshLambertMaterial({transparent:true,map:tex(260,160,(x,w,h)=>scrawl(x,w,h,[[.5,.6]],'#1b1d2b',5,61))})); lastInk.rotation.x=-Math.PI/2; lastInk.position.y=.0065; lastEnv.add(lastInk);
// photographs: the day he was born; this room, empty; his father outside their home
setDay(true); father.visible=true; father.position.set(.75,0,5.2); father.rotation.y=-.1; fArms([-1.0,0,.55],[-1.0,0,-.55]); baby.visible=true; baby.position.set(.71,1.22,5.62); baby.rotation.y=-.1; oMom.visible=true; oMom.position.set(1.55,0,5.1); oMom.rotation.y=-.35; oMom.children[6].rotation.set(0,0,0);
const BORN=snap(out,pc(1.1,1.55,8.6,1.1,1.4,5.2,32)); baby.visible=false; oMom.visible=false; fArms([0,0,0],[0,0,0]); father.position.set(-.8,0,6.6); father.rotation.y=.15;
const HOME=snap(out,pc(-.6,1.55,11.5,-.4,2.2,4,40)); father.visible=false; setDay(false);
hBoy.visible=false; hMom.visible=false; hBoyKid.visible=false; hHand.visible=false; lastEnv.visible=false; const EMPTY=snap(hosp,pc(1.3,1.9,2.4,0,.9,-.8,46)); hBoy.visible=true; hMom.visible=true; hHand.visible=true; lastEnv.visible=true;
// the mother's hands: an envelope, two photographs
const mIns=new THREE.Group(); mIns.position.set(1.5,1.25,1.6); mIns.rotation.y=-.4; hosp.add(mIns); const mSkin=flat(0xd9a27a);
const mHands=[-1,1].map(s=>{ const g=new THREE.Group(); mIns.add(g); box(g,.11,.2,.07,mSkin,0,0,0); box(g,.05,.08,.06,mSkin,s*-.07,.05,.02); box(g,.16,.32,.16,flat(0x6a2430),0,-.24,-.03); return g; });
const mkPhoto=(front,back,age=.35)=>{ const g=new THREE.Group(); box(g,PW+.06,PH+.06,.006,flat(0xe9e2d0),0,0,0,false); const f=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),photoLit(front,age)); f.position.z=.0035; g.add(f);
  if(back){ const bk=new THREE.Mesh(new THREE.PlaneGeometry(PW+.06,PH+.06),new THREE.MeshLambertMaterial({map:tex(400,480,(x,w,h)=>{ x.fillStyle='#e6ddc8'; x.fillRect(0,0,w,h); scrawl(x,w,h,back,'#2a1414',4,71+back.length); })})); bk.position.z=-.0035; bk.rotation.y=Math.PI; g.add(bk); } return g; };
const phBorn=mkPhoto(BORN,null,.45), phEmpty=mkPhoto(EMPTY,[[.36,.8],[.47,.75],[.58,.6],[.69,.4]],.15); mIns.add(phBorn,phEmpty);
const mEnv=new THREE.Group(); mIns.add(mEnv); box(mEnv,.62,.8,.012,envM,0,0,0,false); { const p=new THREE.Mesh(new THREE.PlaneGeometry(.58,.76),new THREE.MeshLambertMaterial({transparent:true,map:tex(320,420,(x,w,h)=>scrawl(x,w,h,[[.5,.6]],'#1b1d2b',6,81))})); p.position.z=-.008; p.rotation.y=Math.PI; mEnv.add(p); }
// the boy's hands with his father's watch; a hologram of his father; the hidden photograph
const bIns=new THREE.Group(); bIns.position.set(1.5,1.05,1.6); hosp.add(bIns); const gown=flat(0xa8c4d4);
const bHands=[-1,1].map(s=>{ const g=new THREE.Group(); bIns.add(g); box(g,.16,.08,.22,mSkin,0,0,0); box(g,.2,.18,.36,gown,0,.02,.28); g.position.set(s*.22,-.02,.12); g.rotation.y=s*-.35; return g; });
const hWatch=watch(2.2); bIns.add(hWatch); const hSec=new THREE.Group(); hSec.position.y=.045; hWatch.add(hSec); { const m=new THREE.Mesh(new THREE.BoxGeometry(.008,.006,.17),flat(0xb02020)); m.position.z=.075; hSec.add(m); }
const holoM=new THREE.MeshBasicMaterial({color:0x8fe3ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}); const holo=person({shirt:0x6e7278,pants:0x33343c,hair:0x141010}); holo.userData.beard.visible=true; holo.traverse(o=>{ if(o.isMesh){ o.material=holoM; o.castShadow=false; } }); holo.scale.setScalar(.16); holo.position.set(0,.06,0); bIns.add(holo);
const holoL=new THREE.PointLight(0x8fe3ff,0,1.5,1.5); holoL.position.set(0,.3,0); bIns.add(holoL);
const phHome=mkPhoto(HOME,[[.44,.8],[.56,.6]],.4); phHome.scale.setScalar(.55); bIns.add(phHome);
// the memory: the old home, warm; father and son build a wooden toy; mother in the kitchen
const kFather=person({shirt:0x6e7278,pants:0x33343c,hair:0x141010}); kFather.scale.setScalar(PS); kFather.userData.beard.visible=true; kit.add(kFather); const kWatch=watch(.5); kFather.children[5].add(kWatch); kWatch.position.set(0,-.56,.075); kWatch.rotation.set(Math.PI/2,0,0);
kFather.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); o.material.transparent=true; } });
const kKid=person({shirt:0x9a3a32,pants:0x2e3440,hair:0x1c1410}); kKid.scale.setScalar(.5); kit.add(kKid); kKid.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); o.material.transparent=true; } });
const alpha=(p,a)=>p.traverse(o=>{ if(o.isMesh) o.material.opacity=a; });
const toy=new THREE.Group(); toy.position.set(-.6,.82,.95); kit.add(toy); box(toy,.3,.08,.14,flat(0xb88a50),0,.04,0); box(toy,.16,.07,.12,flat(0xc89a60),-.03,.115,0); for(const [x,z] of [[-.1,-.08],[.1,-.08],[-.1,.08],[.1,.08]]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.025,10).rotateX(Math.PI/2),flat(0x5a3a22)); w.position.set(x,.03,z); toy.add(w); }
const tWatch=watch(.6); tWatch.position.set(-.25,.82,1.05); tWatch.rotation.y=.6; kit.add(tWatch);
const kitWarm=on=>{ kit.background.set(on?0xe8d4b8:0xb8c2cc); kit.fog.color.set(on?0xe0c8a8:0xaab4be); kH.color.set(on?0xffe6c4:0xc8d4e4); kH.groundColor.set(on?0x7a6048:0x5a5650); kH.intensity=on?1.7:1.6; kD.color.set(on?0xffc890:0xdfe8f4); kD.intensity=on?3.2:2.6; };
// years later: the boy grown, his wife, their child, a birthday cake
const adult=person({shirt:0x3d5a73,pants:0x2a2d36,hair:0x141010}); adult.scale.setScalar(PS*1.02); kit.add(adult); const wife=person({shirt:0x3a6a5a,pants:0x2e2e38,hair:0x2a1810}); wife.scale.setScalar(PS*.96); { const hm=wife.userData.hairM; box(wife,.42,.7,.12,hm,0,1.58,-.2); } kit.add(wife);
const child=person({shirt:0xe0b030,pants:0x3a4a6a,hair:0x1c1410}); child.scale.setScalar(.5); kit.add(child); const aWatch=watch(.5); adult.children[5].add(aWatch); aWatch.position.set(0,-.56,.075); aWatch.rotation.set(Math.PI/2,0,0);
const bcake=new THREE.Group(); bcake.position.set(-.6,.81,.9); kit.add(bcake); { const c=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.16,12),flat(0xf2e2c8)); c.position.y=.08; bcake.add(c); for(let i=0;i<6;i++){ const a=i/6*6.28; box(bcake,.014,.09,.014,flat(0x8ac0f0),Math.cos(a)*.12,.2,Math.sin(a)*.12,false); box(bcake,.02,.03,.02,glow(0xffc040),Math.cos(a)*.12,.26,Math.sin(a)*.12,false); } }
const cakeL=new THREE.PointLight(0xffb050,0,3,1.5); cakeL.position.set(-.6,1.2,.9); kit.add(cakeL);
// the engraving on the back of the watch
const engr=new THREE.Group(); engr.position.set(1.6,1.0,2.2); kit.add(engr); { const steel=new THREE.MeshStandardMaterial({color:0xc8ccd2,metalness:.85,roughness:.3,flatShading:true}); const d=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.05,32),steel); engr.add(d);
  const e=new THREE.Mesh(new THREE.CircleGeometry(.2,32),new THREE.MeshStandardMaterial({color:0xd8dce2,metalness:.7,roughness:.35,transparent:true,map:tex(512,512,(x,w,h)=>{ x.fillStyle='#c8ccd2'; x.fillRect(0,0,w,h); x.fillStyle='#4a4e56'; x.textAlign='center'; x.font='italic 64px "DejaVu Serif", Georgia, serif'; x.fillText('Keep living,',256,240); x.fillText('son.',256,320); x.strokeStyle='#8a8e96'; x.lineWidth=3; x.beginPath(); x.arc(256,256,215,0,6.283); x.stroke(); })})); e.rotation.x=-Math.PI/2; e.position.y=.026; engr.add(e); }
const engrL=new THREE.PointLight(0xffe2b0,0,2,1.5); engrL.position.set(1.9,1.6,2.5); kit.add(engrL); engr.visible=false;
// ============ shots
const V=new THREE.Vector3(), E=(a,b,t)=>ss(a,b,t), look=(x,y,z,tx,ty,tz)=>{ cam.position.set(x,y,z); cam.lookAt(tx,ty,tz); };
const camAt=(grp,lx,ly,lz,tx,ty,tz)=>{ grp.updateMatrixWorld(); const c=new THREE.Vector3(lx,ly,lz).applyMatrix4(grp.matrixWorld), q=new THREE.Vector3(tx,ty,tz).applyMatrix4(grp.matrixWorld); look(c.x,c.y,c.z,q.x,q.y,q.z); };
const SEG=TL.segments, SN=Object.fromEntries(SEG.map(s=>[s.name,s])), LT=(n,i)=>SN[n].lines[i].t, LE=(n,i)=>SN[n].lines[i].t+SN[n].lines[i].d;
window.SHOTS=SEG.map((s,i)=>[i?s.start:0,i<SEG.length-1?SEG[i+1].start:DUR]);
const bl=(t,o)=>{ const p=(t+o)%3.7; return p<.14?Math.sin(p/.14*Math.PI):0; };
const headOf=(p,y=1.82)=>{ p.updateMatrixWorld(); return new THREE.Vector3(0,y,0).applyMatrix4(p.matrixWorld); };
const faceTo=(p,x,z)=>{ p.rotation.y=Math.atan2(x-p.position.x,z-p.position.z); };
const resetP=p=>{ for(const c of p.children) if(c.isGroup&&c!==p.userData.faceGroup) c.rotation.set(0,0,0); p.rotation.set(0,0,0); p.userData.pose(0,0); };
const momHold=()=>{ hMom.position.set(.85,-.12,-.45); hMom.rotation.y=-Math.PI/2; hMom.userData.sit(); hMom.children[0].rotation.x=0; hMom.children[1].rotation.x=.1; hMom.children[5].rotation.set(-1.1,0,.2); hMom.children[6].rotation.set(-.5,0,-.2); };
window.renderAt=t=>{ const k=Math.max(0,window.SHOTS.findLastIndex(s=>t>=s[0])), name=SEG[k].name, [a,b]=window.SHOTS[k], u=(t-a)/Math.max(b-a,1e-6);
  let scene=hosp, black=0, white=0; cam.fov=50; renderer.toneMappingExposure=1.0; bloom.strength=.45; bloom.threshold=.95;
  hospMorning(true); hospState(t,{flat:false,time:'7:42 AM',date:'',finger:0}); momHold(); hBoy.visible=true; hBoyKid.visible=false; hHand.visible=true; hMom.visible=true; hBoy.userData.face({blink:bl(t,.4),lookX:.6}); hMom.userData.face({blink:bl(t,1.2),brow:.6});
  sillEnv.visible=true; sillGlow.intensity=0; lastEnv.visible=false; lastInk.material.opacity=1; mIns.visible=false; bIns.visible=false; holoM.opacity=0; holoL.intensity=0; clk.visible=true;
  kitWarm(true); [kFather,kKid,mom,kBoy,adult,wife,child].forEach(p=>{ p.visible=false; resetP(p); }); alpha(kFather,1); alpha(kKid,1); toy.visible=false; tWatch.visible=false; bcake.visible=false; cakeL.intensity=0; engr.visible=false; engrL.intensity=0;
  setDay(false); oMom.visible=false; handIns.visible=false; hallDay(false); hhBoy.visible=hhMom.visible=false; hatch.visible=false; hole.visible=false; corner.visible=false; letter.visible=false; ghost.visible=false; flap.rotation.set(0,0,0);
  if(name==='envelope'){ // he is awake; the envelope by the window; her trembling hands
    if(t<LT('envelope',1)){ const h=new THREE.Vector3(0,1.08,-1.48), w=E(a,LT('envelope',1),t); look(lg(1.2,.55,w),lg(2.0,1.6,w),lg(1.4,-.4,w),h.x,h.y,h.z); cam.fov=44; }
    else if(t<LT('envelope',1)+2.6){ const w=E(LT('envelope',1),LT('envelope',1)+2.6,t); look(lg(-.3,-1.15,w),lg(1.75,1.55,w),lg(.3,-1.35,w),-1.45,1.27,-2.02); cam.fov=lg(50,40,w); }
    else { sillEnv.visible=false; mIns.visible=true; mEnv.visible=true; mEnv.position.set(0,0,0); phBorn.visible=phEmpty.visible=false; mHands.forEach((h,i)=>{ h.position.set((i?1:-1)*.33,-.1,.01); h.rotation.set(0,0,(i?-1:1)*.15+Math.sin(t*31+i)*.012); }); camAt(mIns,0,.05,-lg(1.4,1.2,u*1.5),0,0,0); cam.fov=40; } }
  else if(name==='photos'||name==='message'){ // the photographs
    sillEnv.visible=false; mIns.visible=true; mEnv.visible=false; phBorn.visible=true; phEmpty.visible=true; mHands.forEach((h,i)=>{ h.position.set((i?1:-1)*(PW/2+.02),-.12,0); h.rotation.set(0,0,(i?-1:1)*.1+Math.sin(t*29+i)*.01); });
    const sl=E(LT('photos',1)-.2,LT('photos',1)+.8,t), fl=E(SN.message.start,SN.message.start+.6,t);
    phBorn.position.set(sl*-.7,sl*-.25,-.003); phBorn.rotation.set(0,Math.PI,sl*.4); phEmpty.position.set(0,0,0); phEmpty.rotation.set(0,Math.PI+fl*Math.PI,lg(0,.03,fl));
    if(name==='photos'){ const w=E(a,b,t); camAt(mIns,0,.02,-lg(1.05,.7,w),0,0,0); cam.fov=40; }
    else if(t<LT('message',1)+2.2){ const w=E(a,LT('message',1)+2.2,t); camAt(mIns,0,.02,-lg(.9,.6,w),0,0,0); cam.fov=40; }
    else { mIns.visible=false; hMom.userData.face({wide:.5,brow:1,blink:bl(t,.3),lookY:-.4,open:.1}); const h=headOf(hMom,1.72), w=E(LT('message',1)+2.2,b,t); look(h.x-lg(1.1,.75,w),h.y+.02,h.z+lg(.6,.42,w),h.x,h.y-.04,h.z); cam.fov=42; } }
  else if(name==='memory'){ // the old home, warm; then only the watch remains
    scene=kit; kFather.visible=kKid.visible=mom.visible=true; toy.visible=true; tWatch.visible=true;
    kFather.position.set(-.6,-.14,.25); kFather.rotation.y=0; kFather.userData.sit(); kFather.children[5].rotation.set(-1.25,0,.25); kFather.children[6].rotation.set(-1.25,0,-.25); kFather.userData.face({blink:bl(t,.2),lookY:-.7,smile:1});
    kKid.position.set(-.45,0,1.55); faceTo(kKid,-.6,.9); kKid.children[5].rotation.set(-1.3,0,.2); kKid.userData.face({blink:bl(t,1),lookY:-.6,smile:1}); mom.position.set(-1.2,0,-1.75); faceTo(mom,-.6,.9); mom.userData.face({blink:bl(t,2),smile:1});
    const fd=E(LT('memory',0)+2.4,b-.2,t); alpha(kFather,1-fd); alpha(kKid,1-fd); kFather.visible=kKid.visible=fd<.99; mom.visible=fd<.6; toy.visible=fd<.8; white=fd*.25*(1-fd)*4; bloom.strength=.55; bloom.threshold=.85;
    const w=E(a,b,t); look(lg(1.6,.05,w),lg(1.55,1.15,w),lg(2.7,1.6,w),lg(-.8,-.25,w),lg(1.0,.84,w),lg(.2,1.05,w)); cam.fov=lg(50,40,w); }
  else if(name==='watch'){ // ticking again; a hologram of his father; the hidden photograph
    bIns.visible=true; hSec.rotation.y=-Math.floor(Math.max(0,t-LT('watch',1)))*6.283/60*2; const ho=E(LT('watch',1)+.6,LT('watch',2),t)*(1-E(LT('watch',2)+.2,LT('watch',2)+.8,t)); holoM.opacity=ho*.35*(.85+.15*Math.sin(t*20)); holoL.intensity=0; holo.rotation.y=Math.sin(t*.8)*.4; holo.userData.face({smile:1,blink:bl(t,.5)});
    holo.position.y=.06+Math.sin(t*2)*.005; const ph=E(LT('watch',2),LT('watch',2)+.8,t), fl=E(LT('watch',4),LT('watch',4)+.6,t); phHome.visible=ph>0; phHome.position.set(0,lg(-.1,.3,ph),lg(0,.05,ph)); phHome.rotation.set(lg(-Math.PI/2,0,ph),Math.PI+fl*Math.PI,0); hWatch.visible=ph<.5;
    if(t<LT('watch',2)){ const w=E(a,LT('watch',2),t); if(t<LT('watch',1)+.5) look(1.5,lg(2.6,2.3,w),lg(.75,.85,w),1.5,1.05,1.6); else look(lg(1.5,1.45,w),1.5,lg(.75,.95,w),1.5,1.2,1.6); cam.fov=40; bloom.threshold=1.1; }
    else { camAt(phHome,0,0,-lg(.75,.48,E(LT('watch',2),b,t)),0,0,0); cam.fov=40; bHands.forEach(h=>h.visible=false); } bHands.forEach(h=>h.visible=t<LT('watch',2)); }
  else if(name==='home'){ // weeks later: home; the hallway floor is just a floor; no letter
    if(t<LT('home',1)){ scene=out; setDay(true); hhBoy; const w=E(a,LT('home',1),t); [oMom].forEach(p=>p.visible=true); oMom.position.set(lg(.4,.3,w),0,lg(10,6.4,w)); oMom.rotation.y=Math.PI; oMom.userData.pose(t*6,.4); oMom.children[6].rotation.set(0,0,0);
      kid.visible=false; father.visible=false; look(4.5,1.8,16,0,1.6,4); cam.fov=40; out.add(hhBoy); hhBoy.visible=true; hhBoy.position.set(lg(-.45,-.5,w),0,lg(10.2,6.6,w)); hhBoy.rotation.y=Math.PI; hhBoy.userData.pose(t*6+1,.4); hhBoy.userData.face({}); }
    else if(t<LT('home',2)){ scene=house; house.add(hhBoy); hallDay(true); setClock(10,10,t); const w=E(LT('home',1),LT('home',2),t); look(lg(.6,.35,w),lg(1.6,.9,w),lg(3.2,2.0,w),0,0,.35); cam.fov=46; renderer.toneMappingExposure=1.3; }
    else { scene=house; house.add(hhBoy); setClock(0,3,t); look(.9,1.1,1.2,-.1,.35,-5.6); cam.fov=46; } oMom.visible=t<LT('home',1); }
  else if(name==='years'){ // years later: his own family; a birthday; the engraving
    scene=kit; adult.visible=wife.visible=child.visible=true; bcake.visible=true; cakeL.intensity=1.6+Math.sin(t*13)*.2; bloom.strength=.55; bloom.threshold=.85;
    adult.position.set(-.6,-.14,.25); adult.userData.sit(); adult.userData.face({smile:1,blink:bl(t,.3),lookY:-.3}); wife.position.set(.25,0,.55); faceTo(wife,-.6,.9); wife.userData.face({smile:1,blink:bl(t,1.4)}); child.position.set(-.45,0,1.55); faceTo(child,-.6,.9); child.userData.face({smile:1,blink:bl(t,2.2),open:.2});
    if(t<LT('years',2)){ const w=E(a,LT('years',2),t); look(lg(1.6,1.2,w),lg(1.8,1.5,w),lg(2.9,2.3,w),-.5,1.05,.8); cam.fov=46; }
    else if(t<LT('years',3)-.2){ adult.children[5].rotation.set(-1.3,0,.3); const h=headOf(adult,1.75), w=E(LT('years',2),LT('years',3),t); look(h.x+.35,h.y-.1,h.z+lg(1.3,1.0,w),h.x,h.y-.25,h.z); cam.fov=42; cakeL.intensity=.8; adult.userData.face({blink:0,lookY:-1,brow:.4}); }
    else { engr.visible=true; engrL.intensity=2; const w=E(LT('years',3)-.2,b,t); look(1.6,1.0+lg(.75,.5,w),2.2+lg(.15,.08,w),1.6,1.0,2.2); cam.fov=40; } }
  else { // the empty room; the last envelope turns blank
    hBoy.visible=false; hMom.visible=false; hHand.visible=false; sillEnv.visible=false; lastEnv.visible=true; clk.visible=true; const bk=E(LT('end',0)+.6,LT('end',1)+1.6,t); lastInk.material.opacity=1-bk;
    const w=E(a,b,t); look(lg(.3,-.4,w),lg(1.8,1.35,w),lg(.6,-.15,w),-.95,.62,-.75); cam.fov=lg(48,38,w); if(t>DUR-1.8) black=E(DUR-1.8,DUR-.2,t); }
  cam.updateProjectionMatrix(); rp.scene=scene; composer.render(); grain(t);
  $('fade').style.opacity=Math.max(1-ss(0,.6,t),black); flashDiv.style.opacity=white; };
window.renderAt(1); window.ready=true;
