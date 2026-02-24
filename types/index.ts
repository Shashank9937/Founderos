export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type DiagnosticOutput = {
  ambiguity: string;
  guardrails: string;
  toolRisk: string;
  contextRisk: string;
  schemaGap: string;
  suggestedFixes: string[];
};
