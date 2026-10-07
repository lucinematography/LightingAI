import { VENDOR_WIRELESS_PROTOCOL_STATUS, vendorWideCommandProductionReady, commandProductionReadyForStatus } from './vendor-wireless-protocol-status.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
const route=(fixtureId,transport)=>({fixtureId,transport});

const expected=['Aputure','Godox','Nanlite','ARRI','Astera','Aladdin','EV Light','Creamsource','Rotolight','Luxli','Quasar Science','Kelvin','SmallRig','amaran','NEEWER','GVM','Litepanels','DMG Lumiere','ZHIYUN','PROLYCHT','COLBOR','SIRUI','Fiilex','Harlowe','SWIT','Dracast','Hive Lighting','Kinotehnik','VELVET','VILTROX','Phottix','YONGNUO','PIXEL','Falcon Eyes','Lishuai','NiceFoto','Ulanzi','CAME-TV','SOONWELL','Tolifo','Moman','Ikan','Jinbei','Lume Cube','CHAUVET DJ','Fotodiox','broncolor','Genaray','Elgato','Westcott','Logitech G','Rollei','Razer','NANLUX','Mettle','PiXAPRO','Ape Labs','Pilotfly','LUXCEO','Yidoblo','FEELWORLD','SUTEFOTO','YC Onion','K&F Concept','Profoto','SHEHDS','Weeylite','IMRELAX','Kenro','Selens','Fomex','BB&S Lighting','SUMOLIGHT','PROLIGHTS','Lightstar Lights','Mole-Richardson','ZOLAR','Filmgear','Rosco','dedolight','ADJ Lighting','Elinchrom','CineLight','ROXX','iFootage','Cineroid','Sokani','FotorGear','BRESSER','Digitek','Manfrotto','Cineo','Blizzard Lighting','ColorKey','Photoolex','RAYZR','CINEPEER','VISICO','Govee','Newell','Philips Hue','Kino Flo','De Sisti','LiteGear'];
for(const maker of expected) expect(!!VENDOR_WIRELESS_PROTOCOL_STATUS[maker],maker+' protocol status missing');

