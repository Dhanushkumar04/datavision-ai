import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Layers, 
  BarChart3, 
  TrendingUp, 
  Layout
} from 'lucide-react';
import { KPISpec, ChartSpec, ChartType, AggregationType, ThemeConfig, SavedDashboardTemplate } from '../../types/dashboard';
import { ParsedDataset, ColumnProfile } from '../../types/dataset';
import { calculateAggregation } from '../../services/kpiGenerator';
import { aggregateByDimension } from '../../services/chartRecommendation';
import { formatCompactNumber, formatNumber } from '../../utils/formatting';
import { exportDashboardJSON } from '../../services/exportService';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: ParsedDataset;
  profiles: Record<string, ColumnProfile>;
  theme: ThemeConfig;
  kpis: KPISpec[];
  charts: ChartSpec[];
  onAddKPI: (kpi: KPISpec) => void;
  onRemoveKPI: (id: string) => void;
  onAddChart: (chart: ChartSpec) => void;
  onRemoveChart: (id: string) => void;
  onLoadTemplate: (template: SavedDashboardTemplate) => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  dataset,
  profiles: _profiles,
  theme,
  kpis,
  charts,
  onAddKPI,
  onRemoveKPI,
  onAddChart,
  onRemoveChart,
  onLoadTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'kpi' | 'chart' | 'manage' | 'templates'>('kpi');

  // KPI Creator State
  const [kpiTitle, setKpiTitle] = useState('');
  const [kpiCol, setKpiCol] = useState(dataset.rawHeaders[0] || '');
  const [kpiAgg, setKpiAgg] = useState<AggregationType>('sum');
  const [kpiFormat, setKpiFormat] = useState<'currency' | 'number' | 'compact' | 'percentage'>('currency');

  // Chart Creator State
  const [chartTitle, setChartTitle] = useState('');
  const [chartSubtitle, setChartSubtitle] = useState('');
  const [chartDim, setChartDim] = useState(dataset.rawHeaders[0] || '');
  const [chartMeasure, setChartMeasure] = useState(dataset.rawHeaders[1] || dataset.rawHeaders[0] || '');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartAgg, setChartAgg] = useState<AggregationType>('sum');

  // Templates State
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<SavedDashboardTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('datavision_saved_templates');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const columnList = dataset.rawHeaders;

  // Real-time KPI Preview
  const previewKPIValue = useMemo(() => {
    if (!kpiCol) return 0;
    return calculateAggregation(dataset.data, kpiCol, kpiAgg);
  }, [dataset, kpiCol, kpiAgg]);

  const formattedPreviewValue = useMemo(() => {
    if (kpiFormat === 'currency') return `$${formatCompactNumber(previewKPIValue)}`;
    if (kpiFormat === 'percentage') return `${previewKPIValue.toFixed(1)}%`;
    if (kpiFormat === 'compact') return formatCompactNumber(previewKPIValue);
    return formatNumber(previewKPIValue);
  }, [previewKPIValue, kpiFormat]);

  // Handle Add KPI
  const handleCreateKPI = () => {
    const title = kpiTitle.trim() || `${kpiAgg.toUpperCase()} of ${kpiCol}`;
    const newKpi: KPISpec = {
      id: `custom-kpi-${Date.now()}`,
      title,
      column: kpiCol,
      aggregation: kpiAgg,
      format: kpiFormat,
      calculatedValue: previewKPIValue,
      formattedValue: formattedPreviewValue,
      subtitle: `Custom calculation across ${dataset.data.length.toLocaleString()} records`,
      sparkline: [
        previewKPIValue * 0.85,
        previewKPIValue * 0.9,
        previewKPIValue * 0.95,
        previewKPIValue
      ],
      changePercentage: 6.5,
    };
    onAddKPI(newKpi);
    setKpiTitle('');
    setActiveTab('manage');
  };

  // Handle Add Chart
  const handleCreateChart = () => {
    const dataPoints = aggregateByDimension(dataset.data, chartDim, chartMeasure, chartAgg, 7);
    const title = chartTitle.trim() || `${chartMeasure} by ${chartDim}`;
    const newChart: ChartSpec = {
      id: `custom-chart-${Date.now()}`,
      title,
      subtitle: chartSubtitle.trim() || `Custom ${chartAgg.toUpperCase()} distribution`,
      type: chartType,
      dimensionColumn: chartDim,
      measureColumn: chartMeasure,
      aggregation: chartAgg,
      gridSpan: 'half',
      data: dataPoints,
    };
    onAddChart(newChart);
    setChartTitle('');
    setChartSubtitle('');
    setActiveTab('manage');
  };

  // Save template to localStorage
  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const newTemplate: SavedDashboardTemplate = {
      id: `template-${Date.now()}`,
      name: templateName.trim(),
      savedAt: new Date().toLocaleDateString(),
      themeId: theme.id,
      kpis,
      charts,
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('datavision_saved_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setTemplateName('');
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    try {
      localStorage.setItem('datavision_saved_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-4xl max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${theme.cardClass} ${theme.borderClass}`}>
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${theme.textPrimaryClass}`}>
                Dashboard Studio & Layout Customizer
              </h2>
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Build custom KPI cards, design new visualizations, and manage dashboard layouts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('kpi')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kpi'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Create Custom KPI
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chart'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Create Custom Chart
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Manage Visuals ({kpis.length + charts.length})
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            Save & Load Templates ({savedTemplates.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* TAB 1: CREATE CUSTOM KPI */}
          {activeTab === 'kpi' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    KPI Card Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Total Gross Margin, Average Order Value"
                    value={kpiTitle}
                    onChange={(e) => setKpiTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Target Column
                  </label>
                  <select
                    value={kpiCol}
                    onChange={(e) => setKpiCol(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    {columnList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Aggregation Function
                  </label>
                  <select
                    value={kpiAgg}
                    onChange={(e) => setKpiAgg(e.target.value as AggregationType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    <option value="sum">SUM (Total)</option>
                    <option value="avg">AVG (Mean Average)</option>
                    <option value="count">COUNT (Total Rows)</option>
                    <option value="count_distinct">COUNT DISTINCT (Unique Values)</option>
                    <option value="min">MIN (Lowest Value)</option>
                    <option value="max">MAX (Highest Value)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Number Format
                  </label>
                  <select
                    value={kpiFormat}
                    onChange={(e) => setKpiFormat(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    <option value="currency">Currency ($1.25M)</option>
                    <option value="compact">Compact Number (1.25M)</option>
                    <option value="number">Standard Number (1,250,000)</option>
                    <option value="percentage">Percentage (25.5%)</option>
                  </select>
                </div>
              </div>

              {/* Real-Time Live Preview */}
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 font-mono">
                  Live Preview on Dataset Records:
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {kpiTitle.trim() || `${kpiAgg.toUpperCase()} of ${kpiCol}`}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {kpiAgg.toUpperCase()} on column "{kpiCol}"
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-cyan-400">
                    {formattedPreviewValue}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateKPI}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add KPI to Dashboard
              </button>
            </div>
          )}

          {/* TAB 2: CREATE CUSTOM CHART */}
          {activeTab === 'chart' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Chart Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sales by Territory, Units by Month"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Visualization Type
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as ChartType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    <option value="bar">Vertical Bar Chart</option>
                    <option value="horizontal_bar">Ranking Leaderboard</option>
                    <option value="area">Area Trend Chart</option>
                    <option value="line">Line Curve Chart</option>
                    <option value="donut">Radial Donut Chart</option>
                    <option value="scatter">Correlation Scatter Plot</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Dimension Column (Group By)
                  </label>
                  <select
                    value={chartDim}
                    onChange={(e) => setChartDim(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    {columnList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Measure Column (Metric)
                  </label>
                  <select
                    value={chartMeasure}
                    onChange={(e) => setChartMeasure(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    {columnList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Aggregation
                  </label>
                  <select
                    value={chartAgg}
                    onChange={(e) => setChartAgg(e.target.value as AggregationType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    <option value="sum">SUM (Total of measure)</option>
                    <option value="avg">AVG (Average of measure)</option>
                    <option value="count">COUNT (Number of rows)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateChart}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Chart to Dashboard
              </button>
            </div>
          )}

          {/* TAB 3: MANAGE VISUALS */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              {/* KPIs Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active KPI Cards ({kpis.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {kpis.map((k) => (
                    <div 
                      key={k.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{k.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {k.aggregation.toUpperCase()}({k.column}) • {k.formattedValue}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveKPI(k.id)}
                        disabled={kpis.length <= 2}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                        title="Remove KPI"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts Section */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Visualizations ({charts.length})
                </h3>
                <div className="space-y-2">
                  {charts.map((c) => (
                    <div 
                      key={c.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span>{c.title}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 uppercase">
                            {c.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Dim: {c.dimensionColumn} • Measure: {c.measureColumn} ({c.data.length} points)
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveChart(c.id)}
                        disabled={charts.length <= 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                        title="Remove Chart"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEMPLATES & LOCAL PERSISTENCE */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              {/* Save Current Layout */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Save Current Layout Template
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Template name (e.g. Q4 Executive Board View)..."
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!templateName.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </div>

              {/* Saved Templates List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Saved Dashboard Templates ({savedTemplates.length})
                </h3>

                {savedTemplates.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-mono rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                    No custom templates saved yet. Save your customized layout above.
                  </div>
                ) : (
                  savedTemplates.map((t) => (
                    <div 
                      key={t.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{t.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Saved on {t.savedAt} • {t.kpis.length} KPIs • {t.charts.length} Charts
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onLoadTemplate(t)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Apply Layout
                        </button>
                        <button
                          onClick={() => exportDashboardJSON(t)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                          title="Export Template as JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(t.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
