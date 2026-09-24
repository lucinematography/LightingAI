(function(){
'use strict';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{
  title:'📶 BLUETOOTH / BLE',
  intro:'Pronađi obližnje BLE uređaje kao osnovu za buduću direktnu kontrolu rasvete. LightingAI ne šalje proizvođačke komande dok njihov protokol nije zvanično verifikovan.',
  scan:'PRONAĐI BLE UREĐAJE',
  scanning:'Tražim BLE uređaje…',
  none:'Nema pronađenih BLE uređaja.',
  found:'Pronađeni BLE uređaji',
  permission:'Bluetooth dozvola nije odobrena.',
  disabled:'Bluetooth je isključen na telefonu.',
  unavailable:'Ovaj uređaj nema podržan BLE skener.',
  cancelled:'BLE pretraga je zaustavljena.',
  error:'BLE pretraga nije uspela.',
  rssi:'SIGNAL',
  services:'SERVISI',
  address:'ADRESA',
  verified:'Direktna kontrola će biti uključena samo za modele sa verifikovanim protokolom. GATT INSPECTION je samo čitanje profila i ne menja stanje lampe.',
  inspect:'GATT INSPECTION',
  inspecting:'Čitam BLE GATT profil…',
  inspectFail:'GATT profil nije pročitan.',
  likelyAstera:'VEROVATNO ASTERA',
  likelyMesh:'BLE MESH UREĐAJ',
  meshProxy:'BLE MESH PROXY',
  fingerprint:'OTISAK OGLASA'
 },
 en:{
  title:'📶 BLUETOOTH / BLE',
  intro:'Discover nearby BLE devices as the foundation for future direct lighting control. LightingAI does not send manufacturer commands until the protocol is officially verified.',
  scan:'DISCOVER BLE DEVICES',
  scanning:'Scanning for BLE devices…',
  none:'No BLE devices found.',
  found:'Discovered BLE devices',
  permission:'Bluetooth permission was not granted.',
  disabled:'Bluetooth is disabled on this phone.',
  unavailable:'This device does not provide a supported BLE scanner.',
  cancelled:'BLE scan stopped.',
  error:'BLE discovery failed.',
  rssi:'SIGNAL',
  services:'SERVICES',
  address:'ADDRESS',
  verified:'Direct control will only be enabled for models with a verified protocol. GATT INSPECTION is read-only and does not change fixture state.',
  inspect:'GATT INSPECTION',
  inspecting:'Reading BLE GATT profile…',
  inspectFail:'GATT profile could not be read.',
  likelyAstera:'LIKELY ASTERA',
  likelyMesh:'BLE MESH DEVICE',
  meshProxy:'BLE MESH PROXY',
  fingerprint:'ADVERTISEMENT FINGERPRINT'
 }
};
const t=()=>TXT[lang()];
let seq=0;

function status(message,ok){
 const el=E('bleStatus');if(!el)return;
 el.textContent=message||'';
 el.style.color=ok===false?'#ffb5b5':ok===true?'#b8f0d1':'#9299a3';
}
function esc(v){
 return String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function transport(){
 const androidReady=!!(window.Android&&typeof Android.bleDiscover==='function');
 const iosHandler=window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.LightingAIControl;
 const iosReady=!!(iosHandler&&typeof iosHandler.postMessage==='function');
 return {
  available:androidReady||iosReady,
  discover:function(request){
   if(androidReady){Android.bleDiscover(request.id,request.timeoutMs||3000);return true}
   if(iosReady){iosHandler.postMessage({action:'bleDiscover',id:request.id,timeoutMs:request.timeoutMs||3000});return true}
   return false;
  },
  inspect:function(request){
   if(androidReady&&typeof Android.bleInspectGatt==='function'){Android.bleInspectGatt(request.id,request.address,request.name||'',request.timeoutMs||8000);return true}
   if(iosReady){iosHandler.postMessage({action:'bleInspectGatt',id:request.id,address:request.address,name:request.name||'',timeoutMs:request.timeoutMs||8000});return true}
   return false;
  }
 };
}
function startScan(){
 const tr=transport();
 if(!tr.available){status(t().unavailable,false);return}
 const id='ble_'+Date.now()+'_'+(++seq);
 E('bleResults').innerHTML='';
 status(t().scanning);
 try{if(!tr.discover({id:id,timeoutMs:3500}))status(t().unavailable,false)}
 catch(e){status(t().error,false)}
}
function errorText(code){
 if(code==='ble_permission_denied')return t().permission;
 if(code==='bluetooth_disabled')return t().disabled;
 if(code==='bluetooth_unavailable'||code==='ble_scanner_unavailable')return t().unavailable;
 if(code==='ble_scan_cancelled')return t().cancelled;
 return t().error+(code?' ('+code+')':'');
}
function hasService(d,shortHex){
 const list=Array.isArray(d&&d.serviceUuids)?d.serviceUuids:[];
 const needle=String(shortHex||'').toLowerCase();
 return list.some(v=>String(v||'').toLowerCase().includes(needle));
}
function deviceTag(d){
 const n=String(d&&d.name||'').toUpperCase();
 if(/^TITAN\b/.test(n)||n.includes('ASTERA'))return t().likelyAstera;
 if(hasService(d,'00001828'))return t().meshProxy;
 if(n.includes('MESH DEVICE'))return t().likelyMesh;
 return '';
}
function inspectDevice(address,name,targetId){
 const tr=transport();
 if(!tr.available||!address){status(t().unavailable,false);return}
 const id='gatt_'+Date.now()+'_'+(++seq);
 const target=E(targetId);
 if(target)target.innerHTML='<div class="muted small">'+esc(t().inspecting)+'</div>';
 window.__lightingAIGattTargets=window.__lightingAIGattTargets||{};
 window.__lightingAIGattTargets[id]=targetId;
 try{if(!tr.inspect({id:id,address:address,name:name||'',timeoutMs:15000})&&target)target.innerHTML='<div class="muted small" style="color:#ffb5b5">'+esc(t().inspectFail)+'</div>'}
 catch(e){if(target)target.innerHTML='<div class="muted small" style="color:#ffb5b5">'+esc(t().inspectFail)+'</div>'}
}
function renderGatt(profile){
 const services=Array.isArray(profile&&profile.services)?profile.services:[];
 if(!services.length)return '<div class="muted small">No exposed GATT services.</div>';
 return services.map(s=>{
  const chars=Array.isArray(s&&s.characteristics)?s.characteristics:[];
  return '<div style="margin-top:7px;padding:7px;border:1px solid #2d333a;border-radius:8px">'+
   '<div class="muted small"><b>'+esc(s&&s.uuid||'')+'</b></div>'+
   chars.map(ch=>'<div class="muted small" style="margin-top:3px">'+esc(ch&&ch.uuid||'')+' · '+esc(Array.isArray(ch&&ch.properties)?ch.properties.join('/'):'')+'</div>').join('')+
  '</div>';
 }).join('');
}
window.LightingAIBleGattInspectionResult=function(id,profile,error){
 const map=window.__lightingAIGattTargets||{};
 const targetId=map[id];delete map[id];
 const target=E(targetId);
 if(!target)return;
 if(error){target.innerHTML='<div class="muted small" style="color:#ffb5b5">'+esc(t().inspectFail)+' '+esc(error)+'</div>';return}
 target.innerHTML=renderGatt(profile||{});
};
function render(devices){
 const box=E('bleResults');if(!box)return;
 const list=Array.isArray(devices)?devices.slice():[];
 list.sort((a,b)=>(Number(b&&b.rssi)||-127)-(Number(a&&a.rssi)||-127));
 if(!list.length){box.innerHTML='<div class="muted small" style="margin-top:8px">'+esc(t().none)+'</div>';return}
 box.innerHTML='<div class="caption" style="margin-top:10px">'+esc(t().found)+' · '+list.length+'</div>'+
  list.map((d,i)=>{
   const name=(d&&d.name)||('BLE '+(i+1));
   const address=(d&&d.address)||'';
   const services=Array.isArray(d&&d.serviceUuids)?d.serviceUuids:[];
   const serviceData=Array.isArray(d&&d.serviceDataUuids)?d.serviceDataUuids:[];
   const manufacturerIds=Array.isArray(d&&d.manufacturerIds)?d.manufacturerIds:[];
   const tag=deviceTag(d);
   const targetId='bleGatt_'+i;
   return '<div style="padding:10px 0;border-top:1px solid #2d333a">'+
    '<div style="display:flex;justify-content:space-between;gap:10px"><b>'+esc(name)+'</b><span class="muted small">'+esc(t().rssi)+' '+Number(d&&d.rssi)+' dBm</span></div>'+
    (tag?'<div class="caption" style="margin-top:3px">'+esc(tag)+'</div>':'')+
    (address?'<div class="muted small">'+esc(t().address)+': '+esc(address)+'</div>':'')+
    '<div class="muted small">'+esc(t().services)+': '+esc(services.length?services.join(', '):'—')+'</div>'+
    ((serviceData.length||manufacturerIds.length)?'<div class="muted small">'+esc(t().fingerprint)+': '+esc((serviceData.length?('SD '+serviceData.join(', ')):'')+(serviceData.length&&manufacturerIds.length?' · ':'')+(manufacturerIds.length?('MFG '+manufacturerIds.join(', ')):''))+'</div>':'')+
    (address&&d&&d.connectable?'<button class="btn secondary ble-gatt-btn" style="margin-top:7px" type="button" data-address="'+esc(address)+'" data-name="'+esc(name)+'" data-target="'+targetId+'">'+esc(t().inspect)+'</button><div id="'+targetId+'"></div>':'')+
   '</div>';
  }).join('');
 box.querySelectorAll('.ble-gatt-btn').forEach(btn=>btn.addEventListener('click',()=>inspectDevice(btn.dataset.address,btn.dataset.name||'',btn.dataset.target)));
}
window.LightingAIBleDiscoveryResult=function(id,devices,error){
 if(error){render([]);status(errorText(error),false);return}
 render(devices);
 status((Array.isArray(devices)&&devices.length)?(t().found+': '+devices.length):t().none,Array.isArray(devices)&&devices.length>0);
};
function translate(){
 if(!E('bleControlCard'))return;
 const x=t();
 E('bleControlTitle').textContent=x.title;
 E('bleControlIntro').textContent=x.intro;
 E('bleScan').textContent=x.scan;
 E('bleVerifiedHint').textContent=x.verified;
}
function install(){
 const page=E('equipment');if(!page||E('bleControlCard'))return false;
 const card=document.createElement('details');
 card.id='bleControlCard';card.className='card';card.style.border='1px solid #31506b';
 card.innerHTML='<summary style="font-weight:900;font-size:20px;cursor:pointer"><span id="bleControlTitle"></span></summary>'+
  '<div style="margin-top:12px"><p id="bleControlIntro" class="muted small"></p>'+
  '<button id="bleScan" class="btn primary" type="button"></button>'+
  '<div id="bleStatus" class="muted small" style="margin-top:8px"></div>'+
  '<div id="bleResults"></div>'+
  '<div id="bleVerifiedHint" class="status warn" style="margin-top:10px"></div></div>';
 const network=E('artnetCard'),dmx=E('dmxCard');
 if(network&&network.parentNode)network.parentNode.insertBefore(card,network.nextSibling);
 else if(dmx&&dmx.parentNode)dmx.parentNode.insertBefore(card,dmx.nextSibling);
 else page.appendChild(card);
 E('bleScan').addEventListener('click',startScan);
 translate();
 return true;
}
window.LightingAIBleControl={version:'0.2-direct-control-foundation',discover:startScan,inspect:inspectDevice};
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>160)clearInterval(timer)},100);
const old=window.setLanguage;
if(typeof old==='function'&&!window.__lightingAIBleLangHook){
 window.__lightingAIBleLangHook=true;
 window.setLanguage=function(l){old(l);setTimeout(translate,0)}
}
})();