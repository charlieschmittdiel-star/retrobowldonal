'use strict';
// Neighborhood stage 3: street pickup games in the park. Walk onto a court or field and press E to see which crews
// are playing. Football is 3 on 3 on the real field with the real game engine (sfb.js); basketball and soccer are
// simple top-down mini games (smini.js). Winning pays money and fame; losing costs a little money and a little pride.
// Each crew plays you once a week. Crew names are made up. Load after wreck.js, before sfb.js and smini.js.
{const add=[['Career','street','Street pickup games','In the Neighborhood park, play short pickup games: 3-on-3 football on the real field, 2-on-2 basketball and 3-on-3 soccer. Win money and fame; losing costs a little money and a little pride.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// crews: name, skill (how good their players are; difficulty settings still only change how smart they play), money for a win ($M), fame needed
const SG={fb:{n:'Pickup football',w:'football',zone:'field',ic:'🏈',fmt:'3 on 3 on the real field, attacking the same end zone. Four possessions each, touchdowns only. 4 downs to score, with one first down at midfield. The rusher counts to 3 before he can come.',
  crews:[['Oak Ave Kids',52,.02,0],['Park Regulars',60,.05,20],['Old College Guys',68,.1,45]]},
 hoops:{n:'Pickup basketball',w:'basketball',zone:'court',ic:'🏀',fmt:'2 on 2, half court, first to 7. Baskets inside the arc count 1, outside count 2. Teams take turns with the ball after every basket.',
  crews:[['Rec Center Crew',50,.02,0],['Blacktop Kings',60,.05,20],['Streetball Legends',70,.1,45]]},
 soc:{n:'Pickup soccer',w:'soccer',zone:'pitch',ic:'⚽',fmt:'3 on 3 in the cage: two players and a keeper on each side, and the ball bounces off the walls. First to 3 goals, or whoever is ahead after 3 minutes.',
  crews:[['Sunday League',50,.02,0],['Cage Masters',60,.05,20],['Semi-Pro Old Boys',70,.1,45]]}};
const SGKEYS={fb:'You are the QB on offense: pull back on the field to throw, WASD to scramble, Space pump fake. With the ball: arrows for moves (↑ ↓ juke, → truck, ← spin). On defense you cover a receiver: E intercept, R swat, F or → hit stick. Esc quits.',
 hoops:'WASD move · hold Space to shoot, let go at the top of the meter · E pass (or call for the ball) · ← → crossover · ↑ step back · ↓ spin. On defense: E steal, Space block. Esc quits.',
 soc:'WASD move (run into the ball to dribble) · hold Space to shoot (longer = harder) · E pass · ← → sidestep · ↑ knock it ahead. On defense: E tackle. Esc quits.'};
const SG_LOSE=.3;                                    // a loss costs this share of the crew's win money (and 1 fame)
const sgOn=()=>feat('street')&&feat('hood')&&CAR()&&!!R.me;
function SGS(){const h=HDS();if(!h.sg||typeof h.sg!='object')h.sg={};return h.sg}
function sgRec(s,i){const r=SGS()[s+i];return r&&typeof r=='object'?r:{w:-1,W:0,L:0,T:0}}
function sgCrew(s,i){const c=SG[s].crews[i];return{s,i,n:c[0],r:c[1],win:c[2],lose:Math.max(.01,Math.round(c[2]*SG_LOSE*100)/100),fame:c[3],fw:i==2?2:1}}
const sgSport=z=>Object.keys(SG).find(s=>SG[s].zone==z);
// the park signs and messages (hood.js asks for these)
function hdZoneMsg(z){return feat('street')?`${z.n}: press E to see who's playing.`:`${z.n}: pickup games are switched off.`}
function hdZoneSign(z){return`${z.n} · press E`}
// ---------- the crews at each court ----------
function hdStreet(z,note){const s=sgSport(z);if(!s||!HD)return;const S=SG[s];
 if(!feat('street'))return hdPanel('street',`${S.ic} ${S.n}`,'<p>Pickup games are switched off on the Game features page (Street pickup games).</p>');
 const f=fame(),h=HDS(),p=meRow();let body=`${p&&p.inj?'<p class="l">You are injured. No pickup games until you are healthy.</p>':''}<p>${S.fmt}</p><p class="small dim">${SGKEYS[s]}</p><p class="small dim">Each crew plays you once a week (a new week starts after your next game). Quitting a game counts as a loss.</p><h3>Who's playing</h3>`;
 S.crews.forEach((_,i)=>{const c=sgCrew(s,i),r=sgRec(s,i),done=r.w===h.wk,lock=f<c.fame;
  body+=hdRow(`${esc(c.n)} <span class="dim small">· skill ${c.r}</span>`,`Win: +${HM$(c.win)} and +${c.fw} fame. Lose: -${HM$(c.lose)} and -1 fame. Your record: ${r.W}-${r.L}${r.T?'-'+r.T:''}.`,'',
   lock?`<span class="dim small">Needs fame ${c.fame}</span>`:done?'<span class="dim small">Played this week</span>':p&&p.inj?'':hdBtn(`hdStreetGo('${s}',${i})`,'Play'),done?'own':'')});
 hdPanel('street',`${S.ic} ${S.n}`,body,note)}
let SGNOW=null;
function hdStreetGo(s,i){const c=sgCrew(s,i),h=HDS(),r=sgRec(s,i),p=meRow();if(!sgOn()||!HD||r.w===h.wk||fame()<c.fame||(p&&p.inj))return HD&&hdStreet(SG[s].zone);
 SGNOW=c;hdPanClose();if(s=='fb'){hdHide();sfStart(c)}else smStart(s,c)}
// close the map without going back to the career page (football is played on the game field)
function hdHide(){if(!HD)return;const h=HDS();h.pos=[Math.round(HD.me.x),Math.round(HD.me.y)];
 try{if(HD.burn&&HD.car&&typeof hdTotal=='function'){const id=HD.car.id;HD.car=null;HD.burn=0;hdTotal(id)}else hdCarSave()}catch(e){console.error(e)}
 HD.on=0;HD=null;const el=$('hood');if(el)el.remove();for(const k in HDK)HDK[k]=0;save()}
// ---------- results: money, fame, record, then back to the map ----------
function hdStreetDone(c,us,them,forfeit,lines){const h=HDS(),rs=SGS(),r=sgRec(c.s,c.i),S=SG[c.s],p=meRow();r.w=h.wk;
 const res=forfeit?'L':us>them?'W':us<them?'L':'T';let msg;
 if(res=='W'){r.W++;hdPay(`Pickup ${S.w} win vs ${c.n}`,c.win);fameAdd(c.fw);msg=`You won ${HM$(c.win)} and +${c.fw} fame.`;if(c.i==2&&p)addNews(`${p.n} beats the ${c.n} in a pickup ${S.w} game at the park.`)}
 else if(res=='L'){r.L++;const v=Math.min(c.lose,Math.max(0,hdC(R.money||0)));if(v>0)hdPay(`Pickup ${S.w} loss vs ${c.n}`,-v);fameAdd(-1);msg=`${forfeit?'You quit, so it counts as a loss. ':''}${v>0?`That cost you ${HM$(v)} and`:'Your wallet is empty, so it only cost you'} a little pride (-1 fame).`}
 else{r.T++;msg='A tie. Nobody pays.'}
 rs[c.s+c.i]=r;save();SGNOW=null;if(!HD)hoodUI();
 if(HD)hdPanel('street',`${S.ic} ${res=='W'?'You won!':res=='L'?'You lost':'A tie'}`,`<div class="sgres"><b>${us} – ${them}</b><span>vs ${esc(c.n)}</span></div><p>${msg}</p>${(lines||[]).map(t=>`<p class="small">${esc(t)}</p>`).join('')}<div class="btns">${hdBtn('hdPanClose()','Back to the Neighborhood')}</div>`)}
// ---------- on the map: a prompt on the courts, and E opens the crews ----------
{const _cu=hdCarUI;hdCarUI=function(g){_cu(g);try{if(HD&&!HD.drive&&!HD.pan&&HD.zone&&!HD.near&&sgSport(HD.zone)&&feat('street'))hdBubble(g,HD.me.x,HD.me.y-30,`E  ${SG[sgSport(HD.zone)].n}`,1)}catch(e){console.error(e)}}}
{const _ck=hdCarKey;hdCarKey=function(k){try{if(HD&&!HD.drive&&(k=='e'||k=='enter')&&HD.zone&&!HD.near&&sgSport(HD.zone)){hdStreet(HD.zone);return true}}catch(e){console.error(e)}return _ck(k)}}
