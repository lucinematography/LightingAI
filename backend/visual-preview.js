import { toFile } from "openai";

export const VISUAL_PREVIEW_MODEL = "gpt-image-2.5-sunburst";
export const VISUAL_PREVIEW_QUALITY = "low";

const SUPPORTED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function parseDataImage(dataUrl) {
  if (typeof dataUrl !== "string") throw new Error("Scene photo must be a data URL.");
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) throw new Error("Unsupported scene photo format.");
  const mime = match[1].toLowerCase();
  const extension = SUPPORTED_IMAGE_TYPES.get(mime);
  if (!extension) throw new Error("Unsupported scene photo type.");
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length) throw new Error("Scene photo is empty.");
  if (buffer.length > 12 * 1024 * 1024) throw new Error("Scene photo is too large.");
  return { mime, extension, buffer };
}

function compactPlan(plan = {}) {
  return {
    summary: plan.summary || "",
    key: plan.key || "",
    fill: plan.fill || "",
    backlight: plan.backlight || "",
    negative_fill: plan.negative_fill || "",
    camera_notes: plan.camera_notes || "",
    color_notes: plan.color_notes || "",
    lighting_diagram: plan.lighting_diagram || {},
  };
}

function equipmentNames(equipment = []) {
  return equipment.map((item) => `${item.name || item.model || item.id || "fixture"} x${item.qty || 1}`);
}

export function buildVisualPreviewPrompt({ plan = {}, description = "", equipment = [], language = "sr" } = {}) {
  const instruction = language === "en"
    ? "Create a photorealistic lighting preview of the supplied scene photograph."
    : "Napravi fotorealističan preview osvetljenja na dostavljenoj fotografiji scene.";
  const preservation = language === "en"
    ? "Preserve the exact camera viewpoint, framing, room/set geometry, people, faces, identity, body pose, wardrobe, props, set dressing, signage, readable text and object positions. Do not redesign or replace the scene. Do not add visible lamps, stands, cables, modifiers or crew unless they already exist in the source photograph."
    : "Sačuvaj isti ugao kamere, kadar, geometriju prostora/scenografije, osobe, lica i identitet, položaj tela, garderobu, rekvizitu, scenografiju, natpise, čitljiv tekst i položaje predmeta. Ne redizajniraj i ne zamenjuj scenu. Ne dodaj vidljiva svetla, stative, kablove, modifikatore ili ekipu ako već nisu na originalnoj fotografiji.";
  const relight = language === "en"
    ? "Change primarily the lighting result: direction, softness, contrast, exposure balance, color temperature, practical-light balance, highlights and physically plausible shadows. Treat the listed fixtures as off-camera lighting tools. Match the supplied gaffer plan closely while keeping the result believable rather than stylized."
    : "Promeni prvenstveno rezultat osvetljenja: smer, mekoću, kontrast, balans ekspozicije, temperaturu boje, odnos praktičnih izvora, svetle delove i fizički uverljive senke. Navedena rasvetna tela tretiraj kao izvore van kadra. Prati dati gaffer plan što vernije, ali rezultat mora ostati realističan, ne stilizovan.";
  return [
    instruction,
    preservation,
    relight,
    `Scene/look goal: ${description || "not specified"}.`,
    `Physically available lighting: ${equipmentNames(equipment).join("; ") || "not specified"}.`,
    `Approved lighting plan: ${JSON.stringify(compactPlan(plan))}`,
    "Return one finished preview image only. No labels, arrows, diagrams, borders or explanatory text in the image.",
  ].join("\n");
}

export async function generateVisualPreview(openai, payload = {}) {
  if (!openai?.images?.edit) throw new Error("Image edit client is unavailable.");
  const parsed = parseDataImage(payload.scenePhoto);
  const image = await toFile(parsed.buffer, `lightingai-scene.${parsed.extension}`, { type: parsed.mime });
  const prompt = buildVisualPreviewPrompt(payload);
  const response = await openai.images.edit({
    model: VISUAL_PREVIEW_MODEL,
    image,
    prompt,
    quality: VISUAL_PREVIEW_QUALITY,
  });
  const base64 = response?.data?.[0]?.b64_json;
  if (!base64) throw new Error("Image preview response did not contain image data.");
  return {
    image: `data:image/png;base64,${base64}`,
    model: VISUAL_PREVIEW_MODEL,
    quality: VISUAL_PREVIEW_QUALITY,
  };
}
