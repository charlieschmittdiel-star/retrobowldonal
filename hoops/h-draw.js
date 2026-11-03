'use strict';
// Drawing: the arena, the court and its lines, both hoops, players (running, dribbling, shooting, jumping),
// the ball and its shadow, the scoreboard, the shot meter and on-screen hints.
let HIDEHELP=false,CV,CX,VW=0,VH=0,S=10,OX=0,OY=0;const KY=.6,HZ=.82;
const SKIN=['#f1c27d','#e0ac69','#c68642','#8d5524','#5c3a1e','#ffdbac','#a0662f','#3d2314'];
function hResize(){CV=$('cv');if(!CV)return;const dpr=Math.min(2,window.devicePixelRatio||1);VW=CV.clientWidth;VH=CV.clientHeight;CV.width=VW*dpr;CV.height=VH*dpr;CX=CV.getContext('2d');CX.setTransform(dpr,0,0,dpr,0,0);
 const top=78,bot=44;S=Math.min((VW-24)/100,(VH-top-bot-60)/(CH*KY+8));OX=(VW-CW*S)/2;OY=top+((VH-top-bot)-(CH*KY*S))/2+12;CROWD=null}
// PROJ can swap in a perspective view (h-view.js); otherwise the court is drawn flat
let PROJ=null;const P=(x,y,z)=>PROJ?PROJ(x,y,z||0):[OX+x*S,OY+y*S*KY-(z||0)*S*HZ];
function poly(pts,fill,stroke,lw){CX.beginPath();pts.forEach(([x,y,z],i)=>{const q=P(x,y,z);i?CX.lineTo(q[0],q[1]):CX.moveTo(q[0],q[1])});CX.closePath();if(fill){CX.fillStyle=fill;CX.fill()}if(stroke){CX.strokeStyle=stroke;CX.lineWidth=lw||1.5;CX.stroke()}}
function line(pts,col,lw){CX.beginPath();pts.forEach(([x,y,z],i)=>{const q=P(x,y,z||0);i?CX.lineTo(q[0],q[1]):CX.moveTo(q[0],q[1])});CX.strokeStyle=col;CX.lineWidth=lw||1.5;CX.stroke()}
const arcPts=(cx,cy,r,a0,a1,n)=>{const o=[];n=n||32;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}return o};
let CROWD=null;
function mkCrowd(){CROWD=[];const cols=['#e2e8f0','#94a3b8','#f87171','#60a5fa','#fbbf24','#34d399','#a78bfa','#f472b6','#1f2937','#fde68a'];for(let i=0;i<900;i++){const far=i<520;CROWD.push({x:-8+rnd()*110,y:far?-3-rnd()*9:55+rnd()*6,c:pick(cols),ph:rnd()*6})}}
function drawArena(){const g=CX.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#0b1020');g.addColorStop(1,'#141a2e');CX.fillStyle=g;CX.fillRect(0,0,VW,VH);
 if(feat('crowd')){if(!CROWD)mkCrowd();const t=performance.now()/1000,hype=G&&G.hype>0?G.hype:0;CROWD.forEach(c=>{const q=P(c.x,c.y,0);if(q[1]<60||q[1]>VH-30)return;const j=hype?Math.abs(Math.sin(t*8+c.ph))*hype*3:0;CX.fillStyle=c.c;CX.fillRect(q[0],q[1]-j,S*.55,S*.55)});
  // light glow
  const lg=CX.createRadialGradient(VW/2,OY+CH*KY*S/2,10,VW/2,OY+CH*KY*S/2,VW*.6);lg.addColorStop(0,'rgba(255,240,200,.10)');lg.addColorStop(1,'rgba(0,0,0,0)');CX.fillStyle=lg;CX.fillRect(0,0,VW,VH)}}
