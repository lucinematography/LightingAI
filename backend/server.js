import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { RUNTIME_CATALOG } from "./catalog-runtime.js";
import { validateCatalog } from "./catalog-validation.js";
import { catalogStatus } from "./catalog-status.js";
import { accessoryRecord, buildAccessoryTree } from "./accessory-graph.js";
import { aputureReviewCatalog, aputureReviewHtml } from "./aputure-review.js";

const FIXTURE_LIBRARY = RUNTIME_CATALOG.fixtures;
const ACCESSORY_LIBRARY = RUNTIME_CATALOG.accessories;
const catalogHealth = validateCatalog(RUNTIME_CATALOG);
if (!catalogHealth.ok) console.error("LIGHTING AI catalog validation errors:", catalogHealth.errors);
if (catalogHealth.warnings.length) console.warn("LIGHTING AI catalog validation warnings:", catalogHealth.warnings);

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function normalizeEquipmentName(value = "") { return String(value).toLowerCase().replace(/aputure/g, "").replace(/[^a-z0-9]+/g, "").trim(); }
const FIXTURE_ALIASES = new Map();
for (const fixture of FIXTURE_LIBRARY) {
  const model = normalizeEquipmentName(fixture.model);
  const manufacturerModel = normalizeEquipmentName(`${fixture.manufacturer || ''} ${fixture.model || ''}`);
  const idAlias = normalizeEquipmentName(String(fixture.id || '').replace(/^aputure-/, ''));
  for (const alias of new Set([model, manufacturerModel, idAlias, model.replace(/^ls/, '')])) if (alias) FIXTURE_ALIASES.set(alias, fixture.id);
}
function resolveFixture(e = {}) {
  if (e.fixtureId) { const byId = RUNTIME_CATALOG.fixtureById.get(e.fixtureId); if (byId) return byId; }
  const equipmentName = normalizeEquipmentName(e.name); if (!equipmentName) return null;
  const fixtureId = FIXTURE_ALIASES.get(equipmentName);
  return fixtureId ? RUNTIME_CATALOG.fixtureById.get(fixtureId) || null : null;
}
function accessoryDetails(a, fixtureId = null) {
  const r=accessoryRecord(a,fixtureId);
  return [r.category&&`type: ${r.category}`,`status: ${r.status}`,`availability: ${r.availability==="included"?"INCLUDED WITH FIXTURE":"OPTIONAL ACCESSORY"}`,r.conditions.length&&`conditions: ${r.conditions.join("; ")}`,r.mount&&`mount: ${r.mount}`,a.beamAngleDeg&&`beam: ${a.beamAngleDeg.min}-${a.beamAngleDeg.max}deg`,a.availableLensAnglesDeg&&`lenses: ${a.availableLensAnglesDeg.join('/')}deg`,a.gridAngleDeg&&`grid: ${a.gridAngleDeg}deg`,a.diffusionStops&&`diffusion: ${a.diffusionStops.join('/')} stop`,r.effectOnLight&&`effect: ${r.effectOnLight}`].filter(Boolean).join(", ");
}
function accessoryTreeRecords(fixtureId) { return buildAccessoryTree(fixtureId,RUNTIME_CATALOG); }
function accessoryTreeForFixture(fixtureId) {
  return accessoryTreeRecords(fixtureId).map(r=>{
    const parentNames=r.parentIds.map(id=>id===fixtureId?(RUNTIME_CATALOG.fixtureById.get(id)?.model||id):(RUNTIME_CATALOG.accessoryById.get(id)?.model||id));
    const dependency=r.depth>1?`dependency level: ${r.depth-1}, requires: ${parentNames.join(' or ')}`:'direct fixture accessory';
    const a=RUNTIME_CATALOG.accessoryById.get(r.id);
    return `${r.manufacturer} ${r.model} [${accessoryDetails(a,r.depth===1?fixtureId:null)}, ${dependency}]`;
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

app.get("/health",(req,res)=>res.json({ok:catalogHealth.ok,service:"LIGHTING AI backend",catalog:{ok:catalogHealth.ok,fixtures:catalogHealth.fixtureCount,accessories:catalogHealth.accessoryCount,errors:catalogHealth.errors.length,warnings:catalogHealth.warnings.length}}));
app.get("/api/catalog-health",(req,res)=>res.status(catalogHealth.ok?200:500).json(catalogHealth));
app.get("/api/catalog-status",(req,res)=>res.json(catalogStatus()));
app.get("/api/fixtures",(req,res)=>res.json(FIXTURE_LIBRARY));
app.get("/api/accessories",(req,res)=>res.json(ACCESSORY_LIBRARY));
app.get("/api/fixtures/:id/accessories",(req,res)=>{const fixture=RUNTIME_CATALOG.fixtureById.get(req.params.id);if(!fixture)return res.status(404).json({error:"Fixture not found."});res.json({fixture,accessories:accessoryTreeRecords(fixture.id)});});
app.get("/api/review/aputure",(req,res)=>res.json(aputureReviewCatalog()));
app.get("/review/aputure",(req,res)=>res.type('html').send(aputureReviewHtml()));
app.post("/api/analyze-scene",async(req,res)=>{try{const{image,description="",equipment=[],language="sr"}=req.body;if(!image)return res.status(400).json({error:"Nedostaje fotografija scene."});const equipmentText=formatEquipmentForAI(equipment);const prompt=language==="en"?`You are a professional film and studio lighting assistant. Analyze the supplied scene photograph. Available equipment: ${equipmentText||"Not provided"}. Scene description: ${description||"Not provided"}. Use only listed fixtures and explicitly compatible accessories. Never invent compatibility. OPTIONAL ACCESSORY must not be assumed physically available. Follow the complete accessory dependency chain: a dependency-level accessory may be used only when every required parent modifier in its chain is present. Respect every compatibility status and condition. Clearly state Compatible but not optimized when applicable. Give practical key, fill, negative fill, backlight, color, placement, exposure and safety recommendations.`:`Ti si profesionalni asistent za filmsku i studijsku rasvetu. Analiziraj fotografiju scene. Dostupna oprema: ${equipmentText||"Nije uneta"}. Opis scene: ${description||"Nije unet"}. Koristi samo navedena rasvetna tela i eksplicitno kompatibilne dodatke. Ne izmisljaj kompatibilnost. OPTIONAL ACCESSORY ne sme se pretpostaviti kao fizicki dostupan. Prati ceo lanac zavisnosti dodataka: zavisni dodatak sme se koristiti samo kada su prisutni svi potrebni parent modifikatori u njegovom lancu. Postuj svaki status i uslov. Jasno navedi Compatible but not optimized kada vazi. Daj prakticne preporuke za key, fill, negative fill, backlight, boju, pozicije, ekspoziciju i bezbednost.`;const response=await openai.responses.create({model:"gpt-5.6-luna",input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:image}]}]});res.json({analysis:response.output_text});}catch(error){console.error(error);res.status(500).json({error:"Scene analysis failed."});}});
app.post("/api/lighting-plan",async(req,res)=>{try{const{project="",scene="",type="",look="",space="",camera="",description="",scenePhoto="",equipment=[],language="sr"}=req.body;const equipmentText=formatEquipmentForAI(equipment);const prompt=`You are LIGHTING AI, a professional gaffer assistant. ${language==="en"?"Write all JSON text values in English.":"Write all JSON text values in Serbian, Latin script."} Project: ${project}. Scene: ${scene}. Production type: ${type}. Look: ${look}. Space: ${space}. Camera: ${camera}. Description: ${description}. Available equipment: ${equipmentText||"Not provided"}. Use only listed fixtures and explicitly compatible accessories. Never invent accessories or compatibility. INCLUDED WITH FIXTURE may be treated as available; OPTIONAL ACCESSORY must not be assumed physically available. Follow complete accessory dependency chains and use a dependent accessory only when every required parent modifier is present. Respect every compatibility status and condition. Return ONLY valid JSON with exactly these fields: {"summary":"","key":"","fill":"","backlight":"","negative_fill":"","camera_notes":"","color_notes":"","safety_notes":"","equipment_list":[]}.`;const content=[{type:"input_text",text:prompt}];if(scenePhoto)content.push({type:"input_image",image_url:scenePhoto});const response=await openai.responses.create({model:"gpt-5.6-luna",input:[{role:"user",content}]});let text=response.output_text.trim().replace(/^```json\s*/i,"").replace(/```$/i,"").trim();res.json(JSON.parse(text));}catch(error){console.error(error);res.status(500).json({error:"Lighting plan generation failed."});}});
app.get('/',(req,res)=>res.sendFile(process.cwd()+'/index.html'));
const port=process.env.PORT||3000;app.listen(port,()=>console.log(`LIGHTING AI backend running on port ${port}`));