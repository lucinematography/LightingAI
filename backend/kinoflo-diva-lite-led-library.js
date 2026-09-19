// Kino Flo Diva-Lite LED family.
// Sources: official Kino Flo product pages and archive downloads.
const D2030='https://kinoflo.com/diva-lite-20-30-led/';
const D21='https://kinoflo.com/diva-lite-21-led/';
const D31='https://kinoflo.com/diva-lite-31-led/';
const D41='https://kinoflo.com/diva-lite-41-led/';

function fixture(id,model,sourceUrl){
  return {
    id,manufacturer:'Kino Flo',model,family:'Diva-Lite LED',category:'Light',
    sourceType:'LED Softlight',status:'Legacy / Archive',sourceUrl,
    control:['Onboard','DMX512','LumenRadio wireless DMX']
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family:'Diva-Lite LED',category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_DIVA_LITE_LED_FIXTURES=[
  fixture('kinoflo-diva-lite-20-led','Diva-Lite 20 LED DMX',D2030),
  fixture('kinoflo-diva-lite-30-led','Diva-Lite 30 LED DMX',D2030),
  fixture('kinoflo-diva-lite-21-led','Diva-Lite 21 LED DMX',D21),
  fixture('kinoflo-diva-lite-31-led','Diva-Lite 31 LED DMX',D31),
  fixture('kinoflo-diva-lite-41-led','Diva-Lite 41 LED DMX',D41)
];

export const KINOFLO_DIVA_LITE_LED_ACCESSORIES=[
  acc('kinoflo-diva20-snapbag','Diva-Lite 20 SnapBag w/ 2 x Diffusion','Diffusion',['kinoflo-diva-lite-20-led'],D2030,'Softens and enlarges the apparent source.',{orderCode:'DFS-FS21-S'}),
  acc('kinoflo-diva20-snapgrid-40','Diva-Lite 20 SnapGrid 40 deg','Grid',['kinoflo-diva-lite-20-led'],D2030,'Controls spill and narrows off-axis output.',{orderCode:'LVR-FS240-S'}),
  acc('kinoflo-diva30-snapbag','Diva-Lite 30 SnapBag w/ 2 x Diffusion','Diffusion',['kinoflo-diva-lite-30-led'],D2030,'Softens and enlarges the apparent source.',{orderCode:'DFS-FS31-S'}),
  acc('kinoflo-diva30-snapgrid-40','Diva-Lite 30 SnapGrid 40 deg','Grid',['kinoflo-diva-lite-30-led'],D2030,'Controls spill and narrows off-axis output.',{orderCode:'LVR-FS340-S'}),
  acc('kinoflo-diva21-louver','Diva-Lite 21 Louver','Grid',['kinoflo-diva-lite-21-led'],D21,'Controls spill from the fixture face.'),
  acc('kinoflo-diva31-louver','Diva-Lite 31 Louver','Grid',['kinoflo-diva-lite-31-led'],D31,'Controls spill from the fixture face.'),
  acc('kinoflo-diva41-snapbag','Diva-Lite 41 SnapBag w/ 2 x Diffusion','Diffusion',['kinoflo-diva-lite-41-led'],D41,'Softens and enlarges the apparent source.',{orderCode:'DFS-FS41-S'}),
  acc('kinoflo-diva41-snapgrid-40','Diva-Lite 41 SnapGrid 40 deg','Grid',['kinoflo-diva-lite-41-led'],D41,'Controls spill and narrows off-axis output.',{orderCode:'LVR-FS440-S'}),
  acc('kinoflo-diva41-barndoors','Diva-Lite 41 Barndoors (Set of 2)','Barn Doors',['kinoflo-diva-lite-41-led'],D41,'Shapes and cuts the softlight beam.',{orderCode:'BRD-D41'})
];
