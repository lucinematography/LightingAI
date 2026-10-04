import { normalizeAputureWirelessControl } from './aputure-wireless-verification.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

const fixtures=[
  {
    id:'aputure-sidus-positive',
    manufacturer:'Aputure',
    model:'Synthetic Sidus Fixture',
    sourceUrl:'https://example.invalid/aputure-sidus-positive',
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

const positive=fixtures[0];
const negative=fixtures[1];

expect(Array.isArray(positive.control?.wireless) && positive.control.wireless.some(v=>/bluetooth/i.test(String(v))),
  'Sidus-positive fixture must expose explicit Bluetooth transport');
expect(positive.control?.wirelessVerification?.bluetooth?.verified===true,
  'Sidus-positive fixture must carry verified Bluetooth transport evidence');
expect(positive.control?.capabilityVerification?.dim?.verified===true,
  'Sidus-positive fixture must retain official-app DIM capability evidence');

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
