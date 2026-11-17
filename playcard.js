'use strict';
// Play summary card: after each play, ONE small card shows everything that happened (the result, who made the play,
// first down, big play, down and distance). Before, several pieces of code each wrote to the same chip in the middle
// of the field, so the last one won and the chip covered the action. Now they are collected into a single card that
// sits at the top of the screen. It replaces the old center chip (#res); switch it off to get the old chip back.
// Loaded last. It wraps xBanner and showRes, so the original code stays untouched.
{const a=['Presentation','pcard','Play summary card','After every play, one small card at the top of the screen sums it up: the result, who made the play, first down, big play and down and distance. It replaces the old chip in the middle of the field. Turn it off to get the old chip back.'];
 if(!FEATS.some(f=>f[1]==a[1])){let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)}}
const pcdPos=()=>({t:1,l:1,r:1,c:1})[OPT.pcpos]?OPT.pcpos:'t';
// how important each headline is (the most important one becomes the big title, the rest become small tags)
const pcdPri=t=>/PICK SIX|SCOOP AND SCORE|RETURN TOUCHDOWN/.test(t)?100:/^TOUCHDOWN/.test(t)?90:/^(FIELD GOAL|2-POINT GOOD|EXTRA POINT GOOD)$/.test(t)?80
 :/INTERCEPT|FUMBLE|SAFETY|TURNOVER ON DOWNS|SACKED|BLOCKED/.test(t)?70:/^FLAG/.test(t)?65:/CATCH/.test(t)?60:/NO GOOD|MISSED|FAILS/.test(t)?55:/^FIRST DOWN/.test(t)?40:/YARDS$/.test(t)?30:20;
// who made the play, from the play that just ended (names only when we really know them)
function pcdWho(){try{if(!P||!G)return'';const n=p=>p?xNm(p):'',m=G.msg||'',q=n(P.passer),r=n(P.rec),t=n(P.tkl),stop=t?' · stopped by '+t:'';
 if(/INTERCEPT/.test(m))return q&&P.intBy?`${q} picked off by ${n(P.intBy)}`:'';
 if(/SACK/.test(m)){const qb=q||n(P.off&&P.off[0]);return t&&qb?`${t} sacks ${qb}`:''}
 if(/Incomplete/.test(m))return q?`${q} pass incomplete`:'';
 if(P.rec&&q&&/Gain of|Loss of|TOUCHDOWN|FIRST DOWN/.test(m))return`${q} to ${r}${stop}`;
 const c=P.b&&P.b.c?n(P.b.c):'';
 if(c&&(!P.kr||/Returned/.test(m))&&/Gain of|Loss of|TOUCHDOWN|FIRST DOWN|Returned/.test(m))return`${c} ${/Returned/.test(m)?'returns it':'carries'}${stop}`;
 return''}catch(e){return''}}
// merge everything collected for one play into one card
function pcdBuild(q){q=q.map(x=>{let t=String(x.t||'');
  if(/^TACKLED IN THE END ZONE/.test(t))t='TOUCHBACK';
  else if(t.length>=26&&G&&G.msg){const f=G.msg.split(/[.!]/)[0].toUpperCase();if(f.startsWith(t)&&f.length>t.length){const cut=f.slice(0,36);t=cut.length<f.length?cut.replace(/\s+\S*$/,''):f}}
  return Object.assign({},x,{t})});
 const seen=new Set(),items=[];q.forEach(x=>{const k=String(x.t||'').trim();if(!k||seen.has(k))return;seen.add(k);items.push(x)});if(!items.length)return null;
 let h=items[0];items.forEach(x=>{if(pcdPri(x.t)>pcdPri(h.t))h=x});
 const tags=[],add=t=>{if(t&&t!==h.t&&!tags.includes(t))tags.push(t)};
 items.forEach(x=>{if(x===h)return;if(/^TOUCHDOWN/.test(x.t)&&pcdPri(h.t)>=90)return;add(x.t)});
 const m=(G&&G.msg)||'',gm=m.match(/Gain of (\d+)/),scoring=pcdPri(h.t)>=80;
 if(/FIRST DOWN/.test(m)&&!/^FIRST DOWN/.test(h.t)&&!scoring)add('FIRST DOWN');
 if(gm&&+gm[1]>=20&&!scoring)add('BIG PLAY');
 const subs=[];items.forEach(x=>String(x.s||'').split(' · ').forEach(p=>{p=p.trim();if(p&&!subs.includes(p))subs.push(p)}));
 if(gm&&!scoring&&!/YARDS$|^FIRST DOWN/.test(h.t)&&!tags.some(t=>/YARDS/.test(t))&&!subs.some(t=>new RegExp('\\b'+gm[1]+'\\b').test(t)))add('+'+gm[1]+' YDS');
 return{t:h.t,c:h.c||'inc',tags:tags.slice(0,3),who:pcdWho(),s:subs.slice(0,2).join(' · ')}}
