'use strict';
// Defense designer, built like the offense one: playbook-style field (defense on top, the offense's receivers as ghosts),
// a defense list, tools (Move, Rush, Man, Zone), drag-able zone circles, a side panel for each defender's job
// (rush, stunt, man, zone, QB spy), undo, flip, and a preview that shows the coverage reacting to routes.
let DZ=null,pdCv=null;const pdOld=deditor;
const PD_JOB={r:'Rush',m:'Man',z:'Zone',s:'QB spy'};
const pdKind=pl=>{const p=pl.p,r=p.filter(q=>q[2]=='r').length,m=p.filter(q=>q[2]=='m').length,z=p.filter(q=>q[2]=='z').length;return r>=5?'Blitz':m>z?'Man':'Zone'};
const pdRecv=i=>`${PO[i]} ${i}`;
function pdPush(){DZ.hist.push(JSON.stringify(DZ.pl));if(DZ.hist.length>60)DZ.hist.shift();DZ.dirty=1}
function pdLoad(n){const pl=DALL()[n];if(!pl)return;DZ.n=n;DZ.nm=n;DZ.pl=clone(pl);DZ.sel=7;DZ.hist=[];DZ.dirty=0;DZ.prev=null;DZ.msg=''}
const pdZr=q=>q[2]=='z'?zrOf(q):0;
deditor=function(){if(!feat('ed2'))return pdOld();if(!DZ){DZ={n:'Cover 2 Zone',mode:'move',hist:[]};pdLoad(DALL()['Cover 2 Zone']?'Cover 2 Zone':Object.keys(DALL())[0])}
 peCss();$('modal').hidden=0;$('modal').innerHTML=`<div id="pd"><div class="pe-top"><button class="pe-x" onclick="pdDone()">&larr; Done</button><input id="pd-nm" maxlength="18" spellcheck="false" value="${esc(DZ.nm)}" oninput="DZ.nm=this.value"><span id="pd-kind"></span><span class="pe-sp"></span>
  <button onclick="pdUndo()" title="Undo (Ctrl+Z)">&#8630; Undo</button><button onclick="pdFlip()" title="Mirror the defense left to right">&#8646; Flip</button><button onclick="pdPrev()" id="pd-pv">&#9654; Preview</button><button class="pe-pri" onclick="pdSave(0)">Save</button><button onclick="pdSave(1)">Save as new</button><button id="pd-del" onclick="pdDel()">Delete</button></div>
  <div class="pe-body"><div class="pe-list" id="pd-list"></div><div class="pe-mid"><div class="pe-tools" id="pd-tools"></div><canvas id="pd-cv"></canvas><div class="pe-hint" id="pd-hint"></div></div><div class="pe-side" id="pd-side"></div></div></div>`;
 pdCv=$('pd-cv');pdCv.width=PE_W*2;pdCv.height=PE_H*2;
 const ep=e=>{const r=pdCv.getBoundingClientRect(),sx=(e.clientX-r.left)/r.width*PE_W,sy=(e.clientY-r.top)/r.height*PE_H;return[PE_TOP-(sy-PE_PY)/PE_K,(sx-PE_PX)/PE_K]},sn=v=>Math.round(v*2)/2;
 pdCv.onpointerdown=e=>{if(DZ.prev)pdPrev();const[x,y]=ep(e),D=DZ.pl.p,q=D[DZ.sel];let hit=-1,hd=1.4;D.forEach((o,i)=>{const dd=Math.hypot(o[0]-x,o[1]-y);if(dd<hd){hd=dd;hit=i}});
  // zone ring edge (resize) or zone center (move) of the selected defender
  if(q&&q[2]=='z'){const cx=q[3][0],cy=q[3][1],dz=Math.hypot(x-cx,y-cy),zr=zrOf(q);if(Math.abs(dz-zr)<1.1){pdPush();DZ.drag={k:'zr'};return}if(dz<1.3&&hit<0){pdPush();DZ.drag={k:'zc'};return}}
  if(DZ.mode=='rush'){if(hit>=0){pdPush();DZ.sel=hit;D[hit][2]='r';D[hit].length=3}return pdUI()}
  if(DZ.mode=='man'){let j=-1,jd=1.8;[1,2,3,4,5].forEach(k=>{const dd=Math.hypot(FOX[k]-x,FOY[k]-y);if(dd<jd){jd=dd;j=k}});if(hit>=0&&hd<=jd)j=-1;
   if(j>0&&q){pdPush();q[2]='m';q[3]=j;q.length=4}else if(hit>=0)DZ.sel=hit;return pdUI()}
  if(hit>=0){DZ.sel=hit;if(DZ.mode=='move'){pdPush();DZ.drag={k:'p'}}return pdUI()}
  if(DZ.mode=='zone'&&q){if(x<.5){DZ.msg='Zones go on the defense side of the line.';return pdUI()}pdPush();const keep=q[2]=='z'?q[4]:undefined;q[2]='z';q[3]=[sn(clamp(x,.5,40)),sn(clamp(y,1,52))];q.length=4;if(keep)q[4]=keep;DZ.drag={k:'zc'};return pdUI()}
  pdUI()};
 pdCv.onpointermove=e=>{const[x,y]=ep(e),q=DZ.pl.p[DZ.sel];if(!DZ.drag||!q){pdCv.style.cursor=DZ.pl.p.some(o=>Math.hypot(o[0]-x,o[1]-y)<1.4)?'pointer':DZ.mode=='zone'?'crosshair':'default';return}
  if(DZ.drag.k=='p'){q[0]=clamp(sn(x),.5,30);q[1]=clamp(sn(y),1,52)}else if(DZ.drag.k=='zc'){q[3]=[sn(clamp(x,.5,40)),sn(clamp(y,1,52))]}else if(DZ.drag.k=='zr'){q[4]=clamp(Math.round(Math.hypot(x-q[3][0],y-q[3][1])),2,16)}pddraw()};
 pdCv.onpointerup=()=>{if(DZ.drag){DZ.drag=null;pdUI()}};pdCv.oncontextmenu=e=>e.preventDefault();
 pdUI()};
