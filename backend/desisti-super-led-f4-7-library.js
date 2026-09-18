// De Sisti Super LED F4.7 family.
// Canonical specifications and accessories are verified from current official De Sisti product pages/datasheets.
const SRC = 'https://www.desisti.it/super-led-f4-7/';
const TD_SHEET = 'https://www.desisti.it/wp-content/uploads/Data-Sheet-Super-LED-F4.7.pdf';
const VW_SHEET = 'https://www.desisti.it/wp-content/uploads/Data-Sheet-Super-LED-F4.7-VW-1-1.pdf';
const VWC_SHEET = 'https://www.desisti.it/wp/wp-content/uploads/2022/04/SUPER-LED-F4.7-VWC-04-2022-.pdf';

export const DESISTI_SUPER_LED_F47_FIXTURES = [
  {
    id: 'desisti-super-led-f4-7-t',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 T',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'Tungsten LED Fresnel',
    outputPowerW: 60,
    powerDrawW: 75,
    powerConsumptionW: { europe230V: 71, america120V: 75 },
    cctK: { min: 3200, max: 3200 },
    colorMode: 'Tungsten',
    cri: 97,
    tlci: 96,
    beamAngleDeg: { min: 12, max: 44 },
    lensDiameterMm: 120,
    control: ['DMX512-A 8-bit dimmer', 'DMX512-A 16-bit dimmer'],
    acInput: '90-250V AC, 50/60Hz, PFC 0.96',
    ipRating: 'IP22',
    weightKg: { manualYoke: 3.5, poleYoke: 5.4 },
    flickerFree: true,
    versions: ['Manual Operated', 'Pole Operated'],
    sourceUrl: TD_SHEET,
    sourceTypeLabel: 'Official De Sisti datasheet'
  },
  {
    id: 'desisti-super-led-f4-7-d',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 D',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'Daylight LED Fresnel',
    outputPowerW: 60,
    powerDrawW: 75,
    powerConsumptionW: { europe230V: 71, america120V: 75 },
    cctK: { min: 5600, max: 5600 },
    colorMode: 'Daylight',
    cri: 96,
    tlci: 97,
    beamAngleDeg: { min: 12, max: 44 },
    lensDiameterMm: 120,
    control: ['DMX512-A 8-bit dimmer', 'DMX512-A 16-bit dimmer'],
    acInput: '90-250V AC, 50/60Hz, PFC 0.96',
    ipRating: 'IP22',
    weightKg: { manualYoke: 3.5, poleYoke: 5.4 },
    flickerFree: true,
    versions: ['Manual Operated', 'Pole Operated'],
    sourceUrl: TD_SHEET,
    sourceTypeLabel: 'Official De Sisti datasheet'
  },
  {
    id: 'desisti-super-led-f4-7-vw',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 VW',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'Vari-White LED Fresnel',
    outputPowerW: 60,
    powerDrawW: 75,
    powerConsumptionW: { europe230V: 71, america120V: 75 },
    cctK: { min: 2800, max: 6600 },
    colorMode: 'Vari-White',
    cri: 95,
    tlci: 96,
    lensDiameterMm: 120,
    control: ['DMX512-A', '3-channel Vari-White control'],
    acInput: '90-250V AC, 50/60Hz',
    ipRating: 'IP22',
    weightKg: { manualYoke: 3.5, poleYoke: 5.4 },
    flickerFree: true,
    versions: ['Manual Operated', 'Pole Operated'],
    sourceUrl: VW_SHEET,
    sourceTypeLabel: 'Official De Sisti datasheet'
  },
  {
    id: 'desisti-super-led-f4-7-vwc',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 VW+C',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'Vari-White + RGBA LED Fresnel',
    outputPowerW: 100,
    powerDrawW: 115,
    cctK: { min: 1750, max: 14500 },
    colorMode: 'Vari-White + RGBA Color',
    cri: 95,
    tlci: 96,
    beamAngleDeg: { min: 12, max: 55 },
    lensDiameterMm: 120,
    control: ['DMX512-A', 'RDM', 'Wireless DMX optional'],
    dmxChannelCounts: [8,9,12,13,39,40],
    acInput: '90-250V AC, 50/60Hz, PFC 0.96',
    ipRating: 'IP20',
    weightKg: { manualYoke: 3.5, poleYoke: 5.4 },
    flickerFree: true,
    versions: ['Manual Operated', 'Pole Operated'],
    sourceUrl: VWC_SHEET,
    sourceTypeLabel: 'Official De Sisti datasheet / current mini catalog'
  }
];

