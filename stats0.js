'use strict';
// Detailed ratings: the data and the formulas (loaded early so the game loop can use them from the first frame).
const FT=k=>typeof feat=='function'&&feat(k),DS2=()=>FT('ds2');
// realistic (NFL-like) tuning: NF(old,new) picks the new number when the switch is on
const NF=(a,b)=>FT('nfl')?b:a;
const DGRP={ath:['Athletic',['spd','acc','agi','pow','sta','jmp']],pass:['Passing',['tpw','sac','dac','tor','rel','vis','pkt']],car:['Ball carrying',['elu','btk','bsc','cvi']],
 rec:['Receiving',['cth','cit','rte','rls']],blk:['Blocking',['pbk','rbk','bkf']],rush:['Pass rush',['prp','prf','bsh']],cov:['Coverage',['man','zon','prs','bsk']],
 tak:['Tackling',['tak','hpw','pur','prc']],kick:['Kicking',['kpw','kac']]};
const DSN={spd:'Speed',acc:'Acceleration',agi:'Agility',pow:'Strength',sta:'Stamina',jmp:'Jumping',tpw:'Throw power',sac:'Short accuracy',dac:'Deep accuracy',tor:'Throw on the run',rel:'Quick release',vis:'Vision',pkt:'Pocket presence',
 elu:'Elusiveness',btk:'Break tackle',bsc:'Ball security',cvi:'Carrier vision',cth:'Catching',cit:'Catch in traffic',rte:'Route running',rls:'Release',pbk:'Pass block',rbk:'Run block',bkf:'Block footwork',
 prp:'Power moves',prf:'Finesse moves',bsh:'Block shedding',man:'Man coverage',zon:'Zone coverage',prs:'Press',bsk:'Ball skills',tak:'Tackling',hpw:'Hit power',pur:'Pursuit',prc:'Play recognition',kpw:'Kick power',kac:'Kick accuracy'};
const DSD={tpw:'How far and how fast he throws. His vision cone reaches this far.',sac:'Accuracy on throws under 20 yards.',dac:'Accuracy on deep throws.',tor:'Accuracy when throwing on the move or with his head turned.',vis:'How wide his vision cone is.',pkt:'Keeps his accuracy with rushers around him.',rel:'Gets the ball out quickly.',
 cth:'Catching the ball when open.',cit:'Catching with a defender on him, and winning jump balls.',rte:'Sharp cuts that leave defenders behind.',rls:'Getting off press coverage at the line.',elu:'Jukes and spins that make tacklers miss.',btk:'Running through tackles.',bsc:'Holding on to the ball.',
 pbk:'Holding off pass rushers.',rbk:'Moving defenders on run plays.',prp:'Bull rush power against blockers.',prf:'Swim and rip moves to get past blockers.',bsh:'Getting off blocks to make the tackle.',man:'Sticking to a receiver.',zon:'Reading routes in his zone.',prs:'Jamming receivers at the line.',bsk:'Interceptions and breakups.',
 tak:'Finishing tackles.',hpw:'Big hits and forced fumbles.',prc:'Not falling for fakes.',kpw:'How far he kicks.',kac:'How straight he kicks.',acc:'How fast he gets to top speed.',agi:'How quickly he turns.',jmp:'Going up for high balls.'};
