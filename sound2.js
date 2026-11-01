'use strict';
// Better sound (needs Sound switched on too): a living crowd that murmurs, swells on big plays, gets loud when the
// home defense is on third down, cheers, groans and boos depending on who did what; layered tackle hits, a throw
// whoosh, a leather pop on catches, a boot on kicks, a clang when a kick doinks off the upright, and a drumline
// and clap chants between plays. Its own switch on the Game features page.
{const a=['Presentation','sound2','Better sound','A crowd that reacts to every play (cheers, groans, boos, third-down noise), layered hits, throws and catches, a doink clang, and a drumline between plays. Needs Sound on.'];
 if(!FEATS.some(f=>f[1]==a[1])){const i=FEATS.findIndex(f=>f[1]=='sound');FEATS.splice(i<0?FEATS.length:i+1,0,a)}}
const SN={bus:null,mur:null,rum:null,lfo:null,t:0,lvl:0,band:30,chant:null,last:0};
const sOn=()=>!!(AC&&XNB&&feat('sound')&&feat('sound2'));
function sBus(){if(SN.bus||!AC)return SN.bus;try{const c=AC.createDynamicsCompressor();c.threshold.value=-14;c.ratio.value=4;const g=AC.createGain();g.gain.value=.9;c.connect(g);g.connect(AC.destination);SN.bus=c;
 // crowd bed: a low rumble and a murmuring chatter band with a slow wobble
 const mk=(type,f,q)=>{const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),gn=AC.createGain();s.buffer=XNB;s.loop=true;fl.type=type;fl.frequency.value=f;fl.Q.value=q;gn.gain.value=0;s.connect(fl);fl.connect(gn);gn.connect(c);s.start(0,Math.random()*1.5);return gn};
 SN.rum=mk('lowpass',320,.7);SN.mur=mk('bandpass',1050,.6);const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=.31;lg.gain.value=.012;l.connect(lg);lg.connect(SN.mur.gain);l.start();SN.lfo=l}catch(e){SN.bus=null}return SN.bus}
function sOut(){return sBus()||AC.destination}
function sTone(type,f0,f1,dur,vol,t0){const t=AC.currentTime+(t0||0),o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(sOut());o.start(t);o.stop(t+dur+.05)}
function sNz(dur,type,f,q,vol,t0,f2,att){const t=AC.currentTime+(t0||0),s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();s.buffer=XNB;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);fl.Q.value=q||.7;
 if(att){g.gain.setValueAtTime(.0008,t);g.gain.exponentialRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0008,t+dur)}else{g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur)}s.connect(fl);fl.connect(g);g.connect(sOut());s.start(t,Math.random()*1.5);s.stop(t+dur+.05)}
// crowd reactions
function sReact(k,v){if(!sOn())return;v=v==null?1:v;try{
 if(k=='cheer'){sNz(1.6*v+.4,'bandpass',900,.5,.22*v,0,1300,.25);sNz(1.4*v+.3,'bandpass',2200,.8,.08*v,.05,null,.3);sClaps(1.6*v,.6*v)}
 else if(k=='roar'){sNz(2.6,'bandpass',800,.45,.32,0,1250,.18);sNz(2.4,'bandpass',2000,.7,.12,.05,null,.2);sNz(2.2,'lowpass',380,.7,.2,0,null,.2);sClaps(2.4,1)}
 else if(k=='ooh'){sNz(.9,'bandpass',480,3,.22*v,0,820,.18);sNz(.85,'bandpass',950,3,.12*v,.02,1500,.2)}
 else if(k=='groan'){sNz(1.3,'bandpass',820,2.2,.2*v,0,360,.15);sNz(1.2,'bandpass',1500,2.5,.08*v,.03,700,.15)}
 else if(k=='boo'){const t=AC.currentTime,s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();s.buffer=XNB;fl.type='bandpass';fl.frequency.value=330;fl.Q.value=3;
  g.gain.setValueAtTime(.0008,t);g.gain.exponentialRampToValueAtTime(.26*v,t+.35);g.gain.setValueAtTime(.26*v,t+1.1);g.gain.exponentialRampToValueAtTime(.0008,t+1.9);l.frequency.value=5.5;lg.gain.value=.07*v;l.connect(lg);lg.connect(g.gain);s.connect(fl);fl.connect(g);g.connect(sOut());s.start(t,Math.random());s.stop(t+2);l.start(t);l.stop(t+2)}}catch(e){}}
