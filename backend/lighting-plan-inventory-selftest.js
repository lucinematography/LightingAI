import assert from "node:assert/strict";
import {buildRuntimeCatalog} from "./catalog-runtime.js";
import {prepareLightingInventory,assertLightingPlanInventory,lightingInventoryFailure} from "./lighting-plan-inventory.js";

globalThis.fetch=()=>{throw new Error("External network forbidden");};
let groups=0;
function check(name,run){run();groups++;console.log("PASS "+name);}
const catalog=buildRuntimeCatalog();
const f="aputure-ls-600d-pro",other="aputure-ls-600x-pro",acc="aputure-bowens-standard-reflector";
const name=(id,c=catalog)=>{const item=[...c.fixtures,...c.accessories].find(x=>x.id===id);return [item.manufacturer,item.model].filter(Boolean).join(" ");};
const selection=(id,qty=1)=>({id,qty});
function light(id="L1",fixtureId=f,accessoryIds=[],c=catalog){return {id,fixtureId,fixture:name(fixtureId,c),role:"KEY",accessoryIds,accessories:accessoryIds.map(id=>name(id,c)),x:25,y:30,targets:["S1"]};}
function plan(lights=[light()]){return {summary:"Simulated plan ČĆŠŽĐ",key:"Use selected equipment",lighting_diagram:{subjects:[{id:"S1",x:50,y:50}],lights},equipment_list:[]};}
function validate(p,items=[selection(f)],c=catalog){return assertLightingPlanInventory(p,prepareLightingInventory(items,c));}
function rejects(reason,run){assert.throws(run,error=>error.inventory?.reason===reason,reason);}
const clone=value=>JSON.parse(JSON.stringify(value));

check("one owned fixture cannot authorize two simultaneous instances",()=>{
  const p=plan([light(),light("L2")]),before=clone(p);
  assert.throws(()=>validate(p),error=>error.code==="LIGHTING_PLAN_INVENTORY"&&error.inventory.available===1&&error.inventory.proposed===2);
  assert.deepEqual(p,before,"rejection must not remove lamps or mutate input");
});
check("two owned fixtures permit two instances without truncation or replacement",()=>{
  const p=plan([light(),light("L2")]),before=clone(p);assert.equal(validate(p,[selection(f,2)]),p);assert.deepEqual(p,before);
});
check("different models have independent quantity budgets",()=>{
  const items=[selection(f,2),selection(other)];
  validate(plan([light(),light("L2"),light("L3",other)]),items);
  rejects("fixture_quantity",()=>validate(plan([light(),light("L2",other),light("L3",other)]),items));
});
check("known name cannot authorize missing, invented or unselected fixture ID",()=>{
  for(const id of [undefined,"unknown",other]){const l=light();l.fixtureId=id;rejects("fixture_unavailable",()=>validate(plan([l])));}
});
check("fixture names inconsistent with verified IDs are rejected",()=>{
  const l=light();l.fixture="Unselected expensive fixture";rejects("fixture_label",()=>validate(plan([l])));
});
check("selection is canonicalized by ID, never guessed from user labels",()=>{
  const inv=prepareLightingInventory([{id:f,fixtureId:f,name:"wrong client label",qty:1}],catalog);
  assert.equal(inv.equipment[0].name,name(f));assertLightingPlanInventory(plan(),inv);
  rejects("selection_id",()=>prepareLightingInventory([{name:name(f),qty:1}],catalog));
  rejects("selection_id",()=>prepareLightingInventory([{id:f,fixtureId:other}],catalog));
  rejects("selection_id",()=>prepareLightingInventory([{id:f,accessoryId:f}],catalog));
});
check("duplicate selection rows cannot inflate availability",()=>{
  rejects("duplicate_selection",()=>prepareLightingInventory([selection(f),selection(f)],catalog));
});
check("invalid quantities and unsupported kit quantities fail before provider call",()=>{
  for(const qty of [0,-1,1.5,NaN,null,"", "2.5",1001])rejects("selection_quantity",()=>prepareLightingInventory([selection(f,qty)],catalog));
  validate(plan([light(),light("L2")]),[selection(f,"2")]);
  rejects("selection_id",()=>prepareLightingInventory([{id:catalog.kits[0].id,kitId:catalog.kits[0].id,qty:1}],catalog));
});
check("unknown or unselected optional accessories cannot be mounted",()=>{
  rejects("accessory_unavailable",()=>validate(plan([light("L1",f,[acc])])));
  const l=light();l.accessoryIds=["invented"];l.accessories=[name(acc)];rejects("accessory_unavailable",()=>validate(plan([l])));
});
check("accessory names alone or mismatched labels do not authorize equipment",()=>{
  const l=light();l.accessories=[name(acc)];rejects("accessory_ids",()=>validate(plan([l])));
  const bad=light("L1",f,[acc]);bad.accessories=["Invented softbox"];
  rejects("accessory_unavailable",()=>validate(plan([bad]),[selection(f),selection(acc)]));
});
check("selected compatible accessory is accepted unchanged",()=>{
  const p=plan([light("L1",f,[acc])]);p.equipment_list=[name(f),name(acc)];
  assert.equal(validate(p,[selection(f),selection(acc)]),p);
});
check("one optional accessory cannot be shared simultaneously by two lamps",()=>{
  const p=plan([light("L1",f,[acc]),light("L2",f,[acc])]);
  rejects("accessory_quantity",()=>validate(p,[selection(f,2),selection(acc)]));
  validate(p,[selection(f,2),selection(acc,2)]);
});
check("repeated accessory IDs consume repeated physical quantities",()=>{
  const p=plan([light("L1",f,[acc,acc])]);
  rejects("accessory_quantity",()=>validate(p,[selection(f),selection(acc)]));
  validate(p,[selection(f),selection(acc,2)]);
});
check("included accessory budget is tied to each actual selected fixture",()=>{
  const fixture="aputure-ls-1200d-pro",included="aputure-ls1200-hyper-reflector-narrow";
  validate(plan([light("L1",fixture,[included]),light("L2",fixture,[included])]),[selection(fixture,2)]);
  rejects("accessory_unavailable",()=>validate(plan([light("L1",f,[included])])));
  rejects("accessory_unavailable",()=>validate(plan([light("L1",fixture,[included,included])]),[selection(fixture)]));
});

