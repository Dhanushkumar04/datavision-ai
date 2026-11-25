import React from 'react';
import { X, Calendar, ChevronDown, RotateCcw, SlidersHorizontal, Search } from 'lucide-react';
import { ThemeConfig } from '../../types/dashboard';
import { DateFilterConfig } from '../../services/crossFilterService';

interface SlicerPanelProps {
  theme: ThemeConfig;
  categoricalColumns: { name: string; values: string[] }[];
  dateColumns: string[];
  activeFilters: Record<string, string>;
  dateFilter?: DateFilterConfig | null;
  searchQuery?: string;
  onFilterChange: (column: string, value: string) => void;
  onDateFilterChange: (config: DateFilterConfig | null) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  totalRows: number;
  filteredRows: number;
}

export const SlicerPanel: React.FC<SlicerPanelProps> = ({
  theme,
  categoricalColumns,
  dateColumns,
  activeFilters,
  dateFilter,
  searchQuery,
  onFilterChange,
  onDateFilterChange,
  onSearchChange,
  onClearFilters,
  totalRows,
  filteredRows,
}) => {
  const activeCount = Object.keys(activeFilters).length + (dateFilter ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className={`w-full lg:w-72 flex-shrink-0 rounded-2xl border p-5 space-y-5 ${theme.cardClass} ${theme.borderClass} shadow-lg transition-all`}>
      {/* Slicer Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center font-bold">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimaryClass}`}>
              Global Slicers
            </h3>
            <p className="text-[10px] text-slate-400">
              Interactive Dimension Slicers
            </p>
          </div>
        </div>

        {activeCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset all active filters"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Row count status badge */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400 text-[11px]">MATCHING RECORDS:</span>
        <span className="font-bold text-slate-900 dark:text-white">
          {filteredRows.toLocaleString()} / {totalRows.toLocaleString()}
        </span>
      </div>

      {/* Global Keyword Search inside Slicer */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-blue-500" />
          Keyword Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search all records..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Slicers list */}
      <div className="space-y-4 pt-1">
        {/* Date slicer if dates exist */}
        {dateColumns.length > 0 && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              {dateColumns[0].replace(/_/g, ' ')} Range
            </label>

            {/* Quick Date Presets */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <button
                onClick={() => onDateFilterChange(null)}
                className={`py-1 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                  !dateFilter
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  const end = now.toISOString().split('T')[0];
                  now.setDate(now.getDate() - 30);
                  const start = now.toISOString().split('T')[0];
                  onDateFilterChange({ column: dateColumns[0], startDate: start, endDate: end, preset: 'last_30_days' });
                }}
                className={`py-1 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                  dateFilter?.preset === 'last_30_days'
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Last 30 Days
              </button>
            </div>

            {/* Start and End date manual inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-400">Start Date</span>
                <input
                  type="date"
                  value={dateFilter?.startDate || ''}
                  onChange={(e) => {
                    const start = e.target.value;
                    onDateFilterChange({
                      column: dateColumns[0],
                      startDate: start,
                      endDate: dateFilter?.endDate || '',
                    });
                  }}
                  className="w-full p-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-400">End Date</span>
                <input
                  type="date"
                  value={dateFilter?.endDate || ''}
                  onChange={(e) => {
                    const end = e.target.value;
                    onDateFilterChange({
                      column: dateColumns[0],
                      startDate: dateFilter?.startDate || '',
                      endDate: end,
                    });
                  }}
                  className="w-full p-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Categorical column slicers */}
        {categoricalColumns.slice(0, 5).map((col) => {
          const selectedVal = activeFilters[col.name] || 'all';
          const isFiltering = selectedVal !== 'all';

          return (
            <div key={col.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {col.name.replace(/_/g, ' ')}
                </label>
                {isFiltering && (
                  <button
                    onClick={() => onFilterChange(col.name, 'all')}
                    className="text-[10px] text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedVal}
                  onChange={(e) => onFilterChange(col.name, e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    isFiltering
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <option value="all">All ({col.name})</option>
                  {col.values.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active filters pill list */}
      {activeCount > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Filter Constraints:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(activeFilters).map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30"
              >
                <span>{k}: {v}</span>
                <button
                  onClick={() => onFilterChange(k, 'all')}
                  className="hover:text-rose-500 ml-0.5 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
