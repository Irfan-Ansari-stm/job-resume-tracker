import OpenAI from 'openai';
import { AiProvider, CompletionOptions, CompletionResult } from './ai-provider.interface.js';
import { config } from '../config/index.js';

export class OpenAiProvider implements AiProvider {
  public name = 'openai';
  private client: OpenAI | null = null;
  private model: string;

  constructor() {
    this.model = config.ai.model;
    if (config.ai.openaiApiKey) {
      this.client = new OpenAI({
        apiKey: config.ai.openaiApiKey,
        timeout: config.ai.timeoutMs,
      });
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: CompletionOptions
  ): Promise<CompletionResult> {
    if (!this.client) {
      throw new Error('OpenAI API key is not configured');
    }

    const start = Date.now();
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: options?.temperature ?? config.ai.temperature,
      response_format: options?.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const durationMs = Date.now() - start;
    const choice = response.choices[0];
    const content = choice.message?.content || '';
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;

    return {
      content,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      model: this.model,
      durationMs,
    };
  }
}
