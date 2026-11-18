// Thumbnail from a frame of a finished video (keeps the final grade, grain and vignette), with the series title overlay.
// usage: node thumbframe.js <video.mp4> <time> <out.jpg> "<small line>" "<big line>" "<accent line>" [accentColor] [top|bottom] [bigPx] [brightness] [brightness]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process'; import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [video,t,out,small,big,accent,acol='#ffb066',pos='bottom',bigPx='120',bright='1']=process.argv.slice(2); const root=path.dirname(new URL(import.meta.url).pathname);
const frame=path.join(root,'out','_thumbframe.png'); fs.mkdirSync(path.dirname(frame),{recursive:true}); execFileSync('ffmpeg',['-v','error','-y','-ss',String(t),'-i',video,'-frames:v','1',frame]);
const html=`<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Corm;font-style:italic;font-weight:600;src:url(/node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2)}
@font-face{font-family:Jost;font-weight:400;src:url(/node_modules/@fontsource/jost/files/jost-latin-400-normal.woff2)}
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#000} img{position:absolute;inset:0;width:1080px;height:1920px;filter:brightness(${bright}) contrast(1.05)}
#g{position:absolute;left:0;right:0;${pos==='bottom'?'bottom:0':'top:0'};height:900px;background:linear-gradient(${pos==='bottom'?'to top':'to bottom'},#000d,#0000)}
#t{position:absolute;left:60px;right:60px;${pos==='bottom'?'bottom:230px':'top:190px'};text-align:center;color:#fff;font-family:Jost;text-shadow:0 3px 10px #000b,0 0 34px #0009}
</style></head><body><img src="/out/_thumbframe.png"><div id="g"></div><div id="t"><div style="font:600 italic 76px/1.1 Corm">${small}</div><div style="font-weight:400;font-size:${bigPx}px;line-height:1.02;letter-spacing:.015em;margin-top:18px">${big}</div><div style="font-weight:400;font-size:66px;letter-spacing:.06em;color:${acol};margin-top:22px">${accent}</div></div></body></html>`;
const srv=http.createServer((q,r)=>{ if(q.url==='/'){ r.writeHead(200,{'content-type':'text/html'}); r.end(html); return; } fs.readFile(path.join(root,decodeURIComponent(q.url.split('?')[0])),(e,d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200); r.end(d); }); });
await new Promise(ok=>srv.listen(0,ok)); const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://localhost:${srv.address().port}/`); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(200); await p.screenshot({type:'jpeg',quality:94,path:out}); await b.close(); srv.close(); fs.unlinkSync(frame);
