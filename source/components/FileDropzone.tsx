import React, { useRef, useState } from 'react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label: string;
  subLabel?: string;
  currentFile?: File | null;
  onClear?: () => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onFileSelect, 
  accept, 
  label, 
  subLabel,
  currentFile,
  onClear
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (currentFile) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-800">{currentFile.name}</p>
            <p className="text-sm text-slate-500">{(currentFile.size / 1024).toFixed(2)} KB</p>
          </div>
        </div>
        {onClear && (
          <button 
            onClick={onClear}
            className="text-slate-400 hover:text-red-500 p-2 transition-colors"
            aria-label="Xóa file đã chọn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 scale-[1.01]' 
          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }
      `}
    >
      <input 
        type="file" 
        ref={inputRef}
        onChange={handleChange}
        accept={accept}
        className="hidden"
        aria-label={label}
        tabIndex={-1}
      />
      
      <div className="flex flex-col items-center gap-3">
        <div className={`p-4 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors ${isDragOver ? 'bg-blue-200' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-slate-700">{label}</p>
          {subLabel && <p className="text-sm text-slate-500 mt-1">{subLabel}</p>}
        </div>
      </div>
    </div>
  );
};

export default FileDropzone;