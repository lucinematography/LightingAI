// LiteGear LiteMat Spectrum (2019) catalog.
// Sources: official LiteGear 2019 Spectrum product pages and current Spectrum compatibility documentation.
const S2='https://www.litegear.com/product/litemat-spectrum-2/';
const S4='https://www.litegear.com/product/litemat-spectrum-4/';
const SPECTRUM='https://www.litegear.com/litemat-spectrum/';
const INTRO='https://www.litegear.com/litemat-spectrum-intro-page/';

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
  fixture('litegear-litemat-spectrum-2019-2','LiteMat Spectrum 2 (2019)',2,S2,{sku:'LM1.00112',weightLb:2.626,dimensions:'23 x 12 x 1.5 in'}),
  fixture('litegear-litemat-spectrum-2019-4','LiteMat Spectrum 4 (2019)',4,S4,{sku:'LM1.00109',weightLb:7.4,thicknessIn:0.9})
];

const all=LITEGEAR_LITEMAT_SPECTRUM_2019_FIXTURES.map(x=>x.id);

export const LITEGEAR_LITEMAT_SPECTRUM_2019_ACCESSORIES=[
  acc('litegear-litemat-spectrum-2019-acdc-200','LiteDimmer Spectrum AC/DC 200','Dimmer',all,SPECTRUM,'Provides Spectrum color and dimming control; LiteGear documents backward compatibility with first-generation LiteMat Spectrum.'),
  acc('litegear-litemat-spectrum-2019-acdc-400','LiteDimmer Spectrum AC/DC 400','Dimmer',all,SPECTRUM,'Provides Spectrum color and dimming control; LiteGear documents backward compatibility with first-generation LiteMat Spectrum.'),
  acc('litegear-litemat-spectrum-2019-diffuser','LiteMat Spectrum Diffuser','Diffusion',all,INTRO,'Head-mounted diffusion compatible with the original LiteMat Spectrum platform.'),
  acc('litegear-litemat-spectrum-2019-polyskirt','LiteMat Spectrum PolySkirt','Light Control',all,INTRO,'Controls spill around the LiteMat Spectrum head.'),
  acc('litegear-litemat-spectrum-2019-snapgrid','LiteMat Spectrum SnapGrid','Grid',all,INTRO,'Controls spill and increases directionality.')
];
