export const VENDOR_WIRELESS_CAPTURE_PLANS = Object.freeze({
  Godox: {
    id:'godox-light-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Godox Light',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one Godox fixture whose catalog entry explicitly lists Bluetooth/Godox Light control.',
      'Use the official Godox Light app; vendor manuals require app version 3.0 or newer on supported fixtures.',
      'Perform the fixture Bluetooth reset before a clean controller session.',
      'Keep other Godox Bluetooth fixtures powered off or out of the test scene where practical.'
    ],
    officialSources:[
      'https://www.godox.com/app/',
      'https://godox.com/Downloads/LITEMONS_LE200D.pdf'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Reset/pair as required, connect in Godox Light, wait 15 seconds, change no lighting parameter, then disconnect.'},
      dim:{runs:3,rule:'Start from the same known intensity, perform exactly one intensity change in Godox Light, wait 5 seconds, change nothing else.'},
      cct:{runs:3,rule:'On a CCT-capable fixture, start from the same known CCT/intensity and perform exactly one CCT change, then wait 5 seconds.'},
      color:{runs:3,optional:true,rule:'Only after DIM/CCT evidence is stable; on a color-capable fixture perform exactly one HSI/RGB parameter change per capture.'},
      fx:{runs:3,optional:true,rule:'Only after simpler controls are understood; activate exactly one known fixture FX preset per capture.'}
    },
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  Nanlite: {
    id:'nanlink-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'NANLINK',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one Nanlite fixture whose catalog entry explicitly lists direct Bluetooth/NANLINK control.',
      'Do not use WS-TB-1, W-2, 2.4G, or adapter-assisted Wi-Fi in this direct-Bluetooth capture set.',
      'Use the official NANLINK app.',
      'Reset fixture Bluetooth for first setup or when moving the fixture from another NANLINK scene, following vendor guidance.',
      'Keep other NANLINK Bluetooth fixtures out of the test scene where practical.'
    ],
    officialSources:[
      'https://www.nanlink.com/en/h-col-293.html',
      'https://nanliteus.com/pages/faq',
      'https://www.nanlink.com/en/h-col-234.html'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Reset Bluetooth when required, add only the test fixture to a fresh NANLINK scene, connect, wait 15 seconds, change no lighting parameter.'},
      dim:{runs:3,rule:'Use the same initial intensity and perform exactly one intensity change in NANLINK per capture.'},
      cct:{runs:3,rule:'On a CCT-capable fixture, use the same initial state and perform exactly one CCT change per capture.'},
      color:{runs:3,optional:true,rule:'Only after DIM/CCT evidence is stable; perform exactly one HSI/RGB change per capture on a supported fixture.'},
      fx:{runs:3,optional:true,rule:'Only after simpler controls are understood; activate exactly one effect per capture.'}
    },
    secondaryPlans:[
      {
        id:'nanlink-ws-tb1-assisted-bluetooth-capture-v1',
        transport:'bluetooth',
        target:'Nanlite fixtures whose catalog metadata requires WS-TB-1 Bluetooth-to-2.4G bridging',
        commandSpecStatus:'public-bridge-command-spec-not-located-in-official-docs',
        rule:'Use the official NANLINK app with one WS-TB-1 and one explicitly compatible 2.4G fixture. Capture three connect-only sessions and three isolated DIM/CCT actions. Treat Bluetooth as the phone-to-box transport and 2.4G as the box-to-fixture link; never infer that the fixture itself is a Bluetooth endpoint or reuse direct-fixture BLE command semantics.',
        officialSources:[
          'https://www.nanlink.com/en/h-col-231.html',
          'https://nanliteus.com/products/nanlink-ws-tb-1-transmitter-box',
          'https://www.nanlink.com/en/h-col-293.html'
        ]
      },
      {
        id:'nanlink-model-scoped-wifi-capture-v1',
        transport:'wifi',
        target:'Nanlite models whose catalog metadata explicitly verifies Wi-Fi control',
        commandSpecStatus:'public-wifi-command-api-not-located-in-official-docs',
        rule:'Use only the vendor-documented NANLINK/Wi-Fi path for the exact model. Preserve any W-2 or other external-interface requirement from catalog metadata. Capture three no-change sessions and three isolated DIM/CCT actions. Do not infer a proprietary IP API from the presence of Wi-Fi alone.'
      }
    ],
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  Creamsource: {
    id:'creamsource-vortex-crmx-ble-capture-v1',
    transport:'bluetooth',
    controllerApp:'Creamsource Slyyd',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one Vortex fixture whose catalog entry explicitly lists CRMX BLE/Bluetooth.',
      'Enable CRMX and CRMX BLE on the fixture.',
      'Use the Creamsource Slyyd app for the primary capture set; do not infer that CRMX DMX frames reveal proprietary fixture configuration semantics.',
      'Keep other nearby Vortex BLE fixtures out of the test session where practical.'
    ],
    officialSources:[
      'https://knowledge.creamsource.com/best-of-class-connectivity',
      'https://knowledge.creamsource.com/how-to-control-vortex-with-bluetooth-using-luminair-app',
      'https://creamsource.com/'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Enable CRMX BLE, discover and connect to one Vortex, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'From the same known intensity perform exactly one intensity change per capture.'},
      cct:{runs:3,rule:'From the same initial state perform exactly one CCT change per capture.'},
      color:{runs:3,rule:'After DIM/CCT evidence is stable, perform exactly one HSI/RGB/xy color change per capture.'},
      fx:{runs:3,optional:true,rule:'Only after simpler controls are understood; trigger one documented effect per capture.'}
    },
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  'DMG Lumiere': {
    id:'dmg-mix-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'myMIX',
    commandSpecStatus:'public-proprietary-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact DMG MIX route at a time and preserve the fixture/controller topology in the derived evidence.',
      'For MAXI, use the built-in MIX Controller route.',
      'For MINI or SL1, use the required add-on MIX Controller / Driver and keep the route classified as assisted.',
      'Keep Bluetooth, Wi-Fi/Art-Net, and CRMX/Wireless-DMX evidence in separate capture sets.'
    ],
    officialSources:[
      'https://emea.rosco.com/en/mymix-app',
      'https://us.rosco.com/sites/default/files/content/resource/2022-12/Rosco_DMG_USERMANUAL-MIX-CONTROL-2-1.pdf',
      'https://us.rosco.com/en/product/dmg-mini',
      'https://emea.rosco.com/en/product/dmg-sl1',
      'https://us.rosco.com/en/product/dmg-maxi'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one exact DMG MIX Bluetooth route, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one color change per capture from the same initial state.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one documented effect per capture only after simpler controls are understood.'}
    },
    secondaryPlans:[{
      id:'dmg-mix-wifi-capture-v1',
      transport:'wifi',
      target:'DMG MINI, SL1 and MAXI MIX Controller routes',
      commandSpecStatus:'artnet-transport-documented-probe-output-disabled',
      rule:'Capture Wi-Fi route evidence separately from Bluetooth. Preserve whether the MIX Controller is built in (MAXI) or add-on (MINI/SL1). Do not re-enable Probe Art-Net output.'
    }],
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Litepanels: {
    id:'litepanels-astra-ip-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'starCTRL / compatible BLE lighting app',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one Astra IP Half/1x1/2x1 fixture for the direct native-Bluetooth capture set.',
      'Keep legacy Astra Communications Module and Gemini dongle routes out of the direct set.',
      'Use one official/supported Bluetooth lighting app and isolate one fixture where practical.',
      'Record native Wi-Fi, legacy Astra module Bluetooth, and Gemini dongle Bluetooth as separate route classes.'
    ],
    officialSources:[
      'https://help.litepanels.com/en/basic-operation.html',
      'https://www.litepanels.com/en/product/astra-ip-2x1-bi-color-led-panel-standard-yoke-eu-power-cable/',
      'https://www.litepanels.com/en/product-support/firmware-updates/'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one Astra IP fixture over native Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'Only on a compatible full-color Litepanels route; never infer color commands for Astra IP bi-color fixtures.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one supported FX change per capture only after simpler controls are understood.'}
    },
    secondaryPlans:[
      {
        id:'litepanels-astra-ip-direct-wifi-capture-v1',
        transport:'wifi',
        target:'Astra IP Half/1x1/2x1 only',
        commandSpecStatus:'public-wifi-command-spec-not-located-in-official-docs',
        rule:'Capture native Astra IP Wi-Fi independently from Bluetooth. Do not infer proprietary IP/session semantics from Art-Net/sACN network capability.'
      },
      {
        id:'litepanels-assisted-bluetooth-capture-v1',
        transport:'bluetooth',
        target:'Legacy Astra Bluetooth Communications Module and Gemini optional BLE dongles',
        commandSpecStatus:'public-command-spec-not-located-in-official-docs',
        rule:'Use one exact assisted route at a time. Preserve module/dongle provenance and never treat the fixture as a built-in Bluetooth endpoint.'
      }
    ],
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  GVM: {
    id:'gvm-led-app-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'GVM LED App',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact GVM Bluetooth model from the transport-verified catalog set.',
      'Reset Bluetooth on the fixture where the manual exposes a BT Reset action.',
      'Use the official GVM LED App and isolate one fixture where practical.',
      'Do not treat legacy Wi-Fi models or wireless master/slave radio traffic as Bluetooth command evidence.'
    ],
    officialSources:[
      'https://gvmled.com/download-gvm-app/',
      'https://gvmled.com/gvm-sd200r/',
      'https://gvmled.com/gvm-800d-iii-dl/',
      'https://gvmled.com/gvm-pro-yu150r/'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Reset Bluetooth when documented, connect exactly one fixture in GVM LED App, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'On a variable-CCT model perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'Only on an RGB/full-color model; perform exactly one hue/saturation/RGB change per capture after DIM/CCT evidence is stable.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one documented scene/effect per capture only after simpler controls are understood.'}
    },
    secondaryPlans:[
      {
        id:'gvm-rgb10s-direct-wifi-capture-v1',
        transport:'wifi',
        target:'GVM RGB-10S only',
        commandSpecStatus:'public-wifi-command-spec-not-located-in-official-docs',
        rule:'Use only the vendor-documented Wi-Fi app path for RGB-10S. Keep this legacy Wi-Fi path separate from GVM Bluetooth Mesh fixtures and never reuse Bluetooth packet semantics.'
      }
    ],
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  NEEWER: {
    id:'neewer-app-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'NEEWER App',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact NEEWER model from the transport-verified catalog set.',
      'Confirm the fixture Bluetooth indicator is active/blinking as documented before app connection.',
      'Use the official NEEWER App and isolate one fixture where practical.',
      'Do not treat built-in 2.4G group-control radio traffic as Bluetooth command evidence.'
    ],
    officialSources:[
      'https://neewer.com/pages/faq',
      'https://eu.neewer.com/collections/all-products/products/neewer-nt-bt-bluetooth-usb-transmitter-for-pc-mac-66605690',
      'https://neewer.com/products/neewer-cri-97-50w-660-prorgb-led-light-66600136'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Enable Bluetooth pairing/indicator, connect exactly one fixture in the NEEWER App, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'From the same initial intensity perform exactly one brightness change per capture.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'Only on RGB/full-color models; perform one HSI/RGB change per capture after DIM/CCT evidence is stable.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one documented scene/effect per capture only after simpler controls are understood.'}
    },
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  amaran: {
    id:'amaran-sidus-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'amaran App / Sidus Link',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact amaran model from the transport-verified catalog set.',
      'Perform the documented Bluetooth reset before each clean capture set.',
      'Use the official amaran App or Sidus Link and isolate one fixture where practical.',
      'Do not reuse Aputure command semantics solely because both product families use Sidus transport.'
    ],
    officialSources:[
      'https://help.amarancreators.com/en/amaran-mobile-app/connect-devices',
      'https://help.amarancreators.com/en/amaran-150c-300c/sidus-link-control',
      'https://help.amarancreators.com/en/amaran-flexible-lights/light-configuration-settings'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Reset Bluetooth, connect one fixture in the official app, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'On a variable-CCT model perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'Only on a full-color model; perform exactly one HSI/RGB color change per capture after DIM/CCT evidence is stable.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one documented effect per capture only after simpler controls are understood.'}
    },
    secondaryPlans:[
      {
        id:'amaran-sm5c-direct-wifi-capture-v1',
        transport:'wifi',
        target:'amaran SM5c only',
        commandSpecStatus:'public-wifi-command-spec-not-located-in-official-docs',
        rule:'Use only the official Tuya Smart path documented for SM5c. Capture Wi-Fi independently of Sidus Bluetooth and do not infer the same IP/session behavior for other amaran fixtures.'
      }
    ],
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  SmallRig: {
    id:'smallrig-smallgogo-direct-ble-capture-v1',
    transport:'bluetooth',
    controllerApp:'SmallGoGo',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one SmallRig fixture whose catalog entry includes exact-model BLE/Bluetooth first-party evidence.',
      'Use the official SmallGoGo app and reset BLE on the fixture as documented before a clean capture set.',
      'Do not extend BLE support to RC 120B or other SmallGoGo-capable models without exact-model Bluetooth/BLE evidence.',
      'Keep optional DMX adapters and wired controllers out of the Bluetooth capture set.'
    ],
    officialSources:[
      'https://static.smallrig.com/mall/img/public/ikoxo2sh29-1740738075427_.pdf',
      'https://static.smallrig.com/mall/img/public/5wglduq1wx7-1748506964081_.pdf',
      'https://static.smallrig.com/mall/img/public/1732525071182_.pdf'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Reset BLE as documented, connect exactly one fixture in SmallGoGo, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'From the same initial intensity perform exactly one brightness change per capture.'},
      cct:{runs:3,rule:'On a variable-CCT model perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'Only on the exact RGB/full-color model; perform one color change per capture after DIM/CCT evidence is stable.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one documented lighting effect per capture only after simpler controls are understood.'}
    },
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  Kelvin: {
    id:'kelvin-narrator-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Kelvin Narrator',
    commandSpecStatus:'public-reference-implementation-available-model-scoped',
    prerequisites:[
      'Use one Kelvin fixture whose catalog entry explicitly verifies Bluetooth/Narrator control.',
      'Use the official Kelvin Narrator app for primary packet capture and keep CRMX/DMX paths separate.',
      'For Play, Play Pro, Epos 300 and Epos 600, compare derived behavior with the vendor-published KelvinLights/k-lights-interface-py reference implementation.',
      'Do not extend public-reference command semantics to Play Air or Play Hero unless the vendor reference implementation explicitly adds those models or physical evidence independently proves equivalence.'
    ],
    officialSources:[
      'https://www.kelvinlight.com/app-narrator/',
      'https://www.kelvinlight.com/product/epos_300_rgbacl_led_studio_light_travel_kit_for/',
      'https://github.com/KelvinLights/k-lights-interface-py'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one fixture through Kelvin Narrator over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT/tint change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one RGB/HSI/XY change per capture after DIM/CCT evidence is stable.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one Kelvin effect per capture only after simpler controls are understood.'}
    },
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  'Quasar Science': {
    id:'quasar-starctrl-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Quasar Science starCTRL',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one Rainbow 2 or Double Rainbow fixture with firmware that supports starCTRL.',
      'Enable starCTRL/App mode on the fixture and use the official starCTRL iOS app.',
      'Keep CRMX and Wi-Fi evidence separate from the Bluetooth capture set.',
      'Isolate one fixture where practical.'
    ],
    officialSources:[
      'https://www.quasarscience.com/pages/starctrl',
      'https://www.quasarscience.com/products/rainbow-2',
      'https://www.quasarscience.com/collections/new/products/double-rainbow'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Enable starCTRL, connect one fixture, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one color-temperature change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one hue/saturation or color preset change per capture after DIM/CCT evidence is stable.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one Rainbow-series effect per capture only after simpler controls are understood.'}
    },
    secondaryPlans:[
      {
        id:'quasar-rainbow-model-scoped-wifi-capture-v1',
        transport:'wifi',
        target:'Rainbow 2 and Double Rainbow models whose product pages explicitly list WiFi',
        commandSpecStatus:'public-wifi-command-spec-not-located-in-official-docs',
        rule:'Capture only the vendor-documented Wi-Fi path for one exact fixture at a time. Do not infer a proprietary IP API from Wi-Fi presence, and do not reuse Bluetooth packet semantics.'
      }
    ],
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  Luxli: {
    id:'luxli-composer-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Luxli Composer',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one Luxli fixture whose catalog entry explicitly verifies Composer Bluetooth control.',
      'Use the official Luxli Composer app and isolate one fixture where practical.',
      'Do not infer Bluetooth support for Taiko or any other Luxli model that is not explicitly included in the current verified catalog set.',
      'Keep DMX control separate from Bluetooth capture evidence.'
    ],
    officialSources:[
      'https://www.luxlilight.com/composer',
      'https://www.luxlilight.com/product/16565/Luxli-ORC_TIMPANI_M2-Timpani%26sup2%3B%201%26times%3B1-RGBAW-LED-Light-Panel',
      'https://www.luxlilight.com/product/15842/Luxli-ORC_CELLO_M2-Cello%26sup2%3B-10%22-RGBAW-LED-Light'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one fixture through Luxli Composer over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'From the same known intensity perform exactly one brightness change per capture.'},
      cct:{runs:3,rule:'On a CCT-capable fixture perform exactly one white-balance/CCT change per capture.'},
      color:{runs:3,rule:'On a full-color fixture perform exactly one color change per capture after DIM/CCT evidence is stable.'},
      fx:{runs:3,optional:true,rule:'Only after simpler controls are understood; activate exactly one app effect per capture.'}
    },
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  Rotolight: {
    id:'rotolight-app-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Rotolight app',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one Rotolight fixture whose catalog entry explicitly verifies Bluetooth app control.',
      'Use the official Rotolight app and isolate one fixture where practical.',
      'Do not treat LumenRadio CRMX, wDMX, flash receivers, or Wi-Fi traffic as Bluetooth command evidence.',
      'Record Bluetooth and Wi-Fi paths in separate capture sets.'
    ],
    officialSources:[
      'https://rotolight.com/pages/neo-3-support',
      'https://rotolight.com/pages/titan-support',
      'https://rotolight.com/pages/ap3-support'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one fixture through the Rotolight app over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'From the same known output perform exactly one power/intensity change per capture.'},
      cct:{runs:3,rule:'On a CCT-capable fixture perform exactly one CCT change from the same initial state per capture.'},
      color:{runs:3,rule:'On an RGBWW fixture perform exactly one color change per capture after DIM/CCT evidence is stable.'},
      fx:{runs:3,optional:true,rule:'Only after simpler controls are understood; activate one CineSFX preset per capture.'}
    },
    secondaryPlans:[
      {
        id:'rotolight-app-direct-wifi-capture-v1',
        transport:'wifi',
        target:'Rotolight models whose catalog metadata explicitly verifies Wi-Fi app control',
        commandSpecStatus:'public-wifi-command-spec-not-located-in-official-docs',
        rule:'Use the official Rotolight app with exactly one Wi-Fi-capable fixture. Capture three no-change sessions and isolated DIM/COLOR actions. Do not infer a proprietary IP API from the presence of Wi-Fi or reuse Bluetooth packet semantics.'
      }
    ],
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  Aputure: {
    id:'sidus-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Sidus Link Mobile',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one Aputure fixture with built-in Sidus Bluetooth Mesh from the current catalog.',
      'Do not use Sidus Link Bridge, Sidus One, CRMX, or legacy 2.4G as part of this direct-Bluetooth capture set.',
      'Reset Sidus BT on the fixture before a clean test session.',
      'Connect through the Sidus Link app interface, not the phone system Bluetooth pairing screen.',
      'Keep other Sidus Mesh fixtures powered off or outside the scene where practical so mesh relay traffic does not contaminate the first capture set.'
    ],
    officialSources:[
      'https://help.aputure.com/en/sidus-link-pro/sidus-link-mobile/wireless-lighting-control-system',
      'https://help.aputure.com/en/sidus-link-pro/sidus-link-mobile/connecting-your-fixtures',
      'https://aputure.com/EN-US/products/sidus-link-bridge'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Reset Sidus BT, add only the test fixture in a fresh scene, connect, wait 15 seconds, make no lighting changes.'},
      dim:{runs:3,rule:'From the same initial intensity perform exactly one intensity change in Sidus Link per capture.'},
      cct:{runs:3,rule:'On a CCT-capable fixture perform exactly one CCT change from the same initial state per capture.'},
      color:{runs:3,optional:true,rule:'Only after DIM/CCT evidence is stable; perform one HSI/RGB/xy parameter change per capture.'},
      fx:{runs:3,optional:true,rule:'Only after simpler controls are understood; activate one known FX preset per capture.'}
    },
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  ARRI: {
    id:'arri-lico-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'ARRI LiCo',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Prefer SkyPanel X or SkyPanel S60 Pro for the first direct-Bluetooth capture set.',
      'For SkyPanel X/S60 Pro use native Bluetooth without CRMX, Art-Net, sACN or wired DMX traffic.',
      'If Orbiter is tested, record it as an adapter-assisted variant and use the supported Bluetooth 5.0 USB dongle required by ARRI.',
      'Use the official ARRI LiCo app and keep other Bluetooth lighting controllers disconnected.'
    ],
    officialSources:[
      'https://www.arri.com/en/learn-help/lighting/tools-apps/lico',
      'https://www.arri.com/en/lighting/led-panel-lights/skypanel-pro/faq',
      'https://www.arri.com/en/lighting/led-panel-lights/skypanel-x/control-options'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Enable fixture Bluetooth, connect only the test fixture in LiCo, wait 15 seconds, make no lighting change, then disconnect.'},
      dim:{runs:3,rule:'From the same known intensity perform exactly one dimmer change in LiCo per capture.'},
      cct:{runs:3,rule:'From the same known CCT/intensity perform exactly one CCT change in LiCo per capture.'},
      color:{runs:3,optional:true,rule:'Only after DIM/CCT evidence is stable; perform exactly one HSI/RGBACL/xy color parameter change per capture.'},
      fx:{runs:3,optional:true,rule:'Only after simpler controls are understood; activate exactly one known lighting effect per capture.'}
    },
    secondaryPlans:[
      {
        id:'arri-skypanel-web-wifi-capture-v1',
        transport:'wifi',
        target:'SkyPanel S60 Pro Web Portal',
        commandSpecStatus:'public-http-command-api-not-located-in-official-docs',
        rule:'Use an isolated local network, access only the fixture Web Portal, capture browser HTTP traffic for three no-change sessions and three isolated DIM/CCT actions each. Do not infer endpoints from page labels alone.'
      }
    ],
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  Astera: {
    id:'astera-physical-capture-set-v1',
    transport:'bluetooth',
    controllerApp:'AsteraApp',
    commandSpecStatus:'physical-evidence-required',
    existingToolchain:{
      manifest:'backend/astera-physical-capture-set.example.json',
      orchestrator:'backend/astera-physical-capture-set.js',
      analyzers:[
        'backend/astera-btsnoop-analyzer.js',
        'backend/astera-att-session-consensus.js',
        'backend/astera-att-diff.js',
        'backend/astera-att-consensus.js',
        'backend/astera-att-sweep.js'
      ]
    },
    prerequisites:[
      'Use the official AsteraApp and exactly one identified Astera fixture for the first capture set.',
      'Use the existing connect-only, DIM and CCT physical capture methodology; proprietary LightingAI writes remain disabled.',
      'Keep raw Bluetooth snoop logs out of the repository and commit only derived evidence.'
    ],
    officialSources:['catalog-first-party-product-and-manual-sources'],
    captureSets:{
      connectOnly:{runs:3,rule:'Use the existing Astera physical capture-set methodology with three connect-only captures.'},
      dim:{runs:3,rule:'Use the existing Astera physical capture-set methodology with three isolated DIM captures.'},
      cct:{runs:3,rule:'Use the existing Astera physical capture-set methodology with three isolated CCT captures.'}
    },
    secondaryPlans:[
      {
        id:'astera-model-scoped-wifi-capture-v1',
        transport:'wifi',
        target:'Astera models whose catalog metadata explicitly verifies Wi-Fi control',
        commandSpecStatus:'public-wifi-command-api-not-located-in-official-docs',
        rule:'Use only the official model-documented Astera Wi-Fi control path on an isolated local network. Capture three no-change sessions and isolated DIM/CCT actions. Do not infer proprietary endpoints or command semantics from transport presence alone.'
      }
    ],
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  Aladdin: {
    id:'aladdin-app-ble-capture-v1',
    transport:'bluetooth',
    controllerApp:'Official Aladdin Lights mobile app',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one catalog fixture whose Aladdin metadata explicitly lists Bluetooth/BLE app control.',
      'Prefer a MOSAIC 2x4, 4x4 or 3x6 for the first capture set because the official manual explicitly lists BLE and app control.',
      'Do not use LumenRadio or optional DMX attachments during the direct-BLE capture set.',
      'Keep other Bluetooth lighting fixtures disconnected where practical.'
    ],
    officialSources:[
      'https://aladdin-lights.com/mosaic-2x4/',
      'https://aladdin-lights.com/wp-content/uploads/2023/09/MOSAIC-4x4-Manual-SINGLE-PAGE.pdf'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Open the official Aladdin app, connect only the test fixture, wait 15 seconds and make no lighting change.'},
      dim:{runs:3,rule:'From the same known intensity perform exactly one dimmer change per capture.'},
      cct:{runs:3,rule:'From the same known CCT/intensity perform exactly one CCT change per capture.'},
      color:{runs:3,optional:true,rule:'Only after DIM/CCT evidence is stable; perform exactly one RGB/HSI color change per capture.'},
      fx:{runs:3,optional:true,rule:'Only after simpler controls are understood; activate exactly one effect per capture.'}
    },
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },
  'EV Light': {
    id:'evlight-direct-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Official EV Light mobile control app',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use only an EV Light catalog model whose first-party product page explicitly lists Bluetooth app control.',
      'Do not interpret Wireless DMX as Bluetooth.',
      'Keep DMX/CRMX/wireless-DMX transmitters inactive during the direct-Bluetooth capture set.',
      'Record exact fixture model and firmware/app versions with every capture set.'
    ],
    officialSources:[
      'https://www.evlightprofessional.com/quality-led-soft-light-panel-63424122.html',
      'https://www.evlightpro.com/led-soft-light-panel/68692360.html'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect only the test fixture using the vendor app, wait 15 seconds and make no lighting change.'},
      dim:{runs:3,rule:'From the same known intensity perform exactly one dimmer change per capture.'},
      cct:{runs:3,rule:'On a CCT-capable fixture perform exactly one CCT change from the same initial state per capture.'},
      color:{runs:3,optional:true,rule:'Only after DIM/CCT evidence is stable; perform exactly one documented color parameter change per capture.'},
      fx:{runs:3,optional:true,rule:'Only if the fixture/app exposes FX; activate exactly one known effect per capture.'}
    },
    secondaryPlans:[
      {
        id:'evlight-model-scoped-wifi-capture-v1',
        transport:'wifi',
        target:'EV Light models whose official product metadata explicitly lists WiFi-DMX/app control',
        commandSpecStatus:'public-wifi-command-api-not-located-in-official-docs',
        rule:'Use an isolated local network and the vendor-documented app/control path. Capture three no-change sessions and three isolated DIM/CCT actions. WiFi-DMX labeling alone must not be converted into an undocumented proprietary IP API.'
      }
    ],
    safety:{
      officialAppWritesOnly:true,
      lightingAiWritesAllowed:false,
      rawCaptureCommitAllowed:false,
      derivedEvidenceOnly:true,
      resultStatus:'candidate_only_until_physical_replay'
    }
  },

});

export function vendorWirelessCapturePlan(manufacturer){
  return VENDOR_WIRELESS_CAPTURE_PLANS[manufacturer]||null;
}
