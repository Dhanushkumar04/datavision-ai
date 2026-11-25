import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { validateFile, SUPPORTED_EXTENSIONS } from '../../services/fileParser';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    setValidationError(null);
    const validation = validateFile(file);

    if (!validation.isValid) {
      setValidationError(validation.errors.join(' '));
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/10'
        } ${isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8 animate-pulse" />
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
            Drag & Drop your dataset here
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            or <span className="text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-2">browse files</span> from your computer
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              CSV (.csv)
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />
              Excel (.xlsx, .xls)
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
              Max 50 MB
            </span>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-2 text-xs text-red-700 dark:text-red-300">
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