const graph={fixtures:[{id:"f",manufacturer:"Test",model:"Fixture"}],accessories:[
  {id:"parent",manufacturer:"Test",model:"Adapter",compatibleWith:["f"]},
  {id:"child",manufacturer:"Test",model:"Lens",compatibleWith:["parent"]},
  {id:"blocked",manufacturer:"Test",model:"Blocked",compatibleWith:["f"],compatibilityStatus:"Do Not Use"},
  {id:"unrelated",manufacturer:"Test",model:"Unrelated",compatibleWith:["other"]},
  {id:"cycle1",manufacturer:"Test",model:"Cycle 1",compatibleWith:["cycle2"]},
  {id:"cycle2",manufacturer:"Test",model:"Cycle 2",compatibleWith:["cycle1"]}
]};
check("dependent modifier needs its parent mounted on the same fixture",()=>{
  const items=[selection("f"),selection("parent"),selection("child")];
  rejects("accessory_parent",()=>validate(plan([light("L1","f",["child"],graph)]),items,graph));
  validate(plan([light("L1","f",["child","parent"],graph)]),items,graph);
});
check("incompatible accessories and disconnected mounting cycles are rejected",()=>{
  rejects("accessory_incompatible",()=>validate(plan([light("L1","f",["blocked"],graph)]),[selection("f"),selection("blocked")],graph));
  rejects("accessory_parent",()=>validate(plan([light("L1","f",["unrelated"],graph)]),[selection("f"),selection("unrelated")],graph));
  rejects("accessory_parent",()=>validate(plan([light("L1","f",["cycle1","cycle2"],graph)]),[selection("f"),selection("cycle1"),selection("cycle2")],graph));
});
check("ambiguous light instances cannot hide excess quantities",()=>{
  rejects("light_instance",()=>validate(plan([light(),light()]),[selection(f,2)]));
  for(const key of ["qty","quantity","count"]){const l=light();l[key]=2;rejects("light_instance",()=>validate(plan([l])));}
  validate(plan([])); // A natural-light-only plan may use zero artificial lamps.
  rejects("lights_required",()=>validate({summary:"Missing structured light list"}));
});
check("displayed equipment list cannot introduce additional unverified items",()=>{
  const p=plan();p.equipment_list=["Imaginary extra lamp"];
  rejects("equipment_list",()=>validate(p));
  p.equipment_list=[name(f)];validate(p);
});
check("clear SR and EN errors state proposed/available quantity and blocked PDF",()=>{
  let error;try{validate(plan([light(),light("L2")]));}catch(e){error=e;}
  const sr=lightingInventoryFailure(error,"sr"),en=lightingInventoryFailure(error,"en");
  assert.equal(sr.status,502);assert.match(sr.body.error,/predloženo je 2, a dostupno je 1/);assert.match(sr.body.error,/PDF izvoz je blokiran/);
  assert.match(en.body.error,/requires 2, but only 1 available/);assert.match(en.body.error,/PDF export is blocked/);
});
console.log(`Lighting inventory regression: ${groups} groups passed, no provider calls.`);
