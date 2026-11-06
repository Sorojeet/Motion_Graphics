import * as THREE from 'three';
import { rng, flat, shadow, ss, rock, roundTree, pine, person, lamp, building, bird } from './kit.js';
const R=rng(11), $=id=>document.getElementById(id);
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(55,1080/1920,.5,900); scene.fog=new THREE.Fog(0xffffff,70,300);
const C=h=>new THREE.Color(h);
// keyed colour ramps by temperature
const ramp=(k,T)=>{ for(let i=1;i<k.length;i++) if(T<=k[i][0]){ const a=k[i-1],b=k[i]; return C(a[1]).lerp(C(b[1]),ss(a[0],b[0],T)); } return C(k.at(-1)[1]); };
const P={ skyTop:[[22,0x7f91d8],[42,0x9d97c2],[58,0xb97f6a],[72,0x7c3a2c],[82,0x3d1a1c]],
 skyLow:[[22,0xf2c4ad],[42,0xf6bb82],[58,0xf09a52],[72,0xc85a2a],[82,0x8a3418]],
 grass:[[22,0x4fa83f],[36,0x86ab3e],[48,0xc0a84a],[60,0x9c7a42],[74,0x4a3a30],[82,0x2c2522]],
 leafA:[[22,0x2c7f3d],[36,0x5e8a33],[50,0xa98a2c],[64,0x8a4f22],[82,0x2a2019]],
 leafB:[[22,0x3f9a48],[36,0x7ea03c],[50,0xc49a32],[64,0xa35a24],[82,0x33261c]],
 leafC:[[22,0x1f6a3a],[36,0x4d7a30],[50,0x8e7428],[64,0x71401f],[82,0x241b16]],
 path:[[22,0xe9ae7c],[60,0xd59a68],[82,0x6e4c3a]], water:[[22,0x4b9df0],[45,0x6aa6c8],[58,0x9a9a86]],
 sun:[[22,0xfff2a0],[50,0xffd066],[82,0xff7a2e]] };
// sky + sun
const skyU={top:{value:C(0)},low:{value:C(0)}};
scene.add(new THREE.Mesh(new THREE.SphereGeometry(700,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:skyU,
 vertexShader:'varying vec3 p;void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 p;uniform vec3 top,low;void main(){gl_FragColor=vec4(mix(low,top,smoothstep(-.02,.42,p.y)),1.);\n#include <colorspace_fragment>\n}'})));
