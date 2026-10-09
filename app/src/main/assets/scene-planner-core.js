(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LightingAIScenePlannerCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  var VERSION = 3;
  function cameraInput(data) {
    data=data&&typeof data==='object'?data:{};
    return {
      fps:num(data.fps,1,120,null),
      shutterAngle:num(data.shutterAngle,11.25,360,null),
      aperture:num(data.aperture,0.7,32,null),
      iso:num(data.iso,50,25600,null),
      whiteBalanceK:num(data.whiteBalanceK,1700,20000,null),
      ndStops:num(data.ndStops,0,12,null),
      focalLengthMm:num(data.focalLengthMm,8,300,null)
    };
  }
  function shutterSeconds(settings){
    return settings.shutterAngle / (360 * settings.fps);
  }
  function exposureDeltaStops(settings,base){
    if(!settings||!base)return null;
    var a=shutterSeconds(settings),b=shutterSeconds(base);
    if(!a||!b||!settings.iso||!base.iso||!settings.aperture||!base.aperture)return null;
    var multiplier=(settings.iso/base.iso)*(a/b)*Math.pow(base.aperture/settings.aperture,2)*
      Math.pow(2,base.ndStops-settings.ndStops);
    return Number(Math.log2(multiplier).toFixed(2));
  }
  function cameraPlan(raw,input) {
    var baseIn=raw&&typeof raw==='object'?raw:{};
    var baseUser=cameraInput(baseIn);
    var base={
      fps:baseUser.fps||24,
      shutterAngle:baseUser.shutterAngle||180,
      aperture:baseUser.aperture||2.8,
      iso:baseUser.iso||800,
      whiteBalanceK:baseUser.whiteBalanceK||4300,
      ndStops:baseUser.ndStops==null?0:baseUser.ndStops,
      focalLengthMm:baseUser.focalLengthMm
    };
    var override=input&&input.cameraOverrides?input.cameraOverrides:{};
    var settings={};
    Object.keys(base).forEach(function(k) {
      settings[k]=override[k]==null?base[k]:override[k];
    });
    settings.shutterSeconds=Number(shutterSeconds(settings).toFixed(6));
    settings.exposureDeltaStops=exposureDeltaStops(settings,base);
    settings.apertureSource=override.aperture==null?'ai-estimate':'dop-override';
    settings.isoSource=override.iso==null?'ai-estimate':'dop-override';
    settings.provenance='NEIZMERENA PREPORUKA: bez pouzdanog svetlomera ekspozicija i osvetljenost nisu potvrđene';
    settings.referenceCamera=base;
    return settings;
  }
  function nightLook(value) { return value === 'Night' || value === 'Day for Night'; }
  function detectedNight(value) { return /noc|noć|noćna|noći|night|moonlight|mesečin|mese[cč]in|mesec|pono[cć]/i.test(String(value || '')); }
  function chooseLook(value, description, capture) {
    var look = str(value || 'Cinematic', 80);
    if (look === 'Cinematic' && detectedNight(description)) return capture === 'day' ? 'Day for Night' : 'Night';
    return look;
  }
  function confidence(value) { return ['low','medium','high'].indexOf(value)>=0 ? value : 'unknown'; }
  function coverage(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(0,16).map(Number).filter(function(n){return Number.isInteger(n)&&n>=0&&n<=15;})
      .filter(function(n,i,arr){return arr.indexOf(n)===i;});
  }
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
      look: chooseLook(input.look,input.description,input.captureLighting),
      captureLighting: ['day','night','unknown'].indexOf(input.captureLighting)>=0 ? input.captureLighting : 'unknown',
      sceneLocation: str(input.sceneLocation, 160),
      sceneLatitude: num(input.sceneLatitude, -90, 90, null),
      sceneLongitude: num(input.sceneLongitude, -180, 180, null),
      sceneTimeZone: str(input.sceneTimeZone, 80),
      sceneLocalDateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(input.sceneLocalDateTime||'')) ?
        str(input.sceneLocalDateTime, 20) : '',
      sceneCoordsVerified: input.sceneCoordsVerified === true,
      roomWidthM: num(input.roomWidthM, 0.5, 100, null),
      roomDepthM: num(input.roomDepthM, 0.5, 100, null),
      equipment: equipment(input.equipment),
      modifiers: Array.isArray(input.modifiers) ? input.modifiers.map(function(x){return str(x,180);}).filter(Boolean) : modifiers(input.equipment),
      scenePhoto: str(input.scenePhoto, 12000000),
      videoFrames: (Array.isArray(input.videoFrames) ? input.videoFrames : []).slice(0, 6).filter(function(f){
        return f && typeof f === 'object';
      }).map(function(f){
        return {timeSec:num(f.timeSec,0,3600,0),image:str(f.image,3500000)};
      }).filter(function(f){return !!f.image;}),
      dimensionsMeasured: input.dimensionsMeasured === true,
      shotCamera: str(input.shotCamera || '', 400),
      dopRequest: str(input.dopRequest || '', 1500),
      cameraOverrides: cameraInput(input.cameraOverrides),
      previousPlan: input.previousPlan && typeof input.previousPlan==='object' ?
        {summary:str(input.previousPlan.summary,800),
          rationale:str(input.previousPlan.rationale,1000),
          lights:(Array.isArray(input.previousPlan.lights)?input.previousPlan.lights:[]).slice(0,12)
            .map(function(l){return {
              id:str(l.id,12),fixtureId:str(l.fixtureId,120),fixtureName:str(l.fixtureName,150),
              role:str(l.role,30),x:num(l.x,5,95,50),y:num(l.y,5,95,50),
              intensityPct:num(l.intensityPct,0,100,null),kelvin:num(l.kelvin,1000,20000,null)
            };})} : null,
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
      verticalTiltDeg: num(raw.verticalTiltDeg,-90,90,null),
      beamAngleDeg: num(raw.beamAngleDeg,5,180,null),
      coverageStages: coverage(raw.coverageStages),
      positionNote: str(raw.positionNote,350),
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
            (item.fixtureName && key(item.fixtureName) && key(eq.name) === key(item.fixtureName));
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
      warnings.push('Dimenzije prostorije nisu navedene: 2D raspored je samo orijentacioni.');
    }
    warnings.push('Položaji, visine, uglovi i intenziteti su procene, ne fotometrijska merenja.');
    if (!req.dimensionsMeasured) warnings.push('Dimenzije nisu označene kao stvarno izmerene.');
    var analysis=raw.sceneAnalysis && typeof raw.sceneAnalysis==='object' ? raw.sceneAnalysis : {};
    var rawActors = Array.isArray(raw.actors) ? raw.actors.slice(0, 6) : [];
    var actors = rawActors.map(function(a, i) {
      if (!a || typeof a !== 'object') return null;
      var path=(Array.isArray(a.path)?a.path:[]).slice(0,16).map(function(pt,j){
        var t=req.videoFrames[j] ? req.videoFrames[j].timeSec : null;
        return {x:num(pt&&pt.x,5,95,50),y:num(pt&&pt.y,5,95,50),
          timeSec:num(pt&&pt.timeSec,0,3600,t)};
      });
      return {id:'A'+(i+1),label:str(a.label || 'Glumac',80),
        x:num(a.x,5,95,path.length?path[0].x:50),
        y:num(a.y,5,95,path.length?path[0].y:51),
        path:path,confidence:confidence(a.confidence),estimated:true};
    }).filter(Boolean);
    if (!actors.length) {
      actors=[{id:'A1',label:'Glumac',x:50,y:51,path:[],confidence:'unknown',estimated:true}];
      warnings.push('Kretanje nije rekonstruisano; ne prikazujemo izmišljenu putanju.');
    }
    if (!own) warnings.push('Predložene lampe nisu potvrđene kao deo korisnikovog inventara.');
    var stages=actors.length ? actors[0].path.length : 0, unlit=[];
    if(stages && emitted.length) {
      for(var i=0;i<stages;i++) {
        if(!emitted.some(function(l){return (l.role==='key'||l.role==='ambient')&&l.coverageStages.indexOf(i)>=0;})) unlit.push(i+1);
      }
      if(unlit.length) warnings.push('Nije potvrđeno osvetljenje duž cele putanje, tačke: '+unlit.join(', ')+'.');
    }
    if(nightLook(req.look) && req.captureLighting==='day')
      warnings.push('Dan za noć zahteva kontrolu dnevnog ambijenta, neba i odsjaja; digitalni preview nije zamena za fizičku rasvetu.');
    if(req.videoFrames.length && (analysis.cameraMotion==='moving'||analysis.cameraMotion==='unknown'))
      warnings.push('Kamera se kreće ili njen pokret nije poznat: raspored iz videa nije metrička 3D rekonstrukcija.');
    var nightNotes=uniqueStrings(raw.dayForNightNotes,12);
    if(nightLook(req.look)&&req.captureLighting==='day'&&!nightNotes.length)
      nightNotes.push('Fizički kontrolisati direktno dnevno svetlo, ne dozvoliti preeksponirano nebo i uskladiti kadrove.');

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
      dopRequest:req.dopRequest,
      cameraSettings:cameraPlan(raw.cameraSettings,req),
      exposureNotes:uniqueStrings(raw.exposureNotes,8).concat([
        'Blenda, ISO, ND i jačina lampi su preporuke bez svetlomerne potvrde; test kadrom i merenjem proveriti ekspoziciju.',
        'Izmena ISO ili blende ne menja automatski stvarnu svetlost na setu.'
      ]),
      captureLighting: req.captureLighting,
      location: {
        name: req.sceneLocation,
        latitude: req.sceneLatitude,
        longitude: req.sceneLongitude,
        timeZone: req.sceneTimeZone,
        localDateTime: req.sceneLocalDateTime,
        coordinatesVerified: req.sceneCoordsVerified,
        locationIsApproximate: !req.sceneCoordsVerified
      },
      sceneAnalysis:{
        cameraMotion:['static','moving','unknown'].indexOf(analysis.cameraMotion)>=0?analysis.cameraMotion:'unknown',
        blockingConfidence:confidence(analysis.blockingConfidence),
        observedLighting:['day','night','mixed','unknown'].indexOf(analysis.observedLighting)>=0?analysis.observedLighting:'unknown',
        evidence:str(analysis.evidence,500),
        referencePoints:(Array.isArray(analysis.referencePoints)?analysis.referencePoints:[]).slice(0,10)
          .map(function(a){return {label:str(a&&a.label,80),x:num(a&&a.x,5,95,50),y:num(a&&a.y,5,95,50),estimated:true};})
      },
      dayForNightNotes:nightNotes,
      unknownCoverageStages:unlit,
      geometry: {widthM: req.roomWidthM, depthM: req.roomDepthM,
        measured: !!(req.roomWidthM && req.roomDepthM && req.dimensionsMeasured),
        userProvided: !!(req.roomWidthM && req.roomDepthM)},
      camera: {x: 50, y: 89, label: 'Kamera', estimated: true},
      actors: actors,
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
        coverageStages:[],
        positionNote:'Orijentaciono, proveriti prepreke i bezbedno postavljanje izvora.',
        why: ['Modelovanje lica i usmeravanje pažnje.',
          'Odvajanje subjekta od pozadine i kontrola siluete.',
          'Kontrola kontrasta senke bez gubitka atmosfere.'][i]
      };
    });
    var limits = ['Ovo je lokalni početni predlog po pravilima, nije rezultat AI analize fotografije.'];
    if (own && choices.length < 3) limits.push('Nedovoljno raspoloživih izvora za potpuno nezavisne key, fill i backlight pozicije.');
    return sanitizePlan({
      sceneAnalysis:{cameraMotion:'unknown',blockingConfidence:'unknown',observedLighting:'unknown'},
      dayForNightNotes:nightLook(req.look)&&req.captureLighting==='day'?[
        'Kontrolisati dnevni ambijent i sjajne površine; noćna ekspozicija se proverava kamerom.',
        'Bočna ili pozadinska hladna svetlost može predstavljati mesečinu samo kao kreativni predlog.'
      ]:[],
      summary: own ? 'Početni light plot iz dostupnog inventara.' : 'Konceptualna filmska rasveta: key, kontra i kontrolisan fill.',
      rationale: 'Položaji su konceptualni. Stvarnu ekspoziciju i senke proveriti probom kamere.',
      limitations: limits, lights: lights
    }, req, 'local');
  }
  return {VERSION:VERSION, request:request, equipment:equipment, modifiers:modifiers,
    sanitizePlan:sanitizePlan, localPlan:localPlan,chooseLook:chooseLook,nightLook:nightLook,
    cameraInput:cameraInput,cameraPlan:cameraPlan,exposureDeltaStops:exposureDeltaStops};
});
