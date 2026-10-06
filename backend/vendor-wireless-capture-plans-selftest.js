import { VENDOR_WIRELESS_CAPTURE_PLANS } from './vendor-wireless-capture-plans.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

for(const maker of ['Godox','Nanlite','Aputure','ARRI','Aladdin','EV Light','Astera','Creamsource','Rotolight','Luxli','Quasar Science','Kelvin','SmallRig','amaran','NEEWER','GVM','Litepanels','DMG Lumiere','ZHIYUN','PROLYCHT','COLBOR','SIRUI','Harlowe','SWIT','Dracast','Hive Lighting','Kinotehnik','VELVET','VILTROX','Phottix','YONGNUO','PIXEL','Falcon Eyes','Lishuai','NiceFoto','Ulanzi','SOONWELL','Moman','Ikan','Jinbei','Lume Cube','Fotodiox']){
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
expect(VENDOR_WIRELESS_CAPTURE_PLANS['Falcon Eyes']?.id==='falcon-eyes-desal-bluetooth-capture-v1','Falcon Eyes Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.PIXEL?.id==='pixel-app-bluetooth-capture-v1','PIXEL Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.YONGNUO?.id==='yongnuo-app-bluetooth-capture-v1','YONGNUO Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Phottix?.id==='phottix-lighting-control-bluetooth-capture-v1','Phottix Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.VILTROX?.id==='viltrox-weeylite-pro-bluetooth-capture-v1','VILTROX Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.VELVET?.id==='velvet-evo-wireless-capture-v1','VELVET wireless capture plan missing');
expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS.VELVET?.secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS.VELVET.secondaryPlans.some(x=>x.id==='velvet-evo-wifi-artnet-capture-v1'&&x.transport==='wifi'),'VELVET Wi-Fi Art-Net secondary capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Kinotehnik?.id==='kinotehnik-practilite-bluetooth-capture-v1','Kinotehnik Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['Hive Lighting']?.id==='hive-shot-bluetooth-capture-v1','Hive Lighting Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Dracast?.id==='dracast-palette-v2-bluetooth-capture-v1','Dracast Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.SWIT?.id==='swit-console-bluetooth-capture-v1','SWIT Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Harlowe?.id==='harlowe-app-bluetooth-capture-v1','Harlowe Bluetooth capture plan missing');
const broncolor=VENDOR_WIRELESS_CAPTURE_PLANS.broncolor;
expect(broncolor?.id==='broncolor-led-f160-wifi-capture-v1','broncolor Wi-Fi capture plan missing');
expect(broncolor?.transport==='wifi','broncolor LED F160 capture plan must remain Wi-Fi only');
expect(broncolor?.commandSpecStatus==='public-command-spec-not-located-in-official-docs','broncolor command spec status changed');
expect(broncolor?.captureSets?.connectOnly?.runs>=3,'broncolor connect-only requires at least 3 runs');
expect(broncolor?.captureSets?.dim?.runs>=3,'broncolor DIM requires at least 3 runs');
expect(broncolor?.captureSets?.cct?.runs>=3,'broncolor CCT requires at least 3 runs');
expect(broncolor?.safety?.officialAppWritesOnly===true,'broncolor official-app-only capture safety missing');
expect(broncolor?.safety?.lightingAiWritesAllowed===false,'broncolor LightingAI writes must stay disabled during capture');
expect(broncolor?.safety?.rawCaptureCommitAllowed===false,'broncolor raw captures must never be committed');
expect(broncolor?.safety?.derivedEvidenceOnly===true,'broncolor only derived evidence may enter repo');
expect(broncolor?.safety?.resultStatus==='candidate_only_until_physical_replay','broncolor capture result must remain candidate-only');

expect(VENDOR_WIRELESS_CAPTURE_PLANS.Fiilex?.id==='fiilex-matrix-wifi-capture-v1','Fiilex Wi-Fi capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Fiilex?.transport==='wifi','Fiilex Matrix capture plan must remain Wi-Fi only');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['CAME-TV']?.id==='came-tv-boltzen-wifi-capture-v1','CAME-TV Wi-Fi capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['CAME-TV']?.transport==='wifi','CAME-TV capture plan must remain Wi-Fi only');
const chauvet=VENDOR_WIRELESS_CAPTURE_PLANS['CHAUVET DJ'];
expect(chauvet?.id==='chauvet-dj-btair-bluetooth-capture-v1','CHAUVET DJ Bluetooth capture plan missing');
expect(chauvet?.transport==='bluetooth','CHAUVET DJ capture plan must remain Bluetooth only');
expect(chauvet?.commandSpecStatus==='public-command-spec-not-located-in-official-docs','CHAUVET DJ command spec status changed');
expect(chauvet?.captureSets?.connectOnly?.runs>=3,'CHAUVET DJ connect-only requires at least 3 runs');
expect(chauvet?.captureSets?.dim?.runs>=3,'CHAUVET DJ DIM requires at least 3 runs');
expect(chauvet?.captureSets?.color?.runs>=3,'CHAUVET DJ COLOR requires at least 3 runs');
expect(chauvet?.safety?.officialAppWritesOnly===true,'CHAUVET DJ official-app-only capture safety missing');
expect(chauvet?.safety?.lightingAiWritesAllowed===false,'CHAUVET DJ LightingAI writes must stay disabled during capture');
expect(chauvet?.safety?.rawCaptureCommitAllowed===false,'CHAUVET DJ raw captures must never be committed');
expect(chauvet?.safety?.derivedEvidenceOnly===true,'CHAUVET DJ only derived evidence may enter repo');
expect(chauvet?.safety?.resultStatus==='candidate_only_until_physical_replay','CHAUVET DJ capture result must remain candidate-only');

expect(VENDOR_WIRELESS_CAPTURE_PLANS.Tolifo?.id==='tolifo-gk2016-wifi-capture-v1','Tolifo Wi-Fi capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Tolifo?.transport==='wifi','Tolifo capture plan must remain Wi-Fi only');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Tolifo?.commandSpecStatus==='public-command-spec-not-located-in-official-docs','Tolifo command spec status changed');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Tolifo?.captureSets?.connectOnly?.runs>=3,'Tolifo connect-only requires at least 3 runs');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Tolifo?.captureSets?.dim?.runs>=3,'Tolifo DIM requires at least 3 runs');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Tolifo?.safety?.officialAppWritesOnly===true,'Tolifo official-app-only capture safety missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Tolifo?.safety?.lightingAiWritesAllowed===false,'Tolifo LightingAI writes must stay disabled during capture');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Tolifo?.safety?.rawCaptureCommitAllowed===false,'Tolifo raw captures must never be committed');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Tolifo?.safety?.derivedEvidenceOnly===true,'Tolifo only derived evidence may enter repo');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['CAME-TV']?.commandSpecStatus==='public-command-spec-not-located-in-official-docs','CAME-TV command spec status changed');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['CAME-TV']?.captureSets?.connectOnly?.runs>=3,'CAME-TV connect-only requires at least 3 runs');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['CAME-TV']?.captureSets?.dim?.runs>=3,'CAME-TV DIM requires at least 3 runs');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['CAME-TV']?.captureSets?.cct?.runs>=3,'CAME-TV CCT requires at least 3 runs');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['CAME-TV']?.safety?.officialAppWritesOnly===true,'CAME-TV official-app-only capture safety missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['CAME-TV']?.safety?.lightingAiWritesAllowed===false,'CAME-TV LightingAI writes must stay disabled during capture');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['CAME-TV']?.safety?.rawCaptureCommitAllowed===false,'CAME-TV raw captures must never be committed');
expect(VENDOR_WIRELESS_CAPTURE_PLANS['CAME-TV']?.safety?.derivedEvidenceOnly===true,'CAME-TV only derived evidence may enter repo');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Fiilex?.commandSpecStatus==='public-command-spec-not-located-in-official-docs','Fiilex command spec status changed');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Fiilex?.captureSets?.connectOnly?.runs>=3,'Fiilex connect-only requires at least 3 runs');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Fiilex?.captureSets?.dim?.runs>=3,'Fiilex DIM requires at least 3 runs');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Fiilex?.captureSets?.cct?.runs>=3,'Fiilex CCT requires at least 3 runs');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Fiilex?.safety?.officialAppWritesOnly===true,'Fiilex official-app-only capture safety missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Fiilex?.safety?.lightingAiWritesAllowed===false,'Fiilex LightingAI writes must stay disabled during capture');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Fiilex?.safety?.rawCaptureCommitAllowed===false,'Fiilex raw captures must never be committed');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.Fiilex?.safety?.derivedEvidenceOnly===true,'Fiilex only derived evidence may enter repo');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.SIRUI?.id==='sirui-light-bluetooth-capture-v1','SIRUI Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.COLBOR?.id==='colbor-studio-bluetooth-capture-v1','COLBOR Bluetooth capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.PROLYCHT?.id==='prolycht-chromalink-bluetooth-capture-v1','PROLYCHT Bluetooth capture plan missing');
expect(Array.isArray(VENDOR_WIRELESS_CAPTURE_PLANS.PROLYCHT?.secondaryPlans)&&VENDOR_WIRELESS_CAPTURE_PLANS.PROLYCHT.secondaryPlans.some(x=>x.id==='prolycht-chromalink-wifi-capture-v1'&&x.transport==='wifi'),'PROLYCHT Wi-Fi capture plan missing');
expect(VENDOR_WIRELESS_CAPTURE_PLANS.ZHIYUN?.id==='zhiyun-zy-vega-bluetooth-capture-v1','ZHIYUN Bluetooth capture plan missing');
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
console.log(JSON.stringify({ok:failures.length===0,vendors:23,failures},null,2));
if(failures.length)process.exit(1);
