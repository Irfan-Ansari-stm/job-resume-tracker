import { AiProviderFactory } from './ai-provider.factory.js';
import { tokenTrackerService } from './token-tracker.service.js';

export interface CustomizeResumeParams {
  userId: string;
  resume: any;
  targetJob: {
    title: string;
    company: string;
    description: string;
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
  };
  customInstructions?: string;
}

export class ResumeCustomizerService {
  async customizeResume(params: CustomizeResumeParams): Promise<any> {
    const hasCredit = await tokenTrackerService.checkCredits(params.userId, 1);
    if (!hasCredit) {
      throw new Error('Insufficient AI credits. Please upgrade your subscription plan.');
    }

    const provider = AiProviderFactory.getProvider();

    const systemPrompt = `You are a Principal Career Architect and Executive Resume Strategist.
Your goal is to optimize the candidate's existing resume strictly for the targeted job.
CRITICAL INTEGRITY RULES:
1. NEVER FABRICATE QUALIFICATIONS. Never invent employment history, companies, dates, certifications, degrees, or skills.
2. Only use facts provided in the candidate's actual resume.
3. If a job requirement is absent from the candidate's background, highlight it as an identified skill gap rather than inventing experience.
4. Enhance clarity, active voice, bullet point impact, and ATS alignment while preserving 100% truthfulness.
5. Provide a JSON response format.`;

    const userPrompt = JSON.stringify({
      resume: params.resume,
      targetJob: params.targetJob,
      instructions: params.customInstructions,
    });

    let completion;
    try {
      completion = await provider.generateCompletion(systemPrompt, userPrompt, {
        temperature: 0.3,
        responseFormat: 'json',
      });

      let parsed: any;
      try {
        parsed = JSON.parse(completion.content);
      } catch {
        parsed = { error: 'Failed to parse AI output', raw: completion.content };
      }

      await tokenTrackerService.logUsage({
        userId: params.userId,
        operationType: 'customize_resume',
        model: completion.model,
        promptVersion: 'v1.0',
        inputTokens: completion.inputTokens,
        outputTokens: completion.outputTokens,
        totalTokens: completion.totalTokens,
        durationMs: completion.durationMs,
        status: 'success',
        metadata: {
          jobTitle: params.targetJob.title,
          company: params.targetJob.company,
        },
      });

      return parsed;
    } catch (err: any) {
      await tokenTrackerService.logUsage({
        userId: params.userId,
        operationType: 'customize_resume',
        model: provider.name,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        durationMs: 0,
        status: 'failed',
        errorMessage: err.message,
      });
      throw err;
    }
  }
}

export const resumeCustomizerService = new ResumeCustomizerService();
