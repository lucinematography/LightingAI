// LiteGear LiteMat S2 legacy catalog.
// Sources: official LiteGear S2 catalog, data sheets and discontinued LiteMat support page.
const S2_CATALOG='https://www.litegear.com/wp-content/uploads/2019/06/S2-LiteMat-Catalog-1.pdf';
const S2_SUPPORT='https://www.litegear.com/about-discontinued-litemat/';
const S1='https://www.litegear.com/download/545/data-sheets/10000/s2-litemat-1-data-sheet.pdf';
const S1_PRODUCT='https://www.litegear.com/product/litemat-s2-1-kit-factory-certified-rental-overstock/';
const PRO_HYBRID='https://www.litegear.com/product/litedimmer-hybrid-8a/';
const PRO_HYBRID_GUIDE='https://www.litegear.com/download/308/litedimmer-pro/9984/litedimmer-pro-hybrid-user-guide.pdf';
const S2='https://www.litegear.com/product/litemat-s2-2-kit-factory-certified-rental-overstock/';
const S2L='https://www.litegear.com/wp-content/uploads/2019/06/S2-LiteMat-2L-Data-Sheet-1.pdf';
const S4='https://www.litegear.com/wp-content/uploads/2019/06/S2-LiteMat-4-Data-Sheet-1.pdf';

