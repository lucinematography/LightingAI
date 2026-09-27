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
  locationDisabled:'Za BLE pretragu na ovom Android uređaju uključi Location/GPS servis.',
  alreadyScanning:'BLE pretraga je već u toku.',
  tooFrequent:'Bluetooth je privremeno odbio novo skeniranje jer su pretrage pokretane prečesto. Sačekaj nekoliko sekundi i pokušaj ponovo.',
  resources:'Bluetooth nema dovoljno sistemskih resursa za novo skeniranje. Isključi/uključi Bluetooth i pokušaj ponovo.',
  error:'BLE pretraga nije uspela.',
  rssi:'SIGNAL',
  services:'SERVISI',
  address:'ADRESA',
  inspect:'PROVERI GATT',
  inspecting:'Proveravam BLE servise bez slanja komandi…',
  inspected:'GATT servisi',
  meshProvisioning:'Bluetooth Mesh: NEPROVISIONISAN / provisioning servis',
  meshProxy:'Bluetooth Mesh: PROXY servis detektovan',
  asteraPrivate:'Astera privatni GATT servis detektovan · komande još nisu verifikovane',
  gattError:'GATT provera nije uspela.',
  verified:'Direktna kontrola će biti uključena samo za modele sa verifikovanim zvaničnim protokolom / SDK-om.'
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
  locationDisabled:'Enable Location/GPS service for BLE discovery on this Android device.',
  alreadyScanning:'BLE discovery is already running.',
  tooFrequent:'Bluetooth temporarily rejected a new scan because scans were started too frequently. Wait a few seconds and try again.',
  resources:'Bluetooth has insufficient system resources for a new scan. Toggle Bluetooth off/on and try again.',
  error:'BLE discovery failed.',
  rssi:'SIGNAL',
  services:'SERVICES',
  address:'ADDRESS',
  inspect:'INSPECT GATT',
  inspecting:'Inspecting BLE services without sending commands…',
  inspected:'GATT services',
  meshProvisioning:'Bluetooth Mesh: UNPROVISIONED / provisioning service',
  meshProxy:'Bluetooth Mesh: PROXY service detected',
  asteraPrivate:'Astera private GATT service detected · commands are not verified yet',
  gattError:'GATT inspection failed.',
  verified:'Direct control will only be enabled for fixtures with a verified official protocol / SDK.'
 }
};
const t=()=>TXT[lang()];
let seq=0;
let scanActive=false;
let gattActive=false;
let scanCooldownUntil=0;
let activeScanRequestId='';
let activeGattRequestId='';

