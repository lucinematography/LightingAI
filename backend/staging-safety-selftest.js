import assert from "node:assert/strict";
import fs from "node:fs";
import { paidAiConfigured, guardPaidAIRequests } from "./staging-safety.js";
import { videoCapabilities } from "./scene-planner-video.js";

const staging = { LIGHTINGAI_DISABLE_PAID_AI: "true", OPENAI_API_KEY: "fake" };
assert.equal(paidAiConfigured({}), false, "missing OpenAI credentials must not crash server");
assert.equal(paidAiConfigured(staging), false, "staging kill switch overrides any supplied key");
assert.equal(paidAiConfigured({ OPENAI_API_KEY: "fake" }), true);
const endpoints = [
  "/api/analyze-scene", "/api/lighting-plan", "/api/scene-planner/plan",
  "/api/scene-planner/storyboard", "/api/visual-preview"
];
for (const env of [{}, staging]) {
  for (const path of endpoints) {
    let code = 0, body = null, nextCalled = false;
    const response = { status(value) { code = value; return this; }, json(value) { body = value; return this; } };
    guardPaidAIRequests(env)({ method: "POST", path }, response, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(code, 503, path + " must reject unconfigured paid requests");
    assert.equal(body?.ok, false);
  }
}
let allowed = false;
guardPaidAIRequests(staging)({ method: "GET", path: "/health" }, {}, () => { allowed = true; });
assert.equal(allowed, true, "health routes must remain available in staging");
allowed = false;
guardPaidAIRequests({ OPENAI_API_KEY: "fake" })(
  { method: "POST", path: "/api/scene-planner/plan" }, {}, () => { allowed = true; });
assert.equal(allowed, true, "configured production AI calls remain unaffected");

const videoEnv = {
  ...staging, SCENE_PLANNER_VIDEO_ENABLED: "true",
  RUNWAYML_API_SECRET: "long-video-provider-secret-for-test",
  SCENE_PLANNER_VIDEO_ACCESS_TOKEN: "long-access-token-for-authorization",
  SCENE_PLANNER_VIDEO_DATABASE_URL: "postgres://unused.invalid/test"
};
assert.equal(videoCapabilities(videoEnv).available, false,
  "staging kill switch must also disable paid Runway requests");
const server = fs.readFileSync(new URL("./server.js", import.meta.url), "utf8");
assert.match(server, /app\.use\(guardPaidAIRequests\(\)\)/,
  "staging middleware must be installed before paid AI routes");
assert.match(server, /const openai = paidAiConfigured\(\) \? new OpenAI\(/,
  "server startup must not require paid AI credentials");
console.log("Scene Planner isolated staging safety tests passed.");
