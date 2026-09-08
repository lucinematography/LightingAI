import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "LIGHTING AI backend" });
});

app.post("/api/analyze-scene", async (req, res) => {
  try {
    const { image, description = "", equipment = [], language = "sr" } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Nedostaje fotografija scene." });
    }

    const equipmentText = equipment
      .map(e => `${e.name} x${e.qty || 1}`)
      .join(", ");

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

    const equipmentText = equipment
      .map(e => `${e.name} x${e.qty || 1}`)
      .join(", ");

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

app.get('/', (req, res) => { res.sendFile(process.cwd() + '/index.html'); });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`LIGHTING AI backend running on port ${port}`);
});