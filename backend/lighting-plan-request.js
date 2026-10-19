// Applies only to the AI Visual plan used by the professional PDF.
export const LIGHTING_PLAN_LIMITS = Object.freeze({
  model: "gpt-5.6-luna",
  maxOutputTokens: 6000,
  timeoutMs: 120000
});

function failure(status, code) {
  return Object.assign(new Error(code), {status, code});
}

export function createLightingPlanRequest(openai) {
  // One active provider request per server process, including disconnected clients.
  // This is not a distributed lock or a lifetime limit on the number of tests.
  let inFlight = false;
  return async function requestLightingPlan(content) {
    if (inFlight) throw failure(409, "LIGHTING_PLAN_BUSY");
    if (!openai) throw failure(503, "LIGHTING_PLAN_UNAVAILABLE");
    inFlight = true;
    const controller = new AbortController();
    // Also cover response-body reading, not just receipt of HTTP headers.
    const timer = setTimeout(() => controller.abort(), LIGHTING_PLAN_LIMITS.timeoutMs);
    try {
      const response = await openai.responses.create({
        model: LIGHTING_PLAN_LIMITS.model,
        input: [{role: "user", content}],
        max_output_tokens: LIGHTING_PLAN_LIMITS.maxOutputTokens
      }, {
        maxRetries: 0,
        timeout: LIGHTING_PLAN_LIMITS.timeoutMs,
        signal: controller.signal
      });
      if (controller.signal.aborted) throw failure(504, "LIGHTING_PLAN_TIMEOUT");
      // Even valid-looking JSON is unsafe when the provider reports truncation.
      if (response?.status !== "completed" || response?.incomplete_details) {
        throw failure(502, "LIGHTING_PLAN_INCOMPLETE");
      }
      const text = String(response.output_text || "").trim()
        .replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      let plan;
      try { plan = JSON.parse(text); }
      catch { throw failure(502, "LIGHTING_PLAN_INVALID_JSON"); }
      if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
        throw failure(502, "LIGHTING_PLAN_INVALID_JSON");
      }
      return plan;
    } catch (error) {
      if (controller.signal.aborted || error?.name === "APIConnectionTimeoutError") {
        throw failure(504, "LIGHTING_PLAN_TIMEOUT");
      }
      throw error;
    } finally {
      clearTimeout(timer);
      inFlight = false;
    }
  };
}

export function lightingPlanFailure(error) {
  const messages = {
    LIGHTING_PLAN_BUSY: [409, "A lighting plan is already being generated. Wait for it to finish."],
    LIGHTING_PLAN_UNAVAILABLE: [503, "Lighting plan AI is not configured."],
    LIGHTING_PLAN_TIMEOUT: [504, "Lighting plan timed out. It was not automatically retried."],
    LIGHTING_PLAN_INCOMPLETE: [502, "AI returned an incomplete plan. No PDF data was accepted."],
    LIGHTING_PLAN_INVALID_JSON: [502, "AI returned invalid JSON. No PDF data was accepted."]
  };
  const code = Object.hasOwn(messages, error?.code) ? error.code : "LIGHTING_PLAN_FAILED";
  const [status, message] = messages[code] || [500, "Lighting plan generation failed."];
  return {status, body: {error: message, code}};
}
