'use strict';
// Play designer: a playbook-style editor (field drawn top-down like a real play sheet), with a play list, tools,
// route presets, drag-able route points, undo, flip, an animated preview, and trick plays you can build into any play:
// play action, flea flicker, halfback pass, RPO, read option, plus three new ones (reverse, double pass, hook and lateral).
{const add=[['Playbook','ed2','New play designers','Cleaner offense and defense designers: playbook-style field, play list, drag-able points, undo, flip, preview, and trick play options.'],
 ['Playbook','trick2','More trick plays','Reverse, double pass and hook and lateral: in the stock playbook and buildable in your own plays.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- stock trick plays ----------
const PE_STOCK={'Reverse':[[[[14,0]],[[3,0],[3,-4]],[[10,0]],[],[]],1,5,{rev:2}],
 'Double Pass':[[[[1,2]],[[30,0]],[[10,0],[22,-8]],[[12,0]],[]],0,5,{wrp:1}],
 'Hook and Lateral':[[[[24,0]],[[11,0],[9,1]],[[3,0],[6,4]],[[8,0]],[]],0,5,{hkl:[2,3]}]};
function peStock(){for(const n in PE_STOCK){const s=PE_STOCK[n];if(feat('trick2'))PRE[n]=Object.assign(mkPre(s[0],s[1],s[2]),s[3]);else delete PRE[n]}}
peStock();{const _ot=optT;optT=function(k){_ot(k);if(k=='trick2')peStock()}}
{const _cp=cpuPlay;cpuPlay=function(){let n=_cp();try{const v=allP()[n]||{};if((v.rev||v.wrp||v.hkl)&&rnd()<(FT('nfl')?.85:.5))n=_cp()}catch(e){}return n}}
// pass the new trick flags along to the play
{const _ap=applyPlay;applyPlay=function(n,...a){const r=_ap.call(this,n,...a);try{const pl=allP()[n]||{};if(P){P.pf=P.pf||{};const on=feat('trick2');P.pf.rev=on?pl.rev:0;P.pf.wrp=on?pl.wrp:0;P.pf.hkl=on?pl.hkl:0}}catch(e){console.error(e)}return r}}
{const _sn=snap;snap=function(...a){const r=_sn.apply(this,a);try{if(P&&G.phase=='play'){P.revDone=0;P.wrpDone=0;P.hklDone=0;P.hklT=0;peTrickSnap()}}catch(e){console.error(e)}return r}}
function peTrickSnap(){const f=P.pf||{},O=P.off,d=G.dir,L=P.L;if(P.kr)return;
 if(f.rev&&O[f.rev]){const w=O[f.rev],side=Math.sign(w.sy-26.5)||1;w.route=[[L-d*3.5,26.5+side*3],[L-d*2.8,26.5-side*4],[L-d*1,clamp(26.5-side*15,3,50)],[L+d*6,clamp(26.5-side*18,2,51)]];w.ri=0}
 if(f.wrp&&O[f.wrp]){const w=O[f.wrp];w.route=[[L-d*4.5,clamp(w.sy+(26.5-w.sy)*.3,3,50)]];w.ri=0}}
{const _ta=throwAt;throwAt=function(...a){try{if(P)P.wrpDone=1}catch(e){}return _ta.apply(this,a)}}
// the tricks themselves
{const _st=step;step=function(dt){const f=P&&P.pf;let rb=null,sv=null,tl=null,tsv=null;
 try{if(f&&f.hkl&&feat('trick2')&&!P.hklDone&&G.phase=='play'&&P.b.st=='carry'&&P.b.c===P.off[f.hkl[0]]&&P.rec===P.off[f.hkl[0]]){tl=P.off[f.hkl[1]];tsv=tl?[tl.x,tl.y]:null}}catch(e){}
 try{if(f&&f.rev&&feat('trick2')&&!P.revDone&&!P.kr&&G.phase=='play'&&P.b.st=='carry'&&P.b.c===P.off[P.ho||5]){rb=P.b.c;sv=[rb.x,rb.y]}}catch(e){}
 _st(dt);
 try{if(!P||G.phase!='play'||P.over||!f||!feat('trick2'))return;const b=P.b,O=P.off,d=G.dir,L=P.L,me=G.poss=='U';
  // reverse: the back runs toward the receiver's side, then hands it to him going the other way
  if(rb&&sv&&!P.revDone&&b.st=='carry'&&b.c===rb){const w=O[f.rev];rb.x=sv[0];rb.y=sv[1];if(w){const side=Math.sign(w.sy-26.5)||1;mv(rb,L-d*2.5,clamp(26.5+side*6,3,50),rb.spd*.7,dt);
   if(dist(rb,w)<1.8||P.t>2.4){P.revDone=1;if(dist(rb,w)<3.5&&(w.x-L)*d<0){b.c=w;P.rusher=w;w.route=[];w.ri=0;if(G.box&&rb.pid&&G.box[rb.pid])G.box[rb.pid][SI.ra]=Math.max(0,(G.box[rb.pid][SI.ra]||0)-1);sRec(w,'ra');
    P.def.forEach(p=>{if(!p.eng&&dist(p,rb)<14&&rnd()<.7)p.bite=.5});if(me)G.msg='REVERSE! He has it going the other way!'}}}}
  // double pass: the QB pitches to a receiver behind the line, who becomes the passer; the QB goes out on a route
  if(f.wrp&&!P.wrpDone&&b.st=='qb'&&!P.run&&P.t>=.7){const k=f.wrp,w=O[k],q=O[0];P.wrpDone=1;
   if(w&&(w.x-L)*d<-.3&&dist(w,q)<26&&!w.eng){O[k]=q;O[0]=w;const side=q.y<26.5?-1:1;q.route=[[q.x+d*8,clamp(q.y+side*7,2,51)],[q.x+d*30,clamp(q.y+side*9,2,51)]];q.ri=0;w.route=[];w.ri=0;w.fa=d>0?0:Math.PI;w.ha=null;
    b.x=w.x;b.y=w.y;P.sd=0;P.look=null;P.def.forEach(p=>{if(!p.rush&&rnd()<.45)p.bite=.4});if(me)G.msg='Double pass! Your receiver has it - throw it!'}}
  // CPU quarterbacks look for the hook man on a hook and lateral
  if(f.hkl&&!P.hklDone&&b.st=='qb'&&!P.run&&P.t>=1.3&&!(G.poss=='U'&&qbIsMe()&&!autoMode())){const c=O[f.hkl[0]];if(c&&!c.eng&&(P.t>2||P.def.every(p=>(p.rush&&!p.hunt)||dist(p,c)>1))&&rnd()<dt*5)throwTo(c)}
  // hook and lateral: after the catch, the trailer follows and gets a pitch when the catcher is about to be hit
  if(f.hkl&&!P.hklDone){const[i,j]=f.hkl,c=O[i],t=O[j];if(c&&t&&b.st=='carry'&&b.c===c&&P.rec===c){P.hklT+=dt;const side=c.y<26.5?1:-1;if(tl===t&&tsv){t.x=tsv[0];t.y=tsv[1]}mv(t,c.x-d*2.5,clamp(c.y+side*3,2,51),t.spd,dt);
    const hit=P.def.some(p=>!p.eng&&!p.fall&&dist(p,c)<2.2);if((hit||P.hklT>.9)&&dist(t,c)<7&&(t.x-c.x)*d<=.6){P.hklDone=1;b.c=t;P.rusher=t;if(me)G.msg='HOOK AND LATERAL!'}}}
 }catch(e){console.error(e)}}}
// ---------- the play designer ----------
const PE_TR=[{k:'',n:'No trick',d:'A normal play.'},{k:'pa',n:'Play action',d:'Fake the handoff first. Linebackers and safeties may bite.',t:0},
 {k:'flea',n:'Flea flicker',d:'Hand off, then the back pitches it back to the QB to throw deep.',t:1},{k:'hbp',n:'Halfback pass',d:'The ball carrier throws after the handoff.',t:1},
 {k:'rpo',n:'RPO',d:'Before the handoff, pull it back (or press 1-5) and throw instead.',t:1},{k:'opt',n:'Read option',d:'Watch the end: press Space to keep it with the QB, or let him hand off.',t:1},
 {k:'rev',n:'Reverse',d:'The back runs toward a receiver, who takes it and goes the other way.',t:1,pick:'Receiver who takes the reverse',nw:1},
 {k:'wrp',n:'Double pass',d:'The QB pitches to a receiver behind the line, who throws. The QB runs a route.',t:0,pick:'Receiver who throws',nw:1},
 {k:'hkl',n:'Hook and lateral',d:'A receiver catches a short pass and pitches it to a teammate trailing him.',t:0,pick:'Receiver who catches',pick2:'Trailer who gets the pitch',nw:1}];
const PE_RT=Object.assign({},typeof RPRE=='object'?RPRE:{},{Hitch:[[6,0],[5,0]],Dig:[[12,0],[12,10]],Drag:[[2,0],[4,14]],Seam:[[24,1]],Fade:[[22,-5]],Screen:[[-2,-4]],Swing:[[-1,-5],[3,-9]],Angle:[[1,-4],[6,3]],'Out & up':[[6,0],[6,-3],[24,-4]],Whip:[[5,0],[5,4],[5,-2]]});
let PE=null,peCv=null;const peOld=editor;const PE_K=12,PE_PX=10,PE_PY=12,PE_TOP=34,PE_BOT=-13,PE_W=PE_PX*2+53.3*PE_K,PE_H=PE_PY*2+(PE_TOP-PE_BOT)*PE_K;
const peSx=y=>PE_PX+y*PE_K,peSy=x=>PE_PY+(PE_TOP-x)*PE_K;
const peTrick=pl=>pl.pa?'pa':pl.flea?'flea':pl.hbp?'hbp':pl.rpo?'rpo':pl.opt?'opt':pl.rev?'rev':pl.wrp?'wrp':pl.hkl?'hkl':'';
const peKind=pl=>peTrick(pl)?'Trick':pl.run?'Run':'Pass';
function pePush(){PE.hist.push(JSON.stringify(PE.pl));if(PE.hist.length>60)PE.hist.shift();PE.dirty=1}
function peLoad(n){const pl=allP()[n];if(!pl)return;PE.n=n;PE.nm=n;PE.pl=clone(pl);PE.sel=1;PE.hist=[];PE.dirty=0;PE.prev=null;PE.msg=''}
function peStart(q){const m=q[4]&&q[4].length?q[4][q[4].length-1]:null;return m?[q[0]+Math.min(m[0],-.5-q[0]),q[1]+m[1]]:[q[0],q[1]]}
editor=function(){if(!feat('ed2'))return peOld();if(!PE){PE={n:'Slants',mode:'route',hist:[]};peLoad(allP()[G&&G.lp]?G.lp:'Slants')}
 $('modal').hidden=0;$('modal').innerHTML=`<div id="pe"><div class="pe-top"><button class="pe-x" onclick="peDone()">&larr; Done</button><input id="pe-nm" maxlength="18" spellcheck="false" value="${esc(PE.nm)}" oninput="PE.nm=this.value"><span id="pe-kind"></span><span class="pe-sp"></span>
  <button onclick="peUndo()" title="Undo (Ctrl+Z)">&#8630; Undo</button><button onclick="peFlip()" title="Mirror the play left to right">&#8646; Flip</button><button onclick="pePrev()" id="pe-pv">&#9654; Preview</button><button class="pe-pri" onclick="peSave(0)">Save</button><button onclick="peSave(1)">Save as new</button><button id="pe-del" onclick="peDel()">Delete</button></div>
  <div class="pe-body"><div class="pe-list" id="pe-list"></div><div class="pe-mid"><div class="pe-tools" id="pe-tools"></div><canvas id="pe-cv"></canvas><div class="pe-hint" id="pe-hint"></div></div><div class="pe-side" id="pe-side"></div></div></div>`;
 peCv=$('pe-cv');peCv.width=PE_W*2;peCv.height=PE_H*2;peCss();
 const ep=e=>{const r=peCv.getBoundingClientRect(),sx=(e.clientX-r.left)/r.width*PE_W,sy=(e.clientY-r.top)/r.height*PE_H;return[PE_TOP-(sy-PE_PY)/PE_K,(sx-PE_PX)/PE_K]};
 const snapv=v=>Math.round(v*2)/2;
 peCv.onpointerdown=e=>{if(PE.prev)PE.prev=null;const[x,y]=ep(e),P0=PE.pl.p,q=P0[PE.sel];let hit=-1,hd=1.4;P0.forEach((o,i)=>{const dd=Math.hypot(o[0]-x,o[1]-y);if(dd<hd){hd=dd;hit=i}});
  if(PE.mode=='block'){let j=-1,jd=1.7;FDX.forEach((dx,k)=>{const dd=Math.hypot(dx-x,FDY[k]-y);if(dd<jd){jd=dd;j=k}});if(hit>=0&&hd<=jd)j=-1;if(j>=0&&q){pePush();q[3]=q[3]===j?-1:j}else if(hit>=0)PE.sel=hit;else if(q&&q[3]>=0){pePush();q[3]=-1}return peUI()}
  // grab a route or motion point of the selected player
  if(q){const s0=peStart(q);let wi=-1,wd=1.1;q[2].forEach((w,k)=>{const dd=Math.hypot(s0[0]+w[0]-x,s0[1]+w[1]-y);if(dd<wd){wd=dd;wi=k}});if(wi>=0){pePush();PE.drag={k:'r',i:wi};return}
   let mi=-1,md=1.1;(q[4]||[]).forEach((w,k)=>{const dd=Math.hypot(q[0]+w[0]-x,q[1]+w[1]-y);if(dd<md){md=dd;mi=k}});if(mi>=0){pePush();PE.drag={k:'m',i:mi};return}}
  if(hit>=0){PE.sel=hit;if(PE.mode=='move'){pePush();PE.drag={k:'p'}}return peUI()}
  if(!q)return;
  if(PE.mode=='route'){if(PE.sel>=6&&!PE.pl.run){PE.msg='Linemen block; give routes to the QB, receivers, tight end or back.';return peUI()}pePush();const s0=peStart(q);q[2].push([snapv(x-s0[0]),snapv(y-s0[1])]);PE.drag={k:'r',i:q[2].length-1};return peUI()}
  if(PE.mode=='motion'){if(PE.sel==0||PE.sel>=6){PE.msg='Only receivers, the tight end and the back can go in motion.';return peUI()}pePush();(q[4]=q[4]||[]).push([snapv(Math.min(x,-.5)-q[0]),snapv(clamp(y,1,52)-q[1])]);PE.drag={k:'m',i:q[4].length-1};return peUI()}
  peUI()};
 peCv.onpointermove=e=>{const[x,y]=ep(e);const q=PE.pl.p[PE.sel];if(!PE.drag||!q){let over=PE.pl.p.some(o=>Math.hypot(o[0]-x,o[1]-y)<1.4);peCv.style.cursor=over?'pointer':PE.mode=='move'?'default':'crosshair';return}
  if(PE.drag.k=='p'){q[0]=clamp(snapv(x),-12,-.5);q[1]=clamp(snapv(y),1,52)}
  else if(PE.drag.k=='r'){const s0=peStart(q);q[2][PE.drag.i]=[snapv(clamp(x,-12,45)-s0[0]),snapv(clamp(y,1,52)-s0[1])]}
  else if(PE.drag.k=='m'){q[4][PE.drag.i]=[snapv(Math.min(x,-.5)-q[0]),snapv(clamp(y,1,52)-q[1])]}
  pedraw()};
 peCv.onpointerup=()=>{if(PE.drag){PE.drag=null;peUI()}};
 peCv.ondblclick=peCv.oncontextmenu=e=>{e.preventDefault();const[x,y]=ep(e),q=PE.pl.p[PE.sel];if(!q)return;const s0=peStart(q),k=q[2].findIndex(w=>Math.hypot(s0[0]+w[0]-x,s0[1]+w[1]-y)<1.1);if(k>=0){pePush();q[2].splice(k,1);peUI()}};
 peUI()};
function peUI(){if(!$('pe'))return;const pl=PE.pl,q=pl.p[PE.sel],all=allP(),tr=peTrick(pl);
 $('pe-kind').textContent=peKind(pl)+(CP[PE.n]?' · your play':' · stock play')+(PE.dirty?' · unsaved':'');$('pe-kind').className='pe-chip pe-'+peKind(pl).toLowerCase();$('pe-del').style.display=CP[PE.n]?'':'none';
 const sec=(t,ns)=>ns.length?`<div class="pe-lh">${t}</div>`+ns.map(n=>`<button class="pe-li ${n==PE.n?'on':''}" onclick="peOpen(this.dataset.n)" data-n="${esc(n)}"><b>${esc(n)}</b><i class="pe-chip pe-${peKind(all[n]).toLowerCase()}">${peKind(all[n])}</i></button>`).join(''):'';
 const names=Object.keys(all),mine=names.filter(n=>CP[n]),st=names.filter(n=>!CP[n]);
 $('pe-list').innerHTML=`<button class="pe-new" onclick="peNew()">+ New play</button>`+sec('Your plays',mine)+sec('Pass',st.filter(n=>peKind(all[n])=='Pass'))+sec('Run',st.filter(n=>peKind(all[n])=='Run'))+sec('Trick',st.filter(n=>peKind(all[n])=='Trick'));
 const tool=(m,ic,t)=>`<button class="${PE.mode==m?'on':''}" onclick="PE.mode='${m}';PE.msg='';peUI()"><span>${ic}</span>${t}</button>`;
 $('pe-tools').innerHTML=tool('route','&#10548;','Route')+tool('move','&#10021;','Move')+tool('motion','&#8635;','Motion')+tool('block','&#9524;','Block');
 const hints={route:'Click the field to add route points for the selected player. Drag a point to move it; double-click (or right-click) a point to remove it.',move:'Drag players to set the formation. Everyone has to stay behind the line of scrimmage (the blue line).',
  motion:'Click behind the line to draw a pre-snap motion path (orange). His route then starts from where the motion ends.',block:'Pick a blocker, then click a red defender to assign him. Click the field to clear the assignment.'};
 $('pe-hint').innerHTML=PE.msg?`<b class="pe-warn">${esc(PE.msg)}</b>`:hints[PE.mode];
 const svg=pts=>{const pp=[[0,0]].concat(pts.map(([a,b])=>[b,-a]));const xs=pp.map(p=>p[0]),ys=pp.map(p=>p[1]),mnx=Math.min(...xs),mxx=Math.max(...xs),mny=Math.min(...ys),mxy=Math.max(...ys),sc=Math.min(3,28/Math.max(4,mxx-mnx),28/Math.max(4,mxy-mny)),ox=20-(mnx+mxx)/2*sc,oy=20-(mny+mxy)/2*sc;
  const P2=pp.map(p=>[ox+p[0]*sc,oy+p[1]*sc]),l=P2[P2.length-1],o=P2[P2.length-2]||[l[0],l[1]+1],an=Math.atan2(l[1]-o[1],l[0]-o[0]),ah=[[l[0]-Math.cos(an-.5)*6,l[1]-Math.sin(an-.5)*6],[l[0]-Math.cos(an+.5)*6,l[1]-Math.sin(an+.5)*6]];
  return`<svg viewBox="0 0 40 40" width="32" height="32"><polyline points="${P2.map(p=>p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>${P2.length>1?`<polyline points="${ah[0].join(',')} ${l.join(',')} ${ah[1].join(',')}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`:''}<circle cx="${P2[0][0]}" cy="${P2[0][1]}" r="3.2" fill="currentColor"/></svg>`};
 const posN=i=>`${PO[i]}${i>0&&i<6?' '+i:''}`,skill=[1,2,3,4,5],pick=(k,v,lab,ex)=>`<label class="pe-pick">${lab}<select onchange="peSet('${k}',+this.value)">${skill.filter(i=>i!==ex).map(i=>`<option value="${i}" ${v==i?'selected':''}>${posN(i)}</option>`).join('')}</select></label>`;
 const T=PE_TR.filter(t=>!t.nw||feat('trick2')),tags=typeof TAGS!='undefined'&&feat('tags')?TAGS:[],tg=typeof offTags=='function'?offTags(PE.n):((typeof PTAG!='undefined'&&PTAG[PE.n])||[]);
 $('pe-side').innerHTML=`<div class="pe-card"><div class="pe-ct">Selected: <b>${q?posN(PE.sel):'nobody'}</b></div>
  ${q&&(PE.sel<6||pl.run)?`<div class="pe-rts">${Object.keys(PE_RT).map(k=>`<button onclick="peRoute('${k}')" title="${k}">${svg(PE_RT[k].map(([a,b])=>[a,b*(q[1]<26.5?1:-1)]))}<span>${k}</span></button>`).join('')}</div>`:'<p class="small dim">Linemen block. Use the Block tool to give him a defender, or leave him on his own.</p>'}
  <div class="pe-row">${q&&q[2].length?'<button onclick="peClr(2)">Clear route</button>':''}${q&&q[4]&&q[4].length?'<button onclick="peClr(4)">Clear motion</button>':''}${q&&q[3]>=0?'<button onclick="peClr(3)">Clear block</button>':''}</div></div>
  <div class="pe-card"><div class="pe-ct">Play</div><div class="pe-seg"><button class="${!pl.run?'on':''}" onclick="peType(0)">Pass</button><button class="${pl.run?'on':''}" onclick="peType(1)">Run</button></div>
  ${pl.run||tr=='flea'||tr=='hbp'||tr=='rev'?pick('ho',pl.ho||5,'Hand off to'):''}</div>
  <div class="pe-card"><div class="pe-ct">Trick play</div>${T.map(t=>`<button class="pe-tr ${tr==t.k?'on':''}" onclick="peTr('${t.k}')"><b>${t.n}</b>${t.k?`<i>${t.t?'run':'pass'}</i>`:''}<span>${t.d}</span></button>`).join('')}
  ${tr=='rev'?pick('rev',pl.rev,'Takes the reverse',pl.ho||5):''}${tr=='wrp'?pick('wrp',pl.wrp,'Throws the ball'):''}${tr=='hkl'?pick('hkl0',pl.hkl[0],'Catches')+pick('hkl1',pl.hkl[1],'Trails him',pl.hkl[0]):''}</div>
  ${tags.length?`<div class="pe-card"><div class="pe-ct">Tags <span class="small dim">(Suggest picks tagged plays)</span></div><div class="pe-row">${tags.map(k=>`<button class="${tg.includes(k)?'on':''}" onclick="peTag('${k}')">${k}</button>`).join('')}</div></div>`:''}`;
 pedraw()}
function peOpen(n){if(PE.dirty&&!PE.warned){PE.warned=1;PE.msg='You have unsaved changes. Click the play again to leave them, or Save first.';PE.wantN=n;return peUI()}PE.warned=0;peLoad(n);$('pe-nm').value=PE.nm;peUI()}
function peNew(){PE.warned=0;const p=PRE.Slants?clone(PRE.Slants):clone(PE.pl);p.p.forEach(q=>{q[2]=[];q[3]=-1;q[4]=null});['pa','flea','hbp','rpo','opt','rev','wrp','hkl'].forEach(k=>delete p[k]);p.run=0;p.ho=5;
 let i=1;while(allP()['My play '+i])i++;PE.n='My play '+i;PE.nm=PE.n;PE.pl=p;PE.sel=1;PE.hist=[];PE.dirty=1;PE.mode='route';PE.msg='';$('pe-nm').value=PE.nm;peUI()}
function peUndo(){const s=PE.hist.pop();if(s){PE.pl=JSON.parse(s);PE.dirty=1}peUI()}
function peFlip(){pePush();PE.pl.p.forEach(q=>{q[1]=53-q[1];q[2]=q[2].map(([a,b])=>[a,-b]);if(q[4])q[4]=q[4].map(([a,b])=>[a,-b])});peUI()}
function peRoute(k){const q=PE.pl.p[PE.sel];if(!q)return;pePush();const m=q[1]<26.5?1:-1;q[2]=PE_RT[k].map(([a,b])=>[a,b*m]);peUI()}
function peClr(i){const q=PE.pl.p[PE.sel];if(!q)return;pePush();if(i==2)q[2]=[];if(i==4)q[4]=null;if(i==3)q[3]=-1;peUI()}
function peType(r){const pl=PE.pl,t=PE_TR.find(x=>x.k==peTrick(pl));pePush();pl.run=r;if(t&&t.k&&t.t!==r)peClrTr();peUI()}
function peClrTr(){['pa','flea','hbp','rpo','opt','rev','wrp','hkl'].forEach(k=>delete PE.pl[k])}
function peTr(k){const pl=PE.pl,t=PE_TR.find(x=>x.k==k);pePush();peClrTr();if(k){pl.run=t.t;if(k=='rev'){const h=pl.ho||5;pl.rev=h==2?1:2}else if(k=='wrp')pl.wrp=1;else if(k=='hkl')pl.hkl=[2,3];else pl[k]=1;
  if((k=='flea'||k=='hbp'||k=='rev'||k=='rpo'||k=='opt')&&!pl.ho)pl.ho=5}peUI()}
function peSet(k,v){const pl=PE.pl;pePush();if(k=='ho'){pl.ho=v;if(pl.rev==v)pl.rev=v==2?1:2}else if(k=='rev')pl.rev=v;else if(k=='wrp')pl.wrp=v;else if(k=='hkl0'){pl.hkl=[v,pl.hkl[1]==v?(v==3?2:3):pl.hkl[1]]}else if(k=='hkl1')pl.hkl=[pl.hkl[0],v];peUI()}
function peTag(k){if(typeof PTAG=='undefined')return;const a=PTAG[PE.n]=PTAG[PE.n]||[],i=a.indexOf(k);if(i<0)a.push(k);else a.splice(i,1);lsSet('gdtags',JSON.stringify(PTAG));peUI()}
function peName(){return String(PE.nm||'').replace(/[^\w &'-]/g,'').trim().slice(0,18)}
function peSave(asNew){let n=peName();if(!n){PE.msg='Give the play a name first.';return peUI()}
 if(asNew&&n==PE.n){let i=2;while(allP()[n+' '+i])i++;n=(n.slice(0,15)+' '+i).trim()}
 if(!CP[n]&&PRE[n]){PE.msg=`"${n}" is a stock play. Pick a different name (or use Save as new).`;return peUI()}
 if(PE.n!==n&&CP[PE.n]&&!asNew)delete CP[PE.n];
 CP[n]=clone(PE.pl);lsSet('gd2p',JSON.stringify(CP));if(typeof PTAG!='undefined'&&PE.n!==n){const t0=typeof offTags=='function'?offTags(PE.n):PTAG[PE.n];if(t0&&t0.length&&!PTAG[n]){PTAG[n]=t0.slice();lsSet('gdtags',JSON.stringify(PTAG))}}
 PE.n=n;PE.nm=n;PE.dirty=0;PE.warned=0;PE.msg='';$('pe-nm').value=n;peUI();peToast('Saved "'+n+'"')}
function peDel(){if(!CP[PE.n])return;if(PE.delAsk!==PE.n){PE.delAsk=PE.n;PE.msg='Click Delete again to remove "'+PE.n+'" for good.';return peUI()}delete CP[PE.n];lsSet('gd2p',JSON.stringify(CP));PE.delAsk=null;peLoad(PRE.Slants?'Slants':Object.keys(allP())[0]);$('pe-nm').value=PE.nm;peUI();peToast('Deleted')}
function peDone(){if(PE.dirty){let n=peName()||PE.n;if(!CP[n]&&PRE[n])n=('My '+n).slice(0,18);let i=2;const b=n;while(PRE[n]&&!CP[n])n=b+' '+i++;CP[n]=clone(PE.pl);lsSet('gd2p',JSON.stringify(CP));PE.n=n;PE.nm=n;PE.dirty=0}
 PE.prev=null;if(G.live&&G.phase=='pre'&&G.poss=='U'&&allP()[PE.n])applyPlay(PE.n);return lobby()}
function peToast(t){const el=document.createElement('div');el.className='pe-toast';el.textContent=t;$('pe')&&$('pe').appendChild(el);setTimeout(()=>el.remove(),1600)}
addEventListener('keydown',e=>{if(!$('pe')||$('modal').hidden)return;const tg=e.target&&e.target.tagName;if(tg=='INPUT'||tg=='SELECT')return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=='z'){e.preventDefault();e.stopImmediatePropagation();peUndo()}
 else if(e.key=='Backspace'||e.key=='Delete'){const q=PE.pl.p[PE.sel];if(q&&q[2].length){e.preventDefault();e.stopImmediatePropagation();pePush();q[2].pop();peUI()}}},true);
// preview: players run the play (motion, then routes; the line steps up or sets; the QB drops or hands off)
function pePrev(){PE.prev=PE.prev?null:{t0:performance.now()};const b=$('pe-pv');if(b)b.innerHTML=PE.prev?'&#9632; Stop':'&#9654; Preview';if(PE.prev)requestAnimationFrame(pePrevTick)}
function pePrevTick(){if(!PE||!PE.prev||!$('pe-cv'))return;pedraw();if((performance.now()-PE.prev.t0)/1000>4.4){PE.prev.t0=performance.now()}requestAnimationFrame(pePrevTick)}
function pePath(q,i,pl){const pts=[[q[0],q[1]]];(q[4]||[]).forEach(w=>pts.push([q[0]+Math.min(w[0],-.5-q[0]),q[1]+w[1]]));const mo=pts.length-1,s0=pts[pts.length-1];
 if(i==0){if(pl.run&&(pl.ho||5)!==0){pts.push([q[0]-1.5,q[1]])}else pts.push([q[0]-5,q[1]])}
 else if(i>=6){pts.push([q[0]+(pl.run?1.5:-1),q[1]])}
 else if(pl.run&&i==(pl.ho||5)){pts.push([-4,26.5+(q[1]-26.5)*.2]);pts.push([4,26.5+(q[1]>26.5?3:-3)]);pts.push([10,26.5+(q[1]>26.5?5:-5)])}
 else q[2].forEach(w=>pts.push([s0[0]+w[0],s0[1]+w[1]]));return{pts,mo}}
function pePos(path,t){const{pts,mo}=path;let tt=t;const sp=(k)=>k<mo?4.5:7;for(let k=1;k<pts.length;k++){const a=pts[k-1],b=pts[k],L=Math.hypot(b[0]-a[0],b[1]-a[1]),dur=L/sp(k-1);if(tt<=dur)return[a[0]+(b[0]-a[0])*tt/(dur||1),a[1]+(b[1]-a[1])*tt/(dur||1)];tt-=dur}return pts[pts.length-1]}
function pedraw(){if(!peCv)return;const g=peCv.getContext('2d');g.setTransform(2,0,0,2,0,0);const X=peSx,Y=peSy,K=PE_K,pl=PE.pl;
 // field: stripes, yard lines, hashes, numbers
 g.fillStyle='#2f7d36';g.fillRect(0,0,PE_W,PE_H);for(let x=Math.ceil(PE_BOT/5)*5;x<PE_TOP;x+=5){if(((x/5)|0)%2==0){g.fillStyle='#2a7331';g.fillRect(0,Y(x+5),PE_W,5*K)}}
 g.strokeStyle='#ffffff55';g.lineWidth=1;for(let x=Math.ceil(PE_BOT);x<=PE_TOP;x++){const yy=Y(x);if(x%5==0){g.strokeStyle=x==0?'#ffffff00':'#ffffff70';g.lineWidth=1.2;g.beginPath();g.moveTo(X(0),yy);g.lineTo(X(53.3),yy);g.stroke()}
  else{g.strokeStyle='#ffffff40';g.lineWidth=1;[[0,.8],[22.9,23.9],[29.4,30.4],[52.5,53.3]].forEach(([a,b])=>{g.beginPath();g.moveTo(X(a),yy);g.lineTo(X(b),yy);g.stroke()})}}
 g.fillStyle='#ffffff70';g.font='bold 13px "Trebuchet MS",sans-serif';g.textAlign='center';for(let x=5;x<PE_TOP;x+=5){if(x==10)continue;g.save();g.translate(X(4),Y(x));g.rotate(-Math.PI/2);g.fillText('+'+x,0,4);g.restore();g.save();g.translate(X(49.3),Y(x));g.rotate(Math.PI/2);g.fillText('+'+x,0,4);g.restore()}
 g.fillStyle='rgba(15,23,42,.18)';g.fillRect(0,Y(-.4),PE_W,PE_H);
 g.strokeStyle='#ffd84d';g.lineWidth=2;g.setLineDash([8,6]);g.beginPath();g.moveTo(X(0),Y(10));g.lineTo(X(53.3),Y(10));g.stroke();g.setLineDash([]);
 g.strokeStyle='#4aa3ff';g.lineWidth=3;g.beginPath();g.moveTo(X(0),Y(0));g.lineTo(X(53.3),Y(0));g.stroke();
 g.font='bold 9px sans-serif';g.textAlign='left';g.fillStyle='#4aa3ff';g.fillText('LOS',X(.3),Y(0)-4);g.fillStyle='#ffd84d';g.fillText('1ST',X(.3),Y(10)-4);
 // defenders (ghosts, as V shapes)
 const blk=PE.mode=='block';FDX.forEach((x,j)=>{const sx=X(FDY[j]),sy=Y(x),hot=blk;g.strokeStyle=hot?'#ff8a8a':'#ff6b6baa';g.lineWidth=hot?3:2.2;g.beginPath();g.moveTo(sx-7,sy-6);g.lineTo(sx,sy+6);g.lineTo(sx+7,sy-6);g.stroke();
  g.fillStyle='#ffb4b4cc';g.font='bold 9px sans-serif';g.textAlign='center';g.fillText(PD[j],sx,sy-10)});
 const arrow=(a,b,col,w,dash)=>{g.strokeStyle=col;g.fillStyle=col;g.lineWidth=w;g.setLineDash(dash||[]);g.lineJoin='round';g.lineCap='round';g.beginPath();a.forEach((p,k)=>k?g.lineTo(X(p[1]),Y(p[0])):g.moveTo(X(p[1]),Y(p[0])));g.stroke();g.setLineDash([]);
  if(a.length>1){const p=a[a.length-1],o=a[a.length-2],ang=Math.atan2(Y(p[0])-Y(o[0]),X(p[1])-X(o[1]));g.beginPath();g.moveTo(X(p[1]),Y(p[0]));g.lineTo(X(p[1])-Math.cos(ang-.45)*10,Y(p[0])-Math.sin(ang-.45)*10);g.lineTo(X(p[1])-Math.cos(ang+.45)*10,Y(p[0])-Math.sin(ang+.45)*10);g.closePath();g.fill()}};
 const tr=peTrick(pl),ho=pl.ho||5;
 // assignments
 pl.p.forEach((q,i)=>{const s=i==PE.sel;
  if(q[3]>=0&&FDX[q[3]]!=null){const ax=X(q[1]),ay=Y(q[0]),bx=X(FDY[q[3]]),by=Y(FDX[q[3]]),an=Math.atan2(by-ay,bx-ax),ex=bx-Math.cos(an)*9,ey=by-Math.sin(an)*9;g.strokeStyle=s?'#ffd84d':'#fca5a5';g.lineWidth=2.4;g.beginPath();g.moveTo(ax,ay);g.lineTo(ex,ey);g.stroke();
   g.beginPath();g.moveTo(ex-Math.sin(an)*7,ey+Math.cos(an)*7);g.lineTo(ex+Math.sin(an)*7,ey-Math.cos(an)*7);g.stroke()}
  if(q[4]&&q[4].length){const pts=[[q[0],q[1]]].concat(q[4].map(w=>[q[0]+Math.min(w[0],-.5-q[0]),q[1]+w[1]]));arrow(pts,0,'#ff9f43',2.6,[3,5])}
  const s0=peStart(q);if(q[2].length&&(i<6||pl.run)&&!(pl.run&&i==ho&&!tr)){const pts=[s0].concat(q[2].map(w=>[s0[0]+w[0],s0[1]+w[1]]));arrow(pts,0,s?'#ffd84d':'#ffffffe6',s?3.4:2.6);
   if(s)q[2].forEach(w=>{g.fillStyle='#0b1410';g.strokeStyle='#ffd84d';g.lineWidth=2;g.beginPath();g.arc(X(s0[1]+w[1]),Y(s0[0]+w[0]),4.5,0,7);g.fill();g.stroke()})}
  if(s&&q[4])q[4].forEach(w=>{g.fillStyle='#0b1410';g.strokeStyle='#ff9f43';g.lineWidth=2;g.beginPath();g.arc(X(q[1]+w[1]),Y(q[0]+Math.min(w[0],-.5-q[0])),4.5,0,7);g.fill();g.stroke()})});
 // run: the handoff path
 if(pl.run&&pl.p[ho]&&pl.p[0]){const q=pl.p[0],r=pl.p[ho],s0=peStart(r);arrow([[s0[0],s0[1]],[-3.5,26.5+(s0[1]-26.5)*.25],[3,26.5+(s0[1]>26.5?3:-3)],[8,26.5+(s0[1]>26.5?5:-5)]],0,'#7dd3fc',3,[10,5]);
  g.fillStyle='#7dd3fc';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText('HANDOFF',X(26.5+(s0[1]>26.5?7:-7)),Y(8)-6)}
 // trick play markers
 const tag=(i,t)=>{const q=pl.p[i];if(!q)return;const sx=X(q[1]),sy=Y(q[0])+22;g.font='bold 9px sans-serif';const w=g.measureText(t).width+10;g.fillStyle='#a855f7';g.beginPath();g.roundRect?g.roundRect(sx-w/2,sy-9,w,13,6):g.rect(sx-w/2,sy-9,w,13);g.fill();g.fillStyle='#fff';g.textAlign='center';g.fillText(t,sx,sy+1)};
 if(tr=='rev')tag(pl.rev,'REVERSE');if(tr=='wrp')tag(pl.wrp,'THROWS');if(tr=='hkl'){tag(pl.hkl[0],'CATCH');tag(pl.hkl[1],'TRAILS')}if(tr=='flea'||tr=='hbp')tag(ho,tr=='flea'?'PITCH BACK':'THROWS');if(tr=='pa')tag(0,'FAKE');if(tr=='opt')tag(0,'READ');if(tr=='rpo')tag(0,'RPO');
 // players (or the preview)
 const pv=PE.prev?(performance.now()-PE.prev.t0)/1000-.4:null;
 pl.p.forEach((q,i)=>{let x=q[0],y=q[1];if(pv!=null&&pv>0){const p=pePos(pePath(q,i,pl),pv);x=p[0];y=p[1]}const s=i==PE.sel&&pv==null,sx=X(y),sy=Y(x),r=i>=6?9:10.5;
  g.fillStyle='#00000055';g.beginPath();g.ellipse(sx+1.5,sy+2.5,r,r*.8,0,0,7);g.fill();
  g.fillStyle=i==0?'#f8fafc':i>=6?'#1e3a8a':'#2563eb';g.strokeStyle=s?'#ffd84d':'#0b1410';g.lineWidth=s?3.5:1.5;g.beginPath();g.arc(sx,sy,r,0,7);g.fill();g.stroke();
  if(s){g.strokeStyle='#ffd84d55';g.lineWidth=6;g.beginPath();g.arc(sx,sy,r+5,0,7);g.stroke()}
  g.fillStyle=i==0?'#0b1410':'#fff';g.font=`bold ${i>=6?8:9}px sans-serif`;g.textAlign='center';g.fillText(PO[i]=='QB'?'QB':PO[i],sx,sy+3);
  if(i>0&&i<6){g.fillStyle='#ffd84d';g.font='bold 9px sans-serif';g.fillText(i,sx+r+2,sy-r+3)}});
 if(pv!=null&&pv<0){g.fillStyle='#0008';g.fillRect(X(20),Y(28),X(33.3)-X(20),24);g.fillStyle='#fff';g.font='bold 13px sans-serif';g.textAlign='center';g.fillText('Hut... hut!',X(26.65),Y(28)+16)}}
let peCssOn=0;function peCss(){if(peCssOn)return;peCssOn=1;const s=document.createElement('style');s.textContent=`
#pe{display:flex;flex-direction:column;gap:8px;height:calc(100vh - 32px);max-width:1500px;margin:0 auto;color:#e8f0ea;font-family:"Trebuchet MS",sans-serif}
#pe .pe-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#0b1410;border:1px solid #ffffff1f;border-radius:12px;padding:8px 10px}
#pe .pe-top button{padding:7px 12px;border-radius:8px;border:1px solid #ffffff2a;background:#1f2937;color:#e8f0ea;font:700 13px "Trebuchet MS",sans-serif;cursor:pointer}#pe .pe-top button:hover{background:#334155}
#pe .pe-top .pe-pri{background:#16a34a;border-color:#16a34a}#pe .pe-top .pe-pri:hover{background:#15803d}#pe .pe-top .pe-x{background:transparent}
#pe-nm{font:800 20px "Trebuchet MS",sans-serif;background:transparent;border:0;border-bottom:2px dashed #ffffff40;color:#fff;width:230px;padding:2px 4px}#pe-nm:focus{outline:none;border-bottom-color:#ffd84d}
#pe .pe-sp{flex:1}#pe .pe-chip{font-style:normal;font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:#334155;color:#cbd5e1}
#pe .pe-pass{background:#1d4ed8;color:#dbeafe}#pe .pe-run{background:#15803d;color:#dcfce7}#pe .pe-trick{background:#7e22ce;color:#f3e8ff}
#pe .pe-body{flex:1;display:grid;grid-template-columns:190px minmax(0,1fr) 300px;gap:10px;min-height:0}
#pe .pe-list,#pe .pe-side{overflow:auto;background:#0b1410cc;border:1px solid #ffffff1a;border-radius:12px;padding:8px}
#pe .pe-lh{font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#9fb5a8;margin:10px 4px 4px}
#pe .pe-li{display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%;text-align:left;padding:6px 8px;margin:2px 0;border-radius:8px;border:1px solid transparent;background:transparent;color:#e8f0ea;cursor:pointer;font:600 13px "Trebuchet MS",sans-serif}
#pe .pe-li:hover{background:#ffffff10}#pe .pe-li.on{background:#ffd84d22;border-color:#ffd84d88}#pe .pe-li b{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pe .pe-new{width:100%;padding:8px;border-radius:8px;border:1px dashed #ffd84d99;background:#ffd84d14;color:#ffd84d;font:800 13px "Trebuchet MS",sans-serif;cursor:pointer}
#pe .pe-mid{display:flex;flex-direction:column;align-items:center;gap:6px;min-height:0}
#pe .pe-tools{display:flex;gap:4px;background:#0b1410;border:1px solid #ffffff1f;border-radius:10px;padding:4px}
#pe .pe-tools button{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:7px;border:0;background:transparent;color:#cbd5e1;font:700 13px "Trebuchet MS",sans-serif;cursor:pointer}#pe .pe-tools button span{font-size:15px}
#pe .pe-tools button.on{background:#ffd84d;color:#0b1410}
#pe-cv{flex:1;min-height:0;max-width:100%;aspect-ratio:${PE_W}/${PE_H};height:auto;max-height:100%;border-radius:10px;box-shadow:0 6px 24px #0008;touch-action:none}
#pe .pe-hint{font-size:12px;color:#b6c8bc;text-align:center;max-width:640px;min-height:30px}#pe .pe-warn{color:#fca5a5}
#pe .pe-card{background:#ffffff08;border:1px solid #ffffff17;border-radius:10px;padding:8px 9px;margin-bottom:8px}#pe .pe-ct{font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#9fb5a8;margin-bottom:6px}#pe .pe-ct b{color:#ffd84d;text-transform:none;font-size:13px;letter-spacing:0}
#pe .pe-rts{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}#pe .pe-rts button{display:flex;flex-direction:column;align-items:center;gap:1px;padding:4px 2px;border-radius:7px;border:1px solid #ffffff1a;background:#ffffff08;color:#e8f0ea;cursor:pointer;font:600 10px sans-serif}
#pe .pe-rts button:hover{background:#ffd84d22;color:#ffd84d}#pe .pe-row{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}#pe .pe-row button,#pe .pe-seg button{padding:5px 9px;border-radius:7px;border:1px solid #ffffff2a;background:#1f2937;color:#e8f0ea;font:700 12px sans-serif;cursor:pointer}
#pe .pe-row button.on{background:#ffd84d;color:#0b1410}#pe .pe-seg{display:flex;gap:0}#pe .pe-seg button{flex:1;border-radius:0}#pe .pe-seg button:first-child{border-radius:7px 0 0 7px}#pe .pe-seg button:last-child{border-radius:0 7px 7px 0}#pe .pe-seg button.on{background:#ffd84d;color:#0b1410}
#pe .pe-pick{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:12px;margin-top:6px}#pe .pe-pick select{padding:3px 6px;border-radius:6px;background:#f8fafc;color:#0b1410;font-weight:700}
#pe .pe-tr{display:block;width:100%;text-align:left;padding:6px 8px;margin:3px 0;border-radius:8px;border:1px solid #ffffff14;background:transparent;color:#e8f0ea;cursor:pointer;font-family:"Trebuchet MS",sans-serif}
#pe .pe-tr b{font-size:13px}#pe .pe-tr i{float:right;font-style:normal;font-size:9px;font-weight:800;text-transform:uppercase;color:#9fb5a8}#pe .pe-tr span{display:block;font-size:11px;color:#9fb5a8;margin-top:1px}
#pe .pe-tr:hover{background:#ffffff0c}#pe .pe-tr.on{background:#a855f722;border-color:#a855f7}#pe .pe-tr.on b{color:#e9d5ff}
#pe .pe-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#16a34a;color:#fff;font-weight:800;padding:8px 16px;border-radius:999px;box-shadow:0 6px 20px #0008;z-index:60}
@media (max-width:1100px){#pe .pe-body{grid-template-columns:150px minmax(0,1fr) 250px}}
@media (max-width:800px){#pe{height:auto}#pe .pe-body{grid-template-columns:1fr}#pe-cv{width:100%}}
/* defensive editor, tidied up */
#ed #edt{background:#0b1410;border:1px solid #ffffff1f;border-radius:12px;padding:8px;gap:5px}#ed #edt button{border-radius:8px}#ed #edt button.on{background:#ffd84d;color:#0b1410}
#ed #edt .de-g{display:flex;flex-wrap:wrap;gap:4px;align-items:center;width:100%;justify-content:center}#ed #edt .de-l{font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#9fb5a8;margin-right:4px}
#ed canvas{border-radius:10px;box-shadow:0 6px 24px #0008}
#pe .pe-card p{font-size:12px;line-height:1.35;color:#9fb5a8;margin:6px 0 0}#pe .pe-pick input[type=range]{flex:1}`;s.textContent+=s.textContent.replace(/#pe/g,'#pd');document.head.appendChild(s)}
// ---------- defensive editor: grouped toolbar and a cleaner field ----------
{const _du=deUI;deUI=function(){_du();try{if(!feat('ed2'))return;peCss();const t=$('edt');if(!t)return;const bs=[...t.children].filter(e=>e.tagName=='BUTTON'),ex=[...t.querySelectorAll('.edx')];
 const g=(l,f)=>{const d=document.createElement('div');d.className='de-g';d.innerHTML=`<span class="de-l">${l}</span>`;bs.filter(f).forEach(b=>d.appendChild(b));return d};
 const a=g('Defenses',b=>b.dataset.de=='load'),b2=g('Tools',b=>['mode','rush','zm','zp','fm'].includes(b.dataset.de)),c=g('',b=>['save','del','done'].includes(b.dataset.de));t.innerHTML='';[a,b2,c].forEach(x=>t.appendChild(x));ex.forEach(x=>t.appendChild(x))}catch(e){console.error(e)}}}
{const _dd=dedraw;dedraw=function(){if(!feat('ed2'))return _dd();const cv=$('dcv');if(!cv)return _dd();const g=cv.getContext('2d'),ex=x=>300+x*S,of=g.fillRect;
 for(let x=-30;x<70;x+=5){g.fillStyle=((x/5)&1)?'#2a7331':'#2f7d36';g.fillRect(ex(x),0,5*S,H)}
 g.fillRect=function(x,y,w,h){if(x===0&&y===0&&w>=900){g.fillRect=of;return}return of.call(g,x,y,w,h)};try{_dd()}finally{g.fillRect=of}
 g.fillStyle='#4aa3ff';g.font='bold 10px sans-serif';g.textAlign='left';g.fillText('LINE OF SCRIMMAGE',ex(0)+4,12)}}
