import * as THREE from 'three';
import { rng, flat, shadow, ss, person, car, roundTree } from './kit.js';
await document.fonts.load('600 80px Jost'); await document.fonts.load('400 80px Jost');
const TL=await (await fetch('/price_timeline.json')).json(), SEG=TL.segments, R=rng(51), $=id=>document.getElementById(id), DUR=TL.duration, S=i=>SEG[i].start, L=(i,j)=>SEG[i].lines[j].t;
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,preserveDrawingBuffer:true}); renderer.setSize(1080,1920,false); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(64,1080/1920,.05,600), D=new THREE.Object3D(), C=h=>new THREE.Color(h), lg=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
const sc=new THREE.Scene(); sc.background=C(0xf4e6d6); sc.fog=new THREE.Fog(0xf4e6d6,40,120);
const hemi=new THREE.HemisphereLight(0xffffff,0xd8c8b8,2.3); sc.add(hemi); const sunL=new THREE.DirectionalLight(0xfff4e0,1.2); sunL.position.set(10,40,-20); sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-50,right:50,top:60,bottom:-60,near:1,far:120}); sunL.shadow.bias=-.0006; sunL.shadow.normalBias=.04; sc.add(sunL); sunL.target.position.set(0,0,-15); sc.add(sunL.target);
const box=(w,h,d,c,x,y,z,p=sc)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?flat(c):c)); m.position.set(x,y,z); p.add(m); return m; };
const sign=(text,w,h,bg,fg,px=96,weight=600)=>{ const cv=document.createElement('canvas'); cv.width=Math.round(w*128); cv.height=Math.round(h*128); const x=cv.getContext('2d'); x.fillStyle=bg; x.fillRect(0,0,cv.width,cv.height); x.fillStyle=fg; const lines0=text.split('\n'); x.font=`${weight} ${px}px Jost`; while(px>10&&Math.max(...lines0.map(l=>x.measureText(l).width))>cv.width*.9){ px-=2; x.font=`${weight} ${px}px Jost`; } while(px>10&&px*1.1*lines0.length>cv.height*.92){ px-=2; x.font=`${weight} ${px}px Jost`; } x.textAlign='center'; x.textBaseline='middle'; const lines=text.split('\n'); lines.forEach((l,i)=>x.fillText(l,cv.width/2,cv.height/2+(i-(lines.length-1)/2)*px*1.1)); const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,fog:false})); };
// corridor
const floorM=flat(0xe9e2d6); box(16,.1,130,floorM,0,-.05,-15).castShadow=false; for(let z=-80;z<=50;z+=2.5) box(14,.012,.06,0xd6cdbf,0,.01,z).castShadow=false; for(const x of [-4.67,0,4.67]) box(.06,.012,130,0xd6cdbf,x,.012,-15).castShadow=false;
box(16,.3,98,0xf6f1ea,0,7.6,-7).castShadow=false; for(let z=34;z>-50;z-=6) box(3,.05,3.6,new THREE.MeshBasicMaterial({color:0xffffff}),0,7.43,z).castShadow=false;
// atrium
box(40,.1,30,floorM,0,-.04,-66).castShadow=false; for(const x of [-20,20]) box(.6,16,30,0xf0e2d0,x,8,-66); box(40,16,.6,0xf0e2d0,0,8,-81); box(40,.4,30,new THREE.MeshBasicMaterial({color:0xcfe6f7}),0,16.2,-66).castShadow=false; for(let x=-18;x<=18;x+=4) box(.25,.3,30,0xd6cdbf,x,16,-66);
for(const [x,z] of [[-14,-58],[14,-58],[-14,-74],[14,-74]]){ box(2.2,.9,2.2,0xc9b89e,x,.45,z); const t=roundTree(R,[flat(0x2c7f3d),flat(0x3f9a48),flat(0x1f6a3a)],flat(0x6b4a33),1); t.position.set(x,.9,z); sc.add(t); }
const banner=sign('EVERYTHING\nONE PRICE',9,4.2,'#d64f4f','#ffffff',150); banner.position.set(0,10,-66); sc.add(banner); const banner2=banner.clone(); banner2.rotation.y=Math.PI; sc.add(banner2);
const entry=sign('ONE PRICE · EVERYTHING',10,1.4,'#f2c133','#2b2b2b',110); entry.position.set(0,6.4,26); sc.add(entry);
// stores
const glassM=new THREE.MeshLambertMaterial({color:0xbfe2ea,transparent:true,opacity:.18,depthWrite:false});
const stores={};
function store(key,side,zc,w,name,color,d=13){ const g=new THREE.Group(); sc.add(g); const fx=side*8, bx=side*(8+d); box(d,.1,w,0xf3ede4,side*(8+d/2),-.04,zc,g).castShadow=false; box(.4,7.6,w,0xe9dfd2,bx,3.8,zc,g); for(const s of [-1,1]) box(d,7.6,.4,0xe9dfd2,side*(8+d/2),3.8,zc+s*w/2,g); box(d,.3,w,0xf6f1ea,side*(8+d/2),7.6,zc,g).castShadow=false;
  box(.5,3.2,w,flat(color),fx,6,zc,g); const sg=sign(name,w*.7,1.5,'#'+C(color).getHexString(),'#ffffff',110); sg.position.set(fx-side*.27,6,zc); sg.rotation.y=-side*Math.PI/2; g.add(sg);
  for(const s of [-1,1]){ box(.35,4.4,.35,0x9aa0a8,fx,2.2,zc+s*w/2); const gl=new THREE.Mesh(new THREE.BoxGeometry(.06,4.3,w/2-2.2),glassM); gl.position.set(fx,2.2,zc+s*(w/4+1.1)); g.add(gl); }
  const shut=new THREE.Group(); shut.position.set(fx-side*.1,4.4,zc); for(let i=0;i<14;i++) box(.08,.31,w,i%2?0x9aa0a8:0x8a9098,0,-.16-i*.31,0,shut); shut.scale.y=.01; g.add(shut);
  for(let z=zc-w/2+3;z<zc+w/2;z+=4.5) box(2.2,.05,2.6,new THREE.MeshBasicMaterial({color:0xffffff}),side*(8+d/2),7.43,z,g).castShadow=false; stores[key]={g,side,zc,w,d,shut}; return stores[key]; }
