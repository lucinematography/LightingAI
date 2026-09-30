(function(){
'use strict';
function arr(v){return Array.isArray(v)?v.filter(Boolean):[]}
function lower(v){return String(v||'').toLowerCase()}
function vendorControl(fixture){
 var c=fixture&&fixture.control;
 if(Array.isArray(c))return c.slice();
 if(!c||typeof c!=='object')return [];
 return [].concat(arr(c.directLightingAI),arr(c.wired),arr(c.wireless),arr(c.externalInterfaceRequired),arr(c.unavailableDirectProtocols));
}
function includesAny(values,needles){return arr(values).some(function(v){var s=lower(v);return needles.some(function(n){return s.indexOf(n)>=0})})}

// CONTROL exposes only direct vendor Bluetooth families. Network/DMX metadata is not executable.
var DRIVERS=[
 {id:'vendor-astera-wireless',manufacturer:'Astera',label:'Astera Bluetooth',description:'Direct Astera Bluetooth candidate. Output remains locked until the real session and commands are physically verified.',match:function(f){return lower(f&&f.manufacturer)==='astera'&&includesAny(vendorControl(f),['asteraapp','bluetooth','btb','uhf','wi-fi','wifi'])}},
 {id:'vendor-aputure-sidus',manufacturer:'Aputure',label:'Aputure Sidus Bluetooth',description:'Direct Aputure Bluetooth/Sidus candidate. Output remains locked until physically verified.',match:function(f){return lower(f&&f.manufacturer)==='aputure'&&includesAny(vendorControl(f),['sidus','mesh','bluetooth','ble'])}},
 {id:'vendor-godox-app',manufacturer:'Godox',label:'Godox Bluetooth',description:'Direct Godox Bluetooth candidate. Output remains locked until physically verified.',match:function(f){return lower(f&&f.manufacturer)==='godox'&&includesAny(vendorControl(f),['bluetooth','app','2.4g','2.4 ghz','2.4ghz'])}},
 {id:'vendor-aladdin-app',manufacturer:'Aladdin',label:'Aladdin Bluetooth',description:'Direct Aladdin Bluetooth candidate. Output remains locked until physically verified.',match:function(f){return lower(f&&f.manufacturer)==='aladdin'&&includesAny(vendorControl(f),['bluetooth','app','wireless'])}},
 {id:'vendor-nanlite-nanlink',manufacturer:'Nanlite',label:'NANLINK Bluetooth',description:'Direct NANLINK Bluetooth candidate. Output remains locked until physically verified.',match:function(f){return lower(f&&f.manufacturer)==='nanlite'&&includesAny(vendorControl(f),['nanlink','bluetooth','ble','wireless'])}},
 {id:'vendor-arri-lico',manufacturer:'ARRI',label:'ARRI LiCo Bluetooth',description:'Direct ARRI LiCo Bluetooth candidate. Output remains locked until physically verified.',match:function(f){return lower(f&&f.manufacturer)==='arri'&&includesAny(vendorControl(f),['lico','bluetooth','ble','wireless'])}}
];
function matchingDrivers(fixture){return DRIVERS.filter(function(d){try{return d.match(fixture)}catch(e){return false}})}
function resolve(fixture){
 var vendor=matchingDrivers(fixture);
 return {productionDriver:null,standardDrivers:[],vendorDrivers:vendor,verifiedDmxModeCount:0,productionReady:false,transportKnown:false,vendorDirectRequired:vendor.length>0,vendorDirectReady:false,vendorResearchOnly:vendor.length>0};
}
function listDrivers(){return DRIVERS.map(function(d){return {id:d.id,scope:'vendor',status:'required-unverified',manufacturer:d.manufacturer,label:d.label,description:d.description}})}
window.LightingAIControlSystemDrivers={version:'2.0-bluetooth-only',resolve:resolve,matchingDrivers:matchingDrivers,listDrivers:listDrivers};
})();
