'use strict';
// 1) Touchdown fix: a runner who is tackled (or steps out) after the ball has crossed the goal line scores.
// 2) Access codes: the game asks for an access code the first time it opens on a device. Codes look like
//    ABCD-EFGH-JKLM and are made with the separate code maker page (kept by the game's owner, not shipped).
{const _ep=endPlay;endPlay=function(k,x){try{if(P&&!P.over&&!G.two&&(k=='tackle'||k=='sack')){const d=G.dir,gl=d>0?110:10,c=P.b&&P.b.st=='carry'?P.b.c:null,cx=c?c.x:null;
 if((x!=null&&(x-gl)*d>=0)||(cx!=null&&(cx-gl)*d>=0)){k='td';x=null}}}catch(e){}return _ep(k,x)}}
// ---------- access codes ----------
const LK_A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',LK_S='eb7e8c5aa23d0bd87bc7308941cf98bd',LK_REV=[];
function lkHash(str,seed){let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
 h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return[h1>>>0,h2>>>0]}
function lkSig(id){const[a,b]=lkHash(LK_S+':'+id,7);let s='',n=a,m=b;for(let i=0;i<8;i++){const v=i<5?(n>>>(i*6))&31:(m>>>((i-5)*6))&31;s+=LK_A[v]}return s}
function lkClean(c){return String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'')}
function lkValid(c){const k=lkClean(c);if(k.length!=12||[...k].some(ch=>!LK_A.includes(ch)))return false;const id=k.slice(0,4);if(LK_REV.includes(id))return false;return k.slice(4)===lkSig(id)}
function lkFmt(c){const k=lkClean(c);return k.slice(0,4)+'-'+k.slice(4,8)+'-'+k.slice(8,12)}
function licOK(){try{return lkValid(localStorage.getItem('gdlic'))}catch(e){return false}}
function lkGate(){if(licOK())return;const d=document.createElement('div');d.id='lkg';d.innerHTML=`<div class="lkb"><div class="lkl">GL</div><h1>Gridiron Lab</h1><p>Enter the access code you were given to play.</p>
 <input id="lki" maxlength="16" placeholder="XXXX-XXXX-XXXX" autocomplete="off" spellcheck="false"><button id="lkb">Unlock</button><p id="lke" class="lke"></p><p class="lks">You only need to do this once on each computer or browser.</p></div>`;document.body.appendChild(d);
 const s=document.createElement('style');s.textContent=`#lkg{position:fixed;inset:0;z-index:100;background:radial-gradient(circle at 50% 30%,#1f3a2c,#07100b);display:flex;align-items:center;justify-content:center;font-family:"Trebuchet MS",sans-serif;color:#e8f0ea}
 #lkg .lkb{background:#0b1410ee;border:2px solid #ffd84d;border-radius:16px;padding:28px 30px;width:min(420px,90vw);text-align:center;box-shadow:0 10px 40px #000a}#lkg h1{margin:6px 0 4px}#lkg .lkl{width:64px;height:64px;margin:0 auto;border-radius:50%;background:linear-gradient(#2563eb,#1e3a8a);border:3px solid #ffd84d;display:flex;align-items:center;justify-content:center;font:900 22px "Trebuchet MS",sans-serif}
 #lki{width:100%;box-sizing:border-box;font:700 22px monospace;letter-spacing:3px;text-align:center;padding:10px;border-radius:10px;border:2px solid #475569;background:#f8fafc;color:#0b1410;margin:10px 0}#lkb{width:100%;padding:12px;font:800 17px "Trebuchet MS",sans-serif;border:0;border-radius:10px;background:#d6402f;color:#fff;cursor:pointer}
 #lkg .lke{color:#fca5a5;min-height:20px;font-weight:700}#lkg .lks{font-size:12px;color:#9fb5a8}`;document.head.appendChild(s);
 const go=()=>{const v=$('lki').value;if(lkValid(v)){try{localStorage.setItem('gdlic',lkFmt(v))}catch(e){}d.remove()}else $('lke').textContent='That code doesn\'t work. Check it and try again.'};
 $('lkb').onclick=go;$('lki').addEventListener('keydown',e=>{e.stopPropagation();if(e.key=='Enter')go()});setTimeout(()=>{try{$('lki').focus()}catch(e){}},50)}
// while the lock screen is up, the game ignores the keyboard
addEventListener('keydown',e=>{if(document.getElementById('lkg')&&e.target&&e.target.id!='lki'){e.stopImmediatePropagation();e.preventDefault()}},true);
lkGate();
