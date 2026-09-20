(function(){
'use strict';
var CARD_ID='lightingai-control-dashboard';
function E(id){return document.getElementById(id)}
function sr(){return (window.currentLang||'sr')!=='en'}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c})}
function fixtures(){return Array.isArray(window.catalogFixtures)?window.catalogFixtures:[]}
function selectedFixtures(){
 var chosen=Array.isArray(window.equipment)?window.equipment:[];
 var all=fixtures();
 return chosen.map(function(e){
   var f=all.find(function(x){return x&&x.id===e.id});
   return f?{selected:e,fixture:f}:null;
 }).filter(Boolean);
}
function routeText(f){
 var c=f&&f.control||{}, direct=Array.isArray(c.directLightingAI)?c.directLightingAI:[], wired=Array.isArray(c.wired)?c.wired:[], wireless=Array.isArray(c.wireless)?c.wireless:[], ext=Array.isArray(c.externalInterfaceRequired)?c.externalInterfaceRequired:[];
 return {direct:direct,wired:wired,wireless:wireless,external:ext};
}
function dmXModes(f){return Array.isArray(f&&f.dmxModes)?f.dmxModes:[]}
function patchRows(){try{var s=window.LightingAIDmxSnapshot&&window.LightingAIDmxSnapshot();return s&&Array.isArray(s.rows)?s.rows:[]}catch(e){return[]}}
function patchForFixture(f){var id=f&&f.id||'';return patchRows().find(function(r){return r&&r.fixtureId===id})||null}
function profileForPatch(f,p){if(!p)return null;var modes=dmXModes(f),want=String(p.mode||'').trim();if(want){var exact=modes.find(function(m){return m&&String(m.name||'').trim()===want});if(exact)return exact}var ch=Number(p.channels)||0;return modes.find(function(m){return m&&Number(m.channels)===ch})||null}
function controlSummary(profile){var controls=profile&&Array.isArray(profile.controls)?profile.controls:[],keys=controls.map(function(x){return String(x&&x.key||'').toLowerCase()});var out=[];if(keys.indexOf('dimmer')>=0)out.push('DIM');if(keys.indexOf('cct')>=0)out.push('CCT');if(['red','green','blue'].every(function(k){return keys.indexOf(k)>=0}))out.push('RGB');if(keys.indexOf('hue')>=0||keys.indexOf('saturation')>=0)out.push('HSI');return out}
function statusBadge(routes){
 if(routes.direct.length)return '<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:#163025;color:#b8f0d1;font-size:11px;font-weight:800">'+(sr()?'DIREKTNA RUTA':'DIRECT ROUTE')+'</span>';
 if(routes.wired.length||routes.wireless.length)return '<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:#342e18;color:#f5dd91;font-size:11px;font-weight:800">'+(sr()?'PREKO INTERFEJSA':'VIA INTERFACE')+'</span>';
 return '<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:#382124;color:#ffb5b5;font-size:11px;font-weight:800">'+(sr()?'NEMA VERIFIKOVANE RUTE':'NO VERIFIED ROUTE')+'</span>';
}
function fixtureCard(row){
 var f=row.fixture,r=routeText(f),modes=dmXModes(f),name=(f.manufacturer||'')+' '+(f.model||f.id||''),patch=patchForFixture(f),profile=profileForPatch(f,patch),controls=controlSummary(profile);
 var direct=r.direct.length?r.direct.join(' • '):(sr()?'Nije navedena direktna LightingAI ruta.':'No direct LightingAI route listed.');
 var ext=r.external.length?'<div class="muted small" style="margin-top:7px"><b>'+(sr()?'Potreban interfejs: ':'Interface required: ')+'</b>'+esc(r.external.join(' • '))+'</div>':'';
 var mode=modes.length?'<div class="muted small" style="margin-top:7px"><b>'+(sr()?'DMX profili: ':'DMX profiles: ')+'</b>'+modes.length+'</div>':'';
 var mapped=patch?'<div style="margin-top:8px;padding:8px;border-radius:10px;background:#10251d;color:#b8f0d1;font-size:11px"><b>'+(sr()?'DMX PATCH POVEZAN':'DMX PATCH MAPPED')+'</b> · U'+Number(patch.universe||1)+' · '+(sr()?'adresa ':'address ')+Number(patch.start||1)+(patch.mode?' · '+esc(patch.mode):'')+(controls.length?' · '+esc(controls.join(' / ')):'')+'</div>':'<div style="margin-top:8px;padding:8px;border-radius:10px;background:#342e18;color:#f5dd91;font-size:11px">'+(sr()?'Nije povezan sa DMX Patch-om.':'Not mapped in DMX Patch.')+'</div>';
 var open=patch?'<button class="btn secondary control-open-fixture" data-fixture="'+esc(f.id)+'" type="button" style="width:100%;margin-top:8px">'+(sr()?'OTVORI KONTROLU UREĐAJA':'OPEN FIXTURE CONTROL')+'</button>':'';
 return '<div class="card" style="margin-bottom:10px;border-color:#303842">'+
   '<div style="display:flex;gap:10px;justify-content:space-between;align-items:flex-start"><div><div style="font-weight:900;font-size:16px">'+esc(name)+'</div><div class="muted small">'+esc(f.family||f.type||'')+'</div></div>'+statusBadge(r)+'</div>'+
   '<div style="margin-top:10px;font-size:12px;line-height:1.45"><b>'+(sr()?'LightingAI kontrola: ':'LightingAI control: ')+'</b>'+esc(direct)+'</div>'+
   ext+mode+mapped+open+
   '</div>';
}
function jump(id){var x=E(id);if(x){x.open=true;x.scrollIntoView({behavior:'smooth',block:'start'})}}
function render(){
 var host=E('controlContent');if(!host)return false;
 var card=E(CARD_ID);
 if(!card){card=document.createElement('div');card.id=CARD_ID;host.insertBefore(card,host.firstChild)}
 var rows=selectedFixtures(), count=rows.length;
 var title=sr()?'IZABRANA RASVETA':'SELECTED FIXTURES';
 var empty=sr()?'Nema izabranih rasvetnih tela. Dodaj ih u Oprema pa se vrati u Kontrolu.':'No selected fixtures. Add them in Equipment, then return to Control.';
 var patched=rows.filter(function(row){return !!patchForFixture(row.fixture)}).length,verified=rows.filter(function(row){var p=patchForFixture(row.fixture);return !!(p&&profileForPatch(row.fixture,p))}).length;
 card.innerHTML='<div class="card" style="border-color:#66571f;background:linear-gradient(180deg,#191b20,#13161b)">'+
   '<div style="font-size:20px;font-weight:900;color:#f5c542">'+title+' <span style="font-size:13px;color:#9299a3">('+count+')</span></div>'+
   '<div class="muted small" style="margin-top:6px">'+(sr()?'Ovaj ekran koristi stvarno izabranu opremu iz kataloga i prikazuje samo verifikovane kontrolne puteve.':'This screen uses the actual selected catalog equipment and shows only verified control routes.')+'</div>'+
   '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px"><div style="padding:8px;border:1px solid #30343b;border-radius:10px;text-align:center"><b>'+count+'</b><div class="muted small">'+(sr()?'Izabrano':'Selected')+'</div></div><div style="padding:8px;border:1px solid #30343b;border-radius:10px;text-align:center"><b>'+patched+'</b><div class="muted small">DMX Patch</div></div><div style="padding:8px;border:1px solid #30343b;border-radius:10px;text-align:center"><b>'+verified+'</b><div class="muted small">'+(sr()?'Verifikovano':'Verified')+'</div></div></div>'+
   '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:12px"><button id="controlJumpFixtures" class="btn secondary" type="button">'+(sr()?'UREĐAJI':'FIXTURES')+'</button><button id="controlJumpGroups" class="btn secondary" type="button">'+(sr()?'GRUPE':'GROUPS')+'</button><button id="controlJumpScenes" class="btn secondary" type="button">'+(sr()?'SCENE':'SCENES')+'</button><button id="controlJumpProtocols" class="btn secondary" type="button">'+(sr()?'PROTOKOLI':'PROTOCOLS')+'</button></div>'+
   '<div class="actions" style="margin-top:8px"><button id="controlJumpNetwork" class="btn primary" type="button">'+(sr()?'MREŽNA KONTROLA':'NETWORK CONTROL')+'</button><button id="controlJumpBle" class="btn secondary" type="button">BLE</button></div>'+
   '</div>'+
   (rows.length?rows.map(fixtureCard).join(''):'<div class="card"><div class="muted small">'+empty+'</div></div>');
 var n=E('controlJumpNetwork'),b=E('controlJumpBle'),jf=E('controlJumpFixtures'),jg=E('controlJumpGroups'),js=E('controlJumpScenes'),jp=E('controlJumpProtocols');
 if(n)n.onclick=function(){jump('artnetCard')};
 if(b)b.onclick=function(){jump('bleControlCard')};
 if(jf)jf.onclick=function(){card.scrollIntoView({behavior:'smooth',block:'start'})};
 if(jg)jg.onclick=function(){jump('artnetControlGroups')};
 if(js)js.onclick=function(){jump('artnetScenes')};
 if(jp)jp.onclick=function(){jump('networkDmxBridgeBlock')};
 card.querySelectorAll('.control-open-fixture').forEach(function(btn){btn.onclick=function(){var api=window.LightingAIArtNetControl;if(api&&typeof api.focusFixture==='function')api.focusFixture(btn.dataset.fixture);};});
 return true;
}
window.LightingAIControlDashboard={render:render,version:'0.4-control-sections'};
var tries=0,timer=setInterval(function(){tries++;if(render()||tries>200)clearInterval(timer)},120);
setInterval(render,900);
var old=window.setLanguage;
if(typeof old==='function'&&!window.__lightingAIControlDashboardLang){
 window.__lightingAIControlDashboardLang=true;
 window.setLanguage=function(l){old(l);setTimeout(render,0)}
}
})();