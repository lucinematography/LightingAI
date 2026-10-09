// Astera TitanTube FP1 current wireless LED tube.
// Official product source. Keep accessories out until each compatibility link is verified.
const SRC = 'https://astera-led.com/products/titantube/';
const MANUAL = 'https://s3.amazonaws.com/lenspro-media-prod/manuals/2024/11/11/Titan_Manual_1.pdf';

export const ASTERA_TITANTUBE_FIXTURES = [
  {
    id: 'astera-titantube-fp1',
    manufacturer: 'Astera',
    model: 'TitanTube FP1',
    family: 'TitanTube',
    category: 'Light',
    sourceType: 'RGBMintAmber LED tube',
    powerDrawW: 48,
    colorMode: 'RGBMintAmber',
    cri: 96,
    tlci: 96,
    pixels: 16,
    ipRating: 'IP65',
    batteryPowered: true,
    control: {
      wireless: ['AsteraApp via AsteraBox/UHF', 'Wireless DMX', 'CRMX receiver', 'Astera UHF', 'Bluetooth on FP1-BTB variant'],
      wired: ['DMX via PowerBox', 'Art-Net via PowerBox', 'sACN via PowerBox', 'DMX via FP1-PWB / FP3-DTL', 'Art-Net via FP3-DTL', 'sACN via FP3-DTL'],
      builtInCRMX: true,
      builtInBTBVariant: 'FP1-BTB',
      directLightingAI: ['Art-Net via PowerBox', 'sACN via PowerBox', 'Art-Net via FP3-DTL', 'sACN via FP3-DTL'],
      standardRoutes: [
        {
          id: 'astera-titan-wired-network',
          input: ['Art-Net', 'sACN'],
          interface: 'Astera FP3 DataLink',
          output: 'DMX over Astera power/data cable',
          verified: true,
          sourceUrl: 'https://astera-led.com/wp-content/uploads/FP3_DataLink_Datasheet_V2-1.pdf'
        },
        {
          id: 'astera-titan-wireless-crmx',
          input: ['DMX512'],
          interface: 'AsteraBox ART7',
          output: 'CRMX to TitanTube receiver',
          verified: true,
          sourceUrl: 'https://astera-led.com/wp-content/uploads/ART7_AsteraBox_Datasheet_V3.pdf'
        }
      ],
      externalInterfaceRequired: [
        'Astera PowerBox for wired DMX, Art-Net or sACN control',
        'Wireless DMX transmitter for wireless DMX control',
        'AsteraBox for AsteraApp/UHF control',
        'Astera FP3 DataLink for direct Art-Net/sACN wired control',
        'CRMX transmitter for wireless DMX control',
        'AsteraBox only for AsteraApp/UHF vendor control'
      ],
      unavailableDirectProtocols: [
        'AsteraApp/UHF protocol is not publicly documented for third-party direct control',
        'AsteraApp Bluetooth/UHF protocol is proprietary and is not used as a production LightingAI transport'
      ],
      sourceUrls: [
        'https://astera-led.com/products/titantube/',
        'https://astera-led.com/wp-content/uploads/FP3_DataLink_Datasheet_V2-1.pdf',
        'https://astera-led.com/wp-content/uploads/ART7_AsteraBox_Datasheet_V3.pdf',
        'https://update.astera-led.com/firmwares/current/release_notes.html'
      ]
    },
    dmxModes: [{
      name: 'Profile 4 DIM RGB 4ch',
      channels: 4,
      verified: true,
      sourceUrl: 'https://www.nashvillegrip.com/uploads/9/8/7/3/98739938/fp1_fp1-btb_titan_tube_dmx_profiles_v2.pdf',
      controls: [
        { key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'red', label: 'Red', channel: 2, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'green', label: 'Green', channel: 3, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'blue', label: 'Blue', channel: 4, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 }
      ]
    }],
    sourceUrl: SRC
  }
];