const POSG={QB:['ath','pass','car'],RB:['ath','car','rec','blk'],WR:['ath','rec','car'],TE:['ath','rec','blk','car'],OL:['ath','blk'],DL:['ath','rush','tak'],LB:['ath','tak','cov','rush'],CB:['ath','cov','tak'],S:['ath','cov','tak'],K:['kick','ath'],P:['kick','ath']};
const PSL={},PSI={};Object.keys(POSG).forEach(g=>{PSL[g]=POSG[g].flatMap(k=>DGRP[k][1]);PSI[g]={};PSL[g].forEach((s,i)=>PSI[g][s]=i)});
// how the old four ratings come from the detailed ones, per position
const SPD0=[['spd',.6],['acc',.25],['agi',.15]];
const DMAP={QB:{str:[['tpw',1]],awr:[['vis',.6],['pkt',.4]],skl:[['sac',.45],['dac',.35],['rel',.1],['tor',.1]]},
 RB:{str:[['pow',.4],['btk',.6]],awr:[['cvi',1]],skl:[['elu',.4],['cth',.35],['bsc',.25]]},
 WR:{str:[['pow',.5],['btk',.3],['rls',.2]],awr:[['rte',.7],['cvi',.3]],skl:[['cth',.6],['cit',.4]]},
 TE:{str:[['pow',.5],['rbk',.5]],awr:[['rte',.6],['bkf',.4]],skl:[['cth',.5],['cit',.25],['pbk',.25]]},
 OL:{str:[['pow',.5],['rbk',.5]],awr:[['bkf',1]],skl:[['pbk',.6],['rbk',.4]]},
 DL:{str:[['pow',.5],['prp',.5]],awr:[['prc',1]],skl:[['prf',.4],['bsh',.4],['prp',.2]]},
 LB:{str:[['pow',.4],['hpw',.3],['bsh',.3]],awr:[['prc',.6],['zon',.4]],skl:[['tak',.6],['pur',.4]]},
 CB:{str:[['pow',.4],['prs',.6]],awr:[['zon',.5],['prc',.5]],skl:[['man',.5],['bsk',.3],['zon',.2]]},
 S:{str:[['pow',.4],['hpw',.6]],awr:[['prc',.5],['zon',.5]],skl:[['zon',.4],['man',.3],['bsk',.3]]},
 K:{str:[['kpw',1]],awr:[['kac',1]],skl:[['kac',1]]},P:{str:[['kpw',1]],awr:[['kac',1]],skl:[['kac',1]]}};
Object.values(DMAP).forEach(m=>m.spd=SPD0);
const dsWeights=(g,s)=>ST.filter(k=>DMAP[g][k].some(e=>e[0]==s));
function dsDerive(p,arr){const g=p.g,I=PSI[g],o={};ST.forEach(k=>{o[k]=Math.round(DMAP[g][k].reduce((a,[s,w])=>a+w*arr[I[s]],0))});return o}
const dsC=v=>clamp(Math.round(v),20,99);
// build detailed stats for a player who only has the old four ratings
function dsInit(p){const g=p.g;if(!PSL[g])return;const L=PSL[g],avg=ST.reduce((a,k)=>a+p.sk[k],0)/4,mavg=ST.reduce((a,k)=>a+p.mx[k],0)/4;
 const ds=[],dm=[];L.forEach(s=>{const ks=dsWeights(g,s);let v,m;if(ks.length){v=ks.reduce((a,k)=>a+p.sk[k],0)/ks.length;m=ks.reduce((a,k)=>a+p.mx[k],0)/ks.length}else{v=avg-3;m=mavg-3}
  const n=(rnd()-.5)*(ks.length?10:14);ds.push(v+n);dm.push(m+n)});
 for(let it=0;it<6;it++){ST.forEach(k=>{const w=DMAP[g][k],cur=w.reduce((a,[s,x])=>a+x*ds[PSI[g][s]],0),cm=w.reduce((a,[s,x])=>a+x*dm[PSI[g][s]],0),d=p.sk[k]-cur,dmx=p.mx[k]-cm;w.forEach(([s])=>{ds[PSI[g][s]]+=d;dm[PSI[g][s]]+=dmx})})}
 p.ds=ds.map(dsC);p.dm=dm.map((m,i)=>Math.max(p.ds[i],dsC(m)));p.dsg=p.g;dsPush(p)}
