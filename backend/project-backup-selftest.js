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
// generatePlan stores scenePhoto inside lighting_projects_v1, not in a separate key.
stored.set('lighting_projects_v1', JSON.stringify([{id:'p1', project:'Scena 12',
  scenePhoto:'data:image/jpeg;base64,TEST', language:'sr',
  plan:{description:'Bočno svetlo', camera:{focalLengthMm:35},
    rows:[{qty:2, image:'private image', authToken:'private token'}]},
  sun:{lat:44.8, lon:20.5}, location:{latitude:44.8, longitude:20.5}
}]));
const before = JSON.stringify([...stored]);
const equipment = [{id:'astera-titan', name:'TitanTube', qty:2, photo:'private image'}];
const equipmentBefore = JSON.stringify(equipment);
const nodes = new Map();
const timers = [];
const saves = [];
let copied = '';
function node(id) {
  return {id, checked:false, textContent:'', style:{}, handlers:{},
    addEventListener(event, fn) { this.handlers[event] = fn; },
    appendChild(child) { nodes.set(child.id, child); },
    set innerHTML(html) {
      for (const match of html.matchAll(/id="([^"]+)"/g)) nodes.set(match[1], node(match[1]));
    }
  };
}
nodes.set('planner', node('planner'));
const context = vm.createContext({
  document:{getElementById:id=>nodes.get(id)||null, createElement:()=>node('')},
  localStorage:{get length(){return stored.size;}, key:i=>[...stored.keys()][i], getItem:key=>stored.get(key)??null,
    setItem(){throw Error('Export must not write storage');}, removeItem(){throw Error('Export must not delete storage');}},
  equipment,
  navigator:{clipboard:{writeText:async value=>{copied=value;}}},
  Android:{saveText:(name, text)=>saves.push({name, text})},
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
  assert.equal(backup.restoreSupported, false);
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
  for (const key of sunKeys) assert.equal(copied.includes('• '+key), includeSun);
  assert.ok(copied.includes('selectedEquipment: 1'));
  nodes.get('projectBackupSave').handlers.click();
  const saved = JSON.parse(saves.at(-1).text);
  assert.deepEqual(saved.storage, backup.storage);
  assert.equal(saved.includesSunLocationData, includeSun);
  assert.match(saves.at(-1).name, /^LightingAI_Project_Backup_.*\.json$/);
}
assert.equal(JSON.stringify([...stored]), before, 'Source storage remains unchanged');
assert.equal(JSON.stringify(equipment), equipmentBefore, 'Live selected equipment remains unchanged');
console.log('Project Backup: planner data, SUNCE opt-in, nested exclusions, summary, Android export and read-only checks passed.');
