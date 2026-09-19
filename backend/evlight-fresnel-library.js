// EV LIGHT Fresnel film / theatre catalog.
// Sources: official EV LIGHT Fresnel product pages and product index.
const INDEX='https://www.evlightprofessional.com/products-index.html';
const SP_SERIES='https://www.evlightpro.com/fresnel-led/63172212.html';
const SP350BI='https://www.evlightpro.com/fresnel-led/63234789.html';

function fixture(id,model,powerW,cctMin,cctMax,colorMode,beamMin,beamMax,sourceUrl,extra={}){
  return {
    id,manufacturer:'EV Light',model,family:'Fresnel',category:'Light',
    sourceType:'LED Fresnel',powerW,cctK:{min:cctMin,max:cctMax},
    colorMode,beamAngleDeg:{min:beamMin,max:beamMax},sourceUrl,
    dimming:'0-100%',control:['DMX512','RDM'],ipRating:'IP20',
    cooling:'Fan',mount:'Clamp / optional 28 mm spigot',...extra
  };
}
function acc(id,model,category,compatibleWith,effectOnLight){
  return {id,manufacturer:'EV Light',model,family:'Fresnel',category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl:SP_SERIES,...(effectOnLight?{effectOnLight}:{})};
}

export const EVLIGHT_FRESNEL_FIXTURES=[
  fixture('evlight-sp150bi','SP150BI',150,2600,6000,'Bi-Color',15,55,INDEX,{cri:96,tlci:97,pwm:'2-25 kHz'}),
  fixture('evlight-sp150fc','SP150FC',200,2200,8500,'RGBLAC Full Color',15,55,INDEX,{ledEngine:'RGBLAC',dimmingDepth:'16-bit',pwm:'Selectable'}),
  fixture('evlight-sp350','SP350',350,3000,3000,'Tungsten White',15,55,SP_SERIES,{cri:97,tlci:98}),
  fixture('evlight-sp350bi','SP350BI',350,2700,6500,'Bi-Color',15,55,SP350BI,{zoom:'Manual or motorized option',pwm:'1-20 kHz',weightKg:9.2}),
  fixture('evlight-sp350fc','SP350FC',350,2200,8500,'RGBLA Full Color',15,55,SP_SERIES,{ledEngine:'RGBLA 5-in-1',tlci:98}),
  fixture('evlight-sp500bi','SP500BI',500,2700,6500,'Bi-Color',15,55,SP_SERIES,{weightKg:10.2}),
  fixture('evlight-sp600','SP600',600,3000,3000,'Tungsten White',15,55,SP_SERIES,{cri:97,tlci:98})
];

const all=EVLIGHT_FRESNEL_FIXTURES.map(x=>x.id);

export const EVLIGHT_FRESNEL_ACCESSORIES=[
  acc('evlight-fresnel-barndoor','EV LIGHT Fresnel Barn Door','Barn Doors',all,'Shapes and cuts the Fresnel beam; EV LIGHT lists barndoors with the SP Fresnel family.'),
  acc('evlight-fresnel-color-frame','EV LIGHT Fresnel Color Frame','Filter Holder',all,'Holds color or diffusion media in front of the Fresnel lens.'),
  acc('evlight-fresnel-28mm-spigot','EV LIGHT 28 mm Spigot','Mounting',all),
  acc('evlight-fresnel-clamp','EV LIGHT Fresnel Clamp','Mounting',all)
];