const cv=document.createElement('canvas'); cv.width=cv.height=512; { const x=cv.getContext('2d'),g=x.createRadialGradient(256,256,0,256,256,256); g.addColorStop(0,'#fff');g.addColorStop(.32,'#fff');g.addColorStop(.36,'#ffffffb0');g.addColorStop(.6,'#ffffff30');g.addColorStop(1,'#fff0'); x.fillStyle=g;x.fillRect(0,0,512,512); }
const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),fog:false,depthWrite:false,transparent:true})); sun.position.set(55,66,-180); scene.add(sun);
const hemi=new THREE.HemisphereLight(0xffffff,0xe8c8ac,2.5); scene.add(hemi);
const dir=new THREE.DirectionalLight(0xfff0d0,1.5); dir.position.set(34,48,26); dir.castShadow=true; dir.shadow.mapSize.set(2048,2048); Object.assign(dir.shadow.camera,{left:-55,right:55,top:55,bottom:-55,near:1,far:170}); dir.shadow.bias=-.0006; dir.shadow.normalBias=.04; scene.add(dir);
// ground
const grassM=flat(0), pathM=flat(0), waterM=flat(0);
scene.add(shadow(new THREE.Mesh(new THREE.PlaneGeometry(900,900).rotateX(-Math.PI/2),grassM),false));
const strip=shadow(new THREE.Mesh(new THREE.BoxGeometry(9,.04,60),pathM),false); strip.position.set(0,.03,29); scene.add(strip);
const plaza=shadow(new THREE.Mesh(new THREE.CylinderGeometry(22,22,.004,28),pathM),false); plaza.scale.z=.72; plaza.position.y=.058; scene.add(plaza);
const pond=shadow(new THREE.Mesh(new THREE.CylinderGeometry(13,13,.05,24),waterM),false); pond.scale.z=.34; pond.position.y=.09; scene.add(pond);
// fountain
const stone=flat(0xb9b2a8); const tier=(rt,rb,h,y)=>{ const m=shadow(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,8),stone)); m.position.y=y; scene.add(m); };
tier(3.6,4,.7,.35); tier(.8,1.7,1.2,1.3); tier(2,1.6,.3,2); tier(.25,.9,3.2,3.6);
const DROPS=84, drops=new THREE.InstancedMesh(new THREE.BoxGeometry(.24,.24,.24),new THREE.MeshBasicMaterial({color:0xe8f8ff}),DROPS); drops.frustumCulled=false; scene.add(drops);
// trees, lamps, props
const leaf=[flat(0),flat(0),flat(0)], pineM=flat(0), bark=flat(0x6b4a33); const trees=[];
const addT=(o,x,z,burn)=>{ o.position.set(x,0,z); o.rotation.y=R()*6; o.userData.burn=burn; scene.add(o); trees.push(o); };
[[-9.2,13,1.7],[10.2,12,1.9],[-11,3,1.7],[11.5,2,1.8],[-15,7,1.9],[15,6,2],[-10,-9,1.5],[10,-10,1.5],[-20,-5,1.8],[20,-7,1.8]].forEach(([x,z,s])=>addT(roundTree(R,leaf,bark,s),x,z,60+R()*11));
[[-4.5,-13],[-2,-16],[3.5,-14],[6,-16],[-7,-17],[8.5,-14],[0.7,-18],[-13,-15],[14,-15]].forEach(([x,z])=>addT(pine(R,pineM,bark,1.6+R()*.9),x,z,58+R()*11));
const lamps=[[-5.3,11],[5.3,11],[-5.5,-1.5],[5.5,-1.5]].map(([x,z],i)=>{ const l=lamp(flat(0x23262c),flat(0xf3dd9c)); l.position.set(x,0,z); l.userData.s=x<0?1:-1; l.userData.o=i*.7; scene.add(l); return l; });
const crateCols=[0xd7577f,0x8f6fce,0xe9b94c,0xdf7b4e,0x5fb0c2]; const crates=[];
for(let i=0;i<20;i++){ const a=(i<10?.05+i*.07:Math.PI-.05-(i-10)*.07), s=.7+R()*.6, m=shadow(new THREE.Mesh(new THREE.BoxGeometry(s*1.4,s,s),flat(crateCols[i%5]))); m.position.set((i<10?1:-1)*(6.5+(i%10)*.85),s/2+.05,1.5+(i%3)*1.4+(i%10)*.3); m.userData.base=C(crateCols[i%5]); scene.add(m); crates.push(m); }
// buildings
const win=[]; [
 {x:-19,z:-52,w:18,h:29,d:16,color:0xb8a2e6},{x:-8,z:-62,w:11,h:31,d:14,color:0xf6b172},{x:-2,z:-70,w:8,h:23,d:12,color:0xf5ad6c},
 {x:3,z:-50,w:14,h:36,d:14,color:0x7ec4bc},{x:18,z:-58,w:9,h:15,d:12,color:0xf0a79d},{x:27,z:-62,w:16,h:13,d:14,color:0xa9b4d8},{x:22,z:-48,w:8,h:9,d:9,color:0xb8a2e6},
 {x:-38,z:-68,w:17,h:24,d:14,color:0xeaa985},{x:44,z:-76,w:22,h:20,d:14,color:0xc2a8e2}
].forEach(b=>{ const o=building({...b,rand:R,windows:win,step:3.4}); scene.add(o); });
const wins=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}),win.length); const D=new THREE.Object3D();
win.forEach((w,i)=>{ D.position.set(w.x,w.y,w.z); D.scale.set(w.sx,w.sy,w.sz); D.updateMatrix(); wins.setMatrixAt(i,D.matrix); wins.setColorAt(i,C(0)); }); scene.add(wins);
// clouds + birds
const clouds=[[-38,46,-115,1.1],[-48,78,-165,1.5],[30,92,-190,1.6]].map(([x,y,z,s])=>{ const g=new THREE.Group(); const m=flat(0xe6b49c); for(let i=0;i<3;i++){const b=new THREE.Mesh(rock(9*s,1,R,.13),m); b.position.set((i-1)*11*s,R()*3,0); b.scale.y=.42; g.add(b);} g.position.set(x,y,z); g.userData.m=m; scene.add(g); return g; });
const birdM=new THREE.MeshBasicMaterial({color:0x232c52,side:THREE.DoubleSide}); const birds=[[-8,21,-5],[7,24,-8],[9,18,-11],[-12,15,-22],[4,14,-25],[14,13,-28]].map(([x,y,z],i)=>{ const b=bird(birdM); b.position.set(x,y,z); b.userData={...b.userData,o:[x,y,z],s:R()*6}; scene.add(b); return b; });
// people: walk until `leave`, then run to the side of the frame
const shirts=[[0xf07a22,0x2c3a5e],[0xf2e6c8,0x394a6e],[0xc98a2a,0x4b3a30],[0xd55a6a,0x2d3440],[0x5aa3c7,0x54402f],[0x8f6fce,0x2d3440],[0xe5c048,0x3d3a40]];
const crowd=[{p:[-1.5,20],v:[0,-.42],leave:40,exit:[1,.2]},{p:[-13,3],v:[.8,.1],leave:33,exit:[-1,.3]},{p:[11,-1],v:[-.7,.1],leave:36,exit:[1,.1]},{p:[-3,4.8],v:[-.45,.2],leave:38,exit:[-1,.6]},{p:[5,6],v:[.3,.3],leave:43,exit:[1,.6]},{p:[2.2,11],v:[0,.3],leave:46,exit:[-1,.8]},{p:[-10,-3.8],v:[.55,0],leave:30,exit:[-1,.1]}]
 .map((c,i)=>{ const m=person({shirt:shirts[i][0],pants:shirts[i][1]}); scene.add(m); return {...c,m}; });
