(function(){
'use strict';
const KEY='lighting_dmx_patch_v1';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{copy:'KOPIRAJ PATCH',save:'SAČUVAJ CSV',copied:'DMX patch je kopiran.',saved:'Izaberi mesto za čuvanje DMX CSV fajla.',copyFail:'Kopiranje nije uspelo.',empty:'Nema DMX uređaja.',devices:'uređaja',universes:'univerzuma',warnings:'upozorenja',ok:'bez grešaka',missing:'UNESI KANALE',overlap:'PREKLAPANJE',overflow:'PREKO 512',dmx:'DMX PATCH'},
 en:{copy:'COPY PATCH',save:'SAVE CSV',copied:'DMX patch copied.',saved:'Choose where to save the DMX CSV file.',copyFail:'Copy failed.',empty:'No DMX devices.',devices:'devices',universes:'universes',warnings:'warnings',ok:'no errors',missing:'ENTER CHANNELS',overlap:'OVERLAP',overflow:'OVER 512',dmx:'DMX PATCH'}
};
const t=()=>TXT[lang()];
function read(){try{const v=JSON.parse(localStorage.getItem(KEY));return v&&Array.isArray(v.rows)?v.rows:[]}catch(e){return[]}}
function integerOrNull(value){const n=Number(value);return Number.isFinite(n)&&Number.isInteger(n)?n:null}
function endAddr(r){const c=integerOrNull(r&&r.channels),s=integerOrNull(r&&r.start);return c!=null&&c>0&&s!=null?s+c-1:null}
function validate(rows){
 const map=new Map(),flags={};
 rows.forEach((r,index)=>{
  const key=r&&r.id!=null?String(r.id):'row_'+index;
  flags[key]=[];
  const c=integerOrNull(r&&r.channels),u=integerOrNull(r&&r.universe),s=integerOrNull(r&&r.start);
  if(u==null||u<1||u>999)flags[key].push('invalid-universe');
  if(s==null||s<1||s>512)flags[key].push('invalid-start');
  if(c==null||c<0||c>512)flags[key].push('invalid-channels');
  if(c===0)flags[key].push('missing');
  if(flags[key].length||!(c>0))return;
  const end=s+c-1;
  if(end>512){flags[key].push('overflow');return}
  for(let ch=s;ch<=end;ch++){
   const slot=u+':'+ch;
   if(map.has(slot)){flags[key].push('overlap');flags[map.get(slot)].push('overlap')}
   else map.set(slot,key);
  }
 });
 Object.keys(flags).forEach(k=>flags[k]=[...new Set(flags[k])]);
 return flags;
}
function snapshot(){
 const rows=read(),flags=validate(rows);
 const items=rows.map((r,index)=>{
  const key=r&&r.id!=null?String(r.id):'row_'+index;
  const universe=integerOrNull(r&&r.universe),start=integerOrNull(r&&r.start),channels=integerOrNull(r&&r.channels);
  const end=channels!=null&&channels>0&&start!=null?start+channels-1:null;
  return {index:index+1,fixtureId:r&&r.fixtureId||null,name:String(r&&r.name||''),mode:String(r&&r.mode||''),universe,start,channels,end,flags:flags[key]||[]};
 });
 const universes=[...new Set(items.filter(r=>r.flags.length===0&&Number.isInteger(r.universe)&&r.universe>=1).map(r=>r.universe))].sort((a,b)=>a-b);
 const warningCount=items.filter(r=>r.flags.length).length;
 return {schema:'lightingai-dmx-patch-v1',generatedAt:new Date().toISOString(),deviceCount:items.length,universeCount:universes.length,universes,warningCount,rows:items};
}
window.LightingAIDmxSnapshot=snapshot;
function flagText(flags){const x=t();return flags.map(f=>f==='overlap'?x.overlap:f==='overflow'?x.overflow:f==='missing'?x.missing:f==='invalid-universe'?x.invalidUniverse:f==='invalid-start'?x.invalidStart:f==='invalid-channels'?x.invalidChannels:f).join(' + ')||'OK'}
function textReport(){const s=snapshot(),x=t(),lines=['LightingAI — '+x.dmx,''];if(!s.rows.length){lines.push(x.empty);return lines.join('\n')}s.rows.forEach(r=>lines.push('U'+r.universe+' · '+r.start+'-'+(r.end==null?'—':r.end)+' · '+(r.channels||'—')+' ch · '+(r.name||'—')+(r.mode?' · '+r.mode:'')+' · '+flagText(r.flags)));lines.push('',s.deviceCount+' '+x.devices+' · '+s.universeCount+' '+x.universes+' · '+(s.warningCount?s.warningCount+' '+x.warnings:x.ok));return lines.join('\n')}
function csvEscape(v){const s=String(v==null?'':v);return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}
function csvReport(){const s=snapshot(),lines=[['Universe','Start','End','Channels','Device','DMX Mode','Status'].join(',')];s.rows.forEach(r=>lines.push([r.universe,r.start,r.end==null?'':r.end,r.channels||'',r.name,r.mode,flagText(r.flags)].map(csvEscape).join(',')));return '\ufeff'+lines.join('\r\n')}
function copyFallback(value){const ta=document.createElement('textarea');ta.value=value;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();return ok}
function message(value){const el=E('dmxMessage');if(!el)return;el.textContent=value;setTimeout(()=>{if(el.textContent===value)el.textContent=''},2400)}
async function copyPatch(){const value=textReport();let ok=false;try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(value);ok=true}}catch(e){}if(!ok)ok=copyFallback(value);message(ok?t().copied:t().copyFail)}
function download(name,value,type){if(window.Android&&typeof Android.saveText==='function'){try{Android.saveText(name,value);message(t().saved);return}catch(e){}}try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([value],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);message(t().saved)}catch(e){message(t().copyFail)}}
function saveCsv(){download('LightingAI_DMX_Patch.csv',csvReport(),'text/csv;charset=utf-8')}
function updateShotSetup(){const box=E('shotSetupPreview');if(!box)return;let tile=E('shotSetupDmxTile');if(!tile){tile=document.createElement('div');tile.id='shotSetupDmxTile';tile.innerHTML='<small>DMX</small><b>—</b>';box.appendChild(tile)}const s=snapshot(),b=tile.querySelector('b');if(!b)return;b.textContent=s.rows.length?(s.deviceCount+' / U'+(s.universeCount||1)+(s.warningCount?' · ⚠ '+s.warningCount:'')):'—';b.style.color=s.warningCount?'#ffb5b5':'#f5c542'}
function translate(){const x=t();if(E('dmxCopyPatch'))E('dmxCopyPatch').textContent=x.copy;if(E('dmxSaveCsv'))E('dmxSaveCsv').textContent=x.save;updateShotSetup()}
function install(){const card=E('dmxCard');if(!card)return false;if(!E('dmxCopyPatch')){const actions=card.querySelector('.actions');if(actions){const copy=document.createElement('button');copy.id='dmxCopyPatch';copy.className='btn secondary';copy.type='button';copy.addEventListener('click',copyPatch);actions.appendChild(copy);const save=document.createElement('button');save.id='dmxSaveCsv';save.className='btn secondary';save.type='button';save.addEventListener('click',saveCsv);actions.appendChild(save)}}translate();return true}
let tries=0;const boot=setInterval(()=>{tries++;if(install()||tries>160)clearInterval(boot)},100);
setInterval(()=>{install();updateShotSetup()},1500);
const old=window.setLanguage;if(typeof old==='function'&&!window.__dmxExportLangHook){window.__dmxExportLangHook=true;window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
})();
