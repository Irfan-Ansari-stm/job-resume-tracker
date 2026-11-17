import { AiProvider } from './ai-provider.interface.js';
import { OpenAiProvider } from './openai.provider.js';
import { FallbackAiProvider } from './fallback.provider.js';
import { config } from '../config/index.js';

export class AiProviderFactory {
  static getProvider(): AiProvider {
    if (config.ai.openaiApiKey && config.ai.openaiApiKey.trim() !== '') {
      return new OpenAiProvider();
    }
    return new FallbackAiProvider();
  }
}
