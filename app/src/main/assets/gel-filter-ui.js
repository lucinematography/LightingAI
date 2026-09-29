(function(){
var ROOT_ID='gelFilterFolder', EQ_KEY='lighting_equipment_v1';
var activeGroup='', query='', folderOpen=false;
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c;});}
function sr(){try{return (localStorage.getItem('lighting_language_v1')||'sr')!=='en';}catch(e){return true;}}
function catalog(){var c=window.LightingAIGelCatalog;return c&&Array.isArray(c.filters)?c.filters:[];}
function equipment(){return Array.isArray(window.equipment)?window.equipment:[];}
function persist(){try{localStorage.setItem(EQ_KEY,JSON.stringify(equipment()));}catch(e){}}
function name(g){return [g.manufacturer,g.line,g.code,g.name].filter(Boolean).join(' ');}
function selected(id){return equipment().some(function(e){return e&&e.id===id;});}
function groupKey(g){return (g.manufacturer||'')+'||'+(g.line||'');}
function groupLabel(k){var p=k.split('||');return p[0]+' • '+p[1];}
function groups(){
 var m={};catalog().forEach(function(g){var k=groupKey(g);m[k]=(m[k]||0)+1;});
 return Object.keys(m).sort().map(function(k){return {key:k,label:groupLabel(k),count:m[k]};});
}
function toggle(id){
 var g=catalog().find(function(x){return x.id===id;});if(!g)return;
 var eq=equipment(),i=eq.findIndex(function(e){return e&&e.id===id;});
 if(i>=0)eq.splice(i,1);else eq.push({id:g.id,name:name(g),qty:1,equipmentType:'gel',gelId:g.id,manufacturer:g.manufacturer,line:g.line,code:g.code,gelCategory:g.category,sourceUrl:g.sourceUrl});
 persist();
 if(typeof window.renderEquipment==='function')window.renderEquipment();
 render();
}
function rows(list){
 var isSr=sr();
 if(!list.length)return '<div class="muted small" style="padding:12px 0">'+(isSr?'Nema rezultata.':'No results.')+'</div>';
 return list.slice(0,400).map(function(g){
   var on=selected(g.id);
   return '<button type="button" class="btn '+(on?'primary':'secondary')+'" data-gel-id="'+esc(g.id)+'" style="width:100%;text-align:left;margin:4px 0">'+(on?'✓ ':'＋ ')+esc(g.code+' • '+g.name)+'</button>';
 }).join('')+(list.length>400?'<div class="muted small">'+(isSr?'Prikazano prvih 400 rezultata — suzi pretragu.':'Showing first 400 results — refine search.')+'</div>':'');
}
function render(){
 var root=document.getElementById(ROOT_ID);if(!root)return;
 var all=catalog(),isSr=sr(),gs=groups();
 if(activeGroup&&!gs.some(function(g){return g.key===activeGroup;}))activeGroup='';
 var q=query.trim().toLowerCase(),list=all;
 if(activeGroup)list=list.filter(function(g){return groupKey(g)===activeGroup;});
 if(q)list=list.filter(function(g){return JSON.stringify(g).toLowerCase().indexOf(q)>=0;});
 var selectedCount=equipment().filter(function(e){return e&&e.equipmentType==='gel';}).length;
 root.innerHTML='<details class="card" id="gelFilterDetails" style="border:1px solid #6a4d7d;background:linear-gradient(135deg,#17121d,#22182b)">'+
  '<summary style="font-weight:900;font-size:21px;cursor:pointer;color:#d6b4ea">FILTERI / GEL <span style="font-size:12px;opacity:.75">('+all.length+')</span></summary>'+
  '<div style="margin-top:12px"><div class="muted small">'+(isSr?'Poseban katalog filtera. Ne menja postojeće kataloge rasvete. Izabrani gelovi su dostupni AI modulu.':'Separate filter catalog. It does not alter existing lighting catalogs. Selected gels are available to AI.')+'</div>'+
  '<div style="margin-top:10px"><input id="gelFilterSearch" value="'+esc(query)+'" placeholder="'+(isSr?'Pretraži: CTO, 204, Supergel...':'Search: CTO, 204, Supergel...')+'"></div>'+
  '<div style="display:grid;gap:6px;margin-top:10px"><button type="button" class="btn '+(!activeGroup?'primary':'secondary')+'" data-gel-group="" style="width:100%;text-align:left">'+(isSr?'SVI FILTERI':'ALL FILTERS')+' ('+all.length+')</button>'+
  gs.map(function(g){return '<button type="button" class="btn '+(activeGroup===g.key?'primary':'secondary')+'" data-gel-group="'+esc(g.key)+'" style="width:100%;text-align:left">'+esc(g.label)+' ('+g.count+')</button>';}).join('')+'</div>'+
  '<div class="muted small" style="margin:10px 0">'+(isSr?'Izabrano':'Selected')+': '+selectedCount+' • '+(isSr?'Rezultati':'Results')+': '+list.length+'</div>'+
  '<div id="gelFilterRows">'+(activeGroup||q?rows(list):'<div class="muted small" style="padding:8px 0">'+(isSr?'Izaberi proizvođača/liniju ili upiši pretragu.':'Choose a manufacturer/line or enter a search.')+'</div>')+'</div></div></details>';
 var details=root.querySelector('#gelFilterDetails');
 if(details){details.open=folderOpen;details.addEventListener('toggle',function(){folderOpen=details.open;});}
 var search=root.querySelector('#gelFilterSearch');
 if(search)search.addEventListener('input',function(){query=this.value||'';render();var n=document.getElementById('gelFilterSearch');if(n){n.focus();try{n.setSelectionRange(n.value.length,n.value.length);}catch(e){}}});
 root.querySelectorAll('[data-gel-group]').forEach(function(b){b.addEventListener('click',function(){activeGroup=this.getAttribute('data-gel-group')||'';render();});});
 root.querySelectorAll('[data-gel-id]').forEach(function(b){b.addEventListener('click',function(){toggle(this.getAttribute('data-gel-id'));});});
}
window.LightingAIGelFilterUI={render:render,toggle:toggle,version:'1.1-isolated'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
