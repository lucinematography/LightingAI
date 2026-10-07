// Aputure INFINIMAT exact-model lighting coverage.
// First-party Aputure product pages only. Sidus Bluetooth transport is explicit;
// proprietary Sidus Bluetooth Mesh command/session semantics remain fail-closed.
const SRC={
  x12:'https://aputure.com/en-US/products/aputure-infinimat-1x2-with-clear-softbox',
  x14:'https://aputure.com/en-US/products/aputure-infinimat-1x4-with-clear-softbox',
  x24:'https://aputure.com/en-US/products/aputure-infinimat-2x4-with-clear-softbox',
  x44:'https://aputure.com/en-US/products/aputure-infinimat-4x4-with-clear-softbox',
  x88:'https://aputure.com/en-US/products/aputure-infinimat-8x8-with-clear-softbox',
  family:'https://aputure.com/en-US/product-families/infinimat'
};

function control(sourceUrl){
  return {
    wired:['DMX512','RDM','etherCON'],
    wireless:['Sidus Link','LumenRadio CRMX'],
    builtInBluetooth:true,
    directLightingAI:['Art-Net','sACN'],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Aputure documents Sidus Link Bluetooth control for this exact INFINIMAT model, but LightingAI proprietary Sidus Bluetooth Mesh command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,SRC.family]
  };
}

function fixture(id,model,sourceUrl,powerDrawW,pixelCount){
  return {
    id,manufacturer:'Aputure',model,family:'INFINIMAT',category:'Light',
    sourceType:'Tunable Color Pixel LED Mat',
    formFactor:'Flexible Panel / Mat',
    colorMode:'Full Color / Pixel',
    cctK:{min:2000,max:10000},
    powerDrawW,
    pixelCount,
    cri:96,
    tlci:97,
    ipRating:'IP65',
    effects:['Pixel motion effects'],
    control:control(sourceUrl),
    sourceUrl
  };
}

export const APUTURE_INFINIMAT_FIXTURES=[
  fixture('aputure-infinimat-1x2','INFINIMAT 1x2',SRC.x12,111,1),
  fixture('aputure-infinimat-1x4','INFINIMAT 1x4',SRC.x14,201,2),
  fixture('aputure-infinimat-2x4','INFINIMAT 2x4',SRC.x24,400,4),
  fixture('aputure-infinimat-4x4','INFINIMAT 4x4',SRC.x44,800,4),
  fixture('aputure-infinimat-8x8','INFINIMAT 8x8',SRC.x88,2000,16)
];