const TITAN = ['astera-titantube-fp1'];
const TITAN_AND_LUNABULB = [...TITAN, 'astera-lunabulb-fp7-e26', 'astera-lunabulb-fp7-e27', 'astera-lunabulb-fp7-b22'];
const TITAN_AND_HELIOS = ['astera-titantube-fp1', 'astera-heliostube-fp2-btb'];
const TUBE_STAND_FAMILY = [...TITAN_AND_HELIOS, 'astera-ax1-pixeltube'];
const ALL_THREE_TUBES = ['astera-titantube-fp1', 'astera-heliostube-fp2-btb', 'astera-hyperiontube-fp3', 'astera-ax1-pixeltube'];

export const ASTERA_TITANTUBE_ACCESSORIES = [
  { id: 'astera-tube-floorstand', manufacturer: 'Astera', model: 'AX1-STD TubeStand', category: 'Stand', mount: 'M5 thread', compatibleWith: TUBE_STAND_FAMILY, includedWithFixture: true, sourceUrl: MANUAL },
  { id: 'astera-tube-metal-holder', manufacturer: 'Astera', model: 'AX1-H TubeHolder', category: 'Mount', mount: '1/4-20 and M5 threads', compatibleWith: ALL_THREE_TUBES, includedWithFixture: true, sourceUrl: MANUAL },
  { id: 'astera-ax1-blt', manufacturer: 'Astera', model: 'AX1-BLT Double-ended Spigot', category: 'Mount Adapter', mount: '1/4-20 to clamp', compatibleWith: ALL_THREE_TUBES, sourceUrl: MANUAL },
  { id: 'astera-tube-wing-plate', manufacturer: 'Astera', model: 'AX1-WP WingPlate', category: 'Multi-light Mount', compatibleWith: ALL_THREE_TUBES, sourceUrl: MANUAL },
  { id: 'astera-tube-m5-eyebolt', manufacturer: 'Astera', model: 'FP1-EBLT Eye Bolt', category: 'Safety / Suspension', mount: 'M5 thread', compatibleWith: ALL_THREE_TUBES, includedWithFixture: true, sourceUrl: MANUAL },
  { id: 'astera-fp1-chr', manufacturer: 'Astera', model: 'FP1-CHR Individual Charger', category: 'Charger', compatibleWith: TITAN_AND_LUNABULB, sourceUrl: MANUAL },
  { id: 'astera-fp1-pwb', manufacturer: 'Astera', model: 'FP1-PWB PowerBox', category: 'Power / DMX Interface', compatibleWith: TITAN, sourceUrl: MANUAL },
  { id: 'astera-fp3-dtl', manufacturer: 'Astera', model: 'FP3 DataLink', category: 'Art-Net / sACN / DMX Interface', compatibleWith: TITAN, sourceUrl: 'https://astera-led.com/wp-content/uploads/FP3_DataLink_Datasheet_V2-1.pdf' },
  { id: 'astera-art7', manufacturer: 'Astera', model: 'ART7 AsteraBox', category: 'DMX / CRMX / AsteraApp Interface', compatibleWith: TITAN, sourceUrl: 'https://astera-led.com/wp-content/uploads/ART7_AsteraBox_Datasheet_V3.pdf' },
  { id: 'astera-fp1-pwb-cab-5', manufacturer: 'Astera', model: 'FP1-PWB-CAB-5 Power/Data Combination Cable 5 m', category: 'Power / Data Cable', compatibleWith: TITAN, sourceUrl: MANUAL },
  { id: 'astera-fp1-pwb-cab-10', manufacturer: 'Astera', model: 'FP1-PWB-CAB-10 Power/Data Combination Cable 10 m', category: 'Power / Data Cable', compatibleWith: TITAN, sourceUrl: MANUAL },
  { id: 'astera-fp1-pwb-cab-15', manufacturer: 'Astera', model: 'FP1-PWB-CAB-15 Power/Data Combination Cable 15 m', category: 'Power / Data Cable', compatibleWith: TITAN, sourceUrl: MANUAL }
];
