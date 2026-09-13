// Discontinued ARRI L-Series DT & TT LED Fresnels with model-compatible light-control accessories.
// Canonical fixture source: official ARRI discontinued L-Series DT & TT pages.
const SRC='https://www.arri.com/en/lighting/led-spotlights/discontinued/l-series-dt-tt';

const wired=['5-Pin DMX In/Thru','RDM','On-board Controller'];
const control={wired,wireless:[],builtInWirelessDMX:false};

export const ARRI_L_SERIES_DT_TT_DISCONTINUED_FIXTURES=[
 {id:'arri-l5-dt',manufacturer:'ARRI',model:'L5-DT',family:'L-Series DT & TT',category:'Light',status:'Discontinued',sourceType:'Tuneable Daylight LED Fresnel',lens:'137 mm / 5 in Fresnel',cct:'5000-6500 K',control,sourceUrl:SRC+'/l5-dt'},
 {id:'arri-l5-tt',manufacturer:'ARRI',model:'L5-TT',family:'L-Series DT & TT',category:'Light',status:'Discontinued',sourceType:'Tuneable Tungsten LED Fresnel',lens:'137 mm / 5 in Fresnel',control,sourceUrl:SRC+'/l5-tt'},
 {id:'arri-l7-dt',manufacturer:'ARRI',model:'L7-DT',family:'L-Series DT & TT',category:'Light',status:'Discontinued',sourceType:'Tuneable Daylight LED Fresnel',lens:'175 mm / 7 in Fresnel',cct:'5000-6500 K',control,sourceUrl:SRC+'/l7-dt'},
 {id:'arri-l7-tt',manufacturer:'ARRI',model:'L7-TT',family:'L-Series DT & TT',category:'Light',status:'Discontinued',sourceType:'Tuneable Tungsten LED Fresnel',lens:'175 mm / 7 in Fresnel',control,sourceUrl:SRC+'/l7-tt'},
 {id:'arri-l10-dt',manufacturer:'ARRI',model:'L10-DT',family:'L-Series DT & TT',category:'Light',status:'Discontinued',sourceType:'Tuneable Daylight LED Fresnel',lens:'250 mm / 10 in Fresnel',cct:'5000-6500 K',control,sourceUrl:SRC+'/l10-dt'},
 {id:'arri-l10-tt',manufacturer:'ARRI',model:'L10-TT',family:'L-Series DT & TT',category:'Light',status:'Discontinued',sourceType:'Tuneable Tungsten LED Fresnel',lens:'250 mm / 10 in Fresnel',control,sourceUrl:SRC+'/l10-tt'}
];

const L5=['arri-l5-dt','arri-l5-tt'];
const L7=['arri-l7-dt','arri-l7-tt'];
const L10=['arri-l10-dt','arri-l10-tt'];

export const ARRI_L_SERIES_DT_TT_DISCONTINUED_ACCESSORIES=[
 {id:'arri-l5-dt-tt-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor 168 mm / 6.6 in',orderCode:'L2.79470.0',category:'Barndoor',compatibleWith:L5,sourceUrl:SRC+'/l5-dt'},
 {id:'arri-l5-dt-tt-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor 168 mm / 6.6 in',orderCode:'L2.79500.0',category:'Barndoor',compatibleWith:L5,sourceUrl:SRC+'/l5-dt'},
 {id:'arri-l5-dt-tt-filter-frame',manufacturer:'ARRI',model:'Filter Frame 168 mm / 6.6 in',orderCode:'L2.79490.0',category:'Filter Frame',compatibleWith:L5,sourceUrl:SRC+'/l5-dt'},
 {id:'arri-l7-dt-tt-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 197 mm / 7.8 in',orderCode:'L2.39670.0',category:'Barndoor',compatibleWith:L7,sourceUrl:SRC+'/l7-dt'},
 {id:'arri-l7-dt-tt-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor True Blue 197 mm / 7.8 in',orderCode:'L2.39700.0',category:'Barndoor',compatibleWith:L7,sourceUrl:SRC+'/l7-dt'},
 {id:'arri-l7-dt-tt-filter-frame',manufacturer:'ARRI',model:'Filter Frame 197 mm / 7.8 in',orderCode:'L2.79690.0',category:'Filter Frame',compatibleWith:L7,sourceUrl:SRC+'/l7-dt'},
 {id:'arri-l10-dt-tt-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor 344 mm / 13.5 in',orderCode:'L2.40950.0',category:'Barndoor',compatibleWith:L10,sourceUrl:SRC+'/l10-dt'},
 {id:'arri-l10-dt-tt-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor 344 mm / 13.5 in',orderCode:'L2.40960.0',category:'Barndoor',compatibleWith:L10,sourceUrl:SRC+'/l10-dt'},
 {id:'arri-l10-dt-tt-filter-frame',manufacturer:'ARRI',model:'Filter Frame 330 mm / 13.0 in',orderCode:'L2.80970.0',category:'Filter Frame',compatibleWith:L10,sourceUrl:SRC+'/l10-dt'},
 {id:'arri-l10-dt-tt-snoot',manufacturer:'ARRI',model:'Snoot with variable aperture 344 mm / 13.5 in',orderCode:'L2.80975.0',category:'Snoot',compatibleWith:L10,sourceUrl:SRC+'/l10-dt'}
];
