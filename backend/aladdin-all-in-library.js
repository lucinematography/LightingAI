// Aladdin ALL-IN flexible RGB/Bi-Color lighting catalog.
// Sources: official Aladdin ALL-IN ONE/TWO and ALL-IN controller manuals.
const ALL_IN_ONE='https://aladdin-lights.com/wp-content/uploads/2024/02/ALL-IN-ONE-Manual-corrected-version-05.02.2024.pdf';
const ALL_IN_TWO='https://aladdin-lights.com/wp-content/uploads/2024/02/ALL-IN-TWO-Manual-corrected-version-05.02.2024.pdf';
const ALL_IN_CONTROLLER='https://aladdin-lights.com/wp-content/uploads/2024/02/ALL-IN-DIMMER-UNIT-Manual-05.02.2024.pdf';

function fixture(id,model,powerW,widthMm,heightMm,sourceUrl){
  return {
    id,manufacturer:'Aladdin',model,family:'ALL-IN',category:'Light',
    sourceType:'Flexible LED Panel',cctK:{min:2200,max:12000},
    colorMode:'RGB + Bi-Color',powerW,sourceUrl,
    cri:98,tlci:98,beamAngleDeg:140,dimming:'1-100%',
    cooling:'Passive',
    formFactor:`${widthMm} x ${heightMm} mm flexible LED panel`,
    control:['Bluetooth/App','On-board','Optional DMX512','Optional Wired Controller'],
    // Requires optional ALL-DMXAT attachment or ALL-WDIM controller (2024 model manuals, printed p. 5).
    // Widths only: no ALL-IN COLOR / MOSAIC personalities or channel values are inferred.
    dmxModes:[
      {name:'2ch White Bi-Color (optional DMX)',channels:2,verified:true,sourceUrl},
      {name:'3ch RGB (optional DMX)',channels:3,verified:true,sourceUrl}
    ],
    powerSupply:'100-240V AC / 12-15V DC'
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'Aladdin',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const ALADDIN_ALL_IN_FIXTURES=[
  fixture('aladdin-all-in-one','ALL-IN ONE',70,300,300,ALL_IN_ONE),
  fixture('aladdin-all-in-two','ALL-IN TWO',140,600,300,ALL_IN_TWO)
];

const all=['aladdin-all-in-one','aladdin-all-in-two'];

export const ALADDIN_ALL_IN_ACCESSORIES=[
  acc('aladdin-all-wdim','ALL-WDIM Wired Dimmer / Controller','Dimmer',all,ALL_IN_CONTROLLER,'Adds physical RGB, Bi-Color, HSI, filter, effect and DMX control.'),
  acc('aladdin-all-dmxat','ALL-DMXAT DMX Attachment','Control',all,ALL_IN_ONE,'Adds DMX512 control between the panel and power source.'),
  acc('aladdin-all-1x1-frame-kit','1X1 Frame Kit with Ballhead and Diffuser','Frame',['aladdin-all-in-one'],ALL_IN_ONE,'Adds rigid support, stand mounting and diffusion.'),
  acc('aladdin-all-1x2-frame-kit','1X2 Frame Kit with Ballhead and Diffuser','Frame',['aladdin-all-in-two'],ALL_IN_TWO,'Adds rigid support, stand mounting and diffusion.'),
  acc('aladdin-all-1x1-ball','1X1 Aladdin Ball with Diffuser','Lantern',['aladdin-all-in-one'],ALL_IN_ONE,'Creates a softer, rounder light source.'),
  acc('aladdin-all-1x2-ball','1X2 Aladdin Ball with Diffuser','Lantern',['aladdin-all-in-two'],ALL_IN_TWO,'Creates a softer, rounder light source.'),
  acc('aladdin-all-dtap-cable','ALL-IN D-Tap Power Cable','Power Cable',all,ALL_IN_ONE,'Enables compatible battery operation.'),
  acc('aladdin-all-extension','ALL-IN Extension Cable','Power Cable',all,ALL_IN_ONE),
  acc('aladdin-all-ac-adapter-one','ALL-IN ONE AC Adapter','Power',['aladdin-all-in-one'],ALL_IN_ONE),
  acc('aladdin-all-ac-adapter-two','ALL-IN TWO AC Adapter','Power',['aladdin-all-in-two'],ALL_IN_TWO)
];
