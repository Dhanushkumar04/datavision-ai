import React from 'react';
import { 
  Database, 
  Table2, 
  Copy, 
  AlertTriangle, 
  HardDrive, 
  Fingerprint
} from 'lucide-react';
import { DatasetOverview, SemanticType, SEMANTIC_TYPE_LABELS } from '../../types/dataset';
import { formatBytes, formatNumber } from '../../utils/formatting';

interface DatasetOverviewCardsProps {
  overview: DatasetOverview;
  activeTypeFilter?: SemanticType | 'all';
  onSelectTypeFilter?: (type: SemanticType | 'all') => void;
}

export const DatasetOverviewCards: React.FC<DatasetOverviewCardsProps> = ({
  overview,
  activeTypeFilter = 'all',
  onSelectTypeFilter,
}) => {

  return (
    <div className="space-y-4">
      {/* 6 Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <Table2 className="w-4 h-4 text-blue-600" />
            <span>Total Rows</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {formatNumber(overview.totalRows)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Columns</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {overview.totalColumns}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <Copy className={`w-4 h-4 ${overview.duplicateRows > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span>Duplicates</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {formatNumber(overview.duplicateRows)}
            <span className="text-xs font-normal text-slate-400 ml-1">
              ({overview.duplicateRowsPercentage}%)
            </span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <AlertTriangle className={`w-4 h-4 ${overview.missingCells > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span>Missing Cells</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {formatNumber(overview.missingCells)}
            <span className="text-xs font-normal text-slate-400 ml-1">
              ({overview.missingCellsPercentage}%)
            </span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <Fingerprint className="w-4 h-4 text-emerald-600" />
            <span>Unique Records</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {formatNumber(overview.uniqueRecordCount)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <HardDrive className="w-4 h-4 text-sky-600" />
            <span>Est. Memory</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {formatBytes(overview.memoryUsageBytes)}
          </p>
        </div>
      </div>

      {/* Semantic Types Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">
          Column Types:
        </span>

        {onSelectTypeFilter && (
          <button
            onClick={() => onSelectTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTypeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            All ({overview.totalColumns})
          </button>
        )}

        {(Object.keys(overview.typeCounts) as SemanticType[])
          .filter(t => overview.typeCounts[t] > 0)
          .map(t => {
            const labelInfo = SEMANTIC_TYPE_LABELS[t];
            const isSelected = activeTypeFilter === t;

            return (
              <button
                key={t}
                onClick={() => onSelectTypeFilter && onSelectTypeFilter(t)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'ring-2 ring-blue-500 ' + labelInfo.badge
                    : labelInfo.badge + ' hover:opacity-90'
                }`}
              >
                <span>{labelInfo.icon}</span>
                <span>{labelInfo.label}</span>
                <span className="opacity-70 font-mono">({overview.typeCounts[t]})</span>
              </button>
            );
          })}
      </div>
    </div>
  );
};
