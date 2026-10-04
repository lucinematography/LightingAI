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
  SWIT: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'swit-console-bluetooth-capture-v1',
    evidence: [
      'https://swit.cc/index.php?c=article&id=2501',
      'https://swit.cc/index.php?c=article&id=2502',
      'https://swit.cc/index.php?c=article&id=2613',
      'https://www.swit.cc/index.php?c=article&id=3114',
      'https://www.swit.cc/index.php?c=article&id=3115',
      'https://swit.cc/index.php?c=article&id=2670',
      'https://www.swit.cc/index.php?c=article&id=4440'
    ],
    note: 'Bluetooth/SWIT Console control is verified only for the explicitly cataloged SWIT models. LightingAI proprietary command semantics remain locked.'
  },

  Harlowe: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'harlowe-app-bluetooth-capture-v1',
    evidence: [
      'https://www.harlowe.com/pages/harlowe-app',
      'https://www.harlowe.com/products/micro-portable-led-lighting-kit',
      'https://www.harlowe.com/products/micro-8w-spectra-rgbcw-portable-continuous-led-light-kit',
      'https://www.harlowe.com/products/mini-ii-20w-bi-color-studio-light-kit',
      'https://www.harlowe.com/products/mini-x-portable-led-lighting-kit',
      'https://www.harlowe.com/products/max-80w-videography-photography-light-kit',
      'https://www.harlowe.com/products/max-x-80w-videography-photography-light-kit',
      'https://www.harlowe.com/products/avant-content-creator-lighting-kit',
      'https://www.harlowe.com/products/pro-300w-studio-light-kit-photo-video',
      'https://www.harlowe.com/products/pro-300w-spectra-rgbcw-studio-light-kit',
      'https://www.harlowe.com/products/blade-5-bi-color-rgb-tube-light',
      'https://www.harlowe.com/products/blade-5-10-bi-color-rgb-tube-light-kit'
    ],
    note: 'Harlowe, formerly HOBOLITE, Bluetooth app control is verified only for the explicitly cataloged models. LightingAI proprietary command semantics remain locked.'
  },

  Fiilex: {
    bluetooth: 'not_verified_for_current_catalog',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'fiilex-matrix-wifi-capture-v1',
    evidence: [
      'https://fiilex.com/downloads/Legacy/Matrix_User_Manual_2016_0720.pdf',
      'https://fiilex.com/downloads/Legacy/Matrix_DataSheet_20160817.pdf'
    ],
    note: 'Original Fiilex Matrix Wi-Fi/app control is model-scoped. Bluetooth is not inferred, and LightingAI command/session semantics remain locked.'
  },

  SIRUI: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'sirui-light-bluetooth-capture-v1',
    evidence: [
      'https://store.sirui.com/products/ultra-slim-led-video-panel-light-e30',
      'https://s2.sirui.com/upload/manual/2022/0620/5zPcrkXX4y.pdf',
      'https://s2.sirui.com/upload/manual/2022/0620/5SY5ERzGYn.pdf',
      'https://store.sirui.com/products/t120-tube-light',
      'https://s2.sirui.com/upload/manual/2024/0325/rS8iij8WSZ.pdf',
      'https://store.sirui.com/products/sirui-100w-series-led-monolight',
      'https://store.sirui.com/products/sirui-c300x-ii',
      'https://store.sirui.com/products/sirui-dragon-series-curvy-rgb-panel-light-b25r',
      'https://store.sirui.com/products/sirui-c150x-150w-handheld-pocket-light',
      'https://store.sirui.com/products/sirui-c60x',
      'https://store.sirui.com/products/sirui-t60x-telescopic-60w-rgb-pixel-tube-light-ll'
    ],
    note: 'Bluetooth/SIRUI Light control is verified only for the explicitly cataloged SIRUI models. LightingAI proprietary command semantics remain locked.'
  },

  COLBOR: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'colbor-studio-bluetooth-capture-v1',
    evidence: [
      'https://www.colborlight.com/products/co-cl60',
      'https://www.colborlight.com/products/co-cl100x',
      'https://www.colborlight.com/blogs/articles/get-studio-lights-for-youtube',
      'https://www.colborlight.com/blogs/articles/buyer-guide-to-light-for-streaming',
      'https://www.colborlight.com/pages/colbor-apps-download'
    ],
    note: 'Bluetooth/COLBOR Studio control is verified only for CL60 and CL100X in this checkpoint. LightingAI proprietary command semantics remain locked.'
  },

  PROLYCHT: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'prolycht-chromalink-bluetooth-capture-v1',
    secondaryCapturePlanIds: ['prolycht-chromalink-wifi-capture-v1'],
    evidence: [
      'https://www.prolycht.com/orion300fs/index.aspx',
      'https://prolycht.com/orion675fs/index.aspx',
      'https://prolycht.com/uploadfiles/2021/11/20211125172104110.pdf',
      'https://prolycht.com/uploadfiles/2022/10/20221014151213506.pdf'
    ],
    note: 'Orion 300 FS and Orion 675 FS have model-scoped Bluetooth and Wi-Fi/ChromaLink transport evidence. LightingAI proprietary command semantics remain locked.'
  },

  ZHIYUN: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'zhiyun-zy-vega-bluetooth-capture-v1',
    evidence: [
      'https://www.zhiyun-tech.com/en/product/param/757',
      'https://www.zhiyun-tech.com/en/product/param/816',
      'https://www.zhiyun-tech.com/en/product/param/934',
      'https://www.zhiyun-tech.com/en/product/param/924',
      'https://www.zhiyun-tech.com/en/product/param/901',
      'https://store.zhiyun-tech.com/products/molus-x100',
      'https://www.zhiyun-tech.com/en/product/param/1077',
      'https://www.zhiyun-tech.com/en/product/param/1099',
      'https://www.zhiyun-tech.com/en/product/param/1132',
      'https://www.zhiyun-tech.com/en/product/param/1055'
    ],
    note: 'Bluetooth/ZY Vega control is verified only for the explicitly cataloged ZHIYUN models. LightingAI proprietary command semantics remain locked.'
  },

  'DMG Lumiere': {
    bluetooth: 'transport_verified_mixed_integrated_and_assisted',
    wifi: 'transport_verified_mixed_integrated_and_assisted',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'dmg-mix-bluetooth-capture-v1',
    secondaryCapturePlanIds: ['dmg-mix-wifi-capture-v1'],
    evidence: [
      'https://emea.rosco.com/en/mymix-app',
      'https://us.rosco.com/sites/default/files/content/resource/2022-12/Rosco_DMG_USERMANUAL-MIX-CONTROL-2-1.pdf',
      'https://us.rosco.com/en/product/dmg-mini',
      'https://emea.rosco.com/en/product/dmg-sl1',
      'https://us.rosco.com/en/product/dmg-maxi'
    ],
    note: 'DMG MINI/SL1 use the add-on MIX Controller; MAXI has the MIX Controller built in. Bluetooth/myMIX and Wi-Fi/Art-Net transports are documented, while LightingAI proprietary command semantics remain locked.'
  },

  Litepanels: {
    bluetooth: 'transport_verified_mixed_direct_and_assisted',
    wifi: 'transport_verified_astra_ip_only',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'litepanels-astra-ip-direct-bluetooth-capture-v1',
    secondaryCapturePlanIds: ['litepanels-astra-ip-direct-wifi-capture-v1','litepanels-assisted-bluetooth-capture-v1'],
    evidence: [
      'https://help.litepanels.com/en/basic-operation.html',
      'https://help.litepanels.com/en/gemini-and-bluetooth.html',
      'https://www.litepanels.com/en/product/astra-bluetooth-communications-module/',
      'https://www.litepanels.com/en/products/astra/'
    ],
    note: 'Astra IP Bluetooth/Wi-Fi are native. Legacy Astra and Gemini Bluetooth routes require external modules/dongles. LightingAI command semantics remain locked.'
  },
  GVM: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'transport_verified_rgb10s_only',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'gvm-led-app-direct-bluetooth-capture-v1',
    secondaryCapturePlanIds: ['gvm-rgb10s-direct-wifi-capture-v1'],
    evidence: [
      'https://shop.gvmled.com/products/gvm-rgb20w-on-camera-rgb-led-video-light-with-bluetooth-app-control',
      'https://gvmled.com/gvm-fa200c-aio/',
      'https://gvmled.com/gvm-sd200r/',
      'https://gvmled.com/gvm-800d-iii-dl/',
      'https://gvmled.com/gvm-pro-yu150r/',
      'https://gvmled.com/gvm-bd25r/',
      'https://gvmled.com/wp-content/uploads/2026/03/%E6%A3%92%E7%81%AFGVM-BD100-BD60-%E8%AF%B4%E6%98%8E%E4%B9%A6%E3%80%90%E8%8B%B1%E6%96%87%E3%80%91V1.pdf',
      'https://gvmled.com/rgb-10s-exp/'
    ],
    note: 'Bluetooth/Bluetooth Mesh is verified only for the ten explicitly listed Bluetooth models. Wi-Fi is verified only for RGB-10S in this checkpoint. Bluetooth Mesh and legacy Wi-Fi paths remain distinct.'
  },
  NEEWER: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'neewer-app-direct-bluetooth-capture-v1',
    evidence: [
      'https://neewer.com/pages/faq',
      'https://eu.neewer.com/collections/all-products/products/neewer-nt-bt-bluetooth-usb-transmitter-for-pc-mac-66605690',
      'https://neewer.com/products/neewer-cri-97-50w-660-prorgb-led-light-66600136',
      'https://neewer.com/collections/all-led-lights/products/neewer-rgb1200-app-control-rgb-light-66601606',
      'https://neewer.com/products/neewer-cb60b-bi-color-70w-led-video-light-66602613',
      'https://neewer.com/products/neewer-led-video-light-66601007'
    ],
    note: 'Bluetooth is verified only for RGB660 PRO II, RGB1200, CB60B and CB60 RGB in this checkpoint. Built-in 2.4G/Infinity grouping is kept distinct from the Bluetooth app transport.'
  },
  amaran: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'transport_verified_sm5c_only',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'amaran-sidus-direct-bluetooth-capture-v1',
    secondaryCapturePlanIds: ['amaran-sm5c-direct-wifi-capture-v1'],
    evidence: [
      'https://help.amarancreators.com/en/amaran-60ds-60xs/sidus-link-control',
      'https://help.amarancreators.com/en/amaran-100ds-200ds/control-options-faq',
      'https://help.amarancreators.com/en/amaran-150c-300c/sidus-link-control',
      'https://help.amarancreators.com/en/amaran-flexible-lights/light-configuration-settings',
      'https://help.amarancreators.com/en/amaran-tube/menu-options',
      'https://help.amarancreators.com/en/amaran-pixel-tubes/light-configuration-settings',
      'https://help.amarancreators.com/en/sm5c-pixel-tape/control-options'
    ],
    note: 'Bluetooth is verified only for the 20 explicitly listed model records. Wi-Fi is verified only for SM5c via its documented Tuya Smart path. LightingAI command semantics remain locked.'
  },
  SmallRig: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'smallrig-smallgogo-direct-ble-capture-v1',
    evidence: [
      'https://static.smallrig.com/mall/img/public/ikoxo2sh29-1740738075427_.pdf',
      'https://static.smallrig.com/mall/img/public/5wglduq1wx7-1748506964081_.pdf',
      'https://static.smallrig.com/mall/img/public/1732525071182_.pdf'
    ],
    note: 'BLE is verified only for RC 100B, RC 220C, RC 350B and RC 450B. RC 120B and other SmallGoGo models remain outside this scope until exact-model Bluetooth/BLE evidence is captured.'
  },
  Kelvin: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'public_reference_implementation_model_scoped',
    nextStep: 'validate-public-reference-and-physical-replay-before-driver',
    capturePlanId: 'kelvin-narrator-direct-bluetooth-capture-v1',
    publicReferenceImplementation: {
      sourceUrl: 'https://github.com/KelvinLights/k-lights-interface-py',
      transport: 'bluetooth',
      verifiedFixtureIds: ['kelvin-play','kelvin-play-pro','kelvin-epos-300','kelvin-epos-600'],
      excludedFixtureIds: ['kelvin-play-air','kelvin-play-hero'],
      note: 'KelvinLights publishes an official Python BLE interface with support table entries for Play/Play Pro, Epos 300 and Epos 600. Play Air/Hero remain transport-verified but outside that published reference scope.'
    },
    evidence: [
      'https://www.kelvinlight.com/product/play-air/',
      'https://www.kelvinlight.com/product/play_hero_rgbacl_led_panel_pocket_light_with_wireless_dmx/',
      'https://www.kelvinlight.com/product/epos_300_rgbacl_led_studio_light_travel_kit_for/',
      'https://www.kelvinlight.com/product/epos_600_rgbacl_led_studio_light_travel_kit_for/',
      'https://github.com/KelvinLights/k-lights-interface-py'
    ],
    note: 'All six catalog models have model-specific Bluetooth/Narrator evidence. A vendor public BLE reference implementation exists only for Play/Play Pro/Epos 300/Epos 600 and does not by itself satisfy LightingAI production replay requirements.'
  },
  'Quasar Science': {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'quasar-starctrl-direct-bluetooth-capture-v1',
    secondaryCapturePlanIds: ['quasar-rainbow-model-scoped-wifi-capture-v1'],
    evidence: [
      'https://www.quasarscience.com/pages/starctrl',
      'https://www.quasarscience.com/products/rainbow-2',
      'https://www.quasarscience.com/collections/new/products/double-rainbow'
    ],
    note: 'Rainbow 2 and Double Rainbow Bluetooth/starCTRL plus built-in Wi-Fi are model-scoped transport evidence only; LightingAI command semantics remain locked.'
  },
  Luxli: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'luxli-composer-direct-bluetooth-capture-v1',
    evidence: [
      'https://www.luxlilight.com/composer',
      'https://www.luxlilight.com/product/10017/Luxli-ORC_VIOLA_5-Viola-5%22-On_Camera-RGB-LED-Light',
      'https://www.luxlilight.com/product/15842/Luxli-ORC_CELLO_M2-Cello%26sup2%3B-10%22-RGBAW-LED-Light',
      'https://www.luxlilight.com/timpani'
    ],
    note: 'Luxli Composer Bluetooth is verified only for the explicitly listed model set; Taiko remains outside this transport-verified scope until model-specific first-party Bluetooth evidence is captured.'
  },
  Rotolight: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'rotolight-app-direct-bluetooth-capture-v1',
    secondaryCapturePlanIds: ['rotolight-app-direct-wifi-capture-v1'],
    evidence: [
      'https://rotolight.com/pages/neo-3-support',
      'https://rotolight.com/pages/ap3-support',
      'https://rotolight.com/pages/titan-support'
    ],
    note: 'Rotolight app Bluetooth is model-scoped; NEO 3/AEOS 2/Anova PRO 3 also have model-scoped Wi-Fi, while Titan X1/X2 remain Bluetooth-only in this catalog evidence set.'
  },
  Creamsource: {
    bluetooth: 'transport_verified_model_family_scoped',
    wifi: 'not_direct_fixture_route_in_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'creamsource-vortex-crmx-ble-capture-v1',
    evidence: [
      'https://knowledge.creamsource.com/best-of-class-connectivity',
      'https://knowledge.creamsource.com/how-to-control-vortex-with-bluetooth-using-luminair-app'
    ],
    note: 'Vortex CRMX BLE/direct Bluetooth transport is documented. LightingAI command semantics remain locked.'
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
