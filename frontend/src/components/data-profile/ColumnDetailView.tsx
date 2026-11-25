import React from 'react';
import { 
  BarChart2, 
  Layers, 
  Calendar, 
  Hash, 
  Edit3, 
  CheckCircle2, 
  Flame
} from 'lucide-react';
import { ColumnProfile, SemanticType, SEMANTIC_TYPE_LABELS } from '../../types/dataset';
import { formatNumber } from '../../utils/formatting';

interface ColumnDetailViewProps {
  column: ColumnProfile;
  onOverrideType: (newType: SemanticType) => void;
}

const ALL_SEMANTIC_TYPES: SemanticType[] = [
  'numerical',
  'categorical',
  'datetime',
  'boolean',
  'identifier',
  'currency',
  'percentage',
  'geographic',
  'text',
  'other',
];

export const ColumnDetailView: React.FC<ColumnDetailViewProps> = ({
  column,
  onOverrideType,
}) => {
  const completenessPct = 100 - column.nullPercentage;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
      {/* Header with Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {column.name}
            </h3>
            {column.isUserOverridden && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                User Overridden
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detected as <span className="font-semibold text-slate-700 dark:text-slate-300">{SEMANTIC_TYPE_LABELS[column.detectedType].label}</span>
          </p>
        </div>

        {/* Manual Type Override Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Semantic Role:
          </label>
          <select
            value={column.effectiveType}
            onChange={(e) => onOverrideType(e.target.value as SemanticType)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ALL_SEMANTIC_TYPES.map((t) => (
              <option key={t} value={t}>
                {SEMANTIC_TYPE_LABELS[t].icon} {SEMANTIC_TYPE_LABELS[t].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Completeness & Quality Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-slate-700 dark:text-slate-300 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" />
            Data Quality & Completeness
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {completenessPct}% Valid ({column.totalCount - column.nullCount}/{column.totalCount})
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          <div 
            className="h-full bg-emerald-500" 
            style={{ width: `${completenessPct}%` }}
            title={`${completenessPct}% Valid`}
          />
          {column.nullPercentage > 0 && (
            <div 
              className="h-full bg-amber-400" 
              style={{ width: `${column.nullPercentage}%` }}
              title={`${column.nullPercentage}% Missing`}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <span>{column.uniqueCount} distinct values ({column.uniquePercentage}% cardinality)</span>
          {column.nullCount > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {column.nullCount} missing cells ({column.nullPercentage}%)
            </span>
          )}
        </div>
      </div>

      {/* Numerical Statistics Panel */}
      {column.numericalStats && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
            <Hash className="w-4 h-4 mr-1.5 text-blue-600" />
            Numerical Distribution & Statistics
          </h4>

          {/* Core Numerical Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Min</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatNumber(column.numericalStats.min)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Max</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatNumber(column.numericalStats.max)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mean</span>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {formatNumber(column.numericalStats.mean)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Median</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatNumber(column.numericalStats.median)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Std Dev</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatNumber(column.numericalStats.stdDev)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">IQR</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatNumber(column.numericalStats.iqr)}
              </p>
            </div>
          </div>

          {/* Percentiles Bar */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 mr-2">Percentiles:</span>
            <span className="text-slate-700 dark:text-slate-300">P25: <b>{formatNumber(column.numericalStats.p25)}</b></span>
            <span className="text-slate-700 dark:text-slate-300">P50: <b>{formatNumber(column.numericalStats.p50)}</b></span>
            <span className="text-slate-700 dark:text-slate-300">P75: <b>{formatNumber(column.numericalStats.p75)}</b></span>
            <span className="text-slate-700 dark:text-slate-300">P90: <b>{formatNumber(column.numericalStats.p90)}</b></span>
            <span className="text-slate-700 dark:text-slate-300">P95: <b>{formatNumber(column.numericalStats.p95)}</b></span>
          </div>

          {/* Interactive Histogram */}
          {column.numericalStats.histogramBuckets.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center">
                  <BarChart2 className="w-4 h-4 mr-1 text-blue-600" />
                  Frequency Distribution (Histogram)
                </span>
                <span className="text-[11px] text-slate-400">
                  {column.numericalStats.histogramBuckets.length} bins
                </span>
              </div>

              {/* Responsive SVG / CSS Bins */}
              <div className="h-32 flex items-end gap-1.5 pt-4 pb-1">
                {column.numericalStats.histogramBuckets.map((bucket) => {
                  const maxCount = Math.max(...column.numericalStats!.histogramBuckets.map(b => b.count), 1);
                  const barHeightPct = Math.max(8, (bucket.count / maxCount) * 100);

                  return (
                    <div 
                      key={bucket.binIndex}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        Range: {bucket.range}<br />
                        Count: {bucket.count} ({bucket.percentage}%)
                      </div>

                      <div
                        className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-t transition-all"
                        style={{ height: `${barHeightPct}%` }}
                      />
                      <span className="text-[9px] text-slate-400 truncate w-full text-center mt-1">
                        {bucket.min}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Outlier Alert Card */}
          {column.numericalStats.outliers.count > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2.5">
              <Flame className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {column.numericalStats.outliers.count} Outliers Detected ({column.numericalStats.outliers.percentage}% of values)
                </span>
                <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                  Values outside normal Tukey range [{column.numericalStats.outliers.lowerBound}, {column.numericalStats.outliers.upperBound}].
                  Sample outlier values: {column.numericalStats.outliers.sampleOutliers.join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categorical Statistics Panel */}
      {column.categoricalStats && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
            <Layers className="w-4 h-4 mr-1.5 text-purple-600" />
            Category Frequency Distribution
          </h4>

          {/* Top Values Table */}
          <div className="space-y-2">
            {column.categoricalStats.topValues.map((item, idx) => (
              <div key={item.value} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={item.value}>
                    <span className="text-slate-400 mr-2">{idx + 1}.</span>
                    {item.value || '(Empty)'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatNumber(item.count)} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 dark:bg-purple-600 rounded-full"
                    style={{ width: `${Math.max(2, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date Statistics Panel */}
      {column.dateStats && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-emerald-600" />
            Date & Temporal Profile
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Earliest Date</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {column.dateStats.earliest}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Latest Date</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {column.dateStats.latest}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Temporal Span</span>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {column.dateStats.rangeDays} days
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold">Available Dimensions:</span>
            {column.dateStats.availableDimensions.map(dim => (
              <span key={dim} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase text-[10px] font-bold">
                {dim}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sample Records Pills */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Sample Values
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {column.sampleValues.map((val, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              {String(val)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
