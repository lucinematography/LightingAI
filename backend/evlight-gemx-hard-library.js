// EV LIGHT GEMX hard / outdoor cinema panels.
// Sources: official EV LIGHT product/category pages.
const HARD='https://www.evlightpro.com/hard-panel-light/';
const SOFT='https://www.evlightpro.com/led-soft-light-panel/';
const GEMX21ST='https://www.evlightprofessional.com/quality-led-soft-light-panel-63337022.html';
const GEMX24='https://www.evlightpro.com/led-film-lighting/65882903.html';
const ACCESSORIES='https://www.evlightpro.com/accessories/';

function fixture(id,model,sourceType,powerW,cctMin,cctMax,colorMode,beamAngleDeg,sourceUrl,extra={}){
  return {
    id,manufacturer:'EV Light',model,family:'GEMX',category:'Light',
    sourceType,powerW,cctK:{min:cctMin,max:cctMax},
    colorMode,beamAngleDeg,sourceUrl,...extra
  };
}
function acc(id,model,category,compatibleWith,effectOnLight){
  return {id,manufacturer:'EV Light',model,family:'GEMX',category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl:ACCESSORIES,...(effectOnLight?{effectOnLight}:{})};
}

export const EVLIGHT_GEMX_HARD_FIXTURES=[
  fixture('evlight-gemx12','GEMX12','LED Hard Panel',650,2700,10000,'Full Color',25,HARD,{
    useCases:['Film production','Long-throw location lighting'],
    effects:'Built-in special effects',
    ipRating:'IP65',
    control:{
      wired:[],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['A manufacturer-verified DMX/network interface is required before LightingAI control can be enabled'],
      unavailableDirectProtocols:[
        'Official EV Light public GEMX12 product information does not publish a verified DMX512/RDM control path',
        'Official EV Light public GEMX12 product information does not publish Art-Net or sACN network input',
        'Official EV Light public GEMX12 product information does not publish CRMX/LumenRadio, Bluetooth or Wi-Fi control'
      ],
      sourceUrls:[HARD]
    }
  }),
  fixture('evlight-gemx21-st','GEMX21 ST','LED Soft Panel',400,2700,10000,'Full Color',120,GEMX21ST,{
    ipRating:'IP65',
    control:{
      wired:['DMX512','RDM'],
      wireless:['App control','WiFi-DMX','Wireless DMX'],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['External verified bridge required for LightingAI Art-Net/sACN control'],
      unavailableDirectProtocols:[
        'Official EV Light GEMX21 ST product information does not identify Wireless DMX as CRMX/LumenRadio',
        'Official EV Light GEMX21 ST product information does not publish Art-Net or sACN network input'
      ],
      sourceUrls:[GEMX21ST,SOFT]
    }
  }),
  fixture('evlight-gemx24-hard','GEMX24 HARD','LED Hard Panel',1200,2700,10000,'RGBW Full Color',25,GEMX24,{
    cri:96,tlci:98,ipRating:'IP65',
    control:{
      wired:['DMX512','RDM'],
      wireless:['Bluetooth App Control','LumenRadio CRMX Wireless DMX','Wi-Fi connectivity'],
      builtInCRMX:true,
      builtInBluetooth:true,
      directLightingAI:[],
      externalInterfaceRequired:['External Art-Net/sACN-to-DMX or CRMX bridge required for LightingAI network control'],
      unavailableDirectProtocols:[
        'Official EV Light GEMX24 HARD product information does not publish Art-Net or sACN network input',
        'Wi-Fi connectivity is published, but no public LightingAI-compatible network protocol is identified'
      ],
      sourceUrls:[GEMX24]
    },
    pwm:'24 kHz',dimming:'8-bit / 16-bit'
  })
];

const panels=EVLIGHT_GEMX_HARD_FIXTURES.map(x=>x.id);

export const EVLIGHT_GEMX_HARD_ACCESSORIES=[
  acc('evlight-gemx-studio-panel-softbox','EV LIGHT Studio Panel Softbox','Softbox',panels,'Softens and enlarges the apparent source; EV LIGHT lists a softbox for studio panels.'),
  acc('evlight-gemx-studio-panel-cellular-grille','EV LIGHT Studio Panel Cellular Grille','Grid',panels,'Controls spill; EV LIGHT lists an angle-changeable cellular grille for studio panels.')
];
