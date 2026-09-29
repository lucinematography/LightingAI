import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRuntimeCatalog } from './catalog-runtime.js';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'app/src/main/assets/control-system-drivers.js'),'utf8');
const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

for(const marker of [
  "standards-native-network",
  "standards-dmx-gateway",
  "vendor-astera-wireless",
  "vendor-aputure-sidus",
  "vendor-godox-app",
  "vendor-aladdin-app",
  "version:'1.3-native-network-gateway-separated'"
]) expect(src.includes(marker),'driver registry missing '+marker);

const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(src,sandbox);
const api=sandbox.window.LightingAIControlSystemDrivers;
expect(!!api,'driver registry API missing');
const verifiedMode={name:'Test 1ch',channels:1,verified:true,sourceUrl:'https://example.invalid/dmx.pdf',controls:[{key:'dimmer',channel:1,type:'percent'}]};
const native=api&&api.resolve({control:{directLightingAI:['Art-Net']},dmxModes:[verifiedMode]});
expect(native?.productionDriver?.id==='standards-native-network','explicit direct Art-Net must resolve native-network');
const bridged=api&&api.resolve({control:{directLightingAI:['Art-Net via PowerBox bridge','sACN via FP3 DataLink'],wired:['DMX512']},dmxModes:[verifiedMode]});
expect(bridged?.productionDriver?.id==='standards-dmx-gateway','network text that explicitly requires a bridge must resolve through the standards gateway');
const etherOnly=api&&api.resolve({control:{wired:['EtherCON']},dmxModes:[verifiedMode]});
expect(etherOnly?.productionReady===false,'EtherCON connector alone must not become production network control');
const unavailableOnly=api&&api.resolve({control:{unavailableDirectProtocols:['DMX not available']},dmxModes:[verifiedMode]});
expect(unavailableOnly?.productionReady===false,'unavailable protocol text must not create a production route');
const legacyUnavailable=api&&api.resolve({control:['Bluetooth','DMX unavailable'],dmxModes:[verifiedMode]});
expect(legacyUnavailable?.productionReady===false&&legacyUnavailable?.transportKnown===false,'negative legacy DMX text must not create a production route');
const researchOnly=api&&api.resolve({manufacturer:'Astera',control:{wireless:['AsteraApp via Bluetooth']},dmxModes:[]});
expect(researchOnly?.vendorResearchOnly===true&&researchOnly?.productionReady===false,'Astera proprietary wireless must remain research-only without a standard route');
const noSource=api&&api.resolve({control:{wired:['DMX512']},dmxModes:[{name:'Unsafe',channels:1,verified:true}]});
expect(noSource?.productionReady===false,'verified DMX mode without source URL must fail closed');
const rdmOnly=api&&api.resolve({control:{wired:['RDM']},dmxModes:[verifiedMode]});
expect(rdmOnly?.productionReady===false&&rdmOnly?.transportKnown===false,'RDM-only fixture must not qualify as a level-control route');

const routingSrc=fs.readFileSync(path.join(root,'app/src/main/assets/control-routing.js'),'utf8');
const routingSandbox={window:{}};
vm.createContext(routingSandbox);
vm.runInContext(routingSrc,routingSandbox);
const routingApi=routingSandbox.window.LightingAIControlRouting;
const vendorLabRoute=routingApi&&routingApi.classify({manufacturer:'Astera',control:{wireless:['AsteraApp via Bluetooth']},dmxModes:[]});
expect(vendorLabRoute?.route==='vendor-wireless'&&vendorLabRoute?.semanticReady===false&&vendorLabRoute?.transportReady===false,'vendor lab route must never become production ready');
const rdmFallback=routingApi&&routingApi.classify({control:{wired:['RDM']},dmxModes:[verifiedMode]});
expect(routingApi&&routingSrc.includes("version:'1.6-production-vendor-lab-separated'"),'Fallback control router version marker missing');
expect(rdmFallback?.dmx===false&&rdmFallback?.transportReady===false&&rdmFallback?.semanticReady===false,'Fallback router must not treat RDM-only metadata as level control');

const {fixtures}=buildRuntimeCatalog();
const manufacturers=new Set(fixtures.map(f=>f.manufacturer).filter(Boolean));
for(const maker of ['Astera','Aputure','ARRI','Godox','Aladdin']) expect(manufacturers.has(maker),'catalog missing '+maker);

