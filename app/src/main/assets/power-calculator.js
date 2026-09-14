(function(){
'use strict';
const LS='lighting_power_calculator_v1';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{title:'🔋 Potrošnja struje',intro:'Računaj opterećenje iz trenutno izabranih rasvetnih tela u katalogu. Količinu možeš podesiti samo za ovaj proračun.',voltage:'NAPON MREŽE (V)',branch:'STRUJNA GRANA (A)',battery:'BATERIJA (Wh)',eff:'EFIKASNOST BATERIJE (%)',total:'UKUPNA SNAGA',current:'STRUJA',limit:'PLANERSKI LIMIT GRANE',circuits:'POTREBNO GRANA',runtime:'PROCENA BATERIJE',fixtures:'Rasvetna tela u proračunu',none:'Izaberi bar jedno rasvetno telo u katalogu Oprema.',unknown:'Bez podatka o potrošnji',ok:'Opterećenje je ispod planerskog limita.',warn:'Opterećenje prelazi planerski limit jedne grane.',note:'Planerski limit koristi 80% nominalne snage grane radi rezerve. Stvarnu instalaciju, zaštitu, kablove i dozvoljeno opterećenje uvek proveri na lokaciji sa kvalifikovanim električarem.',hours:'h',mins:'min',qty:'kom'},
 en:{title:'🔋 Power Load',intro:'Calculate load from fixtures currently selected in the Equipment catalog. Quantities here affect this calculation only.',voltage:'MAINS VOLTAGE (V)',branch:'CIRCUIT (A)',battery:'BATTERY (Wh)',eff:'BATTERY EFFICIENCY (%)',total:'TOTAL POWER',current:'CURRENT',limit:'PLANNING CIRCUIT LIMIT',circuits:'CIRCUITS NEEDED',runtime:'BATTERY ESTIMATE',fixtures:'Fixtures in calculation',none:'Select at least one fixture in the Equipment catalog.',unknown:'Missing power data',ok:'Load is below the planning limit.',warn:'Load exceeds the planning limit of one circuit.',note:'The planning limit uses 80% of nominal circuit power as headroom. Always verify the real electrical installation, protection, cabling and permitted load on location with a qualified electrician.',hours:'h',mins:'min',qty:'qty'}
};
function read(){try{return JSON.parse(localStorage.getItem(LS))||{}}catch(e){return{}}}
function write(v){localStorage.setItem(LS,JSON.stringify(v))}
let state=Object.assign({voltage:230,branch:16,batteryWh:1000,efficiency:85,qty:{}},read());
function num(id,fallback){const v=Number(E(id)?.value);return Number.isFinite(v)&&v>0?v:fallback}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function selectedFixtures(){
 const fixtures=Array.isArray(window.catalogFixtures)?window.catalogFixtures:[];
 const selected=Array.isArray(window.equipment)?window.equipment:[];
 return selected.map(e=>{const f=fixtures.find(x=>x.id===e.id||x.id===e.fixtureId);return f?{f,e}:null}).filter(Boolean);
}
function fmtW(v){return v>=1000?(v/1000).toFixed(v>=10000?1:2)+' kW':Math.round(v)+' W'}
function runtimeText(hours,t){if(!Number.isFinite(hours)||hours<=0)return '—';const h=Math.floor(hours),m=Math.round((hours-h)*60);return h>0?h+' '+t.hours+' '+m+' '+t.mins:m+' '+t.mins}
function renderRows(){
 const box=E('powerFixtureRows');if(!box)return;
 const t=TXT[lang()],items=selectedFixtures();
 if(!items.length){box.innerHTML='<div class="power-empty">'+t.none+'</div>';return}
 box.innerHTML=items.map(({f,e})=>{const q=Math.max(0,Math.round(Number(state.qty[f.id]??e.qty??1)));const p=Number(f.powerDrawW);const meta=Number.isFinite(p)?fmtW(p)+' / '+t.qty:'⚠ '+t.unknown;return '<div class="power-row"><div><b>'+esc((f.manufacturer||'')+' '+(f.model||f.id))+'</b><small>'+meta+'</small></div><input class="power-qty" data-power-id="'+esc(f.id)+'" type="number" min="0" max="99" step="1" value="'+q+'"></div>'}).join('');
}
function calculate(){
 if(!E('powerCalculatorCard'))return;
 const t=TXT[lang()];
 state.voltage=num('powerVoltage',230);state.branch=num('powerBranch',16);state.batteryWh=num('powerBattery',1000);state.efficiency=Math.min(100,num('powerEfficiency',85));
 let total=0,unknown=0;
 selectedFixtures().forEach(({f,e})=>{const q=Math.max(0,Math.round(Number(state.qty[f.id]??e.qty??1)));const p=Number(f.powerDrawW);if(Number.isFinite(p)&&p>=0)total+=p*q;else if(q>0)unknown+=q});
 const amps=state.voltage>0?total/state.voltage:0;
 const nominal=state.voltage*state.branch;
 const planning=nominal*0.8;
 const circuits=total>0&&planning>0?Math.ceil(total/planning):0;
 const runtime=total>0?(state.batteryWh*(state.efficiency/100))/total:NaN;
 E('powerTotal').textContent=fmtW(total);E('powerCurrent').textContent=amps.toFixed(2)+' A';E('powerLimit').textContent=fmtW(planning)+' (80%)';E('powerCircuits').textContent=String(circuits||'—');E('powerRuntime').textContent=runtimeText(runtime,t);
 const s=E('powerStatus');s.textContent=total===0?t.none:(total<=planning?t.ok:t.warn);s.className='power-status '+(total>planning?'warn':'ok');
 E('powerUnknown').textContent=unknown?('⚠ '+t.unknown+': '+unknown):'';
 write(state);
}
function translate(){const t=TXT[lang()];if(!E('powerCalculatorCard'))return;E('powerTitle').textContent=t.title;E('powerIntro').textContent=t.intro;E('powerVoltageLabel').textContent=t.voltage;E('powerBranchLabel').textContent=t.branch;E('powerBatteryLabel').textContent=t.battery;E('powerEfficiencyLabel').textContent=t.eff;E('powerTotalLabel').textContent=t.total;E('powerCurrentLabel').textContent=t.current;E('powerLimitLabel').textContent=t.limit;E('powerCircuitsLabel').textContent=t.circuits;E('powerRuntimeLabel').textContent=t.runtime;E('powerFixturesTitle').textContent=t.fixtures;E('powerNote').textContent=t.note;renderRows();calculate()}
function init(){
 const page=E('equipment');if(!page||E('powerCalculatorCard'))return false;
 const style=document.createElement('style');style.textContent='.power-card{margin-bottom:14px}.power-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.power-metric{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px}.power-metric small{display:block;color:#9299a3;font-size:11px;margin-bottom:5px}.power-metric b{font-size:22px;color:#f5c542}.power-row{display:grid;grid-template-columns:1fr 84px;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #292d33}.power-row small{display:block;color:#9299a3;margin-top:3px}.power-qty{padding:9px;text-align:center}.power-status{margin:10px 0;padding:10px;border-radius:10px;font-size:12px}.power-status.ok{background:#163025;color:#b8f0d1}.power-status.warn{background:#382124;color:#ffb5b5}.power-empty,.power-note{color:#9299a3;font-size:12px;line-height:1.45}.power-unknown{color:#f5dd91;font-size:12px;margin-top:8px}@media(max-width:520px){.power-grid{grid-template-columns:1fr 1fr}}';document.head.appendChild(style);
 const card=document.createElement('div');card.id='powerCalculatorCard';card.className='card power-card';card.innerHTML='<h2 id="powerTitle" style="margin-top:0"></h2><p id="powerIntro" class="muted small"></p><div class="row"><div><label id="powerVoltageLabel" class="caption"></label><input id="powerVoltage" type="number" min="100" max="260" step="1" value="'+state.voltage+'"></div><div><label id="powerBranchLabel" class="caption"></label><input id="powerBranch" type="number" min="1" max="63" step="1" value="'+state.branch+'"></div></div><div class="row"><div><label id="powerBatteryLabel" class="caption"></label><input id="powerBattery" type="number" min="1" step="10" value="'+state.batteryWh+'"></div><div><label id="powerEfficiencyLabel" class="caption"></label><input id="powerEfficiency" type="number" min="1" max="100" step="1" value="'+state.efficiency+'"></div></div><div class="power-grid"><div class="power-metric"><small id="powerTotalLabel"></small><b id="powerTotal">—</b></div><div class="power-metric"><small id="powerCurrentLabel"></small><b id="powerCurrent">—</b></div><div class="power-metric"><small id="powerLimitLabel"></small><b id="powerLimit">—</b></div><div class="power-metric"><small id="powerCircuitsLabel"></small><b id="powerCircuits">—</b></div><div class="power-metric" style="grid-column:1/-1"><small id="powerRuntimeLabel"></small><b id="powerRuntime">—</b></div></div><div id="powerStatus" class="power-status"></div><div id="powerUnknown" class="power-unknown"></div><h3 id="powerFixturesTitle" style="margin:18px 0 6px"></h3><div id="powerFixtureRows"></div><p id="powerNote" class="power-note"></p>';
 const title=page.querySelector('h1');if(title&&title.nextSibling)page.insertBefore(card,title.nextSibling);else page.appendChild(card);
 ['powerVoltage','powerBranch','powerBattery','powerEfficiency'].forEach(id=>E(id).addEventListener('input',calculate));
 E('powerFixtureRows').addEventListener('input',ev=>{const el=ev.target.closest('[data-power-id]');if(!el)return;state.qty[el.dataset.powerId]=Math.max(0,Math.round(Number(el.value)||0));calculate()});
 const oldRender=window.renderEquipment;if(typeof oldRender==='function'){window.renderEquipment=function(){oldRender.apply(this,arguments);setTimeout(()=>{renderRows();calculate()},0)}}
 const oldLang=window.setLanguage;if(typeof oldLang==='function'){window.setLanguage=function(l){oldLang(l);setTimeout(translate,0)}}
 translate();let tries=0;const refresh=setInterval(()=>{tries++;renderRows();calculate();if((window.catalogFixtures||[]).length||tries>40)clearInterval(refresh)},250);return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();