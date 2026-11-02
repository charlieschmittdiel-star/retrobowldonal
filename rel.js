'use strict';
// Release touches: a new league starts with some unsigned free agents, the career home screen gets the
// "Around the league" headlines, and the line-fight words (bull, swim, anchor...) only show when you're the one rushing.
{const add=[['Franchise','fa1','Starting free agents','A new league starts with about 30 unsigned players, so the Free agents page has someone to sign in season 1.'],
 ['Presentation','lw2','Quiet line fights','Only show the line-fight words (bull, swim, rip, anchor...) when you are the one rushing the passer.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- starting free agents ----------
const FA1N={QB:2,RB:3,WR:4,TE:2,OL:5,DL:4,LB:3,CB:3,S:2,K:1,P:1};
function fa1Fill(){if(!R||R.fa1||R.season!=1||!R.lg||!feat('fa1'))return;R.fa1=1;if(R.pl.some(p=>p.tid===-1))return save();
 Object.keys(FA1N).forEach(g=>{if(!GR.includes(g))return;for(let i=0;i<FA1N[g];i++){const age=24+(rnd()*9|0),p=mkPl(g,age,50+rnd()*13,age<27?10:4,-1);p.exp=R.season;p.sal=Math.max(MINSAL,Math.min(p.sal,salFor(p)));R.pl.push(p)}});save()}
try{fa1Fill()}catch(e){console.error(e)}
{const _nf=newFranchise;newFranchise=function(...a){const r=_nf.apply(this,a);try{fa1Fill()}catch(e){console.error(e)}return r}}
// ---------- league headlines on the career home screen ----------
{const _ch=careerHub;careerHub=function(...a){const r=_ch.apply(this,a);try{if(!CAR()||!R.me||(G&&G.live)||!feat('news2'))return r;const d=$('modal').querySelector('.dash');if(!d||d.querySelector('.lgnews'))return r;
 const L=(R.lnews||[]).slice(0,6),nc=card('Around the league',(L.length?L.map(n=>`<p class="news"><span class="ntag ${n.k}">${NTAG[n.k]||n.k}</span>${esc(n.t)}</p>`).join(''):'<p class="dim">Headlines from around the league show up here after each week.</p>')+`<div class="btns">${B('newsUI()','All news')}</div>`,'lgnews');
 d.insertAdjacentHTML('beforeend',nc)}catch(e){console.error(e)}return r}}
// ---------- quiet line fights ----------
const LW2=new Set(['bull','swim','rip','spin','anchor','punch','slide']);
function lwHide(p){if(!feat('lw2')||!p||!LW2.has(p.mv))return false;if(P&&P.b&&P.b.st=='carry'&&P.b.c===p)return false;return !((p.uRush||0)>0)}
{const _rm=rushMove;rushMove=function(m,...a){const p=cd,o=p&&p.eng;const r=_rm(m,...a);try{if(p&&p.ml>0&&p.mv==m){p.uRush=.8;if(o)o.uRush=.8}}catch(e){}return r}}
{const _st=step;step=function(dt){_st(dt);try{if(P)P.off.concat(P.def).forEach(p=>{if(p.uRush>0)p.uRush-=dt})}catch(e){}}}
// ---------- link to the basketball game (Hardwood Lab, in the hoops folder; it has its own saves) ----------
{const add=[['Presentation','hoops','Basketball link','Shows a link to Hardwood Lab, the basketball game, at the bottom of the sidebar. The two games keep separate saves.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// in the downloaded copy, pass this computer's device ID and code along so the basketball game never asks for a second one
function hoopHref(){try{if(location.protocol==='file:'){const d=localStorage.getItem('gddev'),k=localStorage.getItem('gdlic');if(d&&k)return'hoops/index.html?d='+encodeURIComponent(d)+'&k='+encodeURIComponent(k)}}catch(e){}return'hoops/index.html'}
const HOOPL='<a class="ni" href="hoops/index.html" onclick="this.href=hoopHref()" style="margin-top:auto;text-decoration:none;color:#fdba74">&#127936; Basketball</a>';
{const _sh=shellHTML;shellHTML=function(...a){const r=_sh.apply(this,a);try{if(feat('hoops')&&typeof r=='string'&&r.includes('</aside>'))return r.replace('</aside>',HOOPL+'</aside>')}catch(e){}return r}}
// the first screen can be drawn before this file loads, so add the link to it once the page is ready
addEventListener('load',()=>{try{if(!feat('hoops'))return;const s=document.querySelector('.side');if(s&&!s.querySelector('a[href="hoops/index.html"]'))s.insertAdjacentHTML('beforeend',HOOPL)}catch(e){}});