function pcdShow(q){const d=pcdBuild(q),e=$('playcard');if(!d||!e)return;e.className='';void e.offsetWidth;
 e.querySelector('.pc-h').textContent=d.t;e.querySelector('.pc-tags').innerHTML=d.tags.map(t=>`<b>${esc(t)}</b>`).join('');
 e.querySelector('.pc-w').textContent=d.who;e.querySelector('.pc-s').textContent=d.s;e.className='show '+d.c+' p-'+pcdPos()}
// collect every banner call that happens while one play result is being shown
let pcdQ=null;
{const _xb=xBanner;xBanner=function(t,s,cls){const r=_xb.apply(this,arguments);
  if(feat('pcard')){if(pcdQ)pcdQ.push({t,s:s||'',c:cls||'inc'});else pcdShow([{t,s:s||'',c:cls||'inc'}])}return r}}
{const _sr=showRes;showRes=function(){if(!feat('pcard'))return _sr.apply(this,arguments);
  const e=$('res'),prev=pcdQ;let q;pcdQ=[];
  try{if(e){e.querySelector('.t').textContent='';e.querySelector('.s').textContent=''}_sr.apply(this,arguments)}finally{q=pcdQ;pcdQ=prev}
  try{if(e){const t=e.querySelector('.t').textContent;if(t)q.push({t,s:e.querySelector('.s').textContent,c:(e.className.match(/\b(td|good|bad|inc|flag)\b/)||[])[1]||'inc'})}}catch(x){}
  pcdShow(q)}}
// the card and its look
(()=>{const w=$('wrap');if(!w||!w.insertAdjacentHTML)return;
 w.insertAdjacentHTML('beforeend','<div id="playcard"><div class="pc-in"><i class="pc-bar"></i><div class="pc-body"><div class="pc-h"></div><div class="pc-tags"></div><div class="pc-w"></div><div class="pc-s"></div></div></div></div>');
 const st=document.createElement('style');st.textContent=`body.pc-on #res{display:none!important}
#playcard{position:absolute;z-index:4;pointer-events:none;opacity:0;left:50%;top:76px;transform:translateX(-50%);max-width:min(440px,70vw);font-family:"Trebuchet MS",sans-serif}
#playcard.p-l{left:12px;top:96px;transform:none}#playcard.p-r{left:auto;right:12px;top:96px;transform:none}#playcard.p-c{top:38%;transform:translate(-50%,-50%)}
#playcard .pc-in{display:flex;border-radius:8px;overflow:hidden;background:#0b1626e6;box-shadow:0 6px 18px #0007;color:#fff}
#playcard .pc-bar{width:7px;flex:none;background:#64748b}#playcard.good .pc-bar{background:#22c55e}#playcard.bad .pc-bar{background:#ef4444}#playcard.td .pc-bar{background:#facc15}#playcard.flag .pc-bar{background:#f59e0b}
#playcard .pc-body{padding:7px 14px 8px 11px;min-width:0}
#playcard .pc-h{font:900 22px "Trebuchet MS",sans-serif;letter-spacing:1px;line-height:1.1}#playcard.td .pc-h{color:#facc15}
#playcard .pc-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px}#playcard .pc-tags:empty{display:none}
#playcard .pc-tags b{font:800 11px "Trebuchet MS",sans-serif;letter-spacing:.6px;padding:2px 8px;border-radius:999px;background:#ffffff22}
#playcard .pc-w{font:600 13px "Trebuchet MS",sans-serif;margin-top:5px;color:#dbe7f5}#playcard .pc-s{font:600 12px "Trebuchet MS",sans-serif;margin-top:3px;color:#ffd84d}
#playcard .pc-w:empty,#playcard .pc-s:empty{display:none}
#playcard.show{animation:pcdIn 3.4s ease-out forwards}
@keyframes pcdIn{0%{opacity:0;margin-top:-12px}8%{opacity:1;margin-top:0}88%{opacity:1}100%{opacity:0}}`;
 document.head.appendChild(st)})();
// keep the old chip hidden only while the new card is on
{const _ca=ctlApply;ctlApply=function(){_ca.apply(this,arguments);if(document.body&&document.body.classList)document.body.classList.toggle('pc-on',feat('pcard'))}}
ctlApply();
// the card goes away as soon as the next play starts
setInterval(()=>{try{const e=$('playcard');if(e&&e.classList.contains('show')&&(typeof G=='undefined'||!G||G.phase!='post'))e.className=''}catch(x){}},120);
// where the card sits: a small picker on the Game features page
{const _fu=featUI;featUI=function(...a){const r=_fu.apply(this,a);try{if(!feat('pcard'))return r;const h=$('modal').querySelector('h1');if(h){const cur=pcdPos(),bt=(on,f,n)=>`<button class="${on?'on':''}" onclick="${f}">${n}</button>`;
 h.insertAdjacentHTML('afterend',`<div class="cardx" style="margin:8px 0 14px"><h4>Play summary card position</h4><div class="row">${[['t','Top'],['l','Left corner'],['r','Right corner'],['c','Middle']].map(([v,n])=>bt(cur==v,`OPT.pcpos='${v}';optSave();featUI()`,n)).join('')}</div><p class="small">Where the card shows up after each play. Top stays out of the way.</p></div>`)}}catch(e){}return r}}
