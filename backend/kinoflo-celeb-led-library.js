// Kino Flo Celeb LED legacy family.
const CE250='https://kinoflo.com/celeb-250-led-dmx/';
const CE450='https://kinoflo.com/celeb-450-led-dmx/';
const CE450Q='https://kinoflo.com/celeb-450q-led-dmx/';
const CE850='https://kinoflo.com/celeb-850-led-dmx/';

function fixture(id,model,sourceUrl,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family:'Celeb LED',category:'Light',
    sourceType:'LED Softlight',status:'Discontinued / Archive',sourceUrl,
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',
    cri:96,tlci:96,tm30:{rf:95,rg:103},
    dimming:'Full-range onboard / DMX',
    control:['DMX512','LumenRadio wireless DMX'],
    ...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family:'Celeb LED',category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_CELEB_LED_FIXTURES=[
  fixture('kinoflo-celeb-250-led-dmx','Celeb 250 LED DMX',CE250,{voltage:'100-240VAC or 24VDC',dimensionsCm:{width:61,height:35.5,depth:13},weightKg:7}),
  fixture('kinoflo-celeb-450-led-dmx','Celeb 450 LED DMX',CE450,{voltage:'100-240VAC',dimensionsCm:{width:114.5,height:36,depth:13},weightKg:12}),
  fixture('kinoflo-celeb-450q-led-dmx','Celeb 450Q LED DMX',CE450Q,{voltage:'100-240VAC',dimensionsCm:{width:76,height:66}}),
  fixture('kinoflo-celeb-850-led-dmx','Celeb 850 LED DMX',CE850,{voltage:'100-240VAC',dimensionsCm:{width:114,height:65,depth:15},weightKg:18})
];

export const KINOFLO_CELEB_LED_ACCESSORIES=[
  acc('kinoflo-celeb250-snapbag','Celeb 250 SnapBag w/ 2 x Diffusion','Diffusion',['kinoflo-celeb-250-led-dmx'],CE250,'Softens and enlarges the apparent source.'),
  acc('kinoflo-celeb250-snapgrid-40','Celeb 250 SnapGrid 40 deg','Grid',['kinoflo-celeb-250-led-dmx'],CE250,'Controls spill and narrows off-axis output.'),
  acc('kinoflo-celeb450-snapbag','Celeb 450 SnapBag w/ 2 x Diffusion','Diffusion',['kinoflo-celeb-450-led-dmx'],CE450,'Softens and enlarges the apparent source.'),
  acc('kinoflo-celeb450-snapgrid-40','Celeb 450 SnapGrid 40 deg','Grid',['kinoflo-celeb-450-led-dmx'],CE450,'Controls spill and narrows off-axis output.'),
  acc('kinoflo-celeb450q-snapgrid-40','Celeb 450Q SnapGrid 40 deg','Grid',['kinoflo-celeb-450q-led-dmx'],CE450Q,'Controls spill and narrows off-axis output.'),
  acc('kinoflo-celeb450q-barndoors','Celeb 450Q Barndoors','Barn Doors',['kinoflo-celeb-450q-led-dmx'],CE450Q,'Shapes and cuts the softlight beam.'),
  acc('kinoflo-celeb850-junior-pin','Celeb 850 Junior Pin Assembly','Mounting',['kinoflo-celeb-850-led-dmx'],CE850,null),
  acc('kinoflo-celeb850-center-hanging-adapter','Celeb 850 Center Hanging Adapter','Mounting',['kinoflo-celeb-850-led-dmx'],CE850,null)
];
