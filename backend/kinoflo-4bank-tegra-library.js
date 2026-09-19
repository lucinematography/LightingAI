// Kino Flo 4Bank / Tegra fluorescent legacy family.
// Sources: official Kino Flo archive pages and manuals.
const FOURBANK='https://kinoflo.com/4bank/';
const FOURBANK_DMX='https://kinoflo.com/4bank-dmx/';
const TEGRA_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100061-archive-Rev-A-Tegra-4Bank-DMX-02-06-2013.pdf';
const FOURBANK_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100053-4Bank-DMX-Rev-A-4-28-2011.pdf';

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

export const KINOFLO_4BANK_TEGRA_FIXTURES=[
  fixture('kinoflo-2ft-4bank','2ft 4Bank','4Bank',FOURBANK,{lampCount:4,lampLengthFt:2}),
  fixture('kinoflo-4ft-4bank','4ft 4Bank','4Bank',FOURBANK,{lampCount:4,lampLengthFt:4}),
  fixture('kinoflo-tegra-4bank-dmx','Tegra 4Bank DMX','Tegra 4Bank',TEGRA_MANUAL,{lampCount:4,control:['DMX512','Local']})
];

export const KINOFLO_4BANK_TEGRA_ACCESSORIES=[
  acc('kinoflo-2ft-4bank-flozier-full','2ft 4Bank Flozier Full','4Bank','Diffusion',['kinoflo-2ft-4bank'],FOURBANK_MANUAL,'Softens and blends the 4Bank output.',{orderCode:'DFS-D4'}),
  acc('kinoflo-2ft-4bank-louver-black','2ft 4Bank Louver Black','4Bank','Grid',['kinoflo-2ft-4bank'],FOURBANK_MANUAL,'Controls spill from the fluorescent bank.',{orderCode:'LVR-2404-B'}),
  acc('kinoflo-4ft-4bank-flozier-full','4ft 4Bank Flozier Full','4Bank','Diffusion',['kinoflo-4ft-4bank'],FOURBANK_MANUAL,'Softens and blends the 4Bank output.',{orderCode:'DFS-4804'}),
  acc('kinoflo-4ft-4bank-louver-black','4ft 4Bank Louver Black','4Bank','Grid',['kinoflo-4ft-4bank'],FOURBANK_MANUAL,'Controls spill from the fluorescent bank.',{orderCode:'LVR-4804-B'}),
  acc('kinoflo-select-4bank-ballast-120','Select 4Bank Ballast 120VAC','4Bank','Control',['kinoflo-2ft-4bank','kinoflo-4ft-4bank'],FOURBANK,'Powers compatible 4Bank fixtures.',{orderCode:'BAL-400-S120'}),
  acc('kinoflo-4bank-dmx-ballast-120','4Bank Select/DMX Ballast 120VAC','4Bank','Control',['kinoflo-2ft-4bank','kinoflo-4ft-4bank'],FOURBANK_DMX,'Adds DMX-controlled ballast operation.',{orderCode:'BAL-450-120'}),
  acc('kinoflo-tegra-4bank-louver-black','Tegra 4Bank Louver Black','Tegra 4Bank','Grid',['kinoflo-tegra-4bank-dmx'],TEGRA_MANUAL,'Controls spill from the Tegra 4Bank fixture.'),
  acc('kinoflo-tegra-4bank-flozier','Tegra 4Bank Flozier','Tegra 4Bank','Diffusion',['kinoflo-tegra-4bank-dmx'],TEGRA_MANUAL,'Softens and blends the Tegra output.')
];
