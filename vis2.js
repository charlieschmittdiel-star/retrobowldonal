'use strict';
// Stadium and field visuals: a living crowd (jumping on big plays, doing the wave, camera flashes), players, coaches
// and a TV camera on the sideline, a midfield logo, the chain gang and down marker, a first-down line that lights up,
// ball trails, nets behind the goal posts, kicks that doink off the upright, puddles and splashes, snow that piles up
// and shows footprints, and wind flags. Each group has its own switch on the Game features page.
{const add=[['Presentation','crowd2','Living crowd and sidelines','Fans jump on big plays and do the wave; players, coaches and a TV camera line the sideline.'],
 ['Presentation','field3','Field details','A midfield logo, the chain gang and down marker, and a first-down line that lights up.'],
 ['Presentation','ballfx','Ball and kick effects','Ball trails, nets behind the goal posts, and kicks that can doink off the upright.'],
 ['Presentation','wx2','Weather details','Puddles and splashes in the rain, snow that piles up and shows footprints, wind flags on the goal posts.']];
 let i=-1;FEATS.forEach((f,j)=>{if(f[0]=='Presentation')i=j});FEATS.splice(i<0?FEATS.length:i+1,0,...add.filter(a=>!FEATS.some(f=>f[1]==a[1])))}
const XV={ex:{U:0,C:0},wave:null,waveCd:25,bt:[],btP:null,fd:0,fdP:null,rip:[],spl:[],fp:[],cam:60,sl:null,bh:0,dnk:null,dt:0,last:0,hd:[],pk:'',sk:''};
const vOth=t=>t=='U'?'C':'U',vHome=()=>G&&G.home=='C'?'C':'U';
function vHype(t,v){if(t=='U'||t=='C')XV.ex[t]=Math.max(XV.ex[t]||0,v)}
function vSeed(n){let s=Math.abs(Math.round(n))%2147483646+1;return()=>(s=(s*16807)%2147483647)/2147483647}
function vBz(b){if(b.st=='air'){const f=clamp(b.t/b.T,0,1),pk=Math.min(9,Math.hypot(b.tx-b.sx,b.ty-b.sy)*.18)*(b.arc||1);return 1.2+4*pk*f*(1-f)}return b.z||0}
// ---------- the crowd ----------
let FANS=null;
function fansBuild(){const cols=['#e5e7eb','#f87171','#60a5fa','#fbbf24','#a78bfa','#34d399','#f472b6','#94a3b8','#fb923c','#1f2937'];let seed=7;const rr=()=>(seed=(seed*16807)%2147483647)/2147483647,g=cols.map(()=>[]);
 for(let row=0;row<11;row++){const y=28+row*10;for(let x=(row%2)*3;x<1600;x+=6){if(rr()<.12)continue;const c=rr()*cols.length|0;g[c].push(x,y,row)}}FANS={cols,g}}
function vCrowd(now){const hm=vHome(),e=Math.min(1,(XV.ex[hm]||0)+.3*(XV.ex[vOth(hm)]||0)),w=XV.wave;if(e<.04&&!w)return;if(!FANS)fansBuild();
 const ox=-((camX*S*.8)%400)-200,wx=w?w.t/w.d*1900-150:-9999,hd=XV.hd;hd.length=0;const SF=typeof stadFans=='function'?stadFans():null,FS=SF||FANS;
 if(SF)SF.bg(ox);else{X.fillStyle='#2a2f3a';X.fillRect(0,22,W,TOP-34);for(let row=0;row<11;row++){X.fillStyle=row%2?'#3b4252':'#343a48';X.fillRect(0,34+row*10,W,3)}}
 FS.g.forEach((grp,ci)=>{X.fillStyle=FS.cols[ci];for(let i=0;i<grp.length;i+=3){const fx=grp[i],sx=ox+fx;if(sx<-6||sx>W+6)continue;const row=grp[i+2];let o=0,arm=0;
  if(e>.04){o=-Math.abs(Math.sin(now*(7+fx%5)+fx*.37+row))*3.2*e;arm=e>.45&&(fx*7+row)%3!=0?1:0}
  if(w){const dx=Math.abs(fx-wx);if(dx<46){const k=1-dx/46;o=Math.min(o,-k*4.5);if(k>.3)arm=1}}
  const y=grp[i+1]+o;X.fillRect(sx,y,4,4);hd.push(sx,y,arm)}});
 X.fillStyle='#e8c39e';for(let i=0;i<hd.length;i+=3){X.fillRect(hd[i]+1,hd[i+1]-2,2,2);if(hd[i+2]){X.fillRect(hd[i]-1,hd[i+1]-5,1,4);X.fillRect(hd[i]+4,hd[i+1]-5,1,4)}}}
