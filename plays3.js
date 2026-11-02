'use strict';
// Expanded playbook (36 new offensive plays in real formations, 11 new defenses), play tags on every stock play,
// and the Coach's suggestion: the coach reads the down, distance, field position, clock, the defense's look and
// tendencies, and how each play has worked for you, then recommends plays by their tags. Also fixes the halfback pass
// (the back used to cross the line before he could throw, so it never happened).
{const add=[['Playbook','plays3','Expanded playbook','36 more offensive plays (shotgun, trips, bunch, empty, I-form, pistol, goal line) and 11 more defenses (Cover 1, Cover 4, Tampa 2, fire zone, prevent...).'],
 ['Playbook','coach2',"Coach's suggestions",'When you call a play, your coach recommends plays (and defenses) that fit the situation, using each play\'s tags. Filter tabs help you find plays.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- formations (depth behind the line, sideline-to-sideline spot) ----------
const P3F={gun:{},trips:{2:[-.5,46],3:[-1,41],4:[-1,36]},bunch:{2:[-.5,40],3:[-1.6,38.5],4:[-1.6,41.5]},empty:{1:[-.5,6],5:[-1,13]},
 single:{0:[-3,26.5],5:[-6.5,26.5]},iform:{0:[-3,26.5],5:[-7.5,26.5]},pistol:{0:[-4,26.5],5:[-6.5,26.5]},twins:{1:[-.5,7],3:[-1,13]},
 heavy:{0:[-3,26.5],1:[-1,20],2:[-1,37],3:[-3.5,24],5:[-7,26.5]}};
function p3Mk(form,r,run,ho,flags,rb){const f=Object.assign({},P3F[form]||{});if(rb)f[5]=rb;const p=FOX.map((x,i)=>{const s=f[i]||[x,FOY[i]];return[s[0],s[1],i>0&&i<6?(r[i-1]||[]):[],-1,null]});return Object.assign({p,run:run?1:0,ho:ho||5},flags||{})}
const P3OFF={
 // passing
 'Stick':['gun',[[[22,0]],[[3,0],[7,-6]],[[6,0],[6,-1]],[[1,0],[3,8]],[]],0,5,null,['Base','Short yardage','Beats zone']],
 'Smash':['gun',[[[5,0],[4,0]],[[5,0],[4,0]],[[10,0],[18,7]],[[18,0]],[[1,-6]]],0,5,null,['Beats zone','Red zone']],
 'Levels':['trips',[[[24,0]],[[12,0],[12,-12]],[[6,0],[6,-12]],[[16,0]],[[1,-5],[3,-8]]],0,5,null,['Beats zone','3rd and long']],
 'Y-Cross':['gun',[[[12,0],[24,8]],[[26,0]],[[6,0],[6,6]],[[4,0],[14,-22]],[[2,0],[4,-3]]],0,5,null,['3rd and long','Beats man']],
 'Spacing':['gun',[[[5,0]],[[5,0]],[[5,0],[5,-2]],[[5,0],[5,2]],[[2,-6]]],0,5,null,['Short yardage','Beats zone','2-minute']],
 'Drive':['gun',[[[12,0],[12,12]],[[26,0]],[[2,0],[4,-18]],[[18,0]],[[1,6]]],0,5,null,['Beats man','3rd and long']],
 'Flood':['trips',[[[12,0],[22,8]],[[25,0]],[[12,0],[12,7]],[[1,0],[3,8]],[]],0,5,null,['Beats zone','Red zone']],
 'Mills':['gun',[[[5,0],[4,0]],[[12,0],[24,-7]],[[12,0],[12,-10]],[[6,0],[6,4]],[[2,-5]]],0,5,null,['Deep shot','Beats zone']],
 'Quick Outs':['gun',[[[5,0],[5,-6]],[[5,0],[5,6]],[[5,0],[5,6]],[[4,0],[4,-6]],[[2,-5]]],0,5,null,['2-minute','Beats zone','Backed up']],
 'Sluggo':['gun',[[[4,0],[6,3],[26,3]],[[4,0],[6,-3],[26,-3]],[[10,0],[10,-6]],[[5,0]],[]],0,5,null,['Deep shot','Beats man']],
 'Out and Up':['gun',[[[6,0],[6,-3],[24,-4]],[[6,0],[6,3],[24,4]],[[3,0],[6,-8]],[[12,0]],[[1,5]]],0,5,null,['Deep shot','Beats man']],
 'Bunch Snag':['bunch',[[[22,0]],[[5,0],[4,-2]],[[1,0],[2,8]],[[10,0],[18,7]],[[2,-5]]],0,5,null,['Red zone','Beats man']],
 'Bunch Cross':['bunch',[[[10,0],[10,10]],[[8,0],[8,-14]],[[3,0],[4,-18]],[[12,0],[20,6]],[]],0,5,null,['Beats man','3rd and long']],
 'Empty Quick':['empty',[[[4,0],[7,5]],[[4,0],[7,-5]],[[6,0],[6,-1]],[[8,0],[8,-8]],[[5,0],[5,-4]]],0,5,null,['Beats blitz','2-minute']],
 'Empty Deep':['empty',[[[26,0]],[[26,0]],[[20,0],[26,-6]],[[14,0]],[[18,0],[24,6]]],0,5,null,['Deep shot','2-minute']],
 'TE Seam':['single',[[[12,0],[12,10]],[[14,0],[12,-1]],[[6,0],[6,6]],[[24,0]],[[1,-5]]],0,5,null,['Beats zone','Red zone']],
 'WR Screen':['trips',[[[20,0]],[[2,0]],[[-1.5,2]],[[2,0]],[]],0,5,null,['Beats blitz','Base']],
 'RB Screen':['gun',[[[20,0]],[[20,0]],[[12,0]],[[8,0],[10,-6]],[[-2,-5],[-1.5,-9]]],0,5,null,['Beats blitz','3rd and long']],
 'Hail Mary':['empty',[[[38,10]],[[38,-10]],[[38,-4]],[[36,-2]],[[34,5]]],0,5,null,['Hail Mary']],
 // running
 'Inside Zone':['single',[[[12,0]],[[12,0]],[[8,0]],[],[]],1,5,null,['Base','Short yardage','Backed up']],
 'Outside Zone Rt':['single',[[[12,0]],[[12,0]],[[8,0]],[],[]],1,5,null,['Base'],[-6,31]],
 'Outside Zone Lt':['single',[[[12,0]],[[12,0]],[[8,0]],[],[]],1,5,null,['Base'],[-6,22]],
 'Power Rt':['iform',[[[10,0]],[[10,0]],[],[],[]],1,5,null,['Short yardage','Goal line'],[-7,29]],
 'Power Lt':['iform',[[[10,0]],[[10,0]],[],[],[]],1,5,null,['Short yardage','Goal line'],[-7,24]],
 'Toss Rt':['single',[[[10,0]],[[10,0]],[[6,0]],[],[]],1,5,null,['Base','Beats blitz'],[-5,34]],
 'Toss Lt':['single',[[[10,0]],[[10,0]],[[6,0]],[],[]],1,5,null,['Base','Beats blitz'],[-5,19]],
 'Dive':['iform',[[[10,0]],[[10,0]],[],[],[]],1,5,null,['Short yardage','Goal line','Backed up']],
 'Goal Line Dive':['heavy',[[],[],[],[],[]],1,5,null,['Goal line','Short yardage']],
 'Goal Line Lead':['heavy',[[],[],[],[],[]],1,5,null,['Goal line','Short yardage'],[-7,24.5]],
 'Pistol Run':['pistol',[[[12,0]],[[12,0]],[[8,0]],[],[]],1,5,null,['Base']],
 'Trips Run':['trips',[[[12,0]],[[10,0]],[[8,0]],[[6,0]],[]],1,5,null,['Base','Beats zone'],[-5,23]],
 // play action and tricks
 'PA Crossers':['single',[[[14,0],[14,14]],[[10,0],[10,-14]],[[24,0]],[[2,0],[4,8]],[]],0,5,{pa:1},['Base','Red zone']],
 'PA Shot':['iform',[[[30,0]],[[12,0],[26,-8]],[[24,0]],[[10,0],[10,6]],[]],0,5,{pa:1},['Deep shot']],
 'RPO Bubble':['trips',[[[12,0]],[[3,0]],[[-1,3],[0,6]],[[3,0]],[]],1,5,{rpo:1},['Base','Beats blitz']],
 'Zone Read':['pistol',[[[12,0]],[[12,0]],[[8,0]],[],[]],1,5,{opt:1},['Short yardage','Base']],
 'Trick Pass':['gun',[[[26,0]],[[12,0],[24,-8]],[],[[10,0]],[[1,-5]]],0,5,{wrp:3},['Trick','Red zone']],
 'Flea Flicker Deep':['iform',[[[32,0]],[[30,0]],[[14,0],[24,-8]],[[10,0]],[]],1,5,{flea:1},['Trick','Deep shot']],
 'Reverse Lt':['single',[[[3,0],[3,4]],[[14,0]],[[10,0]],[],[]],1,5,{rev:1},['Trick']],
 'Hook and Lateral Lt':['twins',[[[11,0],[9,1]],[[24,0]],[[3,0],[6,-4]],[[8,0]],[]],0,5,{hkl:[1,3]},['Trick','2-minute']],
 'HB Option Pass':['iform',[[[26,0]],[[12,0],[20,-8]],[[18,0]],[[8,0],[12,6]],[]],1,5,{hbp:1},['Trick']]};
// new defenses: [depths, spots, jobs] (same format as the stock ones)
const P3DEF={
 'Cover 1':[[,,,,,,,2,2,8,14],[],[['r'],['r'],['r'],['r'],['m',5],['z',[7,26.5],7],['m',4],['m',1],['m',2],['m',3],['z',[16,26.5],12]],['Base','3rd and long','Pass defense']],
 'Cover 4':[[,,,,,,,6,6,12,12],[],[['r'],['r'],['r'],['r'],['z',[6,19]],['z',[6,26.5]],['z',[6,34]],['z',[15,9],8],['z',[15,44],8],['z',[15,21],8],['z',[15,32],8]],['Pass defense','3rd and long']],
 'Tampa 2':[[,,,,,,,4,4,13,13],[],[['r'],['r'],['r'],['r'],['z',[7,20]],['z',[14,26.5],8],['z',[7,33]],['z',[5,8]],['z',[5,45]],['z',[16,15],10],['z',[16,38],10]],['Pass defense','3rd and long','2-minute']],
 'Fire Zone':[[,,,,1.8,1.8,,7,7,13,6],[],[['z',[5,14]],['r'],['r'],['r'],['r'],['r'],['z',[7,22]],['z',[15,8],9],['z',[15,45],9],['z',[16,26.5],10],['z',[7,33]]],['Blitz','3rd and long']],
 'Corner Blitz':[[,,,,,,,2,2,7,14],[,,,,,,,10],[['r'],['r'],['r'],['r'],['m',5],['z',[16,26.5],12],['m',4],['r'],['m',2],['m',1],['m',3]],['Blitz','Run stop']],
 'Goal Line D':[[,,,,1.5,2.5,1.5,2,2,3,3],[],[['r'],['r'],['r'],['r'],['r'],['m',5],['r'],['m',1],['m',2],['m',3],['m',4]],['Goal line','Short yardage','Run stop']],
 'Prevent':[[,,,,10,10,10,18,18,26,26],[,,,,16,26.5,37,10,43,20,33],[['r'],['r'],['z',[6,26.5]],['r'],['z',[10,16],7],['z',[10,26.5],7],['z',[10,37],7],['z',[20,10],9],['z',[20,43],9],['z',[26,20],10],['z',[26,33],10]],['Prevent','2-minute']],
 'Spy Man':[[,,,,,5,,2,2,6,14],[],[['r'],['r'],['r'],['r'],['m',5],['s'],['m',4],['m',1],['m',2],['m',3],['z',[16,26.5],12]],['Spy','3rd and long','Pass defense']],
 'Nickel Blitz':[[,,,,1.8,,1.8,2,2,2,6],[],[['r'],['r'],['r'],['r'],['r'],['m',5],['r'],['m',1],['m',2],['r'],['m',3]],['Blitz','3rd and long']],
 'Cover 2 Man':[[,,,,,,,2,2,13,13],[],[['r'],['r'],['r'],['r'],['m',5],['m',3],['m',4],['m',1],['m',2],['z',[16,15],10],['z',[16,38],10]],['Pass defense','3rd and long']],
 'Run Blitz':[[,,,,1.5,1.5,1.5,5,5,8,13],[],[['r'],['r'],['r'],['r'],['r'],['r'],['r'],['m',1],['m',2],['m',3],['z',[14,26.5],12]],['Run stop','Short yardage','Blitz']]};
const P3TAGS={Slants:['Base','Beats blitz'],Go:['Deep shot','Beats man'],Mesh:['Beats man','Base'],Run:['Base','Short yardage'],Verts:['Deep shot','Beats zone','2-minute'],Curls:['Base','Beats zone'],
 'Post Corner':['Deep shot','Beats zone','Red zone'],Draw:['3rd and long','Beats blitz'],'Motion Mesh':['Beats man'],'Jet Sweep':['Base'],'PA Boot':['Base','Red zone'],'PA Deep':['Deep shot'],
 'Read Option':['Short yardage','Base'],'RPO Slant':['Base','Beats blitz'],'Flea Flicker':['Trick','Deep shot'],'HB Pass':['Trick'],Reverse:['Trick'],'Double Pass':['Trick'],'Hook and Lateral':['Trick','2-minute']};
const P3DTAGS={'Cover 2 Zone':['Base','Pass defense','2-minute'],'Man Free':['Base','Pass defense'],Blitz:['Blitz','Run stop'],'Cover 3':['Base','Run stop'],'All Out':['Blitz','Short yardage','Goal line']};
for(const n in P3OFF)P3TAGS[n]=P3OFF[n][5];for(const n in P3DEF)P3DTAGS[n]=P3DEF[n][3];
const OTAGS=['Base','Short yardage','3rd and long','Red zone','Goal line','2-minute','Deep shot','Beats blitz','Beats man','Beats zone','Backed up','Trick','Hail Mary'],
 DTAGS=['Base','Run stop','Short yardage','Pass defense','3rd and long','Blitz','Goal line','Prevent','2-minute','Spy'];
if(typeof TAGS!='undefined')OTAGS.forEach(t=>{if(!TAGS.includes(t))TAGS.push(t)});
let PDTAG={};try{PDTAG=JSON.parse(lsGet('gddtags'))||{}}catch(e){}
const offTags=n=>(typeof PTAG!='undefined'&&PTAG[n])||P3TAGS[n]||[],defTags=n=>PDTAG[n]||P3DTAGS[n]||[];
function p3Load(){const on=feat('plays3');for(const n in P3OFF){const s=P3OFF[n];if(on)PRE[n]=p3Mk(s[0],s[1],s[2],s[3],s[4],s[6]);else delete PRE[n]}
 for(const n in P3DEF){const s=P3DEF[n];if(on)DPRE[n]=mkD(s[0],s[1],s[2]);else delete DPRE[n]}}
p3Load();{const _ot=optT;optT=function(k){_ot(k);if(k=='plays3')p3Load()}}
// ---------- halfback pass fix: hold the back behind the line until he throws ----------
{const _st=step;step=function(dt){const f=P&&P.pf;let rb=null,sv=null;
 try{if(f&&f.hbp&&!P.hbDone&&!P.kr&&G.phase=='play'&&P.b.st=='carry'&&P.b.c===P.off[P.ho||5]){rb=P.b.c;sv=[rb.x,rb.y]}}catch(e){}
 _st(dt);try{if(rb&&sv&&!P.hbDone&&P.b.st=='carry'&&P.b.c===rb&&G.phase=='play'){const d=G.dir,L=P.L,side=rb.y<26.5?-1:1;rb.x=sv[0];rb.y=sv[1];mv(rb,L-d*3,clamp(rb.y+side*3,3,50),rb.spd*.55,dt)}}catch(e){}}}
// ---------- what the coach sees ----------
{const _sn=snap;snap=function(...a){const r=_sn.apply(this,a);try{if(P&&G.phase=='play'&&!P.kr){if(G.poss=='U'&&P.dpn){G.cdt=G.cdt||{blitz:0,man:0,zone:0};const k=typeof pdKind=='function'&&DALL()[P.dpn]?pdKind(DALL()[P.dpn]).toLowerCase():'zone';G.cdt[k]=(G.cdt[k]||0)+1}
 if(G.poss=='C'){G.cot=G.cot||{};const k=sitKey(),h=G.cot[k]=G.cot[k]||{r:0,p:0};if(P.run)h.r++;else h.p++}}}catch(e){}return r}}
function coachSit(off,side){const d=G.dir,dg=Math.round(((d>0?110:10)-(P?P.L:G.los))*d),lead=side=='U'?G.sc[0]-G.sc[1]:G.sc[1]-G.sc[0],late=(G.q==2||G.q>=4)&&G.clk<=120,w={},why={};
 const add=(t,v,y)=>{w[t]=(w[t]||0)+v;if(y)why[t]=y};
 if(off){if(G.ytg<=2)add('Short yardage',3,`${ord(G.down)} and ${G.ytg}`);if(dg<=4)add('Goal line',3.5,'at the goal line');else if(dg<=20)add('Red zone',2.2,'in the red zone');
  if(G.down>=3&&G.ytg>=7)add('3rd and long',3,`${ord(G.down)} and ${G.ytg}`);if(late&&lead<=0)add('2-minute',2.5,'the clock is running down');if(dg>=90)add('Backed up',2,'backed up deep');
  if(G.down<=2&&G.ytg>=10&&dg>40&&dg<85)add('Deep shot',1.2,'a good down to take a shot');if(late&&G.clk<=10&&dg>30&&lead<0)add('Hail Mary',8,'last play');else add('Hail Mary',-9);
  if(G.down==1&&G.ytg>=10&&dg>20&&dg<90)add('Base',1.4,'1st and 10');else add('Base',.5);
  const h=P&&P.hint||'';if(/linebackers crowding/.test(h))add('Beats blitz',2,'they are showing blitz');if(/corners pressed/.test(h))add('Beats man',1.6,'corners are pressed up (man coverage)');if(/safeties sitting deep/.test(h))add('Beats zone',1.2,'safeties are sitting deep');
  const t=side=='U'?G.cdt:null;if(t){const tot=(t.blitz||0)+(t.man||0)+(t.zone||0);if(tot>=4){const fav=['blitz','man','zone'].sort((a,b)=>(t[b]||0)-(t[a]||0))[0];add('Beats '+fav,1.3,`they have played a lot of ${fav}`)}}
  add('Trick',G.down<=2&&dg>25&&dg<75&&!late?.3:-1.5)}
 else{if(G.ytg<=2)add('Short yardage',3,`${ord(G.down)} and ${G.ytg}`),add('Run stop',1.5);if(dg<=5)add('Goal line',3.5,'they are at the goal line');
  if(G.down>=3&&G.ytg>=7)add('3rd and long',3,`${ord(G.down)} and ${G.ytg}`),add('Pass defense',1);if(late&&lead>0&&lead<=8&&dg>25)add('Prevent',3,'protect the lead, nothing deep');else add('Prevent',-2);
  if(late)add('2-minute',2,'they are in hurry-up mode');if(G.down==1&&G.ytg>=10)add('Base',1.5,'1st and 10');else add('Base',.4);
  const tt=side=='U'?G.cot:G.otd,hh=tt&&tt[sitKey()];if(hh&&hh.r+hh.p>=3){const rp=hh.r/(hh.r+hh.p);if(rp>.6)add('Run stop',2,`they run ${Math.round(rp*100)}% here`);else if(rp<.35)add('Pass defense',1.6,`they throw ${Math.round(100-rp*100)}% here`)}
  if(G.down==3&&G.ytg>=3&&G.ytg<=6)add('Blitz',1.2,'3rd and medium: bring pressure');const oq=P&&P.off&&P.off[0];if(oq&&oq.sk&&oq.sk.spd>=74)add('Spy',1.4,'their QB can run')}
 return{w,why,dg}}
function coachSug(off,side,k){if(!G||!P)return[];const ck=[off,side,G.poss,G.down,G.ytg,Math.round(P.L),G.q,Math.round(G.clk/15),G.sc.join(),P.hint||'',Object.keys(off?allP():DALL()).length].join('|');G.sugC=G.sugC||{};if(G.sugC[ck])return G.sugC[ck].slice(0,k||3);if(Object.keys(G.sugC).length>40)G.sugC={};const res=coachSug0(off,side);G.sugC[ck]=res;return res.slice(0,k||3)}
function coachSug0(off,side){const s=coachSit(off,side),all=off?allP():DALL(),hist=side=='U'&&off?R.pst||{}:{};
 const out=Object.keys(all).map(n=>{const tg=off?offTags(n):defTags(n);let sc=0;const hit=[];tg.forEach(t=>{const v=s.w[t]||0;sc+=v;if(v>0&&s.why[t])hit.push(t)});
  const h=hist[n];let rec='';if(h&&h[0]>=3){const r=h[2]/h[0];sc+=(r-.45)*2.2;rec=`worked ${h[2]} of ${h[0]} times`}
  if(off&&s.dg<=3&&!all[n].run&&!tg.includes('Goal line'))sc-=.4;if(n==(off?G.lastCall:G.lastDCall))sc-=.8;if(!tg.length)sc-=.5;
  return{n,sc:sc+rnd()*.35,hit,rec,why:hit.map(t=>s.why[t])}}).sort((a,b)=>b.sc-a.sc);return out.slice(0,6)}
{const _ap=applyPlay;applyPlay=function(n,...a){const r=_ap.call(this,n,...a);try{if(G.poss=='U')G.lastCall=n}catch(e){}return r}}
{const _ad=applyDef;applyDef=function(n,...a){const r=_ad.call(this,n,...a);try{if(G.poss!='U')G.lastDCall=n}catch(e){}return r}}
// the CPU coaches with the same brain (more often the smarter the difficulty)
{const _cp=cpuPlay;cpuPlay=function(){if(feat('coach2')&&G&&P&&rnd()<IQ()*.5){const s=coachSug(1,'C',4);if(s.length){const pick=s[rnd()<.6?0:(rnd()*s.length|0)].n,t=offTags(pick),v=PRE[pick]||{};
 if(PRE[pick]&&!(FT('nfl')&&((t.includes('Deep shot')&&rnd()<.6)||(v.run&&!t.includes('Short yardage')&&!t.includes('Goal line')&&rnd()<.3))))return pick}}return _cp()}}
{const _cd=cpuDef;cpuDef=function(){if(feat('coach2')&&G&&P&&rnd()<IQ()*.5){const s=coachSug(0,'C',3);if(s.length){const pick=s[rnd()<.6?0:(rnd()*s.length|0)].n;if(DPRE[pick]&&!(FT('nfl')&&defTags(pick).includes('Blitz')&&rnd()<.45))return pick}}return _cd()}}
{const _cp=coachPlay;coachPlay=function(){if(feat('coach2')&&G&&P&&rnd()<.7){const s=coachSug(1,'U',4);if(s.length)return s[rnd()<.6?0:(rnd()*s.length|0)].n}return _cp()}}
// ---------- the play picker: coach card and filter tabs ----------
const P3OF=[['all','All'],['sug','Coach picks'],['pass','Pass'],['run','Run'],['trick','Trick'],['mine','Yours']],P3DF=[['all','All'],['sug','Coach picks'],['zone','Zone'],['man','Man'],['blitz','Blitz'],['mine','Yours']];
{const _pb=pbHTML;pbHTML=function(u){let h=_pb(u);try{if(!feat('coach2'))return h;const all=u?allP():DALL(),f=(u?G.pbF:G.pbD)||'all',sug=coachSug(!!u,'U',3),sn=sug.map(s=>s.n);
 const kind=n=>{if(u){const v=all[n],t=offTags(n);return v.pa||v.flea||v.hbp||v.rpo||v.opt||v.rev||v.wrp||v.hkl||t.includes('Trick')?'trick':v.run?'run':'pass'}return typeof pdKind=='function'?pdKind(all[n]).toLowerCase():'zone'};
 const keep=n=>f=='all'?true:f=='sug'?sn.includes(n):f=='mine'?!!(u?CP[n]:DCP[n]):kind(n)==f;
 const box=document.createElement('div');box.innerHTML=h;const cards=box.querySelector('.cards');if(cards){[...cards.children].forEach(c=>{const n=c.getAttribute(u?'data-p':'data-d');if(!keep(n))c.remove();else{const tg=(u?offTags(n):defTags(n)).slice(0,2);if(tg.length)c.insertAdjacentHTML('beforeend',`<small class="p3t">${tg.join(' · ')}</small>`);if(sn[0]==n)c.classList.add('p3best')}});
  if(f=='sug')sn.forEach(n=>{const c=[...cards.children].find(x=>x.getAttribute(u?'data-p':'data-d')==n);if(c)cards.appendChild(c)});[...cards.querySelectorAll('.card')].forEach((c,i)=>{const k=c.querySelector('kbd');if(k)k.remove();if(i<9&&!(typeof TOUCH=='function'&&TOUCH()))c.insertAdjacentHTML('afterbegin',`<kbd>${i+1}</kbd>`)});
 if(!cards.children.length)cards.innerHTML='<p class="small dim">No plays here yet.</p>'}
 const top=sug[0],why=top?[...new Set(top.why.concat(top.rec?[top.rec]:[]))].slice(0,3):[];
 const coach=top?`<div class="p3c"><div class="p3ci">&#129506;</div><div class="p3cb"><div class="p3cl">Coach's suggestion</div><div class="p3cn">${esc(top.n)}</div><div class="p3cw">${why.length?why.map(esc).join(' · '):'A solid call here.'}</div>
  ${sug.length>1?`<div class="p3ca">Also good: ${sug.slice(1).map(s=>`<button ${u?'data-p':'data-d'}="${esc(s.n)}">${esc(s.n)}</button>`).join(' ')}</div>`:''}</div><button class="p3go" ${u?'data-p':'data-d'}="${esc(top.n)}">Call it</button></div>`:'';
 const tabs=`<div class="p3tabs">${(u?P3OF:P3DF).map(([k,t])=>`<button class="${f==k?'on':''}" onclick="event.stopPropagation();${u?'G.pbF':'G.pbD'}='${k}';ui()">${t}</button>`).join('')}</div>`;
 const hh=box.querySelector('h3');if(hh)hh.insertAdjacentHTML('afterend',coach+tabs);h=box.innerHTML}catch(e){console.error(e)}return h}}
// the old Suggest button now asks the coach
suggest=function(){if(!feat('coach2'))return;const s=coachSug(1,'U',1)[0];if(!s)return;if(s.n!=P.name)chg(()=>{applyPlay(s.n);sel=-1});G.msg=`Coach: ${s.n}${s.why.length?' ('+s.why[0]+')':''}.`;ui()};
{const s=document.createElement('style');s.textContent=`.p3c{display:flex;align-items:center;gap:10px;background:linear-gradient(90deg,#14532dcc,#0b1626cc);border:1px solid #4ade8066;border-radius:10px;padding:8px 10px;margin:0 0 8px}
.p3ci{font-size:28px}.p3cb{flex:1;min-width:0}.p3cl{font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#86efac}.p3cn{font:800 18px "Trebuchet MS",sans-serif;color:#fff}.p3cw{font-size:12px;color:#d1fae5}
.p3ca{font-size:11px;color:#9fb5a8;margin-top:3px}.p3ca button{padding:2px 8px;font-size:11px;border-radius:999px;margin:1px 2px}.p3go{padding:10px 16px;font-weight:800;background:#16a34a;color:#fff;border:0;border-radius:8px;cursor:pointer}
.p3tabs{display:flex;gap:4px;flex-wrap:wrap;margin:0 0 8px}.p3tabs button{padding:4px 10px;border-radius:999px;font-size:12px}.p3tabs button.on{background:#ffd84d;color:#0b1410}
.card .p3t{display:block;font-size:9px;color:#9fb5a8;line-height:1.2;margin-top:1px}.card.p3best{outline:2px solid #4ade80;outline-offset:-2px}`;document.head.appendChild(s)}
// ---------- tags in the play designers start from the stock tags ----------
if(typeof peTag=='function')peTag=function(k){if(typeof PTAG=='undefined')return;const a=PTAG[PE.n]=offTags(PE.n).slice(),i=a.indexOf(k);if(i<0)a.push(k);else a.splice(i,1);lsSet('gdtags',JSON.stringify(PTAG));peUI()};
function pdTag(k){const a=PDTAG[DZ.n]=defTags(DZ.n).slice(),i=a.indexOf(k);if(i<0)a.push(k);else a.splice(i,1);lsSet('gddtags',JSON.stringify(PDTAG));pdUI()}
if(typeof pdUI=='function'){const _pu=pdUI;pdUI=function(){_pu();try{const sd=$('pd-side');if(!sd||!feat('coach2'))return;const tg=defTags(DZ.n);sd.insertAdjacentHTML('beforeend',`<div class="pe-card"><div class="pe-ct">Tags <span class="small dim">(the coach suggests by these)</span></div><div class="pe-row">${DTAGS.map(k=>`<button class="${tg.includes(k)?'on':''}" onclick="pdTag('${k}')">${k}</button>`).join('')}</div></div>`)}catch(e){}}}

// number keys and the controller shoulder buttons pick from the cards as shown (not the coach card's buttons)
pbOrder=function(u){const d=document.createElement('div');d.innerHTML=pbHTML(u);return[...d.querySelectorAll('.card')].map(b=>u?b.dataset.p:b.dataset.d).filter(Boolean)};
