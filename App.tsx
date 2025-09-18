
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { RoleAnalysisStep } from './components/steps/RoleAnalysisStep';
import { QuestionGeneratorStep } from './components/steps/QuestionGeneratorStep';
import { ResumeScreenerStep } from './components/steps/ResumeScreenerStep';
import { type RoleAnalysis, type InterviewQuestions } from './types';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [roleDescription, setRoleDescription] = useState<string>('');
  const [roleAnalysis, setRoleAnalysis] = useState<RoleAnalysis | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestions | null>(null);

  const steps = [
    { id: 1, name: 'Role Analysis' },
    { id: 2, name: 'Question Generator' },
    { id: 3, name: 'Resume Screener' },
  ];

  const handleAnalysisComplete = (description: string, analysis: RoleAnalysis) => {
    setRoleDescription(description);
    setRoleAnalysis(analysis);
    setCurrentStep(2);
  };

  const handleQuestionsGenerated = (questions: InterviewQuestions) => {
    setInterviewQuestions(questions);
    setCurrentStep(3);
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleStartOver = () => {
    setCurrentStep(1);
    setRoleDescription('');
    setRoleAnalysis(null);
    setInterviewQuestions(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Stepper steps={steps} currentStep={currentStep} />
        <div className="mt-8 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
          {currentStep === 1 && (
            <RoleAnalysisStep onAnalysisComplete={handleAnalysisComplete} initialDescription={roleDescription} />
          )}
          {currentStep === 2 && roleAnalysis && (
            <QuestionGeneratorStep 
              roleAnalysis={roleAnalysis} 
              onQuestionsGenerated={handleQuestionsGenerated}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && roleAnalysis && interviewQuestions && (
            <ResumeScreenerStep 
              roleAnalysis={roleAnalysis} 
              onBack={handleBack}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>AI Hiring Support Agent</p>
      </footer>
    </div>
  );
};

export default App;
