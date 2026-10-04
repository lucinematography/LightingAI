function clean(v){return String(v??'').trim()}

export function deriveFixtureStructuralClass(fixture){
  const explicit=clean(fixture?.formFactor);
  const text=[
    explicit,
    clean(fixture?.family),
    clean(fixture?.sourceType),
    clean(fixture?.model)
  ].filter(Boolean).join(' ').toLowerCase();

  if(/fresnel/.test(text)) return 'Fresnel';
  if(/\b(tube|pixeltube|pavotube)\b/.test(text)) return 'Tube';
  if(/bulb/.test(text)) return 'Bulb';
  if(/ring light|\bhalo\b/.test(text)) return 'Ring Light';
  if(/pixel\s*bar|infinibar|light\s*bar/.test(text)) return 'Pixel Bar';
  if(/pixelbrick|\bbrick\b/.test(text)) return 'Brick / Compact Pixel';
  if(/flexible.*panel|foldable.*panel|\bfabric\b|\bmat\b|\bmosaic\b/.test(text)) return 'Flexible Panel / Mat';
  if(/\bpanel\b|softlight|soft light|mixpanel|mixpad|skypanel|hydrapanel/.test(text)) return 'Panel';
  if(/pocket|handheld/.test(text)) return 'Pocket / Handheld';
  if(/\bpar\b|lightdrop|triplepar|powerpar/.test(text)) return 'PAR / Point Light';
  if(/spotlight|monolight|\bcob\b|focusable|quikspot|quikbeam|quikpunch/.test(text)) return 'Spotlight / Monolight';
  if(/\b(ls|storm|electro storm)\b/.test(text) && fixture?.manufacturer==='Aputure') return 'Spotlight / Monolight';
  if(/\b(knowled m|knowled mg|knowled ms|litemons la|sl cob|ml portable cob)\b/.test(text) && fixture?.manufacturer==='Godox') return 'Spotlight / Monolight';

  return null;
}
