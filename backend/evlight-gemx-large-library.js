// EV LIGHT GEMX large-format cinema panels.
// Model identities are kept conservative here; detailed photometrics/specs are intentionally
// omitted until they are locked to a model-specific manufacturer page.
const FILM='https://www.evlightpro.com/led-film-lighting/';
const ACCESSORIES='https://www.evlightpro.com/accessories/';

function fixture(id,model,sourceType){
  return {
    id,
    manufacturer:'EV Light',
    model,
    family:'GEMX',
    category:'Light',
    sourceType,
    sourceUrl:FILM
  };
}
function acc(id,model,category,compatibleWith,effectOnLight){
  return {
    id,
    manufacturer:'EV Light',
    model,
    family:'GEMX',
    category,
    compatibilityStatus:'Designed For',
    compatibleWith,
    sourceUrl:ACCESSORIES,
    ...(effectOnLight?{effectOnLight}:{})
  };
}

export const EVLIGHT_GEMX_LARGE_FIXTURES=[
  fixture('evlight-gemx24-st','GEMX24 ST','Large-format LED Soft Panel'),
  fixture('evlight-gemx28-hard','GEMX28 HARD','Large-format LED Hard Panel')
];

const all=EVLIGHT_GEMX_LARGE_FIXTURES.map(x=>x.id);

export const EVLIGHT_GEMX_LARGE_ACCESSORIES=[
  acc('evlight-gemx-large-softbox','EV LIGHT GEMX Large Panel Softbox','Softbox',all,'Softens and enlarges the apparent source.'),
  acc('evlight-gemx-large-cellular-grille','EV LIGHT GEMX Large Panel Cellular Grille','Grid',all,'Controls spill and narrows off-axis spread.')
];