function fixture(id,model,powerW,ledQty,weightKg,dimensions,sourceUrl,extra={}){
  return {
    id,manufacturer:'LiteGear',model,family:'LiteMat S2',category:'Light',
    sourceType:'Rigid LED Soft Panel',colorMode:'Hybrid Bi-Color',
    cctK:{min:2600,max:6000},cri:95,tlci:95,
    powerW,inputVoltage:'12V DC',ledQuantity:ledQty,
    cooling:'Passive',mount:'kMount',
    weightKg,dimensions,sourceUrl,
    discontinued:true,
    ...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'LiteGear',model,family:'LiteMat S2',category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const LITEGEAR_LITEMAT_S2_FIXTURES=[
  fixture('litegear-litemat-s2-1','LiteMat S2 1',50,288,1.1,'292 x 533 x 23 mm',S1_PRODUCT,{
    control:{
      fixtureNative:{
        local:false,dmx512:false,rdm:false,artNet:false,sacn:false,crmx:false,bluetooth:false,wifi:false,
        note:'LiteMat S2 1 head is a passive 12V Hybrid light engine; manufacturer-documented control is provided by the external LiteDimmer Pro Hybrid.'
      },
      controller:{
        model:'LiteDimmer Pro Hybrid',
        connectionToFixture:'3-conductor HyConn / PH3 output path',
        local:true,
        dmx512:false,
        rdm:false,
        artNet:false,
        sacn:false,
        crmx:false,
        bluetooth:false,
        wifi:false,
        controls:['Kelvin','Level'],
        note:'Official LiteDimmer Pro Hybrid documentation describes local Kelvin and Level controls plus trigger/effect modes, but does not document DMX512, RDM, Art-Net, sACN, CRMX/LumenRadio, Bluetooth or Wi-Fi control.'
      },
      directLightingAI:[],
      externalInterfaceRequired:[
        'LiteDimmer Pro Hybrid between fixture head and documented local control'
      ],
      unavailableDirectProtocols:[
        'No manufacturer-documented DMX512 control path for LiteDimmer Pro Hybrid',
        'No manufacturer-documented RDM path for LiteDimmer Pro Hybrid',
        'No manufacturer-documented Art-Net path for LiteDimmer Pro Hybrid',
        'No manufacturer-documented sACN path for LiteDimmer Pro Hybrid',
        'No manufacturer-documented CRMX/LumenRadio path for LiteDimmer Pro Hybrid',
        'No manufacturer-documented Bluetooth control path',
        'No manufacturer-documented Wi-Fi control path'
      ],
      dmx:{
        profileAppliesAt:null,
        publicChannelTable:null,
        note:'No DMX profile is asserted because the verified LiteDimmer Pro Hybrid documentation does not expose a DMX512 control path.'
      },
      sourceUrls:[S1_PRODUCT,S1,PRO_HYBRID,PRO_HYBRID_GUIDE,S2_SUPPORT]
    }
  }),
  fixture('litegear-litemat-s2-2','LiteMat S2 2',100,576,1.6,'533 x 533 x 23 mm',S2,{
    control:{
      fixtureNative:{
        local:false,dmx512:false,rdm:false,artNet:false,sacn:false,crmx:false,bluetooth:false,wifi:false,
        note:'LiteMat S2 2 head is a passive 12V Hybrid light engine; manufacturer-documented control is provided by the external LiteDimmer Pro Hybrid.'
      },
      controller:{
        model:'LiteDimmer Pro Hybrid',
        connectionToFixture:'3-conductor HyConn / PH3 output path',
        local:true,
        dmx512:false,
        rdm:false,
        artNet:false,
        sacn:false,
        crmx:false,
        bluetooth:false,
        wifi:false,
        controls:['Kelvin','Level'],
        note:'Official LiteDimmer Pro Hybrid documentation describes local Kelvin and Level controls plus trigger/effect modes, but does not document DMX512, RDM, Art-Net, sACN, CRMX/LumenRadio, Bluetooth or Wi-Fi control.'
      },
      directLightingAI:[],
      externalInterfaceRequired:[
        'LiteDimmer Pro Hybrid between fixture head and documented local control'
      ],
      unavailableDirectProtocols:[
        'No manufacturer-documented DMX512 control path for LiteDimmer Pro Hybrid',
        'No manufacturer-documented RDM path for LiteDimmer Pro Hybrid',
        'No manufacturer-documented Art-Net path for LiteDimmer Pro Hybrid',
        'No manufacturer-documented sACN path for LiteDimmer Pro Hybrid',
        'No manufacturer-documented CRMX/LumenRadio path for LiteDimmer Pro Hybrid',
        'No manufacturer-documented Bluetooth control path',
        'No manufacturer-documented Wi-Fi control path'
      ],
      dmx:{
        profileAppliesAt:null,
        publicChannelTable:null,
        note:'No DMX profile is asserted because the verified LiteDimmer Pro Hybrid documentation does not expose a DMX512 control path.'
      },
      sourceUrls:[S2,PRO_HYBRID,PRO_HYBRID_GUIDE,S2_SUPPORT]
    }
  }),
  fixture('litegear-litemat-s2-2l','LiteMat S2 2L',100,576,1.6,'292 x 1016 x 23 mm',S2L),
  fixture('litegear-litemat-s2-3','LiteMat S2 3',150,864,2.1,'533 x 775 x 23 mm',S2_CATALOG),
  fixture('litegear-litemat-s2-4','LiteMat S2 4',200,1152,2.6,'533 x 1016 x 23 mm',S4)
];

const all=LITEGEAR_LITEMAT_S2_FIXTURES.map(x=>x.id);
const lowPower=all.filter(id=>id!=='litegear-litemat-s2-4');

export const LITEGEAR_LITEMAT_S2_ACCESSORIES=[
  acc('litegear-litedimmer-pro-hybrid','LiteDimmer Pro Hybrid','Dimmer',lowPower,S2_SUPPORT,'Controls intensity and hybrid CCT for compatible S2 LiteMat fixtures.'),
  acc('litegear-litedimmer-pro-hybrid-hicap','LiteDimmer Pro Hybrid High Capacity','Dimmer',all,S2_SUPPORT,'High-capacity intensity and hybrid CCT control, including LiteMat S2 4.'),
  acc('litegear-litemat-s2-kmount','kMount','Mounting',all,S2_CATALOG),
  acc('litegear-litemat-s2-phx-12','PHX Cable 12 ft','Power Cable',all,S2_CATALOG),
  ...[
    ['1','litegear-litemat-s2-1',S1],
    ['2','litegear-litemat-s2-2',S2],
    ['2l','litegear-litemat-s2-2l',S2L],
    ['3','litegear-litemat-s2-3',S2_CATALOG],
    ['4','litegear-litemat-s2-4',S4]
  ].flatMap(([size,id,sourceUrl])=>[
    acc('litegear-litemat-s2-'+size+'-full-diffuser','LiteMat S2 '+size.toUpperCase()+' Full Diffuser','Diffusion',[id],sourceUrl,'Creates the fullest diffusion option for the S2 panel.'),
    acc('litegear-litemat-s2-'+size+'-half-diffuser','LiteMat S2 '+size.toUpperCase()+' Half Diffuser','Diffusion',[id],sourceUrl,'Provides medium diffusion.'),
    acc('litegear-litemat-s2-'+size+'-quarter-diffuser','LiteMat S2 '+size.toUpperCase()+' Quarter Diffuser','Diffusion',[id],sourceUrl,'Provides light diffusion with minimal output loss.'),
    acc('litegear-litemat-s2-'+size+'-polyskirt','LiteMat S2 '+size.toUpperCase()+' PolySkirt','Light Control',[id],sourceUrl,'Controls spill around the fixture perimeter.'),
    acc('litegear-litemat-s2-'+size+'-parasquare-louver','LiteMat S2 '+size.toUpperCase()+' Parasquare Louver','Grid',[id],sourceUrl,'Reduces spill and increases directionality.')
  ])
];
