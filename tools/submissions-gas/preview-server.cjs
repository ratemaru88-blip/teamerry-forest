const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const port = Number(process.argv[2] || 8840);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.tbalance':'application/json','.tsv':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.webm':'video/webm','.mp4':'video/mp4'};
http.createServer((req,res)=>{
  let file;
  try { const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); file=path.resolve(root,'.'+pathname); }
  catch (_) {res.writeHead(400);return res.end();}
  if (!file.startsWith(root+path.sep)) {res.writeHead(403);return res.end();}
  if (req.method !== 'GET' && req.method !== 'HEAD') {res.writeHead(405);return res.end();}
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    if(req.method==='HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}).listen(port,'127.0.0.1',()=>console.log('Read-only preview: http://127.0.0.1:'+port));