// ---------- players, coaches and a camera on the far sideline ----------
const VSKIN=['#e8c39e','#c68e5f','#8d5a3b','#f1d2b4','#a86f48'];
function slBuild(){const r=vSeed(11),a=[];[['U',33,57],['C',63,87]].forEach(([t,x0,x1])=>{for(let i=0;i<12;i++)a.push({t,k:'pl',x:x0+r()*(x1-x0),y:-1.9-r()*2.4,ph:r()*7,hel:r()<.55,sk:VSKIN[r()*5|0]});
  a.push({t,k:'co',x:(x0+x1)/2,y:-1.35,ph:r()*7,bx:(x0+x1)/2,sk:VSKIN[r()*5|0]})});a.push({t:'',k:'cam',x:60,y:-1.05,ph:0,sk:VSKIN[1]});a.sort((p,q)=>p.y-q.y);return a}
function vFig(o,now,lift,arms){const s=P2(o.x,o.y),u=1.55,x=Math.round(s[0]),y=Math.round(s[1]-lift),T=TEAM[o.t]||{j:'#334155',j2:'#1e293b',h:'#111827',pt:'#cbd5e1',num:'#fff'},R_=(a,b,w,h,c)=>{X.fillStyle=c;X.fillRect(x+a*u,y+b*u,w*u,h*u)};
 if(o.k=='pl'){R_(-1.8,-4.6,1.4,4,T.pt);R_(.4,-4.6,1.4,4,T.pt);R_(-1.9,-.8,1.6,.8,'#111');R_(.3,-.8,1.6,.8,'#111');R_(-2,-9.6,4,5.2,T.j);R_(-2.7,-9.6,5.4,1.7,T.j);R_(-.5,-8,1,1.8,T.num||'#fff');
  if(arms==='sad'){R_(-3,-12.2,1.1,3,T.j);R_(2,-12.2,1.1,3,T.j);R_(-2.2,-13,1.1,.9,o.sk);R_(1.2,-13,1.1,.9,o.sk)}else if(arms){R_(-3.6,-13.4,1.1,4.2,T.j);R_(2.5,-13.4,1.1,4.2,T.j);R_(-3.6,-14.2,1.1,.9,o.sk);R_(2.5,-14.2,1.1,.9,o.sk)}else{R_(-3.2,-9.2,1.1,4,T.j);R_(2.1,-9.2,1.1,4,T.j);R_(-3.2,-5.3,1.1,.9,o.sk);R_(2.1,-5.3,1.1,.9,o.sk)}
  if(o.hel){R_(-1.4,-12.6,2.8,3,T.h);R_(-1.2,-10.2,2.4,.5,'#9ca3af')}else{R_(-1.1,-12.3,2.2,2.7,o.sk);R_(-1.1,-12.5,2.2,.8,'#2b1d14');if(!arms)R_(2.1,-6.2,2,1.8,T.h)}}
 else if(o.k=='co'){R_(-1.7,-4.6,1.4,4.2,'#c8b48a');R_(.3,-4.6,1.4,4.2,'#c8b48a');R_(-1.8,-.6,1.6,.6,'#111');R_(.2,-.6,1.6,.6,'#111');R_(-2,-9.4,4,5,T.j2||T.j);
  if(arms==='sad'){R_(-2.8,-12.4,1.1,3.4,T.j2||T.j);R_(1.8,-12.4,1.1,3.4,T.j2||T.j);R_(-2,-13.2,1.1,.9,o.sk);R_(1,-13.2,1.1,.9,o.sk)}else{if(arms){R_(-3.2,-13,1.1,4,T.j2||T.j);R_(-3.2,-13.8,1.1,.9,o.sk)}else{R_(-3.1,-9,1.1,3.6,T.j2||T.j);R_(-3.4,-6,1.8,2.2,'#f8fafc')}R_(2.1,-9,1.1,3.6,T.j2||T.j)}
  R_(-1.1,-12,2.2,2.6,o.sk);R_(-1.3,-12.6,2.6,1,T.h||'#111');R_(1.2,-12,1.3,.4,T.h||'#111');R_(-1.5,-11.6,.4,1.8,'#111')}
 else if(o.k=='cam'){R_(-1.7,-4.6,1.4,4.2,'#1f2937');R_(.3,-4.6,1.4,4.2,'#1f2937');R_(-2,-9.4,4,5,'#374151');R_(-1.1,-12,2.2,2.6,o.sk);R_(-1.2,-12.5,2.4,.9,'#111');
  const fx=o.fx||1;R_(fx>0?-1.6:-2.6,-11.4,4.2,2.2,'#111827');R_(fx>0?2.6:-3.4,-11,.9,1.4,'#475569');R_(fx>0?-1.4:1.9,-11.2,.5,.5,'#ef4444');R_(-2.8,-9,1,3,'#374151')}
 else if(o.k=='crew'){R_(-1.6,-4.4,1.3,4,'#111');R_(.3,-4.4,1.3,4,'#111');for(let i=0;i<5;i++)R_(-1.9,-9.2+i,3.8,1,i%2?'#111':'#f8fafc');R_(-1,-11.8,2,2.6,o.sk);R_(-1.2,-12.2,2.4,.8,'#111');R_(1.9,-8.8,1,3.4,'#111')}}
