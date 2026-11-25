import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  RotateCcw, 
  Sun, 
  Moon, 
  FileSpreadsheet
} from 'lucide-react';
import { useDatasetContext } from '../../context/DatasetContext';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  const { dataset, resetAll } = useDatasetContext();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-300 bg-clip-text text-transparent">
              DataVision<span className="text-blue-600 dark:text-blue-400">.AI</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3 h-3 mr-1 text-blue-500" />
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Automated BI Dashboard & Data Engineering
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {dataset && (
          <div className="hidden md:flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-x-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium max-w-[150px] truncate" title={dataset.meta.name}>
              {dataset.meta.name}
            </span>
            <span className="text-slate-400 dark:text-slate-500">|</span>
            <span className="text-slate-500 dark:text-slate-400">
              {dataset.meta.rowCount.toLocaleString()} rows • {dataset.meta.columnCount} cols
            </span>
          </div>
        )}

        {dataset && (
          <button
            onClick={() => {
              if (window.confirm('Reset current project and upload a new dataset?')) {
                resetAll();
              }
            }}
            className="flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
            title="Reset dataset and start over"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </button>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
