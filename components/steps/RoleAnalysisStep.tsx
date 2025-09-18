
import React, { useState } from 'react';
import { analyzeRoleDescription } from '../../services/geminiService';
import { type Analysis, type RoleAnalysis } from '../../types';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { TextArea } from '../common/TextArea';

interface RoleAnalysisStepProps {
  analysis: Analysis;
  onAnalysisComplete: (analysis: RoleAnalysis, description: string) => void;
  onBackToList: () => void;
}

export const RoleAnalysisStep: React.FC<RoleAnalysisStepProps> = ({ analysis, onAnalysisComplete, onBackToList }) => {
  const [description, setDescription] = useState(analysis.roleDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!description.trim()) {
      setError('Please paste a job description to analyze.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const analysisResult = await analyzeRoleDescription(description);
      onAnalysisComplete(analysisResult, description);
    } catch (e) {
      setError('Failed to analyze the role description. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analyze Job Description: <span className="text-primary-600 dark:text-primary-400">{analysis.roleTitle}</span></h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Paste the full job description below. The AI will extract key responsibilities and skills.
        </p>
      </div>
      
      <TextArea
        value={description}
        className="text-white"
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., Senior Frontend Engineer wanted for a fast-growing startup..."
        rows={12}
        disabled={isLoading}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      
      <div className="flex justify-between">
        <Button onClick={onBackToList} variant="secondary">Back to Analyses</Button>
        <Button onClick={handleAnalyze} disabled={isLoading || !description.trim()}>
          {isLoading ? (
            <>
              <Spinner />
              Analyzing...
            </>
          ) : (
            'Analyze and Proceed'
          )}
        </Button>
      </div>
    </div>
  );
};
