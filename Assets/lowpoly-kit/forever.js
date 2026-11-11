import * as THREE from 'three';
import { rng, flat, shadow, ss, rock, roundTree, pine, person, woman, car, lamp, skyDome, softSun, lights, tower, house, townHall, deer, bird } from './kit.js';
const TL=await (await fetch('/forever_timeline.json')).json(), SEG=TL.segments, R=rng(123), $=id=>document.getElementById(id), DUR=TL.duration, S=i=>SEG[i].start;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(60,1080/1920,.2,4000), D=new THREE.Object3D(), C=h=>new THREE.Color(h), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf2c4ad,120,700); const sky=skyDome(sc,0x7f91d8,0xf2c4ad), sun=softSun(sc,-80,90,-400,90), lt=lights(sc,110); lt.d.shadow.camera.far=400;
const add=(p,o,x=0,y=0,z=0,ry=0)=>{ o.position.set(x,y,z); o.rotation.y=ry; p.add(o); return o; };
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const groundM=flat(0x6fbf4f), riverM=flat(0x4b9df0), hillM=flat(0x5fae46); bx(sc,4000,.04,4000,groundM,0,-.02,0).castShadow=false; const river=bx(sc,800,.06,12,riverM,0,.03,-8); river.castShadow=false;
const hill=new THREE.Mesh(rock(16,2,R,.05),hillM); hill.scale.set(1,.4,1); hill.position.set(0,0,30); hill.receiveShadow=true; sc.add(hill); const TOP=6.35, EYE=new THREE.Vector3(0,TOP+1.65,19.5);
const leaf=[flat(0x2c7f3d),flat(0x3f9a48),flat(0x1f6a3a)], bark=flat(0x6b4a33), pineM=flat(0x1f6a3a), pal=[0xb8a2e6,0xf6b172,0x7ec4bc,0xf0a79d,0xa9b4d8,0xeaa985,0xc2a8e2,0xf2ede1];
const G=[...Array(8)].map(()=>{ const g=new THREE.Group(); sc.add(g); return g; }); const town=new THREE.Group(), modern=new THREE.Group(); sc.add(town); sc.add(modern);
// --- town (eras 0-1)
for(let i=0;i<26;i++){ const far=i<16, x=far?-66+(i%16)*9+(R()-.5)*2:(i%2?1:-1)*(14+Math.floor((i-16)/2)*8), z=far?-22-Math.floor(R()*3)*9:8+R()*4; const h=house(pal[i%8],[0x9a4f3a,0x4b5a78,0x6b4a3a,0x8a3a3a][i%4]); add(town,h,x,0,z,far?0:Math.PI); }
add(town,townHall(),-18,0,-42); bx(town,4,1,16,0xb8a690,0,1,-8); for(const z of [-15.5,-.5]) bx(town,4.4,2.2,1,0xa89680,0,.6,z); for(let x=-80;x<80;x+=14) add(town,roundTree(R,leaf,bark,1.1),x+R()*4,0,-14-R()*3,R()*6);
bx(town,800,.04,5,0x54565f,0,.05,-17).castShadow=false; const tcars=[...Array(4)].map((_,i)=>add(town,car([0xd64f4f,0x3f78c4,0xefc14d,0x4fa28f][i]),0,.05,-17+(i%2?1.2:-1.2),Math.PI/2));
const folk=[...Array(8)].map((_,i)=>{ const m=i%2?woman({shirt:pal[i%8]}):person({shirt:pal[(i+3)%8],pants:0x394a6e}); town.add(m); return m; });
for(let i=0;i<5;i++) modern.add(tower(R,-60+i*28,-58-R()*10,14,30+R()*30,12,pal[i]));
const graves=new THREE.Group(); for(let i=0;i<8;i++){ const st=bx(graves,.7,1,.18,0xb8b2a8,-5+(i%4)*1.4,TOP-.4+.5,15.3+Math.floor(i/4)*1.3); st.rotation.y=(R()-.5)*.1; const fl=bx(graves,.18,.14,.18,[0xd64f4f,0xefc14d,0xe88fb0][i%3],-5+(i%4)*1.4+.3,TOP-.3,15.55+Math.floor(i/4)*1.3); } sc.add(graves);
// --- megacity (era 2)
const mega=G[2]; for(let i=0;i<60;i++){ let x,z; do{ x=(R()-.5)*260; z=-20-R()*200; } while(Math.abs(x)<8&&z>-30); const h=40+R()*R()*160; mega.add(tower(R,x,z,12+R()*10,h,12+R()*10,pal[i%8])); } for(let i=0;i<14;i++){ let x=(R()-.5)*120, z=16+R()*30; if(Math.abs(x)<22) x+=x<0?-22:22; mega.add(tower(R,x,z,12,30+R()*60,12,pal[(i+2)%8])); }
for(let i=0;i<6;i++) bx(mega,40,1.2,2,0xdfe6ee,-60+i*24,30+i*8,-60-i*12);
const fly=new THREE.InstancedMesh(new THREE.BoxGeometry(2.4,.8,1.2),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),60); fly.frustumCulled=false; mega.add(fly); const fd=[...Array(60)].map((_,i)=>{ fly.setColorAt(i,C(pal[i%8])); return [R()*400,15+R()*60,-20-R()*160,(R()<.5?1:-1)*(10+R()*20)]; });
bx(mega,800,2.4,1.5,0xc9c1b5,0,1.2,-1.5); bx(mega,800,2.4,1.5,0xc9c1b5,0,1.2,-14.5);
// --- ruins (era 3)
const ruins=G[3]; for(let i=0;i<40;i++){ const x=(R()-.5)*240, z=-22-R()*180; const t=tower(R,x,z,12+R()*8,8+R()*30,12,[0x9a958c,0x8a8478,0xa8a296][i%3]); t.rotation.set((R()-.5)*.15,R()*.5,(R()-.5)*.15); ruins.add(t); } for(let i=0;i<90;i++){ const t=i%3?roundTree(R,leaf,bark,1+R()*.8):pine(R,pineM,bark,1.6+R()); add(ruins,t,(R()-.5)*220,0,-14-R()*150,R()*6); }
const vines=new THREE.InstancedMesh(rock(1,0,R,.25),flat(0x3f8a3a),500); vines.frustumCulled=false; ruins.add(vines); for(let i=0;i<500;i++){ D.position.set((R()-.5)*240,R()*2,-22-R()*180); D.scale.setScalar(1+R()*2); D.rotation.set(R(),R(),R()); D.updateMatrix(); vines.setMatrixAt(i,D.matrix); }
// --- wild valley (era 4)
const wild=G[4]; for(let i=0;i<200;i++){ const t=i%2?roundTree(R,leaf,bark,1+R()*.9):pine(R,pineM,bark,1.7+R()*1.2); let x=(R()-.5)*300, z=-14-R()*220; add(wild,t,x,0,z,R()*6); } for(const s of [-1,1]) for(let i=0;i<8;i++){ const m=new THREE.Mesh(rock(40+R()*20,1,R,.15),flat(0x8a7a62)); m.scale.set(1.4,.6,.6); m.position.set(-280+i*80,0,s>0?-150:-260); m.castShadow=true; wild.add(m); }
const deers=[...Array(4)].map((_,i)=>add(wild,deer(i===0),-6+i*3,0,7+R()*3,R()*6)); const wb=[...Array(6)].map((_,i)=>{ const b=bird(new THREE.MeshBasicMaterial({color:0x232c52,side:THREE.DoubleSide})); wild.add(b); return b; });
// --- supercontinent volcanoes (era 5)
const volc=G[5]; const lavaM=new THREE.MeshBasicMaterial({color:0xff6a1f,fog:false}); for(let i=0;i<9;i++){ const r=30+R()*40, h=40+R()*70, x=-220+i*55+(R()-.5)*20, z=-120-R()*120; const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,7),flat(0x4a3a36)); m.position.set(x,h/2-2,z); m.castShadow=true; volc.add(m); if(i%2===0){ const cr=new THREE.Mesh(new THREE.CylinderGeometry(r*.18,r*.12,2,8),lavaM); cr.position.set(x,h-1.5,z); volc.add(cr); m.userData.top=[x,h,z]; volc.userData.tops=(volc.userData.tops||[]).concat([[x,h,z]]); } }
for(let i=0;i<6;i++){ const m=new THREE.Mesh(rock(10+R()*12,1,R,.25),flat(0x5a4640)); m.scale.y=.7; m.position.set((R()-.5)*120,0,-30-R()*60); m.castShadow=true; volc.add(m); } const lava=bx(volc,6,.08,200,lavaM,-20,.1,-110); lava.rotation.y=.4; const lava2=bx(volc,4,.08,140,lavaM,40,.1,-90); lava2.rotation.y=-.5;
const smoke=new THREE.InstancedMesh(rock(1,0,R,.1),new THREE.MeshLambertMaterial({color:0x3a3030,flatShading:true,transparent:true,opacity:.75,depthWrite:false}),160); smoke.frustumCulled=false; volc.add(smoke);
// --- desert (era 6)
const des=G[6]; const crk=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.02,.12),new THREE.MeshBasicMaterial({color:0x8a6a4a}),900); for(let i=0;i<900;i++){ D.position.set((R()-.5)*160,.06,10-R()*140); D.rotation.set(0,R()*3.14,0); D.scale.set(1+R()*3,1,1); D.updateMatrix(); crk.setMatrixAt(i,D.matrix); } des.add(crk); for(let i=0;i<12;i++){ const st=bx(des,.4,1.4+R(),.4,0x6b5a48,(R()-.5)*60,.7,-10-R()*60); st.rotation.z=(R()-.5)*.4; } for(let i=0;i<7;i++){ const m=new THREE.Mesh(rock(30+R()*30,1,R,.1),flat(0xc89a68)); m.scale.y=.5; m.position.set(-240+i*80,-6,-200-R()*80); des.add(m); }
// --- red giant (era 7)
const red=G[7]; for(let i=0;i<14;i++){ const m=new THREE.Mesh(rock(6+R()*14,1,R,.25),flat(0x5a2a22)); m.scale.y=.55; m.position.set((R()-.5)*200,0,-20-R()*160); m.castShadow=true; red.add(m); }
const giant=softSun(red,0,140,-1500,2600,0xff4a1a);
const SH=SEG.map((s,i)=>[s.start===.35?0:s.start,i<7?SEG[i+1].start:DUR]); window.SHOTS=SH; window.DURATION=DUR;
const E=[ // sky top, sky low, ground, hill, river, sun pos, sun color, sun scale, light color, light int, hemi
 [0x7f91d8,0xf2c4ad,0x6fbf4f,0x5fae46,0x4b9df0,[-80,90,-400],0xfff2a0,90,0xfff0d0,1.5,2.5],
 [0x7a88cc,0xf0b89a,0x6fbf4f,0x5fae46,0x4b9df0,[-140,50,-400],0xffd080,100,0xffd8b0,1.4,2.3],
 [0x8a9ad8,0xe8c0b8,0x9a9aa0,0x5fae46,0x4a8ac8,[60,110,-400],0xfff2a0,80,0xfff0e0,1.5,2.5],
 [0x7f91d8,0xf2d0b0,0x7aa858,0x6aa04a,0x4b9df0,[-60,80,-400],0xfff2a0,90,0xfff0d0,1.5,2.4],
 [0x6f9ae0,0xf0d8c0,0x5f9e42,0x5a9a40,0x3f8ad8,[100,100,-400],0xfff2a0,90,0xfff0d0,1.6,2.4],
 [0x5a4a5a,0xd8805a,0x4a3a36,0x5a4640,0x2a2220,[-40,60,-400],0xffb070,120,0xffa070,1.3,1.8],
 [0x8fa6cc,0xe8cfa4,0xe0c08a,0xd0aa78,0xb8946a,[0,180,-400],0xffffff,220,0xfff8e8,2,2.6],
 [0x3a1018,0xd84a22,0x5a2a22,0x4a2420,0x3a1a16,[0,140,-1500],0xff4a1a,2600,0xff7a4a,1.5,1.5]];
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=7; const u=(t-SH[k][0])/(SH[k][1]-SH[k][0]), e=E[k];
 sky.top.value.set(e[0]); sky.low.value.set(e[1]); sc.fog.color.set(e[1]); sc.fog.far=k===6?500:k===7?1800:700; groundM.color.set(e[2]); hillM.color.set(e[3]); riverM.color.set(e[4]); river.scale.z=k===4?2:k>=6?1.3:1; sun.visible=k!==7; sun.position.set(...e[5]); sun.material.color.set(e[6]); sun.scale.setScalar(e[7]); lt.d.color.set(e[8]); lt.d.intensity=e[9]; lt.h.intensity=e[10]; lt.d.position.set(e[5][0]*.3,120,e[5][2]*.3+80);
 G.forEach((g,i)=>g.visible=i===k); town.visible=k<=1; modern.visible=k===1; graves.visible=k===1;
 tcars.forEach((c,i)=>{ c.position.x=((i*40+t*(i%2?6:-6))%160+160)%160-80; c.rotation.y=i%2?Math.PI/2:-Math.PI/2; }); folk.forEach((m,i)=>{ const x=((i*20+t*(i%2?1.2:-1.2))%120+120)%120-60; m.position.set(x,.05,-19.8-(i%3)*.4); m.rotation.y=i%2?Math.PI/2:-Math.PI/2; m.userData.pose(t*6.5+i,.5); m.visible=k===0||(k===1&&i%3===0); });
 if(k===2) fd.forEach((q,i)=>{ D.position.set(((q[0]+t*q[3])%400+400)%400-200,q[1],q[2]); D.rotation.set(0,0,0); D.scale.setScalar(1); D.updateMatrix(); fly.setMatrixAt(i,D.matrix); }), fly.instanceMatrix.needsUpdate=true;
 if(k===4){ deers.forEach((d,i)=>{ d.userData.graze(.5+.5*Math.sin(t+i)); }); wb.forEach((b,i)=>{ const a=t*.3+i; b.position.set(Math.cos(a)*30,30+i*2,-40+Math.sin(a)*20); b.rotation.y=-a; b.userData.flap(Math.sin(t*8+i)*.6); }); }
 if(k===5){ const tops=volc.userData.tops; for(let i=0;i<160;i++){ const tp=tops[i%tops.length], q=(t*.08+i*.0137)%1; D.position.set(tp[0]+Math.sin(i)*q*20+q*30,tp[1]+q*90,tp[2]); D.scale.setScalar(4+q*22); D.rotation.set(i,i*.3,q); D.updateMatrix(); smoke.setMatrixAt(i,D.matrix); } smoke.instanceMatrix.needsUpdate=true; }
 const yaw=[lg(.35,-.1,u),lg(.5,.1,u),lg(-.3,.2,u),lg(.2,-.25,u),lg(-.2,.25,u),lg(.25,-.15,u),lg(-.1,.1,u),lg(.15,0,u)][k], pitch=[-.12,-.2,.08,-.08,-.06,.02,.05,lg(.04,.12,u)][k];
 cam.position.copy(EYE).add(new THREE.Vector3(0,Math.sin(t*1.1)*.012,0)); cam.rotation.order='YXZ'; cam.rotation.set(pitch,yaw,0);
 renderer.render(sc,cam);
 const seg=SEG[k]; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=seg.num==='NOW'?'0':seg.num; $('u').textContent=seg.num==='NOW'?'YEARS':seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 const dip=k>0?1-ss(0,.45,t-SH[k][0]):0; $('fla').style.background='#000'; $('fla').style.opacity=dip*.75; $('fade').style.opacity=ss(DUR-.5,DUR,t); };
window.renderAt(0); window.ready=true;
