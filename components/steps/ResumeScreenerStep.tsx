
import React, { useState, useCallback, useMemo, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { screenResume } from '../../services/geminiService';
import { type Analysis, type RoleAnalysis, type ResumeScreeningResult, type ScreenedResume } from '../../types';
import { fileToBase64, base64ToBlobUrl, base64ToArrayBuffer } from '../../utils/fileUtils';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { FileUpload } from '../common/FileUpload';
import { ExportButton } from '../common/ExportButton';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.5.136/build/pdf.worker.mjs`;

interface ResumeScreenerStepProps {
  analysis: Analysis;
  onUpdateAnalysis: (analysis: Analysis) => void;
  onBack: () => void;
  onStartOver: () => void;
}

const getRecommendationClasses = (recommendation: ResumeScreeningResult['recommendation']) => {
    switch (recommendation) {
        case 'Strongly Recommend Interview': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        case 'Recommend Interview': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'Consider with Reservations': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        case 'Not a good fit': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
}

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
    if (!direction) return <svg className="w-4 h-4 inline-block ml-1 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
    if (direction === 'ascending') return <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
    return <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
};

const SkillChip: React.FC<{ skill: string }> = ({ skill }) => (
    <span className="inline-block bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full">
        {skill}
    </span>
);

export const ResumeScreenerStep: React.FC<ResumeScreenerStepProps> = ({ analysis, onUpdateAnalysis, onBack, onStartOver }) => {
  const [isScreening, setIsScreening] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'matchScore', direction: 'ascending' | 'descending' }>({ key: 'matchScore', direction: 'descending' });
  const addFileInputRef = useRef<HTMLInputElement>(null);
  
  const setResumes = (updater: (prev: ScreenedResume[]) => ScreenedResume[]) => {
    const newResumes = updater(analysis.screenedResumes);
    onUpdateAnalysis({ ...analysis, screenedResumes: newResumes });
  };

  const extractTextFromPDF = async (base64Content: string): Promise<string> => {
    const pdfData = base64ToArrayBuffer(base64Content);
    const pdf = await pdfjsLib.getDocument(pdfData).promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
    }
    return textContent;
  };

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    const newResumePromises = Array.from(selectedFiles).map(async (file) => {
      const content = await fileToBase64(file);
      return {
        id: crypto.randomUUID(),
        file: { name: file.name, type: file.type, content },
        status: 'parsing',
      } as ScreenedResume;
    });
    
    const newResumes = await Promise.all(newResumePromises);
    setResumes(prev => [...prev, ...newResumes]);

    for (const resume of newResumes) {
      try {
        const text = await extractTextFromPDF(resume.file.content);
        setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, text, status: 'ready' } : r));
      } catch (error) {
        console.error('Failed to parse PDF:', error);
        setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, status: 'error', error: 'Failed to parse PDF' } : r));
      }
    }
  }, []);

  const handleScreenResumes = useCallback(async () => {
    setIsScreening(true);
    setResumes(prev => prev.map(r => r.status === 'ready' ? { ...r, status: 'screening' } : r));
    
    const screeningPromises = analysis.screenedResumes
      .filter(r => r.status === 'ready' && r.text)
      .map(async (resume) => {
        try {
          const result = await screenResume(analysis.roleAnalysis!, resume.text!);
          setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, result, status: 'completed' } : r));
        } catch (error) {
          console.error('Failed to screen resume:', error);
          setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, status: 'error', error: 'Screening failed' } : r));
        }
      });
    
    await Promise.all(screeningPromises);
    setIsScreening(false);
  }, [analysis]);

  const handleViewPdf = (file: ScreenedResume['file']) => {
    const url = base64ToBlobUrl(file.content, file.type);
    window.open(url, '_blank');
  };

  const handleClear = () => {
    setResumes(() => []);
  }

  const handleAddMoreClick = () => {
    addFileInputRef.current?.click();
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelected(Array.from(files));
    }
    if (e.target) {
        e.target.value = '';
    }
  };

  const sortedResumes = useMemo(() => {
    return [...analysis.screenedResumes].sort((a, b) => {
      if (!a.result || !b.result) return 0;
      if (a.result[sortConfig.key] < b.result[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a.result[sortConfig.key] > b.result[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [analysis.screenedResumes, sortConfig]);

  const requestSort = (key: 'matchScore') => {
    let direction: 'ascending' | 'descending' = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };
  
  const readyToScreenCount = analysis.screenedResumes.filter(r => r.status === 'ready').length;
  const isAnythingDone = analysis.screenedResumes.some(r => r.status === 'completed');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Resume Screener</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Upload candidate resumes in PDF format to screen them against the job requirements.
        </p>
      </div>

      <input
        type="file"
        multiple
        accept="application/pdf"
        ref={addFileInputRef}
        onChange={handleAddFiles}
        className="hidden"
      />

      {analysis.screenedResumes.length === 0 ? (
        <FileUpload onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">{analysis.screenedResumes.length} resume(s) uploaded.</p>
                <div className="flex gap-2 flex-wrap justify-end">
                    <ExportButton data={sortedResumes} disabled={!isAnythingDone} />
                    <Button onClick={handleAddMoreClick} variant='secondary'>Add Resumes</Button>
                    <Button onClick={handleClear} variant='secondary'>Clear All</Button>
                    <Button onClick={handleScreenResumes} disabled={isScreening || readyToScreenCount === 0}>
                        {isScreening ? <><Spinner />Screening...</> : `Screen ${readyToScreenCount} Resumes`}
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Candidate</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('matchScore')}>
                                Match Score <SortIcon direction={sortConfig.key === 'matchScore' ? sortConfig.direction : undefined} />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Matching Skills</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recommendation</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedResumes.map((resume, index) => (
                            <tr key={resume.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800/50' : 'bg-gray-50/50 dark:bg-gray-800/20'}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate sm:max-w-xs md:max-w-sm" title={resume.file.name}>{resume.file.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {resume.status === 'parsing' && 'Parsing...'}
                                        {resume.status === 'ready' && 'Ready to screen'}
                                        {resume.status === 'screening' && 'Screening...'}
                                        {resume.status === 'completed' && 'Screening complete'}
                                        {resume.status === 'error' && <span className="text-red-500">{resume.error}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {resume.result ? (
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-primary-700 dark:text-primary-400 w-10">{resume.result.matchScore}%</span>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${resume.result.matchScore}%` }}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full animate-pulse"></div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {resume.result && (
                                        <div className="flex flex-wrap gap-1 max-w-sm">
                                            {resume.result.matchingSkills.length > 0 ? (
                                                resume.result.matchingSkills.slice(0, 8).map(skill => <SkillChip key={skill} skill={skill} />)
                                            ) : (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">No specific matches</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {resume.result && (
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRecommendationClasses(resume.result.recommendation)}`}>
                                            {resume.result.recommendation}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button onClick={() => handleViewPdf(resume.file)} variant="secondary" size="sm">View PDF</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
      
      <div className="flex justify-between mt-4">
        <Button onClick={onBack} variant="secondary">Back</Button>
        <Button onClick={onStartOver}>Back to Analyses</Button>
      </div>
    </div>
  );
};