function drawCourt(){const home=G?R.t[G.home]:R.t[0],hc=home.col;
 poly([[-4,-3],[CW+4,-3],[CW+4,CH+3],[-4,CH+3]],'#7a4a2a');
 poly([[0,0],[CW,0],[CW,CH],[0,CH]],'#d6a565');
 // floor boards
 CX.globalAlpha=.13;for(let y=1.2;y<CH;y+=1.2)line([[0,y],[CW,y]],'#7c4a1c',1);CX.globalAlpha=1;
 // painted areas
 [0,1].forEach(sd=>{const X=x=>sd?CW-x:x;poly([[X(0),17],[X(19),17],[X(19),33],[X(0),33]],hc[0]+'cc')});
 // center circle
 poly(arcPts(47,25,6,0,Math.PI*2,40),hc[0]+'88');
 const W='#f8fafc';line([[0,0],[CW,0],[CW,CH],[0,CH],[0,0]],W,2);line([[47,0],[47,CH]],W,2);line(arcPts(47,25,6,0,Math.PI*2,40),W,2);line(arcPts(47,25,2,0,Math.PI*2,20),W,1.5);
 [0,1].forEach(sd=>{const X=x=>sd?CW-x:x,hx=HX[sd],dir=sd?-1:1;
  line([[X(0),17],[X(19),17],[X(19),33],[X(0),33]],W,2);line(sd?arcPts(X(19),25,6,Math.PI/2,Math.PI*1.5,24):arcPts(X(19),25,6,-Math.PI/2,Math.PI/2,24),W,2);
  const a=Math.asin(22/23.75),cx=X(14.2);line([[X(0),3],[cx,3]],W,2);line([[X(0),47],[cx,47]],W,2);
  line(arcPts(hx,25,23.75,-a,a,40).map(([x,y])=>[sd?hx-(x-hx):x,y]),W,2);
  line(arcPts(hx,25,4,-Math.PI/2,Math.PI/2,16).map(([x,y])=>[sd?hx-(x-hx):x,y]),W,1.5)});
 if(feat('crowd')){const q=P(47,25,0);CX.save();CX.translate(q[0],q[1]);CX.scale(1,KY);CX.fillStyle='rgba(255,255,255,.22)';CX.font=`900 ${Math.round(S*3.4)}px system-ui,sans-serif`;CX.textAlign='center';CX.textBaseline='middle';CX.fillText(home.ab,0,0);CX.restore()}}
function drawHoop(sd){const hx=HX[sd],dir=sd?1:-1,bx0=sd?CW-4:4,post=sd?CW+3:-3;
 line([[post,25,0],[post,25,11.5],[bx0,25,11.5]],'#475569',S*.35);
 poly([[bx0,22,9],[bx0,28,9],[bx0,28,12.5],[bx0,22,12.5]],'rgba(240,248,255,.8)','#1e293b',2);poly([[bx0,24,9.6],[bx0,26,9.6],[bx0,26,11],[bx0,24,11]],null,'#ef4444',1.5);
 // net
 const net=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;net.push([hx+Math.cos(a)*.75,25+Math.sin(a)*.75])}const sw=G&&G.netT>0?G.netT:0;
 net.forEach(([x,y])=>line([[x,y,RIM],[hx+(x-hx)*.45,25+(y-25)*.45,RIM-1.6-sw*1.2]],'rgba(255,255,255,.75)',1));
 line(arcPts(hx,25,.75,0,Math.PI*2,16).map(([x,y])=>[x,y,RIM]),'#f97316',2.5)}
