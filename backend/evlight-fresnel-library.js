// EV LIGHT Fresnel film / theatre catalog.
// Sources: official EV LIGHT Fresnel product pages and product index.
const INDEX='https://www.evlightprofessional.com/products-index.html';
const SP150BI='https://www.evlightprofessional.com/quality-fresnel-led-68836124.html';
const SP150FC='https://www.evlightpro.com/fresnel-led/';
const SP_SERIES='https://www.evlightpro.com/fresnel-led/63172212.html';
const SP350='https://www.evlightpro.com/fresnel-led/62965541.html';
const SP350BI='https://www.evlightpro.com/fresnel-led/63234789.html';
const SP350FC='https://www.evlightprofessional.com/quality-fresnel-led-63172212.html';
const SP500BI='https://www.evlightprofessional.com/products-index/7/';
const SP600='https://www.evlightprofessional.com/products-index/2/';

function fixture(id,model,powerW,cctMin,cctMax,colorMode,beamMin,beamMax,sourceUrl,extra={}){
  return {
    id,manufacturer:'EV Light',model,family:'Fresnel',category:'Light',
    sourceType:'LED Fresnel',powerW,cctK:{min:cctMin,max:cctMax},
    colorMode,beamAngleDeg:{min:beamMin,max:beamMax},sourceUrl,
    dimming:'0-100%',ipRating:'IP20',
    cooling:'Fan',mount:'Clamp / optional 28 mm spigot',...extra
  };
}
function acc(id,model,category,compatibleWith,effectOnLight){
  return {id,manufacturer:'EV Light',model,family:'Fresnel',category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl:SP_SERIES,...(effectOnLight?{effectOnLight}:{})};
}

