'use strict';
// Drawing: the stadium, a striped pitch with every marking, both goals with nets, players in kits, the ball and its
// shadow, a camera that follows the play, the radar, the scoreboard and on-screen hints.
let CV,CX,VW=0,VH=0,S=20,OX=0,OY=0,CAMX=52.5,CAMY=34,HIDEHELP=false;const KY=.62,HZ=.9;
const SKIN=['#f1c27d','#e0ac69','#c68642','#8d5524','#5c3a1e','#ffdbac','#a0662f','#3d2314'];
function hResize(){CV=$('cv');if(!CV)return;const dpr=Math.min(2,window.devicePixelRatio||1);VW=CV.clientWidth;VH=CV.clientHeight;CV.width=VW*dpr;CV.height=VH*dpr;CX=CV.getContext('2d');CX.setTransform(dpr,0,0,dpr,0,0);CROWD=null}
function camera(){const z=OPT.zoom||1;S=Math.min(VW/(52/z),VH/(40/z*KY));const b=G?G.b:{x:52.5,y:34};const tx=G&&G.ctl&&G.b.own!==G.ctl?(b.x*.75+G.ctl.x*.25):b.x,ty=G&&G.ctl&&G.b.own!==G.ctl?(b.y*.75+G.ctl.y*.25):b.y;
 CAMX+=(tx-CAMX)*.08;CAMY+=(ty-CAMY)*.08;const hw=VW/S/2,hh=VH/(S*KY)/2;CAMX=clamp(CAMX,hw-8,PL+8-hw);CAMY=clamp(CAMY,hh-10,PW+8-hh);OX=VW/2-CAMX*S;OY=VH/2-CAMY*S*KY}
const P=(x,y,z)=>[OX+x*S,OY+y*S*KY-(z||0)*S*HZ];
function poly(pts,fill,stroke,lw){CX.beginPath();pts.forEach(([x,y,z],i)=>{const q=P(x,y,z);i?CX.lineTo(q[0],q[1]):CX.moveTo(q[0],q[1])});CX.closePath();if(fill){CX.fillStyle=fill;CX.fill()}if(stroke){CX.strokeStyle=stroke;CX.lineWidth=lw||2;CX.stroke()}}
function line(pts,col,lw){CX.beginPath();pts.forEach(([x,y,z],i)=>{const q=P(x,y,z||0);i?CX.lineTo(q[0],q[1]):CX.moveTo(q[0],q[1])});CX.strokeStyle=col;CX.lineWidth=lw||2;CX.stroke()}
const arcPts=(cx,cy,r,a0,a1,n)=>{const o=[];n=n||32;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}return o};
let CROWD=null;
function drawStadium(){CX.fillStyle='#0d1a12';CX.fillRect(0,0,VW,VH);
 // stands on all four sides
 poly([[-14,-16],[PL+14,-16],[PL+14,-4],[-14,-4]],'#1e293b');poly([[-14,PW+4],[PL+14,PW+4],[PL+14,PW+14],[-14,PW+14]],'#1e293b');poly([[-14,-4],[-5,-4],[-5,PW+4],[-14,PW+4]],'#172033');poly([[PL+5,-4],[PL+14,-4],[PL+14,PW+4],[PL+5,PW+4]],'#172033');
 if(feat('crowd')){if(!CROWD){CROWD=[];const cols=['#e2e8f0','#94a3b8','#f87171','#60a5fa','#fbbf24','#34d399','#a78bfa','#1f2937'];const hc=G?R.t[G.home].col:['#fff','#fff'];
   for(let i=0;i<1600;i++){const side=i%4;let x,y;if(side==0){x=-12+rnd()*(PL+24);y=-15+rnd()*10}else if(side==1){x=-12+rnd()*(PL+24);y=PW+5+rnd()*8}else if(side==2){x=-13+rnd()*7;y=-3+rnd()*(PW+6)}else{x=PL+6+rnd()*7;y=-3+rnd()*(PW+6)}CROWD.push({x,y,c:rnd()<.45?pick(hc):pick(cols),ph:rnd()*6})}}
  const t=performance.now()/1000,h=G&&G.hype>0?G.hype:0;CROWD.forEach(c=>{const q=P(c.x,c.y,0);if(q[0]<-10||q[0]>VW+10||q[1]<-10||q[1]>VH+10)return;CX.fillStyle=c.c;const j=h?Math.abs(Math.sin(t*9+c.ph))*h*2:0;CX.fillRect(q[0],q[1]-j,S*.45,S*.45)})}
 // advertising boards
 const hc=G?R.t[G.home]:{col:['#334155','#e2e8f0'],n:''};for(let x=0;x<PL;x+=15){poly([[x,-3],[x+14.5,-3],[x+14.5,-3,1],[x,-3,1]],x/15%2?hc.col[0]:'#0f172a')}}
