import { normalizeAladdinControl } from './aladdin-control-verification.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

const fixtures=[
  {
    id:'aladdin-mosaic-2x4',
    manufacturer:'Aladdin',
    model:'MOSAIC 2X4',
    sourceUrl:'https://aladdin-lights.com/mosaic-2x4/',
    control:['Bluetooth/App','On-board']
  },
  {
    id:'aladdin-unknown-bluetooth',
    manufacturer:'Aladdin',
    model:'Synthetic Unknown Bluetooth Fixture',
    sourceUrl:'https://example.invalid/aladdin-unknown-bluetooth',
    control:['Bluetooth/App','On-board']
  }
];

normalizeAladdinControl(fixtures);

const known=fixtures[0];
const unknown=fixtures[1];

expect(known.control?.wirelessVerification?.bluetooth?.verified===true,
  'Known sourced Aladdin Bluetooth model must remain transport-verified');
expect(Array.isArray(known.control?.wirelessVerification?.bluetooth?.sourceUrls) &&
  known.control.wirelessVerification.bluetooth.sourceUrls.length>0,
  'Known sourced Aladdin Bluetooth verification must carry official source evidence');

expect(Array.isArray(unknown.control?.wireless) &&
  unknown.control.wireless.some(v=>/bluetooth/i.test(String(v))),
  'Unknown fixture may preserve its catalog Bluetooth label');
expect(!unknown.control?.wirelessVerification?.bluetooth,
  'Unknown Aladdin Bluetooth label without approved model/family source must not become verified');

console.log(JSON.stringify({ok:failures.length===0,failures},null,2));
if(failures.length) process.exit(1);
