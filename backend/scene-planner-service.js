import { createRequire } from "node:module";
import { parseDataImage } from "./visual-preview.js";

const require = createRequire(import.meta.url);
const core = require("../app/src/main/assets/scene-planner-core.js");
const MODEL = process.env.SCENE_PLANNER_MODEL || "gpt-4.1-mini";

function parseModelJson(response) {
  const raw = String(response?.output_text || "").trim();
  const clean = raw.replace(/^\x60{3}(?:json)?\s*/i, "").replace(/\s*\x60{3}$/i, "");
  if (!clean) throw new Error("AI scene planner returned an empty response.");
  return JSON.parse(clean);
}

export function validateScenePlannerRequest(body) {
  const req = core.request(body);
  if (!req.description) throw Object.assign(new Error("Scene description is required."), {status:400});
  if (!req.scenePhoto && !req.videoFrames.length) {
    throw Object.assign(new Error("Scene photo or video frames are required."), {status:400});
  }
  try {
    if (req.scenePhoto) parseDataImage(req.scenePhoto);
    for (const frame of req.videoFrames) parseDataImage(frame.image);
  } catch {
    throw Object.assign(new Error("Invalid or oversized scene photograph/video frame."), {status:400});
  }
  if (req.mode === "own" && !req.equipment.length) {
    throw Object.assign(new Error("At least one owned fixture is required."), {status:422});
  }
  return req;
}

export function canonicalInventory(req, catalog) {
  const byId = new Map((catalog || []).map((fixture) => [fixture.id, fixture]));
  return {
    ...req,
    equipment: req.equipment.map((item) => {
      const fixture = byId.get(item.fixtureId || item.id);
      if (!fixture) return {...item, powerDrawW:null, cctK:null, specVerified:false};
      return {
        ...item, fixtureId:fixture.id,
        name:[fixture.manufacturer,fixture.model].filter(Boolean).join(" "),
        powerDrawW:Number.isFinite(Number(fixture.powerDrawW)) && Number(fixture.powerDrawW)>0
          ? Number(fixture.powerDrawW) : null,
        cctK:fixture.cctK && typeof fixture.cctK === "object" ? fixture.cctK : null,
        specVerified:true
      };
    })
  };
}

export function buildScenePlannerPrompt(req) {
  const onlyOwn = req.mode === "own";
  return [
    "You are a professional cinematography gaffer and lighting designer.",
    "Design a creative but executable light plan for the actual scene and actor blocking.",
    "The photograph and video keyframes are visual references, NOT calibrated depth measurements.",
    "Scene description: " + req.description,
    "Look: " + req.look,
    "Mode: " + (onlyOwn ? "ONLY MY EQUIPMENT" : "PROPOSE BEST LIGHTING"),
    onlyOwn ? "MUST use only the following physically selected fixtures, each up to its qty: " + JSON.stringify(req.equipment)
      : "Propose ideal professional lighting. Suggested lamps are not necessarily owned.",
    onlyOwn ? "Use optional modifiers only when physically selected here: " + JSON.stringify(req.modifiers)
      : "Suggested modifiers are rental concepts, not confirmed as owned.",
    "Room width/depth in metres, null means unknown: " + JSON.stringify([req.roomWidthM,req.roomDepthM]),
    "Dimensions explicitly verified by the user: " + req.dimensionsMeasured,
    "Video keyframes, ordered in time: " + req.videoFrames.map((frame,i) => ({frame:i+1,timeSec:frame.timeSec})).map(JSON.stringify).join("; "),
    "Observe actor progression between video keyframes. Occluded motion is uncertain.",
    "Show approximate top-down actor path with chronological x/y percentage coordinates.",
    "Top-down percent coordinates 5..95; camera near x50 y89.",
    "For each light, give key/fill/backlight/ambient role, fixtureId and fixtureName, x,y,",
    "heightM, distanceM, angleDeg, intensityPct 0..100, kelvin, color, modifier, and short why.",
    "Proposed positions and technical parameters must always be identified as estimates.",
    "Never claim calibrated lux or exact geometry from photography.",
    "State practical constraints and set safety checks. Never invent product capabilities.",
    "Return description fields in Serbian Latin script.",
    "ONLY return a JSON object with this shape:",
    JSON.stringify({
      summary:"",rationale:"",limitations:[],safetyNotes:[],
      actors:[{label:"Glumac",x:50,y:50,path:[{x:20,y:60},{x:50,y:50},{x:80,y:30}]}],
      lights:[{role:"key",fixtureId:"",fixtureName:"",x:25,y:30,heightM:2.4,
        distanceM:2.5,angleDeg:45,intensityPct:60,kelvin:4300,color:"",modifier:"",why:""}]
    }),
    "Maximum eight lights. One entry per physical fixture. Do not include device control."
  ].join("\n");
}

export async function generateScenePlannerPlan(openai, body, catalog) {
  const req = canonicalInventory(validateScenePlannerRequest(body), catalog);
  const content = [{type:"input_text",text:buildScenePlannerPrompt(req)}];
  if (req.scenePhoto) content.push({type:"input_image",image_url:req.scenePhoto});
  for (const frame of req.videoFrames) {
    content.push({type:"input_text",text:"Video keyframe at " + frame.timeSec + " seconds."});
    content.push({type:"input_image",image_url:frame.image});
  }
  const response = await openai.responses.create({model:MODEL,input:[{role:"user",content}]});
  const plan = core.sanitizePlan(parseModelJson(response), req, "ai");
  if (!plan.lights.length && req.mode === "best") {
    throw new Error("AI returned no usable lights for the proposed scene.");
  }
  if (req.videoFrames.length && !plan.actors.some(actor => actor.path.length > 1)) {
    plan.limitations.push("Putanja se nije mogla pouzdano rekonstruisati iz izdvojenih kadrova.");
  }
  plan.inputSummary={photoProvided:!!req.scenePhoto,videoKeyframes:req.videoFrames.length,recordedFootageNotUploaded:true};
  return {ok:true,model:MODEL,plan};
}
