// Aladdin compact on-board lighting catalog.
// Sources: official Aladdin A-LITE/EYE-LITE product catalog and accessory charts.
const ONBOARD_CATALOG='https://aladdin-lights.com/wp-content/uploads/2022/05/Aladdin_Katalog_2022_high_res.pdf';
const A_LITE_ACCESSORIES='https://aladdin-lights.com/wp-content/uploads/2022/08/Accessory-Chart-A-LITE.pdf';
const EYE_LITE='https://aladdin-lights.com/wp-content/uploads/2021/06/EYE-LITE.pdf';

function fixture(id,model,powerW,cctMin,cctMax,sourceUrl,extra={}){
  return {
    id,manufacturer:'Aladdin',model,family:'On-Board',category:'Light',
    sourceType:'Compact LED Light',cctK:{min:cctMin,max:cctMax},
    colorMode:'Bi-Color',powerW,sourceUrl,
    beamAngleDeg:140,cooling:'Passive',
    ...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'Aladdin',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const ALADDIN_ONBOARD_FIXTURES=[
  fixture('aladdin-a-lite','A-LITE',8,2900,6300,ONBOARD_CATALOG,{cri:95,tlci:98,dimming:'5-100%',formFactor:'On-camera LED light',dimensions:'156 x 80 x 11.5 mm',weightG:205,battery:'Replaceable 3.7V 2.5A Li-ion',powerSupply:'Micro USB',mount:'1/4-20 thread'}),
  fixture('aladdin-eye-lite','EYE-LITE',null,2900,6300,EYE_LITE,{cri:97,tlci:95,dimming:'5-100%',formFactor:'Miniature practical/catch light',dimensions:'89 x 39 x 10 mm',weightG:58,battery:'Built-in lithium-ion, >2h runtime',powerSupply:'Micro USB',mount:'1/4 thread'})
];

const aLite=['aladdin-a-lite'];
const eyeLite=['aladdin-eye-lite'];
const both=[...aLite,...eyeLite];

export const ALADDIN_ONBOARD_ACCESSORIES=[
  acc('aladdin-a-lite-diffuser','A-LITE Diffuser','Diffusion',aLite,A_LITE_ACCESSORIES,'Softens the compact on-camera light output.'),
  acc('aladdin-a-lite-battery','A-LITE Replacement Battery','Power',aLite,A_LITE_ACCESSORIES),
  acc('aladdin-a-lite-battery-holder','A-LITE Battery Holder','Power',aLite,A_LITE_ACCESSORIES),
  acc('aladdin-onboard-shoe','Aladdin Shoe Mount','Mounting',both,A_LITE_ACCESSORIES),
  acc('aladdin-onboard-new-shoe','Aladdin New Shoe Mount','Mounting',both,A_LITE_ACCESSORIES),
  acc('aladdin-onboard-magnet','Aladdin Magnet Mount','Mounting',both,A_LITE_ACCESSORIES),
  acc('aladdin-onboard-flex-clamp','Aladdin Flexible Clamp','Mounting',both,A_LITE_ACCESSORIES),
  acc('aladdin-onboard-ballhead-clamp','Aladdin Ballhead Clamp','Mounting',both,A_LITE_ACCESSORIES),
  acc('aladdin-onboard-usb-cable','Aladdin USB Cable','Power Cable',both,A_LITE_ACCESSORIES),
  acc('aladdin-onboard-usb-charger','Aladdin USB Charger','Charging',both,A_LITE_ACCESSORIES),
  acc('aladdin-eye-lite-clip','EYE-LITE Clip','Mounting',eyeLite,ONBOARD_CATALOG),
  acc('aladdin-eye-lite-pouch','EYE-LITE Pouch','Transport',eyeLite,ONBOARD_CATALOG)
];
