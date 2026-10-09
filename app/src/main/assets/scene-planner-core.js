(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LightingAIScenePlannerCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  var VERSION = 1;
  var ROLES = ['key', 'fill', 'backlight', 'ambient'];
  function str(value, limit) { return String(value == null ? '' : value).trim().slice(0, limit || 400); }
  function num(value, min, max, fallback) {
    var n = Number(value);
    return value !== '' && value != null && Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  }
  function key(value) { return str(value, 250).toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function mode(value) { return value === 'own' ? 'own' : 'best'; }
  function equipment(items) {
    if (!Array.isArray(items)) return [];
    return items.slice(0, 150).filter(function (item) {
      return item && typeof item === 'object' && !item.accessoryId && !item.kitId &&
        !item.sapa && item.kind !== 'accessory' && item.kind !== 'kit' &&
        (item.name || item.fixtureId);
    }).map(function (item) {
      return {
        id: str(item.id || item.fixtureId, 150),
        fixtureId: str(item.fixtureId || '', 150),
        name: str(item.name || item.fixtureId, 180),
        qty: Math.round(num(item.qty, 1, 99, 1)),
        powerDrawW: num(item.powerDrawW, 1, 100000, null),
        cctK: item.cctK && typeof item.cctK === 'object' ? {
          min: num(item.cctK.min, 1000, 20000, null),
          max: num(item.cctK.max, 1000, 20000, null)
        } : null
      };
    });
  }
  function modifiers(items) {
    return (Array.isArray(items) ? items : []).filter(function (e) {
      return e && (e.accessoryId || e.kind === 'accessory');
    }).map(function (e) { return str(e.name, 180); }).filter(Boolean);
  }
  function request(input) {
    input = input && typeof input === 'object' ? input : {};
    return {
      mode: mode(input.mode),
      description: str(input.description, 3000),
      look: str(input.look || 'Cinematic', 80),
      roomWidthM: num(input.roomWidthM, 0.5, 100, null),
      roomDepthM: num(input.roomDepthM, 0.5, 100, null),
      equipment: equipment(input.equipment),
      modifiers: modifiers(input.equipment),
      scenePhoto: str(input.scenePhoto, 12000000),
      language: input.language === 'en' ? 'en' : 'sr'
    };
  }
  function uniqueStrings(items, limit) {
    var seen = Object.create(null), out = [];
    (Array.isArray(items) ? items : []).forEach(function (item) {
      var value = str(item, 350);
      if (value && !seen[value] && out.length < (limit || 15)) { seen[value] = true; out.push(value); }
    });
    return out;
  }
  function light(raw, index, matched, own, req, warnings) {
    raw = raw && typeof raw === 'object' ? raw : {};
    var role = str(raw.role, 40).toLowerCase();
    if (ROLES.indexOf(role) < 0) role = ROLES[index % ROLES.length];
    var cct = num(raw.kelvin, 1000, 20000, null);
    if (own && matched && matched.cctK && cct !== null &&
        matched.cctK.min !== null && matched.cctK.max !== null) {
      if (cct < matched.cctK.min || cct > matched.cctK.max) {
        cct = Math.min(matched.cctK.max, Math.max(matched.cctK.min, cct));
        warnings.push('Kelvin je ograničen na prijavljeni CCT raspon izabrane lampe.');
      }
    }
    var mod = str(raw.modifier, 180);
    if (own && mod && !req.modifiers.some(function (m) { return key(m) === key(mod); })) {
      warnings.push('Nepostojeći ili nepotvrđen modifikator je uklonjen: ' + mod);
      mod = '';
    }
    return {
      id: 'L' + (index + 1),
      role: role,
      fixtureId: own ? matched.fixtureId || matched.id : str(raw.fixtureId, 150),
      fixtureName: own ? matched.name : str(raw.fixtureName || raw.fixture, 180) || 'Neodređen predlog izvora',
      available: own,
      x: num(raw.x, 5, 95, [24, 76, 18, 80][index % 4]),
      y: num(raw.y, 5, 95, [32, 28, 65, 68][index % 4]),
      heightM: num(raw.heightM, 0.1, 25, null),
      distanceM: num(raw.distanceM, 0.1, 100, null),
      angleDeg: num(raw.angleDeg, 0, 360, null),
      intensityPct: num(raw.intensityPct, 0, 100, null),
      kelvin: cct,
      color: str(raw.color, 80),
      modifier: mod,
      powerDrawW: own && matched ? matched.powerDrawW : null,
      power: 'Proveriti izvor napajanja na setu',
      why: str(raw.why || raw.notes, 500),
      estimated: true
    };
  }
  function sanitizePlan(raw, input, source) {
    var req = request(input), own = req.mode === 'own';
    raw = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    var warnings = uniqueStrings(raw.limitations, 20), emitted = [], used = Object.create(null);
    var candidates = Array.isArray(raw.lights) ? raw.lights.slice(0, 16) : [];
    candidates.forEach(function (item) {
      if (!item || typeof item !== 'object') return;
      var match = null;
      if (own) {
        match = req.equipment.find(function (eq) {
          return (item.fixtureId && (eq.fixtureId === item.fixtureId || eq.id === item.fixtureId)) ||
            (item.fixtureName && key(eq.name) === key(item.fixtureName));
        });
        if (!match) {
          warnings.push('Iz plana je uklonjena lampa koja nije u inventaru: ' +
            str(item.fixtureName || item.fixtureId || 'nepoznata', 100));
          return;
        }
        var id = match.fixtureId || match.id || key(match.name);
        if ((used[id] || 0) >= match.qty) {
          warnings.push('Plan je ograničen dostupnom količinom: ' + match.name);
          return;
        }
        used[id] = (used[id] || 0) + 1;
      }
      emitted.push(light(item, emitted.length, match, own, req, warnings));
    });
    if (own && !req.equipment.length) warnings.push('Nema rasvetnih tela u izabranom inventaru.');
    if (own && req.equipment.length && !emitted.length) warnings.push('Nijedan predloženi izvor nije potvrđen u inventaru.');
    if (!req.roomWidthM || !req.roomDepthM) {
      warnings.push('Dimenzije prostorije nisu izmerene: 2D raspored je samo orijentacioni.');
    }
    warnings.push('Položaji, visine, uglovi i intenziteti su procene, ne fotometrijska merenja.');
    if (!own) warnings.push('Predložene lampe nisu potvrđene kao deo korisnikovog inventara.');
    return {
      version: VERSION,
      mode: req.mode,
      source: source === 'ai' ? 'ai' : 'local',
      summary: str(raw.summary, 900) || 'Početni koncept osvetljenja na osnovu opisa scene.',
      rationale: str(raw.rationale, 1500) || 'Glavni izvor definiše lice, kontra odvaja subjekat od pozadine.',
      limitations: uniqueStrings(warnings, 30),
      safetyNotes: uniqueStrings(raw.safetyNotes, 12).concat([
        'Proveriti opterećenje, napajanje, rigging i bezbedne kablovske trase pre postavljanja.'
      ]),
      look: req.look,
      description: req.description,
      geometry: {widthM: req.roomWidthM, depthM: req.roomDepthM, measured: !!(req.roomWidthM && req.roomDepthM)},
      camera: {x: 50, y: 89, label: 'Kamera', estimated: true},
      actors: [{id: 'A1', label: 'Glumac', x: 50, y: 51, path: [{x: 50, y: 65}, {x: 50, y: 40}], estimated: true}],
      lights: emitted
    };
  }
  function localPlan(input) {
    var req = request(input), own = req.mode === 'own';
    var roles = ['key', 'backlight', 'fill'];
    var locations = [{x:24,y:32},{x:76,y:23},{x:78,y:60}];
    var suggestions = [
      {fixtureName:'Meki LED izvor sa difuzijom (predlog, nije inventar)', modifier:'Difuzija, po potrebi'},
      {fixtureName:'Usmereni LED izvor za kontru (predlog, nije inventar)'},
      {fixtureName:'LED ili reflektor za blagi fill (predlog, nije inventar)'}
    ];
    var choices = [];
    if (own) {
      req.equipment.forEach(function (item) {
        for (var i=0; i<Math.min(item.qty, 3) && choices.length<3; i++) choices.push(item);
      });
    }
    var lights = (own ? choices : suggestions).map(function (item, i) {
      return {
        role: roles[i],
        fixtureId: own ? item.fixtureId || item.id : '',
        fixtureName: own ? item.name : item.fixtureName,
        x: locations[i].x, y: locations[i].y,
        heightM: i === 0 ? 2.3 : 2.7,
        distanceM: i === 0 ? 2.5 : 3.5,
        angleDeg: i === 0 ? 45 : 125,
        intensityPct: i === 0 ? 60 : (i === 1 ? 40 : 20),
        kelvin: req.look.toLowerCase().indexOf('night') >= 0 ? 5600 : 4300,
        modifier: own ? '' : item.modifier || '',
        why: ['Modelovanje lica i usmeravanje pažnje.',
          'Odvajanje subjekta od pozadine i kontrola siluete.',
          'Kontrola kontrasta senke bez gubitka atmosfere.'][i]
      };
    });
    var limits = ['Ovo je lokalni početni predlog po pravilima, nije rezultat AI analize fotografije.'];
    if (own && choices.length < 3) limits.push('Nedovoljno raspoloživih izvora za potpuno nezavisne key, fill i backlight pozicije.');
    return sanitizePlan({
      summary: own ? 'Početni light plot iz dostupnog inventara.' : 'Konceptualna filmska rasveta: key, kontra i kontrolisan fill.',
      rationale: 'Položaji su konceptualni. Stvarnu ekspoziciju i senke proveriti probom kamere.',
      limitations: limits, lights: lights
    }, req, 'local');
  }
  return {VERSION:VERSION, request:request, equipment:equipment, modifiers:modifiers,
    sanitizePlan:sanitizePlan, localPlan:localPlan};
});
