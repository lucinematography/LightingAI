// Kino Flo Micro-Flo + Mini-Flo legacy families.
// Sources: official Kino Flo archive manuals and parts pages.
const MICRO_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100013-Micro-Flo-System-Rev-10-05-2005-Web-Quality.pdf';
const MINI_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100014-Mini-Flo-System-Rev-B.-01-07-2008-Web-Quality.pdf';
const MINI_PARTS='https://kinoflo.com/mini-flo/';
const POWER_CABLES='https://kinoflo.com/power-cables/';
const EXTENSIONS='https://kinoflo.com/extensions/';

function fixture(id,model,family,sourceUrl,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category:'Light',
    sourceType:'Fluorescent Practical / Accent',status:'Legacy / Archive',
    sourceUrl,...extra
  };
}
function acc(id,model,family,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_MICRO_MINI_FIXTURES=[
  fixture('kinoflo-micro-flo-100mm','Micro-Flo 100mm','Micro-Flo',MICRO_MANUAL,{
    lampType:'T1.5 fluorescent',lampLengthMm:100,power:'12VDC'
  }),
  fixture('kinoflo-micro-flo-150mm','Micro-Flo 150mm','Micro-Flo',MICRO_MANUAL,{
    lampType:'T1.5 fluorescent',lampLengthMm:150,power:'12VDC'
  }),
  fixture('kinoflo-mini-flo-9','Mini-Flo 9in','Mini-Flo',MINI_MANUAL,{
    lampLengthIn:9,power:'12VDC'
  }),
  fixture('kinoflo-mini-flo-12','Mini-Flo 12in','Mini-Flo',MINI_MANUAL,{
    lampLengthIn:12,power:'12VDC'
  })
];

export const KINOFLO_MICRO_MINI_ACCESSORIES=[
  acc('kinoflo-micro-flo-bal-132','Micro-Flo Ballast BAL-132','Micro-Flo','Control',['kinoflo-micro-flo-100mm','kinoflo-micro-flo-150mm'],MICRO_MANUAL,'Remote 12VDC ballast for Micro-Flo lamps.',{orderCode:'BAL-132'}),
  acc('kinoflo-micro-flo-ref-100','Micro-Flo 100mm Reflector','Micro-Flo','Reflector',['kinoflo-micro-flo-100mm'],MICRO_MANUAL,'Provides reflector housing for the 100mm lamp.',{orderCode:'REF-100-M'}),
  acc('kinoflo-micro-flo-ref-150','Micro-Flo 150mm Reflector','Micro-Flo','Reflector',['kinoflo-micro-flo-150mm'],MICRO_MANUAL,'Provides reflector housing for the 150mm lamp.',{orderCode:'REF-150-M'}),
  acc('kinoflo-micro-flo-splitter','Micro-Flo Splitter 4-Pin XLR to 2 x Micro-Flo','Micro-Flo','Power',['kinoflo-micro-flo-100mm','kinoflo-micro-flo-150mm'],POWER_CABLES,null,{orderCode:'PWC-MX2'}),
  acc('kinoflo-micro-flo-extension','Micro-Flo Extension 6ft','Micro-Flo','Cable',['kinoflo-micro-flo-100mm','kinoflo-micro-flo-150mm'],EXTENSIONS,null,{orderCode:'XM3-6'}),

  acc('kinoflo-mini-flo-bal-139x','Mini-Flo Ballast 4-Pin XLR 12VDC','Mini-Flo','Control',['kinoflo-mini-flo-9','kinoflo-mini-flo-12'],MINI_PARTS,'Single Mini-Flo 12VDC ballast.',{orderCode:'BAL-139X'}),
  acc('kinoflo-mini-flo-bal-239x','Mini-Flo Double Ballast 12VDC with Universal VAC','Mini-Flo','Control',['kinoflo-mini-flo-9','kinoflo-mini-flo-12'],MINI_PARTS,'Dual Mini-Flo ballast with universal AC power supply.',{orderCode:'BAL-239X'}),
  acc('kinoflo-mini-flo-mount','Mini-Flo Mount','Mini-Flo','Mounting',['kinoflo-mini-flo-9','kinoflo-mini-flo-12'],MINI_MANUAL,null),
  acc('kinoflo-mini-flo-extension-12','Mini-Flo Extension 12ft','Mini-Flo','Cable',['kinoflo-mini-flo-9','kinoflo-mini-flo-12'],MINI_MANUAL,null)
];
