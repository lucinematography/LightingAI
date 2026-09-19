// Kino Flo current-generation fixtures (2026).
// Sources: official Kino Flo product pages.
const IKON6='https://kinoflo.com/celeb-ikon6/';
const IKON12='https://kinoflo.com/celeb-ikon-12/';
const DIVA4='https://kinoflo.com/diva-lux-4/';
const MIMIK120='https://kinoflo.com/mimik-120/';

function fixture(id,model,family,sourceType,sourceUrl,extra={}){
  return {id,manufacturer:'Kino Flo',model,family,category:'Light',sourceType,sourceUrl,...extra};
}
function acc(id,model,family,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {id,manufacturer:'Kino Flo',model,family,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{}),...extra};
}

export const KINOFLO_CURRENT_FIXTURES=[
  fixture('kinoflo-celeb-ikon-6','Celeb IKON 6','Celeb IKON','LED Softlight',IKON6,{
    powerW:600,cctK:{min:2700,max:9990},colorMode:'RGB-cW-wW Full Color',
    zones:8,beamAngleDeg:107,tlci:99,tm30:{rf:95.7,rg:99.3},ipRating:'IP65',
    weightKg:18.1,batteryVoltageV:48,
    control:['DMX512','RDM','sACN','Art-Net','LumenRadio CRMX','Ethernet'],
    power:'Integrated PSU; PowerCON TRUE1 in/out; 48V DC input'
  }),
  fixture('kinoflo-celeb-ikon-12','Celeb IKON 12','Celeb IKON','LED Softlight',IKON12,{
    powerW:1200,cctK:{min:2500,max:9900},colorMode:'RGB-cW-wW Full Color',
    zones:16,beamAngleDeg:109,tlci:99,tm30:{rf:96.3,rg:100.1},ipRating:'IP65',
    weightKg:33,
    control:['DMX512','RDM','sACN','Art-Net','LumenRadio CRMX','Ethernet'],
    power:'Integrated PSU; PowerCON TRUE1 AC'
  }),
  fixture('kinoflo-diva-lux-4','Diva Lux 4','Diva Lux','LED Softlight',DIVA4,{
    outputPowerW:400,powerDrawW:500,colorMode:'RGBwWcW Full Color',
    zones:4,beamAngleDeg:106,tlci:99,tm30:{rf:96,rg:'100+'},weightKg:14.9,
    voltage:'100-240VAC / 48V DC',
    control:['DMX512','RDM','sACN','Art-Net','LumenRadio CRMX','Ethernet']
  }),
  fixture('kinoflo-mimik-120','MIMIK 120','MIMIK','Full-Spectrum Image-Based Lighting Tile',MIMIK120,{
    colorMode:'Warm White + Cool White + RGB image-based full spectrum',
    pixelPitchMm:10,ipRating:'IP20',dimensionsMm:{width:1200,height:600,depth:80},
    weightKg:12.5,maxStackingTilesHigh:5,videoBrightnessNits:10000,
    control:['Megapixel HELIOS LED processor','Lighting desk assignment']
  })
];

export const KINOFLO_CURRENT_ACCESSORIES=[
  acc('kinoflo-ikon6-removable-diffusion','Celeb IKON 6 Removable Diffusion','Celeb IKON','Diffusion',['kinoflo-celeb-ikon-6'],IKON6,'Softens the IKON 6 output; listed as removable diffusion on the official fixture page.'),
  acc('kinoflo-ikon12-removable-diffusion','Celeb IKON 12 Removable Diffusion','Celeb IKON','Diffusion',['kinoflo-celeb-ikon-12'],IKON12,'Softens the IKON 12 output; listed as removable diffusion on the official fixture page.'),
  acc('kinoflo-diva-lux4-removable-diffusion','Diva Lux 4 Removable Diffusion','Diva Lux','Diffusion',['kinoflo-diva-lux-4'],DIVA4,'Softens the Diva Lux 4 output; listed as removable diffusion on the official fixture page.'),
  acc('kinoflo-mimik120-snapgrid-40','MIMIK 120 SnapGrid 40°','MIMIK','Grid',['kinoflo-mimik-120'],MIMIK120,'Controls spill and narrows off-axis output.',{orderCode:'LVR-MK120-S'}),
  acc('kinoflo-mimik120-yoke','MIMIK 120 Yoke Assembly','MIMIK','Mounting',['kinoflo-mimik-120'],MIMIK120,null,{orderCode:'7010066'}),
  acc('kinoflo-mimik120-junior-pin','MIMIK 120 Junior Pin','MIMIK','Mounting',['kinoflo-mimik-120'],MIMIK120,null,{orderCode:'MTP-MK210'})
];
