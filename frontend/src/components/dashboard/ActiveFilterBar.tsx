import React from 'react';
import { Filter, X, RotateCcw, Table, Calendar, Search } from 'lucide-react';
import { ThemeConfig } from '../../types/dashboard';
import { DateFilterConfig } from '../../services/crossFilterService';

interface ActiveFilterBarProps {
  theme: ThemeConfig;
  activeFilters: Record<string, string>;
  dateFilter?: DateFilterConfig | null;
  searchQuery?: string;
  totalRows: number;
  filteredRows: number;
  onRemoveFilter: (column: string) => void;
  onClearDateFilter: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
  onOpenDrillDown: () => void;
}

export const ActiveFilterBar: React.FC<ActiveFilterBarProps> = ({
  theme,
  activeFilters,
  dateFilter,
  searchQuery,
  totalRows,
  filteredRows,
  onRemoveFilter,
  onClearDateFilter,
  onClearSearch,
  onClearAll,
  onOpenDrillDown,
}) => {
  const filterEntries = Object.entries(activeFilters).filter(([_, v]) => v && v !== 'all');
  const hasDate = dateFilter && (dateFilter.startDate || dateFilter.endDate || (dateFilter.preset && dateFilter.preset !== 'all'));
  const hasSearch = searchQuery && searchQuery.trim().length > 0;

  const totalFilterCount = filterEntries.length + (hasDate ? 1 : 0) + (hasSearch ? 1 : 0);

  if (totalFilterCount === 0) {
    return null;
  }

  const pct = totalRows > 0 ? ((filteredRows / totalRows) * 100).toFixed(1) : '100';

  return (
    <div className={`rounded-2xl border p-4 ${theme.cardClass} ${theme.borderClass} shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 animate-in fade-in`}>
      <div className="flex items-center gap-3 flex-wrap min-w-0">
        {/* Active badge */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-500/10 px-2.5 py-1 rounded-xl border border-blue-500/20">
          <Filter className="w-3.5 h-3.5" />
          <span>Active Cross-Filters ({totalFilterCount})</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterEntries.map(([col, val]) => (
            <span
              key={col}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <span className="text-slate-400 font-mono text-[10px] uppercase">{col}:</span>
              <strong className="font-semibold">{val}</strong>
              <button
                onClick={() => onRemoveFilter(col)}
                className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                title={`Remove ${col} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Date Filter Pill */}
          {hasDate && dateFilter && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-300">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px] font-mono uppercase">{dateFilter.column}:</span>
              <strong>{dateFilter.startDate || 'Start'} → {dateFilter.endDate || 'End'}</strong>
              <button
                onClick={onClearDateFilter}
                className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                title="Remove date filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Search Query Pill */}
          {hasSearch && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300">
              <Search className="w-3 h-3" />
              <span>Search: "{searchQuery}"</span>
              <button
                onClick={onClearSearch}
                className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Right controls: row count & actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Showing <strong>{filteredRows.toLocaleString()}</strong> of <strong>{totalRows.toLocaleString()}</strong> ({pct}%)
        </span>

        {/* Drill down button */}
        <button
          onClick={onOpenDrillDown}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Inspect the exact rows matching current filters"
        >
          <Table className="w-3.5 h-3.5" />
          Drill Down Rows
        </button>

        {/* Clear all */}
        <button
          onClick={onClearAll}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reset all filters to view full dataset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>
    </div>
  );
};
