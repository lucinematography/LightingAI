// De Sisti Soft LED Vari-White + Color range.
// Verified from official De Sisti datasheets. Accessories are linked by the exact family codes listed in those sheets.
const S4='https://www.desisti.it/wp/wp-content/uploads/2022/04/SOFTLED-4-VWC-04-2022.pdf';
const S4_DMX='https://www.desisti.it/wp-content/uploads/SOFTLED-4-VWC.pdf';
const S8='https://www.desisti.it/wp/wp-content/uploads/2022/04/SOFTLED-8-VWC-04-2022.pdf';
const S8_DMX='https://www.desisti.it/wp-content/uploads/SOFTLED-8-VWC.pdf';
const S12='https://www.desisti.it/wp/wp-content/uploads/2023/12/SOFTLED-12-VWC.pdf';
const S2XL='https://www.desisti.it/wp/wp-content/uploads/2022/04/SOFTLED-2XL-VWC-04-2022.pdf';
const S8XL='https://www.desisti.it/wp/wp-content/uploads/2022/04/SOFTLED-8XL-VWC-04-2022.pdf';

const modes9=['RGBAWW','Gel','Vari-White + Color','Vari-White + Saturation','Ultra CRI','HSI','XY','FX','Sources'];
const standardDmx=[
  {name:'8-bit base',channels:7},{name:'8-bit with mode/fan',channels:9},{name:'8-bit extended',channels:39},
  {name:'16-bit base',channels:8},{name:'16-bit with mode/fan',channels:10},{name:'16-bit extended',channels:40}
];
const extendedDmx=[
  {name:'8-bit base',channels:7},{name:'8-bit with mode/fan',channels:9},{name:'8-bit simple',channels:12},{name:'8-bit extended',channels:39},
  {name:'16-bit base',channels:8},{name:'16-bit with mode/fan',channels:10},{name:'16-bit simple',channels:13},{name:'16-bit extended',channels:40}
];

function fixture(id,model,ledPowerW,powerDrawW,cctMin,cctMax,cri,tlci,manualKg,poleKg,sourceUrl,extra={}){
  return {
    id,manufacturer:'De Sisti',model,family:'Soft LED VW+C',category:'Light',
    sourceType:'Vari-White + RGBA LED Softlight',ledPowerW,powerDrawW,
    cctK:{min:cctMin,max:cctMax},colorMode:'Vari-White + RGBA',cri,tlci,ipRating:'IP20',
    manualYokeWeightKg:manualKg,...(poleKg?{poleYokeWeightKg:poleKg}:{}),
    control:['DMX512','On-board','Optional W-DMX LumenRadio'],
    dmxModes:standardDmx,colorControlModes:modes9,sourceUrl,...extra
  };
}

export const DESISTI_SOFTLED_VWC_FIXTURES=[
  fixture('desisti-softled-4-vwc','Soft LED 4 VW+C',230,260,1800,12000,95,96,5.5,6.7,S4,{
    dmxModes:[
      {name:'8-bit base',channels:7,verified:true,sourceUrl:S4_DMX},
      {name:'8-bit with mode/fan',channels:9,verified:true,sourceUrl:S4_DMX},
      {name:'8-bit extended',channels:39,verified:true,sourceUrl:S4_DMX},
      {name:'16-bit base',channels:8,verified:true,sourceUrl:S4_DMX},
      {name:'16-bit with mode/fan',channels:10,verified:true,sourceUrl:S4_DMX},
      {name:'16-bit extended',channels:40,verified:true,sourceUrl:S4_DMX}
    ]
  }),
  fixture('desisti-softled-8-vwc','Soft LED 8 VW+C',500,560,1800,12000,95,96,11.0,12.3,S8,{
    dmxModes:[
      {name:'8-bit base',channels:7,verified:true,sourceUrl:S8_DMX},
      {name:'8-bit with mode/fan',channels:9,verified:true,sourceUrl:S8_DMX},
      {name:'8-bit extended',channels:39,verified:true,sourceUrl:S8_DMX},
      {name:'16-bit base',channels:8,verified:true,sourceUrl:S8_DMX},
      {name:'16-bit with mode/fan',channels:10,verified:true,sourceUrl:S8_DMX},
      {name:'16-bit extended',channels:40,verified:true,sourceUrl:S8_DMX}
    ]
  }),
  fixture('desisti-softled-12-vwc','Soft LED 12 VW+C',650,725,1750,14500,96,96,18.7,null,S12,{
    lollipopWeightKg:15.0,
    control:['DMX512/RDM','On-board','Optional W-DMX LumenRadio','Optional Art-Net','Optional sACN'],
    dmxModes:extendedDmx.map((mode)=>({...mode,verified:true,sourceUrl:S12}))
  }),
  fixture('desisti-softled-2xl-vwc','Soft LED 2 XL VW+C',230,260,1800,12000,95,96,5.5,6.7,S2XL,{
    dmxModes:standardDmx.map((mode)=>({...mode,verified:true,sourceUrl:S2XL}))
  }),
  fixture('desisti-softled-8xl-vwc','Soft LED 8 XL VW+C',650,725,1800,12000,95,96,19.8,22.1,S8XL)
];

