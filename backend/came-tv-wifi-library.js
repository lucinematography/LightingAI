// CAME-TV exact-model Wi-Fi coverage.
// First-party CAME-TV product pages only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  andromeda3:'https://www.came-tv.com/collections/all/products/boltzen-andromeda-slim-tube-led-light-3ft',
  andromedaMk2:'https://www.came-tv.com/collections/video-lights-1/products/boltzen-andromeda-mkii-slim-tube-led-light',
  cassiopeia:'https://www.came-tv.com/collections/special-video-lights/products/boltzen-cassiopeia-folding-rgbdt-50-watt-ring-light-led',
  perseus1800:'https://www.came-tv.com/products/came-tv-boltzen-perseus-bi-color-55w-smd-soft-travel-lights-that-are-stackable-and-ready-to-fly',
  app:'https://www.came-tv.com/pages/software-downloads'
};

function wifiControl(sourceUrl){
  return {
    wired:[],
    wireless:['Wi-Fi via CAME-TV BOLTZEN APP'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'CAME-TV documents built-in Wi-Fi/app control, but LightingAI Wi-Fi command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,SRC.app],
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'CAME-TV BOLTZEN Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.app],
        note:'First-party CAME-TV documentation explicitly confirms built-in Wi-Fi or application control via Wi-Fi for this exact model/variant. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,colorMode,powerDrawW){
  const row={
    id,
    manufacturer:'CAME-TV',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    colorMode,
    control:wifiControl(sourceUrl),
    sourceUrl
  };
  if(Number.isFinite(powerDrawW)) row.powerDrawW=powerDrawW;
  return row;
}

export const CAME_TV_WIFI_FIXTURES=[
  fixture('came-tv-andromeda-3ft-d','Andromeda 3FT-D','Boltzen Andromeda','Daylight LED Tube','Tube',SRC.andromeda3,'Daylight'),
  fixture('came-tv-andromeda-3ft-b','Andromeda 3FT-B','Boltzen Andromeda','Bi-Color LED Tube','Tube',SRC.andromeda3,'Bi-Color'),
  fixture('came-tv-andromeda-3ft-r','Andromeda 3FT-R','Boltzen Andromeda','RGBDT LED Tube','Tube',SRC.andromeda3,'RGBDT'),
  fixture('came-tv-andromeda-mkii-2ftr','Andromeda MKII 2FTR-MK2','Boltzen Andromeda MKII','RGBDT LED Tube','Tube',SRC.andromedaMk2,'RGBDT'),
  fixture('came-tv-andromeda-mkii-3ftr','Andromeda MKII 3FTR-MK2','Boltzen Andromeda MKII','RGBDT LED Tube','Tube',SRC.andromedaMk2,'RGBDT'),
  fixture('came-tv-andromeda-mkii-4ftr','Andromeda MKII 4FTR-MK2','Boltzen Andromeda MKII','RGBDT LED Tube','Tube',SRC.andromedaMk2,'RGBDT'),
  fixture('came-tv-cassiopeia-c50','Cassiopeia C-50','Boltzen Cassiopeia','RGBDT LED Ring Light','Ring Light',SRC.cassiopeia,'RGBDT',50),
  fixture('came-tv-perseus-p1800b','Perseus P-1800B','Boltzen Perseus','Bi-Color SMD LED Panel','Panel',SRC.perseus1800,'Bi-Color')
];
