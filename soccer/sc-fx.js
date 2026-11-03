'use strict';
// Presentation: detailed players, portraits, celebrations, the referee, linesmen, benches and managers, stadium
// variety, night matches under floodlights, ball effects, tired players, instant replay and highlights, the lineups
// intro, TV graphics, match commentary, a postgame summary, better sound, a commentary voice, club crests and phones.
{const add=[['Presentation','model2','Detailed players','Hair styles, boots, socks and kit trim, so players look different from each other.'],
 ['Presentation','faces','Player portraits','A drawn portrait on each player page and next to names.'],
 ['Presentation','celeb','Celebrations','Scorers run to the corner flag with arms up and teammates join them.'],
 ['Presentation','side2','Referee, benches and managers','A referee and two linesmen follow play; benches and managers sit by the touchline.'],
 ['Presentation','stad2','Stadium variety','Each club has its own stadium name, mowing pattern and roof colors.'],
 ['Presentation','night','Night matches','Some matches are played at night under floodlights.'],
 ['Presentation','ballfx','Ball effects','A trail behind shots and the net bulges on goals.'],
 ['Presentation','tired','Tired players show it','Exhausted players slow their stride and show sweat.'],
 ['Presentation','replay','Instant replay','Press Y during a match to watch the last few seconds again (slow motion with S).'],
 ['Presentation','hl','Highlights','Your best goals and saves are kept on the Highlights page.'],
 ['Presentation','intro','Lineups intro','Both teams and their starting lineups are shown before kickoff.'],
 ['Presentation','lower','TV graphics','Goal graphics with the scorer\'s season total, and a match title card.'],
 ['Presentation','pbp','Match commentary','A written minute-by-minute record of the match in the pause menu.'],
 ['Presentation','postgame','Postgame summary','Player of the match, the goals with their minutes, and highlights after each match.'],
 ['Presentation','sound2','Better sound','Crowd noise that rises near the goal, a roar for goals and groans for misses.'],
 ['Presentation','voice','Commentary voice','The computer reads out goals and big moments (uses your browser\'s voice). Off by default.'],
 ['Presentation','logos','Club crests','A crest for every club next to its name.'],
 ['Presentation','phone','Phone layout','A smaller scoreboard on small screens, and a reminder to turn the phone sideways.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
HDEFOFF.add('voice');
featAll=function(v){HFEATS.forEach(f=>OPT[f[1]]=v&&HDEFOFF.has(f[1])?0:v);optSave();featUI()};
// ---------- looks: hair, boots and portraits ----------
const HAIRC=['#1f160f','#3b2314','#6b4423','#c8a165','#111','#7c2d12','#d6d3d1'],BOOT=['#111827','#f8fafc','#f97316','#22d3ee','#facc15','#ef4444','#a3e635'];
function look(p){const h=p.id*2654435761>>>0;return{hair:h%6,hc:HAIRC[(h>>3)%HAIRC.length],boot:BOOT[(h>>7)%BOOT.length],skin:SKIN[p.id%SKIN.length],beard:(h>>11)%4==0}}
{const _dp=drawPlayer;drawPlayer=function(e){_dp(e);if(!feat('model2')||!G||!e.p)return;const sl=e.act&&(e.act.k=='slide'||e.act.k=='dive');if(sl)return;try{
 const L=look(e.p),[gx,gy]=P(e.x,e.y,0),h=1.8*S*HZ,w=S*.6,sp=Math.hypot(e.vx,e.vy),run=sp>.8,sw=run?Math.sin(e.ph||0)*w*.5:0,k=e.t,home=G.tm[k]===G.home,col=R.t[G.tm[k]].col,gk=e.pos=='GK',trim=gk?'#111827':home?col[1]:col[0];
 // boots and sock tops
 CX.fillStyle=L.boot;CX.fillRect(gx-w*.18+sw-w*.2,gy-h*.06,w*.4,h*.06);CX.fillRect(gx+w*.18-sw-w*.2,gy-h*.06,w*.4,h*.06);
 CX.fillStyle=trim;CX.fillRect(gx-w*.18+sw*.6-w*.17,gy-h*.21,w*.34,h*.025);CX.fillRect(gx+w*.18-sw*.6-w*.17,gy-h*.21,w*.34,h*.025);
 // collar and sleeve trim
 CX.fillStyle=trim;CX.fillRect(gx-w*.2,gy-h*.82,w*.4,h*.025);CX.fillRect(gx-w*.48,gy-h*.82,w*.12,h*.1);CX.fillRect(gx+w*.36,gy-h*.82,w*.12,h*.1);
 // the head again, with a hair style
 const hy=gy-h*.9,r=w*.36;CX.fillStyle=L.skin;CX.beginPath();CX.arc(gx,hy,r,0,7);CX.fill();CX.fillStyle=L.hc;CX.beginPath();
 if(L.hair==0){}else if(L.hair==1){CX.arc(gx,hy-r*.08,r,Math.PI,0)}else if(L.hair==2){CX.arc(gx,hy-r*.35,r*1.15,0,7)}else if(L.hair==3){CX.arc(gx,hy-r*.08,r,Math.PI,0);CX.rect(gx-r,hy-r*.1,r*.35,r*1.1);CX.rect(gx+r*.65,hy-r*.1,r*.35,r*1.1)}else if(L.hair==4){CX.rect(gx-r*.22,hy-r*1.45,r*.44,r*.9)}else{CX.arc(gx,hy-r*.08,r,Math.PI,0);CX.arc(gx+(e.vx>=0?-1:1)*r*.9,hy,r*.32,0,7)}CX.fill();
 if(L.beard){CX.fillStyle=L.hc;CX.globalAlpha=.7;CX.beginPath();CX.arc(gx,hy+r*.25,r*.75,0,Math.PI);CX.fill();CX.globalAlpha=1}}catch(x){}}}
function faceSVG(p,sz){const L=look(p),t=p.tid>=0&&R.t[p.tid]?R.t[p.tid].col:['#475569','#e2e8f0'];sz=sz||64;
 const hair=['',`<path d="M14 30 A18 18 0 0 1 50 30 L50 26 A18 18 0 0 0 14 26Z" fill="${L.hc}"/><path d="M14 30 A18 18 0 0 1 50 30 Q32 18 14 30Z" fill="${L.hc}"/>`,`<circle cx="32" cy="22" r="20" fill="${L.hc}"/>`,`<path d="M13 32 A19 19 0 0 1 51 32 L51 48 L45 48 L45 30 Q32 20 19 30 L19 48 L13 48Z" fill="${L.hc}"/>`,`<rect x="27" y="6" width="10" height="16" rx="3" fill="${L.hc}"/>`,`<path d="M14 30 A18 18 0 0 1 50 30 Q32 18 14 30Z" fill="${L.hc}"/><circle cx="52" cy="26" r="6" fill="${L.hc}"/>`][L.hair];
 return`<svg class="face" width="${sz}" height="${sz}" viewBox="0 0 64 64" style="vertical-align:middle;border-radius:50%;background:#1e293b"><path d="M8 64 Q10 46 32 46 Q54 46 56 64Z" fill="${t[0]}"/><path d="M26 46 L32 54 L38 46Z" fill="${t[1]}"/><rect x="27" y="38" width="10" height="10" fill="${L.skin}"/>${L.hair==2?hair:''}<circle cx="32" cy="30" r="15" fill="${L.skin}"/>${L.hair!=2?hair:''}<circle cx="26" cy="30" r="1.8" fill="#111"/><circle cx="38" cy="30" r="1.8" fill="#111"/><path d="M27 37 Q32 40 37 37" stroke="#7c2d12" stroke-width="1.6" fill="none"/>${L.beard?`<path d="M18 32 Q20 46 32 46 Q44 46 46 32 Q44 40 32 41 Q20 40 18 32Z" fill="${L.hc}" opacity=".85"/>`:''}</svg>`}
{const _pu=playerUI;playerUI=function(id){_pu(id);try{if(!feat('faces'))return;const p=R.pl.find(q=>q.id===id),h=$('modal').querySelector('h2');if(p&&h)h.insertAdjacentHTML('beforebegin',`<div style="float:right;margin-left:12px">${faceSVG(p,72)}</div>`)}catch(e){}}}
{const _pl=plink;plink=function(p){return(feat('faces')?faceSVG(p,20)+' ':'')+_pl(p)}}
// ---------- club crests and stadiums ----------
const LSH=['M32 12 L38 26 L54 27 L42 37 L46 52 L32 44 L18 52 L22 37 L10 27 L26 26Z','M14 20 L32 12 L50 20 L50 34 Q50 48 32 54 Q14 48 14 34Z','M32 10 L52 32 L32 54 L12 32Z','M16 18 L48 18 L48 46 L16 46Z','M32 12 A20 20 0 1 0 32.1 12Z','M12 44 L18 20 L26 32 L32 14 L38 32 L46 20 L52 44Z'];
function logoSVG(t,sz){const T=R.t[t];if(!T)return'';sz=sz||18;const h=(T.n.length*7+t*3)%LSH.length,c=T.col;return`<svg class="logo2" width="${sz}" height="${sz}" viewBox="0 0 64 64" style="vertical-align:middle"><path d="M8 6 L56 6 L56 34 Q56 54 32 62 Q8 54 8 34Z" fill="${c[0]}" stroke="${c[1]}" stroke-width="4"/><path d="${LSH[h]}" transform="translate(9 4) scale(.72)" fill="${c[1]}" opacity=".9"/></svg>`}
{const _tl=tlink;tlink=function(t){return(feat('logos')&&R.t[t]?logoSVG(t,16)+' ':'')+_tl(t)}}
const STN=['Park','Stadium','Ground','Arena','Road','Lane'];function stadName(t){const T=R.t[t];return`${T.n.split(' ')[0]} ${STN[(t*5+T.n.length)%STN.length]}`}
// ---------- celebrations ----------
{const _st=hStep;hStep=function(dt){if(G&&G.rp)return rpStep(dt);if(G&&G.intro>0){G.intro-=dt;return}
 if(G&&G.phase=='dead'&&G.cel&&G.cel.e&&feat('celeb')&&G.cel.e.t===G.cel.k){const c=G.cel,e=c.e,s=G.dir[c.k],cx=goalX(s)-s*2,cy=e.y<34?2.5:PW-2.5;if(!c.tx){c.tx=cx;c.ty=cy}
  const go=(o,x,y,v)=>{const dx=x-o.x,dy=y-o.y,d=Math.hypot(dx,dy);if(d<1.2){o.tx=o.ty=0;return}o.tx=dx/d*v;o.ty=dy/d*v};
  go(e,c.tx,c.ty,8);e.act={k:'head',t:0};onT(c.k).forEach(o=>{if(o===e||o.pos=='GK')return;if(dist(o,e)<30)go(o,e.x-s*1.5+(o.i%3-1)*1.2,e.y+(o.i%2?1:-1)*1.2,7)});onT(opp(c.k)).forEach(o=>{o.tx*=.5;o.ty*=.5})}
 _st(dt);if(!G||G.viewer)return;
 // record for replays and highlights
 if((feat('replay')||feat('hl'))&&!G.auto&&G.phase!='over'){G.recN=(G.recN||0)+1;if(G.recN%2==0){(G.rec=G.rec||[]).push(snap());if(G.rec.length>300)G.rec.shift()}}
 if(G.hlCut&&(G.hlCut.t-=dt)<=0){const c=G.hlCut;G.hlCut=null;if(feat('hl')&&G.rec){G.hls=G.hls||[];G.hls.push({t:c.txt,fr:G.rec.slice(-170).filter((_,i)=>i%2==0),home:G.home,tm:G.tm.slice(),s:R.season,d:R.day,imp:c.imp});G.hls.sort((a,b)=>b.imp-a.imp);if(G.hls.length>8)G.hls.length=8}G.rpHint=4}
 if(G.rpHint>0)G.rpHint-=dt;if(G.lt&&G.lt.t>0)G.lt.t-=dt}}
// ---------- the referee, linesmen, benches and managers ----------
function drawFig(x,y,shirt,shorts,opt){opt=opt||{};const[gx,gy]=P(x,y,0),h=1.8*S*HZ*(opt.sit?.7:1),w=S*.6;CX.fillStyle='rgba(0,0,0,.25)';CX.beginPath();CX.ellipse(gx,gy,w*.8,w*.3,0,0,7);CX.fill();
 const sw=opt.run?Math.sin(performance.now()/90)*w*.4:0;CX.lineCap='round';CX.strokeStyle='#111827';CX.lineWidth=w*.3;CX.beginPath();CX.moveTo(gx-w*.15,gy-h*.42);CX.lineTo(gx-w*.15+sw,gy-h*.04);CX.moveTo(gx+w*.15,gy-h*.42);CX.lineTo(gx+w*.15-sw,gy-h*.04);CX.stroke();
 CX.fillStyle=shorts;CX.fillRect(gx-w*.42,gy-h*.5,w*.84,h*.13);CX.fillStyle=shirt;CX.fillRect(gx-w*.45,gy-h*.82,w*.9,h*.36);
 if(opt.flag){CX.strokeStyle='#e2e8f0';CX.lineWidth=1.5;CX.beginPath();CX.moveTo(gx+w*.5,gy-h*.55);CX.lineTo(gx+w*.5,gy-h*1.05);CX.stroke();CX.fillStyle=opt.up?'#facc15':'#ef4444';CX.fillRect(gx+w*.5,gy-h*1.05,w*.5,h*.15)}
 if(opt.arms){CX.strokeStyle=shirt;CX.lineWidth=w*.22;CX.beginPath();CX.moveTo(gx-w*.45,gy-h*.78);CX.lineTo(gx-w*.8,gy-h*.95);CX.moveTo(gx+w*.45,gy-h*.78);CX.lineTo(gx+w*.8,gy-h*.6);CX.stroke()}
 CX.fillStyle=opt.skin||'#e0ac69';CX.beginPath();CX.arc(gx,gy-h*.9,w*.34,0,7);CX.fill();CX.fillStyle='#1f160f';CX.beginPath();CX.arc(gx,gy-h*.93,w*.34,Math.PI,0);CX.fill()}
function sideItems(){const out=[];if(!feat('side2')||!G||!G.b)return out;const b=G.b;G.ref=G.ref||{x:52.5,y:30};const r=G.ref,s=b.x>52.5?1:-1;r.x+=((b.x-s*9)-r.x)*.02;r.y+=((b.y-7)-r.y)*.02;r.x=clamp(r.x,8,PL-8);r.y=clamp(r.y,6,PW-6);
 out.push([r.y,()=>drawFig(r.x,r.y,'#111827','#111827',{run:1,skin:'#c68642'})]);
 // linesmen keep level with the last defender on their half
 const lx=k=>{const def=onT(k).filter(e=>e.pos!='GK').map(e=>e.x);if(!def.length)return 52.5;return G.dir[k]>0?Math.min(52.5,Math.min(...def)):Math.max(52.5,Math.max(...def))};
 const a=lx(0),c=lx(1),l1=a<52.5?a:c,l2=a>=52.5?a:c;out.push([-.9,()=>drawFig(clamp(l1,2,52),-.9,'#111827','#111827',{flag:1,up:G.offFlag>0})],[PW+.9,()=>drawFig(clamp(l2,53,PL-2),PW+.9,'#111827','#111827',{flag:1,up:G.offFlag>0})]);
 // benches with the subs and the managers
 [0,1].forEach(k=>{const tid=G.tm[k],T=R.t[tid],home=tid===G.home,x0=home?40:57,shirt=home?T.col[0]:T.col[1],sh=home?T.col[1]:T.col[0];
  out.push([-2.6,()=>{poly([[x0-.5,-3.4,0],[x0+8.5,-3.4,0],[x0+8.5,-3.4,1.6],[x0-.5,-3.4,1.6]],'rgba(148,163,184,.45)','#cbd5e1',1);for(let i=0;i<5;i++)drawFig(x0+.6+i*1.7,-2.6,shirt,sh,{sit:1,skin:SKIN[(tid*5+i)%SKIN.length]})}]);
  const mx=x0+4+Math.sin(performance.now()/1400+k)*2;out.push([-1.4,()=>drawFig(mx,-1.4,'#1e293b','#1e293b',{arms:G.b.own&&G.b.own.t===k&&Math.abs(goalX(G.dir[k])-G.b.x)<25,skin:SKIN[(tid*3)%SKIN.length]})])});return out}

// ---------- stadiums, night matches and ball effects ----------
{const _ng=newGame;newGame=function(...a){const g=_ng.apply(this,a);g.night=feat('night')&&(R.day%3==2||R.day>=R.sched.length-2);g.pbp=[];g.goals=[];g.lt=feat('lower')?{t:4,a:R.t[g.home].n+' v '+R.t[g.tm[0]===g.home?g.tm[1]:0].n,b:(feat('stad2')?stadName(g.home)+' · ':'')+'Matchday '+(R.day+1),c:''}:null;return g}}
{const _dp=drawPitch;drawPitch=function(){_dp();if(!G)return;if(!feat('stad2')){if(G.night){CX.fillStyle='rgba(8,16,48,.28)';CX.fillRect(0,0,VW,VH)}return}const pat=G.home%3;if(pat==1){for(let i=0;i<14;i++)for(let j=0;j<6;j++)if((i+j)%2){const x0=i*PL/14,y0=j*PW/6;poly([[x0,y0],[x0+PL/14,y0],[x0+PL/14,y0+PW/6],[x0,y0+PW/6]],'rgba(255,255,255,.035)')}}
 else if(pat==2){for(let j=0;j<8;j++)if(j%2)poly([[0,j*PW/8],[PL,j*PW/8],[PL,(j+1)*PW/8],[0,(j+1)*PW/8]],'rgba(0,0,0,.05)')}
 // the markings again on top of the pattern
 if(G.night){CX.fillStyle='rgba(8,16,48,.28)';CX.fillRect(0,0,VW,VH)}if(pat)try{const W='rgba(255,255,255,.92)';line([[0,0],[PL,0],[PL,PW],[0,PW],[0,0]],W);line([[PL/2,0],[PL/2,PW]],W)}catch(e){}}}
{const _ds=drawStadium;drawStadium=function(){_ds();if(!G)return;try{if(feat('stad2')){const T=R.t[G.home];poly([[-14,-16],[PL+14,-16],[PL+14,-14.5],[-14,-14.5]],T.col[0]);poly([[-14,PW+12.5],[PL+14,PW+12.5],[PL+14,PW+14],[-14,PW+14]],T.col[0]);
  const[nx,ny]=P(PL/2,-15.2,0);CX.font=`900 ${Math.max(10,S*.9)}px system-ui`;CX.textAlign='center';CX.textBaseline='middle';CX.fillStyle=T.col[1];CX.fillText(stadName(G.home).toUpperCase(),nx,ny)}
 if(G.night){CX.fillStyle='rgba(2,6,23,.5)';CX.fillRect(0,0,VW,VH);[[-10,-12],[PL+10,-12],[-10,PW+10],[PL+10,PW+10]].forEach(([x,y])=>{const[gx,gy]=P(x,y,0);CX.strokeStyle='#475569';CX.lineWidth=3;CX.beginPath();CX.moveTo(gx,gy);CX.lineTo(gx,gy-S*8);CX.stroke();const gr=CX.createRadialGradient(gx,gy-S*8,1,gx,gy-S*8,S*5);gr.addColorStop(0,'rgba(255,255,240,.95)');gr.addColorStop(1,'rgba(255,255,240,0)');CX.fillStyle=gr;CX.beginPath();CX.arc(gx,gy-S*8,S*5,0,7);CX.fill()})}}catch(e){}}}
{const _db=drawBall;drawBall=function(){if(feat('ballfx')&&G&&G.b){const b=G.b;if(b.kind=='shot'&&b.shot){(b.trail=b.trail||[]).push([b.x,b.y,b.z]);if(b.trail.length>12)b.trail.shift()}else if(b.trail&&b.trail.length)b.trail.shift();
  if(b.trail&&b.trail.length>1){b.trail.forEach((t,i)=>{const[x,y]=P(t[0],t[1],t[2]+.11);CX.fillStyle=`rgba(255,255,255,${i/b.trail.length*.45})`;CX.beginPath();CX.arc(x,y,Math.max(1.5,S*.13*i/b.trail.length),0,7);CX.fill()})}}_db()}}
{const _dg=drawGoal;drawGoal=function(sd){_dg(sd);if(!feat('ballfx')||!G||!(G.netT>0)||G.netSide!==sd)return;const x=sd?PL:0,d=sd?1:-1,b=G.netT*1.4;CX.globalAlpha=Math.min(1,G.netT);for(let i=0;i<=6;i++){const y=GY0+i*GW/6;line([[x+d*2,y,0],[x+d*(2+b*Math.sin(i/6*Math.PI)),y,GH*.4],[x+d*2,y,GH*.8]],'#f8fafc',1)}CX.globalAlpha=1}}
// tired players: slower stride and a drop of sweat
{const _dp=drawPlayer;drawPlayer=function(e){if(feat('tired')&&G&&G.st&&e.p&&!G.rp){const st=G.st[e.p.id];if(st!=null&&st<30){e.ph=(e.ph||0)-Math.hypot(e.vx,e.vy)*.02}}_dp(e);if(feat('tired')&&G&&G.st&&e.p&&!G.rp){const st=G.st[e.p.id];if(st!=null&&st<30){const[gx,gy]=P(e.x,e.y,0),h=1.8*S*HZ,y=gy-h*1.05-((performance.now()/6+e.p.id*40)%300)/300*S*.6;CX.fillStyle='#7dd3fc';CX.beginPath();CX.arc(gx+S*.45,y,S*.1,0,7);CX.fill()}}}}
// draw the extra figures with everything else (depth sorted) and the rest of the overlays
{const _hd=hDraw;hDraw=function(){if(!CX||!G)return _hd();if(G.rp)return rpDraw(_hd);const ex=sideItems();if(!ex.length)return _hd();_hd2(ex)}}
function _hd2(ex){camera();drawStadium();drawPitch();const items=G.ent.filter(e=>!e.off).map(e=>[e.y,()=>drawPlayer(e)]);items.push([G.b.y+.05,drawBall]);items.push([GY0-.01,()=>drawGoal(0)],[GY0-.01,()=>drawGoal(1)]);ex.forEach(x=>items.push(x));items.sort((a,c)=>a[0]-c[0]).forEach(i=>i[1]());drawRadar();drawHUD()}
// ---------- instant replay and highlights ----------
const r1=v=>Math.round(v*10)/10;
function snap(){const b=G.b,E=G.ent;return{e:E.filter(e=>!e.off).map(e=>[e.p.id,e.t,r1(e.x),r1(e.y),r1(e.fa||0),e.act?e.act.k:0,r1(e.vx),r1(e.vy),e.pos]),b:[r1(b.x),r1(b.y),r1(b.z||0),b.own?E.filter(e=>!e.off).indexOf(b.own):-1,r1(b.vx||0),r1(b.vy||0)],sc:G.sc.slice(),clk:r1(G.clk),h:G.half}}
function hlMark(txt,imp){if(!G||G.auto||G.viewer||G.hlCut)return;G.hlCut={t:2,txt,imp:imp||1}}
{const _sh=shoot;shoot=function(e,...a){const d=G&&e?Math.hypot(goalX(G.dir[e.t])-e.x,34-e.y):0;_sh(e,...a);if(G&&G.b.shot&&G.b.shot.e===e)G.b.shot.d=d}}
{const _sc=scored;scored=function(k,e){const S0=G.b.shot,d=S0&&S0.d||0,pen=S0&&S0.pen,m=Math.floor(clkMin());_sc(k,e);if(!G)return;const own=!(e&&e.t===k);
 G.goals.push({m:Math.min(m,G.half==1?45:90),k,n:e?e.p.n:'',own,pen:!!pen});
 const late=clkMin()>=85,close=Math.abs(G.sc[0]-G.sc[1])<=1;if(!own&&e){if(late&&close)hlMark(`Late goal by ${e.p.n}!`,4);else if(d>24)hlMark(`Long-range goal by ${e.p.n}`,3);else if(pen)hlMark(`Penalty by ${e.p.n}`,1.2);else hlMark(`Goal by ${e.p.n}`,2)}
 if(feat('lower')&&!own&&e){const g=e.p.ss[SI.g]+(G.bx[e.p.id]?G.bx[e.p.id][SI.g]:0);G.lt={t:5,a:'GOAL',b:`${e.p.n} ${G.goals[G.goals.length-1].m}'`,c:`${g}${ord(g)} goal of the season`}}
 if(feat('voice')&&!G.auto)speak(own?'Own goal!':`Goal! ${e.p.n}!`)}}
{const _bs=ballStep;ballStep=function(dt){const S0=G.b.shot;_bs(dt);if(S0&&!G.b.shot&&S0.onT&&!S0.goal&&!S0.pen&&S0.gk&&S0.d>0&&S0.d<16)hlMark(`Great save by ${S0.gk.p.n}`,1.5)}}
function startReplay(frames,title,after){if(!G||!frames||frames.length<5)return;G.rp={fr:frames,i:0,sp:1,title:title||'Replay',after,pause:0,was:G.paused};G.paused=false}
function rpStep(dt){const r=G.rp;if(r.pause)return;r.i+=dt*30*r.sp;if(r.i>=r.fr.length-1){const a=r.after;G.rp=null;G.paused=r.was;if(a)a()}}
function rpKey(code,down){const r=G.rp;if(!down)return true;if(code=='KeyY'||code=='Escape'){const a=r.after;G.rp=null;G.paused=r.was;if(a)a()}else if(code=='ArrowLeft'||code=='KeyA')r.i=Math.max(0,r.i-30);else if(code=='ArrowRight'||code=='KeyD')r.i=Math.min(r.fr.length-2,r.i+30);else if(code=='KeyS')r.sp=r.sp==1?.35:1;else if(code=='Space')r.pause=!r.pause;return true}
{const _k=hKey;hKey=function(code,down){if(G&&G.rp)return rpKey(code,down);if(G&&G.intro>0){if(down)G.intro=0;return}if(down&&code=='KeyY'&&G&&feat('replay')&&G.rec&&G.rec.length>20&&!G.paused){startReplay(G.rec.slice(-200),'Instant replay');return}return _k(code,down)}}
function rpDraw(_hd){const r=G.rp,f=r.fr[Math.min(r.fr.length-1,Math.floor(r.i))],keep=['ent','b','sc','clk','half','ctl','ctl2','msgT','meter','lastMeter','pen','phase','hints'],live={};keep.forEach(k=>live[k]=G[k]);
 const fakes=f.e.map(a=>{const p=R.pl.find(q=>q.id===a[0]);return p?{p,t:a[1],x:a[2],y:a[3],fa:a[4],act:a[5]?{k:a[5],t:.2}:null,vx:a[6],vy:a[7],pos:a[8],cd:{},ph:r.i*.7,i:0}:null}).filter(Boolean);
 G.ent=fakes;G.b={x:f.b[0],y:f.b[1],z:f.b[2],own:fakes[f.b[3]]||null,vx:f.b[4],vy:f.b[5],vz:0,kind:'loose'};G.sc=f.sc;G.clk=f.clk;G.half=f.h;G.ctl=null;G.ctl2=null;G.msgT=0;G.meter=null;G.lastMeter=null;G.pen=null;G.phase='replay';
 try{_hd()}finally{keep.forEach(k=>G[k]=live[k])}
 CX.fillStyle='rgba(185,28,28,.9)';CX.fillRect(14,70,150,30);CX.fillStyle='#fff';CX.font='900 16px system-ui';CX.textAlign='left';CX.textBaseline='middle';CX.fillText((r.sp<1?'SLOW MO ':'')+(r.pause?'PAUSED':'REPLAY'),24,85);
 CX.font='700 15px system-ui';CX.fillText(r.title,14,116);CX.font='500 12px system-ui';CX.fillStyle='rgba(226,232,240,.85)';CX.fillText('Y or Esc: done · ←/→ rewind and forward · S slow motion · Space pause',14,VH-62);
 CX.fillStyle='rgba(255,255,255,.2)';CX.fillRect(14,VH-50,240,4);CX.fillStyle='#ef4444';CX.fillRect(14,VH-50,240*r.i/(r.fr.length-1),4)}
const HLKEY='soccer_hl';function hlList(){try{return JSON.parse(lsGet(HLKEY))||[]}catch(e){return[]}}
function hlSave(){if(!G||!G.hls||!G.hls.length)return;const L=hlList();G.hls.slice(0,3).forEach(h=>L.unshift(h));if(L.length>30)L.length=30;if(!lsSet(HLKEY,JSON.stringify(L))){L.length=10;lsSet(HLKEY,JSON.stringify(L))}}
{const _dg=doneGame;doneGame=function(){try{if(feat('hl'))hlSave()}catch(e){}crowd(0);return _dg()}}
function hlWatch(i){const h=hlList()[i];if(!h)return;viewerG(h);$('ui').hidden=true;$('gamewrap').hidden=false;hResize();startReplay(h.fr,h.t,()=>{G=null;hlUI()});runLoop()}
function viewerG(h){G={viewer:1,home:h.home,tm:h.tm,ent:[],b:{x:52.5,y:34,z:0,vx:0,vy:0,vz:0,own:null},sc:[0,0],half:1,clk:0,hl:240,phase:'over',shown:1,msg:'',msgT:0,live:1,dir:[1,-1],ev:[],st:{},bench:[[],[]],subs:[0,0],hot:{},mom:0,secs:{},bx:{},auto:1,paused:false,stop:[0,0],poss:[0,0],cards:{},goals:[],pbp:[]}}
function hlDel(i){const L=hlList();L.splice(i,1);lsSet(HLKEY,JSON.stringify(L));hlUI()}
function hlUI(){PAGE='hl';const L=hlList();shell(`<div class="head"><h1>Highlights</h1><p>The best goals and saves from matches you played.</p></div><div class="card"><table class="t">${L.map((h,i)=>`<tr><td>Season ${h.s}, matchday ${h.d+1}</td><td>${esc(R.t[h.tm[1]]?R.t[h.tm[1]].n:'')}</td><td><b>${esc(h.t)}</b></td><td>${B(`hlWatch(${i})`,'Watch','xs')} ${B(`hlDel(${i})`,'Delete','xs')}</td></tr>`).join('')||'<tr><td>Play a match: your goals and big saves show up here.</td></tr>'}</table></div>`)}
{const i=NAV.findIndex(n=>n[0]=='hist');NAV.splice(i<0?NAV.length:i+1,0,['hl','Highlights','hlUI()'])}
{const _no=navOK;navOK=function(k){if(k=='hl'&&!feat('hl'))return false;return _no(k)}}
// ---------- lineups intro ----------
{const _pg=playGame;playGame=function(...a){const r=_pg.apply(this,a);try{if(G&&feat('intro')&&!G.paused&&!G.auto)G.intro=6}catch(e){}try{rotCheck()}catch(e){}return r}}
function drawIntro(){const cx=VW/2,cy=VH/2;CX.fillStyle='rgba(2,6,23,.85)';CX.fillRect(0,0,VW,VH);CX.textAlign='center';CX.textBaseline='middle';const hk=G.tm.indexOf(G.home),order=[hk,1-hk];
 CX.font='800 15px system-ui';CX.fillStyle='#94a3b8';CX.fillText((feat('stad2')?stadName(G.home)+' · ':'')+'Matchday '+(R.day+1)+(G.night?' · Night match':''),cx,cy-Math.min(190,VH*.38));
 order.forEach((k,j)=>{const T=R.t[G.tm[k]],x=cx+(j?1:-1)*Math.min(240,VW*.26),xi=onT(k).slice().sort((a,b)=>'GKCBFBCMWGST'.indexOf(a.pos)-'GKCBFBCMWGST'.indexOf(b.pos));
  CX.fillStyle=T.col[0];CX.fillRect(x-110,cy-Math.min(160,VH*.32),220,40);CX.fillStyle=T.col[1];CX.font='900 20px system-ui';CX.fillText(T.n,x,cy-Math.min(140,VH*.32-20));
  CX.font='600 13px system-ui';CX.fillStyle='#cbd5e1';CX.fillText(T.form||'4-4-2',x,cy-Math.min(105,VH*.32-55));CX.font='500 13px system-ui';xi.forEach((e,i)=>{CX.fillStyle='#e2e8f0';CX.fillText(`${e.pos}  ${e.p.num}  ${e.p.n}`,x,cy-Math.min(80,VH*.32-80)+i*Math.min(20,VH*.04))})});
 CX.font='900 30px system-ui';CX.fillStyle='#fde68a';CX.fillText('v',cx,cy);CX.font='500 13px system-ui';CX.fillStyle='#94a3b8';CX.fillText('Press any key to kick off',cx,VH-30)}
// ---------- match commentary ----------
{const _sy=say;say=function(s,t){_sy(s,t);if(G&&s==='Offside')G.offFlag=1.5;if(!G||!G.pbp||G.viewer||G.auto&&!G.pbpAll)return;if(/^(Throw-in|Goal kick|Coach|Player 2|Finesse|Skill move|Short passing|Balanced|Defensive|Attacking|Park|All-out|Low press|Medium press|High press)/.test(s))return;const m=Math.floor(clkMin());if(G.pbp[0]&&G.pbp[0].s===s&&G.pbp[0].m===m)return;G.pbp.unshift({m,s});if(G.pbp.length>200)G.pbp.length=200}}
function pbpHTML(){if(!G||!G.pbp)return'';return`<div class="pbp" style="max-height:340px;overflow:auto">${G.pbp.map(x=>`<div><small>${x.m}'</small> ${esc(x.s)}</div>`).join('')||'<p>Nothing yet.</p>'}</div>`}
{const _gm=gameMenu;gameMenu=function(){if(G&&G.rp){rpKey('Escape',true);return}if(G&&G.viewer)return;_gm();try{const r=$('modal').querySelector('.row');if(r&&feat('pbp'))r.insertAdjacentHTML('beforeend',B("modal('<h2>Commentary</h2>'+pbpHTML()+B('gameMenu()','Back'))",'Commentary'));if(r&&feat('replay')&&G.rec&&G.rec.length>20)r.insertAdjacentHTML('beforeend',B("closeModal();startReplay(G.rec.slice(-200),'Instant replay')",'Replay'))}catch(e){}}}
// ---------- TV graphics ----------
function drawLT(){const l=G.lt;if(!l||l.t<=0)return;const a=Math.max(0,Math.min(1,l.t*2,(5-l.t)*4+.2));CX.globalAlpha=a;const x=14,y=VH-(VW<700?150:120),w=Math.min(420,VW-28);
 CX.fillStyle='rgba(11,18,32,.92)';CX.fillRect(x,y,w,56);CX.fillStyle='#22c55e';CX.fillRect(x,y,6,56);CX.textAlign='left';CX.textBaseline='middle';CX.fillStyle='#fde68a';CX.font='900 13px system-ui';CX.fillText(l.a,x+16,y+14);CX.fillStyle='#fff';CX.font='800 17px system-ui';CX.fillText(l.b,x+16,y+33);if(l.c){CX.fillStyle='#94a3b8';CX.font='600 12px system-ui';CX.fillText(l.c,x+16,y+49)}CX.globalAlpha=1}
{const _dh=drawHUD;drawHUD=function(){if(G&&G.intro>0){try{drawIntro()}catch(e){}return}_dh();if(!G||G.rp)return;try{if(feat('lower'))drawLT();if(G.rpHint>0&&feat('replay')&&!G.auto){CX.font='600 12px system-ui';CX.textAlign='right';CX.fillStyle='rgba(226,232,240,.85)';CX.fillText('Y: watch the replay',VW-14,92)}if(G.offFlag>0)G.offFlag-=1/60}catch(e){}}}
// ---------- postgame summary ----------
{const _eu=endUI;endUI=function(){_eu();if(!G||!feat('postgame'))return;try{const r=gameResult();let best=null;r.res.T.forEach(T=>T.ps.forEach((p,i)=>{const b=T.box[i];if(b[SI.gp]&&(!best||b[SI.rat]>best.r))best={p,r:b[SI.rat],b}}));
 const gl=G.goals.map(g=>`<div><small>${g.m}'</small> ${esc(R.t[G.tm[g.k]].ab)}: ${g.own?'own goal':esc(g.n)}${g.pen?' (penalty)':''}</div>`).join('')||'<div>No goals.</div>';
 const hl=(G.hls||[]).map((h,i)=>B(`playHL(${i})`,'▶ '+esc(h.t),'xs')).join(' ');
 const h2=$('modal').querySelector('h2');if(h2)h2.insertAdjacentHTML('afterend',`<div class="cols" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="card"><h3>Player of the match</h3>${best?`${feat('faces')?faceSVG(best.p,40):''} <b>${esc(best.p.n)}</b> (${esc(R.t[best.p.tid].ab)}) · rating ${(+best.r).toFixed(1)}${best.b[SI.g]?` · ${best.b[SI.g]} goal${best.b[SI.g]>1?'s':''}`:''}`:''}</div><div class="card"><h3>Goals</h3>${gl}</div></div>${hl?`<p>${hl}</p>`:''}`)}catch(e){}}}
function playHL(i){const h=G&&G.hls&&G.hls[i];if(!h)return;closeModal();startReplay(h.fr,h.t,()=>endUI())}
// ---------- better sound and the commentary voice ----------
let CROWDN=null;function crowd(on,lvl){try{if(!on||!feat('sound')||!feat('sound2')){if(CROWDN){CROWDN.g.gain.value=0}return}AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(!CROWDN){const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=rnd()*2-1;const s=AC.createBufferSource();s.buffer=b;s.loop=true;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=700;f.Q.value=.6;const g=AC.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(AC.destination);s.start();CROWDN={g,f}}
 CROWDN.g.gain.setTargetAtTime(lvl,AC.currentTime,.4)}catch(e){}}
function speak(t){try{if(!feat('voice')||!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=1.05;speechSynthesis.speak(u)}catch(e){}}
{const _he=hEvents;hEvents=function(){if(G&&!G.viewer&&G.ev&&G.ev.length&&feat('sound2')){const ev=G.ev;if(ev.includes('goal')){noise(2.6,.12,350);setTimeout(()=>snd(220,.6,'sawtooth',.04,330),200)}if(ev.includes('shot')&&G.b.shot&&!G.b.shot.goal&&!G.b.shot.onT)setTimeout(()=>noise(.9,.05,250),500);if(ev.includes('save'))noise(.7,.06,500)}
 if(G&&!G.viewer)ev2voice(G.ev);_he();if(!G||G.viewer||G.auto){crowd(0);return}if(G.paused||G.phase=='over'||G.intro>0){crowd(0);return}const s=G.b.own?G.dir[G.b.own.t]:0,near=s?Math.max(0,1-Math.abs(goalX(s)-G.b.x)/40):0;crowd(1,.012+near*.03+(G.hype>0?.05:0))}}
function ev2voice(ev){if(!feat('voice')||!G||G.auto)return;if(ev.includes('whistle')&&G.phase=='over'&&!G.vo){G.vo=1;speak(`Full time. ${R.t[G.tm[0]].n} ${G.sc[0]}, ${R.t[G.tm[1]].n} ${G.sc[1]}.`)}}
{const _sp=simRest;simRest=function(){crowd(0);if(G){G.rp=null;G.intro=0}return _sp()}}
// ---------- phones ----------
{const _dh=drawHUD;drawHUD=function(){if(!feat('phone')||VW>=900)return _dh();const k=Math.max(.6,VW/900),sv=[VW,VH,S,OX,OY];VW/=k;VH/=k;S/=k;OX/=k;OY/=k;CX.save();CX.scale(k,k);try{_dh()}finally{CX.restore();[VW,VH,S,OX,OY]=sv}}}
function rotCheck(){if(typeof document=='undefined'||!document.body)return;const show=feat('phone')&&!$('gamewrap').hidden&&innerWidth<innerHeight&&innerWidth<760;let d=$('hrot');if(show&&!d){d=document.createElement('div');d.id='hrot';d.innerHTML='<div>&#8635;<br>Turn your phone sideways to play</div>';document.body.appendChild(d)}if(d)d.hidden=!show;if(show&&G)G.paused=true}
addEventListener('resize',()=>{try{rotCheck()}catch(e){}});addEventListener('orientationchange',()=>setTimeout(()=>{try{rotCheck();if(G){hResize();if(innerWidth>innerHeight&&$('modal').hidden)G.paused=false}}catch(e){}},300));
