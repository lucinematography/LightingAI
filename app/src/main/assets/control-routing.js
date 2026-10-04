(function(){
'use strict';
function list(v){return Array.isArray(v)?v.filter(Boolean):[]}
function controlFields(fixture){
 var c=fixture&&fixture.control;
 if(Array.isArray(c))return {direct:[],wired:c.slice(),wireless:[],external:[]};
 if(!c||typeof c!=='object')return {direct:[],wired:[],wireless:[],external:[]};
 return {direct:list(c.directLightingAI),wired:list(c.wired),wireless:list(c.wireless),external:list(c.externalInterfaceRequired)};
}
function classify(fixture){
 var fields=controlFields(fixture),system=null;
 try{if(window.LightingAIControlSystemDrivers&&typeof window.LightingAIControlSystemDrivers.resolve==='function')system=window.LightingAIControlSystemDrivers.resolve(fixture)}catch(e){}
 var vendor=system&&Array.isArray(system.vendorDrivers)?system.vendorDrivers:[];
 var bluetooth=vendor.some(function(d){return d&&d.transport==='bluetooth'});
 var wifi=vendor.some(function(d){return d&&d.transport==='wifi'});
 var assisted=vendor.filter(function(d){return d&&d.requiresExternalInterface===true});
 var externalInterfaces=[];
 assisted.forEach(function(d){
  list(d.externalInterfaceRequired).forEach(function(value){
   if(externalInterfaces.indexOf(value)<0)externalInterfaces.push(value);
  });
 });
 var label='NO VERIFIED BLUETOOTH / WI-FI ROUTE';
 if(bluetooth&&wifi)label='BLUETOOTH + WI-FI · VERIFICATION REQUIRED';
 else if(bluetooth)label='BLUETOOTH · VERIFICATION REQUIRED';
 else if(wifi)label='WI-FI · VERIFICATION REQUIRED';
 return {
  route:vendor.length?'vendor-wireless':'unverified',
  label:label,
  bluetooth:bluetooth,
  wifi:wifi,
  transportReady:false,
  semanticReady:false,
  verifiedDmxModeCount:0,
  system:system,
  requiresInterface:assisted.length>0,
  externalInterfaces:externalInterfaces,
  direct:fields.direct,
  wired:fields.wired,
  wireless:fields.wireless
 };
}
function productionReady(){return false}
window.LightingAIControlRouting={version:'3.0-vendor-wireless',classify:classify,productionReady:productionReady};
})();