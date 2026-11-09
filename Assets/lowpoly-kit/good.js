import * as THREE from 'three';
import { rng, flat, shadow, ss, rock, roundTree, person, car, lamp, skyDome, softSun, lights, house, shop, marketStall, bike, bench, textSign, civic, policeStation, clinic, school, townHall, prison, crane } from './kit.js';
await document.fonts.load('600 80px Jost');
const TL=await (await fetch('/good_timeline.json')).json(), SEG=TL.segments, R=rng(81), $=id=>document.getElementById(id), DUR=TL.duration, S=i=>SEG[i].start, L=(i,j)=>SEG[i].lines[j].t;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(55,1080/1920,.2,1800), D=new THREE.Object3D(), C=h=>new THREE.Color(h), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xf2c4ad,100,480); const sky=skyDome(sc,0x7f91d8,0xf2c4ad), sun=softSun(sc,-60,70,-220,72), lt=lights(sc,95);
const add=(o,x=0,y=0,z=0,ry=0)=>{ o.position.set(x,y,z); o.rotation.y=ry; sc.add(o); return o; };
const pl=(w,d,c,x,y,z)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,.04,d),flat(c)),false); m.position.set(x,y,z); sc.add(m); return m; };
pl(2600,2600,0x6fbf4f,0,-.02,0); pl(400,8,0x54565f,0,.03,0); for(let x=-200;x<200;x+=6) pl(2.6,.22,0xf2f0e6,x,.06,0); for(const z of [-5.6,5.6]) pl(400,3.2,0xd6d0c4,0,.05,z);
pl(8,40,0x54565f,70,.03,-2); const yard=pl(36,36,0xc9c1b5,70,.035,-31);
const leaf=[flat(0x2c7f3d),flat(0x3f9a48),flat(0x1f6a3a)], bark=flat(0x6b4a33);
// south side
const myHouse=house(0xf2e6c8,0x9a4f3a); myHouse.scale.setScalar(1.3); add(myHouse,-42,0,-11.4); pl(1.8,3,0xc9c1b5,-42,.05,-8.4);
add(house(0xb8d4e8,0x4b5a78),-56,0,-11.4).scale.setScalar(1.3);
const myShop=add(shop(10,0xf0c8b0,0xd64f4f,R),-28,0,-11.5); const stall=marketStall(4,0x4fa28f,[0xd8403c,0xf2c133,0x5fb04a],R,{shutter:false}); add(stall,-28,0,-7.4); const stallSign=textSign('TAKE WHAT YOU NEED\nPAY WHAT YOU CAN',3.6,1.1,'#4fa28f','#ffffff'); stallSign.position.set(0,4.1,1.55); stall.add(stallSign);
const honesty=new THREE.Group(); honesty.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.5,.4,.4),flat(0xa77b4f)))); honesty.children[0].position.y=1.15; const hs=textSign('PAY HERE',.6,.22,'#a77b4f','#fff'); hs.position.set(0,1.2,.21); honesty.add(hs); add(honesty,-26.2,0,-6.7);
const bikes=[0xd64f4f,0x3f78c4,0xefc14d,0x4fa28f].map((c,i)=>add(bike(flat(c)),-21.5+i*.9,0,-6.6)); for(let i=0;i<5;i++) add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(.4,.04,6,12,Math.PI),flat(0x9aa0a8))),-21.5+i*.9-.45,.05,-6.6,Math.PI/2);
const police=policeStation(); add(police,-6,0,-12.5); const closed=textSign('CLOSED',1.6,.55,'#d64f4f','#fff'); closed.position.set(0,2.9,5.2); police.add(closed);
const lock=add(shop(10,0xd8e8c0,0x3f78c4,R),10,0,-11.5); const lsign=textSign('LOCKSMITH',6,1,'#3f78c4','#fff'); lsign.position.set(0,5.42,4.2); lock.add(lsign); const banner=textSign('CLOSING DOWN',6,1.2,'#f2c133','#2b2b2b'); banner.position.set(0,2.2,4.15); lock.add(banner);
add(civic(12,7,10,0xe8d0e8,0x6b4a7a,'BANK','#6b4a7a'),25,0,-12.5);
// north side
const sch=school(); add(sch,-30,0,12.5,Math.PI); const wing=new THREE.Group(); wing.add(civic(8,6,10,0xf2d48a,0xb8603a,'NEW WING','#3f78c4')); add(wing,-44.5,0,12.5,Math.PI); const cr=crane(20); add(cr,-52,0,22,0);
for(const [x,c] of [[-36,0xd64f4f],[-33,0x3f78c4]]){ const sl=new THREE.Group(); const st=new THREE.Mesh(new THREE.BoxGeometry(.9,.1,4),flat(c)); st.rotation.x=.55; st.position.set(0,1.2,0); sl.add(st); sl.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.9,2.4,.9),flat(0xefc14d)))); sl.children[1].position.set(0,1.2,-2); add(sl,x,0,23); }
const hall=townHall(); add(hall,-6,0,13,Math.PI); const cl=clinic(); add(cl,16,0,13,Math.PI); const clw=add(civic(7,7,11,0xf4f4f0,0xd64f4f,'NEW WARD','#3f78c4'),27,0,13,Math.PI);
for(const x of [-12,-6,0]) add(bench(),x,0,6.2,Math.PI);
for(let x=-62;x<=40;x+=12){ if(x+3<-30||x+3>5) add(roundTree(R,leaf,bark,1.15),x+3,0,-7.9,R()*6); if(x+9<-50||x+9>8) add(roundTree(R,leaf,bark,1.15),x+9,0,7.9,R()*6); if(x!==-26&&x!==-2) add(lamp(flat(0x23262c),flat(0xf3dd9c)),x,0,-4.4); if(x+6<-46||x+6>8) add(lamp(flat(0x23262c),flat(0xf3dd9c)),x+6,0,4.4); }
for(let i=0;i<22;i++){ const h=house([0xf2e6c8,0xb8d4e8,0xf0c8b0,0xd8e8c0,0xe8d0e8][i%5],[0x9a4f3a,0x4b5a78,0x6b4a3a,0x5a6b4a][i%4]); h.scale.setScalar(1.2); add(h,-90+(i%11)*16,0,i<11?-40-R()*6:40+R()*6,i<11?0:Math.PI); }
[[-200,-300,90],[150,-320,100],[300,-100,80],[-320,60,90],[260,200,90]].forEach(([x,z,r])=>{ const m=new THREE.Mesh(rock(r,2,R,.07),flat(0x5d9a50)); m.position.set(x,-r*.62,z); sc.add(m); });
// prison -> park
const pr=prison(); add(pr,70,0,-31); const parkTrees=[...Array(10)].map((_,i)=>{ const t=roundTree(R,leaf,bark,1); const a=i/10*6.283+.3; add(t,70+Math.cos(a)*13,0,-31+Math.sin(a)*12,R()*6); t.userData.g=.8+R()*.25; return t; }); const parkBench=[[62,-24],[78,-24],[64,-40]].map(([x,z])=>add(bench(),x,0,z,R()*2)); const pond=new THREE.Mesh(new THREE.CylinderGeometry(4,4,.06,20),flat(0x4b9df0)); pond.position.set(70,.06,-31); pond.scale.z=.6; sc.add(pond);
// cars (normal + jam)
const cols=[0xd64f4f,0x3f78c4,0xefc14d,0xf2ede1,0x4fa28f,0xd27c3a,0x7a5fb8]; const parked=[[-34,-3.6],[-14,3.6],[4,-3.6],[30,3.6]].map(([x,z],i)=>add(car(cols[i]),x,.05,z,z<0?Math.PI/2:-Math.PI/2)); const jam=[...Array(26)].map((_,i)=>{ const c=add(car(cols[(i*3)%7]),-70+(i%13)*10.5+(i<13?0:4),.05,i<13?-1.9:1.9,i<13?Math.PI/2:-Math.PI/2); c.visible=false; return c; });
// people
const outfit=[[0xf2e6c8,0x394a6e],[0xc98a2a,0x4b3a30],[0xd55a6a,0x2d3440],[0x5aa3c7,0x54402f],[0x8f6fce,0x2d3440],[0xe5c048,0x3d3a40],[0x69b96a,0x3a3a50],[0xe88fb0,0x303446],[0x47a7a0,0x4a3a30],[0xc95c3a,0x2d3440]];
const P=(o,i=0)=>person({shirt:o[0],pants:o[1],skin:[0xd9a27a,0xb97f58,0xeac4a0,0x8c5e3f][i%4],hair:[0x5a3320,0x201a18,0x8a5a2c,0x34302c][(i>>1)%4]});
const me=add(person({shirt:0xf07a22,pants:0x2c3a5e}));
const walkers=[...Array(12)].map((_,i)=>{ const m=add(P(outfit[i%10],i)); return {m,i,z:(i%2?1:-1)*(5+((i>>1)%2)*1.1),x0:R()*120-70,dir:i%3?1:-1,sp:.8+R()*.4,ph:R()*6}; });
const cops=[0,1,2].map(i=>{ const m=add(P([0x2c4a7a,0x23262c],i)); const cap=new THREE.Mesh(new THREE.BoxGeometry(.44,.12,.5),flat(0x1e2b48)); cap.position.y=2.08; m.add(cap); const bx=new THREE.Mesh(new THREE.BoxGeometry(.6,.45,.4),flat(0xa77b4f)); bx.position.set(0,1.3,.4); m.add(bx); return m; });
const freed=[...Array(5)].map((_,i)=>add(P([0x9aa0a8,0x6d6f78],i+1))), fams=[...Array(5)].map((_,i)=>add(P(outfit[(i*3)%10],i+3)));
const kids=[...Array(4)].map((_,i)=>{ const m=add(P(outfit[(i*2+1)%10],i)); m.scale.setScalar(.65); return m; });
const debaters=[0,1].map(i=>add(P(outfit[i?6:2],i)));
const SH=[[0,S(1)],[S(1),S(2)],[S(2),S(3)],[S(3),S(4)],[S(4),S(5)],[S(5),S(6)],[S(6),S(7)],[S(7),DUR]]; window.SHOTS=SH; window.DURATION=DUR;
const wrap=(v,a,b)=>a+((v-a)%(b-a)+(b-a))%(b-a);
const hideAll=list=>list.forEach(m=>m.visible=false);
const fp=(x,z,tx,ty,tz,t,walk,y=1.65)=>{ const b=walk?Math.abs(Math.sin(t*4.4))*.04:Math.sin(t*1.2)*.01; cam.position.set(x,y+b,z); cam.lookAt(tx+(walk?Math.sin(t*4.4)*.05:0),ty+b*.6,tz); };
function fpCam(k,u,t){ switch(k){
  case 0: { const q=ss(0,.45,u), r=ss(.42,.62,u); const x=lg(-42,-36,ss(.5,1,u)), z=lg(-9.6,-6.2,q); fp(x,z,lg(-42,-20,r),lg(1.4,1.8,r),lg(10,-6.5,r),t,true); break; }
  case 1: fp(lg(-29,-28,u),lg(1.8,1,u),lg(-21.5,-28,ss(.5,.8,u)),lg(.9,1.6,ss(.5,.8,u)),lg(-6.6,-8,ss(.5,.8,u)),t,u<.3); break;
  case 2: fp(70.2,lg(-6.5,-7.6,u),70,2.6,-16,t,u<.25); break;
  case 3: { const q=ss(.45,.85,u); fp(lg(-8,3,u),5,lg(-6,10,q),2.8,-11,t,true); break; }
  case 4: fp(lg(-41,-43,u),lg(.5,1.2,u),-47,lg(5,9,u),14,t,true); break;
  case 5: fp(lg(63.5,64.5,u),lg(-14,-21,u),lg(68,71,u),1.3,-34,t,true); break;
  case 6: fp(lg(3,1.5,u),5.2,lg(-2,-5,u),1.6,lg(-1,6.5,ss(.35,.7,u)),t,false); break;
  default: fp(-6,6.1,lg(-6,8,ss(.3,1,u)),lg(1.6,2.4,u),lg(-6,-3,u),t,false,1.15); } }
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=7; const u=(t-SH[k][0])/(SH[k][1]-SH[k][0]), eve=k===7;
 sky.top.value.set(eve?0x5a5aa6:0x7f91d8); sky.low.value.set(eve?0xf6a56c:0xf2c4ad); sc.fog.color.copy(sky.low.value); lt.d.color.set(eve?0xffa860:0xfff0d0); lt.d.intensity=eve?1.25:1.5; lt.h.intensity=eve?1.9:2.5; sun.position.set(eve?-90:-60,eve?16:70,-220); sun.material.color.set(eve?0xffb070:0xfff2a0); sun.scale.setScalar(eve?95:72);
 const yrs=k>=4; police.userData.lamp.material.color.set(k>=3?0x5a6070:0x4a8aff); closed.visible=k>=3; banner.visible=k===3||k===4; lsign.visible=k<5; police.userData.sign.visible=true;
 wing.scale.y=k<4?.001:k===4?Math.max(.001,ss(.1,.9,u)):1; wing.visible=k>=4; cr.visible=k===4; cr.userData.jib.rotation.y=t*.25; clw.visible=k>=5;
 const park=k>=5; pr.visible=true; pr.userData.walls.visible=!park; pr.userData.block.visible=!park; pr.userData.gl.visible=pr.userData.gr.visible=!park; const op=k===2?ss(S(2)+.6,S(2)+3,t):k>2?1:0; pr.userData.gl.position.x=-2-op*3.8; pr.userData.gr.position.x=2+op*3.8;
 parkTrees.forEach(tr=>{ tr.visible=park; tr.scale.setScalar(park?tr.userData.g:.001); }); parkBench.forEach(b=>b.visible=park); pond.visible=park; yard.material.color.set(park?0x7cc85a:0xc9c1b5);
 jam.forEach(c=>c.visible=k===6); parked.forEach(c=>c.visible=k!==6);
 me.visible=!window.FP&&(k===0||k===1||k===7); me.rotation.set(0,0,0); me.children[0].position.y=1.25;
 if(k===0){ const q=Math.min(1,t/7.5); me.position.set(-42+q*0,.05,lg(-8.6,-6,q)); if(q>.4){ me.position.set(lg(-42,-34,(q-.4)/.6),.05,-6); me.rotation.y=Math.PI/2; } me.userData.pose(t*6.5,.5); }
 else if(k===1){ me.position.set(-27.4,.05,-5.8); me.rotation.y=Math.PI+(u>.55?.9:0); me.userData.pose(0,.03); }
 else if(k===7){ me.position.set(-6,-.28,6.3); me.rotation.y=0; me.userData.sit(); }
 walkers.forEach(w=>{ const show=k!==2&&k!==5; w.m.visible=show; const x=wrap(w.x0+w.dir*t*w.sp*(k===6?.5:1),-70,50); w.m.position.set(x,.05,w.z); w.m.rotation.y=w.dir>0?Math.PI/2:-Math.PI/2; w.m.userData.pose(t*6.5+w.ph,.5); if(Math.hypot(x-cam.position.x,w.z-cam.position.z)<3.5) w.m.visible=false; });
 cops.forEach((c,i)=>{ c.visible=k===3; const q=Math.max(0,u*1.6-i*.25); c.position.set(-6+(i-1)*1.6+q*.6,.05,lg(-7.4,-2.6,q)+(i-1)*.3); c.rotation.y=0; c.userData.pose(t*6+i,.35); });
 freed.forEach((m,i)=>{ m.visible=k===2; const q=Math.max(0,(t-S(2)-2.2-i*.5)/4); m.position.set(70-2+i*1+Math.sin(i)*.5,.05,lg(-20,-11.2,q)); m.rotation.y=0; m.userData.pose(q<1?t*6+i:0,q<1?.45:.03); });
 fams.forEach((m,i)=>{ m.visible=k===2; m.position.set(window.FP?70+(i<3?-3.6-i*.9:3+(i-3)*.9):70-2+i*1+Math.sin(i)*.5,.05,window.FP?-10.6+(i%2)*.4:-10.4); m.rotation.y=Math.PI; m.userData.pose(0,.03); });
 kids.forEach((m,i)=>{ m.visible=k===5; const a=t*.6+i*1.6; m.position.set(70+Math.cos(a)*(7+i),.05,-31+Math.sin(a)*(5+i*.5)); m.rotation.y=-a; m.userData.pose(t*9+i,.6); });
 debaters.forEach((m,i)=>{ m.visible=k===6; m.position.set(-6+(i?.8:-.8),.55,6.9); m.rotation.y=i?-Math.PI/2:Math.PI/2; m.userData.pose(Math.sin(t*7+i*2)*1.2,.6); });
 if(window.FP){ fpCam(k,u,t); } else switch(k){
  case 0: cam.position.set(lg(-72,-48,u),lg(30,10,u),lg(42,22,u)); cam.lookAt(lg(-26,-36,u),2,-4); break;
  case 1: cam.position.set(lg(-24,-25,u),2.4,lg(6.4,5.6,u)); cam.lookAt(-26.5,1.3,-7); break;
  case 2: cam.position.set(lg(76,74.8,u),2.2,lg(-1.2,-2.4,u)); cam.lookAt(69.5,2.6,-15.5); break;
  case 3: { const q=ss(.45,.85,u); cam.position.set(lg(-1,3,u),1.9,3.2); cam.lookAt(lg(-6,10,q),2.8,-11); break; }
  case 4: cam.position.set(lg(-34,-37,u),lg(3,4,u),lg(-2,-3,u)); cam.lookAt(-46,5.5,13); break;
  case 5: cam.position.set(lg(72,69,u),lg(24,21,u),lg(-8,-10,u)); cam.lookAt(70,0,-33); break;
  case 6: cam.position.set(lg(6,4,u),lg(6,5,u),lg(-9,-10,u)); cam.lookAt(-6,1.6,6.5); break;
  default: cam.position.set(lg(8,18,u),lg(3,7,u),lg(-1.5,-2.5,u)); cam.lookAt(-6,2.5,6); }
 renderer.render(sc,cam);
 const seg=SEG[Math.max(0,SEG.findLastIndex(s=>t>=s.start))], wn=seg.when==='TODAY'?['0','DAYS']:seg.when.split(' ').reverse(); if(+wn[0]>1) wn[1]+='S'; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent=wn[0]; $('u').textContent=wn[1]; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='';
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 $('fla').style.opacity=0; $('fade').style.opacity=ss(DUR-.5,DUR,t); };
window.renderAt(0); window.ready=true;
