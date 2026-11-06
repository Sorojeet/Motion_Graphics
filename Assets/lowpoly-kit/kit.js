// Reusable low-poly asset kit: every factory returns plain three.js objects.
import * as THREE from 'three';
export const rng = s => () => { s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
export const flat = c => new THREE.MeshLambertMaterial({ color:c, flatShading:true });
export const shadow = (m,cast=true,recv=true)=>{ m.castShadow=cast; m.receiveShadow=recv; return m; };
export const ss = (a,b,x)=>{ const k=Math.min(1,Math.max(0,(x-a)/(b-a))); return k*k*(3-2*k); };
export function rock(r, detail, rand, j=.16){ const g=new THREE.IcosahedronGeometry(r,detail), p=g.attributes.position, m=new Map();
  for(let i=0;i<p.count;i++){ const k=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(3)).join();
    if(!m.has(k)) m.set(k,1+(rand()-.5)*2*j); const f=m.get(k); p.setXYZ(i,p.getX(i)*f,p.getY(i)*f,p.getZ(i)*f); }
  g.computeVertexNormals(); return g; }
const box=(w,h,d,mat,x=0,y=0,z=0)=>{ const m=shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat)); m.position.set(x,y,z); return m; };
export function roundTree(rand, mats, trunkMat, s=1){ const g=new THREE.Group(), top=new THREE.Group();
  const trunk=shadow(new THREE.Mesh(new THREE.CylinderGeometry(.22*s,.36*s,3.2*s,6),trunkMat)); trunk.position.y=1.6*s; g.add(trunk);
  top.position.y=3.6*s; const n=4; for(let i=0;i<n;i++){ const b=shadow(new THREE.Mesh(rock((1.25+rand()*.7)*s,1,rand),mats[i%mats.length]));
    const a=i/n*6.28+rand(); b.position.set(i?Math.cos(a)*1.05*s:0,i?(rand()-.3)*.8*s:.9*s,i?Math.sin(a)*1.05*s:0); top.add(b); }
  g.add(top); g.userData.top=top; return g; }
export function pine(rand, mat, trunkMat, s=1){ const g=new THREE.Group(), top=new THREE.Group();
  const t=shadow(new THREE.Mesh(new THREE.CylinderGeometry(.14*s,.22*s,1.4*s,5),trunkMat)); t.position.y=.7*s; g.add(t);
  top.position.y=1.2*s; [0,1.25,2.35].forEach((y,i)=>{ const c=shadow(new THREE.Mesh(new THREE.ConeGeometry((1.45-.34*i)*s,2.1*s,7),mat)); c.position.y=y*s+.9*s; c.rotation.y=rand()*3; top.add(c); });
  g.add(top); g.userData.top=top; return g; }
export function person({shirt,pants,skin=0xd9a27a,hair=0x5a3320}){ const g=new THREE.Group(); const sm=flat(shirt),pm=flat(pants),km=flat(skin);
  g.add(box(.56,.72,.3,sm,0,1.25,0)); g.add(box(.36,.36,.34,km,0,1.82,0)); g.add(box(.39,.15,.37,flat(hair),0,2.0,0));
  const limb=(x,y,w,h,mat)=>{ const p=new THREE.Group(); p.position.set(x,y,0); p.add(box(w,h,w,mat,0,-h/2,0)); g.add(p); return p; };
  const L=limb(-.15,.9,.22,.9,pm),R=limb(.15,.9,.22,.9,pm),A=limb(-.38,1.58,.17,.7,sm),B=limb(.38,1.58,.17,.7,sm);
  g.userData.pose=(ph,amp)=>{ const s=Math.sin(ph)*amp; L.rotation.x=s; R.rotation.x=-s; A.rotation.x=-s*.8; B.rotation.x=s*.8; g.children[0].position.y=1.25+Math.abs(Math.cos(ph))*amp*.05; };
  return g; }
export function lamp(pole,head){ const g=new THREE.Group(); g.add(box(.26,8,.26,pole,0,4,0)); g.add(box(.85,.42,.85,head,0,8.15,0)); g.add(box(.55,.1,.55,pole,0,8.42,0)); return g; }
export function building({x,z,w,h,d,color,rand,windows,step=4.2}){ const g=new THREE.Group(); const mat=flat(color); g.position.set(x,0,z); g.add(box(w,h,d,mat,0,h/2,0)); g.add(box(w+.5,.5,d+.5,mat,0,h+.2,0));
  const cols=Math.max(2,Math.floor(w/step)), rows=Math.floor((h-4)/step);
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++) windows.push({x:x+(c-(cols-1)/2)*w/cols,y:3.8+r*step,z:z+d/2+.06,sx:w/cols*.56,sy:step*.56,sz:.1,lit:rand()<.45,seed:rand()});
  const side=Math.sign(-x)||1, n=Math.max(1,Math.floor(d/step));
  for(let r=0;r<rows;r++)for(let c=0;c<n;c++) windows.push({x:x+side*(w/2+.06),y:3.8+r*step,z:z+(c-(n-1)/2)*d/n,sx:.1,sy:step*.56,sz:d/n*.56,lit:rand()<.45,seed:rand()});
  return g; }
export function bird(mat){ const g=new THREE.Group(); const wing=s=>{ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,.35, 0,0,-.45, s*1.5,0,-.25],3)); geo.computeVertexNormals(); const m=new THREE.Mesh(geo,mat); g.add(m); return m; };
  const a=wing(1),b=wing(-1); g.userData.flap=v=>{a.rotation.z=v;b.rotation.z=-v;}; return g; }
