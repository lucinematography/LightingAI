// De Sisti Giotto Linear LED cyclorama family.
// Verified from current official De Sisti product page and 2025 mini catalog.
const SRC='https://www.desisti.it/giotto-led-cyclorama-light/';
const CAT='https://www.desisti.it/wp-content/uploads/mini-catalog-2025.pdf';

export const DESISTI_GIOTTO_LED_FIXTURES=[
  {
    id:'desisti-giotto-linear-vw',
    manufacturer:'De Sisti',
    model:'Giotto Linear VW',
    family:'Giotto Linear',
    category:'Light',
    sourceType:'Asymmetrical LED Cyclorama',
    ledPowerW:180,
    powerDrawW:200,
    cctK:{min:2700,max:6500},
    colorMode:'Vari-White',
    cri:95,
    tlci:96,
    ipRating:'IP20',
    weightKg:5.5,
    control:['DMX512/RDM','On-board','Optional W-DMX LumenRadio','Optional Art-Net','Optional sACN'],
    dmxModes:[
      {name:'8-bit',channels:2,verified:true,sourceUrl:SRC},
      {name:'16-bit',channels:3,verified:true,sourceUrl:SRC}
    ],
    sourceUrl:SRC
  },
  {
    id:'desisti-giotto-linear-vwc',
    manufacturer:'De Sisti',
    model:'Giotto Linear VW+C',
    family:'Giotto Linear',
    category:'Light',
    sourceType:'Asymmetrical Vari-White + Color LED Cyclorama',
    ledPowerW:230,
    powerDrawW:260,
    cctK:{min:1750,max:14500},
    colorMode:'Vari-White + RGBA',
    cri:95,
    tlci:96,
    ipRating:'IP20',
    weightKg:5.5,
    control:['DMX512/RDM','On-board','Optional W-DMX LumenRadio','Optional Art-Net','Optional sACN'],
    dmxModes:[
      {name:'8-bit base',channels:7,verified:true,sourceUrl:SRC},
      {name:'8-bit with mode/fan',channels:9,verified:true,sourceUrl:SRC},
      {name:'8-bit simple',channels:12,verified:true,sourceUrl:SRC},
      {name:'8-bit extended',channels:39,verified:true,sourceUrl:SRC},
      {name:'16-bit base',channels:8,verified:true,sourceUrl:SRC},
      {name:'16-bit with mode/fan',channels:10,verified:true,sourceUrl:SRC},
      {name:'16-bit simple',channels:13,verified:true,sourceUrl:SRC},
      {name:'16-bit extended',channels:40,verified:true,sourceUrl:SRC}
    ],
    colorControlModes:['RGBAWW','Gel','Vari-White + Color','Vari-White + Saturation','Ultra CRI','HSI','XY','FX','Sources'],
    sourceUrl:SRC
  }
];

const ALL=DESISTI_GIOTTO_LED_FIXTURES.map(x=>x.id);

export const DESISTI_GIOTTO_LED_ACCESSORIES=[
  {
    id:'desisti-giotto-linear-manual-yoke',
    manufacturer:'De Sisti',
    model:'Giotto Linear Positive-Lock Manual Yoke',
    category:'Mounting',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    sourceUrl:SRC
  },
  {
    id:'desisti-giotto-linear-pole-yoke',
    manufacturer:'De Sisti',
    model:'Giotto Linear Pole-Operated Yoke',
    category:'Mounting',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    sourceUrl:SRC
  },
  {
    id:'desisti-giotto-linear-wdmx',
    manufacturer:'De Sisti',
    model:'Giotto Linear Optional W-DMX LumenRadio Interface',
    category:'Control',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    sourceUrl:SRC
  },
  {
    id:'desisti-giotto-linear-artnet-sacn',
    manufacturer:'De Sisti',
    model:'Giotto Linear Optional Art-Net / sACN Interface',
    category:'Control',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    sourceUrl:SRC
  },
  {
    id:'desisti-giotto-linear-5pin-dmx',
    manufacturer:'De Sisti',
    model:'Giotto Linear 5-pin DMX Data Cable',
    category:'DMX Cable',
    compatibilityStatus:'Compatible',
    compatibleWith:ALL,
    sourceUrl:SRC
  },
  {
    id:'desisti-giotto-linear-power-pass',
    manufacturer:'De Sisti',
    model:'Giotto Linear Power Pass-Through Cable',
    category:'Power / Cable',
    compatibilityStatus:'Compatible',
    compatibleWith:ALL,
    sourceUrl:CAT
  }
];
