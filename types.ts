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
  file: File;
  text?: string;
  status: 'parsing' | 'ready' | 'screening' | 'completed' | 'error';
  result?: ResumeScreeningResult;
  error?: string;
}