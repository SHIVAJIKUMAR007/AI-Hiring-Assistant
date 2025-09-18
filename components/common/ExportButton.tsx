import React, { useState, useRef, useEffect } from 'react';
import { type ScreenedResume } from '../../types';
import { Button } from './Button';

interface ExportButtonProps {
  data: ScreenedResume[];
  disabled?: boolean;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

export const ExportButton: React.FC<ExportButtonProps> = ({ data, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const exportableData = data.filter(r => r.status === 'completed' && r.result).map(r => ({
        fileName: r.file.name,
        ...r.result!,
    }));

    const downloadFile = (content: string, fileName: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        if (exportableData.length === 0) return;

        const headers = ['File Name', 'Match Score', 'Recommendation', 'Summary', 'Matching Skills', 'Strengths', 'Weaknesses'];
        const csvRows = [headers.join(',')];

        exportableData.forEach(item => {
            const values = [
                `"${item.fileName.replace(/"/g, '""')}"`,
                item.matchScore,
                `"${item.recommendation.replace(/"/g, '""')}"`,
                `"${item.summary.replace(/"/g, '""')}"`,
                `"${item.matchingSkills.join('; ').replace(/"/g, '""')}"`,
                `"${item.strengths.join('; ').replace(/"/g, '""')}"`,
                `"${item.weaknesses.join('; ').replace(/"/g, '""')}"`,
            ];
            csvRows.push(values.join(','));
        });

        downloadFile(csvRows.join('\n'), 'resume_screening_export.csv', 'text/csv;charset=utf-8;');
        setIsOpen(false);
    };
    
    const handleExportJSON = () => {
        if (exportableData.length === 0) return;
        const jsonString = JSON.stringify(exportableData, null, 2);
        downloadFile(jsonString, 'resume_screening_export.json', 'application/json');
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={wrapperRef}>
            <div>
                <Button variant="secondary" onClick={() => setIsOpen(!isOpen)} disabled={disabled || exportableData.length === 0}>
                    Export
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                </Button>
            </div>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1" role="none">
                        <button
                            onClick={handleExportCSV}
                            className="text-gray-700 dark:text-gray-200 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                            role="menuitem"
                        >
                            Export as CSV
                        </button>
                        <button
                            onClick={handleExportJSON}
                            className="text-gray-700 dark:text-gray-200 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                            role="menuitem"
                        >
                            Export as JSON
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
