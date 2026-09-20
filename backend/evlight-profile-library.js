// EV LIGHT profile / ellipsoidal spot catalog.
// Sources are official EV LIGHT product/category pages.
const STUDIO='https://www.evlightpro.com/led-studio-light/';
const EPRO100='https://www.evlightpro.com/profile-spot-light/63349887.html';
const EPRO200Z='https://www.evlightpro.com/ellipsoidal-led/62310805.html';
const SP300Z='https://www.evlightpro.com/profile-spot-light/62506587.html';
const EPRO300Z='https://www.evlightpro.com/profile-spot-light/62480750.html';

function fixture(id,model,extra){
  return {
    id,manufacturer:'EV Light',model,family:'Profile Spot',category:'Light',
    sourceType:'LED Ellipsoidal / Profile Spot',...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {
    id,manufacturer:'EV Light',model,family:'Profile Spot',category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{})
  };
}

export const EVLIGHT_PROFILE_FIXTURES=[
  fixture('evlight-epro100','EPRO100',{
    powerW:100,colorMode:'Warm White or Cool White option',cctK:{min:3200,max:5600},
    cri:95,beamAngleDeg:{options:['15-35','20-40','50-60']},
    control:{
      wired:['DMX512 via 3-pin XLR'],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['Wired DMX interface for DMX512 control'],
      unavailableDirectProtocols:[
        'No manufacturer-documented Art-Net or sACN network input is published for EPRO100',
        'No manufacturer-documented CRMX/LumenRadio, Bluetooth or Wi-Fi control path is published for EPRO100'
      ],
      sourceUrls:[EPRO100]
    },
    localControl:['Master-Slave','Auto'],dmxChannels:1,ipRating:'IP20',weightKg:3.25,
    optics:'Manual zoom, manual focus, 4-blade framing shutters',sourceUrl:EPRO100
  }),
  fixture('evlight-epro200z','EPRO200Z',{
    powerW:200,colorMode:'Warm White',beamAngleDeg:{min:15,max:38},
    control:{
      wired:['DMX512'],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['Wired DMX interface for DMX512 control'],
      unavailableDirectProtocols:[
        'No manufacturer-documented Art-Net or sACN network input is published for EPRO200Z',
        'No manufacturer-documented CRMX/LumenRadio, Bluetooth or Wi-Fi control path is published for EPRO200Z'
      ],
      sourceUrls:[EPRO200Z]
    },
    localControl:['Auto run','Master/Slave'],
    dmxChannelOptions:['1/3CH single color','2/5CH 2in1','3/7CH RGB','4/8CH RGBW'],
    optics:'Manual zoom ellipsoidal / leko optics',sourceUrl:EPRO200Z
  }),
  fixture('evlight-ev-sp300z','EV SP300Z',{
    powerW:300,colorMode:'RGBAL Full Color',cctK:{min:2800,max:8000},
    beamAngleDeg:{min:15,max:30},
    control:{
      wired:['DMX512','RDM'],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control'],
      unavailableDirectProtocols:[
        'No manufacturer-documented Art-Net or sACN network input is published for EV SP300Z',
        'No manufacturer-documented CRMX/LumenRadio, Bluetooth or Wi-Fi control path is published for EV SP300Z'
      ],
      sourceUrls:[SP300Z]
    },
    localControl:['Self Running','Master-Slave'],dmxChannels:10,weightKg:12,pwmHz:{min:500,max:25000},
    optics:'Manual focus, glass reflector zoom profile optics',sourceUrl:SP300Z
  }),
  fixture('evlight-epro300z','EPRO300Z',{
    powerW:300,colorMode:'RGBAL Full Color',cctK:{min:2800,max:8000},
    beamAngleDeg:{min:15,max:30},
    control:{
      wired:['DMX512','RDM'],
      wireless:[],
      builtInCRMX:false,
      builtInBluetooth:false,
      directLightingAI:[],
      externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control'],
      unavailableDirectProtocols:[
        'No manufacturer-documented Art-Net or sACN network input is published for EPRO300Z',
        'No manufacturer-documented CRMX/LumenRadio, Bluetooth or Wi-Fi control path is published for EPRO300Z'
      ],
      sourceUrls:[EPRO300Z]
    },
    localControl:['Self Running','Master-Slave'],dmxChannels:10,weightKg:12,pwmHz:{min:500,max:25000},
    optics:'Manual focus, clear boundary spot / projection optics',sourceUrl:EPRO300Z
  }),
  fixture('evlight-epro400rgblac-z','EPRO400RGBLAC-Z',{
    ledEnginePowerW:600,colorMode:'RGBLAC Full Color',cctK:{min:2000,max:10000},
    cri:95,beamAngleDeg:{options:['15-30','25-50']},
    optics:'Zoom profile / ellipsoidal',sourceUrl:STUDIO
  }),
  fixture('evlight-epro400fc','EPRO400FC',{
    powerW:350,colorMode:'RGBCW+WW Full Color',cri:96,
    optics:'Ellipsoidal profile with framing shutters',sourceUrl:STUDIO
  }),
  fixture('evlight-epro350fc','EPRO350FC',{
    powerW:430,ledEnginePowerW:500,colorMode:'RGBLA Full Color',cri:90,
    optics:'Ellipsoidal leko profile optics',sourceUrl:STUDIO
  })
];

const all=EVLIGHT_PROFILE_FIXTURES.map(x=>x.id);

export const EVLIGHT_PROFILE_ACCESSORIES=[
  acc('evlight-profile-framing-shutters','4-Blade Framing Shutter Set','Optical Accessory',all,EPRO100,'Shapes the projected beam with four framing blades.'),
  acc('evlight-profile-pattern-holder','Profile Pattern / Gobo Holder','Optical Accessory',all,EPRO300Z,'Supports patterned projection in compatible EV Light profile optics.')
];
