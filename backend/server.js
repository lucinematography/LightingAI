import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { FIXTURE_LIBRARY } from "./fixture-library.js";
import { ACCESSORY_LIBRARY } from "./accessory-library.js";
import "./accessory-compatibility-overrides.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function normalizeEquipmentName(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/aputure/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function resolveFixture(e = {}) {
  if (e.fixtureId) {
    const byId = FIXTURE_LIBRARY.find(f => f.id === e.fixtureId);
    if (byId) return byId;
  }

  const equipmentName = normalizeEquipmentName(e.name);
  if (!equipmentName) return null;

  const exact = FIXTURE_LIBRARY.find(f => {
    const model = normalizeEquipmentName(f.model);
    const fullName = normalizeEquipmentName(`${f.manufacturer || ""} ${f.model || ""}`);
    return equipmentName === model || equipmentName === fullName;
  });
  if (exact) return exact;

  // Preserve common legacy names already stored by the original app.
  const aliases = {
    "600d": "aputure-ls-600d",
    "ls600d": "aputure-ls-600d",
    "300dii": "aputure-ls-300d-ii",
    "ls300dii": "aputure-ls-300d-ii",
    "600cproii": "aputure-ls-600c-pro-ii",
    "ls600cproii": "aputure-ls-600c-pro-ii"
  };

  const fixtureId = aliases[equipmentName];
  return fixtureId ? FIXTURE_LIBRARY.find(f => f.id === fixtureId) || null : null;
}

function formatEquipmentForAI(equipment = []) {
  return equipment.map(e => {
    const fixture = resolveFixture(e);

    if (!fixture) return `${e.name} x${e.qty || 1}`;

    const specs = [
      fixture.sourceType && `source: ${fixture.sourceType}`,
      fixture.powerDrawW && `power draw: ${fixture.powerDrawW}W`,
      fixture.outputPowerW && `output power: ${fixture.outputPowerW}W`,
      fixture.cctK && `CCT: ${fixture.cctK.min}-${fixture.cctK.max}K`,
      fixture.colorMode && `color: ${fixture.colorMode}`,
      fixture.cri && `CRI: ${fixture.cri}`,
      fixture.tlci && `TLCI: ${fixture.tlci}`,
      fixture.mount && `mount: ${fixture.mount}`,
      fixture.ipRating && `IP: ${fixture.ipRating}`
    ].filter(Boolean).join(", ");

    const accessories = ACCESSORY_LIBRARY
      .filter(a => (a.compatibleWith || []).includes(fixture.id))
      .map(a => {
        const fixtureCompatibility = a.compatibility?.[fixture.id];
        const status = fixtureCompatibility?.status || a.compatibilityStatus || "Compatible";
        const conditions = fixtureCompatibility?.conditions || [];
        const details = [
          a.category && `type: ${a.category}`,
          `status: ${status}`,
          `availability: ${a.includedWithFixture === true ? "INCLUDED WITH FIXTURE" : "OPTIONAL ACCESSORY"}`,
          conditions.length && `conditions: ${conditions.join("; ")}`,
          a.mount && `mount: ${a.mount}`,
          a.beamAngleDeg && `beam: ${a.beamAngleDeg.min}-${a.beamAngleDeg.max}deg`,
          a.gridAngleDeg && `grid: ${a.gridAngleDeg}deg`,
          a.diffusionStops && `diffusion: ${a.diffusionStops.join('/')} stop`,
          a.effectOnLight && `effect: ${a.effectOnLight}`
        ].filter(Boolean).join(", ");
        return `${a.manufacturer} ${a.model}${details ? ` [${details}]` : ""}`;
      });

    const accessoryText = accessories.length ? ` | Compatible accessories: ${accessories.join("; ")}` : "";
    return `${e.name} x${e.qty || 1}${specs ? ` [${specs}]` : ""}${accessoryText}`;
  }).join("; ");
}

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "LIGHTING AI backend" });
});

