import { VENDOR_WIRELESS_CAPTURE_PLANS } from './vendor-wireless-capture-plans.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

for(const maker of ['Godox','Nanlite','Aputure','ARRI','Aladdin','EV Light','Astera','Creamsource','Rotolight','Luxli','Quasar Science','Kelvin','SmallRig','amaran','NEEWER','GVM','Litepanels','DMG Lumiere']){
  const plan=VENDOR_WIRELESS_CAPTURE_PLANS[maker];
  expect(!!plan,maker+' capture plan missing');
  if(!plan) continue;
  expect(plan.transport==='bluetooth',maker+' plan must remain direct Bluetooth capture');
  const expectedCommandSpecStatus=maker==='Astera'?'physical-evidence-required':maker==='Kelvin'?'public-reference-implementation-available-model-scoped':'public-command-spec-not-located-in-official-docs';
  expect(plan.commandSpecStatus===expectedCommandSpecStatus,maker+' command spec status changed');
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

expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS.Nanlite.secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS.Nanlite.secondaryPlans.some(x=>x.id==='nanlink-ws-tb1-assisted-bluetooth-capture-v1'&&x.transport==='bluetooth'),'Nanlite WS-TB-1 assisted-Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Nanlite.secondaryPlans.some(x=>x.id==='nanlink-model-scoped-wifi-capture-v1'&&x.transport==='wifi'),'Nanlite Wi-Fi secondary capture plan missing');
expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS.Astera.secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS.Astera.secondaryPlans.some(x=>x.id==='astera-model-scoped-wifi-capture-v1'&&x.transport==='wifi'),'Astera Wi-Fi secondary capture plan missing');
expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS.Rotolight.secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS.Rotolight.secondaryPlans.some(x=>x.id==='rotolight-app-direct-wifi-capture-v1'&&x.transport==='wifi'),'Rotolight Wi-Fi secondary capture plan missing');
expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS['Quasar Science'].secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS['Quasar Science'].secondaryPlans.some(x=>x.id==='quasar-rainbow-model-scoped-wifi-capture-v1'&&x.transport==='wifi'),'Quasar Science Wi-Fi secondary capture plan missing');
expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS.amaran.secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS.amaran.secondaryPlans.some(x=>x.id==='amaran-sm5c-direct-wifi-capture-v1'&&x.transport==='wifi'),'amaran SM5c Wi-Fi capture plan missing');
expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS.GVM.secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS.GVM.secondaryPlans.some(x=>x.id==='gvm-rgb10s-direct-wifi-capture-v1'&&x.transport==='wifi'),'GVM RGB-10S Wi-Fi capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['DMG Lumiere']?.id==='dmg-mix-bluetooth-capture-v1','DMG Lumiere Bluetooth capture plan missing');
expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS['DMG Lumiere']?.secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS['DMG Lumiere'].secondaryPlans.some(x=>x.id==='dmg-mix-wifi-capture-v1'&&x.transport==='wifi'),'DMG Lumiere Wi-Fi capture plan missing');
expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS.Litepanels.secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS.Litepanels.secondaryPlans.some(x=>x.id==='litepanels-astra-ip-direct-wifi-capture-v1'&&x.transport==='wifi'),'Litepanels Astra IP Wi-Fi capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Litepanels.secondaryPlans.some(x=>x.id==='litepanels-assisted-bluetooth-capture-v1'&&x.transport==='bluetooth'),'Litepanels assisted Bluetooth capture plan missing');

expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS.ARRI.secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS.ARRI.secondaryPlans.some(x=>x.id==='arri-skypanel-web-wifi-capture-v1'&&x.transport==='wifi'),'ARRI Wi-Fi secondary capture plan missing');
expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS['EV Light'].secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS['EV Light'].secondaryPlans.some(x=>x.id==='evlight-model-scoped-wifi-capture-v1'&&x.transport==='wifi'),'EV Light Wi-Fi secondary capture plan missing');
for(const secondary of [...(VENDOR_WIRELESS_CAPTURE_PLANS.ARRI.secondaryPlans||[]),...(VENDOR_WIRELESS_CAPTURE_PLANS['EV Light'].secondaryPlans||[])]){
  expect(String(secondary.commandSpecStatus||'').includes('not-located-in-official-docs'),'secondary Wi-Fi plan must remain command-spec-unverified: '+secondary.id);
  expect(/Do not infer|must not be converted/i.test(String(secondary.rule||'')),'secondary Wi-Fi plan must forbid undocumented API inference: '+secondary.id);
}

expect(VENDOR_WIRELESS_CAPTURE_PLANS.Astera.existingToolchain?.orchestrator==='backend/astera-physical-capture-set.js','Astera capture plan must point to verified orchestrator');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Astera.safety?.lightingAiWritesAllowed===false,'Astera evidence capture must keep LightingAI proprietary writes disabled');
console.log(JSON.stringify({ok:failures.length===0,vendors:17,failures},null,2));
if(failures.length)process.exit(1);
