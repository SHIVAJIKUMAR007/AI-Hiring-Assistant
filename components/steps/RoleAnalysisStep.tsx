
import React, { useState } from 'react';
import { analyzeRoleDescription } from '../../services/geminiService';
import { type RoleAnalysis } from '../../types';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { TextArea } from '../common/TextArea';

interface RoleAnalysisStepProps {
  onAnalysisComplete: (description: string, analysis: RoleAnalysis) => void;
  initialDescription: string;
}

export const RoleAnalysisStep: React.FC<RoleAnalysisStepProps> = ({ onAnalysisComplete, initialDescription }) => {
  const [description, setDescription] = useState(initialDescription);
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
      const analysis = await analyzeRoleDescription(description);
      onAnalysisComplete(description, analysis);
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analyze Job Description</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Paste the full job description below. The AI will extract key responsibilities and skills.
        </p>
      </div>
      
      <TextArea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., Senior Frontend Engineer wanted for a fast-growing startup..."
        rows={12}
        disabled={isLoading}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      
      <div className="flex justify-end">
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