for(const maker of ['Aputure','Godox','Nanlite','ARRI','Astera','Aladdin','EV Light','Creamsource','Rotolight','Luxli','Quasar Science','Kelvin','SmallRig','amaran','NEEWER','GVM','Litepanels','DMG Lumiere','ZHIYUN','PROLYCHT','COLBOR','SIRUI','Fiilex','Harlowe','SWIT','Dracast','Hive Lighting','Kinotehnik','VELVET','VILTROX','Phottix','YONGNUO','PIXEL','Falcon Eyes','Lishuai','NiceFoto','Ulanzi','CAME-TV','SOONWELL','Tolifo','Moman','Ikan','Jinbei','Lume Cube','CHAUVET DJ','Fotodiox','broncolor','Genaray','Elgato','Westcott','Logitech G','Rollei','Razer','NANLUX','Mettle','PiXAPRO','Ape Labs','Pilotfly','LUXCEO','Yidoblo','FEELWORLD','SUTEFOTO','YC Onion','K&F Concept','Profoto','SHEHDS','Weeylite','IMRELAX','Kenro','Selens','Fomex','BB&S Lighting','SUMOLIGHT','PROLIGHTS','Lightstar Lights','Mole-Richardson','ZOLAR','Filmgear','Rosco','dedolight','ADJ Lighting','Elinchrom','CineLight','ROXX','iFootage','Cineroid','Sokani','FotorGear','BRESSER','Digitek','Manfrotto','Cineo','Blizzard Lighting','ColorKey','Photoolex','RAYZR','CINEPEER','VISICO','Govee','Newell','Philips Hue']){
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
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ARRI.secondaryCapturePlanIds?.includes('arri-omnibar-bluetooth-mesh-capture-v1'),'ARRI Omnibar Bluetooth Mesh capture plan link missing');
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
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.NEEWER.secondaryCapturePlanIds?.includes('neewer-gl25c-direct-wifi-capture-v1'),'NEEWER GL25C Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.NEEWER.wifi==='transport_verified_gl25c_only','NEEWER GL25C Wi-Fi transport scope changed');
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
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Yidoblo?.capturePlanId==='yidoblo-bluetooth-capture-v1','Yidoblo Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Yidoblo?.bluetooth==='transport_verified_model_scoped','Yidoblo Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Yidoblo?.wifi==='not_verified_for_current_catalog','Yidoblo Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.FEELWORLD?.capturePlanId==='feelworld-light-bluetooth-capture-v1','FEELWORLD Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.FEELWORLD?.bluetooth==='transport_verified_model_scoped','FEELWORLD Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.FEELWORLD?.wifi==='not_verified_for_current_catalog','FEELWORLD Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SUTEFOTO?.capturePlanId==='sutefoto-bluetooth-capture-v1','SUTEFOTO Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SUTEFOTO?.bluetooth==='transport_verified_model_scoped','SUTEFOTO Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SUTEFOTO?.wifi==='not_verified_for_current_catalog','SUTEFOTO Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['YC Onion']?.capturePlanId==='yc-onion-pudding-v2-bluetooth-capture-v1','YC Onion Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['YC Onion']?.bluetooth==='transport_verified_model_scoped','YC Onion Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['YC Onion']?.wifi==='not_verified_for_current_catalog','YC Onion Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['K&F Concept']?.capturePlanId==='kf-concept-pl60b-bluetooth-capture-v1','K&F Concept Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['K&F Concept']?.bluetooth==='transport_verified_model_scoped','K&F Concept Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['K&F Concept']?.wifi==='not_verified_for_current_catalog','K&F Concept Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Profoto?.capturePlanId==='profoto-b10-series-bluetooth-capture-v1','Profoto Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Profoto?.bluetooth==='transport_verified_model_scoped','Profoto Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Profoto?.wifi==='not_verified_for_current_catalog','Profoto Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SHEHDS?.capturePlanId==='shehds-cob-zoom-par-wifi-capture-v1','SHEHDS Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SHEHDS?.wifi==='transport_verified_model_scoped','SHEHDS Wi-Fi transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SHEHDS?.bluetooth==='not_verified_for_current_catalog','SHEHDS Bluetooth must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Weeylite?.capturePlanId==='weeylite-bluetooth-capture-v1','Weeylite Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Weeylite?.bluetooth==='transport_verified_model_scoped','Weeylite Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Weeylite?.wifi==='not_verified_for_current_catalog','Weeylite Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.IMRELAX?.capturePlanId==='imrelax-im-btwp1218-wifi-capture-v1','IMRELAX Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.IMRELAX?.wifi==='transport_verified_model_scoped','IMRELAX Wi-Fi transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.IMRELAX?.bluetooth==='not_verified_for_current_catalog','IMRELAX Bluetooth must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Kenro?.capturePlanId==='kenro-lightsystem-bluetooth-capture-v1','Kenro Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Kenro?.bluetooth==='transport_verified_model_scoped','Kenro Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Kenro?.wifi==='not_verified_for_current_catalog','Kenro Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Selens?.capturePlanId==='selens-link-bluetooth-capture-v1','Selens Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Selens?.bluetooth==='transport_verified_model_scoped','Selens Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Selens?.wifi==='not_verified_for_current_catalog','Selens Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Fomex?.capturePlanId==='fomex-flexcolor-timo-two-bluetooth-capture-v1','Fomex Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Fomex?.bluetooth==='transport_verified_model_scoped','Fomex Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Fomex?.wifi==='not_verified_for_current_catalog','Fomex Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['BB&S Lighting']?.capturePlanId==='bbs-track-casambi-bluetooth-capture-v1','BB&S Lighting Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['BB&S Lighting']?.bluetooth==='transport_verified_model_scoped','BB&S Lighting Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['BB&S Lighting']?.wifi==='not_verified_for_current_catalog','BB&S Lighting Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SUMOLIGHT?.capturePlanId==='sumolight-sumospace-plus-wifi-capture-v1','SUMOLIGHT Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SUMOLIGHT?.wifi==='transport_verified_model_scoped','SUMOLIGHT Wi-Fi transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.SUMOLIGHT?.bluetooth==='not_verified_for_current_catalog','SUMOLIGHT Bluetooth must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.PROLIGHTS?.capturePlanId==='prolights-smartcolors-wifi-capture-v1','PROLIGHTS Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.PROLIGHTS?.wifi==='transport_verified_model_scoped','PROLIGHTS Wi-Fi transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.PROLIGHTS?.bluetooth==='not_verified_for_current_catalog','PROLIGHTS Bluetooth must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Lightstar Lights']?.capturePlanId==='lightstar-luxed-bluetooth-capture-v1','Lightstar Lights Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Lightstar Lights']?.bluetooth==='transport_verified_model_scoped','Lightstar Lights Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Lightstar Lights']?.wifi==='not_verified_for_current_catalog','Lightstar Lights Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Mole-Richardson']?.capturePlanId==='mole-richardson-bluetooth-capture-v1','Mole-Richardson Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Mole-Richardson']?.bluetooth==='transport_verified_model_scoped','Mole-Richardson Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Mole-Richardson']?.wifi==='not_verified_for_current_catalog','Mole-Richardson Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ZOLAR?.capturePlanId==='zolar-bluetooth-capture-v1','ZOLAR Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ZOLAR?.secondaryCapturePlanIds?.includes('zolar-wifi-capture-v1'),'ZOLAR Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ZOLAR?.bluetooth==='transport_verified_model_scoped','ZOLAR Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ZOLAR?.wifi==='transport_verified_model_scoped','ZOLAR Wi-Fi transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Filmgear?.capturePlanId==='filmgear-fg-app-bluetooth-capture-v1','Filmgear Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Filmgear?.bluetooth==='transport_verified_model_scoped','Filmgear Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Filmgear?.wifi==='not_verified_for_current_catalog','Filmgear Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Rosco?.capturePlanId==='rosco-mymix-connect-assisted-bluetooth-capture-v1','Rosco assisted Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Rosco?.bluetooth==='transport_verified_assisted_model_scoped','Rosco Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Rosco?.wifi==='not_verified_for_current_catalog','Rosco Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.dedolight?.capturePlanId==='dedolight-neo-assisted-bluetooth-capture-v1','dedolight assisted Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.dedolight?.bluetooth==='transport_verified_assisted_model_scoped','dedolight Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.dedolight?.wifi==='not_verified_for_current_catalog','dedolight Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['ADJ Lighting']?.capturePlanId==='adj-aria-x2-bluetooth-capture-v1','ADJ Lighting Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['ADJ Lighting']?.bluetooth==='transport_verified_model_scoped','ADJ Lighting Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['ADJ Lighting']?.wifi==='not_verified_for_current_catalog','ADJ Lighting Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Elinchrom?.capturePlanId==='elinchrom-studio-bluetooth-capture-v1','Elinchrom Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Elinchrom?.bluetooth==='transport_verified_model_scoped','Elinchrom Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Elinchrom?.wifi==='not_verified_for_current_catalog','Elinchrom Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.CineLight?.capturePlanId==='cinelight-bluetooth-capture-v1','CineLight Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.CineLight?.bluetooth==='transport_verified_mixed_direct_assisted_model_scoped','CineLight Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.CineLight?.wifi==='not_verified_for_current_catalog','CineLight Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ROXX?.capturePlanId==='roxx-app-bluetooth-capture-v1','ROXX Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ROXX?.bluetooth==='transport_verified_model_scoped','ROXX Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ROXX?.wifi==='not_verified_for_current_catalog','ROXX Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.iFootage?.capturePlanId==='ifootage-anglerfish-lumin-bluetooth-capture-v1','iFootage Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.iFootage?.bluetooth==='transport_verified_model_scoped','iFootage Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.iFootage?.wifi==='not_verified_for_current_catalog','iFootage Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Cineroid?.capturePlanId==='cineroid-app-bluetooth-capture-v1','Cineroid Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Cineroid?.bluetooth==='transport_verified_model_scoped','Cineroid Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Cineroid?.wifi==='not_verified_for_current_catalog','Cineroid Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Sokani?.capturePlanId==='sokani-ss-led-bluetooth-capture-v1','Sokani Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Sokani?.bluetooth==='transport_verified_model_scoped','Sokani Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Sokani?.wifi==='not_verified_for_current_catalog','Sokani Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.FotorGear?.capturePlanId==='fotorgear-cob-flash-ios-bluetooth-capture-v1','FotorGear Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.FotorGear?.bluetooth==='transport_verified_model_scoped','FotorGear Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.FotorGear?.wifi==='not_verified_for_current_catalog','FotorGear Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.BRESSER?.capturePlanId==='bresser-bluetooth-app-capture-v1','BRESSER Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.BRESSER?.bluetooth==='transport_verified_model_scoped','BRESSER Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.BRESSER?.wifi==='not_verified_for_current_catalog','BRESSER Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Digitek?.capturePlanId==='digitek-smartlife-bluetooth-capture-v1','Digitek Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Digitek?.bluetooth==='transport_verified_model_scoped','Digitek Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Digitek?.wifi==='not_verified_for_current_catalog','Digitek Wi-Fi must remain unverified for current catalog');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Manfrotto?.capturePlanId==='manfrotto-lykos-lumimuse-bluetooth-capture-v1','Manfrotto Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Manfrotto?.bluetooth==='transport_verified_model_scoped','Manfrotto Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Manfrotto?.wifi==='not_verified_for_current_catalog','Manfrotto Wi-Fi must remain unverified for current catalog');
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
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Philips Hue']?.capturePlanId==='philips-hue-go-bluetooth-capture-v1','Philips Hue Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Philips Hue']?.bluetooth==='transport_verified_model_scoped','Philips Hue Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Philips Hue']?.wifi==='not_verified_for_current_catalog','Philips Hue Wi-Fi must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Newell?.capturePlanId==='newell-direct-bluetooth-capture-v1','Newell Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Newell?.bluetooth==='transport_verified_model_scoped','Newell Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Newell?.wifi==='not_verified_for_current_catalog','Newell Wi-Fi must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Govee?.capturePlanId==='govee-direct-wireless-capture-v1','Govee Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Govee?.secondaryCapturePlanIds?.includes('govee-direct-wifi-capture-v1'),'Govee Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Govee?.bluetooth==='transport_verified_model_scoped','Govee Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Govee?.wifi==='transport_verified_model_scoped','Govee Wi-Fi transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.VISICO?.capturePlanId==='visico-light-bluetooth-capture-v1','VISICO Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.VISICO?.bluetooth==='transport_verified_model_scoped','VISICO Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.VISICO?.wifi==='not_verified_for_current_catalog','VISICO Wi-Fi must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.CINEPEER?.capturePlanId==='cinepeer-c100-bluetooth-mesh-capture-v1','CINEPEER Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.CINEPEER?.bluetooth==='transport_verified_model_scoped','CINEPEER Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.CINEPEER?.wifi==='not_verified_for_current_catalog','CINEPEER Wi-Fi must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.RAYZR?.capturePlanId==='rayzr-mc-wifi-capture-v1','RAYZR Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.RAYZR?.bluetooth==='not_verified_for_current_catalog','RAYZR Bluetooth must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.RAYZR?.wifi==='transport_verified_model_scoped','RAYZR Wi-Fi transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Photoolex?.capturePlanId==='photoolex-direct-bluetooth-capture-v1','Photoolex Bluetooth capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Photoolex?.bluetooth==='transport_verified_model_scoped','Photoolex Bluetooth transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Photoolex?.wifi==='not_verified_for_current_catalog','Photoolex Wi-Fi must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ColorKey?.capturePlanId==='colorkey-mobilepar-wifi-capture-v1','ColorKey Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ColorKey?.bluetooth==='not_verified_for_current_catalog','ColorKey Bluetooth must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.ColorKey?.wifi==='transport_verified_model_scoped','ColorKey Wi-Fi transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Blizzard Lighting']?.capturePlanId==='blizzard-hemisphere-wifi-capture-v1','Blizzard Lighting Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Blizzard Lighting']?.bluetooth==='not_verified_for_current_catalog','Blizzard Lighting Bluetooth must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Blizzard Lighting']?.wifi==='transport_verified_model_scoped','Blizzard Lighting Wi-Fi transport scope changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Cineo?.capturePlanId==='cineo-stagelynx-r10-wifi-capture-v1','Cineo Wi-Fi capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Cineo?.bluetooth==='not_verified_for_current_catalog','Cineo Bluetooth must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Cineo?.wifi==='transport_verified_model_scoped','Cineo Wi-Fi transport scope changed');
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
