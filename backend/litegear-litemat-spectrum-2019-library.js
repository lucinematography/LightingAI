// LiteGear LiteMat Spectrum (2019) catalog.
// Sources: official LiteGear 2019 Spectrum product pages and current Spectrum compatibility documentation.
const S2='https://www.litegear.com/product/litemat-spectrum-2/';
const S4='https://www.litegear.com/product/litemat-spectrum-4/';
const SPECTRUM='https://www.litegear.com/litemat-spectrum/';
const INTRO='https://www.litegear.com/litemat-spectrum-intro-page/';
const S2_DATASHEET='https://www.litegear.com/wp-content/uploads/2019/10/LiteMat-Spectrum-2-Data-Sheet.pdf';
const S4_DATASHEET='https://www.litegear.com/wp-content/uploads/2019/10/LiteMat-Spectrum-4-Data-Sheet.pdf';
const DC200='https://www.litegear.com/wpfd_file/litedimmer-spectrum-dc-200-user-guide/';
const OS22='https://www.litegear.com/about-spectrum-os-2-2/';

function fixture(id,model,pixels,sourceUrl,extra={}){
  return {
    id,manufacturer:'LiteGear',model,family:'LiteMat Spectrum 2019',category:'Light',
    sourceType:'Rigid LED Soft Panel',colorMode:'Full Color',sourceUrl,
    cctK:{min:2000,max:11000},cooling:'Passive',mount:'kMount',pixels,
    ...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'LiteGear',model,family:'LiteMat Spectrum 2019',category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const LITEGEAR_LITEMAT_SPECTRUM_2019_FIXTURES=[
  fixture('litegear-litemat-spectrum-2019-2','LiteMat Spectrum 2 (2019)',2,S2,{
    sku:'LM1.00112',powerW:100,inputVoltage:'48V DC',ledQuantity:2592,
    dimensions:'533 x 533 x 23 mm',weightKg:1.9,
    control:{
      fixtureNative:{
        local:false,dmx512:false,rdm:false,artNet:false,sacn:false,crmx:false,bluetooth:false,wifi:false,
        note:'LiteMat Spectrum 2 (2019) head is a passive 48V light engine; manufacturer-documented control is provided by the external LiteDimmer Spectrum DC 200.'
      },
      controller:{
        model:'LiteDimmer Spectrum DC 200',
        local:true,
        dmx512:true,
        rdm:true,
        artNet:false,
        sacn:false,
        crmx:false,
        bluetooth:false,
        wifi:false,
        firmware:'Spectrum OS 2.2'
      },
      directLightingAI:[],
      externalInterfaceRequired:[
        'LiteDimmer Spectrum DC 200 between fixture head and documented control',
        'Wired DMX interface when LightingAI sends DMX512 directly'
      ],
      unavailableDirectProtocols:[
        'No manufacturer-documented Art-Net path for LiteDimmer Spectrum DC 200',
        'No manufacturer-documented sACN path for LiteDimmer Spectrum DC 200',
        'No manufacturer-documented CRMX/LumenRadio path for LiteDimmer Spectrum DC 200',
        'No manufacturer-documented Bluetooth control path',
        'No manufacturer-documented Wi-Fi control path'
      ],
      dmx:{
        profileAppliesAt:'LiteDimmer Spectrum DC 200 running Spectrum OS 2.2',
        publicChannelTable:null,
        note:'LiteGear documents DMX improvements and a unique RDM ID in Spectrum OS 2.2 for the DC 200; no channel table is asserted here unless a directly verified public profile table is available.'
      },
      sourceUrls:[S2,S2_DATASHEET,DC200,OS22]
    }
  }),
  fixture('litegear-litemat-spectrum-2019-4','LiteMat Spectrum 4 (2019)',4,S4,{
    sku:'LM1.00109',powerW:200,inputVoltage:'48V DC',ledQuantity:5184,
    dimensions:'533 x 1016 x 23 mm',weightKg:3.4,
    control:{
      fixtureNative:{
        local:false,dmx512:false,rdm:false,artNet:false,sacn:false,crmx:false,bluetooth:false,wifi:false,
        note:'LiteMat Spectrum 4 (2019) head is a passive 48V light engine; manufacturer-documented control is provided by the external LiteDimmer Spectrum DC 200.'
      },
      controller:{
        model:'LiteDimmer Spectrum DC 200',
        local:true,
        dmx512:true,
        rdm:true,
        artNet:false,
        sacn:false,
        crmx:false,
        bluetooth:false,
        wifi:false,
        firmware:'Spectrum OS 2.2'
      },
      directLightingAI:[],
      externalInterfaceRequired:[
        'LiteDimmer Spectrum DC 200 between fixture head and documented control',
        'Wired DMX interface when LightingAI sends DMX512 directly'
      ],
      unavailableDirectProtocols:[
        'No manufacturer-documented Art-Net path for LiteDimmer Spectrum DC 200',
        'No manufacturer-documented sACN path for LiteDimmer Spectrum DC 200',
        'No manufacturer-documented CRMX/LumenRadio path for LiteDimmer Spectrum DC 200',
        'No manufacturer-documented Bluetooth control path',
        'No manufacturer-documented Wi-Fi control path'
      ],
      dmx:{
        profileAppliesAt:'LiteDimmer Spectrum DC 200 running Spectrum OS 2.2',
        pixelCount:4,
        pixelModeChannels:20,
        publicChannelTable:null,
        note:'The official DC 200 user guide states that LiteMat Spectrum 4 uses 20 DMX channels with PIXEL ON. Spectrum OS 2.2 is the documented firmware line for the DC 200.'
      },
      sourceUrls:[S4,S4_DATASHEET,DC200,OS22]
    }
  })
];

const all=LITEGEAR_LITEMAT_SPECTRUM_2019_FIXTURES.map(x=>x.id);

export const LITEGEAR_LITEMAT_SPECTRUM_2019_ACCESSORIES=[
  acc('litegear-litemat-spectrum-2019-acdc-200','LiteDimmer Spectrum AC/DC 200','Dimmer',all,SPECTRUM,'Provides Spectrum color and dimming control; LiteGear documents backward compatibility with first-generation LiteMat Spectrum.'),
  acc('litegear-litemat-spectrum-2019-acdc-400','LiteDimmer Spectrum AC/DC 400','Dimmer',all,SPECTRUM,'Provides Spectrum color and dimming control; LiteGear documents backward compatibility with first-generation LiteMat Spectrum.'),
  acc('litegear-litemat-spectrum-2019-diffuser','LiteMat Spectrum Diffuser','Diffusion',all,INTRO,'Head-mounted diffusion compatible with the original LiteMat Spectrum platform.'),
  acc('litegear-litemat-spectrum-2019-polyskirt','LiteMat Spectrum PolySkirt','Light Control',all,INTRO,'Controls spill around the LiteMat Spectrum head.'),
  acc('litegear-litemat-spectrum-2019-snapgrid','LiteMat Spectrum SnapGrid','Grid',all,INTRO,'Controls spill and increases directionality.')
];
