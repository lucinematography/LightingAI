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
  native:'Art-Net zahteva podržani native control bridge.',patch:'Universe i START adresa se preuzimaju iz postojećeg DMX Patch planera. Značenje konkretnog kanala mora biti verifikovano DMX profilom proizvođača.',
  patchEmpty:'Nema ispravnih uređaja u DMX Patch-u. Dodaj uređaj i unesi broj kanala.',patchLoaded:'Učitano iz Patch-a',patchWarn:'Ovaj Patch red ima upozorenje i nije bezbedan za automatsko učitavanje.',
  ownership:'TEST režim šalje kompletan Universe iz LightingAI-ja; kanali koje ovde nisi postavio ostaju 0. Ne koristi ga paralelno sa drugom DMX konzolom na istom Universe-u.',
  verifiedTitle:'VERIFIKOVANE KONTROLE',verifiedNone:'Za ovaj uređaj i izabrani DMX mode još nema verifikovanih direktnih kontrola.',verifiedSource:'Profil verifikovan prema zvaničnoj DMX dokumentaciji.',dimmer:'DIMMER',masterTitle:'MASTER / GRUPA',masterHint:'Kontroliši zajedno sva označena Patch svetla koja imaju verifikovan DIMMER kanal.',masterApply:'PRIMENI DIMMER',masterBlackout:'BLACKOUT GRUPE',masterNone:'Nema Patch svetala sa verifikovanim DIMMER profilom.',masterEmpty:'Označi najmanje jedno svetlo.'
 },
 en:{
  title:'📡 ART-NET CONTROL',
  intro:'Send real Art-Net DMX values over Wi-Fi. Choose a device from the existing DMX Patch to fill Universe and start address automatically.',
  target:'ART-NET NODE / IP',patchDevice:'DEVICE FROM DMX PATCH',manual:'Manual / no Patch device',refresh:'REFRESH PATCH',
  universe:'UNIVERSE',channel:'DMX CHANNEL',value:'VALUE',send:'SEND TEST',blackout:'BLACKOUT UNIVERSE',
  ready:'Ready to send.',sending:'Sending Art-Net…',sent:'Art-Net packet sent.',error:'Send failed.',
  native:'Art-Net requires a supported native control bridge.',patch:'Universe and START address come from the existing DMX Patch planner. The meaning of each channel must still be verified from the manufacturer DMX profile.',
  patchEmpty:'No valid devices in the DMX Patch. Add a device and enter its channel count.',patchLoaded:'Loaded from Patch',patchWarn:'This Patch row has a warning and is not safe to auto-load.',
  ownership:'TEST mode sends a complete Universe from LightingAI; channels not set here remain at 0. Do not use it in parallel with another DMX console on the same Universe.',
  verifiedTitle:'VERIFIED CONTROLS',verifiedNone:'This fixture and selected DMX mode do not yet have verified direct controls.',verifiedSource:'Profile verified against official DMX documentation.',dimmer:'DIMMER',masterTitle:'MASTER / GROUP',masterHint:'Control all selected Patch fixtures that have a verified DIMMER channel together.',masterApply:'APPLY DIMMER',masterBlackout:'GROUP BLACKOUT',masterNone:'No Patch fixtures have a verified DIMMER profile.',masterEmpty:'Select at least one fixture.'
 }
};
const t=()=>TXT[lang()];
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let seq=0;
const frames={};
function controlTransport(){
 if(window.LightingAIControlTransport&&typeof window.LightingAIControlTransport.sendDmx==='function')return window.LightingAIControlTransport;
 const androidReady=!!(window.Android&&typeof Android.artNetSendDmx==='function');
 const iosHandler=window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.LightingAIControl;
 const iosReady=!!(iosHandler&&typeof iosHandler.postMessage==='function');
 const adapter={
  platform:androidReady?'android':(iosReady?'ios':'none'),
  isAvailable:function(){return androidReady||iosReady;},
  sendDmx:function(request){
   if(androidReady){
    Android.artNetSendDmx(request.id,request.targetIp,request.universe,JSON.stringify(request.channels));
    return true;
   }
   if(iosReady){
    iosHandler.postMessage({action:'artnetSendDmx',id:request.id,targetIp:request.targetIp,universe:request.universe,channels:request.channels});
    return true;
   }
   return false;
  }
 };
 window.LightingAIControlTransport=adapter;
 return adapter;
}
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
function verifiedDimmerEntries(){
 return rows().map((r,index)=>{
  if(!patchUsable(r))return null;
  const profile=profileForRow(r),fixture=fixtureForRow(r);
  const control=profile&&Array.isArray(profile.controls)?profile.controls.find(ctrl=>ctrl&&ctrl.key==='dimmer'&&ctrl.type==='percent'):null;
  return profile&&fixture&&control?{row:r,index:index,profile:profile,fixture:fixture,control:control}:null;
 }).filter(Boolean);
}
function controlToDmx(ctrl,value){
 const inMin=Number(ctrl.min||0),inMax=Number(ctrl.max||100),outMin=Number(ctrl.dmxMin||0),outMax=Number(ctrl.dmxMax==null?255:ctrl.dmxMax);
 const normalized=inMax===inMin?0:Math.max(0,Math.min(1,(Number(value)-inMin)/(inMax-inMin)));
 return Math.max(0,Math.min(255,Math.round(outMin+normalized*(outMax-outMin))));
}
function renderMasterControl(){
 const box=E('artnetMasterControl');if(!box)return;
 const entries=verifiedDimmerEntries();
 if(!entries.length){box.innerHTML='<div class="muted small">'+esc(t().masterNone)+'</div>';return}
 const devices=entries.map((entry,i)=>{
  const f=entry.fixture,r=entry.row;
  return '<label style="display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-top:1px solid #2d333a"><input class="artnet-master-device" data-entry="'+i+'" type="checkbox" checked style="width:auto;margin-top:2px"><span>'+esc((f.manufacturer||'')+' '+(f.model||f.id))+'<br><span class="muted small">U'+Number(r.universe)+' · '+Number(r.start)+' · '+esc(r.mode||entry.profile.name)+'</span></span></label>';
 }).join('');
 box.innerHTML='<div style="font-size:11px;color:#9da3ad;margin-top:12px">'+esc(t().masterTitle)+'</div><div class="muted small" style="margin:5px 0 8px">'+esc(t().masterHint)+'</div>'+devices+'<div style="display:flex;justify-content:space-between;gap:8px;margin-top:10px"><b>'+esc(t().dimmer)+'</b><span id="artnetMasterValue" class="muted small">100%</span></div><input id="artnetMasterRange" type="range" min="0" max="100" value="100"><div class="actions"><button id="artnetMasterApply" class="btn primary" type="button">'+esc(t().masterApply)+'</button><button id="artnetMasterBlackout" class="btn danger" type="button">'+esc(t().masterBlackout)+'</button></div>';
 E('artnetMasterRange').addEventListener('input',()=>{E('artnetMasterValue').textContent=Math.round(Number(E('artnetMasterRange').value)||0)+'%'});
 E('artnetMasterApply').addEventListener('click',()=>applyMasterDimmer(Number(E('artnetMasterRange').value)||0));
 E('artnetMasterBlackout').addEventListener('click',()=>applyMasterDimmer(0));
}
function applyMasterDimmer(value){
 const entries=verifiedDimmerEntries(),selected=Array.prototype.slice.call(document.querySelectorAll('.artnet-master-device:checked')).map(el=>entries[Number(el.dataset.entry)]).filter(Boolean);
 if(!selected.length){status(t().masterEmpty,false);return}
 const universes=new Set();
 selected.forEach(entry=>{
  const r=entry.row,ctrl=entry.control,u=Math.max(1,Number(r.universe)||1);
  const address=Math.max(1,Number(r.start)||1)+Math.max(1,Number(ctrl.channel)||1)-1;
  if(address>512)return;
  frame(u)[address-1]=controlToDmx(ctrl,value);universes.add(u);
 });
 if(!universes.size){status(t().error,false);return}
 universes.forEach(u=>sendFrame(frame(u).slice(),u));
 if(E('artnetMasterRange'))E('artnetMasterRange').value=String(Math.max(0,Math.min(100,Number(value)||0)));
 if(E('artnetMasterValue'))E('artnetMasterValue').textContent=Math.round(Math.max(0,Math.min(100,Number(value)||0)))+'%';
}
function renderVerifiedControls(r){
 const box=E('artnetVerifiedControls');if(!box)return;
 const profile=profileForRow(r),fixture=fixtureForRow(r),controls=profile&&Array.isArray(profile.controls)?profile.controls:[];
 if(!profile||!controls.length){box.innerHTML='<div class="muted small">'+esc(t().verifiedNone)+'</div>';return}
 const items=controls.map((ctrl,i)=>{
  if(ctrl.type!=='percent'&&ctrl.type!=='cct-linear')return '';
  const label=ctrl.key==='dimmer'?t().dimmer:(ctrl.label||ctrl.key||('CH '+ctrl.channel));
  const min=Number(ctrl.min==null?0:ctrl.min),max=Number(ctrl.max==null?100:ctrl.max),step=Number(ctrl.step||1),initial=min;
  const suffix=ctrl.type==='cct-linear'?'K':'%';
  return '<div style="padding:10px 0;border-top:1px solid #2d333a"><div style="display:flex;justify-content:space-between;gap:8px"><b>'+esc(label)+'</b><span id="artnetVerifiedValue_'+i+'" class="muted small">'+Math.round(initial)+suffix+'</span></div><input class="artnet-verified-range" data-index="'+i+'" data-suffix="'+suffix+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+initial+'" style="margin-top:8px"></div>';
 }).join('');
 box.innerHTML='<div style="font-size:11px;color:#9da3ad;margin-top:12px">'+esc(t().verifiedTitle)+'</div><div style="font-weight:800;margin-top:4px">'+esc((fixture.manufacturer||'')+' '+(fixture.model||fixture.id))+'</div><div class="muted small">'+esc(profile.name)+' · '+Number(profile.channels||r.channels)+' ch</div>'+items+'<div class="muted small" style="margin-top:7px">'+esc(t().verifiedSource)+'</div>';
 box.querySelectorAll('.artnet-verified-range').forEach(input=>{
  input.addEventListener('input',()=>{
   const idx=Number(input.dataset.index),v=Number(input.value)||0,readout=E('artnetVerifiedValue_'+idx);
   if(readout)readout.textContent=Math.round(v)+(input.dataset.suffix||'');
  });
  input.addEventListener('change',()=>sendVerifiedControl(r,profile,controls[Number(input.dataset.index)],Number(input.value)||0));
 });
}
function sendVerifiedControl(r,profile,ctrl,value){
 if(!patchUsable(r)||!profile||!ctrl)return;
 const u=Math.max(1,Number(r.universe)||1);
 const address=Math.min(512,Math.max(1,Number(r.start)||1)+Math.max(1,Number(ctrl.channel)||1)-1);
 if(address>512){status(t().error,false);return}
 const f=frame(u);f[address-1]=controlToDmx(ctrl,value);sendFrame(f.slice(),u);
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
 const transport=controlTransport();
 if(!transport.isAvailable()){status(t().native,false);return}
 const ip=(E('artnetTarget')&&E('artnetTarget').value||'255.255.255.255').trim();
 try{localStorage.setItem(TARGET_KEY,ip)}catch(e){}
 const id='artnet_'+Date.now()+'_'+(++seq);
 status(t().sending);
 try{
  const ok=transport.sendDmx({id:id,targetIp:ip,universe:Number(universe)||1,channels:channels});
  if(!ok)status(t().native,false);
 }catch(e){status(t().error,false)}
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
 renderPatchDevices();renderMasterControl();
 if(!E('artnetStatus').textContent)status(x.ready);
}
function install(){
 const page=E('equipment');if(!page||E('artnetCard'))return false;
 const card=document.createElement('details');card.id='artnetCard';card.className='card';card.style.border='1px solid #31506b';
 card.innerHTML='<summary style="font-weight:900;font-size:20px;cursor:pointer"><span id="artnetTitle"></span></summary><div style="margin-top:12px"><p id="artnetIntro" class="muted small"></p><div class="row"><div><label class="caption" id="artnetTargetLabel"></label><input id="artnetTarget" inputmode="decimal"></div><div><label class="caption" id="artnetPatchDeviceLabel"></label><select id="artnetPatchDevice"></select><button id="artnetRefreshPatch" class="btn secondary" type="button" style="width:100%;margin-top:7px"></button><div id="artnetPatchSelectionHint" class="muted small" style="margin-top:6px"></div></div></div><div class="row"><div><label class="caption" id="artnetUniverseLabel"></label><input id="artnetUniverse" type="number" min="1" max="32768"></div><div><label class="caption" id="artnetChannelLabel"></label><input id="artnetChannel" type="number" min="1" max="512" value="1"></div></div><div><label class="caption" id="artnetValueLabel"></label><input id="artnetValue" type="range" min="0" max="255" value="0"><div id="artnetValueReadout" class="muted small" style="margin-top:5px">0 / 255</div></div><div class="actions"><button id="artnetSend" class="btn primary" type="button"></button><button id="artnetBlackout" class="btn danger" type="button"></button></div><div id="artnetStatus" class="muted small" style="margin-top:8px"></div><div id="artnetMasterControl" style="margin-top:10px"></div><div id="artnetVerifiedControls" style="margin-top:10px"></div><div id="artnetPatchHint" class="muted small" style="margin-top:8px"></div><div id="artnetOwnership" class="status warn" style="margin-top:10px"></div></div>';
 const dmx=E('dmxCard');if(dmx&&dmx.parentNode)dmx.parentNode.insertBefore(card,dmx.nextSibling);else page.appendChild(card);
 try{E('artnetTarget').value=localStorage.getItem(TARGET_KEY)||'255.255.255.255'}catch(e){E('artnetTarget').value='255.255.255.255'}
 E('artnetUniverse').value=defaultUniverse();
 E('artnetValue').addEventListener('input',()=>{E('artnetValueReadout').textContent=E('artnetValue').value+' / 255'});
 E('artnetPatchDevice').addEventListener('change',()=>{choosePatch();if(E('artnetPatchDevice').value==='')renderVerifiedControls(null)});
 E('artnetRefreshPatch').addEventListener('click',()=>{renderPatchDevices();renderMasterControl();status(t().ready)});
 E('artnetSend').addEventListener('click',sendTest);E('artnetBlackout').addEventListener('click',blackout);
 translate();return true;
}
window.LightingAIArtNetControl={version:'0.6-master-group',refreshPatch:function(){renderPatchDevices();renderMasterControl();},transport:controlTransport};
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>160)clearInterval(timer)},100);
const old=window.setLanguage;if(typeof old==='function'&&!window.__artNetLangHook){window.__artNetLangHook=true;window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
})();