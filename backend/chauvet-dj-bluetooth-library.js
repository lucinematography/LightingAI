// CHAUVET DJ exact-model Bluetooth coverage.
// First-party CHAUVET DJ Bluetooth/BTAir and product evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  btair:'https://www.chauvetdj.com/bluetooth/',
  btairApp:'https://www.chauvetdj.com/products/btair/',
  ezQ6Ils:'https://www.chauvetdj.com/products/ezlink-par-q6bt-ils/',
  ezQ4Ils:'https://www.chauvetdj.com/products/ezlink-par-q4bt-ils/',
  ezStripIls:'https://www.chauvetdj.com/products/ezlink-strip-q6bt-ils/',
  ezWedgeIls:'https://www.chauvetdj.com/products/ezlink-wedge-q3bt-ils/',
  barQuadIls:'https://www.chauvetdj.com/products/4bar-lt-quadbt-ils/',
  barLtIls:'https://www.chauvetdj.com/products/4bar-ltbt-ils/',
  colorQ3Ils:'https://www.chauvetdj.com/products/colorband-q3bt-ils/',
  colorT3Ils:'https://www.chauvetdj.com/products/colorband-t3bt-ils/',
  slimQ12Ils:'https://www.chauvetdj.com/products/slimpar-q12bt-ils/',
  slimT12Ils:'https://www.chauvetdj.com/products/slimpar-t12bt-ils/',
  slimT6:'https://www.chauvetdj.com/products/slimpar-t6bt/',
  slimT6Ils:'https://www.chauvetdj.com/products/slimpar-t6bt-ils/'
};

function bluetoothControl(sourceUrl){
  const sources=[sourceUrl,SRC.btair,SRC.btairApp];
  return {
    wired:[],
    wireless:['Bluetooth 4.2+ via CHAUVET DJ BTAir'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'CHAUVET DJ documents built-in Bluetooth/BTAir control for this exact model, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'CHAUVET DJ BTAir Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party CHAUVET DJ documentation confirms built-in Bluetooth and BTAir-compatible control for this exact model. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl=SRC.btair){
  return {
    id,
    manufacturer:'CHAUVET DJ',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const CHAUVET_DJ_BLUETOOTH_FIXTURES=[
  // Official BTAir Bluetooth fixture list.
  fixture('chauvet-colorband-q3bt','COLORband Q3BT','COLORband','RGBA Linear Wash','Bar'),
  fixture('chauvet-colorband-t3bt','COLORband T3BT','COLORband','RGB Linear Wash','Bar'),
  fixture('chauvet-ezlink-par-q1bt','EZLink Par Q1BT','EZLink','RGBA Wash Light','PAR'),
  fixture('chauvet-ezlink-par-q4bt','EZLink Par Q4BT','EZLink','RGBA Wash Light','PAR'),
  fixture('chauvet-ezlink-strip-q6bt','EZLink Strip Q6BT','EZLink','RGBA Linear Wash','Bar'),
  fixture('chauvet-ezlink-par-q6bt','EZLink Par Q6BT','EZLink','RGBA Wash Light','PAR'),
  fixture('chauvet-4bar-ltbt','4BAR LTBT','4BAR','RGB Multi-Head Wash System','Bar System'),
  fixture('chauvet-4bar-lt-quadbt','4BAR LT QuadBT','4BAR','RGBA Multi-Head Wash System','Bar System'),
  fixture('chauvet-slimpar-t12bt','SlimPAR T12BT','SlimPAR','RGB Wash Light','PAR'),
  fixture('chauvet-slimpar-t6bt','SlimPAR T6BT','SlimPAR','RGB Wash Light','PAR',SRC.slimT6),
  fixture('chauvet-slimpar-q12bt','SlimPAR Q12BT','SlimPAR','RGBA Wash Light','PAR'),

  // Current ILS variants with exact first-party Bluetooth product evidence.
  fixture('chauvet-ezlink-par-q6bt-ils','EZLink Par Q6BT ILS','EZLink ILS','RGBA Wash Light','PAR',SRC.ezQ6Ils),
  fixture('chauvet-ezlink-par-q4bt-ils','EZLink Par Q4BT ILS','EZLink ILS','RGBA Wash Light','PAR',SRC.ezQ4Ils),
  fixture('chauvet-ezlink-strip-q6bt-ils','EZLink Strip Q6BT ILS','EZLink ILS','RGBA Linear Wash','Bar',SRC.ezStripIls),
  fixture('chauvet-ezlink-wedge-q3bt-ils','EZLink Wedge Q3BT ILS','EZLink ILS','RGBA Wedge Wash','Wedge',SRC.ezWedgeIls),
  fixture('chauvet-4bar-lt-quadbt-ils','4BAR LT QuadBT ILS','4BAR ILS','RGBA Multi-Head Wash System','Bar System',SRC.barQuadIls),
  fixture('chauvet-4bar-ltbt-ils','4BAR LTBT ILS','4BAR ILS','RGB Multi-Head Wash System','Bar System',SRC.barLtIls),
  fixture('chauvet-colorband-q3bt-ils','COLORband Q3BT ILS','COLORband ILS','RGBA Linear Wash','Bar',SRC.colorQ3Ils),
  fixture('chauvet-colorband-t3bt-ils','COLORband T3BT ILS','COLORband ILS','RGB Linear Wash','Bar',SRC.colorT3Ils),
  fixture('chauvet-slimpar-q12bt-ils','SlimPAR Q12BT ILS','SlimPAR ILS','RGBA Wash Light','PAR',SRC.slimQ12Ils),
  fixture('chauvet-slimpar-t12bt-ils','SlimPAR T12BT ILS','SlimPAR ILS','RGB Wash Light','PAR',SRC.slimT12Ils),
  fixture('chauvet-slimpar-t6bt-ils','SlimPAR T6BT ILS','SlimPAR ILS','RGB Wash Light','PAR',SRC.slimT6Ils)
];
