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
  }
});

export function vendorWirelessCapturePlan(manufacturer){
  return VENDOR_WIRELESS_CAPTURE_PLANS[manufacturer]||null;
}
