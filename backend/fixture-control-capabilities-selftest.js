import {
  deriveFixtureControlCapabilities,
  deriveVerifiedControlCapabilities,
  buildFixtureControlCapabilityReport
} from './fixture-control-capabilities.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

const bi=deriveFixtureControlCapabilities({
  colorMode:'Bi-Color',
  cctK:{min:2700,max:6500},
  dmxModes:[{verified:true,controls:[{key:'dimmer'},{key:'cct'}]}]
});
expect(bi.dim.supported===true,'Bi-Color DIM should be supported from verified dimmer');
expect(bi.cct.supported===true,'Bi-Color CCT should be supported');
expect(bi.color.supported===false,'Bi-Color must not be promoted to COLOR');

const rgb=deriveFixtureControlCapabilities({
  colorMode:'RGBWW',
  dmxModes:[{verified:true,controls:[{key:'dimmer'},{key:'red'},{key:'green'},{key:'blue'}]}]
});
expect(rgb.dim.supported===true,'RGB DIM should be supported');
expect(rgb.color.supported===true,'RGB color capability missing');

const fx=deriveFixtureControlCapabilities({
  colorMode:'RGBACL Full Spectrum',
  dmxModes:[{verified:true,controls:[{key:'effect'},{key:'fxSpeed'}]}]
});
expect(fx.color.supported===true,'Full Spectrum color capability missing');
expect(fx.fx.supported===true,'FX capability missing from verified effect controls');

const unverified=deriveFixtureControlCapabilities({
  colorMode:'RGB',
  dmxModes:[{verified:false,controls:[{key:'dimmer'},{key:'effect'}]}]
});
expect(unverified.dim.supported===false,'Unverified DMX mode must not prove DIM');
expect(unverified.fx.supported===false,'Unverified DMX mode must not prove FX');
expect(unverified.color.supported===true,'Explicit RGB engine may prove COLOR independently of DMX semantics');


const officialAppEvidence=deriveFixtureControlCapabilities({
  colorMode:'Bi-Color',
  cctK:{min:2700,max:6500},
  control:{
    capabilityVerification:{
      dim:{verified:true,scope:'official-app-capability-only'},
      fx:{verified:true,scope:'official-app-capability-only'}
    }
  }
});
expect(officialAppEvidence.dim.supported===true,'Verified official-app DIM capability must be accepted');
expect(officialAppEvidence.fx.supported===true,'Verified official-app FX capability must be accepted');
expect(officialAppEvidence.dim.evidence.includes('verified-official-app-capability'),'Official-app DIM evidence marker missing');

const unverifiedAppEvidence=deriveFixtureControlCapabilities({
  control:{capabilityVerification:{dim:{verified:false},fx:{verified:false}}}
});
expect(unverifiedAppEvidence.dim.supported===false,'Unverified app metadata must not prove DIM');
expect(unverifiedAppEvidence.fx.supported===false,'Unverified app metadata must not prove FX');


const appVerified=deriveFixtureControlCapabilities({
  colorMode:'Bi-Color',
  cctK:{min:2700,max:6500},
  control:{
    capabilityVerification:{
      dim:{verified:true,scope:'official-app-capability-only'},
      fx:{verified:true,scope:'official-app-capability-only'}
    }
  }
});
expect(appVerified.dim.supported===true,'Official app capability verification should prove DIM feature availability');
expect(appVerified.fx.supported===true,'Official app capability verification should prove FX feature availability');
expect(appVerified.dim.evidence.includes('verified-official-app-capability'),'DIM app capability evidence marker missing');
expect(appVerified.fx.evidence.includes('verified-official-app-capability'),'FX app capability evidence marker missing');


const physicalOnly=deriveVerifiedControlCapabilities({
  colorMode:'RGBWW',
  cctK:{min:2000,max:10000},
  control:{}
});
expect(physicalOnly.cct.supported===false,'Catalog CCT range must not prove verified CCT control');
expect(physicalOnly.color.supported===false,'Catalog RGB engine must not prove verified COLOR control');

const verifiedAppOnly=deriveVerifiedControlCapabilities({
  colorMode:'RGBWW',
  cctK:{min:2000,max:10000},
  control:{
    capabilityVerification:{
      cct:{verified:true,scope:'official-app-capability-only'},
      color:{verified:true,scope:'official-app-capability-only'}
    }
  }
});
expect(verifiedAppOnly.cct.supported===true,'Verified app CCT evidence must prove verified CCT control');
expect(verifiedAppOnly.color.supported===true,'Verified app COLOR evidence must prove verified COLOR control');

const report=buildFixtureControlCapabilityReport();
expect(report.totals.fixtures===1094,'fixture total changed from verified catalog');
expect(report.totals.cct>0,'CCT capability audit unexpectedly empty');
expect(report.totals.color>0,'COLOR capability audit unexpectedly empty');
expect(report.totals.dim>0,'DIM capability audit unexpectedly empty');
expect(report.totals.fx>0,'FX capability audit unexpectedly empty');
expect(Object.keys(report.byManufacturer).length===94,'manufacturer total changed from verified catalog');

console.log(JSON.stringify({ok:failures.length===0,totals:report.totals,byManufacturer:report.byManufacturer,failures},null,2));
if(failures.length) process.exit(1);
