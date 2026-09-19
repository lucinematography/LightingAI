(function(){
'use strict';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{title:'📡 ART-NET CONTROL',intro:'Pošalji stvarne Art-Net DMX vrednosti preko Wi-Fi mreže. Za sada koristi ručni test kanala dok ne dodamo verifikovane DMX profile po modelu.',target:'ART-NET NODE / IP',universe:'UNIVERSE',channel:'DMX KANAL',value:'VREDNOST',send:'POŠALJI TEST',blackout:'BLACKOUT UNIVERSE',ready:'Spremno za slanje.',sending:'Šaljem Art-Net…',sent:'Art-Net paket je poslat.',error:'Slanje nije uspelo.',native:'Art-Net zahteva Android build.',patch:'DMX Patch je povezan; universe i adrese ostaju iz postojećeg planera.'},
 en:{title:'📡 ART-NET CONTROL',intro:'Send real Art-Net DMX values over Wi-Fi. Manual channel testing is used until verified per-model DMX profiles are added.',target:'ART-NET NODE / IP',universe:'UNIVERSE',channel:'DMX CHANNEL',value:'VALUE',send:'SEND TEST',blackout:'BLACKOUT UNIVERSE',ready:'Ready to send.',sending:'Sending Art-Net…',sent:'Art-Net packet sent.',error:'Send failed.',native:'Art-Net requires the Android build.',patch:'DMX Patch is connected; universes and addresses remain in the existing planner.'}
};
const t=()=>TXT[lang()];
let seq=0;
function status(s,ok){const el=E('artnetStatus');if(!el)return;el.textContent=s;el.style.color=ok===false?'#ffb5b5':ok===true?'#b8f0d1':'#9299a3';}
function snapshot(){try{return window.LightingAIDmxSnapshot?window.LightingAIDmxSnapshot():null}catch(e){return null}}
function defaultUniverse(){const s=snapshot();return s&&Array.isArray(s.universes)&&s.universes.length?s.universes[0]:1}
function sendFrame(channels,universe){
 if(!window.Android||typeof Android.artNetSendDmx!=='function'){status(t().native,false);return}
 const ip=(E('artnetTarget')&&E('artnetTarget').value||'255.255.255.255').trim();
 const id='artnet_'+Date.now()+'_'+(++seq);
 status(t().sending);
 try{Android.artNetSendDmx(id,ip,Number(universe)||1,JSON.stringify(channels));}
 catch(e){status(t().error,false)}
}
function sendTest(){
 const u=Math.max(1,Number(E('artnetUniverse').value)||1);
 const ch=Math.min(512,Math.max(1,Number(E('artnetChannel').value)||1));
 const v=Math.min(255,Math.max(0,Number(E('artnetValue').value)||0));
 const frame=new Array(Math.max(2,ch)).fill(0);frame[ch-1]=v;sendFrame(frame,u);
}
function blackout(){
 const u=Math.max(1,Number(E('artnetUniverse').value)||1);
 sendFrame(new Array(512).fill(0),u);
}
window.LightingAIArtNetResult=function(id,ok,message){
 status(ok?t().sent:(message||t().error),!!ok);
};
function translate(){if(!E('artnetCard'))return;const x=t();E('artnetTitle').textContent=x.title;E('artnetIntro').textContent=x.intro;E('artnetTargetLabel').textContent=x.target;E('artnetUniverseLabel').textContent=x.universe;E('artnetChannelLabel').textContent=x.channel;E('artnetValueLabel').textContent=x.value;E('artnetSend').textContent=x.send;E('artnetBlackout').textContent=x.blackout;E('artnetPatchHint').textContent=x.patch;if(!E('artnetStatus').textContent)status(x.ready);}
function install(){
 const page=E('equipment');if(!page||E('artnetCard'))return false;
 const card=document.createElement('details');card.id='artnetCard';card.className='card';card.style.border='1px solid #31506b';
 card.innerHTML='<summary style="font-weight:900;font-size:20px;cursor:pointer"><span id="artnetTitle"></span></summary><div style="margin-top:12px"><p id="artnetIntro" class="muted small"></p><div class="row"><div><label class="caption" id="artnetTargetLabel"></label><input id="artnetTarget" value="255.255.255.255" inputmode="decimal"></div><div><label class="caption" id="artnetUniverseLabel"></label><input id="artnetUniverse" type="number" min="1" max="32768"></div></div><div class="row"><div><label class="caption" id="artnetChannelLabel"></label><input id="artnetChannel" type="number" min="1" max="512" value="1"></div><div><label class="caption" id="artnetValueLabel"></label><input id="artnetValue" type="range" min="0" max="255" value="0"><div id="artnetValueReadout" class="muted small" style="margin-top:5px">0 / 255</div></div></div><div class="actions"><button id="artnetSend" class="btn primary" type="button"></button><button id="artnetBlackout" class="btn danger" type="button"></button></div><div id="artnetStatus" class="muted small" style="margin-top:8px"></div><div id="artnetPatchHint" class="muted small" style="margin-top:8px"></div></div>';
 const dmx=E('dmxCard');if(dmx&&dmx.parentNode)dmx.parentNode.insertBefore(card,dmx.nextSibling);else page.appendChild(card);
 E('artnetUniverse').value=defaultUniverse();
 E('artnetValue').addEventListener('input',()=>{E('artnetValueReadout').textContent=E('artnetValue').value+' / 255'});
 E('artnetSend').addEventListener('click',sendTest);E('artnetBlackout').addEventListener('click',blackout);
 translate();return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>160)clearInterval(timer)},100);
const old=window.setLanguage;if(typeof old==='function'&&!window.__artNetLangHook){window.__artNetLangHook=true;window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
})();