function vSideline(now){if(!XV.sl)XV.sl=slBuild();const b=P.b,dt=XV.dt;
 XV.sl.forEach(o=>{let lift=0,arms=0;const e=o.t?XV.ex[o.t]||0:0;
  const oe=o.t?XV.ex[o.t=='U'?'C':'U']||0:0,sad=typeof feat=='function'&&feat('side2')&&oe>.4&&e<.2;
  if(o.k=='pl'){if(e>.2){lift=Math.abs(Math.sin(now*8+o.ph))*6*e;arms=e>.4}else if(sad){arms=(o.ph*10|0)%3?'sad':0;lift=0}else lift=Math.max(0,Math.sin(now*1.3+o.ph))*.6}
  else if(o.k=='co'){o.x=o.bx+Math.sin(now*.35+o.ph)*(sad?.6:3);arms=sad?'sad':e>.35&&Math.sin(now*6+o.ph)>0}
  else if(o.k=='cam'){const tx=clamp(b?b.x:60,14,106),dx=tx-o.x;o.x+=clamp(dx,-7*dt,7*dt);o.fx=dx>.5?1:dx<-.5?-1:(o.fx||1)}
  vFig(o,now,lift,arms)})}
// ---------- field details: midfield logo, chains, first-down glow ----------
function vLogo(){const hi=G.home=='C'&&G.opp?G.opp.i:0,t=R.lg&&R.lg.t[hi];if(!t)return;const c=teamCol(hi),m=P2(60,FW/2),k=scY(FW/2),rx=6.2*S*k,ry=6.2*KY;
 X.save();X.globalAlpha=.88;X.fillStyle=c[1];X.beginPath();X.ellipse(m[0],m[1],rx,ry,0,0,7);X.fill();X.globalAlpha=1;X.strokeStyle=c[2];X.lineWidth=3;X.beginPath();X.ellipse(m[0],m[1],rx*.86,ry*.86,0,0,7);X.stroke();
 X.fillStyle=c[0];X.beginPath();X.ellipse(m[0],m[1],rx*.74,ry*.74,0,0,7);X.fill();X.translate(m[0],m[1]);const ab=tAbbr(t.n);let fs=Math.round(rx*.5);X.font=`900 ${fs}px "Trebuchet MS",sans-serif`;
 const tw=X.measureText?X.measureText(ab).width||ab.length*fs*.6:ab.length*fs*.6,sc=Math.min(1,rx*1.25/tw);X.scale(sc,.62);X.textAlign='center';X.fillStyle='#000a';X.fillText(ab,2,fs*.36+2);X.fillStyle='#fff';X.fillText(ab,0,fs*.36);X.restore();X.textAlign='left';
 X.strokeStyle='#ffffffb0';X.lineWidth=2;gline(60,0,60,FW)}
