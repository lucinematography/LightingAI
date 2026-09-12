import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { FIXTURE_LIBRARY } from "./fixture-library.js";
import { ACCESSORY_LIBRARY } from "./accessory-library.js";
import { ADDITIONAL_ACCESSORY_LIBRARY } from "./additional-accessory-library.js";
import { applyAccessoryCompatibilityOverrides } from "./accessory-compatibility-overrides.js";
import { validateCatalog } from "./catalog-validation.js";

for (const accessory of ADDITIONAL_ACCESSORY_LIBRARY) {
  if (!ACCESSORY_LIBRARY.some(existing => existing.id === accessory.id)) ACCESSORY_LIBRARY.push(accessory);
}
applyAccessoryCompatibilityOverrides(ACCESSORY_LIBRARY);
const catalogHealth = validateCatalog();
if (!catalogHealth.ok) console.error("LIGHTING AI catalog validation errors:", catalogHealth.errors);
if (catalogHealth.warnings.length) console.warn("LIGHTING AI catalog validation warnings:", catalogHealth.warnings);

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function normalizeEquipmentName(value = "") { return String(value).toLowerCase().replace(/aputure/g, "").replace(/[^a-z0-9]+/g, "").trim(); }
function normalizeConditions(value) { if (!value) return []; return Array.isArray(value) ? value.filter(Boolean) : [String(value)]; }
function resolveFixture(e = {}) {
  if (e.fixtureId) { const byId = FIXTURE_LIBRARY.find(f => f.id === e.fixtureId); if (byId) return byId; }
  const equipmentName = normalizeEquipmentName(e.name); if (!equipmentName) return null;
  const exact = FIXTURE_LIBRARY.find(f => { const model=normalizeEquipmentName(f.model); return equipmentName===model || equipmentName===model.replace(/^ls/,"") || equipmentName===normalizeEquipmentName(`${f.manufacturer||""} ${f.model||""}`); });
  if (exact) return exact;
  const aliases={"60d":"aputure-ls-60d","ls60d":"aputure-ls-60d","60x":"aputure-ls-60x","ls60x":"aputure-ls-60x","300dii":"aputure-ls-300d-ii","ls300dii":"aputure-ls-300d-ii","300x":"aputure-ls-300x","ls300x":"aputure-ls-300x","600d":"aputure-ls-600d","ls600d":"aputure-ls-600d","600dpro":"aputure-ls-600d-pro","ls600dpro":"aputure-ls-600d-pro","600cproii":"aputure-ls-600c-pro-ii","ls600cproii":"aputure-ls-600c-pro-ii","600xpro":"aputure-ls-600x-pro","ls600xpro":"aputure-ls-600x-pro","1200dpro":"aputure-ls-1200d-pro","ls1200dpro":"aputure-ls-1200d-pro","storm1000c":"aputure-storm-1000c","1000c":"aputure-storm-1000c","storm1200x":"aputure-storm-1200x","1200x":"aputure-storm-1200x"};
  const fixtureId=aliases[equipmentName]; return fixtureId ? FIXTURE_LIBRARY.find(f=>f.id===fixtureId)||null : null;
}
function accessoryDetails(a, fixtureId = null) {
  const fc=fixtureId ? a.compatibility?.[fixtureId] : null;
  const status=fc?.status||a.compatibilityStatus||"Compatible";
  const conditions=[...new Set([...normalizeConditions(a.conditions),...normalizeConditions(fc?.conditions)])];
  return [a.category&&`type: ${a.category}`,`status: ${status}`,`availability: ${a.includedWithFixture===true?"INCLUDED WITH FIXTURE":"OPTIONAL ACCESSORY"}`,conditions.length&&`conditions: ${conditions.join("; ")}`,a.mount&&`mount: ${a.mount}`,a.beamAngleDeg&&`beam: ${a.beamAngleDeg.min}-${a.beamAngleDeg.max}deg`,a.availableLensAnglesDeg&&`lenses: ${a.availableLensAnglesDeg.join('/')}deg`,a.gridAngleDeg&&`grid: ${a.gridAngleDeg}deg`,a.diffusionStops&&`diffusion: ${a.diffusionStops.join('/')} stop`,a.effectOnLight&&`effect: ${a.effectOnLight}`].filter(Boolean).join(", ");
}
function accessoryTreeForFixture(fixtureId) {
  const reachable = new Set([fixtureId]);
  const depth = new Map([[fixtureId, 0]]);
  const parentNames = new Map();
  const found = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const a of ACCESSORY_LIBRARY) {
      if (reachable.has(a.id)) continue;
      const parents=(a.compatibleWith||[]).filter(id=>reachable.has(id));
      if (!parents.length) continue;
      const parentDepth=Math.min(...parents.map(id=>depth.get(id)??0));
      reachable.add(a.id); depth.set(a.id,parentDepth+1);
      parentNames.set(a.id,parents.map(id=>{
        if(id===fixtureId)return FIXTURE_LIBRARY.find(f=>f.id===fixtureId)?.model||fixtureId;
        return ACCESSORY_LIBRARY.find(x=>x.id===id)?.model||id;
      }));
      found.push(a); changed=true;
    }
  }
  return found.sort((a,b)=>(depth.get(a.id)||0)-(depth.get(b.id)||0)).map(a=>{
    const d=depth.get(a.id)||1;
    const parents=parentNames.get(a.id)||[];
    const dependency=d>1?`dependency level: ${d-1}, requires: ${parents.join(' or ')}`:'direct fixture accessory';
    return `${a.manufacturer} ${a.model} [${accessoryDetails(a,d===1?fixtureId:null)}, ${dependency}]`;
  });
}
function formatEquipmentForAI(equipment = []) {
  return equipment.map(e => {
    const fixture=resolveFixture(e); if(!fixture) return `${e.name} x${e.qty||1}`;
    const specs=[fixture.sourceType&&`source: ${fixture.sourceType}`,fixture.powerDrawW&&`power draw: ${fixture.powerDrawW}W`,fixture.outputPowerW&&`output power: ${fixture.outputPowerW}W`,fixture.cctK&&`CCT: ${fixture.cctK.min}-${fixture.cctK.max}K`,fixture.colorMode&&`color: ${fixture.colorMode}`,fixture.cri&&`CRI: ${fixture.cri}`,fixture.tlci&&`TLCI: ${fixture.tlci}`,fixture.mount&&`mount: ${fixture.mount}`,fixture.ipRating&&`IP: ${fixture.ipRating}`].filter(Boolean).join(", ");
    const accessories=accessoryTreeForFixture(fixture.id);
    return `${e.name} x${e.qty||1}${specs?` [${specs}]`:""}${accessories.length?` | Verified accessory tree: ${accessories.join("; ")}`:""}`;
  }).join("; ");
}

