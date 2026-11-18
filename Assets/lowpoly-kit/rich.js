import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { rng, flat, shadow, ss, person, woman, car, lamp, skyDome, roundTree, textSign, house, shop, marketStall, mailbox, fence, crane, bench } from './kit.js';
const TL=await (await fetch('/rich_timeline.json')).json(), SEG=TL.segments, R=rng(2611), $=id=>document.getElementById(id), DUR=TL.duration, NS=SEG.length;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(50,1080/1920,.05,5000), D=new THREE.Object3D(), C=h=>new THREE.Color(h), V=(x,y,z)=>new THREE.Vector3(x,y,z), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf2d8c0,90,520); const sky=skyDome(sc,0x7f9ad8,0xf2d8c0);
const hemi=new THREE.HemisphereLight(0xdfe8ff,0x5a4a3a,1.4); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xffe8c8,1.6); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-50,right:50,top:50,bottom:-50,near:1,far:400}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.06; sc.add(sunL); sc.add(sunL.target);
const composer=new EffectComposer(renderer); composer.setSize(1080,1920); composer.addPass(new RenderPass(sc,cam)); const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.12,.4,.97); composer.addPass(bloom); composer.addPass(new OutputPass());
const bx=(p,w,h,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const glowM=(c,o={})=>new THREE.MeshBasicMaterial({color:c,...o});
// ---------- characters
const face=p=>{ const h=p.children[1], dk=flat(0x1a1210), f=(w,hh,x,y,m=dk)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.02),m); b.position.set(x,y,.18); h.add(b); return b; }; const br=[];
 for(const s of [-1,1]){ f(.065,.055,s*.085,.035); const w=f(.022,.02,s*.085+.012,.045,flat(0xffffff)); w.position.z=.192; br.push(f(.09,.025,s*.085,.095)); } p.userData.brows=br; p.userData.mouth=f(.09,.025,0,-.085,flat(0x6a3a30)); return p; };
