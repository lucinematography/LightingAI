// Rotolight app-wireless fixture coverage.
// Official Rotolight product/support sources only.
// Bluetooth/Wi-Fi evidence is transport/capability-only; proprietary command semantics remain fail-closed.
const SRC={
  neo3:'https://rotolight.com/pages/neo3',
  neo3pro:'https://rotolight.com/pages/neo3pro',
  aeos2:'https://rotolight.com/pages/aeos2',
  aeos2pro:'https://rotolight.com/pages/aeos2pro',
  anova3:'https://rotolight.com/pages/anovapro3',
  titanx1:'https://rotolight.com/pages/titanx1',
  titanx2:'https://rotolight.com/pages/titanx2',
  neoAeosSupport:'https://rotolight.com/pages/neo-3-support',
  anovaSupport:'https://rotolight.com/pages/ap3-support',
  titanSupport:'https://rotolight.com/pages/titan-support'
};

function capabilityVerification(sourceUrl, includeCct=false){
  return {
    dim:{
      verified:true,
      scope:'official-app-capability-only',
      sourceUrls:[sourceUrl],
      note:'Rotolight documents app control of light output/power. This proves operator capability only, not LightingAI command encoding.'
    },
    ...(includeCct?{
      cct:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:[sourceUrl],
        note:'Rotolight documents Titan CCT mode together with Bluetooth app control. This proves operator capability only, not LightingAI command encoding.'
      }
    }:{}),
    color:{
      verified:true,
      scope:'official-app-capability-only',
      sourceUrls:[sourceUrl],
      note:'Rotolight documents RGBWW/color control in the app-capable fixture family. This proves operator capability only, not LightingAI command encoding.'
    }
  };
}

function appControl(sourceUrl,{wifi=true,crmx=false,includeCct=false}={}){
  const wireless=['Bluetooth via Rotolight app'];
  if(wifi) wireless.push('WiFi via Rotolight app');
  if(crmx) wireless.push('LumenRadio CRMX');
  const verification={
    bluetooth:{
      verified:true,
      family:'Rotolight app Bluetooth',
      scope:'transport-capability-only',
      sourceUrls:[sourceUrl],
      note:'Rotolight documents Bluetooth app control for this fixture. LightingAI proprietary command/session semantics remain locked.'
    }
  };
  if(wifi) verification.wifi={
    verified:true,
    family:'Rotolight app Wi-Fi',
    scope:'transport-capability-only',
    sourceUrls:[sourceUrl],
    note:'Rotolight documents Wi-Fi app control for this fixture. LightingAI proprietary IP/session semantics remain locked.'
  };
  return {
    wired:[],
    wireless,
    builtInBluetooth:true,
    ...(crmx?{builtInCRMX:true}:{}),
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Rotolight documents app transport and operator capabilities, but LightingAI proprietary command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl],
    wirelessVerification:verification,
    capabilityVerification:capabilityVerification(sourceUrl,includeCct)
  };
}

export const ROTOLIGHT_APP_WIRELESS_FIXTURES=[
  {
    id:'rotolight-neo-3',manufacturer:'Rotolight',model:'NEO 3',family:'NEO',category:'Light',
    sourceType:'RGBWW LED On-Camera Light',formFactor:'Pocket / Handheld on-camera light',
    colorMode:'RGBWW Full Color',powerDrawW:50,cri:95,tlci:99,
    control:appControl(SRC.neo3),sourceUrl:SRC.neo3
  },
  {
    id:'rotolight-neo-3-pro',manufacturer:'Rotolight',model:'NEO 3 PRO',family:'NEO',category:'Light',
    sourceType:'RGBWW LED On-Camera Light',formFactor:'Pocket / Handheld on-camera light',
    colorMode:'RGBWW Full Color',powerDrawW:60,cri:95,tlci:99,
    control:appControl(SRC.neo3pro),sourceUrl:SRC.neo3pro
  },
  {
    id:'rotolight-aeos-2',manufacturer:'Rotolight',model:'AEOS 2',family:'AEOS',category:'Light',
    sourceType:'RGBWW LED Panel',formFactor:'LED Panel',
    colorMode:'RGBWW Full Color',powerDrawW:120,cri:95,tlci:99,
    control:appControl(SRC.aeos2),sourceUrl:SRC.aeos2
  },
  {
    id:'rotolight-aeos-2-pro',manufacturer:'Rotolight',model:'AEOS 2 PRO',family:'AEOS',category:'Light',
    sourceType:'RGBWW LED Panel',formFactor:'LED Panel',
    colorMode:'RGBWW Full Color',powerDrawW:120,cri:95,tlci:99,
    control:appControl(SRC.aeos2pro),sourceUrl:SRC.aeos2pro
  },
  {
    id:'rotolight-anova-pro-3',manufacturer:'Rotolight',model:'Anova PRO 3',family:'Anova',category:'Light',
    sourceType:'RGBWW LED Panel',formFactor:'LED Panel',
    colorMode:'RGBWW Full Color',powerDrawW:300,cri:95,tlci:99,beamAngleDeg:50,ipRating:'IP65',
    control:appControl(SRC.anova3,{wifi:true,crmx:true}),sourceUrl:SRC.anova3
  },
  {
    id:'rotolight-titan-x1',manufacturer:'Rotolight',model:'Titan X1',family:'Titan',category:'Light',
    sourceType:'RGBWW LED Panel',formFactor:'1x1 LED Panel',
    cctK:{min:3000,max:10000},colorMode:'RGBWW Full Color',tlci:99,
    control:appControl(SRC.titanx1,{wifi:false,crmx:true,includeCct:true}),sourceUrl:SRC.titanx1
  },
  {
    id:'rotolight-titan-x2',manufacturer:'Rotolight',model:'Titan X2',family:'Titan',category:'Light',
    sourceType:'RGBWW LED Soft Panel',formFactor:'2x1 LED Panel',
    cctK:{min:3000,max:10000},colorMode:'RGBWW Full Color',tlci:99,
    control:appControl(SRC.titanx2,{wifi:false,crmx:true,includeCct:true}),sourceUrl:SRC.titanx2
  }
];
