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
  'Falcon Eyes': {
    id:'falcon-eyes-desal-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Falcon Eyes DESAL',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Falcon Eyes DESAL model at a time with the official Falcon Eyes app.',
      'Reset to a known lighting state before each capture.',
      'Do not infer compatibility to other Falcon Eyes series without exact-model Bluetooth evidence.'
    ],
    officialSources:[
      'https://www.falconeyeshk.com/product-page/ds812',
      'https://www.falconeyeshk.com/product-page/ds-300c-pro',
      'https://www.falconeyeshk.com/zh/product-page/dm2',
      'https://www.falconeyeshk.com/zh/product-page/dm4',
      'https://www.falconeyeshk.com/app-bluetooth'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one Falcon Eyes fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one color change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Elgato: {
    id:'elgato-control-center-wifi-capture-v1',
    transport:'wifi',
    controllerApp:'Elgato Control Center',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact cataloged Elgato light at a time with the official Control Center app.',
      'Complete any documented setup pairing first, then capture only the established Wi-Fi control session.',
      'Start every capture from the same known lighting state and a clean local-network session.',
      'Do not treat Key Light Air MK.2 Bluetooth setup pairing as a production-control route.',
      'Do not infer control semantics between Elgato models without physical or protocol evidence.'
    ],
    officialSources:[
      'https://www.elgato.com/us/en/p/key-light',
      'https://help.elgato.com/hc/en-us/article_attachments/360081486532',
      'https://www.elgato.com/us/en/explorer/products/lighting/key-light-air-mk2-quick-start-guide/',
      'https://www.elgato.com/ww/en/s/user-manual/key-light-neo',
      'https://help.elgato.com/hc/en-us/article_attachments/360081559211'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one supported Elgato light in Control Center over the local network, wait 15 seconds, make no lighting changes, then disconnect/close the control session.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one color-temperature change per capture from the same initial state.'},
      power:{runs:3,optional:true,rule:'Perform exactly one on/off state change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Genaray: {
    id:'genaray-rgb-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Genaray Bluetooth mobile app (model-documented)',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact cataloged Genaray Bluetooth model at a time with the vendor-documented mobile app.',
      'Start every capture from the same known lighting state and a clean Bluetooth session.',
      'Do not infer command semantics between PX tubes, panels or SSL strip fixtures without physical evidence.',
      'Do not infer Bluetooth support to Genaray models that only document generic wireless remote control.'
    ],
    officialSources:[
      'https://www.genaray.com/products/Lights/Panel-LEDs',
      'https://www.genaray.com/products/Lights/Strip-Lights',
      'https://www.genaray.com/products/Lights/Wand-Style-%26-Tube-Lights',
      'https://www.genaray.com/product/21381/Genaray-PX_MOD_3-RGB-Series-Modular-RGB-Pixel-Panel%3C%2Astrong%3E'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one supported Genaray fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one HSI/RGB color change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  broncolor: {
    id:'broncolor-led-f160-wifi-capture-v1',
    transport:'wifi',
    controllerApp:'bronControl',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact broncolor LED F160 at a time with the official bronControl app.',
      'Establish the documented LED F160 Wi-Fi/bronControl session before capture.',
      'Start every capture from the same known lighting state and a clean Wi-Fi session.',
      'Do not infer LED F160 control semantics to Siros, Scoro, Satos or other broncolor equipment.'
    ],
    officialSources:[
      'https://broncolor.swiss/products/led-f160',
      'https://broncolor.swiss/products/broncontrol-1?variant=1421',
      'https://broncolor.swiss/software'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one LED F160 to bronControl over Wi-Fi, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      tint:{runs:3,optional:true,rule:'Perform exactly one green/magenta correction change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Fotodiox: {
    id:'fotodiox-prizmo-stick-512-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Fotodiox Lighting Control App',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Fotodiox Prizmo Stick 512 at a time with the official/mobile Lighting Control app.',
      'Start every capture from the same known lighting state and a clean Bluetooth session.',
      'Do not infer Bluetooth semantics to Prizmo Globe, Warrior or other Fotodiox fixtures without exact-model transport evidence.'
    ],
    officialSources:[
      'https://fotodioxpro.com/products/pzm-st512',
      'https://fotodioxpro.com/blogs/news/the-prizmo-stick-512-our-most-compact-tube-light'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one Prizmo Stick 512 over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one HSI/RGB color change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  'CHAUVET DJ': {
    id:'chauvet-dj-btair-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'CHAUVET DJ BTAir',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact cataloged CHAUVET DJ BT fixture at a time with the official BTAir app.',
      'Put the fixture into its documented Bluetooth control mode before capture.',
      'Start every capture from the same known lighting state and a clean BTAir session.',
      'Do not infer BTAir command semantics from DMX, ILS, D-Fi or other CHAUVET control routes.',
      'Exclude non-light accessories such as EZLink FSBT from fixture command capture.'
    ],
    officialSources:[
      'https://www.chauvetdj.com/bluetooth/',
      'https://www.chauvetdj.com/products/btair/',
      'https://www.chauvetdj.com/wp-content/uploads/2018/02/BTAir_UM_Rev1_WO.pdf'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Enable Bluetooth mode on one supported fixture, connect it in BTAir, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one supported color change per capture from the same initial state.'},
      program:{runs:3,optional:true,rule:'Perform exactly one supported static/program selection per capture, without mixing unrelated operations.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  'Lume Cube': {
    id:'lume-cube-lume-control-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Lume Control',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact cataloged Lume Cube Bluetooth model at a time with the official Lume Control app.',
      'Start every capture from the same known lighting state and a clean Bluetooth session.',
      'Do not infer command semantics or Bluetooth Mesh behavior across models without physical evidence.'
    ],
    officialSources:[
      'https://help.lumecube.com/en-US/what-apps-can-i-use-with-my-lume-cube-products-321666',
      'https://help.lumecube.com/en-US/where-can-i-find-app-support-321667',
      'https://lumecube.com/pages/lume-control-app',
      'https://lumecube.com/products/panel-pro',
      'https://lumecube.com/products/tube-light-mini',
      'https://lumecube.com/products/tube-light-xl',
      'https://lumecube.com/products/lume-cube-xl-60w-rgb-mini-cob-led-light'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one supported Lume Cube fixture in Lume Control, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one HSI/RGB color change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Jinbei: {
    id:'jinbei-studio-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Jinbei Studio / Jinbei APP',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact cataloged Jinbei Bluetooth model at a time with the official Jinbei app.',
      'Start every capture from the same known lighting state and a clean Bluetooth session.',
      'Do not infer Bluetooth support to other Jinbei fixtures that only mention app control without explicit transport evidence.'
    ],
    officialSources:[
      'https://www.jinbei-deutschland.de/en/blogs/jinbeisphotobox/creative-light-management-made-easy-the-jinbei-studio-app',
      'https://www.jinbei-deutschland.de/en/products/ef-120c-rgb-led-dauerlicht',
      'https://www.jinbei-deutschland.de/en/products/ef-200x-led-dauerlicht',
      'https://www.jinbei-deutschland.de/en/products/jl-600c-rgb-led-dauerlicht'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one supported Jinbei fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'For RGB-capable models only, perform exactly one HSI/RGB color change per capture.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Ikan: {
    id:'ikan-idc150-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Ikan Bluetooth controller',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Ikan IDC150 fixture at a time.',
      'Start every capture from the same known lighting state and a clean Bluetooth session.',
      'Do not infer Bluetooth support to other Ikan fixtures without exact-model first-party evidence.'
    ],
    officialSources:[
      'https://ikancorp.com/Downloads/catalogs/IkanNABCatalog2018.pdf'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one IDC150 over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one RGBW color change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Moman: {
    id:'moman-pc8-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Moman Light',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Moman PC8 fixture with the official Moman Light app.',
      'Start every capture from the same known lighting state and a clean Bluetooth session.',
      'Do not infer Bluetooth support to other Moman lights without exact-model first-party evidence.'
    ],
    officialSources:[
      'https://momanx.com/products/led-light-for-dslr-camera-moman-pc8',
      'https://momanx.com/ja/pages/moman-lighting-app',
      'https://momanx.com/it/blogs/moman-ideas/best-lighting-equipment-for-youtube-videos-for-any-budget'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one PC8 over Bluetooth in Moman Light, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one HSI/RGB color change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Tolifo: {
    id:'tolifo-gk2016-wifi-capture-v1',
    transport:'wifi',
    controllerApp:'Tolifo mobile APP',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Tolifo GK-2016B PRO or GK-2016S PRO fixture at a time with the official Tolifo mobile app.',
      'Start every capture from the same known lighting state and a clean Wi-Fi session.',
      'Keep Tolifo 2.4G wireless control out of Wi-Fi captures.',
      'Do not infer Wi-Fi support to other Tolifo models without exact-model first-party evidence.'
    ],
    officialSources:[
      'https://www.tolifo.com/news/835-cn.html',
      'https://us.tolifo.com/product/product.php?class2=41',
      'https://us.tolifo.com/product/showproduct.php?id=80'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one GK-2016 PRO fixture over its documented Wi-Fi app route, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,optional:true,rule:'On the bi-color variant only, perform exactly one CCT change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  SOONWELL: {
    id:'soonwell-g900-sensei-link-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'SOONWELL Sensei Link',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact SOONWELL G900 fixture with the official Sensei Link app.',
      'Start every capture from the same known lighting state and a clean Bluetooth session.',
      'Keep the separate 2.4G control path out of Bluetooth captures.',
      'Do not infer Bluetooth support to other SOONWELL models without exact-model evidence.'
    ],
    officialSources:[
      'https://www.soonwell.com/product-page/soonwell-element-series-g900-bi-color-bowens-mount-led-spotlight',
      'https://www.soonwell.com/soonwell-app',
      'https://fcc.report/FCC-ID/2a6flg900/5962642.pdf'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one G900 over Bluetooth in Sensei Link, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  'CAME-TV': {
    id:'came-tv-boltzen-wifi-capture-v1',
    transport:'wifi',
    controllerApp:'CAME-TV BOLTZEN APP',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact cataloged CAME-TV Boltzen Wi-Fi model/variant at a time with the official CAME-TV app.',
      'Start every run from the same known lighting state and a clean Wi-Fi session.',
      'Do not infer Wi-Fi support to other CAME-TV models without exact-model first-party evidence.'
    ],
    officialSources:[
      'https://www.came-tv.com/collections/all/products/boltzen-andromeda-slim-tube-led-light-3ft',
      'https://www.came-tv.com/collections/video-lights-1/products/boltzen-andromeda-mkii-slim-tube-led-light',
      'https://www.came-tv.com/collections/special-video-lights/products/boltzen-cassiopeia-folding-rgbdt-50-watt-ring-light-led',
      'https://www.came-tv.com/products/came-tv-boltzen-perseus-bi-color-55w-smd-soft-travel-lights-that-are-stackable-and-ready-to-fly',
      'https://www.came-tv.com/pages/software-downloads'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one CAME-TV fixture over its documented Wi-Fi app route, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'For tunable-white models, perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'For color-capable models only, perform exactly one HSI/RGB color change per capture.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Ulanzi: {
    id:'ulanzi-connect-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Ulanzi Connect',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact supported Ulanzi fixture at a time with Ulanzi Connect.',
      'Start every capture from the same known lighting state and a clean Bluetooth session.',
      'Do not infer compatibility to additional Ulanzi lighting models outside the first-party supported-model list.'
    ],
    officialSources:[
      'https://www.ulanzi.com/en-au/pages/ulanzi-app',
      'https://www.ulanzi.com/collections/continuous-lighting/products/120w-v-mount-light-l074cna1',
      'https://www.ulanzi.com/collections/continuous-lighting/products/vl-200bi-200w-video-light-l079cna1',
      'https://www.ulanzi.com/collections/continuous-lighting/products/65w-portable-bi-color-led-video-light-l184',
      'https://www.ulanzi.com/collections/continuous-lighting/products/inflatable-led-air-tube-light-l096'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one supported Ulanzi fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'For color-capable models only, perform exactly one HSI/RGB color change per capture.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  NiceFoto: {
    id:'nicefoto-tc-bluetooth-mesh-capture-v1',
    transport:'bluetooth',
    controllerApp:'NiceFoto APP',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact NiceFoto TC-series fixture at a time with the official NiceFoto APP.',
      'Start each run from the same known lighting state and clean Bluetooth session.',
      'Keep NiceFoto Bluetooth Mesh captures separate from any non-Bluetooth remote-control path.',
      'Do not infer compatibility to non-TC NiceFoto families without exact-model evidence.'
    ],
    officialSources:[
      'https://nicefoto.cn/app',
      'https://nicefoto.cn/shuomingshu'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one NiceFoto TC-series fixture over Bluetooth Mesh, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one HSI/RGB color change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Lishuai: {
    id:'lishuai-lightreel-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Lishuai Light Reel',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Lishuai COOLCAM P60G or P120G fixture at a time with the official Light Reel app.',
      'Use the fixture Bluetooth reset before each clean capture session.',
      'Keep the separate 2.4G remote-control path out of Bluetooth captures.',
      'Do not infer compatibility to other Lishuai models without exact-model Bluetooth evidence.'
    ],
    officialSources:[
      'https://www.lishuai.com.cn/lishuai/2023/12/19/coolcamp60gp120gshuomingshu.pdf',
      'https://www.lishuai.com.cn/service/zi-liao-xia-zai/',
      'https://www.lishuai.com.cn/'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Reset Bluetooth, connect one Lishuai fixture in Light Reel, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  PIXEL: {
    id:'pixel-app-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'PIXEL Link / PIXEL LCS',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact PIXEL Liber or P80 RGB fixture at a time with its documented PIXEL app.',
      'Reset to a known lighting state before each capture.',
      'Do not infer compatibility to K80, G1S or other PIXEL models without exact-model Bluetooth evidence.'
    ],
    officialSources:[
      'https://www.pixelhk.com/en/product/liber-3',
      'https://cdn.pixelhk.com/storage/product/download/manual/liber-3/Liber-RGB-Povket-Video-Light_%2B~.pdf',
      'https://www.pixelhk.com/en/product/p80-Metal-Light-3',
      'https://cdn.pixelhk.com/storage/product/download/manual/p80-Metal-Light-3/P80_Manual.pdf'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one PIXEL fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one color change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  YONGNUO: {
    id:'yongnuo-app-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'YONGNUO App',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact YONGNUO model at a time with the official YONGNUO app.',
      'Reset to a known lighting state before each capture.',
      'Keep Bluetooth captures separate from YONGNUO 2.4G RF control.',
      'Do not infer compatibility to non-cataloged YONGNUO models.'
    ],
    officialSources:[
      'https://th.hkyongnuo.com/u_file/2408/05/file/YN150SeriesUserManual.pdf',
      'https://th.hkyongnuo.com/products/yn216-ii',
      'https://www.th.hkyongnuo.com/products/yn300-iii',
      'https://www.th.hkyongnuo.com/products/yn600l-ii',
      'https://www.hkyongnuo.com/app'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one YONGNUO fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Phottix: {
    id:'phottix-lighting-control-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Phottix Lighting Control',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Phottix model at a time with the official Phottix Lighting Control app.',
      'Reset to a known lighting state before each capture.',
      'Do not infer compatibility to twin-kit packaging entries or unrelated Phottix lights.'
    ],
    officialSources:[
      'https://www.phottix.com/phottix-app-download/',
      'https://www.phottix.com/product/phottix-nuada-c60a-curved-led-light/',
      'https://www.phottix.com/product/phottix-nuada-s3a-led-light/',
      'https://www.phottix.com/product/phottix-nuada-r3a-led-light/',
      'https://www.phottix.com/product/phottix-kali50ra-rgb-led-light/'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one Phottix fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'Only on Kali50Ra; perform exactly one color change per capture.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  VILTROX: {
    id:'viltrox-weeylite-pro-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Weeylite Pro',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact VILTROX Ninja 30 or Ninja 30B fixture at a time with Weeylite Pro.',
      'Reset to a known lighting state before each capture.',
      'Do not infer compatibility to unrelated Weeylite/Viltrox models without exact-model evidence.'
    ],
    officialSources:[
      'https://viltrox.com/products/viltrox-ninja-30-30b'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one VILTROX fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state on Ninja 30B; keep Ninja 30 fixed-daylight captures separate.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  VELVET: {
    id:'velvet-evo-wireless-capture-v1',
    transport:'bluetooth',
    controllerApp:'VELVET GOYA',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Bluetooth-verified VELVET EVO model at a time with the official GOYA app.',
      'Reset to a known lighting state before each capture.',
      'Do not infer Bluetooth support for Studio variants unless the exact model evidence explicitly confirms it.',
      'Keep Bluetooth and Wi-Fi Art-Net capture sets separate.'
    ],
    officialSources:[
      'https://www.velvetlight.tv/velvet-evo/',
      'https://www.velvetlight.tv/serie/evo/',
      'https://www.velvetlight.tv/support/'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one Bluetooth-verified EVO fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one color change per capture from the same initial state.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one supported effect per capture only after simpler controls are understood.'}
    },
    secondaryPlans:[{
      id:'velvet-evo-wifi-artnet-capture-v1',
      transport:'wifi',
      controllerApp:'VELVET GOYA / Art-Net',
      commandSpecStatus:'artnet-transport-documented-proprietary-session-unverified',
      rule:'Capture Wi-Fi Art-Net independently from Bluetooth on an exact Wi-Fi-verified EVO model. Do not infer proprietary GOYA session semantics or Bluetooth equivalence from Art-Net transport availability.'
    }],
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Kinotehnik: {
    id:'kinotehnik-practilite-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Practilite Remote Control App',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Practilite model at a time with the official remote-control app.',
      'Reset to a known lighting state before each capture.',
      'Do not infer commands to Practilite 604/802 or other models without exact-model Bluetooth evidence.'
    ],
    officialSources:[
      'https://kinotehnik.com/wp-content/uploads/2020/08/PRACTILITE-602_manual_for_web.pdf',
      'https://kinotehnik.com/632_user_manual.pdf',
      'https://kinotehnik.com/practilite-remote-control-app/'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one Practilite fixture over Bluetooth LE, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  'Hive Lighting': {
    id:'hive-shot-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Hive SHOT',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Hive Lighting model at a time with Hive SHOT.',
      'Reset to a known lighting state before each capture.',
      'Do not infer commands across C and CX families without matching physical evidence.'
    ],
    officialSources:[
      'https://hivelighting.com/is-control/',
      'https://hivelighting.com/bb-25-cx/',
      'https://hivelighting.com/products/bee-50-c-open-face-omni-color-led-light/',
      'https://hivelighting.com/products/wasp-100-c-led-spot/',
      'https://hivelighting.com/products/wasp-100-cx/',
      'https://hivelighting.com/products/hornet-200-c-open-face-omni-color-led-light/',
      'https://hivelighting.com/products/hornet-200-cx/',
      'https://hivelighting.com/575-c-vs/'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one Hive fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one color change per capture from the same initial state.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one supported effect per capture only after simpler controls are understood.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Dracast: {
    id:'dracast-palette-v2-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Dracast Palette V2 App',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Dracast model at a time with Palette V2 App.',
      'Reset to a known lighting state before each capture.',
      'Do not infer commands between Palette Series II and Fresnel Pro Series II without matching physical evidence.'
    ],
    officialSources:[
      'https://dracobroadcast.com/product/dracast-palette-series-ii-led4000-rgbw-soft-panel/',
      'https://dracobroadcast.com/product/dracast-fresnel-pro-series-ii-led500-bi-color-light/'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'Only on RGB-capable models; perform exactly one color change per capture.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one supported effect per capture only after simpler controls are understood.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  SWIT: {
    id:'swit-console-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'SWIT Console',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact SWIT model at a time with SWIT Console.',
      'Reset to a known lighting state before each capture.',
      'Do not infer commands across VANGO, MONET, CL, and Mini families without matching physical evidence.'
    ],
    officialSources:[
      'https://swit.cc/index.php?c=article&id=2501',
      'https://swit.cc/index.php?c=article&id=2502',
      'https://swit.cc/index.php?c=article&id=2613',
      'https://www.swit.cc/index.php?c=article&id=3114',
      'https://www.swit.cc/index.php?c=article&id=3115',
      'https://swit.cc/index.php?c=article&id=2670',
      'https://www.swit.cc/index.php?c=article&id=4440'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one SWIT fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state where supported.'},
      color:{runs:3,optional:true,rule:'Only on RGB-capable models; perform exactly one color change per capture.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one supported effect per capture only after simpler controls are understood.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Harlowe: {
    id:'harlowe-app-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'Harlowe App',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Harlowe/HOBOLITE model at a time with the Harlowe App.',
      'Reset to a known lighting state before each capture.',
      'Do not infer commands across Micro, Mini, Max, Avant, Pro, and Blade families without matching physical evidence.'
    ],
    officialSources:[
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
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state where supported.'},
      color:{runs:3,optional:true,rule:'Only on Spectra/Blade RGB-capable models; perform exactly one color change per capture.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one supported effect per capture only after simpler controls are understood.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  Fiilex: {
    id:'fiilex-matrix-wifi-capture-v1',
    transport:'wifi',
    controllerApp:'Fiilex WiFi app',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use the original Fiilex Matrix only.',
      'Reset to a known lighting state before each capture.',
      'Do not infer Matrix II or current COLOR-series command semantics from this legacy Matrix Wi-Fi route.'
    ],
    officialSources:[
      'https://fiilex.com/downloads/Legacy/Matrix_User_Manual_2016_0720.pdf',
      'https://fiilex.com/downloads/Legacy/Matrix_DataSheet_20160817.pdf'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect to the Matrix over the documented Wi-Fi app route, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      hue:{runs:3,optional:true,rule:'Perform exactly one documented hue adjustment per capture only after dim/CCT behavior is understood.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  SIRUI: {
    id:'sirui-light-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'SIRUI Light',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact SIRUI model at a time with SIRUI Light.',
      'Reset to a known lighting state before each capture.',
      'Do not infer commands across panel, tube, and monolight families without matching physical evidence.'
    ],
    officialSources:[
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
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state where supported.'},
      color:{runs:3,optional:true,rule:'Only on RGB-capable models; perform exactly one color change per capture.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one supported effect per capture only after simpler controls are understood.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  COLBOR: {
    id:'colbor-studio-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'COLBOR Studio',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact COLBOR model at a time with COLBOR Studio.',
      'Reset to a known lighting state before each capture.',
      'Do not infer commands to other COLBOR app-controlled models without exact-model Bluetooth evidence.'
    ],
    officialSources:[
      'https://www.colborlight.com/products/co-cl60',
      'https://www.colborlight.com/products/co-cl100x',
      'https://www.colborlight.com/blogs/articles/get-studio-lights-for-youtube',
      'https://www.colborlight.com/blogs/articles/buyer-guide-to-light-for-streaming',
      'https://www.colborlight.com/pages/colbor-apps-download'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one supported effect per capture only after simpler controls are understood.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  PROLYCHT: {
    id:'prolycht-chromalink-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'ChromaLink',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact Orion model at a time with the documented ChromaLink control path.',
      'Reset to a known state before each capture.',
      'Keep Bluetooth and Wi-Fi capture sets separate and do not infer undocumented cross-transport command equivalence.'
    ],
    officialSources:[
      'https://www.prolycht.com/orion300fs/index.aspx',
      'https://prolycht.com/orion675fs/index.aspx',
      'https://prolycht.com/uploadfiles/2021/11/20211125172104110.pdf',
      'https://prolycht.com/uploadfiles/2022/10/20221014151213506.pdf'
    ],
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one Orion fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,rule:'Perform exactly one color change per capture from the same initial state.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one supported effect per capture only after simpler controls are understood.'}
    },
    secondaryPlans:[{
      id:'prolycht-chromalink-wifi-capture-v1',
      transport:'wifi',
      target:'Orion 300 FS and Orion 675 FS',
      commandSpecStatus:'public-wifi-command-spec-not-located-in-official-docs',
      rule:'Capture Wi-Fi/ChromaLink independently from Bluetooth. Do not infer proprietary IP/session semantics from transport availability.'
    }],
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  ZHIYUN: {
    id:'zhiyun-zy-vega-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'ZY Vega',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
    prerequisites:[
      'Use one exact ZHIYUN model at a time with ZY Vega.',
      'Reset to a known lighting state before each capture.',
      'Do not infer commands across MOLUS, FIVERAY, and CINEPEER families without matching physical evidence.'
    ],
    officialSources:[
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
    captureSets:{
      connectOnly:{runs:3,rule:'Connect one fixture over Bluetooth, wait 15 seconds, make no lighting changes, then disconnect.'},
      dim:{runs:3,rule:'Perform exactly one intensity change per capture from the same initial state.'},
      cct:{runs:3,rule:'Perform exactly one CCT change per capture from the same initial state.'},
      color:{runs:3,optional:true,rule:'Only on RGB-capable models; perform exactly one color change per capture.'},
      fx:{runs:3,optional:true,rule:'Activate exactly one supported effect per capture only after simpler controls are understood.'}
    },
    safety:{officialAppWritesOnly:true,lightingAiWritesAllowed:false,rawCaptureCommitAllowed:false,derivedEvidenceOnly:true,resultStatus:'candidate_only_until_physical_replay'}
  },

  'DMG Lumiere': {
    id:'dmg-mix-bluetooth-capture-v1',
    transport:'bluetooth',
    controllerApp:'myMIX',
    commandSpecStatus:'public-command-spec-not-located-in-official-docs',
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
