'use strict';
// Presentation: detailed players, portraits, dunk and celebration animations, referees, benches and coaches,
// arena variety, playoff lighting, ball effects, tired players, instant replay and highlight reels, a pre-game intro,
// TV graphics, play-by-play, a postgame summary, better sound, commentary, key hints and a follow camera.
{const add=[['Presentation','model2','Detailed players','Players with real proportions, uniforms, sneakers, hair, and poses for dribbling, shooting, defending and dunking.'],
 ['Presentation','faces','Player portraits','A face for every player on player pages and rosters.'],
 ['Presentation','dunk2','Dunk animations','Players rise to the rim, throw it down and hang on the rim.'],
 ['Presentation','celeb','Celebrations','Flexes after big shots and high fives from teammates.'],
 ['Presentation','side2','Benches, coaches and referees','Both benches, the coaches and three referees on the court.'],
 ['Presentation','stad2','Arena variety','Every team\'s court looks different: floor, paint, baseline name and arena name.'],
 ['Presentation','night','Playoff lighting','Playoff games get darker arenas and spotlights.'],
 ['Presentation','ballfx','Ball effects','A trail on shots, the rim shaking on dunks, and sparks for players on fire.'],
 ['Presentation','tired','Tired players show it','Tired players sweat and hunch over at dead balls.'],
 ['Presentation','replay','Instant replay','Press Y to watch the last few seconds again (slow motion, rewind).'],
 ['Presentation','hl','Highlight reels','Big plays (dunks, blocks, deep threes, buzzer beaters) are saved; watch them after the game and on the Highlights page.'],
 ['Presentation','intro','Pre-game intro','Starting lineups and the key matchup before the tip.'],
 ['Presentation','lower','TV graphics','On-screen graphics for big games from a player and quarter-by-quarter scores.'],
 ['Presentation','pbp','Play-by-play','A running log of the game in the pause menu and box score.'],
 ['Presentation','postgame','Postgame summary','Player of the game and team stats side by side after each game.'],
 ['Presentation','sound2','Better sound','Crowd noise that rises with the game, sneaker squeaks, dribbles and the horn.'],
 ['Presentation','voice','Commentary voice','A voice calls the big plays (uses your browser\'s speech).'],
 ['Presentation','cam2','Follow camera','The camera zooms in and follows the ball instead of showing the whole court. Off by default.'],
 ['Help','keyhint','Key hints','Short reminders of the right key at the right moment.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
HDEFOFF.add('voice');HDEFOFF.add('cam2');
const hsh=n=>{n=(n*2654435761)>>>0;return n/4294967296};
const HAIR=['#1f160f','#2b1d14','#3b2416','#0b0b0b','#6b4423','#a0522d','#d6b26e','#111'];
const look=p=>({hair:Math.floor(hsh(p.id*7)*6),hc:HAIR[Math.floor(hsh(p.id*11)*HAIR.length)],beard:hsh(p.id*13)<.35,band:hsh(p.id*17)<.15,sleeve:hsh(p.id*19)<.2,skin:SKIN[p.id%SKIN.length]});
function shade(c,f){const n=parseInt(c.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,m=v=>Math.max(0,Math.min(255,Math.round(f<1?v*f:v+(255-v)*(f-1))));return'#'+((1<<24)+(m(r)<<16)+(m(g)<<8)+m(b)).toString(16).slice(1)}
// ---------- the detailed player ----------
{const _db=drawBody;drawBody=function(e,gx,gy,y0,h,w,sp,swing,face,jer,trim){if(!feat('model2'))return _db(e,gx,gy,y0,h,w,sp,swing,face,jer,trim);
  const p=e.p,L=look(p),k=e.act&&e.act.k,air=e.z>.3,held=G.b.st=='held'&&G.b.h===e,def=G.poss!==e.t&&G.phase=='live',bw=w*(.9+(p.wt-200)/600);
  const tired=feat('tired')&&(G.st[p.id]||100)<35&&G.phase!='live',cel=feat('celeb')&&e.cel>0,hurt=e.hurt;
  const hunch=tired?h*.08:0,crouch=(def&&!air&&G.b.st=='held'&&G.b.h&&dist(e,G.b.h)<6?h*.06:0)+hunch;
  const hip=y0-h*.45+crouch,sh=y0-h*.8+crouch*1.3,neck=y0-h*.84+crouch*1.3,head=y0-h*.91+crouch*1.3;
  const kneeB=air?h*.08:crouch*.8,st=Math.sin(e.ph||0),run=sp>1.5&&!air;
  CX.lineCap='round';CX.lineJoin='round';
  // legs: thigh and shin with a knee
  const leg=(sx,ph)=>{const fx=gx+sx*bw*.2+(run?ph*w*.42:0),kx=gx+sx*bw*.2+(run?ph*w*.2:0)+(air?face*w*.18:0),ky=(hip+y0)/2-kneeB+(run?Math.abs(ph)*-h*.02:0),fy=y0-(air?h*.05:0);
   CX.strokeStyle=L.skin;CX.lineWidth=bw*.26;CX.beginPath();CX.moveTo(gx+sx*bw*.18,hip);CX.lineTo(kx,ky);CX.lineTo(fx,fy-h*.07);CX.stroke();
   CX.strokeStyle='#f8fafc';CX.lineWidth=bw*.24;CX.beginPath();CX.moveTo(kx+(fx-kx)*.55,ky+(fy-h*.07-ky)*.55);CX.lineTo(fx,fy-h*.06);CX.stroke();
   CX.fillStyle=trim;CX.beginPath();CX.ellipse(fx+face*w*.07,fy-h*.03,w*.2,h*.035,0,0,Math.PI*2);CX.fill();CX.fillStyle='#f8fafc';CX.fillRect(fx-w*.12+face*w*.07,fy-h*.012,w*.24,h*.012)};
  leg(-1,st);leg(1,-st);
  // shorts
  CX.fillStyle=jer;CX.beginPath();CX.moveTo(gx-bw*.44,hip-h*.06);CX.lineTo(gx+bw*.44,hip-h*.06);CX.lineTo(gx+bw*.46,hip+h*.11);CX.lineTo(gx+bw*.04,hip+h*.11);CX.lineTo(gx,hip+h*.04);CX.lineTo(gx-bw*.04,hip+h*.11);CX.lineTo(gx-bw*.46,hip+h*.11);CX.closePath();CX.fill();
  CX.fillStyle=trim;CX.fillRect(gx-bw*.46,hip-h*.03,bw*.06,h*.13);CX.fillRect(gx+bw*.4,hip-h*.03,bw*.06,h*.13);
  // jersey (a tank top) with trim
  const jg=CX.createLinearGradient(gx-bw*.4,0,gx+bw*.4,0);jg.addColorStop(0,shade(jer,.82));jg.addColorStop(.5,jer);jg.addColorStop(1,shade(jer,.88));
  CX.fillStyle=jg;CX.beginPath();CX.moveTo(gx-bw*.36,sh);CX.lineTo(gx-bw*.18,sh-h*.01);CX.quadraticCurveTo(gx,sh+h*.06,gx+bw*.18,sh-h*.01);CX.lineTo(gx+bw*.36,sh);CX.lineTo(gx+bw*.41,hip-h*.04);CX.lineTo(gx-bw*.41,hip-h*.04);CX.closePath();CX.fill();
  CX.strokeStyle=trim;CX.lineWidth=Math.max(1,w*.06);CX.beginPath();CX.moveTo(gx-bw*.18,sh-h*.01);CX.quadraticCurveTo(gx,sh+h*.06,gx+bw*.18,sh-h*.01);CX.stroke();
  CX.fillStyle=trim;CX.font=`900 ${Math.max(8,Math.round(w*.46))}px system-ui,sans-serif`;CX.textAlign='center';CX.textBaseline='middle';CX.fillText(p.num,gx,sh+h*.13);
  // arms: shoulder, elbow, hand
  const arm=(sx,ex,ey,hx2,hy)=>{CX.strokeStyle=L.skin;CX.lineWidth=bw*.19;CX.beginPath();CX.moveTo(gx+sx*bw*.36,sh+h*.02);CX.lineTo(ex,ey);CX.lineTo(hx2,hy);CX.stroke();
   if(L.sleeve&&sx<0){CX.strokeStyle='#0f172a';CX.lineWidth=bw*.2;CX.beginPath();CX.moveTo(ex,ey);CX.lineTo(ex+(hx2-ex)*.6,ey+(hy-ey)*.6);CX.stroke()}CX.fillStyle=L.skin;CX.beginPath();CX.arc(hx2,hy,bw*.12,0,7);CX.fill()};
  const up=k=='shot'||k=='gather'||k=='jump'||k=='lay'||cel,dk=k=='dunk',ax=w*.5;
  if(dk){arm(face,gx+face*ax*.8,sh-h*.22,gx+face*ax*.9,sh-h*.48);arm(-face,gx-face*ax,sh+h*.1,gx-face*ax*.8,sh+h*.28)}
  else if(up){const f=cel?Math.sin(performance.now()/90)*h*.03:0;arm(-1,gx-ax*.8,sh-h*.16+f,gx-ax*.55,sh-h*.36+f);arm(1,gx+ax*.8,sh-h*.16-f,gx+ax*.55,sh-h*.36-f)}
  else if(k=='reach'){arm(face,gx+face*ax*1.2,sh+h*.04,gx+face*ax*2,sh+h*.1);arm(-face,gx-face*ax,sh+h*.12,gx-face*ax*.9,sh+h*.3)}
  else if(k=='fake'){arm(-1,gx-ax*.7,sh-h*.04,gx-ax*.3,sh-h*.14);arm(1,gx+ax*.7,sh-h*.04,gx+ax*.3,sh-h*.14)}
  else if(held){const bx2=gx+face*w*.7;arm(face,gx+face*ax*.9,sh+h*.14,bx2,hip-h*.02);arm(-face,gx-face*ax,sh+h*.14,gx-face*ax*.9,hip)}
  else if(def&&crouch>0){arm(-1,gx-ax*1.25,sh+h*.06,gx-ax*1.6,sh+h*.0);arm(1,gx+ax*1.25,sh+h*.06,gx+ax*1.6,sh+h*.0)}
  else if(tired){arm(-1,gx-ax*.8,sh+h*.16,gx-ax*.5,hip+h*.12);arm(1,gx+ax*.8,sh+h*.16,gx+ax*.5,hip+h*.12)}
  else{arm(-1,gx-ax*1.05,sh+h*.15,gx-ax*1.1+(run?-st*w*.3:0),hip+h*.02);arm(1,gx+ax*1.05,sh+h*.15,gx+ax*1.1+(run?st*w*.3:0),hip+h*.02)}
  // neck and head
  CX.strokeStyle=L.skin;CX.lineWidth=bw*.18;CX.beginPath();CX.moveTo(gx,sh);CX.lineTo(gx,neck);CX.stroke();
  const hr=w*.29;CX.fillStyle=L.skin;CX.beginPath();CX.ellipse(gx,head,hr*.92,hr,0,0,Math.PI*2);CX.fill();
  CX.fillStyle=L.hc;if(L.hair==1){CX.beginPath();CX.arc(gx,head-hr*.15,hr*1.25,Math.PI*.95,Math.PI*2.05);CX.fill()}else if(L.hair==2){CX.beginPath();CX.arc(gx,head-hr*.1,hr*1.02,Math.PI,0);CX.fill();for(let i=-2;i<=2;i++){CX.fillRect(gx+i*hr*.38-hr*.08,head-hr*.1,hr*.16,hr*.9)}}
  else if(L.hair!=3){CX.beginPath();CX.arc(gx,head-hr*.12,hr*.98,Math.PI*1.02,Math.PI*1.98);CX.fill()}
  if(L.band){CX.fillStyle=trim;CX.fillRect(gx-hr*.95,head-hr*.45,hr*1.9,hr*.28)}
  if(L.beard){CX.fillStyle=L.hc;CX.beginPath();CX.arc(gx,head+hr*.2,hr*.75,.1*Math.PI,.9*Math.PI);CX.fill()}
  CX.fillStyle='#111';CX.fillRect(gx+face*hr*.35-1,head-hr*.12,2,2);
  if(feat('tired')&&(G.st[p.id]||100)<40&&Math.sin(performance.now()/300+p.id)>.6){CX.fillStyle='#bae6fd';CX.beginPath();CX.arc(gx+hr*1.2,head+(performance.now()/40%10),2,0,7);CX.fill()}
  if(hurt){CX.fillStyle='#f87171';CX.font=`700 ${Math.round(S*.9)}px system-ui`;CX.fillText('+',gx-hr*1.4,head)}}}
// ---------- portraits ----------
function faceSVG(p,sz){const L=look(p),t=p.tid>=0&&R.t[p.tid]?R.t[p.tid].col:['#475569','#e2e8f0'];sz=sz||64;
 const hair=L.hair==1?`<ellipse cx="32" cy="22" rx="21" ry="17" fill="${L.hc}"/>`:L.hair==3?'':L.hair==2?`<path d="M14 26 Q32 4 50 26 L50 34 L46 30 L42 36 L38 30 L34 36 L30 30 L26 36 L22 30 L18 36 L14 32Z" fill="${L.hc}"/>`:`<path d="M15 27 Q32 6 49 27 Q44 18 32 17 Q20 18 15 27Z" fill="${L.hc}"/>`;
 return`<svg class="face" width="${sz}" height="${sz}" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${t[0]}"/><path d="M10 64 Q12 46 32 46 Q52 46 54 64Z" fill="${t[1]}"/><rect x="27" y="38" width="10" height="10" fill="${L.skin}"/>
 <ellipse cx="32" cy="30" rx="15" ry="17" fill="${L.skin}"/>${hair}${L.band?`<rect x="16" y="20" width="32" height="5" fill="${t[1]}"/>`:''}${L.beard?`<path d="M19 33 Q32 54 45 33 Q40 42 32 42 Q24 42 19 33Z" fill="${L.hc}"/>`:''}
 <circle cx="26" cy="30" r="1.8" fill="#111"/><circle cx="38" cy="30" r="1.8" fill="#111"/><path d="M27 38 Q32 41 37 38" stroke="#5a2d1a" stroke-width="1.6" fill="none"/><path d="M31 31 L30 35 L33 35" stroke="#00000044" fill="none"/></svg>`}
{const _pu=playerUI;playerUI=function(id){_pu(id);try{if(!feat('faces'))return;const p=R.pl.find(q=>q.id===id),h=$('modal').querySelector('.ph');if(p&&h)h.insertAdjacentHTML('afterbegin',faceSVG(p,72))}catch(e){}}}
{const _pl=plink;plink=function(p){return(feat('faces')?faceSVG(p,22)+' ':'')+_pl(p)}}
// ---------- dunks and celebrations ----------
{const _s=shoot;shoot=function(e,q){_s(e,q);const b=G.b;if(feat('dunk2')&&b.st=='shot'&&b.sh===e&&b.typ=='dunk'){const s=G.dir[e.t];e.dk={t:0,x0:e.x,y0:e.y,tx:b.hx-s*1.1,ty:25+(e.y-25)*.15,make:b.make}}
  if(b.st=='shot'&&b.sh===e)b.trail=[]}}
{const _sl=shotLand;shotLand=function(){const b=G.b,e=b.sh,pre=G.sc[e.t];_sl();const made=G.sc[e.t]>pre;
  if(made&&feat('celeb')&&(b.typ=='dunk'||b.pts==3||b.foul||G.clk<3)){e.cel=1.3;const m=onT(e.t).filter(x=>x!==e).sort((a,c)=>dist(a,e)-dist(c,e))[0];if(m&&dist(m,e)<16)m.cel=1}
  if(made)G.rimShake=b.typ=='dunk'?.5:0;if(made&&b.typ=='dunk'&&e.dk)e.dk.hang=.4}}
{const _st=hStep;hStep=function(dt){_st(dt);if(!G)return;if(G.rimShake>0)G.rimShake-=dt;
  G.ent.forEach(e=>{if(e.cel>0){e.cel-=dt;if(e.z<=0&&rnd()<dt*3&&G.phase!='live'){e.vz=5;e.z=.01}}
   if(e.dk){const d=e.dk;d.t+=dt;const T=.32;if(d.t<T){const k=d.t/T;e.x=d.x0+(d.tx-d.x0)*k;e.y=d.y0+(d.ty-d.y0)*k;e.z=Math.max(e.z,Math.sin(k*Math.PI/2)*(RIM-ftOf(e.p)*1.15));e.vz=0}
    else if(d.hang>0){d.hang-=dt;e.z=RIM-ftOf(e.p)*1.15;e.vz=0;e.act={k:'dunk',t:.1}}else e.dk=null;if(d.t>1.2)e.dk=null}})}}
// ---------- the court: arena variety, playoff lighting, benches, coaches and referees ----------
const FLOORS=[['#d6a565','#7c4a1c'],['#c99a5b','#6b3f17'],['#e0b97f','#8a5a2b'],['#b98a52','#5b3615'],['#d9b38c','#8b6b4a'],['#c4975f','#4a2c12']];
{const _dc=drawCourt;drawCourt=function(){if(!G||!feat('stad2'))return _dc();const t=G.home,T=R.t[t],fl=FLOORS[t%FLOORS.length];
  // draw the normal court, then recolor: we repaint the floor first and let the lines and paint go on top
  poly([[-4,-3],[CW+4,-3],[CW+4,CH+3],[-4,CH+3]],shade(T.col[0],.55));poly([[0,0],[CW,0],[CW,CH],[0,CH]],fl[0]);CX.globalAlpha=.13;for(let y=1.2;y<CH;y+=1.2)line([[0,y],[CW,y]],fl[1],1);CX.globalAlpha=1;
  const save=poly;poly=function(pts,fill,stroke,lw){if(fill==='#7a4a2a'||fill==='#d6a565')return;return save(pts,fill,stroke,lw)};const sl=line;line=function(pts,col,lw){if(col==='#7c4a1c')return;return sl(pts,col,lw)};
  try{_dc()}finally{poly=save;line=sl}
  // baseline names and the arena name
  CX.save();CX.fillStyle=T.col[1];CX.globalAlpha=.85;CX.font=`900 ${Math.round(S*1.5)}px system-ui,sans-serif`;CX.textAlign='center';CX.textBaseline='middle';const q=P(47,CH+1.6,0);CX.fillText(T.n.toUpperCase(),q[0],q[1]);
  const q2=P(47,-1.6,0);CX.font=`700 ${Math.round(S*1.1)}px system-ui,sans-serif`;CX.fillText(`${T.n.split(' ')[0].toUpperCase()} ARENA`,q2[0],q2[1]);CX.restore()}}
{const _da=drawArena;drawArena=function(){_da();if(!G)return;if(feat('night')&&R.po&&!G.auto){CX.fillStyle='rgba(0,0,0,.35)';CX.fillRect(0,0,VW,VH);const t=performance.now()/1000;
  [[.25,.6],[.75,.4]].forEach(([fx,ph],i)=>{const x=VW*(fx+Math.sin(t*.4+i*2)*.12);const g=CX.createRadialGradient(x,OY+CH*KY*S/2,10,x,OY+CH*KY*S/2,VW*.35);g.addColorStop(0,'rgba(255,250,220,.14)');g.addColorStop(1,'rgba(0,0,0,0)');CX.fillStyle=g;CX.fillRect(0,0,VW,VH)});
  CX.fillStyle='#fde68a';CX.font='800 13px system-ui';CX.textAlign='left';CX.fillText('PLAYOFFS',14,24)}}}
function drawFig(x,y,col,trim,seated,arms,ref){const [gx,gy]=P(x,y,0),h=6.3*S*HZ*(seated?.62:1),w=S*1.1;CX.fillStyle='rgba(0,0,0,.25)';CX.beginPath();CX.ellipse(gx,gy,w*.6,w*.25,0,0,7);CX.fill();
 CX.strokeStyle='#1f2937';CX.lineWidth=w*.22;CX.lineCap='round';CX.beginPath();CX.moveTo(gx-w*.15,gy-h*.42);CX.lineTo(gx-w*.15,gy);CX.moveTo(gx+w*.15,gy-h*.42);CX.lineTo(gx+w*.15,gy);CX.stroke();
 if(ref){CX.fillStyle='#f8fafc';CX.fillRect(gx-w*.36,gy-h*.82,w*.72,h*.42);CX.fillStyle='#111';for(let i=0;i<4;i++)CX.fillRect(gx-w*.36+i*w*.19,gy-h*.82,w*.08,h*.42)}else{CX.fillStyle=col;CX.fillRect(gx-w*.36,gy-h*.82,w*.72,h*.42);if(trim){CX.fillStyle=trim;CX.fillRect(gx-w*.36,gy-h*.82,w*.72,h*.05)}}
 CX.strokeStyle='#c68642';CX.lineWidth=w*.18;CX.beginPath();if(arms){CX.moveTo(gx-w*.36,gy-h*.78);CX.lineTo(gx-w*.4,gy-h*1.08);CX.moveTo(gx+w*.36,gy-h*.78);CX.lineTo(gx+w*.4,gy-h*1.08)}else{CX.moveTo(gx-w*.36,gy-h*.78);CX.lineTo(gx-w*.45,gy-h*.5);CX.moveTo(gx+w*.36,gy-h*.78);CX.lineTo(gx+w*.45,gy-h*.5)}CX.stroke();
 CX.fillStyle='#c68642';CX.beginPath();CX.arc(gx,gy-h*.92,w*.26,0,7);CX.fill()}
let REFS=null;
{const _hd=hDraw;hDraw=function(){if(!G||!CX)return _hd();if(!feat('side2'))return _hd();
  // benches and coaches along the far sideline, referees following the play
  const b=G.b,bx0=b.st=='held'?b.h.x:(b.x||47),wh=G.ev&&0;REFS=REFS||[{x:40,y:-1.8},{x:60,y:51.8},{x:80,y:51.8}];
  const tgt=[[bx0-10,-1.8],[bx0+6,51.8],[clamp(bx0+(G.dir[G.poss]>0?25:-25),4,90),51.8]];REFS.forEach((r,i)=>{r.x+=(clamp(tgt[i][0],2,92)-r.x)*.04;r.y=tgt[i][1]});
  const _di=drawPlayer;const extra=[];[0,1].forEach(k=>{const t=R.t[G.tm[k]],home=G.tm[k]===G.home,jer=home?t.col[0]:'#f1f5f9',trim=home?t.col[1]:t.col[0],x0=k===0?(G.dir[0]>0?18:58):(G.dir[0]>0?58:18);
   G.bench[k].slice(0,7).forEach((id,i)=>extra.push([-2.6,()=>drawFig(x0+i*2.3,-2.6,jer,trim,true,(G.hype||0)>.8&&G.run&&G.run.k===k)]));
   extra.push([-3.2,()=>drawFig(x0+17,-3.4,'#1e293b',t.col[0],false,(G.hype||0)>.8&&G.run&&G.run.k===k)])});
  const wh2=G.whT>0;REFS.forEach((r,i)=>extra.push([r.y,()=>drawFig(r.x,r.y,'#fff',null,false,wh2&&i==0,true)]));
  drawArena();drawCourt();const items=G.ent.map(e=>[e.y,()=>drawPlayer(e)]).concat(extra);items.push([25.01,()=>drawHoop(0)],[25.01,()=>drawHoop(1)]);
  const by=b.st=='held'?b.h.y+.3:b.y||25;items.push([by+.01,drawBall]);items.sort((a,c)=>a[0]-c[0]).forEach(i=>i[1]());drawHUD()}}
// rim shake, ball trail and sparks
{const _dh=drawHoop;drawHoop=function(sd){if(feat('ballfx')&&G&&G.rimShake>0){CX.save();CX.translate(Math.sin(performance.now()/25)*G.rimShake*4,0);_dh(sd);CX.restore()}else _dh(sd)}}
{const _db=drawBall;drawBall=function(){if(feat('ballfx')&&G){const b=G.b;if(b.st=='shot'&&b.trail){b.trail.push([b.x,b.y,b.z]);if(b.trail.length>14)b.trail.shift();b.trail.forEach(([x,y,z],i)=>{const q=P(x,y,z);CX.fillStyle=`rgba(251,146,60,${i/b.trail.length*.35})`;CX.beginPath();CX.arc(q[0],q[1],Math.max(2,S*.38)*i/b.trail.length,0,7);CX.fill()})}
   if(b.st=='shot'&&G.hot&&(G.hot[b.sh.p.id]||0)>=4){const q=P(b.x,b.y,b.z);for(let i=0;i<3;i++){CX.fillStyle=pick(['#fde047','#f97316','#ef4444']);CX.fillRect(q[0]+(rnd()-.5)*S*1.4,q[1]+(rnd()-.5)*S*1.4,3,3)}}}_db()}}
// ---------- recording, instant replay and highlights ----------
const r1=v=>Math.round(v*10)/10;
function snap(){const b=G.b,ents=G.ent;return{e:ents.map(e=>[e.p.id,e.t,r1(e.x),r1(e.y),r1(e.z),r1(e.fa),e.act?e.act.k:0,r1(e.vx),r1(e.vy),e.cel>0?1:0]),b:[b.st,r1(b.x||0),r1(b.y||0),r1(b.z||0),b.st=='held'?ents.indexOf(b.h):-1],sc:G.sc.slice(),clk:r1(G.clk),q:G.q}}
{const _st=hStep;hStep=function(dt){if(G&&G.rp)return rpStep(dt);if(G&&G.intro>0){G.intro-=dt;return}_st(dt);if(!G||G.viewer)return;
  if((feat('replay')||feat('hl'))&&G.phase!='over'){G.recN=(G.recN||0)+1;if(G.recN%2==0){(G.rec=G.rec||[]).push(snap());if(G.rec.length>300)G.rec.shift()}}
  if(G.hlCut&&(G.hlCut.t-=dt)<=0){const c=G.hlCut;G.hlCut=null;if(feat('hl')&&G.rec){G.hls=G.hls||[];G.hls.push({t:c.txt,fr:G.rec.slice(-150).filter((_,i)=>i%2==0),home:G.home,tm:G.tm.slice(),s:R.season,d:R.day,imp:c.imp});G.hls.sort((a,b)=>b.imp-a.imp);if(G.hls.length>8)G.hls.length=8}G.rpHint=3}
  if(G.rpHint>0)G.rpHint-=dt}}
function hlMark(txt,imp){if(!G||G.auto||G.viewer)return;if(G.hlCut)return;G.hlCut={t:1.4,txt,imp:imp||1}}
{const _sl=shotLand;shotLand=function(){const b=G.b,e=b.sh,pre=G.sc[e.t];_sl();if(G.sc[e.t]>pre){const close=Math.abs(G.sc[0]-G.sc[1])<=3&&G.q>=4;if(G.clk<1.5&&G.q>=2)hlMark(`Buzzer beater by ${e.p.n}!`,close?5:3);else if(b.typ=='dunk')hlMark(`${e.p.n} throws it down`,2);else if(b.pts==3&&b.dd>27)hlMark(`Deep three by ${e.p.n}`,1.6);else if(b.foul)hlMark(`And one for ${e.p.n}`,1.3)}}}
{const _bs=ballStep;ballStep=function(dt){const was=G.b;_bs(dt);if(was.st=='shot'&&was.blk&&G.b!==was&&G.b.st=='loose')hlMark(`Blocked by ${was.blk.p.n}!`,1.8);if(was.st=='held'&&G.b.st=='loose'&&G.b.stl)hlMark(`Steal by ${G.b.stl.p.n}`,1.1)}}
function startReplay(frames,title,after){if(!G||!frames||frames.length<5)return;G.rp={fr:frames,i:0,sp:1,title:title||'Replay',after,pause:0,was:G.paused};G.paused=false}
function rpStep(dt){const r=G.rp;if(r.pause)return;r.i+=dt*30*r.sp;if(r.i>=r.fr.length-1){const a=r.after;G.rp=null;G.paused=r.was;if(a)a()}}
function rpKey(code,down){const r=G.rp;if(!down)return true;if(code=='KeyY'||code=='Escape'){const a=r.after;G.rp=null;G.paused=r.was;if(a)a()}else if(code=='ArrowLeft'||code=='KeyA')r.i=Math.max(0,r.i-30);else if(code=='ArrowRight'||code=='KeyD')r.i=Math.min(r.fr.length-2,r.i+30);else if(code=='KeyS')r.sp=r.sp==1?.35:1;else if(code=='Space')r.pause=!r.pause;return true}
{const _k=hKey;hKey=function(code,down){if(G&&G.rp)return rpKey(code,down);if(G&&G.intro>0&&down){G.intro=0;return}if(down&&code=='KeyY'&&G&&feat('replay')&&G.rec&&G.rec.length>20&&!G.paused){startReplay(G.rec.slice(-180),'Instant replay');return}return _k(code,down)}}
{const _hd=hDraw;hDraw=function(){if(!G||!G.rp)return _hd();const r=G.rp,f=r.fr[Math.min(r.fr.length-1,Math.floor(r.i))],live={ent:G.ent,b:G.b,sc:G.sc,clk:G.clk,q:G.q,ctl:G.ctl,ctl2:G.ctl2,msgT:G.msgT,meter:G.meter,lm:G.lastMeter};
  const fakes=f.e.map(a=>{const p=R.pl.find(q=>q.id===a[0]);return p?{p,t:a[1],x:a[2],y:a[3],z:a[4],fa:a[5],act:a[6]?{k:a[6],t:.2}:null,vx:a[7],vy:a[8],cel:a[9],cd:{},ph:(r.i*.7)}:null}).filter(Boolean);
  G.ent=fakes;G.b={st:f.b[0]=='held'&&fakes[f.b[4]]?'held':f.b[0]=='dead'?'dead':'loose',x:f.b[1],y:f.b[2],z:f.b[3],h:fakes[f.b[4]],vx:0,vy:0};G.sc=f.sc;G.clk=f.clk;G.q=f.q;G.ctl=null;G.ctl2=null;G.msgT=0;G.meter=null;G.lastMeter=null;
  try{_hd()}finally{Object.assign(G,{ent:live.ent,b:live.b,sc:live.sc,clk:live.clk,q:live.q,ctl:live.ctl,ctl2:live.ctl2,msgT:live.msgT,meter:live.meter,lastMeter:live.lm})}
  CX.fillStyle='rgba(185,28,28,.9)';CX.fillRect(14,70,150,30);CX.fillStyle='#fff';CX.font='900 16px system-ui';CX.textAlign='left';CX.textBaseline='middle';CX.fillText((r.sp<1?'SLOW MO ':'')+(r.pause?'PAUSED':'REPLAY'),24,85);
  CX.font='700 15px system-ui';CX.fillText(r.title,14,116);CX.font='500 12px system-ui';CX.fillStyle='rgba(226,232,240,.85)';CX.fillText('Y or Esc: done · ←/→ rewind and forward · S slow motion · Space pause',14,VH-62);
  CX.fillStyle='rgba(255,255,255,.2)';CX.fillRect(14,VH-50,240,4);CX.fillStyle='#ef4444';CX.fillRect(14,VH-50,240*r.i/(r.fr.length-1),4)}}
// keep the best plays of games you play
const HLKEY='hoops_hl';function hlList(){try{return JSON.parse(lsGet(HLKEY))||[]}catch(e){return[]}}
function hlSave(){if(!G||!G.hls||!G.hls.length)return;const L=hlList();G.hls.slice(0,3).forEach(h=>L.unshift(h));if(L.length>24)L.length=24;if(!lsSet(HLKEY,JSON.stringify(L))){L.length=10;lsSet(HLKEY,JSON.stringify(L))}}
{const _dg=doneGame;doneGame=function(){try{if(feat('hl'))hlSave()}catch(e){}return _dg()}}
function hlWatch(i){const h=hlList()[i];if(!h)return;viewerG(h);$('ui').hidden=true;$('gamewrap').hidden=false;hResize();startReplay(h.fr,h.t,()=>{G=null;hlUI()});runLoop()}
function viewerG(h){G={viewer:1,home:h.home,tm:h.tm,ent:[],b:{st:'dead'},sc:[0,0],q:1,clk:0,ql:240,shot:99,tf:[0,0],to:[0,0],phase:'over',msg:'',msgT:0,live:1,poss:0,dir:[1,-1],ev:[],st:{},bench:[[],[]],hot:{},mom:0,secs:{},bx:{},auto:1,calls:null,paused:false}}
function hlUI(){PAGE='hl';const L=hlList();shell(`<div class="head"><h1>Highlights</h1><p>The best plays from games you played.</p></div><div class="card"><table class="t">${L.map((h,i)=>`<tr><td>Season ${h.s}, game ${h.d+1}</td><td>${esc(R.t[h.tm[1]]?R.t[h.tm[1]].n:'')}</td><td><b>${esc(h.t)}</b></td><td>${B(`hlWatch(${i})`,'Watch','xs')}</td></tr>`).join('')||'<tr><td>Play a game: dunks, blocks and buzzer beaters show up here.</td></tr>'}</table></div>`)}
// ---------- pre-game intro ----------
{const _pg=playGame;playGame=function(...a){const r=_pg.apply(this,a);try{if(G&&feat('intro')&&!G.paused)G.intro=5}catch(e){}return r}}
function drawIntro(){const T=k=>R.t[G.tm[k]],cx=VW/2,cy=VH/2;CX.fillStyle='rgba(2,6,23,.82)';CX.fillRect(0,0,VW,VH);CX.textAlign='center';CX.textBaseline='middle';
 CX.fillStyle='#fde68a';CX.font='800 15px system-ui';CX.fillText(R.po?`${RDN[R.po.rd].toUpperCase()}`:`GAME ${R.day+1} OF ${R.sched.length}`,cx,cy-190);
 [0,1].forEach(k=>{const t=T(k),x=k?cx+230:cx-230,five=onT(k);CX.fillStyle=t.col[0];CX.fillRect(x-170,cy-160,340,50);CX.fillStyle=t.col[1];CX.font='900 22px system-ui';CX.fillText(t.n,x,cy-140);CX.font='600 13px system-ui';CX.fillText(`${t.w}-${t.l}`,x,cy-120);
  five.forEach((e,i)=>{CX.fillStyle=i%2?'rgba(30,41,59,.9)':'rgba(15,23,42,.9)';CX.fillRect(x-170,cy-100+i*34,340,32);CX.fillStyle='#e2e8f0';CX.font='600 14px system-ui';CX.textAlign='left';CX.fillText(`${e.p.pos}  #${e.p.num}  ${e.p.n}`,x-160,cy-84+i*34);CX.textAlign='right';CX.fillStyle='#fde047';CX.fillText(ovr(e.p),x+160,cy-84+i*34);CX.textAlign='center'})});
 const a=onT(0).slice().sort((x,y)=>ovr(y.p)-ovr(x.p))[0],b=onT(1).slice().sort((x,y)=>ovr(y.p)-ovr(x.p))[0];CX.fillStyle='#e2e8f0';CX.font='700 15px system-ui';CX.fillText(`Key matchup: ${a.p.n} (${ovr(a.p)}) vs ${b.p.n} (${ovr(b.p)})`,cx,cy+90);
 CX.font='500 13px system-ui';CX.fillStyle='#94a3b8';CX.fillText('Press any key to skip',cx,cy+120)}
// ---------- TV graphics, play-by-play ----------
{const _ng=newGame;newGame=function(...a){const g=_ng.apply(this,a);g.pbp=[];g.qs=[[],[]];g.lt=null;g.hints={};g.milestone={};return g}}
{const _sy=say;say=function(s,t){_sy(s,t);if(!G||!G.pbp||G.viewer)return;if(/^(Offense|Defense|Coach|Player 2|You can|Tip-off|End of|Final|Perfect release)/.test(s))return;G.pbp.unshift({q:G.q,c:G.clk,t:s,sc:G.sc.slice()});if(G.pbp.length>250)G.pbp.length=250}}
{const _eq=endQuarter;endQuarter=function(){const q=G.q,s0=G.sc.slice(),prev=G.qs[0].reduce((a,b)=>a+b,0),prev1=G.qs[1].reduce((a,b)=>a+b,0);G.qs[0].push(s0[0]-prev);G.qs[1].push(s0[1]-prev1);_eq();
  if(feat('sound2'))snd(180,.9,'sawtooth',.06);if(feat('lower')&&G.phase!='over')G.lt={t:5,big:`End of ${q<=4?'Q'+q:'OT'}`,sub:[0,1].map(k=>`${R.t[G.tm[k]].ab}  ${G.qs[k].join('  ')}  = ${G.sc[k]}`).join('    ')}}}
{const _sl=shotLand;shotLand=function(){const e=G.b.sh,pre=G.sc[e.t];_sl();if(!feat('lower')||G.sc[e.t]===pre)return;const b=G.bx[e.p.id];if(!b)return;const pts=b[SI.pts],m=Math.floor(pts/10)*10;
  if(m>=10&&!(G.milestone[e.p.id]>=m)){G.milestone[e.p.id]=m;G.lt={t:4,big:`${e.p.n}: ${pts} PTS`,sub:`${b[SI.fgm]}-${b[SI.fga]} FG · ${b[SI.tpm]}-${b[SI.tpa]} 3PT · ${b[SI.orb]+b[SI.drb]} REB · ${b[SI.ast]} AST`,col:R.t[G.tm[e.t]].col}}}}
function drawLT(){const l=G.lt;if(!l||l.t<=0)return;const a=Math.min(1,l.t*2,(5-l.t)*4+.2);CX.globalAlpha=Math.max(0,a);const x=14,y=VH-150,col=l.col||['#1e3a8a','#fde047'];CX.font='800 16px system-ui';const w=Math.max(CX.measureText(l.big).width,(CX.font='500 12px system-ui',CX.measureText(l.sub).width))+30;
 CX.fillStyle=col[0];CX.fillRect(x,y,8,52);CX.fillStyle='rgba(11,22,38,.92)';CX.fillRect(x+8,y,w,52);CX.textAlign='left';CX.textBaseline='middle';CX.fillStyle='#fff';CX.font='800 16px system-ui';CX.fillText(l.big,x+20,y+17);CX.fillStyle='#cbd5e1';CX.font='500 12px system-ui';CX.fillText(l.sub,x+20,y+38);CX.globalAlpha=1}
function pbpHTML(){if(!G||!G.pbp)return'';return`<div class="pbp">${G.pbp.slice(0,120).map(x=>`<div><small>${x.q<=4?'Q'+x.q:'OT'} ${mmss(x.c)}</small> ${esc(x.t)} <b>${x.sc[0]}-${x.sc[1]}</b></div>`).join('')}</div>`}
{const _gm=gameMenu;gameMenu=function(){_gm();try{const r=$('modal').querySelector('.row');if(r&&feat('pbp'))r.insertAdjacentHTML('beforeend',B("modal('<h2>Play-by-play</h2>'+pbpHTML()+B('closeModal();G.paused=false','Back to the game','big'))",'Play-by-play'));if(r&&feat('replay')&&G.rec&&G.rec.length>20)r.insertAdjacentHTML('beforeend',B("closeModal();startReplay(G.rec.slice(-180),'Instant replay')",'Instant replay'))}catch(e){}}}
// ---------- postgame ----------
const gsc=b=>b[SI.pts]+.4*b[SI.fgm]-.7*b[SI.fga]-.4*(b[SI.fta]-b[SI.ftm])+.7*b[SI.orb]+.3*b[SI.drb]+b[SI.stl]+.7*b[SI.ast]+.7*b[SI.blk]-.4*b[SI.pf]-b[SI.tov];
{const _eu=endUI;endUI=function(){_eu();if(!G)return;try{const r=gameResult(),box=$('modal').querySelector('.mbox');let add='';
  if(feat('postgame')){let best=null,bv=-99;r.res.T.forEach(S=>S.ps.forEach((p,i)=>{const v=gsc(S.box[i]);if(v>bv){bv=v;best=[p,S.box[i]]}}));
   const tot=k=>r.res.T[k].box.reduce((a,b)=>b.map((v,i)=>v+(a[i]||0)),[]),A=tot(0),Bt=tot(1),row=(n,a,b)=>{const s=a+b||1;return`<tr><td style="text-align:right">${a}</td><td><div class="cmp"><i style="width:${a/s*100}%;background:${R.t[r.a].col[0]}"></i><i style="width:${b/s*100}%;background:#94a3b8"></i></div><small>${n}</small></td><td>${b}</td></tr>`};
   const pc=(m,a)=>a?Math.round(m/a*100):0;
   add+=`<div class="cols"><div class="card"><h3>Player of the game</h3>${best?`${feat('faces')?faceSVG(best[0],54):''}<p><b>${esc(best[0].n)}</b> (${esc(R.t[best[0].tid].ab)})<br>${best[1][SI.pts]} pts, ${best[1][SI.orb]+best[1][SI.drb]} reb, ${best[1][SI.ast]} ast, ${best[1][SI.stl]} stl, ${best[1][SI.blk]} blk</p>`:''}
   ${G.qs?`<table class="t"><tr><th></th>${G.qs[0].map((_,i)=>`<th>${i<4?'Q'+(i+1):'OT'}</th>`).join('')}<th>T</th></tr>${[r.a,r.b].map(t=>{const k=G.tm.indexOf(t);return`<tr><td>${esc(R.t[t].ab)}</td>${G.qs[k].map(v=>`<td>${v}</td>`).join('')}<td><b>${G.sc[k]}</b></td></tr>`}).join('')}</table>`:''}</div>
   <div class="card"><h3>Team stats</h3><table class="t cmpt"><tr><th>${esc(R.t[r.a].ab)}</th><th></th><th>${esc(R.t[r.b].ab)}</th></tr>${row('FG%',pc(A[SI.fgm],A[SI.fga]),pc(Bt[SI.fgm],Bt[SI.fga]))}${row('3PT made',A[SI.tpm],Bt[SI.tpm])}${row('Free throws',A[SI.ftm],Bt[SI.ftm])}${row('Rebounds',A[SI.orb]+A[SI.drb],Bt[SI.orb]+Bt[SI.drb])}${row('Assists',A[SI.ast],Bt[SI.ast])}${row('Steals',A[SI.stl],Bt[SI.stl])}${row('Blocks',A[SI.blk],Bt[SI.blk])}${row('Turnovers',A[SI.tov],Bt[SI.tov])}</table></div></div>`}
  if(feat('hl')&&G.hls&&G.hls.length)add+=`<div class="row">${G.hls.map((h,i)=>B(`playHL(${i})`,'&#9654; '+esc(h.t),'xs')).join('')}</div>`;
  if(feat('pbp')&&G.pbp&&G.pbp.length)add+=`<details><summary>Play-by-play</summary>${pbpHTML()}</details>`;
  const h2=box.querySelector('h2');if(h2&&add)h2.insertAdjacentHTML('afterend',add)}catch(e){console.error(e)}}}
function playHL(i){const h=G.hls[i];if(!h)return;closeModal();startReplay(h.fr,h.t,()=>endUI())}
// ---------- sound, commentary, key hints, the follow camera ----------
let CROWDN=null;function crowdNoise(on,lvl){if(!feat('sound')||!feat('sound2')){if(CROWDN){CROWDN.g.gain.value=0}return}try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(!CROWDN){const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){l=l*.97+(rnd()*2-1)*.03;a[i]=l*4}
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;s.loop=true;f.type='bandpass';f.frequency.value=700;g.gain.value=0;s.connect(f);f.connect(g);g.connect(AC.destination);s.start();CROWDN={s,g}}
  CROWDN.g.gain.value=on?Math.min(.12,.025+lvl*.05):0}catch(e){}}
let VOICEAT=0;function voice(t){if(!feat('voice')||!window.speechSynthesis||Date.now()-VOICEAT<3000)return;VOICEAT=Date.now();try{const u=new SpeechSynthesisUtterance(t);u.rate=1.08;speechSynthesis.speak(u)}catch(e){}}
{const _he=hEvents;hEvents=function(){if(G&&G.ev&&G.ev.length){const ev=G.ev;if(ev.includes('whistle'))G.whT=.8;
   if(feat('sound2')&&ev.includes('screen'))snd(1800,.05,'square',.02);
   const b=G.b;if(ev.includes('dunk'))voice(pick(['Throws it down!','What a slam!','Boom!']));else if(ev.includes('three')&&G.clk<2)voice('At the buzzer! Bang!');else if(ev.includes('three'))voice(pick(['From downtown!','Bang!','Splash!']));else if(ev.includes('block'))voice(pick(['Rejected!','Get that out of here!']));}
  _he();if(!G)return;if(G.whT>0)G.whT-=1/60;if(G.lt)G.lt.t-=1/60;
  crowdNoise(!$('gamewrap').hidden&&!G.paused&&!G.viewer,(G.hype||0)*.6+Math.abs(G.mom||0)*.4+(G.q>=4&&Math.abs(G.sc[0]-G.sc[1])<6?.4:0));
  // dribbles and sneaker squeaks for the player you control
  if(feat('sound2')&&G.ctl&&G.b.st=='held'&&G.b.h===G.ctl&&G.phase=='live'){const t=performance.now();if(t-(G.drT||0)>430){G.drT=t;snd(95,.05,'sine',.05)}}
  if(feat('sound2')&&G.ctl){const e=G.ctl,a=Math.atan2(e.vy,e.vx),sp=Math.hypot(e.vx,e.vy);if(sp>9&&G.lastA!=null&&Math.abs(Math.atan2(Math.sin(a-G.lastA),Math.cos(a-G.lastA)))>1.2&&performance.now()-(G.sqT||0)>500){G.sqT=performance.now();snd(2200,.07,'triangle',.03,3200)}G.lastA=a}}}
{const _dg=doneGame;doneGame=function(){crowdNoise(false,0);return _dg()}}
{const _ch=closeModal;closeModal=function(){_ch();if(G&&G.paused===false)crowdNoise(true,0)}}
const HINTS={shoot:'Hold Space, let go at the top of the meter',rim:'Space near the rim: layup or dunk',pass:'E passes to the open man (or 1-5)',def:'E steal · Space contest · Tab switch',ft:'Hold Space, let go in the green'};
function hintFor(){const e=G.ctl,b=G.b;if(!e||G.phase!='live'||G.auto)return null;if(G.poss===0&&b.st=='held'&&b.h===e){const d=shotInfo(e,e.x,e.y).d;if(d<7)return'rim';if((G.heldT||0)>3.5)return'pass';return'shoot'}if(G.poss===1)return'def';return null}
{const _dh=drawHUD;drawHUD=function(){_dh();if(!G)return;try{if(G.intro>0)return drawIntro();if(feat('lower'))drawLT();
  if(feat('replay')&&G.rpHint>0&&!G.rp){CX.fillStyle='rgba(185,28,28,.85)';CX.font='700 12px system-ui';CX.textAlign='right';CX.fillRect(VW-150,58,138,22);CX.fillStyle='#fff';CX.fillText('Y: watch the replay',VW-20,69)}
  if(feat('keyhint')&&!G.rp&&!G.paused){const e=G.ctl;G.heldT=G.b.st=='held'&&G.b.h===e?(G.heldT||0)+1/60:0;const h=hintFor();if(h&&(G.hints[h]||0)<6){G.hints[h]=(G.hints[h]||0)+1/60;const[gx,gy]=P(e.x,e.y,0),y=gy-ftOf(e.p)*S*HZ-S*3.2;CX.font='600 12px system-ui';const w=CX.measureText(HINTS[h]).width+16;CX.fillStyle='rgba(15,23,42,.88)';CX.fillRect(gx-w/2,y-11,w,22);CX.fillStyle='#fde68a';CX.textAlign='center';CX.textBaseline='middle';CX.fillText(HINTS[h],gx,y)}}}catch(x){}}}
// follow camera: zoom in around the ball
{const _hd=hDraw;hDraw=function(){if(!G||!feat('cam2')||G.intro>0){if(G&&G.camOn){G.camOn=0;hResize()}return _hd()}if(!G.camOn){G.camOn=1;G.camX=47;G.camY=25}
  const b=G.rp?null:G.b,bx0=b?(b.st=='held'?b.h.x:b.x||47):G.camX,by0=b?(b.st=='held'?b.h.y:b.y||25):G.camY;G.camX+=(clamp(bx0,25,69)-G.camX)*.08;G.camY+=(clamp(by0,16,34)-G.camY)*.08;
  const base=Math.min((VW-24)/100,(VH-170)/(CH*KY+8));S=base*1.75;OX=VW/2-G.camX*S;OY=(VH+40)/2-G.camY*S*KY;CROWD=CROWD;_hd()}}
