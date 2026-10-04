import { VENDOR_WIRELESS_CAPTURE_PLANS } from './vendor-wireless-capture-plans.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

for(const maker of ['Godox','Nanlite','Aputure']){
  const plan=VENDOR_WIRELESS_CAPTURE_PLANS[maker];
  expect(!!plan,maker+' capture plan missing');
  if(!plan) continue;
  expect(plan.transport==='bluetooth',maker+' plan must remain direct Bluetooth capture');
  expect(plan.commandSpecStatus==='public-command-spec-not-located-in-official-docs',maker+' command spec status changed');
  expect(plan.captureSets?.connectOnly?.runs>=3,maker+' connect-only requires at least 3 runs');
  expect(plan.captureSets?.dim?.runs>=3,maker+' DIM requires at least 3 runs');
  expect(plan.captureSets?.cct?.runs>=3,maker+' CCT requires at least 3 runs');
  expect(plan.safety?.officialAppWritesOnly===true,maker+' official-app-only capture safety missing');
  expect(plan.safety?.lightingAiWritesAllowed===false,maker+' LightingAI writes must stay disabled during capture');
  expect(plan.safety?.rawCaptureCommitAllowed===false,maker+' raw captures must never be committed');
  expect(plan.safety?.derivedEvidenceOnly===true,maker+' only derived evidence may enter repo');
  expect(plan.safety?.resultStatus==='candidate_only_until_physical_replay',maker+' capture result must remain candidate-only');
}

expect(VENDOR_WIRELESS_CAPTURE_PLANS.Nanlite.prerequisites.some(x=>/WS-TB-1/.test(x)),'Nanlite direct-Bluetooth plan must explicitly exclude WS-TB-1');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Aputure.prerequisites.some(x=>/Sidus Link Bridge/.test(x)),'Aputure direct-Bluetooth plan must exclude bridge path');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Godox.prerequisites.some(x=>/Bluetooth reset/i.test(x)),'Godox clean-session Bluetooth reset requirement missing');

console.log(JSON.stringify({ok:failures.length===0,vendors:3,failures},null,2));
if(failures.length)process.exit(1);
