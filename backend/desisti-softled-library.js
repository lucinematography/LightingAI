// De Sisti Soft LED and Soft LED XL studio softlight families.
// Verified from official De Sisti product pages, data sheets and manuals.
const S1='https://www.desisti.it/soft-led-1/';
const S1_DMX='https://www.desisti.it/wp-content/uploads/2018/10/CE-Instruction-Manual-De-Sisti-SOFT-LED-1.pdf';
const S2='https://www.desisti.it/wp/wp-content/uploads/2022/04/Data-Sheet-SoftLED-2-VW.pdf';
const S2_DMX='https://www.desisti.it/wp-content/uploads/2018/10/CE-Instruction-Manual-De-Sisti-SOFT-LED-2.pdf';
const S4='https://www.desisti.it/soft-led-4/';
const S4_DMX='https://www.desisti.it/wp-content/uploads/2018/10/CE-Instruction-Manual-De-Sisti-SOFT-LED-4.pdf';
const S4_VW_DMX='https://www.desisti.it/wp-content/uploads/2018/10/CE-Instruction-Manual-De-Sisti-SOFT-LED-4VW.pdf';
const S8='https://www.desisti.it/soft-led-8/';
const S8_DMX='https://www.desisti.it/wp-content/uploads/2018/10/CE-Instruction-Manual-De-Sisti-SOFT-LED-8.pdf';
const S1XL='https://www.desisti.it/wp-content/uploads/CE-Instruction-Manual-De-Sisti-SOFT-LED-1XL-VW.pdf';
const S2XL='https://www.desisti.it/soft-led-2-xl/';
const S2XL_DMX='https://www.desisti.it/wp-content/uploads/CE-Instruction-Manual-De-Sisti-SOFT-LED-2XL.pdf';
const S8XL='https://www.desisti.it/soft-led-8-xl/';
const S8XL_DMX='https://www.desisti.it/wp-content/uploads/CE-Instruction-Manual-De-Sisti-SOFT-LED-8XL.pdf';

const verifiedFixedModes=(sourceUrl)=>[
  {name:'8-bit dimmer',channels:1,verified:true,sourceUrl,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]},
  {name:'16-bit dimmer',channels:2,verified:true,sourceUrl,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',bits:16,min:0,max:100,dmxMin:0,dmxMax:65535}]}
];
function fixed(id,model,family,ledPowerW,powerDrawW,cct,sourceUrl,weightKg,extra={}){
  return {
    id,manufacturer:'De Sisti',model,family,category:'Light',
    sourceType:'LED Softlight',ledPowerW,...(powerDrawW?{powerDrawW}:{}),
    cctK:{min:cct,max:cct},colorMode:cct===3200?'Tungsten':'Daylight',
    cri:96,tlci:96,ipRating:'IP22',...(weightKg?{weightKg}:{}),
    control:['DMX512','On-board dimming'],
    dmxModes:[{name:'8-bit dimmer',channels:1},{name:'16-bit dimmer',channels:2}],
    sourceUrl,
    ...extra
  };
}
function vw(id,model,family,ledPowerW,powerDrawW,sourceUrl,weightKg,extra={}){
  return {
    id,manufacturer:'De Sisti',model,family,category:'Light',
    sourceType:'Vari-White LED Softlight',ledPowerW,...(powerDrawW?{powerDrawW}:{}),
    cctK:{min:2800,max:6600},colorMode:'Vari-White',cri:95,tlci:96,
    ipRating:'IP22',...(weightKg?{weightKg}:{}),
    control:['DMX512','On-board dimming'],
    dmxModes:[{name:'Vari-White',channels:3}],
    sourceUrl,
    ...extra
  };
}

export const DESISTI_SOFTLED_FIXTURES=[
  fixed('desisti-softled-1-t','Soft LED 1 T','Soft LED 1',60,75,3200,S1,3.0,{dmxModes:verifiedFixedModes(S1_DMX)}),
  fixed('desisti-softled-1-d','Soft LED 1 D','Soft LED 1',60,75,5600,S1,3.0,{dmxModes:verifiedFixedModes(S1_DMX)}),
  vw('desisti-softled-1-vw','Soft LED 1 VW','Soft LED 1',60,75,S1,3.0),

  fixed('desisti-softled-2-t','Soft LED 2 T','Soft LED 2',120,null,3200,S2,null,{dmxModes:verifiedFixedModes(S2_DMX)}),
  fixed('desisti-softled-2-d','Soft LED 2 D','Soft LED 2',120,null,5600,S2,null,{dmxModes:verifiedFixedModes(S2_DMX)}),
  vw('desisti-softled-2-vw','Soft LED 2 VW','Soft LED 2',120,null,S2),

  fixed('desisti-softled-4-t','Soft LED 4 T','Soft LED 4',180,205,3200,S4,5.5,{dmxModes:verifiedFixedModes(S4_DMX)}),
  fixed('desisti-softled-4-d','Soft LED 4 D','Soft LED 4',180,205,5600,S4,5.5,{dmxModes:verifiedFixedModes(S4_DMX)}),
  vw('desisti-softled-4-vw','Soft LED 4 VW','Soft LED 4',180,205,S4,5.5,{dmxModes:[{name:'Vari-White',channels:3,verified:true,sourceUrl:S4_VW_DMX,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]}]}),

  fixed('desisti-softled-8-t','Soft LED 8 T','Soft LED 8',360,400,3200,S8,11.0,{dmxModes:verifiedFixedModes(S8_DMX)}),
  fixed('desisti-softled-8-d','Soft LED 8 D','Soft LED 8',360,400,5600,S8,11.0,{dmxModes:verifiedFixedModes(S8_DMX)}),
  vw('desisti-softled-8-vw','Soft LED 8 VW','Soft LED 8',360,400,S8,11.0),

  vw('desisti-softled-1xl-vw','Soft LED 1 XL VW','Soft LED 1 XL',120,null,S1XL,null,{dmxModes:[{name:'Vari-White',channels:3,verified:true,sourceUrl:S1XL,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]}]}),

  fixed('desisti-softled-2xl-t','Soft LED 2 XL T','Soft LED 2 XL',180,205,3200,S2XL,5.5,{dmxModes:verifiedFixedModes(S2XL_DMX)}),
  fixed('desisti-softled-2xl-d','Soft LED 2 XL D','Soft LED 2 XL',180,205,5600,S2XL,5.5,{dmxModes:verifiedFixedModes(S2XL_DMX)}),
  vw('desisti-softled-2xl-vw','Soft LED 2 XL VW','Soft LED 2 XL',180,205,S2XL,5.5),

  fixed('desisti-softled-8xl-t','Soft LED 8 XL T','Soft LED 8 XL',400,460,3200,S8XL,19.8,{dmxModes:verifiedFixedModes(S8XL_DMX)}),
  fixed('desisti-softled-8xl-d','Soft LED 8 XL D','Soft LED 8 XL',400,460,5600,S8XL,19.8,{dmxModes:verifiedFixedModes(S8XL_DMX)}),
  vw('desisti-softled-8xl-vw','Soft LED 8 XL VW','Soft LED 8 XL',400,460,S8XL,19.8)
];

