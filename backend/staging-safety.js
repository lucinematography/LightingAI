// Staging has no provider credentials. This guard prevents accidental paid AI calls
// and permits health/catalog endpoints to work even without an OpenAI API key.
const PAID_OPENAI_PATHS = new Set([
  "/api/analyze-scene",
  "/api/lighting-plan",
  "/api/scene-planner/plan",
  "/api/scene-planner/storyboard",
  "/api/visual-preview"
]);

export function paidAiConfigured(env = process.env) {
  return env.LIGHTINGAI_DISABLE_PAID_AI !== "true" &&
    Boolean(String(env.OPENAI_API_KEY || "").trim());
}

export function guardPaidAIRequests(env = process.env) {
  return (req, res, next) => {
    if (req.method === "POST" && PAID_OPENAI_PATHS.has(req.path) && !paidAiConfigured(env)) {
      return res.status(503).json({
        ok: false,
        error: "Paid AI processing is disabled or not configured on this backend."
      });
    }
    next();
  };
}