function pdUI(){if(!$('pd'))return;const pl=DZ.pl,q=pl.p[DZ.sel],all=DALL(),k=pdKind(pl);
 $('pd-kind').textContent=k+(DCP[DZ.n]?' · your defense':' · stock defense')+(DZ.dirty?' · unsaved':'');$('pd-kind').className='pe-chip pe-'+(k=='Blitz'?'trick':k=='Man'?'run':'pass');$('pd-del').style.display=DCP[DZ.n]?'':'none';
 const chip=n=>{const t=pdKind(all[n]);return`<i class="pe-chip pe-${t=='Blitz'?'trick':t=='Man'?'run':'pass'}">${t}</i>`};
 const sec=(t,ns)=>ns.length?`<div class="pe-lh">${t}</div>`+ns.map(n=>`<button class="pe-li ${n==DZ.n?'on':''}" onclick="pdOpen(this.dataset.n)" data-n="${esc(n)}"><b>${esc(n)}</b>${chip(n)}</button>`).join(''):'';
 const ns=Object.keys(all);$('pd-list').innerHTML=`<button class="pe-new" onclick="pdNew()">+ New defense</button>`+sec('Your defenses',ns.filter(n=>DCP[n]))+sec('Stock',ns.filter(n=>!DCP[n]));
 const tool=(m,ic,t)=>`<button class="${DZ.mode==m?'on':''}" onclick="DZ.mode='${m}';DZ.msg='';pdUI()"><span>${ic}</span>${t}</button>`;
 $('pd-tools').innerHTML=tool('move','&#10021;','Move')+tool('rush','&#10148;','Rush')+tool('man','&#9711;','Man')+tool('zone','&#9673;','Zone');
 const hints={move:'Drag defenders to line them up. Click one to see and change his job on the right.',rush:'Click a defender to send him after the quarterback.',
  man:'Pick a defender, then click the receiver (blue, numbered) he should cover.',zone:'Pick a defender, then click the field where his zone is. Drag the center to move it, drag the ring to make it bigger or smaller.'};
 $('pd-hint').innerHTML=DZ.msg?`<b class="pe-warn">${esc(DZ.msg)}</b>`:hints[DZ.mode];
 const job=q?q[2]:'',seg=(j,t)=>`<button class="${job==j?'on':''}" onclick="pdJob('${j}')">${t}</button>`;
 $('pd-side').innerHTML=`<div class="pe-card"><div class="pe-ct">Selected: <b>${q?PD_POS(DZ.sel):'nobody'}</b></div>
  ${q?`<div class="pe-seg">${seg('r','Rush')}${seg('m','Man')}${seg('z','Zone')}${seg('s','QB spy')}</div>
  ${job=='r'?`<div class="pe-row"><button class="${q[3]=='st'?'on':''}" onclick="pdStunt()">Stunt (loop inside first)</button></div><p class="small dim">He rushes the passer${q[3]=='st'?', looping inside before he goes':''}.</p>`:''}
  ${job=='m'?`<label class="pe-pick">Covers<select onchange="pdMan(+this.value)">${[1,2,3,4,5].map(i=>`<option value="${i}" ${q[3]==i?'selected':''}>${pdRecv(i)}</option>`).join('')}</select></label><p class="small dim">He sticks to his man wherever he goes.</p>`:''}
  ${job=='z'?`<label class="pe-pick">Zone size <input type="range" min="2" max="16" value="${zrOf(q)}" oninput="pdZone(+this.value)"><b id="pd-zr">${zrOf(q)} yd</b></label><p class="small dim">Zone ${Math.round(q[3][0])} yards deep. He reacts to anyone who enters the circle.</p>`:''}
  ${job=='s'?'<p class="small dim">He shadows the QB about 5 yards off the line and chases him if he runs.</p>':''}`:''}</div>
  <div class="pe-card"><div class="pe-ct">Whole defense</div><div class="pe-row"><button class="${pl.fm===0?'':'on'}" onclick="pdFm()">Match the offense's formation: ${pl.fm===0?'off':'on'}</button></div>
  <p class="small dim">On: defenders shift to line up over the receivers before the snap.</p>
  <div class="pe-row"><button onclick="pdAll('z')">Everyone back in zone</button><button onclick="pdAll('m')">Man across the board</button><button onclick="pdAll('r')">Send the house</button></div></div>
  <div class="pe-card"><div class="pe-ct">Jobs</div>${pl.p.map((d,i)=>`<button class="pe-li ${i==DZ.sel?'on':''}" onclick="DZ.sel=${i};pdUI()"><b>${PD_POS(i)}</b><i class="pe-chip">${PD_JOB[d[2]]||'?'}${d[2]=='m'?' · '+pdRecv(d[3]):d[2]=='r'&&d[3]=='st'?' · stunt':''}</i></button>`).join('')}</div>`;
 pddraw()}
