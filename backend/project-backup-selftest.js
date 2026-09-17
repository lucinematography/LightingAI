import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app/src/main/assets/project-backup-export.js', import.meta.url), 'utf8');
const plannerKeys = [
  'lighting_set_sketch_v1', 'lighting_scene_measurements_v1', 'lighting_dmx_patch_v1',
  'lighting_dof_planner_v1', 'lighting_flicker_planner_v1', 'lighting_continuity_v1',
  'lighting_shot_list_v1', 'lighting_cue_planner_v1', 'lighting_beam_coverage_v1',
  'lighting_camera_setups_v1', 'lighting_ratio_v1', 'lighting_power_calculator_v1',
  'lighting_cct_gel_v1', 'lighting_shot_setup_notes_v1', 'lighting_equipment_v1'
];
const sunKeys = ['lightingai_sun_locations_v1', 'lightingai_sun_shot_presets_v1', 'lighting_set_sketch_sun_v1'];
const blockedKeys = ['lighting_language_v1', 'lighting_backend_v1', 'lighting_api_v1',
  'lighting_auth_v1', 'lighting_token_v1', 'lighting_device_v1', 'lighting_diagnostics_v1',
  'lighting_photo_v1', 'lighting_image_v1', 'other_app_data', 'lightingai_unrelated_v1'];
const stored = new Map();
plannerKeys.forEach(key => stored.set(key, JSON.stringify({sceneId:'scene-1', value:42})));
sunKeys.forEach(key => stored.set(key, JSON.stringify([{name:'Lokacija', lat:44.8, lon:20.5}])));
blockedKeys.forEach(key => stored.set(key, JSON.stringify('excluded')));
stored.set('lighting_projects_v1', JSON.stringify([{id:'p1', project:'Scena 12',
  scenePhoto:'data:image/jpeg;base64,TEST', language:'sr',
  plan:{description:'Bočno svetlo', camera:{focalLengthMm:35},
    rows:[{qty:2, image:'private image', authToken:'private token'}]},
  sun:{lat:44.8, lon:20.5}, location:{latitude:44.8, longitude:20.5}
}]));
const beforeExport = JSON.stringify([...stored]);
const equipment = [{id:'astera-titan', name:'TitanTube', qty:2, photo:'private image'}];
const equipmentBefore = JSON.stringify(equipment);
const nodes = new Map();
const timers = [];
const saves = [];
let copied = '';
function node(id) {
  return {id, checked:false, textContent:'', style:{}, hidden:false, handlers:{}, value:'', files:null,
    addEventListener(event, fn) { this.handlers[event] = fn; },
    appendChild(child) { nodes.set(child.id, child); },
    click() {},
    set innerHTML(html) {
      for (const match of html.matchAll(/id="([^"]+)"/g)) nodes.set(match[1], node(match[1]));
    }
  };
}
nodes.set('planner', node('planner'));
const context = vm.createContext({
  document:{getElementById:id=>nodes.get(id)||null, createElement:()=>node('')},
  localStorage:{get length(){return stored.size;}, key:i=>[...stored.keys()][i], getItem:key=>stored.get(key)??null,
    setItem(key,value){stored.set(key,value);}, removeItem(key){stored.delete(key);}},
  equipment,
  projects:[],
  renderEquipment(){}, renderProjects(){},
  navigator:{clipboard:{writeText:async value=>{copied=value;}}},
  Android:{saveText:(name, text)=>saves.push({name, text})},
  FileReader:class {},
  setInterval:fn=>{timers.push(fn);return timers.length;}, clearInterval(){}, setTimeout(){}
});
context.window = context;
vm.runInContext(source, context);
const snapshot = () => JSON.parse(JSON.stringify(context.LightingAIProjectBackupSnapshot()));
assert.equal(snapshot().includesSunLocationData, false, 'SUNCE is off before the UI mounts');
timers[0]();
assert.equal(nodes.get('projectBackupSun').checked, false, 'SUNCE checkbox defaults to off');