function drawPlayer(e){const p=e.p,home=G.tm[e.t]===G.home,col=R.t[G.tm[e.t]].col,jer=home?col[0]:'#f1f5f9',trim=home?col[1]:col[0];
 const [gx,gy]=P(e.x,e.y,0),z=e.z,h=ftOf(p)*S*HZ,w=S*1.25,sp=Math.hypot(e.vx,e.vy);e.ph=(e.ph||0)+sp*.035;
 // shadow
 CX.fillStyle='rgba(0,0,0,.28)';CX.beginPath();CX.ellipse(gx,gy,w*.75,w*.3,0,0,Math.PI*2);CX.fill();
 if(e===G.ctl){CX.strokeStyle='#facc15';CX.lineWidth=2.5;CX.beginPath();CX.ellipse(gx,gy,w*1.05,w*.42,0,0,Math.PI*2);CX.stroke()}
 const y0=gy-z*S*HZ,leg=h*.42,swing=sp>1&&z<=0?Math.sin(e.ph)*w*.35:0,face=Math.cos(e.fa)>=0?1:-1;
 drawBody(e,gx,gy,y0,h,w,sp,swing,face,jer,trim);CX.textAlign='center';CX.textBaseline='middle';
 if(feat('labels')&&(e.t===0||e===G.ctl)){CX.font=`700 ${Math.min(15,Math.max(9,Math.round(S*.85)))}px system-ui,sans-serif`;CX.fillStyle=e===G.ctl?'#fde047':'rgba(255,255,255,.85)';CX.fillText(p.ln,gx,y0-h-w*.35)}
 // pass numbers over your teammates while you have the ball
 if(e.t===0&&G.phase=='live'&&G.poss===0&&G.b.st=='held'&&G.b.h===G.ctl&&e!==G.ctl&&!G.auto){const n=POS.indexOf(p.pos)+1;if(n>0){CX.fillStyle='rgba(15,23,42,.8)';CX.beginPath();CX.arc(gx,y0-h-w*1.2,w*.42,0,Math.PI*2);CX.fill();CX.fillStyle='#fff';CX.font=`800 ${Math.round(w*.5)}px system-ui`;CX.fillText(n,gx,y0-h-w*1.2)}}}
// the figure itself (the detailed model in h-fx.js can replace this)
function drawBody(e,gx,gy,y0,h,w,sp,swing,face,jer,trim){const p=e.p,z=e.z,leg=h*.42;
 const skin=SKIN[p.id%SKIN.length];
 CX.lineCap='round';CX.strokeStyle=skin;CX.lineWidth=w*.28;
 CX.beginPath();CX.moveTo(gx-w*.18,y0-leg);CX.lineTo(gx-w*.18+swing,y0);CX.moveTo(gx+w*.18,y0-leg);CX.lineTo(gx+w*.18-swing,y0);CX.stroke();
 // shoes
 CX.fillStyle='#111827';CX.fillRect(gx-w*.18+swing-w*.17,y0-w*.12,w*.34,w*.16);CX.fillRect(gx+w*.18-swing-w*.17,y0-w*.12,w*.34,w*.16);
 // shorts and jersey
 CX.fillStyle=jer;CX.fillRect(gx-w*.42,y0-leg-h*.08,w*.84,h*.16);CX.fillRect(gx-w*.4,y0-h*.8,w*.8,h*.36);CX.fillStyle=trim;CX.fillRect(gx-w*.42,y0-leg+h*.06,w*.84,h*.025);
 CX.fillStyle=trim;CX.font=`800 ${Math.max(8,Math.round(w*.48))}px system-ui,sans-serif`;CX.textAlign='center';CX.textBaseline='middle';CX.fillText(p.num,gx,y0-h*.62);
 // arms
 const k=e.act&&e.act.k,up=k=='shot'||k=='gather'||k=='jump'||k=='dunk'||k=='lay'||(e.z>.5),sh=y0-h*.76;CX.strokeStyle=skin;CX.lineWidth=w*.2;CX.beginPath();
 if(up){CX.moveTo(gx-w*.36,sh);CX.lineTo(gx-w*.3,sh-h*.32);CX.moveTo(gx+w*.36,sh);CX.lineTo(gx+w*.3,sh-h*.32)}
 else if(k=='reach'){CX.moveTo(gx+face*w*.36,sh);CX.lineTo(gx+face*w*1.1,sh+h*.08);CX.moveTo(gx-face*w*.36,sh);CX.lineTo(gx-face*w*.45,sh+h*.28)}
 else{const db=G.b.st=='held'&&G.b.h===e;CX.moveTo(gx-w*.38,sh);CX.lineTo(gx-w*.48+(db?0:swing*.3),sh+h*.3);CX.moveTo(gx+w*.38,sh);CX.lineTo(gx+w*.5-(db?-w*.15:swing*.3),sh+h*.3)}CX.stroke();
 // head
 CX.fillStyle=skin;CX.beginPath();CX.arc(gx,y0-h*.88,w*.3,0,Math.PI*2);CX.fill();CX.fillStyle='#1f160f';CX.beginPath();CX.arc(gx,y0-h*.9,w*.3,Math.PI,0);CX.fill();
}
function drawBall(){const b=G.b;if(!b||b.st=='dead')return;let x=b.x,y=b.y,z=b.z||0;if(b.st=='held'){const h=b.h,face=Math.cos(h.fa)>=0?1:-1;x=h.x+face*.7;y=h.y+.25;z=h.act&&(h.act.k=='shot'||h.act.k=='gather'||h.act.k=='lay'||h.act.k=='dunk')?ftOf(h.p)+1.1+h.z:Math.abs(Math.sin(performance.now()/120))*2.7+.3+h.z*.3}
 const [sx,sy]=P(x,y,0),[bx2,by2]=P(x,y,z),r=Math.max(3.5,S*.45);CX.fillStyle='rgba(0,0,0,.3)';CX.beginPath();CX.ellipse(sx,sy,r,r*.4,0,0,Math.PI*2);CX.fill();
 CX.fillStyle='#ea580c';CX.beginPath();CX.arc(bx2,by2,r,0,Math.PI*2);CX.fill();CX.strokeStyle='#431407';CX.lineWidth=1;CX.beginPath();CX.moveTo(bx2-r,by2);CX.lineTo(bx2+r,by2);CX.moveTo(bx2,by2-r);CX.lineTo(bx2,by2+r);CX.stroke()}