// fire, smoke, embers, cracks
const fireM=new THREE.MeshBasicMaterial({color:0xff7a1a,fog:false}), fireY=new THREE.MeshBasicMaterial({color:0xffc83a,fog:false});
const fires=trees.map(t=>{ const g=new THREE.Group(); const hs=[0,1,2,3,4].map(i=>{ const m=new THREE.Mesh(new THREE.ConeGeometry(1,3,5),i%2?fireY:fireM); const a=i*1.3; m.position.set(Math.cos(a)*1.1,0,Math.sin(a)*1.1); g.add(m); return m; }); t.add(g); const fs=t.userData.top.position.y/3.6; g.scale.setScalar(Math.max(1.5,fs*1.25)); g.position.y=t.userData.top.position.y+1.4*fs; g.userData.hs=hs; return g; });
const sm=new THREE.InstancedMesh(rock(1,0,R,.1),new THREE.MeshLambertMaterial({color:0x2c2626,flatShading:true,transparent:true,opacity:.62,depthWrite:false}),130); sm.frustumCulled=false; sm.castShadow=false; scene.add(sm);
const smokeSrc=[[-19,27,-52],[3,34,-50],[-8,30,-62],[18,14,-58],[27,12,-62],[-1,8,-18]];
const emb=new THREE.InstancedMesh(new THREE.BoxGeometry(.13,.13,.13),new THREE.MeshBasicMaterial({color:0xffa23a,fog:false}),150); emb.frustumCulled=false; scene.add(emb);
const crk=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,.8,.02,5),new THREE.MeshBasicMaterial({color:0x2a1b16}),46); const crD=[...Array(46)].map(()=>({x:(R()-.5)*8,z:R()*30-3,r:.35+R()*1.1,a:R()*6,sx:.4+R()*.5,T:58+R()*22})); scene.add(crk);
const seeds=[...Array(150)].map(()=>[R(),R(),R(),R()]);

