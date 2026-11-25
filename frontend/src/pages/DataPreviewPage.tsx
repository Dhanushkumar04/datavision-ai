import React from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  CheckCircle2
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';
import { DataPreviewStatsBar } from '../components/data-preview/DataPreviewStatsBar';
import { InteractiveDataTable } from '../components/data-preview/InteractiveDataTable';

export const DataPreviewPage: React.FC = () => {
  const { 
    dataset, 
    qualityAudit, 
    initialQualityScore, 
    transformationHistory, 
    resetToRawDataset, 
    updateCell, 
    loadCleanedData,
    isDataLoaded,
    setCurrentStep, 
    setActiveNav 
  } = useDatasetContext();

  if (!dataset) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          No Dataset to Preview
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload a dataset and review its transformations before validating the cleaned dataset preview.
        </p>
        <button
          onClick={() => {
            setActiveNav('upload');
            setCurrentStep('upload');
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md hover:bg-blue-700 transition-all"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const currentScore = qualityAudit ? qualityAudit.score : initialQualityScore;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header and Step Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STEP 6 & 7 • DATA PREVIEW & LOAD DATASET</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Cleaned Dataset Preview & Validation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect the cleaned single source of truth, edit individual cells if needed, export CSV/Excel, and commit to the dashboard analytics engine.
          </p>
        </div>

        {isDataLoaded && (
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
            Committed to BI Engine
          </div>
        )}
      </div>

      {/* Top Quality Score & Export Actions Bar */}
      <DataPreviewStatsBar
        dataset={dataset}
        initialScore={initialQualityScore}
        currentScore={currentScore}
        transformationsCount={transformationHistory.length}
        onReset={resetToRawDataset}
        onLoadData={loadCleanedData}
        isLoaded={isDataLoaded}
      />

      {/* Nuvo-style Interactive Data Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>Double-click any cell to edit inline. Changes are logged to transformation history.</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {dataset.rawHeaders.length} columns • {dataset.data.length.toLocaleString()} rows
          </span>
        </div>

        <InteractiveDataTable
          data={dataset.data}
          headers={dataset.rawHeaders}
          columnProfiles={undefined}
          onCellEdit={updateCell}
        />
      </div>
    </div>
  );
};
