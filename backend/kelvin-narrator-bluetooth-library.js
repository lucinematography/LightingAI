// Kelvin Narrator Bluetooth fixture coverage.
// First-party Kelvin product pages and KelvinLights public reference implementation only.
// Transport and public-reference evidence do not unlock production commands.
const PUBLIC_REF='https://github.com/KelvinLights/k-lights-interface-py';
const SRC={
  play:'https://www.kelvinlight.com/product/play_rgbacl_led_panel_pocket_light_in_hip_pouch_with_diffuser/',
  playPro:'https://www.kelvinlight.com/product/play_pro_full_color_spectrum_rgbacl_led_panel_pocket_light_with_wireless_dmx/',
  playAir:'https://www.kelvinlight.com/product/play-air/',
  playHero:'https://www.kelvinlight.com/product/play_hero_rgbacl_led_panel_pocket_light_with_wireless_dmx/',
  epos300:'https://www.kelvinlight.com/product/epos_300_rgbacl_led_studio_light_travel_kit_for/',
  epos600:'https://www.kelvinlight.com/product/epos_600_rgbacl_led_studio_light_travel_kit_for/'
};

function capabilityVerification(sourceUrl){
  return {
    dim:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl],
      note:'Kelvin documents 0-100% output control through the Narrator-capable fixture interface. This proves operator capability only, not LightingAI command encoding.'
    },
    cct:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl],
      note:'Kelvin documents variable CCT control in Narrator-capable fixtures. This proves operator capability only.'
    },
    color:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl],
      note:'Kelvin documents RGB/HSI/XY full-color modes on Narrator-capable fixtures. This proves operator capability only.'
    },
    fx:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl],
      note:'Kelvin documents EFFECTS mode on Narrator-capable fixtures. This proves operator capability only.'
    }
  };
}

function control(sourceUrl,{crmx=false,wiredDmx=false,externalDmx=false,publicRef=false}={}){
  const wireless=['Bluetooth via Kelvin Narrator App'];
  if(crmx) wireless.push('CRMX');
  return {
    wired:wiredDmx?['DMX512']:[],
    wireless,
    builtInBluetooth:true,
    ...(crmx?{builtInCRMX:true}:{}),
    directLightingAI:[],
    externalInterfaceRequired:externalDmx?['Kelvin external DMX adapter for wired DMX control']:[],
    unavailableDirectProtocols:[
      publicRef
        ?'Kelvin publishes an official Python BLE reference implementation for this model class, but LightingAI production replay/scope validation is still required before direct commands may be enabled'
        :'Kelvin documents Bluetooth/Narrator transport for this model, but the current official Python BLE reference implementation does not explicitly list this exact model'
    ],
    sourceUrls:[sourceUrl,...(publicRef?[PUBLIC_REF]:[])],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Kelvin Narrator Bluetooth 5.2',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,...(publicRef?[PUBLIC_REF]:[])],
        note:publicRef
          ?'Kelvin documents Bluetooth/Narrator control and KelvinLights publishes a BLE reference implementation covering this model class. Production command readiness remains locked pending scoped validation and physical replay.'
          :'Kelvin documents Bluetooth/Narrator control for this exact model. The vendor public BLE reference implementation does not yet explicitly list this exact model, so command semantics remain capture-required.'
      }
    },
    ...(publicRef?{
      publicWirelessReference:{
        verified:true,
        transport:'bluetooth',
        implementation:'KelvinLights/k-lights-interface-py',
        sourceUrl:PUBLIC_REF,
        scope:'model-scoped-reference-implementation',
        note:'Vendor-published Python package exposes BLE device control including intensity, CCT, RGB/HSI and device statistics for the listed supported Kelvin model classes.'
      }
    }:{}),
    capabilityVerification:capabilityVerification(sourceUrl)
  };
}

function playFixture(id,model,sourceUrl,options={}){
  return {
    id,manufacturer:'Kelvin',model,family:'Play Series',category:'Light',
    sourceType:'RGBACL LED Panel',formFactor:'Pocket / Handheld compact panel',
    cctK:{min:1700,max:20000},colorMode:'RGBACL Full Color',
    cri:98,tlci:99,ipRating:'IP65',
    control:control(sourceUrl,options),sourceUrl
  };
}

export const KELVIN_NARRATOR_BLUETOOTH_FIXTURES=[
  playFixture('kelvin-play','Play',SRC.play,{publicRef:true}),
  playFixture('kelvin-play-pro','Play Pro',SRC.playPro,{crmx:true,publicRef:true}),
  playFixture('kelvin-play-air','Play Air',SRC.playAir,{externalDmx:true}),
  playFixture('kelvin-play-hero','Play Hero',SRC.playHero,{crmx:true}),
  {
    id:'kelvin-epos-300',manufacturer:'Kelvin',model:'Epos 300',family:'Epos Series',category:'Light',
    sourceType:'RGBACL LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:1700,max:20000},colorMode:'RGBACL Full Color',powerDrawW:300,cri:98,tlci:99,
    control:control(SRC.epos300,{crmx:true,wiredDmx:true,publicRef:true}),sourceUrl:SRC.epos300
  },
  {
    id:'kelvin-epos-600',manufacturer:'Kelvin',model:'Epos 600',family:'Epos Series',category:'Light',
    sourceType:'RGBACL LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:1700,max:20000},colorMode:'RGBACL Full Color',powerDrawW:600,cri:97,tlci:99,ipRating:'IP65',
    control:control(SRC.epos600,{crmx:true,wiredDmx:true,publicRef:true}),sourceUrl:SRC.epos600
  }
];
