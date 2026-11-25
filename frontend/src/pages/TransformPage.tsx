import React, { useState } from 'react';
import { 
  Wand2, 
  ArrowRight, 
  RotateCcw, 
  RotateCw,
  CheckCircle2, 
  Sparkles, 
  Layers, 
  UploadCloud
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';
import { QualityIssueCard } from '../components/data-quality/QualityIssueCard';
import { TransformationDiffPreview } from '../components/transformation/TransformationDiffPreview';
import { TransformationHistoryLog } from '../components/transformation/TransformationHistoryLog';

export const TransformPage: React.FC = () => {
  const { 
    dataset, 
    qualityAudit, 
    transformationHistory, 
    canUndo, 
    canRedo,
    applyIssueTransformation, 
    applyAllRecommendedTransformations, 
    undoTransformation, 
    redoTransformation,
    resetToRawDataset,
    setCurrentStep, 
    setActiveNav 
  } = useDatasetContext();

  const [isApplyingAll, setIsApplyingAll] = useState(false);

  if (!dataset) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          No Dataset Uploaded
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload a dataset first to execute intelligent data transformations.
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

  const pendingIssues = qualityAudit ? qualityAudit.issues.filter(i => i.selectedAction !== 'leave_unchanged') : [];
  const latestRecord = transformationHistory[transformationHistory.length - 1];

  const handleApplyAll = () => {
    setIsApplyingAll(true);
    setTimeout(() => {
      applyAllRecommendedTransformations();
      setIsApplyingAll(false);
    }, 150);
  };

  const handleProceedToPreview = () => {
    setCurrentStep('preview');
    setActiveNav('preview');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STEP 4 & 5 • DATA TRANSFORMATION & CLEANING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Intelligent Data Transformations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review recommendations, choose transformation parameters, and standardize dataset values safely with reversible operations.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canUndo && (
            <button
              onClick={undoTransformation}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center"
              title="Undo last transformation"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Undo
            </button>
          )}

          {canRedo && (
            <button
              onClick={redoTransformation}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center"
              title="Redo transformation"
            >
              <RotateCw className="w-3.5 h-3.5 mr-1.5" />
              Redo
            </button>
          )}

          {pendingIssues.length > 0 && (
            <button
              onClick={handleApplyAll}
              disabled={isApplyingAll}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center"
            >
              <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              Transform All Recommended Issues ({pendingIssues.length})
            </button>
          )}

          <button
            onClick={handleProceedToPreview}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center group"
          >
            Preview Cleaned Dataset
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Recommended Announcement Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-sky-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-start space-x-3 text-slate-800 dark:text-slate-200 text-xs">
        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-bold text-sm block mb-0.5 text-blue-950 dark:text-blue-200">
            "We analyzed your dataset and identified some improvements that can make your dashboard more accurate."
          </span>
          <p className="text-slate-600 dark:text-slate-400">
            Transformations preserve your original uploaded data and are 100% reversible. Apply recommendations individually below, execute them in batch, or proceed directly to preview.
          </p>
        </div>
      </div>

      {/* Live Before & After Diff Preview */}
      <TransformationDiffPreview latestRecord={latestRecord} />

      {/* Transformation Audit History Log */}
      <TransformationHistoryLog
        history={transformationHistory}
        onUndo={undoTransformation}
        canUndo={canUndo}
        onReset={resetToRawDataset}
      />

      {/* Transformation Recipe Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
          <Layers className="w-4 h-4 mr-2 text-blue-600" />
          Recommended Transformation Recipes ({qualityAudit?.issues.length || 0})
        </h3>

        {(!qualityAudit || qualityAudit.issues.length === 0) ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">
              Dataset is Clean & Ready
            </h4>
            <p className="text-xs text-slate-400">
              No further transformations required. Click "Preview Cleaned Dataset" to advance.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {qualityAudit.issues.map((issue) => (
              <QualityIssueCard
                key={issue.id}
                issue={issue}
                onApplyAction={(issueId, action, params) => {
                  applyIssueTransformation(issueId, action, params);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
