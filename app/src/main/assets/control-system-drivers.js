(function(){
'use strict';
function arr(v){return Array.isArray(v)?v.filter(Boolean):[]}
function lower(v){return String(v||'').toLowerCase()}
function controlFields(fixture){
 var c=fixture&&fixture.control;
 if(Array.isArray(c))return {direct:[],wireless:c.slice(),wired:[],external:[]};
 if(!c||typeof c!=='object')return {direct:[],wireless:[],wired:[],external:[]};
 return {direct:arr(c.directLightingAI),wireless:arr(c.wireless),wired:arr(c.wired),external:arr(c.externalInterfaceRequired)};
}
function wirelessValues(fixture){
 var f=controlFields(fixture);
 return [].concat(f.direct,f.wireless);
}
function hasBluetooth(values){
 return arr(values).some(function(v){
  var s=lower(v);
  return /(^|[^a-z0-9])(bluetooth|ble)([^a-z0-9]|$)/.test(s)||s.indexOf('sidus mesh bluetooth')>=0||s.indexOf('asteraapp via bluetooth')>=0;
 });
}
function hasWifi(values){
 return arr(values).some(function(v){
  var s=lower(v);
  return /(^|[^a-z0-9])(wi-fi|wifi|wlan)([^a-z0-9]|$)/.test(s);
 });
}
function labelFor(manufacturer,transport){
 var m=lower(manufacturer);
 var labels={
  astera:{bluetooth:'Astera Bluetooth',wifi:'Astera Wi-Fi'},
  aputure:{bluetooth:'Aputure Sidus Bluetooth',wifi:'Aputure / Sidus Wi-Fi'},
  godox:{bluetooth:'Godox Bluetooth',wifi:'Godox Wi-Fi'},
  aladdin:{bluetooth:'Aladdin Bluetooth',wifi:'Aladdin Wi-Fi'},
  nanlite:{bluetooth:'NANLINK Bluetooth',wifi:'NANLINK Wi-Fi'},
  arri:{bluetooth:'ARRI LiCo Bluetooth',wifi:'ARRI Wi-Fi'},
  'kino flo':{bluetooth:'Kino Flo Bluetooth',wifi:'Kino Flo Wi-Fi'},
  litegear:{bluetooth:'LiteGear Bluetooth',wifi:'LiteGear Wi-Fi'},
  'ev light':{bluetooth:'EV Light Bluetooth',wifi:'EV Light Wi-Fi'},
  desisti:{bluetooth:'De Sisti Bluetooth',wifi:'De Sisti Wi-Fi'}
 };
 var named=labels[m]&&labels[m][transport];
 return named||String(manufacturer||'Vendor')+' '+(transport==='wifi'?'Wi-Fi':'Bluetooth');
}
function idFor(manufacturer,transport){
 var m=lower(manufacturer).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'vendor';
 if(transport==='bluetooth'){
  if(m==='astera')return 'vendor-astera-wireless';
  if(m==='aputure')return 'vendor-aputure-sidus';
  if(m==='godox')return 'vendor-godox-app';
  if(m==='aladdin')return 'vendor-aladdin-app';
  if(m==='nanlite')return 'vendor-nanlite-nanlink';
  if(m==='arri')return 'vendor-arri-lico';
 }
 return 'vendor-'+m+'-'+transport;
}
function candidate(fixture,transport){
 var manufacturer=String(fixture&&fixture.manufacturer||'Vendor');
 return {
  id:idFor(manufacturer,transport),
  manufacturer:manufacturer,
  transport:transport,
  scope:'vendor-direct',
  status:'required-unverified',
  production:false,
  label:labelFor(manufacturer,transport),
  description:(transport==='wifi'?'Direct vendor Wi-Fi':'Direct vendor Bluetooth/BLE')+' candidate from documented catalog metadata. Output remains locked until the real vendor session and commands are physically verified.'
 };
}
function matchingDrivers(fixture){
 var values=wirelessValues(fixture),out=[];
 if(hasBluetooth(values))out.push(candidate(fixture,'bluetooth'));
 if(hasWifi(values))out.push(candidate(fixture,'wifi'));
 return out;
}
function resolve(fixture){
 var vendor=matchingDrivers(fixture);
 var bluetooth=vendor.some(function(d){return d.transport==='bluetooth'});
 var wifi=vendor.some(function(d){return d.transport==='wifi'});
 return {
  productionDriver:null,
  standardDrivers:[],
  vendorDrivers:vendor,
  wirelessDrivers:vendor,
  candidateTransports:{bluetooth:bluetooth,wifi:wifi},
  verifiedDmxModeCount:0,
  productionReady:false,
  transportKnown:bluetooth||wifi,
  vendorDirectRequired:vendor.length>0,
  vendorDirectReady:false,
  vendorResearchOnly:vendor.length>0
 };
}
function listDrivers(){
 return [
  {id:'vendor-direct-bluetooth',scope:'vendor-direct',status:'required-unverified',transport:'bluetooth',label:'Catalog-driven Bluetooth/BLE vendor driver'},
  {id:'vendor-direct-wifi',scope:'vendor-direct',status:'required-unverified',transport:'wifi',label:'Catalog-driven direct Wi-Fi vendor driver'}
 ];
}
window.LightingAIControlSystemDrivers={
 version:'3.0-vendor-wireless',
 resolve:resolve,
 matchingDrivers:matchingDrivers,
 listDrivers:listDrivers,
 hasBluetooth:hasBluetooth,
 hasWifi:hasWifi
};
})();