const mmss=s=>{s=Math.max(0,s);return s>=60?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:s.toFixed(1)};
function drawHUD(){const A=G.tm[0]===G.home?1:0,Hm=1-A;// away team on the left like a TV scoreboard
 const box=(x,w,fill)=>{CX.fillStyle=fill;CX.fillRect(x,10,w,48)};const cx=VW/2;CX.textBaseline='middle';
 [[A,cx-250],[Hm,cx+60]].forEach(([k,x])=>{const t=R.t[G.tm[k]];box(x,190,t.col[0]);CX.fillStyle=t.col[1];CX.font='800 20px system-ui,sans-serif';CX.textAlign='left';CX.fillText(t.ab+(k===0?' ★':''),x+12,34);CX.font='900 30px system-ui,sans-serif';CX.textAlign='right';CX.fillText(G.sc[k],x+178,34);
  CX.font='600 11px system-ui';CX.textAlign='left';CX.fillStyle='rgba(255,255,255,.85)';CX.fillText(G.tf[k]>=5?'BONUS':`Fouls ${G.tf[k]}`,x+12,52);if(G.poss===k&&G.phase=='live'){CX.fillStyle='#fde047';CX.beginPath();CX.arc(x+176,52,3.5,0,7);CX.fill()}});
 box(cx-60,120,'#0f172a');CX.fillStyle='#fff';CX.textAlign='center';CX.font='800 22px system-ui';CX.fillText(mmss(G.clk),cx,30);CX.font='600 12px system-ui';CX.fillStyle='#94a3b8';CX.fillText(G.q<=4?`Q${G.q}`:`OT${G.q>5?G.q-4:''}`,cx-32,50);
 if(feat('shotclk')&&G.shot<90){CX.fillStyle=G.shot<5?'#f87171':'#fbbf24';CX.font='800 14px system-ui';CX.fillText(Math.ceil(Math.max(0,G.shot)),cx+30,50)}
 if(G.msgT>0&&G.msg){CX.globalAlpha=Math.min(1,G.msgT*2);CX.font='800 22px system-ui';const w=CX.measureText(G.msg).width+36;CX.fillStyle='rgba(15,23,42,.85)';CX.fillRect(cx-w/2,68,w,36);CX.fillStyle='#fde68a';CX.fillText(G.msg,cx,87);CX.globalAlpha=1}
 // shot meter
 const mt=G.meter||(G.ft&&G.ft.meter?{e:G.ft.e,t:G.ft.meter.t,k:'ft'}:null),lm=G.lastMeter&&G.lastMeter.t>0?G.lastMeter:null;
 if((mt||lm)&&G.ctl){const e=mt?mt.e:G.ctl,[gx,gy]=P(e.x,e.y,0),h=ftOf(e.p)*S*HZ,x=gx+S*1.8,y=gy-h-6,H=h*.95,v=mt?Math.min(1.3,mt.t/MT):lm.v,w=meterWin(e.p,mt?mt.k:'mid');
  CX.fillStyle='rgba(15,23,42,.85)';CX.fillRect(x-2,y-2,12,H+4);CX.fillStyle='rgba(74,222,128,.55)';CX.fillRect(x,y+H*(1-(.93+w)/1.3),8,H*(2*w)/1.3);
  const f=Math.min(1,v/1.3);CX.fillStyle=lm&&!mt?(lm.q>.05?'#4ade80':lm.q>0?'#fde047':'#f87171'):'#f8fafc';CX.fillRect(x,y+H*(1-f),8,H*f)}
 // bottom: your player and controls
 const e=G.ctl;CX.textAlign='left';CX.font='600 12px system-ui';
 if(e&&!G.auto){const st=G.st[e.p.id]||0;CX.fillStyle='rgba(15,23,42,.8)';CX.fillRect(10,VH-40,250,30);CX.fillStyle='#e2e8f0';CX.fillText(`${e.p.pos} ${e.p.n} · ${ovr(e.p)}`,18,VH-30);CX.fillStyle='#334155';CX.fillRect(18,VH-21,150,5);CX.fillStyle=st>60?'#4ade80':st>35?'#fbbf24':'#f87171';CX.fillRect(18,VH-21,150*st/100,5)}
 if(!G.auto&&!HIDEHELP){CX.fillStyle='rgba(226,232,240,.75)';CX.textAlign='right';const off=G.poss===0;CX.fillText(G.phase=='ft'&&G.ft&&G.ft.e.t===0&&!autoPlay()?'Free throw: hold Space, let go in the green':off?(feat('arrows')&&!G.ctl2?'Move WASD · Arrows: drive / step-back / crossover · Hold Space shoot · E pass · Q lob · F screen · Shift sprint · P pause':'Move WASD/arrows · Hold Space shoot · E pass · 1-5 pass to · Q lob · R crossover · F screen · Shift sprint · P pause'):(feat('arrows')&&!G.ctl2?'Move WASD · Arrows quick slide · Space jump/contest · E steal · Tab switch · Shift sprint · P pause':'Move · Space jump/contest · E steal · Tab switch player · Shift sprint · P pause'),VW-12,VH-20)}
 if(G.paused){CX.fillStyle='rgba(2,6,23,.6)';CX.fillRect(0,0,VW,VH);CX.fillStyle='#fff';CX.textAlign='center';CX.font='800 34px system-ui';CX.fillText('Paused',VW/2,VH/2-10);CX.font='500 15px system-ui';CX.fillText('Press P or Esc to keep playing',VW/2,VH/2+24)}}
function hDraw(){if(!CX||!G)return;drawArena();drawCourt();const items=G.ent.map(e=>[e.y,()=>drawPlayer(e)]);items.push([25.01,()=>drawHoop(0)],[25.01,()=>drawHoop(1)]);
 const b=G.b;let by=b.st=='held'?b.h.y+.3:b.y||25;items.push([by+.01,drawBall]);items.sort((a,c)=>a[0]-c[0]).forEach(i=>i[1]());drawHUD()}