function status(message,ok){
 const el=E('bleStatus');if(!el)return;
 el.textContent=message||'';
 el.style.color=ok===false?'#ffb5b5':ok===true?'#b8f0d1':'#9299a3';
}
function esc(v){
 return String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
const BLE_MESH_PROVISIONING='00001827-0000-1000-8000-00805f9b34fb';
const BLE_MESH_PROXY='00001828-0000-1000-8000-00805f9b34fb';
const ASTERA_PRIVATE_SERVICE='0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65';
function normalizedUuid(v){return String(v||'').toLowerCase()}
function diagnosticLabelsFromServices(services){
 const values=(Array.isArray(services)?services:[]).map(s=>normalizedUuid(typeof s==='string'?s:(s&&s.uuid)));
 const labels=[];
 if(values.includes(BLE_MESH_PROVISIONING))labels.push(t().meshProvisioning);
 if(values.includes(BLE_MESH_PROXY))labels.push(t().meshProxy);
 if(values.includes(ASTERA_PRIVATE_SERVICE))labels.push(t().asteraPrivate);
 return labels;
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
  inspectGatt:function(request){
   if(androidReady&&typeof Android.bleInspectGatt==='function'){
    Android.bleInspectGatt(request.id,request.address,request.timeoutMs||8000);return true;
   }
   return false;
  }
 };
}
function setScanBusy(busy){
 scanActive=!!busy;
 const button=E('bleScan');
 if(button)button.disabled=scanActive||Date.now()<scanCooldownUntil;
}
function startScan(){
 const tr=transport();
 if(!tr.available){status(t().unavailable,false);return}
 if(scanActive||gattActive){status(t().alreadyScanning,false);return}
 if(Date.now()<scanCooldownUntil){status(t().tooFrequent,false);return}
 const id='ble_'+Date.now()+'_'+(++seq);
 activeScanRequestId=id;
 E('bleResults').innerHTML='';
 setScanBusy(true);
 status(t().scanning);
 try{
  if(!tr.discover({id:id,timeoutMs:3500})){setScanBusy(false);status(t().unavailable,false)}
 }catch(e){setScanBusy(false);status(t().error,false)}
}
function errorText(code){
 if(code==='ble_permission_denied')return t().permission;
 if(code==='bluetooth_disabled')return t().disabled;
 if(code==='bluetooth_unavailable'||code==='ble_scanner_unavailable')return t().unavailable;
 if(code==='ble_scan_cancelled')return t().cancelled;
 if(code==='ble_location_disabled')return t().locationDisabled;
 if(code==='ble_scan_failed_1')return t().alreadyScanning;
 if(code==='ble_scan_failed_5')return t().resources;
 if(code==='ble_scan_failed_6')return t().tooFrequent;
 return t().error+(code?' ('+code+')':'');
}
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
   return '<div style="padding:10px 0;border-top:1px solid #2d333a">'+
    '<div style="display:flex;justify-content:space-between;gap:10px"><b>'+esc(name)+'</b><span class="muted small">'+esc(t().rssi)+' '+Number(d&&d.rssi)+' dBm</span></div>'+
    (address?'<div class="muted small">'+esc(t().address)+': '+esc(address)+'</div>':'')+
    '<div class="muted small">'+esc(t().services)+': '+esc(services.length?services.join(', '):'—')+'</div>'+
    (diagnosticLabelsFromServices(services).length?'<div class="status warn" style="margin-top:6px">'+esc(diagnosticLabelsFromServices(services).join(' · '))+'</div>':'')+
    (address?'<button class="btn secondary ble-gatt-inspect" data-address="'+esc(address)+'" type="button" style="margin-top:7px">'+esc(t().inspect)+'</button>':'')+
    '<div class="muted small ble-gatt-result" data-address="'+esc(address)+'" style="margin-top:6px"></div>'+
   '</div>';
  }).join('');
 box.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.addEventListener('click',()=>inspectGatt(btn.dataset.address,btn)));
}
function inspectGatt(address,button){
 const tr=transport();
 if(!address||typeof tr.inspectGatt!=='function'){status(t().unavailable,false);return}
 if(scanActive||gattActive){status(t().alreadyScanning,false);return}
 const id='ble_gatt_'+Date.now()+'_'+(++seq);
 activeGattRequestId=id;
 gattActive=true;
 const scanButton=E('bleScan');if(scanButton)scanButton.disabled=true;
 document.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.disabled=true);
 if(button)button.disabled=true;
 const result=document.querySelector('.ble-gatt-result[data-address="'+CSS.escape(address)+'"]');
 if(result)result.textContent=t().inspecting;
 status(t().inspecting);
 try{
  if(!tr.inspectGatt({id:id,address:address,timeoutMs:8000})){
   gattActive=false;
   if(scanButton)scanButton.disabled=false;
   document.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
   status(t().unavailable,false);
  }
 }catch(e){
  gattActive=false;
  if(scanButton)scanButton.disabled=false;
  document.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
  status(t().gattError,false);
 }
}
window.LightingAIBleGattInspectionResult=function(id,payload,error){
 if(String(id||'')!==activeGattRequestId)return;
 activeGattRequestId='';
 gattActive=false;
 const scanButton=E('bleScan');if(scanButton)scanButton.disabled=Date.now()<scanCooldownUntil;
 document.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
 const address=payload&&payload.address?String(payload.address):'';
 const result=address?document.querySelector('.ble-gatt-result[data-address="'+CSS.escape(address)+'"]'):null;
 if(error){
  if(result)result.textContent=t().gattError+' ('+error+')';
  status(t().gattError,false);return;
 }
 const services=payload&&Array.isArray(payload.services)?payload.services:[];
 const labels=diagnosticLabelsFromServices(services);
 if(result)result.textContent=t().inspected+': '+services.map(s=>String(s.uuid||'')+' ['+((s.characteristics||[]).length)+']').join(' · ')+(labels.length?' · '+labels.join(' · '):'');
 status(t().inspected+': '+services.length,services.length>0);
};
window.LightingAIBleDiscoveryResult=function(id,devices,error){
 if(String(id||'')!==activeScanRequestId)return;
 activeScanRequestId='';
 scanCooldownUntil=Date.now()+2000;
 setScanBusy(false);
 const button=E('bleScan');
 if(button)setTimeout(()=>{if(Date.now()>=scanCooldownUntil&&!scanActive)button.disabled=false},2050);
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
function resetBleUiLifecycle(){
 activeScanRequestId='';
 activeGattRequestId='';
 scanActive=false;
 gattActive=false;
 scanCooldownUntil=0;
 const button=E('bleScan');if(button)button.disabled=false;
 document.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
}
window.LightingAIBleLifecyclePause=resetBleUiLifecycle;
window.LightingAIBleLifecycleResume=resetBleUiLifecycle;
window.LightingAIBleControl={version:'0.5-serialized-ble-diagnostics',discover:startScan,inspectGatt:inspectGatt};
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>160)clearInterval(timer)},100);
const old=window.setLanguage;
if(typeof old==='function'&&!window.__lightingAIBleLangHook){
 window.__lightingAIBleLangHook=true;
 window.setLanguage=function(l){old(l);setTimeout(translate,0)}
}
})();