// NANLUX exact-model Bluetooth lighting coverage.
// First-party NANLUX/NANLINK product/app evidence only.
// Transport evidence is model-scoped; proprietary Bluetooth command/session semantics remain fail-closed.
const SRC={
  evoke600c:'https://nanlite.jp/products/nanlux-evoke-600c',
  evoke900c:'https://nanlite.jp/products/evoke-900c',
  evoke1200b:'https://nanlite.jp/products/nanlux-evoke-1200b',
  evoke2400b:'https://nanlite.jp/products/nanlux-evoke-2400b',
  dyno650c:'https://nanlite.jp/products/nanlux-dyno-650c',
  dyno1200c:'https://nanlite.jp/products/nanlux-dyno-1200c',
  nanlink:'https://www.nanlink.com/en/h-col-293.html'
};

function bluetoothControl(sourceUrl,note,wireless='Bluetooth via NANLINK App'){
  const sources=[sourceUrl,SRC.nanlink];
  return {
    wired:['DMX/RDM'],
    wireless:[wireless],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'NANLUX documents Bluetooth transport for this exact model, but LightingAI proprietary Bluetooth command/session semantics are not production-verified',
      '2.4G, CRMX, DMX/RDM, Art-Net and sACN routes are kept separate from direct Bluetooth'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'NANLUX / NANLINK Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:note+' LightingAI proprietary Bluetooth command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,cctK,colorMode,powerDrawW,sourceUrl,note,wireless){
  return {
    id,
    manufacturer:'NANLUX',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    cctK,
    colorMode,
    powerDrawW,
    control:bluetoothControl(sourceUrl,note,wireless),
    sourceUrl
  };
}

// Export name is retained for compatibility with the existing catalog aggregator.
export const NANLUX_EVOKE_2400B_BLUETOOTH_FIXTURES=[
  fixture(
    'nanlux-evoke-600c','Evoke 600C','Evoke',
    'Full-Color LED Spot Light','COB / Spot',
    {min:1000,max:20000},'Full-Color / HSI / CCT',600,SRC.evoke600c,
    'First-party NANLUX regional product documentation explicitly lists Bluetooth and NANLINK app control for Evoke 600C.'
  ),
  fixture(
    'nanlux-evoke-900c','Evoke 900C','Evoke',
    'RGBLAC Full-Color LED Spot Light','COB / Spot',
    {min:1800,max:20000},'RGBLAC / HSI / CCT',940,SRC.evoke900c,
    'First-party NANLUX regional product documentation explicitly lists Bluetooth and NANLINK APP among the control methods for Evoke 900C.'
  ),
  fixture(
    'nanlux-evoke-1200b','Evoke 1200B','Evoke',
    'Bi-Color LED Spot Light','COB / Spot',
    {min:2700,max:6500},'Bi-Color',1200,SRC.evoke1200b,
    'First-party NANLUX regional product documentation explicitly lists Bluetooth for Evoke 1200B.'
  ),
  fixture(
    'nanlux-evoke-2400b','Evoke 2400B','Evoke',
    'Bi-Color LED Spot Light','COB / Spot',
    {min:2700,max:6500},'Bi-Color',2400,SRC.evoke2400b,
    'First-party NANLUX documentation explicitly lists Bluetooth and provides an exact NANLINK Via Bluetooth connection procedure for Evoke 2400B.'
  ),
  fixture(
    'nanlux-dyno-650c','Dyno 650C','Dyno',
    'RGBWW LED Soft Panel','Panel',
    {min:2700,max:20000},'RGBWW / HSI / CCT',650,SRC.dyno650c,
    'First-party NANLUX regional product documentation explicitly lists Bluetooth for Dyno 650C, and NANLINK first-party FAQ explicitly identifies Dyno 650C as a fixture that can connect to the app via Bluetooth.',
    'Bluetooth / NANLINK App'
  ),
  fixture(
    'nanlux-dyno-1200c','Dyno 1200C','Dyno',
    'RGBWW LED Soft Panel','Panel',
    {min:2700,max:20000},'RGBWW / HSI / CCT',1200,SRC.dyno1200c,
    'First-party NANLUX regional product documentation explicitly lists Bluetooth for Dyno 1200C, and NANLINK first-party FAQ explicitly identifies Dyno 1200C as a fixture that can connect to the app via Bluetooth.',
    'Bluetooth / NANLINK App'
  )
];
