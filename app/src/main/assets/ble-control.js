(function(){
'use strict';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{
  title:'📶 BLUETOOTH / BLE',
  intro:'Pronađi obližnju rasvetu i poveži je direktno preko Bluetootha. Ovo je primarni LightingAI CONTROL put za brz rad na setu.',
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
  bondAstera:'POVEŽI ASTERA BTB',
  bondingAstera:'Uparujem Astera BTB preko Android Bluetooth sloja…',
  bondedAstera:'Astera BTB uparivanje je uspelo.',
  bondAsteraError:'Astera BTB uparivanje nije uspelo.',
  bondAsteraPairing:'Android traži potvrdu Bluetooth uparivanja.',
  bondRequired:'Astera BTB mora prvo uspešno da se upari.',
  classicInspecting:'Proveravam Bluetooth Classic/SDP profile…',
  classicResult:'Bluetooth Classic/SDP',
  classicError:'Bluetooth Classic/SDP provera nije uspela.',
  inspecting:'Proveravam BLE servise bez slanja komandi…',
  inspected:'GATT servisi',
  meshProvisioning:'Bluetooth Mesh: NEPROVISIONISAN / provisioning servis',
  meshProxy:'Bluetooth Mesh: PROXY servis detektovan',
  gattError:'GATT provera nije uspela.',
  verified:'Direktna kontrola će biti uključena samo za modele sa verifikovanim zvaničnim protokolom / SDK-om.'
 },
 en:{
  title:'📶 BLUETOOTH / BLE',
  intro:'Discover nearby fixtures and connect directly over Bluetooth. This is the primary LightingAI CONTROL path for fast on-set work.',
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
  bondAstera:'PAIR ASTERA BTB',
  bondingAstera:'Pairing Astera BTB through the Android Bluetooth layer…',
  bondedAstera:'Astera BTB pairing succeeded.',
  bondAsteraError:'Astera BTB pairing failed.',
  bondAsteraPairing:'Android is requesting Bluetooth pairing confirmation.',
  bondRequired:'Astera BTB must be bonded successfully first.',
  classicInspecting:'Inspecting Bluetooth Classic/SDP profiles…',
  classicResult:'Bluetooth Classic/SDP',
  classicError:'Bluetooth Classic/SDP inspection failed.',
  inspecting:'Inspecting BLE services without sending commands…',
  inspected:'GATT services',
  meshProvisioning:'Bluetooth Mesh: UNPROVISIONED / provisioning service',
  meshProxy:'Bluetooth Mesh: PROXY service detected',
  gattError:'GATT inspection failed.',
  verified:'Direct control will only be enabled for fixtures with a verified official protocol / SDK.'
 }
};
const t=()=>TXT[lang()];
let seq=0;
let scanActive=false;
let gattActive=false;
let bondActive=false;
let classicActive=false;
let scanCooldownUntil=0;
let activeScanRequestId='';
let activeGattRequestId='';
let activeGattAddress='';
let activeBondRequestId='';
let activeBondAddress='';
let activeClassicRequestId='';
let activeClassicAddress='';
let scanWatchdogTimer=null;
let gattWatchdogTimer=null;

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
function normalizedUuid(v){return String(v||'').toLowerCase()}
function diagnosticLabelsFromServices(services){
 const values=(Array.isArray(services)?services:[]).map(s=>normalizedUuid(typeof s==='string'?s:(s&&s.uuid)));
 const labels=[];
 if(values.includes(BLE_MESH_PROVISIONING))labels.push(t().meshProvisioning);
 if(values.includes(BLE_MESH_PROXY))labels.push(t().meshProxy);
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
  },
  inspectAsteraClassic:function(request){
   if(androidReady&&typeof Android.asteraBtbInspectClassic==='function'){
    Android.asteraBtbInspectClassic(request.id,request.address,request.timeoutMs||10000);return true;
   }
   return false;
  },
  inspectAsteraGatt:function(request){
   if(androidReady&&typeof Android.asteraBtbInspectGatt==='function'){
    Android.asteraBtbInspectGatt(request.id,request.address,request.timeoutMs||12000);return true;
   }
   return false;
  },
  bondAstera:function(request){
   if(androidReady&&typeof Android.asteraBtbBond==='function'){
    Android.asteraBtbBond(request.id,request.address,request.timeoutMs||30000);return true;
   }
   return false;
  }
 };
}
function clearScanWatchdog(){
 if(scanWatchdogTimer){clearTimeout(scanWatchdogTimer);scanWatchdogTimer=null}
}
function clearGattWatchdog(){
 if(gattWatchdogTimer){clearTimeout(gattWatchdogTimer);gattWatchdogTimer=null}
}
function setScanBusy(busy){
 scanActive=!!busy;
 const button=E('bleScan');
 if(button)button.disabled=scanActive||Date.now()<scanCooldownUntil;
}
function startScan(){
 const tr=transport();
 if(!tr.available){status(t().unavailable,false);return}
 if(scanActive||gattActive||bondActive||classicActive){status(t().alreadyScanning,false);return}
 if(Date.now()<scanCooldownUntil){status(t().tooFrequent,false);return}
 const id='ble_'+Date.now()+'_'+(++seq);
 activeScanRequestId=id;
 E('bleResults').innerHTML='';
 setScanBusy(true);
 status(t().scanning);
 clearScanWatchdog();
 scanWatchdogTimer=setTimeout(()=>{
  if(activeScanRequestId!==id||!scanActive)return;
  activeScanRequestId='';
  setScanBusy(false);
  status(t().error+' (ble_scan_no_callback_timeout)',false);
 },12000);
 try{
  if(!tr.discover({id:id,timeoutMs:3500})){clearScanWatchdog();setScanBusy(false);status(t().unavailable,false)}
 }catch(e){clearScanWatchdog();setScanBusy(false);status(t().error,false)}
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
function vendorForDevice(name){
 const s=String(name||'').toLowerCase();
 if(/titan|astera|helios|hyperion|hydra|nyx|pixelbrick|ax[0-9]|quik|luna|pluto|leo/.test(s))return 'ASTERA';
 if(/aputure|infinibar|amaran|sidus|storm|nova|ls\s?\d/.test(s))return 'APUTURE';
 if(/godox|knowled|mg\d|m\d{3}|ld\d|tl\d/.test(s))return 'GODOX';
 if(/aladdin|fabric-lite|bi-flex|mosaic/.test(s))return 'ALADDIN';
 if(/nanlite|nanlink|pavo|forza|evoke|fs-/.test(s))return 'NANLITE';
 if(/arri|skypanel|orbiter|lico/.test(s))return 'ARRI';
 return lang()==='sr'?'DRUGO':'OTHER';
}
function signalLabel(rssi){
 const v=Number(rssi);
 if(v>=-60)return lang()==='sr'?'ODLIČAN':'EXCELLENT';
 if(v>=-72)return lang()==='sr'?'DOBAR':'GOOD';
 if(v>=-85)return lang()==='sr'?'SLAB':'WEAK';
 return lang()==='sr'?'VRLO SLAB':'VERY WEAK';
}
function isAsteraName(name){return /^(TITAN\s+\d+|.*ASTERA.*)$/i.test(String(name||''))}
function render(devices){
 const box=E('bleResults');if(!box)return;
 const list=Array.isArray(devices)?devices.slice():[];
 list.sort((a,b)=>(Number(b&&b.rssi)||-127)-(Number(a&&a.rssi)||-127));
 if(!list.length){box.innerHTML='<div class="muted small" style="margin-top:12px">'+esc(t().none)+'</div>';return}
 box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px"><b>'+esc(t().found)+'</b><span class="muted small">'+list.length+'</span></div>'+
  list.map((d,i)=>{
   const name=(d&&d.name)||('BLE '+(i+1));
   const address=(d&&d.address)||'';
   const services=Array.isArray(d&&d.serviceUuids)?d.serviceUuids:[];
   const vendor=vendorForDevice(name);
   const astera=isAsteraName(name);
   return '<div class="card" style="margin-top:9px;padding:12px;border-color:#31506b;background:#10161c">'+
    '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">'+
     '<div><div style="font-size:10px;font-weight:900;color:#9db8ca">'+esc(vendor)+'</div><div style="font-size:16px;font-weight:900;margin-top:2px">'+esc(name)+'</div></div>'+
     '<div style="text-align:right"><div style="font-size:11px;font-weight:900">'+esc(signalLabel(d&&d.rssi))+'</div><div class="muted small">'+Number(d&&d.rssi)+' dBm</div></div>'+
    '</div>'+
    (address?'<button class="btn primary ble-gatt-inspect" data-address="'+esc(address)+'" data-astera="'+(astera?'1':'0')+'" type="button" style="width:100%;margin-top:10px">'+esc(astera?(lang()==='sr'?'POVEŽI ASTERA':'CONNECT ASTERA'):(lang()==='sr'?'POVEŽI':'CONNECT'))+'</button>':'')+
    renderQuickControlShell(address,vendor,name)+
    '<details style="margin-top:8px"><summary class="muted small" style="cursor:pointer">'+(lang()==='sr'?'DIJAGNOSTIKA':'DIAGNOSTICS')+'</summary>'+
     (address?'<div class="muted small" style="margin-top:6px">'+esc(t().address)+': '+esc(address)+'</div>':'')+
     '<div class="muted small">'+esc(t().services)+': '+esc(services.length?services.join(', '):'—')+'</div>'+
     '<div class="muted small" style="word-break:break-all">RAW: '+esc(d&&d.rawAdvertisementHex||'—')+'</div>'+
     '<div class="muted small">FLAGS: '+esc(d&&d.advertiseFlags!=null?d.advertiseFlags:'—')+' · TX: '+esc(d&&d.txPowerLevel!=null?d.txPowerLevel:'—')+' · CONNECTABLE: '+esc(d&&d.connectable)+'</div>'+
     '<div class="muted small" style="word-break:break-all">MFG: '+esc(JSON.stringify(d&&d.manufacturerData||{}))+'</div>'+
     '<div class="muted small" style="word-break:break-all">SERVICE DATA: '+esc(JSON.stringify(d&&d.serviceData||{}))+'</div>'+
     (diagnosticLabelsFromServices(services).length?'<div class="status warn" style="margin-top:6px">'+esc(diagnosticLabelsFromServices(services).join(' · '))+'</div>':'')+
     '<div class="muted small ble-gatt-result" data-address="'+esc(address)+'" style="margin-top:6px"></div>'+
    '</details>'+
   '</div>';
  }).join('');
 box.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.addEventListener('click',()=>inspectGatt(btn.dataset.address,btn)));
}

