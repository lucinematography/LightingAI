// EV LIGHT GEMX large-format cinema panels.
// Model identities are kept conservative here; detailed photometrics/specs are intentionally
// omitted until they are locked to a model-specific manufacturer page.
const FILM='https://www.evlightpro.com/led-film-lighting/';
const GEMX24ST='https://www.evlightpro.com/led-soft-light-panel/68692360.html';
const ACCESSORIES='https://www.evlightpro.com/accessories/';

function fixture(id,model,sourceType){
  return {
    id,
    manufacturer:'EV Light',
    model,
    family:'GEMX',
    category:'Light',
    sourceType,
    sourceUrl:FILM
  };
}
function acc(id,model,category,compatibleWith,effectOnLight){
  return {
    id,
    manufacturer:'EV Light',
    model,
    family:'GEMX',
    category,
    compatibilityStatus:'Designed For',
    compatibleWith,
    sourceUrl:ACCESSORIES,
    ...(effectOnLight?{effectOnLight}:{})
  };
}

export const EVLIGHT_GEMX_LARGE_FIXTURES=[
  {
    ...fixture('evlight-gemx24-st','GEMX24 ST','Large-format LED Soft Panel'),
    sourceUrl:GEMX24ST,
    powerW:1300,
    cctK:{min:2700,max:10000},
    colorMode:'Full RGB+W Color Gamut',
    beamAngleDeg:110,
    cri:97,
    tlci:98,
    ipRating:'IP65',
    pwm:'20 kHz',
    control:{
      wired:['DMX512','RDM'],
      wireless:['App control','WiFi-DMX','Wireless DMX'],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['External verified bridge required for LightingAI Art-Net/sACN control'],
      unavailableDirectProtocols:[
        'Official EV Light GEMX24 ST product information does not identify Wireless DMX as CRMX/LumenRadio',
        'Official EV Light GEMX24 ST product information does not publish Art-Net or sACN network input'
      ],
      sourceUrls:[GEMX24ST,FILM]
    }
  },
  fixture('evlight-gemx28-hard','GEMX28 HARD','Large-format LED Hard Panel')
];

const all=EVLIGHT_GEMX_LARGE_FIXTURES.map(x=>x.id);

export const EVLIGHT_GEMX_LARGE_ACCESSORIES=[
  acc('evlight-gemx-large-softbox','EV LIGHT GEMX Large Panel Softbox','Softbox',all,'Softens and enlarges the apparent source.'),
  acc('evlight-gemx-large-cellular-grille','EV LIGHT GEMX Large Panel Cellular Grille','Grid',all,'Controls spill and narrows off-axis spread.')
];
