import { normalizeAputureWirelessControl } from './aputure-wireless-verification.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

const fixtures=[
  {
    id:'aputure-sidus-daylight',
    manufacturer:'Aputure',
    model:'Synthetic Sidus Daylight',
    category:'Light',
    colorMode:'Daylight',
    cctK:{min:5600,max:5600},
    sourceUrl:'https://example.invalid/aputure-sidus-daylight',
    control:['On-board','Sidus Link']
  },
  {
    id:'aputure-sidus-bicolor',
    manufacturer:'Aputure',
    model:'Synthetic Sidus Bi-Color',
    category:'Light',
    colorMode:'Bi-Color',
    cctK:{min:2700,max:6500},
    sourceUrl:'https://example.invalid/aputure-sidus-bicolor',
    control:['On-board','Sidus Link']
  },
  {
    id:'aputure-sidus-rgbww',
    manufacturer:'Aputure',
    model:'Synthetic Sidus RGBWW',
    category:'Light',
    colorMode:'RGBWW',
    cctK:{min:2000,max:10000},
    sourceUrl:'https://example.invalid/aputure-sidus-rgbww',
    control:['On-board','Sidus Link']
  },
  {
    id:'aputure-no-sidus-negative',
    manufacturer:'Aputure',
    model:'Synthetic CRMX-Only Fixture',
    sourceUrl:'https://example.invalid/aputure-no-sidus-negative',
    control:['On-board','CRMX']
  }
];

normalizeAputureWirelessControl(fixtures);

const daylight=fixtures[0];
const bicolor=fixtures[1];
const rgbww=fixtures[2];
const negative=fixtures[3];

for(const positive of [daylight,bicolor,rgbww]){
  expect(Array.isArray(positive.control?.wireless) && positive.control.wireless.some(v=>/bluetooth/i.test(String(v))),
    positive.id+' must expose explicit Bluetooth transport');
  expect(positive.control?.wirelessVerification?.bluetooth?.verified===true,
    positive.id+' must carry verified Bluetooth transport evidence');
  expect(positive.control?.capabilityVerification?.dim?.verified===true,
    positive.id+' must retain official-app DIM capability evidence');
  expect(positive.control?.capabilityVerification?.fx?.verified===true,
    positive.id+' must retain official-app FX capability evidence');
}

expect(!daylight.control?.capabilityVerification?.cct,
  'Fixed-daylight Sidus fixture must not gain CCT capability evidence');
expect(!daylight.control?.capabilityVerification?.color,
  'Fixed-daylight Sidus fixture must not gain COLOR capability evidence');

expect(bicolor.control?.capabilityVerification?.cct?.verified===true,
  'Bi-Color Sidus fixture must gain class-scoped CCT capability evidence');
expect(!bicolor.control?.capabilityVerification?.color,
  'Bi-Color Sidus fixture must not gain COLOR capability evidence');

expect(rgbww.control?.capabilityVerification?.cct?.verified===true,
  'RGBWW Sidus fixture must gain CCT capability evidence');
expect(rgbww.control?.capabilityVerification?.color?.verified===true,
  'RGBWW Sidus fixture must gain class-scoped COLOR capability evidence');

const negativeLabels=[
  ...(Array.isArray(negative.control)?negative.control:[]),
  ...(Array.isArray(negative.control?.wireless)?negative.control.wireless:[]),
  ...(Array.isArray(negative.control?.legacyLabels)?negative.control.legacyLabels:[])
].map(String);
expect(!negativeLabels.some(v=>/bluetooth|sidus/i.test(v)),
  'Fixture without model-scoped Sidus evidence must not gain Bluetooth/Sidus labels');
expect(!negative.control?.wirelessVerification?.bluetooth,
  'Fixture without model-scoped Sidus evidence must not gain Bluetooth verification');
expect(!negative.control?.capabilityVerification?.dim,
  'Fixture without model-scoped Sidus evidence must not gain official-app capability evidence');

console.log(JSON.stringify({ok:failures.length===0,failures},null,2));
if(failures.length) process.exit(1);
