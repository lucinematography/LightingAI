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
  'Falcon Eyes': {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'falcon-eyes-desal-bluetooth-capture-v1',
    evidence: [
      'https://www.falconeyeshk.com/product-page/ds812',
      'https://www.falconeyeshk.com/product-page/ds-300c-pro',
      'https://www.falconeyeshk.com/zh/product-page/dm2',
      'https://www.falconeyeshk.com/zh/product-page/dm4',
      'https://www.falconeyeshk.com/app-bluetooth'
    ],
    note: 'Bluetooth DESAL app transport is verified only for D-S812, DS-300C Pro, DM2 and DM4 in this checkpoint. LightingAI proprietary command semantics remain locked.'
  },

  Razer: {
    bluetooth: 'not_verified_for_current_catalog',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'razer-key-light-chroma-wifi-capture-v1',
    evidence: [
      'https://www.razer.com/streaming-accessories/razer-key-light-chroma',
      'https://mysupport.razer.com/app/answers/detail/a_id/5911/~/how-to-customize-the-razer-key-light-chroma',
      'https://mysupport.razer.com/app/answers/detail/a_id/6194/~/how-to-add-wi-fi-devices-on-razer-synapse-3',
      'https://mysupport.razer.com/app/answers/detail/a_id/5907/kw/Synapse%2B3%2BMac%2BOS'
    ],
    note: '2.4 GHz Wi-Fi app transport is verified only for Razer Key Light Chroma RZ19-0412 in this checkpoint. LightingAI proprietary network command/session semantics remain locked.'
  },

  Rollei: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'rollei-bluetooth-capture-v1',
    evidence: [
      'https://www.rollei.de/en/products/candela-100-bi-color-20119',
      'https://www.rollei.de/en/products/candela-220-bi-color-20120',
      'https://www.rollei.de/en/products/candela-220-rgb-20167',
      'https://www.rollei.de/en/products/candela-200-studio-bi-color-28936',
      'https://www.rollei.de/en/products/candela-200-studio-rgb-28938',
      'https://www.rollei.de/en/products/candela-300-studio-bi-color-28942',
      'https://www.rollei.de/products/candela-300-studio-rgb',
      'https://www.rollei.de/en/collections/led-dauerlicht/products/candela-600-pro-bi-color-20186',
      'https://www.rollei.de/en/products/lux-bi-color',
      'https://www.rollei.de/en/products/vibe-studio-200-bi-color-28880',
      'https://www.rollei.de/products/vibe-panel-900-rgb-28643',
      'https://www.rollei.de/en/pages/rollei-apps'
    ],
    note: 'Bluetooth app transport is verified only for the 12 exact Rollei fixtures in the current checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  'Logitech G': {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'logitech-g-litra-bluetooth-capture-v1',
    evidence: [
      'https://www.logitechg.com/en-us/shop/p/litra-beam-streaming-light',
      'https://www.logitechg.com/en-us/shop/p/litra-beam-lx-led-light.946-000013'
    ],
    note: 'Bluetooth/G HUB transport is verified only for Litra Beam and Litra Beam LX in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  Westcott: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'westcott-studiolink-bluetooth-capture-v1',
    evidence: [
      'https://help.fjwestcott.com/en-US/using-the-westcott-studio-link-app-3574014',
      'https://help.fjwestcott.com/en-US/connecting-the-l60-b-and-l120-b-to-the-westcott-studiolink-app-1024676',
      'https://help.fjwestcott.com/en-US/how-do-i-connect-my-ice-light-3-to-the-studiolink-mobile-app-1810587',
      'https://www.fjwestcott.com/products/l60-b-bi-color-cob-led-60w',
      'https://www.fjwestcott.com/products/l120-b-bi-color-cob-led-120w',
      'https://www.fjwestcott.com/products/ice-light-3-bi-color-led-kit-with-ac-power',
      'https://www.fjwestcott.com/products/ice-light-3-rgbww-led-kit-with-ac-power'
    ],
    note: 'Bluetooth/StudioLink transport is verified for L60-B, L120-B, Ice Light 3 Bi-Color and Ice Light 3 RGBWW in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  Elgato: {
    bluetooth: 'setup_only_not_control',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'elgato-control-center-wifi-capture-v1',
    evidence: [
      'https://www.elgato.com/us/en/p/key-light',
      'https://help.elgato.com/hc/en-us/article_attachments/360081486532',
      'https://www.elgato.com/us/en/explorer/products/lighting/key-light-air-mk2-quick-start-guide/',
      'https://www.elgato.com/ww/en/s/user-manual/key-light-neo',
      'https://help.elgato.com/hc/en-us/article_attachments/360081559211'
    ],
    note: 'Wi-Fi/Control Center transport is verified for Key Light, Key Light Air, Key Light Air MK.2, Key Light Neo and Ring Light. Bluetooth pairing on Key Light Air MK.2 is setup-only and is not counted as a production control transport. LightingAI proprietary network semantics remain locked.'
  },

  Genaray: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'genaray-rgb-bluetooth-capture-v1',
    evidence: [
      'https://www.genaray.com/products/Lights/Panel-LEDs',
      'https://www.genaray.com/products/Lights/Strip-Lights',
      'https://www.genaray.com/products/Lights/Wand-Style-%26-Tube-Lights',
      'https://www.genaray.com/product/21381/Genaray-PX_MOD_3-RGB-Series-Modular-RGB-Pixel-Panel%3C%2Astrong%3E'
    ],
    note: 'Bluetooth app transport is verified only for PX-MOD-3, BL-5X7-RGB, SSL-36-RGB, PX4-RGB, PX2-RGB-C, PX1-RGB and PX2-RGB in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  broncolor: {
    bluetooth: 'not_verified_for_current_catalog',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'broncolor-led-f160-wifi-capture-v1',
    evidence: [
      'https://broncolor.swiss/products/led-f160',
      'https://broncolor.swiss/products/broncontrol-1?variant=1421',
      'https://broncolor.swiss/software'
    ],
    note: 'Wi-Fi/bronControl transport is verified only for LED F160 in this checkpoint. LightingAI proprietary network command/session semantics remain locked.'
  },

  Fotodiox: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'fotodiox-prizmo-stick-512-bluetooth-capture-v1',
    evidence: [
      'https://fotodioxpro.com/products/pzm-st512',
      'https://fotodioxpro.com/blogs/news/the-prizmo-stick-512-our-most-compact-tube-light'
    ],
    note: 'Bluetooth transport is verified only for Prizmo Stick 512 in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  'CHAUVET DJ': {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'chauvet-dj-btair-bluetooth-capture-v1',
    evidence: [
      'https://www.chauvetdj.com/bluetooth/',
      'https://www.chauvetdj.com/products/btair/',
      'https://www.chauvetdj.com/products/category/ils/',
      'https://www.chauvetdj.com/products/category/ils/page/2/',
      'https://www.chauvetdj.com/products/category/washlights/'
    ],
    note: 'Built-in Bluetooth/BTAir transport is verified for the 21 exact CHAUVET DJ BT fixtures cataloged in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  'Lume Cube': {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'lume-cube-lume-control-bluetooth-capture-v1',
    evidence: [
      'https://help.lumecube.com/en-US/what-apps-can-i-use-with-my-lume-cube-products-321666',
      'https://help.lumecube.com/en-US/where-can-i-find-app-support-321667',
      'https://lumecube.com/pages/lume-control-app',
      'https://lumecube.com/products/panel-pro',
      'https://lumecube.com/products/tube-light-mini',
      'https://lumecube.com/products/tube-light-xl',
      'https://lumecube.com/products/lume-cube-xl-60w-rgb-mini-cob-led-light'
    ],
    note: 'Bluetooth/Lume Control transport is verified only for RGB Panel Pro 2.0, RGB Tube Light Mini, RGB Tube Light XL and Lume Cube XL in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  Jinbei: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'jinbei-studio-bluetooth-capture-v1',
    evidence: [
      'https://www.jinbei-deutschland.de/en/blogs/jinbeisphotobox/creative-light-management-made-easy-the-jinbei-studio-app',
      'https://www.jinbei-deutschland.de/en/products/ef-120c-rgb-led-dauerlicht',
      'https://www.jinbei-deutschland.de/en/products/ef-200x-led-dauerlicht',
      'https://www.jinbei-deutschland.de/en/products/jl-600c-rgb-led-dauerlicht'
    ],
    note: 'Bluetooth 5.0/app transport is verified only for EF-120C, EF-200X and JL-600RGB in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  Ikan: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'ikan-idc150-bluetooth-capture-v1',
    evidence: [
      'https://ikancorp.com/Downloads/catalogs/IkanNABCatalog2018.pdf'
    ],
    note: 'Bluetooth transport is verified only for IDC150 in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  Moman: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'moman-pc8-bluetooth-capture-v1',
    evidence: [
      'https://momanx.com/products/led-light-for-dslr-camera-moman-pc8',
      'https://momanx.com/ja/pages/moman-lighting-app',
      'https://momanx.com/it/blogs/moman-ideas/best-lighting-equipment-for-youtube-videos-for-any-budget'
    ],
    note: 'Bluetooth/Moman Light app transport is verified only for PC8 in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  Tolifo: {
    bluetooth: 'not_verified_for_current_catalog',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'tolifo-gk2016-wifi-capture-v1',
    evidence: [
      'https://www.tolifo.com/news/835-cn.html',
      'https://us.tolifo.com/product/product.php?class2=41',
      'https://us.tolifo.com/product/showproduct.php?id=80'
    ],
    note: 'Wi-Fi mobile-app transport is verified only for GK-2016B PRO and GK-2016S PRO in this checkpoint. Separate 2.4G wireless control is not classified as Wi-Fi. LightingAI proprietary command/session semantics remain locked.'
  },

  SOONWELL: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'soonwell-g900-sensei-link-bluetooth-capture-v1',
    evidence: [
      'https://www.soonwell.com/product-page/soonwell-element-series-g900-bi-color-bowens-mount-led-spotlight',
      'https://www.soonwell.com/soonwell-app',
      'https://fcc.report/FCC-ID/2a6flg900/5962642.pdf'
    ],
    note: 'Bluetooth/Sensei Link transport is verified only for G900 in this checkpoint. The separate 2.4G route is not classified as Bluetooth. LightingAI proprietary command/session semantics remain locked.'
  },

  'CAME-TV': {
    bluetooth: 'not_verified_for_current_catalog',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'came-tv-boltzen-wifi-capture-v1',
    evidence: [
      'https://www.came-tv.com/collections/all/products/boltzen-andromeda-slim-tube-led-light-3ft',
      'https://www.came-tv.com/collections/video-lights-1/products/boltzen-andromeda-mkii-slim-tube-led-light',
      'https://www.came-tv.com/collections/special-video-lights/products/boltzen-cassiopeia-folding-rgbdt-50-watt-ring-light-led',
      'https://www.came-tv.com/products/came-tv-boltzen-perseus-bi-color-55w-smd-soft-travel-lights-that-are-stackable-and-ready-to-fly',
      'https://www.came-tv.com/pages/software-downloads'
    ],
    note: 'Built-in Wi-Fi/app control is verified only for the eight explicitly cataloged CAME-TV Boltzen model variants in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  Ulanzi: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'ulanzi-connect-bluetooth-capture-v1',
    evidence: [
      'https://www.ulanzi.com/en-au/pages/ulanzi-app',
      'https://www.ulanzi.com/collections/continuous-lighting/products/120w-v-mount-light-l074cna1',
      'https://www.ulanzi.com/collections/continuous-lighting/products/vl-200bi-200w-video-light-l079cna1',
      'https://www.ulanzi.com/collections/continuous-lighting/products/65w-portable-bi-color-led-video-light-l184',
      'https://www.ulanzi.com/collections/continuous-lighting/products/inflatable-led-air-tube-light-l096'
    ],
    note: 'Bluetooth/Ulanzi Connect transport is verified only for VL-120Bi, VL-120C, VL-200Bi, EC65 and AL60 in this checkpoint. LightingAI proprietary command/session semantics remain locked.'
  },

  NiceFoto: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'nicefoto-tc-bluetooth-mesh-capture-v1',
    evidence: [
      'https://nicefoto.cn/app',
      'https://nicefoto.cn/shuomingshu'
    ],
    note: 'NiceFoto documents standard Mesh Bluetooth control for TC-series multi-color lights. This checkpoint is limited to the eight TC models explicitly listed in the manufacturer manual/download center. LightingAI proprietary command/session semantics remain locked.'
  },

  Lishuai: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'lishuai-lightreel-bluetooth-capture-v1',
    evidence: [
      'https://www.lishuai.com.cn/lishuai/2023/12/19/coolcamp60gp120gshuomingshu.pdf',
      'https://www.lishuai.com.cn/service/zi-liao-xia-zai/',
      'https://www.lishuai.com.cn/'
    ],
    note: 'Bluetooth/Light Reel control is verified only for COOLCAM P60G and P120G in this checkpoint. Separate 2.4G remote control is not classified as Bluetooth. LightingAI proprietary command/session semantics remain locked.'
  },

  PIXEL: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'pixel-app-bluetooth-capture-v1',
    evidence: [
      'https://www.pixelhk.com/en/product/liber-3',
      'https://cdn.pixelhk.com/storage/product/download/manual/liber-3/Liber-RGB-Povket-Video-Light_%2B~.pdf',
      'https://www.pixelhk.com/en/product/p80-Metal-Light-3',
      'https://cdn.pixelhk.com/storage/product/download/manual/p80-Metal-Light-3/P80_Manual.pdf'
    ],
    note: 'Bluetooth app transport is verified only for PIXEL Liber and P80 RGB in this checkpoint. Ambiguous K80/G1S variants remain excluded. LightingAI proprietary command semantics remain locked.'
  },

  YONGNUO: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'yongnuo-app-bluetooth-capture-v1',
    evidence: [
      'https://th.hkyongnuo.com/u_file/2408/05/file/YN150SeriesUserManual.pdf',
      'https://th.hkyongnuo.com/products/yn216-ii',
      'https://www.th.hkyongnuo.com/products/yn300-iii',
      'https://www.th.hkyongnuo.com/products/yn600l-ii',
      'https://www.hkyongnuo.com/app'
    ],
    note: 'Bluetooth app transport is verified only for the explicitly cataloged YONGNUO models. 2.4G RF remains separate. LightingAI proprietary command semantics remain locked.'
  },

  Phottix: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'phottix-lighting-control-bluetooth-capture-v1',
    evidence: [
      'https://www.phottix.com/phottix-app-download/',
      'https://www.phottix.com/product/phottix-nuada-c60a-curved-led-light/',
      'https://www.phottix.com/product/phottix-nuada-s3a-led-light/',
      'https://www.phottix.com/product/phottix-nuada-r3a-led-light/',
      'https://www.phottix.com/product/phottix-kali50ra-rgb-led-light/'
    ],
    note: 'Bluetooth/Phottix Lighting Control app transport is verified only for Nuada C60a, Nuada S3a, Nuada R3a and Kali50Ra. LightingAI proprietary command semantics remain locked.'
  },

  VILTROX: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'viltrox-weeylite-pro-bluetooth-capture-v1',
    evidence: [
      'https://viltrox.com/products/viltrox-ninja-30-30b'
    ],
    note: 'Bluetooth/Weeylite Pro app control is verified only for VILTROX Ninja 30 and Ninja 30B. LightingAI proprietary command semantics remain locked.'
  },

  VELVET: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'transport_verified_model_scoped',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'velvet-evo-wireless-capture-v1',
    secondaryCapturePlanIds: ['velvet-evo-wifi-artnet-capture-v1'],
    secondaryCapturePlanIds: ['velvet-evo-wifi-artnet-capture-v1'],
    evidence: [
      'https://www.velvetlight.tv/velvet-evo/',
      'https://www.velvetlight.tv/serie/evo/',
      'https://www.velvetlight.tv/support/'
    ],
    note: 'VELVET EVO wireless transport is model-scoped: all six cataloged models have Wi-Fi evidence; four also have Bluetooth evidence. LightingAI proprietary command/session semantics remain locked.'
  },

  Kinotehnik: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'kinotehnik-practilite-bluetooth-capture-v1',
    evidence: [
      'https://kinotehnik.com/wp-content/uploads/2020/08/PRACTILITE-602_manual_for_web.pdf',
      'https://kinotehnik.com/632_user_manual.pdf',
      'https://kinotehnik.com/practilite-remote-control-app/'
    ],
    note: 'Bluetooth LE Practilite app control is verified only for Practilite 602 and 632. LightingAI proprietary command semantics remain locked.'
  },

  'Hive Lighting': {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'hive-shot-bluetooth-capture-v1',
    evidence: [
      'https://hivelighting.com/is-control/',
      'https://hivelighting.com/bb-25-cx/',
      'https://hivelighting.com/products/bee-50-c-open-face-omni-color-led-light/',
      'https://hivelighting.com/products/wasp-100-c-led-spot/',
      'https://hivelighting.com/products/wasp-100-cx/',
      'https://hivelighting.com/products/hornet-200-c-open-face-omni-color-led-light/',
      'https://hivelighting.com/products/hornet-200-cx/',
      'https://hivelighting.com/575-c-vs/'
    ],
    note: 'Bluetooth/Hive SHOT control is verified only for the explicitly cataloged Hive Lighting models. LightingAI proprietary command semantics remain locked.'
  },

  Dracast: {
    bluetooth: 'transport_verified_model_scoped',
    wifi: 'not_verified_for_current_catalog',
    commandSpec: 'not_captured_from_public_vendor_docs',
    nextStep: 'capture-plan-required-before-driver',
    capturePlanId: 'dracast-palette-v2-bluetooth-capture-v1',
    evidence: [
      'https://dracobroadcast.com/product/dracast-palette-series-ii-led4000-rgbw-soft-panel/',
      'https://dracobroadcast.com/product/dracast-fresnel-pro-series-ii-led500-bi-color-light/'
    ],
    note: 'Bluetooth/Palette V2 App control is verified only for the explicitly cataloged Dracast models. LightingAI proprietary command semantics remain locked.'
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
