
import React, { useState, useEffect } from 'react';
import { generateInterviewQuestions } from '../../services/geminiService';
import { type RoleAnalysis, type InterviewQuestions, type QuestionCategory } from '../../types';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { Card } from '../common/Card';

interface QuestionGeneratorStepProps {
  roleAnalysis: RoleAnalysis;
  onQuestionsGenerated: (questions: InterviewQuestions) => void;
  onBack: () => void;
}

const SkillChip: React.FC<{ skill: string }> = ({ skill }) => (
    <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded-full">
        {skill}
    </span>
);

const QuestionCard: React.FC<{ category: QuestionCategory }> = ({ category }) => (
    <Card>
        <h4 className="text-lg font-semibold text-primary-800 mb-3">{category.category} Questions</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
            {category.questions.map((q, index) => <li key={index}>{q}</li>)}
        </ul>
    </Card>
);

export const QuestionGeneratorStep: React.FC<QuestionGeneratorStepProps> = ({ roleAnalysis, onQuestionsGenerated, onBack }) => {
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const result = await generateInterviewQuestions(roleAnalysis);
        setQuestions(result);
      } catch (e) {
        setError('Failed to generate interview questions. Please try again.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleAnalysis]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Interview Question Generator</h2>
        <p className="mt-1 text-sm text-gray-600">
          Based on the analysis, here are suggested interview questions.
        </p>
      </div>

      <Card>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Role Analysis Summary</h3>
        <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Technical Skills</h4>
            <div>{roleAnalysis.technicalSkills.map(skill => <SkillChip key={skill} skill={skill} />)}</div>
        </div>
        <div>
            <h4 className="font-semibold text-gray-700 mb-2">Soft Skills</h4>
            <div>{roleAnalysis.softSkills.map(skill => <SkillChip key={skill} skill={skill} />)}</div>
        </div>
      </Card>
      
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-gray-600 py-8">
          <Spinner />
          <span>Generating questions...</span>
        </div>
      )}

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {questions && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.questionCategories.map(cat => <QuestionCard key={cat.category} category={cat} />)}
        </div>
      )}

      <div className="flex justify-between mt-4">
        <Button onClick={onBack} variant="secondary">Back</Button>
        <Button onClick={() => questions && onQuestionsGenerated(questions)} disabled={isLoading || !!error || !questions}>
          Proceed to Resume Screening
        </Button>
      </div>
    </div>
  );
};