const el=store('el',1,14,16,'ELECTRONICS',0x3f78c4), gr=store('gr',-1,6,20,'SUPERMARKET',0x4fa28f), cs=store('cs',1,-14,20,'CAR SHOWROOM',0xd64f4f,16), fa=store('fa',-1,-20,14,'FASHION',0x8f6fce), ty=store('ty',1,-38,14,'TOYS',0xefc14d), ca=store('ca',-1,-38,14,'CAFE',0xd27c3a);
// electronics stock
const tvs=[], phones=[];
for(let r=0;r<3;r++) for(let i=0;i<6;i++){ const g=new THREE.Group(); box(1.9,1.15,.12,0x1e2128,0,0,0,g); box(1.75,1,.02,new THREE.MeshBasicMaterial({color:[0x3f78c4,0x4fa28f,0x8f6fce,0xd27c3a][(r+i)%4]}),0,0,.07,g); g.position.set(20.6,1.2+r*1.7,14-6.25+i*2.5); g.rotation.y=-Math.PI/2; sc.add(g); tvs.push(g); }
for(let r=0;r<3;r++) box(1,.12,16,0xd6cdbf,20.7,.55+r*1.7,14);
for(let t=0;t<3;t++){ const tx=11+t*3.3; box(2,.9,5,0xf2ede4,tx,.45,14); for(let i=0;i<14;i++){ const p=box(.32,.06,.6,[0x23262c,0xf2ede4,0xd64f4f][i%3],tx-.6+(i%3)*.6,.95,14-2+Math.floor(i/3)*.9); phones.push(p); } }
const charger=new THREE.Group(); box(1,1.1,1,0xf2ede4,0,.55,0,charger); box(.18,.1,.12,0xffffff,0,1.16,0,charger); const cSign=sign('ONE PRICE =\n1 CHARGER',1.6,.9,'#f2c133','#2b2b2b',64); cSign.position.set(0,2.2,.0); cSign.rotation.y=Math.PI*.12; charger.add(cSign); box(.06,.9,.06,0x6d6f78,0,1.6,0,charger); charger.position.set(3.4,0,-3.5); sc.add(charger);
// supermarket shelves
const goods=new THREE.InstancedMesh(new THREE.BoxGeometry(.32,.42,.24),new THREE.MeshLambertMaterial({color:0xffffff}),1200); goods.castShadow=true; sc.add(goods); const gd=[]; const gc=[0xd64f4f,0xefc14d,0x4fa28f,0x3f78c4,0xe88fb0,0xd27c3a,0xf2ede4,0x69b96a];
const crates=new THREE.Group(); sc.add(crates);
for(let a=0;a<4;a++){ const ax=-11-a*2.8; box(.9,2.4,17,0xd8cfc2,ax,1.2,6); for(let r=0;r<4;r++) box(1.1,.06,17,0xbfb5a6,ax,.3+r*.6,6); for(const s of [-1,1]) for(let r=0;r<4;r++) for(let i=0;i<24;i++){ gd.push([ax+s*.42,.55+r*.6,6-8+i*.68+(R()-.5)*.1]); } for(let r=0;r<3;r++) for(let i=0;i<5;i++){ const c=new THREE.Group(); box(1,.55,1.3,0xa77b4f,0,0,0,c); box(1.02,.08,1.32,0x8a6a44,0,.2,0,c); c.position.set(ax+(i%2?.0:0),.6+r*.62,6-6.5+i*3.2); crates.add(c); } }
gd.slice(0,1200).forEach((q,i)=>{ D.position.set(...q); D.rotation.set(0,0,0); D.scale.set(1,.8+R()*.5,1); D.updateMatrix(); goods.setMatrixAt(i,D.matrix); goods.setColorAt(i,C(gc[Math.floor(R()*8)])); });
const crSign=sign('ONE PRICE =\n1 CRATE',2.6,1.4,'#f2c133','#2b2b2b',80); crSign.position.set(-8.4,3.2,2); crSign.rotation.y=Math.PI/2; sc.add(crSign);
const water=new THREE.Group(); { const b=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.5,10),new THREE.MeshLambertMaterial({color:0x8fd0f0,transparent:true,opacity:.8})); b.position.y=1.37; water.add(b); box(.14,.06,.14,0x3f78c4,0,1.65,0,water); box(.8,1.1,.8,0xf2ede4,0,.55,0,water); const t=sign('1 BOTTLE\n= 1 TV',1.3,.8,'#f2c133','#2b2b2b',64); t.position.set(0,1.95,0); t.rotation.y=Math.PI/2; water.add(t); } water.position.set(-5.4,0,4.6); sc.add(water);
// car showroom
const showCars=[], plats=[]; [[-19,0xf2ede1],[-14,0x3f78c4],[-9,0xefc14d]].forEach(([z,c],i)=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,.3,20),flat(0xdcdfe6)); p.position.set(15+(i%2)*3,.15,z); p.receiveShadow=true; sc.add(p); plats.push(p); const k=car(c); k.position.set(p.position.x,.3,z); k.rotation.y=.6+i; sc.add(k); showCars.push(k); });
const soldSign=sign('SOLD OUT\nNO NEW CARS',3.6,1.8,'#2b2b2b','#ffffff',90); soldSign.position.set(8.4,3,-14); soldSign.rotation.y=-Math.PI/2; sc.add(soldSign); const salesman=person({shirt:0xf2ede4,pants:0x23262c}); salesman.position.set(13,.05,-12); salesman.rotation.y=-Math.PI/2; salesman.userData.pose(0,.02); sc.add(salesman);
// fashion filler
for(let i=0;i<4;i++){ const m=person({shirt:[0xd64f4f,0x4fa28f,0xefc14d,0xe88fb0][i],pants:0x2d3440,skin:0xf2ede4,hair:0xf2ede4}); m.position.set(-11-(i%2)*3,.05,-24+i*2.6); m.rotation.y=Math.PI/2; m.userData.pose(0,.02); sc.add(m); }
for(let i=0;i<5;i++) box(.6,.5,.6,[0xefc14d,0xd64f4f,0x3f78c4,0x69b96a,0xe88fb0][i],13+(i%2)*2.5,.25+Math.floor(i/2)*0,-38-4+i*2);
// shoppers
const outfit=[[0xf2e6c8,0x394a6e],[0xc98a2a,0x4b3a30],[0xd55a6a,0x2d3440],[0x5aa3c7,0x54402f],[0x8f6fce,0x2d3440],[0xe5c048,0x3d3a40],[0x69b96a,0x3a3a50],[0xe88fb0,0x303446],[0x47a7a0,0x4a3a30],[0xc95c3a,0x2d3440],[0xf07a22,0x2c3a5e],[0xd9d0ea,0x394a6e]];
const crowd=[...Array(22)].map((_,i)=>{ const o=outfit[i%12], m=person({shirt:o[0],pants:o[1],skin:[0xd9a27a,0xb97f58,0xeac4a0,0x8c5e3f][i%4],hair:[0x5a3320,0x201a18,0x8a5a2c,0x34302c][(i>>1)%4]}); const carry=box(.7,.5,.35,[0x23262c,0xa77b4f][i%2],0,1.25,.42,m); carry.visible=false; sc.add(m); return {m,i,carry,lane:-5+((i*7)%11),dir:i%2?1:-1,z0:R()*90-60,sp:.9+R()*.4,ph:R()*6}; });
const wrap=(v,a,b)=>a+((v-a)%(b-a)+(b-a))%(b-a);
// first-person shopping cart
const cart=new THREE.Group(); cam.add(cart); { const wm=new THREE.MeshLambertMaterial({color:0xbfc4cc}), rm=flat(0xd64f4f); const b=(w,h,d,m,x,y,z)=>{ const k=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); k.position.set(x,y,z); cart.add(k); return k; };
  b(.62,.045,.045,rm,0,-.5,-.62); for(const s of [-1,1]) b(.03,.03,.25,wm,s*.3,-.52,-.75);
  const y0=-.92, y1=-.62, z0=-.86, z1=-1.65; b(.62,.02,.8,wm,0,y0,(z0+z1)/2); for(const s of [-1,1]) for(let i=0;i<4;i++) b(.012,y1-y0,.8,wm,s*.31,(y0+y1)/2,(z0+z1)/2).scale.set(1,1,1); for(const s of [-1,1]) b(.02,.02,.8,wm,s*.31,y1,(z0+z1)/2); b(.62,.02,.02,wm,0,y1,z0); b(.62,.02,.02,wm,0,y1,z1); for(let i=0;i<6;i++){ b(.012,.012,.8,wm,-.25+i*.1,y0+.15,(z0+z1)/2); b(.62,.012,.012,wm,0,y0+.15+0*i,z0-i*.14); } for(let i=0;i<6;i++) for(const s of [-1,1]) b(.012,y1-y0,.012,wm,s*.31,(y0+y1)/2,z0-i*.16); }
