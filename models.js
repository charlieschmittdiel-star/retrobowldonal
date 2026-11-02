'use strict';
// Detailed player models: shoulder pads, facemasks, gloves, socks and cleats, shading and a thin outline; body types by
// position (and a little per player); helmet stripes, logos, shine and some visors; and players who turn to face toward
// or away from the camera (numbers on the chest and back). The same drawing makes the full-body player photos and the
// custom uniform preview. Each part has a switch on the Game features page.
{const add=[['Presentation','model2','Detailed players','Sharper players with pads, facemasks, gloves, socks and cleats, body types by position, helmet stripes and logos, and players who turn toward or away from the camera.'],
 ['Presentation','photos','Player photos','A full-body picture of each player in his uniform on his player page.'],
 ['Franchise','uni2','Custom uniforms','Design your home and away jerseys, pants, helmet and numbers in Team settings.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const MSK=['#f2d0b1','#e0ac85','#c68863','#a86b4a','#8a5536','#6b3f26','#4d2c1b'];
const MGRP={LT:'OL',LG:'OL',C:'OL',RG:'OL',RT:'OL',DE:'DL',DT:'DL'};
let MREC=null,MRL=0;function mRec(id){if(!R||!id)return null;if(!MREC||MRL!==R.pl.length){MREC=new Map(R.pl.map(p=>[p.id,p]));MRL=R.pl.length}return MREC.get(id)||null}
function mBody(g,id,sk){const b={QB:[1,1.02],RB:[1.1,.95],WR:[.9,1.05],TE:[1.15,1.03],OL:[1.4,1.02],DL:[1.32,1.02],LB:[1.16,1.01],CB:[.9,1.02],S:[.96,1.03],K:[.86,.95],P:[.88,.97]}[g]||[1,1];
 const h=hsh((id||7)*31+3),v=((h%1000)/1000-.5)*.08,s=sk?clamp(((sk.str||65)-65)/400,-.04,.06):0;return{w:b[0]*(1+v+s),h:b[1]*(1+(((h>>>10)%1000)/1000-.5)*.05)}}
function mLook(id){const h=hsh((id||3)*17+11);return{skin:id?MSK[(hsh(id)>>>3)%7]:null,visor:(h%10)<2,glove:(h>>>4)%3,sock:(h>>>7)%2}}
// one player, drawn into context g. Units: x forward (toward where he faces), y up; u pixels per unit.
function mDraw(g,cx,yb,u,o){const ps=o.ps,d=ps.d,l=ps.l,hs=o.hs,C=o.C,bw=5*o.bw,hw=bw/2,L=[],T=[];let ballAt=null;
 const side=o.view=='side',f=o.f,X_=x=>cx+f*x*u,Y_=y=>yb-y*hs*u;
 const R=(x0,y0,w,h,col,sx)=>{const a=sx?cx+x0*u:X_(x0),b=sx?cx+(x0+w)*u:X_(x0+w);L.push([Math.round(Math.min(a,b)),Math.round(Y_(y0+h)),Math.max(1,Math.round(Math.abs(b-a))),Math.max(1,Math.round(h*hs*u)),col])};
 const seg=(a,e,col,w,sx)=>{const dx=e[0]-a[0],dy=e[1]-a[1],n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.5));for(let i=0;i<=n;i++)R(a[0]+dx*i/n-w/2,a[1]+dy*i/n-w/2,w,w,col,sx)};
 const hipY=4-d*.75,sock=o.sockCol,glove=o.gloveCol,skin=o.skin;
 const cleat=(x,y,sx)=>{R(x-.6,y,1.7,.7,'#111',sx);R(x-.5,y,1.5,.18,'#e5e7eb',sx)};
 if(side){
  const leg=j=>{const hip=[j?-.6:.6,hipY],ft=ps.F[j],dv=hip[1]-ft[1];let kn=[(hip[0]+ft[0])/2+Math.max(0,4-dv)*.45,(hip[1]+ft[1])/2+.1];if(ps.F.kneel&&j==1)kn=[-.3,.5];
   seg(hip,kn,C.pt,1.45);const an=[ft[0],ft[1]+.7],mid=[kn[0]+(an[0]-kn[0])*.45,kn[1]+(an[1]-kn[1])*.45];seg(kn,mid,C.pt,1.15);seg(mid,an,sock,1.05);cleat(ft[0],ft[1])};
  const arm=j=>{const S=[(j?.7:-.5)+l*.75,8.3-d],E=ps.A[j][0],H=ps.A[j][1],m=[S[0]+(E[0]-S[0])*.55,S[1]+(E[1]-S[1])*.55];seg(S,m,C.j,1.35);seg(m,E,skin,1);seg(E,H,skin,.95);R(H[0]-.55,H[1]-.55,1.1,1.1,glove);if(ps.ball===j)ballAt=H};
  arm(0);leg(1);leg(0);
  R(-hw*.9+l*.35,hipY,bw*.9,2.5,C.j);R(-hw+l*.7,hipY+2.4,bw,2.4,C.j);R(-hw*1.15+l*.75,hipY+3.7,bw*1.2,1.35,C.j);R(-hw+l*.7,hipY+2.4,bw*.35,2.4,'rgba(0,0,0,.16)');R(-hw*.9+l*.35,hipY,bw*.35,2.5,'rgba(0,0,0,.16)');
  R(-hw*.9+l*.35,hipY-.05,bw*.9,.4,C.j2);R(-hw*1.15+l*.75,hipY+4.7,bw*1.2,.3,C.j2);
  const hx=-1.55+l*1.1,hy=hipY+4.95;R(hx+.3,hy-.2,1.2,.5,skin);
  R(hx+.35,hy,2.4,3.1,C.h);R(hx,hy+.4,3.1,2.3,C.h);R(hx+.35,hy,1.2,3.1,'rgba(0,0,0,.14)');R(hx+.35,hy+2.75,2.3,.35,C.st);R(hx+.55,hy+1.1,.85,.85,C.st);
  R(hx+2.15,hy+.5,.75,1.5,skin);if(o.visor)R(hx+2.1,hy+1.35,.85,.55,'#111827');R(hx+2.75,hy+.25,.35,1.75,'#9ca3af');R(hx+2.15,hy+.85,.95,.28,'#9ca3af');R(hx+.75,hy+2.3,.7,.3,'rgba(255,255,255,.55)');
  T.push([o.num,X_(l*.6),Y_(hipY+3.3),1.25]);arm(1)}
 else{const back=o.view=='back',sx=1,lc=l*.25;
  const legF=j=>{const s=j?1:-1,ft=ps.F[j],hip=[s*.8+lc,hipY],fx=s*.95+lc,fy=ft[1],kn=[s*.9+lc,(hipY+fy)/2+.2+fy*.3];seg(hip,kn,C.pt,1.5,sx);const an=[fx,fy+.7],mid=[kn[0],kn[1]-(kn[1]-an[1])*.45];seg(kn,mid,C.pt,1.2,sx);seg(mid,an,sock,1.1,sx);R(fx-.6,fy,1.2,.7,'#111',sx)};
  const armF=j=>{const s=j?1:-1,S=[s*bw*.6+lc,8.2-d],E=[s*(bw*.68+.35)+lc,ps.A[j][0][1]],H=[s*(bw*.62+.45)+lc,ps.A[j][1][1]],m=[S[0]+(E[0]-S[0])*.5,S[1]+(E[1]-S[1])*.5];
   seg(S,m,C.j,1.35,sx);seg(m,E,skin,1,sx);seg(E,H,skin,.95,sx);R(H[0]-.55,H[1]-.55,1.1,1.1,glove,sx);if(ps.ball===j)ballAt=[H[0],H[1],1]};
  legF(0);legF(1);if(back){armF(0);armF(1)}
  const tw=bw*1.15;R(-tw*.45+lc,hipY,tw*.9,2.5,C.j,sx);R(-tw/2+lc,hipY+2.4,tw,2.4,C.j,sx);R(-tw*.66+lc,hipY+3.7,tw*1.32,1.35,C.j,sx);R(-tw*.45+lc,hipY-.05,tw*.9,.4,C.j2,sx);R(tw*.15+lc,hipY,tw*.3,4.8,'rgba(0,0,0,.14)',sx);
  T.push([o.num,cx+lc*u,Y_(hipY+(back?3.1:3.4)),back?2.2:1.6]);
  const hx=-1.4+lc,hy=hipY+4.95;R(hx+.9,hy-.2,1,.5,skin,sx);R(hx+.3,hy,2.2,3.1,C.h,sx);R(hx,hy+.4,2.8,2.3,C.h,sx);R(hx+1.2,hy+.1,.4,3,C.st,sx);
  if(back)R(hx+.5,hy+2.2,.6,.3,'rgba(255,255,255,.5)',sx);else{R(hx+.45,hy+.35,1.9,1.6,skin,sx);if(o.visor)R(hx+.45,hy+1.3,1.9,.55,'#111827',sx);else{R(hx+.8,hy+1.4,.3,.3,'#1b1b1b',sx);R(hx+1.7,hy+1.4,.3,.3,'#1b1b1b',sx)}
   R(hx+.4,hy+.9,2,.25,'#9ca3af',sx);R(hx+.4,hy+.4,2,.22,'#9ca3af',sx);R(hx+1.3,hy+.3,.22,1.2,'#9ca3af',sx);R(hx+.45,hy+2.3,.5,.3,'rgba(255,255,255,.5)',sx)}
  if(!back){armF(0);armF(1)}}
 // outline pass, then the colors
 const ow=Math.max(1,Math.round(u*.32));g.fillStyle='rgba(8,14,10,.55)';for(const r of L)if(r[4].charCodeAt(0)==35)g.fillRect(r[0]-ow,r[1]-ow,r[2]+ow*2,r[3]+ow*2);
 for(const r of L){g.fillStyle=r[4];g.fillRect(r[0],r[1],r[2],r[3])}
 if(o.num!=null&&T.length&&u>1.4){const [n,x,y,sz]=T[0];g.font=`900 ${Math.max(6,Math.round(sz*u*hs))}px "Trebuchet MS",sans-serif`;g.textAlign='center';g.fillStyle=C.num||'#fff';g.fillText(String(n),x,y);g.textAlign='left'}
 if(ballAt){const bx=ballAt[2]?cx+ballAt[0]*u:X_(ballAt[0]+.5),by=Y_(ballAt[1]+.1),k=u/2.6;g.fillStyle='#5a3312';g.beginPath();g.ellipse(bx,by,4.4*k,2.9*k,f*-.4,0,7);g.fill();g.fillStyle='#8b5a2b';g.beginPath();g.ellipse(bx,by,3.5*k,2.1*k,f*-.4,0,7);g.fill()}
 return Y_(hipY+8.1)}
// the field: called from the renderer's sprite() when Detailed players is on
function mdlSprite(p,t){const s=P2(p.x,p.y),k=scY(p.y),u=2.6*k,C=TEAM[p.t]||TEAM.C,line=(p.s=='O'&&p.i>5)||(p.s=='D'&&p.i<4);
 X.fillStyle='rgba(0,0,0,.32)';X.beginPath();X.ellipse(s[0],s[1],9*k,3.2*k,0,0,7);X.fill();
 const rec=p.pid?mRec(p.pid):null,gp=rec?rec.g:(MGRP[p.pos]||p.pos),b=mBody(gp,p.pid||p.i+1,rec&&rec.sk),lk=mLook(p.pid||(p.i+1)*7+(p.s=='O'?0:3));
 const cs=Math.cos(p.fa),sn=Math.sin(p.fa);let v=p._vw||'side';if(Math.abs(cs)>.62)v='side';else if(Math.abs(cs)<.45)v=sn>0?'front':'back';p._vw=v;
 const nm=G&&G.nmap&&p.pid&&G.nmap[p.pid]?G.nmap[p.pid].j:null;
 const hy=mDraw(X,s[0],Math.round(s[1]),u,{ps:pose(p,t,line),f:cs>=0?1:-1,view:v,C,bw:b.w,hs:b.h,skin:lk.skin||skinOf(p),visor:lk.visor&&!line,gloveCol:lk.glove==0?'#f8fafc':lk.glove==1?'#111827':C.j2,sockCol:lk.sock?'#f8fafc':(C.st||'#f8fafc'),num:nm});
 if(p.stun>0||p.bite>0){X.fillStyle='#fde047';X.fillRect(s[0]-4*k,hy-6,2,2);X.fillRect(s[0]+3*k,hy-7,2,2)}return hy}
// ---------- uniforms ----------
function uniDef(i){const c=teamCol(i);return{hj:c[0],aj:'#f1f5f9',pt:'#e5e7eb',hl:c[1],nm:'#ffffff',st:c[2]}}
function uniOf(i){const t=R.lg.t[i];return Object.assign(uniDef(i),feat('uni2')&&t&&t.uni||{})}
{const _u=uniforms;uniforms=function(...a){const r=_u.apply(this,a);try{if(feat('uni2')&&feat('unif')&&G&&G.opp&&R.lg.t[0].uni){const u=uniOf(0),home=G.home=='U';Object.assign(TEAM.U,{j:home?u.hj:u.aj,h:u.hl,pt:u.pt,num:home?u.nm:u.hj,st:u.st,j2:home?teamCol(0)[1]:u.hj})}}catch(e){console.error(e)}return r}}
function uniColors(i,home){if(i===0&&feat('uni2')){const u=uniOf(0);return{j:home?u.hj:u.aj,j2:home?teamCol(0)[1]:u.hj,h:u.hl,pt:u.pt,st:u.st,num:home?u.nm:u.hj}}const c=teamCol(i);return home?{j:c[0],j2:c[1],h:c[1],pt:'#e5e7eb',st:c[2],num:'#fff'}:{j:'#f1f5f9',j2:c[0],h:c[1],pt:c[0],st:c[2],num:c[0]}}
// ---------- full-body photos ----------
const MPH=new Map();
function mPhoto(rec,w,h,C,key){const k=key||(rec.id+':'+w+':'+JSON.stringify(C));if(MPH.has(k))return MPH.get(k);const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');if(!g||!g.fillRect)return'';
 const gr=g.createLinearGradient?g.createLinearGradient(0,0,0,h):null;if(gr){gr.addColorStop(0,C.j2||'#1e3a8a');gr.addColorStop(.72,'#0b1410');gr.addColorStop(.73,'#2a7f35');gr.addColorStop(1,'#1f6b2a')}g.fillStyle=gr||'#1f2937';g.fillRect(0,0,w,h);
 g.fillStyle='#ffffff22';for(let y=Math.round(h*.78);y<h;y+=Math.max(4,Math.round(h/14)))g.fillRect(0,y,w,1);
 const u=h/17,b=mBody(rec.g,rec.id,rec.sk),lk=mLook(rec.id),yb=Math.round(h-u*1.2),cx=Math.round(w/2);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(cx,yb,u*4,u*1.1,0,0,7);g.fill();
 const ps={d:0,l:0,F:[[.9,0],[-.7,0]],A:[[[-.4,6.9],[-.7,5.4]],[[.9,6.9],[1.1,5.4]]],ball:-1},line=rec.g=='OL'||rec.g=='DL';
 let num=null;try{num=typeof jNum=='function'?jNum(rec):null}catch(e){}
 mDraw(g,cx,yb,u,{ps,f:1,view:'front',C,bw:b.w,hs:b.h,skin:lk.skin,visor:lk.visor&&!line,gloveCol:lk.glove==0?'#f8fafc':lk.glove==1?'#111827':C.j2,sockCol:lk.sock?'#f8fafc':C.st,num});
 const url=c.toDataURL();MPH.set(k,url);if(MPH.size>300)MPH.delete(MPH.keys().next().value);return url}
{const _pp=pp;pp=function(id,...a){const r=_pp(id,...a);try{if(feat('photos')){const p=R.pl.find(q=>q.id==id),h=$('modal').querySelector('h1');if(p&&h&&!$('modal').querySelector('.mphoto')){const C=uniColors(p.tid>=0?p.tid:0,true);
 h.insertAdjacentHTML('beforebegin',`<img class="mphoto" src="${mPhoto(p,150,225,C)}" width="150" height="225" alt="" style="float:right;margin:0 0 10px 16px;border-radius:12px;border:2px solid #ffffff30;image-rendering:pixelated;box-shadow:0 4px 14px #0007">`)}}}catch(e){console.error(e)}return r}}
// ---------- the uniform editor in Team settings ----------
{const _tu=teamUI;teamUI=function(...a){const r=_tu.apply(this,a);try{if(!feat('uni2'))return r;const u=uniOf(0),b=$('modal').querySelector('.btns');if(!b)return r;
 const inp=(id,lbl,v)=>`<label style="display:inline-flex;gap:6px;align-items:center;margin:0 12px 6px 0">${lbl} <input type="color" id="${id}" value="${v}" oninput="uniPrev()"></label>`;
 b.insertAdjacentHTML('beforebegin',`<h3>Uniforms</h3><div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start"><div style="flex:1;min-width:260px"><p>${inp('uhj','Home jersey',u.hj)}${inp('uaj','Away jersey',u.aj)}</p><p>${inp('upt','Pants',u.pt)}${inp('uhl','Helmet',u.hl)}</p><p>${inp('ust','Stripes and socks',u.st)}${inp('unm','Home numbers',u.nm)}</p><p class="small dim">Away numbers use your home jersey color. ${B("delete R.lg.t[0].uni;save();teamUI()",'Reset to team colors')}</p></div>
 <div style="display:flex;gap:10px"><figure style="margin:0;text-align:center"><img id="uph" width="110" height="165" style="border-radius:10px;image-rendering:pixelated"><figcaption class="small">Home</figcaption></figure><figure style="margin:0;text-align:center"><img id="upa" width="110" height="165" style="border-radius:10px;image-rendering:pixelated"><figcaption class="small">Away</figcaption></figure></div></div>`);uniPrev()}catch(e){console.error(e)}return r}}
function uniRead(){const v=id=>{const e=$(id);return e?e.value:null};return{hj:v('uhj'),aj:v('uaj'),pt:v('upt'),hl:v('uhl'),st:v('ust'),nm:v('unm')}}
function uniPrev(){const u=uniRead();if(!u.hj)return;const rec=teamPl(0).find(p=>p.g=='QB')||teamPl(0)[0];if(!rec)return;const H={j:u.hj,j2:teamCol(0)[1],h:u.hl,pt:u.pt,st:u.st,num:u.nm},A_={j:u.aj,j2:u.hj,h:u.hl,pt:u.pt,st:u.st,num:u.hj};
 const a=$('uph'),b=$('upa');if(a)a.src=mPhoto(rec,110,165,H);if(b)b.src=mPhoto(rec,110,165,A_)}
{const _ts=teamSave;teamSave=function(...a){try{if(feat('uni2')){const u=uniRead();if(u.hj)R.lg.t[0].uni=u}}catch(e){}return _ts.apply(this,a)}}