function bondAstera(address,button){
 const tr=transport();
 if(!address||typeof tr.bondAstera!=='function'){status(t().unavailable,false);return}
 if(scanActive||gattActive||bondActive||classicActive){status(t().alreadyScanning,false);return}
 const id='astera_bond_'+Date.now()+'_'+(++seq);
 activeBondRequestId=id;
 activeBondAddress=String(address||'');
 bondActive=true;
 const scanButton=E('bleScan');if(scanButton)scanButton.disabled=true;
 document.querySelectorAll('.ble-astera-bond,.ble-gatt-inspect').forEach(btn=>btn.disabled=true);
 if(button)button.disabled=true;
 const result=document.querySelector('.ble-gatt-result[data-address="'+CSS.escape(address)+'"]');
 if(result)result.textContent=t().bondingAstera;
 status(t().bondingAstera);
 try{
  if(!tr.bondAstera({id:id,address:address,timeoutMs:30000})){
   bondActive=false;
   activeBondRequestId='';
   activeBondAddress='';
   if(scanButton)scanButton.disabled=false;
   document.querySelectorAll('.ble-astera-bond,.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
   status(t().unavailable,false);
  }
 }catch(e){
  bondActive=false;
  activeBondRequestId='';
  activeBondAddress='';
  if(scanButton)scanButton.disabled=false;
  document.querySelectorAll('.ble-astera-bond,.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
  status(t().bondAsteraError,false);
 }
}
window.LightingAIAsteraBtbBondProgress=function(id,payload){
 if(String(id||'')!==activeBondRequestId)return;
 const variant=payload&&Number.isInteger(payload.pairingVariant)?payload.pairingVariant:-1;
 const key=payload&&Number.isInteger(payload.pairingKey)&&payload.pairingKey>=0?String(payload.pairingKey):'';
 const detail=variant>=0?' · variant '+variant+(key?' · key '+key:''):'';
 const message=t().bondAsteraPairing+detail;
 const result=activeBondAddress?document.querySelector('.ble-gatt-result[data-address="'+CSS.escape(activeBondAddress)+'"]'):null;
 if(result)result.textContent=message;
 status(message);
};
window.LightingAIAsteraBtbBondResult=function(id,payload,error){
 if(String(id||'')!==activeBondRequestId)return;
 activeBondRequestId='';
 bondActive=false;
 const address=payload&&payload.address?String(payload.address):activeBondAddress;
 activeBondAddress='';
 const scanButton=E('bleScan');if(scanButton)scanButton.disabled=Date.now()<scanCooldownUntil;
 document.querySelectorAll('.ble-astera-bond,.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
 const result=address?document.querySelector('.ble-gatt-result[data-address="'+CSS.escape(address)+'"]'):null;
 if(error){
  const message=t().bondAsteraError+(error?' ('+error+')':'');
  if(result)result.textContent=message;
  status(message,false);
  return;
 }
 const message=t().bondedAstera;
 if(result)result.textContent=message;
 status(message,true);
 if(address)setTimeout(()=>inspectAsteraClassic(address),250);
};


function inspectAsteraClassic(address){
 const tr=transport();
 if(!address||typeof tr.inspectAsteraClassic!=='function')return;
 if(classicActive)return;
 const id='astera_classic_'+Date.now()+'_'+(++seq);
 activeClassicRequestId=id;
 activeClassicAddress=String(address||'');
 classicActive=true;
 const result=document.querySelector('.ble-gatt-result[data-address="'+CSS.escape(address)+'"]');
 if(result)result.textContent=t().classicInspecting;
 try{
  if(!tr.inspectAsteraClassic({id:id,address:address,timeoutMs:10000})){
   classicActive=false;
   activeClassicRequestId='';
   activeClassicAddress='';
  }
 }catch(e){
  classicActive=false;
  activeClassicRequestId='';
  activeClassicAddress='';
 }
}
window.LightingAIAsteraBtbClassicInspectionResult=function(id,payload,error){
 if(String(id||'')!==activeClassicRequestId)return;
 activeClassicRequestId='';
 classicActive=false;
 const address=payload&&payload.address?String(payload.address):activeClassicAddress;
 activeClassicAddress='';
 const result=address?document.querySelector('.ble-gatt-result[data-address="'+CSS.escape(address)+'"]'):null;
 if(error){
  const message=t().classicError+(error?' ('+error+')':'');
  if(result)result.textContent=message;
  status(message,false);
  if(address)setTimeout(()=>inspectGatt(address,null,true),250);
  return;
 }
 const uuids=payload&&Array.isArray(payload.uuids)?payload.uuids:[];
 const spp=!!(payload&&payload.sppPresent);
 const type=payload&&Number.isFinite(Number(payload.deviceType))?Number(payload.deviceType):0;
 const message=t().classicResult+': '+uuids.length+' UUID · SPP '+(spp?'YES':'NO')+' · type '+type;
 if(result)result.textContent=message;
 status(message,true);
 if(address)setTimeout(()=>inspectGatt(address,null,true),250);
};

function gattFlags(ch){
 const out=[];
 if(ch&&ch.readable)out.push('READ');
 if(ch&&ch.writable)out.push('WRITE');
 if(ch&&ch.writeNoResponse)out.push('WRITE-NR');
 if(ch&&ch.notifiable)out.push('NOTIFY');
 if(ch&&ch.indicatable)out.push('INDICATE');
 return out.length?out.join('/'):'—';
}
function renderGattProfile(payload){
 const services=payload&&Array.isArray(payload.services)?payload.services:[];
 const reads=payload&&Array.isArray(payload.readValues)?payload.readValues:[];
 const incomplete=!!(payload&&payload.diagnosticIncomplete);
 const warning=payload&&payload.diagnosticWarning?String(payload.diagnosticWarning):'';
 let html='<div style="margin-top:6px"><b>'+esc(t().inspected)+': '+services.length+'</b>';
 if(incomplete)html+='<div class="status warn" style="margin-top:6px">'+esc((lang()==='sr'?'PARCIJALNI REZULTAT':'PARTIAL RESULT')+(warning?' · '+warning:''))+'</div>';
 html+=services.map(s=>{
  const chars=Array.isArray(s&&s.characteristics)?s.characteristics:[];
  return '<div style="margin-top:8px;padding-top:7px;border-top:1px solid #2d333a">'+
   '<div><b>SERVICE</b> <code>'+esc(s&&s.uuid||'')+'</code></div>'+
   chars.map(ch=>'<div class="muted small" style="margin-top:4px"><code>'+esc(ch&&ch.uuid||'')+'</code> · '+esc(gattFlags(ch))+'</div>').join('')+
   '</div>';
 }).join('');
 if(reads.length){
  html+='<div style="margin-top:9px;padding-top:7px;border-top:1px solid #2d333a"><b>'+(lang()==='sr'?'PROČITANE VREDNOSTI':'READ VALUES')+'</b>'+
   reads.map(x=>'<div class="muted small" style="margin-top:4px"><code>'+esc(x&&x.uuid||'')+'</code> · status '+esc(x&&x.status)+' · '+esc(x&&x.hex||'')+(x&&x.text?' · '+esc(x.text):'')+(x&&x.error?' · '+esc(x.error):'')+'</div>').join('')+
   '</div>';
 }
 html+='</div>';
 return html;
}
function renderQuickControlShell(address,vendor,name){
 const id='ble-quick-'+String(address||'').replace(/[^a-z0-9]/gi,'');
 return '<div id="'+esc(id)+'" class="ble-quick-control" style="margin-top:10px;padding:10px;border:1px solid #2d3f4f;border-radius:12px;background:#0d1217">'+
  '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">'+
   '<div><div style="font-size:10px;font-weight:900;color:#9db8ca">'+esc(vendor)+'</div><b>'+esc(name)+'</b></div>'+
   '<span class="muted small">'+(lang()==='sr'?'ČEKA VERIFIKOVAN DRIVER':'WAITING FOR VERIFIED DRIVER')+'</span>'+
  '</div>'+
  '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px">'+
   ['DIM','CCT',lang()==='sr'?'BOJA':'COLOR','FX'].map(x=>'<button class="btn secondary" type="button" disabled style="padding:9px 4px;opacity:.55">'+esc(x)+'</button>').join('')+
  '</div>'+
 '</div>';
}
function inspectGatt(address,button,forceAstera){
 const tr=transport();
 const astera=forceAstera===true||!!(button&&button.dataset&&button.dataset.astera==='1');
 const inspect=astera?tr.inspectAsteraGatt:tr.inspectGatt;
 if(!address||typeof inspect!=='function'){status(t().unavailable,false);return}
 if(scanActive||gattActive||bondActive||classicActive){status(t().alreadyScanning,false);return}
 const id='ble_gatt_'+Date.now()+'_'+(++seq);
 const nativeTimeoutMs=astera?12000:8000;
 const watchdogTimeoutMs=nativeTimeoutMs+5000;
 activeGattRequestId=id;
 activeGattAddress=String(address||'');
 gattActive=true;
 const scanButton=E('bleScan');if(scanButton)scanButton.disabled=true;
 document.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.disabled=true);
 if(button)button.disabled=true;
 const result=document.querySelector('.ble-gatt-result[data-address="'+CSS.escape(address)+'"]');
 if(result)result.textContent=t().inspecting;
 status(t().inspecting);
 clearGattWatchdog();
 gattWatchdogTimer=setTimeout(()=>{
  if(activeGattRequestId!==id||!gattActive)return;
  activeGattRequestId='';
  gattActive=false;
  const timedOutAddress=activeGattAddress;
  activeGattAddress='';
  const scanButton=E('bleScan');if(scanButton)scanButton.disabled=Date.now()<scanCooldownUntil;
  document.querySelectorAll('.ble-astera-bond,.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
  const timedOutResult=timedOutAddress?document.querySelector('.ble-gatt-result[data-address="'+CSS.escape(timedOutAddress)+'"]'):null;
  const message=t().gattError+' (ble_gatt_no_callback_timeout)';
  if(timedOutResult)timedOutResult.textContent=message;
  status(message,false);
 },watchdogTimeoutMs);
 try{
  if(!inspect({id:id,address:address,timeoutMs:nativeTimeoutMs})){
   clearGattWatchdog();
   gattActive=false;
   if(scanButton)scanButton.disabled=false;
   document.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
   status(t().unavailable,false);
  }
 }catch(e){
  clearGattWatchdog();
  gattActive=false;
  if(scanButton)scanButton.disabled=false;
  document.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
  status(t().gattError,false);
 }
}
window.LightingAIBleGattInspectionResult=function(id,payload,error){
 if(String(id||'')!==activeGattRequestId)return;
 clearGattWatchdog();
 activeGattRequestId='';
 gattActive=false;
 const scanButton=E('bleScan');if(scanButton)scanButton.disabled=Date.now()<scanCooldownUntil;
 document.querySelectorAll('.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
 const address=payload&&payload.address?String(payload.address):activeGattAddress;
 const result=address?document.querySelector('.ble-gatt-result[data-address="'+CSS.escape(address)+'"]'):null;
 activeGattAddress='';
 if(error){
  const message=(error==='astera_bond_required'?t().bondRequired:t().gattError)+(error?' ('+error+')':'');
  if(result)result.textContent=message;
  status(message,false);return;
 }
 const services=payload&&Array.isArray(payload.services)?payload.services:[];
 const labels=diagnosticLabelsFromServices(services);
 if(result){
  result.innerHTML=renderGattProfile(payload)+(labels.length?'<div class="status warn" style="margin-top:6px">'+esc(labels.join(' · '))+'</div>':'');
 }
 status(t().inspected+': '+services.length,services.length>0);
};
window.LightingAIBleDiscoveryResult=function(id,devices,error){
 if(String(id||'')!==activeScanRequestId)return;
 clearScanWatchdog();
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
 const page=E('controlContent')||E('control');if(!page||E('bleControlCard'))return false;
 const card=document.createElement('details');
 card.id='bleControlCard';card.className='card';card.open=true;card.style.border='1px solid #31506b';card.style.background='linear-gradient(180deg,#111820,#0e1318)';
 card.innerHTML='<summary style="font-weight:900;font-size:20px;cursor:pointer"><span id="bleControlTitle"></span></summary>'+
  '<div style="margin-top:12px"><p id="bleControlIntro" class="muted small"></p>'+
  '<button id="bleScan" class="btn primary" type="button" style="width:100%;min-height:52px;font-size:15px;font-weight:900"></button>'+
  '<div id="bleStatus" class="muted small" style="margin-top:8px"></div>'+
  '<div id="bleResults"></div>'+
  '<div id="bleVerifiedHint" class="status warn" style="margin-top:10px"></div></div>';
 if(page.firstChild)page.insertBefore(card,page.firstChild);else page.appendChild(card);
 E('bleScan').addEventListener('click',startScan);
 translate();
 return true;
}
function resetBleUiLifecycle(){
 const hadTransient=scanActive||gattActive||bondActive||classicActive;
 clearScanWatchdog();
 clearGattWatchdog();
 activeScanRequestId='';
 activeGattRequestId='';
 activeGattAddress='';
 activeBondRequestId='';
 activeBondAddress='';
 activeClassicRequestId='';
 activeClassicAddress='';
 scanActive=false;
 gattActive=false;
 bondActive=false;
 classicActive=false;
 scanCooldownUntil=0;
 const button=E('bleScan');if(button)button.disabled=false;
 document.querySelectorAll('.ble-astera-bond,.ble-gatt-inspect').forEach(btn=>btn.disabled=false);
 if(hadTransient){
  status('');
  document.querySelectorAll('.ble-gatt-result').forEach(el=>{
   if([TXT.sr.inspecting,TXT.en.inspecting,TXT.sr.bondingAstera,TXT.en.bondingAstera,TXT.sr.bondAsteraPairing,TXT.en.bondAsteraPairing].some(v=>el.textContent&&el.textContent.indexOf(v)===0))el.textContent='';
  });
 }
}
window.LightingAIBleLifecyclePause=resetBleUiLifecycle;
window.LightingAIBleLifecycleResume=resetBleUiLifecycle;
window.LightingAIBleControl={version:'0.11-vendor-advertisement-fingerprint',diagnosticsRevision:'astera-btb-visible-profile-v9',discover:startScan,bondAstera:bondAstera,inspectGatt:inspectGatt};
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>160)clearInterval(timer)},100);
const old=window.setLanguage;
if(typeof old==='function'&&!window.__lightingAIBleLangHook){
 window.__lightingAIBleLangHook=true;
 window.setLanguage=function(l){old(l);setTimeout(translate,0)}
}
})();