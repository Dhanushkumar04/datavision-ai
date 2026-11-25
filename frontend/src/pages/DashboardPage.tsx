import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Palette, 
  RotateCcw, 
  Database,
  ArrowRight,
  SlidersHorizontal,
  Table,
  Sliders,
  FileSpreadsheet
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';
import { KPICard } from '../components/dashboard/KPICard';
import { DynamicChartCard } from '../components/dashboard/DynamicChartCard';
import { SlicerPanel } from '../components/dashboard/SlicerPanel';
import { KPISummaryTable } from '../components/dashboard/KPISummaryTable';
import { ActiveFilterBar } from '../components/dashboard/ActiveFilterBar';
import { DrillDownModal } from '../components/dashboard/DrillDownModal';
import { CustomizerModal } from '../components/dashboard/CustomizerModal';
import { THEME_CONFIGS } from '../services/themeEngine';
import { ThemeId, ChartSpec, KPISpec, SavedDashboardTemplate } from '../types/dashboard';
import { 
  applyGlobalFilters, 
  extractSlicerDimensions, 
  DateFilterConfig 
} from '../services/crossFilterService';
import { generateKPIs, calculateAggregation } from '../services/kpiGenerator';
import { recommendCharts, aggregateByDimension } from '../services/chartRecommendation';
import { formatCompactNumber, formatNumber } from '../utils/formatting';

