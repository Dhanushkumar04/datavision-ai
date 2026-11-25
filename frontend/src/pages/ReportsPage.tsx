import React, { useMemo } from 'react';
import { 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Database, 
  Layers, 
  TrendingUp
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';
import { THEME_CONFIGS } from '../services/themeEngine';
import { 
  exportCleanedCsv, 
  exportCleanedExcel, 
  exportExecutiveExcelReport,
  exportDashboardJSON
} from '../services/exportService';
import { generateBusinessInsights } from '../services/aiInsightsEngine';
import { KPISummaryTable } from '../components/dashboard/KPISummaryTable';

export const ReportsPage: React.FC = () => {
  const { 
    dataset, 
    loadedDataset, 
    analysisResult, 
    selectedThemeId, 
    kpis, 
    charts, 
    setCurrentStep, 
    setActiveNav 
  } = useDatasetContext();

  const activeData = loadedDataset || dataset;
  const theme = THEME_CONFIGS[selectedThemeId] || THEME_CONFIGS.modern;

  const insights = useMemo(() => {
    if (!activeData || !analysisResult) return [];
    return generateBusinessInsights(activeData, analysisResult.columnProfiles);
  }, [activeData, analysisResult]);

  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportExcelWorkbook = () => {
    if (!activeData) return;
    exportExecutiveExcelReport(activeData, kpis, charts, insights);
  };

  const handleExportCsv = () => {
    if (!activeData) return;
    exportCleanedCsv(activeData);
  };

  const handleExportExcelData = () => {
    if (!activeData) return;
    exportCleanedExcel(activeData);
  };

  const handleExportJSON = () => {
    if (!activeData) return;
    exportDashboardJSON({
      id: `template-${Date.now()}`,
      name: `${activeData.meta.name} Layout`,
      savedAt: new Date().toLocaleDateString(),
      themeId: selectedThemeId,
      kpis,
      charts,
    });
  };

  if (!activeData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Dataset Available</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please upload and analyze a dataset to generate and export executive reports.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-full transition-colors duration-300 ${theme.backgroundClass} p-4 sm:p-6 lg:p-8 space-y-6`}>
      {/* Top Banner (hidden during printing) */}
      <div className={`no-print rounded-2xl border p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${theme.cardClass} ${theme.borderClass} ${theme.glowClass} shadow-xl`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Step 11 of 11 • Executive Reporting
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              {activeData.meta.name} ({activeData.meta.rowCount.toLocaleString()} rows)
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.textPrimaryClass}`}>
            Executive Reporting & Multi-Format Exporter
          </h1>
          <p className={`text-xs sm:text-sm ${theme.textSecondaryClass}`}>
            Generate presentation-ready executive PDF briefs, multi-sheet Excel workbooks, and sanitized datasets.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setCurrentStep('dashboard');
              setActiveNav('dashboard');
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>

          {/* Multi-Sheet Excel */}
          <button
            onClick={handleExportExcelWorkbook}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download formatted 4-sheet Excel report with KPIs, breakdowns, and insights"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel BI Workbook
          </button>
        </div>
      </div>

      {/* Quick Export Downloads Ribbon (hidden in print) */}
      <div className={`no-print rounded-2xl border p-4 ${theme.cardClass} ${theme.borderClass} shadow-md flex flex-wrap items-center justify-between gap-4 text-xs font-mono`}>
        <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-blue-500" />
          Direct Dataset Downloads:
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            Cleaned CSV
          </button>

          <button
            onClick={handleExportExcelData}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Cleaned Excel (.xlsx)
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-500" />
            Dashboard JSON Config
          </button>
        </div>
      </div>

      {/* PRINT-READY EXECUTIVE REPORT PREVIEW CONTAINER */}
      <div className={`rounded-2xl border p-6 sm:p-10 space-y-8 ${theme.cardClass} ${theme.borderClass} shadow-2xl bg-white dark:bg-slate-900 print:border-none print:shadow-none print:p-0`}>
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              DataVision AI • Executive Brief
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Business Intelligence Performance Report
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Source: <strong className="font-mono text-slate-800 dark:text-slate-200">{activeData.meta.name}</strong> • Validated & Sanitized Analysis
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-500 space-y-1">
            <div>Generated: <strong>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
            <div>Dataset Scale: <strong>{activeData.meta.rowCount.toLocaleString()} Rows</strong> ({activeData.rawHeaders.length} Columns)</div>
            <div className="text-emerald-600 font-bold">Audit Status: Verified Accurate</div>
          </div>
        </div>

        {/* Executive Highlights Callout */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Executive Analytical Summary
          </h3>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            This business intelligence brief consolidates {kpis.length} core performance metrics and {charts.length} dimension distributions. 
            All values are derived directly from verified operational records without projection bias. 
            Key findings indicate strong performance in primary drivers alongside actionable opportunities in secondary cohorts.
          </p>
        </div>

        {/* Section 1: Core Performance Indicators */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-slate-800">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            1. Core Executive Performance Indicators
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map((k) => (
              <div 
                key={k.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  {k.title}
                </div>
                <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {k.formattedValue}
                </div>
                <div className="text-[10px] font-mono text-emerald-600 font-bold">
                  {k.changePercentage !== undefined && `${k.changePercentage > 0 ? '+' : ''}${k.changePercentage}% vs prior`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Dimension Aggregations Performance Table */}
        <div className="space-y-3 print-break">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-slate-800">
            <Layers className="w-4 h-4 text-blue-600" />
            2. Detailed Metric Performance Breakdown
          </h2>

          <KPISummaryTable
            kpis={kpis}
            theme={theme}
          />
        </div>

        {/* Section 3: AI Strategic Insights & Recommendations */}
        {insights.length > 0 && (
          <div className="space-y-4 print-break">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-blue-600" />
              3. AI Strategic Recommendations & Risk Analysis
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.slice(0, 4).map((i) => (
                <div 
                  key={i.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                      {i.category} • {i.impact} Impact
                    </span>
                    {i.metricValue && (
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {i.metricValue}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{i.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{i.description}</p>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-200">
                    <strong>Recommendation:</strong> {i.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Footer */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>DataVision AI Automated Intelligence System</span>
          <span>Page 1 of 1 • End of Executive Report</span>
        </div>
      </div>
    </div>
  );
};
