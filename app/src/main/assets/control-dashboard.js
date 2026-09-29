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
function vendorState(f){
 try{
  var api=window.LightingAIControlSystemDrivers;
  var r=api&&typeof api.resolve==='function'?api.resolve(f):null;
  var vendors=r&&Array.isArray(r.vendorDrivers)?r.vendorDrivers:[];
  if(!vendors.length)return {label:sr()?'NEMA DIREKTNOG BLUETOOTH PROFILA':'NO DIRECT BLUETOOTH PROFILE',ready:false};
  var production=vendors.some(function(d){return d&&d.status==='production'});
  return {label:production?(sr()?'BLUETOOTH SPREMAN':'BLUETOOTH READY'):(sr()?'BLUETOOTH OBAVEZAN · NIJE VERIFIKOVAN':'BLUETOOTH REQUIRED · NOT VERIFIED'),ready:production};
 }catch(e){return {label:sr()?'BLUETOOTH STATUS NEPOZNAT':'BLUETOOTH STATUS UNKNOWN',ready:false}}
}
function fixtureCard(row){
 var f=row.fixture,s=vendorState(f),name=(f.manufacturer||'')+' '+(f.model||f.id||'')+(row.count>1?' #'+(row.index+1):'');
 return '<div class="card" style="margin-bottom:9px;border-color:#303842">'+
  '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><div style="font-weight:900">'+esc(name)+'</div><div class="muted small">'+esc(f.family||f.type||'')+'</div></div>'+
  '<span style="padding:4px 7px;border-radius:999px;background:'+(s.ready?'#163025':'#342e18')+';color:'+(s.ready?'#b8f0d1':'#f5dd91')+';font-size:10px;font-weight:900">'+esc(s.label)+'</span></div>'+
  '</div>';
}
function jumpBle(){
 var x=E('bleControlCard');
 if(x){x.open=true;if(x.scrollIntoView)x.scrollIntoView({behavior:'smooth',block:'start'});}
}
async function loadAdvanced(){
 var btn=E('controlLoadAdvanced');
 if(btn)btn.disabled=true;
 try{
  var ok=typeof window.LightingAIAdvancedControlLoad==='function'&&await window.LightingAIAdvancedControlLoad();
  if(!ok&&btn)btn.disabled=false;
 }catch(e){if(btn)btn.disabled=false}
}
function render(){
 var host=E('controlContent');if(!host)return false;
 var card=E(CARD_ID);
 if(!card){card=document.createElement('div');card.id=CARD_ID;host.appendChild(card)}
 var rows=selectedFixtures();
 card.innerHTML='<div class="card" style="border-color:#31506b;background:linear-gradient(180deg,#111820,#101318);padding:16px">'+
  '<div style="font-size:21px;font-weight:900;color:#f5c542">'+(sr()?'KONTROLA RASVETE':'LIGHTING CONTROL')+'</div>'+
  '<div class="muted small" style="margin-top:6px">'+(sr()?'Bluetooth je glavni put za brzu kontrolu na setu. Bez DMX kablova i bez obaveznog Art-Net/sACN podešavanja.':'Bluetooth is the primary path for fast on-set control. No required DMX cabling or Art-Net/sACN setup.')+'</div>'+
  '<button id="controlOpenBluetooth" class="btn primary" type="button" style="width:100%;margin-top:12px">'+(sr()?'PRONAĐI I POVEŽI RASVETU':'DISCOVER & CONNECT FIXTURES')+'</button>'+
  '<details style="margin-top:10px"><summary class="muted small" style="cursor:pointer">'+(sr()?'Napredna mrežna/DMX kontrola':'Advanced network/DMX control')+'</summary>'+
   '<div class="muted small" style="margin-top:7px">'+(sr()?'Učitava se samo kada je izričito zatražiš i ne utiče na Bluetooth kontrolu.':'Loaded only when explicitly requested and does not gate Bluetooth control.')+'</div>'+
   '<button id="controlLoadAdvanced" class="btn secondary" type="button" style="width:100%;margin-top:8px">'+(sr()?'UČITAJ NAPREDNU KONTROLU':'LOAD ADVANCED CONTROL')+'</button>'+
  '</details></div>'+
  '<div style="margin:12px 0 8px;font-size:12px;font-weight:900;color:#c5cad2">'+(sr()?'IZABRANA RASVETA':'SELECTED FIXTURES')+' <span style="color:#7f8791">('+rows.length+')</span></div>'+
  (rows.length?rows.map(fixtureCard).join(''):'<div class="card"><div class="muted small">'+(sr()?'Nema izabrane rasvete. Dodaj je u Oprema pa se vrati u Kontrolu.':'No fixtures selected. Add them in Equipment, then return to Control.')+'</div></div>');
 var b=E('controlOpenBluetooth'),a=E('controlLoadAdvanced');
 if(b)b.onclick=jumpBle;
 if(a)a.onclick=loadAdvanced;
 return true;
}
window.LightingAIControlDashboard={render:render,version:'0.19-bluetooth-primary-no-dmx-gate'};
var tries=0,timer=setInterval(function(){tries++;if(render()||tries>200)clearInterval(timer)},120);
setInterval(render,1200);
var old=window.setLanguage;
if(typeof old==='function'&&!window.__lightingAIControlDashboardLang){
 window.__lightingAIControlDashboardLang=true;
 window.setLanguage=function(l){old(l);setTimeout(render,0)}
}
})();