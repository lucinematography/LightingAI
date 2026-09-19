// Kino Flo Blanket-Lite + Flathead 80 fluorescent legacy families.
// Sources: official Kino Flo archive manuals and parts pages.
const BLANKET_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100046-Blanket-Light-Rev-A-01-07-2008-Web-Quality.pdf';
const BLANKET_FRAME='https://kinoflo.com/wp-content/uploads/2022/07/FRM-6X6.pdf';
const FLATHEAD_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100076-Flathead-80-DMX-Rev-A-01-23-2014.pdf';
const FLATHEAD_PARTS='https://kinoflo.com/wp-content/uploads/2022/07/CFX-4808-1.pdf';
const MOUNTS='https://kinoflo.com/mounts/';

function fixture(id,model,family,sourceUrl,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category:'Light',
    sourceType:'Fluorescent Softlight',status:'Legacy / Archive',sourceUrl,...extra
  };
}
function acc(id,model,family,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_BLANKET_FLATHEAD_FIXTURES=[
  fixture('kinoflo-blanket-lite-6x6','Blanket-Lite 6X6','Blanket-Lite',BLANKET_MANUAL,{
    lampCount:16,lampLengthFt:6,control:['Mega 4Bank DMX ballast']
  }),
  fixture('kinoflo-flathead-80','Flathead 80','Flathead',FLATHEAD_MANUAL,{
    control:['4Bank ballast','4Bank DMX ballast']
  })
];

export const KINOFLO_BLANKET_FLATHEAD_ACCESSORIES=[
  acc('kinoflo-blanket-frame-6x6','Blanket-Lite 6X6 Frame Assembly','Blanket-Lite','Mounting',['kinoflo-blanket-lite-6x6'],BLANKET_FRAME,null),
  acc('kinoflo-blanket-reflector-6x6','Blanket-Lite 6X6 Reflector','Blanket-Lite','Reflector',['kinoflo-blanket-lite-6x6'],BLANKET_MANUAL,'Returns and redirects rear spill toward the working side.'),
  acc('kinoflo-blanket-diffuser-6x6','Blanket-Lite 6X6 Diffuser','Blanket-Lite','Diffusion',['kinoflo-blanket-lite-6x6'],BLANKET_MANUAL,'Softens and blends the sixteen-lamp field.'),
  acc('kinoflo-blanket-louver-6x6','Blanket-Lite 6X6 Egg Crate Louver','Blanket-Lite','Grid',['kinoflo-blanket-lite-6x6'],BLANKET_MANUAL,'Controls spill from the large soft source.'),
  acc('kinoflo-blanket-mega4bank-dmx-ballast','Mega 4Bank DMX Ballast','Blanket-Lite','Control',['kinoflo-blanket-lite-6x6'],BLANKET_MANUAL,'Powers and DMX-controls the Blanket-Lite lamp banks.'),

  acc('kinoflo-flathead-cardholder','Image/Flathead 80 Cardholder','Flathead','Mounting',['kinoflo-flathead-80'],FLATHEAD_PARTS,null),
  acc('kinoflo-flathead-kino81-mount','Kino 81 Mount w/ Junior Pin','Flathead','Mounting',['kinoflo-flathead-80'],MOUNTS,null),
  acc('kinoflo-flathead-4bank-dmx-ballast','4Bank DMX Ballast','Flathead','Control',['kinoflo-flathead-80'],FLATHEAD_MANUAL,'Powers and DMX-controls the Flathead 80 fixture.')
];