const vShow=()=>P&&!P.kr&&!P.kk&&!G.rp&&(G.phase=='pre'||G.phase=='motion'||G.phase=='play'||G.phase=='post');
function vGlow(now){if(!vShow())return;const d=G.dir,x1=P.L+G.ytg*d,b=P.b,c=b.st=='carry'?b.c:null;let a=.1+.05*Math.sin(now*3);
 if(G.phase=='play'&&c&&P.off.indexOf(c)>=0){const n=(x1-c.x)*d;if(n<5)a=Math.max(a,.12+.4*(1-Math.max(0,n)/5));if(n<=0&&XV.fdP!==P){XV.fdP=P;XV.fd=1;vHype(G.poss,.35)}}
 if(XV.fd>0)a=Math.max(a,.25+.6*XV.fd);quad(x1-1,x1+1,0,FW,`rgba(255,216,77,${(a*.45).toFixed(3)})`);quad(x1-.38,x1+.38,0,FW,`rgba(255,240,170,${Math.min(.9,a).toFixed(3)})`)}
function vChains(now){if(!vShow())return;const d=G.dir,L=P.L,x1=L+G.ytg*d,gl=d>0?110:10,y=-.75,crew=XV.crew||(XV.crew=[0,1,2].map(i=>({k:'crew',t:'',x:0,y:y-.3,sk:VSKIN[i*2%5]})));
 const pole=(x,top)=>{const g=P2(x,y),t=P2(x,y,2.5);X.strokeStyle='#1f2937';X.lineWidth=2;X.beginPath();X.moveTo(g[0],g[1]);X.lineTo(t[0],t[1]);X.stroke();top(t)};
 const stick=t=>{X.fillStyle='#f97316';X.fillRect(t[0]-3,t[1]-7,6,8);X.fillStyle='#111';X.fillRect(t[0]-3,t[1]-3,6,1)};
 const sticks=(x1-gl)*d<0&&G.ytg<=12;let xs=[L];if(sticks)xs=[x1-10*d,x1,L];xs.forEach((x,i)=>{crew[i].x=x-.45;vFig(crew[i],now,0,0)});
 if(sticks){const x0=x1-10*d,a=P2(x0,y,1.7),c=P2(x1,y,1.7);X.strokeStyle='#d1d5db';X.lineWidth=1;X.beginPath();X.moveTo(a[0],a[1]);X.quadraticCurveTo((a[0]+c[0])/2,(a[1]+c[1])/2+6,c[0],c[1]);X.stroke();pole(x0,stick);pole(x1,stick)}
 pole(L,t=>{X.fillStyle='#f97316';X.fillRect(t[0]-6,t[1]-12,12,12);X.fillStyle='#111';X.font='bold 10px sans-serif';X.textAlign='center';X.fillText(String(Math.min(4,G.down||1)),t[0],t[1]-2);X.textAlign='left'})}
// ---------- ball trails, the net, doinks ----------
function vTrail(){const b=P.b,kk=P.kk,on=b.st=='air'||(b.st=='kick'&&kk&&(kk.st=='fly'||kk.hit||kk.net));
 if(!on||XV.btP!==P){XV.bt.length=0;XV.btP=P;if(!on)return}
 const z=vBz(b),l=XV.bt[XV.bt.length-1];if(!l||Math.hypot(l[0]-b.x,l[1]-b.y,l[2]-z)>.15)XV.bt.push([b.x,b.y,z]);if(XV.bt.length>16)XV.bt.shift();const n=XV.bt.length;if(n<2)return;
 X.lineCap='round';for(let i=1;i<n;i++){const a=P2(XV.bt[i-1][0],XV.bt[i-1][1],XV.bt[i-1][2]),c=P2(XV.bt[i][0],XV.bt[i][1],XV.bt[i][2]),f=i/n;X.strokeStyle=`rgba(255,255,255,${(f*.42).toFixed(3)})`;X.lineWidth=1+f*3;X.beginPath();X.moveTo(a[0],a[1]);X.lineTo(c[0],c[1]);X.stroke()}X.lineCap='butt'}