const astera=fixtures.filter(f=>f.manufacturer==='Astera');
const titan=fixtures.find(f=>f.id==='astera-titantube-fp1');
expect(!!titan,'TitanTube FP1 fixture missing');
const titanResolved=titan&&api.resolve(titan);
expect(
  titanResolved?.productionDriver?.id==='standards-dmx-gateway' &&
  Array.isArray(titanResolved?.vendorDrivers) &&
  titanResolved.vendorDrivers.some(d=>d?.id==='vendor-astera-wireless'&&d?.status==='research') &&
  titanResolved?.productionReady===true,
  'Titan production route must stay standards-based while BTB remains research-only'
);
for(const id of ['astera-ax2-50-pixelbar','astera-ax2-100-pixelbar','astera-ax3-lightdrop','astera-heliostube-fp2-btb','astera-hyperiontube-fp3','astera-hydrapanel-fp6']){
  const fixture=fixtures.find(f=>f.id===id);
  expect(!!fixture,'Astera fixture missing for source provenance: '+id);
  for(const mode of (fixture?.dmxModes||[]).filter(m=>m?.verified===true)){
    expect(String(mode.sourceUrl||'').startsWith('https://astera-led.com/'),'Verified Astera DMX mode must use official Astera source: '+id);
  }
}
const aputure=fixtures.filter(f=>f.manufacturer==='Aputure');
expect(astera.length>0,'Astera catalog empty');
expect(aputure.length>0,'Aputure catalog empty');
expect(astera.some(f=>Array.isArray(f.dmxModes)&&f.dmxModes.some(m=>m?.verified===true)),'No verified Astera DMX profile');
expect(aputure.some(f=>Array.isArray(f.dmxModes)&&f.dmxModes.some(m=>m?.verified===true)),'No verified Aputure DMX profile');
const pb12=fixtures.find(f=>f.id==='aputure-infinibar-pb12');
expect(!!pb12,'Aputure INFINIBAR PB12 fixture missing');
const pb12Resolved=pb12&&api.resolve(pb12);
expect(pb12Resolved?.productionDriver?.id==='standards-dmx-gateway','PB12 standard DMX/CRMX route missing');
expect((pb12?.dmxModes||[]).some(m=>m?.name==='Mode 2 CCT 4ch'&&m?.verified===true&&m?.channels===4),'PB12 verified Mode 2 CCT profile missing');
expect((pb12?.dmxModes||[]).some(m=>m?.name==='Mode 4 RGB 5ch'&&m?.verified===true&&m?.channels===5),'PB12 verified Mode 4 RGB profile missing');
const storm400x=fixtures.find(f=>f.id==='aputure-storm-400x');
expect(!!storm400x,'Aputure STORM 400x fixture missing');
expect((storm400x?.dmxModes||[]).some(m=>m?.name==='Profile 1 CCT+ 8 Bit 3ch'&&m?.verified===true&&m?.channels===3),'STORM 400x verified CCT+ profile missing');
expect((storm400x?.dmxModes||[]).some(m=>Array.isArray(m?.requiredChannels)&&m.requiredChannels.some(r=>r?.channel===3&&r?.value===137)),'STORM 400x neutral green requirement missing');

const storm700x=fixtures.find(f=>f.id==='aputure-storm-700x');
expect(!!storm700x,'Aputure STORM 700x fixture missing');
expect((storm700x?.dmxModes||[]).some(m=>m?.name==='Profile 1 CCT+ 8 Bit 3ch'&&m?.verified===true&&m?.channels===3),'STORM 700x verified CCT+ profile missing');
expect((storm700x?.dmxModes||[]).some(m=>Array.isArray(m?.requiredChannels)&&m.requiredChannels.some(r=>r?.channel===3&&r?.value===137)),'STORM 700x neutral green requirement missing');

for(const id of ['astera-lunabulb-fp7-e26','astera-lunabulb-fp7-e27','astera-lunabulb-fp7-b22']){
  const fixture=fixtures.find(f=>f.id===id);
  expect(!!fixture,'Astera LunaBulb fixture missing: '+id);
  expect((fixture?.dmxModes||[]).some(m=>m?.name==='Profile 4 DIM RGB 4ch'&&m?.verified===true&&m?.channels===4),'LunaBulb verified DIM RGB profile missing: '+id);
}

