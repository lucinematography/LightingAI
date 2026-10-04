import { deriveFixtureStructuralClass, deriveFixtureStructuralClassification } from './fixture-structural-classification.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

const cases=[
  [{manufacturer:'Astera',family:'TitanTube',sourceType:'RGBMintAmber LED tube'},'Tube'],
  [{manufacturer:'Astera',family:'PlutoFresnel',sourceType:'Titan LED Engine RGBMintAmber'},'Fresnel'],
  [{manufacturer:'Astera',family:'LunaBulb',sourceType:'Titan LED Engine RGBMintAmber'},'Bulb'],
  [{manufacturer:'Astera',model:'LunaBulb FP7 E27',family:'LunaBulb',sourceType:'Titan LED Engine RGBMintAmber'},'Bulb'],
  [{manufacturer:'Astera',model:'SolaBulb E26',family:'SolaBulb',sourceType:'Titan LED Engine RGBMintAmber'},'Bulb'],
  [{manufacturer:'Aputure',model:'INFINIBAR PB12',sourceType:'RGBWW Pixel Bar'},'Pixel Bar'],
  [{manufacturer:'Aputure',model:'LS 300x',sourceType:'Bi-Color LED COB'},'Spotlight / Monolight'],
  [{manufacturer:'Nanlite',family:'Halo',sourceType:'Bi-Color LED Ring Light'},'Ring Light'],
  [{manufacturer:'Aladdin',family:'MOSAIC',sourceType:'Flexible LED Panel'},'Flexible Panel / Mat'],
  [{manufacturer:'ARRI',family:'SkyPanel X',sourceType:'RGBACL Full-Spectrum LED Panel'},'Panel'],
  [{manufacturer:'Godox',family:'LDX Panel',sourceType:'LED Continuous Light',formFactor:'LED Panel'},'Panel'],
  [{manufacturer:'Nanlite',family:'Creator Lights',sourceType:'RGBW Pocket LED Light'},'Pocket / Handheld']
];
for(const [fixture,expected] of cases){
  expect(deriveFixtureStructuralClass(fixture)===expected,
    JSON.stringify(fixture)+' expected '+expected+' got '+deriveFixtureStructuralClass(fixture));
  const structural=deriveFixtureStructuralClassification(fixture);
  expect(!!structural.basis&&!!structural.evidence,
    'structural classification must expose provenance for '+JSON.stringify(fixture));
  expect(structural.auditOnly===true,
    'structural classification must remain audit-only');
}
expect(deriveFixtureStructuralClass({manufacturer:'Unknown',model:'Mystery Light'})===null,
  'unknown fixture must remain unclassified instead of guessing');

console.log(JSON.stringify({ok:failures.length===0,failures},null,2));
if(failures.length)process.exit(1);
