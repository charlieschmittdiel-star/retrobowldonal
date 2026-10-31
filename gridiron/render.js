'use strict';
// 2.5D renderer: the game still simulates on a flat top-down field (x 0-120 yards, y 0-53.3 yards).
// This file only changes how it is drawn: a tilted sideline camera, upright pixel players sorted
// front to back, shadows, and a real arc for the ball. It replaces draw() and aimT() from game.js.
const TOP=150,KY=6.85,FW=53.3,GZ=7;                 // far sideline screen y, px per yard of depth, px per yard of height
const scY=y=>.8+.2*clamp(y,0,FW)/FW;                  // far side is slightly narrower (mild perspective)
const camC=()=>camX+48;
function P2(x,y,z){const s=S*scY(y);return[W/2+(x-camC())*s,TOP+y*KY-(z||0)*GZ*scY(y)]}
function unproj(sx,sy){const y=clamp((sy-TOP)/KY,-2,FW+2);return[camC()+(sx-W/2)/(S*scY(y)),y]}
function aimT(){const a=P.aim,q=P.off[0];let x=(a.a[0]-a.c[0])/S*3,y=(a.a[1]-a.c[1])/KY*3;const m=Math.hypot(x,y),rg=34+(q.o-60)*.7;if(m>rg){x*=rg/m;y*=rg/m}return[clamp(q.x+x,1,119),clamp(q.y+y,1,52)]}
// ---------- static art, drawn once ----------
let STANDS=null;
function buildStands(){const c=document.createElement('canvas');c.width=1600;c.height=TOP;const g=c.getContext('2d');if(!g||!g.fillRect)return null;
 const sky=g.createLinearGradient?g.createLinearGradient(0,0,0,TOP):null;g.fillStyle=sky||'#0d1b2a';if(sky){sky.addColorStop(0,'#0b1626');sky.addColorStop(1,'#1d3348')}g.fillRect(0,0,1600,TOP);
 g.fillStyle='#2a2f3a';g.fillRect(0,22,1600,TOP-22);
 const cols=['#e5e7eb','#f87171','#60a5fa','#fbbf24','#a78bfa','#34d399','#f472b6','#94a3b8','#fb923c','#1f2937'];let seed=7;const rr=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let row=0;row<11;row++){const y=28+row*10;g.fillStyle=row%2?'#3b4252':'#343a48';g.fillRect(0,y+6,1600,3);
  for(let x=(row%2)*3;x<1600;x+=6){if(rr()<.12)continue;g.fillStyle=cols[rr()*cols.length|0];g.fillRect(x,y,4,4);g.fillStyle='#e8c39e';g.fillRect(x+1,y-2,2,2)}}
 g.fillStyle='#111827';g.fillRect(0,TOP-12,1600,12);g.fillStyle='#fbbf24';for(let x=0;x<1600;x+=160){g.fillRect(x+20,TOP-9,90,6)}
 for(let x=120;x<1600;x+=400){g.fillStyle='#cbd5e1';g.fillRect(x,0,4,24);g.fillStyle='#fff7cc';g.fillRect(x-14,0,32,8)}
 return c}
