'use strict';
// Realism pack for basketball. Rim protection (you cannot run straight through a set defender, layups in traffic are
// harder and big men contest at the rim) and a play designer (drag your five players to their spots on a whiteboard,
// pick who screens and what the play looks for, and call it in games). Each part has its own switch.
{const add=[['On the court','paint','Rim protection','A defender who is set in front of you holds his ground, so go around him, cross him over (R) or use a screen (F). Layups and dunks through a crowd are harder, and big men contest at the rim.'],
 ['Playbook','pdes','Play designer','Design your own play on a whiteboard: drag your five players to their spots, choose who screens and what the play looks for. Call it with C in a game or from the Playbook.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
// ---------- rim protection ----------
// a defender who can hold his ground against this ball handler right now
const setDef=(d,e)=>!(d.stun>0)&&!(d.bite>0)&&d.z<=0;
{const _uc=userControls;userControls=function(e,dt){if(e.walled>0)e.walled-=dt;if(e.cd&&e.cd.strip>0)e.cd.strip-=dt;const r=_uc(e,dt);try{if(r&&feat('paint')&&G&&G.phase=='live'&&G.b.st=='held'&&G.b.h===e&&!(e.dash&&e.dash.t>0)){const sp=Math.hypot(e.tx,e.ty);if(sp>1&&Math.hypot(e.x-hoopX(G.dir[e.t]),e.y-25)<27){const ux=e.tx/sp,uy=e.ty/sp;let nw=0;
     onT(opp(e.t)).forEach(d=>{if(!setDef(d,e))return;if(d.vx*ux+d.vy*uy>7)return;const dx=d.x-e.x,dy=d.y-e.y,dd=Math.hypot(dx,dy);if(dd>2.9||dd<=0)return;const nx=dx/dd,ny=dy/dd,into=ux*nx+uy*ny;if(into<.45)return;
      // take away most of the speed that runs into him; what is left slides along him
      const cut=sp*into*(.8+.2*clamp((2.9-dd)/1.2,0,1));e.tx-=nx*cut;e.ty-=ny*cut;e.walled=.25;nw++});
     // barrelling into a crowd at a sprint: the ball can get knocked away
     if(nw>=2&&e.spr&&!((e.cd.strip||0)>0)&&rnd()<dt*.5){e.cd.strip=2;const d=onT(opp(e.t)).sort((a,c)=>dist(a,e)-dist(c,e))[0];bx(d,'stl');bx(e,'tov');say('Stripped in traffic by '+d.p.ln,1.2);G.ev.push('steal');G.b={st:'loose',x:e.x,y:e.y,z:2,vx:(d.x-e.x)*2+(rnd()-.5)*4,vy:(d.y-e.y)*2+(rnd()-.5)*4,vz:2,t:0,stl:d}}}}}catch(err){console.error(err)}return r}}
// layups and dunks: every defender between you and the rim makes it harder, a rim protector more so
{const _sa=shotAdj;shotAdj=function(e,typ,info){let a=_sa(e,typ,info);try{if(feat('paint')&&(typ=='rim'||typ=='dunk'||typ=='close')){const hx=info.hx;let n=0,big=0;
    onT(opp(e.t)).forEach(d=>{if(d.stun>0)return;const dd=dist(d,e);if(dd>3.6)return;const front=(d.x-e.x)*(hx-e.x)+(d.y-e.y)*(25-e.y)>0;if(dd<2.2||front){n++;if((d.p.sk.blk||50)>=68||(d.p.sk.id||50)>=74)big=1}});
    if(n){const k=typ=='close'?.5:1;a-=k*(Math.min(.19,.05*n+(n>1?.04:0))+big*.03);if(Math.hypot(e.vx,e.vy)>topSpd(e)*.95&&n>1)a-=.03}}}catch(err){}return a}}
// defenders who are set go straight up instead of fouling every drive
let RIMF=0;
{const _sh=shoot;shoot=function(e,q){RIMF=feat('paint')&&G&&G.b.st=='held'&&shotInfo(e,e.x,e.y).d<6?1:0;try{return _sh(e,q)}finally{RIMF=0}}}
{const _dm=defMod;defMod=function(k){const m=_dm(k);return RIMF?Object.assign({},m,{foul:(m.foul==null?1:m.foul)*.6}):m}}
// the nearest big man slides over when anyone drives into the paint, not only after the on-ball defender is beaten
{const _d=defAI;defAI=function(e,dt){try{if(feat('paint')&&feat('help')&&G.phase=='live'&&!(e===G.ctl&&G.ctlInput)){const b=G.b,k=e.t;if(b.st=='held'&&b.h.t!==k&&b.h!==e.man&&!(e.bite>0)&&!(e.stun>0)){const h=b.h,s=G.dir[opp(k)],hx=hoopX(s),dh=Math.hypot(h.x-hx,h.y-25),toward=(h.vx*(hx-h.x)+h.vy*(25-h.y))>0,spd=Math.hypot(h.vx,h.vy);
     if(dh<17&&dh>3&&toward&&spd>7){const H=onT(k).filter(x=>x!==h.man&&!(x.stun>0)).sort((a,c)=>(Math.hypot(a.x-hx,a.y-25)+dist(a,h)*.5)-(Math.hypot(c.x-hx,c.y-25)+dist(c,h)*.5));
      if(H[0]===e&&rnd()<(.25+.5*IQ(k))){const f=clamp(3.5/dh,.25,.6);return seek(e,hx+(h.x-hx)*f,25+(h.y-25)*f,1.05)}}}}}catch(err){}return _d(e,dt)}}
// ---------- play designer ----------
const PD_DEF={n:'My play',focus:'bal',scr:'none',auto:0,spots:{PG:[26,25],SG:[22,43],SF:[22,7],PF:[14,34],C:[6,18]}};
const PD_FOCUS={bal:['Balanced','Take what the defense gives.',{}],drive:['Attack the rim','Ball handlers drive more.',{drive:1.14}],three:['Hunt threes','Kick out to shooters.',{three:1.18,drive:.92}],post:['Feed the post','Get the ball to your big man on the block.',{post:1,three:.92}],quick:['Quick shot','Take the first good look.',{need:-.08}]};
const pdGet=()=>typeof R!='undefined'&&R&&R.cset&&R.cset.spots?R.cset:null;
OSETS.custom={get n(){const c=pdGet();return c?c.n:'My play'},d:'The play you designed.',get m(){const c=pdGet()||PD_DEF,sp=c.spots,m=Object.assign({},(PD_FOCUS[c.focus]||PD_FOCUS.bal)[2]);if(c.scr=='pnr')m.screen=4;else if(c.scr=='no')m.screen=0;
  m.spots=U=>{const o={};POS.forEach(p=>{const a=sp[p]||PD_DEF.spots[p];o[p]=U(a[0],a[1])});return o};return m}};
const pdOn=()=>feat('pdes')&&feat('plays')&&!!pdGet();
{const _cc=cycleCall;cycleCall=function(side,dir){if(side!='o'||!pdOn()||!G||!G.calls)return _cc(side,dir);const L=OKEYS.concat(['custom']),c=G.calls[0];c.o=L[(L.indexOf(c.o)+(dir||1)+L.length)%L.length];say('Offense: '+OSETS[c.o].n,1.2)}}
{const _ch=callsHTML;callsHTML=function(){let h=_ch();try{if(h&&pdOn()){const c=G.calls[0],k='custom',row=`<label class="ft"><input type="radio" name="po" ${c.o==k?'checked':''} onchange="G.calls[0].o='${k}'"><span><b>${esc(OSETS[k].n)} &#9998;</b><small>${OSETS[k].d}</small></span></label>`;h=h.replace('</div>\n <div><b>Defense</b>',row+'</div>\n <div><b>Defense</b>')}}catch(err){}return h}}
{const _ng=newGame;newGame=function(...a){const g=_ng.apply(this,a);try{if(pdOn()&&pdGet().auto&&G&&G.calls&&G.calls[0])G.calls[0].o='custom'}catch(err){}return g}}
// a saved play must never break a game if the switch is turned off mid-season
{const _om=offMod;offMod=function(k){try{if(G&&G.calls&&G.calls[k]&&G.calls[k].o=='custom'&&(k!==0||!pdOn()))G.calls[k].o='motion'}catch(err){}return _om(k)}}
let PD=null;
function pdUI(){PAGE='pdes';if(!PD)PD=JSON.parse(JSON.stringify(pdGet()||PD_DEF));const W=500,H=470,sc=10,HX=W/2,HY=62,X=y=>y*sc,Y=u=>HY+u*sc;
 const arc=(()=>{let d='';for(let i=0;i<=40;i++){const a=-1.19+i*(2.38/40),x=HX+Math.sin(a)*237.5,y=HY+Math.cos(a)*237.5;d+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}return d})();
 shell(`<div class="head"><h1>Play designer</h1><p>Drag your five players to where they should set up. The hoop is at the top. In a game, press C to cycle to your play (or pick it in the Playbook). You run the ball handler; your teammates go to these spots, cut and screen from there.</p>
 <div class="row"><label>Name <input id="pdn" maxlength="18" value="${esc(PD.n)}" oninput="PD.n=this.value"></label>
 <label>Looks for <select onchange="PD.focus=this.value;pdNote()">${Object.keys(PD_FOCUS).map(k=>`<option value="${k}" ${PD.focus==k?'selected':''}>${PD_FOCUS[k][0]}</option>`).join('')}</select></label>
 <label>Screens <select onchange="PD.scr=this.value">${[['none','Sometimes'],['pnr','Lots of ball screens'],['no','No screens']].map(([k,n])=>`<option value="${k}" ${PD.scr==k?'selected':''}>${n}</option>`).join('')}</select></label>
 <label class="ft" style="display:inline-flex"><input type="checkbox" ${PD.auto?'checked':''} onchange="PD.auto=this.checked?1:0"><span><b>Start every game in this play</b></span></label></div>
 <div class="row">${B('pdSave()','Save play','big')}${B("PD=JSON.parse(JSON.stringify(PD_DEF));pdUI()",'Reset')}<span id="pdnote" style="color:#94a3b8"></span></div></div>
 <div class="card"><svg id="pdsvg" viewBox="0 0 ${W} ${H}" style="width:100%;max-width:560px;touch-action:none;user-select:none;background:#c98d4f;border-radius:10px">
 <rect x="2" y="${HY-52}" width="${W-4}" height="${H-HY+50}" fill="none" stroke="#fff" stroke-width="3"/><rect x="${HX-80}" y="${HY-52}" width="160" height="190" fill="#b8763a" stroke="#fff" stroke-width="3"/>
 <circle cx="${HX}" cy="${HY+138}" r="60" fill="none" stroke="#fff" stroke-width="3"/><path d="${arc}" fill="none" stroke="#fff" stroke-width="3"/><line x1="${HX-30}" y1="${HY-12}" x2="${HX+30}" y2="${HY-12}" stroke="#fff" stroke-width="4"/><circle cx="${HX}" cy="${HY}" r="8" fill="none" stroke="#ea580c" stroke-width="3"/>
 ${POS.map((p,i)=>{const a=PD.spots[p];return`<g id="pd${i}" data-p="${p}" transform="translate(${X(a[1])},${Y(a[0])})" style="cursor:grab"><circle r="17" fill="${R.t[0].col[0]}" stroke="#fff" stroke-width="2.5"/><text y="4.5" text-anchor="middle" font-size="12" font-weight="800" fill="${R.t[0].col[1]}" style="pointer-events:none">${p}</text></g>`}).join('')}</svg>
 <p><small>Ideas: put three shooters around the arc and two near the rim; clear one whole side for your best scorer; or stack two players low and send the others wide. The other team never uses your play.</small></p></div>`);
 pdNote();const sv=$('pdsvg');let drag=null;
 sv.addEventListener('pointerdown',e=>{const g=e.target.closest('g[data-p]');if(!g)return;drag=g;try{sv.setPointerCapture(e.pointerId)}catch(err){}e.preventDefault()});
 sv.addEventListener('pointermove',e=>{if(!drag)return;const r=sv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H,cy=clamp(x/sc,2,48),u=clamp((y-HY)/sc,-2,39);PD.spots[drag.dataset.p]=[+u.toFixed(1),+cy.toFixed(1)];drag.setAttribute('transform',`translate(${X(cy)},${Y(u)})`)});
 const up=()=>{drag=null};sv.addEventListener('pointerup',up);sv.addEventListener('pointercancel',up)}
function pdNote(){const n=$('pdnote');if(n&&PD)n.textContent=(PD_FOCUS[PD.focus]||PD_FOCUS.bal)[1]}
function pdSave(){if(!PD)return;PD.n=(PD.n||'').trim()||'My play';R.cset=JSON.parse(JSON.stringify(PD));hSave();toast('Play saved. Press C in a game to call it.');pdUI()}
NAV.splice(Math.max(1,NAV.findIndex(n=>n[0]=='roster')+1),0,['pdes','Play designer','PD=null;pdUI()']);
{const _no=navOK;navOK=function(k){if(k=='pdes')return feat('pdes')&&feat('plays')&&!(typeof CAREER=='function'&&CAREER());return _no(k)}}
