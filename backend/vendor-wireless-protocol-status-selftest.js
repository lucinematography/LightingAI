import { VENDOR_WIRELESS_PROTOCOL_STATUS, vendorWideCommandProductionReady, commandProductionReadyForStatus } from './vendor-wireless-protocol-status.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

const expected=['Aputure','Godox','Nanlite','ARRI','Astera','Aladdin','EV Light','Kino Flo','De Sisti','LiteGear'];
for(const maker of expected) expect(!!VENDOR_WIRELESS_PROTOCOL_STATUS[maker],maker+' protocol status missing');

for(const maker of ['Aputure','Godox','Nanlite','ARRI','Astera','Aladdin','EV Light']){
  const row=VENDOR_WIRELESS_PROTOCOL_STATUS[maker];
  expect(row.commandSpec!=='production_verified',maker+' proprietary command path must not be marked production verified');
}
for(const maker of ['Aputure','Godox','Nanlite','ARRI','Astera','Aladdin','EV Light']){
  expect(vendorWideCommandProductionReady(maker)===false,maker+' vendor-wide readiness must remain false without explicit vendor-wide production scope');
}

const syntheticStatus=VENDOR_WIRELESS_PROTOCOL_STATUS.__synthetic_missing_scope;
expect(vendorWideCommandProductionReady('__synthetic_missing_scope')===false,'Missing vendor status must remain fail-closed');
expect(commandProductionReadyForStatus({commandSpec:'production_verified'})===false,
  'production_verified without scope must remain fail-closed');
expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth'],fixtureIds:['fixture-a']},
  productionEvidence:{physicalReplayVerified:true,derivedEvidenceRefs:['derived/replay.json'],verifiedTransports:['bluetooth'],verifiedFixtureIds:['fixture-a'],capturePlanIds:['bt-plan']}
})===false,
  'omitted required transport scope must remain fail-closed');
expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth'],fixtureIds:['fixture-a']},
  productionEvidence:{physicalReplayVerified:true,derivedEvidenceRefs:['derived/replay.json'],verifiedTransports:['bluetooth'],verifiedFixtureIds:['fixture-a'],capturePlanIds:['bt-plan']}
},['bluetooth'],[])===false,
  'omitted required fixture scope must remain fail-closed');
expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  productionScope:{kind:'model-family',allCurrentWirelessFixtures:false,transports:['bluetooth']}
})===false,
  'model/family scoped production proof must not unlock an entire vendor');
expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth'],fixtureIds:['fixture-a']}
},['bluetooth'],['fixture-a'])===false,
  'vendor-wide scope without physical replay evidence must remain fail-closed');
expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth'],fixtureIds:['fixture-a']},
  productionEvidence:{physicalReplayVerified:true,derivedEvidenceRefs:['derived/fixture-family-replay.json'],verifiedTransports:['bluetooth'],verifiedFixtureIds:['fixture-a'],capturePlanIds:['bt-plan']}
},['bluetooth'],['fixture-a'])===true,
  'vendor-wide scope with physical replay evidence and complete fixture coverage should be accepted');

expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth'],fixtureIds:['fixture-a']},
  productionEvidence:{physicalReplayVerified:true,derivedEvidenceRefs:[],verifiedTransports:['bluetooth'],verifiedFixtureIds:['fixture-a'],capturePlanIds:['bt-plan']}
},['bluetooth'],['fixture-a'])===false,
  'empty derived evidence references must remain fail-closed');
expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth'],fixtureIds:['fixture-a']},
  productionEvidence:{physicalReplayVerified:false,derivedEvidenceRefs:['derived/unverified.json'],verifiedTransports:['bluetooth'],verifiedFixtureIds:['fixture-a'],capturePlanIds:['bt-plan']}
},['bluetooth'],['fixture-a'])===false,
  'unverified physical replay must remain fail-closed');

expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  secondaryCapturePlanIds:['wifi-plan'],
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth'],fixtureIds:['fixture-a','fixture-b']},
  productionEvidence:{physicalReplayVerified:true,derivedEvidenceRefs:['derived/vendor-wide-replay.json'],verifiedTransports:['bluetooth','wifi'],verifiedFixtureIds:['fixture-a','fixture-b'],capturePlanIds:['bt-plan','wifi-plan']}
},['bluetooth','wifi'],['fixture-a','fixture-b'])===false,
  'vendor-wide scope missing Wi-Fi must remain fail-closed for a Bluetooth + Wi-Fi vendor');
expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  secondaryCapturePlanIds:['wifi-plan'],
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth','wifi'],fixtureIds:['fixture-a','fixture-b']},
  productionEvidence:{physicalReplayVerified:true,derivedEvidenceRefs:['derived/vendor-wide-replay.json'],verifiedTransports:['bluetooth','wifi'],verifiedFixtureIds:['fixture-a','fixture-b'],capturePlanIds:['bt-plan','wifi-plan']}
},['bluetooth','wifi'],['fixture-a','fixture-b'])===true,
  'vendor-wide scope covering every active transport and fixture with physical replay evidence should be accepted');

expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  secondaryCapturePlanIds:['wifi-plan'],
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth','wifi'],fixtureIds:['fixture-a','fixture-b']},
  productionEvidence:{physicalReplayVerified:true,derivedEvidenceRefs:['derived/vendor-wide-replay.json'],verifiedTransports:['bluetooth','wifi'],verifiedFixtureIds:['fixture-a','fixture-b'],capturePlanIds:['bt-plan']}
},['bluetooth','wifi'],['fixture-a','fixture-b'])===false,
  'physical evidence missing linked Wi-Fi capture plan must remain fail-closed');

expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  secondaryCapturePlanIds:['wifi-plan'],
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth','wifi'],fixtureIds:['fixture-a','fixture-b']},
  productionEvidence:{physicalReplayVerified:true,derivedEvidenceRefs:['derived/vendor-wide-replay.json'],verifiedTransports:['bluetooth'],verifiedFixtureIds:['fixture-a','fixture-b'],capturePlanIds:['bt-plan','wifi-plan']}
},['bluetooth','wifi'],['fixture-a','fixture-b'])===false,
  'physical evidence missing Wi-Fi must remain fail-closed');

expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  secondaryCapturePlanIds:['wifi-plan'],
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth','wifi'],fixtureIds:['fixture-a','fixture-b']},
  productionEvidence:{physicalReplayVerified:true,derivedEvidenceRefs:['derived/vendor-wide-replay.json'],verifiedTransports:['bluetooth','wifi'],verifiedFixtureIds:['fixture-a'],capturePlanIds:['bt-plan','wifi-plan']}
},['bluetooth','wifi'],['fixture-a','fixture-b'])===false,
  'physical evidence missing one fixture must remain fail-closed');

expect(commandProductionReadyForStatus({
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  secondaryCapturePlanIds:['wifi-plan'],
  productionScope:{kind:'vendor-wide',allCurrentWirelessFixtures:true,transports:['bluetooth','wifi'],fixtureIds:['fixture-a']},
  productionEvidence:{physicalReplayVerified:true,derivedEvidenceRefs:['derived/vendor-wide-replay.json'],verifiedTransports:['bluetooth','wifi'],verifiedFixtureIds:['fixture-a','fixture-b'],capturePlanIds:['bt-plan','wifi-plan']}
},['bluetooth','wifi'],['fixture-a','fixture-b'])===false,
  'vendor-wide scope missing one current wireless fixture must remain fail-closed');


expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Astera.nextStep==='capture-plan-required-before-driver','Astera physical evidence path changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Astera.capturePlanId==='astera-physical-capture-set-v1','Astera capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Astera.secondaryCapturePlanIds?.includes('astera-model-scoped-wifi-capture-v1'),'Astera Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Godox.capturePlanId==='godox-light-bluetooth-capture-v1','Godox capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Nanlite.capturePlanId==='nanlink-direct-bluetooth-capture-v1','Nanlite capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Nanlite.secondaryCapturePlanIds?.includes('nanlink-model-scoped-wifi-capture-v1'),'Nanlite Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Aputure.capturePlanId==='sidus-direct-bluetooth-capture-v1','Aputure capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ARRI.capturePlanId==='arri-lico-direct-bluetooth-capture-v1','ARRI capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ARRI.secondaryCapturePlanIds?.includes('arri-skypanel-web-wifi-capture-v1'),'ARRI Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Aladdin.capturePlanId==='aladdin-app-ble-capture-v1','Aladdin capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['EV Light'].capturePlanId==='evlight-direct-bluetooth-capture-v1','EV Light capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['EV Light'].secondaryCapturePlanIds?.includes('evlight-model-scoped-wifi-capture-v1'),'EV Light Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Kino Flo'].bluetooth==='not_verified_for_current_catalog','Kino Flo Bluetooth must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Kino Flo'].wifi==='not_verified_for_current_catalog','Kino Flo Wi-Fi must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['De Sisti'].bluetooth==='not_verified_for_current_catalog','De Sisti Bluetooth must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.LiteGear.bluetooth==='not_verified_for_current_catalog','LiteGear Bluetooth must remain unverified');

console.log(JSON.stringify({
  ok:failures.length===0,
  manufacturers:expected.length,
  commandProductionVerified:0,
  failures
},null,2));
if(failures.length)process.exit(1);
