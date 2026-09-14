(function(){
  'use strict';
  const TXT={
    sr:{title:'Kalkulator senke',height:'VISINA OSOBE / OBJEKTA',meters:'m',length:'DUŽINA SENKE',direction:'SMER SENKE',ratio:'ODNOS',note:'Unesi stvarnu visinu osobe ili objekta. Dužina senke se računa za izabrani datum, vreme i lokaciju.',below:'Sunce je ispod horizonta — nema direktne senke.'},
    en:{title:'Shadow calculator',height:'PERSON / OBJECT HEIGHT',meters:'m',length:'SHADOW LENGTH',direction:'SHADOW DIRECTION',ratio:'RATIO',note:'Enter the real height of the person or object. Shadow length uses the selected date, time and location.',below:'Sun is below the horizon — no direct shadow.'}
  };
  const el=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  const norm=a=>(a%360+360)%360;
  function compass(a){
    const dirs=lang()==='sr'?['S','SI','I','JI','J','JZ','Z','SZ']:['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(norm(a)/45)%8];
  }
  function inputDate(){
    const dv=el('sunDate')?.value,tv=el('sunTime')?.value||'12:00';
    if(!dv)return new Date();
    const d=dv.split('-').map(Number),tm=tv.split(':').map(Number);
    return new Date(d[0],d[1]-1,d[2],tm[0]||0,tm[1]||0,0,0);
  }
  function update(){
    if(!el('sunShadowTool')||!window.LightingAISun)return;
    const lat=Number(el('sunLat')?.value),lon=Number(el('sunLon')?.value),height=Number(el('sunObjectHeight')?.value),tx=t();
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||!Number.isFinite(height)||height<=0)return;
    const s=LightingAISun.shadow(inputDate(),lat,lon);
    if(s.lengthRatio===null){
      el('sunRealShadowLength').textContent='—';el('sunRealShadowDirection').textContent='—';el('sunRealShadowRatio').textContent='—';el('sunShadowToolStatus').textContent=tx.below;return;
    }
    const real=height*s.lengthRatio;
    el('sunRealShadowLength').textContent=(real<10?real.toFixed(2):real.toFixed(1))+' '+tx.meters;
    el('sunRealShadowDirection').textContent=s.azimuth.toFixed(0)+'° '+compass(s.azimuth);
    el('sunRealShadowRatio').textContent='× '+s.lengthRatio.toFixed(s.lengthRatio<10?2:1);
    el('sunShadowToolStatus').textContent=tx.note;
  }
  function translate(){
    if(!el('sunShadowTool'))return;
    const tx=t();
    el('sunShadowToolTitle').textContent=tx.title;el('sunObjectHeightLabel').textContent=tx.height;el('sunRealShadowLengthLabel').textContent=tx.length;el('sunRealShadowDirectionLabel').textContent=tx.direction;el('sunRealShadowRatioLabel').textContent=tx.ratio;update();
  }
  function init(){
    const sun=el('sunce');if(!sun||el('sunShadowTool'))return false;
    const shoot=el('sunShootTitle')?.closest('.card');
    const card=document.createElement('div');card.className='card';card.id='sunShadowTool';
    card.innerHTML='<h2 id="sunShadowToolTitle" style="margin-top:0"></h2><label class="caption" id="sunObjectHeightLabel"></label><div class="sun-shadow-height"><input id="sunObjectHeight" type="number" min="0.01" step="0.01" value="1.80"><span>m</span></div><div class="sun-shadow-results"><div class="sun-metric"><span id="sunRealShadowLengthLabel"></span><b id="sunRealShadowLength">—</b></div><div class="sun-metric"><span id="sunRealShadowDirectionLabel"></span><b id="sunRealShadowDirection">—</b></div><div class="sun-metric"><span id="sunRealShadowRatioLabel"></span><b id="sunRealShadowRatio">—</b></div></div><div id="sunShadowToolStatus" class="sun-status"></div>';
    const style=document.createElement('style');style.textContent='.sun-shadow-height{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.sun-shadow-height span{color:#9299a3;font-weight:700}.sun-shadow-results{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}@media(max-width:520px){.sun-shadow-results{grid-template-columns:1fr}}';document.head.appendChild(style);
    if(shoot&&shoot.nextSibling)shoot.parentNode.insertBefore(card,shoot.nextSibling);else if(shoot)shoot.parentNode.appendChild(card);else sun.appendChild(card);
    el('sunObjectHeight').addEventListener('input',update);
    ['sunDate','sunTime','sunLat','sunLon'].forEach(id=>el(id)?.addEventListener('change',update));
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}
    translate();return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},100);
})();
