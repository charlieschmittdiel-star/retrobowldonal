'use strict';
// Dirty uniforms (grass and mud stains that build up as players hit the turf), a TV-style drive chart after every
// scoring drive, and stadium variety (open bowl, modern two-deck, dome, college bleachers). Each has a switch.
{const add=[['Presentation','dirt','Dirty uniforms','Grass and mud stains build up on players who hit the ground during the game, faster in rain and snow.'],
 ['Presentation','drivec','Drive chart','A TV graphic after each scoring drive: plays, yards, time and a map of the drive.'],
 ['Presentation','stad2','Stadium variety','Each team has its own stadium: open bowl, modern two-deck, dome (no weather) or college bleachers. Pick yours in Team settings.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- dirty uniforms ----------
function dtAdd(p,v){if(!G||!p||!feat('dirt'))return;const k=p.pid||(p.t+p.s+p.i);G.dirt=G.dirt||{};const m=G.wx=='rain'||G.wx=='snow'?1.7:1;G.dirt[k]=Math.min(1,(G.dirt[k]||0)+v*m)}
const dtOf=p=>G&&G.dirt?G.dirt[p.pid||(p.t+p.s+p.i)]||0:0;
{const _rt=ragTackle;ragTackle=function(p,h){_rt(p,h);try{dtAdd(p,.12);dtAdd(h,.14)}catch(e){}}}
{const _sp=sprite;sprite=function(p,t){const hy=_sp(p,t);try{const v=feat('dirt')?dtOf(p):0;if(v>.04&&!p.gone){const k=scY(p.y),u=2.6*k,s=P2(p.x,p.y),jz=(p.jz||0)*GZ*k,f=Math.cos(p.fa)>=0?1:-1,n=Math.min(7,Math.ceil(v*7)),mud=G.wx=='rain'||G.wx=='snow';
 let h=(((p.pid||p.i+1)*2654435761)>>>0);const rr=()=>{h=(h*1103515245+12345)>>>0;return(h>>>8)/16777216};X.globalAlpha=.35+.4*v;
 for(let i=0;i<n;i++){const x=(rr()*3.2-1.6)*f,y=.6+rr()*(i<4?3.4:7),w=.6+rr()*.9;X.fillStyle=mud?(i%2?'#5b4330':'#4a3826'):(i%2?'#3f6b34':'#557a3c');X.fillRect(s[0]+x*u,s[1]-jz-(y+w)*u,w*u,w*u*.8)}X.globalAlpha=1}}catch(e){X.globalAlpha=1}return hy}}
// falls from dives, slides and missed dives get dirty too
{const _st=step;step=function(dt){_st(dt);try{if(feat('dirt')&&P&&G.phase=='play')P.off.concat(P.def).forEach(p=>{if(p.fall&&!p._dtf){p._dtf=1;dtAdd(p,.1)}else if(!p.fall)p._dtf=0;if(p.an&&p.an.k=='dive'&&!p._dtd){p._dtd=1;dtAdd(p,.12)}else if(!(p.an&&p.an.k=='dive'))p._dtd=0})}catch(e){}}}
// ---------- drive chart ----------
const DC={dr:null,show:null};
{const _su=setup;setup=function(...a){const r=_su.apply(this,a);try{if(G&&P&&!P.kk&&!P.kr){if(!DC.dr||DC.dr.poss!==G.poss||DC.dr.g!==G)DC.dr={g:G,poss:G.poss,dir:G.dir,start:P.L,q:G.q,clk:G.clk,pts:[P.L],n:0}}}catch(e){}return r}}
{const _ep=endPlay;endPlay=function(k,x){const live=P&&!P.over&&!P.kr&&!G.two&&DC.dr&&DC.dr.poss===G.poss,dr=DC.dr;_ep(k,x);try{if(!live||!P.over)return;dr.n++;const gl=dr.dir>0?110:10;
 const ex=k=='td'?gl:x!=null?x:P.L;dr.pts.push(ex);if(k=='td'&&feat('drivec'))dcShow(dr,'TOUCHDOWN')}catch(e){}}}
{const _ke=kEnd;kEnd=function(...a){const kk=P&&P.kk,dr=DC.dr;const r=_ke.apply(this,a);try{if(kk&&kk.kind=='fg'&&/GOOD/.test(G.msg)&&dr&&feat('drivec')&&dr.n>0)dcShow(dr,'FIELD GOAL')}catch(e){}return r}}
function dcShow(dr,what){const ql=typeof QLEN=='function'?QLEN():900,el=Math.max(0,Math.round((G.q-dr.q)*ql+dr.clk-G.clk)),gl=dr.dir>0?110:10,last=dr.pts[dr.pts.length-1];
 DC.show={t:6,what,team:dr.poss,n:dr.n,yd:Math.round((last-dr.start)*dr.dir),el,pts:dr.pts.slice(),dir:dr.dir,start:dr.start};DC.dr=null}
function dcDraw(dt){const s=DC.show;if(!s)return;s.t-=dt;if(s.t<=0){DC.show=null;return}if(G.phase=='replay')return;
 const ks=typeof KS=='number'?KS:1;X.setTransform(ks,0,0,ks,0,0);const a=Math.min(1,s.t*2,(6-s.t)*4),w=330,h=118,x0=W-w-14,y0=H-h-58;X.save();X.globalAlpha=a;
 const c=s.team=='U'?teamCol(0):teamCol(G.opp.i),nm=s.team=='U'?R.lg.t[0].n:G.opp.n;X.fillStyle='#0b1410ee';X.fillRect(x0,y0,w,h);X.fillStyle=c[0];X.fillRect(x0,y0,6,h);X.fillRect(x0,y0,w,26);
 X.fillStyle='#fff';X.font='900 13px "Trebuchet MS",sans-serif';X.textAlign='left';X.fillText(`${tAbbr(nm).toUpperCase()} SCORING DRIVE`,x0+14,y0+18);X.textAlign='right';X.fillStyle='#ffd84d';X.fillText(s.what,x0+w-10,y0+18);
 const mm=Math.floor(s.el/60),ss=String(s.el%60).padStart(2,'0'),st=[[s.n,'PLAYS'],[s.yd,'YARDS'],[`${mm}:${ss}`,'TIME']];X.textAlign='center';
 st.forEach(([v,l],i)=>{const cx=x0+14+(w-28)*(i+.5)/3;X.fillStyle='#fff';X.font='800 20px "Trebuchet MS",sans-serif';X.fillText(String(v),cx,y0+52);X.fillStyle='#9fb5a8';X.font='700 9px sans-serif';X.fillText(l,cx,y0+64)});
 // the drive on a strip of field: own goal line to the opponent's
 const fx0=x0+18,fw=w-36,fy=y0+82,fh=22,fxOf=v=>fx0+fw*((s.dir>0?v-10:110-v)/100);X.fillStyle='#1f6b2a';X.fillRect(fx0,fy,fw,fh);X.fillStyle=c[1];X.fillRect(fx0+fw,fy,8,fh);X.fillRect(fx0-8,fy,8,fh);
 X.strokeStyle='#ffffff40';X.lineWidth=1;for(let i=1;i<10;i++){X.beginPath();X.moveTo(fx0+fw*i/10,fy);X.lineTo(fx0+fw*i/10,fy+fh);X.stroke()}
 const P_=s.pts;for(let i=1;i<P_.length;i++){const a0=fxOf(P_[i-1]),a1=fxOf(P_[i]),yy=fy+4+((i-1)%3)*6;X.strokeStyle=(P_[i]-P_[i-1])*s.dir>=0?'#4ade80':'#f87171';X.lineWidth=3;X.beginPath();X.moveTo(a0,yy);X.lineTo(a1,yy);X.stroke();X.fillStyle='#fff';X.fillRect(a1-1.5,yy-1.5,3,3)}
 X.fillStyle='#ffd84d';X.fillRect(fxOf(s.start)-1,fy-3,2,fh+6);X.restore();X.textAlign='left'}
// ---------- stadium variety ----------
const STY=['bowl','modern','dome','college'],STN={bowl:'Open bowl',modern:'Modern two-deck',dome:'Dome (no weather)',college:'College bleachers'};
let SDEF=null;const SCACHE={};
function stadHome(){if(!G||!G.opp)return 0;return G.home=='C'?G.opp.i:0}
function stadType(i){const t=R&&R.lg&&R.lg.t[i];if(t&&t.stad&&STY.includes(t.stad))return t.stad;return i===0?'bowl':STY[hsh(i*13+5)%4]}
function stadBuild(type,i){const mk=()=>{const c=document.createElement('canvas');c.width=1600;c.height=TOP;return c},full=mk(),plain=mk(),g=full.getContext('2d'),q=plain.getContext('2d');if(!g||!g.fillRect||!q)return null;
 let seed=11+i*7;const rr=()=>(seed=(seed*16807)%2147483647)/2147483647,tc=teamCol(i),cols=['#e5e7eb','#f87171','#60a5fa','#fbbf24','#a78bfa','#34d399','#f472b6','#94a3b8',tc[0],tc[0],tc[2]],fg=cols.map(()=>[]);
 const both=f=>{f(g);f(q)},grad=(c,y0,y1,a,b)=>{const gr=c.createLinearGradient?c.createLinearGradient(0,y0,0,y1):null;if(gr){gr.addColorStop(0,a);gr.addColorStop(1,b)}c.fillStyle=gr||a;c.fillRect(0,y0,1600,y1-y0)};
 const rows=(y0,n,step,den,bg,stripe)=>{both(c=>{c.fillStyle=bg;c.fillRect(0,y0-4,1600,n*step+2)});for(let r=0;r<n;r++){const y=y0+r*step;both(c=>{c.fillStyle=r%2?stripe[0]:stripe[1];c.fillRect(0,y+6,1600,2)});
  for(let x=(r%2)*3;x<1600;x+=6){if(rr()>den)continue;const ci=rr()*cols.length|0;g.fillStyle=cols[ci];g.fillRect(x,y,4,4);g.fillStyle='#e8c39e';g.fillRect(x+1,y-2,2,2);fg[ci].push(x,y,r)}}};
 const wall=()=>{both(c=>{c.fillStyle='#111827';c.fillRect(0,TOP-12,1600,12);c.fillStyle=tc[0];for(let x=0;x<1600;x+=160)c.fillRect(x+20,TOP-9,90,6)})};
 let fy0=22,fy1=TOP-12;
 if(type=='modern'){both(c=>grad(c,0,22,'#0b1626','#1d3348'));rows(26,5,8,.85,'#262b36',['#323846','#2c3240']);both(c=>{c.fillStyle='#0f172a';c.fillRect(0,66,1600,14);c.fillStyle='#fde68a55';for(let x=4;x<1600;x+=14)c.fillRect(x,69,9,7);c.fillStyle=tc[0];c.fillRect(0,80,1600,8);c.fillStyle='#ffffff';for(let x=30;x<1600;x+=200)c.fillRect(x,83,60,2)});
  rows(92,5,9,.88,'#2a2f3a',['#3b4252','#343a48']);wall();fy0=24;fy1=TOP-12}
 else if(type=='dome'){both(c=>{grad(c,0,40,'#171b24','#2b3140');c.strokeStyle='#3a4252';c.lineWidth=2;for(let x=-40;x<1640;x+=80){c.beginPath();c.moveTo(x,0);c.lineTo(x+40,38);c.lineTo(x+80,0);c.stroke()}c.fillStyle='#f8fafccc';for(let x=20;x<1600;x+=80)c.fillRect(x,6,24,3);c.fillStyle='#0b0f17';c.fillRect(0,38,1600,4)});
  rows(46,10,9.2,.95,'#262a33',['#353b47','#2e333e']);wall();fy0=42}
 else if(type=='college'){both(c=>{grad(c,0,62,'#6fa8dc','#cfe3f5');c.fillStyle='#1e4d2b';for(let x=-20;x<1640;x+=26){const h=10+Math.abs((x*37)%14);c.beginPath();c.ellipse(x,62-h*.5,16,h,0,0,7);c.fill()}c.fillStyle='#173f22';c.fillRect(0,56,1600,8)});
  rows(68,8,8.6,.62,'#9aa3ad',['#7b848f','#b4bcc5']);both(c=>{c.fillStyle='#7c2d12';c.fillRect(0,TOP-12,1600,12);c.fillStyle='#9a3412';for(let y=TOP-12;y<TOP;y+=4)for(let x=(y%8?0:10);x<1600;x+=20)c.fillRect(x,y,18,3);c.fillStyle=tc[0];for(let x=60;x<1600;x+=400)c.fillRect(x,TOP-11,120,10)});fy0=64}
 return{full,plain,fans:{cols,g:fg,bg:ox=>{X.drawImage(plain,0,fy0,1600,fy1-fy0,ox,fy0,1600,fy1-fy0)}}}}
function stadGet(){if(!feat('stad2')||!G||!G.opp||!R||!R.lg)return null;const i=stadHome(),ty=stadType(i);if(ty=='bowl')return null;const c=teamCol(i),key=ty+':'+i+':'+c.join('');if(!SCACHE[key])SCACHE[key]=stadBuild(ty,i);return SCACHE[key]}
function stadFans(){try{const s=stadGet();return s?s.fans:null}catch(e){return null}}
{const _df=drawField;drawField=function(...a){try{if(typeof STANDS!='undefined'){const s=stadGet();if(s){if(SDEF===null)SDEF=buildStands()||0;STANDS=s.full}else if(SDEF!==null)STANDS=SDEF}}catch(e){}return _df.apply(this,a)}}
{const _xn=xNewGame;xNewGame=function(...a){const r=_xn.apply(this,a);try{if(feat('stad2')&&stadType(stadHome())=='dome'){const was=G.wx;G.wx='clear';G.wind={x:0,y:0,m:0};G.night=false;if(G.pbp&&G.pbp.length)G.pbp[G.pbp.length-1]=G.pbp[G.pbp.length-1].replace(/\. [^.]*(\.|$).*/,'. Indoors, in the dome.')}}catch(e){}return r}}
{const _tu=teamUI;teamUI=function(...a){const r=_tu.apply(this,a);try{if(!feat('stad2'))return r;const b=$('modal').querySelector('.btns');const T=R.lg.t[0],cur=stadType(0);if(b)b.insertAdjacentHTML('beforebegin',`<p>Stadium <select id="tstad">${STY.map(s=>`<option value="${s}" ${s==cur?'selected':''}>${STN[s]}</option>`).join('')}</select> <span class="small dim">A dome means no rain, snow or wind at home.</span></p>`)}catch(e){}return r}}
{const _ts=teamSave;teamSave=function(...a){try{const s=$('tstad');if(s&&STY.includes(s.value))R.lg.t[0].stad=s.value}catch(e){}return _ts.apply(this,a)}}
// ---------- frame hook ----------
let DCL=0;{const _dr=draw;draw=function(){const now=performance.now()/1000,dt=Math.min(.05,DCL?now-DCL:0);DCL=now;_dr();try{if(G&&P&&feat('drivec'))dcDraw(dt)}catch(e){console.error(e)}}}
