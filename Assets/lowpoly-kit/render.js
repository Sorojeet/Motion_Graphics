// usage: node render.js stills 1 8 15  |  node render.js video [sim] 
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { spawn } from 'node:child_process'; import { createRequire } from 'node:module';
const require = createRequire('/home/claude/');
const { chromium } = (()=>{ try { return require('playwright'); } catch { return require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright'); } })();
const root = path.dirname(new URL(import.meta.url).pathname);
const types = {'.html':'text/html','.js':'text/javascript','.woff2':'font/woff2'};
const srv = http.createServer((q,r)=>{ const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}); r.end(d);});});
await new Promise(ok=>srv.listen(0,ok)); const port=srv.address().port;
const [mode,...args]=process.argv.slice(2); const W=1080,H=1920,FPS=30;
fs.mkdirSync(path.join(root,'out'),{recursive:true});
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
p.on('pageerror',e=>{console.error('PAGEERROR',e);process.exit(1)}); p.on('console',m=>{if(m.type()==='error')console.error(m.text())});
await p.goto(`http://localhost:${port}/heat.html`); await p.waitForFunction('window.ready===true',null,{timeout:120000});
await p.evaluate(()=>document.fonts.ready);
if(mode==='stills'){ for(const t of args.map(Number)){ const s=Date.now(); await p.evaluate(t=>window.renderAt(t),t);
    await p.screenshot({type:'jpeg',quality:92,path:path.join(root,'out',`still_${String(t).padStart(4,'0')}.jpg`)}); console.log(t,Date.now()-s,'ms'); } }
else { const dur=await p.evaluate(()=>window.DURATION), n=Math.round(dur*FPS), tmp=path.join(root,'out','heat.tmp.mp4'), fin=path.join(root,'out','heat.mp4');
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','-movflags','+faststart',tmp],{stdio:['pipe','inherit','inherit']});
  const s=Date.now(); for(let i=0;i<n;i++){ await p.evaluate(t=>window.renderAt(t),i/FPS); const j=await p.screenshot({type:'jpeg',quality:92});
    if(!ff.stdin.write(j)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%30===0)console.log(i,'/',n,((Date.now()-s)/1000|0)+'s'); }
  ff.stdin.end(); const c=await new Promise(r=>ff.on('close',r)); if(c===0){fs.renameSync(tmp,fin);console.log('done',fin);} else console.error('ffmpeg',c); }
await b.close(); srv.close();
