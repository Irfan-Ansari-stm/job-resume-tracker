export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}

export interface CompletionResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  durationMs: number;
}

export interface AiProvider {
  name: string;
  generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: CompletionOptions
  ): Promise<CompletionResult>;
}
