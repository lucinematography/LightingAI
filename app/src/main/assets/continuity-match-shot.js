(function(){
'use strict';
if(typeof window!=='undefined'&&window.LightingAIContinuity)return;

// Shared read-only comparison used by Continuity, Shot List and Scene Planner.
const continuityKnowledge=[{"id":"PHY-002","title":"Ugao izvora u odnosu na kameru","principle":"Vidljiv oblik senki menja se sa horizontalnim i vertikalnim uglom svetla prema kameri.","validation":"Pogledaj test-kadar sa planiranog polozaja kamere.","limitations":"Broj stepeni nije univerzalni recept za svako lice.","references":[{"source":"popovic-tv","author":"Boris Popovic (priredio)","title":"Svjetlo u TV studiju / Primijenjena rasvjeta","pdfPage":13,"printedPage":13,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"popovic-tv","author":"Boris Popovic (priredio)","title":"Svjetlo u TV studiju / Primijenjena rasvjeta","pdfPage":14,"printedPage":14,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"landau-2014","author":"David Landau","title":"Lighting for Cinematography: A Practical Guide to the Art and Craft of Lighting for the Moving Image","pdfPage":20,"printedPage":10,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"}]},{"id":"PHY-003","title":"Velicina izvora i meko svetlo","principle":"Prividna velicina svetle povrsine iz perspektive subjekta oblikuje prelaz u polusenku.","validation":"Uporedi ivicu senke i svetlosni spill na probi.","limitations":"Meko svetlo nije sinonim za mali kontrast: negativ fill moze ocuvati visok odnos.","references":[{"source":"popovic-tv","author":"Boris Popovic (priredio)","title":"Svjetlo u TV studiju / Primijenjena rasvjeta","pdfPage":19,"printedPage":19,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"popovic-tv","author":"Boris Popovic (priredio)","title":"Svjetlo u TV studiju / Primijenjena rasvjeta","pdfPage":20,"printedPage":20,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"brown-2019","author":"Blain Brown","title":"Motion Picture and Video Lighting: For Cinematographers, Gaffers & Lighting Technicians","pdfPage":93,"printedPage":92,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"landau-2014","author":"David Landau","title":"Lighting for Cinematography: A Practical Guide to the Art and Craft of Lighting for the Moving Image","pdfPage":20,"printedPage":10,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"}]},{"id":"SET-005","title":"Dopunsko svetlo kontrolise kontrast","principle":"Fill sluzi prvenstveno za podesavanje dubine senke; previse izrazen drugi smer moze proizvesti novu vidljivu senku.","validation":"Proveri vise senki ispod nosa i brade.","limitations":"U dramaticnim kadrovima izostanak fill-a moze biti nameran.","references":[{"source":"popovic-tv","author":"Boris Popovic (priredio)","title":"Svjetlo u TV studiju / Primijenjena rasvjeta","pdfPage":32,"printedPage":32,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"popovic-tv","author":"Boris Popovic (priredio)","title":"Svjetlo u TV studiju / Primijenjena rasvjeta","pdfPage":38,"printedPage":38,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"}]},{"id":"SET-007","title":"Razlicit kadar zahteva razlicitu proveru","principle":"Svetlo koje dobro izgleda u totalu nije automatski ispravno u close-up-u ni iz drugog ugla.","validation":"Uporedi sve zadrzane kadrove iste scene.","limitations":"Kontinuitet je esteticka i urednicka odluka, ne samo jednaka luma.","references":[{"source":"landau-2014","author":"David Landau","title":"Lighting for Cinematography: A Practical Guide to the Art and Craft of Lighting for the Moving Image","pdfPage":191,"printedPage":181,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"popovic-tv","author":"Boris Popovic (priredio)","title":"Svjetlo u TV studiju / Primijenjena rasvjeta","pdfPage":35,"printedPage":35,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"popovic-tv","author":"Boris Popovic (priredio)","title":"Svjetlo u TV studiju / Primijenjena rasvjeta","pdfPage":36,"printedPage":36,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"}]},{"id":"COL-003","title":"White balance je kamera-plus-scena odluka","principle":"Kamera i izvori svetla daju kombinovani izgled; balans bele ne treba posmatrati nezavisno od osvetljenja.","validation":"Proveri kartu boja i WB metapodatke ako postoje.","limitations":"Postojeca 3B.2V YUV analiza NE meri fizicku temperaturu boje niti automatski zna WB.","references":[{"source":"landau-2014","author":"David Landau","title":"Lighting for Cinematography: A Practical Guide to the Art and Craft of Lighting for the Moving Image","pdfPage":22,"printedPage":12,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"landau-2014","author":"David Landau","title":"Lighting for Cinematography: A Practical Guide to the Art and Craft of Lighting for the Moving Image","pdfPage":23,"printedPage":13,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"popovic-tv","author":"Boris Popovic (priredio)","title":"Svjetlo u TV studiju / Primijenjena rasvjeta","pdfPage":45,"printedPage":45,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"brown-2019","author":"Blain Brown","title":"Motion Picture and Video Lighting: For Cinematographers, Gaffers & Lighting Technicians","pdfPage":175,"printedPage":174,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"}]},{"id":"COL-004","title":"Spektralni kvalitet razlicitih LED izvora","principle":"Dva izvora sa istom navedenom temperaturom boje mogu razlicito reprodukovati boju koze i rekvizite.","validation":"Potvrdi na test-kadru sa kozom i kartom boja.","limitations":"Opste ocene LED tehnologije iz 2014/2019 nisu dovoljna specifikacija modernih modela.","references":[{"source":"landau-2014","author":"David Landau","title":"Lighting for Cinematography: A Practical Guide to the Art and Craft of Lighting for the Moving Image","pdfPage":21,"printedPage":11,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"brown-2019","author":"Blain Brown","title":"Motion Picture and Video Lighting: For Cinematographers, Gaffers & Lighting Technicians","pdfPage":28,"printedPage":27,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"brown-2019","author":"Blain Brown","title":"Motion Picture and Video Lighting: For Cinematographers, Gaffers & Lighting Technicians","pdfPage":29,"printedPage":28,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"}]},{"id":"EXP-001","title":"Racunanje ekspozicije trazi merenje","principle":"Blenda, ISO i zatvarac su povezani sa osvetljenjem i kamerom, ali se ne mogu pouzdano ocitati iz proizvoljnog YUV kadra.","validation":"Proveri svetlomer i waveform uz korisnikov dozvoljeni profil kamere.","limitations":"Brojevi ekspozicije bez kalibracije oznaci PROCENA, a ne MERENJE.","references":[{"source":"landau-2014","author":"David Landau","title":"Lighting for Cinematography: A Practical Guide to the Art and Craft of Lighting for the Moving Image","pdfPage":23,"printedPage":13,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"landau-2014","author":"David Landau","title":"Lighting for Cinematography: A Practical Guide to the Art and Craft of Lighting for the Moving Image","pdfPage":24,"printedPage":14,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"brown-2019","author":"Blain Brown","title":"Motion Picture and Video Lighting: For Cinematographers, Gaffers & Lighting Technicians","pdfPage":204,"printedPage":203,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"brown-2019","author":"Blain Brown","title":"Motion Picture and Video Lighting: For Cinematographers, Gaffers & Lighting Technicians","pdfPage":216,"printedPage":215,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"},{"source":"popovic-tv","author":"Boris Popovic (priredio)","title":"Svjetlo u TV studiju / Primijenjena rasvjeta","pdfPage":44,"printedPage":44,"verification":"UNVERIFIED_ORIGINAL_PDF_NOT_AVAILABLE"}]}];
const lightFields=['role','fixtureId','fixtureName','x','y','heightM','distanceM','angleDeg','intensityPct','kelvin','modifier','color','beamAngleDeg','verticalTiltDeg'];
const cameraFields=['fps','shutterAngle','aperture','iso','whiteBalanceK','ndStops','focalLengthMm'];
function hasValue(v){return v!==null&&v!==undefined&&v!==''&&(typeof v!=='number'||Number.isFinite(v));}
function copied(v){return JSON.parse(JSON.stringify(v));}
function normalizeSaved(input,core){
  if(!input||!['scene','shot'].includes(input.kind))throw new Error('Izaberi sačuvanu scenu ili kadar.');
  if(!Array.isArray(input.revisions))throw new Error('Istorija nije dostupna.');
  if(!input.revisions.length)return {input:input,history:[],plan:null,revision:null,events:[]};
  const history=core.restoreRevisions(input.revisions);
  if(input.reviews)core.restorePrelightReviews(input.reviews,history);
  const revision=history[history.length-1];
  return {input:input,history:history,plan:revision.plan,revision:revision,
    events:core.listDopPlannedEditEvents(history).events};
}
function provenance(saved,light,field){
  if(!saved.plan)return 'NEPOZNATO_POREKLO_STAROG_ZAPISA';
  const p=saved.plan;
  if(light&&['fixtureId','fixtureName'].includes(field)&&light.available&&p.dataStatus.inventory==='user-declared')return 'KORISNIČKI_PRIJAVLJEN_INVENTAR_NIJE_IDENTITET_UREĐAJA';
  if(p.dopLocalVariant){
    // Reuse the verified edit ledger, including inherited edits after meter-only revisions.
    let reset=0;
    saved.history.forEach((r,i)=>{if(!r.plan.dopLocalVariant)reset=i;});
    const manual=saved.events.some(e=>e.afterSequence>reset&&
      (light?e.lightChanges.some(c=>c.lightId===light.id&&c.field===field&&c.after===light[field]):
        e.cameraChanges.some(c=>c.field===field&&c.after===p.cameraSettings[field])));
    if(manual)return 'DOP_POTVRĐEN_PLAN_NIJE_FIZIČKO_MERENJE';
  }
  if(!light&&p.dataStatus.cameraSettings[field]==='dop-specified')return 'KORISNIČKI_ZADATO_NIJE_PROVERENO_NA_KAMERI';
  return p.source==='ai'?'AI_PROCENA_NIJE_MERENJE':'LOKALNI_PREDLOG_NIJE_MERENJE';
}
function flatSavedMap(items,fn){return [].concat.apply([],items.map(fn));}
function automaticPairs(a,b){
  if(!a.plan||!b.plan)return [];
  const sameLineage=a.history[0].revisionId===b.history[0].revisionId;
  const signature=l=>l.fixtureId?l.fixtureId+'|'+l.role:null;
  return flatSavedMap(a.plan.lights,left=>{
    if(sameLineage){
      const right=b.plan.lights.find(r=>r.id===left.id);
      return right?[{left:left.id,right:right.id,method:'ISTI_LOGIČKI_ID_U_ISTORIJI'}]:[];
    }
    const key=signature(left);if(!key)return [];
    const ls=a.plan.lights.filter(l=>signature(l)===key),rs=b.plan.lights.filter(l=>signature(l)===key);
    return ls.length===1&&rs.length===1?[{left:left.id,right:rs[0].id,method:'JEDINSTVENA_ULOGA_I_MODEL_NIJE_FIZIČKI_IDENTITET'}]:[];
  });
}
function compareSaved(reference,current,core,options={}){
  const a=normalizeSaved(reference,core),b=normalizeSaved(current,core),rows=[];
  const add=(group,field,left,right,ea,eb,reason)=>{
    const known=hasValue(left)&&hasValue(right);
    rows.push({group:group,field:field,before:left===undefined?null:left,after:right===undefined?null:right,
      beforeEvidence:ea,afterEvidence:eb,
      status:reason||!known?'UNKNOWN':JSON.stringify(left)===JSON.stringify(right)?'MATCH':'CHANGED',
      recordedStatus:known?(JSON.stringify(left)===JSON.stringify(right)?'MATCH':'CHANGED'):'UNKNOWN',
      reason:reason||(!known?'Nedostaje sačuvana vrednost; prazno nije nula niti poklapanje.':null)});
  };
  const old=reference.legacy||{},now=current.legacy||{};
  cameraFields.forEach(k=>{
    const legacy=(s,k)=>({fps:(s.exposure||{}).fps,shutterAngle:(s.exposure||{}).shutterAngleDeg,iso:(s.exposure||{}).iso,
      ndStops:(s.exposure||{}).ndStops,aperture:(s.dof||{}).aperture,focalLengthMm:(s.camera||{}).focalLengthMm})[k];
    add('Kamera',k,a.plan?a.plan.cameraSettings[k]:legacy(old,k),b.plan?b.plan.cameraSettings[k]:legacy(now,k),
      provenance(a,null,k),provenance(b,null,k),!a.plan||!b.plan?'Stari kadar nema verifikovanu Scene Planner vezu; vrednosti mogu biti podrazumevane.':null);
  });
  const automatic=automaticPairs(a,b);
  const proposed=options.pairs===undefined?automatic:options.pairs;
  if(!Array.isArray(proposed))throw new Error('Neispravno uparivanje izvora.');
  const seenA=new Set(),seenB=new Set();
  const pairs=proposed.map(pair=>{
    const l=(a.plan?a.plan.lights.find(x=>x.id===pair.left):null),r=(b.plan?b.plan.lights.find(x=>x.id===pair.right):null);
    if(!l||!r||seenA.has(l.id)||seenB.has(r.id))throw new Error('Svaki izvor može biti uparen samo jednom.');
    seenA.add(l.id);seenB.add(r.id);
    return {left:l.id,right:r.id,method:(automatic.find(p=>p.left===l.id&&p.right===r.id)||{}).method||'RUČNO_UPARENI_PLANOVI_NIJE_POTVRDA_UREĐAJA'};
  });
  pairs.forEach(pair=>{
    const l=a.plan.lights.find(x=>x.id===pair.left),r=b.plan.lights.find(x=>x.id===pair.right);
    const group=l.id+' → '+r.id+' ('+l.role+' → '+r.role+')';
    lightFields.forEach(k=>{
      let reason=null;
      if(['x','y','angleDeg'].includes(k)&&!(options.sharedAxes===true&&
         a.plan.geometry.widthM>0&&a.plan.geometry.depthM>0&&
         a.plan.geometry.widthM===b.plan.geometry.widthM&&a.plan.geometry.depthM===b.plan.geometry.depthM))
        reason='Različite/nepotvrđene koordinatne osnove; x/y su procenti crteža, ne svetske koordinate.';
      if(k==='intensityPct'&&(!l.fixtureId||l.fixtureId!==r.fixtureId))
        reason='Procenat različitih/nepotvrđenih izvora nije uporediva fizička osvetljenost.';
      add(group,k,l[k],r[k],provenance(a,l,k),provenance(b,r,k),reason);
    });
    const distance=(s,l)=>(s.plan.distanceMeasurements||[]).find(m=>m.lightId===l.id&&m.fixtureId===l.fixtureId);
    const meter=(s,l)=>(s.plan.incidentLuxReadings||[]).find(m=>m.lightId===l.id&&m.fixtureId===l.fixtureId);
    const da=distance(a,l),db=distance(b,r),ma=meter(a,l),mb=meter(b,r);
    add(group,'sačuvano merenje rastojanja (m)',(da||{}).distanceM,(db||{}).distanceM,
      da?'KORISNIČKI_PRIJAVLJENO_MERENJE_NIJE_NEZAVISNO_PROVERENO':'NEPOZNATO',
      db?'KORISNIČKI_PRIJAVLJENO_MERENJE_NIJE_NEZAVISNO_PROVERENO':'NEPOZNATO',
      'Istorijski unosi korisnika; tačka i fizička postavka između scena nisu automatski usaglašene.');
    add(group,'sačuvano izolovano očitavanje lux',ma||null,mb||null,
      ma?'KORISNIČKI_UNOS_FIZIČKOG_SVETLOMERA_NIJE_NEZAVISNO_PROVEREN':'NEPOZNATO',
      mb?'KORISNIČKI_UNOS_FIZIČKOG_SVETLOMERA_NIJE_NEZAVISNO_PROVEREN':'NEPOZNATO',
      'Samo sačuvana očitavanja sa kontekstom. Nema pretvaranja procenata u lux ili automatskog poređenja različitih uslova.');
  });
  [a,b].forEach((s,index)=>{
    ((s.plan||{}).lights||[]).forEach(l=>{
      if((index?seenB:seenA).has(l.id))return;
      add('Neuparen izvor',index?'Samo u trenutnoj: '+l.id:'Samo u referentnoj: '+l.id,
        index?null:{id:l.id,role:l.role,fixture:l.fixtureName},
        index?{id:l.id,role:l.role,fixture:l.fixtureName}:null,
        index?'NEPOZNATO':provenance(s,l,'fixtureId'),index?provenance(s,l,'fixtureId'):'NEPOZNATO',
        'Nema jednoznačnog para. L1 u dve nezavisne scene ne označava isti reflektor; po potrebi upari ručno.');
    });
  });
  if(!a.plan||!b.plan)add('Izvori','plan rasvete',a.plan?'Sačuvan plan':old.equipment||null,b.plan?'Sačuvan plan':now.equipment||null,
    provenance(a,null,''),provenance(b,null,''),'Nema dva sačuvana plana sa izvorima, ulogama i postavkama.');
  if(reference.legacy||current.legacy)add('Stari zapisi','ručni ratio unosi bez potvrđenog porekla',old.ratio||null,now.ratio||null,
    'NEPOZNATO_NIJE_DOKAZ_MERENJA','NEPOZNATO_NIJE_DOKAZ_MERENJA',
    'Stari Continuity/Shot List snapshot ne razlikuje podrazumevane, procenjene i izmerene vrednosti.');
  let meterComparison=null;
  if(a.revision&&b.revision&&b.history.some(r=>r.revisionId===a.revision.revisionId))
    meterComparison=core.compareSceneIncidentLuxRevisions(b.history,a.revision.revisionId,b.revision.revisionId);
  return copied({contract:'lightingai-saved-continuity/1',reference:{id:reference.id,name:reference.name,revisionId:(a.revision||{}).revisionId||null},
    current:{id:current.id,name:current.name,revisionId:(b.revision||{}).revisionId||null},pairs,rows,
    counts:{match:rows.filter(r=>r.status==='MATCH').length,changed:rows.filter(r=>r.status==='CHANGED').length,unknown:rows.filter(r=>r.status==='UNKNOWN').length},
    wholeSceneMeterRecords:{reference:(a.plan||{}).sceneIncidentLuxReading||null,current:(b.plan||{}).sceneIncidentLuxReading||null},
    meterComparison:meterComparison,knowledge:continuityKnowledge,
    importedHistory:!!(reference.imported||current.imported),
    physicalFixtureCommandsPerformed:false,originalScenesModified:false,sceneContrastVerified:false,cameraExposureVerified:false,
    note:'Poređenje sačuvanih zapisa, ne ocena da je scena pogrešno osvetljena. Isti parametri ne dokazuju isti izgled senki, kontrasta ili boje.'});
}
const savedAPI={compareSaved:compareSaved,automaticPairs:(a,b,c)=>automaticPairs(normalizeSaved(a,c),normalizeSaved(b,c)),
  knowledge:()=>copied(continuityKnowledge),readSavedSource:readSavedSource,listSavedSources:savedSources};
if(typeof module==='object'&&module.exports){module.exports=savedAPI;return;}
window.LightingAIContinuity=savedAPI;


function safeHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function savedSources(draft){
  const sources=[];
  if(draft&&draft.sceneSupport())draft.listScenes().forEach(s=>sources.push({key:'scene:'+s.id,name:'Scena: '+s.name,kind:'scene',id:s.id}));
  function fromStorage(key,field){
    const raw=localStorage.getItem(key);if(!raw)return [];
    const data=JSON.parse(raw);
    if(!data||!Array.isArray(data[field])||data[field].length>5000)throw new Error('Sačuvani spisak nije čitljiv.');
    return data[field];
  }
  fromStorage('lighting_shot_list_v1','rows').forEach(s=>sources.push({key:'shot:'+s.id,name:'Kadar: '+s.name,kind:'shot',record:s}));
  fromStorage('lighting_continuity_v1','refs').forEach(s=>sources.push({key:'reference:'+s.id,name:'Referenca: '+s.name,kind:'reference',record:s}));
  return sources;
}
function readSavedSource(source,draft){
  if(!source)throw new Error('Izaberi referentnu i trenutnu scenu ili kadar.');
  if(source.kind==='scene')return draft.readSceneSnapshot(source.id);
  const record=source.record,setup=source.kind==='shot'?record.setup:record.data;
  const binding=source.kind==='shot'&&(setup||{}).scenePlannerBinding;
  if(binding){
    const snapshot=draft.readSceneSnapshot(binding.sceneId);
    const index=snapshot.revisions.findIndex(r=>r.revisionId===binding.revisionId);
    if(index<0)throw new Error('Tačna revizija vezana za kadar više nije dostupna; ne koristimo noviji plan kao zamenu.');
    snapshot.kind='shot';snapshot.id=record.id;snapshot.name=record.name;
    snapshot.revisions=snapshot.revisions.slice(0,index+1);
    const ids=snapshot.revisions.map(r=>r.revisionId);
    snapshot.reviews=snapshot.reviews.filter(r=>ids.includes(r.revisionId));
    return snapshot;
  }
  return {kind:'shot',id:record.id,name:record.name,revisions:[],legacy:copied((setup||{}).continuity||setup||{})};
}
function ensureSavedCore(){
  if(window.LightingAIScenePlannerCore)return Promise.resolve(window.LightingAIScenePlannerCore);
  return new Promise((resolve,reject)=>{
    let script=document.getElementById('lightingai-scene-planner-core-loader');
    if(!script){script=document.createElement('script');script.id='lightingai-scene-planner-core-loader';script.src='file:///android_asset/scene-planner-core.js';document.body.appendChild(script);}
    script.addEventListener('load',()=>resolve(window.LightingAIScenePlannerCore),{once:true});
    script.addEventListener('error',()=>reject(new Error('Model plana nije učitan.')),{once:true});
  });
}
function mountSavedComparison(box){
  if(!box)return;
  box.innerHTML='<h3>Kontinuitet sačuvanih scena / kadrova</h3>'+
    '<p>Poredi poslednje sačuvane revizije scena ili tačnu reviziju vezanu za kadar. Ne koristi nezavršene unose, ne šalje podatke i ne menja originale.</p>'+
    '<label>REFERENTNA SCENA / KADAR<select data-cont="reference"></select></label>'+
    '<label>TRENUTNA SCENA / KADAR<select data-cont="current"></select></label>'+
    '<button type="button" class="sp-btn btn secondary" data-cont="refresh">OSVEŽI SPISAK</button>'+
    '<button type="button" class="sp-btn btn primary" data-cont="prepare">PREGLEDAJ I UPARI IZVORE</button>'+
    '<div data-cont="pairs"></div><label><input type="checkbox" data-cont="axes"> Deklarišem zajedničku koordinatnu osnovu crteža. Ovo ne potvrđuje fizička merenja.</label>'+
    '<button type="button" class="sp-btn btn primary" data-cont="compare">PRIKAŽI RAZLIKE</button>'+
    '<p data-cont="status" role="status"></p><div data-cont="result"></div>';
  const node=k=>box.querySelector('[data-cont="'+k+'"]');
  box.addEventListener('input',e=>e.stopPropagation());
  box.addEventListener('change',e=>e.stopPropagation());
  let sources=[],reference=null,current=null,preparedKeys='',busy=false,generation=0;
  const message=v=>{node('status').textContent=v;};
  const reset=()=>{generation++;reference=current=null;preparedKeys='';node('axes').checked=false;node('pairs').innerHTML='';node('result').innerHTML='';};
  function refresh(){
    reset();
    try{
      sources=savedSources(window.LightingAIScenePlannerDraft);
      const options=sources.map(s=>'<option value="'+safeHtml(s.key)+'">'+safeHtml(s.name)+'</option>').join('');
      node('reference').innerHTML=options;node('current').innerHTML=options;
      if(sources.length>1)node('current').selectedIndex=1;
      message(sources.length?'Izaberi dva sačuvana zapisa.':'Nema sačuvanih scena/kadrova.');
    }catch(error){sources=[];node('reference').innerHTML=node('current').innerHTML='';message(error.message);}
  }
  async function prepare(){
    const version=++generation;
    reference=current=null;node('result').innerHTML='';node('pairs').innerHTML='';
    const core=await ensureSavedCore();if(version!==generation||!box.isConnected)return false;
    const draft=window.LightingAIScenePlannerDraft;
    reference=readSavedSource(sources.find(s=>s.key===node('reference').value),draft);
    current=readSavedSource(sources.find(s=>s.key===node('current').value),draft);
    const a=normalizeSaved(reference,core),b=normalizeSaved(current,core),pairs=automaticPairs(a,b);
    preparedKeys=node('reference').value+'|'+node('current').value;
    node('pairs').innerHTML='<p>Uparivanje je između zapisa plana, ne potvrda identiteta fizičkog reflektora. Prazan izbor ostaje NEPOZNATO.</p>'+
      ((a.plan||{}).lights||[]).map(l=>'<label>'+safeHtml(l.id+' • '+l.role+' • '+l.fixtureName)+
        '<select data-cont-light="'+safeHtml(l.id)+'"><option value="">NEUPAREN</option>'+
        ((b.plan||{}).lights||[]).map(r=>'<option value="'+safeHtml(r.id)+'"'+(pairs.some(p=>p.left===l.id&&p.right===r.id)?' selected':'')+'>'+
        safeHtml(r.id+' • '+r.role+' • '+r.fixtureName)+'</option>').join('')+'</select></label>').join('');
    message('Pregledani su sačuvani planovi. Po potrebi ručno upari izvore, zatim prikaži razlike.');
    return true;
  }
  const fieldNames={role:'Uloga',fixtureId:'ID modela',fixtureName:'Izvor / model',x:'X crteža (%)',y:'Y crteža (%)',heightM:'Predložena visina (m)',
    distanceM:'Predloženo rastojanje (m)',angleDeg:'Predloženi ugao (°)',intensityPct:'Predloženi intenzitet (%)',kelvin:'Predložena temperatura (K)',
    modifier:'Modifikator',color:'Boja / gel',beamAngleDeg:'Ugao snopa (°)',verticalTiltDeg:'Nagib (°)',fps:'FPS',shutterAngle:'Ugao zatvarača (°)',
    aperture:'Blenda',iso:'ISO',whiteBalanceK:'Balans bele (K)',ndStops:'ND (stop)',focalLengthMm:'Žižna daljina (mm)'};
  function show(report){
    const fmt=v=>v===null?'—':typeof v==='object'?JSON.stringify(v):String(v);
    node('result').innerHTML='<p><b>'+safeHtml(report.reference.name)+' → '+safeHtml(report.current.name)+'</b><br>'+
      safeHtml(report.note)+'</p><p>Poklapa se zapis: '+report.counts.match+' • Promenjeno: '+report.counts.changed+' • Nepouzdano/nepoznato: '+report.counts.unknown+'</p>'+
      '<p>Procenat dimmera nije lux. Isti Kelvin ne dokazuje isti spektar/boju kože. Promene su predmet DoP procene, ne automatska greška rasvete.</p>'+
      (report.importedHistory?'<p>Uvezeni zapisi su istorijski podaci; nisu nova potvrda postavke ili merenja.</p>':'')+
      '<div style="overflow:auto"><table style="width:100%;font-size:12px"><thead><tr><th>Parametar</th><th>Referentno / poreklo</th><th>Trenutno / poreklo</th><th>Rezultat</th></tr></thead><tbody>'+
      report.rows.map(r=>'<tr><td>'+safeHtml(r.group+' • '+(fieldNames[r.field]||r.field))+'</td><td>'+safeHtml(fmt(r.before))+
        '<br><small>'+safeHtml(r.beforeEvidence)+'</small></td><td>'+safeHtml(fmt(r.after))+'<br><small>'+safeHtml(r.afterEvidence)+
        '</small></td><td>'+({MATCH:'POKLAPA SE ZAPIS',CHANGED:'PROMENJENO',UNKNOWN:'NEPOZNATO / NEUPOREDIVO'}[r.status])+
        (r.status==='UNKNOWN'&&r.recordedStatus!=='UNKNOWN'?'<br>Numerički zapis: '+(r.recordedStatus==='MATCH'?'isti':'različit'):'')+
        '<br>'+safeHtml(r.reason||'Podudarnost vrednosti ne potvrđuje fizički ili vizuelni kontinuitet.')+'</td></tr>').join('')+'</tbody></table></div>'+
      '<details><summary>Istorijska fizička očitavanja i postojeća provera svetlomera</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+
        safeHtml(JSON.stringify({records:report.wholeSceneMeterRecords,comparison:report.meterComparison},null,2))+'</pre>'+
        '<p>Očitavanja je uneo korisnik. Nema nezavisne potvrde uređaja, kalibracije ili sadašnje postavke. Za različite scene ne računamo automatski lux odnos.</p></details>'+
      '<details><summary>Stručna osnova: postojeći K0 zapisi / K1 ograničenja</summary>'+
        '<p>Originalni PDF-ovi nisu dostupni za proveru. Ovo su reference iz postojeće baze; navedene stranice ovde nisu nezavisno proverene.</p>'+
        report.knowledge.map(k=>'<p><b>'+safeHtml(k.id+' — '+k.title)+'</b><br>'+safeHtml(k.principle)+'<br>Proveri: '+safeHtml(k.validation)+
          '<br>Ograničenje: '+safeHtml(k.limitations)+'<br>'+k.references.map(r=>safeHtml(r.author+' — '+r.title+'; PDF '+r.pdfPage+', štampana '+r.printedPage+' [NEPROVERENO]')).join('<br>')+'</p>').join('')+'</details>';
    message('Pregled je samo za čitanje. Originalne scene i revizije nisu menjane.');
  }
  node('reference').onchange=node('current').onchange=reset;
  node('refresh').onclick=refresh;
  node('prepare').onclick=async()=>{if(busy)return;busy=true;try{await prepare();}catch(error){reset();message(error.message);}finally{busy=false;}};
  node('compare').onclick=async()=>{
    if(busy)return;busy=true;
    try{
      if(preparedKeys!==node('reference').value+'|'+node('current').value)if(!await prepare())return;
      const pairs=Array.from(box.querySelectorAll('[data-cont-light]')).filter(s=>s.value).map(s=>({left:s.getAttribute('data-cont-light'),right:s.value}));
      show(compareSaved(reference,current,window.LightingAIScenePlannerCore,{pairs,sharedAxes:node('axes').checked}));
    }catch(error){node('result').innerHTML='';message(error.message);}
    finally{busy=false;}
  };
  node('axes').onchange=()=>{node('result').innerHTML='';};
  node('pairs').onchange=()=>{node('result').innerHTML='';};
  refresh();
}
savedAPI.mountSavedComparison=mountSavedComparison;
savedAPI.readSavedSource=readSavedSource;
savedAPI.listSavedSources=savedSources;

const KEY='lighting_continuity_v1',SET_KEY='lighting_set_sketch_v1',MEASURE_KEY='lighting_scene_measurements_v1',RATIO_KEY='lighting_ratio_v1',DMX_KEY='lighting_dmx_patch_v1';
const E=id=>document.getElementById(id),lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={sr:{title:'🎬 Continuity / Match Shot',intro:'Sačuvaj tehničku referencu kadra i kasnije proveri šta se promenilo. Poređenje je lokalno i koristi stvarne parametre koje već ima LightingAI.',name:'NAZIV REFERENCE',save:'SAČUVAJ TRENUTNO',compare:'POREDI SA TRENUTNIM',del:'OBRIŠI REFERENCU',none:'Nema sačuvane reference.',match:'POKLAPA SE',changed:'PROMENJENO',focal:'Objektiv',sensor:'Širina senzora',distance:'Kamera → glumac',equipment:'Izabrana rasveta',iso:'ISO',fps:'FPS',shutter:'Shutter ugao',nd:'ND',key:'Key unos (lx, neprovereno poreklo)',fill:'Fill unos (lx, neprovereno poreklo)',back:'Back unos (lx, neprovereno poreklo)',dof:'DOF parametri',flicker:'Flicker parametri',dmx:'DMX patch',saved:'Referenca je sačuvana.',deleted:'Referenca je obrisana.'},en:{title:'🎬 Continuity / Match Shot',intro:'Save a technical shot reference and later check what changed. Comparison stays local and uses real parameters already available in LightingAI.',name:'REFERENCE NAME',save:'SAVE CURRENT',compare:'COMPARE TO CURRENT',del:'DELETE REFERENCE',none:'No saved reference.',match:'MATCH',changed:'CHANGED',focal:'Lens',sensor:'Sensor width',distance:'Camera → subject',equipment:'Selected lighting',iso:'ISO',fps:'FPS',shutter:'Shutter angle',nd:'ND',key:'Key input (lx, unverified origin)',fill:'Fill input (lx, unverified origin)',back:'Back input (lx, unverified origin)',dof:'DOF parameters',flicker:'Flicker parameters',dmx:'DMX patch',saved:'Reference saved.',deleted:'Reference deleted.'}};
const t=()=>TXT[lang()];
function parse(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v==null?f:v}catch(e){return f}}
function num(v){if(v==null||String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)?n:null}
function input(id){return num((E(id)||{}).value)}
function activeScene(){const s=parse(SET_KEY,null);if(!s||!Array.isArray(s.scenes)||!s.scenes.length)return null;return s.scenes.find(x=>x.id===s.activeId)||s.scenes[0]}
function latestMeasure(target){const a=parse(MEASURE_KEY,[]);if(!Array.isArray(a))return null;const rows=a.filter(x=>x&&x.target===target&&Number(x.distance)>0);if(!rows.length)return null;rows.sort((a,b)=>{const ta=Date.parse(a.createdAt||a.timestamp||0)||0,tb=Date.parse(b.createdAt||b.timestamp||0)||0;return tb-ta});return num(rows[0].distance)}
function equipment(){const fs=Array.isArray(window.catalogFixtures)?window.catalogFixtures:[],sel=Array.isArray(window.equipment)?window.equipment:[];return sel.map(e=>{const f=fs.find(x=>x.id===e.id||x.id===e.fixtureId);return {id:(f&&f.id)||e.id||e.fixtureId||'?',name:f?((f.manufacturer||'')+' '+(f.model||f.id)).trim():String(e.id||e.fixtureId||'?'),qty:Math.max(1,Math.round(Number(e.qty)||1))}}).sort((a,b)=>a.id.localeCompare(b.id))}
function dmx(){if(typeof window.LightingAIDmxSnapshot==='function'){try{return window.LightingAIDmxSnapshot()}catch(e){}}const s=parse(DMX_KEY,{rows:[]});return {rows:(s.rows||[]).map(r=>({name:r.name||'',mode:r.mode||'',universe:Number(r.universe)||1,start:Number(r.start)||1,channels:Number(r.channels)||0}))}}
function snapshot(){const scene=activeScene(),cam=scene&&(scene.objects||[]).find(o=>o.type==='camera'),ratio=Object.assign({},parse(RATIO_KEY,{}));let dof=null,flicker=null;try{dof=typeof window.LightingAIDofSnapshot==='function'?window.LightingAIDofSnapshot():null}catch(e){}try{flicker=typeof window.LightingAIFlickerSnapshot==='function'?window.LightingAIFlickerSnapshot():null}catch(e){}return {sceneId:(scene||{}).id||null,sceneName:(scene||{}).name||null,camera:{focalLengthMm:num((cam||{}).focalLengthMm),sensorWidthMm:num((cam||{}).sensorWidthMm)},subjectDistanceM:latestMeasure('subject'),equipment:equipment(),exposure:{iso:input('lightCalcIso'),fps:input('lightCalcFps'),shutterAngleDeg:input('lightCalcShutter'),ndStops:input('lightCalcNd')},ratio:{keyLux:num(ratio.key),fillLux:num(ratio.fill),backLux:num(ratio.back)},dof:dof?{focalLengthMm:num(dof.focalLengthMm),aperture:num(dof.aperture),subjectDistanceM:num(dof.subjectDistanceM),sensorWidthMm:num(dof.sensorWidthMm),cocMm:num(dof.circleOfConfusionMm)}:null,flicker:flicker?{fps:num(flicker.fps),shutterAngleDeg:num(flicker.shutterAngleDeg),frequencyHz:num(flicker.frequencyHz)}:null,dmx:dmx()}}
window.LightingAIContinuitySnapshot=snapshot;
function read(){const v=parse(KEY,{refs:[],activeId:null});if(!Array.isArray(v.refs))v.refs=[];return v}
let state=read();function persist(){localStorage.setItem(KEY,JSON.stringify(state))}function id(){return 'cont_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6)}
function saveRef(){const d=snapshot(),name=((E('continuityName')||{}).value||d.sceneName||('Reference '+(state.refs.length+1))).trim()||('Reference '+(state.refs.length+1)),r={id:id(),name,createdAt:new Date().toISOString(),data:d};state.refs.push(r);state.activeId=r.id;persist();renderSelect();compare();status(t().saved)}
function activeRef(){return state.refs.find(r=>r.id===state.activeId)||state.refs[0]||null}
function eqNum(a,b,tol){if(a==null&&b==null)return false;if(a==null||b==null)return false;return Math.abs(Number(a)-Number(b))<=tol}
function eqJson(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch(e){return false}}
function fmt(v,u=''){if(v==null)return '—';return typeof v==='number'?(Math.round(v*100)/100)+u:String(v)}
function equipmentText(a){return (a||[]).map(x=>x.name+' ×'+x.qty).join(', ')||'—'}
function dmxText(d){const rows=d&&Array.isArray(d.rows)?d.rows:[];return rows.length?rows.map(r=>'U'+(r.universe||1)+' '+(r.start||1)+'-'+((r.start||1)+(r.channels||0)-1)+' '+(r.name||'')).join(' | '):'—'}
function dofText(d){return d?(fmt(d.focalLengthMm,' mm')+' · f/'+fmt(d.aperture)+' · '+fmt(d.subjectDistanceM,' m')):'—'}
function flickerText(f){return f?(fmt(f.fps,' fps')+' · '+fmt(f.shutterAngleDeg,'°')+' @ '+fmt(f.frequencyHz,' Hz')):'—'}
function rows(base,cur){const x=t();return [{l:x.focal,a:fmt((base.camera||{}).focalLengthMm,' mm'),b:fmt((cur.camera||{}).focalLengthMm,' mm'),ok:eqNum((base.camera||{}).focalLengthMm,(cur.camera||{}).focalLengthMm,0.01)},{l:x.sensor,a:fmt((base.camera||{}).sensorWidthMm,' mm'),b:fmt((cur.camera||{}).sensorWidthMm,' mm'),ok:eqNum((base.camera||{}).sensorWidthMm,(cur.camera||{}).sensorWidthMm,0.01)},{l:x.distance,a:fmt(base.subjectDistanceM,' m'),b:fmt(cur.subjectDistanceM,' m'),ok:eqNum(base.subjectDistanceM,cur.subjectDistanceM,0.02)},{l:x.equipment,a:equipmentText(base.equipment),b:equipmentText(cur.equipment),ok:eqJson(base.equipment,cur.equipment)},{l:x.iso,a:fmt((base.exposure||{}).iso),b:fmt((cur.exposure||{}).iso),ok:eqNum((base.exposure||{}).iso,(cur.exposure||{}).iso,0.1)},{l:x.fps,a:fmt((base.exposure||{}).fps),b:fmt((cur.exposure||{}).fps),ok:eqNum((base.exposure||{}).fps,(cur.exposure||{}).fps,0.001)},{l:x.shutter,a:fmt((base.exposure||{}).shutterAngleDeg,'°'),b:fmt((cur.exposure||{}).shutterAngleDeg,'°'),ok:eqNum((base.exposure||{}).shutterAngleDeg,(cur.exposure||{}).shutterAngleDeg,0.1)},{l:x.nd,a:fmt((base.exposure||{}).ndStops),b:fmt((cur.exposure||{}).ndStops),ok:eqNum((base.exposure||{}).ndStops,(cur.exposure||{}).ndStops,0.01)},{l:x.key,a:fmt((base.ratio||{}).keyLux,' lx'),b:fmt((cur.ratio||{}).keyLux,' lx'),ok:eqNum((base.ratio||{}).keyLux,(cur.ratio||{}).keyLux,1)},{l:x.fill,a:fmt((base.ratio||{}).fillLux,' lx'),b:fmt((cur.ratio||{}).fillLux,' lx'),ok:eqNum((base.ratio||{}).fillLux,(cur.ratio||{}).fillLux,1)},{l:x.back,a:fmt((base.ratio||{}).backLux,' lx'),b:fmt((cur.ratio||{}).backLux,' lx'),ok:eqNum((base.ratio||{}).backLux,(cur.ratio||{}).backLux,1)},{l:x.dof,a:dofText(base.dof),b:dofText(cur.dof),ok:eqJson(base.dof,cur.dof)},{l:x.flicker,a:flickerText(base.flicker),b:flickerText(cur.flicker),ok:eqJson(base.flicker,cur.flicker)},{l:x.dmx,a:dmxText(base.dmx),b:dmxText(cur.dmx),ok:eqJson(base.dmx,cur.dmx)}]}
function compare(){const out=E('continuityResults'),r=activeRef();if(!out)return;if(!r){out.innerHTML='<div class="continuity-empty">'+t().none+'</div>';return}const rs=rows(r.data,snapshot());out.innerHTML='<p>Stari tehnički snimci: podudaranje zapisa nije potvrda fizičkog ili vizuelnog kontinuiteta. Lux unosi nemaju potvrđeno poreklo svetlomera.</p>'+rs.map((q,i)=>{const known=q.a!=='—'&&q.b!=='—'&&![8,9,10].includes(i);return '<div class="continuity-row '+(!known?'unknown':q.ok?'ok':'changed')+'"><div><b>'+safeHtml(q.l)+'</b><small>'+safeHtml(q.a)+'</small><small>→ '+safeHtml(q.b)+'</small></div><strong>'+(!known?'NEPOZNATO / NEPROVERENO':q.ok?'✓ POKLAPA SE ZAPIS':'PROMENJENO')+'</strong></div>'}).join('')}

function renderSelect(){const s=E('continuitySelect');if(!s)return;s.innerHTML=state.refs.length?state.refs.map(r=>'<option value="'+safeHtml(r.id)+'" '+(r.id===state.activeId?'selected':'')+'>'+safeHtml(r.name)+'</option>').join(''):'<option value="">'+t().none+'</option>'}
function delRef(){const r=activeRef();if(!r)return;state.refs=state.refs.filter(x=>x.id!==r.id);state.activeId=(state.refs[0]||{}).id||null;persist();renderSelect();compare();status(t().deleted)}
function status(v){const e=E('continuityStatus');if(!e)return;e.textContent=v;setTimeout(()=>{if(e.textContent===v)e.textContent=''},2200)}
function translate(){if(!E('continuityCard'))return;const x=t();E('continuityTitle').textContent=x.title;E('continuityIntro').textContent=x.intro;E('continuityNameLabel').firstChild.textContent=x.name+' ';E('continuitySave').textContent=x.save;E('continuityCompare').textContent=x.compare;E('continuityDelete').textContent=x.del;renderSelect();compare()}
function init(){const page=E('planner');if(!page||E('continuityCard'))return false;const st=document.createElement('style');st.id='continuityStyle';st.textContent='.continuity-controls{display:grid;grid-template-columns:1.5fr 1fr;gap:8px}.continuity-results{margin-top:10px}.continuity-row{display:grid;grid-template-columns:1fr auto;gap:10px;padding:9px;border-bottom:1px solid #292d33;align-items:center}.continuity-row small{display:block;color:#9299a3;font-size:11px;margin-top:2px}.continuity-row strong{font-size:11px}.continuity-row.ok strong{color:#9de3bd}.continuity-row.changed{background:#24191b}.continuity-row.changed strong{color:#ffb5b5}.continuity-empty,.continuity-status{font-size:12px;color:#9299a3}.continuity-status{color:#b8f0d1;min-height:18px}@media(max-width:560px){.continuity-controls{grid-template-columns:1fr}.continuity-row{grid-template-columns:1fr}}';document.head.appendChild(st);const card=document.createElement('details');card.id='continuityCard';card.className='card';card.innerHTML='<summary style="font-weight:900;font-size:20px;cursor:pointer"><span id="continuityTitle"></span></summary><div style="margin-top:12px"><p id="continuityIntro" class="muted small"></p><div class="continuity-controls"><label id="continuityNameLabel">REFERENCE <input id="continuityName" type="text" maxlength="60"></label><select id="continuitySelect"></select></div><div class="actions" style="margin-top:8px"><button id="continuitySave" class="btn primary" type="button"></button><button id="continuityCompare" class="btn secondary" type="button"></button><button id="continuityDelete" class="btn secondary" type="button"></button></div><div id="continuityResults" class="continuity-results"></div><div id="continuityStatus" class="continuity-status"></div></div>';page.appendChild(card);const saved=document.createElement('div');saved.id='continuitySavedScenes';card.appendChild(saved);mountSavedComparison(saved);E('continuitySave').addEventListener('click',saveRef);E('continuityCompare').addEventListener('click',compare);E('continuityDelete').addEventListener('click',delRef);E('continuitySelect').addEventListener('change',()=>{state.activeId=E('continuitySelect').value||null;persist();compare()});if(typeof window.setLanguage==='function'&&!window.__continuityLangHook){const old=window.setLanguage;window.__continuityLangHook=true;window.setLanguage=function(l){old(l);setTimeout(translate,0)}}translate();return true}
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},100);
})();
