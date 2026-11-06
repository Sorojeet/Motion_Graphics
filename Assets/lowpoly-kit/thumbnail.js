// usage: node thumbnail.js <sim> <time> <out.jpg> "<small line>" "<big line>" "<accent line>"
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/claude/')('playwright');
const root=path.dirname(new URL(import.meta.url).pathname), [sim,t,out,small,big,accent]=process.argv.slice(2);
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>fs.readFile(path.join(root,decodeURIComponent(q.url.split('?')[0])),(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':types[path.extname(q.url)]||'application/octet-stream'}); r.end(d); }));
await new Promise(ok=>srv.listen(0,ok));
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}}); await p.goto(`http://localhost:${srv.address().port}/${sim}.html`); await p.waitForFunction('window.ready===true',null,{timeout:120000}); await p.evaluate(()=>document.fonts.ready);
await p.evaluate(([t,small,big,accent])=>{ window.renderAt(+t); for(const id of ['title','hud','bar','cap','fade']) document.getElementById(id).style.display='none';
  const d=document.createElement('div'); d.style.cssText='position:absolute;left:60px;right:60px;top:190px;text-align:center;color:#fff;font-family:Jost;text-shadow:0 3px 10px #000b,0 0 34px #0009'; d.innerHTML=`<div style="font:600 italic 76px/1.1 Corm">${small}</div><div style="font-weight:400;font-size:150px;line-height:1.02;letter-spacing:.015em;margin-top:18px">${big}</div><div style="font-weight:400;font-size:66px;letter-spacing:.06em;color:#8fe3ff;margin-top:22px">${accent}</div>`; document.body.appendChild(d); },[t,small,big,accent]);
await p.evaluate(()=>document.fonts.ready); await p.screenshot({type:'jpeg',quality:94,path:out}); await b.close(); srv.close();
