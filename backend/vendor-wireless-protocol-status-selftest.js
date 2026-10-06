import { VENDOR_WIRELESS_PROTOCOL_STATUS, vendorWideCommandProductionReady, commandProductionReadyForStatus } from './vendor-wireless-protocol-status.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
const route=(fixtureId,transport)=>({fixtureId,transport});

const expected=['Aputure','Godox','Nanlite','ARRI','Astera','Aladdin','EV Light','Creamsource','Rotolight','Luxli','Quasar Science','Kelvin','SmallRig','amaran','NEEWER','GVM','Litepanels','DMG Lumiere','ZHIYUN','PROLYCHT','COLBOR','SIRUI','Fiilex','Harlowe','SWIT','Dracast','Hive Lighting','Kinotehnik','VELVET','VILTROX','Phottix','YONGNUO','PIXEL','Falcon Eyes','Lishuai','NiceFoto','Ulanzi','CAME-TV','SOONWELL','Tolifo','Moman','Ikan','Jinbei','Lume Cube','CHAUVET DJ','Fotodiox','broncolor','Genaray','Elgato','Westcott','Logitech G','Rollei','Razer','NANLUX','Mettle','PiXAPRO','Ape Labs','Pilotfly','LUXCEO','Kino Flo','De Sisti','LiteGear'];
for(const maker of expected) expect(!!VENDOR_WIRELESS_PROTOCOL_STATUS[maker],maker+' protocol status missing');

for(const maker of ['Aputure','Godox','Nanlite','ARRI','Astera','Aladdin','EV Light','Creamsource','Rotolight','Luxli','Quasar Science','Kelvin','SmallRig','amaran','NEEWER','GVM','Litepanels','DMG Lumiere','ZHIYUN','PROLYCHT','COLBOR','SIRUI','Fiilex','Harlowe','SWIT','Dracast','Hive Lighting','Kinotehnik','VELVET','VILTROX','Phottix','YONGNUO','PIXEL','Falcon Eyes','Lishuai','NiceFoto','Ulanzi','CAME-TV','SOONWELL','Tolifo','Moman','Ikan','Jinbei','Lume Cube','CHAUVET DJ','Fotodiox','broncolor','Genaray','Elgato','Westcott','Logitech G','Rollei','Razer','NANLUX','Mettle','PiXAPRO','Ape Labs','Pilotfly','LUXCEO']){
  const row=VENDOR_WIRELESS_PROTOCOL_STATUS[maker];
  expect(row.commandSpec!=='production_verified',maker+' proprietary command path must not be marked production verified');
  expect(vendorWideCommandProductionReady(maker)===false,maker+' vendor-wide readiness must remain false without explicit production scope inputs');
}

expect(vendorWideCommandProductionReady('__synthetic_missing_scope')===false,'Missing vendor status must remain fail-closed');
expect(commandProductionReadyForStatus({commandSpec:'production_verified'})===false,'production_verified without scope must remain fail-closed');

const singleRoute=[route('fixture-a','bluetooth')];
const singleBase={
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  productionScope:{
    kind:'vendor-wide',
    allCurrentWirelessFixtures:true,
    transports:['bluetooth'],
    fixtureIds:['fixture-a']
  },
  productionEvidence:{
    physicalReplayVerified:true,
    derivedEvidenceRefs:['derived/fixture-a-bluetooth-replay.json'],
    verifiedTransports:['bluetooth'],
    verifiedFixtureIds:['fixture-a'],
    verifiedRoutes:singleRoute,
    capturePlanIds:['bt-plan']
  }
};

expect(commandProductionReadyForStatus(singleBase)===false,'omitted required production scope inputs must remain fail-closed');
expect(commandProductionReadyForStatus(singleBase,['bluetooth'],[],singleRoute)===false,'omitted required fixture IDs must remain fail-closed');
expect(commandProductionReadyForStatus(singleBase,['bluetooth'],['fixture-a'],[])===false,'omitted required route matrix must remain fail-closed');
expect(commandProductionReadyForStatus({
  ...singleBase,
  productionScope:{...singleBase.productionScope,kind:'model-family',allCurrentWirelessFixtures:false}
},['bluetooth'],['fixture-a'],singleRoute)===false,'model/family scope must not unlock an entire vendor');

expect(commandProductionReadyForStatus({
  ...singleBase,
  productionEvidence:undefined
},['bluetooth'],['fixture-a'],singleRoute)===false,'vendor-wide scope without physical replay evidence must remain fail-closed');