export const EVLIGHT_FRESNEL_FIXTURES=[
  fixture('evlight-sp150bi','SP150BI',150,2600,6000,'Bi-Color',15,55,SP150BI,{
    cri:96,tlci:97,pwm:'2-25 kHz',
    dmxChannels:[3,7],
    dmxConnection:'Neutrik 3-pin or 5-pin XLR in/out',
    control:{
      wired:['DMX512','RDM'],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control'],
      unavailableDirectProtocols:[
        'Official EV Light SP150BI product information does not publish Art-Net or sACN network input',
        'Official EV Light SP150BI product information does not publish CRMX/LumenRadio, Bluetooth or Wi-Fi control'
      ],
      sourceUrls:[SP150BI,INDEX]
    }
  }),
  fixture('evlight-sp150fc','SP150FC',200,2200,8500,'RGBLAC Full Color',15,55,SP150FC,{
    ledEngine:'RGBLAC',
    dimmingDepth:'16-bit',
    pwm:'Selectable',
    localControl:['Stand-alone control with LCD display'],
    control:{
      wired:[],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['A manufacturer-verified DMX/network interface is required before LightingAI control can be enabled'],
      unavailableDirectProtocols:[
        'Official EV Light public SP150FC information does not publish a verified DMX512/RDM control path',
        'Official EV Light public SP150FC information does not publish Art-Net or sACN network input',
        'Official EV Light public SP150FC information does not publish CRMX/LumenRadio, Bluetooth or Wi-Fi control'
      ],
      sourceUrls:[SP150FC,INDEX]
    }
  }),
  fixture('evlight-sp350','SP350',350,3000,3000,'Tungsten White',10,50,SP350,{
    cri:96,tlci:98,pwm:'1-20 kHz',
    dimmingDepth:'8-bit / 16-bit',
    dmxChannels:[1,2],
    dmxConnection:'3-pin or 5-pin XLR in/out + RJ45',
    control:{
      wired:['DMX512','RDM'],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control'],
      unavailableDirectProtocols:[
        'Official EV Light SP350 product information does not publish Art-Net or sACN network input',
        'Official EV Light SP350 product information does not publish CRMX/LumenRadio, Bluetooth or Wi-Fi control'
      ],
      sourceUrls:[SP350,SP_SERIES]
    }
  }),
  fixture('evlight-sp350bi','SP350BI',350,2700,6400,'Bi-Color',15,55,SP350BI,{
    cri:96,
    zoom:'Electric zoom / manual zoom optional',
    pwm:'1-20 kHz',
    dimmingDepth:'8-bit / 16-bit',
    localControl:['LCD TFT display','Master/slave mode','Auto run mode','Sound control mode'],
    dmxChannels:[5,9],
    weightKg:9.2,
    control:{
      wired:['DMX512','RDM'],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control'],
      unavailableDirectProtocols:[
        'Official EV Light SP350BI product information does not publish Art-Net or sACN network input',
        'Official EV Light SP350BI product information does not publish CRMX/LumenRadio, Bluetooth or Wi-Fi control'
      ],
      sourceUrls:[SP350BI]
    }
  }),
  fixture('evlight-sp350fc','SP350FC',350,2200,8500,'RGBLA Full Color',15,55,SP350FC,{
    ledEngine:'RGBAL 5-in-1',
    cri:90,
    tlci:98,
    pwm:'2-25 kHz',
    zoom:'Manual / motorized zoom',
    dmxChannels:[7,11],
    dmxConnection:'3-pin XLR in/out',
    control:{
      wired:['DMX512','RDM'],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control'],
      unavailableDirectProtocols:[
        'Official EV Light SP350FC product information does not publish Art-Net or sACN network input',
        'Official EV Light SP350FC product information does not publish CRMX/LumenRadio, Bluetooth or Wi-Fi control'
      ],
      sourceUrls:[SP350FC,SP_SERIES]
    }
  }),
  fixture('evlight-sp500bi','SP500BI',500,2700,6500,'Bi-Color',15,55,SP500BI,{
    cri:96,
    cqs:96,
    pwm:'2-25 kHz',
    zoom:'Manual zoom',
    dmxChannels:[3,7],
    dmxConnection:'3-pin XLR in/out',
    weightKg:10.2,
    control:{
      wired:['DMX512','RDM'],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control'],
      unavailableDirectProtocols:[
        'Official EV Light SP500BI product information does not publish Art-Net or sACN network input',
        'Official EV Light SP500BI product information does not publish CRMX/LumenRadio, Bluetooth or Wi-Fi control'
      ],
      sourceUrls:[SP500BI,SP_SERIES]
    }
  }),
  fixture('evlight-sp600','SP600',600,3000,3000,'Tungsten White',15,55,SP600,{
    cri:97,
    tlci:98,
    pwm:'2-25 kHz',
    zoom:'Manual zoom',
    dmxChannels:[2],
    dmxConnection:'3-pin XLR in/out',
    control:{
      wired:['DMX512','RDM'],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control'],
      unavailableDirectProtocols:[
        'Official EV Light SP600 product information does not publish Art-Net or sACN network input',
        'Official EV Light SP600 product information does not publish CRMX/LumenRadio, Bluetooth or Wi-Fi control'
      ],
      sourceUrls:[SP600,SP_SERIES]
    }
  })
];

const all=EVLIGHT_FRESNEL_FIXTURES.map(x=>x.id);

export const EVLIGHT_FRESNEL_ACCESSORIES=[
  acc('evlight-fresnel-barndoor','EV LIGHT Fresnel Barn Door','Barn Doors',all,'Shapes and cuts the Fresnel beam; EV LIGHT lists barndoors with the SP Fresnel family.'),
  acc('evlight-fresnel-color-frame','EV LIGHT Fresnel Color Frame','Filter Holder',all,'Holds color or diffusion media in front of the Fresnel lens.'),
  acc('evlight-fresnel-28mm-spigot','EV LIGHT 28 mm Spigot','Mounting',all),
  acc('evlight-fresnel-clamp','EV LIGHT Fresnel Clamp','Mounting',all)
];