function sClaps(dur,dens){const n=Math.round(14*dur*dens);for(let i=0;i<n;i++)sNz(.035,'highpass',1700+Math.random()*900,.7,.05+Math.random()*.05,Math.random()*dur)}
// a drumline groove and clap chants between plays
function sBand(){const b=60/112;for(let bar=0;bar<2;bar++)for(let s=0;s<8;s++){const t=(bar*8+s)*b/2;if(s==0||s==4||(s==6&&bar==1))sTone('sine',95,48,.22,.16,t);if(s==2||s==6)sNz(.11,'highpass',1600,.7,.12,t);if(s%2==1)sNz(.05,'highpass',2600,.7,.05,t);if(bar==1&&s==7){sNz(.05,'highpass',1700,.7,.08,t+b/8);sNz(.05,'highpass',1700,.7,.09,t+b/4)}}}
function sChant(){const b=.36;[0,1,2.2,2.7,3.2].forEach((x,i)=>{for(let j=0;j<9;j++)sNz(.05,'highpass',1500+Math.random()*1000,.7,.045,x*b+Math.random()*.03)});[0,1].forEach(r=>[0,1,2.2,2.7,3.2].forEach(x=>{for(let j=0;j<9;j++)sNz(.05,'highpass',1500+Math.random()*1000,.7,.045,(x+(r+1)*4.4)*b+Math.random()*.03)}))}
// ---------- better individual sounds ----------
{const _sfx=sfx;sfx=function(n,...a){if(!sOn())return n=='doink'?(AC&&feat('sound')?_sfx('hit'):void 0):_sfx(n,...a);try{
 if(n=='hit'){sTone('sine',105,42,.2,.42);sNz(.04,'bandpass',2300,1.4,.28);sNz(.15,'lowpass',650,.7,.32);return}
 if(n=='big'){sTone('sine',120,36,.3,.6);sNz(.05,'bandpass',2100,1.2,.4);sNz(.25,'lowpass',800,.7,.5);sReact('ooh',1);return}
 if(n=='catch'){sNz(.035,'bandpass',1400,2.5,.32);sTone('sine',230,120,.07,.22);return}
 if(n=='kick'){sTone('sine',150,48,.16,.65);sNz(.03,'bandpass',1100,2,.4);sNz(.12,'lowpass',900,.7,.25);return}
 if(n=='hike'){sTone('square',215,200,.07,.045);sTone('square',175,150,.09,.05,.16);sNz(.05,'bandpass',1800,1.5,.08,.16);return}
 if(n=='doink'){[523,1307,2154,3010].forEach((f,i)=>sTone('sine',f,f*.995,1.1-i*.2,.1/(i+1)));sNz(.03,'highpass',3000,.7,.15);sReact('ooh',1.2);return}
 }catch(e){}return _sfx(n,...a)}}
{const _ta=throwAt;throwAt=function(...a){const r=_ta.apply(this,a);try{if(sOn()&&P&&P.b&&P.b.st=='air')sNz(.32,'bandpass',420,1.2,.07,.02,1700)}catch(e){}return r}}
// the old single-noise crowd is muted while the new one runs
{const _cr=crowd;crowd=function(v){return _cr(sOn()?0:v)}}
// ---------- reactions to plays ----------
const sHome=()=>G&&G.home=='C'?'C':'U';
{const _ep=endPlay;endPlay=function(k,x){const ov=!P||P.over,po=G.poss,L0=P&&P.L,d=G.dir,kr=P&&P.kr;_ep(k,x);try{if(ov||!P||!P.over||!sOn()||!G.live)return;const hm=sHome(),homeO=po==hm,g=x!=null&&L0!=null?(x-L0)*d:0;
 if(k=='td')sReact(homeO?'roar':'boo',homeO?1:1);
 else if(k=='sack')sReact(homeO?'groan':'cheer',homeO?.8:1);
 else if(k=='safety')sReact(homeO?'groan':'roar');
 else if(k=='inc')sReact(homeO?'groan':'cheer',.45);
 else if(k=='tackle'&&!kr){if(g>=20)sReact(homeO?'cheer':'groan',1);else if(/FIRST DOWN/.test(G.msg||''))sReact(homeO?'cheer':'groan',.5);else if(g<=-2)sReact(homeO?'groan':'cheer',.5)}}catch(e){}}}
{const _ir=intReturn;intReturn=function(l,p,...a){const hm=sHome(),def=p&&p.t?p.t:(G.poss=='U'?'C':'U');const r=_ir(l,p,...a);try{if(sOn())sReact(def==hm?'roar':'groan',1)}catch(e){}return r}}
{const _ke=kEnd;kEnd=function(...a){const kk=P&&P.kk,po=G.poss;const r=_ke.apply(this,a);try{if(!sOn()||!kk||kk.kind=='punt')return r;const good=/GOOD|is good/.test(G.msg),hm=sHome();sReact(good?(po==hm?'cheer':'groan'):(po==hm?'groan':'cheer'),.8)}catch(e){}return r}}
// ---------- the crowd level, every frame ----------
function sTick(dt){if(!AC||!SN.bus&&!sOn())return;if(!sOn()){if(SN.mur){SN.mur.gain.setTargetAtTime(0,AC.currentTime,.3);SN.rum.gain.setTargetAtTime(0,AC.currentTime,.3)}return}sBus();
 SN.t-=dt;if(SN.t>0)return;SN.t=.2;const hm=sHome(),ex=typeof XV=='object'&&XV.ex?Math.min(1,(XV.ex[hm]||0)+.3*(XV.ex[hm=='U'?'C':'U']||0)):0;
 let v=0;if(G&&G.live&&!G.paused){v=.05+(G.phase=='play'?.03:0)+(R.lg.po?.03:0)+(G.night?.012:0)+Math.abs(G.mom||0)/100*.04+ex*.18;
  if(G.down==3&&G.poss!=hm&&(G.phase=='pre'||G.phase=='motion'||G.phase=='play'))v+=.07;if(G.poss==hm&&G.phase=='pre')v*=.7;if(G.phase=='replay')v*=.5}
 const t=AC.currentTime;SN.mur.gain.setTargetAtTime(v,t,.35);SN.rum.gain.setTargetAtTime(v*.85,t,.45);
 // drumline and chants between plays
 if(G&&G.live&&G.phase=='pre'&&!G.paused){SN.band-=.2;if(SN.band<=0&&Math.random()<.15){SN.band=28+Math.random()*30;sBand()}
  if(G.down==3&&G.poss!=hm&&SN.chant!==G.los+':'+G.q){SN.chant=G.los+':'+G.q;sChant()}}}
{const _dr=draw;draw=function(){const now=performance.now()/1000,dt=Math.min(.1,SN.last?now-SN.last:0);SN.last=now;try{sTick(dt)}catch(e){}return _dr()}}
