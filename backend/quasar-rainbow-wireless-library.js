// Quasar Science Rainbow 2 / Double Rainbow wireless fixture coverage.
// Official Quasar Science product/starCTRL sources only.
// Bluetooth/Wi-Fi evidence is transport/capability-only; proprietary command semantics remain fail-closed.
const STARCTRL='https://www.quasarscience.com/pages/starctrl';
const R2='https://www.quasarscience.com/products/rainbow-2';
const RR='https://www.quasarscience.com/collections/new/products/double-rainbow';

function capabilityVerification(sourceUrl){
  return {
    dim:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl,STARCTRL],
      note:'Quasar Science documents starCTRL intensity control. This proves operator capability only, not LightingAI command encoding.'
    },
    cct:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl,STARCTRL],
      note:'Quasar Science documents starCTRL color-temperature control. This proves operator capability only.'
    },
    color:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl,STARCTRL],
      note:'Quasar Science documents starCTRL hue/saturation/color control. This proves operator capability only.'
    },
    fx:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl,STARCTRL],
      note:'Quasar Science documents access to Rainbow-series effects through starCTRL. This proves operator capability only.'
    }
  };
}

function control(sourceUrl){
  return {
    wired:['DMX512','Art-Net','sACN'],
    wireless:['Bluetooth via starCTRL','WiFi','CRMX'],
    builtInBluetooth:true,builtInCRMX:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Quasar Science documents Bluetooth/Wi-Fi transports and starCTRL operator control, but LightingAI proprietary command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,STARCTRL],
    wirelessVerification:{
      bluetooth:{
        verified:true,family:'Quasar Science starCTRL Bluetooth',scope:'transport-capability-only',
        sourceUrls:[sourceUrl,STARCTRL],
        note:'Quasar Science documents direct Bluetooth control through starCTRL for Rainbow 2 and Double Rainbow fixtures. LightingAI command semantics remain locked.'
      },
      wifi:{
        verified:true,family:'Quasar Science Rainbow Wi-Fi',scope:'transport-capability-only',
        sourceUrls:[sourceUrl],
        note:'Quasar Science documents built-in Wi-Fi on Rainbow 2 and Double Rainbow. This verifies transport capability only; proprietary IP/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrl)
  };
}

function fixture(id,model,powerDrawW,sourceUrl){
  return {
    id,manufacturer:'Quasar Science',model,family:'Rainbow Series',category:'Light',
    sourceType:'RGBX Linear LED Tube',formFactor:'Tube',
    cctK:{min:1750,max:10000},colorMode:'RGBX Full Color',
    powerDrawW,beamAngleDeg:180,ipRating:'IP40',
    control:control(sourceUrl),sourceUrl
  };
}

export const QUASAR_RAINBOW_WIRELESS_FIXTURES=[
  fixture('quasar-rainbow-2-2ft','Rainbow 2 2ft',25,R2),
  fixture('quasar-rainbow-2-4ft','Rainbow 2 4ft',50,R2),
  fixture('quasar-double-rainbow-2ft','Double Rainbow 2ft',50,RR),
  fixture('quasar-double-rainbow-4ft','Double Rainbow 4ft',100,RR)
];
