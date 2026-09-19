// LiteGear LiteMat Plus catalog.
// Source: official LiteGear LiteMat Plus product family and product pages.
const FAMILY='https://www.litegear.com/litemat-plus-product-family/';
const PLUS1='https://www.litegear.com/product/litemat-plus-one-kitd/';

function fixture(id,model,sourceUrl){
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
    mount:'kMount'
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'LiteGear',model,family:'LiteMat Plus',category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const LITEGEAR_LITEMAT_PLUS_FIXTURES=[
  fixture('litegear-litemat-plus-1','LiteMat Plus 1',PLUS1),
  fixture('litegear-litemat-plus-2','LiteMat Plus 2',FAMILY),
  fixture('litegear-litemat-plus-2l','LiteMat Plus 2L',FAMILY),
  fixture('litegear-litemat-plus-3','LiteMat Plus 3',FAMILY),
  fixture('litegear-litemat-plus-4','LiteMat Plus 4',FAMILY),
  fixture('litegear-litemat-plus-8','LiteMat Plus 8',FAMILY)
];

const rows=[
  ['1','litegear-litemat-plus-1',PLUS1],
  ['2','litegear-litemat-plus-2',FAMILY],
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
