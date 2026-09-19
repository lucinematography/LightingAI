// De Sisti Vari-White Spacelight.
// Verified from the official De Sisti Spacelight product page.
const SRC='https://www.desisti.it/spacelight/';

export const DESISTI_SPACELIGHT_FIXTURES=[
  {
    id:'desisti-spacelight-vw',
    manufacturer:'De Sisti',
    model:'Spacelight VW',
    family:'Spacelight',
    category:'Light',
    sourceType:'Vari-White LED Spacelight',
    ledPowerW:300,
    powerDrawW:330,
    cctK:{min:2800,max:6600},
    colorMode:'Vari-White + Green Correction',
    cri:96,
    tlci:96,
    ipRating:'IP20',
    fixtureHeadWeightKg:18,
    manualYokeWeightKg:2,
    psuWeightKg:5.5,
    detachableDriver:true,
    remoteDriverMaxM:50,
    control:['DMX512','On-board','Optional CRMX LumenRadio'],
    dmxModes:[{name:'Vari-White',channels:3,verified:true,sourceUrl:SRC,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]}],
    sourceUrl:SRC
  }
];

const ALL=['desisti-spacelight-vw'];

export const DESISTI_SPACELIGHT_ACCESSORIES=[
  {id:'desisti-spacelight-full-silk-skirt',manufacturer:'De Sisti',model:'Spacelight Full Silk Diffusion Skirt',category:'Diffusion',compatibilityStatus:'Designed For',compatibleWith:ALL,effectOnLight:'Full-length silk diffusion skirt for broad soft emission.',sourceUrl:SRC},
  {id:'desisti-spacelight-half-silk-skirt',manufacturer:'De Sisti',model:'Spacelight Half Silk Diffusion Skirt',category:'Diffusion',compatibilityStatus:'Designed For',compatibleWith:ALL,effectOnLight:'Half-length silk diffusion skirt for controlled soft emission.',sourceUrl:SRC},
  {id:'desisti-spacelight-target',manufacturer:'De Sisti',model:'Spacelight Diffusion Target',category:'Diffusion',compatibilityStatus:'Designed For',compatibleWith:ALL,sourceUrl:SRC},
  {id:'desisti-spacelight-full-blackout',manufacturer:'De Sisti',model:'Spacelight Full Blackout Cloth',category:'Light Control',compatibilityStatus:'Designed For',compatibleWith:ALL,effectOnLight:'Full black skirt for spill suppression.',sourceUrl:SRC},
  {id:'desisti-spacelight-half-blackout',manufacturer:'De Sisti',model:'Spacelight Half Blackout Cloth',category:'Light Control',compatibilityStatus:'Designed For',compatibleWith:ALL,effectOnLight:'Half black skirt for directional spill control.',sourceUrl:SRC},
  {id:'desisti-spacelight-lantern',manufacturer:'De Sisti',model:'Spacelight Dome Diffusion / Chinese Lantern',category:'Lantern',compatibilityStatus:'Designed For',compatibleWith:ALL,effectOnLight:'Dome diffusion accessory for broad omnidirectional soft output.',sourceUrl:SRC},
  {id:'desisti-spacelight-cone',manufacturer:'De Sisti',model:'Spacelight Cone Diffusion',category:'Diffusion',compatibilityStatus:'Designed For',compatibleWith:ALL,effectOnLight:'Cone diffusion accessory for shaped soft output.',sourceUrl:SRC},
  {id:'desisti-spacelight-dse-cable-5m',manufacturer:'De Sisti',model:'Spacelight DSE Extension Cable 5 m',category:'Power / Cable',compatibilityStatus:'Designed For',compatibleWith:ALL,sourceUrl:SRC},
  {id:'desisti-spacelight-dse-cable-10m',manufacturer:'De Sisti',model:'Spacelight DSE Extension Cable 10 m',category:'Power / Cable',compatibilityStatus:'Designed For',compatibleWith:ALL,sourceUrl:SRC},
  {id:'desisti-spacelight-crmx',manufacturer:'De Sisti',model:'Spacelight Optional CRMX LumenRadio',category:'Control',compatibilityStatus:'Designed For',compatibleWith:ALL,sourceUrl:SRC},
  {id:'desisti-spacelight-manual-yoke',manufacturer:'De Sisti',model:'Spacelight Optional Manual Yoke',category:'Mounting',compatibilityStatus:'Designed For',compatibleWith:ALL,sourceUrl:SRC},
  {id:'desisti-spacelight-bridle',manufacturer:'De Sisti',model:'Spacelight 3-Point Bridle / Suspension Cables',category:'Rigging',compatibilityStatus:'Designed For',compatibleWith:ALL,sourceUrl:SRC},
  {id:'desisti-spacelight-5pin-dmx',manufacturer:'De Sisti',model:'Spacelight 5-pin DMX Cable',category:'DMX Cable',compatibilityStatus:'Compatible',compatibleWith:ALL,sourceUrl:SRC},
  {id:'desisti-spacelight-power-pass',manufacturer:'De Sisti',model:'Spacelight Power Pass-Through Cable',category:'Power / Cable',compatibilityStatus:'Compatible',compatibleWith:ALL,sourceUrl:SRC}
];
