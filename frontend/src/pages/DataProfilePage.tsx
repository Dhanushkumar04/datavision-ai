import React, { useState } from 'react';
import { 
  BarChart3, 
  GitFork, 
  ArrowRight, 
  Loader2, 
  UploadCloud,
  Sparkles
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';
import { DatasetOverviewCards } from '../components/data-profile/DatasetOverviewCards';
import { ColumnSelectorList } from '../components/data-profile/ColumnSelectorList';
import { ColumnDetailView } from '../components/data-profile/ColumnDetailView';
import { RelationshipsView } from '../components/data-profile/RelationshipsView';
import { SemanticType } from '../types/dataset';

export const DataProfilePage: React.FC = () => {
  const { 
    dataset, 
    analysisResult, 
    isAnalyzing, 
    overrideColumnType,
    setCurrentStep, 
    setActiveNav 
  } = useDatasetContext();

  const [activeTab, setActiveTab] = useState<'columns' | 'relationships'>('columns');
  const [selectedColumnName, setSelectedColumnName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<SemanticType | 'all'>('all');

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
          Upload a CSV or Excel dataset to view automated column profiling, data types, and statistical distributions.
        </p>
        <button
          onClick={() => {
            setActiveNav('upload');
            setCurrentStep('upload');
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  if (isAnalyzing || !analysisResult) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Analyzing Dataset Structure...
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inferring semantic roles, computing distributions, percentiles, and detecting cross-column relationships.
        </p>
      </div>
    );
  }

  const { overview, columnProfiles, relationships } = analysisResult;
  const availableColumns = Object.keys(columnProfiles);
  const currentSelectedCol = selectedColumnName && columnProfiles[selectedColumnName]
    ? selectedColumnName
    : availableColumns[0];

  const handleProceedToQuality = () => {
    setCurrentStep('quality');
    setActiveNav('quality');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header & Step Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STEP 2 • AUTOMATIC DATASET PROFILING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Data Profile & Statistics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatic schema classification, statistical distributions, cardinality, and multi-column formulas for <span className="font-semibold text-slate-700 dark:text-slate-300">{dataset.meta.name}</span>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleProceedToQuality}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center group"
          >
            Proceed to Data Quality Assessment
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Dataset Overview Summary Cards */}
      <DatasetOverviewCards
        overview={overview}
        activeTypeFilter={typeFilter}
        onSelectTypeFilter={setTypeFilter}
      />

      {/* View Toggle Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center space-x-4">
        <button
          onClick={() => setActiveTab('columns')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'columns'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Column Statistics ({availableColumns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('relationships')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'relationships'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>Relationships & Derived Formulas ({relationships.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'columns' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column Browser */}
          <div className="lg:col-span-4 h-[650px]">
            <ColumnSelectorList
              columnProfiles={columnProfiles}
              selectedColumn={currentSelectedCol}
              onSelectColumn={setSelectedColumnName}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              typeFilter={typeFilter}
            />
          </div>

          {/* Right Column Detail View */}
          <div className="lg:col-span-8">
            {columnProfiles[currentSelectedCol] ? (
              <ColumnDetailView
                column={columnProfiles[currentSelectedCol]}
                onOverrideType={(newType) => overrideColumnType(currentSelectedCol, newType)}
              />
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Select a column on the left to inspect its detailed statistics.
              </div>
            )}
          </div>
        </div>
      ) : (
        <RelationshipsView relationships={relationships} />
      )}
    </div>
  );
};
