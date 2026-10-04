// DMG Lumiere / Rosco MIX exact-model Bluetooth/Wi-Fi coverage.
// First-party Rosco product and MIX Controller documentation only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  mini:'https://us.rosco.com/en/product/dmg-mini',
  sl1:'https://emea.rosco.com/en/product/dmg-sl1',
  maxi:'https://us.rosco.com/en/product/dmg-maxi',
  mymix:'https://emea.rosco.com/en/mymix-app',
  mixController:'https://us.rosco.com/sites/default/files/content/resource/2022-12/Rosco_DMG_USERMANUAL-MIX-CONTROL-2-1.pdf'
};

function assistedMixControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via DMG MIX Controller / myMIX','Wi-Fi / Art-Net via DMG MIX Controller'],
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:['DMG MIX Controller / Driver'],
    unavailableDirectProtocols:['MINI/SL1 require the add-on MIX Controller; LightingAI proprietary MIX command/session semantics are not production-verified'],
    sourceUrls:[sourceUrl,SRC.mymix,SRC.mixController],
    wirelessVerification:{
      bluetooth:{verified:true,family:'DMG MIX Controller Bluetooth / myMIX',scope:'transport-capability-only',sourceUrls:[sourceUrl,SRC.mymix,SRC.mixController],note:'Rosco documents Bluetooth remote control through the required add-on MIX Controller. LightingAI command semantics remain locked.'},
      wifi:{verified:true,family:'DMG MIX Controller Wi-Fi / Art-Net',scope:'transport-capability-only',sourceUrls:[sourceUrl,SRC.mixController],note:'Rosco documents Art-Net via Wi-Fi through the required add-on MIX Controller. Probe network output remains disabled and no proprietary session semantics are inferred.'}
    }
  };
}

function integratedMaxiControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via built-in DMG MIX Controller / myMIX','Wi-Fi / Art-Net via built-in DMG MIX Controller'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:['MAXI has the MIX Controller built in, but LightingAI proprietary MIX command/session semantics are not production-verified'],
    sourceUrls:[sourceUrl,SRC.mymix,SRC.mixController],
    wirelessVerification:{
      bluetooth:{verified:true,family:'DMG MAXI built-in MIX Bluetooth / myMIX',scope:'transport-capability-only',sourceUrls:[sourceUrl,SRC.mymix,SRC.mixController],note:'Rosco documents the MAXI MIX Controller as built in and Bluetooth remote control through myMIX. LightingAI command semantics remain locked.'},
      wifi:{verified:true,family:'DMG MAXI built-in MIX Wi-Fi / Art-Net',scope:'transport-capability-only',sourceUrls:[sourceUrl,SRC.mixController],note:'Rosco documents the MAXI MIX Controller as built in with Art-Net via Wi-Fi. Probe network output remains disabled.'}
    }
  };
}

function panel(id,model,sourceUrl,powerDrawW,control){
  return {id,manufacturer:'DMG Lumiere',model,family:'MIX',category:'Light',sourceType:'Full-Color LED Panel',formFactor:'Panel',cctK:{min:1700,max:10000},colorMode:'Full Color',powerDrawW,control,sourceUrl};
}

export const DMG_MIX_WIRELESS_FIXTURES=[
  panel('dmg-mini-mix','DMG MINI',SRC.mini,100,assistedMixControl(SRC.mini)),
  panel('dmg-sl1-mix','DMG SL1',SRC.sl1,200,assistedMixControl(SRC.sl1)),
  panel('dmg-maxi-mix','DMG MAXI',SRC.maxi,360,integratedMaxiControl(SRC.maxi))
];
