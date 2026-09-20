// LiteGear LiteMat Spectrum Gen 2 catalog.
// Sources: official LiteGear product pages, data sheets, and Spectrum Gen 2 resources.
const RESOURCES='https://www.litegear.com/litemat-spectrum/resources/';
const S1='https://www.litegear.com/product/litemat-spectrum-1-kit-2023/';
const S2='https://www.litegear.com/product/litemat-spectrum-2-kit-2023/';
const S2L='https://www.litegear.com/download/557/litemat-spectrum-2023/47608/litemat-spectrum-2l-gen-2-data-sheet.pdf';
const S3='https://www.litegear.com/product/litemat-spectrum-3-kit-2023/';
const S4='https://www.litegear.com/download/557/litemat-spectrum-2023/47607/litemat-spectrum-4-gen-2-data-sheet.pdf';
const S8='https://www.litegear.com/product/litemat-spectrum-8-kit-2023/';
const DIMMER200='https://www.litegear.com/product/litedimmer-spectrum-ac-dc-200/';
const SPECTRUM_OS3_DMX='https://www.litegear.com/download/568/os-3-0/42315/spectrum-os-3-rdm-dmx-profile-tables.pdf';

function fixture(id,model,powerW,beamAngleDeg,pixels,weightKg,dimensions,sourceUrl,extra={}){
  return {
    id,manufacturer:'LiteGear',model,family:'LiteMat Spectrum Gen 2',category:'Light',
    sourceType:'Rigid LED Soft Panel',cctK:{min:2000,max:11000},
    colorMode:'6-color wide-gamut',powerW,sourceUrl,
    beamAngleDeg,cri:95,tlci:95,dimming:'0-100%',
    inputVoltage:'48V DC',powerDataConnector:'PDX',pixels,
    ipRating:'IP20',cooling:'Passive',mount:'kMount',
    weightKg,dimensions,
    ...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'LiteGear',model,family:'LiteMat Spectrum Gen 2',category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const LITEGEAR_LITEMAT_SPECTRUM_G2_FIXTURES=[
  fixture('litegear-litemat-spectrum-g2-1','LiteMat Spectrum 1 (Gen 2)',50,50,1,2.1,'295.4 x 535.4 x 25.4 mm',S1,{
    modelNumber:'251-1',ledQuantity:2592,
    control:{
      fixtureNative:{
        local:false,dmx512:false,rdm:false,artNet:false,sacn:false,crmx:false,bluetooth:false,wifi:false,
        note:'LiteMat Spectrum 1 head is a 48V PDX light engine; manufacturer-documented external control is provided by a compatible LiteDimmer Spectrum.'
      },
      controller:{
        model:'LiteDimmer Spectrum AC/DC 200',
        connectionToFixture:'PDX power/data',
        wired:['DMX512','RDM','Art-Net 4','sACN (E1.31)'],
        wireless:['CRMX'],
        builtInCRMX:true,
        bluetooth:false,
        wifi:false,
        dataConnectors:['5-pin DMX In/Thru','2x etherCON','internal CRMX antenna','USB-A','PDX']
      },
      directLightingAI:['Art-Net 4 via LiteDimmer Spectrum AC/DC 200 Ethernet','sACN (E1.31) via LiteDimmer Spectrum AC/DC 200 Ethernet'],
      externalInterfaceRequired:[
        'LiteDimmer Spectrum AC/DC 200 between fixture head and all documented control protocols',
        'Wired DMX interface when LightingAI sends DMX512 directly',
        'CRMX transmitter/bridge when LightingAI reaches the LiteDimmer through CRMX'
      ],
      unavailableDirectProtocols:[
        'No manufacturer-documented Bluetooth control path for LiteMat Spectrum 1 / LiteDimmer Spectrum AC/DC 200',
        'No manufacturer-documented Wi-Fi control path for LiteMat Spectrum 1 / LiteDimmer Spectrum AC/DC 200'
      ],
      dmx:{
        profileAppliesAt:'LiteDimmer Spectrum AC/DC 200 running Spectrum OS 3.x',
        officialProfileTable:SPECTRUM_OS3_DMX,
        rdmSupported:true,
        note:'DMX/RDM personalities are implemented by the LiteDimmer, not by the LiteMat head. Spectrum OS 3.0 publishes the official personality/channel tables.'
      },
      sourceUrls:[S1,DIMMER200,SPECTRUM_OS3_DMX]
    }
  }),
  fixture('litegear-litemat-spectrum-g2-2','LiteMat Spectrum 2 (Gen 2)',100,56,2,3.3,'535.4 x 535.4 x 25.4 mm',S2,{modelNumber:'252-1',ledQuantity:2592}),
  fixture('litegear-litemat-spectrum-g2-2l','LiteMat Spectrum 2L (Gen 2)',100,55,2,3.4,'295.4 x 1016 x 25.4 mm',S2L,{modelNumber:'253-1',ledQuantity:2592}),
  fixture('litegear-litemat-spectrum-g2-3','LiteMat Spectrum 3 (Gen 2)',150,55,3,4.3,'536 x 775.7 x 25.4 mm',S3,{modelNumber:'254-1',ledQuantity:3888}),
  fixture('litegear-litemat-spectrum-g2-4','LiteMat Spectrum 4 (Gen 2)',200,53,4,5.4,'536 x 1015.5 x 25.4 mm',S4,{modelNumber:'255-1',ledQuantity:5184}),
  fixture('litegear-litemat-spectrum-g2-8','LiteMat Spectrum 8 (Gen 2)',400,53,8,9.6,'1015.5 x 1015.5 x 25.4 mm',S8,{modelNumber:'256-1',ledQuantity:5184})
];

const all=LITEGEAR_LITEMAT_SPECTRUM_G2_FIXTURES.map(x=>x.id);
const upTo200=all.filter(id=>id!=='litegear-litemat-spectrum-g2-8');

export const LITEGEAR_LITEMAT_SPECTRUM_G2_ACCESSORIES=[
  acc('litegear-litedimmer-spectrum-acdc-200','LiteDimmer Spectrum AC/DC 200','Dimmer',upTo200,RESOURCES,'Provides local/DMX control, color control and dimming for compatible Spectrum Gen 2 fixtures.'),
  acc('litegear-litedimmer-spectrum-acdc-400','LiteDimmer Spectrum AC/DC 400','Dimmer',all,RESOURCES,'Provides local/DMX control, color control and dimming for compatible Spectrum Gen 2 fixtures.'),
  acc('litegear-pdx-extension-25','PDX Extension Cable 25 ft','Power/Data Cable',all,RESOURCES),
  acc('litegear-pdx-extension-50','PDX Extension Cable 50 ft','Power/Data Cable',all,RESOURCES),
  acc('litegear-kmount','kMount','Mounting',all,RESOURCES),

  ...[
    ['1','litegear-litemat-spectrum-g2-1',S1],
    ['2','litegear-litemat-spectrum-g2-2',S2],
    ['2L','litegear-litemat-spectrum-g2-2l',S2L],
    ['3','litegear-litemat-spectrum-g2-3',S3],
    ['4','litegear-litemat-spectrum-g2-4',S4],
    ['8','litegear-litemat-spectrum-g2-8',S8]
  ].flatMap(([size,id,sourceUrl])=>[
    acc('litegear-litemat-'+size.toLowerCase()+'-full-diffuser','LiteMat '+size+' Full Diffuser','Diffusion',[id],sourceUrl,'Creates the fullest diffusion option for the LiteMat surface.'),
    acc('litegear-litemat-'+size.toLowerCase()+'-half-diffuser','LiteMat '+size+' Half Diffuser','Diffusion',[id],sourceUrl,'Provides medium diffusion while retaining more output.'),
    acc('litegear-litemat-'+size.toLowerCase()+'-quarter-diffuser','LiteMat '+size+' Quarter Diffuser','Diffusion',[id],sourceUrl,'Provides light diffusion with minimal output loss.'),
    acc('litegear-litemat-'+size.toLowerCase()+'-polyskirt','LiteMat '+size+' PolySkirt','Light Control',[id],sourceUrl,'Controls spill around the panel perimeter.'),
    acc('litegear-litemat-'+size.toLowerCase()+'-kitbag','LiteMat '+size+' KitBag','Transport',[id],sourceUrl)
  ])
];
