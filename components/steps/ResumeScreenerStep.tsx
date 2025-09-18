import React, { useState, useCallback, useMemo, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { screenResume } from '../../services/geminiService';
import { type RoleAnalysis, type ResumeScreeningResult, type ScreenedResume } from '../../types';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { FileUpload } from '../common/FileUpload';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.5.136/build/pdf.worker.mjs`;

interface ResumeScreenerStepProps {
  roleAnalysis: RoleAnalysis;
  onBack: () => void;
  onStartOver: () => void;
}

const getRecommendationClasses = (recommendation: ResumeScreeningResult['recommendation']) => {
    switch (recommendation) {
        case 'Strongly Recommend Interview': return 'bg-green-100 text-green-800';
        case 'Recommend Interview': return 'bg-blue-100 text-blue-800';
        case 'Consider with Reservations': return 'bg-yellow-100 text-yellow-800';
        case 'Not a good fit': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
    if (!direction) return <svg className="w-4 h-4 inline-block ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
    if (direction === 'ascending') return <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
    return <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
};

export const ResumeScreenerStep: React.FC<ResumeScreenerStepProps> = ({ roleAnalysis, onBack, onStartOver }) => {
  const [resumes, setResumes] = useState<ScreenedResume[]>([]);
  const [isScreening, setIsScreening] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'matchScore', direction: 'ascending' | 'descending' }>({ key: 'matchScore', direction: 'descending' });
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
    }
    return textContent;
  };

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    const newResumes: ScreenedResume[] = Array.from(selectedFiles).map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'parsing',
    }));
    setResumes(prev => [...prev, ...newResumes]);

    for (const resume of newResumes) {
      try {
        const text = await extractTextFromPDF(resume.file);
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
    
    const screeningPromises = resumes
      .filter(r => r.status === 'ready' && r.text)
      .map(async (resume) => {
        try {
          const result = await screenResume(roleAnalysis, resume.text!);
          setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, result, status: 'completed' } : r));
        } catch (error) {
          console.error('Failed to screen resume:', error);
          setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, status: 'error', error: 'Screening failed' } : r));
        }
      });
    
    await Promise.all(screeningPromises);
    setIsScreening(false);
  }, [resumes, roleAnalysis]);

  const handleViewPdf = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const handleClear = () => {
    setResumes([]);
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
    return [...resumes].sort((a, b) => {
      if (!a.result || !b.result) return 0;
      if (a.result[sortConfig.key] < b.result[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a.result[sortConfig.key] > b.result[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [resumes, sortConfig]);

  const requestSort = (key: 'matchScore') => {
    let direction: 'ascending' | 'descending' = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };
  
  const readyToScreenCount = resumes.filter(r => r.status === 'ready').length;
  const isAnythingDone = resumes.some(r => r.status === 'completed');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resume Screener</h2>
        <p className="mt-1 text-sm text-gray-600">
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

      {resumes.length === 0 ? (
        <FileUpload onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
                <p className="text-sm text-gray-600">{resumes.length} resume(s) uploaded.</p>
                <div className="flex gap-2 flex-wrap justify-end">
                    <Button onClick={handleAddMoreClick} variant='secondary'>Add Resumes</Button>
                    <Button onClick={handleClear} variant='secondary'>Clear All</Button>
                    <Button onClick={handleScreenResumes} disabled={isScreening || readyToScreenCount === 0}>
                        {isScreening ? <><Spinner />Screening...</> : `Screen ${readyToScreenCount} Resumes`}
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('matchScore')}>
                                Match Score <SortIcon direction={sortConfig.key === 'matchScore' ? sortConfig.direction : undefined} />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedResumes.map(resume => (
                            <tr key={resume.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{resume.file.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {resume.status === 'parsing' && 'Parsing...'}
                                        {resume.status === 'ready' && 'Ready to screen'}
                                        {resume.status === 'screening' && 'Screening...'}
                                        {resume.status === 'completed' && 'Screening complete'}
                                        {resume.status === 'error' && <span className="text-red-500">{resume.error}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {resume.result ? (
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-primary-700 w-10">{resume.result.matchScore}%</span>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${resume.result.matchScore}%` }}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-2.5 bg-gray-200 rounded-full animate-pulse"></div>
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
        {isAnythingDone && (
            <Button onClick={onStartOver}>Start New Analysis</Button>
        )}
      </div>
    </div>
  );
};