const PD_POS=i=>`${PD[i]}`;
function pdOpen(n){if(DZ.dirty&&!DZ.warned){DZ.warned=1;DZ.msg='You have unsaved changes. Click the defense again to leave them, or Save first.';return pdUI()}DZ.warned=0;pdLoad(n);$('pd-nm').value=DZ.nm;pdUI()}
function pdNew(){DZ.warned=0;const p=clone(DALL()['Cover 2 Zone']||DZ.pl);let i=1;while(DALL()['My defense '+i])i++;DZ.n='My defense '+i;DZ.nm=DZ.n;DZ.pl=p;DZ.sel=7;DZ.hist=[];DZ.dirty=1;DZ.msg='';$('pd-nm').value=DZ.nm;pdUI()}
function pdUndo(){const s=DZ.hist.pop();if(s){DZ.pl=JSON.parse(s);DZ.dirty=1}pdUI()}
function pdFlip(){pdPush();DZ.pl.p.forEach(q=>{q[1]=53-q[1];if(q[2]=='z')q[3]=[q[3][0],53-q[3][1]];if(q[2]=='m'){const sw={1:2,2:1,3:3,4:4,5:5};q[3]=sw[q[3]]||q[3]}});pdUI()}
function pdJob(j){const q=DZ.pl.p[DZ.sel];if(!q)return;pdPush();if(j=='r'){q[2]='r';q.length=3}else if(j=='m'){q[2]='m';const near=[1,2,3,4,5].sort((a,b)=>Math.hypot(FOX[a]-q[0],FOY[a]-q[1])-Math.hypot(FOX[b]-q[0],FOY[b]-q[1]))[0];q[3]=near;q.length=4}
 else if(j=='z'){q[2]='z';q[3]=[Math.max(6,q[0]+4),q[1]];q.length=4}else if(j=='s'){q[2]='s';q.length=3}pdUI()}