function drawPitch(){const g1='#2f8f3a',g2='#2a8034';poly([[-4,-3],[PL+4,-3],[PL+4,PW+3],[-4,PW+3]],g2);for(let i=0;i<14;i++){const x0=i*PL/14;poly([[x0,0],[x0+PL/14,0],[x0+PL/14,PW],[x0,PW]],i%2?g1:g2)}
 const W='rgba(255,255,255,.92)';line([[0,0],[PL,0],[PL,PW],[0,PW],[0,0]],W);line([[PL/2,0],[PL/2,PW]],W);line(arcPts(PL/2,PW/2,9.15,0,Math.PI*2,48),W);
 [[52.5,34]].forEach(([x,y])=>{const q=P(x,y,0);CX.fillStyle=W;CX.beginPath();CX.ellipse(q[0],q[1],3,2,0,0,7);CX.fill()});
 [0,1].forEach(sd=>{const X=x=>sd?PL-x:x;line([[X(0),13.85],[X(16.5),13.85],[X(16.5),54.15],[X(0),54.15]],W);line([[X(0),24.85],[X(5.5),24.85],[X(5.5),43.15],[X(0),43.15]],W);
  const sp=P(X(11),34,0);CX.fillStyle=W;CX.beginPath();CX.ellipse(sp[0],sp[1],2.5,1.8,0,0,7);CX.fill();const a=Math.acos(5.5/9.15);line(arcPts(X(11),34,9.15,sd?Math.PI-a:-a,sd?Math.PI+a:a,20),W);
  [[0,0],[0,PW]].forEach(([_,cy])=>{line(arcPts(X(0),cy,1,cy?(sd?Math.PI:1.5*Math.PI):(sd?Math.PI/2:0),cy?(sd?1.5*Math.PI:2*Math.PI):(sd?Math.PI:Math.PI/2),6),W)})})}
function drawGoal(sd){const x=sd?PL:0,d=sd?1:-1,dep=2,c='#f8fafc';
 // net
 CX.globalAlpha=.35;for(let i=0;i<=8;i++){const y=GY0+i*GW/8;line([[x,y,GH],[x+d*dep,y,GH*.8],[x+d*dep,y,0]],'#e2e8f0',1)}for(let h=0;h<=4;h++){const z=h*GH/4;line([[x+d*dep,GY0,z*.8+(GH-z)*0],[x+d*dep,GY1,z*.8]],'#e2e8f0',1)}CX.globalAlpha=1;
 if(G&&G.netT>0&&G.netSide===sd){CX.globalAlpha=G.netT;poly([[x+d*dep,GY0,0],[x+d*dep,GY1,0],[x+d*dep,GY1,GH],[x+d*dep,GY0,GH]],'rgba(255,255,255,.25)');CX.globalAlpha=1}
 line([[x,GY0,0],[x,GY0,GH],[x,GY1,GH],[x,GY1,0]],c,Math.max(2,S*.14))}
