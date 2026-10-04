// Luxli Orchestra Bluetooth fixture coverage.
// First-party Luxli product/app sources only.
// Bluetooth evidence is transport/capability-only; proprietary command semantics remain fail-closed.
const COMPOSER='https://www.luxlilight.com/composer';
const SRC={
  viola:'https://www.luxlilight.com/product/10017/Luxli-ORC_VIOLA_5-Viola-5%22-On_Camera-RGB-LED-Light',
  viola2:'https://www.luxlilight.com/product/13801/Luxli-ORC_VIOLA_M2-Viola%26sup2%3B-5%22-On_Camera-RGB-LED-Light',
  cello:'https://www.luxlilight.com/product/11754/Luxli-ORC_CELLO_10-Cello-10%27%27-RGBAW-LED-Light',
  cello2:'https://www.luxlilight.com/product/15842/Luxli-ORC_CELLO_M2-Cello%26sup2%3B-10%22-RGBAW-LED-Light',
  timpani:'https://www.luxlilight.com/timpani',
  timpani2:'https://www.luxlilight.com/product/16565/Luxli-ORC_TIMPANI_M2-Timpani%26sup2%3B%201%26times%3B1-RGBAW-LED-Light-Panel',
  fiddle:'https://www.luxlilight.com/product/16357/Luxli-ORC_FIDDLE_01R-Fiddle-5%22-Pocket-RGBAW-LED-Light%20%28Red%29'
};

function capabilityVerification(sourceUrl,{cct=true,fx=true}={}){
  return {
    dim:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl,COMPOSER],
      note:'Luxli documents brightness/intensity control in the Composer Bluetooth app. This proves operator capability only, not LightingAI Bluetooth command encoding.'
    },
    ...(cct?{cct:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl,COMPOSER],
      note:'Luxli documents white-balance/CCT control for this Orchestra fixture together with Composer app control. This proves operator capability only.'
    }}:{}),
    color:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl,COMPOSER],
      note:'Luxli documents full-color control for this Orchestra fixture in the Composer app. This proves operator capability only.'
    },
    ...(fx?{fx:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl,COMPOSER],
      note:'Luxli documents app-accessible lighting effects for the Orchestra system. This proves operator capability only.'
    }}:{})
  };
}

function control(sourceUrl,{dmx=false,cct=true}={}){
  return {
    wired:dmx?['DMX512']:[],
    wireless:['Bluetooth via Luxli Composer app'],
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Luxli documents Bluetooth app transport and operator capabilities, but LightingAI proprietary command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,COMPOSER],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Luxli Composer Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,COMPOSER],
        note:'Luxli documents direct Bluetooth control through Composer for this model. LightingAI proprietary command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrl,{cct})
  };
}

export const LUXLI_ORCHESTRA_BLUETOOTH_FIXTURES=[
  {
    id:'luxli-viola',manufacturer:'Luxli',model:'Viola 5"',family:'Orchestra On-Camera',category:'Light',
    sourceType:'RGBAW LED Panel',formFactor:'Pocket / Handheld on-camera light',
    cctK:{min:3000,max:10000},colorMode:'RGBAW Full Color',
    control:control(SRC.viola),sourceUrl:SRC.viola
  },
  {
    id:'luxli-viola-2',manufacturer:'Luxli',model:'Viola² 5"',family:'Orchestra On-Camera',category:'Light',
    sourceType:'RGBAW LED Panel',formFactor:'Pocket / Handheld on-camera light',
    cctK:{min:3000,max:10000},colorMode:'RGBAW Full Color',cri:95,tlci:97,
    control:control(SRC.viola2),sourceUrl:SRC.viola2
  },
  {
    id:'luxli-cello',manufacturer:'Luxli',model:'Cello 10"',family:'Orchestra On-Camera',category:'Light',
    sourceType:'RGBAW LED Panel',formFactor:'Compact LED Panel',
    colorMode:'RGBAW Full Color',
    control:control(SRC.cello),sourceUrl:SRC.cello
  },
  {
    id:'luxli-cello-2',manufacturer:'Luxli',model:'Cello² 10"',family:'Orchestra On-Camera',category:'Light',
    sourceType:'RGBAW LED Panel',formFactor:'Compact LED Panel',
    cctK:{min:2800,max:10000},colorMode:'RGBAW Full Color',cri:96,tlci:98,
    control:control(SRC.cello2),sourceUrl:SRC.cello2
  },
  {
    id:'luxli-timpani',manufacturer:'Luxli',model:'Timpani 1x1',family:'Orchestra Studio',category:'Light',
    sourceType:'RGBAW LED Panel',formFactor:'1x1 LED Panel',
    cctK:{min:2800,max:10000},colorMode:'RGBAW Full Color',cri:95,tlci:97,
    control:control(SRC.timpani,{dmx:true}),sourceUrl:SRC.timpani
  },
  {
    id:'luxli-timpani-2',manufacturer:'Luxli',model:'Timpani² 1x1',family:'Orchestra Studio',category:'Light',
    sourceType:'RGBAW LED Panel',formFactor:'1x1 LED Panel',
    cctK:{min:2800,max:10000},colorMode:'RGBAW Full Color',powerDrawW:120,
    control:control(SRC.timpani2,{dmx:true}),sourceUrl:SRC.timpani2
  },
  {
    id:'luxli-fiddle',manufacturer:'Luxli',model:'Fiddle 5"',family:'Orchestra On-Camera',category:'Light',
    sourceType:'RGBAW LED Panel',formFactor:'Pocket / Handheld compact light',
    cctK:{min:2800,max:10000},colorMode:'RGBAW Full Color',batteryPowered:true,
    control:control(SRC.fiddle),sourceUrl:SRC.fiddle
  }
];
