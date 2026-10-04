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
    evidence: [
      'https://nanliteus.com/pages/free-nanlink-app',
      'https://www.nanlink.com/en/h-col-242.html'
    ],
    note: 'NANLINK Bluetooth and adapter-assisted legacy wireless paths remain distinct.'
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
    capturePlanId: 'astera-official-app-btsnoop-capture-v1',
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