const cTV=new THREE.Group(); { const k=new THREE.Mesh(new THREE.BoxGeometry(.5,.32,.12),flat(0x1e2128)); cTV.add(k); const s2=new THREE.Mesh(new THREE.BoxGeometry(.18,.04,.3),flat(0x23262c)); s2.position.set(.16,-.12,-.18); cTV.add(s2); } cTV.position.set(-.05,-.72,-1.3); cTV.rotation.set(-.3,.2,0); cart.add(cTV);
const cCrate=new THREE.Group(); { const k=new THREE.Mesh(new THREE.BoxGeometry(.48,.24,.5),flat(0xa77b4f)); cCrate.add(k); for(let i=0;i<6;i++){ const g=new THREE.Mesh(new THREE.BoxGeometry(.1,.14,.08),flat(gc[i])); g.position.set(-.16+(i%3)*.16,.16,-.12+Math.floor(i/3)*.22); cCrate.add(g); } } cCrate.position.set(0,-.78,-1.25); cart.add(cCrate);
const SH=[[0,S(1)],[S(1),S(2)],[S(2),S(3)],[S(3),S(4)],[S(4),S(5)],[S(5),S(6)],[S(6),S(7)],[S(7),DUR]]; window.SHOTS=SH; window.DURATION=DUR;
const look=(x,y,z,yaw,pitch,t,walk)=>{ cam.position.set(x,y+(walk?Math.abs(Math.sin(t*4.2))*.035:Math.sin(t*1.3)*.008),z); cam.rotation.order='YXZ'; cam.rotation.set(pitch+(walk?Math.sin(t*8.4)*.006:0),yaw+(walk?Math.sin(t*4.2)*.008:0),0); };
window.renderAt=t=>{ let k=SH.findIndex(s=>t<s[1]); if(k<0)k=7; const u=(t-SH[k][0])/(SH[k][1]-SH[k][0]);
 const elSold=k===0?0:k===1?ss(S(1)+1.5,S(2)-.8,t):1; tvs.forEach((g,i)=>g.visible=(i+.5)/tvs.length>elSold*(1.02)); phones.forEach((p,i)=>p.visible=((i*7)%phones.length+.5)/phones.length>elSold);
 const bundled=k>=3, bare=k>=5; goods.visible=!bundled; crates.visible=bundled&&!bare; crSign.visible=k===3||k===4; charger.visible=k>=3&&k<=4; water.visible=k===2;
 showCars.forEach(c=>c.visible=k<4); soldSign.visible=k>=4; salesman.visible=k>=4;
 [fa,ty,ca].forEach((s,i)=>s.shut.scale.y=k>=6?1:k===5&&i>0?1:.01); cs.shut.scale.y=k>=6?1:.01; el.shut.scale.y=k>=6?1:.01;
 hemi.intensity=k>=5?1.9:2.3;
 cart.visible=k!==6; cTV.visible=k===1&&u>.55||k===2; cCrate.visible=k===3&&t>L(3,0)+2.4||k===4;
 switch(k){
  case 0: look(0,1.65,lg(36,26,u),Math.sin(t*.3)*.08,.04,t,true); break;
  case 1: look(lg(0,1.6,u),1.65,lg(24,19,u),lg(-.25,-1.15,ss(.15,.7,u)),-.06,t,u<.75); break;
  case 2: look(lg(.8,-.6,u),1.65,lg(8.5,5.5,u),lg(.85,1.2,u),-.1,t,u<.7); break;
  case 3: { const q=ss(.0,1,(t-L(3,1)+.4)/1.4); look(lg(-1.2,-.4,u),1.65,lg(3.6,1.5,u),lg(1.25,-.62,q),-.12,t,u<.4); break; }
  case 4: look(lg(2,3,u),1.65,lg(-5.5,-10.5,u),lg(-.75,-1.25,u),-.06,t,u<.6); break;
  case 5: look(lg(1.6,1.2,u),1.65,lg(-18,-22,u),lg(.18,.08,u),-.04,t,u<.5); break;
  case 6: look(0,lg(6.8,6.2,u),lg(-58,-56,u),Math.PI,lg(-.24,-.3,u),t,false); break;
  default: look(0,1.65,lg(-50,-51.5,u),lg(.0,.1,u),lg(.55,-.3,ss(.35,.85,u)),t,false); }
 crowd.forEach(c=>{ const {m,i}=c; let x,z,walk=true,dx=0,dz=c.dir, sp=1; c.carry.visible=false; m.visible=true;
  const walkC=(n)=>{ z=wrap(c.z0+c.dir*t*c.sp*n,-62,30); x=c.lane; };
  if(k===0){ walkC(1); }
  else if(k===1){ if(i<12){ x=10.5+(i%4)*2.6+Math.sin(t*1.7+i)*.6; z=10+Math.floor(i/4)*3.2+Math.cos(t*1.3+i)*.6; dx=Math.sin(i*2.1); dz=Math.cos(i*2.1); walk=Math.sin(t*2+i)>0; } else { walkC(1); c.carry.visible=i%2===0; } }
  else if(k===2||k===3){ walkC(.9); c.carry.visible=k===3&&i%3===0; c.carry.material=k===3?c.carry.material:c.carry.material; }
  else if(k===4){ walkC(.6); if(i%2) m.visible=false; }
  else { if(i<18){ x=-4.2+Math.sin(i*1.7)*.25; z=-58+i*1.25; dx=0; dz=-1; walk=false; } else { x=2.2+(i%2)*1.1; z=-30+(i-18)*0; dx=i%2?-1:1; dz=0; walk=false; c.carry.visible=true; } if(k===7&&i>=18) m.visible=false; }
  m.position.set(x,.05,z); m.rotation.y=Math.atan2(dx,dz); m.userData.pose(walk?t*6.5+c.ph:Math.sin(t*1.4+i)*.1,walk?.5:.04); if(Math.hypot(x-cam.position.x,z-cam.position.z)<3.2) m.visible=false; });
 sc.add(cam); renderer.render(sc,cam);
 const seg=SEG[Math.max(0,SEG.findLastIndex(s=>t>=s.start))]; $('title').style.opacity=(1-ss(SEG[0].end-.5,SEG[0].end-.05,t))*ss(0,.3,t); $('n').textContent='ONE'; $('u').textContent='PRICE'; $('stage').textContent=seg.caption; $('r').innerHTML=seg.fact; $('el').textContent=''; $('wt').textContent='TIME: '+seg.when;
 let txt=''; for(const s of SEG) for(const l of s.lines){ if(t>=l.t&&t<l.t+l.d+.16){ const c=[]; let cur=[]; for(const x of l.text.split(' ')){ cur.push(x); if(cur.length>=6||(/[.,?]$/.test(x)&&cur.length>=2)){ c.push(cur.join(' ')); cur=[]; } } if(cur.length)c.push(cur.join(' ')); const tot=c.reduce((a,b)=>a+b.length,0); let acc=0,p=(t-l.t)/l.d*tot; txt=c.at(-1); for(const q of c){ acc+=q.length; if(p<=acc){ txt=q; break; } } } } $('cap').textContent=t<SEG[0].lines[1].t?'':txt;
 $('fla').style.opacity=0; $('fade').style.opacity=ss(DUR-.5,DUR,t); };
window.renderAt(0); window.ready=true;