function vNet(){const kk=P.kk;if(!kk||kk.kind=='punt'||!(G.phase=='kick'||G.phase=='post'))return;const d=G.dir,px=(d>0?120:0)+d*1.1,c=[[20.6,3.4],[32.4,3.4],[32.4,12.4],[20.6,12.4]].map(q=>P2(px,q[0],q[1]));
 X.fillStyle='rgba(255,255,255,.07)';X.beginPath();c.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.closePath();X.fill();X.strokeStyle='rgba(255,255,255,.3)';X.lineWidth=1;
 for(let y=20.6;y<=32.41;y+=1.18)gline3(px,y,3.4,px,y,12.4);for(let z=3.4;z<=12.41;z+=1.12)gline3(px,20.6,z,px,32.4,z);X.strokeStyle='#64748b';X.lineWidth=2;gline3(px,20.6,0,px,20.6,12.6);gline3(px,32.4,0,px,32.4,12.6)}
function vKick(dt){const kk=P&&P.kk,b=P&&P.b;if(!kk||kk.kind=='punt'||!feat('ballfx'))return;const d=G.dir,px=d>0?120:0;
 if(kk.hit){const h=kk.hit;h.x+=h.vx*dt;h.y+=h.vy*dt;h.vz-=10.7*dt;h.z+=h.vz*dt;if(h.z<0){h.z=0;h.vz=-h.vz*.35;h.vx*=.6;h.vy*=.6}b.x=h.x;b.y=h.y;b.z=h.z;return}
 if(kk.net){const n=kk.net;n.v+=dt*6;n.z=Math.max(3.6,n.z-n.v*dt);b.x=n.x;b.y=n.y;b.z=n.z;return}
 if(kk.st!='fly'&&kk.st!='done')return;const cross=(b.x-px)*d;
 if(kk.dk&&cross>=0){const sg=Math.sign(kk.lat)||1,o=kk.dk=='out';kk.hit={x:px,y:26.5+sg*3.08,z:b.z,vx:o?-d*7:d*5,vy:o?sg*3:-sg*2.5,vz:o?2:-1};b.x=px;b.y=kk.hit.y;XV.dnk={x:px,y:kk.hit.y,z:b.z,t:1.2};shakeT=.18;shakeA=3;if(typeof sfx=='function')sfx('doink');return}
 if(!kk.dk&&cross>=1.1&&b.z>3.4&&b.z<12.4&&Math.abs(b.y-26.5)<5.9){kk.net={x:px+d*1.1,y:b.y,z:b.z,v:1};b.x=kk.net.x}}
{const _kl=kLaunch;kLaunch=function(){_kl();try{const kk=P.kk;kk.dk=null;if(!feat('ballfx')||kk.kind=='punt'||kk.blk)return;const r=kk.fd/kk.C,zg=kk.C>=kk.fd?4*kk.h*r*(1-r):-1,yg=Math.abs(kk.lat);
 if(zg>3.33&&yg>=2.9&&yg<3.3){kk.dk=rnd()<.5?'in':'out';kk.lat=(Math.sign(kk.lat)||1)*(kk.dk=='in'?2.86:3.34)}}catch(e){console.error(e)}}}
{const _ke=kEnd;kEnd=function(){const kk=P&&P.kk,u=G.poss;_ke();try{if(!kk||kk.kind=='punt')return;
 if(kk.dk){const fix=s=>kk.dk=='out'?s.replace(/ Wide (left|right)\./,' Doinks off the upright!'):s.replace(/(GOOD from \d+ yards!|Extra point is good\.)/,'$1 Off the upright... and in!');G.msg=fix(G.msg);if(G.pbp&&G.pbp.length)G.pbp[G.pbp.length-1]=fix(G.pbp[G.pbp.length-1])}
 const good=/GOOD|is good/.test(G.msg);vHype(good?u:vOth(u),good?.8:.5)}catch(e){console.error(e)}}}
{const _kt=kickTick;kickTick=function(dt){_kt(dt);try{vKick(dt)}catch(e){console.error(e)}}}
{const _ps=postStep;postStep=function(dt){_ps(dt);try{if(P&&P.kk&&(P.kk.hit||P.kk.net))vKick(dt)}catch(e){console.error(e)}}}
// ---------- crowd reactions ----------
{const _ep=endPlay;endPlay=function(k,x){const ov=!P||P.over,po=G.poss,L0=P&&P.L,d=G.dir;_ep(k,x);try{if(ov||!P||!P.over)return;
 if(k=='td')vHype(po,1);else if(k=='sack')vHype(vOth(po),.6);else if(k=='safety')vHype(vOth(po),.8);else if(k=='tackle'&&x!=null&&L0!=null){const g=(x-L0)*d;if(g>=15)vHype(po,.65);else if(g<=-3)vHype(vOth(po),.4)}}catch(e){}}}
{const _ir=intReturn;intReturn=function(l,p){const t=p&&p.t?p.t:vOth(G.poss),r=_ir(l,p);vHype(t,.9);return r}}
// ---------- weather on the ground ----------
function vProg(){const ql=typeof QLEN=='function'?QLEN():900;return clamp(((Math.min(G.q||1,4)-1)+(1-(G.clk||0)/(ql||900)))/4,0,1)}
function vWxGround(now){const wx=G.wx,dt=XV.dt,key=(R.lg?R.lg.wk:0)*37+(G.opp?G.opp.i:0);
 if(wx=='rain'){if(XV.pk!==key){XV.pk=key;const r=vSeed(key*7+3);XV.pud=[];for(let i=0;i<16;i++)XV.pud.push([12+r()*96,4+r()*45,1.2+r()*2.4,.5+r()*.9])}
  XV.pud.forEach(p=>{const s=P2(p[0],p[1]),k=scY(p[1]);X.fillStyle='rgba(70,100,140,.32)';X.beginPath();X.ellipse(s[0],s[1],p[2]*S*k,p[3]*KY,0,0,7);X.fill();X.strokeStyle='rgba(190,215,255,.25)';X.lineWidth=1;X.beginPath();X.ellipse(s[0]-p[2]*S*k*.2,s[1]-p[3]*KY*.25,p[2]*S*k*.5,p[3]*KY*.35,0,3.4,5.6);X.stroke()});
  if(rnd()<dt*14){const p=XV.pud[rnd()*XV.pud.length|0];XV.rip.push([p[0]+(rnd()-.5)*p[2]*1.4,p[1]+(rnd()-.5)*p[3]*1.2,0])}
  if(rnd()<dt*22)XV.rip.push([camC()+(rnd()-.5)*80,rnd()*FW,0]);if(XV.rip.length>60)XV.rip.splice(0,XV.rip.length-60);
  X.lineWidth=1;for(let i=XV.rip.length-1;i>=0;i--){const q=XV.rip[i];q[2]+=dt;if(q[2]>.6){XV.rip.splice(i,1);continue}const s=P2(q[0],q[1]),k=scY(q[1]),r=.15+q[2]*.9;X.strokeStyle=`rgba(210,225,255,${(.45*(1-q[2]/.6)).toFixed(2)})`;X.beginPath();X.ellipse(s[0],s[1],r*S*k,r*KY*.5,0,0,7);X.stroke()}}
 else if(wx=='snow'){const lv=.2+.8*vProg();if(XV.sk!==key){XV.sk=key;XV.fp.length=0;const r=vSeed(key*11+5);XV.drift=[];for(let i=0;i<30;i++)XV.drift.push([2+r()*116,r()*FW,1+r()*3,r()])}
  XV.drift.forEach(p=>{const k=scY(p[1]),g=p[2]*(.4+lv*.9);X.fillStyle=`rgba(244,247,255,${(.1+.22*lv*(.6+p[3]*.4)).toFixed(3)})`;for(let j=0;j<3;j++){const ox=(j-1)*g*.9,oy=((j*7+p[3]*10)%3-1)*g*.25,s=P2(p[0]+ox,p[1]+oy),r=g*(1-Math.abs(j-1)*.35);X.beginPath();X.ellipse(s[0],s[1],r*S*k*1.3,r*KY*.6,0,0,7);X.fill()}});
  quad(-10,130,-.6,.3,`rgba(246,248,255,${(.5+.4*lv).toFixed(2)})`);quad(-10,130,FW-.3,FW+2,`rgba(246,248,255,${(.5+.4*lv).toFixed(2)})`);
  const t0=now-30;while(XV.fp.length&&XV.fp[0][2]<t0)XV.fp.shift();XV.fp.forEach(f=>{const s=P2(f[0],f[1]),a=(1-(now-f[2])/30)*.4;X.fillStyle=`rgba(32,78,44,${a.toFixed(3)})`;X.fillRect(s[0]-1.5,s[1]-1,3,2)})}}
