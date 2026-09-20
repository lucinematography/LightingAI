// Kino Flo Image 87 / 47 fluorescent DMX legacy family.
// Source: official Kino Flo operation manual.
const IMAGE_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100066-Rev-A-IMAGE-87-47-DMX-Rev-6-12-2013-Web-Quality-1.pdf';

function fixture(id,model,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family:'Image Fluorescent',category:'Light',
    sourceType:'Fluorescent Softlight',status:'Legacy / Archive',sourceUrl:IMAGE_MANUAL,...extra
  };
}
function acc(id,model,category,compatibleWith,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family:'Image Fluorescent',category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl:IMAGE_MANUAL,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_IMAGE_87_47_FIXTURES=[
  fixture('kinoflo-image-47-dmx','Image 47 DMX',{lampCount:4,lampType:'F75T12',voltage:'100-240VAC',control:['DMX512','Local'],dmxModes:[{name:'1ch all lamps',channels:1,verified:true,sourceUrl:IMAGE_MANUAL},{name:'5ch individual lamps + HO/Std',channels:5,verified:true,sourceUrl:IMAGE_MANUAL}]}),
  fixture('kinoflo-image-87-dmx','Image 87 DMX',{lampCount:8,lampType:'F75T12',voltage:'100-240VAC',control:['DMX512','Local'],dmxModes:[{name:'1ch all lamps',channels:1,verified:true,sourceUrl:IMAGE_MANUAL},{name:'9ch individual lamps + HO/Std',channels:9,verified:true,sourceUrl:IMAGE_MANUAL}]})
];

export const KINOFLO_IMAGE_87_47_ACCESSORIES=[
  acc('kinoflo-image47-gel-frame','Image 47 Gel Frame','Filter Holder',['kinoflo-image-47-dmx'],'Holds gel or diffusion media.'),
  acc('kinoflo-image47-silver-louver','Image 47 Silver Louver','Grid',['kinoflo-image-47-dmx'],'Controls spill and off-axis light.'),
  acc('kinoflo-image87-gel-frame','Image 87 Gel Frame','Filter Holder',['kinoflo-image-87-dmx'],'Holds gel or diffusion media.'),
  acc('kinoflo-image87-silver-louver','Image 87 Silver Louver','Grid',['kinoflo-image-87-dmx'],'Controls spill and off-axis light.')
];
