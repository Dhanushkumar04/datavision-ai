import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Filter, 
  Palette, 
  ShieldCheck, 
  Cpu, 
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';

export const LandingPage: React.FC = () => {
  const { setActiveNav, setCurrentStep } = useDatasetContext();

  const handleStartUpload = () => {
    setActiveNav('upload');
    setCurrentStep('upload');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
          Autonomous Business Intelligence Engine
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Turn Your Data Into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Intelligent Dashboards
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Upload your dataset. Let AI analyze, clean, transform, and automatically build beautiful interactive dashboards.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleStartUpload}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center group"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Dataset Now
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleStartUpload}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center shadow-sm"
          >
            Explore Preloaded Samples
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
            100% Dynamic Schema
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Zero hardcoded KPIs. Automatically classifies 10 semantic column roles across Sales, HR, Finance, Healthcare, and Operations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
            Data Quality Audit
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Detects missing values, duplicates, outliers, casing anomalies, and date errors with transparent 0–100 quality scoring.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/70 border border-sky-100 dark:border-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
            Centralized Cross-Filtering
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Click any donut segment or bar category to instantly cascade updates across all KPIs, trends, and charts without reloading.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <Palette className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
            7 Executive BI Themes
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Switch between Modern Professional, Dark Analytics, Power BI Inspired, Tableau Inspired, and Executive Business styles.
          </p>
        </div>
      </div>

      {/* Guided 11-Step Pipeline Preview */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Guided End-to-End Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 mb-3">
            From raw spreadsheet to interactive BI in 5 steps
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Unlike static reporting tools, DataVision AI combines intelligent data profiling, transparent data transformation, and adaptive dashboard generation into one seamless flow.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Support for CSV, XLS, and multi-sheet XLSX</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full undo/redo audit history for transformations</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Zero data fabrication — all numbers verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Export cleaned data and PDF reports in 1 click</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