expect(commandProductionReadyForStatus({
  ...singleBase,
  productionEvidence:{...singleBase.productionEvidence,derivedEvidenceRefs:[]}
},['bluetooth'],['fixture-a'],singleRoute)===false,'empty derived evidence references must remain fail-closed');

expect(commandProductionReadyForStatus({
  ...singleBase,
  productionEvidence:{...singleBase.productionEvidence,physicalReplayVerified:false}
},['bluetooth'],['fixture-a'],singleRoute)===false,'unverified physical replay must remain fail-closed');

expect(commandProductionReadyForStatus({
  ...singleBase,
  productionEvidence:{...singleBase.productionEvidence,capturePlanIds:[]}
},['bluetooth'],['fixture-a'],singleRoute)===false,'missing linked capture-plan evidence must remain fail-closed');

expect(commandProductionReadyForStatus(singleBase,['bluetooth'],['fixture-a'],singleRoute)===true,
  'single-transport vendor-wide scope with replay and route evidence should be accepted');

const dualRoutes=[route('fixture-a','bluetooth'),route('fixture-b','wifi')];
const dualBase={
  commandSpec:'production_verified',
  capturePlanId:'bt-plan',
  secondaryCapturePlanIds:['wifi-plan'],
  productionScope:{
    kind:'vendor-wide',
    allCurrentWirelessFixtures:true,
    transports:['bluetooth','wifi'],
    fixtureIds:['fixture-a','fixture-b']
  },
  productionEvidence:{
    physicalReplayVerified:true,
    derivedEvidenceRefs:['derived/vendor-wide-replay.json'],
    verifiedTransports:['bluetooth','wifi'],
    verifiedFixtureIds:['fixture-a','fixture-b'],
    verifiedRoutes:dualRoutes,
    capturePlanIds:['bt-plan','wifi-plan']
  }
};

expect(commandProductionReadyForStatus({
  ...dualBase,
  productionScope:{...dualBase.productionScope,transports:['bluetooth']}
},['bluetooth','wifi'],['fixture-a','fixture-b'],dualRoutes)===false,
  'vendor-wide scope missing Wi-Fi must remain fail-closed');

expect(commandProductionReadyForStatus({
  ...dualBase,
  productionScope:{...dualBase.productionScope,fixtureIds:['fixture-a']}
},['bluetooth','wifi'],['fixture-a','fixture-b'],dualRoutes)===false,
  'vendor-wide scope missing one current wireless fixture must remain fail-closed');

expect(commandProductionReadyForStatus({
  ...dualBase,
  productionEvidence:{...dualBase.productionEvidence,verifiedTransports:['bluetooth']}
},['bluetooth','wifi'],['fixture-a','fixture-b'],dualRoutes)===false,
  'physical evidence missing Wi-Fi transport must remain fail-closed');

expect(commandProductionReadyForStatus({
  ...dualBase,
  productionEvidence:{...dualBase.productionEvidence,verifiedFixtureIds:['fixture-a']}
},['bluetooth','wifi'],['fixture-a','fixture-b'],dualRoutes)===false,
  'physical evidence missing one fixture must remain fail-closed');

expect(commandProductionReadyForStatus({
  ...dualBase,
  productionEvidence:{...dualBase.productionEvidence,verifiedRoutes:[route('fixture-a','bluetooth')]}
},['bluetooth','wifi'],['fixture-a','fixture-b'],dualRoutes)===false,
  'physical evidence missing fixture+transport route must remain fail-closed');

expect(commandProductionReadyForStatus({
  ...dualBase,
  productionEvidence:{...dualBase.productionEvidence,capturePlanIds:['bt-plan']}
},['bluetooth','wifi'],['fixture-a','fixture-b'],dualRoutes)===false,
  'physical evidence missing linked Wi-Fi capture plan must remain fail-closed');

expect(commandProductionReadyForStatus(dualBase,['bluetooth','wifi'],['fixture-a','fixture-b'],dualRoutes)===true,
  'vendor-wide scope covering every transport, fixture, route and capture plan should be accepted');

expect(commandProductionReadyForStatus(dualBase,['bluetooth','wifi'],['fixture-a','fixture-b'],[
  route('fixture-a','bluetooth'),
  {fixtureId:'',transport:'wifi'}
])===false,'malformed required route matrix must remain fail-closed');

expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Astera.nextStep==='capture-plan-required-before-driver','Astera physical evidence path changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Astera.capturePlanId==='astera-physical-capture-set-v1','Astera capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Astera.secondaryCapturePlanIds?.includes('astera-model-scoped-wifi-capture-v1'),'Astera Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Godox.capturePlanId==='godox-light-bluetooth-capture-v1','Godox capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Nanlite.capturePlanId==='nanlink-direct-bluetooth-capture-v1','Nanlite capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Nanlite.secondaryCapturePlanIds?.includes('nanlink-ws-tb1-assisted-bluetooth-capture-v1'),'Nanlite WS-TB-1 assisted-Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Nanlite.secondaryCapturePlanIds?.includes('nanlink-model-scoped-wifi-capture-v1'),'Nanlite Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Aputure.capturePlanId==='sidus-direct-bluetooth-capture-v1','Aputure capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ARRI.capturePlanId==='arri-lico-direct-bluetooth-capture-v1','ARRI capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ARRI.secondaryCapturePlanIds?.includes('arri-skypanel-web-wifi-capture-v1'),'ARRI Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Aladdin.capturePlanId==='aladdin-app-ble-capture-v1','Aladdin capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['EV Light'].capturePlanId==='evlight-direct-bluetooth-capture-v1','EV Light capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['EV Light'].secondaryCapturePlanIds?.includes('evlight-model-scoped-wifi-capture-v1'),'EV Light Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Creamsource.capturePlanId==='creamsource-vortex-crmx-ble-capture-v1','Creamsource Vortex capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Rotolight.capturePlanId==='rotolight-app-direct-bluetooth-capture-v1','Rotolight Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Rotolight.secondaryCapturePlanIds?.includes('rotolight-app-direct-wifi-capture-v1'),'Rotolight Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Luxli.capturePlanId==='luxli-composer-direct-bluetooth-capture-v1','Luxli Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Quasar Science'].capturePlanId==='quasar-starctrl-direct-bluetooth-capture-v1','Quasar Science Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Quasar Science'].secondaryCapturePlanIds?.includes('quasar-rainbow-model-scoped-wifi-capture-v1'),'Quasar Science Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Kelvin.capturePlanId==='kelvin-narrator-direct-bluetooth-capture-v1','Kelvin Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Kelvin.publicReferenceImplementation?.verifiedFixtureIds?.length===4,'Kelvin public BLE reference scope changed unexpectedly');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SmallRig.capturePlanId==='smallrig-smallgogo-direct-ble-capture-v1','SmallRig Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.amaran.capturePlanId==='amaran-sidus-direct-bluetooth-capture-v1','amaran Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.amaran.secondaryCapturePlanIds?.includes('amaran-sm5c-direct-wifi-capture-v1'),'amaran SM5c Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.NEEWER.capturePlanId==='neewer-app-direct-bluetooth-capture-v1','NEEWER Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.GVM.capturePlanId==='gvm-led-app-direct-bluetooth-capture-v1','GVM Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.GVM.secondaryCapturePlanIds?.includes('gvm-rgb10s-direct-wifi-capture-v1'),'GVM RGB-10S Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Falcon Eyes']?.capturePlanId==='falcon-eyes-desal-bluetooth-capture-v1','Falcon Eyes Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Lishuai?.capturePlanId==='lishuai-lightreel-bluetooth-capture-v1','Lishuai Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.NiceFoto?.capturePlanId==='nicefoto-tc-bluetooth-mesh-capture-v1','NiceFoto Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Ulanzi?.capturePlanId==='ulanzi-connect-bluetooth-capture-v1','Ulanzi Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['CAME-TV']?.capturePlanId==='came-tv-boltzen-wifi-capture-v1','CAME-TV Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SOONWELL?.capturePlanId==='soonwell-g900-sensei-link-bluetooth-capture-v1','SOONWELL Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Tolifo?.capturePlanId==='tolifo-gk2016-wifi-capture-v1','Tolifo Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Moman?.capturePlanId==='moman-pc8-bluetooth-capture-v1','Moman Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Ikan?.capturePlanId==='ikan-idc150-bluetooth-capture-v1','Ikan Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Jinbei?.capturePlanId==='jinbei-studio-bluetooth-capture-v1','Jinbei Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Lume Cube']?.capturePlanId==='lume-cube-lume-control-bluetooth-capture-v1','Lume Cube Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['CHAUVET DJ']?.capturePlanId==='chauvet-dj-btair-bluetooth-capture-v1','CHAUVET DJ Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Fotodiox?.capturePlanId==='fotodiox-prizmo-stick-512-bluetooth-capture-v1','Fotodiox Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.broncolor?.capturePlanId==='broncolor-led-f160-wifi-capture-v1','broncolor Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Genaray?.capturePlanId==='genaray-rgb-bluetooth-capture-v1','Genaray Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Elgato?.capturePlanId==='elgato-control-center-wifi-capture-v1','Elgato Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Westcott?.capturePlanId==='westcott-studiolink-bluetooth-capture-v1','Westcott Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Logitech G']?.capturePlanId==='logitech-g-litra-bluetooth-capture-v1','Logitech G Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Rollei?.capturePlanId==='rollei-bluetooth-capture-v1','Rollei Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Razer?.capturePlanId==='razer-key-light-chroma-wifi-capture-v1','Razer Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.NANLUX?.capturePlanId==='nanlux-evoke-2400b-nanlink-bluetooth-capture-v1','NANLUX Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Mettle?.capturePlanId==='mettle-tube-x-bluetooth-capture-v1','Mettle Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.PiXAPRO?.capturePlanId==='pixapro-neon-bluetooth-capture-v1','PiXAPRO Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Ape Labs']?.capturePlanId==='ape-labs-connect-assisted-bluetooth-capture-v1','Ape Labs assisted Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Pilotfly?.capturePlanId==='pilotfly-atomcube-bluetooth-capture-v1','Pilotfly Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Pilotfly?.bluetooth==='transport_verified_model_scoped','Pilotfly Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Pilotfly?.wifi==='not_verified_for_current_catalog','Pilotfly Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.LUXCEO?.capturePlanId==='luxceo-direct-bluetooth-capture-v1','LUXCEO Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.LUXCEO?.bluetooth==='transport_verified_model_scoped','LUXCEO Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.LUXCEO?.wifi==='not_verified_for_current_catalog','LUXCEO Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.PIXEL?.capturePlanId==='pixel-app-bluetooth-capture-v1','PIXEL Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.YONGNUO?.capturePlanId==='yongnuo-app-bluetooth-capture-v1','YONGNUO Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Phottix?.capturePlanId==='phottix-lighting-control-bluetooth-capture-v1','Phottix Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.VILTROX?.capturePlanId==='viltrox-weeylite-pro-bluetooth-capture-v1','VILTROX Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.VELVET?.capturePlanId==='velvet-evo-wireless-capture-v1','VELVET wireless capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Kinotehnik?.capturePlanId==='kinotehnik-practilite-bluetooth-capture-v1','Kinotehnik Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Hive Lighting']?.capturePlanId==='hive-shot-bluetooth-capture-v1','Hive Lighting Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Dracast?.capturePlanId==='dracast-palette-v2-bluetooth-capture-v1','Dracast Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SWIT?.capturePlanId==='swit-console-bluetooth-capture-v1','SWIT Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Harlowe?.capturePlanId==='harlowe-app-bluetooth-capture-v1','Harlowe Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Fiilex?.capturePlanId==='fiilex-matrix-wifi-capture-v1','Fiilex Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SIRUI?.capturePlanId==='sirui-light-bluetooth-capture-v1','SIRUI Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.COLBOR?.capturePlanId==='colbor-studio-bluetooth-capture-v1','COLBOR Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.PROLYCHT?.capturePlanId==='prolycht-chromalink-bluetooth-capture-v1','PROLYCHT Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.PROLYCHT?.secondaryCapturePlanIds?.includes('prolycht-chromalink-wifi-capture-v1'),'PROLYCHT Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ZHIYUN?.capturePlanId==='zhiyun-zy-vega-bluetooth-capture-v1','ZHIYUN Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['DMG Lumiere']?.capturePlanId==='dmg-mix-bluetooth-capture-v1','DMG Lumiere Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['DMG Lumiere']?.secondaryCapturePlanIds?.includes('dmg-mix-wifi-capture-v1'),'DMG Lumiere Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Litepanels.capturePlanId==='litepanels-astra-ip-direct-bluetooth-capture-v1','Litepanels Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Litepanels.secondaryCapturePlanIds?.includes('litepanels-astra-ip-direct-wifi-capture-v1'),'Litepanels Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Litepanels.secondaryCapturePlanIds?.includes('litepanels-assisted-bluetooth-capture-v1'),'Litepanels assisted Bluetooth capture plan link missing');
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