const F47 = DESISTI_SUPER_LED_F47_FIXTURES.map(x => x.id);

export const DESISTI_SUPER_LED_F47_ACCESSORIES = [
  { id:'desisti-305-310-wire-guard', manufacturer:'De Sisti', model:'305.310 Stainless Steel Wire Guard', category:'Protection', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-306-100-barndoor-4', manufacturer:'De Sisti', model:'306.100 Four Leaf Rotating Barndoor', category:'Barn Door', weightKg:0.3, compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-306-200-barndoor-8', manufacturer:'De Sisti', model:'306.200 Eight Way Rotating Barndoor', category:'Barn Door', weightKg:0.4, compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-307-100-color-frame', manufacturer:'De Sisti', model:'307.100 Color Frame', category:'Color Frame', weightKg:0.13, compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-308-100-cone', manufacturer:'De Sisti', model:'308.100 Cone with Two Discs', category:'Light Control', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-309-100-scrim-set', manufacturer:'De Sisti', model:'309.100 Set of Stainless Steel Scrims', category:'Scrim Set', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-309-101-full-single', manufacturer:'De Sisti', model:'309.101 Full Single Scrim', category:'Scrim', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-309-102-full-double', manufacturer:'De Sisti', model:'309.102 Full Double Scrim', category:'Scrim', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-309-103-half-single', manufacturer:'De Sisti', model:'309.103 Half Single Scrim', category:'Scrim', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-309-104-half-double', manufacturer:'De Sisti', model:'309.104 Half Double Scrim', category:'Scrim', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-lt300-100-40-manual-yoke', manufacturer:'De Sisti', model:'LT300.100.40 Manual Operated Stirrup / 16 mm Socket', category:'Yoke', compatibleWith:F47, includedWithFixture:true, sourceUrl:TD_SHEET },
  { id:'desisti-301-110-40-pole-yoke', manufacturer:'De Sisti', model:'301.110.40 Pole Operated Yoke / 28.57 mm Spigot', category:'Yoke', compatibleWith:F47, includedWithFixture:true, sourceUrl:TD_SHEET },
  { id:'desisti-5403-135-powercon-cable', manufacturer:'De Sisti', model:'5403.135 3 m Blue powerCON Power Cable', category:'Power Cable', compatibleWith:F47, includedWithFixture:true, sourceUrl:TD_SHEET },
  { id:'desisti-91-210-c-clamp', manufacturer:'De Sisti', model:'91.210 Aluminum Black C-Clamp', category:'Rigging', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-93-101-c-clamp-16mm', manufacturer:'De Sisti', model:'93.101 Extruded Black C-Clamp with 16 mm Stud', category:'Rigging', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-93-104-c-clamp-m8', manufacturer:'De Sisti', model:'93.104 Extruded Black C-Clamp with M8 Stud', category:'Rigging', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-20-100-safety-cable', manufacturer:'De Sisti', model:'20.100 Safety Cable 800 mm / 4 mm', category:'Safety', compatibleWith:F47, sourceUrl:TD_SHEET },
  { id:'desisti-302-631-kit-case', manufacturer:'De Sisti', model:'302.631 Reinforced Molded Polyethylene Kit Case', category:'Transport', compatibleWith:F47, sourceUrl:TD_SHEET }
];

export const DESISTI_SUPER_LED_F47_SOURCE = {
  family: 'Super LED F4.7',
  manufacturer: 'De Sisti',
  productPage: SRC,
  fixedWhiteDatasheet: TD_SHEET,
  variWhiteDatasheet: VW_SHEET,
  variWhiteColorDatasheet: VWC_SHEET
};
