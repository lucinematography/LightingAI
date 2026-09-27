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
  var all=direct.concat(wired,wireless);
  var nativeNetwork=hasAny(direct,['art-net','artnet','sacn','sacn','e1.31']);
  var standardNetwork=hasAny(all,['art-net','artnet','sacn','e1.31']);
  var dmx=hasAny(all,['dmx512','dmx','rdm']);
  var crmx=hasAny(all,['crmx','lumenradio']);
  var proprietaryBle=hasAny(all,['sidus','bluetooth','ble','mesh','asteraapp','uhf']);
  var route='unverified',label='NO VERIFIED ROUTE',requiresInterface=external.length>0;
  if(nativeNetwork){route='native-network';label='DIRECT ART-NET / sACN';}
  else if(standardNetwork||dmx||crmx){route='gateway';label='STANDARD CONTROL ROUTE';}
  else if(proprietaryBle){route='vendor-wireless';label='VENDOR WIRELESS ADAPTER';}
  return {
    route:route,
    label:label,
    nativeNetwork:nativeNetwork,
    standardNetwork:standardNetwork,
    dmx:dmx,
    crmx:crmx,
    proprietaryBle:proprietaryBle,
    requiresInterface:requiresInterface,
    externalInterfaces:external,
    direct:direct,
    wired:wired,
    wireless:wireless
  };
}
function productionReady(fixture){
  var r=classify(fixture);
  return r.route==='native-network'||r.route==='gateway';
}
window.LightingAIControlRouting={version:'1.0-standards-first',classify:classify,productionReady:productionReady};
})();