function drawPlayer(e){const p=e.p,k=e.t,home=G.tm[k]===G.home,col=R.t[G.tm[k]].col,gk=e.pos=='GK';const shirt=gk?(k?'#a3e635':'#facc15'):home?col[0]:col[1],shorts=gk?'#111827':home?col[1]:col[0],num=gk?'#111':home?col[1]:col[0];
 const [gx,gy]=P(e.x,e.y,0),h=1.8*S*HZ,w=S*.6,sp=Math.hypot(e.vx,e.vy);e.ph=(e.ph||0)+sp*.045;const run=sp>.8,sw=run?Math.sin(e.ph)*w*.5:0,skin=SKIN[p.id%SKIN.length];
 CX.fillStyle='rgba(0,0,0,.28)';CX.beginPath();CX.ellipse(gx,gy,w*.85,w*.32,0,0,7);CX.fill();
 if(e===G.ctl){CX.strokeStyle='#facc15';CX.lineWidth=2.5;CX.beginPath();CX.ellipse(gx,gy,w*1.25,w*.5,0,0,7);CX.stroke();CX.fillStyle='#facc15';CX.beginPath();CX.moveTo(gx,gy-h-w*1.4);CX.lineTo(gx-w*.45,gy-h-w*2.1);CX.lineTo(gx+w*.45,gy-h-w*2.1);CX.fill()}
 const slide=e.act&&e.act.k=='slide',dive=e.act&&e.act.k=='dive';
 if(slide||dive){CX.save();CX.translate(gx,gy-w*.3);CX.rotate((e.vx>=0?1:-1)*Math.PI/2.6);CX.translate(-gx,-(gy-w*.3))}
 CX.lineCap='round';CX.strokeStyle=skin;CX.lineWidth=w*.32;CX.beginPath();CX.moveTo(gx-w*.18,gy-h*.42);CX.lineTo(gx-w*.18+sw,gy-h*.05);CX.moveTo(gx+w*.18,gy-h*.42);CX.lineTo(gx+w*.18-sw,gy-h*.05);CX.stroke();
 CX.strokeStyle=home&&!gk?'#f8fafc':shirt;CX.lineWidth=w*.34;CX.beginPath();CX.moveTo(gx-w*.18+sw*.6,gy-h*.2);CX.lineTo(gx-w*.18+sw,gy-h*.05);CX.moveTo(gx+w*.18-sw*.6,gy-h*.2);CX.lineTo(gx+w*.18-sw,gy-h*.05);CX.stroke();
 CX.fillStyle='#111827';CX.fillRect(gx-w*.18+sw-w*.2,gy-h*.06,w*.4,h*.06);CX.fillRect(gx+w*.18-sw-w*.2,gy-h*.06,w*.4,h*.06);
 CX.fillStyle=shorts;CX.fillRect(gx-w*.45,gy-h*.5,w*.9,h*.13);CX.fillStyle=shirt;CX.fillRect(gx-w*.48,gy-h*.82,w*.96,h*.36);
 CX.fillStyle=num;CX.font=`800 ${Math.max(7,Math.round(w*.62))}px system-ui,sans-serif`;CX.textAlign='center';CX.textBaseline='middle';CX.fillText(p.num,gx,gy-h*.65);
 const up=e.act&&(e.act.k=='head'||dive);CX.strokeStyle=gk?shirt:skin;CX.lineWidth=w*.24;CX.beginPath();if(up){CX.moveTo(gx-w*.45,gy-h*.78);CX.lineTo(gx-w*.55,gy-h*1.05);CX.moveTo(gx+w*.45,gy-h*.78);CX.lineTo(gx+w*.55,gy-h*1.05)}else{CX.moveTo(gx-w*.48,gy-h*.78);CX.lineTo(gx-w*.62-sw*.3,gy-h*.5);CX.moveTo(gx+w*.48,gy-h*.78);CX.lineTo(gx+w*.62+sw*.3,gy-h*.5)}CX.stroke();
 CX.fillStyle=skin;CX.beginPath();CX.arc(gx,gy-h*.9,w*.36,0,7);CX.fill();CX.fillStyle='#1f160f';CX.beginPath();CX.arc(gx,gy-h*.93,w*.36,Math.PI,0);CX.fill();
 if(slide||dive)CX.restore();
 if(feat('labels')&&(k===0||e===G.ctl)&&!G.auto){CX.font=`700 ${Math.max(9,Math.round(S*.42))}px system-ui`;CX.fillStyle=e===G.ctl?'#fde047':'rgba(255,255,255,.85)';CX.fillText(p.ln,gx,gy-h-w*.6)}}