const ids=model=>DESISTI_SOFTLED_VWC_FIXTURES.filter(x=>x.model===model).map(x=>x.id);
const s4=ids('Soft LED 4 VW+C'), s8=ids('Soft LED 8 VW+C'), s12=ids('Soft LED 12 VW+C');
const s2xl=ids('Soft LED 2 XL VW+C'), s8xl=ids('Soft LED 8 XL VW+C');

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
 return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}
function familyAccessories(prefix,targets,source,opts={}){
 const a=[
  acc('desisti-'+prefix+'-hcn',opts.hcn||prefix.toUpperCase()+'-HCN Black Honeycomb Narrow','Grid / Honeycomb',targets,source,'Narrow honeycomb for stronger spill control.'),
  acc('desisti-'+prefix+'-hcm',opts.hcm||prefix.toUpperCase()+'-HCM Black Honeycomb Medium','Grid / Honeycomb',targets,source,'Medium honeycomb for controlled soft-beam spill.'),
  acc('desisti-'+prefix+'-in',opts.intensifier||prefix.toUpperCase()+'-IN Intensifier','Light Control',targets,source,'Increases forward intensity and controls the soft beam.'),
  acc('desisti-'+prefix+'-cf',opts.colorFrame||prefix.toUpperCase()+'-CF Color Frame','Filter Frame',targets,source),
  acc('desisti-'+prefix+'-mo-bs',opts.moBs||prefix.toUpperCase()+'MO.110.40 Manual Stirrup with B.S. Spigot','Mounting',targets,source),
  acc('desisti-'+prefix+'-mo',opts.mo||prefix.toUpperCase()+'MO.220.40 Manual Stirrup without Spigot','Mounting',targets,source)
 ];
 if(!opts.noCyc)a.push(acc('desisti-'+prefix+'-cyc',opts.cyc||prefix.toUpperCase()+'-CYC Cyclorama Hood','Light Control',targets,source,'Creates asymmetric emission for backgrounds and cycloramas.'));
 if(!opts.noPole){
  a.push(acc('desisti-'+prefix+'-po-bs',opts.poBs||prefix.toUpperCase()+'PO.110.40 Pole Stirrup with B.S. Spigot','Mounting',targets,source));
  a.push(acc('desisti-'+prefix+'-po-din',opts.poDin||prefix.toUpperCase()+'PO.300.40 Pole Stirrup with DIN Spigot','Mounting',targets,source));
 }
 return a;
}

export const DESISTI_SOFTLED_VWC_ACCESSORIES=[
  ...familyAccessories('s4',s4,S4),
  ...familyAccessories('s8',s8,S8),
  ...familyAccessories('s12',s12,S12,{intensifier:'S12-IN Intensifier',colorFrame:'S12-CF Color Frame',cyc:'S12-CYC Cyclorama Hood'}),
  ...familyAccessories('s2xl',s2xl,S2XL),
  ...familyAccessories('s8xl',s8xl,S8XL,{noCyc:true}),
  acc('desisti-s12-bd','S12-BD Barndoor','Barn Door',s12,S12,'Shapes Soft LED 12 spill.'),
  acc('desisti-s8xl-bd','S8XL-BD Barndoor','Barn Door',s8xl,S8XL,'Shapes Soft LED 8 XL spill.'),
  acc('desisti-s8xl-dif','S8XL-DIF Standard Diffuser 100','Diffusion',s8xl,S8XL,'Standard diffuser for the Soft LED 8 XL.'),
  acc('desisti-s8xl-dif-22','S8XL-DIF-22% Dense Diffuser','Diffusion',s8xl,S8XL,'Dense diffuser with 22% light reduction.'),
  acc('desisti-softled-vwc-48v','Optional 48 V DC Connection','Power',DESISTI_SOFTLED_VWC_FIXTURES.map(x=>x.id),S12),
  acc('desisti-softled-vwc-lumenradio','Optional LumenRadio TimoTwo Module','Control',DESISTI_SOFTLED_VWC_FIXTURES.map(x=>x.id),S12),
  acc('desisti-softled-vwc-usb','Optional 5 V USB Plug','Power / Utility',DESISTI_SOFTLED_VWC_FIXTURES.map(x=>x.id),S12)
];
