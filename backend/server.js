import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { FIXTURE_LIBRARY } from "./fixture-library.js";
import { ACCESSORY_LIBRARY } from "./accessory-library.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function formatEquipmentForAI(equipment = []) {
  return equipment.map(e => {
    const fixture = e.fixtureId
      ? FIXTURE_LIBRARY.find(f => f.id === e.fixtureId)
      : null;

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
        const details = [
          a.category && `type: ${a.category}`,
          a.compatibilityStatus && `status: ${a.compatibilityStatus}`,
          a.mount && `mount: ${a.mount}`,
          a.beamAngleDeg &&
            `beam: ${a.beamAngleDeg.min}-${a.beamAngleDeg.max}deg`,
          a.gridAngleDeg && `grid: ${a.gridAngleDeg}deg`,
          a.diffusionStops &&
            `diffusion: ${a.diffusionStops.join('/')} stop`,
          a.effectOnLight && `effect: ${a.effectOnLight}`
        ].filter(Boolean).join(", ");

        return `${a.manufacturer} ${a.model}${details ? ` [${details}]` : ""}`;
      });

    const accessoryText = accessories.length
      ? ` | Compatible accessories: ${accessories.join("; ")}`
      : "";

    return `${e.name} x${e.qty || 1}${specs ? ` [${specs}]` : ""}${accessoryText}`;
  }).join("; ");
}

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "LIGHTING AI backend" });
});

app.post("/api/analyze-scene", async (req, res) => {
  try {
    const { image, description = "", equipment = [], language = "sr" } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Nedostaje fotografija scene." });
    }

    const equipmentText = formatEquipmentForAI(equipment);

    const prompt =
      language === "en"
        ? `You are a professional film and studio lighting assistant.
Analyze the supplied scene photograph for lighting planning.

Scene description: ${description || "Not provided"}
Available equipment: ${equipmentText || "Not provided"}

Give practical recommendations for:
- existing/ambient light
- key light
- fill or negative fill
- backlight/separation
- color temperature and color
- background lighting
- suggested placement of available fixtures
- exposure considerations
- important lighting and rigging safety considerations.

Do not claim to know measurements that cannot be determined from the photograph.`
        : `Ti si profesionalni asistent za filmsku i studijsku rasvetu.
Analiziraj priloženu fotografiju scene radi planiranja rasvete.

Opis scene: ${description || "Nije unet"}
Dostupna oprema: ${equipmentText || "Nije uneta"}

Daj praktične preporuke za:
- postojeće/prirodno svetlo
- key light
- fill ili negative fill
- backlight i separaciju
- temperaturu boje i color pristup
- osvetljenje pozadine
- pozicije dostupnih rasvetnih tela
- ekspoziciju
- važne mere bezbednosti rasvete i rigginga.

Nemoj izmišljati mere ili podatke koje nije moguće pouzdano utvrditi sa fotografije.`;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: image }
        ]
      }]
    });

    res.json({
      analysis: response.output_text
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Scene analysis failed."
    });
  }
});


app.post("/api/lighting-plan", async (req, res) => {
  try {
    const {
      project = "",
      scene = "",
      type = "",
      look = "",
      space = "",
      camera = "",
      description = "",
      scenePhoto = "",
      equipment = [],
      language = "sr"
    } = req.body;

    const equipmentText = formatEquipmentForAI(equipment);

    const prompt = `You are LIGHTING AI, a professional gaffer assistant for film and studio lighting.

IMPORTANT LANGUAGE RULE:
${language === "en"
  ? "Write all JSON text values in English."
  : "Write all JSON text values in Serbian, using Latin script."}

Create a practical lighting plan using the supplied scene information and ONLY the available equipment where specific fixtures are recommended.

Project: ${project}
Scene: ${scene}
Production type: ${type}
Desired look: ${look}
Space: ${space}
Camera: ${camera}
Scene description: ${description}
Available equipment: ${equipmentText || "Not provided"}

Return ONLY valid JSON with exactly these fields:
{
  "summary": "",
  "key": "",
  "fill": "",
  "backlight": "",
  "negative_fill": "",
  "camera_notes": "",
  "color_notes": "",
  "safety_notes": "",
  "equipment_list": []
}

Be practical and concise. Do not invent measurements or scene details that cannot be determined.`;

    const content = [{ type: "input_text", text: prompt }];

    if (scenePhoto) {
      content.push({ type: "input_image", image_url: scenePhoto });
    }

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: [{ role: "user", content }]
    });

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