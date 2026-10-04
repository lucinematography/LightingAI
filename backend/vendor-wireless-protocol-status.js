export const VENDOR_WIRELESS_PROTOCOL_STATUS = Object.freeze({
  Aputure: {
    bluetooth: 'transport_verified',
    wifi: 'not_direct_fixture_route_in_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'sidus-direct-bluetooth-capture-v1',
    evidence: [
      'https://aputure.com/en-US/pages/sidus-link',
      'https://help.aputure.com/en/general-help/sidus-link-control'
    ],
    note: 'Sidus Bluetooth Mesh is documented. LightingAI command semantics remain locked.'
  },
  Godox: {
    bluetooth: 'transport_verified',
    wifi: 'not_verified_for_current_direct-fixture-control-set',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'godox-light-bluetooth-capture-v1',
    evidence: [
      'https://www.godox.com/app/',
      'https://www.godox.com/product-e/Godox-Light-App.html'
    ],
    note: 'Godox Light Bluetooth control is documented for compatible LED fixtures.'
  },
  Nanlite: {
    bluetooth: 'transport_verified',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'nanlink-direct-bluetooth-capture-v1',
    secondaryCapturePlanIds: ['nanlink-ws-tb1-assisted-bluetooth-capture-v1','nanlink-model-scoped-wifi-capture-v1'],
    evidence: [
      'https://nanliteus.com/pages/free-nanlink-app',
      'https://www.nanlink.com/en/h-col-242.html'
    ],
    note: 'NANLINK direct Bluetooth, WS-TB-1 assisted Bluetooth-to-2.4G, and model-scoped Wi-Fi paths remain distinct.'
  },
  ARRI: {
    bluetooth: 'transport_verified',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'third_party_path_documented_but_exact_command_spec_not_captured',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'arri-lico-direct-bluetooth-capture-v1',
    secondaryCapturePlanIds: ['arri-skypanel-web-wifi-capture-v1'],
    evidence: [
      'https://www.arri.com/en/learn-help/lighting/tools-apps/lico',
      'https://www.arri.com/en/lighting/led-panel-lights/skypanel-pro/faq'
    ],
    note: 'LiCo Bluetooth 5.0 is documented; Orbiter requires a supported USB dongle.'
  },
  Astera: {
    bluetooth: 'transport_verified_model_or_variant_scoped',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'physical-evidence-required',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'astera-physical-capture-set-v1',
    secondaryCapturePlanIds: ['astera-model-scoped-wifi-capture-v1'],
    evidence: [
      'catalog-first-party-product-and-manual-sources',
      'verified-control-capture-toolchain'
    ],
    note: 'Transport capability does not unlock proprietary Astera commands.'
  },
  Aladdin: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'aladdin-app-ble-capture-v1',
    evidence: [
      'https://aladdin-lights.com/mosaic-2x4/',
      'https://aladdin-lights.com/wp-content/uploads/2023/09/MOSAIC-4x4-Manual-SINGLE-PAGE.pdf'
    ],
    note: 'Bluetooth/BLE app control is documented for supported Aladdin fixtures.'
  },
  'EV Light': {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'evlight-direct-bluetooth-capture-v1',
    secondaryCapturePlanIds: ['evlight-model-scoped-wifi-capture-v1'],
    evidence: [
      'https://www.evlightprofessional.com/quality-led-soft-light-panel-63424122.html',
      'https://www.evlightpro.com/led-soft-light-panel/68692360.html'
    ],
    note: 'App/Bluetooth/WiFi-DMX capability is model-scoped; Wireless DMX is not inferred as Bluetooth.'
  },
  'Kino Flo': {
    bluetooth: 'not_verified_for_current_catalog',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_applicable_until-direct-transport-evidence',
    nextStep: 'keep-crmx-lumenradio-separated',
    evidence: ['https://kinoflo.com/true-match/'],
    note: 'Current public evidence is DMX/RDM/LumenRadio wireless DMX, not direct Bluetooth/Wi-Fi.'
  },
  'De Sisti': {
    bluetooth: 'not_verified_for_current_catalog',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_applicable_until-direct-transport-evidence',
    nextStep: 'keep-wireless-dmx-separated',
    evidence: [],
    note: 'Current catalog wireless entries are not treated as Bluetooth/Wi-Fi.'
  },
  LiteGear: {
    bluetooth: 'not_verified_for_current_catalog',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_applicable_until-direct-transport-evidence',
    nextStep: 'keep-litedimmer-control-path-separated',
    evidence: ['https://kinoflo.com/about-litedimmer/'],
    note: 'Current catalog does not expose direct Bluetooth/Wi-Fi fixture control.'
  }
});

