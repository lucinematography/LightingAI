import assert from "node:assert/strict";
import {
  VISUAL_PREVIEW_MODEL,
  VISUAL_PREVIEW_QUALITY,
  parseDataImage,
  buildVisualPreviewPrompt,
  generateVisualPreview,
} from "./visual-preview.js";

const ONE_PIXEL_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=";

assert.equal(VISUAL_PREVIEW_MODEL, "gpt-image-2.5-sunburst");
assert.equal(VISUAL_PREVIEW_QUALITY, "low");

const parsed = parseDataImage(ONE_PIXEL_PNG);
assert.equal(parsed.mime, "image/png");
assert.equal(parsed.extension, "png");
assert.ok(parsed.buffer.length > 10);
assert.throws(() => parseDataImage("data:text/plain;base64,SGVsbG8="));

const plan = {
  summary: "Filmski portret",
  key: "Meko glavno svetlo sa leve strane",
  fill: "Vrlo blag fill",
  lighting_diagram: {
    subject: "SUBJEKAT",
    camera: "KAMERA",
    lights: [{ id: "L1", role: "KEY", fixture: "ARRI SkyPanel X21", x: 25, y: 25 }],
  },
};
const prompt = buildVisualPreviewPrompt({
  plan,
  description: "Filmski portret sa mekom kontrom",
  equipment: [{ name: "ARRI SkyPanel X21", qty: 1 }],
  language: "sr",
});
assert.match(prompt, /Sačuvaj isti ugao kamere/);
assert.match(prompt, /ARRI SkyPanel X21 x1/);
assert.match(prompt, /L1/);
assert.match(prompt, /No labels, arrows, diagrams/i);

let received = null;
const mockOpenAI = {
  images: {
    edit: async (args) => {
      received = args;
      return { data: [{ b64_json: "aGVsbG8=" }] };
    },
  },
};
const result = await generateVisualPreview(mockOpenAI, {
  scenePhoto: ONE_PIXEL_PNG,
  plan,
  description: "Test",
  equipment: [{ name: "ARRI SkyPanel X21", qty: 1 }],
  language: "sr",
});
assert.equal(received.model, VISUAL_PREVIEW_MODEL);
assert.equal(received.quality, VISUAL_PREVIEW_QUALITY);
assert.ok(received.image);
assert.equal(received.image.name, "lightingai-scene.png");
assert.equal(received.image.type, "image/png");
assert.match(received.prompt, /Approved lighting plan/);
assert.equal(result.image, "data:image/png;base64,aGVsbG8=");
assert.equal(result.model, VISUAL_PREVIEW_MODEL);
assert.equal(result.quality, VISUAL_PREVIEW_QUALITY);

console.log("AI visual photo preview self-test passed.");
