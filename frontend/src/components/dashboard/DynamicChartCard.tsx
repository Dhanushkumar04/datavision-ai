import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  ArrowUpDown,
  Filter,
  Sparkles,
  Table
} from 'lucide-react';
import { ChartSpec, ChartType, ThemeConfig } from '../../types/dashboard';
import { BarChartRenderer } from '../charts/BarChartRenderer';
import { LineChartRenderer } from '../charts/LineChartRenderer';
import { DonutChartRenderer } from '../charts/DonutChartRenderer';
import { ScatterPlotRenderer } from '../charts/ScatterPlotRenderer';
import { ChartExplanationBadge } from '../ai/ChartExplanationBadge';
import { explainChart } from '../../services/aiInsightsEngine';

interface DynamicChartCardProps {
  chart: ChartSpec;
  theme: ThemeConfig;
  onTypeChange?: (chartId: string, newType: ChartType) => void;
  onSliceClick?: (dimensionCol: string, label: string) => void;
  onDrillDown?: (chart: ChartSpec) => void;
  selectedLabel?: string | null;
}

export const DynamicChartCard: React.FC<DynamicChartCardProps> = ({
  chart,
  theme,
  onTypeChange,
  onSliceClick,
  onDrillDown,
  selectedLabel,
}) => {
  const [currentType, setCurrentType] = useState<ChartType>(chart.type);

  const explanation = useMemo(() => {
    return explainChart(chart, []);
  }, [chart]);

  const handleTypeSelect = (newType: ChartType) => {
    setCurrentType(newType);
    if (onTypeChange) {
      onTypeChange(chart.id, newType);
    }
  };

  const handleSliceClick = (label: string) => {
    if (onSliceClick) {
      onSliceClick(chart.dimensionColumn, label);
    }
  };

  const renderActiveChart = () => {
    switch (currentType) {
      case 'bar':
        return (
          <BarChartRenderer
            data={chart.data}
            palette={theme.chartPalette}
            isHorizontal={false}
            onSliceClick={handleSliceClick}
            selectedLabel={selectedLabel}
            isDark={theme.isDark}
          />
        );

      case 'horizontal_bar':
        return (
          <BarChartRenderer
            data={chart.data}
            palette={theme.chartPalette}
            isHorizontal={true}
            onSliceClick={handleSliceClick}
            selectedLabel={selectedLabel}
            isDark={theme.isDark}
          />
        );

      case 'line':
        return (
          <LineChartRenderer
            data={chart.data}
            palette={theme.chartPalette}
            isArea={false}
            onPointClick={handleSliceClick}
            selectedLabel={selectedLabel}
          />
        );

      case 'area':
        return (
          <LineChartRenderer
            data={chart.data}
            palette={theme.chartPalette}
            isArea={true}
            onPointClick={handleSliceClick}
            selectedLabel={selectedLabel}
          />
        );

      case 'donut':
        return (
          <DonutChartRenderer
            data={chart.data}
            palette={theme.chartPalette}
            onSliceClick={handleSliceClick}
            selectedLabel={selectedLabel}
            isDark={theme.isDark}
          />
        );

      case 'scatter':
        return (
          <ScatterPlotRenderer
            data={chart.data}
            palette={theme.chartPalette}
            xLabel={chart.measureColumn}
            yLabel={chart.secondaryMeasureColumn || 'Target'}
          />
        );

      default:
        return (
          <BarChartRenderer
            data={chart.data}
            palette={theme.chartPalette}
            isHorizontal={false}
            onSliceClick={handleSliceClick}
            selectedLabel={selectedLabel}
          />
        );
    }
  };

  return (
    <div 
      className={`rounded-2xl border p-5 transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${theme.cardClass} ${theme.borderClass}`}
    >
      {/* Chart Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-base font-bold tracking-tight truncate ${theme.textPrimaryClass}`} title={chart.title}>
              {chart.title}
            </h3>
            {selectedLabel && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Filter className="w-3 h-3" />
                {selectedLabel}
              </span>
            )}
          </div>
          <p className={`text-xs truncate ${theme.textSecondaryClass}`} title={chart.subtitle}>
            {chart.subtitle}
          </p>
        </div>

        {/* Chart type quick toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl flex-shrink-0 border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => handleTypeSelect('area')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              currentType === 'area' || currentType === 'line'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Area / Trend View"
          >
            <LineChart className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleTypeSelect('donut')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              currentType === 'donut'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Donut / Segment View"
          >
            <PieChart className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleTypeSelect('bar')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              currentType === 'bar'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Vertical Columns"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleTypeSelect('horizontal_bar')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              currentType === 'horizontal_bar'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Ranking Leaderboard"
          >
            <ArrowUpDown className="w-3.5 h-3.5 rotate-90" />
          </button>

          {onDrillDown && (
            <button
              onClick={() => onDrillDown(chart)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-700 transition-colors ml-0.5"
              title="Drill Down: Inspect underlying records for this chart"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dimension & Measure Tag Bar */}
      <div className="flex items-center gap-2 py-2.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[10px]">DIMENSION:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {chart.dimensionColumn}
          </span>
        </span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[10px]">MEASURE:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {chart.aggregation.toUpperCase()}({chart.measureColumn})
          </span>
        </span>
      </div>

      {/* Main Chart Body */}
      <div className="py-2 min-h-[230px] flex items-center justify-center w-full">
        {renderActiveChart()}
      </div>

      {/* Chart Footer with interactive hint */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span className="font-mono">
          Top {chart.data.length} records analyzed
        </span>
        <span className="italic text-[10px] flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-blue-400" />
          Click slice/bar to cross-filter
        </span>
      </div>

      {/* AI Chart Insight Drawer */}
      <ChartExplanationBadge explanation={explanation} />
    </div>
  );
};
