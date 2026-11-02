// Offline support: always try the network first (so updates show up right away), and fall back to the
// saved copy when there is no connection.
const CACHE='gridiron-v28',FILES=["./", "index.html", "style.css", "data.js", "special.js", "ai.js", "moves.js", "career.js", "ragdoll.js", "game.js", "render.js", "hud.js", "playbook.js", "dash.js", "league.js", "opts.js", "kick.js", "extras.js", "field2.js", "gm.js", "desk.js", "anim.js", "more.js", "pose.js", "play2.js", "vis2.js", "menus2.js", "polish.js", "sound2.js", "more3.js", "dive.js", "play3.js", "vis3.js", "modes.js", "ease.js", "keys.js", "models.js", "anim2.js", "rp2.js", "trick.js", "lock.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!=CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET'||new URL(r.url).origin!=location.origin)return;
 e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))))});
