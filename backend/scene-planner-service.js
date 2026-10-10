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
    "Scene location (user-editable, not a geodetic measurement): " + (req.sceneLocation||"unspecified"),
    "Scene GPS latitude/longitude, approximate unless verified: " +
      JSON.stringify([req.sceneLatitude,req.sceneLongitude]),
    "Coordinates independently verified on set: " + req.sceneCoordsVerified,
    "Scene local date/time (empty means unknown): " + (req.sceneLocalDateTime||"unknown"),
    "Scene timezone (user-supplied): " + (req.sceneTimeZone||"unspecified"),
    "Do not invent solar azimuth/elevation, real shadow lengths or Sun positions. Require a verified SUN calculation and an exact shooting location/time before giving them.",
    "Look: " + req.look,
    "Mode: " + (onlyOwn ? "ONLY MY EQUIPMENT" : "PROPOSE BEST LIGHTING"),
    onlyOwn ? "MUST use only the following physically selected fixtures, each up to its qty: " + JSON.stringify(req.equipment)
      : "Propose ideal professional lighting. Suggested lamps are not necessarily owned.",
    onlyOwn ? "Use optional modifiers only when physically selected here: " + JSON.stringify(req.modifiers)
      : "Suggested modifiers are rental concepts, not confirmed as owned.",
    "Room width/depth in metres, null means unknown: " + JSON.stringify([req.roomWidthM,req.roomDepthM]),
    "Dimensions explicitly verified by the user: " + req.dimensionsMeasured,
    "Video keyframes, ordered in time: " + req.videoFrames.map((frame,i) => ({frame:i+1,timeSec:frame.timeSec})).map(JSON.stringify).join("; "),
    "Distinguish moving camera from actor blocking; do not infer metric 3D geometry from video.",
    "Track actor across chronological video keyframes and assign timeSec to observed path positions.",
    "If no reliable actor trajectory is visible, return an empty path and blockingConfidence low/unknown.",
    "State which actions and landmarks are observable and which are inferred.",
    "Every fixture needs coverageStages: indices of actor path points potentially illuminated by key/fill/rim light.",
    "Propose key light continuity at start, middle and end of the actor path; call out gaps.",
    "Include verticalTiltDeg, beamAngleDeg and positionNote when useful; all positions and levels are estimates.",
    "For captured daylight requested as night: explain blocking direct sun, sky, specular surfaces, negative fill, controlled key and moonlight rim, continuity and safety.",
    "Do not imply color grading alone creates physically correct night lighting.",
    "Capture lighting: " + req.captureLighting,
    "Camera framing/movement: " + req.shotCamera,
    "Director of Photography new instructions: " + (req.dopRequest||"none"),
    "Camera hard overrides to obey exactly when provided: " + JSON.stringify(req.cameraOverrides),
    "Previous plan to revise rather than ignore: " + JSON.stringify(req.previousPlan),
    "Return suggested cameraSettings with fps, shutterAngle, aperture, iso, whiteBalanceK, ndStops, focalLengthMm.",
    "Return exposureNotes that identify assumptions and required meter/gray-card tests.",
    "Aperture, ISO and source intensity cannot be physically derived accurately from uncalibrated video alone.",
    "If camera overrides conflict with feasible light output, explicitly describe the compromise.",
    "Preserve physically owned inventory and capacity constraints during DoP revision.",
    "Preserve previous light instance ids (L1, L2, etc.) for the same fixtures, including when reordering or changing roles. Do not transfer an old id to a different fixture.",
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
      cameraSettings:{fps:24,shutterAngle:180,aperture:2.8,iso:800,whiteBalanceK:4300,ndStops:0,focalLengthMm:35},
      exposureNotes:["Estimated only; validate exposure with meter and camera test"],
      sceneAnalysis:{cameraMotion:"unknown",blockingConfidence:"medium",observedLighting:"day",evidence:"visible observations",referencePoints:[{label:"fence",x:20,y:60},{label:"tree",x:75,y:30}]},
      dayForNightNotes:["Protect highlights and control actual sunlight"],
      actors:[{label:"Glumac",x:50,y:50,confidence:"medium",path:[{x:20,y:60,timeSec:0},{x:50,y:50,timeSec:3},{x:80,y:30,timeSec:6}]}],
      lights:[{role:"key",fixtureId:"",fixtureName:"",x:25,y:30,heightM:2.4,
        distanceM:2.5,angleDeg:45,verticalTiltDeg:-25,beamAngleDeg:60,coverageStages:[0,1,2],positionNote:"Off camera, verify actual clearance",intensityPct:60,kelvin:4300,color:"",modifier:"",why:""}]
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