const mood=(p,m)=>{ const rz={flat:0,sad:.4,happy:-.15,shock:-.1,calm:-.05}[m], my={flat:1,sad:1,happy:2.6,shock:3.2,calm:1.6}[m], mx={flat:1,sad:.7,happy:1.3,shock:.6,calm:1.2}[m]; p.userData.brows.forEach((q,i)=>{ q.rotation.z=(i?-1:1)*rz; }); p.userData.mouth.scale.set(mx,my,1); };
const arms=(p,a,b=a)=>{ p.children[5].rotation.set(a,0,0); p.children[6].rotation.set(b,0,0); };
const reset=p=>{ p.visible=true; p.rotation.set(0,0,0); p.userData.pose(0,0); arms(p,0); p.children[1].rotation.set(0,0,0); p.children[0].position.y=1.25; mood(p,'calm'); };
const hero=face(person({shirt:0x3f78c4,pants:0x2a2f3a,hair:0x3a2418,skin:0xd9a27a})); sc.add(hero);
const phone=new THREE.Mesh(new THREE.BoxGeometry(.1,.18,.02),glowM(0x9fe8ff)); hero.children[6].add(phone); phone.position.set(0,-.74,.1); phone.rotation.x=1.2;
const cup=bx(hero.children[6],.12,.16,.12,0xf2efe6,0,-.76,.1); cup.visible=false;
const baker=face(woman({shirt:0xf6f2ea,pants:0x6a5a4a,hair:0x2a1a12,skin:0xb8805a})); sc.add(baker); bx(baker,.4,.24,.4,0xffffff,0,2.12,0);
const barista=face(person({shirt:0x2a2c32,pants:0x2a2f3a,hair:0x7a4a28,skin:0xe2b48a})); sc.add(barista); const apron=bx(barista,.5,.9,.04,0xd88a3a,0,1.15,.17);
// pedestrians
const shirts=[0xd64f4f,0xefc14d,0x4fa28f,0xb8a2e6,0xf09a4a,0x7ec4bc,0xf0a79d,0x5a6a7a,0x9a4f8a,0x3f9a48], skins=[0xd9a27a,0x8a5a3a,0xe8c09a,0xb8805a,0x6a4028];
const peds=[...Array(12)].map((_,i)=>{ const p=face((i%2?woman:person)({shirt:shirts[i%10],pants:[0x2a2f3a,0x3a4a6a,0x5a4a3a][i%3],skin:skins[i%5],hair:[0x2a1a12,0x6a3a20,0xc8a060,0x1a1a1a][i%4]})); sc.add(p); const box=bx(p,.7,.6,.5,[0xc8a070,0x2a2c32,0xe8e4dc][i%3],0,1.25,.5); box.visible=false; return {p,box,x0:-40+R()*80,z:i%2?-6.6:-5.4,dir:i%3?1:-1,sp:1.2+R()*.6}; });
// ---------- world
const world=new THREE.Group(); sc.add(world);
const grassM=flat(0x7ab05a); bx(world,900,.04,700,grassM,0,-.04,-100).castShadow=false;
const roadM=flat(0x5a5c62); bx(world,170,.06,9,roadM,40,.01,0).castShadow=false; for(let i=0;i<24;i++) bx(world,2.4,.02,.2,0xf2efe6,-38+i*7,.05,0).castShadow=false;
const paveM=flat(0xd8d0c0); bx(world,170,.2,4,paveM,40,.1,-6.5); bx(world,170,.2,4,paveM,40,.1,6.5);
// shops (north side)
const shopSign=(txt,x,bg)=>{ const s=textSign(txt,5,1,bg,'#ffffff'); s.position.set(x,5.4,-8.75); world.add(s); return s; };
const bakery=shop(12,0xf2d8b0,0xe8903a); bakery.position.set(-24,0,-13); world.add(bakery); shopSign('BAKERY',-24,'#c8702a');
const cafe=shop(10,0x7ec4bc,0x2a6a64); cafe.position.set(-8,0,-13); world.add(cafe); shopSign('COFFEE',-8,'#2a6a64');
const mart=shop(14,0xf0a79d,0xd64f4f); mart.position.set(9,0,-13); world.add(mart); shopSign('MART',9,'#b8403a');
const closed=textSign('CLOSED',1.6,.6,'#d64f4f','#ffffff'); closed.position.set(-5.3,2,-8.8); world.add(closed);
// bread stall in front of the bakery
const breadStall=marketStall(6,0xe8903a,[0xd89a52,0xc07a3a,0xe8b870],R,{shutter:false}); breadStall.position.set(-24,0,-6.8); world.add(breadStall);
const fresh=textSign('FRESH BREAD',3.2,.5,'#e8903a','#ffffff'); fresh.position.set(-24,3.0,-5.1); world.add(fresh); const sold=textSign('SOLD OUT',3.2,.5,'#d64f4f','#ffffff'); sold.position.set(-24,3.0,-5.08); world.add(sold);
// cafe price board (A-frame)
const board=new THREE.Group(); board.position.set(-4.2,.2,-6.2); world.add(board); bx(board,1.4,2,.1,0x3a2a20,0,1,-.15).rotation.x=-.12;
const prices=['COFFEE\n$5','COFFEE\n$50','COFFEE\n$500','COFFEE\n$5,000,000'].map(s=>{ const t=textSign(s,1.2,1.2,'#1f2a24','#f6f2ea'); t.position.set(0,1.3,-.08); t.rotation.x=-.12; board.add(t); return t; });
// bus stop + bus
const busStop=new THREE.Group(); busStop.position.set(2,.2,-6.6); world.add(busStop); bx(busStop,3,.1,1.4,0x2a6a64,0,2.6,0); for(const x of [-1.4,1.4]) bx(busStop,.1,2.6,.1,0x6a6e78,x,1.3,-.6); bx(busStop,2.8,1.6,.05,new THREE.MeshLambertMaterial({color:0xbfe2ea,transparent:true,opacity:.5}),0,1.4,-.65);
const bus=new THREE.Group(); world.add(bus); bx(bus,10,2.6,2.6,0xefc14d,0,1.7,0); bx(bus,9.4,.8,2.64,0x9fc6d8,.2,2.2,0); bx(bus,10.1,.4,2.7,0x3a3f49,0,.55,0); for(const x of [-3.2,3.2]) for(const z of [-1.3,1.3]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.3,12),flat(0x22262e)); w.rotation.x=Math.PI/2; w.position.set(x,.5,z); bus.add(w); }
// homes (north side, east of the shops) with lawns and mailboxes
const pal=[0xf6b172,0xf2e6c8,0xa9b4d8,0xeaa985,0xd8e4ec,0xb8a2e6], homes=[], panels=[];
for(let i=0;i<6;i++){ const x=28+i*13, h=house(pal[i],[0x9a4f3a,0x4b5a78,0x6b4a3a][i%3]); h.position.set(x,0,-15); world.add(h); homes.push(h); bx(world,1.4,.04,6,0xbab4a8,x,.03,-9.5).castShadow=false; const mb=mailbox([0x3f78c4,0xd64f4f,0x4fa28f][i%3]); mb.position.set(x-2.2,.2,-5.6); world.add(mb); for(const s of [-1,1]){ const f=fence(4.6); f.position.set(x+s*3.6,0,-8.3); world.add(f); }
 for(const sd of [-1,1]) for(const sz of [-1.6,1.6]){ const p=bx(world,2.6,.08,1.4,new THREE.MeshLambertMaterial({color:0x1a2a5a,emissive:0x0a1430}),x+sd*2.06,6.12,-15+sz); p.rotation.z=-sd*.576; p.visible=false; panels.push(p); } }
