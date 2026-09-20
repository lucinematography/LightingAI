import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='EV Light');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='EV Light');
const expected=[
  'evlight-gem1x1bi',
  'evlight-gem1x1fc',
  'evlight-gem2x1bi',
  'evlight-gem2x1st',
  'evlight-gemx21-hard',
  'evlight-sp150bi',
  'evlight-sp150fc',
  'evlight-sp350',
  'evlight-sp350bi',
  'evlight-sp350fc',
  'evlight-sp500bi',
  'evlight-sp600',
  'evlight-gemx12',
  'evlight-gemx21-st',
  'evlight-gemx24-hard',
  'evlight-epro100',
  'evlight-epro200z',
  'evlight-ev-sp300z',
  'evlight-epro300z',
  'evlight-epro400rgblac-z',
  'evlight-epro400fc',
  'evlight-epro350fc',
  'evlight-gemx24-st',
  'evlight-gemx28-hard'
];
const ids=new Set(fixtures.map(x=>x.id));
const failures=[];
const EXPECTED_FIXTURE_COUNT=expected.length;
const fixtureIds=fixtures.map(x=>x.id);
const accessoryIds=accessories.map(x=>x.id);
if(fixtures.length!==EXPECTED_FIXTURE_COUNT) failures.push('Unexpected EV Light fixture count: '+fixtures.length+' (expected '+EXPECTED_FIXTURE_COUNT+')');
for(const dup of fixtureIds.filter((id,i,a)=>a.indexOf(id)!==i)) failures.push('Duplicate EV Light fixture id: '+dup);
for(const dup of accessoryIds.filter((id,i,a)=>a.indexOf(id)!==i)) failures.push('Duplicate EV Light accessory id: '+dup);
if(!fixtures.some(x=>x.family==='GEM')) failures.push('Missing EV Light GEM family');
if(!fixtures.some(x=>x.family==='GEMX')) failures.push('Missing EV Light GEMX family');
if(!fixtures.some(x=>x.family==='Fresnel')) failures.push('Missing EV Light Fresnel family');
if(!fixtures.some(x=>x.family==='Profile Spot')) failures.push('Missing EV Light Profile Spot family');
for(const id of expected) if(!ids.has(id)) failures.push('Missing required EV Light fixture: '+id);
for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?evlight(?:professional|pro)\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official EV Light fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked EV Light accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?evlight(?:professional|pro)\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official EV Light accessory source: '+a.id);
  if(!(a.compatibleWith||[]).length) failures.push('EV Light accessory without compatibility targets: '+a.id);
  for(const target of (a.compatibleWith||[])){
    if(!ids.has(target)) failures.push('EV Light accessory targets missing fixture: '+a.id+' -> '+target);
  }
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('evlight-')) failures.push('Broken EV Light compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}
const epro100=fixtures.find(x=>x.id==='evlight-epro100');
if(!epro100) failures.push('Missing EV Light EPRO100 control-route fixture');
else{
  const control=epro100.control||{};
  if(!control.wired?.includes('DMX512 via 3-pin XLR')) failures.push('EV Light EPRO100 DMX512 / 3-pin XLR route missing');
  if(control.wireless?.length) failures.push('EV Light EPRO100 must not claim manufacturer-documented wireless control');
  if(control.builtInCRMX) failures.push('EV Light EPRO100 must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light EPRO100 must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light EPRO100 must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512 control')) failures.push('EV Light EPRO100 wired DMX interface requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light EPRO100 network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light EPRO100 wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightpro.com/profile-spot-light/63349887.html')) failures.push('EV Light EPRO100 official control source missing');
  if(Number(epro100.dmxChannels)!==1) failures.push('EV Light EPRO100 DMX channel count must be 1');
}
const epro200z=fixtures.find(x=>x.id==='evlight-epro200z');
if(!epro200z) failures.push('Missing EV Light EPRO200Z control-route fixture');
else{
  const control=epro200z.control||{};
  if(!control.wired?.includes('DMX512')) failures.push('EV Light EPRO200Z DMX512 route missing');
  if(control.wireless?.length) failures.push('EV Light EPRO200Z must not claim manufacturer-documented wireless control');
  if(control.builtInCRMX) failures.push('EV Light EPRO200Z must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light EPRO200Z must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light EPRO200Z must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512 control')) failures.push('EV Light EPRO200Z wired DMX interface requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light EPRO200Z network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light EPRO200Z wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightpro.com/ellipsoidal-led/62310805.html')) failures.push('EV Light EPRO200Z official control source missing');
  for(const mode of ['1/3CH single color','2/5CH 2in1','3/7CH RGB','4/8CH RGBW']) if(!epro200z.dmxChannelOptions?.includes(mode)) failures.push('EV Light EPRO200Z published DMX channel option missing: '+mode);
}
const evSp300z=fixtures.find(x=>x.id==='evlight-ev-sp300z');
if(!evSp300z) failures.push('Missing EV Light EV SP300Z control-route fixture');
else{
  const control=evSp300z.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('EV Light EV SP300Z wired control path missing: '+item);
  if(control.wireless?.length) failures.push('EV Light EV SP300Z must not claim manufacturer-documented wireless control');
  if(control.builtInCRMX) failures.push('EV Light EV SP300Z must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light EV SP300Z must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light EV SP300Z must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512/RDM control')) failures.push('EV Light EV SP300Z wired DMX/RDM interface requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light EV SP300Z network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light EV SP300Z wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightpro.com/profile-spot-light/62506587.html')) failures.push('EV Light EV SP300Z official control source missing');
  if(Number(evSp300z.dmxChannels)!==10) failures.push('EV Light EV SP300Z DMX channel count must be 10');
}
const epro300z=fixtures.find(x=>x.id==='evlight-epro300z');
if(!epro300z) failures.push('Missing EV Light EPRO300Z control-route fixture');
else{
  const control=epro300z.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('EV Light EPRO300Z wired control path missing: '+item);
  if(control.wireless?.length) failures.push('EV Light EPRO300Z must not claim manufacturer-documented wireless control');
  if(control.builtInCRMX) failures.push('EV Light EPRO300Z must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light EPRO300Z must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light EPRO300Z must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512/RDM control')) failures.push('EV Light EPRO300Z wired DMX/RDM interface requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light EPRO300Z network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light EPRO300Z wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightpro.com/profile-spot-light/62480750.html')) failures.push('EV Light EPRO300Z official control source missing');
  if(Number(epro300z.dmxChannels)!==10) failures.push('EV Light EPRO300Z DMX channel count must be 10');
}
const epro400rgblacZ=fixtures.find(x=>x.id==='evlight-epro400rgblac-z');
if(!epro400rgblacZ) failures.push('Missing EV Light EPRO400RGBLAC-Z control-route fixture');
else{
  const control=epro400rgblacZ.control||{};
  if(control.wired?.length) failures.push('EV Light EPRO400RGBLAC-Z must not claim an unverified wired control protocol');
  if(control.wireless?.length) failures.push('EV Light EPRO400RGBLAC-Z must not claim manufacturer-documented wireless control');
  if(control.builtInCRMX) failures.push('EV Light EPRO400RGBLAC-Z must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light EPRO400RGBLAC-Z must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light EPRO400RGBLAC-Z must not claim direct LightingAI transport');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('DMX512/RDM'))) failures.push('EV Light EPRO400RGBLAC-Z unpublished wired-control limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light EPRO400RGBLAC-Z network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light EPRO400RGBLAC-Z wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightpro.com/download/')) failures.push('EV Light EPRO400RGBLAC-Z official manual source missing');
}
const epro400fc=fixtures.find(x=>x.id==='evlight-epro400fc');
if(!epro400fc) failures.push('Missing EV Light EPRO400FC control-route fixture');
else{
  const control=epro400fc.control||{};
  if(control.wired?.length) failures.push('EV Light EPRO400FC must not claim an unverified wired control protocol');
  if(control.wireless?.length) failures.push('EV Light EPRO400FC must not claim manufacturer-documented wireless control');
  if(control.builtInCRMX) failures.push('EV Light EPRO400FC must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light EPRO400FC must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light EPRO400FC must not claim direct LightingAI transport');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('DMX512/RDM'))) failures.push('EV Light EPRO400FC unpublished wired-control limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light EPRO400FC network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light EPRO400FC wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightpro.com/led-studio-light/')) failures.push('EV Light EPRO400FC official control source missing');
}
const epro350fc=fixtures.find(x=>x.id==='evlight-epro350fc');
if(!epro350fc) failures.push('Missing EV Light EPRO350FC control-route fixture');
else{
  const control=epro350fc.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('EV Light EPRO350FC wired control path missing: '+item);
  if(control.wireless?.length) failures.push('EV Light EPRO350FC must not claim manufacturer-documented wireless control');
  if(control.builtInCRMX) failures.push('EV Light EPRO350FC must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light EPRO350FC must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light EPRO350FC must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512/RDM control')) failures.push('EV Light EPRO350FC wired DMX/RDM interface requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light EPRO350FC network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light EPRO350FC wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightpro.com/profile-spot-light/63631474.html')) failures.push('EV Light EPRO350FC official control source missing');
  if(!Array.isArray(epro350fc.dmxChannelOptions)||!epro350fc.dmxChannelOptions.includes('6CH')||!epro350fc.dmxChannelOptions.includes('10CH')) failures.push('EV Light EPRO350FC DMX channel options must include 6CH and 10CH');
}
const gem1x1bi=fixtures.find(x=>x.id==='evlight-gem1x1bi');
if(!gem1x1bi) failures.push('Missing EV Light GEM1X1BI control-route fixture');
else{
  const control=gem1x1bi.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('EV Light GEM1X1BI wired control path missing: '+item);
  if(control.wireless?.length) failures.push('EV Light GEM1X1BI must not claim manufacturer-documented wireless control');
  if(control.builtInCRMX) failures.push('EV Light GEM1X1BI must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light GEM1X1BI must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light GEM1X1BI must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512/RDM control')) failures.push('EV Light GEM1X1BI wired DMX/RDM interface requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light GEM1X1BI network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light GEM1X1BI wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightprofessional.com/quality-led-soft-light-panel-68277576.html')) failures.push('EV Light GEM1X1BI official control source missing');
  if(gem1x1bi.dmxConnection!=='3-pin XLR or 5-pin XLR') failures.push('EV Light GEM1X1BI DMX connector detail missing');
}
const gem1x1fc=fixtures.find(x=>x.id==='evlight-gem1x1fc');
if(!gem1x1fc) failures.push('Missing EV Light GEM1X1FC control-route fixture');
else{
  const control=gem1x1fc.control||{};
  for(const item of ['DMX512','RDM','Art-Net','sACN']) if(!control.wired?.includes(item)) failures.push('EV Light GEM1X1FC wired/network control path missing: '+item);
  for(const item of ['Art-Net','sACN']) if(!control.directLightingAI?.includes(item)) failures.push('EV Light GEM1X1FC direct LightingAI transport missing: '+item);
  if(control.wireless?.length) failures.push('EV Light GEM1X1FC must not claim manufacturer-documented wireless control');
  if(control.builtInCRMX) failures.push('EV Light GEM1X1FC must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light GEM1X1FC must not claim built-in Bluetooth');
  if(control.externalInterfaceRequired?.length) failures.push('EV Light GEM1X1FC must not require an external interface for published Art-Net/sACN input');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light GEM1X1FC wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightprofessional.com/products-index/2/')) failures.push('EV Light GEM1X1FC official index source missing');
  if(!control.sourceUrls.includes('https://ru.evlightpro.com/led-soft-light-panel/62570433.html')) failures.push('EV Light GEM1X1FC official detail source missing');
  if(gem1x1fc.dmxConnection!=='RJ45 + 3-pin XLR or 5-pin XLR') failures.push('EV Light GEM1X1FC connector detail missing');
}
const gem2x1bi=fixtures.find(x=>x.id==='evlight-gem2x1bi');
if(!gem2x1bi) failures.push('Missing EV Light GEM2X1BI control-route fixture');
else{
  const control=gem2x1bi.control||{};
  if(!control.wired?.includes('DMX512')) failures.push('EV Light GEM2X1BI DMX512 route missing');
  if(control.wired?.some(x=>x==='RDM'||x==='Art-Net'||x==='sACN')) failures.push('EV Light GEM2X1BI must not claim unpublished RDM/Art-Net/sACN support');
  if(control.wireless?.length) failures.push('EV Light GEM2X1BI must not claim manufacturer-documented wireless control');
  if(control.builtInCRMX) failures.push('EV Light GEM2X1BI must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light GEM2X1BI must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light GEM2X1BI must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512 control')) failures.push('EV Light GEM2X1BI wired DMX interface requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('RDM, Art-Net or sACN'))) failures.push('EV Light GEM2X1BI unpublished network/control limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light GEM2X1BI wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightprofessional.com/quality-led-soft-light-panel-63222309.html')) failures.push('EV Light GEM2X1BI official control source missing');
  if(!Array.isArray(gem2x1bi.dmxChannels)||!gem2x1bi.dmxChannels.includes(3)||!gem2x1bi.dmxChannels.includes(7)) failures.push('EV Light GEM2X1BI DMX channel options must include 3 and 7');
  if(gem2x1bi.dmxConnection!=='3-pin XLR in/out') failures.push('EV Light GEM2X1BI DMX connector detail missing');
}
const gem2x1st=fixtures.find(x=>x.id==='evlight-gem2x1st');
if(!gem2x1st) failures.push('Missing EV Light GEM2X1ST control-route fixture');
else{
  const control=gem2x1st.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('EV Light GEM2X1ST wired control path missing: '+item);
  for(const item of ['WiFi-DMX','Wireless DMX','App control']) if(!control.wireless?.includes(item)) failures.push('EV Light GEM2X1ST wireless/app control path missing: '+item);
  if(control.builtInCRMX) failures.push('EV Light GEM2X1ST must not claim CRMX/LumenRadio from unspecified Wireless DMX');
  if(control.builtInBluetooth) failures.push('EV Light GEM2X1ST must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light GEM2X1ST must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.includes('External verified bridge required for LightingAI Art-Net/sACN control')) failures.push('EV Light GEM2X1ST LightingAI bridge requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light GEM2X1ST network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light GEM2X1ST wireless-DMX qualification missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightprofessional.com/quality-led-soft-light-panel-63400265.html')) failures.push('EV Light GEM2X1ST official control source missing');
}
const gemx21hard=fixtures.find(x=>x.id==='evlight-gemx21-hard');
if(!gemx21hard) failures.push('Missing EV Light GEMX21 HARD control-route fixture');
else{
  const control=gemx21hard.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('EV Light GEMX21 HARD wired control path missing: '+item);
  for(const item of ['Bluetooth App Control','WiFi-DMX','Wireless DMX','LumenRadio CRMX (optional)']) if(!control.wireless?.includes(item)) failures.push('EV Light GEMX21 HARD published wireless/app control path missing: '+item);
  if(control.builtInCRMX) failures.push('EV Light GEMX21 HARD must not claim standard built-in CRMX because manufacturer lists CRMX as optional');
  if(!control.builtInBluetooth) failures.push('EV Light GEMX21 HARD Bluetooth App Control flag missing');
  if(control.directLightingAI?.length) failures.push('EV Light GEMX21 HARD must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.some(x=>String(x).includes('Art-Net/sACN'))) failures.push('EV Light GEMX21 HARD LightingAI bridge requirement missing');
  if(!control.externalInterfaceRequired?.some(x=>String(x).includes('CRMX'))) failures.push('EV Light GEMX21 HARD CRMX option/transmitter requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light GEMX21 HARD network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('optional'))) failures.push('EV Light GEMX21 HARD optional-CRMX qualification missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightprofessional.com/quality-led-soft-light-panel-63424122.html')) failures.push('EV Light GEMX21 HARD official Bluetooth/CRMX source missing');
  if(!control.sourceUrls.includes('https://www.evlightprofessional.com/quality-led-soft-light-panel-63418635.html')) failures.push('EV Light GEMX21 HARD official WiFi/Wireless-DMX source missing');
}
const gemx12=fixtures.find(x=>x.id==='evlight-gemx12');
if(!gemx12) failures.push('Missing EV Light GEMX12 control-route fixture');
else{
  const control=gemx12.control||{};
  if(control.wired?.length) failures.push('EV Light GEMX12 must not claim an unverified wired control protocol');
  if(control.wireless?.length) failures.push('EV Light GEMX12 must not claim an unverified wireless control protocol');
  if(control.builtInCRMX) failures.push('EV Light GEMX12 must not claim built-in CRMX/LumenRadio');
  if(control.builtInBluetooth) failures.push('EV Light GEMX12 must not claim built-in Bluetooth');
  if(control.directLightingAI?.length) failures.push('EV Light GEMX12 must not claim direct LightingAI transport');
  if(!control.externalInterfaceRequired?.some(x=>String(x).includes('manufacturer-verified'))) failures.push('EV Light GEMX12 verified-interface requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('DMX512/RDM'))) failures.push('EV Light GEMX12 unpublished wired-control limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light GEMX12 network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light GEMX12 wireless-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightpro.com/hard-panel-light/')) failures.push('EV Light GEMX12 official control source missing');
  if(gemx12.ipRating!=='IP65') failures.push('EV Light GEMX12 IP65 rating missing');
}
const gemx21st=fixtures.find(x=>x.id==='evlight-gemx21-st');
if(!gemx21st) failures.push('Missing EV Light GEMX21 ST control-route fixture');
else{
  const control=gemx21st.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('EV Light GEMX21 ST wired control path missing: '+item);
  for(const item of ['App control','WiFi-DMX','Wireless DMX']) if(!control.wireless?.includes(item)) failures.push('EV Light GEMX21 ST wireless/app control path missing: '+item);
  if(control.builtInCRMX) failures.push('EV Light GEMX21 ST must not claim CRMX/LumenRadio from unspecified Wireless DMX');
  if(control.builtInBluetooth) failures.push('EV Light GEMX21 ST must not claim built-in Bluetooth without manufacturer documentation');
  if(control.directLightingAI?.length) failures.push('EV Light GEMX21 ST must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.some(x=>String(x).includes('Art-Net/sACN'))) failures.push('EV Light GEMX21 ST LightingAI bridge requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('CRMX/LumenRadio'))) failures.push('EV Light GEMX21 ST wireless-DMX qualification missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light GEMX21 ST network-protocol limitation missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightprofessional.com/quality-led-soft-light-panel-63337022.html')) failures.push('EV Light GEMX21 ST official model source missing');
  if(gemx21st.ipRating!=='IP65') failures.push('EV Light GEMX21 ST IP65 rating missing');
  if(Number(gemx21st.beamAngleDeg)!==120) failures.push('EV Light GEMX21 ST beam angle must be 120 degrees');
}
const gemx24hard=fixtures.find(x=>x.id==='evlight-gemx24-hard');
if(!gemx24hard) failures.push('Missing EV Light GEMX24 HARD control-route fixture');
else{
  const control=gemx24hard.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('EV Light GEMX24 HARD wired control path missing: '+item);
  for(const item of ['Bluetooth App Control','LumenRadio CRMX Wireless DMX','Wi-Fi connectivity']) if(!control.wireless?.includes(item)) failures.push('EV Light GEMX24 HARD published wireless/control path missing: '+item);
  if(!control.builtInCRMX) failures.push('EV Light GEMX24 HARD CRMX flag missing');
  if(!control.builtInBluetooth) failures.push('EV Light GEMX24 HARD Bluetooth flag missing');
  if(control.directLightingAI?.length) failures.push('EV Light GEMX24 HARD must not claim direct LightingAI Art-Net/sACN transport');
  if(!control.externalInterfaceRequired?.some(x=>String(x).includes('Art-Net/sACN'))) failures.push('EV Light GEMX24 HARD LightingAI bridge requirement missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Art-Net or sACN'))) failures.push('EV Light GEMX24 HARD network-protocol limitation missing');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('Wi-Fi'))) failures.push('EV Light GEMX24 HARD Wi-Fi protocol qualification missing');
  if(!Array.isArray(control.sourceUrls)||!control.sourceUrls.includes('https://www.evlightpro.com/led-film-lighting/65882903.html')) failures.push('EV Light GEMX24 HARD official model source missing');
  if(gemx24hard.ipRating!=='IP65') failures.push('EV Light GEMX24 HARD IP65 rating missing');
  if(gemx24hard.pwm!=='24 kHz') failures.push('EV Light GEMX24 HARD PWM detail missing');
}
const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'EV Light',fixtureCount:fixtures.length,accessoryCount:accessories.length,lockedFixtureCount:EXPECTED_FIXTURE_COUNT,requiredFixtures:expected.length,families:[...new Set(fixtures.map(x=>x.family))].sort(),failures:unique},null,2));
if(unique.length) process.exit(1);