// recompute the old four ratings and remember them, so a later change to them (old code paths) can be fed back in
function dsPush(p){const a=dsDerive(p,p.ds),b=dsDerive(p,p.dm);ST.forEach(k=>{p.sk[k]=a[k];p.mx[k]=Math.max(a[k],b[k])});p._s=ST.map(k=>p.sk[k]).concat(ST.map(k=>p.mx[k]))}
function dsSync(p){if(!p||!PSL[p.g]||!p.sk)return;if(p.ds&&p.dsg&&p.dsg!==p.g)return dsMove(p);if(!p.ds||p.ds.length!=PSL[p.g].length||!p._s){dsInit(p);p.dsg=p.g;return}if(!p.dsg)p.dsg=p.g;
 let ch=0;ST.forEach((k,j)=>{const d=p.sk[k]-p._s[j],dm=p.mx[k]-p._s[j+4];if(!d&&!dm)return;ch=1;DMAP[p.g][k].forEach(([s])=>{const i=PSI[p.g][s];if(d)p.ds[i]=dsC(p.ds[i]+d);if(dm)p.dm[i]=dsC(p.dm[i]+dm);if(p.dm[i]<p.ds[i])p.dm[i]=p.ds[i]})});
 if(ch)dsPush(p)}
// moved to a new position: keep every stat he already had, build the new ones from his ratings
function dsMove(p){const og=p.dsg,old={},oldm={};(PSL[og]||[]).forEach((s,i)=>{old[s]=p.ds[i];oldm[s]=p.dm[i]});if(p._s)ST.forEach((k,j)=>{p.sk[k]=p._s[j];p.mx[k]=p._s[j+4]});
 dsInit(p);PSL[p.g].forEach((s,i)=>{if(old[s]!=null){p.ds[i]=old[s];p.dm[i]=Math.max(old[s],oldm[s])}});p.dsg=p.g;dsPush(p)}
function dsSyncAll(){if(!R||!R.pl)return;R.pl.forEach(dsSync)}
// one stat for a roster player (falls back to his old ratings for stats outside his groups)
function dv(p,s){if(!p)return 60;const g=p.g,i=PSI[g]&&PSI[g][s];if(p.ds&&i!=null)return p.ds[i];const sk=p.sk||{spd:60,str:60,awr:60,skl:60};
 if(s=='spd'||s=='acc'||s=='agi')return sk.spd;if(s=='pow'||s=='hpw'||s=='btk')return Math.round(sk.str*.8+10);return Math.round(Math.min(65,(sk.spd+sk.str+sk.awr+sk.skl)/4*.7+12))}
// one stat for a player on the field
function fs(p,s){if(!p)return 60;if(p.rp)return dv(p.rp,s);return p.o||60}
// ---------- upgrades: a group at a time, random boosts inside it ----------
function dsRoom(p,gk){const I=PSI[p.g];return DGRP[gk][1].filter(s=>I[s]!=null).reduce((a,s)=>a+Math.max(0,p.dm[I[s]]-p.ds[I[s]]),0)}
function dsGAvg(p,gk){const I=PSI[p.g],L=DGRP[gk][1].filter(s=>I[s]!=null);return Math.round(L.reduce((a,s)=>a+p.ds[I[s]],0)/L.length)}
function dsUp(p,gk,n,noCap){dsSync(p);const I=PSI[p.g],L=DGRP[gk][1].filter(s=>I[s]!=null),got={};n=n||3;
 for(let k=0;k<n;k++){const c=L.filter(s=>p.ds[I[s]]<99&&(noCap||p.ds[I[s]]<p.dm[I[s]]));if(!c.length)break;const w=c.map(s=>noCap?1:1+(p.dm[I[s]]-p.ds[I[s]]));let r=rnd()*w.reduce((a,b)=>a+b,0),s=c[0];
  for(let j=0;j<c.length;j++){r-=w[j];if(r<=0){s=c[j];break}}const i=I[s],add=rnd()<.2&&p.ds[i]<98?2:1;p.ds[i]=Math.min(99,p.ds[i]+add);if(noCap&&p.dm[i]<p.ds[i])p.dm[i]=p.ds[i];else p.ds[i]=Math.min(p.ds[i],p.dm[i]);got[s]=(got[s]||0)+add}
 dsPush(p);return got}
