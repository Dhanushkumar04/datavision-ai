import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';
import { DataQualityScoreGauge } from '../components/data-quality/DataQualityScoreGauge';
import { QualityIssueCard } from '../components/data-quality/QualityIssueCard';
import { IssueSeverity } from '../types/quality';

export const DataQualityPage: React.FC = () => {
  const { 
    dataset, 
    qualityAudit, 
    applyIssueTransformation, 
    setCurrentStep, 
    setActiveNav 
  } = useDatasetContext();

  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all');

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
          Upload a dataset first to assess its data quality, detect missing values, and review recommendations.
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

  if (!qualityAudit) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Auditing Data Quality...
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Checking for duplicates, missing values, outliers, formatting errors, and inconsistent capitalization.
        </p>
      </div>
    );
  }

  const filteredIssues = qualityAudit.issues.filter(issue => {
    if (severityFilter === 'all') return true;
    return issue.severity === severityFilter;
  });

  const handleProceedToTransform = () => {
    setCurrentStep('recommendations');
    setActiveNav('transform');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header & Navigation Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STEP 3 • DATA QUALITY ASSESSMENT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Data Quality Audit & Diagnostics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent rule-based scoring of missing records, duplicates, format inconsistencies, and statistical outliers for <span className="font-semibold text-slate-700 dark:text-slate-300">{dataset.meta.name}</span>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleProceedToTransform}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center group"
          >
            Review Recommended Transformations
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Quality Health Score Card & Deductions */}
      <DataQualityScoreGauge audit={qualityAudit} />

      {/* Issues Filter & List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Detected Quality Issues ({qualityAudit.totalIssues})
            </h3>
          </div>

          {/* Severity Filter Chips */}
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                severityFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All ({qualityAudit.totalIssues})
            </button>
            <button
              onClick={() => setSeverityFilter('critical')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                severityFilter === 'critical'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Critical ({qualityAudit.criticalCount})
            </button>
            <button
              onClick={() => setSeverityFilter('warning')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                severityFilter === 'warning'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Warnings ({qualityAudit.warningCount})
            </button>
            <button
              onClick={() => setSeverityFilter('info')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                severityFilter === 'info'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Informational ({qualityAudit.infoCount})
            </button>
          </div>
        </div>

        {/* Issue Cards */}
        {filteredIssues.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">
              No Issues in this Category
            </h4>
            <p className="text-xs text-slate-400">
              Your dataset is healthy according to these rules.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
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
