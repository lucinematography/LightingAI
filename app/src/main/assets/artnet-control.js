(function(){
'use strict';
const E=id=>document.getElementById(id);
const TARGET_KEY='lighting_artnet_target_v1';
const PROTOCOL_KEY='lighting_network_dmx_protocol_v1';
const SACN_PRIORITY_KEY='lighting_sacn_priority_v1';
const SCENES_KEY='lighting_artnet_scenes_v1';
const FADE_KEY='lighting_control_fade_seconds_v1';
const CUES_KEY='lighting_control_cues_v1';
const GROUPS_KEY='lighting_control_groups_v1';
const BRIDGE_KEY='lighting_network_dmx_bridge_v1';
const MAX_SCENES=12;
const MAX_CUES=64;
const MAX_GROUPS=24;
const VERIFIED_BRIDGES=[
 {id:'',manufacturer:'',model:'',protocols:['artnet','sacn'],transport:'',output:'',sourceUrl:''},
 {id:'aputure-sidus-one',manufacturer:'Aputure',model:'Sidus One',protocols:['artnet','sacn'],transport:'Wi-Fi',output:'DMX / CRMX',sourceUrl:'https://docs.aputure.com/hubfs/Knowledge%20Base/Aputure/Sidus%20One/Sidus%20One%20Manual%20EN%20v1.0.pdf'},
 {id:'astera-fp3-datalink',manufacturer:'Astera',model:'FP3 DataLink',protocols:['artnet','sacn'],transport:'Ethernet / RJ45',output:'DMX via XLR / Astera power-data',sourceUrl:'https://astera-led.com/wp-content/uploads/FP3_DataLink_Datasheet_V2-1.pdf'}
];
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{
  title:'📡 MREŽNA DMX KONTROLA',
  intro:'Kontroliši DMX preko mreže koristeći Art-Net ili sACN (E1.31). DMX Patch ostaje zajednički izvor za Universe i adrese.',
  protocol:'MREŽNI PROTOKOL',artnet:'Art-Net',sacn:'sACN (E1.31)',sacnInfo:'sACN automatski koristi multicast adresu za izabrani Universe.',target:'ART-NET NODE / IP',artnetAutoHint:'AUTO koristi directed broadcast aktivne IPv4 mreže. Ako postoji više mreža, izaberi tačan izlaz ispod.',artnetRoute:'ART-NET MREŽNA RUTA',artnetRouteAuto:'AUTO / sve aktivne rute',artnetRouteNone:'Nema directed broadcast ruta.',discover:'PRONAĐI ART-NET NODE-OVE',nodes:'PRONAĐENI NODE-OVI',noNodes:'Nema pronađenih Art-Net node-ova.',discovering:'Tražim Art-Net node-ove…',patchDevice:'UREĐAJ IZ DMX PATCH-A',manual:'Ručno / bez Patch uređaja',refresh:'OSVEŽI PATCH',
  universe:'UNIVERSE',channel:'DMX KANAL',value:'VREDNOST',send:'POŠALJI TEST',blackout:'BLACKOUT UNIVERSE',
  ready:'Spremno za slanje.',sending:'Šaljem mrežni DMX…',sent:'DMX mrežni paket je poslat.',error:'Slanje nije uspelo.',
  native:'Mrežni DMX zahteva podržani native control bridge.',patch:'Universe i START adresa se preuzimaju iz postojećeg DMX Patch planera. Značenje konkretnog kanala mora biti verifikovano DMX profilom proizvođača.',
  patchEmpty:'Nema ispravnih uređaja u DMX Patch-u. Dodaj uređaj i unesi broj kanala.',patchLoaded:'Učitano iz Patch-a',patchWarn:'Ovaj Patch red ima upozorenje i nije bezbedan za automatsko učitavanje.',
  ownership:'TEST režim šalje kompletan Universe iz LightingAI-ja; kanali koje ovde nisi postavio ostaju 0. Ne koristi ga paralelno sa drugom DMX konzolom na istom Universe-u.',
  verifiedTitle:'VERIFIKOVANE KONTROLE',verifiedNone:'Za ovaj uređaj i izabrani DMX mode još nema verifikovanih direktnih kontrola.',verifiedSource:'Profil verifikovan prema zvaničnoj DMX dokumentaciji.',dimmer:'DIMMER',masterTitle:'MASTER / GRUPA',masterHint:'Kontroliši zajedno sva označena Patch svetla koja imaju verifikovan DIMMER kanal.',masterApply:'PRIMENI DIMMER',masterBlackout:'BLACKOUT GRUPE',masterNone:'Nema Patch svetala sa verifikovanim DIMMER profilom.',masterEmpty:'Označi najmanje jedno svetlo.',masterCctTitle:'MASTER CCT',masterCctHint:'Zajedno promeni temperaturu boje na označenim svetlima koja imaju verifikovan CCT kanal.',masterCctApply:'PRIMENI CCT',masterCctNone:'Nema Patch svetala sa verifikovanim CCT profilom.',masterCctNoCommon:'Označena svetla nemaju zajednički CCT opseg.',masterRgbTitle:'MASTER RGB',masterRgbHint:'Zajedno postavi RGB na označenim svetlima koja imaju verifikovane R/G/B kanale.',masterRgbApply:'PRIMENI RGB',masterRgbNone:'Nema Patch svetala sa verifikovanim RGB profilom.',liveLabel:'LIVE DMX REFRESH · 30 Hz',liveHint:'Kada je uključeno, LightingAI neprekidno osvežava aktivne Universe-e preko izabranog mrežnog protokola dok je aplikacija u prvom planu. Automatski se zaustavlja kada napustiš aplikaciju.',liveOn:'LIVE mrežni DMX je uključen.',liveOff:'LIVE mrežni DMX je zaustavljen.',sceneTitle:'CONTROL SCENE',sceneHint:'Sačuvaj trenutno LightingAI stanje kanala i vrati ga kasnije. Scena radi samo ako DMX Patch ostane isti.',sceneName:'Naziv scene',sceneSave:'SAČUVAJ SCENU',sceneApply:'PRIMENI',sceneFade:'PRELAZ',sceneFadeSeconds:'PRELAZ (s)',sceneDelete:'OBRIŠI',sceneEmpty:'Nema sačuvanih CONTROL scena.',sceneSaved:'CONTROL scena je sačuvana.',sceneApplied:'CONTROL scena je primenjena.',sceneFading:'Prelaz scene…',sceneFadeDone:'Prelaz scene je završen.',sceneFadeCancelled:'Prelaz scene je zaustavljen.',scenePatchMismatch:'DMX Patch je promenjen od trenutka čuvanja scene. Primena je blokirana radi bezbednosti.',sceneNeedFrame:'Prvo pošalji bar jednu LightingAI kontrolnu vrednost.',sceneLimit:'Možeš sačuvati najviše 12 CONTROL scena.',cueTitle:'CUE LISTA',cueHint:'Složi redosled CONTROL scena i pokreći ih redom jednim GO dugmetom.',cueScene:'SCENA',cueFade:'PRELAZ (s)',cueAdd:'DODAJ CUE',cueGo:'GO / SLEDEĆI',cuePrevious:'PRETHODNI',cueReset:'RESET',cueDelete:'OBRIŠI',cueUp:'GORE',cueDown:'DOLE',cueEmpty:'Cue lista je prazna.',cueMissing:'Cue scena više ne postoji.',cueAdded:'Cue je dodat.',cueCurrent:'AKTIVAN',cueEnd:'Kraj cue liste.',cueBusy:'Sačekaj da se trenutni prelaz završi.',cueLimit:'Možeš sačuvati najviše 64 cue-a.',panicTitle:'GLOBAL BLACKOUT',panicHint:'Odmah postavlja sve LightingAI poznate DMX Universe-e na 0. Koristi samo kada LightingAI kontroliše te Universe-e.',panicGo:'BLACKOUT SVE',panicRestore:'VRATI PRE BLACKOUTA',panicDone:'Global blackout je poslat.',panicRestored:'Stanje pre blackouta je vraćeno.',panicEmpty:'Nema poznatih DMX Universe-a za blackout.',panicRestoreEmpty:'Nema sačuvanog stanja za vraćanje.',panicPatchChanged:'DMX Patch je promenjen posle blackouta. Vraćanje je blokirano radi bezbednosti.',armLabel:'ARM OUTPUT',armHint:'Fizički DMX izlaz je zaključan dok ga namerno ne uključiš. Promena mreže, protokola, Patch-a ili odlazak aplikacije u pozadinu automatski ga zaključava.',armOn:'DMX izlaz je uključen.',armOff:'DMX izlaz je zaključan.',armRequired:'Prvo uključi ARM OUTPUT.',preflightRunning:'Proveravam mrežnu rutu pre uključivanja izlaza…',preflightNoNetwork:'Nema aktivne IPv4 mreže za DMX izlaz.',preflightNoBroadcast:'AUTO Art-Net nema dostupnu directed broadcast adresu.',preflightMultipleRoutes:'Otkriveno je više Art-Net mrežnih ruta. Izaberi tačnu rutu pre ARM OUTPUT.',preflightNoMulticast:'Aktivna mreža ne podržava multicast potreban za sACN.',preflightBadTarget:'Art-Net cilj nije važeća IPv4 adresa.',preflightFailed:'Mrežna provera nije uspela. DMX izlaz ostaje zaključan.',groupTitle:'CONTROL GRUPE',groupHint:'Sačuvaj izbor svetala iz DMX Patch-a i brzo ga primeni na MASTER DIMMER / CCT / RGB kontrole.',groupName:'Naziv grupe',groupSave:'SAČUVAJ GRUPU',groupApply:'PRIMENI GRUPU',groupDelete:'OBRIŠI',groupEmpty:'Nema sačuvanih CONTROL grupa.',groupNone:'Nema svetala sa verifikovanim kontrolama za grupu.',groupNeedName:'Unesi naziv grupe.',groupNeedMember:'Označi najmanje jedno svetlo.',groupSaved:'CONTROL grupa je sačuvana.',groupApplied:'CONTROL grupa je primenjena.',groupPatchMismatch:'DMX Patch je promenjen od trenutka čuvanja grupe. Primena je blokirana radi bezbednosti.',groupLimit:'Možeš sačuvati najviše 24 CONTROL grupe.',diagTitle:'DIJAGNOSTIKA KONTROLE',diagHint:'Prikazuje lokalno stanje Network DMX izlaza i brojače native sendera. Uspešno UDP slanje nije potvrda da je svetlo primilo paket.',diagRefresh:'OSVEŽI DIJAGNOSTIKU',diagPlatform:'PLATFORMA',diagProtocol:'PROTOKOL',diagArmed:'ARM',diagLive:'LIVE',diagUniverses:'UNIVERSE-I',diagDirect:'DIREKTNO POSLATO',diagLivePackets:'LIVE PAKETI',diagFailures:'GREŠKE',diagLast:'POSLEDNJE SLANJE',diagNoNative:'Native dijagnostika nije dostupna.',diagNoAck:'Art-Net/sACN izlaz ovde nema potvrdu prijema od svetla / node-a.',diagInterfaces:'LOKALNE MREŽE',diagBroadcast:'BROADCAST',diagMulticast:'MULTICAST',diagNoInterface:'Nema aktivne ne-loopback IPv4 mreže.',sacnPriority:'sACN PRIORITET',sacnPriorityHint:'0–200; podrazumevano 100. Viši prioritet ima prednost kada više sACN izvora šalje isti Universe.',bridgeTitle:'VERIFIKOVANI MREŽNI BRIDŽ',bridgeHint:'Opcionalno izaberi poznati standardni bridge/gateway. LightingAI i dalje šalje samo standardni Art-Net ili sACN; ne koristi neproverene proizvođačke BLE komande.',bridgeSelect:'BRIDGE / GATEWAY',bridgeNone:'Bez posebnog bridge profila',bridgeProtocols:'PROTOKOLI',bridgeTransport:'MREŽA',bridgeOutput:'IZLAZ',bridgeDocs:'DOKUMENTACIJA'
 },
 en:{
  title:'📡 NETWORK DMX CONTROL',
  intro:'Control DMX over the network using Art-Net or sACN (E1.31). The existing DMX Patch remains the shared source for universes and addresses.',
  protocol:'NETWORK PROTOCOL',artnet:'Art-Net',sacn:'sACN (E1.31)',sacnInfo:'sACN automatically uses the multicast address for the selected universe.',target:'ART-NET NODE / IP',artnetAutoHint:'AUTO uses active IPv4 directed broadcast routes. If multiple networks are active, choose the exact output below.',artnetRoute:'ART-NET NETWORK ROUTE',artnetRouteAuto:'AUTO / all active routes',artnetRouteNone:'No directed broadcast routes available.',discover:'DISCOVER ART-NET NODES',nodes:'DISCOVERED NODES',noNodes:'No Art-Net nodes found.',discovering:'Discovering Art-Net nodes…',patchDevice:'DEVICE FROM DMX PATCH',manual:'Manual / no Patch device',refresh:'REFRESH PATCH',
  universe:'UNIVERSE',channel:'DMX CHANNEL',value:'VALUE',send:'SEND TEST',blackout:'BLACKOUT UNIVERSE',
  ready:'Ready to send.',sending:'Sending network DMX…',sent:'Network DMX packet sent.',error:'Send failed.',
  native:'Network DMX requires a supported native control bridge.',patch:'Universe and START address come from the existing DMX Patch planner. The meaning of each channel must still be verified from the manufacturer DMX profile.',
  patchEmpty:'No valid devices in the DMX Patch. Add a device and enter its channel count.',patchLoaded:'Loaded from Patch',patchWarn:'This Patch row has a warning and is not safe to auto-load.',
  ownership:'TEST mode sends a complete Universe from LightingAI; channels not set here remain at 0. Do not use it in parallel with another DMX console on the same Universe.',
  verifiedTitle:'VERIFIED CONTROLS',verifiedNone:'This fixture and selected DMX mode do not yet have verified direct controls.',verifiedSource:'Profile verified against official DMX documentation.',dimmer:'DIMMER',masterTitle:'MASTER / GROUP',masterHint:'Control all selected Patch fixtures that have a verified DIMMER channel together.',masterApply:'APPLY DIMMER',masterBlackout:'GROUP BLACKOUT',masterNone:'No Patch fixtures have a verified DIMMER profile.',masterEmpty:'Select at least one fixture.',masterCctTitle:'MASTER CCT',masterCctHint:'Change color temperature together on selected fixtures that have a verified CCT channel.',masterCctApply:'APPLY CCT',masterCctNone:'No Patch fixtures have a verified CCT profile.',masterCctNoCommon:'Selected fixtures do not share a common CCT range.',masterRgbTitle:'MASTER RGB',masterRgbHint:'Set RGB together on selected fixtures that have verified R/G/B channels.',masterRgbApply:'APPLY RGB',masterRgbNone:'No Patch fixtures have a verified RGB profile.',liveLabel:'LIVE DMX REFRESH · 30 Hz',liveHint:'When enabled, LightingAI continuously refreshes active universes over the selected network protocol while the app is in the foreground. It stops automatically when you leave the app.',liveOn:'LIVE network DMX is enabled.',liveOff:'LIVE network DMX stopped.',sceneTitle:'CONTROL SCENE',sceneHint:'Save the current LightingAI channel state and recall it later. A scene can only be recalled while the DMX Patch is unchanged.',sceneName:'Scene name',sceneSave:'SAVE SCENE',sceneApply:'APPLY',sceneFade:'FADE',sceneFadeSeconds:'FADE (s)',sceneDelete:'DELETE',sceneEmpty:'No saved CONTROL scenes.',sceneSaved:'CONTROL scene saved.',sceneApplied:'CONTROL scene applied.',sceneFading:'Scene fade in progress…',sceneFadeDone:'Scene fade complete.',sceneFadeCancelled:'Scene fade stopped.',scenePatchMismatch:'The DMX Patch changed after this scene was saved. Recall is blocked for safety.',sceneNeedFrame:'Send at least one LightingAI control value first.',sceneLimit:'You can save up to 12 CONTROL scenes.',cueTitle:'CUE LIST',cueHint:'Arrange CONTROL scenes in order and trigger them sequentially with one GO button.',cueScene:'SCENE',cueFade:'FADE (s)',cueAdd:'ADD CUE',cueGo:'GO / NEXT',cuePrevious:'PREVIOUS',cueReset:'RESET',cueDelete:'DELETE',cueUp:'UP',cueDown:'DOWN',cueEmpty:'Cue list is empty.',cueMissing:'The cue scene no longer exists.',cueAdded:'Cue added.',cueCurrent:'ACTIVE',cueEnd:'End of cue list.',cueBusy:'Wait for the current fade to finish.',cueLimit:'You can save up to 64 cues.',panicTitle:'GLOBAL BLACKOUT',panicHint:'Immediately sets all LightingAI-known DMX universes to 0. Use only when LightingAI owns those universes.',panicGo:'BLACKOUT ALL',panicRestore:'RESTORE BEFORE BLACKOUT',panicDone:'Global blackout sent.',panicRestored:'Pre-blackout state restored.',panicEmpty:'No known DMX universes to black out.',panicRestoreEmpty:'No saved pre-blackout state to restore.',panicPatchChanged:'The DMX Patch changed after blackout. Restore is blocked for safety.',armLabel:'ARM OUTPUT',armHint:'Physical DMX output stays locked until you deliberately arm it. Changing network, protocol, Patch, or leaving the app automatically locks it again.',armOn:'DMX output armed.',armOff:'DMX output locked.',armRequired:'Arm DMX output first.',preflightRunning:'Checking the network route before arming output…',preflightNoNetwork:'No active IPv4 network is available for DMX output.',preflightNoBroadcast:'AUTO Art-Net has no directed broadcast address available.',preflightMultipleRoutes:'Multiple Art-Net network routes are active. Select the exact route before ARM OUTPUT.',preflightNoMulticast:'The active network does not support multicast required by sACN.',preflightBadTarget:'The Art-Net target is not a valid IPv4 address.',preflightFailed:'Network preflight failed. DMX output remains locked.',groupTitle:'CONTROL GROUPS',groupHint:'Save a DMX Patch fixture selection and quickly apply it to MASTER DIMMER / CCT / RGB controls.',groupName:'Group name',groupSave:'SAVE GROUP',groupApply:'APPLY GROUP',groupDelete:'DELETE',groupEmpty:'No saved CONTROL groups.',groupNone:'No fixtures with verified controls are available for grouping.',groupNeedName:'Enter a group name.',groupNeedMember:'Select at least one fixture.',groupSaved:'CONTROL group saved.',groupApplied:'CONTROL group applied.',groupPatchMismatch:'The DMX Patch changed after this group was saved. Apply is blocked for safety.',groupLimit:'You can save up to 24 CONTROL groups.',diagTitle:'CONTROL DIAGNOSTICS',diagHint:'Shows local Network DMX state and native sender counters. A successful UDP send is not proof that a fixture received the packet.',diagRefresh:'REFRESH DIAGNOSTICS',diagPlatform:'PLATFORM',diagProtocol:'PROTOCOL',diagArmed:'ARM',diagLive:'LIVE',diagUniverses:'UNIVERSES',diagDirect:'DIRECT SENT',diagLivePackets:'LIVE PACKETS',diagFailures:'FAILURES',diagLast:'LAST SEND',diagNoNative:'Native diagnostics are unavailable.',diagNoAck:'This Art-Net/sACN output has no fixture/node delivery acknowledgement.',diagInterfaces:'LOCAL NETWORKS',diagBroadcast:'BROADCAST',diagMulticast:'MULTICAST',diagNoInterface:'No active non-loopback IPv4 network.',sacnPriority:'sACN PRIORITY',sacnPriorityHint:'0–200; default 100. Higher priority wins when multiple sACN sources send the same universe.',bridgeTitle:'VERIFIED NETWORK BRIDGE',bridgeHint:'Optionally select a known standards-based bridge/gateway. LightingAI still sends only standard Art-Net or sACN and does not use unverified proprietary BLE commands.',bridgeSelect:'BRIDGE / GATEWAY',bridgeNone:'No dedicated bridge profile',bridgeProtocols:'PROTOCOLS',bridgeTransport:'NETWORK',bridgeOutput:'OUTPUT',bridgeDocs:'DOCUMENTATION'
 }
};
const t=()=>TXT[lang()];
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let seq=0;
let liveEnabled=false;
let liveProtocol='artnet';
let activeSceneFade=null;
let currentCueIndex=-1;
let lastBlackoutSnapshot=null;
let outputArmed=false;
let pendingArmPreflightId=null;
const frames={};
function controlTransport(){
 if(window.LightingAIControlTransport&&typeof window.LightingAIControlTransport.sendDmx==='function')return window.LightingAIControlTransport;
 const androidReady=!!(window.Android&&typeof Android.artNetSendDmx==='function');
 const iosHandler=window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.LightingAIControl;
 const iosReady=!!(iosHandler&&typeof iosHandler.postMessage==='function');
 const adapter={
  platform:androidReady?'android':(iosReady?'ios':'none'),
  isAvailable:function(){return androidReady||iosReady;},
  supportsLive:function(protocol){
   if(protocol==='sacn')return !!((androidReady&&typeof Android.sacnSetLiveDmx==='function')||iosReady);
   return !!((androidReady&&typeof Android.artNetSetLiveDmx==='function')||iosReady);
  },
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
  },
  sendSacnDmx:function(request){
   if(androidReady&&typeof Android.sacnSendDmx==='function'){
    Android.sacnSendDmx(request.id,request.universe,JSON.stringify(request.channels));
    return true;
   }
   if(iosReady){
    iosHandler.postMessage({action:'sacnSendDmx',id:request.id,universe:request.universe,channels:request.channels});
    return true;
   }
   return false;
  },
  setLiveDmx:function(request){
   if(androidReady&&typeof Android.artNetSetLiveDmx==='function'){
    Android.artNetSetLiveDmx(request.id,request.targetIp,request.universe,JSON.stringify(request.channels));
    return true;
   }
   if(iosReady){
    iosHandler.postMessage({action:'artnetSetLiveDmx',id:request.id,targetIp:request.targetIp,universe:request.universe,channels:request.channels});
    return true;
   }
   return false;
  },
  setSacnLiveDmx:function(request){
   if(androidReady&&typeof Android.sacnSetLiveDmx==='function'){
    Android.sacnSetLiveDmx(request.id,request.universe,JSON.stringify(request.channels));
    return true;
   }
   if(iosReady){
    iosHandler.postMessage({action:'sacnSetLiveDmx',id:request.id,universe:request.universe,channels:request.channels});
    return true;
   }
   return false;
  },
  setSacnPriority:function(priority){
   const value=Math.max(0,Math.min(200,Number(priority)||0));
   if(androidReady&&typeof Android.sacnSetPriority==='function'){
    Android.sacnSetPriority(value);return true;
   }
   if(iosReady){
    iosHandler.postMessage({action:'sacnSetPriority',priority:value});return true;
   }
   return false;
  },
  stopLive:function(request){
   const protocol=request&&request.protocol==='sacn'?'sacn':'artnet';
   if(protocol==='sacn'&&androidReady&&typeof Android.sacnStopLive==='function'){
    Android.sacnStopLive(request.id);return true;
   }
   if(protocol==='artnet'&&androidReady&&typeof Android.artNetStopLive==='function'){
    Android.artNetStopLive(request.id);return true;
   }
   if(iosReady){
    iosHandler.postMessage({action:'networkDmxStopLive',id:request.id,protocol:protocol});
    return true;
   }
   return false;
  },
  discover:function(request){
   if(androidReady&&typeof Android.artNetDiscover==='function'){
    Android.artNetDiscover(request.id,request.timeoutMs||900);
    return true;
   }
   if(iosReady){
    iosHandler.postMessage({action:'artnetDiscover',id:request.id,timeoutMs:request.timeoutMs||900});
    return true;
   }
   return false;
  },
  diagnostics:function(request){
   if(androidReady&&typeof Android.networkDmxDiagnostics==='function'){
    try{
     const raw=Android.networkDmxDiagnostics(),payload=typeof raw==='string'?JSON.parse(raw):raw;
     setTimeout(()=>window.LightingAINetworkDmxDiagnosticsResult&&window.LightingAINetworkDmxDiagnosticsResult(request.id,payload||{},''),0);
     return true;
    }catch(e){
     setTimeout(()=>window.LightingAINetworkDmxDiagnosticsResult&&window.LightingAINetworkDmxDiagnosticsResult(request.id,{},'native_diagnostics_failed'),0);
     return true;
    }
   }
   if(iosReady){
    iosHandler.postMessage({action:'networkDmxDiagnostics',id:request.id});
    return true;
   }
   return false;
  }
 };
 window.LightingAIControlTransport=adapter;
 return adapter;
}
function status(s,ok){const el=E('artnetStatus');if(!el)return;el.textContent=s;el.style.color=ok===false?'#ffb5b5':ok===true?'#b8f0d1':'#9299a3';}
function selectedBridge(){
 const select=E('networkDmxBridge'),id=select?select.value:'';
 return VERIFIED_BRIDGES.find(item=>item.id===id)||VERIFIED_BRIDGES[0];
}
function renderBridge(){
 const select=E('networkDmxBridge'),box=E('networkDmxBridgeInfo');if(!select||!box)return;
 const x=t(),bridge=selectedBridge();
 if(!bridge.id){box.innerHTML='<div class="muted small">'+esc(x.bridgeHint)+'</div>';return}
 const protocols=(bridge.protocols||[]).map(p=>p==='sacn'?'sACN (E1.31)':'Art-Net').join(' / ');
 box.innerHTML='<div style="padding:8px 0"><b>'+esc(bridge.manufacturer+' '+bridge.model)+'</b>'+
  '<div class="muted small">'+esc(x.bridgeProtocols)+': '+esc(protocols)+'</div>'+
  '<div class="muted small">'+esc(x.bridgeTransport)+': '+esc(bridge.transport)+'</div>'+
  '<div class="muted small">'+esc(x.bridgeOutput)+': '+esc(bridge.output)+'</div>'+
  (bridge.sourceUrl?'<a href="'+esc(bridge.sourceUrl)+'" target="_blank" rel="noopener" class="muted small">'+esc(x.bridgeDocs)+'</a>':'')+
  '</div><div class="muted small">'+esc(x.bridgeHint)+'</div>';
}
function formatDiagTime(ms){
 const value=Number(ms)||0;
 if(!value)return '—';
 try{return new Date(value).toLocaleTimeString()}catch(e){return String(value)}
}
function renderArtNetRoutes(interfaces){
 const select=E('artnetRouteSelect');if(!select)return;
 const list=(Array.isArray(interfaces)?interfaces:[]).filter(item=>item&&item.broadcast);
 const current=(E('artnetTarget')&&E('artnetTarget').value||'AUTO').trim();
 let html='<option value="AUTO">'+esc(t().artnetRouteAuto)+'</option>';
 if(!list.length)html+='<option value="" disabled>'+esc(t().artnetRouteNone)+'</option>';
 list.forEach(item=>{
  const name=item.displayName||item.name||'IPv4',ip=item.ipv4||'',broadcast=item.broadcast||'';
  html+='<option value="'+esc(broadcast)+'">'+esc(name+' · '+ip+' → '+broadcast)+'</option>';
 });
 select.innerHTML=html;
 if(current&&current.toUpperCase()!=='AUTO'&&list.some(item=>item.broadcast===current))select.value=current;
 else select.value='AUTO';
}
function renderDiagnostics(nativePayload,error){
 const box=E('artnetDiagnosticsBody');if(!box)return;
 const protocol=selectedProtocol(),universes=knownUniverseNumbers(),native=nativePayload&&typeof nativePayload==='object'?nativePayload:null;
 const metrics=native&&(protocol==='sacn'?native.sacn:native.artNet)||null;
 const platform=native&&native.platform?native.platform:(controlTransport().platform||'none');
 const rowsHtml=[
  [t().diagPlatform,platform],
  [t().diagProtocol,protocol==='sacn'?'sACN (E1.31)':'Art-Net'],
  ...(protocol==='sacn'?[[t().sacnPriority,String(metrics&&metrics.priority!=null?metrics.priority:sacnPriority())]]:[]),
  [t().diagArmed,outputArmed?'ON':'OFF'],
  [t().diagLive,liveEnabled?'ON':'OFF'],
  [t().diagUniverses,universes.length?universes.join(', '):'—']
 ].map(item=>'<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0"><span class="muted small">'+esc(item[0])+'</span><b>'+esc(item[1])+'</b></div>').join('');
 let nativeHtml='';
 if(metrics){
  const directSent=Number(metrics.directSent)||0,liveSent=Number(metrics.livePacketsSent)||0;
  const failures=(Number(metrics.directFailed)||0)+(Number(metrics.livePacketsFailed)||0);
  const last=Math.max(Number(metrics.directLastAtMs)||0,Number(metrics.liveLastSendAtMs)||0);
  const lastError=String(metrics.directLastError||metrics.liveLastError||'');
  nativeHtml='<div style="border-top:1px solid #2d333a;margin-top:6px;padding-top:6px">'+
   '<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0"><span class="muted small">'+esc(t().diagDirect)+'</span><b>'+directSent+'</b></div>'+
   '<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0"><span class="muted small">'+esc(t().diagLivePackets)+'</span><b>'+liveSent+'</b></div>'+
   '<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0"><span class="muted small">'+esc(t().diagFailures)+'</span><b>'+failures+'</b></div>'+
   '<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0"><span class="muted small">'+esc(t().diagLast)+'</span><b>'+esc(formatDiagTime(last))+'</b></div>'+
   (lastError?'<div class="muted small" style="color:#ffb5b5">'+esc(lastError)+'</div>':'')+
   '</div>';
 }else nativeHtml='<div class="muted small" style="margin-top:7px">'+esc(error?t().diagNoNative:t().diagNoNative)+'</div>';
 const interfaces=native&&Array.isArray(native.interfaces)?native.interfaces:[];
 renderArtNetRoutes(interfaces);
 const interfaceHtml='<div style="border-top:1px solid #2d333a;margin-top:8px;padding-top:8px"><div class="caption">'+esc(t().diagInterfaces)+'</div>'+
  (interfaces.length?interfaces.map(item=>{
   const name=item.displayName||item.name||'IPv4',ip=item.ipv4||'—',broadcast=item.broadcast||'—';
   return '<div style="padding:6px 0;border-top:1px solid #252a30"><b>'+esc(name)+'</b><div class="muted small">'+esc(ip)+' / '+esc(String(item.prefixLength==null?'?':item.prefixLength))+'</div><div class="muted small">'+esc(t().diagBroadcast)+': '+esc(broadcast)+' · '+esc(t().diagMulticast)+': '+(item.multicast?'ON':'OFF')+'</div></div>';
  }).join(''):'<div class="muted small" style="margin-top:6px">'+esc(t().diagNoInterface)+'</div>')+'</div>';
 box.innerHTML=rowsHtml+nativeHtml+interfaceHtml+'<div class="muted small" style="margin-top:8px">'+esc(t().diagNoAck)+'</div>';
}
function requestDiagnostics(){
 renderDiagnostics(null,'');
 const transport=controlTransport(),id='network_diag_'+Date.now()+'_'+(++seq);
 try{
  if(typeof transport.diagnostics!=='function'||!transport.diagnostics({id:id}))renderDiagnostics(null,'unsupported');
 }catch(e){renderDiagnostics(null,'failed')}
}
function validIpv4(value){
 const parts=String(value||'').trim().split('.');
 if(parts.length!==4)return false;
 return parts.every(part=>/^\d{1,3}$/.test(part)&&Number(part)>=0&&Number(part)<=255);
}
function finishArmPreflight(id,payload,error){
 if(!pendingArmPreflightId||id!==pendingArmPreflightId)return false;
 pendingArmPreflightId=null;
 const toggle=E('artnetOutputArm');
 if(toggle)toggle.disabled=false;
 const native=payload&&typeof payload==='object'?payload:null;
 const interfaces=native&&Array.isArray(native.interfaces)?native.interfaces:[];
 let failure='';
 if(error||!native)failure=t().preflightFailed;
 else if(!interfaces.length)failure=t().preflightNoNetwork;
 else if(selectedProtocol()==='sacn'&&!interfaces.some(item=>item&&item.multicast===true))failure=t().preflightNoMulticast;
 else if(selectedProtocol()==='artnet'){
  const target=String((E('artnetTarget')&&E('artnetTarget').value)||'AUTO').trim();
  const auto=!target||target.toUpperCase()==='AUTO';
  const broadcasts=interfaces.filter(item=>item&&item.broadcast);
  if(auto&&!broadcasts.length)failure=t().preflightNoBroadcast;
  else if(auto&&broadcasts.length>1)failure=t().preflightMultipleRoutes;
  else if(!auto&&!validIpv4(target))failure=t().preflightBadTarget;
 }
 if(failure){
  outputArmed=false;
  if(toggle)toggle.checked=false;
  status(failure,false);
  return true;
 }
 outputArmed=true;
 if(toggle)toggle.checked=true;
 status(t().armOn,true);
 return true;
}
window.LightingAINetworkDmxDiagnosticsResult=function(id,payload,error){
 if(finishArmPreflight(id,payload,error||''))return;
 renderDiagnostics(payload,error||'');
};
function requireOutputArmed(){
 if(outputArmed)return true;
 status(t().armRequired,false);
 return false;
}
function setOutputArmed(enabled,quiet){
 const next=!!enabled,toggle=E('artnetOutputArm');
 if(!next){
  pendingArmPreflightId=null;
  outputArmed=false;
  if(toggle){toggle.checked=false;toggle.disabled=false}
  cancelSceneFade(false);
  clearBlackoutRestore();
  if(liveEnabled)setLiveEnabled(false);
  if(!quiet)status(t().armOff);
  return;
 }
 if(outputArmed){if(toggle)toggle.checked=true;return}
 const transport=controlTransport();
 const id='network_arm_'+Date.now()+'_'+(++seq);
 pendingArmPreflightId=id;
 if(toggle){toggle.checked=false;toggle.disabled=true}
 status(t().preflightRunning);
 try{
  if(typeof transport.diagnostics!=='function'||!transport.diagnostics({id:id})){
   pendingArmPreflightId=null;
   if(toggle)toggle.disabled=false;
   status(t().preflightFailed,false);
  }
 }catch(e){
  pendingArmPreflightId=null;
  if(toggle)toggle.disabled=false;
  status(t().preflightFailed,false);
 }
}
function selectedProtocol(){
 const select=E('networkDmxProtocol');
 return select&&select.value==='sacn'?'sacn':'artnet';
}
function sacnPriority(){
 const input=E('sacnPriority');
 const raw=input?Number(input.value):Number(localStorage.getItem(SACN_PRIORITY_KEY)||100);
 return Math.max(0,Math.min(200,Number.isFinite(raw)?Math.round(raw):100));
}
function applySacnPriority(){
 const value=sacnPriority(),input=E('sacnPriority');
 if(input)input.value=String(value);
 try{localStorage.setItem(SACN_PRIORITY_KEY,String(value))}catch(e){}
 const transport=controlTransport();
 try{if(typeof transport.setSacnPriority==='function')transport.setSacnPriority(value)}catch(e){}
 return value;
}
function protocolUniverseLimit(protocol){return protocol==='sacn'?63999:32768}
function sacnMulticastAddress(universe){
 const u=Math.max(1,Math.min(63999,Number(universe)||1));
 return '239.255.'+((u>>8)&255)+'.'+(u&255);
}
function updateProtocolUi(){
 const protocol=selectedProtocol(),target=E('artnetTargetBlock'),info=E('sacnMulticastInfo'),priorityBlock=E('sacnPriorityBlock'),universe=E('artnetUniverse');
 if(target)target.style.display=protocol==='artnet'?'':'none';
 if(priorityBlock)priorityBlock.style.display=protocol==='sacn'?'':'none';
 if(universe){
  const limit=protocolUniverseLimit(protocol);universe.max=String(limit);
  if(Number(universe.value)>limit)universe.value=String(limit);
 }
 if(info){
  info.style.display=protocol==='sacn'?'block':'none';
  info.textContent=protocol==='sacn'?(t().sacnInfo+' '+sacnMulticastAddress(universe&&universe.value)):t().sacnInfo;
 }
}
function discoverNodes(){
 const transport=controlTransport();
 if(!transport.isAvailable()||typeof transport.discover!=='function'){status(t().native,false);return}
 const id='artnet_discovery_'+Date.now()+'_'+(++seq);
 status(t().discovering);
 try{if(!transport.discover({id:id,timeoutMs:900}))status(t().native,false)}catch(e){status(t().error,false)}
}
function renderDiscoveredNodes(nodes){
 const select=E('artnetDiscoveredNodes');if(!select)return;
 const list=Array.isArray(nodes)?nodes:[];
 select.innerHTML='<option value="">'+esc(list.length?t().nodes:t().noNodes)+'</option>'+
  list.map(node=>'<option value="'+esc(node.ip||'')+'">'+esc((node.shortName||node.longName||'Art-Net')+' · '+(node.ip||''))+'</option>').join('');
 select.disabled=!list.length;
}
window.LightingAIArtNetDiscoveryResult=function(id,nodes,error){
 if(error){renderDiscoveredNodes([]);status(error,false);return}
 renderDiscoveredNodes(nodes);
 status((Array.isArray(nodes)&&nodes.length)?(t().nodes+': '+nodes.length):t().noNodes,Array.isArray(nodes)&&nodes.length>0);
};
function snapshot(){try{return window.LightingAIDmxSnapshot?window.LightingAIDmxSnapshot():null}catch(e){return null}}
function rows(){const s=snapshot();return s&&Array.isArray(s.rows)?s.rows:[]}
function patchSignature(){
 return JSON.stringify(rows().map(r=>({
  fixtureId:r.fixtureId||'',mode:r.mode||'',universe:Number(r.universe)||1,start:Number(r.start)||1,channels:Number(r.channels)||0
 })));
}
function rowKey(r){
 return [r&&r.fixtureId||'',r&&r.mode||'',Number(r&&r.universe)||1,Number(r&&r.start)||1,Number(r&&r.channels)||0].join('|');
}
function readGroups(){
 try{
  const value=JSON.parse(localStorage.getItem(GROUPS_KEY)||'[]');
  return Array.isArray(value)?value:[];
 }catch(e){return []}
}
function writeGroups(items){
 try{localStorage.setItem(GROUPS_KEY,JSON.stringify(items.slice(0,MAX_GROUPS)));return true}catch(e){return false}
}
function groupEligibleRows(){
 return rows().map((r,index)=>{
  if(!patchUsable(r))return null;
  const fixture=fixtureForRow(r),profile=profileForRow(r),controls=profile&&Array.isArray(profile.controls)?profile.controls:[];
  const hasDimmer=controls.some(ctrl=>ctrl&&ctrl.key==='dimmer'&&ctrl.type==='percent');
  const hasCct=controls.some(ctrl=>ctrl&&ctrl.key==='cct'&&ctrl.type==='cct-linear');
  const hasRgb=['red','green','blue'].every(key=>controls.some(ctrl=>ctrl&&ctrl.key===key&&ctrl.type==='percent'));
  return fixture&&profile&&(hasDimmer||hasCct||hasRgb)?{row:r,index:index,fixture:fixture,profile:profile,key:rowKey(r)}:null;
 }).filter(Boolean);
}
function saveControlGroup(){
 const input=E('artnetGroupName'),name=input&&input.value?input.value.trim():'';
 if(!name){status(t().groupNeedName,false);return}
 const members=Array.prototype.slice.call(document.querySelectorAll('.artnet-group-member:checked')).map(el=>el.dataset.key).filter(Boolean);
 if(!members.length){status(t().groupNeedMember,false);return}
 const groups=readGroups(),existing=groups.findIndex(group=>group&&group.name===name);
 const item={version:1,name:name,patchSignature:patchSignature(),members:Array.from(new Set(members))};
 if(existing>=0)groups[existing]=item;
 else{
  if(groups.length>=MAX_GROUPS){status(t().groupLimit,false);return}
  groups.push(item);
 }
 if(!writeGroups(groups)){status(t().error,false);return}
 if(input)input.value='';
 renderControlGroups();status(t().groupSaved,true);
}
function applyGroupSelectionToMaster(selector,entries,members){
 document.querySelectorAll(selector).forEach(input=>{
  const entry=entries[Number(input.dataset.entry)];
  input.checked=!!(entry&&members.has(rowKey(entry.row)));
 });
}
function applyControlGroup(index){
 const groups=readGroups(),group=groups[index];
 if(!group)return;
 if(group.patchSignature!==patchSignature()){status(t().groupPatchMismatch,false);return}
 const members=new Set(Array.isArray(group.members)?group.members:[]);
 applyGroupSelectionToMaster('.artnet-master-device',verifiedDimmerEntries(),members);
 applyGroupSelectionToMaster('.artnet-master-cct-device',verifiedCctEntries(),members);
 applyGroupSelectionToMaster('.artnet-master-rgb-device',verifiedRgbEntries(),members);
 refreshMasterCctBounds();
 status(t().groupApplied+': '+group.name,true);
 renderControlGroups();
}
function deleteControlGroup(index){
 const groups=readGroups();
 if(index<0||index>=groups.length)return;
 groups.splice(index,1);writeGroups(groups);renderControlGroups();
}
function renderControlGroups(){
 const box=E('artnetControlGroups');if(!box)return;
 const entries=groupEligibleRows(),groups=readGroups();
 const members=entries.length?entries.map(entry=>{
  const f=entry.fixture,r=entry.row;
  return '<label style="display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-top:1px solid #2d333a"><input class="artnet-group-member" data-key="'+esc(entry.key)+'" type="checkbox" checked style="width:auto;margin-top:2px"><span>'+esc((f.manufacturer||'')+' '+(f.model||f.id))+'<br><span class="muted small">U'+Number(r.universe)+' · '+Number(r.start)+' · '+esc(r.mode||entry.profile.name)+'</span></span></label>';
 }).join(''):'<div class="muted small">'+esc(t().groupNone)+'</div>';
 const saved=groups.length?groups.map((group,i)=>{
  const valid=group&&group.patchSignature===patchSignature();
  return '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 0;border-top:1px solid #2d333a"><span><b>'+esc(group&&group.name||('Group '+(i+1)))+'</b><br><span class="muted small">'+Number(group&&group.members&&group.members.length||0)+' · '+(valid?'OK':'⚠')+'</span></span><span style="display:flex;gap:6px"><button class="btn secondary artnet-group-apply" data-index="'+i+'" type="button">'+esc(t().groupApply)+'</button><button class="btn danger artnet-group-delete" data-index="'+i+'" type="button">'+esc(t().groupDelete)+'</button></span></div>';
 }).join(''):'<div class="muted small" style="margin-top:8px">'+esc(t().groupEmpty)+'</div>';
 box.innerHTML='<div style="font-size:11px;color:#9da3ad;margin-top:12px">'+esc(t().groupTitle)+'</div><div class="muted small" style="margin:5px 0 8px">'+esc(t().groupHint)+'</div>'+members+'<div class="row" style="margin-top:8px"><input id="artnetGroupName" placeholder="'+esc(t().groupName)+'"><button id="artnetGroupSave" class="btn secondary" type="button">'+esc(t().groupSave)+'</button></div>'+saved;
 const save=E('artnetGroupSave');if(save)save.addEventListener('click',saveControlGroup);
 box.querySelectorAll('.artnet-group-apply').forEach(btn=>btn.addEventListener('click',()=>applyControlGroup(Number(btn.dataset.index))));
 box.querySelectorAll('.artnet-group-delete').forEach(btn=>btn.addEventListener('click',()=>deleteControlGroup(Number(btn.dataset.index))));
}
function readScenes(){
 try{
  const value=JSON.parse(localStorage.getItem(SCENES_KEY)||'[]');
  return Array.isArray(value)?value:[];
 }catch(e){return []}
}
function writeScenes(items){
 try{localStorage.setItem(SCENES_KEY,JSON.stringify(items.slice(0,MAX_SCENES)));return true}catch(e){return false}
}
function readCues(){
 try{
  const value=JSON.parse(localStorage.getItem(CUES_KEY)||'[]');
  return Array.isArray(value)?value:[];
 }catch(e){return []}
}
function writeCues(items){
 try{localStorage.setItem(CUES_KEY,JSON.stringify(items.slice(0,MAX_CUES)));return true}catch(e){return false}
}
function sceneIndexByName(name){
 return readScenes().findIndex(scene=>scene&&scene.name===name);
}
function cueFadeSecondsValue(){
 const input=E('artnetCueFadeSeconds'),raw=input?Number(input.value):fadeSeconds();
 return Math.max(0,Math.min(60,Number.isFinite(raw)?raw:fadeSeconds()));
}
function addCue(){
 const select=E('artnetCueScene'),name=select&&select.value?select.value:'';
 if(!name){status(t().cueMissing,false);return}
 const cues=readCues();
 if(cues.length>=MAX_CUES){status(t().cueLimit,false);return}
 cues.push({version:1,sceneName:name,fadeSeconds:cueFadeSecondsValue()});
 if(!writeCues(cues)){status(t().error,false);return}
 renderCueStack();status(t().cueAdded,true);
}
function moveCue(index,delta){
 const cues=readCues(),to=index+delta;
 if(index<0||index>=cues.length||to<0||to>=cues.length)return;
 const item=cues[index];cues[index]=cues[to];cues[to]=item;
 if(currentCueIndex===index)currentCueIndex=to;
 else if(currentCueIndex===to)currentCueIndex=index;
 writeCues(cues);renderCueStack();
}
function deleteCue(index){
 const cues=readCues();
 if(index<0||index>=cues.length)return;
 cues.splice(index,1);
 if(currentCueIndex===index)currentCueIndex=-1;
 else if(currentCueIndex>index)currentCueIndex--;
 writeCues(cues);renderCueStack();
}
function resetCueStack(){
 currentCueIndex=-1;cancelSceneFade(false);renderCueStack();status(t().ready);
}
function goCue(index){
 if(!requireOutputArmed())return;
 if(activeSceneFade){status(t().cueBusy,false);return}
 const cues=readCues();
 if(!cues.length){status(t().cueEmpty,false);return}
 const target=index==null?currentCueIndex+1:index;
 if(target<0||target>=cues.length){status(t().cueEnd,false);return}
 const cue=cues[target],sceneIndex=sceneIndexByName(cue.sceneName);
 if(sceneIndex<0){status(t().cueMissing,false);return}
 const fade=Math.max(0,Math.min(60,Number(cue.fadeSeconds)||0));
 if(fade>0)fadeToScene(sceneIndex,fade);else applyScene(sceneIndex);
 currentCueIndex=target;renderCueStack();
}
function previousCue(){
 if(activeSceneFade){status(t().cueBusy,false);return}
 if(currentCueIndex<=0){currentCueIndex=-1;renderCueStack();status(t().ready);return}
 goCue(currentCueIndex-1);
}
function renderCueStack(){
 const select=E('artnetCueScene'),list=E('artnetCueList');
 if(!select||!list)return;
 const scenes=readScenes(),previous=select.value;
 select.innerHTML=scenes.length?scenes.map(scene=>'<option value="'+esc(scene.name||'')+'">'+esc(scene.name||'')+'</option>').join(''):'<option value="">'+esc(t().sceneEmpty)+'</option>';
 if(previous&&scenes.some(scene=>scene&&scene.name===previous))select.value=previous;
 select.disabled=!scenes.length;
 const cues=readCues();
 if(!cues.length){list.innerHTML='<div class="muted small" style="margin-top:7px">'+esc(t().cueEmpty)+'</div>';return}
 list.innerHTML=cues.map((cue,i)=>{
  const exists=sceneIndexByName(cue.sceneName)>=0,active=i===currentCueIndex;
  return '<div style="padding:8px 0;border-top:1px solid #2d333a;'+(active?'font-weight:900':'')+'"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span>'+(active?'<span class="muted small">'+esc(t().cueCurrent)+' · </span>':'')+esc((i+1)+'. '+(cue.sceneName||'?'))+' · '+Number(cue.fadeSeconds||0).toFixed(1)+'s'+(exists?'':' ⚠')+'</span><span style="display:flex;gap:5px;flex-wrap:wrap"><button class="btn secondary artnet-cue-go" data-index="'+i+'" type="button">'+esc(t().cueGo)+'</button><button class="btn secondary artnet-cue-up" data-index="'+i+'" type="button">↑</button><button class="btn secondary artnet-cue-down" data-index="'+i+'" type="button">↓</button><button class="btn danger artnet-cue-delete" data-index="'+i+'" type="button">'+esc(t().cueDelete)+'</button></span></div>'+(exists?'':'<div class="muted small">'+esc(t().cueMissing)+'</div>')+'</div>';
 }).join('');
 list.querySelectorAll('.artnet-cue-go').forEach(btn=>btn.addEventListener('click',()=>goCue(Number(btn.dataset.index))));
 list.querySelectorAll('.artnet-cue-up').forEach(btn=>btn.addEventListener('click',()=>moveCue(Number(btn.dataset.index),-1)));
 list.querySelectorAll('.artnet-cue-down').forEach(btn=>btn.addEventListener('click',()=>moveCue(Number(btn.dataset.index),1)));
 list.querySelectorAll('.artnet-cue-delete').forEach(btn=>btn.addEventListener('click',()=>deleteCue(Number(btn.dataset.index))));
}
function cloneFrames(){
 const out={};
 Object.keys(frames).forEach(u=>{out[u]=frames[u].slice(0,512).map(v=>Math.max(0,Math.min(255,Number(v)||0)))});
 return out;
}
function knownUniverseNumbers(){
 const values=new Set(Object.keys(frames).map(v=>Number(v)).filter(v=>Number.isFinite(v)&&v>=1));
 rows().forEach(r=>{const u=Number(r&&r.universe);if(Number.isFinite(u)&&u>=1)values.add(u)});
 return Array.from(values).sort((a,b)=>a-b);
}
function globalBlackout(){
 if(!requireOutputArmed())return;
 cancelSceneFade(false);
 const universes=knownUniverseNumbers();
 if(!universes.length){status(t().panicEmpty,false);return}
 const saved={};
 universes.forEach(u=>{
  saved[String(u)]=(frames[String(u)]||new Array(512).fill(0)).slice(0,512);
  while(saved[String(u)].length<512)saved[String(u)].push(0);
 });
 lastBlackoutSnapshot={patchSignature:patchSignature(),frames:saved};
 universes.forEach(u=>{
  frames[String(u)]=new Array(512).fill(0);
  sendFrame(frames[String(u)].slice(),u,'panic');
 });
 status(t().panicDone,true);
}
function restoreBeforeBlackout(){
 if(!requireOutputArmed())return;
 if(!lastBlackoutSnapshot||!lastBlackoutSnapshot.frames){status(t().panicRestoreEmpty,false);return}
 if(lastBlackoutSnapshot.patchSignature!==patchSignature()){status(t().panicPatchChanged,false);return}
 cancelSceneFade(false);
 const saved=lastBlackoutSnapshot.frames;
 Object.keys(saved).forEach(u=>{
  frames[String(u)]=saved[u].slice(0,512);
  while(frames[String(u)].length<512)frames[String(u)].push(0);
  sendFrame(frames[String(u)].slice(),Number(u),'restore');
 });
 lastBlackoutSnapshot=null;
 status(t().panicRestored,true);
}
function clearBlackoutRestore(){
 lastBlackoutSnapshot=null;
}
function renderScenes(){
 const box=E('artnetSceneList');if(!box)return;
 const scenes=readScenes();
 if(!scenes.length){box.innerHTML='<div class="muted small" style="margin-top:7px">'+esc(t().sceneEmpty)+'</div>';return}
 box.innerHTML=scenes.map((scene,i)=>'<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 0;border-top:1px solid #2d333a"><b>'+esc(scene.name||('Scene '+(i+1)))+'</b><span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn secondary artnet-scene-apply" data-index="'+i+'" type="button">'+esc(t().sceneApply)+'</button><button class="btn secondary artnet-scene-fade" data-index="'+i+'" type="button">'+esc(t().sceneFade)+'</button><button class="btn danger artnet-scene-delete" data-index="'+i+'" type="button">'+esc(t().sceneDelete)+'</button></span></div>').join('');
 box.querySelectorAll('.artnet-scene-apply').forEach(btn=>btn.addEventListener('click',()=>applyScene(Number(btn.dataset.index))));
 box.querySelectorAll('.artnet-scene-fade').forEach(btn=>btn.addEventListener('click',()=>fadeToScene(Number(btn.dataset.index))));
 box.querySelectorAll('.artnet-scene-delete').forEach(btn=>btn.addEventListener('click',()=>deleteScene(Number(btn.dataset.index))));
}
function saveScene(){
 const current=cloneFrames(),universes=Object.keys(current);
 if(!universes.length){status(t().sceneNeedFrame,false);return}
 const scenes=readScenes(),input=E('artnetSceneName');
 const raw=input&&input.value?input.value.trim():'';
 const name=raw||('Scene '+(scenes.length+1));
 const replacement=scenes.findIndex(scene=>scene&&scene.name===name);
 const item={version:1,name:name,savedAt:Date.now(),patchSignature:patchSignature(),frames:current};
 if(replacement>=0)scenes[replacement]=item;
 else{
  if(scenes.length>=MAX_SCENES){status(t().sceneLimit,false);return}
  scenes.push(item);
 }
 if(!writeScenes(scenes)){status(t().error,false);return}
 if(input)input.value='';
 renderScenes();renderCueStack();status(t().sceneSaved,true);
}
function normalizedSceneFrames(scene){
 const next={};
 if(!scene||!scene.frames)return next;
 Object.keys(scene.frames).forEach(u=>{
  if(!Array.isArray(scene.frames[u]))return;
  next[u]=scene.frames[u].slice(0,512).map(v=>Math.max(0,Math.min(255,Number(v)||0)));
  while(next[u].length<512)next[u].push(0);
 });
 return next;
}
function fadeSeconds(){
 const input=E('artnetSceneFadeSeconds'),raw=input?Number(input.value):Number(localStorage.getItem(FADE_KEY)||2);
 return Math.max(0.1,Math.min(60,Number.isFinite(raw)?raw:2));
}
function cancelSceneFade(showStatus){
 if(!activeSceneFade)return;
 if(activeSceneFade.timer)clearInterval(activeSceneFade.timer);
 activeSceneFade=null;
 if(showStatus)status(t().sceneFadeCancelled);
}
function fadeToScene(index,secondsOverride){
 if(!requireOutputArmed())return;
 clearBlackoutRestore();
 const scenes=readScenes(),scene=scenes[index];
 if(!scene||!scene.frames)return;
 if(scene.patchSignature!==patchSignature()){status(t().scenePatchMismatch,false);return}
 const next=normalizedSceneFrames(scene),universeSet=new Set(Object.keys(frames).concat(Object.keys(next)));
 if(!universeSet.size){status(t().sceneNeedFrame,false);return}
 cancelSceneFade(false);
 const start={},target={},universes=Array.from(universeSet);
 universes.forEach(u=>{
  start[u]=(frames[u]||new Array(512).fill(0)).slice(0,512);
  while(start[u].length<512)start[u].push(0);
  target[u]=(next[u]||new Array(512).fill(0)).slice(0,512);
  while(target[u].length<512)target[u].push(0);
 });
 const seconds=secondsOverride==null?fadeSeconds():Math.max(0.1,Math.min(60,Number(secondsOverride)||fadeSeconds()));
 const duration=Math.max(100,Math.round(seconds*1000)),started=Date.now();
 const tick=()=>{
  if(!activeSceneFade)return;
  const p=Math.min(1,(Date.now()-started)/duration);
  universes.forEach(u=>{
   const out=new Array(512);
   for(let i=0;i<512;i++)out[i]=Math.round(start[u][i]+(target[u][i]-start[u][i])*p);
   frames[u]=out;
   sendFrame(out.slice(),Number(u),'fade');
  });
  if(p>=1){
   if(activeSceneFade&&activeSceneFade.timer)clearInterval(activeSceneFade.timer);
   const wasLive=liveEnabled;
   activeSceneFade=null;
   if(wasLive)setLiveEnabled(false);
   Object.keys(frames).forEach(u=>delete frames[u]);
   Object.keys(next).forEach(u=>{frames[u]=next[u];});
   if(wasLive)setLiveEnabled(true);
   status(t().sceneFadeDone,true);
  }
 };
 activeSceneFade={timer:setInterval(tick,33),sceneIndex:index};
 status(t().sceneFading);
 tick();
}
function applyScene(index){
 if(!requireOutputArmed())return;
 const scenes=readScenes(),scene=scenes[index];
 if(!scene||!scene.frames)return;
 if(scene.patchSignature!==patchSignature()){status(t().scenePatchMismatch,false);return}
 cancelSceneFade(false);
 const next=normalizedSceneFrames(scene);
 const oldUniverses=Object.keys(frames),wasLive=liveEnabled;
 if(wasLive)setLiveEnabled(false);
 if(!wasLive)oldUniverses.filter(u=>!next[u]).forEach(u=>sendFrame(new Array(512).fill(0),Number(u)));
 Object.keys(frames).forEach(u=>delete frames[u]);
 Object.keys(next).forEach(u=>{frames[u]=next[u];});
 if(wasLive)setLiveEnabled(true);else Object.keys(frames).forEach(u=>sendFrame(frames[u].slice(),Number(u)));
 status(t().sceneApplied,true);
}
function deleteScene(index){
 const scenes=readScenes();
 if(index<0||index>=scenes.length)return;
 const deleted=scenes[index]&&scenes[index].name;
 scenes.splice(index,1);writeScenes(scenes);
 if(deleted){
  const cues=readCues().filter(cue=>cue&&cue.sceneName!==deleted);
  writeCues(cues);currentCueIndex=-1;
 }
 renderScenes();renderCueStack();
}
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
function verifiedCctEntries(){
 return rows().map((r,index)=>{
  if(!patchUsable(r))return null;
  const profile=profileForRow(r),fixture=fixtureForRow(r);
  const control=profile&&Array.isArray(profile.controls)?profile.controls.find(ctrl=>ctrl&&ctrl.key==='cct'&&ctrl.type==='cct-linear'):null;
  return profile&&fixture&&control?{row:r,index:index,profile:profile,fixture:fixture,control:control}:null;
 }).filter(Boolean);
}
function verifiedRgbEntries(){
 return rows().map((r,index)=>{
  if(!patchUsable(r))return null;
  const profile=profileForRow(r),fixture=fixtureForRow(r),controls=profile&&Array.isArray(profile.controls)?profile.controls:[];
  const red=controls.find(ctrl=>ctrl&&ctrl.key==='red'&&ctrl.type==='percent');
  const green=controls.find(ctrl=>ctrl&&ctrl.key==='green'&&ctrl.type==='percent');
  const blue=controls.find(ctrl=>ctrl&&ctrl.key==='blue'&&ctrl.type==='percent');
  return profile&&fixture&&red&&green&&blue?{row:r,index:index,profile:profile,fixture:fixture,red:red,green:green,blue:blue}:null;
 }).filter(Boolean);
}
function cctBounds(entries){
 if(!entries.length)return null;
 const min=Math.max.apply(null,entries.map(entry=>Number(entry.control.min||0)));
 const max=Math.min.apply(null,entries.map(entry=>Number(entry.control.max||0)));
 return max>=min?{min:min,max:max}:null;
}
function controlBitDepth(ctrl){
 const explicit=Number(ctrl&&ctrl.bits);
 if(explicit===16)return 16;
 return Number(ctrl&&ctrl.dmxMax)>255?16:8;
}
function controlToDmx(ctrl,value){
 const inMin=Number(ctrl.min||0),inMax=Number(ctrl.max||100),outMin=Number(ctrl.dmxMin||0);
 const maxDefault=controlBitDepth(ctrl)===16?65535:255;
 const outMax=Number(ctrl.dmxMax==null?maxDefault:ctrl.dmxMax);
 const normalized=inMax===inMin?0:Math.max(0,Math.min(1,(Number(value)-inMin)/(inMax-inMin)));
 return Math.max(0,Math.min(maxDefault,Math.round(outMin+normalized*(outMax-outMin))));
}
function writeControlToFrame(targetFrame,address,ctrl,value){
 const start=Math.max(1,Number(address)||1),bits=controlBitDepth(ctrl),width=bits===16?2:1;
 if(!Array.isArray(targetFrame)||start+width-1>512)return false;
 const dmx=controlToDmx(ctrl,value);
 if(bits===16){
  targetFrame[start-1]=(dmx>>8)&255;
  targetFrame[start]=dmx&255;
 }else targetFrame[start-1]=dmx&255;
 return true;
}
function applyProfileRequirements(targetFrame,fixtureStart,profile){
 const requirements=profile&&Array.isArray(profile.requiredChannels)?profile.requiredChannels:[];
 let ok=true;
 requirements.forEach(item=>{
  const address=Math.max(1,Number(fixtureStart)||1)+Math.max(1,Number(item&&item.channel)||1)-1;
  if(!Array.isArray(targetFrame)||address>512){ok=false;return}
  targetFrame[address-1]=Math.max(0,Math.min(255,Number(item&&item.value)||0));
 });
 return ok;
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
 if(!requireOutputArmed())return;
 const entries=verifiedDimmerEntries(),selected=Array.prototype.slice.call(document.querySelectorAll('.artnet-master-device:checked')).map(el=>entries[Number(el.dataset.entry)]).filter(Boolean);
 if(!selected.length){status(t().masterEmpty,false);return}
 const universes=new Set();
 selected.forEach(entry=>{
  const r=entry.row,ctrl=entry.control,u=Math.max(1,Number(r.universe)||1),target=frame(u);
  const address=Math.max(1,Number(r.start)||1)+Math.max(1,Number(ctrl.channel)||1)-1;
  if(applyProfileRequirements(target,r.start,entry.profile)&&writeControlToFrame(target,address,ctrl,value))universes.add(u);
 });
 if(!universes.size){status(t().error,false);return}
 universes.forEach(u=>sendFrame(frame(u).slice(),u));
 if(E('artnetMasterRange'))E('artnetMasterRange').value=String(Math.max(0,Math.min(100,Number(value)||0)));
 if(E('artnetMasterValue'))E('artnetMasterValue').textContent=Math.round(Math.max(0,Math.min(100,Number(value)||0)))+'%';
}
function renderMasterCctControl(){
 const box=E('artnetMasterCctControl');if(!box)return;
 const entries=verifiedCctEntries();
 if(!entries.length){box.innerHTML='<div class="muted small">'+esc(t().masterCctNone)+'</div>';return}
 const devices=entries.map((entry,i)=>{
  const f=entry.fixture,r=entry.row;
  return '<label style="display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-top:1px solid #2d333a"><input class="artnet-master-cct-device" data-entry="'+i+'" type="checkbox" checked style="width:auto;margin-top:2px"><span>'+esc((f.manufacturer||'')+' '+(f.model||f.id))+'<br><span class="muted small">U'+Number(r.universe)+' · '+Number(r.start)+' · '+esc(r.mode||entry.profile.name)+'</span></span></label>';
 }).join('');
 const bounds=cctBounds(entries);
 if(!bounds){box.innerHTML='<div class="muted small">'+esc(t().masterCctNoCommon)+'</div>'+devices;return}
 const initial=Math.round((bounds.min+bounds.max)/2/10)*10;
 box.innerHTML='<div style="font-size:11px;color:#9da3ad;margin-top:12px">'+esc(t().masterCctTitle)+'</div><div class="muted small" style="margin:5px 0 8px">'+esc(t().masterCctHint)+'</div>'+devices+'<div style="display:flex;justify-content:space-between;gap:8px;margin-top:10px"><b>CCT</b><span id="artnetMasterCctValue" class="muted small">'+initial+'K</span></div><input id="artnetMasterCctRange" type="range" min="'+bounds.min+'" max="'+bounds.max+'" step="10" value="'+initial+'"><div class="actions"><button id="artnetMasterCctApply" class="btn primary" type="button">'+esc(t().masterCctApply)+'</button></div>';
 E('artnetMasterCctRange').addEventListener('input',()=>{E('artnetMasterCctValue').textContent=Math.round(Number(E('artnetMasterCctRange').value)||0)+'K'});
 E('artnetMasterCctApply').addEventListener('click',()=>applyMasterCct(Number(E('artnetMasterCctRange').value)||initial));
 box.querySelectorAll('.artnet-master-cct-device').forEach(input=>input.addEventListener('change',refreshMasterCctBounds));
}
function selectedMasterCctEntries(){
 const entries=verifiedCctEntries();
 return Array.prototype.slice.call(document.querySelectorAll('.artnet-master-cct-device:checked')).map(el=>entries[Number(el.dataset.entry)]).filter(Boolean);
}
function refreshMasterCctBounds(){
 const selected=selectedMasterCctEntries(),range=E('artnetMasterCctRange'),readout=E('artnetMasterCctValue');
 if(!range)return;
 const bounds=cctBounds(selected);
 if(!bounds){status(t().masterCctNoCommon,false);return}
 range.min=String(bounds.min);range.max=String(bounds.max);
 const current=Math.max(bounds.min,Math.min(bounds.max,Number(range.value)||bounds.min));
 range.value=String(current);
 if(readout)readout.textContent=Math.round(current)+'K';
 status(t().ready);
}
function applyMasterCct(value){
 if(!requireOutputArmed())return;
 const selected=selectedMasterCctEntries();
 if(!selected.length){status(t().masterEmpty,false);return}
 const bounds=cctBounds(selected);
 if(!bounds){status(t().masterCctNoCommon,false);return}
 const requested=Math.max(bounds.min,Math.min(bounds.max,Number(value)||bounds.min));
 const universes=new Set();
 selected.forEach(entry=>{
  const r=entry.row,ctrl=entry.control,u=Math.max(1,Number(r.universe)||1),target=frame(u);
  const address=Math.max(1,Number(r.start)||1)+Math.max(1,Number(ctrl.channel)||1)-1;
  if(applyProfileRequirements(target,r.start,entry.profile)&&writeControlToFrame(target,address,ctrl,requested))universes.add(u);
 });
 if(!universes.size){status(t().error,false);return}
 universes.forEach(u=>sendFrame(frame(u).slice(),u));
 if(E('artnetMasterCctRange'))E('artnetMasterCctRange').value=String(requested);
 if(E('artnetMasterCctValue'))E('artnetMasterCctValue').textContent=Math.round(requested)+'K';
}
function renderMasterRgbControl(){
 const box=E('artnetMasterRgbControl');if(!box)return;
 const entries=verifiedRgbEntries();
 if(!entries.length){box.innerHTML='<div class="muted small">'+esc(t().masterRgbNone)+'</div>';return}
 const devices=entries.map((entry,i)=>{
  const f=entry.fixture,r=entry.row;
  return '<label style="display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-top:1px solid #2d333a"><input class="artnet-master-rgb-device" data-entry="'+i+'" type="checkbox" checked style="width:auto;margin-top:2px"><span>'+esc((f.manufacturer||'')+' '+(f.model||f.id))+'<br><span class="muted small">U'+Number(r.universe)+' · '+Number(r.start)+' · '+esc(r.mode||entry.profile.name)+'</span></span></label>';
 }).join('');
 function slider(key,label){
  return '<div style="padding-top:8px"><div style="display:flex;justify-content:space-between"><b>'+label+'</b><span id="artnetMasterRgb'+key+'Value" class="muted small">0%</span></div><input id="artnetMasterRgb'+key+'" type="range" min="0" max="100" value="0"></div>';
 }
 box.innerHTML='<div style="font-size:11px;color:#9da3ad;margin-top:12px">'+esc(t().masterRgbTitle)+'</div><div class="muted small" style="margin:5px 0 8px">'+esc(t().masterRgbHint)+'</div>'+devices+slider('R','R')+slider('G','G')+slider('B','B')+'<div class="actions"><button id="artnetMasterRgbApply" class="btn primary" type="button">'+esc(t().masterRgbApply)+'</button></div>';
 ['R','G','B'].forEach(key=>E('artnetMasterRgb'+key).addEventListener('input',()=>{E('artnetMasterRgb'+key+'Value').textContent=Math.round(Number(E('artnetMasterRgb'+key).value)||0)+'%'}));
 E('artnetMasterRgbApply').addEventListener('click',()=>applyMasterRgb(Number(E('artnetMasterRgbR').value)||0,Number(E('artnetMasterRgbG').value)||0,Number(E('artnetMasterRgbB').value)||0));
}
function selectedMasterRgbEntries(){
 const entries=verifiedRgbEntries();
 return Array.prototype.slice.call(document.querySelectorAll('.artnet-master-rgb-device:checked')).map(el=>entries[Number(el.dataset.entry)]).filter(Boolean);
}
function applyMasterRgb(redValue,greenValue,blueValue){
 if(!requireOutputArmed())return;
 const selected=selectedMasterRgbEntries();
 if(!selected.length){status(t().masterEmpty,false);return}
 const values={red:Math.max(0,Math.min(100,Number(redValue)||0)),green:Math.max(0,Math.min(100,Number(greenValue)||0)),blue:Math.max(0,Math.min(100,Number(blueValue)||0))};
 const universes=new Set();
 selected.forEach(entry=>{
  const r=entry.row,u=Math.max(1,Number(r.universe)||1),target=frame(u);
  if(!applyProfileRequirements(target,r.start,entry.profile))return;
  let wrote=true;
  [['red',entry.red],['green',entry.green],['blue',entry.blue]].forEach(pair=>{
   const key=pair[0],ctrl=pair[1],address=Math.max(1,Number(r.start)||1)+Math.max(1,Number(ctrl.channel)||1)-1;
   if(!writeControlToFrame(target,address,ctrl,values[key]))wrote=false;
  });
  if(wrote)universes.add(u);
 });
 if(!universes.size){status(t().error,false);return}
 universes.forEach(u=>sendFrame(frame(u).slice(),u));
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
 if(!requireOutputArmed())return;
 if(!patchUsable(r)||!profile||!ctrl)return;
 const u=Math.max(1,Number(r.universe)||1);
 const address=Math.max(1,Number(r.start)||1)+Math.max(1,Number(ctrl.channel)||1)-1;
 const f=frame(u);
 if(!applyProfileRequirements(f,r.start,profile)||!writeControlToFrame(f,address,ctrl,value)){status(t().error,false);return}
 sendFrame(f.slice(),u);
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
function sendFrame(channels,universe,source){
 if(!outputArmed){status(t().armRequired,false);return false}
 const quiet=source==='fade'||source==='panic'||source==='restore';
 if(source!=='panic'&&source!=='restore'&&source!=='fade')clearBlackoutRestore();
 if(activeSceneFade&&!quiet)cancelSceneFade(false);
 const transport=controlTransport(),protocol=selectedProtocol();
 if(!transport.isAvailable()){status(t().native,false);return}
 const limit=protocolUniverseLimit(protocol),u=Math.max(1,Math.min(limit,Number(universe)||1));
 const rawTarget=(E('artnetTarget')&&E('artnetTarget').value||'AUTO').trim();
 const ip=!rawTarget||rawTarget==='255.255.255.255'?'AUTO':rawTarget;
 if(protocol==='artnet'){try{localStorage.setItem(TARGET_KEY,ip)}catch(e){}}
 const prefix=source==='fade'?'fade_':(source==='panic'?'panic_':(source==='restore'?'restore_':'networkdmx_'));
 const id=prefix+Date.now()+'_'+(++seq);
 if(!quiet)status(t().sending);
 try{
  const request={id:id,targetIp:ip,universe:u,channels:channels};
  let ok=false;
  if(protocol==='sacn'){
   ok=liveEnabled&&typeof transport.supportsLive==='function'&&transport.supportsLive('sacn')?transport.setSacnLiveDmx(request):transport.sendSacnDmx(request);
  }else{
   ok=liveEnabled&&typeof transport.supportsLive==='function'&&transport.supportsLive('artnet')?transport.setLiveDmx(request):transport.sendDmx(request);
  }
  if(!ok){if(quiet)cancelSceneFade(false);status(t().native,false)}
 }catch(e){if(quiet)cancelSceneFade(false);status(t().error,false)}
}
function sendTest(){
 if(!requireOutputArmed())return;
 const u=Math.max(1,Number(E('artnetUniverse').value)||1);
 const ch=Math.min(512,Math.max(1,Number(E('artnetChannel').value)||1));
 const v=Math.min(255,Math.max(0,Number(E('artnetValue').value)||0));
 const f=frame(u);f[ch-1]=v;sendFrame(f.slice(),u);
}
function blackout(){
 if(!requireOutputArmed())return;
 const u=Math.max(1,Number(E('artnetUniverse').value)||1);
 frames[String(u)]=new Array(512).fill(0);
 sendFrame(frames[String(u)].slice(),u);
}
function setLiveEnabled(enabled){
 const transport=controlTransport(),toggle=E('artnetLiveToggle');
 if(enabled){
  if(!requireOutputArmed()){liveEnabled=false;if(toggle)toggle.checked=false;return}
  const protocol=selectedProtocol();
  if(typeof transport.supportsLive!=='function'||!transport.supportsLive(protocol)){liveEnabled=false;if(toggle)toggle.checked=false;status(t().native,false);return}
  liveProtocol=protocol;liveEnabled=true;if(toggle)toggle.checked=true;
  Object.keys(frames).forEach(u=>sendFrame(frames[u].slice(),Number(u)));
  status(t().liveOn,true);
 }else{
  const protocol=liveProtocol||selectedProtocol();
  liveEnabled=false;if(toggle)toggle.checked=false;
  const id='networkdmx_stop_'+Date.now()+'_'+(++seq);
  try{if(typeof transport.stopLive==='function')transport.stopLive({id:id,protocol:protocol})}catch(e){}
  status(t().liveOff);
 }
}
function stopLiveForBackground(){
 setOutputArmed(false,true);
}
window.LightingAIArtNetResult=function(id,ok,message){
 const resultId=String(id||'');
 if(resultId.indexOf('fade_')===0||resultId.indexOf('panic_')===0||resultId.indexOf('restore_')===0){
  if(!ok){if(resultId.indexOf('fade_')===0)cancelSceneFade(false);status(message||t().error,false)}
  return;
 }
 status(ok?t().sent:(message||t().error),!!ok);
};
function translate(){
 if(!E('artnetCard'))return;
 const x=t();
 E('artnetTitle').textContent=x.title;E('artnetIntro').textContent=x.intro;E('networkDmxBridgeTitle').textContent=x.bridgeTitle;E('networkDmxBridgeLabel').textContent=x.bridgeSelect;E('networkDmxProtocolLabel').textContent=x.protocol;E('networkDmxProtocol').options[0].text=x.artnet;E('networkDmxProtocol').options[1].text=x.sacn;E('artnetTargetLabel').textContent=x.target;E('artnetAutoHint').textContent=x.artnetAutoHint;E('artnetDiscover').textContent=x.discover;E('artnetRouteLabel').textContent=x.artnetRoute;
 E('artnetPatchDeviceLabel').textContent=x.patchDevice;E('artnetRefreshPatch').textContent=x.refresh;
 E('artnetUniverseLabel').textContent=x.universe;E('artnetChannelLabel').textContent=x.channel;E('artnetValueLabel').textContent=x.value;
 E('artnetSend').textContent=x.send;E('artnetBlackout').textContent=x.blackout;E('artnetLiveLabel').textContent=x.liveLabel;E('artnetLiveHint').textContent=x.liveHint;E('artnetSceneTitle').textContent=x.sceneTitle;E('artnetSceneHint').textContent=x.sceneHint;E('artnetSceneName').placeholder=x.sceneName;E('artnetSceneSave').textContent=x.sceneSave;E('artnetSceneFadeLabel').textContent=x.sceneFadeSeconds;E('artnetCueTitle').textContent=x.cueTitle;E('artnetCueHint').textContent=x.cueHint;E('artnetCueSceneLabel').textContent=x.cueScene;E('artnetCueFadeLabel').textContent=x.cueFade;E('artnetCueAdd').textContent=x.cueAdd;E('artnetCuePrevious').textContent=x.cuePrevious;E('artnetCueGo').textContent=x.cueGo;E('artnetCueReset').textContent=x.cueReset;E('artnetPanicTitle').textContent=x.panicTitle;E('artnetPanicHint').textContent=x.panicHint;E('artnetPanicBlackout').textContent=x.panicGo;E('artnetPanicRestore').textContent=x.panicRestore;E('artnetOutputArmLabel').textContent=x.armLabel;E('artnetOutputArmHint').textContent=x.armHint;E('artnetDiagnosticsTitle').textContent=x.diagTitle;E('artnetDiagnosticsHint').textContent=x.diagHint;E('artnetDiagnosticsRefresh').textContent=x.diagRefresh;E('sacnPriorityLabel').textContent=x.sacnPriority;E('sacnPriorityHint').textContent=x.sacnPriorityHint;E('artnetPatchHint').textContent=x.patch;E('artnetOwnership').textContent=x.ownership;
 updateProtocolUi();renderBridge();renderPatchDevices();renderMasterControl();renderMasterCctControl();renderMasterRgbControl();renderControlGroups();renderScenes();renderCueStack();renderDiagnostics(null,'');
 if(!E('artnetStatus').textContent)status(x.ready);
}
function install(){
 const page=E('equipment');if(!page||E('artnetCard'))return false;
 const card=document.createElement('details');card.id='artnetCard';card.className='card';card.style.border='1px solid #31506b';
 card.innerHTML='<summary style="font-weight:900;font-size:20px;cursor:pointer"><span id="artnetTitle"></span></summary><div style="margin-top:12px"><p id="artnetIntro" class="muted small"></p><div id="networkDmxBridgeBlock" style="margin-bottom:12px"><div id="networkDmxBridgeTitle" style="font-size:11px;color:#9da3ad"></div><label class="caption" id="networkDmxBridgeLabel" style="display:block;margin-top:5px"></label><select id="networkDmxBridge"></select><div id="networkDmxBridgeInfo" style="margin-top:7px"></div></div><div class="row"><div><label class="caption" id="networkDmxProtocolLabel"></label><select id="networkDmxProtocol"><option value="artnet">Art-Net</option><option value="sacn">sACN (E1.31)</option></select><div id="sacnMulticastInfo" class="muted small" style="display:none;margin-top:6px"></div></div><div id="sacnPriorityBlock" style="display:none"><label class="caption" id="sacnPriorityLabel"></label><input id="sacnPriority" type="number" min="0" max="200" step="1" value="100"><div id="sacnPriorityHint" class="muted small" style="margin-top:6px"></div></div></div><div class="row"><div id="artnetTargetBlock"><label class="caption" id="artnetTargetLabel"></label><input id="artnetTarget" inputmode="text"><div id="artnetAutoHint" class="muted small" style="margin-top:5px"></div><label class="caption" id="artnetRouteLabel" style="display:block;margin-top:7px"></label><select id="artnetRouteSelect"><option value="AUTO">AUTO</option></select><button id="artnetDiscover" class="btn secondary" type="button" style="width:100%;margin-top:7px"></button><select id="artnetDiscoveredNodes" disabled style="margin-top:7px"><option value=""></option></select></div><div><label class="caption" id="artnetPatchDeviceLabel"></label><select id="artnetPatchDevice"></select><button id="artnetRefreshPatch" class="btn secondary" type="button" style="width:100%;margin-top:7px"></button><div id="artnetPatchSelectionHint" class="muted small" style="margin-top:6px"></div></div></div><div class="row"><div><label class="caption" id="artnetUniverseLabel"></label><input id="artnetUniverse" type="number" min="1" max="63999"></div><div><label class="caption" id="artnetChannelLabel"></label><input id="artnetChannel" type="number" min="1" max="512" value="1"></div></div><div><label class="caption" id="artnetValueLabel"></label><input id="artnetValue" type="range" min="0" max="255" value="0"><div id="artnetValueReadout" class="muted small" style="margin-top:5px">0 / 255</div></div><label style="display:flex;gap:8px;align-items:center;margin-top:10px;padding:10px;border:1px solid #5b4b2f;border-radius:8px"><input id="artnetOutputArm" type="checkbox" style="width:auto"><b id="artnetOutputArmLabel"></b></label><div id="artnetOutputArmHint" class="muted small" style="margin-top:5px"></div><div class="actions"><button id="artnetSend" class="btn primary" type="button"></button><button id="artnetBlackout" class="btn danger" type="button"></button></div><label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input id="artnetLiveToggle" type="checkbox" style="width:auto"><b id="artnetLiveLabel"></b></label><div id="artnetLiveHint" class="muted small" style="margin-top:5px"></div><div id="artnetStatus" class="muted small" style="margin-top:8px"></div><div id="artnetScenes" style="margin-top:12px"><div id="artnetSceneTitle" style="font-size:11px;color:#9da3ad"></div><div id="artnetSceneHint" class="muted small" style="margin:5px 0 8px"></div><div class="row"><input id="artnetSceneName"><button id="artnetSceneSave" class="btn secondary" type="button"></button></div><div style="margin-top:8px"><label class="caption" id="artnetSceneFadeLabel"></label><input id="artnetSceneFadeSeconds" type="number" min="0.1" max="60" step="0.1" value="2"></div><div id="artnetSceneList"></div></div><div id="artnetCues" style="margin-top:14px"><div id="artnetCueTitle" style="font-size:11px;color:#9da3ad"></div><div id="artnetCueHint" class="muted small" style="margin:5px 0 8px"></div><div class="row"><div><label class="caption" id="artnetCueSceneLabel"></label><select id="artnetCueScene"></select></div><div><label class="caption" id="artnetCueFadeLabel"></label><input id="artnetCueFadeSeconds" type="number" min="0" max="60" step="0.1" value="2"></div></div><div class="actions"><button id="artnetCueAdd" class="btn secondary" type="button"></button><button id="artnetCuePrevious" class="btn secondary" type="button"></button><button id="artnetCueGo" class="btn primary" type="button"></button><button id="artnetCueReset" class="btn secondary" type="button"></button></div><div id="artnetCueList"></div></div><div id="artnetPanic" style="margin-top:14px"><div id="artnetPanicTitle" style="font-size:11px;color:#ffb5b5;font-weight:900"></div><div id="artnetPanicHint" class="muted small" style="margin:5px 0 8px"></div><div class="actions"><button id="artnetPanicBlackout" class="btn danger" type="button"></button><button id="artnetPanicRestore" class="btn secondary" type="button"></button></div></div><div id="artnetControlGroups" style="margin-top:14px"></div><div id="artnetDiagnostics" style="margin-top:14px"><div id="artnetDiagnosticsTitle" style="font-size:11px;color:#9da3ad"></div><div id="artnetDiagnosticsHint" class="muted small" style="margin:5px 0 8px"></div><button id="artnetDiagnosticsRefresh" class="btn secondary" type="button"></button><div id="artnetDiagnosticsBody" style="margin-top:8px"></div></div><div id="artnetMasterControl" style="margin-top:10px"></div><div id="artnetMasterCctControl" style="margin-top:10px"></div><div id="artnetMasterRgbControl" style="margin-top:10px"></div><div id="artnetVerifiedControls" style="margin-top:10px"></div><div id="artnetPatchHint" class="muted small" style="margin-top:8px"></div><div id="artnetOwnership" class="status warn" style="margin-top:10px"></div></div>';
 const dmx=E('dmxCard');if(dmx&&dmx.parentNode)dmx.parentNode.insertBefore(card,dmx.nextSibling);else page.appendChild(card);
 try{const saved=localStorage.getItem(TARGET_KEY)||'AUTO';E('artnetTarget').value=saved==='255.255.255.255'?'AUTO':saved}catch(e){E('artnetTarget').value='AUTO'}
 try{E('networkDmxProtocol').value=localStorage.getItem(PROTOCOL_KEY)==='sacn'?'sacn':'artnet'}catch(e){E('networkDmxProtocol').value='artnet'}
 try{
  const savedBridge=localStorage.getItem(BRIDGE_KEY)||'';
  E('networkDmxBridge').innerHTML=VERIFIED_BRIDGES.map(item=>'<option value="'+esc(item.id)+'">'+esc(item.id?(item.manufacturer+' '+item.model):t().bridgeNone)+'</option>').join('');
  E('networkDmxBridge').value=VERIFIED_BRIDGES.some(item=>item.id===savedBridge)?savedBridge:'';
 }catch(e){
  E('networkDmxBridge').innerHTML='<option value="">'+esc(t().bridgeNone)+'</option>';
  E('networkDmxBridge').value='';
 }
 try{E('sacnPriority').value=String(Math.max(0,Math.min(200,Math.round(Number(localStorage.getItem(SACN_PRIORITY_KEY)||100)))))}catch(e){E('sacnPriority').value='100'}
 applySacnPriority();
 try{E('artnetSceneFadeSeconds').value=String(Math.max(0.1,Math.min(60,Number(localStorage.getItem(FADE_KEY)||2))))}catch(e){E('artnetSceneFadeSeconds').value='2'}
 E('artnetUniverse').value=defaultUniverse();
 E('networkDmxProtocol').addEventListener('change',()=>{setOutputArmed(false,true);try{localStorage.setItem(PROTOCOL_KEY,selectedProtocol())}catch(e){}if(selectedProtocol()==='sacn')applySacnPriority();updateProtocolUi();status(t().armOff)});
 E('networkDmxBridge').addEventListener('change',()=>{setOutputArmed(false,true);try{localStorage.setItem(BRIDGE_KEY,E('networkDmxBridge').value||'')}catch(e){}renderBridge();status(t().armOff)});
 E('artnetUniverse').addEventListener('change',updateProtocolUi);
 E('sacnPriority').addEventListener('change',()=>{setOutputArmed(false,true);applySacnPriority();requestDiagnostics();status(t().armOff)});
 E('artnetTarget').addEventListener('change',()=>setOutputArmed(false,true));
 E('artnetRouteSelect').addEventListener('change',()=>{setOutputArmed(false,true);const v=E('artnetRouteSelect').value||'AUTO';E('artnetTarget').value=v;try{localStorage.setItem(TARGET_KEY,v)}catch(e){}status(t().armOff)});
 E('artnetValue').addEventListener('input',()=>{E('artnetValueReadout').textContent=E('artnetValue').value+' / 255'});
 E('artnetPatchDevice').addEventListener('change',()=>{choosePatch();if(E('artnetPatchDevice').value==='')renderVerifiedControls(null)});
 E('artnetDiscover').addEventListener('click',discoverNodes);
 E('artnetDiscoveredNodes').addEventListener('change',()=>{if(E('artnetDiscoveredNodes').value){setOutputArmed(false,true);E('artnetTarget').value=E('artnetDiscoveredNodes').value;status(t().armOff)}});
 E('artnetRefreshPatch').addEventListener('click',()=>{setOutputArmed(false,true);renderPatchDevices();renderMasterControl();renderMasterCctControl();renderMasterRgbControl();renderControlGroups();status(t().armOff)});
 E('artnetSceneFadeSeconds').addEventListener('change',()=>{const seconds=fadeSeconds();E('artnetSceneFadeSeconds').value=String(seconds);try{localStorage.setItem(FADE_KEY,String(seconds))}catch(e){}});
 E('artnetCueAdd').addEventListener('click',addCue);E('artnetCuePrevious').addEventListener('click',previousCue);E('artnetCueGo').addEventListener('click',()=>goCue());E('artnetCueReset').addEventListener('click',resetCueStack);
 E('artnetPanicBlackout').addEventListener('click',globalBlackout);E('artnetPanicRestore').addEventListener('click',restoreBeforeBlackout);
 E('artnetDiagnosticsRefresh').addEventListener('click',requestDiagnostics);
 E('artnetOutputArm').addEventListener('change',()=>setOutputArmed(!!E('artnetOutputArm').checked));
 E('artnetSend').addEventListener('click',sendTest);E('artnetBlackout').addEventListener('click',blackout);E('artnetLiveToggle').addEventListener('change',()=>setLiveEnabled(!!E('artnetLiveToggle').checked));E('artnetSceneSave').addEventListener('click',saveScene);
 translate();setTimeout(requestDiagnostics,250);return true;
}
window.LightingAIArtNetControl={version:'0.26-profile-requirements',refreshPatch:function(){renderPatchDevices();renderMasterControl();renderMasterCctControl();renderMasterRgbControl();renderControlGroups();renderScenes();renderCueStack();},transport:controlTransport,setLive:setLiveEnabled,saveScene:saveScene,fadeScene:fadeToScene,cancelFade:cancelSceneFade,goCue:goCue,resetCues:resetCueStack,globalBlackout:globalBlackout,restoreBlackout:restoreBeforeBlackout,arm:setOutputArmed,isArmed:function(){return outputArmed},saveGroup:saveControlGroup,applyGroup:applyControlGroup,diagnostics:requestDiagnostics,setSacnPriority:applySacnPriority};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopLiveForBackground()});
window.addEventListener('pagehide',stopLiveForBackground);
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>160)clearInterval(timer)},100);
const old=window.setLanguage;if(typeof old==='function'&&!window.__artNetLangHook){window.__artNetLangHook=true;window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
})();