(function(){
'use strict';
const E=id=>document.getElementById(id);
const TARGET_KEY='lighting_artnet_target_v1';
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{
  title:'📡 ART-NET CONTROL',
  intro:'Pošalji stvarne Art-Net DMX vrednosti preko Wi-Fi mreže. Izaberi uređaj iz postojećeg DMX Patch-a da se Universe i početna adresa popune automatski.',
  target:'ART-NET NODE / IP',patchDevice:'UREĐAJ IZ DMX PATCH-A',manual:'Ručno / bez Patch uređaja',refresh:'OSVEŽI PATCH',
  universe:'UNIVERSE',channel:'DMX KANAL',value:'VREDNOST',send:'POŠALJI TEST',blackout:'BLACKOUT UNIVERSE',
  ready:'Spremno za slanje.',sending:'Šaljem Art-Net…',sent:'Art-Net paket je poslat.',error:'Slanje nije uspelo.',
  native:'Art-Net zahteva Android build.',patch:'Universe i START adresa se preuzimaju iz postojećeg DMX Patch planera. Značenje konkretnog kanala mora biti verifikovano DMX profilom proizvođača.',
  patchEmpty:'Nema ispravnih uređaja u DMX Patch-u. Dodaj uređaj i unesi broj kanala.',patchLoaded:'Učitano iz Patch-a',patchWarn:'Ovaj Patch red ima upozorenje i nije bezbedan za automatsko učitavanje.',
  ownership:'TEST režim šalje kompletan Universe iz LightingAI-ja; kanali koje ovde nisi postavio ostaju 0. Ne koristi ga paralelno sa drugom DMX konzolom na istom Universe-u.',
  verifiedTitle:'VERIFIKOVANE KONTROLE',verifiedNone:'Za ovaj uređaj i izabrani DMX mode još nema verifikovanih direktnih kontrola.',verifiedSource:'Profil verifikovan prema zvaničnoj DMX dokumentaciji.',dimmer:'DIMMER'
 },
 en:{
  title:'📡 ART-NET CONTROL',
  intro:'Send real Art-Net DMX values over Wi-Fi. Choose a device from the existing DMX Patch to fill Universe and start address automatically.',
  target:'ART-NET NODE / IP',patchDevice:'DEVICE FROM DMX PATCH',manual:'Manual / no Patch device',refresh:'REFRESH PATCH',
  universe:'UNIVERSE',channel:'DMX CHANNEL',value:'VALUE',send:'SEND TEST',blackout:'BLACKOUT UNIVERSE',
  ready:'Ready to send.',sending:'Sending Art-Net…',sent:'Art-Net packet sent.',error:'Send failed.',
  native:'Art-Net requires the Android build.',patch:'Universe and START address come from the existing DMX Patch planner. The meaning of each channel must still be verified from the manufacturer DMX profile.',
  patchEmpty:'No valid devices in the DMX Patch. Add a device and enter its channel count.',patchLoaded:'Loaded from Patch',patchWarn:'This Patch row has a warning and is not safe to auto-load.',
  ownership:'TEST mode sends a complete Universe from LightingAI; channels not set here remain at 0. Do not use it in parallel with another DMX console on the same Universe.',
  verifiedTitle:'VERIFIED CONTROLS',verifiedNone:'This fixture and selected DMX mode do not yet have verified direct controls.',verifiedSource:'Profile verified against official DMX documentation.',dimmer:'DIMMER'
 }
};
const t=()=>TXT[lang()];
const esc=v=>String(v==null?'':v).replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[ch]));
let seq=0;
const frames={};
function status(s,ok){const el=E('artnetStatus');if(!el)return;el.textContent=s;el.style.color=ok===false?'#ffb5b5':ok===true?'#b8f0d1':'#9299a3';}
function snapshot(){try{return window.LightingAIDmxSnapshot?window.LightingAIDmxSnapshot():null}catch(e){return null}}
function rows(){const s=snapshot();return s&&Array.isArray(s.rows)?s.rows:[]}
function defaultUniverse(){const s=snapshot();return s&&Array.isArray(s.universes)&&s.universes.length?s.universes[0]:1}
function frame(universe){const u=String(Math.max(1,Number(universe)||1));if(!frames[u])frames[u]=new Array(512).fill(0);return frames[u]}
function patchLabel(r){const end=r.end==null?'?':r.end;return 'U'+r.universe+' · '+r.start+'-'+end+' · '+(r.name||r.fixtureId||('DMX '+r.index))+(r.mode?' · '+r.mode:'')}
function patchUsable(r){return r&&Number(r.channels)>0&&Array.isArray(r.flags)&&r.flags.length===0}
function fixtureForRow(r){
 const list=Array.isArray(window.catalogFixtures)?window.catalogFixtures:[];
 return r&&r.fixtureId?list.find(f=>f&&f.id===r.fixtureId):null;
}
function profileForRow(r){
 const f=fixtureForRow(r),modes=f&&Array.isArray(f.dmxModes)?f.dmxModes:[];
 if(!r||!r.mode)return null;
 return modes.find(m=>m&&m.name===r.mode&&m.verified===true)||null;
}
function selectedPatchRow(){
 const select=E('artnetPatchDevice');
 if(!select||select.value==='')return null;
 return rows()[Number(select.value)]||null;
}
function renderVerifiedControls(r){
 const box=E('artnetVerifiedControls');if(!box)return;
 const profile=profileForRow(r),fixture=fixtureForRow(r),controls=profile&&Array.isArray(profile.controls)?profile.controls:[];
 if(!profile||!controls.length){box.innerHTML='<div class="muted small">'+esc(t().verifiedNone)+'</div>';return}
 const items=controls.map((ctrl,i)=>{
  if(ctrl.type!=='percent')return '';
  const label=ctrl.key==='dimmer'?t().dimmer:(ctrl.label||ctrl.key||('CH '+ctrl.channel));
  return '<div style="padding:10px 0;border-top:1px solid #2d333a"><div style="display:flex;justify-content:space-between;gap:8px"><b>'+esc(label)+'</b><span id="artnetVerifiedValue_'+i+'" class="muted small">0%</span></div><input class="artnet-verified-range" data-index="'+i+'" type="range" min="'+Number(ctrl.min||0)+'" max="'+Number(ctrl.max||100)+'" value="0" style="margin-top:8px"></div>';
 }).join('');
 box.innerHTML='<div style="font-size:11px;color:#9da3ad;margin-top:12px">'+esc(t().verifiedTitle)+'</div><div style="font-weight:800;margin-top:4px">'+esc((fixture.manufacturer||'')+' '+(fixture.model||fixture.id))+'</div><div class="muted small">'+esc(profile.name)+' · '+Number(profile.channels||r.channels)+' ch</div>'+items+'<div class="muted small" style="margin-top:7px">'+esc(t().verifiedSource)+'</div>';
 box.querySelectorAll('.artnet-verified-range').forEach(input=>{
  input.addEventListener('input',()=>{
   const idx=Number(input.dataset.index),v=Number(input.value)||0,readout=E('artnetVerifiedValue_'+idx);
   if(readout)readout.textContent=Math.round(v)+'%';
  });
  input.addEventListener('change',()=>sendVerifiedControl(r,profile,controls[Number(input.dataset.index)],Number(input.value)||0));
 });
}
function sendVerifiedControl(r,profile,ctrl,value){
 if(!patchUsable(r)||!profile||!ctrl)return;
 const u=Math.max(1,Number(r.universe)||1);
 const address=Math.min(512,Math.max(1,Number(r.start)||1)+Math.max(1,Number(ctrl.channel)||1)-1);
 if(address>512){status(t().error,false);return}
 const inMin=Number(ctrl.min||0),inMax=Number(ctrl.max||100),outMin=Number(ctrl.dmxMin||0),outMax=Number(ctrl.dmxMax==null?255:ctrl.dmxMax);
 const normalized=inMax===inMin?0:Math.max(0,Math.min(1,(Number(value)-inMin)/(inMax-inMin)));
 const dmx=Math.round(outMin+normalized*(outMax-outMin));
 const f=frame(u);f[address-1]=Math.max(0,Math.min(255,dmx));sendFrame(f.slice(),u);
}
function renderPatchDevices(){
 const select=E('artnetPatchDevice');if(!select)return;
 const previous=select.value;
 const rs=rows();
 let h='<option value="">'+t().manual+'</option>';
 rs.forEach((r,i)=>{const usable=patchUsable(r);h+='<option value="'+i+'" '+(usable?'':'disabled')+'>'+patchLabel(r)+(usable?'':' ⚠')+'</option>'});
 select.innerHTML=h;
 if(previous&&select.querySelector('option[value="'+previous+'"]:not([disabled])'))select.value=previous;
 const hint=E('artnetPatchSelectionHint');
 if(hint)hint.textContent=rs.length?'':t().patchEmpty;
}
function choosePatch(){
 const select=E('artnetPatchDevice');if(!select||select.value==='')return;
 const r=rows()[Number(select.value)];
 if(!patchUsable(r)){status(t().patchWarn,false);return}
 E('artnetUniverse').value=Math.max(1,Number(r.universe)||1);
 E('artnetChannel').value=Math.min(512,Math.max(1,Number(r.start)||1));
 const hint=E('artnetPatchSelectionHint');
 if(hint)hint.textContent=t().patchLoaded+': '+patchLabel(r);
 renderVerifiedControls(r);
 status(t().ready);
}
function sendFrame(channels,universe){
 if(!window.Android||typeof Android.artNetSendDmx!=='function'){status(t().native,false);return}
 const ip=(E('artnetTarget')&&E('artnetTarget').value||'255.255.255.255').trim();
 try{localStorage.setItem(TARGET_KEY,ip)}catch(e){}
 const id='artnet_'+Date.now()+'_'+(++seq);
 status(t().sending);
 try{Android.artNetSendDmx(id,ip,Number(universe)||1,JSON.stringify(channels));}
 catch(e){status(t().error,false)}
}
function sendTest(){
 const u=Math.max(1,Number(E('artnetUniverse').value)||1);
 const ch=Math.min(512,Math.max(1,Number(E('artnetChannel').value)||1));
 const v=Math.min(255,Math.max(0,Number(E('artnetValue').value)||0));
 const f=frame(u);f[ch-1]=v;sendFrame(f.slice(),u);
}
function blackout(){
 const u=Math.max(1,Number(E('artnetUniverse').value)||1);
 frames[String(u)]=new Array(512).fill(0);
 sendFrame(frames[String(u)].slice(),u);
}
window.LightingAIArtNetResult=function(id,ok,message){
 status(ok?t().sent:(message||t().error),!!ok);
};
function translate(){
 if(!E('artnetCard'))return;
 const x=t();
 E('artnetTitle').textContent=x.title;E('artnetIntro').textContent=x.intro;E('artnetTargetLabel').textContent=x.target;
 E('artnetPatchDeviceLabel').textContent=x.patchDevice;E('artnetRefreshPatch').textContent=x.refresh;
 E('artnetUniverseLabel').textContent=x.universe;E('artnetChannelLabel').textContent=x.channel;E('artnetValueLabel').textContent=x.value;
 E('artnetSend').textContent=x.send;E('artnetBlackout').textContent=x.blackout;E('artnetPatchHint').textContent=x.patch;E('artnetOwnership').textContent=x.ownership;
 renderPatchDevices();
 if(!E('artnetStatus').textContent)status(x.ready);
}
function install(){
 const page=E('equipment');if(!page||E('artnetCard'))return false;
 const card=document.createElement('details');card.id='artnetCard';card.className='card';card.style.border='1px solid #31506b';
 card.innerHTML='<summary style="font-weight:900;font-size:20px;cursor:pointer"><span id="artnetTitle"></span></summary><div style="margin-top:12px"><p id="artnetIntro" class="muted small"></p><div class="row"><div><label class="caption" id="artnetTargetLabel"></label><input id="artnetTarget" inputmode="decimal"></div><div><label class="caption" id="artnetPatchDeviceLabel"></label><select id="artnetPatchDevice"></select><button id="artnetRefreshPatch" class="btn secondary" type="button" style="width:100%;margin-top:7px"></button><div id="artnetPatchSelectionHint" class="muted small" style="margin-top:6px"></div></div></div><div class="row"><div><label class="caption" id="artnetUniverseLabel"></label><input id="artnetUniverse" type="number" min="1" max="32768"></div><div><label class="caption" id="artnetChannelLabel"></label><input id="artnetChannel" type="number" min="1" max="512" value="1"></div></div><div><label class="caption" id="artnetValueLabel"></label><input id="artnetValue" type="range" min="0" max="255" value="0"><div id="artnetValueReadout" class="muted small" style="margin-top:5px">0 / 255</div></div><div class="actions"><button id="artnetSend" class="btn primary" type="button"></button><button id="artnetBlackout" class="btn danger" type="button"></button></div><div id="artnetStatus" class="muted small" style="margin-top:8px"></div><div id="artnetVerifiedControls" style="margin-top:10px"></div><div id="artnetPatchHint" class="muted small" style="margin-top:8px"></div><div id="artnetOwnership" class="status warn" style="margin-top:10px"></div></div>';
 const dmx=E('dmxCard');if(dmx&&dmx.parentNode)dmx.parentNode.insertBefore(card,dmx.nextSibling);else page.appendChild(card);
 try{E('artnetTarget').value=localStorage.getItem(TARGET_KEY)||'255.255.255.255'}catch(e){E('artnetTarget').value='255.255.255.255'}
 E('artnetUniverse').value=defaultUniverse();
 E('artnetValue').addEventListener('input',()=>{E('artnetValueReadout').textContent=E('artnetValue').value+' / 255'});
 E('artnetPatchDevice').addEventListener('change',()=>{choosePatch();if(E('artnetPatchDevice').value==='')renderVerifiedControls(null)});
 E('artnetRefreshPatch').addEventListener('click',()=>{renderPatchDevices();status(t().ready)});
 E('artnetSend').addEventListener('click',sendTest);E('artnetBlackout').addEventListener('click',blackout);
 translate();return true;
}
window.LightingAIArtNetControl={version:'0.3-verified-dmx-controls',refreshPatch:renderPatchDevices};
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>160)clearInterval(timer)},100);
const old=window.setLanguage;if(typeof old==='function'&&!window.__artNetLangHook){window.__artNetLangHook=true;window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
})();