// ---------- field ----------
function quad(x0,x1,y0,y1,col){const a=P2(x0,y0),b=P2(x1,y0),c=P2(x1,y1),d=P2(x0,y1);X.fillStyle=col;X.beginPath();X.moveTo(a[0],a[1]);X.lineTo(b[0],b[1]);X.lineTo(c[0],c[1]);X.lineTo(d[0],d[1]);X.closePath();X.fill()}
function gline(x0,y0,x1,y1){const a=P2(x0,y0),b=P2(x1,y1);X.beginPath();X.moveTo(a[0],a[1]);X.lineTo(b[0],b[1]);X.stroke()}
function gpath(pts){if(!pts.length)return;X.beginPath();pts.forEach((p,i)=>{const s=P2(p[0],p[1],p[2]);i?X.lineTo(s[0],s[1]):X.moveTo(s[0],s[1])});X.stroke()}
function gring(x,y,r,col,lw){const s=P2(x,y),k=scY(y);X.strokeStyle=col;X.lineWidth=lw;X.beginPath();X.ellipse(s[0],s[1],r*S*k,r*KY,0,0,7);X.stroke()}
function drawField(){
 if(STANDS===null)STANDS=buildStands()||0;
 if(STANDS)X.drawImage(STANDS,-((camX*S*.8)%400)-200,0);else{X.fillStyle='#1d3348';X.fillRect(0,0,W,TOP)}
 X.fillStyle='#1f6b2a';X.fillRect(0,TOP-6,W,H-TOP+6);
 for(let x=10;x<110;x+=5)quad(x,x+5,0,FW,typeof fieldCol=='function'?fieldCol(x):((x/5)%2?'#2f8a3a':'#2a7f35'));
 const ezT=G.opp?G.opp.n.split(' ').pop().toUpperCase().slice(0,10):'AWAY',ezU=R&&R.lg?R.lg.t[0].n.split(' ').pop().toUpperCase().slice(0,10):'HOME';
 [[0,TEAM.U.ez||'#1e4e8c',ezU],[110,TEAM.C.ez||'#8a1b2a',ezT]].forEach(([x0,col,txt])=>{quad(x0,x0+10,0,FW,col);const m=P2(x0+5,FW/2);X.save();X.translate(m[0],m[1]);X.rotate(x0?Math.PI/2:-Math.PI/2);X.scale(1,.75);X.fillStyle='#ffffffcc';X.font='bold 30px "Trebuchet MS",sans-serif';X.textAlign='center';X.fillText(txt,0,10);X.restore()});
 X.strokeStyle='#ffffffd0';X.lineWidth=2;gline(0,0,120,0);gline(0,FW,120,FW);
 for(let x=10;x<=110;x+=5){X.lineWidth=x%10==0?2:1.2;X.strokeStyle='#ffffffb0';gline(x,0,x,FW)}
 X.strokeStyle='#ffffff90';X.lineWidth=1;for(let x=11;x<110;x++){if(x%5==0)continue;[1,FW/2-3.1,FW/2+3.1,FW-1].forEach(y=>gline(x,y-.4,x,y+.4))}
 X.fillStyle='#ffffffb8';X.textAlign='center';
 for(let x=20;x<=100;x+=10){const n=x<=60?x-10:110-x;[[8,.75],[FW-8,1]].forEach(([y,k])=>{const s=P2(x,y);X.font=`bold ${Math.round(22*k)}px "Trebuchet MS",sans-serif`;X.save();X.translate(s[0],s[1]);X.scale(1,.7);X.fillText(n,0,8);X.restore()})}
 X.fillStyle='#14532d';X.fillRect(0,P2(0,FW)[1]+2,W,H)}
// ---------- players ----------
const TEAM={U:{j:'#2563eb',j2:'#1e3a8a',h:'#1d4ed8',pt:'#e5e7eb',st:'#facc15'},C:{j:'#dc2626',j2:'#7f1d1d',h:'#b91c1c',pt:'#f5f5f4',st:'#111827'}};
function sprite(p,t){const s=P2(p.x,p.y),k=scY(p.y),u=2.6*k,c=TEAM[p.t]||TEAM.C,f=Math.cos(p.fa)>=0?1:-1,line=(p.s=='O'&&p.i>5)||(p.s=='D'&&p.i<4);
 const sp=Math.hypot(p.vx||0,p.vy||0),ph=sp>.5?Math.sin(t*14+p.i)*1:0,bw=line?6:5,x0=Math.round(s[0]-bw*u/2),yb=Math.round(s[1]);
 X.fillStyle='rgba(0,0,0,.32)';X.beginPath();X.ellipse(s[0],s[1],9*k,3.2*k,0,0,7);X.fill();
 const R=(dx,dy,w,h,col)=>{X.fillStyle=col;X.fillRect(x0+dx*u,yb-(dy+h)*u,w*u,h*u)};
 const st=p.stun>0||p.bite>0;
 R(1,0+(ph>0?1:0),1,3,'#111');R(bw-2,0+(ph<0?1:0),1,3,'#111');                       // shoes / legs
 R(1,1+(ph>0?1:0),Math.max(1,bw/2-1)|0,3,c.pt);R(bw/2|0,1+(ph<0?1:0),bw-1-(bw/2|0),3,c.pt);
 R(0,4,bw,5,c.j);R(0,7,bw,1,c.j2);R(0,4,1,5,c.j2);                                    // jersey with stripe
 R(f>0?bw:-1,5+(ph>0?1:0),1,3,c.j);R(f>0?-1:bw,5+(ph<0?1:0),1,3,c.j);                // arms
 R(1,9,bw-2,3,c.h);R(f>0?bw-2:1,10,1,1,'#e5e7eb');R(f>0?bw-1:0,10,1,1,'#9ca3af');     // helmet + facemask on the facing side
 R(1,12,bw-2,1,c.st);                                                                 // helmet stripe
 if(st){X.fillStyle='#fde047';X.fillRect(s[0]-4*k,yb-15*u,2,2);X.fillRect(s[0]+3*k,yb-16*u,2,2)}
 return yb-14*u}
