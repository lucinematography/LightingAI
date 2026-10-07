(function(){
'use strict';
var CARD_ID='lightingai-control-dashboard';
function E(id){return document.getElementById(id)}
function sr(){return (window.currentLang||'sr')!=='en'}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c})}
function fixtures(){return Array.isArray(window.catalogFixtures)?window.catalogFixtures:[]}
function selectedFixtures(){
 var chosen=Array.isArray(window.equipment)?window.equipment:[],all=fixtures(),out=[];
 chosen.forEach(function(e){
  var f=all.find(function(x){return x&&x.id===(e.fixtureId||e.id)});
  if(!f)return;
  var qty=Math.max(1,Math.round(Number(e.qty)||1));
  for(var i=0;i<qty;i++)out.push({fixture:f,index:i,count:qty});
 });
 return out;
}
function stateFor(f){
 try{
  var api=window.LightingAIControlSystemDrivers;
  var r=api&&typeof api.resolve==='function'?api.resolve(f):null;
  var vendors=r&&Array.isArray(r.vendorDrivers)?r.vendorDrivers:[];
  var bluetooth=vendors.some(function(d){return d&&d.transport==='bluetooth'});
  var wifi=vendors.some(function(d){return d&&d.transport==='wifi'});
  var ready=vendors.some(function(d){return d&&d.status==='production'&&d.production===true});
  var verifiedCount=vendors.filter(function(d){return d&&d.transportVerified===true}).length;
  var allTransportVerified=vendors.length>0&&verifiedCount===vendors.length;
  var someTransportVerified=verifiedCount>0&&verifiedCount<vendors.length;
  var assisted=vendors.filter(function(d){return d&&d.requiresExternalInterface});
  return {bluetooth:bluetooth,wifi:wifi,ready:ready,allTransportVerified:allTransportVerified,someTransportVerified:someTransportVerified,assisted:assisted};
 }catch(e){return {bluetooth:false,wifi:false,ready:false,allTransportVerified:false,someTransportVerified:false,assisted:[]}}
}
function transportBadge(label,on,color){
 return '<span style="padding:4px 7px;border-radius:999px;border:1px solid '+(on?color:'#353a42')+';background:'+(on?'#151a20':'#111318')+';color:'+(on?color:'#707780')+';font-size:10px;font-weight:900">'+esc(label)+'</span>';
}
function fixtureCard(row){
 var f=row.fixture,s=stateFor(f),name=(f.manufacturer||'')+' '+(f.model||f.id||'')+(row.count>1?' #'+(row.index+1):'');
 var status=s.ready?(sr()?'VERIFIKOVAN DRIVER':'VERIFIED DRIVER'):(s.allTransportVerified?(sr()?'SVI PRIKAZANI TRANSPORTI POTVRĐENI · DRIVER ČEKA VERIFIKACIJU':'ALL LISTED TRANSPORTS VERIFIED · DRIVER AWAITS VERIFICATION'):(s.someTransportVerified?(sr()?'DEO TRANSPORTA POTVRĐEN · DRIVER ČEKA VERIFIKACIJU':'PARTIAL TRANSPORT VERIFICATION · DRIVER AWAITS VERIFICATION'):((s.bluetooth||s.wifi)?(sr()?'TRANSPORT KANDIDAT · DRIVER ČEKA VERIFIKACIJU':'TRANSPORT CANDIDATE · DRIVER AWAITS VERIFICATION'):(sr()?'NEMA BT/WI-FI PROFILA':'NO BT/WI-FI PROFILE'))));
 var assistedText=s.assisted.length?(sr()?'POTREBAN DODATNI INTERFEJS: ':'EXTERNAL INTERFACE REQUIRED: ')+s.assisted.map(function(d){return (d.externalInterfaceRequired||[]).join(', ')}).filter(Boolean).join(' · '):'';
 return '<div class="card" style="margin-bottom:9px;border-color:#303842">'+
  '<div style="font-weight:900">'+esc(name)+'</div><div class="muted small">'+esc(f.family||f.type||'')+'</div>'+
  '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:9px">'+transportBadge('BLUETOOTH / BLE',s.bluetooth,'#75bfff')+transportBadge('WI-FI',s.wifi,'#9ee7b0')+'</div>'+
  '<div class="muted small" style="margin-top:8px">'+esc(status)+'</div>'+
  (assistedText?'<div class="status warn" style="margin-top:8px;margin-bottom:0">'+esc(assistedText)+'</div>':'')+
  '</div>';
}
function jumpBle(){
 var x=E('bleControlCard');
 if(x){x.open=true;if(x.scrollIntoView)x.scrollIntoView({behavior:'smooth',block:'start'});}
}
function render(){
 var host=E('controlContent');if(!host)return false;
 var card=E(CARD_ID);
 if(!card){card=document.createElement('div');card.id=CARD_ID;host.appendChild(card)}
 var rows=selectedFixtures();
 var wifiCount=rows.filter(function(r){return stateFor(r.fixture).wifi}).length;
 var bluetoothCount=rows.filter(function(r){return stateFor(r.fixture).bluetooth}).length;
 card.innerHTML='<div class="card" style="border-color:#31506b;background:linear-gradient(180deg,#111820,#101318);padding:16px">'+
  '<div style="font-size:21px;font-weight:900;color:#f5c542">'+(sr()?'KONTROLA RASVETE':'LIGHTING CONTROL')+'</div>'+
  '<div class="muted small" style="margin-top:6px">'+(sr()?'Bluetooth/BLE i direktni vendor Wi-Fi su primarni bežični putevi za podržanu rasvetu iz kataloga.':'Bluetooth/BLE and direct vendor Wi-Fi are the primary wireless paths for supported catalog fixtures.')+'</div>'+
  '<button id="controlOpenBluetooth" class="btn primary" type="button" style="width:100%;margin-top:12px">'+(sr()?'PRONAĐI BLUETOOTH / BLE RASVETU':'DISCOVER BLUETOOTH / BLE FIXTURES')+'</button>'+
  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px"><div class="status" style="margin:0;background:#13202b;color:#acd8f7"><b>BLUETOOTH / BLE</b><br>'+(sr()?'Izabrani kandidati: ':'Selected candidates: ')+bluetoothCount+'</div><div class="status" style="margin:0;background:#14251a;color:#b9efc5"><b>WI-FI</b><br>'+(sr()?'Izabrani kandidati: ':'Selected candidates: ')+wifiCount+'</div></div>'+
  '<div class="muted small" style="margin-top:10px">'+(sr()?'Wi-Fi se ne skenira generički: svaki proizvođač zahteva posebno verifikovan discovery/session driver. Dok taj driver nije potvrđen, Wi-Fi kontrola ostaje zaključana. Ostali transporti nisu deo ovog brzog CONTROL puta.':'Wi-Fi is not scanned generically: each manufacturer requires its own separately verified discovery/session driver. Until that driver is verified, Wi-Fi control stays locked. Other transports are not part of this fast CONTROL path.')+'</div>'+
  '</div>'+
  '<div style="margin:12px 0 8px;font-size:12px;font-weight:900;color:#c5cad2">'+(sr()?'IZABRANA RASVETA':'SELECTED FIXTURES')+' <span style="color:#7f8791">('+rows.length+')</span></div>'+
  (rows.length?rows.map(fixtureCard).join(''):'<div class="card"><div class="muted small">'+(sr()?'Nema izabrane rasvete. Dodaj je u Oprema pa se vrati u Kontrolu.':'No fixtures selected. Add them in Equipment, then return to Control.')+'</div></div>');
 var b=E('controlOpenBluetooth');
 if(b)b.onclick=jumpBle;
 return true;
}
window.LightingAIControlDashboard={render:render,version:'0.30-vendor-wireless-control'};
var tries=0,timer=setInterval(function(){tries++;if(render()||tries>200)clearInterval(timer)},120);
setInterval(render,1200);
var old=window.setLanguage;
if(typeof old==='function'&&!window.__lightingAIControlDashboardLang){
 window.__lightingAIControlDashboardLang=true;
 window.setLanguage=function(l){old(l);setTimeout(render,0)}
}
})();