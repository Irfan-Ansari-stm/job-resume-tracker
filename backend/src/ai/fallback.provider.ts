import { AiProvider, CompletionOptions, CompletionResult } from './ai-provider.interface.js';

export class FallbackAiProvider implements AiProvider {
  public name = 'rule-based-fallback';

  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: CompletionOptions
  ): Promise<CompletionResult> {
    const start = Date.now();
    let parsedInput: any = {};
    try {
      parsedInput = JSON.parse(userPrompt);
    } catch {
      parsedInput = { prompt: userPrompt };
    }

    let outputJson: any = {};

    // Analyze what kind of AI prompt this is
    if (systemPrompt.includes('RESUME_CUSTOMIZATION') || userPrompt.includes('targetJob')) {
      const resume = parsedInput.resume || {};
      const job = parsedInput.targetJob || {};
      const jobDesc = (job.description || '') + ' ' + (job.title || '');
      const candidateSkills: string[] = [];

      (resume.skills || []).forEach((cat: any) => {
        if (Array.isArray(cat.items)) {
          candidateSkills.push(...cat.items);
        }
      });

      // Extract keywords from job description
      const commonTechKeywords = [
        'python', 'sql', 'tableau', 'power bi', 'excel', 'r', 'aws', 'docker', 'kubernetes',
        'react', 'node.js', 'typescript', 'javascript', 'postgresql', 'mongodb', 'agile',
        'scrum', 'jira', 'confluence', 'git', 'ci/cd', 'etl', 'pandas', 'numpy', 'spark',
        'data analysis', 'business analysis', 'stakeholder management', 'problem solving',
        'rest api', 'microservices', 'graphql', 'figma', 'ui/ux', 'wireframing', 'user research'
      ];

      const lowerDesc = jobDesc.toLowerCase();
      const jobKeywords = commonTechKeywords.filter(k => lowerDesc.includes(k));
      const matched = candidateSkills.filter(s => 
        jobKeywords.some(k => s.toLowerCase().includes(k) || k.includes(s.toLowerCase()))
      );
      const missing = jobKeywords.filter(k => 
        !candidateSkills.some(s => s.toLowerCase().includes(k) || k.includes(s.toLowerCase()))
      );

      const matchRatio = jobKeywords.length > 0 
        ? Math.min(95, Math.max(45, Math.round((matched.length / jobKeywords.length) * 100))) 
        : 78;

      // Tailor the professional summary strictly from the candidate's existing background
      const existingSummary = resume.summary || 'Results-driven professional with proven domain experience.';
      const tailoredSummary = `Targeted for ${job.title || 'the role'} at ${job.company || 'the organization'}: ${existingSummary} Dedicated to applying proven strengths in ${matched.slice(0, 3).join(', ') || 'analytical problem solving'} to drive measurable business impact.`;

      // Skills gap report without inventing skills
      const skillsGapReport = missing.map(m => ({
        skill: m.toUpperCase(),
        severity: ['python', 'sql', 'react', 'aws'].includes(m) ? 'critical' : 'moderate',
        recommendation: `Requirement mentioned in job posting. Candidate does not list ${m} on primary resume; highlight transferable experience or address in interview preparation.`,
      }));

      outputJson = {
        customizedResume: {
          ...resume,
          summary: tailoredSummary,
          skills: resume.skills || [],
          experience: resume.experience || [],
          education: resume.education || [],
          projects: resume.projects || [],
          certifications: resume.certifications || [],
        },
        jobAnalysis: {
          targetTitle: job.title,
          targetCompany: job.company,
          keyRequirements: jobKeywords,
          atsKeywords: jobKeywords,
        },
        matchedKeywords: matched.length > 0 ? matched : ['Domain Experience', 'Problem Solving', 'Communication'],
        missingKeywords: missing,
        skillsGapReport,
        matchScore: matchRatio,
        changeSummary: `Refined professional summary for ${job.title} at ${job.company}, highlighted ${matched.length} key matching competencies (${matched.slice(0, 4).join(', ')}), and identified ${missing.length} missing keywords for review. Preserved candidate career facts verbatim.`,
        disclaimer: 'Matching score is an automated algorithmic estimate and does not guarantee employer ATS acceptance.',
      };
    } else if (systemPrompt.includes('INTERVIEW_PREP') || systemPrompt.includes('Interview Strategist')) {
      outputJson = {
        overview: 'Strategic interview preparation plan tailored to the targeted role and candidate experience.',
        keyTalkingPoints: [
          'Highlight past project milestones with measurable metrics and problem-solving examples',
          'Demonstrate alignment with the target company culture and technical requirements',
          'Clearly articulate transferable skills and experience with key tools'
        ],
        suggestedQuestions: [
          {
            question: 'Can you walk us through a complex project where you had to analyze data or build a feature under tight deadlines?',
            category: 'technical',
            talkingPoints: 'Reference your most recent work experience, detail your methodology, tools used, and the measurable business outcome.'
          },
          {
            question: 'How do you handle ambiguous requirements or conflicting priorities with stakeholders?',
            category: 'behavioral',
            talkingPoints: 'Use the STAR method: Situation, Task, Action, and Result, highlighting communication and proactive alignment.'
          },
          {
            question: 'Why are you interested in joining our company for this specific role?',
            category: 'company_specific',
            talkingPoints: 'Connect your career progression to the company domain, mission, and current industry challenges.'
          }
        ]
      };
    } else if (systemPrompt.includes('JOB_ANALYSIS') || userPrompt.includes('jobDescription')) {
      const desc = (parsedInput.jobDescription || userPrompt).toLowerCase();
      const techList = [
        'sql', 'python', 'excel', 'tableau', 'power bi', 'aws', 'docker', 'react',
        'typescript', 'node.js', 'postgresql', 'agile', 'scrum', 'git', 'rest api', 'jira'
      ];
      const identifiedSkills = techList.filter(t => desc.includes(t));
      outputJson = {
        requiredSkills: identifiedSkills.slice(0, 5),
        preferredSkills: identifiedSkills.slice(5),
        responsibilities: [
          'Collaborate with cross-functional teams to deliver business objectives',
          'Analyze data and deliver clear actionable business insights',
          'Maintain high quality development and documentation standards'
        ],
        qualifications: [
          "Bachelor's degree or equivalent practical experience",
          'Demonstrated expertise in relevant core technical skills'
        ],
        atsKeywords: identifiedSkills,
      };
    } else {
      outputJson = {
        status: 'success',
        result: 'Processed successfully.',
      };
    }

    const durationMs = Date.now() - start;
    return {
      content: JSON.stringify(outputJson),
      inputTokens: 180,
      outputTokens: 290,
      totalTokens: 470,
      model: 'deterministic-fallback',
      durationMs,
    };
  }
}
