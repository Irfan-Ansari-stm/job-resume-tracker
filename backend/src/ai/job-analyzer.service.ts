import { AiProviderFactory } from './ai-provider.factory.js';
import { tokenTrackerService } from './token-tracker.service.js';

export interface JobAnalysisParams {
  userId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
}

export class JobAnalyzerService {
  async analyzeJob(params: JobAnalysisParams): Promise<any> {
    const provider = AiProviderFactory.getProvider();

    const systemPrompt = `You are an expert Job Description Analyzer and ATS Specialist.
Analyze the provided job description and extract:
1. Required skills (core mandatory technical/functional requirements).
2. Preferred skills (bonus qualifications).
3. Core responsibilities.
4. Experience & education requirements.
5. High-frequency ATS keywords.
Respond in strict JSON format.`;

    const userPrompt = JSON.stringify({
      jobTitle: params.jobTitle,
      company: params.companyName,
      jobDescription: params.jobDescription,
    });

    const completion = await provider.generateCompletion(systemPrompt, userPrompt, {
      temperature: 0.2,
      responseFormat: 'json',
    });

    let result: any;
    try {
      result = JSON.parse(completion.content);
    } catch {
      result = { raw: completion.content };
    }

    await tokenTrackerService.logUsage({
      userId: params.userId,
      operationType: 'analyze_job',
      model: completion.model,
      promptVersion: 'v1.0',
      inputTokens: completion.inputTokens,
      outputTokens: completion.outputTokens,
      totalTokens: completion.totalTokens,
      durationMs: completion.durationMs,
      status: 'success',
      metadata: {
        company: params.companyName,
        title: params.jobTitle,
      },
    });

    return result;
  }
}

export const jobAnalyzerService = new JobAnalyzerService();
