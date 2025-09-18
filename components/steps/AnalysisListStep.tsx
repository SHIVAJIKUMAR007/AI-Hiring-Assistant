
import React, { useState } from 'react';
import { type Analysis } from '../../types';
import { Card } from '../common/Card';

interface AnalysisListStepProps {
  analyses: Analysis[];
  onSelectAnalysis: (id: string) => void;
  onCreateAnalysis: (title: string) => void;
}

const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const AnalysisListStep: React.FC<AnalysisListStepProps> = ({ analyses, onSelectAnalysis, onCreateAnalysis }) => {
    const [newTitle, setNewTitle] = useState('');
    
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim()) {
            onCreateAnalysis(newTitle.trim());
            setNewTitle('');
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Analyses</h2>
                <p className="mt-2 text-md text-gray-600 dark:text-gray-400">
                    Create a new analysis for a job role or select a previous one to continue.
                </p>
            </div>

            <Card className="bg-white dark:bg-gray-800/50 p-2">
                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g., Senior Frontend Engineer"
                        className="w-full sm:flex-grow bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-3 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-gray-800/50"
                        aria-label="New analysis title"
                    />
                    <button 
                        type="submit" 
                        disabled={!newTitle.trim()} 
                        className="flex shrink-0 items-center justify-center sm:w-auto w-full gap-3 px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                    >
                        <PlusIcon className="w-6 h-6" />
                        <span className="text-left">Create New Analysis</span>
                    </button>
                </form>
            </Card>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {analyses.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created On</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                            {analyses.map(analysis => (
                                <tr 
                                    key={analysis.id}
                                    onClick={() => onSelectAnalysis(analysis.id)}
                                    className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && onSelectAnalysis(analysis.id)}
                                    aria-label={`Select analysis for ${analysis.roleTitle}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <h3 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">{analysis.roleTitle}</h3>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(analysis.createdAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800/50">
                        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No analyses yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">Create your first analysis to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