export const DashboardPage: React.FC = () => {
  const { 
    dataset, 
    loadedDataset, 
    analysisResult,
    selectedThemeId, 
    setSelectedThemeId, 
    updateChartType, 
    generateDashboard,
    setCurrentStep,
    setActiveNav,
    unlockStep,
  } = useDatasetContext();

  const activeData = loadedDataset || dataset;
  const theme = THEME_CONFIGS[selectedThemeId] || THEME_CONFIGS.modern;

  // Phase 6: Global Interactivity & Cross-Filtering State
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [dateFilter, setDateFilter] = useState<DateFilterConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSlicers, setShowSlicers] = useState<boolean>(true);

  // Phase 8: Customization & Templates State
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customKPIs, setCustomKPIs] = useState<KPISpec[]>([]);
  const [customCharts, setCustomCharts] = useState<ChartSpec[]>([]);
  const [removedKPIIds, setRemovedKPIIds] = useState<Set<string>>(new Set());
  const [removedChartIds, setRemovedChartIds] = useState<Set<string>>(new Set());

  // Drill-down modal state
  const [drillDownState, setDrillDownState] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    rows: Record<string, any>[];
    activeFilterContext?: string;
  }>({
    isOpen: false,
    title: '',
    rows: [],
  });

  // Extract categorical columns & date columns for slicers
  const { dimensions: slicerDimensions, dateColumns } = useMemo(() => {
    if (!activeData || !analysisResult) return { dimensions: [], dateColumns: [] };
    return extractSlicerDimensions(activeData, analysisResult.columnProfiles);
  }, [activeData, analysisResult]);

  // Compute filtered subset of rows across ALL active filters
  const filteredRows = useMemo(() => {
    if (!activeData) return [];
    return applyGlobalFilters(activeData.data, activeFilters, dateFilter, searchQuery);
  }, [activeData, activeFilters, dateFilter, searchQuery]);

  // Reactively calculate default KPIs from the filtered rows subset!
  const reactiveKPIs = useMemo(() => {
    if (!activeData || !analysisResult) return [];
    return generateKPIs(activeData, analysisResult.columnProfiles, filteredRows);
  }, [activeData, analysisResult, filteredRows]);

  // Reactively calculate custom KPIs from the filtered rows subset!
  const reactiveCustomKPIs = useMemo(() => {
    return customKPIs.map(kpi => {
      const val = calculateAggregation(filteredRows, kpi.column, kpi.aggregation);
      let formatted = formatNumber(val);
      if (kpi.format === 'currency') formatted = `$${formatCompactNumber(val)}`;
      else if (kpi.format === 'percentage') formatted = `${val.toFixed(1)}%`;
      else if (kpi.format === 'compact') formatted = formatCompactNumber(val);

      return {
        ...kpi,
        value: val,
        formattedValue: formatted,
      };
    });
  }, [customKPIs, filteredRows]);

  // Combined KPIs displayed on the dashboard
  const displayedKPIs = useMemo(() => {
    const base = reactiveKPIs.filter(k => !removedKPIIds.has(k.id));
    return [...base, ...reactiveCustomKPIs];
  }, [reactiveKPIs, removedKPIIds, reactiveCustomKPIs]);

  // Reactively calculate default Charts from the filtered rows subset!
  const reactiveCharts = useMemo(() => {
    if (!activeData || !analysisResult) return [];
    return recommendCharts(activeData, analysisResult.columnProfiles, filteredRows);
  }, [activeData, analysisResult, filteredRows]);

  // Reactively calculate custom Charts from the filtered rows subset!
  const reactiveCustomCharts = useMemo(() => {
    return customCharts.map(c => {
      const aggData = aggregateByDimension(filteredRows, c.dimensionColumn, c.measureColumn, c.aggregation, 10);
      return {
        ...c,
        data: aggData,
      };
    });
  }, [customCharts, filteredRows]);

  // Combined Charts displayed on the dashboard
  const displayedCharts = useMemo(() => {
    const base = reactiveCharts.filter(c => !removedChartIds.has(c.id));
    return [...base, ...reactiveCustomCharts];
  }, [reactiveCharts, removedChartIds, reactiveCustomCharts]);

  // Phase 8 Customizer Handlers
  const handleAddKPI = (kpi: KPISpec) => {
    setCustomKPIs(prev => [...prev, kpi]);
  };

  const handleRemoveKPI = (id: string) => {
    setCustomKPIs(prev => prev.filter(k => k.id !== id));
    setRemovedKPIIds(prev => new Set([...prev, id]));
  };

  const handleAddChart = (chart: ChartSpec) => {
    setCustomCharts(prev => [...prev, chart]);
  };

  const handleRemoveChart = (id: string) => {
    setCustomCharts(prev => prev.filter(c => c.id !== id));
    setRemovedChartIds(prev => new Set([...prev, id]));
  };

  const handleLoadTemplate = (template: SavedDashboardTemplate) => {
    if (template.themeId) {
      handleSwitchTheme(template.themeId);
    }
    setCustomKPIs(template.kpis || []);
    setCustomCharts(template.charts || []);
    setRemovedKPIIds(new Set());
    setRemovedChartIds(new Set());
  };

  // Slicer & Filter Handlers
  const handleFilterChange = (column: string, value: string) => {
    setActiveFilters(prev => {
      if (value === 'all') {
        const next = { ...prev };
        delete next[column];
        return next;
      }
      return { ...prev, [column]: value };
    });
    unlockStep('explore');
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setDateFilter(null);
    setSearchQuery('');
  };

  const handleRemoveSingleFilter = (column: string) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      delete next[column];
      return next;
    });
  };

  // Cross-chart interactive slice click handler
  const handleSliceClick = (dimensionCol: string, label: string) => {
    if (activeFilters[dimensionCol] === label) {
      handleFilterChange(dimensionCol, 'all');
    } else {
      handleFilterChange(dimensionCol, label);
    }
  };

  const handleSwitchTheme = (themeId: ThemeId) => {
    setSelectedThemeId(themeId);
    generateDashboard(themeId);
  };

  // Drill down handlers
  const handleOpenGlobalDrillDown = () => {
    if (!activeData) return;
    const filterContext = Object.entries(activeFilters).map(([k, v]) => `${k}="${v}"`).join(' & ');
    setDrillDownState({
      isOpen: true,
      title: 'Current Filtered Dataset Drill-Down',
      subtitle: `Viewing all ${filteredRows.length.toLocaleString()} matching records from active filters`,
      rows: filteredRows,
      activeFilterContext: filterContext || 'Full Dataset (Unfiltered)',
    });
  };

  const handleOpenChartDrillDown = (chart: ChartSpec) => {
    if (!activeData) return;
    setDrillDownState({
      isOpen: true,
      title: `Drill-Down: ${chart.title}`,
      subtitle: `Inspecting records powering ${chart.dimensionColumn} and ${chart.measureColumn}`,
      rows: filteredRows,
      activeFilterContext: `Dimension: ${chart.dimensionColumn} • Measure: ${chart.measureColumn}`,
    });
  };

  if (!activeData || reactiveKPIs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Not Generated</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please complete data preview and select a theme to generate your dynamic BI dashboard.
        </p>
        <button
          onClick={() => {
            setCurrentStep('theme');
            setActiveNav('dashboard');
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Go to Theme Selection
        </button>
      </div>
    );
  }

  // Split displayed charts into distinct primary layout roles without duplication
  const usedChartIds = new Set<string>();

  const trendChart = displayedCharts.find(c => (c.type === 'area' || c.type === 'line') && !usedChartIds.has(c.id));
  if (trendChart) usedChartIds.add(trendChart.id);

  const donutChart = displayedCharts.find(c => c.type === 'donut' && !usedChartIds.has(c.id));
  if (donutChart) usedChartIds.add(donutChart.id);

  const rankChart = displayedCharts.find(c => c.type === 'horizontal_bar' && !usedChartIds.has(c.id));
  if (rankChart) usedChartIds.add(rankChart.id);

  const barChart = displayedCharts.find(c => c.type === 'bar' && !usedChartIds.has(c.id));
  if (barChart) usedChartIds.add(barChart.id);

  const scatterChart = displayedCharts.find(c => c.type === 'scatter' && !usedChartIds.has(c.id));
  if (scatterChart) usedChartIds.add(scatterChart.id);

  const remainingUnused1 = displayedCharts.filter(c => !usedChartIds.has(c.id));
  const finalTrendChart = trendChart || remainingUnused1[0];
  if (finalTrendChart) usedChartIds.add(finalTrendChart.id);

  const remainingUnused2 = displayedCharts.filter(c => !usedChartIds.has(c.id));
  const finalDonutChart = donutChart || remainingUnused2[0];
  if (finalDonutChart) usedChartIds.add(finalDonutChart.id);

  const remainingUnused3 = displayedCharts.filter(c => !usedChartIds.has(c.id));
  const finalRankChart = rankChart || remainingUnused3[0];
  if (finalRankChart) usedChartIds.add(finalRankChart.id);

  const remainingUnused4 = displayedCharts.filter(c => !usedChartIds.has(c.id));
  const finalBarChart = barChart || remainingUnused4[0];
  if (finalBarChart) usedChartIds.add(finalBarChart.id);

  const remainingUnused5 = displayedCharts.filter(c => !usedChartIds.has(c.id));
  const finalScatterChart = scatterChart || remainingUnused5[0];
  if (finalScatterChart) usedChartIds.add(finalScatterChart.id);

  // Identify any additional or custom charts that aren't mapped to the 5 primary slots
  const additionalCharts = displayedCharts.filter(c => !usedChartIds.has(c.id));

  return (
    <div className={`min-h-full transition-colors duration-300 ${theme.backgroundClass} p-4 sm:p-6 lg:p-8 space-y-6`}>
      {/* Top BI Header */}
      <div className={`rounded-2xl border p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${theme.cardClass} ${theme.borderClass} ${theme.glowClass} shadow-xl`}>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono uppercase tracking-wider shadow-sm">
              {theme.name}
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              {activeData.meta.name} ({activeData.meta.rowCount.toLocaleString()} total rows)
            </span>
            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1 font-mono">
              • Global Interactivity Active
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.textPrimaryClass}`}>
            Automated Business Intelligence Dashboard
          </h1>
          <p className={`text-xs sm:text-sm ${theme.textSecondaryClass}`}>
            Interactive cross-filtering: Click any chart slice, bar, or rank item to dynamically recalculate KPIs and slice visualizations.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Phase 8: Customize Visuals & Layout Button */}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Create custom KPIs, build custom charts, and manage saved layout templates"
          >
            <Sliders className="w-3.5 h-3.5" />
            Customize Visuals
          </button>

          {/* Toggle Slicer Sidebar */}
          <button
            onClick={() => setShowSlicers(!showSlicers)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showSlicers 
                ? 'bg-blue-600/15 border-blue-500/40 text-blue-500' 
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showSlicers ? 'Hide Slicers' : 'Show Slicers'}
          </button>

          {/* Quick Theme Switcher Pill */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <Palette className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
            <select
              value={selectedThemeId}
              onChange={(e) => handleSwitchTheme(e.target.value as ThemeId)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 pr-2 py-0.5 focus:outline-none cursor-pointer"
            >
              {Object.values(THEME_CONFIGS).map((t) => (
                <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          {/* Drill Down All Data */}
          <button
            onClick={handleOpenGlobalDrillDown}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Inspect all current filtered rows in a table"
          >
            <Table className="w-3.5 h-3.5 text-blue-500" />
            Inspect Rows
          </button>

          {/* Refresh Dashboard */}
          <button
            onClick={() => generateDashboard(selectedThemeId)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Recalculate metrics and re-render visual layouts"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </button>

          {/* Phase 8: Export Reports */}
          <button
            onClick={() => {
              unlockStep('export');
              setCurrentStep('export');
              setActiveNav('reports');
            }}
            className="px-3.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Executive Reports & Multi-Format Exporter"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Reports
          </button>

          {/* Proceed to AI Insights (Phase 7) */}
          <button
            onClick={() => {
              setCurrentStep('explore');
              setActiveNav('insights');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Insights
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Cross-Filter Bar */}
      <ActiveFilterBar
        theme={theme}
        activeFilters={activeFilters}
        dateFilter={dateFilter}
        searchQuery={searchQuery}
        totalRows={activeData.data.length}
        filteredRows={filteredRows.length}
        onRemoveFilter={handleRemoveSingleFilter}
        onClearDateFilter={() => setDateFilter(null)}
        onClearSearch={() => setSearchQuery('')}
        onClearAll={handleClearFilters}
        onOpenDrillDown={handleOpenGlobalDrillDown}
      />

      {/* KPI Cards Grid (Recalculates dynamically with active filters) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textSecondaryClass} flex items-center gap-1.5`}>
              Executive Performance Metrics ({displayedKPIs.length} Cards)
            </h2>
            {filteredRows.length < activeData.data.length && (
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">
                Filtered Subset ({filteredRows.length} rows)
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Dynamically aggregated in real time
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {displayedKPIs.map((kpi) => (
            <KPICard 
              key={kpi.id} 
              kpi={kpi} 
              theme={theme} 
            />
          ))}
        </div>
      </div>

      {/* Main Analytical Section with Slicers & Chart Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Slicer Panel */}
        {showSlicers && (
          <SlicerPanel
            theme={theme}
            categoricalColumns={slicerDimensions.map(d => ({ name: d.column, values: d.values.map(v => v.value) }))}
            dateColumns={dateColumns}
            activeFilters={activeFilters}
            dateFilter={dateFilter}
            searchQuery={searchQuery}
            onFilterChange={handleFilterChange}
            onDateFilterChange={setDateFilter}
            onSearchChange={setSearchQuery}
            onClearFilters={handleClearFilters}
            totalRows={activeData.data.length}
            filteredRows={filteredRows.length}
          />
        )}

        {/* Charts & Table Canvas */}
        <div className="flex-1 w-full space-y-6">
          {/* Row 1: Time-Series Area Trend (2/3) + Donut Breakdown (1/3) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {finalTrendChart && (
              <div className="xl:col-span-2">
                <DynamicChartCard
                  chart={finalTrendChart}
                  theme={theme}
                  onTypeChange={updateChartType}
                  onSliceClick={handleSliceClick}
                  onDrillDown={handleOpenChartDrillDown}
                  selectedLabel={activeFilters[finalTrendChart.dimensionColumn]}
                />
              </div>
            )}

            {finalDonutChart && (
              <div className="xl:col-span-1">
                <DynamicChartCard
                  chart={finalDonutChart}
                  theme={theme}
                  onTypeChange={updateChartType}
                  onSliceClick={handleSliceClick}
                  onDrillDown={handleOpenChartDrillDown}
                  selectedLabel={activeFilters[finalDonutChart.dimensionColumn]}
                />
              </div>
            )}
          </div>

          {/* Row 2: Top Entity Rankings (1/2) + Dimension Comparison Bar (1/2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {finalRankChart && (
              <DynamicChartCard
                chart={finalRankChart}
                theme={theme}
                onTypeChange={updateChartType}
                onSliceClick={handleSliceClick}
                onDrillDown={handleOpenChartDrillDown}
                selectedLabel={activeFilters[finalRankChart.dimensionColumn]}
              />
            )}

            {finalBarChart && (
              <DynamicChartCard
                chart={finalBarChart}
                theme={theme}
                onTypeChange={updateChartType}
                onSliceClick={handleSliceClick}
                onDrillDown={handleOpenChartDrillDown}
                selectedLabel={activeFilters[finalBarChart.dimensionColumn]}
              />
            )}
          </div>

          {/* Row 3: Scatter Correlation (1/2) + Executive KPI Summary Table (1/2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {finalScatterChart && (
              <DynamicChartCard
                chart={finalScatterChart}
                theme={theme}
                onTypeChange={updateChartType}
                onSliceClick={handleSliceClick}
                onDrillDown={handleOpenChartDrillDown}
                selectedLabel={activeFilters[finalScatterChart.dimensionColumn]}
              />
            )}

            <KPISummaryTable
              kpis={displayedKPIs}
              theme={theme}
            />
          </div>

          {/* Additional & Custom Visualizations Grid */}
          {additionalCharts.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textSecondaryClass} flex items-center gap-2`}>
                  Custom & Additional Visualizations ({additionalCharts.length})
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Active in live cross-filtering
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {additionalCharts.map((chart) => (
                  <DynamicChartCard
                    key={chart.id}
                    chart={chart}
                    theme={theme}
                    onTypeChange={updateChartType}
                    onSliceClick={handleSliceClick}
                    onDrillDown={handleOpenChartDrillDown}
                    selectedLabel={activeFilters[chart.dimensionColumn]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drill-Down Modal */}
      <DrillDownModal
        isOpen={drillDownState.isOpen}
        onClose={() => setDrillDownState(prev => ({ ...prev, isOpen: false }))}
        title={drillDownState.title}
        subtitle={drillDownState.subtitle}
        rows={drillDownState.rows}
        headers={activeData.rawHeaders}
        theme={theme}
        activeFilterContext={drillDownState.activeFilterContext}
      />

      {/* Phase 8: Customizer & Template Management Modal */}
      <CustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        dataset={activeData}
        profiles={analysisResult?.columnProfiles || {}}
        theme={theme}
        kpis={displayedKPIs}
        charts={displayedCharts}
        onAddKPI={handleAddKPI}
        onRemoveKPI={handleRemoveKPI}
        onAddChart={handleAddChart}
        onRemoveChart={handleRemoveChart}
        onLoadTemplate={handleLoadTemplate}
      />
    </div>
  );
};