function drawBall(){const b=G.b,[sx,sy]=P(b.x,b.y,0),[bx2,by2]=P(b.x,b.y,b.z+.11),r=Math.max(3,S*.16);CX.fillStyle='rgba(0,0,0,.3)';CX.beginPath();CX.ellipse(sx,sy,r*1.1,r*.45,0,0,7);CX.fill();
 CX.fillStyle='#f8fafc';CX.beginPath();CX.arc(bx2,by2,r,0,7);CX.fill();CX.fillStyle='#111';const a=performance.now()/120*(Math.hypot(b.vx,b.vy)>1?1:0);for(let i=0;i<3;i++){CX.beginPath();CX.arc(bx2+Math.cos(a+i*2.1)*r*.45,by2+Math.sin(a+i*2.1)*r*.45,r*.28,0,7);CX.fill()}}
function drawRadar(){if(!feat('radar'))return;const w=Math.min(220,VW*.22),h=w*PW/PL,x0=VW/2-w/2,y0=VH-h-12;CX.fillStyle='rgba(15,23,42,.72)';CX.fillRect(x0-3,y0-3,w+6,h+6);CX.strokeStyle='rgba(255,255,255,.35)';CX.lineWidth=1;CX.strokeRect(x0,y0,w,h);CX.beginPath();CX.moveTo(x0+w/2,y0);CX.lineTo(x0+w/2,y0+h);CX.stroke();
 G.ent.forEach(e=>{if(e.off)return;CX.fillStyle=e===G.ctl?'#fde047':e.t===0?'#38bdf8':'#f87171';CX.beginPath();CX.arc(x0+e.x/PL*w,y0+e.y/PW*h,e===G.ctl?3.5:2.5,0,7);CX.fill()});
 CX.fillStyle='#fff';CX.beginPath();CX.arc(x0+G.b.x/PL*w,y0+G.b.y/PW*h,2,0,7);CX.fill()}
