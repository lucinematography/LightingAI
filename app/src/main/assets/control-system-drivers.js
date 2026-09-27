(function(){
'use strict';
function arr(v){return Array.isArray(v)?v.filter(Boolean):[]}
function lower(v){return String(v||'').toLowerCase()}
function standardControl(fixture){
  var c=fixture&&fixture.control;
  if(Array.isArray(c))return c.slice();
  if(!c||typeof c!=='object')return [];
  return [].concat(arr(c.directLightingAI),arr(c.wired),arr(c.wireless));
}
function vendorControl(fixture){
  var c=fixture&&fixture.control;
  if(Array.isArray(c))return c.slice();
  if(!c||typeof c!=='object')return [];
  return [].concat(arr(c.directLightingAI),arr(c.wired),arr(c.wireless),arr(c.externalInterfaceRequired),arr(c.unavailableDirectProtocols));
}
function includesAny(values,needles){
  return arr(values).some(function(v){var s=lower(v);return needles.some(function(n){return s.indexOf(n)>=0})})
}
function verifiedModes(fixture){
  return arr(fixture&&fixture.dmxModes).filter(function(m){
    return !!(m&&m.verified===true&&Number(m.channels||m.channelCount)>0&&String(m.sourceUrl||'').indexOf('http')===0)
  })
}
var DRIVERS=[
  {
    id:'standards-native-network',
    scope:'standard',
    status:'production',
    label:'Native Art-Net / sACN',
    description:'LightingAI sends standards-based network DMX directly only when directLightingAI explicitly declares Art-Net or sACN.',
    match:function(f){
      var c=f&&f.control||{},direct=arr(c&&c.directLightingAI);
      return includesAny(direct,['art-net','artnet','sacn','e1.31']);
    }
  },
  {
    id:'standards-dmx-gateway',
    scope:'standard',
    status:'production',
    label:'Art-Net/sACN → DMX/RDM/CRMX',
    description:'LightingAI outputs Art-Net/sACN to a standards-based gateway; the downstream fixture is controlled by its verified DMX profile.',
    match:function(f){
      return includesAny(standardControl(f),['dmx512','dmx','rdm','crmx','lumenradio']);
    }
  },
  {
    id:'vendor-astera-wireless',
    scope:'vendor',
    status:'research',
    manufacturer:'Astera',
    label:'AsteraApp / BTB / UHF',
    description:'Astera proprietary app-side wireless family. Kept isolated until session/authentication and commands are verified.',
    match:function(f){
      return lower(f&&f.manufacturer)==='astera'&&includesAny(vendorControl(f),['asteraapp','bluetooth','btb','uhf','wi-fi','wifi']);
    }
  },
  {
    id:'vendor-aputure-sidus',
    scope:'vendor',
    status:'research',
    manufacturer:'Aputure',
    label:'Sidus Link / Sidus Mesh',
    description:'Aputure proprietary Sidus family. Standards-based DMX/CRMX/Art-Net/sACN routes take priority whenever available.',
    match:function(f){
      return lower(f&&f.manufacturer)==='aputure'&&includesAny(vendorControl(f),['sidus','mesh','bluetooth','ble']);
    }
  },
  {
    id:'vendor-godox-app',
    scope:'vendor',
    status:'research',
    manufacturer:'Godox',
    label:'Godox Light / Bluetooth',
    description:'Godox proprietary app/Bluetooth family. Production output remains disabled until protocol details are verified.',
    match:function(f){
      return lower(f&&f.manufacturer)==='godox'&&includesAny(vendorControl(f),['bluetooth','app','2.4g','2.4 ghz','2.4ghz']);
    }
  },
  {
    id:'vendor-aladdin-app',
    scope:'vendor',
    status:'research',
    manufacturer:'Aladdin',
    label:'Aladdin App / Bluetooth',
    description:'Aladdin proprietary app/Bluetooth family. Standard DMX paths take priority where documented.',
    match:function(f){
      return lower(f&&f.manufacturer)==='aladdin'&&includesAny(vendorControl(f),['bluetooth','app','wireless']);
    }
  }
];
function matchingDrivers(fixture){return DRIVERS.filter(function(d){try{return d.match(fixture)}catch(e){return false}})}
function resolve(fixture){
  var matches=matchingDrivers(fixture),modes=verifiedModes(fixture);
  var standard=matches.filter(function(d){return d.scope==='standard'});
  var vendor=matches.filter(function(d){return d.scope==='vendor'});
  var productionDriver=modes.length?standard[0]||null:null;
  return {
    productionDriver:productionDriver,
    standardDrivers:standard,
    vendorDrivers:vendor,
    verifiedDmxModeCount:modes.length,
    productionReady:!!productionDriver,
    transportKnown:standard.length>0,
    vendorResearchOnly:vendor.length>0&&!productionDriver
  };
}
function listDrivers(){return DRIVERS.map(function(d){return {id:d.id,scope:d.scope,status:d.status,manufacturer:d.manufacturer||'',label:d.label,description:d.description}})}
window.LightingAIControlSystemDrivers={version:'1.1-conservative-system-families',resolve:resolve,matchingDrivers:matchingDrivers,listDrivers:listDrivers};
})();