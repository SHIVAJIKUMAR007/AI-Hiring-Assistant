
import { GoogleGenAI, Type } from "@google/genai";
import { type RoleAnalysis, type InterviewQuestions, type ResumeScreeningResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const roleAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    keyResponsibilities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of key responsibilities for the role.",
    },
    technicalSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of essential technical skills (e.g., programming languages, frameworks, tools).",
    },
    softSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of important soft skills (e.g., communication, teamwork, problem-solving).",
    },
  },
  required: ["keyResponsibilities", "technicalSkills", "softSkills"],
};

const interviewQuestionsSchema = {
  type: Type.OBJECT,
  properties: {
    questionCategories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { 
            type: Type.STRING,
            enum: ['Behavioral', 'Technical', 'Situational'],
            description: "The category of the interview questions."
          },
          questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of questions for this category.",
          },
        },
        required: ["category", "questions"]
      },
    },
  },
  required: ["questionCategories"]
};

const resumeScreeningSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief two-sentence summary of the candidate's profile."
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key strengths that align with the job requirements."
        },
        weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of potential gaps or areas where the candidate lacks experience based on the requirements."
        },
        matchScore: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 representing how well the resume matches the job description."
        },
        recommendation: {
            type: Type.STRING,
            enum: ['Strongly Recommend Interview', 'Recommend Interview', 'Consider with Reservations', 'Not a good fit'],
            description: "A final recommendation for the candidate."
        }
    },
    required: ["summary", "strengths", "weaknesses", "matchScore", "recommendation"]
};

export const analyzeRoleDescription = async (description: string): Promise<RoleAnalysis> => {
  const prompt = `You are an expert HR analyst. Analyze the following job description. Extract the key responsibilities, required technical skills, and required soft skills.

Job Description:
${description}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: roleAnalysisSchema,
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as RoleAnalysis;
};


export const generateInterviewQuestions = async (analysis: RoleAnalysis): Promise<InterviewQuestions> => {
  const prompt = `Based on the following role analysis, generate a list of 12-15 interview questions. Categorize them into 'Behavioral', 'Technical', and 'Situational'.

Role Requirements:
- Key Responsibilities: ${analysis.keyResponsibilities.join(', ')}
- Technical Skills: ${analysis.technicalSkills.join(', ')}
- Soft Skills: ${analysis.softSkills.join(', ')}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: interviewQuestionsSchema,
    },
  });
  
  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as InterviewQuestions;
};

export const screenResume = async (analysis: RoleAnalysis, resumeText: string): Promise<ResumeScreeningResult> => {
    const prompt = `You are an expert technical recruiter. Screen the following resume against the provided job requirements.

**Job Requirements:**
- Key Responsibilities: ${analysis.keyResponsibilities.join(', ')}
- Required Technical Skills: ${analysis.technicalSkills.join(', ')}
- Required Soft Skills: ${analysis.softSkills.join(', ')}

**Candidate's Resume:**
${resumeText}

Provide a detailed analysis in the specified JSON format. The matchScore should be a numerical value from 0 to 100 based on how well the candidate's experience and skills align with the job requirements.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumeScreeningSchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ResumeScreeningResult;
};