function drawHUD(){const L=R.t[G.tm[0]===G.home?0:1],home=R.t[G.home],away=R.t[G.tm[0]===G.home?G.tm[1]:0],kH=G.tm.indexOf(G.home),kA=1-kH;
 CX.textBaseline='middle';const x=14,y=12;CX.fillStyle='rgba(11,18,32,.92)';CX.fillRect(x,y,300,38);CX.fillStyle=home.col[0];CX.fillRect(x,y,6,38);CX.fillStyle=away.col[0];CX.fillRect(x+294,y,6,38);
 CX.fillStyle='#fff';CX.font='800 17px system-ui';CX.textAlign='left';CX.fillText(home.ab+(G.home===0?'★':''),x+14,y+19);CX.textAlign='center';CX.fillText(`${G.sc[kH]} - ${G.sc[kA]}`,x+150,y+19);CX.textAlign='right';CX.fillText((G.home!==0?'★':'')+away.ab,x+286,y+19);
 CX.fillStyle='#0f172a';CX.fillRect(x+300,y,64,38);CX.fillStyle='#4ade80';CX.font='800 15px system-ui';CX.textAlign='center';const m=Math.floor(clkMin());CX.fillText(G.clk>=45?`45+${Math.floor(G.clk-44)}'`:`${m}'`,x+332,y+19);
 if(G.msgT>0&&G.msg){CX.globalAlpha=Math.min(1,G.msgT*2);CX.font='800 22px system-ui';const w=CX.measureText(G.msg).width+36;CX.fillStyle='rgba(15,23,42,.85)';CX.fillRect(VW/2-w/2,60,w,38);CX.fillStyle='#fde68a';CX.textAlign='center';CX.fillText(G.msg,VW/2,80);CX.globalAlpha=1}
 // shot power
 const mt=G.meter,lm=G.lastMeter&&G.lastMeter.t>0?G.lastMeter:null,pm=G.pen&&G.pen.meter;if((mt||lm||pm)&&G.ctl){const e=G.ctl,[gx,gy]=P(e.x,e.y,0),h=1.8*S*HZ,bx0=gx-30,by0=gy-h-30,v=mt?Math.min(1.3,mt.t/MT):pm?Math.min(1.3,pm.t/.75):lm.v;
  CX.fillStyle='rgba(15,23,42,.85)';CX.fillRect(bx0-2,by0-2,64,12);CX.fillStyle='rgba(74,222,128,.6)';const ctr=pm?.9:.85;CX.fillRect(bx0+60*(ctr-.1)/1.3,by0,60*.2/1.3,8);CX.fillStyle=lm&&!mt&&!pm?(lm.good?'#4ade80':'#f87171'):'#fff';CX.fillRect(bx0,by0,60*Math.min(1,v/1.3),8)}
 if(G.phase=='pen'&&!G.auto){const P_=G.pen,t=P_.e.t===0?'Penalty: hold Space and let go in the green. Hold W or S to pick a side.':P_.gk&&P_.gk.t===0?'Save it: press W or S to dive, or Space to stay in the middle.':'';if(t){CX.font='700 15px system-ui';CX.fillStyle='rgba(15,23,42,.85)';const w=CX.measureText(t).width+30;CX.fillRect(VW/2-w/2,110,w,32);CX.fillStyle='#fde68a';CX.textAlign='center';CX.fillText(t,VW/2,126)}}
 const e=G.ctl;CX.textAlign='left';CX.font='600 12px system-ui';if(e&&!G.auto){const st=G.st[e.p.id]||0;CX.fillStyle='rgba(15,23,42,.8)';CX.fillRect(10,VH-40,240,30);CX.fillStyle='#e2e8f0';CX.fillText(`${e.p.pos} ${e.p.n} · ${ovr(e.p)}`,18,VH-30);CX.fillStyle='#334155';CX.fillRect(18,VH-21,140,5);CX.fillStyle=st>60?'#4ade80':st>35?'#fbbf24':'#f87171';CX.fillRect(18,VH-21,140*st/100,5)}
 if(!G.auto&&!HIDEHELP&&VW>900){CX.fillStyle='rgba(226,232,240,.8)';CX.textAlign='right';const att=G.b.own&&G.b.own.t===0;CX.fillText(att?'Move WASD · Hold Space shoot · E pass · Q through ball · R cross/long · F skill · Shift sprint · P pause':'Move · E tackle · Space slide · Q/Tab switch · F press · Shift sprint · P pause',VW-12,VH-20)}
 if(G.paused){CX.fillStyle='rgba(2,6,23,.6)';CX.fillRect(0,0,VW,VH);CX.fillStyle='#fff';CX.textAlign='center';CX.font='800 34px system-ui';CX.fillText('Paused',VW/2,VH/2-10);CX.font='500 15px system-ui';CX.fillText('Press P or Esc to keep playing',VW/2,VH/2+24)}}
function hDraw(){if(!CX||!G)return;camera();drawStadium();drawPitch();const items=G.ent.filter(e=>!e.off).map(e=>[e.y,()=>drawPlayer(e)]);items.push([G.b.y+.05,drawBall]);
 items.push([GY0-.01,()=>drawGoal(0)],[GY0-.01,()=>drawGoal(1)]);items.sort((a,c)=>a[0]-c[0]).forEach(i=>i[1]());drawRadar();drawHUD()}
