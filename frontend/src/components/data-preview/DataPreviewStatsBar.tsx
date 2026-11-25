import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  RotateCcw, 
  ArrowRight, 
  TrendingUp, 
  Sparkles
} from 'lucide-react';
import { exportCleanedCsv, exportCleanedExcel } from '../../services/exportService';
import { ParsedDataset } from '../../types/dataset';

interface DataPreviewStatsBarProps {
  dataset: ParsedDataset;
  initialScore: number;
  currentScore: number;
  transformationsCount: number;
  onReset: () => void;
  onLoadData: () => void;
  isLoaded: boolean;
}

export const DataPreviewStatsBar: React.FC<DataPreviewStatsBarProps> = ({
  dataset,
  initialScore,
  currentScore,
  transformationsCount,
  onReset,
  onLoadData,
  isLoaded,
}) => {
  const scoreDiff = currentScore - initialScore;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Quality Score Comparison & Counts */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {currentScore}
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Quality Score:</span>
                <span className="text-slate-400 line-through">{initialScore}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="font-extrabold text-blue-700 dark:text-blue-300">{currentScore}/100</span>
              </div>
              {scoreDiff > 0 ? (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +{scoreDiff} pts improved after transformations
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  {transformationsCount > 0 ? `${transformationsCount} transformation(s) applied` : 'Original baseline data'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-400 uppercase text-[10px] block font-medium">Rows</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {dataset.meta.rowCount.toLocaleString()}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="text-slate-400 uppercase text-[10px] block font-medium">Columns</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {dataset.rawHeaders.length}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Export & Load Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {transformationsCount > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Reset dataset back to original uploaded state?')) {
                  onReset();
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center"
              title="Reset to raw data"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Data
            </button>
          )}

          <button
            onClick={() => exportCleanedCsv(dataset)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center"
            title="Download cleaned CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
            Export CSV
          </button>

          <button
            onClick={() => exportCleanedExcel(dataset)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center"
            title="Download cleaned Excel workbook"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            Export Excel
          </button>

          <button
            onClick={onLoadData}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all flex items-center group"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            {isLoaded ? 'Update Dashboard Dataset' : 'Load Data & Build Dashboard'}
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
