// Creamsource Vortex current cinema LED fixtures.
// Official Creamsource product/knowledge-base sources only.
// Bluetooth is transport-capability evidence only; no proprietary command semantics are inferred.
const CONNECTIVITY='https://knowledge.creamsource.com/best-of-class-connectivity';
const BT_CONTROL='https://knowledge.creamsource.com/how-to-control-vortex-with-bluetooth-using-luminair-app';

const SOURCES={
  v2:'https://creamsource.com/product/vortex2/',
  v4:'https://creamsource.com/product/vortex4/',
  v8:'https://creamsource.com/product/vortex8/',
  v24:'https://creamsource.com/product/vortex24/'
};

function control(sourceUrl){
  return {
    wired:['DMX512','sACN over Ethernet'],
    wireless:['Bluetooth Low Energy (CRMX BLE)','CRMX'],
    builtInBluetooth:true,
    builtInCRMX:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Creamsource documents BLE/CRMX BLE transport, but LightingAI proprietary command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,CONNECTIVITY,BT_CONTROL],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Creamsource Vortex CRMX BLE',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,CONNECTIVITY,BT_CONTROL],
        note:'Creamsource documents direct Vortex control over Bluetooth/CRMX BLE. This verifies transport capability only; LightingAI command semantics remain locked until separately captured and physically replay-verified.'
      }
    }
  };
}

function fixture(id,model,powerDrawW,pixels,beamAngleDeg,formFactor,sourceUrl){
  return {
    id,manufacturer:'Creamsource',model,family:'Vortex',category:'Light',
    sourceType:'RRGBBW LED Panel',formFactor,
    cctK:{min:2200,max:15000},colorMode:'RRGBBW Full Color',
    powerDrawW,cri:95,tlci:95,pixels,beamAngleDeg,ipRating:'IP65',
    batteryPowered:false,control:control(sourceUrl),sourceUrl
  };
}

export const CREAMSOURCE_VORTEX_FIXTURES=[
  fixture('creamsource-vortex2','Vortex2',160,2,20,'Hard LED panel',SOURCES.v2),
  fixture('creamsource-vortex2s','Vortex2S',160,2,110,'Soft LED panel',SOURCES.v2),
  fixture('creamsource-vortex4','Vortex4',325,4,20,'Hard LED panel',SOURCES.v4),
  fixture('creamsource-vortex4s','Vortex4S',325,4,110,'Soft LED panel',SOURCES.v4),
  fixture('creamsource-vortex8','Vortex8',650,8,20,'Hard LED panel',SOURCES.v8),
  fixture('creamsource-vortex8s','Vortex8S',650,8,110,'Soft LED panel',SOURCES.v8),
  fixture('creamsource-vortex24','Vortex24',1950,24,20,'Hard LED panel',SOURCES.v24),
  fixture('creamsource-vortex24s','Vortex24S',1950,24,110,'Soft LED panel',SOURCES.v24)
];