app.post("/api/analyze-scene", async (req, res) => {
  try {
    const { image, description = "", equipment = [], language = "sr" } = req.body;
    if (!image) return res.status(400).json({ error: "Nedostaje fotografija scene." });
    const equipmentText = formatEquipmentForAI(equipment);
    const prompt = language === "en"
      ? `You are a professional film and studio lighting assistant.\nAnalyze the supplied scene photograph for lighting planning.\n\nScene description: ${description || "Not provided"}\nAvailable equipment: ${equipmentText || "Not provided"}\n\nEQUIPMENT AND ACCESSORY RULES:\n- When recommending a specific fixture, use only fixtures listed in Available equipment.\n- Recommend only accessories explicitly listed as compatible with that fixture.\n- Never invent an accessory, modifier, lens, reflector, softbox, cable, or compatibility relationship.\n- INCLUDED WITH FIXTURE means the accessory is supplied with that fixture.\n- OPTIONAL ACCESSORY means it is compatible but must not be assumed to be physically available unless the user confirms they have it.\n- Respect the exact compatibility status and all listed conditions.\n- If status is "Compatible but not optimized", say so when recommending it.\n- If a condition says to remove a baffle, gel holder, or other component, include that condition in the recommendation.\n- Prefer the most appropriate compatible accessory for the desired lighting result and explain briefly why.\n\nGive practical recommendations for:\n- existing/ambient light\n- key light\n- fill or negative fill\n- backlight/separation\n- color temperature and color\n- background lighting\n- suggested placement of available fixtures\n- exposure considerations\n- important lighting and rigging safety considerations.\n\nDo not claim to know measurements that cannot be determined from the photograph.`
      : `Ti si profesionalni asistent za filmsku i studijsku rasvetu.\nAnaliziraj priloženu fotografiju scene radi planiranja rasvete.\n\nOpis scene: ${description || "Nije unet"}\nDostupna oprema: ${equipmentText || "Nije uneta"}\n\nPRAVILA ZA OPREMU I ACCESSORIES:\n- Kada preporučuješ konkretno rasvetno telo, koristi samo fixture-e navedene u Dostupnoj opremi.\n- Preporuči samo accessory koji je eksplicitno naveden kao kompatibilan sa tim fixture-om.\n- Nemoj izmišljati accessory, modifier, lens, reflector, softbox, cable niti compatibility odnos.\n- INCLUDED WITH FIXTURE znači da accessory dolazi uz fixture.\n- OPTIONAL ACCESSORY znači da je kompatibilan, ali nemoj pretpostaviti da ga korisnik fizički poseduje bez njegove potvrde.\n- Poštuj tačan compatibility status i sve navedene conditions.\n- Ako je status "Compatible but not optimized", to jasno navedi kada ga preporučuješ.\n- Ako condition zahteva uklanjanje baffle-a, gel holder-a ili drugog dela, uključi taj uslov u preporuku.\n- Izaberi najprikladniji kompatibilni accessory za željeni rezultat rasvete i ukratko objasni zašto.\n\nDaj praktične preporuke za:\n- postojeće/prirodno svetlo\n- key light\n- fill ili negative fill\n- backlight i separaciju\n- temperaturu boje i color pristup\n- osvetljenje pozadine\n- pozicije dostupnih rasvetnih tela\n- ekspoziciju\n- važne mere bezbednosti rasvete i rigginga.\n\nNemoj izmišljati mere ili podatke koje nije moguće pouzdano utvrditi sa fotografije.`;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_image", image_url: image }] }]
    });
    res.json({ analysis: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Scene analysis failed." });
  }
});

app.post("/api/lighting-plan", async (req, res) => {
  try {
    const { project = "", scene = "", type = "", look = "", space = "", camera = "", description = "", scenePhoto = "", equipment = [], language = "sr" } = req.body;
    const equipmentText = formatEquipmentForAI(equipment);
    const prompt = `You are LIGHTING AI, a professional gaffer assistant for film and studio lighting.\n\nIMPORTANT LANGUAGE RULE:\n${language === "en" ? "Write all JSON text values in English." : "Write all JSON text values in Serbian, using Latin script."}\n\nCreate a practical lighting plan using the supplied scene information and ONLY the available equipment where specific fixtures are recommended.\n\nProject: ${project}\nScene: ${scene}\nProduction type: ${type}\nDesired look: ${look}\nSpace: ${space}\nCamera: ${camera}\nScene description: ${description}\nAvailable equipment: ${equipmentText || "Not provided"}\n\nEQUIPMENT AND ACCESSORY RULES:\n- Use only listed available fixtures when recommending specific fixtures.\n- Use only accessories explicitly listed as compatible with each fixture.\n- Never invent accessories or compatibility relationships.\n- INCLUDED WITH FIXTURE accessories may be treated as available with that fixture.\n- OPTIONAL ACCESSORY items must not be assumed to be physically available unless confirmed by the user.\n- Respect every compatibility status and condition exactly.\n- Clearly identify "Compatible but not optimized" accessories when relevant.\n- Include required conditions such as removing an inner baffle or gel holder.\n- When an appropriate compatible accessory is available, name the exact accessory and briefly explain why it is appropriate for the requested lighting result.\n\nReturn ONLY valid JSON with exactly these fields:\n{\n  "summary": "",\n  "key": "",\n  "fill": "",\n  "backlight": "",\n  "negative_fill": "",\n  "camera_notes": "",\n  "color_notes": "",\n  "safety_notes": "",\n  "equipment_list": []\n}\n\nBe practical and concise. Do not invent measurements or scene details that cannot be determined.`;

    const content = [{ type: "input_text", text: prompt }];
    if (scenePhoto) content.push({ type: "input_image", image_url: scenePhoto });
    const response = await openai.responses.create({ model: "gpt-5.6-luna", input: [{ role: "user", content }] });
    let text = response.output_text.trim();
    text = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const plan = JSON.parse(text);
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lighting plan generation failed." });
  }
});

app.get('/api/fixtures', (req, res) => { res.json(FIXTURE_LIBRARY); });
app.get('/', (req, res) => { res.sendFile(process.cwd() + '/index.html'); });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LIGHTING AI backend running on port ${port}`);
});
