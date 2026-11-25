import React from 'react';
import { Search, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { ColumnProfile, SemanticType, SEMANTIC_TYPE_LABELS } from '../../types/dataset';

interface ColumnSelectorListProps {
  columnProfiles: Record<string, ColumnProfile>;
  selectedColumn: string;
  onSelectColumn: (colName: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: SemanticType | 'all';
}

export const ColumnSelectorList: React.FC<ColumnSelectorListProps> = ({
  columnProfiles,
  selectedColumn,
  onSelectColumn,
  searchQuery,
  setSearchQuery,
  typeFilter,
}) => {
  const columns = Object.values(columnProfiles).filter(col => {
    const matchesSearch = col.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || col.effectiveType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header and Search */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>Columns ({columns.length})</span>
          <span className="text-[11px] text-slate-400 font-normal">
            Click to inspect
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search columns..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Column items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {columns.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No columns match your filter.
          </div>
        ) : (
          columns.map((col) => {
            const isSelected = selectedColumn === col.name;
            const typeConfig = SEMANTIC_TYPE_LABELS[col.effectiveType];
            const hasMissing = col.nullCount > 0;

            return (
              <div
                key={col.name}
                onClick={() => onSelectColumn(col.name)}
                className={`p-3 cursor-pointer transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 border-l-4 border-blue-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate" title={col.name}>
                      {col.name}
                    </span>
                    {col.isUserOverridden && (
                      <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                        Edited
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className={`px-1.5 py-0.2 rounded font-semibold border ${typeConfig.badge}`}>
                      {typeConfig.icon} {typeConfig.label}
                    </span>
                    <span>{col.uniqueCount} unique</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  {hasMissing ? (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center" title={`${col.nullPercentage}% missing`}>
                      <AlertCircle className="w-3 h-3 mr-0.5" />
                      {col.nullPercentage}%
                    </span>
                  ) : (
                    <span title="100% complete">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-60" />
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSelected ? 'translate-x-0.5 text-blue-600' : 'group-hover:translate-x-0.5'}`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