// snow footprints, rain splashes and snow puffs at the players' feet
function vFeet(dt,now){if(!feat('wx2')||!feat('weather')||!P||G.phase=='replay'||dt<=0)return;const wx=G.wx;if(wx!='rain'&&wx!='snow'){XV.spl.length=0;return}
 P.off.concat(P.def).forEach(p=>{if(p.gone)return;const v=p._lx==null?0:Math.hypot(p.x-p._lx,p.y-p._ly)/dt;p._lx=p.x;p._ly=p.y;if(v<3||v>40)return;
  if(wx=='snow'&&(p._fx==null||Math.hypot(p.x-p._fx,p.y-p._fy)>.9)){p._fx=p.x;p._fy=p.y;p._ff=-(p._ff||1);XV.fp.push([p.x,p.y+p._ff*.25,now]);if(XV.fp.length>1400)XV.fp.shift()}
  let r=wx=='rain'?2.2:3;if(wx=='rain'&&XV.pud&&XV.pud.some(q=>Math.abs(p.x-q[0])<q[2]&&Math.abs(p.y-q[1])<q[3]))r=14;
  if(rnd()<dt*r*(v/7)&&XV.spl.length<160)for(let i=0;i<3;i++)XV.spl.push({x:p.x,y:p.y,z:.1,vx:(rnd()-.5)*3,vy:(rnd()-.5)*2,vz:1.5+rnd()*2.5,t:0,s:wx=='snow'})});
 for(let i=XV.spl.length-1;i>=0;i--){const q=XV.spl[i];q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vz-=10*dt;q.z+=q.vz*dt;if(q.z<0||q.t>.8)XV.spl.splice(i,1)}}
