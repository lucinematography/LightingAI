// LiteGear LiteMat S2 legacy catalog.
// Sources: official LiteGear S2 catalog, data sheets and discontinued LiteMat support page.
const S2_CATALOG='https://www.litegear.com/wp-content/uploads/2019/06/S2-LiteMat-Catalog-1.pdf';
const S2_SUPPORT='https://www.litegear.com/about-discontinued-litemat/';
const S1='https://www.litegear.com/download/545/data-sheets/10000/s2-litemat-1-data-sheet.pdf';
const S2='https://www.litegear.com/product/litemat-s2-2-kit-factory-certified-rental-overstock/';
const S2L='https://www.litegear.com/wp-content/uploads/2019/06/S2-LiteMat-2L-Data-Sheet-1.pdf';
const S4='https://www.litegear.com/wp-content/uploads/2019/06/S2-LiteMat-4-Data-Sheet-1.pdf';

function fixture(id,model,powerW,ledQty,weightKg,dimensions,sourceUrl){
  return {
    id,manufacturer:'LiteGear',model,family:'LiteMat S2',category:'Light',
    sourceType:'Rigid LED Soft Panel',colorMode:'Hybrid Bi-Color',
    cctK:{min:2600,max:6000},cri:95,tlci:95,
    powerW,inputVoltage:'12V DC',ledQuantity:ledQty,
    cooling:'Passive',mount:'kMount',
    weightKg,dimensions,sourceUrl,
    discontinued:true
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'LiteGear',model,family:'LiteMat S2',category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const LITEGEAR_LITEMAT_S2_FIXTURES=[
  fixture('litegear-litemat-s2-1','LiteMat S2 1',50,288,1.1,'292 x 533 x 23 mm',S1),
  fixture('litegear-litemat-s2-2','LiteMat S2 2',100,576,1.6,'533 x 533 x 23 mm',S2),
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
