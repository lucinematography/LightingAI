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
    control:['DMX512','Master-Slave','Auto'],ipRating:'IP20',weightKg:3.25,
    optics:'Manual zoom, manual focus, 4-blade framing shutters',sourceUrl:EPRO100
  }),
  fixture('evlight-epro200z','EPRO200Z',{
    powerW:200,colorMode:'Warm White',beamAngleDeg:{min:15,max:38},
    optics:'Manual zoom ellipsoidal / leko optics',sourceUrl:EPRO200Z
  }),
  fixture('evlight-ev-sp300z','EV SP300Z',{
    powerW:300,colorMode:'RGBAL Full Color',cctK:{min:2800,max:8000},
    beamAngleDeg:{min:15,max:30},control:['DMX512','RDM','Master-Slave','Self Running'],
    dmxChannels:10,weightKg:12,pwmHz:{min:500,max:25000},
    optics:'Manual focus, glass reflector zoom profile optics',sourceUrl:SP300Z
  }),
  fixture('evlight-epro300z','EPRO300Z',{
    powerW:300,colorMode:'RGBAL Full Color',cctK:{min:2800,max:8000},
    beamAngleDeg:{min:15,max:30},control:['DMX512','RDM','Master-Slave','Self Running'],
    dmxChannels:10,weightKg:12,pwmHz:{min:500,max:25000},
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
