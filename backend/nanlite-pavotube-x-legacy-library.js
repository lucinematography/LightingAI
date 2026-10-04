// Nanlite legacy PavoTube II X family.
// Official Nanlite sources only.
// The current 2026 PavoTube comparison lists XR equivalents instead of X,
// while archived Nanlite pages document the X-series hardware and accessories.

const SRC={
  intro:'https://nanliteus.com/blogs/learn/introducing-the-nanlite-pavotube-ii-15x-30x-and-60x-led-tube-lights',
  current:'https://nanliteus.com/pages/pavotube-series',
  x60:'https://nanliteus.com/nanlite-pavotube-ii-60x-8-rgbww-led-pixel-tube-4-light-kit-with-internal-battery-and-carrying-bag/',
  multi:'https://nanliteus.com/nanlite-multi-angle-mount/',
  floor1530:'https://nanliteus.com/products/foldable-floor-stand-for-pavotube-ii-15x-and-30x-led-pixel-tubes',
  bd15:'https://nanliteus.com/products/fabric-barndoors-and-grid-for-pavotube-ii-15x-led-pixel-tubes',
  bd30:'https://nanliteus.com/nanlite-fabric-barndoors-and-grid-for-pavotube-ii-30x-led-pixel-tubes/',
  waterproof60:'https://nanliteus.com/nanlite-waterproof-housing-for-pavotube-ii-60x-led-pixel-tubes/',
  bag15:'https://nanliteus.com/nanlite-nanlite-carrying-bag-for-pavotube-ii-15x-holds-up-to-3-lights-and-accessories/'
};

function control(){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,
    builtInCRMX:false,
    dmxConnection:'Locking aviation DMX/RDM port via CB-DMX-ACP-1/2',
    directLightingAI:[],
    externalInterfaceRequired:['CB-DMX-ACP-1/2 adapter cable plus wired DMX interface'],
    unavailableDirectProtocols:[
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}

function fixture(id,model,lengthLabel,powerDrawW,batteryMah,sourceUrl){
  return {
    id,manufacturer:'Nanlite',model,family:'PavoTube II X',category:'Light',
    discontinued:true,lifecycleStatus:'legacy/discontinued',
    lifecycleEvidenceUrl:SRC.current,
    sourceType:'RGBWW LED Pixel Tube',formFactor:lengthLabel,
    cctK:{min:2700,max:12000},colorMode:'RGBWW',
    powerDrawW,builtInBattery:true,batteryMah,cri:97,tlci:98,
    control:control(),sourceUrl
  };
}

export const NANLITE_PAVOTUBE_X_LEGACY_FIXTURES=[
  fixture('nanlite-pavotube-ii-15x','PavoTube II 15X','2-foot T12 tube',35,2200,SRC.intro),
  fixture('nanlite-pavotube-ii-30x','PavoTube II 30X','4-foot T12 tube',70,4400,SRC.intro),
  fixture('nanlite-pavotube-ii-60x','PavoTube II 60X','8-foot T12 tube',106,8800,SRC.x60)
];

const ALL=['nanlite-pavotube-ii-15x','nanlite-pavotube-ii-30x','nanlite-pavotube-ii-60x'];
const MID=['nanlite-pavotube-ii-15x','nanlite-pavotube-ii-30x'];

function accessory(id,model,category,compatibleWith,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith,
    compatibilityStatus:'Designed For',sourceUrl,...extra
  };
}
function included(id,model,category,target,sourceUrl){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl
  };
}

export const NANLITE_PAVOTUBE_X_LEGACY_ACCESSORIES=[
  accessory(
    'nanlite-asmamptiix',
    'ASMAMPTIIX Multi-Angle Mount',
    'Mount',ALL,SRC.multi
  ),
  accessory(
    'nanlite-lsfl-pavotube-x',
    'LSFL Foldable Floor Stand for PavoTube II 15X / 30X',
    'Stand',MID,SRC.floor1530
  ),
  accessory(
    'nanlite-bdptii15xec',
    'BDPTII15XEC Fabric Barndoors and 45° Grid',
    'Barndoors',['nanlite-pavotube-ii-15x'],SRC.bd15
  ),
  accessory(
    'nanlite-bdptii30xec',
    'BDPTII30XEC Fabric Barndoors and 45° Grid',
    'Barndoors',['nanlite-pavotube-ii-30x'],SRC.bd30
  ),
  accessory(
    'nanlite-aswtptii60x',
    'ASWTPTII60X Waterproof Housing',
    'Other',['nanlite-pavotube-ii-60x'],SRC.waterproof60,
    {conditions:['IP68 housing, rated to 10 m / 32.8 ft by Nanlite']}
  ),
  accessory(
    'nanlite-ccsptii15x',
    'Carrying Bag for up to 3 PavoTube II 15X',
    'Case',['nanlite-pavotube-ii-15x'],SRC.bag15
  ),

  included('nanlite-pavotube-ii-15x-power-adapter','15V/2A Power Adapter — PavoTube II 15X','Power','nanlite-pavotube-ii-15x',SRC.intro),
  included('nanlite-pavotube-ii-15x-power-cable','Power Cable 3 m — PavoTube II 15X','Cable','nanlite-pavotube-ii-15x',SRC.intro),
  included('nanlite-pavotube-ii-15x-case','Padded Carrying Bag — PavoTube II 15X','Case','nanlite-pavotube-ii-15x',SRC.intro),

  included('nanlite-pavotube-ii-30x-power-adapter','15V/4A Power Adapter — PavoTube II 30X','Power','nanlite-pavotube-ii-30x',SRC.intro),
  included('nanlite-pavotube-ii-30x-power-cable','Power Cable 3 m — PavoTube II 30X','Cable','nanlite-pavotube-ii-30x',SRC.intro),

  included('nanlite-pavotube-ii-60x-power-adapter','15V/6.5A Power Adapter — PavoTube II 60X','Power','nanlite-pavotube-ii-60x',SRC.x60),
  included('nanlite-pavotube-ii-60x-power-cable','Power Cable 3 m — PavoTube II 60X','Cable','nanlite-pavotube-ii-60x',SRC.x60),
  included('nanlite-pavotube-ii-60x-case','CC-S-PTII60X Carrying Bag — PavoTube II 60X','Case','nanlite-pavotube-ii-60x',SRC.x60)
];