function pdStunt(){const q=DZ.pl.p[DZ.sel];if(!q||q[2]!='r')return;pdPush();if(q[3]=='st')q.length=3;else q[3]='st';pdUI()}
function pdMan(j){const q=DZ.pl.p[DZ.sel];if(!q)return;pdPush();q[2]='m';q[3]=j;q.length=4;pdUI()}
function pdZone(v){const q=DZ.pl.p[DZ.sel];if(!q||q[2]!='z')return;if(!DZ.zs){pdPush();DZ.zs=1;setTimeout(()=>DZ.zs=0,600)}q[4]=v;const el=$('pd-zr');if(el)el.textContent=v+' yd';pddraw()}
function pdFm(){pdPush();DZ.pl.fm=DZ.pl.fm===0?1:0;pdUI()}
function pdAll(j){pdPush();DZ.pl.p.forEach((q,i)=>{if(j=='r'){if(i<7){q[2]='r';q.length=3}}else if(j=='m'){if(i>=4&&i<9){q[2]='m';q[3]={4:4,5:5,6:3,7:1,8:2}[i];q.length=4}}
 else if(j=='z'){if(i>=4){q[2]='z';q[3]=i>=9?[15,i==9?18:35]:i>=7?[6,i==7?8:45]:[7,[19,26.5,34][i-4]];q.length=4}else{q[2]='r';q.length=3}}});pdUI()}
