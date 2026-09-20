// LiteGear LiteMat Plus catalog.
// Source: official LiteGear LiteMat Plus product family and product pages.
const FAMILY='https://www.litegear.com/litemat-plus-product-family/';
const PLUS1='https://www.litegear.com/product/litemat-plus-one-kitd/';
const PLUS2='https://www.litegear.com/product/litemat-plus-two-kit/';
const PLUS2_DATASHEET='https://www.litegear.com/wp-content/uploads/2019/10/LiteMat-Plus-2-Data-Sheet.pdf';
const DIMMER_DUO='https://www.litegear.com/product/litedimmer-plus-dc200-dmx-duo/';
const DIMMER_DUO_DATASHEET='https://www.litegear.com/wp-content/uploads/2020/10/LiteDimmer-Plus-Duo-DC200-Data-Sheet.pdf';

function fixture(id,model,sourceUrl,extra={}){
  return {
    id,
    manufacturer:'LiteGear',
    model,
    family:'LiteMat Plus',
    category:'Light',
    sourceType:'Rigid LED Soft Panel',
    colorMode:'Bi-Color',
    sourceUrl,
    cooling:'Passive',
    mount:'kMount',
    ...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'LiteGear',model,family:'LiteMat Plus',category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const LITEGEAR_LITEMAT_PLUS_FIXTURES=[
  fixture('litegear-litemat-plus-1','LiteMat Plus 1',PLUS1,{
    powerW:50,inputVoltage:'24V DC',ledQuantity:576,
    control:{
      fixtureNative:{
        local:false,dmx512:false,rdm:false,artNet:false,sacn:false,crmx:false,bluetooth:false,wifi:false,
        note:'LiteMat Plus 1 head is a passive 24V light engine; manufacturer-documented local, DMX and wireless control are provided by the external LiteDimmer Plus Duo.'
      },
      controller:{
        model:'LiteDimmer Plus DC200 DMX Duo',
        connectionToFixture:'PL7 power/control cable',
        local:true,
        dmx512:true,
        rdm:false,
        artNet:false,
        sacn:false,
        crmx:false,
        bluetooth:false,
        wifi:false,
        wireless:'Integrated transmitter/receiver radio; current public LiteGear Duo documentation does not identify the radio protocol as CRMX/LumenRadio.'
      },
      directLightingAI:[],
      externalInterfaceRequired:[
        'LiteDimmer Plus DC200 DMX Duo between fixture head and documented DMX/wireless control',
        'Wired DMX interface when LightingAI sends DMX512 directly'
      ],
      unavailableDirectProtocols:[
        'No manufacturer-documented RDM path for LiteDimmer Plus DC200 DMX Duo',
        'No manufacturer-documented Art-Net path for LiteDimmer Plus DC200 DMX Duo',
        'No manufacturer-documented sACN path for LiteDimmer Plus DC200 DMX Duo',
        'Do not claim CRMX/LumenRadio for the Duo integrated radio without an explicit current manufacturer protocol statement',
        'No manufacturer-documented Bluetooth control path',
        'No manufacturer-documented Wi-Fi control path'
      ],
      dmx:{
        profileAppliesAt:'LiteDimmer Plus DC200 DMX Duo',
        publicChannelTable:null,
        note:'LiteGear publicly identifies the Duo kit as DMX-capable, but no public model-specific DMX channel/profile table was found in the verified current sources.'
      },
      sourceUrls:[PLUS1,DIMMER_DUO,DIMMER_DUO_DATASHEET]
    }
  }),
  fixture('litegear-litemat-plus-2','LiteMat Plus 2',PLUS2,{
    powerW:100,inputVoltage:'24V DC',ledQuantity:1152,
    dimensions:'533 x 533 x 23 mm',weightKg:1.72,
    control:{
      fixtureNative:{
        local:false,dmx512:false,rdm:false,artNet:false,sacn:false,crmx:false,bluetooth:false,wifi:false,
        note:'LiteMat Plus 2 head is a passive 24V light engine; manufacturer-documented local, DMX and wireless control are provided by the external LiteDimmer Plus Duo.'
      },
      controller:{
        model:'LiteDimmer Plus DC200 DMX Duo',
        connectionToFixture:'PL7 power/control cable',
        local:true,
        dmx512:true,
        rdm:false,
        artNet:false,
        sacn:false,
        crmx:false,
        bluetooth:false,
        wifi:false,
        wireless:'Integrated transmitter/receiver radio; current public LiteGear Duo documentation does not identify the radio protocol as CRMX/LumenRadio.'
      },
      directLightingAI:[],
      externalInterfaceRequired:[
        'LiteDimmer Plus DC200 DMX Duo between fixture head and documented DMX/wireless control',
        'Wired DMX interface when LightingAI sends DMX512 directly'
      ],
      unavailableDirectProtocols:[
        'No manufacturer-documented RDM path for LiteDimmer Plus DC200 DMX Duo',
        'No manufacturer-documented Art-Net path for LiteDimmer Plus DC200 DMX Duo',
        'No manufacturer-documented sACN path for LiteDimmer Plus DC200 DMX Duo',
        'Do not claim CRMX/LumenRadio for the Duo integrated radio without an explicit current manufacturer protocol statement',
        'No manufacturer-documented Bluetooth control path',
        'No manufacturer-documented Wi-Fi control path'
      ],
      dmx:{
        profileAppliesAt:'LiteDimmer Plus DC200 DMX Duo',
        publicChannelTable:null,
        note:'LiteGear publicly identifies the Duo as DMX-capable, but no public model-specific DMX channel/profile table was found in the verified current sources.'
      },
      sourceUrls:[PLUS2,PLUS2_DATASHEET,DIMMER_DUO,DIMMER_DUO_DATASHEET]
    }
  }),
  fixture('litegear-litemat-plus-2l','LiteMat Plus 2L',FAMILY),
  fixture('litegear-litemat-plus-3','LiteMat Plus 3',FAMILY),
  fixture('litegear-litemat-plus-4','LiteMat Plus 4',FAMILY),
  fixture('litegear-litemat-plus-8','LiteMat Plus 8',FAMILY)
];

const rows=[
  ['1','litegear-litemat-plus-1',PLUS1],
  ['2','litegear-litemat-plus-2',PLUS2],
  ['2l','litegear-litemat-plus-2l',FAMILY],
  ['3','litegear-litemat-plus-3',FAMILY],
  ['4','litegear-litemat-plus-4',FAMILY],
  ['8','litegear-litemat-plus-8',FAMILY]
];

export const LITEGEAR_LITEMAT_PLUS_ACCESSORIES=[
  acc('litegear-litemat-plus-kmount','LiteMat Plus kMount','Mounting',LITEGEAR_LITEMAT_PLUS_FIXTURES.map(x=>x.id),FAMILY),
  ...rows.flatMap(([size,id,sourceUrl])=>[
    acc('litegear-litemat-plus-'+size+'-full-diffuser','LiteMat Plus '+size.toUpperCase()+' Full Diffuser','Diffusion',[id],sourceUrl,'Creates the fullest diffusion option for the LiteMat Plus surface.'),
    acc('litegear-litemat-plus-'+size+'-half-diffuser','LiteMat Plus '+size.toUpperCase()+' Half Diffuser','Diffusion',[id],sourceUrl,'Provides medium diffusion while retaining more output.'),
    acc('litegear-litemat-plus-'+size+'-quarter-diffuser','LiteMat Plus '+size.toUpperCase()+' Quarter Diffuser','Diffusion',[id],sourceUrl,'Provides light diffusion with minimal output loss.'),
    acc('litegear-litemat-plus-'+size+'-polyskirt','LiteMat Plus '+size.toUpperCase()+' PolySkirt','Light Control',[id],sourceUrl,'Controls spill around the panel perimeter.'),
    acc('litegear-litemat-plus-'+size+'-parasquare-louver','LiteMat Plus '+size.toUpperCase()+' Parasquare Louver','Grid',[id],sourceUrl,'Reduces spill and increases directionality.'),
    acc('litegear-litemat-plus-'+size+'-kitbag','LiteMat Plus '+size.toUpperCase()+' KitBag','Transport',[id],sourceUrl)
  ])
];
