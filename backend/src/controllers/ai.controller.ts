import { Request, Response } from 'express';
import { resumeCustomizerService } from '../ai/resume-customizer.service.js';
import { jobAnalyzerService } from '../ai/job-analyzer.service.js';
import { AiProviderFactory } from '../ai/ai-provider.factory.js';
import { tokenTrackerService } from '../ai/token-tracker.service.js';
import { subscriptionRepository } from '../repositories/subscription.repository.js';
import { db } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AiController {
  async customizeResume(req: Request, res: Response) {
    try {
      const { resume, targetJob, customInstructions } = req.body;
      if (!resume || !targetJob || !targetJob.title || !targetJob.description) {
        sendError(res, 'Resume and complete target job details (title, description) are required', 400);
        return;
      }

      const result = await resumeCustomizerService.customizeResume({
        userId: req.user!.id,
        resume,
        targetJob,
        customInstructions,
      });

      sendSuccess(res, result, 'Resume customized successfully');
    } catch (err: any) {
      sendError(res, err.message || 'AI customization failed', 500);
    }
  }

  async analyzeJob(req: Request, res: Response) {
    try {
      const { jobTitle, companyName, jobDescription } = req.body;
      if (!jobTitle || !jobDescription) {
        sendError(res, 'Job title and description are required', 400);
        return;
      }

      const result = await jobAnalyzerService.analyzeJob({
        userId: req.user!.id,
        jobTitle,
        companyName: companyName || 'Target Organization',
        jobDescription,
      });

      sendSuccess(res, result, 'Job description analyzed successfully');
    } catch (err: any) {
      sendError(res, err.message || 'Job analysis failed', 500);
    }
  }

  async interviewPrep(req: Request, res: Response) {
    try {
      const { jobTitle, companyName, jobDescription, candidateSummary } = req.body;
      const provider = AiProviderFactory.getProvider();

      const systemPrompt = `INTERVIEW_PREP: You are an Executive Career Coach and Interview Strategist.
Generate comprehensive, realistic interview preparation recommendations based on the target role and candidate background.
Provide output in JSON format including overview, key talking points, and suggested behavioral and technical questions.
DO NOT fabricate candidate experiences. Only recommend highlighting actual candidate strengths.`;

      const userPrompt = JSON.stringify({
        jobTitle,
        companyName,
        jobDescription,
        candidateSummary,
      });

      const completion = await provider.generateCompletion(systemPrompt, userPrompt, {
        temperature: 0.3,
        responseFormat: 'json',
      });

      let parsed: any;
      try {
        parsed = JSON.parse(completion.content);
      } catch {
        parsed = { raw: completion.content };
      }

      await tokenTrackerService.logUsage({
        userId: req.user!.id,
        operationType: 'interview_prep',
        model: completion.model,
        inputTokens: completion.inputTokens,
        outputTokens: completion.outputTokens,
        totalTokens: completion.totalTokens,
        durationMs: completion.durationMs,
        status: 'success',
      });

      sendSuccess(res, parsed, 'Interview preparation plan generated');
    } catch (err: any) {
      sendError(res, err.message || 'Interview prep failed', 500);
    }
  }

  async getUsage(req: Request, res: Response) {
    const resLogs = await db.query(
      `SELECT * FROM ai_usage_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.id]
    );
    sendSuccess(res, resLogs.rows);
  }

  async getCredits(req: Request, res: Response) {
    const credits = await subscriptionRepository.getAiCredits(req.user!.id);
    sendSuccess(res, credits);
  }
}

export const aiController = new AiController();