function pdName(){return String(DZ.nm||'').replace(/[^\w &'-]/g,'').trim().slice(0,18)}
const pdSv=()=>lsSet('gd2d',JSON.stringify(DCP));
function pdSave(asNew){let n=pdName();if(!n){DZ.msg='Give the defense a name first.';return pdUI()}
 if(asNew&&n==DZ.n){let i=2;while(DALL()[n+' '+i])i++;n=(n.slice(0,15)+' '+i).trim()}
 if(!DCP[n]&&DPRE[n]){DZ.msg=`"${n}" is a stock defense. Pick a different name (or use Save as new).`;return pdUI()}
 if(DZ.n!==n&&DCP[DZ.n]&&!asNew)delete DCP[DZ.n];DCP[n]=clone(DZ.pl);pdSv();DZ.n=n;DZ.nm=n;DZ.dirty=0;DZ.warned=0;DZ.msg='';$('pd-nm').value=n;pdUI();pdToast('Saved "'+n+'"')}
function pdDel(){if(!DCP[DZ.n])return;if(DZ.delAsk!==DZ.n){DZ.delAsk=DZ.n;DZ.msg='Click Delete again to remove "'+DZ.n+'" for good.';return pdUI()}delete DCP[DZ.n];pdSv();DZ.delAsk=null;pdLoad('Cover 2 Zone');$('pd-nm').value=DZ.nm;pdUI();pdToast('Deleted')}
function pdDone(){if(DZ.dirty){let n=pdName()||DZ.n;if(!DCP[n]&&DPRE[n])n=('My '+n).slice(0,18);let i=2;const b=n;while(DPRE[n]&&!DCP[n])n=b+' '+i++;DCP[n]=clone(DZ.pl);pdSv();DZ.n=n;DZ.nm=n;DZ.dirty=0}
 DZ.prev=null;if(G.live&&G.phase=='pre'&&G.poss!='U'&&DALL()[DZ.n])applyDef(DZ.n);return lobby()}
function pdToast(t){const el=document.createElement('div');el.className='pe-toast';el.textContent=t;$('pd')&&$('pd').appendChild(el);setTimeout(()=>el.remove(),1600)}
addEventListener('keydown',e=>{if(!$('pd')||$('modal').hidden)return;const tg=e.target&&e.target.tagName;if(tg=='INPUT'||tg=='SELECT')return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=='z'){e.preventDefault();e.stopImmediatePropagation();pdUndo()}},true);
// preview: the offense runs Curls/Slants-style routes and the defense reacts
function pdPrev(){DZ.prev=DZ.prev?null:{t0:performance.now(),st:null};const b=$('pd-pv');if(b)b.innerHTML=DZ.prev?'&#9632; Stop':'&#9654; Preview';if(DZ.prev)requestAnimationFrame(pdPrevTick);else pddraw()}
function pdPrevTick(){if(!DZ||!DZ.prev||!$('pd-cv'))return;const now=performance.now(),t=(now-DZ.prev.t0)/1000;if(t>4.6){DZ.prev.t0=now;DZ.prev.st=null}pdSim(Math.min(.05,DZ.prev.lt?(now-DZ.prev.lt)/1000:.016));DZ.prev.lt=now;pddraw();requestAnimationFrame(pdPrevTick)}
function pdSim(dt){const pv=DZ.prev,t=(performance.now()-pv.t0)/1000-.4,pl=DZ.pl;
 if(!pv.st){const sp=PRE.Curls||PRE.Slants,O=FOX.map((x,i)=>({x,y:FOY[i],r:i>0&&i<6&&sp?sp.p[i][2].map(w=>[x+w[0],FOY[i]+w[1]]):[],ri:0}));pv.st={O,D:pl.p.map(q=>({x:q[0],y:q[1],q}))}}
 if(t<0)return;const{O,D}=pv.st,mv=(o,tx,ty,s)=>{const dx=tx-o.x,dy=ty-o.y,m=Math.hypot(dx,dy);if(m<.05)return;const k=Math.min(1,s*dt/m);o.x+=dx*k;o.y+=dy*k};
 O.forEach((o,i)=>{if(i==0)mv(o,-7,26.5,5);else if(i>=6)mv(o,-1.2,o.y,1.5);else if(o.ri<o.r.length){const w=o.r[o.ri];mv(o,w[0],w[1],7);if(Math.hypot(w[0]-o.x,w[1]-o.y)<.3)o.ri++}else mv(o,o.x+.5,o.y,2)});
 D.forEach(d=>{const q=d.q,j=q[2];if(j=='r'){const st=q[3]=='st'&&t<.5;mv(d,st?-.5:O[0].x,st?d.y+(d.y<26.5?1:-1)*2:O[0].y,st?4:5.5)}
  else if(j=='m'){const o=O[q[3]];if(o)mv(d,o.x+1,o.y,7.2)}
  else if(j=='s'){mv(d,5,O[0].y,5)}
  else if(j=='z'){const zx=q[3][0],zy=q[3][1],zr=zrOf(q),inZ=O.slice(1,6).filter(o=>Math.hypot(o.x-zx,o.y-zy)<zr).sort((a,b)=>Math.hypot(a.x-zx,a.y-zy)-Math.hypot(b.x-zx,b.y-zy))[0];
   if(inZ)mv(d,inZ.x+1,inZ.y,6.5);else mv(d,zx,zy,5)}})}
function pddraw(){if(!pdCv)return;const g=pdCv.getContext('2d');g.setTransform(2,0,0,2,0,0);const X=peSx,Y=peSy,K=PE_K,pl=DZ.pl;
 g.fillStyle='#2f7d36';g.fillRect(0,0,PE_W,PE_H);for(let x=Math.ceil(PE_BOT/5)*5;x<PE_TOP;x+=5){if(((x/5)|0)%2==0){g.fillStyle='#2a7331';g.fillRect(0,Y(x+5),PE_W,5*K)}}
 for(let x=Math.ceil(PE_BOT);x<=PE_TOP;x++){const yy=Y(x);if(x%5==0){if(x){g.strokeStyle='#ffffff70';g.lineWidth=1.2;g.beginPath();g.moveTo(X(0),yy);g.lineTo(X(53.3),yy);g.stroke()}}
  else{g.strokeStyle='#ffffff40';g.lineWidth=1;[[0,.8],[22.9,23.9],[29.4,30.4],[52.5,53.3]].forEach(([a,b])=>{g.beginPath();g.moveTo(X(a),yy);g.lineTo(X(b),yy);g.stroke()})}}
 g.fillStyle='#ffffff70';g.font='bold 13px "Trebuchet MS",sans-serif';g.textAlign='center';for(let x=5;x<PE_TOP;x+=5){g.save();g.translate(X(4),Y(x));g.rotate(-Math.PI/2);g.fillText('+'+x,0,4);g.restore();g.save();g.translate(X(49.3),Y(x));g.rotate(Math.PI/2);g.fillText('+'+x,0,4);g.restore()}
 g.fillStyle='rgba(15,23,42,.18)';g.fillRect(0,Y(-.4),PE_W,PE_H);g.strokeStyle='#4aa3ff';g.lineWidth=3;g.beginPath();g.moveTo(X(0),Y(0));g.lineTo(X(53.3),Y(0));g.stroke();
 g.font='bold 9px sans-serif';g.textAlign='left';g.fillStyle='#4aa3ff';g.fillText('LOS',X(.3),Y(0)-4);
 const pv=DZ.prev&&DZ.prev.st?DZ.prev.st:null;
 // offense ghosts
 FOX.forEach((x,i)=>{const o=pv?pv.O[i]:{x,y:FOY[i]},sx=X(o.y),sy=Y(o.x),man=DZ.mode=='man'&&i>0&&i<6;g.fillStyle=man?'#3b82f6':'#3b82f699';g.strokeStyle=man?'#bfdbfe':'#0b141066';g.lineWidth=man?2.5:1;g.beginPath();g.arc(sx,sy,i>=6?7:8.5,0,7);g.fill();g.stroke();
  g.fillStyle='#fff';g.font=`bold ${i>=6?7:8}px sans-serif`;g.textAlign='center';g.fillText(i>0&&i<6?i:PO[i],sx,sy+3)});
 if(pv)pv.O.forEach((o,i)=>{if(i>0&&i<6&&o.r.length){g.strokeStyle='#93c5fd55';g.lineWidth=1.5;g.setLineDash([4,4]);g.beginPath();g.moveTo(X(FOY[i]),Y(FOX[i]));o.r.forEach(w=>g.lineTo(X(w[1]),Y(w[0])));g.stroke();g.setLineDash([])}});
 // jobs
 pl.p.forEach((q,i)=>{const s=i==DZ.sel,sx=X(q[1]),sy=Y(q[0]);
  if(q[2]=='z'){const zx=X(q[3][1]),zy=Y(q[3][0]),zr=zrOf(q)*K;g.fillStyle=s?'#ffd84d22':'#93c5fd14';g.strokeStyle=s?'#ffd84d':'#93c5fdaa';g.lineWidth=s?2.5:1.5;g.setLineDash(s?[]:[5,4]);g.beginPath();g.arc(zx,zy,zr,0,7);g.fill();g.stroke();g.setLineDash([]);
   g.strokeStyle=s?'#ffd84d':'#93c5fd88';g.lineWidth=1.5;g.beginPath();g.moveTo(sx,sy);g.lineTo(zx,zy);g.stroke();g.fillStyle=s?'#ffd84d':'#93c5fd';g.beginPath();g.arc(zx,zy,3.5,0,7);g.fill();
   if(s){g.fillStyle='#ffd84d';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText(zrOf(q)+' yd',zx,zy-zr-4);g.beginPath();g.arc(zx+zr,zy,4.5,0,7);g.fill()}}
  if(q[2]=='m'&&FOX[q[3]]!=null){g.strokeStyle=s?'#ffd84d':'#facc15aa';g.lineWidth=s?3:2;g.setLineDash([2,4]);g.beginPath();g.moveTo(sx,sy);g.lineTo(X(FOY[q[3]]),Y(FOX[q[3]]));g.stroke();g.setLineDash([])}
  if(q[2]=='r'||q[2]=='s'){const tx=X(26.5),ty=Y(q[2]=='s'?5:-4),st=q[3]=='st';g.strokeStyle=q[2]=='s'?'#c084fc':s?'#ffd84d':'#fca5a5';g.fillStyle=g.strokeStyle;g.lineWidth=s?3:2.2;g.beginPath();g.moveTo(sx,sy);
   const mx=st?sx+(26.5-q[1]>0?1:-1)*24:(sx+tx)/2,my=st?sy+18:(sy+ty)/2;g.quadraticCurveTo(mx,my,tx+(sx-tx)*.15,ty+(sy-ty)*.15);g.stroke();const ex=tx+(sx-tx)*.15,ey=ty+(sy-ty)*.15,an=Math.atan2(ey-my,ex-mx);
   g.beginPath();g.moveTo(ex,ey);g.lineTo(ex-Math.cos(an-.45)*9,ey-Math.sin(an-.45)*9);g.lineTo(ex-Math.cos(an+.45)*9,ey-Math.sin(an+.45)*9);g.closePath();g.fill()}});
 // defenders
 pl.p.forEach((q,i)=>{const d=pv?pv.D[i]:{x:q[0],y:q[1]},s=i==DZ.sel&&!pv,sx=X(d.y),sy=Y(d.x);g.fillStyle='#00000055';g.beginPath();g.ellipse(sx+1.5,sy+2.5,10,8,0,0,7);g.fill();
  g.fillStyle=q[2]=='r'?'#dc2626':q[2]=='s'?'#9333ea':'#ef4444';g.strokeStyle=s?'#ffd84d':'#0b1410';g.lineWidth=s?3.5:1.5;g.beginPath();g.arc(sx,sy,10.5,0,7);g.fill();g.stroke();
  if(s){g.strokeStyle='#ffd84d55';g.lineWidth=6;g.beginPath();g.arc(sx,sy,15.5,0,7);g.stroke()}g.fillStyle='#fff';g.font='bold 9px sans-serif';g.textAlign='center';g.fillText(PD[i]||'',sx,sy+3)});
 if(pv&&(performance.now()-DZ.prev.t0)/1000<.4){g.fillStyle='#0008';g.fillRect(X(20),Y(28),X(33.3)-X(20),24);g.fillStyle='#fff';g.font='bold 13px sans-serif';g.textAlign='center';g.fillText('Hut... hut!',X(26.65),Y(28)+16)}}
