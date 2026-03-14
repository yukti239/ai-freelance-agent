import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
const ai = API_KEY && API_KEY !== 'your_gemini_api_key_here' ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const geminiService = {
  /**
   * Analyzes project requirements and generates milestones.
   */
  async analyzeRequirements(title: string, description: string, budget: number) {
    if (!ai) {
      // Return mock milestones when API key is not configured
      return [
        {
          title: "Project Setup & Planning",
          description: "Initialize project repository, set up development environment, and create initial project structure.",
          budget: Math.round(budget * 0.2)
        },
        {
          title: "Core Development",
          description: "Implement the main functionality and features according to project requirements.",
          budget: Math.round(budget * 0.5)
        },
        {
          title: "Testing & Quality Assurance",
          description: "Conduct thorough testing, bug fixes, and ensure code quality standards are met.",
          budget: Math.round(budget * 0.2)
        },
        {
          title: "Deployment & Documentation",
          description: "Deploy the project and create comprehensive documentation for maintenance and future development.",
          budget: Math.round(budget * 0.1)
        }
      ];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following project and break it down into 3-5 technical milestones. 
      Project Title: ${title}
      Description: ${description}
      Total Budget: ${budget}
      
      Each milestone must have a title, detailed description, and a budget allocation (sum of all milestone budgets must equal the total budget).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              budget: { type: Type.NUMBER }
            },
            required: ["title", "description", "budget"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  },

  /**
   * Evaluates a submission against milestone requirements.
   */
  async evaluateSubmission(milestoneTitle: string, milestoneDesc: string, submissionContent: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Evaluate the following submission against the milestone requirements.
      Milestone: ${milestoneTitle}
      Requirements: ${milestoneDesc}
      Submission: ${submissionContent}
      
      Determine if the work is:
      1. Fully Completed (Trigger payment)
      2. Partially Completed (Trigger feedback/pro-rated release)
      3. Unmet (Initiate refund protocol)
      
      Provide a status and detailed feedback.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { 
              type: Type.STRING, 
              enum: ["approved", "rejected", "partially_approved"] 
            },
            feedback: { type: Type.STRING },
            score: { type: Type.NUMBER, description: "Score from 0-100 for PFI calculation" }
          },
          required: ["status", "feedback", "score"]
        }
      }
    });

    return JSON.parse(response.text);
  },

  /**
   * Predicts project risk and difficulty.
   */
  async predictRisk(title: string, description: string, budget: number) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following project for risks and difficulty.
      Project Title: ${title}
      Description: ${description}
      Budget: ${budget}
      
      Predict:
      1. Difficulty Level (1-10)
      2. Risk Level (Low, Medium, High)
      3. Potential Challenges
      4. Recommended Timeline`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            difficulty: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedTimeline: { type: Type.STRING }
          },
          required: ["difficulty", "riskLevel", "challenges", "recommendedTimeline"]
        }
      }
    });
    return JSON.parse(response.text);
  },

  /**
   * Generates a smart contract agreement.
   */
  async generateSmartContract(project: any, milestones: any[]) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional freelance agreement (Smart Contract) for:
      Project: ${project.title}
      Description: ${project.description}
      Total Budget: ${project.totalBudget}
      Milestones: ${JSON.stringify(milestones)}
      
      Include scope of work, payment terms, and refund conditions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            agreementId: { type: Type.STRING },
            scopeOfWork: { type: Type.STRING },
            paymentTerms: { type: Type.STRING },
            refundConditions: { type: Type.STRING },
            legalDisclaimer: { type: Type.STRING }
          },
          required: ["agreementId", "scopeOfWork", "paymentTerms", "refundConditions"]
        }
      }
    });
    return JSON.parse(response.text);
  },

  /**
   * Resolves a dispute between employer and freelancer.
   */
  async resolveDispute(milestone: any, submission: any, disputeReason: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Act as a neutral AI Arbitrator. Resolve the following dispute:
      Milestone: ${milestone.title}
      Requirements: ${milestone.description}
      Submission: ${submission.content}
      Dispute Reason: ${disputeReason}
      
      Analyze the evidence and suggest a fair decision.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision: { type: Type.STRING, enum: ["Release Payment", "Partial Refund", "Full Refund", "Request Revision"] },
            reasoning: { type: Type.STRING },
            suggestedRefundAmount: { type: Type.NUMBER }
          },
          required: ["decision", "reasoning"]
        }
      }
    });
    return JSON.parse(response.text);
  }
};
