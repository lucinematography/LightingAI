// Astera QuikBeam compact zoomable LED spotlight.
// Canonical fixture and accessory references from the Astera QuikBeam documentation.
const SRC = 'https://astera-led.com/quikbeam/';

export const ASTERA_QUIKBEAM_FIXTURES = [
  {
    id: 'astera-quikbeam',
    manufacturer: 'Astera',
    model: 'QuikBeam',
    family: 'QuikBeam',
    category: 'Light',
    sourceType: 'Titan LED Engine RGBMintAmber',
    totalLedPowerW: 20,
    powerDrawW: 40,
    colorMode: 'RGBMintAmber',
    cri: 96,
    beamAngleDeg: { min: 13, max: 60 },
    batteryPowered: true,
    batteryRuntimeHours: { max: 20, maxBrightness: 1.33 },
    chargingTimeHours: 2.67,
    dcInput: 'PoE++ (802.3bt)',
    ipRating: 'IP65',
    weightKg: 1.617,
    dimensionsMm: { length: 241, width: 174, height: 125 },
    control: {
      wired: ['Art-Net', 'sACN'],
      wireless: ['AsteraApp', 'CRMX', 'UHF', 'Bluetooth', 'WiFi'],
      builtInCRMX: true,
      builtInBTB: true,
      directLightingAI: ['Art-Net', 'sACN'],
      externalInterfaceRequired: ['CRMX transmitter for CRMX control'],
      unavailableDirectProtocols: ['AsteraApp Bluetooth/UHF/Wi-Fi protocol is not publicly documented for third-party direct control'],
      sourceUrls: [
        'https://astera-led.com/quikbeam/',
        'https://update.astera-led.com/firmwares/current/release_notes.html'
      ]
    },
    sourceUrl: SRC
  }
];

const QUIKBEAM = ['astera-quikbeam'];

export const ASTERA_QUIKBEAM_ACCESSORIES = [
  { id: 'astera-quikbeam-qbk', manufacturer: 'Astera', model: 'AST-QUKBM-QBK QuikBrick Swappable Battery', category: 'Power', compatibleWith: QUIKBEAM, sourceUrl: SRC },
  { id: 'astera-quikbeam-qbk-cr', manufacturer: 'Astera', model: 'AST-QUKBM-QBK-CR QuikBrick Cover', category: 'Protection', compatibleWith: QUIKBEAM, sourceUrl: SRC },
  { id: 'astera-quikbeam-bd', manufacturer: 'Astera', model: 'AST-QUKBM-BD Barndoor', category: 'Light Control', compatibleWith: QUIKBEAM, sourceUrl: SRC },
  { id: 'astera-quikbeam-re', manufacturer: 'Astera', model: 'AST-QUKBM-RE Rotatable Elliptical Filter 17° × 46°', category: 'Light Control', compatibleWith: QUIKBEAM, sourceUrl: SRC },
  { id: 'astera-quikbeam-es', manufacturer: 'Astera', model: 'AST-QUKBM-ES EdgeSoftener Filter', category: 'Light Control', compatibleWith: QUIKBEAM, sourceUrl: SRC },
  { id: 'astera-quikbeam-chrdk-qbk', manufacturer: 'Astera', model: 'AST-QUKBM-CHRDK-QBK ChargingDock', category: 'Power', compatibleWith: QUIKBEAM, sourceUrl: SRC },
  { id: 'astera-tsp-quikbeam', manufacturer: 'Astera', model: 'AST-TSP TrackSpigot 28/16', category: 'Mounting', compatibleWith: QUIKBEAM, sourceUrl: SRC },
  { id: 'astera-tpn-quikbeam', manufacturer: 'Astera', model: 'AST-TPN TrackPin', category: 'Mounting', compatibleWith: QUIKBEAM, sourceUrl: SRC },
  { id: 'astera-eblt-1-4-quikbeam', manufacturer: 'Astera', model: 'AST-EBLT-1/4 Eye Bolt 1/4″', category: 'Safety', compatibleWith: QUIKBEAM, sourceUrl: SRC },
  { id: 'astera-netbx-quikbeam', manufacturer: 'Astera', model: 'AST-NETBX NetBox', category: 'Control / Data', compatibleWith: QUIKBEAM, sourceUrl: SRC }
];
