'use strict';
// Broadcast graphics and game feel: a TV camera that follows the play, a real wood floor, a full crowd, glass
// backboards with mesh nets, a shaded ball, arena lighting and floor reflections; smoother, slower movement;
// smarter defense; a shot meter whose green window depends on how open you are; and a meter for layups and dunks.
// Each part has its own switch.
{const add=[['Presentation','gfx3','Broadcast graphics','A TV camera that follows the play, a real wood floor, a full crowd, glass backboards, arena lighting and reflections on the floor.'],
 ['On the court','smooth','Smoother movement','Players move a little slower, speed up and turn smoothly, and feel heavier.'],
 ['On the court','def2','Smarter defense','Defenders anticipate drives, deny passes, close out on shooters with a hand up, and help and recover.'],
 ['On the court','openmt','Open-shot meter','The green window on the shot meter is bigger when you are open and smaller when a defender is on you.'],
 ['On the court','laymt','Layup and dunk meter','Layups and dunks use a quick shot meter too. Time it for a better finish.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const GFX=()=>feat('gfx3')&&typeof document!='undefined';
// ---------- the camera ----------
const CAM={x:47,y:25,on:0,last:0};
function camFrame(close){const now=performance.now(),dt=Math.min(.1,(now-(CAM.last||now))/1000)||.016;CAM.last=now;
 const base=Math.min((VW-24)/100,(VH-182)/(CH*KY+8)),z=close?1.75:VW<800?1.2:1.42;S=base*z;
 const b=G.b;let tx=47,ty=25;if(b&&!G.rp){const h=b.st=='held'&&b.h?b.h:null;tx=h?h.x+h.vx*.35:(b.x||47)+(b.vx||0)*.25;ty=h?h.y:(b.y||25);
  // lean toward the basket being attacked
  if(G.phase=='live'&&b.st=='held'&&G.poss!=null){const s=G.dir[G.poss];if(s)tx+=s*6}}
 if(G.rp&&G.ent.length){const h=G.b&&G.b.h;tx=h?h.x:(G.b.x||47);ty=h?h.y:(G.b.y||25)}
 if(!isFinite(tx))tx=47;if(!isFinite(ty))ty=25;if(!isFinite(CAM.x)||!isFinite(CAM.y))CAM.on=0;
 const hw=VW/(2*S),hh=VH/(2*S*KY);tx=hw*2>=CW+28?47:clamp(tx,hw-14,CW+14-hw);ty=hh*2>=CH+30?25:clamp(25+(ty-25)*.45,hh-16,CH+12-hh);
 if(!CAM.on){CAM.x=tx;CAM.y=ty;CAM.on=1}const f=1-Math.exp(-dt*2.6);CAM.x+=(tx-CAM.x)*f;CAM.y+=(ty-CAM.y)*f;
 OX=VW/2-CAM.x*S;OY=VH/2+16-CAM.y*S*KY}
{const _hd=hDraw;hDraw=function(){if(!CX||!G)return _hd();if(!GFX()){if(G.gfxOn){G.gfxOn=0;CAM.on=0;hResize()}return _hd()}G.gfxOn=1;const c2=OPT.cam2;OPT.cam2=0;try{camFrame(c2&&c2!==0);_hd()}catch(err){if(!G.gfxErr){G.gfxErr=1;console.warn('graphics',err)}try{hResize();OPT.cam2=c2;_hd()}catch(e2){}}finally{OPT.cam2=c2}}}
// ---------- textures: the floor and the stands are painted once per arena ----------
const PXF=22,PXC=9,FX0=-6,FY0=-4.6,FW=106,FH=59.2,AX0=-30,AY0=-30,AW=154,AH=112;let TEX={};
function hexA(c,a){const n=parseInt(c.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function mkFloor(t){const T=R.t[t],fl=feat('stad2')?floorFor(t):['#d6a565','#7c4a1c'],c=document.createElement('canvas');c.width=FW*PXF;c.height=FH*PXF;const x=c.getContext('2d'),X=v=>(v-FX0)*PXF,Y=v=>(v-FY0)*PXF;
 let seed=t*977+13;const r=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 // apron in the home team's color
 x.fillStyle=shade(T.col[0],.42);x.fillRect(0,0,c.width,c.height);
 // maple boards: rows along the length of the court, staggered joints, a little color in every board
 const bw=.42;for(let y=0;y<CH;y+=bw){let xx=-r()*6;while(xx<CW){const L=4+r()*8,v=.9+r()*.17,col=shade(fl[0],v);x.fillStyle=col;const x0=Math.max(0,xx),x1=Math.min(CW,xx+L);x.fillRect(X(x0),Y(y),(x1-x0)*PXF+1,bw*PXF+1);
   x.globalAlpha=.07;x.strokeStyle=fl[1];x.lineWidth=1;for(let g=0;g<3;g++){const gy=Y(y)+r()*bw*PXF;x.beginPath();x.moveTo(X(x0),gy);x.bezierCurveTo(X(x0+(x1-x0)*.3),gy+(r()-.5)*4,X(x0+(x1-x0)*.7),gy+(r()-.5)*4,X(x1),gy);x.stroke()}
   x.globalAlpha=.22;x.fillStyle=fl[1];x.fillRect(X(x1)-1,Y(y),1.2,bw*PXF);x.globalAlpha=1;xx+=L}
  x.globalAlpha=.12;x.fillStyle=fl[1];x.fillRect(X(0),Y(y),CW*PXF,1);x.globalAlpha=1}
 // a darker stain inside the three-point lines, the painted keys and the center circle
 [0,1].forEach(sd=>{const hx=HX[sd];x.save();x.beginPath();x.rect(X(sd?CW-14.2:0),Y(3),14.2*PXF,44*PXF);x.arc(X(hx),Y(25),G3*PXF,0,7);x.clip();x.fillStyle='rgba(60,30,10,.08)';x.fillRect(X(sd?hx-G3:0),0,(G3+6)*PXF,c.height);x.restore();
  const k0=sd?CW-19:0;const g=x.createLinearGradient(X(k0),0,X(k0+19),0);g.addColorStop(sd?1:0,hexA(T.col[0],.92));g.addColorStop(sd?0:1,hexA(T.col[0],.78));x.fillStyle=g;x.fillRect(X(k0),Y(17),19*PXF,16*PXF)});
 x.fillStyle=hexA(T.col[0],.8);x.beginPath();x.arc(X(47),Y(25),6*PXF,0,7);x.fill();
 // center logo
 x.save();x.translate(X(47),Y(25));x.fillStyle=T.col[1];x.globalAlpha=.9;x.beginPath();x.arc(0,0,3.6*PXF,0,7);x.fill();x.globalAlpha=1;x.fillStyle=T.col[0];x.font=`900 ${Math.round(2.6*PXF)}px system-ui,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(T.ab,0,PXF*.15);x.restore();
 // names on the apron and the baselines
 x.fillStyle=T.col[1];x.font=`900 ${Math.round(2.6*PXF)}px system-ui,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(T.n.toUpperCase(),X(47),Y(CH+2.4));
 x.font=`800 ${Math.round(1.6*PXF)}px system-ui,sans-serif`;x.globalAlpha=.85;x.fillText(`${T.n.split(' ')[0].toUpperCase()} ARENA`,X(47),Y(-2.4));x.globalAlpha=1;
 x.save();x.font=`900 ${Math.round(2*PXF)}px system-ui,sans-serif`;[[ -3,1],[CW+3,-1]].forEach(([bx,r0])=>{x.save();x.translate(X(bx),Y(25));x.rotate(r0*Math.PI/2);x.fillText(T.ab,0,0);x.restore()});x.restore();
 // a coat of varnish: a soft sheen across the floor
 const vg=x.createLinearGradient(0,Y(0),0,Y(CH));vg.addColorStop(0,'rgba(255,255,255,.10)');vg.addColorStop(.45,'rgba(255,255,255,.02)');vg.addColorStop(1,'rgba(0,0,0,.10)');x.fillStyle=vg;x.fillRect(X(0),Y(0),CW*PXF,CH*PXF);
 x.save();x.globalCompositeOperation='lighter';[[25,18],[69,18],[47,32]].forEach(([lx,ly])=>{const g=x.createRadialGradient(X(lx),Y(ly),2,X(lx),Y(ly),22*PXF);g.addColorStop(0,'rgba(255,244,214,.12)');g.addColorStop(1,'rgba(255,244,214,0)');x.fillStyle=g;x.fillRect(0,0,c.width,c.height)});x.restore();
 return c}
function mkStands(t){const T=R.t[t],c=document.createElement('canvas');c.width=AW*PXC;c.height=AH*PXC;const x=c.getContext('2d'),X=v=>(v-AX0)*PXC,Y=v=>(v-AY0)*PXC,iy=1/KY;
 let seed=t*7919+5;const r=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 const bg=x.createLinearGradient(0,0,0,c.height);bg.addColorStop(0,'#05070d');bg.addColorStop(.5,'#0c1222');bg.addColorStop(1,'#05070d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);
 const cols=['#e2e8f0','#94a3b8','#475569','#f87171','#60a5fa','#fbbf24','#34d399','#a78bfa','#f472b6','#1f2937','#fde68a','#0f172a'],skins=SKIN,hair=['#1f160f','#3b2314','#6b4423','#c8a165','#111','#d6d3d1'];
 const person=(px,py,sc,back,dim)=>{const sh=r()<.45?pick(T.col):cols[Math.floor(r()*cols.length)],w=.78*sc*PXC,h=.95*sc*PXC*iy;x.globalAlpha=dim;
  x.fillStyle=sh;x.beginPath();x.moveTo(px-w/2,py);x.lineTo(px-w/2,py-h*.55);x.quadraticCurveTo(px,py-h*.85,px+w/2,py-h*.55);x.lineTo(px+w/2,py);x.fill();
  x.fillStyle=back?hair[Math.floor(r()*hair.length)]:skins[Math.floor(r()*skins.length)];x.beginPath();x.ellipse(px,py-h*.95,w*.32,w*.36*iy*.8,0,0,7);x.fill();
  if(!back&&r()<.5){x.fillStyle=hair[Math.floor(r()*hair.length)];x.beginPath();x.ellipse(px,py-h*1.06,w*.33,w*.18*iy*.8,0,Math.PI,0);x.fill()}
  if(r()<.05){x.fillStyle=T.col[0];x.fillRect(px+w*.3,py-h*1.45,w*.22,h*.6)}x.globalAlpha=1};
 // far stands (behind the far sideline): rows climb away from the court
 for(let row=0;row<17;row++){const y=-6.2-row*1.35,dim=1-row*.035;x.fillStyle=row%2?'#111827':'#0f172a';x.fillRect(X(-24),Y(y-1.35),(CW+48)*PXC,1.35*PXC);for(let px=-23;px<CW+23;px+=.92+r()*.25){if(Math.abs(((px+200)%20)-10)<.7)continue;if(r()<.08)continue;person(X(px),Y(y),1,false,dim)}}
 // near stands (seen from behind) and the baseline stands
 for(let row=0;row<12;row++){const y=CH+6.8+row*1.35,dim=.92-row*.04;x.fillStyle=row%2?'#0b1120':'#0f172a';x.fillRect(X(-24),Y(y-1.35),(CW+48)*PXC,1.35*PXC);for(let px=-23;px<CW+23;px+=.95+r()*.25){if(Math.abs(((px+200)%20)-10)<.7)continue;if(r()<.06)continue;person(X(px),Y(y),1.05,true,dim)}}
 [[-27,-9],[CW+9,CW+27]].forEach(([a,b])=>{for(let px=a;px<b;px+=1.4)for(let y=-4;y<CH+5;y+=1.05){if(r()<.12)continue;person(X(px+r()*.4),Y(y),.95,false,.75)}});
 // LED ribbon boards and courtside seats
 x.fillStyle='#020617';x.fillRect(X(-24),Y(-6.1),(CW+48)*PXC,.9*PXC);const rg=x.createLinearGradient(X(-24),0,X(CW+24),0);rg.addColorStop(0,T.col[0]);rg.addColorStop(.5,shade(T.col[0],1.25));rg.addColorStop(1,T.col[0]);x.fillStyle=rg;x.fillRect(X(-24),Y(-5.95),(CW+48)*PXC,.6*PXC);
 x.fillStyle=T.col[1];x.font=`800 ${Math.round(.5*PXC*iy)}px system-ui`;x.textAlign='center';x.textBaseline='middle';for(let px=-14;px<CW+20;px+=24)x.fillText(`${T.n.toUpperCase()}  ·  ${R.season?'SEASON '+R.season:''}`,X(px),Y(-5.65));
 x.fillStyle='#020617';x.fillRect(X(-24),Y(CH+5.1),(CW+48)*PXC,.9*PXC);x.fillStyle=rg;x.fillRect(X(-24),Y(CH+5.25),(CW+48)*PXC,.6*PXC);
 for(let px=-4;px<CW+4;px+=1.3){if(px>14&&px<80)continue;x.fillStyle='#1e293b';x.fillRect(X(px),Y(-5.2)-.7*PXC*iy,.9*PXC,.7*PXC*iy);if(r()<.6)person(X(px+.45),Y(-4.9),1,false,1)}
 for(let px=-4;px<CW+4;px+=1.3){x.fillStyle='#1e293b';x.fillRect(X(px),Y(CH+4.6)-.6*PXC*iy,.9*PXC,.6*PXC*iy);if(r()<.55)person(X(px+.45),Y(CH+4.7),1,true,1)}
 // the scorer's table
 x.fillStyle='#0f172a';x.fillRect(X(36),Y(-5)-1.1*PXC*iy,22*PXC,1.1*PXC*iy);x.fillStyle=T.col[0];x.fillRect(X(36),Y(-5)-1.1*PXC*iy,22*PXC,.35*PXC*iy);
 return c}
function tex(){const k=G.home+':'+(feat('stad2')?1:0)+':'+R.t[G.home].col.join();if(!TEX[k]){TEX={};TEX[k]={f:mkFloor(G.home),s:mkStands(G.home)}}return TEX[k]}
// the textures are scaled to the screen once (and again only if the window size changes); each frame copies just the part on screen
const SC={};
function blit(img,x0,y0,px,id,oy){const dpr=Math.min(2,window.devicePixelRatio||1),d=Math.min(dpr,1.25),k=id+':'+S.toFixed(2)+':'+d+':'+img.width;let c=SC[id];
 if(!c||c.k!==k){c=document.createElement('canvas');c.width=Math.ceil(img.width*S*d/px);c.height=Math.ceil(img.height*S*KY*d/px);const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(img,0,0,c.width,c.height);c.k=k;SC[id]=c}
 const dx=Math.round((OX+x0*S)*d),dy=Math.round((OY+y0*S*KY+(oy||0))*d),sx=Math.max(0,-dx),sy=Math.max(0,-dy),tx=Math.max(0,dx),ty=Math.max(0,dy),sw=Math.min(c.width-sx,Math.ceil(VW*d)-tx),sh=Math.min(c.height-sy,Math.ceil(VH*d)-ty);if(sw<=0||sh<=0)return;
 CX.save();CX.setTransform(dpr/d,0,0,dpr/d,0,0);CX.drawImage(c,sx,sy,sw,sh,tx,ty,sw,sh);CX.restore()}
{const _da=drawArena;drawArena=function(){if(!GFX()||!G||!R||!R.t[G.home])return _da();const T=tex();CX.fillStyle='#05070d';CX.fillRect(0,0,VW,VH);
  if(feat('crowd')){const hy=G.hype>0?G.hype:0,j=hy?Math.abs(Math.sin(performance.now()/110))*hy*1.6:0;blit(T.s,AX0,AY0,PXC,'s',-j);
   // camera flashes after big moments
   if(hy>.6&&rnd()<.5){for(let i=0;i<3;i++){const q=P(-20+rnd()*134,rnd()<.6?-8-rnd()*18:CH+7+rnd()*12,0);CX.fillStyle='rgba(255,255,255,.85)';CX.beginPath();CX.arc(q[0],q[1],1.2+rnd()*2.2,0,7);CX.fill()}}}
  else{CX.fillStyle='#0c1222';CX.fillRect(0,0,VW,VH)}
  if(feat('night')&&R.po&&!G.auto){CX.fillStyle='rgba(0,0,0,.3)';CX.fillRect(0,0,VW,VH);CX.fillStyle='#fde68a';CX.font='800 13px system-ui';CX.textAlign='left';CX.fillText('PLAYOFFS',14,24)}}}
function courtLines(){const W='rgba(250,250,250,.95)',lw=Math.max(1.5,S*.13);line([[0,0],[CW,0],[CW,CH],[0,CH],[0,0]],W,lw*1.3);line([[47,0],[47,CH]],W,lw);line(arcPts(47,25,6,0,Math.PI*2,48),W,lw);line(arcPts(47,25,2,0,Math.PI*2,24),W,lw);
 [0,1].forEach(sd=>{const X=x=>sd?CW-x:x,hx=HX[sd];line([[X(0),17],[X(19),17],[X(19),33],[X(0),33]],W,lw);line(sd?arcPts(X(19),25,6,Math.PI/2,Math.PI*1.5,28):arcPts(X(19),25,6,-Math.PI/2,Math.PI/2,28),W,lw);
  CX.setLineDash([S*.9,S*.7]);line(sd?arcPts(X(19),25,6,-Math.PI/2,Math.PI/2,28):arcPts(X(19),25,6,Math.PI/2,Math.PI*1.5,28),'rgba(250,250,250,.6)',lw*.8);CX.setLineDash([]);
  const a=Math.asin(22/23.75),cx=X(14.2);line([[X(0),3],[cx,3]],W,lw);line([[X(0),47],[cx,47]],W,lw);line(arcPts(hx,25,23.75,-a,a,56).map(([x,y])=>[sd?hx-(x-hx):x,y]),W,lw);
  line(arcPts(hx,25,4,-Math.PI/2,Math.PI/2,18).map(([x,y])=>[sd?hx-(x-hx):x,y]),W,lw*.8);[7,8,11,14].forEach(d=>{line([[X(d),17],[X(d),16.4]],W,lw*.8);line([[X(d),33],[X(d),33.6]],W,lw*.8)});line([[X(28),0],[X(28),3]],W,lw*.8);line([[X(28),CH],[X(28),CH-3]],W,lw*.8)})}
{const _dc=drawCourt;drawCourt=function(){if(!GFX()||!G||!R||!R.t[G.home])return _dc();const T=tex();blit(T.f,FX0,FY0,PXF,'f');
  // overhead lights shining on the varnish
  courtLines()}}
// ---------- glass backboards, padded stanchions and mesh nets ----------
function drawHoop2(sd){const hx=HX[sd],dir=sd?1:-1,bx0=sd?CW-4:4,post=sd?CW+5.5:-5.5,T=R.t[G.home],sk=feat('ballfx')&&G.rimShake>0?Math.sin(performance.now()/25)*G.rimShake*.25:0;
 // stanchion base and arm
 const b0=P(post,25,0),b1=P(post+dir*1.6,25,0);CX.fillStyle='rgba(0,0,0,.35)';CX.beginPath();CX.ellipse((b0[0]+b1[0])/2,b0[1]+S*.3,S*2.6,S*1.1,0,0,7);CX.fill();
 const pad=(y,f)=>poly([[post-1.2,y,0],[post+1.2,y,0],[post+1.2,y,2.4],[post-1.2,y,2.4]],f);pad(23.8,shade(T.col[0],.6));pad(26.2,T.col[0]);poly([[post-1.2,23.8,2.4],[post+1.2,23.8,2.4],[post+1.2,26.2,2.4],[post-1.2,26.2,2.4]],shade(T.col[0],1.3));
 line([[post-1.2,26.2,2.4],[post+1.2,26.2,2.4]],'rgba(255,255,255,.35)',1);
 line([[post,25,3],[post,25,12.6],[bx0+dir*.4,25,12.6]],'#334155',Math.max(3,S*.42));line([[post,25,7],[bx0+dir*.4,25,11.2]],'#475569',Math.max(2,S*.2));
 // the glass: a slightly angled panel so you can see it from the side
 const sw=dir,corner=(y,z)=>{const q=P(bx0+(y-25)*sw*.32,y,z);return[q[0]+sk*S,q[1]]};const c=[corner(22,9),corner(28,9),corner(28,12.5),corner(22,12.5)];
 CX.beginPath();c.forEach((q,i)=>i?CX.lineTo(q[0],q[1]):CX.moveTo(q[0],q[1]));CX.closePath();const gg=CX.createLinearGradient(c[3][0],c[3][1],c[1][0],c[1][1]);gg.addColorStop(0,'rgba(226,240,255,.42)');gg.addColorStop(.5,'rgba(200,225,255,.18)');gg.addColorStop(1,'rgba(226,240,255,.34)');CX.fillStyle=gg;CX.fill();CX.strokeStyle='rgba(248,250,252,.95)';CX.lineWidth=Math.max(1.5,S*.14);CX.stroke();
 const s0=[corner(24,9.6),corner(26,9.6),corner(26,11.1),corner(24,11.1)];CX.beginPath();s0.forEach((q,i)=>i?CX.lineTo(q[0],q[1]):CX.moveTo(q[0],q[1]));CX.closePath();CX.strokeStyle='#f97316';CX.lineWidth=Math.max(1.2,S*.11);CX.stroke();
 CX.strokeStyle='rgba(255,255,255,.35)';CX.lineWidth=1;CX.beginPath();CX.moveTo(c[3][0]+(c[2][0]-c[3][0])*.15,c[3][1]+(c[2][1]-c[3][1])*.15+S*.2);CX.lineTo(c[0][0]+(c[1][0]-c[0][0])*.45,c[0][1]+(c[1][1]-c[0][1])*.45-S*.2);CX.stroke();
 // shot clock on top
 const sc=P(bx0,25,13.3);CX.fillStyle='#0b0f19';CX.fillRect(sc[0]-S*1.1+sk*S,sc[1]-S*.9,S*2.2,S*1.2);if(feat('shotclk')&&G.shot<90){CX.fillStyle=G.shot<5?'#f87171':'#fbbf24';CX.font=`800 ${Math.max(8,Math.round(S*.85))}px system-ui`;CX.textAlign='center';CX.textBaseline='middle';CX.fillText(Math.ceil(Math.max(0,G.shot)),sc[0]+sk*S,sc[1]-S*.28)}
 // net: a mesh that narrows, with a swish when the ball goes through
 const swish=G.netT>0?G.netT:0,rows=[[RIM,.75],[RIM-.7,.6],[RIM-1.35,.48],[RIM-1.85-swish*.8,.4]],n=12,pts=rows.map(([z,r])=>[...Array(n).keys()].map(i=>{const a=i/n*Math.PI*2+(swish?Math.sin(performance.now()/60+i)*.12*swish:0);return P(hx+Math.cos(a)*r,25+Math.sin(a)*r,z)}));
 CX.strokeStyle='rgba(255,255,255,.8)';CX.lineWidth=Math.max(.8,S*.06);CX.beginPath();for(let k=0;k<rows.length-1;k++)for(let i=0;i<n;i++){const a=pts[k][i],b=pts[k+1][(i+1)%n],c2=pts[k+1][(i+n-1)%n];CX.moveTo(a[0]+sk*S,a[1]);CX.lineTo(b[0]+sk*S,b[1]);CX.moveTo(a[0]+sk*S,a[1]);CX.lineTo(c2[0]+sk*S,c2[1])}CX.stroke();
 // the rim
 const rim=arcPts(hx,25,.75,0,Math.PI*2,24).map(([x,y])=>{const q=P(x,y,RIM);return[q[0]+sk*S,q[1]]});CX.beginPath();rim.forEach((q,i)=>i?CX.lineTo(q[0],q[1]):CX.moveTo(q[0],q[1]));CX.strokeStyle='#c2410c';CX.lineWidth=Math.max(2.5,S*.26);CX.stroke();CX.strokeStyle='#fb923c';CX.lineWidth=Math.max(1,S*.1);CX.stroke()}
{const _dh=drawHoop;drawHoop=function(sd){if(!GFX()||!G||!R)return _dh(sd);drawHoop2(sd)}}
// ---------- the ball ----------
{const _db=drawBall;drawBall=function(){if(!GFX()||!G)return _db();const b=G.b;if(!b||b.st=='dead')return;let x=b.x,y=b.y,z=b.z||0;
  if(b.st=='held'){const h=b.h,face=Math.cos(h.fa)>=0?1:-1;x=h.x+face*.7;y=h.y+.25;z=h.act&&(h.act.k=='shot'||h.act.k=='gather'||h.act.k=='lay'||h.act.k=='dunk')?ftOf(h.p)+1.1+h.z:Math.abs(Math.sin(performance.now()/150))*2.6+.3+h.z*.3}
  if(feat('ballfx')&&b.st=='shot'){b.trail=b.trail||[];b.trail.push([b.x,b.y,b.z]);if(b.trail.length>14)b.trail.shift();b.trail.forEach(([tx,ty,tz],i)=>{const q=P(tx,ty,tz);CX.fillStyle=`rgba(251,146,60,${i/b.trail.length*.3})`;CX.beginPath();CX.arc(q[0],q[1],Math.max(2,S*.36)*i/b.trail.length,0,7);CX.fill()})}
  const [sx,sy]=P(x,y,0),[bx2,by2]=P(x,y,z),r=Math.max(3.5,S*.42),sh=clamp(1-z/16,.25,1);if(![sx,sy,bx2,by2].every(isFinite))return;
  const sg=CX.createRadialGradient(sx,sy,0,sx,sy,r*1.6);sg.addColorStop(0,`rgba(0,0,0,${.4*sh})`);sg.addColorStop(1,'rgba(0,0,0,0)');CX.fillStyle=sg;CX.beginPath();CX.ellipse(sx,sy,r*1.6,r*.6,0,0,7);CX.fill();
  const g=CX.createRadialGradient(bx2-r*.35,by2-r*.4,r*.1,bx2,by2,r);g.addColorStop(0,'#fdba74');g.addColorStop(.55,'#ea580c');g.addColorStop(1,'#9a3412');CX.fillStyle=g;CX.beginPath();CX.arc(bx2,by2,r,0,7);CX.fill();
  const rot=(b.st=='held'?performance.now()/200:performance.now()/90)%(Math.PI*2);CX.strokeStyle='rgba(40,12,4,.85)';CX.lineWidth=Math.max(.8,r*.12);CX.beginPath();CX.arc(bx2,by2,r,0,7);CX.stroke();
  CX.save();CX.beginPath();CX.arc(bx2,by2,r,0,7);CX.clip();CX.beginPath();CX.ellipse(bx2,by2,r,r*Math.abs(Math.cos(rot))*.9+.5,0,0,7);CX.moveTo(bx2-r,by2);CX.lineTo(bx2+r,by2);CX.moveTo(bx2+r*.55*Math.sin(rot),by2-r);CX.quadraticCurveTo(bx2+r*.9*Math.sin(rot),by2,bx2+r*.55*Math.sin(rot),by2+r);CX.stroke();CX.restore()}}
// ---------- players: soft shadows and reflections in the varnish ----------
{const _dp=drawPlayer;drawPlayer=function(e){if(!GFX()||!G||G.refl||!e||!e.p)return _dp(e);try{const [gx,gy]=P(e.x,e.y,0),w=S*1.3;if(!isFinite(gx)||!isFinite(gy))return _dp(e);const sg=CX.createRadialGradient(gx,gy,0,gx,gy,w*1.4);sg.addColorStop(0,'rgba(0,0,0,.32)');sg.addColorStop(1,'rgba(0,0,0,0)');CX.fillStyle=sg;CX.beginPath();CX.ellipse(gx,gy,w*1.4,w*.55,0,0,7);CX.fill();
  if(e.x>-1&&e.x<CW+1&&e.y>-1&&e.y<CH+1){const lab=OPT.labels,ctl=G.ctl,ctl2=G.ctl2,k=.42;G.refl=1;OPT.labels=0;G.ctl=null;G.ctl2=null;CX.save();CX.globalAlpha=.12;CX.transform(1,0,0,-k,0,gy*(1+k));try{_dp(e)}finally{CX.restore();G.refl=0;OPT.labels=lab;G.ctl=ctl;G.ctl2=ctl2}}}catch(x){}return _dp(e)}}
// ---------- lighting over everything ----------
{const _dh=drawHUD;drawHUD=function(){if(GFX()&&G&&isFinite(VW)&&VW>0){const v=CX.createRadialGradient(VW/2,VH*.55,Math.min(VW,VH)*.35,VW/2,VH*.55,Math.max(VW,VH)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');CX.fillStyle=v;CX.fillRect(0,0,VW,VH)}
  _dh();if(G&&G.meter&&feat('openmt')&&G.meter.e===G.ctl&&!G.rp){const e=G.meter.e,[gx,gy]=P(e.x,e.y,0),f=G.mwF||1,t=f>=1.3?'Wide open':f>=.95?'Open':f>=.65?'Contested':'Smothered';const h=ftOf(e.p)*S*HZ;CX.font='800 12px system-ui';CX.textAlign='left';CX.textBaseline='middle';const tx=gx+S*1.8+16,ty=gy-h*.55,tw=CX.measureText(t).width;CX.fillStyle='rgba(15,23,42,.8)';CX.fillRect(tx-4,ty-9,tw+8,18);CX.fillStyle=f>=.95?'#4ade80':f>=.65?'#fbbf24':'#f87171';CX.fillText(t,tx,ty)}}}
// ---------- smoother, slower movement ----------
{const _ts=topSpd;topSpd=function(e){const v=_ts(e);return feat('smooth')?v*.9:v}}
{const _ma=moveAll;moveAll=function(dt,slow){if(feat('smooth')&&G&&G.ent)G.ent.forEach(e=>{if(e.dash&&e.dash.t>0)return;const tx=e.tx||0,ty=e.ty||0;e.tx=e.vx+(tx-e.vx)*.5;e.ty=e.vy+(ty-e.vy)*.5});return _ma(dt,slow)}}
// ---------- smarter defense ----------
function closeAI(e,m,hx,dt){const ux=hx-m.x,uy=25-m.y,l=Math.hypot(ux,uy)||1;e.hu=.8;return seek(e,m.x+ux/l*2.6,m.y+uy/l*2.6,1.12)}
{const _d=defAI;defAI=function(e,dt){if(e.hu>0)e.hu-=dt;if(e.cd&&e.cd.jp>0)e.cd.jp-=dt;if(!feat('def2'))return _d(e,dt);const b=G.b,k=e.t,s=G.dir[opp(k)],hx=hoopX(s),m=e.man,iq=IQ(k);if(!m)return _d(e,dt);
  if(e===G.ctl&&G.ctlInput)return _d(e,dt);
  // a pass is on its way to my man: close out with a hand up
  if(feat('d2c')&&b.st=='pass'&&b.to===m&&rnd()<.6+.4*iq&&!(defMod(k).zone))return closeAI(e,m,hx,dt);
  _d(e,dt);if(e.bite>0)return;
  const hasB=b.st=='held'&&b.h===m;
  if(hasB&&feat('d2a')){// stay in front: aim at where the ball handler is going, not where he is
   const ax=m.x+m.vx*.12*(0.6+iq*.6),ay=m.y+m.vy*.12*(0.6+iq*.6),info=shotInfo(m,m.x,m.y),shooter=m.p.sk.thr>=68&&info.three,far=info.d>27;
   let d=(3.1-(e.p.sk.pd-60)*.02)*defMod(k).ball*(shooter?.86:1)*(far?1.3:1);const ux=hx-ax,uy=25-ay,l=Math.hypot(ux,uy)||1;seek(e,ax+ux/l*d,ay+uy/l*d,1.04);
   // a hand up when he is in range, and a jump to contest his shot
   if(info.d<26)e.hu=.3;if((m.act&&(m.act.k=='gather'||m.act.k=='shot'))||(G.meter&&G.meter.e===m)){if(dist(e,m)<5&&e.z<=0&&!(e.cd.jp>0)&&rnd()<.5+.5*iq){e.vz=8+e.p.sk.vert*.05;e.z=.01;e.act={k:'jump',t:0};e.cd.jp=1.3}}
   if(dist(e,m)<3&&rnd()<dt*.09*(e.p.sk.stl/65)*(.5+iq*.5)*defMod(k).stl)stealTry(e)}
  else if(feat('d2l')&&b.st=='held'&&b.h.t!==k){// one pass away: get into the passing lane
   const h=b.h,dball=Math.hypot(m.x-h.x,m.y-h.y);if(dball<24&&Math.hypot(m.x-hx,m.y-25)>8&&!(m.p.sk.thr>=66&&shotInfo(m,m.x,m.y).three)){const lx=m.x+(h.x-m.x)*.18,ly=m.y+(h.y-m.y)*.18,ux=hx-m.x,uy=25-m.y,l=Math.hypot(ux,uy)||1;const tx=lx+ux/l*2,ty=ly+uy/l*2;e.tx=e.tx*.7+((tx-e.x)*4)*.3;e.ty=e.ty*.7+((ty-e.y)*4)*.3;const v=topSpd(e),sp=Math.hypot(e.tx,e.ty);if(sp>v){e.tx*=v/sp;e.ty*=v/sp}}}}}
// a hand in the face makes a shot harder; the base chances go up a little so scoring stays where it was
{const _mp=makeProb;makeProb=function(e,info,q){const r=_mp(e,info,q);if(!feat('def2'))return r;let p=r.p;const D=r.cdE,cd=r.cd;if(feat('d2h')&&D&&cd<4.5&&(D.hu>0||D.z>.6))p-=(4.5-cd)*.012*(r.typ=='three'||r.typ=='mid'?1:.6);p+=r.typ=='three'||r.typ=='mid'?.008:.035;r.p=clamp(p,.03,.97);return r}}
// ---------- the shot meter: the green window depends on how open you are, and layups and dunks use it too ----------
function openF(e){const D=onT(opp(e.t));let cd=99,cdE=null;D.forEach(x=>{const k=dist(x,e);if(k<cd){cd=k;cdE=x}});let f=clamp(.42+(cd-2)*.17,.38,1.65);if(cdE&&cdE.z>.6&&cd<4.5)f*=.72;if(cdE&&cdE.hu>0&&cd<3.5)f*=.9;return f}
{const _mw=meterWin;meterWin=function(p,k){const w=_mw(p,k);return feat('openmt')&&G&&G.mwF&&k!='ft'?w*G.mwF:w}}
const LMT=.42;
{const _ms=meterStep;meterStep=function(dt){const m=G&&G.meter;if(m&&feat('openmt'))G.mwF=openF(m.e);else if(G&&G.ft&&G.ft.meter)G.mwF=1;if(m&&m.close){m.t+=dt*(MT/LMT-1)}return _ms(dt)}}
{const _ss=startShot;startShot=function(){const e=G&&G.ctl,b=G&&G.b;if(!e||!b||b.st!='held'||b.h!==e||G.phase!='live')return _ss();G.mwF=feat('openmt')?openF(e):1;const info=shotInfo(e,e.x,e.y);
  if(info.d<6&&feat('laymt')&&feat('meter')){const toward=(e.vx*(info.hx-e.x)+e.vy*(25-e.y))>0,dk=feat('alley')&&e.p.sk.dnk>=64&&info.d<4.6&&toward&&Math.hypot(e.vx,e.vy)>5;G.meter={e,t:0,k:dk?'dnk':'lay',close:1,dk};e.act={k:'gather',t:0};return}
  return _ss()}}
{const _rs=releaseShot;releaseShot=function(){const m=G&&G.meter;if(!m||!m.close)return _rs();G.meter=null;const e=m.e,v=m.t/MT,w=meterWin(e.p,m.k)*1.15,dv=Math.abs(v-.93);let q;
  if(dv<w){q=.07;say(m.dk?'Perfect dunk!':'Perfect layup!',1)}else if(dv<w*2.2)q=.02;else q=-Math.min(.24,(dv-w*2.2)*.8);G.lastMeter={v,q,t:1.2};
  if(G.b.st=='held'&&G.b.h===e&&G.phase=='live'){e.act={k:m.dk?'dunk':'lay',t:0};shoot(e,(m.dk?.02:.02*(e.p.sk.lay-60)/20)+q)}}}
// while timing a layup or dunk, keep going toward the rim
{const _uc=userControls;userControls=function(e,dt){if(G&&G.meter&&G.meter.close&&G.meter.e===e&&!G.auto){const hx=hoopX(G.dir[e.t]),dx=hx-e.x,dy=25-e.y,d=Math.hypot(dx,dy)||1,v=Math.max(4,Math.min(topSpd(e),Math.hypot(e.vx,e.vy)));e.tx=dx/d*v*.9;e.ty=dy/d*v*.9;return true}return _uc(e,dt)}}
{const _kh=keysHTML;keysHTML=function(){const h=_kh();if(!feat('laymt'))return h;return h.replace('Hold Space','Hold Space (layups and dunks too)')}}
