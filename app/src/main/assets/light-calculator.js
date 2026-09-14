(function(){
  'use strict';

  const CALIBRATION_CONSTANT = 250;
  const VERIFIED = [
    {
      id:'arri-skypanel-s60-c-5600-standard',
      fixtureId:'arri-skypanel-s60-c',
      manufacturer:'ARRI',
      model:'SkyPanel S60-C',
      labelSr:'ARRI SkyPanel S60-C · 5600 K · Standard Diffusion',
      labelEn:'ARRI SkyPanel S60-C · 5600 K · Standard Diffusion',
      cctK:5600,
      refDistanceM:5,
      refLux:553,
      source:'ARRI Classic SkyPanel Technical Specifications'
    },
    {
      id:'arri-skypanel-s60-c-3200-standard',
      fixtureId:'arri-skypanel-s60-c',
      manufacturer:'ARRI',
      model:'SkyPanel S60-C',
      labelSr:'ARRI SkyPanel S60-C · 3200 K · Standard Diffusion',
      labelEn:'ARRI SkyPanel S60-C · 3200 K · Standard Diffusion',
      cctK:3200,
      refDistanceM:5,
      refLux:470,
      source:'ARRI Classic SkyPanel Technical Specifications'
    }
  ];

  const TXT={
    sr:{
      title:'💡 Kalkulator svetla',
      intro:'Procena količine svetla i blende za zadatu lampu, udaljenost i podešavanja kamere. Koristi samo proverene fotometrijske profile ili ručno unet lux.',
      source:'IZVOR SVETLA',manual:'Ručno unet lux',distance:'UDALJENOST LAMPE DO SUBJEKTA',manualLux:'LUX NA SUBJEKTU',iso:'ISO',fps:'FPS',shutter:'SHUTTER UGAO',nd:'ND / GUBITAK SVETLA',
      resultLux:'PROCENA NA SUBJEKTU',aperture:'PROCENA BLENDE',exposure:'EKSPOZICIJA',calculate:'IZRAČUNAJ',
      verified:'PROVEREN PROFIL',manualMode:'RUČNI LUX',ref:'Referenca',at:'na',fc:'fc',seconds:'s',nearest:'najbliže',
      note:'Proračun blende koristi incidentnu aproksimaciju N²/t = E×ISO/250. Stvarni rezultat zavisi od transmisije objektiva, refleksije scene, dodataka, difuzije, ugla i kalibracije svetlomera.',
      inverse:'Za profil lampe koristi se zakon obrnutog kvadrata od zvanične referentne fotometrije. Ovo je najbolja procena na osi u istoj optičkoj konfiguraciji.',
      invalid:'Proveri unesene vrednosti.',noProfile:'Za ovu lampu još nema verifikovanog fotometrijskog profila — koristi ručni lux.',
      customProfile:'Katalog · verifikovana fotometrija'
    },
    en:{
      title:'💡 Light Calculator',
      intro:'Estimate illuminance and aperture from a fixture, distance and camera settings. Only verified photometric profiles or manually entered lux are used.',
      source:'LIGHT SOURCE',manual:'Manual lux input',distance:'FIXTURE TO SUBJECT DISTANCE',manualLux:'LUX AT SUBJECT',iso:'ISO',fps:'FPS',shutter:'SHUTTER ANGLE',nd:'ND / LIGHT LOSS',
      resultLux:'ESTIMATE AT SUBJECT',aperture:'APERTURE ESTIMATE',exposure:'EXPOSURE',calculate:'CALCULATE',
      verified:'VERIFIED PROFILE',manualMode:'MANUAL LUX',ref:'Reference',at:'at',fc:'fc',seconds:'s',nearest:'nearest',
      note:'Aperture uses the incident-light approximation N²/t = E×ISO/250. Real exposure also depends on lens transmission, scene reflectance, modifiers, diffusion, angle and meter calibration.',
      inverse:'Fixture profiles use the inverse-square law from the official reference photometry. This is an on-axis estimate in the same optical configuration.',
      invalid:'Check the entered values.',noProfile:'This fixture does not have a verified photometric profile yet — use manual lux.',
      customProfile:'Catalog · verified photometry'
    }
  };

  const E=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  const num=(id,fallback)=>{const v=Number(String(E(id)?.value??'').replace(',','.'));return Number.isFinite(v)?v:fallback};
  const fmt=(v,d=1)=>Number(v).toFixed(d).replace('.',lang()==='sr'?',':'.');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function catalogProfiles(){
    const fixtures=Array.isArray(window.catalogFixtures)?window.catalogFixtures:[];
    const out=[];
    fixtures.forEach(f=>{
      const p=f&&f.photometrics;
      const profiles=Array.isArray(p)?p:(Array.isArray(p?.profiles)?p.profiles:[]);
      profiles.forEach((x,i)=>{
        const lux=Number(x.refLux??x.lux),distance=Number(x.refDistanceM??x.distanceM);
        if(!Number.isFinite(lux)||lux<=0||!Number.isFinite(distance)||distance<=0)return;
        out.push({
          id:'catalog-'+f.id+'-'+(x.id||i),fixtureId:f.id,manufacturer:f.manufacturer||'',model:f.model||f.id,
          labelSr:x.labelSr||x.label||((f.manufacturer||'')+' '+(f.model||f.id)+' · '+(x.cctK?x.cctK+' K':'fotometrija')),
          labelEn:x.labelEn||x.label||((f.manufacturer||'')+' '+(f.model||f.id)+' · '+(x.cctK?x.cctK+' K':'photometry')),
          cctK:x.cctK,refDistanceM:distance,refLux:lux,source:x.source||f.sourceUrl||''
        });
      });
    });
    return out;
  }

  function profiles(){
    const map=new Map();
    [...VERIFIED,...catalogProfiles()].forEach(p=>{if(!map.has(p.id))map.set(p.id,p)});
    return [...map.values()];
  }

  function sourceOptions(){
    const select=E('lightCalcSource');if(!select)return;
    const old=select.value;
    let h='<option value="manual">'+esc(t().manual)+'</option>';
    profiles().forEach(p=>{h+='<option value="'+esc(p.id)+'">'+esc(lang()==='sr'?p.labelSr:p.labelEn)+'</option>'});
    select.innerHTML=h;
    select.value=[...select.options].some(o=>o.value===old)?old:(profiles()[0]?.id||'manual');
    updateMode();
  }

  function chosenProfile(){
    const id=E('lightCalcSource')?.value;
    return profiles().find(p=>p.id===id)||null;
  }

  function updateMode(){
    const p=chosenProfile();
    const manual=E('lightCalcManualWrap'),distance=E('lightCalcDistanceWrap'),badge=E('lightCalcBadge'),ref=E('lightCalcReference');
    if(manual)manual.style.display=p?'none':'block';
    if(distance)distance.style.display=p?'block':'none';
    if(badge){badge.textContent=p?t().verified:t().manualMode;badge.className='light-calc-badge '+(p?'verified':'manual')}
    if(ref){
      ref.textContent=p?(t().ref+': '+fmt(p.refLux,0)+' lux '+t().at+' '+fmt(p.refDistanceM,1)+' m'+(p.cctK?' · '+p.cctK+' K':'')+' · '+p.source):'';
    }
    calculate();
  }

  function nearestStop(n){
    const stops=[0.7,0.8,0.9,1,1.1,1.2,1.4,1.6,1.8,2,2.2,2.5,2.8,3.2,3.5,4,4.5,5,5.6,6.3,7.1,8,9,10,11,13,14,16,18,20,22,25,29,32];
    return stops.reduce((a,b)=>Math.abs(b-n)<Math.abs(a-n)?b:a,stops[0]);
  }

  function calculate(){
    if(!E('lightCalcCard'))return;
    const p=chosenProfile();
    const iso=num('lightCalcIso',800),fps=num('lightCalcFps',24),shutter=num('lightCalcShutter',180),nd=num('lightCalcNd',0);
    let lux;
    if(p){
      const d=num('lightCalcDistance',3);
      lux=d>0?p.refLux*Math.pow(p.refDistanceM/d,2):NaN;
    } else lux=num('lightCalcManualLux',1000);

    if(!(lux>0)||!(iso>0)||!(fps>0)||!(shutter>0)||shutter>360||nd<0){
      E('lightCalcLux').textContent='—';E('lightCalcAperture').textContent='—';E('lightCalcExposure').textContent=t().invalid;return;
    }
    const effectiveLux=lux/Math.pow(2,nd);
    const exposureTime=shutter/(360*fps);
    const n=Math.sqrt(effectiveLux*iso*exposureTime/CALIBRATION_CONSTANT);
    const fc=lux/10.76391;
    const near=nearestStop(n);
    E('lightCalcLux').innerHTML='<b>'+fmt(lux,lux>=100?0:1)+' lux</b><small>'+fmt(fc,1)+' '+t().fc+(nd>0?' · '+fmt(effectiveLux,effectiveLux>=100?0:1)+' lux posle ND':'')+'</small>';
    E('lightCalcAperture').innerHTML='<b>f/'+fmt(n,1)+'</b><small>'+t().nearest+' f/'+fmt(near,1)+'</small>';
    E('lightCalcExposure').innerHTML='<b>1/'+fmt(1/exposureTime,0)+' '+t().seconds+'</b><small>'+fmt(shutter,0)+'° · '+fmt(fps,2).replace(/,00$|\.00$/,'')+' fps · ISO '+fmt(iso,0)+'</small>';
  }

  function translate(){
    if(!E('lightCalcCard'))return;const x=t();
    E('lightCalcTitle').textContent=x.title;E('lightCalcIntro').textContent=x.intro;E('lightCalcSourceLabel').textContent=x.source;
    E('lightCalcDistanceLabel').textContent=x.distance;E('lightCalcManualLabel').textContent=x.manualLux;E('lightCalcIsoLabel').textContent=x.iso;E('lightCalcFpsLabel').textContent=x.fps;E('lightCalcShutterLabel').textContent=x.shutter;E('lightCalcNdLabel').textContent=x.nd;
    E('lightCalcLuxLabel').textContent=x.resultLux;E('lightCalcApertureLabel').textContent=x.aperture;E('lightCalcExposureLabel').textContent=x.exposure;E('lightCalcButton').textContent=x.calculate;
    E('lightCalcNote').textContent=x.note;E('lightCalcInverse').textContent=x.inverse;sourceOptions();
  }

  function init(){
    const planner=E('planner');if(!planner||E('lightCalcCard'))return false;
    const style=document.createElement('style');
    style.textContent='.light-calc-card{overflow:hidden}.light-calc-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.light-calc-badge{font-size:10px;font-weight:800;border-radius:999px;padding:6px 9px;white-space:nowrap}.light-calc-badge.verified{background:#163025;color:#b8f0d1}.light-calc-badge.manual{background:#342e18;color:#f5dd91}.light-calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.light-calc-result{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px;min-height:82px}.light-calc-result small{display:block;color:#9299a3;margin-bottom:7px}.light-calc-result b{display:block;color:#f5c542;font-size:23px}.light-calc-result b+small{margin-top:4px;margin-bottom:0;font-size:11px}.light-calc-note{color:#9299a3;font-size:12px;line-height:1.45;margin-top:10px}.light-calc-ref{color:#9299a3;font-size:11px;line-height:1.4;margin:8px 0}.light-calc-button{width:100%;margin-top:12px}@media(max-width:520px){.light-calc-grid{grid-template-columns:1fr 1fr}}';
    document.head.appendChild(style);
    const card=document.createElement('div');card.id='lightCalcCard';card.className='card light-calc-card';
    card.innerHTML='<div class="light-calc-head"><h2 id="lightCalcTitle" style="margin:0"></h2><span id="lightCalcBadge" class="light-calc-badge"></span></div><p id="lightCalcIntro" class="muted small"></p><label id="lightCalcSourceLabel" class="caption"></label><select id="lightCalcSource"></select><div id="lightCalcReference" class="light-calc-ref"></div><div class="light-calc-grid"><div id="lightCalcDistanceWrap"><label id="lightCalcDistanceLabel" class="caption"></label><input id="lightCalcDistance" type="number" min="0.2" max="100" step="0.1" value="3.0"></div><div id="lightCalcManualWrap"><label id="lightCalcManualLabel" class="caption"></label><input id="lightCalcManualLux" type="number" min="0.1" step="1" value="1000"></div><div><label id="lightCalcIsoLabel" class="caption"></label><input id="lightCalcIso" type="number" min="1" step="50" value="800"></div><div><label id="lightCalcFpsLabel" class="caption"></label><input id="lightCalcFps" type="number" min="1" step="0.01" value="24"></div><div><label id="lightCalcShutterLabel" class="caption"></label><input id="lightCalcShutter" type="number" min="1" max="360" step="1" value="180"></div><div><label id="lightCalcNdLabel" class="caption"></label><select id="lightCalcNd"><option value="0">0 stop</option><option value="1">1 stop</option><option value="2">2 stop</option><option value="3">3 stop</option><option value="4">4 stop</option><option value="5">5 stop</option><option value="6">6 stop</option></select></div></div><button id="lightCalcButton" class="btn primary light-calc-button" type="button"></button><div class="light-calc-grid" style="margin-top:12px"><div class="light-calc-result"><small id="lightCalcLuxLabel"></small><div id="lightCalcLux">—</div></div><div class="light-calc-result"><small id="lightCalcApertureLabel"></small><div id="lightCalcAperture">—</div></div><div class="light-calc-result" style="grid-column:1/-1"><small id="lightCalcExposureLabel"></small><div id="lightCalcExposure">—</div></div></div><div id="lightCalcInverse" class="light-calc-note"></div><div id="lightCalcNote" class="light-calc-note"></div>';
    const anchor=E('sceneMeasureCard')||E('apiStatus');
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(card,anchor.nextSibling);else planner.insertBefore(card,planner.firstChild);
    ['lightCalcDistance','lightCalcManualLux','lightCalcIso','lightCalcFps','lightCalcShutter','lightCalcNd'].forEach(id=>E(id).addEventListener('input',calculate));
    E('lightCalcSource').addEventListener('change',updateMode);E('lightCalcButton').addEventListener('click',calculate);
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
    translate();
    let lastCount=-1;const refresh=setInterval(()=>{const count=Array.isArray(window.catalogFixtures)?window.catalogFixtures.length:0;if(count!==lastCount){lastCount=count;sourceOptions()}if(count>0)clearInterval(refresh)},500);
    setTimeout(()=>clearInterval(refresh),12000);
    return true;
  }

  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},100);
})();