const DUR=18, T0=2.5, T1=14.5;
const tempAt=t=>22+60*Math.min(1,Math.max(0,(t-T0)/(T1-T0)));
const stages=[[22,'Pleasant afternoon'],[32,'Hot summer day'],[42,'Dangerous heat'],[52,'Near the world record'],[57,'Past the world record'],[72,'Vegetation scorched'],[82,'City abandoned']];
window.DURATION=DUR;
window.renderAt=t=>{ const T=tempAt(t);
 skyU.top.value.copy(ramp(P.skyTop,T)); skyU.low.value.copy(ramp(P.skyLow,T)); scene.fog.color.copy(skyU.low.value); scene.fog.near=70-34*ss(45,82,T); scene.fog.far=300-170*ss(45,82,T);
 const hot=ss(50,82,T); hemi.intensity=2.5-1.1*hot; hemi.color.copy(C(0xffffff).lerp(C(0xff9c60),hot)); dir.color.copy(C(0xfff0d0).lerp(C(0xff8a40),hot)); dir.intensity=1.5-.5*hot;
 const s=72+110*ss(22,82,T); sun.scale.setScalar(s); sun.material.color.copy(ramp(P.sun,T));
 grassM.color.copy(ramp(P.grass,T)); pathM.color.copy(ramp(P.path,T)); waterM.color.copy(ramp(P.water,T)); leaf[0].color.copy(ramp(P.leafA,T)); leaf[1].color.copy(ramp(P.leafB,T)); leaf[2].color.copy(ramp(P.leafC,T)); pineM.color.copy(ramp(P.leafC,T));
 const lvl=1-ss(42,60,T); pond.scale.x=.04+.96*lvl; pond.scale.z=.34*(.04+.96*lvl); pond.visible=lvl>.01;
 for(let i=0;i<DROPS;i++){ const jet=i%6, a=jet/6*6.283+.5, k=((t*.85+(i/DROPS)*7.3)%1), r=k*(3.2+4*lvl), y=4.8+k*5.2*lvl-k*k*(5.2*lvl+4.8); const on=lvl>.05; D.position.set(Math.cos(a)*r,Math.max(.1,y),Math.sin(a)*r*.55); D.scale.setScalar(on?.5+.8*lvl:0); D.rotation.set(0,0,0); D.updateMatrix(); drops.setMatrixAt(i,D.matrix); } drops.instanceMatrix.needsUpdate=true;
 trees.forEach((tr,i)=>{ const b=tr.userData.burn, f=ss(b,b+2.5,T)*(1-ss(b+7,b+11,T)), top=tr.userData.top, gone=ss(b+4,b+10,T); top.scale.setScalar(Math.max(.001,1-gone)); fires[i].visible=f>.02; fires[i].userData.hs.forEach((h,n)=>{ h.scale.set(f*.9,f*(1+.35*Math.sin(t*17+n*2.1+i)),f*.9); }); });
 lamps.forEach(l=>{ l.rotation.z=l.userData.s*.32*ss(66+l.userData.o*2,82,T); });
 crates.forEach(c=>c.material.color.copy(c.userData.base).lerp(C(0x32241f),ss(58,78,T)));
 win.forEach((w,i)=>{ const fire=ss(62+w.seed*14,66+w.seed*14,T), base=C(w.lit?0xf3c94e:0x58759b).lerp(C(0x2c2a30),ss(45,72,T)*.8); if(fire>0) base.lerp(C(0xff6a1a).multiplyScalar(.75+.25*Math.sin(t*9+i)),fire*(w.seed>.45?1:0)); wins.setColorAt(i,base); }); wins.instanceColor.needsUpdate=true;
 clouds.forEach((c,i)=>{ c.position.x+=0; c.userData.m.color.copy(C(0xe6b49c).lerp(C(0x4a2a24),ss(55,80,T))); c.scale.setScalar(1-.75*ss(40,70,T)); });
 const away=ss(35,46,T); birds.forEach((b,i)=>{ const [x,y,z]=b.userData.o; b.position.set(x+Math.sin(t*.5+i)*2+away*(x<0?-30:30),y+Math.sin(t*.8+i)*.6+away*26,z); b.rotation.y=Math.sin(t*.3+i)*.7+i; b.userData.flap(Math.sin(t*9+b.userData.s)*.6); b.visible=away<.99; });
 crowd.forEach((c,i)=>{ const tl=T0+(c.leave-22)/60*(T1-T0), wt=Math.min(t,tl), rt=Math.max(0,t-tl), n=Math.hypot(...c.exit), x=c.p[0]+c.v[0]*wt+c.exit[0]/n*rt*rt*.0+c.exit[0]/n*rt*5.2, z=c.p[1]+c.v[1]*wt+c.exit[1]/n*rt*5.2, run=rt>0, dx=run?c.exit[0]:c.v[0], dz=run?c.exit[1]:c.v[1]; c.m.position.set(x,.05,z); c.m.rotation.y=Math.atan2(dx,dz); c.m.userData.pose(t*(run?15:6.5)+i,run?.95:.5); c.m.visible=rt<6; });
 let n=0; for(let i=0;i<130;i++){ const src=smokeSrc[i%6], start=60+(i%6)*2.6, on=ss(start,start+4,T), k=(t*.13+i*.0771)%1; D.position.set(src[0]+Math.sin(i*2.3)*k*7+k*14,src[1]+k*48,src[2]+Math.cos(i)*2); const sc=on*(1.2+k*7); D.scale.setScalar(Math.max(.001,sc*(1-.25*k))); D.rotation.set(i,i*.6,k*2); D.updateMatrix(); sm.setMatrixAt(i,D.matrix); } sm.instanceMatrix.needsUpdate=true; sm.material.color.copy(C(0x5a4a44).lerp(C(0x241f20),hot));
 const eOn=ss(58,70,T); seeds.forEach((q,i)=>{ const k=(t*(.12+q[3]*.16)+q[0])%1; D.position.set((q[1]-.5)*34+Math.sin(t+i)*1.2,k*26,q[2]*30-18); D.scale.setScalar(eOn*(i%2?.8:1.25)*(k<.92?1:0)); D.updateMatrix(); emb.setMatrixAt(i,D.matrix); }); emb.instanceMatrix.needsUpdate=true;
 crD.forEach((c,i)=>{ const g=ss(c.T,c.T+5,T); D.position.set(c.x,.075,c.z); D.rotation.set(0,c.a,0); D.scale.set(Math.max(.001,g*c.r),1,Math.max(.001,g*c.r*c.sx)); D.updateMatrix(); crk.setMatrixAt(i,D.matrix); }); crk.instanceMatrix.needsUpdate=true; D.rotation.set(0,0,0);
 const prog=t/DUR, shake=ss(62,82,T)*.05; cam.position.set(Math.sin(t*23)*shake,2.25+Math.cos(t*19)*shake,35.5-6.5*prog); cam.lookAt(0,8.4,-30);
 const tit=1-ss(3.1,3.8,t); $('title').style.opacity=tit*ss(0,.5,t); $('n').textContent=Math.round(T);
 const col=C(0xffffff).lerp(C(0xffb066),ss(38,56,T)).lerp(C(0xff5a30),ss(60,80,T)); $('n').parentElement.style.color='#'+C(0xffffff).lerp(C(0xffd2a6),ss(40,70,T)).getHexString();
 $('stage').textContent=[...stages].reverse().find(x=>T>=x[0]-.01)[1]; $('el').textContent='ELAPSED '+String(Math.floor((T-22)/10+1e-6)).padStart(2,'0')+' MIN';
 $('fill').style.height=((T-22)/60*94+6)+'%'; $('fill').style.background='#'+col.getHexString(); $('vig').style.opacity=ss(45,82,T)*.9;
 renderer.render(scene,cam); };
window.renderAt(0); window.ready=true;