function vSplDraw(){XV.spl.forEach(q=>{const s=P2(q.x,q.y,q.z);X.fillStyle=q.s?'rgba(255,255,255,.9)':'rgba(205,222,255,.85)';X.fillRect(s[0]-1,s[1]-1,q.s?3:2,q.s?3:2)})}
// wind flags on the goal posts and the stadium flagpoles
function vWind(){const w=G.wind||{x:0,y:0,m:0},m=w.m||Math.hypot(w.x,w.y),st=clamp(m/14,0,1);let dx=w.x,dy=w.y*.6;const n=Math.hypot(dx,dy)||1;return{dx:dx/n*st,dy:dy/n*st+(1-st),st,m}}
function vPostFlags(now){const v=vWind();X.lineCap='round';[0,120].forEach(x=>[23.42,29.58].forEach(y=>{const a=P2(x,y,11),len=9+v.st*9;let px=a[0],py=a[1];
 for(let i=1;i<=6;i++){const f=i/6,fl=Math.sin(now*(5+v.m*.35)+i*1.3+y)*f*2.4*(.25+v.st),nx=a[0]+v.dx*len*f-v.dy*fl,ny=a[1]+v.dy*len*f+v.dx*fl;X.strokeStyle=i%2?'#f97316':'#ef4444';X.lineWidth=3.2-f*1.8;X.beginPath();X.moveTo(px,py);X.lineTo(nx,ny);X.stroke();px=nx;py=ny}}));X.lineCap='butt'}
function vStandFlags(now){const v=vWind(),ox=-((camX*S*.8)%400)-200,hi=G.home=='C'&&G.opp?G.opp.i:0,c=teamCol(hi);
 for(let x=ox+320;x<W+400;x+=400){if(x<-30||x>W+30)continue;X.strokeStyle='#cbd5e1';X.lineWidth=2;X.beginPath();X.moveTo(x,30);X.lineTo(x,4);X.stroke();
  const dir=v.dx>=0?1:-1,len=22*(.35+.65*v.st)+4,h=12;X.fillStyle=c[0];X.beginPath();X.moveTo(x,5);
  for(let i=1;i<=5;i++){const f=i/5,droop=(1-v.st)*f*12,wv=Math.sin(now*(4+v.m*.3)-i*1.1)*f*2.5*(.3+v.st);X.lineTo(x+dir*len*f,5+wv+droop)}
  for(let i=5;i>=1;i--){const f=i/5,droop=(1-v.st)*f*12,wv=Math.sin(now*(4+v.m*.3)-i*1.1)*f*2.5*(.3+v.st);X.lineTo(x+dir*len*f*(1-.1*(1-v.st)),5+h*(1-.5*(1-v.st))+wv+droop)}X.lineTo(x,5+h);X.closePath();X.fill();
  X.fillStyle=c[2];X.fillRect(x+dir*3-(dir<0?3:0),8,3,3)}}