const byFamily=family=>DESISTI_SOFTLED_FIXTURES.filter(x=>x.family===family).map(x=>x.id);
const S1IDS=byFamily('Soft LED 1');
const S2IDS=byFamily('Soft LED 2');
const S4IDS=byFamily('Soft LED 4');
const S8IDS=byFamily('Soft LED 8');
const S1XLIDS=byFamily('Soft LED 1 XL');
const S2XLIDS=byFamily('Soft LED 2 XL');
const S8XLIDS=byFamily('Soft LED 8 XL');
const ALL=DESISTI_SOFTLED_FIXTURES.map(x=>x.id);

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {
    id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',
    compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})
  };
}
export const DESISTI_SOFTLED_ACCESSORIES=[
  acc('desisti-softled-1-diffuser','S1DIF Diffuser Panel','Diffusion',S1IDS,S1,'Softens and homogenizes the Soft LED 1 beam.'),
  acc('desisti-softled-2-diffuser','S2DIF Diffuser Panel','Diffusion',S2IDS,S2,'Softens and homogenizes the Soft LED 2 beam.'),
  acc('desisti-softled-4-diffuser','Soft LED 4 Diffuser Panel','Diffusion',S4IDS,S4,'Softens and homogenizes the Soft LED 4 beam.'),
  acc('desisti-softled-8-diffuser','S8DIF Diffuser Panel','Diffusion',S8IDS,S8,'Softens and homogenizes the Soft LED 8 beam.'),
  acc('desisti-softled-1xl-diffuser','Soft LED 1 XL Diffuser Panel','Diffusion',S1XLIDS,S1XL,'Softens and homogenizes the Soft LED 1 XL beam.'),
  acc('desisti-softled-2xl-diffuser','Soft LED 2 XL Diffuser Panel','Diffusion',S2XLIDS,S2XL,'Softens and homogenizes the Soft LED 2 XL beam.'),
  acc('desisti-softled-8xl-diffuser','S8XLDIF Diffuser Panel','Diffusion',S8XLIDS,S8XL,'Softens and homogenizes the Soft LED 8 XL beam.'),

  acc('desisti-softled-medium-black-honeycomb','Medium Black Honeycomb','Grid / Honeycomb',ALL,S2,'Controls spill and narrows the soft beam while retaining a broad field.'),
  acc('desisti-softled-narrow-black-honeycomb','Narrow Black Honeycomb','Grid / Honeycomb',ALL,S2,'Provides stronger beam control and reduced side spill.'),
  acc('desisti-softled-white-honeycomb','White Honeycomb','Grid / Honeycomb',ALL,S1XL,'Beam-control honeycomb option listed for the Soft LED family.'),
  acc('desisti-softled-beam-intensifier','Beam Intensifier','Light Control',ALL,S1XL,'Increases forward intensity and controls the beam.'),
  acc('desisti-softled-color-frame','Color Frame','Filter Frame',ALL,S1XL,'Holds color or diffusion media in front of the fixture.'),
  acc('desisti-softled-manual-yoke','Manual Operated Yoke','Mounting',ALL,S2,'Positive-lock manual yoke for stand or clamp mounting.'),
  acc('desisti-softled-pole-yoke','Pole Operated Yoke','Mounting',ALL,S2,'Pole-operated yoke for remote pan and tilt in studio grids.'),
  acc('desisti-5403-135-powercon-3m','5403.135 3 m Blue powerCON Cable','Power / Cable',ALL,S2,'Detachable 3 m powerCON mains cable.'),
  acc('desisti-softled-dmx-5pin-cable','5-pin DMX Cable','DMX Cable',ALL,S2,'Shielded 5-pin DMX cable for DMX IN/OUT daisy chains.')
];
