import React, { useMemo } from 'react';
import { 
  Palette, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Zap
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';
import { ThemeSelectorGrid } from '../components/theme/ThemeSelectorGrid';
import { recommendTheme } from '../services/themeEngine';
import { ThemeId } from '../types/dashboard';

export const ThemeSelectionPage: React.FC = () => {
  const { 
    dataset, 
    loadedDataset, 
    analysisResult, 
    selectedThemeId, 
    setSelectedThemeId, 
    generateDashboard,
    setCurrentStep,
    setActiveNav,
  } = useDatasetContext();

  const activeData = loadedDataset || dataset;

  // Run AI theme recommendation based on dataset schema
  const recommendation = useMemo(() => {
    if (!activeData || !analysisResult) {
      return {
        themeId: 'modern' as ThemeId,
        reason: 'Clean modern corporate palette suitable for general tabular datasets.',
        confidence: 0.85,
      };
    }
    return recommendTheme(activeData, analysisResult.columnProfiles);
  }, [activeData, analysisResult]);

  const handleSelectTheme = (themeId: ThemeId) => {
    setSelectedThemeId(themeId);
  };

  const handleGenerateDashboard = () => {
    generateDashboard(selectedThemeId);
  };

  const handleBackToPreview = () => {
    setCurrentStep('preview');
    setActiveNav('preview');
  };

  if (!activeData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 mx-auto">
          <Palette className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Dataset Loaded</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please upload and preview a dataset first before selecting a dashboard theme.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Step 8 of 11 • Visual Design
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 font-mono">
              {activeData.meta.name} ({activeData.meta.rowCount.toLocaleString()} rows)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Palette className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Select Dashboard Theme & Layout
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose a visual design language for your automated business intelligence dashboard. All KPIs and charts adapt to your selection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToPreview}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Preview
          </button>

          <button
            onClick={handleGenerateDashboard}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            Generate Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Theme Selector Grid */}
      <ThemeSelectorGrid
        selectedThemeId={selectedThemeId}
        onSelectTheme={handleSelectTheme}
        recommendedThemeId={recommendation.themeId}
        recommendationReason={recommendation.reason}
      />

      {/* Footer Info Box */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>
            Themes are fully reactive. You can switch between light/dark and change color palettes at any time from within the generated dashboard without losing your analytical state.
          </span>
        </div>

        <button
          onClick={handleGenerateDashboard}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0 shadow-sm transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate Now
        </button>
      </div>
    </div>
  );
};