// ---------- main draw ----------
function draw(){const L=P.L,d=G.dir,b=P.b,now=performance.now()/1000;ragTick();camX+=(clamp((typeof camTgt=='function'?camTgt(b,L):(G.phase=='play'||G.phase=='kick'?b.x:L))-48,-2,26)-camX)*(typeof camK=='function'?camK():.1);
 {const ks=typeof KS=='number'?KS:1,sh=shakeT>0?shakeA*shakeT/.28:0;X.setTransform(ks,0,0,ks,(rnd()-.5)*sh*ks,(rnd()-.5)*sh*ks)}X.imageSmoothingEnabled=false;X.clearRect(0,0,W,H);drawField();
 if(!P.kr&&!G.rp){X.lineWidth=3;X.strokeStyle='#4aa3ff';gline(L,0,L,FW);if(!P.kk){X.strokeStyle='#ffd84d';gline(L+G.ytg*d,0,L+G.ytg*d,FW)}}
 if(G.poss=='U'&&G.phase=='pre'){P.off.slice(1).forEach((p,k)=>{if(!p.route.length)return;X.strokeStyle=sel==k+1?'#ffd84d':'#ffffffb0';X.lineWidth=2;X.setLineDash([6,4]);const s0=p.mo&&p.mo.length?p.mo[p.mo.length-1]:[p.sx,p.sy];gpath([s0,...p.route]);X.setLineDash([])});
  P.off.forEach(p=>{if(p.mo&&p.mo.length){X.strokeStyle='#ff9f43';X.lineWidth=2;X.setLineDash([2,4]);gpath([[p.sx,p.sy],...p.mo]);X.setLineDash([])}})}
 if((b.st=='qb'||b.st=='pre')&&!P.run&&(G.phase=='play'||G.phase=='pre'||G.phase=='motion')){const q=P.off[0],hf=coneHalf(q),rad=Math.min(34+(q.sk.str-60)*.7,45)*.8,pts=[[q.x,q.y]];
  for(let i=0;i<=16;i++){const a=q.fa-hf+2*hf*i/16;pts.push([clamp(q.x+Math.cos(a)*rad,0,120),clamp(q.y+Math.sin(a)*rad,0,FW)])}
  X.fillStyle='rgba(255,255,255,.12)';X.strokeStyle='rgba(255,255,255,.55)';X.lineWidth=1.5;X.beginPath();pts.forEach((p,i)=>{const s=P2(p[0],p[1]);i?X.lineTo(s[0],s[1]):X.moveTo(s[0],s[1])});X.closePath();X.fill();X.stroke()}
 const ctl=CAR()?careerCtl():G.poss=='U'?(b.st=='carry'?b.c:(b.st=='qb'||b.st=='pre'?P.off[0]:null)):cd;
 if(ctl){gring(ctl.x,ctl.y,1.6,'#ffd84d',3);gring(ctl.x,ctl.y,1.95,'#ffffff',1.5)}
 if(sel>0&&P.off[sel])gring(P.off[sel].x,P.off[sel].y,1.5,'#ffd84d',2);
 if(P.look&&G.poss!='U'&&b.st=='qb'){const q=P.off[0],l=P.look;X.strokeStyle='#ff4d4d';X.lineWidth=2;X.setLineDash([3,5]);gline(q.x,q.y,l.x,l.y);X.setLineDash([]);gring(l.x,l.y,1.4,'#ff4d4d',2)}
 // ball height
 let bz=0;if(b.st=='air'){const f=clamp(b.t/b.T,0,1),pk=Math.min(9,Math.hypot(b.tx-b.sx,b.ty-b.sy)*.18)*(b.arc||1);bz=1.2+4*pk*f*(1-f)}else if(b.st=='kick'||b.st=='cel'||b.st=='loose')bz=b.z||0;else if(b.st=='tip')bz=.6+Math.sin(Math.PI*Math.min(1,b.tt/b.T2))*2.4;else if(b.st=='qb'||b.st=='carry')bz=1.1;
 if(P.aim){const t=aimT(),q=P.off[0],dd=Math.hypot(t[0]-q.x,t[1]-q.y),pk=Math.min(9,dd*.18)*(G.tt=='lob'&&typeof feat=='function'&&feat('throwT')?1.9:G.tt=='bul'&&typeof feat=='function'&&feat('throwT')?.45:1),n=Math.max(3,dd/1.5|0);X.fillStyle='#fff';
  for(let i=1;i<=n;i++){const f=i/n,s=P2(q.x+(t[0]-q.x)*f,q.y+(t[1]-q.y)*f,1.2+4*pk*f*(1-f));X.beginPath();X.arc(s[0],s[1],2.3,0,7);X.fill()}
  gring(t[0],t[1],.9,'#ffffff',2)}
 // everyone, back to front, ball included
 const all=P.off.concat(P.def).map(p=>[p.y+(p.fall&&p.fall.wrap?.01:0),p]);all.push([b.y+.01,'ball']);all.sort((a,c)=>a[0]-c[0]);
 const heads=new Map();
 all.forEach(([,p])=>{if(p==='ball'){if(b.st=='dead'&&G.phase!='post')return;const g=P2(b.x,b.y),s=P2(b.x,b.y,bz),k=scY(b.y);
   if(bz>1.3){X.fillStyle='rgba(0,0,0,.35)';X.beginPath();X.ellipse(g[0],g[1],5*k,2*k,0,0,7);X.fill()}
   if(b.st=='qb'||b.st=='carry')return;X.fillStyle='#5a3312';X.beginPath();X.ellipse(s[0],s[1],6.5*k,4.2*k,0,0,7);X.fill();X.fillStyle='#8b5a2b';X.beginPath();X.ellipse(s[0],s[1],5.3*k,3.2*k,0,0,7);X.fill();X.fillStyle='#fff';X.fillRect(s[0]-2,s[1]-.6,4,1.2);return}
  if(p.fall&&fallProg(p)>0)return drawFallen(p,now);heads.set(p,sprite(p,now))});
 DUST.forEach(q=>{const s=P2(q.x,q.y),a=1-q.t/q.life,k=scY(q.y);X.fillStyle=`rgba(214,196,150,${(a*.55).toFixed(2)})`;X.beginPath();X.ellipse(s[0],s[1]-2*k,(q.r+q.t*1.4)*S*k,(q.r+q.t*1.4)*KY*.55,0,0,7);X.fill()});
 // labels above heads: line moves, stamina
 X.textAlign='center';X.font='bold 9px sans-serif';
 heads.forEach((hy,p)=>{const s=P2(p.x,p.y);if(p.ml>0&&G.phase=='play'){X.fillStyle='#ffd84d';X.fillText(p.mv,s[0],hy-4)}if(b.st=='carry'&&b.c===p){X.fillStyle='#7c4a1e';X.beginPath();X.ellipse(s[0]+(Math.cos(p.fa)>=0?6:-6)*scY(p.y),hy+20*scY(p.y),4.5,3,0,0,7);X.fill()}});
 [ctl,b.st=='carry'?b.c:null].forEach((p,i)=>{if(!p||(i==1&&p==ctl)||!heads.has(p))return;const s=P2(p.x,p.y),hy=heads.get(p),v=(p.stm==null?100:p.stm)/100;X.fillStyle='#000a';X.fillRect(s[0]-14,hy-14,28,5);X.fillStyle=v>.3?'#4ade80':v>.1?'#fbbf24':'#ef4444';X.fillRect(s[0]-13,hy-13,26*v,3)});
 if(P.look&&G.poss!='U'&&b.st=='qb'){const s=P2(P.look.x,P.look.y);X.fillStyle='#ff4d4d';X.fillText('QB EYES',s[0],s[1]-30)}
 if(ctl&&G.phase=='play'){const v=(ctl.stm==null?100:ctl.stm)/100;X.fillStyle='#000a';X.fillRect(W-170,6,160,20);X.fillStyle=v>.3?'#4ade80':v>.1?'#fbbf24':'#ef4444';X.fillRect(W-168,8,156*v,16);X.fillStyle='#fff';X.font='bold 11px sans-serif';X.textAlign='right';X.fillText('STAMINA',W-14,20)}
 X.textAlign='left';
 if(G.poss!='U'&&cd){const bs=$('dctl').children;if(bs[3]){bs[1].style.opacity=cd.hk>0?.4:1;bs[2].style.opacity=cd.hcool>0?.4:1;bs[3].style.opacity=(cd.pr||P.t>1.6||P.b.st!='qb')?.4:1;if(bs[4])bs[4].style.opacity=cd.swk>0?.4:1}}
 if(typeof sbTick=='function')sbTick();else{$('hud').textContent=hudText();$('msg').textContent=G.msg}}

// A player going down in a tackle: the sprite tips over around his feet toward the direction of the hit
// (sideways falls rotate, falls toward or away from the camera flatten), then lies on the turf.
function drawFallen(p,now){const f=p.fall,pr=Math.min(1.06,fallProg(p)),s=P2(p.x,p.y),e=P2(p.x+f.vx*.2+.0001,p.y+f.vy*.2);let ex=e[0]-s[0],ey=e[1]-s[1];
 if(Math.hypot(ex,ey)<.5){ex=Math.cos(p.fa);ey=0}const tot=Math.abs(ex)+Math.abs(ey)||1,side=Math.abs(ex)/tot,depth=Math.abs(ey)/tot;
 const rot=Math.sign(ex||1)*pr*Math.PI/2*.94*(.35+.65*side),sq=1-Math.min(.62,pr*.62*depth);
 X.save();X.translate(s[0],s[1]);X.rotate(rot);X.scale(1,sq);X.translate(-s[0],-s[1]);const st=p.stun;p.stun=0;sprite(p,now);p.stun=st;X.restore()}
