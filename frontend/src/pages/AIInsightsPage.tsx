import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowLeft, 
  Database
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';
import { InsightCard } from '../components/ai/InsightCard';
import { AIChatAssistant } from '../components/ai/AIChatAssistant';
import { generateBusinessInsights } from '../services/aiInsightsEngine';
import { THEME_CONFIGS } from '../services/themeEngine';
import { InsightCategory } from '../types/ai';

export const AIInsightsPage: React.FC = () => {
  const { 
    dataset, 
    loadedDataset, 
    analysisResult, 
    selectedThemeId, 
    setCurrentStep, 
    setActiveNav 
  } = useDatasetContext();

  const activeData = loadedDataset || dataset;
  const theme = THEME_CONFIGS[selectedThemeId] || THEME_CONFIGS.modern;

  const [activeCategory, setActiveCategory] = useState<InsightCategory | 'all'>('all');

  // Generate real business insights derived directly from dataset statistics
  const insights = useMemo(() => {
    if (!activeData || !analysisResult) return [];
    return generateBusinessInsights(activeData, analysisResult.columnProfiles);
  }, [activeData, analysisResult]);

  // Filtered insights by category
  const filteredInsights = useMemo(() => {
    if (activeCategory === 'all') return insights;
    return insights.filter(i => i.category === activeCategory);
  }, [insights, activeCategory]);

  const categoryCounts = useMemo(() => {
    return {
      all: insights.length,
      trend: insights.filter(i => i.category === 'trend').length,
      anomaly: insights.filter(i => i.category === 'anomaly').length,
      opportunity: insights.filter(i => i.category === 'opportunity').length,
      risk: insights.filter(i => i.category === 'risk').length,
    };
  }, [insights]);

  if (!activeData || !analysisResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 mx-auto">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dataset Not Loaded</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please upload and analyze a dataset to generate AI business insights and access the copilot.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-full transition-colors duration-300 ${theme.backgroundClass} p-4 sm:p-6 lg:p-8 space-y-6`}>
      {/* Top Banner */}
      <div className={`rounded-2xl border p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${theme.cardClass} ${theme.borderClass} ${theme.glowClass} shadow-xl`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Cognitive Engine
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              {activeData.meta.name} ({activeData.meta.rowCount.toLocaleString()} rows)
            </span>
            <span className="text-xs text-emerald-500 font-semibold font-mono">
              • Deterministic Mathematical Synthesis
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.textPrimaryClass}`}>
            AI Business Insights & Natural Language Copilot
          </h1>
          <p className={`text-xs sm:text-sm ${theme.textSecondaryClass}`}>
            Automated executive intelligence: anomaly detection, Pareto concentration risks, and interactive conversational dataset queries.
          </p>
        </div>

        {/* Back to Dashboard Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCurrentStep('dashboard');
              setActiveNav('dashboard');
            }}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme.isDark 
                ? 'border-slate-700 hover:bg-slate-800 text-slate-200' 
                : 'border-slate-300 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout: Insights Feed on Left (3/5), Copilot Chat on Right (2/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Business Insights */}
        <div className="lg:col-span-7 space-y-5">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>All Insights</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                {categoryCounts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('trend')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'trend'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>Trends</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                {categoryCounts.trend}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('anomaly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'anomaly'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Anomalies</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                {categoryCounts.anomaly}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('opportunity')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'opportunity'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Opportunities</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                {categoryCounts.opportunity}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('risk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'risk'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Risks</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                {categoryCounts.risk}
              </span>
            </button>
          </div>

          {/* Insights Grid */}
          <div className="space-y-4">
            {filteredInsights.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-mono rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                No insights found matching category "{activeCategory}".
              </div>
            ) : (
              filteredInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  theme={theme}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Interactive Copilot Chat */}
        <div className="lg:col-span-5 sticky top-6">
          <AIChatAssistant
            dataset={activeData}
            profiles={analysisResult.columnProfiles}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
};
