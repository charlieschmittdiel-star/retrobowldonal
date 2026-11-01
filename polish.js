'use strict';
// Polish: a cinematic camera (smooth panning that leads the play, a push-in on touchdowns and big plays with
// letterbox bars), smoother saving during games, and faster menus. Each has a switch on the Game features page.
{const add=[['Presentation','cam2','Cinematic camera','Smooth panning that looks ahead of the play, and a zoom on touchdowns and big plays after the whistle.'],
 ['Presentation','fastsave','Smoother saving during games','During a game, saves every 15 seconds and at the end instead of after every play, so there is no hitch between plays.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- camera ----------
const CZ={z:1,fx:0,fy:0,lb:0,dt:1/60,last:0,ev:null,intr:0};
{const _ct=camTgt,_ck=camK;
 camTgt=function(b,L){const t=_ct(b,L);try{if(!feat('cam2')||!P||G.phase!='play')return t;const m=OPT.cam||'b';
  if(b.st=='air'&&b.tx!=null&&m!='w')return t+(b.tx-b.x)*.35;if(b.st=='carry'&&b.c&&m=='b')return t+clamp(b.c.vx||0,-9,9)*.3}catch(e){}return t};
 camK=function(){const k=_ck();if(!feat('cam2'))return k;return 1-Math.pow(1-k,Math.min(3,CZ.dt*60))}}
{const _ep=endPlay;endPlay=function(k,x){const ov=!P||P.over,L0=P&&P.L,d=G.dir,c=P&&P.b?P.b.c:null,kr=P&&P.kr;_ep(k,x);try{if(ov||!P||!P.over)return;let big=0;
 if(k=='td')big=2;else if(k=='sack'||k=='safety')big=1;else if(k=='tackle'&&x!=null&&!kr&&(x-L0)*d>=20)big=1;if(CZ.intr)big=Math.max(big,1);if(G.bigHit>0)big=Math.max(big,1);CZ.intr=0;
 CZ.ev=big?{k:big,p:c||null,x:x!=null?x:P.b.x,y:P.b.y}:null}catch(e){}}}
{const _ir=intReturn;intReturn=function(...a){CZ.intr=1;return _ir.apply(this,a)}}
function camTick(dt){let tz=1,sub=null,lb=0;
 if(feat('cam2')&&P&&G.phase=='post'&&!P.kk&&CZ.ev){const e=CZ.ev,cel=G.cel&&G.cel.p;tz=e.k==2?1.4:1.22;lb=e.k==2?1:0;const p=e.k==2&&cel?cel:e.p&&!e.p.gone?e.p:null;sub=p?[p.x,p.y]:[e.x,e.y]}
 if(G.phase!='post')CZ.ev=null;if(G.phase=='replay'||!feat('cam2')){CZ.z=1;CZ.lb=0;return}
 CZ.z+=(tz-CZ.z)*(1-Math.exp(-dt*(tz>CZ.z?2.4:9)));if(Math.abs(CZ.z-1)<.002)CZ.z=1;CZ.lb+=(lb-CZ.lb)*(1-Math.exp(-dt*5));if(CZ.lb<.01)CZ.lb=0;
 if(sub){const s=P2(sub[0],sub[1],1.2),fx=clamp(s[0],W*.15,W*.85),fy=clamp(s[1],TOP+20,H-40);if(CZ.z<1.01){CZ.fx=fx;CZ.fy=fy}else{const k=1-Math.exp(-dt*6);CZ.fx+=(fx-CZ.fx)*k;CZ.fy+=(fy-CZ.fy)*k}}}
function camZoomT(){const ks=typeof KS=='number'?KS:1,z=CZ.z;X.setTransform(ks*z,0,0,ks*z,ks*CZ.fx*(1-z),ks*CZ.fy*(1-z))}
function camWorld(fn){if(CZ.z<=1.001)return fn();X.save();camZoomT();try{fn()}finally{X.restore()}}
{const _sb=sbTick;sbTick=function(...a){try{if(CZ.z>1.001){const ks=typeof KS=='number'?KS:1;X.setTransform(ks,0,0,ks,0,0)}}catch(e){}return _sb.apply(this,a)}}
{const _dr=draw;draw=function(){const now=performance.now()/1000,dt=Math.min(.05,CZ.last?now-CZ.last:1/60);CZ.last=now;CZ.dt=dt||1/60;let o=null;
 try{if(G&&P){camTick(dt);if(CZ.z>1.001){o=X.setTransform;const z=CZ.z;X.setTransform=function(a,b,c,d,e,f){X.setTransform=o;return o.call(X,a*z,b,c,d*z,e+a*CZ.fx*(1-z),f+d*CZ.fy*(1-z))}}}}catch(e){console.error(e)}
 try{_dr()}finally{if(o)X.setTransform=o}
 try{if(CZ.lb>0&&G&&P){const ks=typeof KS=='number'?KS:1,h=Math.round(H*.085*CZ.lb);X.setTransform(ks,0,0,ks,0,0);X.fillStyle='#000';X.fillRect(0,0,W,h);X.fillRect(0,H-h,W,h)}}catch(e){}}}
// ---------- saving: during a game, at most every 15 seconds (and always at the end) ----------
let SVD=0,SVT=null,SVF=null;
{const _sv=save;SVF=()=>{SVT=null;if(SVD){SVD=0;_sv()}};
 save=function(...a){if(feat('fastsave')&&G&&G.live&&R){SVD=1;if(!SVT)SVT=setTimeout(SVF,15000);return}SVD=0;if(SVT){clearTimeout(SVT);SVT=null}return _sv.apply(this,a)}}
function saveFlush(){if(SVT){clearTimeout(SVT);SVT=null}if(SVD&&SVF){SVD=1;SVF()}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='hidden')saveFlush()});window.addEventListener('pagehide',saveFlush);window.addEventListener('beforeunload',saveFlush);
// ---------- faster menus: work out each team's lineup once per screen instead of dozens of times ----------
function memoLineup(fn){return function(...a){const L=lineup,c=new Map();if(L.__memo)return fn.apply(this,a);const m=function(t){const k=t==null?0:t;let v=c.get(k);if(!v){v=L(t);c.set(k,v)}return v};m.__memo=1;lineup=m;try{return fn.apply(this,a)}finally{lineup=L}}}
['dashHome','standings','rankUI','careerHub','statsUI','schedUI','leadersUI','tradeUI','offersUI','finUI','rosterUI'].forEach(n=>{try{const f=window[n];if(typeof f=='function')window[n]=memoLineup(f)}catch(e){}});
