export type DebugPayload = {
  expectedBehavior: string;
  actualBehavior: string;
  agentPrompt: string;
  sampleInput: string;
  sampleOutput: string;
};

function hasSchemaInstruction(text: string) {
  return /json|schema|format|fields|required/i.test(text);
}

function isLikelyAmbiguousPrompt(prompt: string) {
  return prompt.trim().length < 120 || !hasSchemaInstruction(prompt);
}

function hasGuardrails(prompt: string) {
  return /guardrail|do not|never|must not|approval|validate/i.test(prompt);
}

function detectContextOverload(input: string, prompt: string) {
  const combinedLength = input.length + prompt.length;
  return combinedLength > 3500;
}

function detectToolDependencyRisk(prompt: string, actualBehavior: string) {
  return /api|database|web search|crm|tool/i.test(prompt) && /error|timeout|failed|unavailable/i.test(actualBehavior);
}

export function buildDiagnostics(payload: DebugPayload) {
  const ambiguity = isLikelyAmbiguousPrompt(payload.agentPrompt)
    ? "Prompt is ambiguous: add explicit success criteria, schema contract, and deterministic decision rules."
    : "Prompt clarity is acceptable but can still be improved with stricter output contracts.";

  const guardrails = hasGuardrails(payload.agentPrompt)
    ? "Guardrails exist, but validate they are enforced in post-processing."
    : "Missing guardrails: add irreversible-action confirmation and validation checks before tool execution.";

  const toolRisk = detectToolDependencyRisk(payload.agentPrompt, payload.actualBehavior)
    ? "Tool dependency risk detected: add timeout retries, fallback queue, and tool health checks."
    : "No immediate tool failure detected, keep dependency checks in place.";

  const contextRisk = detectContextOverload(payload.sampleInput, payload.agentPrompt)
    ? "Context overload likely: summarize context and split long workflows into staged prompts."
    : "Context size appears manageable for current test case.";

  const schemaGap = hasSchemaInstruction(payload.agentPrompt) && /\{|\[/.test(payload.sampleOutput)
    ? "Output schema instruction exists. Add schema validator to guarantee consistency."
    : "Output schema mismatch: enforce explicit JSON format and reject non-compliant outputs.";

  const suggestedFixes = [
    "Define exact input and output schema in prompt header.",
    "Add numbered workflow steps with explicit fallback behavior.",
    "Introduce confidence threshold and manual review trigger.",
    "Run output validator before writing to external tools.",
  ];

  return {
    ambiguity,
    guardrails,
    toolRisk,
    contextRisk,
    schemaGap,
    suggestedFixes,
  };
}