// south side houses (facing the street)
for(let i=0;i<10;i++){ const h=house(pal[(i+3)%6],[0x6b4a3a,0x9a4f3a,0x4b5a78][i%3]); h.position.set(-30+i*13,0,15); h.rotation.y=Math.PI; world.add(h); homes.push(h); }
const newHouse=new THREE.Group(); newHouse.position.set(106,0,-15); world.add(newHouse); const nh=house(0xf2e6c8,0x4b5a78); newHouse.add(nh); const cr=crane(16); cr.position.set(112,0,-22); world.add(cr);
const lamps=[]; for(let i=0;i<9;i++){ const l=lamp(flat(0x2a2c32),glowM(0xffe2a0)); l.position.set(-34+i*18,.2,-4.9); world.add(l); lamps.push(l); }
for(let i=0;i<40;i++){ const t=roundTree(R,[flat(0x3f8a48),flat(0x2c7f3d),flat(0x5aa04a)],flat(0x6b4a33),1); t.position.set(-40+R()*160,0,R()<.5?-24-R()*30:24+R()*20); t.scale.setScalar(.7+R()*.5); world.add(t); }
for(let i=0;i<8;i++){ const t=roundTree(R,[flat(0x4a9a48)],flat(0x6b4a33),.7); t.position.set(28+i*13*.75+ (i%2?6:-6),0,-7.4); if(t.position.x<104) world.add(t); }
const cars=[[-30,2.4,0xd64f4f,1],[10,-2.4,0x3f78c4,-1],[40,2.4,0xf2efe6,1],[70,-2.4,0x4fa28f,-1],[-10,2.4,0xefc14d,1]].map(([x,z,c,d])=>{ const k=car(c); k.rotation.y=d*Math.PI/2; world.add(k); return {k,x,z,d}; });
const newCars=[0xff3a5a,0x2a2c32,0xf6f2ea].map(c=>{ const k=car(c); k.rotation.y=Math.PI/2; k.traverse(o=>{ if(o.material&&o.material.emissive) o.material=o.material.clone(); }); world.add(k); return k; });
const bigTV=bx(world,1.8,1.1,.15,0x1a1c22,0,0,0);
const bnch=bench(); bnch.scale.setScalar(.5); bnch.position.set(-12,.2,-5.3); world.add(bnch);
// wheelbarrow of cash
const barrow=new THREE.Group(); world.add(barrow); bx(barrow,1,.45,1.4,0x6a7a8a,0,.75,0); const wh=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.12,10),flat(0x22262e)); wh.rotation.z=Math.PI/2; wh.position.set(0,.3,.85); barrow.add(wh); for(const s of [-1,1]){ bx(barrow,.08,.08,1.4,0x6b4a33,s*.35,.85,-1.1); bx(barrow,.08,.6,.08,0x6a7a8a,s*.35,.3,-.3); }
for(let i=0;i<18;i++) bx(barrow,.32,.12,.16,0x6fbf6a,-.3+(i%3)*.3,1.02+Math.floor(i/9)*.13,-.5+Math.floor((i%9)/3)*.4).rotation.y=(i*.7)%0.4;
// banknotes
const NB=420, notes=new THREE.InstancedMesh(new THREE.PlaneGeometry(.32,.15),new THREE.MeshLambertMaterial({color:0x7fcf72,side:THREE.DoubleSide,emissive:0x1a3a18}),NB); notes.frustumCulled=false; sc.add(notes); const nd=[...Array(NB)].map(()=>[R(),R(),R(),R(),R()]);
// ---------- Kenyan market (west end, red earth)
const mk=new THREE.Group(); mk.position.set(-90,0,0); world.add(mk); bx(mk,60,.06,40,0xc8875a,0,.02,-6).castShadow=false;
const shack=(x,z,c)=>{ const g=new THREE.Group(); g.position.set(x,0,z); mk.add(g); bx(g,5,3,4,c,0,1.5,0); const r=bx(g,5.6,.12,4.8,0x9aa0a8,0,3.15,.2); r.rotation.x=-.12; bx(g,1,2,.1,0x3a6a8a,0,1,2.02); return g; };
shack(-14,-14,0xe8d8b8); shack(-6,-15,0x7ec4bc); shack(10,-14,0xf2c88a); shack(17,-15,0xe8a0a0);
const st1=marketStall(5,0x3f9a48,[0xd64f4f,0xefc14d,0x7fbf4f],R,{shutter:false}); st1.position.set(-6,0,-6); mk.add(st1);
const st2=marketStall(5,0xd64f4f,[0xf09a4a,0x7fbf4f,0xb84a8a],R,{shutter:false}); st2.position.set(6,0,-6); mk.add(st2);
const st3=marketStall(5,0x3f78c4,[0xefc14d,0xd64f4f,0x9a6a3a],R,{shutter:false}); st3.position.set(0,0,-12); mk.add(st3);
const mkSign=textSign('NEW STALL',2.6,.5,'#3f78c4','#ffffff'); mkSign.position.set(0,3.05,-10.35); mk.add(mkSign);
for(let i=0;i<12;i++){ const t=roundTree(R,[flat(0x6a9a3a),flat(0x5a8a32)],flat(0x6b4a33),1.3); t.position.set(-28+R()*56,0,-22-R()*16); mk.add(t); }
const vend=[0,1,2].map(i=>{ const p=face(woman({shirt:[0xefc14d,0xd64f4f,0x3f9a48][i],pants:0x3a2a2a,skin:0x6a4028,hair:0x1a1a1a})); mk.add(p); return p; });
const buyers=[0,1,2,3,4].map(i=>{ const p=face((i%2?person:woman)({shirt:shirts[(i+3)%10],pants:0x2a2f3a,skin:[0x5a3420,0x6a4028,0x7a4a30][i%3],hair:0x1a1a1a})); mk.add(p); return p; });
// ======================= timeline
const SH=[]; SEG.forEach((s,i)=>{ const a=i?s.start:0, b=i<NS-1?SEG[i+1].start:DUR; SH.push([a,b]); }); window.SHOTS=SH; window.DURATION=DUR;
const P=(a,b,c,d,u)=>{ cam.position.lerpVectors(V(...a),V(...b),u); cam.lookAt(V(...c).lerp(V(...(d||c)),u)); };
const LOOK={ dawn:[0x6a8ad0,0xf2c8a8,[-200,60,200],0xffd0a0,1.4,1.2,0xf2c8a8,'saturate(.95)'], day:[0x6f9ae0,0xf2e2c8,[-120,140,120],0xfff0d8,1.7,1.5,0xf2e2c8,'saturate(1.05)'],
 warm:[0x6aa0e0,0xf8d8a8,[-100,120,90],0xffe0b0,1.8,1.4,0xf2d8b0,'saturate(1.08)'], dusk:[0x4a4a88,0xf0a070,[200,40,120],0xffa060,1.4,1.1,0xe0a080,'saturate(1)'], grey:[0x8a94a8,0xc8c4c0,[-100,120,100],0xe8e4e0,1,1.2,0xc0c0c4,'saturate(.45)'] };
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=NS-1; const T0=SH[k][0], u=(t-T0)/(SH[k][1]-T0), sub=(a,b)=>ss(0,1,(u-a)/(b-a));
 let lk='day', price=0, rain=0, litter=0, crowd=0, carry=false, queue=0, loaves=1, isSold=false, isClosed=false, busOn=false, panelsOn=false, build=0, newStall=0, numTxt=null;
 [hero,baker,barista].forEach(reset); phone.visible=false; cup.visible=false; barrow.visible=false; bigTV.visible=false; apron.visible=true; peds.forEach(q=>{ reset(q.p); q.p.visible=false; q.box.visible=false; }); newCars.forEach(c=>c.visible=false);
 hero.position.set(28,.2,-7); baker.position.set(-24,.2,-8.3); barista.position.set(-6,.2,-8.6); cr.userData.jib.rotation.y=Math.sin(t*.3)*.6;
 switch(k){
 case 0: lk='dawn'; if(u<.4){ hero.visible=false; P([80,46,70],[44,16,30],[20,2,-12],[28,2,-10],sub(0,.4)); } else { const q=sub(.4,1); hero.position.set(28,.2,-7.6); phone.visible=true; arms(hero,0,-1.15); hero.children[1].rotation.x=.25*(1-ss(.3,.5,q)); mood(hero,q<.35?'flat':q<.6?'shock':'happy'); if(q>.6){ arms(hero,-2.6+Math.sin(t*8)*.2,-1.15); hero.position.y=.2+Math.abs(Math.sin(t*6))*.12; } rain=ss(.35,.55,q); P([28.3,2.1,-2.2],[28.2,1.9,-3],[28,1.5,-7.6],[28,1.6,-7.6],q); } break;
 case 1: queue=1; if(u<.5){ P([-18,4.4,6],[-20,3.6,3.6],[-24,1.6,-7],[-24,1.4,-7.4],sub(0,.5)); } else { const q=sub(.5,1); arms(baker,-.9,-.9); baker.children[1].rotation.y=Math.sin(t*1.6)*.25; mood(baker,'flat'); P([-21.4,1.9,-4.6],[-21.8,1.85,-5.2],[-24,1.5,-8.3],[-24,1.5,-8.3],q); } break;
 case 2: crowd=1; carry=true; loaves=1-sub(.45,.85); isSold=u>.82; if(u<.5){ hero.visible=false; const q=sub(0,.5); newCars.forEach((c,i)=>{ c.visible=true; c.position.set(lg(-30,10,q)+i*-9,0,-2.4); }); P([lg(-14,-4,q),3.9,4.6],[lg(-14,-4,q),3.9,4.6],[lg(-10,0,q),1.1,-6],[lg(-10,0,q),1.1,-6],0); } else { const q=sub(.5,1); hero.visible=false; mood(baker,q>.7?'sad':'shock'); arms(baker,-.4,-.4); P([-24.5,2.5,-2.2],[-24.3,2.2,-3.0],[-24,1.1,-7.2],[-24,1.4,-7.8],q); } break;
 case 3: { const q=u; price=q<.32?0:q<.62?1:2; hero.position.set(-5.4,.2,-5.7); hero.rotation.y=-.6; hero.children[1].rotation.y=-.5; mood(hero,price?'shock':'calm'); if(price===2) arms(hero,-.3,-.3); numTxt=['$5','$50','$500'][price]; P([-4.2,1.75,-.6],[-4.5,1.7,-1.4],[-4.9,1.45,-6],[-5,1.45,-6],q); } break;
 case 4: lk=u<.5?'day':'grey'; if(u<.5){ const q=sub(0,.5); barista.position.set(-6-q*4,.2,-8.2+q*1.6); barista.rotation.y=lg(0,-Math.PI/2,ss(.25,.45,q)); apron.visible=q<.3; if(q<.3){ arms(barista,-1.2,-1.2); mood(barista,'flat'); } else { barista.userData.pose(t*6,.45); mood(barista,'calm'); } hero.visible=false; P([-9.2,2,-2.6],[-10.4,2,-2.8],[-6.4,1.4,-8.4],[-9.4,1.4,-7.6],q); } else { const q=sub(.5,1); barista.visible=false; isClosed=true; busOn=true; hero.visible=false; P([-10,5,9],[-14,6,12],[-4,1.6,-6],[-6,2,-7],q); } break;
 case 5: lk='grey'; price=3; isClosed=true; litter=1; busOn=true; numTxt='79.6B%'; if(u<.6){ const q=sub(0,.6); barrow.visible=true; barrow.position.set(lg(-16,-8,q),.2,-5.6); barrow.rotation.y=Math.PI/2; hero.position.set(barrow.position.x-1.9,.2,-5.6); hero.rotation.y=Math.PI/2; hero.userData.pose(t*4.5,.3); arms(hero,-.75,-.75); mood(hero,'sad'); P([barrow.position.x-1.1,2.3,-.4],[barrow.position.x-1.1,2.3,-.4],[barrow.position.x-1.2,1.2,-5.6],[barrow.position.x-1.2,1.2,-5.6],0); } else { const q=sub(.6,1); barrow.visible=true; barrow.position.set(-6.4,.2,-5.6); barrow.rotation.y=Math.PI/2; hero.position.set(-8.3,.2,-5.6); hero.rotation.y=Math.PI*.15; mood(hero,'sad'); hero.children[1].rotation.x=.25; P([-2.6,.7,-1.4],[-3,.8,-2],[-4.6,1.3,-6.2],[-5.4,1.2,-6],q); } break;
 case 6: lk='warm'; newStall=sub(.35,.75); { const q=u; if(q<.5) P([-90+12,6,10],[-90+8,4.5,7],[-90,1.4,-8],[-90,1.4,-9],sub(0,.5)); else P([-90+1.2,2.4,-4.4],[-90+.6,2.2,-5],[-90,1.3,-12],[-90,1.3,-12],sub(.5,1)); } break;
 case 7: crowd=1; panelsOn=true; build=1; if(u<.55){ lk='day'; const q=sub(0,.55); hero.position.set(-5.6,.2,-5.4); hero.rotation.y=.3; cup.visible=true; arms(hero,0,-1.3); mood(hero,'happy'); barista.position.set(-7.4,.2,-6.6); barista.rotation.y=.5; arms(barista,-.4,0); mood(barista,'happy'); P([-3.2,2,-.6],[-3.8,1.9,-1.4],[-5.6,1.4,-6],[-5.8,1.4,-6],q); } else { lk='dusk'; const q=sub(.55,1); hero.visible=false; P([-6,6,10],[60,60,90],[0,2,-8],[50,4,-14],q); } break; }
 // ---- characters and props state
 if(k===5&&u>=.6) hero.rotation.y=Math.PI*.15;
 bnch.visible=k!==5; baker.visible=k<=2||k===7; if(k===7) mood(baker,'happy');
 barista.visible=barista.visible&&(k===4||k===7);
 const Q=[[-24.2,-4.6],[-24.4,-3.4],[-23.8,-2.2],[-24.3,-1],[-23.9,.2]]; if(queue){ peds.slice(0,5).forEach((q,i)=>{ q.p.visible=true; q.p.position.set(Q[i][0],.2,Q[i][1]); q.p.rotation.y=Math.PI; q.p.children[1].rotation.y=Math.sin(t*.8+i)*.3; mood(q.p,'happy'); }); }
 if(crowd){ peds.forEach((q,i)=>{ q.p.visible=true; const L=k===2?30:90, o=k===2?22:45; let x=(((k===2?q.x0*.33:q.x0)+q.dir*q.sp*t+o)%L+L)%L-o; q.p.position.set(x,.2,q.z); q.p.rotation.y=q.dir*Math.PI/2; q.p.userData.pose(t*q.sp*4+i,.4); mood(q.p,'happy'); if(carry&&i%3!==2){ q.box.visible=true; arms(q.p,-1.1); } }); }
 if(k===2&&u<.5){ bigTV.visible=true; const p=peds[1].p; bigTV.position.copy(p.position).add(V(0,2.2,0)); bigTV.rotation.y=p.rotation.y; }
 cars.forEach((c,i)=>{ c.k.visible=!(k===4&&u>=.5)&&k!==5; const L=180; const run=(k===0||k===6)?0:1; const x=((c.x+run*c.d*6*t+60)%L+L)%L-60; c.k.position.set(x,0,c.z); });
 bus.visible=busOn; bus.position.set(3,0,2.6);
 breadStall.userData.piles.forEach((p,i)=>{ p.visible=(i/breadStall.userData.piles.length)<loaves*(k===7?1:1); p.scale.setScalar(k===7?1.25:1); }); sold.visible=isSold||(k>=3&&k<=5); fresh.visible=!sold.visible;
 prices.forEach((p,i)=>p.visible=i===(k===7?0:price)); closed.visible=isClosed;
 panels.forEach(p=>p.visible=panelsOn); newHouse.scale.y=k===7?1:.001; newHouse.visible=k===7; cr.visible=k===7||k===6;
 st3.scale.set(1,Math.max(.001,newStall),1); st3.visible=k===6&&newStall>0; mkSign.visible=k===6&&newStall>.95; mk.visible=k===6;
 if(k===6){ vend.forEach((v,i)=>{ reset(v); v.position.set([-6,6,0][i],.06,[-7.4,-7.4,-13.4][i]); v.visible=i<2||newStall>.9; arms(v,-.6+Math.sin(t*3+i)*.3,-.6); mood(v,'happy'); }); buyers.forEach((b,i)=>{ reset(b); b.position.set([-6.4,-5.2,6.6,5,2.4][i],.06,[-3.6,-3.2,-3.7,-3,-9.8+ (1-newStall)*5][i]); b.rotation.y=Math.PI; b.visible=i<4||newStall>.6; arms(b,i%2?-.7:0); mood(b,'happy'); b.children[1].rotation.y=Math.sin(t+i)*.3; }); }
 // money rain / litter
 nd.forEach((q,i)=>{ let on=false; if(rain>0&&q[4]<rain){ on=true; const H=8; D.position.set(28+(q[0]-.5)*7,.15+(((q[1]*H)-t*1.3)%H+H)%H,-7.6+(q[2]-.5)*7); D.rotation.set(t*2+q[3]*9,t*1.5+q[1]*6,q[2]*6); } else if(litter&&q[4]<.75){ on=true; const L=40; const x=((q[0]*L+t*(2+q[3]*3))%L)-26; D.position.set(x,.12+Math.max(0,Math.sin(t*2+q[1]*9))*q[3]*1.4,-8+q[2]*12); D.rotation.set(t*3*q[3]+q[1]*6,q[2]*6,t*2*q[3]); } D.scale.setScalar(on?1:.0001); if(!on) D.position.set(0,-50,0); D.updateMatrix(); notes.setMatrixAt(i,D.matrix); }); notes.instanceMatrix.needsUpdate=true;
 if(cam.position.distanceTo(hero.getWorldPosition(V()).add(V(0,1.5,0)))<.6) hero.visible=false;
 // ---- look
 const L_=LOOK[lk]; sky.top.value.set(L_[0]); sky.low.value.set(L_[1]); sc.fog.color.set(L_[6]); sunL.position.set(...L_[2]).add(cam.position); sunL.target.position.copy(cam.position); sunL.color.set(L_[3]); sunL.intensity=L_[4]; hemi.intensity=L_[5]; $('c').style.filter=L_[7];
 lamps.forEach(l=>l.children[1].material.color.set(lk==='dusk'||lk==='dawn'?0xffe2a0:0x6a6a64)); grassM.color.set(lk==='grey'?0x8a9a6a:0x7ab05a);
 composer.render();
 // ---- HUD
 const seg=SEG[k]; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=numTxt||seg.num; $('u').textContent=seg.unit; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?:]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 const dip=k>0?1-ss(0,.45,t-SH[k][0]):0; $('fla').style.background='#000'; $('fla').style.opacity=dip*.7; $('fade').style.opacity=ss(DUR-.8,DUR,t); };
window.renderAt(0); window.ready=true;
