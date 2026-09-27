(function(){
'use strict';
function list(v){return Array.isArray(v)?v.filter(Boolean):[]}
function lower(v){return String(v||'').toLowerCase()}
function hasAny(values,needles){
  return list(values).some(function(v){var s=lower(v);return needles.some(function(n){return s.indexOf(n)>=0})})
}
function classify(fixture){
  var c=fixture&&fixture.control||{};
  var direct=list(c.directLightingAI),wired=list(c.wired),wireless=list(c.wireless),external=list(c.externalInterfaceRequired);
  var standardFields=direct.concat(wired,wireless);
  var nativeNetwork=hasAny(direct,['art-net','artnet','sacn','e1.31']);
  var standardNetwork=hasAny(standardFields,['art-net','artnet','sacn','e1.31']);
  var dmx=hasAny(standardFields,['dmx512','dmx','rdm']);
  var crmx=hasAny(standardFields,['crmx','lumenradio']);
  var proprietaryBle=hasAny(standardFields.concat(external),['sidus','bluetooth','ble','mesh','asteraapp','uhf']);
  var verifiedModes=list(fixture&&fixture.dmxModes).filter(function(m){
    return !!(m&&m.verified===true&&Number(m.channels||m.channelCount)>0&&String(m.sourceUrl||'').indexOf('http')===0);
  });
  var system=null;
  try{
    if(window.LightingAIControlSystemDrivers&&typeof window.LightingAIControlSystemDrivers.resolve==='function'){
      system=window.LightingAIControlSystemDrivers.resolve(fixture);
    }
  }catch(e){}
  var route='unverified',label='NO VERIFIED ROUTE',requiresInterface=external.length>0;
  if(system&&system.productionDriver){
    if(system.productionDriver.id==='standards-native-network'){route='native-network';label='DIRECT ART-NET / sACN';}
    else {route='gateway';label='STANDARD CONTROL ROUTE';}
  }else if(system&&system.transportKnown){
    route=nativeNetwork?'native-network':'gateway';
    label='TRANSPORT KNOWN · PROFILE UNVERIFIED';
  }else if(system&&system.vendorDrivers&&system.vendorDrivers.length){
    route='vendor-wireless';label='VENDOR WIRELESS ADAPTER';
  }else if(nativeNetwork||standardNetwork||dmx||crmx){
    route=nativeNetwork?'native-network':'gateway';label='TRANSPORT KNOWN · PROFILE UNVERIFIED';
  }else if(proprietaryBle){
    route='vendor-wireless';label='VENDOR WIRELESS ADAPTER';
  }
  var transportReady=system?!!system.transportKnown:(route==='native-network'||route==='gateway');
  var semanticReady=system?!!system.productionReady:(transportReady&&verifiedModes.length>0);
  return {
    route:route,
    label:label,
    nativeNetwork:nativeNetwork,
    standardNetwork:standardNetwork,
    dmx:dmx,
    crmx:crmx,
    proprietaryBle:proprietaryBle,
    transportReady:transportReady,
    semanticReady:semanticReady,
    verifiedDmxModeCount:verifiedModes.length,
    system:system,
    requiresInterface:requiresInterface,
    externalInterfaces:external,
    direct:direct,
    wired:wired,
    wireless:wireless
  };
}
function productionReady(fixture){return classify(fixture).semanticReady===true}
window.LightingAIControlRouting={version:'1.3-conservative-system-driver-gated',classify:classify,productionReady:productionReady};
})();