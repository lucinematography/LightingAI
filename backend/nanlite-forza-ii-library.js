// Nanlite current Forza II Bowens-mount family.
// Official Nanlite US sources only; compatibility is explicit and not inferred.

const SRC300='https://nanliteus.com/products/forza-300b-ii-bi-color-led-spotlight';
const SRC500='https://nanliteus.com/products/forza-500b-ii-led-spotlight';
const SRC500G='https://nanliteus.com/products/forza-500b-ii-led-spotlight-with-gold-mount';
const FL20G='https://nanliteus.com/products/fl-20g-fresnel-lens-for-bowens-mount';
const CASE='https://nanliteus.com/products/padded-carrying-case-for-forza-300-ii-and-500-ii';
const RC='https://nanliteus.com/products/nanlink-ws-rc-c2-2-4ghz-remote-control';
const TB='https://nanliteus.com/products/nanlink-ws-tb-1-transmitter-box';

function control(){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:['Wired DMX interface for DMX512 control'],
    unavailableDirectProtocols:['NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control']
  };
}
function fixture(id,model,powerDrawW,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,family:'Forza II',category:'Light',discontinued:false,
    sourceType:'Bi-Color LED Spotlight',mount:'Bowens',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',cri:96,tlci:97,powerDrawW,
    control:control(),sourceUrl,...extra
  };
}

export const NANLITE_FORZA_II_FIXTURES=[
  fixture('nanlite-forza-300b-ii','Forza 300B II',350,SRC300,{
    batteryOptions:['14.4V-14.8V V-Mount batteries via Control Unit'],
    includedMountSystem:'Control Unit with V-Mount plates'
  }),
  fixture('nanlite-forza-500b-ii','Forza 500B II',580,SRC500,{
    batteryOptions:['14.4V-14.8V V-Mount','26V V-Mount'],
    availableGoldMountVariant:true,
    goldMountSourceUrl:SRC500G,
    includedMountSystem:'Control Unit with V-Mount plates'
  })
];

const BOTH=['nanlite-forza-300b-ii','nanlite-forza-500b-ii'];
const FL20G_TARGETS=[...BOTH,'nanlite-fc-720b','nanlite-fc-720c'];

export const NANLITE_FORZA_II_ACCESSORIES=[
  {
    id:'nanlite-fl-20g',manufacturer:'Nanlite',model:'FL-20G Fresnel Lens with Removable Metal Barndoors',
    category:'Fresnel',mount:'Bowens',beamAngleDeg:{min:10,max:45},compatibleWith:FL20G_TARGETS,compatibilityStatus:'Designed For',
    sourceUrl:FL20G
  },
  {
    id:'nanlite-ccsfz300ii',manufacturer:'Nanlite',model:'CCSFZ300II Padded Carrying Case for Forza 300 II / 500 II',
    category:'Other',compatibleWith:BOTH,compatibilityStatus:'Designed For',sourceUrl:CASE
  },
  {
    id:'nanlite-rf-bm-55-forza-ii',manufacturer:'Nanlite',model:'RF-BM 55-Degree Bowens Mount Reflector',
    category:'Reflector',mount:'Bowens',compatibleWith:BOTH,compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC300
  },
  {
    id:'nanlite-ascpqrfz-forza-ii',manufacturer:'Nanlite',model:'ASCPQRFZ Quick-Release Stand Clamp',
    category:'Bracket',compatibleWith:BOTH,compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC300
  },
  {
    id:'nanlite-forza-300b-ii-control-unit',manufacturer:'Nanlite',model:'Forza 300B II Control Unit with V-Mount Plates',
    category:'Power',compatibleWith:['nanlite-forza-300b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC300
  },
  {
    id:'nanlite-forza-500b-ii-control-unit',manufacturer:'Nanlite',model:'Forza 500B II Control Unit with V-Mount Plates',
    category:'Power',compatibleWith:['nanlite-forza-500b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC500
  },
  {
    id:'nanlite-forza-300b-ii-head-cable',manufacturer:'Nanlite',model:'Forza 300B II Head Cable 3 m',
    category:'Cable',compatibleWith:['nanlite-forza-300b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC300
  },
  {
    id:'nanlite-forza-500b-ii-head-cable',manufacturer:'Nanlite',model:'Forza 500B II Head Cable 3 m',
    category:'Cable',compatibleWith:['nanlite-forza-500b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC500
  },
  {
    id:'nanlite-forza-300b-ii-power-cable',manufacturer:'Nanlite',model:'Forza 300B II Power Cable 6 m',
    category:'Cable',compatibleWith:['nanlite-forza-300b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC300
  },
  {
    id:'nanlite-forza-500b-ii-power-cable',manufacturer:'Nanlite',model:'Forza 500B II Power Cable 6 m',
    category:'Cable',compatibleWith:['nanlite-forza-500b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC500
  }
];
