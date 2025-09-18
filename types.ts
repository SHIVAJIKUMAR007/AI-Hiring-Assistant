
export interface RoleAnalysis {
  keyResponsibilities: string[];
  technicalSkills: string[];
  softSkills: string[];
}

export interface QuestionCategory {
  category: 'Behavioral' | 'Technical' | 'Situational';
  questions: string[];
}

export interface InterviewQuestions {
  questionCategories: QuestionCategory[];
}

export interface ResumeScreeningResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  matchingSkills: string[];
  matchScore: number;
  recommendation: 'Strongly Recommend Interview' | 'Recommend Interview' | 'Consider with Reservations' | 'Not a good fit';
}

export interface ScreenedResume {
  id: string;
  file: {
    name: string;
    type: string;
    content: string; // base64 encoded file content
  };
  text?: string;
  status: 'parsing' | 'ready' | 'screening' | 'completed' | 'error';
  result?: ResumeScreeningResult;
  error?: string;
}

export interface Analysis {
    id: string;
    roleTitle: string;
    createdAt: string;
    roleDescription: string;
    roleAnalysis: RoleAnalysis | null;
    interviewQuestions: InterviewQuestions | null;
    screenedResumes: ScreenedResume[];
}
