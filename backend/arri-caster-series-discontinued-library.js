// Discontinued ARRI Caster Series LED soft lights and verified shared accessories.
// Official ARRI Caster Series pages/manual. Series and related kits/accessories discontinued end of 2019.
const SRC='https://www.arri.com/en/lighting/led-spotlights/discontinued/caster-series';
const MANUAL='https://www.arri.com/resource/blob/31158/de6629cdb138a59ca92684f4e9b7fa59/arri-caster-user-manual-en-apr2015-l02583-data.pdf';

export const ARRI_CASTER_SERIES_DISCONTINUED_FIXTURES=[
 {id:'arri-broadcaster-2-plus',manufacturer:'ARRI',model:'BroadCaster 2 Plus',family:'Caster Series',category:'Light',status:'Discontinued',sourceType:'Tuneable White LED soft light',opticalSystem:'Prismatic Homogenizing Lens',beamAngle:'63° half peak angle',powerW:35,cct:'2800-6500 K',cri:'>94',greenMagenta:'Full Minusgreen to Full Plusgreen',dimming:'0-100%',mount:'3/8 in thread',voltage:'11-36 V DC',connector:'PowerDMX 4-Pin XLR',ipRating:'IP20',control:{wired:['5-Pin DMX In/Thru'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC+'/broadcaster-2-plus'},
 {id:'arri-locaster-2-plus',manufacturer:'ARRI',model:'LoCaster 2 Plus',family:'Caster Series',category:'Light',status:'Discontinued',sourceType:'Tuneable White LED soft light',opticalSystem:'Prismatic Homogenizing Lens',beamAngle:'63° half peak angle',powerW:35,cct:'2800-6500 K',cri:'>94',greenMagenta:'Full Minusgreen to Full Plusgreen',dimming:'0-100%',mount:'3/8 in thread',voltage:'11-36 V DC',connector:'PowerDMX 4-Pin XLR',control:{wired:['On-board Controller'],wireless:[],builtInWirelessDMX:false},ipRating:'IP20',orderCode:'L1.0001329',sourceUrl:SRC+'/locaster-2-plus'}
];

const BOTH=['arri-broadcaster-2-plus','arri-locaster-2-plus'];
export const ARRI_CASTER_SERIES_DISCONTINUED_ACCESSORIES=[
 {id:'arri-caster-power-supply-60w',manufacturer:'ARRI',model:'Caster Series Power Supply 24 V DC / 60 W',orderCode:'L2.30083.0',category:'Power',compatibleWith:BOTH,sourceUrl:MANUAL},
 {id:'arri-caster-powerdmx-extension-3m',manufacturer:'ARRI',model:'PowerDMX Extension Cable XLR 4-Pin 3 m',orderCode:'L2.30081.0',category:'Cable',compatibleWith:BOTH,sourceUrl:MANUAL},
 {id:'arri-caster-stirrup-battery',manufacturer:'ARRI',model:'Caster Stirrup with Battery Pack Attachment',orderCode:'L2.30089.0',category:'Mounting',compatibleWith:BOTH,sourceUrl:MANUAL},
 {id:'arri-caster-2-leaf-barndoor',manufacturer:'ARRI',model:'2-leaf Barndoor',orderCode:'L2.30061.0',category:'Barndoor',compatibleWith:BOTH,sourceUrl:MANUAL},
 {id:'arri-caster-filter-frame',manufacturer:'ARRI',model:'Filter Frame',orderCode:'L2.30059.0',category:'Filter Frame',compatibleWith:BOTH,sourceUrl:MANUAL},
 {id:'arri-locaster-case',manufacturer:'ARRI',model:'LoCaster Case',orderCode:'L2.30099.0',category:'Case',compatibleWith:['arri-locaster-2-plus'],sourceUrl:MANUAL}
];
