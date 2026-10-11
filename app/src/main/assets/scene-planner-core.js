(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LightingAIScenePlannerCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  var VERSION = 3;
  var MAX_LIGHTS = 16;
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
  // Measured-room input must never be clipped into a plausible measurement.
  // This is user-declared measurement, not independent depth-camera calibration.
  function roomDimension(value) {
    if(typeof value!=='number' && typeof value!=='string')return null;
    if(typeof value==='string' && !/^(?:[0-9]+(?:[.][0-9]*)?|[.][0-9]+)$/.test(value.trim()))return null;
    var n=Number(value);
    return Number.isFinite(n) && n>=0.5 && n<=100 ? n : null;
  }
  function measuredFixtureDistance(value) {
    if(typeof value!=='number' && typeof value!=='string')return null;
    if(typeof value==='string' && !/^(?:[0-9]+(?:[.][0-9]*)?|[.][0-9]+)$/.test(value.trim()))return null;
    var d=Number(value);
    return Number.isFinite(d)&&d>=0.1&&d<=100?d:null;
  }
  // Accept only user-entered incident meter values. Never round or clip a measurement.
  function incidentLux(value) {
    if(typeof value!=='number' && typeof value!=='string')return null;
    if(typeof value==='string' && !/^(?:[0-9]+(?:[.][0-9]*)?|[.][0-9]+)$/.test(value.trim()))return null;
    var lux=Number(value);
    return Number.isFinite(lux)&&lux>=0&&lux<=1000000&&
      Math.round(lux*1000)/1000===lux?lux:null;
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
    var width=roomDimension(input.roomWidthM),depth=roomDimension(input.roomDepthM);
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
      roomWidthM: width,
      roomDepthM: depth,
      equipment: equipment(input.equipment),
      modifiers: Array.isArray(input.modifiers) ? input.modifiers.map(function(x){return str(x,180);}).filter(Boolean) : modifiers(input.equipment),
      scenePhoto: str(input.scenePhoto, 12000000),
      videoFrames: (Array.isArray(input.videoFrames) ? input.videoFrames : []).slice(0, 6).filter(function(f){
        return f && typeof f === 'object';
      }).map(function(f){
        return {timeSec:num(f.timeSec,0,3600,0),image:str(f.image,3500000)};
      }).filter(function(f){return !!f.image;}),
      dimensionsMeasured: input.dimensionsMeasured === true && width!==null && depth!==null,
      shotCamera: str(input.shotCamera || '', 400),
      dopRequest: str(input.dopRequest || '', 1500),
      cameraOverrides: cameraInput(input.cameraOverrides),
      previousPlan: input.previousPlan && typeof input.previousPlan==='object' ?
        {summary:str(input.previousPlan.summary,800),
          nextLightId:num(input.previousPlan.nextLightId,1,1000000000,null),
          rationale:str(input.previousPlan.rationale,1000),
          lights:(Array.isArray(input.previousPlan.lights)?input.previousPlan.lights:[]).slice(0,MAX_LIGHTS)
            .map(function(l){return {
              id:str(l.id,12),fixtureId:str(l.fixtureId,150),fixtureName:str(l.fixtureName,180),
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
  function sanitizePhotometricBasis(raw, req, emitted, knowledge) {
    if(!raw || raw.status!=='MANUFACTURER_REFERENCE_NOT_SCENE_MEASUREMENT' ||
      !Array.isArray(raw.entries))return null;
    var measured=!!(req.roomWidthM && req.roomDepthM && req.dimensionsMeasured);
    // Independently fixed published values: reject plausible but fabricated manufacturer lux.
    var official={
      'aputure-ls-60d':{url:'https://aputure.com/EN-US/products/ls-60d',
        lux:[54300,7602,2715,9014,1096,402]},
      'aputure-ls-60x':{url:'https://aputure.com/en-US/products/ls-60x',
        lux:[33480,4241,1451,5803,703,268]},
      'aputure-ls-300d-ii':{url:'https://aputure.com/en-US/products/ls-300d-ii',
        requireOptic:true,ids:['HYPER_REFLECTOR_55:55:1','HYPER_REFLECTOR_55:55:3','HYPER_REFLECTOR_55:55:5'],
        lux:[45000,3500,1200]},
      'aputure-ls-1200d-pro':{url:'https://aputure.com/en-US/products/ls-1200d-pro',
        requireOptic:true,
        ids:['BM1215_NARROW:15:3','BM1215_NARROW:15:5','BM1215_NARROW:15:7','BM1215_NARROW:15:9',
          'BM1230_MEDIUM:30:3','BM1230_MEDIUM:30:5','BM1230_MEDIUM:30:7','BM1230_MEDIUM:30:9',
          'BM1245_WIDE:45:3','BM1245_WIDE:45:5','BM1245_WIDE:45:7','BM1245_WIDE:45:9'],
        lux:[83100,28340,15200,8580,22400,8200,4660,2880,13010,4800,2706,1775]}
    };
    var ids=knowledge && Array.isArray(knowledge.cards) ?
      knowledge.cards.map(function(c){return str(c&&c.id,40);}) : [];
    var supportedBookIds=['PHY-005','EQ-001','EQ-002','EXP-001','META-002'];
    var seen=Object.create(null);
    var entries=raw.entries.slice(0,8).map(function(e){
      if(!e||typeof e!=='object')return null;
      var id=str(e.lightId,12),fixtureId=str(e.fixtureId,150),url=str(e.sourceUrl,240);
      var light=emitted.find(function(l){return l.id===id && l.fixtureId===fixtureId && l.available;});
      var reference=Object.prototype.hasOwnProperty.call(official,fixtureId)?official[fixtureId]:null;
      if(!light||seen[id]||!reference||url!==reference.url||e.sourceType!=='MANUFACTURER_PUBLISHED_REFERENCE'||
        e.cctK!==5600||e.outputPct!==100||!Array.isArray(e.samples)||e.samples.length!==reference.lux.length||
        !!e.requiresAttestedOptic!==!!reference.requireOptic)return null;
      var samples=e.samples.map(function(s){
        if(!s||![15,30,45,55].includes(s.beamAngleDeg)||![1,3,5,7,9].includes(s.distanceM)||
          !Number.isSafeInteger(s.lux)||s.lux<1||s.lux>1000000)return null;
        return {opticId:s.opticId==null?null:str(s.opticId,50),beamAngleDeg:s.beamAngleDeg,distanceM:s.distanceM,lux:s.lux};
      });
      if(samples.some(function(s){return s===null;}))return null;
      var sampleIds=samples.map(function(s){return (s.opticId?s.opticId+':':'')+s.beamAngleDeg+':'+s.distanceM;});
      if((new Set(sampleIds)).size!==reference.lux.length)return null;
      var expectedIds=reference.ids||['15:1','15:3','15:5','45:1','45:3','45:5'];
      if(sampleIds.some(function(x,i){return x!==expectedIds[i]||samples[i].lux!==reference.lux[i];}))return null;
      seen[id]=true;
      var k=5600;
      return {lightId:id,fixtureId:fixtureId,sourceUrl:url,
        sourceType:'MANUFACTURER_PUBLISHED_REFERENCE',cctK:k,outputPct:100,
        requiresAttestedOptic:!!reference.requireOptic,samples:samples,
        configurationMatchesReference:!reference.requireOptic && light.intensityPct===100 && light.kelvin===k &&
          (light.beamAngleDeg===15||light.beamAngleDeg===45) && !light.modifier,
        estimatedXMetres:measured?Number((req.roomWidthM*light.x/100).toFixed(2)):null,
        estimatedYMetres:measured?Number((req.roomDepthM*light.y/100).toFixed(2)):null,
        bookCardIds:(Array.isArray(e.bookCardIds)?e.bookCardIds:[]).slice(0,5).map(function(x){return str(x,40);})
          .filter(function(x){return ids.indexOf(x)>=0 && supportedBookIds.indexOf(x)>=0;}),
        measuredDistanceM:null,onSetLux:null};
    }).filter(Boolean);
    return {status:'MANUFACTURER_REFERENCE_NOT_SCENE_MEASUREMENT',
      geometry:{widthM:req.roomWidthM,depthM:req.roomDepthM,
        userMarkedMeasured:measured,plotPositionsEstimated:true},entries:entries};
  }
  function sanitizePlan(raw, input, source) {
    var req = request(input), own = req.mode === 'own';
    raw = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    var warnings = uniqueStrings(raw.limitations, 20), emitted = [], used = Object.create(null);
    var candidates = Array.isArray(raw.lights) ? raw.lights.slice(0, MAX_LIGHTS) : [];
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
      var entry=light(item, emitted.length, match, own, req, warnings);
      var previous=req.previousPlan ? req.previousPlan.lights : [];
      var matches=previous.filter(function(p){
        return p.fixtureId===entry.fixtureId && (entry.fixtureId || p.fixtureName===entry.fixtureName) &&
          (item.id ? p.id===item.id : p.role===entry.role);
      });
      var identity=matches.length===1 ? matches[0].id : null;
      if(identity && emitted.some(function(l){return l.id===identity;})) identity=null;
      var next=Math.max(req.previousPlan&&req.previousPlan.nextLightId||1,
        previous.reduce(function(n,l){return Math.max(n,Number(l.id.slice(1))+1||1);},1));
      while(emitted.some(function(l){return l.id==='L'+next;}))next++;
      entry.id=identity||'L'+next;
      emitted.push(entry);
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
      shotCamera:req.shotCamera,
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
      knowledgeBasis: source === 'ai' && raw.knowledgeBasis &&
        raw.knowledgeBasis.status === 'CURATED_BOOK_PRINCIPLES_NOT_FULL_TEXT_OR_INDEPENDENTLY_PAGE_VERIFIED' &&
        Array.isArray(raw.knowledgeBasis.cards) ? {
          status:'CURATED_BOOK_PRINCIPLES_NOT_FULL_TEXT_OR_INDEPENDENTLY_PAGE_VERIFIED',
          cards:raw.knowledgeBasis.cards.slice(0,8).map(function(c){
            return {id:str(c&&c.id,40),title:str(c&&c.title,180),
              principle:str(c&&c.principle,1200),application:str(c&&c.application,1200),
              validation:str(c&&c.validation,1200),limitations:str(c&&c.limitations,1200),
              references:(Array.isArray(c&&c.references)?c.references:[]).slice(0,4).map(function(r){
                return {source:str(r&&r.source,40),title:str(r&&r.title,240),edition:str(r&&r.edition,120),author:str(r&&r.author,120),
                  pdfPage:num(r&&r.pdfPage,1,5000,null),printedPage:num(r&&r.printedPage,0,5000,null),
                  verification:str(r&&r.verification,120)};
              })};
          })
        } : null,
      photometricBasis:source==='ai'?sanitizePhotometricBasis(raw.photometricBasis,req,emitted,raw.knowledgeBasis):null,
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
  // Canonical JSON v1: sorted object keys, ordered arrays, finite JSON values only.
  // No Web Crypto, secure context, Node imports or asynchronous platform dependency.
  function canonicalJson(value) {
    var stack=[];
    function encode(v) {
      if(v===null || typeof v==='string' || typeof v==='boolean')return JSON.stringify(v);
      if(typeof v==='number' && Number.isFinite(v))return JSON.stringify(v);
      if(!v || typeof v!=='object')throw new Error('Non-JSON revision data');
      if(stack.indexOf(v)>=0)throw new Error('Cyclic revision data');
      stack.push(v);
      var result;
      if(Array.isArray(v)) {
        var entries=[];
        for(var i=0;i<v.length;i++)entries.push(encode(v[i]));
        result='['+entries.join(',')+']';
      } else {
        if(Object.prototype.toString.call(v)!=='[object Object]')throw new Error('Non-JSON object');
        result='{'+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+':'+encode(v[k]);}).join(',')+'}';
      }
      stack.pop();return result;
    }
    return encode(value);
  }
  function sha256(value) {
    var bytes=[],i,c;
    for(i=0;i<value.length;i++) {
      c=value.charCodeAt(i);
      if(c>=0xd800 && c<=0xdbff && i+1<value.length && value.charCodeAt(i+1)>=0xdc00 && value.charCodeAt(i+1)<=0xdfff)
        c=0x10000+((c-0xd800)<<10)+(value.charCodeAt(++i)-0xdc00);
      else if(c>=0xd800 && c<=0xdfff)c=0xfffd;
      if(c<128)bytes.push(c);
      else if(c<2048)bytes.push(192|(c>>6),128|(c&63));
      else if(c<65536)bytes.push(224|(c>>12),128|((c>>6)&63),128|(c&63));
      else bytes.push(240|(c>>18),128|((c>>12)&63),128|((c>>6)&63),128|(c&63));
    }
    var h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var k=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var bitLength=bytes.length*8;
    bytes.push(128);while(bytes.length%64!==56)bytes.push(0);
    var hi=Math.floor(bitLength/4294967296),lo=bitLength>>>0;
    for(i=3;i>=0;i--)bytes.push((hi>>>(i*8))&255);
    for(i=3;i>=0;i--)bytes.push((lo>>>(i*8))&255);
    function rotate(x,n){return (x>>>n)|(x<<(32-n));}
    for(var offset=0;offset<bytes.length;offset+=64) {
      var w=[];
      for(i=0;i<16;i++)w[i]=(bytes[offset+4*i]<<24)|(bytes[offset+4*i+1]<<16)|(bytes[offset+4*i+2]<<8)|bytes[offset+4*i+3];
      for(i=16;i<64;i++) {
        var s0=rotate(w[i-15],7)^rotate(w[i-15],18)^(w[i-15]>>>3);
        var s1=rotate(w[i-2],17)^rotate(w[i-2],19)^(w[i-2]>>>10);
        w[i]=(w[i-16]+s0+w[i-7]+s1)|0;
      }
      var a=h[0],b=h[1],d=h[3],e=h[4],f=h[5],g=h[6],hh=h[7],cc=h[2];
      for(i=0;i<64;i++) {
        var t1=(hh+(rotate(e,6)^rotate(e,11)^rotate(e,25))+((e&f)^(~e&g))+k[i]+w[i])|0;
        var t2=((rotate(a,2)^rotate(a,13)^rotate(a,22))+((a&b)^(a&cc)^(b&cc)))|0;
        hh=g;g=f;f=e;e=(d+t1)|0;d=cc;cc=b;b=a;a=(t1+t2)|0;
      }
      [a,b,cc,d,e,f,g,hh].forEach(function(v,j){h[j]=(h[j]+v)|0;});
    }
    return h.map(function(n){return ('00000000'+(n>>>0).toString(16)).slice(-8);}).join('');
  }
  function freezeJson(value) {
    if(value && typeof value==='object') {
      Object.keys(value).forEach(function(k){freezeJson(value[k]);});Object.freeze(value);
    }
    return value;
  }
  function planHash(plan){return sha256(canonicalJson(plan));}
  function provenance(plan, req) {
    var camera={};
    Object.keys(req.cameraOverrides).forEach(function(k){
      camera[k]=req.cameraOverrides[k]==null?'estimated':'dop-specified';
    });
    return {lightSettings:'estimated',cameraSettings:camera,
      geometry:plan.geometry.measured?'confirmed-by-user':'estimated',
      location:plan.location.coordinatesVerified && plan.location.latitude!==null && plan.location.longitude!==null?'confirmed-by-user':'estimated',
      inventory:plan.mode==='own'?'user-declared':'unconfirmed',
      exposure:'unconfirmed',blocking:'estimated'};
  }
  function revisionPayload(revision) {
    return {schemaVersion:revision.schemaVersion,sceneId:revision.sceneId,
      parentRevisionId:revision.parentRevisionId,sequence:revision.sequence,
      nextLightId:revision.nextLightId,planHash:revision.planHash};
  }
  function verifyRevision(revision) {
    if(!revision || revision.schemaVersion!==1 || !/^[A-Za-z0-9_-]{1,100}$/.test(revision.sceneId) ||
      !Number.isInteger(revision.sequence) || revision.sequence<1 ||
      !Number.isInteger(revision.nextLightId) || revision.nextLightId<1 ||
      (revision.sequence===1 ? revision.parentRevisionId!==null : !/^rev-[a-f0-9]{64}$/.test(revision.parentRevisionId)))
      throw new Error('Invalid revision metadata');
    var plan=revision.plan;
    if(!plan || plan.version!==VERSION || !Array.isArray(plan.lights) || !plan.cameraSettings || !plan.dataStatus)
      throw new Error('Invalid validated plan');
    function range(value,min,max,nullable) {
      if(nullable && value===null)return;
      if(typeof value!=='number' || !Number.isFinite(value) || value<min || value>max)
        throw new Error('Invalid validated numeric data');
    }
    if(plan.lights.length>MAX_LIGHTS || !Array.isArray(plan.actors) || !plan.geometry || !plan.location ||
      typeof plan.dopRequest!=='string' || ['ai','local'].indexOf(plan.source)<0 || ['own','best'].indexOf(plan.mode)<0 ||
      plan.dataStatus.lightSettings!=='estimated' || plan.dataStatus.exposure!=='unconfirmed')
      throw new Error('Invalid validated plan data');
    var cameraRanges={fps:[1,120],shutterAngle:[11.25,360],aperture:[0.7,32],iso:[50,25600],
      whiteBalanceK:[1700,20000],ndStops:[0,12],focalLengthMm:[8,300]};
    Object.keys(cameraRanges).forEach(function(k){range(plan.cameraSettings[k],cameraRanges[k][0],cameraRanges[k][1],k==='focalLengthMm');});
    range(plan.geometry.widthM,0.5,100,true);range(plan.geometry.depthM,0.5,100,true);
    var ids=Object.create(null);
    plan.lights.forEach(function(l){
      if(!/^L[1-9]\d{0,8}$/.test(l.id) || ids[l.id] || Number(l.id.slice(1))>=revision.nextLightId)
        throw new Error('Invalid light identity');
      ids[l.id]=true;
      if(ROLES.indexOf(l.role)<0 || l.estimated!==true || typeof l.fixtureId!=='string' || typeof l.fixtureName!=='string' ||
        !Array.isArray(l.coverageStages) || l.coverageStages.some(function(n){return !Number.isInteger(n)||n<0||n>15;}))
        throw new Error('Invalid validated light data');
      range(l.x,5,95);range(l.y,5,95);range(l.heightM,0.1,25,true);range(l.distanceM,0.1,100,true);
      range(l.angleDeg,0,360,true);range(l.intensityPct,0,100,true);range(l.kelvin,1000,20000,true);
      range(l.verticalTiltDeg,-90,90,true);range(l.beamAngleDeg,5,180,true);range(l.powerDrawW,1,100000,true);
    });
    // On-set user reports are not AI estimates and never constitute a lux-meter measurement.
    var readings=plan.distanceMeasurements===undefined?[]:plan.distanceMeasurements;
    if(!Array.isArray(readings)||readings.length>MAX_LIGHTS)throw new Error('Invalid fixture distance evidence');
    var readingIds=Object.create(null);
    readings.forEach(function(m){
      if(!m || typeof m!=='object' || typeof m.lightId!=='string' || readingIds[m.lightId] ||
        plan.mode!=='own' || m.source!=='USER_REPORTED_ON_SET_NOT_INDEPENDENTLY_VERIFIED' ||
        m.target!=='SUBJECT_AT_MEASUREMENT_POINT' || m.userAttested!==true ||
        measuredFixtureDistance(m.distanceM)!==m.distanceM)
        throw new Error('Invalid fixture distance evidence');
      var light=plan.lights.find(function(l){return l.id===m.lightId;});
      if(!light||!light.available||!light.fixtureId||m.fixtureId!==light.fixtureId)
        throw new Error('Fixture distance must refer to an owned light in this revision');
      readingIds[m.lightId]=m;
    });
    if(readings.length&&plan.dataStatus.distanceMeasurements!=='user-reported-not-independently-verified')
      throw new Error('Unlabeled fixture distance measurement');
    // User-reported physical incident meter reading, never a manufacturer's lux figure.
    var incidentReports=plan.incidentLuxReadings===undefined?[]:plan.incidentLuxReadings;
    if(!Array.isArray(incidentReports)||incidentReports.length>MAX_LIGHTS)
      throw new Error('Invalid on-set incident lux evidence');
    var incidentIds=Object.create(null);
    incidentReports.forEach(function(m){
      if(!m||typeof m!=='object'||typeof m.lightId!=='string'||incidentIds[m.lightId]||
        plan.mode!=='own'||m.source!=='USER_REPORTED_INCIDENT_LUX_NOT_INDEPENDENTLY_VERIFIED'||
        m.unit!=='lx'||m.meterType!=='INCIDENT_LUX_METER'||
        m.target!=='SUBJECT_AT_MEASUREMENT_POINT'||
        m.measurementScope!=='FIXTURE_ISOLATED_OTHER_SOURCES_CONTROLLED'||
        m.userAttested!==true||m.fixtureIsolated!==true||
        typeof m.lux!=='number'||incidentLux(m.lux)!==m.lux)
        throw new Error('Invalid on-set incident lux evidence');
      var light=plan.lights.find(function(l){return l.id===m.lightId;});
      var distance=readingIds[m.lightId];
      if(!light||!light.available||!light.fixtureId||m.fixtureId!==light.fixtureId||
        !distance||distance.fixtureId!==m.fixtureId||
        m.distanceMAtMeasurement!==distance.distanceM)
        throw new Error('On-set incident lux evidence requires matching measured distance');
      incidentIds[m.lightId]=m;
    });
    if(incidentReports.length &&
      plan.dataStatus.incidentLuxReadings!=='user-reported-not-independently-verified')
      throw new Error('Unlabeled on-set incident meter values');
    // Only an explicitly attested mounted optic can unlock a published reference.
    var attestations=plan.opticConfirmations===undefined?[]:plan.opticConfirmations;
    if(!Array.isArray(attestations)||attestations.length>MAX_LIGHTS)
      throw new Error('Invalid mounted optic evidence');
    var opticsByLight=Object.create(null);
    attestations.forEach(function(a){
      if(!a||typeof a!=='object'||!/^L[1-9][0-9]{0,8}$/.test(a.lightId)||
        opticsByLight[a.lightId]||plan.mode!=='own'||
        a.source!=='USER_REPORTED_MOUNTED_OPTIC_NOT_INDEPENDENTLY_VERIFIED'||
        a.userAttested!==true||typeof a.opticId!=='string'||a.opticId.length>60)
        throw new Error('Invalid mounted optic evidence');
      var light=plan.lights.find(function(l){return l.id===a.lightId;});
      var basis=plan.photometricBasis&&Array.isArray(plan.photometricBasis.entries)?
        plan.photometricBasis.entries.find(function(e){return e.lightId===a.lightId;}):null;
      if(!light||!light.available||light.fixtureId!==a.fixtureId||!basis||
        !basis.requiresAttestedOptic||basis.fixtureId!==a.fixtureId||
        !Array.isArray(basis.samples)||!basis.samples.some(function(sample){return sample.opticId===a.opticId;}))
        throw new Error('Mounted optic is not a verified profile option for this light');
      opticsByLight[a.lightId]=a;
    });
    if(attestations.length&&plan.dataStatus.mountedOptics!=='user-reported-not-independently-verified')
      throw new Error('Unlabeled on-set optic confirmation');
    if(plan.photometricBasis && Array.isArray(plan.photometricBasis.entries)){
      plan.photometricBasis.entries.forEach(function(e){
        if(!e||e.onSetLux!==null)throw new Error('Invalid on-set photometric claim');
        var reading=readingIds[e.lightId];
        var verifiedOptic=opticsByLight[e.lightId];
        var lightForOptic=plan.lights.find(function(l){return l.id===e.lightId;});
        if(e.requiresAttestedOptic){
          var selectedOptic=verifiedOptic&&verifiedOptic.fixtureId===e.fixtureId?verifiedOptic.opticId:null;
          if((e.attestedOpticId||null)!==selectedOptic||!lightForOptic)
            throw new Error('Missing or mismatched physical optic confirmation');
          var opticSamples=(Array.isArray(e.samples)?e.samples:[]).filter(function(s){
            return selectedOptic!==null&&s.opticId===selectedOptic;
          });
          var expectedMatch=!!(selectedOptic&&opticSamples.length&&lightForOptic.available&&
            lightForOptic.intensityPct===100&&lightForOptic.kelvin===e.cctK&&
            !lightForOptic.modifier&&opticSamples[0].beamAngleDeg===lightForOptic.beamAngleDeg);
          if(e.configurationMatchesReference!==expectedMatch)
            throw new Error('Optic reference configuration is not supported');
        }
        if(e.measuredDistanceM!==null && (!reading || reading.fixtureId!==e.fixtureId ||
          reading.distanceM!==e.measuredDistanceM))
          throw new Error('Fixture distance source mismatch');
        if(reading&&reading.fixtureId===e.fixtureId&&e.measuredDistanceM!==reading.distanceM)
          throw new Error('Fixture distance binding missing');
        var selected=e.publishedReferenceAtMeasuredDistance;
        if(selected!=null){
          var light=plan.lights.find(function(l){return l.id===e.lightId;});
          var sample=(Array.isArray(e.samples)?e.samples:[]).find(function(s){
            return light&&s.distanceM===e.measuredDistanceM&&s.beamAngleDeg===light.beamAngleDeg;
          });
          if(!reading||!light||e.configurationMatchesReference!==true||!sample||
            selected.lux!==sample.lux||selected.distanceM!==sample.distanceM||
            selected.beamAngleDeg!==sample.beamAngleDeg||
            (e.requiresAttestedOptic && (!verifiedOptic||selected.opticId!==verifiedOptic.opticId||
              sample.opticId!==verifiedOptic.opticId))||
            selected.status!=='MANUFACTURER_REFERENCE_NOT_ON_SET_MEASUREMENT')
            throw new Error('Invalid manufacturer sample at reported distance');
        }
      });
    }
    if(planHash(plan)!==revision.planHash || revision.revisionId!=='rev-'+sha256(canonicalJson(revisionPayload(revision))) ||
      revision.lightPlotRevisionId!=='plot-'+revision.revisionId.slice(4))throw new Error('Revision integrity mismatch');
    return true;
  }
  function createRevision(raw, input, source, parent, sceneId) {
    if(parent)verifyRevision(parent);
    sceneId=sceneId || (parent&&parent.sceneId);
    if(!/^[A-Za-z0-9_-]{1,100}$/.test(sceneId||'') || (parent&&parent.sceneId!==sceneId))throw new Error('Invalid scene identity');
    var req=request(input);
    req.previousPlan=parent ? Object.assign({},parent.plan,{nextLightId:parent.nextLightId}) : null;
    var plan=sanitizePlan(raw,req,source);
    plan.dataStatus=provenance(plan,req);
    var next=plan.lights.reduce(function(n,l){return Math.max(n,Number(l.id.slice(1))+1);},parent?parent.nextLightId:1);
    var revision={schemaVersion:1,sceneId:sceneId,parentRevisionId:parent?parent.revisionId:null,
      sequence:parent?parent.sequence+1:1,nextLightId:next,plan:plan,planHash:planHash(plan)};
    revision.revisionId='rev-'+sha256(canonicalJson(revisionPayload(revision)));
    revision.lightPlotRevisionId='plot-'+revision.revisionId.slice(4);
    verifyRevision(revision);
    return freezeJson(revision);
  }
  function refreshAttestedOpticReference(plan, lightId) {
    var entry=plan.photometricBasis&&Array.isArray(plan.photometricBasis.entries)?
      plan.photometricBasis.entries.find(function(e){return e.lightId===lightId;}):null;
    if(!entry||!entry.requiresAttestedOptic)return;
    var light=plan.lights.find(function(l){return l.id===lightId;});
    var optic=(plan.opticConfirmations||[]).find(function(a){
      return a.lightId===lightId&&a.fixtureId===entry.fixtureId;
    });
    var measurement=(plan.distanceMeasurements||[]).find(function(a){
      return a.lightId===lightId&&a.fixtureId===entry.fixtureId;
    });
    entry.attestedOpticId=optic?optic.opticId:null;
    entry.measuredDistanceM=measurement?measurement.distanceM:null;
    var candidates=(entry.samples||[]).filter(function(s){return optic&&s.opticId===optic.opticId;});
    entry.configurationMatchesReference=!!(light&&optic&&candidates.length&&light.available&&
      light.kelvin===entry.cctK&&light.intensityPct===100&&!light.modifier&&
      light.beamAngleDeg===candidates[0].beamAngleDeg);
    var matching=entry.configurationMatchesReference&&measurement&&candidates.find(function(s){
      return s.distanceM===measurement.distanceM&&s.beamAngleDeg===light.beamAngleDeg;
    });
    entry.publishedReferenceAtMeasuredDistance=matching?{
      opticId:optic.opticId,distanceM:matching.distanceM,
      beamAngleDeg:matching.beamAngleDeg,lux:matching.lux,
      status:'MANUFACTURER_REFERENCE_NOT_ON_SET_MEASUREMENT'
    }:null;
    entry.onSetLux=null;
  }
  function createMountedOpticRevision(parent, report) {
    verifyRevision(parent);
    if(!report||typeof report!=='object'||Array.isArray(report)||report.confirmed!==true||
      typeof report.lightId!=='string'||typeof report.opticId!=='string')
      throw new Error('Explicit physical mounted-optic confirmation is required');
    var plan=JSON.parse(canonicalJson(parent.plan));
    var light=plan.lights.find(function(l){return l.id===report.lightId;});
    var basis=plan.photometricBasis&&Array.isArray(plan.photometricBasis.entries)?
      plan.photometricBasis.entries.find(function(e){return e.lightId===report.lightId;}):null;
    if(plan.mode!=='own'||!light||!light.available||!basis||!basis.requiresAttestedOptic||
      basis.fixtureId!==light.fixtureId)
      throw new Error('Verified owned fixture and manufacturer optic profile are required');
    var opticId=report.opticId;
    if(!/^[A-Z0-9_]{2,60}$/.test(opticId)||
      !basis.samples.some(function(sample){return sample.opticId===opticId;}))
      throw new Error('Unsupported mounted optic for this fixture');
    var item={lightId:light.id,fixtureId:light.fixtureId,opticId:opticId,
      source:'USER_REPORTED_MOUNTED_OPTIC_NOT_INDEPENDENTLY_VERIFIED',userAttested:true};
    plan.opticConfirmations=(plan.opticConfirmations||[])
      .filter(function(a){return a.lightId!==light.id;}).concat([item])
      .sort(function(a,b){return Number(a.lightId.slice(1))-Number(b.lightId.slice(1));});
    plan.dataStatus.mountedOptics='user-reported-not-independently-verified';
    // A changed or reconfirmed optic is a new physical setup: retain older lux only in its parent revision.
    if(Array.isArray(plan.incidentLuxReadings)){
      plan.incidentLuxReadings=plan.incidentLuxReadings.filter(function(x){return x.lightId!==light.id;});
      if(!plan.incidentLuxReadings.length){
        delete plan.incidentLuxReadings;
        delete plan.dataStatus.incidentLuxReadings;
      }
    }
    refreshAttestedOpticReference(plan,light.id);
    var revision={schemaVersion:1,sceneId:parent.sceneId,parentRevisionId:parent.revisionId,
      sequence:parent.sequence+1,nextLightId:parent.nextLightId,plan:plan,planHash:planHash(plan)};
    revision.revisionId='rev-'+sha256(canonicalJson(revisionPayload(revision)));
    revision.lightPlotRevisionId='plot-'+revision.revisionId.slice(4);
    verifyRevision(revision);
    return freezeJson(revision);
  }
  // Human-attested physical distance is stored in a new immutable revision, not inferred
  // from footage, AI or the plan's estimated light.distanceM.
  function createDistanceMeasurementRevision(parent, reading) {
    verifyRevision(parent);
    if(!reading||typeof reading!=='object'||Array.isArray(reading)||
      reading.confirmed!==true||typeof reading.lightId!=='string')
      throw new Error('Explicit on-set distance confirmation is required');
    var distance=measuredFixtureDistance(reading.distanceM);
    if(distance===null)throw new Error('Invalid measured fixture distance (0.1-100m)');
    var plan=JSON.parse(canonicalJson(parent.plan));
    var light=plan.lights.find(function(l){return l.id===reading.lightId;});
    if(plan.mode!=='own'||!light||light.available!==true||!light.fixtureId)
      throw new Error('Only available owned lights can have user-reported on-set distances');
    var list=Array.isArray(plan.distanceMeasurements)?plan.distanceMeasurements:[];
    var evidence={lightId:light.id,fixtureId:light.fixtureId,distanceM:distance,
      source:'USER_REPORTED_ON_SET_NOT_INDEPENDENTLY_VERIFIED',
      target:'SUBJECT_AT_MEASUREMENT_POINT',userAttested:true};
    plan.distanceMeasurements=list.filter(function(x){return x.lightId!==light.id;}).concat([evidence])
      .sort(function(a,b){return Number(a.lightId.slice(1))-Number(b.lightId.slice(1));});
    plan.dataStatus.distanceMeasurements='user-reported-not-independently-verified';
    // A changed/reconfirmed distance invalidates the meter reading at the former physical setup.
    if(Array.isArray(plan.incidentLuxReadings)){
      plan.incidentLuxReadings=plan.incidentLuxReadings.filter(function(x){return x.lightId!==light.id;});
      if(!plan.incidentLuxReadings.length){
        delete plan.incidentLuxReadings;
        delete plan.dataStatus.incidentLuxReadings;
      }
    }
    if(plan.photometricBasis && Array.isArray(plan.photometricBasis.entries)){
      plan.photometricBasis.entries.forEach(function(e){
        if(e.lightId!==light.id||e.fixtureId!==light.fixtureId)return;
        e.measuredDistanceM=distance;
        if(e.requiresAttestedOptic){
          refreshAttestedOpticReference(plan,light.id);
          return;
        }
        // Exact published sample at same reported distance and nominal settings only.
        // Lens alignment, target reflectance, modifiers, ambient and on-set lux remain unknown.
        var match=e.configurationMatchesReference===true &&
          (Array.isArray(e.samples)?e.samples:[]).find(function(s){
            return s.distanceM===distance && s.beamAngleDeg===light.beamAngleDeg;
          });
        e.publishedReferenceAtMeasuredDistance=match?{
          distanceM:distance,beamAngleDeg:match.beamAngleDeg,lux:match.lux,
          status:'MANUFACTURER_REFERENCE_NOT_ON_SET_MEASUREMENT'
        }:null;
        e.onSetLux=null;
      });
    }
    var revision={schemaVersion:1,sceneId:parent.sceneId,parentRevisionId:parent.revisionId,
      sequence:parent.sequence+1,nextLightId:parent.nextLightId,
      plan:plan,planHash:planHash(plan)};
    revision.revisionId='rev-'+sha256(canonicalJson(revisionPayload(revision)));
    revision.lightPlotRevisionId='plot-'+revision.revisionId.slice(4);
    verifyRevision(revision);
    return freezeJson(revision);
  }
  // Store only user-attested actual meter input, never infer it from AI, camera or product tables.
  // The fixture must be isolated and its physical distance already recorded for this same revision.
  function createIncidentLuxRevision(parent, report) {
    verifyRevision(parent);
    if(!report||typeof report!=='object'||Array.isArray(report)||
      report.confirmed!==true||report.fixtureIsolated!==true||
      typeof report.lightId!=='string')
      throw new Error('Explicit incident meter and isolated-light confirmation is required');
    var lux=incidentLux(report.lux);
    if(lux===null)throw new Error('Invalid measured incident lux (0-1000000 lx, up to 3 decimals)');
    var plan=JSON.parse(canonicalJson(parent.plan));
    var light=plan.lights.find(function(l){return l.id===report.lightId;});
    var distance=(plan.distanceMeasurements||[]).find(function(m){return m.lightId===report.lightId;});
    if(plan.mode!=='own'||!light||!light.available||!light.fixtureId||
      !distance||distance.fixtureId!==light.fixtureId)
      throw new Error('A verified owned light and its user-measured distance are required for incident lux');
    var evidence={
      lightId:light.id,fixtureId:light.fixtureId,lux:lux,unit:'lx',
      distanceMAtMeasurement:distance.distanceM,
      meterType:'INCIDENT_LUX_METER',target:'SUBJECT_AT_MEASUREMENT_POINT',
      measurementScope:'FIXTURE_ISOLATED_OTHER_SOURCES_CONTROLLED',
      source:'USER_REPORTED_INCIDENT_LUX_NOT_INDEPENDENTLY_VERIFIED',
      userAttested:true,fixtureIsolated:true
    };
    plan.incidentLuxReadings=(plan.incidentLuxReadings||[])
      .filter(function(x){return x.lightId!==light.id;}).concat([evidence])
      .sort(function(a,b){return Number(a.lightId.slice(1))-Number(b.lightId.slice(1));});
    plan.dataStatus.incidentLuxReadings='user-reported-not-independently-verified';
    // The manufacturer-reference onSetLux slot remains null: never relabel reported lux as published output.
    var revision={schemaVersion:1,sceneId:parent.sceneId,parentRevisionId:parent.revisionId,
      sequence:parent.sequence+1,nextLightId:parent.nextLightId,plan:plan,planHash:planHash(plan)};
    revision.revisionId='rev-'+sha256(canonicalJson(revisionPayload(revision)));
    revision.lightPlotRevisionId='plot-'+revision.revisionId.slice(4);
    verifyRevision(revision);
    return freezeJson(revision);
  }
  function restoreRevisions(items) {
    if(!Array.isArray(items) || !items.length)throw new Error('Empty revision history');
    var revisions=JSON.parse(canonicalJson(items));
    revisions.forEach(function(r,i){
      verifyRevision(r);
      if(i===0 ? r.sequence!==1 : r.sceneId!==revisions[0].sceneId ||
        r.parentRevisionId!==revisions[i-1].revisionId || r.sequence!==i+1 || r.nextLightId<revisions[i-1].nextLightId)
        throw new Error('Broken revision history');
    });
    return freezeJson(revisions);
  }
  // Future MP4 receipt contract only. No provider calls or paid-flow integration.
  function videoRevisionBinding(revision) {
    verifyRevision(revision);
    return freezeJson({schemaVersion:1,sceneId:revision.sceneId,revisionId:revision.revisionId,
      lightPlotRevisionId:revision.lightPlotRevisionId,planHash:revision.planHash});
  }
  return {VERSION:VERSION, request:request, equipment:equipment, modifiers:modifiers,
    canonicalJson:canonicalJson,sha256:sha256,planHash:planHash,createRevision:createRevision,
    createDistanceMeasurementRevision:createDistanceMeasurementRevision,
    createMountedOpticRevision:createMountedOpticRevision,
    createIncidentLuxRevision:createIncidentLuxRevision,
    verifyRevision:verifyRevision,restoreRevisions:restoreRevisions,videoRevisionBinding:videoRevisionBinding,
    sanitizePlan:sanitizePlan, localPlan:localPlan,chooseLook:chooseLook,nightLook:nightLook,
    cameraInput:cameraInput,cameraPlan:cameraPlan,exposureDeltaStops:exposureDeltaStops};
});
