(function(){
'use strict';
var CARD_ID='lightingai-control-dashboard';
var deskPointerActive=false,deskInteractionUntil=0;
function holdDeskInteraction(ms){deskInteractionUntil=Math.max(deskInteractionUntil,Date.now()+Math.max(250,Number(ms)||1200))}
function periodicRender(){if(deskPointerActive||Date.now()<deskInteractionUntil)return;render()}
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
   for(var i=0;i<qty;i++)out.push({selected:e,fixture:f,instanceIndex:i,instanceCount:qty});
 });
 return out;
}
function routeText(f){
 var c=f&&f.control||{}, direct=Array.isArray(c.directLightingAI)?c.directLightingAI:[], wired=Array.isArray(c.wired)?c.wired:[], wireless=Array.isArray(c.wireless)?c.wireless:[], ext=Array.isArray(c.externalInterfaceRequired)?c.externalInterfaceRequired:[];
 var production=null;
 try{if(window.LightingAIControlRouting&&typeof window.LightingAIControlRouting.classify==='function')production=window.LightingAIControlRouting.classify(f)}catch(e){}
 return {direct:direct,wired:wired,wireless:wireless,external:ext,production:production};
}
function dmXModes(f){return Array.isArray(f&&f.dmxModes)?f.dmxModes:[]}
function patchRows(){try{var s=window.LightingAIDmxSnapshot&&window.LightingAIDmxSnapshot();return s&&Array.isArray(s.rows)?s.rows:[]}catch(e){return[]}}
function patchMatchForRow(row){
 var id=row&&row.fixture&&row.fixture.id||'',wanted=Math.max(0,Number(row&&row.instanceIndex)||0),matches=[];
 patchRows().forEach(function(r,index){if(r&&r.fixtureId===id)matches.push({patch:r,index:index})});
 return matches[wanted]||null;
}
function profileForPatch(f,p){
 if(!p)return null;
 var modes=dmXModes(f).filter(function(m){return !!(m&&m.verified===true&&Number(m.channels)>0)}),want=String(p.mode||'').trim(),ch=Number(p.channels)||0,start=Number(p.start)||0;
 var profile=null;
 if(want)profile=modes.find(function(m){return String(m.name||'').trim()===want})||null;
 if(!profile)profile=modes.find(function(m){return Number(m.channels)===ch})||null;
 if(!profile||Number(profile.channels)!==ch||!Number.isInteger(start)||start<1||start+ch-1>512)return null;
 return profile;
}
function controlSummary(profile){var controls=profile&&Array.isArray(profile.controls)?profile.controls:[],keys=controls.map(function(x){return String(x&&x.key||'').toLowerCase()});var out=[];if(keys.indexOf('dimmer')>=0)out.push('DIM');if(keys.indexOf('cct')>=0)out.push('CCT');if(['red','green','blue'].every(function(k){return keys.indexOf(k)>=0}))out.push('RGB');if(keys.indexOf('hue')>=0||keys.indexOf('saturation')>=0)out.push('HSI');return out}
function statusBadge(routes){
 var p=routes&&routes.production;
 if(p&&p.semanticReady===true&&p.route==='native-network')return '<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:#163025;color:#b8f0d1;font-size:11px;font-weight:800">'+(sr()?'ART-NET/sACN + PROFIL OK':'ART-NET/sACN + PROFILE OK')+'</span>';
 if(p&&p.semanticReady===true&&p.route==='gateway')return '<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:#163025;color:#b8f0d1;font-size:11px;font-weight:800">'+(sr()?'STANDARDNA RUTA + PROFIL OK':'STANDARD ROUTE + PROFILE OK')+'</span>';
 if(p&&p.transportReady===true&&p.semanticReady!==true)return '<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:#342e18;color:#f5dd91;font-size:11px;font-weight:800">'+(sr()?'RUTA POSTOJI · PROFIL NIJE VERIFIKOVAN':'ROUTE EXISTS · PROFILE NOT VERIFIED')+'</span>';
 if(p&&p.route==='vendor-wireless')return '<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:#342e18;color:#f5dd91;font-size:11px;font-weight:800">'+(sr()?'VENDOR BEŽIČNO':'VENDOR WIRELESS')+'</span>';
 return '<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:#382124;color:#ffb5b5;font-size:11px;font-weight:800">'+(sr()?'NEMA VERIFIKOVANE RUTE':'NO VERIFIED ROUTE')+'</span>';
}
function fixtureCard(row){
 var f=row.fixture,r=routeText(f),modes=dmXModes(f),baseName=(f.manufacturer||'')+' '+(f.model||f.id||''),name=baseName+(row.instanceCount>1?' #'+(row.instanceIndex+1):''),match=patchMatchForRow(row),patch=match&&match.patch,profile=profileForPatch(f,patch),controls=controlSummary(profile);
 var direct=r.direct.length?r.direct.join(' • '):(sr()?'Nije navedena direktna LightingAI ruta.':'No direct LightingAI route listed.');
 if(r.production&&r.production.route==='gateway'&&!r.direct.length)direct=sr()?'Standardna kontrola preko Art-Net/sACN + DMX/CRMX interfejsa.':'Standard control via Art-Net/sACN + DMX/CRMX interface.';
 if(r.production&&r.production.route==='vendor-wireless'&&!r.direct.length)direct=sr()?'Vlasnički bežični protokol — koristi se samo kroz verifikovan vendor adapter.':'Proprietary wireless protocol — used only through a verified vendor adapter.';
 var ext=r.external.length?'<div class="muted small" style="margin-top:7px"><b>'+(sr()?'Potreban interfejs: ':'Interface required: ')+'</b>'+esc(r.external.join(' • '))+'</div>':'';
 var mode=modes.length?'<div class="muted small" style="margin-top:7px"><b>'+(sr()?'DMX profili: ':'DMX profiles: ')+'</b>'+modes.length+'</div>':'';
 var mapped=patch?(profile?'<div style="margin-top:8px;padding:8px;border-radius:10px;background:#10251d;color:#b8f0d1;font-size:11px"><b>'+(sr()?'DMX PATCH + VERIFIKOVAN PROFIL':'DMX PATCH + VERIFIED PROFILE')+'</b> · U'+Number(patch.universe||1)+' · '+(sr()?'adresa ':'address ')+Number(patch.start||1)+(patch.mode?' · '+esc(patch.mode):'')+(controls.length?' · '+esc(controls.join(' / ')):'')+'</div>':'<div style="margin-top:8px;padding:8px;border-radius:10px;background:#342e18;color:#f5dd91;font-size:11px"><b>'+(sr()?'DMX PATCH POSTOJI, ALI PROFIL NIJE VERIFIKOVAN':'DMX PATCH EXISTS, BUT PROFILE IS NOT VERIFIED')+'</b></div>'):'<div style="margin-top:8px;padding:8px;border-radius:10px;background:#342e18;color:#f5dd91;font-size:11px">'+(sr()?'Nije povezan sa DMX Patch-om.':'Not mapped in DMX Patch.')+'</div>';
 var open=patch&&profile?'<button class="btn secondary control-open-fixture" data-fixture="'+esc(f.id)+'" data-patch-index="'+Number(match.index)+'" type="button" style="width:100%;margin-top:8px">'+(sr()?'OTVORI KONTROLU UREĐAJA':'OPEN FIXTURE CONTROL')+'</button>':'';
 return '<div class="card" style="margin-bottom:10px;border-color:#303842">'+
   '<div style="display:flex;gap:10px;justify-content:space-between;align-items:flex-start"><div><div style="font-weight:900;font-size:16px">'+esc(name)+'</div><div class="muted small">'+esc(f.family||f.type||'')+'</div></div>'+statusBadge(r)+'</div>'+
   '<div style="margin-top:10px;font-size:12px;line-height:1.45"><b>'+(sr()?'LightingAI kontrola: ':'LightingAI control: ')+'</b>'+esc(direct)+'</div>'+
   ext+mode+mapped+open+
   '</div>';
}
function jump(id){var x=E(id);if(x){x.open=true;x.scrollIntoView({behavior:'smooth',block:'start'})}}
function liveStatus(){
 var api=window.LightingAIArtNetControl,armed=!!(api&&typeof api.isArmed==='function'&&api.isArmed()),protocol=E('networkDmxProtocol'),value=protocol?String(protocol.value||'artnet').toUpperCase():'—';
 return {armed:armed,protocol:value};
}
function render(){
 var host=E('controlContent');if(!host)return false;
 var card=E(CARD_ID);
 if(!card){card=document.createElement('div');card.id=CARD_ID;host.insertBefore(card,host.firstChild)}
 var rows=selectedFixtures(), count=rows.length;
 var title=sr()?'IZABRANA RASVETA':'SELECTED FIXTURES';
 var empty=sr()?'Nema izabranih rasvetnih tela. Dodaj ih u Oprema pa se vrati u Kontrolu.':'No selected fixtures. Add them in Equipment, then return to Control.';
 var patched=rows.filter(function(row){return !!patchMatchForRow(row)}).length,verified=rows.filter(function(row){var m=patchMatchForRow(row),p=m&&m.patch;return !!(p&&profileForPatch(row.fixture,p))}).length,live=liveStatus();
 var deskRange=E('controlDeskDimmer'),deskValue=deskRange?Math.max(0,Math.min(100,Math.round(Number(deskRange.value)||0))):100;
 card.innerHTML='<div class="card" style="border-color:#66571f;background:linear-gradient(180deg,#191b20,#13161b);padding:16px">'+
   '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><div style="font-size:21px;font-weight:900;color:#f5c542">'+(sr()?'KONTROLA RASVETE':'LIGHTING CONTROL')+'</div><div class="muted small" style="margin-top:5px">'+(sr()?'Pregled opreme, DMX povezanosti i bezbednog izlaza na jednom mestu.':'Equipment, DMX mapping and safe output status in one place.')+'</div></div><div style="padding:6px 9px;border-radius:999px;background:'+(live.armed?'#10251d':'#24191b')+';color:'+(live.armed?'#b8f0d1':'#ffb5b5')+';font-size:10px;font-weight:900;white-space:nowrap">'+(live.armed?(sr()?'IZLAZ AKTIVAN':'OUTPUT ARMED'):(sr()?'IZLAZ ZAKLJUČAN':'OUTPUT LOCKED'))+'</div></div>'+
   '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px">'+
    '<div style="padding:11px 8px;border:1px solid #30343b;border-radius:11px;text-align:center;background:#101318"><div style="font-size:20px;font-weight:900">'+count+'</div><div class="muted small">'+(sr()?'IZABRANO':'SELECTED')+'</div></div>'+
    '<div style="padding:11px 8px;border:1px solid #30343b;border-radius:11px;text-align:center;background:#101318"><div style="font-size:20px;font-weight:900">'+patched+'</div><div class="muted small">DMX PATCH</div></div>'+
    '<div style="padding:11px 8px;border:1px solid #30343b;border-radius:11px;text-align:center;background:#101318"><div style="font-size:20px;font-weight:900">'+verified+'</div><div class="muted small">'+(sr()?'VERIFIKOVANO':'VERIFIED')+'</div></div>'+
   '</div>'+
   '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px">'+
    '<div style="padding:9px;border:1px solid #30343b;border-radius:10px;background:#0f1115"><div style="font-size:10px;color:#8f96a0;font-weight:800">'+(sr()?'1. OPREMA':'1. FIXTURES')+'</div><div style="margin-top:3px;font-size:12px;font-weight:800">'+(count?(sr()?'SPREMNA ZA PROVERU':'READY TO REVIEW'):(sr()?'NEMA IZBORA':'NONE SELECTED'))+'</div></div>'+
    '<div style="padding:9px;border:1px solid #30343b;border-radius:10px;background:#0f1115"><div style="font-size:10px;color:#8f96a0;font-weight:800">2. DMX</div><div style="margin-top:3px;font-size:12px;font-weight:800">'+(patched?(patched+'/'+count+' '+(sr()?'POVEZANO':'MAPPED')):(sr()?'NIJE POVEZANO':'NOT MAPPED'))+'</div></div>'+
    '<div style="padding:9px;border:1px solid '+(live.armed?'#24543d':'#5a3034')+';border-radius:10px;background:'+(live.armed?'#10251d':'#1a1113')+'"><div style="font-size:10px;color:#8f96a0;font-weight:800">'+(sr()?'3. IZLAZ':'3. OUTPUT')+'</div><div style="margin-top:3px;font-size:12px;font-weight:900;color:'+(live.armed?'#b8f0d1':'#ffb5b5')+'">'+esc(live.protocol)+' · '+(live.armed?(sr()?'AKTIVAN':'ARMED'):(sr()?'ZAKLJUČAN':'LOCKED'))+'</div></div>'+
   '</div>'+
   '<div style="margin-top:14px;padding:12px;border:1px solid #3c4652;border-radius:12px;background:#0d1117">'+
    '<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div style="font-size:12px;font-weight:900;color:#cdd4dd">'+(sr()?'OPERATOR DESK':'OPERATOR DESK')+'</div><div style="font-size:10px;font-weight:900;color:'+(live.armed?'#b8f0d1':'#ffb5b5')+'">'+(live.armed?(sr()?'OUTPUT ARMED':'OUTPUT ARMED'):(sr()?'OUTPUT LOCKED':'OUTPUT LOCKED'))+'</div></div>'+
    '<div style="display:flex;justify-content:space-between;gap:10px;margin-top:12px"><b style="font-size:13px">'+(sr()?'MASTER DIMMER':'MASTER DIMMER')+'</b><span id="controlDeskDimmerValue" class="muted small">'+deskValue+'%</span></div>'+
    '<input id="controlDeskDimmer" type="range" min="0" max="100" step="1" value="'+deskValue+'" style="margin-top:8px;width:100%">'+
    '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:7px;margin-top:9px"><button id="controlDeskApplyMaster" class="btn primary" type="button">'+(sr()?'PRIMENI MASTER':'APPLY MASTER')+'</button><button id="controlDeskArm" class="btn '+(live.armed?'danger':'secondary')+'" type="button">'+(live.armed?(sr()?'ZAKLJUČAJ IZLAZ':'LOCK OUTPUT'):(sr()?'ARM OUTPUT':'ARM OUTPUT'))+'</button></div>'+
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px"><button id="controlDeskPrev" class="btn secondary" type="button">'+(sr()?'PREV':'PREV')+'</button><button id="controlDeskGo" class="btn primary" type="button">GO</button><button id="controlDeskBlackout" class="btn danger" type="button">'+(sr()?'BLACKOUT':'BLACKOUT')+'</button><button id="controlDeskRestore" class="btn secondary" type="button">'+(sr()?'VRATI':'RESTORE')+'</button></div>'+
   '</div>'+
   '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px"><button id="controlJumpFixtures" class="btn secondary" type="button">'+(sr()?'UREĐAJI':'FIXTURES')+'</button><button id="controlJumpGroups" class="btn secondary" type="button">'+(sr()?'GRUPE':'GROUPS')+'</button><button id="controlJumpScenes" class="btn secondary" type="button">'+(sr()?'SCENE':'SCENES')+'</button><button id="controlJumpProtocols" class="btn secondary" type="button">'+(sr()?'RUTING':'ROUTING')+'</button></div>'+
   '<div class="actions" style="margin-top:8px"><button id="controlJumpNetwork" class="btn secondary" type="button">'+(sr()?'NAPREDNA MREŽNA KONTROLA':'ADVANCED NETWORK CONTROL')+'</button></div>'+
   '</div>'+
   '<div style="margin:12px 0 8px;font-size:12px;font-weight:900;color:#c5cad2">'+title+' <span style="color:#7f8791">('+count+')</span></div>'+
   (rows.length?rows.map(fixtureCard).join(''):'<div class="card"><div class="muted small">'+empty+'</div></div>');
 card.onpointerdown=function(){deskPointerActive=true;holdDeskInteraction(5000)};
 card.onpointerup=function(){deskPointerActive=false;holdDeskInteraction(900)};
 card.onpointercancel=function(){deskPointerActive=false;holdDeskInteraction(900)};
 card.onfocusin=function(){holdDeskInteraction(2500)};
 card.onfocusout=function(){holdDeskInteraction(500)};
 var n=E('controlJumpNetwork'),jf=E('controlJumpFixtures'),jg=E('controlJumpGroups'),js=E('controlJumpScenes'),jp=E('controlJumpProtocols');
 var desk=window.LightingAIArtNetControl||{},dr=E('controlDeskDimmer'),dv=E('controlDeskDimmerValue'),da=E('controlDeskApplyMaster'),arm=E('controlDeskArm'),prev=E('controlDeskPrev'),go=E('controlDeskGo'),bo=E('controlDeskBlackout'),restore=E('controlDeskRestore');
 if(dr){
  dr.onpointerdown=function(){deskPointerActive=true;holdDeskInteraction(5000)};
  dr.onpointerup=function(){deskPointerActive=false;holdDeskInteraction(900)};
  dr.onpointercancel=function(){deskPointerActive=false;holdDeskInteraction(900)};
  dr.oninput=function(){holdDeskInteraction(1200);if(dv)dv.textContent=Math.round(Number(dr.value)||0)+'%'};
  dr.onblur=function(){deskPointerActive=false;holdDeskInteraction(350)};
 }
 if(da)da.onclick=function(){if(typeof desk.masterDimmer==='function')desk.masterDimmer(Number(dr&&dr.value)||0)};
 if(arm)arm.onclick=function(){if(typeof desk.arm==='function'){desk.arm(!(typeof desk.isArmed==='function'&&desk.isArmed()));setTimeout(render,250)}};
 if(prev)prev.onclick=function(){if(typeof desk.previousCue==='function')desk.previousCue()};
 if(go)go.onclick=function(){if(typeof desk.goCue==='function')desk.goCue()};
 if(bo)bo.onclick=function(){if(typeof desk.globalBlackout==='function')desk.globalBlackout()};
 if(restore)restore.onclick=function(){if(typeof desk.restoreBlackout==='function')desk.restoreBlackout()};
 if(n)n.onclick=function(){jump('artnetCard')};
 if(jf)jf.onclick=function(){card.scrollIntoView({behavior:'smooth',block:'start'})};
 if(jg)jg.onclick=function(){jump('artnetControlGroups')};
 if(js)js.onclick=function(){jump('artnetScenes')};
 if(jp)jp.onclick=function(){jump('networkDmxBridgeBlock')};
 card.querySelectorAll('.control-open-fixture').forEach(function(btn){btn.onclick=function(){var api=window.LightingAIArtNetControl,index=Number(btn.dataset.patchIndex);if(api&&typeof api.focusPatchIndex==='function'&&Number.isInteger(index)){api.focusPatchIndex(index);return}if(api&&typeof api.focusFixture==='function')api.focusFixture(btn.dataset.fixture);};});
 return true;
}
window.LightingAIControlDashboard={render:render,version:'0.10-operator-desk-interaction-safe'};
var tries=0,timer=setInterval(function(){tries++;if(render()||tries>200)clearInterval(timer)},120);
setInterval(periodicRender,900);
var old=window.setLanguage;
if(typeof old==='function'&&!window.__lightingAIControlDashboardLang){
 window.__lightingAIControlDashboardLang=true;
 window.setLanguage=function(l){old(l);setTimeout(render,0)}
}
})();