for (const includeSun of [false, true]) {
  nodes.get('projectBackupSun').checked = includeSun;
  const backup = snapshot();
  assert.equal(backup.restoreSupported, true);
  assert.equal(backup.includesSunLocationData, includeSun);
  for (const key of plannerKeys) assert.deepEqual(backup.storage[key], JSON.parse(stored.get(key)), key);
  for (const key of blockedKeys) assert.equal(Object.hasOwn(backup.storage, key), false, key);
  for (const key of sunKeys) {
    assert.equal(Object.hasOwn(backup.storage, key), includeSun, key);
    if (includeSun) assert.deepEqual(backup.storage[key], JSON.parse(stored.get(key)));
  }
  const project = backup.storage.lighting_projects_v1[0];
  assert.equal(project.project, 'Scena 12');
  assert.equal(Object.hasOwn(project, 'scenePhoto'), false);
  assert.equal(Object.hasOwn(project, 'language'), false);
  assert.deepEqual(project.plan, {description:'Bočno svetlo', camera:{focalLengthMm:35}, rows:[{qty:2}]});
  assert.equal(Object.hasOwn(project, 'sun'), includeSun);
  assert.equal(Object.hasOwn(project, 'location'), includeSun);
  assert.deepEqual(backup.runtime.selectedEquipment, [{id:'astera-titan', name:'TitanTube', qty:2}]);
  assert.deepEqual(backup.storageKeys, Object.keys(backup.storage).sort());

  await nodes.get('projectBackupCopy').handlers.click();
  for (const key of backup.storageKeys) assert.ok(copied.includes('• '+key));
  nodes.get('projectBackupSave').handlers.click();
  const saved = JSON.parse(saves.at(-1).text);
  assert.deepEqual(saved.storage, backup.storage);
  assert.match(saves.at(-1).name, /^LightingAI_Project_Backup_.*\.json$/);
}
assert.equal(JSON.stringify([...stored]), beforeExport, 'Export must not mutate source storage');
assert.equal(JSON.stringify(equipment), equipmentBefore, 'Export must not mutate live selected equipment');

// Safe import: only validated LightingAI planning keys are staged and nothing changes before confirmation.
const importFile = {
  schema:'lightingai-project-backup-v1', generatedAt:'2026-09-17T00:00:00Z', includesSunLocationData:false,
  storage:{
    lighting_set_sketch_v1:{activeId:'restored'},
    lighting_projects_v1:[{id:'restored', project:'Vraćena scena', scenePhoto:'blocked', language:'en', plan:{description:'OK', authToken:'blocked'}}],
    lighting_language_v1:'en', lighting_backend_v1:{url:'blocked'},
    lighting_set_sketch_sun_v1:{lat:44.8,lon:20.5}
  },
  runtime:{selectedEquipment:[{id:'astera-titan',name:'TitanTube',qty:3,photo:'blocked'}]}
};
const beforeStage = JSON.stringify([...stored]);
const staged = context.LightingAIProjectBackupImport.stageText(JSON.stringify(importFile));
assert.deepEqual(staged.storageKeys, ['lighting_projects_v1','lighting_set_sketch_v1']);
assert.equal(Object.hasOwn(staged.storage,'lighting_language_v1'), false);
assert.equal(Object.hasOwn(staged.storage,'lighting_backend_v1'), false);
assert.equal(Object.hasOwn(staged.storage,'lighting_set_sketch_sun_v1'), false);
assert.equal(staged.storage.lighting_projects_v1[0].scenePhoto, undefined);
assert.equal(staged.storage.lighting_projects_v1[0].language, undefined);
assert.equal(staged.storage.lighting_projects_v1[0].plan.authToken, undefined);
assert.deepEqual(staged.selectedEquipment, [{id:'astera-titan',name:'TitanTube',qty:3}]);
assert.equal(JSON.stringify([...stored]), beforeStage, 'Staging import must be read-only');
const applied = context.LightingAIProjectBackupImport.apply();
assert.equal(applied.ok, true);
assert.deepEqual(JSON.parse(stored.get('lighting_set_sketch_v1')), {activeId:'restored'});
assert.equal(JSON.parse(stored.get('lighting_projects_v1'))[0].project, 'Vraćena scena');
assert.equal(stored.get('lighting_language_v1'), JSON.stringify('excluded'), 'Language must not be overwritten');
assert.equal(stored.get('lighting_backend_v1'), JSON.stringify('excluded'), 'Backend settings must not be overwritten');
assert.equal(JSON.parse(stored.get('lighting_equipment_v1'))[0].qty, 3);

assert.throws(()=>context.LightingAIProjectBackupImport.stageText('{bad json'), /schema/);
assert.throws(()=>context.LightingAIProjectBackupImport.stageText(JSON.stringify({schema:'wrong',storage:{}})), /schema/);
console.log('Project Backup: export, exclusions, SUNCE opt-in and safe two-step import checks passed.');