// ---------- hooks ----------
{const _fs=fStadium;fStadium=function(){const now=performance.now()/1000;try{if(G&&P&&feat('crowd2'))vCrowd(now)}catch(e){console.error(e)}_fs();try{vGround(now)}catch(e){console.error(e)}}}
function vGround(now){if(!G||!P)return;const wx2=feat('wx2')&&feat('weather');if(wx2&&G.wx)vWxGround(now);if(feat('field3')&&G.opp){vLogo();vGlow(now)}
 if(feat('ballfx')){vNet();vTrail()}if(feat('crowd2'))vSideline(now);if(feat('field3'))vChains(now);if(wx2)vStandFlags(now)}
{const _df=drawField;drawField=function(){_df();try{if(G&&feat('wx2')&&feat('weather'))vPostFlags(performance.now()/1000)}catch(e){console.error(e)}}}
function vTick(dt){['U','C'].forEach(t=>{XV.ex[t]=Math.max(0,(XV.ex[t]||0)-dt*.33)});
 if(G.bigHit>0){if(!XV.bh){XV.bh=1;vHype(vOth(G.poss),.6)}}else XV.bh=0;if(XV.fd>0)XV.fd-=dt*.8;if(XV.dnk){XV.dnk.t-=dt;if(XV.dnk.t<=0)XV.dnk=null}
 if(feat('crowd2')&&G.live){if(XV.wave){XV.wave.t+=dt;if(XV.wave.t>XV.wave.d)XV.wave=null}else if(G.phase=='pre'&&XV.ex.U<.1&&XV.ex.C<.1){XV.waveCd-=dt;if(XV.waveCd<=0&&rnd()<dt*.25){XV.wave={t:0,d:6};XV.waveCd=55+rnd()*60}}}}
function vOverlay(dt){const now=performance.now()/1000;if(feat('wx2')&&feat('weather')){if(typeof camWorld=='function')camWorld(vSplDraw);else vSplDraw()}
 if(feat('crowd2')){const hm=vHome(),e=Math.min(1,(XV.ex[hm]||0)+.3*(XV.ex[vOth(hm)]||0));if(e>.45)for(let i=0;i<4;i++)if(rnd()<e*.45){const x=rnd()*W,y=26+rnd()*(TOP-46);X.fillStyle='#fff';X.fillRect(x,y,2,2);X.fillStyle='rgba(255,255,255,.35)';X.fillRect(x-2,y-2,6,6)}}
 if(feat('field3')&&XV.fd>0&&P&&!P.kr&&G.phase!='replay'){const x1=P.L+G.ytg*G.dir,s=P2(x1,0);X.save();X.globalAlpha=Math.min(1,XV.fd*1.6);X.font='900 italic 15px "Trebuchet MS",sans-serif';X.textAlign='center';X.fillStyle='#000a';X.fillText('FIRST DOWN',s[0]+2,s[1]-6+2-(1-XV.fd)*14);X.fillStyle='#ffd84d';X.fillText('FIRST DOWN',s[0],s[1]-6-(1-XV.fd)*14);X.restore()}
 if(XV.dnk&&feat('ballfx')){const q=XV.dnk,s=P2(q.x,q.y,q.z+1.5+(1.2-q.t)*2);X.save();X.globalAlpha=Math.min(1,q.t*2);X.font='900 italic 22px "Trebuchet MS",sans-serif';X.textAlign='center';X.fillStyle='#000a';X.fillText('DOINK!',s[0]+2,s[1]+2);X.fillStyle='#facc15';X.fillText('DOINK!',s[0],s[1]);X.restore()}}
{const _dr=draw;draw=function(){const now=performance.now()/1000,dt=Math.min(.05,XV.last?now-XV.last:0);XV.last=now;XV.dt=dt;try{if(G&&P){vTick(dt);vFeet(dt,now)}}catch(e){console.error(e)}_dr();try{if(G&&P)vOverlay(dt)}catch(e){console.error(e)}}}
