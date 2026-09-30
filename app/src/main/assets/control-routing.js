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
 return {route:vendor.length?'vendor-bluetooth':'unverified',label:vendor.length?'DIRECT BLUETOOTH · VERIFICATION REQUIRED':'NO VERIFIED BLUETOOTH ROUTE',bluetooth:vendor.length>0,transportReady:false,semanticReady:false,verifiedDmxModeCount:0,system:system,requiresInterface:false,externalInterfaces:[],direct:fields.direct,wired:fields.wired,wireless:fields.wireless};
}
function productionReady(){return false}
window.LightingAIControlRouting={version:'2.0-bluetooth-only',classify:classify,productionReady:productionReady};
})();