export function vendorWirelessProtocolStatus(manufacturer) {
  return VENDOR_WIRELESS_PROTOCOL_STATUS[manufacturer] || null;
}


export function commandProductionReadyForStatus(row,requiredTransports=[],requiredFixtureIds=[],requiredRoutes=[]) {
  if(row?.commandSpec!=='production_verified') return false;
  if(!Array.isArray(requiredTransports)||requiredTransports.length===0) return false;
  if(!Array.isArray(requiredFixtureIds)||requiredFixtureIds.length===0) return false;
  if(!Array.isArray(requiredRoutes)||requiredRoutes.length===0) return false;
  const scope=row?.productionScope;
  if(!(
    scope &&
    scope.kind==='vendor-wide' &&
    scope.allCurrentWirelessFixtures===true &&
    Array.isArray(scope.transports) &&
    scope.transports.length>0 &&
    Array.isArray(scope.fixtureIds) &&
    scope.fixtureIds.length>0
  )) return false;
  const evidence=row?.productionEvidence;
  const linkedCapturePlanIds=[
    row?.capturePlanId,
    ...((Array.isArray(row?.secondaryCapturePlanIds)?row.secondaryCapturePlanIds:[]))
  ].filter(Boolean).map(String);
  if(linkedCapturePlanIds.length===0) return false;
  if(!(
    evidence &&
    evidence.physicalReplayVerified===true &&
    Array.isArray(evidence.derivedEvidenceRefs) &&
    evidence.derivedEvidenceRefs.length>0 &&
    evidence.derivedEvidenceRefs.every(ref=>typeof ref==='string'&&ref.trim().length>0) &&
    Array.isArray(evidence.verifiedTransports) &&
    evidence.verifiedTransports.length>0 &&
    Array.isArray(evidence.verifiedFixtureIds) &&
    evidence.verifiedFixtureIds.length>0 &&
    Array.isArray(evidence.verifiedRoutes) &&
    evidence.verifiedRoutes.length>0 &&
    Array.isArray(evidence.capturePlanIds) &&
    evidence.capturePlanIds.length>0
  )) return false;
  const evidencePlanIds=new Set(evidence.capturePlanIds.map(String));
  if(!linkedCapturePlanIds.every(id=>evidencePlanIds.has(id))) return false;
  const declared=new Set(scope.transports.map(x=>String(x).toLowerCase()));
  if(!requiredTransports.every(t=>declared.has(String(t).toLowerCase()))) return false;
  const evidenceTransports=new Set(evidence.verifiedTransports.map(x=>String(x).toLowerCase()));
  if(!requiredTransports.every(t=>evidenceTransports.has(String(t).toLowerCase()))) return false;
  const declaredFixtureIds=new Set(scope.fixtureIds.map(x=>String(x)));
  if(!requiredFixtureIds.every(id=>declaredFixtureIds.has(String(id)))) return false;
  const evidenceFixtureIds=new Set(evidence.verifiedFixtureIds.map(x=>String(x)));
  if(!requiredFixtureIds.every(id=>evidenceFixtureIds.has(String(id)))) return false;

  const routeKey=route=>{
    const fixtureId=String(route?.fixtureId||'').trim();
    const transport=String(route?.transport||'').trim().toLowerCase();
    return fixtureId&&transport?fixtureId+'::'+transport:'';
  };
  const requiredRouteKeys=new Set(requiredRoutes.map(routeKey).filter(Boolean));
  if(requiredRouteKeys.size!==requiredRoutes.length) return false;
  const evidenceRouteKeys=new Set(evidence.verifiedRoutes.map(routeKey).filter(Boolean));
  return [...requiredRouteKeys].every(key=>evidenceRouteKeys.has(key));
}

export function vendorWideCommandProductionReady(manufacturer,requiredTransports=[],requiredFixtureIds=[],requiredRoutes=[]) {
  return commandProductionReadyForStatus(
    VENDOR_WIRELESS_PROTOCOL_STATUS[manufacturer]||null,
    requiredTransports,
    requiredFixtureIds,
    requiredRoutes
  );
}
