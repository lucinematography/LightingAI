// Kino Flo Image LED + Select LED legacy studio family.
// Sources: official Kino Flo product pages and archive material.
const IMAGE40='https://kinoflo.com/image-l40-led/';
const IMAGE80='https://kinoflo.com/image-l80-led/';
const SELECT='https://kinoflo.com/select-led/';
const SELECT_ARCHIVE='https://kinoflo.com/wp-content/uploads/2022/08/Select-3020-LED-DMX-1.pdf';

function fixture(id,model,family,sourceUrl,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category:'Light',
    sourceType:'LED Studio Softlight',status:'Legacy / Archive',sourceUrl,...extra
  };
}
function acc(id,model,family,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_IMAGE_SELECT_FIXTURES=[
  fixture('kinoflo-image-l40-led','Image L40 LED','Image LED',IMAGE40,{
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',cri:96,tlci:96,
    tm30:{rf:95,rg:103},voltage:'100-240VAC',currentA120V:2,
    dimensionsCm:{width:137,height:43,depth:16.5},weightKg:11.5,
    control:['Onboard','DMX512','LumenRadio wireless DMX'],
    dimming:'Full-range onboard and DMX'
  }),
  fixture('kinoflo-image-l80-led','Image L80 LED','Image LED',IMAGE80,{
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',
    voltage:'100-240VAC',currentA120V:4,
    dimensionsCm:{width:137,height:71,depth:16.5},weightKg:19,
    control:['Onboard','DMX512','LumenRadio wireless DMX'],
    dimming:'Full-range onboard and DMX'
  }),
  fixture('kinoflo-select-led-20','Select LED 20','Select LED',SELECT,{
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',
    voltage:'100-240VAC or 24VDC',control:['Onboard','DMX512','LumenRadio wireless DMX'],
    archiveSourceUrl:SELECT_ARCHIVE,discontinued:'2018-03'
  }),
  fixture('kinoflo-select-led-30','Select LED 30','Select LED',SELECT,{
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',
    voltage:'100-240VAC or 24VDC',control:['Onboard','DMX512','LumenRadio wireless DMX'],
    archiveSourceUrl:SELECT_ARCHIVE,discontinued:'2018-03'
  })
];

export const KINOFLO_IMAGE_SELECT_ACCESSORIES=[
  acc('kinoflo-image-l40-gel-frame','Image L40 Gel Frame','Image LED','Filter Holder',['kinoflo-image-l40-led'],IMAGE40,'Holds gel or diffusion media.',{orderCode:'GFR-I40',included:true}),
  acc('kinoflo-image-l40-louver','Image L40 Louver Silver','Image LED','Grid',['kinoflo-image-l40-led'],IMAGE40,'Controls spill and reduces off-axis output.',{orderCode:'LVR-I40-S',included:true}),
  acc('kinoflo-image-l40-barndoors','Image L40 Barndoors','Image LED','Barn Doors',['kinoflo-image-l40-led'],IMAGE40,'Shapes and cuts the beam.',{orderCode:'BRD-I40'}),
  acc('kinoflo-image-l80-gel-frame','Image L80 Gel Frame','Image LED','Filter Holder',['kinoflo-image-l80-led'],IMAGE80,'Holds gel or diffusion media.',{orderCode:'GFR-I80',included:true}),
  acc('kinoflo-image-l80-louver','Image L80 Louver Silver','Image LED','Grid',['kinoflo-image-l80-led'],IMAGE80,'Controls spill and reduces off-axis output.',{orderCode:'LVR-I80-S',included:true}),
  acc('kinoflo-image-l80-snapgrid-40','Image L80 SnapGrid 40 deg','Image LED','Grid',['kinoflo-image-l80-led'],IMAGE80,'Narrows and controls the softlight field.',{orderCode:'LVR-CE840-S'}),
  acc('kinoflo-select20-controller','Select LED 150 DMX Controller','Select LED','Control',['kinoflo-select-led-20'],SELECT,null,{orderCode:'LED-150X-120U/230U'}),
  acc('kinoflo-select20-diffuser','Select LED 20 Diffuser','Select LED','Diffusion',['kinoflo-select-led-20'],SELECT,'Softens the LED panel output.',{orderCode:'5340003'}),
  acc('kinoflo-select30-controller','Select LED 150 DMX Controller','Select LED','Control',['kinoflo-select-led-30'],SELECT,null,{orderCode:'LED-150X-120U/230U'}),
  acc('kinoflo-select30-louver-90','Select 30 Louver 90 deg','Select LED','Grid',['kinoflo-select-led-30'],SELECT,'Controls spill from the Select LED 30.',{orderCode:'LVR-SL390-P'})
];