app.get("/health",(req,res)=>res.json({ok:true,service:"LIGHTING AI backend",catalog:{ok:catalogHealth.ok,fixtures:catalogHealth.fixtureCount,accessories:catalogHealth.accessoryCount,errors:catalogHealth.errors.length,warnings:catalogHealth.warnings.length}}));
app.get("/api/catalog-health",(req,res)=>res.status(catalogHealth.ok?200:500).json(catalogHealth));
app.post("/api/analyze-scene",async(req,res)=>{try{const{image,description="",equipment=[],language="sr"}=req.body;if(!image)return res.status(400).json({error:"Nedostaje fotografija scene."});const equipmentText=formatEquipmentForAI(equipment);const prompt=language==="en"?`You are a professional film and studio lighting assistant. Analyze the supplied scene photograph. Available equipment: ${equipmentText||"Not provided"}. Scene description: ${description||"Not provided"}. Use only listed fixtures and explicitly compatible accessories. Never invent compatibility. OPTIONAL ACCESSORY must not be assumed physically available. Follow the complete accessory dependency chain: a dependency-level accessory may be used only when every required parent modifier in its chain is present. Respect every compatibility status and condition. Clearly state Compatible but not optimized when applicable. Give practical key, fill, negative fill, backlight, color, placement, exposure and safety recommendations.`:`Ti si profesionalni asistent za filmsku i studijsku rasvetu. Analiziraj fotografiju scene. Dostupna oprema: ${equipmentText||"Nije uneta"}. Opis scene: ${description||"Nije unet"}. Koristi samo navedena rasvetna tela i eksplicitno kompatibilne dodatke. Ne izmisljaj kompatibilnost. OPTIONAL ACCESSORY ne sme se pretpostaviti kao fizicki dostupan. Prati ceo lanac zavisnosti dodataka: zavisni dodatak sme se koristiti samo kada su prisutni svi potrebni parent modifikatori u njegovom lancu. Postuj svaki status i uslov. Jasno navedi Compatible but not optimized kada vazi. Daj prakticne preporuke za key, fill, negative fill, backlight, boju, pozicije, ekspoziciju i bezbednost.`;const response=await openai.responses.create({model:"gpt-5.6-luna",input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:image}]}]});res.json({analysis:response.output_text});}catch(error){console.error(error);res.status(500).json({error:"Scene analysis failed."});}});
app.post("/api/lighting-plan",async(req,res)=>{try{const{project="",scene="",type="",look="",space="",camera="",description="",scenePhoto="",equipment=[],language="sr"}=req.body;const equipmentText=formatEquipmentForAI(equipment);const prompt=`You are LIGHTING AI, a professional gaffer assistant. ${language==="en"?"Write all JSON text values in English.":"Write all JSON text values in Serbian, Latin script."} Project: ${project}. Scene: ${scene}. Production type: ${type}. Look: ${look}. Space: ${space}. Camera: ${camera}. Description: ${description}. Available equipment: ${equipmentText||"Not provided"}. Use only listed fixtures and explicitly compatible accessories. Never invent accessories or compatibility. INCLUDED WITH FIXTURE may be treated as available; OPTIONAL ACCESSORY must not be assumed physically available. Follow complete accessory dependency chains and use a dependent accessory only when every required parent modifier is present. Respect every compatibility status and condition. Return ONLY valid JSON with exactly these fields: {"summary":"","key":"","fill":"","backlight":"","negative_fill":"","camera_notes":"","color_notes":"","safety_notes":"","equipment_list":[]}.`;const content=[{type:"input_text",text:prompt}];if(scenePhoto)content.push({type:"input_image",image_url:scenePhoto});const response=await openai.responses.create({model:"gpt-5.6-luna",input:[{role:"user",content}]});let text=response.output_text.trim().replace(/^```json\s*/i,"").replace(/```$/i,"").trim();res.json(JSON.parse(text));}catch(error){console.error(error);res.status(500).json({error:"Lighting plan generation failed."});}});
app.get('/api/fixtures',(req,res)=>res.json(FIXTURE_LIBRARY));
app.get('/',(req,res)=>res.sendFile(process.cwd()+'/index.html'));
const port=process.env.PORT||3000;app.listen(port,()=>console.log(`LIGHTING AI backend running on port ${port}`));