const quikBeam=fixtures.find(f=>f.id==='astera-quikbeam');
expect(!!quikBeam,'Astera QuikBeam fixture missing');
expect((quikBeam?.dmxModes||[]).some(m=>m?.name==='Profile 4 DIM RGB 4ch'&&m?.verified===true&&m?.channels===4),'QuikBeam verified DIM RGB profile missing');
const quikPunch=fixtures.find(f=>f.id==='astera-quikpunch');
expect(!!quikPunch,'Astera QuikPunch fixture missing');
expect((quikPunch?.dmxModes||[]).some(m=>m?.name==='Profile 4 DIM RGB 4ch'&&m?.verified===true&&m?.channels===4),'QuikPunch verified DIM RGB profile missing');

const nyx=fixtures.find(f=>f.id==='astera-nyx-bulb');
expect(!!nyx,'Astera NYX Bulb fixture missing');
expect((nyx?.dmxModes||[]).some(m=>m?.name==='Profile 4 DIM RGB 4ch'&&m?.verified===true&&m?.channels===4),'NYX Bulb verified DIM RGB profile missing');
const ax1=fixtures.find(f=>f.id==='astera-ax1-pixeltube');
expect(!!ax1,'Astera AX1 PixelTube fixture missing');
expect((ax1?.dmxModes||[]).some(m=>m?.name==='Profile 4 DIM RGB 4ch'&&m?.verified===true&&m?.channels===4),'AX1 verified DIM RGB profile missing');

const ax7=fixtures.find(f=>f.id==='astera-ax7-spotlite');
expect(!!ax7,'Astera AX7 SpotLite fixture missing');
expect((ax7?.dmxModes||[]).some(m=>m?.name==='DIM RGB 4ch (Strobe Off)'&&m?.verified===true&&m?.channels===4&&String(m?.sourceUrl||'').includes('astera-led.com/products/ax7-spotlite')),'AX7 verified DIM RGB profile must use AX7-specific identity and official Astera source');
expect(!(ax7?.dmxModes||[]).some(m=>String(m?.sourceUrl||'').includes('ax3-dmx-profiles')),'AX7 must not cite AX3 DMX profiles as its verified source');

const storm80c=fixtures.find(f=>f.id==='aputure-storm-80c');
expect(!!storm80c,'Aputure STORM 80c fixture missing');
expect((storm80c?.dmxModes||[]).some(m=>m?.name==='Profile 27 CCT+ 8 Bit 3ch'&&m?.verified===true&&m?.channels===3),'STORM 80c verified CCT+ profile missing');
expect((storm80c?.dmxModes||[]).some(m=>m?.name==='Profile 23 iRGB 8 Bit 4ch'&&m?.verified===true&&m?.channels===4),'STORM 80c verified iRGB profile missing');
const m600r=fixtures.find(f=>f.id==='godox-m600r');
expect(!!m600r,'Godox M600R fixture missing');
const m600rResolved=m600r&&api.resolve(m600r);
expect(m600rResolved?.productionDriver?.id==='standards-native-network','Godox M600R native Art-Net/sACN route missing');
expect((m600r?.dmxModes||[]).some(m=>m?.name==='01 CCT 8Bit 3ch'&&m?.verified===true&&m?.channels===3),'Godox M600R verified CCT profile missing');
expect((m600r?.dmxModes||[]).some(m=>m?.name==='03 RGB 8Bit 4ch'&&m?.verified===true&&m?.channels===4),'Godox M600R verified RGB profile missing');

for(const id of ['arri-skypanel-x21','arri-skypanel-x22','arri-skypanel-x23']){
  const fixture=fixtures.find(f=>f.id===id);
  expect(!!fixture,'SkyPanel X fixture missing: '+id);
  const resolved=fixture&&api.resolve(fixture);
  expect(resolved?.productionDriver?.id==='standards-native-network','SkyPanel X native Art-Net/sACN route missing: '+id);
  expect(resolved?.verifiedDmxModeCount>=1,'SkyPanel X verified DMX mode missing: '+id);
}

console.log(JSON.stringify({ok:failures.length===0,fixtures:fixtures.length,manufacturers:[...manufacturers].sort(),failures},null,2));
if(failures.length)process.exit(1);
