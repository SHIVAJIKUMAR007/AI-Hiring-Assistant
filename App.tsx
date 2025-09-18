
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { RoleAnalysisStep } from './components/steps/RoleAnalysisStep';
import { QuestionGeneratorStep } from './components/steps/QuestionGeneratorStep';
import { ResumeScreenerStep } from './components/steps/ResumeScreenerStep';
import { AnalysisListStep } from './components/steps/AnalysisListStep';
import { type Analysis, type RoleAnalysis, type InterviewQuestions, type ScreenedResume } from './types';
import { useTheme } from './contexts/ThemeContext';
import { getAnalyses, saveAnalyses } from './services/storageService';

const App: React.FC = () => {
  const { theme } = useTheme();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    setAnalyses(getAnalyses());
  }, []);

  useEffect(() => {
    saveAnalyses(analyses);
  }, [analyses]);

  const handleCreateAnalysis = (roleTitle: string) => {
    const newAnalysis: Analysis = {
      id: crypto.randomUUID(),
      roleTitle,
      createdAt: new Date().toISOString(),
      roleDescription: '',
      roleAnalysis: null,
      interviewQuestions: null,
      screenedResumes: [],
    };
    setAnalyses(prev => [newAnalysis, ...prev]);
    setSelectedAnalysisId(newAnalysis.id);
  };

  const handleUpdateAnalysis = (updatedAnalysis: Analysis) => {
    setAnalyses(prev => prev.map(a => a.id === updatedAnalysis.id ? updatedAnalysis : a));
  };
  
  const handleSelectAnalysis = (id: string) => {
    setSelectedAnalysisId(id);
  };

  const handleBackToList = () => {
    setSelectedAnalysisId(null);
  };

  const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId);
  
  let currentStep = 1;
  if (selectedAnalysis) {
    if (selectedAnalysis.roleAnalysis) currentStep = 2;
    if (selectedAnalysis.interviewQuestions) currentStep = 3;
  }
  
  const steps = [
    { id: 1, name: 'Role Analysis' },
    { id: 2, name: 'Question Generator' },
    { id: 3, name: 'Resume Screener' },
  ];

  const handleAnalysisComplete = (analysis: RoleAnalysis, description: string) => {
    if (selectedAnalysis) {
      handleUpdateAnalysis({ ...selectedAnalysis, roleAnalysis: analysis, roleDescription: description });
    }
  };

  const handleQuestionsGenerated = (questions: InterviewQuestions) => {
    if (selectedAnalysis) {
      handleUpdateAnalysis({ ...selectedAnalysis, interviewQuestions: questions });
    }
  };
  
  const handleBackFromWorkflow = () => {
     if (selectedAnalysis) {
        if (selectedAnalysis.interviewQuestions) {
            handleUpdateAnalysis({ ...selectedAnalysis, interviewQuestions: null });
        } else if (selectedAnalysis.roleAnalysis) {
            handleUpdateAnalysis({ ...selectedAnalysis, roleAnalysis: null });
        }
     }
  }

  return (
    <div className={`${theme} min-h-screen font-sans`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          {selectedAnalysis ? (
            <>
              <Stepper steps={steps} currentStep={currentStep} />
              <div className="mt-8 bg-white dark:bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                {currentStep === 1 && (
                  <RoleAnalysisStep 
                    analysis={selectedAnalysis}
                    onAnalysisComplete={handleAnalysisComplete}
                    onBackToList={handleBackToList}
                  />
                )}
                {currentStep === 2 && selectedAnalysis.roleAnalysis && (
                  <QuestionGeneratorStep 
                    roleAnalysis={selectedAnalysis.roleAnalysis} 
                    onQuestionsGenerated={handleQuestionsGenerated}
                    onBack={handleBackFromWorkflow}
                  />
                )}
                {currentStep === 3 && selectedAnalysis.roleAnalysis && selectedAnalysis.interviewQuestions && (
                  <ResumeScreenerStep 
                    analysis={selectedAnalysis}
                    onUpdateAnalysis={handleUpdateAnalysis}
                    onBack={handleBackFromWorkflow}
                    onStartOver={handleBackToList}
                  />
                )}
              </div>
            </>
          ) : (
             <AnalysisListStep 
                analyses={analyses} 
                onSelectAnalysis={handleSelectAnalysis} 
                onCreateAnalysis={handleCreateAnalysis} 
            />
          )}
        </main>
        <footer className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          <p>AI Hiring Support Agent</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
