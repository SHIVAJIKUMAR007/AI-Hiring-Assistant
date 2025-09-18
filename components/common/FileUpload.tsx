import React, { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 17.25z" />
    </svg>
);


export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(isOver);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDrag(e, false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const pdfFiles = Array.from(files).filter(file => file.type === "application/pdf");
      if(pdfFiles.length > 0) {
          onFilesSelected(pdfFiles);
      }
    }
  }, [handleDrag, onFilesSelected]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const baseClasses = "relative block w-full rounded-lg border-2 border-dashed p-12 text-center transition-colors duration-200 ease-in-out";
  const stateClasses = isDragOver ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-gray-400";

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      onDragEnter={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDragOver={(e) => handleDrag(e, true)}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label="File upload drop zone"
    >
      <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
      <span className="mt-2 block text-sm font-semibold text-gray-900">
        Drag and drop resumes here
      </span>
      <span className="block text-sm text-gray-500">or click to browse</span>
      <span className="mt-4 block text-xs text-gray-500">PDF files only</span>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
