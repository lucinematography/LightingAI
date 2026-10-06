function clean(v){return String(v??'').trim()}

function classifyText(value,manufacturer){
  const text=clean(value).toLowerCase();
  if(!text) return null;

  if(/fresnel/.test(text)) return 'Fresnel';
  if(/\b(tube|pixeltube|pavotube)\b/.test(text)) return 'Tube';
  if(/bulb/.test(text)) return 'Bulb';
  if(/ring light|\bhalo\b/.test(text)) return 'Ring Light';
  if(/pixel\s*bar|infinibar|light\s*bar/.test(text)) return 'Pixel Bar';
  if(/linear\s*wash|\bstrip\b|\bcolorband\b/.test(text)) return 'Linear Wash / Bar';
  if(/linear\s*key\s*light|streaming\s*key\s*light/.test(text)) return 'Linear Key Light';
  if(/multi-head\s*wash|\b4bar\b/.test(text)) return 'Multi-Head Wash System';
  if(/wedge\s*wash|\bwedge\b/.test(text)) return 'Wedge / Uplight';
  if(/pixelbrick|\bbrick\b/.test(text)) return 'Brick / Compact Pixel';
  if(/flexible.*panel|foldable.*panel|\bfabric\b|\bmat\b|\bmosaic\b/.test(text)) return 'Flexible Panel / Mat';
  if(/\bpanel\b|softlight|soft light|mixpanel|mixpad|skypanel|hydrapanel/.test(text)) return 'Panel';
  if(/pocket|handheld/.test(text)) return 'Pocket / Handheld';
  if(/\bpar\b|lightdrop|triplepar|powerpar/.test(text)) return 'PAR / Point Light';
  if(/spotlight|monolight|\bcob\b|focusable|quikspot|quikbeam|quikpunch/.test(text)) return 'Spotlight / Monolight';
  if(/\b(ls|storm|electro storm)\b/.test(text) && manufacturer==='Aputure') return 'Spotlight / Monolight';
  if(/\b(knowled m|knowled mg|knowled ms|litemons la|sl cob|ml portable cob)\b/.test(text) && manufacturer==='Godox') return 'Spotlight / Monolight';

  return null;
}

export function deriveFixtureStructuralClassification(fixture){
  const manufacturer=clean(fixture?.manufacturer);
  const sources=[
    ['formFactor',fixture?.formFactor],
    ['sourceType',fixture?.sourceType],
    ['family',fixture?.family],
    ['model',fixture?.model]
  ];
  for(const [basis,value] of sources){
    const className=classifyText(value,manufacturer);
    if(className) return {
      className,
      basis,
      evidence:clean(value),
      auditOnly:true
    };
  }
  return {
    className:null,
    basis:null,
    evidence:null,
    auditOnly:true
  };
}

export function deriveFixtureStructuralClass(fixture){
  return deriveFixtureStructuralClassification(fixture).className;
}