const dsGot=g=>Object.keys(g).map(s=>`+${g[s]} ${DSN[s].toLowerCase()}`).join(', ');
// ---------- the formulas the game uses (old versions when the switches are off) ----------
function thRange(q){if(!DS2())return 34+((q.sk?q.sk.str:q.o)-60)*.7;return clamp(36+(fs(q,'tpw')-60)*.62,26,60)}
function coneLen(q){return FT('cone2')?thRange(q):Math.min(34+((q.sk?q.sk.str:q.o)-60)*.7,45)*.8}
function thrV(q,dd){return 18+dd*.5+((DS2()?fs(q,'tpw'):(q.sk?q.sk.str:q.o))-70)*.15}
function qbAcc(q,dd){if(!DS2())return q.sk?q.sk.skl:q.o;const a=fs(q,'sac'),b=fs(q,'dac'),k=clamp((dd-15)/15,0,1);return a+(b-a)*k}
// head angle: where the QB is looking (the cone). Same as his body unless he's moving and turning his head.
const qLook=q=>q.ha!=null&&FT('qbhead')?q.ha:q.fa;
const qTwist=q=>{if(q.ha==null||!FT('qbhead'))return 0;const d=q.ha-q.fa;return Math.abs(Math.atan2(Math.sin(d),Math.cos(d)))};
function accSc(q,dd,tx,ty,pr){const sp=q._rs!=null&&DS2()?q._rs:Math.hypot(q.vx||0,q.vy||0),cf=1+coneOff(q,tx,ty)*4,dp=Math.min(NF(99,2.9),Math.pow(dd/22,dd>22?NF(1.5,2.4):1.5));
 if(!DS2())return(1.2+Math.max(0,80-q.sk.skl)*.08)*(1+pr)*(1+sp*.15+(P.sd?.4:0))*dp*cf;
 const tor=fs(q,'tor'),pk=fs(q,'pkt'),base=1.2+Math.max(0,80-qbAcc(q,dd))*.08,run=1+sp*(.05+.16*(1-tor/99))+(P.sd?.4*(1-tor/160):0),tw=1+qTwist(q)/(Math.PI/2)*(.5-.3*tor/99);
 return base*(1+pr*(1.2-.5*pk/99))*run*tw*dp*cf}
function coneHalf2(q){return Math.max(.17,((DS2()?fs(q,'vis'):(q.sk?q.sk.awr:q.o))-20)*.45*Math.PI/180)}
// blocking and rushing
function BR(o){if(!DS2())return o.o;const run=P.run||P.scr;return run?fs(o,'rbk')*.6+fs(o,'pow')*.25+fs(o,'bkf')*.15:fs(o,'pbk')*.6+fs(o,'pow')*.2+fs(o,'bkf')*.2}
function RR(t){if(!DS2())return t.o;return fs(t,'prp')*.35+fs(t,'prf')*.3+fs(t,'bsh')*.2+fs(t,'pow')*.15}
function RS(t){if(!DS2())return t.o;return fs(t,'bsh')*.5+fs(t,'pow')*.3+fs(t,'prc')*.2}
// tackling and carrying
function TK(p){if(!DS2())return p.o;return fs(p,'tak')*.6+fs(p,'pur')*.15+fs(p,'pow')*.25}
function BT(h){if(!DS2())return h.o;return fs(h,'btk')*.45+fs(h,'elu')*.35+fs(h,'pow')*.2}
function HP(p){return DS2()?fs(p,'hpw'):p.o}
function BS(h){return DS2()?fs(h,'bsc'):h.o}
// catching and coverage
function CR(r,tight){if(!DS2())return r?r.o:55;if(!r)return 55;return fs(r,'cth')*(1-tight)+fs(r,'cit')*tight}
function CV(p){if(!DS2())return p.o;return fs(p,p.cover?'man':'zon')*.6+fs(p,'bsk')*.4}
function BK(p){if(!DS2())return p.o;return fs(p,'bsk')*.6+fs(p,p.cover?'man':'zon')*.4}
function MC(p){return DS2()?fs(p,'man'):p.o}
function PRC(p){return DS2()?fs(p,'prc'):p.o}
