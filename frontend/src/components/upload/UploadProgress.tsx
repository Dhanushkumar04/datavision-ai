import React from 'react';
import { Loader2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '../../utils/formatting';

interface UploadProgressProps {
  fileName: string;
  fileSizeBytes: number;
  progressPercent: number;
  statusMessage: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  fileName,
  fileSizeBytes,
  progressPercent,
  statusMessage,
}) => {
  return (
    <div className="w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {fileName}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatBytes(fileSizeBytes)} • {statusMessage || 'Processing dataset...'}
          </p>
        </div>
        <div className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
          {progressPercent < 100 ? (
            <span className="flex items-center">
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              {progressPercent}%
            </span>
          ) : (
            <span className="flex items-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Done
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
          style={{ width: `${Math.max(5, progressPercent)}%` }}
        />
      </div>
    </div>
  );
};
